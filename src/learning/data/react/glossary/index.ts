import type { GlossaryTerm } from '../../../types';

export const reactGlossary: GlossaryTerm[] = [
  {
    id: 'react-glossary-reconciliation',
    term: 'Reconciliation',
    simple: 'How React decides what actually changed on screen after a re-render.',
    technical:
      'The diffing algorithm that compares the new element tree with the previous one (by type and key) and computes the minimal set of DOM mutations to apply in the commit phase.',
    keyWords: ['reconciliation', 'diffing', 'fiber', 'commit phase'],
    relatedTopics: ['react-reconciliation', 'react-lists-keys'],
  },
  {
    id: 'react-glossary-virtual-dom',
    term: 'Virtual DOM',
    simple: 'A lightweight in-memory description of the UI that React diffs before touching the real DOM.',
    technical:
      'A tree of plain element descriptors produced by rendering; reconciliation compares consecutive trees and batches real DOM mutations, which are the expensive part.',
    keyWords: ['virtual DOM', 'diffing', 'element tree'],
    relatedTopics: ['react-overview', 'react-reconciliation'],
  },
  {
    id: 'react-glossary-controlled-component',
    term: 'Controlled component',
    simple: 'A form input whose value lives in React state — React is the source of truth.',
    technical:
      'An input whose value prop is driven by state and updated via onChange, making React state the single source of truth for the field (vs uncontrolled, where the DOM owns the value).',
    keyWords: ['controlled', 'uncontrolled', 'source of truth', 'onChange'],
    relatedTopics: ['react-forms', 'react-state'],
  },
  {
    id: 'react-glossary-prop-drilling',
    term: 'Prop drilling',
    simple: 'Passing data through components that do not need it, just to reach a deeper component.',
    technical:
      'Threading props through intermediate layers that neither use nor care about them; mitigated by composition, context, or component extraction rather than by a global store.',
    keyWords: ['prop drilling', 'context', 'composition'],
    relatedTopics: ['react-usecontext', 'react-components-props'],
  },
  {
    id: 'react-glossary-stale-closure',
    term: 'Stale closure',
    simple: 'A callback that remembers old values from the render it was created in.',
    technical:
      'A closure capturing state/props from a previous render — common with effects, timers and subscriptions registered once; fixed by functional updates, refs, or honest dependency arrays.',
    keyWords: ['closure', 'stale closure', 'dependency array'],
    relatedTopics: ['react-useeffect', 'react-usereducer-custom-hooks'],
  },
  {
    id: 'react-glossary-memoization',
    term: 'Memoization',
    simple: 'Caching a computation or function so it is not redone when its inputs have not changed.',
    technical:
      'useMemo caches a computed value keyed on dependencies; useCallback caches a function identity; React.memo skips child renders on shallow-equal props. All rely on reference equality.',
    keyWords: ['useMemo', 'useCallback', 'React.memo', 'reference equality'],
    relatedTopics: ['react-usememo-usecallback', 'react-react-memo'],
  },
  {
    id: 'react-glossary-debounce',
    term: 'Debounce',
    simple: 'Wait until the user stops typing, then act once.',
    technical:
      'Defers invoking a function until a quiet period (delay) has elapsed since the last event — collapsing bursts of keystrokes into one API call; commonly paired with AbortController cancellation.',
    keyWords: ['debounce', 'search', 'keystrokes', 'cancellation'],
    relatedTopics: ['react-debounce-throttle', 'react-request-cancellation'],
  },
  {
    id: 'react-glossary-throttle',
    term: 'Throttle',
    simple: 'Run at most once per time window, no matter how often the event fires.',
    technical:
      'Guarantees a maximum execution frequency (e.g. once per 100ms) regardless of event rate — used for scroll, resize and pointer streams; contrast with debounce’s "after the burst" semantics.',
    keyWords: ['throttle', 'rate limit', 'scroll', 'rAF'],
    relatedTopics: ['react-debounce-throttle'],
  },
  {
    id: 'react-glossary-cursor-pagination',
    term: 'Cursor pagination',
    simple: '“Give me the next 50 after this bookmark” instead of “give me page 7”.',
    technical:
      'Keyset pagination using an opaque cursor (typically the last row’s sort key) — stable under concurrent inserts, index-friendly, no duplicates/skips; unlike offset paging which drifts as rows shift.',
    keyWords: ['cursor', 'keyset pagination', 'offset', 'stable paging'],
    relatedTopics: ['react-pagination-cursor'],
  },
  {
    id: 'react-glossary-virtualization',
    term: 'Virtualization (windowing)',
    simple: 'Render only the rows you can see, not all the rows you have.',
    technical:
      'Renders only the viewport-visible slice (+ overscan) of a large list, absolutely positioned in a scroll container — DOM node count stays constant as dataset size grows.',
    keyWords: ['virtualization', 'windowing', 'overscan', 'DOM nodes'],
    relatedTopics: ['react-virtualization', 'react-pagination-cursor'],
  },
  {
    id: 'react-glossary-abortcontroller',
    term: 'AbortController',
    simple: 'The browser’s off switch for a fetch you no longer want.',
    technical:
      'Web API producing a signal passed to fetch(); calling abort() rejects the request (AbortError), enabling request cancellation and latest-wins semantics in effects and query libraries.',
    keyWords: ['AbortController', 'cancellation', 'race condition'],
    relatedTopics: ['react-request-cancellation', 'react-useeffect'],
  },
  {
    id: 'react-glossary-idempotency-key',
    term: 'Idempotency key',
    simple: 'A unique tag on a request so "the same payment" can never happen twice.',
    technical:
      'Client-generated key (UUID) sent with a write; the server records it and returns the original result for retries instead of re-executing — the backend guarantee behind duplicate-submission protection.',
    keyWords: ['idempotency', 'duplicate submission', 'retry safety'],
    relatedTopics: ['react-usereducer-custom-hooks', 'react-tanstack-query'],
  },
  {
    id: 'react-glossary-optimistic-update',
    term: 'Optimistic update',
    simple: 'Show success immediately, fix it if the server disagrees.',
    technical:
      'Applying the expected mutation to the UI/cache before server confirmation, rolling back on failure — trades consistency risk for perceived performance; requires reconciliation logic.',
    keyWords: ['optimistic UI', 'rollback', 'cache mutation'],
    relatedTopics: ['react-tanstack-query', 'react-state-taxonomy'],
  },
  {
    id: 'react-glossary-error-boundary',
    term: 'Error boundary',
    simple: 'A safety net component that catches crashes in the subtree below it and shows a fallback.',
    technical:
      'A component (class lifecycle or react-error-boundary) catching render/lifecycle errors of its descendants; does not catch event handlers, async callbacks, or SSR errors.',
    keyWords: ['error boundary', 'fallback UI', 'react-error-boundary'],
    relatedTopics: ['react-error-boundaries'],
  },
  {
    id: 'react-glossary-hydration',
    term: 'Hydration',
    simple: 'Attaching React’s event handlers and state to server-rendered HTML.',
    technical:
      'The client-side pass where React reconciles the server-rendered DOM with a client render, wiring interactivity; mismatches between server and client output cause hydration errors.',
    keyWords: ['hydration', 'SSR', 'mismatch'],
    relatedTopics: ['react-nextjs-rendering'],
  },
  {
    id: 'react-glossary-server-component',
    term: 'Server Component',
    simple: 'A component that renders only on the server and ships zero JavaScript to the browser.',
    technical:
      'RSCs execute on the server, can await data directly, and serialise their output; interactive pieces are Client Component islands. Reduces bundle size and data-fetching waterfalls.',
    keyWords: ['RSC', 'client component', 'bundle size', 'streaming'],
    relatedTopics: ['react-nextjs-rendering'],
  },
  {
    id: 'react-glossary-rbac',
    term: 'RBAC',
    simple: 'Permissions come from roles — the UI shows what you may do, the API enforces it.',
    technical:
      'Role-Based Access Control: roles (CUSTOMER, OPERATIONS, ADMIN…) map to permissions (VIEW_TRANSACTION, APPROVE_PAYMENT…); the client renders by permission while the server authorises every request.',
    keyWords: ['RBAC', 'permission', 'role', 'least privilege'],
    relatedTopics: ['react-security-rbac', 'react-usecontext'],
  },
  {
    id: 'react-glossary-idempotency',
    term: 'Idempotency',
    simple: 'Doing it twice has the same effect as doing it once.',
    technical:
      'Property of an operation where repeating it with the same key produces the same result — mandatory for payment/transfer APIs so retries and double-clicks cannot double-debit.',
    keyWords: ['idempotency key', 'duplicate submission', 'exactly-once'],
    relatedTopics: ['react-usereducer-custom-hooks', 'react-request-cancellation'],
  },
  {
    id: 'react-glossary-query-key',
    term: 'Query key',
    simple: 'The cache address for a piece of server data.',
    technical:
      'The structured identity TanStack Query uses for caching, deduplication and invalidation — same key = same cache entry; inputs that change the response must change the key.',
    keyWords: ['query key', 'cache identity', 'invalidation'],
    relatedTopics: ['react-tanstack-query'],
  },
  {
    id: 'react-glossary-staletime',
    term: 'staleTime',
    simple: 'How long cached data is trusted before React refetches it.',
    technical:
      'Duration a query result is considered fresh (no refetch on mount/window focus); distinct from gcTime, which controls how long inactive cache entries are kept.',
    keyWords: ['staleTime', 'gcTime', 'background refetch'],
    relatedTopics: ['react-tanstack-query'],
  },
];
