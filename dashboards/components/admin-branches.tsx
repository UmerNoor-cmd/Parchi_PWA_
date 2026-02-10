"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Search, Building2, MoreHorizontal, Pencil, Store, AlertTriangle, Loader2, CheckCircle, XCircle, Edit, Key } from "lucide-react"
import { TestMerchantAlert } from "./test-merchant-alert"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getBranches, approveRejectBranch, updateBranch, adminResetPassword, AdminBranch } from "@/lib/api-client"

export function AdminBranches() {
  const [branches, setBranches] = useState<AdminBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<AdminBranch | null>(null)
  const [editForm, setEditForm] = useState({
    branchName: "",
    address: "",
    city: "",
    contactPhone: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Password Reset Modal State
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)
  const [resettingBranch, setResettingBranch] = useState<AdminBranch | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Reject Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [branchToReject, setBranchToReject] = useState<AdminBranch | null>(null)

  const fetchBranches = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      const data = await getBranches({ search })
      setBranches(data)
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    let mounted = true

    const loadBranches = async () => {
      if (mounted) {
        await fetchBranches(searchQuery)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadBranches()
    }, searchQuery ? 300 : 0)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [searchQuery, fetchBranches])

  const handleApprove = async (id: string) => {
    try {
      await approveRejectBranch(id, 'approved')
      toast({ title: "Success", description: "Branch approved successfully" })
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve branch", variant: "destructive" })
    }
  }

  const openRejectModal = (branch: AdminBranch) => {
    setBranchToReject(branch)
    setIsRejectOpen(true)
  }

  const confirmReject = async () => {
    if (!branchToReject) return
    try {
      setLoading(true) // Reuse main loading or add specific one
      await approveRejectBranch(branchToReject.id, 'rejected')
      toast({ title: "Success", description: "Branch rejected successfully" })
      setIsRejectOpen(false)
      fetchBranches() // This will also handle loading state
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject branch", variant: "destructive" })
      setLoading(false)
    }
  }

  const openEditModal = (branch: AdminBranch) => {
    setEditingBranch(branch)
    setEditForm({
      branchName: branch.branch_name,
      address: branch.address,
      city: branch.city,
      contactPhone: branch.contact_phone,
      latitude: branch.latitude,
      longitude: branch.longitude,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingBranch) return
    try {
      setIsSaving(true)
      // Convert null to undefined for API compatibility
      const updateData = {
        ...editForm,
        latitude: editForm.latitude ?? undefined,
        longitude: editForm.longitude ?? undefined,
      }
      await updateBranch(editingBranch.id, updateData)
      toast({ title: "Success", description: "Branch updated successfully" })
      setIsEditOpen(false)
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update branch", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const openPasswordResetModal = (branch: AdminBranch) => {
    setResettingBranch(branch)
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    })
    setIsPasswordResetOpen(true)
  }

  const handlePasswordReset = async () => {
    if (!resettingBranch) return

    // Validation
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters long", variant: "destructive" })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      return
    }

    try {
      setIsResettingPassword(true)
      await adminResetPassword(resettingBranch.user_id!, passwordForm.newPassword)
      toast({ title: "Success", description: "Password reset successfully" })
      setIsPasswordResetOpen(false)
      setPasswordForm({ newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Branches are already filtered server-side based on searchQuery
  const filteredBranches = branches

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Branch Management</h2>
        <p className="text-muted-foreground">Manage and approve merchant branches</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>View and manage all registered branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant Name</TableHead>
                    <TableHead>Branch Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredBranches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No branches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {branch.merchant?.business_name || 'N/A'}
                            <TestMerchantAlert merchantName={branch.merchant?.business_name} />
                          </div>
                        </TableCell>
                        <TableCell>{branch.branch_name}</TableCell>
                        <TableCell>{branch.city}</TableCell>
                        <TableCell>{branch.contact_phone}</TableCell>
                        <TableCell>
                          <Badge variant={branch.is_active ? "default" : "secondary"}>
                            {branch.is_active ? "Active" : "Pending"}
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
                              <DropdownMenuItem onClick={() => openEditModal(branch)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPasswordResetModal(branch)} disabled={!branch.user_id}>
                                <Key className="mr-2 h-4 w-4 text-blue-600" /> Reset Password
                              </DropdownMenuItem>
                              {!branch.is_active && (
                                <DropdownMenuItem onClick={() => handleApprove(branch.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => openRejectModal(branch)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> {branch.is_active ? "Delete" : "Reject"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No branches found
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <div key={branch.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-base flex items-center gap-2">
                          {branch.merchant?.business_name || 'N/A'}
                          <TestMerchantAlert merchantName={branch.merchant?.business_name} />
                        </div>
                        <div className="text-sm text-muted-foreground">{branch.branch_name}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditModal(branch)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPasswordResetModal(branch)} disabled={!branch.user_id}>
                            <Key className="mr-2 h-4 w-4 text-blue-600" /> Reset Password
                          </DropdownMenuItem>
                          {!branch.is_active && (
                            <DropdownMenuItem onClick={() => handleApprove(branch.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openRejectModal(branch)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> {branch.is_active ? "Delete" : "Reject"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={branch.is_active ? "default" : "secondary"}>
                        {branch.is_active ? "Active" : "Pending"}
                      </Badge>
                      <span className="text-muted-foreground">{branch.city}</span>
                    </div>

                    <div className="text-sm bg-muted/50 p-3 rounded-md">
                      <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact</div>
                      {branch.contact_phone}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch Details</DialogTitle>
            <DialogDescription>Update branch information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(editingBranch?.merchant?.business_name?.toLowerCase() === 'test merchant' || editingBranch?.merchant?.business_name?.toLowerCase() === 'tester merchant') && (
              <div className="flex items-center gap-4 rounded-md bg-destructive/10 p-4 border border-destructive/20 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div className="text-sm text-destructive font-medium">
                  This branch belongs to a Test Merchant. It is not visible to students.
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                value={editForm.branchName}
                onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 24.8607"
                  value={editForm.latitude ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Valid range: -90 to 90</p>
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 67.0011"
                  value={editForm.longitude ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                />
                <p className="text-xs text-muted-foreground">Valid range: -180 to 180</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordResetOpen} onOpenChange={setIsPasswordResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {resettingBranch?.branch_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Must contain at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordResetOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordReset} disabled={isResettingPassword}>
              {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject/Delete Confirmation Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject and delete this branch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 py-4 rounded-md bg-destructive/10 p-4 border border-destructive/20">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div className="text-sm text-destructive font-medium">
              Warning: This will permanently remove the branch "{branchToReject?.branch_name}" and strictly prohibit any access.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={loading} // Reuse loading state or add specific one if needed, mostly redundant since fetchBranches sets loading
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
