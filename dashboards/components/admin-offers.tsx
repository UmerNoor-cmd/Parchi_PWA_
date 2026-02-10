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
import { Plus, MoreHorizontal, Calendar, Loader2, Store, Pencil, Settings, Upload, ChevronDown, ChevronUp, X, GripVertical, Check, ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getOffers, createOffer, updateOffer, deleteOffer,
  Offer, CreateOfferRequest,
  getCorporateMerchants, CorporateMerchant,
  getBranches, AdminBranch,
  getBranchAssignments, assignBranchOffers,
  getBranchBonusSettings, updateBranchBonusSettings,
  BranchAssignment, BonusSettings,
  getFeaturedOffers, setFeaturedOffers
} from "@/lib/api-client"
import { SupabaseStorageService } from "@/lib/storage"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


interface BranchWithAssignment {
  id: string
  branchName: string
  standardOfferId: string | null
  originalOfferId: string | null
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

export function AdminOffers() {
  // Data State
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [expandedMerchants, setExpandedMerchants] = useState<string[]>([])
  const [offers, setOffers] = useState<Record<string, Offer[]>>({})
  const [branchAssignments, setBranchAssignments] = useState<{ [merchantId: string]: BranchWithAssignment[] }>({})
  const [loadingMerchants, setLoadingMerchants] = useState<string[]>([])
  const [loading, setLoading] = useState(true)


  // UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [openMerchantSelect, setOpenMerchantSelect] = useState(false)
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

  // Featured Offers State
  const [isFeaturedOffersOpen, setIsFeaturedOffersOpen] = useState(false)
  const [featuredOffers, setFeaturedOffersList] = useState<{ offer: Offer; order: number }[]>([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false)
  const [isSavingFeatured, setIsSavingFeatured] = useState(false)
  const [draggedOfferId, setDraggedOfferId] = useState<string | null>(null)

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
      // Fetch merchants
      const merchantsRes = await getCorporateMerchants()
      setMerchants(merchantsRes.data)

      // Removed global offers fetch
      setOffers({})
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
        setLoadingMerchants(prev => [...prev, merchantId])
        try {
          await fetchMerchantBranches(merchantId)
        } finally {
          setLoadingMerchants(prev => prev.filter(id => id !== merchantId))
        }
      }

      // Fetch offers if not already loaded
      if (!offers[merchantId]) {
        try {
          const offersRes = await getOffers({ merchantId, limit: 100 })
          setOffers(prev => ({
            ...prev,
            [merchantId]: offersRes.data.items || []
          }))
        } catch (error) {
          console.error(`Failed to load offers for merchant ${merchantId}`, error)
          toast.error("Failed to load offers")
        }
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

      setBranchAssignments(prev => ({
        ...prev,
        [merchantId]: branches.map(branch => {
          const standardOfferId = assignmentMap.get(branch.id) || null
          return {
            id: branch.id,
            branchName: branch.branch_name,
            standardOfferId: standardOfferId,
            originalOfferId: standardOfferId
          }
        })
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
    return offers[merchantId] || []
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
    const isItemType = formData.discountType === 'item';
    const hasRequiredValue = isItemType ? !!formData.additionalItem : (formData.discountValue !== undefined && formData.discountValue !== null && formData.discountValue > 0);

    if (!formData.title || !hasRequiredValue || !formData.validFrom || !formData.validUntil) {
      toast.error(isItemType ? "Please fill in title and additional item" : "Please fill in all required fields")
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
        // Update payload - merchantId cannot be changed
        await updateOffer(editingOffer.id, payload)
        toast.success("Offer updated successfully")
      } else {
        // Create payload - includes merchantId
        payload.merchantId = formData.merchantId
        payload.branchIds = []
        await createOffer(payload as CreateOfferRequest)
        toast.success("Offer created successfully")
      }

      // Refresh specific merchant offers
      if (payload.merchantId) {
        const offersRes = await getOffers({ merchantId: payload.merchantId, limit: 100 })
        setOffers(prev => ({
          ...prev,
          [payload.merchantId]: offersRes.data.items || []
        }))
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
      // fetchData() // Don't reload everything
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

  const handleDeleteOffer = async (offerId: string) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteOffer(offerId)
        toast.success("Offer deleted successfully")

        // Find merchantId of deleted offer to refresh
        // Since we don't have the offer object here easily without searching all merchants, 
        // we can search our state
        let merchantId = "";
        for (const [mId, mOffers] of Object.entries(offers)) {
          if (mOffers.some(o => o.id === offerId)) {
            merchantId = mId;
            break;
          }
        }

        if (merchantId) {
          setOffers(prev => ({
            ...prev,
            [merchantId]: prev[merchantId].filter(o => o.id !== offerId)
          }))
        }
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

      // Sync originalOfferId with the new standardOfferId
      setBranchAssignments(prev => ({
        ...prev,
        [merchantId]: prev[merchantId]?.map(a =>
          a.id === assignment.id ? { ...a, originalOfferId: a.standardOfferId } : a
        ) || []
      }))
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

  // Featured Offers Logic
  useEffect(() => {
    if (isFeaturedOffersOpen) {
      loadFeaturedOffers()
    }
  }, [isFeaturedOffersOpen])

  const loadFeaturedOffers = async () => {
    setIsLoadingFeatured(true)
    try {
      // We already have all offers in 'offers' state, just filter active ones
      // But we need to know which ones are currently featured
      // The backend 'getFeaturedOffers' endpoint returns sorted featured offers
      const featuredRes = await getFeaturedOffers()



      // The API returns Offer[], but we need to map it to our internal structure
      const featured = featuredRes.data.map((o: Offer) => ({
        offer: o,
        order: o.featuredOrder || 999
      })).sort((a: any, b: any) => a.order - b.order)

      setFeaturedOffersList(featured)
    } catch (error) {
      toast.error("Failed to load featured offers")
      setFeaturedOffersList([])
    } finally {
      setIsLoadingFeatured(false)
    }
  }

  // Helper to get all loaded offers
  const getAllLoadedOffers = () => {
    return Object.values(offers).flat();
  }

  const handleAddFeaturedOffer = (offerId: string) => {
    if (featuredOffers.length >= 6) {
      toast.error("You can only feature up to 6 offers")
      return
    }

    if (featuredOffers.some(o => o.offer.id === offerId)) {
      toast.error("This offer is already featured")
      return
    }

    // Find the offer object from loaded offers
    const allOffers = getAllLoadedOffers()
    const offerToAdd = allOffers.find(o => o.id === offerId)

    if (!offerToAdd) {
      toast.error("Offer details not found")
      return
    }

    const newOrder = featuredOffers.length + 1
    // Store full offer object
    setFeaturedOffersList([...featuredOffers, { offer: offerToAdd, order: newOrder }])
  }

  const handleRemoveFeaturedOffer = (offerId: string) => {
    const updated = featuredOffers
      .filter(o => o.offer.id !== offerId)
      .map((o, index) => ({ ...o, order: index + 1 }))
    setFeaturedOffersList(updated)
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedOfferId(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedOfferId || draggedOfferId === targetId) return

    const currentIndex = featuredOffers.findIndex(o => o.offer.id === draggedOfferId)
    const targetIndex = featuredOffers.findIndex(o => o.offer.id === targetId)

    if (currentIndex === -1 || targetIndex === -1) return

    const updated = [...featuredOffers]
    const [moved] = updated.splice(currentIndex, 1)
    updated.splice(targetIndex, 0, moved)

    const reordered = updated.map((o, index) => ({
      ...o,
      order: index + 1
    }))

    setFeaturedOffersList(reordered)
    setDraggedOfferId(null)
  }

  const handleSaveFeaturedOffers = async () => {
    if (featuredOffers.length === 0) {
      toast.error("Please select at least one offer to feature")
      return
    }

    setIsSavingFeatured(true)
    try {
      // Map back to API expected format: { offerId, order }
      const payload = featuredOffers.map(f => ({
        offerId: f.offer.id,
        order: f.order
      }))

      await setFeaturedOffers(payload)
      toast.success("Featured offers updated successfully")
      setIsFeaturedOffersOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to update featured offers")
    } finally {
      setIsSavingFeatured(false)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        </Dialog>
      </div>

      <Separator />

      {/* Featured Offers Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Featured Offers</CardTitle>
              <CardDescription>
                Customize which 6 offers appear on top for students
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsFeaturedOffersOpen(true)}
              className="w-full md:w-auto"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Manage Featured Offers
            </Button>
          </div>
        </CardHeader>
      </Card>

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
                {loadingMerchants.includes(merchant.id) ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
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
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h3 className="text-lg font-semibold">Branch Assignments</h3>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenGlobalBonus(merchant.id)}
                          disabled={getBranchesByMerchant(merchant.id).length === 0}
                          className="w-full md:w-auto"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Set Global Bonus
                        </Button>
                      </div>

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
                                    disabled={assignment.standardOfferId === assignment.originalOfferId}
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

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-4">
                        {getBranchesByMerchant(merchant.id).map((assignment) => (
                          <div key={assignment.id} className="border rounded-md p-4 space-y-4">
                            <div className="flex items-center gap-2 font-medium">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              {assignment.branchName}
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Standard Offer</div>
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
                                onClick={() => handleSaveAssignment(merchant.id, assignment)}
                                disabled={assignment.standardOfferId === assignment.originalOfferId}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ))}
                        {getBranchesByMerchant(merchant.id).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No branches found for this merchant
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
              <Popover open={openMerchantSelect} onOpenChange={setOpenMerchantSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMerchantSelect}
                    className="w-full justify-between"
                    disabled={!!editingOffer}
                  >
                    {formData.merchantId
                      ? merchants.find((merchant) => merchant.id === formData.merchantId)?.businessName
                      : "Select merchant..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search merchant..." />
                    <CommandList>
                      <CommandEmpty>No merchant found.</CommandEmpty>
                      {/* Check if merchants array is empty handled by CommandEmpty, but also good to have a group */}
                      <CommandGroup heading="Merchants">
                        {merchants.map((merchant) => (
                          <CommandItem
                            key={merchant.id}
                            value={merchant.businessName}
                            onSelect={() => {
                              setFormData({ ...formData, merchantId: merchant.id })
                              setOpenMerchantSelect(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.merchantId === merchant.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {merchant.businessName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

      {/* Featured Offers Dialog */}
      <Dialog open={isFeaturedOffersOpen} onOpenChange={setIsFeaturedOffersOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Featured Offers</DialogTitle>
            <DialogDescription>
              Select up to 6 active offers to feature on top. Drag to reorder.
            </DialogDescription>
          </DialogHeader>

          {isLoadingFeatured ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading featured offers...</span>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {/* Featured Offers List */}
              <div className="space-y-2">
                <Label>Featured Offers (Top 6)</Label>
                <div className="border rounded-lg p-4 space-y-2 min-h-[200px]">
                  {featuredOffers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No offers selected. Add offers from the list below.
                    </div>
                  ) : (

                    featuredOffers.map((featured) => {
                      const offer = featured.offer;
                      // No need to find it, we have it in state

                      return (
                        <div
                          key={offer.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, offer.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, offer.id)}
                          className={`flex items-center justify-between p-3 border rounded-lg bg-muted/50 transition-colors ${draggedOfferId === offer.id ? "opacity-50 border-dashed border-primary" : ""
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                              {featured.order}
                            </div>
                            {offer.imageUrl ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                <img
                                  src={offer.imageUrl}
                                  alt={offer.title}
                                  className="object-cover h-full w-full"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                <Store className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{offer.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `Rs. ${offer.discountValue} OFF`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive/90"
                              onClick={() => handleRemoveFeaturedOffer(offer.id)}
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

              {/* Available Offers List */}
              <div className="space-y-2">
                <Label>Available Active Offers</Label>
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {getAllLoadedOffers()
                    .filter(o => o.status === 'active' && !featuredOffers.some(fo => fo.offer.id === o.id))
                    .length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No matching active offers available
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {getAllLoadedOffers()
                        .filter(o => o.status === 'active' && !featuredOffers.some(fo => fo.offer.id === o.id))
                        .map((offer) => (
                          <div
                            key={offer.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {offer.imageUrl ? (
                                <div className="relative h-10 w-10 overflow-hidden rounded-md">
                                  <img
                                    src={offer.imageUrl}
                                    alt={offer.title}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                  <Store className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{offer.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `Rs. ${offer.discountValue} OFF`}
                                  {' • '}{new Date(offer.validUntil).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAddFeaturedOffer(offer.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
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
            <Button variant="outline" onClick={() => setIsFeaturedOffersOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFeaturedOffers} disabled={isSavingFeatured}>
              {isSavingFeatured && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
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
                  onValueChange={(val: any) => setGlobalBonusSettings(prev => ({
                    ...prev,
                    discountType: val,
                    // Set discountValue to 0 when item type is selected
                    discountValue: val === 'item' ? 0 : prev.discountValue,
                    // Clear maxDiscountAmount when item type is selected
                    maxDiscountAmount: val === 'item' ? null : prev.maxDiscountAmount,
                  }))}
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
