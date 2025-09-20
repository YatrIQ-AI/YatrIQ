"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Plane,
  Trophy,
  Star,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Settings,
} from "lucide-react"
import { AIItineraryDisplay } from "./ai-itinerary-display"
import { BudgetTracker } from "./budget-tracker"
import { BookingManager } from "./booking-manager"
import { RealTimeDashboard } from "./real-time-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { UserMenu } from "@/components/auth/user-menu"
import { ChatInterface } from "./chat/chat-interface"
import HotelSeeder from "./admin/hotel-seeder" // Added hotel seeder import

interface ItineraryDay {
  day: number
  date: string
  theme: string
  activities: any[]
  meals: any[]
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

interface AIItineraryData {
  itinerary: ItineraryDay[]
  summary: ItinerarySummary
  ai_insights: string[]
  function_calls_used: string[]
  ai_model?: string
}

export function TripPlannerDashboard() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [showSignInModal, setShowSignInModal] = useState(false)

  const [activeTab, setActiveTab] = useState("plan")
  const [isGenerating, setIsGenerating] = useState(false)
  const [userLevel, setUserLevel] = useState(userProfile?.level || 1)
  const [xpPoints, setXpPoints] = useState(userProfile?.xpPoints || 100)
  const [streak, setStreak] = useState(userProfile?.streak || 0)
  const [completedTasks, setCompletedTasks] = useState(userProfile?.tripCount || 0)
  const [planningProgress, setPlanningProgress] = useState(0)
  const [aiItinerary, setAiItinerary] = useState<AIItineraryData | null>(null)

  useEffect(() => {
    if (userProfile) {
      setUserLevel(userProfile.level)
      setXpPoints(userProfile.xpPoints)
      setStreak(userProfile.streak)
      setCompletedTasks(userProfile.tripCount)
    }
  }, [userProfile])

  const handleTripSubmit = async (preferences: any) => {
    if (!user) {
      setShowSignInModal(true)
      return
    }

    setIsGenerating(true)
    setPlanningProgress(0)
    let progressInterval: any

    try {
      progressInterval = setInterval(() => {
        setPlanningProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return Math.min(newProgress, 90)
        })
      }, 300)

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...preferences,
          userId: user.uid,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate itinerary")
      }

      const data: AIItineraryData = await response.json()

      clearInterval(progressInterval)
      setPlanningProgress(100)

      setAiItinerary(data)

      setXpPoints((prev) => prev + 50)
      setCompletedTasks((prev) => prev + 1)

      setTimeout(() => {
        setIsGenerating(false)
        setActiveTab("itinerary")
      }, 1000)
    } catch (error) {
      console.error("Error generating itinerary:", error)
      clearInterval(progressInterval)
      setIsGenerating(false)
      setPlanningProgress(0)
    }
  }

  const handleChatItinerary = (itinerary: AIItineraryData) => {
    setAiItinerary(itinerary)
    setXpPoints((prev) => prev + 50)
    setCompletedTasks((prev) => prev + 1)
    setActiveTab("itinerary")
  }

  const [showAchievement, setShowAchievement] = useState(false)

  useEffect(() => {
    if (completedTasks > 12) {
      setShowAchievement(true)
      setTimeout(() => setShowAchievement(false), 3000)
    }
  }, [completedTasks])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading YatrIQ...</p>
          <p className="text-xs text-muted-foreground">If this takes too long, please check your internet connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">YatrIQ</h1>
                <p className="text-xs text-muted-foreground">Intelligent Travel Planning</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Level {userLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span>{xpPoints} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                    <span>{streak} day streak</span>
                  </div>
                </div>
              )}

              {user ? (
                <UserMenu />
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowSignInModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SignInModal open={showSignInModal} onOpenChange={setShowSignInModal} />

      {showAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-full duration-500">
          <Card className="bg-card border shadow-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <p className="font-semibold">Achievement Unlocked!</p>
                <p className="text-sm text-muted-foreground">Trip Planning Expert</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <Card className="border-l-2 border-l-primary h-20">
            <CardContent className="flex items-center gap-2 p-2 h-full">
              <Target className="w-4 h-4 text-primary" />
              <div>
                <p className="text-lg font-bold leading-tight">{completedTasks}</p>
                <p className="text-[10px] text-muted-foreground">Trips Planned</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-secondary h-20">
            <CardContent className="flex items-center gap-2 p-2 h-full">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <div>
                <p className="text-lg font-bold leading-tight">{streak}</p>
                <p className="text-[10px] text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-accent h-20">
            <CardContent className="flex items-center gap-2 p-2 h-full">
              <Star className="w-4 h-4 text-accent" />
              <div>
                <p className="text-lg font-bold leading-tight">{xpPoints}</p>
                <p className="text-[10px] text-muted-foreground">XP Points</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-2 border-l-chart-4 h-20">
            <CardContent className="flex items-center gap-2 p-2 h-full">
              <Trophy className="w-4 h-4 text-chart-4" />
              <div>
                <p className="text-lg font-bold leading-tight">Lvl {userLevel}</p>
                <p className="text-[10px] text-muted-foreground">Travel Expert</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-muted/30 p-1 rounded-lg">
            <TabsTrigger
              value="plan"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <MapPin className="w-4 h-4" />
              Plan
            </TabsTrigger>
            <TabsTrigger
              value="itinerary"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <DollarSign className="w-4 h-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Plane className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="live"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Activity className="w-4 h-4" />
              Live Data
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="flex items-center gap-2 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-6">
            <div className="text-center space-y-6 py-12">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-balance">
                  Plan Your <span className="gradient-text">Perfect Trip</span> with AI
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty leading-relaxed">
                  Chat with our AI assistant to plan your perfect trip. Just tell us where you want to go and what
                  you're looking for!
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="w-full">
                <ChatInterface onItineraryGenerated={handleChatItinerary} heightClass="h-[600px] md:h-[700px]" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-6">
            {aiItinerary ? (
              <AIItineraryDisplay
                itinerary={aiItinerary.itinerary}
                summary={aiItinerary.summary}
                ai_insights={aiItinerary.ai_insights}
                function_calls_used={aiItinerary.function_calls_used}
                ai_model={aiItinerary.ai_model}
              />
            ) : (
              <div className="text-center space-y-4 py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">No Itinerary Yet</h2>
                  <p className="text-muted-foreground">
                    Create your first AI-powered itinerary by filling out the planning form.
                  </p>
                </div>
                <Button onClick={() => setActiveTab("plan")} className="mt-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Planning
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetTracker
              totalBudget={aiItinerary?.summary.total_cost || 2000}
              itineraryCost={aiItinerary?.summary.total_cost || 0}
            />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <BookingManager />
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Admin Tools</h2>
              <p className="text-muted-foreground">Manage database content and application settings</p>
            </div>

            <HotelSeeder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
