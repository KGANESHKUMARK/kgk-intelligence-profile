import type { LearningTopic } from '../../../types';

export const reactHooksTopics: LearningTopic[] = [
  {
    id: 'react-useeffect',
    technology: 'react',
    title: 'useEffect — Synchronising with External Systems',
    category: 'Hooks',
    slug: 'react-useeffect',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'useEffect synchronises a component with an external system (server, subscription, timer, DOM) — it runs after render, and its cleanup keeps that synchronisation correct over time.',
    mentalModel:
      'Effect = synchronize with an external system. Not "run code after render", not "a lifecycle method", not "where fetches go by default". Setup + cleanup = subscribe + unsubscribe.',
    memoryTip:
      'Effect = synchronize. Every effect that starts something (fetch, timer, listener, subscription) must clean it up. Missing cleanup = leaks, duplicate calls, stale responses.',
    keyTerms: ['dependency array', 'cleanup function', 'stale closure', 'race condition', 'AbortController', 'external system'],
    visualIds: ['react-useeffect-lifecycle'],
    interviewAnswer:
      'useEffect runs after the component is painted, letting you synchronise with systems outside React: fetching data, subscribing to WebSocket events, setting timers, or reading layout. The dependency array declares which reactive values the effect reads; React re-runs the effect when any of them change, after calling the previous cleanup. Cleanup functions cancel what the effect started — aborting in-flight requests, clearing timers, unsubscribing — which is what prevents memory leaks and stale-response race conditions. The mental model from the React docs is the anchor: effects synchronise with external systems; if your logic does not involve an external system, it usually does not belong in an effect.',
    detailedExplanation:
      'On mount: render → paint → effect. On update with changed deps: cleanup(old) → render → paint → effect(new). On unmount: cleanup(final). Three classic production bugs: (1) stale closures — the effect captured the state from the render it was created in; fix with functional updates or by adding the value to deps; (2) race conditions — two in-flight requests resolve out of order and the older response overwrites the newer one; fix with AbortController cancellation or an ignore flag; (3) missing cleanup — duplicate WebSocket subscriptions in StrictMode dev double-invoke, leaking connections. Effects with no dependency array run after every render; an empty array runs once on mount but still closes over the initial props/state — a common source of "why is this value always the first one" bugs.',
    codeExample: `function useTransactions(customerId: string) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(\`/api/transactions?customerId=\${customerId}\`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setTxns)
      .catch((err) => { if (err.name !== 'AbortError') reportError(err); });
    return () => controller.abort(); // cleanup cancels obsolete requests
  }, [customerId]);
  return txns;
}`,
    whyOutput:
      'When the user switches customer, the cleanup aborts the previous request before the new effect fires — the UI can never show transactions for the wrong customer.',
    commonMistakes: [
      'Using useEffect for derived state — compute during render instead.',
      'Fetching in every child instead of lifting to a cache layer (TanStack Query) — waterfall requests and duplicated calls.',
      'Suppressing the dependency array with eslint-disable and silently creating stale-closure bugs.',
      'Missing cleanup for timers, listeners and subscriptions — duplicated in React 18 Strict Mode.',
      'Treating useEffect as a lifecycle hook ("componentDidMount") instead of a synchronisation mechanism.',
    ],
    seniorInsight:
      'The senior signal is knowing when NOT to use useEffect: deriving data during render, handling events in event handlers, resetting state with a key. Server data belongs in a cache layer (TanStack Query), not hand-rolled effects. What remains is genuinely external synchronisation — and there, the cleanup discipline is the difference between a demo and a production system.',
    aiAwareness: {
      strongAnswerShouldMention: ['synchronise with external systems', 'cleanup', 'stale closures', 'race conditions', 'AbortController', 'when not to use'],
      weakAnswer: 'useEffect is where you put API calls and side effects.',
      redFlags: [
        'Describing useEffect as componentDidMount equivalent.',
        'No mention of cleanup or dependency arrays.',
        'Never mentioning race conditions or stale closures.',
      ],
      likelyFollowUp: [
        'Walk through a race condition in a search box and how you fix it.',
        'When should you NOT use useEffect?',
        'What runs first — cleanup or the new effect?',
      ],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-request-cancellation', 'react-useref', 'react-tanstack-query'],
    nextTopics: ['react-useref'],
    references: [
      { title: 'Synchronizing with Effects', url: 'https://react.dev/learn/synchronizing-with-effects', source: 'react.dev', type: 'official' },
      { title: 'You Might Not Need an Effect', url: 'https://react.dev/learn/you-might-not-need-an-effect', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-useref',
    technology: 'react',
    title: 'useRef — Mutable Values That Do Not Re-render',
    category: 'Hooks',
    slug: 'react-useref',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'useRef returns a stable box whose .current can be mutated freely without triggering a re-render — for DOM access and for values that must survive renders without affecting rendering.',
    mentalModel:
      'State is a whiteboard everyone looks at (changes trigger re-render). Ref is a sticky note in your pocket (you can read/update it silently). Same sticky note across all renders.',
    memoryTip:
      'Ref = value that persists but does NOT render. DOM access, timer IDs, previous values, "does this exist yet" flags. If UI must update, it is state, not a ref.',
    keyTerms: ['ref object', 'current', 'DOM node', 'mutable', 'no re-render', 'latest value pattern'],
    interviewAnswer:
      'useRef serves two jobs. First, DOM access: attaching a ref to an element gives a handle for focus management, scroll positioning, measurements and third-party widgets — imperative work React does not model declaratively. Second, instance-like mutable storage: a value that persists across renders but whose changes should not re-render (timer IDs, previous-value tracking, "has mounted" flags, latest-callback holders). Writing to a ref during render is prohibited — mutate it in effects or event handlers. The key interview distinction: state changes trigger re-renders; refs do not. Choosing wrong in either direction causes bugs — state for non-render data causes re-render storms; refs for UI-relevant data causes stale UI.',
    practicalExample:
      'In the NexusBank payment modal, a ref focuses the amount field when the dialog opens (accessibility), a ref stores the WebSocket handle so reconnect logic can close it, and a ref holds the latest abort controller so a rapid "change beneficiary" click cancels the stale beneficiary-validation request.',
    commonMistakes: [
      'Reading/writing refs during render — ref mutation belongs in effects and handlers.',
      'Using refs for values the UI displays — the UI will not update.',
      'Assuming ref.current is set on first render before effects run (it is null until the DOM mounts).',
    ],
    seniorInsight:
      'Refs are the escape hatch from the declarative model — use them for interop (focus, measurements, animation) and for values that are genuinely outside the render story. A codebase smell is refs holding business state: that state is invisible to React DevTools and to the component’s own render, which is how desynchronised UIs happen in payment review screens.',
    aiAwareness: {
      strongAnswerShouldMention: ['DOM access', 'no re-render on mutation', 'timers/subscriptions', 'latest-value pattern', 'render-phase restriction'],
      weakAnswer: 'useRef is like useState but faster.',
      redFlags: ['Not knowing refs do not trigger re-renders.', 'Mutating refs during render.', 'Never mentioning focus management.'],
      likelyFollowUp: ['How do you keep "latest value" inside a setInterval closure?', 'useRef vs useState for a form field?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-usememo-usecallback', 'react-usereducer-custom-hooks'],
    nextTopics: ['react-usememo-usecallback'],
    references: [
      { title: 'Referencing Values with useRef', url: 'https://react.dev/reference/react/useRef', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-usememo-usecallback',
    technology: 'react',
    title: 'useMemo & useCallback',
    category: 'Hooks',
    slug: 'react-usememo-usecallback',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'useMemo caches a computed value and useCallback caches a function identity between renders — both are performance tools that pay rent only when the work they skip is more expensive than the cache.',
    mentalModel:
      'Memo = cached VALUE. Callback = cached FUNCTION. Both are reference-stability tools: they matter only when something downstream compares by reference (React.memo child, dependency array, effect).',
    memoryTip:
      'useMemo → value. useCallback → function. Both answer one question: "did the reference change?" If nothing downstream compares references, the hook is pure overhead.',
    keyTerms: ['referential equality', 'memoization', 'dependency array', 'React.memo', 'referential equality', 'premature optimization'],
    interviewAnswer:
      'useMemo recomputes a value only when its dependencies change; useCallback returns a stable function identity for the same purpose. They matter because React compares by reference: a new inline object/array/function each render breaks React.memo on children, re-triggers effects, and re-runs expensive computations. Correct use: expensive derivations over large data (filtering 100k transactions), stable callbacks passed to memoized children, and stabilising dependencies of effects. Incorrect use adds memory overhead, stale-value risk and noise — measuring with the React Profiler comes first. The rule: memoize when there is a measured problem or a reference-comparison contract, not by default.',
    detailedExplanation:
      'Reference equality is the underlying mechanism: Object.is comparisons decide both dependency arrays and React.memo bailouts. A new inline object/array/function is never "equal" to its previous self, so it defeats memoization downstream. The performance decision tree: (1) is the computation actually expensive (large list filter/sort, heavy aggregation)? (2) does the value’s identity matter to a memo child or effect? (3) do the dependencies change less often than every render? Only when all three say yes is useMemo a win. useCallback alone does nothing for rendering unless the consumer is memoized — memoizing a callback passed to a non-memo child just wastes memory. Dependencies must be complete; lying about deps (omitting a used value) produces stale closures that are far worse than a wasted computation.',
    codeExample: `// Expensive derivation over a large dataset — memoize
const highRisk = useMemo(
  () => txns.filter(t => t.riskLevel === 'HIGH' && t.amount > 10000),
  [txns],
);

// Stable handler passed to a memoized row
const onApprove = useCallback((id: string) => approveTxn(id), []);

const Row = React.memo(function Row({ txn, onApprove }: RowProps) { /* ... */ });`,
    whyOutput:
      'Without useMemo, every parent keystroke re-filters 100k rows; with it, the filter reruns only when txns changes. The memoized Row skips re-render unless its transaction or callback identity changes.',
    commonMistakes: [
      'Memoizing everything "for performance" — each memo costs memory and comparison time.',
      'Wrapping a callback in useCallback but passing it to a non-memoized child — zero benefit.',
      'Incomplete dependency arrays as a "fix" for re-runs — creates stale-closure bugs.',
      'Memoizing trivial computations (string concat) where the memo bookkeeping costs more than the work.',
    ],
    seniorInsight:
      'Measure → Find → Fix → Verify. The senior answer is never "sprinkle useMemo". Profile first: is it a render problem (React.memo + stable props), a computation problem (useMemo), or a DOM problem (virtualization)? In the transactions grid, memoizing row components only works when every prop is stable — which is why useCallback/useMemo exist as a system, not as decoration.',
    aiAwareness: {
      strongAnswerShouldMention: ['reference equality', 'memoized child needs stable props', 'measure first', 'dependency completeness', 'when it is wasted'],
      weakAnswer: 'useMemo makes React faster, so use it everywhere.',
      redFlags: ['Cannot explain reference vs value equality.', 'No measurement step before optimizing.', 'Thinks useCallback alone speeds up rendering.'],
      likelyFollowUp: ['When does useCallback have zero effect?', 'How do you verify a memoization actually helped?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-react-memo', 'react-reconciliation', 'react-ts-generics-hooks'],
    nextTopics: ['react-usecontext'],
    references: [
      { title: 'useMemo', url: 'https://react.dev/reference/react/useMemo', source: 'react.dev', type: 'official' },
      { title: 'useCallback', url: 'https://react.dev/reference/react/useCallback', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-usecontext',
    technology: 'react',
    title: 'useContext & Prop Drilling',
    category: 'Hooks',
    slug: 'react-usecontext',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Context broadcasts a value down the tree without prop drilling — every consumer re-renders when the context value changes, so it is for low-frequency global data, not high-frequency app state.',
    mentalModel:
      'Context is a radio broadcast: every tuned-in receiver re-renders when the broadcast changes. Great for auth/session/theme; expensive for keystroke-level state.',
    memoryTip:
      'Context = dependency injection for the tree. Auth, theme, locale, feature flags — yes. Rapidly-changing state — no (split state, memoize value, or use a store).',
    keyTerms: ['context', 'provider', 'prop drilling', 're-render scope', 'value identity', 'split contexts'],
    visualIds: ['react-render-scope'],
    interviewAnswer:
      'Context solves prop drilling: passing a value through components that do not use it. A provider supplies a value; useContext reads the nearest provider’s value, and all consumers re-render whenever that value’s reference changes. That cost is the senior-level nuance: context is not a state manager — it is a transport. Putting rapidly changing state (search input, live transaction feed) in context re-renders every consumer on every change. The standard mitigations: keep contexts small and domain-scoped (AuthContext, ThemeContext), memoize the provider value, split state and dispatch into separate contexts, or move high-frequency state to a store/cache layer (Redux, TanStack Query) instead.',
    practicalExample:
      'NexusBank uses an AuthContext (user, roles, permissions) consumed by a <Can> component that gates UI by permission — it changes once per session. The live transaction feed deliberately does NOT use context: every consumer would re-render on each of the ~50 events/second; that state lives in a store with selector-based subscriptions.',
    commonMistakes: [
      'Putting everything in one giant AppContext — every change re-renders every consumer.',
      'Forgetting the provider (useContext returns the default value silently).',
      'Creating the context value inline without memoization, defeating consumer memo.',
      'Using context to avoid prop drilling of data that a component library prop (children/composition) would solve structurally.',
    ],
    seniorInsight:
      'Context is not a state manager — it is a delivery mechanism. The senior question is "who re-renders when this changes?" If the answer is "most of the app, often", context is the wrong tool. RBAC is the canonical good use: permissions change at login, not per keystroke, and every corner of the UI needs them.',
    aiAwareness: {
      strongAnswerShouldMention: ['prop drilling', 'consumer re-renders', 'provider value memoization', 'split contexts', 'not a state manager'],
      weakAnswer: 'Context is Redux but built into React.',
      redFlags: ['No mention of the re-render cost.', 'Using context for rapidly changing state at scale.'],
      likelyFollowUp: ['How do you stop a context change from re-rendering the whole page?', 'Context vs Redux vs TanStack Query?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-usereducer-custom-hooks', 'react-state-taxonomy', 'react-security-rbac'],
    nextTopics: ['react-usereducer-custom-hooks'],
    references: [
      { title: 'Passing Data Deeply with Context', url: 'https://react.dev/learn/passing-data-deeply-with-context', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-usereducer-custom-hooks',
    technology: 'react',
    title: 'useReducer & Custom Hooks',
    category: 'Hooks',
    slug: 'react-usereducer-custom-hooks',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'useReducer centralises state transitions into a pure reducer function — and extracting custom hooks turns stateful logic into a reusable, testable unit.',
    mentalModel:
      'A reducer is a vending machine: (currentState, action) → nextState, always. Custom hooks are libraries of behaviour: useTransactions(query) hides fetch/cancel/cache wiring behind one call.',
    memoryTip:
      'Many related fields + transitions between them = useReducer. Reuse the logic across components = custom hook. Custom hooks must follow the rules of hooks too.',
    keyTerms: ['reducer', 'action', 'dispatch', 'custom hook', 'useDebounce', 'useFetch', 'separation of concerns'],
    visualIds: ['react-payment-flow'],
    interviewAnswer:
      'useReducer manages state that changes through defined transitions: dispatch(action) → reducer(state, action) → next state. It shines when several fields update together, when transitions have rules (a payment can go PENDING → COMPLETED or FAILED, never back), or when the update logic is complex enough that inline setState calls become error-prone. Custom hooks are the reusability layer: any stateful logic (fetching with cancellation, debounced values, media queries, localStorage sync) becomes a function other components consume — the same hook, one implementation, tested once. Together they scale: a usePaymentFlow hook can own a reducer modelling the payment state machine (idle → reviewing → submitting → success/failed) so no component re-implements the rules.',
    practicalExample:
      'The NexusBank transfer wizard models its flow as a reducer: SUBMIT while status is "submitting" is ignored (duplicate-submission guard), RETRY is only valid from "failed", and RESET returns to idle. Five components (form, review, confirmation, error banner, stepper) all read the same machine instead of each keeping partial copies of the flow state.',
    codeExample: `type PaymentState =
  | { status: 'idle' }
  | { status: 'reviewing'; draft: PaymentDraft }
  | { status: 'submitting'; draft: PaymentDraft }
  | { status: 'success'; txnId: string }
  | { status: 'failed'; error: string; draft: PaymentDraft };

function reducer(s: PaymentState, a: Action): PaymentState {
  switch (a.type) {
    case 'SUBMIT':
      // Guard: ignore duplicate submits — backend enforces idempotency too
      return s.status === 'reviewing' ? { status: 'submitting', draft: a.draft } : s;
    case 'SUCCESS': return { status: 'success', txnId: a.txnId };
    case 'FAIL':   return { status: 'failed', error: a.error, draft: a.draft };
    case 'RESET':  return { status: 'idle' };
    default: return s;
  }
}`,
    commonMistakes: [
      'Reducers with side effects (API calls inside the reducer) — reducers must be pure; do effects after dispatch.',
      'Writing a custom hook that returns a new function/object every render without useCallback — re-renders every consumer.',
      'Reaching for useReducer for a single boolean — useState is the right tool there.',
    ],
    seniorInsight:
      'Reducers make illegal state transitions unrepresentable — the same discipline as discriminated unions on the type level. In BFSI flows (payment approval, KYC states), encoding the state machine in a reducer gives you an auditable transition table, which is exactly what an auditor or a senior interviewer wants to hear.',
    aiAwareness: {
      strongAnswerShouldMention: ['pure reducer', 'state machine thinking', 'custom hook reuse', 'when useReducer over useState'],
      weakAnswer: 'useReducer is the old Redux way of doing state.',
      redFlags: ['Putting side effects in the reducer.', 'No clear criteria for when to choose useReducer.'],
      likelyFollowUp: ['When do you choose useReducer over useState?', 'How do you test a custom hook?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-usecontext', 'react-state-taxonomy', 'react-ts-generics-hooks'],
    nextTopics: ['react-react-memo'],
    references: [
      { title: 'Extracting State Logic into a Reducer', url: 'https://react.dev/learn/extracting-state-logic-into-a-reducer', source: 'react.dev', type: 'official' },
    ],
  },
];
