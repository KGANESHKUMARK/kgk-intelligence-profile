import { AlertCircle, ExternalLink, Github, Layers, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { Modal } from '../common/Modal';
import { TechPill } from '../common/Badge';
import { LinkButton } from '../common/Button';
import type { Project } from '../../data/projects';
import { skills } from '../../data/skills';
import { useAppState } from '../../hooks/useAppState';

export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { focusSkill } = useAppState();

  if (!project) return null;

  // Technologies on this project that have a full skill entry become drill-down links.
  const linkable = new Map(
    skills
      .filter((s) => s.projects.includes(project.id))
      .flatMap((s) => [[s.name.toLowerCase(), s.id] as const, ...(s.aliases ?? []).map((a) => [a.toLowerCase(), s.id] as const)]),
  );

  const resolveSkill = (tech: string) => {
    const key = tech.toLowerCase();
    if (linkable.has(key)) return linkable.get(key);
    for (const [alias, id] of linkable) {
      if (key.startsWith(alias) || alias.startsWith(key)) return id;
    }
    return undefined;
  };

  return (
    <Modal open={Boolean(project)} onClose={onClose} title={project.name} subtitle={project.subtitle}>
      <div className="space-y-6">
        {/* meta */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="text-[var(--accent-text)]">{project.company}</span>
          <span className="font-mono text-[var(--text-3)]">{project.period}</span>
          <span className="text-[var(--text-3)]">{project.category}</span>
          <div className="ml-auto flex flex-wrap gap-1">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.625rem] text-[var(--text-2)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <Block icon={<Target size={13} strokeWidth={2} />} label="Problem">
          <p className="text-sm leading-relaxed text-[var(--text-2)]">{project.problem}</p>
        </Block>

        <Block icon={<Lightbulb size={13} strokeWidth={2} />} label="Solution" tone="accent">
          <p className="text-sm leading-relaxed text-[var(--text-2)]">{project.solution}</p>
        </Block>

        <Block icon={<Layers size={13} strokeWidth={2} />} label="Architecture">
          <ol className="relative space-y-0">
            {project.architecture.map((step, i) => {
              const isLast = i === project.architecture.length - 1;
              return (
                <li key={step.label} className="relative flex gap-3 pb-3.5 last:pb-0">
                  <div className="relative flex w-5 shrink-0 justify-center">
                    <span className="relative z-10 mt-1 flex h-5 w-5 items-center justify-center rounded border border-[var(--line-strong)] bg-[var(--surface-2)] font-mono text-[0.5625rem] text-[var(--text-3)]">
                      {i + 1}
                    </span>
                    {!isLast && (
                      <span className="absolute top-6 bottom-0 w-px bg-[var(--line-strong)]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-medium text-[var(--text)]">{step.label}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Block>

        <Block icon={<TrendingUp size={13} strokeWidth={2} />} label="Impact" tone="accent">
          <ul className="space-y-1.5">
            {project.impact.map((im) => (
              <li key={im} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {im}
              </li>
            ))}
          </ul>
        </Block>

        <Block icon={<AlertCircle size={13} strokeWidth={2} />} label="Key Engineering Concepts">
          <div className="flex flex-wrap gap-1.5">
            {project.concepts.map((c) => (
              <span
                key={c}
                className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-xs text-[var(--text-2)]"
              >
                {c}
              </span>
            ))}
          </div>
        </Block>

        <div>
          <p className="mono-label mb-2.5">Technologies · {project.technologies.length}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => {
              const skillId = resolveSkill(t);
              if (!skillId) return <TechPill key={t}>{t}</TechPill>;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onClose();
                    focusSkill(skillId);
                  }}
                  title={`Trace ${t} through to experience`}
                  className="inline-flex items-center gap-1 rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-1 font-mono text-[0.6875rem] leading-none text-[var(--accent-text)] transition-colors hover:brightness-125"
                >
                  {t}
                  <ExternalLink size={9} strokeWidth={2.5} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[0.6875rem] text-[var(--text-3)]">
            Highlighted technologies link to the Skills Explorer.
          </p>
        </div>

        {project.link && (
          <LinkButton href={project.link} external variant="secondary" size="sm">
            <Github size={14} strokeWidth={2} aria-hidden="true" />
            View repository
          </LinkButton>
        )}
      </div>
    </Modal>
  );
}

function Block({
  icon,
  label,
  tone = 'neutral',
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'neutral' | 'accent';
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="mono-label mb-2.5 flex items-center gap-1.5"
        style={tone === 'accent' ? { color: 'var(--accent-text)' } : undefined}
      >
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}
