import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuhj5vkCJ1OWY86XsJqXdgxBscynUMmvA",
  authDomain: "phncptweb.firebaseapp.com",
  projectId: "phncptweb",
  storageBucket: "phncptweb.firebasestorage.app",
  messagingSenderId: "281131798475",
  appId: "1:281131798475:web:05f7bfba6826f6e130b04e",
  measurementId: "G-L7W59WP7EV",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.phncptFirebase = {
  app,
  db,
  analytics: null,
};

isSupported()
  .then((supported) => {
    if (!supported) return;
    window.phncptFirebase.analytics = getAnalytics(app);
  })
  .catch(() => {
    window.phncptFirebase.analytics = null;
  });

export { app, db };
