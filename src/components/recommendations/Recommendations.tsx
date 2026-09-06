import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { recommendations } from '../../data/recommendations';
import { toneStyle } from '../../lib/utils';
import { fadeUp, stagger, viewportOnce } from '../../lib/motion';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Recommendations() {
  if (recommendations.length === 0) return null;

  return (
    <Section id="recommendations" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[120px]"
          style={{ background: 'var(--glow)' }}
        />
      </div>

      <div className="relative">
        <SectionHeader
          index="12"
          eyebrow="Recommendations"
          title="What People Say"
          description="Recommendations from managers, peers and colleagues — copied from LinkedIn."
        />

        <motion.div
          variants={stagger()}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {recommendations.map((r) => (
            <motion.article
              key={r.id}
              variants={fadeUp}
              className="surface-card flex flex-col p-5"
            >
              <Quote
                size={22}
                strokeWidth={1.5}
                className="text-[var(--text-3)]"
                aria-hidden="true"
              />
              <blockquote className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
                {r.quote}
              </blockquote>

              <footer className="mt-5 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[0.8125rem] font-semibold"
                  style={{
                    ...toneStyle(r.tone),
                    borderColor: 'var(--t-line)',
                    background: 'var(--t-soft)',
                    color: 'var(--t-fg)',
                  }}
                  aria-hidden="true"
                >
                  {initials(r.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--text)]">{r.name}</span>
                  <span className="mt-0.5 block truncate text-[0.75rem] text-[var(--text-3)]">
                    {r.title} · {r.company}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-right">
                  <span className="mono-label block">{r.relationship}</span>
                  <span className="mt-0.5 block text-[0.6875rem] text-[var(--text-3)]">{r.date}</span>
                </span>
              </footer>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
