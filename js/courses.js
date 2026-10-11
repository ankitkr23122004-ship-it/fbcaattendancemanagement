/**
 * js/courses.js
 * Dynamic Course & Batch Management with Firestore
 */

import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

// --- COURSE OPERATIONS ---

export async function addCourse(courseData) {
    const docRef = await addDoc(collection(db, "courses"), {
        courseName: courseData.courseName.trim(),
        duration: courseData.duration.trim(),
        totalFee: Number(courseData.totalFee) || 0,
        instituteId: courseData.instituteId || "ALL",
        createdAt: new Date().toISOString()
    });
    return docRef.id;
}

export async function fetchCourses(instituteId = "ALL") {
    let q;
    if (instituteId === "ALL") {
        q = collection(db, "courses");
    } else {
        q = query(collection(db, "courses"), where("instituteId", "in", [instituteId, "ALL"]));
    }
    const snap = await getDocs(q);
    const courses = [];
    snap.forEach((d) => courses.push({ id: d.id, ...d.data() }));
    return courses;
}

export async function deleteCourse(courseId) {
    await deleteDoc(doc(db, "courses", courseId));
}

// --- BATCH OPERATIONS ---

export async function addBatch(batchData) {
    const cleanBatch = String(batchData.batchTime).trim();
    const docRef = await addDoc(collection(db, "batches"), {
        batchTime: cleanBatch,
        instituteId: batchData.instituteId || "ALL",
        createdAt: new Date().toISOString()
    });
    return docRef.id;
}

export async function fetchBatches(instituteId = "ALL") {
    let q;
    if (instituteId === "ALL") {
        q = collection(db, "batches");
    } else {
        q = query(collection(db, "batches"), where("instituteId", "in", [instituteId, "ALL"]));
    }
    const snap = await getDocs(q);
    const batches = [];
    snap.forEach((d) => batches.push({ id: d.id, ...d.data() }));
    
    // Natural Numeric Sort (taaki 1, 2, 3, 4 sequential order me aayein)
    return batches.sort((a, b) => 
        String(a.batchTime).localeCompare(String(b.batchTime), undefined, { numeric: true })
    );
}

export async function deleteBatch(batchId) {
    await deleteDoc(doc(db, "batches", batchId));
}
