import { Link, useLocation } from 'react-router-dom';
import { Command, GraduationCap, Moon, Sun, UserRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAppState } from '../../hooks/useAppState';
import { cn } from '../../lib/utils';

const NAV = [
  { label: 'Java Home', to: '/learning/java' },
  { label: "What's New", to: '/learning/java/latest' },
  { label: 'Versions', to: '/learning/java/versions' },
  { label: 'Interview', to: '/learning/java/interview' },
  { label: 'Flashcards', to: '/learning/java/flashcards' },
  { label: 'Quiz', to: '/learning/java/quiz' },
  { label: 'Glossary', to: '/learning/java/glossary' },
];

export function LearningLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, setPaletteOpen } = useAppState();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-50" aria-hidden="true" />

      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_85%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/learning/java" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]">
              <GraduationCap size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[0.8125rem] font-semibold tracking-tight">Java Engineering Lab</span>
              <span className="mono-label text-[0.625rem]">Learning Hub</span>
            </span>
          </Link>

          <nav aria-label="Learning sections" className="hide-scrollbar mx-auto hidden items-center gap-0.5 overflow-x-auto lg:flex">
            {NAV.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-[var(--surface-2)] text-[var(--text)]'
                      : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
              <Command size={14} strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden font-mono text-[0.6875rem] sm:inline">Ctrl K</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
            </Button>
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[0.75rem] text-[var(--text-2)] transition-colors hover:border-[var(--accent-line)] hover:text-[var(--accent-text)]"
            >
              <UserRound size={13} strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">Resume</span>
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto border-t border-[var(--line)] px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1.5 text-[0.75rem] font-medium whitespace-nowrap transition-colors',
                location.pathname === item.to
                  ? 'bg-[var(--surface-2)] text-[var(--text)]'
                  : 'text-[var(--text-3)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main id="learning-main" className="relative mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        {children}
      </main>

      <footer className="relative border-t border-[var(--line)] bg-[var(--bg-elev)] py-6">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3 px-4 text-[0.6875rem] text-[var(--text-3)] sm:px-6 lg:px-8">
          <span>Java Engineering Lab — a learning module of the Engineering Intelligence Profile.</span>
          <Link to="/" className="ml-auto hover:text-[var(--accent-text)]">
            Back to resume portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
