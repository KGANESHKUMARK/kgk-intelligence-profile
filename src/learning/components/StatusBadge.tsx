import type { FeatureStatus } from '../types';
import { cn } from '../../lib/utils';

const styles: Record<FeatureStatus, string> = {
  stable: 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]',
  preview: 'border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]',
  incubator: 'border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]',
  deprecated: 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text-3)]',
  removed: 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text-3)] line-through',
};

/** Never render a preview/incubator feature with the same visual weight as stable. */
export function StatusBadge({ status }: { status: FeatureStatus }) {
  return (
    <span className={cn('mono-label rounded-md border px-2 py-1 text-[0.625rem]', styles[status])}>{status}</span>
  );
}
