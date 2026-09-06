import { ExternalLink } from 'lucide-react';
import type { LearningReference } from '../types';
import { cn } from '../../lib/utils';

const badgeClass: Record<LearningReference['type'], string> = {
  official: 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]',
  jep: 'border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]',
  api: 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text-2)]',
  documentation: 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text-2)]',
  article: 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)]',
  video: 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)]',
};

/** "Learn More" — always external, always new-tab, always clearly labelled as leaving the portal. */
export function ReferenceList({ references }: { references?: LearningReference[] }) {
  if (!references || references.length === 0) return null;

  return (
    <ul className="space-y-2">
      {references.map((ref) => (
        <li key={ref.url}>
          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 transition-colors hover:border-[var(--accent-line)]"
          >
            <ExternalLink size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--text-3)] group-hover:text-[var(--accent-text)]" aria-hidden="true" />
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className={cn('mono-label rounded border px-1.5 py-0.5 text-[0.5625rem]', badgeClass[ref.type])}>
                  {ref.type}
                </span>
                {ref.status && ref.status !== 'stable' && (
                  <span className="mono-label rounded border border-[var(--risk-line)] bg-[var(--risk-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--risk-text)]">
                    {ref.status}
                  </span>
                )}
                <span className="text-[0.6875rem] text-[var(--text-3)]">{ref.source}</span>
              </span>
              <span className="mt-1 block text-[0.8125rem] font-medium text-[var(--text)] group-hover:text-[var(--accent-text)]">
                {ref.title}
              </span>
              {ref.description && (
                <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-[var(--text-3)]">{ref.description}</span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
