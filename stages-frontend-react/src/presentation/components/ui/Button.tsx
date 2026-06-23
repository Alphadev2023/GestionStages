import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'secondary'|'danger'|'success';
  size?:    'sm'|'md';
}

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
};

export function Button({ variant='primary', size='md', className, children, ...props }: Props) {
  return (
    <button
      className={clsx(variants[variant], size==='sm' && 'text-xs px-3 py-1.5', className)}
      {...props}
    >
      {children}
    </button>
  );
}