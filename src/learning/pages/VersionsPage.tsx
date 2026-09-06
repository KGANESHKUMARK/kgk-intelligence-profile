import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/ContextBar';
import { StatusBadge } from '../components/StatusBadge';
import { javaVersions, VERSION_DATA_SOURCE_NOTE, VERSION_DATA_VERIFIED_ON } from '../data/java/versions';
import { useLearningSeo } from '../hooks/useLearningSeo';
import { cn } from '../../lib/utils';
import type { JavaVersionMeta } from '../types';

export default function VersionsPage() {
  useLearningSeo('Java Version Timeline', 'Java 8 to 26 — releases, LTS status, key JEPs and interview relevance.');

  const [left, setLeft] = useState(8);
  const [right, setRight] = useState(21);

  const leftVersion = javaVersions.find((v) => v.version === left)!;
  const rightVersion = javaVersions.find((v) => v.version === right)!;

  return (
    <div>
      <Breadcrumbs crumbs={[{ label: 'Java', href: '/learning/java' }, { label: 'Versions' }]} />

      <header className="surface-card ticked p-5 sm:p-6">
        <span className="mono-label">Evolution</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Java Version Timeline</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--text-2)]">
          Java 8 through 26 — what shipped, what&apos;s LTS, and which features are actually stable versus still in
          preview.
        </p>
        <p className="mt-3 text-[0.6875rem] leading-relaxed text-[var(--text-3)]">
          Source of truth: Oracle / OpenJDK. Verified {VERSION_DATA_VERIFIED_ON}. {VERSION_DATA_SOURCE_NOTE}
        </p>
      </header>

      {/* Timeline */}
      <section className="mt-4">
        <h2 className="mono-label mb-3">Releases</h2>
        <ol className="space-y-3">
          {javaVersions.map((v) => (
            <li key={v.version}>
              <VersionRow version={v} />
            </li>
          ))}
        </ol>
      </section>

      {/* Compare */}
      <section className="surface-card mt-4 p-5">
        <h2 className="mono-label mb-3">Compare versions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <VersionSelect label="From" value={left} onChange={setLeft} />
          <ArrowRight size={15} strokeWidth={2} className="text-[var(--text-3)]" aria-hidden="true" />
          <VersionSelect label="To" value={right} onChange={setRight} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CompareColumn version={leftVersion} />
          <CompareColumn version={rightVersion} />
        </div>
      </section>
    </div>
  );
}

function VersionRow({ version }: { version: JavaVersionMeta }) {
  const stableCount = version.jeps.filter((j) => j.status === 'stable').length;
  const previewCount = version.jeps.length - stableCount;

  return (
    <Link
      to={`/learning/java/versions/${version.version}`}
      className="surface-card group flex flex-col gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)] sm:flex-row sm:items-center"
    >
      <div className="flex shrink-0 items-center gap-3 sm:w-48">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold',
            version.status === 'current'
              ? 'border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]'
              : version.status === 'current-lts'
                ? 'border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                : 'border-[var(--line-strong)] bg-[var(--surface-2)] text-[var(--text-2)]',
          )}
        >
          {version.version}
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight">Java {version.version}</span>
          <span className="mono-label text-[0.625rem]">{version.releaseDate}</span>
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {version.isLTS && (
            <span className="mono-label rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--accent-text)]">
              LTS
            </span>
          )}
          {version.status === 'current' && (
            <span className="mono-label rounded border border-[var(--ai-line)] bg-[var(--ai-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--ai-text)]">
              latest
            </span>
          )}
          {version.status === 'current-lts' && (
            <span className="mono-label rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--accent-text)]">
              current LTS
            </span>
          )}
          <span className="font-mono text-[0.6875rem] text-[var(--text-3)]">
            {stableCount} stable · {previewCount} preview/incubator
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
          {version.highlights[0]}
        </p>
      </div>

      <ArrowRight
        size={15}
        strokeWidth={2}
        className="hidden shrink-0 text-[var(--text-3)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent-text)] sm:block"
        aria-hidden="true"
      />
    </Link>
  );
}

function VersionSelect({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-[0.8125rem] text-[var(--text-2)]">
      <span className="mono-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent-line)]"
      >
        {javaVersions.map((v) => (
          <option key={v.version} value={v.version}>
            Java {v.version}
            {v.isLTS ? ' (LTS)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareColumn({ version }: { version: JavaVersionMeta }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold tracking-tight">Java {version.version}</span>
        {version.isLTS && (
          <span className="mono-label rounded border border-[var(--accent-line)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--accent-text)]">
            LTS
          </span>
        )}
        <span className="mono-label ml-auto text-[0.625rem]">{version.releaseDate}</span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {version.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>

      <p className="mono-label mt-4 mb-2">Key JEPs</p>
      <ul className="space-y-1.5">
        {version.jeps.slice(0, 6).map((jep) => (
          <li key={jep.id} className="flex items-start gap-2">
            <span className="font-mono text-[0.6875rem] text-[var(--text-3)]">{jep.id}</span>
            <span className="min-w-0 flex-1 text-[0.75rem] leading-snug text-[var(--text-2)]">{jep.title}</span>
            {jep.status !== 'stable' && <StatusBadge status={jep.status} />}
          </li>
        ))}
      </ul>

      <Link
        to={`/learning/java/versions/${version.version}`}
        className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] text-[var(--accent-text)] hover:underline"
      >
        All {version.jeps.length} JEPs
        <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}
