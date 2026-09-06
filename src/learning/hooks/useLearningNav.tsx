/**
 * LEARNING NAVIGATION STACK — context-preserving navigation.
 *
 * Browser back is not enough: exploring HashMap -> hashCode() -> equals()
 * -> Object Contract and then wanting to "return to the original question"
 * needs an explicit stack, not just history.back(). This is that stack,
 * persisted to sessionStorage so a refresh mid-exploration doesn't lose it.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AnswerLevel } from '../types';

export interface LearningContext {
  route: string;
  title: string;
  sourceRoute?: string;
  sourceTitle?: string;
  sectionId?: string;
  questionId?: string;
  answerLevel?: AnswerLevel;
  scrollPosition?: number;
  selectedTab?: string;
  timestamp: number;
}

const STORAGE_KEY = 'eip-learning-nav-stack';
const MAX_STACK = 25;

function loadStack(): LearningContext[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearningContext[]) : [];
  } catch {
    return [];
  }
}

function saveStack(stack: LearningContext[]) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
  } catch {
    // sessionStorage may be unavailable (private browsing) — fail silently.
  }
}

interface LearningNavApi {
  stack: LearningContext[];
  /** The context to show as "Exploring from: ..." — the bottom of the stack. */
  source: LearningContext | undefined;
  /** The context "Back" should return to — the top of the stack. */
  top: LearningContext | undefined;
  /** Push the CURRENT page's context before navigating away to explore a term. */
  pushContext: (ctx: Omit<LearningContext, 'timestamp'>) => void;
  /** Pop and navigate back to the most recently visited context ("Learning Back"). */
  popContext: () => void;
  /** Jump straight back to whatever started this exploration ("Return to Source"). */
  returnToSource: () => void;
  clear: () => void;
}

const Ctx = createContext<LearningNavApi | null>(null);

export function LearningNavProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<LearningContext[]>(loadStack);
  const navigate = useNavigate();

  useEffect(() => saveStack(stack), [stack]);

  const restore = useCallback(
    (ctx: LearningContext) => {
      navigate(ctx.route);
      if (typeof ctx.scrollPosition === 'number') {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => window.scrollTo({ top: ctx.scrollPosition, behavior: 'auto' })),
        );
      }
    },
    [navigate],
  );

  const pushContext = useCallback((ctx: Omit<LearningContext, 'timestamp'>) => {
    setStack((s) => {
      const next = [...s, { ...ctx, timestamp: Date.now() }];
      return next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next;
    });
  }, []);

  const popContext = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      restore(s[s.length - 1]);
      return s.slice(0, -1);
    });
  }, [restore]);

  const returnToSource = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      restore(s[0]);
      return [];
    });
  }, [restore]);

  const clear = useCallback(() => setStack([]), []);

  const value = useMemo<LearningNavApi>(
    () => ({
      stack,
      source: stack[0],
      top: stack[stack.length - 1],
      pushContext,
      popContext,
      returnToSource,
      clear,
    }),
    [stack, pushContext, popContext, returnToSource, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLearningNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLearningNav must be used within LearningNavProvider');
  return ctx;
}
