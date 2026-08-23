import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Command, Download, Menu, Moon, Presentation, Share2, Sun, X } from 'lucide-react';
import { Button, LinkButton } from '../common/Button';
import { primarySections, sections } from '../../data/navigation';
import { profile } from '../../data/profile';
import { useScrollProgress, useScrolled, useScrollSpy } from '../../hooks/useScrollSpy';
import { useShare } from '../../hooks/useShare';
import { useAppState } from '../../hooks/useAppState';
import { cn, scrollToSection } from '../../lib/utils';
import { EASE } from '../../lib/motion';

const sectionIds = sections.map((s) => s.id);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = useScrolled();
  const progress = useScrollProgress();
  const active = useScrollSpy(sectionIds);
  const { share, message } = useShare();
  const { theme, toggleTheme, setPaletteOpen, interviewMode, toggleInterviewMode } = useAppState();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const go = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <a
        href="#overview"
        className="sr-only rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-[var(--bg)] focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120]"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'no-print fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
      >
        {/* reading progress */}
        <div
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--accent)]"
          style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 0.9 : 0 }}
          aria-hidden="true"
        />

        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Identity mark */}
          <button
            type="button"
            onClick={() => go('overview')}
            className="group flex shrink-0 items-center gap-2.5 rounded-lg pr-2 text-left"
            aria-label={`${profile.name} — back to overview`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[var(--accent-line)] bg-[var(--accent-soft)]">
              <span className="font-mono text-xs font-semibold text-[var(--accent-text)]">GK</span>
              <span className="absolute -top-px -right-px h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-80" />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[0.8125rem] font-semibold tracking-tight">{profile.name}</span>
              <span className="mono-label text-[0.625rem]">Engineering Profile</span>
            </span>
          </button>

          {/* Desktop nav */}
          <ul className="hide-scrollbar mx-auto hidden items-center gap-0.5 overflow-x-auto lg:flex">
            {primarySections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={cn(
                    'relative rounded-lg px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors',
                    active === s.id
                      ? 'text-[var(--text)]'
                      : 'text-[var(--text-3)] hover:text-[var(--text-2)]',
                  )}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ duration: 0.28, ease: EASE }}
                      className="absolute inset-0 -z-10 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]"
                    />
                  )}
                  {s.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <Button
              variant={interviewMode ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleInterviewMode}
              aria-pressed={interviewMode}
              className="hidden md:inline-flex"
            >
              <Presentation size={14} strokeWidth={2} aria-hidden="true" />
              Interview Mode
            </Button>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              className="hidden items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-[var(--text-3)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-2)] xl:flex"
            >
              <Command size={13} strokeWidth={2} aria-hidden="true" />
              <span className="font-mono text-[0.6875rem]">K</span>
            </button>

            <LinkButton
              href={profile.resumeFile}
              download
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              aria-label="Download resume as PDF"
            >
              <Download size={14} strokeWidth={2} aria-hidden="true" />
              <span className="hidden lg:inline">Resume</span>
            </LinkButton>

            <Button variant="outline" size="sm" onClick={share} aria-label="Share this profile" className="px-2.5">
              {message ? (
                <Check size={14} strokeWidth={2} className="text-[var(--accent-text)]" aria-hidden="true" />
              ) : (
                <Share2 size={14} strokeWidth={2} aria-hidden="true" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="px-2.5"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileOpen((v) => !v)}
              className="px-2.5 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
            </Button>
          </div>
        </nav>

        {/* Share toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-none absolute top-[4.25rem] right-4 rounded-lg border border-[var(--accent-line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--accent-text)] shadow-[var(--shadow-lift)] sm:right-6 lg:right-8"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="no-print fixed inset-0 top-16 z-40 overflow-y-auto bg-[var(--bg)] lg:hidden"
          >
            <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
              <ul className="space-y-1">
                {sections.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
                  >
                    <button
                      type="button"
                      onClick={() => go(s.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                        active === s.id
                          ? 'border-[var(--accent-line)] bg-[var(--accent-soft)]'
                          : 'border-[var(--line)] bg-[var(--surface)]',
                      )}
                    >
                      <span className="mono-label">{s.index}</span>
                      <span className="text-sm font-medium">{s.label}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant={interviewMode ? 'primary' : 'secondary'}
                  onClick={() => {
                    toggleInterviewMode();
                    setMobileOpen(false);
                  }}
                >
                  <Presentation size={15} strokeWidth={2} aria-hidden="true" />
                  Interview Mode
                </Button>
                <LinkButton href={profile.resumeFile} download variant="secondary">
                  <Download size={15} strokeWidth={2} aria-hidden="true" />
                  Resume
                </LinkButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
