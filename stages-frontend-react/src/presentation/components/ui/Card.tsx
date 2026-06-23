import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('card', className)} {...props}>{children}</div>;
}