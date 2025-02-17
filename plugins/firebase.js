import { defineNuxtPlugin } from '#app';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config (replace with your Firebase project configuration)
const firebaseConfig = {
  apiKey: "AIzaSyBNlqed91-FH9vdMNCNJ-_ESifNcJW9ag0",
  authDomain: "gamefo-88804.firebaseapp.com",
  projectId: "gamefo-88804",
  storageBucket: "gamefo-88804.firebasestorage.app",
  messagingSenderId: "301588652419",
  appId: "1:301588652419:web:d56c917ecbb60d015bd6b6",
  measurementId: "G-N2BF4KK96L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default defineNuxtPlugin(nuxtApp => {
  // Initialize Firebase Auth and Firestore with the initialized app
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Provide Firebase services to the app
  nuxtApp.provide('auth', auth);
  nuxtApp.provide('db', db);
});
