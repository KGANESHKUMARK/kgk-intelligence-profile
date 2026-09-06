import { Link } from 'react-router-dom';
import { ChevronRight, CornerUpLeft, Undo2 } from 'lucide-react';
import { useLearningNav } from '../hooks/useLearningNav';
import { Button } from '../../components/common/Button';

interface Crumb {
  label: string;
  href?: string;
}

/** Structural breadcrumbs (Java / Category / Title) — always correct, never history-dependent. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-[0.75rem] text-[var(--text-3)]">
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />}
          {c.href ? (
            <Link to={c.href} className="hover:text-[var(--accent-text)]">
              {c.label}
            </Link>
          ) : (
            <span className="text-[var(--text-2)]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * Shows the contextual "Back to X" button and the subtle "Exploring from"
 * strip, driven entirely by the learning navigation stack — not browser
 * history, per the context-preserving navigation requirement.
 */
export function ContextBar() {
  const { stack, source, top, popContext, returnToSource } = useLearningNav();

  if (stack.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={popContext}>
        <CornerUpLeft size={13} strokeWidth={2} aria-hidden="true" />
        Back to {top!.title}
      </Button>

      {stack.length > 1 && source && source.route !== top?.route && (
        <Button variant="ghost" size="sm" onClick={returnToSource}>
          <Undo2 size={13} strokeWidth={2} aria-hidden="true" />
          Return to {source.title}
        </Button>
      )}

      {stack.length > 0 && (
        <span className="ml-auto text-[0.6875rem] text-[var(--text-3)]">
          Exploring from: {stack.map((c) => c.title).join(' \u2192 ')}
        </span>
      )}
    </div>
  );
}
