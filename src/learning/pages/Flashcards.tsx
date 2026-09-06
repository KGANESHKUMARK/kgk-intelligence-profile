import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { Button } from '../../components/common/Button';
import { allTopics, topicRoute } from '../services/registry';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

/**
 * Flashcards are derived from existing topic data (memory tip + interview
 * answer + key terms) rather than duplicated into a separate content set —
 * so they can never drift out of sync with the topic pages.
 */
export default function Flashcards() {
  useLearningSeo('Java Visual Flashcards', 'Rapid-revision flashcards derived from the Java topic library.');

  const cards = useMemo(() => allTopics.filter((t) => t.interviewAnswer || t.memoryTip), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { flashcardStatus, setFlashcardStatus } = useLearningProgress();

  const card = cards[index];
  const knownCount = Object.values(flashcardStatus).filter((s) => s === 'known').length;

  const go = (next: number) => {
    setIndex(Math.max(0, Math.min(next, cards.length - 1)));
    setFlipped(false);
  };

  if (!card) {
    return <div className="surface-card p-6 text-center text-sm text-[var(--text-2)]">No flashcards available.</div>;
  }

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: 'Flashcards' }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">5-minute revision</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Java Visual Flashcards</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Recall first, flip second. Progress is stored locally on this device.
        </p>
        <p className="mt-3 font-mono text-[0.75rem] text-[var(--text-3)]">
          Card {index + 1} / {cards.length} · marked known: {knownCount}
        </p>
      </header>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="surface-card ticked flex min-h-[280px] w-full flex-col items-center justify-center p-6 text-center transition-colors hover:border-[var(--accent-line)]"
          aria-label={flipped ? 'Show question side' : 'Reveal answer side'}
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateX: -8 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 8 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <p className="mono-label">{card.category}</p>
                <p className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">What is {card.title}?</p>
                <p className="mt-4 text-[0.75rem] text-[var(--text-3)]">Tap to reveal</p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateX: 8 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: -8 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="w-full"
              >
                <p className="mono-label text-[var(--accent-text)]">{card.title}</p>
                {card.memoryTip && (
                  <p className="mt-3 text-base font-semibold text-[var(--accent-text)]">{card.memoryTip}</p>
                )}
                <p className="mx-auto mt-4 max-w-2xl text-[0.875rem] leading-relaxed text-[var(--text-2)]">
                  {card.interviewAnswer ?? card.oneLineMeaning}
                </p>
                {card.keyTerms && card.keyTerms.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {card.keyTerms.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => go(index - 1)} disabled={index === 0}>
          <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
          Previous
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={flashcardStatus[card.id] === 'known' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFlashcardStatus(card.id, 'known')}
          >
            <Check size={14} strokeWidth={2} aria-hidden="true" />
            Known
          </Button>
          <Button
            variant={flashcardStatus[card.id] === 'review' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFlashcardStatus(card.id, 'review')}
          >
            <RotateCcw size={14} strokeWidth={2} aria-hidden="true" />
            Review again
          </Button>
          <Link
            to={topicRoute(card.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-[0.8125rem]',
              'text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]',
            )}
          >
            Full topic
          </Link>
        </div>

        <Button variant="primary" onClick={() => go(index + 1)} disabled={index >= cards.length - 1}>
          Next
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
