/**
 * Loading spinner. Use for buttons (Button has built-in loading) or inline loading states.
 */
import * as React from 'react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size of the spinner. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className = '', size = 'md', ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
);
Spinner.displayName = 'Spinner';
