
// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBE8R-KaQWBSuTfclXkCftcuYz01ugcNt8",
  authDomain: "wearehere-ed6c4.firebaseapp.com",
  databaseURL: "https://wearehere-ed6c4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wearehere-ed6c4",
  storageBucket: "wearehere-ed6c4.firebasestorage.app",
  messagingSenderId: "533763300792",
  appId: "1:533763300792:web:499f8830d489b4b0fe034d"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
