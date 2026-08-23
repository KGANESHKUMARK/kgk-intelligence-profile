import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquare, Quote } from 'lucide-react';
import { SectionHeader } from '../common/SectionHeader';
import { askTopics, type AskTopic } from '../../data/interviewTopics';
import { cn } from '../../lib/utils';
import { EASE, fadeUp, stagger, viewportOnce } from '../../lib/motion';

const categoryTone: Record<AskTopic['category'], 'accent' | 'ai' | 'risk'> = {
  Backend: 'accent',
  Frontend: 'accent',
  AI: 'ai',
  Data: 'accent',
  Platform: 'accent',
  Domain: 'risk',
};

export function AskMeAbout() {
  const [activeId, setActiveId] = useState(askTopics[0].id);
  const active = askTopics.find((t) => t.id === activeId) ?? askTopics[0];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 md:py-16 lg:px-8">
      <SectionHeader
        index="09.1"
        eyebrow="Conversation Starters"
        title="Ask Me About"
        description="Pick a topic and I will give you the short version, plus exactly what I would point at as evidence."
      />

      <motion.div
        variants={stagger(0.01, 0.02)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Interview topics"
      >
        {askTopics.map((topic) => {
          const isActive = topic.id === activeId;
          const tone = categoryTone[topic.category];
          return (
            <motion.button
              key={topic.id}
              variants={fadeUp}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="ask-panel"
              onClick={() => setActiveId(topic.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition-all duration-200',
                isActive
                  ? tone === 'ai'
                    ? 'border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]'
                    : tone === 'risk'
                      ? 'border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]'
                      : 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)] hover:border-[var(--line-strong)] hover:text-[var(--text-2)]',
              )}
            >
              {topic.label}
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          id="ask-panel"
          role="tabpanel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="surface-card ticked mt-4 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
              <MessageSquare size={15} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="mono-label">{active.category}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{active.label}</h3>
            </div>
          </div>

          <p className="mt-4 text-[0.9375rem] leading-relaxed font-medium text-[var(--accent-text)]">
            {active.headline}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-2)]">{active.body}</p>

          <div className="mt-4 flex gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <Quote size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--text-3)]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="mono-label">Evidence</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{active.evidence}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="mono-label mr-1">Related</span>
            {active.related.map((r) => (
              <span
                key={r}
                className="rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]"
              >
                {r}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
