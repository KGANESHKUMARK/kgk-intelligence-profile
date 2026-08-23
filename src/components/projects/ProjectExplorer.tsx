import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Star } from 'lucide-react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { TechPill } from '../common/Badge';
import { ProjectModal } from './ProjectModal';
import { projects, projectFilters, type Project, type ProjectTag } from '../../data/projects';
import { tailoring } from '../../config/tailoring';
import { cn } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

/** Honour tailoring.projectOrder when set, otherwise keep authoring order. */
const ordered = tailoring.projectOrder.length
  ? [...projects].sort((a, b) => {
      const ia = tailoring.projectOrder.indexOf(a.id);
      const ib = tailoring.projectOrder.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
  : projects;

export function ProjectExplorer() {
  const [filter, setFilter] = useState<ProjectTag | 'All'>('All');
  const [selected, setSelected] = useState<Project | null>(null);

  const results = useMemo(
    () => (filter === 'All' ? ordered : ordered.filter((p) => p.tags.includes(filter))),
    [filter],
  );

  const counts = useMemo(() => {
    const map = new Map<ProjectTag | 'All', number>([['All', ordered.length]]);
    projectFilters.forEach((f) => {
      if (f !== 'All') map.set(f, ordered.filter((p) => p.tags.includes(f)).length);
    });
    return map;
  }, []);

  return (
    <Section id="projects">
      <SectionHeader
        index="05"
        eyebrow="Project Explorer"
        title="Projects"
        description="Seven systems across banking, telecom OSS and embedded automotive. Open any card for the problem, the architecture and the failure modes that shaped it."
      />

      <div className="hide-scrollbar mb-5 flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter projects">
        {projectFilters
          .filter((f) => f === 'All' || (counts.get(f) ?? 0) > 0)
          .map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                filter === f
                  ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                  : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-3)] hover:border-[var(--line-strong)] hover:text-[var(--text-2)]',
              )}
            >
              {f}
              <span className="font-mono text-[0.625rem] opacity-60">{counts.get(f) ?? 0}</span>
            </button>
          ))}
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((project, i) => (
            <motion.li
              key={project.id}
              layout
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.3, ease: EASE }}
              className={cn(project.featured && 'xl:col-span-1')}
            >
              <ProjectCard project={project} onOpen={() => setSelected(project)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open details for ${project.name}`}
      className={cn(
        'group surface-card ticked flex h-full w-full flex-col p-5 text-left transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-lift)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="mono-label">{project.category}</span>
            {project.featured && (
              <Star
                size={11}
                strokeWidth={2}
                className="fill-[var(--accent)] text-[var(--accent)]"
                aria-label="Featured project"
              />
            )}
          </div>
          <h3 className="mt-2 text-[0.9375rem] leading-snug font-semibold tracking-tight">{project.name}</h3>
          <p className="mt-1 text-xs text-[var(--accent-text)]">{project.company}</p>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className="mt-1 shrink-0 text-[var(--text-3)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)]"
        />
      </div>

      <p className="mt-3 flex-1 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{project.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 5).map((t) => (
          <TechPill key={t}>{t}</TechPill>
        ))}
        {project.technologies.length > 5 && (
          <span className="inline-flex items-center px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-3)]">
            +{project.technologies.length - 5}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
        <span className="font-mono text-[0.625rem] text-[var(--text-3)]">{project.period}</span>
        <div className="flex gap-1">
          {project.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[0.625rem] text-[var(--text-3)]">
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
