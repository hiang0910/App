// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRFJfRtUTuoPo0zahhu6VyIEX_9JPYs5I",
  authDomain: "music-online-4ccee.firebaseapp.com",
  projectId: "music-online-4ccee",
  storageBucket: "music-online-4ccee.firebasestorage.app",
  messagingSenderId: "171272371901",
  appId: "1:171272371901:web:22ab5807acb33a9a3781d4",
  measurementId: "G-SBKBPTDMGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);