import type { LearningTopic } from '../../types';

const T = 'observability';

export const observabilityTopics: LearningTopic[] = [
  /* -------------------------------------------- Distributed Tracing */
  {
    id: 'obs-distributed-tracing',
    technology: T,
    title: 'Distributed Tracing — OpenTelemetry & Jaeger',
    category: 'Distributed Tracing',
    slug: 'obs-distributed-tracing',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Distributed tracing follows a single request across multiple services, connecting the dots between what each service did and how long it took.',
    mentalModel: 'A trace is a tree of spans. Each span is one unit of work (HTTP call, DB query, Kafka publish) with a start time, duration, and key-value attributes. The root span is the inbound request.',
    memoryTip: 'Trace = full journey. Span = one step. Parent span = the service that called you. Correlation ID = single ID linking logs across all services for that trace.',
    keyTerms: ['OpenTelemetry', 'trace', 'span', 'trace context propagation', 'W3C TraceContext', 'Jaeger', 'Zipkin', 'sampling', 'baggage'],
    visualIds: ['obs-trace-anatomy'],
    interviewAnswer: `Distributed tracing solves the microservices debugging problem: a slow API response could be caused by any of the 5 services in the call chain. A trace assigns a unique traceId to the incoming request; each service creates a child span recording its work (DB query, downstream HTTP call) and propagates the traceId in HTTP headers (W3C TraceContext: traceparent). Jaeger or Zipkin collect these spans and reconstruct the call tree, showing exactly which span is slow. OpenTelemetry (OTel) is the vendor-neutral SDK standard — I instrument Java services with the OTel Java Agent (zero-code via -javaagent), which auto-instruments Spring MVC, JDBC, Kafka, Feign. The OTel Collector receives spans, batches them, and exports to Jaeger, Grafana Tempo, AWS X-Ray — decoupling the app from the backend.`,
    detailedExplanation: `Sampling strategies: head-based sampling (decide at the root span before the trace completes — 10% of all traces) is simple but misses rare slow traces. Tail-based sampling (decide after the trace completes, at the collector — sample all traces with an error or P99 latency > 1s) is much more valuable but requires buffering all spans in the collector. Baggage propagates key-value data through the full trace (userId, tenantId) — useful for filtering traces in Jaeger UI without a join.`,
    internalWorking: `OTel Java Agent uses ByteBuddy to byte-code instrument standard libraries at JVM startup. No source code changes needed. The agent wraps HTTP servlet handlers, JDBC connections, Kafka consumers, and RestTemplate/WebClient calls to create spans automatically. Custom spans are added with the OTel API: Tracer.spanBuilder("processPayment").startSpan(). Always use try-finally or try-with-span to ensure span.end() is always called.`,
    codeExample: `# Spring Boot + OpenTelemetry Java Agent (zero-code instrumentation)
# application.yaml
management:
  tracing:
    sampling:
      probability: 1.0   # 100% in dev; use 0.1 (10%) in prod

# Maven: spring-boot-starter-actuator + micrometer-tracing-bridge-otel + opentelemetry-exporter-otlp
# All HTTP, JDBC, Kafka spans created automatically

# Custom span for business logic
@Autowired Tracer tracer;

public PaymentResult processPayment(PaymentRequest req) {
    Span span = tracer.spanBuilder("processPayment")
        .setAttribute("payment.amount", req.getAmount())
        .setAttribute("payment.currency", req.getCurrency())
        .startSpan();
    try (Scope scope = span.makeCurrent()) {
        // All work here is a child of this span
        validatePayment(req);
        PaymentResult result = gatewayClient.submit(req);
        span.setStatus(StatusCode.OK);
        return result;
    } catch (Exception e) {
        span.recordException(e).setStatus(StatusCode.ERROR, e.getMessage());
        throw e;
    } finally {
        span.end();
    }
}`,
    practicalExample: `When the payment API P99 latency degraded from 120ms to 2100ms, Jaeger trace view showed the extra 2 seconds was in a single DB query — a missing index after a table schema change. Without tracing, isolating this across 4 microservices would have taken hours; with Jaeger we found it in 3 minutes by filtering traces with duration > 1s.`,
    commonMistakes: [
      'Not propagating traceparent header — each service starts a new trace; the call tree is broken.',
      'Sampling 100% in production — at 10,000 req/s, Jaeger storage becomes a cost problem.',
      'Not recording exceptions as span events — error spans without exception attributes hide the stack trace.',
      'Mixing correlation IDs with trace IDs — use traceId as the correlation ID; inject it into MDC for log correlation.',
    ],
    seniorInsight: `Put the traceId into the MDC (Mapped Diagnostic Context) so every log line includes it: logging.pattern.level=%X{traceId} in Spring Boot with micrometer-tracing does this automatically. Now Jaeger trace → click a span → copy traceId → search Kibana for that traceId → all log lines for that request across all services. This is the full observability triangle: traces ↔ logs ↔ metrics all linked by traceId.`,
    aiAwareness: {
      strongAnswerShouldMention: ['OpenTelemetry', 'trace context propagation', 'W3C traceparent', 'tail-based sampling', 'OTel Collector', 'log correlation'],
      weakAnswer: 'We add correlation IDs to logs to trace requests.',
      redFlags: ['Confuses correlation ID with distributed tracing', 'Not aware of OTel standard'],
      likelyFollowUp: ['What is the difference between head-based and tail-based sampling?', 'How do you correlate traces with logs?', 'What is the OTel Collector?'],
    },
    prerequisites: [],
    relatedTopics: ['obs-metrics-alerting', 'obs-logging'],
    nextTopics: ['obs-metrics-alerting'],
    interviewQuestions: ['q-obs-tracing', 'q-obs-otel'],
  },
  /* ------------------------------------------ Metrics & Alerting */
  {
    id: 'obs-metrics-alerting',
    technology: T,
    title: 'Metrics, SLOs & Alerting — Prometheus & Grafana',
    category: 'Metrics & Alerting',
    slug: 'obs-metrics-alerting',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Metrics measure system health numerically over time; SLOs define reliability targets; alerts fire when SLO burn rate is too high.',
    mentalModel: 'SLI (measured ratio) vs SLO (target for that ratio) vs SLA (contract if SLO is broken). Error budget = 1 - SLO. Spend it fast = slow down; spend it slow = ship faster.',
    memoryTip: 'Four golden signals: Latency, Traffic, Errors, Saturation (LTES). Start alerting here before anything else.',
    keyTerms: ['Prometheus', 'PromQL', 'Grafana', 'SLI', 'SLO', 'error budget', 'recording rule', 'Alertmanager', 'multi-window burn rate'],
    visualIds: ['obs-slo-error-budget'],
    interviewAnswer: `Prometheus scrapes /actuator/prometheus (via Micrometer in Spring Boot) every 15 seconds, storing time-series as {metric_name, labels}. PromQL queries compute rates, histograms, and aggregations. Grafana visualises these with dashboards; Alertmanager routes alerts to PagerDuty/Slack. Start with the four golden signals: Latency (histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))), Traffic (rate(http_server_requests_total[5m])), Errors (rate(http_server_requests_total{status="5xx"}[5m]) / rate(http_server_requests_total[5m])), Saturation (JVM memory usage, CPU throttle). SLOs define reliability targets: "99.9% of requests in 28 days must succeed under 200ms". Error budget = 1 - SLO = 0.1% = 43 minutes/month. Multi-window burn rate alerting (1h and 5m) detects both fast spikes and slow burns before the error budget is exhausted.`,
    detailedExplanation: `Histogram vs summary: Prometheus histograms are aggregatable across instances (required for microservices with multiple pods); summaries are computed client-side per instance. Always use histograms for latency. Recording rules pre-compute expensive PromQL expressions on a schedule and store the result as a new metric — query is instant for dashboards. Exemplars link a high-latency metric data point to the traceId of the actual slow request — the bridge between metrics and traces.`,
    internalWorking: `Spring Boot Micrometer auto-instruments: HTTP server request latency (histogram), JVM heap/GC, thread pool usage, HikariCP connection pool metrics. Add custom business metrics: Counter, Gauge, Timer, DistributionSummary via MeterRegistry. Prometheus Operator in Kubernetes defines ServiceMonitor resources — declarative scrape configuration for each service without editing prometheus.yml.`,
    codeExample: `// Spring Boot — custom business metric: payment processing rate and latency
@Component
public class PaymentMetrics {
    private final MeterRegistry registry;
    private final Counter successCounter;
    private final Counter failureCounter;
    private final Timer processingTimer;

    public PaymentMetrics(MeterRegistry registry) {
        this.registry = registry;
        this.successCounter = Counter.builder("payment.processed")
            .tag("result", "success")
            .description("Successful payments")
            .register(registry);
        this.failureCounter = Counter.builder("payment.processed")
            .tag("result", "failure")
            .register(registry);
        this.processingTimer = Timer.builder("payment.duration")
            .description("Payment processing latency")
            .publishPercentiles(0.5, 0.95, 0.99)  // pre-computed on client
            .register(registry);
    }

    public PaymentResult process(PaymentRequest req) {
        return processingTimer.record(() -> {  // records duration automatically
            try {
                PaymentResult r = doProcess(req);
                successCounter.increment();
                return r;
            } catch (Exception e) {
                failureCounter.increment();
                throw e;
            }
        });
    }
}

# PromQL — SLO error rate (5xx in last 5 minutes)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_server_requests_seconds_count[5m]))

# Grafana alert — multi-window burn rate (fast burn on error budget)
# 1h window > 14× burn rate AND 5m window > 14× burn rate`,
    practicalExample: `Prometheus scraped payment-service every 15 seconds. A recording rule computed the 28-day error budget burn rate. When a bad deployment caused 1% error rate (10× normal), the multi-window alert fired within 2 minutes — well before the daily budget was exhausted. The on-call engineer rolled back within 5 minutes: total error budget spend was 0.03% of the monthly budget.`,
    commonMistakes: [
      'Alerting on averages — a spike that raises average latency 20% means P99 is 10× worse.',
      'No recording rules — PromQL queries over millions of metrics on every dashboard request crushes Prometheus.',
      'Using summaries instead of histograms — summaries from multiple pods cannot be aggregated.',
      'Alerting on every metric — alert on SLO burn, not on individual symptoms; reduce alert fatigue.',
    ],
    seniorInsight: `Error budget as a team conversation: if the error budget is 50% spent at day 14, the engineering team and product agree to slow feature delivery and do reliability work until the budget recovers. This makes reliability a shared business conversation, not just an ops concern. Google's SRE book calls this "blameless postmortems" — focus on the system, not the person.`,
    aiAwareness: {
      strongAnswerShouldMention: ['four golden signals', 'histogram vs summary', 'SLO/SLI/error budget', 'multi-window burn rate', 'recording rules', 'exemplars'],
      weakAnswer: 'We use Grafana and Prometheus to monitor our services.',
      redFlags: ['Alerting on averages', 'Confuses SLO with SLA', 'Using summary instead of histogram'],
      likelyFollowUp: ['What is the difference between SLI, SLO, and SLA?', 'How does multi-window burn rate alerting work?', 'What are Prometheus exemplars?'],
    },
    prerequisites: [],
    relatedTopics: ['obs-distributed-tracing', 'obs-logging'],
    nextTopics: ['obs-logging'],
    interviewQuestions: ['q-obs-slo', 'q-obs-prometheus'],
  },
  /* --------------------------------------------- Structured Logging */
  {
    id: 'obs-logging',
    technology: T,
    title: 'Structured Logging & the ELK Stack',
    category: 'Logging',
    slug: 'obs-logging',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Structured logging emits JSON so logs are machine-searchable; ELK (Elasticsearch, Logstash, Kibana) aggregates and queries logs at scale.',
    mentalModel: 'Unstructured log = a sentence in a book — grep is your only search. Structured JSON log = a database row — query any field instantly. ELK = the database + search engine.',
    memoryTip: 'E = Elasticsearch (index + search). L = Logstash/Fluent Bit (collect + transform). K = Kibana (visualise + query). Fluentd/Fluent Bit often replaces Logstash as the lightweight collector.',
    keyTerms: ['structured logging', 'JSON log', 'MDC', 'traceId in logs', 'Elasticsearch', 'Fluent Bit', 'Kibana', 'log retention', 'log sampling'],
    visualIds: ['obs-elk-pipeline'],
    interviewAnswer: `Structured logging outputs each log event as a JSON object with typed fields — level, timestamp, traceId, userId, paymentAmount, durationMs — instead of a human-readable string. This makes logs queryable like a database: "find all ERROR logs for userId=123 in the last hour where durationMs > 500". In Spring Boot, configure Logback with the Logstash encoder (logstash-logback-encoder) to output JSON. Inject traceId and spanId into MDC automatically via Micrometer Tracing (spring.application.name + management.tracing). The ELK stack: Fluent Bit (DaemonSet in K8s) collects stdout/stderr from every pod, sends to Elasticsearch for indexing, Kibana provides the query UI. For AWS: use CloudWatch Logs + Logs Insights (SQL-like query) or ship to OpenSearch Service.`,
    detailedExplanation: `MDC (Mapped Diagnostic Context) is a thread-local key-value store — any key added to MDC appears in every log line emitted by that thread. Spring MVC request logging: add a filter that puts traceId, userId, requestId into MDC at request entry, clears it on exit. This means every log line during a request automatically carries the traceId — without any explicit log.info(..., traceId) calls. Log levels: ERROR for unexpected failures (action required), WARN for handled degradation, INFO for key business events, DEBUG for diagnostic detail (enabled per-logger, not globally in production).`,
    codeExample: `# Logback (logback-spring.xml) — JSON structured output
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <customFields>{"service":"payment-service","env":"prod"}</customFields>
  </encoder>
</appender>

// MDC filter — injects traceId into every log line for this request
@Component
public class TracingMdcFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String traceId = Span.current().getSpanContext().getTraceId();
        MDC.put("traceId", traceId);
        MDC.put("requestId", req.getHeader("X-Request-Id"));
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();   // ALWAYS clear — thread pool reuse
        }
    }
}

// Resulting JSON log line
{"timestamp":"2025-07-01T10:00:00Z","level":"INFO","logger":"PaymentService",
 "message":"Payment processed","traceId":"4bf92f3577b34da6","userId":"USR-001",
 "amount":1000.00,"currency":"GBP","durationMs":142,"service":"payment-service"}`,
    practicalExample: `With structured logging + ELK: a customer calls support saying "my payment failed 10 minutes ago". Support gives us userId. Kibana query: level:ERROR AND userId:USR-001 — finds the log in 2 seconds. traceId from that log → Jaeger → full distributed trace showing exactly which service and which DB query caused the failure. Without structured logs this would take 20-30 minutes of grepping through log files.`,
    commonMistakes: [
      'Logging sensitive data (passwords, card numbers, PII) — use structured logging to make it easy to audit what\'s being logged.',
      'Not clearing MDC in a finally block — thread pool reuse means MDC bleeds between requests.',
      'String concatenation in log messages — use parameterised logging (log.info("amount={}", amt)), not log.info("amount=" + amt).',
      'Verbose DEBUG logging in production — index storage and search performance degrade; use per-logger level config.',
    ],
    seniorInsight: `Log sampling for high-traffic endpoints: log 1% of successful requests, 100% of errors. This cuts Elasticsearch storage 90% for busy APIs while preserving full detail for failures. Implement with a Logback filter that checks MDC status code — a practical pattern for APIs handling > 10,000 req/s.`,
    aiAwareness: {
      strongAnswerShouldMention: ['JSON structured output', 'MDC for traceId', 'Fluent Bit collection', 'Elasticsearch indexing', 'log level discipline'],
      weakAnswer: 'We use log4j and push logs to Splunk.',
      redFlags: ['Logging PII', 'Not clearing MDC', 'String concatenation in log messages'],
      likelyFollowUp: ['How do you correlate logs with traces?', 'What goes in MDC?', 'How do you handle log retention in a regulated environment?'],
    },
    prerequisites: [],
    relatedTopics: ['obs-distributed-tracing', 'obs-metrics-alerting'],
    nextTopics: ['obs-incident-response'],
    interviewQuestions: ['q-obs-logging', 'q-obs-mdc'],
  },
  /* ------------------------------------------ Incident Response */
  {
    id: 'obs-incident-response',
    technology: T,
    title: 'Incident Response, SRE Practices & Post-Mortems',
    category: 'Incident Response',
    slug: 'obs-incident-response',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Observability only has value when it reduces MTTD and MTTR. SRE practices turn alerts into a structured incident lifecycle with blameless post-mortems.',
    mentalModel: 'MTTD = time from problem start to first alert. MTTR = time from alert to full recovery. Error budget = the production reliability runway. Blameless post-mortem = fix systems, not people.',
    memoryTip: 'MTTD + MTTR = total customer impact window. SLO burn rate alert minimises MTTD. Good runbooks minimise MTTR. Blameless post-mortem prevents recurrence.',
    keyTerms: ['MTTD', 'MTTR', 'error budget', 'runbook', 'post-mortem', 'blameless culture', 'chaos engineering', 'game day', 'SLO burn rate'],
    visualIds: ['obs-incident-flow'],
    interviewAnswer: `MTTD (Mean Time to Detect) is the gap between a problem starting and an engineer being alerted. MTTR (Mean Time to Recover) is from alert to service restored. Error budget = 100% - SLO — if the SLO is 99.9% availability, the error budget is 43 minutes/month. Multi-window SLO burn rate alerts minimise MTTD (alert when the budget is burning fast, before it's exhausted). Runbooks minimise MTTR — a step-by-step guide for each alert: what to check, how to diagnose, common fixes. Blameless post-mortems focus on system failure, not human failure: "the system had no circuit breaker" instead of "the engineer deployed bad code". Chaos engineering (Chaos Monkey, AWS Fault Injection Simulator) proves the runbooks work before an actual incident.`,
    detailedExplanation: `Incident lifecycle: alert fires → on-call acknowledged → incident commander declared for P1 → communication channel opened (Slack incident-2025-07-01) → status page updated → diagnosis → mitigation (rollback, scale out, disable feature flag) → resolution → post-mortem. P1 = customer-impacting, P2 = degraded, P3 = minor, P4 = monitoring only. Define severity in the runbook. Post-mortem: describe timeline (when did it start, when detected, when resolved), root cause (5 Whys), contributing factors, action items (with owner and due date).`,
    codeExample: `# Spring Boot — programmatic feature flag + fast rollback
@Bean
public FeatureFlagService featureFlags(Environment env) {
    return feature -> env.matchesProfiles("feature-" + feature);
}

// Payment endpoint — new code path behind feature flag
@PostMapping("/payments")
public ResponseEntity<PaymentResult> pay(@RequestBody PaymentRequest req) {
    if (featureFlags.isEnabled("new-payment-engine")) {
        return ResponseEntity.ok(newPaymentEngine.process(req));
    }
    return ResponseEntity.ok(legacyPaymentEngine.process(req));
}

# Incident runbook (YAML for PagerDuty runbook integration)
alert: PaymentErrorBudgetBurnHigh
severity: P1
diagnosis:
  - Check Grafana dashboard: https://grafana/d/payment-slo
  - Identify error spike: Kibana query level:ERROR AND service:payment
  - Check latest deploy: kubectl rollout history deploy/payment-service
mitigation:
  - If deploy < 30min ago: kubectl rollout undo deploy/payment-service
  - If DB: check RDS performance insights for slow queries
  - Last resort: enable circuit breaker - toggle feature flag`,
    practicalExample: `We run quarterly game days where we deliberately inject a DNS failure for a downstream service in staging. Engineers follow the runbook without prior warning. Result: MTTR improved from 24 minutes (first game day) to 6 minutes (after runbook refinement), and two engineers who had never been on-call gained hands-on experience before their first real incident.`,
    commonMistakes: [
      'Alerting on symptoms (CPU > 80%) instead of SLO burn — generates noise, misses real user impact.',
      'Runbook says "check the logs" without a specific query — useless under pressure.',
      'Post-mortems that identify a person as root cause — creates blame culture, doesn\'t prevent recurrence.',
      'No chaos testing — runbooks that have never been tested don\'t work when the real incident happens at 3am.',
    ],
    seniorInsight: `The most valuable observability investment is linking alerts directly to runbooks. PagerDuty supports runbook URLs on alert policies — on-call engineers see the diagnosis steps on their phone before they open a laptop. This alone cut our average MTTR by 40% because engineers stopped starting from scratch on every incident.`,
    aiAwareness: {
      strongAnswerShouldMention: ['MTTD vs MTTR', 'error budget', 'SLO burn rate alert', 'blameless post-mortem', 'runbook', 'chaos engineering'],
      weakAnswer: 'We have a PagerDuty alert that fires when the error rate goes up, and we do post-mortems after incidents.',
      redFlags: ['Blaming people in post-mortems', 'No runbooks', 'Alerting on CPU/memory only'],
      likelyFollowUp: ['What goes in a post-mortem?', 'How do you define an error budget?', 'What is chaos engineering?'],
    },
    prerequisites: ['obs-metrics-alerting'],
    relatedTopics: [],
    nextTopics: [],
    interviewQuestions: ['q-obs-incident-response', 'q-obs-chaos'],
  },
];
