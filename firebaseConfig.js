import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGvukcOdk1WRX0ulz4GEgOjsXIQ7QjpjU",
  authDomain: "transaction-d894d.firebaseapp.com",
  projectId: "transaction-d894d",
  storageBucket: "transaction-d894d.firebasestorage.app",
  messagingSenderId: "25870223277",
  appId: "1:25870223277:web:4c01362c860ea915acc324",
  measurementId: "G-VGN95SMHPV"
  };

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };