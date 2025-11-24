"use client"

import { useState } from "react"
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
import { OffersManagement } from "./offers-management"
import { DASHBOARD_COLORS, getChartColor } from "@/lib/colors"

const mockRedemptionTrend = [
  { date: "Mon", redemptions: 120, payable: 24000 },
  { date: "Tue", redemptions: 150, payable: 30000 },
  { date: "Wed", redemptions: 100, payable: 20000 },
  { date: "Thu", redemptions: 180, payable: 36000 },
  { date: "Fri", redemptions: 220, payable: 44000 },
  { date: "Sat", redemptions: 250, payable: 50000 },
  { date: "Sun", redemptions: 190, payable: 38000 },
]

const mockBranchPerformance = [
  { branch: "Downtown", redemptions: 450, footfall: 1200 },
  { branch: "Mall Branch", redemptions: 380, footfall: 980 },
  { branch: "Airport", redemptions: 320, footfall: 750 },
  { branch: "University", redemptions: 290, footfall: 680 },
]

const mockPayables = [
  { week: "Week 1", count: 425, payable: 85000 },
  { week: "Week 2", count: 605, payable: 121000 },
  { week: "Week 3", count: 520, payable: 104000 },
  { week: "Week 4", count: 710, payable: 142000 },
]

export function CorporateDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const colors = DASHBOARD_COLORS("corporate")

  return (
    <div className="flex min-h-screen bg-background">
      <CorporateSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Corporate Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage all branches and track payables</p>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Total Redemptions</span>
                      <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">2,260</div>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                      <TrendingUp className="w-3 h-3" /> +12% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Payable to Parchi</span>
                      <DollarSign className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">Rs. 452,000</div>
                    <p className="text-xs text-muted-foreground mt-1">2,260 × Rs. 200/redemption</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Active Students</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">3,240</div>
                    <p className="text-xs text-muted-foreground mt-1">Verified accounts</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Active Branches</span>
                      <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">4</div>
                    <p className="text-xs text-muted-foreground mt-1">Operating locations</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Redemptions & Payables</CardTitle>
                    <CardDescription>Redemption count and amount owed to Parchi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockRedemptionTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="redemptions"
                          stroke={colors.primary}
                          strokeWidth={2}
                          name="Redemptions"
                        />
                        <Line
                          type="monotone"
                          dataKey="payable"
                          stroke={colors.chart3}
                          strokeWidth={2}
                          name="Payable (PKR)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Branch Performance</CardTitle>
                    <CardDescription>Redemptions and footfall this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockBranchPerformance}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="branch" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="redemptions" fill={colors.primary} name="Redemptions" />
                        <Bar dataKey="footfall" fill={colors.chart2} name="Footfall" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Payables Calculation</CardTitle>
                    <CardDescription>Redemption count × Rs. 200 per redemption</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={mockPayables}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="week" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip
                          formatter={(value) => {
                            if (typeof value === "number" && value > 1000) return `Rs. ${value.toLocaleString()}`
                            return value
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="payable"
                          stroke={colors.primary}
                          strokeWidth={2}
                          name="Payable (PKR)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Redemption Distribution</CardTitle>
                    <CardDescription>By branch percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={mockBranchPerformance}
                          dataKey="redemptions"
                          nameKey="branch"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {mockBranchPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getChartColor("corporate", index)} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "offers" && <OffersManagement />}

          {activeTab === "branches" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Branch Management</CardTitle>
                  <CardDescription>Manage your branch locations</CardDescription>
                </div>
                <Button className="gap-2" style={{ backgroundColor: colors.primary }}>
                  <Plus className="w-4 h-4" />
                  Add Branch
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Branch management coming soon</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "reports" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Reports & Export</CardTitle>
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
