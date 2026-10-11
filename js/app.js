
import { 
    createPortalUser, 
    fetchAllUsers, 
    toggleUserStatus 
} from "./users.js";
import { monitorAuthState, logoutUser } from "./auth.js";
import { 
    generateSmartRegNo, 
    createStudent, 
    updateStudentDetails,
    fetchStudentsByInstitute, 
    renderStudentsTable, 
    toggleStudentStatus,
    deleteStudentRecord,
    exportStudentsToCSV 
} from "./students.js";
import { 
    markAttendanceRecord, 
    fetchSessionAttendance, 
    calculateAttendanceAnalytics,
    fetchWeeklyAttendanceTrend,
    startQrScanner, 
    stopQrScanner,
    setInstituteHoliday,
    toggleBatchCancellation
} from "./attendance.js";
import { 
    recordFeePayment, 
    fetchInstituteFeeTransactions,
    deleteFeeTransaction,
    updateFeeTransaction
} from "./fees.js";
import { 
    addCourse, 
    fetchCourses, 
    deleteCourse, 
    addBatch, 
    fetchBatches, 
    deleteBatch 
} from "./courses.js";

// DOM References
const instituteSelect = document.getElementById("instituteSelect");
const branchBadge = document.getElementById("branchBadge");
const activeInstituteHeading = document.getElementById("activeInstituteHeading");
const userNameDisplay = document.getElementById("userNameDisplay");
const userRoleDisplay = document.getElementById("userRoleDisplay");
const userAvatar = document.getElementById("userAvatar");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toastNotification");

// Sidebar Brand Elements
const sidebarLogoImg = document.getElementById("sidebarLogoImg");
const sidebarInstituteName = document.getElementById("sidebarInstituteName");
const sidebarInstituteBranch = document.getElementById("sidebarInstituteBranch");

// Navigation Elements
const navDashboard = document.getElementById("navDashboard");
const navAttendance = document.getElementById("navAttendance");
const navFees = document.getElementById("navFees");
const navCourses = document.getElementById("navCourses");
const navUsers = document.getElementById("navUsers");
const quickAttendanceNavBtn = document.getElementById("quickAttendanceNavBtn");

const dashboardSection = document.getElementById("dashboardSection");
const attendanceSection = document.getElementById("attendanceSection");
const feesSection = document.getElementById("feesSection");
const coursesSection = document.getElementById("coursesSection");
const usersSection = document.getElementById("usersSection");

// Team & Users Elements
const usersTableBody = document.getElementById("usersTableBody");
const userRoleFilter = document.getElementById("userRoleFilter");
const openAddUserModalBtn = document.getElementById("openAddUserModalBtn");
const addUserModal = document.getElementById("addUserModal");
const closeAddUserBtn = document.getElementById("closeAddUserBtn");
const cancelAddUserBtn = document.getElementById("cancelAddUserBtn");
const addUserForm = document.getElementById("addUserForm");
const saveUserBtn = document.getElementById("saveUserBtn");

// Courses & Batches Elements
const coursesTableBody = document.getElementById("coursesTableBody");
const batchesTableBody = document.getElementById("batchesTableBody");
const openAddCourseModalBtn = document.getElementById("openAddCourseModalBtn");
const openAddBatchModalBtn = document.getElementById("openAddBatchModalBtn");
const addCourseModal = document.getElementById("addCourseModal");
const addBatchModal = document.getElementById("addBatchModal");
const closeAddCourseBtn = document.getElementById("closeAddCourseBtn");
const cancelAddCourseBtn = document.getElementById("cancelAddCourseBtn");
const closeAddBatchBtn = document.getElementById("closeAddBatchBtn");
const cancelAddBatchBtn = document.getElementById("cancelAddBatchBtn");
const addCourseForm = document.getElementById("addCourseForm");
const addBatchForm = document.getElementById("addBatchForm");
const saveCourseBtn = document.getElementById("saveCourseBtn");
const saveBatchBtn = document.getElementById("saveBatchBtn");

// Admission Form Elements
const courseSelect = document.getElementById("courseSelect");
const batchSelect = document.getElementById("batchSelect");
const feeBalanceInput = document.getElementById("feeBalanceInput");
const manualRegNoInput = document.getElementById("manualRegNoInput");
const studentPhotoInput = document.getElementById("studentPhotoInput");

// Stats Elements
const statTotalStudents = document.getElementById("statTotalStudents");
const statActiveStudents = document.getElementById("statActiveStudents");
const statActiveBatches = document.getElementById("statActiveBatches");
const statPendingFees = document.getElementById("statPendingFees");

// Student Table & Search
const studentTableBody = document.getElementById("studentTableBody");
const tableRecordCount = document.getElementById("tableRecordCount");
const studentSearchInput = document.getElementById("studentSearchInput");
const exportCsvBtn = document.getElementById("exportCsvBtn");

// Admission Modal Elements
const admissionModal = document.getElementById("admissionModal");
const openAddStudentModalBtn = document.getElementById("openAddStudentModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const admissionForm = document.getElementById("admissionForm");
const modalInstituteName = document.getElementById("modalInstituteName");
const joinDateInput = document.getElementById("joinDateInput");
const saveStudentBtn = document.getElementById("saveStudentBtn");

// Edit Student Modal Elements
const editStudentModal = document.getElementById("editStudentModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");
const editStudentForm = document.getElementById("editStudentForm");
const editStudentDocId = document.getElementById("editStudentDocId");
const editRegNoDisplay = document.getElementById("editRegNoDisplay");
const editStudentName = document.getElementById("editStudentName");
const editStudentPhone = document.getElementById("editStudentPhone");
const editCourseSelect = document.getElementById("editCourseSelect");
const editBatchSelect = document.getElementById("editBatchSelect");
const editGuardianName = document.getElementById("editGuardianName");
const editStatusSelect = document.getElementById("editStatusSelect");
const editPhotoPreview = document.getElementById("editPhotoPreview");
const editPhotoInput = document.getElementById("editPhotoInput");
const saveEditStudentBtn = document.getElementById("saveEditStudentBtn");

// Simple QR Modal Elements
const simpleQrModal = document.getElementById("simpleQrModal");
const closeSimpleQrBtn = document.getElementById("closeSimpleQrBtn");
const dismissSimpleQrBtn = document.getElementById("dismissSimpleQrBtn");
const printSimpleQrBtn = document.getElementById("printSimpleQrBtn");
const downloadQrBtn = document.getElementById("downloadQrBtn");
const simpleQrName = document.getElementById("simpleQrName");
const simpleQrId = document.getElementById("simpleQrId");
const simpleQrContainer = document.getElementById("simpleQrContainer");

// Attendance Scanner Elements
const attSessionBatchSelect = document.getElementById("attSessionBatchSelect");
const attSessionDateInput = document.getElementById("attSessionDateInput");
const manualStudentIdInput = document.getElementById("manualStudentIdInput");
const manualMarkBtn = document.getElementById("manualMarkBtn");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const attSessionCountBadge = document.getElementById("attSessionCountBadge");
const scannerModal = document.getElementById("scannerModal");
const openScannerModalBtn = document.getElementById("openScannerModalBtn");
const closeScannerModalBtn = document.getElementById("closeScannerModalBtn");
const stopScannerModalBtn = document.getElementById("stopScannerModalBtn");
const scannerFeedback = document.getElementById("scannerFeedback");

// Fee Collection Modal Elements
const collectFeeModal = document.getElementById("collectFeeModal");
const closeCollectFeeBtn = document.getElementById("closeCollectFeeBtn");
const cancelCollectFeeBtn = document.getElementById("cancelCollectFeeBtn");
const collectFeeForm = document.getElementById("collectFeeForm");
const feeStudentDetailDisplay = document.getElementById("feeStudentDetailDisplay");
const feeCurrentDueDisplay = document.getElementById("feeCurrentDueDisplay");
const feeAmountInput = document.getElementById("feeAmountInput");
const feePaymentModeSelect = document.getElementById("feePaymentModeSelect");
const feeRemarksInput = document.getElementById("feeRemarksInput");
const submitFeeBtn = document.getElementById("submitFeeBtn");
const feeTransactionsTableBody = document.getElementById("feeTransactionsTableBody");

// Edit Fee Modal Elements
const editFeeModal = document.getElementById("editFeeModal");
const editFeeForm = document.getElementById("editFeeForm");
const closeEditFeeBtn = document.getElementById("closeEditFeeBtn");
const cancelEditFeeBtn = document.getElementById("cancelEditFeeBtn");

// Receipt Modal Elements
const receiptModal = document.getElementById("receiptModal");
const closeReceiptBtn = document.getElementById("closeReceiptBtn");
const dismissReceiptBtn = document.getElementById("dismissReceiptBtn");
const printReceiptBtn = document.getElementById("printReceiptBtn");
const receiptInstituteName = document.getElementById("receiptInstituteName");
const receiptBranchName = document.getElementById("receiptBranchName");
const receiptNumberVal = document.getElementById("receiptNumberVal");
const receiptDateVal = document.getElementById("receiptDateVal");
const receiptStudentIdVal = document.getElementById("receiptStudentIdVal");
const receiptStudentNameVal = document.getElementById("receiptStudentNameVal");
const receiptCourseVal = document.getElementById("receiptCourseVal");
const receiptPaidVal = document.getElementById("receiptPaidVal");
const receiptModeVal = document.getElementById("receiptModeVal");
const receiptBalanceVal = document.getElementById("receiptBalanceVal");
const receiptRecordedByVal = document.getElementById("receiptRecordedByVal");

// Attendance Analytics DOM Elements
let attendanceTrendChartInstance = null;
const kpiAttPresent = document.getElementById("kpiAttPresent");
const kpiAttPercentage = document.getElementById("kpiAttPercentage");
const kpiAttAbsent = document.getElementById("kpiAttAbsent");
const kpiAttBatches = document.getElementById("kpiAttBatches");
const batchProgressContainer = document.getElementById("batchProgressContainer");
const exportDailyAttendanceCsvBtn = document.getElementById("exportDailyAttendanceCsvBtn");

// State Variables
let currentUserProfile = null;
let currentStudents = [];
let allFetchedUsers = [];
let availableCoursesList = [];
let activeViewingStudent = null;
let activeStudentForFee = null;

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

// 1. Institute Meta with local images
const INSTITUTES_META = {
    TB_EDU: {
        fullName: "TECHNOBRIGHT EDUCATION",
        displayName: "Technobright",
        branch: "Punpun, Patna",
        logo: "tepl.png"
    },
    FBCA: {
        fullName: "FUTURE BOOST COMPUTER ACADEMY (FBCA)",
        displayName: "Future Boost FBCA",
        branch: "Kurthaul, Patna",
        logo: "fbca.png"
    }
};

// 2. Sidebar Dynamic Brand Updater
function updateSidebarBranding() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const meta = INSTITUTES_META[activeKey] || INSTITUTES_META.TB_EDU;

    if (sidebarLogoImg) {
        sidebarLogoImg.src = meta.logo;
        sidebarLogoImg.alt = meta.displayName;
    }
    if (sidebarInstituteName) {
        sidebarInstituteName.textContent = meta.displayName;
        sidebarInstituteName.title = meta.fullName;
    }
    if (sidebarInstituteBranch) {
        sidebarInstituteBranch.textContent = meta.branch;
    }
}

// Smart Auto-Compressor
function compressAndConvertToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve("");
        if (!file.type.startsWith("image/")) {
            return reject(new Error("Please upload a valid image file (JPG, PNG, WebP)."));
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 320;
                const MAX_HEIGHT = 320;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.70);
                resolve(compressedDataUrl);
            };
            img.onerror = () => reject(new Error("Failed to process image file."));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Unable to read file."));
        reader.readAsDataURL(file);
    });
}

// Navigation Switcher
function switchView(target) {
    if ((target === "users" || target === "courses") && currentUserProfile?.role !== "super_admin") {
        showToast("Access Denied: Only Super Admin can access configuration panels.");
        target = "dashboard";
    }

    dashboardSection?.classList.remove("active");
    attendanceSection?.classList.remove("active");
    feesSection?.classList.remove("active");
    coursesSection?.classList.remove("active");
    usersSection?.classList.remove("active");

    navDashboard?.classList.remove("active");
    navAttendance?.classList.remove("active");
    navFees?.classList.remove("active");
    navCourses?.classList.remove("active");
    navUsers?.classList.remove("active");

    if (target === "attendance") {
        attendanceSection?.classList.add("active");
        navAttendance?.classList.add("active");
        loadSessionAttendanceTable();
    } else if (target === "fees") {
        feesSection?.classList.add("active");
        navFees?.classList.add("active");
        loadFeeTransactionsTable();
    } else if (target === "courses") {
        coursesSection?.classList.add("active");
        navCourses?.classList.add("active");
        loadCoursesAndBatchesTables();
    } else if (target === "users") {
        usersSection?.classList.add("active");
        navUsers?.classList.add("active");
        loadUsersTable();
    } else {
        dashboardSection?.classList.add("active");
        navDashboard?.classList.add("active");
    }
}

navDashboard?.addEventListener("click", (e) => { e.preventDefault(); switchView("dashboard"); });
navAttendance?.addEventListener("click", (e) => { e.preventDefault(); switchView("attendance"); });
navFees?.addEventListener("click", (e) => { e.preventDefault(); switchView("fees"); });
navCourses?.addEventListener("click", (e) => { e.preventDefault(); switchView("courses"); });
navUsers?.addEventListener("click", (e) => { e.preventDefault(); switchView("users"); });
quickAttendanceNavBtn?.addEventListener("click", () => switchView("attendance"));

// Load Live Students & Update Institute
async function loadInstituteData() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    
    // Branding refresh
    updateSidebarBranding();

    if (activeInstituteHeading) activeInstituteHeading.textContent = INSTITUTES_META[activeKey]?.fullName || "";
    if (branchBadge) branchBadge.textContent = INSTITUTES_META[activeKey]?.branch || "";

    try {
        currentStudents = await fetchStudentsByInstitute(activeKey);
        renderStudentsTable(currentStudents, studentTableBody, tableRecordCount);

        const total = currentStudents.length;
        const activeCount = currentStudents.filter(s => s.status === "Active").length;
        const uniqueBatches = new Set(currentStudents.map(s => s.batchTime)).size;
        const totalDues = currentStudents.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);

        if (statTotalStudents) statTotalStudents.textContent = total;
        if (statActiveStudents) statActiveStudents.textContent = activeCount;
        if (statActiveBatches) statActiveBatches.textContent = uniqueBatches;
        if (statPendingFees) statPendingFees.textContent = `₹${totalDues.toLocaleString("en-IN")}`;

    } catch (err) {
        console.error("Error loading students:", err);
        showToast("Error loading data from Firestore.");
    }
}

// Search Filter
studentSearchInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = currentStudents.filter(s => 
        (s.studentName && s.studentName.toLowerCase().includes(query)) ||
        (s.studentId && s.studentId.toLowerCase().includes(query)) ||
        (s.courseName && s.courseName.toLowerCase().includes(query))
    );
    renderStudentsTable(filtered, studentTableBody, tableRecordCount);
});

// Simple QR Modal
function triggerStudentQR(studentId, studentName) {
    activeViewingStudent = { studentId, studentName };
    if (simpleQrName) simpleQrName.textContent = studentName;
    if (simpleQrId) simpleQrId.textContent = studentId;

    const hostOrigin = window.location.origin;
    const verificationUrl = `${hostOrigin}/verify.html?id=${encodeURIComponent(studentId)}`;

    if (simpleQrContainer) {
        simpleQrContainer.innerHTML = "";
        const img = document.createElement("img");
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
        img.alt = "Student QR";
        img.style.width = "200px";
        img.style.height = "200px";
        img.style.display = "block";
        simpleQrContainer.appendChild(img);
    }

    simpleQrModal?.classList.add("active");
}

function hideSimpleQrModal() {
    simpleQrModal?.classList.remove("active");
    activeViewingStudent = null;
}

closeSimpleQrBtn?.addEventListener("click", hideSimpleQrModal);
dismissSimpleQrBtn?.addEventListener("click", hideSimpleQrModal);
printSimpleQrBtn?.addEventListener("click", () => window.print());

downloadQrBtn?.addEventListener("click", () => {
    if (!activeViewingStudent || !simpleQrContainer) return;
    const qrImg = simpleQrContainer.querySelector("img");

    if (qrImg && qrImg.src) {
        const link = document.createElement("a");
        link.href = qrImg.src;
        link.download = `${activeViewingStudent.studentId.replace(/\//g, '_')}_QR.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("QR Code download started!");
    }
});

// Fee Collection Handlers
function openCollectFeeModal(student) {
    activeStudentForFee = student;
    if (feeStudentDetailDisplay) feeStudentDetailDisplay.value = `${student.studentName} (${student.studentId}) - ${student.courseName}`;
    if (feeCurrentDueDisplay) feeCurrentDueDisplay.value = `₹${student.balance || 0}`;
    if (feeAmountInput) {
        feeAmountInput.value = "";
        feeAmountInput.max = student.balance || 0;
    }
    collectFeeModal?.classList.add("active");
}

function hideCollectFeeModal() {
    collectFeeModal?.classList.remove("active");
    collectFeeForm?.reset();
    activeStudentForFee = null;
}

closeCollectFeeBtn?.addEventListener("click", hideCollectFeeModal);
cancelCollectFeeBtn?.addEventListener("click", hideCollectFeeModal);

collectFeeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeStudentForFee) return;

    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const amount = Number(feeAmountInput?.value) || 0;
    const mode = feePaymentModeSelect?.value || "Cash";
    const remarks = feeRemarksInput?.value.trim() || "Course Fee Installment";

    if (submitFeeBtn) {
        submitFeeBtn.disabled = true;
        submitFeeBtn.textContent = "Processing...";
    }

    try {
        const receiptData = await recordFeePayment({
            instituteId: activeKey,
            instituteName: INSTITUTES_META[activeKey]?.fullName || "",
            branch: INSTITUTES_META[activeKey]?.branch || "",
            studentId: activeStudentForFee.studentId,
            studentName: activeStudentForFee.studentName,
            courseName: activeStudentForFee.courseName,
            amountPaid: amount,
            paymentMode: mode,
            remarks: remarks,
            recordedBy: currentUserProfile?.displayName || currentUserProfile?.email || "Admin"
        });

        showToast("Payment recorded successfully!");
        hideCollectFeeModal();
        await loadInstituteData();
        displayReceiptModal(receiptData);

    } catch (err) {
        console.error("Fee payment error:", err);
        showToast(err.message || "Failed to record payment.");
    } finally {
        if (submitFeeBtn) {
            submitFeeBtn.disabled = false;
            submitFeeBtn.textContent = "Record & Generate Receipt";
        }
    }
});

function displayReceiptModal(data) {
    if (receiptInstituteName) receiptInstituteName.textContent = data.instituteName;
    if (receiptBranchName) receiptBranchName.textContent = data.branch;
    if (receiptNumberVal) receiptNumberVal.textContent = data.receiptNo;
    if (receiptDateVal) receiptDateVal.textContent = `${data.paymentDate} (${data.paymentTime})`;
    if (receiptStudentIdVal) receiptStudentIdVal.textContent = data.studentId;
    if (receiptStudentNameVal) receiptStudentNameVal.textContent = data.studentName;
    if (receiptCourseVal) receiptCourseVal.textContent = data.courseName;
    if (receiptPaidVal) receiptPaidVal.textContent = `₹${data.amountPaid.toLocaleString("en-IN")}`;
    if (receiptModeVal) receiptModeVal.textContent = data.paymentMode;
    if (receiptBalanceVal) receiptBalanceVal.textContent = `₹${data.remainingBalance.toLocaleString("en-IN")}`;
    if (receiptRecordedByVal) receiptRecordedByVal.textContent = data.recordedBy;

    receiptModal?.classList.add("active");
}

function hideReceiptModal() {
    receiptModal?.classList.remove("active");
}

closeReceiptBtn?.addEventListener("click", hideReceiptModal);
dismissReceiptBtn?.addEventListener("click", hideReceiptModal);
printReceiptBtn?.addEventListener("click", () => window.print());

// Load Fee History Log
async function loadFeeTransactionsTable() {
    if (!feeTransactionsTableBody) return;
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";

    try {
        const transactions = await fetchInstituteFeeTransactions(activeKey);
        feeTransactionsTableBody.innerHTML = "";

        if (transactions.length === 0) {
            feeTransactionsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px;">
                        No fee transactions recorded for this institute yet.
                    </td>
                </tr>
            `;
            return;
        }

        const isSuperAdmin = currentUserProfile?.role === "super_admin";

        transactions.forEach(t => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="id-badge">${t.receiptNo}</span></td>
                <td><strong style="color: #1e3a8a;">${t.studentId}</strong></td>
                <td><strong>${t.studentName}</strong></td>
                <td><strong style="color: #059669;">₹${t.amountPaid.toLocaleString("en-IN")}</strong></td>
                <td>${t.paymentMode}</td>
                <td>${t.paymentDate}</td>
                <td>${t.recordedBy}</td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-outline btn-sm btn-edit-fee" 
                            data-id="${t.id}" 
                            data-receipt="${t.receiptNo}"
                            data-student="${t.studentName}"
                            data-studentid="${t.studentId}"
                            data-amount="${t.amountPaid}"
                            data-mode="${t.paymentMode}">
                            ✏️ Edit
                        </button>
                        ${isSuperAdmin ? `
                        <button class="btn btn-outline btn-sm btn-delete-fee" 
                            data-id="${t.id}" 
                            data-receipt="${t.receiptNo}"
                            data-student="${t.studentName}"
                            data-studentid="${t.studentId}"
                            data-amount="${t.amountPaid}"
                            style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                            🗑️ Delete
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
            feeTransactionsTableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Fee history load error:", err);
    }
}

// Fee Transactions Table Action (Edit & Delete)
feeTransactionsTableBody?.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".btn-edit-fee");
    if (editBtn) {
        document.getElementById("editFeeDocId").value = editBtn.dataset.id;
        document.getElementById("editFeeStudentId").value = editBtn.dataset.studentid;
        document.getElementById("editFeeOldAmount").value = editBtn.dataset.amount;
        document.getElementById("editFeeInfoDisplay").value = `${editBtn.dataset.receipt} - ${editBtn.dataset.student}`;
        document.getElementById("editFeeAmountInput").value = editBtn.dataset.amount;
        document.getElementById("editFeeModeSelect").value = editBtn.dataset.mode;
        editFeeModal?.classList.add("active");
        return;
    }

    const delBtn = e.target.closest(".btn-delete-fee");
    if (delBtn) {
        if (currentUserProfile?.role !== "super_admin") {
            showToast("⛔ Access Denied: Only Super Admin can delete fee records.");
            return;
        }

        const feeId = delBtn.dataset.id;
        const receiptNo = delBtn.dataset.receipt;
        const studentName = delBtn.dataset.student;
        const amount = delBtn.dataset.amount;
        const studentId = delBtn.dataset.studentid;
        const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";

        const ok = confirm(`Are you sure you want to delete receipt ${receiptNo} for ${studentName} (₹${amount})?\n\nThis will restore ₹${amount} back to the student's due balance.`);
        if (ok) {
            delBtn.disabled = true;
            delBtn.textContent = "...";
            try {
                await deleteFeeTransaction(feeId, {
                    amountPaid: amount,
                    studentId: studentId,
                    instituteId: activeKey
                });
                showToast(`✓ Fee receipt ${receiptNo} deleted.`);
                await loadFeeTransactionsTable();
                await loadInstituteData();
            } catch (err) {
                console.error("Delete fee error:", err);
                showToast("Failed to delete transaction.");
                delBtn.disabled = false;
                delBtn.textContent = "🗑️ Delete";
            }
        }
    }
});

closeEditFeeBtn?.addEventListener("click", () => editFeeModal?.classList.remove("active"));
cancelEditFeeBtn?.addEventListener("click", () => editFeeModal?.classList.remove("active"));

editFeeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = document.getElementById("editFeeDocId").value;
    const studentId = document.getElementById("editFeeStudentId").value;
    const oldAmount = document.getElementById("editFeeOldAmount").value;
    const newAmount = document.getElementById("editFeeAmountInput").value;
    const mode = document.getElementById("editFeeModeSelect").value;
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";

    try {
        await updateFeeTransaction(docId, {
            newAmount,
            paymentMode: mode,
            oldAmount,
            studentId,
            instituteId: activeKey
        });
        showToast("Payment transaction updated!");
        editFeeModal?.classList.remove("active");
        await loadFeeTransactionsTable();
        await loadInstituteData();
    } catch (err) {
        showToast("Error updating fee: " + err.message);
    }
});

// Auto-Refresh Smart Registration Number
async function autoRefreshSmartRegNo() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const selectedCourse = courseSelect ? courseSelect.value : "";
    const selectedDate = joinDateInput ? joinDateInput.value : "";

    if (manualRegNoInput) {
        const generated = await generateSmartRegNo(activeKey, selectedCourse, selectedDate);
        manualRegNoInput.value = generated;
    }
}

// ==========================================
// Student Table Action Dropdown & Actions
// ==========================================

// 1. Toggle & Close Dropdown on 3-Dots Click
document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".btn-action-trigger");

    if (trigger) {
        e.stopPropagation();
        const menu = trigger.nextElementSibling;
        const isCurrentlyOpen = menu ? menu.classList.contains("active") || menu.classList.contains("show") : false;

        document.querySelectorAll(".action-dropdown-menu").forEach(m => {
            m.classList.remove("active");
            m.classList.remove("show");
        });

        if (!isCurrentlyOpen && menu) {
            menu.classList.add("active");
            menu.classList.add("show");
        }
        return;
    }

    // Bahar click par band karein
    document.querySelectorAll(".action-dropdown-menu").forEach(m => {
        m.classList.remove("active");
        m.classList.remove("show");
    });
});

// 2. Student Actions Handler (QR, Fee, Edit, Status, Delete)
studentTableBody?.addEventListener("click", async (e) => {
    // Menu item click hone par menu band karein
    const actionItem = e.target.closest(".action-dropdown-item");
    if (actionItem) {
        document.querySelectorAll(".action-dropdown-menu").forEach(m => {
            m.classList.remove("active");
            m.classList.remove("show");
        });
    }

    // A. Show QR
    const qrBtn = e.target.closest(".btn-show-qr");
    if (qrBtn) {
        const studentId = qrBtn.getAttribute("data-id");
        const studentName = qrBtn.getAttribute("data-name");
        triggerStudentQR(studentId, studentName);
        return;
    }

    // B. Collect Fee
    const feeBtn = e.target.closest(".btn-collect-fee");
    if (feeBtn) {
        const studentId = feeBtn.getAttribute("data-id");
        const student = currentStudents.find(s => s.studentId === studentId);
        if (student) openCollectFeeModal(student);
        return;
    }

    // C. Edit Details
    const editBtn = e.target.closest(".btn-edit-student");
    if (editBtn) {
        const docId = editBtn.getAttribute("data-docid");
        const student = currentStudents.find(s => s.id === docId);
        if (student) openEditStudentModal(student);
        return;
    }

    // D. Toggle Status
    const statusBtn = e.target.closest(".action-toggle-status");
    if (statusBtn) {
        const docId = statusBtn.getAttribute("data-docid");
        const currentStatus = statusBtn.getAttribute("data-status");
        
        statusBtn.disabled = true;
        statusBtn.textContent = "Updating...";

        try {
            await toggleStudentStatus(docId, currentStatus);
            showToast(`Status updated successfully!`);
            await loadInstituteData();
        } catch (err) {
            console.error(err);
            showToast("Failed to update status.");
            statusBtn.disabled = false;
        }
        return;
    }

    // E. Delete Student
    const deleteBtn = e.target.closest(".btn-delete-student");
    if (deleteBtn) {
        if (currentUserProfile?.role !== "super_admin") {
            showToast("⛔ Access Denied: Only Super Admin can delete student records.");
            return;
        }
        const studentDocId = deleteBtn.getAttribute("data-docid");
        const studentName = deleteBtn.getAttribute("data-name") || "this student";

        const confirmed = confirm(`Are you sure you want to permanently delete:\n\n"${studentName}"?\n\nThis action cannot be undone.`);
        
        if (confirmed) {
            try {
                deleteBtn.disabled = true;
                deleteBtn.textContent = "...";
                
                await deleteStudentRecord(studentDocId);
                showToast(`✓ Student "${studentName}" deleted successfully.`);
                
                await loadInstituteData();
            } catch (err) {
                console.error("Delete student error:", err);
                alert("Error deleting student record. Please try again.");
                deleteBtn.disabled = false;
                deleteBtn.textContent = "🗑️ Delete";
            }
        }
        return;
    }
});

// Edit Student Modal Handlers
function openEditStudentModal(student) {
    if (!editStudentModal) return;
    editStudentDocId.value = student.id;
    editRegNoDisplay.value = student.studentId;
    editStudentName.value = student.studentName || "";
    editStudentPhone.value = student.phone || "";
    editGuardianName.value = student.guardianName || "";
    editStatusSelect.value = student.status || "Active";

    editCourseSelect.innerHTML = "";
    availableCoursesList.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.courseName;
        opt.textContent = c.courseName;
        if (c.courseName === student.courseName) opt.selected = true;
        editCourseSelect.appendChild(opt);
    });

    editBatchSelect.innerHTML = "";
    if (batchSelect) {
        Array.from(batchSelect.options).forEach(bOpt => {
            if (bOpt.value) {
                const opt = document.createElement("option");
                opt.value = bOpt.value;
                opt.textContent = bOpt.textContent;
                if (bOpt.value === student.batchTime) opt.selected = true;
                editBatchSelect.appendChild(opt);
            }
        });
    }

    if (student.photoUrl) {
        editPhotoPreview.src = student.photoUrl;
        editPhotoPreview.style.display = "block";
    } else {
        editPhotoPreview.style.display = "none";
    }
    editPhotoInput.value = "";

    editStudentModal.classList.add("active");
}

function hideEditStudentModal() {
    editStudentModal?.classList.remove("active");
    editStudentForm?.reset();
}

closeEditModalBtn?.addEventListener("click", hideEditStudentModal);
cancelEditModalBtn?.addEventListener("click", hideEditStudentModal);

editStudentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const docId = editStudentDocId.value;
    if (!docId) return;

    if (saveEditStudentBtn) {
        saveEditStudentBtn.disabled = true;
        saveEditStudentBtn.textContent = "Updating...";
    }

    try {
        const updateData = {
            studentName: editStudentName.value.trim(),
            phone: editStudentPhone.value.trim(),
            courseName: editCourseSelect.value,
            batchTime: editBatchSelect.value,
            guardianName: editGuardianName.value.trim(),
            status: editStatusSelect.value
        };

        const newPhotoFile = editPhotoInput?.files[0];
        if (newPhotoFile) {
            updateData.photoUrl = await compressAndConvertToBase64(newPhotoFile);
        }

        await updateStudentDetails(docId, updateData);
        showToast("Student details updated successfully!");
        hideEditStudentModal();
        await loadInstituteData();

    } catch (err) {
        console.error("Update student error:", err);
        showToast("Failed to update student.");
    } finally {
        if (saveEditStudentBtn) {
            saveEditStudentBtn.disabled = false;
            saveEditStudentBtn.textContent = "Save Changes";
        }
    }
});

// Admission Handlers
openAddStudentModalBtn?.addEventListener("click", async () => {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    if (modalInstituteName) modalInstituteName.value = INSTITUTES_META[activeKey]?.fullName || "";
    if (joinDateInput) joinDateInput.value = new Date().toISOString().split("T")[0];
    await autoRefreshSmartRegNo();
    admissionModal?.classList.add("active");
});

function hideModal() {
    admissionModal?.classList.remove("active");
    admissionForm?.reset();
}

closeModalBtn?.addEventListener("click", hideModal);
cancelModalBtn?.addEventListener("click", hideModal);

courseSelect?.addEventListener("change", async (e) => {
    const selectedCourseName = e.target.value;
    const match = availableCoursesList.find(c => c.courseName === selectedCourseName);
    if (match && feeBalanceInput) {
        feeBalanceInput.value = match.totalFee || 0;
    }
    await autoRefreshSmartRegNo();
});

joinDateInput?.addEventListener("change", autoRefreshSmartRegNo);

studentPhotoInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 12 * 1024 * 1024) {
            alert("File is very large (> 12MB). Please select a standard passport photo.");
            e.target.value = "";
            return;
        }
        showToast("✓ Photo selected & ready for compression");
    }
});

admissionForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const regNo = manualRegNoInput?.value.trim() || "";
    const photoFile = studentPhotoInput?.files[0];

    if (saveStudentBtn) {
        saveStudentBtn.disabled = true;
        saveStudentBtn.textContent = "Saving...";
    }

    try {
        const photoBase64 = await compressAndConvertToBase64(photoFile);

        const newStudent = {
            studentId: regNo,
            studentName: document.getElementById("studentNameInput")?.value.trim() || "",
            phone: document.getElementById("studentPhoneInput")?.value.trim() || "",
            guardianName: document.getElementById("guardianNameInput")?.value.trim() || "",
            courseName: courseSelect?.value || "",
            batchTime: batchSelect?.value || "",
            joinedDate: joinDateInput ? joinDateInput.value : new Date().toISOString().split("T")[0],
            balance: Number(feeBalanceInput?.value) || 0,
            feeDueDate: document.getElementById("feeDueDateInput")?.value || "",
            photoUrl: photoBase64 || "",
            status: "Active",
            instituteId: activeKey,
            instituteName: INSTITUTES_META[activeKey]?.fullName || "",
            branch: INSTITUTES_META[activeKey]?.branch || ""
        };

        await createStudent(newStudent);
        showToast(`Admission Successful! Reg: ${regNo}`);
        hideModal();
        await loadInstituteData();

    } catch (err) {
        console.error("Save error:", err);
        showToast(`Failed to save: ${err.message}`);
    } finally {
        if (saveStudentBtn) {
            saveStudentBtn.disabled = false;
            saveStudentBtn.textContent = "Save Admission";
        }
    }
});

// Attendance Engine
// Attendance Engine
async function handleProcessAttendance(rawData) {
    if (!rawData) return;
    let studentId = rawData.trim();

    if (studentId.includes("id=")) {
        try {
            const urlObj = new URL(studentId, window.location.origin);
            studentId = urlObj.searchParams.get("id") || studentId;
        } catch (e) {
            const parts = studentId.split("id=");
            studentId = parts[1]?.split("&")[0] || studentId;
        }
    }

    studentId = decodeURIComponent(studentId).trim();

    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const batch = attSessionBatchSelect ? attSessionBatchSelect.value : "ALL";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : "";

    if (!sessionDate) {
        showToast("Please select a session date first.");
        return;
    }

    const result = await markAttendanceRecord({
        instituteId: activeKey,
        instituteName: INSTITUTES_META[activeKey]?.fullName || "",
        branch: INSTITUTES_META[activeKey]?.branch || "",
        batchTime: batch,
        sessionDate: sessionDate,
        studentId: studentId
    });

    if (result.success) {
        // Agar Fee overdue hai toh alert message highlight hoga
        if (result.feeWarning && result.feeWarning.includes("OVERDUE")) {
            showToast(`✓ Marked Present: ${result.studentName}`);
            displayScannerFeedback(`✓ Success: ${result.studentName} marked present!\n${result.feeWarning}`, "error");
        } else {
            showToast(`✓ Marked Present: ${result.studentName} (${result.studentId})`);
            const msg = result.feeWarning 
                ? `✓ Success: ${result.studentName} marked present!\n${result.feeWarning}`
                : `✓ Success: ${result.studentName} marked present at ${result.markedAt}!`;
            displayScannerFeedback(msg, "success");
        }
        await loadSessionAttendanceTable();
    } else {
        showToast(result.message);
        displayScannerFeedback(result.message, "error");
    }
}
function displayScannerFeedback(message, type) {
    if (!scannerFeedback) return;
    scannerFeedback.textContent = message;
    scannerFeedback.className = `scanner-feedback-box ${type === "success" ? "feedback-success" : "feedback-error"}`;
    scannerFeedback.style.display = "block";
    setTimeout(() => {
        if (scannerFeedback) scannerFeedback.style.display = "none";
    }, 3500);
}

// Render Attendance Chart
async function renderAttendanceChart(instituteId, sessionDate) {
    const canvas = document.getElementById("attendanceTrendChart");
    if (!canvas || typeof Chart === "undefined") return;

    try {
        const trend = await fetchWeeklyAttendanceTrend(instituteId, sessionDate);
        if (attendanceTrendChartInstance) {
            attendanceTrendChartInstance.destroy();
        }

        const ctx = canvas.getContext("2d");
        attendanceTrendChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: trend.labels,
                datasets: [{
                    label: "Students Present",
                    data: trend.data,
                    borderColor: "#1a56db",
                    backgroundColor: "rgba(26, 86, 219, 0.08)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#1a56db",
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 },
                        grid: { color: "#f1f5f9" }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch (err) {
        console.error("Chart render error:", err);
    }
}

// Render Batch Progress Bars
function renderBatchProgressBars(batchBreakdown = []) {
    if (!batchProgressContainer) return;
    batchProgressContainer.innerHTML = "";

    batchBreakdown.forEach(b => {
        const item = document.createElement("div");
        item.className = "batch-progress-item";
        
        if (b.isCancelled) {
            item.style.background = "#fff1f2";
            item.style.borderColor = "#fecaca";
        }

        item.innerHTML = `
            <div class="batch-progress-head">
                <span>
                    ${b.batchTime} 
                    ${b.isCancelled ? '<span style="color: #ef4444; font-size: 0.75rem; margin-left: 6px;">[CLASS CANCELLED]</span>' : ''}
                </span>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="color: #1a56db;">${b.present} / ${b.enrolled}</span>
                    <button class="btn btn-outline btn-sm toggle-batch-cancel-btn" data-batch="${b.batchTime}" style="font-size: 0.7rem; padding: 2px 6px;">
                        ${b.isCancelled ? 'Resume Class' : 'Cancel Class'}
                    </button>
                </div>
            </div>
            <div class="batch-progress-bar-bg">
                <div class="batch-progress-fill" style="width: ${b.percentage}%; background: ${b.isCancelled ? '#94a3b8' : ''};"></div>
            </div>
        `;
        batchProgressContainer.appendChild(item);
    });
}

// Render Attendance Roster Rows
function renderAttendanceRosterRows(records = []) {
    if (!attendanceTableBody) return;
    attendanceTableBody.innerHTML = "";

    if (records.length === 0) {
        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px;">
                    No students marked for this session yet.
                </td>
            </tr>`;
        if (attSessionCountBadge) attSessionCountBadge.textContent = "0 Verified Present";
        return;
    }

    records.forEach(rec => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="table-student-cell">
                    ${rec.photoUrl 
                        ? `<img src="${rec.photoUrl}" class="table-student-avatar" alt="Photo">` 
                        : `<div class="table-student-avatar">${(rec.studentName || 'S').charAt(0).toUpperCase()}</div>`
                    }
                    <strong>${rec.studentName}</strong>
                </div>
            </td>
            <td><strong style="color: #1e3a8a; font-family: monospace;">${rec.studentId}</strong></td>
            <td>${rec.courseName || '-'}</td>
            <td>${rec.batchTime}</td>
            <td><strong>${rec.markedAt}</strong></td>
            <td><span class="punctual-tag-on-time">${rec.punctuality || 'On-Time'}</span></td>
            <td><span class="status-badge active">&#10004; Present</span></td>
        `;
        attendanceTableBody.appendChild(tr);
    });

    if (attSessionCountBadge) {
        attSessionCountBadge.textContent = `${records.length} Verified Present`;
    }
}

// Load Session Attendance Table
async function loadSessionAttendanceTable() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const selectedBatch = attSessionBatchSelect ? attSessionBatchSelect.value : "ALL";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : new Date().toISOString().split("T")[0];

    try {
        const configuredBatches = await fetchBatches(activeKey);
        const analytics = await calculateAttendanceAnalytics(
            activeKey, 
            sessionDate, 
            currentStudents, 
            configuredBatches
        );

        const holidayBanner = document.getElementById("holidayBanner");
        const markDayHolidayBtn = document.getElementById("markDayHolidayBtn");

        if (analytics.isHoliday) {
            if (holidayBanner) holidayBanner.style.display = "flex";
            if (markDayHolidayBtn) markDayHolidayBtn.style.display = "none";
            if (kpiAttPresent) kpiAttPresent.textContent = "HOLIDAY";
            if (kpiAttPercentage) kpiAttPercentage.textContent = "OFF";
            if (kpiAttAbsent) kpiAttAbsent.textContent = "0";
        } else {
            if (holidayBanner) holidayBanner.style.display = "none";
            if (markDayHolidayBtn) markDayHolidayBtn.style.display = "inline-flex";

            if (kpiAttPresent) kpiAttPresent.textContent = `${analytics.totalPresent} / ${analytics.totalEnrolled}`;
            if (kpiAttPercentage) kpiAttPercentage.textContent = `${analytics.turnoutRate}%`;
            if (kpiAttAbsent) kpiAttAbsent.textContent = `${analytics.totalAbsent}`;
        }

        if (kpiAttBatches) kpiAttBatches.textContent = `${configuredBatches.length} Active`;

        renderBatchProgressBars(analytics.batchBreakdown);
        renderAttendanceChart(activeKey, sessionDate);

        const tableRecords = selectedBatch === "ALL" 
            ? analytics.presentRecords 
            : analytics.presentRecords.filter(r => r.batchTime === selectedBatch);

        renderAttendanceRosterRows(tableRecords);

    } catch (err) {
        console.error("Attendance master sync error:", err);
    }
}

// Scanner Controls
function closeScannerModal() {
    stopQrScanner();
    scannerModal?.classList.remove("active");
    if (scannerFeedback) scannerFeedback.style.display = "none";
}

openScannerModalBtn?.addEventListener("click", () => {
    scannerModal?.classList.add("active");
    startQrScanner("scannerVideoContainer", handleProcessAttendance, (errMsg) => {
        displayScannerFeedback(errMsg, "error");
    });
});

closeScannerModalBtn?.addEventListener("click", closeScannerModal);
stopScannerModalBtn?.addEventListener("click", closeScannerModal);

manualMarkBtn?.addEventListener("click", () => {
    if (manualStudentIdInput && manualStudentIdInput.value.trim()) {
        handleProcessAttendance(manualStudentIdInput.value.trim());
        manualStudentIdInput.value = "";
    }
});

// Dropdowns & Masters
async function populateFormDropdowns() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    try {
        const [courses, batches] = await Promise.all([
            fetchCourses(activeKey),
            fetchBatches(activeKey)
        ]);

        availableCoursesList = courses;

        if (courseSelect) {
            courseSelect.innerHTML = courses.length ? "" : '<option value="">No courses configured</option>';
            courses.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.courseName;
                opt.textContent = `${c.courseName} (${c.duration || '-'}) - ₹${c.totalFee || 0}`;
                courseSelect.appendChild(opt);
            });
            if (courses.length > 0 && feeBalanceInput) {
                feeBalanceInput.value = courses[0].totalFee || 0;
            }
        }

        if (batchSelect) {
            batchSelect.innerHTML = batches.length ? "" : '<option value="">No batches configured</option>';
            batches.forEach(b => {
                const opt = document.createElement("option");
                opt.value = b.batchTime;
                opt.textContent = b.batchTime;
                batchSelect.appendChild(opt);
            });
        }

        if (attSessionBatchSelect) {
            attSessionBatchSelect.innerHTML = '<option value="ALL">All Batches (Combined)</option>';
            batches.forEach(b => {
                const opt = document.createElement("option");
                opt.value = b.batchTime;
                opt.textContent = b.batchTime;
                attSessionBatchSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("Dropdown populate error:", err);
    }
}

async function loadCoursesAndBatchesTables() {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    try {
        const [courses, batches] = await Promise.all([
            fetchCourses(activeKey),
            fetchBatches(activeKey)
        ]);

        availableCoursesList = courses;

        if (coursesTableBody) {
            coursesTableBody.innerHTML = courses.length ? "" : '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 16px;">No courses found.</td></tr>';
            courses.forEach(c => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${c.courseName}</strong></td>
                    <td>${c.duration || '-'}</td>
                    <td><strong>₹${Number(c.totalFee || 0).toLocaleString("en-IN")}</strong></td>
                    <td>
                        <button class="btn btn-outline btn-sm delete-course-btn" data-id="${c.id}" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Delete</button>
                    </td>
                `;
                coursesTableBody.appendChild(tr);
            });
        }

        if (batchesTableBody) {
            batchesTableBody.innerHTML = batches.length ? "" : '<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 16px;">No batches found.</td></tr>';
            batches.forEach(b => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${b.batchTime}</strong></td>
                    <td><span class="id-badge">${b.instituteId}</span></td>
                    <td>
                        <button class="btn btn-outline btn-sm delete-batch-btn" data-id="${b.id}" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Delete</button>
                    </td>
                `;
                batchesTableBody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Courses/Batches load error:", err);
    }
}

coursesTableBody?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-course-btn");
    if (!btn) return;
    if (currentUserProfile?.role !== "super_admin") {
        showToast("⛔ Only Super Admin can delete courses.");
        return;
    }
    if (confirm("Are you sure you want to delete this course?")) {
        btn.disabled = true;
        await deleteCourse(btn.getAttribute("data-id"));
        showToast("Course removed.");
        await loadCoursesAndBatchesTables();
        await populateFormDropdowns();
    }
});

batchesTableBody?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-batch-btn");
    if (!btn) return;
    if (currentUserProfile?.role !== "super_admin") {
        showToast("⛔ Only Super Admin can delete batches.");
        return;
    }
    if (confirm("Are you sure you want to delete this batch timing?")) {
        btn.disabled = true;
        await deleteBatch(btn.getAttribute("data-id"));
        showToast("Batch slot removed.");
        await loadCoursesAndBatchesTables();
        await populateFormDropdowns();
    }
});

openAddCourseModalBtn?.addEventListener("click", () => addCourseModal?.classList.add("active"));
const closeCourseModal = () => { addCourseModal?.classList.remove("active"); addCourseForm?.reset(); };
closeAddCourseBtn?.addEventListener("click", closeCourseModal);
cancelAddCourseBtn?.addEventListener("click", closeCourseModal);

addCourseForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    if (saveCourseBtn) {
        saveCourseBtn.disabled = true;
        saveCourseBtn.textContent = "Saving...";
    }
    try {
        await addCourse({
            courseName: document.getElementById("newCourseName").value,
            duration: document.getElementById("newCourseDuration").value,
            totalFee: document.getElementById("newCourseFee").value,
            instituteId: activeKey
        });
        showToast("Course added successfully!");
        closeCourseModal();
        await loadCoursesAndBatchesTables();
        await populateFormDropdowns();
    } catch (err) {
        console.error("Add course error:", err);
        showToast("Failed to add course.");
    } finally {
        if (saveCourseBtn) {
            saveCourseBtn.disabled = false;
            saveCourseBtn.textContent = "Save Course";
        }
    }
});

openAddBatchModalBtn?.addEventListener("click", () => addBatchModal?.classList.add("active"));
const closeBatchModal = () => { addBatchModal?.classList.remove("active"); addBatchForm?.reset(); };
closeAddBatchBtn?.addEventListener("click", closeBatchModal);
cancelAddBatchBtn?.addEventListener("click", closeBatchModal);

addBatchForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    if (saveBatchBtn) {
        saveBatchBtn.disabled = true;
        saveBatchBtn.textContent = "Saving...";
    }
    try {
        await addBatch({
            batchTime: document.getElementById("newBatchTime").value,
            instituteId: activeKey
        });
        showToast("Batch timing saved!");
        closeBatchModal();
        await loadCoursesAndBatchesTables();
        await populateFormDropdowns();
    } catch (err) {
        console.error("Add batch error:", err);
        showToast("Failed to add batch.");
    } finally {
        if (saveBatchBtn) {
            saveBatchBtn.disabled = false;
            saveBatchBtn.textContent = "Save Batch Slot";
        }
    }
});

// Dropdown Switch Event with Logo Refresh
instituteSelect?.addEventListener("change", async () => {
    if (currentUserProfile && currentUserProfile.role !== "super_admin") {
        showToast("Access Denied: You cannot switch institutes.");
        instituteSelect.value = currentUserProfile.instituteId;
        return;
    }
    
    updateSidebarBranding();

    await loadInstituteData();
    await loadSessionAttendanceTable();
    await loadFeeTransactionsTable();
    await populateFormDropdowns();
    showToast(`Switched to ${INSTITUTES_META[instituteSelect.value]?.fullName}`);
});

exportCsvBtn?.addEventListener("click", () => {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    exportStudentsToCSV(INSTITUTES_META[activeKey]?.fullName || "Students", currentStudents);
});

exportDailyAttendanceCsvBtn?.addEventListener("click", async () => {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : new Date().toISOString().split("T")[0];
    const records = await fetchSessionAttendance(activeKey, "ALL", sessionDate);

    if (records.length === 0) {
        alert("No attendance records to export for this date.");
        return;
    }

    const headers = ["Reg No", "Student Name", "Course", "Batch", "Check-in Time", "Punctuality", "Status"];
    const rows = records.map(r => [
        `"${r.studentId}"`,
        `"${r.studentName}"`,
        `"${r.courseName || ''}"`,
        `"${r.batchTime}"`,
        `"${r.markedAt}"`,
        `"${r.punctuality || 'On-Time'}"`,
        `"${r.status || 'Present'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Attendance_${sessionDate}_${activeKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById("markDayHolidayBtn")?.addEventListener("click", async () => {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : new Date().toISOString().split("T")[0];
    const reason = prompt("Enter holiday reason (e.g. Sunday, Festival, Heavy Rain):", "Official Holiday");
    if (reason) {
        await setInstituteHoliday(activeKey, sessionDate, true, reason);
        showToast("✓ Marked as Holiday! Attendance calculation paused.");
        await loadSessionAttendanceTable();
    }
});

document.getElementById("revertHolidayBtn")?.addEventListener("click", async () => {
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : new Date().toISOString().split("T")[0];
    await setInstituteHoliday(activeKey, sessionDate, false);
    showToast("✓ Reverted to Normal Working Day.");
    await loadSessionAttendanceTable();
});

batchProgressContainer?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".toggle-batch-cancel-btn");
    if (!btn) return;
    const batch = btn.getAttribute("data-batch");
    const activeKey = instituteSelect ? instituteSelect.value : "TB_EDU";
    const sessionDate = attSessionDateInput ? attSessionDateInput.value : new Date().toISOString().split("T")[0];

    btn.disabled = true;
    await toggleBatchCancellation(activeKey, sessionDate, batch);
    showToast(`Updated status for batch: ${batch}`);
    await loadSessionAttendanceTable();
});

logoutBtn?.addEventListener("click", () => logoutUser());

// Auth Bootstrap & Permission Management
monitorAuthState((profile) => {
    currentUserProfile = profile;
    
    if (userNameDisplay) userNameDisplay.textContent = profile.displayName || profile.email;
    if (userRoleDisplay) {
        userRoleDisplay.textContent = profile.role === "super_admin" 
            ? "Super Admin" 
            : (profile.role === "admin" ? "Institute Admin" : "Staff Member");
    }
    if (userAvatar) {
        userAvatar.textContent = (profile.displayName || profile.email).charAt(0).toUpperCase();
    }

    // Role Permissions
    if (profile.role !== "super_admin") {
        if (navUsers) navUsers.style.display = "none";
        if (navCourses) navCourses.style.display = "none";
        if (openAddUserModalBtn) openAddUserModalBtn.style.display = "none";
        if (instituteSelect) {
            instituteSelect.value = profile.instituteId;
            instituteSelect.disabled = true;
        }
    } else {
        if (navUsers) navUsers.style.display = "flex";
        if (navCourses) navCourses.style.display = "flex";
        if (openAddUserModalBtn) openAddUserModalBtn.style.display = "inline-flex";
        if (instituteSelect) {
            instituteSelect.disabled = false;
        }
    }

    // Staff Fee Permission Check
    const canViewFees = profile.role === "super_admin" || profile.role === "admin" || profile.canViewFees !== false;
    if (!canViewFees) {
        if (navFees) navFees.style.display = "none";
        if (statPendingFees?.parentElement) statPendingFees.parentElement.style.display = "none";
    } else {
        if (navFees) navFees.style.display = "flex";
        if (statPendingFees?.parentElement) statPendingFees.parentElement.style.display = "block";
    }

    if (attSessionDateInput) {
        attSessionDateInput.value = new Date().toISOString().split("T")[0];
    }

    updateSidebarBranding();

    loadInstituteData();
    loadSessionAttendanceTable();
    loadFeeTransactionsTable();
    populateFormDropdowns();
});

// Users Section Functions
function renderUsersRows(usersList) {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = "";

    if (usersList.length === 0) {
        usersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No members found.</td></tr>`;
        return;
    }

    usersList.forEach(u => {
        const row = document.createElement("tr");
        const isActive = u.isActive !== false;
        
        let roleBadgeClass = "badge-staff";
        let roleLabel = "Staff Member";

        if (u.role === "super_admin") {
            roleBadgeClass = "badge-super-admin";
            roleLabel = "★ Super Admin";
        } else if (u.role === "admin") {
            roleBadgeClass = "badge-admin";
            roleLabel = "Institute Admin";
        }

        row.innerHTML = `
            <td><strong>${u.displayName || '-'}</strong></td>
            <td>${u.email}</td>
            <td><span class="${roleBadgeClass}">${roleLabel}</span></td>
            <td><span class="id-badge">${u.instituteId || 'ALL'}</span></td>
            <td>
                <span class="status-badge ${isActive ? 'active' : 'inactive'}">
                    ${isActive ? 'Active' : 'Disabled'}
                </span>
            </td>
            <td>
                ${u.role === "super_admin" 
                    ? `<span style="font-size: 0.8rem; color: #94a3b8;">Protected</span>`
                    : `<button class="btn btn-outline btn-sm toggle-user-btn" data-id="${u.id}" data-active="${isActive}">
                         ${isActive ? 'Deactivate' : 'Activate'}
                       </button>`
                }
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

async function loadUsersTable() {
    if (!usersTableBody) return;
    try {
        allFetchedUsers = await fetchAllUsers();
        applyUserFilter();
    } catch (err) {
        console.error("Users load error:", err);
        showToast("Failed to load users list.");
    }
}

function applyUserFilter() {
    const selectedFilter = userRoleFilter ? userRoleFilter.value : "ALL";
    if (selectedFilter === "ALL") {
        renderUsersRows(allFetchedUsers);
    } else {
        const filtered = allFetchedUsers.filter(u => u.role === selectedFilter);
        renderUsersRows(filtered);
    }
}

userRoleFilter?.addEventListener("change", applyUserFilter);

usersTableBody?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".toggle-user-btn");
    if (!btn) return;
    const userId = btn.getAttribute("data-id");
    const currentActive = btn.getAttribute("data-active") === "true";

    btn.disabled = true;
    try {
        await toggleUserStatus(userId, currentActive);
        showToast("User status updated successfully!");
        await loadUsersTable();
    } catch (err) {
        console.error(err);
        showToast("Failed to update status.");
    }
});

openAddUserModalBtn?.addEventListener("click", () => addUserModal?.classList.add("active"));
const closeUserModal = () => {
    addUserModal?.classList.remove("active");
    addUserForm?.reset();
};
closeAddUserBtn?.addEventListener("click", closeUserModal);
cancelAddUserBtn?.addEventListener("click", closeUserModal);

addUserForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (saveUserBtn) {
        saveUserBtn.disabled = true;
        saveUserBtn.textContent = "Creating...";
    }

    try {
        await createPortalUser({
            displayName: document.getElementById("newUserName")?.value,
            email: document.getElementById("newUserEmail")?.value,
            password: document.getElementById("newUserPassword")?.value,
            role: document.getElementById("newUserRole")?.value,
            instituteId: document.getElementById("newUserInstitute")?.value,
            canViewFees: document.getElementById("newUserCanViewFees")?.checked ?? true
        });

        showToast("User created successfully!");
        closeUserModal();
        await loadUsersTable();
    } catch (err) {
        console.error("User creation error:", err);
        showToast(err.message || "Failed to create user.");
    } finally {
        if (saveUserBtn) {
            saveUserBtn.disabled = false;
            saveUserBtn.textContent = "Create Account";
        }
    }
});

// Photo Lightbox Handlers
const photoPreviewModal = document.getElementById("photoPreviewModal");
const previewModalImg = document.getElementById("previewModalImg");
const previewModalCaption = document.getElementById("previewModalCaption");
const closePhotoPreviewBtn = document.getElementById("closePhotoPreviewBtn");

document.addEventListener("click", (e) => {
    const photoEl = e.target.closest(".student-photo-clickable");
    if (photoEl && photoPreviewModal && previewModalImg) {
        const photoSrc = photoEl.getAttribute("data-photo");
        const studentName = photoEl.getAttribute("data-name") || "Student Photo";
        
        previewModalImg.src = photoSrc;
        if (previewModalCaption) previewModalCaption.textContent = studentName;
        photoPreviewModal.style.display = "flex";
    }
});

closePhotoPreviewBtn?.addEventListener("click", () => {
    if (photoPreviewModal) photoPreviewModal.style.display = "none";
});

photoPreviewModal?.addEventListener("click", (e) => {
    if (e.target === photoPreviewModal) {
        photoPreviewModal.style.display = "none";
    }
});
