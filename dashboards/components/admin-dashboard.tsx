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
import { AdminOffers } from "./admin-offers"

const mockSystemStats = [
  { date: "Mon", redemptions: 120, kyc_approvals: 15, merchant_reg: 3 },
  { date: "Tue", redemptions: 150, kyc_approvals: 22, merchant_reg: 5 },
  { date: "Wed", redemptions: 100, kyc_approvals: 18, merchant_reg: 2 },
  { date: "Thu", redemptions: 180, kyc_approvals: 28, merchant_reg: 6 },
  { date: "Fri", redemptions: 220, kyc_approvals: 32, merchant_reg: 8 },
  { date: "Sat", redemptions: 250, kyc_approvals: 25, merchant_reg: 4 },
  { date: "Sun", redemptions: 190, kyc_approvals: 20, merchant_reg: 3 },
]

const mockKycRequests = [
  { id: 1, name: "Ahmed Ali", university: "FAST-NUCES", status: "pending", submitted: "2 hours ago" },
  { id: 2, name: "Fatima Khan", university: "IBA", status: "pending", submitted: "45 mins ago" },
  { id: 3, name: "Hassan Saeed", university: "LUMS", status: "approved", submitted: "1 day ago" },
  { id: 4, name: "Zara Ahmed", university: "FAST-NUCES", status: "pending", submitted: "30 mins ago" },
]

const mockMerchantRequests = [
  { id: 1, name: "Burger Hub Downtown", type: "Corporate", status: "pending", submitted: "3 hours ago" },
  { id: 2, name: "Pizza Palace - Mall Branch", type: "Branch", status: "pending", submitted: "1 hour ago" },
  { id: 3, name: "Coffee Corner", type: "Corporate", status: "approved", submitted: "2 days ago" },
]

const mockOffers = [
  { id: 1, merchant: "Burger Hub", offer: "20% off", status: "active", revenue: "Rs. 45,000" },
  { id: 2, merchant: "Pizza Palace", offer: "Rs. 300 off", status: "review", revenue: "N/A" },
  { id: 3, merchant: "Coffee Corner", offer: "15% off", status: "rejected", revenue: "N/A" },
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
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform management and oversight</p>
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
                    <div className="text-3xl font-bold">1,210</div>
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                      <TrendingUp className="w-3 h-3" /> +8% this week
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>KYC Pending</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">142</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Merchant Requests</span>
                      <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground mt-1">Pending approval</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: colors.primary }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Offers Reviewed</span>
                      <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground mt-1">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>Redemptions and approvals this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockSystemStats}>
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
                          dataKey="kyc_approvals"
                          stroke={colors.chart2}
                          strokeWidth={2}
                          name="KYC Approvals"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Merchant Registrations</CardTitle>
                    <CardDescription>Applications by type this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockSystemStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" stroke={colors.mutedForeground} />
                        <YAxis stroke={colors.mutedForeground} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="merchant_reg" fill={colors.primary} name="New Applications" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "kyc" && <AdminKYC />}

          {activeTab === "merchants" && <AdminMerchants />}

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
        </div>
      </main>
    </div>
  )
}
