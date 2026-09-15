import type { LearningTopic } from '../../../types';

export const kafkaDeliveryTopics: LearningTopic[] = [
  {
    id: 'kafka-exactly-once',
    technology: 'kafka',
    title: 'Exactly-Once Semantics',
    category: 'Delivery Guarantees',
    slug: 'kafka-exactly-once',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Exactly-once semantics (EOS) guarantees that each record is processed and produced exactly once, even across producer retries, broker failures, and consumer restarts — achieved by combining idempotent producers, Kafka transactions, and consumer isolation.',
    mentalModel:
      'At-most-once = send without waiting (mail without tracking). At-least-once = resend until acknowledged (registered mail, may duplicate). Exactly-once = resend but deduplicate at the destination (bank transfer: the money moves exactly once).',
    memoryTip:
      'EOS needs three things: idempotent producer (dedup retries) + Kafka transaction (atomic multi-partition write) + read_committed isolation (consumer only sees committed records).',
    keyTerms: ['idempotent producer', 'transactional.id', 'beginTransaction', 'commitTransaction', 'read_committed', 'isolation.level'],
    interviewAnswer:
      'Kafka supports exactly-once semantics via three mechanisms working together. First, the idempotent producer (enable.idempotence=true) assigns each producer a stable PID and a per-partition sequence number, so broker deduplicates retransmissions — guaranteeing at-most-one write per logical send. Second, Kafka transactions (transactional.id) let a producer atomically write to multiple partitions and commit the consumer offset in a single transaction: either all writes commit or all are aborted — preventing partial writes. Third, consumers with isolation.level=read_committed only see committed transactional records, filtering out messages from aborted transactions. Together, these implement end-to-end EOS in a consume-transform-produce pipeline.',
    detailedExplanation:
      'A transactional producer flow: (1) initTransactions() on startup; (2) beginTransaction() before processing each batch; (3) produce output records; (4) sendOffsetsToTransaction() to atomically commit the input offset alongside the output; (5) commitTransaction() — or abortTransaction() on error. The two-phase commit is managed by a transaction coordinator broker using a transaction log topic. Consumer records from an incomplete (in-flight) transaction are buffered internally and not returned by poll() until the transaction commits.',
    codeExample: `producer.initTransactions();
try {
    producer.beginTransaction();
    for (ConsumerRecord<String, ReportEvent> record : records) {
        ReportOutput out = transform(record.value());
        producer.send(new ProducerRecord<>("report-output", out.key(), out));
    }
    producer.sendOffsetsToTransaction(currentOffsets(consumer), consumer.groupMetadata());
    producer.commitTransaction();
} catch (ProducerFencedException | OutOfOrderSequenceException e) {
    producer.close();        // unrecoverable — restart the consumer
} catch (KafkaException e) {
    producer.abortTransaction();
}`,
    codeOutput: '(atomic: output records + offset commit both land or neither does)',
    whyOutput:
      'sendOffsetsToTransaction includes the consumer offset in the same transaction as the output records. If the process crashes after produce but before commit, both the output and the offset are rolled back — on restart the consumer re-reads the input and re-produces the output.',
    practicalExample:
      'In a financial event pipeline, a Kafka Streams application reads account events, computes balances, and writes results. With EOS enabled (processing.guarantee=exactly_once_v2), each input event produces exactly one output record and advances the consumer offset atomically — even if a broker fails mid-transaction.',
    commonMistakes: [
      'Using transactional.id without ensuring only one producer instance uses it at a time — Kafka fences the old instance (ProducerFencedException) when a new one starts with the same transactional.id.',
      'Enabling EOS on consumers without setting isolation.level=read_committed — the consumer still sees uncommitted records from aborted transactions.',
      'Confusing idempotent producer (single-producer dedup) with transactions (multi-partition atomic write + offset commit).',
    ],
    seniorInsight:
      'Kafka Streams hides most of this complexity with processing.guarantee=exactly_once_v2, which uses one transactional producer per thread per task. For raw consumer-producer code, implement the pattern carefully: the most common mistake is not handling ProducerFencedException as a terminal condition requiring a full restart.',
    aiAwareness: {
      strongAnswerShouldMention: ['idempotent producer', 'transactional.id', 'sendOffsetsToTransaction', 'read_committed', 'ProducerFencedException'],
      weakAnswer: 'Exactly-once means each message is processed once.',
      redFlags: ['Thinking enable.idempotence alone gives exactly-once end-to-end.', 'Not knowing what isolation.level does on the consumer.'],
      likelyFollowUp: ['How does exactly-once_v2 differ from exactly_once in Kafka Streams?', 'What happens when two producers share the same transactional.id?'],
    },
    prerequisites: ['kafka-producer', 'kafka-consumer', 'kafka-offset'],
    relatedTopics: ['kafka-dead-letter', 'kafka-producer'],
    nextTopics: ['kafka-dead-letter'],
    interviewQuestions: ['q-kafka-exactly-once'],
    references: [
      { title: 'Transactions in Apache Kafka', url: 'https://www.confluent.io/blog/transactions-apache-kafka/', source: 'Confluent', type: 'article' },
      { title: 'KIP-98: Exactly Once Delivery and Transactional Messaging', url: 'https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-dead-letter',
    technology: 'kafka',
    title: 'Dead Letter Queue (DLQ)',
    category: 'Delivery Guarantees',
    slug: 'kafka-dead-letter',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A dead letter queue (DLQ) is a separate Kafka topic where records that fail processing after exhausting retries are routed, preserving them for inspection, alerting, and selective replay rather than losing them.',
    mentalModel:
      'The DLQ is the "returns desk" at a warehouse: items that couldn\'t be delivered after multiple attempts go there for human inspection, not into the bin.',
    memoryTip:
      'try → catch → retry topic (delay) → catch again → DLQ. Never swallow. Never block. Always preserve.',
    keyTerms: ['DLQ', 'retry topic', 'poison pill', 'error envelope', 'replay', 'Spring Kafka ErrorHandler'],
    interviewAnswer:
      'A DLQ pattern routes records that consistently fail processing to a dedicated Kafka topic rather than blocking the consumer (which would stall partition progress for all downstream records — the "poison pill" problem). The typical implementation uses a retry topic chain: on first failure the record is sent to a retry-1 topic with a delay; after retry exhaustion it lands in the DLQ topic. Each record in the DLQ is wrapped in an error envelope containing the original payload, the exception class, the stack trace, and the source partition/offset for correlation. An alerting system monitors DLQ lag; ops can inspect, fix, and selectively replay DLQ records to the source topic. Spring Kafka\'s DefaultErrorHandler with a DeadLetterPublishingRecoverer implements this out of the box.',
    practicalExample:
      'A document-delivery consumer processes "report ready" events. If the PDF renderer is down, the event fails. Instead of retrying indefinitely (blocking all other reports) or skipping (losing the event), the record is sent to report-events.DLT with the exception details. An alerting rule fires on DLT lag > 0. After the renderer recovers, an operator script republishes DLT records back to report-events for reprocessing.',
    commonMistakes: [
      'Retrying in-place without a delay — floods a downstream service that is already struggling.',
      'Letting a poison pill block a partition — all records after it are stuck until the failing record is resolved.',
      'Not preserving original headers/metadata in the DLQ record — makes root-cause analysis much harder.',
    ],
    seniorInsight:
      'Design the DLQ envelope to include: original topic, partition, offset, consumer group, exception type, exception message, and timestamp. This lets you build automated replay tooling that targets specific failure types without manually inspecting individual records. Also consider exponential backoff retry topics (retry-1, retry-2, retry-3) before the DLQ — some transient failures self-heal.',
    aiAwareness: {
      strongAnswerShouldMention: ['poison pill', 'retry topic chain', 'error envelope', 'partition stall prevention', 'replay'],
      weakAnswer: 'Failed messages go to the DLQ.',
      redFlags: ['Not knowing what a poison pill is.', 'Not knowing how to replay from a DLQ.'],
      likelyFollowUp: ['How do you monitor DLQ health?', 'How do you replay DLQ records safely without re-causing the original failure?'],
    },
    prerequisites: ['kafka-consumer', 'kafka-offset'],
    relatedTopics: ['kafka-exactly-once', 'kafka-monitoring', 'kafka-consumer'],
    nextTopics: ['kafka-monitoring'],
    references: [
      { title: 'Spring Kafka Dead-Letter Publishing Recoverer', url: 'https://docs.spring.io/spring-kafka/docs/current/reference/html/#dead-letters', source: 'Spring', type: 'documentation' },
    ],
  },
];
