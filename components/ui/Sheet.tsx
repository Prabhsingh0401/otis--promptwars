'use client';
// components/ui/Sheet.tsx
// Bottom sheet with spring animation — secondary content pattern from DESIGN.md §4.6

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface SheetProps {
  isOpen:      boolean;
  onClose:     () => void;
  title?:      string;
  children:    ReactNode;
  maxHeight?:  string;
}

export default function Sheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '90dvh',
}: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Trap focus inside sheet when open
  useEffect(() => {
    if (!isOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusable = sheet.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    first?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Sheet'}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-bg-elevated rounded-t-sheet flex flex-col pb-safe animate-sheet-in"
        style={{ maxHeight, boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
          <div className="w-9 h-[4px] rounded-full bg-separator" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pt-2 pb-3 border-b border-separator flex-shrink-0">
            <h2 className="text-title-2 font-bold text-label-primary">{title}</h2>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
