import type { LearningTopic } from '../../../types';

/**
 * JVM MEMORY DEEP DIVE — runtime data areas, metaspace, OOM types, GC tuning
 * and the production diagnostics (heap dumps, thread dumps, high CPU) that
 * experienced-level interviews always reach.
 */
export const jvmMemoryTopics: LearningTopic[] = [
  {
    id: 'jvm-memory-areas',
    technology: 'java',
    title: 'JVM Memory Areas (Full Memory Model)',
    category: 'JVM',
    slug: 'jvm-memory-areas',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'The complete map of where a running JVM uses memory: heap (young + old), per-thread stacks, metaspace, code cache, and native/direct memory.',
    mentalModel:
      'The JVM process is a building. The heap is the shared warehouse (GC-managed). Each thread has its own small desk (stack). Metaspace is the archive of blueprints (class metadata). The code cache is the machine shop where JIT-compiled code lives. Direct memory is space rented outside the building — the GC never cleans it directly.',
    memoryTip: 'Process memory ≈ Heap + Metaspace + (Threads × Xss) + Code Cache + Direct buffers + GC/JVM overhead.',
    keyTerms: ['Eden', 'Survivor (S0/S1)', 'Old Gen', 'Metaspace', 'Code Cache', 'Direct memory', '-Xss', 'PC register'],
    visualIds: ['jvm-memory-map'],
    interviewAnswer: `The JVM has shared areas and per-thread areas. Shared: the HEAP holds all objects and arrays and is split into the young generation (Eden plus two Survivor spaces) and the old generation; METASPACE (native memory since Java 8) holds class metadata; the CODE CACHE holds JIT-compiled native code. Per-thread: each thread has a JVM STACK of frames (locals, operand stack, return address), a PC register, and a native method stack. Outside the heap there is also DIRECT memory (ByteBuffer.allocateDirect, Netty, NIO). The important practical point is that the Java process uses much more than -Xmx: heap + metaspace + thread stacks + code cache + direct buffers + GC bookkeeping.`,
    detailedExplanation: `Objects are normally allocated in Eden using thread-local allocation buffers (TLABs), so allocation is just a pointer bump. When Eden fills, a minor GC copies live objects into a Survivor space; objects that survive enough minor GCs (the tenuring threshold, up to 15) are promoted to the old generation. Large objects may be allocated directly in old gen (G1 calls them humongous objects when they exceed half a region). The String pool has lived in the heap since Java 7. Static fields live with the Class object in the heap; the class metadata itself (method bytecode, constant pool structures) lives in Metaspace. Each thread stack is reserved with -Xss (commonly 512KB–1MB on 64-bit Linux), so 2,000 platform threads can reserve gigabytes of address space on their own — one reason virtual threads matter.`,
    internalWorking: `Escape analysis in the JIT can prove an object never escapes a method and then apply scalar replacement — the object's fields become locals and no heap allocation happens at all. The code cache is segmented (non-method, profiled, non-profiled code) and if it fills up the JIT stops compiling ("CodeCache is full. Compiler has been disabled"), which silently degrades performance rather than crashing. Native Memory Tracking (-XX:NativeMemoryTracking=summary, then jcmd <pid> VM.native_memory summary) breaks the whole process footprint down by area.`,
    codeExample: `import java.lang.management.*;

public class MemoryAreas {
    public static void main(String[] args) {
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            System.out.printf("%-28s %s%n", pool.getName(), pool.getType());
        }
        Runtime rt = Runtime.getRuntime();
        System.out.println("max heap MB = " + rt.maxMemory() / (1024 * 1024));
    }
}`,
    codeOutput: `CodeHeap 'non-nmethods'       Non-heap memory
Metaspace                    Non-heap memory
CodeHeap 'profiled nmethods' Non-heap memory
Compressed Class Space       Non-heap memory
G1 Eden Space                Heap memory
G1 Old Gen                   Heap memory
G1 Survivor Space            Heap memory
CodeHeap 'non-profiled nmethods' Non-heap memory
max heap MB = 4096`,
    whyOutput: `Sample output on JDK 21 with G1 and -Xmx4g (pool names and order depend on the collector and JDK). It shows the split directly: Eden/Survivor/Old Gen are heap pools; Metaspace, Compressed Class Space and the segmented CodeHeaps are non-heap. Thread stacks and direct buffers are not listed as pools at all — which is exactly why people forget them when sizing containers.`,
    practicalExample: `A Spring Boot service in Kubernetes with a 2GiB memory limit and -Xmx2g gets OOMKilled by the kernel even though the heap never fills: metaspace (~150MB for a Spring app), 200 threads × 1MB stacks, code cache and Netty direct buffers pushed the process past the cgroup limit. The fix is to size heap as a percentage (e.g. -XX:MaxRAMPercentage=70) and leave headroom for non-heap.`,
    commonMistakes: [
      'Saying "the JVM uses -Xmx of memory" — the process footprint is always larger than the heap.',
      'Placing static variables or the String pool in PermGen/Metaspace on modern JVMs — both are in the heap since Java 7/8.',
      'Forgetting direct memory and thread stacks when diagnosing container OOMKills.',
      'Thinking every object is heap-allocated — escape analysis can eliminate allocations entirely.',
    ],
    seniorInsight: `When a container is OOMKilled (exit code 137) but there is no java.lang.OutOfMemoryError in the logs, the problem is almost always non-heap: turn on Native Memory Tracking, compare committed memory per area with the cgroup limit, and check thread count and direct buffer usage before touching -Xmx.`,
    aiAwareness: {
      strongAnswerShouldMention: ['Eden/Survivor/Old', 'Metaspace is native memory', 'per-thread stack', 'code cache', 'direct memory', 'process > heap'],
      weakAnswer: 'There is heap and stack. Objects go in heap and variables go in stack.',
      redFlags: ['Mentions PermGen as current', 'Thinks -Xmx caps total process memory', 'Cannot name the young-generation spaces'],
      likelyFollowUp: [
        'What lives in Metaspace vs the heap?',
        'Why might a container be OOMKilled with no OutOfMemoryError?',
        'How does an object get promoted to old gen?',
      ],
    },
    followUpQuestions: ['Where is the String pool stored?', 'What is a TLAB?', 'What is Native Memory Tracking?'],
    prerequisites: ['jvm', 'heap-vs-stack'],
    relatedTopics: ['metaspace', 'garbage-collection', 'out-of-memory-errors', 'gc-tuning'],
    nextTopics: ['metaspace', 'out-of-memory-errors'],
    references: [
      {
        title: 'JVM Specification — Run-Time Data Areas',
        url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5',
        source: 'Oracle',
        type: 'official',
        version: 21,
      },
      {
        title: 'Native Memory Tracking',
        url: 'https://docs.oracle.com/en/java/javase/21/vm/native-memory-tracking.html',
        source: 'Oracle',
        type: 'documentation',
        version: 21,
      },
    ],
    interviewQuestions: ['q-jvm-memory-areas', 'q-jvm-young-old-promotion', 'q-jvm-container-heap-sizing', 'q-jvm-string-pool'],
  },

  {
    id: 'metaspace',
    technology: 'java',
    title: 'Metaspace (vs PermGen)',
    category: 'JVM',
    slug: 'metaspace',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The native-memory area (Java 8+) that stores class metadata, replacing the fixed-size PermGen heap region.',
    mentalModel: 'Metaspace is the blueprint archive. Every loaded class leaves a blueprint there; it is only removed when the whole ClassLoader that loaded it becomes unreachable.',
    memoryTip: 'Classes die with their ClassLoader. Leak the loader, leak the metaspace.',
    keyTerms: ['PermGen', 'class metadata', 'ClassLoader', 'MaxMetaspaceSize', 'Compressed Class Space', 'class unloading'],
    interviewAnswer: `Before Java 8, class metadata lived in PermGen, a fixed-size part of the heap that frequently caused "OutOfMemoryError: PermGen space". Java 8 removed PermGen and moved class metadata to Metaspace in native memory, which grows dynamically and by default is limited only by available native memory. Interned strings and static fields moved to the regular heap. You can cap it with -XX:MaxMetaspaceSize, and class metadata is freed only when its defining ClassLoader is garbage-collected.`,
    detailedExplanation: `Metaspace usage grows with the number of loaded classes: frameworks that generate classes at runtime (Spring CGLIB proxies, Hibernate bytecode enhancement, Groovy/script engines, lambdas' hidden classes, reflection accessors) all add to it. -XX:MetaspaceSize is not the initial size but the high-water mark that triggers the first metaspace-induced GC. With compressed class pointers, class structures live in a separate "Compressed Class Space" (default 1GB reserved, -XX:CompressedClassSpaceSize).`,
    internalWorking: `Metaspace is allocated in chunks per ClassLoader. When a ClassLoader becomes unreachable (no live instances of its classes, no reference to the loader, no reference to any Class it defined), a GC can unload all its classes and return the chunks. Since JDK 16 (JEP 387, Elastic Metaspace) unused memory is returned to the OS more eagerly.`,
    codeExample: `import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

// Run with: java -XX:MaxMetaspaceSize=64m MetaspaceLeak
public class MetaspaceLeak {
    static final List<ClassLoader> LEAK = new ArrayList<>();

    public static void main(String[] args) throws Exception {
        URL classes = MetaspaceLeak.class.getProtectionDomain().getCodeSource().getLocation();
        while (true) {
            // A NEW loader (parent = null) defines a NEW copy of the class each time.
            URLClassLoader loader = new URLClassLoader(new URL[] { classes }, null);
            loader.loadClass("MetaspaceLeak$Payload");
            LEAK.add(loader); // keeping the loader reachable keeps its classes in metaspace
        }
    }

    public static class Payload { }
}`,
    codeOutput: 'Exception in thread "main" java.lang.OutOfMemoryError: Metaspace',
    whyOutput: `Each URLClassLoader with a null parent cannot delegate, so it defines its own Payload class — a separate Class with its own metadata. Because every loader is kept in a static list, none can be unloaded, so metaspace grows until the 64MB cap. Remove LEAK.add(loader) (and close the loader) and the classes become unloadable.`,
    practicalExample: `Classic production case: hot-redeploying a WAR in Tomcat repeatedly. A JDBC driver registered in DriverManager, or a ThreadLocal or a static cache in a parent-loader library, holds a reference to the old web-app ClassLoader, so every redeploy leaks the entire previous application's classes until metaspace is exhausted.`,
    commonMistakes: [
      'Saying Metaspace is part of the heap.',
      'Believing Metaspace is unlimited so it can never fail — it is bounded by native memory, and an uncapped leak can take down the host or container.',
      'Treating -XX:MetaspaceSize as the initial/max size; it is a GC trigger threshold.',
    ],
    seniorInsight: `In containers, always set -XX:MaxMetaspaceSize (e.g. 256m–512m for a typical Spring app) so a class-loader leak fails fast with a clear Java error instead of an anonymous kernel OOMKill. Watch the "Loaded classes" count in JFR or jcmd <pid> VM.classloader_stats — a count that keeps rising under steady traffic signals runtime class generation gone wrong.`,
    aiAwareness: {
      strongAnswerShouldMention: ['native memory', 'replaced PermGen in Java 8', 'class metadata', 'ClassLoader unloading', 'MaxMetaspaceSize'],
      weakAnswer: 'Metaspace is the new PermGen.',
      redFlags: ['Says Metaspace is in the heap', 'Says string pool is in Metaspace'],
      likelyFollowUp: ['What causes a Metaspace leak?', 'When can a class be unloaded?', 'Why was PermGen removed?'],
    },
    prerequisites: ['jvm-memory-areas'],
    relatedTopics: ['jvm-memory-areas', 'out-of-memory-errors', 'jvm'],
    nextTopics: ['out-of-memory-errors'],
    references: [
      {
        title: 'JEP 122: Remove the Permanent Generation',
        url: 'https://openjdk.org/jeps/122',
        source: 'OpenJDK',
        type: 'jep',
        version: 8,
      },
      {
        title: 'JEP 387: Elastic Metaspace',
        url: 'https://openjdk.org/jeps/387',
        source: 'OpenJDK',
        type: 'jep',
        version: 16,
      },
    ],
    interviewQuestions: ['q-jvm-permgen-vs-metaspace', 'q-jvm-oom-types'],
  },

  {
    id: 'out-of-memory-errors',
    technology: 'java',
    title: 'OutOfMemoryError Types & StackOverflowError',
    category: 'JVM',
    slug: 'out-of-memory-errors',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The message after "OutOfMemoryError:" tells you exactly which memory area ran out — and therefore which fix applies.',
    mentalModel: 'An OOM is a symptom with an address label. Read the label before you touch -Xmx.',
    memoryTip: 'Heap space · GC overhead · Metaspace · Direct buffer · Native thread · Array size — six labels, six different fixes.',
    keyTerms: ['Java heap space', 'GC overhead limit exceeded', 'Metaspace', 'Direct buffer memory', 'unable to create native thread', 'StackOverflowError'],
    interviewAnswer: `"Java heap space": live objects exceed -Xmx — either a leak or an undersized heap. "GC overhead limit exceeded": the JVM spent over 98% of time in GC recovering under 2% of heap — effectively the same root cause, caught earlier (Parallel GC). "Metaspace": too many classes or a ClassLoader leak. "Direct buffer memory": off-heap NIO buffers exceed -XX:MaxDirectMemorySize. "unable to create native thread": the OS refused another thread (ulimit, container pids limit, or memory for stacks) — usually a thread leak. "Requested array size exceeds VM limit": an absurdly large array. StackOverflowError is different: one thread's stack is exhausted, almost always by unbounded recursion.`,
    detailedExplanation: `Increasing -Xmx only helps "Java heap space" when the live set is legitimately large. For a leak it only delays the crash. For "unable to create native thread" a bigger heap makes things worse, because it leaves less memory for thread stacks. OutOfMemoryError and StackOverflowError both extend VirtualMachineError — you should not catch them as business logic, because the JVM may be in an inconsistent state.`,
    codeExample: `import java.util.ArrayList;
import java.util.List;

// Run with: java -Xmx16m HeapOom
public class HeapOom {
    public static void main(String[] args) {
        List<byte[]> hold = new ArrayList<>();
        int mb = 0;
        try {
            while (true) {
                hold.add(new byte[1024 * 1024]); // 1 MB, kept reachable
                mb++;
            }
        } catch (OutOfMemoryError e) {
            int allocated = mb;
            hold = null;                       // release so we can still print
            System.out.println(e.getMessage() + " after ~" + allocated + " MB");
        }
    }
}`,
    codeOutput: 'Java heap space after ~13 MB',
    whyOutput: `Every 1MB array stays reachable through the list, so GC cannot reclaim anything and the 16MB heap fills (the exact count varies with JVM overhead and GC). The message identifies the area: "Java heap space". Catching OOM here is only for demonstration — in production, let it fail and capture a heap dump instead.`,
    practicalExample: `Production runbook: always run with -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps and, in Kubernetes, -XX:+ExitOnOutOfMemoryError so the pod restarts cleanly instead of limping on in a broken state. Then classify by the message and go to the right tool: heap dump (heap), NMT (direct/native), thread dump (native thread), classloader stats (metaspace).`,
    commonMistakes: [
      'Responding to every OOM by doubling -Xmx.',
      'Catching OutOfMemoryError and continuing normally.',
      'Calling StackOverflowError an OutOfMemoryError.',
      'Not enabling HeapDumpOnOutOfMemoryError before the incident happens.',
    ],
    seniorInsight: `The two most common real-world causes in microservices are unbounded in-memory caches/collections (heap) and unbounded thread creation from new Thread() or misconfigured executors (native thread). Both are design bugs, not tuning problems — fix them with bounded caches (Caffeine with maximumSize) and bounded pools.`,
    aiAwareness: {
      strongAnswerShouldMention: ['different OOM messages map to different areas', 'heap dump on OOM', 'leak vs undersized heap', 'StackOverflowError is separate'],
      weakAnswer: 'OutOfMemoryError means you need more RAM, so increase -Xmx.',
      redFlags: ['Only knows one type of OOM', 'Suggests catching OOM and retrying'],
      likelyFollowUp: ['How do you tell a leak from an undersized heap?', 'What does "GC overhead limit exceeded" mean?', 'How do you debug "unable to create native thread"?'],
    },
    prerequisites: ['jvm-memory-areas'],
    relatedTopics: ['metaspace', 'heap-dump-analysis', 'garbage-collection'],
    nextTopics: ['heap-dump-analysis', 'gc-tuning'],
    references: [
      {
        title: 'Troubleshooting Guide — Understand the OutOfMemoryError Exception',
        url: 'https://docs.oracle.com/en/java/javase/21/troubleshoot/troubleshooting-memory-leaks.html',
        source: 'Oracle',
        type: 'documentation',
        version: 21,
      },
    ],
    interviewQuestions: ['q-jvm-oom-types', 'q-jvm-stackoverflow-recursion'],
  },

  {
    id: 'gc-tuning',
    technology: 'java',
    title: 'GC Algorithms & JVM Tuning Flags',
    category: 'JVM',
    slug: 'gc-tuning',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning: 'Choosing a collector (Serial, Parallel, G1, ZGC, Shenandoah) and sizing the heap to meet a measured latency or throughput goal.',
    mentalModel: 'GC tuning is a three-way trade-off triangle: throughput, pause latency, memory footprint. You can optimise two; the third pays.',
    memoryTip: 'Parallel = throughput. G1 = balanced default. ZGC/Shenandoah = sub-millisecond pauses at a CPU/memory cost.',
    keyTerms: ['G1', 'ZGC', 'Shenandoah', 'Parallel GC', 'stop-the-world', '-Xms/-Xmx', 'MaxGCPauseMillis', 'MaxRAMPercentage', 'GC logs'],
    interviewAnswer: `Serial GC is single-threaded (small heaps, tiny containers). Parallel GC maximises throughput with multi-threaded stop-the-world collections — good for batch jobs. G1 (default since Java 9) divides the heap into regions and collects the regions with the most garbage first, aiming at a pause target (-XX:MaxGCPauseMillis, default 200ms). ZGC and Shenandoah do most work concurrently with the application and keep pauses in the low milliseconds or below regardless of heap size; ZGC became generational in JDK 21 and generational-by-default in JDK 23. The key flags: -Xms/-Xmx (set equal for servers), -XX:MaxRAMPercentage in containers, -Xlog:gc* for logging, and -XX:+HeapDumpOnOutOfMemoryError.`,
    detailedExplanation: `Tuning process: (1) define the goal — p99 pause, throughput, or footprint; (2) enable GC logging (-Xlog:gc*:file=gc.log:time,uptime,level,tags) and measure under realistic load; (3) right-size the heap first (most "GC problems" are an undersized heap or an excessive allocation rate); (4) only then switch collector or adjust a small number of flags. Avoid copying long flag lists from blog posts — modern collectors are ergonomic and most old flags are obsolete or harmful.`,
    internalWorking: `G1 does concurrent marking of the old generation, then "mixed" collections that evacuate young regions plus the old regions with the most garbage. A Full GC in G1 is a fallback that means concurrent marking could not keep up (to-space exhaustion / evacuation failure). ZGC uses coloured pointers and load barriers so objects can be relocated while application threads run; the barrier fixes up references on access.`,
    codeExample: `# Typical production JVM options for a containerised Spring Boot service (JDK 21)
java \\
  -XX:MaxRAMPercentage=70 \\
  -XX:InitialRAMPercentage=70 \\
  -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \\
  -XX:MaxMetaspaceSize=256m \\
  -Xss512k \\
  -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps \\
  -XX:+ExitOnOutOfMemoryError \\
  -Xlog:gc*:file=/logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20m \\
  -jar app.jar

# Low-latency alternative:  -XX:+UseZGC  (generational by default from JDK 23;
# on JDK 21 add -XX:+ZGenerational)`,
    codeLanguage: 'Shell',
    whyOutput: `Percentage-based sizing adapts to the container memory limit; 70% leaves ~30% for metaspace, thread stacks, code cache and direct buffers. Setting initial = max avoids heap resizing pauses. ExitOnOutOfMemoryError lets Kubernetes restart a broken pod, while the heap dump preserves evidence.`,
    practicalExample: `A pricing API with p99 latency SLO of 50ms showed 300ms G1 pauses at 12GB heap. GC logs showed mostly young-gen evacuation of a huge allocation rate from JSON mapping. The first fix was reducing allocation (reusing ObjectMapper, streaming parsing); only after that, switching to generational ZGC brought p99 GC pauses below 1ms at roughly 10% more CPU.`,
    commonMistakes: [
      'Tuning without GC logs or a measurable goal.',
      'Setting -Xmx equal to the container limit.',
      'Using System.gc() or -XX:+DisableExplicitGC blindly without understanding RMI/direct-buffer implications.',
      'Copying obsolete CMS-era flags onto G1/ZGC.',
    ],
    seniorInsight: `The highest-leverage GC optimisation is usually allocation reduction, not collector flags. A flame graph of allocations (async-profiler -e alloc or JFR allocation events) often shows a single hot path — logging string concatenation, boxing in streams, or re-creating mappers — responsible for most garbage.`,
    aiAwareness: {
      strongAnswerShouldMention: ['G1 default', 'ZGC low pause', 'throughput vs latency trade-off', 'GC logs first', 'container percentage sizing'],
      weakAnswer: 'Use G1 and increase heap if it is slow.',
      redFlags: ['Recommends CMS on modern JDKs (removed in JDK 14)', 'No measurement step'],
      likelyFollowUp: ['When would you pick ZGC over G1?', 'What causes a Full GC in G1?', 'How do you size the heap in Kubernetes?'],
    },
    prerequisites: ['garbage-collection', 'jvm-memory-areas'],
    relatedTopics: ['garbage-collection', 'out-of-memory-errors', 'heap-dump-analysis'],
    nextTopics: ['heap-dump-analysis', 'high-cpu-diagnosis'],
    references: [
      {
        title: 'HotSpot GC Tuning Guide (JDK 21)',
        url: 'https://docs.oracle.com/en/java/javase/21/gctuning/',
        source: 'Oracle',
        type: 'documentation',
        version: 21,
      },
      {
        title: 'JEP 439: Generational ZGC',
        url: 'https://openjdk.org/jeps/439',
        source: 'OpenJDK',
        type: 'jep',
        version: 21,
      },
    ],
    interviewQuestions: ['q-jvm-gc-choice', 'q-jvm-container-heap-sizing', 'q-jvm-young-old-promotion'],
  },

  {
    id: 'heap-dump-analysis',
    technology: 'java',
    title: 'Memory Leak Diagnosis (Heap Dumps)',
    category: 'JVM',
    slug: 'heap-dump-analysis',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning: 'Finding why objects stay reachable — capture a heap dump, find the biggest retained objects, and follow the path back to a GC root.',
    mentalModel: 'A Java leak is not lost memory — it is memory someone still holds a ticket for. The heap dump shows you who is holding the ticket.',
    memoryTip: 'Sawtooth that keeps rising after every full GC = leak. Dump → dominator tree → path to GC root → fix the holder.',
    keyTerms: ['heap dump', 'jcmd GC.heap_dump', 'Eclipse MAT', 'dominator tree', 'retained size', 'shallow size', 'GC root', 'jstat'],
    interviewAnswer: `First confirm it is a leak: old-gen occupancy after each full/mixed GC keeps rising under steady load (GC logs, jstat -gcutil, or Grafana/Micrometer jvm_memory_used). Then capture a heap dump with jcmd <pid> GC.heap_dump /tmp/heap.hprof (or automatically via HeapDumpOnOutOfMemoryError), open it in Eclipse MAT or VisualVM, look at the dominator tree / leak suspects sorted by RETAINED size, and use "path to GC roots" to see which static field, cache, ThreadLocal or listener keeps the objects alive. Fix the holder — bound the cache, remove the listener, call ThreadLocal.remove().`,
    detailedExplanation: `Shallow size is the object itself; retained size is everything that would be freed if that object were collected — leak hunting always sorts by retained size. Taking two dumps a few minutes apart and comparing histograms (jcmd <pid> GC.class_histogram) shows which classes are growing. Heap dumps pause the JVM and can be as large as the heap and contain sensitive data (PII, tokens) — handle them as secrets in regulated environments.`,
    codeExample: `import java.util.HashMap;
import java.util.Map;

public class SessionCache {
    // LEAK: static, unbounded, never evicted. Every request adds an entry.
    private static final Map<String, byte[]> CACHE = new HashMap<>();

    static void handleRequest(String requestId) {
        CACHE.put(requestId, new byte[10_000]); // unique key each time
    }

    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) handleRequest("req-" + i);
        System.out.println("entries = " + CACHE.size());
    }
}

// FIX (bounded, with expiry) — e.g. Caffeine:
// Cache<String, byte[]> cache = Caffeine.newBuilder()
//     .maximumSize(10_000)
//     .expireAfterWrite(Duration.ofMinutes(10))
//     .build();`,
    codeOutput: 'entries = 5',
    whyOutput: `Five entries now, but the map grows by one entry per request forever. Because CACHE is static, it is a GC root via its Class, so every byte[] stays reachable. In MAT this appears as one HashMap dominating most of the heap, with the path-to-GC-root pointing to SessionCache.CACHE.`,
    practicalExample: `Typical leak sources in Spring services: a static Map used as a cache, a @Component holding a growing List, event listeners registered per request and never removed, ThreadLocals in Tomcat worker threads never cleared, Hibernate first-level cache in a long-running batch transaction, and unclosed streams/ResultSets.`,
    commonMistakes: [
      'Sorting by shallow size instead of retained size.',
      'Restarting the pod repeatedly instead of capturing evidence.',
      'Using WeakHashMap as a general cache — it is keyed by weak keys (identity of the key), not by memory pressure, and String literal keys never get collected.',
      'Uploading production heap dumps to shared tools without considering PII.',
    ],
    seniorInsight: `Make leaks observable before they become incidents: alert on old-gen usage after GC (not raw heap usage, which is normally a sawtooth), and on growth rate of jvm_threads_live and loaded classes. Combined with automatic heap dumps to a protected volume, most leaks get diagnosed from the first occurrence.`,
    aiAwareness: {
      strongAnswerShouldMention: ['confirm with GC logs/metrics', 'heap dump via jcmd', 'MAT dominator tree', 'retained size', 'path to GC roots'],
      weakAnswer: 'Use a profiler and look for big objects.',
      redFlags: ['Says Java cannot have memory leaks', 'Only solution is restarting'],
      likelyFollowUp: ['Shallow vs retained size?', 'How would a ThreadLocal leak?', 'How do you take a heap dump in Kubernetes?'],
    },
    prerequisites: ['garbage-collection', 'out-of-memory-errors'],
    relatedTopics: ['out-of-memory-errors', 'gc-tuning', 'high-cpu-diagnosis'],
    nextTopics: ['high-cpu-diagnosis'],
    references: [
      {
        title: 'Eclipse Memory Analyzer (MAT)',
        url: 'https://eclipse.dev/mat/',
        source: 'Eclipse Foundation',
        type: 'documentation',
      },
      {
        title: 'The jcmd Utility',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html',
        source: 'Oracle',
        type: 'documentation',
        version: 21,
      },
    ],
    interviewQuestions: ['q-jvm-diagnose-memory-leak', 'q-jvm-threadlocal-leak', 'q-jvm-reference-types'],
  },

  {
    id: 'high-cpu-diagnosis',
    technology: 'java',
    title: 'High CPU & Thread Dump Analysis',
    category: 'JVM',
    slug: 'high-cpu-diagnosis',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning: 'Mapping an OS-level hot thread to a Java stack trace (thread dump) or a profiler flame graph to find what is burning CPU.',
    mentalModel: 'top tells you WHICH thread is hot; the thread dump tells you WHAT it is doing. Join them on the native thread id (nid).',
    memoryTip: 'top -H → TID → hex → jstack/jcmd Thread.print → grep nid=0x… → read the stack. Check GC first.',
    keyTerms: ['top -H', 'thread dump', 'jstack', 'jcmd Thread.print', 'nid', 'async-profiler', 'JFR', 'deadlock', 'BLOCKED'],
    interviewAnswer: `Step 1: rule out GC — if GC logs show back-to-back collections, high CPU is a memory problem, not a code problem. Step 2: find the hot thread: top -H -p <pid> gives per-thread CPU with OS thread IDs. Step 3: convert the TID to hex (printf '%x' 12345) and take several thread dumps a few seconds apart (jcmd <pid> Thread.print or jstack). Step 4: find the thread whose nid=0x... matches and see what it is consistently executing — an infinite loop, catastrophic regex backtracking, a tight retry/spin loop, heavy serialization. For a broader view use a sampling profiler: async-profiler or JDK Flight Recorder, and read the flame graph.`,
    detailedExplanation: `Thread dumps also reveal non-CPU problems: many threads BLOCKED on the same monitor (lock contention), WAITING on a pool's queue (pool starvation), or a "Found one Java-level deadlock" section that jstack prints automatically. Taking 3–5 dumps over 10–20 seconds matters — a single dump is a snapshot; a stack that appears in every dump is the real hot spot.`,
    codeExample: `# 1. Find the Java PID and the hottest thread
top -H -p 4242                     # suppose thread 4310 is at 99% CPU
printf '%x\\n' 4310                  # -> 10d6

# 2. Take a few dumps and find that native thread id
jcmd 4242 Thread.print > dump1.txt
grep -A 15 'nid=0x10d6' dump1.txt

# "pricing-worker-3" #57 prio=5 os_prio=0 tid=0x... nid=0x10d6 runnable
#    java.lang.Thread.State: RUNNABLE
#      at java.util.regex.Pattern$Loop.match(Pattern.java:...)
#      at com.bank.pricing.Validator.isValid(Validator.java:42)

# 3. Broader view: 30s CPU flame graph with async-profiler
asprof -d 30 -e cpu -f /tmp/cpu.html 4242`,
    codeLanguage: 'Shell',
    whyOutput: `The OS thread ID 4310 is 0x10d6 in hex, which is the nid field in the Java thread dump. The matching stack shows a RUNNABLE thread stuck in regex matching in Validator line 42 — a classic catastrophic-backtracking pattern like (a+)+ on adversarial input.`,
    practicalExample: `A payments validator used a nested-quantifier regex on free-text fields. One malformed SWIFT message pinned a core at 100% for minutes. The thread dump pointed to Pattern$Loop; the fix was a possessive/atomic pattern plus an input length limit — and a unit test with the bad input.`,
    commonMistakes: [
      'Taking a single thread dump and drawing conclusions.',
      'Forgetting to convert the decimal TID to hex.',
      'Not checking GC activity first.',
      'Profiling only in dev, where the bad input or traffic pattern does not exist.',
    ],
    seniorInsight: `Keep JFR continuously on in production (-XX:StartFlightRecording with a ring buffer — overhead around 1% with default settings) so you can dump the last N minutes after an incident instead of trying to reproduce it. In Kubernetes, ensure the image contains jcmd (a JDK, or jattach) or use kubectl debug with an ephemeral container.`,
    aiAwareness: {
      strongAnswerShouldMention: ['top -H', 'hex nid', 'multiple thread dumps', 'check GC first', 'async-profiler or JFR'],
      weakAnswer: 'Restart the service and add more CPU.',
      redFlags: ['No systematic approach', 'Does not know what a thread dump is'],
      likelyFollowUp: ['How do you detect a deadlock?', 'What does BLOCKED vs WAITING mean?', 'How do you profile safely in production?'],
    },
    prerequisites: ['jvm'],
    relatedTopics: ['heap-dump-analysis', 'gc-tuning'],
    references: [
      {
        title: 'JDK Flight Recorder',
        url: 'https://docs.oracle.com/en/java/java-components/jdk-mission-control/9/user-guide/using-jdk-flight-recorder.html',
        source: 'Oracle',
        type: 'documentation',
      },
      {
        title: 'async-profiler',
        url: 'https://github.com/async-profiler/async-profiler',
        source: 'GitHub',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-jvm-high-cpu'],
  },
];
