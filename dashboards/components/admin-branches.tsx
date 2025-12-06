"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, MoreHorizontal, Search, CheckCircle, XCircle, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getBranches, approveRejectBranch, updateBranch, AdminBranch } from "@/lib/api-client"

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

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getBranches()
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
  }, []) // Removed toast from dependencies

  useEffect(() => {
    let mounted = true
    
    const loadBranches = async () => {
      if (mounted) {
        await fetchBranches()
      }
    }
    
    loadBranches()
    
    return () => {
      mounted = false
    }
  }, [fetchBranches])

  const handleApprove = async (id: string) => {
    try {
      await approveRejectBranch(id, 'approved')
      toast({ title: "Success", description: "Branch approved successfully" })
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve branch", variant: "destructive" })
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this branch?")) return
    try {
      await approveRejectBranch(id, 'rejected')
      toast({ title: "Success", description: "Branch rejected successfully" })
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject branch", variant: "destructive" })
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

  const filteredBranches = branches.filter(branch => 
    branch?.branch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch?.merchant?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Corporate Merchant</TableHead>
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
                      <TableCell className="font-medium">{branch.branch_name}</TableCell>
                      <TableCell>{branch.merchant?.business_name || 'N/A'}</TableCell>
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
                            {!branch.is_active && (
                              <DropdownMenuItem onClick={() => handleApprove(branch.id)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleReject(branch.id)}
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
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input 
                value={editForm.branchName}
                onChange={(e) => setEditForm({...editForm, branchName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  value={editForm.city}
                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input 
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm({...editForm, contactPhone: e.target.value})}
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
                  onChange={(e) => setEditForm({...editForm, latitude: e.target.value ? parseFloat(e.target.value) : null})}
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
                  onChange={(e) => setEditForm({...editForm, longitude: e.target.value ? parseFloat(e.target.value) : null})}
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
    </div>
  )
}
