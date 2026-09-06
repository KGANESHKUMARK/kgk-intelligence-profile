import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  BrainCircuit,
  Boxes,
  Clock,
  Cpu,
  GitBranch,
  GraduationCap,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { allQuestions, allTopics, topicsByCategory } from '../services/registry';
import { javaVersions, latestLTS, latestVersion, VERSION_DATA_SOURCE_NOTE } from '../data/java/versions';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';

const CATEGORY_CARDS: { category: string; blurb: string; icon: React.ReactNode }[] = [
  { category: 'Collections', blurb: 'One of the most heavily tested interview areas.', icon: <Boxes size={16} strokeWidth={1.75} /> },
  { category: 'Concurrency', blurb: 'Threads, executors and virtual threads.', icon: <Zap size={16} strokeWidth={1.75} /> },
  { category: 'JVM', blurb: 'Memory, class loading, JIT and garbage collection.', icon: <Cpu size={16} strokeWidth={1.75} /> },
  { category: 'Java 8+', blurb: 'Lambdas, streams and Optional.', icon: <Layers size={16} strokeWidth={1.75} /> },
];

export default function JavaHome() {
  useLearningSeo(
    'Java Engineering Lab',
    'Learn modern Java visually — internals, interview answers, code, output and production insight.',
  );
  const { topicsViewed, bookmarks, questionConfidence } = useLearningProgress();

  const answeredCount = Object.keys(questionConfidence).length;

  return (
    <div>
      <header className="surface-card ticked p-6 sm:p-8">
        <span className="mono-label flex items-center gap-1.5 text-[var(--ai-text)]">
          <GraduationCap size={13} strokeWidth={2} aria-hidden="true" />
          Learning Hub
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Java Engineering Lab</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--text-2)]">
          Learn modern Java. Understand the internals. Practice the interview.
        </p>

        {/* Version stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Latest release" value={`Java ${latestVersion.version}`} detail={latestVersion.isLTS ? 'LTS' : 'Feature release (non-LTS)'} tone="ai" />
          <StatCard label="Current LTS" value={`Java ${latestLTS.version}`} detail={`Released ${latestLTS.releaseDate}`} tone="accent" />
          <StatCard label="Versions covered" value={`${javaVersions.length}`} detail="Java 8 through 26" tone="neutral" />
        </div>
        <p className="mt-3 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">{VERSION_DATA_SOURCE_NOTE}</p>

        {/* Primary actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <ActionLink to="/learning/java/latest" icon={<Sparkles size={15} strokeWidth={2} />} primary>
            What&apos;s new in Java {latestVersion.version}
          </ActionLink>
          <ActionLink to="/learning/java/interview" icon={<BrainCircuit size={15} strokeWidth={2} />}>
            Interview practice
          </ActionLink>
          <ActionLink to="/learning/java/flashcards" icon={<Clock size={15} strokeWidth={2} />}>
            5-minute revision
          </ActionLink>
          <ActionLink to="/learning/java/versions" icon={<GitBranch size={15} strokeWidth={2} />}>
            Version timeline
          </ActionLink>
        </div>
      </header>

      {/* Progress */}
      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-3">Your progress (stored locally on this device)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Progress label="Topics viewed" value={topicsViewed.length} total={allTopics.length} />
          <Progress label="Questions attempted" value={answeredCount} total={allQuestions.length} />
          <Progress label="Bookmarked" value={bookmarks.length} total={allTopics.length} />
        </div>
      </section>

      {/* Category cards */}
      <section className="mt-4">
        <h2 className="mono-label mb-3">Explore by area</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORY_CARDS.map((card) => {
            const topics = topicsByCategory(card.category);
            return (
              <Link
                key={card.category}
                to={`/learning/java/category/${encodeURIComponent(card.category)}`}
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
      {bookmarks.length > 0 && (
        <section className="surface-card mt-4 p-5">
          <h2 className="mono-label mb-3 flex items-center gap-1.5">
            <Bookmark size={12} strokeWidth={2} aria-hidden="true" />
            My revision list
          </h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarks.map((id) => {
              const topic = allTopics.find((t) => t.id === id);
              if (!topic) return null;
              return (
                <li key={id}>
                  <Link
                    to={`/learning/java/topic/${id}`}
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

      {/* Scope note */}
      <p className="mt-6 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
        This is the first phase of the Learning Hub: {allTopics.length} fully-built Java topics and{' '}
        {allQuestions.length} interview questions across Collections, Concurrency, JVM and Java 8+. The architecture
        is technology-agnostic — Spring Boot, React, Python, Kafka and others plug into the same registry, visual and
        question engines.
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
