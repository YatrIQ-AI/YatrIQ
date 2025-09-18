"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sparkles, MapPin, Users, Clock, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TripPreferences {
  destination: string
  budget: number[]
  startDate: Date | undefined
  endDate: Date | undefined
  duration: number
  travelers: number
  travelStyle: string[]
  accommodation: string
  transportation: string[]
  interests: string[]
  specialRequests: string
}

interface TripPlanningFormProps {
  onSubmit: (preferences: TripPreferences) => void
  isLoading?: boolean
}

export function TripPlanningForm({ onSubmit, isLoading = false }: TripPlanningFormProps) {
  const [preferences, setPreferences] = useState<TripPreferences>({
    destination: "",
    budget: [2000],
    startDate: undefined,
    endDate: undefined,
    duration: 7,
    travelers: 2,
    travelStyle: [],
    accommodation: "",
    transportation: [],
    interests: [],
    specialRequests: "",
  })

  const travelStyles = [
    "Adventure",
    "Relaxation",
    "Culture",
    "Food & Dining",
    "Nature",
    "Nightlife",
    "Shopping",
    "History",
    "Photography",
    "Wellness",
  ]

  const interests = [
    "Museums",
    "Art Galleries",
    "Local Markets",
    "Street Food",
    "Hiking",
    "Beaches",
    "Architecture",
    "Music",
    "Festivals",
    "Wildlife",
    "Sports",
    "Cooking Classes",
  ]

  const transportationOptions = ["Flight", "Train", "Bus", "Car Rental", "Rideshare", "Public Transit"]

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(preferences)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Destination & Dates
          </CardTitle>
          <CardDescription>Where and when do you want to travel?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, France"
                value={preferences.destination}
                onChange={(e) => setPreferences((prev) => ({ ...prev, destination: e.target.value }))}
                className="bg-input"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelers">Number of Travelers</Label>
              <Select
                value={preferences.travelers.toString()}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, travelers: Number.parseInt(value) }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Traveler" : "Travelers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input",
                      !preferences.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {preferences.startDate ? format(preferences.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={preferences.startDate}
                    onSelect={(date) => setPreferences((prev) => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input",
                      !preferences.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {preferences.endDate ? format(preferences.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={preferences.endDate}
                    onSelect={(date) => setPreferences((prev) => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={preferences.duration}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 1 }))
                }
                className="bg-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Budget & Accommodation
          </CardTitle>
          <CardDescription>Set your budget and accommodation preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Total Budget (USD)</Label>
              <span className="text-lg font-semibold text-primary">${preferences.budget[0].toLocaleString()}</span>
            </div>
            <Slider
              value={preferences.budget}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, budget: value }))}
              max={10000}
              min={500}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>$500</span>
              <span>$10,000+</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Accommodation Type</Label>
            <Select
              value={preferences.accommodation}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, accommodation: value }))}
            >
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Select accommodation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
                <SelectItem value="airbnb">Airbnb/Vacation Rental</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="boutique">Boutique Hotel</SelectItem>
                <SelectItem value="luxury">Luxury Hotel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Travel Style & Interests
          </CardTitle>
          <CardDescription>Tell us what kind of experience you're looking for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Travel Style (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {travelStyles.map((style) => (
                <Badge
                  key={style}
                  variant={preferences.travelStyle.includes(style) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      travelStyle: toggleArrayItem(prev.travelStyle, style),
                    }))
                  }
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interests & Activities</Label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={preferences.interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() =>
                    setPreferences((prev) => ({
                      ...prev,
                      interests: toggleArrayItem(prev.interests, interest),
                    }))
                  }
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Preferred Transportation</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {transportationOptions.map((transport) => (
                <div key={transport} className="flex items-center space-x-2">
                  <Checkbox
                    id={transport}
                    checked={preferences.transportation.includes(transport)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPreferences((prev) => ({
                          ...prev,
                          transportation: [...prev.transportation, transport],
                        }))
                      } else {
                        setPreferences((prev) => ({
                          ...prev,
                          transportation: prev.transportation.filter((t) => t !== transport),
                        }))
                      }
                    }}
                  />
                  <Label htmlFor={transport} className="text-sm font-normal cursor-pointer">
                    {transport}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
          <CardDescription>Any specific requirements or preferences?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., vegetarian restaurants, accessible venues, family-friendly activities..."
            value={preferences.specialRequests}
            onChange={(e) => setPreferences((prev) => ({ ...prev, specialRequests: e.target.value }))}
            className="bg-input min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading || !preferences.destination}>
        {isLoading ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Generating Your Perfect Itinerary...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Itinerary
          </>
        )}
      </Button>
    </form>
  )
}
