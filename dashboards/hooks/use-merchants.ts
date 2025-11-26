'use client'

import { useState, useEffect } from 'react'
import { getCorporateMerchants, type CorporateMerchant, type ApiError } from '@/lib/api-client'

interface UseMerchantsResult {
  merchants: CorporateMerchant[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useMerchants(): UseMerchantsResult {
  const [merchants, setMerchants] = useState<CorporateMerchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMerchants = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getCorporateMerchants()
      setMerchants(response.data || [])
    } catch (err) {
      console.error('Error fetching merchants:', err)
      
      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError
        
        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch merchants'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching merchants')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMerchants()
  }, [])

  return {
    merchants,
    loading,
    error,
    refetch: fetchMerchants,
  }
}

