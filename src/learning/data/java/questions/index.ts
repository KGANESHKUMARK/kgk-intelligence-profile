import type { InterviewQuestion } from '../../../types';

/* ------------------------------------------------------------ Collections */

const collectionsQuestions: InterviewQuestion[] = [
  {
    id: 'q-hashmap-internals',
    question: 'How does a HashMap work internally?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'It buckets entries by hashCode() and resolves same-bucket collisions with equals().',
    interviewAnswer:
      'A HashMap keeps an array of buckets. To place or find a key, it computes hashCode(), spreads the bits, and maps that onto a bucket index. If the bucket already has entries (a collision), it walks them calling equals() to find the exact key. When the map grows past capacity times load factor (0.75 by default), it resizes and rehashes everything into a bigger array.',
    detailedAnswer:
      'Buckets store colliding entries as a linked list, or — since Java 8 — as a small red-black tree once a bucket has 8+ entries, turning worst-case lookup in that bucket from O(n) to O(log n). Resize doubles capacity and rehashes every entry, which is O(n) and happens synchronously on the calling thread.',
    seniorAnswer:
      'The main production risks are: a poor hashCode() distribution defeating O(1) average behavior entirely, unbounded growth from never pre-sizing a map whose final size is known, and — since HashMap gives no thread-safety guarantee — undefined or corrupting behavior if it\u2019s mutated concurrently without external synchronization or by switching to ConcurrentHashMap.',
    keyTerms: ['hashCode', 'equals', 'bucket', 'load factor', 'treeification'],
    conceptsTested: ['hashCode/equals relationship', 'collision resolution', 'resizing cost'],
    prerequisites: ['hashcode', 'equals'],
    relatedTopics: ['hashmap'],
    followUps: ['q-load-factor-resize', 'q-hashmap-thread-safety', 'q-equals-hashcode-contract'],
    commonMistakes: ['Saying HashMap preserves insertion order', 'Not mentioning equals() at all'],
    strongAnswerKeywords: ['hashCode', 'bucket', 'equals', 'collision', 'resize', 'load factor'],
    interviewerIntent:
      'Checks whether you understand hashing as an approximate index, not a unique identity, and whether you know the two-method contract that makes lookups correct.',
    whatIsBeingTested: ['Understanding of hashing vs equality', 'Awareness of collision handling', 'Awareness of resize cost'],
  },
  {
    id: 'q-equals-hashcode-contract',
    question: 'What is the contract between equals() and hashCode(), and what breaks if you violate it?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'Equal objects must produce equal hashCodes; the reverse isn\u2019t required.',
    interviewAnswer:
      'If x.equals(y) is true, then x.hashCode() must equal y.hashCode(). The contract also requires equals() to be reflexive, symmetric, transitive and consistent. If you override equals() without hashCode(), two "equal" objects can end up in different HashMap buckets, so lookups that should succeed silently fail.',
    detailedAnswer:
      'Different (unequal) objects are allowed to share a hashCode — that\u2019s a normal collision, resolved by equals() within the bucket. The dangerous direction is the other one: if equal objects don\u2019t share a hash, a hash-based collection will never even compare them, because it never looks in the same bucket.',
    seniorAnswer:
      'This is why static analysis tools flag one override without the other — the bug doesn\u2019t throw, it just makes contains()/get() silently return false/null for an object that "should" be found. Records generate both consistently for free, which is a strong practical argument for using them for simple data carriers.',
    keyTerms: ['reflexive', 'symmetric', 'transitive', 'consistent'],
    conceptsTested: ['Object contract', 'consequences of violating it'],
    prerequisites: ['hashcode', 'equals'],
    relatedTopics: ['object-contract'],
    followUps: ['q-hashmap-internals'],
    commonMistakes: ['Stating the contract in the wrong direction (equal hashCodes implying equal objects)'],
    strongAnswerKeywords: ['equal objects', 'equal hashCodes', 'reflexive', 'symmetric', 'transitive', 'consistent'],
    interviewerIntent: 'Tests precise understanding of a subtle, commonly-misstated rule — not just "override both."',
    whatIsBeingTested: ['Precision about contract direction', 'Understanding of silent-failure bugs'],
  },
  {
    id: 'q-arraylist-vs-linkedlist',
    question: 'When would you choose LinkedList over ArrayList?',
    category: 'Collections',
    difficulty: 'beginner',
    quickAnswer: 'Rarely — only when you specifically need cheap insert/remove at both ends, like a Deque.',
    interviewAnswer:
      'ArrayList gives O(1) random access via get(index) but O(n) middle inserts/removes because it shifts elements. LinkedList gives O(1) insert/remove at either end but O(n) get(index) because it must walk from an end. In practice, ArrayList is the default; LinkedList (or better, ArrayDeque) is chosen specifically for queue/deque-style access patterns.',
    detailedAnswer:
      'ArrayList\u2019s contiguous array layout is also far more cache-friendly for iteration than LinkedList\u2019s pointer-chasing nodes, which is why ArrayList often outperforms LinkedList even for use cases LinkedList was theoretically designed for.',
    seniorAnswer:
      'In current practice, java.util.ArrayDeque usually beats LinkedList even for pure stack/queue workloads, because it avoids per-node object overhead entirely — LinkedList is rarely the right answer in new code.',
    keyTerms: ['random access', 'amortized cost', 'cache locality'],
    conceptsTested: ['Big-O trade-offs', 'practical performance vs theoretical Big-O'],
    relatedTopics: ['arraylist-vs-linkedlist'],
    followUps: [],
    commonMistakes: ['Choosing LinkedList "for performance" with no specific head/tail access pattern'],
    strongAnswerKeywords: ['O(1) get', 'O(n) middle insert', 'Deque', 'cache locality'],
    interviewerIntent: 'Checks whether you reach for data structures based on actual access patterns, not folklore.',
    whatIsBeingTested: ['Big-O reasoning', 'Practical vs theoretical performance awareness'],
  },
  {
    id: 'q-hashmap-vs-concurrenthashmap',
    question: 'What is the difference between HashMap and ConcurrentHashMap?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'HashMap is fast but unsafe under concurrent writes; ConcurrentHashMap is thread-safe with fine-grained locking.',
    interviewAnswer:
      'HashMap makes no thread-safety guarantees — concurrent structural modification can corrupt it. ConcurrentHashMap is designed for concurrent access: it locks at a fine granularity instead of locking the whole map, so many threads can operate concurrently. It also disallows null keys and values entirely, since null is ambiguous under concurrent access.',
    detailedAnswer:
      'ConcurrentHashMap\u2019s iterators are weakly consistent rather than fail-fast — you won\u2019t get a ConcurrentModificationException, but you also don\u2019t get a guaranteed atomic snapshot of the map\u2019s state at a single instant.',
    seniorAnswer:
      'It also exposes atomic compound operations (computeIfAbsent, merge, compute) that let you implement check-then-act logic like cache-fill without a race — often the real reason it\u2019s chosen over a manually synchronized HashMap.',
    keyTerms: ['thread safety', 'fine-grained locking', 'weakly consistent iterator'],
    conceptsTested: ['Concurrent collection design', 'null handling rationale'],
    relatedTopics: ['hashmap-vs-concurrenthashmap'],
    followUps: ['q-hashmap-thread-safety'],
    commonMistakes: ['Saying ConcurrentHashMap "just synchronizes every method"'],
    strongAnswerKeywords: ['thread-safe', 'fine-grained locking', 'no null keys', 'atomic compound operations'],
    interviewerIntent: 'Checks whether you understand why null is disallowed and how locking granularity differs, not just "one is thread-safe."',
    whatIsBeingTested: ['Concurrency-aware collection design understanding'],
  },
  {
    id: 'q-hashset-uniqueness',
    question: 'How does HashSet guarantee that elements are unique?',
    category: 'Collections',
    difficulty: 'beginner',
    quickAnswer: 'It\u2019s backed by a HashMap where elements are keys — add() is effectively a put() that only succeeds if the key is new.',
    interviewAnswer:
      'HashSet is internally backed by a HashMap<E, Object>, storing each element as a key mapped to a shared placeholder value. add(x) is essentially map.put(x, PRESENT), and put() returning "already had a mapping" is how add() reports the element was already present, relying entirely on hashCode()/equals() for uniqueness.',
    detailedAnswer:
      'This means every rule that applies to HashMap keys — a correct, consistent hashCode()/equals() pair, avoiding mutable fields in the hash calculation — applies identically to HashSet elements.',
    seniorAnswer:
      'Because uniqueness detection is a hashCode()+equals() lookup, adding elements whose hashCode() is expensive to compute repeatedly (and not cached) can make bulk insertion into a HashSet meaningfully slower than expected — worth profiling if it shows up as a hotspot.',
    keyTerms: ['HashMap-backed', 'hashCode', 'equals'],
    conceptsTested: ['Composition-based collection design', 'reliance on the Object contract'],
    relatedTopics: ['hashmap'],
    followUps: ['q-equals-hashcode-contract'],
    commonMistakes: ['Not connecting HashSet\u2019s behavior back to HashMap at all'],
    strongAnswerKeywords: ['backed by HashMap', 'hashCode', 'equals', 'placeholder value'],
    interviewerIntent: 'Tests whether you see the Collections Framework as composed of a few core building blocks rather than unrelated classes.',
    whatIsBeingTested: ['Understanding of Collections Framework composition'],
  },
  {
    id: 'q-treemap-ordering',
    question: 'How does TreeMap keep its keys sorted, and what does that cost?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'It\u2019s a red-black tree keyed by natural ordering or a supplied Comparator, giving O(log n) operations instead of HashMap\u2019s O(1) average.',
    interviewAnswer:
      'TreeMap maintains keys in sorted order (via Comparable or an explicit Comparator) using a red-black tree, so get/put/remove are O(log n) rather than HashMap\u2019s average O(1) — you trade raw lookup speed for guaranteed ordering, range queries (headMap/tailMap/subMap), and a defined iteration order.',
    detailedAnswer:
      'Because ordering is comparator-driven, TreeMap uses compareTo()/compare() — not equals()/hashCode() — to decide whether two keys are "the same," which can surprise you if a class\u2019s compareTo() and equals() aren\u2019t consistent with each other.',
    seniorAnswer:
      'A comparator inconsistent with equals() can make a TreeMap silently treat two "unequal" objects as the same key (or vice versa) — this is a specific, easy-to-miss violation distinct from the HashMap equals/hashCode contract.',
    keyTerms: ['red-black tree', 'Comparable', 'Comparator', 'O(log n)'],
    conceptsTested: ['Sorted map trade-offs', 'compareTo vs equals consistency'],
    relatedTopics: ['hashmap'],
    followUps: [],
    commonMistakes: ['Claiming TreeMap uses equals() to determine key identity'],
    strongAnswerKeywords: ['red-black tree', 'Comparator', 'O(log n)', 'sorted order'],
    interviewerIntent: 'Checks whether you know ordering-based collections use a different identity mechanism than hash-based ones.',
    whatIsBeingTested: ['Comparator vs equals distinction', 'Awareness of Big-O trade-off for ordering'],
  },
  {
    id: 'q-fail-fast-iterator',
    question: 'What does it mean for an iterator to be "fail-fast," and when would you see ConcurrentModificationException?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'Fail-fast iterators throw ConcurrentModificationException if the collection is structurally modified while iterating, rather than silently misbehaving.',
    interviewAnswer:
      'Most java.util collections (ArrayList, HashMap, HashSet) use a modification counter checked on every iterator step; if the collection was structurally modified outside the iterator (e.g. calling list.remove(x) mid-loop instead of iterator.remove()), the next iterator step throws ConcurrentModificationException rather than continuing with undefined behavior.',
    detailedAnswer:
      'It\u2019s a best-effort detection, not a guarantee — the JDK explicitly documents that it should not be relied on for correctness, only used to catch bugs during development. It also isn\u2019t a concurrency-safety mechanism; it can trigger even single-threaded, just from modifying a collection through a different reference during iteration.',
    seniorAnswer:
      'Concurrent collections (like ConcurrentHashMap) deliberately use weakly-consistent iterators instead of fail-fast ones, since a hard fail-fast check would be actively harmful under real concurrent access — this is a useful contrast to bring up.',
    keyTerms: ['fail-fast', 'modCount', 'iterator.remove()'],
    conceptsTested: ['Iteration safety mechanisms', 'fail-fast vs weakly-consistent'],
    relatedTopics: ['hashmap', 'hashmap-vs-concurrenthashmap'],
    followUps: ['q-hashmap-vs-concurrenthashmap'],
    commonMistakes: ['Calling it a thread-safety guarantee'],
    strongAnswerKeywords: ['ConcurrentModificationException', 'modification count', 'best-effort', 'iterator.remove()'],
    interviewerIntent: 'Tests whether you know this is a development-time bug detector, not a concurrency control mechanism.',
    whatIsBeingTested: ['Correct mental model of fail-fast semantics'],
  },
  {
    id: 'q-load-factor-resize',
    question: 'What is a HashMap\u2019s load factor, and what happens when it\u2019s exceeded?',
    category: 'Collections',
    difficulty: 'intermediate',
    quickAnswer: 'Load factor (default 0.75) is the fill-ratio threshold that triggers a resize, doubling capacity and rehashing every entry.',
    interviewAnswer:
      'Load factor controls the trade-off between space and lookup time: once the entry count exceeds capacity \u00d7 load factor, the map allocates a new array at double the capacity and rehashes every existing entry into it. A default capacity of 16 and load factor of 0.75 means the first resize happens at 13 entries.',
    detailedAnswer:
      'Rehashing is O(n) and happens synchronously on whichever thread triggers the insert that crosses the threshold — for a map built incrementally to a known large size, this means paying that cost repeatedly (at 12, 24, 48, 96 entries, and so on) unless you pre-size the initial capacity.',
    seniorAnswer:
      'For latency-sensitive code building a large map, constructing it with new HashMap<>(expectedSize / 0.75f) avoids repeated resize pauses — a small, easy optimization interviewers like to see you know exists.',
    keyTerms: ['load factor', 'capacity', 'rehash', 'pre-sizing'],
    conceptsTested: ['Resize mechanics', 'space/time trade-off awareness'],
    relatedTopics: ['hashmap'],
    followUps: ['q-hashmap-internals'],
    commonMistakes: ['Not knowing the default load factor (0.75) or default capacity (16)'],
    strongAnswerKeywords: ['load factor', '0.75', 'resize', 'rehash', 'pre-sizing'],
    interviewerIntent: 'Checks concrete, specific knowledge (defaults, mechanics) rather than a vague "it grows when it\u2019s full."',
    whatIsBeingTested: ['Specific factual knowledge', 'Performance-awareness'],
  },
];

/* ------------------------------------------------------------ Concurrency */

const concurrencyQuestions: InterviewQuestion[] = [
  {
    id: 'q-thread-vs-runnable',
    question: 'What is the difference between implementing Runnable and extending Thread?',
    category: 'Concurrency',
    difficulty: 'beginner',
    quickAnswer: 'Runnable is just the task; Thread is the worker. Implementing Runnable keeps your class free to extend something else.',
    interviewAnswer:
      'Runnable describes what to run (a single run() method); Thread is the actual execution vehicle. Implementing Runnable and passing it to a Thread (or an ExecutorService) is generally preferred over extending Thread directly, because Java doesn\u2019t allow multiple inheritance — extending Thread uses up your one superclass slot and tightly couples the task to "being a thread."',
    detailedAnswer:
      'In practice, most modern code doesn\u2019t extend Thread at all — tasks are submitted to an ExecutorService, which manages thread lifecycle for you, and the task itself is a Runnable or Callable.',
    seniorAnswer:
      'Extending Thread directly is now mostly seen in legacy code or very low-level infrastructure; framework and application code should default to Runnable/Callable submitted to an executor, keeping thread management centralized and poolable.',
    keyTerms: ['Runnable', 'Thread', 'composition over inheritance'],
    conceptsTested: ['Task vs execution vehicle distinction', 'API design preference'],
    relatedTopics: ['thread', 'executorservice'],
    followUps: ['q-executorservice-types'],
    commonMistakes: ['Saying there\u2019s no practical difference'],
    strongAnswerKeywords: ['Runnable', 'single inheritance', 'ExecutorService', 'composition'],
    interviewerIntent: 'Tests basic API design judgment, not just syntax knowledge.',
    whatIsBeingTested: ['API design reasoning'],
  },
  {
    id: 'q-synchronized-vs-lock',
    question: 'When would you use Lock instead of synchronized?',
    category: 'Concurrency',
    difficulty: 'intermediate',
    quickAnswer: 'When you need tryLock() with a timeout, interruptible acquisition, fairness, or multiple Condition queues — capabilities synchronized doesn\u2019t offer.',
    interviewAnswer:
      'synchronized is simpler and the JVM guarantees release even on exception, but it can only block indefinitely and offers no fairness control. Lock (typically ReentrantLock) requires manual unlock() (in a try/finally) but supports tryLock() with a timeout, interruptible waiting, and configurable fairness — reach for it specifically when you need one of those.',
    detailedAnswer:
      'Both are reentrant. The main risk with Lock is forgetting to release it in a finally block, leaving it held forever on an exception — synchronized can\u2019t have that specific bug by construction.',
    seniorAnswer:
      'On virtual threads specifically, prefer Lock over long-held synchronized blocks: synchronized can pin a virtual thread to its carrier, preventing the carrier from running other virtual threads while blocked — Lock does not have this pinning behavior.',
    keyTerms: ['ReentrantLock', 'tryLock', 'fairness', 'pinning'],
    conceptsTested: ['Locking API trade-offs', 'virtual-thread-aware locking choices'],
    relatedTopics: ['synchronized-vs-lock', 'virtual-threads'],
    followUps: ['q-deadlock-causes', 'q-virtual-threads-purpose'],
    commonMistakes: ['Claiming Lock is always faster than synchronized'],
    strongAnswerKeywords: ['tryLock', 'timeout', 'fairness', 'try/finally', 'pinning'],
    interviewerIntent: 'Tests whether you choose concurrency primitives based on required capabilities, not habit.',
    whatIsBeingTested: ['Concurrency primitive selection judgment'],
  },
  {
    id: 'q-executorservice-types',
    question: 'What are the common types of thread pools Executors provides, and how do you choose between them?',
    category: 'Concurrency',
    difficulty: 'intermediate',
    quickAnswer: 'Fixed, cached, single-threaded, scheduled, and (since 21) virtual-thread-per-task — chosen based on workload shape and concurrency needs.',
    interviewAnswer:
      'newFixedThreadPool bounds concurrency to a set number of platform threads, good for CPU-bound work sized to core count. newCachedThreadPool grows unboundedly and reuses idle threads, risky under sustained load. newSingleThreadExecutor serializes tasks on one thread. newScheduledThreadPool supports delayed/periodic tasks. newVirtualThreadPerTaskExecutor (Java 21+) creates a new virtual thread per task, suited to high-concurrency blocking I/O workloads.',
    detailedAnswer:
      'The right choice depends on whether work is CPU-bound (bounded pool sized near core count) or I/O-bound (traditionally a larger bounded pool sized empirically, or now often virtual threads instead), and whether unbounded growth (cached) is an acceptable risk for the traffic pattern.',
    seniorAnswer:
      'In production, a truly unbounded cached pool is a common cause of thread-exhaustion incidents under traffic spikes — most teams prefer an explicitly bounded ThreadPoolExecutor with a defined rejection policy, or virtual threads for I/O-bound fan-out, over the convenience factories when the workload is significant.',
    keyTerms: ['fixed pool', 'cached pool', 'scheduled pool', 'virtual-thread-per-task'],
    conceptsTested: ['Pool sizing strategy', 'CPU-bound vs I/O-bound workload distinction'],
    relatedTopics: ['executorservice', 'virtual-threads'],
    followUps: ['q-virtual-threads-purpose'],
    commonMistakes: ['Treating newCachedThreadPool as a safe default for production traffic'],
    strongAnswerKeywords: ['fixed pool', 'cached pool', 'CPU-bound', 'I/O-bound', 'virtual threads'],
    interviewerIntent: 'Tests whether pool choice is driven by workload characteristics rather than by copying a tutorial default.',
    whatIsBeingTested: ['Workload-aware concurrency configuration'],
  },
  {
    id: 'q-deadlock-causes',
    question: 'What causes a deadlock, and how would you prevent one?',
    category: 'Concurrency',
    difficulty: 'advanced',
    quickAnswer: 'Two or more threads each hold a lock the other needs, and neither will release — usually from acquiring locks in inconsistent order.',
    interviewAnswer:
      'A classic deadlock: thread A locks resource 1 then waits for resource 2; thread B locks resource 2 then waits for resource 1. Neither can proceed. The most reliable prevention is a consistent global lock-ordering convention (always acquire in the same order across the whole codebase), or using tryLock() with a timeout to back off and retry instead of blocking forever.',
    detailedAnswer:
      'Other mitigations include minimizing the scope/duration of held locks, avoiding nested locks when a single coarser lock would do, and using higher-level concurrency utilities (java.util.concurrent classes, or Structured Concurrency once stable) that make lock scope and task dependencies explicit rather than ad hoc.',
    seniorAnswer:
      'In production, a thread dump is the standard diagnostic: the JVM can detect and report deadlocked threads (holding-lock/waiting-for cycles) directly in a thread dump, which is usually the fastest way to confirm a hang is a true deadlock rather than, say, an external call that\u2019s simply slow.',
    keyTerms: ['lock ordering', 'tryLock', 'thread dump'],
    conceptsTested: ['Root cause of deadlock', 'prevention and diagnosis strategy'],
    relatedTopics: ['synchronized-vs-lock', 'thread'],
    followUps: [],
    commonMistakes: ['Describing symptoms (the app hangs) without explaining the cyclic-wait mechanism'],
    strongAnswerKeywords: ['lock ordering', 'cyclic wait', 'tryLock', 'thread dump'],
    interviewerIntent: 'Tests root-cause understanding and whether you know a real diagnostic tool, not just the definition.',
    whatIsBeingTested: ['Root-cause reasoning', 'Production diagnostic knowledge'],
  },
  {
    id: 'q-virtual-threads-purpose',
    question: 'What problem do virtual threads solve?',
    category: 'Concurrency',
    difficulty: 'advanced',
    quickAnswer: 'They let simple blocking-style code scale to huge concurrency, by decoupling logical threads from scarce OS threads.',
    interviewAnswer:
      'Before virtual threads, high concurrency for I/O-bound work meant either exhausting platform threads (each backed by a real, relatively expensive OS thread) or rewriting code in a reactive/async style to avoid blocking a limited pool. Virtual threads let ordinary blocking code — no callbacks — scale to huge numbers of concurrent tasks, because the JVM unmounts a virtual thread from its carrier whenever it blocks, freeing that carrier for other work.',
    detailedAnswer:
      'They were finalized in JDK 21 (JEP 444) after previewing in 19 and 20, as the headline deliverable of Project Loom. They are specifically aimed at blocking I/O-bound concurrency, not CPU-bound parallelism.',
    seniorAnswer:
      'The main production caveat is pinning: a virtual thread executing inside a synchronized block (or certain native calls) can\u2019t be unmounted, so a long-held synchronized block under load can quietly reduce effective carrier-thread availability — prefer ReentrantLock for long-held critical sections on virtual threads.',
    keyTerms: ['carrier thread', 'unmounting', 'pinning', 'Project Loom'],
    conceptsTested: ['Motivation behind virtual threads', 'appropriate use cases'],
    relatedTopics: ['virtual-threads'],
    followUps: ['q-virtual-vs-platform-threads', 'q-structured-concurrency-purpose'],
    commonMistakes: ['Claiming virtual threads speed up CPU-bound work'],
    strongAnswerKeywords: ['carrier thread', 'unmount', 'blocking I/O', 'not for CPU-bound work'],
    interviewerIntent: 'Tests whether you understand the specific problem (thread scarcity under blocking I/O) rather than just "threads but faster."',
    whatIsBeingTested: ['Correct mental model of what virtual threads change'],
  },
  {
    id: 'q-virtual-vs-platform-threads',
    question: 'What is the practical difference between a virtual thread and a platform thread?',
    category: 'Concurrency',
    difficulty: 'advanced',
    quickAnswer: 'A platform thread is backed 1:1 by an OS thread; a virtual thread is JVM-scheduled and shares a small pool of carrier threads.',
    interviewAnswer:
      'A platform thread reserves real OS resources (a native stack, OS scheduling) for its entire lifetime, so you can only realistically run a few thousand at once. A virtual thread is a lightweight JVM construct that borrows a carrier (platform) thread only while actively running, and gives it up while blocked — so you can run hundreds of thousands of them.',
    detailedAnswer:
      'Because virtual threads are cheap, the recommended pattern is "one virtual thread per task," never pooled/reused the way platform threads are — pooling defeats the point.',
    seniorAnswer:
      'This changes capacity planning: platform-thread capacity is about OS resources; virtual-thread capacity is really about how many carrier threads (usually tied to CPU core count) are needed to keep up with unblocking work, tunable via jdk.virtualThreadScheduler.parallelism.',
    keyTerms: ['carrier thread', 'OS thread', 'per-task creation'],
    conceptsTested: ['Cost model difference', 'usage pattern difference'],
    relatedTopics: ['virtual-threads', 'thread'],
    followUps: [],
    commonMistakes: ['Suggesting virtual threads should be pooled like platform threads'],
    strongAnswerKeywords: ['OS thread', 'carrier thread', 'one per task', 'cheap to create'],
    interviewerIntent: 'Checks whether you understand the cost-model shift, not just "virtual threads are lighter."',
    whatIsBeingTested: ['Cost-model and usage-pattern understanding'],
  },
  {
    id: 'q-structured-concurrency-purpose',
    question: 'What does Structured Concurrency add on top of plain ExecutorService and Future?',
    category: 'Concurrency',
    difficulty: 'senior',
    quickAnswer: 'It confines a group of subtasks to a single parent scope, so failure and cancellation propagate automatically instead of leaving orphaned tasks.',
    interviewAnswer:
      'With a plain ExecutorService, nothing enforces a relationship between a group of Futures — one can fail while others keep running pointlessly, or a caller can stop waiting while a task keeps executing unseen. StructuredTaskScope makes the parent/child relationship explicit: fork subtasks, join them under a policy, and when the scope closes, any subtask that hasn\u2019t finished is cancelled automatically.',
    detailedAnswer:
      'This gives three concrete benefits: subtask lifetimes are bounded by the parent scope, cancellation propagates reliably to siblings on failure, and the thread hierarchy is visible to observability tooling — none of which plain Future composition provides by default.',
    seniorAnswer:
      'It is still a preview API (6th preview as of JDK 26) and its exact method surface has changed across previews — treat any specific code example as version-specific until it finalizes, and don\u2019t ship a hard dependency on it in production code without accounting for that.',
    keyTerms: ['StructuredTaskScope', 'fork', 'join policy', 'cancellation propagation'],
    conceptsTested: ['Structured vs unstructured concurrency', 'awareness of preview-API risk'],
    relatedTopics: ['structured-concurrency', 'virtual-threads'],
    followUps: [],
    commonMistakes: ['Presenting it as a finalized, stable API'],
    strongAnswerKeywords: ['parent scope', 'cancellation', 'fork/join', 'still preview'],
    interviewerIntent: 'Tests awareness of a genuinely current (still-evolving) Java concurrency topic and honesty about its preview status.',
    whatIsBeingTested: ['Currency of knowledge', 'Honesty about feature maturity'],
  },
  {
    id: 'q-hashmap-thread-safety',
    question: 'Is HashMap thread-safe? What happens if you don\u2019t make it safe and use it across threads anyway?',
    category: 'Concurrency',
    difficulty: 'intermediate',
    quickAnswer: 'No. Unsynchronized concurrent modification can corrupt internal state or produce incorrect results.',
    interviewAnswer:
      'HashMap provides no thread-safety guarantee. If multiple threads modify it concurrently without external synchronization, you can get lost updates, corrupted internal structure, or (in older JDK versions) infinite loops during a concurrent resize. The fix is either external synchronization, Collections.synchronizedMap() (coarse-grained), or — preferably — ConcurrentHashMap for real concurrent throughput.',
    detailedAnswer:
      'Even "just reading" isn\u2019t automatically safe if another thread might be writing concurrently — visibility isn\u2019t guaranteed without a proper synchronization or happens-before relationship in place.',
    seniorAnswer:
      'This is precisely the kind of bug that\u2019s hard to reproduce in testing (works fine at low concurrency, fails intermittently under load) and easy to introduce by sharing what looks like an innocuous local cache across request-handling threads — worth calling out proactively in code review.',
    keyTerms: ['thread safety', 'visibility', 'ConcurrentHashMap'],
    conceptsTested: ['Consequences of ignoring thread-safety', 'remediation options'],
    relatedTopics: ['hashmap', 'hashmap-vs-concurrenthashmap'],
    followUps: ['q-hashmap-vs-concurrenthashmap'],
    commonMistakes: ['Assuming reads are always safe even if writes are concurrent elsewhere'],
    strongAnswerKeywords: ['not thread-safe', 'corruption', 'ConcurrentHashMap', 'visibility'],
    interviewerIntent: 'Tests whether you understand this as a correctness issue, not just a performance one.',
    whatIsBeingTested: ['Correctness-under-concurrency reasoning'],
  },
];

/* -------------------------------------------------------------------- JVM */

const jvmQuestions: InterviewQuestion[] = [
  {
    id: 'q-jvm-vs-jre-vs-jdk',
    question: 'What is the difference between the JVM, the JRE, and the JDK?',
    category: 'JVM',
    difficulty: 'beginner',
    quickAnswer: 'JVM runs bytecode; JRE is the JVM plus core libraries needed to run programs; JDK is the JRE plus development tools like javac.',
    interviewAnswer:
      'The JVM is purely the execution engine — class loading, verification, interpretation/JIT compilation, memory management. The JRE bundles the JVM with the core class libraries needed to run compiled Java programs. The JDK includes the JRE plus development tools: javac, jar, javadoc, and diagnostic tools like jcmd.',
    detailedAnswer:
      'This layering matters for understanding scope: a deployment environment that only runs (never compiles) Java only strictly needs a JRE-equivalent runtime, while development machines need the full JDK.',
    seniorAnswer:
      'Modern distributions have blurred this somewhat (a standalone JRE download is less common now than it used to be), but the conceptual layering is still the correct mental model and the one interviewers expect.',
    keyTerms: ['JVM', 'JRE', 'JDK', 'javac'],
    conceptsTested: ['Basic terminology precision'],
    relatedTopics: ['jvm'],
    followUps: ['q-class-loading'],
    commonMistakes: ['Using the three terms interchangeably'],
    strongAnswerKeywords: ['execution engine', 'core libraries', 'development tools', 'javac'],
    interviewerIntent: 'A calibration question — checks foundational precision before going deeper.',
    whatIsBeingTested: ['Foundational terminology accuracy'],
  },
  {
    id: 'q-heap-vs-stack',
    question: 'What is the difference between heap and stack memory in Java?',
    category: 'JVM',
    difficulty: 'beginner',
    quickAnswer: 'Stack holds per-thread method frames and locals, freed automatically on return; heap holds all objects, shared and GC-managed.',
    interviewAnswer:
      'Each thread has its own stack made of frames, one per active method call, holding local variables and references; a frame is popped (and everything in it freed) the instant its method returns. The heap is one shared area holding every object, cleaned up by the garbage collector once nothing reachable references an object anymore.',
    detailedAnswer:
      'A reference-type local variable stores a pointer on the stack to an object that actually lives on the heap — passing an object to a method copies the reference, not the object.',
    seniorAnswer:
      'This distinction directly drives production diagnosis: StackOverflowError points at call depth/recursion on a single thread, while heap growth or long GC pauses point at object lifetime/reachability across the whole application — different symptoms, different tools (thread dump vs. heap dump/JFR).',
    keyTerms: ['stack frame', 'heap', 'reachability', 'StackOverflowError'],
    conceptsTested: ['Memory area distinction', 'diagnostic implications'],
    relatedTopics: ['heap-vs-stack'],
    followUps: ['q-memory-leak-causes', 'q-garbage-collectors-overview'],
    commonMistakes: ['Confusing StackOverflowError with OutOfMemoryError as the same category of problem'],
    strongAnswerKeywords: ['per-thread stack', 'shared heap', 'reachability', 'StackOverflowError vs OutOfMemoryError'],
    interviewerIntent: 'Checks whether you can connect the conceptual model to real diagnostic decisions.',
    whatIsBeingTested: ['Conceptual model tied to practical diagnosis'],
  },
  {
    id: 'q-garbage-collectors-overview',
    question: 'What garbage collectors does the JVM offer, and how would you choose one?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'G1 (balanced default), ZGC and Shenandoah (very low pause, some throughput/memory cost) — chosen by latency vs throughput requirements.',
    interviewAnswer:
      'G1 is the long-standing default, balancing throughput and pause time for most general-purpose workloads. ZGC and Shenandoah are designed for very low, largely heap-size-independent pause times, at the cost of somewhat higher CPU/memory overhead — appropriate for latency-sensitive services where multi-hundred-millisecond pauses are unacceptable.',
    detailedAnswer:
      'The choice should be workload-driven and ideally validated by measurement (GC logs, JFR) under realistic load, not chosen speculatively — "lowest pause time" isn\u2019t automatically "best" if the workload is throughput-oriented and can tolerate occasional longer pauses.',
    seniorAnswer:
      'A senior answer connects collector choice to an actual SLA: e.g. "our p99 latency budget is 50ms, so G1\u2019s occasional longer pauses were unacceptable, and we moved to ZGC after validating throughput impact under production-like load" — versus a generic "we picked the newest one."',
    keyTerms: ['G1', 'ZGC', 'Shenandoah', 'pause time', 'throughput'],
    conceptsTested: ['Collector trade-off awareness', 'measurement-driven decision making'],
    relatedTopics: ['garbage-collection'],
    followUps: ['q-memory-leak-causes'],
    commonMistakes: ['Naming a collector as universally "the best" without a workload context'],
    strongAnswerKeywords: ['G1', 'ZGC', 'Shenandoah', 'pause time', 'throughput trade-off'],
    interviewerIntent: 'Tests whether GC choice is treated as an engineering trade-off, not a trivia fact.',
    whatIsBeingTested: ['Trade-off reasoning', 'Production measurement mindset'],
  },
  {
    id: 'q-jit-compilation',
    question: 'What does the JIT compiler actually do, and why might a Java program get faster the longer it runs?',
    category: 'JVM',
    difficulty: 'intermediate',
    quickAnswer: 'It profiles hot methods at runtime and compiles them to native machine code, while cold code stays interpreted.',
    interviewAnswer:
      'The JVM initially interprets bytecode. As it runs, it profiles which methods are called frequently ("hot") and compiles those specifically to optimized native machine code — this is why long-running processes often speed up over their first seconds to minutes, as JIT compilation catches up with actual usage.',
    detailedAnswer:
      'This is also why short-lived processes (CLI tools, quick batch jobs, some serverless invocations) never fully benefit from JIT the way a long-running server does — they may finish before hot methods are even identified, let alone compiled.',
    seniorAnswer:
      'Project Leyden\u2019s Ahead-of-Time compilation efforts (e.g. JEP 483 AOT class loading/linking, and follow-on AOT JEPs in 25/26) exist specifically to reduce this warm-up penalty for startup-sensitive workloads, without giving up JIT\u2019s adaptive optimization for long-running processes.',
    keyTerms: ['interpreter', 'hot method', 'JIT', 'warm-up'],
    conceptsTested: ['JIT mechanics', 'startup vs steady-state performance trade-off'],
    relatedTopics: ['jvm'],
    followUps: ['q-jvm-vs-jre-vs-jdk'],
    commonMistakes: ['Claiming all code is compiled to native code immediately at startup'],
    strongAnswerKeywords: ['interpreter', 'hot method', 'profiling', 'warm-up'],
    interviewerIntent: 'Tests understanding of adaptive optimization and its real consequence: warm-up time.',
    whatIsBeingTested: ['JIT mechanics', 'Startup-latency awareness'],
  },
  {
    id: 'q-class-loading',
    question: 'How does class loading work in the JVM?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'Classes are loaded lazily, on first use, through a hierarchy of class loaders, in three stages: loading, linking, and initialization.',
    interviewAnswer:
      'A class is loaded the first time it\u2019s actually needed, not eagerly at startup. Loading reads the .class bytes (via the bootstrap, platform, or application class loader, or a custom loader); linking verifies the bytecode and resolves references; initialization runs static initializers and static field assignments.',
    detailedAnswer:
      'Class loaders form a hierarchy, and by default use a delegation model — a loader asks its parent to load a class before trying itself — which is part of what keeps core JDK classes from being accidentally shadowed by application code.',
    seniorAnswer:
      'Class loader leaks (e.g. a web application redeployed repeatedly without its old classloader being fully released, because something still references a class it loaded) are a classic cause of Metaspace growth in long-running application servers — distinct from a normal heap leak and diagnosed differently.',
    keyTerms: ['loading', 'linking', 'initialization', 'delegation model'],
    conceptsTested: ['Lazy loading model', 'classloader hierarchy'],
    relatedTopics: ['jvm'],
    followUps: [],
    commonMistakes: ['Assuming all classes load eagerly when the JVM starts'],
    strongAnswerKeywords: ['lazy loading', 'delegation', 'linking', 'initialization'],
    interviewerIntent: 'Tests depth beyond "the JVM loads classes" — the actual staged process and its production implications.',
    whatIsBeingTested: ['Depth of JVM internals knowledge'],
  },
  {
    id: 'q-memory-leak-causes',
    question: 'How can a Java program leak memory if it has garbage collection?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'By keeping objects reachable longer than intended — GC only reclaims what\u2019s unreachable, so an unintended live reference is not a bug the GC can fix.',
    interviewAnswer:
      'A "leak" in Java almost always means something is still reachable that shouldn\u2019t be — a classic example is a static collection (like a cache) that entries are added to but never removed from, so it grows indefinitely even though every individual object would otherwise be eligible for collection.',
    detailedAnswer:
      'Other common causes: listeners/callbacks registered but never unregistered, ThreadLocal values not cleared in pooled-thread environments (the thread survives, so does the value), and classloader leaks in redeploy scenarios.',
    seniorAnswer:
      'Diagnosis is evidence-driven: a heap dump analyzed for dominator/retained-size trees usually reveals exactly which reference chain is keeping objects alive, turning "we have a memory leak" into "this specific static map is holding N objects that should have been evicted."',
    keyTerms: ['reachability', 'static references', 'ThreadLocal', 'heap dump'],
    conceptsTested: ['Reachability-based leak model', 'diagnostic approach'],
    relatedTopics: ['garbage-collection', 'heap-vs-stack'],
    followUps: ['q-garbage-collectors-overview'],
    commonMistakes: ['Claiming Java "can\u2019t leak memory because it has a garbage collector"'],
    strongAnswerKeywords: ['reachability', 'unintended references', 'static cache', 'heap dump'],
    interviewerIntent: 'Tests whether you understand GC correctness (it does exactly what it promises) vs. application-level reachability mistakes.',
    whatIsBeingTested: ['Correct mental model of what GC guarantees', 'Diagnostic reasoning'],
  },
];

/* --------------------------------------------------------------- Java 8+ */

const java8Questions: InterviewQuestion[] = [
  {
    id: 'q-lambda-vs-anonymous-class',
    question: 'What is the difference between a lambda expression and an anonymous class?',
    category: 'Java 8+',
    difficulty: 'beginner',
    quickAnswer: 'A lambda is shorthand syntax specifically for implementing a functional interface, with lower overhead and no separate "this."',
    interviewAnswer:
      'Both can implement a single-method interface, but a lambda is far more concise and, critically, "this" inside a lambda refers to the enclosing instance, not the lambda itself (unlike an anonymous class, where "this" refers to the anonymous instance). Lambdas are also implemented more efficiently at the bytecode level (via invokedynamic) rather than generating a new class file per usage site.',
    detailedAnswer:
      'An anonymous class can implement an interface with multiple methods or extend a class; a lambda can only target a functional interface (exactly one abstract method).',
    seniorAnswer:
      'The "this" difference is a real, occasionally interview-relevant gotcha: code that relied on an anonymous class\u2019s own "this" to reference itself (e.g. for removing a listener) behaves differently if naively converted to a lambda.',
    keyTerms: ['functional interface', 'this binding', 'invokedynamic'],
    conceptsTested: ['Lambda vs anonymous class semantics', 'this binding difference'],
    relatedTopics: ['lambda'],
    followUps: ['q-functional-interface'],
    commonMistakes: ['Saying they are "basically the same thing, just shorter syntax"'],
    strongAnswerKeywords: ['functional interface', 'this binding', 'single abstract method'],
    interviewerIntent: 'Tests whether you know the semantic difference, not just the syntactic one.',
    whatIsBeingTested: ['Precision beyond surface syntax'],
  },
  {
    id: 'q-functional-interface',
    question: 'What is a functional interface, and how does the compiler know which one a lambda implements?',
    category: 'Java 8+',
    difficulty: 'beginner',
    quickAnswer: 'An interface with exactly one abstract method; the compiler infers the target type from context (target typing).',
    interviewAnswer:
      'A functional interface declares exactly one abstract method (it may have any number of default/static methods). The @FunctionalInterface annotation isn\u2019t required but documents intent and causes a compile error if the interface doesn\u2019t actually qualify. The compiler determines which functional interface a lambda implements from its target context — the declared type of the variable, parameter, or return type it\u2019s being assigned to.',
    detailedAnswer:
      'java.util.function ships a large set of general-purpose functional interfaces (Function, Predicate, Supplier, Consumer, BiFunction, ...) so most code doesn\u2019t need to declare its own.',
    seniorAnswer:
      'Overload resolution with multiple structurally-compatible functional interface parameters can occasionally produce ambiguous-target-type compile errors — worth knowing this exists so it doesn\u2019t look like a compiler bug when it happens.',
    keyTerms: ['single abstract method', 'target typing', '@FunctionalInterface', 'java.util.function'],
    conceptsTested: ['Functional interface definition', 'target-type inference'],
    relatedTopics: ['lambda'],
    followUps: [],
    commonMistakes: ['Saying @FunctionalInterface is required for a lambda to work'],
    strongAnswerKeywords: ['single abstract method', 'target typing', 'java.util.function'],
    interviewerIntent: 'Checks precise understanding of how the compiler resolves lambda types.',
    whatIsBeingTested: ['Type-inference mechanics understanding'],
  },
  {
    id: 'q-stream-intermediate-vs-terminal',
    question: 'What is the difference between an intermediate and a terminal stream operation?',
    category: 'Java 8+',
    difficulty: 'intermediate',
    quickAnswer: 'Intermediate operations (filter, map) are lazy and return a new stream; a terminal operation (collect, forEach) actually triggers traversal.',
    interviewAnswer:
      'Calling filter() or map() just builds up a description of the pipeline — no data is touched yet. Only when a terminal operation like collect(), forEach(), or reduce() is called does the stream actually pull elements from the source and run them through every intermediate step, one element at a time.',
    detailedAnswer:
      'This laziness is what allows optimizations like short-circuiting (findFirst(), anyMatch() can stop early without processing the whole source) and fusing multiple intermediate operations into a single pass.',
    seniorAnswer:
      'A stream can only be traversed once — calling a terminal operation "uses it up"; attempting to reuse the same stream instance afterward throws IllegalStateException, which is a frequent gotcha for anyone treating a Stream like a reusable Collection.',
    keyTerms: ['intermediate operation', 'terminal operation', 'laziness', 'short-circuiting'],
    conceptsTested: ['Lazy evaluation model', 'single-use nature of streams'],
    relatedTopics: ['stream'],
    followUps: ['q-stream-laziness'],
    commonMistakes: ['Assuming filter()/map() execute immediately when called'],
    strongAnswerKeywords: ['lazy', 'terminal operation triggers execution', 'single-use'],
    interviewerIntent: 'Tests understanding of the lazy pipeline model, the core idea behind the whole Streams API.',
    whatIsBeingTested: ['Lazy evaluation mental model'],
  },
  {
    id: 'q-optional-purpose-misuse',
    question: 'What is Optional for, and how is it commonly misused?',
    category: 'Java 8+',
    difficulty: 'beginner',
    quickAnswer: 'A return-type wrapper making "might be absent" explicit — misused as a field type, parameter type, or as a null substitute everywhere.',
    interviewAnswer:
      'Optional<T> is meant for method return types where "no result" is a normal, expected outcome, forcing callers to handle absence explicitly (map/orElse/orElseThrow) instead of risking a surprise NullPointerException. It\u2019s explicitly not recommended as a field type, a method parameter type, or inside collections — those uses add indirection without the main benefit and Optional isn\u2019t even Serializable.',
    detailedAnswer:
      'A common related mistake is calling .get() unconditionally, which just swaps NullPointerException for NoSuchElementException without actually improving safety — the point of Optional is the functional-style handling methods, not .get().',
    seniorAnswer:
      'orElseThrow(Supplier) is often the most production-useful method: it lets you convert "absent" into a specific, meaningful, contextual exception exactly at the point where absence is discovered, rather than a generic failure surfacing later.',
    keyTerms: ['return-type wrapper', 'orElse', 'orElseThrow', 'not for fields/parameters'],
    conceptsTested: ['Intended use case', 'common anti-patterns'],
    relatedTopics: ['optional'],
    followUps: [],
    commonMistakes: ['Suggesting Optional fields are a good general practice'],
    strongAnswerKeywords: ['return type', 'explicit absence', 'not a field type', 'orElseThrow'],
    interviewerIntent: 'Tests whether you know Optional\u2019s intended scope, since misuse is extremely common in real codebases.',
    whatIsBeingTested: ['API usage judgment, not just API existence'],
  },
  {
    id: 'q-stream-laziness',
    question: 'Why are intermediate stream operations lazy, and what would break if they weren\u2019t?',
    category: 'Java 8+',
    difficulty: 'intermediate',
    quickAnswer: 'Laziness lets the pipeline be optimized and short-circuited as a whole; eager evaluation would process every element through every stage regardless of whether the result was even needed.',
    interviewAnswer:
      'If filter() or map() executed immediately, calling findFirst() after a chain of operations would still have to fully materialize an intermediate result at every stage for the entire source, even though you only wanted the first matching element. Laziness lets the whole pipeline run element-by-element and stop as soon as a short-circuiting terminal operation (like findFirst() or anyMatch()) is satisfied.',
    detailedAnswer:
      'This also means side effects inside intermediate lambdas can be surprising — they simply never run at all until (and unless) a terminal operation drives traversal, which trips people up when debugging with print statements inside a map() they assumed would always execute.',
    seniorAnswer:
      'This is also exactly why streams are described as fusing operations into a single pass conceptually — well-optimized JIT-compiled stream pipelines can often avoid materializing intermediate collections entirely, unlike a naive chain of List.stream().filter().collect().stream().map().collect() rewritten by hand.',
    keyTerms: ['laziness', 'short-circuiting', 'single-pass execution'],
    conceptsTested: ['Rationale behind laziness, not just the fact of it'],
    relatedTopics: ['stream'],
    followUps: ['q-stream-intermediate-vs-terminal'],
    commonMistakes: ['Describing laziness without connecting it to short-circuiting or single-pass execution'],
    strongAnswerKeywords: ['short-circuit', 'single pass', 'terminal operation drives execution'],
    interviewerIntent: 'Pushes past "streams are lazy" into why that design choice matters.',
    whatIsBeingTested: ['Ability to reason about design rationale, not just recall a fact'],
  },
  {
    id: 'q-map-vs-flatmap',
    question: 'What is the difference between Stream.map() and Stream.flatMap()?',
    category: 'Java 8+',
    difficulty: 'intermediate',
    quickAnswer: 'map() transforms each element one-to-one; flatMap() transforms each element into a stream and flattens all of those streams into one.',
    interviewAnswer:
      'map(Function<T,R>) produces exactly one R for every T — a Stream<List<String>> mapped with a function returning a List stays a Stream<List<String>>. flatMap(Function<T, Stream<R>>) expects each element to produce its own stream, and concatenates all of those streams into a single flat Stream<R> — turning a "stream of lists" into a single "stream of the lists\u2019 elements."',
    detailedAnswer:
      'A common real use: given a List<Order> where each Order has a List<LineItem>, orders.stream().flatMap(o -> o.getLineItems().stream()) produces a single flat Stream<LineItem> across every order, which map() alone cannot do without an extra manual flattening step.',
    seniorAnswer:
      'Reaching for flatMap() correctly is a good signal in an interview because it shows comfort with "nested collection" problems, which come up constantly in real data-shaping code (e.g. flattening a Map<Account, List<Transaction>> into all transactions).',
    keyTerms: ['one-to-one mapping', 'stream flattening', 'nested collections'],
    conceptsTested: ['map vs flatMap semantics', 'recognizing when flattening is needed'],
    relatedTopics: ['stream'],
    followUps: ['q-collectors-groupingby'],
    commonMistakes: ['Using map() then manually flattening with a loop instead of flatMap()'],
    strongAnswerKeywords: ['one-to-one', 'flatten nested streams', 'Stream<Stream<R>>'],
    interviewerIntent: 'A practical litmus test for real stream fluency beyond filter/map basics.',
    whatIsBeingTested: ['Practical stream API fluency'],
  },
  {
    id: 'q-collectors-groupingby',
    question: 'How would you group a list of objects by a property and count them, using streams?',
    category: 'Java 8+',
    difficulty: 'intermediate',
    quickAnswer: 'Collectors.groupingBy(keyExtractor, Collectors.counting()) — a downstream collector applied per group.',
    interviewAnswer:
      'transactions.stream().collect(Collectors.groupingBy(Transaction::getCurrency, Collectors.counting())) produces a Map<String, Long> — one entry per distinct currency, with the count of transactions in that currency. groupingBy takes a classifier function and, optionally, a downstream collector describing what to do with each group\u2019s elements (counting, summing, mapping, or further collecting into a list).',
    detailedAnswer:
      'Without a downstream collector, groupingBy(classifier) defaults to collecting each group into a List, giving a Map<K, List<T>> — the version most people learn first, before discovering downstream collectors.',
    seniorAnswer:
      'Collectors.groupingBy combined with Collectors.summingDouble/averagingDouble or a custom downstream collector is the idiomatic replacement for what used to be hand-written accumulator-map loops, and is generally both clearer and less bug-prone (no manual "if key not present, initialize" logic).',
    keyTerms: ['Collectors.groupingBy', 'downstream collector', 'Collectors.counting'],
    conceptsTested: ['Practical collector composition'],
    relatedTopics: ['stream'],
    followUps: [],
    commonMistakes: ['Writing a manual loop with a mutable HashMap<K, Integer> accumulator instead of using groupingBy'],
    strongAnswerKeywords: ['groupingBy', 'downstream collector', 'counting'],
    interviewerIntent: 'A hands-on litmus test of practical, idiomatic stream usage rather than theory.',
    whatIsBeingTested: ['Idiomatic, practical API knowledge'],
  },
  {
    id: 'q-checked-exceptions-in-streams',
    question: 'Why can\u2019t you throw a checked exception directly from inside a lambda passed to map() or forEach()?',
    category: 'Java 8+',
    difficulty: 'advanced',
    quickAnswer: 'Because the functional interfaces streams use (Function, Consumer, ...) don\u2019t declare any checked exceptions in their method signatures.',
    interviewAnswer:
      'Function<T,R>.apply() and Consumer<T>.accept() are declared without a "throws" clause, so a lambda implementing them cannot throw a checked exception without wrapping it — the compiler enforces this the same way it would for any interface method override. The common workarounds are catching and rethrowing as an unchecked exception, or wrapping the checked-exception-throwing call in a small helper that does that translation.',
    detailedAnswer:
      'This is a deliberate consequence of how functional interfaces are defined in java.util.function, not a stream-specific limitation — the same restriction applies to any lambda targeting one of those interfaces, stream or not.',
    seniorAnswer:
      'Some teams introduce their own throwing-functional-interface variants (e.g. a CheckedFunction<T, R, E extends Exception>) specifically to keep call sites clean, but the pragmatic default is usually just wrapping the checked exception in an unchecked one at the boundary.',
    keyTerms: ['checked exception', 'functional interface signature', 'exception wrapping'],
    conceptsTested: ['Interaction between checked exceptions and functional interfaces'],
    relatedTopics: ['stream', 'lambda'],
    followUps: [],
    commonMistakes: ['Assuming this is a stream-specific limitation rather than a general functional-interface one'],
    strongAnswerKeywords: ['no throws clause', 'functional interface signature', 'wrap as unchecked'],
    interviewerIntent: 'Tests whether you understand this as a type-system consequence, not an arbitrary stream restriction.',
    whatIsBeingTested: ['Understanding of checked-exception/functional-interface interaction'],
  },
];

export const javaQuestions: InterviewQuestion[] = [
  ...collectionsQuestions,
  ...concurrencyQuestions,
  ...jvmQuestions,
  ...java8Questions,
];

export function getQuestionById(id: string) {
  return javaQuestions.find((q) => q.id === id);
}

export const questionCategories = ['Collections', 'Concurrency', 'JVM', 'Java 8+'] as const;
