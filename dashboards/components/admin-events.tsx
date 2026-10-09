'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  ExternalLink,
  MapPin,
  Calendar,
  ArrowUpDown,
  ImageIcon,
  Ticket,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  School,
  Tag,
  Clock,
  Filter,
} from 'lucide-react'
import { useAdminEvents } from '@/hooks/use-events'
import {
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminEventTicketSales,
  type AdminEvent,
  type AdminEventTicketSale,
} from '@/lib/api-client'
import { SupabaseStorageService } from '@/lib/storage'

interface EventFormState {
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  eventDate: string
  venue: string
  displayOrder: string
  isActive: boolean
}

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  imageUrl: '',
  externalUrl: '',
  eventDate: '',
  venue: '',
  displayOrder: '0',
  isActive: true,
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function extractError(err: any, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as any).message
    return Array.isArray(msg) ? msg.join(', ') : msg || fallback
  }
  return fallback
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AdminEvents() {
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useAdminEvents()

  // Ticket sales state
  const [ticketSales, setTicketSales] = useState<AdminEventTicketSale[]>([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventFilter, setSelectedEventFilter] = useState('all')
  const [selectedTierFilter, setSelectedTierFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Banner creation / edit dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSales = async () => {
    setSalesLoading(true)
    try {
      const data = await getAdminEventTicketSales()
      setTicketSales(data)
    } catch (err) {
      toast.error('Failed to load ticket sales')
    } finally {
      setSalesLoading(false)
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Reference code copied')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalTickets = ticketSales.length
    const totalSavings = ticketSales.reduce((sum, item) => sum + (Number(item.discountAmountPkr) || 0), 0)
    const totalRevenue = ticketSales.reduce((sum, item) => sum + (Number(item.orderTotalPkr) || 0), 0)
    const uniqueStudents = new Set(ticketSales.map((s) => s.studentId)).size

    return { totalTickets, totalSavings, totalRevenue, uniqueStudents }
  }, [ticketSales])

  // Unique filters lists
  const availableEventTitles = useMemo(() => {
    const titles = new Set<string>()
    ticketSales.forEach((s) => {
      if (s.eventTitle) titles.add(s.eventTitle)
    })
    return Array.from(titles)
  }, [ticketSales])

  const availableTiers = useMemo(() => {
    const tiers = new Set<string>()
    ticketSales.forEach((s) => {
      if (s.ticketTier) tiers.add(s.ticketTier)
    })
    return Array.from(tiers)
  }, [ticketSales])

  // Filtered sales list
  const filteredSales = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return ticketSales.filter((item) => {
      const matchSearch =
        !q ||
        item.studentName.toLowerCase().includes(q) ||
        (item.studentEmail && item.studentEmail.toLowerCase().includes(q)) ||
        (item.studentParchiId && item.studentParchiId.toLowerCase().includes(q)) ||
        (item.externalReference && item.externalReference.toLowerCase().includes(q)) ||
        (item.eventTitle && item.eventTitle.toLowerCase().includes(q)) ||
        (item.studentInstitute && item.studentInstitute.toLowerCase().includes(q))

      const matchEvent = selectedEventFilter === 'all' || item.eventTitle === selectedEventFilter
      const matchTier = selectedTierFilter === 'all' || item.ticketTier === selectedTierFilter

      return matchSearch && matchEvent && matchTier
    })
  }, [ticketSales, searchQuery, selectedEventFilter, selectedTierFilter])

  const exportToCSV = () => {
    if (filteredSales.length === 0) {
      toast.error('No ticket sales to export')
      return
    }

    const headers = [
      'Buyer Name',
      'Parchi ID',
      'Email',
      'Phone',
      'Institute',
      'Event Title',
      'Ticket Tier',
      'Purchase Date',
      'Discount Saved (PKR)',
      'Order Total (PKR)',
      'Booking Reference',
      'Partner',
    ]

    const rows = filteredSales.map((s) => [
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.studentParchiId || ''}"`,
      `"${s.studentEmail || ''}"`,
      `"${s.studentPhone || ''}"`,
      `"${(s.studentInstitute || '').replace(/"/g, '""')}"`,
      `"${(s.eventTitle || '').replace(/"/g, '""')}"`,
      `"${(s.ticketTier || '').replace(/"/g, '""')}"`,
      `"${s.paidAt ? new Date(s.paidAt).toLocaleString() : ''}"`,
      s.discountAmountPkr,
      s.orderTotalPkr ?? 0,
      `"${s.externalReference || ''}"`,
      `"${s.partnerName || 'Inside Karachi'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `parchi_event_tickets_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Ticket sales CSV exported successfully')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (event: AdminEvent) => {
    setEditing(event)
    setForm({
      title: event.title,
      description: event.description ?? '',
      imageUrl: event.imageUrl ?? '',
      externalUrl: event.externalUrl,
      eventDate: toLocalInput(event.eventDate),
      venue: event.venue ?? '',
      displayOrder: String(event.displayOrder),
      isActive: event.isActive,
    })
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    try {
      const url = await SupabaseStorageService.uploadEventImage(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
      toast.success('Banner uploaded')
    } catch (err) {
      toast.error(extractError(err, 'Failed to upload banner'))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const title = form.title.trim()
    const externalUrl = form.externalUrl.trim()
    const imageUrl = form.imageUrl.trim()

    if (!title) {
      toast.error('Title is required')
      return
    }
    if (!isValidHttpUrl(externalUrl)) {
      toast.error('Ticket link must be a full URL starting with https://')
      return
    }
    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      toast.error('Banner image URL must be a full URL starting with https://')
      return
    }

    const displayOrder = parseInt(form.displayOrder, 10)
    const eventDateIso = form.eventDate ? new Date(form.eventDate).toISOString() : undefined
    const description = form.description.trim()
    const venue = form.venue.trim()

    setSaving(true)
    try {
      if (editing) {
        await updateAdminEvent(editing.id, {
          title,
          externalUrl,
          isActive: form.isActive,
          displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
          description: (description || null) as any,
          imageUrl: (imageUrl || null) as any,
          venue: (venue || null) as any,
          eventDate: (eventDateIso ?? null) as any,
        })
        toast.success('Event updated')
      } else {
        await createAdminEvent({
          title,
          externalUrl,
          isActive: form.isActive,
          displayOrder: isNaN(displayOrder) ? 0 : displayOrder,
          ...(description && { description }),
          ...(imageUrl && { imageUrl }),
          ...(venue && { venue }),
          ...(eventDateIso && { eventDate: eventDateIso }),
        })
        toast.success('Event created')
      }
      setDialogOpen(false)
      await refetchEvents()
    } catch (err) {
      toast.error(extractError(err, 'Failed to save event'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (event: AdminEvent) => {
    setBusyId(event.id)
    try {
      await updateAdminEvent(event.id, { isActive: !event.isActive })
      toast.success(event.isActive ? 'Event hidden from students' : 'Event is now live')
      await refetchEvents()
    } catch (err) {
      toast.error(extractError(err, 'Failed to update event'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (event: AdminEvent) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    setBusyId(event.id)
    try {
      await deleteAdminEvent(event.id)
      toast.success('Event deleted')
      await refetchEvents()
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete event'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Events &amp; Tickets</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
              Inside Karachi Partner
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track student ticket purchases, savings, pass tiers, and manage active partner event banners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchSales(); refetchEvents(); }}>
            <RefreshCw className={`h-4 w-4 mr-2 ${salesLoading || eventsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openCreate} className="bg-primary text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Event Banner
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets Bought</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalTickets.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-blue-600" />
                Across all partner events
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Ticket className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Student Savings</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                Rs. {metrics.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Discounts unlocked
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Order Volume</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Rs. {metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Gross ticket sales
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Attendees</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.uniqueStudents.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-violet-600" />
                Verified student buyers
              </p>
            </div>
            <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ticket-sales" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="ticket-sales" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Ticket className="w-4 h-4 mr-2" />
            Ticket Purchases &amp; Attendees ({ticketSales.length})
          </TabsTrigger>
          <TabsTrigger value="events-banners" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            Event Banners &amp; Listings ({events.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TICKET PURCHASES */}
        <TabsContent value="ticket-sales" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Ticket Purchases</CardTitle>
                  <CardDescription>
                    All verified students who claimed tickets using their Parchi student ID.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredSales.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Export to CSV
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name, Parchi ID, email, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-50/50"
                  />
                </div>

                <Select value={selectedEventFilter} onValueChange={setSelectedEventFilter}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue placeholder="Filter by Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {availableEventTitles.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTierFilter} onValueChange={setSelectedTierFilter}>
                  <SelectTrigger className="bg-slate-50/50">
                    <SelectValue placeholder="Filter by Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {availableTiers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {salesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Loading ticket sales...</p>
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <h4 className="font-semibold text-slate-700">No ticket purchases found</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ticketSales.length === 0
                      ? 'When students redeem discounts on Inside Karachi, their tickets will appear here.'
                      : 'Try adjusting your search query or filters.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-6 py-3.5">Student / Buyer</th>
                        <th className="px-6 py-3.5">Event &amp; Tier</th>
                        <th className="px-6 py-3.5">Purchase Date</th>
                        <th className="px-6 py-3.5">Discount Saved</th>
                        <th className="px-6 py-3.5">Order Total</th>
                        <th className="px-6 py-3.5">Booking Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Student */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{sale.studentName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="font-mono text-[11px] px-1.5 py-0 bg-blue-50 text-blue-700 border border-blue-200">
                                {sale.studentParchiId || 'Parchi ID'}
                              </Badge>
                              {sale.studentInstitute && (
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={sale.studentInstitute}>
                                  • {sale.studentInstitute}
                                </span>
                              )}
                            </div>
                            {sale.studentEmail && (
                              <div className="text-xs text-muted-foreground mt-0.5">{sale.studentEmail}</div>
                            )}
                          </td>

                          {/* Event & Tier */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{sale.eventTitle}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                <Tag className="w-3 h-3 mr-1" />
                                {sale.ticketTier}
                              </Badge>
                              <span className="text-xs text-slate-400">via {sale.partnerName}</span>
                            </div>
                          </td>

                          {/* Purchase Date */}
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {sale.paidAt ? new Date(sale.paidAt).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }) : '—'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {sale.paidAt ? new Date(sale.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </td>

                          {/* Discount Saved */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Rs. {Number(sale.discountAmountPkr).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          {/* Order Total */}
                          <td className="px-6 py-4 text-slate-700 font-semibold">
                            {sale.orderTotalPkr != null
                              ? `Rs. ${Number(sale.orderTotalPkr).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                              : '—'}
                          </td>

                          {/* Booking Ref */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => copyToClipboard(sale.externalReference, sale.id)}
                              className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors group"
                              title="Click to copy booking reference"
                            >
                              <span>#{sale.externalReference}</span>
                              {copiedId === sale.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: EVENT BANNERS & LISTINGS */}
        <TabsContent value="events-banners" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Event Banners</h3>
              <p className="text-xs text-muted-foreground">
                Banners shown on the student app&apos;s Events tab. Tapping one opens the ticket link on Inside Karachi.
              </p>
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </div>

          {eventsLoading && events.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : eventsError ? (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle>Error Loading Events</CardTitle>
                <CardDescription className="text-red-700">{eventsError}</CardDescription>
              </CardHeader>
            </Card>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No events yet. Click &quot;Add Event&quot; to create the first one.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className={!event.isActive ? 'opacity-70 bg-secondary/20' : ''}>
                  <CardContent className="p-4 flex gap-4 items-start">
                    <div className="w-40 h-24 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {event.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        {!event.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            Hidden
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowUpDown className="h-3 w-3" /> {event.displayOrder}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {event.eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.eventDate).toLocaleString()}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.venue}
                          </span>
                        )}
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline truncate max-w-xs"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.externalUrl}</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={event.isActive}
                          disabled={busyId === event.id}
                          onCheckedChange={() => handleToggleActive(event)}
                        />
                        <Label className="text-xs text-muted-foreground">Live</Label>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={busyId === event.id}
                        onClick={() => openEdit(event)}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-destructive/10"
                        disabled={busyId === event.id}
                        onClick={() => handleDelete(event)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Banner Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle>
            <DialogDescription>
              Students see the banner, title, date and venue. The ticket link opens on Inside Karachi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={form.title}
                maxLength={255}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Prismfest'26"
              />
            </div>

            <div className="space-y-2">
              <Label>Banner image</Label>
              {form.imageUrl && (
                <div className="relative w-full h-40 rounded-md overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="or paste an image URL (https://...)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-url">Ticket link (Inside Karachi) *</Label>
              <Input
                id="event-url"
                value={form.externalUrl}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                placeholder="https://insidekarachi.com/events/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date &amp; time</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-venue">Venue</Label>
                <Input
                  id="event-venue"
                  value={form.venue}
                  maxLength={255}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="event-order">Display order</Label>
                <Input
                  id="event-order"
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="text-sm">Live in student app</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? 'Save changes' : 'Create event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
