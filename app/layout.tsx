// app/layout.tsx
// Root layout — providers, skip link, service worker registration

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import ServiceWorkerRegister from '../components/shared/ServiceWorkerRegister';

export const metadata: Metadata = {
  title:       'Otis — AI Travel Planner',
  description: 'Plan trips dynamically with AI preferences, constraints, and real-time updates. Powered by Google Gemini.',
  manifest:    '/manifest.json',
  keywords:    ['travel', 'trip planner', 'AI travel', 'itinerary', 'Google Maps'],
  authors:     [{ name: 'Antigravity' }],
  openGraph: {
    title:       'Otis — AI Travel Planner',
    description: 'Plan your perfect trip with AI in seconds.',
    type:        'website',
  },
};

export const viewport: Viewport = {
  width:             'device-width',
  initialScale:      1,
  maximumScale:      1,
  themeColor:        '#007AFF',
  colorScheme:       'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        {/* Skip link — accessibility requirement (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-bg-elevated focus:px-4 focus:py-2 focus:rounded-card focus:shadow-sheet focus:text-accent focus:ring-2 focus:ring-accent text-callout font-semibold"
        >
          Skip to main content
        </a>

        <Providers>
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </Providers>

        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
