/** Section registry — drives the navbar, scrollspy and command palette. */

import { tailoring } from '../config/tailoring';

export const SECTION_IDS = [
  'overview',
  'skills',
  'experience',
  'banking',
  'projects',
  'ai',
  'architecture',
  'constellation',
  'certifications',
  'discussion',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface NavSection {
  id: SectionId;
  label: string;
  /** Two-digit index rendered as a mono label. */
  index: string;
  /** Shown in the navbar (a subset keeps the bar compact). */
  primary?: boolean;
}

/** Sections that always render, regardless of tailoring. */
const ALWAYS_ON: SectionId[] = ['overview', 'contact'];

const allSections: NavSection[] = [
  { id: 'overview', label: 'Overview', index: '01', primary: true },
  { id: 'skills', label: 'Skills', index: '02', primary: true },
  { id: 'experience', label: 'Experience', index: '03', primary: true },
  { id: 'banking', label: 'Banking', index: '04' },
  { id: 'projects', label: 'Projects', index: '05', primary: true },
  { id: 'ai', label: 'AI Engineering', index: '06', primary: true },
  { id: 'architecture', label: 'Architecture', index: '07', primary: true },
  { id: 'constellation', label: 'Technology Map', index: '08' },
  { id: 'certifications', label: 'Certifications', index: '09', primary: true },
  { id: 'discussion', label: 'Technical Discussion', index: '10' },
  { id: 'contact', label: 'Contact', index: '11', primary: true },
];

const hidden = new Set<SectionId>(
  (tailoring.hiddenSections as readonly SectionId[]).filter((id) => !ALWAYS_ON.includes(id)),
);

export const sections: NavSection[] = allSections.filter((s) => !hidden.has(s.id));

export const primarySections = sections.filter((s) => s.primary);

/** Used by App.tsx to decide whether to mount a section at all. */
export function isSectionVisible(id: SectionId) {
  return !hidden.has(id);
}
