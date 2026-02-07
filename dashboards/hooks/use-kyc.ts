'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getPendingStudents,
  getAllStudents,
  getStudentDetailsForReview,
  approveRejectStudent,
  updateStudentStatus,
  type Student,
  type StudentDetail,
  type StudentsFilter,
  type ApproveRejectStudentRequest,
  type ApiError,
} from '@/lib/api-client'

interface UsePendingStudentsResult {
  students: Student[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  refetch: (page?: number, limit?: number) => Promise<void>
}

interface UseAllStudentsResult {
  students: Student[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  refetch: (filters?: StudentsFilter) => Promise<void>
}

interface UseStudentDetailResult {
  student: StudentDetail | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePendingStudents(
  page: number = 1,
  limit: number = 10
): UsePendingStudentsResult {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UsePendingStudentsResult['pagination']>(null)

  const fetchStudents = useCallback(async (pageNum?: number, limitNum?: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getPendingStudents(pageNum || page, limitNum || limit)
      // Backend returns: { data: { items: [...], pagination: {...} }, status, message }
      const studentsArray = response?.data?.items || []
      const paginationData = response?.data?.pagination || null
      setStudents(Array.isArray(studentsArray) ? studentsArray : [])
      setPagination(paginationData)
    } catch (err) {
      console.error('Error fetching pending students:', err)

      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError

        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch pending students'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching pending students')
      }
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    students,
    loading,
    error,
    pagination,
    refetch: fetchStudents,
  }
}

export function useAllStudents(filters?: StudentsFilter): UseAllStudentsResult {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UseAllStudentsResult['pagination']>(null)

  // Extract individual properties to avoid object reference issues
  const status = filters?.status
  const page = filters?.page
  const limit = filters?.limit
  const search = filters?.search
  const institute = filters?.institute

  const fetchStudents = useCallback(async (newFilters?: StudentsFilter) => {
    try {
      setLoading(true)
      setError(null)

      const filtersToUse = newFilters || { status, page, limit, search, institute }
      const response = await getAllStudents(filtersToUse)
      // Backend returns: { data: { items: [...], pagination: {...} }, status, message }
      const studentsArray = response?.data?.items || []
      const paginationData = response?.data?.pagination || null
      setStudents(Array.isArray(studentsArray) ? studentsArray : [])
      setPagination(paginationData)
    } catch (err) {
      console.error('Error fetching students:', err)

      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError

        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch students'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching students')
      }
    } finally {
      setLoading(false)
    }
  }, [status, page, limit, search, institute])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return {
    students,
    loading,
    error,
    pagination,
    refetch: fetchStudents,
  }
}

export function useStudentDetail(id: string | null): UseStudentDetailResult {
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = useCallback(async () => {
    if (!id) {
      setStudent(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await getStudentDetailsForReview(id)
      setStudent(data)
    } catch (err) {
      console.error('Error fetching student details:', err)

      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError

        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to fetch student details'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching student details')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStudent()
  }, [fetchStudent])

  return {
    student,
    loading,
    error,
    refetch: fetchStudent,
  }
}

export function useApproveRejectStudent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveReject = useCallback(async (
    id: string,
    data: ApproveRejectStudentRequest
  ): Promise<Student | null> => {
    try {
      setLoading(true)
      setError(null)

      const result = await approveRejectStudent(id, data)
      return result
    } catch (err) {
      console.error('Error approving/rejecting student:', err)

      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError

        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to approve/reject student'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while approving/rejecting student')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    approveReject,
    loading,
    error,
  }
}

export function useUpdateStudentStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = useCallback(async (
    id: string,
    isActive: boolean
  ): Promise<Student | null> => {
    try {
      setLoading(true)
      setError(null)

      const result = await updateStudentStatus(id, isActive)
      return result
    } catch (err) {
      console.error('Error updating student status:', err)

      if (err && typeof err === 'object' && 'statusCode' in err) {
        const apiError = err as ApiError

        if (apiError.statusCode === 401) {
          setError('Unauthorized - Please login again')
        } else if (apiError.statusCode === 403) {
          setError('Access forbidden - Admin access required')
        } else {
          const errorMessage = Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to update student status'
          setError(errorMessage)
        }
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred while updating student status')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateStatus,
    loading,
    error,
  }
}
