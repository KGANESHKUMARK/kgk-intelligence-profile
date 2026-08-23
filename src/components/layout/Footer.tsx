import { Command, Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '../../data/profile';
import { useAppState } from '../../hooks/useAppState';

const pillars = ['AI', 'Banking', 'Full Stack', 'Cloud', 'Platform Engineering'];

export function Footer() {
  const { setPaletteOpen } = useAppState();
  const year = new Date().getFullYear();

  return (
    <footer className="no-print border-t border-[var(--line)] bg-[var(--bg-elev)]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)] font-mono text-xs font-semibold text-[var(--accent-text)]">
                GK
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">{profile.name}</p>
                <p className="text-xs text-[var(--text-3)]">{profile.title}</p>
              </div>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] text-[var(--text-3)]">
              {pillars.map((p, i) => (
                <span key={p} className="flex items-center gap-2">
                  {p}
                  {i < pillars.length - 1 && <span className="text-[var(--line-strong)]">·</span>}
                </span>
              ))}
            </p>
          </div>

          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-2">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
            >
              <Github size={13} strokeWidth={1.75} aria-hidden="true" />
              GitHub
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
            >
              <Linkedin size={13} strokeWidth={1.75} aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href={`mailto:${profile.social.email}`}
              className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
            >
              <Mail size={13} strokeWidth={1.75} aria-hidden="true" />
              Email
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col-reverse items-start gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.6875rem] text-[var(--text-3)]">
            © {year} {profile.name}. Built with React, TypeScript, Tailwind CSS and Motion.
          </p>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[0.6875rem] text-[var(--text-3)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-2)]"
          >
            <Command size={12} strokeWidth={1.75} aria-hidden="true" />
            <span className="font-mono">Ctrl K</span>
            <span>for quick navigation</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
