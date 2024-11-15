// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB3Mq-s1c09z9wM5rpIMAo8_IOng2w8H1A",
    authDomain: "gfgdb-47f3e.firebaseapp.com",
    projectId: "gfgdb-47f3e",
    storageBucket: "gfgdb-47f3e.appspot.com",
    messagingSenderId: "591404932384",
    appId: "1:591404932384:web:5be7ce56aed0a8ce1f4b45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Get the logged-in user ID from localStorage
const loggedInUserId = localStorage.getItem('loggedInUserId');

// Fetch user data
if (loggedInUserId) {
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef).then((doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            // Populate the user profile form with the retrieved data
            document.getElementById('username').value = userData.firstName + " " + userData.lastName;
            document.getElementById('email').value = userData.email;

            // If you have age and gender fields, uncomment the following lines:
            // document.getElementById('age').value = userData.age || ''; // Ensure age is set or empty
            // document.getElementById('gender').value = userData.gender || ''; // Ensure gender is set or empty
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
    });
} else {
    console.log("User not logged in.");
}

// Logout functionality
const logoutButton = document.getElementById('logout-btn');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            localStorage.removeItem('loggedInUserId'); // Remove user ID from localStorage
            window.location.href = 'MediMate/index.html'; // Redirect to login page
        }).catch((error) => {
            console.error("Error during logout:", error);
        });
    });
} else {
    console.log("Logout button not found");
}