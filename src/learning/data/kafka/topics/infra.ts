import type { LearningTopic } from '../../../types';

export const kafkaInfraTopics: LearningTopic[] = [
  {
    id: 'kafka-broker-cluster',
    technology: 'kafka',
    title: 'Brokers & Clusters',
    category: 'Infrastructure',
    slug: 'kafka-broker-cluster',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A Kafka broker is a server that stores partition log files and serves producers/consumers; a cluster is a set of brokers coordinated by ZooKeeper or KRaft, collectively hosting all topics.',
    mentalModel:
      'Brokers are like post office branches in a city. Each branch holds certain postal routes (partitions). One branch per route is the leader (accepts new mail); others hold copies (replicas). The head office (ZooKeeper/KRaft) knows which branch leads which route.',
    memoryTip:
      'Every partition has one leader broker and zero or more follower brokers. Producers and consumers always talk to the leader. Followers silently replicate.',
    keyTerms: ['broker', 'cluster', 'controller', 'ZooKeeper', 'KRaft', 'leader', 'follower', 'bootstrap.servers'],
    interviewAnswer:
      'A broker is a Kafka server process that persists topic partitions to disk and handles produce/fetch requests. A cluster is multiple brokers sharing the partition workload. One broker per cluster acts as the controller — it manages partition leadership, broker joins/failures, and topic metadata using ZooKeeper (pre-Kafka 3.3) or KRaft (the built-in Raft-based metadata mode, default in Kafka 3.3+). Each partition\'s leader broker accepts all produce and consume requests for that partition; follower brokers replicate from the leader asynchronously. When a leader fails, the controller promotes one of the ISR followers to leader within seconds.',
    detailedExplanation:
      'KRaft mode eliminates the ZooKeeper dependency — a subset of brokers (or dedicated controllers) form a Raft quorum that manages all cluster metadata. This simplifies operations significantly: no ZooKeeper ensemble to maintain, faster leader elections, and support for millions of partitions (ZooKeeper struggled beyond ~200k). The bootstrap.servers client config lists any subset of brokers — the client fetches the full cluster metadata from any responsive broker at startup and then routes partition requests to the correct leaders directly.',
    commonMistakes: [
      'Using a single broker in production — any broker failure loses partition leaders and the cluster becomes unavailable.',
      'Setting bootstrap.servers to only one broker — if that broker is down at client startup, the client cannot connect even if other brokers are healthy.',
      'Forgetting that the controller broker also handles regular produce/consume traffic — isolate controllers in very large clusters.',
    ],
    seniorInsight:
      'For a bank-grade production cluster, the recommended minimum is 3 brokers across 3 availability zones, with replication.factor=3 and min.insync.replicas=2. This survives a single broker (or AZ) failure without losing any data or availability — the 2 remaining replicas can still satisfy acks=all.',
    aiAwareness: {
      strongAnswerShouldMention: ['controller', 'KRaft vs ZooKeeper', 'leader election', 'bootstrap.servers', 'partition leadership'],
      weakAnswer: 'A cluster is multiple Kafka servers.',
      redFlags: ['Not knowing what the controller does.', 'Not knowing KRaft exists.'],
      likelyFollowUp: ['What is KRaft and why does it matter?', 'How does the controller elect a new partition leader?'],
    },
    prerequisites: ['kafka-overview', 'kafka-topic-partition'],
    relatedTopics: ['kafka-replication', 'kafka-monitoring'],
    nextTopics: ['kafka-replication'],
    references: [
      { title: 'KRaft — Kafka Without ZooKeeper', url: 'https://kafka.apache.org/documentation/#kraft', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-replication',
    technology: 'kafka',
    title: 'Replication & ISR',
    category: 'Infrastructure',
    slug: 'kafka-replication',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Kafka replicates each partition across multiple brokers for fault tolerance; the In-Sync Replica (ISR) set is the subset of replicas sufficiently caught-up with the leader to be eligible for promotion.',
    mentalModel:
      'ISR is the group of runners close enough to the race leader that they could take over if the leader drops out. Runners too far behind (lagging) are disqualified from the ISR until they catch up.',
    memoryTip:
      'replication.factor = total copies. min.insync.replicas = minimum copies required to accept acks=all writes. ISR ≤ replication.factor.',
    keyTerms: ['replication.factor', 'ISR', 'min.insync.replicas', 'leader epoch', 'unclean.leader.election', 'replica lag'],
    interviewAnswer:
      'Each partition is replicated across replication.factor brokers. The leader handles all reads and writes; followers fetch from the leader and apply records in order. A follower stays in the ISR if it is within replica.lag.time.max.ms of the leader — if a follower falls behind, it is removed from the ISR. With acks=all, the producer waits for all ISR members to persist the record. The min.insync.replicas broker/topic setting defines the minimum ISR size that must be satisfied for acks=all writes; if ISR shrinks below this threshold, the broker rejects produce requests with NotEnoughReplicasException rather than silently accepting unprotected writes. unclean.leader.election.enable=false (recommended) prevents a lagging replica from becoming leader — preserving durability at the cost of temporary unavailability.',
    practicalExample:
      'replication.factor=3, min.insync.replicas=2: with all 3 brokers healthy, writes require 3 ISR members (all). If broker 3 fails, ISR is {leader, broker2} = 2, which meets min.insync.replicas — writes continue. If broker 2 also fails, ISR = {leader} = 1 < min.insync.replicas=2 — writes are rejected. This is the right trade-off for financial data: availability is sacrificed before durability.',
    commonMistakes: [
      'Setting min.insync.replicas=1 with acks=all — gives false confidence; acks=all only waits for the leader, same as acks=1.',
      'Enabling unclean.leader.election.enable=true on financial topics — an out-of-date replica becomes leader and loses records written to the old leader.',
      'Setting replication.factor=1 in production to save disk space — any single broker failure loses that partition.',
    ],
    seniorInsight:
      'The safest production configuration for data durability: replication.factor=3, min.insync.replicas=2, acks=all, unclean.leader.election.enable=false. This is the Kafka "golden triangle". Monitor ISR shrinks as a critical alert — a replica falling out of ISR is the early warning of a degraded cluster before it impacts producers.',
    aiAwareness: {
      strongAnswerShouldMention: ['ISR', 'min.insync.replicas', 'acks=all', 'unclean.leader.election', 'replica.lag.time.max.ms'],
      weakAnswer: 'Kafka copies data across brokers for safety.',
      redFlags: ['Not knowing what ISR stands for or how it changes.', 'Thinking acks=all always waits for all replicas (it waits for ISR only).'],
      likelyFollowUp: ['What happens if ISR drops below min.insync.replicas?', 'When would you enable unclean leader election?'],
    },
    prerequisites: ['kafka-broker-cluster', 'kafka-producer'],
    relatedTopics: ['kafka-monitoring', 'kafka-producer', 'kafka-broker-cluster'],
    nextTopics: ['kafka-monitoring'],
    references: [
      { title: 'Replication Design', url: 'https://kafka.apache.org/documentation/#replication', source: 'Apache', type: 'official' },
    ],
  },

  {
    id: 'kafka-monitoring',
    technology: 'kafka',
    title: 'Monitoring & Consumer Lag',
    category: 'Infrastructure',
    slug: 'kafka-monitoring',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Consumer lag is the gap between the latest offset produced to a partition and the last offset committed by a consumer group — the primary health signal for Kafka consumers in production.',
    mentalModel:
      'Consumer lag is like the queue length at a checkout till. Zero lag = till is keeping up with shoppers. Growing lag = queue is lengthening — either shoppers (events) arrived faster or the cashier (consumer) slowed down.',
    memoryTip:
      'Lag = LEO (Log End Offset) − committed offset. Growing lag = consumer can\'t keep up. Sustained zero lag = healthy.',
    keyTerms: ['consumer lag', 'Log End Offset', 'kafka-consumer-groups.sh', 'JMX', 'Burrow', 'Prometheus kafka-exporter'],
    interviewAnswer:
      'Consumer lag is the number of unconsumed records in a partition: the partition\'s Log End Offset (LEO) minus the consumer group\'s committed offset. Zero lag means the consumer is keeping up in real time. Growing lag means the consumer is falling behind — either processing is too slow, consumers crashed and the group is rebalancing, or event volume spiked. Key monitoring tools: kafka-consumer-groups.sh --describe for CLI inspection; JMX metrics (kafka.consumer:type=consumer-fetch-manager-metrics) for per-consumer stats; Burrow or Prometheus kafka-exporter/consumer-offsets-exporter for dashboards and alerting. ISR shrinks, under-replicated partitions, and active controller count are broker-level signals to watch alongside consumer lag.',
    practicalExample:
      'In production, set a Grafana alert: "if consumer lag for group report-delivery on topic report-events > 1000 for > 5 minutes, page the on-call engineer." This detects a stalled consumer group (e.g., stuck in rebalance loop, or downstream PDF service down) before it escalates into a backlog that takes hours to drain.',
    commonMistakes: [
      'Only monitoring total lag, not per-partition lag — a single hot partition can mask that all other partitions are fine.',
      'Alerting on transient lag spikes without rate-of-change context — brief spikes during rebalances are normal.',
      'Not monitoring broker-side metrics (ISR shrink, under-replicated partitions) — consumer lag is a lagging indicator; broker degradation is the leading signal.',
    ],
    seniorInsight:
      'Measure lag rate-of-change, not just absolute value. A lag of 50,000 records growing at 1,000/second is critical; the same lag shrinking at 5,000/second is fine. Burrow (by LinkedIn) models expected lag behaviour per group and alerts on genuine anomalies rather than raw thresholds — much fewer false alarms for variable-throughput consumer groups.',
    aiAwareness: {
      strongAnswerShouldMention: ['LEO', 'committed offset', 'kafka-consumer-groups.sh', 'JMX', 'per-partition lag', 'ISR shrink'],
      weakAnswer: 'Consumer lag is how many messages are waiting to be processed.',
      redFlags: ['Not knowing how to inspect lag via CLI.', 'Monitoring only total lag and ignoring broker metrics.'],
      likelyFollowUp: ['How do you reduce consumer lag in a running system?', 'What is Burrow and why is it better than simple threshold alerts?'],
    },
    prerequisites: ['kafka-consumer-group', 'kafka-offset'],
    relatedTopics: ['kafka-replication', 'kafka-dead-letter', 'kafka-consumer-group'],
    interviewQuestions: ['q-kafka-consumer-lag'],
    references: [
      { title: 'Monitoring Kafka', url: 'https://kafka.apache.org/documentation/#monitoring', source: 'Apache', type: 'official' },
      { title: 'Burrow — Kafka Consumer Lag Checking', url: 'https://github.com/linkedin/Burrow', source: 'LinkedIn', type: 'article' },
    ],
  },
];
