import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', { email, password });
      setLoading(false);
      // Here you would typically call an API and handle auth
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition"
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
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0a3d5c' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#062a3d'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a3d5c'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

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
    </div>
  );
}
