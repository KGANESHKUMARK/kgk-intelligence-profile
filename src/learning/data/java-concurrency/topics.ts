import type { LearningTopic } from '../../types';

const T = 'java-concurrency';

export const javaConcurrencyTopics: LearningTopic[] = [
  /* ----------------------------------------- CompletableFuture */
  {
    id: 'jc-completable-future',
    technology: T,
    title: 'CompletableFuture — Async Pipelines & Exception Handling',
    category: 'Async Programming',
    slug: 'jc-completable-future',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'CompletableFuture enables non-blocking async composition — chain transformations, combine results, and handle errors without nested callbacks.',
    mentalModel: 'CompletableFuture = a promise. thenApply = transform (sync). thenCompose = flatMap (returns new future). thenCombine = zip two futures. exceptionally = catch. allOf = wait for all. anyOf = first wins.',
    memoryTip: 'thenApply = map (transform value). thenCompose = flatMap (chain futures). thenCombine = zip. allOf = wait all. anyOf = first. Handle exceptions with exceptionally or handle (can recover).',
    keyTerms: ['CompletableFuture', 'thenApply', 'thenCompose', 'thenCombine', 'allOf', 'exceptionally', 'supplyAsync', 'runAsync', 'ForkJoinPool', 'custom executor'],
    visualIds: [],
    interviewAnswer: `CompletableFuture enables async, non-blocking code without callback hell. Key operators: supplyAsync(() -> ..., executor) — runs on a thread pool (default: ForkJoinPool.commonPool(), but always specify a custom executor for production); thenApply(fn) — transform the result (sync, same thread as completion); thenApplyAsync(fn, executor) — transform on a different thread; thenCompose(fn) — flat-map, fn returns a new CompletableFuture (avoids CompletableFuture<CompletableFuture<T>>); thenCombine(other, fn) — zip two futures; allOf(futures...) — completes when all complete; anyOf(futures...) — completes when first completes. Exception handling: exceptionally(ex -> fallback) — recover from exception; handle((result, ex) -> ...) — handles both success and failure cases. Critical: always specify a custom executor for I/O-bound tasks — the common ForkJoinPool is shared with parallel streams and can starve.`,
    codeExample: `// Production-quality async pipeline with CompletableFuture
@Service
public class PaymentOrchestrator {
    
    // Custom executor: I/O-bound, not ForkJoinPool.commonPool()
    private final ExecutorService ioExecutor = Executors.newVirtualThreadPerTaskExecutor(); // Java 21
    
    public CompletableFuture<PaymentResult> processPayment(PaymentRequest req) {
        // Step 1: validate and step 2: check fraud run in PARALLEL
        CompletableFuture<ValidationResult> validationFuture = 
            CompletableFuture.supplyAsync(() -> validator.validate(req), ioExecutor);
            
        CompletableFuture<FraudScore> fraudFuture = 
            CompletableFuture.supplyAsync(() -> fraudClient.check(req), ioExecutor);
        
        return validationFuture
            .thenCombine(fraudFuture, (validation, fraud) -> {
                // Both complete: check results
                if (validation.isInvalid()) throw new ValidationException(validation.errors());
                if (fraud.getScore() > 0.8) throw new FraudDetectedException();
                return new ValidatedRequest(req, fraud);
            })
            .thenComposeAsync(validated -> 
                // Step 3: submit to payment gateway (async HTTP)
                gatewayClient.submitAsync(validated), ioExecutor)
            .thenApply(gatewayResponse -> 
                // Step 4: transform to domain result (sync, cheap)
                PaymentResult.from(gatewayResponse))
            .exceptionally(ex -> {
                // Fallback for network failures
                if (ex instanceof GatewayTimeoutException) {
                    auditLog.logTimeout(req);
                    return PaymentResult.pendingRetry(req.getId());
                }
                throw new CompletionException(ex);  // re-throw other errors
            });
    }
    
    // Wait for all with timeout
    public List<PaymentResult> processBatch(List<PaymentRequest> requests) {
        List<CompletableFuture<PaymentResult>> futures = requests.stream()
            .map(this::processPayment)
            .collect(toList());
        
        CompletableFuture<Void> all = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
        
        try {
            all.get(30, SECONDS);  // timeout for batch
        } catch (TimeoutException e) {
            futures.forEach(f -> f.cancel(true));  // cancel remaining
            throw new BatchTimeoutException();
        }
        return futures.stream().map(CompletableFuture::join).collect(toList());
    }
}`,
    practicalExample: `Payment enrichment: for each incoming payment, validate (50ms), check fraud score (80ms), and load account metadata (30ms) — all independent. Sequential: 160ms per payment. With CompletableFuture.allOf parallelising all 3: 80ms (limited by fraud check, the slowest). Under 10,000 payments/hour, this saves 800 seconds of unnecessary waiting.`,
    commonMistakes: [
      'Using ForkJoinPool.commonPool() for I/O tasks — blocks the shared pool, starving parallel streams.',
      'Forgetting exceptionally — unhandled exceptions in CompletableFuture are silently swallowed.',
      'Calling .get() without a timeout — blocks the calling thread indefinitely if the future never completes.',
      'thenApply returning a CompletableFuture instead of using thenCompose — creates nested CompletableFuture<CompletableFuture<T>>.',
    ],
    seniorInsight: `Java 21 virtual threads (Project Loom) change the CompletableFuture calculus: virtual threads are so cheap (~1 KB stack vs 1 MB for platform threads) that blocking I/O inside a virtual thread is acceptable — no need for CompletableFuture chains. Use Executors.newVirtualThreadPerTaskExecutor() for I/O-bound services and simplify to synchronous code. Reserve CompletableFuture for fan-out patterns (parallel calls) and explicit async composition.`,
    aiAwareness: {
      strongAnswerShouldMention: ['thenApply vs thenCompose', 'thenCombine for parallel', 'custom executor for I/O', 'exceptionally for error handling', 'allOf timeout pattern'],
      weakAnswer: 'CompletableFuture lets you run tasks asynchronously and chain them together.',
      redFlags: ['Using commonPool for I/O', 'No exceptionally', 'get() without timeout'],
      likelyFollowUp: ['What is the difference between thenApply and thenCompose?', 'Why not use the common ForkJoinPool for I/O tasks?', 'How do you handle exceptions in a chain?'],
    },
    prerequisites: [],
    relatedTopics: ['jc-virtual-threads', 'jc-thread-safe'],
    nextTopics: ['jc-virtual-threads'],
    interviewQuestions: ['q-jc-completable-future', 'q-jc-async-patterns'],
  },
  /* ------------------------------------------ Project Loom Virtual Threads */
  {
    id: 'jc-virtual-threads',
    technology: T,
    title: 'Project Loom — Virtual Threads & Structured Concurrency',
    category: 'Virtual Threads',
    slug: 'jc-virtual-threads',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Virtual threads (Java 21) are cheap JVM-managed threads — write blocking I/O code and get the scalability of async, without callbacks or reactive chains.',
    mentalModel: 'Platform thread = OS thread (~1 MB stack, ~10K per JVM limit). Virtual thread = JVM-managed, ~1 KB, millions possible. Blocking a virtual thread = cheap yield; the carrier OS thread picks another virtual thread.',
    memoryTip: 'Virtual thread blocks? JVM parks it, OS thread continues. Virtual thread ready? JVM schedules it on a carrier thread. Thread-per-request model returns: synchronous code scales like async. pinning = virtual thread stuck to carrier (synchronized block) — avoid for long waits.',
    keyTerms: ['virtual thread', 'carrier thread', 'pinning', 'structured concurrency', 'StructuredTaskScope', 'ForkJoinPool scheduler', 'thread-per-request', 'Project Loom', 'ThreadLocal'],
    visualIds: [],
    interviewAnswer: `Virtual threads (JEP 444, Java 21 stable) solve the C10K problem without reactive programming. When a virtual thread blocks on I/O (HTTP, JDBC, sleep), the JVM parks the virtual thread and returns the underlying OS carrier thread to the pool — the carrier continues executing other virtual threads. When I/O completes, the virtual thread is rescheduled. This means one OS thread can serve thousands of concurrent requests. Practical impact for Spring Boot: switch Tomcat to use virtual threads — spring.threads.virtual.enabled=true — and every HTTP request runs on its own virtual thread. Thread-per-request model scales to C100K without async code. Pinning: a virtual thread holding a synchronized lock while blocking pins the carrier thread — monitor with jdk.tracePinnedThreads. Replace synchronized with ReentrantLock to avoid pinning. Structured Concurrency (JEP 453): StructuredTaskScope.ShutdownOnFailure — fork tasks, fail fast if any task fails, join all; StructuredTaskScope.ShutdownOnSuccess — return first successful result.`,
    codeExample: `// Java 21 virtual threads with Spring Boot 3.2+
# application.properties
spring.threads.virtual.enabled=true   # Tomcat + @Async use virtual threads

// Traditional blocking code NOW scales like async
@GetMapping("/account/{id}")
public AccountDto getAccount(@PathVariable String id) {
    // This blocks a virtual thread (cheap) not an OS thread (expensive)
    Account account = accountRepository.findById(id).orElseThrow();  // JDBC blocks → virtual thread parks
    ExchangeRate rate = rateClient.getRate(account.getCurrency());    // HTTP blocks → virtual thread parks
    return AccountDto.from(account, rate);  // Simple synchronous code!
}

// Structured Concurrency — parallel calls with fail-fast
public PaymentDecision evaluate(PaymentRequest req) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        Subtask<ValidationResult> validation = scope.fork(() -> validator.validate(req));
        Subtask<FraudScore>       fraud      = scope.fork(() -> fraudClient.check(req));
        Subtask<AccountBalance>   balance    = scope.fork(() -> accountClient.balance(req));
        
        scope.join().throwIfFailed();   // waits for all; fails fast on any exception
        
        return decide(validation.get(), fraud.get(), balance.get());
    }   // auto-closed: any incomplete tasks are cancelled
}

// Pinning fix: replace synchronized with ReentrantLock
private final ReentrantLock lock = new ReentrantLock();

public void safeUpdate(String key, String value) {
    lock.lock();        // virtual thread can yield here (not pinned)
    try {
        // critical section
    } finally {
        lock.unlock();
    }
}`,
    practicalExample: `Migrated a Spring Boot REST service from thread-pool (200 threads) to virtual threads (spring.threads.virtual.enabled=true). Under load: 200 platform threads handled 180 concurrent requests (20 waiting). With virtual threads: 50,000 concurrent requests handled with the same CPU — the I/O wait is now free. No code change to business logic — just the one property.`,
    commonMistakes: [
      'Using synchronized blocks for long-held locks with I/O inside — this pins the carrier thread, defeating virtual thread benefits.',
      'Thread pools with virtual threads — Executors.newFixedThreadPool(100) defeats the purpose. Use newVirtualThreadPerTaskExecutor().',
      'ThreadLocal in virtual threads at scale — millions of virtual threads × ThreadLocal values = memory pressure.',
      'Assuming virtual threads make reactive programming obsolete — reactive is still better for back-pressure and streaming.',
    ],
    seniorInsight: `Virtual threads don't make databases scale magically. If you have 10,000 concurrent virtual threads all blocked on JDBC, you still need 10,000 DB connections — which is worse than before. Solution: keep the connection pool small (virtual threads will queue cheaply), or use R2DBC (reactive JDBC) if you genuinely need that level of concurrency. Virtual threads solve the thread-per-request scalability problem; the DB connection limit is a separate concern.`,
    aiAwareness: {
      strongAnswerShouldMention: ['carrier thread parking on block', 'spring.threads.virtual.enabled', 'pinning and ReentrantLock fix', 'structured concurrency', 'ThreadLocal caveat'],
      weakAnswer: 'Virtual threads are lightweight threads that are cheaper than regular threads.',
      redFlags: ['synchronized inside virtual thread with I/O', 'Thread pool with virtual threads'],
      likelyFollowUp: ['What is thread pinning?', 'How do structured concurrency and CompletableFuture compare?', 'Does virtual threads replace reactive programming?'],
    },
    prerequisites: ['jc-completable-future'],
    relatedTopics: ['jc-thread-safe', 'jc-reactive'],
    nextTopics: ['jc-thread-safe'],
    interviewQuestions: ['q-jc-virtual-threads', 'q-jc-pinning'],
  },
  /* ---------------------------------------- Thread-Safe Collections */
  {
    id: 'jc-thread-safe',
    technology: T,
    title: 'Thread-Safe Collections & Synchronisation Primitives',
    category: 'Thread Safety',
    slug: 'jc-thread-safe',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Thread-safe collections and synchronisation primitives prevent data races — choose the right one based on access patterns (read-heavy vs write-heavy, bounded vs unbounded).',
    mentalModel: 'ConcurrentHashMap = read-heavy, compute atomically. CopyOnWriteArrayList = read-heavy, rare writes. BlockingQueue = producer-consumer. Atomic = single variable. ReentrantLock = explicit locking with tryLock and conditions.',
    memoryTip: 'ConcurrentHashMap.compute() for atomic check-then-act. CopyOnWriteArrayList for frequent-read listener lists. LinkedBlockingQueue for bounded producer-consumer. Semaphore for resource limiting. StampedLock for read-write with optimistic reads.',
    keyTerms: ['ConcurrentHashMap', 'CopyOnWriteArrayList', 'BlockingQueue', 'AtomicInteger', 'ReentrantLock', 'ReadWriteLock', 'StampedLock', 'Semaphore', 'CountDownLatch', 'CyclicBarrier'],
    visualIds: [],
    interviewAnswer: `Thread-safe collection choice by use case: ConcurrentHashMap — general-purpose concurrent map; segment-level locking means reads never block; compute/computeIfAbsent for atomic check-then-act. CopyOnWriteArrayList — every write copies the entire array; ideal for read-heavy data that rarely changes (event listener lists, config). LinkedBlockingQueue — bounded producer-consumer queue; put() blocks if full, take() blocks if empty; fair=true provides ordering guarantees. Synchronisation primitives: AtomicInteger/AtomicReference — lock-free CAS operations for simple counters and references. ReentrantLock — explicit locking with tryLock(timeout) to avoid deadlock, and Condition for wait/signal. ReadWriteLock/StampedLock — multiple concurrent readers, exclusive writer; StampedLock adds optimistic read (no lock, just timestamp check). Semaphore — limits concurrent access to N permits; rate limiting, connection limiting. CountDownLatch — one-shot barrier; await() blocks until count reaches 0. CyclicBarrier — reusable barrier; all threads wait until all reach the barrier.`,
    codeExample: `// ConcurrentHashMap — atomic deduplication
private final ConcurrentHashMap<String, ProcessingState> processing = new ConcurrentHashMap<>();

public void processPayment(String paymentId, PaymentRequest req) {
    // computeIfAbsent is atomic — only one thread creates the entry
    ProcessingState state = processing.computeIfAbsent(paymentId, id -> {
        return ProcessingState.PROCESSING;
    });
    if (state == ProcessingState.PROCESSING) {
        return; // another thread is already processing this payment
    }
    // ... process
}

// Bounded producer-consumer with BlockingQueue
private final BlockingQueue<PaymentEvent> eventQueue = new LinkedBlockingQueue<>(1000);

// Producer (multiple threads)
public void publishEvent(PaymentEvent event) throws InterruptedException {
    if (!eventQueue.offer(event, 5, SECONDS)) {  // non-blocking with timeout
        throw new BackpressureException("Event queue full");
    }
}

// Consumer (single thread)
@Scheduled(fixedDelay = 10)
public void processEvents() throws InterruptedException {
    PaymentEvent event = eventQueue.poll(100, MILLISECONDS);
    if (event != null) auditLog.write(event);
}

// StampedLock — optimistic reads for rate-limit config
private final StampedLock lock = new StampedLock();
private int rateLimit = 1000;

public int getRateLimit() {
    long stamp = lock.tryOptimisticRead();      // no lock taken
    int value = rateLimit;
    if (!lock.validate(stamp)) {                // check no write happened
        stamp = lock.readLock();                // fallback to read lock
        try { value = rateLimit; } finally { lock.unlockRead(stamp); }
    }
    return value;
}`,
    practicalExample: `Payment idempotency with ConcurrentHashMap.computeIfAbsent: multiple threads receive the same payment webhook simultaneously (exactly-once delivery attempt from Stripe). computeIfAbsent ensures only one thread creates the "PROCESSING" entry — other threads see the existing entry and skip processing. No database round-trip needed for in-flight deduplication.`,
    commonMistakes: [
      'HashMap in a concurrent context — will cause ConcurrentModificationException or infinite loops.',
      'Collections.synchronizedMap() — entire map locked on every read; ConcurrentHashMap is always better.',
      'CopyOnWriteArrayList for write-heavy data — copying the array on every write is O(n).',
      'Checking size() before add() in a ConcurrentHashMap — the check and add are not atomic; use computeIfAbsent.',
    ],
    seniorInsight: `The most common concurrency bug in banking systems: check-then-act without atomicity. "If account.balance >= amount, deduct amount" — between the check and the deduct, another thread may have already deducted. Fix: CAS (compare-and-swap) with AtomicReference, database-level optimistic locking (@Version in JPA), or a distributed lock. In production, I've seen double-charges caused by this bug in payment services that passed all unit tests because tests ran single-threaded.`,
    aiAwareness: {
      strongAnswerShouldMention: ['ConcurrentHashMap.computeIfAbsent', 'CopyOnWriteArrayList for read-heavy', 'BlockingQueue producer-consumer', 'ReentrantLock tryLock', 'check-then-act atomicity'],
      weakAnswer: 'Use synchronized methods or ConcurrentHashMap for thread safety.',
      redFlags: ['HashMap in concurrent context', 'Collections.synchronizedMap', 'Non-atomic check-then-act'],
      likelyFollowUp: ['When would you use CopyOnWriteArrayList?', 'What is the difference between ReentrantLock and synchronized?', 'How do you prevent a check-then-act race condition?'],
    },
    prerequisites: ['jc-completable-future'],
    relatedTopics: ['jc-reactive'],
    nextTopics: ['jc-reactive'],
    interviewQuestions: ['q-jc-thread-safe', 'q-jc-race-condition'],
  },
  /* ------------------------------------------- Reactive Streams */
  {
    id: 'jc-reactive',
    technology: T,
    title: 'Reactive Programming — Project Reactor & Back-Pressure',
    category: 'Reactive Streams',
    slug: 'jc-reactive',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Reactive programming processes data streams asynchronously with back-pressure — the subscriber tells the publisher how much data it can handle, preventing overwhelming fast producers.',
    mentalModel: 'Reactive = async stream with back-pressure. Mono = 0 or 1. Flux = 0 to N. Operators transform streams without blocking threads. WebFlux = non-blocking HTTP using reactive streams end-to-end.',
    memoryTip: 'Mono<T> = async Optional. Flux<T> = async List. map = sync transform. flatMap = async transform (parallel). switchIfEmpty = default. onErrorReturn = catch with value. subscribe = terminal (do not block).',
    keyTerms: ['Reactor', 'Mono', 'Flux', 'back-pressure', 'flatMap', 'concatMap', 'switchIfEmpty', 'zip', 'merge', 'scheduler', 'WebFlux', 'R2DBC'],
    visualIds: [],
    interviewAnswer: `Project Reactor (the reactive library behind Spring WebFlux) implements the Reactive Streams specification: a publisher emits items; a subscriber requests N items (back-pressure); the publisher sends at most N. Mono<T> represents 0 or 1 item (like CompletableFuture); Flux<T> represents 0 to N. Key operators: map (sync transform), flatMap (async transform — parallel, order not guaranteed), concatMap (async transform — sequential, preserves order), zip (combine two streams pair-by-pair), merge (interleave two streams), switchIfEmpty (emit from another publisher if empty). Schedulers: Schedulers.boundedElastic() for I/O-bound blocking code wrapped in Mono.fromCallable(); Schedulers.parallel() for CPU-bound work. Back-pressure: subscribe(…, n -> request(n)) — subscriber controls flow; prevents memory exhaustion when producer is faster than consumer.`,
    codeExample: `// Spring WebFlux service — reactive pipeline
@Service
public class PaymentService {
    
    public Mono<PaymentResult> processPayment(PaymentRequest req) {
        return Mono.just(req)
            .flatMap(r -> validator.validateAsync(r))           // async, non-blocking
            .zipWith(fraudClient.checkAsync(req))               // parallel fraud check
            .flatMap(tuple -> {
                ValidationResult v = tuple.getT1();
                FraudScore f = tuple.getT2();
                if (f.getScore() > 0.8) return Mono.error(new FraudDetectedException());
                return gatewayClient.submitAsync(v.getRequest());  // async HTTP
            })
            .map(PaymentResult::from)
            .onErrorReturn(GatewayTimeoutException.class, PaymentResult.pending(req.getId()))
            .doOnSuccess(r -> auditLog.log(r))                 // side effect
            .subscribeOn(Schedulers.boundedElastic());          // run on elastic thread pool
    }
    
    // Flux with back-pressure: stream transactions to client
    public Flux<TransactionDto> streamTransactions(String accountId) {
        return transactionRepository.findByAccountId(accountId)  // R2DBC reactive
            .map(TransactionDto::from)
            .delayElements(Duration.ofMillis(10))    // rate limit output
            .onBackpressureBuffer(100,               // buffer up to 100 items
                dropped -> log.warn("Transaction dropped: {}", dropped));
    }
    
    // Wrapping blocking code in reactive context
    public Mono<Account> getAccountBlocking(String id) {
        return Mono.fromCallable(() -> jdbcRepository.findById(id))  // blocking call
            .subscribeOn(Schedulers.boundedElastic());  // run on thread pool, not event loop
    }
}`,
    practicalExample: `Transaction streaming API: 100,000 transactions returned to a mobile client. With blocking REST + List: loads all 100,000 into memory, serialises to JSON, sends as one response — 2 GB heap spike, 30-second wait for first byte. With WebFlux Flux: first transaction delivered in 5ms, memory stable at 50 MB (processes 100 items at a time via back-pressure), client receives a stream it can render progressively.`,
    commonMistakes: [
      'Blocking calls in a reactive pipeline without subscribeOn(boundedElastic()) — blocks the event loop, killing throughput for all requests.',
      'Using flatMap when order matters — use concatMap for order-preserving async transform.',
      'Not subscribing — reactive chains are lazy; nothing executes until subscribe() is called.',
      'Using Flux in Spring MVC (non-reactive context) — it works, but loses back-pressure benefits without WebFlux.',
    ],
    seniorInsight: `Reactive programming has a high learning curve and debugging difficulty — stack traces are fragmented. In 2025, Project Loom virtual threads offer 80% of reactive throughput for I/O-bound workloads with 100% of synchronous code simplicity. My guidance: choose WebFlux/Reactor only if you need: (1) streaming/SSE responses, (2) R2DBC for reactive DB access, (3) true back-pressure from consumer to producer. For standard request/response APIs, virtual threads on Spring MVC is simpler and now competitive in throughput.`,
    aiAwareness: {
      strongAnswerShouldMention: ['Mono vs Flux', 'flatMap vs concatMap', 'back-pressure', 'boundedElastic for blocking', 'WebFlux for streaming'],
      weakAnswer: 'Reactive programming is non-blocking and uses Mono and Flux instead of regular return values.',
      redFlags: ['Blocking call on event loop', 'Not subscribing', 'flatMap when order matters'],
      likelyFollowUp: ['What is back-pressure?', 'When would you choose reactive over virtual threads?', 'What is the difference between flatMap and concatMap in Reactor?'],
    },
    prerequisites: ['jc-virtual-threads'],
    relatedTopics: ['jc-completable-future'],
    nextTopics: [],
    interviewQuestions: ['q-jc-reactive-streams', 'q-jc-backpressure'],
  },
];
