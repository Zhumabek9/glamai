// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABX4OB85cj0Mi_-AwQb07E5M7DGMiaagw",
  authDomain: "glamai-353ae.firebaseapp.com",
  projectId: "glamai-353ae",
  storageBucket: "glamai-353ae.firebasestorage.app",
  messagingSenderId: "920772627650",
  appId: "1:920772627650:web:863353558e83ac2136ff5b",
  measurementId: "G-XKKW045B7P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
