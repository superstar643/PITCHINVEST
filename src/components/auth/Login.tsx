import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.254 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
      <path fill="#FF3D00" d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.047 6.053 29.273 4 24 4c-7.682 0-14.343 4.336-17.694 10.691Z" />
      <path fill="#4CAF50" d="M24 44c5.152 0 9.84-1.977 13.387-5.197l-6.186-5.238C29.144 35.091 26.716 36 24 36c-5.232 0-9.617-3.317-11.29-7.946l-6.53 5.028C9.489 39.556 16.227 44 24 44Z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.96 11.96 0 0 1-4.102 5.565l.003-.002 6.186 5.238C36.949 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M20.447 20.452H17.21v-5.569c0-1.328-.026-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.0V9h3.112v1.561h.044c.434-.823 1.494-1.69 3.073-1.69 3.286 0 3.89 2.164 3.89 4.979v6.602ZM5.337 7.433a1.81 1.81 0 1 1 0-3.62 1.81 1.81 0 0 1 0 3.62ZM6.956 20.452H3.717V9h3.239v11.452Z"
      />
    </svg>
  );
}

export default function Login() {
  type Stage = 'enter_email' | 'auth';
  type AuthMode = 'password' | 'otp';

  const OTP_TTL_SECONDS = 180;

  const [stage, setStage] = useState<Stage>('enter_email');
  const [mode, setMode] = useState<AuthMode>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Forgot password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordOtpSent, setForgotPasswordOtpSent] = useState(false);
  const [forgotPasswordOtpCode, setForgotPasswordOtpCode] = useState('');
  const [forgotPasswordOtpSecondsLeft, setForgotPasswordOtpSecondsLeft] = useState(0);
  const [forgotPasswordVerified, setForgotPasswordVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = useMemo(() => `${window.location.origin}/auth/callback`, []);

  useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;
    const t = window.setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [otpSent, otpSecondsLeft]);

  // Forgot password OTP countdown
  useEffect(() => {
    if (!forgotPasswordOtpSent || forgotPasswordOtpSecondsLeft <= 0) return;
    const t = window.setInterval(() => setForgotPasswordOtpSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [forgotPasswordOtpSent, forgotPasswordOtpSecondsLeft]);

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (showOtpModal && !otpSent && !loading && email.trim()) {
      sendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOtpModal]);

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (showOtpModal && !otpSent && !loading && email.trim()) {
      sendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOtpModal]);

  // Auto-send forgot password OTP when modal opens (if email is provided)
  useEffect(() => {
    if (showForgotPasswordModal && !forgotPasswordOtpSent && !loading && forgotPasswordEmail.trim() && !forgotPasswordVerified) {
      // Only auto-send if email is already filled (from login form)
      sendForgotPasswordOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForgotPasswordModal, forgotPasswordEmail]);

  const goAuthStage = () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setStage('auth');
  };

  async function oauthSignIn(provider: 'google' | 'linkedin_oidc' | 'linkedin') {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { 
          redirectTo,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });
      if (oauthError) throw oauthError;
      // Note: User will be redirected to Google/LinkedIn, then back to /auth/callback
      // The loading state will be reset when the page redirects
    } catch (e: any) {
      // Some projects use 'linkedin' instead of 'linkedin_oidc'
      if (provider === 'linkedin_oidc') {
        try {
          const { error: oauthError2 } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin' as any,
            options: { redirectTo },
          });
          if (oauthError2) throw oauthError2;
          return;
        } catch (e2: any) {
          setError(e2?.message || 'Social login failed.');
        } finally {
          setLoading(false);
        }
        return;
      }
      setError(e?.message || 'Social login failed.');
      setLoading(false);
    }
  }

  const signInWithPassword = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (!password) throw new Error('Please enter your password.');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      if (!data.session) throw new Error('No session returned.');
      
      // ✅ Supabase's onAuthStateChange will fire with SIGNED_IN event
      // Let it handle state updates - just navigate after successful sign in
      // Use React Router navigate instead of window.location for proper state management
      setTimeout(() => {
        window.location.href = '/';
      }, 100); // Small delay to ensure onAuthStateChange fires first
    } catch (e: any) {
      setError(e?.message || 'Invalid login credentials.');
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
        if (otpError) throw otpError;

        setOtpSent(true);
      setOtpSecondsLeft(OTP_TTL_SECONDS);
      setInfo('We sent a 6-digit code to your email.');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to send code.';
      // Check if error indicates user doesn't exist
      if (
        errorMessage.toLowerCase().includes('signups not allowed') ||
        errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('email not found') ||
        errorMessage.toLowerCase().includes('no user found')
      ) {
        setError('account_not_found'); // Special flag for UI handling
      } else {
        setError(errorMessage);
      }
    } finally {
        setLoading(false);
    }
  };

  const handleOtpModeClick = () => {
    setError('');
    setInfo('');
    setMode('otp');
    setShowOtpModal(true);
  };

  const verifyOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (otpSecondsLeft <= 0) throw new Error('Code expired. Please resend a new code.');
      const code = otpCode.trim();
      if (!/^\d{6}$/.test(code)) throw new Error('Please enter the 6-digit code.');

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });
      if (verifyError) throw verifyError;
      if (!data.session) throw new Error('No session returned after verification.');
      
      // ✅ Supabase's onAuthStateChange will fire with SIGNED_IN event
      // Let it handle state updates - just navigate after successful verification
      setTimeout(() => {
        window.location.href = '/';
      }, 100); // Small delay to ensure onAuthStateChange fires first
    } catch (e: any) {
      setError(e?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordEmail(email.trim() || '');
    setShowForgotPasswordModal(true);
    setError('');
    setInfo('');
  };

  const sendForgotPasswordOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (!forgotPasswordEmail.trim()) {
        throw new Error('Please enter your email address.');
      }

      // Send OTP for password reset
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: forgotPasswordEmail.trim(),
        options: {
          shouldCreateUser: false,
          // Use recovery type for password reset
        },
      });

      if (otpError) throw otpError;

      setForgotPasswordOtpSent(true);
      setForgotPasswordOtpSecondsLeft(OTP_TTL_SECONDS);
      setInfo('We sent a 6-digit code to your email.');
    } catch (e: any) {
      setError(e?.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotPasswordOtp = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (forgotPasswordOtpSecondsLeft <= 0) {
        throw new Error('Code expired. Please resend a new code.');
      }
      const code = forgotPasswordOtpCode.trim();
      if (!/^\d{6}$/.test(code)) {
        throw new Error('Please enter the 6-digit code.');
      }

      // Verify OTP - this will establish a session for password update
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: forgotPasswordEmail.trim(),
        token: code,
        type: 'email',
      });

      if (verifyError) throw verifyError;
      if (!data.session) {
        throw new Error('No session returned after verification.');
      }

      // OTP verified successfully, now show password change form
      setForgotPasswordVerified(true);
      setInfo('Code verified! Please enter your new password.');
    } catch (e: any) {
      setError(e?.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords do not match.');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setInfo('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (e: any) {
      setError(e?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const resendForgotPasswordOtp = async () => {
    setForgotPasswordOtpCode('');
    setForgotPasswordOtpSent(false);
    setForgotPasswordOtpSecondsLeft(0);
    await sendForgotPasswordOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {(error || info) && (
          <div
            className={`mb-6 p-3 rounded-lg border ${
              error === 'account_not_found' 
                ? 'bg-amber-50 border-amber-200' 
                : error 
                ? 'bg-red-50 border-red-200' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            {error === 'account_not_found' ? (
              <div>
                <p className="text-sm text-amber-800 font-medium mb-2">
                  You don't have an account yet.
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  Please sign up first to create your account.
                </p>
                <a
                  href="/register"
                  className="inline-block px-4 py-2 text-white font-semibold rounded-lg transition-all text-sm"
                  style={{ backgroundColor: '#0a3d5c' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
                >
                  Go to Sign Up
                </a>
          </div>
            ) : (
              <p className={`text-sm ${error ? 'text-red-700' : 'text-blue-800'}`}>{error || info}</p>
        )}
          </div>
        )}

        {stage === 'enter_email' ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full px-4 py-2 border font-semibold rounded-lg transition-all disabled:opacity-50"
              onClick={() => oauthSignIn('google')}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full px-4 py-2 border font-semibold rounded-lg transition-all disabled:opacity-50"
              onClick={() => oauthSignIn('linkedin_oidc')}
            >
              <LinkedInIcon />
              <span>Continue with LinkedIn</span>
            </button>

            <div className="pt-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setInfo('');
                }}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading && email.trim()) {
                  e.preventDefault();
                  goAuthStage();
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                e.currentTarget.style.borderColor = '#0a3d5c';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            />
          </div>

            <button
              type="button"
              disabled={loading}
              className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#0a3d5c' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
              onClick={goAuthStage}
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              disabled={loading}
              className="w-full px-4 py-2 border font-semibold rounded-lg transition-all disabled:opacity-50"
              onClick={() => {
                setError('');
                setInfo('');
                if (mode === 'otp') {
                  setMode('password');
                  setShowOtpModal(false);
                } else {
                  handleOtpModeClick();
                }
              }}
            >
              {mode === 'otp' ? 'Use password instead' : 'Email sign-in code'}
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-800">
                {email.trim()}
              </div>
            </div>

            {mode === 'password' ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
              </label>
                    <button
                      type="button"
                      disabled={loading}
                      className="text-sm font-medium underline disabled:opacity-50"
                      style={{ color: '#0a3d5c' }}
                      onClick={handleForgotPasswordClick}
                    >
                      Forgot your password?
                    </button>
                  </div>
              <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                      setInfo('');
                    }}
                    placeholder="Your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && password) {
                        e.preventDefault();
                        signInWithPassword();
                      }
                    }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                  e.currentTarget.style.borderColor = '#0a3d5c';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0a3d5c' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
                  onClick={signInWithPassword}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={loading}
                className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0a3d5c' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
                onClick={handleOtpModeClick}
              >
                {loading ? 'Sending...' : 'Send code'}
              </button>
            )}

              <button
                type="button"
                disabled={loading}
              className="w-full px-4 py-2 border font-semibold rounded-lg transition-all"
              style={{ borderColor: '#0a3d5c', color: '#0a3d5c' }}
              onClick={() => {
                setStage('enter_email');
                setMode('password');
                setPassword('');
                setOtpSent(false);
                setOtpCode('');
                setOtpSecondsLeft(0);
                  setError('');
                setInfo('');
                }}
              >
              Go back
              </button>
            </div>
          )}

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="font-medium" style={{ color: '#0a3d5c' }}>
              Register here
            </a>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-2 border font-semibold rounded-lg transition-all"
            style={{ borderColor: '#0a3d5c', color: '#0a3d5c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Go to Home
          </button>
        </div>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog 
        open={showOtpModal} 
        onOpenChange={(open) => {
          // Prevent closing during loading or when OTP is being verified
          if (!open && !loading && !otpSent) {
            setShowOtpModal(false);
            setOtpCode('');
            setOtpSent(false);
            setOtpSecondsLeft(0);
            setMode('password');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We sent a 6-digit verification code to{' '}
              <span className="font-semibold text-gray-900">{email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && error === 'account_not_found' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-3 font-medium">
                  You don't have an account yet.
                </p>
                <p className="text-sm text-amber-700 mb-4">
                  Please sign up first to create your account.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setError('');
                    setInfo('');
                    setOtpSent(false);
                    setOtpCode('');
                    setOtpSecondsLeft(0);
                    window.location.href = '/register';
                  }}
                  className="w-full px-4 py-2 text-white font-semibold rounded-lg transition-all"
                  style={{ backgroundColor: '#0a3d5c' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062a3d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a3d5c')}
                >
                  Go to Sign Up
                </button>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : null}

            {info && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">{info}</p>
              </div>
            )}

            {otpSent ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Code expires in <span className="font-semibold">{Math.max(0, otpSecondsLeft)}s</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    6-digit verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(v);
                      setError('');
                      setInfo('');
                    }}
                    placeholder="123456"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none transition text-center text-2xl tracking-widest font-semibold"
                    style={{
                      letterSpacing: '0.5em',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && otpCode.length === 6 && otpSecondsLeft > 0) {
                        e.preventDefault();
                        verifyOtp();
                      }
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                      e.currentTarget.style.borderColor = '#0a3d5c';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading || otpCode.length !== 6 || otpSecondsLeft <= 0}
                    className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#0a3d5c' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" variant="white" />
                        Verifying...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading || otpSecondsLeft > 0}
                    className="text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: '#0a3d5c' }}
                    onClick={() => {
                      setOtpCode('');
                      setOtpSent(false);
                      setOtpSecondsLeft(0);
                      sendOtp();
                    }}
                  >
                    {otpSecondsLeft > 0 ? `Resend code in ${Math.max(0, otpSecondsLeft)}s` : 'Resend code'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Spinner size="lg" variant="primary" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600">Sending verification code...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog 
        open={showForgotPasswordModal} 
        onOpenChange={(open) => {
          if (!open && !loading && !forgotPasswordVerified) {
            setShowForgotPasswordModal(false);
            setForgotPasswordEmail('');
            setForgotPasswordOtpCode('');
            setForgotPasswordOtpSent(false);
            setForgotPasswordOtpSecondsLeft(0);
            setForgotPasswordVerified(false);
            setNewPassword('');
            setConfirmNewPassword('');
            setError('');
            setInfo('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              {!forgotPasswordVerified 
                ? 'Enter your email address and we\'ll send you a verification code.'
                : 'Enter your new password below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(error || info) && (
              <div
                className={`p-3 rounded-lg border ${
                  error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className={`text-sm ${error ? 'text-red-700' : 'text-blue-800'}`}>
                  {error || info}
                </p>
              </div>
            )}

            {!forgotPasswordVerified ? (
              <>
                {!forgotPasswordOtpSent ? (
                  <>
                    <div>
                      <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="forgotPasswordEmail"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => {
                          setForgotPasswordEmail(e.target.value);
                          setError('');
                          setInfo('');
                        }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                          e.currentTarget.style.borderColor = '#0a3d5c';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && forgotPasswordEmail.trim() && !loading) {
                            e.preventDefault();
                            sendForgotPasswordOtp();
                          }
                        }}
                        autoFocus
                      />
                    </div>

                    <button
                      type="button"
                      disabled={loading || !forgotPasswordEmail.trim()}
                      className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#0a3d5c' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#062a3d';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#0a3d5c';
                        }
                      }}
                      onClick={sendForgotPasswordOtp}
                    >
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="forgotPasswordOtp" className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Code
                      </label>
                      <input
                        id="forgotPasswordOtp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={forgotPasswordOtpCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setForgotPasswordOtpCode(value);
                          setError('');
                          setInfo('');
                        }}
                        placeholder="000000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition text-center text-2xl tracking-widest font-mono"
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                          e.currentTarget.style.borderColor = '#0a3d5c';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && forgotPasswordOtpCode.length === 6 && forgotPasswordOtpSecondsLeft > 0 && !loading) {
                            e.preventDefault();
                            verifyForgotPasswordOtp();
                          }
                        }}
                        autoFocus
                      />
                      {forgotPasswordOtpSecondsLeft > 0 && (
                        <p className="mt-2 text-xs text-gray-500 text-center">
                          Code expires in {Math.floor(forgotPasswordOtpSecondsLeft / 60)}:
                          {String(forgotPasswordOtpSecondsLeft % 60).padStart(2, '0')}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={loading || forgotPasswordOtpCode.length !== 6 || forgotPasswordOtpSecondsLeft <= 0}
                      className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#0a3d5c' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#062a3d';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#0a3d5c';
                        }
                      }}
                      onClick={verifyForgotPasswordOtp}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        disabled={loading || forgotPasswordOtpSecondsLeft > 0}
                        className="text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: '#0a3d5c' }}
                        onClick={resendForgotPasswordOtp}
                      >
                        {forgotPasswordOtpSecondsLeft > 0 
                          ? `Resend code in ${Math.max(0, forgotPasswordOtpSecondsLeft)}s` 
                          : 'Resend code'}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                      setInfo('');
                    }}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                      e.currentTarget.style.borderColor = '#0a3d5c';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPassword && confirmNewPassword && !loading) {
                        e.preventDefault();
                        updatePassword();
                      }
                    }}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setError('');
                      setInfo('');
                    }}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10, 61, 92, 0.1), 0 0 0 2px #0a3d5c';
                      e.currentTarget.style.borderColor = '#0a3d5c';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPassword && confirmNewPassword && !loading) {
                        e.preventDefault();
                        updatePassword();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={loading || !newPassword || !confirmNewPassword || newPassword.length < 6 || newPassword !== confirmNewPassword}
                  className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0a3d5c' }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#062a3d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#0a3d5c';
                    }
                  }}
                  onClick={updatePassword}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
