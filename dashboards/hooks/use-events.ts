'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAdminEvents, type AdminEvent, type ApiError } from '@/lib/api-client'

interface UseAdminEventsResult {
  events: AdminEvent[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAdminEvents(): UseAdminEventsResult {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminEvents()
      setEvents(data || [])
    } catch (err: any) {
      console.error('Error fetching admin events:', err)
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError
        setError(
          Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch events'
        )
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching events')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}
