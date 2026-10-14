import type { LearningTopic } from '../../types';

const T = 'system-design';

export const systemDesignTopics: LearningTopic[] = [
  /* ----------------------------------------------------------- Fundamentals */
  {
    id: 'sd-scalability-basics',
    technology: T,
    title: 'Scalability, Load Balancing & Statelessness',
    category: 'Fundamentals',
    slug: 'sd-scalability-basics',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Handling more load by adding machines (horizontal) rather than bigger machines (vertical), which requires stateless services behind a load balancer.',
    mentalModel: 'Vertical scaling buys a bigger truck; horizontal scaling hires more trucks. More trucks only work if any truck can deliver any parcel — that is statelessness.',
    memoryTip: 'Stateless app tier + load balancer + shared state in DB/cache = horizontal scale.',
    keyTerms: ['horizontal scaling', 'vertical scaling', 'stateless', 'load balancer', 'L4 vs L7', 'sticky sessions', 'autoscaling', 'health checks'],
    interviewAnswer: `Vertical scaling (bigger CPU/RAM) is simple but has a ceiling and a single point of failure. Horizontal scaling adds instances behind a load balancer and is the default for web tiers, but it requires stateless services: session state, uploads and caches must live in shared stores (Redis, DB, object storage), not instance memory. Load balancers work at L4 (TCP, fast, no content awareness) or L7 (HTTP, routing by path/header, TLS termination) using algorithms such as round robin, least connections or consistent hashing, and they remove unhealthy instances via health checks. The data tier is the hard part — scaled with read replicas, caching and eventually sharding.`,
    detailedExplanation: `Sticky sessions are a crutch: they break even distribution and lose sessions when an instance dies. Autoscaling should key off a signal correlated with saturation (CPU, request concurrency, queue lag) with headroom for scale-up delay. Remember Amdahl: the slowest shared component (often the primary database) caps the whole system.`,
    codeExample: `# Requests per instance and instance count — quick capacity check
peak_rps = 12_000
latency_s = 0.050          # p50 service time per request
threads_per_instance = 200 # concurrent request capacity per instance

# Little's Law: concurrency = throughput x latency
concurrency_needed = peak_rps * latency_s           # 600 in-flight requests
instances = -(-concurrency_needed // threads_per_instance)   # ceil -> 3
with_headroom = int(instances * 1.5) + 1            # N+1 and 50% headroom
print(concurrency_needed, instances, with_headroom)`,
    codeLanguage: 'Python',
    codeOutput: '600.0 3 5',
    whyOutput: `Little's Law (L = λ × W) turns throughput and latency into required concurrency: 12,000 rps × 50ms = 600 in-flight requests. At 200 per instance that is 3 instances; adding headroom and one spare for failure/deploys gives 5.`,
    commonMistakes: [
      'Storing sessions in instance memory and relying on sticky sessions.',
      'Scaling the app tier while the single database is the bottleneck.',
      'Autoscaling on CPU for I/O-bound services.',
    ],
    seniorInsight: `Always state the scaling bottleneck explicitly in interviews. "The app tier scales horizontally; the write path to the primary DB is the constraint, so I add caching for reads, a queue to smooth writes, and plan sharding by account id when we exceed ~X writes/sec."`,
    prerequisites: [],
    relatedTopics: ['sd-cap-pacelc', 'sd-caching-strategies', 'sd-back-of-envelope'],
    nextTopics: ['sd-back-of-envelope', 'sd-cap-pacelc'],
    references: [
      {
        title: 'The System Design Primer',
        url: 'https://github.com/donnemartin/system-design-primer',
        source: 'GitHub',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-scale-to-million-users'],
  },
  {
    id: 'sd-cap-pacelc',
    technology: T,
    title: 'CAP, PACELC & Consistency Models',
    category: 'Fundamentals',
    slug: 'sd-cap-pacelc',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'During a network partition a distributed store must choose consistency or availability; even without partitions it trades latency against consistency.',
    mentalModel: 'Two bank branches lose their phone line. Either both refuse withdrawals until the line is back (CP), or both allow them and reconcile later (AP).',
    memoryTip: 'Partitions are not optional, so CAP is really "C or A when P happens". PACELC adds: Else, Latency or Consistency.',
    keyTerms: ['CAP', 'PACELC', 'linearizability', 'eventual consistency', 'read-your-writes', 'quorum', 'strong consistency'],
    interviewAnswer: `CAP says that when a network partition occurs, a replicated system can either stay consistent (reject or block some requests — CP) or stay available (answer with possibly stale data — AP). Since partitions will happen, the real choice is per operation. PACELC extends it: if Partitioned choose A or C, Else choose Latency or Consistency — synchronous replication gives consistency at the cost of latency. In practice I choose per data type: account balances and payments need strong consistency (single leader, synchronous commit); product catalogues, feeds and analytics tolerate eventual consistency for lower latency and higher availability.`,
    detailedExplanation: `Consistency is a spectrum: linearizable (strongest), sequential, causal, read-your-writes, monotonic reads, eventual. Quorum systems (Cassandra/Dynamo-style) tune it with N replicas, W write acks and R read acks: R + W > N gives overlap so reads see the latest acknowledged write (absent sloppy quorums and clock issues).`,
    codeExample: `def quorum_is_strong(n: int, w: int, r: int) -> bool:
    """Read and write sets overlap when R + W > N."""
    return r + w > n

configs = {"fast writes": (3, 1, 1), "QUORUM/QUORUM": (3, 2, 2), "write ALL": (3, 3, 1)}
for name, (n, w, r) in configs.items():
    print(f"{name:14} N={n} W={w} R={r} -> overlapping: {quorum_is_strong(n, w, r)}")`,
    codeLanguage: 'Python',
    codeOutput: 'fast writes    N=3 W=1 R=1 -> overlapping: False\nQUORUM/QUORUM  N=3 W=2 R=2 -> overlapping: True\nwrite ALL      N=3 W=3 R=1 -> overlapping: True',
    whyOutput: `With W=1, R=1 a read can hit a replica that has not received the write yet. QUORUM/QUORUM (2+2 > 3) guarantees at least one replica in every read set saw the latest acknowledged write; write-ALL achieves overlap but any single replica failure blocks writes.`,
    commonMistakes: [
      'Saying "pick two of three" as if partitions were optional.',
      'Calling a single-node RDBMS "CA" as a meaningful distributed design.',
      'Applying one consistency level to the whole system.',
    ],
    seniorInsight: `Interviewers reward naming the business consequence: "If the balance read is stale, we may approve an overdraft — so balance checks go to the leader; the transaction history list can be served from a replica with a few seconds' lag."`,
    prerequisites: ['sd-scalability-basics'],
    relatedTopics: ['sd-sharding-replication', 'sd-consistent-hashing'],
    nextTopics: ['sd-sharding-replication'],
    references: [
      {
        title: 'Consistency Tradeoffs in Modern Distributed Database System Design (PACELC) — Abadi',
        url: 'https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf',
        source: 'IEEE Computer',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-cap-in-practice'],
  },
  {
    id: 'sd-back-of-envelope',
    technology: T,
    title: 'Back-of-the-Envelope Estimation',
    category: 'Fundamentals',
    slug: 'sd-back-of-envelope',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Quick order-of-magnitude maths for QPS, storage and bandwidth that justifies design choices before you draw boxes.',
    mentalModel: 'Numbers decide architecture: 100 writes/s fits one Postgres; 100,000 writes/s does not.',
    memoryTip: '1 day ≈ 86,400 s ≈ 10^5 s. 1M requests/day ≈ 12 rps. Peak ≈ 2–3× average.',
    keyTerms: ['QPS', 'peak factor', 'storage growth', 'bandwidth', 'latency numbers', 'read:write ratio'],
    interviewAnswer: `I estimate daily active users × actions per user to get requests per day, divide by ~10^5 seconds for average QPS and multiply by 2–3 for peak. Storage = writes per day × object size × retention (× replication factor). Bandwidth = QPS × payload size. Then I compare with rough capacity: a single well-tuned relational primary handles thousands of simple writes per second, Redis handles ~100k ops/s per node, and memory reads are ~100ns vs ~0.5ms within a datacenter vs ~100ms across continents. Those numbers tell me whether I need caching, sharding or a queue.`,
    codeExample: `dau = 10_000_000
writes_per_user_per_day = 2        # e.g. new short URLs
reads_per_write = 100              # read-heavy
seconds_per_day = 86_400

write_qps = dau * writes_per_user_per_day / seconds_per_day
read_qps = write_qps * reads_per_write
peak_read_qps = read_qps * 3

record_bytes = 500
years = 5
storage_tb = dau * writes_per_user_per_day * 365 * years * record_bytes / 1e12

print(round(write_qps), round(read_qps), round(peak_read_qps), round(storage_tb, 1))`,
    codeLanguage: 'Python',
    codeOutput: '231 23148 69444 18.2',
    whyOutput: `About 230 writes/s (trivial for one primary) but ~23k reads/s average and ~70k at peak — clearly a caching problem, not a write-scaling problem. 18TB over 5 years before replication suggests partitioning storage eventually.`,
    commonMistakes: [
      'Skipping estimation and jumping to "use Kafka and Cassandra".',
      'Forgetting peak vs average and replication overhead.',
      'False precision — round aggressively.',
    ],
    prerequisites: [],
    relatedTopics: ['sd-scalability-basics', 'sd-case-url-shortener'],
    references: [
      {
        title: 'Latency Numbers Every Programmer Should Know',
        url: 'https://gist.github.com/jboner/2841832',
        source: 'GitHub (Jeff Dean / Peter Norvig numbers)',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-scale-to-million-users'],
  },

  /* ---------------------------------------------------------- Data & Caching */
  {
    id: 'sd-caching-strategies',
    technology: T,
    title: 'Caching Strategies & Cache Invalidation',
    category: 'Data & Caching',
    slug: 'sd-caching-strategies',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Keeping hot data in fast storage (Redis, local memory, CDN) using patterns like cache-aside, write-through and write-behind — and deciding how it goes stale.',
    mentalModel: 'A cache is a sticky note copy of a document. It is fast to read but can be out of date; the strategy is how and when you rewrite the note.',
    memoryTip: 'Cache-aside for reads, TTL + explicit eviction for freshness, jittered TTL + request coalescing against stampedes.',
    keyTerms: ['cache-aside', 'write-through', 'write-behind', 'TTL', 'eviction (LRU/LFU)', 'cache stampede', 'thundering herd', 'CDN', 'hot key'],
    visualIds: ['sd-cache-aside-flow'],
    interviewAnswer: `Cache-aside (lazy loading) is the default: read the cache, on miss load from the DB and populate with a TTL; on update, write the DB then delete the cache key. Write-through writes cache and DB synchronously (fresh but slower writes); write-behind writes the cache and flushes to the DB asynchronously (fast but risks data loss). Freshness comes from TTLs plus explicit invalidation. Production pitfalls: stampede when a hot key expires (fix with request coalescing/locks, early refresh, jittered TTLs), hot keys overloading one Redis shard (local L1 cache, key replication), and caching null results to stop penetration by non-existent keys.`,
    detailedExplanation: `Delete-on-write beats update-on-write because concurrent updates can write stale values into the cache in the wrong order. Even delete has a race (a reader populates an old value after the delete); short TTLs bound the damage, or use versioned keys / CDC-driven invalidation. Multi-level caching: in-process (Caffeine) for microsecond hits, Redis for shared state, CDN for static and cacheable API responses.`,
    codeExample: `import json, random, redis

r = redis.Redis()
TTL = 300

def get_account_summary(account_id: str, db) -> dict:
    key = f"acct:summary:{account_id}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)                      # hit

    # Stampede protection: only one caller rebuilds, others briefly retry
    if r.set(f"lock:{key}", "1", nx=True, ex=10):
        try:
            summary = db.load_summary(account_id)      # miss -> source of truth
            r.set(key, json.dumps(summary), ex=TTL + random.randint(0, 60))  # jittered TTL
            return summary
        finally:
            r.delete(f"lock:{key}")
    return db.load_summary(account_id)                 # fallback, or sleep + retry cache

def update_account(account_id: str, changes: dict, db) -> None:
    db.update(account_id, changes)                     # 1. write source of truth
    r.delete(f"acct:summary:{account_id}")             # 2. invalidate (not update) cache`,
    codeLanguage: 'Python',
    whyOutput: `Reads are served from Redis after the first miss. The NX lock means a hot key expiring does not send thousands of simultaneous queries to the database, and TTL jitter prevents many keys expiring at the same instant. Updates delete the key so the next read reloads fresh data.`,
    commonMistakes: [
      'Updating the cache on write instead of invalidating (ordering races).',
      'No TTL — stale forever after a missed invalidation.',
      'Caching without a plan for stampedes and hot keys.',
      'Caching data that must be strongly consistent (balances at authorisation time).',
    ],
    seniorInsight: `Measure hit ratio, latency and evictions per cache. A cache with a 30% hit ratio adds a network hop to most requests and complexity for little gain. And design for cache failure: the database must survive a cold or unavailable cache (rate-limit rebuilds, degrade gracefully).`,
    aiAwareness: {
      strongAnswerShouldMention: ['cache-aside', 'TTL', 'invalidate on write', 'stampede', 'hot keys', 'consistency trade-off'],
      weakAnswer: 'Put Redis in front of the database to make it faster.',
      redFlags: ['No invalidation strategy', 'Caches everything including balances'],
      likelyFollowUp: ['How do you prevent a cache stampede?', 'Delete vs update on write?', 'What if Redis goes down?'],
    },
    prerequisites: ['sd-scalability-basics'],
    relatedTopics: ['sd-consistent-hashing', 'sd-case-url-shortener', 'sb-jpa-n-plus-one'],
    nextTopics: ['sd-sharding-replication'],
    references: [
      {
        title: 'Caching patterns — AWS Whitepaper (Database Caching Strategies Using Redis)',
        url: 'https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html',
        source: 'AWS',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-sd-cache-invalidation', 'q-sd-cache-stampede'],
  },
  {
    id: 'sd-sharding-replication',
    technology: T,
    title: 'Database Replication & Sharding',
    category: 'Data & Caching',
    slug: 'sd-sharding-replication',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Replication copies data for read scale and availability; sharding splits data across nodes so writes and storage scale.',
    mentalModel: 'Replication = photocopies of the same ledger in several branches. Sharding = splitting customers A–M and N–Z into different ledgers.',
    memoryTip: 'Replicas scale reads, shards scale writes. Choose the shard key by the dominant access pattern; avoid cross-shard transactions.',
    keyTerms: ['leader-follower', 'replication lag', 'multi-leader', 'shard key', 'hash vs range sharding', 'hot partition', 'resharding', 'read-your-writes'],
    interviewAnswer: `Leader-follower replication sends writes to a leader and streams changes to followers that serve reads; async replication is fast but introduces lag (stale reads, possible data loss on failover), sync replication is safer but slower. Sharding partitions data by a shard key: hash sharding spreads load evenly but makes range queries scatter-gather; range sharding keeps ranges together but risks hot spots (e.g. time-based keys). I pick the key from the main access pattern — customer_id for a banking app so a customer's accounts and transactions live together — avoid cross-shard joins and transactions, and use consistent hashing or a directory service to make resharding manageable.`,
    detailedExplanation: `Read-your-writes after replication lag: route a user's reads to the leader for a short window after they write, or track the replication position. Before sharding, exhaust simpler options: indexing, query optimisation, caching, read replicas, vertical scaling, archiving cold data, and partitioning within one database (Postgres declarative partitioning).`,
    codeExample: `import hashlib

SHARDS = ["pg-shard-0", "pg-shard-1", "pg-shard-2", "pg-shard-3"]

def shard_for(customer_id: str) -> str:
    h = int(hashlib.md5(customer_id.encode()).hexdigest(), 16)
    return SHARDS[h % len(SHARDS)]

for cid in ["C1001", "C1002", "C1003"]:
    print(cid, "->", shard_for(cid))
# Problem: changing len(SHARDS) from 4 to 5 remaps ~80% of keys -> use consistent hashing.`,
    codeLanguage: 'Python',
    codeOutput: 'C1001 -> pg-shard-<n>\nC1002 -> pg-shard-<n>\nC1003 -> pg-shard-<n>   (deterministic per id)',
    whyOutput: `Hashing gives a stable, even mapping from customer to shard, so all of a customer's data is co-located. The modulo approach is simple but resharding moves most keys, which is why consistent hashing or a lookup directory is preferred.`,
    commonMistakes: [
      'Sharding too early instead of using replicas, caching and indexes.',
      'Choosing a shard key that creates hot partitions (timestamps, celebrity ids).',
      'Ignoring replication lag in read-after-write flows.',
    ],
    prerequisites: ['sd-cap-pacelc'],
    relatedTopics: ['sd-consistent-hashing', 'sd-cap-pacelc'],
    nextTopics: ['sd-consistent-hashing'],
    references: [
      {
        title: 'Designing Data-Intensive Applications — Ch. 5 Replication, Ch. 6 Partitioning (Kleppmann)',
        url: 'https://dataintensive.net/',
        source: "O'Reilly",
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-sharding-key'],
  },
  {
    id: 'sd-consistent-hashing',
    technology: T,
    title: 'Consistent Hashing',
    category: 'Data & Caching',
    slug: 'sd-consistent-hashing',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Mapping keys and nodes onto a hash ring so adding or removing a node moves only about 1/N of the keys.',
    mentalModel: 'Nodes sit on a clock face; each key walks clockwise to the first node it meets. A new node only steals keys from its clockwise neighbour.',
    memoryTip: 'Modulo hashing remaps almost everything; the ring remaps ~K/N. Virtual nodes smooth the distribution.',
    keyTerms: ['hash ring', 'virtual nodes', 'rebalancing', 'Dynamo', 'Cassandra', 'rendezvous hashing'],
    interviewAnswer: `With hash(key) % N, changing N remaps most keys — a cache cluster resize would wipe the hit ratio. Consistent hashing places both nodes and keys on a ring of hash values; a key belongs to the first node clockwise. Adding a node only takes over keys between it and its predecessor, roughly K/N keys. Each physical node is placed many times as virtual nodes so load stays even and a failed node's keys spread across many survivors. It is used in Dynamo-style databases (Cassandra, Riak), distributed caches and load balancers.`,
    codeExample: `import bisect, hashlib

class HashRing:
    def __init__(self, nodes, vnodes=100):
        self.ring = sorted((self._h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes))
        self.keys = [h for h, _ in self.ring]

    @staticmethod
    def _h(s: str) -> int:
        return int(hashlib.sha1(s.encode()).hexdigest(), 16)

    def node_for(self, key: str) -> str:
        idx = bisect.bisect(self.keys, self._h(key)) % len(self.keys)
        return self.ring[idx][1]

keys = [f"user:{i}" for i in range(10_000)]
before = HashRing(["a", "b", "c", "d"])
after = HashRing(["a", "b", "c", "d", "e"])
moved = sum(before.node_for(k) != after.node_for(k) for k in keys)
print(f"moved {moved / len(keys):.0%} of keys")      # ~20% (= 1/5), vs ~80% with modulo`,
    codeLanguage: 'Python',
    codeOutput: 'moved 20% of keys   (approximately)',
    whyOutput: `Adding a fifth node should take roughly one fifth of the keyspace, and only from its ring neighbours; with 100 virtual nodes per server the measured share lands close to 20%. Plain modulo would move about 80% of keys.`,
    commonMistakes: ['No virtual nodes, causing uneven load', 'Thinking it eliminates hot keys (a single hot key still lands on one node)'],
    prerequisites: ['sd-sharding-replication'],
    relatedTopics: ['sd-caching-strategies', 'sd-sharding-replication'],
    references: [
      {
        title: 'Dynamo: Amazon\u2019s Highly Available Key-value Store',
        url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
        source: 'SOSP 2007',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-consistent-hashing'],
  },

  /* ------------------------------------------------------------ API Gateway */
  {
    id: 'sd-api-gateway',
    technology: T,
    title: 'API Gateway Pattern & Backend-for-Frontend',
    category: 'API Gateway',
    slug: 'sd-api-gateway',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'A single entry point that routes client requests to backend services and centralises edge concerns like auth, rate limiting, TLS and observability.',
    mentalModel: 'An airport security checkpoint: everyone passes through one controlled entry, gets checked once, then goes to the right gate.',
    memoryTip: 'Gateway = edge cross-cutting concerns. BFF = per-client aggregation. Neither holds business rules.',
    keyTerms: ['reverse proxy', 'routing', 'authentication offload', 'rate limiting', 'request aggregation', 'BFF', 'Kong', 'AWS API Gateway', 'Envoy', 'service mesh'],
    visualIds: ['sd-api-gateway-flow'],
    interviewAnswer: `An API Gateway is a reverse proxy at the edge that gives clients one stable endpoint while hiding service topology. Responsibilities: routing and versioned paths, TLS termination, authentication/token validation, rate limiting and quotas, request validation and size limits, CORS, response caching, protocol translation (REST to gRPC), and centralised logging/metrics/tracing. Risks: it becomes a single point of failure and a bottleneck (run it redundantly), and teams are tempted to put business logic in it. The Backend-for-Frontend variant gives each client type (mobile, web, partner) its own thin gateway that aggregates calls and shapes payloads for that client. Gateway handles north-south traffic; a service mesh (Istio/Linkerd) handles east-west traffic between services.`,
    detailedExplanation: `Options: managed (AWS API Gateway, Azure APIM, Apigee) vs self-hosted (Kong, NGINX, Envoy, Spring Cloud Gateway). Managed gateways add per-request cost and latency but provide usage plans, API keys and developer portals for partner APIs.`,
    commonMistakes: [
      'Business logic or orchestration inside the gateway.',
      'Relying on the gateway as the only authorisation check.',
      'Single gateway instance / no capacity planning.',
      'One giant BFF shared by all clients.',
    ],
    seniorInsight: `Make gateway configuration code: routes and policies versioned in Git, deployed through CI with canary rollout. A bad route change at the gateway can take down every API at once.`,
    aiAwareness: {
      strongAnswerShouldMention: ['single entry point', 'auth/rate limiting/TLS', 'no business logic', 'BFF', 'SPOF mitigation', 'gateway vs service mesh'],
      weakAnswer: 'The gateway forwards requests to microservices.',
      redFlags: ['Business logic in gateway', 'Gateway as only security'],
      likelyFollowUp: ['Gateway vs load balancer?', 'Gateway vs service mesh?', 'How do you rate limit across gateway instances?'],
    },
    prerequisites: ['sd-scalability-basics'],
    relatedTopics: ['sb-spring-cloud-gateway', 'sd-rate-limiting', 'sd-rest-api-design'],
    nextTopics: ['sd-rate-limiting'],
    references: [
      {
        title: 'Pattern: API Gateway / Backends for Frontends',
        url: 'https://microservices.io/patterns/apigateway.html',
        source: 'microservices.io',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-gateway-vs-lb-vs-mesh'],
  },
  {
    id: 'sd-rate-limiting',
    technology: T,
    title: 'Rate Limiting Algorithms (Design a Rate Limiter)',
    category: 'API Gateway',
    slug: 'sd-rate-limiting',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Capping how many requests a client can make per time window — token bucket, leaky bucket, fixed window, sliding window — usually enforced at the gateway with Redis.',
    mentalModel: 'Token bucket: a bucket refills with N tokens per second up to a capacity; each request takes a token; no token, no entry (429).',
    memoryTip: 'Token bucket = allows bursts. Leaky bucket = smooth output. Sliding window = accurate. Fixed window = simple but bursty at edges.',
    keyTerms: ['token bucket', 'leaky bucket', 'fixed window', 'sliding window log', 'sliding window counter', '429 Too Many Requests', 'Retry-After', 'Redis Lua'],
    interviewAnswer: `Token bucket is the most common: each client has a bucket with capacity C refilled at rate R; a request consumes a token or is rejected with 429 and a Retry-After header — it permits short bursts up to C while enforcing the average rate R. Leaky bucket processes requests at a constant rate (queue) for smooth output. Fixed window counters are simple but allow 2× bursts at window boundaries; sliding window log is exact but memory-heavy; sliding window counter approximates it cheaply. In a distributed gateway the state lives in Redis and the check-and-decrement must be atomic (Lua script), keyed by API key/user/IP and endpoint.`,
    detailedExplanation: `Decide fail-open vs fail-closed when Redis is unavailable (usually fail-open with local in-memory limits as a backstop). Layer limits: global per-IP at the CDN/WAF, per-user/per-plan at the gateway, per-dependency concurrency limits inside services. Return X-RateLimit-Limit/Remaining/Reset headers.`,
    codeExample: `import time

class TokenBucket:
    def __init__(self, rate_per_sec: float, capacity: int):
        self.rate, self.capacity = rate_per_sec, capacity
        self.tokens, self.last = float(capacity), time.monotonic()

    def allow(self) -> bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

bucket = TokenBucket(rate_per_sec=5, capacity=10)
burst = [bucket.allow() for _ in range(15)]           # 15 instant requests
print(burst.count(True), "allowed,", burst.count(False), "rejected")
time.sleep(1)                                          # refills ~5 tokens
print(sum(bucket.allow() for _ in range(10)), "allowed after 1s")`,
    codeLanguage: 'Python',
    codeOutput: '10 allowed, 5 rejected\n5 allowed after 1s',
    whyOutput: `The bucket starts full (10 tokens), so a burst of 15 lets 10 through and rejects 5. After one second at 5 tokens/s, about 5 more requests are allowed. Distributed versions keep tokens and last-refill time in Redis and update them atomically in a Lua script.`,
    commonMistakes: [
      'Non-atomic read-modify-write on Redis (race conditions under concurrency).',
      'Rate limiting only by IP (NAT, mobile carriers share IPs).',
      'Returning 503 instead of 429 with Retry-After.',
    ],
    prerequisites: ['sd-api-gateway'],
    relatedTopics: ['sd-api-gateway', 'sb-resilience4j', 'sb-spring-cloud-gateway'],
    references: [
      {
        title: 'Rate limiting — Cloudflare Learning Center',
        url: 'https://www.cloudflare.com/learning/bots/what-is-rate-limiting/',
        source: 'Cloudflare',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-design-rate-limiter'],
  },

  /* -------------------------------------------------------- REST API Design */
  {
    id: 'sd-rest-api-design',
    technology: T,
    title: 'REST API Design Principles',
    category: 'REST API Design',
    slug: 'sd-rest-api-design',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Modelling APIs as resources (nouns) manipulated with HTTP methods and status codes, with predictable naming, errors, versioning and pagination.',
    mentalModel: 'URLs name things, HTTP methods are the verbs, status codes are the outcome, headers are metadata.',
    memoryTip: 'GET safe+idempotent, PUT/DELETE idempotent, POST neither, PATCH not guaranteed. 201+Location on create, 204 on empty success.',
    keyTerms: ['resource', 'HTTP methods', 'idempotency', 'status codes', 'HATEOAS', 'versioning', 'content negotiation', 'ETag', 'Richardson maturity model'],
    visualIds: ['sd-http-status-map'],
    interviewAnswer: `Resources are plural nouns with hierarchical paths: /customers/{id}/accounts. Methods carry intent: GET reads (safe, idempotent, cacheable), POST creates or triggers processing (not idempotent), PUT replaces (idempotent), PATCH partially updates, DELETE removes (idempotent). Status codes communicate outcome: 200/201 (with Location)/202 (accepted for async)/204, 400 validation, 401 unauthenticated, 403 forbidden, 404, 409 conflict, 412 precondition failed, 422 business rule, 429 rate limited, 5xx server faults. Plus consistent error bodies (RFC 9457 Problem Details), pagination, filtering and sorting via query params, versioning (/v1 in the path or a header), optimistic concurrency with ETag/If-Match, and statelessness — every request carries its own auth.`,
    detailedExplanation: `Actions that do not map cleanly to CRUD become sub-resources or commands: POST /payments/{id}/cancellations rather than GET /cancelPayment?id=. Long-running operations return 202 Accepted with a status resource (/operations/{id}) to poll or a webhook. HATEOAS (links in responses) is level 3 of the Richardson model; most production APIs stop at level 2 (resources + verbs + status codes).`,
    codeExample: `GET    /v1/customers/42/accounts?status=ACTIVE&limit=20&cursor=eyJpZCI6MTAwfQ
       200 OK          {"data":[...], "nextCursor":"eyJpZCI6MTIwfQ"}

POST   /v1/payments                 Idempotency-Key: 7b1e...   {"from":"A1","to":"B2","amount":"25.00"}
       201 Created     Location: /v1/payments/pay_981

GET    /v1/payments/pay_981         ->  200 OK   ETag: "v3"
PATCH  /v1/payments/pay_981         If-Match: "v3"   {"reference":"rent"}
       200 OK   (or 412 Precondition Failed if someone else changed it)

POST   /v1/payments/pay_981/cancellations     ->  202 Accepted   Location: /v1/operations/op_55
DELETE /v1/beneficiaries/9          ->  204 No Content   (repeat -> 404 or 204, still idempotent)

POST   /v1/payments  {"amount":"-5"}  ->  400 Bad Request  application/problem+json`,
    codeLanguage: 'HTTP',
    whyOutput: `Each line shows a convention: cursor pagination, idempotent creation with Idempotency-Key, 201 with Location, optimistic locking with ETag/If-Match returning 412 on conflict, async commands returning 202 with a status resource, and Problem Details for errors.`,
    commonMistakes: [
      'Verbs in URLs (/getAccounts, /createPayment).',
      '200 OK with an error payload.',
      'Breaking changes without versioning.',
      'Exposing internal database ids/structures directly.',
      'Offset pagination on huge, frequently changing tables.',
    ],
    seniorInsight: `Design contract-first with OpenAPI, review it like code, generate clients and run contract tests. Define a deprecation policy (Sunset/Deprecation headers, minimum notice) up front — most API pain is caused by unmanaged change, not by initial design.`,
    aiAwareness: {
      strongAnswerShouldMention: ['resources as nouns', 'method semantics/idempotency', 'correct status codes', 'versioning', 'pagination', 'error format'],
      weakAnswer: 'REST uses JSON over HTTP with GET and POST.',
      redFlags: ['Says POST is idempotent', 'Uses 200 for errors'],
      likelyFollowUp: ['PUT vs PATCH?', 'How do you version an API?', 'Offset vs cursor pagination?'],
    },
    prerequisites: [],
    relatedTopics: ['sd-api-idempotency-pagination', 'sd-rest-vs-graphql-grpc', 'sb-rest-exception-handling'],
    nextTopics: ['sd-api-idempotency-pagination', 'sd-rest-vs-graphql-grpc'],
    references: [
      {
        title: 'RFC 9110 — HTTP Semantics',
        url: 'https://www.rfc-editor.org/rfc/rfc9110',
        source: 'IETF',
        type: 'official',
      },
      {
        title: 'RFC 9457 — Problem Details for HTTP APIs',
        url: 'https://www.rfc-editor.org/rfc/rfc9457',
        source: 'IETF',
        type: 'official',
      },
    ],
    interviewQuestions: ['q-sd-put-vs-patch-vs-post', 'q-sd-api-versioning', 'q-sd-status-codes'],
  },
  {
    id: 'sd-api-idempotency-pagination',
    technology: T,
    title: 'Idempotency, Pagination & Concurrency Control in APIs',
    category: 'REST API Design',
    slug: 'sd-api-idempotency-pagination',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Making retries safe with idempotency keys, paging large collections with cursors, and preventing lost updates with ETags.',
    mentalModel: 'Idempotency key = a receipt number: show the same receipt twice and you get the same receipt back, not a second purchase.',
    memoryTip: 'Retries need idempotency. Big lists need cursors. Concurrent edits need ETag + If-Match.',
    keyTerms: ['Idempotency-Key', 'cursor pagination', 'keyset pagination', 'offset pagination', 'ETag', 'If-Match', 'optimistic locking', 'lost update'],
    interviewAnswer: `Idempotency: networks time out, so clients retry. For non-idempotent operations (POST payment) the client sends an Idempotency-Key; the server stores key → request hash → response and replays the stored response for duplicates. Pagination: offset/limit is simple but slow at high offsets and skips/duplicates rows when data changes; cursor (keyset) pagination uses "WHERE id > :lastId ORDER BY id LIMIT n", encoded as an opaque cursor — stable and index-friendly. Concurrency: return an ETag (version) on GET; clients send If-Match on update; the server applies the update only if the version matches, otherwise 412 — preventing lost updates.`,
    codeExample: `-- Offset: database must read and discard 1,000,000 rows
SELECT * FROM transactions WHERE account_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 50 OFFSET 1000000;

-- Keyset / cursor: seeks directly via the index (account_id, created_at, id)
SELECT * FROM transactions
WHERE account_id = 42
  AND (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 50;

-- Optimistic locking behind ETag/If-Match
UPDATE payments SET reference = 'rent', version = version + 1
WHERE id = 'pay_981' AND version = 3;      -- 0 rows updated -> 412 Precondition Failed`,
    codeLanguage: 'SQL',
    whyOutput: `Keyset pagination cost is independent of page depth and does not skip or repeat rows when new transactions arrive. The conditional UPDATE is the server side of If-Match: if another client already bumped the version, no row matches and the API returns 412.`,
    commonMistakes: [
      'Using offset pagination for infinite scroll over live data.',
      'Exposing raw database ids as cursors (leaks information, couples clients to schema).',
      'Storing idempotency keys without a request hash (same key, different payload).',
    ],
    prerequisites: ['sd-rest-api-design'],
    relatedTopics: ['sd-rest-api-design', 'sb-resilience4j'],
    references: [
      {
        title: 'Designing robust and predictable APIs with idempotency — Stripe',
        url: 'https://stripe.com/blog/idempotency',
        source: 'Stripe',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-idempotency-key', 'q-sd-pagination'],
  },
  {
    id: 'sd-rest-vs-graphql-grpc',
    technology: T,
    title: 'REST vs GraphQL vs gRPC vs Async APIs',
    category: 'REST API Design',
    slug: 'sd-rest-vs-graphql-grpc',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Choosing an API style by client needs: REST for broad interoperability, GraphQL for flexible client-driven queries, gRPC for fast internal calls, events for decoupling.',
    mentalModel: 'REST = set menu. GraphQL = build-your-own plate. gRPC = kitchen-to-kitchen intercom. Events = a notice board.',
    memoryTip: 'Public/partner → REST. Many UI shapes → GraphQL (via BFF). Internal low-latency → gRPC. Fire-and-forget fan-out → events.',
    keyTerms: ['GraphQL', 'over-fetching', 'under-fetching', 'gRPC', 'Protocol Buffers', 'HTTP/2', 'streaming', 'AsyncAPI', 'webhooks'],
    interviewAnswer: `REST is universal, cacheable via HTTP, easy to debug — ideal for public and partner APIs. GraphQL lets clients request exactly the fields they need in one round trip, solving over/under-fetching for complex UIs, at the cost of harder caching, query-cost control (depth/complexity limits) and N+1 resolver problems (DataLoader). gRPC uses Protocol Buffers over HTTP/2: compact, strongly typed contracts, code generation, bidirectional streaming — ideal for internal service-to-service calls, less suited to browsers. Asynchronous APIs (Kafka topics, webhooks, documented with AsyncAPI) decouple producers from consumers.`,
    codeExample: `// orders.proto — gRPC contract shared by client and server
syntax = "proto3";
package orders.v1;

service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);
  rpc StreamOrderUpdates (GetOrderRequest) returns (stream OrderStatus);  // server streaming
}

message GetOrderRequest { string order_id = 1; }
message Order { string order_id = 1; string status = 2; int64 amount_minor = 3; }
message OrderStatus { string order_id = 1; string status = 2; }

# GraphQL equivalent: client picks the shape
# query { order(id: "o-1") { status customer { name } items { sku qty } } }`,
    codeLanguage: 'Protobuf',
    commonMistakes: [
      'GraphQL without query complexity limits (DoS risk).',
      'gRPC directly to browsers without grpc-web or a gateway.',
      'Choosing by hype instead of client needs.',
    ],
    prerequisites: ['sd-rest-api-design'],
    relatedTopics: ['sd-rest-api-design', 'sb-microservices-patterns'],
    references: [
      {
        title: 'gRPC — Introduction',
        url: 'https://grpc.io/docs/what-is-grpc/introduction/',
        source: 'gRPC',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-sd-rest-graphql-grpc'],
  },

  /* ----------------------------------------------------------- Case Studies */
  {
    id: 'sd-case-url-shortener',
    technology: T,
    title: 'Case Study: Design a URL Shortener',
    category: 'Case Studies',
    slug: 'sd-case-url-shortener',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'A read-heavy key-value system: generate unique short codes, store code → URL, redirect at very low latency.',
    mentalModel: 'A giant cloakroom: hand in a long coat (URL), get a short ticket (code); most of the work is handing coats back quickly.',
    memoryTip: 'Base62 of a unique ID. 302 vs 301 decides analytics. Cache + CDN for the 100:1 read ratio.',
    keyTerms: ['base62', 'ID generation', 'Snowflake', 'key-value store', '301 vs 302', 'cache', 'CDN', 'analytics pipeline'],
    interviewAnswer: `Requirements: shorten, redirect, optional custom alias and expiry, analytics; ~100:1 read/write. Estimates: e.g. 200 writes/s, 20k reads/s. Code generation: base62-encode a unique 64-bit id (from a counter range allocated per instance or a Snowflake-style generator) — 7 chars of base62 give 62^7 ≈ 3.5 trillion codes — avoiding hash collisions. Storage: key-value or relational table code → long_url, owner, created_at, expiry. Read path: CDN/edge → cache (Redis) → DB, returning 302 (keeps analytics; 301 is cached by browsers). Analytics: emit click events to Kafka asynchronously; never block the redirect. Also: validate URLs against malware lists, rate-limit creation, and handle expiry with TTL/cleanup jobs.`,
    codeExample: `ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def base62(n: int) -> str:
    if n == 0:
        return ALPHABET[0]
    out = []
    while n:
        n, rem = divmod(n, 62)
        out.append(ALPHABET[rem])
    return "".join(reversed(out))

print(base62(125))
print(base62(3_521_614_606_207))       # largest 7-char value (62**7 - 1)
print(62 ** 7)`,
    codeLanguage: 'Python',
    codeOutput: '21\nZZZZZZZ\n3521614606208',
    whyOutput: `125 = 2×62 + 1 → "21". 62^7 − 1 is the largest number that fits in 7 base62 characters ("ZZZZZZZ"), so 7 characters cover about 3.5 trillion unique codes. Encoding unique ids avoids the collision checks needed with truncated hashes.`,
    commonMistakes: [
      'Using a truncated MD5 hash without collision handling.',
      'Sequential codes that are trivially enumerable (consider shuffling/obfuscation).',
      'Synchronous analytics writes on the redirect path.',
      'Choosing 301 and losing click tracking.',
    ],
    prerequisites: ['sd-back-of-envelope', 'sd-caching-strategies'],
    relatedTopics: ['sd-caching-strategies', 'sd-consistent-hashing'],
    references: [
      {
        title: 'The System Design Primer — Design Pastebin / bit.ly',
        url: 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md',
        source: 'GitHub',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-url-shortener'],
  },
  {
    id: 'sd-case-notification-system',
    technology: T,
    title: 'Case Study: Design a Notification System',
    category: 'Case Studies',
    slug: 'sd-case-notification-system',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Fan-out of events to email, SMS and push channels with user preferences, retries, deduplication and rate limits.',
    mentalModel: 'A post office sorting room: letters arrive, get sorted by delivery method and recipient preference, and each carrier retries failed deliveries.',
    memoryTip: 'Event → notification service → per-channel queues → workers → providers. Idempotency key per notification. DLQ + retries with backoff.',
    keyTerms: ['fan-out', 'per-channel queue', 'templating', 'user preferences', 'deduplication', 'provider failover', 'DLQ', 'quiet hours'],
    interviewAnswer: `Producers publish domain events (PaymentCompleted) to Kafka. A notification service consumes them, looks up user preferences and templates, creates notification records with a deterministic id (event id + channel) for dedupe, and enqueues per channel (email, SMS, push) so one slow provider does not block others. Channel workers call providers (SES, Twilio, FCM/APNs) with timeouts, retries with exponential backoff, provider failover, and per-user/per-provider rate limits; failures after N attempts go to a DLQ. Delivery status callbacks update the record for tracking. Priorities: OTPs and fraud alerts on a high-priority queue; marketing on a low one with quiet hours.`,
    commonMistakes: [
      'Sending synchronously from the business transaction.',
      'One shared queue for all channels and priorities.',
      'No dedupe — users receive the same SMS twice on retries.',
      'Ignoring opt-out and regulatory requirements.',
    ],
    seniorInsight: `For banking, transactional notifications (OTP, fraud) need separate capacity, monitoring and provider redundancy from marketing traffic — a marketing campaign must never delay an OTP.`,
    prerequisites: ['sd-rate-limiting'],
    relatedTopics: ['sb-saga-outbox', 'kafka-dead-letter'],
    references: [
      {
        title: 'Amazon SNS — Message fan-out',
        url: 'https://docs.aws.amazon.com/sns/latest/dg/sns-common-scenarios.html',
        source: 'AWS',
        type: 'documentation',
      },
    ],
    interviewQuestions: ['q-sd-notification-system'],
  },
  {
    id: 'sd-case-payment-system',
    technology: T,
    title: 'Case Study: Design a Payment System',
    category: 'Case Studies',
    slug: 'sd-case-payment-system',
    status: 'published',
    difficulty: 'architect',
    oneLineMeaning: 'Moving money exactly once: idempotent APIs, a double-entry ledger, state machines, PSP integration, and reconciliation.',
    mentalModel: 'Every movement of money is two ledger lines that must always sum to zero; everything else is plumbing to make sure each movement happens once.',
    memoryTip: 'Idempotency key in. State machine inside. Double-entry ledger as truth. Reconciliation as the safety net.',
    keyTerms: ['double-entry ledger', 'idempotency', 'payment state machine', 'PSP', 'webhook', 'reconciliation', 'exactly-once effect', 'outbox'],
    interviewAnswer: `API: POST /payments with an Idempotency-Key; the service persists a payment in state CREATED and an outbox event in one transaction. A payment executor calls the PSP/bank with the payment id as its idempotency reference and moves the state machine (CREATED → AUTHORISED → CAPTURED / FAILED), handling timeouts as UNKNOWN and resolving them by querying the PSP or waiting for its webhook. Every balance change is recorded in an append-only double-entry ledger (debit one account, credit another, sum zero) — balances are derived, never updated in place without ledger entries. Daily reconciliation compares internal ledger with PSP/bank settlement files and flags mismatches. Strong consistency on the ledger (single-leader relational DB), async everywhere else.`,
    codeExample: `from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class Entry:
    txn_id: str
    account: str
    amount: Decimal          # +credit / -debit

def transfer(txn_id: str, src: str, dst: str, amount: Decimal) -> list[Entry]:
    entries = [Entry(txn_id, src, -amount), Entry(txn_id, dst, amount)]
    assert sum(e.amount for e in entries) == 0     # double-entry invariant
    return entries

ledger: list[Entry] = []
seen: set[str] = set()

def post(txn_id: str, *args) -> None:
    if txn_id in seen:          # idempotent posting (a UNIQUE constraint in the real DB)
        return
    seen.add(txn_id)
    ledger.extend(transfer(txn_id, *args))

post("t1", "cust:42", "merchant:7", Decimal("25.00"))
post("t1", "cust:42", "merchant:7", Decimal("25.00"))   # retry/duplicate
balance = sum(e.amount for e in ledger if e.account == "cust:42")
print(len(ledger), balance)`,
    codeLanguage: 'Python',
    codeOutput: '2 -25.00',
    whyOutput: `The duplicate post with the same transaction id is ignored, so the ledger has exactly two entries (one debit, one credit) and the customer balance is −25.00 rather than −50.00. Decimal avoids floating-point rounding errors with money.`,
    commonMistakes: [
      'Using floating point for money.',
      'Updating balance columns without a ledger.',
      'Treating a PSP timeout as failure and retrying with a new reference (double charge).',
      'No reconciliation process.',
    ],
    seniorInsight: `"Exactly once" in payments is an end-to-end property built from at-least-once delivery plus idempotency at every hop (API, executor, PSP reference, ledger posting) plus reconciliation to catch what slips through. Say that explicitly in an interview.`,
    aiAwareness: {
      strongAnswerShouldMention: ['idempotency key', 'state machine', 'double-entry ledger', 'PSP timeout = unknown', 'reconciliation', 'Decimal/minor units'],
      weakAnswer: 'Call the payment gateway and update the balance in the database.',
      redFlags: ['Floating-point money', 'Retry with new reference on timeout'],
      likelyFollowUp: ['How do you handle a PSP timeout?', 'Why double-entry?', 'How do you reconcile?'],
    },
    prerequisites: ['sd-api-idempotency-pagination', 'sd-cap-pacelc'],
    relatedTopics: ['sb-saga-outbox', 'sd-api-idempotency-pagination', 'kafka-exactly-once'],
    references: [
      {
        title: 'Avoiding Double Payments in a Distributed Payments System — Airbnb Engineering',
        url: 'https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb',
        source: 'Airbnb Engineering',
        type: 'article',
      },
    ],
    interviewQuestions: ['q-sd-payment-system'],
  },
];
