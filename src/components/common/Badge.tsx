import { cn, toneStyle, type Tone } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'xs' | 'sm';
  mono?: boolean;
  solid?: boolean;
}

export function Badge({ className, tone = 'neutral', size = 'sm', mono, solid, style, ...props }: BadgeProps) {
  return (
    <span
      style={{ ...toneStyle(tone), ...style }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border leading-none whitespace-nowrap',
        size === 'xs' ? 'px-1.5 py-1 text-[0.6875rem]' : 'px-2 py-1.5 text-xs',
        mono && 'font-mono tracking-wide',
        solid
          ? 'border-[var(--t-line)] bg-[var(--t-soft)] text-[var(--t-fg)]'
          : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-2)]',
        className,
      )}
      {...props}
    />
  );
}

/** Small monospace technology pill used in dense lists. */
export function TechPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border border-[var(--line)] bg-[var(--surface-2)]',
        'px-1.5 py-1 font-mono text-[0.6875rem] leading-none text-[var(--text-2)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
