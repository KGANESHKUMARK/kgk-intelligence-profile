import { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Database } from 'lucide-react';
import { aiArchitecture, aiDataSources, aiObservability, type AINode } from '../../data/aiEngineering';
import { cn, toneStyle } from '../../lib/utils';
import { EASE, fadeUp, viewportOnce } from '../../lib/motion';

const trunk = aiArchitecture.filter((n) => n.layer !== 5);
const branches = aiArchitecture.filter((n) => n.layer === 5).sort((a, b) => (a.column ?? 0) - (b.column ?? 0));

export function AIArchitecture() {
  const [activeId, setActiveId] = useState('agent');
  const active = aiArchitecture.find((n) => n.id === activeId) ?? aiArchitecture[0];

  return (
    <div className="mt-14">
      <div className="mb-5 flex items-center gap-3">
        <span className="mono-label text-[var(--ai-text)]">06.1</span>
        <span className="h-px w-8 bg-[var(--line-strong)]" aria-hidden="true" />
        <h3 className="mono-label">AI System Architecture — select any node</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="surface-card ticked p-4 sm:p-6"
        >
          <div className="flex flex-col items-center">
            {trunk.map((node, i) => (
              <div key={node.id} className="flex w-full max-w-[420px] flex-col items-center">
                <NodeButton
                  node={node}
                  active={node.id === activeId}
                  onSelect={() => setActiveId(node.id)}
                  wide
                />

                {/* branch fan-out under the Agent node */}
                {node.id === 'agent' && (
                  <>
                    <Connector />
                    <div className="grid w-full max-w-[560px] grid-cols-2 gap-1.5 sm:grid-cols-5">
                      {branches.map((b) => (
                        <NodeButton
                          key={b.id}
                          node={b}
                          active={b.id === activeId}
                          onSelect={() => setActiveId(b.id)}
                          compact
                        />
                      ))}
                    </div>
                  </>
                )}

                {i < trunk.length - 1 && <Connector />}
              </div>
            ))}
          </div>

          {/* side rails */}
          <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-5 sm:grid-cols-2">
            <div>
              <p className="mono-label mb-2 flex items-center gap-1.5">
                <Database size={12} strokeWidth={2} aria-hidden="true" />
                Data Sources
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiDataSources.map((d) => (
                  <span
                    key={d}
                    className="rounded border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mono-label mb-2 flex items-center gap-1.5 text-[var(--risk-text)]">
                <Activity size={12} strokeWidth={2} aria-hidden="true" />
                Observability
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiObservability.map((o) => (
                  <span
                    key={o}
                    className="rounded border border-[var(--risk-line)] bg-[var(--risk-soft)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--risk-text)]"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* node detail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={toneStyle(active.tone)}
            className="surface-card p-5"
            aria-live="polite"
          >
            <p className="mono-label">Layer {String(active.layer).padStart(2, '0')}</p>
            <h4 className="mt-1.5 text-base font-semibold tracking-tight text-[var(--t-fg)]">{active.label}</h4>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{active.description}</p>
            <ul className="mt-3.5 space-y-1.5 border-t border-[var(--line)] pt-3.5">
              {active.detail.map((d) => (
                <li key={d} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--t-raw)]" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <span className="relative my-1.5 block h-4 w-px bg-[var(--line-strong)]" aria-hidden="true">
      <span className="absolute -bottom-px left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-r border-b border-[var(--line-strong)]" />
    </span>
  );
}

function NodeButton({
  node,
  active,
  onSelect,
  wide,
  compact,
}: {
  node: AINode;
  active: boolean;
  onSelect: () => void;
  wide?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      style={toneStyle(node.tone)}
      className={cn(
        'relative rounded-lg border text-center transition-all duration-200',
        wide && 'w-full px-4 py-2.5',
        compact && 'px-2 py-2',
        active
          ? 'border-[var(--t-line)] bg-[var(--t-soft)] shadow-[0_0_0_1px_var(--t-line)]'
          : 'border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--line-strong)]',
      )}
    >
      <span
        className={cn(
          'block font-mono leading-tight',
          compact ? 'text-[0.6875rem]' : 'text-[0.8125rem] font-medium',
          active ? 'text-[var(--t-fg)]' : 'text-[var(--text-2)]',
        )}
      >
        {node.label}
      </span>
    </button>
  );
}
