import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap ' +
  'transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--bg)] hover:brightness-110 active:brightness-95 ' +
    'shadow-[0_0_0_1px_var(--accent-line),0_6px_20px_-8px_var(--glow)] hover:shadow-[0_0_0_1px_var(--accent),0_10px_28px_-8px_var(--glow)]',
  secondary:
    'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line-strong)] ' +
    'hover:bg-[var(--surface-3)] hover:border-[var(--accent-line)]',
  outline:
    'bg-transparent text-[var(--text-2)] border border-[var(--line)] ' +
    'hover:text-[var(--text)] hover:border-[var(--line-strong)] hover:bg-[var(--surface)]',
  ghost: 'bg-transparent text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = 'Button';

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  external?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant = 'secondary', size = 'md', external, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    />
  ),
);
LinkButton.displayName = 'LinkButton';
