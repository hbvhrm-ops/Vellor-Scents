// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHAcUzQZe-D8Uk_HV5CgxouLmS5gsoneo",
  authDomain: "vellor-scents.firebaseapp.com",
  projectId: "vellor-scents",
  storageBucket: "vellor-scents.firebasestorage.app",
  messagingSenderId: "250314839857",
  appId: "1:250314839857:web:837e8f9226170cada88210",
  measurementId: "G-N9YNRHL9V2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);