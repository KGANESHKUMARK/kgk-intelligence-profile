import { motion } from 'motion/react';
import { ExternalLink, GraduationCap, Trophy } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Icon } from '../common/Icon';
import { certifications } from '../../data/certifications';
import { awards, education } from '../../data/profile';
import { toneStyle } from '../../lib/utils';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';

export function CertificationTimeline() {
  return (
    <Section id="certifications">
      <SectionHeader
        index="09"
        eyebrow="Credentials"
        title="Certifications, Education & Awards"
        description="Verified credentials across cloud, data, AI and database platforms, backed by an M.Tech in AI/ML."
      />

      <motion.ul
        variants={stagger(0.02, 0.05)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {certifications.map((c) => (
          <motion.li
            key={c.id}
            variants={fadeUp}
            style={toneStyle(c.tone)}
            className="group surface-card flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--t-line)] hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--t-line)] bg-[var(--t-soft)] text-[var(--t-fg)]">
                <Icon name={c.icon} size={17} />
              </span>
              <span className="mono-label">{c.category}</span>
            </div>

            <h3 className="mt-3.5 text-[0.9375rem] leading-snug font-semibold tracking-tight">{c.name}</h3>
            <p className="mt-1 text-xs text-[var(--t-fg)]">{c.issuer}</p>
            <p className="mt-3 flex-1 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{c.demonstrates}</p>

            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--t-fg)] underline-offset-4 hover:underline"
              >
                Verify
                <ExternalLink size={11} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {/* education */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="surface-card p-5"
        >
          <p className="mono-label mb-4 flex items-center gap-1.5">
            <GraduationCap size={12} strokeWidth={2} aria-hidden="true" />
            Education
          </p>
          <ul className="space-y-3">
            {education.map((e) => (
              <li key={e.degree} className="flex items-baseline gap-3 border-b border-[var(--line)] pb-3 last:border-0 last:pb-0">
                <span className="w-11 shrink-0 font-mono text-[0.6875rem] text-[var(--accent-text)]">{e.year}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-medium">{e.degree}</span>
                  <span className="block text-[0.6875rem] text-[var(--text-3)]">{e.institution}</span>
                </span>
                <span className="shrink-0 font-mono text-[0.6875rem] text-[var(--text-2)]">{e.score}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* awards */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          style={toneStyle('risk')}
          className="surface-card p-5"
        >
          <p className="mono-label mb-4 flex items-center gap-1.5 text-[var(--risk-text)]">
            <Trophy size={12} strokeWidth={2} aria-hidden="true" />
            Awards & Recognition
          </p>
          <ul className="space-y-3">
            {awards.map((a) => (
              <li key={a.title} className="rounded-lg border border-[var(--risk-line)] bg-[var(--risk-soft)] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[0.875rem] leading-snug font-semibold tracking-tight">{a.title}</h3>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-[var(--risk-text)]">{a.year}</span>
                </div>
                <p className="mt-1.5 text-[0.8125rem] text-[var(--text-2)]">{a.detail}</p>
                <p className="mt-1 text-[0.6875rem] text-[var(--text-3)]">{a.issuer}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}
