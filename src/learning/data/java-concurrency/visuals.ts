import type { LearningVisual } from '../../types';
export const javaConcurrencyVisuals: LearningVisual[] = [
  {
    id: 'jc-cf-operators',
    topicId: 'jc-completable-future',
    type: 'comparison',
    title: 'CompletableFuture Operators — Quick Reference',
    description: 'The most important operators with their semantics and use cases',
    columns: [
      {
        label: 'Transform & Chain',
        nodes: [
          { id: 'ta', label: 'thenApply(fn)', description: 'Sync transform. fn: T → U. Like Stream.map(). Runs on completing thread.' },
          { id: 'tc', label: 'thenCompose(fn)', description: 'Async chain. fn: T → CF<U>. Like Stream.flatMap(). Avoids nested CF<CF<T>>.' },
          { id: 'tcb', label: 'thenCombine(other, fn)', description: 'Zip two futures. Runs fn when both complete. True parallel. fn: (T, U) → V.' },
          { id: 'ta2', label: 'thenAccept(fn)', description: 'Side effect. fn: T → void. No return value. For logging, notification.' },
        ],
      },
      {
        label: 'Fan-out & Error Handling',
        nodes: [
          { id: 'all', label: 'allOf(futures...)', description: 'Wait for all to complete. Returns CF<Void>. Use .join() to get individual results.' },
          { id: 'any', label: 'anyOf(futures...)', description: 'Complete when first finishes. Returns CF<Object>. For speculative parallel calls.' },
          { id: 'ex', label: 'exceptionally(fn)', description: 'Catch and recover. fn: Throwable → T. Returns fallback value.' },
          { id: 'handle', label: 'handle(fn)', description: 'Always runs. fn: (T, Throwable) → U. Handles both success and failure.' },
        ],
      },
    ],
    memoryTip: 'Apply = map. Compose = flatMap. Combine = zip. Exceptionally = catch. AllOf = await all. Always specify custom executor for I/O tasks.',
  },
  {
    id: 'jc-virtual-thread-model',
    topicId: 'jc-virtual-threads',
    type: 'flow',
    title: 'Virtual Thread Execution Model (Project Loom)',
    description: 'How the JVM schedules millions of virtual threads on a small OS thread pool',
    nodes: [
      { id: 'vt', label: 'Virtual Threads (millions)', description: 'JVM-managed. ~1 KB stack. Created with Thread.ofVirtual() or Executors.newVirtualThreadPerTaskExecutor().' },
      { id: 'sched', label: 'JVM Scheduler (ForkJoinPool)', description: 'Assigns virtual threads to carrier OS threads. Monitors for blocking calls.' },
      { id: 'carrier', label: 'Carrier OS Threads (few)', description: 'Usually CPU cores count. Each runs one virtual thread at a time.' },
      { id: 'park', label: 'I/O Block → Park', description: 'Virtual thread blocks on socket/JDBC/sleep → JVM parks it (saves stack), OS thread freed.' },
      { id: 'resume', label: 'I/O Complete → Resume', description: 'I/O callback wakes virtual thread → JVM schedules it on any available carrier thread.' },
    ],
    memoryTip: 'Key insight: blocking an OS thread is expensive (~1MB stack, OS context switch). Parking a virtual thread is cheap (~1KB, JVM operation). Write blocking code, get async throughput.',
  },
  {
    id: 'jc-reactor-operators',
    topicId: 'jc-reactive',
    type: 'comparison',
    title: 'Reactor flatMap vs concatMap vs switchMap',
    description: 'The three most important transformation operators and when to use each',
    columns: [
      {
        label: 'Concurrent & Sequential',
        nodes: [
          { id: 'fm', label: 'flatMap (concurrent)', description: 'Subscribes to all inner publishers at once. Results arrive as ready — order NOT preserved. Use: parallel HTTP, fan-out.' },
          { id: 'cm', label: 'concatMap (sequential)', description: 'Subscribes to next inner only after previous completes. Order preserved. Use: Kafka event chains, ordered processing.' },
          { id: 'fm2', label: 'flatMap(fn, concurrency)', description: 'flatMap(fn, 10) — at most 10 concurrent subscriptions. Limits parallelism. Best for HTTP fan-out with rate limiting.' },
        ],
      },
      {
        label: 'Cancel & Merge',
        nodes: [
          { id: 'sm', label: 'switchMap (cancel prev)', description: 'On each new item, cancel the previous inner publisher, subscribe to new. Use: search-as-you-type, debounce.' },
          { id: 'merge', label: 'merge()', description: 'Interleave two Flux streams. Both active simultaneously. First-come first-served.' },
          { id: 'zip', label: 'zip()', description: 'Pair items 1:1 from multiple Flux. Waits for slowest emitter. Use: combine parallel data streams.' },
        ],
      },
    ],
    memoryTip: 'Kafka consumer: use concatMap (order matters). HTTP fan-out: use flatMap(fn, maxConcurrency). Search box: use switchMap (cancel previous query).',
  },
];
