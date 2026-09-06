import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { StatusBadge } from '../components/StatusBadge';
import { getVersion, VERSION_DATA_SOURCE_NOTE } from '../data/java/versions';
import { useLearningSeo } from '../hooks/useLearningSeo';

export default function VersionDetail() {
  const { version = '' } = useParams();
  const meta = getVersion(Number(version));

  useLearningSeo(
    meta ? `Java ${meta.version}` : 'Version not found',
    meta ? `Java ${meta.version} — release date, LTS status and every tracked JEP with its real stability status.` : undefined,
  );

  if (!meta) {
    return (
      <div className="surface-card p-8 text-center">
        <h1 className="text-xl font-semibold">Version not found</h1>
        <Link to="/learning/java/versions" className="mt-3 inline-block text-sm text-[var(--accent-text)] hover:underline">
          Back to the version timeline
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        crumbs={[
          { label: 'Java', href: '/learning/java' },
          { label: 'Versions', href: '/learning/java/versions' },
          { label: `Java ${meta.version}` },
        ]}
      />

      <header className="surface-card ticked p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">Release</span>
          {meta.isLTS && (
            <span className="mono-label rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--accent-text)]">
              LTS
            </span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Java {meta.version}</h1>
        <p className="mt-2 font-mono text-[0.75rem] text-[var(--text-3)]">
          Released {meta.releaseDate}
          {meta.eoslPremier ? ` · Oracle premier support until ${meta.eoslPremier}` : ''}
        </p>

        <ul className="mt-4 space-y-1.5">
          {meta.highlights.map((h) => (
            <li key={h} className="flex gap-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>

        <a
          href={meta.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)] hover:underline"
        >
          <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
          Official OpenJDK release page
        </a>
      </header>

      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-3">Tracked JEPs ({meta.jeps.length})</h2>
        <ul className="space-y-2">
          {meta.jeps.map((jep) => (
            <li key={jep.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://openjdk.org/jeps/${jep.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.75rem] text-[var(--accent-text)] hover:underline"
                >
                  JEP {jep.id}
                </a>
                <span className="text-[0.875rem] font-medium text-[var(--text)]">{jep.title}</span>
                <span className="ml-auto">
                  <StatusBadge status={jep.status} />
                </span>
              </div>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">{jep.summary}</p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
          Statuses are shown exactly as published — a preview or incubator feature is never presented as stable.
          {' '}
          {VERSION_DATA_SOURCE_NOTE}
        </p>
      </section>
    </div>
  );
}
