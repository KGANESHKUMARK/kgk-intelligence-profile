import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Brain } from 'lucide-react';
import { EASE } from '../../lib/motion';

/**
 * Floating bottom-right entry into the Learning Hub. Rendered only on the
 * resume portal (the Learning Hub has its own header link back to it).
 */
export function LearningHubEntry() {
  const [hover, setHover] = useState(false);

  return (
    <div className="no-print fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="pointer-events-none absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elev)] px-3 py-2 text-[0.75rem] text-[var(--text-2)] shadow-[var(--shadow-lift)]"
            role="tooltip"
          >
            Explore Engineering Learning
          </motion.span>
        )}
      </AnimatePresence>

      <Link
        to="/learning"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label="Open the Learning Hub"
        className="flex items-center gap-2.5 rounded-full border border-[var(--ai-line)] bg-[var(--bg-elev)] py-3 pr-4 pl-3 shadow-[var(--shadow-lift)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ai)]"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ai-soft)] text-[var(--ai-text)]">
          <Brain size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className="absolute -top-px -right-px h-1.5 w-1.5 rounded-full bg-[var(--ai)] opacity-80" />
        </span>
        <span className="text-[0.8125rem] font-medium tracking-tight text-[var(--text)]">Learning Hub</span>
      </Link>
    </div>
  );
}
