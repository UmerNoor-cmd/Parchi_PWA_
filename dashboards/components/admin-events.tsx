'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Plus, Edit2, Trash2, Upload, X, ExternalLink, MapPin, Calendar, ArrowUpDown, ImageIcon } from 'lucide-react'
import { useAdminEvents } from '@/hooks/use-events'
import {
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  type AdminEvent,
} from '@/lib/api-client'
import { SupabaseStorageService } from '@/lib/storage'

interface EventFormState {
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  eventDate: string // datetime-local value (local time)
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

/** ISO string -> value for <input type="datetime-local"> in local time */
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
  const { events, loading, error, refetch } = useAdminEvents()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminEvent | null>(null)
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        // Send null to clear optional fields the admin emptied.
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
      await refetch()
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
      await refetch()
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
      await refetch()
    } catch (err) {
      toast.error(extractError(err, 'Failed to delete event'))
    } finally {
      setBusyId(null)
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Error Loading Events</CardTitle>
          <CardDescription className="text-red-700">{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Banners shown in the student app&apos;s Events tab. Tapping one opens the ticket link
            (Inside Karachi) in an in-app browser.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Event
        </Button>
      </div>

      {events.length === 0 ? (
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
                placeholder="e.g. Coke Studio Live"
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
