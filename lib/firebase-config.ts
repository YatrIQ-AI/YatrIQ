import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("[v0] Firebase config validation:", {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingSenderId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
})

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("[v0] Missing required Firebase environment variables")
  throw new Error("Missing required Firebase environment variables")
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
  console.log("[v0] Firebase app initialized successfully")
} catch (error) {
  console.error("[v0] Error initializing Firebase app:", error)
  throw error
}

// Initialize Firestore
let db
try {
  db = getFirestore(app)
  console.log("[v0] Firestore initialized successfully")
} catch (error) {
  console.error("[v0] Error initializing Firestore:", error)
  throw error
}

// Initialize Auth
let auth
try {
  auth = getAuth(app)
  console.log("[v0] Firebase Auth initialized successfully")
} catch (error) {
  console.error("[v0] Error initializing Firebase Auth:", error)
  throw error
}

export { db, auth }

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    connectFirestoreEmulator(db, "localhost", 8080)
    console.log("[v0] Connected to Firestore emulator")
  } catch (error) {
    console.log("[v0] Firestore emulator already connected or not available")
  }
}

export default app
