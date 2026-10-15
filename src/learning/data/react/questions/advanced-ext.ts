import type { InterviewQuestion } from '../../../types';

export const reactAdvancedExtQuestions: InterviewQuestion[] = [
  {
    id: 'q-react-websocket-reconnect',
    technology: 'react',
    question: 'How do you implement a WebSocket connection in React with automatic reconnection and message queue?',
    category: 'Real-time & Streaming',
    difficulty: 'senior',
    quickAnswer: 'Custom useWebSocket hook: useRef for socket, useEffect for connect/cleanup, exponential backoff on close, message queue in useRef for offline buffering.',
    interviewAnswer: `Architecture:

1. **Custom hook (useWebSocket)**: manages the entire lifecycle.
2. **useRef for socket**: WebSocket instance stored in ref (stable across renders, no re-render on assignment).
3. **useEffect with cleanup**: connect in the effect, ws.close() in the cleanup — prevents leaks.
4. **Exponential backoff**: on close/error, reconnect after 1s, 2s, 4s, 8s... max 30s. Reset counter on successful open.
5. **Message queue**: if the socket is not open, queue messages in a useRef array. On reconnect (onopen), flush the queue.
6. **Heartbeat**: send a ping every 30s. If no pong within 5s, close and reconnect. This detects "zombie" connections where TCP thinks it's connected but the server is gone.
7. **Type-safe messages**: define a discriminated union for message types: { type: 'price_update', payload: { symbol: string, price: number } } | { type: 'notification', payload: { message: string } }.
8. **Integration with React state**: useCallback for the send function. useState or useReducer for the latest message. Optionally update TanStack Query cache directly from WebSocket messages.

Banking use case: Live price feed for a trading dashboard. 50+ symbols updating every 100ms. WebSocket connection must survive network switches (WiFi → mobile) and proxy timeouts.`,
    codeExample: `function useWebSocket<T>(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const queueRef = useRef<string[]>([]);
  const retryRef = useRef(0);
  const [messages, setMessages] = useState<T[]>([]);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');

  useEffect(() => {
    let mounted = true;
    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      if (mounted) setStatus('connecting');

      ws.onopen = () => {
        if (mounted) setStatus('open');
        retryRef.current = 0;
        // Flush queued messages
        while (queueRef.current.length > 0) {
          ws.send(queueRef.current.shift()!);
        }
      };
      ws.onmessage = (e) => {
        if (mounted) setMessages(prev => [...prev.slice(-99), JSON.parse(e.data)]);
      };
      ws.onclose = () => {
        if (!mounted) return;
        setStatus('closed');
        const delay = Math.min(1000 * 2 ** retryRef.current, 30_000);
        retryRef.current++;
        setTimeout(connect, delay);
      };
    }
    connect();
    return () => { mounted = false; wsRef.current?.close(); };
  }, [url]);

  const send = useCallback((data: unknown) => {
    const msg = JSON.stringify(data);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    } else {
      queueRef.current.push(msg);  // buffer while disconnected
    }
  }, []);

  return { messages, status, send };
}`,
    keyTerms: ['useRef for socket', 'exponential backoff', 'message queue', 'heartbeat', 'cleanup on unmount'],
    conceptsTested: ['Real-time patterns', 'Hook architecture'],
    strongAnswerKeywords: ['useRef stable socket', 'reconnect with backoff', 'message queue for offline', 'heartbeat ping/pong', 'cleanup prevents leaks'],
    whatIsBeingTested: ['Production WebSocket implementation'],
    interviewerIntent: 'Tests if the candidate has built real-time features in production — reconnection and queue handling separates production code from tutorials.',
  },

  {
    id: 'q-react-file-upload-gb',
    technology: 'react',
    question: 'How would you build a UI to upload a 5GB file in a React banking application?',
    category: 'Real-time & Streaming',
    difficulty: 'senior',
    quickAnswer: 'Chunked upload: file.slice() into 5MB chunks, upload in parallel with progress tracking, resume on failure from last successful chunk, Web Worker for hashing.',
    interviewAnswer: `Never upload a 5GB file in a single request — one failure restarts from zero.

**Architecture:**
1. **file.slice(start, end)**: split the File into chunks (5MB each = 1000 chunks for 5GB).
2. **Session ID**: create a unique upload session. Server tracks which chunks have been received.
3. **Parallel upload**: upload 3-5 chunks concurrently using a promise pool (not all 1000 at once).
4. **Progress tracking**: XMLHttpRequest.upload.onprogress per chunk + aggregate progress across all chunks.
5. **Resume**: on failure/page reload, GET /upload/status?session=abc → returns completed chunk indices → skip them.
6. **Integrity**: compute SHA-256 hash per chunk in a Web Worker (don't block UI). Server verifies hash.
7. **Assembly**: after all chunks uploaded, POST /upload/complete → server assembles chunks into final file.
8. **UX**: show per-chunk progress, overall progress, estimated time remaining, pause/resume/cancel buttons.

**tus protocol**: open standard for resumable uploads. tus-js-client library handles all resume/retry logic out of the box.

**Download**: Range requests for partial download. StreamSaver.js streams to disk (avoids holding 5GB in memory).`,
    keyTerms: ['file.slice', 'chunked upload', 'parallel chunks', 'resume from failure', 'Web Worker hashing', 'tus protocol'],
    conceptsTested: ['File handling', 'Performance under scale'],
    strongAnswerKeywords: ['file.slice chunks', 'parallel upload 3-5 concurrent', 'resume from last chunk', 'Web Worker for hashing', 'tus protocol'],
    whatIsBeingTested: ['Ability to handle edge-case performance scenarios'],
    interviewerIntent: 'Banking apps handle bulk payment files, regulatory submissions, statement uploads — all potentially GB-sized.',
  },

  {
    id: 'q-react-token-storage',
    technology: 'react',
    question: 'Where should you store JWT tokens in a React banking application — localStorage, sessionStorage, or httpOnly cookies?',
    category: 'Security',
    difficulty: 'senior',
    quickAnswer: 'httpOnly Secure SameSite=Strict cookies — invisible to JavaScript (XSS-proof). NEVER localStorage (XSS can steal tokens). Use withCredentials: true in Axios.',
    interviewAnswer: `**The answer is httpOnly cookies. Always.**

**localStorage** (❌ for tokens): any JavaScript on the page can read it. A single XSS vulnerability (even from a third-party script) can steal the JWT with localStorage.getItem("token") and send it to an attacker's server. In banking, this is a compliance violation.

**sessionStorage** (❌ for tokens): same XSS vulnerability as localStorage. Only difference: cleared when the tab closes.

**httpOnly cookies** (✅): the server sets the cookie with Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict.
- HttpOnly: JavaScript CANNOT read it (document.cookie returns nothing for httpOnly cookies).
- Secure: only sent over HTTPS.
- SameSite=Strict: not sent on cross-site requests (CSRF protection).
- The browser automatically includes it in every request to the same origin.

**CSRF protection with cookies**: SameSite=Strict prevents most CSRF. For additional protection, use the double-submit pattern: server sends a CSRF token in a non-httpOnly cookie, React reads it and sends it as a custom header (X-CSRF-Token). Server validates the header matches the cookie.

**Axios setup**: set withCredentials: true on the Axios instance so httpOnly cookies are sent with every request. No need to manually attach the token.`,
    keyTerms: ['httpOnly', 'Secure', 'SameSite', 'XSS', 'CSRF', 'withCredentials'],
    conceptsTested: ['Security fundamentals'],
    strongAnswerKeywords: ['httpOnly invisible to JS', 'Secure HTTPS only', 'SameSite=Strict', 'NEVER localStorage for tokens', 'withCredentials: true'],
    whatIsBeingTested: ['Security awareness for financial applications'],
    interviewerIntent: 'This is a pass/fail question for banking interviews. Answering "localStorage" is an instant red flag.',
  },

  {
    id: 'q-react-testing-strategy',
    technology: 'react',
    question: 'How do you structure a testing strategy for a React banking application? What tools and coverage targets?',
    category: 'Testing',
    difficulty: 'senior',
    quickAnswer: 'Test pyramid: 70% unit (RTL + MSW), 20% integration (API contract tests), 10% E2E (Playwright critical flows). 80%+ coverage, 95%+ on payment paths. Lighthouse CI for perf.',
    interviewAnswer: `**Test pyramid for banking:**

**Layer 1 — Unit/Component (70%):** React Testing Library + Vitest/Jest.
- Test components by user interaction: render → find by role → click → assert visible output.
- Mock API with MSW (Mock Service Worker) — intercepts at the network level, more realistic.
- Test: form validation, error states, loading states, RBAC (Authorize component), conditional rendering.
- Coverage: 80%+ overall, 95%+ on payment/transfer components.

**Layer 2 — Integration/API (20%):** 
- Contract tests: verify frontend API calls match backend API contracts (OpenAPI spec).
- TanStack Query tests: verify query keys, cache invalidation, retry behavior.
- Redux store tests: dispatch action → assert state change (if using Redux).

**Layer 3 — E2E (10%):** Playwright.
- Test only CRITICAL journeys: login → view accounts → create transfer → review → confirm → verify balance.
- Network interception: mock external services, test error scenarios.
- Visual regression: screenshot comparison for UI regressions (Percy or Playwright snapshots).
- Run in CI: nightly or on merge to main (too slow for every PR).

**CI pipeline:**
1. Lint + typecheck (fast gate, every PR).
2. Unit/component tests with coverage (fast gate, every PR).
3. Bundle size check (fail if delta > 50KB).
4. Lighthouse CI (fail if LCP > 3s).
5. E2E tests (nightly or on merge).

**Tools:** Vitest (fast, Vite-native), MSW (network mocking), Playwright (E2E), Istanbul/V8 (coverage), Lighthouse CI (perf).`,
    keyTerms: ['test pyramid', 'RTL', 'MSW', 'Playwright', 'coverage thresholds', 'CI pipeline', 'visual regression'],
    conceptsTested: ['Testing architecture', 'CI/CD integration'],
    strongAnswerKeywords: ['70/20/10 pyramid', 'MSW over jest.mock', 'Playwright for E2E', '95% on payment paths', 'Lighthouse CI in pipeline'],
    whatIsBeingTested: ['Senior-level testing strategy'],
    interviewerIntent: 'Banking apps require rigorous testing — tests if candidate can design a testing strategy, not just write individual tests.',
  },

  {
    id: 'q-react-sse-vs-websocket',
    technology: 'react',
    question: 'When would you use Server-Sent Events (SSE) vs WebSocket for a banking real-time dashboard?',
    category: 'Real-time & Streaming',
    difficulty: 'advanced',
    quickAnswer: 'SSE for one-way server→client (notifications, live logs). WebSocket for bidirectional (chat, collaborative editing). SSE auto-reconnects and works over HTTP/2.',
    interviewAnswer: `**SSE (Server-Sent Events):**
- One-way: server → client only. Client cannot send messages.
- Auto-reconnect: EventSource reconnects automatically with Last-Event-ID.
- HTTP/2: multiplexes with other requests on the same connection.
- Simple: just GET request, text/event-stream content type.
- Use for: payment notifications, live audit logs, price alerts (receive-only), live deployment status.

**WebSocket:**
- Bidirectional: both client and server can send messages anytime.
- Binary support: ArrayBuffer for file transfers.
- No auto-reconnect: you must implement reconnection logic.
- Use for: chat, collaborative document editing, real-time order books (send subscribe/unsubscribe commands), interactive trading.

**Banking decision matrix:**
| Feature | SSE | WebSocket |
|---------|-----|-----------|
| Payment notifications | ✅ Best | Overkill |
| Live balance updates | ✅ Simple | ✅ Works |
| Chat with support | ❌ One-way | ✅ Required |
| Trading order book | ❌ Need subscribe | ✅ Required |
| Audit log streaming | ✅ Best | Overkill |

**Hybrid**: use SSE for notifications + live data (simpler, auto-reconnect), use WebSocket only where bidirectional is required (chat, interactive features).`,
    keyTerms: ['SSE', 'EventSource', 'WebSocket', 'auto-reconnect', 'Last-Event-ID', 'bidirectional', 'HTTP/2'],
    conceptsTested: ['Real-time architecture decisions'],
    strongAnswerKeywords: ['SSE one-way auto-reconnect', 'WebSocket bidirectional', 'SSE for notifications', 'WebSocket for chat', 'HTTP/2 multiplexing'],
    whatIsBeingTested: ['Choosing the right technology for the use case'],
    interviewerIntent: 'Tests architectural judgment — not everything needs WebSocket. SSE is simpler and sufficient for most banking real-time features.',
  },

  {
    id: 'q-react-babel-treeshaking',
    technology: 'react',
    question: 'Explain the React build pipeline: JSX compilation, tree shaking, code splitting, and how you optimize bundle size.',
    category: 'Internals & Build',
    difficulty: 'advanced',
    quickAnswer: 'JSX → jsx() calls (Babel/SWC). Tree shaking removes unused exports (ESM only). Code splitting via React.lazy. Analyze with rollup-plugin-visualizer. Target: <200KB initial JS.',
    interviewAnswer: `**Build pipeline steps:**

1. **JSX Compilation** (Babel/SWC): <Button/> → jsx(Button, {}). Automatic runtime (React 17+) auto-imports jsx — no manual import React. SWC is 20-70x faster than Babel (Rust-based).

2. **TypeScript Compilation**: types stripped, enums converted, decorators transformed.

3. **Tree Shaking** (Rollup/Webpack): removes unused exports. ONLY works with ESM (import/export), NOT CommonJS (require). import { debounce } from 'lodash-es' → only debounce included. import _ from 'lodash' → entire 70KB library included.

4. **Code Splitting**: React.lazy(() => import('./AccountPage')) creates a separate chunk. Loaded on demand when the route is visited. Vite: manualChunks to separate vendor libraries.

5. **Minification** (Terser/esbuild): removes whitespace, shortens variable names, eliminates dead code.

**Optimization checklist:**
- Bundle analyzer: rollup-plugin-visualizer or webpack-bundle-analyzer.
- Replace large libraries: moment.js (70KB) → date-fns (tree-shakeable). lodash → lodash-es.
- Dynamic imports for heavy components: charts, PDF viewers, rich text editors.
- Compression: gzip/brotli at CDN/server level.
- Target: <200KB initial JS (first paint), total <1MB.`,
    keyTerms: ['JSX transform', 'tree shaking', 'ESM vs CJS', 'code splitting', 'manualChunks', 'bundle analyzer'],
    conceptsTested: ['Build tooling knowledge'],
    strongAnswerKeywords: ['jsx() automatic runtime', 'tree shaking ESM only', 'React.lazy code split', 'bundle analyzer', 'lodash-es over lodash'],
    whatIsBeingTested: ['Understanding of the full build pipeline'],
    interviewerIntent: 'Senior engineers own the build — tests if candidate understands what happens between writing JSX and the browser loading JavaScript.',
  },

  {
    id: 'q-react-cdn-caching',
    technology: 'react',
    question: 'How do you set up CDN caching for a React SPA so users always get the latest version?',
    category: 'Internals & Build',
    difficulty: 'advanced',
    quickAnswer: 'index.html: Cache-Control no-cache (always fetch latest). JS/CSS with content hashes: max-age=1y immutable. CDN invalidation on deploy for index.html only.',
    interviewAnswer: `**The two-layer caching strategy:**

**index.html** (the entry point):
- Cache-Control: no-cache, no-store, must-revalidate
- WHY: index.html contains <script src="app.abc123.js">. On every deploy, the hash changes. If index.html is cached, users load stale JS references.

**Hashed assets** (JS, CSS, images):
- Cache-Control: public, max-age=31536000, immutable
- WHY: file names include content hashes (app.abc123.js). The hash changes when content changes → the browser fetches the new file. Old cached files with old hashes are never requested again.
- immutable tells the browser "don't even revalidate — this hash IS the version."

**Deploy flow:**
1. Build: generates new hashed assets.
2. Upload assets to CDN (S3 + CloudFront, Cloudflare, etc.).
3. Upload new index.html (references new hashes).
4. Invalidate CDN cache for index.html ONLY (fast, one file).

**Result:** First visit → fetch index.html (small, fast) + fetch app.abc123.js. Repeat visit → revalidate index.html (304 not modified or new version) → app.abc123.js from cache (no network request).`,
    keyTerms: ['content hash', 'Cache-Control', 'immutable', 'no-cache', 'CDN invalidation', 'deploy strategy'],
    conceptsTested: ['Deployment and caching'],
    strongAnswerKeywords: ['index.html no-cache', 'assets immutable + hash', 'CDN invalidation for index.html only', 'two-layer strategy'],
    whatIsBeingTested: ['Production deployment knowledge'],
    interviewerIntent: 'Caching wrong = users get stale versions. Caching right = instant loads. Tests deployment maturity.',
  },

  {
    id: 'q-react-virtual-scroll-100k',
    technology: 'react',
    question: 'How do you render a table with 100,000 rows in React without the browser freezing?',
    category: 'Performance',
    difficulty: 'senior',
    quickAnswer: 'Virtualization: TanStack Virtual renders only visible rows (~30 DOM nodes). Combined with windowed rendering, memo rows, and server-side pagination for data fetching.',
    interviewAnswer: `**Never render 100K DOM nodes.** The browser can handle ~1000 nodes before it starts to lag.

**Solution: Virtualization (TanStack Virtual or react-window)**
- Only render the rows visible in the viewport (~30 at a time) plus a small overscan buffer (~10 above/below).
- A container div has the total height (100K × row_height), so the scrollbar behaves correctly.
- As the user scrolls, the visible window slides — old rows are unmounted, new rows are mounted.
- Result: constant ~40 DOM nodes regardless of data size. Initial render <50ms instead of 5000ms.

**Additional optimizations:**
1. React.memo on row components — prevent re-render when parent re-renders but row data unchanged.
2. Stable key={item.id} — not index.
3. Fixed row heights (estimateSize: () => 48) — variable heights require measuring, which is slower.
4. Server-side pagination — don't load 100K rows at once. Fetch pages of 50 as the user scrolls (infinite scroll + virtualization combo).
5. Column virtualization — for wide tables with 50+ columns, also virtualize horizontally.

**Why not just paginate?**
Pagination is simpler but breaks the user experience for "scroll through all" use cases (trading logs, audit trails). Virtualization gives infinite scroll UX with 40-node performance.`,
    codeExample: `import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ data }: { data: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,  // 100,000 items
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,  // fixed row height
    overscan: 10,  // render 10 extra rows above/below
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(vRow => {
          const txn = data[vRow.index];
          return (
            <MemoizedRow
              key={txn.id}
              txn={txn}
              style={{
                position: 'absolute',
                top: 0,
                transform: \`translateY(\${vRow.start}px)\`,
                height: vRow.size,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const MemoizedRow = memo(function Row({ txn, style }: RowProps) {
  return (
    <div style={style} className="flex items-center border-b px-4">
      <span className="w-24">{txn.date}</span>
      <span className="flex-1">{txn.description}</span>
      <span className="w-20 text-right">{txn.amount}</span>
    </div>
  );
});`,
    keyTerms: ['virtualization', 'TanStack Virtual', 'overscan', 'estimateSize', 'memo rows', 'column virtualization'],
    conceptsTested: ['Performance at scale'],
    strongAnswerKeywords: ['only render visible rows', 'TanStack Virtual', 'overscan buffer', 'memo rows', 'server-side pagination for data', 'constant DOM nodes'],
    whatIsBeingTested: ['Handling extreme data volumes in the UI'],
    interviewerIntent: 'Banking dashboards can have massive datasets — tests whether candidate knows virtualization vs naive rendering.',
  },
];
