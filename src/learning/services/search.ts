/**
 * LEARNING SEARCH — a small, dependency-free local search index.
 *
 * The content set is deliberately small (dozens, not thousands, of items in
 * this phase), so a plain filter/sort over a flat index is the right choice
 * — no search library needed. Alias-aware: searching "GC" or "CHM" matches
 * the same items as searching the full name.
 */

import { matches } from '../../lib/utils';
import { allGlossary, allQuestions, allTopics, allVersions, topicRoute } from './registry';
import { ALIASES, normalizeTerm } from '../utils/normalize';

export type SearchResultType = 'topic' | 'question' | 'glossary' | 'version';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  route: string;
  keywords: string[];
}

function questionRoute(id: string): string {
  if (id.startsWith('q-kafka-')) return `/learning/kafka/interview?q=${id}`;
  if (id.startsWith('q-react-')) return `/learning/react/interview?q=${id}`;
  return `/learning/java/interview?q=${id}`;
}

function glossaryRoute(id: string): string {
  if (id.startsWith('kafka-glossary-')) return `/learning/kafka/glossary?term=${id}`;
  if (id.startsWith('react-glossary-')) return `/learning/react/glossary?term=${id}`;
  return `/learning/java/glossary?term=${id}`;
}

function buildIndex(): SearchResult[] {
  const topicResults: SearchResult[] = allTopics.map((t) => ({
    id: t.id,
    type: 'topic',
    title: t.title,
    subtitle: t.category,
    route: topicRoute(t.id),
    keywords: [t.title, t.category, ...(t.keyTerms ?? [])],
  }));

  const questionResults: SearchResult[] = allQuestions.map((q) => ({
    id: q.id,
    type: 'question',
    title: q.question,
    subtitle: q.category,
    route: questionRoute(q.id),
    keywords: [q.question, q.category, ...q.keyTerms, ...q.conceptsTested],
  }));

  const glossaryResults: SearchResult[] = allGlossary.map((g) => ({
    id: g.id,
    type: 'glossary',
    title: g.term,
    subtitle: 'Glossary',
    route: glossaryRoute(g.id),
    keywords: [g.term, ...g.keyWords],
  }));

  const versionResults: SearchResult[] = allVersions.map((v) => ({
    id: String(v.version),
    type: 'version',
    title: `Java ${v.version}`,
    subtitle: v.isLTS ? 'LTS release' : 'Feature release',
    route: `/learning/java/versions/${v.version}`,
    keywords: [`Java ${v.version}`, ...v.jeps.map((j) => `JEP ${j.id}`), ...v.jeps.map((j) => j.title)],
  }));

  return [...topicResults, ...questionResults, ...glossaryResults, ...versionResults];
}

let cachedIndex: SearchResult[] | null = null;
function getIndex(): SearchResult[] {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

/** Expand common abbreviations in a query so "gc" also matches "Garbage Collection". */
function expandQuery(query: string): string[] {
  const normalized = normalizeTerm(query);
  const alias = ALIASES[normalized];
  return alias ? [query, alias.replace(/-/g, ' ')] : [query];
}

export function searchLearningContent(query: string, limit = 20): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const terms = expandQuery(q);
  const index = getIndex();
  return index.filter((item) => terms.some((t) => matches(t, item.title, item.subtitle, item.keywords))).slice(0, limit);
}
