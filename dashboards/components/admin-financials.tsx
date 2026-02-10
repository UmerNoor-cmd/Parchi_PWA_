"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { ChevronRight, ChevronDown, DollarSign, Building2, Store } from "lucide-react"
import { toast } from "sonner"
import {
    getAdminFinancials,
    getAdminBranchRedemptions,
    AdminFinancialsResponse,
    AdminBranchRedemption
} from "@/lib/api-client"
import { Spinner } from "@/components/ui/spinner"
import { addDays } from "date-fns"
import { DASHBOARD_COLORS } from "@/lib/colors"
import { TestMerchantAlert } from "./test-merchant-alert"

export function AdminFinancials() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    })
    const [data, setData] = useState<AdminFinancialsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [expandedMerchants, setExpandedMerchants] = useState<Set<string>>(new Set())

    // Sheet state for branch details
    const [selectedBranch, setSelectedBranch] = useState<{ id: string, name: string } | null>(null)
    const [branchLogs, setBranchLogs] = useState<AdminBranchRedemption[]>([])
    const [logsLoading, setLogsLoading] = useState(false)

    const colors = DASHBOARD_COLORS("admin")

    const fetchData = async () => {
        setLoading(true)
        try {
            const result = await getAdminFinancials(dateRange?.from, dateRange?.to)
            setData(result)
        } catch (error) {
            console.error("Failed to fetch financials:", error)
            toast.error("Failed to load financial data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange])

    const toggleMerchant = (id: string) => {
        const newExpanded = new Set(expandedMerchants)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedMerchants(newExpanded)
    }

    const handleBranchClick = async (branchId: string, branchName: string) => {
        setSelectedBranch({ id: branchId, name: branchName })
        setLogsLoading(true)
        try {
            const logs = await getAdminBranchRedemptions(branchId, dateRange?.from, dateRange?.to)
            setBranchLogs(logs)
        } catch (error) {
            console.error("Failed to fetch branch logs:", error)
            toast.error("Failed to load redemption logs")
        } finally {
            setLogsLoading(false)
        }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
                    <p className="text-muted-foreground">Track receivables across all corporate partners</p>
                </div>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-8" />
                </div>
            ) : !data ? (
                <div className="text-center py-12 text-muted-foreground">No data available</div>
            ) : (
                <>
                    {/* Top Card: Total Receivables */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <DollarSign className="h-4 w-4" style={{ color: colors.primary }} />
                                Total Receivables
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold" style={{ color: colors.primary }}>
                                {formatCurrency(data.grandTotalReceivables)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                From {data.merchants.length - 1} Corporate Partners (Excluding Tester Account)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Tree View */}
                    <div className="border rounded-lg bg-card">
                        <div className="p-4 border-b bg-muted/40 font-medium grid grid-cols-12 gap-4">
                            <div className="col-span-6 md:col-span-4">Entity</div>
                            <div className="col-span-3 md:col-span-2 text-right">Redemptions</div>
                            <div className="col-span-3 md:col-span-2 text-right">Fee/Unit</div>
                            <div className="col-span-3 md:col-span-4 text-right">Receivables</div>
                        </div>

                        <div className="divide-y">
                            {data.merchants.map((merchant) => (
                                <div key={merchant.id} className="group">
                                    {/* Merchant Row */}
                                    <div
                                        className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => toggleMerchant(merchant.id)}
                                    >
                                        <div className="col-span-6 md:col-span-4 flex items-center gap-2 font-medium">
                                            {expandedMerchants.has(merchant.id) ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            {merchant.name}
                                            <TestMerchantAlert merchantName={merchant.name} />
                                        </div>
                                        <div className="col-span-3 md:col-span-2 text-right text-sm">
                                            {merchant.totalRedemptions}
                                        </div>
                                        <div className="col-span-3 md:col-span-2 text-right text-sm text-muted-foreground">
                                            {formatCurrency(merchant.redemptionFee)}
                                        </div>
                                        <div className="col-span-3 md:col-span-4 text-right font-bold text-green-600">
                                            {formatCurrency(merchant.totalReceivables)}
                                        </div>
                                    </div>

                                    {/* Branches (Expanded) */}
                                    {expandedMerchants.has(merchant.id) && (
                                        <div className="bg-muted/10 border-t border-b-0 divide-y divide-dashed">
                                            {merchant.branches.map((branch) => (
                                                <div
                                                    key={branch.id}
                                                    className="p-3 pl-12 grid grid-cols-12 gap-4 items-center hover:bg-muted/50 cursor-pointer text-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleBranchClick(branch.id, branch.name)
                                                    }}
                                                >
                                                    <div className="col-span-6 md:col-span-4 flex items-center gap-2">
                                                        <Store className="h-3 w-3 text-orange-500" />
                                                        {branch.name}
                                                    </div>
                                                    <div className="col-span-3 md:col-span-2 text-right text-muted-foreground">
                                                        {branch.redemptionCount}
                                                    </div>
                                                    <div className="col-span-3 md:col-span-2 text-right text-muted-foreground">
                                                        -
                                                    </div>
                                                    <div className="col-span-3 md:col-span-4 text-right font-medium">
                                                        {formatCurrency(branch.receivables)}
                                                    </div>
                                                </div>
                                            ))}
                                            {merchant.branches.length === 0 && (
                                                <div className="p-3 pl-12 text-sm text-muted-foreground italic">
                                                    No branches found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {data.merchants.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No merchants found for this period
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Redemption Logs Sheet */}
            <Sheet open={!!selectedBranch} onOpenChange={(open) => !open && setSelectedBranch(null)}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Redemption Logs</SheetTitle>
                        <SheetDescription>
                            {selectedBranch?.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6">
                        {logsLoading ? (
                            <div className="flex justify-center py-8">
                                <Spinner className="size-6" />
                            </div>
                        ) : branchLogs.length > 0 ? (
                            <div className="space-y-4">
                                {branchLogs.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-3 text-sm space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{log.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{log.parchiId} • {log.university}</div>
                                            </div>
                                            <Badge variant={log.status === 'Verified' ? 'secondary' : 'outline'}>
                                                {log.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Offer</div>
                                                <div className="font-medium truncate">{log.offerTitle}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">Discount</div>
                                                <div>{log.discount}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Date</div>
                                                <div>{new Date(log.date).toLocaleString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground">Payable</div>
                                                <div className="font-bold text-green-600">PKR {log.payableAmount}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No redemptions found for this period
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
