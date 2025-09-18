"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Send, User, Bot, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
  isError?: boolean
}

interface ChatInterfaceProps {
  onItineraryGenerated?: (itinerary: any) => void
}

export function ChatInterface({ onItineraryGenerated }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI travel assistant. Tell me about your dream trip - where would you like to go, when, and what kind of experience are you looking for?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    console.log("[v0] Sending message:", input.substring(0, 50))
    setConnectionError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Add streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.error) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: parsed.error, isStreaming: false, isError: true }
                        : m,
                    ),
                  )
                  setConnectionError(parsed.error)
                  break
                }

                if (parsed.content) {
                  fullContent += parsed.content
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMessageId ? { ...m, content: fullContent } : m)),
                  )
                }

                // Check if itinerary was generated
                if (parsed.itinerary && onItineraryGenerated) {
                  console.log("[v0] Itinerary generated, updating dashboard")
                  onItineraryGenerated(parsed.itinerary)
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
                console.log("[v0] Parsing error (expected for partial chunks):", e)
              }
            }
          }
        }
      }

      // Mark streaming as complete
      setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, isStreaming: false } : m)))
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to get response"

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: errorMessage,
                isStreaming: false,
                isError: true,
              }
            : m,
        ),
      )
      setConnectionError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setConnectionError(null)
    // Remove the last error message and retry
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      setInput(lastUserMessage.content)
      setMessages((prev) => prev.filter((m) => !m.isError))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">YatrIQ AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Powered by Google Gemini</p>
            </div>
          </div>
        </div>

        {connectionError && (
          <Alert className="m-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {connectionError}
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 h-6 text-xs bg-transparent">
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={`${message.isError ? "bg-orange-100 text-orange-600" : "bg-primary text-primary-foreground"}`}
                    >
                      {message.isError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : message.isError
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-muted"
                  }`}
                >
                  <p className={`text-sm whitespace-pre-wrap ${message.isError ? "text-orange-800" : ""}`}>
                    {message.content}
                  </p>
                  {message.isStreaming && (
                    <div className="flex items-center gap-1 mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs opacity-70">Thinking...</span>
                    </div>
                  )}
                  <p className={`text-xs opacity-70 mt-1 ${message.isError ? "text-orange-600" : ""}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your travel plans..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </CardContent>
    </Card>
  )
}
