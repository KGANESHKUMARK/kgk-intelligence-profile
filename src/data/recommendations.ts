/**
 * RECOMMENDATIONS — LinkedIn recommendation quotes rendered as testimonials.
 *
 * These are PLACEHOLDER entries. Replace each `quote`, `name`, `title`,
 * `company` and `relationship` with the real text copied from your LinkedIn
 * profile's "Recommendations" section. Do not invent quotes that were not
 * actually written about you — keep the social proof genuine.
 *
 * Shape:
 *   { name, title, company, relationship, quote, date }
 *
 * `initials` is derived automatically from `name` in the component; you do
 * not need to set it. `tone` only affects the avatar accent colour.
 */

export type RecommendationTone = 'accent' | 'ai' | 'risk';

export interface Recommendation {
  id: string;
  name: string;
  title: string;
  company: string;
  /** How this person worked with you, e.g. "Engineering Manager", "Direct report". */
  relationship: string;
  /** The recommendation text, copied verbatim from LinkedIn. */
  quote: string;
  /** Display date as it appears on LinkedIn, e.g. "March 2024". */
  date: string;
  tone: RecommendationTone;
}

export const recommendations: Recommendation[] = [
  {
    id: 'placeholder-1',
    name: 'Placeholder Manager',
    title: 'Engineering Manager',
    company: 'Placeholder Company',
    relationship: 'Manager',
    quote:
      'PLACEHOLDER — replace this with a real recommendation copied from your LinkedIn profile. Ganesh consistently delivered high-quality, production-grade systems and mentored the team through complex architectural decisions.',
    date: 'Month Year',
    tone: 'accent',
  },
  {
    id: 'placeholder-2',
    name: 'Placeholder Colleague',
    title: 'Senior Software Engineer',
    company: 'Placeholder Company',
    relationship: 'Peer',
    quote:
      'PLACEHOLDER — replace this with a real recommendation copied from your LinkedIn profile. A strong technical lead who bridges AI research and enterprise delivery with rare clarity.',
    date: 'Month Year',
    tone: 'ai',
  },
  {
    id: 'placeholder-3',
    name: 'Placeholder Report',
    title: 'Software Engineer',
    company: 'Placeholder Company',
    relationship: 'Direct report',
    quote:
      'PLACEHOLDER — replace this with a real recommendation copied from your LinkedIn profile. Excellent mentor who grew the team and shipped reliable systems under real deadline pressure.',
    date: 'Month Year',
    tone: 'risk',
  },
];
