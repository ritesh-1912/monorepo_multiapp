/**
 * Form label. Associate with form controls via htmlFor for accessibility.
 */
import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** When true, adds required asterisk (visual only; pair with aria-required on input). */
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-sm font-medium leading-tight text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      )}
    </label>
  )
);
Label.displayName = 'Label';
