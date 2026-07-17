import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, hint, required, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-danger-600 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={
          'input-field transition-colors ' +
          (error ? 'border-danger-400 focus:ring-danger-400 bg-danger-50 ' : '') +
          (className ?? '')
        }
        {...props}
      >
        {children}
      </select>
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-danger-600 mt-1 flex items-center gap-1">
        <span>!</span> {error}
      </p>}
    </div>
  )
);
Select.displayName = 'Select';