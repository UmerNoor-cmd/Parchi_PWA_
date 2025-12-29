"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, Store, MoreHorizontal, Search, Loader2, AlertCircle, RefreshCw, Edit, Upload, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMerchants } from "@/hooks/use-merchants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateCorporateMerchant, toggleCorporateMerchant, CorporateMerchant } from "@/lib/api-client"
import { SupabaseStorageService } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export function AdminMerchants() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [merchantType, setMerchantType] = useState<"corporate" | "branch">("corporate")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { merchants, loading, error, refetch } = useMerchants(debouncedSearch)
  const { toast } = useToast()

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<CorporateMerchant | null>(null)
  const [editForm, setEditForm] = useState({
    businessName: "",
    contactPhone: "",
    contactEmail: "",
    businessRegistrationNumber: "",
    logoPath: "",
    category: "",
    bannerUrl: "",
    termsAndConditions: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLogoUploading, setIsLogoUploading] = useState(false)

  // Merchants are already filtered server-side based on searchQuery
  const filteredMerchants = merchants

  // Get status badge variant based on isActive only
  const getStatusVariant = (isActive: boolean | null) => {
    return isActive ? "default" : "secondary"
  }

  // Get status display text based on isActive only
  const getStatusText = (isActive: boolean | null) => {
    return isActive ? "Active" : "Inactive"
  }

  const openEditModal = (merchant: CorporateMerchant) => {
    setEditingMerchant(merchant)
    setEditForm({
      businessName: merchant.businessName,
      contactPhone: merchant.contactPhone,
      contactEmail: merchant.contactEmail,
      businessRegistrationNumber: merchant.businessRegistrationNumber || "",
      logoPath: merchant.logoPath || "",
      category: merchant.category || "",
      bannerUrl: merchant.bannerUrl || "",
      termsAndConditions: merchant.termsAndConditions || "",
    })
    setIsEditOpen(true)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLogoUploading(true)
    try {
      // Use a temporary name if business name is empty
      const businessName = editForm.businessName || "temp-upload"
      const url = await SupabaseStorageService.uploadCorporateLogo(file, businessName)
      
      setEditForm(prev => ({ 
        ...prev, 
        logoPath: url 
      }))
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
      })
    } finally {
      setIsLogoUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setEditForm(prev => ({ ...prev, logoPath: "" }))
  }

  const handleUpdate = async () => {
    if (!editingMerchant) return
    try {
      setIsSaving(true)
      await updateCorporateMerchant(editingMerchant.id, editForm)
      toast({ title: "Success", description: "Merchant updated successfully" })
      setIsEditOpen(false)
      refetch()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update merchant", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (merchant: CorporateMerchant) => {
    try {
      await toggleCorporateMerchant(merchant.id)
      toast({ 
        title: "Success", 
        description: `Merchant ${merchant.isActive ? 'deactivated' : 'activated'} successfully` 
      })
      refetch()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update merchant status", 
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchant Management</h2>
          <p className="text-muted-foreground">Create and manage corporate and branch accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Corporate Merchants Directory</CardTitle>
              <CardDescription>
                A list of all registered corporate merchant accounts.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
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
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading merchants...</span>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No merchants found matching your search.' : 'No corporate merchants found.'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <div>
                            <div>{merchant.businessName}</div>
                            {merchant.businessRegistrationNumber && (
                              <div className="text-xs text-muted-foreground">
                                Reg: {merchant.businessRegistrationNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{merchant.contactEmail}</div>
                          <div className="text-muted-foreground">{merchant.contactPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {merchant.category || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(merchant.isActive)}>
                          {getStatusText(merchant.isActive)}
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
                            <DropdownMenuItem onClick={() => openEditModal(merchant)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Dashboard</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleToggleStatus(merchant)}
                            >
                              {merchant.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Merchant Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Merchant Details</DialogTitle>
            <DialogDescription>Update corporate merchant information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input 
                value={editForm.businessName}
                onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input 
                  value={editForm.businessRegistrationNumber}
                  onChange={(e) => setEditForm({...editForm, businessRegistrationNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input 
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  placeholder="e.g., Food & Beverage, Retail"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input 
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({...editForm, contactEmail: e.target.value})}
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

            <div className="space-y-2">
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                    disabled={isLogoUploading}
                  />
                  {isLogoUploading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
                {editForm.logoPath && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded border overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={editForm.logoPath} 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/90"
                      onClick={handleRemoveLogo}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              {editForm.logoPath && !editForm.logoPath.includes("file://") && (
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Logo URL</Label>
                  <Input 
                    value={editForm.logoPath}
                    onChange={(e) => setEditForm({...editForm, logoPath: e.target.value})}
                    placeholder="Or enter logo URL directly"
                    className="text-xs"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Banner URL</Label>
              <Input 
                type="url"
                value={editForm.bannerUrl}
                onChange={(e) => setEditForm({...editForm, bannerUrl: e.target.value})}
                placeholder="https://example.com/banner.jpg"
              />
              {editForm.bannerUrl && (
                <div className="mt-2">
                  <div className="relative w-full h-32 rounded border overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={editForm.bannerUrl} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Terms and Conditions</Label>
              <Textarea 
                value={editForm.termsAndConditions}
                onChange={(e) => setEditForm({...editForm, termsAndConditions: e.target.value})}
                placeholder="Enter terms and conditions text here..."
                rows={6}
                className="resize-none"
              />
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

      {/* Create Merchant Dialog (Kept for reference, but functionality might be moved to Account Creation tab) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Merchant</DialogTitle>
            <DialogDescription>
              Create a new corporate account or branch location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select 
                value={merchantType} 
                onValueChange={(val: "corporate" | "branch") => setMerchantType(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate Account</SelectItem>
                  <SelectItem value="branch">Branch Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {merchantType === "branch" && (
              <div className="space-y-2">
                <Label>Parent Corporation</Label>
                <Select disabled={loading || merchants.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading..." : merchants.length === 0 ? "No corporations available" : "Select corporation"} />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map(corp => (
                      <SelectItem key={corp.id} value={corp.id}>
                        {corp.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{merchantType === "corporate" ? "Business Name" : "Branch Name"}</Label>
              <Input placeholder={merchantType === "corporate" ? "e.g. Burger Hub" : "e.g. Downtown Branch"} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="contact@example.com" />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+92 300 1234567" />
            </div>

            {merchantType === "branch" && (
              <>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input placeholder="City" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordinates (Optional)</Label>
                    <Input placeholder="Lat, Long" />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsCreateOpen(false)}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
