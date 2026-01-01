"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Plus, MoreHorizontal, Calendar, Loader2, Store, Pencil, Settings, Upload, ChevronDown, ChevronUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getOffers, createOffer, updateOffer, deleteOffer,
  Offer, CreateOfferRequest,
  getCorporateMerchants, CorporateMerchant,
  getBranches, AdminBranch,
  getBranchAssignments, assignBranchOffers,
  getBranchBonusSettings, updateBranchBonusSettings,
  BranchAssignment, BonusSettings
} from "@/lib/api-client"
import { SupabaseStorageService } from "@/lib/storage"
import { toast } from "sonner"

// Combined interface for branches with assignment data
interface BranchWithAssignment {
  id: string
  branchName: string
  standardOfferId: string | null
}

export function AdminOffers() {
  // Data State
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [expandedMerchants, setExpandedMerchants] = useState<string[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [branchAssignments, setBranchAssignments] = useState<{ [merchantId: string]: BranchWithAssignment[] }>({})
  const [loading, setLoading] = useState(true)


  // UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isImageUploading, setIsImageUploading] = useState(false)

  // Bonus Settings State
  const [isBonusSettingsOpen, setIsBonusSettingsOpen] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [selectedBranchName, setSelectedBranchName] = useState<string>("")
  const [bonusSettings, setBonusSettings] = useState<BonusSettings>({
    redemptionsRequired: 5,
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: null,
    additionalItem: null,
    validityDays: 30,
    isActive: true,
    imageUrl: null
  })
  const [isBonusLoading, setIsBonusLoading] = useState(false)
  const [isBonusSaving, setIsBonusSaving] = useState(false)

  // Global Bonus Settings State
  const [isGlobalBonusOpen, setIsGlobalBonusOpen] = useState(false)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null)
  const [globalBonusSettings, setGlobalBonusSettings] = useState<BonusSettings>({
    redemptionsRequired: 5,
    discountType: 'percentage',
    discountValue: 10,
    maxDiscountAmount: null,
    additionalItem: null,
    validityDays: 30,
    isActive: true,
    imageUrl: null
  })
  const [isGlobalBonusSaving, setIsGlobalBonusSaving] = useState(false)

  // Form State
  const [formData, setFormData] = useState<Partial<CreateOfferRequest>>({
    discountType: 'percentage',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  // Fetch Initial Data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch merchants
      const merchantsRes = await getCorporateMerchants()
      setMerchants(merchantsRes.data)

      // Fetch all offers
      const offersRes = await getOffers()
      setOffers(offersRes.data.items || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Merchant expansion
  const toggleMerchant = async (merchantId: string) => {
    const isExpanding = !expandedMerchants.includes(merchantId)

    if (isExpanding) {
      setExpandedMerchants(prev => [...prev, merchantId])
      // Fetch branches if not already loaded
      if (!branchAssignments[merchantId]) {
        await fetchMerchantBranches(merchantId)
      }
    } else {
      setExpandedMerchants(prev => prev.filter(id => id !== merchantId))
    }
  }

  const fetchMerchantBranches = async (merchantId: string) => {
    try {
      // Fetch branches for this specific merchant
      const branches = await getBranches({ corporateAccountId: merchantId })
      console.log(`Fetched ${branches.length} branches for merchant ${merchantId}`, branches)

      // Fetch all branch assignments to get offer mappings
      const assignments = await getBranchAssignments()

      // Create a map of branchId -> standardOfferId
      const assignmentMap = new Map<string, string | null>()
      assignments.forEach(assignment => {
        assignmentMap.set(assignment.id, assignment.standardOfferId)
      })

      // Combine branch data with assignment data
      const branchesWithAssignments: BranchWithAssignment[] = branches.map(branch => ({
        id: branch.id,
        branchName: branch.branch_name,
        standardOfferId: assignmentMap.get(branch.id) || null
      }))

      setBranchAssignments(prev => ({
        ...prev,
        [merchantId]: branchesWithAssignments
      }))
    } catch (error: any) {
      console.error("=== BRANCH FETCH ERROR ===")
      console.error("Raw error:", error)
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)
      console.error("Error keys:", Object.keys(error || {}))
      console.error("Stringified error:", JSON.stringify(error, null, 2))
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        status: error?.status || error?.response?.status,
        statusText: error?.statusText || error?.response?.statusText,
        merchantId
      })
      console.error("=== END ERROR ===")

      toast.error(`Failed to load branches: ${error?.message || 'Unknown error'}`)
      // Set empty array on error so we don't keep trying
      setBranchAssignments(prev => ({
        ...prev,
        [merchantId]: []
      }))
    }
  }

  // Helper functions
  const getOffersByMerchant = (merchantId: string) => {
    return offers.filter(o => o.merchantId === merchantId)
  }

  const getBranchesByMerchant = (merchantId: string) => {
    return branchAssignments[merchantId] || []
  }

  // Offer CRUD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const title = formData.title || "untitled-offer"
    setIsImageUploading(true)
    try {
      const url = await SupabaseStorageService.uploadOfferImage(file, title)
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleCreateOffer = async () => {
    if (!formData.merchantId) {
      toast.error("Please select a merchant")
      return
    }
    if (!formData.title || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateOfferRequest = {
        merchantId: formData.merchantId,
        title: formData.title,
        description: formData.description || "",
        discountType: formData.discountType === 'percentage' ? 'percentage' : 'fixed',
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        dailyLimit: Number(formData.dailyLimit) || undefined,
        totalLimit: Number(formData.totalLimit) || undefined,
        imageUrl: formData.imageUrl,
        branchIds: []
      }

      if (editingOffer) {
        await updateOffer(editingOffer.id, payload)
        toast.success("Offer updated successfully")
      } else {
        await createOffer(payload)
        toast.success("Offer created successfully")
      }

      setIsCreateOpen(false)
      setEditingOffer(null)
      setFormData({
        discountType: 'percentage',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      fetchData()
    } catch (error) {
      toast.error(editingOffer ? "Failed to update offer" : "Failed to create offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (offer: Offer) => {
    setEditingOffer(offer)
    setFormData({
      merchantId: offer.merchantId,
      title: offer.title,
      description: offer.description || undefined,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderValue: offer.minOrderValue || undefined,
      maxDiscountAmount: offer.maxDiscountAmount || undefined,
      validFrom: offer.validFrom.split('T')[0],
      validUntil: offer.validUntil.split('T')[0],
      dailyLimit: offer.dailyLimit || undefined,
      totalLimit: offer.totalLimit || undefined,
      imageUrl: offer.imageUrl || undefined
    })
    setIsCreateOpen(true)
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteOffer(offerId)
        toast.success("Offer deleted successfully")
        fetchData()
      } catch (error) {
        toast.error("Failed to delete offer")
      }
    }
  }

  // Branch Assignment
  const handleAssignmentChange = (merchantId: string, branchId: string, value: string) => {
    setBranchAssignments(prev => ({
      ...prev,
      [merchantId]: prev[merchantId]?.map(a =>
        a.id === branchId ? { ...a, standardOfferId: value === "none" ? null : value } : a
      ) || []
    }))
  }

  const handleSaveAssignment = async (merchantId: string, assignment: BranchWithAssignment) => {
    if (!assignment.standardOfferId) {
      toast.error("A standard offer is required")
      return
    }

    try {
      await assignBranchOffers(assignment.id, assignment.standardOfferId)
      toast.success(`Offer assigned to ${assignment.branchName}`)
    } catch (error) {
      toast.error("Failed to assign offer")
    }
  }

  // Bonus Settings
  const handleOpenBonusSettings = async (branchId: string, branchName: string) => {
    setSelectedBranchId(branchId)
    setSelectedBranchName(branchName)
    setIsBonusSettingsOpen(true)
    setIsBonusLoading(true)
    try {
      const settings = await getBranchBonusSettings(branchId)
      setBonusSettings({
        redemptionsRequired: settings.redemptionsRequired || 5,
        discountType: settings.discountType || 'percentage',
        discountValue: settings.discountValue || 0,
        maxDiscountAmount: settings.maxDiscountAmount,
        additionalItem: settings.additionalItem,
        validityDays: settings.validityDays || 30,
        isActive: settings.isActive ?? true,
        imageUrl: settings.imageUrl
      })
    } catch (error) {
      console.error("Failed to fetch bonus settings:", error)
      toast.error("Failed to load bonus settings")
      setBonusSettings({
        redemptionsRequired: 5,
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: null,
        additionalItem: null,
        validityDays: 30,
        isActive: true,
        imageUrl: null
      })
    } finally {
      setIsBonusLoading(false)
    }
  }

  const handleBonusImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImageUploading(true)
    try {
      const url = await SupabaseStorageService.uploadOfferImage(file, `bonus-${selectedBranchId}`)
      setBonusSettings(prev => ({ ...prev, imageUrl: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleSaveBonusSettings = async () => {
    if (!selectedBranchId) return
    setIsBonusSaving(true)
    try {
      await updateBranchBonusSettings(selectedBranchId, bonusSettings)
      toast.success("Bonus settings updated")
      setIsBonusSettingsOpen(false)
    } catch (error) {
      toast.error("Failed to update bonus settings")
    } finally {
      setIsBonusSaving(false)
    }
  }

  // Global Bonus Settings
  const handleOpenGlobalBonus = (merchantId: string) => {
    setSelectedMerchantId(merchantId)
    setIsGlobalBonusOpen(true)
  }

  const handleGlobalBonusImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImageUploading(true)
    try {
      const url = await SupabaseStorageService.uploadOfferImage(file, `global-bonus`)
      setGlobalBonusSettings(prev => ({ ...prev, imageUrl: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsImageUploading(false)
    }
  }

  const handleSaveGlobalBonusSettings = async () => {
    if (!selectedMerchantId) return
    const branches = branchAssignments[selectedMerchantId] || []
    if (branches.length === 0) {
      toast.error("No branches found to apply settings")
      return
    }

    setIsGlobalBonusSaving(true)
    let successCount = 0
    let failCount = 0

    try {
      const updatePromises = branches.map(async (assignment) => {
        try {
          await updateBranchBonusSettings(assignment.id, globalBonusSettings)
          successCount++
        } catch (error) {
          failCount++
          console.error(`Failed to update branch ${assignment.branchName}:`, error)
        }
      })

      await Promise.all(updatePromises)

      if (successCount > 0) {
        toast.success(`Bonus settings applied to ${successCount} branch${successCount > 1 ? 'es' : ''}`)
      }
      if (failCount > 0) {
        toast.error(`Failed to update ${failCount} branch${failCount > 1 ? 'es' : ''}`)
      }

      setIsGlobalBonusOpen(false)
    } catch (error) {
      toast.error("Failed to update bonus settings")
    } finally {
      setIsGlobalBonusSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offers Management</h2>
          <p className="text-muted-foreground">Manage offers across all merchants</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            setEditingOffer(null)
            setFormData({
              discountType: 'percentage',
              validFrom: new Date().toISOString().split('T')[0],
              validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
          }
        }}>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        </Dialog>
      </div>

      <Separator />

      {/* Merchant Sections */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Merchant Management</h2>
          <p className="text-muted-foreground mb-6">Manage branch assignments and bonus settings for each merchant</p>
        </div>

        {merchants.map((merchant) => (
          <Card key={merchant.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{merchant.businessName}</CardTitle>
                  <CardDescription>{merchant.category || 'Uncategorized'}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMerchant(merchant.id)}
                >
                  {expandedMerchants.includes(merchant.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {/* Collapsible content */}
            {expandedMerchants.includes(merchant.id) && (
              <CardContent>
                {/* Offers Pool */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Offers Pool</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getOffersByMerchant(merchant.id).map((offer) => (
                      <Card key={offer.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">{offer.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `Rs. ${offer.discountValue} OFF`}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(offer)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteOffer(offer.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-3 w-3" />
                              {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                                {offer.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {getOffersByMerchant(merchant.id).length === 0 && (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        No offers created for this merchant yet
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Branch Assignments */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Branch Assignments</h3>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenGlobalBonus(merchant.id)}
                      disabled={getBranchesByMerchant(merchant.id).length === 0}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Set Global Bonus
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Branch Name</TableHead>
                        <TableHead>Standard Offer (Required)</TableHead>
                        <TableHead>Bonus Settings</TableHead>
                        <TableHead className="w-[100px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getBranchesByMerchant(merchant.id).map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              {assignment.branchName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={assignment.standardOfferId || "none"}
                              onValueChange={(val) => handleAssignmentChange(merchant.id, assignment.id, val)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Standard Offer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" disabled>Select Standard Offer</SelectItem>
                                {getOffersByMerchant(merchant.id).filter(o => o.status === 'active').map(offer => (
                                  <SelectItem key={offer.id} value={offer.id}>
                                    {offer.title} ({offer.discountType === 'percentage' ? `${offer.discountValue}%` : `Rs. ${offer.discountValue}`})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenBonusSettings(assignment.id, assignment.branchName)}
                            >
                              <Settings className="mr-2 h-4 w-4" /> Configure Bonus
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSaveAssignment(merchant.id, assignment)}
                            >
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getBranchesByMerchant(merchant.id).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No branches found for this merchant
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {merchants.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No merchants found
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Offer Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
            <DialogDescription>
              Add details for the offer. You can assign this offer to branches later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Merchant Selection */}
            <div className="space-y-2">
              <Label>Merchant *</Label>
              <Select
                value={formData.merchantId}
                onValueChange={(val) => setFormData({ ...formData, merchantId: val })}
                disabled={!!editingOffer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offer Title *</Label>
                <Input
                  placeholder="e.g. Student Lunch Deal"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Discount Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 500"}
                  value={formData.discountValue || ''}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                />
              </div>
              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Max Discount Amount (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order Value (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Limit (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.dailyLimit || ''}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From *</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until *</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Offer Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                />
                {isImageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md mt-2" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bonus Settings Dialog - Same as Corporate */}
      <Dialog open={isBonusSettingsOpen} onOpenChange={setIsBonusSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bonus Settings - {selectedBranchName}</DialogTitle>
            <DialogDescription>
              Configure the bonus deal for this branch.
            </DialogDescription>
          </DialogHeader>

          {isBonusLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="bonus-active">Enable Bonus Deal</Label>
                <Switch
                  id="bonus-active"
                  checked={bonusSettings.isActive || false}
                  onCheckedChange={(checked) => setBonusSettings(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Redemptions Required</Label>
                <Input
                  type="number"
                  min={1}
                  value={bonusSettings.redemptionsRequired}
                  onChange={(e) => setBonusSettings(prev => ({ ...prev, redemptionsRequired: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Number of standard redemptions to unlock this bonus.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={bonusSettings.discountType}
                    onValueChange={(val: any) => setBonusSettings(prev => ({ ...prev, discountType: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={bonusSettings.discountValue}
                    onChange={(e) => setBonusSettings(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {bonusSettings.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label>Max Discount Amount (Optional)</Label>
                  <Input
                    type="number"
                    value={bonusSettings.maxDiscountAmount || ''}
                    onChange={(e) => setBonusSettings(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Validity (Days)</Label>
                <Input
                  type="number"
                  value={bonusSettings.validityDays || 30}
                  onChange={(e) => setBonusSettings(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">How long the bonus remains valid after unlocking.</p>
              </div>

              <div className="space-y-2">
                <Label>Bonus Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBonusImageUpload}
                    disabled={isImageUploading}
                  />
                  {isImageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {bonusSettings.imageUrl && (
                  <img src={bonusSettings.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md mt-2" />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBonusSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBonusSettings} disabled={isBonusSaving}>
              {isBonusSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Bonus Settings Dialog */}
      <Dialog open={isGlobalBonusOpen} onOpenChange={setIsGlobalBonusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Global Bonus Settings</DialogTitle>
            <DialogDescription>
              Configure bonus settings for ALL branches of this merchant at once. Individual branches can still be customized later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="global-bonus-active">Enable Bonus Deal</Label>
              <Switch
                id="global-bonus-active"
                checked={globalBonusSettings.isActive || false}
                onCheckedChange={(checked) => setGlobalBonusSettings(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Redemptions Required</Label>
              <Input
                type="number"
                min={1}
                value={globalBonusSettings.redemptionsRequired}
                onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, redemptionsRequired: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Number of standard redemptions to unlock this bonus.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={globalBonusSettings.discountType}
                  onValueChange={(val: any) => setGlobalBonusSettings(prev => ({ ...prev, discountType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={globalBonusSettings.discountValue}
                  onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                />
              </div>
            </div>

            {globalBonusSettings.discountType === 'percentage' && (
              <div className="space-y-2">
                <Label>Max Discount Amount (Optional)</Label>
                <Input
                  type="number"
                  value={globalBonusSettings.maxDiscountAmount || ''}
                  onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Validity (Days)</Label>
              <Input
                type="number"
                value={globalBonusSettings.validityDays || 30}
                onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, validityDays: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">How long the bonus remains valid after unlocking.</p>
            </div>

            <div className="space-y-2">
              <Label>Bonus Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleGlobalBonusImageUpload}
                  disabled={isImageUploading}
                />
                {isImageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {globalBonusSettings.imageUrl && (
                <img src={globalBonusSettings.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md mt-2" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGlobalBonusOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGlobalBonusSettings} disabled={isGlobalBonusSaving}>
              {isGlobalBonusSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply to All Branches
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
