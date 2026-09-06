/**
 * JD MATCH — heuristic job-description analyser.
 *
 * This is a CLIENT-SIDE preview matcher, not the LLM-backed analysis described
 * in TODO §2. It scans the pasted JD text for the candidate's known skills
 * (names + aliases) and a small set of common senior-engineering keywords,
 * then classifies them into:
 *   - matched: skills the candidate has that the JD mentions
 *   - gaps:    keywords the JD asks for that the candidate does not list
 *   - stretch: senior/leadership signals present in the JD
 *
 * It is deliberately conservative: it only ever reports a skill as "matched"
 * when that skill genuinely exists in src/data/skills.ts. No invented claims.
 *
 * Wiring the real LLM endpoint later only changes `analyseJd` — the UI stays.
 */

import { skills, type Skill } from '../data/skills';

export interface JdMatchResult {
  matched: Skill[];
  gaps: string[];
  stretch: string[];
  wordCount: number;
}

/** Keywords that signal seniority / leadership, independent of a specific tech. */
const STRETCH_SIGNALS = [
  'lead',
  'principal',
  'staff',
  'architect',
  'mentor',
  'manage',
  'management',
  'leadership',
  'team lead',
  'tech lead',
  'head of',
  'director',
  'drive',
  'own',
  'roadmap',
  'stakeholder',
];

/**
 * Common senior-engineering terms that, if absent from the candidate's skill
 * catalogue, are reported as a potential gap. Kept short and generic on
 * purpose — this is a preview, not a definitive gap analysis.
 */
const COMMON_ASKS = [
  'go',
  'golang',
  'kotlin',
  'scala',
  'c#',
  '.net',
  'node',
  'graphql',
  'grpc',
  'kubernetes',
  'terraform',
  'ansible',
  'kafka',
  'rabbitmq',
  'cassandra',
  'mongodb',
  'elasticsearch',
  'redis',
  'spark',
  'airflow',
  'dbt',
  'snowflake',
  'databricks',
  'react',
  'angular',
  'vue',
  'svelte',
  'next.js',
  'typescript',
  'python',
  'java',
  'rust',
  'spring',
  'django',
  'fastapi',
  'aws',
  'azure',
  'gcp',
  'docker',
  'ci/cd',
  'jenkins',
  'gitlab',
  'sonarqube',
  'llm',
  'rag',
  'genai',
  'pytorch',
  'tensorflow',
  'hugging face',
];

function normalise(text: string) {
  return text.toLowerCase();
}

function contains(haystack: string, needle: string) {
  // Word-boundary-ish match so "go" doesn't hit "good" / "google".
  const re = new RegExp(`(^|[^a-z0-9.#])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9.#]|$)`);
  return re.test(haystack);
}

export function analyseJd(jd: string): JdMatchResult {
  const text = normalise(jd);
  const wordCount = jd.trim().split(/\s+/).filter(Boolean).length;

  // Matched: candidate skills whose name or alias appears in the JD.
  const matched = skills.filter((s) => {
    const name = normalise(s.name);
    if (contains(text, name)) return true;
    return (s.aliases ?? []).some((a) => contains(text, normalise(a)));
  });

  // Gaps: common asks present in the JD but NOT in the candidate's catalogue.
  const haveNames = new Set(skills.flatMap((s) => [normalise(s.name), ...(s.aliases ?? []).map(normalise)]));
  const gaps = COMMON_ASKS.filter(
    (ask) => contains(text, ask) && !Array.from(haveNames).some((h) => h === ask || h.includes(ask)),
  );

  // Stretch: seniority/leadership signals present in the JD.
  const stretch = STRETCH_SIGNALS.filter((sig) => text.includes(sig));

  return { matched, gaps, stretch, wordCount };
}
