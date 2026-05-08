'use client';
// app/providers.tsx
// TanStack Query + Firebase Auth context provider

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

// ─── TanStack Query client ───────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            1000 * 60 * 5,   // 5 minutes
        gcTime:               1000 * 60 * 30,  // 30 minutes
        retry:                2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Singleton — avoids new client on every re-render
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ─── Auth context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:    User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Keep session cookie in sync with Firebase state
      if (firebaseUser) {
        document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else {
        // Only clear if it exists to avoid unnecessary writes
        if (document.cookie.includes('session=')) {
          document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Combined Providers ───────────────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
