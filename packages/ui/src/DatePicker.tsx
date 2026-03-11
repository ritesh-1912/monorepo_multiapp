/**
 * Date input wrapper with consistent styling. Uses native input type="date" for simplicity.
 * Apps can replace with a calendar library (e.g. react-day-picker) if needed.
 */
import * as React from 'react';
import { Input, type InputProps } from './Input';

export type DatePickerProps = Omit<InputProps, 'type'>;

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => (
  <Input ref={ref} type="date" {...props} />
));
DatePicker.displayName = 'DatePicker';
