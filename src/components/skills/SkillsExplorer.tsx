import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Sparkles, X } from 'lucide-react';
import { SectionHeader, Section } from '../common/SectionHeader';
import { Chain } from '../common/Chain';
import { SkillDetail } from './SkillDetail';
import { DomainStacks } from './DomainStacks';
import { activeCategories, skills, type Skill, type SkillCategory } from '../../data/skills';
import { useAppState } from '../../hooks/useAppState';
import { cn, matches } from '../../lib/utils';
import { EASE } from '../../lib/motion';

type Filter = SkillCategory | 'All';
const filters: Filter[] = ['All', ...activeCategories];

const levelStyles: Record<Skill['level'], string> = {
  Advanced: 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]',
  Strong: 'border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]',
  'Working Knowledge': 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-3)]',
};

export function SkillsExplorer() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [selected, setSelected] = useState<Skill | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { focusedSkill, focusSkill } = useAppState();

  // Cross-section drill-down (constellation, command palette, project modal).
  useEffect(() => {
    if (!focusedSkill) return;
    const skill = skills.find((s) => s.id === focusedSkill);
    if (!skill) return;
    setFilter('All');
    setQuery('');
    setSelected(skill);
    focusSkill(null);
  }, [focusedSkill, focusSkill]);

  const results = useMemo(
    () =>
      skills.filter(
        (s) =>
          (filter === 'All' || s.category === filter) &&
          matches(query, s.name, s.category, s.context, s.aliases, s.chain),
      ),
    [query, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['All', skills.length]]);
    activeCategories.forEach((c) => map.set(c, skills.filter((s) => s.category === c).length));
    return map;
  }, []);

  return (
    <Section id="skills">
      <SectionHeader
        index="02"
        eyebrow="Skills Explorer"
        title="Technical Skills"
        description="Every technology maps to where it was used and what it produced. Search, filter, or select a card to see the full Technology → Experience chain."
      />

      {/* search + filters */}
      <div className="surface-card mb-5 p-3 sm:p-4">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--text-3)]"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search technologies... (try “Kafka”, “AI”, “RAG”, “observability”)"
            aria-label="Search technologies"
            className="h-11 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] pr-10 pl-10 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-3)] focus:border-[var(--accent-line)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-[var(--text-3)] transition-colors hover:text-[var(--text)]"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="hide-scrollbar mt-3 flex gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter skills by category">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                filter === f
                  ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-3)] hover:border-[var(--line-strong)] hover:text-[var(--text-2)]',
              )}
            >
              {f}
              <span className="font-mono text-[0.625rem] opacity-60">{counts.get(f) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* grid + detail */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="mono-label mb-3" aria-live="polite">
            {results.length} {results.length === 1 ? 'technology' : 'technologies'}
            {query && ` matching “${query}”`}
          </p>

          {results.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-2 px-6 py-14 text-center">
              <Sparkles size={20} strokeWidth={1.5} className="text-[var(--text-3)]" aria-hidden="true" />
              <p className="text-sm text-[var(--text-2)]">No technology matches “{query}”.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFilter('All');
                }}
                className="mt-1 text-xs text-[var(--accent-text)] underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {results.map((skill) => {
                  const isSelected = selected?.id === skill.id;
                  return (
                    <motion.li
                      key={skill.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(isSelected ? null : skill)}
                        aria-pressed={isSelected}
                        className={cn(
                          'group flex h-full w-full flex-col rounded-lg border p-3 text-left transition-all duration-200',
                          isSelected
                            ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] shadow-[var(--shadow-card)]'
                            : 'border-[var(--line)] bg-[var(--surface)] hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-card)]',
                        )}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              'font-mono text-[0.8125rem] leading-tight font-medium',
                              isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text)]',
                            )}
                          >
                            {skill.name}
                          </span>
                          {skill.core && (
                            <span
                              className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                              title="Core capability"
                              aria-label="Core capability"
                            />
                          )}
                        </span>
                        <span className="mt-1 text-[0.625rem] tracking-wide text-[var(--text-3)] uppercase">
                          {skill.category}
                        </span>
                        <span
                          className={cn(
                            'mt-2.5 inline-flex w-fit rounded border px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-wide uppercase',
                            levelStyles[skill.level],
                          )}
                        >
                          {skill.level}
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* sticky detail rail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selected ? (
              <SkillDetail key={selected.id} skill={selected} onClose={() => setSelected(null)} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="surface-card ticked p-5"
              >
                <p className="mono-label">Technology → Experience</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
                  Select any technology to trace it through to the capability, the project it was used on, and the
                  outcome it produced.
                </p>
                <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
                  <Chain
                    compact
                    steps={['Kafka', 'Event-driven systems', 'Portfolio Transaction Management', 'Reliability: retries, DLQ, idempotency']}
                  />
                </div>
                <p className="mt-3 text-[0.6875rem] text-[var(--text-3)]">
                  Cards marked with a dot are core capabilities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <DomainStacks />
    </Section>
  );
}
