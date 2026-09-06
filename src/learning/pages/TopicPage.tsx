import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Bookmark, Brain, Lightbulb, Repeat, Sparkles } from 'lucide-react';
import { Breadcrumbs, ContextBar } from '../components/ContextBar';
import { LearningTerm } from '../components/LearningTerm';
import { VisualRenderer } from '../components/VisualRenderer';
import { ReferenceList } from '../components/ReferenceList';
import { StatusBadge } from '../components/StatusBadge';
import { CodeBlock } from '../components/QuestionCard';
import { Button } from '../../components/common/Button';
import { getTopic, getVisual, getQuestion, topicRoute } from '../services/registry';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';

export default function TopicPage() {
  const { topicId = '' } = useParams();
  const topic = getTopic(topicId);
  const { markTopicViewed, toggleBookmark, isBookmarked, toggleReviewLater, isReviewLater } = useLearningProgress();

  useLearningSeo(
    topic ? topic.title : 'Topic not found',
    topic ? topic.oneLineMeaning : 'This learning topic could not be found.',
  );

  useEffect(() => {
    if (topic) markTopicViewed(topic.id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [topic, markTopicViewed]);

  if (!topic) {
    return (
      <div className="surface-card p-8 text-center">
        <h1 className="text-xl font-semibold">Topic not found</h1>
        <p className="mt-2 text-sm text-[var(--text-2)]">
          No learning content exists for &ldquo;{topicId}&rdquo; yet.
        </p>
        <Link to="/learning/java" className="mt-4 inline-block text-sm text-[var(--accent-text)] hover:underline">
          Back to Java Engineering Lab
        </Link>
      </div>
    );
  }

  const visuals = (topic.visualIds ?? []).map(getVisual).filter(Boolean);
  const bookmarked = isBookmarked(topic.id);
  const forReview = isReviewLater(topic.id);

  return (
    <article>
      <Breadcrumbs
        crumbs={[
          { label: 'Java', href: '/learning/java' },
          { label: topic.category, href: `/learning/java/category/${encodeURIComponent(topic.category)}` },
          { label: topic.title },
        ]}
      />
      <ContextBar />

      {/* Header */}
      <header className="surface-card ticked p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">{topic.category}</span>
          {topic.difficulty && (
            <span className="mono-label rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.5625rem]">
              {topic.difficulty}
            </span>
          )}
          {topic.introducedIn && (
            <span className="mono-label rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.5625rem]">
              Java {topic.introducedIn}+
            </span>
          )}
          {topic.featureStatus && <StatusBadge status={topic.featureStatus} />}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{topic.title}</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.oneLineMeaning}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant={bookmarked ? 'primary' : 'outline'} size="sm" onClick={() => toggleBookmark(topic.id)}>
            <Bookmark size={14} strokeWidth={2} aria-hidden="true" />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          <Button variant={forReview ? 'secondary' : 'outline'} size="sm" onClick={() => toggleReviewLater(topic.id)}>
            <Repeat size={14} strokeWidth={2} aria-hidden="true" />
            {forReview ? 'Marked for review' : 'Review later'}
          </Button>
        </div>
      </header>

      {/* Mental model + memory tip */}
      {(topic.mentalModel || topic.memoryTip) && (
        <Section title="Remember it like this" icon={<Lightbulb size={13} strokeWidth={2} />}>
          {topic.mentalModel && <p className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.mentalModel}</p>}
          {topic.memoryTip && (
            <p className="mt-3 rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-[0.875rem] font-medium text-[var(--accent-text)]">
              {topic.memoryTip}
            </p>
          )}
        </Section>
      )}

      {/* Visuals */}
      {visuals.length > 0 && (
        <div className="mt-4 space-y-4">
          {visuals.map((v) => (
            <VisualRenderer key={v!.id} visual={v!} />
          ))}
        </div>
      )}

      {/* Key terms */}
      {topic.keyTerms && topic.keyTerms.length > 0 && (
        <Section title="Key terms">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.875rem]">
            {topic.keyTerms.map((term) => (
              <LearningTerm key={term} term={term} />
            ))}
          </div>
        </Section>
      )}

      {/* Interview answer */}
      {topic.interviewAnswer && (
        <Section title="Interview answer" icon={<Sparkles size={13} strokeWidth={2} />} tone="accent">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--text)]">{topic.interviewAnswer}</p>
        </Section>
      )}

      {/* Detailed */}
      {topic.detailedExplanation && (
        <Section title="Detailed explanation">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.detailedExplanation}</p>
        </Section>
      )}

      {topic.internalWorking && (
        <Section title="Internal working">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.internalWorking}</p>
        </Section>
      )}

      {/* Code + output */}
      {topic.codeExample && (
        <Section title="Code and output">
          <CodeBlock code={topic.codeExample} output={topic.codeOutput} />
          {topic.whyOutput && (
            <div className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
              <p className="mono-label mb-1.5">Why this output?</p>
              <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{topic.whyOutput}</p>
            </div>
          )}
        </Section>
      )}

      {topic.practicalExample && (
        <Section title="In practice">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.practicalExample}</p>
        </Section>
      )}

      {/* Common mistakes */}
      {topic.commonMistakes && topic.commonMistakes.length > 0 && (
        <Section title="Common mistakes" icon={<AlertTriangle size={13} strokeWidth={2} />} tone="risk">
          <ul className="space-y-2">
            {topic.commonMistakes.map((m) => (
              <li key={m} className="flex gap-2.5 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--risk)]" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {topic.seniorInsight && (
        <Section title="Senior insight" icon={<Brain size={13} strokeWidth={2} />} tone="ai">
          <p className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]">{topic.seniorInsight}</p>
        </Section>
      )}

      {/* AI-awareness */}
      {topic.aiAwareness && (
        <Section title="How this gets probed" icon={<Brain size={13} strokeWidth={2} />} tone="ai">
          <p className="text-[0.75rem] leading-relaxed text-[var(--text-3)]">
            A teaching simulation of how a knowledgeable interviewer follows up — not a claim about any specific
            AI interview product.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] p-3">
              <p className="mono-label mb-1.5 text-[var(--accent-text)]">A strong answer mentions</p>
              <div className="flex flex-wrap gap-1.5">
                {topic.aiAwareness.strongAnswerShouldMention.map((k) => (
                  <span key={k} className="rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]">
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
              <p className="mono-label mb-1.5">A weak answer sounds like</p>
              <p className="text-[0.8125rem] leading-relaxed text-[var(--text-3)] italic">
                &ldquo;{topic.aiAwareness.weakAnswer}&rdquo;
              </p>
            </div>
            <div className="rounded-lg border border-[var(--risk-line)] bg-[var(--risk-soft)] p-3">
              <p className="mono-label mb-1.5 text-[var(--risk-text)]">Red flags</p>
              <ul className="space-y-1">
                {topic.aiAwareness.redFlags.map((r) => (
                  <li key={r} className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3">
              <p className="mono-label mb-1.5">Likely follow-up</p>
              <ul className="space-y-1">
                {topic.aiAwareness.likelyFollowUp.map((f) => (
                  <li key={f} className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* Linked interview questions */}
      {topic.interviewQuestions && topic.interviewQuestions.length > 0 && (
        <Section title="Practice these questions">
          <ul className="space-y-1.5">
            {topic.interviewQuestions.map((qid) => {
              const q = getQuestion(qid);
              if (!q) return null;
              return (
                <li key={qid}>
                  <Link
                    to={`/learning/java/interview?q=${qid}`}
                    className="group flex items-start gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 transition-colors hover:border-[var(--accent-line)]"
                  >
                    <ArrowRight size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--text-3)] group-hover:text-[var(--accent-text)]" aria-hidden="true" />
                    <span className="text-[0.8125rem] leading-snug text-[var(--text-2)]">{q.question}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Graph links */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <RelatedList label="Before learning this" ids={topic.prerequisites} />
        <RelatedList label="Related concepts" ids={topic.relatedTopics} />
        <RelatedList label="Continue learning" ids={topic.nextTopics} highlight />
      </div>

      {/* References */}
      {topic.references && topic.references.length > 0 && (
        <Section title="Learn more (official sources)">
          <ReferenceList references={topic.references} />
        </Section>
      )}
    </article>
  );
}

function Section({
  title,
  icon,
  tone = 'neutral',
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'risk' | 'ai';
  children: React.ReactNode;
}) {
  const toneColor =
    tone === 'accent'
      ? 'text-[var(--accent-text)]'
      : tone === 'risk'
        ? 'text-[var(--risk-text)]'
        : tone === 'ai'
          ? 'text-[var(--ai-text)]'
          : '';

  return (
    <section className="surface-card mt-4 p-5">
      <h2 className={cn('mono-label mb-3 flex items-center gap-1.5', toneColor)}>
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function RelatedList({ label, ids, highlight }: { label: string; ids?: string[]; highlight?: boolean }) {
  if (!ids || ids.length === 0) return null;
  return (
    <section
      className={cn(
        'surface-card p-4',
        highlight && 'border-[var(--accent-line)]',
      )}
    >
      <h2 className="mono-label mb-2.5">{label}</h2>
      <ul className="space-y-1.5">
        {ids.map((id) => {
          const t = getTopic(id);
          if (!t) return null;
          return (
            <li key={id}>
              <Link
                to={topicRoute(t.id)}
                className="group flex items-center gap-2 text-[0.8125rem] text-[var(--text-2)] hover:text-[var(--accent-text)]"
              >
                <ArrowRight size={12} strokeWidth={2} className="shrink-0 text-[var(--text-3)] group-hover:text-[var(--accent-text)]" aria-hidden="true" />
                {t.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
