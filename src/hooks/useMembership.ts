import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserSubscription } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { useAdmin } from './useAdmin';

export interface MembershipStatus {
  hasActiveSubscription: boolean;
  isApproved: boolean;
  profileStatus: 'pending' | 'approved' | 'rejected' | null;
  canAccess: boolean; // True if user has active subscription AND is approved (or is admin)
  loading: boolean;
}

export function useMembership(): MembershipStatus {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      if (authLoading || adminLoading) {
        setLoading(true);
        return;
      }

      if (!user) {
        setHasActiveSubscription(false);
        setIsApproved(false);
        setProfileStatus(null);
        setLoading(false);
        return;
      }

      try {
        // Admins bypass all checks
        if (isAdmin) {
          setHasActiveSubscription(true);
          setIsApproved(true);
          setProfileStatus('approved');
          setLoading(false);
          return;
        }

        // Check subscription status
        const { subscription, error: subError } = await getUserSubscription(user.id);
        setHasActiveSubscription(!!subscription);

        // Check profile status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('profile_status')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching profile status:', userError);
        }

        const status = (userData?.profile_status as 'pending' | 'approved' | 'rejected') || 'pending';
        setProfileStatus(status);
        setIsApproved(status === 'approved');

      } catch (error) {
        console.error('Error checking membership:', error);
        setHasActiveSubscription(false);
        setIsApproved(false);
        setProfileStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [user, authLoading, isAdmin, adminLoading]);

  const canAccess = isAdmin || (hasActiveSubscription && isApproved);

  return {
    hasActiveSubscription,
    isApproved,
    profileStatus,
    canAccess,
    loading,
  };
}