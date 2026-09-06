import { motion } from 'motion/react';
import type { AnswerLevel } from '../types';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

const LEVELS: { id: AnswerLevel; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'One line' },
  { id: 'interview', label: 'Interview', hint: '30\u201360 seconds' },
  { id: 'detailed', label: 'Detailed', hint: 'Deep technical' },
  { id: 'senior', label: 'Senior', hint: 'Production & trade-offs' },
];

export function AnswerLevelTabs({
  value,
  onChange,
  idPrefix,
}: {
  value: AnswerLevel;
  onChange: (level: AnswerLevel) => void;
  idPrefix: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Answer depth"
      className="flex flex-wrap gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1"
    >
      {LEVELS.map((level) => {
        const active = level.id === value;
        return (
          <button
            key={level.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${idPrefix}-answer-panel`}
            onClick={() => onChange(level.id)}
            title={level.hint}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-[0.8125rem] font-medium transition-colors',
              active ? 'text-[var(--bg)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${idPrefix}-answer-tab`}
                transition={{ duration: 0.22, ease: EASE }}
                className="absolute inset-0 -z-10 rounded-md bg-[var(--accent)]"
              />
            )}
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
