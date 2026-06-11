'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && adminOnly && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router, adminOnly]);

  if (loading) {
    return <PageLoading />;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    return null;
  }

  return children;
};
