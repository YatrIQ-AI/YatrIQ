"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Chrome, Shield, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      onOpenChange(false)
    } catch (error) {
      console.error("Sign in failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
            Welcome to YatrIQ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Sign in to save your trips, track your progress, and get personalized AI recommendations.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <Card className="border-primary/20">
              <CardContent className="p-3">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">Secure</p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20">
              <CardContent className="p-3">
                <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-xs font-medium">Fast</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="p-3">
                <Sparkles className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-xs font-medium">AI-Powered</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-12 text-base" size="lg">
            <Chrome className="w-5 h-5 mr-2" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
