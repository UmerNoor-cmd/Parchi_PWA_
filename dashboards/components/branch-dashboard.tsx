"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"
import { BranchSidebar } from "./branch-sidebar"
import { DASHBOARD_COLORS } from "@/lib/colors"

const mockActiveOffers = [
  { id: 1, title: "Weekend Special", discount: "20% off", description: "All items", icon: "🎉" },
  { id: 2, title: "Student Combo", discount: "Rs. 300 off", description: "Min order Rs. 1000", icon: "🍽️" },
  { id: 3, title: "Happy Hour", discount: "15% off", description: "Beverages only", icon: "☕" },
  { id: 4, title: "Lunch Deal", discount: "25% off", description: "12pm-3pm", icon: "🍱" },
]

const mockRecentRedemptions = [
  {
    id: 1,
    parchiId: "PK-11111",
    studentName: "Fatima Ahmed",
    offer: "Weekend Special - 20% off",
    timestamp: "15 mins ago",
  },
  {
    id: 2,
    parchiId: "PK-22222",
    studentName: "Ali Hassan",
    offer: "Student Combo - Rs. 300 off",
    timestamp: "22 mins ago",
  },
  {
    id: 3,
    parchiId: "PK-33333",
    studentName: "Zara Khan",
    offer: "Happy Hour - 15% off",
    timestamp: "35 mins ago",
  },
  {
    id: 4,
    parchiId: "PK-44444",
    studentName: "Omar Saeed",
    offer: "Lunch Deal - 25% off",
    timestamp: "1 hour ago",
  },
]

const mockTodayStats = [
  { label: "Today's Redemptions", value: "24", trend: "+3 from yesterday" },
  { label: "Total Students", value: "142", trend: "+12 new this week" },
  { label: "Amount Owed to Parchi", value: "Rs. 4,800", trend: "24 × Rs. 200 per redemption" },
]

const colors = DASHBOARD_COLORS("branch")

export function BranchDashboard() {
  const [activeTab, setActiveTab] = useState("redemption")
  const [parchiIdInput, setParchiIdInput] = useState("")
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null)
  const [recentRedemptions, setRecentRedemptions] = useState(mockRecentRedemptions)

  const handleRedemption = () => {
    if (parchiIdInput && selectedOffer) {
      const offer = mockActiveOffers.find((o) => o.id === selectedOffer)
      const newRedemption = {
        id: recentRedemptions.length + 1,
        parchiId: parchiIdInput,
        studentName: "Student Name",
        offer: `${offer?.title} - ${offer?.discount}`,
        timestamp: "just now",
      }
      setRecentRedemptions([newRedemption, ...recentRedemptions])
      setParchiIdInput("")
      setSelectedOffer(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <BranchSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Branch Dashboard</h1>
            <p className="text-muted-foreground mt-1">Process student redemptions in real-time</p>
          </div>

          {activeTab === "redemption" && (
            <>
              <div className="mb-8">
                <Card className="border-2 shadow-lg" style={{ borderColor: `${colors.primary}40` }}>
                  <CardHeader className="pb-4" style={{ backgroundColor: `${colors.primary}08` }}>
                    <CardTitle className="text-2xl" style={{ color: colors.primary }}>
                      Quick Redemption
                    </CardTitle>
                    <CardDescription>Enter Parchi ID and select an offer to process redemption</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Step 1: Parchi ID */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Step 1: Student Parchi ID</label>
                      <Input
                        placeholder="Enter Parchi ID (e.g., PK-12345)"
                        value={parchiIdInput}
                        onChange={(e) => setParchiIdInput(e.target.value.toUpperCase())}
                        className="text-lg font-mono"
                      />
                    </div>

                    {/* Step 2: Select Offer */}
                    {parchiIdInput && (
                      <div className="space-y-2 animate-in fade-in">
                        <label className="text-sm font-semibold text-foreground">Step 2: Select Offer</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mockActiveOffers.map((offer) => (
                            <button
                              key={offer.id}
                              onClick={() => setSelectedOffer(offer.id)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedOffer === offer.id
                                  ? "bg-opacity-10 shadow-md"
                                  : "border-border hover:border-opacity-50"
                              }`}
                              style={{
                                borderColor: selectedOffer === offer.id ? colors.primary : "currentColor",
                                backgroundColor: selectedOffer === offer.id ? `${colors.primary}10` : "transparent",
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{offer.title}</p>
                                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                                </div>
                                <span className="text-2xl ml-2">{offer.icon}</span>
                              </div>
                              <p className="font-bold mt-2" style={{ color: colors.primary }}>
                                {offer.discount}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Redemption Button */}
                    {parchiIdInput && selectedOffer && (
                      <div className="flex gap-2 pt-4 border-t animate-in fade-in">
                        <Button
                          onClick={handleRedemption}
                          className="flex-1 gap-2"
                          size="lg"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Process Redemption
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setParchiIdInput("")
                            setSelectedOffer(null)
                          }}
                          className="px-4"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Today's Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockTodayStats.map((stat, idx) => (
                    <Card key={idx} className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Redemptions</span>
                    <Badge variant="outline" className="rounded-full">
                      {recentRedemptions.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time redemption log</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentRedemptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No redemptions yet today</p>
                    </div>
                  ) : (
                    recentRedemptions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${colors.primary}20` }}
                            >
                              <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{item.parchiId}</p>
                            <p className="text-sm text-muted-foreground truncate">{item.offer}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "offers" && (
            <Card>
              <CardHeader>
                <CardTitle>Available Offers</CardTitle>
                <CardDescription>Offers applicable to this branch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Managed from corporate account</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>All redemptions at this branch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Detailed history coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
