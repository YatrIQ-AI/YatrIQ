import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("[v0] Firebase config:", {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
})

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const hotels = [
  {
    name: "Luxury Beach Resort Goa",
    location: {
      city: "Goa",
      state: "Goa",
      country: "India",
      coordinates: { lat: 15.2993, lng: 74.124 },
    },
    description:
      "A stunning beachfront resort offering luxury accommodations with direct beach access and world-class amenities.",
    pricePerNight: 8500,
    rating: 4.8,
    amenities: ["Beach Access", "Swimming Pool", "Spa", "Restaurant", "Bar", "WiFi", "Room Service"],
    cuisine: {
      specialties: ["Goan Fish Curry", "Bebinca", "Prawn Balchão", "Feni Cocktails"],
      restaurants: [
        {
          name: "Coastal Spice",
          type: "Goan Seafood",
          description: "Fresh seafood with authentic Goan spices",
        },
        {
          name: "Sunset Bar",
          type: "Beach Bar",
          description: "Cocktails and light bites with ocean views",
        },
      ],
    },
    images: ["/luxury-beach-resort-goa.jpg"],
    availability: true,
  },
  {
    name: "Mountain View Hotel Manali",
    location: {
      city: "Manali",
      state: "Himachal Pradesh",
      country: "India",
      coordinates: { lat: 32.2396, lng: 77.1887 },
    },
    description: "Cozy mountain retreat with breathtaking Himalayan views and traditional Himachali hospitality.",
    pricePerNight: 4500,
    rating: 4.5,
    amenities: ["Mountain Views", "Fireplace", "Restaurant", "WiFi", "Parking", "Room Heater"],
    cuisine: {
      specialties: ["Dham", "Chana Madra", "Babru", "Aktori", "Himachali Trout"],
      restaurants: [
        {
          name: "Mountain Kitchen",
          type: "Himachali Cuisine",
          description: "Traditional mountain food with local ingredients",
        },
        {
          name: "Café Altitude",
          type: "Continental & Indian",
          description: "Warm beverages and comfort food",
        },
      ],
    },
    images: ["/mountain-hotel-manali-himachal.jpg"],
    availability: true,
  },
  {
    name: "Royal Palace Hotel Jaipur",
    location: {
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      coordinates: { lat: 26.9124, lng: 75.7873 },
    },
    description:
      "Experience royal luxury in this heritage palace hotel with traditional Rajasthani architecture and modern amenities.",
    pricePerNight: 12000,
    rating: 4.9,
    amenities: ["Heritage Architecture", "Swimming Pool", "Spa", "Multiple Restaurants", "Cultural Shows", "WiFi"],
    cuisine: {
      specialties: ["Dal Baati Churma", "Laal Maas", "Gatte ki Sabzi", "Ker Sangri", "Ghevar"],
      restaurants: [
        {
          name: "Maharaja's Dining",
          type: "Royal Rajasthani",
          description: "Authentic royal cuisine in a palatial setting",
        },
        {
          name: "Courtyard Café",
          type: "Multi-cuisine",
          description: "International and Indian dishes in a beautiful courtyard",
        },
      ],
    },
    images: ["/rajasthani-palace-hotel-jaipur.jpg"],
    availability: true,
  },
]

async function addHotelsToFirestore() {
  try {
    console.log("[v0] Starting to add hotels to Firestore...")

    for (const hotel of hotels) {
      console.log(`[v0] Adding hotel: ${hotel.name}`)
      const docRef = await addDoc(collection(db, "hotels"), hotel)
      console.log(`[v0] Hotel added with ID: ${docRef.id}`)
    }

    console.log("[v0] All hotels added successfully!")

    // Verify the data was added
    console.log("[v0] Verifying data...")
    const querySnapshot = await getDocs(collection(db, "hotels"))
    console.log(`[v0] Total hotels in database: ${querySnapshot.size}`)

    querySnapshot.forEach((doc) => {
      console.log(`[v0] Hotel: ${doc.data().name} (ID: ${doc.id})`)
    })

    console.log("\n=== WHERE TO FIND YOUR DATA IN FIREBASE CONSOLE ===")
    console.log("1. Go to https://console.firebase.google.com/")
    console.log(`2. Select your project: ${firebaseConfig.projectId}`)
    console.log('3. Click on "Firestore Database" in the left sidebar')
    console.log('4. Look for the "hotels" collection')
    console.log("5. Click on the collection to see all hotel documents")
    console.log("===============================================\n")
  } catch (error) {
    console.error("[v0] Error adding hotels:", error)
    console.error("[v0] Error details:", error.message)
  }
}

addHotelsToFirestore()
