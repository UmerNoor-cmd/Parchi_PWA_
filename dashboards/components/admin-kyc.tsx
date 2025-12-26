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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, X, Search, Eye, MoreHorizontal, Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { usePendingStudents, useAllStudents, useStudentDetail, useApproveRejectStudent } from "@/hooks/use-kyc"
import type { Student } from "@/lib/api-client"

export function AdminKYC() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState("")
  const [expandedImage, setExpandedImage] = useState<{ url: string; alt: string } | null>(null)
  const [pendingPage, setPendingPage] = useState(1)
  const [allPage, setAllPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'expired' | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { toast } = useToast()

  const { students: pendingStudents, loading: pendingLoading, error: pendingError, pagination: pendingPagination, refetch: refetchPending } = usePendingStudents(pendingPage, 10)
  
  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setAllPage(1)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, debouncedSearch])
  
  // Memoize filters object to prevent unnecessary re-renders
  const allStudentsFilters = useMemo(() => ({
    status: statusFilter,
    page: allPage,
    limit: 10,
    search: debouncedSearch.trim() || undefined
  }), [statusFilter, allPage, debouncedSearch])
  
  const { students: allStudents, loading: allLoading, error: allError, pagination: allPagination, refetch: refetchAll } = useAllStudents(allStudentsFilters)
  const { student: studentDetail, loading: detailLoading, error: detailError, refetch: refetchDetail } = useStudentDetail(selectedStudentId)
  const { approveReject, loading: approveRejectLoading, error: approveRejectError } = useApproveRejectStudent()

  // Reset page when status filter changes
  useEffect(() => {
    setAllPage(1)
  }, [statusFilter])

  const handleReview = (studentId: string) => {
    setSelectedStudentId(studentId)
    setIsReviewOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedStudentId) return

    const result = await approveReject(selectedStudentId, { action: 'approve' })
    if (result) {
      toast({
        title: "Success",
        description: "Student approved successfully",
      })
      setIsReviewOpen(false)
      setSelectedStudentId(null)
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
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student KYC</h2>
          <p className="text-muted-foreground">Manage student verifications and records</p>
        </div>
      </div>

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
                        {student.firstName} {student.lastName}
                      </CardTitle>
                      <Badge variant="outline">Pending</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{student.university}</div>
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
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(undefined)}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'approved' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('approved')}
                  >
                    Approved
                  </Button>
                  <Button
                    variant={statusFilter === 'rejected' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('rejected')}
                  >
                    Rejected
                  </Button>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>University</TableHead>
                          <TableHead>Parchi ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
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
                              <Badge variant={getStatusVariant(student.verificationStatus)}>
                                {getStatusText(student.verificationStatus)}
                              </Badge>
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
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {allPagination && allPagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {allPagination.page} of {allPagination.pages} ({allPagination.total} total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAllPage(p => Math.max(1, p - 1))
                          }}
                          disabled={!allPagination.hasPrev || allLoading}
                        >
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAllPage(p => Math.min(allPagination.pages, p + 1))
                          }}
                          disabled={!allPagination.hasNext || allLoading}
                        >
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Application</DialogTitle>
            <DialogDescription>
              {studentDetail ? `Verify the student ID and selfie match for ${studentDetail.firstName} ${studentDetail.lastName}.` : 'Loading student details...'}
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
          ) : studentDetail && studentDetail.kyc ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label>Student ID Card (Front)</Label>
                <div 
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => setExpandedImage({ 
                    url: studentDetail.kyc.studentIdCardFrontPath, 
                    alt: "Student ID Front" 
                  })}
                >
                  <img 
                    src={studentDetail.kyc.studentIdCardFrontPath} 
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
                    url: studentDetail.kyc.studentIdCardBackPath, 
                    alt: "Student ID Back" 
                  })}
                >
                  <img 
                    src={studentDetail.kyc.studentIdCardBackPath} 
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
                <Label>Selfie</Label>
                <div 
                  className="border rounded-lg p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                  onClick={() => setExpandedImage({ 
                    url: studentDetail.kyc.selfieImagePath, 
                    alt: "Selfie" 
                  })}
                >
                  <img 
                    src={studentDetail.kyc.selfieImagePath} 
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

              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{studentDetail.firstName} {studentDetail.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">University</Label>
                  <p className="font-medium">{studentDetail.university}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Parchi ID</Label>
                  <p className="font-medium">{studentDetail.parchiId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{studentDetail.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{studentDetail.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted At</Label>
                  <p className="font-medium">
                    {studentDetail.kyc.submittedAt 
                      ? new Date(studentDetail.kyc.submittedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                {studentDetail.graduationYear && (
                  <div>
                    <Label className="text-muted-foreground">Graduation Year</Label>
                    <p className="font-medium">{studentDetail.graduationYear}</p>
                  </div>
                )}
                {studentDetail.kyc.isAnnualRenewal && (
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium">Annual Renewal</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No KYC data available for this student.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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
              disabled={approveRejectLoading || !studentDetail}
            >
              {approveRejectLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve
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
    </div>
  )
}
