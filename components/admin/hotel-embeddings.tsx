"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { Loader2, Check, AlertCircle, Zap } from "lucide-react"

export default function HotelEmbeddings() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const generateEmbeddings = async () => {
    setIsGenerating(true)
    setStatus("idle")
    setMessage("")
    setProgress({ current: 0, total: 0 })

    try {
      console.log("[v0] Starting embedding generation process...")

      // Get all hotels from Firestore
      const hotelsRef = collection(db, "hotels")
      const snapshot = await getDocs(hotelsRef)

      if (snapshot.empty) {
        setStatus("error")
        setMessage("No hotels found in database. Please seed hotels first.")
        return
      }

      const hotels = snapshot.docs
      setProgress({ current: 0, total: hotels.length })
      setMessage(`Found ${hotels.length} hotels. Generating embeddings...`)

      let processedCount = 0
      let errorCount = 0

      for (const hotelDoc of hotels) {
        try {
          const hotelData = hotelDoc.data()

          // Create a comprehensive text representation for embedding
          const embeddingText = [
            hotelData.name,
            hotelData.description,
            hotelData.location.city,
            hotelData.location.state,
            hotelData.foodDescription,
            hotelData.amenities?.join(", "),
            hotelData.cuisine?.specialties?.join(", "),
            hotelData.cuisine?.types?.join(", "),
          ]
            .filter(Boolean)
            .join(". ")

          console.log(`[v0] Generating embedding for: ${hotelData.name}`)

          // Call our embedding API
          const response = await fetch("/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: embeddingText }),
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
          }

          const { embedding } = await response.json()

          // Update the hotel document with the embedding
          await updateDoc(doc(db, "hotels", hotelDoc.id), {
            embedding: embedding,
            embeddingText: embeddingText,
            embeddingUpdatedAt: new Date(),
          })

          processedCount++
          setProgress({ current: processedCount, total: hotels.length })
          console.log(`[v0] Updated embedding for: ${hotelData.name}`)

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`[v0] Error processing hotel ${hotelDoc.id}:`, error)
          errorCount++
        }
      }

      if (errorCount === 0) {
        setStatus("success")
        setMessage(`Successfully generated embeddings for all ${processedCount} hotels!`)
      } else {
        setStatus("error")
        setMessage(`Generated embeddings for ${processedCount} hotels, but ${errorCount} failed.`)
      }

      console.log("[v0] Embedding generation completed")
    } catch (error) {
      console.error("[v0] Error generating embeddings:", error)
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const checkEmbeddings = async () => {
    try {
      const hotelsRef = collection(db, "hotels")
      const snapshot = await getDocs(hotelsRef)

      let withEmbeddings = 0
      let withoutEmbeddings = 0

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.embedding) {
          withEmbeddings++
        } else {
          withoutEmbeddings++
        }
      })

      setMessage(`Hotels with embeddings: ${withEmbeddings}, without embeddings: ${withoutEmbeddings}`)
      console.log("[v0] Embedding status:", { withEmbeddings, withoutEmbeddings })
    } catch (error) {
      console.error("[v0] Error checking embeddings:", error)
      setMessage(`Error checking embeddings: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Hotel Embeddings Generator
        </CardTitle>
        <CardDescription>
          Generate vector embeddings for hotel data to enable semantic search and AI-powered recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateEmbeddings} disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating... ({progress.current}/{progress.total})
              </>
            ) : (
              "Generate Embeddings"
            )}
          </Button>

          <Button onClick={checkEmbeddings} variant="outline" disabled={isGenerating}>
            Check Status
          </Button>
        </div>

        {isGenerating && progress.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        )}

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
            <strong>What this does:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Creates vector embeddings from hotel descriptions, amenities, and cuisine</li>
            <li>Enables semantic search (find "romantic getaway" → beach resorts)</li>
            <li>Powers AI recommendations based on user preferences</li>
            <li>Improves chat responses with contextually relevant hotels</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
