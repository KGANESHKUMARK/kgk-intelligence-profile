/**
 * ARCHITECTURES — the Architecture Playground.
 * Each diagram is a small layered graph: nodes positioned by row/col,
 * with edges drawn between ids. Every node is clickable.
 */

export type NodeTone = 'accent' | 'ai' | 'risk' | 'neutral';

export interface ArchNode {
  id: string;
  label: string;
  /** Grid row (0-based, top to bottom). */
  row: number;
  /** Grid column within the row (0-based). */
  col: number;
  /** How many columns this row has — used to lay out evenly. */
  span?: number;
  tone: NodeTone;
  kind?: 'store' | 'stream' | 'service' | 'ui' | 'external' | 'ai';
  summary: string;
  points: string[];
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface Architecture {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  /** Number of columns in the layout grid. */
  cols: number;
  nodes: ArchNode[];
  edges: ArchEdge[];
}

export const architectures: Architecture[] = [
  /* ------------------------------------------------- 1. Banking microservices */
  {
    id: 'banking-microservices',
    label: 'Banking Microservices',
    icon: 'Landmark',
    tagline: 'How a performance/reporting platform is decomposed',
    description:
      'The shape of the Newton performance and reporting estate: a gateway in front of independently deployable domain services, each owning its data, integrating through events rather than shared tables.',
    cols: 4,
    nodes: [
      { id: 'client', label: 'Client UI', row: 0, col: 1, span: 2, tone: 'neutral', kind: 'ui', summary: 'Angular / React operational front-end.', points: ['Entitlement-aware views', 'Server-driven pagination for large portfolios', 'No business logic in the browser'] },
      { id: 'gateway', label: 'API Gateway', row: 1, col: 1, span: 2, tone: 'accent', kind: 'service', summary: 'Single entry point for authentication, routing and rate limiting.', points: ['AuthN/AuthZ before the service layer', 'Rate limiting per consumer', 'Request tracing correlation id', 'Versioned public contracts'] },
      { id: 'performance', label: 'Performance Service', row: 2, col: 0, tone: 'accent', kind: 'service', summary: 'Calculates daily, monthly and attribution returns.', points: ['Java 21 / Spring Boot', 'Consumes portfolio accounting data', 'Segregated and pooled client handling', 'Deterministic, replayable calculation'] },
      { id: 'transaction', label: 'Transaction Service', row: 2, col: 1, tone: 'accent', kind: 'service', summary: 'Rust service processing portfolio transactions.', points: ['Tokio async runtime', 'RdKafka consumers', 'Idempotent on event id', 'Cron-scheduled periodic operations'] },
      { id: 'reporting', label: 'Reporting Service', row: 2, col: 2, tone: 'accent', kind: 'service', summary: 'Generates client reports and financial documents.', points: ['PDF and Excel generation', 'Template-driven output', 'Async job model for large runs'] },
      { id: 'ai-svc', label: 'AI Service', row: 2, col: 3, tone: 'ai', kind: 'ai', summary: 'RAG chatbot and predictive analytics behind an API.', points: ['LangChain + FAISS retrieval', 'LLM inference with fallback', 'Answers cite source documents'] },
      { id: 'kafka', label: 'Kafka', row: 3, col: 1, span: 2, tone: 'accent', kind: 'stream', summary: 'Event backbone decoupling every service.', points: ['Avro-governed schemas', 'Consumer groups per service', 'Retry topics + DLQ', 'Lag monitoring and alerting'] },
      { id: 'oracle', label: 'Oracle', row: 4, col: 0, tone: 'neutral', kind: 'store', summary: 'Transactional system of record.', points: ['Service-owned schemas', 'Liquibase / Flyway migrations', 'Indexed on the real access path'] },
      { id: 'snowflake', label: 'Snowflake', row: 4, col: 2, tone: 'neutral', kind: 'store', summary: 'Analytical warehouse fed by Snowpipe.', points: ['Separation of analytical and transactional load', 'Cortex AI for in-warehouse inference', 'No data egress for AI'] },
      { id: 'obs', label: 'Observability', row: 4, col: 3, tone: 'risk', kind: 'external', summary: 'Grafana, Splunk and AppDynamics.', points: ['Dashboards per service SLO', 'Log correlation across services', 'Transaction traces for latency analysis'] },
    ],
    edges: [
      { from: 'client', to: 'gateway' },
      { from: 'gateway', to: 'performance' },
      { from: 'gateway', to: 'transaction' },
      { from: 'gateway', to: 'reporting' },
      { from: 'gateway', to: 'ai-svc' },
      { from: 'performance', to: 'kafka' },
      { from: 'transaction', to: 'kafka' },
      { from: 'reporting', to: 'kafka' },
      { from: 'kafka', to: 'oracle' },
      { from: 'kafka', to: 'snowflake' },
      { from: 'ai-svc', to: 'snowflake' },
      { from: 'kafka', to: 'obs', dashed: true },
    ],
  },

  /* --------------------------------------------------- 2. Event-driven output */
  {
    id: 'event-driven',
    label: 'Event-Driven Architecture',
    icon: 'Radio',
    tagline: 'Global Output Management, end to end',
    description:
      'The current platform at Julius Baer. Upstream banking events arrive over Kafka and IBM MQ, are validated and transformed, produce documents, and are archived and delivered — with an AI agent watching the exception path.',
    cols: 4,
    nodes: [
      { id: 'upstream', label: 'Upstream Systems', row: 0, col: 0, span: 2, tone: 'neutral', kind: 'external', summary: 'Trading, custody and corporate action systems.', points: ['Equities · Securities · FX', 'Derivatives · Precious Metals', 'Heterogeneous formats and cadences'] },
      { id: 'mq', label: 'IBM MQ', row: 0, col: 2, span: 2, tone: 'accent', kind: 'stream', summary: 'Guaranteed-delivery messaging from legacy systems.', points: ['Transactional semantics', 'Bridges legacy to streaming', 'Backpressure via queue depth'] },
      { id: 'kafka2', label: 'Kafka + Avro', row: 1, col: 1, span: 2, tone: 'accent', kind: 'stream', summary: 'Event backbone with schema governance.', points: ['Avro schema registry', 'Backward/forward compatibility rules', 'Partitioned by client or product', 'DLQ for unparseable events'] },
      { id: 'validate', label: 'Validation & Rules', row: 2, col: 0, span: 2, tone: 'accent', kind: 'service', summary: 'Java 25 / Spring Boot 3 microservices apply business rules.', points: ['Per-asset-class rule sets', 'Reject early, reject loudly', 'Every rejection is an observable event'] },
      { id: 'flink', label: 'Apache Flink', row: 2, col: 2, span: 2, tone: 'accent', kind: 'stream', summary: 'Stateful stream processing on Ververica.', points: ['Windowed aggregation', 'Exactly-once semantics', 'Checkpointing and savepoints', 'Replay from a known good point'] },
      { id: 'quadient', label: 'Quadient Scaler', row: 3, col: 0, span: 2, tone: 'accent', kind: 'service', summary: 'Document composition and rendering.', points: ['Statements, confirmations, tax documents', 'Template versioning', 'Deterministic output per input'] },
      { id: 'cortex', label: 'Cortex AI + Claude', row: 3, col: 2, span: 2, tone: 'ai', kind: 'ai', summary: 'Intelligent document processing and insight.', points: ['LLM inference next to the data', 'Document understanding', 'AI-assisted analytics'] },
      { id: 'opsdocs', label: 'AWS OpsDocs', row: 4, col: 0, tone: 'neutral', kind: 'store', summary: 'Durable, auditable document archival.', points: ['Retention policy per document type', 'Immutable storage', 'Retrieval for audit and client requests'] },
      { id: 'agent2', label: 'AI Failure Agent', row: 4, col: 1, span: 2, tone: 'ai', kind: 'ai', summary: 'Agentic operations assistant on the exception path.', points: ['Monitors output-processing exceptions', 'Analyses root causes', 'Validates business conditions', 'Recommends or triggers remediation', 'Notifies operations teams'] },
      { id: 'delivery', label: 'Client Delivery', row: 4, col: 3, tone: 'accent', kind: 'external', summary: 'Email, e-post and notification channels.', points: ['Channel preference per client', 'Delivery confirmation tracking', 'Retry on transient channel failure'] },
    ],
    edges: [
      { from: 'upstream', to: 'kafka2' },
      { from: 'mq', to: 'kafka2' },
      { from: 'kafka2', to: 'validate' },
      { from: 'kafka2', to: 'flink' },
      { from: 'validate', to: 'quadient' },
      { from: 'flink', to: 'cortex' },
      { from: 'quadient', to: 'opsdocs' },
      { from: 'quadient', to: 'delivery' },
      { from: 'cortex', to: 'agent2' },
      { from: 'validate', to: 'agent2', dashed: true, label: 'exceptions' },
    ],
  },

  /* ----------------------------------------------------------- 3. RAG system */
  {
    id: 'rag-system',
    label: 'AI / RAG System',
    icon: 'BrainCircuit',
    tagline: 'Grounded answers over enterprise knowledge',
    description:
      'The pattern behind the NLP-driven Client Reporting System: an ingestion path that builds the index, and a query path that retrieves, grounds and generates — with evaluation attached to both.',
    cols: 3,
    nodes: [
      { id: 'sources', label: 'Source Documents', row: 0, col: 0, tone: 'neutral', kind: 'external', summary: 'Reporting content, policies and enterprise data.', points: ['Owned by the bank', 'Access-controlled at source', 'Change-tracked for re-indexing'] },
      { id: 'query', label: 'User Query', row: 0, col: 2, tone: 'neutral', kind: 'ui', summary: 'A natural-language question from a client service user.', points: ['Carries user identity and entitlements', 'May be a follow-up requiring memory'] },
      { id: 'chunk', label: 'Chunking', row: 1, col: 0, tone: 'accent', kind: 'service', summary: 'Splitting documents into retrievable units.', points: ['Strategy tuned to document structure', 'Overlap to preserve context', 'Metadata attached per chunk', 'Bad chunking is the most common RAG failure'] },
      { id: 'embed', label: 'Embeddings', row: 2, col: 0, tone: 'ai', kind: 'ai', summary: 'Vectorising chunks for similarity search.', points: ['Embedding model is version-pinned', 'Changing the model means re-indexing everything', 'Same model for index and query'] },
      { id: 'faiss', label: 'FAISS Index', row: 3, col: 1, tone: 'ai', kind: 'store', summary: 'Vector store supporting top-k similarity retrieval.', points: ['Approximate nearest neighbour search', 'Metadata filtering by entitlement', 'Rebuilt on source change'] },
      { id: 'retrieve', label: 'Retrieval', row: 2, col: 2, tone: 'ai', kind: 'service', summary: 'Fetch the most relevant context for the query.', points: ['Top-k with re-ranking', 'Filter before search, not after', 'Measure recall separately from answer quality'] },
      { id: 'llm2', label: 'LLM Generation', row: 4, col: 1, tone: 'ai', kind: 'ai', summary: 'Answer generated strictly from retrieved context.', points: ['System prompt forbids ungrounded claims', 'Citations returned with the answer', 'Refuses when context is insufficient'] },
      { id: 'guard', label: 'Guardrails', row: 5, col: 0, tone: 'risk', kind: 'service', summary: 'Output validation before the answer is shown.', points: ['Schema validation', 'PII filtering', 'Business-rule checks'] },
      { id: 'answer', label: 'Grounded Answer', row: 5, col: 1, tone: 'accent', kind: 'ui', summary: 'Answer plus the sources it came from.', points: ['Every claim traceable to a chunk', 'User can open the source', 'Feedback captured for evaluation'] },
      { id: 'eval', label: 'Evaluation', row: 5, col: 2, tone: 'risk', kind: 'external', summary: 'Continuous measurement of retrieval and generation.', points: ['Golden dataset per use case', 'Retrieval recall / precision', 'Groundedness and correctness scoring', 'Runs in CI, not just once'] },
    ],
    edges: [
      { from: 'sources', to: 'chunk' },
      { from: 'chunk', to: 'embed' },
      { from: 'embed', to: 'faiss' },
      { from: 'query', to: 'retrieve' },
      { from: 'retrieve', to: 'faiss' },
      { from: 'faiss', to: 'llm2' },
      { from: 'llm2', to: 'guard' },
      { from: 'llm2', to: 'answer' },
      { from: 'guard', to: 'answer' },
      { from: 'answer', to: 'eval', dashed: true },
    ],
  },

  /* -------------------------------------------------------- 4. Agentic AI */
  {
    id: 'agentic-ai',
    label: 'Agentic AI System',
    icon: 'Bot',
    tagline: 'The AI Output Failure Resolution Agent',
    description:
      'A bounded agent loop applied to operations: observe the exception, gather evidence, reason about root cause, validate business conditions, then recommend or trigger remediation — with a human in the loop before anything changes state.',
    cols: 3,
    nodes: [
      { id: 'trigger', label: 'Exception Event', row: 0, col: 1, tone: 'risk', kind: 'stream', summary: 'An output-processing failure raised by the platform.', points: ['Emitted as a first-class event', 'Carries correlation id back to the source document', 'Severity drives urgency'] },
      { id: 'orch', label: 'Orchestrator', row: 1, col: 1, tone: 'ai', kind: 'service', summary: 'Assembles context and issues the step budget.', points: ['Prompt version pinned', 'Step and time budget enforced', 'Trace id issued for the whole run'] },
      { id: 'plan', label: 'Plan', row: 2, col: 0, tone: 'accent', kind: 'service', summary: 'Decompose the investigation into verifiable steps.', points: ['Bounded depth', 'Preconditions checked per step', 'Plan is visible to the operator'] },
      { id: 'reason', label: 'Reason', row: 2, col: 1, tone: 'ai', kind: 'ai', summary: 'Analyse evidence and hypothesise root cause.', points: ['Claude AI + Snowflake Cortex', 'Reasoning recorded in the trace', 'Confidence surfaced, not hidden'] },
      { id: 'act', label: 'Act (Tools)', row: 2, col: 2, tone: 'accent', kind: 'service', summary: 'Query systems and gather the evidence needed.', points: ['Read-only tools run freely', 'Write tools require approval', 'Idempotent and argument-validated'] },
      { id: 'validate2', label: 'Validate Business Conditions', row: 3, col: 1, tone: 'risk', kind: 'service', summary: 'Check the proposed action against business rules.', points: ['Deterministic rules, not model judgement', 'Deny by default', 'Failure raises an incident'] },
      { id: 'human', label: 'Human Approval', row: 4, col: 0, tone: 'risk', kind: 'ui', summary: 'Operator reviews the plan, evidence and proposed fix.', points: ['Required for any state change', 'Full trace available for review', 'Approval is auditable'] },
      { id: 'remediate', label: 'Remediation Workflow', row: 4, col: 1, tone: 'accent', kind: 'service', summary: 'Trigger the fix through existing platform workflows.', points: ['Reuses established operational runbooks', 'Idempotent execution', 'Result fed back into the trace'] },
      { id: 'notify', label: 'Notify Operations', row: 4, col: 2, tone: 'accent', kind: 'external', summary: 'Close the loop with the operations team.', points: ['Summary of cause and action', 'Link to the full trace', 'Escalation if unresolved'] },
    ],
    edges: [
      { from: 'trigger', to: 'orch' },
      { from: 'orch', to: 'plan' },
      { from: 'orch', to: 'reason' },
      { from: 'reason', to: 'act' },
      { from: 'act', to: 'reason', dashed: true, label: 'observe' },
      { from: 'reason', to: 'validate2' },
      { from: 'validate2', to: 'human' },
      { from: 'human', to: 'remediate' },
      { from: 'remediate', to: 'notify' },
    ],
  },

  /* ------------------------------------------------------ 5. CI/CD + K8s */
  {
    id: 'cicd-k8s',
    label: 'CI/CD + Kubernetes',
    icon: 'Container',
    tagline: 'From commit to production, with gates',
    description:
      'The delivery path used across banking services: quality and security gates before anything is built, GitOps reconciliation into the cluster, and observability wired in from day one.',
    cols: 3,
    nodes: [
      { id: 'commit', label: 'Commit / MR', row: 0, col: 1, tone: 'neutral', kind: 'external', summary: 'Merge request with mandatory review.', points: ['Peer review before merge', 'Conventional branch protection', 'Linked to a Jira item'] },
      { id: 'ci', label: 'GitLab CI / Jenkins', row: 1, col: 1, tone: 'accent', kind: 'service', summary: 'Pipeline: build, test, scan, package.', points: ['Fail fast on compile and unit tests', 'Parallel stages where possible', 'Artefacts immutable once built'] },
      { id: 'quality', label: 'Quality Gate', row: 2, col: 0, tone: 'risk', kind: 'service', summary: 'SonarQube, Sonar-Rust and coverage thresholds.', points: ['Coverage gate via cargo-tarpaulin / JaCoCo', 'New-code quality rules', 'Blocking, not advisory'] },
      { id: 'security', label: 'Security Scan', row: 2, col: 2, tone: 'risk', kind: 'service', summary: 'Veracode static analysis and dependency scanning.', points: ['SAST on every build', 'Dependency vulnerability checks', 'Secrets detection'] },
      { id: 'registry', label: 'Image Registry', row: 3, col: 1, tone: 'neutral', kind: 'store', summary: 'Versioned, signed container images.', points: ['Immutable tags', 'Base image patching cadence', 'Provenance retained'] },
      { id: 'argo', label: 'ArgoCD (GitOps)', row: 4, col: 1, tone: 'accent', kind: 'service', summary: 'Cluster state reconciled to a Git repository.', points: ['Declarative desired state', 'Drift detection and auto-sync', 'Rollback is a git revert', 'Every change auditable'] },
      { id: 'k8s2', label: 'Kubernetes', row: 5, col: 1, tone: 'accent', kind: 'service', summary: 'Runtime with health, scaling and disruption controls.', points: ['Liveness + readiness probes', 'HPA on real signals', 'Resource requests and limits', 'PodDisruptionBudget for rollouts'] },
      { id: 'helm2', label: 'Helm Charts', row: 4, col: 0, tone: 'accent', kind: 'service', summary: 'Templated release definitions per environment.', points: ['Values per environment', 'Versioned releases', 'Repeatable across regions'] },
      { id: 'monitor', label: 'Grafana / Splunk', row: 5, col: 2, tone: 'risk', kind: 'external', summary: 'Metrics, logs and alerting on the running system.', points: ['SLO dashboards per service', 'Alert routing to on-call', 'Log correlation by trace id'] },
    ],
    edges: [
      { from: 'commit', to: 'ci' },
      { from: 'ci', to: 'quality' },
      { from: 'ci', to: 'security' },
      { from: 'quality', to: 'registry' },
      { from: 'security', to: 'registry' },
      { from: 'registry', to: 'argo' },
      { from: 'helm2', to: 'argo' },
      { from: 'argo', to: 'k8s2' },
      { from: 'k8s2', to: 'monitor', dashed: true },
    ],
  },

  /* --------------------------------------------------------- 6. Data pipeline */
  {
    id: 'data-pipeline',
    label: 'Data Pipeline',
    icon: 'Database',
    tagline: 'Ingestion to analytics to AI',
    description:
      'How operational data becomes analytical and then AI-accessible: streaming and batch ingestion into Snowflake via Snowpipe, orchestrated transformation, then Cortex AI inference without moving the data.',
    cols: 3,
    nodes: [
      { id: 'src-oltp', label: 'Oracle (OLTP)', row: 0, col: 0, tone: 'neutral', kind: 'store', summary: 'Transactional systems of record.', points: ['Portfolio accounting data', 'Transaction records', 'Change data captured, not bulk-scanned'] },
      { id: 'src-stream', label: 'Kafka Events', row: 0, col: 1, tone: 'accent', kind: 'stream', summary: 'Real-time operational events.', points: ['Avro-governed payloads', 'Partitioned for parallel consumption', 'Replayable from offset'] },
      { id: 'src-files', label: 'Files / APIs', row: 0, col: 2, tone: 'neutral', kind: 'external', summary: 'Vendor feeds and internal service APIs.', points: ['Scheduled pulls', 'Checksum validation on arrival', 'Late-arriving data handled explicitly'] },
      { id: 'snowpipe', label: 'Snowpipe', row: 1, col: 1, tone: 'accent', kind: 'service', summary: 'Continuous ingestion into the warehouse.', points: ['Near-real-time loading', 'Auto-ingest on file arrival', 'Load history for reconciliation'] },
      { id: 'airflow2', label: 'Airflow', row: 2, col: 0, tone: 'accent', kind: 'service', summary: 'DAG orchestration for transformation and ML jobs.', points: ['Explicit dependencies between tasks', 'Retries with backoff', 'SLA alerts on late DAGs', 'Backfill support'] },
      { id: 'transform', label: 'Transform / Model', row: 2, col: 1, tone: 'accent', kind: 'service', summary: 'Cleansing, conforming and modelling into analytical shape.', points: ['Idempotent transformations', 'Data quality assertions', 'Lineage retained'] },
      { id: 'spark', label: 'Databricks / PySpark', row: 2, col: 2, tone: 'accent', kind: 'service', summary: 'Large-scale processing and feature engineering.', points: ['Distributed compute for heavy jobs', 'Feature reuse across models', 'MLflow experiment tracking'] },
      { id: 'snowflake2', label: 'Snowflake', row: 3, col: 1, tone: 'neutral', kind: 'store', summary: 'The analytical warehouse.', points: ['Separated compute per workload', 'Time travel for recovery', 'Governed access by role'] },
      { id: 'cortex2', label: 'Cortex AI', row: 4, col: 0, tone: 'ai', kind: 'ai', summary: 'LLM inference inside the warehouse.', points: ['No data leaves the governance boundary', 'SQL-native AI functions', 'Cost attributable per warehouse'] },
      { id: 'bi', label: 'Analytics & Reporting', row: 4, col: 1, tone: 'accent', kind: 'ui', summary: 'Dashboards, financial reports and client output.', points: ['Consistent metric definitions', 'Reconciled against source of record'] },
      { id: 'ml', label: 'ML Models', row: 4, col: 2, tone: 'ai', kind: 'ai', summary: 'Predictive analytics served from curated features.', points: ['TensorFlow / PyTorch models', 'MLflow registry and versioning', 'Drift monitoring in production'] },
    ],
    edges: [
      { from: 'src-oltp', to: 'snowpipe' },
      { from: 'src-stream', to: 'snowpipe' },
      { from: 'src-files', to: 'snowpipe' },
      { from: 'snowpipe', to: 'transform' },
      { from: 'airflow2', to: 'transform', dashed: true, label: 'orchestrates' },
      { from: 'spark', to: 'transform' },
      { from: 'transform', to: 'snowflake2' },
      { from: 'snowflake2', to: 'cortex2' },
      { from: 'snowflake2', to: 'bi' },
      { from: 'snowflake2', to: 'ml' },
    ],
  },
];
