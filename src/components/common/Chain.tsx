import { motion } from 'motion/react';
import { cn, toneStyle, type Tone } from '../../lib/utils';
import { EASE } from '../../lib/motion';

/**
 * The recurring "Technology -> capability -> project -> outcome" ladder.
 * Used by the skills explorer, constellation drill-down and AI stages.
 */
export function Chain({
  steps,
  tone = 'accent',
  compact,
  className,
}: {
  steps: string[];
  tone?: Tone;
  compact?: boolean;
  className?: string;
}) {
  return (
    <ol style={toneStyle(tone)} className={cn('relative', className)} aria-label="Capability chain">
      {steps.map((step, i) => {
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;
        return (
          <motion.li
            key={`${step}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: i * 0.045, ease: EASE }}
            className={cn('relative flex gap-3', !isLast && (compact ? 'pb-2.5' : 'pb-3.5'))}
          >
            {/* rail */}
            <div className="relative flex w-3 shrink-0 justify-center">
              <span
                className={cn(
                  'relative z-10 mt-1.5 block rounded-full',
                  isFirst ? 'h-2 w-2 bg-[var(--t-raw)]' : 'h-1.5 w-1.5 bg-[var(--line-strong)]',
                )}
                style={isFirst ? { boxShadow: '0 0 0 3px var(--t-soft)' } : undefined}
                aria-hidden="true"
              />
              {!isLast && (
                <span
                  className="absolute top-3 bottom-0 w-px bg-[var(--line-strong)]"
                  aria-hidden="true"
                />
              )}
            </div>

            <span
              className={cn(
                'leading-snug',
                compact ? 'text-[0.8125rem]' : 'text-sm',
                isFirst
                  ? 'font-medium text-[var(--t-fg)]'
                  : isLast
                    ? 'text-[var(--text-2)]'
                    : 'text-[var(--text-2)]',
              )}
            >
              {step}
            </span>
          </motion.li>
        );
      })}
    </ol>
  );
}
