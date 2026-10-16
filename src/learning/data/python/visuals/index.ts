import type { LearningVisual } from '../../../types';

export const pythonVisuals: LearningVisual[] = [
  {
    id: 'python-collections-map',
    topicId: 'python-lists-dicts-sets',
    title: 'Python Collections Decision Map',
    type: 'decision',
    description: 'Choose the right collection type for the job.',
    nodes: [
      { id: 'start', label: 'What do you need?' },
      { id: 'ordered', label: 'Ordered sequence → list', topicId: 'python-lists-dicts-sets' },
      { id: 'lookup', label: 'Key → value lookup → dict', topicId: 'python-lists-dicts-sets' },
      { id: 'unique', label: 'Unique membership → set', topicId: 'python-lists-dicts-sets' },
      { id: 'immutable', label: 'Immutable record / dict key → tuple', topicId: 'python-lists-dicts-sets' },
    ],
    edges: [
      { from: 'start', to: 'ordered' },
      { from: 'start', to: 'lookup' },
      { from: 'start', to: 'unique' },
      { from: 'start', to: 'immutable' },
    ],
    memoryTip: 'list = ordered, dict = lookup, set = unique, tuple = immutable.',
  },
  {
    id: 'python-dsa-choices',
    topicId: 'python-hash-maps',
    title: 'DSA Pattern Choice',
    type: 'decision',
    description: 'Pick a pattern by the problem signal.',
    nodes: [
      { id: 'freq', label: 'Frequency / duplicates / top-k → Counter or dict', topicId: 'python-hash-maps' },
      { id: 'sorted', label: 'Sorted array / pair sum → two pointers', topicId: 'python-two-pointers' },
      { id: 'subarray', label: 'Subarray / substring → sliding window', topicId: 'python-two-pointers' },
      { id: 'balance', label: 'Balanced brackets / LIFO → stack', topicId: 'python-stacks-queues' },
      { id: 'fifo', label: 'Process in order / BFS → deque', topicId: 'python-stacks-queues' },
      { id: 'hierarchy', label: 'Hierarchy / ordered lookup → tree / BST', topicId: 'python-trees' },
    ],
    memoryTip: 'Signals → structures: duplicates → Counter, sorted → two pointers, subarray → sliding window, brackets → stack, hierarchy → tree.',
  },
  {
    id: 'python-concurrency-choice',
    topicId: 'python-concurrency',
    title: 'Concurrency Decision Matrix',
    type: 'comparison',
    description: 'Which concurrency model for which workload.',
    columns: [
      {
        label: 'I/O-bound',
        nodes: [
          { id: 'io1', label: 'Many API calls' },
          { id: 'io2', label: 'Network / disk waits' },
          { id: 'io3', label: 'asyncio or ThreadPoolExecutor' },
          { id: 'io4', label: 'GIL released during I/O' },
        ],
      },
      {
        label: 'CPU-bound',
        nodes: [
          { id: 'cpu1', label: 'Heavy computation' },
          { id: 'cpu2', label: 'Data transformation' },
          { id: 'cpu3', label: 'ProcessPoolExecutor' },
          { id: 'cpu4', label: 'True parallelism across cores' },
        ],
      },
      {
        label: 'Web server',
        nodes: [
          { id: 'web1', label: 'FastAPI / ASGI' },
          { id: 'web2', label: 'async/await endpoints' },
          { id: 'web3', label: 'asyncio event loop' },
          { id: 'web4', label: 'Many concurrent connections' },
        ],
      },
    ],
    memoryTip: 'I/O → asyncio/threads. CPU → processes. Web → asyncio.',
  },
  {
    id: 'python-fastapi-layers',
    topicId: 'python-rest-apis',
    title: 'FastAPI Clean Architecture Layers',
    type: 'flow',
    description: 'Request flows through layers; each layer is replaceable.',
    nodes: [
      { id: 'route', label: 'Router', topicId: 'python-rest-apis' },
      { id: 'schema', label: 'Pydantic validation', topicId: 'python-rest-apis' },
      { id: 'service', label: 'Service (business logic)', topicId: 'python-clean-code' },
      { id: 'repo', label: 'Repository (data access)', topicId: 'python-clean-code' },
      { id: 'db', label: 'Database / external API' },
      { id: 'response', label: 'Response model', topicId: 'python-rest-apis' },
    ],
    edges: [
      { from: 'route', to: 'schema' },
      { from: 'schema', to: 'service' },
      { from: 'service', to: 'repo' },
      { from: 'repo', to: 'db' },
      { from: 'service', to: 'response' },
    ],
    memoryTip: 'Route → Schema → Service → Repository → DB. Tests replace Repository with fakes.',
  },
];
