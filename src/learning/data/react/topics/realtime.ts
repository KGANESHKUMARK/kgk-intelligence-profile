import type { LearningTopic } from '../../../types';

export const reactRealtimeTopics: LearningTopic[] = [
  {
    id: 'react-websocket',
    technology: 'react',
    title: 'WebSocket & Live Data Streams',
    category: 'Real-time & Streaming',
    slug: 'react-websocket',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'WebSocket opens a persistent two-way connection between browser and server — ideal for live prices, notifications, and chat. In React, manage the connection in a custom hook with reconnection logic.',
    mentalModel:
      'HTTP = request → response → done (like sending a letter). WebSocket = phone call that stays open — both sides can talk anytime without reconnecting.',
    memoryTip:
      'new WebSocket(url) → onopen, onmessage, onclose, onerror. useRef for the socket instance. useEffect cleanup calls ws.close(). Reconnect with exponential backoff.',
    keyTerms: ['WebSocket', 'SSE', 'EventSource', 'reconnection', 'exponential backoff', 'heartbeat', 'binary frames', 'Socket.IO'],
    interviewAnswer: `WebSocket provides full-duplex communication over a single TCP connection. Unlike HTTP polling (which creates a new connection every N seconds), WebSocket keeps one connection open — ideal for live stock prices, payment notifications, chat, and real-time dashboards.

React pattern: (1) Create the WebSocket in a custom hook (useWebSocket). (2) Store the socket in useRef (stable across renders). (3) Set up event handlers in useEffect. (4) Cleanup: close the socket in the effect's cleanup function. (5) Reconnection: on close/error, reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s). (6) Heartbeat: send a ping every 30s to keep the connection alive through proxies/load balancers.

SSE (Server-Sent Events) is the simpler alternative when you only need server→client push (one-way). EventSource auto-reconnects, supports Last-Event-ID for resuming, and works over HTTP/2. Use SSE for notifications, live logs. Use WebSocket for bidirectional communication (chat, collaborative editing).`,
    codeExample: `function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const retryRef = useRef(0);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus('connecting');

      ws.onopen = () => {
        setStatus('open');
        retryRef.current = 0;  // reset backoff on success
      };
      ws.onmessage = (event) => {
        setLastMessage(JSON.parse(event.data));
      };
      ws.onclose = () => {
        setStatus('closed');
        // Exponential backoff: 1s, 2s, 4s, 8s... max 30s
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current++;
        setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();  // triggers onclose → reconnect
    }

    connect();
    return () => { wsRef.current?.close(); };
  }, [url]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { lastMessage, status, send };
}

// Usage: live stock prices
function LivePrices() {
  const { lastMessage, status } = useWebSocket('wss://api.bank.com/prices');
  // Update TanStack Query cache directly from WebSocket
  useEffect(() => {
    if (lastMessage) {
      queryClient.setQueryData(['price', lastMessage.symbol], lastMessage);
    }
  }, [lastMessage]);
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Creating a new WebSocket on every render — use useRef to store the instance.',
      'No reconnection logic — network blips silently disconnect. Always implement backoff.',
      'No cleanup in useEffect — WebSocket stays open when component unmounts (memory leak).',
      'Polling with setInterval when WebSocket or SSE would be more efficient.',
      'Not handling binary data — WebSocket supports ArrayBuffer for file transfers.',
    ],
    seniorInsight: 'In banking: live prices via WebSocket, payment notifications via SSE. Combine WebSocket with TanStack Query: WebSocket pushes updates, setQueryData updates the cache — no polling, instant UI updates, and TanStack Query still handles caching/refetching for non-realtime data.',
    aiAwareness: {
      strongAnswerShouldMention: ['useRef for socket', 'useEffect cleanup', 'exponential backoff', 'SSE vs WebSocket', 'heartbeat', 'binary frames'],
      weakAnswer: 'WebSocket is for real-time data.',
      likelyFollowUp: ['When would you use SSE instead of WebSocket?', 'How do you handle reconnection?', 'How do you integrate WebSocket with TanStack Query?'],
    },
    relatedTopics: ['react-tanstack-query', 'react-useeffect'],
    nextTopics: ['react-infinite-scroll'],
    references: [
      { title: 'MDN WebSocket API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket', source: 'MDN', type: 'documentation' },
    ],
  },

  {
    id: 'react-infinite-scroll',
    technology: 'react',
    title: 'Infinite Scroll, Pagination & Virtual Lists',
    category: 'Real-time & Streaming',
    slug: 'react-infinite-scroll',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Infinite scroll loads the next page when the user nears the bottom — IntersectionObserver triggers fetch. Virtual lists render only visible rows — TanStack Virtual for 100K+ items.',
    mentalModel:
      'Traditional pagination = flip pages (button click). Infinite scroll = bottomless feed (auto-load). Virtual list = window that slides over a huge array, rendering only ~30 DOM nodes.',
    memoryTip:
      'IntersectionObserver + useInfiniteQuery = infinite scroll. TanStack Virtual = virtualization. Cursor-based > offset-based (handles inserts/deletes during scroll).',
    keyTerms: ['IntersectionObserver', 'useInfiniteQuery', 'cursor pagination', 'offset pagination', 'virtual scroll', 'TanStack Virtual', 'overscan'],
    interviewAnswer: `Three patterns for large lists:

**1. Paginated (button click)**: Traditional page buttons. useQuery({ queryKey: ['txns', page] }). Simple, good for: search results, admin tables with page numbers.

**2. Infinite scroll (auto-load)**: IntersectionObserver on a sentinel element at the bottom. When visible, call fetchNextPage(). useInfiniteQuery with getNextPageParam for cursor-based pagination. Good for: social feeds, transaction history, chat messages.

**3. Virtual scroll (render visible only)**: TanStack Virtual renders only the rows visible in the viewport (~30 DOM nodes for 100K items). Mandatory when total items > 1000 and you have all data client-side. Combine with infinite scroll: fetch pages on scroll, virtualize the combined data.

Cursor vs Offset pagination: Offset (LIMIT 50 OFFSET 200) breaks when rows are inserted/deleted during scrolling — you skip or duplicate items. Cursor (WHERE created_at < :lastSeen ORDER BY created_at DESC LIMIT 50) is stable — always shows the correct next page.`,
    codeExample: `// Infinite scroll with IntersectionObserver + useInfiniteQuery
function TransactionFeed({ accountId }: { accountId: string }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['transactions', accountId],
    queryFn: ({ pageParam }) =>
      api.get(\`/accounts/\${accountId}/transactions\`, {
        params: { cursor: pageParam, limit: 50 },
      }).then(r => r.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });

  // IntersectionObserver triggers fetchNextPage
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: '200px' }  // trigger 200px before reaching bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allTxns = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <div>
      {allTxns.map(txn => <TransactionRow key={txn.id} txn={txn} />)}
      <div ref={sentinelRef} />  {/* invisible sentinel */}
      {isFetchingNextPage && <Spinner />}
    </div>
  );
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Using scroll event listener instead of IntersectionObserver — scroll events fire 60+ times/sec, IO fires once.',
      'Offset pagination for infinite scroll — cursor-based is stable across inserts/deletes.',
      'Rendering 10,000 DOM nodes instead of virtualizing — freezes the browser.',
      'Not memoizing row components — every new page triggers re-render of ALL rows.',
    ],
    seniorInsight: 'Banking transaction history: infinite scroll with cursor pagination (sorted by date DESC). Each row memoized with React.memo. If the user needs to search/filter across ALL transactions, use server-side filtering — never load 100K transactions into the browser.',
    aiAwareness: {
      strongAnswerShouldMention: ['IntersectionObserver', 'useInfiniteQuery', 'cursor vs offset', 'TanStack Virtual', 'rootMargin for early trigger'],
      weakAnswer: 'Just use scroll event and load more data.',
      likelyFollowUp: ['Why cursor over offset?', 'How does virtualization work?', 'How do you combine infinite scroll with virtualization?'],
    },
    prerequisites: ['react-tanstack-query'],
    relatedTopics: ['react-virtualization', 'react-pagination-cursor'],
    references: [
      { title: 'TanStack Virtual', url: 'https://tanstack.com/virtual', source: 'tanstack.com', type: 'official' },
    ],
  },

  {
    id: 'react-file-upload',
    technology: 'react',
    title: 'Large File Upload & Download (Chunked, Resumable)',
    category: 'Real-time & Streaming',
    slug: 'react-file-upload',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'For GB-sized files, split into chunks (5MB each), upload in parallel with progress tracking, and resume from the last successful chunk on failure.',
    mentalModel:
      'Uploading a 2GB file in one HTTP request = one failure restarts from zero. Chunked upload = split into 400 pieces, upload in parallel, resume from chunk #237 on failure.',
    memoryTip:
      'file.slice(start, end) → chunks. Upload each chunk with its index. Server assembles. Track progress per-chunk. Resume = skip already-uploaded chunks.',
    keyTerms: ['chunked upload', 'file.slice', 'resumable upload', 'tus protocol', 'XMLHttpRequest progress', 'Blob', 'Web Workers', 'ReadableStream'],
    interviewAnswer: `Handling GB-sized files in React:

**Upload:**
1. file.slice(start, end) splits the File into chunks (5MB each).
2. Upload each chunk with its index and a session ID: POST /upload/chunk?session=abc&index=5.
3. Track progress per-chunk: XMLHttpRequest.upload.onprogress or fetch + ReadableStream.
4. Parallel uploads: upload 3-5 chunks concurrently (Promise pool) for speed.
5. Resume: on failure, ask the server which chunks it has (GET /upload/status?session=abc), skip them.
6. Server reassembles chunks in order after the last chunk arrives.

**Download:**
1. Range requests: fetch with Range header to download in segments.
2. StreamSaver.js for streaming large files directly to disk (avoids holding the entire file in memory).
3. Blob URL + <a download> for smaller files.

**Performance:**
- Web Worker for hashing/checksumming chunks (don't block the UI thread).
- Show per-chunk and overall progress bars.
- Pause/resume buttons (cancel the current chunk fetch, resume from next unfinished chunk).

Tus protocol is the open standard for resumable uploads — libraries like tus-js-client handle all the resume logic.`,
    codeExample: `const CHUNK_SIZE = 5 * 1024 * 1024;  // 5MB chunks

async function uploadFile(file: File, onProgress: (pct: number) => void) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const sessionId = crypto.randomUUID();
  let uploaded = 0;

  // Check which chunks already exist (for resume)
  const { data: existing } = await api.get(\`/upload/status?session=\${sessionId}\`);
  const completedChunks = new Set(existing.chunks ?? []);

  for (let i = 0; i < totalChunks; i++) {
    if (completedChunks.has(i)) { uploaded++; continue; }  // skip already uploaded

    const start = i * CHUNK_SIZE;
    const chunk = file.slice(start, start + CHUNK_SIZE);
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('index', String(i));
    formData.append('total', String(totalChunks));
    formData.append('session', sessionId);
    formData.append('filename', file.name);

    await api.post('/upload/chunk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        const chunkProgress = (e.loaded / e.total!) / totalChunks;
        onProgress(((uploaded / totalChunks) + chunkProgress) * 100);
      },
    });
    uploaded++;
    onProgress((uploaded / totalChunks) * 100);
  }

  // Tell server to assemble the file
  await api.post(\`/upload/complete?session=\${sessionId}\`);
}

// Usage in component
function FileUploader() {
  const [progress, setProgress] = useState(0);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, setProgress);
  };
  return (
    <div>
      <input type="file" onChange={handleFile} />
      <progress value={progress} max={100} />
      <span>{progress.toFixed(1)}%</span>
    </div>
  );
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Uploading a 2GB file in a single POST — one timeout/failure restarts from zero.',
      'Holding the entire file in memory (FileReader.readAsArrayBuffer for the whole file) — use file.slice for chunks.',
      'No progress feedback — user thinks the app is frozen during large uploads.',
      'Blocking the UI thread with checksumming — use a Web Worker for hashing.',
      'Not implementing resume — a network blip at 95% forces restart from 0%.',
    ],
    seniorInsight: 'In banking: bulk statement upload, regulatory file submission, batch payment files. Chunked resumable upload is mandatory for files over 50MB. Use the tus protocol (tus.io) for production — it handles resume, retry, and progress out of the box.',
    aiAwareness: {
      strongAnswerShouldMention: ['file.slice for chunks', 'parallel upload', 'resume from last chunk', 'onUploadProgress', 'Web Worker for hashing', 'tus protocol'],
      weakAnswer: 'Just upload the file with fetch.',
      likelyFollowUp: ['How do you resume a failed upload?', 'How do you show accurate progress?', 'What about downloading large files?'],
    },
    relatedTopics: ['react-axios-http'],
    references: [
      { title: 'tus — open protocol for resumable uploads', url: 'https://tus.io/', source: 'tus.io', type: 'documentation' },
    ],
  },
];
