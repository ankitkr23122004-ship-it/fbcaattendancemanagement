/**
 * js/auth.js
 * Hardened Authentication, Route Guard & Session Manager
 * Firebase v10 Modular SDK
 */

import { 
    auth, 
    db, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, 
    doc, 
    getDoc 
} from "./firebase-config.js";

// Check if current page is Login
const isLoginPage = window.location.pathname.endsWith("login.html") || 
                    window.location.pathname.endsWith("/login") ||
                    window.location.pathname === "/";

// DOM Elements
const errorAlert = document.getElementById("errorAlert");
const loginForm = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");

/**
 * Display authentication messages to the user
 */
function showAuthMessage(msg) {
    if (errorAlert) {
        errorAlert.textContent = msg;
        errorAlert.style.display = "block";
    } else {
        alert(msg);
    }
}

/**
 * Clear all stored session items
 */
function clearAuthSession() {
    sessionStorage.removeItem("authUid");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("instituteId");
    sessionStorage.removeItem("userEmail");
}

// -------------------------------------------------------------
// 1. Direct Login Form Handler (Only runs on login.html)
// -------------------------------------------------------------
if (loginForm && isLoginPage) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const emailInput = document.getElementById("emailInput");
        const passwordInput = document.getElementById("passwordInput");

        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (errorAlert) {
            errorAlert.textContent = "";
            errorAlert.style.display = "none";
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Signing in...";
        }

        try {
            console.log("Attempting sign-in for:", email);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Firebase Login Error:", error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Sign In to Dashboard";
            }

            let message = "Invalid email or password.";
            if (
                error.code === "auth/invalid-credential" || 
                error.code === "auth/user-not-found" || 
                error.code === "auth/wrong-password"
            ) {
                message = "Incorrect email address or password. Please verify your credentials.";
            } else if (error.code === "auth/too-many-requests") {
                message = "Too many failed attempts. Please try again later.";
            } else if (error.message) {
                message = error.message;
            }
            showAuthMessage(message);
        }
    });
}

// -------------------------------------------------------------
// 2. Auth State Monitor & Route Guard
// -------------------------------------------------------------
export function monitorAuthState(callback) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            clearAuthSession();
            if (!isLoginPage) {
                window.location.replace("login.html");
            }
            return;
        }

        try {
            console.log("Logged In UID:", user.uid);
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (!userSnap.exists()) {
                console.warn("No Firestore profile found for UID:", user.uid);
                clearAuthSession();
                await signOut(auth);
                if (isLoginPage) {
                    showAuthMessage("Access Denied: No authorized profile found for this account. Contact Super Admin.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Sign In to Dashboard";
                    }
                } else {
                    window.location.replace("login.html");
                }
                return;
            }

            const userData = userSnap.data();
            const role = (userData.role || "").trim().toLowerCase();
            const institute = (userData.instituteId || "").trim().toUpperCase();

            // Status check: Super Admin stays active unless explicitly set to false
            const rawActive = userData.isActive;
            const isExplicitlyFalse = rawActive === false || rawActive === "false" || rawActive === 0 || rawActive === "0";
            
            const isUserActive = role === "super_admin" 
                ? !isExplicitlyFalse 
                : (rawActive === true || rawActive === "true" || rawActive === 1 || rawActive === "1");

            if (!isUserActive) {
                console.warn("Account deactivated check triggered. Value:", rawActive);
                clearAuthSession();
                await signOut(auth);
                if (isLoginPage) {
                    showAuthMessage("Account Disabled: Your account has been deactivated.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Sign In to Dashboard";
                    }
                } else {
                    window.location.replace("login.html");
                }
                return;
            }

            // Role validation
            const validRoles = ["super_admin", "admin", "staff"];
            if (!role || !validRoles.includes(role)) {
                clearAuthSession();
                await signOut(auth);
                if (isLoginPage) {
                    showAuthMessage("Access Denied: Invalid role assignment.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Sign In to Dashboard";
                    }
                } else {
                    window.location.replace("login.html");
                }
                return;
            }

            // Institute validation
            const validInstitutes = ["TB_EDU", "FBCA", "ALL"];
            if (!validInstitutes.includes(institute)) {
                clearAuthSession();
                await signOut(auth);
                if (isLoginPage) {
                    showAuthMessage("Access Denied: Unassigned institute configuration.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Sign In to Dashboard";
                    }
                } else {
                    window.location.replace("login.html");
                }
                return;
            }

            // Super Admin scope check
            if (role !== "super_admin" && institute === "ALL") {
                clearAuthSession();
                await signOut(auth);
                if (isLoginPage) {
                    showAuthMessage("Security Violation: Institute scope mismatch.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Sign In to Dashboard";
                    }
                } else {
                    window.location.replace("login.html");
                }
                return;
            }

            // Save to Session Storage
            const profile = {
                uid: user.uid,
                email: user.email || userData.email,
                displayName: userData.displayName || userData.name || (user.email ? user.email.split("@")[0] : "Admin"),
                role: role,
                instituteId: institute,
                isActive: isUserActive
            };

            sessionStorage.setItem("authUid", profile.uid);
            sessionStorage.setItem("userRole", profile.role);
            sessionStorage.setItem("instituteId", profile.instituteId);
            sessionStorage.setItem("userEmail", profile.email);

            if (isLoginPage) {
                console.log("Authentication successful! Redirecting to index.html...");
                window.location.replace("index.html");
            } else if (typeof callback === "function") {
                callback(profile);
            }
        } catch (err) {
            console.error("Profile authorization error:", err);
            clearAuthSession();
            await signOut(auth);
            if (isLoginPage) {
                showAuthMessage("Authentication service error. Please try again later.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Sign In to Dashboard";
                }
            } else {
                window.location.replace("login.html");
            }
        }
    });
}

// Automatically monitor if we are on the login page
if (isLoginPage) {
    monitorAuthState();
}

// -------------------------------------------------------------
// 3. Logout Function (Exported for app.js and attached to window)
// -------------------------------------------------------------
export async function logoutUser() {
    try {
        clearAuthSession();
        await signOut(auth);
        window.location.replace("login.html");
    } catch (err) {
        console.error("Logout error:", err);
        window.location.replace("login.html");
    }
}

window.handleLogout = logoutUser;
window.logoutUser = logoutUser;
