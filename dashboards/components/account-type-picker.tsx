"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Store } from "lucide-react"

interface AccountTypePickerProps {
  onSelect: (type: "corporate" | "branch") => void
}

export function AccountTypePicker({ onSelect }: AccountTypePickerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Parchi Vendor Dashboard</h1>
          <p className="text-lg text-muted-foreground">Choose your account type to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Corporate Account */}
          <Card
            className="cursor-pointer hover:shadow-lg hover:border-primary transition-all h-full"
            onClick={() => onSelect("corporate")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Corporate Account</CardTitle>
              <CardDescription>Manage multiple branches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span>Master analytics across all branches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span>Transaction logs and revenue tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span>Create and manage offers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span>User footfall data and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span>Branch performance comparison</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                Continue as Corporate
              </Button>
            </CardContent>
          </Card>

          {/* Branch Account */}
          <Card
            className="cursor-pointer hover:shadow-lg hover:border-secondary transition-all h-full"
            onClick={() => onSelect("branch")}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-secondary/10 rounded-full">
                  <Store className="w-12 h-12 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Branch Account</CardTitle>
              <CardDescription>Manage your location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span>Real-time redemption verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span>Verify student Parchi IDs instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span>Approve or reject requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span>Daily redemption tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold mt-1">✓</span>
                  <span>Branch-specific analytics</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                Continue as Branch
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">Not the account type you're looking for? Contact support</p>
        </div>
      </div>
    </div>
  )
}
