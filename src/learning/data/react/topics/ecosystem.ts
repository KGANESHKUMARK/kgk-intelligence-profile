import type { LearningTopic } from '../../../types';

export const reactEcosystemTopics: LearningTopic[] = [
  /* ───────────────────────── Redux Toolkit Deep Dive ──────────────────── */
  {
    id: 'react-redux-deep',
    technology: 'react',
    title: 'Redux Toolkit — createSlice, createAsyncThunk, RTK Query',
    category: 'Ecosystem & Libraries',
    slug: 'react-redux-deep',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Redux Toolkit is the official, opinionated way to write Redux — createSlice generates reducers+actions, createAsyncThunk handles async, and RTK Query replaces hand-written API layers.',
    mentalModel:
      'Redux = single global object tree. Action dispatched → reducer returns new slice → subscribers re-render. RTK removes the boilerplate (action types, switch statements, normalization) while keeping the predictable state model.',
    memoryTip:
      'createSlice = reducer + actions in one. createAsyncThunk = pending/fulfilled/rejected lifecycle. RTK Query = TanStack Query but inside Redux. configureStore = one-call setup with devtools + thunk middleware.',
    keyTerms: ['createSlice', 'createAsyncThunk', 'RTK Query', 'configureStore', 'immer', 'selector', 'extraReducers', 'middleware'],
    interviewAnswer: `Redux Toolkit (RTK) is the standard way to write Redux today. createSlice defines a slice of state: name, initialState, and reducers (which use Immer under the hood — you "mutate" a draft, Immer produces an immutable update). Actions are auto-generated from reducer names. createAsyncThunk handles async operations: dispatch(fetchAccounts()) → automatically dispatches pending, fulfilled, or rejected actions, which you handle in extraReducers. RTK Query (createApi) is a data-fetching layer built into Redux: define endpoints, and RTK Query auto-generates hooks (useGetAccountsQuery), manages caching, polling, invalidation, and optimistic updates — similar to TanStack Query but with Redux's single store and time-travel devtools. configureStore sets up the store with Redux DevTools, thunk middleware, and serializability checks in one call.`,
    detailedExplanation: `When to use Redux vs alternatives: Use Redux when (1) many components across the tree need the same state, (2) you need time-travel debugging for complex workflows, (3) the team is large and benefits from Redux's strict patterns, (4) you have complex client-side state (multi-step payment wizards, cart, undo/redo). Don't use Redux for: simple UI state (modals, tabs) — use useState; server-cache state alone — use TanStack Query; tiny apps with 2-3 shared states — use Context + useReducer. In banking: payment approval workflows (multi-step, undo-able, auditable) benefit from Redux's action log. Account list + transaction data is server state — use RTK Query or TanStack Query.`,
    codeExample: `import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';

// Async thunk — auto-dispatches pending/fulfilled/rejected
export const fetchAccounts = createAsyncThunk(
  'accounts/fetch',
  async (customerId: string) => {
    const res = await fetch(\`/api/customers/\${customerId}/accounts\`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json() as Promise<Account[]>;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { items: [] as Account[], status: 'idle' as Status, error: null as string | null },
  reducers: {
    accountSelected: (state, action) => { state.selectedId = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;  // Immer — looks like mutation, produces immutable update
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});

export const { accountSelected } = accountsSlice.actions;
export const store = configureStore({ reducer: { accounts: accountsSlice.reducer } });`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Writing Redux without RTK (manual action types, switch reducers) — RTK is the official recommendation since 2019.',
      'Putting ALL server data in Redux instead of using RTK Query or TanStack Query — Redux is not a cache.',
      'Not using createSelector (reselect) for derived data — recomputing on every render defeats the store purpose.',
      'Storing non-serializable values (Dates, functions, class instances) in Redux — breaks devtools and persistence.',
    ],
    seniorInsight: 'In banking apps, Redux shines for complex client workflows: a multi-step payment wizard where you need undo, step validation, draft saving, and an audit trail of every user action. Server data (accounts, transactions) should live in RTK Query or TanStack Query — not hand-rolled in Redux slices.',
    aiAwareness: {
      strongAnswerShouldMention: ['createSlice', 'Immer immutability', 'createAsyncThunk lifecycle', 'RTK Query auto-generated hooks', 'configureStore'],
      weakAnswer: 'Redux stores global state and dispatches actions.',
      likelyFollowUp: ['When would you use Redux vs TanStack Query?', 'How does Immer work inside createSlice?', 'What is RTK Query?'],
    },
    prerequisites: ['react-state-taxonomy'],
    relatedTopics: ['react-tanstack-query', 'react-19-actions'],
    nextTopics: ['react-axios-http'],
    references: [
      { title: 'Redux Toolkit Quick Start', url: 'https://redux-toolkit.js.org/tutorials/quick-start', source: 'redux-toolkit.js.org', type: 'official' },
    ],
  },

  /* ───────────────────────── Axios & HTTP Patterns ────────────────────── */
  {
    id: 'react-axios-http',
    technology: 'react',
    title: 'Axios, Interceptors & HTTP Patterns',
    category: 'Ecosystem & Libraries',
    slug: 'react-axios-http',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Axios is an HTTP client with interceptors for auth token injection, error normalization, retry logic, and request cancellation — the standard enterprise HTTP layer.',
    mentalModel:
      'Axios interceptors = middleware pipeline for HTTP. Request interceptor attaches JWT. Response interceptor catches 401 → refreshes token → retries. Every API call goes through this chain.',
    memoryTip:
      'axios.create(baseConfig) → instance. instance.interceptors.request.use(addAuth). instance.interceptors.response.use(ok, handleError). AbortController for cancellation.',
    keyTerms: ['axios.create', 'interceptors', 'request interceptor', 'response interceptor', 'AbortController', 'retry', 'token refresh', 'baseURL'],
    interviewAnswer: `Axios is an HTTP client for browser and Node.js. In enterprise React apps, you create a configured instance: axios.create({ baseURL, timeout, headers }). Request interceptors inject the JWT access token on every request — no component needs to know about auth. Response interceptors catch errors globally: 401 → refresh the token and retry the original request (token rotation); 403 → redirect to unauthorized page; 5xx → retry with exponential backoff; network errors → show offline banner. AbortController cancels in-flight requests when a component unmounts (prevents "setState on unmounted component" warnings). Axios vs fetch: Axios provides interceptors, automatic JSON parsing, request/response transformation, timeout support, and progress events out of the box — fetch requires manual wrappers for all of these.`,
    codeExample: `import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT on every call
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config!;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refresh_token'),
        });
        localStorage.setItem('access_token', data.accessToken);
        failedQueue.forEach(p => p.resolve());
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(p => p.reject(refreshError));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        failedQueue = [];
      }
    }
    return Promise.reject(error);
  }
);

export default api;`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Not creating a configured instance — importing raw axios everywhere means no shared config or interceptors.',
      'Token refresh race condition — multiple 401s fire multiple refresh calls. Use a queue (shown above) to serialize.',
      'Not cancelling requests on unmount — causes state updates on unmounted components and memory leaks.',
      'Hardcoding base URLs — use environment variables (VITE_API_URL) for dev/staging/production.',
    ],
    seniorInsight: 'In banking apps, the Axios instance is the security perimeter: it attaches the JWT, handles token rotation, logs requests for audit, and strips PII from error payloads. Every API call goes through this single configured instance — never raw fetch or raw axios.',
    aiAwareness: {
      strongAnswerShouldMention: ['axios.create', 'request interceptor for JWT', 'response interceptor for 401 refresh', 'AbortController', 'token refresh queue'],
      weakAnswer: 'Axios makes HTTP requests like fetch.',
      likelyFollowUp: ['How do you handle token refresh with multiple concurrent 401s?', 'Axios vs fetch — when to use which?'],
    },
    relatedTopics: ['react-tanstack-query', 'react-security-rbac'],
    nextTopics: ['react-router-deep'],
    references: [
      { title: 'Axios Documentation', url: 'https://axios-http.com/docs/intro', source: 'axios-http.com', type: 'official' },
    ],
  },

  /* ───────────────────────── React Router v6/v7 ──────────────────────── */
  {
    id: 'react-router-deep',
    technology: 'react',
    title: 'React Router v6/v7 — Nested Routes, Loaders, Guards',
    category: 'Ecosystem & Libraries',
    slug: 'react-router-deep',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'React Router v6+ uses a nested route tree with data loaders and layout routes — enabling code-split, auth-guarded, data-preloaded page transitions.',
    mentalModel:
      'Routes are a tree, not a flat list. Layout routes render <Outlet/> for child content. Loaders fetch data before render. Guards are layout routes that check auth and redirect.',
    memoryTip:
      'createBrowserRouter → route objects with loader/action. <Outlet/> = slot for child routes. Layout route = auth guard wrapper. lazy() = code-split per route.',
    keyTerms: ['createBrowserRouter', 'Outlet', 'loader', 'action', 'layout route', 'lazy', 'useNavigate', 'useParams', 'useSearchParams', 'protected route'],
    interviewAnswer: `React Router v6+ uses object-based route definitions via createBrowserRouter. Key patterns: (1) Nested routes: layout routes render <Outlet/> where children are inserted — the layout stays mounted across child navigations (no flicker). (2) Loaders: each route can have a loader function that fetches data before the component renders — eliminates waterfall fetching. (3) Actions: handle form submissions per-route (aligns with React 19 Actions). (4) Auth guards: a layout route checks authentication and redirects to /login if not authenticated — all child routes are automatically protected. (5) Code splitting: lazy(() => import('./AccountPage')) loads route components on demand. (6) Error boundaries: errorElement per route handles errors without crashing the whole app.`,
    codeExample: `import { createBrowserRouter, Outlet, Navigate, RouterProvider } from 'react-router-dom';

// Auth guard as a layout route
function AuthGuard() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;  // renders child routes
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,  // all children require auth
    children: [
      {
        element: <DashboardLayout />,  // sidebar + header
        children: [
          { index: true, element: <Navigate to="/accounts" replace /> },
          {
            path: 'accounts',
            lazy: () => import('./pages/AccountList'),  // code-split
            loader: async () => fetch('/api/accounts').then(r => r.json()),
          },
          {
            path: 'accounts/:accountId',
            lazy: () => import('./pages/AccountDetail'),
            loader: async ({ params }) =>
              fetch(\`/api/accounts/\${params.accountId}\`).then(r => r.json()),
          },
          {
            path: 'transfers/new',
            lazy: () => import('./pages/TransferForm'),
            action: async ({ request }) => {
              const formData = await request.formData();
              return fetch('/api/transfers', { method: 'POST', body: formData });
            },
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Using <BrowserRouter> + <Routes> instead of createBrowserRouter — misses loaders, actions, and error boundaries.',
      'Flat route list instead of nested routes — duplicates layout code and causes full-page re-mounts.',
      'Auth check inside every page component instead of a guard layout route — scattered, inconsistent, easy to forget.',
      'Not using lazy() for route code splitting — entire app loads upfront instead of on-demand.',
    ],
    seniorInsight: 'In banking SPAs, the route tree IS the application architecture. Layout routes handle auth, role-based access, and shared navigation. Loaders pre-fetch data, so the user never sees a loading spinner on navigation. Error boundaries per-route prevent a broken transaction page from crashing the whole portal.',
    aiAwareness: {
      strongAnswerShouldMention: ['createBrowserRouter', 'nested routes + Outlet', 'loader for data', 'layout route as auth guard', 'lazy code splitting'],
      weakAnswer: 'React Router handles navigation between pages.',
      likelyFollowUp: ['How do you implement role-based route access?', 'What are loaders and why are they better than useEffect?'],
    },
    prerequisites: ['react-components-props'],
    relatedTopics: ['react-code-splitting', 'react-security-rbac'],
    nextTopics: ['react-hook-form'],
    references: [
      { title: 'React Router v6 Tutorial', url: 'https://reactrouter.com/start/framework/routing', source: 'reactrouter.com', type: 'official' },
    ],
  },

  /* ───────────────────────── React Hook Form + Zod ───────────────────── */
  {
    id: 'react-hook-form',
    technology: 'react',
    title: 'React Hook Form + Zod Validation',
    category: 'Ecosystem & Libraries',
    slug: 'react-hook-form',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'React Hook Form manages form state with uncontrolled inputs + refs for performance, while Zod provides type-safe runtime validation — together they handle banking-grade form complexity.',
    mentalModel:
      'Instead of controlled inputs (onChange → setState → re-render on every keystroke), React Hook Form uses refs — only the changed field re-renders. Zod validates the whole form at submit or on-blur.',
    memoryTip:
      'useForm() → register("fieldName") on each input. handleSubmit(onValid, onInvalid). zodResolver(schema) connects Zod validation. formState.errors for error messages.',
    keyTerms: ['useForm', 'register', 'handleSubmit', 'Controller', 'zodResolver', 'useFieldArray', 'formState', 'watch', 'uncontrolled'],
    interviewAnswer: `React Hook Form (RHF) manages form state using uncontrolled inputs (refs) instead of controlled inputs (state). This means typing in a field does NOT trigger a re-render of the entire form — only the specific field re-renders when its validation state changes. In a banking transfer form with 15 fields, this prevents 15 re-renders per keystroke. API: useForm() returns register (spread onto inputs), handleSubmit (wraps your submit handler with validation), formState (errors, isDirty, isValid, isSubmitting). Zod integration via zodResolver: define a Zod schema (z.object({ amount: z.number().positive(), toAccount: z.string().min(10) })), pass it to useForm({ resolver: zodResolver(schema) }), and the schema is validated at submit-time (or onChange/onBlur mode). useFieldArray for dynamic fields (multiple beneficiaries). Controller for controlled third-party components (DatePicker, Select).`,
    codeExample: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transferSchema = z.object({
  fromAccount: z.string().min(1, 'Select source account'),
  toAccount: z.string().min(10, 'Account number must be at least 10 digits'),
  amount: z.number().positive('Amount must be positive').max(1_000_000, 'Max transfer: 1,000,000'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'SGD']),
  reference: z.string().max(140).optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;  // auto-typed from schema

function TransferForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    mode: 'onBlur',  // validate on blur, not every keystroke
  });

  const onSubmit = async (data: TransferFormData) => {
    await api.post('/transfers', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('toAccount')} placeholder="Recipient account" />
      {errors.toAccount && <span className="error">{errors.toAccount.message}</span>}

      <input {...register('amount', { valueAsNumber: true })} type="number" />
      {errors.amount && <span className="error">{errors.amount.message}</span>}

      <select {...register('currency')}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Submit Transfer'}
      </button>
    </form>
  );
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Using controlled inputs (useState per field) for forms with 10+ fields — causes re-render storms.',
      'Not using zodResolver — writing manual validation logic that drifts from the TypeScript type.',
      'Forgetting mode: "onBlur" — default is "onSubmit" which shows no errors until the user clicks submit.',
      'Not using Controller for third-party UI components (DatePicker, Autocomplete) — register only works on native HTML inputs.',
    ],
    seniorInsight: 'In banking forms, Zod validation is the single source of truth: the TypeScript type is inferred from the schema (z.infer), the runtime validation uses the same schema, and error messages come from the schema. This eliminates the classic bug where the TypeScript type says amount is required but the form allows empty submission.',
    aiAwareness: {
      strongAnswerShouldMention: ['uncontrolled inputs via register', 'zodResolver for type-safe validation', 'z.infer for auto-typing', 'Controller for third-party components', 'mode: onBlur'],
      weakAnswer: 'React Hook Form is a library for forms.',
      likelyFollowUp: ['How does React Hook Form differ from Formik?', 'How do you handle dynamic fields (useFieldArray)?'],
    },
    prerequisites: ['react-forms'],
    relatedTopics: ['react-19-actions', 'react-axios-http'],
    references: [
      { title: 'React Hook Form', url: 'https://react-hook-form.com/', source: 'react-hook-form.com', type: 'official' },
    ],
  },

  /* ───────────────────────── Advanced Patterns ───────────────────────── */
  {
    id: 'react-advanced-patterns',
    technology: 'react',
    title: 'Advanced Patterns — Compound, Render Props, HOC, Portals',
    category: 'Ecosystem & Libraries',
    slug: 'react-advanced-patterns',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Compound components share implicit state (like <select>/<option>); render props delegate rendering to the consumer; HOCs wrap cross-cutting concerns; portals render outside the DOM tree.',
    mentalModel:
      'Compound = parent owns state, children read via context (Select + Option). Render props = parent provides data, child decides rendering. HOC = decorator pattern. Portal = teleport to document.body.',
    memoryTip:
      'Compound: <DataGrid><Column field="name"/></DataGrid>. Render props: <FetchData render={data => <Chart data={data}/>}/>. HOC: withAuth(Component). Portal: modal rendered at document.body.',
    keyTerms: ['compound component', 'render props', 'higher-order component', 'portal', 'composition', 'inversion of control'],
    interviewAnswer: `Compound components: a group of components that share implicit state via context — the parent manages state, children consume it. Example: <Tabs><Tab label="Accounts"/><Tab label="Transfers"/></Tabs> — Tabs owns the active tab, each Tab checks context to render as active. Render props: a function prop that receives data and returns JSX — inverts control so the parent provides data while the consumer decides rendering. Used in design systems for maximum flexibility. HOCs (higher-order components): a function that takes a component and returns an enhanced component — withAuth(Dashboard) checks auth and redirects. Less common since hooks, but still used for cross-cutting concerns (withErrorBoundary, withAnalytics). Portals: ReactDOM.createPortal(jsx, document.body) renders a component outside its DOM parent — used for modals, toasts, and tooltips that must escape overflow:hidden containers.`,
    codeExample: `// Compound component — DataTable with column configuration
const TableContext = createContext<{ sortBy: string; onSort: (col: string) => void }>(null!);

function DataTable({ children, data }: { children: ReactNode; data: any[] }) {
  const [sortBy, setSortBy] = useState('');
  return (
    <TableContext.Provider value={{ sortBy, onSort: setSortBy }}>
      <table>{children}</table>
    </TableContext.Provider>
  );
}

function Column({ field, header }: { field: string; header: string }) {
  const { sortBy, onSort } = useContext(TableContext);
  return (
    <th onClick={() => onSort(field)} className={sortBy === field ? 'sorted' : ''}>
      {header} {sortBy === field && '▲'}
    </th>
  );
}

// Usage — clean, declarative API
<DataTable data={transactions}>
  <Column field="date" header="Date" />
  <Column field="amount" header="Amount" />
  <Column field="status" header="Status" />
</DataTable>`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Using HOCs when a custom hook would suffice — hooks are simpler and composable.',
      'Prop drilling through 5+ levels instead of using compound components with context.',
      'Portal modals not trapping focus — accessibility violation; use a focus trap library.',
      'Render props causing re-renders on every parent render — memoize the render function.',
    ],
    seniorInsight: 'In banking design systems, compound components create clean APIs: <TransferForm><AmountField/><AccountSelector/><ReviewStep/></TransferForm> — the form manages step navigation internally, each child reads state from context. This pattern keeps the consuming code declarative while the component handles complex state internally.',
    aiAwareness: {
      strongAnswerShouldMention: ['compound = shared context', 'render props = inversion of control', 'HOC = decorator', 'portal = DOM escape hatch', 'hooks replacing most HOCs'],
      weakAnswer: 'These are different ways to share code between components.',
      likelyFollowUp: ['When would you use a compound component vs a render prop?', 'How do you handle accessibility in portal modals?'],
    },
    relatedTopics: ['react-usecontext', 'react-frontend-system-design'],
    references: [
      { title: 'Patterns.dev — React Patterns', url: 'https://www.patterns.dev/react', source: 'patterns.dev', type: 'article' },
    ],
  },
];
