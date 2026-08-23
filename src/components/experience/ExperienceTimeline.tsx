import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Briefcase, ChevronDown, MapPin, Target, Trophy } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { TechPill } from '../common/Badge';
import { experience, type Experience } from '../../data/experience';
import { cn } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

export function ExperienceTimeline() {
  // Current role starts expanded — it is what an interviewer reads first.
  const [openIds, setOpenIds] = useState<string[]>([experience[0].id]);

  const toggle = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Section id="experience">
      <SectionHeader
        index="03"
        eyebrow="Career"
        title="Engineering Journey"
        description="Four roles, thirteen years, one continuous line from embedded systems to production AI inside global banks."
      />

      <ol className="relative">
        {/* spine */}
        <span
          className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-[var(--accent-line)] via-[var(--line-strong)] to-transparent md:left-[9px]"
          aria-hidden="true"
        />

        {experience.map((role, i) => (
          <ExperienceCard
            key={role.id}
            role={role}
            open={openIds.includes(role.id)}
            onToggle={() => toggle(role.id)}
            delay={i * 0.05}
          />
        ))}
      </ol>
    </Section>
  );
}

function ExperienceCard({
  role,
  open,
  onToggle,
  delay,
}: {
  role: Experience;
  open: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const panelId = `exp-panel-${role.id}`;

  return (
    <motion.li
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
      className="relative pb-3 pl-8 last:pb-0 md:pl-10"
    >
      {/* node */}
      <span
        className={cn(
          'absolute top-5 left-0 z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 md:h-[19px] md:w-[19px]',
          role.current
            ? 'border-[var(--accent)] bg-[var(--bg)]'
            : 'border-[var(--line-strong)] bg-[var(--surface-2)]',
        )}
        aria-hidden="true"
      >
        {role.current && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] md:h-2 md:w-2" />}
      </span>
      {role.current && (
        <span
          className="absolute top-5 left-0 h-[15px] w-[15px] animate-pulse-ring rounded-full bg-[var(--accent)] md:h-[19px] md:w-[19px]"
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'surface-card overflow-hidden transition-colors duration-200',
          role.current && 'border-[var(--accent-line)]',
          open && 'shadow-[var(--shadow-lift)]',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group w-full px-4 py-4 text-left sm:px-5 sm:py-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold tracking-tight sm:text-[1.0625rem]">{role.company}</h3>
                {role.current && (
                  <span className="rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-wider text-[var(--accent-text)] uppercase">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[var(--accent-text)]">{role.role}</p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-[var(--text-3)]">
                <span className="font-mono">{role.period}</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} strokeWidth={1.75} aria-hidden="true" />
                  {role.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={11} strokeWidth={1.75} aria-hidden="true" />
                  {role.domain}
                </span>
              </div>
            </div>

            <span
              className={cn(
                'mt-0.5 shrink-0 rounded-lg border border-[var(--line)] p-1.5 text-[var(--text-3)] transition-all duration-200',
                'group-hover:border-[var(--line-strong)] group-hover:text-[var(--text)]',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            >
              <ChevronDown size={15} strokeWidth={2} />
            </span>
          </div>

          {!open && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {role.headlineTech.map((t) => (
                <TechPill key={t}>{t}</TechPill>
              ))}
            </div>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-sm leading-relaxed text-[var(--text-2)]">{role.summary}</p>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="mono-label mb-2.5 flex items-center gap-1.5">
                      <Target size={12} strokeWidth={2} aria-hidden="true" />
                      Responsibilities
                    </p>
                    <ul className="space-y-1.5">
                      {role.responsibilities.map((r) => (
                        <li key={r} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--line-strong)]" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mono-label mb-2.5 flex items-center gap-1.5 text-[var(--accent-text)]">
                      <Trophy size={12} strokeWidth={2} aria-hidden="true" />
                      Key Achievements
                    </p>
                    <ul className="space-y-1.5">
                      {role.achievements.map((a) => (
                        <li key={a} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text)]">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mono-label mb-2.5">Technologies · {role.technologies.length}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.technologies.map((t) => (
                      <TechPill key={t}>{t}</TechPill>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
