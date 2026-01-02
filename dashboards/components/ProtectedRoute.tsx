'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Admin has access to all routes
  const isAdmin = user?.role === 'admin';
  const hasAccess = isAdmin || (allowedRoles ? allowedRoles.includes(user?.role || '') : true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/portal-access');
      } else if (!hasAccess) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, hasAccess, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

