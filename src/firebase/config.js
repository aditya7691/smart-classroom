import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// We will replace these placeholders with your actual project keys later
const firebaseConfig = {
  apiKey: "AIzaSyBdqByOOJil1WkNDiWOlAl3rplw4cdArMw",
  authDomain: "smart-classroom-7339b.firebaseapp.com",
  projectId: "smart-classroom-7339b",
  storageBucket: "smart-classroom-7339b.firebasestorage.app",
  messagingSenderId: "477824069483",
  appId: "1:477824069483:web:3bcbf121fec6b21470a62e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Database to use anywhere in our React pages
export const auth = getAuth(app);
export const db = getFirestore(app);