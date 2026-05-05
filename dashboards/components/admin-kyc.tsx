"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, Search, Eye, MoreHorizontal, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ZoomIn, Trash2, Save, Mail, Apple, Smartphone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { usePendingStudents, useAllStudents, useStudentDetail, useApproveRejectStudent, useUpdateStudentStatus, useDeleteStudent, useUpdateStudentAdmin, useVerifyStudentEmail } from "@/hooks/use-kyc"
import type { Student, UpdateStudentAdminRequest } from "@/lib/api-client"

import { AdminInstitutesDialog } from "./admin-institutes-dialog"

export function AdminKYC() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isInstitutesDialogOpen, setIsInstitutesDialogOpen] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [expandedImage, setExpandedImage] = useState<{ url: string; alt: string } | null>(null)
  const [pendingPage, setPendingPage] = useState(1)
  const [allPage, setAllPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'expired' | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [instituteQuery, setInstituteQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [debouncedInstitute, setDebouncedInstitute] = useState("")
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<boolean | undefined>(undefined)
  const [groupByFilter, setGroupByFilter] = useState<'university' | 'city' | undefined>(undefined)
  // New state for deactivation
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [deactivationReason, setDeactivationReason] = useState("")
  const [studentToDeactivate, setStudentToDeactivate] = useState<Student | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [cnicInput, setCnicInput] = useState("")
  const { toast } = useToast()


  const { students: pendingStudents, loading: pendingLoading, error: pendingError, pagination: pendingPagination, refetch: refetchPending } = usePendingStudents(pendingPage, 12)

  // Debounce search and institute queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setDebouncedInstitute(instituteQuery)
      // Reset to page 1 when search or institute changes
      if (searchQuery !== debouncedSearch || instituteQuery !== debouncedInstitute) {
        setAllPage(1)
      }
    }, 500) // Increased debounce time for both
    return () => clearTimeout(timer)
  }, [searchQuery, instituteQuery, debouncedSearch, debouncedInstitute]) // Added debounced values to dependencies to trigger page reset correctly

  // Memoize filters object to prevent unnecessary re-renders
  const allStudentsFilters = useMemo(() => ({
    status: statusFilter,
    page: allPage,
    limit: 12,
    search: debouncedSearch.trim() || undefined,
    institute: debouncedInstitute.trim() || undefined,
    emailVerified: emailVerifiedFilter,
    groupBy: groupByFilter
  }), [statusFilter, allPage, debouncedSearch, debouncedInstitute, emailVerifiedFilter, groupByFilter])

  const { students: allStudents, loading: allLoading, error: allError, pagination: allPagination, refetch: refetchAll } = useAllStudents(allStudentsFilters)
  const { student: studentDetail, loading: detailLoading, error: detailError, refetch: refetchDetail } = useStudentDetail(selectedStudentId)
  const { approveReject, loading: approveRejectLoading, error: approveRejectError } = useApproveRejectStudent()
  const { updateStatus, loading: updateStatusLoading, error: updateStatusError } = useUpdateStudentStatus()
  const { removeStudent, loading: deleteStudentLoading, error: deleteStudentError } = useDeleteStudent()
  const { save: saveStudentProfile, loading: saveProfileLoading, error: saveProfileError } = useUpdateStudentAdmin()
  const { verifyEmail, loading: verifyEmailLoading } = useVerifyStudentEmail()

  const [profileDraft, setProfileDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    university: "",
    graduationYear: "",
    isFoundersClub: false,
    totalSavings: "0",
    totalRedemptions: "0",
    verificationStatus: "pending" as Student["verificationStatus"],
    verificationExpiresAt: "",
    cnic: "",
    dateOfBirth: "",
    profilePicture: "",
    verificationSelfiePath: "",
    isActive: true,
  })

  useEffect(() => {
    if (!studentDetail) return
    setProfileDraft({
      firstName: studentDetail.firstName,
      lastName: studentDetail.lastName,
      email: studentDetail.email,
      phone: studentDetail.phone ?? "",
      university: studentDetail.university,
      graduationYear: studentDetail.graduationYear != null ? String(studentDetail.graduationYear) : "",
      isFoundersClub: studentDetail.isFoundersClub,
      totalSavings: String(studentDetail.totalSavings ?? 0),
      totalRedemptions: String(studentDetail.totalRedemptions ?? 0),
      verificationStatus: studentDetail.verificationStatus,
      verificationExpiresAt: studentDetail.verificationExpiresAt
        ? new Date(studentDetail.verificationExpiresAt).toISOString().slice(0, 16)
        : "",
      cnic: studentDetail.cnic ?? "",
      dateOfBirth: studentDetail.dateOfBirth ? studentDetail.dateOfBirth.slice(0, 10) : "",
      profilePicture: studentDetail.profilePicture ?? "",
      verificationSelfiePath: studentDetail.verificationSelfiePath ?? "",
      isActive: studentDetail.isActive,
    })
  }, [studentDetail?.id, studentDetail?.updatedAt])

  // Reset page when status filter changes
  useEffect(() => {
    setAllPage(1)
  }, [statusFilter])

  const handleRefresh = () => {
    refetchPending()
    refetchAll()
  }

  const handleReview = (studentId: string) => {
    setSelectedStudentId(studentId)
    setIsReviewOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedStudentId) return
    
    const digitsOnly = cnicInput.replace(/\D/g, "")
    if (digitsOnly.length !== 13) {
      toast({
        title: "Invalid CNIC",
        description: "Please enter a valid 13-digit CNIC number.",
        variant: "destructive"
      })
      return
    }

    const result = await approveReject(selectedStudentId, { 
      action: 'approve',
      cnic: digitsOnly
    })
    if (result) {
      toast({
        title: "Success",
        description: "Student approved successfully",
      })
      setIsReviewOpen(false)
      setSelectedStudentId(null)
      setCnicInput("")
      refetchPending()
      refetchAll()
    } else {

      toast({
        title: "Error",
        description: approveRejectError || "Failed to approve student",
        variant: "destructive",
      })
    }
  }

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedStudentId) return

    const result = await approveReject(selectedStudentId, {
      action: 'reject',
      reviewNotes: rejectionNotes.trim() || undefined,
    })
    if (result) {
      toast({
        title: "Success",
        description: "Student rejected successfully",
      })
      setIsReviewOpen(false)
      setIsRejectDialogOpen(false)
      setRejectionNotes("")
      setSelectedStudentId(null)
      refetchPending()
      refetchAll()
    } else {
      toast({
        title: "Error",
        description: approveRejectError || "Failed to reject student",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (student: Student) => {
    // If activating, just call update
    if (!student.isActive) {
      const result = await updateStatus(student.id, true)
      if (result) {
        toast({
          title: "Success",
          description: "Student activated successfully",
        })
        refetchAll()
      } else {
        toast({
          title: "Error",
          description: updateStatusError || "Failed to activate student",
          variant: "destructive",
        })
      }
    } else {
      // If deactivating, open dialog
      setStudentToDeactivate(student)
      setIsDeactivateDialogOpen(true)
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!studentToDeactivate) return

    const result = await updateStatus(studentToDeactivate.id, false, deactivationReason)

    if (result) {
      toast({
        title: "Success",
        description: "Student deactivated successfully",
      })
      setIsDeactivateDialogOpen(false)
      setStudentToDeactivate(null)
      setDeactivationReason("")
      refetchAll()
    } else {
      toast({
        title: "Error",
        description: updateStatusError || "Failed to deactivate student",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    const ok = await removeStudent(studentToDelete.id)
    if (ok) {
      toast({
        title: "Student Deleted",
        description: `${studentToDelete.firstName} ${studentToDelete.lastName} was deleted successfully.`,
      })
      setIsDeleteDialogOpen(false)
      setStudentToDelete(null)
      refetchAll()
      refetchPending()
    } else {
      toast({
        title: "Error",
        description: deleteStudentError || "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!selectedStudentId || !studentDetail) return
    const gy = profileDraft.graduationYear.trim()
    let graduationYear: number | null = null
    if (gy !== "") {
      const n = parseInt(gy, 10)
      if (Number.isNaN(n)) {
        toast({
          title: "Error",
          description: "Graduation year must be a valid number.",
          variant: "destructive",
        })
        return
      }
      graduationYear = n
    }
    const payload: UpdateStudentAdminRequest = {
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim() || null,
      university: profileDraft.university.trim(),
      graduationYear,
      isFoundersClub: profileDraft.isFoundersClub,
      totalSavings: Number(profileDraft.totalSavings) || 0,
      totalRedemptions: parseInt(profileDraft.totalRedemptions, 10) || 0,
      verificationStatus: profileDraft.verificationStatus,
      verificationExpiresAt: profileDraft.verificationExpiresAt.trim() || null,
      cnic: profileDraft.cnic.trim() || null,
      dateOfBirth: profileDraft.dateOfBirth.trim() || null,
      profilePicture: profileDraft.profilePicture.trim() || null,
      verificationSelfiePath: profileDraft.verificationSelfiePath.trim() || null,
      isActive: profileDraft.isActive,
    }
    const result = await saveStudentProfile(selectedStudentId, payload)
    if (result) {
      toast({
        title: "Saved",
        description: "Student profile updated successfully.",
      })
      refetchDetail()
      refetchAll()
      refetchPending()
    } else {
      toast({
        title: "Error",
        description: saveProfileError || "Failed to save profile",
        variant: "destructive",
      })
    }
  }

  const handleVerifyEmail = async (studentId: string) => {
    const result = await verifyEmail(studentId)
    if (result) {
      toast({
        title: "Email Verified",
        description: "Student email has been manually verified.",
      })
      refetchAll()
      if (selectedStudentId === studentId) {
        refetchDetail()
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to verify student email.",
        variant: "destructive",
      })
    }
  }

  // Server-side search is now handled by the API, but keep client-side filtering as fallback
  // This will be removed once backend search is fully implemented
  const filteredAllStudents = allStudents.filter((student) =>
    !searchQuery.trim() ||
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.parchiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.university.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'expired':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      case 'expired': return 'Expired'
      default: return status
    }
  }

  // Generate pagination items logic
  const generatePaginationItems = (currentPage: number, totalPages: number) => {
    const items: (number | null)[] = []

    // Always show first page
    items.push(1)

    // Calculate start and end of visible pages around current
    let start = Math.max(2, currentPage - 1)
    let end = Math.min(totalPages - 1, currentPage + 1)

    // Adjust if near start or end to keep consistent number of items if possible
    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, 4)
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3)
    }

    // Add ellipsis before start if needed
    if (start > 2) {
      items.push(null)
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      items.push(i)
    }

    // Add ellipsis after end if needed
    if (end < totalPages - 1) {
      items.push(null)
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(totalPages)
    }

    return items
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student KYC</h2>
          <p className="text-muted-foreground">Manage student verifications and records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInstitutesDialogOpen(true)}>
            Manage Institutes
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={pendingLoading || allLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${pendingLoading || allLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <AdminInstitutesDialog open={isInstitutesDialogOpen} onOpenChange={setIsInstitutesDialogOpen} />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals {pendingPagination ? `(${pendingPagination.total})` : ''}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Students {allPagination ? `(${allPagination.total})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{pendingError}</AlertDescription>
            </Alert>
          )}

          {pendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading pending students...</span>
            </div>
          ) : pendingStudents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No pending students found.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingStudents.map((student) => (
                  <Card key={student.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {student.university}
                      </CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{student.firstName} {student.lastName}</div>
                      <p className="text-xs text-muted-foreground">
                        ID: {student.parchiId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {student.email}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button className="w-full" onClick={() => handleReview(student.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pendingPagination && pendingPagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {pendingPagination.page} of {pendingPagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPendingPage(p => Math.max(1, p - 1))
                      }}
                      disabled={!pendingPagination.hasPrev || pendingLoading}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPendingPage(p => Math.min(pendingPagination.pages, p + 1))
                      }}
                      disabled={!pendingPagination.hasNext || pendingLoading}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Database</CardTitle>
                  <CardDescription>
                    A list of all registered students and their verification status.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchAll()}
                  disabled={allLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${allLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{allError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4 py-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Filter by institute..."
                    value={instituteQuery}
                    onChange={(e) => setInstituteQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === undefined && emailVerifiedFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter(undefined)
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('pending')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('approved')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === 'rejected' ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatusFilter('rejected')
                      setEmailVerifiedFilter(undefined)
                    }}
                  >
                    Rejected
                  </Button>
                  <Button
                    variant={emailVerifiedFilter === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      setEmailVerifiedFilter(emailVerifiedFilter === false ? undefined : false)
                      setStatusFilter(undefined)
                    }}
                  >
                    Unverified
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground whitespace-nowrap">Segmentation:</Label>
                  <Select value={groupByFilter || 'none'} onValueChange={(v) => setGroupByFilter(v === 'none' ? undefined : v as any)}>
                    <SelectTrigger className="h-9 w-[160px] text-xs font-bold">
                      <SelectValue placeholder="Group by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">List View</SelectItem>
                      <SelectItem value="university">By Institution</SelectItem>
                      <SelectItem value="city">By City</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {allLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading students...</span>
                </div>
              ) : filteredAllStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'No students found matching your search.' : 'No students found.'}
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    {groupByFilter ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">{groupByFilter === 'university' ? 'Institution' : 'City'}</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Total Students</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-green-600">Approved</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-yellow-600">Pending</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest text-red-600">Rejected</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allStudents.map((group: any) => (
                            <TableRow key={group.group} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                              <TableCell className="font-black text-slate-900 dark:text-white">{group.group}</TableCell>
                              <TableCell className="font-bold">{group.total}</TableCell>
                              <TableCell>
                                <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                                  {group.approved}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                  {group.pending}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
                                  {group.rejected}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Institute</TableHead>
                          <TableHead>Parchi ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Email Status</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.university}</TableCell>
                            <TableCell>{student.parchiId}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              <Badge variant={student.emailConfirmed ? "default" : "destructive"} className="text-xs">
                                {student.emailConfirmed ? "Verified" : "Unverified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.platform === 'ios' ? (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Apple className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">iOS</span>
                                </div>
                              ) : student.platform === 'android' ? (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <Smartphone className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-tighter">Android</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(student.verificationStatus)}>
                                {getStatusText(student.verificationStatus)}
                              </Badge>
                              {student.verificationStatus === 'rejected' && student.reviewNotes && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-[10px] text-destructive mt-1 max-w-[150px] truncate leading-tight font-medium cursor-help">
                                        ↳ {student.reviewNotes}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs p-3 text-xs bg-slate-900 text-white border-slate-800 shadow-2xl">
                                      <p className="font-bold mb-1 uppercase tracking-tighter opacity-60">Rejection Reason</p>
                                      <p className="leading-relaxed">{student.reviewNotes}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {!student.isActive && student.verificationStatus === 'approved' && (
                                <Badge variant="secondary" className="ml-2">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleReview(student.id)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {student.isActive ? (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(student)} className="text-red-600">
                                      <X className="mr-2 h-4 w-4" /> Deactivate Account
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(student)} className="text-green-600">
                                      <Check className="mr-2 h-4 w-4" /> Activate Account
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDeleteClick(student)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                                  </DropdownMenuItem>
                                  {!student.emailConfirmed && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleVerifyEmail(student.id)} className="text-blue-600">
                                        <Mail className="mr-2 h-4 w-4" /> Verify Email
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    )}
                  </div>

                  {!groupByFilter && allPagination && allPagination.pages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setAllPage(p => Math.max(1, p - 1))}
                              className={!allPagination.hasPrev || allLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {generatePaginationItems(allPagination.page, allPagination.pages).map((p, i) => (
                            <PaginationItem key={i}>
                              {p === null ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  isActive={allPagination.page === p}
                                  onClick={() => setAllPage(p)}
                                  className="cursor-pointer"
                                >
                                  {p}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setAllPage(p => Math.min(allPagination.pages, p + 1))}
                              className={!allPagination.hasNext || allLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={(open) => {
        setIsReviewOpen(open)
        if (!open) {
          setSelectedStudentId(null)
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student details & KYC</DialogTitle>
            <DialogDescription>
              {studentDetail
                ? `Edit profile (Parchi ID is read-only) and review KYC for ${studentDetail.firstName} ${studentDetail.lastName}.`
                : "Loading student details..."}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading student details...</span>
            </div>
          ) : detailError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{detailError}</AlertDescription>
            </Alert>
          ) : studentDetail ? (
            <div className="space-y-8 py-4">
              <div className="space-y-4 border-b pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-sm font-semibold">Account & profile</h3>
                  <Button type="button" onClick={handleSaveProfile} disabled={saveProfileLoading}>
                    {saveProfileLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save profile changes
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Parchi ID</Label>
                    <Input value={studentDetail.parchiId} readOnly className="bg-muted font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-fn">First name</Label>
                    <Input id="draft-fn" value={profileDraft.firstName} onChange={(e) => setProfileDraft((d) => ({ ...d, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-ln">Last name</Label>
                    <Input id="draft-ln" value={profileDraft.lastName} onChange={(e) => setProfileDraft((d) => ({ ...d, lastName: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="draft-email">Email</Label>
                    <Input id="draft-email" type="email" value={profileDraft.email} onChange={(e) => setProfileDraft((d) => ({ ...d, email: e.target.value }))} />
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">Confirmation (read-only):</span>
                      <Badge variant={studentDetail.emailConfirmed ? "default" : "destructive"} className="text-xs">
                        {studentDetail.emailConfirmed ? "Verified" : "Unverified"}
                      </Badge>
                      {!studentDetail.emailConfirmed && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleVerifyEmail(studentDetail.id)}
                          disabled={verifyEmailLoading}
                        >
                          {verifyEmailLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                          Verify manually
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-phone">Phone</Label>
                    <Input id="draft-phone" value={profileDraft.phone} onChange={(e) => setProfileDraft((d) => ({ ...d, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="draft-uni">University / institute</Label>
                    <Input id="draft-uni" value={profileDraft.university} onChange={(e) => setProfileDraft((d) => ({ ...d, university: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-gy">Graduation year</Label>
                    <Input id="draft-gy" type="number" value={profileDraft.graduationYear} onChange={(e) => setProfileDraft((d) => ({ ...d, graduationYear: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-dob">Date of birth</Label>
                    <Input id="draft-dob" type="date" value={profileDraft.dateOfBirth} onChange={(e) => setProfileDraft((d) => ({ ...d, dateOfBirth: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-cnic">CNIC</Label>
                    <Input id="draft-cnic" value={profileDraft.cnic} onChange={(e) => setProfileDraft((d) => ({ ...d, cnic: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-vs">Verification status</Label>
                    <Select
                      value={profileDraft.verificationStatus}
                      onValueChange={(v) => setProfileDraft((d) => ({ ...d, verificationStatus: v as Student["verificationStatus"] }))}
                    >
                      <SelectTrigger id="draft-vs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-exp">Verification expires at</Label>
                    <Input
                      id="draft-exp"
                      type="datetime-local"
                      value={profileDraft.verificationExpiresAt}
                      onChange={(e) => setProfileDraft((d) => ({ ...d, verificationExpiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-savings">Total savings (PKR)</Label>
                    <Input
                      id="draft-savings"
                      type="number"
                      step="0.01"
                      value={profileDraft.totalSavings}
                      onChange={(e) => setProfileDraft((d) => ({ ...d, totalSavings: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="draft-red">Total redemptions</Label>
                    <Input
                      id="draft-red"
                      type="number"
                      min={0}
                      value={profileDraft.totalRedemptions}
                      onChange={(e) => setProfileDraft((d) => ({ ...d, totalRedemptions: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="draft-pfp">Profile picture URL</Label>
                    <Input id="draft-pfp" value={profileDraft.profilePicture} onChange={(e) => setProfileDraft((d) => ({ ...d, profilePicture: e.target.value }))} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="draft-selfie-path">Verification selfie URL</Label>
                    <Input
                      id="draft-selfie-path"
                      value={profileDraft.verificationSelfiePath}
                      onChange={(e) => setProfileDraft((d) => ({ ...d, verificationSelfiePath: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                    <Label htmlFor="draft-fc">Founders Club member</Label>
                    <Switch
                      id="draft-fc"
                      checked={profileDraft.isFoundersClub}
                      onCheckedChange={(v) => setProfileDraft((d) => ({ ...d, isFoundersClub: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                    <Label htmlFor="draft-active">Account active</Label>
                    <Switch
                      id="draft-active"
                      checked={profileDraft.isActive}
                      onCheckedChange={(v) => setProfileDraft((d) => ({ ...d, isActive: v }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground pt-2">
                  <div>
                    <span className="font-medium text-foreground">Verified at: </span>
                    {studentDetail.verifiedAt ? new Date(studentDetail.verifiedAt).toLocaleString() : "—"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Verified by: </span>
                    {studentDetail.verifiedBy?.email ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Created: </span>
                    {studentDetail.createdAt ? new Date(studentDetail.createdAt).toLocaleString() : "—"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Updated: </span>
                    {studentDetail.updatedAt ? new Date(studentDetail.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold">KYC documents</h3>
                {studentDetail.kyc ? (() => {
                  const kyc = studentDetail.kyc as NonNullable<typeof studentDetail.kyc>
                  return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Student ID Card (Front)</Label>
                <div
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => setExpandedImage({
                    url: kyc.studentIdCardFrontPath,
                    alt: "Student ID Front"
                  })}
                >
                  <img
                    src={kyc.studentIdCardFrontPath}
                    alt="Student ID Front"
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Student ID Card (Back)</Label>
                <div
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => setExpandedImage({
                    url: kyc.studentIdCardBackPath,
                    alt: "Student ID Back"
                  })}
                >
                  <img
                    src={kyc.studentIdCardBackPath}
                    alt="Student ID Back"
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>CNIC (Front)</Label>
                <div
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => kyc.cnicFrontImagePath && setExpandedImage({
                    url: kyc.cnicFrontImagePath,
                    alt: "CNIC Front"
                  })}
                >
                  {kyc.cnicFrontImagePath ? (
                    <>
                      <img
                        src={kyc.cnicFrontImagePath}
                        alt="CNIC Front"
                        className="w-full h-auto rounded-md object-contain max-h-[300px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No Image Available
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>CNIC (Back)</Label>
                <div
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => kyc.cnicBackImagePath && setExpandedImage({
                    url: kyc.cnicBackImagePath,
                    alt: "CNIC Back"
                  })}
                >
                  {kyc.cnicBackImagePath ? (
                    <>
                      <img
                        src={kyc.cnicBackImagePath}
                        alt="CNIC Back"
                        className="w-full h-auto rounded-md object-contain max-h-[300px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=500'
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      No Image Available
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selfie</Label>
                <div
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => setExpandedImage({
                    url: kyc.selfieImagePath,
                    alt: "Selfie"
                  })}
                >
                  <img
                    src={kyc.selfieImagePath}
                    alt="Selfie"
                    className="w-full h-auto rounded-md object-contain max-h-[300px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg?height=300&width=300'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-md transition-colors">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

                <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-t pt-4">
                  {kyc.submittedAt && (
                    <span>
                      <span className="font-medium text-foreground">KYC submitted: </span>
                      {new Date(kyc.submittedAt).toLocaleString()}
                    </span>
                  )}
                  {kyc.isAnnualRenewal && (
                    <Badge variant="outline">Annual renewal</Badge>
                  )}
                </div>
            </div>
                  )
                })() : (
                  <p className="text-sm text-muted-foreground">No KYC submission on file.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Could not load this student.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {!studentDetail?.emailConfirmed && (
              <Button
                variant="secondary"
                onClick={() => handleVerifyEmail(studentDetail!.id)}
                disabled={verifyEmailLoading || !studentDetail}
              >
                {verifyEmailLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Verify Email
              </Button>
            )}
            
            {studentDetail?.verificationStatus !== 'approved' && (
              <div className="flex items-center gap-2 mr-auto">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="cnic-verify" className="sr-only">Enter CNIC</Label>
                  <Input 
                    id="cnic-verify"
                    placeholder="Enter 13-digit CNIC" 
                    value={cnicInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 13) setCnicInput(val);
                    }}
                    className="w-[200px]"
                    autoComplete="off"
                  />
                </div>
                {cnicInput.length > 0 && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {cnicInput.length}/13
                  </span>
                )}
              </div>
            )}

            <Button
              variant="destructive"
              onClick={handleRejectClick}
              disabled={approveRejectLoading || !studentDetail}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveRejectLoading || !studentDetail || studentDetail?.verificationStatus === 'approved'}
            >
              {approveRejectLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {studentDetail?.verificationStatus === 'approved' ? 'Approved' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Notes Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={(open) => {
        setIsRejectDialogOpen(open)
        if (!open) {
          setRejectionNotes("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Student KYC</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will help the student understand why their application was rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-notes">Rejection Reason (Optional but Recommended)</Label>
              <Textarea
                id="rejection-notes"
                placeholder="e.g., Student ID image is unclear or doesn't match the selfie..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {rejectionNotes.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectionNotes("")
              }}
              disabled={approveRejectLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={approveRejectLoading || !selectedStudentId}
            >
              {approveRejectLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expanded Image Dialog */}
      <Dialog open={!!expandedImage} onOpenChange={(open) => {
        if (!open) {
          setExpandedImage(null)
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] p-0">
          {expandedImage && (
            <div className="relative">
              <img
                src={expandedImage.url}
                alt={expandedImage.alt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg?height=600&width=800'
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setExpandedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Deactivation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={(open) => {
        setIsDeactivateDialogOpen(open)
        if (!open) {
          setStudentToDeactivate(null)
          setDeactivationReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Student Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {studentToDeactivate?.firstName} {studentToDeactivate?.lastName}?
              They will not be able to log in until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deactivation-reason">Reason for Deactivation</Label>
              <Textarea
                id="deactivation-reason"
                placeholder="e.g., Suspicious activity, Violation of terms..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {deactivationReason.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeactivateDialogOpen(false)
                setStudentToDeactivate(null)
                setDeactivationReason("")
              }}
              disabled={updateStatusLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeactivate}
              disabled={updateStatusLoading || !deactivationReason.trim()}
            >
              {updateStatusLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Confirm Deactivation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Student Deletion Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setStudentToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student Account</DialogTitle>
            <DialogDescription>
              This will permanently delete {studentToDelete?.firstName} {studentToDelete?.lastName} and all linked records.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteStudentLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteStudentLoading}>
              {deleteStudentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
