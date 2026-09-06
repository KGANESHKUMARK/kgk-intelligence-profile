import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { allQuestions, allTopics } from '../services/registry';
import { useLearningSeo } from '../hooks/useLearningSeo';

/** Future technology modules. Only Java is built — the rest are honestly marked. */
const TECHNOLOGIES = [
  { id: 'java', name: 'Java', blurb: 'Core language, collections, concurrency, JVM and modern Java.', available: true },
  { id: 'spring-boot', name: 'Spring Boot', blurb: 'Dependency injection, web layer, data access, production config.', available: false },
  { id: 'react', name: 'React', blurb: 'Rendering model, hooks, state, performance.', available: false },
  { id: 'python', name: 'Python', blurb: 'Language model, data tooling, async.', available: false },
  { id: 'ai', name: 'AI / GenAI', blurb: 'LLMs, RAG, agents, evaluation.', available: false },
  { id: 'kafka', name: 'Kafka', blurb: 'Topics, partitions, consumer groups, delivery semantics.', available: false },
  { id: 'kubernetes', name: 'Kubernetes', blurb: 'Workloads, scheduling, networking, operations.', available: false },
  { id: 'system-design', name: 'System Design', blurb: 'Scalability, consistency, resilience patterns.', available: false },
];

export default function LearningHome() {
  useLearningSeo('Learning Hub', 'A visual engineering learning and interview intelligence system.');

  return (
    <div>
      <header className="surface-card ticked p-6 sm:p-8">
        <span className="mono-label text-[var(--ai-text)]">Learning Hub</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Engineering Learning</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--text-2)]">
          A visual learning and interview-preparation system. See it, understand it, explain it, code it, and know
          the follow-up question that&apos;s coming next.
        </p>
        <p className="mt-3 font-mono text-[0.75rem] text-[var(--text-3)]">
          {allTopics.length} topics · {allQuestions.length} interview questions · currently Java
        </p>
      </header>

      <section className="mt-4">
        <h2 className="mono-label mb-3">Technologies</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TECHNOLOGIES.map((tech) =>
            tech.available ? (
              <Link
                key={tech.id}
                to={`/learning/${tech.id}`}
                className="surface-card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">{tech.name}</span>
                  <span className="mono-label ml-auto rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--accent-text)]">
                    available
                  </span>
                </span>
                <span className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{tech.blurb}</span>
                <span className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)]">
                  Start learning
                  <ArrowRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ) : (
              <div key={tech.id} className="surface-card flex flex-col p-5 opacity-60" aria-disabled="true">
                <span className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-[var(--text-2)]">{tech.name}</span>
                  <span className="mono-label ml-auto flex items-center gap-1 rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.5625rem]">
                    <Lock size={9} strokeWidth={2} aria-hidden="true" />
                    planned
                  </span>
                </span>
                <span className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--text-3)]">{tech.blurb}</span>
              </div>
            ),
          )}
        </div>
      </section>

      <p className="mt-6 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
        Planned modules are shown so the roadmap is visible, but they intentionally aren&apos;t clickable until real
        content exists behind them.
      </p>
    </div>
  );
}
