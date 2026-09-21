import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  BrainCircuit,
  Clock,
  Database,
  Layers,
  Puzzle,
  Repeat,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { topicsByTechnology, questionsByTechnology } from '../services/registry';
import { reactTopicCategories } from '../data/react/topics';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';

const CATEGORY_CARDS: { category: string; blurb: string; icon: React.ReactNode }[] = [
  { category: 'Fundamentals', blurb: 'Components, JSX, props, state, keys, forms and one-way data flow.', icon: <Puzzle size={16} strokeWidth={1.75} /> },
  { category: 'Hooks', blurb: 'useState, useEffect, useRef, memoization hooks, context, reducers, custom hooks.', icon: <Sparkles size={16} strokeWidth={1.75} /> },
  { category: 'Performance', blurb: 'Re-renders, memoization, virtualization, debounce, cancellation, code splitting.', icon: <Zap size={16} strokeWidth={1.75} /> },
  { category: 'State Management', blurb: 'Local vs client vs server state, Redux Toolkit, TanStack Query.', icon: <Layers size={16} strokeWidth={1.75} /> },
  { category: 'TypeScript', blurb: 'Typed props and events, generics, discriminated unions, reusable typed APIs.', icon: <ShieldCheck size={16} strokeWidth={1.75} /> },
  { category: 'Architecture', blurb: 'Error boundaries, testing, Next.js rendering, RBAC security, system design.', icon: <Layers size={16} strokeWidth={1.75} /> },
];

const reactTopicsAll = topicsByTechnology('react');
const reactQuestionsAll = questionsByTechnology('react');

export default function ReactHome() {
  useLearningSeo(
    'React Engineering Lab',
    'Learn React from first principles to senior architecture — hooks, performance, server state, security and system design, through a banking lens.',
  );
  const { topicsViewed, bookmarks, questionConfidence } = useLearningProgress();

  const answeredCount = Object.keys(questionConfidence).filter((id) => id.startsWith('q-react-')).length;
  const viewedCount = topicsViewed.filter((id) => reactTopicsAll.some((t) => t.id === id)).length;
  const bookmarkedCount = bookmarks.filter((id) => reactTopicsAll.some((t) => t.id === id)).length;

  return (
    <div>
      <header className="surface-card ticked p-6 sm:p-8">
        <span className="mono-label flex items-center gap-1.5 text-[var(--ai-text)]">
          <BrainCircuit size={13} strokeWidth={2} aria-hidden="true" />
          Learning Hub · React
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">React Engineering Lab</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--text-2)]">
          Learn React the way senior engineers are interviewed: rendering model, hooks, performance, server state,
          TypeScript and architecture — every concept anchored to a NexusBank banking scenario, with the follow-up
          question already waiting.
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Topics"
            value={`${reactTopicsAll.length}`}
            detail="Fundamentals to Architecture"
            tone="ai"
          />
          <StatCard
            label="Interview questions"
            value={`${reactQuestionsAll.length}`}
            detail="Intermediate to Architect"
            tone="accent"
          />
          <StatCard
            label="Categories"
            value={`${reactTopicCategories.length}`}
            detail={reactTopicCategories.slice(0, 3).join(', ') + '…'}
            tone="neutral"
          />
        </div>

        {/* Primary actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <ActionLink to="/learning/react/interview" icon={<BrainCircuit size={15} strokeWidth={2} />} primary>
            Interview practice
          </ActionLink>
          <ActionLink to="/learning/react/flashcards" icon={<Clock size={15} strokeWidth={2} />}>
            5-minute revision
          </ActionLink>
          <ActionLink to="/learning/react/glossary" icon={<Database size={15} strokeWidth={2} />}>
            Glossary
          </ActionLink>
        </div>
      </header>

      {/* Progress */}
      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-3">Your progress (stored locally on this device)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Progress label="Topics viewed" value={viewedCount} total={reactTopicsAll.length} />
          <Progress label="Questions attempted" value={answeredCount} total={reactQuestionsAll.length} />
          <Progress label="Bookmarked" value={bookmarkedCount} total={reactTopicsAll.length} />
        </div>
      </section>

      {/* Category cards */}
      <section className="mt-4">
        <h2 className="mono-label mb-3">Explore by area</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card) => {
            const topics = reactTopicsAll.filter((t) => t.category === card.category);
            if (topics.length === 0) return null;
            return (
              <Link
                key={card.category}
                to={`/learning/react/category/${encodeURIComponent(card.category)}`}
                className="surface-card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    {card.icon}
                  </span>
                  <span className="text-base font-semibold tracking-tight">{card.category}</span>
                  <span className="ml-auto font-mono text-[0.6875rem] text-[var(--text-3)]">
                    {topics.length} topic{topics.length === 1 ? '' : 's'}
                  </span>
                </span>
                <span className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{card.blurb}</span>
                <span className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)]">
                  Explore
                  <ArrowRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bookmarks shortcut */}
      {bookmarks.filter((id) => reactTopicsAll.some((t) => t.id === id)).length > 0 && (
        <section className="surface-card mt-4 p-5">
          <h2 className="mono-label mb-3 flex items-center gap-1.5">
            <Bookmark size={12} strokeWidth={2} aria-hidden="true" />
            My revision list — React
          </h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarks
              .filter((id) => reactTopicsAll.some((t) => t.id === id))
              .map((id) => {
                const topic = reactTopicsAll.find((t) => t.id === id);
                if (!topic) return null;
                return (
                  <li key={id}>
                    <Link
                      to={`/learning/react/topic/${id}`}
                      className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[0.75rem] text-[var(--text-2)] hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
                    >
                      {topic.title}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {/* Production context note */}
      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-2 flex items-center gap-1.5">
          <Repeat size={12} strokeWidth={2} aria-hidden="true" />
          Production context
        </h2>
        <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
          This module reflects real-world React usage in BFSI: server-side pagination and virtualized grids for
          transaction search, debounced search with request cancellation, TanStack Query as the server-state cache,
          RBAC-driven UI with backend-enforced authorization, idempotent payment flows, and error boundaries around
          every money-moving panel — the patterns behind enterprise banking portals.
        </p>
      </section>

      <p className="mt-6 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
        {reactTopicsAll.length} fully-built React topics · {reactQuestionsAll.length} interview questions ·{' '}
        {reactTopicCategories.length} categories. The architecture is technology-agnostic — each module plugs into
        the same registry, visual, and question engines.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'accent' | 'ai' | 'neutral';
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3.5',
        tone === 'ai'
          ? 'border-[var(--ai-line)] bg-[var(--ai-soft)]'
          : tone === 'accent'
            ? 'border-[var(--accent-line)] bg-[var(--accent-soft)]'
            : 'border-[var(--line)] bg-[var(--surface-2)]',
      )}
    >
      <p className="mono-label">{label}</p>
      <p
        className={cn(
          'mt-1.5 text-xl font-semibold tracking-tight',
          tone === 'ai' ? 'text-[var(--ai-text)]' : tone === 'accent' ? 'text-[var(--accent-text)]' : 'text-[var(--text)]',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[0.6875rem] text-[var(--text-3)]">{detail}</p>
    </div>
  );
}

function Progress({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="mono-label">{label}</span>
        <span className="font-mono text-[0.75rem] text-[var(--text-2)]">
          {value} / {total}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ActionLink({
  to,
  icon,
  primary,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
        primary
          ? 'bg-[var(--accent)] text-[var(--bg)] hover:brightness-110'
          : 'border border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text)] hover:border-[var(--accent-line)]',
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
