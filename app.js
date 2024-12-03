// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { 
  getFirestore, 
  setDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkb-WBCHIa6DCEuMzELE4FBsYwKhR5fAw",
  authDomain: "date-a-deafie.firebaseapp.com",
  projectId: "date-a-deafie",
  storageBucket: "date-a-deafie.appspot.com",
  messagingSenderId: "1028508036545",
  appId: "1:1028508036545:web:cb58d6825235b476761340"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Sign-Up Function
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert("Account created successfully!");
    await saveProfile(user);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Log-In Function
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Save Profile
async function saveProfile(user) {
  const file = document.getElementById("profile-pic").files[0];
  const bio = document.getElementById("bio").value;

  if (!file || !bio) {
    alert("Please upload a picture and write a bio.");
    return;
  }

  try {
    const storageRef = ref(storage, `profiles/${user.uid}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    await setDoc(doc(db, "profiles", user.uid), {
      bio,
      imageUrl,
      email: user.email,
    });

    alert("Profile saved successfully!");
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Monitor Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("profile-section").style.display = "block";
  } else {
    document.getElementById("profile-section").style.display = "none";
  }
});

// Export functions for HTML
window.signUp = signUp;
window.login = login;
window.saveProfile = saveProfile;
