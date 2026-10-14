import type { LearningTopic } from '../../types';

const T = 'spring-boot';

export const springBootTopics: LearningTopic[] = [
  /* ------------------------------------------------------------ Spring Core */
  {
    id: 'sb-ioc-di',
    technology: T,
    title: 'IoC Container & Dependency Injection',
    category: 'Spring Core',
    slug: 'sb-ioc-di',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Spring creates and wires your objects (beans) for you, so classes declare what they need instead of constructing it.',
    mentalModel: 'Your classes are appliances that declare which sockets they need; the IoC container is the electrician who wires the building at startup.',
    memoryTip: 'Constructor injection = required, immutable, testable. Field injection = hidden, mutable, hard to test.',
    keyTerms: ['ApplicationContext', 'bean', '@Component', '@Bean', 'constructor injection', '@Qualifier', '@Primary', 'circular dependency'],
    visualIds: ['sb-bean-lifecycle'],
    interviewAnswer: `Inversion of Control means the framework, not your code, controls object creation and wiring. Spring's ApplicationContext scans for @Component/@Service/@Repository classes and @Bean methods, builds a dependency graph and injects collaborators. I use constructor injection: dependencies are final, mandatory, visible in the signature and trivially mockable in unit tests without Spring. When multiple beans match a type I resolve it with @Qualifier or @Primary.`,
    detailedExplanation: `Injection styles: constructor (preferred; a single constructor needs no @Autowired since Spring 4.3), setter (optional dependencies), and field (discouraged — needs reflection, hides dependencies, cannot be final). Beans are singletons by default, created eagerly at startup so wiring errors fail fast. Spring Boot 2.6+ forbids circular references by default; a cycle is a design smell — extract a third component or use events rather than @Lazy workarounds.`,
    internalWorking: `Startup: read bean definitions → BeanFactoryPostProcessors modify definitions (e.g. property placeholders) → instantiate → populate dependencies → Aware callbacks → BeanPostProcessor.postProcessBeforeInitialization → @PostConstruct / afterPropertiesSet → postProcessAfterInitialization (where AOP proxies for @Transactional, @Async, @Cacheable are created) → ready. Because the bean you receive may be a proxy, annotations only apply when calls come through that proxy.`,
    codeExample: `public interface PaymentGateway { String pay(int amount); }

@Component @Primary
class StripeGateway implements PaymentGateway {
    public String pay(int amount) { return "stripe:" + amount; }
}

@Component("swift")
class SwiftGateway implements PaymentGateway {
    public String pay(int amount) { return "swift:" + amount; }
}

@Service
class CheckoutService {
    private final PaymentGateway defaultGateway;
    private final PaymentGateway wireGateway;

    // Single constructor: no @Autowired needed, fields can be final
    CheckoutService(PaymentGateway defaultGateway, @Qualifier("swift") PaymentGateway wireGateway) {
        this.defaultGateway = defaultGateway;
        this.wireGateway = wireGateway;
    }

    String checkout() { return defaultGateway.pay(10) + " | " + wireGateway.pay(500); }
}`,
    codeOutput: 'stripe:10 | swift:500',
    whyOutput: `Two beans implement PaymentGateway. The unqualified parameter gets the @Primary bean (StripeGateway); the @Qualifier("swift") parameter gets the bean named "swift". Without @Primary or @Qualifier, startup would fail with NoUniqueBeanDefinitionException.`,
    practicalExample: `In a payments service, constructor injection lets unit tests do new CheckoutService(mockGateway, mockGateway) in milliseconds with no Spring context — while integration tests use @SpringBootTest only where wiring itself needs verifying.`,
    commonMistakes: [
      'Using field injection with @Autowired everywhere.',
      'Calling new on a Spring-managed class and expecting dependencies to be injected.',
      'Fixing circular dependencies with @Lazy instead of redesigning.',
      'Storing per-request mutable state in a singleton bean (thread-safety bug).',
    ],
    seniorInsight: `Singleton beans are shared by all request threads, so they must be stateless or thread-safe. Most "random data from another user" bugs in Spring apps are a mutable field in a @Service. Code review rule of thumb: every field in a singleton should be final and point at another bean or immutable config.`,
    aiAwareness: {
      strongAnswerShouldMention: ['IoC', 'ApplicationContext', 'constructor injection', '@Qualifier/@Primary', 'singleton thread-safety'],
      weakAnswer: 'DI is when you use @Autowired.',
      redFlags: ['Prefers field injection', 'Thinks singleton beans are per request'],
      likelyFollowUp: ['Why constructor over field injection?', 'What happens with two beans of the same type?', 'How are circular dependencies handled?'],
    },
    prerequisites: [],
    relatedTopics: ['sb-bean-scopes-lifecycle', 'sb-auto-configuration'],
    nextTopics: ['sb-bean-scopes-lifecycle', 'sb-auto-configuration'],
    references: [
      {
        title: 'Spring Framework — The IoC Container',
        url: 'https://docs.spring.io/spring-framework/reference/core/beans.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-constructor-injection', 'q-sb-bean-scopes', 'q-sb-self-invocation'],
  },
  {
    id: 'sb-bean-scopes-lifecycle',
    technology: T,
    title: 'Bean Scopes & Lifecycle',
    category: 'Spring Core',
    slug: 'sb-bean-scopes-lifecycle',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'How many instances of a bean exist (singleton, prototype, request, session) and the callbacks run as each is created and destroyed.',
    mentalModel: 'Singleton = one shared office printer. Prototype = a new notepad every time you ask. Request = a visitor badge valid for one visit.',
    memoryTip: 'Prototype inside singleton = injected once. Use ObjectProvider to get a fresh one.',
    keyTerms: ['singleton', 'prototype', 'request scope', '@PostConstruct', '@PreDestroy', 'ObjectProvider', 'scoped proxy'],
    interviewAnswer: `Singleton (default): one instance per ApplicationContext. Prototype: a new instance every time the bean is requested from the container — Spring does not manage its destruction. Web scopes: request, session, application. Lifecycle callbacks: @PostConstruct after dependencies are injected, @PreDestroy before the context closes (singletons only). The classic trap: injecting a prototype into a singleton gives you exactly one prototype instance, because injection happens once; use ObjectProvider<T>.getObject() or a scoped proxy to get a new one per use.`,
    codeExample: `@Component @Scope("prototype")
class ReportBuilder {
    private static final AtomicInteger COUNT = new AtomicInteger();
    final int id = COUNT.incrementAndGet();
}

@Service
class ReportService {
    private final ReportBuilder injectedOnce;
    private final ObjectProvider<ReportBuilder> provider;

    ReportService(ReportBuilder injectedOnce, ObjectProvider<ReportBuilder> provider) {
        this.injectedOnce = injectedOnce;
        this.provider = provider;
    }

    String ids() {
        return injectedOnce.id + "," + injectedOnce.id + " vs "
             + provider.getObject().id + "," + provider.getObject().id;
    }
}`,
    codeOutput: '1,1 vs 2,3',
    whyOutput: `The prototype injected through the constructor is created once (id 1) when the singleton ReportService is built. Each ObjectProvider.getObject() call asks the container again, producing new instances 2 and 3.`,
    commonMistakes: [
      'Expecting a prototype bean injected into a singleton to be new on every method call.',
      'Expecting @PreDestroy to be called for prototype beans.',
      'Using request-scoped beans in async threads where no request is bound.',
    ],
    seniorInsight: `Most production code should only need singletons plus immutable value objects. If you reach for prototype or session scope, check whether the state should really be a method parameter or a plain object created with new.`,
    prerequisites: ['sb-ioc-di'],
    relatedTopics: ['sb-ioc-di'],
    nextTopics: ['sb-auto-configuration'],
    references: [
      {
        title: 'Spring Framework — Bean Scopes',
        url: 'https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-bean-scopes'],
  },
  {
    id: 'sb-auto-configuration',
    technology: T,
    title: 'Spring Boot Auto-Configuration & Starters',
    category: 'Spring Core',
    slug: 'sb-auto-configuration',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Boot inspects the classpath, existing beans and properties, and registers sensible default beans through conditional configuration classes.',
    mentalModel: 'Auto-configuration is a set of "if this, then that" rules: if HikariCP is on the classpath and you have no DataSource bean, create one from spring.datasource.* properties.',
    memoryTip: 'Starter = dependencies. Auto-config = conditional beans. Your own bean always wins (@ConditionalOnMissingBean).',
    keyTerms: ['@SpringBootApplication', '@EnableAutoConfiguration', '@ConditionalOnClass', '@ConditionalOnMissingBean', 'AutoConfiguration.imports', 'starter', '--debug'],
    interviewAnswer: `@SpringBootApplication = @Configuration + @ComponentScan + @EnableAutoConfiguration. Auto-configuration classes are listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (spring.factories before Boot 2.7). Each is guarded by conditions such as @ConditionalOnClass, @ConditionalOnProperty and @ConditionalOnMissingBean, so it only applies when relevant and backs off if you define your own bean. Starters are just curated dependency sets that bring the right libraries onto the classpath to trigger those conditions.`,
    detailedExplanation: `To see what applied and why, run with --debug or enable the conditions endpoint in Actuator; the Condition Evaluation Report lists positive and negative matches. To exclude one: @SpringBootApplication(exclude = DataSourceAutoConfiguration.class) or spring.autoconfigure.exclude. Externalised configuration precedence (highest first, simplified): command-line args, environment variables, profile-specific application-{profile}.yml, application.yml, defaults.`,
    codeExample: `// Your own starter's auto-configuration
@AutoConfiguration
@ConditionalOnClass(AuditClient.class)
@EnableConfigurationProperties(AuditProperties.class)
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean              // backs off if the app defines its own
    @ConditionalOnProperty(prefix = "audit", name = "enabled", havingValue = "true", matchIfMissing = true)
    AuditClient auditClient(AuditProperties props) {
        return new AuditClient(props.getEndpoint());
    }
}

// src/main/resources/META-INF/spring/
//   org.springframework.boot.autoconfigure.AutoConfiguration.imports
// com.bank.audit.AuditAutoConfiguration`,
    whyOutput: `This is exactly how Boot's own auto-configurations work: the bean is created only when AuditClient is on the classpath, audit.enabled is not false, and the application has not declared its own AuditClient.`,
    practicalExample: `Platform teams ship an internal "company-starter" that auto-configures logging format, tracing, security headers and an audit client, so every microservice gets the bank's standards by adding one dependency — and can still override any bean.`,
    commonMistakes: [
      'Thinking auto-configuration is "magic" that cannot be inspected.',
      'Putting auto-configuration classes under component scanning (they should be loaded only via the imports file).',
      'Not knowing how to exclude or override an auto-configured bean.',
    ],
    seniorInsight: `When startup is slow or a wrong bean appears, the Condition Evaluation Report answers it in minutes. For startup time, also look at lazy initialisation (spring.main.lazy-initialization) for dev, and Spring AOT/GraalVM native images or CDS/Project Leyden-style training runs for production cold starts.`,
    prerequisites: ['sb-ioc-di'],
    relatedTopics: ['sb-ioc-di', 'sb-maven-dependency-management'],
    nextTopics: ['sb-rest-exception-handling'],
    references: [
      {
        title: 'Spring Boot — Creating Your Own Auto-configuration',
        url: 'https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-auto-configuration'],
  },

  /* ------------------------------------------------------------ Web & REST */
  {
    id: 'sb-rest-exception-handling',
    technology: T,
    title: 'REST Controllers, Validation & Global Exception Handling',
    category: 'Web & REST',
    slug: 'sb-rest-exception-handling',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Building REST endpoints with @RestController, validating input with Bean Validation, and mapping exceptions to consistent HTTP error responses in one place.',
    mentalModel: 'Controllers are thin receptionists: validate, delegate to a service, translate the result. A @RestControllerAdvice is the complaints desk that formats every error the same way.',
    memoryTip: '@Valid on the body, constraints on the DTO, @RestControllerAdvice + ProblemDetail for errors.',
    keyTerms: ['@RestController', '@Valid', 'MethodArgumentNotValidException', '@RestControllerAdvice', 'ProblemDetail', 'ResponseEntity', 'RFC 9457'],
    interviewAnswer: `I keep controllers thin: map HTTP to a service call and back. Request DTOs carry Jakarta Bean Validation annotations (@NotBlank, @Positive, @Size) and the controller parameter is marked @Valid, so invalid input fails before business code with MethodArgumentNotValidException. A single @RestControllerAdvice maps exceptions to HTTP statuses and a consistent body — Spring 6 supports RFC 9457 ProblemDetail natively. That gives clients one error format and stops stack traces leaking.`,
    codeExample: `record CreatePaymentRequest(
        @NotBlank String fromAccount,
        @NotBlank String toAccount,
        @Positive BigDecimal amount) { }

@RestController
@RequestMapping("/api/v1/payments")
class PaymentController {
    private final PaymentService service;
    PaymentController(PaymentService service) { this.service = service; }

    @PostMapping
    ResponseEntity<PaymentResponse> create(@Valid @RequestBody CreatePaymentRequest req) {
        PaymentResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/api/v1/payments/" + created.id())).body(created);
    }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Validation failed");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage()).toList());
        return pd;
    }

    @ExceptionHandler(InsufficientFundsException.class)
    ProblemDetail funds(InsufficientFundsException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }
}`,
    codeOutput: `POST /api/v1/payments  {"fromAccount":"","toAccount":"B","amount":-5}

HTTP/1.1 400 Bad Request
Content-Type: application/problem+json
{"type":"about:blank","title":"Validation failed","status":400,
 "instance":"/api/v1/payments",
 "errors":["amount: must be greater than 0","fromAccount: must not be blank"]}`,
    whyOutput: `@Valid triggers validation before the method body runs; the two constraint violations raise MethodArgumentNotValidException, which the advice converts into a 400 ProblemDetail (field order in the list may vary). A successful create returns 201 with a Location header.`,
    commonMistakes: [
      'Putting business logic and repository calls directly in controllers.',
      'Returning 200 with {"error": ...} bodies instead of proper status codes.',
      'Exposing JPA entities directly as request/response bodies.',
      'Forgetting @Valid, so annotations on the DTO are silently ignored.',
    ],
    seniorInsight: `Treat the error contract as part of the public API: stable error codes, correlation/trace id in every error body, and no internal exception messages for 5xx. It makes client integration and production support dramatically easier.`,
    prerequisites: ['sb-ioc-di'],
    relatedTopics: ['sb-filter-vs-interceptor', 'sd-rest-api-design'],
    nextTopics: ['sb-filter-vs-interceptor', 'sb-transactional'],
    references: [
      {
        title: 'Spring Framework — Error Responses (ProblemDetail)',
        url: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-global-exception-handling'],
  },
  {
    id: 'sb-filter-vs-interceptor',
    technology: T,
    title: 'Filters vs Interceptors vs AOP',
    category: 'Web & REST',
    slug: 'sb-filter-vs-interceptor',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Three layers for cross-cutting logic: Servlet filters wrap the whole request, HandlerInterceptors wrap controller handling, and AOP wraps Spring bean method calls.',
    mentalModel: 'Filter = building security gate. Interceptor = department reception. AOP = a guard standing next to a specific desk.',
    memoryTip: 'Filter → DispatcherServlet → Interceptor.preHandle → Controller → (AOP around services) → postHandle → afterCompletion.',
    keyTerms: ['OncePerRequestFilter', 'HandlerInterceptor', '@Aspect', '@Around', 'DispatcherServlet', 'MDC'],
    interviewAnswer: `A Servlet Filter runs before the DispatcherServlet, sees every request (including static resources and errors) and can wrap or replace the request/response — ideal for security (Spring Security is a filter chain), CORS, correlation IDs, request logging. A HandlerInterceptor runs inside Spring MVC around controller execution and knows which handler was chosen — good for per-endpoint checks or timing. Spring AOP (@Aspect) intercepts calls to Spring beans at the method level, independent of HTTP — used for transactions, caching, auditing, metrics.`,
    codeExample: `@Component
class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader("X-Correlation-Id"))
                .orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", id);
        res.setHeader("X-Correlation-Id", id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove("correlationId");   // pooled threads: always clean up
        }
    }
}`,
    whyOutput: `Every log line during the request carries the correlation id via MDC, the client gets it back for support tickets, and the finally block prevents the id leaking into the next request served by the same Tomcat thread.`,
    commonMistakes: [
      'Doing authentication in an interceptor instead of the security filter chain.',
      'Not clearing MDC/ThreadLocal state in finally.',
      'Expecting AOP to intercept private methods or self-invocation.',
    ],
    prerequisites: ['sb-rest-exception-handling'],
    relatedTopics: ['sb-security-jwt', 'sb-transactional'],
    references: [
      {
        title: 'Spring MVC — Interception',
        url: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-config/interceptors.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-filter-vs-interceptor'],
  },

  /* ---------------------------------------------------- Data & Transactions */
  {
    id: 'sb-transactional',
    technology: T,
    title: '@Transactional — Proxies, Propagation & Rollback',
    category: 'Data & Transactions',
    slug: 'sb-transactional',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Declarative transactions implemented by an AOP proxy that begins, commits or rolls back a transaction around public method calls.',
    mentalModel: 'The proxy is a doorman: only visitors who enter through the front door (external calls on the proxy) get the transaction wristband. Calls from inside the room (this.method()) skip the doorman.',
    memoryTip: 'Proxy-based → no self-invocation. Rolls back on unchecked by default → add rollbackFor for checked. REQUIRES_NEW = separate commit.',
    keyTerms: ['AOP proxy', 'propagation', 'REQUIRED', 'REQUIRES_NEW', 'isolation', 'rollbackFor', 'self-invocation', 'readOnly'],
    visualIds: ['sb-transaction-proxy'],
    interviewAnswer: `@Transactional works through a Spring AOP proxy: the caller invokes the proxy, which opens a transaction (or joins an existing one according to propagation), calls the real method, and commits — or rolls back if a RuntimeException or Error escapes. Key gotchas: (1) self-invocation — calling another @Transactional method via this bypasses the proxy, so its settings are ignored; (2) by default checked exceptions do NOT roll back — use rollbackFor; (3) catching the exception inside the method means the proxy never sees it, so it commits. Propagation REQUIRED (default) joins the current transaction; REQUIRES_NEW suspends it and runs an independent one, e.g. for audit logs that must persist even if the main work rolls back.`,
    detailedExplanation: `Isolation levels (READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE) map to the database and trade anomalies (dirty, non-repeatable, phantom reads) against concurrency. readOnly = true lets Hibernate skip dirty checking and lets drivers route to replicas. If an inner REQUIRED method throws and you catch it in the outer method, the shared transaction is already marked rollback-only, and the outer commit throws UnexpectedRollbackException.`,
    internalWorking: `TransactionInterceptor asks the PlatformTransactionManager (JpaTransactionManager, DataSourceTransactionManager) for a transaction, binds the connection/EntityManager to the current thread via TransactionSynchronizationManager, and unbinds it at the end. Thread binding is why transactions do not propagate into @Async methods or other threads.`,
    codeExample: `@Service
class TransferService {
    private final AccountRepository accounts;
    private final AuditService audit;
    TransferService(AccountRepository accounts, AuditService audit) { this.accounts = accounts; this.audit = audit; }

    @Transactional(rollbackFor = InsufficientFundsException.class)
    public void transfer(long from, long to, BigDecimal amt) throws InsufficientFundsException {
        audit.record("transfer requested " + from + "->" + to);   // REQUIRES_NEW: commits independently
        Account a = accounts.findById(from).orElseThrow();
        Account b = accounts.findById(to).orElseThrow();
        if (a.getBalance().compareTo(amt) < 0) throw new InsufficientFundsException();
        a.debit(amt);
        b.credit(amt);                                             // dirty checking flushes on commit
    }
}

@Service
class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String msg) { /* insert audit row */ }
}`,
    codeOutput: `transfer(1, 2, 1000) with balance 100:
  audit row      -> COMMITTED (own transaction)
  balance change -> ROLLED BACK (InsufficientFundsException, rollbackFor)`,
    whyOutput: `AuditService is a separate bean, so the call goes through its proxy and REQUIRES_NEW opens an independent transaction that commits immediately. InsufficientFundsException is checked, so without rollbackFor the transfer transaction would actually commit; with it, the debit/credit are rolled back.`,
    practicalExample: `In payments, audit/compliance records often must survive a failed business transaction — REQUIRES_NEW (or, better, an outbox event) achieves that. Conversely, never call a remote HTTP service inside a long DB transaction: it holds locks and connections while waiting on the network.`,
    commonMistakes: [
      'Self-invocation: this.innerTransactionalMethod() — annotation ignored.',
      '@Transactional on private methods (not proxied).',
      'Assuming checked exceptions roll back by default.',
      'Swallowing exceptions inside the transactional method.',
      'Long transactions that include remote calls or user think-time.',
    ],
    seniorInsight: `Keep transaction boundaries at the service layer and short. For cross-service consistency, do not stretch a DB transaction across HTTP calls or 2PC — commit locally and publish via the Transactional Outbox, then use a Saga for multi-step workflows.`,
    aiAwareness: {
      strongAnswerShouldMention: ['AOP proxy', 'self-invocation', 'unchecked rollback default', 'propagation REQUIRED vs REQUIRES_NEW', 'thread-bound'],
      weakAnswer: '@Transactional makes the method run in a transaction and rolls back on errors.',
      redFlags: ['Unaware of self-invocation', 'Thinks all exceptions roll back'],
      likelyFollowUp: ['Why does calling a @Transactional method from the same class not work?', 'What is UnexpectedRollbackException?', 'Does @Transactional work with @Async?'],
    },
    prerequisites: ['sb-ioc-di'],
    relatedTopics: ['sb-jpa-n-plus-one', 'sb-saga-outbox', 'sb-filter-vs-interceptor'],
    nextTopics: ['sb-jpa-n-plus-one', 'sb-saga-outbox'],
    references: [
      {
        title: 'Spring Framework — Declarative Transaction Management',
        url: 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-self-invocation', 'q-sb-transaction-propagation', 'q-sb-checked-rollback'],
  },
  {
    id: 'sb-jpa-n-plus-one',
    technology: T,
    title: 'JPA/Hibernate N+1 Problem & Fetching',
    category: 'Data & Transactions',
    slug: 'sb-jpa-n-plus-one',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Loading N parent rows and then lazily triggering one extra query per parent for its children — 1 + N queries instead of 1 or 2.',
    mentalModel: 'Asking a librarian for 100 books, then walking back 100 separate times to ask for each book\u2019s author.',
    memoryTip: 'Spot it with SQL logs / query counts. Fix with JOIN FETCH, @EntityGraph, or batch fetching. Default every association to LAZY.',
    keyTerms: ['lazy loading', 'eager loading', 'JOIN FETCH', '@EntityGraph', '@BatchSize', 'LazyInitializationException', 'open-in-view', 'DTO projection'],
    interviewAnswer: `When you load a list of entities and then access a lazy association on each one, Hibernate issues one query for the list plus one per entity — the N+1 problem. It is invisible in code and catastrophic at scale. Fixes: fetch what the use case needs in one query (JPQL JOIN FETCH or @EntityGraph), enable batch fetching (@BatchSize or hibernate.default_batch_fetch_size) to load children with IN clauses, or use DTO projections for read-only views. Making everything EAGER is not a fix — it causes over-fetching and its own N+1 on other paths.`,
    detailedExplanation: `JOIN FETCH on a collection with pagination makes Hibernate paginate in memory (warning HHH90003004) — fetch IDs with pagination first, then fetch associations for those IDs. Disable spring.jpa.open-in-view in APIs so lazy loading cannot silently happen during JSON serialisation outside the service layer. Measure with Hibernate statistics or a datasource-proxy query counter in tests.`,
    codeExample: `@Entity class Customer {
    @Id Long id;
    String name;
    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    List<Order> orders;
}

interface CustomerRepository extends JpaRepository<Customer, Long> {
    // N+1 when the caller touches c.getOrders() for each customer
    List<Customer> findAll();

    // Fix 1: one query with a join
    @Query("select distinct c from Customer c left join fetch c.orders")
    List<Customer> findAllWithOrders();

    // Fix 2: entity graph on a derived query
    @EntityGraph(attributePaths = "orders")
    List<Customer> findByNameStartingWith(String prefix);
}

// for (Customer c : repo.findAll()) total += c.getOrders().size();
//   100 customers -> 101 SQL statements
// for (Customer c : repo.findAllWithOrders()) ...
//   100 customers -> 1 SQL statement`,
    codeOutput: 'findAll + lazy access: 101 queries\nfindAllWithOrders: 1 query',
    whyOutput: `findAll selects customers only; each getOrders() on an uninitialised lazy collection triggers a SELECT ... WHERE customer_id = ?. The JOIN FETCH variant loads customers and orders in one statement.`,
    commonMistakes: [
      'Switching associations to EAGER to "fix" LazyInitializationException.',
      'Leaving open-in-view enabled in REST APIs.',
      'Using JOIN FETCH on collections together with pagination.',
      'Never looking at the generated SQL.',
    ],
    seniorInsight: `Add an automated guard: a test that asserts the number of SQL statements for key endpoints (e.g. with datasource-proxy or Hibernate statistics). N+1 regressions then fail CI instead of appearing as a slow endpoint in production.`,
    prerequisites: ['sb-transactional'],
    relatedTopics: ['sb-transactional', 'sd-caching-strategies'],
    references: [
      {
        title: 'Hibernate ORM User Guide — Fetching',
        url: 'https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html#fetching',
        source: 'Hibernate',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-sb-n-plus-one'],
  },

  /* --------------------------------------------------------- Microservices */
  {
    id: 'sb-microservices-patterns',
    technology: T,
    title: 'Microservices Architecture & Decomposition',
    category: 'Microservices',
    slug: 'sb-microservices-patterns',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning: 'Structuring a system as independently deployable services, each owning one business capability and its own data.',
    mentalModel: 'Teams own shops in a mall, each with its own stockroom. They talk through counters (APIs/events), never by walking into each other\u2019s stockroom (shared DB).',
    memoryTip: 'Decompose by business capability / bounded context. Database per service. Prefer async events between services. Start with a modular monolith if unsure.',
    keyTerms: ['bounded context', 'database per service', 'API gateway', 'service discovery', 'Saga', 'CQRS', 'strangler fig', 'distributed tracing'],
    visualIds: ['sb-microservices-architecture'],
    interviewAnswer: `I decompose along business capabilities / DDD bounded contexts (Payments, Accounts, Notifications), each service owning its own database so it can deploy and scale independently. Communication is synchronous (REST/gRPC) where the caller needs an immediate answer, and asynchronous (Kafka events) for everything else to reduce temporal coupling. Supporting patterns: API Gateway for the edge, service discovery/config, circuit breakers, Saga + Outbox for cross-service consistency, centralised logging and distributed tracing. The costs are real — network failures, eventual consistency, operational overhead — so for a small team or unclear domain I start with a modular monolith and extract services later via the Strangler Fig pattern.`,
    detailedExplanation: `Anti-patterns: a shared database (hidden coupling), the distributed monolith (services that must deploy together), chatty synchronous chains (latency and availability multiply: five services at 99.9% each give ~99.5% overall), and entity services (CustomerService, OrderService as CRUD wrappers) instead of capability services.`,
    codeExample: `# Availability of a synchronous call chain = product of availabilities
services_in_chain = 5
each = 0.999
overall = each ** services_in_chain      # 0.995 -> ~43.8 hours downtime/year vs ~8.8

# Latency: p99 of a fan-out is dominated by the slowest dependency.
# Mitigations: async events, timeouts + circuit breakers, caching, fewer hops.`,
    codeLanguage: 'Python',
    codeOutput: 'overall = 0.995  (~43.8 h/year downtime vs ~8.8 h for a single 99.9% service)',
    whyOutput: `Every synchronous dependency is a multiplier on failure probability. This arithmetic is the strongest argument for async communication, bulkheads and graceful degradation.`,
    commonMistakes: [
      'Starting with microservices for a new product with a tiny team.',
      'Sharing one database between services.',
      'Long synchronous call chains without timeouts.',
      'No distributed tracing or correlation ids.',
    ],
    seniorInsight: `The organisational boundary matters as much as the technical one (Conway's Law). A service should be owned end-to-end by one team, with its own pipeline and on-call. If two services always change together, merge them.`,
    aiAwareness: {
      strongAnswerShouldMention: ['bounded context', 'database per service', 'sync vs async', 'Saga/Outbox', 'observability', 'trade-offs/modular monolith'],
      weakAnswer: 'Microservices are small services that use REST.',
      redFlags: ['Shared database', 'No mention of failure handling'],
      likelyFollowUp: ['How do you keep data consistent across services?', 'When would you NOT use microservices?', 'How do services find each other?'],
    },
    prerequisites: ['sb-rest-exception-handling'],
    relatedTopics: ['sb-saga-outbox', 'sb-spring-cloud-gateway', 'sb-resilience4j', 'sb-service-discovery-config'],
    nextTopics: ['sb-service-discovery-config', 'sb-saga-outbox'],
    references: [
      {
        title: 'Microservices patterns (microservices.io)',
        url: 'https://microservices.io/patterns/',
        source: 'Chris Richardson',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sb-monolith-vs-microservices', 'q-sb-sync-vs-async'],
  },
  {
    id: 'sb-service-discovery-config',
    technology: T,
    title: 'Service Discovery & Centralised Configuration',
    category: 'Microservices',
    slug: 'sb-service-discovery-config',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'How services find each other\u2019s current network locations (Eureka, Consul, Kubernetes DNS) and load configuration from a central, versioned source.',
    mentalModel: 'Discovery is a live phone directory that updates as instances come and go. Config server is the single policy binder every service reads at startup.',
    memoryTip: 'On Kubernetes: Service DNS + ConfigMaps/Secrets usually replace Eureka + Config Server.',
    keyTerms: ['Eureka', 'Consul', 'client-side load balancing', 'Spring Cloud LoadBalancer', 'Kubernetes Service', 'Spring Cloud Config', 'ConfigMap', '@RefreshScope'],
    interviewAnswer: `Instances are ephemeral, so callers cannot hard-code hosts. With client-side discovery (Eureka/Consul + Spring Cloud LoadBalancer) services register themselves and callers resolve a logical name like lb://payment-service to a healthy instance. With server-side discovery — the Kubernetes norm — a Service gives a stable DNS name and kube-proxy balances across ready pods, so no discovery library is needed. Centralised configuration (Spring Cloud Config backed by Git, or ConfigMaps/Secrets, Vault for secrets) keeps environment-specific settings out of the artifact; @RefreshScope or rolling restarts apply changes.`,
    codeExample: `# application.yml for a service on Kubernetes
spring:
  application:
    name: payment-service
  config:
    import: "optional:configtree:/etc/config/"   # files mounted from a ConfigMap/Secret
management:
  endpoint:
    health:
      probes:
        enabled: true          # /actuator/health/liveness and /readiness for k8s probes

# Calling another service: plain Kubernetes DNS name, no Eureka needed
accounts:
  base-url: http://account-service.payments.svc.cluster.local:8080`,
    codeLanguage: 'YAML',
    commonMistakes: [
      'Running Eureka on Kubernetes without a reason, duplicating platform discovery.',
      'Baking environment URLs and secrets into the jar.',
      'Readiness probe that does not reflect dependencies, sending traffic to pods that cannot serve.',
    ],
    prerequisites: ['sb-microservices-patterns'],
    relatedTopics: ['sb-spring-cloud-gateway', 'sb-actuator-observability'],
    references: [
      {
        title: 'Spring Cloud Config',
        url: 'https://docs.spring.io/spring-cloud-config/reference/',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-service-discovery'],
  },
  {
    id: 'sb-spring-cloud-gateway',
    technology: T,
    title: 'Spring Cloud Gateway (API Gateway in Spring)',
    category: 'Microservices',
    slug: 'sb-spring-cloud-gateway',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'A reactive API gateway built on Spring WebFlux that routes requests to services and applies cross-cutting filters — auth, rate limiting, retries, header rewriting.',
    mentalModel: 'Route = predicate (which requests) + filters (what to do) + URI (where to send).',
    memoryTip: 'Predicates match. Filters transform. Keep business logic out of the gateway.',
    keyTerms: ['route', 'predicate', 'GatewayFilter', 'GlobalFilter', 'RequestRateLimiter', 'TokenRelay', 'WebFlux', 'Netty'],
    interviewAnswer: `Spring Cloud Gateway sits at the edge, matching requests with predicates (Path, Method, Header, Host) and forwarding them to a URI — lb://service for discovery-based balancing — after running filters: StripPrefix, AddRequestHeader, RequestRateLimiter (Redis token bucket), CircuitBreaker with fallback, Retry, and TokenRelay for OAuth2. It runs on WebFlux/Netty, so it is non-blocking; a blocking call inside a filter would stall the event loop. I keep it to cross-cutting concerns — authentication, rate limiting, routing, observability — never business logic.`,
    codeExample: `spring:
  cloud:
    gateway:
      routes:
        - id: payments
          uri: lb://payment-service
          predicates:
            - Path=/api/payments/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 50     # tokens per second
                redis-rate-limiter.burstCapacity: 100
                key-resolver: "#{@userKeyResolver}"
            - name: CircuitBreaker
              args:
                name: paymentsCB
                fallbackUri: forward:/fallback/payments`,
    codeLanguage: 'YAML',
    whyOutput: `GET /api/payments/123 matches the Path predicate, StripPrefix=1 removes "/api", the rate limiter allows 50 req/s per user with bursts up to 100 (excess gets 429), and if payment-service is failing the circuit breaker forwards to a local fallback instead of timing out.`,
    commonMistakes: [
      'Blocking JDBC/HTTP calls inside gateway filters.',
      'Putting business rules or aggregation logic in the gateway.',
      'Single gateway instance (SPOF) with no horizontal scaling.',
    ],
    seniorInsight: `Decide gateway responsibilities explicitly: edge authentication and token validation, coarse rate limiting, routing, TLS, request size limits and correlation ids. Fine-grained authorisation still belongs in each service (zero trust) because internal traffic can bypass the gateway.`,
    prerequisites: ['sb-microservices-patterns'],
    relatedTopics: ['sd-api-gateway', 'sb-resilience4j', 'sb-security-jwt'],
    references: [
      {
        title: 'Spring Cloud Gateway Reference',
        url: 'https://docs.spring.io/spring-cloud-gateway/reference/',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-gateway-responsibilities'],
  },
  {
    id: 'sb-saga-outbox',
    technology: T,
    title: 'Saga & Transactional Outbox',
    category: 'Microservices',
    slug: 'sb-saga-outbox',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning: 'Keeping data consistent across services without distributed transactions: local transactions plus reliably published events, with compensating actions on failure.',
    mentalModel: 'A travel booking: flight, hotel, car are separate local bookings. If the car fails, you cancel the hotel and flight (compensations) — you never lock all three companies at once.',
    memoryTip: 'Outbox solves "save + publish atomically". Saga solves "multi-step business transaction with undo".',
    keyTerms: ['dual-write problem', 'transactional outbox', 'CDC', 'Debezium', 'choreography', 'orchestration', 'compensating transaction', 'idempotent consumer'],
    visualIds: ['sb-outbox-flow'],
    interviewAnswer: `The dual-write problem: saving to the DB and publishing to Kafka are two systems — if the app crashes between them, they diverge. The Transactional Outbox fixes it by inserting the event into an outbox table in the SAME local transaction as the business change; a relay (polling publisher or CDC with Debezium) then publishes it to Kafka at least once. Consumers must be idempotent (dedupe by event id). A Saga coordinates a multi-service business transaction as a sequence of local transactions, each publishing an event; if a step fails, compensating transactions undo earlier steps. Choreography = services react to each other's events (simple, but flow is implicit); orchestration = a central orchestrator (or Temporal/Camunda) tells each service what to do (explicit, easier to monitor).`,
    codeExample: `@Service
class OrderService {
    private final OrderRepository orders;
    private final OutboxRepository outbox;
    private final ObjectMapper json;
    OrderService(OrderRepository o, OutboxRepository ob, ObjectMapper j) { orders = o; outbox = ob; json = j; }

    @Transactional                          // ONE local transaction for both writes
    public Order placeOrder(PlaceOrder cmd) throws JsonProcessingException {
        Order order = orders.save(Order.pending(cmd));
        outbox.save(new OutboxEvent(
                UUID.randomUUID(),           // event id -> consumers dedupe on this
                "Order", order.getId().toString(),
                "OrderPlaced", json.writeValueAsString(order)));
        return order;                        // no kafkaTemplate.send() here
    }
}

// Relay (or Debezium CDC) reads unpublished outbox rows -> Kafka -> marks published.
// Payment service consumes OrderPlaced; on failure publishes PaymentFailed,
// and OrderService compensates by setting the order to CANCELLED.`,
    whyOutput: `Either both the order row and the outbox row commit, or neither does — no lost or phantom events. Publishing happens asynchronously and may repeat, which is why consumers record processed event ids.`,
    commonMistakes: [
      'Calling kafkaTemplate.send() inside the @Transactional method and assuming atomicity.',
      'Non-idempotent consumers with at-least-once delivery.',
      'Using 2PC/XA across services.',
      'Compensations that are not themselves idempotent and retryable.',
    ],
    seniorInsight: `For banking flows I prefer orchestration for anything with more than three steps or regulatory visibility needs: the saga state is queryable ("where is payment X?"), timeouts are explicit, and compensations are auditable. Choreography works well for simple fan-out notifications.`,
    aiAwareness: {
      strongAnswerShouldMention: ['dual-write problem', 'outbox in same local transaction', 'CDC/relay', 'idempotent consumers', 'compensating transactions', 'choreography vs orchestration'],
      weakAnswer: 'Use a distributed transaction across the services.',
      redFlags: ['Suggests 2PC by default', 'Ignores duplicates'],
      likelyFollowUp: ['How do you make a consumer idempotent?', 'Choreography or orchestration — when?', 'What if a compensation fails?'],
    },
    prerequisites: ['sb-transactional', 'sb-microservices-patterns'],
    relatedTopics: ['kafka-exactly-once', 'sb-microservices-patterns'],
    references: [
      {
        title: 'Pattern: Transactional outbox',
        url: 'https://microservices.io/patterns/data/transactional-outbox.html',
        source: 'microservices.io',
        type: 'article',
      },
      {
        title: 'Pattern: Saga',
        url: 'https://microservices.io/patterns/data/saga.html',
        source: 'microservices.io',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sb-outbox', 'q-sb-saga', 'q-sb-idempotent-consumer'],
  },

  /* ------------------------------------------------- Resilience & Security */
  {
    id: 'sb-resilience4j',
    technology: T,
    title: 'Resilience: Circuit Breaker, Retry, Timeout, Bulkhead',
    category: 'Resilience & Security',
    slug: 'sb-resilience4j',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Patterns (via Resilience4j) that stop one slow or failing dependency from cascading into a full outage.',
    mentalModel: 'Timeout = stop waiting. Retry = try again (carefully). Circuit breaker = stop calling a known-broken service for a while. Bulkhead = separate compartments so one leak does not sink the ship.',
    memoryTip: 'Order: Timeout inside Retry inside CircuitBreaker. Retry only idempotent operations, with exponential backoff + jitter.',
    keyTerms: ['circuit breaker', 'CLOSED/OPEN/HALF_OPEN', 'failure rate threshold', 'retry with backoff', 'jitter', 'TimeLimiter', 'bulkhead', 'fallback'],
    visualIds: ['sb-circuit-breaker-states'],
    interviewAnswer: `Every remote call needs a timeout — without one, a slow dependency exhausts your threads. Retries handle transient faults but only for idempotent operations, with exponential backoff and jitter so you do not create a retry storm. A circuit breaker tracks the failure rate (and slow-call rate) over a sliding window; above the threshold it OPENs and fails fast for a wait period, then goes HALF_OPEN to let a few trial calls through and closes if they succeed. Bulkheads cap concurrent calls per dependency. Fallbacks return a degraded response — cached data, a default, or a clear 503 — rather than hanging.`,
    codeExample: `resilience4j:
  circuitbreaker:
    instances:
      accounts:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 20
        failure-rate-threshold: 50          # % of failed calls to open
        slow-call-duration-threshold: 2s
        slow-call-rate-threshold: 50
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 3
  retry:
    instances:
      accounts:
        max-attempts: 3
        wait-duration: 200ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions: [java.io.IOException, java.util.concurrent.TimeoutException]

---
@Service
class BalanceClient {
    private final RestClient rest;
    BalanceClient(RestClient.Builder b) { this.rest = b.baseUrl("http://account-service").build(); }

    @CircuitBreaker(name = "accounts", fallbackMethod = "cachedBalance")
    @Retry(name = "accounts")
    public Balance balance(String accountId) {
        return rest.get().uri("/accounts/{id}/balance", accountId).retrieve().body(Balance.class);
    }

    private Balance cachedBalance(String accountId, Throwable ex) {
        return Balance.stale(accountId);    // degraded but fast
    }
}`,
    codeLanguage: 'YAML + Java',
    whyOutput: `If 10 of the last 20 calls fail or take over 2s, the breaker opens for 30s and every call goes straight to cachedBalance without touching the network, protecting both services. Transient IOExceptions are retried up to 3 times (200ms, 400ms). Configure the RestClient's connect/read timeouts as well — Resilience4j annotations do not add an HTTP timeout to a blocking call by themselves.`,
    commonMistakes: [
      'No timeouts on HTTP clients.',
      'Retrying non-idempotent POSTs (double payments).',
      'Retries at every layer (gateway + service + client) multiplying load.',
      'Fallbacks that hide outages without metrics/alerts.',
    ],
    seniorInsight: `Budget retries end to end: one retry layer, close to the failure, with a total deadline propagated downstream. Expose breaker state as metrics (resilience4j_circuitbreaker_state) and alert on OPEN — a silent fallback is an outage your users notice before you do.`,
    prerequisites: ['sb-microservices-patterns'],
    relatedTopics: ['sb-spring-cloud-gateway', 'sd-rate-limiting'],
    references: [
      {
        title: 'Resilience4j Documentation',
        url: 'https://resilience4j.readme.io/docs',
        source: 'Resilience4j',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-sb-circuit-breaker', 'q-sb-retry-idempotency'],
  },
  {
    id: 'sb-security-jwt',
    technology: T,
    title: 'Spring Security, JWT & OAuth2 Resource Server',
    category: 'Resilience & Security',
    slug: 'sb-security-jwt',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Securing APIs with a filter chain that authenticates bearer tokens (JWT) issued by an OAuth2/OIDC provider and authorises by roles/scopes.',
    mentalModel: 'The JWT is a signed visitor badge: anyone can read it, nobody can forge it without the issuer\u2019s key, and it expires.',
    memoryTip: 'Authentication = who you are (401). Authorisation = what you may do (403). JWT is signed, not encrypted.',
    keyTerms: ['SecurityFilterChain', 'JWT', 'OAuth2 resource server', 'JWKS', 'scope', '@PreAuthorize', '401 vs 403', 'stateless'],
    interviewAnswer: `I configure services as OAuth2 resource servers: Spring Security's BearerTokenAuthenticationFilter extracts the JWT, verifies its signature against the identity provider's JWKS, validates issuer, audience and expiry, and maps claims (scopes/roles) to authorities. Sessions are stateless and CSRF is disabled for pure token APIs. Authorisation is declared with requestMatchers rules and method-level @PreAuthorize. A JWT is base64-encoded and signed, not encrypted — never put secrets or PII in it — and since JWTs cannot easily be revoked, keep access tokens short-lived and use refresh tokens.`,
    codeExample: `@Configuration
@EnableMethodSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())                         // stateless token API
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/payments/**").hasAuthority("SCOPE_payments:write")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .build();
    }
}

@RestController
class AccountController {
    @GetMapping("/api/accounts/{id}")
    @PreAuthorize("hasAuthority('SCOPE_accounts:read') and @ownership.owns(authentication, #id)")
    Account get(@PathVariable String id) { /* ... */ return null; }
}

// application.yml
// spring.security.oauth2.resourceserver.jwt.issuer-uri: https://idp.bank.example/realms/retail`,
    whyOutput: `No token → 401 Unauthorized. Valid token without SCOPE_payments:write on POST → 403 Forbidden. The @PreAuthorize expression also enforces object-level ownership, preventing IDOR (accessing another customer's account by changing the id).`,
    commonMistakes: [
      'Confusing 401 and 403.',
      'Storing sensitive data in JWT claims.',
      'Long-lived access tokens with no revocation strategy.',
      'Checking roles but not resource ownership (IDOR / BOLA — OWASP API #1).',
    ],
    seniorInsight: `Defence in depth: validate tokens at the gateway AND in each service, use mTLS or service identity for east-west traffic, and enforce object-level authorisation in the domain layer. Broken object level authorisation is the most common real API vulnerability, and gateways cannot detect it.`,
    prerequisites: ['sb-filter-vs-interceptor'],
    relatedTopics: ['sb-spring-cloud-gateway', 'sd-api-gateway'],
    references: [
      {
        title: 'Spring Security — OAuth 2.0 Resource Server JWT',
        url: 'https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html',
        source: 'Spring',
        type: 'official',
      },
      {
        title: 'OWASP API Security Top 10',
        url: 'https://owasp.org/API-Security/',
        source: 'OWASP',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sb-jwt-security'],
  },
  {
    id: 'sb-actuator-observability',
    technology: T,
    title: 'Actuator, Metrics & Distributed Tracing',
    category: 'Resilience & Security',
    slug: 'sb-actuator-observability',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Making services operable: health probes, Micrometer metrics, structured logs and traces correlated across service hops.',
    mentalModel: 'Logs tell you what happened, metrics tell you how much and how often, traces tell you where the time went across services.',
    memoryTip: 'Actuator health → k8s probes. Micrometer → Prometheus. Micrometer Tracing / OpenTelemetry → trace id in every log line.',
    keyTerms: ['Actuator', 'liveness', 'readiness', 'Micrometer', 'Prometheus', 'OpenTelemetry', 'trace id', 'RED metrics'],
    interviewAnswer: `Spring Boot Actuator exposes health (with liveness and readiness groups for Kubernetes probes), metrics, info and more. Micrometer is a metrics facade publishing JVM, HTTP, datasource and custom metrics to Prometheus/Datadog. Micrometer Tracing with an OpenTelemetry bridge propagates W3C traceparent headers across HTTP and Kafka, and puts traceId/spanId into the MDC so logs from every service can be joined. I expose only health and prometheus publicly, secure the rest, and track RED metrics (rate, errors, duration) per endpoint with SLO-based alerts.`,
    codeExample: `@Service
class PaymentMetrics {
    private final Counter failed;
    private final Timer latency;

    PaymentMetrics(MeterRegistry registry) {
        this.failed = Counter.builder("payments.failed")
                .tag("reason", "insufficient_funds").register(registry);
        this.latency = Timer.builder("payments.process")
                .publishPercentiles(0.5, 0.95, 0.99).register(registry);
    }

    Payment process(Payment p) {
        return latency.record(() -> doProcess(p));
    }
    private Payment doProcess(Payment p) { return p; }
}

// management.endpoints.web.exposure.include=health,prometheus
// management.endpoint.health.probes.enabled=true
// logging.pattern.level=%5p [\${spring.application.name},%X{traceId},%X{spanId}]`,
    commonMistakes: [
      'Exposing all actuator endpoints publicly (env, heapdump leak secrets).',
      'High-cardinality tags (user id, request id) in metrics.',
      'Liveness probe that checks the database — a DB outage then restarts every pod.',
    ],
    seniorInsight: `Liveness should answer "is this process stuck?" only; readiness answers "can I take traffic right now?" (dependencies, warm-up). Mixing them is a classic cause of cascading restarts during a downstream outage.`,
    prerequisites: ['sb-auto-configuration'],
    relatedTopics: ['sb-service-discovery-config', 'sb-resilience4j'],
    references: [
      {
        title: 'Spring Boot — Production-ready Features',
        url: 'https://docs.spring.io/spring-boot/reference/actuator/index.html',
        source: 'Spring',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-liveness-readiness'],
  },

  /* ---------------------------------------------------------- Maven & Build */
  {
    id: 'sb-maven-lifecycle',
    technology: T,
    title: 'Maven Build Lifecycle, Phases & Plugins',
    category: 'Maven & Build',
    slug: 'sb-maven-lifecycle',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'Maven builds run ordered lifecycle phases (validate → compile → test → package → verify → install → deploy), each executing bound plugin goals.',
    mentalModel: 'Phases are stations on a train line; asking for a station (mvn package) stops at every earlier station first.',
    memoryTip: 'validate, compile, test, package, verify, install, deploy. install = local ~/.m2; deploy = remote repository.',
    keyTerms: ['lifecycle', 'phase', 'goal', 'plugin', 'POM', 'GAV', 'surefire', 'failsafe', 'spring-boot-maven-plugin'],
    interviewAnswer: `Maven has three built-in lifecycles: clean, default and site. The default lifecycle's key phases are validate, compile, test, package, verify, install and deploy; running a phase runs all earlier phases. Phases themselves do nothing — plugin goals are bound to them (compiler:compile to compile, surefire:test to test, jar:jar to package). install copies the artifact to the local repository (~/.m2/repository); deploy uploads it to a remote repository such as Nexus/Artifactory. Unit tests run with Surefire in test; integration tests (*IT.java) run with Failsafe in integration-test/verify so a failing IT still tears down resources before failing the build.`,
    codeExample: `<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.bank</groupId>
  <artifactId>payment-service</artifactId>
  <version>1.4.0-SNAPSHOT</version>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.4</version>
  </parent>

  <properties>
    <java.version>21</java.version>
  </properties>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>   <!-- repackage: executable fat jar -->
      </plugin>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-failsafe-plugin</artifactId>      <!-- *IT tests in verify -->
        <executions>
          <execution><goals><goal>integration-test</goal><goal>verify</goal></goals></execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>

<!-- mvn clean verify        : compile, unit tests, package, integration tests -->
<!-- mvn -DskipTests package : build the jar without running tests            -->`,
    codeLanguage: 'XML',
    commonMistakes: [
      'Thinking mvn install is needed to build (package or verify is enough in CI).',
      'Running integration tests with Surefire.',
      'Hard-coding plugin versions inconsistently across modules instead of pluginManagement.',
    ],
    prerequisites: [],
    relatedTopics: ['sb-maven-dependency-management'],
    nextTopics: ['sb-maven-dependency-management'],
    references: [
      {
        title: 'Introduction to the Build Lifecycle',
        url: 'https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html',
        source: 'Apache Maven',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-maven-lifecycle'],
  },
  {
    id: 'sb-maven-dependency-management',
    technology: T,
    title: 'Maven Dependencies: Scopes, Conflicts, BOMs & Multi-Module',
    category: 'Maven & Build',
    slug: 'sb-maven-dependency-management',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Controlling which library versions end up on the classpath — scopes, transitive resolution ("nearest wins"), dependencyManagement and BOMs.',
    mentalModel: 'Your POM is a guest list; transitive dependencies are guests bringing friends. dependencyManagement is the bouncer deciding which version of each friend gets in.',
    memoryTip: 'Nearest definition wins; at equal depth, first declared wins. Pin versions with dependencyManagement / BOM. Inspect with mvn dependency:tree.',
    keyTerms: ['compile', 'provided', 'runtime', 'test', 'transitive dependency', 'nearest wins', 'exclusions', 'dependencyManagement', 'BOM', 'enforcer'],
    interviewAnswer: `Scopes: compile (default, everywhere), provided (needed to compile but supplied at runtime, e.g. servlet API in an app server, Lombok), runtime (not needed to compile, e.g. JDBC driver), test (tests only). Transitive conflicts are resolved by "nearest wins" — the version closest to your project in the tree, first declaration breaking ties — which can silently pick an old version and cause NoSuchMethodError at runtime. I diagnose with mvn dependency:tree -Dverbose and fix by pinning versions in dependencyManagement or importing a BOM (spring-boot-dependencies, jackson-bom), excluding unwanted transitive artifacts, and enforcing convergence with maven-enforcer-plugin.`,
    codeExample: `<!-- Parent / aggregator POM of a multi-module build -->
<packaging>pom</packaging>
<modules>
  <module>payment-api</module>
  <module>payment-core</module>
  <module>payment-app</module>
</modules>

<dependencyManagement>
  <dependencies>
    <dependency>                                  <!-- import a BOM: versions only -->
      <groupId>com.fasterxml.jackson</groupId>
      <artifactId>jackson-bom</artifactId>
      <version>2.17.2</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
    <dependency>
      <groupId>com.bank</groupId>
      <artifactId>payment-core</artifactId>
      <version>\${project.version}</version>
    </dependency>
  </dependencies>
</dependencyManagement>

<!-- In a child module: no version needed, and exclude a conflicting transitive -->
<dependency>
  <groupId>com.legacy</groupId>
  <artifactId>old-client</artifactId>
  <version>3.1</version>
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>

<!-- mvn dependency:tree -Dincludes=com.fasterxml.jackson.core -->
<!-- mvn -pl payment-app -am package   (build one module + what it depends on) -->`,
    codeLanguage: 'XML',
    commonMistakes: [
      'Declaring versions in every child module instead of dependencyManagement.',
      'Confusing dependencyManagement (declares versions) with dependencies (adds to classpath).',
      'Ignoring NoSuchMethodError / ClassNotFoundException as "code bugs" when they are version conflicts.',
      'Using SNAPSHOT dependencies in release builds.',
    ],
    seniorInsight: `In regulated environments the dependency graph is a security surface: generate an SBOM (CycloneDX Maven plugin), scan with OWASP Dependency-Check or Snyk in CI, use a curated internal repository, and fail builds on unconverged or vulnerable versions.`,
    prerequisites: ['sb-maven-lifecycle'],
    relatedTopics: ['sb-maven-lifecycle', 'sb-auto-configuration'],
    references: [
      {
        title: 'Introduction to the Dependency Mechanism',
        url: 'https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html',
        source: 'Apache Maven',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sb-maven-conflicts', 'q-sb-maven-scopes'],
  },
];
