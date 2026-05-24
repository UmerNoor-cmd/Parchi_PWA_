"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Download, QrCode, RefreshCw } from "lucide-react"
import { getBranches, AdminBranch } from "@/lib/api-client"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { toast } from "sonner"

const QR_BASE_URL = "https://www.parchipakistan.com/redeem"

function redeemUrl(branchId: string) {
  return `${QR_BASE_URL}/${branchId}`
}

function qrImageUrl(branchId: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(redeemUrl(branchId))}&format=png&margin=4`
}

function downloadQr(branch: AdminBranch) {
  const canvas = document.createElement("canvas")
  const size = 400
  const padding = 40
  const headerHeight = 60
  const footerHeight = 50
  canvas.width = size + padding * 2
  canvas.height = size + padding * 2 + headerHeight + footerHeight
  const ctx = canvas.getContext("2d")!

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = "#e5e7eb"
  ctx.lineWidth = 2
  ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, 12)
  ctx.stroke()

  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    ctx.drawImage(img, padding, padding + headerHeight, size, size)

    ctx.fillStyle = "#111827"
    ctx.font = "bold 18px Inter, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(branch.branch_name, canvas.width / 2, padding + headerHeight - 30)

    if (branch.merchant?.business_name) {
      ctx.font = "14px Inter, system-ui, sans-serif"
      ctx.fillStyle = "#6b7280"
      ctx.fillText(branch.merchant.business_name, canvas.width / 2, padding + headerHeight - 10)
    }

    ctx.font = "14px Inter, system-ui, sans-serif"
    ctx.fillStyle = "#6b7280"
    ctx.fillText("Scan with Parchi App to redeem", canvas.width / 2, padding + headerHeight + size + 28)

    const link = document.createElement("a")
    link.download = `parchi-qr-${branch.branch_name.replace(/\s+/g, "-").toLowerCase()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }
  img.onerror = () => {
    window.open(qrImageUrl(branch.id, 400), "_blank")
  }
  img.src = qrImageUrl(branch.id, 400)
}

function BranchQrCard({ branch, colors }: { branch: AdminBranch; colors: ReturnType<typeof DASHBOARD_COLORS> }) {
  return (
    <Card className="flex flex-col border-2 hover:shadow-md transition-shadow" style={{ borderColor: `${colors.primary}20` }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base leading-tight">{branch.branch_name}</CardTitle>
        {branch.merchant?.business_name && (
          <CardDescription className="text-xs truncate">{branch.merchant.business_name}</CardDescription>
        )}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <Badge variant="outline" className="text-[10px]">{branch.city}</Badge>
          <Badge
            className={`text-[10px] ${branch.qr_auto_approve ? "bg-green-100 text-green-700 border-green-300" : "bg-blue-100 text-blue-700 border-blue-300"}`}
            variant="outline"
          >
            {branch.qr_auto_approve ? "⚡ Auto" : "👁 Manual"}
          </Badge>
          {!branch.is_active && (
            <Badge variant="destructive" className="text-[10px]">Inactive</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-3 flex-1">
        <div className="p-3 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: `${colors.primary}20` }}>
          <img
            src={qrImageUrl(branch.id)}
            alt={`QR code for ${branch.branch_name}`}
            className="w-40 h-40"
            loading="lazy"
          />
        </div>

        <p className="text-[10px] text-muted-foreground text-center break-all px-1">
          {redeemUrl(branch.id)}
        </p>

        <Button
          onClick={() => downloadQr(branch)}
          variant="outline"
          className="w-full gap-2 border-2 mt-auto"
          style={{ borderColor: `${colors.primary}40`, color: colors.primary }}
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </CardContent>
    </Card>
  )
}

export function AdminQrCodes() {
  const colors = DASHBOARD_COLORS("admin")
  const [branches, setBranches] = useState<AdminBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBranches({})
      setBranches(data)
    } catch {
      toast.error("Failed to load branches")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = branches.filter((b) => {
    const q = search.toLowerCase()
    return (
      b.branch_name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      (b.merchant?.business_name?.toLowerCase().includes(q) ?? false)
    )
  })

  const activeBranches = filtered.filter((b) => b.is_active)
  const inactiveBranches = filtered.filter((b) => !b.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>Branch QR Codes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download printable QR cards for each branch — link opens the app or the Parchi landing page.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search branch or merchant…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-40 w-40 mx-auto rounded-xl" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <QrCode className="w-12 h-12 opacity-20" />
          <p className="text-sm">No branches match your search</p>
        </div>
      ) : (
        <>
          {activeBranches.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Active ({activeBranches.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeBranches.map((b) => (
                  <BranchQrCard key={b.id} branch={b} colors={colors} />
                ))}
              </div>
            </section>
          )}

          {inactiveBranches.length > 0 && (
            <section className="opacity-60">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Inactive ({inactiveBranches.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inactiveBranches.map((b) => (
                  <BranchQrCard key={b.id} branch={b} colors={colors} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
