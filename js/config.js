// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2Zi40wsyBoTeXb2syXvrogTb56lAVjk0",
  authDomain: "pcp-2e388.firebaseapp.com",
  databaseURL: "https://pcp-2e388-default-rtdb.firebaseio.com",
  projectId: "pcp-2e388",
  storageBucket: "pcp-2e388.firebasestorage.app",
  messagingSenderId: "725540904176",
  appId: "1:725540904176:web:5b60009763c36bb12d7635",
  measurementId: "G-G4S09PBEFB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const database = firebase.database();
const storage = firebase.storage();
