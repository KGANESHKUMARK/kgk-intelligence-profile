import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getGlossaryTerm, getTopic, topicRoute } from '../services/registry';
import { useLearningNav } from '../hooks/useLearningNav';
import { cn } from '../../lib/utils';

/**
 * <LearningTerm term="HashMap" /> — resolves through the registry
 * (topic first, then glossary) and renders a clickable inline term that
 * preserves where the reader came from. Renders as plain text if the term
 * doesn't resolve to real content — never link to something that doesn't exist.
 */
export function LearningTerm({ term, children }: { term: string; children?: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pushContext } = useLearningNav();

  const topic = getTopic(term);
  const glossary = !topic ? getGlossaryTerm(term) : undefined;
  const label = children ?? term;

  if (!topic && !glossary) {
    return <>{label}</>;
  }

  const route = topic ? topicRoute(topic.id) : `/learning/java/glossary?term=${glossary!.id}`;
  const tooltipTitle = topic ? topic.title : glossary!.term;
  const tooltipCategory = topic ? topic.category : 'Glossary';
  const tooltipDescription = topic ? topic.oneLineMeaning : glossary!.simple;
  const importance = topic && (topic.interviewQuestions?.length ?? 0) > 0 ? 'High' : 'Contextual';

  const go = () => {
    pushContext({
      route: location.pathname + location.search,
      title: document.title.replace(/ \| Java Engineering Lab$/, ''),
      scrollPosition: window.scrollY,
    });
    navigate(route);
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={go}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="rounded border-b border-dashed border-[var(--accent-line)] font-medium text-[var(--accent-text)] transition-colors hover:border-solid hover:bg-[var(--accent-soft)]"
      >
        {label}
      </button>

      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            role="tooltip"
            className={cn(
              'pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elev)] p-3 shadow-[var(--shadow-lift)]',
            )}
          >
            <span className="block text-sm font-semibold text-[var(--text)]">{tooltipTitle}</span>
            <span className="mono-label mt-1 block">{tooltipCategory}</span>
            <span className="mt-1.5 block text-[0.75rem] leading-relaxed text-[var(--text-2)]">{tooltipDescription}</span>
            <span className="mt-2 flex items-center justify-between text-[0.6875rem] text-[var(--text-3)]">
              <span>
                Interview importance: <span className="text-[var(--text-2)]">{importance}</span>
              </span>
              <span className="flex items-center gap-1 text-[var(--accent-text)]">
                Explore <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
