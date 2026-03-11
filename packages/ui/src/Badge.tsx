/**
 * Badge for status, counts, or tags. Variants map to semantic states.
 */
import * as React from 'react';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  destructive: 'bg-destructive/15 text-destructive',
  outline: 'border border-border bg-transparent',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[12px] font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
