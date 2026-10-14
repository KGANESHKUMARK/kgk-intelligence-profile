import type { InterviewQuestion } from '../../types';

const T = 'system-design';

export const systemDesignQuestions: InterviewQuestion[] = [
  /* ── Scale to a million users ───────────────────────────────────────────── */
  {
    id: 'q-sd-scale-to-million-users',
    technology: T,
    question: 'How would you design a system to scale from 1,000 to 1,000,000 users?',
    category: 'Fundamentals',
    difficulty: 'advanced',
    tags: ['scalability', 'load balancing', 'caching', 'sharding'],
    quickAnswer: 'Incremental horizontal scaling: stateless web tier → load balancer, read replicas, CDN, cache layer, async jobs, then sharding if needed.',
    interviewAnswer: `I evolve the architecture in phases, each triggered by a concrete bottleneck rather than pre-optimising.

Phase 1 (up to ~10k users): single application server, single relational DB. Get monitoring in place first.

Phase 2 (~10k–100k): add a load balancer with two stateless app instances so sessions move to Redis; add a read replica and route reads there; add a CDN for static assets.

Phase 3 (~100k–500k): vertical DB upgrade buys time; add a caching layer (Redis) for frequently read data; background workers for async work (emails, reports); separate DB for analytics.

Phase 4 (~500k–1M+): DB primary may become the ceiling — shard writes by user or entity, or switch the hot table to a horizontally scalable DB; consider microservices split only where teams/deploy speeds demand it; add autoscaling on the app tier.

Each transition follows Little's Law for capacity: concurrency = throughput × latency. I measure before changing.`,
    detailedAnswer: `The web tier scales almost for free once it is stateless (no local state, no local file system for uploads, no in-memory sessions). The database is the bottleneck by phase 2/3. The single most high-leverage change before sharding is adding a cache: 80–90% hit ratios are realistic for read-heavy profiles pages or product catalogues and they remove that load from the DB entirely.

Sharding comes last because it is hard to change later and it constrains transactions and queries. Exhaust indexing, caching, read replicas and archiving first. When you do shard, pick the key from the dominant access pattern and avoid cross-shard joins.`,
    seniorAnswer: `At 1M users the real challenge is operational: observability (distributed tracing, SLOs, alerting), deployments (canary, feature flags, rollback), on-call rota, database migrations without downtime, and runbook-driven incident response. The architecture is usually straightforward; keeping it reliable as you ship fast is the hard part. I also keep an eye on latency budgets: if I have 250ms for an API call and the cache takes 1ms, DB 5ms, I have headroom for more, but if the external payment gateway takes 800ms I need to consider async patterns regardless of scale.`,
    keyTerms: ['horizontal scaling', 'stateless', 'load balancer', 'CDN', 'cache', 'read replica', 'sharding', 'autoscaling'],
    commonMistakes: [
      'Prematurely sharding before exhausting simpler options.',
      'Forgetting to make the app tier stateless before adding instances.',
      'Not identifying which component is the current bottleneck.',
    ],
    codeExample: `# Capacity check for the cache decision
peak_rps = 5_000
cache_hit_ratio = 0.85
db_rps_with_cache = peak_rps * (1 - cache_hit_ratio)
db_rps_without = peak_rps

print(f"DB read rps WITHOUT cache: {db_rps_without:.0f}")
print(f"DB read rps WITH cache: {db_rps_with_cache:.0f}")`,
    codeLanguage: 'Python',
    expectedOutput: 'DB read rps WITHOUT cache: 5000\nDB read rps WITH cache: 750',
    followUpQuestions: [
      { question: 'At what point would you introduce a message queue?', hint: 'Think about write spikes and async fan-out.' },
      { question: 'How do you roll out schema migrations on a live database?', hint: 'Expand/contract, backward-compatible columns.' },
      { question: 'How do you handle session management with multiple app servers?', hint: 'Redis session store, JWT.' },
    ],
    interviewerIntent: 'Tests whether the candidate thinks incrementally and is bottleneck-driven rather than jumping to "microservices and Kubernetes".',
    whatIsTested: ['Horizontal scaling principles', 'Bottleneck identification', 'Little\'s Law intuition', 'Infrastructure evolution mindset'],
    topicId: 'sd-scalability-basics',
  },

  /* ── CAP in practice ────────────────────────────────────────────────────── */
  {
    id: 'q-sd-cap-in-practice',
    technology: T,
    question: 'How does the CAP theorem affect database choice? Give a real example.',
    category: 'Fundamentals',
    difficulty: 'advanced',
    tags: ['CAP', 'consistency', 'availability', 'database choice'],
    quickAnswer: 'CAP forces a choice between C and A during a partition; pick per data type — balances need strong consistency (CP), catalogues tolerate availability (AP).',
    interviewAnswer: `CAP says during a network partition a replicated store can guarantee Consistency (every read gets the latest written value) or Availability (every request gets a non-error response), but not both. Partitions will happen, so the choice is real.

For a payment balance I choose CP — a stale balance could allow an overdraft, so I prefer to briefly fail rather than give wrong data. I use a single-leader relational database with synchronous replication to the commit quorum and route balance-check reads to the leader.

For a product catalogue I choose AP — a slightly stale category description harms nobody and the system should stay available. Cassandra or a distributed cache with eventual consistency is fine.

PACELC extends this: even without a partition, synchronous replication (strong consistency) adds latency; async replication (eventual consistency) is faster. I design per SLA: authorisation flows need linearizable consistency; feeds and search accept eventual.`,
    detailedAnswer: `In practice "partition tolerance" is not optional — you cannot build a network where partitions never happen. So CAP is really "C or A when a partition occurs". The more actionable design principle is PACELC, which adds: when the network is healthy, do you trade Latency for Consistency? Synchronous multi-region replication can add 60–100ms round-trips; many workloads cannot afford that.

Quorum systems (Cassandra's W + R > N) let you dial consistency per operation: QUORUM/QUORUM for important writes, ONE/ONE for high-throughput low-stakes reads. But sloppy quorums and clock skew mean even W+R>N is not truly linearizable.`,
    seniorAnswer: `The senior framing is: consistency is not binary, it is a spectrum (linearizable → sequential → causal → eventual), and you pick per data item, per operation, not per system. In a banking system I have linearizable reads for balance checks (always hit the leader), read-your-writes for the user's own transactions (route to leader for 30s post-write), causal consistency for an order of events in a feed, and eventual for analytics. A single "ACID" relational DB often gives you all of this cheaply when the data volume fits; the complexity of a polyglot approach is only justified by volume or availability requirements.`,
    keyTerms: ['CAP', 'PACELC', 'linearizable', 'eventual consistency', 'quorum', 'read-your-writes', 'CP vs AP'],
    commonMistakes: [
      'Saying "we\'ll pick CA" — partitions are not optional.',
      'Applying one consistency level to the whole system.',
      'Confusing ACID isolation with distributed consistency.',
    ],
    followUpQuestions: [
      { question: 'How do you achieve read-your-writes after a write to a replica?', hint: 'Sticky reads to leader for a window, or replication position tracking.' },
      { question: 'What is the difference between ACID and BASE?', hint: 'Transactional guarantees vs availability/eventual consistency.' },
    ],
    interviewerIntent: 'Tests distributed systems fundamentals and whether the candidate can apply them to concrete trade-offs.',
    whatIsTested: ['CAP/PACELC understanding', 'Practical database trade-offs', 'Consistency spectrum'],
    topicId: 'sd-cap-pacelc',
  },

  /* ── Sharding key ───────────────────────────────────────────────────────── */
  {
    id: 'q-sd-sharding-key',
    technology: T,
    question: 'How do you choose a sharding/partition key? What goes wrong when you get it wrong?',
    category: 'Data & Caching',
    difficulty: 'advanced',
    tags: ['sharding', 'partition key', 'hot partition', 'consistent hashing'],
    quickAnswer: 'Choose by the dominant query access pattern; avoid timestamps and celebrity ids; co-locate related data on the same shard.',
    interviewAnswer: `The shard key determines data distribution and query routing, so it drives most of the design.

Good key = high cardinality, evenly distributed, matches the primary access pattern. For a multi-tenant banking app I shard by customer_id: all of a customer's accounts and transactions live on the same shard, so most queries are single-shard.

Bad keys:
- Timestamps/sequences create hot partitions: all new writes go to shard 0 while shards 1–N sit idle.
- Low cardinality (e.g. country code with 50 values and 4 shards) means you cannot spread evenly past 50 shards.
- Celebrity ids (a few users generate most traffic) create hot-spot shards.

When you get it wrong: one shard saturates while others are near-empty (hot partition), cross-shard queries become scatter-gather (N-fold latency), and resharding is expensive because you have to move data.

Mitigation: consistent hashing to minimize resharding impact; virtual nodes to smooth load; split hot keys (append a random suffix, bucket at read time); or move hot entities to a dedicated shard.`,
    detailedAnswer: `Resharding is the main long-term risk. Modulo hashing (hash(key) % N) remaps almost everything when N changes — avoid it. Consistent hashing moves only ~1/N keys. Directory-based sharding (a lookup table from key to shard) is the most flexible but adds a lookup hop and a SPOF.

Before sharding: exhaust table partitioning within one database (Postgres declarative partitioning by created_at), archival of cold data, read replicas, caching and vertical scaling. Sharding forces you to lose cross-shard ACID transactions (use sagas or two-phase commit with their costs), cross-shard foreign keys, and global aggregation queries.`,
    seniorAnswer: `I treat sharding as a last resort — not because it is bad, but because the operational cost is high. When I do shard I always pair it with a routing layer that is invisible to the application (a middleware or connection proxy), so application code does not need to know which shard it is on. I also insist on a "sharding simulator" in staging: seed a representative key distribution and verify the spread before go-live.`,
    keyTerms: ['shard key', 'hot partition', 'consistent hashing', 'resharding', 'scatter-gather', 'directory sharding'],
    commonMistakes: [
      'Using timestamps or auto-increment ids as shard keys.',
      'Sharding before exhausting other options.',
      'Modulo hashing making resharding impractical.',
    ],
    codeExample: `import hashlib, collections

def shard(key: str, n: int) -> int:
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % n

# Check distribution for 1,000 user ids
dist = collections.Counter(shard(f"user:{i}", 4) for i in range(1000))
print("Shard distribution:", dict(dist))

# Simulate a hotspot: all writes this second share the same ts prefix
ts_dist = collections.Counter(shard(f"2026-10-14T10:00:{i%60:02d}", 4) for i in range(1000))
print("Timestamp-keyed:", dict(ts_dist))`,
    codeLanguage: 'Python',
    expectedOutput: 'Shard distribution: {0: ~250, 1: ~250, 2: ~250, 3: ~250}\nTimestamp-keyed: {0: ~250, 1: ~250, ...} (but seconds cluster, real hot spot is sequential inserts)',
    followUpQuestions: [
      { question: 'How do you handle a cross-shard join?', hint: 'Denormalize, aggregate in application, or broadcast.' },
      { question: 'How do you migrate a live table to a new shard count?', hint: 'Dual-write, shadow read, cut-over.' },
    ],
    interviewerIntent: 'Tests whether the candidate has dealt with real data distribution problems, not just textbook theory.',
    whatIsTested: ['Sharding fundamentals', 'Hot-partition awareness', 'Operational maturity'],
    topicId: 'sd-sharding-replication',
  },

  /* ── Consistent hashing ─────────────────────────────────────────────────── */
  {
    id: 'q-sd-consistent-hashing',
    technology: T,
    question: 'Explain consistent hashing. Why is it better than modulo hashing for distributed caches?',
    category: 'Data & Caching',
    difficulty: 'advanced',
    tags: ['consistent hashing', 'hash ring', 'virtual nodes', 'cache rebalancing'],
    quickAnswer: 'Hash ring maps keys and nodes; adding/removing a node moves only ~K/N keys vs ~(N-1)/N with modulo, so cache hit rates survive resizes.',
    interviewAnswer: `Modulo hashing: shard = hash(key) % N. When N changes from 4 to 5, about 80% of keys map to different nodes. For a cache this means an 80% miss-rate spike on every resize or failure — dangerous.

Consistent hashing places both nodes and keys on a circle (ring) of hash values (0 to 2^32). A key belongs to the first node clockwise on the ring. Adding a node only steals keys from its clockwise predecessor — about K/N keys total. Removing a node transfers its keys to the next node clockwise.

Virtual nodes: to prevent uneven distribution when nodes cluster on the ring, each physical node is represented by many virtual positions (100–150 is typical). This makes load even and means a failing node's keys spread across many survivors rather than piling on one.

Used by: Cassandra, Dynamo, Riak, Memcached (ketama), consistent-hash load balancers.`,
    codeExample: `import bisect, hashlib

class HashRing:
    def __init__(self, nodes, vnodes=100):
        ring = [(self._h(f"{n}#{i}"), n) for n in nodes for i in range(vnodes)]
        ring.sort()
        self._ring = ring
        self._keys = [h for h, _ in ring]

    @staticmethod
    def _h(s): return int(hashlib.sha1(s.encode()).hexdigest(), 16)

    def node(self, key):
        idx = bisect.bisect(self._keys, self._h(key)) % len(self._keys)
        return self._ring[idx][1]

keys = [f"k:{i}" for i in range(10_000)]
r4 = HashRing(["a","b","c","d"])
r5 = HashRing(["a","b","c","d","e"])
moved = sum(r4.node(k) != r5.node(k) for k in keys)
print(f"Consistent hashing: {moved/len(keys):.0%} moved  (vs ~80% with modulo)")`,
    codeLanguage: 'Python',
    expectedOutput: 'Consistent hashing: ~20% moved  (vs ~80% with modulo)',
    followUpQuestions: [
      { question: 'What are virtual nodes and why are they important?', hint: 'Uneven ring distribution without them.' },
      { question: 'How does Cassandra use consistent hashing for partition placement?', hint: 'Token ranges, replication factor, vnodes.' },
    ],
    interviewerIntent: 'Tests distributed systems internals and hands-on knowledge of cache/storage infrastructure.',
    whatIsTested: ['Consistent hashing algorithm', 'Virtual nodes', 'Practical implications'],
    topicId: 'sd-consistent-hashing',
    keyTerms: ['hash ring', 'virtual nodes', 'K/N rebalancing', 'Dynamo', 'modulo hashing'],
    commonMistakes: ['Forgetting virtual nodes and leaving uneven distribution', 'Thinking consistent hashing solves hot keys (a single hot key still hits one node)'],
  },

  /* ── Cache invalidation ─────────────────────────────────────────────────── */
  {
    id: 'q-sd-cache-invalidation',
    technology: T,
    question: '"There are only two hard things in Computer Science: cache invalidation and naming things." — why is cache invalidation hard?',
    category: 'Data & Caching',
    difficulty: 'advanced',
    tags: ['cache invalidation', 'TTL', 'stale data', 'consistency'],
    quickAnswer: 'Invalidation is hard because cache and DB are updated non-atomically — a window exists where they differ, and that window causes bugs proportional to correctness requirements.',
    interviewAnswer: `The core difficulty is that updating the cache and updating the database are two separate operations with no distributed transaction spanning both.

If you update-DB-then-update-cache: a crash between the two leaves the old value in cache until TTL.
If you update-cache-then-update-DB: a crash leaves the cache ahead of the DB — possibly stale on rollback.
If two concurrent requests update in opposite orders, the cache can permanently hold the older value.

The standard answer is delete-on-write: write DB, delete the cache key. The next reader rebuilds from the authoritative source. This still has a race (a reader can populate the old value after the delete), but that race is bounded by one read's latency and corrects itself on the next read. A short TTL bounds the window further.

Better: version the cache key on schema changes and use event-driven invalidation (CDC from DB → event → cache delete) to decouple the caller from invalidation logic.`,
    detailedAnswer: `TTL is the safety net: even if you miss an invalidation, staleness is bounded. But TTL alone without explicit invalidation means stale windows proportional to TTL length — not acceptable for pricing, balances or permissions. The right mental model is: TTL is the last resort; explicit invalidation is the first line; and you design for "what is the business impact of serving stale data for X seconds?" to set TTL accordingly.`,
    seniorAnswer: `In production the invalidation bug I see most is "update DB, then update cache" where concurrent updates race: thread A writes 10, thread B writes 20, but thread B's cache write arrives before A's, so the cache ends up at 10 while the DB has 20, and it stays wrong until TTL. Delete-on-write avoids this because deleting is commutative; two concurrent deletes both converge to the same correct state (cache empty, next read rebuilds). I enforce this pattern at code review.`,
    keyTerms: ['cache invalidation', 'TTL', 'delete-on-write', 'CDC', 'stale data', 'race condition'],
    commonMistakes: [
      'Updating cache value on write (ordering race).',
      'No TTL as fallback.',
      'Missing invalidation on partial updates / related entities.',
    ],
    followUpQuestions: [
      { question: 'What is a cache stampede and how do you prevent it?', hint: 'Jittered TTL, request coalescing, early refresh.' },
      { question: 'How would you invalidate a CDN cache after a content change?', hint: 'Versioned URLs, CDN purge API, surrogate keys.' },
    ],
    interviewerIntent: 'Tests understanding of distributed state consistency in practical caching scenarios.',
    whatIsTested: ['Cache consistency', 'Race condition awareness', 'Invalidation strategies'],
    topicId: 'sd-caching-strategies',
  },

  /* ── Cache stampede ─────────────────────────────────────────────────────── */
  {
    id: 'q-sd-cache-stampede',
    technology: T,
    question: 'What is a cache stampede (thundering herd) and how do you prevent it?',
    category: 'Data & Caching',
    difficulty: 'advanced',
    tags: ['cache stampede', 'thundering herd', 'request coalescing', 'TTL jitter'],
    quickAnswer: 'When a hot key expires, thousands of simultaneous requests miss the cache and all query the DB together — fix with jittered TTLs, probabilistic early refresh, or a Redis lock so only one request rebuilds.',
    interviewAnswer: `A cache stampede happens when many requests for the same key arrive at the moment the key expires. They all miss the cache simultaneously and all query the database, potentially overwhelming it.

Prevention strategies:
1. Jittered TTL — set TTL = base ± random(0, spread). Keys for the same category expire at slightly different times, smoothing load.
2. Request coalescing / mutex — when one goroutine/thread detects a miss and holds a rebuild lock, other requesters wait (or return stale) while the first rebuilds.
3. Probabilistic early refresh (XFetch algorithm) — before TTL expires, with a probability proportional to how close expiry is, rebuild early while still returning the cached value.
4. Stale-while-revalidate — serve the old value immediately, refresh asynchronously.

For a global leaderboard or hot product page I combine: 1-hour base TTL with up to 5-minute jitter, a Redis NX lock for stampede protection on the rebuild, and a background refresh job for the top-N keys so they never actually expire cold.`,
    codeExample: `import time, threading, random
_cache, _lock = {}, threading.Lock()

def get_with_coalescing(key, loader, ttl=300):
    entry = _cache.get(key)
    if entry and entry['exp'] > time.time():
        return entry['val']                 # hit

    lock_key = f"__rebuild__{key}"
    # Try to be the single rebuilder
    acquired = False
    with _lock:
        if lock_key not in _cache:
            _cache[lock_key] = True
            acquired = True

    if acquired:
        try:
            val = loader()
            jitter = random.randint(0, 60)
            _cache[key] = {'val': val, 'exp': time.time() + ttl + jitter}
            return val
        finally:
            with _lock:
                del _cache[lock_key]
    else:
        # Another thread is rebuilding — return stale or brief wait
        time.sleep(0.05)
        entry = _cache.get(key)
        return entry['val'] if entry else loader()   # last-resort fallback`,
    codeLanguage: 'Python',
    followUpQuestions: [
      { question: 'How does XFetch differ from a mutex approach?', hint: 'No lock, probabilistic early refresh, no stale serving.' },
      { question: 'How do you handle stampedes in a Redis cluster?', hint: 'SET NX EX on a lock key, Lua script for atomicity.' },
    ],
    keyTerms: ['stampede', 'thundering herd', 'jittered TTL', 'NX lock', 'stale-while-revalidate', 'XFetch'],
    commonMistakes: ['No stampede mitigation, leaving the DB unprotected on popular key expiry'],
    interviewerIntent: 'Tests practical caching production experience beyond "put Redis in front".',
    whatIsTested: ['Stampede awareness', 'Mitigation patterns', 'Redis locking'],
    topicId: 'sd-caching-strategies',
  },

  /* ── Gateway vs LB vs Mesh ──────────────────────────────────────────────── */
  {
    id: 'q-sd-gateway-vs-lb-vs-mesh',
    technology: T,
    question: 'What is the difference between an API Gateway, a Load Balancer, and a Service Mesh?',
    category: 'API Gateway',
    difficulty: 'advanced',
    tags: ['api gateway', 'load balancer', 'service mesh', 'Envoy', 'Istio'],
    quickAnswer: 'Load balancer = L4/L7 traffic distribution. API Gateway = L7 edge with auth/rate-limiting/routing for client traffic. Service mesh = L7 sidecar proxy for east-west (service-to-service) traffic with mTLS, retries and observability.',
    interviewAnswer: `Load Balancer distributes incoming requests across a pool of backends (health-checks, weighted round-robin, least-connections). It operates at L4 (TCP) or L7 (HTTP). No auth, no rate limiting — just distribution.

API Gateway sits at the edge (north-south traffic: client → system). Responsibilities: TLS termination, authentication/token validation, rate limiting, request routing and versioning, request/response transformation, CORS, logging and tracing at the boundary. It is for the API contract with external clients.

Service Mesh (Istio, Linkerd, Consul Connect) handles east-west traffic: service A calling service B inside the cluster. A sidecar proxy (Envoy) is injected alongside each service. The mesh provides: mTLS between services (zero-trust), retries and circuit breaking, distributed tracing without code changes, traffic splitting (canary), and policy enforcement. The application code does not need to implement these.

Used together: external request → Load Balancer → API Gateway → Service A's Envoy sidecar → service A → Service B's Envoy sidecar → Service B.`,
    detailedAnswer: `When to use a service mesh: when you have many services and need consistent mTLS, tracing and retries without putting that logic in every service's code. The cost is operational complexity (Istio learning curve, sidecar overhead). For fewer than ~10 services, shared libraries (Resilience4j, Polly) often suffice. A service mesh is not an API gateway — it does not expose an external API, it manages internal communication policy.`,
    seniorAnswer: `A common interview trap is conflating gateway and mesh. The clearest way to separate them: gateway controls what enters the system; mesh controls how services talk to each other inside. You can have a gateway without a mesh (and most small deployments do) but not a mesh without a gateway if you have external clients.`,
    keyTerms: ['API gateway', 'load balancer', 'service mesh', 'Envoy', 'sidecar proxy', 'mTLS', 'north-south', 'east-west'],
    commonMistakes: [
      'Putting business logic in the API gateway.',
      'Confusing an API gateway with a load balancer.',
      'Thinking a service mesh replaces an API gateway.',
    ],
    followUpQuestions: [
      { question: 'How do you rate limit across multiple API gateway instances?', hint: 'Centralised counter in Redis, or distributed rate limiter like Envoy\'s global rate limiting service.' },
      { question: 'What is a Backend-for-Frontend (BFF)?', hint: 'Per-client gateway variant for aggregation and shaping.' },
    ],
    interviewerIntent: 'Tests infrastructure understanding for senior/staff-level distributed systems roles.',
    whatIsTested: ['Gateway vs LB vs mesh distinction', 'Traffic direction awareness', 'Practical choice criteria'],
    topicId: 'sd-api-gateway',
  },

  /* ── Design a rate limiter ──────────────────────────────────────────────── */
  {
    id: 'q-sd-design-rate-limiter',
    technology: T,
    question: 'Design a distributed rate limiter.',
    category: 'API Gateway',
    difficulty: 'advanced',
    tags: ['rate limiting', 'token bucket', 'Redis', 'distributed', 'system design'],
    quickAnswer: 'Per-client token bucket in Redis, updated atomically via Lua script on every request; return 429 with Retry-After when exhausted.',
    interviewAnswer: `Requirements: limit each API key/user to N requests per time window; work across multiple gateway instances; low latency overhead (<5ms); graceful degradation when Redis is down.

Algorithm: token bucket — allows short bursts (capacity C) while enforcing average rate (R tokens/sec). Compared to sliding window log it is memory-efficient; compared to fixed window it handles boundary bursts correctly.

Implementation:
- State: per-client key in Redis: "tokens" (float) and "last_refill_ts" (epoch ms).
- On each request: Lua script atomically reads both fields, refills tokens proportional to elapsed time, checks and decrements, writes back with TTL to auto-clean idle keys.
- Using Lua ensures atomicity without WATCH/MULTI/EXEC complexity.
- Response: 200 with X-RateLimit-Remaining/Limit/Reset headers, or 429 with Retry-After.

Edge cases: Redis unavailable — fail-open with local in-process token bucket as backstop (accept risk of over-limit), or fail-closed with 503 and a short retry (protect backend). Distributed gateways each hit the same Redis cluster; shard Redis by rate-limit key to avoid hotspots.`,
    codeExample: `-- Redis Lua script (atomic: runs as single command)
local key = KEYS[1]
local capacity = tonumber(ARGV[1])   -- e.g. 100
local rate = tonumber(ARGV[2])       -- tokens per second, e.g. 10
local now = tonumber(ARGV[3])        -- epoch milliseconds

local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1]) or capacity
local last_ts = tonumber(data[2]) or now

-- Refill proportional to elapsed time
local elapsed_s = (now - last_ts) / 1000
tokens = math.min(capacity, tokens + elapsed_s * rate)

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
    redis.call('PEXPIRE', key, 60000)  -- TTL 60s
    return {1, math.floor(tokens)}     -- allowed, remaining
else
    redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
    redis.call('PEXPIRE', key, 60000)
    return {0, 0}                      -- denied
end`,
    codeLanguage: 'Lua',
    expectedOutput: '{1, 99}  → 200 OK with X-RateLimit-Remaining: 99\n{0, 0}  → 429 Too Many Requests',
    followUpQuestions: [
      { question: 'How do you differentiate rate limits by endpoint (e.g. /login stricter than /search)?', hint: 'Composite key: user_id + endpoint, different capacity/rate params.' },
      { question: 'How do you make rate limits observable?', hint: 'Prometheus counter by key prefix, Grafana dashboards, alert on 429 spike.' },
    ],
    keyTerms: ['token bucket', 'Lua script', 'Redis', '429', 'Retry-After', 'fail-open', 'distributed rate limiter'],
    commonMistakes: [
      'Non-atomic read-modify-write (race conditions under concurrent gateway instances).',
      'Rate limiting by IP alone (NAT, mobile carriers).',
      'Not returning Retry-After (clients retry immediately, making it worse).',
    ],
    interviewerIntent: 'A canonical "design X" question testing algorithm knowledge, Redis mechanics, and edge-case thinking.',
    whatIsTested: ['Algorithm selection', 'Redis Lua atomicity', 'Distributed correctness', 'Edge cases'],
    topicId: 'sd-rate-limiting',
  },

  /* ── REST API versioning ────────────────────────────────────────────────── */
  {
    id: 'q-sd-api-versioning',
    technology: T,
    question: 'How do you version a REST API and manage breaking changes?',
    category: 'REST API Design',
    difficulty: 'intermediate',
    tags: ['API versioning', 'breaking change', 'deprecation', 'REST'],
    quickAnswer: 'URI path versioning (/v1, /v2) is most common and explicit; deprecate with Sunset header and 12+ months notice; run versions in parallel until client migration is complete.',
    interviewAnswer: `Versioning strategies:
- URI path (/v1/payments): most common, explicit, easy to test in browser, cache-friendly, but "ugly" URLs.
- Accept/Content-Type header (Accept: application/vnd.company.v2+json): clean URLs, harder to debug.
- Custom header (API-Version: 2): easy to add but not standard.

I use URI path for public/partner APIs because it is unambiguous in logs, proxies and tests.

Breaking vs non-breaking: adding optional fields, adding endpoints, adding enum values (with care) are non-breaking. Removing fields, changing types, renaming fields, changing HTTP method, removing endpoints are breaking — require a new version.

Lifecycle: introduce /v2, announce deprecation of /v1 with a Sunset header (RFC 8594: Sunset: Sat, 01 Jan 2028 00:00:00 GMT) and a Deprecation header, give clients a minimum 12 months, send email to registered API key owners, remove only after traffic drops to zero in gateway metrics.

Never break a version in place — the contract is the URL.`,
    detailedAnswer: `The hardest part is not the versioning scheme — it is the client migration. Good practice: track API key usage per version in the gateway (rate by key, by version, by endpoint), so you can identify which specific key/team is still on v1 and chase them directly rather than "sending an email to all users".

For internal APIs (service-to-service) prefer contract tests (Pact) over versioned paths — they give you a build-time signal that a change would break a consumer.`,
    seniorAnswer: `The senior framing: versioning is a symptom of change management failure — if you design your API carefully and treat adding new required fields or removing existing ones as a breaking change that requires a version bump, you minimise forced client upgrades. Hypermedia (HATEOAS) promises to reduce versioning needs but is rarely practical. The real lever is designing the initial schema to be extensible (use a 'metadata' map field for future attributes, use string enums sparingly, prefer ISO codes over internal codes).`,
    keyTerms: ['URI versioning', 'Sunset header', 'breaking change', 'Deprecation header', 'contract tests'],
    commonMistakes: [
      'Breaking a published version in place.',
      'No sunset/deprecation headers (clients have no programmatic signal).',
      'Removing a version when clients are still on it.',
    ],
    followUpQuestions: [
      { question: 'What is a "breaking change" in an API?', hint: 'Anything a well-behaved existing client would break on.' },
      { question: 'How does contract testing (Pact) differ from versioning?', hint: 'Consumer-driven, build-time check, no URL version needed for internal.' },
    ],
    interviewerIntent: 'Tests understanding of API lifecycle and change management in real-world production APIs.',
    whatIsTested: ['Versioning strategies', 'Breaking change definition', 'Deprecation lifecycle'],
    topicId: 'sd-rest-api-design',
  },

  /* ── PUT vs PATCH vs POST ───────────────────────────────────────────────── */
  {
    id: 'q-sd-put-vs-patch-vs-post',
    technology: T,
    question: 'What is the difference between PUT, PATCH, and POST? When do you use each?',
    category: 'REST API Design',
    difficulty: 'intermediate',
    tags: ['HTTP methods', 'idempotency', 'PUT', 'PATCH', 'POST'],
    quickAnswer: 'POST creates (not idempotent). PUT replaces the full resource (idempotent). PATCH partially updates (idempotent only if carefully implemented).',
    interviewAnswer: `POST: create a new resource or trigger a non-CRUD action. Not idempotent — two identical POSTs create two resources. Returns 201 Created with a Location header.

PUT: replace the entire resource at a known URL. Idempotent — sending the same PUT twice gives the same result. Use when the client specifies the full representation. If the resource does not exist, PUT may create it (201), or respond 404/409 depending on your design. Sends the complete object.

PATCH: partial update — only the fields provided are changed. Semantically idempotent if implemented correctly, but more complex to implement correctly (especially with arrays/merges). Use for large objects where sending the full payload is expensive, or for concurrent partial updates.

Rule of thumb: POST to a collection URL to create; PUT or PATCH to a resource URL to update. PUT when clients always replace the whole thing; PATCH when clients update subsets and the resource is large or shared.`,
    codeExample: `# PUT: replace the whole user resource
PUT /v1/users/42
{"name": "Alice", "email": "alice@example.com", "role": "admin", "status": "active"}

# PATCH: change only the role (JSON Merge Patch — RFC 7396)
PATCH /v1/users/42
{"role": "read-only"}

# POST: create a new user
POST /v1/users
{"name": "Bob", "email": "bob@example.com", "role": "user"}
# -> 201 Created   Location: /v1/users/99

# POST for action (not CRUD)
POST /v1/users/42/password-resets
{}
# -> 202 Accepted`,
    codeLanguage: 'HTTP',
    followUpQuestions: [
      { question: 'Is PATCH always idempotent?', hint: 'Depends on implementation: "set role to admin" yes; "increment counter by 1" no.' },
      { question: 'How do you handle partial updates with arrays (add/remove elements)?', hint: 'JSON Patch (RFC 6902) operations: add, remove, replace.' },
    ],
    keyTerms: ['idempotency', 'PUT replace', 'PATCH partial update', 'POST create', 'JSON Merge Patch', 'JSON Patch'],
    commonMistakes: [
      'Using POST for updates.',
      'Using GET with side effects.',
      'Partial PUT (sending incomplete body, zeroing omitted fields).',
    ],
    interviewerIntent: 'Tests HTTP fundamentals and correct method semantics.',
    whatIsTested: ['HTTP method semantics', 'Idempotency', 'REST correctness'],
    topicId: 'sd-rest-api-design',
  },

  /* ── REST vs GraphQL vs gRPC ────────────────────────────────────────────── */
  {
    id: 'q-sd-rest-graphql-grpc',
    technology: T,
    question: 'When would you choose GraphQL or gRPC over REST?',
    category: 'REST API Design',
    difficulty: 'advanced',
    tags: ['REST', 'GraphQL', 'gRPC', 'API design', 'Protocol Buffers'],
    quickAnswer: 'REST for public/partner APIs. GraphQL for complex UIs with many shapes. gRPC for fast, strongly-typed internal service communication.',
    interviewAnswer: `REST: default for public/partner APIs — universal HTTP support, easy caching, tooling everywhere, no special client library. Choose REST when clients are diverse (browser, mobile, third parties) or when caching is critical.

GraphQL: excellent when a mobile and a web client need different shapes of the same data, or when a single page needs deep aggregation of many resources in one round trip. Costs: no HTTP caching (queries are POSTs), N+1 resolver problem (mitigated by DataLoader), query complexity limits needed to prevent DoS, schema management overhead. I use it via a BFF layer so the public contract is still REST and GraphQL is internal.

gRPC: best for internal service-to-service communication. Protocol Buffers are compact (~3–10× smaller than JSON) and fast to parse; HTTP/2 multiplexing reduces connections; generated client stubs enforce contract at compile time; server/client streaming is built-in. Downsides: not browser-native (requires grpc-web or a proxy), harder to inspect with curl, contracts require protobuf toolchain.

AsyncAPI / events: when the producer does not need to wait for consumers — fan-out, fire-and-forget processing, decoupled teams. Not a synchronous API at all.`,
    followUpQuestions: [
      { question: 'How do you prevent GraphQL denial-of-service (deeply nested queries)?', hint: 'Query depth limit, complexity score, persisted queries.' },
      { question: 'How do you handle backward compatibility with Protocol Buffers?', hint: 'Field numbers never reused, reserved fields, optional fields.' },
    ],
    keyTerms: ['REST', 'GraphQL', 'gRPC', 'Protocol Buffers', 'HTTP/2', 'DataLoader', 'BFF'],
    commonMistakes: [
      'GraphQL without query cost limits (DoS risk).',
      'gRPC directly to browsers without a proxy.',
      'Choosing by hype rather than client needs.',
    ],
    interviewerIntent: 'Tests senior-level API design decision-making and trade-off reasoning.',
    whatIsTested: ['API style trade-offs', 'Practical selection criteria', 'gRPC/GraphQL internals'],
    topicId: 'sd-rest-vs-graphql-grpc',
  },

  /* ── Idempotency key ────────────────────────────────────────────────────── */
  {
    id: 'q-sd-idempotency-key',
    technology: T,
    question: 'What is an Idempotency-Key and how do you implement it server-side?',
    category: 'REST API Design',
    difficulty: 'advanced',
    tags: ['idempotency', 'POST', 'retry safety', 'distributed systems'],
    quickAnswer: 'A client-generated UUID sent with POST; the server caches key → response and replays it on duplicates, making retries safe.',
    interviewAnswer: `Problem: the client sends a POST /payments request, the network times out before it receives the response. Did the payment go through? If it retries without protection, it may double-charge.

Idempotency-Key (a UUID generated by the client) lets the server de-duplicate: on first receipt, execute the operation and store key → {status, response, request_hash} with a TTL (e.g. 24h). On subsequent requests with the same key, return the stored response immediately.

Server implementation:
1. Check if key exists in the idempotency store (Redis).
2. If yes and the request hash matches: return stored response (409 if key+different payload).
3. If no: insert the key with status=processing (prevents a second concurrent request from also proceeding), execute the operation, update the entry with the response.
4. Expire the entry after 24–48 hours.

The request hash check is important: the same key with a different payload indicates a programming error — reject with 422.`,
    codeExample: `import hashlib, json, time

store = {}  # represents Redis

def handle_payment(idempotency_key: str, payload: dict):
    req_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

    entry = store.get(idempotency_key)
    if entry:
        if entry['req_hash'] != req_hash:
            return 422, {"error": "Idempotency key reused with different payload"}
        return entry['status_code'], entry['response']   # replay

    # Mark as in-progress (SET NX in Redis)
    store[idempotency_key] = {'req_hash': req_hash, 'status_code': 202, 'response': None}

    # Execute (call PSP, write DB)
    result = execute_payment(payload)

    store[idempotency_key] = {'req_hash': req_hash, 'status_code': 201, 'response': result}
    return 201, result`,
    codeLanguage: 'Python',
    followUpQuestions: [
      { question: 'What is the TTL you would set on an idempotency key?', hint: 'Long enough for the retry window — typically 24–48 hours; match your SLA.' },
      { question: 'How does idempotency interact with database transactions?', hint: 'Key storage and operation in the same transaction for atomicity.' },
    ],
    keyTerms: ['Idempotency-Key', 'UUID', 'request hash', 'replay', 'retry safety', 'TTL'],
    commonMistakes: [
      'Not checking the request hash (same key, different amount).',
      'Not handling concurrent duplicate requests (both proceed in parallel).',
      'Too short a TTL.',
    ],
    interviewerIntent: 'Tests payment/distributed systems expertise: retry safety is critical for financial APIs.',
    whatIsTested: ['Idempotency pattern', 'Redis mechanics', 'Race condition handling'],
    topicId: 'sd-api-idempotency-pagination',
  },

  /* ── Cursor pagination ──────────────────────────────────────────────────── */
  {
    id: 'q-sd-pagination',
    technology: T,
    question: 'What is cursor-based pagination and when should you use it instead of offset?',
    category: 'REST API Design',
    difficulty: 'intermediate',
    tags: ['pagination', 'cursor', 'keyset', 'offset', 'performance'],
    quickAnswer: 'Cursor (keyset) pagination uses the last seen value as a WHERE clause — O(1) regardless of page depth and consistent on live data. Offset is simple but slow at depth and skips/duplicates rows on concurrent writes.',
    interviewAnswer: `Offset pagination (LIMIT N OFFSET M): simple to implement, random access to any page. Problems: O(M) cost (database must read and discard M rows), and on live data a row inserted before offset M shifts all subsequent rows, causing a result to appear on two pages or skip a page entirely. Breaks down at large offsets (page 1,000 of a large table is slow).

Cursor pagination (keyset): the response includes a cursor encoding the last row's sort key values. The next request sends WHERE (created_at, id) < (:cursor_ts, :cursor_id) ORDER BY created_at DESC LIMIT N. The database uses the index directly — O(log N) for index seek, not O(M). Consistent on concurrent inserts. Limitations: no random page access, cursor must encode the sort key and is opaque to the client (base64 JSON).

Use cursor: for infinite scroll, real-time feeds, large tables with frequent writes. Use offset: for small static result sets where page numbers make UX sense (search results, admin grids with 100 pages max).`,
    codeExample: `from base64 import b64encode, b64decode
import json

def encode_cursor(created_at: str, id: int) -> str:
    return b64encode(json.dumps({"ca": created_at, "id": id}).encode()).decode()

def decode_cursor(cursor: str) -> tuple:
    d = json.loads(b64decode(cursor))
    return d["ca"], d["id"]

# SQL using the cursor
cursor = encode_cursor("2026-10-14T09:00:00Z", 12345)
ca, id_ = decode_cursor(cursor)
sql = f"""SELECT * FROM transactions
WHERE (created_at, id) < ('{ca}', {id_})
ORDER BY created_at DESC, id DESC
LIMIT 50"""
print(sql[:120])`,
    codeLanguage: 'Python',
    followUpQuestions: [
      { question: 'Can you implement cursor pagination with multiple sort columns?', hint: 'Composite tuple comparison in the WHERE clause.' },
      { question: 'How do you handle deleted rows in cursor pagination?', hint: 'Gaps are fine — keyset just skips them; no phantom duplicates unlike offset.' },
    ],
    keyTerms: ['cursor pagination', 'keyset pagination', 'offset pagination', 'opaque cursor', 'composite sort key'],
    commonMistakes: [
      'Exposing raw database IDs as cursors (information leak).',
      'Using offset pagination for infinite scroll or real-time data.',
    ],
    interviewerIntent: 'Tests understanding of database performance and API design for real-world large collections.',
    whatIsTested: ['Pagination trade-offs', 'SQL keyset mechanics', 'Cursor encoding'],
    topicId: 'sd-api-idempotency-pagination',
  },

  /* ── Status codes ───────────────────────────────────────────────────────── */
  {
    id: 'q-sd-status-codes',
    technology: T,
    question: 'Walk me through the HTTP status codes you use most in API design and when each is correct.',
    category: 'REST API Design',
    difficulty: 'intermediate',
    tags: ['HTTP status codes', 'REST', 'API design', '4xx', '5xx'],
    quickAnswer: '200 OK, 201 Created, 202 Accepted, 204 No Content, 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests, 500 Internal Error.',
    interviewAnswer: `2xx successes:
200 OK — generic success with body.
201 Created — resource created; include Location header with the new URL.
202 Accepted — received but not yet processed (async jobs, long-running ops). Return status poll URL.
204 No Content — success with no body (DELETE, PATCH returning nothing).

4xx client errors:
400 Bad Request — malformed syntax, missing required field.
401 Unauthorized (misleadingly named) — authentication required / token missing / expired.
403 Forbidden — authenticated but not authorised for this resource.
404 Not Found — resource does not exist. Sometimes used for "authenticated but I won't reveal if it exists" (privacy).
409 Conflict — state conflict: duplicate key, optimistic locking failure, version mismatch.
412 Precondition Failed — If-Match header did not match ETag (concurrent update blocked).
422 Unprocessable Entity — syntactically valid but semantically wrong (business rule violation: "can't transfer to the same account").
429 Too Many Requests — rate limit exceeded; include Retry-After.

5xx server errors:
500 Internal Server Error — unexpected fault in the server (should never leak internal detail).
502 Bad Gateway — upstream service returned bad response.
503 Service Unavailable — under load or maintenance; include Retry-After.`,
    followUpQuestions: [
      { question: 'What is the difference between 401 and 403?', hint: '401 = who are you? 403 = I know who you are, you just can\'t do this.' },
      { question: 'Why return 202 instead of 200 for async operations?', hint: 'Signals to the client not to assume the operation is complete.' },
    ],
    keyTerms: ['200', '201', '202', '204', '400', '401', '403', '404', '409', '422', '429', '500', '503'],
    commonMistakes: [
      '200 OK with an error payload body.',
      'Returning 500 for a client programming error.',
      'Confusing 401 and 403.',
      '404 for a resource the user is not allowed to see (use 403 or 404 depending on privacy policy).',
    ],
    interviewerIntent: 'Tests REST fundamentals — a quick filter question for senior engineers.',
    whatIsTested: ['HTTP semantics', 'Client vs server error distinction', 'Practical API design'],
    topicId: 'sd-rest-api-design',
  },

  /* ── URL shortener ──────────────────────────────────────────────────────── */
  {
    id: 'q-sd-url-shortener',
    technology: T,
    question: 'Design a URL shortener like bit.ly.',
    category: 'Case Studies',
    difficulty: 'advanced',
    tags: ['system design', 'URL shortener', 'key generation', 'caching', 'CDN'],
    quickAnswer: 'Generate base62 short codes from unique ids, store in KV, serve redirects from CDN-cached Redis, track clicks asynchronously.',
    interviewAnswer: `Clarify requirements: create short URLs, redirect, analytics (click counts, referrers), custom aliases, expiry. Scale: ~200 writes/s, ~20k reads/s (100:1 read-heavy).

API:
POST /links {url, alias?, expiry?} → 201 {short_code, short_url}
GET  /{code}  → 302 (analytics) or 301 (browser-cached, no analytics)

Short code generation: assign a unique 64-bit id (per-service counter range or Snowflake-style for horizontal scale) and base62-encode it — 7 characters cover 62^7 ≈ 3.5T codes without hash-collision retries.

Storage: simple KV table or Redis hash: code → {long_url, owner, created_at, expiry}. TTL for expiry.

Read path (hot): edge CDN → Redis (cache-aside) → DB. 99%+ redirects served from Redis at <5ms. Return 302 (not 301: browser caches 301 permanently, breaking analytics and invalidation).

Analytics: on redirect, emit an async event to Kafka (code, ts, ip, user_agent, referrer); consumer writes to a time-series store / data warehouse. Never block the redirect on analytics.

Security: validate URLs against a blocklist/malware-list feed; rate-limit creation per user; keep an audit log of created links.`,
    codeExample: `ALPHA = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode(n: int) -> str:
    if n == 0: return ALPHA[0]
    out = []
    while n:
        n, r = divmod(n, 62)
        out.append(ALPHA[r])
    return "".join(reversed(out))

# Simulate an id from an auto-increment or Snowflake generator
for uid in [1, 1_000_000, 3_521_614_606_207]:
    print(uid, "->", encode(uid))`,
    codeLanguage: 'Python',
    expectedOutput: '1 -> 1\n1000000 -> 4c92\n3521614606207 -> ZZZZZZZ',
    followUpQuestions: [
      { question: 'Why use 302 instead of 301 for the redirect?', hint: '301 is cached permanently by the browser, so you lose analytics and can\'t change the target.' },
      { question: 'How do you handle custom aliases for collision?', hint: 'Unique index check; return 409 if taken.' },
      { question: 'How do you scale the id generation across multiple app instances?', hint: 'Snowflake IDs (timestamp + worker id + sequence), or pre-allocated ranges.' },
    ],
    keyTerms: ['base62', 'Snowflake ID', '302 vs 301', 'KV store', 'async analytics', 'CDN cache'],
    commonMistakes: [
      'Using truncated MD5 (collision handling complexity).',
      'Returning 301 (loses analytics).',
      'Synchronous analytics write on the redirect hot path.',
    ],
    interviewerIntent: 'A classic warm-up design question testing estimation, data modeling, caching and async patterns.',
    whatIsTested: ['Back-of-envelope', 'ID generation', 'Read path optimization', 'Async side-effects'],
    topicId: 'sd-case-url-shortener',
  },

  /* ── Notification system ────────────────────────────────────────────────── */
  {
    id: 'q-sd-notification-system',
    technology: T,
    question: 'Design a notification system that sends emails, SMS and push notifications at scale.',
    category: 'Case Studies',
    difficulty: 'advanced',
    tags: ['notification system', 'fan-out', 'Kafka', 'retries', 'deduplication'],
    quickAnswer: 'Domain events → notification service → per-channel queues → workers → providers. Idempotent posting, DLQ with retries, user preference and quiet-hours enforcement.',
    interviewAnswer: `Scale: 50M users, millions of notifications/day across email (SES), SMS (Twilio), and push (FCM/APNs).

Flow: a payment service publishes PaymentCompleted to Kafka. The notification service consumes it, checks user preferences (opted-in channels, quiet hours, locale), resolves the template, generates a deterministic notification_id = sha256(event_id + channel) for deduplication, and enqueues per channel to separate queues (email_queue, sms_queue, push_queue) so one slow channel does not block others.

Channel workers: consume their queue, call the provider SDK with a timeout (3–5s), on success update status to SENT; on retryable error (rate-limit, transient) exponential backoff + retry (3 times); on permanent failure (invalid number, unsubscribed) mark FAILED without retrying; after max retries publish to the DLQ for manual review.

Priority: OTP / fraud alerts on a separate high-priority queue with dedicated worker capacity and separate provider quotas. Marketing on a low-priority queue with rate limiting and quiet hours (don't send between 10pm and 8am local time).

Provider failover: primary SES fails → retry on Mailgun; primary Twilio fails → try Vonage. Track delivery receipts via webhooks from providers and update notification records.`,
    followUpQuestions: [
      { question: 'How do you prevent a user from receiving the same SMS twice on a retry?', hint: 'Deterministic notification_id + unique constraint in the DB before sending.' },
      { question: 'How do you enforce quiet hours across timezones?', hint: 'Store user timezone, compute local time at send, delay to next allowed window.' },
    ],
    keyTerms: ['fan-out', 'per-channel queue', 'DLQ', 'deduplicate', 'quiet hours', 'provider failover', 'webhook'],
    commonMistakes: [
      'Single queue for all channels (SMS latency hurts push OTP delivery).',
      'No deduplication (users get two SMSes on retry).',
      'Marketing notifications sharing infrastructure with OTPs.',
    ],
    interviewerIntent: 'Tests distributed systems design: fan-out, queuing, retries, dedup and operational priorities.',
    whatIsTested: ['Fan-out pattern', 'Queue isolation', 'Retry + DLQ', 'Operational prioritization'],
    topicId: 'sd-case-notification-system',
  },

  /* ── Payment system ─────────────────────────────────────────────────────── */
  {
    id: 'q-sd-payment-system',
    technology: T,
    question: 'Design a payment processing system. How do you guarantee a payment happens exactly once?',
    category: 'Case Studies',
    difficulty: 'architect',
    tags: ['payment system', 'idempotency', 'double-entry ledger', 'state machine', 'exactly-once'],
    quickAnswer: 'Idempotency key → state machine → double-entry ledger posted in a single DB transaction → outbox to PSP → reconciliation as the safety net.',
    interviewAnswer: `"Exactly once" in distributed systems is built from: at-least-once delivery + idempotency at every hop.

Client → API: POST /payments with an Idempotency-Key. Server stores (key, request_hash, CREATED) in one transaction with an outbox event. Replay on duplicate key.

API → PSP: the payment executor sends the payment to the PSP using the payment_id as the PSP idempotency reference. On timeout, status is UNKNOWN (not FAILED — we don't know). Resolve UNKNOWN by: retrying the status check, waiting for the PSP webhook, or scheduling a reconciliation job. Move the state machine: CREATED → AUTHORISED → CAPTURED or → FAILED → (optionally) REVERSED.

Ledger: every authorised movement produces two immutable ledger entries (debit one account, credit another; sum = 0). Balance = sum of ledger entries. Never update a balance column in place.

Reconciliation: daily (or more frequent) settlement files from the PSP/bank are compared against internal ledger entries. Mismatches trigger alerts and are resolved by the finance ops team. Reconciliation is the safety net that catches the rare cases where all other mechanisms failed.

Money amounts: store in minor units (integer pence/cents) or use DECIMAL(19,4). Never float.`,
    followUpQuestions: [
      { question: 'What do you do when the PSP returns a timeout?', hint: 'Status = UNKNOWN; query PSP status endpoint; wait for webhook; do not retry with a new reference.' },
      { question: 'Why double-entry instead of updating a balance column?', hint: 'Audit trail, reversal without data loss, ability to recompute balance from scratch.' },
    ],
    keyTerms: ['idempotency key', 'state machine', 'double-entry', 'UNKNOWN status', 'PSP', 'reconciliation', 'outbox'],
    commonMistakes: [
      'Retrying PSP call with a new reference on timeout (double charge).',
      'Float for money amounts.',
      'No reconciliation process.',
      'Treating PSP timeout as failure.',
    ],
    interviewerIntent: 'Tests financial distributed systems design — one of the hardest production problems.',
    whatIsTested: ['Idempotency', 'Exactly-once semantics', 'Double-entry accounting', 'Failure handling'],
    topicId: 'sd-case-payment-system',
  },
];
