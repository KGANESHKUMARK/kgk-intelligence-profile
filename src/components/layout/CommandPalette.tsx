import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Moon,
  Presentation,
  Printer,
  Search,
  Share2,
  Sun,
} from 'lucide-react';
import { sections } from '../../data/navigation';
import { skills } from '../../data/skills';
import { profile } from '../../data/profile';
import { useAppState } from '../../hooks/useAppState';
import { useShare } from '../../hooks/useShare';
import { cn, matches, scrollToSection } from '../../lib/utils';
import { EASE } from '../../lib/motion';

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, theme, toggleTheme, setInterviewMode, focusSkill, printResume } =
    useAppState();
  const { share } = useShare();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = () => setPaletteOpen(false);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = sections.map((s) => ({
      id: `nav-${s.id}`,
      label: s.label,
      hint: `Section ${s.index}`,
      group: 'Navigate',
      icon: <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />,
      run: () => {
        close();
        setInterviewMode(false);
        scrollToSection(s.id);
      },
    }));

    const actions: Command[] = [
      {
        id: 'interview',
        label: 'Interview Mode',
        hint: '90-second profile + guided story',
        group: 'Actions',
        icon: <Presentation size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          setInterviewMode(true);
        },
      },
      {
        id: 'download',
        label: 'Download Resume',
        hint: 'PDF',
        group: 'Actions',
        icon: <Download size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          const a = document.createElement('a');
          a.href = profile.resumeFile;
          a.download = '';
          a.click();
        },
      },
      {
        id: 'print',
        label: 'Print Resume',
        hint: 'Clean print layout',
        group: 'Actions',
        icon: <Printer size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: printResume,
      },
      {
        id: 'share',
        label: 'Share Profile',
        hint: 'Copies the link',
        group: 'Actions',
        icon: <Share2 size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          void share();
        },
      },
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        group: 'Actions',
        icon:
          theme === 'dark' ? (
            <Sun size={15} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Moon size={15} strokeWidth={1.75} aria-hidden="true" />
          ),
        run: () => {
          close();
          toggleTheme();
        },
      },
    ];

    const links: Command[] = [
      {
        id: 'github',
        label: 'GitHub',
        hint: profile.social.github.replace('https://', ''),
        group: 'Links',
        icon: <Github size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          window.open(profile.social.github, '_blank', 'noopener,noreferrer');
        },
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        hint: profile.social.linkedin.replace('https://', ''),
        group: 'Links',
        icon: <Linkedin size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          window.open(profile.social.linkedin, '_blank', 'noopener,noreferrer');
        },
      },
      {
        id: 'email',
        label: 'Email',
        hint: profile.social.email,
        group: 'Links',
        icon: <Mail size={15} strokeWidth={1.75} aria-hidden="true" />,
        run: () => {
          close();
          window.location.href = `mailto:${profile.social.email}`;
        },
      },
    ];

    const tech: Command[] = skills.map((s) => ({
      id: `skill-${s.id}`,
      label: s.name,
      hint: s.category,
      group: 'Technologies',
      icon: <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" />,
      run: () => {
        close();
        focusSkill(s.id);
      },
    }));

    return [...nav, ...actions, ...links, ...tech];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, share, toggleTheme, setInterviewMode, focusSkill, printResume]);

  const filtered = useMemo(() => {
    const list = commands.filter((c) => matches(query, c.label, c.hint, c.group));
    // Technologies are noisy — only surface them once the user actually types.
    return query.trim() ? list.slice(0, 40) : list.filter((c) => c.group !== 'Technologies');
  }, [commands, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    if (!paletteOpen) return;
    setQuery('');
    setIndex(0);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
    };
  }, [paletteOpen]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-cmd-index="${index}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[index]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  let flatIndex = -1;

  return createPortal(
    <AnimatePresence>
      {paletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={close}
            className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elev)] shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <Search size={16} strokeWidth={1.75} className="shrink-0 text-[var(--text-3)]" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to a section, action or technology..."
                aria-label="Search commands"
                aria-controls="command-list"
                className="h-12 w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-3)]"
              />
              <kbd className="hidden shrink-0 rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[0.625rem] text-[var(--text-3)] sm:block">
                ESC
              </kbd>
            </div>

            <div ref={listRef} id="command-list" role="listbox" className="max-h-[54vh] overflow-y-auto p-2">
              {groups.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-[var(--text-3)]">No results for “{query}”.</p>
              )}

              {groups.map(([group, items]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <p className="mono-label px-3 py-2">{group}</p>
                  {items.map((c) => {
                    flatIndex += 1;
                    const isActive = flatIndex === index;
                    const myIndex = flatIndex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-cmd-index={myIndex}
                        onMouseEnter={() => setIndex(myIndex)}
                        onClick={c.run}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-[var(--surface-2)] text-[var(--text)]' : 'text-[var(--text-2)]',
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-[var(--accent-text)]' : 'text-[var(--text-3)]')}>
                          {c.icon}
                        </span>
                        <span className="flex-1 truncate text-sm">{c.label}</span>
                        {c.hint && (
                          <span className="hidden truncate font-mono text-[0.6875rem] text-[var(--text-3)] sm:block">
                            {c.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-[var(--line)] px-4 py-2.5 text-[0.6875rem] text-[var(--text-3)]">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-[var(--line)] px-1 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-[var(--line)] px-1 font-mono">↵</kbd> select
              </span>
              <span className="ml-auto hidden font-mono sm:block">{filtered.length} results</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
