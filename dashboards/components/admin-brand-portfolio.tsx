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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DASHBOARD_COLORS } from "@/lib/colors"
import {
  getBrandPortfolioHealth,
  getCompetitorBenchmarks,
  addCompetitorBenchmark,
  deleteCompetitorBenchmark,
  BrandPortfolioHealth,
  CompetitorBenchmarks,
} from "@/lib/api-client"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Users,
  BarChart2,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const METRIC_LABELS: Record<string, string> = {
  total_redemptions: "Total Redemptions",
  active_students:   "Active Students",
  active_brands:     "Active Brand Partners",
}

const WEEK_COLORS = ["#94a3b8", "#64748b", "#3b82f6", "#1d4ed8"]
const REACH_TOTAL_COLOR = "#94a3b8"

function ReachMetricBar({
  value,
  max,
  color,
}: {
  value: number
  max: number
  color: string
}) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div className="h-2 rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
      </div>
      <span className="w-14 text-right text-sm font-semibold tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}

function TrendIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up")   return <TrendingUp   className="h-4 w-4 text-green-500"   />
  if (direction === "down") return <TrendingDown  className="h-4 w-4 text-red-500"    />
  return                           <Minus         className="h-4 w-4 text-slate-400"  />
}

// ── Add Benchmark Dialog ──────────────────────────────────────────────────────
function AddBenchmarkDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const [competitorName, setCompetitorName] = useState("")
  const [metricName, setMetricName]   = useState("")
  const [metricValue, setMetricValue] = useState("")
  const [recordedAt, setRecordedAt]   = useState("")
  const [notes, setNotes]             = useState("")
  const [sourceUrl, setSourceUrl]     = useState("")

  const PRESET_METRICS = [
    { label: "Total Redemptions",  value: "total_redemptions" },
    { label: "Active Students",    value: "active_students"   },
    { label: "Active Brand Partners", value: "active_brands" },
  ]

  const handleSubmit = async () => {
    if (!competitorName.trim() || !metricName.trim() || !metricValue) {
      toast.error("Competitor name, metric name, and value are required")
      return
    }
    const val = parseFloat(metricValue)
    if (isNaN(val)) {
      toast.error("Metric value must be a number")
      return
    }
    setLoading(true)
    try {
      await addCompetitorBenchmark({
        competitorName: competitorName.trim(),
        metricName:     metricName.trim(),
        metricValue:    val,
        recordedAt:     recordedAt || undefined,
        notes:          notes      || undefined,
        sourceUrl:      sourceUrl  || undefined,
      })
      toast.success("Benchmark entry added")
      setOpen(false)
      setCompetitorName(""); setMetricName(""); setMetricValue("")
      setRecordedAt(""); setNotes(""); setSourceUrl("")
      onAdded()
    } catch {
      toast.error("Failed to add benchmark entry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Competitor Benchmark</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Competitor Name</Label>
            <Input placeholder="e.g. Gootlootlo" value={competitorName} onChange={e => setCompetitorName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Metric</Label>
            <div className="flex gap-2 flex-wrap mb-1">
              {PRESET_METRICS.map(p => (
                <Button
                  key={p.value}
                  size="sm"
                  variant={metricName === p.value ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => setMetricName(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <Input placeholder="or enter custom metric key" value={metricName} onChange={e => setMetricName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Value</Label>
            <Input type="number" placeholder="e.g. 45000" value={metricValue} onChange={e => setMetricValue(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Recorded Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input type="date" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Source URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input placeholder="https://..." value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input placeholder="e.g. from Q1 press release" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function AdminBrandPortfolio() {
  const colors = DASHBOARD_COLORS("admin")
  const [portfolio, setPortfolio]   = useState<BrandPortfolioHealth | null>(null)
  const [benchmarks, setBenchmarks] = useState<CompetitorBenchmarks | null>(null)
  const [isLoading, setIsLoading]   = useState(true)

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [p, b] = await Promise.all([getBrandPortfolioHealth(), getCompetitorBenchmarks()])
      setPortfolio(p)
      setBenchmarks(b)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load brand portfolio data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleDeleteBenchmark = async (id: string) => {
    try {
      await deleteCompetitorBenchmark(id)
      toast.success("Entry deleted")
      fetchAll()
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  if (isLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner className="size-10" />
    </div>
  )

  if (!portfolio) return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">Failed to load brand portfolio data</p>
      <Button onClick={fetchAll}>Retry</Button>
    </div>
  )

  const { brandTrends, brandReach, concentration, dryPartners } = portfolio

  // Build multi-line chart data: index = week position (0–3 = oldest→newest)
  // We only chart top-10 brands by 4-week total to keep it readable
  const top10Trends = brandTrends.slice(0, 10)
  const allWeeks = Array.from(
    new Set(top10Trends.flatMap(b => b.weeklyTrend.map(w => w.weekStart)))
  ).sort()

  const multiLineData = allWeeks.map((week, i) => {
    const entry: Record<string, number | string> = {
      week: `W${i + 1}`,
    }
    for (const brand of top10Trends) {
      const match = brand.weeklyTrend.find(w => w.weekStart === week)
      entry[brand.businessName] = match?.redemptionCount ?? 0
    }
    return entry
  })

  // Concentration pie data (top 8 + "Others")
  const TOP_N = 8
  const pieBrands  = concentration.brands.slice(0, TOP_N)
  const othersShare = concentration.brands.slice(TOP_N).reduce((s, b) => s + b.sharePct, 0)
  const pieData = [
    ...pieBrands.map(b => ({ name: b.businessName, value: b.sharePct })),
    ...(othersShare > 0 ? [{ name: "Others", value: Math.round(othersShare * 10) / 10 }] : []),
  ]
  const PIE_COLORS = [
    colors.primary, "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#f97316", "#ec4899", "#94a3b8",
  ]

  // HHI interpretation
  const hhiLabel = concentration.hhi < 1500
    ? { text: "Diverse",     cls: "text-green-600" }
    : concentration.hhi < 2500
    ? { text: "Moderate",    cls: "text-yellow-600" }
    : { text: "Concentrated", cls: "text-red-600"  }

  const reachBrands = brandReach.slice(0, 20)
  const reachTotals = {
    uniqueRedeemers: brandReach.reduce((sum, b) => sum + b.uniqueRedeemers, 0),
    totalRedemptions: brandReach.reduce((sum, b) => sum + b.totalRedemptions, 0),
  }
  const maxUniqueReach = Math.max(...reachBrands.map((b) => b.uniqueRedeemers), 1)
  const maxTotalReach = Math.max(...reachBrands.map((b) => b.totalRedemptions), 1)

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Brand Partner &amp; Portfolio Health
        </h2>
        <p className="text-muted-foreground mt-1">
          Performance trends, partner reach, portfolio concentration, and competitive benchmarking
        </p>
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="trends">Brand Trends</TabsTrigger>
          <TabsTrigger value="reach">Partner Reach</TabsTrigger>
          <TabsTrigger value="concentration">Concentration</TabsTrigger>
          <TabsTrigger value="dry">
            Dry Partners
            {dryPartners.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 text-[10px]">{dryPartners.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="benchmarks">Competitor Benchmarks</TabsTrigger>
        </TabsList>

        {/* ── Brand Performance Trends ── */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>Brand Performance Trends</CardTitle>
              <CardDescription>Redemptions per brand per week — rolling 4-week window (top 10 brands)</CardDescription>
            </CardHeader>
            <CardContent>
              {multiLineData.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-12">No redemptions in the last 4 weeks</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={multiLineData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        formatter={(value: number, name: string) => [value, name]}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      {top10Trends.map((brand, i) => (
                        <Line
                          key={brand.merchantId}
                          type="monotone"
                          dataKey={brand.businessName}
                          stroke={WEEK_COLORS[i % WEEK_COLORS.length] ?? `hsl(${(i * 37) % 360} 70% 50%)`}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Brand cards */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {brandTrends.map(brand => (
                      <div key={brand.merchantId} className="flex items-center justify-between rounded-lg border p-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {brand.logoPath ? (
                            <img src={brand.logoPath} alt={brand.businessName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold">{brand.businessName.slice(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{brand.businessName}</p>
                            <p className="text-xs text-muted-foreground">{brand.category ?? "General"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: colors.primary }}>{brand.totalLast4Weeks}</p>
                            <p className="text-[10px] text-muted-foreground">4-week</p>
                          </div>
                          <TrendIcon direction={brand.trendDirection} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Brand Reach & Redemptions ── */}
        <TabsContent value="reach">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }}>Brand Reach &amp; Redemptions</CardTitle>
              <CardDescription>
                All-time partner performance — distinct students vs total redemption events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors.primary }} />
                    Unique Redeemers
                  </div>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: colors.primary }}>
                    {reachTotals.uniqueRedeemers.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Distinct students who redeemed</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: REACH_TOTAL_COLOR }} />
                    Total Redemptions
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-slate-600">
                    {reachTotals.totalRedemptions.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">All redemption events across brands</p>
                </div>
              </div>

              {reachBrands.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No redemption data yet</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">Brand</TableHead>
                        <TableHead className="min-w-[220px]">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors.primary }} />
                            Unique Redeemers
                          </span>
                        </TableHead>
                        <TableHead className="min-w-[220px]">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: REACH_TOTAL_COLOR }} />
                            Total Redemptions
                          </span>
                        </TableHead>
                        <TableHead className="w-[120px] text-right">Avg / Student</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reachBrands.map((brand) => {
                        const avgPerStudent =
                          brand.uniqueRedeemers > 0
                            ? (brand.totalRedemptions / brand.uniqueRedeemers).toFixed(1)
                            : "—"

                        return (
                          <TableRow key={brand.merchantId}>
                            <TableCell>
                              <div className="flex items-center gap-3 min-w-0">
                                {brand.logoPath ? (
                                  <img
                                    src={brand.logoPath}
                                    alt={brand.businessName}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <span className="text-[10px] font-bold">
                                      {brand.businessName.slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{brand.businessName}</p>
                                  <p className="truncate text-xs text-muted-foreground">{brand.category ?? "General"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <ReachMetricBar
                                value={brand.uniqueRedeemers}
                                max={maxUniqueReach}
                                color={colors.primary}
                              />
                            </TableCell>
                            <TableCell>
                              <ReachMetricBar
                                value={brand.totalRedemptions}
                                max={maxTotalReach}
                                color={REACH_TOTAL_COLOR}
                              />
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium tabular-nums text-muted-foreground">
                              {avgPerStudent}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Portfolio Concentration ── */}
        <TabsContent value="concentration">
          <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">Total Redemptions</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {concentration.totalRedemptions.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">Top 3 Share</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {concentration.top3SharePct}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">Top 5 Share</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {concentration.top5SharePct}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">HHI Score</p>
                  <p className={`text-2xl font-bold ${hhiLabel.cls}`}>
                    {concentration.hhi.toLocaleString()}
                  </p>
                  <p className={`text-xs font-medium ${hhiLabel.cls}`}>{hhiLabel.text}</p>
                </CardContent>
              </Card>
            </div>

            {/* Pie + table */}
            <Card>
              <CardHeader>
                <CardTitle style={{ color: colors.primary }}>Brand Concentration Index</CardTitle>
                <CardDescription>
                  Share of total redemptions by partner. HHI &lt;1500 = diverse, 1500–2500 = moderate, &gt;2500 = concentrated.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="w-full lg:w-[320px] shrink-0">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value}%`}
                          labelLine={false}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs">
                          <th className="text-left py-2 pr-4">Rank</th>
                          <th className="text-left py-2 pr-4">Brand</th>
                          <th className="text-right py-2 pr-4">Redemptions</th>
                          <th className="text-right py-2">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {concentration.brands.map((b, i) => (
                          <tr key={b.merchantId} className="border-b last:border-0">
                            <td className="py-2 pr-4 text-muted-foreground font-mono">#{i + 1}</td>
                            <td className="py-2 pr-4 font-medium">{b.businessName}</td>
                            <td className="py-2 pr-4 text-right tabular-nums">{b.redemptionCount.toLocaleString()}</td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${b.sharePct}%`, backgroundColor: colors.primary }}
                                  />
                                </div>
                                <span className="tabular-nums w-10 text-right">{b.sharePct}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Dry Partner Flags ── */}
        <TabsContent value="dry">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: colors.primary }} className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Dry Partner Flags
              </CardTitle>
              <CardDescription>
                Active approved partners with zero redemptions in 30 days or fewer than 3 in the last 7 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dryPartners.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  All partners are active — no dry alerts at this time.
                </p>
              ) : (
                <div className="space-y-3">
                  {dryPartners.map(partner => (
                    <div
                      key={partner.merchantId}
                      className={`flex items-center justify-between rounded-lg border p-4 gap-4 ${
                        partner.severity === "zero" ? "border-red-200 bg-red-50 dark:bg-red-950/20" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {partner.logoPath ? (
                          <img src={partner.logoPath} alt={partner.businessName} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold">{partner.businessName.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{partner.businessName}</p>
                          <p className="text-xs text-muted-foreground">{partner.category ?? "General"}</p>
                          {partner.lastRedemptionAt && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Last redemption: {new Date(partner.lastRedemptionAt).toLocaleDateString()}
                            </p>
                          )}
                          {!partner.lastRedemptionAt && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">No redemptions ever</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{partner.redemptionsLast7Days}</p>
                          <p className="text-[10px] text-muted-foreground">last 7d</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{partner.redemptionsLast30Days}</p>
                          <p className="text-[10px] text-muted-foreground">last 30d</p>
                        </div>
                        <Badge variant={partner.severity === "zero" ? "destructive" : "outline"} className="shrink-0">
                          {partner.severity === "zero" ? "Inactive" : "Low Activity"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Competitor Benchmarks ── */}
        <TabsContent value="benchmarks">
          <div className="space-y-6">
            {/* Comparison metrics */}
            {benchmarks && benchmarks.comparison.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colors.primary }}>Parchi vs. Competitors</CardTitle>
                  <CardDescription>
                    Live Parchi stats compared against the latest manually logged competitor data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {benchmarks.comparison.map(metric => (
                      <div key={metric.metricName} className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          {METRIC_LABELS[metric.metricName] ?? metric.metricName}
                        </h4>
                        <div className="flex flex-wrap gap-3 items-center">
                          {/* Parchi chip */}
                          <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: colors.primary }}>
                            <span>Parchi</span>
                            <span>{metric.parchiValue.toLocaleString()}</span>
                          </div>
                          {metric.competitors.map(comp => (
                            <div
                              key={comp.name}
                              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
                                comp.deltaDirection === "ahead"  ? "border-green-400 text-green-700 dark:text-green-400"
                                : comp.deltaDirection === "behind" ? "border-red-400 text-red-700 dark:text-red-400"
                                : "border-slate-300 text-slate-600"
                              }`}
                            >
                              <span>{comp.name}</span>
                              <span>{comp.value.toLocaleString()}</span>
                              <span className="text-xs">
                                ({comp.deltaDirection === "ahead" ? "+" : comp.deltaDirection === "behind" ? "-" : "±"}{comp.delta.toLocaleString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Log table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle style={{ color: colors.primary }}>Benchmark Data Log</CardTitle>
                  <CardDescription>
                    Manually entered competitor stats. Data is entered by admins from public sources.
                  </CardDescription>
                </div>
                <AddBenchmarkDialog onAdded={fetchAll} />
              </CardHeader>
              <CardContent>
                {!benchmarks || benchmarks.entries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm space-y-2">
                    <p>No benchmark entries yet.</p>
                    <p className="text-xs">Add competitor stats manually from public press releases, app stores, or social media.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs">
                          <th className="text-left py-2 pr-3">Competitor</th>
                          <th className="text-left py-2 pr-3">Metric</th>
                          <th className="text-right py-2 pr-3">Value</th>
                          <th className="text-left py-2 pr-3">Recorded</th>
                          <th className="text-left py-2 pr-3">Notes</th>
                          <th className="text-left py-2 pr-3">Source</th>
                          <th className="py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarks.entries.map(entry => (
                          <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-2 pr-3 font-medium">{entry.competitorName}</td>
                            <td className="py-2 pr-3 text-muted-foreground">
                              {METRIC_LABELS[entry.metricName] ?? entry.metricName}
                            </td>
                            <td className="py-2 pr-3 text-right tabular-nums font-mono">
                              {Number(entry.metricValue).toLocaleString()}
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground text-xs">
                              {new Date(entry.recordedAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground text-xs max-w-[160px] truncate">
                              {entry.notes ?? "—"}
                            </td>
                            <td className="py-2 pr-3">
                              {entry.sourceUrl ? (
                                <a
                                  href={entry.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                                >
                                  Link <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteBenchmark(entry.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
