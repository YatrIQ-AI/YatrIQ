"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cloud,
  Sun,
  CloudRain,
  SunSnow as Snow,
  Wind,
  Thermometer,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plane,
  MapPin,
  Clock,
  Wifi,
  RefreshCw,
  Bell,
  Globe,
  Activity,
} from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    icon: any
  }>
}

interface CurrencyRate {
  from: string
  to: string
  rate: number
  change: number
  trend: "up" | "down" | "stable"
}

interface TravelAlert {
  id: string
  type: "weather" | "security" | "transport" | "health"
  severity: "low" | "medium" | "high"
  title: string
  description: string
  location: string
  timestamp: string
}

interface FlightStatus {
  flightNumber: string
  airline: string
  status: "on-time" | "delayed" | "cancelled" | "boarding"
  departure: string
  arrival: string
  gate?: string
  delay?: number
}

export function RealTimeDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: "Paris, France",
    temperature: 18,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: "Today", high: 22, low: 15, condition: "Sunny", icon: Sun },
      { day: "Tomorrow", high: 19, low: 12, condition: "Cloudy", icon: Cloud },
      { day: "Wed", high: 16, low: 8, condition: "Rain", icon: CloudRain },
      { day: "Thu", high: 20, low: 11, condition: "Partly Cloudy", icon: Sun },
      { day: "Fri", high: 23, low: 14, condition: "Sunny", icon: Sun },
    ],
  })

  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([
    { from: "USD", to: "EUR", rate: 0.92, change: -0.02, trend: "down" },
    { from: "USD", to: "GBP", rate: 0.79, change: 0.01, trend: "up" },
    { from: "USD", to: "JPY", rate: 149.5, change: 1.2, trend: "up" },
    { from: "EUR", to: "GBP", rate: 0.86, change: 0.0, trend: "stable" },
  ])

  const [travelAlerts, setTravelAlerts] = useState<TravelAlert[]>([
    {
      id: "1",
      type: "weather",
      severity: "medium",
      title: "Rain Expected",
      description: "Light rain expected Wednesday afternoon. Pack an umbrella.",
      location: "Paris, France",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "transport",
      severity: "low",
      title: "Metro Maintenance",
      description: "Line 1 will have reduced service this weekend.",
      location: "Paris Metro",
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      type: "security",
      severity: "low",
      title: "Tourist Advisory",
      description: "Increased security at major tourist attractions.",
      location: "Paris, France",
      timestamp: "1 day ago",
    },
  ])

  const [flightStatus, setFlightStatus] = useState<FlightStatus[]>([
    {
      flightNumber: "AF123",
      airline: "Air France",
      status: "on-time",
      departure: "10:30 AM",
      arrival: "11:45 PM",
      gate: "A12",
    },
    {
      flightNumber: "BA456",
      airline: "British Airways",
      status: "delayed",
      departure: "2:15 PM",
      arrival: "3:30 PM",
      delay: 25,
    },
  ])

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update weather temperature slightly
      setWeatherData((prev) => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
      }))

      // Update currency rates
      setCurrencyRates((prev) =>
        prev.map((rate) => ({
          ...rate,
          rate: rate.rate + (Math.random() - 0.5) * 0.01,
          change: (Math.random() - 0.5) * 0.05,
        })),
      )

      setLastUpdated(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return Sun
      case "cloudy":
      case "partly cloudy":
        return Cloud
      case "rain":
      case "light rain":
        return CloudRain
      case "snow":
        return Snow
      default:
        return Sun
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      case "low":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "weather":
        return Cloud
      case "security":
        return AlertTriangle
      case "transport":
        return Plane
      case "health":
        return Activity
      default:
        return Bell
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "text-green-600 bg-green-100"
      case "delayed":
        return "text-yellow-600 bg-yellow-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      case "boarding":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                Live Travel Data
              </CardTitle>
              <CardDescription>
                Real-time updates for your destination • Last updated: {lastUpdated.toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Updating..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="weather" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="flights">Flights</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="space-y-4">
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Current Weather - {weatherData.location}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {(() => {
                      const WeatherIcon = getWeatherIcon(weatherData.condition)
                      return <WeatherIcon className="w-8 h-8 text-primary" />
                    })()}
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{Math.round(weatherData.temperature)}°C</div>
                    <div className="text-muted-foreground">{weatherData.condition}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Wind: {weatherData.windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Humidity: {weatherData.humidity}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>5-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">{day.day}</div>
                    <day.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm">
                      <div className="font-semibold">{day.high}°</div>
                      <div className="text-muted-foreground">{day.low}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Live Exchange Rates
              </CardTitle>
              <CardDescription>Real-time currency conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencyRates.map((rate, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {rate.from} → {rate.to}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          1 {rate.from} = {rate.rate.toFixed(4)} {rate.to}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 ${
                          rate.trend === "up"
                            ? "text-green-600"
                            : rate.trend === "down"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {rate.trend === "up" && <TrendingUp className="w-4 h-4" />}
                        {rate.trend === "down" && <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {rate.change > 0 ? "+" : ""}
                          {rate.change.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Converter */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Converter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <input type="number" placeholder="100" className="w-full p-2 border rounded-md" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>JPY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>JPY</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">€92.00</div>
                  <div className="text-sm text-muted-foreground">100 USD = 92.00 EUR</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Travel Alerts & Updates
              </CardTitle>
              <CardDescription>Important notifications for your destination</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {travelAlerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type)
                  return (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        <AlertIcon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {alert.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Flight Status
              </CardTitle>
              <CardDescription>Real-time flight information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flightStatus.map((flight, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{flight.flightNumber}</div>
                        <div className="text-sm text-muted-foreground">{flight.airline}</div>
                      </div>
                      <Badge className={getStatusColor(flight.status)}>
                        {flight.status.replace("-", " ").toUpperCase()}
                        {flight.delay && ` (+${flight.delay}m)`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Departure</div>
                        <div className="font-medium">{flight.departure}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Arrival</div>
                        <div className="font-medium">{flight.arrival}</div>
                      </div>
                      {flight.gate && (
                        <div>
                          <div className="text-muted-foreground">Gate</div>
                          <div className="font-medium">{flight.gate}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="font-medium capitalize">{flight.status.replace("-", " ")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium">Weather API</div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium">Currency API</div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="font-medium">Flight API</div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
