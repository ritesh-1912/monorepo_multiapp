/**
 * Text input with theme-aware styles. Use with Label for accessibility.
 */
import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional error state; adds border and aria-invalid. */
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => (
    <input
      ref={ref}
      className={[
        'flex h-10 w-full min-h-[40px] rounded-[6px] border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-150',
        error ? 'border-destructive' : 'border-border',
        className,
      ].join(' ')}
      aria-invalid={error ?? undefined}
      {...props}
    />
  )
);
Input.displayName = 'Input';
