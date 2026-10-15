import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Code2, BookOpen, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ──────────────────────────────────────── Data model ─────────────────────── */

export interface PipelineStep {
  id: string;
  label: string;
  icon: string;                // emoji or short text rendered large
  description: string;
  detail: string;              // longer explanation shown on expand
  codeSnippet?: string;
  codeLanguage?: string;
  highlight?: string;          // key insight shown as a callout
  color: string;               // tailwind-compatible color token
}

export interface AnimatedPipelineProps {
  title: string;
  subtitle?: string;
  steps: PipelineStep[];
  /** Auto-advance interval in ms (default 4000). 0 = no auto-play. */
  autoPlayInterval?: number;
}

/* ──────────────────────────────────── Component ─────────────────────────── */

export function AnimatedPipeline({
  title,
  subtitle,
  steps,
  autoPlayInterval = 4000,
}: AnimatedPipelineProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = steps.length;
  const step = steps[activeStep];

  /* ── Auto-play logic ─────────────────────────────────────────────────── */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (isPlaying && autoPlayInterval > 0) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          const next = prev + 1;
          if (next >= totalSteps) {
            setIsPlaying(false);
            return prev;
          }
          setCompletedSteps((s) => new Set(s).add(prev));
          return next;
        });
      }, autoPlayInterval);
    }
    return clearTimer;
  }, [isPlaying, autoPlayInterval, totalSteps, clearTimer]);

  /* ── Navigation ──────────────────────────────────────────────────────── */
  const goTo = useCallback(
    (idx: number) => {
      setIsPlaying(false);
      setActiveStep(idx);
      if (idx > 0) {
        setCompletedSteps((s) => {
          const next = new Set(s);
          for (let i = 0; i < idx; i++) next.add(i);
          return next;
        });
      }
    },
    [],
  );

  const goNext = useCallback(() => {
    if (activeStep < totalSteps - 1) {
      setCompletedSteps((s) => new Set(s).add(activeStep));
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  }, [activeStep]);

  const restart = useCallback(() => {
    setActiveStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
  }, []);

  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <div className="surface-card overflow-hidden rounded-2xl border border-[var(--line)]">
      {/* ── Header + progress bar ──────────────────────────────────── */}
      <div className="relative border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-xs text-[var(--text-3)]">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-lg p-1.5 text-[var(--text-2)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={restart}
              className="rounded-lg p-1.5 text-[var(--text-2)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
              aria-label="Restart"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--line)]">
          <motion.div
            className="h-full bg-[var(--accent)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* ── Step timeline (horizontal dots) ─────────────────────── */}
      <div className="flex items-center gap-0 overflow-x-auto border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:px-6">
        {steps.map((s, i) => {
          const isActive = i === activeStep;
          const isComplete = completedSteps.has(i);
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => goTo(i)}
                className={cn(
                  'group relative flex flex-col items-center gap-1 px-2 py-1 transition-all sm:px-3',
                  isActive && 'scale-110',
                )}
                aria-label={`Step ${i + 1}: ${s.label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Icon bubble */}
                <motion.div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shadow-sm transition-colors sm:h-12 sm:w-12 sm:text-xl',
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30'
                      : isComplete
                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-[var(--surface-2)] text-[var(--text-3)] ring-1 ring-[var(--line)]',
                  )}
                  animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                  transition={isActive ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                >
                  {isComplete && !isActive ? '✓' : s.icon}
                </motion.div>
                {/* Label */}
                <span
                  className={cn(
                    'max-w-[5rem] truncate text-center text-[0.6rem] font-medium transition-colors sm:max-w-[6rem] sm:text-[0.65rem]',
                    isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-3)]',
                  )}
                >
                  {s.label}
                </span>
              </button>
              {/* Connector line */}
              {i < totalSteps - 1 && (
                <div className="relative mx-0.5 h-0.5 w-6 sm:w-10">
                  <div className="absolute inset-0 rounded-full bg-[var(--line)]" />
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
                    initial={{ width: '0%' }}
                    animate={{ width: isComplete || (isActive && i < activeStep) ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Active step detail ─────────────────────────────────── */}
      <div className="relative min-h-[320px] px-4 py-5 sm:min-h-[360px] sm:px-6 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step number + title */}
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
                {activeStep + 1}
              </div>
              <div>
                <h4 className="text-base font-semibold text-[var(--text)] sm:text-lg">{step.label}</h4>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-2)]">{step.description}</p>
              </div>
            </div>

            {/* Animated visual diagram */}
            <motion.div
              className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--accent-text)]">
                <BookOpen size={14} />
                <span>Deep Dive</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">{step.detail}</p>
            </motion.div>

            {/* Key insight callout */}
            {step.highlight && (
              <motion.div
                className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <Zap size={14} />
                  <span>Key Insight</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-amber-200/90">{step.highlight}</p>
              </motion.div>
            )}

            {/* Code snippet toggle */}
            {step.codeSnippet && (
              <div>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <Code2 size={14} />
                  {showCode ? 'Hide Code' : 'Show Code'}
                </button>
                <AnimatePresence>
                  {showCode && (
                    <motion.pre
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 overflow-x-auto rounded-xl border border-[var(--line)] bg-[#0d1117] p-4 text-xs leading-relaxed text-emerald-300"
                    >
                      <code>{step.codeSnippet}</code>
                    </motion.pre>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={activeStep === 0}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-[var(--text-3)]">
            {activeStep + 1} / {totalSteps}
          </span>
          <button
            onClick={goNext}
            disabled={activeStep === totalSteps - 1}
            className="flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent)]/90 disabled:opacity-30"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
