import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Clock,
  Download,
  Layers,
  Play,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { Button, LinkButton } from '../common/Button';
import { useProfileUrl } from '../../hooks/useProfileUrl';
import { ninetySecondProfile, storySteps } from '../../data/interviewTopics';
import { profile } from '../../data/profile';
import { projects } from '../../data/projects';
import { useAppState } from '../../hooks/useAppState';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

type View = 'snapshot' | 'story';

export function InterviewMode() {
  const { interviewMode, setInterviewMode } = useAppState();
  const [view, setView] = useState<View>('snapshot');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!interviewMode) return;
    setView('snapshot');
    setStep(0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [interviewMode]);

  useEffect(() => {
    if (!interviewMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInterviewMode(false);
      if (view !== 'story') return;
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, storySteps.length - 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [interviewMode, view, setInterviewMode]);

  return createPortal(
    <AnimatePresence>
      {interviewMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label="Interview Mode"
          className="fixed inset-0 z-[95] overflow-y-auto bg-[var(--bg)]"
        >
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

          {/* header */}
          <div className="sticky top-0 z-10 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-[1100px] items-center gap-3 px-4 sm:px-6">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-[var(--accent)]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                <span className="mono-label text-[var(--accent-text)]">Interview Mode</span>
              </span>

              <div className="mx-auto flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1">
                {(['snapshot', 'story'] as View[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    className={cn(
                      'relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      view === v ? 'text-[var(--bg)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
                    )}
                  >
                    {view === v && (
                      <motion.span
                        layoutId="interview-tab"
                        transition={{ duration: 0.24, ease: EASE }}
                        className="absolute inset-0 -z-10 rounded-md bg-[var(--accent)]"
                      />
                    )}
                    {v === 'snapshot' ? '90 Second Profile' : 'Tell My Story'}
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => setInterviewMode(false)} aria-label="Exit interview mode">
                <X size={14} strokeWidth={2} aria-hidden="true" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:py-10">
            <AnimatePresence mode="wait">
              {view === 'snapshot' ? (
                <SnapshotView key="snapshot" onStartStory={() => setView('story')} />
              ) : (
                <StoryView key="story" step={step} setStep={setStep} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------------------------------------- 90 seconds */

function SnapshotView({ onStartStory }: { onStartStory: () => void }) {
  const url = useProfileUrl();
  const keyProjects = projects.filter((p) => ninetySecondProfile.projectIds.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="space-y-4"
    >
      {/* hero card */}
      <div className="surface-card ticked p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mono-label">60-Second Introduction</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h2>
            <p className="mt-1 text-[var(--accent-text)]">{ninetySecondProfile.currentRole}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-center">
              <span className="block font-mono text-lg font-semibold text-[var(--accent-text)]">
                {profile.yearsExperience}
              </span>
              <span className="mono-label text-[0.5625rem]">years</span>
            </span>
            {url && (
              <span className="hidden rounded-lg border border-[var(--line)] bg-white p-1.5 sm:block">
                <QRCodeSVG value={url} size={54} level="M" bgColor="#ffffff" fgColor="#08090c" aria-label="Profile QR code" />
              </span>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text-2)] sm:text-[0.9375rem]">{profile.elevator}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={onStartStory}>
            <Play size={15} strokeWidth={2} aria-hidden="true" />
            Start 90-second overview
          </Button>
          <LinkButton href={profile.resumeFile} download variant="secondary">
            <Download size={15} strokeWidth={2} aria-hidden="true" />
            Download Resume
          </LinkButton>
        </div>
      </div>

      {/* strengths */}
      <Panel icon={<Sparkles size={13} strokeWidth={2} />} label="My Core Strengths">
        <ul className="grid gap-2 sm:grid-cols-2">
          {ninetySecondProfile.coreStrengths.map((s, i) => (
            <li
              key={s}
              className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3"
            >
              <span className="mt-0.5 shrink-0 font-mono text-[0.625rem] text-[var(--accent-text)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{s}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon={<Layers size={13} strokeWidth={2} />} label="Key Technologies">
          <div className="flex flex-wrap gap-1.5">
            {ninetySecondProfile.topTechnologies.map((t) => (
              <span
                key={t}
                className="rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2.5 py-1.5 font-mono text-xs text-[var(--accent-text)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 mono-label mb-2">Domain</p>
          <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{ninetySecondProfile.domain}</p>
        </Panel>

        <Panel icon={<BrainCircuit size={13} strokeWidth={2} />} label="AI Expertise" tone="ai">
          <ul className="space-y-1.5">
            {ninetySecondProfile.aiExpertise.map((a) => (
              <li key={a} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--ai)]" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel icon={<Layers size={13} strokeWidth={2} />} label="Key Projects">
        <ul className="grid gap-2.5 md:grid-cols-3">
          {keyProjects.map((p) => (
            <li key={p.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
              <p className="mono-label">{p.company.replace('Bank of ', '')}</p>
              <h4 className="mt-1.5 text-[0.875rem] leading-snug font-semibold tracking-tight">{p.name}</h4>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-[var(--text-3)]">{p.blurb}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel icon={<Layers size={13} strokeWidth={2} />} label="Architecture Expertise">
        <ul className="grid gap-2 sm:grid-cols-2">
          {ninetySecondProfile.architectureExpertise.map((a) => (
            <li key={a} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </Panel>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- story */

function StoryView({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  const current = storySteps[step];
  const isFirst = step === 0;
  const isLast = step === storySteps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      {/* progress rail */}
      <ol className="mb-5 flex gap-1.5" aria-label="Story progress">
        {storySteps.map((s, i) => (
          <li key={s.id} className="flex-1">
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'h-1 w-full rounded-full transition-colors duration-300',
                i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]',
              )}
            />
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.article
          key={current.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="surface-card ticked p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] font-mono text-sm font-semibold text-[var(--accent-text)]">
              {step + 1}
            </span>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{current.title}</h2>
            <span className="ml-auto flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[0.6875rem] text-[var(--text-3)]">
              <Clock size={11} strokeWidth={1.75} aria-hidden="true" />
              {current.duration}
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-[var(--text)] sm:text-lg sm:leading-relaxed">
            {current.script}
          </p>

          <div className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <p className="mono-label mb-3">Talking points</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {current.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={isFirst}>
          <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
          Previous
        </Button>

        <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-[var(--text-3)]">
          <Timer size={12} strokeWidth={1.75} aria-hidden="true" />
          Step {step + 1} / {storySteps.length}
        </span>

        <Button
          variant={isLast ? 'secondary' : 'primary'}
          onClick={() => setStep(Math.min(storySteps.length - 1, step + 1))}
          disabled={isLast}
        >
          Next
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>

      <p className="mt-3 text-center text-[0.6875rem] text-[var(--text-3)]">
        Use ← and → to move between steps · Esc to exit
      </p>
    </motion.div>
  );
}

function Panel({
  icon,
  label,
  tone = 'accent',
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'accent' | 'ai';
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-5">
      <p
        className="mono-label mb-3.5 flex items-center gap-1.5"
        style={{ color: tone === 'ai' ? 'var(--ai-text)' : 'var(--accent-text)' }}
      >
        {icon}
        {label}
      </p>
      {children}
    </section>
  );
}
