/**
 * LEARNING HUB — core data models.
 *
 * These types are technology-agnostic on purpose. Java is the first
 * technology module built on top of them (see src/learning/data/java/),
 * but nothing here should need to change to add Spring Boot, React,
 * Python, Kafka, etc. later.
 *
 * Content lives entirely in src/learning/data — never inline large
 * educational text in a component.
 */

/** Canonical, lowercase-kebab id. Never create hash-map / HashMap variants. */
export type TopicId = string;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'senior' | 'architect';

export type AnswerLevel = 'quick' | 'interview' | 'detailed' | 'senior';

export type FeatureStatus = 'stable' | 'preview' | 'incubator' | 'deprecated' | 'removed';

export type ReferenceType = 'official' | 'jep' | 'api' | 'documentation' | 'article' | 'video';

/**
 * Relationship types for the knowledge graph. Deliberately richer than a
 * generic "related" so the graph can reason about direction and intent.
 */
export type RelationshipType =
  | 'prerequisite'
  | 'related'
  | 'part-of'
  | 'alternative'
  | 'comparison'
  | 'introduced-in'
  | 'replaced-by'
  | 'commonly-confused-with'
  | 'used-with'
  | 'interview-follow-up';

export interface LearningReference {
  title: string;
  url: string;
  source: string;
  type: ReferenceType;
  description?: string;
  /** Java (or other technology) version this reference is tied to, if any. */
  version?: number | string;
  status?: 'stable' | 'preview' | 'incubator';
}

/** A generic cross-technology entity resolvable by the registry. */
export interface LearningEntity {
  id: TopicId;
  technology: string;
  title: string;
  route: string;
  category: string;
  aliases?: string[];
  shortDescription?: string;
  prerequisites?: TopicId[];
  relatedTopics?: TopicId[];
  nextTopics?: TopicId[];
  references?: LearningReference[];
}

/* --------------------------------------------------------------- visuals */

export type VisualType =
  | 'flow'
  | 'architecture'
  | 'comparison'
  | 'timeline'
  | 'lifecycle'
  | 'memory'
  | 'tree'
  | 'decision'
  | 'code-flow';

export interface VisualNode {
  id: string;
  label: string;
  /** If set, the node is clickable and resolves through the topic registry. */
  topicId?: TopicId;
  description?: string;
  /** Optional short caption shown under the label (e.g. a value, a status). */
  caption?: string;
}

export interface VisualEdge {
  from: string;
  to: string;
  label?: string;
}

export interface LearningVisual {
  id: string;
  topicId: TopicId;
  type: VisualType;
  title: string;
  description?: string;
  nodes?: VisualNode[];
  edges?: VisualEdge[];
  /** A compact one-line mnemonic shown under the diagram. */
  memoryTip?: string;
  /** For "comparison" visuals: two labelled node lists side by side. */
  columns?: { label: string; nodes: VisualNode[] }[];
}

/* ---------------------------------------------------------- AI-awareness */

/**
 * Teaching simulation of how a knowledgeable interviewer (human or
 * AI-assisted) probes an answer. This is NOT a claim about how any specific
 * commercial AI interview product scores candidates.
 */
export interface AiAwareness {
  strongAnswerShouldMention: string[];
  weakAnswer: string;
  redFlags: string[];
  likelyFollowUp: string[];
}

/* ------------------------------------------------------------- topics */

export interface LearningTopic {
  id: TopicId;
  technology: string;
  title: string;
  category: string;
  slug: string;
  status?: 'draft' | 'published';
  difficulty?: Difficulty;

  oneLineMeaning: string;
  mentalModel?: string;
  memoryTip?: string;
  keyTerms?: string[];

  visualIds?: string[];

  interviewAnswer?: string;
  detailedExplanation?: string;
  internalWorking?: string;

  codeExample?: string;
  codeOutput?: string;
  whyOutput?: string;

  practicalExample?: string;
  commonMistakes?: string[];
  seniorInsight?: string;
  aiAwareness?: AiAwareness;

  /** Topic-level follow-up prompts (free text, not necessarily tied to a question id). */
  followUpQuestions?: string[];

  prerequisites?: TopicId[];
  relatedTopics?: TopicId[];
  nextTopics?: TopicId[];

  references?: LearningReference[];
  interviewQuestions?: string[];

  /** Version this concept was introduced in, if version-specific (e.g. 21 for Virtual Threads). */
  introducedIn?: number;
  featureStatus?: FeatureStatus;
}

/* --------------------------------------------------------- questions */

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: Difficulty;

  quickAnswer: string;
  interviewAnswer: string;
  detailedAnswer: string;
  seniorAnswer: string;

  keyTerms: string[];
  conceptsTested: string[];

  prerequisites?: TopicId[];
  relatedTopics?: TopicId[];
  /** IDs of other InterviewQuestions this one commonly leads to. */
  followUps?: string[];

  commonMistakes?: string[];
  strongAnswerKeywords?: string[];

  codeExample?: string;
  expectedOutput?: string;

  /** "What is the interviewer testing?" — teaches intent, not just content. */
  interviewerIntent?: string;
  whatIsBeingTested?: string[];

  aiAwareness?: AiAwareness;
}

/* ---------------------------------------------------------- glossary */

export interface GlossaryTerm {
  id: string;
  term: string;
  simple: string;
  technical: string;
  keyWords: string[];
  relatedTopics?: TopicId[];
  reference?: LearningReference;
}

/* ----------------------------------------------------- version model */

export interface JepEntry {
  id: number;
  title: string;
  status: FeatureStatus;
  /** One or two sentence, non-hallucinated summary. */
  summary: string;
}

export type VersionStatus = 'current' | 'current-lts' | 'supported' | 'legacy';

export interface JavaVersionMeta {
  version: number;
  releaseDate: string;
  isLTS: boolean;
  status: VersionStatus;
  jeps: JepEntry[];
  highlights: string[];
  eoslPremier?: string;
  sourceUrl: string;
}

/* --------------------------------------------------- future AI hooks */

/**
 * Abstraction for a future AI-assisted learning service. Not implemented in
 * v1 — no commercial AI provider is connected. Rule-based logic (e.g. the
 * heuristic JD matcher elsewhere in this app) must never be presented as AI.
 */
export interface LearningAIService {
  explainTopic(topicId: TopicId): Promise<string>;
  evaluateAnswer(questionId: string, answer: string): Promise<{ score: 'weak' | 'partial' | 'strong'; feedback: string }>;
  generateFollowUps(questionId: string): Promise<string[]>;
}

/* ---------------------------------------------------- future code exec */

export interface JavaExecutionRequest {
  code: string;
}

export interface JavaExecutionResult {
  stdout: string;
  stderr: string;
  durationMs: number;
}

/**
 * Abstraction for a future sandboxed execution backend. Never execute
 * arbitrary code client-side or without isolation/resource limits — v1 only
 * ships trusted, precomputed example code and output.
 */
export interface CodeExecutionService {
  executeJava(input: JavaExecutionRequest): Promise<JavaExecutionResult>;
}
