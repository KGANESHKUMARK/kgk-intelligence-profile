import type { InterviewQuestion } from '../../types';

const T = 'observability';

export const observabilityQuestions: InterviewQuestion[] = [
  {
    id: 'q-obs-tracing',
    technology: T,
    question: 'How does distributed tracing work, and how do you correlate a trace with its logs?',
    category: 'Distributed Tracing',
    difficulty: 'advanced',
    quickAnswer: 'A traceId propagates in HTTP headers (W3C traceparent); each service creates spans; Jaeger reassembles the tree. Inject traceId into MDC so every log line includes it.',
    interviewAnswer: `When a request enters Service A, a traceId and parentSpanId are propagated via the W3C traceparent HTTP header. Each service creates a child span with start time, attributes, and events, and propagates the header to downstream services. Jaeger collects all spans across all services by traceId and renders the tree. To correlate with logs: inject the current traceId into the SLF4J MDC at request entry — every log.info() call in that thread automatically includes the traceId. In Kibana, search for that traceId to get all logs for that request across all services. With Micrometer Tracing + Spring Boot, traceId injection into MDC is automatic.`,
    detailedAnswer: `Sampling: log all traces at 100% in dev; use tail-based sampling in production (keep traces with errors or P99 latency > 1s, sample 1% of healthy traces). The OTel Collector does tail-based sampling centrally — apps export all spans to the Collector, which decides what to keep. This means you never miss an error trace but also don't store 100% of healthy traces.`,
    seniorAnswer: `Exemplars are the key link between metrics and traces: a Prometheus histogram data point carries an exemplar — the traceId of the specific request that contributed that sample. In Grafana, clicking a high-latency spike opens the Jaeger trace for that exact request. This completes the three-pillar observability loop: alert on metric → find the spike → jump to the trace → see the logs.`,
    keyTerms: ['traceId', 'W3C traceparent', 'Jaeger', 'MDC', 'exemplar', 'tail-based sampling', 'OTel Collector'],
    conceptsTested: ['Distributed tracing mechanics', 'Log-trace correlation', 'Sampling strategy'],
    strongAnswerKeywords: ['traceparent header', 'MDC injection', 'Jaeger span tree', 'tail-based sampling', 'exemplars'],
    whatIsBeingTested: ['Production observability depth', 'Debugging complex distributed systems'],
    interviewerIntent: 'Tests whether candidate can actually debug production incidents vs just knowing tooling names.',
    codeExample: `// application.properties — auto-inject traceId into MDC
logging.pattern.level=%5p [\${spring.application.name:},\${traceId:-},\${spanId:-}]
management.tracing.sampling.probability=1.0  # dev only

# Kibana query: all logs for a trace
traceId: "4bf92f3577b34da6" AND service: "payment-service"

# Jaeger UI: paste traceId → see full call tree with each span's duration`,
    followUps: ['q-obs-otel'],
  },
  {
    id: 'q-obs-otel',
    technology: T,
    question: 'What is OpenTelemetry and why is it important for observability?',
    category: 'Distributed Tracing',
    difficulty: 'intermediate',
    quickAnswer: 'OpenTelemetry is a vendor-neutral standard and SDK for generating traces, metrics, and logs. It decouples instrumentation from the observability backend.',
    interviewAnswer: `OpenTelemetry (OTel) is a CNCF project that provides a single SDK for all three observability signals: traces, metrics, and logs. Before OTel, you needed separate Datadog, Jaeger, or Zipkin clients — switching vendor meant re-instrumenting. With OTel: instrument once, export to any OTLP-compatible backend (Jaeger, Grafana Tempo, Datadog, AWS X-Ray, Honeycomb) by changing the Collector config. The OTel Java Agent instruments Spring Boot, JDBC, Kafka, Redis, and HTTP clients automatically with zero source code changes. The OTel Collector is a pipeline: receive spans → process (batch, sample, enrich) → export to multiple backends simultaneously.`,
    detailedAnswer: `OTel SDK components: Tracer (create/manage spans), Meter (create metrics), Logger (structured log events). The OTLP protocol (OTel Protocol) is gRPC/HTTP — any OTel-compatible tool speaks it. Spring Boot 3.x integrates OTel natively via Micrometer Tracing — no manual OTel API usage needed for standard patterns.`,
    seniorAnswer: `Vendor portability is the killer feature in practice. We moved from Datadog to Grafana/Jaeger/Prometheus (open source) and only changed the OTel Collector exporter config — not a single line of application code. In a cost review, that saved £120K/year in Datadog licensing for a 50-service platform.`,
    keyTerms: ['OpenTelemetry', 'OTLP', 'OTel Collector', 'vendor neutral', 'traces/metrics/logs', 'Java Agent', 'CNCF'],
    conceptsTested: ['Observability architecture', 'Vendor strategy', 'OTel components'],
    strongAnswerKeywords: ['vendor neutral', 'OTLP', 'Collector', 'Java Agent zero-code', 'all three signals'],
    whatIsBeingTested: ['Observability maturity', 'Strategic tooling decisions'],
    interviewerIntent: 'Checks whether candidate understands observability architecture beyond just "we use Datadog".',
    followUps: ['q-obs-slo'],
  },
  {
    id: 'q-obs-slo',
    technology: T,
    question: 'What is the difference between SLI, SLO, and SLA, and how do you implement SLO-based alerting?',
    category: 'Metrics & Alerting',
    difficulty: 'advanced',
    quickAnswer: 'SLI = measured ratio. SLO = target for that ratio. SLA = contractual consequence if SLO is broken. Alert on SLO error budget burn rate.',
    interviewAnswer: `SLI (Service Level Indicator): the actual measured metric — e.g., ratio of HTTP requests completing under 200ms. SLO (Service Level Objective): the target — 99.9% of requests under 200ms over 28 days. SLA (Service Level Agreement): the contract with customers — if SLO is breached, customer gets a refund. Error budget = 1 - SLO = 0.1% = ~43 minutes of allowed downtime/month. SLO-based alerting: alert on the rate at which the error budget is being consumed (burn rate). Multi-window burn rate: if the 1-hour burn rate is > 14× normal AND the 5-minute burn rate is > 14×, fire a P1 (the error budget will be exhausted in 2 hours if this continues). This catches fast failures and ignores transient blips.`,
    detailedAnswer: `Error budget policy: if the error budget is > 50% consumed by day 14 of the month, the team switches to reliability work (no new features) until the budget is restored. This makes reliability a business decision shared between engineering and product, not just an ops concern. Burn rate alerts replace noisy threshold alerts: instead of "error rate > 1%" (fires constantly on blips), "burn rate > 14× over 5 minutes" only fires when user impact is real and sustained.`,
    seniorAnswer: `The most powerful aspect of error budgets: they give engineering teams a quantitative answer to "how much reliability is enough?" A team with 100% reliability is not shipping features. A team burning 100% of the error budget is endangering the business. The error budget makes this a continuous conversation, not a one-time SLA negotiation.`,
    keyTerms: ['SLI', 'SLO', 'SLA', 'error budget', 'burn rate', 'multi-window alerting'],
    conceptsTested: ['SRE concepts', 'Alerting strategy', 'Business-engineering alignment'],
    strongAnswerKeywords: ['measured/target/contract', 'error budget = 1 - SLO', 'burn rate alert', 'multi-window'],
    whatIsBeingTested: ['SRE maturity', 'Production reliability thinking'],
    interviewerIntent: 'Senior roles expect this — it is a key SRE concept that separates senior from staff-level engineers.',
    codeExample: `# PromQL — SLO burn rate alert (multi-window)
# SLI: ratio of successful requests
- record: job:slo_error_rate:5m
  expr: |
    sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
    / sum(rate(http_server_requests_seconds_count[5m]))

# Alert: fast burn — budget exhausted in 2h at this rate
- alert: PaymentErrorBudgetBurnHigh
  expr: |
    job:slo_error_rate:1h > (14 * 0.001)  # 14x burn on 0.1% SLO
    AND job:slo_error_rate:5m > (14 * 0.001)
  for: 2m
  labels: { severity: critical }
  annotations:
    summary: "Payment SLO error budget burning fast"
    runbook: "https://wiki/runbooks/payment-slo"`,
    followUps: ['q-obs-prometheus'],
  },
  {
    id: 'q-obs-prometheus',
    technology: T,
    question: 'Why should you use histograms instead of summaries in Prometheus, and what are exemplars?',
    category: 'Metrics & Alerting',
    difficulty: 'advanced',
    quickAnswer: 'Histograms are aggregatable across pods (correct for microservices); summaries are computed per-instance. Exemplars link a metric data point to the traceId of the actual request.',
    interviewAnswer: `Prometheus summaries compute quantiles (p50, p99) client-side per instance — you cannot correctly aggregate p99 across multiple pods. If pod A's p99 is 200ms and pod B's p99 is 2000ms, the "aggregate p99" from averging summaries is meaningless. Histograms store buckets of counts (how many requests fell in each latency bucket) — these are additive, so histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) correctly aggregates across all pods to the true p99. Always use histograms for latency in a multi-instance service. Exemplars: attached to histogram observations, they carry metadata (traceId) for one specific request in that bucket. In Grafana, clicking a spike shows the exemplar's traceId — one click to jump to the Jaeger trace for the slow request.`,
    detailedAnswer: `Histogram bucket configuration: the default Spring Boot/Micrometer histogram buckets (.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10 seconds) cover typical API latency. For high-performance APIs with 10ms targets, add finer buckets. For SLO-based alerting, add the SLO threshold as an explicit bucket: slo.percentile-histogram.buckets=0.2 ensures the 200ms SLO target has an exact bucket boundary.`,
    seniorAnswer: `Histogram cardinality is a production concern: avoid high-cardinality labels on histograms (userId, requestId) — each unique label combination creates its own set of buckets. A histogram with 12 buckets × 10,000 unique users = 120,000 time series. Prometheus runs OOM. Use low-cardinality labels only: endpoint, method, status_class (2xx, 4xx, 5xx).`,
    keyTerms: ['histogram', 'summary', 'quantile aggregation', 'exemplar', 'cardinality', 'histogram_quantile'],
    conceptsTested: ['Prometheus internals', 'Metrics design', 'Observability architecture'],
    strongAnswerKeywords: ['histogram aggregatable', 'summary not aggregatable', 'histogram_quantile', 'exemplar traceId', 'cardinality'],
    whatIsBeingTested: ['Prometheus depth', 'Practical observability experience'],
    interviewerIntent: 'Separates Prometheus users from engineers who understand its data model.',
    codeExample: `// Spring Boot — enable histogram with explicit SLO bucket
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.distribution.slo.http.server.requests=50ms,100ms,200ms,500ms

# PromQL — correct p99 across all pods
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri))

# WRONG — summary averaged across pods (meaningless quantile)
avg(http_request_duration_seconds{quantile="0.99"})`,
    followUps: ['q-obs-logging'],
  },
  {
    id: 'q-obs-logging',
    technology: T,
    question: 'What is structured logging and how do you implement it in Spring Boot?',
    category: 'Logging',
    difficulty: 'intermediate',
    quickAnswer: 'Structured logging outputs JSON with typed fields. Use logstash-logback-encoder + MDC injection. Never log PII. Clear MDC in finally block.',
    interviewAnswer: `Structured logging outputs each log event as a JSON object with named, typed fields — timestamp, level, logger, message, traceId, userId, durationMs — instead of a free-text string. This makes logs queryable like a database in Kibana: level:ERROR AND service:payment AND durationMs:[500 TO *]. In Spring Boot: add logstash-logback-encoder dependency, configure logback-spring.xml to use LogstashEncoder. Inject traceId into MDC via a servlet filter or Micrometer Tracing auto-configuration. Always clear MDC in a finally block — Tomcat threads are pooled; stale MDC bleeds between requests if not cleared. Never log PII (card numbers, passwords, NIN) — structured logging makes it easy to accidentally include object.toString() which may contain sensitive fields.`,
    detailedAnswer: `Log levels in production: ERROR for unexpected failures needing immediate attention, WARN for handled degradation (circuit breaker open, retry attempted), INFO for key business events (payment processed, user logged in), DEBUG disabled globally but enabled per-logger via application config or Actuator /loggers endpoint without restart. Fluent Bit DaemonSet in Kubernetes collects stdout/stderr from every pod and ships to Elasticsearch — no file-based logging needed.`,
    seniorAnswer: `Log volume and cost management: at 10,000 req/s a service can generate 5 GB/hour of logs. Implement log sampling: 100% of ERROR/WARN, 10% of INFO for successful requests (checked by MDC status). This cuts Elasticsearch storage cost 80% while keeping full error detail. OpenSearch (AWS) or Elasticsearch tiered storage: hot (recent 7 days in NVMe) → warm (8-30 days in HDD) → cold (30-365 days in S3 + on-demand restore).`,
    keyTerms: ['structured logging', 'JSON', 'logstash-logback-encoder', 'MDC', 'traceId', 'Fluent Bit', 'Elasticsearch'],
    conceptsTested: ['Logging best practices', 'Spring Boot logging', 'Observability integration'],
    strongAnswerKeywords: ['JSON fields', 'MDC traceId', 'clear MDC in finally', 'no PII', 'log sampling'],
    whatIsBeingTested: ['Logging production experience', 'Security awareness in logging'],
    codeExample: `<!-- logback-spring.xml -->
<appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
  <encoder class="net.logstash.logback.encoder.LogstashEncoder">
    <customFields>{"service":"payment-service","env":"\${ENV}"}</customFields>
    <fieldNames><timestamp>@timestamp</timestamp></fieldNames>
  </encoder>
</appender>

// Resulting log: queryable in Kibana by any field
{"@timestamp":"2025-07-01T10:00:00Z","level":"INFO","traceId":"abc123",
 "userId":"USR-001","amount":1000,"currency":"GBP","durationMs":142}`,
    interviewerIntent: 'Checks whether candidate knows how to build observable, debuggable services — not just how to write log.info().',
    followUps: ['q-obs-mdc'],
  },
  {
    id: 'q-obs-mdc',
    technology: T,
    question: 'What is MDC (Mapped Diagnostic Context) and why must you always clear it?',
    category: 'Logging',
    difficulty: 'intermediate',
    quickAnswer: 'MDC is a thread-local key-value store that Logback includes in every log line. Must be cleared in finally because Tomcat reuses threads — stale MDC bleeds between requests.',
    interviewAnswer: `MDC (Mapped Diagnostic Context) is a thread-local map in SLF4J. Keys added to MDC appear in every log line emitted by that thread without explicit inclusion — so adding MDC.put("traceId", id) once means every subsequent log.info() in that thread includes the traceId automatically. This is far cleaner than passing a log context object through every method. The critical rule: always clear MDC in a finally block. Web servers use thread pools — a thread serves request A, adds MDC, then after the request completes is returned to the pool and serves request B. If MDC wasn't cleared, request B's logs show request A's userId and traceId — a severe data leak in a multi-tenant system.`,
    detailedAnswer: `With Spring MVC, add a servlet filter or HandlerInterceptor. With Spring WebFlux (reactive), use Reactor's Context — MDC is thread-local and doesn't survive thread hops in reactive chains. Use reactor.util.context.Context and a custom Hook to propagate MDC across reactive operators. This is a subtle but important difference between reactive and blocking Spring Boot.`,
    seniorAnswer: `In reactive Spring Boot (WebFlux), MDC doesn't work out-of-the-box because reactive chains switch threads at every operator. The fix: use reactor-core's Hooks.onEachOperator to propagate a Context through the chain, and a custom subscriber that sets/clears MDC at each operator. Spring Boot 3.2 has experimental MDC-in-reactive support. Until then, use the contextWrite()/deferContextual() pattern or OpenTelemetry's reactive context propagation.`,
    keyTerms: ['MDC', 'thread-local', 'SLF4J', 'thread pool', 'clear MDC', 'reactive context', 'WebFlux'],
    conceptsTested: ['Logging internals', 'Thread safety', 'Reactive programming logging'],
    strongAnswerKeywords: ['thread-local', 'thread pool reuse', 'finally block', 'data leak between requests'],
    whatIsBeingTested: ['Depth of logging knowledge', 'Thread-safety awareness'],
    codeExample: `@Component
public class MdcFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        MDC.put("traceId", Span.current().getSpanContext().getTraceId());
        MDC.put("requestId", Optional.ofNullable(req.getHeader("X-Request-Id"))
                                     .orElse(UUID.randomUUID().toString()));
        MDC.put("userId", SecurityContextHolder.getContext().getAuthentication()
                                               .getName());
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();   // CRITICAL — thread reuse in Tomcat pool
        }
    }
}`,
    interviewerIntent: 'The "always clear MDC" point is a real production bug that causes data leaks — tests experience.',
    followUps: ['q-obs-incident-response'],
  },
  {
    id: 'q-obs-incident-response',
    technology: T,
    question: 'Walk me through how you would investigate a production P1 incident where the payment API error rate suddenly spiked.',
    category: 'Incident Response',
    difficulty: 'advanced',
    quickAnswer: 'Alert fires → check Grafana error rate → filter by endpoint/version → check deployment history → look at Jaeger traces → read structured logs → fix (rollback/hotfix) → post-mortem.',
    interviewAnswer: `1. Alert fires (SLO burn rate > 14×) → acknowledge in PagerDuty, open Slack #incident channel. 2. Grafana: check error rate by endpoint — is it all endpoints or one? By pod — is it one pod or all? 3. Check deployment timeline — did a deployment happen in the last 30 minutes? (Grafana annotation from CI pipeline). 4. Jaeger: filter traces for error status in the last 15 minutes — find the common span that's failing. 5. Kibana: search level:ERROR AND service:payment AND traceId:<from Jaeger> — read the stack trace. 6. Likely causes: bad deploy, downstream dependency failure, DB connection exhaustion, config change. 7. Mitigation: if bad deploy → kubectl rollout undo. If downstream → enable circuit breaker or return cached response. 8. Communicate status page update every 15 minutes. 9. Declare resolution when error rate returns to baseline. 10. Post-mortem within 24 hours.`,
    detailedAnswer: `The key is correlating the three signals: the Grafana dashboard shows the scope (which endpoints, which pods, when it started), Jaeger shows the internal failure path (which span failed), and the structured logs show the specific exception and context. A runbook that specifies the exact Kibana query and Jaeger filter for the payment service saves 5-10 minutes of setup time under pressure.`,
    seniorAnswer: `I also check the error budget: if this P1 incident has consumed 30% of the monthly error budget in 10 minutes, I escalate to leadership immediately — the business SLA is at risk. This changes the incident from "engineering problem" to "business escalation" and gets the right people involved. The error budget gives a common language between engineering and business for impact severity.`,
    keyTerms: ['P1 incident', 'MTTD', 'MTTR', 'Grafana', 'Jaeger', 'Kibana', 'rollback', 'post-mortem'],
    conceptsTested: ['Incident response process', 'Observability tooling in practice', 'Communication'],
    strongAnswerKeywords: ['alert → dashboard → traces → logs → mitigation → post-mortem', 'rollback', 'error budget', 'status page'],
    whatIsBeingTested: ['Production incident experience', 'Systematic debugging', 'Communication skills'],
    interviewerIntent: 'Open-ended question that reveals how the candidate actually thinks under pressure and whether they have a systematic approach.',
    followUps: ['q-obs-chaos'],
  },
  {
    id: 'q-obs-chaos',
    technology: T,
    question: 'What is chaos engineering and how do you implement it safely in production?',
    category: 'Incident Response',
    difficulty: 'advanced',
    quickAnswer: 'Chaos engineering deliberately injects failures to prove the system (and runbooks) are resilient before real incidents reveal they aren\'t.',
    interviewAnswer: `Chaos engineering is the practice of deliberately introducing failures — pod crashes, network latency, CPU pressure, zone failures — in a controlled way to verify that the system handles them gracefully. The key is starting with a hypothesis: "we believe the payment service will maintain 99.9% availability if one AZ goes down, because we have multi-AZ and health checks." Then run the experiment, measure the impact, and compare to the hypothesis. AWS Fault Injection Simulator (FIS): inject EC2 terminations, EKS pod deletions, RDS failover, API throttling via experiment templates. Start in staging, then use production during low-traffic periods with safeguards (stop conditions that abort the experiment if error rate exceeds 1%).`,
    detailedAnswer: `The Game Day format: announce a 2-hour window, inject 1-2 failures without telling engineers which ones. Engineers detect via monitoring and remediate using runbooks. Debrief: what was MTTD, what was MTTR, did the runbook work, what was missing? This validates the observability stack (can you detect the failure?) and the runbooks (can you fix it quickly?) simultaneously.`,
    seniorAnswer: `The most valuable chaos experiment I've run: injected 500ms of artificial latency on Kafka producer calls. The payment service had no timeout configured on Kafka sends — threads blocked indefinitely, thread pool exhausted, service became unresponsive within 90 seconds. No alert fired because we were alerting on error rate (which was 0% — requests were just slow). Fixed: Kafka producer timeout + readiness probe that checked thread pool utilisation. The chaos experiment found a real production vulnerability that would have caused a multi-hour outage.`,
    keyTerms: ['chaos engineering', 'hypothesis', 'steady state', 'AWS FIS', 'game day', 'stop condition', 'blast radius'],
    conceptsTested: ['Chaos engineering principles', 'Production reliability', 'Observability validation'],
    strongAnswerKeywords: ['hypothesis', 'steady state', 'safeguards/stop conditions', 'staging first', 'game day'],
    whatIsBeingTested: ['Senior reliability thinking', 'Production safety practices'],
    interviewerIntent: 'Tests whether candidate treats reliability as something proven, not assumed.',
    followUps: ['q-obs-slo'],
  },
];
