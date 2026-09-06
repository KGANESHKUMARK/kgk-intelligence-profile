import type { LearningTopic } from '../../../types';

export const concurrencyTopics: LearningTopic[] = [
  {
    id: 'thread',
    technology: 'java',
    title: 'Thread',
    category: 'Concurrency',
    slug: 'thread',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'The smallest schedulable unit of execution in the JVM — java.lang.Thread wraps either an OS thread (platform) or a JVM-scheduled one (virtual).',
    mentalModel: 'A thread is an independent worker executing its own sequence of instructions, sharing the same heap as every other thread in the process.',
    memoryTip: 'NEW \u2192 RUNNABLE \u2192 (BLOCKED/WAITING) \u2192 TERMINATED — never back to NEW.',
    keyTerms: ['Runnable', 'start()', 'join()', 'platform thread', 'virtual thread'],
    visualIds: ['thread-lifecycle'],
    interviewAnswer:
      'A Thread is the JVM\u2019s unit of concurrent execution. You give it a Runnable (or override run()), call start() to schedule it, and it runs concurrently with the calling thread and every other thread in the process, all sharing the same heap. join() lets the calling thread wait for it to finish. Since Java 21, there are two kinds: platform threads (each backed 1:1 by an OS thread) and virtual threads (JVM-scheduled, much cheaper, good for blocking-I/O-heavy workloads).',
    detailedExplanation:
      'Every Thread instance moves through a well-defined lifecycle: NEW (created, not started), RUNNABLE (eligible to run or actually running — the JVM/OS scheduler decides), BLOCKED (waiting to acquire a monitor lock), WAITING or TIMED_WAITING (waiting on another thread, e.g. via join() or wait()), and TERMINATED (run() returned or threw). All threads in a process share the heap, which is exactly why uncoordinated access to shared mutable state across threads is unsafe and needs synchronization.',
    codeExample:
      'Runnable task = () -> System.out.println("Running on thread: " + Thread.currentThread().getName());\nThread t = new Thread(task, "worker-1");\nt.start();\nt.join();',
    codeOutput: 'Running on thread: worker-1',
    whyOutput:
      'start() schedules the thread to run concurrently; join() blocks the main thread until worker-1 finishes, so by the time join() returns, the print statement has definitely already executed on worker-1.',
    practicalExample:
      'A batch valuation job that splits a large portfolio into chunks and processes each chunk on its own thread (or, more commonly today, submits each chunk as a task to an ExecutorService) is the standard way raw Thread usage shows up in production code — direct new Thread(...).start() is rare outside of frameworks and low-level infrastructure.',
    commonMistakes: [
      'Calling run() directly instead of start() — this just executes synchronously on the current thread, with no concurrency at all.',
      'Forgetting that threads share the heap, and mutating shared state without synchronization.',
      'Creating and discarding raw threads per task instead of using an ExecutorService, losing pooling and lifecycle management.',
    ],
    seniorInsight:
      'Platform threads are relatively expensive (each maps to an OS thread, with real stack memory and OS scheduling overhead), which is exactly the constraint virtual threads were introduced to relax — see Virtual Threads.',
    prerequisites: [],
    relatedTopics: ['executorservice', 'synchronized-vs-lock', 'virtual-threads'],
    nextTopics: ['executorservice', 'virtual-threads'],
    references: [
      {
        title: 'Thread — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-thread-vs-runnable', 'q-deadlock-causes'],
  },

  {
    id: 'executorservice',
    technology: 'java',
    title: 'ExecutorService',
    category: 'Concurrency',
    slug: 'executorservice',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A managed thread pool abstraction that decouples submitting tasks from how and where they run.',
    mentalModel: 'A ticket queue with a fixed number of clerks — you submit tasks (tickets), the pool assigns them to whichever worker thread (clerk) is free.',
    memoryTip: 'submit() returns a Future you can poll or block on; invokeAll() waits for a whole batch.',
    keyTerms: ['thread pool', 'Future', 'submit', 'invokeAll', 'shutdown'],
    interviewAnswer:
      'ExecutorService manages a pool of worker threads and a task queue, so callers submit Runnable/Callable tasks without creating or managing threads directly. submit() returns a Future representing the eventual result; invokeAll() runs a batch and waits for all of them. Executors provides common pool shapes (fixed, cached, single-threaded, scheduled, and since Java 21, a virtual-thread-per-task executor).',
    detailedExplanation:
      'Under the hood, a ThreadPoolExecutor (the typical implementation) holds a bounded queue and a set of worker threads; when a task is submitted, it either runs immediately on an idle worker or waits in the queue. This bounds concurrency (so you don\u2019t spawn unbounded threads under load) and reuses threads (avoiding the cost of creating a new OS thread per task). Always call shutdown() (or use try-with-resources with an AutoCloseable executor) so pooled threads don\u2019t keep the JVM alive indefinitely.',
    codeExample:
      'ExecutorService pool = Executors.newFixedThreadPool(2);\nFuture<Integer> result = pool.submit(() -> 21 + 21);\nSystem.out.println(result.get());\npool.shutdown();',
    codeOutput: '42',
    whyOutput:
      'submit() hands the Callable to the pool and immediately returns a Future; get() blocks until that specific task completes and then returns its result, 42.',
    practicalExample:
      'A batch processing job that needs to compute results for thousands of accounts in parallel typically uses a fixed thread pool sized to available CPU cores (for CPU-bound work) or, in modern Java, a virtual-thread-per-task executor (for I/O-bound work like calling downstream services per account).',
    commonMistakes: [
      'Forgetting to call shutdown(), leaking threads and preventing the JVM from exiting.',
      'Using an unbounded queue with a fixed pool under heavy load, causing memory growth instead of backpressure.',
      'Calling get() on a Future without a timeout and blocking forever if the task hangs.',
    ],
    seniorInsight:
      'CompletableFuture builds on this model to compose asynchronous pipelines (thenApply, thenCompose, allOf) without manually blocking on get() at every step — useful when chaining several dependent asynchronous calls.',
    prerequisites: ['thread'],
    relatedTopics: ['thread', 'virtual-threads', 'structured-concurrency'],
    nextTopics: ['virtual-threads'],
    references: [
      {
        title: 'ExecutorService — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-executorservice-types', 'q-deadlock-causes'],
  },

  {
    id: 'synchronized-vs-lock',
    technology: 'java',
    title: 'synchronized vs Lock',
    category: 'Concurrency',
    slug: 'synchronized-vs-lock',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Two ways to enforce mutual exclusion: the built-in synchronized keyword, and the more flexible Lock interface.',
    mentalModel: 'synchronized is a self-locking door that always shuts behind you. Lock is a door you must remember to close yourself — but you get a key with more features.',
    memoryTip: 'synchronized: simple, always released. Lock: flexible, must unlock() yourself (use try/finally).',
    keyTerms: ['mutual exclusion', 'monitor', 'ReentrantLock', 'tryLock', 'fairness'],
    visualIds: ['synchronized-lock-comparison'],
    interviewAnswer:
      'synchronized is a language-level keyword that acquires an object\u2019s intrinsic monitor lock for a block or method, and guarantees release even if an exception is thrown. Lock (typically ReentrantLock) is an explicit API you must acquire and release yourself — usually in a try/finally — in exchange for extra capabilities synchronized doesn\u2019t offer: tryLock() with a timeout, interruptible acquisition, configurable fairness, and multiple Condition queues per lock.',
    detailedExplanation:
      'Both provide mutual exclusion and are reentrant (a thread already holding the lock can re-acquire it without deadlocking itself). synchronized is simpler and less error-prone because the JVM guarantees the lock is released on block exit. Lock trades that safety net for flexibility: you can attempt a lock non-blockingly (tryLock()), with a timeout, or respond to interruption while waiting — none of which synchronized supports.',
    practicalExample:
      'A cache with a rare, expensive rebuild step might use tryLock() so that only one thread performs the rebuild while others fall back to serving slightly stale data instead of blocking indefinitely — that specific behavior is only possible with Lock, not synchronized.',
    commonMistakes: [
      'Forgetting to call unlock() in a finally block, leaving the lock held forever if an exception is thrown.',
      'Assuming Lock is always faster than synchronized — for simple, low-contention cases the JVM\u2019s biased/lightweight locking for synchronized is often just as fast or faster.',
      'Mixing synchronized and Lock on the same piece of shared state, so some code paths bypass the other\u2019s protection entirely.',
    ],
    seniorInsight:
      'Reach for Lock specifically when you need one of its unique capabilities (timeout, interruptibility, fairness, multiple conditions) — otherwise, synchronized is simpler, harder to misuse, and usually performs comparably.',
    prerequisites: ['thread'],
    relatedTopics: ['thread', 'hashmap-vs-concurrenthashmap'],
    references: [
      {
        title: 'Lock — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/Lock.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-synchronized-vs-lock', 'q-deadlock-causes'],
  },

  {
    id: 'virtual-threads',
    technology: 'java',
    title: 'Virtual Threads',
    category: 'Concurrency',
    slug: 'virtual-threads',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Lightweight, JVM-scheduled threads (Project Loom) that let simple blocking-style code scale to huge numbers of concurrent tasks.',
    mentalModel: 'Like virtual memory maps a huge address space onto limited RAM, virtual threads map huge numbers of logical threads onto a small pool of real OS (carrier) threads.',
    memoryTip: 'Cheap, many, blocking-friendly — but not for long CPU-bound work.',
    keyTerms: ['carrier thread', 'mounting/unmounting', 'pinning', 'Executors.newVirtualThreadPerTaskExecutor'],
    visualIds: ['virtual-threads-architecture'],
    introducedIn: 21,
    featureStatus: 'stable',
    interviewAnswer:
      'Virtual threads are JVM-managed threads that don\u2019t map 1:1 to OS threads. A small pool of platform threads (carrier threads) run many virtual threads by unmounting a virtual thread whenever it blocks (e.g. on I/O) and mounting a different one in its place. This lets you write ordinary blocking-style code — no callbacks, no reactive chaining — while still scaling to hundreds of thousands of concurrent tasks, because the expensive resource (OS threads) is shared rather than exhausted. Finalized in JDK 21 via JEP 444, after previewing in JDK 19 and 20.',
    detailedExplanation:
      'When code running on a virtual thread calls a blocking operation (like a blocking socket read), the Java runtime detects the block and unmounts the virtual thread from its carrier, freeing that carrier to run a different virtual thread. When the blocking operation completes, the virtual thread is scheduled back onto some available carrier thread — not necessarily the same one. This is why virtual threads are described as "cheap": most of their cost is a small heap object, not an OS-level thread stack.',
    internalWorking:
      'Not every blocking situation can be unmounted cleanly. When a virtual thread executes inside a synchronized block, or calls certain native/foreign methods, it becomes "pinned" to its carrier — it cannot be unmounted, so if it then blocks while pinned, the carrier thread is blocked too, temporarily reducing the pool\u2019s effective capacity. This is why heavy, long-held synchronized blocks are discouraged on virtual threads (prefer java.util.concurrent.locks.ReentrantLock, which does not pin).',
    codeExample:
      'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 3).forEach(i ->\n        executor.submit(() -> System.out.println("task " + i + " running"))\n    );\n}',
    codeOutput: 'task 0 running\ntask 2 running\ntask 1 running',
    whyOutput:
      'Each task runs on its own virtual thread, and the JVM schedules them onto a small pool of carrier threads. Because they run concurrently, the print order is not guaranteed to match submission order — this illustrative run happened to interleave 0, 2, 1; a different run could print in a different order.',
    practicalExample:
      'A service that fans out to dozens of downstream HTTP calls per incoming request — previously constrained by platform-thread-pool size or forced into reactive/async style — can submit each downstream call as a task on a virtual-thread-per-task executor and keep straightforward blocking code, while still handling very high concurrency.',
    commonMistakes: [
      'Using virtual threads for long-running CPU-bound work — they help with blocking I/O, not with computation; CPU-bound work is still limited by actual CPU cores.',
      'Holding a synchronized block for a long time on a virtual thread, causing pinning and reducing carrier-thread availability for everyone else.',
      'Pooling virtual threads like platform threads (e.g. via a fixed-size pool) — the whole point is they are cheap enough to create one per task, not to be reused from a pool.',
    ],
    seniorInsight:
      'Virtual threads change capacity planning: instead of "how many platform threads can we afford," the question becomes "how many carrier threads does this workload need," since carrier count is typically tied to CPU core count, configurable via jdk.virtualThreadScheduler.parallelism.',
    aiAwareness: {
      strongAnswerShouldMention: ['carrier thread', 'unmounting on blocking I/O', 'not for CPU-bound work', 'pinning'],
      weakAnswer: 'Virtual threads are lightweight threads that let you run more threads than normal.',
      redFlags: ['Claims virtual threads make CPU-bound code faster', 'Cannot explain what pinning is', 'Thinks virtual threads replace all platform threads'],
      likelyFollowUp: [
        'What happens when a virtual thread blocks?',
        'What is thread pinning, and what causes it?',
        'Would you use virtual threads for a CPU-bound matrix multiplication? Why not?',
        'How does Structured Concurrency relate to virtual threads?',
      ],
    },
    followUpQuestions: [
      'Why can\u2019t all blocking operations be unmounted cleanly?',
      'How does this change thread-pool capacity planning?',
    ],
    prerequisites: ['thread', 'executorservice'],
    relatedTopics: ['thread', 'executorservice', 'structured-concurrency'],
    nextTopics: ['structured-concurrency'],
    references: [
      {
        title: 'JEP 444: Virtual Threads',
        url: 'https://openjdk.org/jeps/444',
        source: 'OpenJDK',
        type: 'jep',
        version: 21,
        status: 'stable',
      },
      {
        title: 'Virtual Threads — Java Platform Guide',
        url: 'https://docs.oracle.com/en/java/javase/23/core/virtual-threads.html',
        source: 'Oracle',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-virtual-threads-purpose', 'q-virtual-vs-platform-threads'],
  },

  {
    id: 'structured-concurrency',
    technology: 'java',
    title: 'Structured Concurrency',
    category: 'Concurrency',
    slug: 'structured-concurrency',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'An API that treats a group of related concurrent subtasks as a single unit of work with one lifetime and one failure path.',
    mentalModel: 'A parent task forks children that can never outlive it — like a project manager who won\u2019t close a project until every subtask reports back or is cancelled.',
    memoryTip: 'Still preview as of JDK 25 and 26 — the exact API surface has changed across previews and may change again.',
    keyTerms: ['StructuredTaskScope', 'fork', 'join', 'cancellation', 'observability'],
    introducedIn: 21,
    featureStatus: 'preview',
    visualIds: ['structured-concurrency-flow'],
    interviewAnswer:
      'Structured Concurrency (java.util.concurrent.StructuredTaskScope) confines a group of related subtasks to the lifetime of an enclosing scope: you fork subtasks, join to wait for them according to a join policy, and when the scope closes, any subtask that hasn\u2019t finished is cancelled. This solves three problems ad-hoc thread management leaves open: subtask lifetimes are no longer independent of the parent, cancellation propagates reliably, and the thread hierarchy is visible to observability tools — unlike a bag of unrelated Futures. It is still a preview API, disabled by default, and has changed across every preview from JDK 21 through JDK 26.',
    detailedExplanation:
      'The core idea is "no orphaned subtasks": with plain ExecutorService + Future, nothing stops a subtask from outliving the code that spawned it, or from being silently ignored if the caller stops waiting. StructuredTaskScope makes the parent-child relationship explicit and enforced — the scope will not close while children are still running, and cancelling the parent cancels the children. This composes naturally with virtual threads, since subtasks are typically forked onto their own virtual thread.',
    practicalExample:
      'A request handler that needs to call both a pricing service and a risk service and combine their results is the textbook example: fork both calls, join with a policy like "succeed only if both succeed," and if either fails, the other is automatically cancelled instead of continuing to run pointlessly.',
    commonMistakes: [
      'Treating a preview API\u2019s exact method names/signatures as stable across JDK versions — the shape has changed release to release (e.g. exception types thrown by join policies changed between recent previews).',
      'Using it as a drop-in ExecutorService replacement rather than understanding its stricter parent/child lifetime guarantees.',
      'Forking long-running, unrelated background work into a scope meant for a single cohesive unit of work.',
    ],
    seniorInsight:
      'Because this API is still evolving in preview, production code today typically still relies on ExecutorService/CompletableFuture for this class of problem, while teams track Structured Concurrency\u2019s progress toward finalization. Always check the JEP for the JDK version you\u2019re actually targeting before writing example code — do not assume a snippet from one preview compiles against another.',
    aiAwareness: {
      strongAnswerShouldMention: ['parent-child task lifetime', 'automatic cancellation propagation', 'still a preview feature', 'composes with virtual threads'],
      weakAnswer: 'It\u2019s a way to run tasks concurrently and wait for them.',
      redFlags: ['States Structured Concurrency is finalized/stable', 'Cannot explain what happens to unfinished subtasks when the scope closes'],
      likelyFollowUp: [
        'Why is this different from just using a list of Futures?',
        'What happens to sibling subtasks if one fails?',
        'Why has this stayed in preview so long?',
      ],
    },
    prerequisites: ['thread', 'executorservice', 'virtual-threads'],
    relatedTopics: ['virtual-threads', 'executorservice'],
    references: [
      {
        title: 'JEP 505: Structured Concurrency (Fifth Preview) — JDK 25',
        url: 'https://openjdk.org/jeps/505',
        source: 'OpenJDK',
        type: 'jep',
        version: 25,
        status: 'preview',
      },
      {
        title: 'JEP 525: Structured Concurrency (Sixth Preview) — JDK 26',
        url: 'https://openjdk.org/jeps/525',
        source: 'OpenJDK',
        type: 'jep',
        version: 26,
        status: 'preview',
      },
    ],
    interviewQuestions: ['q-structured-concurrency-purpose'],
  },
];
