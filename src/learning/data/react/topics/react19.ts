import type { LearningTopic } from '../../../types';

export const react19Topics: LearningTopic[] = [
  {
    id: 'react-19-actions',
    technology: 'react',
    title: 'React 19 — Actions & useActionState',
    category: 'React 19',
    slug: 'react-19-actions',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'Actions replace manual loading/error state management — pass an async function to useActionState and React tracks pending, error, and result automatically.',
    mentalModel:
      'Before Actions you wrote: setState loading, try/catch, setError, setData, setLoading false. Now: give React the async function and it manages the lifecycle.',
    memoryTip:
      'useActionState(asyncFn, initialState) → [state, formAction, isPending]. Wire formAction to <form action={formAction}>. React handles pending + error + optimistic.',
    keyTerms: ['useActionState', 'useFormStatus', 'Actions', 'form action', 'isPending', 'progressive enhancement'],
    interviewAnswer: `React 19 Actions: any async function can be an "action." useActionState(fn, initialState) returns [currentState, dispatchAction, isPending]. You wire dispatchAction to a form's action attribute: <form action={dispatchAction}>. When submitted, React (1) calls fn with previous state + FormData, (2) sets isPending = true automatically, (3) resolves to the new state or error. This eliminates manual try/catch/loading/error boilerplate. useFormStatus() reads the pending state from inside a child component (e.g. a submit button): const { pending } = useFormStatus() — disables the button while the action runs. Progressive enhancement: because this uses the native form action pattern, the form works even before JavaScript loads (the server can handle it).`,
    detailedExplanation: `The old pattern (React 18): const [isPending, setIsPending] = useState(false); const [error, setError] = useState(null); async function handleSubmit() { setIsPending(true); try { await api.transfer(data); } catch(e) { setError(e); } finally { setIsPending(false); } }. React 19: useActionState replaces ALL of that. Pair with useOptimistic to show the result before the server responds — if the server rejects, React reverts automatically. Banking example: submit a payment transfer → show "Transfer sent" immediately (optimistic) → if fraud check rejects, revert to the form with an error message.`,
    codeExample: `'use client';
import { useActionState, useOptimistic } from 'react';

async function transferAction(prevState: State, formData: FormData) {
  const amount = Number(formData.get('amount'));
  const to = String(formData.get('toAccount'));
  const result = await fetch('/api/transfers', {
    method: 'POST',
    body: JSON.stringify({ amount, to }),
  });
  if (!result.ok) return { error: 'Transfer failed. Please retry.' };
  return { success: true, message: \`Transferred \${amount} to \${to}\` };
}

function TransferForm() {
  const [state, action, isPending] = useActionState(transferAction, {});
  return (
    <form action={action}>
      <input name="toAccount" required />
      <input name="amount" type="number" required />
      <button disabled={isPending}>
        {isPending ? 'Processing...' : 'Send Transfer'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">{state.message}</p>}
    </form>
  );
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Still using useState + useEffect for form submission — Actions replace this entirely.',
      'Forgetting useFormStatus must be in a CHILD component of the <form>, not the form component itself.',
      'Not handling the error return from the action — the form just silently fails.',
    ],
    seniorInsight: 'Actions align React with the web platform (native form submission) and with server frameworks (Next.js Server Actions). In banking UIs, the automatic pending/error/success lifecycle prevents the "double-submit" bug without custom debounce logic.',
    aiAwareness: {
      strongAnswerShouldMention: ['useActionState', 'useFormStatus', 'isPending', 'progressive enhancement', 'replaces manual loading/error state'],
      weakAnswer: 'React 19 has some new hooks for forms.',
      likelyFollowUp: ['How does useOptimistic work with Actions?', 'What is progressive enhancement in React 19?'],
    },
    prerequisites: ['react-state', 'react-forms'],
    relatedTopics: ['react-19-use-hook', 'react-19-compiler'],
    nextTopics: ['react-19-use-hook'],
    references: [
      { title: 'React 19 — What\'s New', url: 'https://react.dev/blog/2024/12/05/react-19', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-19-use-hook',
    technology: 'react',
    title: 'React 19 — use() Hook & Suspense',
    category: 'React 19',
    slug: 'react-19-use-hook',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'use(promise) reads an async resource during render — React suspends the component until the promise resolves, replacing useEffect-based data fetching with a declarative pattern.',
    mentalModel:
      'use() is await for components. Instead of "start fetch, show spinner, setState when done," you write: const data = use(fetchPromise) and let Suspense handle the loading state.',
    memoryTip:
      'use(promise) → suspends until resolved. use(context) → reads context (can be called conditionally — unlike useContext). Wrap parent in <Suspense fallback={<Spinner/>}>.',
    keyTerms: ['use()', 'Suspense', 'streaming', 'promise', 'conditional context', 'React.lazy'],
    interviewAnswer: `use() is a new React 19 hook that can read promises and contexts. For promises: const data = use(dataPromise) — React suspends the component (throws the promise), the nearest <Suspense> boundary shows its fallback, and when the promise resolves, React re-renders with the data. This replaces the useEffect + useState + loading state pattern entirely. For context: use(ThemeContext) works like useContext but can be called inside conditionals and loops — breaking the "rules of hooks" constraint for this specific case. Combined with Suspense and streaming SSR, use() enables "render-as-you-fetch": start the fetch before the component renders, pass the promise down, and the component suspends when it tries to read it.`,
    detailedExplanation: `The key difference from useEffect data fetching: with useEffect, the component renders (empty), the effect fires, the fetch starts, the component re-renders with data. With use(promise), the component suspends BEFORE rendering — no flash of empty state. The promise must be created outside the component (in a loader, server component, or parent) — creating a new promise on every render would cause an infinite suspend loop. Streaming SSR: the server sends the Suspense fallback HTML immediately, then streams the resolved content when the promise settles — the user sees a skeleton instantly, then the real data replaces it without a full-page reload.`,
    codeExample: `import { use, Suspense } from 'react';

// Promise created OUTSIDE the component (e.g. in a loader or parent)
const accountsPromise = fetch('/api/accounts').then(r => r.json());

function AccountList() {
  const accounts = use(accountsPromise);  // suspends until resolved
  return (
    <ul>
      {accounts.map(a => (
        <li key={a.id}>{a.name} — {a.balance}</li>
      ))}
    </ul>
  );
}

// Parent wraps in Suspense
function Dashboard() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountList />
    </Suspense>
  );
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Creating the promise INSIDE the component body — causes infinite suspend loop on every render.',
      'Forgetting the <Suspense> boundary — uncaught suspension crashes the app.',
      'Using use() for client-side fetching without a caching layer — TanStack Query is still better for cache invalidation and background refetching.',
    ],
    seniorInsight: 'use() is most powerful in Next.js App Router where server components create the promise and client components consume it via use(). For pure SPA banking apps, TanStack Query still provides better caching, refetching, and optimistic updates — use() is the low-level primitive, not a replacement for a query library.',
    aiAwareness: {
      strongAnswerShouldMention: ['suspends component', 'promise created outside', 'Suspense boundary', 'streaming SSR', 'conditional context reading'],
      weakAnswer: 'use() is a hook for fetching data.',
      likelyFollowUp: ['How is use() different from useEffect for data fetching?', 'What is render-as-you-fetch?'],
    },
    prerequisites: ['react-useeffect'],
    relatedTopics: ['react-19-actions', 'react-tanstack-query', 'react-19-compiler'],
    nextTopics: ['react-19-compiler'],
    references: [
      { title: 'React 19 — use()', url: 'https://react.dev/reference/react/use', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-19-compiler',
    technology: 'react',
    title: 'React 19 — React Compiler (auto-memoization)',
    category: 'React 19',
    slug: 'react-19-compiler',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning:
      'The React Compiler (formerly React Forget) automatically inserts useMemo, useCallback, and memo at build time — you stop writing memoization by hand.',
    mentalModel:
      'The compiler is like an ESLint autofix for performance: it analyzes your component code, detects which values are stable between renders, and memoizes them automatically.',
    memoryTip:
      'React Compiler = automatic useMemo/useCallback/memo. You write plain code; the compiler optimises it. eslint-plugin-react-compiler tells you what to fix.',
    keyTerms: ['React Compiler', 'auto-memoization', 'React Forget', 'eslint-plugin-react-compiler', 'fine-grained reactivity'],
    interviewAnswer: `The React Compiler (ships with React 19, opt-in via babel plugin) statically analyzes component code at build time and automatically inserts memoization. It detects: (1) which values are stable between renders (auto useMemo), (2) which callbacks can be reused (auto useCallback), (3) which components don't need to re-render (auto memo). This means you stop writing useMemo/useCallback/memo manually — the compiler does it better because it sees the full dependency graph. Constraints: code must follow the Rules of React (no mutation during render, no conditional hooks). eslint-plugin-react-compiler flags violations. Impact: banking dashboards with 50+ components no longer need manual memoization — the compiler handles it, and you focus on correctness.`,
    codeExample: `// BEFORE React Compiler — manual memoization everywhere
function TransactionTable({ rows, filter }: Props) {
  const filtered = useMemo(
    () => rows.filter(r => r.status === filter),
    [rows, filter]
  );
  const handleClick = useCallback(
    (id: string) => selectTransaction(id),
    [selectTransaction]
  );
  return <Table data={filtered} onRowClick={handleClick} />;
}

// AFTER React Compiler — write plain code, compiler auto-memoizes
function TransactionTable({ rows, filter }: Props) {
  const filtered = rows.filter(r => r.status === filter);  // auto-memoized
  const handleClick = (id: string) => selectTransaction(id);  // auto-memoized
  return <Table data={filtered} onRowClick={handleClick} />;  // auto-memo'd
}`,
    codeLanguage: 'TypeScript',
    commonMistakes: [
      'Assuming the compiler removes ALL re-renders — it memoizes, but parent re-renders still propagate if props actually change.',
      'Mutating objects/arrays during render — the compiler cannot memoize code that breaks the Rules of React.',
      'Removing existing useMemo/useCallback before enabling the compiler — enable compiler first, then remove manual memoization gradually.',
    ],
    seniorInsight: 'The compiler is the biggest React paradigm shift since hooks. In banking teams, junior developers write "useMemo everywhere" or "useMemo nowhere" — both wrong. The compiler eliminates this problem entirely. Recommend enabling it project-wide and removing manual memoization over time.',
    aiAwareness: {
      strongAnswerShouldMention: ['build-time analysis', 'auto useMemo/useCallback/memo', 'Rules of React compliance', 'eslint plugin', 'replaces manual memoization'],
      weakAnswer: 'React Compiler makes React faster.',
      likelyFollowUp: ['What code patterns break the React Compiler?', 'How do you adopt the compiler incrementally?'],
    },
    prerequisites: ['react-usememo-usecallback', 'react-react-memo'],
    relatedTopics: ['react-19-actions', 'react-19-use-hook'],
    references: [
      { title: 'React Compiler', url: 'https://react.dev/learn/react-compiler', source: 'react.dev', type: 'official' },
    ],
  },
];
