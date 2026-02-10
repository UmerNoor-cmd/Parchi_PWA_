"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, MoreHorizontal, Calendar, Loader2, Store, Pencil, Save, Settings, Upload, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getMerchantOffers, createOffer, updateOffer, deleteMerchantOffer,
  Offer, CreateOfferRequest,
  getBranchAssignments, assignBranchOffers, getBranchBonusSettings, updateBranchBonusSettings,
  BranchAssignment, BonusSettings
} from "@/lib/api-client"
import { SupabaseStorageService } from "@/lib/storage"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface BranchAssignmentWithOriginal extends BranchAssignment {
  originalOfferId: string | null;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

export function CorporateOffers() {
  const { user } = useAuth()

  // Data State
  const [offers, setOffers] = useState<Offer[]>([])
  const [assignments, setAssignments] = useState<BranchAssignmentWithOriginal[]>([])
  const [loading, setLoading] = useState(true)
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null)

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

  const [formData, setFormData] = useState<Partial<CreateOfferRequest>>({
    discountType: 'percentage',
    scheduleType: 'always',
    allowedDays: [0, 1, 2, 3, 4, 5, 6],
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  // Fetch Initial Data
  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch offers
      try {
        const offersRes = await getMerchantOffers()
        setOffers(offersRes.data.items || [])
      } catch (error) {
        console.error("Failed to fetch offers:", error)
        toast.error("Failed to load offers")
      }

      // Fetch assignments
      try {
        const assignmentsRes = await getBranchAssignments()
        setAssignments(assignmentsRes.map(a => ({
          ...a,
          originalOfferId: a.standardOfferId
        })))
      } catch (error) {
        console.error("Failed to fetch assignments:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ------------------------------------------------------------------
  //  OFFER CRUD HANDLERS
  // ------------------------------------------------------------------

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
    const isItemType = formData.discountType === 'item';
    const hasRequiredValue = isItemType ? !!formData.additionalItem : (formData.discountValue !== undefined && formData.discountValue !== null && formData.discountValue > 0);

    if (!formData.title || !hasRequiredValue || !formData.validFrom || !formData.validUntil) {
      toast.error(isItemType ? "Please fill in title and additional item" : "Please fill in all required fields")
      return
    }

    if (!isItemType && formData.discountValue! < 0) {
      toast.error("Discount value cannot be negative")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || "",
        discountType: formData.discountType,
        discountValue: formData.discountType === 'item' ? 0 : Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        dailyLimit: Number(formData.dailyLimit) || undefined,
        totalLimit: Number(formData.totalLimit) || undefined,
        imageUrl: formData.imageUrl,
        scheduleType: formData.scheduleType,
        additionalItem: formData.additionalItem || null,
        notes: formData.notes || null,
        termsConditions: formData.termsConditions || null,
      }

      if (formData.scheduleType === 'custom') {
        payload.allowedDays = formData.allowedDays || []
        payload.startTime = formData.startTime || undefined
        payload.endTime = formData.endTime || undefined
      }

      if (editingOffer) {
        await updateOffer(editingOffer.id, payload)
        toast.success("Offer updated successfully")
      } else {
        payload.branchIds = []
        await createOffer(payload as CreateOfferRequest)
        toast.success("Offer created! It is now pending admin approval.")
      }

      setIsCreateOpen(false)
      setEditingOffer(null)
      setFormData({
        discountType: 'percentage',
        scheduleType: 'always',
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
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
      imageUrl: offer.imageUrl || undefined,
      scheduleType: offer.scheduleType || 'always',
      allowedDays: offer.allowedDays || [0, 1, 2, 3, 4, 5, 6],
      startTime: offer.startTime || undefined,
      endTime: offer.endTime || undefined,
      additionalItem: offer.additionalItem || undefined,
      notes: offer.notes || undefined,
      termsConditions: offer.termsConditions || undefined,
    })
    setIsCreateOpen(true)
  }

  const handleDeleteClick = (offerId: string) => {
    setOfferToDelete(offerId)
  }

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return
    try {
      await deleteMerchantOffer(offerToDelete)
      toast.success("Offer deleted successfully")
      setOfferToDelete(null)
      fetchData()
    } catch (error) {
      toast.error("Failed to delete offer")
    }
  }

  // ------------------------------------------------------------------
  //  BONUS SETTINGS HANDLERS
  // ------------------------------------------------------------------

  const handleOpenBonusSettings = async (branchId: string, branchName: string) => {
    setSelectedBranchId(branchId)
    setSelectedBranchName(branchName)
    setIsBonusSettingsOpen(true)
    setIsBonusLoading(true)
    try {
      const settings = await getBranchBonusSettings(branchId)
      // Ensure defaults if fields are missing
      setBonusSettings({
        redemptionsRequired: settings.redemptionsRequired || 5,
        discountType: settings.discountType || 'percentage',
        discountValue: settings.discountValue || 0,
        maxDiscountAmount: settings.maxDiscountAmount,
        additionalItem: settings.additionalItem || null,
        validityDays: settings.validityDays || 30,
        isActive: settings.isActive ?? true,
        imageUrl: settings.imageUrl
      })
    } catch (error) {
      console.error("Failed to fetch bonus settings:", error)
      toast.error("Failed to load bonus settings")
      // Reset to defaults
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

  // ------------------------------------------------------------------
  //  GLOBAL BONUS SETTINGS HANDLERS
  // ------------------------------------------------------------------

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
    if (assignments.length === 0) {
      toast.error("No branches found to apply settings")
      return
    }

    setIsGlobalBonusSaving(true)
    let successCount = 0
    let failCount = 0

    try {
      // Apply settings to all branches
      const updatePromises = assignments.map(async (assignment) => {
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

  // ------------------------------------------------------------------
  //  BRANCH ASSIGNMENT HANDLERS
  // ------------------------------------------------------------------

  const handleAssignmentChange = (branchId: string, value: string) => {
    setAssignments(prev => prev.map(a =>
      a.id === branchId ? { ...a, standardOfferId: value === "none" ? null : value } : a
    ))
  }

  const handleSaveAssignment = async (assignment: BranchAssignment) => {
    if (!assignment.standardOfferId) {
      toast.error("A standard offer is required")
      return
    }

    try {
      await assignBranchOffers(assignment.id, assignment.standardOfferId)
      toast.success(`Offer assigned to ${assignment.branchName}`)

      // Update originalOfferId after successful save
      setAssignments(prev => prev.map(a =>
        a.id === assignment.id ? { ...a, originalOfferId: a.standardOfferId } : a
      ))
    } catch (error) {
      toast.error("Failed to assign offer")
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

      {/* SECTION 1: OFFERS MANAGEMENT */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offers Management</h2>
          <p className="text-muted-foreground">Create and manage your pool of offers</p>
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
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
              <DialogDescription>
                Add details for the offer. You can assign this offer to branches later.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
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
                      <SelectItem value="item">Free Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conditional Fields for Item or Value */}
              <div className="grid grid-cols-2 gap-4">
                {formData.discountType === 'item' ? (
                  <div className="space-y-2 col-span-2">
                    <Label>Additional Item *</Label>
                    <Input
                      placeholder="e.g. Free Drink, Extra Topping"
                      value={formData.additionalItem || ''}
                      onChange={(e) => setFormData({ ...formData, additionalItem: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Description and Notes */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the offer..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Scheduling */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">Offer Availability & Schedule</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule Type</Label>
                    <Select
                      value={formData.scheduleType}
                      onValueChange={(val: any) => setFormData({ ...formData, scheduleType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always Available</SelectItem>
                        <SelectItem value="custom">Custom Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.scheduleType === 'custom' && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                      <Label>Allowed Days</Label>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 border rounded-md bg-muted/30">
                        {DAYS_OF_WEEK.map((day) => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day.value}`}
                              checked={formData.allowedDays?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const current = formData.allowedDays || []
                                const updated = checked
                                  ? [...current, day.value]
                                  : current.filter(d => d !== day.value)
                                setFormData({ ...formData, allowedDays: updated })
                              }}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={formData.startTime || ''}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={formData.endTime || ''}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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

              {/* Date Range */}
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

              {/* Notes and T&C */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Internal Notes (Optional)</Label>
                  <Textarea
                    placeholder="Internal only notes..."
                    className="h-20"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions (Optional)</Label>
                  <Textarea
                    placeholder="Special usage terms..."
                    className="h-20"
                    value={formData.termsConditions || ''}
                    onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 pt-4 border-t">
                <Label>Offer Image</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isImageUploading}
                    className="hidden"
                    id="offer-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('offer-image-upload')?.click()}
                    disabled={isImageUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImageUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  {isImageUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {formData.imageUrl && (
                  <div className="relative h-24 w-24 rounded-md overflow-hidden border mt-2">
                    <img src={formData.imageUrl} alt="Preview" className="object-cover h-full w-full" />
                  </div>
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
      </div>

      {/* Alert for Pending Process */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-start">
        <div className="mr-3 mt-0.5">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Admin Approval Required</h3>
          <div className="mt-1 text-sm text-yellow-700">
            <p>New offers are subject to admin approval before they become active. You can track their status below.</p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id}>
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
                    onClick={() => handleDeleteClick(offer.id)}
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
                  <Badge variant={offer.status === 'active' ? 'default' : offer.status === 'rejected' ? 'destructive' : 'secondary'} className={offer.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}>
                    {offer.status === 'pending_approval' ? 'Pending Approval' : offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t my-8" />

      {/* SECTION 2: BRANCH ASSIGNMENTS & BONUS SETTINGS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Branch Assignments</h2>
            <p className="text-muted-foreground">Assign Standard Offers and configure Bonus Settings for each branch</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsGlobalBonusOpen(true)}
            disabled={assignments.length === 0}
          >
            <Settings className="mr-2 h-4 w-4" />
            Set Global Bonus
          </Button>
        </div>

        <Card>
          {/* Desktop Table */}
          <div className="hidden md:block">
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
                {assignments.map((assignment) => (
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
                        onValueChange={(val) => handleAssignmentChange(assignment.id, val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Standard Offer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>Select Standard Offer</SelectItem>
                          {offers.filter(o => o.status === 'active').map(offer => (
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
                        onClick={() => handleSaveAssignment(assignment)}
                        disabled={assignment.standardOfferId === assignment.originalOfferId}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No branches found. Create branches first.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-md p-4 space-y-4">
                <div className="flex items-center gap-2 font-medium">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  {assignment.branchName}
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Standard Offer</div>
                  <Select
                    value={assignment.standardOfferId || "none"}
                    onValueChange={(val) => handleAssignmentChange(assignment.id, val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Standard Offer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Select Standard Offer</SelectItem>
                      {offers.filter(o => o.status === 'active').map(offer => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.title} ({offer.discountType === 'percentage' ? `${offer.discountValue}%` : `Rs. ${offer.discountValue}`})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenBonusSettings(assignment.id, assignment.branchName)}
                  >
                    <Settings className="mr-2 h-4 w-4" /> Bonus
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleSaveAssignment(assignment)}
                    disabled={assignment.standardOfferId === assignment.originalOfferId}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No branches found. Create branches first.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bonus Settings Dialog */}
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
                    onValueChange={(val: any) => {
                      setBonusSettings(prev => ({
                        ...prev,
                        discountType: val,
                        // Set discountValue to 0 when item type is selected
                        discountValue: val === 'item' ? 0 : prev.discountValue,
                        // Clear maxDiscountAmount when item type is selected
                        maxDiscountAmount: val === 'item' ? null : prev.maxDiscountAmount,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                      <SelectItem value="item">Additional Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {bonusSettings.discountType !== 'item' && (
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={bonusSettings.discountValue}
                      onChange={(e) => setBonusSettings(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              {bonusSettings.discountType === 'item' && (
                <div className="space-y-2">
                  <Label>Additional Item Name *</Label>
                  <Input
                    placeholder="e.g. Pepsi, Extra Fries"
                    value={bonusSettings.additionalItem || ''}
                    onChange={(e) => setBonusSettings(prev => ({ ...prev, additionalItem: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">The item to be given as bonus instead of discount.</p>
                </div>
              )}

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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBonusImageUpload}
                    disabled={isImageUploading}
                    className="hidden"
                    id="bonus-image-upload"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => document.getElementById('bonus-image-upload')?.click()}
                    disabled={isImageUploading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isImageUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
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

      <AlertDialog open={!!offerToDelete} onOpenChange={(open) => !open && setOfferToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the offer and remove it from all assigned branches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOffer} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Bonus Settings Dialog */}
      <Dialog open={isGlobalBonusOpen} onOpenChange={setIsGlobalBonusOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Global Bonus Settings</DialogTitle>
            <DialogDescription>
              Configure bonus settings for ALL branches at once. Individual branches can still be customized later.
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
                  onValueChange={(val: any) => {
                    setGlobalBonusSettings(prev => ({
                      ...prev,
                      discountType: val,
                      // Set discountValue to 0 when item type is selected
                      discountValue: val === 'item' ? 0 : prev.discountValue,
                      // Clear maxDiscountAmount when item type is selected
                      maxDiscountAmount: val === 'item' ? null : prev.maxDiscountAmount,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                    <SelectItem value="item">Additional Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {globalBonusSettings.discountType !== 'item' && (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={globalBonusSettings.discountValue}
                    onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  />
                </div>
              )}
            </div>

            {globalBonusSettings.discountType === 'item' && (
              <div className="space-y-2">
                <Label>Additional Item Name *</Label>
                <Input
                  placeholder="e.g. Pepsi, Extra Fries"
                  value={globalBonusSettings.additionalItem || ''}
                  onChange={(e) => setGlobalBonusSettings(prev => ({ ...prev, additionalItem: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">The item to be given as bonus instead of discount.</p>
              </div>
            )}

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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGlobalBonusImageUpload}
                  disabled={isImageUploading}
                  className="hidden"
                  id="global-bonus-image-upload"
                />
                <Button
                  type="button"
                  variant="default"
                  onClick={() => document.getElementById('global-bonus-image-upload')?.click()}
                  disabled={isImageUploading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isImageUploading ? 'Uploading...' : 'Choose File'}
                </Button>
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
