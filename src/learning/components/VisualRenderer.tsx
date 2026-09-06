import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { LearningVisual, VisualNode } from '../types';
import { getTopic, topicRoute } from '../services/registry';
import { useLearningNav } from '../hooks/useLearningNav';
import { cn } from '../../lib/utils';

/**
 * Dispatches a LearningVisual to the right rendering strategy. Every node
 * with a topicId is a real, clickable navigation target through the
 * registry — this is a knowledge map, not decoration.
 */
export function VisualRenderer({ visual }: { visual: LearningVisual }) {
  return (
    <figure className="surface-card p-4 sm:p-5" aria-label={visual.title}>
      <figcaption className="mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">{visual.title}</p>
        {visual.description && <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--text-3)]">{visual.description}</p>}
      </figcaption>

      {visual.columns ? (
        <ComparisonBody columns={visual.columns} />
      ) : visual.nodes ? (
        <FlowBody nodes={visual.nodes} />
      ) : (
        <p className="text-[0.75rem] text-[var(--text-3)]">Diagram data unavailable.</p>
      )}

      {visual.memoryTip && (
        <p className="mt-4 rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--accent-text)]">
          <strong className="font-semibold">Memory tip: </strong>
          {visual.memoryTip}
        </p>
      )}
    </figure>
  );
}

function NodeChip({ node }: { node: VisualNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushContext } = useLearningNav();
  const topic = node.topicId ? getTopic(node.topicId) : undefined;

  const base =
    'rounded-lg border px-3 py-2 text-left text-[0.8125rem] leading-snug transition-colors';
  const clickable = 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)] hover:bg-[color-mix(in_oklab,var(--accent-soft)_70%,var(--accent)_30%)]';
  const plain = 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text)]';

  if (topic) {
    return (
      <button
        type="button"
        onClick={() => {
          pushContext({
            route: location.pathname + location.search,
            title: document.title.replace(/ \| Java Engineering Lab$/, ''),
            scrollPosition: window.scrollY,
          });
          navigate(topicRoute(topic.id));
        }}
        className={cn(base, clickable)}
        aria-label={`${node.label} — explore ${topic.title}`}
        title={node.description}
      >
        <span className="font-medium">{node.label}</span>
        {node.caption && <span className="mt-0.5 block text-[0.6875rem] opacity-80">{node.caption}</span>}
      </button>
    );
  }

  return (
    <div className={cn(base, plain)} role="group" aria-label={node.label} title={node.description}>
      <span className="font-medium">{node.label}</span>
      {node.caption && <span className="mt-0.5 block text-[0.6875rem] text-[var(--text-3)]">{node.caption}</span>}
    </div>
  );
}

/** Linear flow/lifecycle/architecture/code-flow rendering — a step ladder. */
function FlowBody({ nodes }: { nodes: VisualNode[] }) {
  return (
    <ol className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2" aria-label="Diagram steps">
      {nodes.map((node, i) => (
        <li key={node.id} className="flex items-center gap-1.5 sm:flex-1">
          <div className="flex-1">
            <NodeChip node={node} />
          </div>
          {i < nodes.length - 1 && (
            <span className="shrink-0 text-[var(--text-3)]" aria-hidden="true">
              <ArrowDown size={14} strokeWidth={1.75} className="sm:hidden" />
              <ArrowRight size={14} strokeWidth={1.75} className="hidden sm:block" />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Two-column comparison/memory rendering. */
function ComparisonBody({ columns }: { columns: NonNullable<LearningVisual['columns']> }) {
  return (
    <div className={cn('grid gap-3', columns.length === 2 ? 'sm:grid-cols-2' : '')}>
      {columns.map((col) => (
        <div key={col.label} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
          <p className="mono-label mb-2.5">{col.label}</p>
          <ul className="space-y-1.5">
            {col.nodes.map((node) => (
              <li key={node.id}>
                <NodeChip node={node} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
