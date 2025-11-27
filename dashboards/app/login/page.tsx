"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, LogIn } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login, user, logout } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if user is already logged in (only for valid dashboard roles)
  useEffect(() => {
    if (user) {
      const role = user.role
      // Note: Student role is already blocked in handleSubmit, so we skip it here
      // to avoid double logout calls
      if (role === 'admin') {
        router.push("/admin")
      } else if (role === 'merchant_corporate') {
        router.push("/corporate")
      } else if (role === 'merchant_branch') {
        router.push("/branch")
      } else if (role !== 'student') {
        // Only redirect if not a student (student is handled in handleSubmit)
        router.push("/")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError("Please enter both email and password")
        setIsLoading(false)
        return
      }

      const loggedInUser = await login(email, password)
      
      // Check if user is a student - block access immediately
      if (loggedInUser.role === 'student') {
        await logout()
        setError("Student accounts cannot access the dashboard. Please use the mobile app.")
        setIsLoading(false)
        return
      }

      // User will be set in context, useEffect will handle redirect for valid roles
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Parchi Dashboard</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-10"
                required
              />
            </div>

            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-10" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium">Admin:</span>
                <code className="px-2 py-0.5 rounded bg-background text-foreground">admin@example.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Corporate:</span>
                <code className="px-2 py-0.5 rounded bg-background text-foreground">merchant@example.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Branch:</span>
                <code className="px-2 py-0.5 rounded bg-background text-foreground">branch@example.com</code>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <span className="font-medium">Password for all:</span>
                <code className="ml-2 px-2 py-0.5 rounded bg-background text-foreground">password123</code>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
