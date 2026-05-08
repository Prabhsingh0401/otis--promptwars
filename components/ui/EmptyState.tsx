// components/ui/EmptyState.tsx
// Informative empty states with CTA — no illustrations per DESIGN.md §10

import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon:        LucideIcon;
  title:       string;
  description: string;
  actionLabel?: string;
  onAction?:   () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 py-16 gap-3"
      role="status"
      aria-label={title}
    >
      <Icon
        size={48}
        strokeWidth={1.5}
        className="text-label-tertiary mb-2"
        aria-hidden="true"
      />
      <h2 className="text-title-2 font-bold text-label-primary">{title}</h2>
      <p className="text-callout text-label-secondary max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4 w-full max-w-xs">
          <Button onClick={onAction} fullWidth>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
