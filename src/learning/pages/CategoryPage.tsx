import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { StatusBadge } from '../components/StatusBadge';
import { topicRoute, topicsByCategory } from '../services/registry';
import { useLearningSeo } from '../hooks/useLearningSeo';

export default function CategoryPage() {
  const { category = '' } = useParams();
  const decoded = decodeURIComponent(category);
  const topics = topicsByCategory(decoded);

  useLearningSeo(decoded, `Java ${decoded} topics — visual explanations, internals and interview answers.`);

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: decoded }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">Category</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{decoded}</h1>
        <p className="mt-2 font-mono text-[0.75rem] text-[var(--text-3)]">
          {topics.length} topic{topics.length === 1 ? '' : 's'}
        </p>
      </header>

      {topics.length === 0 ? (
        <div className="surface-card mt-4 p-6 text-center">
          <p className="text-sm text-[var(--text-2)]">No topics exist in this category yet.</p>
          <Link to="/learning/java" className="mt-3 inline-block text-sm text-[var(--accent-text)] hover:underline">
            Back to Java Engineering Lab
          </Link>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                to={topicRoute(topic.id)}
                className="surface-card group flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)]"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">{topic.title}</span>
                  {topic.featureStatus && topic.featureStatus !== 'stable' && <StatusBadge status={topic.featureStatus} />}
                  {topic.difficulty && (
                    <span className="mono-label ml-auto rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[0.5625rem]">
                      {topic.difficulty}
                    </span>
                  )}
                </span>
                <span className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
                  {topic.oneLineMeaning}
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)]">
                  Open topic
                  <ArrowRight size={12} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
