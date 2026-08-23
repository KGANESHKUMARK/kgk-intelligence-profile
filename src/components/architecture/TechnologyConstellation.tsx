import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Chain } from '../common/Chain';
import { skills, type Skill } from '../../data/skills';
import { projects } from '../../data/projects';
import { experience } from '../../data/experience';
import { profile } from '../../data/profile';
import { useAppState } from '../../hooks/useAppState';
import { cn, polar, prefersReducedMotion } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

const SIZE = 640;
const C = SIZE / 2;

/** Two orbital rings: core capabilities inside, supporting stack outside. */
function useConstellation() {
  return useMemo(() => {
    const core = skills.filter((s) => s.core);
    const outer = skills.filter((s) => !s.core).slice(0, 22);

    const place = (list: Skill[], radius: number, offset: number) =>
      list.map((skill, i) => ({
        skill,
        radius,
        ...polar(C, C, radius, offset + (i * 360) / list.length),
      }));

    return [...place(core, 150, 0), ...place(outer, 248, 8)];
  }, []);
}

export function TechnologyConstellation() {
  const nodes = useConstellation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { focusSkill } = useAppState();
  const reduced = prefersReducedMotion();

  const active = activeId ? skills.find((s) => s.id === activeId) : null;
  const relatedProjects = active ? projects.filter((p) => active.projects.includes(p.id)) : [];
  const relatedRoles = active ? experience.filter((e) => active.roles.includes(e.id)) : [];

  return (
    <Section id="constellation">
      <SectionHeader
        index="08"
        eyebrow="Technology Map"
        title="Technology Constellation"
        description="Every technology I work with, orbiting the centre. Inner ring is core capability. Select any node to see the projects and roles it connects to."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="surface-card ticked relative overflow-hidden p-2 sm:p-4"
        >
          <div className="relative mx-auto aspect-square w-full max-w-[640px]">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="h-full w-full"
              role="img"
              aria-label={`Technology constellation with ${nodes.length} technologies around ${profile.name}`}
            >
              <defs>
                <radialGradient id="constellation-core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx={C} cy={C} r={230} fill="url(#constellation-core)" />
              <circle cx={C} cy={C} r={150} fill="none" stroke="var(--line)" strokeDasharray="2 6" />
              <circle cx={C} cy={C} r={248} fill="none" stroke="var(--line)" strokeDasharray="2 6" />

              {/* spokes */}
              <g className={reduced ? undefined : 'animate-drift'} style={{ transformOrigin: `${C}px ${C}px`, animationDuration: '160s' }}>
                {nodes.map((n) => {
                  const isActive = n.skill.id === activeId;
                  return (
                    <line
                      key={`line-${n.skill.id}`}
                      x1={C}
                      y1={C}
                      x2={n.x}
                      y2={n.y}
                      stroke={isActive ? 'var(--accent)' : 'var(--line)'}
                      strokeWidth={isActive ? 1.4 : 0.75}
                      opacity={activeId && !isActive ? 0.2 : isActive ? 0.85 : 0.45}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* centre */}
              <g>
                <circle cx={C} cy={C} r={56} fill="var(--surface)" stroke="var(--accent-line)" strokeWidth={1.5} />
                <text
                  x={C}
                  y={C - 7}
                  textAnchor="middle"
                  className="fill-[var(--text)] font-sans text-[13px] font-semibold"
                >
                  GANESH
                </text>
                <text
                  x={C}
                  y={C + 9}
                  textAnchor="middle"
                  className="fill-[var(--text)] font-sans text-[13px] font-semibold"
                >
                  KUMAR
                </text>
                <text x={C} y={C + 26} textAnchor="middle" className="fill-[var(--text-3)] font-mono text-[8px]">
                  {skills.length} TECHNOLOGIES
                </text>
              </g>

              {/* nodes */}
              {nodes.map((n) => {
                const isActive = n.skill.id === activeId;
                const dim = Boolean(activeId) && !isActive;
                const w = Math.max(46, n.skill.name.length * 6.4 + 14);
                return (
                  <g
                    key={n.skill.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.skill.name} — ${n.skill.category}`}
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveId(n.skill.id)}
                    onFocus={() => setActiveId(n.skill.id)}
                    onClick={() => setActiveId(isActive ? null : n.skill.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveId(isActive ? null : n.skill.id);
                      }
                    }}
                    className="cursor-pointer outline-none transition-opacity duration-300"
                    style={{ opacity: dim ? 0.28 : 1 }}
                  >
                    <rect
                      x={n.x - w / 2}
                      y={n.y - 11}
                      width={w}
                      height={22}
                      rx={5}
                      fill={isActive ? 'var(--accent-soft)' : 'var(--surface-2)'}
                      stroke={isActive ? 'var(--accent)' : n.skill.core ? 'var(--line-strong)' : 'var(--line)'}
                      strokeWidth={isActive ? 1.4 : 1}
                      className="transition-all duration-200"
                    />
                    <text
                      x={n.x}
                      y={n.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        'pointer-events-none font-mono text-[9.5px] transition-colors duration-200',
                        isActive ? 'fill-[var(--accent-text)]' : 'fill-[var(--text-2)]',
                      )}
                    >
                      {n.skill.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="mt-1 text-center text-[0.6875rem] text-[var(--text-3)]">
            Inner ring: core capability · Outer ring: supporting stack
          </p>
        </motion.div>

        {/* drill-down */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="surface-card p-5"
              aria-live="polite"
            >
              <p className="mono-label">{active.category}</p>
              <h3 className="mt-1.5 font-mono text-lg font-semibold tracking-tight">{active.name}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{active.context}</p>

              <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
                <Chain steps={active.chain} compact tone={active.category === 'GenAI' ? 'ai' : 'accent'} />
              </div>

              {relatedProjects.length > 0 && (
                <div className="mt-4">
                  <p className="mono-label mb-2">Projects · {relatedProjects.length}</p>
                  <ul className="space-y-1">
                    {relatedProjects.map((p) => (
                      <li key={p.id} className="text-[0.8125rem] text-[var(--text-2)]">
                        {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatedRoles.length > 0 && (
                <div className="mt-4">
                  <p className="mono-label mb-2">Roles · {relatedRoles.length}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {relatedRoles.map((r) => (
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

              <button
                type="button"
                onClick={() => focusSkill(active.id)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-xs font-medium text-[var(--accent-text)] transition-colors hover:brightness-125"
              >
                Open in Skills Explorer
                <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
              </button>
            </motion.div>
          ) : (
            <div className="surface-card p-5">
              <p className="mono-label">Drill-down</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
                Hover or select any technology to see the capability chain, the projects it was used on and the
                roles it belongs to.
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4">
                {[
                  { label: 'Technologies', value: skills.length },
                  { label: 'Projects', value: projects.length },
                  { label: 'Roles', value: experience.length },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="mono-label">{s.label}</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold text-[var(--accent-text)]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
