import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallback() {
  const [message, setMessage] = useState('Finishing sign in...');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function checkRegistrationStatus(userId: string) {
      // Check if user record exists in public.users table
      // DO NOT create user record here - registration form will handle that
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, user_type')
        .eq('id', userId)
        .maybeSingle();

      if (userCheckError) throw userCheckError;

      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, project_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileCheckError) throw profileCheckError;

      // Registration is incomplete if:
      // 1. User record doesn't exist in public.users table, OR
      // 2. User exists but has no user_type (registration not completed), OR
      // 3. Profile doesn't exist or has no project_name
      const isIncomplete = !existingUser || !existingUser.user_type || !existingProfile || !existingProfile.project_name;
      
      return { isIncomplete };
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
        
        // Try to get session with retries (LinkedIn OAuth might need more time)
        let session = null;
        let user = null;
        let retries = 3;
        
        while (retries > 0 && !session) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError && retries > 1) {
            // Wait longer for LinkedIn OAuth sessions
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
            continue;
          }
          
          if (sessionError) throw sessionError;
          if (data.session) {
            session = data.session;
            user = data.session.user;
            break;
          }
          
          // If no session, wait and retry
          if (retries > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
          } else {
            throw new Error('No session found. Please try signing in again.');
          }
        }

        if (!session || !user) {
          setMessage('No session found. Please try signing in again.');
          setError('Authentication failed. Please try again.');
          return;
        }

        if (!user.email) {
          setMessage('User information not found.');
          setError('Failed to retrieve user information.');
          return;
        }

        // Check registration status - DO NOT create user records here
        setMessage('Checking registration status...');
        
        const registrationStatus = await checkRegistrationStatus(user.id);

        if (registrationStatus.isIncomplete) {
          setMessage('Redirecting to complete registration...');
          // Ensure oauth=true parameter is set for both Google and LinkedIn
          setTimeout(() => {
            window.location.replace('/register?oauth=true');
          }, 500);
        } else {
          // Success - redirect to home
          setMessage('Sign in successful! Redirecting...');
          setTimeout(() => {
            window.location.replace('/');
          }, 500);
        }
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
          <LoadingSpinner message={message} />
        )}
      </Card>
    </div>
  );
}