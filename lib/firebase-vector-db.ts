import { collection, doc, getDocs, addDoc, query, where, orderBy, limit, getDoc } from "firebase/firestore"
import { db } from "./firebase-config"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini for embeddings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Vector database interfaces
export interface Hotel {
  id?: string
  name: string
  location: string
  city: string
  country: string
  description: string
  amenities: string[]
  price_range: "budget" | "mid" | "luxury"
  rating: number
  coordinates: {
    lat: number
    lng: number
  }
  images: string[]
  room_types: string[]
  embedding?: number[]
  created_at: Date
}

export interface User {
  id?: string
  email: string
  name: string
  preferences: {
    travel_style: string[]
    interests: string[]
    budget_range: "budget" | "mid" | "luxury"
    accommodation_type: string[]
    cuisine_preferences: string[]
  }
  travel_history: {
    destination: string
    dates: string[]
    rating: number
  }[]
  embedding?: number[]
  created_at: Date
}

export interface Attraction {
  id?: string
  name: string
  location: string
  city: string
  country: string
  description: string
  category: string
  price: number
  rating: number
  coordinates: {
    lat: number
    lng: number
  }
  opening_hours: string
  best_time_to_visit: string[]
  embedding?: number[]
  created_at: Date
}

// Generate embeddings using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    const result = await model.embedContent(text)
    return result.embedding.values
  } catch (error) {
    console.error("[v0] Error generating embedding:", error)
    // Return a mock embedding for development
    return Array.from({ length: 768 }, () => Math.random())
  }
}

// Calculate cosine similarity between vectors
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// Hotel collection operations
export class HotelVectorDB {
  private collectionName = "hotels"

  async addHotel(hotel: Omit<Hotel, "id" | "embedding" | "created_at">): Promise<string> {
    try {
      // Generate embedding from hotel description and amenities
      const embeddingText = `${hotel.name} ${hotel.description} ${hotel.amenities.join(" ")} ${hotel.location}`
      const embedding = await generateEmbedding(embeddingText)

      const hotelData: Hotel = {
        ...hotel,
        embedding,
        created_at: new Date(),
      }

      const docRef = await addDoc(collection(db, this.collectionName), hotelData)
      console.log("[v0] Hotel added with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("[v0] Error adding hotel:", error)
      throw error
    }
  }

  async searchHotels(searchQuery: string, city: string, priceRange?: string, limit_count = 10): Promise<Hotel[]> {
    try {
      // Generate embedding for search query
      const queryEmbedding = await generateEmbedding(searchQuery)

      // Get all hotels in the city
      const hotelsQuery = query(
        collection(db, this.collectionName),
        where("city", "==", city),
        ...(priceRange ? [where("price_range", "==", priceRange)] : []),
        orderBy("rating", "desc"),
        limit(50), // Get more for vector similarity filtering
      )

      const snapshot = await getDocs(hotelsQuery)
      const hotels: Hotel[] = []

      snapshot.forEach((doc) => {
        const data = doc.data() as Hotel
        hotels.push({ ...data, id: doc.id })
      })

      // Calculate similarity scores and sort
      const hotelsWithSimilarity = hotels
        .filter((hotel) => hotel.embedding && hotel.embedding.length > 0)
        .map((hotel) => ({
          ...hotel,
          similarity: cosineSimilarity(queryEmbedding, hotel.embedding!),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit_count)

      console.log(`[v0] Found ${hotelsWithSimilarity.length} hotels for query: ${searchQuery}`)
      return hotelsWithSimilarity
    } catch (error) {
      console.error("[v0] Error searching hotels:", error)
      return []
    }
  }

  async getHotelsByLocation(city: string, priceRange?: string): Promise<Hotel[]> {
    try {
      const hotelsQuery = query(
        collection(db, this.collectionName),
        where("city", "==", city),
        ...(priceRange ? [where("price_range", "==", priceRange)] : []),
        orderBy("rating", "desc"),
        limit(20),
      )

      const snapshot = await getDocs(hotelsQuery)
      const hotels: Hotel[] = []

      snapshot.forEach((doc) => {
        const data = doc.data() as Hotel
        hotels.push({ ...data, id: doc.id })
      })

      return hotels
    } catch (error) {
      console.error("[v0] Error getting hotels by location:", error)
      return []
    }
  }
}

// User collection operations
export class UserVectorDB {
  private collectionName = "users"

  async addUser(user: Omit<User, "id" | "embedding" | "created_at">): Promise<string> {
    try {
      // Generate embedding from user preferences
      const embeddingText = `${user.preferences.travel_style.join(" ")} ${user.preferences.interests.join(" ")} ${user.preferences.cuisine_preferences.join(" ")}`
      const embedding = await generateEmbedding(embeddingText)

      const userData: User = {
        ...user,
        embedding,
        created_at: new Date(),
      }

      const docRef = await addDoc(collection(db, this.collectionName), userData)
      console.log("[v0] User added with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("[v0] Error adding user:", error)
      throw error
    }
  }

  async findSimilarUsers(userId: string, limit_count = 5): Promise<User[]> {
    try {
      // Get the target user
      const userDoc = await getDoc(doc(db, this.collectionName, userId))
      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      const targetUser = userDoc.data() as User
      if (!targetUser.embedding) {
        throw new Error("User embedding not found")
      }

      // Get all other users
      const usersQuery = query(collection(db, this.collectionName), limit(100))
      const snapshot = await getDocs(usersQuery)
      const users: User[] = []

      snapshot.forEach((doc) => {
        if (doc.id !== userId) {
          const data = doc.data() as User
          users.push({ ...data, id: doc.id })
        }
      })

      // Calculate similarity and sort
      const similarUsers = users
        .filter((user) => user.embedding && user.embedding.length > 0)
        .map((user) => ({
          ...user,
          similarity: cosineSimilarity(targetUser.embedding!, user.embedding!),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit_count)

      console.log(`[v0] Found ${similarUsers.length} similar users`)
      return similarUsers
    } catch (error) {
      console.error("[v0] Error finding similar users:", error)
      return []
    }
  }
}

// Attraction collection operations
export class AttractionVectorDB {
  private collectionName = "attractions"

  async addAttraction(attraction: Omit<Attraction, "id" | "embedding" | "created_at">): Promise<string> {
    try {
      const embeddingText = `${attraction.name} ${attraction.description} ${attraction.category} ${attraction.location}`
      const embedding = await generateEmbedding(embeddingText)

      const attractionData: Attraction = {
        ...attraction,
        embedding,
        created_at: new Date(),
      }

      const docRef = await addDoc(collection(db, this.collectionName), attractionData)
      console.log("[v0] Attraction added with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("[v0] Error adding attraction:", error)
      throw error
    }
  }

  async searchAttractions(
    searchQuery: string,
    city: string,
    category?: string,
    limit_count = 10,
  ): Promise<Attraction[]> {
    try {
      const queryEmbedding = await generateEmbedding(searchQuery)

      const attractionsQuery = query(
        collection(db, this.collectionName),
        where("city", "==", city),
        ...(category ? [where("category", "==", category)] : []),
        orderBy("rating", "desc"),
        limit(50),
      )

      const snapshot = await getDocs(attractionsQuery)
      const attractions: Attraction[] = []

      snapshot.forEach((doc) => {
        const data = doc.data() as Attraction
        attractions.push({ ...data, id: doc.id })
      })

      const attractionsWithSimilarity = attractions
        .filter((attraction) => attraction.embedding && attraction.embedding.length > 0)
        .map((attraction) => ({
          ...attraction,
          similarity: cosineSimilarity(queryEmbedding, attraction.embedding!),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit_count)

      console.log(`[v0] Found ${attractionsWithSimilarity.length} attractions for query: ${searchQuery}`)
      return attractionsWithSimilarity
    } catch (error) {
      console.error("[v0] Error searching attractions:", error)
      return []
    }
  }
}

// Initialize database instances
export const hotelDB = new HotelVectorDB()
export const userDB = new UserVectorDB()
export const attractionDB = new AttractionVectorDB()
