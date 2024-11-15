import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";

import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc, 
  addDoc, 
  collection 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";




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

// Function to show messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
      messageDiv.style.opacity = 0;
    }, 5000);
  } else {
    console.log(`Element with ID ${divId} not found`);
  }
}

// Prevent back button from returning to authenticated pages
window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
  window.location.href = 'index.html'; // Redirect to index.html
};

// Event listener for password recovery link
const recoverPasswordLink = document.getElementById("recoverPasswordLink");
const passwordRecoveryModal = document.getElementById("passwordRecoveryModal");
const closeModalButton = document.getElementById("closeModal");

if (recoverPasswordLink) {
  recoverPasswordLink.addEventListener("click", (event) => {
    event.preventDefault();
    passwordRecoveryModal.style.display = "block"; // Show the password recovery modal
  });
}

if (closeModalButton) {
  closeModalButton.addEventListener("click", () => {
    passwordRecoveryModal.style.display = "none"; // Hide the modal
  });
}

// Event listener for sending recovery email
const sendRecoveryEmailButton = document.getElementById("sendRecoveryEmail");
if (sendRecoveryEmailButton) {
  sendRecoveryEmailButton.addEventListener("click", async (event) => {
    const recoverEmail = document.getElementById("recoverEmail").value;

    try {
      await sendPasswordResetEmail(auth, recoverEmail);
      showMessage("Password reset email sent!", "recoverMessage");
      passwordRecoveryModal.style.display = "none"; // Hide the modal after sending
    } catch (error) {
      console.error("Error sending password reset email:", error);
      showMessage(error.message, "recoverMessage");
    }
  });
}

// Event listener for sign-up
const signUp = document.getElementById("submitSignUp");
if (signUp) {
  signUp.addEventListener("click", async (event) => {
    event.preventDefault();
    const password = document.getElementById("rPassword").value;

    // Validate the password against the regex
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordPattern.test(password)) {
      showMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 6 characters long.",
        "signUpMessage"
      );
      return; // Stop the sign-up process
    }

    const email = document.getElementById("rEmail").value;
    const firstName = document.getElementById("fName").value;
    const lastName = document.getElementById("lName").value;

    // Proceed with user creation
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Send email verification
      await sendEmailVerification(user);
      showMessage("Verification email sent! Please check your inbox.", "signUpMessage");
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
      };

      // Save user data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userData);

      showMessage("Account Created Successfully", "signUpMessage");
      window.location.replace("index.html"); // Redirect to index page
    } catch (error) {
      console.error("Error during sign-up:", error);
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        showMessage("Email Address Already Exists !!!", "signUpMessage");
      } else {
        showMessage("Unable to create user", "signUpMessage");
      }
    }
  });
}

// Event listener for sign-in
const signIn = document.getElementById("submitSignIn");
if (signIn) {
  signIn.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        showMessage("Login is successful", "signInMessage");
        const user = userCredential.user;
        localStorage.setItem("loggedInUserId", user.uid);

        // Retrieve user data from Firestore
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              // Store user data in localStorage
              localStorage.setItem("userData", JSON.stringify(userData));
              window.location.replace("homepage.html"); // Redirect to homepage
            } else {
              console.log("No such document!");
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });
      })
      .catch((error) => {
        console.error("Error during sign-in:", error);
        const errorCode = error.code;
        if (errorCode === "auth/wrong-password") {
          showMessage("Incorrect Email or Password", "signInMessage");
        } else if (errorCode === "auth/user-not-found") {
          showMessage("Account does not Exist", "signInMessage");
        } else {
          showMessage("Unable to log in", "signInMessage");
        }
      });
  });
}


// Add this code for handling feedback form submissions
const feedbackForm = document.getElementById("feedbackForm");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload on form submit
    
    // Get the form input values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const feedback = document.getElementById("feedback").value;

    try {
      // Store the feedback data in Firestore
      await addDoc(collection(db, "feedback"), {
        name: name,
        email: email,
        feedback: feedback,
      });

      // Show success message
      showMessage("Feedback submitted successfully!", "feedbackMessage");
      
      // Reset form after submission
      feedbackForm.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showMessage("Error submitting feedback. Please try again.", "feedbackMessage");
    }
  });
}
// Wait until the DOM content is loaded
document.addEventListener('DOMContentLoaded', async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userId = user.uid;

      try {
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Combine firstName and lastName if needed, or use the correct field
          const userName = `${userData.firstName} ${userData.lastName}`; 
          document.getElementById('user-name').value = userName;
        } else {
          console.error("No such user document in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    } else {
      // Redirect to login page if not logged in
      window.location.href = 'login/index.html';
    }
  });

  // Profile modal close button
  document.getElementById('profile-close').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('hidden');
  });
});
