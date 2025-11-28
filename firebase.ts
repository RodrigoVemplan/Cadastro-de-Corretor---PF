import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzNjBd_iJBJDK7aK8Wp99sbstR5-FdDmc",
  authDomain: "dbcadcorretor.firebaseapp.com",
  projectId: "dbcadcorretor",
  storageBucket: "dbcadcorretor.firebasestorage.app",
  messagingSenderId: "333735818118",
  appId: "1:333735818118:web:6d7ed992fedc4a94aff207"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };