'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="w-full max-w-md mx-4">
        <div className="bg-surface border border-line rounded-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-ink">Ripple</h1>
            <p className="text-muted text-sm mt-2">Trust layer for fragmented knowledge</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-bad-subtle border border-bad rounded-[4px] text-bad text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lotte@ripple.demo"
                className="w-full px-3 py-2 border border-line rounded-[4px] text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-line rounded-[4px] text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded-[4px] transition disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-line">
            <p className="text-xs text-muted text-center mb-4">Demo users:</p>
            <div className="space-y-1 text-xs text-muted">
              <p><strong className="text-text">lotte@ripple.demo</strong> consultant</p>
              <p><strong className="text-text">karim@ripple.demo</strong> teamlead</p>
              <p><strong className="text-text">pieter@ripple.demo</strong> expert</p>
            </div>
            <p className="text-xs text-muted mt-3">Password: <code className="font-mono">&lt;name&gt;123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
