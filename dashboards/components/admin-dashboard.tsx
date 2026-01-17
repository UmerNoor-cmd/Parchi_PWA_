"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { AdminSidebar, AdminSidebarContent } from "./admin-sidebar"
import { Check, X, TrendingUp, Users, FileText, ShoppingCart, CheckCircle2, ChevronDown, ChevronUp, Menu, RefreshCw } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AdminKYC } from "./admin-kyc"
import { AdminMerchants } from "./admin-merchants"
import { AdminBranches } from "./admin-branches"
import { AdminOffers } from "./admin-offers"
import { AccountCreation } from "./account-creation"
import { AdminAuditLogs } from "./admin-audit-logs"
import { getAdminDashboardStats, getTopPerformingMerchants, AdminDashboardStats } from "@/lib/api-client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

// Top Performing Merchants Component
const TopPerformingMerchants = ({
  merchants: initialMerchants,
  isLoading: initialLoading,
}: {
  merchants: AdminDashboardStats['topPerformingMerchants'] | null,
  isLoading: boolean,
}) => {
  const [merchants, setMerchants] = useState<AdminDashboardStats['topPerformingMerchants'] | null>(initialMerchants);
  const [loading, setLoading] = useState(false);
  const [expandedMerchants, setExpandedMerchants] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const colors = DASHBOARD_COLORS("admin");

  // Sync initial data ONLY if we don't have a custom range selected (conceptually "All Time")
  // This prevents parent's auto-refresh from overwriting a specific date filter selection
  useEffect(() => {
    if (!dateRange?.from) {
      setMerchants(initialMerchants);
    }
  }, [initialMerchants, dateRange]);

  // Effect to trigger fetch when date range changes
  useEffect(() => {
    if (dateRange?.from) {
      // If we have at least a start date, fetch
      // Note: date-fns/react-day-picker might give undefined 'to' if only start is picked
      // We pass it anyway, backend/api handles logic
      fetchMerchants(dateRange.from, dateRange.to);
    } else {
      // If range was cleared, we can revert to initialMerchants if available, or fetch all time
      if (initialMerchants) {
        setMerchants(initialMerchants);
      } else {
        fetchMerchants(undefined, undefined);
      }
    }
  }, [dateRange]);

  const fetchMerchants = async (start?: Date, end?: Date) => {
    setLoading(true);
    try {
      const data = await getTopPerformingMerchants(start, end);
      setMerchants(data);
    } catch (error) {
      console.error('Failed to fetch top merchants:', error);
      toast.error('Failed to update top merchants');
    } finally {
      setLoading(false);
    }
  };

  const toggleMerchant = (merchantId: string) => {
    setExpandedMerchants(prev =>
      prev.includes(merchantId)
        ? prev.filter(id => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  // Only show loading state if:
  // 1. We are locally fetching data (loading is true)
  // 2. We are in "all" mode (no date range) and the parent is loading (initialLoading is true) AND we don't have data yet
  const isLoadingState = loading || (!dateRange?.from && initialLoading && !merchants);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle style={{ color: colors.primary }}>Top Performing Merchants</CardTitle>
          <CardDescription>Based on redemption volume</CardDescription>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
          <Button
            variant={!dateRange?.from ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(undefined)}
            className="w-full md:w-auto"
          >
            All Time
          </Button>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-full md:w-[300px]"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isLoadingState ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)
          ) : (
            merchants?.map((merchant, idx) => (
              <div key={merchant.id} className="border rounded-lg p-3">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleMerchant(merchant.id)}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="font-bold text-lg text-muted-foreground w-8 shrink-0 text-center">
                      #{idx + 1}
                    </div>
                    {merchant.logoPath ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <img
                          src={merchant.logoPath}
                          alt={merchant.businessName}
                          className="object-cover h-full w-full"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {merchant.businessName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{merchant.businessName}</div>
                      <div className="text-xs text-muted-foreground">
                        {merchant.category || "General"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 md:gap-4">
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold">
                        {merchant.redemptionCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Redemptions
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0 mb-1">
                      {expandedMerchants.includes(merchant.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedMerchants.includes(merchant.id) && (
                  <div className="mt-4 pt-4 border-t pl-14 pr-4">
                    <h4 className="text-sm font-semibold mb-2">Branch Breakdown</h4>
                    <div className="space-y-2">
                      {merchant.branches && merchant.branches.length > 0 ? (
                        merchant.branches.map(branch => (
                          <div key={branch.id} className="flex justify-between items-center text-sm border-b last:border-0 py-2">
                            <span className="text-muted-foreground">{branch.branchName}</span>
                            <span className="font-medium bg-muted px-2 py-1 rounded text-xs">{branch.redemptionCount} redemptions</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic">No branches found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<string>("overview")
  const colors = DASHBOARD_COLORS("admin")

  // Real-time dashboard statistics
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch dashboard stats
  const fetchStats = async (start?: Date, end?: Date) => {
    // Only show loading state on initial load to prevent flashing skeletons on refresh
    if (!stats) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await getAdminDashboardStats(start, end)
      setStats(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch on mount and set up auto-refresh
  useEffect(() => {
    fetchStats()

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

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
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation</SheetDescription>
                  <AdminSidebarContent activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab)
                    // The Sheet automatically closes on interaction if we don't control open state, 
                    // but usually we might need a controlled state to close it.
                    // For now relying on default behavior or user clicking overlay. 
                    // actually default sheet doesn't close on inner click unless we use DialogClose.
                    // Let's add a close wrapper or just let user click outside.
                    // A better UX is to close on selection. 
                    document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
                  }} onLogout={onLogout} />
                </SheetContent>
              </Sheet>
              <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-6 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Platform management and oversight</p>
            </div>
            <div className="flex items-center gap-2">
              {activeTab !== "kyc" && (
                <Button variant="outline" size="icon" onClick={() => fetchStats()} disabled={isLoading || isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              {isLoading ? (
                <div className="flex h-[50vh] items-center justify-center">
                  <Spinner className="size-10" />
                </div>
              ) : !stats ? (
                <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                  <p className="text-muted-foreground">Failed to load dashboard data</p>
                  <Button onClick={() => fetchStats()}>Retry</Button>
                </div>
              ) : (
                <>
                  {/* Platform Overview */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Platform Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Platform Overview - Real-time Data */}
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Active Students</span>
                            <Users className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalActiveStudents.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">+{stats?.platformOverview.totalActiveStudentsGrowth}% MoM</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Verified Merchants</span>
                            <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalVerifiedMerchants}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">+{stats?.platformOverview.totalVerifiedMerchantsGrowth}% this month</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>Total Redemptions</span>
                            <CheckCircle2 className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {stats?.platformOverview.totalRedemptions.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">All Time</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* User Management & Financial Oversight */}
                  <div className="mb-8">
                    {/* User Management */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>User Management</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* User Management - Real-time Data */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>Verification Queue</span>
                              <Users className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats?.userManagement.verificationQueue}</div>
                            <p className="text-xs text-muted-foreground mt-1">Pending Requests</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>Suspended/Rejected</span>
                              <X className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats?.userManagement.suspendedRejected}</div>
                            <p className="text-xs text-muted-foreground mt-1">Accounts</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>


                    {/* Merchant Performance & Student Analytics */}
                    <div className="mb-8 mt-12">
                      {/* Merchant Performance */}
                      <div className="mb-8">
                        <TopPerformingMerchants
                          merchants={stats?.topPerformingMerchants || null}
                          isLoading={isLoading}
                        />
                      </div>
                      {/* Student Analytics */}
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle style={{ color: colors.primary }}>University Distribution</CardTitle>
                            <CardDescription>Student base by university</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {stats?.universityDistribution && stats.universityDistribution.length > 0 ? (
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={stats.universityDistribution.map(u => ({
                                      name: u.university,
                                      value: u.studentCount
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {stats.universityDistribution.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={[colors.primary, "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--muted))"][index % 5]} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                No university data available
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Leaderboard Top Performers
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                {stats?.leaderboardTopPerformers ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Students</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Founders Club Members
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                {stats?.foundersClubMembers ?? 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Exclusive Members</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "kyc" && <AdminKYC />}

          {activeTab === "merchants" && <AdminMerchants />}

          {activeTab === "branches" && <AdminBranches />}

          {activeTab === "offers" && <AdminOffers />}

          {activeTab === "logs" && <AdminAuditLogs />}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Settings configuration coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "account-creation" && <AccountCreation />}
        </div>
      </main>
    </div>
  )
}
