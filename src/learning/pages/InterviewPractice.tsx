import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../../components/common/Button';
import { allQuestions } from '../services/registry';
import { questionCategories } from '../data/java/questions';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';
import type { Difficulty } from '../types';

const DIFFICULTIES: (Difficulty | 'All')[] = ['All', 'beginner', 'intermediate', 'advanced', 'senior'];

export default function InterviewPractice() {
  useLearningSeo(
    'Java Interview Practice',
    'Practice Java interview questions with four answer depths, follow-up chains and what the interviewer is testing.',
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');

  const filtered = useMemo(
    () =>
      allQuestions.filter(
        (q) => (category === 'All' || q.category === category) && (difficulty === 'All' || q.difficulty === difficulty),
      ),
    [category, difficulty],
  );

  const requestedId = searchParams.get('q');
  const [index, setIndex] = useState(0);

  // Deep link (?q=...) selects that question, widening filters if needed.
  useEffect(() => {
    if (!requestedId) return;
    const inFiltered = filtered.findIndex((q) => q.id === requestedId);
    if (inFiltered >= 0) {
      setIndex(inFiltered);
    } else if (allQuestions.some((q) => q.id === requestedId)) {
      setCategory('All');
      setDifficulty('All');
    }
  }, [requestedId, filtered]);

  // Keep index in range when filters change.
  useEffect(() => {
    setIndex((i) => (i >= filtered.length ? 0 : i));
  }, [filtered.length]);

  const current = filtered[index];

  const goTo = (nextIndex: number) => {
    const bounded = Math.max(0, Math.min(nextIndex, filtered.length - 1));
    setIndex(bounded);
    const q = filtered[bounded];
    if (q) setSearchParams({ q: q.id }, { replace: true });
  };

  const selectById = (questionId: string) => {
    const i = filtered.findIndex((q) => q.id === questionId);
    if (i >= 0) {
      goTo(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCategory('All');
      setDifficulty('All');
      setSearchParams({ q: questionId }, { replace: true });
    }
  };

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: 'Interview Practice' }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">Interview</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Java Interview Practice</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Think first, then reveal. Every question has four answer depths and the follow-up chain an interviewer is
          likely to walk you down.
        </p>

        {/* Filters */}
        <div className="mt-5 space-y-3">
          <FilterRow
            label="Area"
            options={['All', ...questionCategories]}
            value={category}
            onChange={(v) => {
              setCategory(v);
              setIndex(0);
            }}
          />
          <FilterRow
            label="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => {
              setDifficulty(v as Difficulty | 'All');
              setIndex(0);
            }}
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="surface-card mt-4 p-6 text-center text-sm text-[var(--text-2)]">
          No questions match these filters.
        </div>
      ) : (
        <>
          <div className="mt-4">
            {current && (
              <QuestionCard
                key={current.id}
                question={current}
                index={index}
                total={filtered.length}
                onSelectFollowUp={selectById}
              />
            )}
          </div>

          <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Question navigation">
            <Button variant="outline" onClick={() => goTo(index - 1)} disabled={index === 0}>
              <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
              Previous
            </Button>
            <Button
              variant="ghost"
              onClick={() => goTo(Math.floor(Math.random() * filtered.length))}
              aria-label="Jump to a random question"
            >
              <Shuffle size={15} strokeWidth={2} aria-hidden="true" />
              Random
            </Button>
            <Button variant="primary" onClick={() => goTo(index + 1)} disabled={index >= filtered.length - 1}>
              Next
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mono-label mr-1 w-16 shrink-0">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors',
            value === opt
              ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)] hover:text-[var(--text-2)]',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
