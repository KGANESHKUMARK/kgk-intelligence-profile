import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Section, SectionHeader } from '../common/SectionHeader';
import { Icon } from '../common/Icon';
import { architectures, type ArchNode } from '../../data/architectures';
import { cn, prefersReducedMotion, toneStyle } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

export function ArchitecturePlayground() {
  const [archId, setArchId] = useState(architectures[0].id);
  const arch = architectures.find((a) => a.id === archId) ?? architectures[0];
  const [nodeId, setNodeId] = useState(arch.nodes[0].id);

  const activeNode = arch.nodes.find((n) => n.id === nodeId) ?? arch.nodes[0];

  const selectArch = (id: string) => {
    const next = architectures.find((a) => a.id === id);
    if (!next) return;
    setArchId(id);
    setNodeId(next.nodes[0].id);
  };

  return (
    <Section id="architecture">
      <SectionHeader
        index="07"
        eyebrow="Architecture Playground"
        title="Six systems, drawn out"
        description="Switch between the architectures I have built and select any component to see what it does and what it costs."
      />

      {/* architecture selector */}
      <div
        className="hide-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Select an architecture"
      >
        {architectures.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === archId}
            onClick={() => selectArch(a.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[0.8125rem] font-medium transition-all duration-200',
              a.id === archId
                ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-3)] hover:border-[var(--line-strong)] hover:text-[var(--text-2)]',
            )}
          >
            <Icon name={a.icon} size={14} />
            {a.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={arch.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div className="mb-4">
            <p className="text-sm font-medium text-[var(--accent-text)]">{arch.tagline}</p>
            <p className="mt-1.5 max-w-3xl text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
              {arch.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="surface-card ticked overflow-hidden p-4 sm:p-6"
            >
              <ArchDiagram
                nodes={arch.nodes}
                edges={arch.edges}
                activeId={nodeId}
                onSelect={setNodeId}
              />
            </motion.div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <NodeDetail node={activeNode} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */

interface DiagramProps {
  nodes: ArchNode[];
  edges: { from: string; to: string; label?: string; dashed?: boolean }[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Nodes are laid out with CSS grid (which keeps them responsive and
 * text-friendly), then edges are drawn as an SVG overlay measured from the
 * real DOM positions. This avoids hard-coding pixel coordinates.
 */
function ArchDiagram({ nodes, edges, activeId, onSelect }: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<
    { key: string; x1: number; y1: number; x2: number; y2: number; dashed?: boolean; active: boolean }[]
  >([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const reduced = prefersReducedMotion();

  const rows = useMemo(() => {
    const map = new Map<number, ArchNode[]>();
    nodes.forEach((n) => {
      const arr = map.get(n.row) ?? [];
      arr.push(n);
      map.set(n.row, arr);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([, list]) => list.sort((a, b) => a.col - b.col));
  }, [nodes]);

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      if (!container) return;
      const base = container.getBoundingClientRect();
      setBox({ w: base.width, h: base.height });

      const next = edges.flatMap((e) => {
        const a = nodeRefs.current[e.from];
        const b = nodeRefs.current[e.to];
        if (!a || !b) return [];
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return [
          {
            key: `${e.from}-${e.to}`,
            x1: ra.left - base.left + ra.width / 2,
            y1: ra.top - base.top + ra.height,
            x2: rb.left - base.left + rb.width / 2,
            y2: rb.top - base.top,
            dashed: e.dashed,
            active: e.from === activeId || e.to === activeId,
          },
        ];
      });
      setLines(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [edges, nodes, activeId]);

  return (
    <div ref={containerRef} className="relative">
      {/* edge overlay */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
        aria-hidden="true"
      >
        {lines.map((l) => {
          const midY = (l.y1 + l.y2) / 2;
          const path = `M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`;
          return (
            <g key={l.key}>
              <path
                d={path}
                fill="none"
                stroke={l.active ? 'var(--accent)' : 'var(--line-strong)'}
                strokeWidth={l.active ? 1.5 : 1}
                strokeDasharray={l.dashed ? '3 4' : undefined}
                opacity={l.active ? 0.9 : 0.5}
                className="transition-all duration-300"
              />
              {l.active && !reduced && (
                <circle r={2.5} fill="var(--accent)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* node grid */}
      <div className="relative z-10 space-y-6">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(row.length, 4)}, minmax(0, 1fr))` }}
          >
            {row.map((node) => (
              <button
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                type="button"
                onClick={() => onSelect(node.id)}
                aria-pressed={node.id === activeId}
                style={toneStyle(node.tone)}
                className={cn(
                  'group relative rounded-lg border px-2.5 py-2.5 text-center transition-all duration-200',
                  node.id === activeId
                    ? 'border-[var(--t-line)] bg-[var(--t-soft)] shadow-[0_0_0_1px_var(--t-line)]'
                    : 'border-[var(--line)] bg-[var(--surface-2)] hover:-translate-y-0.5 hover:border-[var(--line-strong)]',
                )}
              >
                <span
                  className={cn(
                    'block font-mono text-[0.6875rem] leading-tight sm:text-xs',
                    node.id === activeId ? 'text-[var(--t-fg)]' : 'text-[var(--text-2)]',
                  )}
                >
                  {node.label}
                </span>
                {node.kind && (
                  <span className="mt-1 block text-[0.5625rem] tracking-wide text-[var(--text-3)] uppercase">
                    {node.kind}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NodeDetail({ node }: { node: ArchNode }) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      style={toneStyle(node.tone)}
      className="surface-card p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="mono-label">{node.kind ?? 'component'}</span>
      </div>
      <h3 className="mt-1.5 font-mono text-base font-semibold tracking-tight text-[var(--t-fg)]">{node.label}</h3>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{node.summary}</p>
      <ul className="mt-3.5 space-y-1.5 border-t border-[var(--line)] pt-3.5">
        {node.points.map((p) => (
          <li key={p} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--t-raw)]" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
