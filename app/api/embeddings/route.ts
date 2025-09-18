import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Generating embedding for text length:", text.length)

    // Use Gemini's embedding model
    const model = genAI.getGenerativeModel({ model: "embedding-001" })

    const result = await model.embedContent(text)
    const embedding = result.embedding.values

    console.log("[v0] Generated embedding with dimensions:", embedding.length)

    return NextResponse.json({
      embedding,
      dimensions: embedding.length,
      textLength: text.length,
    })
  } catch (error) {
    console.error("[v0] Embedding generation error:", error)

    // Handle specific API errors
    if (error instanceof Error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        return NextResponse.json({ error: "API quota exceeded. Please try again later." }, { status: 429 })
      }

      if (error.message.includes("401") || error.message.includes("authentication")) {
        return NextResponse.json({ error: "API authentication failed. Check your API key." }, { status: 401 })
      }
    }

    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 })
  }
}
