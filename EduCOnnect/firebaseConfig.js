// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBqM4gWsG-25a6j7u1yzu-OELuYAC_bfKA",
  authDomain: "educonnectlms.firebaseapp.com",
  projectId: "educonnectlms",
  storageBucket: "educonnectlms.appspot.com",
  messagingSenderId: "834219794524",
  appId: "1:834219794524:android:6759ac73cc66cb452c0699",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export auth, db, and storage for use in other parts of the app
export { auth, db, storage };
