import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRfJfRtUTuoPo8zahhu6VyIEX_9JPYs5I",
  authDomain: "music-online-4ccee.firebaseapp.com",
  projectId: "music-online-4ccee",
  storageBucket: "music-online-4ccee.firebasestorage.app",
  messagingSenderId: "171272371901",
  appId: "1:171272371901:web:22ab5807acb33a9a3781d4",
  measurementId: "G-SBKBPTDMGM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);