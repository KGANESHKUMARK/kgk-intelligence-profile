import type { InterviewQuestion } from '../../../types';

/** React interview questions — fundamentals, hooks, state. */
export const reactCoreQuestions: InterviewQuestion[] = [
  {
    id: 'q-react-re-render',
    question: 'What causes a React component to re-render?',
    category: 'React Core',
    difficulty: 'intermediate',
    quickAnswer:
      'Three triggers: its own state changed, a context it consumes changed, or its parent re-rendered. Re-rendering does not mean the DOM changed — reconciliation may find nothing to commit.',
    interviewAnswer:
      'A component re-renders when React calls its function again. That happens when: (1) its state or reducer dispatches an update, (2) a context value it consumes changes, or (3) its parent re-renders — regardless of whether the props actually differ, because props are compared only if the component is memoized. Re-rendering is cheap by design: it produces a new element tree that reconciliation diffs against the previous one, and only differences reach the DOM in the commit phase. The performance question is therefore not "how do I stop re-renders" but "which re-renders are wasted" — answered with the React Profiler, then fixed with memo, stable props, state colocation or moving state down the tree.',
    detailedAnswer:
      'Concretely: setState with the same value still re-renders once (React bails out after verifying); context consumers re-render on every provider value change — an inline object literal in the provider recreates the value each render and defeats memoized consumers; a parent re-render re-renders all children unless the child is memoized and its props are shallow-equal. React 18 batches all updates automatically, including in promises and timeouts, so "multiple setState calls" are rarely the problem people think they are. The fix hierarchy: colocate state as deep as possible, pass components as children instead of render-triggering props, memoize expensive subtrees, and only then reach for useMemo/useCallback.',
    seniorAnswer:
      'At senior level, frame it as render-scope design. The dashboard anti-pattern: one page component owns search text, filters and selection, so every keystroke re-renders a 10k-row grid. The fixes, in order of preference: move state down (the search input owns its own text), compose (pass the grid as children so parent re-renders don\'t touch it), memoize the grid and stabilise its props, and keep server data in a query cache so it doesn\'t re-render transitively. Measure each step in the Profiler — "renders: 41 → 3" is the interview-winning sentence, not the hook names.',
    keyTerms: ['re-render trigger', 'context consumers', 'batching', 'React.memo', 'render scope', 'Profiler'],
    conceptsTested: ['rendering model', 're-render triggers', 'performance instinct'],
    relatedTopics: ['react-state', 'react-react-memo', 'react-reconciliation'],
    followUps: ['q-react-memo-vs-usememo', 'q-react-context-rerenders'],
    commonMistakes: [
      'Saying "when state or props change" and stopping — parent renders re-render children regardless of props.',
      'Believing a re-render always updates the DOM.',
      'Not knowing context consumers re-render on every provider value change.',
    ],
    strongAnswerKeywords: ['parent renders', 'context', 'batching', 'Profiler', 'memo'],
    interviewerIntent: 'Distinguish candidates who memorised "state changes" from those who understand React’s render model and can reason about re-render scope.',
    aiAwareness: {
      strongAnswerShouldMention: ['three triggers', 'parent render', 'context value identity', 'batching', 'profiling before optimizing'],
      weakAnswer: 'When the state changes.',
      redFlags: ['No mention of parent-driven re-renders.', 'Confusing re-render with DOM update.'],
      likelyFollowUp: ['How do you stop a parent re-render from re-rendering a heavy child?'],
    },
  },

  {
    id: 'q-react-keys',
    question: 'Why do lists need keys, and why is the array index a dangerous key?',
    category: 'React Core',
    difficulty: 'intermediate',
    quickAnswer:
      'Keys give elements a stable identity across renders so React can match old and new trees. Index keys change meaning when the list reorders, causing wrong DOM reuse, corrupted local state and lost focus.',
    interviewAnswer:
      'During reconciliation React matches children between renders by key. A stable key says "this DOM node and its state belong to that data item", so React can insert, delete and reorder efficiently while preserving element state — input values, focus, animations. With index keys, a prepend shifts every item’s key: row 0 now points to different data, so React patches the existing nodes in place instead of moving them. The visible bugs: an in-progress edit jumps to a different row after a background refresh inserts a newer transaction, controlled inputs show another row’s value, and focus jumps. Index keys are acceptable only for static, never-reordered, never-filtered lists.',
    detailedAnswer:
      'The failure is state identity, not just perf. Component-local state (uncontrolled input value, expanded/collapsed, scroll position) lives keyed by the element’s key. Reorder with index keys and the state stays with the position: the third row’s "draft memo" text now renders under a different transaction. Prepending to a feed is the classic production incident: new transactions arrive at the top, every index shifts, and every row’s local state silently reassigns. Also: key={Math.random()} forces full remount every render — worse than index. The rule: key = stable identity from the data (transactionId, customerId); index only when the list is static and never reordered.',
    seniorAnswer:
      'Senior candidates connect keys to the reconciliation contract and to real failure modes: a transactions table that prepends live updates will corrupt editable row state with index keys — the fix is keying by transactionId and, for live feeds, combining cursor pagination with stable keys so new arrivals don’t shift identity. Also worth naming: keys deliberately reset component state (changing key on a modal remounts it fresh), which is a feature when intentional. And in virtualized lists, stable keys are mandatory — rows unmount/remount on scroll, and index keys would scramble row state during scroll.',
    codeExample: `// BAD: index key + live prepend corrupts row state
{txns.map((t, i) => <TxnRow key={i} txn={t} />)}

// GOOD: stable identity from the data
{txns.map((t) => <TxnRow key={t.transactionId} txn={t} />)}`,
    keyTerms: ['key = identity', 'reconciliation', 'index anti-pattern', 'state preservation', 'prepend shift'],
    conceptsTested: ['reconciliation', 'key semantics', 'concrete failure reasoning'],
    relatedTopics: ['react-lists-keys', 'react-virtualization'],
    followUps: ['q-react-reconciliation'],
    commonMistakes: ['Using index keys on sortable/filterable lists.', 'Saying keys are "for performance" only.', 'Generating keys at render time.'],
    strongAnswerKeywords: ['identity', 'reconciliation', 'state preservation', 'prepend scenario'],
    interviewerIntent: 'Separate candidates who recite "keys help performance" from those who can describe the exact DOM/state corruption an index key causes.',
    aiAwareness: {
      strongAnswerShouldMention: ['identity across renders', 'index + reorder failure', 'state preservation', 'deliberate key reset'],
      weakAnswer: 'Keys are needed to make lists fast.',
      redFlags: ['No concrete failure example.', 'Recommending index keys for dynamic lists.'],
      likelyFollowUp: ['When is the index key actually fine?', 'What happens to component state when a key changes?'],
    },
  },

  {
    id: 'q-react-controlled-uncontrolled',
    question: 'Controlled vs uncontrolled components — how do you choose for a payment form?',
    category: 'React Core',
    difficulty: 'intermediate',
    quickAnswer:
      'Controlled: React state owns the value (value + onChange) — required for validation, formatting and cross-field rules. Uncontrolled: the DOM owns it, read via ref on submit. Payment forms are controlled because amount, limits and review screens need a single source of truth.',
    interviewAnswer:
      'A controlled input mirrors its value from state on every keystroke; an uncontrolled input keeps its value in the DOM and exposes it via ref. Controlled inputs enable instant validation, input masking (currency formatting), conditional fields, and a submit-time snapshot that is guaranteed consistent with what the user saw — which is exactly what a payment review screen needs. Uncontrolled inputs (ref + defaultValue) are cheaper — no re-render per keystroke — and fine for simple forms. Large banking forms typically use React Hook Form: uncontrolled under the hood with subscription-based re-renders, controlled-style APIs, and schema validation (zod) for cross-field rules like "amount ≤ available balance".',
    detailedAnswer:
      'The decision criteria: does any logic need the value before submit? Currency masking, enabling "Review" only when valid, cross-field checks (amount vs account limit) — all need React to own the value, i.e. controlled. A settings form with one text field and a Save button loses nothing uncontrolled. The hybrid reality: RHF registers fields (uncontrolled perf) while exposing watch/getValues (controlled ergonomics). Senior candidates mention the failure mode of naive controlled inputs: re-render storms on large forms — solved by field-level subscription (RHF) rather than lifting every keystroke to page state.',
    seniorAnswer:
      'For a payment form specifically: controlled semantics are non-negotiable for the money fields — the review screen must render exactly the state that will be submitted, formatted and validated identically. I would use RHF with a zod schema for cross-field rules (amount vs account limit, currency vs beneficiary country), async validation for beneficiary checks, and keep the submit path idempotent — the form state machine (draft → reviewing → submitting) lives in a reducer so double-submit is structurally impossible, with the backend idempotency key as the real guarantee.',
    codeExample: `// Controlled: state is the single source of truth
const [amount, setAmount] = useState('');
<input value={amount} onChange={(e) => setAmount(formatSGD(e.target.value))} />`,
    keyTerms: ['controlled component', 'uncontrolled component', 'ref', 'React Hook Form', 'schema validation', 'review-screen parity'],
    conceptsTested: ['source of truth', 'validation strategy', 'performance trade-offs'],
    relatedTopics: ['react-forms', 'react-ts-props'],
    commonMistakes: ['Declaring controlled "always better" without the perf trade-off.', 'No mention of review-screen consistency for payments.'],
    strongAnswerKeywords: ['source of truth', 'validation timing', 'RHF subscriptions', 'formatted input'],
    interviewerIntent: 'Check whether the candidate grounds form strategy in correctness (submitted value == reviewed value), not just preference.',
    aiAwareness: {
      strongAnswerShouldMention: ['source of truth', 'validation timing', 'per-field re-render control', 'money-field formatting'],
      weakAnswer: 'Always use controlled inputs.',
      redFlags: ['No trade-off discussion.', 'Unaware that RHF is uncontrolled under the hood.'],
      likelyFollowUp: ['How do you validate amount against balance without janky per-keystroke calls?'],
    },
  },

  {
    id: 'q-react-useeffect-cleanup',
    question: 'Walk me through useEffect cleanup — what breaks without it?',
    category: 'Hooks',
    difficulty: 'senior',
    quickAnswer:
      'Without cleanup, everything the effect started keeps running after the component unmounts or re-runs: duplicate subscriptions, orphaned timers, leaked WebSocket connections, and stale responses overwriting fresh data.',
    interviewAnswer:
      'Effects that start something — fetch, subscribe, setInterval, addEventListener — must stop it in cleanup: abort the request, unsubscribe, clear the timer, remove the listener. Without cleanup you get duplicate subscriptions under Strict Mode (mount → unmount → mount in dev), timers firing into unmounted components, and race conditions where an older fetch resolves after a newer one and overwrites the UI with wrong data. The dependency array controls when cleanup+effect re-run: on every dependency change, cleanup(old) runs before effect(new). The mental model from the React docs: effects synchronise the component with an external system; cleanup restores the previous synchronisation.',
    detailedAnswer:
      'Concrete failures: a transaction-search effect without an AbortController lets a slow "Sep" response overwrite a fast "September" result (classic race); a component subscribing to a live feed on mount without unsubscribing on unmount leaks the socket and keeps re-rendering a dead panel under Strict Mode double-invocation; a polling setInterval without clearInterval stacks a new timer per dependency change. Fixes: return a cleanup that aborts/clears/unsubscribes; for fetches either AbortController or an ignore flag; for "latest value wins" use the query cache with keyed identity instead of hand-rolled effects.',
    seniorAnswer:
      'The senior layer is knowing when NOT to reach for useEffect at all: derived data → compute during render; user actions → event handlers; server data → query cache with invalidation; app-wide reactions → subscriptions owned above React. Effects exist to synchronise with external systems — everything else in an effect is usually a symptom of fighting the model. I would also mention React 18 Strict Mode intentionally double-invokes effects in dev precisely to expose missing cleanup, and that the cleanup must swallow AbortError as normal control flow, not as an error state.',
    codeExample: `useEffect(() => {
  const controller = new AbortController();
  fetchTransactions(query, controller.signal).then(setTxns)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [query]);`,
    expectedOutput: 'Switching the search from "September" to "October" cancels the in-flight September request; only October results can land in state.',
    keyTerms: ['cleanup', 'AbortController', 'race condition', 'Strict Mode', 'external system'],
    conceptsTested: ['effect lifecycle', 'cleanup discipline', 'race conditions'],
    relatedTopics: ['react-useeffect', 'react-request-cancellation'],
    followUps: ['q-react-stale-closure'],
    commonMistakes: ['No cleanup for subscriptions/timers.', 'Treating abort as an error path.', 'Using effects for derivable state.'],
    strongAnswerKeywords: ['synchronize with external system', 'cleanup before re-run', 'AbortController', 'Strict Mode double-invoke'],
    interviewerIntent: 'Distinguish "uses useEffect for fetching" from "understands the synchronisation model and its failure modes".',
    aiAwareness: {
      strongAnswerShouldMention: ['cleanup', 'race conditions', 'AbortController', 'Strict Mode double-invoke', 'when not to use effects'],
      weakAnswer: 'useEffect runs after render for API calls.',
      redFlags: ['No cleanup knowledge.', 'Cannot name a concrete production bug caused by missing cleanup.'],
      likelyFollowUp: ['Why does React 18 Strict Mode run effects twice?', 'When is a fetch NOT an effect?'],
    },
  },

  {
    id: 'q-react-stale-closure',
    question: 'What is a stale closure in React, and where does it bite?',
    category: 'Hooks',
    difficulty: 'senior',
    quickAnswer:
      'A closure captures the variable values from the render it was created in. Inside effects, timers and event handlers registered once, those captured values go stale — the classic bugs are setInterval reading old state and async callbacks reading old props.',
    interviewAnswer:
      'Every render creates new functions capturing that render’s state. If you register a callback once (empty dependency array) or inside a long-lived timer/subscription, it keeps referencing the values from when it was created. Typical failures: a setInterval in a mount-only effect that always sees count = 0; an event listener that reads yesterday’s props; an async fetch callback that setStates based on a captured, outdated value. Fixes: functional updates (setCount(c => c + 1)) so you never read the captured value; a ref for "latest value" access; or including the value in the dependency array so the effect re-creates the closure honestly.',
    detailedAnswer:
      'Mechanically: each render has its own state snapshot and its own function instances; closures bind to those. The lint rule exists because omitting a dependency doesn’t "optimise" — it silently freezes the captured value. Correct patterns: updater functions for state transitions; refs for values that must be read fresh inside stable callbacks (latest-value ref pattern); or restructuring so the effect owns its inputs via deps. In event-handler-heavy BFSI UIs the dangerous variant is a debounced search callback capturing an old filter object — the request goes out with stale filters while the UI shows new ones; the fix is the same: complete deps or a ref for the latest filter snapshot.',
    seniorAnswer:
      'I’d demonstrate it live: a timer that increments a counter reads a stale closure and the badge never advances; fix with functional setState or a ref. Then generalise: stale closures are why exhaustive-deps exists, why useCallback dependencies matter, and why libraries capture props at subscription time (React 18 useSyncExternalStore exists partly to make "latest value" semantics explicit). In review, I look for timers/listeners registered with empty deps that reference state — they are latent bugs that pass every happy-path test.',
    codeExample: `// BUG: always sees count = 0
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // captures count=0
  return () => clearInterval(id);
}, []);

// FIX: functional update — no captured value
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);`,
    expectedOutput: 'The broken version ticks 0→1 then stalls; the functional-update version counts correctly.',
    keyTerms: ['stale closure', 'functional update', 'ref for latest value', 'exhaustive-deps'],
    conceptsTested: ['closures in React', 'stale state in callbacks', 'lint discipline'],
    relatedTopics: ['react-useeffect', 'react-usereducer-custom-hooks'],
    followUps: ['q-react-useeffect-cleanup'],
    commonMistakes: ['Reading state inside setInterval/setTimeout registered once.', 'Disabling exhaustive-deps instead of fixing the closure.'],
    strongAnswerKeywords: ['closure capture', 'functional update', 'ref for latest', 'exhaustive-deps'],
    interviewerIntent: 'Test whether the candidate can connect a JS fundamental (closures) to a real React production bug.',
    aiAwareness: {
      strongAnswerShouldMention: ['closure over render values', 'functional updates', 'refs for fresh reads', 'lint rule as guardrail'],
      weakAnswer: 'It is when useEffect uses old data.',
      redFlags: ['No concrete example.', 'Doesn’t mention functional updates as the fix.'],
      likelyFollowUp: ['How do you fix a stale value inside a mount-only interval?'],
    },
  },

  {
    id: 'q-react-memo-vs-usememo',
    question: 'React.memo vs useMemo vs useCallback — when does each actually help?',
    category: 'Performance',
    difficulty: 'senior',
    quickAnswer:
      'React.memo skips re-rendering a child when its props are shallow-equal. useMemo caches a computed value. useCallback caches a function identity. They only pay off when something downstream compares references — otherwise they are pure overhead.',
    interviewAnswer:
      'React.memo wraps a component so it skips re-rendering when its props are shallow-equal to the previous render. useMemo caches a computed value across renders while its dependencies are unchanged. useCallback returns a stable function identity — it is useMemo for functions. The catch: they work as a system. A memoized child still re-renders if you pass a fresh inline object or arrow function, so the parent must stabilise props with useMemo/useCallback — or better, restructure so the heavy subtree receives stable props naturally (children composition, state colocation). None of it is free: memoization costs memory and comparison time, and incorrect dependency lists cause stale data.',
    detailedAnswer:
      'The reference-equality rule underpins all three: objects, arrays and functions are compared by reference, so a new inline {} or () => … is always "changed". Practical decision tree: (1) Is the child actually expensive? Profile first. (2) Are its props stable? If the parent recreates them every render, memo is inert — fix prop identity first (stable callbacks via useCallback, derived objects via useMemo, or pass primitives). (3) Is the computation itself expensive (filtering 100k rows, formatting thousands of cells)? Then useMemo pays. Memoizing a two-line string concat is negative value. Also: useCallback alone does nothing for rendering unless the consumer is memoized or the function is a hook dependency.',
    seniorAnswer:
      'I frame it as a measured optimisation loop: profile (Profiler flamegraph, why-did-you-render) → identify the actual re-render source → fix the root cause first (state placement, component split) → add memo/useMemo/useCallback where measurement says the subtree is expensive and props can be made stable → verify with numbers. In the transactions grid case: virtualization (DOM count) + memoized rows + stable handlers took a keystroke re-render from 40 components to 3. Quoting that sequence beats naming the APIs — and knowing the failure mode (memo defeated by inline props) is the real senior signal.',
    codeExample: `const Row = React.memo(function Row({ txn, onOpen }: RowProps) { … });

// Parent: keep identities stable or memo is theatre
const onOpen = useCallback((id: string) => open(id), []);
const columns = useMemo(() => buildColumns(), []);
<DataTable rows={page} columns={columns} onOpen={onOpen} />`,
    keyTerms: ['React.memo', 'shallow compare', 'stable props', 'reference equality', 'profiler-driven optimisation'],
    conceptsTested: ['memoization mechanics', 'reference equality', 'measurement discipline'],
    relatedTopics: ['react-usememo-usecallback', 'react-react-memo', 'react-reconciliation'],
    followUps: ['q-react-context-rerenders'],
    commonMistakes: ['Memoizing everything by default.', 'useCallback without a memoized consumer.', 'Incomplete deps causing stale closures.'],
    strongAnswerKeywords: ['shallow compare', 'stable props', 'measure first', 'state placement'],
    interviewerIntent: 'Find out whether the candidate optimises from measurement or from superstition.',
    aiAwareness: {
      strongAnswerShouldMention: ['reference equality', 'memo needs stable props', 'profile first', 'over-memoization cost'],
      weakAnswer: 'useMemo makes things faster.',
      redFlags: ['No measurement step.', 'Memoizing everything by default.'],
      likelyFollowUp: ['A memoized child still re-renders — why?', 'How do you measure whether memoization helped?'],
    },
  },

  {
    id: 'q-react-context-rerenders',
    question: 'A context value changes and the whole page re-renders — how do you fix it?',
    category: 'Performance',
    difficulty: 'senior',
    quickAnswer:
      'Every consumer re-renders when the provider’s value changes. Fix it by splitting contexts (state vs dispatch, domain by domain), memoizing the provider value, moving high-frequency state out of context, or subscribing consumers directly to a store.',
    interviewAnswer:
      'Context is a broadcast: on every provider value change, all useContext consumers re-render — memo on the children does not help because the context read itself is the trigger. First check the value: an inline object literal in the provider creates a new reference every render, so even unchanged data re-renders everyone — memoize it. Then split by change frequency: AuthContext (session-scoped) can live with ThemeContext nowhere; a live transaction feed must not share a context with anything. For high-frequency state, move it to a store with selector-based subscriptions (Redux, Zustand) or keep it local to the component that needs it. The senior point: context is a delivery mechanism, not a state manager — the design question is "who is allowed to re-render when this changes?"',
    detailedAnswer:
      'Concrete playbook for a banking portal: (1) identity-stable provider values via useMemo with honest deps; (2) domain-split contexts — session/permissions change at login, theme changes rarely, neither belongs with transaction data; (3) separate state and dispatch contexts so consumers that only dispatch don’t re-render on state changes; (4) for genuinely hot data (live feed), selector subscriptions so a price tick re-renders only the affected rows; (5) measure with the Profiler’s "why did this render" to confirm the fix. The architect-level point: the same API that makes prop drilling easy makes whole-page re-renders easy — scope is a design decision.',
    seniorAnswer:
      'I’d ask what changed and who consumes it. If the answer is "one value object, many consumers", the usual root cause is an unmemoized provider value plus coarse context boundaries. The durable fix is architectural: context for low-frequency cross-cutting concerns (session, RBAC, theme), a query cache for server state, and selector-based stores for high-frequency data. Then the answer includes numbers: before/after render counts from the Profiler, because "it depends" must end with a measurement.',
    codeExample: `// BAD: new object identity every render → every consumer re-renders
<AuthCtx.Provider value={{ user, roles, refresh }}>

// GOOD: stable value
const value = useMemo(() => ({ user, roles }), [user, roles]);`,
    keyTerms: ['provider value identity', 'selector subscriptions', 'context splitting', 're-render scope'],
    conceptsTested: ['context re-render semantics', 'memoization of provider value', 'architecture alternatives'],
    relatedTopics: ['react-usecontext', 'react-redux-toolkit'],
    followUps: ['q-react-state-taxonomy'],
    commonMistakes: ['Reaching for useMemo everywhere instead of splitting context.', 'Not knowing consumers bypass memo on context change.'],
    strongAnswerKeywords: ['provider value identity', 'split contexts', 'selector subscriptions', 'Profiler verification'],
    interviewerIntent: 'See whether the candidate diagnoses re-render scope before reaching for tools.',
    aiAwareness: {
      strongAnswerShouldMention: ['value identity', 'context splitting', 'selectors', 'measure with Profiler'],
      weakAnswer: 'Use useMemo on everything.',
      redFlags: ['No mention of consumer re-render semantics.', 'No measurement step.'],
      likelyFollowUp: ['When is context the wrong tool entirely?'],
    },
  },

  {
    id: 'q-react-state-taxonomy',
    question: 'How do you decide where a piece of state lives — local, lifted, context, store, or server cache?',
    category: 'State Management',
    difficulty: 'senior',
    quickAnswer:
      'Ask who owns the data and who consumes it: component-local for UI scoped to one subtree; lifted for siblings; context for low-frequency cross-tree concerns; a store for genuinely global client state; a query cache for anything the server owns.',
    interviewAnswer:
      'Start with ownership. If the server owns the truth (accounts, transactions, customer records), it is server state: it belongs in a query cache with keys, staleness and invalidation — not cloned into useState. If the app owns it: modal visibility, tab index, form drafts stay local to the component; lift only when siblings need it; promote to context when the tree is wide and the value changes rarely (theme, session, permissions); move to Redux/Zustand when many distant components share frequently-changing state or when workflow state needs a single auditable machine. The failure mode to avoid is defaulting everything to a global store — it couples every component to every change.',
    detailedAnswer:
      'The taxonomy I apply: server state (transactions, balances, customer records) → TanStack Query with keyed caching and invalidation; session/auth state → context populated at login, consumed by RBAC gates; workflow state (multi-step payment) → reducer colocated with the flow, exposed via a custom hook; ephemeral UI (hover, open/closed, focused field) → local useState; design-system-wide preferences → context or a tiny store. Each tier has a re-render contract: local state re-renders one subtree, context re-renders consumers, stores re-render subscribers. Choosing the narrowest scope that satisfies consumers is what keeps a 500-component portal performant.',
    seniorAnswer:
      'The senior answer names the anti-patterns: copying server data into Redux "so the UI can access it" (two sources of truth, invalidation hell); context for rapidly changing values (broadcast storms); single global store as a dumping ground. Then the trade-off: Redux buys cross-team conventions and devtools auditability at the cost of boilerplate — worth it for auth/permissions/workflow in a large org, overkill for a page-local filter. The one-line summary: client state is what your app owns; server state is a cache of someone else’s truth — never manage both the same way.',
    keyTerms: ['state ownership', 'server state', 'query cache', 'lifting state', 'selector subscriptions'],
    conceptsTested: ['state placement strategy', 'client vs server state', 'scalability reasoning'],
    relatedTopics: ['react-state-taxonomy', 'react-tanstack-query', 'react-redux-toolkit'],
    commonMistakes: ['Defaulting to a global store.', 'Putting server data in local state via useEffect.', 'Context for high-frequency state.'],
    strongAnswerKeywords: ['ownership', 'server state ≠ client state', 'invalidation', 'colocation'],
    interviewerIntent: 'Test architectural judgement about state placement — the most common senior-level design decision.',
    aiAwareness: {
      strongAnswerShouldMention: ['ownership question', 'cache as server truth', 'scope by consumer set'],
      weakAnswer: 'Put everything in Redux.',
      redFlags: ['No distinction between client and server state.', 'Store-first thinking.'],
      likelyFollowUp: ['Where does auth/session state go?', 'When is Redux justified in 2025?'],
    },
  },
];
