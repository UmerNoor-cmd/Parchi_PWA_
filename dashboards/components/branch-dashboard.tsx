"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, TrendingUp, Users, Zap, Loader2, XCircle, AlertCircle, Sparkles, QrCode, Download, Smartphone, Bell } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BranchSidebar, BranchSidebarContent } from "./branch-sidebar"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { formatPakistanDateTime } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { getStudentByParchiId, createRedemption, rejectRedemptionAttempt, StudentVerificationResponse, getDailyRedemptionStats, DailyRedemptionStats, getDailyRedemptionDetails, DailyRedemptionDetail, getAggregatedRedemptionStats, AggregatedStats, getQrSettings, getPendingQrRequests, approveQrRequest, rejectQrRequest, QrSettings, QrPendingRequest } from "@/lib/api-client"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const colors = DASHBOARD_COLORS("branch")

const isSameDayAsToday = (dateString?: string | null | Date) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export function BranchDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("redeem")
  const [parchiIdInput, setParchiIdInput] = useState("")
  const [applicableOffer, setApplicableOffer] = useState<any>(null)

  // State for data
  const [studentDetails, setStudentDetails] = useState<StudentVerificationResponse | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyRedemptionStats | null>(null)
  const [dailyRedemptionDetails, setDailyRedemptionDetails] = useState<DailyRedemptionDetail[]>([])
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null)
  // Loading states
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false)
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  const [isCreatingRedemption, setIsCreatingRedemption] = useState(false)
  const [isRejectingRedemption, setIsRejectingRedemption] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // QR state
  const [qrSettings, setQrSettings] = useState<QrSettings | null>(null)
  const [activeQrRequest, setActiveQrRequest] = useState<QrPendingRequest | null>(null)
  const [isQrApprovalDialogOpen, setIsQrApprovalDialogOpen] = useState(false)
  const [isApprovingQr, setIsApprovingQr] = useState(false)
  const [isRejectingQr, setIsRejectingQr] = useState(false)
  const [isQrRejectDialogOpen, setIsQrRejectDialogOpen] = useState(false)
  const [qrRejectionReason, setQrRejectionReason] = useState("")
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeQrRequestRef = useRef<QrPendingRequest | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stats, details, aggregated] = await Promise.all([
          getDailyRedemptionStats(),
          getDailyRedemptionDetails(),
          getAggregatedRedemptionStats(),
        ])
        setDailyStats(stats)
        setDailyRedemptionDetails(details)
        setAggregatedStats(aggregated)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
  }, [])

  // Load QR settings and subscribe to incoming requests
  useEffect(() => {
    let cancelled = false

    const showPendingRequest = (pending: QrPendingRequest[]) => {
      if (pending.length === 0) return
      activeQrRequestRef.current = pending[0]
      setActiveQrRequest(pending[0])
      setIsQrApprovalDialogOpen(true)
    }

    // Open dialog immediately (skeleton state), then fetch full details
    const handleIncomingRequest = async () => {
      // Snap the dialog open before the API round-trip so branch sees it instantly
      setIsQrApprovalDialogOpen(true)
      toast.info("New QR redemption request", { description: "Fetching student details…" })
      try {
        const pending = await getPendingQrRequests()
        if (cancelled || pending.length === 0) return
        showPendingRequest(pending)
        toast.dismiss()
        toast.info("QR request from student", {
          description: `${pending[0].student.firstName} ${pending[0].student.lastName} — ${pending[0].offer.title}`,
          action: { label: "Review", onClick: () => setIsQrApprovalDialogOpen(true) },
        })
      } catch {/* non-critical */}
    }

    // Polls every 8 s as a safety net when Realtime misses events
    const pollPendingRequests = async () => {
      if (activeQrRequestRef.current) return // already handling one
      try {
        const pending = await getPendingQrRequests()
        if (!cancelled && pending.length > 0) showPendingRequest(pending)
      } catch {/* non-critical */}
    }

    const initQr = async () => {
      try {
        const [settings, existingPending] = await Promise.all([
          getQrSettings(),
          getPendingQrRequests().catch(() => [] as QrPendingRequest[]),
        ])
        if (cancelled) return
        setQrSettings(settings)

        if (existingPending.length > 0) {
          showPendingRequest(existingPending)
        }

        // Subscribe — no server-side filter to avoid silent RLS drops; filter client-side
        const channel = supabase
          .channel(`qr-branch-${settings.branchId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'qr_redemption_requests' },
            async (payload) => {
              // Only act on inserts for this branch that arrive as pending
              if (payload.new?.branch_id !== settings.branchId) return
              if (payload.new?.status !== 'pending') return
              await handleIncomingRequest()
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[QR Realtime] subscribed for branch', settings.branchId)
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('[QR Realtime] subscription issue:', status)
            }
          })

        realtimeChannelRef.current = channel

        // Polling fallback — guarantees pickup even if Realtime drops
        pollIntervalRef.current = setInterval(pollPendingRequests, 8000)
      } catch {
        // Non-critical: branch may not have QR feature yet
      }
    }

    // Re-check when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') pollPendingRequests()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    initQr()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------
  //  DYNAMIC STATS CALCULATION
  // ------------------------------------------------------------------



  // ------------------------------------------------------------------
  //  HANDLERS
  // ------------------------------------------------------------------

  const handleRedemptionClick = async () => {
    if (!parchiIdInput) return

    setIsLoadingStudent(true)
    try {
      const fullParchiId = parchiIdInput
      const student = await getStudentByParchiId(fullParchiId)
      if (student.offers && student.offers.length > 0) {
        setStudentDetails(student)
        setApplicableOffer(student.offers[0]) // Default to first offer
        setIsVerificationDialogOpen(true)
      } else {
        toast.error("No active offer found for this student")
      }

    } catch (error) {
      toast.error("Student not found or error fetching details")
    } finally {
      setIsLoadingStudent(false)
    }
  }

  const handleConfirmRedemption = async () => {
    if (parchiIdInput && applicableOffer && studentDetails) {
      setIsCreatingRedemption(true)
      try {
        const fullParchiId = parchiIdInput
        // Include merchant logo so the redemption record stores the branding snapshot
        const merchantLogoUrl = studentDetails.merchantLogoUrl
          ?? studentDetails.offer?.merchant?.logoPath
          ?? null
        await createRedemption({
          parchiId: fullParchiId,
          offerId: applicableOffer.id,
          notes: applicableOffer.isBonus ? "Bonus Redemption" : "Standard Redemption",
          imageUrl: merchantLogoUrl,
        })

        // Refresh data
        const [stats, details, aggregated] = await Promise.all([
          getDailyRedemptionStats(),
          getDailyRedemptionDetails(),
          getAggregatedRedemptionStats()
        ])
        setDailyStats(stats)
        setDailyRedemptionDetails(details)
        setAggregatedStats(aggregated)

        setParchiIdInput("")
        setApplicableOffer(null)
        setStudentDetails(null)
        setIsVerificationDialogOpen(false)
        toast.success("Redemption processed successfully")
      } catch (error) {
        toast.error("Failed to process redemption. Please try again.")
      } finally {
        setIsCreatingRedemption(false)
      }
    }
  }

  const handleRejectRedemption = () => {
    setIsRejectDialogOpen(true)
  }

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason")
      return
    }

    if (parchiIdInput && applicableOffer && studentDetails) {
      setIsRejectingRedemption(true)
      try {
        const fullParchiId = parchiIdInput
        await rejectRedemptionAttempt({
          parchiId: fullParchiId,
          offerId: applicableOffer.id,
          rejectionReason: rejectionReason
        })

        // Reset UI
        setParchiIdInput("")
        setApplicableOffer(null)
        setStudentDetails(null)
        setRejectionReason("")
        setIsVerificationDialogOpen(false)
        setIsRejectDialogOpen(false)
        toast.info("Redemption attempt rejected")
      } catch (error) {
        toast.error("Failed to reject redemption")
      } finally {
        setIsRejectingRedemption(false)
      }
    }
  }

  const hasRedeemedToday = studentDetails?.lastBranchRedemptionAt
    ? isSameDayAsToday(studentDetails.lastBranchRedemptionAt)
    : false;

  const handleApproveQrRequest = async () => {
    if (!activeQrRequest) return
    setIsApprovingQr(true)
    try {
      await approveQrRequest(activeQrRequest.id)
      setIsQrApprovalDialogOpen(false)
      activeQrRequestRef.current = null
      setActiveQrRequest(null)
      const [stats, details, aggregated] = await Promise.all([
        getDailyRedemptionStats(),
        getDailyRedemptionDetails(),
        getAggregatedRedemptionStats(),
      ])
      setDailyStats(stats)
      setDailyRedemptionDetails(details)
      setAggregatedStats(aggregated)
      toast.success("QR redemption approved!")
    } catch {
      toast.error("Failed to approve request")
    } finally {
      setIsApprovingQr(false)
    }
  }

  const handleRejectQrRequest = () => setIsQrRejectDialogOpen(true)

  const handleConfirmQrRejection = async () => {
    if (!activeQrRequest) return
    setIsRejectingQr(true)
    try {
      await rejectQrRequest(activeQrRequest.id, qrRejectionReason || undefined)
      setIsQrRejectDialogOpen(false)
      setIsQrApprovalDialogOpen(false)
      activeQrRequestRef.current = null
      setActiveQrRequest(null)
      setQrRejectionReason("")
      toast.info("QR request rejected")
    } catch {
      toast.error("Failed to reject request")
    } finally {
      setIsRejectingQr(false)
    }
  }

  const handleDownloadQrCode = useCallback(() => {
    if (!qrSettings) return
    const canvas = document.createElement("canvas")
    const size = 400
    const padding = 40
    const logoHeight = 60
    const textHeight = 50
    canvas.width = size + padding * 2
    canvas.height = size + padding * 2 + logoHeight + textHeight
    const ctx = canvas.getContext("2d")!

    // Background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 12)
    ctx.stroke()

    // QR image (load from qrserver.com)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(`parchi://redeem/${qrSettings.branchId}`)}&format=png&margin=0`
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, padding, padding + logoHeight, size, size)

      // Branch name text
      ctx.fillStyle = "#111827"
      ctx.font = "bold 20px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(qrSettings.branchName, canvas.width / 2, padding + logoHeight - 8)

      // Footer text
      ctx.font = "16px Inter, system-ui, sans-serif"
      ctx.fillStyle = "#6b7280"
      ctx.fillText("Scan with Parchi App", canvas.width / 2, padding + logoHeight + size + 30)

      const link = document.createElement("a")
      link.download = `parchi-qr-${qrSettings.branchName.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
    img.onerror = () => {
      // Fallback: open QR image directly
      window.open(qrUrl, "_blank")
    }
    img.src = qrUrl
  }, [qrSettings])

  return (
    <div className="flex min-h-screen bg-background">
      <BranchSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={onLogout} />

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
                  <SheetTitle className="sr-only">Branch Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigation</SheetDescription>
                  <BranchSidebarContent activeTab={activeTab} onTabChange={(tab) => {
                    setActiveTab(tab)
                    document.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
                  }} onLogout={onLogout} />
                </SheetContent>
              </Sheet>
              <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-6 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>Branch Dashboard</h1>
            <p className="text-muted-foreground mt-1">Process student redemptions in real-time</p>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                {/* 1. Total Redemptions */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Redemptions Today</span>
                      <CheckCircle className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {dailyStats.todayCount}
                        </div>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.primary }}>
                          <TrendingUp className={`w-3 h-3 ${dailyStats.trend === 'down' ? 'rotate-180' : ''}`} />
                          <span className={dailyStats.trend === 'up' ? "text-green-600" : dailyStats.trend === 'down' ? "text-red-600" : "text-gray-600"}>
                            {dailyStats.trend === 'up' ? '+' : ''}{dailyStats.percentageChange}%
                          </span> vs Yesterday
                        </p>
                      </>
                    ) : (
                      <Skeleton className="h-10 w-24 bg-primary/5" />
                    )}
                  </CardContent>
                </Card>

                {/* 2. Unique Students */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Unique Students</span>
                      <Users className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aggregatedStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {aggregatedStats.uniqueStudents}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Unique Parchi IDs today</p>
                      </>
                    ) : (
                      <Skeleton className="h-10 w-24 bg-primary/5" />
                    )}
                  </CardContent>
                </Card>

                {/* 3. Bonus Deals Unlocked (NEW STAT) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Bonus Deals Unlocked</span>
                      <Sparkles className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aggregatedStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {aggregatedStats.bonusDealsCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dailyStats && dailyStats.todayCount > 0
                            ? Math.round((aggregatedStats.bonusDealsCount / dailyStats.todayCount) * 100)
                            : 0}% of total redemptions
                        </p>
                      </>
                    ) : (
                      <Skeleton className="h-10 w-32 bg-primary/5" />
                    )}
                  </CardContent>
                </Card>

                {/* 4. Peak Activity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      <span>Peak Activity</span>
                      <Zap className="w-4 h-4" style={{ color: colors.primary }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aggregatedStats ? (
                      <>
                        <div className="text-3xl font-bold" style={{ color: colors.primary }}>
                          {aggregatedStats.peakHour}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Busiest hour today
                        </p>
                      </>
                    ) : (
                      <Skeleton className="h-10 w-24 bg-primary/5" />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Hourly Traffic</CardTitle>
                    <CardDescription>Redemption volume throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aggregatedStats?.hourlyData || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="label" stroke={colors.mutedForeground} fontSize={12} />
                        <YAxis stroke={colors.mutedForeground} fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar dataKey="count" fill={colors.primary} name="Redemptions" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colors.primary }}>Insights</CardTitle>
                    <CardDescription>Key observations for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-primary/10">
                            <Clock className="w-6 h-6" style={{ color: colors.primary }} />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {aggregatedStats?.peakHour || "N/A"}
                            </p>
                            <p className="text-sm text-muted-foreground">Busiest Hour</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                            {aggregatedStats?.hourlyData.reduce((max, curr) => curr.count > max ? curr.count : max, 0) || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Redemptions</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Activity Summary</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Transactions</span>
                          <span className="font-semibold">{dailyStats?.todayCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Unique Students</span>
                          <span className="font-semibold">{aggregatedStats?.uniqueStudents || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Bonus Unlocked</span>
                          <span className="font-semibold">{aggregatedStats?.bonusDealsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* QR Settings + QR Code cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* QR Settings Card — read-only, mode configured by admin */}
                <Card className="border-2" style={{ borderColor: `${colors.primary}30` }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg" style={{ color: colors.primary }}>
                        <Smartphone className="w-5 h-5" />
                        QR Approval Mode
                      </CardTitle>
                      {qrSettings && (
                        <Badge
                          className={`text-xs font-semibold ${qrSettings.qrAutoApprove ? "bg-green-100 text-green-700 border-green-300" : "bg-blue-100 text-blue-700 border-blue-300"}`}
                          variant="outline"
                        >
                          {qrSettings.qrAutoApprove ? "⚡ Auto-Approve" : "👁 Manual Approval"}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>Configured by admin — contact support to change</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qrSettings ? (
                      <div className="rounded-lg p-3 text-sm border" style={{ backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }}>
                        {qrSettings.qrAutoApprove ? (
                          <div className="flex gap-2">
                            <span className="text-green-600 text-base">⚡</span>
                            <p className="text-muted-foreground">Students who scan your QR will be redeemed <strong>instantly</strong> — no action needed from you.</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                            <p className="text-muted-foreground">When a student scans, you'll see a <strong>verification modal</strong> here to approve or reject.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Skeleton className="h-12 w-full" />
                    )}
                  </CardContent>
                </Card>

                {/* Branch QR Code Card */}
                <Card className="border-2" style={{ borderColor: `${colors.primary}30` }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg" style={{ color: colors.primary }}>
                      <QrCode className="w-5 h-5" />
                      Branch QR Code
                    </CardTitle>
                    <CardDescription>Students scan this with the Parchi app to redeem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qrSettings ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-3 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: `${colors.primary}30` }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`parchi://redeem/${qrSettings.branchId}`)}&format=png&margin=4`}
                            alt="Branch QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{qrSettings.branchName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Scan with Parchi App</p>
                        </div>
                        <Button
                          onClick={handleDownloadQrCode}
                          variant="outline"
                          className="w-full gap-2 border-2"
                          style={{ borderColor: `${colors.primary}40`, color: colors.primary }}
                        >
                          <Download className="w-4 h-4" />
                          Download Printable Card
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Skeleton className="h-48 w-48 rounded-xl" />
                        <Skeleton className="h-8 w-40" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "redeem" && (
            <>
              {/* Quick Redemption Card */}
              <div className="mb-8">
                <Card className="border-2" style={{ borderColor: `${colors.primary}40` }}>
                  <CardHeader className="pb-4 bg-muted/20">
                    <CardTitle className="text-2xl flex items-center gap-2" style={{ color: colors.primary }}>
                      <CheckCircle className="w-6 h-6" />
                      Quick Redemption
                    </CardTitle>
                    <CardDescription>Enter Parchi ID to process redemption</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                      <label className="text-lg font-semibold" style={{ color: colors.primary }}>Student Parchi ID</label>
                      <div className="flex justify-center w-full">
                        <div className="flex items-center border-2 rounded-xl overflow-hidden bg-background shadow-sm w-full max-w-md transition-all focus-within:scale-[1.02] focus-within:shadow-md" style={{ borderColor: `${colors.primary}30` }}>
                          <Input
                            placeholder="12345"
                            value={parchiIdInput}
                            onChange={(e) => {
                              // Only allow numbers
                              const numbersOnly = e.target.value.replace(/\D/g, '')
                              setParchiIdInput(numbersOnly)
                            }}
                            className="!text-5xl font-mono h-20 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/30 tracking-widest text-center"
                            style={{ fontSize: '3rem' }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && parchiIdInput) {
                                handleRedemptionClick()
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {parchiIdInput && (
                      <div className="flex justify-center pt-6 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-3 w-full max-w-md">
                          <Button
                            onClick={handleRedemptionClick}
                            className="flex-1 gap-2 h-14 text-xl shadow-md transition-all hover:scale-[1.02]"
                            size="lg"
                            style={{ backgroundColor: colors.primary }}
                            disabled={isLoadingStudent}
                          >
                            {isLoadingStudent ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <CheckCircle className="w-6 h-6" />
                            )}
                            Redeem
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setParchiIdInput("")
                              setApplicableOffer(null)
                            }}
                            className="px-6 h-14 text-lg border-2 hover:bg-muted"
                            disabled={isLoadingStudent}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Redemptions</span>
                    <Badge variant="outline" className="rounded-full">
                      {dailyRedemptionDetails.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Real-time redemption log</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dailyRedemptionDetails.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No redemptions yet today</p>
                    </div>
                  ) : (
                    dailyRedemptionDetails.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${item.isBonusApplied
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 hover:from-yellow-100 hover:to-orange-100'
                          : 'bg-muted/50 hover:bg-muted'
                          }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${item.isBonusApplied
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                : ''
                                }`}
                              style={{ backgroundColor: item.isBonusApplied ? undefined : `${colors.primary}20` }}
                            >
                              {item.isBonusApplied ? (
                                <Sparkles className="w-5 h-5 text-white" />
                              ) : (
                                <CheckCircle className="w-5 h-5" style={{ color: colors.primary }} />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{item.parchiId}</p>
                              {item.isBonusApplied && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
                                  🎉 Bonus
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm truncate ${item.isBonusApplied ? 'text-orange-700 font-medium' : 'text-muted-foreground'
                              }`}>
                              {item.offerTitle}
                              {item.discountDetails && (
                                <span className="ml-2">• {item.discountDetails}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatPakistanDateTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Student Verification Dialog */}
      <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Student</DialogTitle>
            <DialogDescription>
              Please verify the student's identity before proceeding.
            </DialogDescription>
          </DialogHeader>

          {studentDetails && (
            <div className="py-4 space-y-6">
              {/* BONUS CELEBRATION BANNER */}
              {applicableOffer?.isBonus && (
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <Sparkles className="w-12 h-12 drop-shadow-lg animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold drop-shadow-md">🎉 BONUS REDEMPTION!</h3>
                      <p className="text-yellow-100 text-sm mt-1">
                        {applicableOffer?.discountType === 'item' && applicableOffer?.additionalItem ? (
                          <>This student has unlocked: <span className="font-bold text-white">{applicableOffer.additionalItem}</span>!</>
                        ) : (
                          <>This student has unlocked a loyalty bonus reward!</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-60">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-2 right-10 opacity-40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar
                  className="w-36 h-36 border-4 border-background shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImagePreviewOpen(true)}
                >
                  <AvatarImage src={studentDetails.verificationSelfie || ""} />
                  <AvatarFallback className="text-3xl bg-muted">
                    {studentDetails.firstName[0]}{studentDetails.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{studentDetails.firstName} {studentDetails.lastName}</h3>
                  <p className="text-muted-foreground">{studentDetails.university}</p>
                  <Badge variant="outline" className="mt-2 font-mono">
                    {studentDetails.parchiId}
                  </Badge>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-4 text-sm border rounded-lg p-4 ${applicableOffer?.isBonus
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                : 'bg-muted/20'
                }`}>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {studentDetails.verificationStatus === 'approved' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Not Verified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">{studentDetails.offers.length > 1 ? "Select Offer" : "Applicable Offer"}</p>
                  <div className="mt-1">
                    {studentDetails.offers.length > 1 ? (
                      <div className="space-y-3">
                        {studentDetails.offers.map((offer) => (
                          <div 
                            key={offer.id}
                            onClick={() => setApplicableOffer(offer)}
                            className={`p-3 rounded-md border-2 cursor-pointer transition-all ${
                              applicableOffer?.id === offer.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted hover:border-muted-foreground/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{offer.title}</p>
                                {offer.isBonus && <Sparkles className="w-3 h-3 text-yellow-600" />}
                              </div>
                              {applicableOffer?.id === offer.id && (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{offer.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs font-bold" style={{ color: colors.primary }}>
                                {offer.discountType === 'item' ? offer.additionalItem : `${offer.discountValue}${offer.discountType === 'percentage' ? '% OFF' : ' PKR OFF'}`}
                              </p>
                              {offer.isBonus && (
                                <Badge className="h-5 text-[10px] bg-yellow-500 hover:bg-yellow-500 text-white border-0">
                                  BONUS
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{applicableOffer?.title}</p>
                          {applicableOffer?.isBonus && (
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{applicableOffer?.description}</p>
                        <p className={`text-sm font-semibold mt-2 ${applicableOffer?.isBonus ? 'text-orange-600 text-base' : ''
                          }`} style={{ color: applicableOffer?.isBonus ? undefined : colors.primary }}>
                          {applicableOffer?.additionalItem && (
                            <span className="block flex items-center gap-2 mb-1">
                              <span>🎁 {applicableOffer.additionalItem}</span>
                            </span>
                          )}
                          {(applicableOffer?.discountValue > 0 || !applicableOffer?.additionalItem) && (
                            <span>
                              {applicableOffer?.discountValue}{applicableOffer?.discountType === 'percentage' ? '% OFF' : ' PKR OFF'}
                            </span>
                          )}
                        </p>
                        {applicableOffer?.isBonus && (
                          <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                            🎉 Bonus Unlocked!
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {studentDetails.verificationStatus !== 'approved' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Warning: This student is not verified.</p>
                </div>
              )}

              {hasRedeemedToday && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-600 rounded-md text-sm border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>This student has already redeemed an offer at this branch today.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleRejectRedemption}
              className="flex-1"
              disabled={isRejectingRedemption || isCreatingRedemption}
            >
              {isRejectingRedemption ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
            {!hasRedeemedToday && (
              <Button
                onClick={handleConfirmRedemption}
                className="flex-1"
                style={{ backgroundColor: colors.primary }}
                disabled={isCreatingRedemption}
              >
                {isCreatingRedemption ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Approve & Redeem
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile Picture</DialogTitle>
            <DialogDescription>
              {studentDetails?.firstName} {studentDetails?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {studentDetails?.verificationSelfie ? (
              <img
                src={studentDetails.verificationSelfie}
                alt={`${studentDetails.firstName} ${studentDetails.lastName}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-muted flex items-center justify-center text-6xl font-bold">
                {studentDetails?.firstName[0]}{studentDetails?.lastName[0]}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Redemption</DialogTitle>
            <DialogDescription>
              Please explain why this redemption is being rejected. This will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection (e.g. Student ID expired)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={isRejectingRedemption}
            >
              {isRejectingRedemption && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Request Approval Dialog */}
      <Dialog open={isQrApprovalDialogOpen} onOpenChange={(open) => {
        if (!open && !isApprovingQr && !isRejectingQr) {
          setIsQrApprovalDialogOpen(false)
          activeQrRequestRef.current = null
          setActiveQrRequest(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" style={{ color: colors.primary }} />
              QR Redemption Request
            </DialogTitle>
            <DialogDescription>A student has scanned your QR code and wants to redeem an offer.</DialogDescription>
          </DialogHeader>

          {activeQrRequest ? (
            <div className="py-4 space-y-5">
              {/* Student info */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={activeQrRequest.student.profilePicture || ""} />
                  <AvatarFallback className="text-2xl bg-muted">
                    {activeQrRequest.student.firstName[0]}{activeQrRequest.student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{activeQrRequest.student.firstName} {activeQrRequest.student.lastName}</h3>
                  <p className="text-muted-foreground text-sm">{activeQrRequest.student.university}</p>
                  <Badge variant="outline" className="mt-2 font-mono">{activeQrRequest.student.parchiId}</Badge>
                </div>
              </div>

              {/* Offer + stats */}
              <div className="grid grid-cols-2 gap-4 text-sm border rounded-lg p-4 bg-muted/20">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {activeQrRequest.student.verificationStatus === 'approved' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                    ) : (
                      <Badge variant="destructive">Not Verified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Redemptions</p>
                  <p className="font-semibold mt-1">{activeQrRequest.student.totalRedemptions}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Offer</p>
                  <p className="font-semibold mt-1">{activeQrRequest.offer.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: colors.primary }}>{activeQrRequest.offer.formattedDiscount}</p>
                </div>
              </div>

              {activeQrRequest.student.verificationStatus !== 'approved' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Warning: This student is not verified.</p>
                </div>
              )}
            </div>
          ) : (
            // Skeleton shown while details are loading (dialog opened immediately from payload)
            <div className="py-4 space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleRejectQrRequest}
              className="flex-1"
              disabled={isApprovingQr || isRejectingQr || !activeQrRequest}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApproveQrRequest}
              className="flex-1"
              style={{ backgroundColor: colors.primary }}
              disabled={isApprovingQr || isRejectingQr || !activeQrRequest}
            >
              {isApprovingQr ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve & Redeem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Rejection Reason Dialog */}
      <Dialog open={isQrRejectDialogOpen} onOpenChange={setIsQrRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject QR Request</DialogTitle>
            <DialogDescription>Optionally provide a reason. This will be shown to the student.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for rejection (optional)"
              value={qrRejectionReason}
              onChange={(e) => setQrRejectionReason(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQrRejectDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmQrRejection}
              disabled={isRejectingQr}
            >
              {isRejectingQr && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}