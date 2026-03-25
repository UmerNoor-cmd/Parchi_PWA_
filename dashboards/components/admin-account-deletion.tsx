"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminDeletionRequests,
  processAdminDeletionRequest,
  deleteAdminDeletionRequest,
  type AdminDeletionRequest,
} from "@/lib/api-client"
import { DASHBOARD_COLORS } from "@/lib/colors"
import {
  Trash2,
  Check,
  X,
  Search,
  RefreshCw,
  Loader2,
  UserX,
  AlertTriangle,
} from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ]
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`
  }
  return "just now"
}

export function AdminAccountDeletion() {
  const colors = DASHBOARD_COLORS("admin")
  const { toast } = useToast()

  const [requests, setRequests] = useState<AdminDeletionRequest[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: "approve" | "reject" | "delete" | null
    request: AdminDeletionRequest | null
  }>({ open: false, type: null, request: null })

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAdminDeletionRequests(page, 15, statusFilter === "all" ? undefined : statusFilter)
      setRequests(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load deletion requests", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const filteredRequests = search.trim()
    ? requests.filter((r) =>
        r.identifier.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase())
      )
    : requests

  const openConfirm = (type: "approve" | "reject" | "delete", request: AdminDeletionRequest) => {
    setConfirmDialog({ open: true, type, request })
  }

  const handleConfirm = async () => {
    const { type, request } = confirmDialog
    if (!type || !request) return

    setActionLoading(request.id)
    setConfirmDialog({ open: false, type: null, request: null })

    try {
      if (type === "delete") {
        await deleteAdminDeletionRequest(request.id)
        toast({ title: "Removed", description: `Request from ${request.identifier} has been removed.` })
      } else {
        await processAdminDeletionRequest(request.id, type)
        toast({
          title: type === "approve" ? "Approved" : "Rejected",
          description: `Deletion request from ${request.identifier} has been ${type === "approve" ? "approved" : "rejected"}.`,
        })
      }
      fetchRequests()
    } catch (err: any) {
      toast({
        title: "Action Failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
            Account Deletion Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and action users who have requested account deletion
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full" style={{ backgroundColor: `${colors.primary}15` }}>
                <UserX className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>{total}</div>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-50">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-50">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {requests.filter((r) => r.status === "approved").length}
                </div>
                <p className="text-xs text-muted-foreground">Approved (this page)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by identifier or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold">Identifier</TableHead>
                  <TableHead className="font-semibold">Reason</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Requested</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                      <UserX className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No deletion requests found</p>
                      <p className="text-sm mt-1">
                        {search ? "Try clearing the search filter" : "No requests have been submitted yet"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium max-w-[180px] truncate" title={req.identifier}>
                        {req.identifier}
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <p className="text-sm text-muted-foreground line-clamp-2">{req.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs font-medium ${STATUS_COLORS[req.status] ?? ""}`}
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {timeAgo(req.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                onClick={() => openConfirm("approve", req)}
                                disabled={actionLoading === req.id}
                              >
                                {actionLoading === req.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                onClick={() => openConfirm("reject", req)}
                                disabled={actionLoading === req.id}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => openConfirm("delete", req)}
                            disabled={actionLoading === req.id}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <UserX className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No deletion requests found</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{req.identifier}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(req.created_at)}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs shrink-0 ${STATUS_COLORS[req.status] ?? ""}`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{req.reason}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => openConfirm("approve", req)}
                          disabled={actionLoading === req.id}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => openConfirm("reject", req)}
                          disabled={actionLoading === req.id}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => openConfirm("delete", req)}
                      disabled={actionLoading === req.id}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total} requests
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = page <= 3 ? i + 1 : page - 2 + i
                    if (pg < 1 || pg > totalPages) return null
                    return (
                      <PaginationItem key={pg}>
                        <PaginationLink
                          isActive={pg === page}
                          onClick={() => setPage(pg)}
                          className="cursor-pointer"
                          style={pg === page ? { backgroundColor: colors.primary, color: "white", borderColor: colors.primary } : {}}
                        >
                          {pg}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  {totalPages > 5 && page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null, request: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.type === "approve" && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {confirmDialog.type === "reject" && (
                <X className="w-5 h-5 text-orange-500" />
              )}
              {confirmDialog.type === "delete" && (
                <Trash2 className="w-5 h-5 text-red-500" />
              )}
              {confirmDialog.type === "approve" && "Approve Deletion Request"}
              {confirmDialog.type === "reject" && "Reject Deletion Request"}
              {confirmDialog.type === "delete" && "Remove Request Record"}
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              {confirmDialog.type === "approve" && (
                <p>
                  Are you sure you want to <strong>approve</strong> the deletion request for{" "}
                  <span className="font-mono bg-muted px-1 rounded text-foreground">
                    {confirmDialog.request?.identifier}
                  </span>
                  ? This will mark the request as approved and can trigger downstream account removal.
                </p>
              )}
              {confirmDialog.type === "reject" && (
                <p>
                  Are you sure you want to <strong>reject</strong> the deletion request for{" "}
                  <span className="font-mono bg-muted px-1 rounded text-foreground">
                    {confirmDialog.request?.identifier}
                  </span>
                  ? The user's account will not be deleted.
                </p>
              )}
              {confirmDialog.type === "delete" && (
                <p>
                  This will permanently <strong>remove</strong> the request record for{" "}
                  <span className="font-mono bg-muted px-1 rounded text-foreground">
                    {confirmDialog.request?.identifier}
                  </span>{" "}
                  from the system. This action cannot be undone.
                </p>
              )}
              {confirmDialog.request && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <p className="text-muted-foreground font-medium text-xs uppercase tracking-wide mb-2">
                    Request Details
                  </p>
                  <p>
                    <span className="text-muted-foreground">Identifier: </span>
                    <span className="font-medium">{confirmDialog.request.identifier}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reason: </span>
                    <span>{confirmDialog.request.reason}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Submitted: </span>
                    <span>{timeAgo(confirmDialog.request.created_at)}</span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: null, request: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                confirmDialog.type === "approve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : confirmDialog.type === "reject"
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {confirmDialog.type === "approve" && "Yes, Approve"}
              {confirmDialog.type === "reject" && "Yes, Reject"}
              {confirmDialog.type === "delete" && "Yes, Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
