import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { allQuestions, allTopics } from '../services/registry';
import { useLearningSeo } from '../hooks/useLearningSeo';

/** Technology modules. Built modules are clickable; planned ones are honestly marked. */
const TECHNOLOGIES = [
  { id: 'java', name: 'Java', blurb: 'Collections, concurrency, JVM memory (heap, stack, metaspace, GC), diagnostics and modern Java.', available: true },
  { id: 'spring-boot', name: 'Spring Boot & Microservices', blurb: 'DI, auto-config, transactions, Spring Cloud Gateway, resilience, security, Maven.', available: true },
  { id: 'system-design', name: 'System Design', blurb: 'Scalability, caching, sharding, API Gateway, REST API design, case studies.', available: true },
  { id: 'kafka', name: 'Kafka', blurb: 'Topics, partitions, consumer groups, delivery semantics, Avro, Streams.', available: true },
  { id: 'react', name: 'React', blurb: 'Rendering model, hooks, performance, real-time data, testing, TypeScript, architecture.', available: true },
  { id: 'angular', name: 'Angular', blurb: 'DI, RxJS, change detection and signals, reactive forms, routing, NgRx.', available: true },
  { id: 'python', name: 'Python', blurb: 'Collections, strings, DSA patterns, generators, decorators, OOP, concurrency, FastAPI, pytest.', available: true },
  { id: 'genai', name: 'GenAI', blurb: 'LLMs, RAG, prompt and context engineering, guardrails, LLMOps.', available: true },
  { id: 'mlops', name: 'MLOps & AIOps', blurb: 'ML pipelines, model registry, drift monitoring, anomaly detection, auto-remediation.', available: true },
  { id: 'docker-k8s', name: 'Docker & Kubernetes', blurb: 'Containers, K8s architecture, workloads, networking, Helm and GitOps.', available: true },
  { id: 'aws', name: 'AWS Cloud', blurb: 'Compute, storage, networking, IAM, event-driven patterns, Well-Architected.', available: true },
  { id: 'observability', name: 'Observability', blurb: 'Distributed tracing, metrics, SLOs/error budgets, structured logging, incident response.', available: true },
  { id: 'security', name: 'Security', blurb: 'OAuth 2.0/PKCE, JWT, OWASP API Top 10, secrets management, zero trust.', available: true },
  { id: 'database', name: 'Database Internals', blurb: 'Indexes, query plans, N+1 fixes, connection pooling, Redis patterns.', available: true },
  { id: 'cicd', name: 'CI/CD & DevOps', blurb: 'GitHub Actions, GitOps/ArgoCD, blue-green and canary deployments, DORA metrics.', available: true },
  { id: 'java-concurrency', name: 'Java Concurrency', blurb: 'CompletableFuture, virtual threads, thread-safe collections, Project Reactor.', available: true },
  { id: 'testing', name: 'Testing Strategy', blurb: 'Test pyramid, TDD, TestContainers, Pact contracts, chaos engineering.', available: true },
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
          {allTopics.length} topics · {allQuestions.length} interview questions ·{' '}
          {TECHNOLOGIES.filter((t) => t.available).length} modules
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
