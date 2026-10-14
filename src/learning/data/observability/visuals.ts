import type { LearningVisual } from '../../types';

export const observabilityVisuals: LearningVisual[] = [
  {
    id: 'obs-trace-anatomy',
    topicId: 'obs-distributed-tracing',
    type: 'architecture',
    title: 'Anatomy of a Distributed Trace',
    description: 'How a single request becomes a tree of spans across multiple services',
    nodes: [
      { id: 'ingress', label: 'Root Span: API Gateway', description: 'traceId generated. W3C traceparent header injected. Total: 450ms.' },
      { id: 'payment', label: 'Child Span: Payment Service', description: 'Creates child span. Auth + validation: 50ms.' },
      { id: 'db', label: 'Grandchild Span: DB Query', description: 'SELECT account balance: 380ms (slow! — missing index found via trace)' },
      { id: 'kafka', label: 'Child Span: Kafka Publish', description: 'PaymentEvent published to topic: 15ms.' },
      { id: 'collector', label: 'OTel Collector', description: 'Receives all spans, batches, exports to Jaeger. Tail-based sampling decides what to keep.' },
    ],
    memoryTip: 'The slow span (DB 380ms) is immediately visible in Jaeger waterfall — no guessing which service is responsible.',
  },
  {
    id: 'obs-slo-error-budget',
    topicId: 'obs-metrics-alerting',
    type: 'comparison',
    title: 'SLI, SLO, SLA & Error Budget',
    description: 'How reliability targets translate to engineering practice',
    columns: [
      {
        label: 'Definitions',
        nodes: [
          { id: 'sli', label: 'SLI = measured ratio', description: '% requests succeeding in < 200ms. The actual measurement.' },
          { id: 'slo', label: 'SLO = target for SLI', description: '99.9% success rate over 28 days. Internal team agreement.' },
          { id: 'sla', label: 'SLA = contract', description: 'If SLO is breached, customer gets credit/refund.' },
          { id: 'budget', label: 'Error budget = 1 - SLO', description: '0.1% = ~43 min/month allowed downtime. Shared resource.' },
        ],
      },
      {
        label: 'Alerting & Culture',
        nodes: [
          { id: 'burn', label: 'Multi-window burn rate', description: '1h AND 5m > 14× burn rate → P1. Catches fast spikes.' },
          { id: 'slow', label: 'Slow burn alert', description: '6× burn over 6h → P2. Catches gradual degradation.' },
          { id: 'policy', label: '>50% budget mid-month', description: 'Engineering switches to reliability work — no new features.' },
          { id: 'culture', label: 'Blameless post-mortem', description: 'Fix systems not people. Action items with owner + date.' },
        ],
      },
    ],
    memoryTip: 'Alert on burn rate, not raw error rate. 14× burn → budget exhausted in 2h = P1. 6× = P2. 1× = normal = no alert.',
  },
  {
    id: 'obs-elk-pipeline',
    topicId: 'obs-logging',
    type: 'flow',
    title: 'Log Collection Pipeline (EFK Stack in Kubernetes)',
    description: 'How structured logs flow from application to searchable index',
    nodes: [
      { id: 'app', label: 'Spring Boot App', description: 'logstash-logback-encoder → JSON to stdout. traceId in MDC automatically.' },
      { id: 'fb', label: 'Fluent Bit (DaemonSet)', description: 'Lightweight C agent on every K8s node. Collects stdout/stderr, enriches with pod metadata.' },
      { id: 'es', label: 'Elasticsearch', description: 'Full-text + field-level indexing. Hot 7d (NVMe) → Warm 30d (HDD) → Cold 365d (S3).' },
      { id: 'kibana', label: 'Kibana', description: 'Query: level:ERROR AND traceId:abc123. Dashboards, alerts.' },
      { id: 'alert', label: 'Log-based Alert', description: 'Kibana rule: ERROR count > 10/min → PagerDuty + Slack.' },
    ],
    memoryTip: 'Fluent Bit (lightweight C, DaemonSet) collects; Elasticsearch indexes; Kibana queries. No log files needed in containers.',
  },
  {
    id: 'obs-incident-flow',
    topicId: 'obs-incident-response',
    type: 'flow',
    title: 'P1 Incident Response Flow',
    description: 'Systematic steps from alert to resolution using the observability stack',
    nodes: [
      { id: 'alert', label: 'SLO Burn Rate Alert', description: 'PagerDuty fires. On-call acknowledges. Slack #incident opened.' },
      { id: 'scope', label: 'Scope via Grafana', description: 'Which endpoints/pods/AZ? Since when? Is it a deploy regression?' },
      { id: 'trace', label: 'Root Cause via Jaeger', description: 'Error traces → failing span identified. Which service, which DB query?' },
      { id: 'logs', label: 'Detail via Kibana', description: 'traceId from Jaeger → Kibana: stack trace, context, userId.' },
      { id: 'mitigate', label: 'Mitigate', description: 'Rollback / circuit breaker / scale out / feature flag off. Status page updated.' },
      { id: 'pm', label: 'Blameless Post-Mortem (24h)', description: 'Timeline, 5 Whys, action items. Shared with leadership and team.' },
    ],
    memoryTip: 'Metrics (Grafana) → Traces (Jaeger) → Logs (Kibana). Each step narrows scope from "something is wrong" to "this line of code failed".',
  },
];
