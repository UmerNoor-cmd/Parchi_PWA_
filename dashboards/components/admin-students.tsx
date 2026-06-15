"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Eye,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Trophy,
  Calendar as CalendarIcon,
  GraduationCap,
  MoreHorizontal,
  Download,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAllStudents } from "@/hooks/use-kyc"
import type { Student, Institute, StudentFilterClause, StudentFilterFieldMeta, CorporateMerchant } from "@/lib/api-client"
import {
  getActiveInstitutes,
  getStudentFilterFields,
  exportStudents,
  updateStudentAdmin,
  getCorporateMerchants,
} from "@/lib/api-client"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StudentProfileModal } from "./student-profile-modal"
import { StudentFilterBuilder } from "./student-filter-builder"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  type FilterRow,
  STATIC_FILTER_FIELDS,
  upsertFilterRow,
  removeFilterRowByField,
  getFilterRowByField,
  serializeFilters,
} from "@/lib/student-filter-config"

export function AdminStudents({
  onViewProfile,
  onViewRedemptions,
}: {
  onViewProfile?: (id: string) => void
  onViewRedemptions?: (id: string) => void
}) {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [limit] = useState(25)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterRows, setFilterRows] = useState<FilterRow[]>([])
  const [appliedFilters, setAppliedFilters] = useState<StudentFilterClause[]>([])

  const [availableInstitutes, setAvailableInstitutes] = useState<Institute[]>([])
  const [fieldMetadata, setFieldMetadata] = useState<StudentFilterFieldMeta[]>(STATIC_FILTER_FIELDS)
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [showGenderPrompt, setShowGenderPrompt] = useState(false)
  const [genderFillIndex, setGenderFillIndex] = useState(0)
  const [isGenderFillingActive, setIsGenderFillingActive] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const apiFilters = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      filters: appliedFilters.length > 0 ? appliedFilters : undefined,
    }),
    [page, limit, debouncedSearch, appliedFilters],
  )

  const { students, loading, pagination, refetch } = useAllStudents(apiFilters)

  const studentsWithNullGender = useMemo(
    () => (students || []).filter((s) => s.gender === null || s.gender === undefined),
    [students],
  )

  useEffect(() => {
    if (!loading && studentsWithNullGender.length > 0) {
      setShowGenderPrompt(true)
    }
  }, [loading, studentsWithNullGender.length])

  useEffect(() => {
    getActiveInstitutes().then(setAvailableInstitutes).catch(() => {})
    getStudentFilterFields().then(setFieldMetadata).catch(() => {})
    getCorporateMerchants().then((res) => setMerchants(res.data || [])).catch(() => {})
  }, [])

  const handleApplyFilters = () => {
    setAppliedFilters(serializeFilters(filterRows))
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setFilterRows([])
    setAppliedFilters([])
    setPage(1)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const result = await exportStudents({
        search: debouncedSearch.trim() || undefined,
        filters: appliedFilters.length > 0 ? appliedFilters : undefined,
      })
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `students-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (result.truncated) {
        toast({
          title: "Export capped",
          description: `Export capped at 50,000 rows (${result.total?.toLocaleString()} total). Narrow your filters for a complete export.`,
          variant: "destructive",
        })
      } else {
        toast({ title: "Export complete", description: "CSV downloaded successfully." })
      }
    } catch {
      toast({ title: "Export failed", description: "Could not export students.", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFillGender = async (studentId: string, value: string) => {
    try {
      await updateStudentAdmin(studentId, { gender: value })
      if (genderFillIndex < studentsWithNullGender.length - 1) {
        setGenderFillIndex((prev) => prev + 1)
      } else {
        setIsGenderFillingActive(false)
        setShowGenderPrompt(false)
        toast({ title: "Complete", description: "All missing genders have been filled" })
      }
      refetch()
    } catch {
      toast({ title: "Error", description: "Failed to update gender", variant: "destructive" })
    }
  }

  const handleViewProfile = (id: string) => {
    setSelectedProfileId(id)
    setIsProfileOpen(true)
  }

  // --- Quick shortcut helpers (sync with filterRows) ---

  const universityValue = getFilterRowByField(filterRows, "university")?.value
  const university = typeof universityValue === "string" ? universityValue : undefined

  const kycRow = getFilterRowByField(filterRows, "verification_status")
  const kycStatuses = kycRow?.operator === "in" && Array.isArray(kycRow.value) ? kycRow.value : []

  const redemptionRow = getFilterRowByField(filterRows, "lifetime_redemptions")
  const minRedemptions =
    redemptionRow?.operator === "gte"
      ? String(redemptionRow.value)
      : redemptionRow?.operator === "between" && Array.isArray(redemptionRow.value)
        ? redemptionRow.value[0] || ""
        : ""
  const maxRedemptions =
    redemptionRow?.operator === "lte"
      ? String(redemptionRow.value)
      : redemptionRow?.operator === "between" && Array.isArray(redemptionRow.value)
        ? redemptionRow.value[1] || ""
        : ""

  const createdAtRow = getFilterRowByField(filterRows, "created_at")
  const dateRange: DateRange | undefined = useMemo(() => {
    if (createdAtRow?.operator === "between" && Array.isArray(createdAtRow.value)) {
      const from = createdAtRow.value[0] ? new Date(createdAtRow.value[0]) : undefined
      const to = createdAtRow.value[1] ? new Date(createdAtRow.value[1]) : undefined
      if (from || to) return { from, to }
    }
    return undefined
  }, [createdAtRow])

  const hasRedeemedRow = getFilterRowByField(filterRows, "lifetime_redemptions")
  const hasRedeemed: boolean | undefined =
    hasRedeemedRow?.operator === "gt" && hasRedeemedRow.value === "0"
      ? true
      : hasRedeemedRow?.operator === "eq" && hasRedeemedRow.value === "0"
        ? false
        : undefined

  const foundersRow = getFilterRowByField(filterRows, "is_founders_club")
  const foundersClub: boolean | undefined =
    foundersRow?.operator === "is_true" ? true : foundersRow?.operator === "is_false" ? false : undefined

  const setUniversityShortcut = (value: string | undefined) => {
    if (!value) {
      setFilterRows((rows) => removeFilterRowByField(rows, "university"))
    } else {
      setFilterRows((rows) => upsertFilterRow(rows, "university", "contains", value))
    }
  }

  const toggleKycStatus = (status: string) => {
    setFilterRows((rows) => {
      const row = getFilterRowByField(rows, "verification_status")
      const current = row?.operator === "in" && Array.isArray(row.value) ? row.value : []
      const next = current.includes(status) ? current.filter((s) => s !== status) : [...current, status]
      if (next.length === 0) return removeFilterRowByField(rows, "verification_status")
      return upsertFilterRow(rows, "verification_status", "in", next)
    })
  }

  const setRedemptionRange = (min: string, max: string) => {
    setFilterRows((rows) => {
      const without = removeFilterRowByField(rows, "lifetime_redemptions")
      if (min && max) return upsertFilterRow(without, "lifetime_redemptions", "between", [min, max])
      if (min) return upsertFilterRow(without, "lifetime_redemptions", "gte", min)
      if (max) return upsertFilterRow(without, "lifetime_redemptions", "lte", max)
      return without
    })
  }

  const setDateRangeShortcut = (range: DateRange | undefined) => {
    if (!range?.from) {
      setFilterRows((rows) => removeFilterRowByField(rows, "created_at"))
      return
    }
    setFilterRows((rows) =>
      upsertFilterRow(rows, "created_at", "between", [
        range.from!.toISOString(),
        (range.to || range.from)!.toISOString(),
      ]),
    )
  }

  const setHasRedeemedShortcut = (value: boolean | undefined) => {
    setFilterRows((rows) => {
      let without = removeFilterRowByField(rows, "lifetime_redemptions")
      if (value === true) without = upsertFilterRow(without, "lifetime_redemptions", "gt", "0")
      else if (value === false) without = upsertFilterRow(without, "lifetime_redemptions", "eq", "0")
      return without
    })
  }

  const setFoundersClubShortcut = (value: boolean | undefined) => {
    setFilterRows((rows) => {
      let without = removeFilterRowByField(rows, "is_founders_club")
      if (value === true) without = upsertFilterRow(without, "is_founders_club", "is_true", "")
      else if (value === false) without = upsertFilterRow(without, "is_founders_club", "is_false", "")
      return without
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approved</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "suspended":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {showGenderPrompt && studentsWithNullGender.length > 0 && !isGenderFillingActive && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-bold">Missing Data</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {studentsWithNullGender.length} students have no gender recorded. Fill them in to unlock gender-based analytics.
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={() => setIsGenderFillingActive(true)}
              >
                Fill Missing
              </Button>
              <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-800" onClick={() => setShowGenderPrompt(false)}>
                Skip
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isGenderFillingActive} onOpenChange={setIsGenderFillingActive}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fill Missing Gender</DialogTitle>
            <DialogDescription>
              Progress: {genderFillIndex + 1} / {studentsWithNullGender.length}
            </DialogDescription>
          </DialogHeader>
          {studentsWithNullGender[genderFillIndex] && (
            <div className="py-6 space-y-6 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {studentsWithNullGender[genderFillIndex].firstName} {studentsWithNullGender[genderFillIndex].lastName}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{studentsWithNullGender[genderFillIndex].parchiId}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Male", "Female", "Other"].map((g) => (
                  <Button
                    key={g}
                    variant="outline"
                    className="h-16 flex-col gap-1 border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleFillGender(studentsWithNullGender[genderFillIndex].id, g)}
                  >
                    <User className="h-5 w-5" />
                    {g}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setIsGenderFillingActive(false)}>Cancel</Button>
            <Button variant="ghost" onClick={() => setGenderFillIndex((prev) => Math.min(studentsWithNullGender.length - 1, prev + 1))}>
              Skip Current
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Directory</h2>
          <p className="text-muted-foreground">Manage and filter all registered students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterVisible(!isFilterVisible)}>
            <Filter className="mr-2 h-4 w-4" />
            {isFilterVisible ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting || loading}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {isFilterVisible && (
        <Card className="bg-slate-50/50">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, ID, Email..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <StudentFilterBuilder
              rows={filterRows}
              onChange={setFilterRows}
              fieldMetadata={fieldMetadata}
              merchants={merchants}
            />

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block">Quick Shortcuts</Label>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">University</Label>
                  <Select value={university || "all"} onValueChange={(v) => setUniversityShortcut(v === "all" ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Universities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {availableInstitutes.map((inst) => (
                        <SelectItem key={inst.id} value={inst.name}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Date Joined</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRangeShortcut}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">KYC Status</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["pending", "approved", "rejected", "suspended"].map((status) => (
                      <Badge
                        key={status}
                        variant={kycStatuses.includes(status) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleKycStatus(status)}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Redemption Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minRedemptions}
                      onChange={(e) => setRedemptionRange(e.target.value, maxRedemptions)}
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxRedemptions}
                      onChange={(e) => setRedemptionRange(minRedemptions, e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Redemption History</Label>
                  <Select
                    value={hasRedeemed === undefined ? "all" : String(hasRedeemed)}
                    onValueChange={(v) => setHasRedeemedShortcut(v === "all" ? undefined : v === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="true">Has Redeemed</SelectItem>
                      <SelectItem value="false">Never Redeemed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Founders Club</Label>
                  <Select
                    value={foundersClub === undefined ? "all" : String(foundersClub)}
                    onValueChange={(v) => setFoundersClubShortcut(v === "all" ? undefined : v === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="true">Members Only</SelectItem>
                      <SelectItem value="false">Non-Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Parchi ID</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead className="text-center">Redemptions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Loading students...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-64 text-center">
                    <p className="text-muted-foreground">No students found matching your criteria</p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-muted-foreground">#{(page - 1) * limit + index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.profilePicture || ""} alt={student.firstName} />
                          <AvatarFallback className="bg-slate-100 text-[10px]">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{student.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold">{student.parchiId}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs truncate">{student.university}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">{student.gender || "Not Set"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.verificationStatus)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-sm">{student.totalRedemptions || 0}</span>
                        {student.isFoundersClub && <Trophy className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {student.createdAt ? format(new Date(student.createdAt), "MMM d, yyyy") : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewProfile(student.id)} title="View Profile">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Student Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewProfile(student.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewRedemptions?.(student.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Redemption History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewProfile?.(student.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Review KYC (Legacy)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {}}>
                              {student.isActive ? "Deactivate Account" : "Activate Account"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <b>{(page - 1) * limit + 1}</b> to <b>{Math.min(page * limit, pagination.total)}</b> of <b>{pagination.total}</b> students
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || loading}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum = page
                if (page <= 3) pageNum = i + 1
                else if (page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                else pageNum = page - 2 + i
                if (pageNum < 1 || pageNum > pagination.pages) return null
                return (
                  <Button key={pageNum} variant={page === pageNum ? "default" : "outline"} size="sm" className="w-9" onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={!pagination.hasNext || loading}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <StudentProfileModal
        studentId={selectedProfileId}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={refetch}
        availableInstitutes={availableInstitutes}
      />
    </div>
  )
}
