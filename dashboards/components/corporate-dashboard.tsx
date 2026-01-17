"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, DollarSign, ShoppingCart, Plus, Download, Menu } from "lucide-react"
import { CorporateSidebar, CorporateSidebarContent } from "./corporate-sidebar"
import { CorporateOffers } from "./corporate-offers"
import { CorporateBranches } from "./corporate-branches"
import { CorporateProfile } from "./corporate-profile"
import { DASHBOARD_COLORS, getChartColor } from "@/lib/colors"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"

import {
  getDashboardStats,
  getDashboardAnalytics,
  getBranchPerformance,
  getOfferPerformance,
  DashboardStats,
  DashboardAnalytics,
  BranchPerformance,
  OfferPerformance
} from "@/lib/api-client"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

export function CorporateDashboard({ onLogout }: { onLogout: () => void }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get initial tab from URL or default to "overview"
  const getTabFromUrl = () => {
    const tab = searchParams.get("tab")
    const validTabs = ["overview", "offers", "branches", "reports", "profile"]
    return tab && validTabs.includes(tab) ? tab : "overview"
  }

  const [activeTab, setActiveTab] = useState(getTabFromUrl)
  const [redemptionStats, setRedemptionStats] = useState<DashboardStats | null>(null)
  const [studentStats, setStudentStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics[]>([])
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([])
  const [offerPerformance, setOfferPerformance] = useState<OfferPerformance[]>([])
  const [isRedemptionsLoading, setIsRedemptionsLoading] = useState(true)
  const [isStudentsLoading, setIsStudentsLoading] = useState(true)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true)
  const [isBranchLoading, setIsBranchLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true) // Keep generic for initial load or offers
  const [redemptionsDateRange, setRedemptionsDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [studentsDateRange, setStudentsDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [analyticsDateRange, setAnalyticsDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7), // Default to 7 days for better chart view
    to: new Date(),
  })
  const [branchDateRange, setBranchDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [offersDateRange, setOffersDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [isOffersLoading, setIsOffersLoading] = useState(true)

  const colors = DASHBOARD_COLORS("corporate")

  // Sync activeTab with URL parameter on mount and when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tab = searchParams.get("tab")
    const validTabs = ["overview", "offers", "branches", "reports", "profile"]
    const tabFromUrl = tab && validTabs.includes(tab) ? tab : "overview"
    setActiveTab(tabFromUrl)
  }, [searchParams])

  // Update URL when activeTab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.push(`/corporate?${params.toString()}`, { scroll: false })
  }

  // Fetch Redemption Stats
  useEffect(() => {
    const fetchRedemptionStats = async () => {
      try {
        setIsRedemptionsLoading(true)
        const statsData = await getDashboardStats(redemptionsDateRange?.from, redemptionsDateRange?.to)
        setRedemptionStats(statsData)
      } catch (error) {
        toast.error("Failed to load redemption stats")
      } finally {
        setIsRedemptionsLoading(false)
      }
    }
    if (activeTab === "overview") fetchRedemptionStats()
  }, [activeTab, redemptionsDateRange])

  // Fetch Student Stats
  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        setIsStudentsLoading(true)
        const statsData = await getDashboardStats(studentsDateRange?.from, studentsDateRange?.to)
        setStudentStats(statsData)
      } catch (error) {
        console.error("Failed to load student stats")
      } finally {
        setIsStudentsLoading(false)
      }
    }
    if (activeTab === "overview") fetchStudentStats()
  }, [activeTab, studentsDateRange])

  // Fetch Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsAnalyticsLoading(true)
        const analyticsData = await getDashboardAnalytics(analyticsDateRange?.from, analyticsDateRange?.to)
        setAnalytics(analyticsData)
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setIsAnalyticsLoading(false)
      }
    }
    if (activeTab === "overview") fetchAnalytics()
  }, [activeTab, analyticsDateRange])

  // Fetch Branch Performance
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsBranchLoading(true)
        const branchData = await getBranchPerformance(branchDateRange?.from, branchDateRange?.to)
        setBranchPerformance(branchData)
      } catch (error) {
        console.error("Failed to fetch branch data", error)
      } finally {
        setIsBranchLoading(false)
      }
    }
    if (activeTab === "overview") fetchBranches()
  }, [activeTab, branchDateRange])

  // Fetch Offer Performance
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setIsOffersLoading(true)
        const offersData = await getOfferPerformance(offersDateRange?.from, offersDateRange?.to)
        setOfferPerformance(offersData)
      } catch (error) {
        console.error("Failed to fetch offers", error)
      } finally {
        setIsOffersLoading(false)
      }
    }
    if (activeTab === "overview") fetchOffers()
  }, [activeTab, offersDateRange])

  return (
    <div className="flex min-h-screen bg-background">
      <CorporateSidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SheetTitle className="sr-only">Corporate Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation</SheetDescription>
                  <CorporateSidebarContent activeTab={activeTab} onTabChange={(tab) => {
                    handleTabChange(tab)
                    document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
                  }} onLogout={onLogout} />
                </SheetContent>
              </Sheet>
              <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-6 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Corporate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all branches and track payables</p>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Card className="">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span>Total Redemptions</span>
                        <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                      </CardTitle>
                    </div>
                    <DatePickerWithRange date={redemptionsDateRange} setDate={setRedemptionsDateRange} className="w-auto" />
                  </CardHeader>
                  <CardContent>
                    {isRedemptionsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="size-6" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {redemptionStats?.totalRedemptions || 0}
                        </div>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                          <TrendingUp className="w-3 h-3" /> Total Redemptions
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span>Unique Students</span>
                        <Users className="w-4 h-4" style={{ color: colors.primary }} />
                      </CardTitle>
                    </div>
                    <DatePickerWithRange date={studentsDateRange} setDate={setStudentsDateRange} className="w-auto" />
                  </CardHeader>
                  <CardContent>
                    {isStudentsLoading ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="size-6" />
                      </div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {studentStats?.uniqueStudents || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Students who redeemed</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {/* Charts Row 1: Redemption Analytics & Branch Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle style={{ color: colors.primary }}>Redemption Analytics</CardTitle>
                      <CardDescription>Redemption activity (Time of Day)</CardDescription>
                    </div>
                    <DatePickerWithRange date={analyticsDateRange} setDate={setAnalyticsDateRange} className="w-auto" />
                  </CardHeader>
                  <CardContent>
                    {isAnalyticsLoading ? (
                      <div className="flex justify-center py-10">
                        <Spinner className="size-8" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        {analytics.length > 0 ? (
                          <LineChart data={analytics}>
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                            <XAxis dataKey="time" stroke={colors.mutedForeground} />
                            <YAxis stroke={colors.mutedForeground} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="redemptions"
                              stroke={colors.primary}
                              strokeWidth={2}
                              name="Redemptions"
                              dot={{ fill: colors.primary }}
                            />
                          </LineChart>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            No data available for today
                          </div>
                        )}
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle style={{ color: colors.primary }}>Branch Comparison</CardTitle>
                      <CardDescription>Top performing branches</CardDescription>
                    </div>
                    <DatePickerWithRange date={branchDateRange} setDate={setBranchDateRange} className="w-auto" />
                  </CardHeader>
                  <CardContent>
                    {isBranchLoading ? (
                      <div className="flex justify-center py-10">
                        <Spinner className="size-8" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        {branchPerformance.length > 0 ? (
                          <BarChart data={branchPerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                            <XAxis type="number" stroke={colors.mutedForeground} />
                            <YAxis dataKey="branchName" type="category" width={100} stroke={colors.mutedForeground} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="redemptions" fill={colors.primary} name="Redemptions" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            No branch data available
                          </div>
                        )}
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2: Offer Performance & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle style={{ color: colors.primary }}>Offer Performance</CardTitle>
                      <CardDescription>Top performing offers</CardDescription>
                    </div>
                    <DatePickerWithRange date={offersDateRange} setDate={setOffersDateRange} className="w-auto" />
                  </CardHeader>
                  <CardContent>
                    {isOffersLoading ? (
                      <div className="flex justify-center py-10">
                        <Spinner className="size-8" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {offerPerformance.length > 0 ? offerPerformance.map((offer, i) => (
                          <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${i < 3 ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <TrendingUp className={`w-4 h-4 ${i < 3 ? 'text-green-600' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{offer.title}</p>
                                <p className="text-xs text-muted-foreground">{offer.status}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold" style={{ color: colors.primary }}>{offer.currentRedemptions ?? 0}</p>
                              <p className="text-xs text-muted-foreground">Redemptions</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No offers data available</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Redemption Distribution</CardTitle>
                    <CardDescription>By branch percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isBranchLoading ? ( // Using same loading state as Branch Comparison since sharing data
                      <div className="flex justify-center py-10">
                        <Spinner className="size-8" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        {(() => {
                          // Filter to only show branches with redemptions
                          const activeBranches = branchPerformance.filter(b => b.redemptions > 0);

                          return activeBranches.length > 0 ? (
                            <PieChart>
                              <Pie
                                data={activeBranches}
                                dataKey="redemptions"
                                nameKey="branchName"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={(props: any) => {
                                  // Only show label if percentage > 5%
                                  const percentage = ((props.percent || 0) * 100);
                                  return percentage > 5 ? `${props.branchName} ${percentage.toFixed(0)}%` : '';
                                }}
                              >
                                {activeBranches.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getChartColor("corporate", index)} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: any, name: any) => [`${value} redemptions`, name]}
                              />
                              <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value: string) => {
                                  // Truncate long branch names in legend
                                  return value.length > 15 ? value.substring(0, 15) + '...' : value;
                                }}
                              />
                            </PieChart>
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              No redemption data available
                            </div>
                          );
                        })()}
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "offers" && <CorporateOffers />}

          {activeTab === "branches" && <CorporateBranches />}

          {activeTab === "profile" && <CorporateProfile />}

          {activeTab === "reports" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle style={{ color: colors.primary }}>Reports & Export</CardTitle>
                  <CardDescription>Download detailed analytics reports</CardDescription>
                </div>
                <Button className="gap-2" style={{ backgroundColor: colors.primary }}>
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Reports functionality coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
