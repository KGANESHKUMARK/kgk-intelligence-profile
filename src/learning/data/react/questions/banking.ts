import type { InterviewQuestion } from '../../../types';

export const reactBankingQuestions: InterviewQuestion[] = [
  {
    id: 'q-react-redux-vs-context',
    technology: 'react',
    question: 'Redux vs Context API vs TanStack Query — when do you use each in a banking application?',
    category: 'State Management',
    difficulty: 'senior',
    quickAnswer: 'Context: theme, locale, auth session (low-frequency). Redux: complex client workflows (multi-step payment wizard, undo). TanStack Query: ALL server data (accounts, transactions, balances). Never use Redux as a server cache.',
    interviewAnswer: `The state taxonomy drives the tool choice:

**Context API**: for truly global, low-frequency-change values — theme, locale, feature flags, auth session. Context re-renders ALL consumers on every change, so high-frequency state (form inputs, animations) in context causes re-render storms. Use context + useMemo on the value object to minimize re-renders.

**Redux (RTK)**: for complex client-owned state that benefits from predictable mutations, time-travel debugging, and action logging. In banking: multi-step payment wizard (draft → review → OTP → confirm), undo/redo in a form builder, cart-like experiences. Redux Toolkit's createSlice + Immer makes immutable updates clean.

**TanStack Query**: for ALL server-owned data — accounts, transactions, balances, customer profiles. It handles caching (staleTime), background refetching, retry, pagination, optimistic updates, and cache invalidation after mutations. After a payment succeeds, invalidate the balance query: queryClient.invalidateQueries({ queryKey: ['balance', accountId] }).

**Anti-pattern**: storing server data in Redux slices (fetchAccounts → dispatch → reducer → store). This duplicates what TanStack Query does better: you end up hand-writing cache invalidation, stale detection, retry logic, and loading states that TanStack Query provides out of the box.`,
    codeExample: `// TanStack Query for server data
const { data: accounts, isLoading } = useQuery({
  queryKey: ['accounts', customerId],
  queryFn: () => api.get(\`/accounts/\${customerId}\`).then(r => r.data),
  staleTime: 30_000,  // fresh for 30s — no refetch on component mount
});

// Mutation with cache invalidation
const transfer = useMutation({
  mutationFn: (data: TransferPayload) => api.post('/transfers', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['balance'] });  // refetch balance
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  },
});

// Redux for client workflow state (payment wizard)
const step = useSelector(s => s.paymentWizard.step);  // draft | review | otp | confirm
const dispatch = useDispatch();
dispatch(wizardActions.goToReview(formData));`,
    keyTerms: ['state taxonomy', 'Context low-frequency', 'Redux client workflow', 'TanStack Query server cache', 'cache invalidation'],
    conceptsTested: ['State management architecture'],
    strongAnswerKeywords: ['server state = TanStack Query', 'client workflow = Redux', 'Context for theme/auth only', 'never Redux as server cache'],
    whatIsBeingTested: ['Architectural decision-making for state management'],
    interviewerIntent: 'This is the #1 React architecture question — separates senior engineers who think about state ownership from those who "just use Redux for everything".',
  },

  {
    id: 'q-react-auth-token-refresh',
    technology: 'react',
    question: 'How do you implement JWT token refresh in a React banking app without interrupting the user?',
    category: 'Authentication',
    difficulty: 'senior',
    quickAnswer: 'Axios response interceptor catches 401 → queues other requests → calls /auth/refresh → retries queued requests with new token. No user-visible interruption.',
    interviewAnswer: `Implementation:

1. **Axios instance** with response interceptor: catches HTTP 401 (token expired).
2. **Token refresh flow**: on first 401, set isRefreshing = true, call /auth/refresh with the refresh token, store the new access token, then retry the original request.
3. **Request queue**: while refreshing, subsequent 401s add their requests to a queue (promise-based). When refresh succeeds, resolve all queued promises → they retry with the new token. If refresh fails, reject all → redirect to /login.
4. **Race condition prevention**: the isRefreshing flag ensures only ONE refresh call is made, even if 5 requests fail with 401 simultaneously.
5. **Refresh token rotation**: the backend issues a new refresh token on each use (one-time-use). Store refresh token in httpOnly cookie (not localStorage) for XSS protection.
6. **Proactive refresh**: optionally decode the JWT exp claim and refresh 60 seconds BEFORE expiry, so no request ever hits 401.

This is critical in banking: a user filling out a 10-field transfer form should NOT be redirected to login because a background balance poll returned 401.`,
    codeExample: `// Proactive token refresh — refresh 60s before expiry
function useProactiveRefresh() {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const { exp } = jwtDecode<{ exp: number }>(token);
    const msUntilExpiry = exp * 1000 - Date.now();
    const refreshAt = msUntilExpiry - 60_000;  // 60s before expiry

    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.post('/auth/refresh');
        setAccessToken(data.accessToken);
      } catch {
        logout();  // refresh token also expired
      }
    }, Math.max(refreshAt, 0));

    return () => clearTimeout(timer);
  }, []);
}`,
    keyTerms: ['response interceptor', 'request queue', 'isRefreshing flag', 'refresh token rotation', 'proactive refresh'],
    conceptsTested: ['Security', 'HTTP patterns'],
    strongAnswerKeywords: ['interceptor catches 401', 'queue pending requests', 'single refresh call', 'retry with new token', 'proactive refresh before expiry'],
    whatIsBeingTested: ['Production-grade auth implementation'],
    interviewerIntent: 'Token refresh is a must-have in banking SPAs — tests whether candidate has implemented it in production.',
  },

  {
    id: 'q-react-rbac-ui',
    technology: 'react',
    question: 'How do you implement role-based access control (RBAC) in a React banking dashboard?',
    category: 'Security',
    difficulty: 'senior',
    quickAnswer: 'Roles from JWT/API → AuthContext → usePermissions() hook → conditionally render UI elements AND route guards. Server MUST enforce permissions independently — UI is just UX.',
    interviewAnswer: `RBAC in React is a UX layer — NOT a security layer. The server must enforce permissions independently; the frontend just hides/shows UI elements for a clean experience.

Implementation:
1. **AuthContext** stores the user's roles and permissions (from JWT claims or /api/me).
2. **usePermissions() hook**: returns hasPermission('transfer:create'), hasRole('ADMIN'), can('approve', 'transfer').
3. **<Authorize> component**: <Authorize permission="transfer:create"><TransferButton/></Authorize> — renders children only if the user has the permission.
4. **Route guards**: layout route checks role before rendering children. /admin/* routes require ADMIN role.
5. **Feature-level**: a Maker-Checker workflow shows "Submit for Approval" to makers and "Approve/Reject" to checkers — same page, different actions based on role.

Critical rules:
- Never trust the JWT alone — validate roles on every API call server-side.
- Don't just hide buttons with CSS (display:none) — remove them from the DOM entirely.
- Disable AND hide: a disabled "Approve" button for a maker is confusing. Don't render it at all.
- Audit: log which role-gated actions were attempted in the frontend for security monitoring.`,
    codeExample: `// usePermissions hook
function usePermissions() {
  const { user } = useAuth();
  const permissions = useMemo(() => new Set(user?.permissions ?? []), [user]);
  return {
    hasPermission: (p: string) => permissions.has(p),
    hasRole: (r: string) => user?.roles?.includes(r) ?? false,
    hasAny: (...ps: string[]) => ps.some(p => permissions.has(p)),
  };
}

// Authorize component — renders children only if permitted
function Authorize({ permission, children, fallback = null }: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermissions();
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}

// Usage in a banking dashboard
function TransactionActions({ txn }: { txn: Transaction }) {
  return (
    <>
      <Authorize permission="transfer:create">
        <Button onClick={() => initTransfer(txn)}>Transfer</Button>
      </Authorize>
      <Authorize permission="transfer:approve">
        <Button onClick={() => approve(txn.id)}>Approve</Button>
      </Authorize>
    </>
  );
}`,
    keyTerms: ['RBAC', 'usePermissions', 'Authorize component', 'route guard', 'Maker-Checker', 'server enforcement'],
    conceptsTested: ['Security architecture', 'Component design'],
    strongAnswerKeywords: ['UI is UX not security', 'server enforces independently', 'Authorize component', 'route guard layout', 'remove from DOM not hide'],
    whatIsBeingTested: ['Security awareness in frontend architecture'],
    interviewerIntent: 'Banking apps MUST have RBAC — tests whether candidate understands it is a UX layer backed by server enforcement.',
  },

  {
    id: 'q-react-19-features',
    technology: 'react',
    question: 'What are the key new features in React 19 and how would you use them in a banking application?',
    category: 'React 19',
    difficulty: 'advanced',
    quickAnswer: 'Actions (useActionState), use() hook, React Compiler (auto-memo), useOptimistic, ref as prop, document metadata, improved error reporting.',
    interviewAnswer: `React 19 features relevant to banking:

**1. Actions + useActionState**: replaces manual loading/error/success state for form submissions. A transfer form uses useActionState(transferAction, {}) — React manages isPending, error display, and success state. useFormStatus() in the submit button auto-disables during submission.

**2. use() hook**: reads promises and context. use(accountsPromise) suspends the component until data loads — combined with <Suspense>, eliminates the loading-state boilerplate. Can read context conditionally (unlike useContext).

**3. React Compiler**: automatically inserts useMemo/useCallback/memo at build time. A banking dashboard with 50+ components no longer needs manual memoization — the compiler handles it. Requires code to follow the Rules of React (no mutation during render).

**4. useOptimistic**: shows optimistic UI immediately while the action is pending. Transfer form shows "Transfer sent" before the server confirms — if rejected, React reverts automatically.

**5. ref as prop**: no more forwardRef boilerplate. function Input({ ref, ...props }) works directly. Simplifies design system components.

**6. Document metadata**: <title>, <meta>, <link> in components are hoisted to <head> automatically. Each page can set its own SEO metadata without a library.

**7. Error reporting**: improved error messages with component stacks and better hydration mismatch details.`,
    keyTerms: ['useActionState', 'use()', 'React Compiler', 'useOptimistic', 'ref as prop', 'document metadata'],
    conceptsTested: ['React 19 knowledge', 'Modern React'],
    strongAnswerKeywords: ['useActionState replaces loading/error boilerplate', 'use() suspends component', 'React Compiler auto-memoizes', 'useOptimistic for instant UI', 'ref as prop no forwardRef'],
    whatIsBeingTested: ['Up-to-date React knowledge'],
    interviewerIntent: 'Tests whether candidate keeps up with the latest React features — critical for a senior role.',
  },

  {
    id: 'q-react-tanstack-banking',
    technology: 'react',
    question: 'How do you use TanStack Query for a banking transaction list with pagination, filtering, and real-time balance updates?',
    category: 'Data Fetching',
    difficulty: 'senior',
    quickAnswer: 'useInfiniteQuery for paginated transactions (cursor-based), query keys include filters, useMutation + invalidateQueries for actions, refetchInterval for real-time balance.',
    interviewAnswer: `Architecture for a banking dashboard:

**Transaction list (paginated + filtered)**:
useInfiniteQuery with cursor-based pagination. Query key includes all filters: ['transactions', accountId, { status, dateRange, search }]. When the user changes a filter, the query key changes → TanStack Query auto-fetches fresh data. getNextPageParam extracts the cursor from the last page.

**Real-time balance**:
useQuery with refetchInterval: 10_000 (poll every 10s). Or use a WebSocket to push balance updates and call queryClient.setQueryData to update the cache directly.

**Mutation + invalidation**:
After a transfer succeeds, invalidate both the balance and transaction queries:
queryClient.invalidateQueries({ queryKey: ['balance', accountId] })
queryClient.invalidateQueries({ queryKey: ['transactions', accountId] })
This triggers a background refetch — the user sees the updated balance within seconds.

**Optimistic updates**:
For "mark as read" or "flag transaction", use onMutate to optimistically update the cache, then onError to rollback if the server rejects.

**Stale time**:
Balance: staleTime = 0 (always refetch). Static reference data (currency list): staleTime = Infinity. Transactions: staleTime = 30_000 (30s).`,
    codeExample: `// Paginated + filtered transaction list
function useTransactions(accountId: string, filters: TxnFilters) {
  return useInfiniteQuery({
    queryKey: ['transactions', accountId, filters],
    queryFn: ({ pageParam }) =>
      api.get(\`/accounts/\${accountId}/transactions\`, {
        params: { ...filters, cursor: pageParam, limit: 50 },
      }).then(r => r.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}

// Real-time balance with polling
function useBalance(accountId: string) {
  return useQuery({
    queryKey: ['balance', accountId],
    queryFn: () => api.get(\`/accounts/\${accountId}/balance\`).then(r => r.data),
    refetchInterval: 10_000,  // poll every 10 seconds
    staleTime: 0,  // always stale — refetch on every mount
  });
}

// Transfer mutation with cache invalidation
const transfer = useMutation({
  mutationFn: (payload: TransferPayload) => api.post('/transfers', payload),
  onSuccess: (_, { fromAccount }) => {
    queryClient.invalidateQueries({ queryKey: ['balance', fromAccount] });
    queryClient.invalidateQueries({ queryKey: ['transactions', fromAccount] });
  },
});`,
    keyTerms: ['useInfiniteQuery', 'query keys with filters', 'invalidateQueries', 'refetchInterval', 'optimistic updates', 'staleTime'],
    conceptsTested: ['Data fetching architecture', 'Caching strategy'],
    strongAnswerKeywords: ['cursor-based pagination', 'query key includes filters', 'invalidate after mutation', 'staleTime per data type', 'optimistic update with rollback'],
    whatIsBeingTested: ['Production-grade data fetching in banking apps'],
    interviewerIntent: 'TanStack Query is the standard for server state — tests whether candidate uses it at scale with proper cache strategies.',
  },

  {
    id: 'q-react-performance-banking',
    technology: 'react',
    question: 'A banking dashboard with 10,000 transactions is slow — how do you diagnose and fix React performance issues?',
    category: 'Performance',
    difficulty: 'senior',
    quickAnswer: 'React DevTools Profiler → find slow renders → virtualize list (TanStack Virtual), memo rows, stable callbacks, move state down, check Context re-renders, debounce filters.',
    interviewAnswer: `Diagnosis:
1. **React DevTools Profiler**: record a session. Identify components with >16ms render time (60fps budget). Look for: components re-rendering when their props haven't changed, large lists re-rendering entirely on filter change.
2. **Why Did You Render**: library that logs unnecessary re-renders in development.

Fixes (ordered by impact):
1. **Virtualization**: render only visible rows. TanStack Virtual or react-window for 10,000 rows — DOM contains ~30 nodes instead of 10,000. Reduces initial render from 800ms to <50ms.
2. **React.memo on row components**: prevent row re-render when parent re-renders but the row's props haven't changed. Requires stable props (no inline objects/callbacks).
3. **Stable callbacks**: wrap event handlers in useCallback or move them outside the component. Inline arrow functions create new references → break memo.
4. **Move state down**: if only the search bar needs the filter text, keep it in the search bar component — don't lift it to the page and re-render the entire table on every keystroke.
5. **Debounce filter input**: don't filter/fetch on every keystroke. useDeferredValue or lodash.debounce(300ms).
6. **Context splitting**: if one context holds both theme and transactions, a theme toggle re-renders every transaction consumer. Split into separate contexts.
7. **Lazy load heavy components**: use React.lazy for charts, PDF viewers — don't include them in the initial bundle.`,
    codeExample: `import { useVirtualizer } from '@tanstack/react-virtual';

function TransactionTable({ rows }: { rows: Transaction[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,  // render 10 extra rows above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(vRow => (
          <TransactionRow
            key={rows[vRow.index].id}
            txn={rows[vRow.index]}
            style={{ transform: \`translateY(\${vRow.start}px)\` }}
          />
        ))}
      </div>
    </div>
  );
}

const TransactionRow = memo(function TransactionRow({ txn, style }: Props) {
  return (
    <div style={style} className="table-row">
      <span>{txn.date}</span>
      <span>{txn.merchant}</span>
      <span>{txn.amount}</span>
    </div>
  );
});`,
    keyTerms: ['React DevTools Profiler', 'virtualization', 'React.memo', 'useCallback', 'useDeferredValue', 'debounce', 'context splitting'],
    conceptsTested: ['Performance optimization', 'Debugging skills'],
    strongAnswerKeywords: ['Profiler first', 'virtualize large lists', 'memo + stable callbacks', 'move state down', 'debounce input', 'context splitting'],
    whatIsBeingTested: ['Senior-level performance debugging methodology'],
    interviewerIntent: 'Performance is critical in banking dashboards — tests systematic approach, not random optimization.',
  },

  {
    id: 'q-react-hook-form-zod',
    technology: 'react',
    question: 'How do you build a complex banking transfer form with validation, multi-step flow, and error handling?',
    category: 'Forms',
    difficulty: 'advanced',
    quickAnswer: 'React Hook Form + Zod + multi-step wizard: each step validates its own Zod schema, form data persisted across steps, final submit validates the full schema, handles server errors per-field.',
    interviewAnswer: `Architecture for a multi-step transfer form:

**Step 1 — Source + Amount**: Zod schema validates account selection, positive amount, within daily limit.
**Step 2 — Beneficiary**: validates IBAN/account format, beneficiary name.
**Step 3 — Review**: read-only summary with edit links back to each step.
**Step 4 — OTP**: validates 6-digit code from SMS/email.

Implementation:
- useForm with the FULL schema (all fields), mode: 'onBlur'.
- Each step triggers partial validation: trigger(['fromAccount', 'amount']) before advancing.
- Form data is persisted in the form state across steps (React Hook Form doesn't reset between renders).
- Final submit validates the complete schema and calls the API.
- Server-side errors mapped to specific fields: setError('amount', { message: 'Insufficient funds' }).
- useFormState({ name: 'amount' }) for field-level subscription — only the amount field re-renders on its own change.

Design decisions:
- Uncontrolled inputs via register() — typing doesn't re-render the whole form.
- Zod schema is the single source of truth for TypeScript types + runtime validation.
- useFieldArray for multiple beneficiary payments.`,
    keyTerms: ['multi-step wizard', 'partial validation trigger()', 'Zod schema per step', 'setError for server errors', 'useFieldArray'],
    conceptsTested: ['Complex form architecture', 'Validation strategy'],
    strongAnswerKeywords: ['React Hook Form + Zod', 'trigger partial validation', 'server error mapping to fields', 'uncontrolled for performance', 'Zod as type source of truth'],
    whatIsBeingTested: ['Production form complexity'],
    interviewerIntent: 'Banking forms are the most complex UI work — tests whether candidate can architect multi-step, validated, accessible forms.',
  },
];
