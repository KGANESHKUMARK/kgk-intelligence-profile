/**
 * INTERVIEW CONTENT — "Ask Me About" chips, the technical discussion bank,
 * the guided story, and the 90-second profile.
 *
 * Everything here is written to be spoken. Keep answers tight.
 */

import { certifications } from './certifications';

export interface AskTopic {
  id: string;
  label: string;
  category: 'Backend' | 'Frontend' | 'AI' | 'Data' | 'Platform' | 'Domain';
  headline: string;
  body: string;
  /** What I would point at as evidence. */
  evidence: string;
  related: string[];
}

export const askTopics: AskTopic[] = [
  {
    id: 'java',
    label: 'Java',
    category: 'Backend',
    headline: 'Java 8 through Java 25, continuously since 2013.',
    body: 'I use Java where correctness and ecosystem maturity matter most — banking services that must be auditable and debuggable years later. Currently on Java 25 with Spring Boot 3 for the output management platform; previously Java 21 on the Newton performance estate.',
    evidence: 'Global Output Management (Java 25) · Newton Performance Product (Java 21) · Verizon BGW (Core Java)',
    related: ['Spring Boot', 'Microservices', 'JUnit', 'Kafka'],
  },
  {
    id: 'spring-boot',
    label: 'Spring Boot',
    category: 'Backend',
    headline: 'The default service framework across my banking work.',
    body: 'Spring Boot 3 microservices consuming Kafka and IBM MQ, applying business rules, exposing REST contracts. I care most about clean boundaries, constructor injection, testability without a running container, and configuration that differs safely per environment.',
    evidence: 'Global Output Management validation and rules services',
    related: ['Java', 'Microservices', 'REST APIs', 'Apache Camel'],
  },
  {
    id: 'rust',
    label: 'Rust',
    category: 'Backend',
    headline: 'Chosen for the transaction service where throughput and safety both mattered.',
    body: 'The Newton Portfolio Transaction Management service is Rust: Tokio for async concurrency, RdKafka for streaming, Serde for serialisation, cron schedulers for periodic operations. Coverage enforced with cargo-tarpaulin and Sonar-Rust in the pipeline.',
    evidence: 'Newton Portfolio Transaction Management — Aladdin',
    related: ['Kafka', 'REST APIs', 'CI/CD'],
  },
  {
    id: 'react',
    label: 'React',
    category: 'Frontend',
    headline: 'React 19 for the current operations console.',
    body: 'Component architecture with typed props, data fetching kept out of presentational components, and state scoped as locally as possible. On banking UIs the hard parts are entitlement-aware rendering and large datasets — both solved server-side, not in the browser.',
    evidence: 'Global Output Management console · Verizon UUI 3.0',
    related: ['TypeScript', 'Angular', 'Jest'],
  },
  {
    id: 'angular',
    label: 'Angular',
    category: 'Frontend',
    headline: 'Angular 6 through Angular 20 across three employers.',
    body: 'Angular is where a lot of my enterprise front-end depth comes from — dependency injection, RxJS streams, module boundaries and long-lived codebases that several teams touch. Newton Client Reporting ran on Angular 14.',
    evidence: 'Newton Client Reporting (Angular 14) · Verizon UUI (Angular 6+)',
    related: ['TypeScript', 'React', 'Jest'],
  },
  {
    id: 'python',
    label: 'Python',
    category: 'AI',
    headline: 'The language for everything model-related.',
    body: 'Data preprocessing, training with TensorFlow and PyTorch, classical ML with scikit-learn, and LLM application code with LangChain. Paired with an M.Tech in AI/ML from BITS Pilani, so the theory underneath the libraries is there too.',
    evidence: 'Newton Client Reporting RAG system · market-trend prediction models',
    related: ['LLMs', 'RAG', 'TensorFlow', 'MLOps'],
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    category: 'AI',
    headline: 'An agent in production, on the operations exception path.',
    body: 'The AI Output Failure Resolution Agent at Julius Baer monitors output-processing exceptions, analyses root causes, validates business conditions, and recommends or triggers remediation workflows. The engineering content is in the bounds: step budgets, deterministic business validation, human approval before state changes, and a full trace of every step.',
    evidence: 'AI Output Failure Resolution Agent — Bank of Julius Baer',
    related: ['LLMs', 'Guardrails', 'Evaluation', 'Claude AI'],
  },
  {
    id: 'rag',
    label: 'RAG',
    category: 'AI',
    headline: 'LangChain + FAISS, grounded on the bank\'s own reporting content.',
    body: 'Retrieval-Augmented Generation connects LLM responses to trusted enterprise knowledge. In practice most of the difficulty is not the model — it is chunking strategy, embedding version management, entitlement-aware metadata filtering, and measuring retrieval quality separately from answer quality.',
    evidence: 'NLP-driven Client Reporting System — Bank of New York',
    related: ['LLMs', 'FAISS', 'LangChain', 'Evaluation'],
  },
  {
    id: 'llms',
    label: 'LLMs',
    category: 'AI',
    headline: 'Claude AI and Snowflake Cortex AI in regulated production workflows.',
    body: 'Intelligent document processing across Equities, FX, Derivatives and Precious Metals output. Running inference inside Snowflake via Cortex means the data never leaves the governance boundary — which is usually the blocking concern in a bank, not model quality.',
    evidence: 'Global Output Management document processing',
    related: ['RAG', 'Prompt Engineering', 'Guardrails', 'Snowflake'],
  },
  {
    id: 'kafka',
    label: 'Kafka',
    category: 'Data',
    headline: 'The event backbone under both my current and previous platforms.',
    body: 'Avro-governed schemas with compatibility rules, partitioning chosen for parallelism without breaking ordering guarantees, idempotent consumers keyed on event id, retry topics with backoff and a dead letter queue for poison messages. Consumer lag is a first-class alert.',
    evidence: 'Global Output Management · Newton Portfolio Transaction Management',
    related: ['Apache Flink', 'IBM MQ', 'Avro', 'Microservices'],
  },
  {
    id: 'kubernetes',
    label: 'Kubernetes',
    category: 'Platform',
    headline: 'Runtime for banking microservices and the Verizon OSS migration.',
    body: 'Probes that reflect real health rather than "process is up", resource requests sized from observed usage, horizontal autoscaling on a signal that actually correlates with load, and PodDisruptionBudgets so rollouts do not take capacity below the floor.',
    evidence: 'Global Output Management deployment · Verizon XO migration',
    related: ['Docker', 'Helm', 'ArgoCD', 'CI/CD'],
  },
  {
    id: 'aws',
    label: 'AWS',
    category: 'Platform',
    headline: 'AWS Developer Associate certified; primary cloud in current work.',
    body: 'Compute and storage for the output management platform, with AWS OpsDocs handling durable document archival under retention policy. I have also worked across Azure — Solutions Architect Expert certified — and GCP App Engine and Vertex AI.',
    evidence: 'AWS OpsDocs archival — Julius Baer',
    related: ['Kubernetes', 'Terraform', 'Azure', 'Docker'],
  },
  {
    id: 'snowflake',
    label: 'Snowflake',
    category: 'Data',
    headline: 'SnowPro Associate certified; warehouse plus in-database AI.',
    body: 'Snowpipe for continuous ingestion, separated compute per workload so analytics does not contend with loading, and Cortex AI for LLM functions that run next to the data. The governance argument for in-warehouse inference is often what gets AI approved in a bank.',
    evidence: 'Global Output Management analytics · Newton platform',
    related: ['Cortex AI', 'Airflow', 'Databricks', 'SQL'],
  },
  {
    id: 'postgresql',
    label: 'PostgreSQL',
    category: 'Data',
    headline: 'Relational modelling and query tuning, alongside heavy Oracle experience.',
    body: 'Most of my production relational work is Oracle — schema design, PL/SQL, indexing and Liquibase/Flyway migrations. The same discipline carries to PostgreSQL: index the real access path, verify with the execution plan, and treat migrations as reviewable code.',
    evidence: 'Newton Portfolio Transaction Management SQL schemas',
    related: ['Oracle', 'SQL', 'Liquibase / Flyway'],
  },
  {
    id: 'system-design',
    label: 'System Design',
    category: 'Platform',
    headline: 'Start from failure modes, not the happy path.',
    body: 'My design sequence is: what decision does this support, where does state live, what breaks first, and how do we roll back. Sync versus async is a durability question, not a performance one. Most banking systems I have built are event-driven precisely because retry and replay have to be first-class.',
    evidence: 'Event-driven Global Output Management architecture',
    related: ['Microservices', 'Kafka', 'Kubernetes'],
  },
  {
    id: 'banking',
    label: 'Banking Technology',
    category: 'Domain',
    headline: 'Five and a half years at BNY, now at Bank of Julius Baer.',
    body: 'Investment performance returns from portfolio and accounting data for segregated and pooled clients. Client reporting. Portfolio transaction management. Now client output across Equities, Securities, FX, Derivatives and Precious Metals. The domain constraints — auditability, entitlements, reconciliation, month-end peaks — shape every technical decision.',
    evidence: 'Aladdin / Newton estate · Global Output Management',
    related: ['Aladdin', 'Kafka', 'Snowflake', 'System Design'],
  },
  {
    id: 'microservices',
    label: 'Microservices',
    category: 'Backend',
    headline: 'Decomposition that follows the domain, not the org chart.',
    body: 'Each service owns its data and publishes events; nobody reads another service\'s tables. Contracts are versioned and schema-governed. The hard parts are distributed transactions — usually solved with idempotency and eventual consistency rather than two-phase commit — and keeping the deployment story simple enough to actually operate.',
    evidence: 'Newton estate · Verizon logical inventory migration',
    related: ['Kafka', 'Spring Boot', 'Kubernetes', 'REST APIs'],
  },
];

/* ------------------------------------------------- Technical discussion bank */

export interface DiscussionQuestion {
  id: string;
  question: string;
  approach: string;
  components: string[];
  failures: string[];
  tradeoffs: string[];
}

export interface DiscussionCategory {
  id: string;
  label: string;
  icon: string;
  questions: DiscussionQuestion[];
}

export const discussionCategories: DiscussionCategory[] = [
  {
    id: 'system-design',
    label: 'System Design',
    icon: 'Network',
    questions: [
      {
        id: 'payments',
        question: 'How would you design a resilient payment processing service?',
        approach:
          'Treat every payment as an event with a client-supplied idempotency key. Accept, persist, then process asynchronously — never do the money movement inline with the HTTP request. Model the payment as a state machine so every transition is auditable and replayable.',
        components: [
          'Idempotency key store checked before any side effect',
          'Durable inbox: persist the request before acknowledging',
          'State machine — Received → Validated → Authorised → Settled → Reconciled',
          'Kafka topic per transition with Avro-governed schemas',
          'Outbox pattern so DB write and event publish cannot diverge',
          'Reconciliation job against the ledger as the source of truth',
        ],
        failures: [
          'Duplicate submission — idempotency key returns the original result',
          'Downstream authoriser timeout — circuit breaker plus retry with backoff, payment stays in Authorising',
          'Poison message — DLQ with alerting, never blocking the partition',
          'Partial failure between DB commit and event publish — outbox pattern eliminates the window',
          'Replay after incident — events are replayable because consumers are idempotent',
        ],
        tradeoffs: [
          'Async acceptance gives resilience but the client must handle a pending state.',
          'Exactly-once is expensive; idempotent at-least-once is usually the right call.',
          'Strong consistency in the ledger, eventual consistency in reporting.',
        ],
      },
      {
        id: 'output-scale',
        question: 'How do you handle month-end peaks in a document generation platform?',
        approach:
          'Separate arrival rate from processing rate with a queue, then scale the processing tier horizontally. The generation work is embarrassingly parallel per document, so the constraint is usually the shared database and the rendering licence pool, not CPU.',
        components: [
          'Kafka as the buffer absorbing the arrival spike',
          'Stateless generation workers scaled by consumer lag, not CPU',
          'Priority lanes so time-critical output is not stuck behind bulk runs',
          'Connection pooling and read replicas for reference data',
          'Backpressure signalled upstream when the archive tier saturates',
        ],
        failures: [
          'Autoscaling on CPU instead of lag — scales too late',
          'Database connection exhaustion as workers scale out',
          'One slow client run starving the rest — mitigated by fair partitioning',
          'Archive write failures leaving documents generated but unstored',
        ],
        tradeoffs: [
          'Over-provisioning for peak is expensive; queue-based smoothing trades latency for cost.',
          'Priority lanes add operational complexity but protect regulatory deadlines.',
        ],
      },
    ],
  },
  {
    id: 'ai-genai',
    label: 'AI / GenAI',
    icon: 'BrainCircuit',
    questions: [
      {
        id: 'rag-prod',
        question: 'How do you take a RAG system from demo to production in a bank?',
        approach:
          'The demo proves the model can answer. Production requires proving it answers correctly, only from data the user is entitled to see, and that you would notice if it stopped. Build the evaluation harness before scaling the corpus.',
        components: [
          'Golden dataset of real questions with verified answers',
          'Retrieval measured separately from generation — recall@k before answer quality',
          'Entitlement filtering applied at retrieval, enforced at the data source',
          'Citations returned with every answer so a human can verify',
          'Embedding model version pinned; re-index pipeline when it changes',
          'Production sampling scored continuously, not just at release',
        ],
        failures: [
          'Retrieval misses — the answer is fluent and wrong',
          'Chunk boundaries splitting a table from its header',
          'Stale index after source documents change',
          'Prompt injection through an ingested document',
          'Silent quality decay after a provider model update',
        ],
        tradeoffs: [
          'Larger chunks preserve context but dilute retrieval precision.',
          'Refusing when confidence is low reduces usefulness but is the right default in banking.',
          'In-warehouse inference (Cortex) limits model choice but removes the data egress objection.',
        ],
      },
      {
        id: 'agent-safety',
        question: 'How do you make an autonomous agent safe enough for production operations?',
        approach:
          'Bound it. An agent in an operational context should be allowed to investigate freely and act narrowly. Read-only tools run without approval; anything that changes state passes deterministic business validation and then a human.',
        components: [
          'Step and wall-clock budget with hard termination',
          'Tool allow-list scoped to the user\'s role',
          'Deterministic business-rule validation — not model judgement — before any write',
          'Human approval gate on state changes, with the full trace visible',
          'Every step traced with a correlation id back to the triggering event',
          'Idempotent tool implementations so a retry cannot double-apply',
        ],
        failures: [
          'Loop without progress — caught by the step budget',
          'Goal drift across many steps',
          'Compounding errors where step three trusts a wrong conclusion from step one',
          'Tool called with malformed arguments',
        ],
        tradeoffs: [
          'Human approval slows resolution but is non-negotiable for state changes in a bank.',
          'Tighter budgets reduce capability but make behaviour predictable.',
        ],
      },
    ],
  },
  {
    id: 'kafka',
    label: 'Kafka & Events',
    icon: 'Radio',
    questions: [
      {
        id: 'kafka-reliability',
        question: 'How do you guarantee no lost or duplicated events in a Kafka pipeline?',
        approach:
          'Accept that at-least-once delivery is what you get, and make consumers idempotent so duplicates are harmless. Combine with an outbox on the producer side so the database write and the event publish cannot diverge.',
        components: [
          'Producer: transactional outbox table drained by a relay',
          'Avro schema registry with backward-compatibility enforcement',
          'Consumer: idempotency keyed on event id, stored with the processed result',
          'Manual offset commit only after successful processing',
          'Retry topic with exponential backoff, then DLQ',
          'Consumer lag and DLQ depth as alerting signals',
        ],
        failures: [
          'Auto-commit acknowledging before processing completes — lost events',
          'Poison message blocking a partition indefinitely',
          'Rebalance storms from a slow consumer exceeding max.poll.interval',
          'Incompatible schema change breaking every consumer at once',
        ],
        tradeoffs: [
          'Exactly-once semantics cost throughput; idempotency is usually cheaper.',
          'More partitions means more parallelism but weaker ordering guarantees.',
        ],
      },
    ],
  },
  {
    id: 'java-spring',
    label: 'Java & Spring Boot',
    icon: 'Coffee',
    questions: [
      {
        id: 'spring-resilience',
        question: 'How do you make a Spring Boot service resilient to a failing dependency?',
        approach:
          'Fail fast and locally rather than propagating a stall. Every outbound call gets a timeout shorter than the caller\'s timeout, bounded retries only for genuinely transient errors, and a circuit breaker so a sustained outage stops consuming threads.',
        components: [
          'Connect and read timeouts on every client, always explicit',
          'Bounded retry with exponential backoff and jitter — only on 5xx and timeouts',
          'Circuit breaker with a half-open probe',
          'Bulkhead: separate thread pools so one dependency cannot exhaust the service',
          'Fallback to cached or degraded response where the domain allows it',
          'Health endpoint that reflects dependency state honestly',
        ],
        failures: [
          'Retrying a non-idempotent write and duplicating the effect',
          'Retry storms amplifying an outage',
          'Default infinite timeouts in an HTTP client',
          'Readiness probe returning healthy while the dependency is down',
        ],
        tradeoffs: [
          'Degraded responses keep the service up but can surface stale data.',
          'Aggressive circuit breaking can trip on a brief blip — tune on real traffic.',
        ],
      },
    ],
  },
  {
    id: 'frontend',
    label: 'React & Frontend',
    icon: 'LayoutGrid',
    questions: [
      {
        id: 'react-scale',
        question: 'How do you keep a large enterprise React application maintainable?',
        approach:
          'Keep data fetching and business rules out of presentational components, colocate state as close to its use as possible, and make the module boundaries match the domain rather than the file type. Type everything at the boundary.',
        components: [
          'Typed API layer generated from or validated against the contract',
          'Presentational components with no knowledge of transport',
          'State scoped locally; global state only for genuinely shared concerns',
          'Virtualisation for large tables — banking datasets are large',
          'Jest coverage on logic, not on markup',
        ],
        failures: [
          'Rendering a full portfolio without virtualisation',
          'Entitlement logic in the browser instead of the server',
          'Prop drilling replaced by a global store that becomes a dumping ground',
        ],
        tradeoffs: [
          'Server-side filtering adds round trips but is the only correct place for entitlements.',
          'Strict typing slows initial delivery and pays back on every later change.',
        ],
      },
    ],
  },
  {
    id: 'data-sql',
    label: 'Data & SQL',
    icon: 'Database',
    questions: [
      {
        id: 'slow-query',
        question: 'A month-end report query has gone from 2 seconds to 4 minutes. Walk me through it.',
        approach:
          'Measure before changing anything. Get the execution plan, find where the row estimate diverges from actual, and work out whether it is a missing index, a stale statistic, a plan change or genuine data growth.',
        components: [
          'Execution plan comparison — current versus known good',
          'Statistics freshness check',
          'Index usage: is the predicate sargable, is the leading column right',
          'Row estimate versus actual to spot cardinality misestimation',
          'Check for a change in data distribution at month-end',
        ],
        failures: [
          'Adding an index without checking the plan — often no effect and a write cost',
          'Function on the indexed column making the predicate non-sargable',
          'Parameter sniffing producing a plan good for one input and terrible for another',
          'Reporting load contending with transactional writes on the same store',
        ],
        tradeoffs: [
          'Every index speeds reads and slows writes — justify it against the actual access path.',
          'Moving reporting to a replica or warehouse costs freshness but removes contention.',
        ],
      },
    ],
  },
  {
    id: 'cloud-k8s',
    label: 'Cloud & Kubernetes',
    icon: 'Container',
    questions: [
      {
        id: 'k8s-debug',
        question: 'A pod is restarting in production. How do you diagnose it?',
        approach:
          'Establish whether it is being killed or exiting, then whether the cause is the application or the platform. The restart reason and the previous container\'s logs answer most of it within a minute.',
        components: [
          'Restart reason — OOMKilled, CrashLoopBackOff, liveness probe failure',
          'Previous container logs, not just current',
          'Resource limits versus observed usage',
          'Liveness probe timing against real startup and GC pause behaviour',
          'Node-level pressure: memory, disk, eviction events',
        ],
        failures: [
          'Liveness probe too aggressive, killing a healthy service during a GC pause',
          'Memory limit below actual heap plus overhead',
          'Readiness and liveness pointing at the same endpoint, so a dependency outage kills the pod',
          'No PodDisruptionBudget, so a rollout drops below required capacity',
        ],
        tradeoffs: [
          'Higher limits reduce OOM risk and reduce scheduling density.',
          'Generous probe timings hide real hangs — tune to observed startup distribution.',
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------- Guided story */

export interface StoryStep {
  id: string;
  title: string;
  duration: string;
  script: string;
  bullets: string[];
}

export const storySteps: StoryStep[] = [
  {
    id: 'who',
    title: 'Who I am',
    duration: '~30s',
    script:
      "I'm a Lead AI and Full Stack Engineer with 13+ years building distributed systems, the last five and a half of those inside global banks. I'm currently Senior Technical Lead at Bank of Julius Baer in Singapore, leading a six-person team. My background is unusual in that I've stayed hands-on across the whole stack while moving deep into AI — I finished an M.Tech in AI/ML at BITS Pilani in 2025.",
    bullets: ['13+ years engineering', 'Senior Technical Lead, Bank of Julius Baer, Singapore', 'M.Tech AI/ML — BITS Pilani, 2025', 'Leading a 6-member team; previously managed 16'],
  },
  {
    id: 'banking',
    title: 'Banking experience',
    duration: '~40s',
    script:
      "My banking work started at Bank of New York in 2020 on the Newton estate within Aladdin. Three products: Performance, which generates investment performance returns from portfolio and accounting data for segregated and pooled clients; Client Reporting; and Portfolio Transaction Management. Today at Julius Baer I'm building an event-driven Global Output Management platform — statements, trade confirmations, corporate actions and tax documents across Equities, Securities, FX, Derivatives and Precious Metals.",
    bullets: ['BNY — Newton / Aladdin: Performance, Client Reporting, Transaction Management', 'Julius Baer — Global Output Management across five asset classes', 'Portfolio accounting, attribution returns, client output', 'Auditability and reconciliation as first-class constraints'],
  },
  {
    id: 'fullstack',
    title: 'Full-stack engineering',
    duration: '~30s',
    script:
      "I pick the language to fit the problem. Java 25 and Spring Boot 3 for the core banking services. Rust for the transaction management service where I wanted memory safety and throughput together — Tokio, RdKafka, Serde. Python for everything model-related. React 19 and Angular 20 on the front end. And underneath all of it, Kafka, Oracle, Snowflake, Docker and Kubernetes.",
    bullets: ['Java 25 · Spring Boot 3 · Microservices', 'Rust · Tokio · RdKafka for transaction processing', 'Python for ML and LLM applications', 'React 19 · Angular 20 · TypeScript'],
  },
  {
    id: 'ai',
    title: 'AI / GenAI evolution',
    duration: '~40s',
    script:
      "My AI work went from classical ML into production GenAI. At BNY I built predictive analytics for market trends at 80% accuracy, an NPF chatbot using NLP that cut client service response times by 60%, and an NLP-driven client reporting system on LangChain with a FAISS vector store for RAG. That work won BNY's Hackcelerator 2.0 AI Innovator Award for the Portfolio-IQ chatbot. At Julius Baer I've built an AI Output Failure Resolution Agent — an agentic operations assistant on Claude AI and Snowflake Cortex that monitors output-processing exceptions, analyses root causes, validates business conditions and drives remediation.",
    bullets: ['Predictive analytics — 80% accuracy on market trends', 'NPF chatbot — 60% faster client service response', 'LangChain + FAISS RAG client reporting system', 'Agentic AI operations assistant in production', 'BNY Hackcelerator 2.0 AI Innovator Award, 2024'],
  },
  {
    id: 'strengths',
    title: 'Current technical strengths',
    duration: '~30s',
    script:
      "Where I'm strongest right now: event-driven architecture on Kafka and Flink, Spring Boot microservices at bank scale, and production AI engineering — meaning RAG, agents, guardrails and evaluation, not just calling a model API. I'm certified on Azure Solutions Architect Expert, AWS Developer Associate, SnowPro, and Oracle OCA/OCP.",
    bullets: ['Event-driven architecture — Kafka, IBM MQ, Flink, Avro', 'Spring Boot microservices at bank scale', 'Production AI — RAG, agents, guardrails, evaluation', 'Certified: Azure Architect Expert · AWS · SnowPro · Oracle OCP'],
  },
  {
    id: 'architecture',
    title: 'Architecture experience',
    duration: '~30s',
    script:
      "I design starting from failure modes. Before writing code I want to know where state lives, what breaks first under load, and how we roll it back. That's why the systems I build tend to be event-driven — retry, replay and reconciliation have to be first-class in banking. I've also done the less glamorous side: migrating Verizon's logical inventory estate to cloud-native microservices at Cognizant.",
    bullets: ['Design from failure modes, not the happy path', 'Event-driven for replayability and reconciliation', 'Legacy migration to cloud-native microservices', 'CI/CD with quality, security and coverage gates'],
  },
  {
    id: 'looking-for',
    title: 'What I am looking for',
    duration: '~20s',
    script:
      "I'm looking for a Lead or Principal role where the banking domain and the AI work meet — somewhere production AI is a real engineering problem rather than a proof of concept. I want to stay hands-on while owning architecture and growing a team, ideally in Singapore or Australia financial technology.",
    bullets: ['Lead / Principal engineering roles', 'Where banking domain meets production AI', 'Hands-on architecture ownership plus team growth', 'Singapore / Australia financial technology'],
  },
];

/* ------------------------------------------------------- 90-second profile */

export const ninetySecondProfile = {
  currentRole: 'Senior Technical Lead | Full Stack Engineer — Bank of Julius Baer, Singapore',
  years: '13+ years',
  domain: 'Banking & Capital Markets — private banking, wealth management, investment performance',
  topTechnologies: ['Java 25', 'Spring Boot 3', 'Python', 'Rust', 'React 19', 'Kafka', 'Snowflake', 'Kubernetes'],
  aiExpertise: [
    'LLMs in production — Claude AI, Snowflake Cortex AI',
    'RAG on LangChain + FAISS, grounded on enterprise knowledge',
    'Agentic AI operations assistant with human-in-the-loop remediation',
    'Full ML lifecycle: ingestion, fine-tuning, evaluation, deployment',
  ],
  architectureExpertise: [
    'Event-driven architecture — Kafka, IBM MQ, Avro, Apache Flink',
    'Microservice decomposition with service-owned data',
    'CI/CD with quality, security and coverage gates into Kubernetes',
    'Streaming + warehouse data pipelines feeding analytics and AI',
  ],
  projectIds: ['gom', 'newton-client-reporting', 'newton-performance'],
  coreStrengths: [
    'Event-driven banking platforms at production scale',
    'Production AI engineering — beyond calling a model API',
    'Polyglot backend: Java, Python, Rust chosen per problem',
    'Full-stack ownership from React UI to Kafka to warehouse',
    'Technical leadership — currently 6 engineers, previously 16',
    'Design from failure modes: retry, replay, reconciliation, rollback',
  ],
};

export const certificationCount = certifications.length;
