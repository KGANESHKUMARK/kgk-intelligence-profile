/**
 * LEARNING REGISTRY — the single place that resolves ids/aliases to real
 * content, and validates that the knowledge graph has no dangling links.
 *
 * Every component should go through this file to resolve a topic, question,
 * visual or glossary term — never hard-code a route or reach into a data
 * file directly.
 *
 * Technologies: Java, Kafka, React. New modules plug in here by adding imports
 * and merging into the combined arrays below.
 */

import { javaTopics } from '../data/java/topics';
import { javaQuestions } from '../data/java/questions';
import { javaVisuals } from '../data/java/visuals';
import { javaGlossary } from '../data/java/glossary';
import { javaVersions } from '../data/java/versions';
import { kafkaTopics } from '../data/kafka/topics';
import { kafkaQuestions } from '../data/kafka/questions';
import { kafkaVisuals } from '../data/kafka/visuals';
import { kafkaGlossary } from '../data/kafka/glossary';
import { reactTopics } from '../data/react/topics';
import { reactQuestions } from '../data/react/questions';
import { reactVisuals } from '../data/react/visuals';
import { reactGlossary } from '../data/react/glossary';
import { ALIASES, normalizeTerm } from '../utils/normalize';
import type { GlossaryTerm, InterviewQuestion, LearningTopic, LearningVisual } from '../types';

/* ---------------------------------------- combined cross-technology maps */

const allTopicsRaw = [...javaTopics, ...kafkaTopics, ...reactTopics];
const allQuestionsRaw = [...javaQuestions, ...kafkaQuestions, ...reactQuestions];
const allVisualsRaw = [...javaVisuals, ...kafkaVisuals, ...reactVisuals];
const allGlossaryRaw = [...javaGlossary, ...kafkaGlossary, ...reactGlossary];

const topicsById = new Map(allTopicsRaw.map((t) => [t.id, t]));
const questionsById = new Map(allQuestionsRaw.map((q) => [q.id, q]));
const visualsById = new Map(allVisualsRaw.map((v) => [v.id, v]));
const glossaryById = new Map(allGlossaryRaw.map((g) => [g.id, g]));

/* ------------------------------------------------------------- lookups */

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
  return allGlossaryRaw.find((g) => normalizeTerm(g.term) === normalized);
}

/**
 * Stable route for a topic — technology-aware.
 * Reads the topic's technology field so links always point to the right module.
 */
export function topicRoute(id: string): string {
  const topic = topicsById.get(id);
  const tech = topic?.technology ?? 'java';
  return `/learning/${tech}/topic/${id}`;
}

/* ------------------------------------------------- public combined lists */

export const allTopics = allTopicsRaw;
export const allQuestions = allQuestionsRaw;
export const allVisuals = allVisualsRaw;
export const allGlossary = allGlossaryRaw;
export const allVersions = javaVersions;

/* ---------------------------------------- per-technology filtered helpers */

export function topicsByTechnology(technology: string) {
  return allTopicsRaw.filter((t) => t.technology === technology);
}

export function questionsByTechnology(technology: string) {
  return allQuestionsRaw.filter((q) => {
    // Questions don't have a technology field directly — ids are prefixed per module.
    if (technology === 'kafka') return q.id.startsWith('q-kafka-');
    if (technology === 'react') return q.id.startsWith('q-react-');
    return !q.id.startsWith('q-kafka-') && !q.id.startsWith('q-react-');
  });
}

export function glossaryByTechnology(technology: string) {
  return allGlossaryRaw.filter((g) => {
    if (technology === 'kafka') return g.id.startsWith('kafka-glossary-');
    if (technology === 'react') return g.id.startsWith('react-glossary-');
    return !g.id.startsWith('kafka-glossary-') && !g.id.startsWith('react-glossary-');
  });
}

export function topicsByCategory(category: string, technology?: string) {
  const base = technology ? topicsByTechnology(technology) : allTopicsRaw;
  return base.filter((t) => t.category === category);
}

export function categoryList(technology?: string) {
  const base = technology ? topicsByTechnology(technology) : allTopicsRaw;
  return Array.from(new Set(base.map((t) => t.category)));
}

/** @deprecated Use topicsByCategory with technology param */
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
 */
export function validateRegistry(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const checkTopicIds = (source: string, field: string, ids?: string[]) => {
    (ids ?? []).forEach((id) => {
      if (!topicsById.has(id)) issues.push({ source, field, brokenRef: id });
    });
  };

  for (const topic of allTopicsRaw) {
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

  for (const visual of allVisualsRaw) {
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

  for (const question of allQuestionsRaw) {
    checkTopicIds(`question:${question.id}`, 'prerequisites', question.prerequisites);
    checkTopicIds(`question:${question.id}`, 'relatedTopics', question.relatedTopics);
    (question.followUps ?? []).forEach((fid) => {
      if (!questionsById.has(fid)) issues.push({ source: `question:${question.id}`, field: 'followUps', brokenRef: fid });
    });
  }

  for (const term of allGlossaryRaw) {
    checkTopicIds(`glossary:${term.id}`, 'relatedTopics', term.relatedTopics);
  }

  // Every topic id must be unique and canonical (kebab-case, no duplicates).
  const seen = new Set<string>();
  for (const topic of allTopicsRaw) {
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
