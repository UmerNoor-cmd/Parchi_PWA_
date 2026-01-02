"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, LogIn } from "lucide-react"

interface LoginPageProps {
  onLogin: (role: "corporate" | "branch" | "admin") => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login validation
    setTimeout(() => {
      if (!username || !password) {
        setError("Please enter both username and password")
        setIsLoading(false)
        return
      }

      if (username.toLowerCase().startsWith("admin")) {
        onLogin("admin")
      } else if (username.toLowerCase().startsWith("corp")) {
        onLogin("corporate")
      } else if (username.toLowerCase().startsWith("branch")) {
        onLogin("branch")
      } else {
        setError("Invalid credentials. Try 'admin_*', 'corp_*' or 'branch_*' for branch accounts.")
        setIsLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-12 w-auto" />
          </div>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input
                placeholder="e.g., admin_user, corp_restaurant, or branch_main"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-10"
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

          <div className="mt-6 p-3 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-xs text-purple-700">
              <strong>Demo accounts:</strong>
              <br />• <code className="font-mono">admin_demo</code>
              <br />• <code className="font-mono">corp_demo</code>
              <br />• <code className="font-mono">branch_demo</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
