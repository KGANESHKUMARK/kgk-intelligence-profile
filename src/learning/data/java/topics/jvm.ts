import type { LearningTopic } from '../../../types';

export const jvmTopics: LearningTopic[] = [
  {
    id: 'jvm',
    technology: 'java',
    title: 'JVM (Java Virtual Machine)',
    category: 'JVM',
    slug: 'jvm',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'The runtime that loads compiled Java bytecode and executes it, providing memory management, threading and platform independence.',
    mentalModel: 'javac compiles once to bytecode; the JVM is the "universal machine" that runs that same bytecode on any platform it targets.',
    memoryTip: '.java \u2192 javac \u2192 .class bytecode \u2192 Class Loader \u2192 Runtime \u2192 Interpreter/JIT \u2192 CPU.',
    keyTerms: ['bytecode', 'class loader', 'JIT', 'heap', 'stack', 'garbage collection'],
    visualIds: ['jvm-architecture'],
    interviewAnswer:
      'The JVM is the engine that runs compiled Java bytecode (.class files). javac compiles .java source into bytecode; the JVM\u2019s class loader loads those classes at runtime, and execution proceeds either by interpreting bytecode directly or by JIT-compiling hot methods to native machine code for speed. Along the way, the JVM manages memory (heap, stack, metaspace), runs garbage collection, and provides the same execution semantics regardless of the underlying OS/CPU — "write once, run anywhere."',
    detailedExplanation:
      'JDK vs JRE vs JVM: the JDK (Java Development Kit) includes the compiler (javac) and development tools plus a JRE; the JRE (Java Runtime Environment) includes the JVM plus the core class libraries needed to run (not compile) Java programs; the JVM itself is just the execution engine — class loading, bytecode verification, execution (interpreter + JIT), and memory management/GC. Modern JDK distributions bundle all of this together, but the conceptual layering still matters for understanding what each piece is responsible for.',
    internalWorking:
      'Class loading happens in stages — loading (reading the .class bytes), linking (verification, preparation, resolution), and initialization (running static initializers) — and is performed lazily, the first time a class is actually needed, by a hierarchy of class loaders (bootstrap, platform, application, and any custom loaders). The JIT compiler profiles which methods run frequently ("hot") and compiles those specifically to native code, while cold code stays interpreted — this is why long-running JVM processes often get faster over the first seconds/minutes of execution as JIT compilation kicks in.',
    practicalExample:
      'When diagnosing "why is this Java service slow to start," the answer is often JIT warm-up: the JVM interprets bytecode initially and only compiles hot paths to native code after enough invocations, so short-lived processes (e.g. CLI tools, some serverless functions) never benefit from JIT the way a long-running server does — this is exactly the problem Ahead-of-Time compilation efforts (Project Leyden) aim to reduce.',
    commonMistakes: [
      'Conflating JDK, JRE and JVM as interchangeable terms in an interview answer.',
      'Assuming bytecode is platform-specific — it is deliberately not; the JVM is what\u2019s platform-specific.',
      'Assuming all code gets JIT-compiled immediately — cold/rarely-run code may stay interpreted for the life of the process.',
    ],
    seniorInsight:
      'Production JVM tuning usually centers on three things: heap sizing (-Xms/-Xmx) and GC choice for the workload\u2019s latency/throughput needs, JIT warm-up behavior for latency-sensitive startup, and diagnosability (JFR, heap/thread dumps) for when something goes wrong in production rather than in a debugger.',
    aiAwareness: {
      strongAnswerShouldMention: ['bytecode', 'class loading', 'interpreter vs JIT', 'JDK vs JRE vs JVM distinction'],
      weakAnswer: 'The JVM runs Java programs.',
      redFlags: ['Cannot distinguish JDK/JRE/JVM', 'Thinks bytecode is machine code'],
      likelyFollowUp: ['What is the difference between JDK, JRE and JVM?', 'What does the JIT actually do?', 'How does class loading work?'],
    },
    prerequisites: [],
    relatedTopics: ['heap-vs-stack', 'garbage-collection'],
    nextTopics: ['heap-vs-stack', 'garbage-collection'],
    references: [
      {
        title: 'The Java Virtual Machine Specification',
        url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/index.html',
        source: 'Oracle',
        type: 'official',
        version: 21,
      },
    ],
    interviewQuestions: ['q-jvm-vs-jre-vs-jdk', 'q-jit-compilation', 'q-class-loading'],
  },

  {
    id: 'heap-vs-stack',
    technology: 'java',
    title: 'Heap vs Stack',
    category: 'JVM',
    slug: 'heap-vs-stack',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'Two runtime memory areas: the stack holds per-thread method call frames and local variables; the heap holds every object, shared across threads.',
    mentalModel: 'Stack: a personal notepad per thread, cleared when a method returns. Heap: a shared warehouse everyone can reach into, cleaned up by the garbage collector.',
    memoryTip: 'Stack = per-thread, fast, automatic cleanup. Heap = shared, GC-managed.',
    keyTerms: ['stack frame', 'local variable', 'object reference', 'metaspace', 'StackOverflowError'],
    visualIds: ['heap-stack-memory'],
    interviewAnswer:
      'Each thread gets its own stack, made up of frames — one per active method call — holding local variables, method parameters, and object references. When a method returns, its frame (and everything in it) is popped, automatically freed. The heap is a single memory area shared by all threads, holding every object and array ever created; objects live there until the garbage collector determines nothing reachable still references them. Class metadata (not object instances) lives in a separate area called Metaspace, not the heap.',
    detailedExplanation:
      'A local variable of primitive type stores its value directly on the stack. A local variable of reference type stores a reference (pointer) on the stack, while the actual object it points to lives on the heap. This is why passing an object to a method doesn\u2019t copy the object — it copies the reference, and both the caller\u2019s and callee\u2019s stack frames can point at the same heap object simultaneously.',
    practicalExample:
      'Deep, unbounded recursion (e.g. a recursive JSON parser on deeply nested input) exhausts the stack and throws StackOverflowError, not OutOfMemoryError — a common diagnostic confusion, since both sound like "ran out of memory" but point to completely different memory areas and different fixes (bound the recursion depth vs. increase heap size).',
    commonMistakes: [
      'Confusing StackOverflowError (stack exhausted, usually unbounded recursion) with heap-related OutOfMemoryError (too many live objects, or a memory leak).',
      'Assuming primitives are always faster because they\u2019re "on the stack" — for short-lived, escape-analyzed objects, the JIT can sometimes avoid heap allocation entirely (scalar replacement), blurring the practical distinction.',
      'Forgetting that class metadata lives in Metaspace, not the heap — a Metaspace leak (e.g. from repeatedly loading and never unloading classes/classloaders) shows up differently in diagnostics than a heap leak.',
    ],
    seniorInsight:
      'When diagnosing a production memory issue, the first branch point is exactly this distinction: a StackOverflowError points at recursion/call depth on one thread, while heap growth or GC pressure points at object lifetime and reachability across the whole application — they require completely different tools (thread dump vs. heap dump/JFR).',
    prerequisites: [],
    relatedTopics: ['jvm', 'garbage-collection'],
    references: [
      {
        title: 'The Java Virtual Machine Specification — Chapter 2: The Structure of the Java Virtual Machine',
        url: 'https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html',
        source: 'Oracle',
        type: 'official',
        version: 21,
      },
    ],
    interviewQuestions: ['q-heap-vs-stack', 'q-memory-leak-causes'],
  },

  {
    id: 'garbage-collection',
    technology: 'java',
    title: 'Garbage Collection',
    category: 'JVM',
    slug: 'garbage-collection',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'The JVM\u2019s automatic process for reclaiming heap memory occupied by objects that are no longer reachable.',
    mentalModel: 'A warehouse cleaner who only removes boxes nobody has a claim ticket for anymore — reachability, not reference count alone, decides what gets collected.',
    memoryTip: 'Young objects usually die young. Survivors get promoted to the old generation.',
    keyTerms: ['reachability', 'generational GC', 'minor GC', 'major GC', 'G1', 'ZGC', 'Shenandoah'],
    visualIds: ['gc-flow'],
    interviewAnswer:
      'Garbage collection reclaims heap memory used by objects that are no longer reachable from any GC root (live thread stacks, static fields, etc.) — reachability, not just an object\u2019s reference count, determines eligibility, which is why Java has no equivalent of a dangling pointer. Most collectors are generational: new objects are allocated in a young generation and collected frequently (minor GC), while long-lived objects are promoted to an old generation, collected less often (major/full GC) because that scan is more expensive.',
    detailedExplanation:
      'Setting a reference to null does not free memory immediately — it only makes the object eligible for collection whenever the GC next runs, and only if that was the last reachable reference. Modern JDKs ship multiple collectors with different trade-offs: G1 (the long-standing default, balances throughput and pause time), ZGC and Shenandoah (designed for very low pause times, at some throughput/memory cost), suited to different latency/throughput requirements.',
    practicalExample:
      'A latency-sensitive trading or pricing service that cannot tolerate multi-hundred-millisecond GC pauses is a classic case for choosing a low-pause collector (ZGC or Shenandoah) over the default, even at the cost of somewhat higher CPU/memory overhead — this is a deliberate, workload-driven trade-off, not a universal "better" choice.',
    commonMistakes: [
      'Believing System.gc() forces immediate, guaranteed collection — it is only a hint the JVM is free to ignore.',
      'Assuming garbage collection means Java programs cannot leak memory — a "leak" in Java usually means objects stay unexpectedly reachable (e.g. via a static collection that\u2019s never cleared), not that the GC is broken.',
      'Choosing a low-pause collector by default without a measured latency requirement, when it may cost throughput or memory the workload doesn\u2019t actually need to trade away.',
    ],
    seniorInsight:
      'Diagnosing a GC-related production issue starts with observability, not guessing: GC logs and JDK Flight Recorder (JFR) show pause frequency/duration and heap occupancy over time, which tells you whether the problem is allocation rate, a genuine leak (steadily rising old-gen occupancy that never comes back down after a full GC), or simply an undersized heap for the workload.',
    aiAwareness: {
      strongAnswerShouldMention: ['reachability', 'generational collection', 'minor vs major GC', 'System.gc() is only a hint'],
      weakAnswer: 'Garbage collection automatically deletes objects you don\u2019t need.',
      redFlags: ['Claims System.gc() guarantees immediate collection', 'Thinks Java programs cannot leak memory', 'Cannot name any collector besides "the default one"'],
      likelyFollowUp: [
        'What makes an object eligible for garbage collection?',
        'What is the difference between a minor and a major GC?',
        'How would you diagnose rising heap usage in production?',
      ],
    },
    prerequisites: ['jvm', 'heap-vs-stack'],
    relatedTopics: ['jvm', 'heap-vs-stack'],
    references: [
      {
        title: 'HotSpot Virtual Machine Garbage Collection Tuning Guide',
        url: 'https://docs.oracle.com/en/java/javase/21/gctuning/introduction-garbage-collection-tuning.html',
        source: 'Oracle',
        type: 'documentation',
        version: 21,
      },
    ],
    interviewQuestions: ['q-garbage-collectors-overview', 'q-memory-leak-causes'],
  },
];
