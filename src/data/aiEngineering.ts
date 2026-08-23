/**
 * AI ENGINEERING — the capability ladder, the reference AI system architecture,
 * the engineering process and the production failure-mode catalogue.
 *
 * Content is written to be spoken aloud in an interview: short, specific,
 * and focused on production reality rather than API demos.
 */

export interface AIStage {
  id: string;
  label: string;
  short: string;
  what: string;
  why: string;
  where: string;
  failureModes: string[];
  production: string[];
  tone: 'ai' | 'accent' | 'risk';
}

export const aiStages: AIStage[] = [
  {
    id: 'llm',
    label: 'LLM',
    short: 'The reasoning engine',
    what: 'A large language model that generates and reasons over text given a context window.',
    why: 'It replaces brittle rule engines for tasks that need language understanding — classification, extraction, summarisation, explanation.',
    where: 'Claude AI for intelligent document processing at Julius Baer; LLM-based chatbots on Newton enterprise data pipelines.',
    failureModes: ['Confident but wrong output', 'Context window overflow', 'Non-deterministic formatting', 'Latency and cost spikes under load'],
    production: ['Model + version pinning', 'Token budgeting', 'Timeouts and fallback models', 'Cost per request tracking'],
    tone: 'ai',
  },
  {
    id: 'prompting',
    label: 'Prompt Engineering',
    short: 'Making output predictable',
    what: 'Structuring system instructions, examples and output contracts so the model behaves consistently.',
    why: 'In banking the output feeds downstream systems — free-form prose is not acceptable, a validated schema is.',
    where: 'Document processing prompts and the operations assistant at Julius Baer.',
    failureModes: ['Prompt drift as requirements change', 'Injection through untrusted content', 'Schema violations', 'Overfitting prompts to one model'],
    production: ['Versioned prompts in source control', 'JSON schema output contracts', 'Regression tests per prompt', 'Separation of trusted and untrusted content'],
    tone: 'ai',
  },
  {
    id: 'rag',
    label: 'RAG',
    short: 'Grounding in trusted knowledge',
    what: 'Retrieval-Augmented Generation connects LLM responses to trusted enterprise knowledge sources rather than model memory.',
    why: 'A bank can only act on answers it can trace back to its own data. RAG makes the source auditable.',
    where: 'NLP-driven Client Reporting System at BNY, built on LangChain with a FAISS vector index.',
    failureModes: ['Retrieval misses the relevant chunk', 'Chunk boundaries destroy meaning', 'Stale index after source updates', 'Retrieved context contradicts itself'],
    production: ['Retrieval quality measurement', 'Chunking strategy tuned to document type', 'Embedding model versioning', 'Metadata filtering and access control', 'Hallucination control via citation', 'Re-index pipelines'],
    tone: 'ai',
  },
  {
    id: 'tools',
    label: 'Tools',
    short: 'Giving the model hands',
    what: 'Function calling that lets the model query systems, run calculations or trigger workflows.',
    why: 'Retrieval answers questions; tools let the system actually do something about the answer.',
    where: 'Remediation workflow triggers in the AI Output Failure Resolution Agent.',
    failureModes: ['Wrong tool selected', 'Malformed arguments', 'Unbounded retry loops', 'Side effects executed twice'],
    production: ['Strict argument validation', 'Idempotent tool implementations', 'Allow-lists per user role', 'Dry-run mode before write actions'],
    tone: 'accent',
  },
  {
    id: 'agents',
    label: 'AI Agents',
    short: 'Autonomy with a loop',
    what: 'A model that plans, calls tools, observes results and iterates towards a goal.',
    why: 'Operational triage is multi-step: look at the exception, check the data, validate the business condition, decide the fix.',
    where: 'AI Output Failure Resolution Agent — monitors output-processing exceptions, analyses root causes, validates business conditions, recommends or triggers remediation, notifies operations.',
    failureModes: ['Infinite loops', 'Goal drift', 'Compounding errors across steps', 'Acting without sufficient evidence'],
    production: ['Step and time budgets', 'Human approval on state-changing actions', 'Full trace of every step', 'Deterministic termination conditions'],
    tone: 'ai',
  },
  {
    id: 'memory',
    label: 'Memory',
    short: 'What the system remembers',
    what: 'Short-term conversation state and long-term retrieved knowledge about entities and past decisions.',
    why: 'Operations questions are follow-ups. Without memory each turn restarts from zero.',
    where: 'Conversational client reporting and the ops assistant.',
    failureModes: ['Context bloat degrading answer quality', 'Leaking one user\'s context to another', 'Stale facts persisted as truth'],
    production: ['Summarisation and windowing', 'Per-tenant isolation', 'TTL on cached facts', 'Explicit memory writes, not implicit'],
    tone: 'accent',
  },
  {
    id: 'planning',
    label: 'Planning',
    short: 'Decomposing the task',
    what: 'Breaking a goal into ordered, verifiable steps before execution.',
    why: 'It makes agent behaviour reviewable — you can inspect the plan before anything is executed.',
    where: 'Root-cause analysis sequences in the output-failure agent.',
    failureModes: ['Over-decomposition into noise', 'Plans that ignore preconditions', 'No replanning when a step fails'],
    production: ['Bounded plan depth', 'Precondition checks per step', 'Replanning triggers on failure', 'Plan shown to the operator'],
    tone: 'accent',
  },
  {
    id: 'multi-agent',
    label: 'Multi-Agent',
    short: 'Specialised roles',
    what: 'Multiple agents with distinct responsibilities coordinating on a shared task.',
    why: 'Separation of concerns applies to agents too — a retriever, an analyst and a validator are easier to test than one prompt.',
    where: 'AutoGen and CrewAI experimentation on the BNY AI workstream.',
    failureModes: ['Coordination overhead exceeds benefit', 'Agents amplifying each other\'s errors', 'Cost multiplication', 'Deadlock waiting on each other'],
    production: ['Clear role contracts', 'A single accountable orchestrator', 'Global step budget', 'Per-agent evaluation'],
    tone: 'ai',
  },
  {
    id: 'mcp',
    label: 'MCP',
    short: 'Standardising tool access',
    what: 'Model Context Protocol — a common interface for exposing tools and data sources to models.',
    why: 'It stops every integration being bespoke, which matters when the same data has to serve several AI surfaces.',
    where: 'Applicable to standardising enterprise tool access across AI surfaces.',
    failureModes: ['Over-broad server permissions', 'Unversioned tool schemas', 'Untrusted server content reaching the prompt'],
    production: ['Least-privilege server scopes', 'Schema versioning', 'Audit logging of every tool call'],
    tone: 'accent',
  },
  {
    id: 'guardrails',
    label: 'Guardrails',
    short: 'Bounding what can happen',
    what: 'Input and output controls: validation, filtering, policy checks and refusal behaviour.',
    why: 'A bank cannot ship a system whose worst-case output is unbounded.',
    where: 'Validation before any remediation workflow is triggered.',
    failureModes: ['Guardrails bypassed by indirect injection', 'Over-blocking legitimate requests', 'Validation only on output, not input'],
    production: ['Schema + business-rule validation', 'PII and entitlement filtering', 'Deny-by-default on write actions', 'Guardrail failures logged as incidents'],
    tone: 'risk',
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    short: 'Proving it works',
    what: 'Systematic measurement of retrieval quality, answer correctness, groundedness and regression over time.',
    why: 'Without evaluation an AI change is a guess. It is the difference between a demo and a product.',
    where: 'Part of the end-to-end ML lifecycle: ingestion, fine-tuning, RAG, evaluation, deployment.',
    failureModes: ['Evaluating on the training set', 'Metrics that do not reflect user value', 'No regression suite before release', 'Silent quality decay after a model update'],
    production: ['Golden datasets per use case', 'Retrieval and generation measured separately', 'Automated evaluation in CI', 'Continuous production sampling'],
    tone: 'risk',
  },
  {
    id: 'production',
    label: 'Production',
    short: 'Running it for real',
    what: 'Deployment, observability, cost control, incident response and change management for AI systems.',
    why: 'This is where most AI projects fail — not at the model, at the operations around it.',
    where: 'Deployment of production-ready AI solutions on AWS, Azure and GCP.',
    failureModes: ['No visibility into why an answer was produced', 'Unbounded cost growth', 'No rollback path for a prompt or model change', 'Provider outage with no fallback'],
    production: ['Traces, metrics and logs per request', 'Cost budgets and alerts', 'Versioned rollback for prompts and models', 'Fallback provider or degraded mode', 'On-call runbooks'],
    tone: 'accent',
  },
];

/* ------------------------------------------------ AI reference architecture */

export interface AINode {
  id: string;
  label: string;
  layer: number;
  column?: number;
  tone: 'accent' | 'ai' | 'risk' | 'neutral';
  description: string;
  detail: string[];
  children?: string[];
}

export const aiArchitecture: AINode[] = [
  {
    id: 'user',
    label: 'User',
    layer: 0,
    tone: 'neutral',
    description: 'Operations analyst, client service team or business user.',
    detail: ['Entitlements determine which data the request may touch', 'Every request is attributable to an identity'],
  },
  {
    id: 'ui',
    label: 'React UI',
    layer: 1,
    tone: 'accent',
    description: 'The interface where questions are asked and answers are reviewed.',
    detail: ['Streaming responses for perceived latency', 'Citations rendered next to every claim', 'Explicit approval controls for write actions'],
  },
  {
    id: 'gateway',
    label: 'API Gateway',
    layer: 2,
    tone: 'accent',
    description: 'Authentication, authorisation, rate limiting and request shaping.',
    detail: ['AuthN/AuthZ before anything reaches the model', 'Per-tenant rate limits', 'Request/response audit trail'],
  },
  {
    id: 'orchestrator',
    label: 'AI Orchestrator',
    layer: 3,
    tone: 'ai',
    description: 'Routes the request, assembles context and decides which capability handles it.',
    detail: ['Prompt assembly and versioning', 'Model routing and fallback', 'Token and cost budgeting', 'Trace correlation ID issued here'],
  },
  {
    id: 'agent',
    label: 'Agent',
    layer: 4,
    tone: 'ai',
    description: 'Plans, calls tools, observes results and iterates under a step budget.',
    detail: ['Bounded loop with termination conditions', 'Every step traced', 'Human approval before state changes'],
    children: ['tools', 'rag', 'memory', 'planning', 'guardrails'],
  },
  {
    id: 'tools',
    label: 'Tools',
    layer: 5,
    column: 0,
    tone: 'accent',
    description: 'Typed functions the agent can invoke against real systems.',
    detail: ['Strict argument schemas', 'Idempotent by design', 'Role-scoped allow-lists', 'Dry-run before write'],
  },
  {
    id: 'rag',
    label: 'RAG',
    layer: 5,
    column: 1,
    tone: 'ai',
    description: 'Retrieval over the enterprise knowledge index.',
    detail: ['FAISS / vector index', 'Metadata filtering by entitlement', 'Top-k with re-ranking', 'Citations returned with context'],
  },
  {
    id: 'memory',
    label: 'Memory',
    layer: 5,
    column: 2,
    tone: 'accent',
    description: 'Conversation state and durable facts, isolated per tenant.',
    detail: ['Windowing + summarisation', 'Per-tenant isolation', 'TTL on cached facts'],
  },
  {
    id: 'planning',
    label: 'Planning',
    layer: 5,
    column: 3,
    tone: 'accent',
    description: 'Task decomposition into ordered, verifiable steps.',
    detail: ['Bounded depth', 'Precondition checks', 'Replanning on step failure'],
  },
  {
    id: 'guardrails',
    label: 'Guardrails',
    layer: 5,
    column: 4,
    tone: 'risk',
    description: 'Input and output policy enforcement.',
    detail: ['Schema + business-rule validation', 'PII and entitlement filtering', 'Deny-by-default on writes', 'Failures raised as incidents'],
  },
  {
    id: 'llm',
    label: 'LLM',
    layer: 6,
    tone: 'ai',
    description: 'The model provider — Claude AI, Snowflake Cortex AI, Vertex AI.',
    detail: ['Version pinned per environment', 'Timeout and retry policy', 'Fallback provider configured', 'Cost tracked per request'],
  },
  {
    id: 'data',
    label: 'Enterprise Data',
    layer: 7,
    tone: 'accent',
    description: 'The governed systems of record the whole stack answers from.',
    detail: ['Snowflake · Oracle · PostgreSQL', 'REST APIs from internal services', 'Documents and knowledge base', 'Access enforced at source, not in the prompt'],
  },
];

export const aiDataSources = ['Snowflake', 'Oracle', 'PostgreSQL', 'Internal APIs', 'Documents', 'Knowledge Base'];
export const aiObservability = ['Logs', 'Metrics', 'Traces', 'Evaluation', 'Cost'];

/* ------------------------------------------------------ Engineering process */

export interface ThinkingStep {
  id: string;
  label: string;
  detail: string;
  question: string;
}

export const engineeringThinking: ThinkingStep[] = [
  {
    id: 'problem',
    label: 'Understand the business problem',
    detail: 'What decision does this system support, who depends on it, and what happens if it is wrong?',
    question: 'What is the cost of being wrong here?',
  },
  {
    id: 'design',
    label: 'Design the system',
    detail: 'Boundaries, data contracts, sync vs async, state ownership and the read/write path.',
    question: 'Where does state live and who owns it?',
  },
  {
    id: 'failure',
    label: 'Identify failure modes',
    detail: 'Enumerate what breaks before writing code — upstream outages, partial writes, poison messages, model drift.',
    question: 'What breaks first under load?',
  },
  {
    id: 'build',
    label: 'Build',
    detail: 'Small, reviewable increments behind clear interfaces, with the risky part built first.',
    question: 'What is the riskiest assumption to validate now?',
  },
  {
    id: 'test',
    label: 'Test',
    detail: 'Unit, integration, BDD acceptance and coverage gates — JUnit, Jest, Cucumber, Pytest, cargo-tarpaulin.',
    question: 'Does the test fail if the behaviour regresses?',
  },
  {
    id: 'observe',
    label: 'Observe',
    detail: 'Metrics, logs and traces designed alongside the feature — Grafana, Splunk, AppDynamics.',
    question: 'Will I know within minutes if this degrades?',
  },
  {
    id: 'evaluate',
    label: 'Evaluate',
    detail: 'Measure against a golden dataset or SLO, not against intuition. Especially true for AI components.',
    question: 'What number tells me this is better?',
  },
  {
    id: 'optimise',
    label: 'Optimise',
    detail: 'Profile before tuning. Index, cache, batch or move to async only where the measurement points.',
    question: 'Where is the actual bottleneck?',
  },
  {
    id: 'productionise',
    label: 'Productionise',
    detail: 'CI/CD gates, migrations, rollback, runbooks, on-call and change control.',
    question: 'How do we roll this back at 2am?',
  },
];

/* --------------------------------------------------- Production reality */

export interface FailureMode {
  id: string;
  title: string;
  symptom: string;
  mitigations: string[];
  tone: 'accent' | 'ai' | 'risk';
  icon: string;
}

export const failureModes: FailureMode[] = [
  {
    id: 'hallucination',
    title: 'LLM Hallucination',
    symptom: 'The model produces a confident answer with no basis in the source data.',
    mitigations: ['RAG grounding with citations', 'Refuse when retrieval confidence is low', 'Schema-validated output', 'Golden-dataset evaluation in CI'],
    tone: 'ai',
    icon: 'BrainCircuit',
  },
  {
    id: 'api-failure',
    title: 'API Failure',
    symptom: 'A downstream dependency times out or returns errors, and callers pile up behind it.',
    mitigations: ['Aggressive timeouts', 'Bounded retries with exponential backoff and jitter', 'Circuit breaker', 'Graceful degradation path'],
    tone: 'accent',
    icon: 'PlugZap',
  },
  {
    id: 'kafka',
    title: 'Kafka Failure',
    symptom: 'A poison message blocks the partition, or a consumer group rebalances mid-processing.',
    mitigations: ['Dead letter queue for poison messages', 'Idempotent consumers keyed on event id', 'Retry topics with backoff', 'Consumer lag alerting'],
    tone: 'accent',
    icon: 'Radio',
  },
  {
    id: 'database',
    title: 'Database Bottleneck',
    symptom: 'Query latency climbs at month-end and connection pools saturate.',
    mitigations: ['Index the actual access path, verified by execution plan', 'Query rewrite and pagination', 'Read replicas for reporting', 'Caching with explicit invalidation', 'Connection pool sizing'],
    tone: 'accent',
    icon: 'Database',
  },
  {
    id: 'k8s',
    title: 'Kubernetes Pod Failure',
    symptom: 'A pod OOMs or fails readiness and traffic is routed to an unhealthy instance.',
    mitigations: ['Liveness and readiness probes that reflect real health', 'Multiple replicas across nodes', 'Horizontal pod autoscaling', 'Resource requests and limits', 'PodDisruptionBudget'],
    tone: 'accent',
    icon: 'Container',
  },
  {
    id: 'bad-output',
    title: 'Bad Model Output',
    symptom: 'Output is well-formed but violates a business rule that the model has no way to know.',
    mitigations: ['Business-rule validation after generation', 'Guardrails with deny-by-default on writes', 'Human approval for state changes', 'Continuous production sampling'],
    tone: 'risk',
    icon: 'ShieldAlert',
  },
  {
    id: 'security',
    title: 'Security Risk',
    symptom: 'Prompt injection, over-broad entitlements, or sensitive data reaching a third-party model.',
    mitigations: ['Authentication and authorisation at the gateway', 'Entitlement filtering at the data source, not in the prompt', 'Secrets management, never in code', 'Separation of trusted and untrusted content', 'Veracode and SonarQube scanning in CI'],
    tone: 'risk',
    icon: 'Lock',
  },
  {
    id: 'data-quality',
    title: 'Upstream Data Quality',
    symptom: 'A schema change upstream silently corrupts downstream calculations.',
    mitigations: ['Avro schema registry with compatibility rules', 'Validation at ingestion boundary', 'Reconciliation against source of record', 'Alert on distribution shift'],
    tone: 'accent',
    icon: 'FileWarning',
  },
];
