import type { LearningTopic } from '../../../types';

export const kafkaCoreTopics: LearningTopic[] = [
  {
    id: 'kafka-overview',
    technology: 'kafka',
    title: 'What is Kafka?',
    category: 'Core',
    slug: 'kafka-overview',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'Apache Kafka is a distributed, fault-tolerant event-streaming platform that durably records a high-throughput log of events and lets many consumers read them independently, at their own pace.',
    mentalModel:
      'Think of Kafka as a commit log in a database — every write is appended to an ordered sequence, never mutated, and readable by any number of readers from any point in the log at any time.',
    memoryTip:
      'Kafka = durable ordered log + independent consumers. Producers append. Consumers read. Nothing is deleted until the retention period expires.',
    keyTerms: ['event streaming', 'distributed log', 'topic', 'producer', 'consumer', 'broker', 'retention'],
    visualIds: ['kafka-cluster-architecture'],
    interviewAnswer:
      'Kafka is a distributed event-streaming platform built around a durable, replicated commit log. Producers write records to named topics; records are stored in ordered, immutable partitions across a cluster of brokers. Consumers read from partitions at their own pace using a stored offset, so multiple independent consumer groups can replay the same data without affecting each other. Kafka is designed for high throughput (millions of events per second), fault tolerance (replication), and real-time stream processing. Unlike traditional message queues, Kafka retains messages for a configurable period — not just until a consumer acknowledges them — making it suitable for event sourcing, audit trails, and replay.',
    detailedExplanation:
      'Kafka was originally built at LinkedIn to replace point-to-point data pipelines with a central, scalable event bus. Its core abstraction is the topic — a named, ordered, immutable sequence of records. Topics are split into partitions for horizontal scalability; each partition is an ordered queue independently replicated across brokers. A broker is a Kafka server; a cluster is multiple brokers. A record consists of a key, a value, a timestamp, and optional headers. Producers choose which partition a record goes to (by key hash, round-robin, or custom partitioner). Consumers read sequentially from one or more partitions, storing their position as an offset. Because offsets are consumer-owned, messages are not destroyed on read — they stay for the configured retention.period.ms.',
    practicalExample:
      'In a bank report-generation system (like the GOM project at Julius Baer), Kafka acts as the delivery bus: report-generation microservices publish AVRO-encoded "report ready" events to a Kafka topic; downstream systems (PDF renderer, email sender, regulatory archive) each consume independently, at their own throughput, without coupling to each other or to the report generator.',
    commonMistakes: [
      'Treating Kafka like a traditional queue where messages disappear on consume — Kafka retains messages until the retention window expires, regardless of consumer acknowledgements.',
      'Conflating Kafka with a database — Kafka is optimised for sequential log access, not random key lookups.',
      'Underestimating the operational complexity of managing a cluster: ZooKeeper (or KRaft in newer versions), partition leadership, ISR tuning.',
    ],
    seniorInsight:
      'Kafka excels when multiple independent consumers need the same event stream or when you need replay capability (audit, event sourcing, reprocessing after a bug fix). If you only have one consumer and never need replay, a simpler queue (RabbitMQ, IBM MQ) may have lower operational overhead.',
    aiAwareness: {
      strongAnswerShouldMention: ['commit log', 'partitions', 'offsets', 'consumer groups', 'retention', 'replication', 'high throughput'],
      weakAnswer: 'Kafka is a fast message broker like RabbitMQ.',
      redFlags: [
        'Saying messages are deleted after a consumer reads them.',
        'Not knowing what a partition or offset is.',
        'Confusing Kafka with a traditional request/reply messaging system.',
      ],
      likelyFollowUp: [
        'How does Kafka guarantee ordering?',
        'What happens if a consumer crashes?',
        'How is Kafka different from RabbitMQ or IBM MQ?',
      ],
    },
    relatedTopics: ['kafka-topic-partition', 'kafka-producer', 'kafka-consumer-group'],
    nextTopics: ['kafka-topic-partition', 'kafka-producer'],
    references: [
      { title: 'Apache Kafka Introduction', url: 'https://kafka.apache.org/intro', source: 'Apache', type: 'official' },
      { title: 'Kafka: The Definitive Guide (free PDF)', url: 'https://www.confluent.io/resources/kafka-the-definitive-guide/', source: 'Confluent', type: 'documentation' },
    ],
  },

  {
    id: 'kafka-topic-partition',
    technology: 'kafka',
    title: 'Topics & Partitions',
    category: 'Core',
    slug: 'kafka-topic-partition',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'A topic is a named, ordered log of records. A partition is a subdivision of that log — the unit of parallelism, scalability, and ordering in Kafka.',
    mentalModel:
      'A topic is like a database table name; a partition is like a physical file segment. Ordering is guaranteed within a partition, not across partitions.',
    memoryTip:
      'Key → same partition → ordering guaranteed. Round-robin (no key) → spread across partitions → no global order.',
    keyTerms: ['topic', 'partition', 'ordering', 'key', 'partitioner', 'log segment'],
    visualIds: ['kafka-cluster-architecture'],
    interviewAnswer:
      'A topic is a logical channel identified by a name. It is split into one or more partitions, each of which is an ordered, immutable sequence of records stored on disk. Records are appended to the end of a partition. Within a single partition, ordering is strictly preserved — records are read in the exact order they were written. Across partitions, there is no ordering guarantee. A producer controls partition assignment: if a record has a key, Kafka hashes the key to a consistent partition (so all records with the same key go to the same partition in the same order); if there is no key, records are distributed round-robin.',
    detailedExplanation:
      'Each partition is stored as a set of segment files on the broker\'s disk. A segment file is a sequence of records, each identified by its offset — a 64-bit integer that is unique within the partition. The number of partitions determines the maximum parallelism a consumer group can achieve: a consumer group can have at most as many active consumers as partitions. Adding partitions later does not rebalance existing keys — records already written to a partition stay there — so choose the initial partition count carefully based on expected throughput and consumer parallelism.',
    commonMistakes: [
      'Expecting global ordering across a multi-partition topic — only per-partition ordering is guaranteed.',
      'Setting partition count too low initially and discovering it limits consumer parallelism under load.',
      'Changing the partition count after the topic is live — this reshuffles key-to-partition mapping, breaking ordering for keyed producers.',
    ],
    seniorInsight:
      'A useful rule of thumb: start with a partition count equal to the target throughput (MB/s) divided by the expected per-partition throughput, and no fewer than your peak consumer group size. A common mistake is over-partitioning early: more partitions means more open file handles, more ZooKeeper/KRaft state, and longer leader election on failure.',
    aiAwareness: {
      strongAnswerShouldMention: ['ordering within partition', 'key-based routing', 'parallelism', 'partition count', 'log segment'],
      weakAnswer: 'Partitions are just how Kafka splits data across servers.',
      redFlags: ['Claiming Kafka guarantees global ordering.', 'Not knowing how key hashing determines the partition.'],
      likelyFollowUp: ['How many partitions should a topic have?', 'What happens to ordering when I add a partition to a live topic?'],
    },
    prerequisites: ['kafka-overview'],
    relatedTopics: ['kafka-producer', 'kafka-consumer', 'kafka-consumer-group'],
    nextTopics: ['kafka-producer'],
    references: [
      { title: 'Topics and Partitions', url: 'https://kafka.apache.org/documentation/#intro_concepts_and_terminology', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-offset',
    technology: 'kafka',
    title: 'Offsets & Commits',
    category: 'Core',
    slug: 'kafka-offset',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'An offset is a monotonically increasing integer that uniquely identifies a record\'s position within a partition; committing an offset tells Kafka how far a consumer has successfully processed.',
    mentalModel:
      'Offset is a bookmark in a book. Committing the offset is folding down the page. If you restart, you open at the folded page, not at the beginning.',
    memoryTip:
      'Commit AFTER processing = at-least-once (safe, may duplicate). Commit BEFORE processing = at-most-once (may lose). Transactional commit = exactly-once.',
    keyTerms: ['offset', 'commit', '__consumer_offsets', 'auto.commit', 'seek', 'earliest', 'latest'],
    interviewAnswer:
      'An offset is a 64-bit integer that uniquely identifies a record within a partition — the first record is offset 0. Kafka stores committed offsets in an internal topic called __consumer_offsets. A consumer commits its offset to record how far it has successfully processed. With enable.auto.commit=true (default), Kafka commits the current position every auto.commit.interval.ms, which can lead to data loss if the consumer crashes after committing but before finishing processing. Manual commit (commitSync / commitAsync) gives the consumer full control: commit after processing to guarantee at-least-once delivery, or use Kafka transactions for exactly-once.',
    detailedExplanation:
      'When a consumer starts with auto.offset.reset=earliest, it reads from the beginning of the partition; with latest, it reads only new records. A consumer can also seek() to any arbitrary offset — useful for replaying specific time ranges or rewinding after a bug fix. Offsets are per-consumer-group per-partition, so different groups maintain completely independent positions on the same topic. The __consumer_offsets topic is itself a compacted Kafka topic, so offset commits are durable.',
    commonMistakes: [
      'Using auto.commit without realising that committing before processing completes causes data loss on crash.',
      'Committing too infrequently, causing a large backlog to be reprocessed on restart.',
      'Not setting auto.offset.reset and being surprised that a brand-new consumer group starts at "latest" (missing historical records).',
    ],
    seniorInsight:
      'In production, manual commitAsync is the standard choice for high-throughput pipelines — it doesn\'t block, has a callback for monitoring, and avoids the "committed too early" data-loss footgun of auto-commit. For critical financial workflows (e.g. report delivery), exactly-once with Kafka transactions eliminates duplicates entirely.',
    aiAwareness: {
      strongAnswerShouldMention: ['__consumer_offsets', 'auto.commit', 'at-least-once', 'manual commit', 'seek'],
      weakAnswer: 'Offsets track which messages have been read.',
      redFlags: ['Not knowing where offsets are stored.', 'Confusing offset with message ID.', 'Not knowing about auto.offset.reset.'],
      likelyFollowUp: ['How do you implement exactly-once with offsets?', 'How do you replay events from a specific timestamp?'],
    },
    prerequisites: ['kafka-topic-partition', 'kafka-consumer'],
    relatedTopics: ['kafka-consumer-group', 'kafka-exactly-once', 'kafka-dead-letter'],
    nextTopics: ['kafka-exactly-once'],
    references: [
      { title: 'Consumer Offset Management', url: 'https://kafka.apache.org/documentation/#consumerconfigs', source: 'Apache', type: 'official' },
    ],
  },
];
