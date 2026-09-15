import type { LearningTopic } from '../../../types';

export const kafkaProducerTopics: LearningTopic[] = [
  {
    id: 'kafka-producer',
    technology: 'kafka',
    title: 'Kafka Producer',
    category: 'Producer',
    slug: 'kafka-producer',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'The Kafka producer is the client library that serialises records and sends them to the correct broker partition, with configurable durability, batching, and retry semantics.',
    mentalModel:
      'The producer is like a smart courier: it batches parcels (records), decides which depot (partition) each goes to, chooses how many delivery confirmations it needs (acks), and retries automatically if a courier van breaks down (broker failure).',
    memoryTip:
      'acks=0 → fire and forget. acks=1 → leader confirms. acks=all → all ISR replicas confirm. Higher acks = slower but safer.',
    keyTerms: ['acks', 'retries', 'idempotent', 'batch.size', 'linger.ms', 'partitioner', 'RecordMetadata'],
    interviewAnswer:
      'The Kafka producer serialises a ProducerRecord (key, value, topic, optional partition/timestamp) and sends it to the leader broker of the target partition. The acks setting controls durability: acks=0 means no confirmation (fastest, lowest durability); acks=1 means the partition leader acknowledges before replicating (risk of loss on leader failure); acks=all (or -1) means every in-sync replica must persist the record before the producer receives an acknowledgement (highest durability). Producers batch records (batch.size, linger.ms) to improve throughput. With enable.idempotence=true, the broker deduplicates retries using a producer ID and sequence number, preventing duplicates on retry.',
    detailedExplanation:
      'Internally, the producer maintains an in-memory accumulator that groups records into batches per partition. A background I/O thread drains these batches to the brokers. linger.ms controls how long the accumulator waits before flushing a partial batch — a small delay that can dramatically increase throughput by batching more records together. The producer automatically retries transient failures (network blips, leader elections) up to retries times with an exponential backoff. When enable.idempotence=true, the broker assigns a monotonic sequence number per producer per partition and deduplicates exact retransmissions, guaranteeing at-most-one write per send call even across retries.',
    codeExample: `Properties props = new Properties();
props.put("bootstrap.servers", "broker1:9092,broker2:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("schema.registry.url", "http://schema-registry:8081");
props.put("acks", "all");
props.put("enable.idempotence", "true");

KafkaProducer<String, ReportEvent> producer = new KafkaProducer<>(props);
ProducerRecord<String, ReportEvent> record =
    new ProducerRecord<>("report-events", reportId, new ReportEvent(...));
producer.send(record, (metadata, ex) -> {
    if (ex != null) log.error("Send failed", ex);
    else log.info("Sent to partition {} offset {}", metadata.partition(), metadata.offset());
});`,
    codeOutput: 'Sent to partition 2 offset 1047',
    whyOutput:
      'The callback fires after the broker confirms the write. metadata.partition() and metadata.offset() tell you exactly where the record landed — useful for tracing and audit logs.',
    practicalExample:
      'In a report-delivery system, the service that generates PDF reports publishes a ReportReady Avro event to the report-events topic with the report ID as the key (ensuring all events for the same report go to the same partition, preserving order). acks=all + enable.idempotence=true ensures no report event is lost or duplicated even during broker leadership elections.',
    commonMistakes: [
      'Using acks=1 for financial events — the leader can fail after acknowledging but before replicating, silently losing the record.',
      'Not calling producer.flush() or producer.close() before shutdown — records still in the accumulator are dropped.',
      'Ignoring the callback exception — failures are silently swallowed unless you check the second argument.',
    ],
    seniorInsight:
      'In production at scale, always pair acks=all with enable.idempotence=true and min.insync.replicas=2 on the broker side. This is the triangle of exactly-once producer safety. Also set compression.type=snappy or lz4 — Kafka compresses at the batch level, so higher linger.ms + larger batches compound the compression benefit.',
    aiAwareness: {
      strongAnswerShouldMention: ['acks=all', 'enable.idempotence', 'batch.size', 'linger.ms', 'ProducerRecord', 'retries', 'ISR'],
      weakAnswer: 'The producer sends messages to Kafka.',
      redFlags: [
        'Not knowing what acks=1 vs acks=all means.',
        'Not knowing what idempotence prevents.',
        'Thinking retries never cause duplicates without idempotence enabled.',
      ],
      likelyFollowUp: ['How do you prevent message loss with acks=1?', 'What is the difference between idempotent and transactional producer?'],
    },
    prerequisites: ['kafka-topic-partition'],
    relatedTopics: ['kafka-exactly-once', 'kafka-avro-schema-registry', 'kafka-consumer'],
    nextTopics: ['kafka-consumer', 'kafka-exactly-once'],
    interviewQuestions: ['q-kafka-producer-acks', 'q-kafka-exactly-once'],
    references: [
      { title: 'Producer Configuration', url: 'https://kafka.apache.org/documentation/#producerconfigs', source: 'Apache', type: 'official' },
    ],
  },
];
