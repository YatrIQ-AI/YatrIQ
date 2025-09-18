"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { User, Mail, Calendar, Trophy, Target, Flame, Save, Camera } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, userProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: "",
    location: "",
    travelStyle: "",
    favoriteDestination: "",
  })

  const handleSave = async () => {
    if (!user || !userProfile) return

    setIsLoading(true)
    try {
      const userDocRef = doc(db, "users", user.uid)
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        travelStyle: formData.travelStyle,
        favoriteDestination: formData.favoriteDestination,
        updatedAt: new Date().toISOString(),
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !userProfile) return null

  const levelProgress = (userProfile.xpPoints % 1000) / 10
  const nextLevelXP = userProfile.level * 1000 - userProfile.xpPoints

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Management
          </DialogTitle>
          <DialogDescription>Manage your YatrIQ profile and travel preferences</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Stats & Achievements</TabsTrigger>
            <TabsTrigger value="preferences">Travel Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                  <AvatarFallback className="text-2xl">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{user.displayName}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your display name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your travel style..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Your city, country"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="favoriteDestination">Favorite Destination</Label>
                  <Input
                    id="favoriteDestination"
                    value={formData.favoriteDestination}
                    onChange={(e) => setFormData({ ...formData, favoriteDestination: e.target.value })}
                    placeholder="Your favorite place to visit"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Level</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile.level}</div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-xs">
                      <span>{userProfile.xpPoints} XP</span>
                      <span>{nextLevelXP} to next level</span>
                    </div>
                    <Progress value={levelProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trips Planned</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile.tripCount}</div>
                  <p className="text-xs text-muted-foreground">AI-powered itineraries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userProfile.streak}</div>
                  <p className="text-xs text-muted-foreground">Days active</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your travel planning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    First Trip
                  </Badge>
                  {userProfile.tripCount >= 5 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Explorer
                    </Badge>
                  )}
                  {userProfile.level >= 3 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Travel Pro
                    </Badge>
                  )}
                  {userProfile.streak >= 7 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Week Warrior
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Travel Style</CardTitle>
                <CardDescription>Help us personalize your trip recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="travelStyle">Preferred Travel Style</Label>
                  <Input
                    id="travelStyle"
                    value={formData.travelStyle}
                    onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
                    placeholder="e.g., Adventure, Luxury, Budget, Cultural, Relaxation"
                  />
                </div>

                <div className="grid gap-4">
                  <h4 className="font-medium">Quick Preferences</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Adventure Seeker",
                      "Cultural Explorer",
                      "Luxury Traveler",
                      "Budget Backpacker",
                      "Family Friendly",
                      "Solo Traveler",
                      "Foodie",
                      "Nature Lover",
                    ].map((style) => (
                      <Button
                        key={style}
                        variant={formData.travelStyle === style ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, travelStyle: style })}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
