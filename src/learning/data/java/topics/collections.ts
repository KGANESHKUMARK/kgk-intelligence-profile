import type { LearningTopic } from '../../../types';

export const collectionsTopics: LearningTopic[] = [
  {
    id: 'hashmap',
    technology: 'java',
    title: 'HashMap',
    category: 'Collections',
    slug: 'hashmap',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A hash-table-based Map that locates entries by hashing the key rather than scanning every entry.',
    mentalModel: 'Bucket-based key/value lookup: the hash gets you to roughly the right shelf, equals() confirms which box on that shelf is yours.',
    memoryTip: 'Hash gets you close. Equals proves it.',
    keyTerms: ['hashCode', 'equals', 'bucket', 'collision', 'load factor', 'resize'],
    visualIds: ['hashmap-flow'],
    interviewAnswer:
      'A HashMap stores key-value pairs in buckets chosen by the key\u2019s hashCode(). To read or write an entry it computes the hash, picks a bucket, and — if more than one key landed in that bucket — uses equals() to find the exact match. Average-case get/put is O(1); worst case, if many keys collide, degrades toward O(log n) in modern JDKs because large buckets are treated as a small tree.',
    detailedExplanation:
      'Internally, a HashMap holds an array of buckets. put(key, value) computes key.hashCode(), spreads those bits (HashMap applies a supplemental hash function to reduce clustering) and maps the result onto an array index using (capacity - 1) & hash. If the bucket is empty, the entry is inserted directly. If not, the map walks the existing chain at that bucket, calling equals() on each existing key to check whether this is an update to an existing entry or a new collision. When the number of entries exceeds capacity * loadFactor (default 0.75 * 16 = 12), the table resizes: a new, larger array is allocated (double the capacity) and every entry is rehashed into it.',
    internalWorking:
      'Since Java 8, a bucket that accumulates too many colliding entries (by default, 8 or more) is internally converted from a linked list to a small red-black tree, turning worst-case lookup within that bucket from O(n) to O(log n). This only matters when hashCode() is a poor hash or is deliberately abused; with a reasonable hashCode() distribution it is rarely observed in practice.',
    codeExample:
      'Map<String, Integer> ages = new HashMap<>();\nages.put("Alice", 30);\nages.put("Bob", 25);\nages.put("Alice", 31); // same key -> overwrites\n\nSystem.out.println(ages.get("Alice"));\nSystem.out.println(ages.size());\nSystem.out.println(ages.getOrDefault("Charlie", -1));',
    codeOutput: '31\n2\n-1',
    whyOutput:
      'put("Alice", 31) hashes to the same bucket as the first "Alice" entry, and equals() confirms it\u2019s the same key, so the value is overwritten in place rather than added as a second entry — size stays 2. "Charlie" was never inserted, so getOrDefault falls back to -1 instead of returning null.',
    practicalExample:
      'A portfolio lookup service keying a Map<String, Portfolio> by portfolio ID is a classic HashMap use: O(1) average lookup by ID during batch valuation, instead of scanning a list. The moment two different portfolio IDs (as Strings) are logically equal, HashMap relies entirely on String\u2019s well-tested hashCode()/equals() pair to keep lookups correct.',
    commonMistakes: [
      'Overriding equals() without overriding hashCode() — breaks the contract and makes lookups silently fail (see the Object Contract topic).',
      'Using a mutable object as a key and then mutating a field that participates in hashCode() — the entry becomes unreachable at its old bucket.',
      'Assuming HashMap preserves insertion or sorted order — it makes no ordering guarantee at all (use LinkedHashMap or TreeMap instead).',
      'Assuming HashMap is thread-safe for concurrent writes — it is not (see HashMap vs ConcurrentHashMap).',
    ],
    seniorInsight:
      'The resize (rehash) operation is O(n) and happens synchronously on whatever thread triggers it — for very large maps built incrementally, pre-sizing the initial capacity (if the expected size is known) avoids repeated doubling and rehashing. Also: a poorly distributed hashCode() (e.g. always returning 0) silently degrades every operation to effectively a linked-list scan, even with the treeification safeguard providing only partial mitigation.',
    aiAwareness: {
      strongAnswerShouldMention: ['hashCode()', 'equals()', 'bucket', 'collision', 'load factor', 'resize', 'treeification'],
      weakAnswer: 'It stores key-value pairs and you can get them back by key.',
      redFlags: ['Claims HashMap preserves insertion order', 'Cannot explain what happens when two keys collide', 'Says HashMap is thread-safe'],
      likelyFollowUp: [
        'How does it determine which bucket an entry goes into?',
        'What happens on a hash collision?',
        'When does resizing occur, and what does it cost?',
        'Is HashMap thread-safe? What would you use instead?',
      ],
    },
    followUpQuestions: [
      'What happens if two different keys have the same hashCode()?',
      'Why must equal objects have equal hashCodes?',
      'What changed about collision handling in Java 8?',
    ],
    prerequisites: ['hashcode', 'equals'],
    relatedTopics: ['object-contract', 'hashmap-vs-concurrenthashmap', 'arraylist-vs-linkedlist'],
    nextTopics: ['object-contract', 'hashmap-vs-concurrenthashmap'],
    references: [
      {
        title: 'HashMap<K,V> — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-hashmap-internals', 'q-load-factor-resize', 'q-hashmap-thread-safety'],
  },

  {
    id: 'hashcode',
    technology: 'java',
    title: 'hashCode()',
    category: 'Collections',
    slug: 'hashcode',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A method every object has that returns an int summary of its state, used to place it into a hash-based bucket.',
    mentalModel: 'hashCode() is a fast, approximate address label — it narrows the search to one shelf, it does not prove identity.',
    memoryTip: 'Equal objects MUST share a hashCode. Equal hashCodes do NOT mean equal objects.',
    keyTerms: ['bucket', 'collision', 'Object contract', 'Objects.hash'],
    interviewAnswer:
      'hashCode() returns an int derived from an object\u2019s state, used by hash-based collections (HashMap, HashSet, HashTable) to pick a bucket in O(1) instead of scanning every element. The contract requires that two objects considered equal() must return the same hashCode(); the reverse is not required — different objects may share a hashCode (a collision), which equals() then resolves.',
    detailedExplanation:
      'The default Object.hashCode() is typically derived from the object\u2019s memory address/identity, so two logically identical-but-distinct instances get different default hashCodes. Whenever a class overrides equals() to mean "logically the same", it must also override hashCode() so that logically-equal instances hash identically — otherwise hash-based collections will fail to find entries that ARE equal, because they never even land in the same bucket to be compared.',
    codeExample:
      'class Point {\n    int x, y;\n    Point(int x, int y) { this.x = x; this.y = y; }\n\n    @Override\n    public boolean equals(Object o) {\n        if (!(o instanceof Point p)) return false;\n        return x == p.x && y == p.y;\n    }\n    // hashCode() intentionally NOT overridden\n}\n\nSet<Point> points = new HashSet<>();\npoints.add(new Point(1, 2));\nSystem.out.println(points.contains(new Point(1, 2)));',
    codeOutput: 'false',
    whyOutput:
      'HashSet.contains() first computes hashCode() to pick a bucket, and only then calls equals() within that bucket. Because Point never overrides hashCode(), the two instances get different (identity-based) hashCodes and are checked against different buckets — equals() is never even called, so the logically-equal point is reported as not contained.',
    practicalExample:
      'Any domain key object (e.g. a TransactionId value object wrapping a String and a date) used as a HashMap key must override both equals() and hashCode() together, usually via Objects.hash(field1, field2, ...) or a record, which generates both automatically.',
    commonMistakes: [
      'Overriding equals() but forgetting hashCode() (or vice versa).',
      'Computing hashCode() from mutable fields that change after the object is inserted into a hash-based collection.',
      'Assuming a "good" hashCode must be unique — it only needs to be consistent and reasonably well distributed.',
    ],
    seniorInsight:
      'Records (Java 16+) generate a consistent equals()/hashCode()/toString() automatically from their components, which removes an entire category of this class of bug for simple data carriers.',
    aiAwareness: {
      strongAnswerShouldMention: ['bucket placement', 'equal objects must have equal hashCodes', 'collisions are allowed and resolved by equals()'],
      weakAnswer: 'It returns a unique number for the object.',
      redFlags: ['Claims hashCode() must be unique per object', 'Cannot state the equals/hashCode contract direction correctly'],
      likelyFollowUp: ['What breaks if you override equals() without hashCode()?', 'Is a hashCode collision a bug?'],
    },
    prerequisites: [],
    relatedTopics: ['equals', 'object-contract', 'hashmap'],
    nextTopics: ['equals', 'object-contract'],
    references: [
      {
        title: 'Object#hashCode() — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-equals-hashcode-contract'],
  },

  {
    id: 'equals',
    technology: 'java',
    title: 'equals()',
    category: 'Collections',
    slug: 'equals',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'The method that defines logical equality between two objects, as opposed to == which checks reference identity.',
    mentalModel: '== asks "is this the same box?" equals() asks "do these boxes contain the same thing?"',
    memoryTip: '== compares references. equals() compares content — if you override it.',
    keyTerms: ['reference identity', 'logical equality', 'Object contract', 'String pool'],
    interviewAnswer:
      '== compares references for objects (whether two variables point to the exact same instance), while equals() — when meaningfully overridden — compares logical content. Object\u2019s default equals() is actually just reference equality; classes like String, and any class that overrides equals(), define what "equal" means for their own state.',
    detailedExplanation:
      'For primitives, == compares values directly. For reference types, == always compares whether two references point to the same object in memory, regardless of content. equals() is a regular method, so it does exactly what its override says — for String, two different String objects with the same characters are equal() but may not be ==, especially when at least one is built with new String(...), which deliberately creates a new heap object outside the interned string pool.',
    codeExample:
      'String a = new String("java");\nString b = new String("java");\n\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));',
    codeOutput: 'false\ntrue',
    whyOutput:
      'new String("java") explicitly allocates a new String object on the heap rather than reusing the interned literal, so a and b are two distinct objects — == (reference identity) is false. equals() is overridden by String to compare character content, which is identical, so it returns true.',
    practicalExample:
      'Comparing two currency codes read from different systems (e.g. one from a Kafka event, one from a database row) should always use equals(), never == — even though String literals are often interned and would coincidentally pass with ==, relying on that is fragile and breaks the moment either value is built dynamically (e.g. via substring() or string concatenation).',
    commonMistakes: [
      'Using == to compare Strings or boxed types (Integer, Long) and getting lucky due to literal interning or the Integer cache (-128..127), masking the bug until a value falls outside that range.',
      'Overriding equals() without also overriding hashCode(), breaking hash-based collections.',
      'Writing an equals() that is not symmetric, transitive, or consistent (see Object Contract).',
    ],
    seniorInsight:
      'The Integer autoboxing cache (-128 to 127) is a well-known interview trap: Integer.valueOf(100) == Integer.valueOf(100) is true, but Integer.valueOf(200) == Integer.valueOf(200) is false, purely because of caching — it is not a reliable equality check and should never be relied upon.',
    aiAwareness: {
      strongAnswerShouldMention: ['reference identity', 'logical equality', 'String interning', 'Object contract'],
      weakAnswer: '== checks if two things are the same and equals() also checks if two things are the same.',
      redFlags: ['Cannot explain why new String("x") == "x" is false', 'Says == and equals() always behave the same for objects'],
      likelyFollowUp: ['Why might two equal Strings not be ==?', 'What is the equals/hashCode contract?', 'What is the Integer cache trap?'],
    },
    prerequisites: [],
    relatedTopics: ['hashcode', 'object-contract', 'hashmap'],
    nextTopics: ['object-contract'],
    references: [
      {
        title: 'Object#equals(Object) — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-equals-hashcode-contract'],
  },

  {
    id: 'object-contract',
    technology: 'java',
    title: 'The equals()/hashCode() Object Contract',
    category: 'Collections',
    slug: 'object-contract',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The formal rules equals() and hashCode() must jointly satisfy for hash-based collections to behave correctly.',
    mentalModel: 'Two doors into the same room must always agree — if equals() says "same", hashCode() must agree on which room.',
    memoryTip: 'Reflexive. Symmetric. Transitive. Consistent. Equal implies equal hash.',
    keyTerms: ['reflexive', 'symmetric', 'transitive', 'consistent', 'Objects.hash'],
    interviewAnswer:
      'The contract, defined on Object, requires equals() to be reflexive (x.equals(x) is true), symmetric (x.equals(y) implies y.equals(x)), transitive (x.equals(y) and y.equals(z) implies x.equals(z)), and consistent (repeated calls return the same result if neither object changed) — and critically, if x.equals(y) is true, then x.hashCode() must equal y.hashCode(). Violating any of these breaks HashMap, HashSet and any code that relies on them.',
    detailedExplanation:
      'The hashCode() requirement is one-directional: equal objects must produce equal hashes, but unequal objects are allowed (and expected, at scale) to sometimes share a hash — that is simply a collision, resolved by equals(). Violations most often happen when equals() compares a subset of fields that later gets out of sync with what hashCode() uses, or when equals() is defined in a way that is not symmetric across a class hierarchy (e.g. a subclass adding fields to equals() while the superclass\u2019s equals() ignores them).',
    practicalExample:
      'A record class in modern Java generates equals(), hashCode() and toString() automatically from its components, guaranteeing the contract holds without hand-written boilerplate — this is one of the strongest practical reasons to prefer records for simple immutable data carriers.',
    commonMistakes: [
      'Comparing across a class hierarchy with getClass() in one class and instanceof in a subclass, breaking symmetry.',
      'Including a mutable, frequently-changing field in equals()/hashCode(), breaking consistency once the object is stored in a hash-based collection.',
      'Hand-writing equals()/hashCode() for different field subsets instead of generating both together (IDE, Objects.hash(), Lombok, or a record).',
    ],
    seniorInsight:
      'This contract is exactly why Effective Java\u2019s advice is: override hashCode() every time you override equals(), and prefer generating both together rather than by hand. Static analysis tools (SonarQube, Error Prone) flag one without the other precisely because this bug is silent — it doesn\u2019t throw, it just makes lookups quietly fail.',
    aiAwareness: {
      strongAnswerShouldMention: ['reflexive', 'symmetric', 'transitive', 'consistent', 'equal objects must have equal hashCodes'],
      weakAnswer: 'equals() and hashCode() need to match.',
      redFlags: ['Cannot name the four equals() properties', 'Thinks unequal objects must have different hashCodes'],
      likelyFollowUp: ['What specifically breaks if the contract is violated?', 'How do records help here?'],
    },
    prerequisites: ['hashcode', 'equals'],
    relatedTopics: ['hashmap'],
    nextTopics: ['hashmap'],
    references: [
      {
        title: 'Object#equals(Object) — contract definition',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-equals-hashcode-contract'],
  },

  {
    id: 'arraylist-vs-linkedlist',
    technology: 'java',
    title: 'ArrayList vs LinkedList',
    category: 'Collections',
    slug: 'arraylist-vs-linkedlist',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'Two List implementations with opposite performance trade-offs: contiguous array vs doubly-linked nodes.',
    mentalModel: 'ArrayList is a row of numbered mailboxes. LinkedList is a chain of people each holding the next person\u2019s hand.',
    memoryTip: 'Array = fast random access. Linked = fast insert/remove at the ends.',
    keyTerms: ['random access', 'amortized', 'doubly-linked', 'Deque'],
    visualIds: ['arraylist-linkedlist-comparison'],
    interviewAnswer:
      'ArrayList is backed by a resizable array, so get(index) is O(1) but inserting or removing from the middle is O(n) because subsequent elements must shift. LinkedList is backed by doubly-linked nodes, so get(index) is O(n) (it must walk from an end), but adding or removing at either end is O(1). In practice, ArrayList is the default choice; LinkedList is chosen specifically when you need a Deque with cheap head/tail operations.',
    practicalExample:
      'A batch job that appends millions of results and only ever iterates them start-to-end should use ArrayList — its cache-friendly contiguous layout makes iteration significantly faster in practice than LinkedList\u2019s pointer-chasing, despite both being "O(n) to iterate" in theory.',
    commonMistakes: [
      'Choosing LinkedList "for performance" without a specific head/tail-operation need — ArrayList is faster for the vast majority of real workloads, including most iteration-heavy ones.',
      'Calling get(i) in a loop on a LinkedList, silently turning an O(n) loop into O(n\u00b2).',
    ],
    seniorInsight:
      'Modern JDKs and JIT-friendly CPU cache behavior mean ArrayList usually outperforms LinkedList even for use cases LinkedList was theoretically designed for, unless the access pattern is genuinely queue/deque-like — java.util.ArrayDeque is often a better "linked-list-like" choice than LinkedList itself for pure queue/stack use cases.',
    prerequisites: [],
    relatedTopics: ['hashmap-vs-concurrenthashmap'],
    references: [
      {
        title: 'ArrayList<E> — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html',
        source: 'Oracle',
        type: 'api',
      },
      {
        title: 'LinkedList<E> — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedList.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-arraylist-vs-linkedlist'],
  },

  {
    id: 'hashmap-vs-concurrenthashmap',
    technology: 'java',
    title: 'HashMap vs ConcurrentHashMap',
    category: 'Collections',
    slug: 'hashmap-vs-concurrenthashmap',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'HashMap is fast but unsafe under concurrent modification; ConcurrentHashMap is thread-safe with fine-grained locking.',
    mentalModel: 'HashMap is a shared notebook with no rules — two people writing at once can tear a page. ConcurrentHashMap only locks the page being written, not the whole notebook.',
    memoryTip: 'HashMap: fast, unsafe, allows one null key. ConcurrentHashMap: safe, no nulls at all.',
    keyTerms: ['thread safety', 'lock granularity', 'weakly consistent iterator', 'fail-fast'],
    visualIds: ['hashmap-chm-comparison'],
    interviewAnswer:
      'HashMap gives no thread-safety guarantees at all — concurrent structural modification (e.g. two threads calling put() during a resize) can corrupt internal state or, in older JDKs, even loop forever. ConcurrentHashMap is designed for concurrent access: it locks at a fine granularity (historically per-segment, now effectively per-bin) rather than locking the whole map, so many threads can read and write different parts concurrently. As a trade-off, ConcurrentHashMap disallows null keys and null values entirely, since null is ambiguous under concurrent access (you can\u2019t tell "absent" from "mapped to null" safely).',
    practicalExample:
      'A shared in-memory cache of exchange-rate lookups updated by multiple ingestion threads and read by many request-handling threads is a textbook ConcurrentHashMap use case — plain HashMap would be a data-corruption risk the moment two threads write concurrently.',
    commonMistakes: [
      'Wrapping a HashMap with Collections.synchronizedMap() and assuming that\u2019s equivalent to ConcurrentHashMap — it works, but serializes all access with a single lock, giving up the concurrency benefit.',
      'Assuming ConcurrentHashMap\u2019s size() or iteration reflects a single atomic snapshot — it is weakly consistent, not a live transactional view.',
      'Trying to insert a null key or value into a ConcurrentHashMap and being surprised by the NullPointerException.',
    ],
    seniorInsight:
      'ConcurrentHashMap also provides atomic compound operations — computeIfAbsent(), merge(), compute() — that let you implement check-then-act patterns (like a cache-fill) without a race, which is usually why it is chosen even over a manually-synchronized HashMap.',
    aiAwareness: {
      strongAnswerShouldMention: ['thread safety', 'fine-grained locking', 'no null keys/values', 'weakly consistent iteration'],
      weakAnswer: 'ConcurrentHashMap is the thread-safe version of HashMap.',
      redFlags: ['Cannot explain why ConcurrentHashMap disallows null', 'Thinks ConcurrentHashMap locks the whole map on every operation'],
      likelyFollowUp: ['Why does ConcurrentHashMap disallow null?', 'What would happen if two threads write to a HashMap at the same time?'],
    },
    prerequisites: ['hashmap'],
    relatedTopics: ['hashmap', 'synchronized-vs-lock'],
    references: [
      {
        title: 'ConcurrentHashMap<K,V> — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html',
        source: 'Oracle',
        type: 'api',
      },
    ],
    interviewQuestions: ['q-hashmap-vs-concurrenthashmap', 'q-hashmap-thread-safety'],
  },
];
