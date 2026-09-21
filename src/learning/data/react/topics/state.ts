import type { LearningTopic } from '../../../types';

export const reactStateTopics: LearningTopic[] = [
  {
    id: 'react-state-taxonomy',
    technology: 'react',
    title: 'Local vs Client vs Server State',
    category: 'State Management',
    slug: 'react-state-taxonomy',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Client state is data your app owns (UI, preferences, workflow); server state is a cached copy of data the backend owns — they have different lifecycles and need different tools.',
    mentalModel:
      'Client state is your notebook; server state is a photocopy of someone else’s document — it can go stale at any moment, so it needs a cache with freshness rules, not just storage.',
    memoryTip:
      'Modal/tab/form = local. Theme/preferences = client. Transactions/accounts/customers = server state. "Is there an owner outside my app?" → server state.',
    keyTerms: ['client state', 'server state', 'cache', 'stale-while-revalidate', 'normalisation', 'ownership'],
    visualIds: ['react-state-taxonomy-map'],
    interviewAnswer:
      'Local state is transient and component-scoped: modal visibility, the active tab, an in-progress form field. Client state is shared UI/workflow state the app owns: theme, sidebar collapse, multi-step wizard position. Server state is data owned by the backend — accounts, transactions, customers — which the frontend only caches. The categories matter because they fail differently: client state is always fresh by definition, while server state is instantly stale, needs refetching, invalidation, retries, cancellation and consistency handling — problems a plain useState or Redux store does not model. Misclassifying server state as client state is the root cause of most enterprise frontend complexity: teams hand-roll caching, invalidation and race handling that a server-state library (TanStack Query) provides.',
    practicalExample:
      'NexusBank splits cleanly: selected account + wizard step = local state; theme + table density = client state (context); accounts, balances, transactions = server state in TanStack Query with staleTime and invalidation after a payment. The audit trail is server state too — refetched, never duplicated into local state.',
    commonMistakes: [
      'Copying server data into local state ("useEffect + setTransactions") — creates a second, drifting source of truth.',
      'Treating Redux as a database for server data — it caches what you put in it, but knows nothing about staleness or refetching.',
      'One giant global store for modal booleans and transaction lists alike.',
    ],
    seniorInsight:
      'The senior taxonomy question: "who owns this data?" If the backend owns it, it is server state — cache it, do not clone it. If the app owns it, decide local vs global by how many distant consumers it has. Most "we need Redux" conclusions dissolve once server state moves to a query cache and UI state stays colocated.',
    aiAwareness: {
      strongAnswerShouldMention: ['ownership', 'server state is a cache', 'staleness/invalidation', 'client vs server state split'],
      weakAnswer: 'Global state goes in Redux, local in useState.',
      redFlags: ['No distinction between client and server state.', 'Defaulting to a global store for everything.'],
      likelyFollowUp: ['Why is copying API data into useState an anti-pattern?', 'Where does auth/session state belong?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-tanstack-query', 'react-redux-toolkit', 'react-security-rbac'],
    nextTopics: ['react-redux-toolkit'],
    references: [
      { title: 'TanStack Query — Does this replace Redux?', url: 'https://tanstack.com/query/latest/docs/framework/react/comparison', source: 'TanStack', type: 'documentation' },
    ],
  },

  {
    id: 'react-redux-toolkit',
    technology: 'react',
    title: 'Redux Toolkit',
    category: 'State Management',
    slug: 'react-redux-toolkit',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Redux Toolkit is the standard way to run a Redux store — slices, createAsyncThunk, and memoized selectors — for genuinely global client state, not as a database for server data.',
    mentalModel:
      'One store, one source of truth for cross-cutting concerns: session, permissions, workflow state. The store is a control room, not a warehouse — you do not store a million transactions in it.',
    memoryTip:
      'RTK = slices + thunks + selectors. Use for: auth/session, RBAC, cross-portal workflow state. Do NOT use as a database for millions of rows.',
    keyTerms: ['store', 'slice', 'reducer', 'selector', 'createAsyncThunk', 'middleware', 'normalised state'],
    interviewAnswer:
      'Redux Toolkit is the modern Redux API: createSlice generates actions and reducers together, createAsyncThunk encapsulates the loading/fulfilled/rejected lifecycle for async calls, and reselect selectors derive data with memoization. Redux earns its place when state is genuinely global and transition-heavy — in a banking portal: the authenticated session, the user’s roles and permissions, feature flags, and multi-step workflow state that several distant components share. It is the wrong tool for server data at scale: cloning transaction tables into the store duplicates the backend’s job, bloats memory, and re-introduces staleness bugs that a server-cache library already solved. The senior answer states when NOT to use it: local UI state stays local; server data goes to a query cache; and Redux never becomes a browser database.',
    practicalExample:
      'NexusBank keeps an auth slice (user, roles, permissions, token expiry), a UI slice (portal mode, density, pinned filters) and a workflow slice (multi-step fraud review with its own state machine). Transactions live in TanStack Query keyed by search parameters; the audit trail is fetched per case, never dumped into the store wholesale.',
    commonMistakes: [
      'Storing large server datasets in Redux "so every component can access them" — memory bloat and staleness management you must now hand-roll.',
      'Duplicating server responses into local component state after dispatching.',
      'Non-memoized selectors recomputing on every store change, causing re-render storms.',
      'Reaching for Redux because "the app is big" without a global-state requirement.',
    ],
    seniorInsight:
      'The interview question behind the question is "when should Redux NOT be used?" Answer: when the state is server-owned (use a cache layer), when it is local (useState), or when the only consumer chain is two components (lift state or context). Redux earns its complexity when multiple portals share session/permission/workflow state with strict auditability of transitions.',
    aiAwareness: {
      strongAnswerShouldMention: ['RTK slices', 'thunks', 'memoized selectors', 'when NOT to use Redux', 'server state vs client state'],
      weakAnswer: 'Redux manages all app data in one store.',
      redFlags: ['Suggesting millions of transactions belong in the store.', 'No trade-off discussion vs query caches.'],
      likelyFollowUp: ['When would you still choose Redux in 2025?', 'How do you keep Redux from becoming a stale database?'],
    },
    prerequisites: ['react-state-taxonomy'],
    relatedTopics: ['react-tanstack-query', 'react-security-rbac'],
    nextTopics: ['react-tanstack-query'],
    references: [
      { title: 'Redux Toolkit — Official docs', url: 'https://redux-toolkit.js.org/', source: 'Redux', type: 'official' },
    ],
  },

  {
    id: 'react-tanstack-query',
    technology: 'react',
    title: 'TanStack Query — Server State',
    category: 'State Management',
    slug: 'react-tanstack-query',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'TanStack Query treats server data as a cache with a lifecycle — declarative fetching, caching, invalidation, retries and optimistic updates, keyed by a query key that is the request’s identity.',
    mentalModel:
      'useState + useEffect fetching is hand-building a cache badly. TanStack Query is that cache done right: key = identity, staleTime = freshness policy, invalidation = telling the cache the truth changed.',
    memoryTip:
      'Query key = request identity. staleTime = how long the cache is trusted. invalidateQueries = "your copy is outdated, refetch". Optimistic update = write UI first, reconcile after.',
    keyTerms: ['useQuery', 'useMutation', 'query key', 'staleTime', 'invalidation', 'optimistic update', 'background refetch'],
    interviewAnswer:
      'TanStack Query manages server state: useQuery(queryKey, fetcher) returns cached data, loading and error states, deduplicates identical requests, refetches on window focus or reconnect, retries failures, and cancels obsolete requests when the key changes — the AbortController race-condition handling is built in. useMutation wraps mutations with invalidation: after a successful payment, invalidate the transactions and balances queries so every mounted consumer refetches. Query keys are the request identity — structured arrays like ["transactions", filters] make caching, staleness and invalidation precise. Optimistic updates mutate the cache immediately and roll back on error, which is how a payment feels instant while the backend remains the source of truth. The senior framing: client state ≠ server state; you stop hand-rolling loading flags, caches and cancellation and get them correct by default.',
    practicalExample:
      'NexusBank transaction search: ["transactions", filters, cursor] is the key — every filter change is a new cache entry, back/forward navigation hits the cache instantly, staleTime avoids refetching within 30s, and submitting a payment invalidates ["transactions"] and ["accounts"] so balances and lists update everywhere without manual wiring.',
    codeExample: `const { data, isPending, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: ({ signal }) => fetchTransactions(filters, signal),
  staleTime: 30_000,
});

const mutation = useMutation({
  mutationFn: createPayment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
  },
});`,
    commonMistakes: [
      'Putting volatile inputs (Date.now(), random IDs) into query keys — cache misses forever.',
      'Copying query results into local state instead of deriving from the cache.',
      'Skipping invalidation after mutations — the UI shows yesterday’s balances.',
      'Using it as a global store for UI state that never touches the network.',
    ],
    seniorInsight:
      'The senior framing: server state has properties local state does not — it is shared, stale the moment you receive it, and needs cancellation, retries and invalidation. TanStack Query encodes those properties; hand-rolled useEffect fetching re-discovers them one bug at a time. Mentioning cache-as-source-of-truth plus invalidation after mutations is the senior signal.',
    aiAwareness: {
      strongAnswerShouldMention: ['query key identity', 'staleTime vs gcTime', 'invalidation', 'optimistic updates', 'deduplication'],
      weakAnswer: 'It is a fetching library like axios.',
      redFlags: ['No invalidation story after mutations.', 'Not knowing what staleTime does.'],
      likelyFollowUp: ['How do optimistic updates roll back on failure?', 'Query keys vs Redux state — what belongs where?'],
    },
    prerequisites: ['react-state-taxonomy'],
    relatedTopics: ['react-redux-toolkit', 'react-request-cancellation'],
    nextTopics: ['react-ts-props'],
    references: [
      { title: 'TanStack Query — Overview', url: 'https://tanstack.com/query/latest', source: 'TanStack', type: 'official' },
    ],
  },
];
