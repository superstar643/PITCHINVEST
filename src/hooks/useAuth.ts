import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_type: 'Inventor' | 'StartUp' | 'Company' | 'Investor';
  full_name: string;
  personal_email: string;
  photo_url: string | null;
  cover_image_url: string | null;
  country: string | null;
  city: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchingProfileRef = useRef(false);
  const signingOutRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    fetchingProfileRef.current = false;

    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mountedRef.current) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          // Don't set loading to false here - fetchUserProfile will handle it
          fetchUserProfile(session.user.id, true);
        } else {
          // No session, we're done loading
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error getting session (catch):', error);
        if (mountedRef.current) {
          setLoading(false);
        }
      });

    // Listen for auth changes - This is the single source of truth for auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) {
        console.log('⚠️ Component unmounted, ignoring auth state change');
        return;
      }
      
      console.log('🔔 Auth state changed:', event, { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
      
      // Handle different auth events
      if (event === 'SIGNED_OUT' || !session) {
        // User signed out or no session
        console.log('✅ SIGNED_OUT event - clearing auth state');
        setUser(null);
        setProfile(null);
        setLoading(false);
        fetchingProfileRef.current = false;
        return;
      }
      
      if (session?.user) {
        // User signed in - update state and fetch profile
        console.log('✅ SIGNED_IN event - updating user state');
        setUser(session.user);
        
        // Only set loading if we're not already fetching
        if (!fetchingProfileRef.current) {
          setLoading(true);
        }
        try {
          await fetchUserProfile(session.user.id, false);
        } catch (error) {
          console.error('❌ Error in onAuthStateChange fetchUserProfile:', error);
          // Ensure loading is false even if fetchUserProfile fails
          if (mountedRef.current) {
            setLoading(false);
            fetchingProfileRef.current = false;
          }
        }
      }
    });

    return () => {
      mountedRef.current = false;
      fetchingProfileRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string, isInitialLoad: boolean = false) {
    // Prevent concurrent fetches
    if (fetchingProfileRef.current) {
      console.log('⚠️ Profile fetch already in progress, skipping');
      return;
    }

    try {
      fetchingProfileRef.current = true;
      console.log('📥 Fetching user profile for:', userId, isInitialLoad ? '(initial load)' : '(auth change)');
      
      // Only set loading to true if this is not the initial load
      // (initial load already has loading = true from useState)
      if (!isInitialLoad) {
        setLoading(true);
      }
      console.log('🔍 Profile data:-----------------------------');

      if (!mountedRef.current) {
        console.log('⚠️ Component unmounted, skipping state update');
        return;
      }

    } catch (error) {
      console.error('❌ Error fetching profile (catch):', error);
      if (mountedRef.current) {
        setProfile(null);
      }
    } finally {
      // Always set loading to false, even if there's an error or component unmounted
      if (mountedRef.current) {
        console.log('✅ Setting loading to false');
        setLoading(false);
      } else {
        console.log('⚠️ Component unmounted, not setting loading');
      }
      fetchingProfileRef.current = false;
    }
  }
  const signOut = async () => {
    // Prevent concurrent sign out calls
    if (signingOutRef.current) {
      console.log('⚠️ Sign out already in progress, skipping');
      return;
    }

    signingOutRef.current = true;
    console.log('🚪 Starting sign out...');
    
    // STEP 1: Immediately clear local state FIRST (don't wait for anything)
    if (mountedRef.current) {
      console.log('🔄 Step 1: Clearing local state immediately...');
      setUser(null);
      setProfile(null);
      setLoading(false);
      fetchingProfileRef.current = false;
    }
    
    // STEP 2: Manually clear localStorage immediately
    try {
      const storageKey = 'supabase.auth.token';
      localStorage.removeItem(storageKey);
      console.log('🧹 Step 2: Manually cleared localStorage session');
    } catch (storageError) {
      console.warn('⚠️ Failed to clear localStorage:', storageError);
    }
    
    // STEP 3: Try to call Supabase signOut (fire and forget - don't wait)
    console.log('📞 Step 3: Calling supabase.auth.signOut() (non-blocking)...');
    
    // Use a timeout wrapper
    const signOutWithTimeout = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 2000);
        });
        
        await Promise.race([
          supabase.auth.signOut({ scope: 'local' }),
          timeoutPromise
        ]);
        console.log('✅ Supabase signOut completed');
      } catch (error: any) {
        if (error.message === 'Timeout') {
          console.warn('⚠️ Supabase signOut timed out (non-critical)');
        } else {
          console.warn('⚠️ Supabase signOut error (non-critical):', error);
        }
      }
    };
    
    // Fire and forget - don't await
    signOutWithTimeout();
    
    // Reset the ref after a short delay
    setTimeout(() => {
      signingOutRef.current = false;
      console.log('✅ Sign out process completed');
    }, 500);
  };

  return { user, profile, loading, signOut };
}