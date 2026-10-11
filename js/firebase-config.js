// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCSwNtevukBGPAVlm1ERxeSrgvN3eEhpKQ",
    authDomain: "sms-technobright-fbca.firebaseapp.com",
    projectId: "sms-technobright-fbca",
    storageBucket: "sms-technobright-fbca.firebasestorage.app",
    messagingSenderId: "531848729929",
    appId: "1:531848729929:web:3cc96fa4e7241bba6eb698"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global window access for non-module compatibility
window.auth = auth;
window.db = db;

export { 
    app, 
    auth, 
    db, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs 
};
