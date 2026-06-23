import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input ref={ref} className={'input-field ' + (className??'')} {...props} />
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';