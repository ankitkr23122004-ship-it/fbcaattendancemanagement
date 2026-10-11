/**
 * js/attendance.js
 * Comprehensive Attendance Engine with Analytics, Holidays & QR Camera Scanner
 */

// js/attendance.js
import { db } from "./firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc,
    setDoc,
    getDoc,
    updateDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let html5QrScannerInstance = null;

// 1. Mark Attendance Record
// Helper: Beep sound for success / warning
function playBeep(type = "success") {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "success") {
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch (A5)
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else {
            // Error / Warning double tone
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) {
        // Audio context fallback
    }
}

export async function markAttendanceRecord({
    instituteId,
    instituteName,
    branch,
    batchTime,
    sessionDate,
    studentId
}) {
    // 1. Student Fetch Karein
    const studentsRef = collection(db, "students");
    const qStudent = query(
        studentsRef, 
        where("studentId", "==", studentId), 
        where("instituteId", "==", instituteId)
    );
    const studentSnap = await getDocs(qStudent);

    if (studentSnap.empty) {
        playBeep("error");
        return { success: false, message: `Student ID "${studentId}" not found in this branch.` };
    }

    const studentDoc = studentSnap.docs[0];
    const studentData = studentDoc.data();

    // Inactive student check
    if (studentData.status === "Inactive") {
        playBeep("error");
        return { success: false, message: `Student "${studentData.studentName}" is deactivated.` };
    }

    // 2. STRICT DUPLICATE CHECK (Ek hi baar lagna chahiye)
    // Document ID format: ATT_{instituteId}_{sessionDate}_{studentId}
    const safeStudentId = studentId.replace(/[\/\s]/g, "_");
    const attDocId = `ATT_${instituteId}_${sessionDate}_${safeStudentId}`;
    const attDocRef = doc(db, "attendance", attDocId);
    const existingSnap = await getDoc(attDocRef);

    if (existingSnap.exists()) {
        playBeep("error");
        const existingData = existingSnap.data();
        return { 
            success: false, 
            message: `⚠️ Already Marked! "${studentData.studentName}" attendance was already marked at ${existingData.markedAt}.` 
        };
    }

    // 3. FEE DUE DATE CHECK
    const today = new Date().toISOString().split("T")[0];
    const balance = Number(studentData.balance) || 0;
    const feeDueDate = studentData.feeDueDate || "";
    let feeWarning = null;

    if (balance > 0 && feeDueDate && today > feeDueDate) {
        feeWarning = `⚠️ FEE OVERDUE: ₹${balance.toLocaleString("en-IN")} pending (Due date was: ${feeDueDate}). Collect immediately!`;
    } else if (balance > 0) {
        feeWarning = `ℹ️ Fee Notice: Outstanding due balance of ₹${balance.toLocaleString("en-IN")}.`;
    }

    // 4. Record Attendance
    const now = new Date();
    const markedAt = now.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const attendanceRecord = {
        instituteId,
        instituteName,
        branch,
        studentId: studentData.studentId,
        studentName: studentData.studentName,
        courseName: studentData.courseName,
        batchTime: batchTime === "ALL" ? studentData.batchTime : batchTime,
        sessionDate,
        markedAt,
        punctuality: "On-Time",
        status: "Present",
        photoUrl: studentData.photoUrl || "",
        timestamp: now.toISOString()
    };

    await setDoc(attDocRef, attendanceRecord);
    playBeep(feeWarning && feeWarning.includes("OVERDUE") ? "error" : "success");

    return {
        success: true,
        studentId: studentData.studentId,
        studentName: studentData.studentName,
        markedAt: markedAt,
        feeWarning: feeWarning,
        message: `✓ Attendance marked for ${studentData.studentName}`
    };
}
// 2. Fetch Session Attendance Records
export async function fetchSessionAttendance(instituteId, batchTime, sessionDate) {
    if (!sessionDate) return [];

    let q;
    if (batchTime && batchTime !== "ALL") {
        q = query(
            collection(db, "attendance"),
            where("instituteId", "==", instituteId),
            where("sessionDate", "==", sessionDate),
            where("batchTime", "==", batchTime)
        );
    } else {
        q = query(
            collection(db, "attendance"),
            where("instituteId", "==", instituteId),
            where("sessionDate", "==", sessionDate)
        );
    }

    const snap = await getDocs(q);
    const records = [];
    snap.forEach((docSnap) => records.push({ id: docSnap.id, ...docSnap.data() }));

    return records.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
}

// 3. Holiday / Session Status Operations
export async function getSessionStatus(instituteId, sessionDate) {
    const q = query(
        collection(db, "sessions_status"),
        where("instituteId", "==", instituteId),
        where("sessionDate", "==", sessionDate)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function setInstituteHoliday(instituteId, sessionDate, isHoliday, reason = "Holiday / Class Suspended") {
    const existing = await getSessionStatus(instituteId, sessionDate);
    if (existing) {
        await updateDoc(doc(db, "sessions_status", existing.id), {
            isHoliday: isHoliday,
            holidayReason: reason,
            updatedAt: new Date().toISOString()
        });
    } else {
        await addDoc(collection(db, "sessions_status"), {
            instituteId,
            sessionDate,
            isHoliday,
            holidayReason: reason,
            cancelledBatches: [],
            createdAt: new Date().toISOString()
        });
    }
}

export async function toggleBatchCancellation(instituteId, sessionDate, batchTime) {
    const existing = await getSessionStatus(instituteId, sessionDate);
    if (existing) {
        let list = existing.cancelledBatches || [];
        if (list.includes(batchTime)) {
            list = list.filter(b => b !== batchTime);
        } else {
            list.push(batchTime);
        }
        await updateDoc(doc(db, "sessions_status", existing.id), {
            cancelledBatches: list
        });
        return list.includes(batchTime);
    } else {
        await addDoc(collection(db, "sessions_status"), {
            instituteId,
            sessionDate,
            isHoliday: false,
            cancelledBatches: [batchTime],
            createdAt: new Date().toISOString()
        });
        return true;
    }
}

// 4. Aggregate Attendance Analytics (KPIs & Batch Turnout)
export async function calculateAttendanceAnalytics(instituteId, sessionDate, allActiveStudents = [], configuredBatches = []) {
    const sessionStatus = await getSessionStatus(instituteId, sessionDate);
    const isHoliday = sessionStatus?.isHoliday === true;
    const cancelledBatches = sessionStatus?.cancelledBatches || [];

    if (isHoliday) {
        return {
            isHoliday: true,
            holidayReason: sessionStatus?.holidayReason || "Official Holiday / Off Day",
            totalEnrolled: 0,
            totalPresent: 0,
            totalAbsent: 0,
            turnoutRate: 100,
            batchBreakdown: configuredBatches.map(b => ({
                batchTime: b.batchTime,
                enrolled: 0,
                present: 0,
                percentage: 0,
                isCancelled: true
            })),
            presentRecords: []
        };
    }

    const sessionPresentRecords = await fetchSessionAttendance(instituteId, "ALL", sessionDate);

    const eligibleStudents = allActiveStudents.filter(s => 
        s.status === "Active" && !cancelledBatches.includes(s.batchTime)
    );

    const totalEnrolled = eligibleStudents.length;
    const totalPresent = sessionPresentRecords.length;
    const totalAbsent = Math.max(0, totalEnrolled - totalPresent);
    const turnoutRate = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

    const batchBreakdown = configuredBatches.map(b => {
        const batchName = b.batchTime;
        const isBatchCancelled = cancelledBatches.includes(batchName);

        const batchEnrolled = allActiveStudents.filter(s => s.batchTime === batchName && s.status === "Active").length;
        const batchPresent = sessionPresentRecords.filter(r => r.batchTime === batchName).length;
        const percentage = batchEnrolled > 0 ? Math.round((batchPresent / batchEnrolled) * 100) : 0;

        return {
            batchTime: batchName,
            enrolled: batchEnrolled,
            present: batchPresent,
            percentage: isBatchCancelled ? 0 : Math.min(percentage, 100),
            isCancelled: isBatchCancelled
        };
    });

    return {
        isHoliday: false,
        totalEnrolled,
        totalPresent,
        totalAbsent,
        turnoutRate,
        batchBreakdown,
        presentRecords: sessionPresentRecords
    };
}

// 5. Fetch 7-Day Trend for Chart.js
export async function fetchWeeklyAttendanceTrend(instituteId, currentDateStr) {
    const dates = [];
    const baseDate = currentDateStr ? new Date(currentDateStr) : new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }

    const counts = [];
    for (const date of dates) {
        const q = query(
            collection(db, "attendance"),
            where("instituteId", "==", instituteId),
            where("sessionDate", "==", date)
        );
        const snap = await getDocs(q);
        counts.push(snap.size);
    }

    const labels = dates.map(dStr => {
        const d = new Date(dStr);
        return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    });

    return { labels, data: counts };
}

// 6. Live QR Camera Scanner Controls
export function startQrScanner(containerId, onScanSuccess, onScanError) {
    if (html5QrScannerInstance) {
        try { html5QrScannerInstance.stop(); } catch (e) {}
    }

    const html5QrCode = new Html5Qrcode(containerId);
    html5QrScannerInstance = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            if (onScanSuccess) onScanSuccess(decodedText);
        },
        () => {
            // Scanning in progress (silent)
        }
    ).catch(err => {
        console.error("Camera start failed:", err);
        if (onScanError) onScanError("Unable to access camera lens. Check browser permissions.");
    });
}

export function stopQrScanner() {
    if (html5QrScannerInstance) {
        html5QrScannerInstance.stop().then(() => {
            html5QrScannerInstance.clear();
            html5QrScannerInstance = null;
        }).catch((err) => {
            console.warn("Camera stop error:", err);
            html5QrScannerInstance = null;
        });
    }
}
