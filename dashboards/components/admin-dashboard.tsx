"use client"

import { useState } from "react"
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

const mockPlatformStats = [
  { label: "Total Active Students", value: "12,450", icon: Users, trend: "+12% MoM" },
  { label: "Total Verified Merchants", value: "85", icon: ShoppingCart, trend: "+5 this month" },
  { label: "Total Redemptions", value: "45,200", icon: CheckCircle2, trend: "All Time" },
  { label: "Platform Growth Rate", value: "18%", icon: TrendingUp, trend: "Month over Month" },
]

const mockUserManagement = [
  { label: "Verification Queue", value: "142", subtext: "Pending Requests", icon: Users },
  { label: "Suspended/Rejected", value: "24", subtext: "Accounts", icon: X },
]

const mockFinancials = [
  { label: "Corporate Payments Due", value: "Rs. 1.2M", subtext: "Next 30 Days", icon: FileText },
  { label: "Payment Collection", value: "92%", subtext: "On Time", icon: Check },
  { label: "Financial Projections", value: "+22%", subtext: "Q4 Growth", icon: TrendingUp },
]

const mockTopMerchants = [
  { name: "Burger Hub", redemptions: 1200, rating: 4.8 },
  { name: "Pizza Palace", redemptions: 980, rating: 4.5 },
  { name: "Coffee Corner", redemptions: 850, rating: 4.7 },
  { name: "Student Station", redemptions: 720, rating: 4.6 },
  { name: "Tech Gadgets", redemptions: 650, rating: 4.9 },
]

const mockUniversityDistribution = [
  { name: "FAST-NUCES", value: 35 },
  { name: "IBA", value: 25 },
  { name: "LUMS", value: 20 },
  { name: "NUST", value: 15 },
  { name: "Other", value: 5 },
]

const mockEngagementMetrics = [
  { label: "Leaderboard Top Performers", value: "50", subtext: "Students" },
  { label: "Founders Club Members", value: "120", subtext: "Exclusive Members" },
]

const mockSystemLogs = [
  { id: 1, action: "Redemption processed", branch: "Downtown Branch", time: "2 mins ago", type: "success" },
  { id: 2, action: "KYC approved", student: "Ahmed Ali", time: "15 mins ago", type: "success" },
  { id: 3, action: "Merchant registered", merchant: "New Restaurant", time: "1 hour ago", type: "success" },
  { id: 4, action: "Invalid Parchi ID attempted", branch: "Mall Branch", time: "2 hours ago", type: "warning" },
]

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("overview")
  const colors = DASHBOARD_COLORS("admin")

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockPlatformStats.map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            <span>{stat.label}</span>
                            <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stat.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* User Management & Financial Oversight */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* User Management */}
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>User Management</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockUserManagement.map((stat, idx) => {
                      const Icon = stat.icon
                      return (
                        <Card key={idx}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>{stat.label}</span>
                              <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Financial Oversight */}
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>Financial Oversight</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mockFinancials.map((stat, idx) => {
                      const Icon = stat.icon
                      return (
                        <Card key={idx}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                              <span>{stat.label}</span>
                              <Icon className="w-4 h-4" style={{ color: colors.primary }} />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Merchant Performance & Student Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Merchant Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Top 10 Performing Merchants</CardTitle>
                    <CardDescription>Based on redemption volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockTopMerchants.map((merchant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-lg w-6 text-muted-foreground">#{idx + 1}</div>
                            <div>
                              <p className="font-semibold">{merchant.name}</p>
                              <p className="text-xs text-muted-foreground">Rating: {merchant.rating} ⭐</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: colors.primary }}>{merchant.redemptions}</p>
                            <p className="text-xs text-muted-foreground">Redemptions</p>
                          </div>
                        </div>
                      ))}
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
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={mockUniversityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {mockUniversityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={[colors.primary, "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--muted))"][index % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    {mockEngagementMetrics.map((metric, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {metric.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold" style={{ color: colors.primary }}>{metric.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
                        </CardContent>
                      </Card>
                    ))}
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

          {activeTab === "logs" && (
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Real-time system events and redemptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSystemLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${log.type === "success" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.branch || log.student || log.merchant} • {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
