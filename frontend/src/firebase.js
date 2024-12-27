// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ecommerce-aditya.firebaseapp.com",
  projectId: "ecommerce-aditya",
  storageBucket: "ecommerce-aditya.firebasestorage.app",
  messagingSenderId: "195523137332",
  appId: "1:195523137332:web:2a130d059842d009589f61"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);