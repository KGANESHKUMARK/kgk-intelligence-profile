import type { LearningVisual } from '../../types';
export const databaseVisuals: LearningVisual[] = [
  {
    id: 'db-btree-structure',
    topicId: 'db-indexes',
    type: 'flow',
    title: 'B-Tree Index Seek vs Full Table Scan',
    description: 'Why index seeks are O(log n) while sequential scans are O(n)',
    nodes: [
      { id: 'root', label: 'Root Node', description: 'Entry point. Separator keys guide search to correct subtree.' },
      { id: 'inner', label: 'Internal Nodes', description: 'Each 8 KB page holds ~200 separator keys + child pointers. Tree stays shallow: 4 levels for 100M rows.' },
      { id: 'leaf', label: 'Leaf Nodes', description: 'Hold indexed value + ctid (heap tuple pointer). Leaf pages are doubly linked — enables range scans.' },
      { id: 'heap', label: 'Table Heap', description: 'Actual row data. Index Scan: B-tree seek → ctid → heap fetch. Covering index skips this step.' },
      { id: 'seqscan', label: 'Sequential Scan', description: 'Reads every page in the table. O(n). Necessary for low-selectivity queries or when planner estimates it is cheaper than random I/O.' },
    ],
    memoryTip: 'B-tree seek: 4 page reads for 100M row table. Sequential scan: 50,000+ pages. Index makes reads faster but adds overhead to every write.',
  },
  {
    id: 'db-index-types',
    topicId: 'db-indexes',
    type: 'comparison',
    title: 'PostgreSQL Index Types — When to Use Each',
    description: 'B-tree vs Hash vs GIN vs GiST vs partial — choose by access pattern',
    columns: [
      {
        label: 'General Purpose',
        nodes: [
          { id: 'btree', label: 'B-Tree (default)', description: 'Equality, range, ORDER BY, IS NULL. Best for most columns. Supports forward/backward scan.' },
          { id: 'hash', label: 'Hash', description: 'Equality only (=). O(1) lookup. Cannot support range, IS NULL, or ORDER BY. Rarely the best choice.' },
          { id: 'partial', label: 'Partial Index', description: 'WHERE status=\'PENDING\'. Index only the interesting rows. Smaller, faster, lower write overhead.' },
          { id: 'covering', label: 'Covering (INCLUDE)', description: 'INCLUDE(amount) in index. Index-only scan — no heap access. Best for read-heavy workloads.' },
        ],
      },
      {
        label: 'Specialised',
        nodes: [
          { id: 'gin', label: 'GIN (Inverted)', description: 'Arrays, JSONB @>, full-text search (tsvector). Slow to build/update, fast to query.' },
          { id: 'gist', label: 'GiST', description: 'Geometric types, range types, PostGIS spatial data. Supports overlap, contains, nearest-neighbour.' },
          { id: 'brin', label: 'BRIN', description: 'Block Range Index. Very small. Useful for naturally ordered data (created_at on time-series tables). Low selectivity.' },
          { id: 'composite', label: 'Composite B-Tree', description: 'Multiple columns. Leftmost prefix rule applies. ORDER matters: equality columns first, range last.' },
        ],
      },
    ],
    memoryTip: 'Default to B-tree. JSONB queries → GIN. Geospatial → GiST. Filtering 5% of rows → partial index. Multi-column WHERE → composite with equality first.',
  },
  {
    id: 'db-hikari-pool',
    topicId: 'db-connection-pool',
    type: 'flow',
    title: 'HikariCP Connection Pool Lifecycle',
    description: 'How requests acquire and release connections from the pool',
    nodes: [
      { id: 'req', label: 'HTTP Request', description: 'Thread calls DataSource.getConnection(). Timer starts (connectionTimeout = 3s).' },
      { id: 'pool', label: 'HikariCP Pool', description: 'Pool has maximumPoolSize connections (e.g. 10). Checks for idle connection.' },
      { id: 'idle', label: 'Idle Connection Available', description: 'Connection handed to thread immediately. Business logic executes SQL.' },
      { id: 'busy', label: 'All Connections Busy', description: 'Thread queues. If still waiting after connectionTimeout → HikariException thrown.' },
      { id: 'return', label: 'Connection Returned', description: 'Transaction committed/rolled back. Connection returned to pool (not closed). Next request gets it.' },
    ],
    memoryTip: 'Pool pre-creates connections at startup. Getting a connection from pool: ~100µs. Creating a new connection: ~50ms. Pool is the difference.',
  },
  {
    id: 'db-redis-patterns-visual',
    topicId: 'db-redis',
    type: 'comparison',
    title: 'Redis Patterns — Cache-Aside, Rate Limit, Distributed Lock',
    description: 'The three most important Redis patterns for production Java services',
    columns: [
      {
        label: 'Read Patterns',
        nodes: [
          { id: 'ca', label: 'Cache-Aside (Lazy)', description: 'Read Redis → miss → read DB → write Redis with TTL. Most common pattern.' },
          { id: 'wt', label: 'Write-Through', description: 'Write DB and Redis simultaneously. Cache always warm. Higher write latency.' },
          { id: 'rl', label: 'Rate Limiting', description: 'INCR key. EXPIRE key on first. Lua script for atomic check-and-increment.' },
        ],
      },
      {
        label: 'Coordination Patterns',
        nodes: [
          { id: 'dl', label: 'Distributed Lock', description: 'SET key NX EX 30 → if OK, lock acquired. Redisson RLock for auto-renewal and pod-crash cleanup.' },
          { id: 'ps', label: 'Pub/Sub', description: 'PUBLISH → SUBSCRIBE. No persistence. Subscriber offline = missed message. Use for cache invalidation, not payments.' },
          { id: 'ss', label: 'Sorted Set', description: 'Leaderboards, sliding window rate limits (ZADD + ZRANGEBYSCORE with score=timestamp).' },
        ],
      },
    ],
    memoryTip: 'TTL always on cached values. Lua for atomic operations. Redisson over raw SETNX. pub/sub is not Kafka — no durability.',
  },
];
