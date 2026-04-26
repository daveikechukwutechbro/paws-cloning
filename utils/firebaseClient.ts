import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBVwiJqJ4jbl07v-QzApLat4dAZ8Sj-kIQ",
  authDomain: "paws-clone.firebaseapp.com",
  projectId: "paws-clone",
  storageBucket: "paws-clone.firebasestorage.app",
  messagingSenderId: "1056285653802",
  appId: "1:1056285653802:web:59bdf8c8776bf4486b3c53",
  measurementId: "G-E6J3SK8X5R"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)