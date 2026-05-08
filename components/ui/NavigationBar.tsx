'use client';
// components/ui/NavigationBar.tsx
// Modern nav bar with frosted glass and collapsible large title on scroll

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface NavigationBarProps {
  title:         string;
  largeTitle?:   boolean;
  backLabel?:    string;
  onBack?:       () => void;
  trailing?:     React.ReactNode;
  largeTrailing?: React.ReactNode;
}

export default function NavigationBar({
  title,
  largeTitle = true,
  backLabel,
  onBack,
  trailing,
  largeTrailing,
}: NavigationBarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!largeTitle) {
      setCollapsed(true);
      return;
    }
    const handleScroll = () => setCollapsed(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [largeTitle]);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: collapsed
            ? '1px solid var(--color-separator)'
            : '1px solid transparent',
          transition: 'border-color 0.25s ease',
        }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 lg:px-12 h-14">
          <div className="flex items-center gap-1 min-w-[80px]">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-0.5 text-accent text-callout font-normal min-h-touch min-w-touch -ml-2 px-2 focus-visible:ring-2 focus-visible:ring-accent rounded-md"
                aria-label={`Back to ${backLabel ?? 'previous screen'}`}
              >
                <ChevronLeft size={20} strokeWidth={2} aria-hidden />
                {backLabel && <span>{backLabel}</span>}
              </button>
            ) : null}
          </div>

          <h1
            className="text-headline font-semibold text-label-primary transition-opacity duration-200 pointer-events-none select-none"
            style={{ opacity: collapsed ? 1 : 0 }}
            aria-live="polite"
          >
            {title}
          </h1>

          <div className="flex items-center gap-1 min-w-[80px] justify-end">
            {trailing}
          </div>
        </div>
      </header>

      {largeTitle && (
        <div className="max-w-7xl mx-auto w-full px-6 md:px-8 lg:px-12 pt-3 pb-2 flex items-end justify-between">
          <h1 className="text-[32px] font-bold text-label-primary tracking-tight leading-tight">
            {title}
          </h1>
          {largeTrailing && (
            <div className="pb-0.5">
              {largeTrailing}
            </div>
          )}
        </div>
      )}
    </>
  );
}
