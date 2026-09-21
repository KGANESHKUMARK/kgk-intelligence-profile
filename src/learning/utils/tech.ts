/**
 * TECHNOLOGY LABELS — display names for learning modules, keyed by the
 * canonical technology id used in routes and data files.
 */
export const TECH_LABELS: Record<string, string> = {
  java: 'Java',
  kafka: 'Kafka',
  react: 'React',
};

export function techLabel(technology: string): string {
  return TECH_LABELS[technology] ?? technology;
}
