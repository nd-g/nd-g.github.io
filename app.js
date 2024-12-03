// Import necessary functions from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkb-WBCHIa6DCEuMzELE4FBsYwKhR5fAw",
  authDomain: "date-a-deafie.firebaseapp.com",
  projectId: "date-a-deafie",
  storageBucket: "date-a-deafie.firebasestorage.app",
  messagingSenderId: "1028508036545",
  appId: "1:1028508036545:web:cb58d6825235b476761340"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// User Authentication - Sign Up
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  try {
    // Create new user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert("Account created successfully!");

    // Save the profile in Firestore (after sign up)
    await saveProfile(user);

  } catch (error) {
    alert(error.message);
  }
}

// User Authentication - Log In
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  try {
    // Sign in the user
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully!");

  } catch (error) {
    alert(error.message);
  }
}

// Save Profile (Including Image Upload)
async function saveProfile(user) {
  const file = document.getElementById("profile-pic").files[0]; // Get the profile image
  const bio = document.getElementById("bio").value; // Get the bio text
  
  if (!file || !bio) {
    alert("Please upload a picture and write a bio.");
    return;
  }

  try {
    // Upload the image to Firebase Storage
    const storageRef = ref(storage, `profiles/${user.uid}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef); // Get the uploaded image URL

    // Save the profile data to Firestore
    await setDoc(doc(db, "profiles", user.uid), {
      bio,
      imageUrl,
      email: user.email,
    });

    alert("Profile saved successfully!");
  } catch (error) {
    alert(error.message);
  }
}

// Monitor Authentication State (for handling login/logout)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    console.log("User is logged in: ", user);
    // Show the profile creation section if logged in
    document.getElementById("profile-section").style.display = "block";
  } else {
    // User is logged out
    console.log("No user is logged in.");
    document.getElementById("profile-section").style.display = "none";
  }
});

// Export functions to be used in HTML for user interaction
window.signUp = signUp;
window.login = login;
window.saveProfile = saveProfile;
