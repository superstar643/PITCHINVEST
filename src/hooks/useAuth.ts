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
        
        return;
      }
      
  
      
      // Handle different auth events
      if (event === 'SIGNED_OUT' || !session) {
        // User signed out or no session
       
        setUser(null);
        setProfile(null);
        setLoading(false);
        fetchingProfileRef.current = false;
        return;
      }
      
      if (session?.user) {
        // User signed in - update state and fetch profile

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
      return;
    }

    try {
      fetchingProfileRef.current = true;
      
      // Only set loading to true if this is not the initial load
      // (initial load already has loading = true from useState)
      if (!isInitialLoad) {
        setLoading(true);
      }

      if (!mountedRef.current) {
        return;
      }

      // Fetch user profile from database
      const { data, error } = await supabase
        .from('users')
        .select('id, user_type, full_name, personal_email, photo_url, cover_image_url, country, city')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        if (mountedRef.current) {
          setProfile(null);
        }
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          user_type: data.user_type as 'Inventor' | 'StartUp' | 'Company' | 'Investor',
          full_name: data.full_name,
          personal_email: data.personal_email,
          photo_url: data.photo_url,
          cover_image_url: data.cover_image_url,
          country: data.country,
          city: data.city,
        });
      } else {
        setProfile(null);
      }

    } catch (error) {
      console.error('❌ Error fetching profile (catch):', error);
      if (mountedRef.current) {
        setProfile(null);
      }
    } finally {
      // Always set loading to false, even if there's an error or component unmounted
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingProfileRef.current = false;
    }
  }
  const signOut = async () => {
    // Prevent concurrent sign out calls
    if (signingOutRef.current) {
      
      return;
    }

    signingOutRef.current = true;
    
    
    // STEP 1: Immediately clear local state FIRST (don't wait for anything)
    if (mountedRef.current) {
    
      setUser(null);
      setProfile(null);
      setLoading(false);
      fetchingProfileRef.current = false;
    }
    
    // STEP 2: Manually clear localStorage immediately
    try {
      const storageKey = 'supabase.auth.token';
      localStorage.removeItem(storageKey);
    
    } catch (storageError) {
      console.warn('⚠️ Failed to clear localStorage:', storageError);
    }
    
    
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