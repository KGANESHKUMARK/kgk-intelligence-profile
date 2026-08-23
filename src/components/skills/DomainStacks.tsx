import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../common/Icon';
import { domainStacks } from '../../data/skills';
import { cn, toneStyle } from '../../lib/utils';
import { EASE } from '../../lib/motion';

/** "Tech Stack by Domain" — tabbed view of the same stack, framed by context. */
export function DomainStacks() {
  const [activeId, setActiveId] = useState(domainStacks[0].id);
  const active = domainStacks.find((d) => d.id === activeId) ?? domainStacks[0];

  return (
    <div className="mt-14">
      <div className="mb-5 flex items-center gap-3">
        <span className="mono-label text-[var(--accent-text)]">02.1</span>
        <span className="h-px w-8 bg-[var(--line-strong)]" aria-hidden="true" />
        <h3 className="mono-label">Tech Stack by Domain</h3>
      </div>

      <div className="surface-card overflow-hidden">
        <div
          className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-[var(--line)] p-2"
          role="tablist"
          aria-label="Technology stack by domain"
        >
          {domainStacks.map((d) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              id={`stack-tab-${d.id}`}
              aria-selected={activeId === d.id}
              aria-controls={`stack-panel-${d.id}`}
              onClick={() => setActiveId(d.id)}
              style={toneStyle(d.tone)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors',
                activeId === d.id ? 'text-[var(--t-fg)]' : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
              )}
            >
              {activeId === d.id && (
                <motion.span
                  layoutId="stack-tab"
                  transition={{ duration: 0.25, ease: EASE }}
                  className="absolute inset-0 -z-10 rounded-lg border border-[var(--t-line)] bg-[var(--t-soft)]"
                />
              )}
              <Icon name={d.icon} size={14} />
              {d.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            role="tabpanel"
            id={`stack-panel-${active.id}`}
            aria-labelledby={`stack-tab-${active.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={toneStyle(active.tone)}
            className="p-5"
          >
            <p className="text-sm text-[var(--text-2)]">{active.blurb}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {active.items.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.018, ease: EASE }}
                  className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1.5 font-mono text-xs text-[var(--text-2)] transition-colors hover:border-[var(--t-line)] hover:bg-[var(--t-soft)] hover:text-[var(--t-fg)]"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
