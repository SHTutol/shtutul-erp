// Fix: Removing leading empty lines and ensuring standard Firebase v9 modular imports.
// The error "Module 'firebase/app' has no exported member 'initializeApp'" is resolved by 
// using the correct modular SDK import pattern for Firebase 9+.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp2HnZJ7McLLYHUjT9V0t850a3rQ502B4",
  authDomain: "sim-voucher-erp.firebaseapp.com",
  projectId: "sim-voucher-erp",
  storageBucket: "sim-voucher-erp.firebasestorage.app",
  messagingSenderId: "852239980312",
  appId: "1:852239980312:web:4b09be2a19ffa10cc8706d",
  measurementId: "G-XQT21STDT9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
