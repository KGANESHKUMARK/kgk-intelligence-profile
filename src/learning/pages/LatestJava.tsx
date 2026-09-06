import { Link } from 'react-router-dom';
import { ExternalLink, Info } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { StatusBadge } from '../components/StatusBadge';
import { latestLTS, latestVersion, VERSION_DATA_SOURCE_NOTE, VERSION_DATA_VERIFIED_ON } from '../data/java/versions';
import { useLearningSeo } from '../hooks/useLearningSeo';

export default function LatestJava() {
  useLearningSeo(
    `What's New in Java ${latestVersion.version}`,
    `Java ${latestVersion.version} interview essentials — every JEP with its real stability status.`,
  );

  const stable = latestVersion.jeps.filter((j) => j.status === 'stable');
  const notStable = latestVersion.jeps.filter((j) => j.status !== 'stable');

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: "What's New" }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label text-[var(--ai-text)]">Latest first</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Java {latestVersion.version} — Interview Essentials
        </h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Released {latestVersion.releaseDate} · {latestVersion.isLTS ? 'LTS' : 'Feature release (non-LTS)'} ·{' '}
          {latestVersion.jeps.length} tracked JEPs
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/learning/java/versions/${latestVersion.version}`}
            className="inline-flex items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] text-[var(--text)] hover:border-[var(--accent-line)]"
          >
            Full Java {latestVersion.version} detail
          </Link>
          <Link
            to={`/learning/java/versions/${latestLTS.version}`}
            className="inline-flex items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] text-[var(--text)] hover:border-[var(--accent-line)]"
          >
            Current LTS: Java {latestLTS.version}
          </Link>
          <Link
            to="/learning/java/versions"
            className="inline-flex items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] text-[var(--text)] hover:border-[var(--accent-line)]"
          >
            Full timeline
          </Link>
        </div>
      </header>

      <div className="surface-card mt-4 flex gap-3 border-[var(--risk-line)] p-4">
        <Info size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--risk-text)]" aria-hidden="true" />
        <p className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
          <strong className="font-semibold text-[var(--risk-text)]">Know the difference in an interview:</strong>{' '}
          a preview or incubator feature is not something you can rely on in production, and it can change between
          releases. Calling a preview feature &ldquo;stable&rdquo; is a credibility red flag — so each JEP below is
          labelled with its actual published status.
        </p>
      </div>

      <JepSection title={`Stable in Java ${latestVersion.version}`} jeps={stable} tone="accent" />
      <JepSection title="Preview and incubator (not production-ready)" jeps={notStable} tone="risk" />

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
        Source of truth: Oracle / OpenJDK. Verified {VERSION_DATA_VERIFIED_ON}. {VERSION_DATA_SOURCE_NOTE}
      </p>
    </div>
  );
}

function JepSection({
  title,
  jeps,
  tone,
}: {
  title: string;
  jeps: typeof latestVersion.jeps;
  tone: 'accent' | 'risk';
}) {
  if (jeps.length === 0) return null;
  return (
    <section className="surface-card mt-4 p-5">
      <h2
        className="mono-label mb-3"
        style={{ color: tone === 'accent' ? 'var(--accent-text)' : 'var(--risk-text)' }}
      >
        {title} ({jeps.length})
      </h2>
      <ul className="space-y-2">
        {jeps.map((jep) => (
          <li key={jep.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://openjdk.org/jeps/${jep.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[0.75rem] text-[var(--accent-text)] hover:underline"
              >
                JEP {jep.id}
                <ExternalLink size={10} strokeWidth={2} aria-hidden="true" />
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
    </section>
  );
}
