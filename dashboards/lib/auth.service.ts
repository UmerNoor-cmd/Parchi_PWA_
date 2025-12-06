const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginData {
  email: string;
  password: string;
}

interface StudentProfile {
  first_name: string;
  last_name: string;
  parchi_id: string;
  university: string;
}

interface MerchantProfile {
  id: string;
  business_name: string;
  email_prefix: string | null;
  category: string | null;
}

interface BranchProfile {
  id: string;
  branch_name: string;
  merchant_id: string;
  city: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  student: StudentProfile | null;
  merchant: MerchantProfile | null;
  branch: BranchProfile | null;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user?: {
    id: string;
    email: string;
  };
}

interface AuthResponse {
  data: {
    user: User;
    session: Session;
  };
  status: number;
  message: string;
}

interface ProfileResponse {
  data: User;
  status: number;
  message: string;
}

class AuthService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    // Store token
    if (result.data?.session?.access_token) {
      this.setToken(result.data.session.access_token);
    }

    return result;
  }

  async getProfile(): Promise<ProfileResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // If unauthorized, remove token
      if (response.status === 401) {
        this.removeToken();
      }
      throw new Error(result.message || 'Failed to get profile');
    }

    return result;
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getTokenValue(): string | null {
    return this.getToken();
  }
}

export const authService = new AuthService();
export type { User, AuthResponse, ProfileResponse };

