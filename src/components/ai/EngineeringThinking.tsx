import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';
import { Icon } from '../common/Icon';
import { engineeringThinking, failureModes } from '../../data/aiEngineering';
import { cn, toneStyle } from '../../lib/utils';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';

export function EngineeringThinking() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16 lg:px-8">
      <SectionHeader
        index="06.2"
        eyebrow="Method"
        title="Engineering Thinking"
        description="How I move from a business problem to something that survives production. Each step carries the question I actually ask at that point."
      />

      <motion.ol
        variants={stagger(0.02, 0.04)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {engineeringThinking.map((step, i) => {
          const isActive = activeId === step.id;
          return (
            <motion.li key={step.id} variants={fadeUp}>
              <button
                type="button"
                onClick={() => setActiveId(isActive ? null : step.id)}
                onMouseEnter={() => setActiveId(step.id)}
                aria-pressed={isActive}
                className={cn(
                  'group flex h-full w-full flex-col rounded-lg border p-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-[var(--accent-line)] bg-[var(--accent-soft)]'
                    : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-[0.5625rem] transition-colors',
                      isActive
                        ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        : 'border-[var(--line)] text-[var(--text-3)]',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[0.875rem] leading-tight font-semibold tracking-tight">{step.label}</span>
                </span>

                <span className="mt-2.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{step.detail}</span>

                <span
                  className={cn(
                    'mt-3 border-t pt-2.5 font-mono text-[0.6875rem] italic transition-colors',
                    isActive
                      ? 'border-[var(--accent-line)] text-[var(--accent-text)]'
                      : 'border-[var(--line)] text-[var(--text-3)]',
                  )}
                >
                  “{step.question}”
                </span>
              </button>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}

export function ProductionReality() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 pb-14 sm:px-6 md:pb-16 lg:px-8">
      <SectionHeader
        index="06.3"
        eyebrow="Failure Modes"
        title="Production Reality"
        description="Every system I build gets designed against this list first. The mitigation column is what separates a demo from something that can be on-call supported."
      />

      <motion.ul
        variants={stagger(0.02, 0.04)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {failureModes.map((f) => (
          <motion.li
            key={f.id}
            variants={fadeUp}
            style={toneStyle(f.tone)}
            className="group surface-card flex flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--t-line)] hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]">
                <Icon name={f.icon} size={14} />
              </span>
              <h3 className="text-[0.875rem] leading-tight font-semibold tracking-tight">{f.title}</h3>
            </div>

            <p className="mt-2.5 text-[0.75rem] leading-relaxed text-[var(--text-3)]">{f.symptom}</p>

            <div className="mt-3 border-t border-[var(--line)] pt-3">
              <p className="mono-label mb-2 flex items-center gap-1.5 text-[var(--accent-text)]">
                <ShieldCheck size={11} strokeWidth={2} aria-hidden="true" />
                Mitigation
              </p>
              <ul className="space-y-1">
                {f.mitigations.map((m) => (
                  <li key={m} className="flex gap-1.5 text-[0.75rem] leading-relaxed text-[var(--text-2)]">
                    <span className="mt-[6px] h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
