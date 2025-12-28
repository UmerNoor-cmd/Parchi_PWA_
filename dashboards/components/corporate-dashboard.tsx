import { useState, useEffect } from "react"
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
import { TrendingUp, Users, DollarSign, ShoppingCart, Plus, Download } from "lucide-react"
import { CorporateSidebar } from "./corporate-sidebar"
import { CorporateOffers } from "./corporate-offers"
import { CorporateBranches } from "./corporate-branches"
import { CorporateProfile } from "./corporate-profile"
import { DASHBOARD_COLORS, getChartColor } from "@/lib/colors"

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

export function CorporateDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics[]>([])
  const [branchPerformance, setBranchPerformance] = useState<BranchPerformance[]>([])
  const [offerPerformance, setOfferPerformance] = useState<OfferPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const colors = DASHBOARD_COLORS("corporate")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [statsData, analyticsData, branchData, offersData] = await Promise.all([
          getDashboardStats(),
          getDashboardAnalytics(),
          getBranchPerformance(),
          getOfferPerformance()
        ])

        setStats(statsData)
        setAnalytics(analyticsData)
        setBranchPerformance(branchData)
        setOfferPerformance(offersData)
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === "overview") {
      fetchData()
    }
  }, [activeTab])

  return (
    <div className="flex min-h-screen bg-background">
      <CorporateSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Total Redemptions</span>
                      <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                      {stats?.totalRedemptions || 0}
                    </div>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                      <TrendingUp className="w-3 h-3" /> Total Redemptions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Unique Students</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                      {stats?.uniqueStudents || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Students who redeemed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {/* Charts Row 1: Redemption Analytics & Branch Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Redemption Analytics</CardTitle>
                    <CardDescription>Redemption activity (Time of Day)</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Branch Comparison</CardTitle>
                    <CardDescription>Top performing branches by redemption volume</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              {/* Additional Charts */}
              {/* Charts Row 2: Offer Performance & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Offer Performance</CardTitle>
                    <CardDescription>Top performing offers</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                            <p className="font-bold" style={{ color: colors.primary }}>{offer.currentRedemptions}</p>
                            <p className="text-xs text-muted-foreground">Redemptions</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No offers data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Redemption Distribution</CardTitle>
                    <CardDescription>By branch percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
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
