"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { Loader2, Check, AlertCircle } from "lucide-react"

const hotelData = [
  {
    name: "Luxury Beach Resort Goa",
    location: {
      city: "Goa",
      state: "Goa",
      country: "India",
      coordinates: { lat: 15.2993, lng: 74.124 },
    },
    description: "A luxurious beachfront resort offering stunning ocean views and world-class amenities.",
    amenities: ["Beach Access", "Swimming Pool", "Spa", "Restaurant", "Bar", "WiFi", "Room Service"],
    priceRange: { min: 8000, max: 15000, currency: "INR" },
    rating: 4.5,
    images: ["/luxury-beach-resort-goa.jpg"],
    cuisine: {
      specialties: ["Goan Fish Curry", "Bebinca", "Prawn Balchão", "Feni Cocktails"],
      types: ["Goan", "Seafood", "Continental", "Indian"],
    },
    foodDescription:
      "Authentic Goan cuisine featuring fresh seafood, coconut-based curries, and traditional Portuguese-influenced dishes.",
  },
  {
    name: "Mountain View Hotel Manali",
    location: {
      city: "Manali",
      state: "Himachal Pradesh",
      country: "India",
      coordinates: { lat: 32.2396, lng: 77.1887 },
    },
    description: "A cozy mountain retreat with breathtaking views of the Himalayas.",
    amenities: ["Mountain Views", "Fireplace", "Restaurant", "WiFi", "Parking", "Room Service"],
    priceRange: { min: 4000, max: 8000, currency: "INR" },
    rating: 4.2,
    images: ["/mountain-hotel-manali-himachal.jpg"],
    cuisine: {
      specialties: ["Himachali Dham", "Chana Madra", "Babru", "Aktori"],
      types: ["Himachali", "North Indian", "Tibetan", "Continental"],
    },
    foodDescription:
      "Traditional Himachali cuisine with hearty mountain dishes, including local specialties and warming comfort food.",
  },
  {
    name: "Royal Palace Hotel Jaipur",
    location: {
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      coordinates: { lat: 26.9124, lng: 75.7873 },
    },
    description: "Experience royal luxury in this heritage palace hotel with traditional Rajasthani architecture.",
    amenities: ["Heritage Architecture", "Swimming Pool", "Spa", "Restaurant", "Bar", "WiFi", "Cultural Shows"],
    priceRange: { min: 10000, max: 20000, currency: "INR" },
    rating: 4.7,
    images: ["/rajasthani-palace-hotel-jaipur.jpg"],
    cuisine: {
      specialties: ["Dal Baati Churma", "Laal Maas", "Gatte ki Sabzi", "Ker Sangri"],
      types: ["Rajasthani", "Royal Indian", "Mughlai", "Continental"],
    },
    foodDescription:
      "Royal Rajasthani cuisine featuring rich gravies, desert specialties, and traditional royal recipes passed down through generations.",
  },
  {
    name: "Backwater Resort Alleppey",
    location: {
      city: "Alleppey",
      state: "Kerala",
      country: "India",
      coordinates: { lat: 9.4981, lng: 76.3388 },
    },
    description: "A serene backwater resort offering houseboat experiences and Kerala's natural beauty.",
    amenities: ["Backwater Views", "Houseboat", "Ayurvedic Spa", "Restaurant", "WiFi", "Fishing"],
    priceRange: { min: 6000, max: 12000, currency: "INR" },
    rating: 4.4,
    images: ["/kerala-backwater-resort-alleppey.jpg"],
    cuisine: {
      specialties: ["Fish Moilee", "Appam with Stew", "Karimeen Fry", "Payasam"],
      types: ["Kerala", "South Indian", "Seafood", "Vegetarian"],
    },
    foodDescription:
      "Authentic Kerala cuisine with coconut-based curries, fresh seafood, and traditional spices served on banana leaves.",
  },
  {
    name: "Desert Camp Jaisalmer",
    location: {
      city: "Jaisalmer",
      state: "Rajasthan",
      country: "India",
      coordinates: { lat: 26.9157, lng: 70.9083 },
    },
    description: "An authentic desert camping experience with luxury tents and camel safaris.",
    amenities: ["Desert Views", "Camel Safari", "Cultural Shows", "Restaurant", "Bonfire", "Stargazing"],
    priceRange: { min: 5000, max: 10000, currency: "INR" },
    rating: 4.3,
    images: ["/desert-hotel-jaisalmer-rajasthan.jpg"],
    cuisine: {
      specialties: ["Pyaaz Kachori", "Mirchi Bada", "Mawa Kachori", "Desert Thali"],
      types: ["Rajasthani", "Desert Cuisine", "Vegetarian", "Traditional"],
    },
    foodDescription:
      "Traditional desert cuisine with water-conserving cooking methods, featuring lentils, dried vegetables, and milk-based sweets.",
  },
  {
    name: "Tea Garden Resort Darjeeling",
    location: {
      city: "Darjeeling",
      state: "West Bengal",
      country: "India",
      coordinates: { lat: 27.036, lng: 88.2627 },
    },
    description: "A charming resort nestled among tea gardens with panoramic mountain views.",
    amenities: ["Tea Garden Views", "Mountain Views", "Restaurant", "WiFi", "Tea Tasting", "Nature Walks"],
    priceRange: { min: 4500, max: 9000, currency: "INR" },
    rating: 4.1,
    images: ["/tea-garden-hotel-darjeeling.jpg"],
    cuisine: {
      specialties: ["Momos", "Thukpa", "Gundruk", "Darjeeling Tea"],
      types: ["Bengali", "Tibetan", "Nepali", "Continental"],
    },
    foodDescription:
      "Hill station cuisine blending Bengali, Tibetan, and Nepali flavors, featuring steamed dumplings, noodle soups, and world-famous tea.",
  },
]

export default function HotelSeeder() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const seedHotels = async () => {
    setIsSeeding(true)
    setStatus("idle")
    setMessage("")

    try {
      console.log("[v0] Starting hotel seeding process...")

      // Check if hotels collection already exists
      const hotelsRef = collection(db, "hotels")
      const existingHotels = await getDocs(hotelsRef)

      if (!existingHotels.empty) {
        setMessage(`Found ${existingHotels.size} existing hotels. Adding new ones...`)
      }

      // Add each hotel to Firestore
      let addedCount = 0
      for (const hotel of hotelData) {
        try {
          const docRef = await addDoc(hotelsRef, {
            ...hotel,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          console.log(`[v0] Added hotel: ${hotel.name} with ID: ${docRef.id}`)
          addedCount++
        } catch (error) {
          console.error(`[v0] Error adding hotel ${hotel.name}:`, error)
        }
      }

      setStatus("success")
      setMessage(`Successfully added ${addedCount} hotels to Firestore!`)
      console.log("[v0] Hotel seeding completed successfully")
    } catch (error) {
      console.error("[v0] Error seeding hotels:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const checkHotels = async () => {
    try {
      const hotelsRef = collection(db, "hotels")
      const snapshot = await getDocs(hotelsRef)
      setMessage(`Found ${snapshot.size} hotels in database`)
      console.log("[v0] Hotels in database:", snapshot.size)
    } catch (error) {
      console.error("[v0] Error checking hotels:", error)
      setMessage(`Error checking hotels: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Hotel Database Seeder</CardTitle>
        <CardDescription>Add sample hotel data to your Firestore database for testing and development.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={seedHotels} disabled={isSeeding} className="flex-1">
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Hotels...
              </>
            ) : (
              "Add Sample Hotels"
            )}
          </Button>

          <Button onClick={checkHotels} variant="outline" disabled={isSeeding}>
            Check Database
          </Button>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              status === "success"
                ? "bg-green-50 text-green-700"
                : status === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {status === "success" && <Check className="h-4 w-4" />}
            {status === "error" && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>
            <strong>What this will add:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>6 sample hotels across different Indian locations</li>
            <li>Each with specific regional cuisine and food specialties</li>
            <li>Complete hotel details including amenities, pricing, and ratings</li>
            <li>Location coordinates for map integration</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
