import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { capabilities, type Capability } from '../../data/skills';
import { cn, polar, prefersReducedMotion, toneStyle } from '../../lib/utils';
import { EASE } from '../../lib/motion';

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_MAX = 158;
const RINGS = [0.25, 0.5, 0.75, 1];

/**
 * Custom SVG capability radar. `weight` is a relative depth signal — the
 * qualitative level (Advanced / Strong / Working Knowledge) is the honest
 * label, the polygon just makes the shape readable at a glance.
 */
export function CapabilityRadar() {
  const [activeId, setActiveId] = useState<string>(capabilities[0].id);
  const gradId = useId();
  const reduced = prefersReducedMotion();

  const step = 360 / capabilities.length;
  const active = capabilities.find((c) => c.id === activeId) ?? capabilities[0];

  const points = capabilities.map((c, i) => ({
    cap: c,
    angle: i * step,
    outer: polar(CX, CY, R_MAX, i * step),
    value: polar(CX, CY, R_MAX * c.weight, i * step),
    label: polar(CX, CY, R_MAX + 34, i * step),
  }));

  const polygon = points.map((p) => `${p.value.x},${p.value.y}`).join(' ');

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-[460px]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Capability radar showing ten engineering capability areas"
        >
          <defs>
            <radialGradient id={`${gradId}-fill`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.06" />
            </radialGradient>
            <radialGradient id={`${gradId}-core`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* soft core glow */}
          <circle cx={CX} cy={CY} r={R_MAX * 0.75} fill={`url(#${gradId}-core)`} />

          {/* rings */}
          {RINGS.map((r) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={R_MAX * r}
              fill="none"
              stroke="var(--line)"
              strokeWidth={1}
              strokeDasharray={r === 1 ? undefined : '2 5'}
            />
          ))}

          {/* spokes */}
          {points.map((p) => (
            <line
              key={`spoke-${p.cap.id}`}
              x1={CX}
              y1={CY}
              x2={p.outer.x}
              y2={p.outer.y}
              stroke={p.cap.id === activeId ? 'var(--accent-line)' : 'var(--line)'}
              strokeWidth={1}
            />
          ))}

          {/* capability polygon */}
          <motion.polygon
            points={polygon}
            fill={`url(#${gradId}-fill)`}
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            initial={reduced ? false : { scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />

          {/* sweep line */}
          {!reduced && (
            <g style={{ transformOrigin: `${CX}px ${CY}px` }} className="animate-drift">
              <line
                x1={CX}
                y1={CY}
                x2={CX}
                y2={CY - R_MAX}
                stroke="var(--accent)"
                strokeWidth={1}
                strokeOpacity={0.35}
              />
            </g>
          )}

          {/* vertices */}
          {points.map((p) => {
            const isActive = p.cap.id === activeId;
            return (
              <g key={p.cap.id}>
                {isActive && (
                  <circle cx={p.value.x} cy={p.value.y} r={11} fill="var(--accent)" opacity={0.16} />
                )}
                <circle
                  cx={p.value.x}
                  cy={p.value.y}
                  r={isActive ? 5 : 3.5}
                  fill={p.cap.tone === 'ai' ? 'var(--ai)' : 'var(--accent)'}
                  stroke="var(--bg)"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* labels — real buttons for keyboard + pointer */}
          {points.map((p) => {
            const isActive = p.cap.id === activeId;
            const anchor = p.label.x < CX - 12 ? 'end' : p.label.x > CX + 12 ? 'start' : 'middle';
            return (
              <g
                key={`label-${p.cap.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${p.cap.label} — ${p.cap.level}`}
                onMouseEnter={() => setActiveId(p.cap.id)}
                onFocus={() => setActiveId(p.cap.id)}
                onClick={() => setActiveId(p.cap.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(p.cap.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <text
                  x={p.label.x}
                  y={p.label.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={cn(
                    'font-mono text-[10.5px] tracking-wide transition-colors duration-200',
                    isActive ? 'fill-[var(--text)]' : 'fill-[var(--text-3)]',
                  )}
                >
                  {p.cap.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <CapabilityDetail capability={active} />
    </div>
  );
}

function CapabilityDetail({ capability }: { capability: Capability }) {
  return (
    <motion.div
      key={capability.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={toneStyle(capability.tone)}
      className="surface-card ticked mt-4 p-4 sm:p-5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="text-base font-semibold tracking-tight">{capability.label}</h3>
        <span className="rounded border border-[var(--t-line)] bg-[var(--t-soft)] px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wide text-[var(--t-fg)] uppercase">
          {capability.level}
        </span>
      </div>

      <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{capability.contextLine}</p>

      <dl className="mt-3.5 grid gap-2.5 text-[0.8125rem] sm:grid-cols-2">
        <div>
          <dt className="mono-label">Example Project</dt>
          <dd className="mt-1 text-[var(--text)]">{capability.exampleProject}</dd>
        </div>
        <div>
          <dt className="mono-label">Domain Relevance</dt>
          <dd className="mt-1 text-[var(--text-2)]">{capability.domainRelevance}</dd>
        </div>
      </dl>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {capability.technologies.map((t) => (
          <span
            key={t}
            className="rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] leading-none text-[var(--text-2)]"
          >
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
