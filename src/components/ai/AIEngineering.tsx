import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, MapPin, ServerCog, Sparkles } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { AIArchitecture } from './AIArchitecture';
import { aiStages, type AIStage } from '../../data/aiEngineering';
import { cn, toneStyle } from '../../lib/utils';
import { EASE, fadeUp, stagger, viewportOnce } from '../../lib/motion';

export function AIEngineering() {
  const [activeId, setActiveId] = useState(aiStages[2].id); // open on RAG
  const active = aiStages.find((s) => s.id === activeId) ?? aiStages[0];

  return (
    <Section id="ai">
      <SectionHeader
        index="06"
        eyebrow="AI Engineering"
        title="From LLM call to production system"
        description="The capability ladder I actually work through. Each stage covers what it is, why it matters, where I have used it, how it fails, and what production requires."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* ladder */}
        <motion.ol
          variants={stagger(0.01, 0.03)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="surface-card relative max-h-none overflow-hidden p-2 lg:max-h-[640px] lg:overflow-y-auto"
        >
          {aiStages.map((stage, i) => {
            const isActive = stage.id === activeId;
            const isLast = i === aiStages.length - 1;
            return (
              <motion.li key={stage.id} variants={fadeUp} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveId(stage.id)}
                  aria-pressed={isActive}
                  style={toneStyle(stage.tone)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200',
                    isActive
                      ? 'border-[var(--t-line)] bg-[var(--t-soft)]'
                      : 'border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-2)]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-[0.5625rem] transition-colors',
                      isActive
                        ? 'border-[var(--t-line)] bg-[var(--t-soft)] text-[var(--t-fg)]'
                        : 'border-[var(--line)] text-[var(--text-3)]',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-[0.8125rem] font-medium',
                        isActive ? 'text-[var(--t-fg)]' : 'text-[var(--text)]',
                      )}
                    >
                      {stage.label}
                    </span>
                    <span className="block truncate text-[0.6875rem] text-[var(--text-3)]">{stage.short}</span>
                  </span>
                </button>

                {!isLast && (
                  <span className="absolute left-[27px] h-1.5 w-px bg-[var(--line-strong)]" aria-hidden="true" />
                )}
              </motion.li>
            );
          })}
        </motion.ol>

        {/* detail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            <StageDetail key={active.id} stage={active} />
          </AnimatePresence>
        </div>
      </div>

      <AIArchitecture />
    </Section>
  );
}

function StageDetail({ stage }: { stage: AIStage }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: EASE }}
      style={toneStyle(stage.tone)}
      className="surface-card ticked p-5 sm:p-6"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-xl font-semibold tracking-tight">{stage.label}</h3>
        <span className="rounded border border-[var(--t-line)] bg-[var(--t-soft)] px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-[var(--t-fg)] uppercase">
          {stage.short}
        </span>
      </div>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--text)]">{stage.what}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Panel icon={<Sparkles size={12} strokeWidth={2} />} label="Why it matters">
          {stage.why}
        </Panel>
        <Panel icon={<MapPin size={12} strokeWidth={2} />} label="Where I have used it" tone>
          {stage.where}
        </Panel>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--risk-line)] bg-[var(--risk-soft)] p-3.5">
          <p className="mono-label mb-2.5 flex items-center gap-1.5 text-[var(--risk-text)]">
            <AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />
            Failure modes
          </p>
          <ul className="space-y-1.5">
            {stage.failureModes.map((f) => (
              <li key={f} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--risk)]" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
          <p className="mono-label mb-2.5 flex items-center gap-1.5 text-[var(--accent-text)]">
            <ServerCog size={12} strokeWidth={2} aria-hidden="true" />
            Production considerations
          </p>
          <ul className="space-y-1.5">
            {stage.production.map((p) => (
              <li key={p} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}

function Panel({
  icon,
  label,
  tone,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
      <p className={cn('mono-label mb-2 flex items-center gap-1.5', tone && 'text-[var(--t-fg)]')}>
        {icon}
        {label}
      </p>
      <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{children}</p>
    </div>
  );
}
