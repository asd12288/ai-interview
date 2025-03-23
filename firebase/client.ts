// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_muncBnUqeMo-Y3eBi_dKcFP-yfMSXlI",
  authDomain: "prepwise-9ab62.firebaseapp.com",
  projectId: "prepwise-9ab62",
  storageBucket: "prepwise-9ab62.firebasestorage.app",
  messagingSenderId: "610478245201",
  appId: "1:610478245201:web:51eaa8d3736a4cb89dff70",
  measurementId: "G-FNWSZS636H",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
