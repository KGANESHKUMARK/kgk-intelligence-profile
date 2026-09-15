import { motion } from 'motion/react';
import { GitCommit, Wrench, Bug, FileText, Server, ExternalLink } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { changelog, commitUrl, type ChangeType } from '../../data/changelog';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';

const typeMeta: Record<ChangeType, { icon: typeof GitCommit; label: string; tone: string }> = {
  feature: { icon: Wrench, label: 'Feature', tone: 'var(--accent)' },
  fix: { icon: Bug, label: 'Fix', tone: 'var(--risk)' },
  content: { icon: FileText, label: 'Content', tone: 'var(--ai)' },
  infra: { icon: Server, label: 'Infra', tone: 'var(--accent)' },
};

export function Changelog() {
  return (
    <Section id="changelog" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-full blur-[120px] opacity-40"
          style={{ background: 'var(--glow)' }}
        />
      </div>

      <div className="relative">
        <SectionHeader
          index="15"
          eyebrow="Release History"
          title="What's Been Shipped"
          description="Every feature, fix and content update released on this profile — from the initial launch to the latest push. This is the public build history of the site itself."
        />

        <motion.ol
          variants={stagger(0.05, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative mx-auto max-w-3xl"
        >
          {/* vertical spine */}
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--line)] sm:left-[19px]"
          />

          {changelog.map((entry) => {
            const meta = typeMeta[entry.type];
            const Icon = meta.icon;
            const url = commitUrl(entry.commit);

            return (
              <motion.li
                key={entry.version}
                variants={fadeUp}
                className="relative pl-10 pb-8 sm:pl-14"
              >
                {/* node */}
                <span
                  className="absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border bg-[var(--surface)] sm:h-10 sm:w-10"
                  style={{ borderColor: meta.tone, color: meta.tone }}
                  aria-hidden="true"
                >
                  <Icon size={14} strokeWidth={2} />
                </span>

                <div className="surface-card ticked p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-mono text-sm font-semibold text-[var(--text)]">
                      v{entry.version}
                    </span>
                    <span
                      className="rounded border px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-wide"
                      style={{ borderColor: meta.tone, color: meta.tone, background: 'var(--surface-2)' }}
                    >
                      {meta.label}
                    </span>
                    <time className="font-mono text-[0.6875rem] text-[var(--text-3)]">
                      {new Date(entry.date).toLocaleDateString('en-SG', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 font-mono text-[0.625rem] text-[var(--text-3)] transition-colors hover:text-[var(--accent-text)]"
                        aria-label={`View commit ${entry.commit} on GitHub`}
                      >
                        <GitCommit size={11} strokeWidth={1.75} aria-hidden="true" />
                        {entry.commit}
                        <ExternalLink size={10} strokeWidth={1.75} aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  <h3 className="mt-2 text-[0.9375rem] font-semibold tracking-tight text-[var(--text)]">
                    {entry.title}
                  </h3>

                  {entry.summary && (
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                      {entry.summary}
                    </p>
                  )}

                  {entry.changes.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {entry.changes.map((c, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ background: meta.tone }}
                          />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </Section>
  );
}
