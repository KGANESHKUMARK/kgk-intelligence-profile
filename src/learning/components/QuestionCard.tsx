import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Brain, ChevronRight, Code2, Eye, Target } from 'lucide-react';
import type { AnswerLevel, InterviewQuestion } from '../types';
import { AnswerLevelTabs } from './AnswerLevelTabs';
import { LearningTerm } from './LearningTerm';
import { Button } from '../../components/common/Button';
import { getQuestion } from '../services/registry';
import { useLearningProgress, type Confidence } from '../hooks/useLearningProgress';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

const CONFIDENCE_OPTIONS: { id: Confidence; label: string }[] = [
  { id: 'unknown', label: "Didn't know" },
  { id: 'partial', label: 'Partial' },
  { id: 'good', label: 'Good' },
  { id: 'strong', label: 'Strong' },
];

export function QuestionCard({
  question,
  index,
  total,
  onSelectFollowUp,
}: {
  question: InterviewQuestion;
  index?: number;
  total?: number;
  onSelectFollowUp?: (questionId: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [level, setLevel] = useState<AnswerLevel>('interview');
  const [showCode, setShowCode] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const { questionConfidence, setQuestionConfidence } = useLearningProgress();

  // Reset the card whenever a different question is shown.
  useEffect(() => {
    setRevealed(false);
    setLevel('interview');
    setShowCode(false);
    setShowIntent(false);
  }, [question.id]);

  const answer =
    level === 'quick'
      ? question.quickAnswer
      : level === 'interview'
        ? question.interviewAnswer
        : level === 'detailed'
          ? question.detailedAnswer
          : question.seniorAnswer;

  const confidence = questionConfidence[question.id];

  return (
    <article className="surface-card ticked p-5 sm:p-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">{question.category}</span>
          <span className="mono-label rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.5625rem]">
            {question.difficulty}
          </span>
          {typeof index === 'number' && typeof total === 'number' && (
            <span className="ml-auto font-mono text-[0.6875rem] text-[var(--text-3)]">
              Question {index + 1} / {total}
            </span>
          )}
        </div>
        <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight sm:text-xl">{question.question}</h3>
      </header>

      {!revealed ? (
        <div className="mt-5">
          <p className="text-[0.8125rem] leading-relaxed text-[var(--text-3)]">
            Think through your answer out loud first — then reveal to compare.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setRevealed(true)}>
              <Eye size={15} strokeWidth={2} aria-hidden="true" />
              Reveal answer
            </Button>
            <Button variant="outline" onClick={() => setShowIntent((v) => !v)}>
              <Target size={15} strokeWidth={2} aria-hidden="true" />
              What&apos;s being tested?
            </Button>
          </div>

          <AnimatePresence>
            {showIntent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <IntentPanel question={question} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-5">
          <AnswerLevelTabs value={level} onChange={setLevel} idPrefix={question.id} />

          <div id={`${question.id}-answer-panel`} role="tabpanel" className="mt-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={level}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="text-[0.9375rem] leading-relaxed text-[var(--text-2)]"
              >
                {answer}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Key terms */}
          {question.keyTerms.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="mono-label mr-1">Key terms</span>
              {question.keyTerms.map((term) => (
                <span key={term} className="text-[0.8125rem]">
                  <LearningTerm term={term} />
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowIntent((v) => !v)}>
              <Target size={14} strokeWidth={2} aria-hidden="true" />
              {showIntent ? 'Hide' : 'What\u2019s being tested?'}
            </Button>
            {question.codeExample && (
              <Button variant="outline" size="sm" onClick={() => setShowCode((v) => !v)}>
                <Code2 size={14} strokeWidth={2} aria-hidden="true" />
                {showCode ? 'Hide code' : 'Show code'}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showIntent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <IntentPanel question={question} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCode && question.codeExample && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <CodeBlock code={question.codeExample} output={question.expectedOutput} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common mistakes */}
          {question.commonMistakes && question.commonMistakes.length > 0 && (
            <div className="mt-4 rounded-lg border border-[var(--risk-line)] bg-[var(--risk-soft)] p-3.5">
              <p className="mono-label mb-2 flex items-center gap-1.5 text-[var(--risk-text)]">
                <AlertTriangle size={12} strokeWidth={2} aria-hidden="true" />
                Common mistakes
              </p>
              <ul className="space-y-1">
                {question.commonMistakes.map((m) => (
                  <li key={m} className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Self assessment */}
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className="mono-label mb-2">How did you do?</p>
            <div className="flex flex-wrap gap-1.5">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQuestionConfidence(question.id, opt.id)}
                  aria-pressed={confidence === opt.id}
                  className={cn(
                    'rounded-md border px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors',
                    confidence === opt.id
                      ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                      : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text-2)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.6875rem] text-[var(--text-3)]">
              Saved locally to guide your own revision — not an objective score.
            </p>
          </div>

          {/* Follow-up chain */}
          {question.followUps && question.followUps.length > 0 && (
            <div className="mt-5 border-t border-[var(--line)] pt-4">
              <p className="mono-label mb-2">Likely follow-up questions</p>
              <ul className="space-y-1.5">
                {question.followUps.map((fid) => {
                  const follow = getQuestion(fid);
                  if (!follow) return null;
                  return (
                    <li key={fid}>
                      <button
                        type="button"
                        onClick={() => onSelectFollowUp?.(fid)}
                        disabled={!onSelectFollowUp}
                        className="group flex w-full items-start gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-left transition-colors enabled:hover:border-[var(--accent-line)] disabled:opacity-70"
                      >
                        <ChevronRight
                          size={13}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-[var(--text-3)] group-enabled:group-hover:text-[var(--accent-text)]"
                          aria-hidden="true"
                        />
                        <span className="text-[0.8125rem] leading-snug text-[var(--text-2)]">{follow.question}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function IntentPanel({ question }: { question: InterviewQuestion }) {
  return (
    <div className="mt-3 rounded-lg border border-[var(--ai-line)] bg-[var(--ai-soft)] p-3.5">
      <p className="mono-label mb-2 flex items-center gap-1.5 text-[var(--ai-text)]">
        <Brain size={12} strokeWidth={2} aria-hidden="true" />
        What the interviewer is testing
      </p>
      {question.interviewerIntent && (
        <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{question.interviewerIntent}</p>
      )}
      {question.whatIsBeingTested && question.whatIsBeingTested.length > 0 && (
        <ul className="mt-2 space-y-1">
          {question.whatIsBeingTested.map((t) => (
            <li key={t} className="flex gap-2 text-[0.8125rem] text-[var(--text-2)]">
              <span className="text-[var(--ai-text)]" aria-hidden="true">
                &#10003;
              </span>
              {t}
            </li>
          ))}
        </ul>
      )}
      {question.strongAnswerKeywords && question.strongAnswerKeywords.length > 0 && (
        <div className="mt-3">
          <p className="mono-label mb-1.5">A strong answer usually mentions</p>
          <div className="flex flex-wrap gap-1.5">
            {question.strongAnswerKeywords.map((k) => (
              <span
                key={k}
                className="rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CodeBlock({ code, output }: { code: string; output?: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-[var(--line)]">
      <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5">
        <span className="mono-label">Java</span>
      </div>
      <pre className="overflow-x-auto bg-[var(--surface)] p-3.5 font-mono text-[0.75rem] leading-relaxed text-[var(--text-2)]">
        <code>{code}</code>
      </pre>
      {output && (
        <>
          <div className="border-y border-[var(--line)] bg-[var(--surface-2)] px-3 py-1.5">
            <span className="mono-label">Output</span>
          </div>
          <pre className="overflow-x-auto bg-[var(--surface)] p-3.5 font-mono text-[0.75rem] leading-relaxed text-[var(--accent-text)]">
            <code>{output}</code>
          </pre>
        </>
      )}
    </div>
  );
}
