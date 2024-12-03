// Firebase Initialization
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let profiles = [];
let currentIndex = 0;
let currentMatch = null;

// Sign Up
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  await auth.createUserWithEmailAndPassword(email, password);
  alert("Account created!");
  document.getElementById("profile-section").style.display = "block";
}

// Save Profile
async function saveProfile() {
  const file = document.getElementById("profile-pic").files[0];
  const bio = document.getElementById("bio").value;
  const user = auth.currentUser;

  const storageRef = storage.ref(`profiles/${user.uid}`);
  await storageRef.put(file);
  const imageUrl = await storageRef.getDownloadURL();

  await db.collection("profiles").doc(user.uid).set({ bio, imageUrl, email: user.email });
  alert("Profile saved!");
  loadProfiles();
}

// Load Profiles
async function loadProfiles() {
  const snapshot = await db.collection("profiles").get();
  profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  document.getElementById("swipe-section").style.display = "block";
  displayProfile();
}

// Display Profile
function displayProfile() {
  if (currentIndex < profiles.length) {
    const profile = profiles[currentIndex];
    document.getElementById("profile-image").src = profile.imageUrl;
    document.getElementById("profile-bio").textContent = profile.bio;
  } else {
    alert("No more profiles.");
  }
}

// Swipe Logic
async function swipe(direction) {
  const profile = profiles[currentIndex];
  const user = auth.currentUser;

  if (direction === "up") {
    await db.collection("likes").add({ likedBy: user.uid, likedProfile: profile.id });
    const likeSnapshot = await db.collection("likes")
      .where("likedBy", "==", profile.id)
      .where("likedProfile", "==", user.uid)
      .get();

    if (!likeSnapshot.empty) {
      await db.collection("matches").add({ user1: user.uid, user2: profile.id });
      alert("It's a match!");
      loadMatches();
    }
  }

  currentIndex++;
  displayProfile();
}

// Load Matches
async function loadMatches() {
  const user = auth.currentUser;
  const snapshot = await db.collection("matches").where("user1", "==", user.uid).get();
  const matches = snapshot.docs.map(doc => doc.data().user2);

  const matchesDiv = document.getElementById("matches");
  matchesDiv.innerHTML = "";
  for (const match of matches) {
    const profile = await db.collection("profiles").doc(match).get();
    const data = profile.data();
    const matchDiv = document.createElement("div");
    matchDiv.textContent = data.bio;
    matchDiv.onclick = () => loadChat(match);
    matchesDiv.appendChild(matchDiv);
  }
}

// Load Chat
async function loadChat(matchId) {
  currentMatch = matchId;
  document.getElementById("chat-section").style.display = "block";
  const snapshot = await db.collection("messages")
    .where("from", "in", [auth.currentUser.uid, matchId])
    .where("to", "in", [auth.currentUser.uid, matchId])
    .orderBy("timestamp")
    .get();

  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = snapshot.docs.map(doc => `<p>${doc.data().text}</p>`).join("");
}

// Send Message
async function sendMessage() {
  const text = document.getElementById("
