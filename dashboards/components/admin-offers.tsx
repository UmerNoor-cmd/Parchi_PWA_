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
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MoreHorizontal, Calendar, Loader2, Store, Pencil, Settings, Upload, ChevronDown, ChevronUp, X, GripVertical, Check, ChevronsUpDown, Search, Filter, Eye, Trash2, Building2, CheckCircle, XCircle, AlertCircle, EyeOff, FileText } from "lucide-react"
import { TestMerchantAlert } from "./test-merchant-alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getOffers, createOffer, updateOffer, deleteAdminOffer,
  Offer, CreateOfferRequest,
  getCorporateMerchants, CorporateMerchant,
  getBranches, AdminBranch,
  getBranchAssignments, assignBranchOffers,
  getBranchBonusSettings, updateBranchBonusSettings,
  getMerchantLoyaltyProgram, updateMerchantLoyaltyProgram,
  BranchAssignment, BonusSettings, LoyaltyProgram,
  getFeaturedOffers, setFeaturedOffers,
  getAllAdminOffers, reviewAdminOffer
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

// --- Types ---

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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// --- Main Component ---

export function AdminOffers() {
  // Main Tab State
  const [activeTab, setActiveTab] = useState("oversight")

  // --- OVERSIGHT STATE ---
  const [oversightOffers, setOversightOffers] = useState<Offer[]>([])
  const [oversightLoading, setOversightLoading] = useState(false)
  const [oversightPagination, setOversightPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [selectedOfferForReview, setSelectedOfferForReview] = useState<Offer | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // --- CONFIGURATION / EXISTING STATE ---
  // Data State
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [expandedMerchants, setExpandedMerchants] = useState<string[]>([])
  const [offers, setOffers] = useState<Record<string, Offer[]>>({})
  const [branchAssignments, setBranchAssignments] = useState<{ [merchantId: string]: BranchWithAssignment[] }>({})
  const [loadingMerchants, setLoadingMerchants] = useState<string[]>([])
  const [loading, setLoading] = useState(true) // Initial loading for config tab

  // UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isImageUploading, setIsImageUploading] = useState(false)

  // New Loyalty Program State
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false)
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([])
  const [selectedMerchantForLoyalty, setSelectedMerchantForLoyalty] = useState<CorporateMerchant | null>(null)
  const [isLoyaltySaving, setIsLoyaltySaving] = useState(false)
  const [isLoyaltyLoading, setIsLoyaltyLoading] = useState(false)
  const [editingLoyalty, setEditingLoyalty] = useState<Partial<LoyaltyProgram> | null>(null)

  // Featured Offers State
  const [isFeaturedOffersOpen, setIsFeaturedOffersOpen] = useState(false)
  const [featuredOffers, setFeaturedOffersList] = useState<{ offer: Offer; order: number }[]>([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false)
  const [isSavingFeatured, setIsSavingFeatured] = useState(false)
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState("")
  const [featuredSearchResults, setFeaturedSearchResults] = useState<Offer[]>([])
  const [isFeaturedSearching, setIsFeaturedSearching] = useState(false)
  const [featuredSearchOpen, setFeaturedSearchOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<CreateOfferRequest>>({
    discountType: 'percentage',
    scheduleType: 'always',
    allowedDays: [0, 1, 2, 3, 4, 5, 6],
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discountValue: 0
  })

  // --- OVERSIGHT EFFECTS ---

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch oversight data
  useEffect(() => {
    if (activeTab === "oversight") {
      fetchOversightOffers(1)
    }
  }, [activeTab, statusFilter, debouncedSearch])

  const fetchOversightOffers = async (page: number) => {
    setOversightLoading(true)
    try {
      // API call
      // passing undefined for status if 'all' is selected
      const statusParam = statusFilter === "all" ? undefined : statusFilter
      const response = await getAllAdminOffers(statusParam, page, 10, debouncedSearch)

      if (response && response.data) {
        setOversightOffers(response.data.items || [])
        setOversightPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.pages,
          hasNextPage: response.data.pagination.hasNext,
          hasPreviousPage: response.data.pagination.hasPrev,
        })
      } else {
        setOversightOffers([])
      }
    } catch (error) {
      console.error("Failed to fetch oversight offers:", error)
      toast.error("Failed to load offers")
    } finally {
      setOversightLoading(false)
    }
  }

  const handleReviewOffer = async (id: string, action: 'active' | 'rejected', reason?: string) => {
    try {
      await reviewAdminOffer(id, action, reason)
      toast.success(`Offer ${action === 'active' ? 'accepted' : 'rejected'} successfully`)
      fetchOversightOffers(oversightPagination.page) // Refresh current page
      setIsReviewDialogOpen(false)
      setRejectionReason("")
      setSelectedOfferForReview(null)
    } catch (error) {
      toast.error("Failed to update offer status")
    }
  }

  const handleDeleteOffer = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this offer?");
    if (!confirmed) return;

    try {
      await deleteAdminOffer(id)
      toast.success("Offer deleted successfully")
      fetchOversightOffers(oversightPagination.page)
    } catch (error) {
      toast.error("Failed to delete offer")
    }
  }

  // --- CONFIGURATION EFFECTS ---

  // Fetch Initial Data for Configuration
  const fetchConfigData = async () => {
    setLoading(true)
    try {
      const merchantsRes = await getCorporateMerchants()
      setMerchants(merchantsRes.data)
      setOffers({})
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "management" && merchants.length === 0) {
      fetchConfigData()
    }
  }, [activeTab])

  // --- HELPER FUNCTIONS ---

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge className="bg-gray-400 hover:bg-gray-500 text-white">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // --- CONFIGURATION HANDLERS (Existing) ---

  const toggleMerchant = async (merchantId: string) => {
    const isExpanding = !expandedMerchants.includes(merchantId)

    if (isExpanding) {
      setExpandedMerchants(prev => [...prev, merchantId])

      if (!offers[merchantId]) {
        try {
          const offersRes = await getOffers({ merchantId, limit: 100 })
          setOffers(prev => ({
            ...prev,
            [merchantId]: offersRes.data.items || []
          }))
        } catch (error) {
          console.error(`Failed to load offers for merchant ${merchantId}`, error)
        }
      }
    } else {
      setExpandedMerchants(prev => prev.filter(id => id !== merchantId))
    }
  }

  const getOffersByMerchant = (merchantId: string) => offers[merchantId] || []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const title = formData.title || "untitled-offer"
    setIsImageUploading(true)
    console.log("Starting image upload...", { file: file.name, size: file.size, type: file.type })
    try {
      const url = await SupabaseStorageService.uploadOfferImage(file, title)
      console.log("Upload successful, URL:", url)
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload handler caught error:", error)
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack)
      }
      toast.error("Failed to upload image. Check console for details.")
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
        dailyLimit: (formData.dailyLimit !== undefined && formData.dailyLimit !== null && formData.dailyLimit !== '') ? Number(formData.dailyLimit) : undefined,
        totalLimit: (formData.totalLimit !== undefined && formData.totalLimit !== null && formData.totalLimit !== '') ? Number(formData.totalLimit) : undefined,
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
        payload.merchantId = formData.merchantId
        payload.branchIds = []
        await createOffer(payload as CreateOfferRequest)
        toast.success("Offer created successfully")
      }

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
    } catch (error) {
      toast.error(editingOffer ? "Failed to update offer" : "Failed to create offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- LOYALTY PROGRAM HANDLERS ---

  const handleOpenLoyalty = async (merchant: CorporateMerchant) => {
    setSelectedMerchantForLoyalty(merchant)
    setIsLoyaltyOpen(true)
    setIsLoyaltyLoading(true)
    try {
      const programs = await getMerchantLoyaltyProgram(merchant.id)
      setLoyaltyPrograms(programs)
    } catch (e) {
      toast.error("Failed to load loyalty settings")
    } finally {
      setIsLoyaltyLoading(false)
    }
  }

  const handleSaveLoyalty = async () => {
    if (!selectedMerchantForLoyalty || !editingLoyalty) return
    setIsLoyaltySaving(true)
    try {
      // Exclude id and merchantId as they are not allowed by the backend DTO
      const { id, merchantId, ...updateData } = editingLoyalty as any;
      await updateMerchantLoyaltyProgram(selectedMerchantForLoyalty.id, updateData)
      toast.success("Loyalty program saved successfully")
      const updated = await getMerchantLoyaltyProgram(selectedMerchantForLoyalty.id)
      setLoyaltyPrograms(updated)
      setEditingLoyalty(null)
    } catch (e) {
      toast.error("Failed to save loyalty program")
    } finally {
      setIsLoyaltySaving(false)
    }
  }

  // --- FEATURED OFFERS HANDLERS ---

  const handleOpenFeaturedOffers = async () => {
    setIsFeaturedOffersOpen(true)
    setIsLoadingFeatured(true)
    try {
      const response = await getFeaturedOffers()
      const items: Offer[] = response.data ?? []
      const sorted = [...items].sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
      setFeaturedOffersList(sorted.map((o, i) => ({ offer: o, order: i + 1 })))
    } catch (e) {
      toast.error("Failed to load featured offers")
    } finally {
      setIsLoadingFeatured(false)
    }
  }

  const handleFeaturedSearch = async (query: string) => {
    setFeaturedSearchQuery(query)
    if (!query.trim()) { setFeaturedSearchResults([]); return }
    setIsFeaturedSearching(true)
    try {
      const res = await getAllAdminOffers('active', 1, 20, query)
      setFeaturedSearchResults(res?.data?.items ?? [])
    } catch (e) {
      setFeaturedSearchResults([])
    } finally {
      setIsFeaturedSearching(false)
    }
  }

  const handleAddFeaturedOffer = (offer: Offer) => {
    if (featuredOffers.find(f => f.offer.id === offer.id)) {
      toast.error("Offer is already in the featured list")
      return
    }
    setFeaturedOffersList(prev => [...prev, { offer, order: prev.length + 1 }])
    setFeaturedSearchQuery("")
    setFeaturedSearchResults([])
    setFeaturedSearchOpen(false)
  }

  const handleRemoveFeaturedOffer = (offerId: string) => {
    setFeaturedOffersList(prev => {
      const updated = prev.filter(f => f.offer.id !== offerId)
      return updated.map((f, i) => ({ ...f, order: i + 1 }))
    })
  }

  const handleMoveFeaturedOffer = (offerId: string, direction: 'up' | 'down') => {
    setFeaturedOffersList(prev => {
      const idx = prev.findIndex(f => f.offer.id === offerId)
      if (idx === -1) return prev
      if (direction === 'up' && idx === 0) return prev
      if (direction === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next.map((f, i) => ({ ...f, order: i + 1 }))
    })
  }

  const handleSaveFeaturedOffers = async () => {
    setIsSavingFeatured(true)
    try {
      await setFeaturedOffers(featuredOffers.map(f => ({ offerId: f.offer.id, order: f.order })))
      toast.success("Featured offers saved successfully")
      setIsFeaturedOffersOpen(false)
    } catch (e) {
      toast.error("Failed to save featured offers")
    } finally {
      setIsSavingFeatured(false)
    }
  }

  // --- RENDER ---

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offers Management</h2>
          <p className="text-muted-foreground">Oversight and configuration for all platform offers</p>
        </div>
        {activeTab === 'management' && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Offer
          </Button>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "Edit Offer" : "Create New Offer"}</DialogTitle>
            <DialogDescription>
              {editingOffer ? "Modify existing offer details" : "Add a new offer to the platform. It will be Active immediately."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Merchant</Label>
                <Select value={formData.merchantId} onValueChange={(val) => setFormData(p => ({ ...p, merchantId: val }))} disabled={!!editingOffer}>
                  <SelectTrigger><SelectValue placeholder="Select Merchant" /></SelectTrigger>
                  <SelectContent>
                    {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.businessName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                  <Label>Offer Title *</Label>
                  <Input
                    placeholder="e.g. Student Lunch Deal"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(val: any) => setFormData(p => ({ ...p, discountType: val }))}
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

              <div className="grid grid-cols-2 gap-4 col-span-2">
                {formData.discountType === 'item' ? (
                  <div className="space-y-2 col-span-2">
                    <Label>Additional Item *</Label>
                    <Input
                      placeholder="e.g. Free Drink, Extra Topping"
                      value={formData.additionalItem || ''}
                      onChange={(e) => setFormData(p => ({ ...p, additionalItem: e.target.value }))}
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
                        onChange={(e) => setFormData(p => ({ ...p, discountValue: Number(e.target.value) }))}
                      />
                    </div>
                    {formData.discountType === 'percentage' && (
                      <div className="space-y-2">
                        <Label>Max Discount Amount (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 1000"
                          value={formData.maxDiscountAmount || ''}
                          onChange={(e) => setFormData(p => ({ ...p, maxDiscountAmount: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the offer..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4 pt-4 border-t col-span-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">Offer Availability & Schedule</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule Type</Label>
                    <Select
                      value={formData.scheduleType}
                      onValueChange={(val: any) => setFormData(p => ({ ...p, scheduleType: val }))}
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
                                setFormData(p => ({ ...p, allowedDays: updated }))
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
                          onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={formData.endTime || ''}
                          onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t col-span-2">
                <div className="space-y-2">
                  <Label>Min Order Value (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    value={formData.minOrderValue ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(p => ({ ...p, minOrderValue: val === '' ? undefined : Number(val) }))
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={formData.dailyLimit ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(p => ({ ...p, dailyLimit: val === '' ? undefined : Number(val) }))
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                  <Label>Valid From *</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(p => ({ ...p, validFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until *</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(p => ({ ...p, validUntil: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-2">
                  <Label>Internal Notes (Optional)</Label>
                  <Textarea
                    placeholder="Internal only notes..."
                    className="h-20"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms & Conditions (Optional)</Label>
                  <Textarea
                    placeholder="Special usage terms..."
                    className="h-20"
                    value={formData.termsConditions || ''}
                    onChange={(e) => setFormData(p => ({ ...p, termsConditions: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t col-span-2">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Offer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="oversight">Offers Oversight</TabsTrigger>
          <TabsTrigger value="management">Merchant Configuration</TabsTrigger>
        </TabsList>

        {/* --- OVERSIGHT TAB --- */}
        <TabsContent value="oversight" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-card p-4 rounded-lg border">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending_approval" className="text-yellow-600">Pending</TabsTrigger>
                <TabsTrigger value="active" className="text-green-600">Accepted</TabsTrigger>
                <TabsTrigger value="rejected" className="text-red-600">Rejected</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="expired" className="text-gray-500">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search offers..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer Details</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oversightLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : oversightOffers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No offers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    oversightOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="font-medium">{offer.title}</div>
                          {offer.description && <div className="text-xs text-muted-foreground truncate max-w-[200px]">{offer.description}</div>}
                        </TableCell>
                        <TableCell>
                          { /* @ts-ignore */}
                          {offer.merchant?.businessName || offer.merchant?.business_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `Rs. ${offer.discountValue}`}
                          {offer.discountType === 'item' && ` (${offer.additionalItem})`}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>From: {new Date(offer.validFrom).toLocaleDateString()}</div>
                            <div className={cn(new Date(offer.validUntil) < new Date() && "text-red-600 font-medium")}>
                              Until: {new Date(offer.validUntil).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(offer.status)}
                            { /* @ts-ignore */}
                            <TestMerchantAlert merchantName={offer.merchant?.businessName || offer.merchant?.business_name} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {offer.status === 'pending_approval' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700" onClick={() => handleReviewOffer(offer.id, 'active')}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => {
                                  setSelectedOfferForReview(offer)
                                  setIsReviewDialogOpen(true)
                                }}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
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
                                    dailyLimit: offer.dailyLimit ?? undefined,
                                    totalLimit: offer.totalLimit ?? undefined,
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
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                {offer.status !== 'rejected' && (
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedOfferForReview(offer)
                                    setIsReviewDialogOpen(true)
                                  }} className="text-red-600">
                                    <X className="mr-2 h-4 w-4" /> Reject
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteOffer(offer.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((oversightPagination.page - 1) * oversightPagination.limit) + 1} to {Math.min(oversightPagination.page * oversightPagination.limit, oversightPagination.total)} of {oversightPagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!oversightPagination.hasPreviousPage}
                onClick={() => fetchOversightOffers(oversightPagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!oversightPagination.hasNextPage}
                onClick={() => fetchOversightOffers(oversightPagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* --- CONFIGURATION TAB --- */}
        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Featured Offers</CardTitle>
                  <CardDescription>Manage top featured offers shown on the student app home screen</CardDescription>
                </div>
                <Button variant="outline" onClick={handleOpenFeaturedOffers}>
                  <Settings className="mr-2 h-4 w-4" /> Manage Featured
                </Button>
              </div>
            </CardHeader>
          </Card>

          {merchants.map((merchant) => (
            <Card key={merchant.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {merchant.businessName}
                      <TestMerchantAlert merchantName={merchant.businessName} />
                    </CardTitle>
                    <CardDescription>{merchant.category || 'Uncategorized'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenLoyalty(merchant)}>
                      <Settings className="h-4 w-4 mr-2" /> Loyalty Settings
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleMerchant(merchant.id)}>
                      {expandedMerchants.includes(merchant.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedMerchants.includes(merchant.id) && (
                <CardContent>
                  {loadingMerchants.includes(merchant.id) ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <div className="space-y-6">
                      {/* Merchant-wide Loyalty Summary */}
                      <div className="bg-muted/30 p-4 rounded-lg border border-primary/10">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" /> Loyalty Programs
                          </h3>
                          <Button variant="outline" size="sm" onClick={() => handleOpenLoyalty(merchant)}>
                            Manage Loyalty
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {loyaltyPrograms.filter(p => p.merchantId === merchant.id).length === 0 ? (
                            <p className="text-sm text-muted-foreground italic col-span-full">No loyalty programs active for this merchant.</p>
                          ) : (
                            loyaltyPrograms.filter(p => p.merchantId === merchant.id).map(program => (
                              <div key={program.id} className="bg-card p-3 rounded border shadow-sm flex flex-col gap-1">
                                <div className="flex justify-between items-start">
                                  <Badge variant="outline" className="capitalize">{program.scope}</Badge>
                                  <Badge variant={program.isActive ? "default" : "secondary"}>
                                    {program.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  {program.scope === 'merchant' ? 'Whole Merchant' : 
                                    offers[merchant.id]?.find(o => o.id === program.offerId)?.title || 'Offer Reward'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {program.redemptionsRequired} redemptions → {
                                    program.discountType === 'percentage' ? `${program.discountValue}% Off` :
                                    program.discountType === 'fixed' ? `Rs. ${program.discountValue} Off` :
                                    program.additionalItem || 'Free Item'
                                  }
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Merchant Offers Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Merchant Offers</h3>
                          <Button size="sm" onClick={() => { setFormData(p => ({ ...p, merchantId: merchant.id })); setIsCreateOpen(true); }}>
                            <Plus className="h-4 w-4 mr-1" /> New Offer
                          </Button>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Offer Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getOffersByMerchant(merchant.id).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                  No offers found for this merchant.
                                </TableCell>
                              </TableRow>
                            ) : (
                              getOffersByMerchant(merchant.id).map(offer => (
                                <TableRow key={offer.id}>
                                  <TableCell className="font-medium">{offer.title}</TableCell>
                                  <TableCell className="capitalize">{offer.discountType}</TableCell>
                                  <TableCell>
                                    {offer.discountType === 'percentage' ? `${offer.discountValue}%` : 
                                     offer.discountType === 'item' ? offer.additionalItem : `Rs. ${offer.discountValue}`}
                                  </TableCell>
                                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => { setEditingOffer(offer); setFormData({ ...offer }); setIsCreateOpen(true); }}>
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      {offer.status === 'pending_approval' && (
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedOfferForReview(offer); setIsReviewDialogOpen(true); }}>
                                          Review
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Offer</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this offer.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedOfferForReview && handleReviewOffer(selectedOfferForReview.id, 'rejected', rejectionReason)}>Reject Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Featured Offers Dialog */}
      <Dialog open={isFeaturedOffersOpen} onOpenChange={setIsFeaturedOffersOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Featured Offers</DialogTitle>
            <DialogDescription>
              Add and reorder offers shown in the featured section on the student app home screen.
            </DialogDescription>
          </DialogHeader>

          {isLoadingFeatured ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Search & Add */}
              <div className="space-y-2">
                <Label>Add an Offer</Label>
                <Popover open={featuredSearchOpen} onOpenChange={setFeaturedSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-muted-foreground">Search active offers to add...</span>
                      <Search className="h-4 w-4 ml-2 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[520px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search by offer title or merchant..."
                        value={featuredSearchQuery}
                        onValueChange={handleFeaturedSearch}
                      />
                      <CommandList>
                        {isFeaturedSearching && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        {!isFeaturedSearching && featuredSearchQuery && featuredSearchResults.length === 0 && (
                          <CommandEmpty>No active offers found.</CommandEmpty>
                        )}
                        {!isFeaturedSearching && featuredSearchResults.length > 0 && (
                          <CommandGroup heading="Active Offers">
                            {featuredSearchResults.map(offer => (
                              <CommandItem
                                key={offer.id}
                                value={offer.id}
                                onSelect={() => handleAddFeaturedOffer(offer)}
                                className="flex items-center gap-3 py-2"
                              >
                                {offer.imageUrl ? (
                                  <img src={offer.imageUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                                ) : (
                                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Store className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{offer.title}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {offer.merchant?.businessName} · {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : offer.discountType === 'item' ? offer.additionalItem : `Rs. ${offer.discountValue} off`}
                                  </div>
                                </div>
                                {featuredOffers.find(f => f.offer.id === offer.id) && (
                                  <Badge variant="secondary" className="text-xs shrink-0">Added</Badge>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Current Featured List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Featured Offers ({featuredOffers.length})</Label>
                  {featuredOffers.length > 0 && (
                    <span className="text-xs text-muted-foreground">Use arrows to reorder</span>
                  )}
                </div>

                {featuredOffers.length === 0 ? (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
                    No featured offers yet. Search above to add offers.
                  </div>
                ) : (
                  <div className="border rounded-lg divide-y overflow-hidden">
                    {featuredOffers.map((item, idx) => (
                      <div key={item.offer.id} className="flex items-center gap-3 p-3 bg-card hover:bg-muted/30 transition-colors">
                        {/* Order badge */}
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {item.order}
                        </div>

                        {/* Image */}
                        {item.offer.imageUrl ? (
                          <img src={item.offer.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Store className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.offer.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.offer.merchant?.businessName} · {item.offer.discountType === 'percentage' ? `${item.offer.discountValue}% off` : item.offer.discountType === 'item' ? item.offer.additionalItem : `Rs. ${item.offer.discountValue} off`}
                          </div>
                        </div>

                        {/* Reorder controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={idx === 0}
                            onClick={() => handleMoveFeaturedOffer(item.offer.id, 'up')}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            disabled={idx === featuredOffers.length - 1}
                            onClick={() => handleMoveFeaturedOffer(item.offer.id, 'down')}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveFeaturedOffer(item.offer.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeaturedOffersOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFeaturedOffers} disabled={isSavingFeatured || isLoadingFeatured}>
              {isSavingFeatured ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Featured Offers"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Merchant Loyalty Settings Dialog */}
      <Dialog open={isLoyaltyOpen} onOpenChange={setIsLoyaltyOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loyalty Settings - {selectedMerchantForLoyalty?.businessName}</DialogTitle>
            <DialogDescription>
              Configure loyalty bonuses for this merchant. Bonuses can be merchant-wide or per-offer.
            </DialogDescription>
          </DialogHeader>

          {isLoyaltyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scope</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Req. Redemptions</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loyaltyPrograms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No loyalty programs configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      loyaltyPrograms.map(program => (
                        <TableRow key={program.id}>
                          <TableCell className="capitalize">{program.scope}</TableCell>
                          <TableCell>
                            {program.scope === 'merchant' ? 'Whole Merchant' : 
                              offers[selectedMerchantForLoyalty?.id || '']?.find(o => o.id === program.offerId)?.title || 'Selected Offer'}
                          </TableCell>
                          <TableCell>{program.redemptionsRequired}</TableCell>
                          <TableCell>
                            {program.discountType === 'percentage' ? `${program.discountValue}% Off` :
                             program.discountType === 'fixed' ? `Rs. ${program.discountValue} Off` :
                             program.additionalItem || 'Free Item'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={program.isActive ? "default" : "secondary"}>
                              {program.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setEditingLoyalty(program)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {!editingLoyalty && (
                <Button onClick={() => setEditingLoyalty({ 
                  scope: 'merchant', 
                  redemptionsRequired: 5, 
                  discountType: 'percentage', 
                  discountValue: 10,
                  isActive: true 
                })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Loyalty Program
                </Button>
              )}

              {editingLoyalty && (
                <Card className="border-primary/50">
                  <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold">
                      {editingLoyalty.id ? "Edit Program" : "New Loyalty Program"}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingLoyalty(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scope</Label>
                        <Select 
                          value={editingLoyalty.scope} 
                          onValueChange={(val: any) => setEditingLoyalty(p => ({ ...p, scope: val, offerId: val === 'merchant' ? null : p?.offerId }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="merchant">Merchant-wide</SelectItem>
                            <SelectItem value="offer">Per-Offer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {editingLoyalty.scope === 'offer' && (
                        <div className="space-y-2">
                          <Label>Select Offer</Label>
                          <Select 
                            value={editingLoyalty.offerId || ""} 
                            onValueChange={(val) => setEditingLoyalty(p => ({ ...p, offerId: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pick an offer" />
                            </SelectTrigger>
                            <SelectContent>
                              {offers[selectedMerchantForLoyalty?.id || '']?.map(o => (
                                <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Redemptions Required</Label>
                        <Input 
                          type="number" 
                          value={editingLoyalty.redemptionsRequired} 
                          onChange={(e) => setEditingLoyalty(p => ({ ...p, redemptionsRequired: Number(e.target.value) }))} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <Select 
                          value={editingLoyalty.discountType} 
                          onValueChange={(val: any) => setEditingLoyalty(p => ({ ...p, discountType: val }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Flat Amount (PKR)</SelectItem>
                            <SelectItem value="item">Free Item</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {editingLoyalty.discountType === 'item' ? (
                        <div className="space-y-2 col-span-2">
                          <Label>Additional Item</Label>
                          <Input 
                            placeholder="e.g. Free Dessert"
                            value={editingLoyalty.additionalItem || ""} 
                            onChange={(e) => setEditingLoyalty(p => ({ ...p, additionalItem: e.target.value }))} 
                          />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input 
                              type="number" 
                              value={editingLoyalty.discountValue} 
                              onChange={(e) => setEditingLoyalty(p => ({ ...p, discountValue: Number(e.target.value) }))} 
                            />
                          </div>
                          {editingLoyalty.discountType === 'percentage' && (
                            <div className="space-y-2">
                              <Label>Max Discount (Optional)</Label>
                              <Input 
                                type="number" 
                                value={editingLoyalty.maxDiscountAmount || ""} 
                                onChange={(e) => setEditingLoyalty(p => ({ ...p, maxDiscountAmount: Number(e.target.value) || null }))} 
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex items-center gap-2 col-span-2">
                        <Switch 
                          checked={editingLoyalty.isActive} 
                          onCheckedChange={(val) => setEditingLoyalty(p => ({ ...p, isActive: val }))} 
                        />
                        <Label>Active</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingLoyalty(null)}>Cancel</Button>
                      <Button size="sm" onClick={handleSaveLoyalty} disabled={isLoyaltySaving}>
                        {isLoyaltySaving ? "Saving..." : "Save Program"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoyaltyOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
