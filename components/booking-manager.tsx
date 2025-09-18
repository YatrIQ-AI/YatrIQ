"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Clock,
  Star,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bookmark,
  Download,
  Share2,
  Search,
  Zap,
  Shield,
} from "lucide-react"

interface BookingOption {
  id: string
  type: "flight" | "hotel" | "activity" | "transport"
  name: string
  provider: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  features: string[]
  image?: string
  location?: string
  duration?: string
  cancellation: "free" | "partial" | "none"
  availability: "high" | "medium" | "low"
  bookingUrl?: string
}

interface Booking {
  id: string
  type: "flight" | "hotel" | "activity" | "transport"
  name: string
  provider: string
  price: number
  status: "confirmed" | "pending" | "cancelled"
  bookingRef: string
  date: string
  details: any
}

export function BookingManager() {
  const [activeBookingType, setActiveBookingType] = useState<"flight" | "hotel" | "activity" | "transport">("flight")
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      type: "flight",
      name: "NYC to Paris",
      provider: "Air France",
      price: 650,
      status: "confirmed",
      bookingRef: "AF123456",
      date: "2024-02-15",
      details: { departure: "10:30 AM", arrival: "11:45 PM", duration: "7h 15m" },
    },
    {
      id: "2",
      type: "hotel",
      name: "Grand Hotel Paris",
      provider: "Booking.com",
      price: 180,
      status: "confirmed",
      bookingRef: "BK789012",
      date: "2024-02-15",
      details: { checkIn: "3:00 PM", checkOut: "11:00 AM", nights: 4 },
    },
  ])

  const [bookingOptions] = useState<BookingOption[]>([
    {
      id: "1",
      type: "flight",
      name: "Direct Flight to Paris",
      provider: "Air France",
      price: 650,
      originalPrice: 750,
      rating: 4.5,
      reviews: 1250,
      features: ["Direct Flight", "Meal Included", "WiFi", "Entertainment"],
      cancellation: "free",
      availability: "medium",
      bookingUrl: "#",
    },
    {
      id: "2",
      type: "hotel",
      name: "Luxury Hotel Central Paris",
      provider: "Booking.com",
      price: 180,
      rating: 4.7,
      reviews: 890,
      features: ["Free WiFi", "Breakfast", "Gym", "Spa"],
      location: "Champs-Élysées",
      cancellation: "free",
      availability: "high",
      bookingUrl: "#",
    },
    {
      id: "3",
      type: "activity",
      name: "Eiffel Tower Skip-the-Line",
      provider: "GetYourGuide",
      price: 35,
      rating: 4.8,
      reviews: 2340,
      features: ["Skip the Line", "Audio Guide", "Mobile Ticket"],
      duration: "2 hours",
      cancellation: "free",
      availability: "high",
      bookingUrl: "#",
    },
    {
      id: "4",
      type: "transport",
      name: "Airport Transfer",
      provider: "Uber",
      price: 45,
      rating: 4.3,
      reviews: 567,
      features: ["Door-to-door", "Professional Driver", "Fixed Price"],
      duration: "45 minutes",
      cancellation: "partial",
      availability: "high",
      bookingUrl: "#",
    },
  ])

  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null)
  const [bookingProgress, setBookingProgress] = useState(0)
  const [isProcessingBooking, setIsProcessingBooking] = useState(false)

  const handleBookNow = (option: BookingOption) => {
    setSelectedBooking(option)
    setIsBookingDialogOpen(true)
  }

  const processBooking = async () => {
    if (!selectedBooking) return

    setIsProcessingBooking(true)
    setBookingProgress(0)

    // Simulate booking process
    const steps = [
      { progress: 25, message: "Checking availability..." },
      { progress: 50, message: "Processing payment..." },
      { progress: 75, message: "Confirming booking..." },
      { progress: 100, message: "Booking confirmed!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setBookingProgress(step.progress)
    }

    // Add to bookings
    const newBooking: Booking = {
      id: Date.now().toString(),
      type: selectedBooking.type,
      name: selectedBooking.name,
      provider: selectedBooking.provider,
      price: selectedBooking.price,
      status: "confirmed",
      bookingRef: `BK${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split("T")[0],
      details: {},
    }

    setBookings([...bookings, newBooking])
    setIsProcessingBooking(false)
    setIsBookingDialogOpen(false)
    setBookingProgress(0)
    setSelectedBooking(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredOptions = bookingOptions.filter((option) => option.type === activeBookingType)

  return (
    <div className="space-y-6">
      {/* Booking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Bookmark className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter((b) => b.status === "confirmed").length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter((b) => b.status === "pending").length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">${bookings.reduce((sum, b) => sum + b.price, 0)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse & Book</TabsTrigger>
          <TabsTrigger value="manage">Manage Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Booking Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find & Book Travel Services
              </CardTitle>
              <CardDescription>Compare prices and book directly through our platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { type: "flight" as const, icon: Plane, label: "Flights", count: 1 },
                  { type: "hotel" as const, icon: Hotel, label: "Hotels", count: 1 },
                  { type: "activity" as const, icon: MapPin, label: "Activities", count: 1 },
                  { type: "transport" as const, icon: Car, label: "Transport", count: 1 },
                ].map((item) => (
                  <Button
                    key={item.type}
                    variant={activeBookingType === item.type ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => setActiveBookingType(item.type)}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {filteredOptions.length} options
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Booking Options */}
          <div className="space-y-4">
            {filteredOptions.map((option) => (
              <Card key={option.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {option.type === "flight" && <Plane className="w-6 h-6 text-primary" />}
                          {option.type === "hotel" && <Hotel className="w-6 h-6 text-primary" />}
                          {option.type === "activity" && <MapPin className="w-6 h-6 text-primary" />}
                          {option.type === "transport" && <Car className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <p className="text-sm text-muted-foreground">by {option.provider}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{option.rating}</span>
                          <span className="text-sm text-muted-foreground">({option.reviews} reviews)</span>
                        </div>
                        {option.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{option.location}</span>
                          </div>
                        )}
                        {option.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{option.duration}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {option.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600 capitalize">{option.cancellation} cancellation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`w-4 h-4 ${getAvailabilityColor(option.availability)}`} />
                          <span className={`text-sm capitalize ${getAvailabilityColor(option.availability)}`}>
                            {option.availability} availability
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-2">
                        {option.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">${option.originalPrice}</span>
                        )}
                        <div className="text-2xl font-bold text-primary">${option.price}</div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>

                      <div className="space-y-2">
                        <Button onClick={() => handleBookNow(option)} className="w-full">
                          <Zap className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Your Bookings
              </CardTitle>
              <CardDescription>Manage all your travel reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {booking.type === "flight" && <Plane className="w-6 h-6 text-primary" />}
                        {booking.type === "hotel" && <Hotel className="w-6 h-6 text-primary" />}
                        {booking.type === "activity" && <MapPin className="w-6 h-6 text-primary" />}
                        {booking.type === "transport" && <Car className="w-6 h-6 text-primary" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{booking.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {booking.provider} • Ref: {booking.bookingRef}
                        </p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">${booking.price}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}></div>
                          <span className="text-sm capitalize">{booking.status}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              {selectedBooking?.name} - ${selectedBooking?.price}
            </DialogDescription>
          </DialogHeader>

          {isProcessingBooking ? (
            <div className="space-y-4 py-6">
              <div className="text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="font-semibold mb-2">Processing Your Booking</h3>
                <p className="text-sm text-muted-foreground mb-4">Please wait while we confirm your reservation...</p>
              </div>
              <Progress value={bookingProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{bookingProgress}% complete</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="Enter your phone number" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${selectedBooking?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>${Math.round((selectedBooking?.price || 0) * 0.1)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(selectedBooking?.price || 0) + Math.round((selectedBooking?.price || 0) * 0.1)}</span>
                </div>
              </div>

              <Button onClick={processBooking} className="w-full" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Booking
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
