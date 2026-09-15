import type { LearningTopic } from '../../../types';

export const kafkaEcosystemTopics: LearningTopic[] = [
  {
    id: 'kafka-avro-schema-registry',
    technology: 'kafka',
    title: 'Avro & Schema Registry',
    category: 'Ecosystem',
    slug: 'kafka-avro-schema-registry',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Apache Avro is a compact binary serialisation format; the Confluent Schema Registry stores Avro (and Protobuf/JSON Schema) schemas centrally so producers and consumers always agree on the record structure, enforcing schema evolution rules.',
    mentalModel:
      'The Schema Registry is a shared contract repository. Before a producer can write, it registers its schema. Before a consumer can read, it fetches the schema by ID embedded in each message. Both sides always have the same "blueprint" for the data.',
    memoryTip:
      'Every Avro record on Kafka starts with: 0x00 (magic byte) + 4-byte schema ID + Avro binary payload. The consumer uses the schema ID to fetch and cache the schema from the registry.',
    keyTerms: ['Avro', 'Schema Registry', 'schema ID', 'magic byte', 'compatibility', 'BACKWARD', 'FORWARD', 'FULL', 'evolution'],
    interviewAnswer:
      'Apache Avro is a binary serialisation format defined by a JSON schema. It is far more compact than JSON (no field names in the payload) and enforces a contract between producer and consumer. The Confluent Schema Registry centralises schema management: a producer registers its Avro schema on first use and receives a numeric schema ID; it serialises each record as 0x00 + 4-byte schema ID + Avro bytes. The consumer reads the schema ID from each record and fetches the matching schema from the registry (with local caching). Schema compatibility modes — BACKWARD (consumers on new schema can read old records), FORWARD (consumers on old schema can read new records), FULL (both) — prevent breaking changes from reaching production. Schema Registry rejects schema registrations that violate the configured compatibility level.',
    detailedExplanation:
      'Avro schemas define fields with name, type, and optional default value. Schema evolution is safe when: adding a new field with a default (BACKWARD compatible — old consumers skip the field), removing a field that had a default (FORWARD compatible — new producers omit it, old consumers use the default). Removing a field without a default or changing a field\'s type breaks compatibility and Schema Registry rejects the registration. This enforcement happens at registration time — before the bad schema ever reaches the broker — protecting all consumers without runtime surprises.',
    codeExample: `// Producer with KafkaAvroSerializer
Properties props = new Properties();
props.put("schema.registry.url", "http://schema-registry:8081");
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");

// The serializer auto-registers the schema and writes:
// [0x00][schema_id (4 bytes)][avro binary payload]

// Consumer with KafkaAvroDeserializer
props.put("value.deserializer", "io.confluent.kafka.serializers.KafkaAvroDeserializer");
props.put("specific.avro.reader", "true");
// Fetches schema by ID from registry, deserialises to the generated Java class`,
    practicalExample:
      'In the GOM (Global Output Management) project at Julius Baer, report events are serialised with Avro and Schema Registry. The registry enforces BACKWARD compatibility — downstream consumers (archiving service, email sender, regulatory reporter) continue to work without any change when the producer adds a new optional field to the report event schema.',
    commonMistakes: [
      'Using JSON serialisation for high-volume Kafka topics — JSON is 3-5x larger than Avro for equivalent data, wasting broker disk and network bandwidth.',
      'Not setting schema compatibility mode — allows breaking schema changes to reach production consumers.',
      'Hardcoding the schema version in consumer code — always let the schema ID in the record drive deserialization.',
    ],
    seniorInsight:
      'Schema Registry is not optional for a production data platform. Without it, schemas live implicitly in producer code — any producer deployment can silently break consumers. Treat Schema Registry as the API contract layer for your event streams, subject to the same review process as REST API changes.',
    aiAwareness: {
      strongAnswerShouldMention: ['magic byte', 'schema ID', 'compatibility mode', 'BACKWARD', 'KafkaAvroSerializer', 'schema evolution'],
      weakAnswer: 'Avro is a binary format and Schema Registry stores schemas.',
      redFlags: [
        'Not knowing the 5-byte header (magic byte + schema ID) in Avro-encoded Kafka records.',
        'Not knowing what BACKWARD compatibility means.',
      ],
      likelyFollowUp: ['How do you handle a breaking schema change?', 'What is the difference between BACKWARD and FULL compatibility?'],
    },
    prerequisites: ['kafka-producer', 'kafka-consumer'],
    relatedTopics: ['kafka-producer', 'kafka-consumer', 'kafka-streams'],
    nextTopics: ['kafka-streams'],
    interviewQuestions: ['q-kafka-avro'],
    references: [
      { title: 'Schema Registry Overview', url: 'https://docs.confluent.io/platform/current/schema-registry/index.html', source: 'Confluent', type: 'documentation' },
      { title: 'Apache Avro Specification', url: 'https://avro.apache.org/docs/current/spec.html', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-streams',
    technology: 'kafka',
    title: 'Kafka Streams',
    category: 'Ecosystem',
    slug: 'kafka-streams',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Kafka Streams is a lightweight Java library for building stateful, fault-tolerant stream processing applications that read from and write to Kafka topics without requiring a separate processing cluster.',
    mentalModel:
      'Kafka Streams is like a spreadsheet formula engine that works on an infinite scroll of rows. Each new row triggers re-evaluation of formulas. Aggregations (SUM, COUNT) maintain state per key in a local store, backed by Kafka for fault tolerance.',
    memoryTip:
      'KStream = infinite record-by-record stream. KTable = latest value per key (changelog). GlobalKTable = replicated to every instance. Join stream + table = enrich records.',
    keyTerms: ['KStream', 'KTable', 'GlobalKTable', 'state store', 'topology', 'changelog', 'exactly_once_v2', 'DSL'],
    interviewAnswer:
      'Kafka Streams is a client-side Java library — your application is the deployment unit, not a separate cluster like Flink or Spark. A Streams application defines a topology (a DAG of processing steps) using a high-level DSL or the Processor API. It internally creates consumer groups and producers to read and write Kafka topics. KStream represents an unbounded stream of individual records; KTable represents a changelog compacted to the latest value per key. Stateful operations (aggregations, joins) store intermediate state in RocksDB state stores local to each instance, backed by Kafka changelog topics for fault tolerance — on restart, state is restored from the changelog. Exactly-once semantics is available via processing.guarantee=exactly_once_v2.',
    practicalExample:
      'In a bank reporting system, a Kafka Streams topology reads raw transaction events, enriches each event by joining with a customer KTable, groups by account, and aggregates the daily total — writing results to an account-summaries topic. If a processing instance crashes, its state store is rebuilt from the changelog topic and processing resumes from the last committed offset, exactly once.',
    commonMistakes: [
      'Using Kafka Streams when you need inter-node communication or ML inference — Kafka Streams is designed for data-parallel per-partition processing.',
      'Not sizing the state store (RocksDB) correctly — very large state can cause memory pressure and slow restores.',
      'Confusing KTable semantics (upsert by key) with KStream (every record is a new event).',
    ],
    seniorInsight:
      'Kafka Streams is operationally simpler than Flink or Spark Structured Streaming for JVM applications already using Kafka — no cluster to manage, just JARs deployed alongside your other services. However, Flink wins for cross-stream joins at scale, CEP, ML integration, or when you need sub-second checkpointing across very large state.',
    aiAwareness: {
      strongAnswerShouldMention: ['KStream', 'KTable', 'state store', 'changelog topic', 'topology', 'exactly_once_v2', 'no separate cluster'],
      weakAnswer: 'Kafka Streams processes data from Kafka topics.',
      redFlags: ['Confusing Kafka Streams with Kafka Connect.', 'Not knowing how state stores are rebuilt after a crash.'],
      likelyFollowUp: ['When would you choose Kafka Streams over Apache Flink?', 'How does Kafka Streams handle state on a node failure?'],
    },
    prerequisites: ['kafka-consumer-group', 'kafka-exactly-once'],
    relatedTopics: ['kafka-exactly-once', 'kafka-avro-schema-registry', 'kafka-connect'],
    nextTopics: ['kafka-connect'],
    references: [
      { title: 'Kafka Streams Documentation', url: 'https://kafka.apache.org/documentation/streams/', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-connect',
    technology: 'kafka',
    title: 'Kafka Connect',
    category: 'Ecosystem',
    slug: 'kafka-connect',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Kafka Connect is a framework for streaming data between Kafka and external systems (databases, file systems, cloud services) using reusable, configuration-driven connector plugins — no custom producer/consumer code required.',
    mentalModel:
      'Kafka Connect is a standardised adapter framework. Source connectors pull data into Kafka (database → Kafka); sink connectors push data out (Kafka → database/S3/Elasticsearch). The framework handles parallelism, fault tolerance, offset management, and schema conversion.',
    memoryTip:
      'Source connector = external system → Kafka. Sink connector = Kafka → external system. Connect handles the plumbing; you configure, not code.',
    keyTerms: ['source connector', 'sink connector', 'worker', 'task', 'SMT (Single Message Transform)', 'Debezium', 'JDBC connector'],
    interviewAnswer:
      'Kafka Connect runs as a cluster of worker processes. A connector plugin defines how to read from (source) or write to (sink) an external system; you configure it via a JSON/REST API — no Java code. The Connect framework splits work into tasks (parallelism units), manages offset tracking so connectors are resumable after failure, handles schema conversion (including Schema Registry integration), and applies Single Message Transforms (SMTs) for lightweight per-record modifications. Popular source connectors: Debezium (CDC from PostgreSQL/Oracle/MySQL), JDBC Source. Popular sink connectors: Elasticsearch, S3, JDBC Sink, Snowflake Sink.',
    practicalExample:
      'In a Snowflake data platform, a Snowflake Kafka Connector (sink) reads from Kafka topics and bulk-loads records into Snowflake tables, handling Snowpipe integration automatically. On the source side, a Debezium Oracle CDC connector captures every INSERT/UPDATE/DELETE from an Oracle trading database and publishes change events to Kafka — giving downstream analytics the full change history without any application-level code changes.',
    commonMistakes: [
      'Writing a custom consumer to load data into a database when a Kafka Connect JDBC Sink connector already exists.',
      'Not tuning connector tasks count — each task is a thread; too few tasks underutilise partitions, too many create lock contention on the target.',
      'Ignoring SMTs and transforming data in a downstream consumer instead — SMTs are stateless and run inside Connect, removing the need for a separate transformation service.',
    ],
    seniorInsight:
      'Kafka Connect + Debezium is the standard pattern for event sourcing from legacy databases — capture every row change as a Kafka event without modifying the application. This is how you "strangler fig" a monolith: expose its database changes as events, let new microservices consume them, and gradually shift responsibility.',
    aiAwareness: {
      strongAnswerShouldMention: ['source connector', 'sink connector', 'task parallelism', 'SMT', 'Debezium', 'no custom consumer code'],
      weakAnswer: 'Kafka Connect moves data in and out of Kafka.',
      redFlags: ['Not knowing the difference between a connector and a task.', 'Not knowing Debezium or CDC patterns.'],
      likelyFollowUp: ['How does Debezium handle schema changes on the source database?', 'What is a Single Message Transform?'],
    },
    prerequisites: ['kafka-overview', 'kafka-avro-schema-registry'],
    relatedTopics: ['kafka-streams', 'kafka-avro-schema-registry'],
    references: [
      { title: 'Kafka Connect Overview', url: 'https://kafka.apache.org/documentation/#connect', source: 'Apache', type: 'official' },
      { title: 'Debezium CDC Connectors', url: 'https://debezium.io/documentation/', source: 'Debezium', type: 'documentation' },
    ],
  },
];
