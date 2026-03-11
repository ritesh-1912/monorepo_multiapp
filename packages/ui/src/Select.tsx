/**
 * Styled native select. For complex dropdowns consider headless UI in the app.
 */
import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={[
        'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive' : 'border-border',
        className,
      ].join(' ')}
      aria-invalid={error ?? undefined}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
