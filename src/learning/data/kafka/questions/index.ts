import type { InterviewQuestion } from '../../../types';

export const kafkaQuestions: InterviewQuestion[] = [
  {
    id: 'q-kafka-vs-mq',
    question: 'How is Kafka different from traditional message queues like RabbitMQ or IBM MQ?',
    category: 'Core',
    difficulty: 'intermediate',
    quickAnswer:
      'Kafka is a durable, replayable event log; traditional MQs delete messages once consumed. Kafka excels at fan-out to many independent consumers; MQs excel at task queues with competing consumers.',
    interviewAnswer:
      'The fundamental difference is the storage model. Traditional message queues (RabbitMQ, IBM MQ) delete a message once a consumer acknowledges it — the queue is a transient buffer. Kafka retains records for a configurable period regardless of consumer activity, making them replayable. This gives Kafka two key advantages: multiple independent consumer groups read the full message history at their own pace (fan-out without republishing), and consumers can replay historical data after a bug fix or new service onboarding. Traditional queues are better suited for task queues (work queues where competing consumers split work), request/reply patterns, and lower operational complexity when you only have one consumer and no need for replay.',
    detailedAnswer:
      'Architecturally, RabbitMQ routes messages through exchanges and queues based on routing keys — a flexible but ephemeral model. IBM MQ similarly focuses on point-to-point and publish-subscribe with strong transactional semantics (XA transactions), making it the choice for core banking systems that need guaranteed once-only delivery integrated with database transactions. Kafka\'s log model is optimised for sequential disk I/O (append-only), giving it 10-100x higher throughput than MQ solutions at scale. The trade-off: Kafka has higher operational complexity (cluster management, partition tuning, offset management) and no native request/reply pattern. In many bank architectures, both coexist: IBM MQ for core banking OLTP transactions, Kafka for high-volume event streaming and analytics.',
    seniorAnswer:
      'IBM MQ was the backbone of banking event processing before Kafka. The key architectural difference at the senior level is retention and the consumer model. IBM MQ uses a competing-consumers model (only one consumer gets each message); Kafka uses a consumer-group model (each group gets every message, consuming independently). For a regulatory audit trail or event-sourcing pattern, Kafka is correct because every consumer group needs the full history. For a core banking payment instruction that must be processed exactly once by exactly one service, IBM MQ\'s XA transaction support is still superior. Modern banks use a hybrid: IBM MQ at the transaction core, Kafka for analytics, reporting, and event-driven integration between microservices.',
    keyTerms: ['retention', 'fan-out', 'consumer group', 'task queue', 'replay', 'XA transaction', 'IBM MQ'],
    conceptsTested: ['Kafka vs MQ trade-offs', 'retention model', 'consumer patterns'],
    relatedTopics: ['kafka-overview', 'kafka-consumer-group'],
    interviewerIntent: 'Test whether the candidate understands when NOT to use Kafka, and the practical trade-offs in a banking context.',
    aiAwareness: {
      strongAnswerShouldMention: ['retention', 'replay', 'fan-out', 'consumer groups', 'IBM MQ XA', 'task queue pattern'],
      weakAnswer: 'Kafka is faster than RabbitMQ.',
      redFlags: ['Saying Kafka always replaces MQ.', 'Not knowing IBM MQ or its relevance in financial services.'],
      likelyFollowUp: ['When would you keep IBM MQ in a microservices architecture alongside Kafka?'],
    },
  },

  {
    id: 'q-kafka-ordering',
    question: 'How does Kafka guarantee message ordering, and what are its limits?',
    category: 'Core',
    difficulty: 'intermediate',
    quickAnswer:
      'Kafka guarantees ordering within a partition. Using a record key routes all related events to the same partition. No ordering guarantee exists across partitions.',
    interviewAnswer:
      'Kafka guarantees strict ordering within a single partition — records are always read in the order they were written. This is because each partition is an append-only log and consumers read it sequentially. To guarantee ordering for a specific entity (e.g., all events for account ID 12345), use the account ID as the producer key. Kafka hashes the key to a consistent partition, so all events for that key arrive at the same partition in arrival order. Across partitions, there is no ordering guarantee. A consumer of a 10-partition topic may receive partition 3\'s records interleaved with partition 7\'s in any relative order.',
    detailedAnswer:
      'Even within a partition, ordering has a subtle caveat: if enable.idempotence=false and retries>0, a producer retry after a transient network failure can deliver a record out of order relative to later records that already succeeded. enable.idempotence=true closes this gap by enforcing monotonically increasing sequence numbers per partition — the broker rejects out-of-order sequences. Another edge case: consumer.poll() returns a batch from a partition in order, but if you process records in parallel threads, the processing order is non-deterministic even if the read order is correct. Always process single-partition records sequentially, or use the "pause/unpause" pattern to ensure ordered processing with concurrency across partitions.',
    seniorAnswer:
      'At scale, key-based ordering has a hot-partition problem: if one key accounts for 80% of events (e.g., a batch job writing millions of events for a single account), all those events land on one partition, overwhelming one broker and one consumer thread. Solutions: synthetic key spreading (accountId + bucketHash to spread across multiple partitions, with downstream dedup) or compaction-based aggregation topics. A second senior concern is ordered fan-out: if two consumer groups both need ordered processing of account events, they must both read from the same partition — the partition count is the shared ordering boundary for all consumers of that key.',
    keyTerms: ['partition ordering', 'key hashing', 'idempotent producer', 'hot partition', 'sequential read'],
    conceptsTested: ['partition ordering semantics', 'key selection', 'edge cases'],
    relatedTopics: ['kafka-topic-partition', 'kafka-producer'],
    followUps: ['q-kafka-producer-acks'],
    interviewerIntent: 'Verify understanding of the scope of Kafka\'s ordering guarantee and production edge cases.',
    aiAwareness: {
      strongAnswerShouldMention: ['within-partition guarantee', 'key hashing', 'no cross-partition order', 'idempotence and ordering', 'hot partition risk'],
      weakAnswer: 'Kafka guarantees message order.',
      redFlags: ['Claiming Kafka guarantees global ordering.', 'Not knowing what determines which partition a keyed record goes to.'],
      likelyFollowUp: ['What happens to ordering if you add a partition to a live topic?'],
    },
  },

  {
    id: 'q-kafka-consumer-group',
    question: 'What happens to a consumer group when one consumer fails?',
    category: 'Consumer',
    difficulty: 'intermediate',
    quickAnswer:
      'The group coordinator detects the failure via missed heartbeats, triggers a rebalance, and redistributes the failed consumer\'s partitions to remaining active members.',
    interviewAnswer:
      'Each consumer sends heartbeats to the group coordinator broker every heartbeat.interval.ms. If the coordinator receives no heartbeat within session.timeout.ms (default 45s), it considers the consumer dead and triggers a group rebalance. During rebalance, all active consumers revoke their current partitions (eager rebalance) or keep them until told to hand specific ones over (cooperative-sticky). The coordinator reassigns the failed consumer\'s partitions to healthy members, which resume from the last committed offset. Records processed but not yet committed by the failed consumer are re-delivered — this is at-least-once delivery. The failed consumer\'s uncommitted work is repeated by the new assignee.',
    detailedAnswer:
      'The distinction between session.timeout.ms and max.poll.interval.ms matters: session.timeout.ms catches a completely unresponsive consumer (JVM crash, network partition); max.poll.interval.ms catches a consumer that is alive and sending heartbeats but not calling poll() frequently enough (slow processing). If processing exceeds max.poll.interval.ms, the consumer is removed from the group even if heartbeats are fine — a common production surprise with slow downstream systems. The recovery sequence after failure: (1) session.timeout expires; (2) coordinator marks consumer dead; (3) JoinGroup/SyncGroup protocol runs; (4) new partition assignment takes effect; (5) new owners seek to committed offsets and resume consuming.',
    seniorAnswer:
      'In Kubernetes deployments, use static group membership (group.instance.id = pod name) to prevent rebalances on planned pod restarts. The coordinator gives the pod session.timeout.ms to come back with the same instance ID; if it does, it gets its old partitions without a rebalance. Pair this with cooperative-sticky rebalancing for the unavoidable cases — this limits rebalance disruption to only the partitions that actually need to move. For critical financial consumers, set session.timeout.ms high enough to survive a GC pause or a slow restart, but not so high that a genuinely dead consumer keeps its partitions unprocessed for too long.',
    keyTerms: ['session.timeout.ms', 'max.poll.interval.ms', 'rebalance', 'static membership', 'heartbeat', 'at-least-once'],
    conceptsTested: ['failure detection', 'rebalance protocol', 'delivery guarantees under failure'],
    relatedTopics: ['kafka-consumer-group', 'kafka-rebalancing', 'kafka-offset'],
    followUps: ['q-kafka-rebalancing'],
    interviewerIntent: 'Test understanding of Kafka\'s fault tolerance model and the operational implications of failure detection timers.',
    aiAwareness: {
      strongAnswerShouldMention: ['session.timeout.ms', 'max.poll.interval.ms distinction', 'rebalance', 'at-least-once re-delivery', 'static membership'],
      weakAnswer: 'Kafka detects the failure and reassigns partitions.',
      redFlags: ['Not knowing what triggers the failure detection.', 'Confusing heartbeat timeout with poll timeout.'],
      likelyFollowUp: ['How do you prevent a slow consumer from being kicked out of the group?'],
    },
  },

  {
    id: 'q-kafka-producer-acks',
    question: 'What is the difference between acks=0, acks=1, and acks=all in Kafka?',
    category: 'Producer',
    difficulty: 'intermediate',
    quickAnswer:
      'acks=0: no confirmation (fastest, data loss risk). acks=1: leader confirms (medium safety). acks=all: all ISR replicas confirm (safest, slightly slower). Use acks=all for financial data.',
    interviewAnswer:
      'The acks setting controls how many broker acknowledgements the producer requires before considering a write successful. acks=0: fire and forget — the producer sends the record and never waits for any response. Maximum throughput, but records can be lost on any network issue or broker failure. acks=1: the partition leader acknowledges after writing to its local log. If the leader fails before followers replicate, the record is lost. acks=all (or -1): the leader waits for all In-Sync Replicas (ISR) to persist the record before acknowledging. This is the highest durability guarantee — a record acknowledged at acks=all can only be lost if all ISR replicas fail simultaneously (which also means the cluster is dead). For financial event pipelines, acks=all is mandatory.',
    detailedAnswer:
      'acks=all is only as strong as the ISR. If min.insync.replicas=1 and there is only one replica in the ISR (the leader), acks=all is effectively acks=1. The correct configuration triangle for production: acks=all + min.insync.replicas=2 + replication.factor=3. This ensures at least 2 of 3 replicas must confirm — survivable under a single broker failure. Combine with enable.idempotence=true to prevent duplicates on producer retry. The throughput cost of acks=all is typically <5ms additional latency per batch on a healthy cluster — negligible for most applications.',
    seniorAnswer:
      'At scale, the latency difference between acks=1 and acks=all is mainly determined by replica.lag.time.max.ms and ISR health. A healthy cluster with replicas on the same LAN has <2ms replication latency. The real cost of acks=all is on degraded clusters where followers are lagging — the producer blocks until the lagging ISR member catches up or falls out of ISR. Monitor ISR shrink events as a leading indicator that acks=all latency will spike. For ultra-low-latency use cases that can tolerate some data loss, acks=1 is acceptable; never use acks=0 for any data that matters.',
    keyTerms: ['acks', 'ISR', 'min.insync.replicas', 'enable.idempotence', 'durability', 'throughput trade-off'],
    conceptsTested: ['producer durability settings', 'ISR interaction', 'trade-offs'],
    relatedTopics: ['kafka-producer', 'kafka-replication'],
    followUps: ['q-kafka-exactly-once'],
    interviewerIntent: 'Test understanding of the durability guarantee spectrum and correct configuration for financial-grade systems.',
    aiAwareness: {
      strongAnswerShouldMention: ['ISR', 'min.insync.replicas', 'acks=all is not all replicas', 'idempotence', 'latency trade-off'],
      weakAnswer: 'acks=all waits for all replicas to confirm.',
      redFlags: ['Saying acks=all waits for all replicas not just ISR.', 'Not mentioning min.insync.replicas interaction.'],
      likelyFollowUp: ['What happens if min.insync.replicas is 2 and only one replica is available?'],
    },
  },

  {
    id: 'q-kafka-exactly-once',
    question: 'How do you implement exactly-once semantics in a Kafka consume-transform-produce pipeline?',
    category: 'Delivery Guarantees',
    difficulty: 'advanced',
    quickAnswer:
      'Use a transactional producer: beginTransaction(), produce output, sendOffsetsToTransaction(), commitTransaction(). Consumer side sets isolation.level=read_committed.',
    interviewAnswer:
      'Exactly-once in a consume-transform-produce pipeline requires Kafka transactions. The producer must have enable.idempotence=true and a unique transactional.id. On each processing batch: call beginTransaction(), produce all output records, call sendOffsetsToTransaction(offsets, consumerGroupMetadata) to atomically include the consumer offset commit in the transaction, then commitTransaction(). On the consumer side, set isolation.level=read_committed so aborted transactions are filtered out. If the application crashes between produce and commit, the broker rolls back the transaction on next producer startup — the consumer re-reads the input and re-produces the output. No duplicates, no data loss.',
    detailedAnswer:
      'The sendOffsetsToTransaction call is the critical piece — it ties the consumer offset commit to the output transaction. Without it, a crash after produce but before offset commit would cause the consumer to re-read input and re-produce, creating duplicates. With it, the offset commit and output records are part of the same two-phase commit — either both commit or neither does. Kafka Streams with processing.guarantee=exactly_once_v2 handles all of this automatically, using one transactional producer per task thread. For raw consumer-producer code, handle ProducerFencedException (another instance with the same transactional.id started) as a terminal condition requiring a full application restart.',
    seniorAnswer:
      'exactly_once_v2 (EOS-v2, default in Kafka Streams 3.0+) reduces the overhead of exactly-once by using fewer coordinator round-trips than the original EOS-v1 implementation. In practice, EOS-v2 adds about 10-20% latency overhead compared to at-least-once processing — acceptable for most data pipelines. For Kafka Connect sink connectors, exactly-once is supported via the SinkConnector exactly-once API (Kafka 3.3+), where the connector participates in the same transaction protocol. The hardest part in practice: making sure your external side-effects (database writes, API calls) are either idempotent or also transactional to match the Kafka EOS guarantee end-to-end.',
    keyTerms: ['transactional.id', 'beginTransaction', 'sendOffsetsToTransaction', 'commitTransaction', 'read_committed', 'ProducerFencedException'],
    conceptsTested: ['transaction API', 'EOS mechanics', 'operational edge cases'],
    relatedTopics: ['kafka-exactly-once', 'kafka-producer', 'kafka-streams'],
    followUps: ['q-kafka-producer-acks'],
    interviewerIntent: 'Distinguish candidates who know the API from those who understand the underlying mechanics and failure modes.',
    aiAwareness: {
      strongAnswerShouldMention: ['sendOffsetsToTransaction', 'transactional.id', 'isolation.level', 'ProducerFencedException', 'crash recovery behaviour'],
      weakAnswer: 'Use enable.idempotence and transactions.',
      redFlags: ['Not mentioning sendOffsetsToTransaction.', 'Not knowing what isolation.level=read_committed does on the consumer.'],
      likelyFollowUp: ['What happens if two instances start with the same transactional.id?'],
    },
  },

  {
    id: 'q-kafka-rebalancing',
    question: 'What causes a Kafka consumer group rebalance and how do you minimise its impact?',
    category: 'Consumer',
    difficulty: 'advanced',
    quickAnswer:
      'Rebalances are triggered by consumer joins/leaves, topic partition changes, or missed heartbeats. Minimise impact with cooperative-sticky rebalancing, static group membership, and correct timeout tuning.',
    interviewAnswer:
      'A rebalance is triggered when: a new consumer joins the group; a consumer leaves (gracefully or via timeout); a new partition is added to a subscribed topic; or a subscribe call changes the topic list. The impact of an eager rebalance (old default) is a processing pause for all consumers. Minimise it by: (1) switching to cooperative-sticky assignor (partition.assignment.strategy=CooperativeStickyAssignor) so only moved partitions are paused; (2) setting group.instance.id for static membership on planned restarts; (3) tuning max.poll.interval.ms high enough to cover worst-case processing time, preventing healthy consumers from being evicted.',
    detailedAnswer:
      'The eager-vs-cooperative distinction is critical for high-throughput consumers. In eager rebalancing (RangeAssignor, RoundRobinAssignor), every consumer revokes all partitions and stops processing during the JoinGroup/SyncGroup round-trips — a pause of 1-5 seconds typical in a healthy cluster, longer in a degraded one. Cooperative-sticky rebalancing runs in two rounds: first revoke the partitions that need to move (others keep processing), then assign the freed partitions to new owners. Most consumers never stop. Implement ConsumerRebalanceListener.onPartitionsRevoked() to commitSync() in-progress offsets before partitions move — otherwise the new owner re-reads from the last committed offset.',
    seniorAnswer:
      'In practice the most common cause of unexpected rebalances in production is processing latency exceeding max.poll.interval.ms — the consumer processes a slow downstream call, fails to call poll() in time, and gets evicted from the group (appearing as a repeated rebalance loop in the logs). Fix by: increasing max.poll.interval.ms to cover P99 processing time; moving slow downstream calls off the poll thread (process in a thread pool, keep poll() calling); reducing max.poll.records to limit batch size. Monitor records-lag and rebalance-rate in Grafana — a spike in both simultaneously is the fingerprint of this problem.',
    keyTerms: ['cooperative-sticky', 'static membership', 'max.poll.interval.ms', 'ConsumerRebalanceListener', 'eager rebalance', 'processing pause'],
    conceptsTested: ['rebalance triggers', 'cooperative vs eager', 'production tuning'],
    relatedTopics: ['kafka-rebalancing', 'kafka-consumer-group'],
    interviewerIntent: 'Distinguish candidates with production Kafka experience from those who only know the happy path.',
    aiAwareness: {
      strongAnswerShouldMention: ['cooperative-sticky', 'static membership', 'max.poll.interval.ms', 'ConsumerRebalanceListener.onPartitionsRevoked'],
      weakAnswer: 'Use sticky assignment to minimise rebalance impact.',
      redFlags: ['Not knowing why max.poll.interval.ms causes eviction.', 'Not knowing about onPartitionsRevoked offset commit.'],
      likelyFollowUp: ['How do you diagnose a rebalance storm in production?'],
    },
  },

  {
    id: 'q-kafka-avro',
    question: 'Why use Avro with Schema Registry over plain JSON for Kafka messages?',
    category: 'Ecosystem',
    difficulty: 'intermediate',
    quickAnswer:
      'Avro is 3-5x more compact than JSON (no field names in payload), schema evolution is governed and enforced at registration time, and Schema Registry prevents breaking changes from reaching consumers.',
    interviewAnswer:
      'JSON serialises field names with every record — "accountId":"12345" embeds the string "accountId" in every message. Avro uses a binary format where field names are defined once in the schema; the payload is pure values, making it 3-5x smaller. More importantly, the Confluent Schema Registry enforces schema compatibility: a producer cannot register a breaking schema change (incompatible field removal or type change) — the registry rejects it before the message ever reaches the broker. Every Avro-encoded Kafka record carries a 4-byte schema ID; consumers look up the schema by ID (with local caching) and deserialise correctly. This separates the concern of schema evolution from message routing, giving you safe, governed evolution of your event contracts.',
    detailedAnswer:
      'Schema Registry supports three compatibility modes: BACKWARD (consumers on the new schema can read records written with the old schema — safe for adding a field with a default), FORWARD (consumers on the old schema can read records written with the new schema — safe for removing a field that had a default), and FULL (both). FULL is the most restrictive and the safest for long-lived topics with many consumers. Schema registration happens on first producer startup — if the schema is incompatible, the producer fails to start, not mid-stream. Compare this to JSON: a producer can add or remove a field at any time and consumers break silently at runtime, with no governance layer.',
    seniorAnswer:
      'In a regulated financial environment (like Julius Baer), Schema Registry plays the same governance role as an API contract in REST: you version your event schemas, PR review schema changes, and the registry enforces the contract. Pair Schema Registry with Avro\'s generated Java classes (via avro-maven-plugin) for compile-time type safety — a Java compiler error catches schema misuse before deployment. For internal microservices with simple events, JSON with strict schema validation (JSON Schema) is acceptable, but for high-volume data platform events (>100k/sec), Avro\'s compactness directly reduces broker storage costs and network bandwidth.',
    keyTerms: ['schema ID', 'magic byte', 'BACKWARD compatibility', 'KafkaAvroSerializer', 'schema evolution', 'generated Java class'],
    conceptsTested: ['serialisation trade-offs', 'schema governance', 'evolution safety'],
    relatedTopics: ['kafka-avro-schema-registry', 'kafka-producer'],
    interviewerIntent: 'Test whether the candidate understands schema governance as a production concern, not just a performance optimisation.',
    aiAwareness: {
      strongAnswerShouldMention: ['field names in JSON vs binary Avro', 'schema ID in payload', 'compatibility enforcement at registration', 'generated Java classes'],
      weakAnswer: 'Avro is faster and more compact than JSON.',
      redFlags: ['Not knowing how schema ID gets embedded in the record.', 'Not knowing Schema Registry enforces at registration time.'],
      likelyFollowUp: ['How do you handle a schema migration when you must change a field type?'],
    },
  },

  {
    id: 'q-kafka-consumer-lag',
    question: 'How do you monitor and diagnose consumer lag in a production Kafka cluster?',
    category: 'Infrastructure',
    difficulty: 'intermediate',
    quickAnswer:
      'Consumer lag = LEO − committed offset per partition. Use kafka-consumer-groups.sh, JMX metrics, or Prometheus exporters. Alert on sustained growing lag, not transient spikes.',
    interviewAnswer:
      'Consumer lag is the gap between a partition\'s Log End Offset (what the producer has written) and the consumer group\'s committed offset (where the consumer has processed to). Measure it per group per partition with: kafka-consumer-groups.sh --bootstrap-server ... --describe --group my-group, or JMX metric kafka.consumer:records-lag-max per consumer instance. For dashboards, use the Prometheus kafka-exporter or Confluent\'s kminion, and build a Grafana panel with per-partition lag. Alert on lag that is growing over a sustained window (e.g., lag > 5000 AND growing for > 5 minutes) — transient spikes during rebalance are normal and self-heal.',
    detailedAnswer:
      'To diagnose the root cause: (1) check if all partitions are lagging or just some — single-partition lag usually means a processing bottleneck on one consumer instance; (2) check consumer-instance metrics (processing time, thread pool queue depth); (3) check broker metrics (under-replicated partitions, ISR shrink) for producer-side issues; (4) check DLQ lag — high DLQ messages mean errors are blocking progress; (5) check for rebalance events in consumer logs correlated with lag spikes. Distinguish between lag at rest (large but stable — consumer is processing at production rate, just behind) and growing lag (consumer is slower than producer — needs intervention).',
    seniorAnswer:
      'LinkedIn\'s Burrow is purpose-built for consumer lag alerting: instead of threshold-based alerts (lag > N), Burrow models expected consumer behaviour (is the consumer making progress? is it keeping up with the producer rate?) and alerts only on genuine anomalies. This dramatically reduces false alarms for variable-throughput consumers. In a bank environment, use lag-per-partition SLOs: report-delivery consumers must maintain < 30s lag (lag / partition throughput) to meet delivery SLAs. Instrument your consumer to emit processing_latency_seconds, records_processed_total, and errors_total metrics alongside Kafka\'s native consumer metrics for a complete picture.',
    keyTerms: ['LEO', 'committed offset', 'kafka-consumer-groups.sh', 'records-lag-max', 'Burrow', 'per-partition lag', 'growing vs stable lag'],
    conceptsTested: ['operational monitoring', 'lag diagnosis', 'alerting strategy'],
    relatedTopics: ['kafka-monitoring', 'kafka-consumer-group', 'kafka-dead-letter'],
    interviewerIntent: 'Assess production Kafka operational experience and ability to instrument and respond to consumer health issues.',
    aiAwareness: {
      strongAnswerShouldMention: ['LEO', 'per-partition breakdown', 'Prometheus exporter', 'growing vs stable lag distinction', 'Burrow'],
      weakAnswer: 'Check the lag with the CLI command.',
      redFlags: ['Only knowing one monitoring tool.', 'Not distinguishing growing lag from stable lag.'],
      likelyFollowUp: ['How do you reduce lag quickly on a consumer that has fallen behind?'],
    },
  },

  {
    id: 'q-kafka-partition-count',
    question: 'How do you decide how many partitions a Kafka topic should have?',
    category: 'Infrastructure',
    difficulty: 'advanced',
    quickAnswer:
      'Set partitions ≥ peak consumer group size. Use throughput ÷ per-partition throughput as a floor. Err on the side of more (can\'t reduce later), but avoid over-partitioning (file handles, metadata cost).',
    interviewAnswer:
      'Partition count determines two things: parallelism (max consumers in a group) and throughput (partitions are the unit of horizontal scalability). A good starting formula: target_throughput_MB/s ÷ per_partition_throughput_MB/s, rounded up to the next power of 2. Per-partition throughput is typically 10-100 MB/s depending on hardware. Separately, set partitions ≥ peak consumer group size — a 6-consumer group on a 3-partition topic leaves 3 consumers idle. Once set, you can only increase partitions, never decrease — and increasing reshuffles key-to-partition mapping. Start with more than you need today (e.g., 12 or 24) to avoid re-partitioning pain later.',
    detailedAnswer:
      'Each additional partition has costs: one file handle per partition per broker (with log segment files), additional ZooKeeper/KRaft metadata state, longer leader election time on broker failure. Very high partition counts (>10k per broker) start to cause GC pressure and slow controller operations in ZooKeeper mode — a key motivation for KRaft, which scales to millions of partitions. For a typical microservices event topic with moderate throughput, 12-24 partitions is a sensible default. For high-volume topics (>1 GB/s), calculate from throughput. Always consider whether key cardinality supports the partition count: if you only have 3 distinct keys, a 12-partition topic will have 9 unused partitions for keyed producers.',
    seniorAnswer:
      'The most common production mistake is under-partitioning a topic initially (e.g., 3 partitions for a small team\'s POC) and then needing to scale it up after keyed data is in production — because increasing partitions breaks key affinity for records already written. Build a "partition calculator" into your platform\'s topic provisioning process: input expected producer throughput, peak consumer group size, message key cardinality, and output a recommended partition count with a safety margin. Topics should be treated as immutable schemas — get the partition count right at creation time.',
    keyTerms: ['parallelism ceiling', 'throughput formula', 'key cardinality', 'file handles', 'KRaft scaling', 'partition count immutability'],
    conceptsTested: ['capacity planning', 'partition semantics', 'production trade-offs'],
    relatedTopics: ['kafka-topic-partition', 'kafka-consumer-group', 'kafka-broker-cluster'],
    interviewerIntent: 'Test production design thinking, not just mechanics.',
    aiAwareness: {
      strongAnswerShouldMention: ['throughput formula', 'consumer group size ceiling', 'key cardinality', 'can\'t reduce later', 'file handle cost'],
      weakAnswer: 'More partitions = more parallelism.',
      redFlags: ['Not knowing you can\'t reduce partition count.', 'Not considering key cardinality.'],
      likelyFollowUp: ['What happens to ordering guarantees when you increase partitions on a live topic?'],
    },
  },
];

export const kafkaQuestionCategories = Array.from(new Set(kafkaQuestions.map((q) => q.category)));
