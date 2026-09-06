import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, RefreshCw, X } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { VisualRenderer } from '../components/VisualRenderer';
import { Button } from '../../components/common/Button';
import { allTopics, allVisuals, getTopic, topicRoute } from '../services/registry';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';

/** Deterministic shuffle so options don't reorder on every render. */
function pickOptions(correctId: string, count = 4): string[] {
  const others = allTopics.map((t) => t.id).filter((id) => id !== correctId);
  const picked: string[] = [];
  // Simple deterministic spread based on the correct id's char codes.
  const seed = correctId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < Math.min(count - 1, others.length); i += 1) {
    picked.push(others[(seed + i * 7) % others.length]);
  }
  const unique = Array.from(new Set(picked));
  const all = [correctId, ...unique].slice(0, count);
  // Deterministic order based on seed.
  return all.sort((a, b) => ((seed + a.length) % 3) - ((seed + b.length) % 3) || a.localeCompare(b));
}

export default function VisualQuiz() {
  useLearningSeo('Identify the Concept', 'Look at a Java diagram and identify which concept it describes.');

  const quizVisuals = useMemo(() => allVisuals.filter((v) => getTopic(v.topicId)), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const visual = quizVisuals[index];
  const options = useMemo(() => (visual ? pickOptions(visual.topicId) : []), [visual]);
  const correctTopic = visual ? getTopic(visual.topicId) : undefined;

  if (!visual || !correctTopic) {
    return <div className="surface-card p-6 text-center text-sm text-[var(--text-2)]">No quiz diagrams available.</div>;
  }

  const answered = selected !== null;
  const isCorrect = selected === visual.topicId;

  const next = () => {
    setSelected(null);
    setIndex((i) => (i + 1) % quizVisuals.length);
  };

  // Hide the title/description so the diagram itself is the question.
  const anonymised = { ...visual, title: 'Which concept does this describe?', description: undefined, memoryTip: undefined };

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: 'Visual Quiz' }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">Visual quiz</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Identify the Concept</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Read the diagram, then pick the concept it describes.
        </p>
        <p className="mt-3 font-mono text-[0.75rem] text-[var(--text-3)]">
          Diagram {index + 1} / {quizVisuals.length}
        </p>
      </header>

      <div className="mt-4">
        <VisualRenderer visual={anonymised} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {options.map((id) => {
          const topic = getTopic(id);
          if (!topic) return null;
          const chosen = selected === id;
          const showAsCorrect = answered && id === visual.topicId;
          const showAsWrong = answered && chosen && id !== visual.topicId;
          return (
            <button
              key={id}
              type="button"
              disabled={answered}
              onClick={() => setSelected(id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-[0.875rem] font-medium transition-colors',
                showAsCorrect
                  ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : showAsWrong
                    ? 'border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-2)] enabled:hover:border-[var(--accent-line)]',
              )}
            >
              {showAsCorrect && <Check size={15} strokeWidth={2} aria-hidden="true" />}
              {showAsWrong && <X size={15} strokeWidth={2} aria-hidden="true" />}
              {topic.title}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="surface-card mt-4 p-5">
          <p className={cn('mono-label mb-2', isCorrect ? 'text-[var(--accent-text)]' : 'text-[var(--risk-text)]')}>
            {isCorrect ? 'Correct' : `Not quite — this is ${correctTopic.title}`}
          </p>
          <p className="text-[0.875rem] leading-relaxed text-[var(--text-2)]">{correctTopic.oneLineMeaning}</p>
          {visual.memoryTip && (
            <p className="mt-3 rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-[0.8125rem] text-[var(--accent-text)]">
              {visual.memoryTip}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" onClick={next}>
              <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
              Next diagram
            </Button>
            <Link
              to={topicRoute(correctTopic.id)}
              className="inline-flex items-center rounded-lg border border-[var(--line)] px-3 py-2 text-[0.8125rem] text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
            >
              Read the full topic
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
