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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

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
 */
export async function getCorporateMerchants(): Promise<CorporateMerchantsResponse> {
  return apiRequest('/merchants/corporate', {
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
 * Get branches (optionally filtered by corporateAccountId)
 */
export const getBranches = async (filters?: BranchFilter): Promise<AdminBranch[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.corporateAccountId) {
    queryParams.append('corporateAccountId', filters.corporateAccountId);
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
    data: Offer[];
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
