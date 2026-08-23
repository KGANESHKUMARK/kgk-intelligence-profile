import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Chain } from '../common/Chain';
import type { Skill } from '../../data/skills';
import { projects } from '../../data/projects';
import { experience } from '../../data/experience';
import { scrollToSection } from '../../lib/utils';
import { EASE } from '../../lib/motion';

export function SkillDetail({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const usedIn = projects.filter((p) => skill.projects.includes(p.id));
  const roles = experience.filter((e) => skill.roles.includes(e.id));
  const tone = skill.category === 'GenAI' || skill.category === 'AI / ML' ? 'ai' : 'accent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: EASE }}
      className="surface-card ticked p-5"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mono-label">{skill.category}</p>
          <h3 className="mt-1.5 font-mono text-lg font-semibold tracking-tight">{skill.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${skill.name} details`}
          className="-mt-1 -mr-1 shrink-0 rounded-lg p-1.5 text-[var(--text-3)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{skill.context}</p>

      <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
        <p className="mono-label mb-3">Technology → Experience</p>
        <Chain steps={skill.chain} tone={tone} compact />
      </div>

      {usedIn.length > 0 && (
        <div className="mt-4">
          <p className="mono-label mb-2">Used On</p>
          <ul className="space-y-1">
            {usedIn.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection('projects')}
                  className="group flex w-full items-baseline gap-2 rounded px-1 py-1 text-left transition-colors hover:bg-[var(--surface-2)]"
                >
                  <span className="text-[0.8125rem] text-[var(--text)] group-hover:text-[var(--accent-text)]">
                    {p.name}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[0.625rem] text-[var(--text-3)]">
                    {p.company.replace('Bank of ', '')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {roles.length > 0 && (
        <div className="mt-4">
          <p className="mono-label mb-2">Roles</p>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <span
                key={r.id}
                className="rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-1 text-[0.6875rem] text-[var(--text-2)]"
              >
                {r.company}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
        <span className="mono-label">Level</span>
        <span className="font-mono text-[0.6875rem] tracking-wide text-[var(--accent-text)] uppercase">
          {skill.level}
        </span>
      </div>
    </motion.div>
  );
}
