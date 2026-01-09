import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Get admin email from environment variable, fallback to default
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'Pechymdomingos@gmail.com';
    
    // Check if user email matches admin email (case-insensitive)
    const userEmail = user.email?.toLowerCase().trim();
    const normalizedAdminEmail = adminEmail.toLowerCase().trim();
    
    setIsAdmin(userEmail === normalizedAdminEmail);
    setLoading(false);
  }, [user, authLoading]);

  return { isAdmin, loading };
}
