import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgDLKhfddjU2ARmJanQjEyqMOugsVCJm8",
  authDomain: "nerov-express.firebaseapp.com",
  projectId: "nerov-express",
  storageBucket: "nerov-express.firebasestorage.app",
  messagingSenderId: "422247194954",
  appId: "1:422247194954:web:e5b5b1e2cd376675d661b3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;