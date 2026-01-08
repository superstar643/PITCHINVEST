import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        // PKCE OAuth: exchange ?code=... for a session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Recovery links typically include type=recovery in the URL hash/query
        const hash = window.location.hash || '';
        const isRecovery = url.searchParams.get('type') === 'recovery' || hash.includes('type=recovery');
        if (isRecovery) {
          window.location.replace('/reset-password');
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          setMessage('No session found. Please try signing in again.');
          return;
        }

        window.location.replace('/');
      } catch (e: any) {
        if (cancelled) return;
        setMessage(e?.message || 'Auth callback failed. Please try again.');
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
        <p className="text-gray-600">{message}</p>
      </Card>
    </div>
  );
}


