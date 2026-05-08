'use client';
// components/ui/TabBar.tsx
// Apple-style bottom tab bar — 4 tabs, no animation on switch

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Sparkles, Briefcase, User } from 'lucide-react';

const TABS = [
  { id: 'explore', label: 'Explore', icon: Map, href: '/' },
  { id: 'plan', label: 'Plan', icon: Sparkles, href: '/plan' },
  { id: 'trips', label: 'Trips', icon: Briefcase, href: '/trips' },
  { id: 'profile', label: '', icon: User, href: '/profile' },
] as const;

interface TabBarProps {
  tripCount?: number; // badge count on Trips tab
}

export default function TabBar({ tripCount }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-bg-elevated/90 backdrop-blur-lg rounded-2xl px-3 py-1.5 w-[90vw] max-w-[400px] min-w-[300px]"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 0.5px var(--color-separator)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      {TABS.map(({ id, label, icon: Icon, href }) => {
        const isActive = href === '/'
          ? pathname === '/'
          : pathname.startsWith(href);

        return (
          <Link
            key={id}
            href={href}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-[3px] h-tab-height min-h-touch rounded-xl',
              'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset',
              isActive ? 'bg-accent/10' : '',
            ].join(' ')}
            aria-label={label || 'Profile'}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative">
              <Icon
                size={24}
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? 'text-accent' : 'text-neutral'}
                aria-hidden
              />
              {/* Badge — only on Trips tab */}
              {id === 'trips' && tripCount && tripCount > 0 ? (
                <span
                  className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                  aria-label={`${tripCount} trips`}
                >
                  {tripCount > 9 ? '9+' : tripCount}
                </span>
              ) : null}
            </div>
            <span
              className={[
                'text-caption-2 uppercase tracking-wide font-medium',
                isActive ? 'text-accent' : 'text-neutral',
              ].join(' ')}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
