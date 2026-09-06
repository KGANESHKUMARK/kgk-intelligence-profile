import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Button } from '../common/Button';
import { analyseJd, type JdMatchResult } from '../../lib/jdMatch';
import { fadeUp, viewportOnce } from '../../lib/motion';
import { trackEvent } from '../../lib/analytics';

type Status = 'idle' | 'analysing' | 'done';

const SAMPLE = `Senior AI Engineer — Banking Platform
We are looking for a Senior AI Engineer to lead LLM and RAG initiatives on our
event-driven banking platform. You should have strong Java and Spring Boot
experience, Kafka, Kubernetes on AWS, and production GenAI exposure
(LangChain, RAG, Claude or equivalent). React/TypeScript front-end skills
are a plus. You will mentor engineers and own the AI roadmap end to end.`;

export function JdMatch() {
  const [jd, setJd] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<JdMatchResult | null>(null);

  const canAnalyse = jd.trim().length > 20;

  const runAnalyse = () => {
    if (!canAnalyse) return;
    setStatus('analysing');
    trackEvent('jd_analysed', { words: jd.trim().split(/\s+/).filter(Boolean).length });
    // Simulated latency so the loading state is visible; the real API call
    // will replace this. The heuristic runs client-side instantly.
    setTimeout(() => {
      setResult(analyseJd(jd));
      setStatus('done');
    }, 650);
  };

  const reset = () => {
    setJd('');
    setResult(null);
    setStatus('idle');
  };

  const matchScore = useMemo(() => {
    if (!result || result.matched.length === 0) return 0;
    const denom = result.matched.length + result.gaps.length;
    return denom === 0 ? 0 : Math.round((result.matched.length / denom) * 100);
  }, [result]);

  return (
    <Section id="jd-match" className="relative">
      <div className="relative">
        <SectionHeader
          index="11"
          eyebrow="Interactive"
          title="Paste a Job Description — See How I Match"
          description="Drop in a job description and get an instant skills match, gap and stretch analysis against this profile. This is a heuristic preview; a full LLM-backed analysis is on the roadmap."
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Input */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="surface-card flex flex-col p-5">
            <label htmlFor="jd-input" className="mono-label">
              Job description
            </label>
            <textarea
              id="jd-input"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="mt-2 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-[0.8125rem] leading-relaxed text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-3)] focus:border-[var(--accent-line)]"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={runAnalyse} disabled={!canAnalyse || status === 'analysing'}>
                {status === 'analysing' ? (
                  <Loader2 size={15} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles size={15} strokeWidth={2} aria-hidden="true" />
                )}
                {status === 'analysing' ? 'Analysing…' : 'Analyse Match'}
              </Button>
              <Button variant="outline" onClick={() => setJd(SAMPLE)}>
                Use sample JD
              </Button>
              {(jd || result) && (
                <Button variant="ghost" onClick={reset}>
                  Clear
                </Button>
              )}
              <span className="ml-auto text-[0.6875rem] text-[var(--text-3)]">
                {jd.trim() ? `${jd.trim().split(/\s+/).filter(Boolean).length} words` : 'empty'}
              </span>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="surface-card flex flex-col p-5">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center py-10 text-center"
                >
                  <Target size={28} strokeWidth={1.5} className="text-[var(--text-3)]" aria-hidden="true" />
                  <p className="mt-3 max-w-xs text-sm text-[var(--text-3)]">
                    Paste a job description on the left and run the analysis to see matched skills, gaps and stretch areas.
                  </p>
                </motion.div>
              )}

              {status === 'analysing' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center py-10 text-center"
                >
                  <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[var(--accent-text)]" aria-hidden="true" />
                  <p className="mt-3 text-sm text-[var(--text-3)]">Analysing the job description…</p>
                </motion.div>
              )}

              {status === 'done' && result && (
                <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="3"
                          strokeDasharray={`${(matchScore / 100) * 97.4} 97.4`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                        {matchScore}%
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">Match score</p>
                      <p className="text-[0.75rem] text-[var(--text-3)]">
                        {result.matched.length} matched · {result.gaps.length} gaps · {result.stretch.length} stretch signals
                      </p>
                    </div>
                  </div>

                  {/* Matched */}
                  <ResultGroup
                    icon={<CheckCircle2 size={15} strokeWidth={2} className="text-[var(--accent-text)]" aria-hidden="true" />}
                    label="Strong match"
                    tone="accent"
                    items={result.matched.map((s) => `${s.name} · ${s.level}`)}
                    empty="No direct skill matches detected."
                  />

                  {/* Gaps */}
                  <ResultGroup
                    icon={<AlertTriangle size={15} strokeWidth={2} className="text-[var(--risk-text)]" aria-hidden="true" />}
                    label="Potential gaps"
                    tone="risk"
                    items={result.gaps}
                    empty="No obvious gaps against common asks."
                  />

                  {/* Stretch */}
                  <ResultGroup
                    icon={<TrendingUp size={15} strokeWidth={2} className="text-[var(--ai-text)]" aria-hidden="true" />}
                    label="Stretch / leadership signals"
                    tone="ai"
                    items={result.stretch}
                    empty="No seniority signals found."
                  />

                  <p className="mt-4 border-t border-[var(--line)] pt-3 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
                    Heuristic preview — keyword-based, client-side. The full LLM-backed analysis (matched skills, gaps, stretch areas and suggested talking points) is on the roadmap.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

function ResultGroup({
  icon,
  label,
  items,
  empty,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  empty: string;
  tone: 'accent' | 'risk' | 'ai';
}) {
  const chipClass =
    tone === 'accent'
      ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
      : tone === 'risk'
        ? 'border-[var(--risk-line)] bg-[var(--risk-soft)] text-[var(--risk-text)]'
        : 'border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]';

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="mono-label">{label}</span>
        <span className="ml-auto text-[0.6875rem] text-[var(--text-3)]">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-[0.75rem] text-[var(--text-3)]">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((it) => (
            <li
              key={it}
              className={`rounded-md border px-2 py-1 text-[0.75rem] font-medium ${chipClass}`}
            >
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
