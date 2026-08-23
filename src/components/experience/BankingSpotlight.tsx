import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Landmark } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { TechPill } from '../common/Badge';
import { bankingFlow } from '../../data/experience';
import { projects } from '../../data/projects';
import { cn, prefersReducedMotion } from '../../lib/utils';
import { EASE, fadeUp, stagger, viewportOnce } from '../../lib/motion';

const assetClasses = ['Equities', 'Securities', 'FX', 'Derivatives', 'Precious Metals'];
const bankingProjectIds = ['gom', 'newton-performance', 'newton-client-reporting', 'newton-ptm'];

export function BankingSpotlight() {
  const [activeId, setActiveId] = useState(bankingFlow[0].id);
  const active = bankingFlow.find((s) => s.id === activeId) ?? bankingFlow[0];
  const reduced = prefersReducedMotion();
  const bankingProjects = projects.filter((p) => bankingProjectIds.includes(p.id));

  return (
    <Section id="banking" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="dot-bg absolute inset-0 opacity-60" />
      </div>

      <div className="relative">
        <SectionHeader
          index="04"
          eyebrow="Domain Depth"
          title="Banking & Capital Markets Engineering"
          description="Five and a half years at Bank of New York on the Newton / Aladdin estate, now leading Global Output Management at Bank of Julius Baer. This is the data path I work on every day."
        />

        {/* asset classes */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-6 flex flex-wrap items-center gap-2"
        >
          <span className="mono-label mr-1 flex items-center gap-1.5">
            <Landmark size={12} strokeWidth={2} aria-hidden="true" />
            Asset Classes
          </span>
          {assetClasses.map((a) => (
            <span
              key={a}
              className="rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent-text)]"
            >
              {a}
            </span>
          ))}
        </motion.div>

        {/* flow */}
        <div className="surface-card ticked p-4 sm:p-6">
          <p className="mono-label mb-4">Processing Flow — select a stage</p>

          <motion.ol
            variants={stagger(0.02, 0.05)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid gap-2 md:grid-cols-6 md:gap-0"
          >
            {bankingFlow.map((stage, i) => {
              const isActive = stage.id === activeId;
              const isLast = i === bankingFlow.length - 1;
              return (
                <motion.li key={stage.id} variants={fadeUp} className="relative flex items-stretch md:block">
                  <button
                    type="button"
                    onClick={() => setActiveId(stage.id)}
                    onMouseEnter={() => setActiveId(stage.id)}
                    aria-pressed={isActive}
                    className={cn(
                      'relative z-10 flex w-full flex-col justify-start gap-1.5 rounded-lg border p-3 text-left transition-all duration-200 md:mx-1 md:min-h-[104px]',
                      isActive
                        ? 'border-[var(--accent-line)] bg-[var(--accent-soft)]'
                        : 'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)]',
                    )}
                  >
                    <span
                      className={cn(
                        'font-mono text-[0.5625rem] tracking-widest uppercase',
                        isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-3)]',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-[0.8125rem] leading-snug font-medium',
                        isActive ? 'text-[var(--text)]' : 'text-[var(--text-2)]',
                      )}
                    >
                      {stage.label}
                    </span>
                  </button>

                  {/* connectors */}
                  {!isLast && (
                    <>
                      <span
                        className="absolute top-1/2 -right-1 hidden -translate-y-1/2 text-[var(--line-strong)] md:block"
                        aria-hidden="true"
                      >
                        <ArrowRight size={12} strokeWidth={2} />
                      </span>
                      <span
                        className="absolute -bottom-1.5 left-6 h-1.5 w-px bg-[var(--line-strong)] md:hidden"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>

          {/* animated flow line */}
          {!reduced && (
            <div className="relative mt-3 hidden h-px overflow-hidden md:block" aria-hidden="true">
              <div className="absolute inset-0 bg-[var(--line)]" />
              <motion.div
                className="absolute top-0 h-px w-24 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
                animate={{ x: ['-10%', '110%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-4"
            aria-live="polite"
          >
            <h3 className="text-sm font-semibold tracking-tight text-[var(--accent-text)]">{active.label}</h3>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{active.detail}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {active.tech.map((t) => (
                <TechPill key={t}>{t}</TechPill>
              ))}
            </div>
          </motion.div>
        </div>

        {/* banking products */}
        <div className="mt-6">
          <p className="mono-label mb-3">Banking Products Delivered</p>
          <motion.ul
            variants={stagger(0.02, 0.05)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {bankingProjects.map((p) => (
              <motion.li
                key={p.id}
                variants={fadeUp}
                className="surface-card group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
              >
                <p className="mono-label">{p.company.replace('Bank of ', '')}</p>
                <h4 className="mt-2 text-[0.875rem] leading-snug font-semibold tracking-tight">{p.name}</h4>
                <p className="mt-2 text-[0.75rem] leading-relaxed text-[var(--text-3)]">{p.subtitle}</p>
                <p className="mt-3 font-mono text-[0.625rem] text-[var(--text-3)]">{p.period}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </Section>
  );
}
