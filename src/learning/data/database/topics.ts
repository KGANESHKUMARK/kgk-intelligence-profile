import type { LearningTopic } from '../../types';

const T = 'database';

export const databaseTopics: LearningTopic[] = [
  /* ----------------------------------------- SQL Query Planning & Indexes */
  {
    id: 'db-indexes',
    technology: T,
    title: 'SQL Indexes — B-Tree, Hash, Partial & Composite',
    category: 'SQL Internals',
    slug: 'db-indexes',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Indexes are the single most impactful query optimisation: the difference between O(1) and O(n) lookup, and the most common fix for slow database queries.',
    mentalModel: 'A B-tree index is like the index of a book — instead of reading every page (full table scan), you jump directly to the right page (index seek). The trade-off: writes maintain the index; reads benefit from it.',
    memoryTip: 'B-Tree = sorted, good for range and equality. Hash = equality only, O(1). GIN/GiST = text search, arrays, JSON. Partial = index subset of rows. Composite = column order matters (leftmost prefix rule).',
    keyTerms: ['B-tree index', 'hash index', 'GIN', 'GiST', 'partial index', 'composite index', 'covering index', 'index scan', 'sequential scan', 'EXPLAIN ANALYZE'],
    visualIds: ['db-btree-structure'],
    interviewAnswer: `B-tree indexes are the default in PostgreSQL — a balanced tree structure supporting equality (=), range (<, >, BETWEEN), ORDER BY, and IS NULL efficiently. Hash indexes are O(1) for equality only — not range queries, not sorted output. GIN (Generalized Inverted Index) indexes array elements and JSONB keys — used for full-text search and JSONB @> queries. Composite index rule: columns ordered left-to-right, queries must use the leftmost prefix. Index on (account_id, created_at): queries filtering by account_id or (account_id, created_at) use the index; queries filtering only by created_at do NOT. Covering index: include all columns needed by a query to enable index-only scan (no heap access). Partial index: WHERE status='PENDING' — only pending orders are indexed, saving space and speeding up the common query. Always use EXPLAIN ANALYZE to verify the query plan uses the intended index — the cost-based planner chooses; you advise.`,
    internalWorking: `PostgreSQL B-tree: each page (8 KB default) is a node in the tree. Leaf nodes hold the indexed value + heap tuple pointer (ctid). Internal nodes hold separator keys. Seek: traverse root → internal nodes → leaf, O(log n). Full table scan: read every page, O(n). For a 10M-row table: B-tree seek = ~4 page reads; full scan = ~50,000 page reads. Hot/bloat: updates don't update in-place; old versions remain until VACUUM. Index bloat after many updates/deletes degrades performance — REINDEX concurrently to rebuild.`,
    codeExample: `-- PostgreSQL: see the query plan
EXPLAIN ANALYZE
SELECT t.id, t.amount, t.created_at
FROM transactions t
WHERE t.account_id = 'ACC-001'
  AND t.created_at BETWEEN '2025-01-01' AND '2025-12-31'
  AND t.status = 'COMPLETED'
ORDER BY t.created_at DESC;

-- Optimal composite index for above query
CREATE INDEX CONCURRENTLY idx_transactions_account_date
  ON transactions (account_id, created_at DESC)
  WHERE status = 'COMPLETED';  -- partial: only completed transactions

-- Covering index — index-only scan (no heap access)
CREATE INDEX CONCURRENTLY idx_transactions_covering
  ON transactions (account_id, created_at DESC)
  INCLUDE (id, amount, status);  -- INCLUDE doesn't affect sort order

-- Read EXPLAIN output
-- Seq Scan: bad (full table scan)
-- Index Scan: good (B-tree seek + heap fetch)
-- Index Only Scan: best (B-tree only, no heap)
-- Rows Removed by Filter: high number means index not selective enough`,
    practicalExample: `Payment transaction table, 50M rows. Query: SELECT * FROM transactions WHERE account_id = ? AND status = 'PENDING' ORDER BY created_at. Without index: Seq Scan, 4.2 seconds. After adding composite index (account_id, status, created_at): Index Scan, 1.8ms. 2300× improvement. The cost: each INSERT/UPDATE adds ~1ms for index maintenance — negligible for this write rate.`,
    commonMistakes: [
      'Adding index on every column — indexes slow writes and take space; only index columns in WHERE/ORDER BY/JOIN.',
      'Wrong composite index order — index on (status, account_id) vs (account_id, status): queries filtering by account_id alone only use the latter.',
      'Not using CONCURRENTLY — CREATE INDEX takes an exclusive lock; use CREATE INDEX CONCURRENTLY in production.',
      'Ignoring EXPLAIN output — assuming the index is being used without verifying.',
    ],
    seniorInsight: `Index bloat is a silent killer: heavy UPDATE/DELETE tables accumulate dead tuple versions in indexes that VACUUM doesn't remove. Measure bloat with pgstattuple. In production, schedule REINDEX CONCURRENTLY during low-traffic windows. Also: partial indexes on soft-delete tables (WHERE deleted_at IS NULL) can reduce index size 80% for tables where 90% of rows are soft-deleted.`,
    aiAwareness: {
      strongAnswerShouldMention: ['B-tree range and equality', 'composite index leftmost prefix', 'covering index', 'partial index', 'EXPLAIN ANALYZE'],
      weakAnswer: 'Adding an index makes queries faster.',
      redFlags: ['Doesn\'t know EXPLAIN ANALYZE', 'Creates index without CONCURRENTLY on live table'],
      likelyFollowUp: ['What is a covering index?', 'How do you find slow queries?', 'When should you NOT add an index?'],
    },
    prerequisites: [],
    relatedTopics: ['db-query-planning', 'db-connection-pool'],
    nextTopics: ['db-query-planning'],
    interviewQuestions: ['q-db-explain-analyze', 'q-db-index-design'],
  },
  /* ---------------------------------------- Query Planning & Optimisation */
  {
    id: 'db-query-planning',
    technology: T,
    title: 'Query Planning, N+1 Problems & EXPLAIN ANALYZE',
    category: 'SQL Internals',
    slug: 'db-query-planning',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The query planner chooses the cheapest execution plan based on statistics; EXPLAIN ANALYZE shows what it chose and why, exposing N+1 queries and missing indexes.',
    mentalModel: 'EXPLAIN shows the plan (estimated). EXPLAIN ANALYZE executes and shows the actual plan vs estimate. Read it bottom-up — the widest-indented node executes first. Rows/actual vs estimated mismatch → stale statistics → run ANALYZE.',
    memoryTip: 'N+1: 1 query to load 100 entities, then 100 queries to load their associations = 101 queries. Fix: JOIN FETCH, EntityGraph, or batch loading. EXPLAIN: cost=startup..total, actual time=startup..end, rows=actual.',
    keyTerms: ['EXPLAIN ANALYZE', 'query plan', 'cost estimate', 'statistics', 'N+1 problem', 'JOIN FETCH', 'EntityGraph', 'Hibernate batch', 'p6spy', 'seq scan vs index scan'],
    visualIds: [],
    interviewAnswer: `PostgreSQL's query planner uses statistics (column value distributions, table size) to estimate the cost of each possible plan and chooses the cheapest. Costs are in abstract units (page reads + CPU). EXPLAIN shows the estimated plan; EXPLAIN ANALYZE runs the query and shows actual vs estimated rows and time. Read output bottom-up: the most-indented node runs first. Warning signs: (1) Seq Scan on a large table — index missing or unused. (2) Actual rows >> Estimated rows — stale statistics, run ANALYZE. (3) Sort + Seq Scan — consider index to avoid sort. N+1 in Spring Data JPA: fetching 100 Order entities with EAGER-loaded Items triggers 1 (orders) + 100 (items) queries = 101 round trips. Fix: @EntityGraph or JOIN FETCH to load in a single query. Hibernate batch fetch: spring.jpa.properties.hibernate.default_batch_fetch_size=20 batches related entity loads.`,
    codeExample: `-- PostgreSQL: read an EXPLAIN ANALYZE output
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'PENDING'
ORDER BY o.created_at DESC
LIMIT 20;

-- Plan output (annotated):
-- Sort (cost=1234.00..1234.05 rows=20 width=64)
--   ->  Hash Join  (cost=50.12..1200.23 rows=980 actual rows=23456 ← MISMATCH!)
--         ->  Seq Scan on orders  ← should be Index Scan
-- Problem: estimated 980 rows, actual 23456 → stale statistics
-- Fix: ANALYZE orders; and add index on (status, created_at DESC)

// Spring Data JPA — N+1 fix with EntityGraph
@EntityGraph(attributePaths = {"items", "items.product"})
@Query("SELECT o FROM Order o WHERE o.status = :status")
List<Order> findByStatusWithItems(@Param("status") String status);

// Or: Hibernate batch fetch size in application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=20
// Now loading 100 orders fires 1 + ceil(100/20) = 6 queries, not 101`,
    practicalExample: `P6Spy or Hibernate's show-sql revealed 847 SQL queries for a single API call that listed 100 transactions with their account details. Root cause: LAZY-loaded Account on each Transaction. Fix: @EntityGraph to JOIN FETCH Account. Result: 847 queries → 1 query, response time 1.4s → 28ms.`,
    commonMistakes: [
      'Using EXPLAIN without ANALYZE — the plan shows estimates, not reality. Run EXPLAIN ANALYZE.',
      'Not using p6spy/Hibernate show-sql in development — N+1 problems hide until production load.',
      'Fixing N+1 with EAGER globally — this causes cartesian product problems on collections.',
      'Not running ANALYZE after bulk load — statistics stay at old values, planner makes wrong choices.',
    ],
    seniorInsight: `pg_stat_statements extension logs every query, its call count, total time, and mean time — the definitive tool for finding slow queries in production without adding application instrumentation. Combine with auto_explain to log the EXPLAIN ANALYZE of any query exceeding a threshold: auto_explain.log_min_duration=1000ms.`,
    aiAwareness: {
      strongAnswerShouldMention: ['EXPLAIN ANALYZE bottom-up', 'N+1 with EntityGraph or JOIN FETCH', 'statistics and ANALYZE', 'Seq Scan vs Index Scan'],
      weakAnswer: 'We use Hibernate and add indexes when queries are slow.',
      redFlags: ['Doesn\'t know about N+1 queries', 'Never read an EXPLAIN output'],
      likelyFollowUp: ['How do you detect N+1 queries?', 'What does ANALYZE do?', 'What is the difference between EXPLAIN and EXPLAIN ANALYZE?'],
    },
    prerequisites: ['db-indexes'],
    relatedTopics: ['db-connection-pool'],
    nextTopics: ['db-connection-pool'],
    interviewQuestions: ['q-db-explain-analyze', 'q-db-n-plus-one'],
  },
  /* ----------------------------------------------- Connection Pooling */
  {
    id: 'db-connection-pool',
    technology: T,
    title: 'Connection Pooling — HikariCP & Pool Sizing',
    category: 'Connection Pooling',
    slug: 'db-connection-pool',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'Database connections are expensive to create and PostgreSQL has a connection limit. HikariCP pools and reuses connections; pool size = CPU cores × 2 + effective_spindle_count.',
    mentalModel: 'Connection = a phone line. Creating one = calling the operator (slow). Pool = a switchboard: lines are pre-connected and handed out on demand. Too many lines = DB server OOM. Too few = queue builds up.',
    memoryTip: 'HikariCP is the fastest Java pool. Default max = 10. Formula: pool_size = (core_count × 2) + effective_spindle_count. Start at 10 for most services. Connection timeout = 30s default (too long — set to 3s for API services).',
    keyTerms: ['HikariCP', 'connection pool', 'maximumPoolSize', 'minimumIdle', 'connectionTimeout', 'idleTimeout', 'pool exhaustion', 'PgBouncer', 'RDS Proxy', 'validation query'],
    visualIds: [],
    interviewAnswer: `HikariCP is Spring Boot's default connection pool — the fastest Java JDBC pool. Key settings: maximumPoolSize (default 10) — how many connections to PostgreSQL; minimumIdle (default = max) — idle connections maintained; connectionTimeout (default 30s, set to 3s for APIs — fail fast rather than queue); idleTimeout (600s — how long before idle connections are closed). Pool sizing formula (Hikari docs + PostgreSQL guidance): pool_size = (CPU_cores × 2) + spindle_count. For a 4-core VM → 9 connections per service instance. With 10 service instances → 90 connections to the DB — check PostgreSQL's max_connections. Pool exhaustion: if all connections are in use and a new request arrives after connectionTimeout, HikariException is thrown. Detect: HikariCP exposes metrics (hikaricp.connections.active, hikaricp.connections.pending) — alert when pending > 0. Fix: increase pool size, reduce query time, or add PgBouncer/RDS Proxy.`,
    codeExample: `# Spring Boot HikariCP configuration
spring:
  datasource:
    hikari:
      maximum-pool-size: 10           # (cores × 2) + spindle_count
      minimum-idle: 5                 # don't drop below this on idle
      connection-timeout: 3000        # 3s — fast fail for API services
      idle-timeout: 600000            # 10 min
      max-lifetime: 1800000           # 30 min — recycle to avoid stale connections
      pool-name: PaymentPool
      # Validate connection before handing to caller
      connection-test-query: SELECT 1  # for older drivers; modern drivers auto-validate

# Metrics alert: pool exhaustion approaching
management.metrics.enable.hikaricp=true
# Grafana alert: hikaricp_connections_pending > 0 for > 30s → PagerDuty

# RDS Proxy (for Lambda): no pool in Lambda, RDS Proxy multiplexes
# 1000 Lambda invocations → RDS Proxy → 20 DB connections (pool size 20)`,
    practicalExample: `A payment service under load hit pool exhaustion: HikariCP metrics showed 10/10 connections active and 15 requests waiting. Investigation: one slow query (missing index) held a connection for 8 seconds instead of 50ms, backing up behind it. Fix: add the index (50ms query time) AND reduce connectionTimeout to 2s so the API fails fast instead of queueing for 30s.`,
    commonMistakes: [
      'Setting maximumPoolSize=100 to "avoid exhaustion" — PostgreSQL has a hard max_connections limit; too many pools × large sizes = DB OOM.',
      'Lambda connecting directly to PostgreSQL — each invocation opens a new connection (Lambda has no in-process pool); use RDS Proxy.',
      'Default connectionTimeout (30s) in APIs — a 30s queue builds up; users see a 30s hang instead of an immediate error.',
      'Not monitoring pool metrics — pool exhaustion silently degrades performance before requests fail.',
    ],
    seniorInsight: `PgBouncer is a lightweight PostgreSQL connection pooler deployed as a sidecar: services connect to PgBouncer (thousands of connections), PgBouncer multiplexes onto a small number of actual PostgreSQL connections. In transaction mode, a PostgreSQL connection is only held during a transaction — ideal for high-concurrency APIs. This is how you run 100 service instances without exhausting PostgreSQL's 500-connection limit.`,
    aiAwareness: {
      strongAnswerShouldMention: ['HikariCP default pool size', 'pool sizing formula', 'connectionTimeout fast-fail', 'pool exhaustion detection', 'RDS Proxy for Lambda'],
      weakAnswer: 'We use a connection pool so we don\'t create a new DB connection on every request.',
      redFlags: ['Setting pool to 100+ without knowing DB max_connections', 'Lambda connecting directly to DB'],
      likelyFollowUp: ['How do you size a connection pool?', 'What happens when the pool is exhausted?', 'Why use PgBouncer instead of a larger pool?'],
    },
    prerequisites: [],
    relatedTopics: ['db-indexes', 'db-redis'],
    nextTopics: ['db-redis'],
    interviewQuestions: ['q-db-hikari-sizing', 'q-db-pool-exhaustion'],
  },
  /* ---------------------------------------------------- Redis Patterns */
  {
    id: 'db-redis',
    technology: T,
    title: 'Redis Patterns — Cache-Aside, Pub/Sub, Rate Limiting & Lua',
    category: 'Redis',
    slug: 'db-redis',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Redis is an in-memory data structure store — used for caching, session storage, pub/sub messaging, distributed locks, and rate limiting; all with sub-millisecond latency.',
    mentalModel: 'Redis = fast RAM database. Cache-aside = read DB on miss, populate Redis. Write-through = write both DB and Redis simultaneously. Eviction = what Redis drops when full (LRU is usually right).',
    memoryTip: 'Cache-aside (most common): read Redis first; on miss, read DB, write Redis, return. TTL on every key. Eviction: allkeys-lru for pure cache. volatile-lru for mixed. Never noeviction in a cache.',
    keyTerms: ['cache-aside', 'write-through', 'TTL', 'eviction policy', 'pub/sub', 'Lua script', 'distributed lock', 'SETNX', 'Redisson', 'Redis Cluster'],
    visualIds: [],
    interviewAnswer: `Cache-aside (lazy loading): read Redis; on miss, load from DB, write to Redis with TTL, return. Pro: only frequently-accessed data in cache. Con: cold start latency on first access. Write-through: write to DB and Redis simultaneously on every write — cache is always warm but writes are slower. Use for read-heavy, write-moderate data. Rate limiting with Redis: use INCR + EXPIRE atomically — but INCR then EXPIRE has a race condition; use Lua script or SET with px (milliseconds) expiry for atomicity. Distributed lock: SETNX (Set if Not Exists) with EXPIRE — if key doesn't exist, acquire lock; otherwise fail. Redisson's RLock handles lock expiry renewal automatically. Pub/sub: producers PUBLISH to a channel; consumers SUBSCRIBE and receive messages. Stateless — no persistence, no replay; use Kafka for durable messaging. Lua scripts in Redis execute atomically — used for complex multi-command operations (check-then-act without race conditions).`,
    codeExample: `// Spring Boot cache-aside with Spring Cache + Redis
@Service
public class ExchangeRateService {
    
    @Cacheable(value = "exchange-rates", key = "#currency", unless = "#result == null")
    public ExchangeRate getRate(String currency) {
        log.info("Cache miss — loading rate for {} from DB", currency);
        return rateRepository.findByCurrency(currency)
            .orElseThrow(() -> new RateNotFoundException(currency));
    }
    
    @CacheEvict(value = "exchange-rates", key = "#currency")
    public void updateRate(String currency, BigDecimal newRate) {
        rateRepository.save(new ExchangeRate(currency, newRate));
        // Cache evicted — next read will load fresh value
    }
}

# application.yaml — Redis TTL per cache
spring:
  cache:
    redis:
      time-to-live: 300s          # 5 min default
  data:
    redis:
      host: redis.banking.internal
      
// Rate limiting with Lua script (atomic check-and-increment)
String luaScript = """
    local key = KEYS[1]
    local limit = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local count = redis.call('INCR', key)
    if count == 1 then
        redis.call('EXPIRE', key, window)
    end
    if count > limit then
        return 0  -- rate limited
    end
    return 1  -- allowed
""";

public boolean isAllowed(String userId, int limitPerMinute) {
    String key = "rate:" + userId + ":" + (System.currentTimeMillis() / 60000);
    Long result = redisTemplate.execute(
        new DefaultRedisScript<>(luaScript, Long.class),
        List.of(key), String.valueOf(limitPerMinute), "60");
    return Long.valueOf(1L).equals(result);
}`,
    practicalExample: `Exchange rate API called 10,000 times per second in production. Without Redis: 10,000 DB queries/s, 400ms P99 latency. With Redis cache-aside (5-minute TTL): cache hit rate 99.7%, DB load dropped to ~30 queries/min (cache misses and TTL expiry), P99 latency 2ms. Cache invalidation: on exchange rate update, evict the specific currency key — cache is stale for at most 5 minutes or until eviction.`,
    commonMistakes: [
      'No TTL on cached values — stale data accumulates forever.',
      'Using noeviction policy in a cache — Redis OOM-kills itself instead of evicting old entries.',
      'Caching high-cardinality data (userId-specific) without considering memory — 1M users × 1 KB each = 1 GB.',
      'pub/sub for durable messaging — Redis pub/sub has no persistence; use Kafka for guaranteed delivery.',
    ],
    seniorInsight: `Cache stampede (thundering herd): when a popular key expires, all concurrent requests simultaneously miss the cache and hammer the DB. Fix: probabilistic early expiration — refresh the cache when remaining TTL drops below a random threshold, not when it reaches zero. Or use a distributed lock on cache miss: one request loads the DB while others wait for the lock to release and read from the freshly-populated cache.`,
    aiAwareness: {
      strongAnswerShouldMention: ['cache-aside pattern', 'TTL on every key', 'Lua atomicity', 'distributed lock', 'eviction policy', 'pub/sub no persistence'],
      weakAnswer: 'Redis is a cache we put in front of the database to make it faster.',
      redFlags: ['No TTL', 'noeviction policy', 'Using pub/sub for durable messaging'],
      likelyFollowUp: ['What is cache stampede and how do you prevent it?', 'How does a distributed lock work in Redis?', 'What eviction policy do you use?'],
    },
    prerequisites: ['db-connection-pool'],
    relatedTopics: ['db-indexes'],
    nextTopics: [],
    interviewQuestions: ['q-db-redis-patterns', 'q-db-cache-stampede'],
  },
];
