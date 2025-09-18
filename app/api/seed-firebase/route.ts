import { type NextRequest, NextResponse } from "next/server"
import { hotelDB, attractionDB } from "@/lib/firebase-vector-db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting Firebase database seeding...")

    // Seed sample hotels
    const sampleHotels = [
      {
        name: "Grand Palace Hotel Paris",
        location: "15 Rue de Rivoli, Paris",
        city: "paris",
        country: "France",
        description:
          "Luxury hotel in the heart of Paris with stunning views of the Louvre. Features elegant rooms, fine dining, and world-class service.",
        amenities: ["WiFi", "Restaurant", "Spa", "Gym", "Concierge", "Room Service"],
        price_range: "luxury" as const,
        rating: 4.8,
        coordinates: { lat: 48.8566, lng: 2.3522 },
        images: ["/luxury-hotel-paris.png"],
        room_types: ["Standard", "Deluxe", "Suite", "Presidential Suite"],
      },
      {
        name: "Tokyo Central Inn",
        location: "2-1-1 Shibuya, Tokyo",
        city: "tokyo",
        country: "Japan",
        description:
          "Modern business hotel in Shibuya with easy access to shopping and dining. Perfect for both business and leisure travelers.",
        amenities: ["WiFi", "Restaurant", "Business Center", "Laundry"],
        price_range: "mid" as const,
        rating: 4.3,
        coordinates: { lat: 35.6762, lng: 139.6503 },
        images: ["/placeholder-esx3k.png"],
        room_types: ["Standard", "Business", "Family"],
      },
      {
        name: "Budget Stay NYC",
        location: "123 Broadway, New York",
        city: "new york",
        country: "USA",
        description:
          "Affordable accommodation in Manhattan with clean rooms and basic amenities. Great location for exploring the city.",
        amenities: ["WiFi", "24h Reception", "Luggage Storage"],
        price_range: "budget" as const,
        rating: 4.0,
        coordinates: { lat: 40.7589, lng: -73.9851 },
        images: ["/budget-hotel-new-york.jpg"],
        room_types: ["Standard", "Shared"],
      },
    ]

    // Seed sample attractions
    const sampleAttractions = [
      {
        name: "Eiffel Tower",
        location: "Champ de Mars, Paris",
        city: "paris",
        country: "France",
        description:
          "Iconic iron lattice tower and symbol of Paris. Offers breathtaking views of the city from multiple observation decks.",
        category: "Landmark",
        price: 25,
        rating: 4.6,
        coordinates: { lat: 48.8584, lng: 2.2945 },
        opening_hours: "9:30 AM - 11:45 PM",
        best_time_to_visit: ["Morning", "Evening"],
      },
      {
        name: "Senso-ji Temple",
        location: "2-3-1 Asakusa, Tokyo",
        city: "tokyo",
        country: "Japan",
        description:
          "Ancient Buddhist temple and Tokyo's oldest temple. Famous for its Thunder Gate and traditional shopping street.",
        category: "Culture",
        price: 0,
        rating: 4.4,
        coordinates: { lat: 35.7148, lng: 139.7967 },
        opening_hours: "6:00 AM - 5:00 PM",
        best_time_to_visit: ["Morning", "Afternoon"],
      },
      {
        name: "Central Park",
        location: "New York, NY",
        city: "new york",
        country: "USA",
        description:
          "Large public park in Manhattan offering green space, lakes, walking paths, and recreational activities.",
        category: "Nature",
        price: 0,
        rating: 4.7,
        coordinates: { lat: 40.7829, lng: -73.9654 },
        opening_hours: "6:00 AM - 1:00 AM",
        best_time_to_visit: ["Morning", "Afternoon", "Evening"],
      },
    ]

    // Add hotels to Firebase
    for (const hotel of sampleHotels) {
      await hotelDB.addHotel(hotel)
    }

    // Add attractions to Firebase
    for (const attraction of sampleAttractions) {
      await attractionDB.addAttraction(attraction)
    }

    console.log("[v0] Firebase seeding completed successfully")

    return NextResponse.json({
      message: "Firebase database seeded successfully",
      hotels_added: sampleHotels.length,
      attractions_added: sampleAttractions.length,
    })
  } catch (error) {
    console.error("[v0] Error seeding Firebase:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
