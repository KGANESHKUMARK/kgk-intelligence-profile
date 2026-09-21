import type { InterviewQuestion } from '../../../types';

/** React interview questions — performance, architecture, BFSI scenarios. */
export const reactAdvancedQuestions: InterviewQuestion[] = [
  {
    id: 'q-react-reconciliation',
    question: 'Walk me through what happens between a state update and pixels on the screen.',
    category: 'React Core',
    difficulty: 'senior',
    quickAnswer:
      'Render: React calls your components to build a new element tree. Reconcile: diff against the previous tree. Commit: apply the minimal DOM mutations, then run layout effects and paint.',
    interviewAnswer:
      'A state update schedules a render. In the render phase React executes the component functions top-down, producing a new element tree — this phase is pure and, under concurrent React, interruptible. Reconciliation diffs the new tree against the current one using type and key comparisons: same type and key → update in place; different → unmount and remount. The commit phase applies the computed mutations to the DOM synchronously, then runs layout effects, then the browser paints, then passive effects (useEffect) run. A re-render that changes nothing still costs the render phase — that is why unnecessary parent-driven re-renders are the usual performance tax, even though the DOM never changes.',
    detailedAnswer:
      'The fiber model makes reconciliation interruptible: work is chunked into units with priorities, so a transition can yield to input events. Batching (18+) groups multiple setStates into one render pass. Keys decide subtree identity — changing a key throws away the subtree including state. The commit is synchronous and split into before-mutation/mutation/layout phases; effects with cleanup run cleanup(old) before effect(new). Profiler maps onto this: "why did this render" attributes each render to props/state/hooks/parent. The senior takeaway: optimise render scope first (colocate state, stabilise props), then memoize computations, then virtualize DOM — in that order, measured each time.',
    seniorAnswer:
      'At architect level I’d add: hydration and streaming change the picture in SSR frameworks (server HTML + client render must reconcile); concurrent features (startTransition, useDeferredValue) let you deprioritise expensive trees so typing stays responsive; and the Profiler + Web Vitals are the measurement loop — Measure → Find → Fix → Verify. Quoting a real before/after (e.g. keystroke re-renders 41 → 3, INP 380ms → 90ms) beats any API recitation.',
    keyTerms: ['render phase', 'commit phase', 'reconciliation', 'fiber', 'batching', 'keys'],
    conceptsTested: ['rendering pipeline', 'reconciliation semantics', 'performance reasoning'],
    relatedTopics: ['react-reconciliation', 'react-react-memo'],
    followUps: ['q-react-memo-vs-usememo'],
    commonMistakes: ['Equating re-render with DOM mutation.', 'Not knowing the render phase is interruptible under concurrent React.'],
    strongAnswerKeywords: ['render vs commit', 'diffing', 'batching', 'fiber', 'Profiler'],
    interviewerIntent: 'Verify the candidate understands React’s execution model deeply enough to reason about performance.',
    aiAwareness: {
      strongAnswerShouldMention: ['render phase', 'commit phase', 'diffing', 'batching', 'fiber interruptibility'],
      weakAnswer: 'React updates the virtual DOM and then the real DOM.',
      redFlags: ['No distinction between render and commit.', 'No mention of batching.'],
      likelyFollowUp: ['Where do keys fit into diffing?', 'What does startTransition change?'],
    },
  },

  {
    id: 'q-react-memo-vs-usememo',
    question: 'When is React.memo actually worth it — and when is it noise?',
    category: 'Performance',
    difficulty: 'senior',
    quickAnswer:
      'Worth it for expensive subtrees rendered often with mostly-stable props. Worthless — or harmful — when props change every render (inline objects/functions) or the component was never the bottleneck. Measure first.',
    interviewAnswer:
      'React.memo shallow-compares props and skips the child’s render when they are equal. It pays off when the subtree is expensive and its props are naturally stable. It silently does nothing when a parent passes new inline objects/functions each render — memo is defeated by unstable props, which is why it travels with useCallback/useMemo or prop-shape discipline. It is harmful when the comparison cost exceeds the render cost (cheap rows), when props change anyway, or when it masks the real fix — moving state down so the parent doesn’t re-render the child at all. The workflow: profile, confirm the subtree renders without need, fix the cause (state placement, composition), and memoize only what measurement justifies.',
    detailedAnswer:
      'The mechanics: memo does a shallow compare of each prop. Functions and objects created in the parent’s body are new every render, so without stabilisation the comparison always fails. Custom comparators exist but are a maintenance liability. The structural alternatives often beat memo: pass children (React elements are created once by the outer owner, so a memoized wrapper won’t re-render them), split components so state lives in the smallest possible subtree, or derive data during render instead of memoising it. For lists, memoized rows + stable callbacks + virtualization is the standard grid pattern: type in search → only the input and visible rows re-render.',
    seniorAnswer:
      'The senior answer is a measurement story: React Profiler shows which components rendered and why (props changed / parent rendered / hook changed). In the NexusBank grid, profiling showed 40 row re-renders per keystroke caused by an inline onRowClick; the fix was useCallback + memoized rows, and the deeper fix was moving the search state into the toolbar so the grid never re-rendered at all. Quote the before/after and the tool, not just the hook names.',
    keyTerms: ['React.memo', 'shallow compare', 'stable props', 'children composition', 'Profiler'],
    conceptsTested: ['memoization trade-offs', 'reference equality', 'measurement discipline'],
    relatedTopics: ['react-usememo-usecallback', 'react-reconciliation'],
    followUps: ['q-react-context-rerenders'],
    commonMistakes: ['Memoizing everything by default.', 'Memo without stabilising props — no effect.', 'Never measuring before/after.'],
    strongAnswerKeywords: ['shallow comparison', 'measure first', 'children pattern', 'Profiler evidence'],
    interviewerIntent: 'Separate candidates who memorised the APIs from those who can reason about when optimisation pays.',
    aiAwareness: {
      strongAnswerShouldMention: ['shallow equality', 'inline props defeat memo', 'profile first', 'composition alternative'],
      weakAnswer: 'Wrap everything in memo.',
      redFlags: ['No measurement step.', 'Doesn’t know memo is defeated by inline props.'],
      likelyFollowUp: ['How do you prove a memoization helped?'],
    },
  },

  {
    id: 'q-react-millions-records',
    question: 'The transactions table can have millions of records. How do you design the frontend?',
    category: 'Architecture',
    difficulty: 'architect',
    quickAnswer:
      'Never load them: server-side filtering, sorting and cursor pagination; debounced search with request cancellation; virtualized rendering for the visible window; a cache with keyed invalidation. The browser holds one page, the DOM holds one viewport.',
    interviewAnswer:
      'The architecture is server-authoritative: the API owns filtering, sorting and paging (indexed keyset queries), the client requests pages/cursors and never the full set. The UI layers: a server-driven DataGrid (page size, sort, filters as query params), debounced search inputs (300ms) with AbortController so obsolete requests die, cursor pagination so inserts don’t shift rows under the user, and virtualization so the DOM only ever holds visible rows. Caching sits in TanStack Query keyed by the filter set — back/forward and repeat queries hit cache; mutations invalidate precisely. Add request identity so the latest response wins, skeletons for loading, error states with retry, and observability (correlation IDs, latency metrics) so the SLA is measurable.',
    detailedAnswer:
      'Layer by layer: transport (typed API client, cancellation, retry with backoff, timeouts), state (query cache keyed by filters+cursor; no transaction arrays in global stores), rendering (virtualized rows, memoized cells, stable keys), interaction (debounce 250–350ms, request identity, optimistic status pills reconciled on ACK), and scale path (pagination → cursor pagination → infinite scroll for ops consoles; WebSockets/SSE for live deltas so you patch rows instead of refetching pages). The conceptual line an interviewer wants: pagination controls data transferred, virtualization controls DOM rendered, caching controls refetches — three different problems, three different tools.',
    seniorAnswer:
      'Architect answer adds the system view: API gateway with cursor-based endpoints and field projection; search backed by an index (Elasticsearch/OpenSearch) rather than LIKE scans; cache headers/ETags; idempotency keys on writes; RBAC enforced server-side with the UI reflecting, not deciding; and the observability loop (correlation ID from click to database, p95 dashboards). Then the trade-offs: virtualization vs pagination complexity, cache staleness vs correctness for balances (prefer invalidation + refetch for money), and where an event stream (Kafka → SSE) replaces polling.',
    keyTerms: ['cursor pagination', 'server-side filtering', 'virtualization', 'request cancellation', 'debounce', 'cache invalidation'],
    conceptsTested: ['large-data architecture', 'performance engineering', 'system design'],
    relatedTopics: ['react-virtualization', 'react-pagination-cursor', 'react-frontend-system-design'],
    commonMistakes: ['Loading "all" then filtering client-side.', 'Confusing virtualization with pagination.', 'No cancellation or cache story.'],
    strongAnswerKeywords: ['cursor pagination', 'server-side filtering', 'virtualization', 'cache invalidation', 'correlation ID'],
    interviewerIntent: 'The canonical senior/lead question — can the candidate design for scale rather than code for the demo dataset?',
    aiAwareness: {
      strongAnswerShouldMention: ['server-side everything', 'cursor pagination', 'virtualization', 'cache + invalidation', 'observability'],
      weakAnswer: 'Use pagination and virtualization.',
      redFlags: ['Any hint of loading millions of rows client-side.', 'No backend/contract thinking.'],
      likelyFollowUp: ['How do you keep a live feed consistent with paged data?', 'What changes at 100M rows?'],
    },
  },

  {
    id: 'q-react-duplicate-submit',
    question: 'How do you prevent a user from submitting a payment twice?',
    category: 'Security',
    difficulty: 'senior',
    quickAnswer:
      'UI: disable the button while submitting. Real guarantee: an idempotency key sent with the request so the backend rejects or replays the same submission exactly once. The frontend is UX; the backend is correctness.',
    interviewAnswer:
      'Layer one is UX: disable the submit control while the mutation is in flight and keep the form in a "submitting" state that ignores further submits (a reducer transition guard works well). Layer two is correctness: generate an idempotency key (UUID) when the user begins the payment, send it with the request, and have the server deduplicate — a retry after a timeout or a double-click then returns the original result instead of creating a second transfer. Layer three is server-side authority: the backend enforces uniqueness and validates limits regardless of what the UI allowed. The interview line: "disabling a button prevents accidents; idempotency prevents double payments."',
    detailedAnswer:
      'Frontend: a state machine (idle → reviewing → submitting → success/failed) where SUBMIT is a no-op unless status is "reviewing"; the button reflects it. Optimistic UI is optional and must reconcile: apply a pending transaction with a temporary id, roll back on failure, replace with the server id on success. The idempotency key must be generated once per logical attempt (not per retry) and survive retries — stored with the draft, not regenerated per attempt. Backends respond 409/duplicate with the original result so the client can reconcile. Timeouts need care: an unknown outcome must be reconciled by query, not blindly retried as a new payment.',
    seniorAnswer:
      'The senior framing separates concerns: the client makes the flow pleasant and prevents honest duplicates; the server makes duplicates impossible (unique constraint on the idempotency key, exactly-once processing, audit trail). Mention the failure modes: double-click, retry after timeout, replay after refresh — and that only the server-side key survives all three. In banking terms: the API is the system of record; the UI is a view. That sentence is the interview answer.',
    keyTerms: ['idempotency key', 'duplicate submission', 'optimistic UI', 'pessimistic UI', 'state machine'],
    conceptsTested: ['transaction correctness', 'idempotency', 'frontend vs backend responsibility'],
    relatedTopics: ['react-usereducer-custom-hooks', 'react-tanstack-query'],
    commonMistakes: ['Believing a disabled button is a correctness mechanism.', 'Regenerating the idempotency key on retry.'],
    strongAnswerKeywords: ['idempotency key', 'state machine', 'server-side enforcement', 'optimistic vs pessimistic'],
    interviewerIntent: 'Classic BFSI question — does the candidate know where correctness actually lives?',
    aiAwareness: {
      strongAnswerShouldMention: ['idempotency key', 'server-side enforcement', 'optimistic UI rollback'],
      weakAnswer: 'Disable the button after click.',
      redFlags: ['UI-only answer.', 'No mention of retries or unknown outcomes.'],
      likelyFollowUp: ['How do you reconcile the UI when the idempotent retry returns the original result?'],
    },
  },

  {
    id: 'q-react-optimistic-update',
    question: 'When would you use optimistic UI for a payment, and how do you roll back safely?',
    category: 'State Management',
    difficulty: 'senior',
    quickAnswer:
      'Optimistic UI suits low-risk, high-frequency actions where instant feedback matters; money movement usually warrants pessimistic UI. If optimistic: write to the cache immediately, reconcile with the server response, roll back on failure — and make the write idempotent so a retry can’t double-charge.',
    interviewAnswer:
      'Optimistic updates trade correctness risk for perceived speed: the cache is mutated before the server confirms, then reconciled — commit on success, rollback on failure. They suit low-collision, low-risk mutations (renaming a label, marking a notification read) and feel magical in feeds. Payments are different: the cost of a wrong "success" is a customer acting on money that did not move, so the standard is pessimistic for the transfer itself — optimistic at most for the status pill ("processing…") with server confirmation as truth. Whatever the choice, the rollback path must restore the exact previous cache state and surface a retry path, and the write needs an idempotency key so network retries cannot double-submit.',
    detailedAnswer:
      'With TanStack Query: onMutate snapshots the previous cache, applies the optimistic patch and cancels in-flight conflicting queries; onError rolls back to the snapshot; onSuccess replaces the optimistic entity with the server’s version and invalidates related keys. The rollback must also handle the "timeout but maybe committed" case — the UI shows an indeterminate state and reconciles via the idempotency key or a status poll, never assumes failure and double-submits. For payments specifically: pessimistic submit with a clear in-flight state, optimistic only for cosmetic side effects (toast, list highlight), and reconciliation on refocus/poll. The senior point is that optimism is a UX decision with a correctness boundary — the cache may lie for 200ms, the ledger may not.',
    seniorAnswer:
      'I’d frame the decision matrix: latency of the operation, blast radius of being wrong, and conflict probability. Fast idempotent mutations → optimistic. Financial transfers → pessimistic with optimistic feedback (spinner + pending state), server-confirmed status, and a state machine that can represent "submitted, outcome unknown". Then the observability piece: correlation IDs so support can trace exactly what the user saw versus what the ledger recorded.',
    keyTerms: ['optimistic update', 'rollback', 'idempotency', 'source of truth', 'reconciliation'],
    conceptsTested: ['optimistic vs pessimistic UI', 'cache mutation', 'financial correctness'],
    relatedTopics: ['react-tanstack-query', 'react-redux-toolkit'],
    commonMistakes: ['Optimistically updating money balances without rollback.', 'Retrying a non-idempotent POST blindly.'],
    strongAnswerKeywords: ['snapshot rollback', 'server confirmation', 'idempotency key', 'pessimistic for money'],
    interviewerIntent: 'Probe whether the candidate understands UX optimism vs transactional correctness — a real BFSI differentiator.',
    aiAwareness: {
      strongAnswerShouldMention: ['snapshot + rollback', 'server confirmation as truth', 'idempotency on retry'],
      weakAnswer: 'Update the state before the API call.',
      redFlags: ['No rollback story.', 'Optimistic updates on money movement without caveats.'],
      likelyFollowUp: ['What happens if the rollback itself fails?'],
    },
  },

  {
    id: 'q-react-typed-datatable',
    question: 'How would you type a reusable DataTable component in TypeScript?',
    category: 'TypeScript',
    difficulty: 'senior',
    quickAnswer:
      'Make the component generic over the row type: DataTable<T extends { id: string }> with Column<T> definitions keyed by keyof T, so column keys, cell renderers and row callbacks are all checked against the actual data.',
    interviewAnswer:
      'The core is a generic constrained to an identity field: interface Column<T> { key: keyof T & string; header: string; render?: (row: T) => ReactNode }. DataTable<T extends { id: string }> uses T for rows and columns together, so a column key that isn’t a Transaction field is a compile error, and custom renderers receive fully typed rows. Selection, sorting and pagination state are typed over T as well (sort key: keyof T). This is how design-system grids stay safe across domains — the same component serves Transaction, Customer and AuditLog rows with zero casts, and renaming a field breaks every dependent column at compile time instead of at runtime.',
    detailedAnswer:
      'Design decisions worth naming: constrain T (id for keys) rather than accepting any; keep Column.key as keyof T so headers can’t drift from the model; expose render as an optional escape hatch with the row fully typed; keep generic inference doing the work (DataTable<Transaction> inferred from rows) instead of explicit type args at call sites. For the enterprise version: discriminated row states (loading/selected/error) via intersections, discriminated unions for cell types (text | currency | status), and controlled/uncontrolled prop patterns typed with unions. The payoff: a filter or sort key typo is a build failure, not a blank column in production.',
    seniorAnswer:
      'Senior candidates discuss the API surface: server-side mode (onQueryChange callback instead of local filtering), controlled vs uncontrolled column state, virtualization as an implementation detail hidden behind the same props, and how generics compose with React.memo without breaking inference. Also the maintenance angle: derive prop types from the API schema (zod/ OpenAPI codegen) so the grid’s row type is never hand-copied.',
    codeExample: `type Sort<T> = { key: keyof T; dir: 'asc' | 'desc' };

interface DataTableProps<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  sort?: Sort<T>;
  onSortChange?: (s: Sort<T>) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: string[]) => void;
}`,
    keyTerms: ['generic component', 'keyof', 'constrained generic', 'discriminated unions', 'inference'],
    conceptsTested: ['generic component design', 'type-safe reusable APIs'],
    relatedTopics: ['react-ts-generics-hooks', 'react-frontend-system-design'],
    commonMistakes: ['any-typed columns to "keep it flexible".', 'Casting rows with `as` instead of constraining T.'],
    strongAnswerKeywords: ['generic constraints', 'keyof', 'inference', 'single source of truth'],
    interviewerIntent: 'Test whether the candidate can design reusable, type-safe component APIs — core design-system work.',
    aiAwareness: {
      strongAnswerShouldMention: ['generic constraints', 'keyof column typing', 'inference over explicit casts'],
      weakAnswer: 'Use TypeScript and type the props.',
      redFlags: ['any in the public API.', 'No concrete generic component example.'],
      likelyFollowUp: ['How do you type render props per column?', 'How do you keep the row type in sync with the backend?'],
    },
  },

  {
    id: 'q-react-hide-button-security',
    question: 'You hid the Admin button for non-admin users. Is the API now secure?',
    category: 'Security',
    difficulty: 'senior',
    quickAnswer:
      'No. Frontend authorization is UX, not security — any user can call the API directly. Every endpoint must enforce authorization server-side; the UI check only shapes the experience.',
    interviewAnswer:
      'Hiding UI controls removes temptation, not access: a crafted request with a valid token hits the API exactly the same as a button click would. Security lives at the boundary — the API validates the session, checks the role/permission for that action (RBAC enforced server-side), validates input, and logs to an audit trail. The frontend’s job is experience: don’t show what the user can’t do, fail closed on unknown states, and never trust client-side checks as enforcement. The classic phrasing: "frontend controls experience; backend controls authorization." A missing server-side check is an IDOR/broken-access-control vulnerability regardless of what the UI shows.',
    detailedAnswer:
      'Layered model: the session carries identity and roles (JWT claims or server session); the UI derives permissions (VIEW_TRANSACTION, APPROVE_PAYMENT, MANAGE_USERS) from the session and renders accordingly via a single gate (a <Can> component or permission hook — not scattered role string checks); every API call re-validates server-side because the client is untrusted. Transport/UX hardening: httpOnly secure cookies (or short-lived access tokens with refresh rotation), CSRF protection for cookie flows, CSP and output encoding against XSS (a stored XSS in a banking portal is a session-theft vector), no sensitive data in URLs or logs, and audit events for every privileged action. Frontend checks reduce support tickets and confusion — they do not reduce the API’s obligations.',
    seniorAnswer:
      'The senior answer adds threat modelling: assume the "hidden" endpoint will be called directly (curl with a stolen token), so server-side authorization is checked per request with least privilege; the client’s RBAC is a projection of the server’s truth, refreshed with the session. Also mention defence-in-depth specifics: CSP to blunt XSS, SameSite cookies, no sensitive data in the bundle, and security tests in CI (dependency scanning, SAST). The one-liner interviewers want: "the UI is a recommendation; the API is the law."',
    keyTerms: ['defence in depth', 'server-side authorization', 'RBAC', 'XSS', 'CSRF', 'least privilege'],
    conceptsTested: ['security model', 'frontend vs backend responsibility', 'RBAC'],
    relatedTopics: ['react-security-rbac', 'react-usecontext'],
    commonMistakes: ['Treating hidden UI as access control.', 'Long-lived tokens in localStorage.', 'No server-side permission checks.'],
    strongAnswerKeywords: ['defence in depth', 'backend enforces', 'UI is UX not security'],
    interviewerIntent: 'The canonical BFSI security question — can the candidate separate experience from enforcement?',
    aiAwareness: {
      strongAnswerShouldMention: ['API is the enforcement point', 'UI hiding is UX', 'least privilege', 'audit trail'],
      weakAnswer: 'Yes, if the button is hidden the API is safe.',
      redFlags: ['Any version of "the UI prevents unauthorised calls".'],
      likelyFollowUp: ['How do you design RBAC end to end?', 'Where do permissions come from and when do they refresh?'],
    },
  },

  {
    id: 'q-react-ssr-choice',
    question: 'When would you choose SSR, SSG, or ISR for a banking product — and what does each cost you?',
    category: 'Next.js',
    difficulty: 'senior',
    quickAnswer:
      'SSG for content that changes between deploys (marketing, rates pages); ISR for near-static content with bounded freshness; SSR for personalised, per-request data (dashboards); CSR for highly interactive authenticated tools. Every choice trades freshness, latency, server cost and complexity.',
    interviewAnswer:
      'The decision starts from the page’s data profile. Public and deploy-stable → SSG: prebuilt HTML from a CDN, fastest TTFB, cheapest, but stale until the next build. Needs bounded freshness without rebuilding → ISR: static speed with time-based revalidation. Personalised or request-fresh data (account dashboard) → SSR or streamed Server Components: fresh HTML per request, but every request costs server time and you own hydration. Behind login with heavy interactivity, CSR (or client islands) is fine because the shell is cheap and the data is private anyway. Server Components shift data-dependent rendering to the server with zero client JS for that subtree — the trade-off is that they cannot hold state or event handlers.',
    detailedAnswer:
      'The senior framing is per-route strategy plus trade-off articulation: SSG/ISR buy CDN speed and SEO for public pages at the cost of build-time data coupling; SSR buys correctness for authenticated, volatile data at the cost of server load and TTFB variance; streaming RSCs let you send the shell immediately and stream balance/portfolio panels as they resolve. The costs to name explicitly: hydration cost (the whole client tree still ships), cache invalidation complexity (ISR + personalisation is a classic footgun), and session handling differences (cookies vs tokens, middleware auth). Finish with the decision rule: freshness requirement × personalisation × interactivity determines the strategy per route, not per app.',
    seniorAnswer:
      'For a banking portal: marketing and product pages SSG/ISR; logged-in dashboards SSR or streamed RSC with per-request auth; the transactions grid stays client-side against a query cache because its state is highly interactive. Observability and failover matter: SSR adds a server dependency to every page view, so degrade gracefully (skeletons + client refetch) when the render backend degrades. Trade-off language: "static speed vs freshness vs personalisation — pick per route, and measure TTFB/LCP after."',
    keyTerms: ['SSR', 'SSG', 'ISR', 'hydration', 'streaming', 'Server Components'],
    conceptsTested: ['rendering strategy selection', 'trade-off articulation'],
    relatedTopics: ['react-nextjs-rendering', 'react-code-splitting'],
    commonMistakes: ['One strategy for the whole app.', 'No cost discussion.', 'Confusing RSC with SSR.'],
    strongAnswerKeywords: ['per-route strategy', 'freshness vs latency', 'hydration cost', 'streaming'],
    interviewerIntent: 'Check whether the candidate can choose rendering strategies with explicit trade-offs rather than defaults.',
    aiAwareness: {
      strongAnswerShouldMention: ['route-level choice', 'trade-offs named', 'RSC vs SSR distinction'],
      weakAnswer: 'SSR is better for SEO.',
      redFlags: ['No trade-off awareness.', 'RSC/SSR confusion.'],
      likelyFollowUp: ['What breaks when you add personalisation to an ISR page?'],
    },
  },
];
