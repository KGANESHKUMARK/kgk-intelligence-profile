import type { InterviewQuestion } from '../../types';

const T = 'spring-boot';

export const springBootQuestions: InterviewQuestion[] = [
  /* ------------------------------------------------------------ Spring Core */
  {
    id: 'q-sb-constructor-injection',
    technology: T,
    question: 'Why is constructor injection preferred over field injection in Spring?',
    category: 'Spring Core',
    difficulty: 'intermediate',
    quickAnswer: 'Dependencies become explicit, final and mandatory; the class is testable with plain new; and cycles fail fast.',
    interviewAnswer: `With constructor injection the dependencies are visible in the signature, can be final (immutable, safely published), are guaranteed non-null once the object exists, and the class can be unit-tested with new MyService(mockA, mockB) without starting Spring. Field injection hides dependencies, needs reflection, cannot be final, and lets a class quietly accumulate ten collaborators — a design smell constructor injection makes obvious.`,
    detailedAnswer: `Since Spring 4.3 a class with a single constructor needs no @Autowired. Setter injection is still fine for genuinely optional dependencies. Constructor injection also surfaces circular dependencies at startup instead of hiding them.`,
    seniorAnswer: `I enforce it in reviews and with ArchUnit or static analysis rules. A constructor with many parameters is valuable feedback: the class violates single responsibility and should be split, rather than hidden behind @Autowired fields.`,
    keyTerms: ['constructor injection', 'final', 'immutability', 'testability', 'circular dependency'],
    conceptsTested: ['DI styles', 'testability', 'design quality'],
    relatedTopics: ['sb-ioc-di'],
    followUps: ['q-sb-bean-scopes', 'q-sb-self-invocation'],
    commonMistakes: ['Saying field injection is fine because it is shorter', 'Not knowing @Autowired is optional on single constructors'],
    strongAnswerKeywords: ['final', 'explicit', 'testable without Spring', 'fail fast'],
    codeExample: `// Field injection — hidden, mutable, needs Spring/reflection to test
@Service
class FeeServiceBad {
    @Autowired private RateRepository rates;
    BigDecimal fee(BigDecimal amt) { return amt.multiply(rates.current()); }
}

// Constructor injection — explicit, final, plain unit test
@Service
class FeeService {
    private final RateRepository rates;
    FeeService(RateRepository rates) { this.rates = rates; }
    BigDecimal fee(BigDecimal amt) { return amt.multiply(rates.current()); }
}

class FeeServiceTest {
    @Test void appliesRate() {
        RateRepository rates = () -> new BigDecimal("0.01");   // functional interface stub
        assertEquals(new BigDecimal("1.00"), new FeeService(rates).fee(new BigDecimal("100")));
    }
}`,
    interviewerIntent: 'Checks design maturity and testing habits rather than annotation knowledge.',
    whatIsBeingTested: ['DI principles', 'Testability', 'Code-review judgement'],
  },
  {
    id: 'q-sb-bean-scopes',
    technology: T,
    question: 'What bean scopes exist, and what happens when you inject a prototype bean into a singleton?',
    category: 'Spring Core',
    difficulty: 'intermediate',
    quickAnswer: 'singleton, prototype, request, session, application. A prototype injected into a singleton is created only once — use ObjectProvider for a new instance per use.',
    interviewAnswer: `Singleton is the default (one per context); prototype creates a new instance per container lookup; request/session/application are web scopes. Dependency injection happens once when the singleton is created, so an injected prototype behaves like a singleton for that bean. To get a fresh instance each time, inject ObjectProvider<T> (or Provider<T>) and call getObject(), use @Lookup method injection, or a scoped proxy.`,
    detailedAnswer: `Spring does not call destroy callbacks on prototype beans — the caller owns their lifecycle. Request-scoped beans injected into singletons require a scoped proxy (proxyMode = TARGET_CLASS), which resolves the actual bean per current request.`,
    seniorAnswer: `Singletons are shared across threads, so the real interview point is thread-safety: never keep per-request mutable state in a singleton field. If you need per-request state, pass it as a parameter or use request scope deliberately.`,
    keyTerms: ['singleton', 'prototype', 'ObjectProvider', '@Lookup', 'scoped proxy'],
    conceptsTested: ['scope semantics', 'injection timing', 'thread-safety'],
    relatedTopics: ['sb-bean-scopes-lifecycle', 'sb-ioc-di'],
    followUps: ['q-sb-constructor-injection'],
    commonMistakes: ['Expecting a new prototype on every method call', 'Mutable fields in singletons'],
    strongAnswerKeywords: ['injected once', 'ObjectProvider', 'thread-safety'],
    codeExample: `@Service
class CounterService {             // singleton shared by all request threads
    private int count = 0;          // BUG: shared mutable state, race condition
    int next() { return ++count; }
}

@Service
class SafeCounterService {
    private final AtomicInteger count = new AtomicInteger();
    int next() { return count.incrementAndGet(); }
}`,
    interviewerIntent: 'Tests whether the candidate understands injection timing and the concurrency consequence of singletons.',
    whatIsBeingTested: ['Scope knowledge', 'Concurrency awareness'],
  },
  {
    id: 'q-sb-self-invocation',
    technology: T,
    question: 'Why does @Transactional (or @Async, @Cacheable) not work when a method calls another method in the same class?',
    category: 'Spring Core',
    difficulty: 'advanced',
    quickAnswer: 'These annotations are applied by a proxy; this.method() calls the target object directly and bypasses the proxy.',
    interviewAnswer: `Spring implements @Transactional, @Async, @Cacheable and @Retryable with AOP proxies (JDK dynamic or CGLIB). Other beans hold a reference to the proxy, so their calls are intercepted. Inside the class, this refers to the raw target, so this.inner() never passes through the proxy and the annotation on inner() is ignored. Fixes: move the method to a separate bean (cleanest), inject the bean's own proxy (self-injection with @Lazy), or use AspectJ weaving instead of proxies.`,
    detailedAnswer: `For the same reason, proxy-based annotations do not apply to private methods, and with CGLIB proxies final methods cannot be overridden either. The symptom is silent: no error, just no transaction or no async execution.`,
    seniorAnswer: `I treat self-invocation as a design hint: a method needing different transactional semantics usually belongs in a different component (e.g. an AuditService with REQUIRES_NEW). That fixes the bug and improves cohesion.`,
    keyTerms: ['AOP proxy', 'CGLIB', 'JDK dynamic proxy', 'self-invocation', 'AspectJ'],
    conceptsTested: ['proxy mechanics', 'Spring AOP limits'],
    relatedTopics: ['sb-transactional', 'sb-ioc-di'],
    followUps: ['q-sb-transaction-propagation', 'q-sb-checked-rollback'],
    commonMistakes: ['Blaming the database', 'Adding @Transactional to private methods'],
    strongAnswerKeywords: ['proxy', 'this bypasses proxy', 'separate bean'],
    codeExample: `@Service
class ReportService {
    public void generateAll(List<Long> ids) {
        for (Long id : ids) {
            this.generateOne(id);          // direct call -> NO new transaction per report
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateOne(Long id) { /* ... */ }
}

// Fix: move generateOne into ReportWorker (another @Service) and call worker.generateOne(id)
// -> each call now goes through ReportWorker's proxy and gets its own transaction.`,
    expectedOutput: 'Before fix: one failure rolls back nothing / everything unexpectedly (no per-report transaction).\nAfter fix: each report commits or rolls back independently.',
    interviewerIntent: 'One of the most common real Spring bugs — reveals whether you understand how Spring actually works.',
    whatIsBeingTested: ['AOP proxy model', 'Debugging silent failures', 'Design fix'],
    aiAwareness: {
      strongAnswerShouldMention: ['proxy', 'this refers to target', 'private methods not proxied', 'extract to another bean'],
      weakAnswer: 'You need to add @Transactional to both methods.',
      redFlags: ['Thinks annotations are processed at compile time'],
      likelyFollowUp: ['JDK proxy vs CGLIB?', 'Would AspectJ fix it?', 'Does @Async have the same issue?'],
    },
  },
  {
    id: 'q-sb-auto-configuration',
    technology: T,
    question: 'How does Spring Boot auto-configuration work, and how do you override or debug it?',
    category: 'Spring Core',
    difficulty: 'advanced',
    quickAnswer: 'Conditional @AutoConfiguration classes listed in AutoConfiguration.imports create beans only when conditions match; your own beans win via @ConditionalOnMissingBean. Debug with --debug.',
    interviewAnswer: `@EnableAutoConfiguration (inside @SpringBootApplication) loads auto-configuration classes listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. Each is guarded by conditions — @ConditionalOnClass, @ConditionalOnBean/MissingBean, @ConditionalOnProperty — so DataSourceAutoConfiguration only applies if a JDBC driver and pool are present and you have not defined a DataSource. To override, declare your own bean or set properties; to disable, use exclude. To debug, run with --debug (Condition Evaluation Report) or the actuator conditions endpoint.`,
    detailedAnswer: `Auto-configurations are processed after user configuration so @ConditionalOnMissingBean sees your beans. Ordering between them uses @AutoConfiguration(before/after). Properties are bound via @ConfigurationProperties with relaxed binding (SPRING_DATASOURCE_URL env var → spring.datasource.url).`,
    seniorAnswer: `I use this to build internal starters that encode platform standards (security headers, tracing, logging, audit). The key design rule: every bean is @ConditionalOnMissingBean and every feature has a property toggle, so teams can opt out without forking.`,
    keyTerms: ['@EnableAutoConfiguration', '@Conditional', 'AutoConfiguration.imports', 'Condition Evaluation Report', 'starter'],
    conceptsTested: ['Boot internals', 'customisation', 'troubleshooting'],
    relatedTopics: ['sb-auto-configuration'],
    followUps: ['q-sb-maven-conflicts'],
    commonMistakes: ['Calling it magic', 'Not knowing spring.factories was replaced in Boot 2.7/3'],
    strongAnswerKeywords: ['conditional', 'classpath', 'MissingBean', '--debug', 'exclude'],
    codeExample: `@SpringBootApplication(exclude = DataSourceAutoConfiguration.class)   // opt out entirely
public class ReportingApp {
    public static void main(String[] args) {
        SpringApplication.run(ReportingApp.class, args);
    }
}

// Override instead of excluding: your bean makes Boot's back off
@Configuration
class JacksonConfig {
    @Bean
    ObjectMapper objectMapper() {
        return JsonMapper.builder()
                .addModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
}
// java -jar app.jar --debug   -> "Positive matches / Negative matches" report`,
    interviewerIntent: 'Separates users of Boot from engineers who can reason about and extend it.',
    whatIsBeingTested: ['Internals', 'Override strategies', 'Debugging approach'],
  },

  /* ------------------------------------------------------------ Web & REST */
  {
    id: 'q-sb-global-exception-handling',
    technology: T,
    question: 'How do you implement validation and consistent error responses across a Spring Boot REST API?',
    category: 'Web & REST',
    difficulty: 'intermediate',
    quickAnswer: 'Bean Validation on DTOs + @Valid, and one @RestControllerAdvice mapping exceptions to ProblemDetail (RFC 9457) responses.',
    interviewAnswer: `Request DTOs (records) carry constraints like @NotBlank, @Email, @Positive, nested objects use @Valid, and controller parameters are annotated @Valid so Spring rejects bad input with MethodArgumentNotValidException before business logic runs. A single @RestControllerAdvice converts exceptions into consistent HTTP responses — 400 for validation, 404 for missing resources, 409 for conflicts, 422 for business-rule violations, 500 with a generic message and a correlation id for unexpected errors — using Spring 6's ProblemDetail (application/problem+json).`,
    detailedAnswer: `For path/query parameter constraints, annotate the controller class with @Validated, which raises ConstraintViolationException (or HandlerMethodValidationException in Spring 6.1+). Enable spring.mvc.problemdetails.enabled=true to get ProblemDetail for Spring's own exceptions as well.`,
    seniorAnswer: `I version the error contract with stable machine-readable codes (e.g. "PAYMENT_LIMIT_EXCEEDED"), never leak stack traces or SQL messages, log the full exception server-side with the trace id, and return that trace id to the client so support can correlate.`,
    keyTerms: ['@Valid', '@Validated', '@RestControllerAdvice', 'ProblemDetail', 'RFC 9457'],
    conceptsTested: ['API error design', 'validation', 'exception mapping'],
    relatedTopics: ['sb-rest-exception-handling', 'sd-rest-api-design'],
    followUps: ['q-sb-filter-vs-interceptor'],
    commonMistakes: ['try/catch in every controller', '200 OK with error body', 'Leaking internal exception messages'],
    strongAnswerKeywords: ['@Valid', 'ControllerAdvice', 'ProblemDetail', 'status codes', 'correlation id'],
    codeExample: `@RestControllerAdvice
class GlobalErrors {
    private static final Logger log = LoggerFactory.getLogger(GlobalErrors.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail notFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setProperty("code", "RESOURCE_NOT_FOUND");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception ex) {
        String traceId = MDC.get("traceId");
        log.error("Unhandled error traceId={}", traceId, ex);   // full detail stays in logs
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error. Quote traceId to support.");
        pd.setProperty("traceId", traceId);
        return pd;
    }
}`,
    interviewerIntent: 'Checks API craftsmanship: clients need predictable errors, and operators need traceability.',
    whatIsBeingTested: ['Validation mechanics', 'Error contract design', 'Security hygiene'],
  },
  {
    id: 'q-sb-filter-vs-interceptor',
    technology: T,
    question: 'What is the difference between a Servlet Filter, a HandlerInterceptor and a Spring AOP aspect? When do you use each?',
    category: 'Web & REST',
    difficulty: 'intermediate',
    quickAnswer: 'Filter: every request at the servlet level. Interceptor: around Spring MVC handlers. AOP: around Spring bean method calls, independent of HTTP.',
    interviewAnswer: `Filters run in the servlet container before DispatcherServlet and can wrap or modify the raw request/response — security, CORS, compression, correlation ids, request logging. HandlerInterceptors run inside Spring MVC with access to the selected handler (preHandle, postHandle, afterCompletion) — endpoint-specific checks, timing, locale. AOP aspects intercept method calls on Spring beans regardless of how they were triggered (HTTP, Kafka listener, scheduler) — transactions, caching, auditing, metrics.`,
    detailedAnswer: `Spring Security is itself a chain of filters (DelegatingFilterProxy → FilterChainProxy). Exceptions thrown in filters do not reach @ControllerAdvice, because they occur outside DispatcherServlet — handle them in the filter or via an AuthenticationEntryPoint.`,
    seniorAnswer: `I choose the outermost layer that has the information I need. Correlation ids belong in a filter so even 404s and security rejections are traceable; business auditing belongs in AOP so it also covers async and messaging entry points.`,
    keyTerms: ['Filter', 'OncePerRequestFilter', 'HandlerInterceptor', '@Aspect', 'DispatcherServlet'],
    conceptsTested: ['request pipeline', 'cross-cutting concerns'],
    relatedTopics: ['sb-filter-vs-interceptor', 'sb-security-jwt'],
    followUps: ['q-sb-jwt-security'],
    commonMistakes: ['Expecting @ControllerAdvice to handle filter exceptions', 'Auth in interceptors'],
    strongAnswerKeywords: ['before DispatcherServlet', 'handler-aware', 'bean method', 'security filter chain'],
    codeExample: `@Aspect
@Component
class TimingAspect {
    private final MeterRegistry registry;
    TimingAspect(MeterRegistry registry) { this.registry = registry; }

    @Around("@within(org.springframework.stereotype.Service)")
    Object time(ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(registry);
        try {
            return pjp.proceed();
        } finally {
            sample.stop(registry.timer("service.method",
                    "method", pjp.getSignature().toShortString()));
        }
    }
}`,
    interviewerIntent: 'Checks understanding of the request processing pipeline and where cross-cutting logic belongs.',
    whatIsBeingTested: ['Layer selection', 'Spring Security architecture'],
  },

  /* ---------------------------------------------------- Data & Transactions */
  {
    id: 'q-sb-transaction-propagation',
    technology: T,
    question: 'Explain REQUIRED vs REQUIRES_NEW vs NESTED propagation. What is UnexpectedRollbackException?',
    category: 'Data & Transactions',
    difficulty: 'advanced',
    quickAnswer: 'REQUIRED joins the current transaction; REQUIRES_NEW suspends it and runs independently; NESTED uses a savepoint. UnexpectedRollbackException: an inner REQUIRED call marked the shared transaction rollback-only.',
    interviewAnswer: `REQUIRED (default) joins an existing transaction or starts one — inner and outer succeed or fail together. REQUIRES_NEW suspends the outer transaction and starts an independent one that commits or rolls back on its own — audit logs, sequence allocation. NESTED runs in the same physical transaction with a JDBC savepoint, so the inner part can roll back alone (DataSourceTransactionManager only, not JPA). If an inner REQUIRED method throws, the shared transaction is marked rollback-only; if the outer method catches the exception and tries to commit, Spring throws UnexpectedRollbackException.`,
    detailedAnswer: `Others: SUPPORTS (join if present, otherwise none), MANDATORY (fail if none), NOT_SUPPORTED (suspend), NEVER (fail if one exists). REQUIRES_NEW takes a second connection from the pool while the first is suspended — under load, nested REQUIRES_NEW can deadlock the pool.`,
    seniorAnswer: `I use REQUIRES_NEW sparingly and keep it short, because each one holds two connections. For "must persist even if the business transaction fails" I increasingly prefer writing an outbox/audit event asynchronously.`,
    keyTerms: ['REQUIRED', 'REQUIRES_NEW', 'NESTED', 'savepoint', 'rollback-only', 'UnexpectedRollbackException'],
    conceptsTested: ['propagation semantics', 'failure behaviour', 'connection usage'],
    relatedTopics: ['sb-transactional'],
    followUps: ['q-sb-checked-rollback', 'q-sb-outbox'],
    commonMistakes: ['Catching inner exceptions and expecting commit', 'Using NESTED with JPA'],
    strongAnswerKeywords: ['joins', 'suspends', 'savepoint', 'rollback-only'],
    codeExample: `@Service
class OuterService {
    private final InnerService inner;
    OuterService(InnerService inner) { this.inner = inner; }

    @Transactional
    public void process() {
        try {
            inner.step();                        // REQUIRED -> same transaction
        } catch (RuntimeException e) {
            // swallowed... but the transaction is already marked rollback-only
        }
    }   // commit attempt -> UnexpectedRollbackException
}

@Service
class InnerService {
    @Transactional                               // propagation = REQUIRED
    public void step() { throw new IllegalStateException("boom"); }
}`,
    expectedOutput: 'org.springframework.transaction.UnexpectedRollbackException: Transaction silently rolled back because it has been marked as rollback-only',
    interviewerIntent: 'A deep transactional question that reveals real production debugging experience.',
    whatIsBeingTested: ['Propagation', 'Rollback-only semantics', 'Connection pool implications'],
  },
  {
    id: 'q-sb-checked-rollback',
    technology: T,
    question: 'Does this transaction roll back? (checked exception thrown from a @Transactional method)',
    category: 'Data & Transactions',
    difficulty: 'intermediate',
    quickAnswer: 'No. By default Spring rolls back only on RuntimeException and Error. Use rollbackFor = Exception.class (or the specific checked type).',
    interviewAnswer: `Spring's default rule follows the EJB convention: unchecked exceptions (RuntimeException, Error) trigger rollback; checked exceptions are considered "expected business outcomes" and the transaction commits. So if saveOrder() inserts a row and then throws a checked IOException, the row is committed. Fix with @Transactional(rollbackFor = Exception.class) or throw an unchecked domain exception.`,
    detailedAnswer: `noRollbackFor lets you commit despite a specific runtime exception. Catching an exception inside the method and not rethrowing also leads to commit, because the proxy never sees it.`,
    seniorAnswer: `Teams should pick one convention — typically unchecked domain exceptions — so rollback behaviour is predictable. Inconsistent checked/unchecked usage is a frequent source of partial writes in production.`,
    keyTerms: ['rollbackFor', 'checked exception', 'RuntimeException', 'noRollbackFor'],
    conceptsTested: ['rollback rules'],
    relatedTopics: ['sb-transactional'],
    followUps: ['q-sb-transaction-propagation'],
    commonMistakes: ['Assuming any exception rolls back'],
    strongAnswerKeywords: ['unchecked only by default', 'rollbackFor'],
    codeExample: `@Service
class OrderService {
    private final OrderRepository repo;
    OrderService(OrderRepository repo) { this.repo = repo; }

    @Transactional
    public void saveOrder(Order o) throws IOException {
        repo.save(o);
        throw new IOException("label printer offline");   // checked
    }
}
// After calling saveOrder(...) and catching the IOException:
System.out.println(repo.count());`,
    expectedOutput: '1   // the order row was COMMITTED',
    interviewerIntent: 'A classic gotcha that tests precise knowledge of Spring defaults.',
    whatIsBeingTested: ['Default rollback rule', 'Fix options'],
  },
  {
    id: 'q-sb-n-plus-one',
    technology: T,
    question: 'What is the N+1 select problem in JPA, how do you detect it, and how do you fix it?',
    category: 'Data & Transactions',
    difficulty: 'advanced',
    quickAnswer: 'One query for parents plus one lazy query per parent. Detect with SQL logging/query-count tests; fix with JOIN FETCH, @EntityGraph, batch fetching or DTO projections.',
    interviewAnswer: `Loading N entities and touching a lazy association on each triggers N extra SELECTs. Detection: enable SQL logging or Hibernate statistics in dev, or assert query counts in integration tests. Fixes: JOIN FETCH or @EntityGraph to fetch the association in one query for that use case; hibernate.default_batch_fetch_size (or @BatchSize) to load children in batches with IN clauses; DTO projections for read models. Keep associations LAZY by default and turn off open-in-view so lazy loading cannot leak into serialisation.`,
    detailedAnswer: `Fetching a collection with JOIN FETCH plus pagination makes Hibernate paginate in memory; use a two-query approach (page of IDs, then fetch with associations WHERE id IN :ids). Multiple bag JOIN FETCHes cause MultipleBagFetchException — use Sets or separate queries.`,
    seniorAnswer: `I add a query-count assertion to critical endpoint tests so N+1 regressions break the build. Most "the database is slow" incidents I have seen were an ORM issuing thousands of tiny queries, not a slow database.`,
    keyTerms: ['N+1', 'lazy loading', 'JOIN FETCH', '@EntityGraph', 'batch fetching', 'open-in-view'],
    conceptsTested: ['ORM behaviour', 'performance diagnosis'],
    relatedTopics: ['sb-jpa-n-plus-one'],
    followUps: ['q-sb-transaction-propagation'],
    commonMistakes: ['Switching to EAGER', 'Ignoring generated SQL'],
    strongAnswerKeywords: ['lazy', 'JOIN FETCH', 'EntityGraph', 'batch size', 'query count'],
    codeExample: `@Query("""
       select o from Order o
       join fetch o.customer
       where o.status = :status
       """)
List<Order> findWithCustomerByStatus(@Param("status") OrderStatus status);

// Read-only view: DTO projection, no entities, no lazy loading at all
record OrderSummary(Long id, String customerName, BigDecimal total) { }

@Query("""
       select new com.bank.orders.OrderSummary(o.id, c.name, o.total)
       from Order o join o.customer c
       where o.status = :status
       """)
List<OrderSummary> summaries(@Param("status") OrderStatus status);`,
    interviewerIntent: 'Tests real ORM experience; nearly every production Spring/JPA system hits this.',
    whatIsBeingTested: ['Diagnosis', 'Multiple fix strategies', 'Pagination caveat'],
  },

  /* --------------------------------------------------------- Microservices */
  {
    id: 'q-sb-monolith-vs-microservices',
    technology: T,
    question: 'When would you choose microservices over a monolith — and when would you not?',
    category: 'Microservices',
    difficulty: 'senior',
    quickAnswer: 'Choose microservices for independent scaling/deployment across multiple teams with clear bounded contexts; stay with a modular monolith for small teams or unclear domains.',
    interviewAnswer: `Microservices pay off when several teams need to deploy independently, parts of the system have very different scaling or availability needs, and domain boundaries are well understood. The price is distributed-systems complexity: network failures, eventual consistency, distributed tracing, more infrastructure, and harder testing. For a small team or a new product with an evolving domain I start with a modular monolith — strong module boundaries, separate schemas per module — and extract services along proven seams using the Strangler Fig pattern.`,
    detailedAnswer: `Signals you split too early: services that must be deployed together, a shared database, synchronous chains five calls deep, and teams blocked on each other's releases. Signals it is time to split: deploy contention, one module dominating scaling cost, conflicting technology needs, or compliance isolation requirements.`,
    seniorAnswer: `I frame it as an organisational decision as much as a technical one (Conway's Law): services should map to team ownership. Platform maturity — CI/CD, observability, service templates — is a prerequisite; without it, microservices multiply operational pain.`,
    keyTerms: ['modular monolith', 'bounded context', 'Strangler Fig', "Conway's Law", 'distributed monolith'],
    conceptsTested: ['architecture trade-offs', 'pragmatism'],
    relatedTopics: ['sb-microservices-patterns'],
    followUps: ['q-sb-sync-vs-async', 'q-sb-saga'],
    commonMistakes: ['"Microservices are always better"', 'Ignoring team topology'],
    strongAnswerKeywords: ['independent deployment', 'bounded context', 'operational cost', 'modular monolith', 'strangler'],
    interviewerIntent: 'Senior roles are judged on trade-off reasoning, not on enthusiasm for a trend.',
    whatIsBeingTested: ['Judgement', 'Experience with migration', 'Org awareness'],
  },
  {
    id: 'q-sb-sync-vs-async',
    technology: T,
    question: 'REST/gRPC vs Kafka events between microservices — how do you decide?',
    category: 'Microservices',
    difficulty: 'advanced',
    quickAnswer: 'Synchronous when the caller needs an immediate answer to continue; asynchronous events when the work can happen later or many consumers care.',
    interviewAnswer: `Synchronous request/response (REST, gRPC) suits queries and commands whose result the caller needs right now — validating an account before accepting a payment. It creates temporal coupling: if the callee is down or slow, so is the caller. Asynchronous messaging (Kafka) decouples services in time and scale: the producer publishes "PaymentCompleted" and any number of consumers (notifications, ledger, analytics) react independently, with buffering during spikes and replay. The costs are eventual consistency, idempotency and ordering concerns, and harder end-to-end debugging. Most systems mix both: sync for the critical query path, async for propagation of facts.`,
    detailedAnswer: `gRPC beats REST for low-latency internal calls with strict contracts and streaming; REST is better for public/partner APIs. For async, decide event types: domain events (facts), commands (requests to do something), and event-carried state transfer (include the data so consumers avoid callbacks).`,
    seniorAnswer: `A useful heuristic: if a downstream failure should NOT fail the user's request, it should be asynchronous. Sending the confirmation email must never roll back a successful payment.`,
    keyTerms: ['temporal coupling', 'eventual consistency', 'gRPC', 'Kafka', 'domain event', 'idempotency'],
    conceptsTested: ['communication styles', 'coupling', 'consistency'],
    relatedTopics: ['sb-microservices-patterns', 'kafka-overview'],
    followUps: ['q-sb-outbox', 'q-sb-idempotent-consumer'],
    commonMistakes: ['Everything synchronous', 'Async for queries that need an answer'],
    strongAnswerKeywords: ['temporal coupling', 'immediate answer', 'eventual consistency', 'fan-out'],
    interviewerIntent: 'Checks whether the candidate can design interaction patterns rather than default to REST everywhere.',
    whatIsBeingTested: ['Trade-off reasoning', 'Event-driven design'],
  },
  {
    id: 'q-sb-service-discovery',
    technology: T,
    question: 'How do microservices discover each other? Do you still need Eureka on Kubernetes?',
    category: 'Microservices',
    difficulty: 'intermediate',
    quickAnswer: 'Client-side discovery (Eureka/Consul + load balancer) or server-side (Kubernetes Services/DNS). On Kubernetes, platform DNS usually makes Eureka unnecessary.',
    interviewAnswer: `In client-side discovery, instances register with a registry (Eureka, Consul) and send heartbeats; callers fetch the instance list and load-balance locally (Spring Cloud LoadBalancer with lb://service-name). In server-side discovery, the platform does it: a Kubernetes Service has a stable virtual IP and DNS name, and traffic goes only to pods passing readiness probes. On Kubernetes I normally rely on Services/DNS (plus a service mesh if we need mTLS, retries and traffic shifting), and keep Eureka only for hybrid estates with VMs outside the cluster.`,
    detailedAnswer: `Readiness probes are the integration point: a pod that is not ready is removed from Service endpoints. Spring Boot's /actuator/health/readiness reflects application availability state, including during graceful shutdown.`,
    seniorAnswer: `Fewer moving parts is a reliability feature. Duplicating discovery in the app layer and the platform creates two sources of truth that can disagree during incidents.`,
    keyTerms: ['Eureka', 'Consul', 'Kubernetes Service', 'DNS', 'readiness probe', 'service mesh'],
    conceptsTested: ['discovery models', 'platform awareness'],
    relatedTopics: ['sb-service-discovery-config'],
    followUps: ['q-sb-liveness-readiness'],
    commonMistakes: ['Hard-coded IPs', 'Eureka by habit on k8s'],
    strongAnswerKeywords: ['client-side', 'server-side', 'DNS', 'readiness'],
    interviewerIntent: 'Checks whether knowledge is current with container platforms.',
    whatIsBeingTested: ['Discovery patterns', 'Kubernetes fluency'],
  },
  {
    id: 'q-sb-gateway-responsibilities',
    technology: T,
    question: 'What should an API Gateway (e.g. Spring Cloud Gateway) do, and what should it not do?',
    category: 'Microservices',
    difficulty: 'advanced',
    quickAnswer: 'Do: routing, TLS, authentication/token validation, rate limiting, request limits, correlation ids, CORS. Do not: business logic, data aggregation that belongs to a BFF, fine-grained authorisation.',
    interviewAnswer: `The gateway is the single entry point that handles cross-cutting edge concerns: routing to services, TLS termination, token validation, coarse rate limiting and quotas, request size limits, CORS, adding correlation ids, and resilience (timeouts, circuit breakers with fallbacks). It should not contain business rules or become an orchestration layer — that couples every team to one deployable. Client-specific aggregation belongs in a Backend-for-Frontend, and object-level authorisation must still happen inside each service.`,
    detailedAnswer: `Spring Cloud Gateway is reactive (WebFlux/Netty), so filters must be non-blocking. It scales horizontally behind a load balancer; Redis backs the distributed rate limiter. Managed alternatives: AWS API Gateway, Kong, Apigee, NGINX/Envoy.`,
    seniorAnswer: `I design for gateway failure: multiple instances across zones, health-checked, with config changes rolled out gradually. Because it sees all traffic, it is also the best place for access logs and edge metrics — but it must never be the only security control.`,
    keyTerms: ['API Gateway', 'BFF', 'rate limiting', 'token validation', 'zero trust'],
    conceptsTested: ['edge architecture', 'responsibility boundaries'],
    relatedTopics: ['sb-spring-cloud-gateway', 'sd-api-gateway'],
    followUps: ['q-sb-jwt-security', 'q-sb-circuit-breaker'],
    commonMistakes: ['Business logic in gateway', 'Gateway as only auth layer'],
    strongAnswerKeywords: ['cross-cutting', 'routing', 'rate limiting', 'no business logic', 'BFF'],
    codeExample: `@Bean
RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("accounts", r -> r.path("/api/accounts/**")
            .filters(f -> f.stripPrefix(1)
                .addRequestHeader("X-Gateway", "edge-1")
                .circuitBreaker(c -> c.setName("accountsCB").setFallbackUri("forward:/fallback/accounts"))
                .retry(cfg -> cfg.setRetries(2).setMethods(HttpMethod.GET)))   // retry only idempotent GETs
            .uri("lb://account-service"))
        .build();
}

@Bean
KeyResolver userKeyResolver() {                      // rate-limit per authenticated user
    return exchange -> exchange.getPrincipal().map(Principal::getName).defaultIfEmpty("anonymous");
}`,
    interviewerIntent: 'Tests architectural boundaries and security thinking at the edge.',
    whatIsBeingTested: ['Gateway responsibilities', 'Anti-patterns', 'Reactive constraints'],
  },
  {
    id: 'q-sb-outbox',
    technology: T,
    question: 'How do you reliably save to the database AND publish a Kafka event? (the dual-write problem)',
    category: 'Microservices',
    difficulty: 'senior',
    quickAnswer: 'Transactional Outbox: write the event to an outbox table in the same DB transaction, then publish it asynchronously via a relay or CDC (Debezium). Consumers dedupe.',
    interviewAnswer: `Writing to the DB and to Kafka are two separate systems with no shared transaction; a crash between them loses the event or publishes an event for data that was rolled back. The Transactional Outbox pattern inserts the business row and an outbox row (event id, aggregate id, type, payload) in one local transaction. A separate process — a polling publisher or change data capture with Debezium reading the DB log — publishes outbox rows to Kafka and marks them sent. Delivery is at-least-once, so consumers must be idempotent, typically by recording processed event ids.`,
    detailedAnswer: `Ordering: key Kafka messages by aggregate id so events for one entity stay in one partition. Clean up published outbox rows periodically. CDC avoids polling load and preserves commit order; polling is simpler to run. Kafka transactions alone do not solve it, because they do not include your database.`,
    seniorAnswer: `In a payments platform I made the outbox part of the service template so every team got it for free: a shared table schema, a Debezium connector per database, and a consumer library that handles dedupe and retries with a DLQ. That eliminated a whole class of reconciliation incidents.`,
    keyTerms: ['dual write', 'transactional outbox', 'CDC', 'Debezium', 'at-least-once', 'idempotent consumer'],
    conceptsTested: ['distributed consistency', 'event publishing'],
    relatedTopics: ['sb-saga-outbox', 'kafka-exactly-once'],
    followUps: ['q-sb-idempotent-consumer', 'q-sb-saga'],
    commonMistakes: ['kafkaTemplate.send inside @Transactional and assuming atomicity', 'Using XA/2PC'],
    strongAnswerKeywords: ['same local transaction', 'relay', 'CDC', 'at-least-once', 'idempotent'],
    codeExample: `@Component
class OutboxRelay {
    private final OutboxRepository outbox;
    private final KafkaTemplate<String, String> kafka;
    OutboxRelay(OutboxRepository o, KafkaTemplate<String, String> k) { outbox = o; kafka = k; }

    @Scheduled(fixedDelay = 500)
    @Transactional
    public void publish() {
        // FOR UPDATE SKIP LOCKED lets several relay instances run safely
        for (OutboxEvent e : outbox.lockNextBatch(100)) {
            kafka.send("orders", e.aggregateId(), e.payload()).join();   // wait for broker ack
            e.markPublished();
        }
    }
}`,
    interviewerIntent: 'A defining senior microservices question: the right answer shows you have been burned by dual writes.',
    whatIsBeingTested: ['Consistency patterns', 'Delivery semantics', 'Operational design'],
    aiAwareness: {
      strongAnswerShouldMention: ['dual write', 'outbox table in same transaction', 'relay/CDC', 'at-least-once', 'idempotent consumer', 'partition key ordering'],
      weakAnswer: 'Send to Kafka after saving, and retry if it fails.',
      redFlags: ['Assumes @Transactional covers Kafka', 'Ignores duplicates'],
      likelyFollowUp: ['How do consumers deduplicate?', 'Polling vs CDC?', 'How do you preserve ordering?'],
    },
  },
  {
    id: 'q-sb-saga',
    technology: T,
    question: 'Design an order flow across Order, Payment and Inventory services without distributed transactions.',
    category: 'Microservices',
    difficulty: 'architect',
    quickAnswer: 'Use a Saga: a sequence of local transactions with events/commands, and compensating actions (refund, release stock, cancel order) when a step fails.',
    interviewAnswer: `Orchestrated saga: OrderService creates the order as PENDING and the orchestrator sends ReservePayment; on PaymentReserved it sends ReserveStock; on StockReserved it confirms the order. If stock fails, it sends RefundPayment and marks the order CANCELLED. Each step is a local transaction published via outbox; every handler is idempotent; each step has a timeout. In choreography, services react to each other's events (OrderCreated → Payment, PaymentReserved → Inventory, StockFailed → Payment refunds and Order cancels) — fewer moving parts but the flow is implicit and harder to monitor.`,
    detailedAnswer: `Sagas give ACD without I — intermediate states are visible. Countermeasures: semantic locks (PENDING status), commutative updates, re-reading values before compensations. Pivot transactions mark the point after which the saga must complete forward (retriable steps) rather than compensate.`,
    seniorAnswer: `For flows with money I use orchestration with a durable workflow engine (Temporal, Camunda) or a persisted state machine: state is queryable, timeouts and retries are explicit, and auditors can see every transition. Compensations must be idempotent and must themselves be retried until they succeed, with alerting and a manual repair path for the rare case they cannot.`,
    keyTerms: ['saga', 'orchestration', 'choreography', 'compensating transaction', 'semantic lock', 'pivot transaction'],
    conceptsTested: ['distributed workflow design', 'failure handling', 'consistency trade-offs'],
    relatedTopics: ['sb-saga-outbox', 'sb-microservices-patterns'],
    followUps: ['q-sb-outbox', 'q-sb-idempotent-consumer'],
    commonMistakes: ['2PC across services', 'No compensation design', 'Non-idempotent steps'],
    strongAnswerKeywords: ['local transactions', 'compensation', 'orchestrator', 'idempotent', 'timeouts'],
    codeExample: `enum OrderSagaState { STARTED, PAYMENT_RESERVED, STOCK_RESERVED, COMPLETED, COMPENSATING, CANCELLED }

@Component
class OrderSagaOrchestrator {
    private final SagaRepository sagas;
    private final CommandPublisher commands;
    OrderSagaOrchestrator(SagaRepository s, CommandPublisher c) { sagas = s; commands = c; }

    @Transactional
    public void on(PaymentReserved evt) {
        OrderSaga saga = sagas.get(evt.orderId());
        if (saga.state() != OrderSagaState.STARTED) return;          // idempotent: duplicate event
        saga.transition(OrderSagaState.PAYMENT_RESERVED);
        commands.send(new ReserveStock(evt.orderId(), saga.items())); // via outbox
    }

    @Transactional
    public void on(StockReservationFailed evt) {
        OrderSaga saga = sagas.get(evt.orderId());
        if (saga.state() != OrderSagaState.PAYMENT_RESERVED) return;
        saga.transition(OrderSagaState.COMPENSATING);
        commands.send(new RefundPayment(evt.orderId(), saga.paymentId())); // compensation
    }
}`,
    interviewerIntent: 'An architect-level design exercise testing failure-first thinking.',
    whatIsBeingTested: ['Saga design', 'Idempotency', 'Operational visibility'],
  },
  {
    id: 'q-sb-idempotent-consumer',
    technology: T,
    question: 'Write an idempotent Kafka consumer for payment events that may be delivered more than once.',
    category: 'Microservices',
    difficulty: 'advanced',
    quickAnswer: 'Record the event id in a processed-events table with a unique constraint in the same transaction as the side effect; skip if already present.',
    interviewAnswer: `With at-least-once delivery, a consumer can receive the same event after a rebalance or retry. I make processing idempotent by storing each event id in a processed_events table with a primary key, inside the same database transaction as the business update. If the insert fails with a duplicate key, the event was already applied, so I skip it and acknowledge. Offsets are committed only after the transaction succeeds. Alternatively, design naturally idempotent operations (upserts, "set status = PAID where status = PENDING").`,
    detailedAnswer: `Poison messages should go to a dead-letter topic after bounded retries (Spring Kafka DefaultErrorHandler with DeadLetterPublishingRecoverer) so one bad record does not block the partition. Keep processed ids for at least the maximum redelivery window.`,
    seniorAnswer: `Idempotency keys should come from the producer's business identity (payment id + event type/version), not Kafka offsets, because offsets change if data is replayed or mirrored to another cluster.`,
    keyTerms: ['idempotent consumer', 'at-least-once', 'dedupe table', 'unique constraint', 'DLT'],
    conceptsTested: ['delivery semantics', 'transactional dedupe'],
    relatedTopics: ['sb-saga-outbox', 'kafka-consumer', 'kafka-dead-letter'],
    followUps: ['q-sb-outbox'],
    commonMistakes: ['Dedupe check and side effect in separate transactions', 'Using offsets as idempotency keys'],
    strongAnswerKeywords: ['event id', 'unique constraint', 'same transaction', 'commit offset after'],
    codeExample: `@Component
class PaymentEventsListener {
    private final ProcessedEventRepository processed;
    private final LedgerService ledger;
    PaymentEventsListener(ProcessedEventRepository p, LedgerService l) { processed = p; ledger = l; }

    @KafkaListener(topics = "payments.completed", groupId = "ledger")
    @Transactional
    public void on(PaymentCompleted evt) {
        if (processed.existsById(evt.eventId())) return;        // fast path for duplicates
        processed.save(new ProcessedEvent(evt.eventId()));       // PK guards concurrent duplicates
        ledger.post(evt.accountId(), evt.amount());              // side effect, same DB transaction
    }   // commit -> then the container commits the Kafka offset
}

// Same event delivered twice -> ledger posted once.`,
    expectedOutput: 'first delivery: ledger posted\nsecond delivery: skipped (already processed)',
    interviewerIntent: 'A practical coding question: does the candidate get the transaction boundary right?',
    whatIsBeingTested: ['Idempotency implementation', 'Transaction boundaries', 'Error handling'],
  },

  /* ------------------------------------------------- Resilience & Security */
  {
    id: 'q-sb-circuit-breaker',
    technology: T,
    question: 'Explain the circuit breaker pattern and its states. How do you configure it with Resilience4j?',
    category: 'Resilience & Security',
    difficulty: 'advanced',
    quickAnswer: 'CLOSED (normal), OPEN (fail fast after failure threshold), HALF_OPEN (trial calls). Configure sliding window, failure/slow-call thresholds and open wait time.',
    interviewAnswer: `A circuit breaker wraps calls to a dependency and records outcomes in a sliding window (count or time based). While CLOSED, calls pass through. When the failure rate or slow-call rate exceeds a threshold, it trips OPEN: calls fail immediately (or go to a fallback) for a configured wait, giving the dependency room to recover and protecting the caller's threads. Then it moves to HALF_OPEN and allows a few trial calls — success closes it, failure re-opens it. Resilience4j configures this with sliding-window-size, failure-rate-threshold, slow-call-duration-threshold, wait-duration-in-open-state and permitted-number-of-calls-in-half-open-state.`,
    detailedAnswer: `Combine with timeouts (TimeLimiter or client timeouts) so slow calls count as failures, bulkheads to cap concurrency, and fallbacks that degrade gracefully. Decide which exceptions count: a 404 from a lookup is a valid answer, not a failure (ignoreExceptions).`,
    seniorAnswer: `Breaker state must be observable — export metrics and alert on OPEN. Tune thresholds from production latency/error baselines; a breaker that trips on normal noise causes outages of its own.`,
    keyTerms: ['CLOSED', 'OPEN', 'HALF_OPEN', 'sliding window', 'failure rate', 'slow call', 'fallback'],
    conceptsTested: ['resilience patterns', 'configuration'],
    relatedTopics: ['sb-resilience4j'],
    followUps: ['q-sb-retry-idempotency'],
    commonMistakes: ['No timeout so slow calls never fail', 'Counting business errors as failures'],
    strongAnswerKeywords: ['fail fast', 'half-open', 'sliding window', 'fallback', 'metrics'],
    codeExample: `CircuitBreakerConfig config = CircuitBreakerConfig.custom()
        .slidingWindowSize(10)
        .minimumNumberOfCalls(10)
        .failureRateThreshold(50)
        .waitDurationInOpenState(Duration.ofSeconds(5))
        .permittedNumberOfCallsInHalfOpenState(2)
        .build();
CircuitBreaker cb = CircuitBreaker.of("fx-rates", config);

Supplier<String> call = CircuitBreaker.decorateSupplier(cb, () -> { throw new RuntimeException("down"); });
for (int i = 0; i < 10; i++) {
    try { call.get(); } catch (Exception ignored) { }
}
System.out.println(cb.getState());
try { call.get(); } catch (CallNotPermittedException e) { System.out.println("rejected fast"); }`,
    expectedOutput: 'OPEN\nrejected fast',
    interviewerIntent: 'Tests depth on the most-asked resilience pattern, beyond the textbook definition.',
    whatIsBeingTested: ['State machine', 'Tuning', 'Observability'],
  },
  {
    id: 'q-sb-retry-idempotency',
    technology: T,
    question: 'A payment POST times out. Is it safe to retry? How do you design for it?',
    category: 'Resilience & Security',
    difficulty: 'senior',
    quickAnswer: 'Not by default — the payment may have succeeded. Use an Idempotency-Key: the server stores the key with the result and returns the same result on retry.',
    interviewAnswer: `A timeout means "unknown outcome", not failure. Blindly retrying a non-idempotent POST can double-charge. The client sends an Idempotency-Key header (a UUID per logical operation). The server atomically records the key (unique constraint) with a request hash; if the key already exists, it returns the stored response instead of reprocessing; if the first request is still in progress, it returns 409/425 or waits. Retries use exponential backoff with jitter, a maximum attempt count, and an overall deadline.`,
    detailedAnswer: `GET, PUT and DELETE are idempotent by HTTP semantics; POST and PATCH are not. Store keys with a TTL (e.g. 24h). Reject the same key with a different payload (422). Stripe's API popularised this pattern.`,
    seniorAnswer: `Retry in exactly one layer, closest to the failure, with a retry budget; retries at gateway, service and client multiply traffic during an outage and turn a blip into a retry storm.`,
    keyTerms: ['idempotency key', 'exponential backoff', 'jitter', 'retry storm', 'at-most-once'],
    conceptsTested: ['retry safety', 'API idempotency design'],
    relatedTopics: ['sb-resilience4j', 'sd-rest-api-design'],
    followUps: ['q-sb-circuit-breaker', 'q-sd-idempotency-key'],
    commonMistakes: ['Retrying POSTs blindly', 'Retries in every layer', 'No jitter'],
    strongAnswerKeywords: ['unknown outcome', 'Idempotency-Key', 'stored response', 'backoff with jitter'],
    codeExample: `@PostMapping("/payments")
ResponseEntity<PaymentResponse> pay(@RequestHeader("Idempotency-Key") String key,
                                    @Valid @RequestBody PaymentRequest req) {
    return idempotency.execute(key, req, () -> paymentService.charge(req));
}

@Service
class IdempotencyService {
    private final IdempotencyRepository repo;
    IdempotencyService(IdempotencyRepository repo) { this.repo = repo; }

    @Transactional
    <T> ResponseEntity<T> execute(String key, Object req, Supplier<T> action) {
        Optional<IdempotencyRecord> existing = repo.findById(key);
        if (existing.isPresent()) {
            if (!existing.get().requestHash().equals(hash(req)))
                return ResponseEntity.unprocessableEntity().build();     // key reused with different body
            return ResponseEntity.ok(existing.get().<T>response());      // replay stored result
        }
        T result = action.get();
        repo.save(new IdempotencyRecord(key, hash(req), result));        // PK on key
        return ResponseEntity.status(201).body(result);
    }
    private String hash(Object req) { return Integer.toHexString(req.hashCode()); }
}`,
    interviewerIntent: 'Assesses whether you think about money-moving operations with failure semantics in mind.',
    whatIsBeingTested: ['Idempotency', 'Retry policy', 'Distributed failure reasoning'],
  },
  {
    id: 'q-sb-jwt-security',
    technology: T,
    question: 'How do you secure a Spring Boot microservice with JWT/OAuth2? What are the pitfalls?',
    category: 'Resilience & Security',
    difficulty: 'advanced',
    quickAnswer: 'Configure it as an OAuth2 resource server that validates JWT signature, issuer, audience and expiry via JWKS; authorise with scopes and @PreAuthorize; keep tokens short-lived.',
    interviewAnswer: `The identity provider (Keycloak, Okta, Azure AD) issues JWT access tokens. Each service is an OAuth2 resource server: Spring Security fetches the provider's JWKS, verifies the signature, checks iss, aud, exp/nbf, and maps scopes/roles to GrantedAuthorities. The API is stateless (no session, CSRF off for pure bearer APIs). Authorisation uses requestMatchers rules plus @PreAuthorize for method and object-level checks. Pitfalls: JWTs are signed not encrypted — no sensitive data in claims; they cannot be revoked easily — short lifetimes plus refresh tokens; accepting alg=none or skipping audience validation; and checking roles but not ownership of the resource (BOLA).`,
    detailedAnswer: `Service-to-service calls use the client credentials grant or token exchange, ideally plus mTLS. Clock skew tolerance should be small. The gateway can validate tokens early, but every service must still validate, because internal traffic can bypass the gateway.`,
    seniorAnswer: `Broken Object Level Authorization is the top OWASP API risk. I enforce ownership in the domain/service layer (e.g. repository queries scoped by customer id from the token), not just URL rules, and test it with negative tests that try other users' ids.`,
    keyTerms: ['OAuth2', 'OIDC', 'JWT', 'JWKS', 'resource server', 'scope', 'BOLA', 'client credentials'],
    conceptsTested: ['API security', 'token validation', 'authorisation design'],
    relatedTopics: ['sb-security-jwt', 'sb-spring-cloud-gateway'],
    followUps: ['q-sb-gateway-responsibilities', 'q-sb-filter-vs-interceptor'],
    commonMistakes: ['PII in JWT', 'Long-lived tokens', 'No ownership checks', 'Confusing 401/403'],
    strongAnswerKeywords: ['signature', 'issuer', 'audience', 'expiry', 'stateless', 'object-level authorisation'],
    codeExample: `// Object-level authorisation: scope queries by the caller's identity
@Service
class StatementService {
    private final StatementRepository repo;
    StatementService(StatementRepository repo) { this.repo = repo; }

    public Statement get(Jwt jwt, Long statementId) {
        String customerId = jwt.getClaimAsString("customer_id");
        return repo.findByIdAndCustomerId(statementId, customerId)      // never findById alone
                .orElseThrow(() -> new ResourceNotFoundException("statement")); // 404, do not reveal existence
    }
}`,
    interviewerIntent: 'Checks practical security knowledge beyond "add Spring Security".',
    whatIsBeingTested: ['Token validation', 'Authorisation depth', 'OWASP awareness'],
  },
  {
    id: 'q-sb-liveness-readiness',
    technology: T,
    question: 'What is the difference between liveness and readiness probes, and how does Spring Boot support them?',
    category: 'Resilience & Security',
    difficulty: 'intermediate',
    quickAnswer: 'Liveness: should the pod be restarted? Readiness: should it receive traffic now? Boot exposes /actuator/health/liveness and /readiness.',
    interviewAnswer: `A failing liveness probe makes Kubernetes restart the container — it should detect only an unrecoverable state (deadlock, broken app context). A failing readiness probe removes the pod from Service endpoints without restarting it — during startup warm-up, graceful shutdown, or when a critical dependency is temporarily unavailable. Spring Boot exposes both as health groups (management.endpoint.health.probes.enabled=true) driven by ApplicationAvailability state; you can add indicators to the readiness group.`,
    detailedAnswer: `Never put external dependencies (database, downstream APIs) into liveness: an outage would restart every pod and make recovery slower. Use a startupProbe for slow-starting apps so liveness does not kill them during boot. Enable graceful shutdown (server.shutdown=graceful) so readiness flips to refusing traffic before in-flight requests drain.`,
    seniorAnswer: `Probe design is a resilience decision. I have seen a DB failover turn into a full outage because liveness checked the DB and Kubernetes restarted 60 pods in a loop.`,
    keyTerms: ['liveness', 'readiness', 'startupProbe', 'graceful shutdown', 'health group'],
    conceptsTested: ['Kubernetes integration', 'failure isolation'],
    relatedTopics: ['sb-actuator-observability', 'sb-service-discovery-config'],
    followUps: ['q-sb-service-discovery'],
    commonMistakes: ['DB check in liveness', 'No startup probe for slow apps'],
    strongAnswerKeywords: ['restart vs traffic', 'no dependencies in liveness', 'graceful shutdown'],
    codeExample: `# application.yml
management:
  endpoint:
    health:
      probes:
        enabled: true
      group:
        readiness:
          include: readinessState, db, kafka
server:
  shutdown: graceful

# deployment.yaml (excerpt)
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
  periodSeconds: 5
startupProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  failureThreshold: 30
  periodSeconds: 5`,
    codeLanguage: 'YAML',
    interviewerIntent: 'Practical production-readiness question for anyone deploying Spring on Kubernetes.',
    whatIsBeingTested: ['Probe semantics', 'Failure-mode thinking'],
  },

  /* ---------------------------------------------------------- Maven & Build */
  {
    id: 'q-sb-maven-lifecycle',
    technology: T,
    question: 'Explain the Maven build lifecycle. What is the difference between mvn package, install and deploy?',
    category: 'Maven & Build',
    difficulty: 'beginner',
    quickAnswer: 'Phases run in order: validate, compile, test, package, verify, install, deploy. package builds the artifact, install copies it to ~/.m2, deploy uploads to a remote repository.',
    interviewAnswer: `Maven's default lifecycle is an ordered list of phases; invoking one runs every earlier phase. Plugin goals bound to phases do the work: compiler:compile, surefire:test, jar:jar or spring-boot:repackage, failsafe:integration-test/verify. package produces target/app.jar; install also copies it into the local repository so other local projects can depend on it; deploy publishes it to a remote repository (Nexus/Artifactory) for other teams and CI. clean is a separate lifecycle that deletes target/.`,
    detailedAnswer: `In CI, mvn -B clean verify is typically enough (compile, unit tests, package, integration tests, quality checks). Use -pl and -am to build selected modules of a multi-module project, -T 1C for parallel builds, and -o for offline.`,
    seniorAnswer: `Release builds should be reproducible: pinned plugin versions via pluginManagement, no SNAPSHOT dependencies (maven-enforcer requireReleaseDeps), and project.build.outputTimestamp set for reproducible jars.`,
    keyTerms: ['lifecycle', 'phase', 'goal', 'install', 'deploy', 'surefire', 'failsafe'],
    conceptsTested: ['build fundamentals'],
    relatedTopics: ['sb-maven-lifecycle'],
    followUps: ['q-sb-maven-conflicts', 'q-sb-maven-scopes'],
    commonMistakes: ['Confusing phases and goals', 'Thinking install is required for packaging'],
    strongAnswerKeywords: ['ordered phases', 'plugin goals bound', 'local vs remote repository'],
    codeExample: `mvn clean package            # target/payment-service-1.4.0-SNAPSHOT.jar
mvn clean verify             # + integration tests (Failsafe) and checks
mvn install                  # + copy to ~/.m2/repository/com/bank/payment-service/...
mvn deploy                   # + upload to distributionManagement repository
mvn -pl payment-app -am verify   # one module and the modules it depends on
mvn help:effective-pom       # see the fully resolved POM including parent defaults`,
    codeLanguage: 'Shell',
    interviewerIntent: 'Baseline build knowledge expected from any experienced Java engineer.',
    whatIsBeingTested: ['Lifecycle', 'Repository model'],
  },
  {
    id: 'q-sb-maven-conflicts',
    technology: T,
    question: 'Your app fails at runtime with NoSuchMethodError after adding a dependency. How do you diagnose and fix it in Maven?',
    category: 'Maven & Build',
    difficulty: 'intermediate',
    quickAnswer: 'A transitive version conflict: inspect mvn dependency:tree -Dverbose, then pin the version in dependencyManagement/BOM or exclude the transitive artifact; enforce convergence.',
    interviewAnswer: `NoSuchMethodError or ClassNotFoundException after a dependency change usually means two libraries need different versions of a shared transitive dependency, and Maven's "nearest wins" mediation picked the wrong one. I run mvn dependency:tree -Dverbose -Dincludes=groupId:artifactId to see which versions were requested and which won. Fix by declaring the correct version in dependencyManagement (or importing the library's BOM), adding an exclusion on the dependency that drags in the old version, and adding maven-enforcer-plugin's dependencyConvergence rule so it cannot regress silently.`,
    detailedAnswer: `With Spring Boot, prefer overriding the managed version property (e.g. <jackson-bom.version>) rather than hard-coding versions in dependencies. At runtime, -verbose:class or logging the code source of a class shows which jar was actually loaded.`,
    seniorAnswer: `Shading/relocation (maven-shade-plugin) is the last resort for truly incompatible libraries — useful for internal client SDKs so they do not impose versions on consumers.`,
    keyTerms: ['dependency:tree', 'nearest wins', 'dependencyManagement', 'BOM', 'exclusion', 'enforcer', 'shading'],
    conceptsTested: ['dependency mediation', 'troubleshooting'],
    relatedTopics: ['sb-maven-dependency-management'],
    followUps: ['q-sb-maven-scopes'],
    commonMistakes: ['Treating it as a code bug', 'Random version bumps without checking the tree'],
    strongAnswerKeywords: ['transitive', 'nearest wins', 'dependency:tree', 'dependencyManagement', 'enforcer'],
    codeExample: `$ mvn dependency:tree -Dverbose -Dincludes=com.google.guava:guava
[INFO] com.bank:payment-service:jar:1.4.0-SNAPSHOT
[INFO] +- com.vendor:fx-client:jar:2.0:compile
[INFO] |  \\- com.google.guava:guava:jar:19.0:compile          <- nearest, WINS
[INFO] \\- com.bank:rules-engine:jar:5.1:compile
[INFO]    \\- (com.google.guava:guava:jar:33.2.1-jre:compile - omitted for conflict with 19.0)

<!-- Fix: pin the version for the whole build -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>33.2.1-jre</version>
    </dependency>
  </dependencies>
</dependencyManagement>`,
    codeLanguage: 'Shell / XML',
    interviewerIntent: 'Real-world build debugging that every senior Java developer has done.',
    whatIsBeingTested: ['Maven mediation rules', 'Diagnostic commands', 'Durable fixes'],
  },
  {
    id: 'q-sb-maven-scopes',
    technology: T,
    question: 'Explain Maven dependency scopes and dependencyManagement vs dependencies.',
    category: 'Maven & Build',
    difficulty: 'beginner',
    quickAnswer: 'compile, provided, runtime, test, system, import. dependencyManagement only declares versions; dependencies actually add jars to the classpath.',
    interviewAnswer: `compile (default) is available everywhere and transitive. provided is needed to compile but supplied by the runtime (servlet API in an external container, Lombok) and not packaged. runtime is not needed to compile but needed to run (JDBC drivers). test is only for test compilation and execution (JUnit, Mockito, Testcontainers). import is used only in dependencyManagement to import a BOM. dependencyManagement centralises versions and scopes without adding anything to the classpath; child modules then declare dependencies without a version.`,
    detailedAnswer: `Test-scoped dependencies are not transitive. optional=true prevents a dependency from propagating to consumers. In Spring Boot fat jars, provided dependencies are excluded from BOOT-INF/lib.`,
    seniorAnswer: `Getting scopes right shrinks the production artifact and attack surface — test libraries and annotation processors should never ship in the runtime image.`,
    keyTerms: ['compile', 'provided', 'runtime', 'test', 'import', 'optional', 'dependencyManagement'],
    conceptsTested: ['classpath control'],
    relatedTopics: ['sb-maven-dependency-management'],
    followUps: ['q-sb-maven-conflicts'],
    commonMistakes: ['Thinking dependencyManagement adds dependencies', 'JDBC driver in compile scope unnecessarily'],
    strongAnswerKeywords: ['provided', 'runtime', 'test not transitive', 'versions only'],
    codeExample: `<dependencies>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>          <!-- code depends only on JDBC interfaces -->
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>         <!-- compile-time annotation processing only -->
  </dependency>
  <dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>`,
    codeLanguage: 'XML',
    interviewerIntent: 'Fundamental Maven knowledge often used as a warm-up.',
    whatIsBeingTested: ['Scope semantics', 'Version management'],
  },
];
