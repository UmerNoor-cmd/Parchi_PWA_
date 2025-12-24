"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, TrendingUp, Users, FileText, ShoppingCart, Loader2, XCircle, AlertCircle } from "lucide-react"
import {
  LineChart,  
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BranchSidebar } from "./branch-sidebar"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { getStudentByParchiId, createRedemption, StudentVerificationResponse, getDailyRedemptionStats, DailyRedemptionStats, getDailyRedemptionDetails, DailyRedemptionDetail } from "@/lib/api-client"
import { toast } from "sonner"



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
  { label: "Redemptions Today", value: "125", trend: "+15% vs Yesterday" },
  { label: "Students Served", value: "118", trend: "94% Unique Students" },
  { label: "Discounts Given", value: "Rs. 25,000", trend: "Avg. Rs. 200/order" },
  { label: "Current Queue", value: "3", trend: "< 2 min wait time" },
]

const mockHourlyRedemptions = [
  { time: "10 AM", count: 5 },
  { time: "11 AM", count: 12 },
  { time: "12 PM", count: 28 },
  { time: "1 PM", count: 35 },
  { time: "2 PM", count: 22 },
  { time: "3 PM", count: 15 },
  { time: "4 PM", count: 8 },
]

const colors = DASHBOARD_COLORS("branch")

export function BranchDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("redeem")
  const [parchiIdInput, setParchiIdInput] = useState("")
  const [applicableOffer, setApplicableOffer] = useState<any>(null)
  const [recentRedemptions, setRecentRedemptions] = useState(mockRecentRedemptions)
  const [studentDetails, setStudentDetails] = useState<StudentVerificationResponse | null>(null)
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false)
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  const [isCreatingRedemption, setIsCreatingRedemption] = useState(false)
  const [dailyStats, setDailyStats] = useState<DailyRedemptionStats | null>(null)
  const [dailyRedemptionDetails, setDailyRedemptionDetails] = useState<DailyRedemptionDetail[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stats, details] = await Promise.all([
          getDailyRedemptionStats(),
          getDailyRedemptionDetails()
        ])
        setDailyStats(stats)
        setDailyRedemptionDetails(details)
      } catch (error) {
        console.error("Failed to fetch daily stats or details:", error)
      }
    }
    fetchStats()
  }, [])



  const handleRedemptionClick = async () => {
    if (!parchiIdInput) return

    setIsLoadingStudent(true)
    try {
      const student = await getStudentByParchiId(parchiIdInput)
      setStudentDetails(student)
      
      if (student.offer) {
        setApplicableOffer(student.offer)
        setIsVerificationDialogOpen(true)
      } else {
        toast.error("No active offer found for this student")
      }

    } catch (error) {
      toast.error("Student not found or error fetching details")
    } finally {
      setIsLoadingStudent(false)
    }
  }

  const handleConfirmRedemption = async () => {
    if (parchiIdInput && applicableOffer && studentDetails) {
      setIsCreatingRedemption(true)
      try {
        // Call API to create redemption
        await createRedemption({
          parchiId: parchiIdInput,
          offerId: applicableOffer.id,
          notes: applicableOffer.isBonus ? "Bonus Redemption" : "Standard Redemption"
        })

        const newRedemption = {
          id: recentRedemptions.length + 1,
          parchiId: parchiIdInput,
          studentName: `${studentDetails.firstName} ${studentDetails.lastName}`,
          offer: `${applicableOffer.title} - ${applicableOffer.discountValue}${applicableOffer.discountType === 'percentage' ? '%' : ''}`,
          timestamp: "just now",
        }
        setRecentRedemptions([newRedemption, ...recentRedemptions])
        
        // Refresh stats and details after successful redemption
        const [stats, details] = await Promise.all([
          getDailyRedemptionStats(),
          getDailyRedemptionDetails()
        ])
        setDailyStats(stats)
        setDailyRedemptionDetails(details)

        setParchiIdInput("")
        setApplicableOffer(null)
        setStudentDetails(null)
        setIsVerificationDialogOpen(false)
        toast.success("Redemption processed successfully")
      } catch (error) {
        toast.error("Failed to process redemption. Please try again.")
      } finally {
        setIsCreatingRedemption(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <BranchSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Branch Dashboard</h1>
            <p className="text-muted-foreground mt-1">Process student redemptions in real-time</p>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Key Metrics */}
              {/* Key Metrics - Daily Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Redemptions Today</span>
                      <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {dailyStats.todayCount}
                        </div>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                          <TrendingUp className={`w-3 h-3 ${dailyStats.trend === 'down' ? 'rotate-180' : ''}`} /> 
                          <span className={dailyStats.trend === 'up' ? "text-green-600" : dailyStats.trend === 'down' ? "text-red-600" : "text-gray-600"}>
                            {dailyStats.trend === 'up' ? '+' : ''}{dailyStats.percentageChange}%
                          </span> vs Yesterday
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Students Served</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>118</div>
                    <p className="text-xs text-muted-foreground mt-1">94% Unique Students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Discounts Given</span>
                      <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>Rs. 25k</div>
                    <p className="text-xs text-muted-foreground mt-1">Avg. Rs. 200/order</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Current Queue</span>
                      <Clock className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>3</div>
                    <p className="text-xs text-muted-foreground mt-1">&lt; 2 min wait time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {/* Charts - Real-time Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Hourly Redemption Breakdown</CardTitle>
                    <CardDescription>Redemption volume throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockHourlyRedemptions}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="time" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={colors.primary} name="Redemptions" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Most Active Hours</CardTitle>
                    <CardDescription>Peak times for student visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Clock className="w-6 h-6" style={{ color: colors.primary }} />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">1:00 PM - 2:00 PM</p>
                            <p className="text-sm text-muted-foreground">Highest Traffic (Lunch Rush)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: colors.primary }}>35</p>
                          <p className="text-xs text-muted-foreground">Redemptions</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Other Busy Periods</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">12:00 PM - 1:00 PM</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '80%', backgroundColor: colors.primary }} />
                            </div>
                            <span className="text-xs font-medium">28</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">2:00 PM - 3:00 PM</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: '65%', backgroundColor: colors.primary }} />
                            </div>
                            <span className="text-xs font-medium">22</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "redeem" && (
            <>
              <div className="mb-8">
                <Card className="border-2" style={{ borderColor: `${colors.primary}40` }}>
                  <CardHeader className="pb-4 bg-muted/20">
                    <CardTitle className="text-2xl flex items-center gap-2" style={{ color: colors.primary }}>
                      <CheckCircle className="w-6 h-6" />
                      Quick Redemption
                    </CardTitle>
                    <CardDescription>Enter Parchi ID and select an offer to process redemption</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Step 1: Parchi ID */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold" style={{ color: colors.primary }}>Step 1: Student Parchi ID</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Parchi ID (e.g., PK-12345)"
                          value={parchiIdInput}
                          onChange={(e) => setParchiIdInput(e.target.value.toUpperCase())}
                          className="text-lg font-mono h-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && parchiIdInput) {
                              handleRedemptionClick()
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Step 2: Select Offer */}


                    {/* Redemption Button */}
                    {parchiIdInput && (
                      <div className="flex gap-2 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                        <Button
                          onClick={handleRedemptionClick}
                          className="flex-1 gap-2 h-12 text-lg"
                          size="lg"
                          style={{ backgroundColor: colors.primary }}
                          disabled={isLoadingStudent}
                        >
                          {isLoadingStudent ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                          Process Redemption
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setParchiIdInput("")
                            setApplicableOffer(null)
                          }}
                          className="px-6 h-12"
                          disabled={isLoadingStudent}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Today's Redemption Count - UPDATED TO USE REAL DATA */}
              <div className="mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Redemptions Today</span>
                      <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {dailyStats.todayCount}
                        </div>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                          <TrendingUp className={`w-3 h-3 ${dailyStats.trend === 'down' ? 'rotate-180' : ''}`} /> 
                          <span className={dailyStats.trend === 'up' ? "text-green-600" : dailyStats.trend === 'down' ? "text-red-600" : "text-gray-600"}>
                            {dailyStats.trend === 'up' ? '+' : ''}{dailyStats.percentageChange}%
                          </span> vs Yesterday
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Redemptions</span>
                    <Badge variant="outline" className="rounded-full">
                      {dailyRedemptionDetails.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time redemption log</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dailyRedemptionDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No redemptions yet today</p>
                    </div>
                  ) : (
                    dailyRedemptionDetails.map((item) => (
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
                            <p className="text-sm text-muted-foreground truncate">{item.offerTitle} - {item.discountDetails}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Student Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Student</DialogTitle>
            <DialogDescription>
              Please verify the student's identity before proceeding.
            </DialogDescription>
          </DialogHeader>

          {studentDetails && (
            <div className="py-4 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={studentDetails.profilePicture || ""} />
                  <AvatarFallback className="text-2xl bg-muted">
                    {studentDetails.firstName[0]}{studentDetails.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{studentDetails.firstName} {studentDetails.lastName}</h3>
                  <p className="text-muted-foreground">{studentDetails.university}</p>
                  <Badge variant="outline" className="mt-2 font-mono">
                    {studentDetails.parchiId}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-4 bg-muted/20">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {studentDetails.verificationStatus === 'approved' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Not Verified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Applicable Offer</p>
                  <div className="mt-1">
                    <p className="font-medium">{applicableOffer?.title}</p>
                    <p className="text-sm text-muted-foreground">{applicableOffer?.description}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: colors.primary }}>
                      {applicableOffer?.discountValue}{applicableOffer?.discountType === 'percentage' ? '% OFF' : ' OFF'}
                    </p>
                  </div>
                  {applicableOffer?.isBonus && (
                    <Badge className="mt-1 bg-yellow-500 hover:bg-yellow-600">Bonus Unlocked! 🎉</Badge>
                  )}
                </div>
              </div>

              {studentDetails.verificationStatus !== 'approved' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Warning: This student is not verified.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsVerificationDialogOpen(false)}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleConfirmRedemption}
              className="flex-1"
              style={{ backgroundColor: colors.primary }}
              disabled={isCreatingRedemption}
            >
              {isCreatingRedemption ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve & Redeem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}