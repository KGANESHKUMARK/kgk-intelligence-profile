import type { InterviewQuestion } from '../../../types';

/** Experienced-level JVM memory, GC and production-diagnostics questions. */
export const jvmMemoryQuestions: InterviewQuestion[] = [
  {
    id: 'q-jvm-memory-areas',
    question: 'Walk me through the JVM memory areas. What lives where?',
    category: 'JVM',
    difficulty: 'intermediate',
    quickAnswer: 'Heap (Eden, Survivors, Old) for objects; per-thread stacks; Metaspace for class metadata; code cache for JIT code; plus direct/native memory.',
    interviewAnswer: `Shared areas: the heap (young gen = Eden + S0 + S1, and old gen) holds every object, array, the String pool and static field values; Metaspace (native memory) holds class metadata; the code cache holds JIT-compiled code. Per-thread areas: the JVM stack (one frame per method call with locals and operand stack), the PC register and the native method stack. Outside all of these, direct ByteBuffers and native libraries use native memory.`,
    detailedAnswer: `New objects go to Eden via TLABs; minor GC copies survivors between S0/S1 and ages them; long-lived objects are promoted to old gen. Primitive locals and references live in stack frames, the objects they reference live on the heap. Since Java 8 PermGen is gone — class metadata moved to native Metaspace and interned strings/statics are in the heap.`,
    seniorAnswer: `In production the key insight is that RSS = heap + metaspace + threads × Xss + code cache + direct buffers + GC structures. That is why containers get OOMKilled with a healthy heap. I size heap with MaxRAMPercentage around 65–75%, cap metaspace, and use Native Memory Tracking when the numbers do not add up.`,
    keyTerms: ['Eden', 'Survivor', 'Old Gen', 'Metaspace', 'Code Cache', 'stack frame', 'direct memory'],
    conceptsTested: ['runtime data areas', 'heap generations', 'native vs heap memory'],
    relatedTopics: ['jvm-memory-areas', 'heap-vs-stack', 'metaspace'],
    followUps: ['q-jvm-young-old-promotion', 'q-jvm-permgen-vs-metaspace', 'q-jvm-container-heap-sizing'],
    commonMistakes: ['Saying static variables live on the stack', 'Placing the String pool in PermGen on Java 8+', 'Ignoring non-heap memory'],
    strongAnswerKeywords: ['Eden', 'Survivor', 'Old', 'Metaspace', 'native', 'code cache', 'per-thread'],
    codeExample: `public class WhereDoesItLive {
    static int counter = 0;              // value stored with the Class object -> heap
    int field = 1;                       // part of each instance -> heap

    void run() {
        int local = 42;                  // primitive local -> this thread's stack frame
        StringBuilder sb = new StringBuilder("hi"); // reference on stack, object on heap
        String lit = "hello";            // literal from the String pool -> heap
        counter++;
        System.out.println(local + " " + sb + " " + lit + " " + counter);
    }

    public static void main(String[] args) {
        new WhereDoesItLive().run();     // class metadata for WhereDoesItLive -> Metaspace
    }
}`,
    expectedOutput: '42 hi hello 1',
    interviewerIntent: 'Checks whether you have a precise mental model of memory beyond "heap and stack", which is the foundation for any production memory debugging.',
    whatIsBeingTested: ['Precise placement of objects, primitives, statics, metadata', 'Awareness of post-Java-8 changes', 'Understanding of process footprint'],
  },
  {
    id: 'q-jvm-young-old-promotion',
    question: 'How does an object move from Eden to the Old Generation, and what is premature promotion?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'Allocated in Eden, copied between survivor spaces on each minor GC while its age increases, promoted to old gen at the tenuring threshold or when survivors overflow.',
    interviewAnswer: `Objects are allocated in Eden. When Eden fills, a minor (young) GC marks live objects from GC roots and copies them into the empty Survivor space, incrementing their age; Eden and the other survivor are then reclaimed wholesale. After surviving enough cycles (the tenuring threshold, max 15) an object is promoted to old gen. If Survivor space is too small to hold all live young objects, they are promoted early — premature promotion — which fills old gen with objects that would have died young and triggers expensive old-gen collections.`,
    detailedAnswer: `The generational hypothesis — most objects die young — is why minor GCs are cheap: cost is proportional to LIVE objects, not to Eden size. Premature promotion shows up in GC logs as rapidly growing old gen and frequent mixed/full GCs. Causes: very high allocation rate, undersized young gen, or large objects (G1 humongous allocations go straight into old regions).`,
    seniorAnswer: `With G1 I avoid pinning young-gen size (-Xmn) because it disables G1's adaptive pause-time sizing. Instead I reduce allocation rate and, if needed, raise the pause target or heap. I also watch for humongous allocations (objects ≥ half a region, e.g. large byte[] buffers) and increase -XX:G1HeapRegionSize if they dominate.`,
    keyTerms: ['minor GC', 'tenuring threshold', 'survivor space', 'promotion', 'humongous object'],
    conceptsTested: ['generational GC', 'copying collection', 'GC log interpretation'],
    relatedTopics: ['garbage-collection', 'jvm-memory-areas', 'gc-tuning'],
    followUps: ['q-jvm-gc-choice', 'q-jvm-memory-areas'],
    commonMistakes: ['Saying minor GC cost depends on Eden size', 'Not knowing that survivor overflow causes early promotion'],
    strongAnswerKeywords: ['Eden', 'survivor', 'age', 'tenuring threshold', 'premature promotion'],
    codeExample: `# Observe ages and promotion in GC logs (JDK 21)
java -Xmx512m -XX:+UseG1GC -Xlog:gc+age=trace -Xlog:gc+heap=debug -jar app.jar

# Sample excerpt
# [gc,age] Desired survivor size 4194304 bytes, new threshold 15 (max threshold 15)
# [gc,age] - age   1:    1048576 bytes,    1048576 total
# [gc,age] - age   2:     524288 bytes,    1572864 total
# [gc,heap] Eden regions: 25->0(25)  Survivor regions: 2->3(4)  Old regions: 10->11`,
    codeLanguage: 'Shell',
    interviewerIntent: 'Distinguishes candidates who have read GC logs from those who only memorised "young and old generation".',
    whatIsBeingTested: ['Generational GC mechanics', 'Cause/effect of premature promotion', 'Practical tuning restraint'],
  },
  {
    id: 'q-jvm-permgen-vs-metaspace',
    question: 'What is the difference between PermGen and Metaspace? Why was PermGen removed?',
    category: 'JVM',
    difficulty: 'intermediate',
    quickAnswer: 'PermGen was a fixed-size heap region for class metadata; Java 8 replaced it with Metaspace in native memory that grows dynamically.',
    interviewAnswer: `PermGen was part of the heap with a fixed maximum (-XX:MaxPermSize), holding class metadata, interned strings (until Java 7) and static data. It was hard to size and caused "OutOfMemoryError: PermGen space", especially with app-server redeploys. Java 8 (JEP 122) removed it: class metadata now lives in Metaspace, allocated from native memory and growing as needed, while interned strings and statics live in the normal heap.`,
    detailedAnswer: `Metaspace can be capped with -XX:MaxMetaspaceSize; -XX:MetaspaceSize is the threshold that triggers the first metaspace GC, not an initial size. Class metadata is freed when its ClassLoader becomes unreachable. The removal also simplified merging HotSpot with JRockit, which never had PermGen.`,
    seniorAnswer: `Removing PermGen did not remove class-loader leaks — it just moved the failure from a clear PermGen OOM to potential unbounded native growth. In containers I always cap metaspace so a leak fails with "OutOfMemoryError: Metaspace" instead of an opaque OOMKill.`,
    keyTerms: ['PermGen', 'Metaspace', 'native memory', 'MaxMetaspaceSize', 'class unloading'],
    conceptsTested: ['Java 8 memory changes', 'class metadata lifecycle'],
    relatedTopics: ['metaspace', 'jvm-memory-areas'],
    followUps: ['q-jvm-oom-types', 'q-jvm-string-pool'],
    commonMistakes: ['Saying Metaspace is in the heap', 'Saying Metaspace can never run out'],
    strongAnswerKeywords: ['native memory', 'Java 8', 'class metadata', 'ClassLoader', 'MaxMetaspaceSize'],
    interviewerIntent: 'Checks version awareness and whether you understand that the failure mode changed rather than disappeared.',
    whatIsBeingTested: ['Version history', 'Memory area ownership', 'Operational implications'],
  },
  {
    id: 'q-jvm-oom-types',
    question: 'Name the different kinds of OutOfMemoryError. How would you approach each one?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'Java heap space, GC overhead limit exceeded, Metaspace, Direct buffer memory, unable to create native thread, requested array size exceeds VM limit — each points to a different area and fix.',
    interviewAnswer: `Heap space / GC overhead: too many live objects — heap dump, find the leak or legitimately raise heap. Metaspace: too many classes or a ClassLoader leak — check loaded-class count and classloader stats. Direct buffer memory: off-heap NIO/Netty buffers — check MaxDirectMemorySize and buffer release. Unable to create native thread: thread leak or OS/container limits — thread dump, count threads, fix unbounded thread creation. Requested array size exceeds VM limit: a bug computing a huge array size.`,
    detailedAnswer: `The message tells you which tool to reach for: heap dump (heap), jcmd VM.classloader_stats (metaspace), Native Memory Tracking (direct/native), thread dump plus ulimit -u / pids.max (threads). Raising -Xmx for a native-thread OOM is counterproductive, as it takes memory away from stacks.`,
    seniorAnswer: `I make every service crash-diagnosable: -XX:+HeapDumpOnOutOfMemoryError to a persistent volume, -XX:+ExitOnOutOfMemoryError so orchestration restarts it, GC logs rotated to disk, and alerts on thread count and old-gen-after-GC. That turns a 3am mystery into a reproducible root cause the next morning.`,
    keyTerms: ['Java heap space', 'GC overhead limit exceeded', 'Metaspace', 'Direct buffer memory', 'native thread'],
    conceptsTested: ['OOM classification', 'diagnostic tool selection'],
    relatedTopics: ['out-of-memory-errors', 'metaspace', 'heap-dump-analysis'],
    followUps: ['q-jvm-diagnose-memory-leak', 'q-jvm-container-heap-sizing'],
    commonMistakes: ['Increasing -Xmx for every OOM', 'Catching OOM and continuing'],
    strongAnswerKeywords: ['heap space', 'metaspace', 'direct buffer', 'native thread', 'heap dump'],
    codeExample: `import java.util.concurrent.CountDownLatch;

// Thread leak: each "task" creates a thread that never finishes.
// Eventually: java.lang.OutOfMemoryError: unable to create native thread
public class ThreadLeak {
    public static void main(String[] args) {
        CountDownLatch never = new CountDownLatch(1);
        int created = 0;
        try {
            while (true) {
                new Thread(() -> {
                    try { never.await(); } catch (InterruptedException ignored) { }
                }).start();
                created++;
            }
        } catch (OutOfMemoryError e) {
            System.out.println(e.getMessage() + " after " + created + " threads");
            System.exit(1);
        }
    }
}
// FIX: use a bounded ExecutorService (or virtual threads for blocking I/O work).`,
    expectedOutput: 'unable to create native thread: possibly out of memory or process/resource limits reached after 4073 threads',
    interviewerIntent: 'Tests whether you treat OOM as a family of distinct failures with distinct diagnostics rather than "add more memory".',
    whatIsBeingTested: ['Breadth of JVM failure knowledge', 'Systematic diagnosis', 'Production readiness'],
  },
  {
    id: 'q-jvm-container-heap-sizing',
    question: 'Your Spring Boot pod has a 2Gi memory limit and keeps getting OOMKilled, but there is no OutOfMemoryError. What is happening and how do you size the JVM?',
    category: 'JVM',
    difficulty: 'senior',
    quickAnswer: 'Non-heap memory pushed the process past the cgroup limit. Size heap as a percentage (~70%) of the limit and leave room for metaspace, threads, code cache and direct memory.',
    interviewAnswer: `Exit code 137 / OOMKilled means the kernel killed the process for exceeding the cgroup limit — the JVM never got to throw. If -Xmx is close to 2Gi, heap plus metaspace, thread stacks, code cache, direct buffers and GC structures exceed the limit. Modern JVMs (10+, backported to 8u191) are container-aware, so I use -XX:MaxRAMPercentage=70 (often with InitialRAMPercentage equal) instead of a hard -Xmx, cap MaxMetaspaceSize, reduce thread count or -Xss if needed, and verify with Native Memory Tracking.`,
    detailedAnswer: `Default MaxRAMPercentage is 25%, which wastes memory in a container dedicated to one JVM, so it is usually raised to 60–75%. Requests should equal limits for memory to avoid noisy eviction. Tomcat's default 200 threads × 1MB stack, Netty's pooled direct buffers and Hibernate/Spring metaspace (~100–200MB) are the usual non-heap contributors.`,
    seniorAnswer: `I measure, not guess: run a load test with -XX:NativeMemoryTracking=summary, take jcmd VM.native_memory summary at peak, and set the limit as committed total + 15–20% headroom. I also expose jvm_memory_used by area and container_memory_working_set_bytes in Grafana, so we can see which side is growing before the kernel acts.`,
    keyTerms: ['OOMKilled', 'exit code 137', 'MaxRAMPercentage', 'cgroup', 'Native Memory Tracking'],
    conceptsTested: ['container awareness', 'process footprint', 'Kubernetes resource limits'],
    relatedTopics: ['jvm-memory-areas', 'gc-tuning'],
    followUps: ['q-jvm-memory-areas', 'q-jvm-gc-choice'],
    commonMistakes: ['Setting -Xmx equal to the container limit', 'Assuming OOMKilled means a heap leak', 'Leaving default 25% heap'],
    strongAnswerKeywords: ['cgroup', 'MaxRAMPercentage', 'non-heap', 'NMT', '137'],
    codeExample: `# Dockerfile / Kubernetes env
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:InitialRAMPercentage=70 \\
  -XX:MaxMetaspaceSize=256m -XX:NativeMemoryTracking=summary \\
  -XX:+ExitOnOutOfMemoryError -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps"

# At peak load, inside the pod:
jcmd 1 VM.native_memory summary
# Total: reserved=..., committed=1720MB
# -  Java Heap (committed=1433MB)
# -  Class     (committed=142MB)
# -  Thread    (committed=96MB)
# -  Code      (committed=48MB)
# -  GC        (committed=...)`,
    codeLanguage: 'Shell',
    interviewerIntent: 'A real production scenario that separates people who have operated JVMs in Kubernetes from those who only know -Xmx.',
    whatIsBeingTested: ['Kubernetes + JVM interaction', 'Non-heap awareness', 'Measurement-driven sizing'],
  },
  {
    id: 'q-jvm-gc-choice',
    question: 'G1 vs ZGC vs Parallel GC — how do you choose a garbage collector?',
    category: 'JVM',
    difficulty: 'senior',
    quickAnswer: 'Parallel for throughput/batch, G1 as the balanced default, ZGC/Shenandoah when you need consistently sub-millisecond-to-low-ms pauses on large heaps.',
    interviewAnswer: `Start from the requirement. Batch jobs that only care about total runtime: Parallel GC. Typical web services with moderate latency needs: G1 (default) with a pause target. Latency-sensitive services with large heaps where pauses must stay in the low milliseconds — trading, real-time pricing — ZGC (generational since JDK 21) or Shenandoah, accepting somewhat higher CPU and memory overhead. Tiny containers with one CPU: Serial can be the right choice.`,
    detailedAnswer: `G1 pauses scale with the live data copied per collection; ZGC does marking and relocation concurrently using load barriers, so pause times are largely independent of heap size. The cost is barrier overhead on every reference load and the need for headroom so concurrent collection can keep up with allocation (otherwise "allocation stalls").`,
    seniorAnswer: `I validate a GC change with a load test comparing p99/p999 latency, throughput and CPU — and I check the latency is actually GC-bound first. Many "GC problems" disappear by reducing allocation rate or right-sizing the heap. CMS is gone (removed in JDK 14), so any advice involving it is outdated.`,
    keyTerms: ['G1', 'ZGC', 'Shenandoah', 'Parallel', 'pause time', 'throughput', 'load barrier'],
    conceptsTested: ['collector trade-offs', 'requirement-driven tuning'],
    relatedTopics: ['gc-tuning', 'garbage-collection'],
    followUps: ['q-jvm-young-old-promotion', 'q-jvm-container-heap-sizing'],
    commonMistakes: ['Saying ZGC is always better', 'Recommending CMS', 'No measurement'],
    strongAnswerKeywords: ['throughput', 'latency', 'G1 default', 'ZGC concurrent', 'trade-off'],
    interviewerIntent: 'Looks for trade-off reasoning tied to workload, not a memorised "best GC".',
    whatIsBeingTested: ['Collector characteristics', 'Engineering judgement', 'Measurement discipline'],
  },
  {
    id: 'q-jvm-diagnose-memory-leak',
    question: 'Heap usage in production keeps growing until the service crashes. How do you find the memory leak?',
    category: 'JVM',
    difficulty: 'senior',
    quickAnswer: 'Confirm with old-gen-after-GC trend, take heap dumps, analyse retained size in MAT, follow the path to GC roots, fix the holder.',
    interviewAnswer: `1) Confirm: old-gen occupancy after each GC rises steadily under constant load (GC logs or Micrometer metrics). 2) Capture: jcmd <pid> GC.heap_dump /dumps/heap.hprof, ideally two dumps some minutes apart, or rely on HeapDumpOnOutOfMemoryError. 3) Analyse in Eclipse MAT: Leak Suspects report, dominator tree sorted by retained size, compare histograms between dumps. 4) Path to GC roots on the suspect to find the holder — static collection, cache without eviction, listener, ThreadLocal, unclosed resource. 5) Fix and add a regression test or metric.`,
    detailedAnswer: `Quick, low-impact first step: jcmd <pid> GC.class_histogram twice and diff — growing counts of one class (e.g. a DTO or byte[]) narrow it down before a full dump. Heap dumps pause the JVM and may be gigabytes, so in production capture them from one instance taken out of the load balancer.`,
    seniorAnswer: `Most leaks I have fixed were design issues: an in-memory "cache" that was really an unbounded Map, per-request listener registration, a ThreadLocal in a pooled thread, or a Hibernate session held open across a large batch. The durable fix is bounded structures (Caffeine maximumSize/expireAfterWrite), try-with-resources, and alerts on old-gen-after-GC so we catch growth days before an outage.`,
    keyTerms: ['heap dump', 'MAT', 'retained size', 'dominator tree', 'GC roots', 'class histogram'],
    conceptsTested: ['leak diagnosis process', 'tooling', 'root-cause fixing'],
    relatedTopics: ['heap-dump-analysis', 'out-of-memory-errors'],
    followUps: ['q-jvm-threadlocal-leak', 'q-jvm-reference-types'],
    commonMistakes: ['Restarting without capturing evidence', 'Sorting by shallow size', 'Blaming the GC'],
    strongAnswerKeywords: ['old gen after GC', 'jcmd', 'heap dump', 'retained size', 'path to GC roots'],
    codeExample: `import java.util.ArrayList;
import java.util.List;

public class ListenerLeak {
    interface Listener { void onEvent(String e); }

    static class EventBus {
        private final List<Listener> listeners = new ArrayList<>();
        void register(Listener l) { listeners.add(l); }
        void unregister(Listener l) { listeners.remove(l); }
        int size() { return listeners.size(); }
    }

    static final EventBus BUS = new EventBus();

    static void handleRequest(int id) {
        byte[] requestState = new byte[50_000];
        Listener l = e -> System.out.print(requestState.length > 0 ? "" : e); // captures requestState
        BUS.register(l);
        // ... process ...
        // BUG: missing BUS.unregister(l) -> listener and its 50KB stay reachable forever
    }

    public static void main(String[] args) {
        for (int i = 0; i < 1000; i++) handleRequest(i);
        System.out.println("listeners still registered: " + BUS.size());
    }
}`,
    expectedOutput: 'listeners still registered: 1000',
    interviewerIntent: 'Assesses whether you have a repeatable production debugging method and know where Java leaks actually come from.',
    whatIsBeingTested: ['Systematic diagnosis', 'Tool fluency', 'Recognising leak patterns in code'],
  },
  {
    id: 'q-jvm-threadlocal-leak',
    question: 'How can ThreadLocal cause a memory leak, and how do you use it safely?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'Pooled threads live forever, so values set in a ThreadLocal stay reachable unless you call remove() — always clear it in finally.',
    interviewAnswer: `Each Thread holds a ThreadLocalMap. Entries use a weak reference to the ThreadLocal key but a STRONG reference to the value. In a thread pool (Tomcat workers, executors) threads never die, so a value set during one request stays attached to that thread — leaking memory and, worse, leaking data (e.g. a previous user's security context) into the next request handled by the same thread. The fix is try/finally with threadLocal.remove().`,
    detailedAnswer: `If the ThreadLocal instance itself becomes unreachable, its key is cleared but the value remains until the map happens to expunge stale entries. In app servers, a value whose class came from a web-app ClassLoader also pins that ClassLoader, causing metaspace leaks on redeploy. With virtual threads, ThreadLocals still work but should be avoided for caching expensive objects because you may have millions of threads; ScopedValue (preview in 21, finalized later) is the modern alternative for request-scoped data.`,
    seniorAnswer: `I wrap ThreadLocal usage in a filter or interceptor that sets and clears in finally, so business code cannot forget. Frameworks do the same — Spring's RequestContextHolder and SecurityContextHolder are cleared by filters, and MDC logging context should be cleared the same way, especially when work hops to async executors.`,
    keyTerms: ['ThreadLocal', 'ThreadLocalMap', 'weak key', 'thread pool', 'remove()', 'ScopedValue'],
    conceptsTested: ['ThreadLocal internals', 'pooling side-effects', 'data leakage risk'],
    relatedTopics: ['heap-dump-analysis', 'executorservice', 'virtual-threads'],
    followUps: ['q-jvm-diagnose-memory-leak', 'q-jvm-reference-types'],
    commonMistakes: ['Believing weak keys prevent the leak', 'Not clearing in finally', 'Ignoring data bleed between requests'],
    strongAnswerKeywords: ['strong value reference', 'pooled threads', 'remove()', 'finally'],
    codeExample: `import java.util.concurrent.*;

public class ThreadLocalBleed {
    static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(1); // one reused thread

        pool.submit(() -> CURRENT_USER.set("alice")).get();       // request 1 forgets remove()
        String seen = pool.submit(() -> CURRENT_USER.get()).get(); // request 2, same thread
        System.out.println("request 2 sees: " + seen);

        pool.submit(() -> {
            CURRENT_USER.set("bob");
            try { /* handle request */ } finally { CURRENT_USER.remove(); }
        }).get();
        System.out.println("after safe request: " + pool.submit(CURRENT_USER::get).get());
        pool.shutdown();
    }
}`,
    expectedOutput: 'request 2 sees: alice\nafter safe request: null',
    interviewerIntent: 'Checks deep understanding of ThreadLocal internals plus the security implications in pooled servers.',
    whatIsBeingTested: ['Internals', 'Pooling awareness', 'Safe coding pattern'],
    aiAwareness: {
      strongAnswerShouldMention: ['value is strongly referenced', 'thread pools reuse threads', 'remove() in finally', 'data bleed'],
      weakAnswer: 'ThreadLocal uses weak references so it cannot leak.',
      redFlags: ['Claims weak references solve it', 'No mention of finally'],
      likelyFollowUp: ['Why is the second output still alice?', 'How do virtual threads change this?', 'What is ScopedValue?'],
    },
  },
  {
    id: 'q-jvm-reference-types',
    question: 'Explain strong, soft, weak and phantom references. When would you use each?',
    category: 'JVM',
    difficulty: 'advanced',
    quickAnswer: 'Strong: never collected while reachable. Soft: collected under memory pressure. Weak: collected at next GC. Phantom: post-mortem cleanup notification.',
    interviewAnswer: `A strong reference (normal variable) keeps an object alive. A SoftReference is cleared only when the JVM needs memory — historically used for memory-sensitive caches. A WeakReference is cleared at the next GC once no strong references remain — used for canonicalising maps and metadata keyed by objects you do not own (WeakHashMap). A PhantomReference is enqueued after the object is finalized-equivalent and can never be dereferenced — used for resource cleanup, which java.lang.ref.Cleaner wraps as the modern replacement for finalize().`,
    detailedAnswer: `WeakHashMap holds keys weakly but values strongly; if the value references its own key, the entry never clears. String literals are interned and strongly reachable, so they make poor WeakHashMap keys. Soft-reference caches give unpredictable eviction and can increase GC pressure; a size-bounded cache is usually better.`,
    seniorAnswer: `In production code I almost never hand-roll Soft/Weak caches; I use Caffeine with explicit size/time bounds and metrics. Weak references remain valuable in framework code (listeners, class metadata caches) to avoid pinning objects and ClassLoaders, and Cleaner is the right tool for releasing native resources.`,
    keyTerms: ['SoftReference', 'WeakReference', 'PhantomReference', 'ReferenceQueue', 'WeakHashMap', 'Cleaner'],
    conceptsTested: ['reachability levels', 'cache design', 'resource cleanup'],
    relatedTopics: ['garbage-collection', 'heap-dump-analysis'],
    followUps: ['q-jvm-diagnose-memory-leak'],
    commonMistakes: ['Thinking WeakHashMap values are weak', 'Using soft references as a primary cache strategy'],
    strongAnswerKeywords: ['reachability', 'memory pressure', 'next GC', 'ReferenceQueue', 'Cleaner'],
    codeExample: `import java.lang.ref.WeakReference;

public class WeakDemo {
    public static void main(String[] args) throws InterruptedException {
        Object strong = new Object();
        WeakReference<Object> weak = new WeakReference<>(strong);

        System.gc();
        System.out.println("while strongly reachable: " + (weak.get() != null));

        strong = null;          // drop the only strong reference
        System.gc();            // a hint, but HotSpot honours it by default
        Thread.sleep(100);
        System.out.println("after GC: " + (weak.get() != null));
    }
}`,
    expectedOutput: 'while strongly reachable: true\nafter GC: false',
    interviewerIntent: 'Checks reachability understanding beyond "GC deletes unused objects" and practical cache judgement.',
    whatIsBeingTested: ['Reference semantics', 'WeakHashMap pitfalls', 'Modern alternatives'],
  },
  {
    id: 'q-jvm-string-pool',
    question: 'Where is the String pool, and what does this code print?',
    category: 'JVM',
    difficulty: 'intermediate',
    quickAnswer: 'In the heap since Java 7. Literals are pooled; new String() creates a separate object; intern() returns the pooled instance.',
    interviewAnswer: `String literals are interned into the String pool, which has been in the main heap since Java 7 (it was in PermGen before). Two identical literals refer to the same object, so == is true. new String("x") always creates a new heap object, so == against the literal is false, while equals() compares content. intern() returns the canonical pooled instance. Compile-time constant concatenation ("a" + "b") is folded by javac into a single literal, but runtime concatenation with a variable creates a new String.`,
    detailedAnswer: `Moving the pool to the heap means interned strings are garbage-collected like any other object and the pool size is tunable with -XX:StringTableSize. G1 also offers -XX:+UseStringDeduplication, which deduplicates the backing byte arrays of equal strings without changing identity.`,
    seniorAnswer: `Never use == for String comparison in business code — identity depends on how the string was produced. Interning millions of unique values (e.g. IDs from a feed) can bloat the StringTable; prefer deduplication or a bounded canonicalisation map if memory analysis shows duplicate strings dominating.`,
    keyTerms: ['String pool', 'intern()', 'compile-time constant', '== vs equals', 'string deduplication'],
    conceptsTested: ['String identity vs equality', 'Java 7 memory change', 'constant folding'],
    relatedTopics: ['jvm-memory-areas', 'equals'],
    followUps: ['q-jvm-memory-areas'],
    commonMistakes: ['Saying the pool is in PermGen/Metaspace', 'Using == for strings'],
    strongAnswerKeywords: ['heap', 'Java 7', 'intern', 'constant folding', 'equals'],
    codeExample: `public class StringPool {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        String d = c.intern();
        final String part = "ja";
        String e = part + "va";       // compile-time constant (part is final) -> folded
        String var = "ja";
        String f = var + "va";        // runtime concatenation -> new object

        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(c));
        System.out.println(a == d);
        System.out.println(a == e);
        System.out.println(a == f);
    }
}`,
    expectedOutput: 'true\nfalse\ntrue\ntrue\ntrue\nfalse',
    interviewerIntent: 'A classic output-prediction question that tests identity vs equality and compile-time behaviour.',
    whatIsBeingTested: ['String interning', 'Constant folding', 'Memory location knowledge'],
  },
  {
    id: 'q-jvm-stackoverflow-recursion',
    question: 'This recursive method throws StackOverflowError on deep input. Why, and how do you fix it?',
    category: 'JVM',
    difficulty: 'intermediate',
    quickAnswer: 'Each call pushes a frame onto the thread stack; deep recursion exhausts -Xss. Convert to iteration (explicit stack) or bound the depth.',
    interviewAnswer: `Every method call pushes a frame with its locals onto the calling thread's stack, whose size is fixed by -Xss. Recursion depth proportional to input size (a long linked list, deeply nested JSON, a degenerate tree) eventually exceeds it and throws StackOverflowError. Java does not perform tail-call optimisation, so even tail-recursive code still grows the stack. The robust fix is an iterative algorithm, using an explicit Deque when you need a stack; raising -Xss only moves the limit.`,
    detailedAnswer: `StackOverflowError is an Error, not an OutOfMemoryError, and it concerns one thread only — the heap may be almost empty. Frame size depends on the number of locals and the JIT, so the maximum depth is not a fixed number.`,
    seniorAnswer: `Any recursion over untrusted input is a denial-of-service vector — e.g. parsing attacker-controlled nested structures. Libraries like Jackson add nesting-depth limits for exactly this reason (StreamReadConstraints). I prefer iterative traversal or explicit depth limits on external input.`,
    keyTerms: ['StackOverflowError', 'stack frame', '-Xss', 'tail call', 'iteration'],
    conceptsTested: ['call stack mechanics', 'recursion to iteration'],
    relatedTopics: ['heap-vs-stack', 'out-of-memory-errors'],
    followUps: ['q-jvm-oom-types'],
    commonMistakes: ['Calling it an OutOfMemoryError', 'Assuming Java optimises tail recursion'],
    strongAnswerKeywords: ['frame per call', '-Xss', 'no TCO', 'iterative', 'explicit stack'],
    codeExample: `public class SumDepth {
    // Recursive: depth = n frames
    static long sumRec(int n) { return n == 0 ? 0 : n + sumRec(n - 1); }

    // Iterative: constant stack usage
    static long sumIter(int n) {
        long total = 0;
        for (int i = 1; i <= n; i++) total += i;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sumIter(1_000_000));
        try {
            System.out.println(sumRec(1_000_000));
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError");
        }
    }
}`,
    expectedOutput: '500000500000\nStackOverflowError',
    interviewerIntent: 'Checks understanding of the call stack and whether you can refactor recursion safely.',
    whatIsBeingTested: ['Stack mechanics', 'Refactoring skill', 'Input-driven risk awareness'],
  },
  {
    id: 'q-jvm-high-cpu',
    question: 'A Java service is at 100% CPU in production. Walk me through how you find the cause.',
    category: 'JVM',
    difficulty: 'senior',
    quickAnswer: 'Check GC first; then top -H to find the hot thread, convert its TID to hex, match nid in several thread dumps, or use async-profiler/JFR flame graphs.',
    interviewAnswer: `First check GC logs/metrics — constant GC means a memory problem. Otherwise: top -H -p <pid> to find the hottest OS threads; printf '%x' <tid> to get the hex id; take 3–5 thread dumps a few seconds apart with jcmd <pid> Thread.print; find the thread with nid=0x<hex> and see which frames it is always executing. For aggregate hotspots, run async-profiler (asprof -e cpu -d 30) or dump a JFR recording and read the flame graph. Typical culprits: infinite loops, catastrophic regex backtracking, busy-wait/retry loops without backoff, heavy JSON/XML serialisation, or log statements building huge strings.`,
    detailedAnswer: `Thread states matter: RUNNABLE threads consume CPU; BLOCKED threads indicate lock contention (which causes latency rather than CPU); many WAITING threads on a pool queue suggest starvation. jstack prints Java-level deadlocks explicitly. In containers, CPU throttling (cgroup cpu quota) can also look like slowness without high CPU inside the pod.`,
    seniorAnswer: `I keep JFR running continuously with a small ring buffer so the evidence already exists when an incident starts, and make sure images include jcmd. After fixing, I add a guard: input limits for regex, backoff with jitter for retries, and a metric or alert on CPU per pod plus thread-state counts.`,
    keyTerms: ['top -H', 'nid', 'thread dump', 'jcmd', 'async-profiler', 'JFR', 'flame graph'],
    conceptsTested: ['production triage', 'thread dump reading', 'profiling'],
    relatedTopics: ['high-cpu-diagnosis', 'gc-tuning'],
    followUps: ['q-jvm-diagnose-memory-leak'],
    commonMistakes: ['Single dump only', 'Not converting TID to hex', 'Skipping the GC check'],
    strongAnswerKeywords: ['GC first', 'top -H', 'hex', 'nid', 'multiple dumps', 'flame graph'],
    codeExample: `import java.util.regex.Pattern;

public class CatastrophicRegex {
    // Nested quantifier: exponential backtracking on a non-matching input
    static final Pattern BAD = Pattern.compile("^(a+)+$");
    // Equivalent and linear: possessive quantifier, no backtracking into the group
    static final Pattern GOOD = Pattern.compile("^a++$");

    public static void main(String[] args) {
        String input = "a".repeat(28) + "!";
        long t = System.nanoTime();
        System.out.println("good: " + GOOD.matcher(input).matches()
                + " in " + (System.nanoTime() - t) / 1_000_000 + " ms");
        // BAD.matcher(input).matches() would pin a core for seconds to minutes.
    }
}`,
    expectedOutput: 'good: false in 0 ms',
    interviewerIntent: 'A practical incident question — the interviewer wants a calm, ordered procedure and tool fluency.',
    whatIsBeingTested: ['Triage order', 'Tooling', 'Common CPU anti-patterns'],
  },
];
