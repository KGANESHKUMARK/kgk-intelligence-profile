import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Bookmark, BrainCircuit, Clock, Database, Repeat } from 'lucide-react';
import { categoryList, questionsByTechnology, topicsByTechnology } from '../services/registry';
import { DEFAULT_CATEGORY_ICON, MODULE_HOMES } from '../data/modules';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';
import { techLabel } from '../utils/tech';

/**
 * Generic module home — same layout as the Kafka/React homes, driven by
 * MODULE_HOMES config + registry data so new modules need no new page code.
 */
export default function TechHome({ technology }: { technology: string }) {
  const config = MODULE_HOMES[technology];
  const label = techLabel(technology);
  useLearningSeo(config?.title ?? label, config?.seoDescription ?? `${label} learning module.`);
  const { topicsViewed, bookmarks, questionConfidence } = useLearningProgress();

  if (!config) return <Navigate to="/learning" replace />;

  const topics = topicsByTechnology(technology);
  const questions = questionsByTechnology(technology);
  const categories = categoryList(technology);
  const isOwnTopic = (id: string) => topics.some((t) => t.id === id);

  const viewedCount = topicsViewed.filter(isOwnTopic).length;
  const bookmarked = bookmarks.filter(isOwnTopic);
  const answeredCount = questions.filter((q) => q.id in questionConfidence).length;

  // Configured cards first (in configured order), then any category that exists in data but isn't configured.
  const cards = [
    ...config.categoryCards.filter((c) => categories.includes(c.category)),
    ...categories
      .filter((c) => !config.categoryCards.some((card) => card.category === c))
      .map((c) => ({ category: c, blurb: '', icon: DEFAULT_CATEGORY_ICON })),
  ];

  return (
    <div>
      <header className="surface-card ticked p-6 sm:p-8">
        <span className="mono-label flex items-center gap-1.5 text-[var(--ai-text)]">
          <BrainCircuit size={13} strokeWidth={2} aria-hidden="true" />
          Learning Hub · {label}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{config.title}</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{config.tagline}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard label="Topics" value={`${topics.length}`} detail={`${categories.length} areas`} tone="ai" />
          <StatCard label="Interview questions" value={`${questions.length}`} detail="With code and follow-ups" tone="accent" />
          <StatCard
            label="Categories"
            value={`${categories.length}`}
            detail={categories.slice(0, 3).join(', ') + (categories.length > 3 ? '…' : '')}
            tone="neutral"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <ActionLink to={`/learning/${technology}/interview`} icon={<BrainCircuit size={15} strokeWidth={2} />} primary>
            Interview practice
          </ActionLink>
          <ActionLink to={`/learning/${technology}/flashcards`} icon={<Clock size={15} strokeWidth={2} />}>
            5-minute revision
          </ActionLink>
          <ActionLink to={`/learning/${technology}/glossary`} icon={<Database size={15} strokeWidth={2} />}>
            Glossary
          </ActionLink>
        </div>
      </header>

      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-3">Your progress (stored locally on this device)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Progress label="Topics viewed" value={viewedCount} total={topics.length} />
          <Progress label="Questions attempted" value={answeredCount} total={questions.length} />
          <Progress label="Bookmarked" value={bookmarked.length} total={topics.length} />
        </div>
      </section>

      <section className="mt-4">
        <h2 className="mono-label mb-3">Explore by area</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const count = topics.filter((t) => t.category === card.category).length;
            const Icon = card.icon;
            return (
              <Link
                key={card.category}
                to={`/learning/${technology}/category/${encodeURIComponent(card.category)}`}
                className="surface-card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="text-base font-semibold tracking-tight">{card.category}</span>
                  <span className="ml-auto shrink-0 font-mono text-[0.6875rem] text-[var(--text-3)]">
                    {count} topic{count === 1 ? '' : 's'}
                  </span>
                </span>
                {card.blurb && <span className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{card.blurb}</span>}
                <span className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)]">
                  Explore
                  <ArrowRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {bookmarked.length > 0 && (
        <section className="surface-card mt-4 p-5">
          <h2 className="mono-label mb-3 flex items-center gap-1.5">
            <Bookmark size={12} strokeWidth={2} aria-hidden="true" />
            My revision list — {label}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {bookmarked.map((id) => {
              const topic = topics.find((t) => t.id === id);
              if (!topic) return null;
              return (
                <li key={id}>
                  <Link
                    to={`/learning/${technology}/topic/${id}`}
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

      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-2 flex items-center gap-1.5">
          <Repeat size={12} strokeWidth={2} aria-hidden="true" />
          Production context
        </h2>
        <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{config.productionNote}</p>
      </section>

      <p className="mt-6 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
        {topics.length} topics · {questions.length} interview questions · {categories.length} categories. Every module
        plugs into the same registry, visual and question engines.
      </p>
    </div>
  );
}

function StatCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'accent' | 'ai' | 'neutral' }) {
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
      <p className="mt-0.5 truncate text-[0.6875rem] text-[var(--text-3)]">{detail}</p>
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

function ActionLink({ to, icon, primary, children }: { to: string; icon: React.ReactNode; primary?: boolean; children: React.ReactNode }) {
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
