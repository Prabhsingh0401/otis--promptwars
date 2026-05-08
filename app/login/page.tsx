'use client';
// app/login/page.tsx — Firebase Auth login

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const router   = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Set session cookie for middleware
      document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.replace('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, provider);
      // Set session cookie for middleware
      document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.replace('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 text-center animate-card-in">
        <h1 className="text-large-title font-bold text-label-primary">Otis</h1>
        <p className="text-callout text-label-secondary mt-1">AI-powered travel planning</p>
      </div>

      <div className="w-full max-w-sm space-y-4 animate-card-in">
        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className={[
            'w-full h-[50px] rounded-button flex items-center justify-center gap-2.5',
            'bg-bg-tertiary border border-separator text-body font-semibold text-label-primary',
            'active:bg-fill-primary transition-colors',
            'focus-visible:ring-2 focus-visible:ring-accent',
            'disabled:opacity-40',
          ].join(' ')}
          aria-label="Sign in with Google"
        >
          {googleLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-neutral border-t-transparent animate-spin" aria-hidden />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26a5.36 5.36 0 0 1-8.01-2.82H.96v2.33A8.99 8.99 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M4.03 10.74A5.41 5.41 0 0 1 3.75 9c0-.6.1-1.18.28-1.74V4.93H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.07l3.07-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.34l2.58-2.58A8.97 8.97 0 0 0 9 0 8.99 8.99 0 0 0 .96 4.93l3.07 2.33A5.36 5.36 0 0 1 9 3.58z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3" role="separator" aria-hidden>
          <div className="flex-1 h-px bg-separator" />
          <span className="text-caption-1 text-label-tertiary">or</span>
          <div className="flex-1 h-px bg-separator" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailLogin} className="space-y-3" noValidate>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className={[
                'w-full h-[50px] px-4 rounded-button text-body',
                'bg-bg-tertiary border border-separator',
                'text-label-primary placeholder:text-label-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-accent',
              ].join(' ')}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              minLength={6}
              className={[
                'w-full h-[50px] px-4 rounded-button text-body',
                'bg-bg-tertiary border border-separator',
                'text-label-primary placeholder:text-label-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-accent',
              ].join(' ')}
            />
          </div>

          {error && (
            <p className="text-footnote text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} fullWidth>
            Sign In
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-callout text-label-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-accent font-semibold focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Sign in failed. Please try again.';
    }
  }
  return 'Sign in failed. Please try again.';
}
