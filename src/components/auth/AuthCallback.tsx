import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/spinner';

export default function AuthCallback() {
  const [message, setMessage] = useState('Finishing sign in...');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function ensureUserProfile(userId: string, email: string, fullName?: string, avatarUrl?: string) {
      // Check if user record exists in public.users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userCheckError) throw userCheckError;

      if (!existingUser) {
        // Create user record in public.users table
        const { error: userError } = await supabase.from('users').upsert({
          id: userId,
          user_type: 'Investor', // Default to Investor, user can update later
          full_name: fullName || email.split('@')[0] || 'User',
          personal_email: email,
          telephone: null,
          country: null,
          city: null,
          cover_image_url: null,
          photo_url: avatarUrl || null,
        }, {
          onConflict: 'id',
        });

        if (userError) throw userError;
      }

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileCheckError) throw profileCheckError;

      if (!existingProfile) {
        // Create minimal profile record
        const { error: profileError } = await supabase.from('profiles').upsert({
          user_id: userId,
          project_name: null,
          project_category: null,
          company_name: null,
          company_nif: null,
          company_telephone: null,
          smart_money: null,
          total_sale_of_project: null,
          investment_preferences: null,
          inventor_name: null,
          license_number: null,
          release_date: null,
          initial_license_value: null,
          exploitation_license_royalty: null,
          patent_sale: null,
          investors_count: null,
        }, {
          onConflict: 'user_id',
        });

        if (profileError) throw profileError;
      }
    }

    async function run() {
      try {
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Check for OAuth errors from provider
        if (errorParam) {
          throw new Error(errorDescription || errorParam || 'OAuth authentication failed');
        }

        // Recovery links typically include type=recovery in the URL hash/query
        const hash = window.location.hash || '';
        const isRecovery = url.searchParams.get('type') === 'recovery' || hash.includes('type=recovery');
        if (isRecovery) {
          window.location.replace('/reset-password');
          return;
        }

        // With PKCE flow and detectSessionInUrl: true, Supabase automatically handles the code exchange
        // Just call getSession() - it will detect the code in URL and exchange it automatically
        setMessage('Completing authentication...');
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // If getSession fails, try waiting a bit for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retryData, error: retryError } = await supabase.auth.getSession();
          if (retryError) throw retryError;
          if (!retryData.session) {
            throw new Error('No session found. Please try signing in again.');
          }
          
          const user = retryData.session.user;
          if (!user || !user.email) {
            throw new Error('Failed to retrieve user information.');
          }

          setMessage('Setting up your account...');
          
          // Extract user metadata (handles both Google and LinkedIn)
          const fullName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          (user.user_metadata?.given_name && user.user_metadata?.family_name 
                            ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}` 
                            : null) ||
                          user.email?.split('@')[0] || 
                          'User';
          
          const avatarUrl = user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture || 
                           null;
          
          await ensureUserProfile(
            user.id,
            user.email,
            fullName,
            avatarUrl
          );

          setMessage('Sign in successful! Redirecting...');
          setTimeout(() => {
            window.location.replace('/');
          }, 500);
          return;
        }

        if (!data.session) {
          setMessage('No session found. Please try signing in again.');
          setError('Authentication failed. Please try again.');
          return;
        }

        const user = data.session.user;
        if (!user || !user.email) {
          setMessage('User information not found.');
          setError('Failed to retrieve user information.');
          return;
        }

        // Ensure user profile exists in public.users and public.profiles tables
        setMessage('Setting up your account...');
        
        // Extract user metadata (handles both Google and LinkedIn)
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        (user.user_metadata?.given_name && user.user_metadata?.family_name 
                          ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}` 
                          : null) ||
                        user.email?.split('@')[0] || 
                        'User';
        
        const avatarUrl = user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture || 
                         null;
        
        await ensureUserProfile(
          user.id,
          user.email,
          fullName,
          avatarUrl
        );

        // Success - redirect to home
        setMessage('Sign in successful! Redirecting...');
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      } catch (e: any) {
        if (cancelled) return;
        const errorMessage = e?.message || 'Auth callback failed. Please try again.';
        setError(errorMessage);
        setMessage('Authentication failed');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Please wait</h1>
        {error ? (
          <div className="space-y-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full px-4 py-2 text-white font-semibold rounded-lg transition-all"
              style={{ backgroundColor: '#0a3d5c' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Spinner size="lg" variant="primary" className="mx-auto" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </Card>
    </div>
  );
}