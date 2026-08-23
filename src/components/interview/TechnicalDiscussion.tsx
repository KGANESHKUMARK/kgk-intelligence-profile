import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, ChevronDown, Layers, Scale } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Icon } from '../common/Icon';
import { discussionCategories, type DiscussionQuestion } from '../../data/interviewTopics';
import { cn } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

export function TechnicalDiscussion() {
  const [categoryId, setCategoryId] = useState(discussionCategories[0].id);
  const category = discussionCategories.find((c) => c.id === categoryId) ?? discussionCategories[0];
  const [openId, setOpenId] = useState<string | null>(category.questions[0].id);

  const selectCategory = (id: string) => {
    const next = discussionCategories.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(id);
    setOpenId(next.questions[0].id);
  };

  return (
    <Section id="discussion">
      <SectionHeader
        index="10"
        eyebrow="Technical Depth"
        title="Technical Discussion"
        description="A representative sample of how I reason about design problems — the approach, the components, the failure scenarios and the tradeoffs I would name out loud."
      />

      <div
        className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Discussion categories"
      >
        {discussionCategories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === categoryId}
            onClick={() => selectCategory(c.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[0.8125rem] font-medium transition-all duration-200',
              c.id === categoryId
                ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)] hover:border-[var(--line-strong)] hover:text-[var(--text-2)]',
            )}
          >
            <Icon name={c.icon} size={14} />
            {c.label}
            <span className="font-mono text-[0.625rem] opacity-60">{c.questions.length}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={category.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="space-y-2.5"
        >
          {category.questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              open={openId === q.id}
              onToggle={() => setOpenId(openId === q.id ? null : q.id)}
            />
          ))}
        </motion.ul>
      </AnimatePresence>

      <p className="mt-5 text-[0.6875rem] text-[var(--text-3)]">
        Illustrative examples of technical depth — not an exhaustive interview preparation set.
      </p>
    </Section>
  );
}

function QuestionCard({
  question,
  open,
  onToggle,
}: {
  question: DiscussionQuestion;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `q-panel-${question.id}`;

  return (
    <motion.li
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn('surface-card overflow-hidden transition-colors', open && 'border-[var(--accent-line)]')}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 shrink-0 font-mono text-[0.6875rem] text-[var(--accent-text)]">Q</span>
          <span className="text-[0.9375rem] leading-snug font-medium tracking-tight">{question.question}</span>
        </span>
        <span
          className={cn(
            'mt-0.5 shrink-0 rounded-lg border border-[var(--line)] p-1.5 text-[var(--text-3)] transition-all duration-200',
            'group-hover:border-[var(--line-strong)] group-hover:text-[var(--text)]',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        >
          <ChevronDown size={14} strokeWidth={2} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--line)] px-5 py-4">
              <p className="mono-label mb-2 text-[var(--accent-text)]">Approach</p>
              <p className="text-sm leading-relaxed text-[var(--text-2)]">{question.approach}</p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <Column
                  icon={<Layers size={12} strokeWidth={2} />}
                  label="Key components"
                  items={question.components}
                  dot="var(--accent)"
                />
                <Column
                  icon={<AlertTriangle size={12} strokeWidth={2} />}
                  label="Failure scenarios"
                  items={question.failures}
                  dot="var(--risk)"
                  tone="var(--risk-text)"
                />
                <Column
                  icon={<Scale size={12} strokeWidth={2} />}
                  label="Tradeoffs"
                  items={question.tradeoffs}
                  dot="var(--ai)"
                  tone="var(--ai-text)"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Column({
  icon,
  label,
  items,
  dot,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  dot: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
      <p className="mono-label mb-2.5 flex items-center gap-1.5" style={tone ? { color: tone } : undefined}>
        {icon}
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
            <span
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
              style={{ background: dot }}
              aria-hidden="true"
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
