"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { AdminSidebar } from "./admin-sidebar"
import { Check, X, TrendingUp, Users, FileText, ShoppingCart, CheckCircle2 } from "lucide-react"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { AdminKYC } from "./admin-kyc"
import { AdminMerchants } from "./admin-merchants"
import { AdminBranches } from "./admin-branches"
import { AdminOffers } from "./admin-offers"
import { AccountCreation } from "./account-creation"
import { AdminAuditLogs } from "./admin-audit-logs"
import { getAdminDashboardStats, AdminDashboardStats } from "@/lib/api-client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("overview")
  const colors = DASHBOARD_COLORS("admin")

  // Real-time dashboard statistics
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const data = await getAdminDashboardStats()
      setStats(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch on mount and set up auto-refresh
  useEffect(() => {
    fetchStats()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform management and oversight</p>
          </div>

          {activeTab === "overview" && (
            <>
              <>
                {/* Platform Overview */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Platform Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Platform Overview - Real-time Data */}
                    {isLoading ? (
                      <>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Loading...</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-24" /></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Loading...</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-24" /></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Loading...</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-24" /></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Loading...</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-24" /></CardContent></Card>
                      </>
                    ) : (
                      <>
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

                      </>
                    )}

                  </div>
                </div>

                {/* User Management & Financial Oversight */}
                <div className="mb-8">
                  {/* User Management */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>User Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* User Management - Real-time Data */}
                      {isLoading ? (
                        <>
                          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Verification Queue</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-20" /></CardContent></Card>
                          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Suspended/Rejected</CardTitle></CardHeader><CardContent><Skeleton className="h-10 w-20" /></CardContent></Card>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}

                    </div>
                  </div>


                </div>

                {/* Merchant Performance & Student Analytics */}
                <div className="mb-8">
                  {/* Merchant Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle style={{ color: colors.primary }}>Top 10 Performing Merchants</CardTitle>
                      <CardDescription>Based on redemption volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Top Merchants - Real-time Data */}
                        {isLoading ? (
                          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)
                        ) : (
                          stats?.topPerformingMerchants.map((merchant, idx) => (
                            <div key={merchant.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                                <div>
                                  <div className="font-medium">{merchant.businessName}</div>
                                  {merchant.category && <div className="text-xs text-muted-foreground">{merchant.category}</div>}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{merchant.redemptionCount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Redemptions</div>
                              </div>
                            </div>
                          ))
                        )}

                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Analytics */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle style={{ color: colors.primary }}>University Distribution</CardTitle>
                        <CardDescription>Student base by university</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center h-[250px]">
                            <Skeleton className="h-[200px] w-[200px] rounded-full" />
                          </div>
                        ) : stats?.universityDistribution && stats.universityDistribution.length > 0 ? (
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
                      {isLoading ? (
                        <>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Leaderboard Top Performers
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Skeleton className="h-8 w-16" />
                              <Skeleton className="h-4 w-20 mt-1" />
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                Founders Club Members
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Skeleton className="h-8 w-16" />
                              <Skeleton className="h-4 w-24 mt-1" />
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
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
