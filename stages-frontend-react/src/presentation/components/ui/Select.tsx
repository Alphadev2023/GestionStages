import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select ref={ref} className={'input-field ' + (className??'')} {...props}>{children}</select>
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';