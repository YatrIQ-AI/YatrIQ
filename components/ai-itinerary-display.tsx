"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Star,
  Calendar,
  Utensils,
  Camera,
  Bookmark,
  Share2,
  Download,
  Sparkles,
  TrendingUp,
  Users,
  Navigation,
} from "lucide-react"

interface Activity {
  time: string
  name: string
  description: string
  location: string
  duration: string
  cost: number
  category: string
  rating: number
  booking_required: boolean
}

interface Meal {
  time: string
  restaurant: string
  cuisine: string
  cost: number
  rating: number
  location: string
}

interface ItineraryDay {
  day: number
  date: string
  theme: string
  activities: Activity[]
  meals: Meal[]
  accommodation: string
  transportation: string
  budget_used: number
}

interface ItinerarySummary {
  total_cost: number
  avg_daily_cost: number
  total_activities: number
  destinations_covered: number
  ai_confidence: number
  personalization_score: number
}

interface AIItineraryDisplayProps {
  itinerary: ItineraryDay[]
  summary: ItinerarySummary
  ai_insights: string[]
  function_calls_used: string[]
  ai_model?: string
}

export function AIItineraryDisplay({
  itinerary,
  summary,
  ai_insights,
  function_calls_used,
  ai_model,
}: AIItineraryDisplayProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(0)}`
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Generated Personalized Itinerary
            {ai_model && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {ai_model}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Powered by Google Gemini AI with advanced function calling, real-time search, RAG (Retrieval-Augmented
            Generation), and personalization algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(summary.total_cost)}</div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.total_activities}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(summary.ai_confidence * 100)}%</div>
              <div className="text-sm text-muted-foreground">AI Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(summary.personalization_score * 100)}%</div>
              <div className="text-sm text-muted-foreground">Personalized</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Google Gemini AI Insights & Analysis
            </h4>
            {ai_insights.map((insight, index) => (
              <p key={index} className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                {insight}
              </p>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Navigation className="w-3 h-3 mr-1" />
                Google Gemini 1.5 Pro
              </Badge>
              <Badge variant="outline" className="text-xs">
                Function Calling
              </Badge>
              <Badge variant="outline" className="text-xs">
                RAG System
              </Badge>
              <Badge variant="outline" className="text-xs">
                Real-time Search
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>AI Functions Used:</strong>
              </p>
              <div className="flex flex-wrap gap-1">
                {function_calls_used.map((func) => (
                  <Badge key={func} variant="outline" className="text-xs">
                    {func.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="default" className="flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          Save Itinerary
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Camera className="w-4 h-4" />
          Add to Photos
        </Button>
      </div>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        {itinerary.map((day) => (
          <Card key={day.day} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Day {day.day} - {day.theme}
                  </CardTitle>
                  <CardDescription>
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary">{formatCurrency(day.budget_used)}</div>
                  <div className="text-sm text-muted-foreground">Daily spend</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Activities */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Activities & Attractions
                  </h4>
                  <div className="space-y-4">
                    {day.activities.map((activity, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-background/50 rounded-lg border">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-sm font-medium text-primary">{formatTime(activity.time)}</div>
                          <div className="text-xs text-muted-foreground">{activity.duration}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{activity.name}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs">{activity.rating.toFixed(1)}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {activity.category}
                                </Badge>
                                {activity.booking_required && (
                                  <Badge variant="outline" className="text-xs">
                                    Booking Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-primary">{formatCurrency(activity.cost)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Meals */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    Dining Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {day.meals.map((meal, index) => (
                      <div key={index} className="p-4 bg-background/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-primary">{formatTime(meal.time)}</div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{meal.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <h5 className="font-medium text-sm">{meal.restaurant}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{meal.cuisine} cuisine</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {meal.cuisine}
                          </Badge>
                          <span className="text-sm font-medium text-primary">{formatCurrency(meal.cost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transportation & Accommodation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Accommodation:</span>
                    <span className="font-medium">{day.accommodation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Transportation:</span>
                    <span className="font-medium">{day.transportation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
