"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, LogIn } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleGoHome = async () => {
    if (user) {
      await logout()
    }
    router.push("/portal-access")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              {user 
                ? `Your account (${user.email}) does not have the required permissions to access this resource.`
                : "You need to be logged in to access this page."
              }
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="default"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Go to Login
            </Button>
            <Button 
              onClick={() => router.push("/")} 
              className="w-full"
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

