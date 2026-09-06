/**
 * TERM NORMALIZATION — turns any surface form of a term into a lookup key,
 * and maps common aliases/abbreviations onto canonical topic/glossary ids.
 *
 * "HashMap", "Hash Map" and "java.util.HashMap" must all resolve to the same
 * canonical id ("hashmap"). Never create hash-map / HashMap / HashMap() as
 * separate ids — add the surface form to ALIASES instead.
 */

/** Lowercase, strip punctuation/whitespace/parens to dashes, collapse. */
export function normalizeTerm(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^java\.util\.(concurrent\.)?/, '')
    .replace(/\(\)$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Alias -> canonical id. Keys are already normalized forms; add new surface
 * forms here rather than inventing a new topic id.
 */
export const ALIASES: Record<string, string> = {
  // Collections
  hashmap: 'hashmap',
  'hash-map': 'hashmap',
  'java-util-hashmap': 'hashmap',
  hashcode: 'hashcode',
  'hash-code': 'hashcode',
  equals: 'equals',
  'object-equals': 'equals',
  'object-contract': 'object-contract',
  'equals-hashcode-contract': 'object-contract',
  arraylist: 'arraylist-vs-linkedlist',
  'array-list': 'arraylist-vs-linkedlist',
  linkedlist: 'arraylist-vs-linkedlist',
  'linked-list': 'arraylist-vs-linkedlist',
  'arraylist-vs-linkedlist': 'arraylist-vs-linkedlist',
  concurrenthashmap: 'hashmap-vs-concurrenthashmap',
  chm: 'hashmap-vs-concurrenthashmap',
  'concurrent-hash-map': 'hashmap-vs-concurrenthashmap',
  'hashmap-vs-concurrenthashmap': 'hashmap-vs-concurrenthashmap',

  // Concurrency
  thread: 'thread',
  threads: 'thread',
  executorservice: 'executorservice',
  'executor-service': 'executorservice',
  executor: 'executorservice',
  synchronized: 'synchronized-vs-lock',
  lock: 'synchronized-vs-lock',
  reentrantlock: 'synchronized-vs-lock',
  'synchronized-vs-lock': 'synchronized-vs-lock',
  'virtual-thread': 'virtual-threads',
  'virtual-threads': 'virtual-threads',
  'project-loom': 'virtual-threads',
  'structured-concurrency': 'structured-concurrency',
  structuredtaskscope: 'structured-concurrency',
  completablefuture: 'executorservice',
  'completable-future': 'executorservice',

  // JVM & memory
  jvm: 'jvm',
  'java-virtual-machine': 'jvm',
  // Note: JMM (Java Memory Model) has no dedicated topic page in this phase —
  // it resolves via the glossary only. Do not alias it to a topic id here.
  heap: 'heap-vs-stack',
  stack: 'heap-vs-stack',
  'heap-vs-stack': 'heap-vs-stack',
  gc: 'garbage-collection',
  'garbage-collection': 'garbage-collection',
  'garbage-collector': 'garbage-collection',
  g1: 'garbage-collection',
  zgc: 'garbage-collection',
  jit: 'jvm',
  'just-in-time-compiler': 'jvm',
  jfr: 'garbage-collection',
  jcmd: 'garbage-collection',

  // Java 8+
  lambda: 'lambda',
  'lambda-expression': 'lambda',
  'lambda-expressions': 'lambda',
  'functional-interface': 'lambda',
  stream: 'stream',
  streams: 'stream',
  optional: 'optional',
};

/** Resolve any surface form to a canonical id, or undefined if unknown. */
export function resolveAlias(input: string): string | undefined {
  return ALIASES[normalizeTerm(input)];
}
