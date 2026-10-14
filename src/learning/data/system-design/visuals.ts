import type { LearningVisual } from '../../types';

export const systemDesignVisuals: LearningVisual[] = [
  {
    id: 'sd-api-gateway-flow',
    topicId: 'sd-api-gateway',
    type: 'flow',
    title: 'API Gateway — Request Flow',
    description: 'How a request flows through the API Gateway before reaching backend microservices.',
    memoryTip: 'Gateway handles north-south (client→system) traffic. Service mesh handles east-west (service→service) traffic.',
    nodes: [
      { id: '1', label: 'Client (Browser/Mobile/Partner)', caption: 'HTTPS' },
      { id: '2', label: 'Load Balancer', caption: 'L4/L7 — HA across gateway instances' },
      { id: '3', label: 'API Gateway', caption: 'TLS · JWT auth · Rate limit · Route', topicId: 'sd-api-gateway' },
      { id: '4', label: 'Service Mesh (east-west)', caption: 'mTLS · retries · tracing', topicId: 'sd-rate-limiting' },
      { id: '5', label: 'Downstream Service', caption: 'Payment / Account / Notification' },
    ],
    edges: [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
    ],
  },
  {
    id: 'sd-cache-aside-flow',
    topicId: 'sd-caching-strategies',
    type: 'flow',
    title: 'Cache-Aside Pattern (Read + Write)',
    description: 'Read and write flow for the cache-aside (lazy loading) pattern with stampede protection.',
    memoryTip: 'On write: update DB first, then DELETE the cache key. Never update the cache value directly (ordering races).',
    nodes: [
      { id: 'read', label: 'App reads from cache', caption: 'Redis GET key' },
      { id: 'hit', label: 'Cache HIT → return', caption: '~1ms — done' },
      { id: 'miss', label: 'Cache MISS', caption: 'key not found or expired' },
      { id: 'lock', label: 'Acquire rebuild lock (NX)', caption: 'SET lock:key NX EX 10 — one rebuilder' },
      { id: 'db', label: 'Query database', caption: 'SELECT — ~5–20ms' },
      { id: 'set', label: 'SET cache with jittered TTL', caption: 'EX (300 + rand 0-60) — prevents stampede' },
      { id: 'inv', label: 'On UPDATE: DEL cache key', caption: 'Write DB first, then invalidate' },
    ],
    edges: [
      { from: 'read', to: 'hit', label: 'hit' },
      { from: 'read', to: 'miss', label: 'miss' },
      { from: 'miss', to: 'lock' },
      { from: 'lock', to: 'db' },
      { from: 'db', to: 'set' },
    ],
  },
  {
    id: 'sd-http-status-map',
    topicId: 'sd-rest-api-design',
    type: 'comparison',
    title: 'HTTP Status Codes — Design Reference',
    description: 'Common status codes for REST API design and when to use each.',
    memoryTip: '200 has body. 201 has Location. 202 is async. 204 has no body. 401 = who? 403 = not allowed. 422 = business rule. 429 = rate limit (add Retry-After).',
    columns: [
      {
        label: '2xx — Success',
        nodes: [
          { id: '200', label: '200 OK', caption: 'GET, PATCH response with body' },
          { id: '201', label: '201 Created', caption: 'POST → new resource + Location header' },
          { id: '202', label: '202 Accepted', caption: 'Async — not yet processed; return poll URL' },
          { id: '204', label: '204 No Content', caption: 'DELETE, PATCH with no response body' },
        ],
      },
      {
        label: '4xx / 5xx — Errors',
        nodes: [
          { id: '400', label: '400 Bad Request', caption: 'Malformed syntax, missing required field' },
          { id: '401', label: '401 Unauthorized', caption: 'Not authenticated — login first' },
          { id: '403', label: '403 Forbidden', caption: 'Authenticated but not allowed' },
          { id: '409', label: '409 Conflict', caption: 'Duplicate key, ETag mismatch' },
          { id: '422', label: '422 Unprocessable', caption: 'Business rule violation' },
          { id: '429', label: '429 Too Many Requests', caption: 'Rate limited — include Retry-After' },
          { id: '500', label: '500 Internal Error', caption: 'Server fault — never leak stack trace' },
        ],
      },
    ],
  },
  {
    id: 'sd-consistent-hashing-ring',
    topicId: 'sd-consistent-hashing',
    type: 'comparison',
    title: 'Consistent Hashing vs Modulo Hashing',
    description: 'Why consistent hashing is preferred for distributed caches and storage.',
    memoryTip: 'Modulo: adding 1 node remaps ~80% of keys. Consistent hashing: only ~1/N keys move.',
    columns: [
      {
        label: 'Modulo hashing  (hash % N)',
        nodes: [
          { id: 'm1', label: 'Simple to implement', caption: 'hash(key) % N' },
          { id: 'm2', label: 'Resize catastrophe', caption: '4→5 nodes: ~80% of keys remap' },
          { id: 'm3', label: 'Failure ripple', caption: 'Node dies → all its keys reassign to one neighbour' },
        ],
      },
      {
        label: 'Consistent hashing (ring)',
        nodes: [
          { id: 'c1', label: 'Keys and nodes on a ring', caption: 'Key → first node clockwise' },
          { id: 'c2', label: 'Add node: ~1/N keys move', caption: '4→5 nodes: ~20% remapped' },
          { id: 'c3', label: 'Remove node: keys to successor', caption: 'Failure spreads across ring neighbours' },
          { id: 'c4', label: 'Virtual nodes (100–150)', caption: 'Even distribution + spread on failure' },
          { id: 'c5', label: 'Used by: Cassandra, Dynamo', caption: 'Riak, Memcached ketama, CDN POPs' },
        ],
      },
    ],
  },
];
