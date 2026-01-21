"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { SupabaseStorageService } from "@/lib/storage"
import { sendBroadcastNotification, sendQueueItem, NotificationQueueItem } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useNotificationQueue, useNotificationHistory } from "@/hooks/use-notifications"
import { Loader2, Image as ImageIcon, X, Send, RefreshCw, Eye } from "lucide-react"

// Helper for relative time (e.g., "2 hours ago")
const timeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  return Math.floor(seconds) + " seconds ago"
}

// Format full date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

function NotificationCompose() {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    linkUrl: "",
    imageUrl: "",
  })
  
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const url = await SupabaseStorageService.uploadNotificationImage(file)
      setFormData(prev => ({ ...prev, imageUrl: url }))
      toast({
        title: "Image Uploaded",
        description: "Notification image uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and Content are required.",
      })
      return
    }

    setIsSending(true)
    try {
      await sendBroadcastNotification({
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
      })

      toast({
        title: "Notification Sent",
        description: "Broadcast notification sent successfully to all users.",
      })

      // Reset form
      setFormData({
        title: "",
        content: "",
        linkUrl: "",
        imageUrl: "",
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification. Please try again.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Broadcast</CardTitle>
        <CardDescription>
          Create and send a message to all registered users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input 
              id="title"
              placeholder="e.g. New Semester Offer!" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
            <Textarea 
              id="content"
              placeholder="e.g. Get 50% off at all coffee shops this week."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="resize-none"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL (Optional)</Label>
            <Input 
              id="linkUrl"
              type="url"
              placeholder="e.g. https://parchiapp.com/offers" 
              value={formData.linkUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Image (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="notification-image-upload"
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('notification-image-upload')?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Select Image
                    </>
                  )}
                </Button>
                {formData.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive/90"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {formData.imageUrl && (
                <div className="relative w-full h-48 rounded border overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSending || isUploading}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Broadcast...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function NotificationQueue() {
  const { queue, loading, error, refetch } = useNotificationQueue()
  const { toast } = useToast()
  const [sendingId, setSendingId] = useState<string | null>(null)

  const handlePush = async (item: NotificationQueueItem) => {
    if (sendingId) return

    setSendingId(item.id)
    try {
      await sendQueueItem(item.id)
      toast({
        title: "Notification Pushed",
        description: "Notification has been successfully broadcasted."
      })
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Push Failed",
        description: "Failed to push notification."
      })
    } finally {
      setSendingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'approved': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>
      case 'sent': return <Badge className="bg-blue-500 hover:bg-blue-600">Sent</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification Queue</CardTitle>
            <CardDescription>
              Manage pending and scheduled notifications.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : (queue?.length || 0) === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications in the queue.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Suggested By</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {item.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {item.target_topic}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.suggested_by || 'System'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.scheduled_for ? formatDate(item.scheduled_for) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      onClick={() => handlePush(item)} 
                      disabled={sendingId === item.id || item.status === 'sent'}
                    >
                      {sendingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Push
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function NotificationHistory() {
  const [page, setPage] = useState(1)
  const { history, meta, loading, error, refetch } = useNotificationHistory(page, 10)

  const totalPages = meta ? meta.last_page : 1

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  // Generate pagination items logic (simplified version of admin-kyc)
  const renderPaginationItems = () => {
    const items = []
    
    // Previous
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(page - 1)} 
          className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
        />
      </PaginationItem>
    )

    // Current page info (since we don't have full advanced pagination logic here yet)
    items.push(
      <PaginationItem key="current">
        <span className="px-4 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
      </PaginationItem>
    )

    // Next
    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(page + 1)} 
          className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        />
      </PaginationItem>
    )

    return items
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notification History</CardTitle>
            <CardDescription>
              View past broadcast notifications.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch(page)}>
             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : (history?.length || 0) === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No history found.
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div>{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {item.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col">
                        <span>{formatDate(item.created_at)}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.link_url ? (
                        <a 
                          href={item.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline text-sm"
                        >
                          Visit Link
                        </a>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  {renderPaginationItems()}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminNotifications() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications Control</h2>
          <p className="text-muted-foreground">Manage broadcast notifications and view history</p>
        </div>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="compose">
          <NotificationCompose />
        </TabsContent>
        <TabsContent value="queue">
          <NotificationQueue />
        </TabsContent>
        <TabsContent value="history">
          <NotificationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
