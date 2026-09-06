/**
 * VISUALS — every diagram is a knowledge map, not decoration. Nodes with a
 * `topicId` are clickable and resolve through the learning registry.
 */

import type { LearningVisual } from '../../../types';

export const javaVisuals: LearningVisual[] = [
  {
    id: 'hashmap-flow',
    topicId: 'hashmap',
    type: 'flow',
    title: 'How a HashMap locates an entry',
    description: 'Key lookup path from hashCode() to the final value.',
    memoryTip: 'Hash gets you to the bucket. Equals proves you found the right key.',
    nodes: [
      { id: 'key', label: 'key' },
      { id: 'hashcode', label: 'hashCode()', topicId: 'hashcode', description: 'Computes an int hash for the key.' },
      { id: 'bucket', label: 'bucket', description: 'hash & (capacity - 1) selects a bucket index.' },
      { id: 'collision', label: 'collision?', description: 'More than one key can land in the same bucket.' },
      { id: 'equals', label: 'equals()', topicId: 'equals', description: 'Resolves collisions by testing logical equality.' },
      { id: 'value', label: 'value' },
    ],
    edges: [
      { from: 'key', to: 'hashcode' },
      { from: 'hashcode', to: 'bucket' },
      { from: 'bucket', to: 'collision' },
      { from: 'collision', to: 'equals' },
      { from: 'equals', to: 'value' },
    ],
  },
  {
    id: 'jvm-architecture',
    topicId: 'jvm',
    type: 'architecture',
    title: 'From source file to running code',
    description: 'The path a .java file takes to become executing machine instructions.',
    memoryTip: 'Compile once (bytecode), run anywhere the JVM can interpret or JIT-compile it.',
    nodes: [
      { id: 'source', label: '.java' },
      { id: 'javac', label: 'javac' },
      { id: 'bytecode', label: '.class bytecode' },
      { id: 'loader', label: 'Class Loader' },
      { id: 'runtime', label: 'Runtime Data Areas', topicId: 'heap-vs-stack', description: 'Heap, stack, metaspace and more.' },
      { id: 'exec', label: 'Interpreter / JIT' },
      { id: 'cpu', label: 'CPU' },
    ],
    edges: [
      { from: 'source', to: 'javac' },
      { from: 'javac', to: 'bytecode' },
      { from: 'bytecode', to: 'loader' },
      { from: 'loader', to: 'runtime' },
      { from: 'runtime', to: 'exec' },
      { from: 'exec', to: 'cpu' },
    ],
  },
  {
    id: 'heap-stack-memory',
    topicId: 'heap-vs-stack',
    type: 'memory',
    title: 'Heap vs Stack',
    description: 'Where objects and local variables actually live at runtime.',
    memoryTip: 'Stack is per-thread and short-lived. Heap is shared and GC-managed.',
    columns: [
      {
        label: 'Stack (per thread)',
        nodes: [
          { id: 'frame', label: 'Stack frame per method call' },
          { id: 'locals', label: 'Local variables & references' },
          { id: 'primitives', label: 'Primitive values stored directly' },
        ],
      },
      {
        label: 'Heap (shared)',
        nodes: [
          { id: 'objects', label: 'All objects and arrays' },
          { id: 'gc-managed', label: 'Reclaimed by the garbage collector', topicId: 'garbage-collection' },
          { id: 'metaspace', label: 'Class metadata lives in Metaspace, not the heap' },
        ],
      },
    ],
  },
  {
    id: 'gc-flow',
    topicId: 'garbage-collection',
    type: 'lifecycle',
    title: 'A conceptual object lifecycle under generational GC',
    description: 'A simplified, conceptual path most generational collectors follow. Exact behavior is collector- and JVM-version-specific.',
    memoryTip: 'Young objects die young. Survivors graduate to the old generation.',
    nodes: [
      { id: 'alloc', label: 'Object allocated' },
      { id: 'young', label: 'Young generation (Eden)' },
      { id: 'minor-gc', label: 'Minor GC — unreachable objects reclaimed' },
      { id: 'survivor', label: 'Survives repeated minor GCs' },
      { id: 'old', label: 'Promoted to old generation' },
      { id: 'major-gc', label: 'Major / full GC reclaims old generation' },
    ],
    edges: [
      { from: 'alloc', to: 'young' },
      { from: 'young', to: 'minor-gc' },
      { from: 'minor-gc', to: 'survivor' },
      { from: 'survivor', to: 'old' },
      { from: 'old', to: 'major-gc' },
    ],
  },
  {
    id: 'arraylist-linkedlist-comparison',
    topicId: 'arraylist-vs-linkedlist',
    type: 'comparison',
    title: 'ArrayList vs LinkedList',
    memoryTip: 'Array = fast random access. Linked = fast insert/remove at the ends.',
    columns: [
      {
        label: 'ArrayList',
        nodes: [
          { id: 'al-backing', label: 'Backed by a resizable array' },
          { id: 'al-get', label: 'get(index) is O(1)' },
          { id: 'al-insert', label: 'Insert/remove in the middle is O(n) — shifts elements' },
          { id: 'al-cache', label: 'Cache-friendly contiguous memory layout' },
        ],
      },
      {
        label: 'LinkedList',
        nodes: [
          { id: 'll-backing', label: 'Backed by doubly-linked nodes' },
          { id: 'll-get', label: 'get(index) is O(n) — must walk the list' },
          { id: 'll-insert', label: 'Insert/remove at the ends is O(1)' },
          { id: 'll-overhead', label: 'Extra per-node memory overhead for prev/next pointers' },
        ],
      },
    ],
  },
  {
    id: 'hashmap-chm-comparison',
    topicId: 'hashmap-vs-concurrenthashmap',
    type: 'comparison',
    title: 'HashMap vs ConcurrentHashMap',
    memoryTip: 'HashMap is fast but unsafe under concurrent writes. ConcurrentHashMap trades a little speed for real thread-safety.',
    columns: [
      {
        label: 'HashMap',
        nodes: [
          { id: 'hm-safety', label: 'Not thread-safe — concurrent modification can corrupt state or loop forever' },
          { id: 'hm-null', label: 'Allows one null key and multiple null values' },
          { id: 'hm-perf', label: 'No synchronization overhead in single-threaded use' },
        ],
      },
      {
        label: 'ConcurrentHashMap',
        nodes: [
          { id: 'chm-safety', label: 'Thread-safe for concurrent reads and writes' },
          { id: 'chm-lock', label: 'Locks at a fine granularity (bucket/bin level), not the whole map' },
          { id: 'chm-null', label: 'Disallows null keys and null values entirely' },
          { id: 'chm-iter', label: 'Iterators are weakly consistent, not fail-fast' },
        ],
      },
    ],
  },
  {
    id: 'synchronized-lock-comparison',
    topicId: 'synchronized-vs-lock',
    type: 'comparison',
    title: 'synchronized vs Lock',
    memoryTip: 'synchronized is simpler and always released. Lock is more flexible but you must release it yourself.',
    columns: [
      {
        label: 'synchronized',
        nodes: [
          { id: 'sync-syntax', label: 'Language keyword — block or method level' },
          { id: 'sync-release', label: 'Automatically released, even on exception' },
          { id: 'sync-fair', label: 'No built-in fairness or timeout control' },
        ],
      },
      {
        label: 'Lock (java.util.concurrent.locks)',
        nodes: [
          { id: 'lock-syntax', label: 'An interface (e.g. ReentrantLock) — must call unlock() explicitly' },
          { id: 'lock-try', label: 'Supports tryLock() with timeout, and interruptible acquisition' },
          { id: 'lock-fair', label: 'Can be configured for fairness; supports multiple Condition queues' },
        ],
      },
    ],
  },
  {
    id: 'thread-lifecycle',
    topicId: 'thread',
    type: 'lifecycle',
    title: 'Thread lifecycle',
    memoryTip: 'A thread moves through these states; it never goes back to NEW.',
    nodes: [
      { id: 'new', label: 'NEW — created, not yet started' },
      { id: 'runnable', label: 'RUNNABLE — eligible to run or running' },
      { id: 'blocked', label: 'BLOCKED — waiting for a monitor lock' },
      { id: 'waiting', label: 'WAITING / TIMED_WAITING — waiting on another thread' },
      { id: 'terminated', label: 'TERMINATED — run() has completed' },
    ],
    edges: [
      { from: 'new', to: 'runnable' },
      { from: 'runnable', to: 'blocked' },
      { from: 'blocked', to: 'runnable' },
      { from: 'runnable', to: 'waiting' },
      { from: 'waiting', to: 'runnable' },
      { from: 'runnable', to: 'terminated' },
    ],
  },
  {
    id: 'virtual-threads-architecture',
    topicId: 'virtual-threads',
    type: 'architecture',
    title: 'Many virtual threads, few carrier threads',
    description: 'Conceptual scheduling model. Exact mounting/unmounting behavior is JDK-version-specific — see the topic page for nuances.',
    memoryTip: 'Virtual threads are cheap and many; carrier threads are the scarce OS resource they borrow.',
    nodes: [
      { id: 'vthreads', label: 'Many virtual threads (thousands+)' },
      { id: 'scheduler', label: 'JVM scheduler' },
      { id: 'carriers', label: 'A small pool of carrier (platform) threads', topicId: 'thread' },
      { id: 'cpu-io', label: 'CPU / blocking I/O' },
    ],
    edges: [
      { from: 'vthreads', to: 'scheduler' },
      { from: 'scheduler', to: 'carriers' },
      { from: 'carriers', to: 'cpu-io' },
    ],
  },
  {
    id: 'structured-concurrency-flow',
    topicId: 'structured-concurrency',
    type: 'flow',
    title: 'A structured concurrency scope',
    description: 'StructuredTaskScope is still a preview API (6th preview as of JDK 26) — syntax has changed across previews.',
    memoryTip: 'Subtasks never outlive the scope that forked them.',
    nodes: [
      { id: 'open', label: 'Open a scope' },
      { id: 'fork', label: 'fork() subtasks', topicId: 'virtual-threads', description: 'Subtasks typically run on virtual threads.' },
      { id: 'join', label: 'join() waits for the join policy to be satisfied' },
      { id: 'handle', label: 'Handle results or the first failure' },
      { id: 'close', label: 'Scope closes — any unfinished subtasks are cancelled' },
    ],
    edges: [
      { from: 'open', to: 'fork' },
      { from: 'fork', to: 'join' },
      { from: 'join', to: 'handle' },
      { from: 'handle', to: 'close' },
    ],
  },
  {
    id: 'stream-flow',
    topicId: 'stream',
    type: 'code-flow',
    title: 'A stream pipeline',
    memoryTip: 'Nothing runs until the terminal operation is called — intermediate ops are lazy.',
    nodes: [
      { id: 'source', label: 'Collection / array / generator' },
      { id: 'stream', label: 'stream()' },
      { id: 'filter', label: 'filter()' },
      { id: 'map', label: 'map()' },
      { id: 'terminal', label: 'terminal operation (e.g. collect, sum, forEach)' },
      { id: 'result', label: 'result' },
    ],
    edges: [
      { from: 'source', to: 'stream' },
      { from: 'stream', to: 'filter' },
      { from: 'filter', to: 'map' },
      { from: 'map', to: 'terminal' },
      { from: 'terminal', to: 'result' },
    ],
  },
];

export function getVisual(id: string) {
  return javaVisuals.find((v) => v.id === id);
}
