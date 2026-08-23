import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTheme, type Theme } from './useTheme';
import { scrollToSection } from '../lib/utils';

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  interviewMode: boolean;
  setInterviewMode: (v: boolean) => void;
  toggleInterviewMode: () => void;
  /** Cross-section drill-down: focus a technology in the Skills Explorer. */
  focusedSkill: string | null;
  focusSkill: (id: string | null) => void;
  printResume: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const [focusedSkill, setFocusedSkill] = useState<string | null>(null);

  // Cmd/Ctrl + K toggles the command palette from anywhere.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const focusSkill = useCallback((id: string | null) => {
    setFocusedSkill(id);
    if (id) {
      setInterviewMode(false);
      requestAnimationFrame(() => scrollToSection('skills'));
    }
  }, []);

  const printResume = useCallback(() => {
    setInterviewMode(false);
    setPaletteOpen(false);
    // Let React commit the print-only resume view before invoking print().
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }, []);

  const value = useMemo<AppState>(
    () => ({
      theme,
      toggleTheme,
      paletteOpen,
      setPaletteOpen,
      interviewMode,
      setInterviewMode,
      toggleInterviewMode: () => setInterviewMode((v) => !v),
      focusedSkill,
      focusSkill,
      printResume,
    }),
    [theme, toggleTheme, paletteOpen, interviewMode, focusedSkill, focusSkill, printResume],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
