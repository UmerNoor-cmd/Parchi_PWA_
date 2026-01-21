
import { useState, useEffect, useCallback } from 'react'
import { 
  getNotificationQueue, 
  getNotificationHistory, 
  NotificationQueueItem, 
  NotificationHistoryItem,
  PaginationMeta
} from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

interface UseNotificationQueueResult {
  queue: NotificationQueueItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useNotificationQueue(status?: string): UseNotificationQueueResult {
  const [queue, setQueue] = useState<NotificationQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getNotificationQueue(status)
      setQueue(response.data || [])
    } catch (err: any) {
      console.error('Error fetching notification queue:', err)
      const errorMessage = err.message || 'Failed to fetch notification queue'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [status, toast])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { queue, loading, error, refetch: fetchQueue }
}

interface UseNotificationHistoryResult {
  history: NotificationHistoryItem[]
  meta: PaginationMeta | null
  loading: boolean
  error: string | null
  refetch: (page?: number, limit?: number) => Promise<void>
}

export function useNotificationHistory(initialPage = 1, initialLimit = 10): UseNotificationHistoryResult {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchHistory = useCallback(async (page = initialPage, limit = initialLimit) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getNotificationHistory(page, limit)
      setHistory(response.data?.data || [])
      setMeta(response.data?.meta || null)
    } catch (err: any) {
      console.error('Error fetching notification history:', err)
      const errorMessage = err.message || 'Failed to fetch notification history'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [initialPage, initialLimit, toast])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, meta, loading, error, refetch: fetchHistory }
}
