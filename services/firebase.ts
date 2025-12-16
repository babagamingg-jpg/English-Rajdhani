import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiwel9c7zxmEuiqm9xXD-tMOzRnT-rhsQ",
  authDomain: "english-rajdhani.firebaseapp.com",
  projectId: "english-rajdhani",
  storageBucket: "english-rajdhani.firebasestorage.app",
  messagingSenderId: "266815113204",
  appId: "1:266815113204:web:6d9fd837e996c8365adba1",
  measurementId: "G-CLC7BJ5F20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase App initialized with project:", firebaseConfig.projectId);

let analytics: any = null;

// Initialize analytics conditionally and asynchronously
// This prevents crashes if analytics is not supported in the current environment
const initAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully");
    }
  } catch (err) {
    console.warn("Firebase Analytics initialization skipped:", err);
  }
};

initAnalytics();

export { app, analytics };