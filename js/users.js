/**
 * js/users.js
 * Staff & User Management with Secondary Firebase Auth App
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    auth,
    db, 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    updateDoc 
} from "./firebase-config.js";

// Main auth ke options se direct config reuse karein
const secondaryApp = initializeApp(auth.app.options, "SecondaryAuthApp");
const secondaryAuth = getAuth(secondaryApp);

export async function createPortalUser({ email, password, displayName, role, instituteId }) {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const newUid = userCred.user.uid;

    await signOut(secondaryAuth);

    await setDoc(doc(db, "users", newUid), {
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role: role.trim().toLowerCase(),
        instituteId: instituteId.trim().toUpperCase(),
        isActive: true,
        createdAt: new Date().toISOString()
    });

    return { uid: newUid, email, displayName, role, instituteId };
}

export async function fetchAllUsers() {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = [];
    querySnapshot.forEach((docSnap) => {
        usersList.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });
    return usersList;
}

export async function toggleUserStatus(userId, currentStatus) {
    const userRef = doc(db, "users", userId);
    const newStatus = !currentStatus;
    await updateDoc(userRef, {
        isActive: newStatus
    });
    return newStatus;
}
