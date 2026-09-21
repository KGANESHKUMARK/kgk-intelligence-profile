import type { LearningTopic } from '../../../types';

export const reactPerformanceTopics: LearningTopic[] = [
  {
    id: 'react-react-memo',
    technology: 'react',
    title: 'React.memo & the Memoization Trinity',
    category: 'Performance',
    slug: 'react-react-memo',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'React.memo skips re-rendering a child when its props are shallow-equal; useMemo caches values and useCallback caches functions — a toolkit for eliminating unnecessary work, applied after measuring, never by default.',
    mentalModel:
      'React.memo is a bouncer at the child’s door: “same props as last time? then nobody gets in.” But inline objects/functions are new every render — the bouncer sees a stranger every time unless you stabilise them with useMemo/useCallback.',
    memoryTip:
      'React.memo = skip child render when props unchanged. useMemo = value. useCallback = function. All three are useless if props are new references every render.',
    keyTerms: ['React.memo', 'shallow compare', 'useMemo', 'useCallback', 'stable props', 're-render'],
    interviewAnswer:
      'A component re-renders when its state changes, when its context changes, or when its parent renders — regardless of whether its own props changed. React.memo wraps a component so it re-renders only when props are not shallow-equal to the previous props. For that guard to work, every prop must be reference-stable: primitives compare by value, but objects, arrays and functions created inline are new every render, so memo has no effect unless parents use useMemo/useCallback to stabilise them. useMemo caches a computed value (expensive derivations like filtering 100k transactions); useCallback returns a memoized function identity. All three are optimisations with real costs — memory, dependency correctness, stale-closure risk — so the senior workflow is measure (Profiler), identify the actual re-render source, fix the root cause (state placement, prop shape), then verify the render count dropped.',
    detailedExplanation:
      'The trinity works as a system: memo on the child is defeated by unstable props; stable props require memoization at the parent; memoization correctness depends on an honest dependency array. Two structural alternatives often beat memoization entirely: (1) move state down — a search input in the header should not live in the page component that renders the 10k-row grid; (2) lift content up — pass elements as children so the slow subtree never re-renders when unrelated state changes. In the transactions grid, memoized rows + stable callbacks + virtualization together cut a 900ms keystroke re-render to ~15ms; memo alone did nothing because the parent recreated the rows array inline every keystroke.',
    codeExample: `// Child: skip re-render when props are shallow-equal
const TxnRow = React.memo(function TxnRow({ txn, onOpen }: RowProps) {
  return <tr onClick={() => onOpen(txn.id)}>…</tr>;
});

// Parent: keep prop identities stable
const handleOpen = useCallback((id: string) => open(id), []);
const columns = useMemo(() => buildColumns(filters), [filters]);`,
    whyOutput:
      'Typing in the search box re-renders the page, but only the matching rows re-render: TxnRow is memoized, its txn objects are stable per row, and onOpen is a stable useCallback — the bouncer finds the same props and waves the row through.',
    commonMistakes: [
      'Wrapping everything in useMemo/useCallback "to be safe" — adds overhead and hides real bottlenecks.',
      'Memoizing a component but passing a new inline object/function prop — memo silently does nothing.',
      'Omitting dependencies from useMemo/useCallback arrays to "reduce reruns" — a stale-data bug factory.',
      'Reaching for memo before measuring — the Profiler shows which subtree actually re-renders.',
    ],
    seniorInsight:
      'The senior answer is a framework, not a hook: Measure (Profiler, why-did-you-render) → Find (which subtree, which prop) → Fix (state placement, memo, stable refs) → Verify (re-profile). Quote the numbers: "the grid re-rendered 40 times per keystroke; after memoizing rows and moving the query state into the toolbar, it renders once." That is a LEAD-level answer; "add useMemo" is not.',
    aiAwareness: {
      strongAnswerShouldMention: ['default re-render on parent render', 'shallow comparison', 'stable props', 'measure first', 'state placement'],
      weakAnswer: 'Use useMemo and useCallback everywhere to make React faster.',
      redFlags: ['No measurement step.', 'Not knowing memo is defeated by inline props.', 'Memoizing everything by default.'],
      likelyFollowUp: ['A memoized child still re-renders — why?', 'How do you verify an optimization actually worked?'],
    },
    prerequisites: ['react-state', 'react-reconciliation'],
    relatedTopics: ['react-virtualization', 'react-usememo-usecallback', 'react-ts-generics-hooks'],
    nextTopics: ['react-virtualization'],
    references: [
      { title: 'React.memo', url: 'https://react.dev/reference/react/memo', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-reconciliation',
    technology: 'react',
    title: 'Rendering & Reconciliation',
    category: 'Performance',
    slug: 'react-reconciliation',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Rendering means calling your component functions to get a new element tree; reconciliation diffs that tree against the previous one and commits the minimum DOM changes.',
    mentalModel:
      'Render = re-running your functions to get a new blueprint. Commit = applying only the blueprint’s diffs to the building. Re-rendering is cheap; the question is what gets committed.',
    memoryTip:
      'A component re-renders when: its state changes, its context changes, or its parent renders. Re-render ≠ DOM update. Reconciliation decides what actually changes.',
    keyTerms: ['render phase', 'commit phase', 'reconciliation', 'diffing', 'fiber', 're-render trigger', 'batching'],
    visualIds: ['react-reconciliation-decision'],
    interviewAnswer:
      'A re-render means React calls the component function to produce a new element tree — it does not mean the DOM changed. React then reconciles: it walks the old and new trees, compares element types and keys, and computes the minimal set of DOM mutations to apply in the commit phase. A component re-renders when its state or context changes, or when its parent re-renders (props be damned — new object props are not required; parent render alone re-renders children). React 18 batches all updates automatically, so multiple setState calls in one event produce one render pass. Understanding this pipeline is what separates "I added memo everywhere" from "I know why this subtree re-renders and how to stop it".',
    detailedExplanation:
      'The render phase (calling components, computing the new tree) must be pure and can be interrupted/restarted under concurrent React; the commit phase applies DOM mutations and runs effects synchronously. Keys drive child matching: same key + same type = update in place; different key = unmount old, mount new. That is why key misuse corrupts state. The Profiler visualises exactly this: which components rendered, why (props/state/hooks/parent), and how long the render phase took. In the NexusBank dashboard, a context change for theme re-renders every consumer — but reconciliation finds most subtrees unchanged and commits almost nothing; the cost was the wasted render, not the DOM work.',
    commonMistakes: [
      'Believing a re-render always touches the DOM — most re-renders commit nothing.',
      'Thinking a child re-renders only "when its props change" — parent render re-renders children regardless.',
      'Confusing Strict Mode double-render (dev-only) with a production performance problem.',
      'Attaching the Profiler only after "optimizing" — measure first, or you are guessing.',
    ],
    seniorInsight:
      'The interview question behind the question: "What causes a React component to re-render?" The complete answer has exactly three triggers — own state change, context change, parent render — plus useReducer/useSyncExternalStore subscriptions. Candidates who add "and forceUpdate/keys" show they have actually debugged re-renders rather than memorised a list.',
    aiAwareness: {
      strongAnswerShouldMention: ['render vs commit', 'three re-render triggers', 'batching', 'keys in diffing', 'Profiler'],
      weakAnswer: 'React re-renders when data changes and updates the DOM.',
      redFlags: ['Believing every re-render touches the DOM.', 'Not knowing the three re-render triggers.'],
      likelyFollowUp: ['Parent re-rendered but child props are identical — why did the child render, and how do you stop it?', 'What does the Profiler "why did this render" tell you?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-react-memo', 'react-lists-keys'],
    nextTopics: ['react-react-memo'],
    references: [
      { title: 'Render and Commit', url: 'https://react.dev/learn/render-and-commit', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-virtualization',
    technology: 'react',
    title: 'Virtualization for Large Lists',
    category: 'Performance',
    slug: 'react-virtualization',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Virtualization renders only the rows visible in the viewport (plus a small buffer), so a million-row dataset costs the DOM a few dozen nodes — data size and DOM size are decoupled.',
    mentalModel:
      'Pagination controls how much DATA crosses the network. Virtualization controls how much DOM exists. A million rows in memory is fine; 50,000 DOM rows is what kills the browser.',
    memoryTip:
      'Virtualization = render only what is visible (+ overscan). DOM nodes are the expensive thing, not records. Storing 50k records is fine; painting 50k rows is not.',
    keyTerms: ['windowing', 'viewport', 'overscan', 'DOM node count', 'scroll container', 'row height'],
    visualIds: ['react-data-vs-dom'],
    interviewAnswer:
      'Virtualization (windowing) renders only the visible slice of a list plus a small buffer, positioning rows absolutely inside a scroll container and swapping which rows are mounted as the user scrolls. A 100,000-row transaction table then renders ~30 DOM rows instead of 100,000 — the difference between a 60fps scroll and a frozen tab, because DOM size drives layout/paint cost and memory, not the size of the JavaScript array. It complements rather than replaces pagination: the server still pages data (network + memory), and virtualization keeps the DOM bounded within each page. Trade-offs: fixed row heights are easiest (variable heights need measurement), accessibility needs care (a virtualized table must still expose the full semantics to assistive tech), and SEO/finding-in-page do not see unrendered rows.',
    practicalExample:
      'The NexusBank Performance Lab loads a 100,000-row simulated transaction dataset. With virtualization OFF, mounting 100k rows takes seconds and scrolling stutters; with it ON, ~35 rows mount and scroll stays smooth. The lab also toggles memoization and simulated latency, showing that virtualization fixes the DOM, debouncing fixes the network, and memoization fixes re-renders — three different problems.',
    commonMistakes: [
      'Rendering all data because "the API returned it" — the array is fine; the DOM is the problem.',
      'Confusing virtualization with pagination — one is DOM, one is data transfer.',
      'Forgetting a stable key per row — virtualization remounts rows on scroll and index keys scramble state.',
      'Virtualizing a 200-row table — overhead without benefit; it pays off at thousands of rows.',
    ],
    seniorInsight:
      'The memory trick is the whole answer: "Pagination controls data transferred; virtualization controls DOM rendered." A senior engineer can also say when NOT to virtualize: small tables, or when the product needs full-text browser find/print — and knows the DOM-node-count metric (e.g. ~35 nodes vs 50,000) that proves the win.',
    aiAwareness: {
      strongAnswerShouldMention: ['windowing', 'visible rows + overscan', 'DOM cost vs data cost', 'stable keys', 'when NOT to virtualize'],
      weakAnswer: 'Virtualization makes big lists faster.',
      redFlags: ['Confusing virtualization with pagination.', 'No mention of row height or scroll container.'],
      likelyFollowUp: ['Virtualization vs pagination vs infinite scroll?', 'How do you handle variable row heights?'],
    },
    prerequisites: ['react-lists-keys', 'react-reconciliation'],
    relatedTopics: ['react-pagination-cursor', 'react-react-memo'],
    nextTopics: ['react-debounce-throttle'],
    references: [
      { title: 'react-window (virtualization)', url: 'https://react-window.vercel.app/', source: 'react-window', type: 'documentation' },
    ],
  },

  {
    id: 'react-debounce-throttle',
    technology: 'react',
    title: 'Debounce & Throttle',
    category: 'Performance',
    slug: 'react-debounce-throttle',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Debounce delays an action until input stops changing ("wait"); throttle caps how often an action can run ("limit") — both protect APIs and rendering from event storms.',
    mentalModel:
      'Debounce = wait for silence (search-as-you-type). Throttle = at most once per interval (scroll/resize handlers, live metrics).',
    memoryTip:
      'Debounce = WAIT. Throttle = LIMIT. Search box → debounce. Scroll/resize/mousemove → throttle.',
    keyTerms: ['debounce', 'throttle', 'leading/trailing edge', 'useDebounce', 'API protection', 'keystroke economics'],
    visualIds: ['react-debounce-flow'],
    interviewAnswer:
      'Debounce postpones execution until events stop for a quiet period — typing "Apple" fires one search for "Apple" instead of five for A, Ap, App, Appl, Apple. Throttle guarantees at most one execution per time window regardless of event frequency — right for scroll and resize, where you want steady updates, not "after the storm". In React these are usually custom hooks: useDebounce(value, delay) returns the debounced value to feed into query keys or effects; the effect must also cancel in-flight requests (AbortController) so a slow earlier search cannot overwrite a later one. The banking framing is concrete: a transaction search firing on every keystroke at 10k concurrent operations staff is a self-inflicted denial of service on the transaction API.',
    practicalExample:
      'NexusBank transaction search debounces at 300ms and shows the call counter in the learning UI: without debounce, typing "September" fires 9 requests; with debounce, 1. Combined with AbortController, switching searches cancels the obsolete request instead of letting it land late and overwrite fresh results.',
    codeExample: `function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t); // reset the timer on every change
  }, [value, delay]);
  return debounced;
}`,
    commonMistakes: [
      'Debouncing the API call but not cancelling the previous request — slow stale responses still overwrite fresh ones.',
      'Debouncing scroll handlers where throttle (or rAF) is the right tool.',
      'Recreating the timer on every render because the effect deps are wrong.',
      'Debouncing so aggressively the UI feels laggy (300–500ms is the usual sweet spot for search).',
    ],
    seniorInsight:
      'Debounce protects volume; cancellation protects correctness. A senior candidate mentions both: debounce collapses the call count, AbortController (or a query library’s cancellation) guarantees latest-result-wins. Mentioning the race condition without the cancellation mechanism is the classic half-answer.',
    aiAwareness: {
      strongAnswerShouldMention: ['debounce = wait', 'throttle = limit', 'API protection', 'cancellation pairing', '300ms convention'],
      weakAnswer: 'Debounce makes the search faster.',
      redFlags: ['Mixing up debounce and throttle.', 'Not connecting debounce to request cancellation.'],
      likelyFollowUp: ['Debounce vs throttle for a scroll listener?', 'How do you cancel the in-flight request when the debounce fires?'],
    },
    prerequisites: ['react-state', 'react-useeffect'],
    relatedTopics: ['react-request-cancellation', 'react-tanstack-query'],
    nextTopics: ['react-request-cancellation'],
    references: [
      { title: 'Debouncing and Throttling explained', url: 'https://css-tricks.com/debouncing-throttling-explained-examples/', source: 'CSS-Tricks', type: 'article' },
    ],
  },

  {
    id: 'react-request-cancellation',
    technology: 'react',
    title: 'Request Cancellation & Race Conditions',
    category: 'Performance',
    slug: 'react-request-cancellation',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'When inputs change faster than responses arrive, older requests must be cancelled or ignored — otherwise a slow stale response overwrites the fresh one (a race condition).',
    mentalModel:
      'Search "September", then "October": two trains leave. If the September train arrives last and you let it park, the screen shows September while the user typed October. AbortController is the signal to stop the old train.',
    memoryTip:
      'Race condition → cancellation → request identity → latest-result-wins. Every fetch in an effect needs a cleanup: abort or ignore.',
    keyTerms: ['AbortController', 'race condition', 'stale response', 'latest-wins', 'ignore flag', 'query key'],
    interviewAnswer:
      'Any fetch driven by changing input is exposed to a race: request A starts, the input changes, request B fires, B returns first, then A lands and overwrites the results with data for the wrong query. The fix has two layers. Cancellation: create an AbortController per effect run, pass its signal to fetch, and abort in cleanup — the obsolete request dies before it can lie. Identity: derive the request from the current input (or a query key) and only accept responses that match the latest input — "latest result wins". TanStack Query encodes this automatically (query key = request identity, cancellation built in); hand-rolled effects must implement it explicitly. The senior answer names the race condition, the mechanism, and the verification ("type September → October fast; the UI must never flash September results after October resolves").',
    codeExample: `useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/transactions?q=\${encodeURIComponent(query)}\`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setResults)
    .catch((err) => { if (err.name !== 'AbortError') setError(err); });
  return () => controller.abort(); // cancel the obsolete request
}, [query]);`,
    commonMistakes: [
      'No cancellation and no ignore flag — results land out of order and the UI shows the wrong customer’s data.',
      'Catching the abort error and setting an error banner for a normal cancellation.',
      'Debouncing without cancellation — debounce reduces the race window but does not close it.',
      'Treating "it usually works" as a fix — races are timing-dependent and surface in production.',
    ],
    seniorInsight:
      'In BFSI this is a correctness issue, not a UX nicety: an operations officer searching customer A, then B, must never approve a payment against a screen showing customer B’s header with customer A’s transactions. The senior answer ties search identity (query key) to cache identity — one concept that makes debouncing, cancellation and caching cohere.',
    aiAwareness: {
      strongAnswerShouldMention: ['race condition', 'AbortController', 'ignore flag', 'latest-result-wins', 'query key identity'],
      weakAnswer: 'I use debounce so it is fine.',
      redFlags: ['No knowledge of AbortController.', 'Cannot describe the stale-response bug concretely.'],
      likelyFollowUp: ['How does TanStack Query solve this for you?', 'Abort vs ignore-flag — when is each enough?'],
    },
    prerequisites: ['react-useeffect'],
    relatedTopics: ['react-debounce-throttle', 'react-tanstack-query'],
    nextTopics: ['react-pagination-cursor'],
    references: [
      { title: 'AbortController — MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController', source: 'MDN', type: 'documentation' },
    ],
  },

  {
    id: 'react-pagination-cursor',
    technology: 'react',
    title: 'Pagination, Cursor Pagination & Infinite Scroll',
    category: 'Performance',
    slug: 'react-pagination-cursor',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Offset pagination fetches "page N" with page numbers; cursor pagination fetches "the N after this anchor" — stable under inserts and the default for high-volume, real-time data.',
    mentalModel:
      'Offset = "give me rows 5000–5050" (breaks if rows are inserted ahead). Cursor = "give me the 50 after this bookmark" — stable no matter how much was inserted before it.',
    memoryTip:
      'Pagination = data over the wire. Virtualization = DOM on screen. Cursor = stable under inserts; offset = simple but drifts when rows are inserted mid-scroll.',
    keyTerms: ['offset pagination', 'cursor pagination', 'keyset pagination', 'infinite scroll', 'page drift', 'useInfiniteQuery'],
    interviewAnswer:
      'Offset pagination (page, pageSize) is simple and supports "jump to page", but under concurrent inserts a user can see duplicates or miss rows — page 2 re-served row 500 that moved to page 499 while they read page 500. Cursor (keyset) pagination returns an opaque cursor (typically the last row’s sort key) and asks for "the next N after this cursor" — stable under inserts, index-friendly, no duplicates; the trade-off is no random access to page numbers. Infinite scroll is a UI pattern over either scheme, usually cursor-based via useInfiniteQuery. The frontend must never request "all transactions": filtering, sorting and paging happen server-side, the client holds one page (or a small window of cursored pages), and virtualization keeps the DOM small within the page.',
    practicalExample:
      'NexusBank transaction search: the operations portal uses offset pagination with page numbers for audit-friendly navigation; the customer portal feed uses cursor pagination with useInfiniteQuery so a live stream of new transactions never shifts rows under the user’s finger. Both are server-side: the browser never holds more than a page (or a few pages) of transactions.',
    commonMistakes: [
      'Offset pagination on a live table where inserts shift pages under the user.',
      'Infinite scroll without request cancellation or dedup — fast scrolling fires overlapping requests.',
      'Keeping every loaded page in state forever — memory grows unbounded on long scrolls.',
      'Sorting/filtering client-side on "page 7 of 4000" and believing the data is complete.',
    ],
    seniorInsight:
      'The memory trick doubles as the architecture: pagination controls DATA, virtualization controls DOM. A senior answer designs both together — server-side keyset pagination for correctness at volume, virtualization for DOM cost, a cache (TanStack Query) with per-page keys, and cancellation so stale pages never overwrite fresh ones.',
    aiAwareness: {
      strongAnswerShouldMention: ['offset vs cursor', 'stability under inserts', 'opaque cursor', 'server-side filtering', 'infinite scroll trade-offs'],
      weakAnswer: 'We paginate so the page loads faster.',
      redFlags: ['Cannot explain why cursors beat offsets on live data.', 'No mention of where filtering happens (server).'],
      likelyFollowUp: ['Why do offsets duplicate rows on live data?', 'How do you implement "load more" with TanStack Query?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-virtualization', 'react-request-cancellation', 'react-frontend-system-design'],
    nextTopics: ['react-code-splitting'],
    references: [
      { title: 'TanStack Query — Infinite Queries', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries', source: 'TanStack', type: 'documentation' },
    ],
  },

  {
    id: 'react-code-splitting',
    technology: 'react',
    title: 'Code Splitting & Lazy Loading',
    category: 'Performance',
    slug: 'react-code-splitting',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Code splitting breaks the bundle into chunks loaded on demand — React.lazy + Suspense defer a component’s code until it is first rendered, cutting initial load cost.',
    mentalModel:
      'The bundle is a suitcase: pack only what today’s trip needs. Route-level splitting puts the admin console in its own bag; the customer dashboard never carries it.',
    memoryTip:
      'lazy = load when shown. Suspense = the loading boundary. Split at route level first, heavy widgets second. Measure with bundle analysis — never guess.',
    keyTerms: ['React.lazy', 'Suspense', 'route-based splitting', 'bundle size', 'chunk', 'dynamic import'],
    interviewAnswer:
      'Code splitting divides the bundle into chunks fetched on demand. React.lazy(() => import("./X")) gives a component its own chunk; Suspense renders a fallback until it arrives. The highest-leverage split is route-level: the resume portal and the learning hub share nothing, so neither downloads the other. Inside a page, defer below-the-fold or modal-only components (charts, the payment modal) and heavy libraries (charting, date handling). The caveats are real: lazy boundaries add a network round trip (show skeletons), over-splitting causes waterfalls, and server-rendered apps need framework support for streaming. Measure with a bundle visualiser; split by route first, then by interaction cost — not by default on every component.',
    practicalExample:
      'The NexusBank learning hub is route-split from the resume portal: the "/" route never downloads learning code. Inside the lab, the portfolio chart library is lazy-loaded behind Suspense with a skeleton, so the dashboard’s first paint does not wait for a charting library.',
    commonMistakes: [
      'Lazy-loading below-the-fold widgets but shipping the whole charting library on the landing route anyway.',
      'Wrapping tiny components in lazy() — chunk overhead exceeds the savings.',
      'No fallback UI — users see a blank flash while the chunk loads.',
      'One giant shared chunk "for simplicity" that recreates the monolith.',
    ],
    seniorInsight:
      'Bundle strategy is an architecture conversation: route-level splitting first (biggest, safest win), then heavy third-party widgets, then measure Web Vitals before/after. The senior framing is user-perceived performance (LCP/INP), not chunk count. "We code-split everything" without a bundle analysis is an interview red flag.',
    aiAwareness: {
      strongAnswerShouldMention: ['route-level first', 'Suspense fallback', 'network round-trip cost', 'bundle analysis', 'over-splitting risk'],
      weakAnswer: 'Lazy load everything for performance.',
      redFlags: ['No mention of route-level splitting.', 'Not knowing Suspense’s role.'],
      likelyFollowUp: ['Where would you NOT lazy load?', 'How do you measure bundle impact?'],
    },
    prerequisites: ['react-overview'],
    relatedTopics: ['react-frontend-system-design', 'react-reconciliation'],
    nextTopics: ['react-state-taxonomy'],
    references: [
      { title: 'Lazy Loading with Suspense', url: 'https://react.dev/reference/react/lazy', source: 'react.dev', type: 'official' },
    ],
  },
];
