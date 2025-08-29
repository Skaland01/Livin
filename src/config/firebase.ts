import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCB3A1aTHoUEdOtFQ7jFKnb_RO3GElZkGM",
  authDomain: "livin-ea531.firebaseapp.com",
  projectId: "livin-ea531",
  storageBucket: "livin-ea531.appspot.com",
  messagingSenderId: "271825512148",
  appId: "1:271825512148:web:7608e88d5acfe8a5dbbd41",
};

// Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;
