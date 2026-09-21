import type { LearningTopic } from '../../../types';

export const reactTypescriptTopics: LearningTopic[] = [
  {
    id: 'react-ts-props',
    technology: 'react',
    title: 'TypeScript for React — Props, Events & Unions',
    category: 'TypeScript',
    slug: 'react-ts-props',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'TypeScript turns component contracts into compile-time guarantees: typed props, typed events, and discriminated unions that make impossible states unrepresentable.',
    mentalModel:
      'Props types are the component’s API contract. Event types tell you what you may read. Discriminated unions model states like a state machine: a transaction is PENDING or COMPLETED, never "status: string, maybe null".',
    memoryTip:
      'Union types for closed sets (status, currency). Discriminated unions for states with different shapes. React.ChangeEvent<HTMLInputElement> for inputs — never "any".',
    keyTerms: ['interface vs type', 'union type', 'discriminated union', 'type guard', 'utility types', 'event types'],
    interviewAnswer:
      'Component contracts start with typed props: interfaces for the public shape, type unions for closed sets — type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" replaces boolean soup like isPending + isFailed. Events are typed generically: React.ChangeEvent<HTMLInputElement>, React.FormEvent, React.MouseEvent — the handler knows exactly what it received. Discriminated unions with a discriminant field (status) plus type guards let the compiler narrow payload types: only a FAILED transaction carries a failureReason, so code that reads it without checking status does not compile. Utility types (Pick, Omit, Partial, Record, ReturnType) derive prop types from API models instead of hand-copying them, so a backend field change surfaces as a compile error at every affected component.',
    codeExample: `type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface Transaction {
  transactionId: string;
  amount: number;
  currency: 'SGD' | 'USD' | 'INR';
  status: TransactionStatus;
  failureReason?: string;
}

// Discriminated union: only FAILED transactions carry a reason
type TxnView =
  | { status: 'PENDING' }
  | { status: 'COMPLETED'; settledAt: Date }
  | { status: 'FAILED'; reason: string };

function banner(t: TxnView): string {
  switch (t.status) {
    case 'FAILED': return \`Failed: \${t.reason}\`; // narrowed — safe
    case 'PENDING': return 'Processing…';
    default: return 'Completed';
  }
}`,
    commonMistakes: [
      'Typing props as any or loosely as object — the contract disappears exactly where it matters most.',
      'String enums for status with no exhaustiveness check — adding a status silently breaks switch statements.',
      'Typing events as any and losing the compiler’s protection on e.target.value.',
      'Duplicating API types by hand instead of deriving (Pick/Omit/ReturnType) from one source.',
    ],
    seniorInsight:
      'In BFSI, the type system is a compliance tool: a closed TransactionStatus union means a new backend status is a compile error in every switch that has not handled it — not a runtime surprise in a payment flow. Senior candidates show discriminated unions for domain states and derived prop types from the API layer.',
    aiAwareness: {
      strongAnswerShouldMention: ['unions over booleans', 'discriminated unions + narrowing', 'typed events', 'utility types for API models'],
      weakAnswer: 'TypeScript gives you autocomplete.',
      redFlags: ['any in props.', 'No idea how type guards narrow unions.'],
      likelyFollowUp: ['interface vs type — when do you pick which?', 'How would you type a generic DataTable<T>?'],
    },
    prerequisites: ['react-components-props'],
    relatedTopics: ['react-ts-generics-hooks', 'react-forms'],
    nextTopics: ['react-ts-generics-hooks'],
    references: [
      { title: 'TypeScript + React — React docs', url: 'https://react.dev/learn/typescript', source: 'react.dev', type: 'official' },
    ],
  },

  {
    id: 'react-ts-generics-hooks',
    technology: 'react',
    title: 'Generics, Utility Types & Typed Hooks',
    category: 'TypeScript',
    slug: 'react-ts-generics-hooks',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Generics make components and hooks reusable while preserving type information end-to-end — a useFetch<T> or DataTable<T> stays fully typed for every shape it serves.',
    mentalModel:
      'A generic is a type parameter, like a function parameter for types: useApi<Transaction[]> promises exactly what it fetches, and the compiler tracks it through every call site.',
    memoryTip:
      'Generic component = <T,> in the arrow function. Utility types compose: Omit<Transaction,"riskLevel"> & { risk: RiskLevel }. ReturnType<typeof selector> keeps hooks honest.',
    keyTerms: ['generic component', 'constrained generic', 'keyof', 'ReturnType', 'discriminated union', 'typed API layer'],
    interviewAnswer:
      'Generics keep reusable infrastructure type-safe: a DataTable<T> typed over its row model gives column definitions, row callbacks and selection state the correct T at every usage; a useQuery-style hook typed as useApi<T>(path) returns Promise<T> so consumers never cast. Constraints (T extends { id: string }) express requirements — a row needs an identity for keys. Utility types derive rather than duplicate: TransactionFilters = Pick<TransactionQuery, "status" | "currency" | "dateRange">, CreatePaymentRequest = Omit<Payment, "txnId" | "status">. For Redux, typed hooks (useAppSelector/useAppDispatch) and selectors typed via ReturnType keep the store contract in one place. The payoff in a banking app: changing the Transaction model breaks every dependent component at compile time instead of in production.',
    codeExample: `interface Column<T> { key: keyof T & string; header: string; render?: (row: T) => React.ReactNode; }

function DataTable<T extends { id: string }>({ rows, columns }: {
  rows: T[]; columns: Column<T>[];
}) {
  return <table>{rows.map(r => <tr key={r.id}>…</tr>)}</table>;
}
// DataTable<Transaction> — column keys are checked against Transaction fields`,
    commonMistakes: [
      'Casting with `as` to silence the compiler instead of modelling the type correctly.',
      'any in generic defaults "to keep it simple" — the escape hatch spreads.',
      'Hand-writing API response types instead of deriving them from one schema source.',
    ],
    seniorInsight:
      'Generics are how design systems scale: DataTable<T>, useApi<T>, Form<T> — one implementation, every consumer type-checked against its own row type. In BFSI, where a mis-typed field can mean a mis-keyed settlement amount, compile-time contracts are cheaper than runtime incidents.',
    aiAwareness: {
      strongAnswerShouldMention: ['generic constraints', 'derived types', 'single source of truth for API types', 'exhaustiveness'],
      weakAnswer: 'Generics make code look advanced.',
      redFlags: ['Reaching for `as` casts routinely.', 'No example of a typed generic component.'],
      likelyFollowUp: ['How would you type a generic DataTable with render props?', 'How do you keep API types in sync with the backend?'],
    },
    prerequisites: ['react-ts-props'],
    relatedTopics: ['react-frontend-system-design', 'react-redux-toolkit'],
    nextTopics: ['react-error-boundaries'],
    references: [
      { title: 'TypeScript — Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', source: 'TypeScript', type: 'official' },
    ],
  },
];
