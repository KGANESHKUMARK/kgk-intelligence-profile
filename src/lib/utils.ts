import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Tone = 'accent' | 'ai' | 'risk' | 'neutral';

/** Maps a semantic tone onto the CSS custom-property triad defined in index.css. */
export const toneVars: Record<Tone, { fg: string; soft: string; line: string; raw: string }> = {
  accent: { fg: 'var(--accent-text)', soft: 'var(--accent-soft)', line: 'var(--accent-line)', raw: 'var(--accent)' },
  ai: { fg: 'var(--ai-text)', soft: 'var(--ai-soft)', line: 'var(--ai-line)', raw: 'var(--ai)' },
  risk: { fg: 'var(--risk-text)', soft: 'var(--risk-soft)', line: 'var(--risk-line)', raw: 'var(--risk)' },
  neutral: { fg: 'var(--text-2)', soft: 'var(--surface-2)', line: 'var(--line-strong)', raw: 'var(--text-2)' },
};

export function toneStyle(tone: Tone = 'accent') {
  const t = toneVars[tone];
  return {
    '--t-fg': t.fg,
    '--t-soft': t.soft,
    '--t-line': t.line,
    '--t-raw': t.raw,
  } as React.CSSProperties;
}

/** Scrolls to a section id, accounting for the sticky header. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // Move focus for keyboard + screen-reader users without triggering a second scroll.
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** Case-insensitive "does haystack contain needle" across several fields. */
export function matches(query: string, ...fields: (string | string[] | undefined)[]): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => {
    if (!f) return false;
    const text = Array.isArray(f) ? f.join(' ') : f;
    return text.toLowerCase().includes(q);
  });
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Deterministic point on a circle — used by the radar and constellation. */
export function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}
