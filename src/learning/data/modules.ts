/**
 * MODULE HOME CONFIG — content for the generic TechHome page used by every
 * module that doesn't need a bespoke home (Java/Kafka/React have their own).
 * Category names must match the `category` field used in each module's topics.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Cloud,
  Database,
  FileCode2,
  Gauge,
  GitBranch,
  Globe,
  Layers,
  Lock,
  MessageSquareText,
  Network,
  Package,
  Radar,
  Repeat,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

export interface ModuleCategoryCard {
  category: string;
  blurb: string;
  icon: LucideIcon;
}

export interface ModuleHomeConfig {
  id: string;
  title: string;
  tagline: string;
  seoDescription: string;
  categoryCards: ModuleCategoryCard[];
  productionNote: string;
}

export const MODULE_HOMES: Record<string, ModuleHomeConfig> = {
  'spring-boot': {
    id: 'spring-boot',
    title: 'Spring Boot & Microservices Lab',
    tagline:
      'From IoC and auto-configuration to production microservices — transactions, resilience, security, gateways and the Maven build that ships it.',
    seoDescription:
      'Spring Boot and microservices interview preparation — DI, auto-configuration, JPA, transactions, Spring Cloud Gateway, Resilience4j, security and Maven.',
    categoryCards: [
      { category: 'Spring Core', blurb: 'IoC, DI, bean scopes, lifecycle, auto-configuration, profiles.', icon: Boxes },
      { category: 'Web & REST', blurb: 'Controllers, validation, global exception handling, filters vs interceptors.', icon: Globe },
      { category: 'Data & Transactions', blurb: '@Transactional internals, propagation, N+1, JPA pitfalls.', icon: Database },
      { category: 'Microservices', blurb: 'Service discovery, config, gateway, Saga, Outbox, inter-service calls.', icon: Network },
      { category: 'Resilience & Security', blurb: 'Circuit breaker, retry, rate limiting, JWT/OAuth2, Actuator.', icon: ShieldCheck },
      { category: 'Maven & Build', blurb: 'Lifecycle, scopes, dependency conflicts, BOMs, multi-module builds.', icon: Package },
    ],
    productionNote:
      'Written from the perspective of running Spring Boot services in regulated banking: idempotent APIs, transactional outbox into Kafka, resilience around slow downstream systems, and observability via Actuator, Micrometer and distributed tracing.',
  },
  'system-design': {
    id: 'system-design',
    title: 'System Design Lab',
    tagline:
      'Scalability, consistency and resilience — plus API Gateways, REST API design and the classic design case studies interviewers actually ask.',
    seoDescription:
      'System design interview preparation — CAP, caching, sharding, rate limiting, API Gateway, REST API design and case studies like URL shortener and payments.',
    categoryCards: [
      { category: 'Fundamentals', blurb: 'Scaling, CAP/PACELC, load balancing, back-of-envelope estimates.', icon: Layers },
      { category: 'Data & Caching', blurb: 'Caching strategies, sharding, replication, consistent hashing.', icon: Database },
      { category: 'API Gateway', blurb: 'Gateway responsibilities, BFF, rate limiting, auth offload.', icon: Server },
      { category: 'REST API Design', blurb: 'Resource modelling, idempotency, versioning, pagination, status codes.', icon: FileCode2 },
      { category: 'Case Studies', blurb: 'URL shortener, rate limiter, notification system, payments.', icon: Workflow },
    ],
    productionNote:
      'Trade-offs are framed the way senior interviews expect: start with requirements and numbers, choose the simplest design that meets them, then name the failure modes and what you would monitor.',
  },
  genai: {
    id: 'genai',
    title: 'GenAI Engineering Lab',
    tagline:
      'LLMs, RAG, prompt and context engineering, guardrails and LLMOps — how to build AI features that are grounded, safe, observable and affordable.',
    seoDescription:
      'GenAI and LLM interview preparation — RAG, embeddings, prompt engineering, context engineering, guardrails, agents, evaluation and LLMOps.',
    categoryCards: [
      { category: 'LLM Fundamentals', blurb: 'Tokens, embeddings, context windows, sampling, hallucination.', icon: Brain },
      { category: 'RAG', blurb: 'Chunking, vector search, hybrid retrieval, reranking, evaluation.', icon: Search },
      { category: 'Prompt Engineering', blurb: 'Few-shot, chain-of-thought, structured output, tool calling.', icon: MessageSquareText },
      { category: 'Context Engineering', blurb: 'Context budgets, memory, agents, what goes into the window.', icon: Bot },
      { category: 'Guardrails', blurb: 'Prompt injection, PII, output validation, grounding checks.', icon: Lock },
      { category: 'LLMOps', blurb: 'Evaluation, observability, cost/latency, model routing, versioning.', icon: Gauge },
    ],
    productionNote:
      'Grounded in production patterns such as the Portfolio-IQ RAG chatbot (FAISS + LangChain) and agentic triage on Amazon Bedrock: retrieval quality first, guardrails in front of and behind the model, and evaluation in CI.',
  },
  mlops: {
    id: 'mlops',
    title: 'MLOps & AIOps Lab',
    tagline:
      'Ship and operate models like software — reproducible pipelines, registries, deployment strategies, drift monitoring — and use ML to run IT operations.',
    seoDescription:
      'MLOps and AIOps interview preparation — ML pipelines, model registry, feature stores, drift detection, deployment strategies, anomaly detection and AIOps.',
    categoryCards: [
      { category: 'MLOps', blurb: 'Pipelines, experiment tracking, registry, feature stores, CI/CD/CT.', icon: GitBranch },
      { category: 'Model Serving & Monitoring', blurb: 'Batch vs online, canary/shadow, data and concept drift.', icon: Activity },
      { category: 'AIOps', blurb: 'Anomaly detection, event correlation, RCA, auto-remediation.', icon: Radar },
    ],
    productionNote:
      'Emphasises what breaks in production: training/serving skew, silent drift, unreproducible models and alert fatigue — and the controls that make ML auditable in regulated environments.',
  },
  angular: {
    id: 'angular',
    title: 'Angular Engineering Lab',
    tagline:
      'Components, DI, RxJS, change detection and signals, forms, routing and state — the Angular internals senior interviews probe.',
    seoDescription:
      'Angular interview preparation — components, dependency injection, RxJS operators, change detection, signals, reactive forms, routing guards and NgRx.',
    categoryCards: [
      { category: 'Angular Core', blurb: 'Components, lifecycle hooks, DI hierarchy, standalone components.', icon: Boxes },
      { category: 'RxJS', blurb: 'Observables, higher-order mapping operators, subjects, unsubscribe.', icon: Repeat },
      { category: 'Change Detection & Signals', blurb: 'Zone.js, OnPush, signals, computed, effects.', icon: Zap },
      { category: 'Forms & Routing', blurb: 'Reactive forms, validators, guards, resolvers, lazy loading.', icon: BookOpen },
      { category: 'State & Architecture', blurb: 'Services vs NgRx, interceptors, performance, testing.', icon: Cloud },
    ],
    productionNote:
      'Focused on enterprise Angular: large forms, OnPush everywhere, HTTP interceptors for auth and errors, and keeping RxJS streams leak-free.',
  },
};

/** Fallback icon for categories not listed in a module's config. */
export const DEFAULT_CATEGORY_ICON: LucideIcon = Sparkles;
