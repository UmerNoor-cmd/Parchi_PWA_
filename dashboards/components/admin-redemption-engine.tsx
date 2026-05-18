"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { getRedemptionAnalytics, RedemptionAnalytics } from "@/lib/api-client"
import { Users, TrendingUp, Repeat, Gift, Activity, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { RefreshCw, Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type VolumeView = "daily" | "weekly" | "monthly"

const VIEW_LABELS: Record<VolumeView, string> = {
  daily: "Daily (30 days)",
  weekly: "Weekly (12 weeks)",
  monthly: "Monthly (12 months)",
}

function formatDateLabel(date: string, view: VolumeView): string {
  if (view === "monthly") {
    // "YYYY-MM" → "Jan 25"
    const [year, month] = date.split("-")
    const d = new Date(Number(year), Number(month) - 1)
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }
  // "YYYY-MM-DD" → "Apr 30"
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-primary font-medium">{payload[0].value} redemptions</p>
      </div>
    )
  }
  return null
}

const HistogramTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label} redemption{label === "1" ? "" : "s"}</p>
        <p className="text-primary font-medium">{payload[0].value} users</p>
      </div>
    )
  }
  return null
}

export function AdminRedemptionEngine({ 
  externalStudentId, 
  onExternalIdHandled 
}: { 
  externalStudentId?: string | null;
  onExternalIdHandled?: () => void;
}) {
  const colors = DASHBOARD_COLORS("admin")
  const [data, setData] = useState<RedemptionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [volumeView, setVolumeView] = useState<VolumeView>("daily")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [filterStudentId, setFilterStudentId] = useState<string | null>(null)

  const fetchData = async (range?: DateRange, studentId: string | null = filterStudentId) => {
    if (!data) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const result = await getRedemptionAnalytics(range?.from, range?.to, studentId)
      setData(result)
    } catch (err) {
      console.error("Failed to load redemption analytics:", err)
      toast.error("Failed to load redemption analytics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Handle external student selection
  useEffect(() => {
    if (externalStudentId) {
      setFilterStudentId(externalStudentId)
      fetchData(dateRange, externalStudentId)
      onExternalIdHandled?.()
    }
  }, [externalStudentId])

  // Fetch when date range changes (maintaining current filter)
  useEffect(() => {
    fetchData(dateRange, filterStudentId)
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Failed to load redemption analytics</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  // --- Volume trend chart data ---
  const volumeData = data.volumeTrends[volumeView].map((d) => ({
    date: formatDateLabel(d.date, volumeView),
    count: d.count,
  }))

  // --- Histogram data ---
  const histogramData = data.behaviorHistogram.map((b) => ({
    bucket: b.bucket === "4+" ? "4+" : `${b.bucket}`,
    users: b.userCount,
  }))

  // --- Bonus stats ---
  const { totalBonusTriggers, uniqueStudentsTriggered, usersReturnedAfterBonus, conversionRate } =
    data.fifthBonusStats

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
            Redemption &amp; Behavioral Engine
          </h2>
          <p className="text-muted-foreground text-sm">
            Insights into redemption volume, user behavior, and bonus program performance
          </p>
          {filterStudentId && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-100">
                <Users className="w-3.5 h-3.5" />
                <span>Student ID: {filterStudentId.slice(0, 8)}...</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 hover:bg-blue-100 rounded-full"
                  onClick={() => { setFilterStudentId(null); fetchData(dateRange, null); }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <Button
                variant={!dateRange?.from ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(undefined)}
                className={`h-8 px-3 text-[10px] font-black uppercase rounded-full transition-all ${!dateRange?.from ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400'}`}
              >
                All Time
              </Button>
              <DatePickerWithRange 
                date={dateRange}
                setDate={setDateRange}
                className="w-[280px]"
              />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            disabled={isRefreshing}
            onClick={() => fetchData(dateRange)} 
            className="rounded-2xl h-11 w-11 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 z-50 bg-background/20 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
            <Spinner className="size-8" />
          </div>
        )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Unique Redeemers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dashed border-muted-foreground/30 flex items-center gap-1">
                      Unique Redeemers <Info className="w-3 h-3 opacity-50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Count of distinct students who have completed at least one verified redemption in the selected period.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              <Users className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {data.uniqueRedeemers.toLocaleString()}
            </div>
            <div className="space-y-0.5 mt-1">
              <p className="text-xs text-muted-foreground">Users with ≥1 verified redemption</p>
              <p className="text-[10px] font-medium text-indigo-600/70">
                {data.uniqueRedeemers.toLocaleString()} of {data.totalRegisteredStudents.toLocaleString()} total registered ({data.totalRegisteredStudents > 0 ? Math.round((data.uniqueRedeemers / data.totalRegisteredStudents) * 100) : 0}%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Bonus Triggers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>5th-Bonus Triggers</span>
              <Gift className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {totalBonusTriggers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {uniqueStudentsTriggered.toLocaleString()} unique students
            </p>
          </CardContent>
        </Card>

        {/* Bonus Conversion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Post-Bonus Return Rate</span>
              <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Redeemed again within 30 days of bonus
            </p>
          </CardContent>
        </Card>

        {/* 90-day Repeat Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>90-Day Repeat Rate</span>
              <Repeat className="w-4 h-4" style={{ color: colors.primary }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {data.repeatRates.find((r) => r.windowDays === 90)?.repeatRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Users who redeemed again within 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Volume Trends ── */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle style={{ color: colors.primary }}>Redemption Volume Trends</CardTitle>
            <CardDescription>
              {VIEW_LABELS[volumeView]}
              {dateRange?.from && (
                <span className="ml-2 opacity-70">
                  ({dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString() || '...'})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["daily", "weekly", "monthly"] as VolumeView[]).map((v) => (
              <Button
                key={v}
                size="sm"
                variant={volumeView === v ? "default" : "outline"}
                onClick={() => setVolumeView(v)}
                className="capitalize"
              >
                {v}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {volumeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={volumeData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={colors.primary}
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Histogram + Repeat Rates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Behavior Histogram */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: colors.primary }}>User Behavior Histogram</CardTitle>
            <CardDescription>How many redemptions each user has made</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={histogramData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={(v) => (v === "4+" ? "4+" : `${v}`)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  label={{ value: "Redemptions", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<HistogramTooltip />} />
                <Bar dataKey="users" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={72} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repeat Rate Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: colors.primary }}>Repeat Rate Monitoring</CardTitle>
            <CardDescription>Users who redeemed again after their first redemption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {data.repeatRates.map((stat) => (
              <div key={stat.windowDays} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{stat.windowDays}-Day Window</span>
                  <span className="font-bold text-lg" style={{ color: colors.primary }}>
                    {stat.repeatRate}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(stat.repeatRate, 100)}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.repeatCount.toLocaleString()} of {stat.totalRedeemers.toLocaleString()} users
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 5th Bonus Tracking ── */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: colors.primary }}>5th-Redemption Bonus Tracking</CardTitle>
          <CardDescription>
            Monitor loyalty-bonus trigger events and their impact on continued engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Total Triggers</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {totalBonusTriggers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Unique Students</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {uniqueStudentsTriggered.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Returned (30 days)</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {usersReturnedAfterBonus.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {conversionRate}%
              </p>
              <p className="text-[10px] text-muted-foreground">returned after bonus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}
