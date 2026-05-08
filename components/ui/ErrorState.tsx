// components/ui/ErrorState.tsx
// Inline and full-page error states per DESIGN.md §11

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?:       string;
  description?: string;
  onRetry?:     () => void;
  inline?:      boolean;
}

export default function ErrorState({
  title       = 'Something went wrong',
  description = "Couldn't load your content. Check your connection.",
  onRetry,
  inline = false,
}: ErrorStateProps) {
  if (inline) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-3 text-destructive"
        role="alert"
        aria-live="polite"
      >
        <AlertTriangle size={16} strokeWidth={1.5} aria-hidden />
        <p className="text-footnote">{description}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto text-accent text-footnote underline focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 py-16 gap-3"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        size={24}
        strokeWidth={1.5}
        className="text-warning mb-2"
        aria-hidden
      />
      <h2 className="text-headline font-semibold text-label-primary">{title}</h2>
      <p className="text-subhead text-label-secondary max-w-xs">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-accent text-callout font-semibold min-h-touch px-4 focus-visible:ring-2 focus-visible:ring-accent rounded-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
