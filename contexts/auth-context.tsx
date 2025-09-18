"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase-config"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  createdAt: string
  updatedAt?: string
  tripCount: number
  xpPoints: number
  level: number
  streak: number
  bio?: string
  location?: string
  travelStyle?: string
  favoriteDestination?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] AuthProvider initializing...")
    console.log("[v0] Firebase config check:", {
      hasAuth: !!auth,
      hasDb: !!db,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[v0] Auth state changed:", { user: !!user, uid: user?.uid })
      setUser(user)

      try {
        if (user) {
          console.log("[v0] Fetching user profile...")
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            console.log("[v0] User profile found")
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            console.log("[v0] Creating new user profile...")
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              createdAt: new Date().toISOString(),
              tripCount: 0,
              xpPoints: 100,
              level: 1,
              streak: 0,
            }

            await setDoc(userDocRef, newProfile)
            setUserProfile(newProfile)
            console.log("[v0] New user profile created")
          }
        } else {
          console.log("[v0] No user, clearing profile")
          setUserProfile(null)
        }
      } catch (error) {
        console.error("[v0] Error in auth state change:", error)
        setUserProfile(null)
      } finally {
        console.log("[v0] Setting loading to false")
        setLoading(false)
      }
    })

    const timeoutId = setTimeout(() => {
      console.log("[v0] Auth timeout reached, forcing loading to false")
      setLoading(false)
    }, 10000) // 10 second timeout

    return () => {
      unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return

    try {
      const userDocRef = doc(db, "users", user.uid)
      const updatedProfile = { ...userProfile, ...updates, updatedAt: new Date().toISOString() }

      await setDoc(userDocRef, updatedProfile, { merge: true })
      setUserProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
