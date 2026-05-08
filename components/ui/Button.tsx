'use client';
// components/ui/Button.tsx
// Three button variants — Primary, Secondary, Text (per DESIGN.md §4.4)

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  fullWidth?: boolean;
  children:  ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', loading = false, fullWidth = false, children, className = '', disabled, ...rest },
    ref,
  ) {
    const base = [
      'inline-flex items-center justify-center font-semibold transition-transform transition-opacity',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
      'active:scale-[0.97] active:opacity-85',
      'disabled:pointer-events-none disabled:opacity-40',
      fullWidth ? 'w-full' : '',
    ].join(' ');

    const variants: Record<ButtonVariant, string> = {
      primary:     'bg-accent text-white rounded-button',
      secondary:   'bg-fill-secondary text-accent rounded-button',
      text:        'bg-transparent text-accent rounded-md min-h-touch min-w-touch px-2',
      destructive: 'bg-fill-secondary text-destructive rounded-button',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-[15px]',
      md: 'h-[50px] px-5 text-headline',
      lg: 'h-14 px-6 text-title-3',
    };

    const classes = [base, variants[variant], sizes[variant === 'text' ? 'md' : size], className].join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
            role="status"
            aria-label="Loading"
          />
        ) : (
          children
        )}
      </button>
    );
  },
);

export default Button;
