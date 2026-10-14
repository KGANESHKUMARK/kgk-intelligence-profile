/**
 * TECHNOLOGY LABELS — display names for learning modules, keyed by the
 * canonical technology id used in routes and data files.
 */
export const TECH_LABELS: Record<string, string> = {
  java: 'Java',
  kafka: 'Kafka',
  react: 'React',
  'spring-boot': 'Spring Boot',
  'system-design': 'System Design',
  genai: 'GenAI',
  mlops: 'MLOps & AIOps',
  angular: 'Angular',
};

/** Primary language used for code blocks in each module (overridable per item via codeLanguage). */
const TECH_LANGUAGES: Record<string, string> = {
  java: 'Java',
  kafka: 'Java',
  react: 'TypeScript',
  'spring-boot': 'Java',
  'system-design': 'Java',
  genai: 'Python',
  mlops: 'Python',
  angular: 'TypeScript',
};

/** Ordered list of built tracks — drives the Learning Hub header switcher and route matching. */
export const TRACK_IDS = ['java', 'spring-boot', 'system-design', 'kafka', 'react', 'angular', 'genai', 'mlops'] as const;

/** Modules rendered by the generic TechHome page / generic routes (Java, Kafka, React have bespoke pages). */
export const GENERIC_TRACK_IDS: readonly string[] = ['spring-boot', 'system-design', 'genai', 'mlops', 'angular'];

export function techLabel(technology: string): string {
  return TECH_LABELS[technology] ?? technology;
}

export function techLanguage(technology: string): string {
  return TECH_LANGUAGES[technology] ?? 'Code';
}

export function isKnownTrack(technology: string): boolean {
  return (TRACK_IDS as readonly string[]).includes(technology);
}
