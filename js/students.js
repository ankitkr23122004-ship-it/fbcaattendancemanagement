/**
 * js/students.js
 * Student management with Smart Registration ID, Base64 Photos & Actions
 */

import { db } from "./firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    doc,
    runTransaction 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Helper: Course name se standard short code nikalna
export function getCourseCode(courseFullName) {
    if (!courseFullName) return "GEN";
    const match = courseFullName.match(/\b([A-Z]{2,6})\b/);
    if (match) return match[1];
    return courseFullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || "GEN";
}

// Helper: Month-Year code nikalna (e.g. April 2026 -> 0426)
export function getMonthYearCode(dateStr) {
    const d = dateStr ? new Date(dateStr) : new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}${yy}`;
}

// 1. Transaction-based next serial getter
export async function getNextRegistrationSerial(instituteKey) {
    const counterDocRef = doc(db, "counters", `students_${instituteKey}`);
    try {
        const nextSerial = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);
            let currentNum = 449;
            if (counterDoc.exists()) {
                currentNum = counterDoc.data().lastSerial || 449;
            }
            const newSerial = currentNum + 1;
            transaction.set(counterDocRef, { lastSerial: newSerial }, { merge: true });
            return newSerial;
        });
        return nextSerial;
    } catch (err) {
        console.error("Counter transaction error, using fallback:", err);
        return 450;
    }
}

// 2. Dynamic Auto-Increment Reg No Generator
export async function generateSmartRegNo(instituteKey, courseName, admissionDate) {
    const instCode = instituteKey === "FBCA" ? "FBCA" : "TB";
    const courseCode = getCourseCode(courseName);
    const mmyy = getMonthYearCode(admissionDate);

    let nextSerial = 450;
    try {
        const snap = await getDocs(query(collection(db, "students"), where("instituteId", "==", instituteKey)));
        let maxSerial = 449;
        snap.forEach((docSnap) => {
            const reg = docSnap.data().studentId || "";
            const parts = reg.split("/");
            if (parts.length >= 4) {
                const num = parseInt(parts[2], 10);
                if (!isNaN(num) && num > maxSerial) {
                    maxSerial = num;
                }
            }
        });
        nextSerial = maxSerial + 1;
    } catch (e) {
        console.warn("Serial scan fallback:", e);
    }

    return `${instCode}/${courseCode}/${nextSerial}/${mmyy}`;
}

// 3. Student Admission create karna
export async function createStudent(studentData) {
    const docRef = await addDoc(collection(db, "students"), {
        ...studentData,
        createdAt: new Date().toISOString()
    });
    return docRef.id;
}

// 4. Student Details / Photo Update karna
export async function updateStudentDetails(studentDocId, updatedData) {
    const studentRef = doc(db, "students", studentDocId);
    await updateDoc(studentRef, {
        ...updatedData,
        updatedAt: new Date().toISOString()
    });
}

// 5. Fetch students by institute
export async function fetchStudentsByInstitute(instituteId) {
    const q = query(collection(db, "students"), where("instituteId", "==", instituteId));
    const snap = await getDocs(q);
    const students = [];
    snap.forEach(d => students.push({ id: d.id, ...d.data() }));
    return students;
}

// 6. Toggle Status
export async function toggleStudentStatus(studentDocId, currentStatus) {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const studentRef = doc(db, "students", studentDocId);
    await updateDoc(studentRef, { status: newStatus });
    return newStatus;
}

// 7. Student Table Render with Clickable Photo & Delete Button
export function renderStudentsTable(students, tableBody, countDisplay) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (countDisplay) {
        countDisplay.textContent = `${students.length} records found`;
    }

    if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No students found.</td></tr>`;
        return;
    }

    students.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                ${s.photoUrl 
                    ? `<img src="${s.photoUrl}" class="student-table-photo student-photo-clickable" data-photo="${s.photoUrl}" data-name="${s.studentName}" alt="Photo" style="cursor: pointer;">`
                    : `<div class="student-photo-placeholder">${(s.studentName || 'S').charAt(0).toUpperCase()}</div>`
                }
            </td>
            <td><strong style="color: #1e3a8a; font-family: monospace;">${s.studentId}</strong></td>
            <td><strong>${s.studentName}</strong></td>
            <td>${s.courseName}</td>
            <td>${s.batchTime}</td>
            <td>${s.joinedDate || '-'}</td>
            <td>
                <span class="status-badge ${s.status === 'Active' ? 'active' : 'inactive'}">
                    ${s.status}
                </span>
            </td>
            <td><strong style="color: ${Number(s.balance) > 0 ? '#ea580c' : '#059669'};">₹${Number(s.balance || 0).toLocaleString("en-IN")}</strong></td>
            <td>
                <div class="action-dropdown-wrapper">
                    <button type="button" class="btn-action-trigger" title="Options">⋮</button>
                    <div class="action-dropdown-menu">
                        <button type="button" class="action-dropdown-item btn-show-qr" data-id="${s.studentId}" data-name="${s.studentName}">
                            📱 View QR
                        </button>
                        <button type="button" class="action-dropdown-item btn-collect-fee" data-id="${s.studentId}">
                            💳 Collect Fee
                        </button>
                        <button type="button" class="action-dropdown-item btn-edit-student" data-docid="${s.id}">
                            ✏️ Edit Details
                        </button>
                        <button type="button" class="action-dropdown-item action-toggle-status" data-docid="${s.id}" data-status="${s.status}">
                            🔄 Toggle Status
                        </button>
                        <button type="button" class="action-dropdown-item item-delete btn-delete-student" data-docid="${s.id}" data-name="${s.studentName}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}
// 8. Delete Student Record by Document ID
export async function deleteStudentRecord(docId) {
    if (!docId) return false;
    const studentRef = doc(db, "students", docId);
    await deleteDoc(studentRef);
    return true;
}

// 9. CSV Export
export function exportStudentsToCSV(instituteName, studentsList = []) {
    if (!studentsList.length) {
        alert("No students to export.");
        return;
    }

    const headers = ["Registration No", "Name", "Phone", "Guardian", "Course", "Batch", "Joining Date", "Balance", "Status"];
    const rows = studentsList.map(s => [
        `"${s.studentId}"`,
        `"${s.studentName}"`,
        `"${s.phone || ''}"`,
        `"${s.guardianName || ''}"`,
        `"${s.courseName || ''}"`,
        `"${s.batchTime || ''}"`,
        `"${s.joinedDate || ''}"`,
        `"${s.balance || 0}"`,
        `"${s.status || 'Active'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${instituteName.replace(/\s+/g, '_')}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
