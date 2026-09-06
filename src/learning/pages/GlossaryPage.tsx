import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { ReferenceList } from '../components/ReferenceList';
import { allGlossary, getTopic, topicRoute } from '../services/registry';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { matches } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function GlossaryPage() {
  useLearningSeo('Java Glossary', 'Precise definitions of the Java terms interviewers expect you to use correctly.');

  const [searchParams] = useSearchParams();
  const highlighted = searchParams.get('term');
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => allGlossary.filter((g) => matches(query, g.term, g.simple, g.technical, g.keyWords)),
    [query],
  );

  useEffect(() => {
    if (!highlighted) return;
    const el = document.getElementById(`glossary-${highlighted}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: 'Glossary' }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">Say it like a senior engineer</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Java Glossary</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Each term has a plain-English definition and the precise technical one — the wording that signals you
          actually understand the concept.
        </p>

        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5">
          <Search size={15} strokeWidth={1.75} className="shrink-0 text-[var(--text-3)]" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms..."
            aria-label="Search glossary"
            className="h-11 w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-3)]"
          />
        </div>
      </header>

      {results.length === 0 ? (
        <p className="surface-card mt-4 p-6 text-center text-sm text-[var(--text-2)]">No terms match &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {results.map((term) => (
            <li
              key={term.id}
              id={`glossary-${term.id}`}
              className={cn(
                'surface-card p-5 transition-colors',
                highlighted === term.id && 'border-[var(--accent-line)]',
              )}
            >
              <h2 className="text-lg font-semibold tracking-tight">{term.term}</h2>

              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
                <span className="mono-label mr-2">simple</span>
                {term.simple}
              </p>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
                <span className="mono-label mr-2">technical</span>
                {term.technical}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mono-label mr-1">Key words</span>
                {term.keyWords.map((k) => (
                  <span
                    key={k}
                    className="rounded border border-[var(--line-strong)] bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[0.6875rem] text-[var(--text-2)]"
                  >
                    {k}
                  </span>
                ))}
              </div>

              {term.relatedTopics && term.relatedTopics.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="mono-label mr-1">Related</span>
                  {term.relatedTopics.map((id) => {
                    const topic = getTopic(id);
                    if (!topic) return null;
                    return (
                      <Link
                        key={id}
                        to={topicRoute(topic.id)}
                        className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] px-2 py-1 text-[0.75rem] text-[var(--text-2)] hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
                      >
                        {topic.title}
                      </Link>
                    );
                  })}
                </div>
              )}

              {term.reference && (
                <div className="mt-3">
                  <ReferenceList references={[term.reference]} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
