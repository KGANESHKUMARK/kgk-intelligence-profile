import type { LearningVisual } from '../../../types';

export const reactVisuals: LearningVisual[] = [
  {
    id: 'react-render-flow',
    topicId: 'react-overview',
    type: 'flow',
    title: 'React Render → Reconcile → Commit',
    description: 'What happens between a state update and pixels on screen.',
    nodes: [
      { id: 'trigger', label: 'State update / props change', description: 'setState, dispatch, or a parent re-render schedules a render.' },
      { id: 'render', label: 'Render phase', description: 'React calls component functions to produce a new element tree. Pure, no side effects, interruptible under concurrent React.' },
      { id: 'reconcile', label: 'Reconciliation (diff)', description: 'New tree is compared with the previous tree by type and key to compute the minimal change set.' },
      { id: 'commit', label: 'Commit phase', description: 'Computed mutations are applied to the DOM synchronously; refs are attached.' },
      { id: 'effects', label: 'Effects (useEffect)', description: 'Cleanup of the previous effect runs, then the new effect — after paint.' },
    ],
    edges: [
      { from: 'trigger', to: 'render', label: 'schedule' },
      { from: 'render', to: 'reconcile' },
      { from: 'reconcile', to: 'commit' },
      { from: 'commit', to: 'effects' },
    ],
    memoryTip: 'Render = call functions → new tree. Reconcile = diff. Commit = touch the DOM. Re-render does NOT mean DOM changed.',
  },

  {
    id: 'react-reconciliation-decision',
    topicId: 'react-reconciliation',
    type: 'decision',
    title: 'Will this child re-render?',
    description: 'The decision path React takes for a child component when its parent renders.',
    nodes: [
      { id: 'parent', label: 'Parent re-renders', description: 'A state/context change triggered the parent to render.' },
      { id: 'memo', label: 'Child wrapped in React.memo?', description: 'Without memo, the child always re-renders when the parent does.' },
      { id: 'props-same', label: 'Props shallow-equal?', description: 'Each prop compared with Object.is. Inline objects/functions are never equal.' },
      { id: 'skip', label: 'Skip render', description: 'Memoized child reuses the previous output — no re-render.' },
      { id: 'render', label: 'Re-render child', description: 'Child function runs; reconciliation decides what reaches the DOM.' },
    ],
    edges: [
      { from: 'trigger', to: 'memo', label: 'parent renders' },
      { from: 'memo', to: 'props-same', label: 'memoized' },
      { from: 'props-same', to: 'skip', label: 'yes' },
      { from: 'props-same', to: 'render', label: 'no' },
    ],
    memoryTip: 'Re-render ≠ DOM update. memo only helps when props are stable — inline objects/functions defeat it.',
  },

  {
    id: 'react-useeffect-lifecycle',
    topicId: 'react-useeffect',
    type: 'lifecycle',
    title: 'useEffect Lifecycle',
    description: 'Mount, update and unmount paths — and where cleanup runs.',
    nodes: [
      { id: 'mount', label: 'Mount', description: 'Render → paint → effect runs. Subscriptions, fetches and timers start here.' },
      { id: 'deps-change', label: 'Dependency changed', description: 'Previous cleanup runs first, then re-render → paint → effect again.' },
      { id: 'cleanup', label: 'Cleanup', description: 'Abort in-flight requests, clear timers, unsubscribe — restores the previous synchronisation.' },
      { id: 'unmount', label: 'Unmount', description: 'Final cleanup runs. Anything not cleaned up leaks.' },
    ],
    edges: [
      { from: 'mount', to: 'deps-changed', label: 'deps changed' },
      { from: 'deps-changed', to: 'cleanup', label: 'cleanup(old) first' },
      { from: 'cleanup', to: 'effect', label: 'effect(new)' },
      { from: 'mount', to: 'unmount', label: 'unmount' },
      { from: 'unmount', to: 'cleanup-final', label: 'final cleanup' },
    ],
    memoryTip: 'Effect = synchronize with an external system. Cleanup = undo it. No cleanup = leak, duplicate, or stale response.',
  },

  {
    id: 'react-data-vs-dom',
    topicId: 'react-virtualization',
    type: 'comparison',
    title: 'Pagination vs Virtualization',
    description: 'Two different bottlenecks: pagination controls data transferred; virtualization controls DOM rendered.',
    columns: [
      {
        label: 'Pagination — controls DATA',
        nodes: [
          { id: 'p1', label: 'Server-side filtering + sorting', description: 'The database does the heavy lifting; the client never holds the full set.' },
          { id: 'p2', label: 'Page / cursor requests', description: 'One page (or one cursor window) in flight at a time; keys/cursors keep results stable.' },
          { id: 'p3', label: 'Cache per page', description: 'Query cache keyed by filters+cursor makes back/forward instant.' },
        ],
      },
      {
        label: 'Virtualization — controls DOM',
        nodes: [
          { id: 'v1', label: 'Full dataset in memory', description: '100k records in JS memory is fine — arrays are cheap.' },
          { id: 'v2', label: 'Only visible rows in DOM', description: '~30 mounted rows instead of 100,000; scroll position maps to a window slice.' },
          { id: 'v3', label: 'Constant DOM cost', description: 'Scroll stays 60fps regardless of dataset size; memory stays flat.' },
        ],
      },
    ],
    memoryTip: 'Pagination = data over the wire. Virtualization = nodes in the DOM. They compose; they do not replace each other.',
  },

  {
    id: 'react-debounce-flow',
    topicId: 'react-debounce-throttle',
    type: 'flow',
    title: 'Debounced Search with Cancellation',
    description: 'Keystrokes → debounce → one request per quiet period → obsolete requests aborted.',
    nodes: [
      { id: 'keys', label: 'Keystrokes: S, Se, Sep…', description: 'Every keystroke would be one API call without debouncing.' },
      { id: 'debounce', label: 'useDebounced(value, 300ms)', description: 'Timer resets on every keystroke; only the final value survives.' },
      { id: 'request', label: 'fetch(query, signal)', description: 'One request per settled query, AbortController signal attached.' },
      { id: 'cancel', label: 'Cleanup aborts previous', description: 'New query → effect cleanup aborts the in-flight old request.' },
      { id: 'render', label: 'Latest result wins', description: 'No stale response can overwrite the current results.' },
    ],
    edges: [
      { from: 'keys', to: 'debounce', label: 'reset timer' },
      { from: 'debounce', to: 'request', label: 'after 300ms quiet' },
      { from: 'request', to: 'cancel', label: 'superseded' },
      { from: 'request', to: 'render', label: 'latest wins' },
    ],
    memoryTip: 'Debounce = WAIT. Cancel = the old request must never paint. Together: 9 keystrokes, 1 API call, 0 races.',
  },

  {
    id: 'react-state-taxonomy-map',
    topicId: 'react-state-taxonomy',
    type: 'decision',
    title: 'Where Should This State Live?',
    description: 'A decision path from "I have state" to the right home for it.',
    nodes: [
      { id: 'start', label: 'Who owns the truth?', description: 'First question: is this data created by the server or by the app?' },
      { id: 'server', label: 'Server owns it → query cache', description: 'Transactions, accounts, customers: TanStack Query with keys + invalidation.' },
      { id: 'client', label: 'App owns it', description: 'UI state, preferences, workflow — continue.' },
      { id: 'local', label: 'One component? → useState', description: 'Modal open, focused field, draft text — keep it local.' },
      { id: 'lift', label: 'Siblings need it? → lift', description: 'Lift to the closest common parent — no further.' },
      { id: 'ctx', label: 'Distant, low-frequency? → Context', description: 'Theme, session, permissions — changes at login, not per keystroke.' },
      { id: 'store', label: 'Large + cross-team? → Redux/RTK', description: 'Workflow state, RBAC, auditable transitions across many portals.' },
    ],
    edges: [
      { from: 'start', to: 'server', label: 'server data' },
      { from: 'start', to: 'local', label: 'client data' },
      { from: 'client', to: 'lift', label: 'shared' },
      { from: 'lift', to: 'ctx', label: 'distant + rare' },
      { from: 'ctx', to: 'store', label: 'org-scale' },
    ],
    memoryTip: 'Ask "who owns the truth?" first, then "who re-renders when it changes?" — that picks the tool every time.',
  },

  {
    id: 'react-payment-flow',
    topicId: 'react-usereducer-custom-hooks',
    type: 'lifecycle',
    title: 'Payment Flow State Machine',
    description: 'The transfer wizard as an explicit state machine with guarded transitions.',
    nodes: [
      { id: 'idle', label: 'idle', description: 'No draft. SUBMIT starts a review with a fresh idempotency key.' },
      { id: 'reviewing', label: 'reviewing', description: 'Draft complete, validated. SUBMIT allowed — exactly once.' },
      { id: 'submitting', label: 'submitting', description: 'In flight. Duplicate SUBMIT is ignored by the guard; button disabled.' },
      { id: 'success', label: 'success', description: 'Server confirmed. Show reference; invalidate balances + transactions.' },
      { id: 'failed', label: 'failed', description: 'Retry allowed from here only. Same idempotency key on retry.' },
    ],
    edges: [
      { from: 'idle', to: 'reviewing', label: 'SUBMIT' },
      { from: 'reviewing', to: 'submitting', label: 'CONFIRM' },
      { from: 'submitting', to: 'success', label: '2xx' },
      { from: 'submitting', to: 'failed', label: 'error / timeout' },
      { from: 'failed', to: 'submitting', label: 'RETRY (same key)' },
      { from: 'success', to: 'idle', label: 'RESET' },
    ],
    memoryTip: 'Illegal transitions are unreachable by construction — and the backend enforces idempotency regardless of what the UI does.',
  },

  {
    id: 'react-render-scope',
    topicId: 'react-usecontext',
    type: 'comparison',
    title: 'Context vs Store Subscriptions — Re-render Scope',
    description: 'The same live transaction feed delivered two ways, and who re-renders.',
    columns: [
      {
        label: 'Context broadcast',
        nodes: [
          { id: 'c1', label: 'Provider value changes', description: 'Every event (~50/sec) creates a new context value.' },
          { id: 'c2', label: 'All consumers re-render', description: 'Every useContext call site re-renders — header, panels, footer.' },
          { id: 'c3', label: 'Memo cannot save you', description: 'Consumers subscribe by identity; memo on children cannot opt out.' },
        ],
      },
      {
        label: 'Store + selectors',
        nodes: [
          { id: 's1', label: 'Selector subscriptions', description: 'Components subscribe to slices: useStore(s => s.balance).' },
          { id: 's2', label: 'Only affected subscribers render', description: 'A tick in TXN-889 re-renders its row, not the page.' },
          { id: 's3', label: 'Scales with data, not tree size', description: '50 events/sec touch 5 components instead of 500.' },
        ],
      },
    ],
    memoryTip: 'Context = broadcast (everyone tuned in re-renders). Store + selector = targeted subscription. Frequency decides the tool.',
  },
];
