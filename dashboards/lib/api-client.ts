const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Corporate Signup Types
export interface CorporateSignupRequest {
  name: string;
  emailPrefix: string;
  contactEmail: string;
  password: string;
  contact: string;
  regNumber?: string;
  category?: string;
  email: string;
  logo_path: string;
}

export interface CorporateSignupResponse {
  status: number;
  message: string;
  data: {
    id: string;
    email: string;
    businessName: string;
    emailPrefix: string;
    contactEmail: string;
    category?: string;
    verificationStatus: string;
    createdAt: string;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Corporate Merchant Types
export interface CorporateMerchant {
  id: string;
  userId: string;
  businessName: string;
  businessRegistrationNumber: string | null;
  contactEmail: string;
  contactPhone: string;
  logoPath: string | null;
  category: string | null;
  verificationStatus: string | null;
  verifiedAt: string | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  bannerUrl: string | null;
  termsAndConditions: string | null;
}

export interface CorporateMerchantsResponse {
  data: CorporateMerchant[];
  status: number;
  message: string;
}

// Branch Signup Types
export interface BranchSignupRequest {
  name: string;
  emailPrefix: string;
  password: string;
  address: string;
  city: string;
  contact: string;
  linkedCorporate: string;
  latitude?: string;
  longitude?: string;
  email: string;
}

export interface BranchSignupResponse {
  status: number;
  message: string;
  data: {
    id: string;
    email: string;
    branchName: string;
    address: string;
    city: string;
    contactPhone: string;
    latitude?: string;
    longitude?: string;
    linkedCorporate: string;
    createdAt: string;
  };
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If response is not JSON, try to get text
      const text = await response.text();
      data = text ? { message: text } : { message: 'Request failed' };
    }

    if (!response.ok) {
      // If unauthorized, remove token
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }

      // Handle different error response formats
      const errorMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Request failed';

      const error: ApiError = {
        statusCode: response.status,
        message: errorMessage,
        error: data.error || 'Error',
      };

      throw error;
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle network errors and timeouts
    if (error.name === 'AbortError') {
      const timeoutError: ApiError = {
        statusCode: 408,
        message: 'Request timeout - Please try again',
        error: 'Timeout',
      };
      throw timeoutError;
    }

    // Handle network failures (no internet, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError: ApiError = {
        statusCode: 0,
        message: 'Network error - Please check your internet connection',
        error: 'NetworkError',
      };
      throw networkError;
    }

    // Re-throw API errors (already formatted)
    if (error.statusCode) {
      throw error;
    }

    // Unknown error
    const unknownError: ApiError = {
      statusCode: 0,
      message: error.message || 'An unexpected error occurred',
      error: 'UnknownError',
    };
    throw unknownError;
  }
}

/**
 * Create a new corporate account
 * Requires admin authentication
 */
export async function corporateSignup(
  data: CorporateSignupRequest
): Promise<CorporateSignupResponse> {
  return apiRequest('/auth/corporate/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Fetch all corporate merchant accounts
 * Requires admin authentication
 * @param search Optional search query to filter by business name, email, or phone
 */
export async function getCorporateMerchants(search?: string): Promise<CorporateMerchantsResponse> {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append('search', search);
  }

  const endpoint = `/merchants/corporate${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export interface Branch {
  id: string
  merchant_id: string
  name: string
  address: string
  city: string
  contact_phone: string
  is_active: boolean
}

/**
 * Fetch all corporate merchant accounts
 * Requires admin authentication
 */
export const getMerchantBranches = async (merchantId: string): Promise<Branch[]> => {
  const response = await apiRequest(`/merchants/${merchantId}/branches`, {
    method: 'GET',
  })
  return response.data || []
}

// Branch Management Types
export interface AdminBranch {
  id: string
  merchant_id: string
  user_id: string | null
  branch_name: string
  address: string
  city: string
  contact_phone: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
  merchant?: {
    business_name: string
  }
}

export interface UpdateBranchRequest {
  branchName?: string
  address?: string
  city?: string
  contactPhone?: string
  latitude?: number
  longitude?: number
  isActive?: boolean
}

export interface UpdateMerchantRequest {
  businessName?: string
  businessRegistrationNumber?: string
  contactEmail?: string
  contactPhone?: string
  logoPath?: string
  category?: string
  bannerUrl?: string
  termsAndConditions?: string
  isActive?: boolean
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'expired'
}

// Branch Management API Functions
// Corporate Account Endpoints (Admin Only)

/**
 * Get a single corporate account by ID
 */
export async function getCorporateMerchant(id: string): Promise<CorporateMerchant> {
  const response = await apiRequest(`/merchants/corporate/${id}`, {
    method: 'GET',
  });
  return response.data;
}

/**
 * Update a corporate account
 */
export const updateCorporateMerchant = async (merchantId: string, data: UpdateMerchantRequest): Promise<CorporateMerchant> => {
  const response = await apiRequest(`/merchants/corporate/${merchantId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data
}

/**
 * Toggle corporate merchant status (active <-> inactive)
 */
export async function toggleCorporateMerchant(id: string): Promise<CorporateMerchant> {
  const response = await apiRequest(`/merchants/corporate/${id}/toggle`, {
    method: 'PATCH',
  });
  return response.data;
}

/**
 * Delete a corporate account
 */
export async function deleteCorporateMerchant(id: string): Promise<void> {
  await apiRequest(`/merchants/corporate/${id}`, {
    method: 'DELETE',
  });
}

// Branch Endpoints (Admin + Corporate)

export interface BranchFilter {
  corporateAccountId?: string;
  search?: string;
}

/**
 * Transform branch response from camelCase to snake_case
 */
const transformBranchResponse = (branch: any): AdminBranch => {
  return {
    id: branch.id,
    merchant_id: branch.merchantId,
    user_id: branch.userId,
    branch_name: branch.branchName,
    address: branch.address,
    city: branch.city,
    contact_phone: branch.contactPhone,
    latitude: branch.latitude,
    longitude: branch.longitude,
    is_active: branch.isActive,
    created_at: branch.createdAt,
    merchant: branch.merchantName ? {
      business_name: branch.merchantName
    } : (branch.merchant ? {
      business_name: branch.merchant.businessName || branch.merchant.business_name
    } : undefined)
  }
}

/**
 * Get branches (optionally filtered by corporateAccountId and search)
 */
export const getBranches = async (filters?: BranchFilter): Promise<AdminBranch[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.corporateAccountId) {
    queryParams.append('corporateAccountId', filters.corporateAccountId);
  }
  if (filters?.search) {
    queryParams.append('search', filters.search);
  }

  const endpoint = `/merchants/branches${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await apiRequest(endpoint, {
    method: 'GET',
  })

  const branches = response.data || []
  return branches.map(transformBranchResponse)
}

/**
 * Get branch by ID
 */
export const getBranch = async (id: string): Promise<AdminBranch> => {
  const response = await apiRequest(`/merchants/branches/${id}`, {
    method: 'GET',
  });
  return transformBranchResponse(response.data);
}

/**
 * Update branch
 */
export const updateBranch = async (branchId: string, data: UpdateBranchRequest): Promise<AdminBranch> => {
  const response = await apiRequest(`/merchants/branches/${branchId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return transformBranchResponse(response.data)
}

/**
 * Delete branch
 */
export const deleteBranch = async (branchId: string): Promise<void> => {
  await apiRequest(`/merchants/branches/${branchId}`, {
    method: 'DELETE',
  })
}

/**
 * Approve or reject a branch (Admin only)
 */
export const approveRejectBranch = async (branchId: string, status: 'approved' | 'rejected'): Promise<void> => {
  await apiRequest(`/merchants/branches/${branchId}/approve-reject`, {
    method: 'PUT',
    body: JSON.stringify({ action: status }),
  })
}

// Legacy/Other functions kept for compatibility if needed, but the above are the primary ones now.
// Note: getAllBranches was replaced by getBranches
// Note: approveBranch/rejectBranch were replaced by approveRejectBranch


/**
 * Create a new branch account
 * Requires admin or corporate merchant authentication
 */
export async function branchSignup(
  data: BranchSignupRequest
): Promise<BranchSignupResponse> {
  return apiRequest('/auth/branch/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


// Admin Offers API Types
export interface Offer {
  id: string;
  merchantId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  termsConditions: string | null;
  validFrom: string;
  validUntil: string;
  dailyLimit: number | null;
  totalLimit: number | null;
  currentRedemptions: number;
  status: 'active' | 'inactive' | 'expired';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  branches: {
    branchId: string;
    branchName: string;
    isActive: boolean;
  }[];
  merchant: {
    id: string;
    businessName: string;
    logoPath: string | null;
    category: string;
  };
}

export interface OfferFilter {
  status?: 'active' | 'inactive';
  merchantId?: string;
  page?: number;
  limit?: number;
}

export interface OffersResponse {
  data: {
    items: Offer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  status: number;
  message: string;
}

// Admin Offers API Functions

/**
 * Get all offers with optional filtering
 */
export const getOffers = async (filters?: OfferFilter): Promise<OffersResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.merchantId) queryParams.append('merchantId', filters.merchantId);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const endpoint = `/admin/offers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get a single offer by ID
 */
export const getOffer = async (id: string): Promise<Offer> => {
  const response = await apiRequest(`/admin/offers/${id}`, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Approve or reject an offer
 */
export const approveRejectOffer = async (id: string, action: 'approve' | 'reject', notes?: string): Promise<void> => {
  await apiRequest(`/admin/offers/${id}/approve-reject`, {
    method: 'PUT',
    body: JSON.stringify({ action, notes }),
  });
};

/**
 * Delete an offer
 */
export const deleteOffer = async (id: string): Promise<void> => {
  await apiRequest(`/admin/offers/${id}`, {
    method: 'DELETE',
  });
};

// Corporate Offers API Types

export interface CreateOfferRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  termsConditions?: string;
  validFrom: string;
  validUntil: string;
  dailyLimit?: number;
  totalLimit?: number;
  branchIds?: string[]; // Optional: assign to specific branches on creation
  merchantId?: string; // Required for admin creating offers for merchants
}

export interface UpdateOfferRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  termsConditions?: string;
  validFrom?: string;
  validUntil?: string;
  dailyLimit?: number;
  totalLimit?: number;
}

export interface OfferAnalytics {
  offerId: string;
  totalRedemptions: number;
  currentRedemptions: number;
  dailyRedemptions: {
    date: string;
    count: number;
  }[];
  branchBreakdown: {
    branchId: string;
    branchName: string;
    redemptions: number;
  }[];
}

// Corporate Offers API Functions

/**
 * Create a new offer
 */
export const createOffer = async (data: CreateOfferRequest): Promise<Offer> => {
  return apiRequest('/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get merchant's own offers
 */
export const getMerchantOffers = async (filters?: OfferFilter): Promise<OffersResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const endpoint = `/offers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get merchant's own offer details
 */
export const getMerchantOffer = async (id: string): Promise<Offer> => {
  const response = await apiRequest(`/offers/${id}`, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Update an offer
 */
export const updateOffer = async (id: string, data: UpdateOfferRequest): Promise<Offer> => {
  const response = await apiRequest(`/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Toggle offer status (active <-> inactive)
 */
export const toggleOfferStatus = async (id: string): Promise<Offer> => {
  const response = await apiRequest(`/offers/${id}/toggle`, {
    method: 'PATCH',
  });
  return response.data;
};

/**
 * Delete an offer
 */
export const deleteMerchantOffer = async (id: string): Promise<void> => {
  await apiRequest(`/offers/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Assign branches to an offer
 */
export const assignOfferBranches = async (id: string, branchIds: string[]): Promise<void> => {
  await apiRequest(`/offers/${id}/branches`, {
    method: 'POST',
    body: JSON.stringify({ branchIds }),
  });
};

/**
 * Remove branches from an offer
 */
export const removeOfferBranches = async (id: string, branchIds: string[]): Promise<void> => {
  await apiRequest(`/offers/${id}/branches`, {
    method: 'DELETE',
    body: JSON.stringify({ branchIds }),
  });
};

/**
 * Get offer analytics
 */
export const getOfferAnalytics = async (id: string): Promise<OfferAnalytics> => {
  const response = await apiRequest(`/offers/${id}/analytics`, {
    method: 'GET',
  });
  return response.data;
};

// ========== Student KYC API Types ==========

export interface StudentKYC {
  id: string;
  studentIdCardFrontPath: string;
  studentIdCardBackPath: string;
  selfieImagePath: string;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  isAnnualRenewal: boolean;
  createdAt: string | null;
  reviewer?: {
    id: string;
    email: string;
  } | null;
}

export interface Student {
  id: string;
  userId: string;
  parchiId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  university: string;
  graduationYear: number | null;
  isFoundersClub: boolean;
  totalSavings: number;
  totalRedemptions: number;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  verifiedAt: string | null;
  verificationExpiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  kyc?: StudentKYC | null;
}

export interface StudentDetail extends Student {
  kyc: StudentKYC;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  status: number;
  message: string;
}

export interface ApproveRejectStudentRequest {
  action: 'approve' | 'reject';
  reviewNotes?: string;
}

export interface StudentsFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  page?: number;
  limit?: number;
  search?: string; // Server-side search query
}

// ========== Student KYC API Functions ==========

/**
 * Get pending approval students
 * Requires admin authentication
 */
export const getPendingStudents = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Student>> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  return apiRequest(`/admin/students/pending?${queryParams.toString()}`, {
    method: 'GET',
  });
};

/**
 * Get all students with optional status filter
 * Requires admin authentication
 */
export const getAllStudents = async (
  filters?: StudentsFilter
): Promise<PaginatedResponse<Student>> => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.search && filters.search.trim()) {
    queryParams.append('search', filters.search.trim());
  }

  const endpoint = `/admin/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(endpoint, {
    method: 'GET',
  });
};

export interface StudentVerificationResponse {
  parchiId: string;
  firstName: string;
  lastName: string;
  university: string;
  verificationStatus: string;
  profilePicture: string | null;
  verificationSelfie: string | null;
  offer: {
    id: string;
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount: number;
    isBonus: boolean;
  };
}

/**
 * Get student details by Parchi ID for verification
 * Requires branch authentication
 */
export const getStudentByParchiId = async (parchiId: string): Promise<StudentVerificationResponse> => {
  const response = await apiRequest(`/admin/students/by-parchi/${parchiId}`, {
    method: 'GET',
  });
  return response.data;
};

export interface CreateRedemptionRequest {
  parchiId: string;
  offerId: string;
  notes?: string;
}

export interface RedemptionResponse {
  id: string;
  studentId: string;
  offerId: string;
  branchId: string;
  isBonusApplied: boolean;
  bonusDiscountApplied: number | null;
  verifiedBy: string | null;
  notes: string | null;
  createdAt: string;
  status: 'pending' | 'verified' | 'rejected';
  offer?: {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
  };
  branch?: {
    id: string;
    branchName: string;
    address: string;
  };
  student?: {
    id: string;
    parchiId: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Create a new redemption
 * Requires branch authentication
 */
export const createRedemption = async (data: CreateRedemptionRequest): Promise<RedemptionResponse> => {
  const response = await apiRequest('/admin/redemptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Get student details for review (includes KYC images)
 * Requires admin authentication
 */
export const getStudentDetailsForReview = async (id: string): Promise<StudentDetail> => {
  const response = await apiRequest(`/admin/students/${id}`, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Approve or reject a student KYC submission
 * Requires admin authentication
 */
export const approveRejectStudent = async (
  id: string,
  data: ApproveRejectStudentRequest
): Promise<Student> => {
  const response = await apiRequest(`/admin/students/${id}/approve-reject`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
};
export interface DailyRedemptionStats {
  todayCount: number;
  yesterdayCount: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Get daily redemption statistics for the branch
 */
export const getDailyRedemptionStats = async (): Promise<DailyRedemptionStats> => {
  const response = await apiRequest('/admin/redemptions/stats/daily', {
    method: 'GET',
  });
  return response.data;
};

export interface DailyRedemptionDetail {
  id: string;
  parchiId: string;
  offerTitle: string;
  discountDetails: string;
  createdAt: string;
  notes?: string;
  isBonusApplied?: boolean;
}

/**
 * Get daily redemption details for the branch
 */
export const getDailyRedemptionDetails = async (): Promise<DailyRedemptionDetail[]> => {
  const response = await apiRequest('/admin/redemptions/stats/daily-details', {
    method: 'GET',
  });
  return response.data;
};

export interface HourlyDataPoint {
  hour: number;
  count: number;
  label: string;
}

export interface AggregatedStats {
  uniqueStudents: number;
  bonusDealsCount: number;
  peakHour: string;
  hourlyData: HourlyDataPoint[];
}

/**
 * Get aggregated redemption stats for the branch
 */
export const getAggregatedRedemptionStats = async (): Promise<AggregatedStats> => {
  const response = await apiRequest('/admin/redemptions/stats/aggregated', {
    method: 'GET',
  });
  return response.data;
};

// ------------------------------------------------------------------
//  BRANCH ASSIGNMENTS & BONUS SETTINGS
// ------------------------------------------------------------------

export interface BranchAssignment {
  id: string; // branchId
  branchName: string;
  standardOfferId: string | null;
  bonusOfferId: string | null; // Deprecated/Unused
}

export interface BonusSettings {
  redemptionsRequired: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number | null;
  validityDays: number | null;
  isActive: boolean | null;
  imageUrl: string | null;
}

export const getBranchAssignments = async (): Promise<BranchAssignment[]> => {
  const response = await apiRequest('/merchants/branches/assignments', {
    method: 'GET',
  });
  return response.data;
};

export const assignBranchOffers = async (branchId: string, standardOfferId: string) => {
  return apiRequest(`/merchants/branches/${branchId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ standardOfferId, bonusOfferId: null }),
  });
};

export const getBranchBonusSettings = async (branchId: string): Promise<BonusSettings> => {
  const response = await apiRequest(`/merchants/branches/${branchId}/bonus-settings`, {
    method: 'GET',
  });
  return response.data;
};

export const updateBranchBonusSettings = async (branchId: string, settings: BonusSettings) => {
  return apiRequest(`/merchants/branches/${branchId}/bonus-settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// Dashboard API Types

export interface DashboardStats {
  totalRedemptions: number;
  uniqueStudents: number;
}

export interface DashboardAnalytics {
  time: string;
  count: number;
  [key: string]: any;
}

export interface BranchPerformance {
  branchName: string;
  redemptions: number;
  growth: string;
  [key: string]: any;
}

export interface OfferPerformance {
  id: string;
  title: string;
  status: string;
  currentRedemptions: number;
}

// Dashboard API Functions

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiRequest('/merchants/dashboard/stats', {
    method: 'GET',
  });
  return response.data;
};

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics[]> => {
  const response = await apiRequest('/merchants/dashboard/analytics', {
    method: 'GET',
  });
  return response.data;
};

export const getBranchPerformance = async (): Promise<BranchPerformance[]> => {
  const response = await apiRequest('/merchants/dashboard/branch-performance', {
    method: 'GET',
  });
  return response.data;
};

export const getOfferPerformance = async (): Promise<OfferPerformance[]> => {
  const response = await apiRequest('/merchants/dashboard/offer-performance', {
    method: 'GET',
  });
  return response.data;
};

// ============================================
// AUDIT LOGS
// ============================================

// Audit Log Interfaces
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  tableName: string | null;
  recordId: string | null;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    email: string;
    role: string;
  };
}

export interface AuditStatistics {
  total: number;
  byAction: {
    action: string;
    count: number;
  }[];
  byTable: {
    tableName: string | null;
    count: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    tableName: string | null;
    user: {
      id: string;
      email: string;
      role: string;
    } | null;
    createdAt: string;
  }[];
}

export interface AuditLogsQuery {
  userId?: string;
  action?: string;
  tableName?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

/**
 * Get audit logs with filters and pagination
 */
export const getAuditLogs = async (query: AuditLogsQuery = {}): Promise<PaginatedResponse<AuditLog>> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const response = await apiRequest(`/admin/audit-logs${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });

  return response;
};

/**
 * Get audit statistics for a date range
 */
export const getAuditStatistics = async (startDate?: string, endDate?: string): Promise<AuditStatistics> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const response = await apiRequest(`/admin/audit-logs/statistics${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Get single audit log by ID
 */
export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const response = await apiRequest(`/admin/audit-logs/${id}`, {
    method: 'GET',
  });
  return response.data;
};
