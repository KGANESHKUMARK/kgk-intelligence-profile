import type { InterviewQuestion } from '../../types';
const T = 'java-concurrency';
export const javaConcurrencyQuestions: InterviewQuestion[] = [
  {
    id: 'q-jc-completable-future', technology: T, question: 'What is the difference between thenApply, thenCompose, and thenCombine in CompletableFuture?',
    category: 'Async Programming', difficulty: 'advanced',
    quickAnswer: 'thenApply = sync transform (map). thenCompose = async chain (flatMap). thenCombine = zip two futures when both complete.',
    interviewAnswer: `thenApply(fn): fn is synchronous (returns T, not CompletableFuture<T>). Transforms the result. Executes on the thread that completed the previous stage (or caller thread if already complete). Like Stream.map(). thenCompose(fn): fn returns a new CompletableFuture<T>. The result is the inner future's value, not CompletableFuture<CompletableFuture<T>>. Like Stream.flatMap(). Used to chain async operations: getFraudScore().thenCompose(score -> submitToGateway(score)). thenCombine(other, fn): waits for two independent futures to both complete, then applies fn to both results. fn receives (resultA, resultB). Neither future waits for the other — true parallel execution. thenAccept: like thenApply but fn returns void (for side effects). whenComplete: runs after completion (success or failure) without transforming the result.`,
    keyTerms: ['thenApply', 'thenCompose', 'thenCombine', 'flatMap', 'parallel', 'chaining'],
    conceptsTested: ['CompletableFuture operators', 'Async pipeline design'],
    strongAnswerKeywords: ['thenApply = sync map', 'thenCompose = flatMap chain', 'thenCombine = parallel zip'],
    whatIsBeingTested: ['Async programming depth'],
    codeExample: `// thenApply: transform result (sync)
CF<String> name = CF.supplyAsync(() -> "hello").thenApply(String::toUpperCase); // "HELLO"

// thenCompose: chain two async ops (flatMap)
CF<PaymentResult> result = validateAsync(req)     // CF<ValidReq>
    .thenCompose(valid -> gatewayAsync(valid));    // CF<PaymentResult>

// thenCombine: both run in parallel, combine when done
CF<Decision> decision = fraudAsync(req)           // CF<FraudScore>
    .thenCombine(balanceAsync(req),               // CF<Balance>
        (fraud, balance) -> decide(fraud, balance));`,
    interviewerIntent: 'Core CompletableFuture question in every Java interview.',
    followUps: ['q-jc-async-patterns'],
  },
  {
    id: 'q-jc-async-patterns', technology: T, question: 'Why should you not use ForkJoinPool.commonPool() for I/O-bound CompletableFuture tasks?',
    category: 'Async Programming', difficulty: 'advanced',
    quickAnswer: 'commonPool is shared with parallel streams. I/O-bound tasks block threads in the pool. This starves parallel streams and other tasks. Always specify a custom executor for I/O.',
    interviewAnswer: `ForkJoinPool.commonPool() is a JVM-wide shared pool. Its default size = CPU cores - 1 (e.g. 7 threads on an 8-core machine). It is used by: parallel streams, CompletableFuture.supplyAsync() when no executor specified, Fork/Join tasks. Problem: I/O-bound tasks (HTTP calls, DB queries) block for 10-500ms. During this time, the thread is occupied and unavailable for other work. If 7 blocking I/O tasks run simultaneously, the entire commonPool is saturated. Parallel streams on the same JVM stop working. Solution: create a dedicated executor for I/O tasks: Executors.newFixedThreadPool(50) for blocking I/O, or better, Executors.newVirtualThreadPerTaskExecutor() in Java 21 (virtually unlimited, each task gets a cheap virtual thread). Always pass the executor: CompletableFuture.supplyAsync(() -> httpCall(), ioExecutor).`,
    keyTerms: ['ForkJoinPool.commonPool', 'I/O blocking', 'pool starvation', 'custom executor', 'virtual threads'],
    conceptsTested: ['Thread pool management', 'CompletableFuture internals'],
    strongAnswerKeywords: ['shared pool starvation', 'parallel streams affected', 'custom executor', 'newVirtualThreadPerTaskExecutor'],
    whatIsBeingTested: ['Production concurrency awareness'],
    interviewerIntent: 'Common mistake that causes production issues — tests practical Java concurrency experience.',
    followUps: ['q-jc-virtual-threads'],
  },
  {
    id: 'q-jc-virtual-threads', technology: T, question: 'Explain Java 21 virtual threads. How do they work and what is thread pinning?',
    category: 'Virtual Threads', difficulty: 'advanced',
    quickAnswer: 'Virtual threads are JVM-managed, ~1KB, millions possible. Blocking I/O yields the carrier OS thread. Pinning = virtual thread stuck to carrier (in synchronized). Fix: use ReentrantLock.',
    interviewAnswer: `Virtual threads (JEP 444): the JVM maintains a pool of carrier OS threads (typically = CPU cores). When a virtual thread blocks on I/O (read, sleep, JDBC, HTTP), the JVM parks the virtual thread and frees the carrier thread to run other virtual threads. When the I/O completes, the virtual thread is rescheduled on any available carrier thread. This allows thousands of concurrent blocking operations with only N carrier threads. Thread pinning: when a virtual thread executes inside a synchronized block and blocks (I/O, sleep), the virtual thread is pinned to its carrier OS thread — the carrier cannot serve other virtual threads. This negates the scaling benefit. Detection: JVM option -Djdk.tracePinnedThreads=full. Fix: replace synchronized with ReentrantLock (virtual threads can yield while waiting for ReentrantLock). Spring Boot 3.2: spring.threads.virtual.enabled=true enables virtual threads for Tomcat and @Async — no code changes to business logic.`,
    keyTerms: ['carrier thread', 'parking', 'pinning', 'synchronized vs ReentrantLock', 'spring.threads.virtual.enabled'],
    conceptsTested: ['Project Loom', 'Java 21 features'],
    strongAnswerKeywords: ['carrier thread', 'park on I/O', 'pinning in synchronized', 'ReentrantLock fix', 'Spring Boot property'],
    whatIsBeingTested: ['Modern Java knowledge'],
    codeExample: `// PINNING — avoid this with virtual threads
synchronized (this) {
    Thread.sleep(100);  // pinned! carrier thread blocked
}

// OK with virtual threads
private final ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    Thread.sleep(100);  // virtual thread parks, carrier free
} finally { lock.unlock(); }`,
    interviewerIntent: 'Java 21 virtual threads are a frequent senior interview topic in 2025.',
    followUps: ['q-jc-pinning'],
  },
  {
    id: 'q-jc-pinning', technology: T, question: 'Does virtual threads replace reactive programming (WebFlux)?',
    category: 'Virtual Threads', difficulty: 'advanced',
    quickAnswer: 'For request/response APIs: virtual threads on Spring MVC is simpler and now competitive. For streaming/back-pressure/R2DBC: WebFlux still wins.',
    interviewAnswer: `Virtual threads solve the scalability problem of thread-per-request (blocking I/O wastes OS threads). They don't require reactive code — the business logic stays synchronous. When to still use WebFlux/Reactor: (1) Streaming responses (SSE, chunked) — Flux natively represents a stream; Mono is clean for a single async value. (2) R2DBC — if you need truly non-blocking DB access (not just cheap blocking), R2DBC + WebFlux end-to-end. (3) Back-pressure — if the consumer is slower than the producer, Reactor's Flux.request(n) propagates back-pressure upstream. Virtual threads cannot do this. (4) Composing many async operations elegantly — Reactor's operators (zip, merge, flatMap with concatMap) are expressive. Recommendation: new services in 2025 → Spring MVC + virtual threads (simpler, less learning curve, competitive throughput). Existing reactive services: no urgent reason to migrate. Streaming/back-pressure requirements: WebFlux.`,
    keyTerms: ['virtual threads vs reactive', 'streaming', 'back-pressure', 'R2DBC', 'Spring MVC vs WebFlux'],
    conceptsTested: ['Modern Java architecture choices'],
    strongAnswerKeywords: ['back-pressure', 'streaming', 'R2DBC', 'Spring MVC + virtual threads for most cases'],
    whatIsBeingTested: ['Architectural decision-making'],
    interviewerIntent: 'Tests whether candidate can make nuanced technology choices, not just name technologies.',
    followUps: ['q-jc-thread-safe'],
  },
  {
    id: 'q-jc-thread-safe', technology: T, question: 'What is a race condition and how do you prevent check-then-act races in Java?',
    category: 'Thread Safety', difficulty: 'advanced',
    quickAnswer: 'Race condition: two threads read shared state, both see it as valid, both proceed — leading to duplicate processing. Fix: atomic CAS, synchronized block, database-level locking.',
    interviewAnswer: `Check-then-act race: thread A checks balance >= 100 (true), thread B checks balance >= 100 (true), thread A deducts 100, thread B deducts 100 — account goes negative. The check and act are not atomic. Fixes: (1) ConcurrentHashMap.computeIfAbsent() / compute() — atomic check-then-create in a single CAS operation. (2) synchronized block — ensures only one thread executes the check-then-act. (3) AtomicReference.compareAndSet() — lock-free CAS at hardware level. (4) Database optimistic locking: @Version in JPA — if two transactions try to update the same row, the second gets an OptimisticLockException and must retry. (5) Database pessimistic locking: SELECT FOR UPDATE — row-level lock prevents concurrent updates. Prefer optimistic locking for low-contention, pessimistic for high-contention critical paths (payment debit).`,
    keyTerms: ['race condition', 'check-then-act', 'CAS', 'computeIfAbsent', 'optimistic locking', 'SELECT FOR UPDATE'],
    conceptsTested: ['Concurrency correctness', 'Thread safety patterns'],
    strongAnswerKeywords: ['check-then-act not atomic', 'computeIfAbsent', 'compareAndSet', 'optimistic locking @Version', 'SELECT FOR UPDATE'],
    whatIsBeingTested: ['Concurrency bug awareness'],
    codeExample: `// Optimistic locking — payment debit
@Entity
public class Account {
    @Version Long version;  // incremented on every update
    BigDecimal balance;
}
// If two threads update concurrently, second throws OptimisticLockException → retry
@Retryable(OptimisticLockException.class)
public void debit(String accountId, BigDecimal amount) {
    Account acc = repo.findById(accountId).orElseThrow();
    if (acc.getBalance().compareTo(amount) < 0) throw new InsufficientFundsException();
    acc.setBalance(acc.getBalance().subtract(amount));
    repo.save(acc); // version mismatch → exception if concurrent update
}`,
    interviewerIntent: 'Thread safety is fundamental — double-charge bugs in payments come from this.',
    followUps: ['q-jc-race-condition'],
  },
  {
    id: 'q-jc-race-condition', technology: T, question: 'When would you use CopyOnWriteArrayList vs ConcurrentHashMap vs BlockingQueue?',
    category: 'Thread Safety', difficulty: 'intermediate',
    quickAnswer: 'CopyOnWriteArrayList: read-heavy, rare writes (listener lists). ConcurrentHashMap: general concurrent map, atomic compute. BlockingQueue: producer-consumer with back-pressure.',
    interviewAnswer: `CopyOnWriteArrayList: every write (add/remove) copies the entire backing array — very expensive writes. Reads are lock-free and fast (immutable snapshot). Use for: event listener lists, configuration that rarely changes, caches that are read millions of times and written once. Never for: high-write scenarios (array copy is O(n)). ConcurrentHashMap: segment-level CAS (not full lock). Reads never block. Writes lock only the affected segment. compute/computeIfAbsent for atomic check-then-act. Use for: general-purpose concurrent maps, deduplication, rate counters, session maps. Never use: Collections.synchronizedMap() (locks entire map on every access). BlockingQueue (LinkedBlockingQueue, ArrayBlockingQueue): producer calls put() (blocks if full), consumer calls take() (blocks if empty). Built-in back-pressure. Use for: producer-consumer decoupling, batch event processing, job queues. ArrayBlockingQueue is bounded (prevents memory overflow). LinkedBlockingQueue can be bounded or unbounded.`,
    keyTerms: ['CopyOnWriteArrayList', 'ConcurrentHashMap', 'BlockingQueue', 'bounded queue', 'back-pressure'],
    conceptsTested: ['Java concurrency collections', 'Use-case matching'],
    strongAnswerKeywords: ['CopyOnWriteArrayList for read-heavy', 'ConcurrentHashMap.compute', 'BlockingQueue back-pressure', 'bounded queue'],
    whatIsBeingTested: ['Concurrent collection selection'],
    interviewerIntent: 'Tests practical knowledge of concurrent data structures.',
    followUps: ['q-jc-reactive-streams'],
  },
  {
    id: 'q-jc-reactive-streams', technology: T, question: 'What is back-pressure in reactive programming and why does it matter?',
    category: 'Reactive Streams', difficulty: 'advanced',
    quickAnswer: 'Back-pressure: subscriber tells publisher how many items it can handle. Producer slows to match consumer. Prevents OOM when producer is faster than consumer.',
    interviewAnswer: `Back-pressure is the mechanism by which a slow subscriber signals the publisher to slow down or buffer items. Without back-pressure: a fast producer pushes 100,000 items/s; a slow consumer processes 10,000/s — 90,000 items/s accumulate in a buffer. Eventually OOM. With back-pressure (Reactive Streams spec): subscriber calls request(n) — "give me 100 items". Publisher emits at most 100. Consumer processes, calls request(100) again. Producer never overwhelms consumer. In Project Reactor: Flux.range(1, 1000000).subscribe(item -> process(item)) — by default uses unbounded request (request(Long.MAX_VALUE)). Explicit back-pressure: flux.subscribe(subscriber) where subscriber.request(10) controls flow. Strategies when buffer is full: onBackpressureBuffer(100) — buffer up to 100; onBackpressureDrop — drop items; onBackpressureError — error the subscriber. Real use: HTTP streaming endpoint where client reads slowly — Flux controls how fast DB results are fetched.`,
    keyTerms: ['back-pressure', 'request(n)', 'onBackpressureBuffer', 'subscriber controls flow', 'OOM prevention'],
    conceptsTested: ['Reactive Streams spec', 'Flow control'],
    strongAnswerKeywords: ['subscriber calls request(n)', 'publisher emits at most n', 'OOM prevention', 'onBackpressureBuffer vs Drop'],
    whatIsBeingTested: ['Reactive programming depth'],
    interviewerIntent: 'Back-pressure is the distinguishing concept of reactive — candidates who just say "async" miss the point.',
    followUps: ['q-jc-backpressure'],
  },
  {
    id: 'q-jc-backpressure', technology: T, question: 'What is the difference between flatMap and concatMap in Project Reactor?',
    category: 'Reactive Streams', difficulty: 'advanced',
    quickAnswer: 'flatMap: concurrent, order not guaranteed, max concurrency configurable. concatMap: sequential, preserves order, one inner subscription at a time.',
    interviewAnswer: `flatMap: subscribes to all inner publishers concurrently (up to a concurrency limit). Results arrive as each inner publisher completes — no order guarantee. Use for: parallel I/O where order doesn't matter (parallel HTTP calls, batch DB fetches). Control max concurrency: flatMap(fn, 10) — at most 10 concurrent subscriptions. concatMap: subscribes to the next inner publisher only after the previous completes. Preserves emission order. Sequential. Use for: ordered processing (Kafka consumer where message order matters), sequential API calls with dependency. switchMap: subscribes to the newest inner publisher, cancels the previous. Use for: search-as-you-type (cancel the previous search when a new keypress arrives). mergeMap: alias for flatMap. Performance: flatMap(fn, 1) behaves like concatMap but without order guarantee. For order + concurrency: flatMap with result buffering and reordering (complex). Common mistake: using flatMap where message order matters (Kafka event processing) — some events are processed out of order.`,
    keyTerms: ['flatMap concurrent', 'concatMap sequential', 'switchMap cancel previous', 'order guarantee', 'concurrency limit'],
    conceptsTested: ['Reactor operator semantics', 'Async flow control'],
    strongAnswerKeywords: ['flatMap concurrent no order', 'concatMap sequential preserves order', 'switchMap cancels', 'Kafka use concatMap'],
    whatIsBeingTested: ['Reactive operator precision'],
    interviewerIntent: 'flatMap vs concatMap is the most common Reactor interview mistake — tests operational reactive knowledge.',
    followUps: ['q-jc-completable-future'],
  },
];
