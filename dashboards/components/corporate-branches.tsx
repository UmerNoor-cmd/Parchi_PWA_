"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Store, MoreHorizontal, MapPin, Loader2, Edit, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AccountCreation } from "./account-creation"
import { getBranches, updateBranch, AdminBranch, UpdateBranchRequest } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CorporateBranches() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [branches, setBranches] = useState<AdminBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<AdminBranch | null>(null)
  const [editForm, setEditForm] = useState<UpdateBranchRequest>({
    branchName: "",
    address: "",
    city: "",
    contactPhone: "",
    latitude: undefined,
    longitude: undefined,
  })
  const [isSaving, setIsSaving] = useState(false)

  const merchantId = user?.merchant?.id
 

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Use getBranches which handles corporate filtering automatically on the backend
      const data = await getBranches()
      setBranches(data)
    } catch (err) {
      setError("Failed to fetch branches. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const openEditModal = (branch: AdminBranch) => {
    setEditingBranch(branch)
    setEditForm({
      branchName: branch.branch_name,
      address: branch.address,
      city: branch.city,
      contactPhone: branch.contact_phone,
      latitude: branch.latitude ?? undefined,
      longitude: branch.longitude ?? undefined,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingBranch) return
    try {
      setIsSaving(true)
      await updateBranch(editingBranch.id, editForm)
      toast({ title: "Success", description: "Branch updated successfully" })
      setIsEditOpen(false)
      fetchBranches()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update branch", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Branches</h2>
          <p className="text-muted-foreground">Manage your branch locations</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Branch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Directory</CardTitle>
          <CardDescription>
            A list of all your operating branches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center py-4">
            <Input
              placeholder="Search branches..."
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No branches found. Add your first branch!
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {branch.branch_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {branch.address}
                        </div>
                      </TableCell>
                      <TableCell>{branch.city}</TableCell>
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
                            <DropdownMenuItem>View Performance</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
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

      {/* Edit Branch Modal */}
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
                  onChange={(e) => setEditForm({...editForm, latitude: e.target.value ? parseFloat(e.target.value) : undefined})}
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
                  onChange={(e) => setEditForm({...editForm, longitude: e.target.value ? parseFloat(e.target.value) : undefined})}
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

      {/* Create Branch Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[98vw] max-w-none max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Register a new branch location for your business.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <AccountCreation 
              role="corporate" 
              corporateId={merchantId} 
              emailPrefix={user?.merchant?.email_prefix}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
