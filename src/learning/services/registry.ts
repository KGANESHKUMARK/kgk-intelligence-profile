/**
 * LEARNING REGISTRY — the single place that resolves ids/aliases to real
 * content, and validates that the knowledge graph has no dangling links.
 *
 * Every component should go through this file to resolve a topic, question,
 * visual or glossary term — never hard-code a route or reach into a data
 * file directly.
 */

import { javaTopics } from '../data/java/topics';
import { javaQuestions } from '../data/java/questions';
import { javaVisuals } from '../data/java/visuals';
import { javaGlossary } from '../data/java/glossary';
import { javaVersions } from '../data/java/versions';
import { ALIASES, normalizeTerm } from '../utils/normalize';
import type { GlossaryTerm, InterviewQuestion, LearningTopic, LearningVisual } from '../types';

/* ------------------------------------------------------------- lookups */

const topicsById = new Map(javaTopics.map((t) => [t.id, t]));
const questionsById = new Map(javaQuestions.map((q) => [q.id, q]));
const visualsById = new Map(javaVisuals.map((v) => [v.id, v]));
const glossaryById = new Map(javaGlossary.map((g) => [g.id, g]));

/** Resolve any surface form ("HashMap", "Hash Map", "java.util.HashMap") to a topic. */
export function resolveTopicId(input: string): string | undefined {
  const normalized = normalizeTerm(input);
  const aliased = ALIASES[normalized];
  if (aliased && topicsById.has(aliased)) return aliased;
  if (topicsById.has(normalized)) return normalized;
  return undefined;
}

export function getTopic(idOrAlias: string): LearningTopic | undefined {
  const id = resolveTopicId(idOrAlias);
  return id ? topicsById.get(id) : undefined;
}

export function getQuestion(id: string): InterviewQuestion | undefined {
  return questionsById.get(id);
}

export function getVisual(id: string): LearningVisual | undefined {
  return visualsById.get(id);
}

/** Glossary lookup by id or by matching the term text itself. */
export function getGlossaryTerm(idOrTerm: string): GlossaryTerm | undefined {
  if (glossaryById.has(idOrTerm)) return glossaryById.get(idOrTerm);
  const normalized = normalizeTerm(idOrTerm);
  return javaGlossary.find((g) => normalizeTerm(g.term) === normalized);
}

/** Stable route for a topic. The ONE place the URL pattern is defined. */
export function topicRoute(id: string): string {
  return `/learning/java/topic/${id}`;
}

export const allTopics = javaTopics;
export const allQuestions = javaQuestions;
export const allVisuals = javaVisuals;
export const allGlossary = javaGlossary;
export const allVersions = javaVersions;

export function topicsByCategory(category: string) {
  return javaTopics.filter((t) => t.category === category);
}

export const topicCategories = Array.from(new Set(javaTopics.map((t) => t.category)));

/* ------------------------------------------------------- dev validation */

export interface ValidationIssue {
  source: string;
  field: string;
  brokenRef: string;
}

/**
 * Development-time validator — checks every cross-reference in the
 * knowledge graph resolves to a real id. Call this once in dev (see
 * main.tsx) and read the console for "Learning Hub content error" entries.
 * Never ships as a hard build failure (no custom build tooling added), but
 * makes broken content links impossible to miss during development.
 */
export function validateRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const checkTopicIds = (source: string, field: string, ids?: string[]) => {
    (ids ?? []).forEach((id) => {
      if (!topicsById.has(id)) issues.push({ source, field, brokenRef: id });
    });
  };

  for (const topic of javaTopics) {
    checkTopicIds(`topic:${topic.id}`, 'prerequisites', topic.prerequisites);
    checkTopicIds(`topic:${topic.id}`, 'relatedTopics', topic.relatedTopics);
    checkTopicIds(`topic:${topic.id}`, 'nextTopics', topic.nextTopics);
    (topic.visualIds ?? []).forEach((vid) => {
      if (!visualsById.has(vid)) issues.push({ source: `topic:${topic.id}`, field: 'visualIds', brokenRef: vid });
    });
    (topic.interviewQuestions ?? []).forEach((qid) => {
      if (!questionsById.has(qid)) issues.push({ source: `topic:${topic.id}`, field: 'interviewQuestions', brokenRef: qid });
    });
  }

  for (const visual of javaVisuals) {
    if (!topicsById.has(visual.topicId)) {
      issues.push({ source: `visual:${visual.id}`, field: 'topicId', brokenRef: visual.topicId });
    }
    (visual.nodes ?? []).forEach((n) => {
      if (n.topicId && !topicsById.has(n.topicId)) {
        issues.push({ source: `visual:${visual.id}`, field: 'nodes[].topicId', brokenRef: n.topicId });
      }
    });
    (visual.columns ?? []).forEach((col) =>
      col.nodes.forEach((n) => {
        if (n.topicId && !topicsById.has(n.topicId)) {
          issues.push({ source: `visual:${visual.id}`, field: 'columns[].nodes[].topicId', brokenRef: n.topicId });
        }
      }),
    );
  }

  for (const question of javaQuestions) {
    checkTopicIds(`question:${question.id}`, 'prerequisites', question.prerequisites);
    checkTopicIds(`question:${question.id}`, 'relatedTopics', question.relatedTopics);
    (question.followUps ?? []).forEach((fid) => {
      if (!questionsById.has(fid)) issues.push({ source: `question:${question.id}`, field: 'followUps', brokenRef: fid });
    });
  }

  for (const term of javaGlossary) {
    checkTopicIds(`glossary:${term.id}`, 'relatedTopics', term.relatedTopics);
  }

  // Every topic id must be unique and canonical (kebab-case, no duplicates).
  const seen = new Set<string>();
  for (const topic of javaTopics) {
    if (seen.has(topic.id)) issues.push({ source: `topic:${topic.id}`, field: 'id', brokenRef: 'duplicate id' });
    seen.add(topic.id);
  }

  if (issues.length > 0 && typeof console !== 'undefined') {
    console.error(
      `Learning Hub content error: ${issues.length} broken reference(s) in the knowledge graph.`,
      issues,
    );
  }

  return issues;
}
