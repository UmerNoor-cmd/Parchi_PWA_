"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Search,
    RefreshCw,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Calendar,
    TrendingUp,
    Users,
    FileText,
    Activity,
} from "lucide-react"
import {
    getAuditLogs,
    getAuditStatistics,
    AuditLog,
    AuditLogsQuery,
    AuditStatistics,
} from "@/lib/api-client"
import { toast } from "sonner"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { Spinner } from "@/components/ui/spinner"

export function AdminAuditLogs() {
    const colors = DASHBOARD_COLORS("admin")

    // State management
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [statistics, setStatistics] = useState<AuditStatistics | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    // Filter state
    const [filters, setFilters] = useState<AuditLogsQuery>({
        page: 1,
        limit: 20,
        sort: "newest",
    })
    const [searchInput, setSearchInput] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedAction, setSelectedAction] = useState<string>("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // Pagination state
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 20,
    })

    // Fetch logs when filters change
    useEffect(() => {
        fetchLogs()
    }, [filters])

    // Fetch statistics on mount
    useEffect(() => {
        fetchStatistics()
    }, [])

    const fetchLogs = async () => {
        setIsLoading(true)
        try {
            const response = await getAuditLogs(filters)
            setLogs(response.data?.items || [])
            const backendPagination = response.data?.pagination
            setPagination({
                total: backendPagination?.total || 0,
                page: backendPagination?.page || 1,
                totalPages: backendPagination?.pages || 0,
                limit: backendPagination?.limit || 20,
            })
        } catch (error) {
            console.error("Failed to fetch audit logs:", error)
            toast.error("Failed to load audit logs")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchStatistics = async () => {
        setIsLoadingStats(true)
        try {
            const stats = await getAuditStatistics()
            setStatistics(stats)
        } catch (error) {
            console.error("Failed to fetch statistics:", error)
            toast.error("Failed to load statistics")
        } finally {
            setIsLoadingStats(false)
        }
    }

    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }))
    }

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category)
        setSelectedAction("all")
        setFilters((prev) => ({
            ...prev,
            category: category === "all" ? undefined : category,
            action: undefined,
            page: 1,
        }))
    }

    const handleActionFilter = (action: string) => {
        setSelectedAction(action)
        setFilters((prev) => ({
            ...prev,
            action: action === "all" ? undefined : action,
            page: 1,
        }))
    }

    const handleDateFilter = () => {
        setFilters((prev) => ({
            ...prev,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page: 1,
        }))
    }

    const handleClearFilters = () => {
        setSearchInput("")
        setSelectedCategory("all")
        setSelectedAction("all")
        setStartDate("")
        setEndDate("")
        setFilters({ page: 1, limit: 20, sort: "newest" })
    }

    const handleRefresh = () => {
        fetchLogs()
        fetchStatistics()
    }

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }))
    }

    const handleLimitChange = (newLimit: string) => {
        setFilters((prev) => ({ ...prev, limit: parseInt(newLimit), page: 1 }))
    }

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log)
        setIsDetailsOpen(true)
    }

    const getActionColor = (action: string): string => {
        const colorMap: Record<string, string> = {
            APPROVE_STUDENT: "bg-green-100 text-green-800",
            REJECT_STUDENT: "bg-red-100 text-red-800",
            APPROVE_MERCHANT: "bg-blue-100 text-blue-800",
            REJECT_MERCHANT: "bg-orange-100 text-orange-800",
            APPROVE_BRANCH: "bg-indigo-100 text-indigo-800",
            REJECT_BRANCH: "bg-pink-100 text-pink-800",
            APPROVE_OFFER: "bg-purple-100 text-purple-800",
            REJECT_OFFER: "bg-amber-100 text-amber-800",
            CREATE_REDEMPTION: "bg-orange-100 text-orange-800",
            REJECT_REDEMPTION: "bg-red-100 text-red-800",
            CREATE_STUDENT: "bg-cyan-100 text-cyan-800",
            CREATE_MERCHANT: "bg-teal-100 text-teal-800",
            CREATE_OFFER: "bg-violet-100 text-violet-800",
            UPDATE_PROFILE: "bg-yellow-100 text-yellow-800",
        }
        return colorMap[action] || "bg-gray-100 text-gray-800"
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
    }

    const formatActionName = (action: string) => {
        return action
            .split("_")
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ")
    }

    const categoryFilters = [
        { value: "all", label: "All Categories" },
        { value: "accept", label: "✅ Accept Actions" },
        { value: "reject", label: "❌ Reject Actions" },
    ]

    const getActionsByCategory = (category: string) => {
        const allActions = [
            { value: "APPROVE_STUDENT", label: "Student Approved", type: 'accept' },
            { value: "REJECT_STUDENT", label: "Student Rejected", type: 'reject' },
            { value: "APPROVE_MERCHANT", label: "Merchant Approved", type: 'accept' },
            { value: "REJECT_MERCHANT", label: "Merchant Rejected", type: 'reject' },
            { value: "APPROVE_BRANCH", label: "Branch Approved", type: 'accept' },
            { value: "REJECT_BRANCH", label: "Branch Rejected", type: 'reject' },
            { value: "APPROVE_OFFER", label: "Offer Approved", type: 'accept' },
            { value: "REJECT_OFFER", label: "Offer Rejected", type: 'reject' },
            { value: "CREATE_REDEMPTION", label: "Redemption Created", type: 'accept' },
            { value: "REJECT_REDEMPTION", label: "Redemption Rejected", type: 'reject' },
        ]

        if (category === "all") return allActions
        return allActions.filter(a => a.type === category)
    }

    const filteredActions = getActionsByCategory(selectedCategory)

    return (
        <div className="space-y-6">
            {isLoading || isLoadingStats ? (
                <div className="flex h-[50vh] items-center justify-center">
                    <Spinner className="size-10" />
                </div>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    <span>Total Logs</span>
                                    <FileText className="w-4 h-4" style={{ color: colors.primary }} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {statistics?.total?.toLocaleString() || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">All time</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    <span>Today's Activity</span>
                                    <Activity className="w-4 h-4" style={{ color: colors.primary }} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {statistics?.recentActivity?.filter(log => {
                                        const today = new Date();
                                        const logDate = new Date(log.createdAt);
                                        return logDate.toDateString() === today.toDateString();
                                    }).length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    <span>Most Common Action</span>
                                    <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold" style={{ color: colors.primary }}>
                                    {statistics?.byAction?.[0]?.action
                                        ? formatActionName(statistics.byAction[0].action)
                                        : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {statistics?.byAction?.[0]?.count || 0} occurrences
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                    <span>Active Users</span>
                                    <Users className="w-4 h-4" style={{ color: colors.primary }} />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {statistics?.recentActivity?.length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Unique users</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters & Search
                            </CardTitle>
                            <CardDescription>Filter audit logs by various criteria</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search Bar */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search action, table name, or user email..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={handleSearch} style={{ backgroundColor: colors.primary }}>
                                    Search
                                </Button>
                            </div>

                            {/* Action and Date Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Category</label>
                                    <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryFilters.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Specific Action</label>
                                    <Select value={selectedAction} onValueChange={handleActionFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Actions</SelectItem>
                                            {filteredActions.map((action) => (
                                                <SelectItem key={action.value} value={action.value}>
                                                    {action.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">End Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <Button variant="outline" onClick={handleClearFilters} className="w-full md:w-auto">
                                    Clear Filters
                                </Button>
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Button variant="outline" onClick={handleDateFilter} className="w-full md:w-auto">
                                        Apply Date Filter
                                    </Button>
                                    <Button variant="outline" onClick={handleRefresh} className="w-full md:w-auto">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>
                                Showing {logs.length} of {pagination.total} logs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No audit logs found</p>
                                    <p className="text-sm">Try adjusting your filters or search criteria</p>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    {/* Desktop Table */}
                                    <div className="hidden md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Timestamp</TableHead>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Details</TableHead>
                                                    <TableHead>IP Address</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logs.map((log) => {
                                                    const datetime = formatDateTime(log.createdAt)
                                                    const isReject = log.action.includes('REJECT')
                                                    const isAccept = log.action.includes('APPROVE') || log.action.includes('CREATE_REDEMPTION')
                                                    
                                                    return (
                                                        <TableRow 
                                                          key={log.id}
                                                          className={
                                                              isReject ? "border-l-4 border-l-red-500" : 
                                                              isAccept ? "border-l-4 border-l-green-500" : ""
                                                          }
                                                        >
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    <div className="font-medium">{datetime.date}</div>
                                                                    <div className="text-muted-foreground">{datetime.time}</div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getActionColor(log.action)}>
                                                                    {formatActionName(log.action)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    <div className="font-medium">{log.user?.email || "Unknown"}</div>
                                                                    {log.user?.role && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {log.user.role}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {log.tableName && <div>Table: {log.tableName}</div>}
                                                                    {log.recordId && (
                                                                        <div className="font-mono text-xs">{log.recordId.slice(0, 8)}...</div>
                                                                    )}
                                                                    {/* Show student details for student approval actions */}
                                                                    {(log.action === 'APPROVE_STUDENT' || log.action === 'REJECT_STUDENT') && log.newValues && (
                                                                        <div className="mt-1 text-xs">
                                                                            {log.newValues.parchiId && (
                                                                                <div className="font-semibold text-blue-600">
                                                                                    {log.newValues.parchiId}
                                                                                </div>
                                                                            )}
                                                                            {log.newValues.firstName && log.newValues.lastName && (
                                                                                <div className="text-foreground">
                                                                                    {log.newValues.firstName} {log.newValues.lastName}
                                                                                </div>
                                                                            )}
                                                                            {log.newValues.verificationStatus && (
                                                                                <Badge
                                                                                    variant={log.newValues.verificationStatus === 'approved' ? 'default' : 'destructive'}
                                                                                    className="text-xs mt-1"
                                                                                >
                                                                                    {log.newValues.verificationStatus}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-mono text-xs text-muted-foreground">
                                                                    {log.ipAddress || "N/A"}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleViewDetails(log)}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y">
                                        {logs.map((log) => {
                                            const datetime = formatDateTime(log.createdAt)
                                            return (
                                                <div key={log.id} className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <Badge className={getActionColor(log.action)}>
                                                                {formatActionName(log.action)}
                                                            </Badge>
                                                            <div className="text-xs text-muted-foreground">
                                                                {datetime.date} at {datetime.time}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleViewDetails(log)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="text-sm">
                                                        <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">User</div>
                                                        <div>{log.user?.email || "Unknown"}</div>
                                                        {log.user?.role && (
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                {log.user.role}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="text-sm">
                                                        <div className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Details</div>
                                                        <div className="text-muted-foreground">
                                                            {log.tableName && <div>Table: {log.tableName}</div>}
                                                            {log.recordId && (
                                                                <div className="font-mono text-xs">ID: {log.recordId.slice(0, 8)}...</div>
                                                            )}
                                                            {/* Show student details for student approval actions */}
                                                            {(log.action === 'APPROVE_STUDENT' || log.action === 'REJECT_STUDENT') && log.newValues && (
                                                                <div className="mt-1 text-xs">
                                                                    {log.newValues.parchiId && (
                                                                        <div className="font-semibold text-blue-600">
                                                                            {log.newValues.parchiId}
                                                                        </div>
                                                                    )}
                                                                    {log.newValues.firstName && log.newValues.lastName && (
                                                                        <div className="text-foreground">
                                                                            {log.newValues.firstName} {log.newValues.lastName}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {logs.length > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Items per page:</span>
                                        <Select value={String(pagination.limit)} onValueChange={handleLimitChange}>
                                            <SelectTrigger className="w-20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </Button>
                                        <span className="text-sm">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Log Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                        <DialogDescription>Full information about this audit log entry</DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                    <p className="text-sm mt-1">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Action</label>
                                    <p className="text-sm mt-1">
                                        <Badge className={getActionColor(selectedLog.action)}>
                                            {formatActionName(selectedLog.action)}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">User</label>
                                    <p className="text-sm mt-1">{selectedLog.user?.email || "Unknown"}</p>
                                    {selectedLog.user?.role && (
                                        <Badge variant="outline" className="text-xs mt-1">
                                            {selectedLog.user.role}
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                                    <p className="text-sm mt-1 font-mono">{selectedLog.ipAddress || "N/A"}</p>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Table Name</label>
                                    <p className="text-sm mt-1">{selectedLog.tableName || "N/A"}</p>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Record ID</label>
                                    <p className="text-sm mt-1 font-mono break-all">{selectedLog.recordId || "N/A"}</p>
                                </div>
                            </div>

                            {/* Student Details Section for Student Approvals */}
                            {(selectedLog.action === 'APPROVE_STUDENT' || selectedLog.action === 'REJECT_STUDENT') && selectedLog.newValues && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold mb-3 text-blue-900">Student Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {selectedLog.newValues.parchiId && (
                                            <div>
                                                <span className="text-muted-foreground">Parchi ID:</span>{' '}
                                                <span className="font-semibold text-blue-600">
                                                    {selectedLog.newValues.parchiId}
                                                </span>
                                            </div>
                                        )}
                                        {selectedLog.newValues.firstName && selectedLog.newValues.lastName && (
                                            <div>
                                                <span className="text-muted-foreground">Student Name:</span>{' '}
                                                <span className="font-semibold">
                                                    {selectedLog.newValues.firstName} {selectedLog.newValues.lastName}
                                                </span>
                                            </div>
                                        )}
                                        {selectedLog.newValues.university && (
                                            <div>
                                                <span className="text-muted-foreground">University:</span>{' '}
                                                <span className="font-medium">{selectedLog.newValues.university}</span>
                                            </div>
                                        )}
                                        {selectedLog.newValues.verificationStatus && (
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>{' '}
                                                <Badge
                                                    variant={selectedLog.newValues.verificationStatus === 'approved' ? 'default' : 'destructive'}
                                                    className="ml-2"
                                                >
                                                    {selectedLog.newValues.verificationStatus}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedLog.oldValues && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Old Values</label>
                                    <pre className="text-xs mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap break-all">
                                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.newValues && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">New Values</label>
                                    <pre className="text-xs mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap break-all">
                                        {JSON.stringify(selectedLog.newValues, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.userAgent && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                                    <p className="text-xs mt-1 font-mono text-muted-foreground break-all">
                                        {selectedLog.userAgent}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
