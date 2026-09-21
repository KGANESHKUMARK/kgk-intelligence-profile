import type { LearningTopic } from '../../../types';

export const reactFundamentalsTopics: LearningTopic[] = [
  {
    id: 'react-overview',
    technology: 'react',
    title: 'What is React?',
    category: 'Fundamentals',
    slug: 'react-overview',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'React is a JavaScript library for building user interfaces out of components — it re-renders declaratively from state, and efficiently reconciles only what changed in the DOM.',
    mentalModel:
      'UI = f(state). You describe what the screen should look like for a given state; React works out the DOM updates. You never mutate the DOM directly — you change state and let React render.',
    memoryTip:
      'React = a library, not a framework. UI = f(state). You declare WHAT the UI should be; React decides HOW the DOM changes.',
    keyTerms: ['library vs framework', 'declarative UI', 'Virtual DOM', 'reconciliation', 'component', 'SPA'],
    visualIds: ['react-render-flow'],
    interviewAnswer:
      'React is a JavaScript library for building user interfaces, maintained by Meta. Its core ideas are: (1) components — composable, reusable UI units that return markup describing what should appear; (2) declarative rendering — you define UI as a function of state (UI = f(state)) instead of manually mutating the DOM; (3) reconciliation — when state changes, React re-renders the component, diffs the new output against the previous one, and applies only the minimal DOM updates. React is a library, not a full framework: routing, data fetching and build tooling come from the ecosystem (React Router, TanStack Query, Vite, Next.js).',
    detailedExplanation:
      'React maintains a lightweight description of the UI (the element tree) and reconciles it against the actual DOM. On each render, React builds a new element tree, diffs it against the previous tree (reconciliation, powered by the Fiber architecture), and commits the minimum set of DOM mutations. This makes rendering predictable and testable: the same props and state always produce the same UI output. The Fiber architecture (React 16+) makes reconciliation interruptible and prioritised, which is what enables features like concurrent rendering, transitions and Suspense in React 18+.',
    practicalExample:
      'In the NexusBank customer portal, the dashboard is a tree of components — BalanceCard, PortfolioChart, RecentTransactions — each owning small pieces of state. When a payment completes and the balance changes, only the BalanceCard subtree re-renders; the chart and table are untouched because their props did not change.',
    commonMistakes: [
      'Calling React a framework and assuming it ships routing, data fetching and DI out of the box — it does not; those are ecosystem choices.',
      'Believing the Virtual DOM is the performance feature itself — the real win is the declarative model; the virtual DOM diffing is an implementation detail with real costs.',
      'Mutating the DOM directly (e.g. document.getElementById) alongside React state — React will overwrite those changes on the next render.',
    ],
    seniorInsight:
      'The senior framing: React is a UI state synchronisation engine. Its real value in enterprise frontends is the predictable render model (same state in, same UI out), which is what makes features like audit trails, role-based UI and testable payment flows feasible at scale. The costs — bundle size, re-render traps, hydration complexity — are why performance discipline matters from day one.',
    aiAwareness: {
      strongAnswerShouldMention: ['library not framework', 'declarative', 'UI = f(state)', 'reconciliation', 'component model', 'ecosystem'],
      weakAnswer: 'React is a framework for building websites with components.',
      redFlags: [
        'Saying React directly manipulates the Virtual DOM for you and that this is always faster than raw DOM.',
        'Not knowing the difference between a library and a framework.',
        'No mention of reconciliation or how rendering actually works.',
      ],
      likelyFollowUp: [
        'How does reconciliation work?',
        'When would you NOT choose React?',
        'What problem does the Virtual DOM actually solve?',
      ],
    },
    relatedTopics: ['react-jsx', 'react-components-props', 'react-reconciliation'],
    nextTopics: ['react-jsx', 'react-components-props'],
    references: [
      { title: 'React Official Docs — Describing the UI', url: 'https://react.dev/learn/describing-the-ui', source: 'react.dev', type: 'official' },
      { title: 'React vs the DOM: reconciliation', url: 'https://react.dev/learn/preserving-and-resetting-state', source: 'react.dev', type: 'documentation' },
    ],
  },

  {
    id: 'react-jsx',
    technology: 'react',
    title: 'JSX',
    category: 'Fundamentals',
    slug: 'react-jsx',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'JSX is HTML-like syntax that compiles to JavaScript function calls — it is an expression, not a template, so anything legal in JavaScript is legal around JSX.',
    mentalModel:
      'JSX is sugar for React.createElement / the jsx() runtime. <Card title="Balance" /> is just a function call returning an object describing the UI.',
    memoryTip:
      'JSX = JavaScript. Braces {} embed ANY expression (not statements). className not class. A component tag is just a function call.',
    keyTerms: ['transpilation', 'expression vs statement', 'jsx runtime', 'className', 'self-closing tags'],
    interviewAnswer:
      'JSX is a syntax extension that looks like HTML but compiles to plain JavaScript — modern runtimes emit jsx() calls from the automatic runtime. Because it is JavaScript, expressions go in braces, but statements (if, for) cannot appear inside JSX; you use ternaries, &&, or compute values before the return. Attributes use camelCase (className, onClick, tabIndex) because they map to DOM properties, not HTML strings. JSX is also strongly typed in TypeScript: a component’s props type is checked at every usage site, which is why JSX + TypeScript is the standard enterprise combination.',
    detailedExplanation:
      'The compiler (TypeScript/Babel/SWC with the automatic runtime) transforms <Greeting name="Ada" /> into something like jsx(Greeting, { name: "Ada" }). The returned element is a plain object describing the UI — type, props, key. React later uses these descriptors in reconciliation. Because JSX is an expression, it can be stored in variables, passed as props ({children}), returned conditionally, and mapped over. Common gotchas: falsy values — 0 renders but false/null/undefined do not, so count && <List /> renders "0" when count is 0; use ternaries for anything falsy-but-meaningful.',
    codeExample: `const amount = 12500.5;
// JSX on the left compiles to the call on the right:
const el = <BalanceCard amount={amount} currency="SGD" />;
// -> jsx(BalanceCard, { amount: 12500.5, currency: 'SGD' })

// Conditional rendering: ternary (safe) vs && (0-renders trap)
{txns.length > 0 ? <TxnTable rows={txns} /> : <EmptyState />}
{txns.length && <TxnTable rows={txns} />} // BUG: renders "0"`,
    codeOutput: 'The safe ternary renders the table or nothing; the && version renders the text "0" when the list is empty.',
    whyOutput:
      'txns.length evaluates to 0, and 0 is a renderable value in JSX, so it is painted as text. false, null and undefined are the only values React skips.',
    commonMistakes: [
      'Using if/for inside JSX braces — statements are not expressions; hoist logic above the return.',
      'Using class instead of className, or for instead of htmlFor.',
      'Rendering 0 via && — guard with an explicit comparison.',
      'Forgetting that JSX is case-sensitive: <card> renders an unknown HTML tag, <Card> renders your component.',
    ],
    seniorInsight:
      'In enterprise codebases, JSX’s real power is composition under types: a typed props interface makes every JSX usage site a compile-time contract. That is why design-system components (Button, DataGrid) catch misuse at build time rather than in QA — a direct BFSI compliance win.',
    aiAwareness: {
      strongAnswerShouldMention: ['compiles to function calls', 'expressions only', 'className', 'typed props', 'automatic runtime'],
      weakAnswer: 'JSX is HTML inside JavaScript.',
      redFlags: ['Saying JSX is a template engine.', 'Not knowing what JSX compiles to.', 'Mixing up statements and expressions.'],
      likelyFollowUp: ['What does JSX compile to?', 'Why can’t you use if inside JSX?', 'How does TypeScript interact with JSX?'],
    },
    prerequisites: ['react-overview'],
    relatedTopics: ['react-components-props', 'react-ts-props'],
    nextTopics: ['react-components-props'],
    references: [
      { title: 'Writing Markup with JSX', url: 'https://react.dev/learn/writing-markup-with-jsx', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-components-props',
    technology: 'react',
    title: 'Components & Props',
    category: 'Fundamentals',
    slug: 'react-components-props',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'A component is a function that takes props and returns UI; props are read-only inputs flowing down, and the same props must always produce the same output for a given render.',
    mentalModel:
      'Components are functions: props in, JSX out. Data flows DOWN (props), events flow UP (callbacks). A component should never edit its own props — that would break the one-way data flow contract.',
    memoryTip:
      'Props = data IN (read-only). State = changing data (owned). Events = data UP (callbacks). One-way flow keeps the data story traceable.',
    keyTerms: ['functional component', 'props', 'children', 'composition', 'one-way data flow', 'pure function'],
    interviewAnswer:
      'A React component is a function from props to UI description. Props are immutable inputs — a component must treat them as read-only, and all data flows in one direction: parent to child. Child-to-parent communication happens through callback props. Composition is preferred over inheritance: components accept children and other components as props (render props, slots) to build complex UIs from simple parts. Because components are expected to be pure functions of props and state, React can skip re-rendering a component when its props have not changed (React.memo) — which only works if you never mutate props.',
    detailedExplanation:
      'Function components execute on every render, so anything expensive inside them runs on every render — this is why useMemo/useCallback exist. Props changes are the primary re-render trigger: when a parent renders, all children re-render by default regardless of whether their props changed, unless the child is wrapped in React.memo and its props are shallow-equal. children is just a prop — passing elements as children lets the parent decide placement while the owner controls lifecycle. This is the "children pattern" that design systems use for layout-agnostic components.',
    codeExample: `type TxnRow = { id: string; merchant: string; amount: number };

function TransactionTable({ rows, onSelect }: {
  rows: TxnRow[];
  onSelect?: (id: string) => void;
}) {
  return (
    <table>{rows.map(r => <TxnRow key={r.id} row={r} onSelect={onSelect} />)}</table>
  );
}

// Composition: children as a prop
function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>;
}`,
    commonMistakes: [
      'Mutating props or deriving state by copying props into state — derive during render or memoize instead.',
      'Deep prop drilling through 5+ levels instead of composition or context.',
      'Creating components INSIDE another component’s body — a new component type every render unmounts/remounts the subtree.',
    ],
    seniorInsight:
      'At senior level, the question behind the question is data-flow ownership: who owns this state, who can change it, and who re-renders when it changes. Enterprise codebases get into trouble when a top-level page component owns everything (prop drilling + re-render storms) or when state is duplicated in parent and child (source-of-truth bugs in payment flows).',
    aiAwareness: {
      strongAnswerShouldMention: ['props are read-only', 'one-way data flow', 'composition over inheritance', 'children', 're-render on parent render'],
      weakAnswer: 'Components are like HTML tags and props are attributes you pass.',
      redFlags: ['Suggesting props can be mutated.', 'Not knowing children is a prop.', 'No mention of one-way data flow.'],
      likelyFollowUp: ['How do you avoid prop drilling?', 'Why is defining a component inside another component a problem?'],
    },
    prerequisites: ['react-jsx'],
    relatedTopics: ['react-state', 'react-usecontext', 'react-frontend-system-design'],
    nextTopics: ['react-state'],
    references: [
      { title: 'Your First Component / Passing Props', url: 'https://react.dev/learn', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-state',
    technology: 'react',
    title: 'State & Events',
    category: 'Fundamentals',
    slug: 'react-state',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'State is component-local data that changes over time; setting it schedules a re-render, and updates must be immutable because React detects change by reference comparison.',
    mentalModel:
      'State is a snapshot, not a live variable. Each render has its own frozen copy of state. setState schedules a new snapshot — it does not mutate the current one.',
    memoryTip:
      'State = changing data owned by the component. Never mutate: new array/object, not push or field assignment. Setter functions receive the PREVIOUS state — use them when the next value depends on the last.',
    keyTerms: ['useState', 'immutable update', 'batching', 'functional update', 'snapshot', 'lifting state up'],
    interviewAnswer:
      'State is data a component owns that can change, triggering a re-render. useState returns the current value for this render and a setter; updates are batched and asynchronous by design. Because React compares by reference, immutable updates are mandatory: create a new array/object instead of mutating. When the next value depends on the previous one, use the functional updater form setCount(c => c + 1) to avoid stale-state bugs under batching. State should live at the lowest common owner of everything that needs it — lifting state up shares it; colocating it minimises re-renders.',
    detailedExplanation:
      'React 18 batches all state updates — including inside promises, timeouts and native event handlers — so one event that calls three setters produces one render. Each render is a snapshot: event handlers capture the state values from the render they were created in, which is why "stale closure" bugs appear with async code and why functional updaters exist. Derived data should NOT be stored in state (e.g. filtering a list) — derive it during render; duplicated derived state is a classic consistency bug in transaction filters. For cross-component state, lift it to the nearest common ancestor or move it to a store/context — but only as far up as necessary, because every owner render re-renders its subtree.',
    codeExample: `const [txns, setTxns] = useState<Transaction[]>([]);

// BAD: mutation — same reference, React sees "no change"
// txns.push(newTxn); setTxns(txns);

// GOOD: new array reference
const load = (page: Txn[]) => setTxns(prev => [...prev, ...page]);

// Functional update avoids stale reads under batching
const approve = (id: string) =>
  setTxns(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));`,
    whyOutput:
      'The map returns a new array with a new object only for the approved transaction — reference changes propagate, and untouched rows keep their identity so memoized rows skip re-rendering.',
    commonMistakes: [
      'Mutating state directly (push, obj.field = x) — same reference means React skips the update.',
      'Treating setState as synchronous and reading state immediately after calling it.',
      'Storing derived data (filtered lists, totals) in state instead of computing during render.',
      'Using the stale value from the closure instead of the functional updater inside async callbacks.',
    ],
    seniorInsight:
      'Senior engineers treat state placement as an architecture decision: form state stays in the form, selection state stays in the table, server data lives in a cache (TanStack Query), and only genuinely global concerns (session, theme, permissions) go to a store. In payment flows, the review-step state must be derived from a single source of truth — duplicating amount/account in local state is how double-charge bugs happen.',
    aiAwareness: {
      strongAnswerShouldMention: ['immutable updates', 'batching', 'functional updater', 'lifting state up', 'derived state anti-pattern'],
      weakAnswer: 'useState makes a variable that updates the page.',
      redFlags: ['Mutating state arrays/objects.', 'Assuming setState is synchronous.', 'No mention of batching or reference equality.'],
      likelyFollowUp: [
        'Why is the functional updater form safer?',
        'When do you lift state up vs colocate it?',
        'How does batching work in React 18?',
      ],
    },
    prerequisites: ['react-components-props'],
    relatedTopics: ['react-forms', 'react-usememo-usecallback', 'react-state-taxonomy'],
    nextTopics: ['react-conditional-rendering'],
    references: [
      { title: 'State: A Component’s Memory', url: 'https://react.dev/learn/state-a-components-memory', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-conditional-rendering',
    technology: 'react',
    title: 'Conditional Rendering',
    category: 'Fundamentals',
    slug: 'react-conditional-rendering',
    status: 'published',
    difficulty: 'beginner',
    oneLineMeaning:
      'Conditional rendering is plain JavaScript: return different JSX (or null) based on conditions using ternaries, &&, or early returns.',
    mentalModel:
      'There is no "v-if". JSX is an expression, so branching is just the JavaScript you already know — with two traps: 0 renders, and false/null/undefined do not.',
    memoryTip:
      'Ternary for either/or, && for "maybe nothing", early return for whole branches. Never trust && with a number on the left.',
    keyTerms: ['ternary', 'short-circuit', 'null rendering', 'guard clause', 'falsy trap'],
    interviewAnswer:
      'Conditional rendering uses JavaScript conditionals inside JSX: a ternary for either/or branches, && for render-or-nothing, and early returns to switch entire layouts. null, undefined and false render nothing; 0 and NaN render as text, which is the classic bug in {items.length && <List />}. For exclusive states, prefer exhaustive ternaries or early returns over chained &&, because they make impossible states unrepresentable. Loading, empty, error and success states should be explicit branches — in banking UIs, each state (skeleton, empty account list, failed fetch, unauthorised) is a distinct, designed experience.',
    practicalExample:
      'A NexusBank transaction panel renders: skeleton while loading, an empty state for new accounts, an error state with retry on failure, and the table only when data exists. Modelling these as explicit branches (status === "loading" | "empty" | "error" | "ready") prevents the "blank panel" bug where all four states render at once.',
    commonMistakes: [
      '{count && <List />} rendering a stray "0" — use a comparison instead.',
      'Nesting ternaries until unreadable — extract a component or early-return.',
      'Hiding elements with CSS when they should not exist at all (matters for security-sensitive UI and screen readers).',
    ],
    seniorInsight:
      'Model conditional UI as a discriminated union of states rather than scattered booleans. isLoading + isError + isEmpty booleans can express impossible combinations (loading AND error); a single status union makes illegal states unrepresentable — the same discipline used for payment statuses.',
    aiAwareness: {
      strongAnswerShouldMention: ['ternary vs &&', '0-renders trap', 'null renders nothing', 'state modelling', 'early returns'],
      weakAnswer: 'You use if-else inside the JSX.',
      redFlags: ['Not knowing 0 renders.', 'Using display:none-style hiding for access-sensitive UI without discussing why.'],
      likelyFollowUp: ['What renders for 0, "", null, undefined, NaN?', 'How do you model loading/error/empty states cleanly?'],
    },
    prerequisites: ['react-jsx'],
    relatedTopics: ['react-lists-keys', 'react-ts-props'],
    nextTopics: ['react-lists-keys'],
    references: [
      { title: 'Conditional Rendering', url: 'https://react.dev/learn/conditional-rendering', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-lists-keys',
    technology: 'react',
    title: 'Lists & Keys',
    category: 'Fundamentals',
    slug: 'react-lists-keys',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Keys give elements a stable identity across renders so React can match old and new trees; key = identity, not position.',
    mentalModel:
      'Think of keys as national ID numbers on rows, not seat numbers. If the ID stays, React knows it is the same row — even if it moved. Index keys change meaning when the list reorders.',
    memoryTip:
      'Key = identity. Stable data id, never array index (unless the list is static). Index key + reorder + local state = corrupted rows.',
    keyTerms: ['key', 'identity', 'reconciliation', 'index anti-pattern', 'unmount/remount', 'state loss'],
    interviewAnswer:
      'When rendering lists, keys tell React which DOM elements correspond to which data items between renders. With stable keys, React can reorder, insert and delete efficiently while preserving element state (focus, input values, animations). Array index keys break this: when items are inserted at the front or sorted, the index identifies a different item each render, so React patches the wrong elements — causing state corruption (e.g. an input row showing another row’s value) and lost focus. Index keys are acceptable only when the list is static: never reordered, never filtered, never mutated.',
    detailedExplanation:
      'During reconciliation React first compares element types at the same position; with matching keys it matches children by key rather than by index. With index keys on a prepend, every row’s key now points to different data, so React diffs row 0-old vs row 0-new and updates text in place — the DOM churn you tried to avoid, plus any local state (uncontrolled input content, expanded/collapsed flags) stays attached to the position instead of the record. In a banking transactions table with editable memo fields, that means a user’s in-progress edit can silently jump to a different transaction after a background refresh inserts a newer transaction at the top.',
    practicalExample:
      'The NexusBank operations table refreshes every 5 seconds and prepends new transactions. Rows keyed by transactionId keep the analyst’s selected row and in-progress review notes attached to the right transaction; rows keyed by index would shift the selection onto whatever row now occupies that index.',
    commonMistakes: [
      'Using the array index as key for sortable/filterable/live-updating lists.',
      'Using Math.random() as key — remounts every row on every render.',
      'Believing keys are for "performance only" — they are for correctness of state association.',
    ],
    seniorInsight:
      'Key choice is a correctness decision, not an optimisation. The interview trap: "keys make lists faster" — wrong framing. Keys make reconciliation correct; performance is a side effect. Follow-up probes: what breaks with index keys (state), when are index keys fine (static lists), and how key choice interacts with virtualization (stable keys are required there too).',
    aiAwareness: {
      strongAnswerShouldMention: ['identity across renders', 'index key bugs', 'state preservation', 'prepend/reorder scenario'],
      weakAnswer: 'Keys are required to remove the console warning.',
      redFlags: ['Saying keys are only an optimisation.', 'Not being able to describe a concrete index-key bug.'],
      likelyFollowUp: ['When IS the index an acceptable key?', 'What happens to component state when a key changes?'],
    },
    prerequisites: ['react-conditional-rendering'],
    relatedTopics: ['react-state', 'react-virtualization'],
    nextTopics: ['react-forms'],
    references: [
      { title: 'Rendering Lists / Keeping the key pure', url: 'https://react.dev/learn/rendering-lists', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-forms',
    technology: 'react',
    title: 'Forms: Controlled vs Uncontrolled',
    category: 'Fundamentals',
    slug: 'react-forms',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'A controlled component keeps the input value in React state (React is the source of truth); an uncontrolled component lets the DOM own the value and reads it on demand.',
    mentalModel:
      'Controlled = React owns the value and re-renders on every keystroke (single source of truth). Uncontrolled = the DOM owns it; you query it when you need it (like reading a form on submit).',
    memoryTip:
      'Controlled: value + onChange, state drives UI — needed for validation, formatting, conditional fields. Uncontrolled: ref + defaultValue — fine for simple forms and huge forms where per-keystroke re-renders hurt.',
    keyTerms: ['controlled component', 'uncontrolled', 'defaultValue', 'schema validation', 'React Hook Form', 'cross-field validation'],
    interviewAnswer:
      'In a controlled component, form data lives in React state: the input’s value prop and onChange handler make React the single source of truth, enabling instant validation, input masking (currency fields), conditional fields and disabled-submit logic. In an uncontrolled component, the DOM holds the value and you read it via a ref when needed — fewer re-renders, simpler code, but no per-keystroke logic. Enterprise forms are usually controlled (or React Hook Form, which is uncontrolled internally but gives controlled-style APIs with subscription-based re-renders) because payment forms need field-level validation, cross-field rules (amount ≤ account balance), async validation (beneficiary limits) and accessible error messaging.',
    practicalExample:
      'The NexusBank payment form is controlled: amount is formatted as currency on each change, the submit button stays disabled until the schema validates, amount is cross-checked against available balance, and the beneficiary field runs async validation against a whitelist. A settings page with a single "display name" field stays uncontrolled — read once on submit.',
    commonMistakes: [
      'Setting value without onChange — the field becomes read-only.',
      'Validating only on submit; senior-level forms validate on blur/change with clear error announcements.',
      'Re-rendering the entire page on every keystroke because field state was lifted too high.',
      'Trusting client-side validation as a security control — the backend must re-validate everything.',
    ],
    seniorInsight:
      'The senior take is about correctness, not convenience: a controlled payment form gives you one serialisable snapshot of intent at submit time — the exact object you send to the API and show on the review screen. With uncontrolled fields, the review screen and the payload can diverge. For large forms, subscription-based libraries (RHF) give controlled semantics without per-keystroke re-render of the whole form.',
    aiAwareness: {
      strongAnswerShouldMention: ['source of truth', 'value + onChange', 'validation timing', 're-render cost', 'RHF subscription model'],
      weakAnswer: 'Controlled forms are better; uncontrolled are bad.',
      redFlags: ['No mention of source of truth.', 'Not knowing when uncontrolled is the right choice.'],
      likelyFollowUp: ['How does React Hook Form avoid re-renders?', 'How do you handle async validation on blur?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-ts-props', 'react-frontend-system-design'],
    nextTopics: ['react-useeffect'],
    references: [
      { title: 'React: Controlled inputs', url: 'https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable', source: 'react.dev', type: 'official' },
    ],
  },
];
