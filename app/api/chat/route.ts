import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const fallbackResponses = {
  greeting:
    "Hello! I'm YatrIQ, your AI travel assistant. I'm currently experiencing high demand, but I can still help you plan your trip! Tell me about your destination, travel dates, and what kind of experience you're looking for.",
  destination:
    "That sounds like an amazing destination! While I'm working on getting back to full capacity, here are some general tips: Research the best time to visit, check visa requirements, look into local customs, and consider booking accommodations in advance. What's your budget range for this trip?",
  budget:
    "Great! With that budget, you'll have good options. I recommend allocating roughly 40% for accommodation, 30% for activities, 20% for food, and 10% for transportation. Would you like me to help you find specific recommendations once I'm back online?",
  activities:
    "I'd love to help you find the perfect activities! While I'm temporarily limited, I suggest checking local tourism boards, reading recent travel blogs, and looking at highly-rated attractions on travel sites. What type of activities interest you most - cultural, adventure, relaxation, or food experiences?",
  default:
    "I'm currently experiencing high demand but I'm here to help! Please tell me more about your travel plans - destination, dates, budget, and interests - and I'll do my best to assist you with planning your perfect trip.",
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return fallbackResponses.greeting
  }

  if (
    lowerMessage.includes("destination") ||
    lowerMessage.includes("place") ||
    lowerMessage.includes("country") ||
    lowerMessage.includes("city")
  ) {
    return fallbackResponses.destination
  }

  if (
    lowerMessage.includes("budget") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("money") ||
    lowerMessage.includes("price")
  ) {
    return fallbackResponses.budget
  }

  if (
    lowerMessage.includes("activity") ||
    lowerMessage.includes("things to do") ||
    lowerMessage.includes("attractions") ||
    lowerMessage.includes("sightseeing")
  ) {
    return fallbackResponses.activities
  }

  return fallbackResponses.default
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API request received")
    const { messages, userId } = await request.json()

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    // System prompt for travel planning
    const systemPrompt = `You are YatrIQ, an expert AI travel assistant. You help users plan amazing trips through natural conversation.

Your capabilities:
- Ask clarifying questions about destinations, dates, budget, interests
- Provide personalized travel recommendations
- Create detailed itineraries when you have enough information
- Suggest accommodations, activities, restaurants, and transportation
- Give travel tips, weather info, and cultural insights

Guidelines:
- Be conversational and friendly
- Ask follow-up questions to understand preferences better
- When you have enough info (destination, dates, budget, interests), offer to create a detailed itinerary
- Provide practical, actionable advice
- Consider budget constraints and travel style preferences
- Include local experiences and hidden gems

Current conversation context: The user is planning a trip and you're helping them through the process.`

    // Combine system prompt with conversation history
    const conversationHistory = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ]

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude the last message
    })

    const lastMessage = messages[messages.length - 1]
    console.log("[v0] Sending message to Gemini:", lastMessage.content.substring(0, 100))

    try {
      const result = await chat.sendMessageStream(lastMessage.content)

      // Create a readable stream
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = ""
            console.log("[v0] Starting stream processing")

            for await (const chunk of result.stream) {
              const chunkText = chunk.text()
              fullResponse += chunkText

              const data = JSON.stringify({ content: chunkText })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }

            console.log("[v0] Stream completed, response length:", fullResponse.length)

            const hasItinerary =
              fullResponse.toLowerCase().includes("itinerary") ||
              fullResponse.toLowerCase().includes("day 1") ||
              fullResponse.toLowerCase().includes("schedule")

            if (hasItinerary) {
              console.log("[v0] Generating structured itinerary")
              // Generate structured itinerary data
              const itineraryData = await generateStructuredItinerary(fullResponse, userId)
              if (itineraryData) {
                const itineraryJson = JSON.stringify({ itinerary: itineraryData })
                controller.enqueue(encoder.encode(`data: ${itineraryJson}\n\n`))
              }
            }

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          } catch (error) {
            console.error("[v0] Streaming error:", error)
            const fallbackResponse = getFallbackResponse(lastMessage.content)
            const fallbackData = JSON.stringify({ content: fallbackResponse })
            controller.enqueue(encoder.encode(`data: ${fallbackData}\n\n`))
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (apiError) {
      console.error("[v0] Gemini API error:", apiError)

      const fallbackResponse = getFallbackResponse(lastMessage.content)
      const encoder = new TextEncoder()

      const fallbackStream = new ReadableStream({
        start(controller) {
          const data = JSON.stringify({ content: fallbackResponse })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        },
      })

      return new Response(fallbackStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    const errorMessage = getErrorMessage(error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function getErrorMessage(error: any): string {
  const errorString = error?.toString() || ""

  if (errorString.includes("429") || errorString.includes("quota")) {
    return "I'm currently experiencing high demand. Please try again in a few minutes, or consider upgrading your plan for unlimited access."
  }

  if (errorString.includes("401") || errorString.includes("API key")) {
    return "There's an authentication issue with the AI service. Please contact support."
  }

  if (errorString.includes("network") || errorString.includes("fetch")) {
    return "I'm having trouble connecting to the AI service. Please check your internet connection and try again."
  }

  return "I encountered an unexpected error. Please try rephrasing your message or try again in a moment."
}

async function generateStructuredItinerary(response: string, userId?: string) {
  try {
    console.log("[v0] Generating structured itinerary")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const structurePrompt = `Based on this travel response, extract and structure the itinerary information into JSON format:

${response}

Return a JSON object with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-15",
      "theme": "Arrival & City Exploration",
      "activities": [
        {
          "time": "10:00 AM",
          "activity": "Check into hotel",
          "location": "Downtown Hotel",
          "duration": "30 minutes",
          "cost": 0
        }
      ],
      "meals": [
        {
          "time": "12:00 PM",
          "meal": "Lunch",
          "restaurant": "Local Bistro",
          "cuisine": "Italian",
          "cost": 25
        }
      ],
      "accommodation": "Downtown Hotel",
      "transportation": "Walking/Taxi",
      "budget_used": 150
    }
  ],
  "summary": {
    "total_cost": 1200,
    "avg_daily_cost": 200,
    "total_activities": 12,
    "destinations_covered": 3,
    "ai_confidence": 95,
    "personalization_score": 92
  },
  "ai_insights": [
    "Best time to visit attractions is early morning",
    "Local transportation is very efficient"
  ],
  "function_calls_used": ["search_attractions", "find_restaurants"],
  "ai_model": "Gemini 1.5 Pro"
}

Only return the JSON, no other text.`

    const result = await model.generateContent(structurePrompt)
    const jsonText = result.response.text().trim()

    // Clean up the response to extract JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return null
  } catch (error) {
    console.error("[v0] Error generating structured itinerary:", error)
    return null
  }
}
