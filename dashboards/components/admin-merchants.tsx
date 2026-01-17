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
import { Plus, Building2, Store, MoreHorizontal, Search, Loader2, AlertCircle, RefreshCw, Edit, Upload, X, Image as ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMerchants } from "@/hooks/use-merchants"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateCorporateMerchant, toggleCorporateMerchant, CorporateMerchant, getBrands, setFeaturedBrands, Brand, FeaturedBrand } from "@/lib/api-client"
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
  const [isBannerUploading, setIsBannerUploading] = useState(false)

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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsBannerUploading(true)
    try {
      // Use a temporary name if business name is empty
      const businessName = editForm.businessName || "temp-upload"
      const url = await SupabaseStorageService.uploadCorporateBanner(file, businessName)

      setEditForm(prev => ({
        ...prev,
        bannerUrl: url
      }))
    } catch (error) {
      console.error("Error uploading banner:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload banner. Please try again.",
      })
    } finally {
      setIsBannerUploading(false)
    }
  }

  const handleRemoveBanner = () => {
    setEditForm(prev => ({ ...prev, bannerUrl: "" }))
  }

  const handleUpdate = async () => {
    if (!editingMerchant) return
    try {
      setIsSaving(true)
      setIsSaving(true)

      // Convert empty strings to null for optional fields
      const updateData = {
        ...editForm,
        businessRegistrationNumber: editForm.businessRegistrationNumber || null,
        logoPath: editForm.logoPath || null,
        category: editForm.category || null,
        bannerUrl: editForm.bannerUrl || null,
        termsAndConditions: editForm.termsAndConditions || null,
      }

      await updateCorporateMerchant(editingMerchant.id, updateData)
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

  // Featured Brands State
  const [isFeaturedBrandsOpen, setIsFeaturedBrandsOpen] = useState(false)
  const [allBrands, setAllBrands] = useState<Brand[]>([])
  const [featuredBrands, setFeaturedBrandsList] = useState<FeaturedBrand[]>([])
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)
  const [isSavingFeatured, setIsSavingFeatured] = useState(false)

  // Load brands when featured brands dialog opens
  useEffect(() => {
    if (isFeaturedBrandsOpen) {
      loadBrands()
    }
  }, [isFeaturedBrandsOpen])

  const loadBrands = async () => {
    setIsLoadingBrands(true)
    try {
      const brands = await getBrands()
      setAllBrands(brands)

      // Initialize featured brands from existing brands that have featured_order set
      const featured = brands
        .filter(b => b.featuredOrder !== null && b.featuredOrder !== undefined)
        .map(b => ({
          brandId: b.id,
          order: b.featuredOrder as number
        }))
        .sort((a, b) => a.order - b.order) // Sort by order

      setFeaturedBrandsList(featured)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands",
      })
      // Ensure featuredBrands is always an array even on error
      setFeaturedBrandsList([])
    } finally {
      setIsLoadingBrands(false)
    }
  }

  const handleAddFeaturedBrand = (brandId: string) => {
    if (featuredBrands.length >= 6) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: "You can only feature up to 6 brands",
      })
      return
    }

    if (featuredBrands.some(b => b.brandId === brandId)) {
      toast({
        variant: "destructive",
        title: "Already Added",
        description: "This brand is already in the featured list",
      })
      return
    }

    const newOrder = featuredBrands.length + 1
    setFeaturedBrandsList([...featuredBrands, { brandId, order: newOrder }])
  }

  const handleRemoveFeaturedBrand = (brandId: string) => {
    const updated = featuredBrands
      .filter(b => b.brandId !== brandId)
      .map((b, index) => ({ ...b, order: index + 1 })) // Reorder
    setFeaturedBrandsList(updated)
  }

  const handleReorderFeaturedBrand = (brandId: string, newOrder: number) => {
    if (newOrder < 1 || newOrder > 6) return

    const currentIndex = featuredBrands.findIndex(b => b.brandId === brandId)
    if (currentIndex === -1) return

    const updated = [...featuredBrands]
    const [moved] = updated.splice(currentIndex, 1)

    // Adjust other orders
    updated.forEach(b => {
      if (b.order >= newOrder && b.order < moved.order) {
        b.order += 1
      } else if (b.order <= newOrder && b.order > moved.order) {
        b.order -= 1
      }
    })

    moved.order = newOrder
    updated.push(moved)
    updated.sort((a, b) => a.order - b.order)

    setFeaturedBrandsList(updated)
  }

  const handleSaveFeaturedBrands = async () => {
    if (featuredBrands.length === 0) {
      toast({
        variant: "destructive",
        title: "No Brands Selected",
        description: "Please select at least one brand to feature",
      })
      return
    }

    setIsSavingFeatured(true)
    try {
      await setFeaturedBrands({ brands: featuredBrands })
      toast({
        title: "Success",
        description: "Featured brands updated successfully",
      })
      setIsFeaturedBrandsOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update featured brands",
      })
    } finally {
      setIsSavingFeatured(false)
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

      {/* Featured Brands Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Featured Brands</CardTitle>
              <CardDescription>
                Customize which 6 brands appear on top for students
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFeaturedBrandsOpen(true)}
              className="w-full md:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Manage Featured Brands
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              className="w-full md:w-auto"
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
              {/* Desktop Table View */}
              <div className="hidden md:block">
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y">
                {filteredMerchants.map((merchant) => (
                  <div key={merchant.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{merchant.businessName}</div>
                          <div className="text-xs text-muted-foreground">{merchant.category || 'N/A'}</div>
                        </div>
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
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={getStatusVariant(merchant.isActive)}>
                        {getStatusText(merchant.isActive)}
                      </Badge>
                      {merchant.businessRegistrationNumber && (
                        <span className="text-xs text-muted-foreground">Reg: {merchant.businessRegistrationNumber}</span>
                      )}
                    </div>

                    <div className="text-sm bg-muted/50 p-3 rounded-md space-y-1">
                      <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Contact Info</div>
                      <div className="truncate">{merchant.contactEmail}</div>
                      <div className="text-muted-foreground">{merchant.contactPhone}</div>
                    </div>
                  </div>
                ))}
              </div>
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
                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={editForm.businessRegistrationNumber}
                  onChange={(e) => setEditForm({ ...editForm, businessRegistrationNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
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

            <div className="space-y-2">
              <Label>Business Logo</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={isLogoUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={isLogoUploading}
                    className="gap-2"
                  >
                    {isLogoUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Select Logo Image
                      </>
                    )}
                  </Button>
                  {editForm.logoPath && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive/90"
                      onClick={handleRemoveLogo}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {editForm.logoPath && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-20 rounded border overflow-hidden bg-muted flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editForm.logoPath}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Logo URL (or enter manually)</Label>
                        <Input
                          value={editForm.logoPath}
                          onChange={(e) => setEditForm({ ...editForm, logoPath: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    id="banner-upload"
                    disabled={isBannerUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    disabled={isBannerUploading}
                    className="gap-2"
                  >
                    {isBannerUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        Select Banner Image
                      </>
                    )}
                  </Button>
                  {editForm.bannerUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive/90"
                      onClick={handleRemoveBanner}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {editForm.bannerUrl && (
                  <div className="space-y-2">
                    <div className="relative w-full h-40 rounded border overflow-hidden bg-muted">
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
                    <div>
                      <Label className="text-xs text-muted-foreground">Banner URL (or enter manually)</Label>
                      <Input
                        type="url"
                        value={editForm.bannerUrl}
                        onChange={(e) => setEditForm({ ...editForm, bannerUrl: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                        className="text-xs mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Terms and Conditions</Label>
              <Textarea
                value={editForm.termsAndConditions}
                onChange={(e) => setEditForm({ ...editForm, termsAndConditions: e.target.value })}
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

      {/* Featured Brands Dialog */}
      <Dialog open={isFeaturedBrandsOpen} onOpenChange={setIsFeaturedBrandsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Featured Brands</DialogTitle>
            <DialogDescription>
              Select up to 6 brands to feature on top. Drag to reorder.
            </DialogDescription>
          </DialogHeader>

          {isLoadingBrands ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading brands...</span>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {/* Featured Brands List */}
              <div className="space-y-2">
                <Label>Featured Brands (Top 6)</Label>
                <div className="border rounded-lg p-4 space-y-2 min-h-[200px]">
                  {!Array.isArray(featuredBrands) || featuredBrands.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No brands selected. Add brands from the list below.
                    </div>
                  ) : (
                    featuredBrands.map((featured) => {
                      const brand = allBrands.find(b => b.id === featured.brandId)
                      if (!brand) return null

                      return (
                        <div
                          key={featured.brandId}
                          className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {featured.order}
                            </div>
                            {brand.logoPath ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                <img
                                  src={brand.logoPath}
                                  alt={brand.businessName}
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {brand.businessName.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{brand.businessName}</div>
                              <div className="text-xs text-muted-foreground">
                                {brand.category || "General"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={featured.order.toString()}
                              onValueChange={(val) => handleReorderFeaturedBrand(featured.brandId, parseInt(val))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    Position {num}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive/90"
                              onClick={() => handleRemoveFeaturedBrand(featured.brandId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Available Brands List */}
              <div className="space-y-2">
                <Label>Available Brands</Label>
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {allBrands.filter(b => !featuredBrands.some(fb => fb.brandId === b.id)).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      All brands are featured or no brands available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {allBrands
                        .filter(b => !featuredBrands.some(fb => fb.brandId === b.id))
                        .map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {brand.logoPath ? (
                                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                                  <img
                                    src={brand.logoPath}
                                    alt={brand.businessName}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {brand.businessName.substring(0, 2).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{brand.businessName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {brand.category || "General"}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddFeaturedBrand(brand.id)}
                              disabled={featuredBrands.length >= 6}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeaturedBrandsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeaturedBrands} disabled={isSavingFeatured || featuredBrands.length === 0}>
              {isSavingFeatured && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Featured Brands
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
