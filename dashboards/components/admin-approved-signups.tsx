"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { DASHBOARD_COLORS } from "@/lib/colors"
import {
  getApprovedSignupsAnalytics,
  ApprovedSignupsAnalytics,
} from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import {
  RefreshCw,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

type Granularity = "1D" | "1W" | "1M" | "1Y"

const GRANULARITY_KEY: Record<Granularity, keyof ApprovedSignupsAnalytics["volumeTrends"]> = {
  "1D": "daily",
  "1W": "weekly",
  "1M": "monthly",
  "1Y": "yearly",
}

const DEFAULT_WINDOW_LABEL: Record<Granularity, string> = {
  "1D": "Daily · last 30 days",
  "1W": "Weekly · last 12 weeks",
  "1M": "Monthly · last 12 months",
  "1Y": "Yearly · last 5 years",
}

function formatBucketLabel(date: string, granularity: Granularity): string {
  if (granularity === "1Y") {
    // "YYYY"
    return date
  }
  if (granularity === "1M") {
    // "YYYY-MM" -> "Jan 25"
    const [year, month] = date.split("-")
    const d = new Date(Number(year), Number(month) - 1)
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }
  // "YYYY-MM-DD" -> "Apr 30"
  const d = new Date(date + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div className="bg-background border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-primary font-medium">
          {value} approved signup{value === 1 ? "" : "s"}
        </p>
      </div>
    )
  }
  return null
}

export function AdminApprovedSignups() {
  const colors = DASHBOARD_COLORS("admin")
  const [data, setData] = useState<ApprovedSignupsAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [granularity, setGranularity] = useState<Granularity>("1M")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const fetchData = async (range?: DateRange) => {
    if (!data) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const result = await getApprovedSignupsAnalytics(range?.from, range?.to)
      setData(result)
    } catch (err) {
      console.error("Failed to load approved signups analytics:", err)
      toast.error("Failed to load approved signups analytics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(dateRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const trend = data?.volumeTrends[GRANULARITY_KEY[granularity]] ?? []
  const chartData = trend.map((d) => ({
    label: formatBucketLabel(d.date, granularity),
    count: d.count,
  }))

  const changePositive = (data?.changePercent ?? 0) > 0
  const changeNegative = (data?.changePercent ?? 0) < 0

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 space-y-0 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <CardTitle
            className="flex items-center gap-2"
            style={{ color: colors.primary }}
          >
            <UserCheck className="h-5 w-5" />
            New Approved Signups
          </CardTitle>
          <CardDescription>
            Students approved (KYC verified) over time —{" "}
            {dateRange?.from
              ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to?.toLocaleDateString() ?? "…"}`
              : DEFAULT_WINDOW_LABEL[granularity]}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Granularity: 1D / 1W / 1M / 1Y */}
          <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {(["1D", "1W", "1M", "1Y"] as Granularity[]).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={granularity === g ? "default" : "ghost"}
                onClick={() => setGranularity(g)}
                className={`h-7 w-9 rounded-full px-0 text-[11px] font-black ${
                  granularity === g
                    ? "bg-indigo-600 text-white hover:bg-indigo-600"
                    : "text-slate-400"
                }`}
              >
                {g}
              </Button>
            ))}
          </div>

          {/* Free date range (start + end) */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 p-1.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <Button
              variant={!dateRange?.from ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(undefined)}
              className={`h-8 rounded-full px-3 text-[10px] font-black uppercase transition-all ${
                !dateRange?.from
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-400"
              }`}
            >
              All Time
            </Button>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-[260px]"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={isRefreshing}
            onClick={() => fetchData(dateRange)}
            className="h-10 w-10 rounded-2xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-[320px] items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : !data ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">
              Failed to load approved signups analytics
            </p>
            <Button onClick={() => fetchData(dateRange)}>Retry</Button>
          </div>
        ) : (
          <div className="relative space-y-6">
            {isRefreshing && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-background/20 backdrop-blur-[1px]">
                <Spinner className="size-8" />
              </div>
            )}

            {/* KPI strip */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">
                  {dateRange?.from ? "Approved in range" : "Approved (all time)"}
                </p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {data.totalApproved.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Approved this month</p>
                <p
                  className="mt-1 text-2xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {data.thisMonth.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">vs last month</p>
                <p className="mt-1 flex items-center gap-1 text-2xl font-bold">
                  <span style={{ color: colors.primary }}>
                    {data.lastMonth.toLocaleString()}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      changePositive
                        ? "text-emerald-600"
                        : changeNegative
                          ? "text-rose-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {changePositive ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : changeNegative ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : null}
                    {changePositive ? "+" : ""}
                    {data.changePercent}%
                  </span>
                </p>
              </div>
            </div>

            {/* Volume chart */}
            {chartData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No approved signups for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="approvedSignupsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={colors.primary}
                    strokeWidth={2}
                    fill="url(#approvedSignupsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
