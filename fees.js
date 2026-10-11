// js/fees.js
// Fee Installments, Outstanding Balance Tracker & Printable Receipts

import { db } from "./firebase-config.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Generate Unique Receipt Number
export function generateReceiptNumber() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `RCP-${year}-${random}`;
}

// 2. Record Fee Payment Transaction
export async function recordFeePayment({
    instituteId,
    instituteName,
    branch,
    studentId,
    studentName,
    courseName,
    amountPaid,
    paymentMode,
    remarks,
    recordedBy
}) {
    const studentDocRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentDocRef);

    if (!studentSnap.exists()) {
        throw new Error("Student not found in database.");
    }

    const currentStudent = studentSnap.data();
    const currentBalance = Number(currentStudent.balance) || 0;
    const paid = Number(amountPaid) || 0;

    if (paid <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const newBalance = Math.max(0, currentBalance - paid);
    const receiptNo = generateReceiptNumber();
    const paymentDate = new Date().toISOString().split("T")[0];
    const paymentTime = new Date().toLocaleTimeString("en-IN");

    // Save fee transaction record
    const feeDocRef = doc(db, "fees", `${studentId}_${Date.now()}`);
    const transactionData = {
        receiptNo: receiptNo,
        instituteId: instituteId,
        instituteName: instituteName,
        branch: branch,
        studentId: studentId,
        studentName: studentName,
        courseName: courseName,
        amountPaid: paid,
        previousBalance: currentBalance,
        remainingBalance: newBalance,
        paymentMode: paymentMode,
        remarks: remarks || "Course installment",
        recordedBy: recordedBy,
        paymentDate: paymentDate,
        paymentTime: paymentTime,
        timestamp: new Date().toISOString()
    };

    await setDoc(feeDocRef, transactionData);

    // Update student balance in Firestore
    await updateDoc(studentDocRef, {
        balance: newBalance
    });

    return transactionData;
}

// 3. Fetch Transaction History by Institute
export async function fetchInstituteFeeTransactions(instituteId) {
    const feesRef = collection(db, "fees");
    const q = query(feesRef, where("instituteId", "==", instituteId));
    const snapshot = await getDocs(q);

    const transactions = [];
    snapshot.forEach(docSnap => {
        transactions.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });
    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 4. Update Fee Transaction
export async function updateFeeTransaction(transactionId, { newAmount, paymentMode, oldAmount, studentId, instituteId }) {
    const diff = Number(newAmount) - Number(oldAmount);

    // Update transaction document
    await updateDoc(doc(db, "fees", transactionId), {
        amountPaid: Number(newAmount),
        paymentMode: paymentMode,
        updatedAt: new Date().toISOString()
    });

    // Balance adjust karna agar amount badla hai
    if (diff !== 0 && studentId) {
        const studentDocRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentDocRef);

        if (studentSnap.exists()) {
            const currentBal = Number(studentSnap.data().balance) || 0;
            const updatedBal = Math.max(0, currentBal - diff);
            await updateDoc(studentDocRef, { balance: updatedBal });
        } else {
            const studentsRef = collection(db, "students");
            const q = query(studentsRef, where("studentId", "==", studentId), where("instituteId", "==", instituteId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const sDoc = snap.docs[0];
                const currentBal = Number(sDoc.data().balance) || 0;
                const updatedBal = Math.max(0, currentBal - diff);
                await updateDoc(doc(db, "students", sDoc.id), { balance: updatedBal });
            }
        }
    }
}

// 5. Delete Fee Transaction (Super Admin Only)
export async function deleteFeeTransaction(transactionId, { amountPaid, studentId, instituteId }) {
    // Transaction record delete karein
    await deleteDoc(doc(db, "fees", transactionId));

    // Student ka due balance wapas restore karein
    if (studentId && Number(amountPaid) > 0) {
        const studentDocRef = doc(db, "students", studentId);
        const studentSnap = await getDoc(studentDocRef);

        if (studentSnap.exists()) {
            const currentBal = Number(studentSnap.data().balance) || 0;
            const restoredBal = currentBal + Number(amountPaid);
            await updateDoc(studentDocRef, { balance: restoredBal });
        } else {
            const studentsRef = collection(db, "students");
            const q = query(studentsRef, where("studentId", "==", studentId), where("instituteId", "==", instituteId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const sDoc = snap.docs[0];
                const currentBal = Number(sDoc.data().balance) || 0;
                const restoredBal = currentBal + Number(amountPaid);
                await updateDoc(doc(db, "students", sDoc.id), { balance: restoredBal });
            }
        }
    }
}