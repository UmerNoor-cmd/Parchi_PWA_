'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type User } from '@/lib/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (authService.isAuthenticated()) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to get user:', error);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    // 1. Perform login to get token
    await authService.login({ email, password });

    // 2. Fetch full profile to ensure we have all details (like merchant_id)
    // The login response might be partial or missing deep relations
    const profileResponse = await authService.getProfile();

    // 3. Update state with full profile
    setUser(profileResponse.data);

    return profileResponse.data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

