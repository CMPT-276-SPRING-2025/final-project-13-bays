// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
// import "firebase/auth";
import { getAuth } from "firebase/auth"
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA3W4jbB2qEqCqXb9kI7UCE43B0eEUuXas",
  authDomain: "tabmark-d081a.firebaseapp.com",
  projectId: "tabmark-d081a",
  storageBucket: "tabmark-d081a.firebasestorage.app",
  messagingSenderId: "954155850318",
  appId: "1:954155850318:web:ecfdef2ffeefc1d355411f",
  measurementId: "G-2K8B7BGKH3"
};




const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)