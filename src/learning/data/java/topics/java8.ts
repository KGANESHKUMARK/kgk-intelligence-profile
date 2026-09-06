import type { LearningTopic } from '../../../types';

export const java8Topics: LearningTopic[] = [
  {
    id: 'lambda',
    technology: 'java',
    title: 'Lambda Expressions',
    category: 'Java 8+',
    slug: 'lambda',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'A compact, inline way to implement a functional interface (an interface with exactly one abstract method) without a named class.',
    mentalModel: 'A lambda is an anonymous class with the ceremony removed — just the parameters and the body of the one method that matters.',
    memoryTip: '(params) -> expression-or-block, wherever a single-method interface is expected.',
    keyTerms: ['functional interface', 'method reference', 'target typing', 'SAM conversion'],
    introducedIn: 8,
    featureStatus: 'stable',
    interviewAnswer:
      'A lambda expression is shorthand for implementing a functional interface — an interface with a single abstract method, like Runnable, Comparator, or any custom @FunctionalInterface. Instead of writing an anonymous inner class, you write (parameters) -> body, and the compiler infers which functional interface it should implement from the context (target typing). Delivered in Java 8 via JEP 126, alongside method references and default/static interface methods.',
    detailedExplanation:
      'Lambdas don\u2019t introduce a new kind of object — at the bytecode level they\u2019re typically implemented via invokedynamic and generated classes at runtime (not one synthetic class per lambda site, unlike old-style anonymous classes), which is part of why they have lower overhead than anonymous classes for this use case. A lambda can capture effectively-final local variables from its enclosing scope, but it cannot reassign them.',
    codeExample:
      'Comparator<String> byLength = (a, b) -> a.length() - b.length();\nList<String> names = new ArrayList<>(List.of("Singapore", "AI", "Java"));\nnames.sort(byLength);\nSystem.out.println(names);',
    codeOutput: '[AI, Java, Singapore]',
    whyOutput:
      'The comparator sorts by string length ascending: "AI" (2), "Java" (4), "Singapore" (9) — so the shortest string comes first.',
    practicalExample:
      'Passing a lambda directly to Stream operations (filter, map, sorted) or to Collections.sort() is by far the most common real-world use — it replaces what used to be a boilerplate anonymous Comparator or Runnable class with a single line.',
    commonMistakes: [
      'Trying to reassign a captured local variable inside a lambda — captured locals must be effectively final.',
      'Overusing lambdas for complex, multi-step logic where a named method would be clearer.',
      'Confusing a lambda with a full closure that can mutate the enclosing scope\u2019s local variables — Java lambdas cannot.',
    ],
    seniorInsight:
      'Method references (String::toUpperCase, System.out::println) are often clearer than an equivalent lambda when the lambda body is just "call this one existing method" — prefer them when they read naturally.',
    prerequisites: [],
    relatedTopics: ['stream', 'optional'],
    nextTopics: ['stream'],
    references: [
      {
        title: 'JEP 126: Lambda Expressions & Virtual Extension Methods',
        url: 'https://openjdk.org/jeps/126',
        source: 'OpenJDK',
        type: 'jep',
        version: 8,
        status: 'stable',
      },
    ],
    interviewQuestions: ['q-lambda-vs-anonymous-class', 'q-functional-interface'],
  },

  {
    id: 'stream',
    technology: 'java',
    title: 'Streams',
    category: 'Java 8+',
    slug: 'stream',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A lazy pipeline of operations (filter, map, reduce, ...) over a source of data, evaluated only when a terminal operation is invoked.',
    mentalModel: 'A stream is a conveyor belt: nothing moves until the terminal operation switches it on, and intermediate stations (filter, map) only ever inspect items as they pass, never store the whole belt.',
    memoryTip: 'Intermediate ops are lazy. Nothing runs until a terminal op is called.',
    keyTerms: ['intermediate operation', 'terminal operation', 'lazy evaluation', 'parallelStream'],
    introducedIn: 8,
    featureStatus: 'stable',
    visualIds: ['stream-flow'],
    interviewAnswer:
      'A Stream represents a sequence of elements from a source (a collection, array, or generator) supporting a pipeline of operations. Intermediate operations (filter, map, sorted, ...) are lazy — calling them just builds up the pipeline description, without touching any data. Only a terminal operation (collect, forEach, reduce, sum, ...) actually triggers traversal of the source, applying every intermediate step to each element as it flows through. Delivered in Java 8 via JEP 107, originally described as "filter/map/reduce for Java."',
    detailedExplanation:
      'Because a stream has no storage of its own (it doesn\u2019t hold a copy of the data), it can only be consumed once — calling a terminal operation on an already-consumed stream throws IllegalStateException. Streams can run serially (the default) or in parallel (via parallelStream() or .parallel()), which internally uses the common ForkJoinPool to split the source and combine partial results — appropriate for CPU-bound work over large datasets, not for small collections or I/O-bound tasks.',
    codeExample:
      'List<String> names = List.of("Alice", "Bob", "Charlie", "Ann");\nList<String> result = names.stream()\n    .filter(n -> n.length() > 3)\n    .map(String::toUpperCase)\n    .sorted()\n    .toList();\nSystem.out.println(result);',
    codeOutput: '[ALICE, CHARLIE]',
    whyOutput:
      'filter keeps names longer than 3 characters ("Alice" and "Charlie"; "Bob" and "Ann" are dropped), map uppercases them, and sorted() orders them alphabetically — "ALICE" before "CHARLIE".',
    practicalExample:
      'Transforming a list of raw transaction records into a filtered, grouped summary (e.g. total amount per currency) reads far more declaratively as a stream pipeline (filter \u2192 groupingBy \u2192 summingDouble) than as a hand-written loop with mutable accumulator variables.',
    commonMistakes: [
      'Trying to reuse a stream after a terminal operation has already consumed it.',
      'Using parallelStream() on a small collection or for I/O-bound work, where the fork/join overhead outweighs any benefit — or where the common pool contends with unrelated parallel work.',
      'Writing side-effecting lambdas inside map()/filter() (e.g. mutating external state), which breaks the assumption that stream operations are stateless and safely reorderable/parallelizable.',
    ],
    seniorInsight:
      'Because parallelStream() uses the shared common ForkJoinPool by default, an unrelated blocking task submitted to that same pool elsewhere in the application can stall unrelated parallel streams — this is a subtle production gotcha worth knowing before reaching for parallelStream() casually.',
    aiAwareness: {
      strongAnswerShouldMention: ['lazy intermediate operations', 'terminal operation triggers evaluation', 'single-use', 'parallelStream uses the common pool'],
      weakAnswer: 'Streams let you filter and map over a list.',
      redFlags: ['Cannot explain why intermediate operations are lazy', 'Assumes parallelStream() is always faster'],
      likelyFollowUp: [
        'What is the difference between an intermediate and a terminal operation?',
        'Can you reuse a stream? Why or why not?',
        'When would parallelStream() hurt performance instead of helping?',
      ],
    },
    prerequisites: ['lambda'],
    relatedTopics: ['lambda', 'optional'],
    nextTopics: ['optional'],
    references: [
      {
        title: 'JEP 107: Bulk Data Operations for Collections',
        url: 'https://openjdk.org/jeps/107',
        source: 'OpenJDK',
        type: 'jep',
        version: 8,
        status: 'stable',
      },
      {
        title: 'java.util.stream — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html',
        source: 'Oracle',
        type: 'api',
        version: 21,
      },
    ],
    interviewQuestions: ['q-stream-intermediate-vs-terminal', 'q-stream-laziness', 'q-map-vs-flatmap', 'q-collectors-groupingby'],
  },

  {
    id: 'optional',
    technology: 'java',
    title: 'Optional',
    category: 'Java 8+',
    slug: 'optional',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning: 'A container type that explicitly represents "a value, or no value," designed to make the absence of a result visible in an API\u2019s signature.',
    mentalModel: 'Optional is a labelled box: it always tells you upfront whether there\u2019s something inside, instead of letting you find out the hard way with a NullPointerException.',
    memoryTip: 'A return-type tool, not a general-purpose null replacement — avoid Optional fields and parameters.',
    keyTerms: ['orElse', 'map', 'isPresent', 'null safety'],
    introducedIn: 8,
    featureStatus: 'stable',
    interviewAnswer:
      'Optional<T> is a container that either holds a non-null value or holds nothing, used primarily as a method return type to make "this might not have a result" explicit and checkable at compile time, rather than relying on callers remembering that a method might return null. It supports functional-style handling (map, filter, orElse, orElseGet, orElseThrow) so callers can chain logic without an explicit null check.',
    detailedExplanation:
      'Optional is intended specifically for return types where absence is a normal, expected outcome. It is explicitly not recommended for fields, method parameters, or collection elements — putting Optional in those places adds indirection and serialization complications without the main benefit (a clearer public API contract), and Optional itself is not Serializable.',
    codeExample:
      'Optional<String> found = Optional.empty();\nString greeting = found.map(n -> "Hello, " + n).orElse("Hello, stranger");\nSystem.out.println(greeting);',
    codeOutput: 'Hello, stranger',
    whyOutput:
      'map() on an empty Optional short-circuits and stays empty (the mapping function is never invoked), so orElse() returns its fallback value instead of a mapped greeting.',
    practicalExample:
      'A repository method like findAccountById(id) returning Optional<Account> forces every caller to explicitly decide what happens when the account doesn\u2019t exist, at compile time — instead of a null slipping through and surfacing as a NullPointerException several calls later, far from the actual cause.',
    commonMistakes: [
      'Calling .get() without checking isPresent() first — this just reintroduces the same "might throw" problem Optional was meant to avoid, via NoSuchElementException instead of NullPointerException.',
      'Using Optional as a field type or method parameter type, against the JDK team\u2019s own guidance.',
      'Wrapping a value in Optional.of(x) when x might be null — Optional.of() throws immediately on null; Optional.ofNullable(x) is the null-safe constructor.',
    ],
    seniorInsight:
      'orElseThrow(Supplier) lets you convert an absent value into a specific, meaningful exception at the exact point of absence — often a better choice than a generic .get() call buried in business logic.',
    prerequisites: ['lambda'],
    relatedTopics: ['stream'],
    references: [
      {
        title: 'Optional<T> — Java SE API Documentation',
        url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html',
        source: 'Oracle',
        type: 'api',
        version: 21,
      },
    ],
    interviewQuestions: ['q-optional-purpose-misuse', 'q-checked-exceptions-in-streams'],
  },
];
