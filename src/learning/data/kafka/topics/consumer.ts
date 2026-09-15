import type { LearningTopic } from '../../../types';

export const kafkaConsumerTopics: LearningTopic[] = [
  {
    id: 'kafka-consumer',
    technology: 'kafka',
    title: 'Kafka Consumer',
    category: 'Consumer',
    slug: 'kafka-consumer',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A Kafka consumer is a client that polls records from one or more topic partitions sequentially, tracks its position with an offset, and belongs to exactly one consumer group.',
    mentalModel:
      'A consumer is a database cursor that never blocks writers — it reads the log at its own pace, remembers its position (offset), and restarts from that position after a crash.',
    memoryTip:
      'poll() → process → commitAsync(). Always process before committing — commit after = at-least-once safety.',
    keyTerms: ['poll', 'offset commit', 'consumer group', 'partition assignment', 'heartbeat', 'session.timeout.ms'],
    interviewAnswer:
      'A Kafka consumer calls poll() in a loop, which returns a batch of records from the partitions assigned to it. The consumer processes each record and then commits its offset — either automatically (enable.auto.commit=true) or manually (commitSync/commitAsync). The consumer must send regular heartbeats to the group coordinator broker; if it misses heartbeats for longer than session.timeout.ms, the broker considers it dead, triggers a group rebalance, and reassigns its partitions to other group members. Manual commit after processing gives at-least-once delivery: if the consumer crashes between processing and committing, the records are re-delivered on restart.',
    detailedExplanation:
      'The poll() call does two things: it fetches records from the broker and sends a heartbeat to the group coordinator. If processing is too slow and poll() isn\'t called within max.poll.interval.ms, the broker treats the consumer as stuck and triggers a rebalance even if heartbeats are fine. This is a common production gotcha: always size max.poll.interval.ms to your worst-case processing time, and keep poll() called frequently by moving heavy processing off the poll thread (e.g. to a thread pool). The consumer maintains a fetch buffer per partition; fetch.min.bytes and fetch.max.wait.ms control the trade-off between latency and throughput for the fetch request.',
    codeExample: `KafkaConsumer<String, ReportEvent> consumer = new KafkaConsumer<>(props);
consumer.subscribe(List.of("report-events"));

try {
    while (running) {
        ConsumerRecords<String, ReportEvent> records = consumer.poll(Duration.ofMillis(500));
        for (ConsumerRecord<String, ReportEvent> record : records) {
            processReport(record.value());         // process first
        }
        consumer.commitAsync();                    // then commit
    }
} finally {
    consumer.close();
}`,
    codeOutput: '(processes each ReportEvent, then commits the batch offset)',
    whyOutput:
      'commitAsync() after the loop body means: only mark progress after the full batch is processed. A crash before commitAsync() causes re-delivery of that batch — acceptable for at-least-once; make processReport() idempotent to handle it cleanly.',
    practicalExample:
      'In a document-delivery system, a consumer group of three instances consumes report-events. Each instance is assigned a subset of partitions. If one instance crashes during a long PDF rendering job, the broker reassigns its partitions and those events are re-delivered — the processing logic checks whether the report PDF already exists before regenerating, making it safe to re-process.',
    commonMistakes: [
      'Doing heavy blocking work inside the poll loop without increasing max.poll.interval.ms — triggers false rebalances.',
      'Committing before processing (auto.commit timing) — causes data loss on crash.',
      'Not calling consumer.close() on shutdown — leaks the connection and delays rebalance for other group members.',
    ],
    seniorInsight:
      'For high-volume consumers, use concurrent processing with a thread pool but commit offsets only after all threads in a batch complete. Track the "high-water mark" offset per partition and commit that after all parallel tasks finish — this is the pause-and-commit pattern, safer than async per-record commits.',
    aiAwareness: {
      strongAnswerShouldMention: ['poll loop', 'heartbeat', 'session.timeout.ms', 'max.poll.interval.ms', 'commit after process', 'rebalance'],
      weakAnswer: 'The consumer reads messages from Kafka.',
      redFlags: ['Not knowing what triggers a rebalance.', 'Not knowing the difference between heartbeat and poll interval.'],
      likelyFollowUp: ['What happens if a consumer is slow?', 'How do you handle consumer lag?'],
    },
    prerequisites: ['kafka-topic-partition', 'kafka-offset'],
    relatedTopics: ['kafka-consumer-group', 'kafka-offset', 'kafka-dead-letter'],
    nextTopics: ['kafka-consumer-group'],
    interviewQuestions: ['q-kafka-consumer-group', 'q-kafka-rebalancing'],
    references: [
      { title: 'Consumer Configuration', url: 'https://kafka.apache.org/documentation/#consumerconfigs', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-consumer-group',
    technology: 'kafka',
    title: 'Consumer Groups',
    category: 'Consumer',
    slug: 'kafka-consumer-group',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A consumer group is a named set of consumers that collectively read a topic — each partition is owned by exactly one member, enabling horizontal scaling while maintaining per-partition ordering.',
    mentalModel:
      'A consumer group is a team of delivery drivers covering a city: each driver owns a set of postcodes (partitions). Adding a driver redistributes postcodes. Two separate teams can cover the same city independently — each with their own complete delivery routes.',
    memoryTip:
      'Max useful parallelism = number of partitions. More consumers than partitions = idle consumers. Different groups = independent reads from the same topic.',
    keyTerms: ['group.id', 'partition assignment', 'group coordinator', 'rebalance', 'static membership'],
    visualIds: ['kafka-consumer-group-flow'],
    interviewAnswer:
      'A consumer group is identified by group.id. Kafka ensures each partition of a subscribed topic is assigned to exactly one consumer in the group at any time. This allows the group to process a topic in parallel: a 12-partition topic can be consumed by up to 12 consumers simultaneously. Multiple different groups read the same topic entirely independently — each group has its own committed offsets, so a reporting group and an audit group both get every record from the same topic without interfering. If a consumer joins or leaves, the group coordinator triggers a rebalance, redistributing partitions among active members.',
    detailedExplanation:
      'When consumers join the group they all send JoinGroup requests to the group coordinator broker. The coordinator selects one consumer as group leader, which runs the partition assignment algorithm (range, round-robin, sticky, or cooperative-sticky) and sends the result back via SyncGroup. Cooperative-sticky rebalancing (default since Kafka 2.4 with the ConsumerCooperativeStickyAssignor) allows a rolling rebalance where only moved partitions are paused, rather than stopping the entire group — critical for high-throughput consumers. Static group membership (group.instance.id) lets a restarting consumer rejoin without triggering a rebalance, using the same partition assignment, for the duration of session.timeout.ms.',
    commonMistakes: [
      'Deploying more consumer instances than partitions — extra consumers sit idle and waste resources.',
      'Using the same group.id for two different applications that should read the same topic independently — they will interfere, each getting only a subset of records.',
      'Not using cooperative-sticky rebalancing in production — the default eager rebalance stops all consumers entirely, causing a processing gap.',
    ],
    seniorInsight:
      'Static membership (group.instance.id) is a key operational improvement for services deployed on Kubernetes: rolling restarts no longer trigger full rebalances since the coordinator gives a pod session.timeout.ms to come back with the same instance ID before reassigning its partitions.',
    aiAwareness: {
      strongAnswerShouldMention: ['group.id', 'partition-per-consumer limit', 'independent groups', 'rebalance', 'cooperative-sticky'],
      weakAnswer: 'Consumer groups let multiple consumers read the same topic.',
      redFlags: [
        'Claiming two groups "share" the load — they independently consume the full topic.',
        'Not knowing what a rebalance is or what triggers it.',
      ],
      likelyFollowUp: ['What is a rebalance and how do you minimise its impact?', 'How does static group membership help?'],
    },
    prerequisites: ['kafka-consumer', 'kafka-topic-partition'],
    relatedTopics: ['kafka-offset', 'kafka-rebalancing', 'kafka-monitoring'],
    nextTopics: ['kafka-rebalancing'],
    interviewQuestions: ['q-kafka-consumer-group', 'q-kafka-rebalancing'],
    references: [
      { title: 'Consumer Groups and Offset Management', url: 'https://kafka.apache.org/documentation/#intro_consumers', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-rebalancing',
    technology: 'kafka',
    title: 'Consumer Group Rebalancing',
    category: 'Consumer',
    slug: 'kafka-rebalancing',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'A rebalance is the protocol by which Kafka redistributes partition ownership among consumer group members when the group composition changes — a necessary but disruptive event that must be minimised in production.',
    mentalModel:
      'Rebalancing is like reshuffling a hand of cards among players when someone joins or leaves the game. Eager rebalancing takes all cards back first; cooperative rebalancing only passes the cards that need to move.',
    memoryTip:
      'Eager = stop the world, reassign all. Cooperative = move only what changed, others keep processing.',
    keyTerms: ['JoinGroup', 'SyncGroup', 'eager', 'cooperative-sticky', 'static membership', 'group.instance.id'],
    interviewAnswer:
      'A rebalance is triggered when: a consumer joins the group, a consumer leaves (cleanly or via timeout), a new partition is added to a subscribed topic, or a rebalance is forced administratively. During an eager rebalance (the old default), all consumers revoke all partitions, stop processing, and wait for the coordinator to reassign — causing a processing pause. Cooperative-sticky rebalancing (recommended since Kafka 3.x) allows incremental rebalancing: only partitions that need to move are revoked, so consumers holding their current partitions continue processing during the protocol. Static membership (group.instance.id) prevents rebalances on planned restarts within session.timeout.ms.',
    practicalExample:
      'A Kubernetes deployment rolling-updates a 6-pod consumer group. Without static membership, each pod restart triggers a full rebalance, creating six sequential processing pauses. With group.instance.id set to the pod name and session.timeout.ms=60s, pods restart and rejoin with the same partition assignment within the timeout window — zero rebalances, zero pauses.',
    commonMistakes: [
      'Not increasing session.timeout.ms when slow processing causes heartbeat misses — triggers rebalances on perfectly healthy consumers.',
      'Not switching from eager to cooperative-sticky assignor — unnecessary full stops on large groups.',
      'Not handling the ConsumerRebalanceListener — failing to commit offsets before partitions are revoked leads to reprocessing.',
    ],
    seniorInsight:
      'Always implement ConsumerRebalanceListener.onPartitionsRevoked() to commitSync() in-progress offsets before a rebalance hands partitions to another consumer — otherwise the new owner starts from the last committed offset, potentially reprocessing records.',
    aiAwareness: {
      strongAnswerShouldMention: ['eager vs cooperative', 'static membership', 'ConsumerRebalanceListener', 'session.timeout.ms'],
      weakAnswer: 'Rebalancing happens when a consumer fails.',
      redFlags: ['Not knowing what causes a rebalance beyond consumer failure.', 'Not knowing cooperative rebalancing exists.'],
      likelyFollowUp: ['How do you commit offsets safely during a rebalance?', 'When would static membership not be appropriate?'],
    },
    prerequisites: ['kafka-consumer-group'],
    relatedTopics: ['kafka-consumer', 'kafka-offset', 'kafka-monitoring'],
    nextTopics: ['kafka-offset', 'kafka-monitoring'],
    references: [
      { title: 'Incremental Cooperative Rebalancing in Apache Kafka', url: 'https://www.confluent.io/blog/incremental-cooperative-rebalancing-in-kafka/', source: 'Confluent', type: 'article' },
    ],
  },
];
