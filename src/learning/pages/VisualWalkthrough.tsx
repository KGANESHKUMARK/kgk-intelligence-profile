import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnimatedPipeline } from '../components/AnimatedPipeline';
import type { PipelineStep } from '../components/AnimatedPipeline';
import { techLabel } from '../utils/tech';

/* ────────────────────────────────────── RAG Pipeline Steps ──────────────── */

const ragIndexingSteps: PipelineStep[] = [
  {
    id: 'ingest',
    label: 'Document Ingestion',
    icon: '📄',
    description: 'Load raw documents — PDFs, web pages, policy documents, FAQ pages — into the pipeline for processing.',
    detail:
      'Use document loaders (LangChain\'s PyPDFLoader, UnstructuredFileLoader) to extract raw text from diverse sources. For scanned PDFs, use OCR (Azure Form Recognizer, Tesseract). Add metadata: source file name, page number, section, effective_date, department. Metadata enables filtering later at query time.',
    codeSnippet: `from langchain_community.document_loaders import PyPDFLoader

# Load a banking policy document
loader = PyPDFLoader("payment_policy_v3.pdf")
docs = loader.load()

# Each doc has: page_content (text) + metadata (source, page)
print(docs[0].metadata)
# {'source': 'payment_policy_v3.pdf', 'page': 0}`,
    codeLanguage: 'python',
    highlight: 'Always preserve metadata (source, page, date) — it enables citation display and metadata filtering at query time.',
    color: 'blue',
  },
  {
    id: 'chunk',
    label: 'Chunking',
    icon: '✂️',
    description: 'Split documents into overlapping chunks of ~400 tokens — small enough to be specific, large enough to retain context.',
    detail:
      'RecursiveCharacterTextSplitter splits by paragraph → sentence → word, keeping semantic boundaries intact. Chunk size of 400 tokens with 50-token overlap is a common starting point. Too small: loses surrounding context. Too large: wastes token budget and dilutes relevance. Overlap ensures no information is lost at chunk boundaries. Advanced: sentence-window retrieval (retrieve small chunk, inject surrounding sentences into the prompt).',
    codeSnippet: `from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,        # ~400 tokens per chunk
    chunk_overlap=50,      # 50 token overlap between adjacent chunks
    separators=["\\n\\n", "\\n", ". ", " "],  # paragraph → sentence → word
)
chunks = splitter.split_documents(docs)
print(f"Split {len(docs)} pages into {len(chunks)} chunks")`,
    codeLanguage: 'python',
    highlight: 'Chunk size is the #1 tuning knob. Start at 400 tokens with 50 overlap. Measure retrieval precision with RAGAS before changing.',
    color: 'purple',
  },
  {
    id: 'embed',
    label: 'Embedding',
    icon: '🧬',
    description: 'Convert each text chunk into a dense vector (array of numbers) that captures semantic meaning — similar texts have similar vectors.',
    detail:
      'An embedding model (text-embedding-3-small, bge-m3, sentence-transformers) maps text to a high-dimensional vector (768 or 1536 dimensions). "Payment terms for wire transfers" and "How long do bank transfers take?" produce similar vectors despite different words — semantic similarity, not keyword matching. Critical rule: use the SAME embedding model for indexing and querying. Mismatched models produce incomparable vectors.',
    codeSnippet: `from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Each chunk → 1536-dimensional vector
vector = embeddings.embed_query("What are the payment terms?")
print(f"Vector dimension: {len(vector)}")   # 1536
print(f"First 5 values: {vector[:5]}")       # [-0.012, 0.034, ...]`,
    codeLanguage: 'python',
    highlight: 'Same embedding model for indexing AND querying — mismatched models produce incomparable vectors and destroy retrieval accuracy.',
    color: 'green',
  },
  {
    id: 'store',
    label: 'Vector Store',
    icon: '🗄️',
    description: 'Store vectors + metadata in a vector database for fast similarity search — FAISS, pgvector, Pinecone, or Weaviate.',
    detail:
      'The vector store indexes all chunk embeddings for efficient nearest-neighbour search. FAISS (Facebook AI Similarity Search) is in-memory, fast, great for prototypes. pgvector is a PostgreSQL extension — keeps vectors alongside structured data in one database (ideal for banking: joins between chunks and account metadata). Pinecone/Weaviate are managed cloud services with auto-scaling. Store the original text + metadata alongside the vector — you need the text for the prompt and metadata for citations.',
    codeSnippet: `from langchain_community.vectorstores import FAISS

# Build the vector store from chunks + embeddings
vectorstore = FAISS.from_documents(chunks, embeddings)

# Save for later use (production: use pgvector or Pinecone)
vectorstore.save_local("banking_faq_index")

# pgvector alternative (production):
# CREATE EXTENSION vector;
# CREATE TABLE chunks (id serial, content text, embedding vector(1536), metadata jsonb);
# CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);`,
    codeLanguage: 'python',
    highlight: 'pgvector keeps vectors in PostgreSQL alongside structured data — one database for vectors + business data, no separate vector DB to manage.',
    color: 'orange',
  },
];

const ragQuerySteps: PipelineStep[] = [
  {
    id: 'query',
    label: 'User Question',
    icon: '❓',
    description: 'The user asks a question in natural language. The RAG pipeline starts.',
    detail:
      'The user query enters the pipeline. Before embedding, apply input sanitisation: strip PII (names, account numbers), detect prompt injection attempts ("ignore all instructions and..."), and optionally rewrite the query for better retrieval. Query rewriting: rephrase "How long does a wire take?" to "What is the processing time for domestic and international wire transfers?" — broader query retrieves more relevant chunks.',
    highlight: 'Query rewriting (expanding the query before retrieval) often improves recall by 20-30% — the original question may use different terms than the documents.',
    color: 'blue',
  },
  {
    id: 'retrieve',
    label: 'Vector Search',
    icon: '🔍',
    description: 'Embed the question with the same model, then find the top-K most similar chunks by cosine similarity.',
    detail:
      'The question is embedded into a vector. Cosine similarity measures the angle between the question vector and each chunk vector — closer angle = more similar meaning. Retrieve top-20 candidates (not top-5 — we\'ll rerank next). Hybrid search combines vector similarity (semantic) with BM25 keyword search (exact terms) using Reciprocal Rank Fusion (RRF). BM25 wins on product codes, exact names; vectors win on paraphrased questions.',
    codeSnippet: `# Hybrid search: vector + keyword (BM25) with RRF fusion
retriever = vectorstore.as_retriever(
    search_type="mmr",           # Maximum Marginal Relevance (diversity)
    search_kwargs={"k": 20, "fetch_k": 50}
)

# Or: pgvector hybrid search (SQL)
# SELECT *, 
#   0.7 * (1 - (embedding <=> query_vec)) +
#   0.3 * ts_rank(to_tsvector('english', content), query_ts)
#   AS score
# FROM chunks ORDER BY score DESC LIMIT 20;`,
    codeLanguage: 'python',
    highlight: 'Hybrid search (vector + BM25 keyword) consistently outperforms pure vector search — BM25 catches exact product codes and names that vector similarity misses.',
    color: 'purple',
  },
  {
    id: 'rerank',
    label: 'Re-ranking',
    icon: '🏆',
    description: 'A cross-encoder re-scores the top-20 retrieved chunks for true relevance — much more accurate than vector similarity alone.',
    detail:
      'Vector similarity is a first-pass approximation. A cross-encoder (BGE-Reranker, Cohere Rerank) takes (question, chunk) pairs as input and outputs a precise relevance score. It reads both texts together (not separately like embedding models), so it understands the relationship between question and chunk. Take the top-5 after reranking — these are the chunks the LLM will see. Reranking improves answer quality significantly for complex, multi-part questions.',
    codeSnippet: `from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

# Cross-encoder reranking: top-20 → top-5 by true relevance
reranker = CohereRerank(model="rerank-v3.5", top_n=5)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=retriever,     # returns top-20
)

# Result: 5 most relevant chunks, much more accurate than vector sim alone
relevant_chunks = compression_retriever.invoke("What are payment terms?")`,
    codeLanguage: 'python',
    highlight: 'Without reranking, 40% of retrieved chunks are irrelevant noise. With a cross-encoder reranker, precision jumps from ~60% to ~90%.',
    color: 'green',
  },
  {
    id: 'prompt',
    label: 'Prompt Assembly',
    icon: '📝',
    description: 'Inject the top-5 reranked chunks into the LLM prompt as context, with instructions to cite sources.',
    detail:
      'Build the final prompt: system instruction ("You are a banking FAQ assistant. Answer ONLY from the provided context. Cite [Source: filename, page] for each fact.") + retrieved chunks (most relevant last — LLMs pay more attention to the end of the context) + user question. Token budget: system prompt (~200 tokens) + chunks (~2000 tokens) + question (~50 tokens) + output budget (~500 tokens) = ~2750 tokens total. Well within a 4K context window.',
    codeSnippet: `# Prompt template with citation instruction
SYSTEM_PROMPT = """You are a banking FAQ assistant.
Answer ONLY using the provided context documents.
If the answer is not in the context, say "I don't have this information."
Cite sources as [Source: filename, page X] after each fact.

Context documents:
{context}
"""

# Chunk injection (most relevant last for recency bias)
context = "\\n\\n---\\n\\n".join([
    f"[Source: {c.metadata['source']}, page {c.metadata.get('page', '?')}]\\n{c.page_content}"
    for c in reversed(relevant_chunks)
])`,
    codeLanguage: 'python',
    highlight: 'Place the most relevant chunk LAST in the context — LLMs exhibit "recency bias" and pay more attention to the end of the input.',
    color: 'orange',
  },
  {
    id: 'generate',
    label: 'LLM Generation',
    icon: '🤖',
    description: 'The LLM generates a grounded answer using ONLY the retrieved context — not its training knowledge.',
    detail:
      'The LLM (GPT-4o-mini, Claude, Llama) reads the prompt with injected chunks and generates an answer. Temperature=0 for factual Q&A (no creativity needed). The system instruction constrains the LLM to answer only from context — reducing hallucination. The LLM adds citations [Source: ...] for each fact. If the answer is not in the context, the LLM should say "I don\'t have this information" rather than hallucinating.',
    codeSnippet: `from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=compression_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": prompt_template},
)

result = qa_chain.invoke("What are the payment terms for wire transfers?")
print(result["result"])       # Grounded answer with citations
for doc in result["source_documents"]:
    print(f"  [Source: {doc.metadata['source']}, p{doc.metadata.get('page')}]")`,
    codeLanguage: 'python',
    highlight: 'temperature=0 for factual RAG. The LLM should REFUSE to answer if the context doesn\'t contain the information — better than hallucinating.',
    color: 'red',
  },
  {
    id: 'evaluate',
    label: 'RAGAS Evaluation',
    icon: '📊',
    description: 'Continuously measure RAG quality with RAGAS metrics: Faithfulness, Answer Relevancy, Context Precision, Context Recall.',
    detail:
      'RAGAS (Retrieval Augmented Generation Assessment) provides 4 key metrics: Faithfulness — is every statement in the answer supported by the retrieved context? (catches hallucination). Answer Relevancy — does the answer actually address the question? Context Precision — are the retrieved chunks relevant? (measures retrieval quality). Context Recall — were all relevant chunks retrieved? (measures retrieval completeness). Run RAGAS on a curated evaluation set (50-100 question/answer/ground-truth triples) in CI. Alert if any metric drops below threshold.',
    codeSnippet: `from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

# Evaluate RAG pipeline quality
result = evaluate(
    dataset=eval_dataset,          # questions + ground truth + contexts
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)
print(result)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88,
#  'context_precision': 0.85, 'context_recall': 0.90}

# CI gate: fail if faithfulness < 0.85
assert result['faithfulness'] >= 0.85, "Faithfulness below threshold!"`,
    codeLanguage: 'python',
    highlight: 'Run RAGAS in CI after every retrieval change. A retrieval "improvement" that drops faithfulness from 0.92 to 0.78 is a regression, not a feature.',
    color: 'emerald',
  },
];

/* ──────────────────────────────── Walkthrough Registry ──────────────────── */

/* ────────────────────────────── React Hooks Lifecycle ───────────────────── */

const reactHooksLifecycleSteps: PipelineStep[] = [
  {
    id: 'rh-render',
    label: 'Component Renders',
    icon: '⚛️',
    description: 'React calls your function component — runs top to bottom. All hooks (useState, useMemo, useRef) execute in order.',
    detail:
      'The component function body executes. useState returns the current state value for THIS render (state is a snapshot, not a live variable). useMemo recomputes if dependencies changed. useRef returns the same ref object (stable across renders). useCallback returns the same function reference if dependencies are unchanged. The component returns JSX — React builds a new element tree.',
    codeSnippet: `function BankDashboard({ accountId }: { accountId: string }) {
  // 1. State hook — returns current snapshot
  const [filter, setFilter] = useState('all');

  // 2. Memo — recomputes only if deps change
  const filtered = useMemo(
    () => transactions.filter(t => filter === 'all' || t.type === filter),
    [transactions, filter]
  );

  // 3. Ref — stable reference across renders
  const tableRef = useRef<HTMLDivElement>(null);

  // 4. Return JSX — React builds element tree
  return <TransactionTable ref={tableRef} rows={filtered} />;
}`,
    highlight: 'Each render is a snapshot. Event handlers from this render always see THIS render\'s state values — even if state changes before the handler runs (stale closure).',
    color: 'blue',
  },
  {
    id: 'rh-reconciliation',
    label: 'Reconciliation (Diffing)',
    icon: '🔄',
    description: 'React compares the NEW element tree with the PREVIOUS one — finds the minimum DOM changes needed.',
    detail:
      'React walks both trees top-down. Same type + same key = update the existing DOM node (change attributes/text). Different type = unmount old, mount new. This is why keys matter in lists: without stable keys, React re-creates every item on reorder. With key={txn.id}, React moves the existing DOM node instead of recreating it. React.memo short-circuits here: if props are shallow-equal, React skips re-rendering the subtree entirely.',
    codeSnippet: `// BAD: key={index} — React can't track items across reorder
{transactions.map((txn, i) => <TxnRow key={i} txn={txn} />)}

// GOOD: key={txn.id} — React tracks each item by ID
{transactions.map(txn => <TxnRow key={txn.id} txn={txn} />)}

// React.memo: skip re-render if props haven't changed
const TxnRow = memo(function TxnRow({ txn }: { txn: Transaction }) {
  return <tr><td>{txn.date}</td><td>{txn.amount}</td></tr>;
});`,
    highlight: 'key={index} on a filtered/sorted list is a bug — it causes React to remount items instead of moving them, losing internal state (inputs, focus).',
    color: 'purple',
  },
  {
    id: 'rh-commit',
    label: 'DOM Commit',
    icon: '🎨',
    description: 'React applies the minimum DOM mutations — inserts, updates, and removes only what changed. The browser then paints.',
    detail:
      'React batches all DOM mutations and applies them in one synchronous pass. This is why you don\'t see intermediate states. After the DOM is updated, the browser runs layout and paint. React 18+ uses concurrent rendering: low-priority updates (transitions) can be interrupted by high-priority ones (user input). startTransition(() => setFilter(newFilter)) marks the filter update as low-priority — the typing input stays responsive even while a 10,000-row table re-renders in the background.',
    codeSnippet: `import { startTransition, useState } from 'react';

function SearchableTransactions() {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);                   // HIGH priority — update input immediately
    startTransition(() => {
      setFilter(e.target.value);                // LOW priority — table re-render can be interrupted
    });
  }

  return (
    <>
      <input value={input} onChange={handleChange} />
      <TransactionTable filter={filter} />  {/* re-renders in background */}
    </>
  );
}`,
    highlight: 'startTransition marks expensive re-renders as interruptible — the input stays responsive while the table re-renders in the background. This is React 18 concurrent rendering.',
    color: 'green',
  },
  {
    id: 'rh-effects',
    label: 'Effects Run (useEffect)',
    icon: '⚡',
    description: 'AFTER the DOM is painted, useEffect callbacks run. Effects handle side-effects: API calls, subscriptions, DOM measurements.',
    detail:
      'useEffect fires AFTER the browser has painted — the user sees the rendered UI first, then effects run. This prevents blocking the paint. Dependency array controls WHEN the effect re-runs: [] = mount only; [dep1, dep2] = when deps change; no array = every render (usually a bug). The cleanup function runs BEFORE the next effect and on unmount — cancel API calls, unsubscribe from WebSocket, clear timers. useLayoutEffect fires BEFORE paint — for DOM measurements (scrollTo, focus) that must happen before the user sees the result.',
    codeSnippet: `useEffect(() => {
  // Runs AFTER paint — fetch data
  const controller = new AbortController();
  api.get(\`/accounts/\${accountId}/transactions\`, {
    signal: controller.signal  // cancel on unmount
  }).then(r => setTransactions(r.data));

  // Cleanup: cancel fetch on unmount or accountId change
  return () => controller.abort();
}, [accountId]);  // re-runs when accountId changes

// BAD: missing dependency
useEffect(() => {
  fetchData(accountId);  // accountId changes, effect doesn't re-run!
}, []);  // ← missing accountId in deps`,
    highlight: 'Every effect must clean up after itself. Missing cleanup = memory leaks (WebSocket stays open), stale data (old fetch overwrites new), and "setState on unmounted component" warnings.',
    color: 'orange',
  },
  {
    id: 'rh-state-update',
    label: 'State Update → Re-render',
    icon: '🔁',
    description: 'A state setter (setState) schedules a new render. React batches multiple setters into ONE re-render. The cycle starts again from step 1.',
    detail:
      'When you call setState, React does NOT immediately re-render. It marks the component as "needs update" and batches with any other pending updates. React 18 batches ALL updates — including inside promises, timeouts, and native events (React 17 only batched inside React event handlers). After batching, React starts a new render cycle: call the component function → reconcile → commit → effects. The functional updater setCount(c => c + 1) reads the latest pending state, not the snapshot from the current render — use it when the next value depends on the previous one.',
    codeSnippet: `function PaymentForm() {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');

  function handleQuickPay() {
    // React 18: ALL three setters produce ONE re-render (batched)
    setAmount(1000);
    setCurrency('SGD');
    setStep('review');
    // Component has NOT re-rendered yet — state is still the old snapshot
    console.log(amount);  // still 0, not 1000!
  }

  // Functional updater for dependent updates
  function increment() {
    setCount(c => c + 1);  // reads latest pending value
    setCount(c => c + 1);  // builds on the PREVIOUS updater's result
    // Result: count + 2 (not count + 1)
  }
}`,
    highlight: 'React 18 batches ALL state updates into ONE render — even inside setTimeout, fetch.then, and native event listeners. This is automatic; you don\'t need to do anything.',
    color: 'red',
  },
];

/* ──────────────────────── Redux Data Flow ───────────────────────────────── */

const reduxFlowSteps: PipelineStep[] = [
  {
    id: 'rx-action',
    label: 'Dispatch Action',
    icon: '📤',
    description: 'A user interaction (button click, form submit) dispatches an action — a plain object with type and optional payload.',
    detail:
      'dispatch(accountSelected("ACC-001")) sends { type: "accounts/accountSelected", payload: "ACC-001" } to the Redux store. With createAsyncThunk, dispatching fetchAccounts(customerId) automatically dispatches pending, fulfilled, or rejected actions through the lifecycle. Actions are the ONLY way to change Redux state — no direct mutation.',
    codeSnippet: `// Sync action — auto-generated by createSlice
dispatch(accountSelected('ACC-001'));
// → { type: 'accounts/accountSelected', payload: 'ACC-001' }

// Async thunk — dispatches pending/fulfilled/rejected automatically
dispatch(fetchAccounts(customerId));
// 1. { type: 'accounts/fetch/pending' }
// 2. { type: 'accounts/fetch/fulfilled', payload: [...accounts] }
// or { type: 'accounts/fetch/rejected', error: {...} }`,
    highlight: 'Actions are serializable plain objects — this is what enables Redux DevTools time-travel debugging and action replay.',
    color: 'blue',
  },
  {
    id: 'rx-middleware',
    label: 'Middleware',
    icon: '🔗',
    description: 'Actions pass through middleware before reaching the reducer — thunk middleware handles async, custom middleware adds logging/analytics.',
    detail:
      'Middleware intercepts actions between dispatch and reducer. Redux Thunk (included in RTK) allows action creators to return functions instead of objects — the function receives dispatch and getState, enabling async workflows. Custom middleware: logging (log every action for audit), analytics (track user actions), error reporting (catch and report reducer errors). Middleware runs in order: logger → thunk → analytics → reducer.',
    codeSnippet: `// Custom audit middleware for banking compliance
const auditMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.startsWith('transfer/')) {
    auditLog.record({
      action: action.type,
      payload: action.payload,
      userId: store.getState().auth.userId,
      timestamp: Date.now(),
    });
  }
  return next(action);  // pass to next middleware / reducer
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(auditMiddleware),
});`,
    highlight: 'In banking apps, audit middleware logs every payment/transfer action for compliance — the Redux action log IS the audit trail.',
    color: 'purple',
  },
  {
    id: 'rx-reducer',
    label: 'Reducer (Immer)',
    icon: '⚙️',
    description: 'The reducer receives the action and returns the new state. With RTK, you "mutate" an Immer draft — Immer produces the immutable update.',
    detail:
      'createSlice reducers use Immer under the hood. You write state.items.push(item) — Immer intercepts the mutation and produces a new immutable state object. This is NOT real mutation; it\'s syntactic sugar. extraReducers handles actions from createAsyncThunk: pending → set loading, fulfilled → update data, rejected → set error. Each slice owns its portion of the state tree. The root reducer combines all slices.',
    codeSnippet: `const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    accountSelected: (state, action) => {
      state.selectedId = action.payload;  // Immer draft — looks like mutation
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;  // Immer — new immutable state produced
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      });
  },
});`,
    highlight: 'Immer makes Redux immutable updates readable: state.items.push(item) LOOKS like mutation but produces a new immutable state. Never mutate state outside Immer (e.g., in a selector).',
    color: 'green',
  },
  {
    id: 'rx-store',
    label: 'Store Updates',
    icon: '🗄️',
    description: 'The store saves the new state. Selectors extract data from the store. Components subscribed via useSelector re-render.',
    detail:
      'The store is a single JavaScript object containing all application state. useSelector(state => state.accounts.items) subscribes the component to that slice — React-Redux only re-renders if the selected value changes (reference equality by default). createSelector (reselect) memoizes derived data: if the input doesn\'t change, the selector returns the cached result — preventing expensive recomputation on every render. NEVER do expensive work inside useSelector — use createSelector instead.',
    codeSnippet: `import { createSelector } from '@reduxjs/toolkit';

// Memoized selector — recomputes only when inputs change
const selectHighValueTxns = createSelector(
  (state: RootState) => state.transactions.items,
  (state: RootState) => state.filters.minAmount,
  (items, minAmount) => items.filter(t => t.amount >= minAmount)
  // ↑ Only recomputes when items or minAmount changes
);

// Component — re-renders only when selected value changes
function HighValueAlerts() {
  const alerts = useSelector(selectHighValueTxns);
  return <AlertList items={alerts} />;
}`,
    highlight: 'useSelector compares by reference (===). createSelector memoizes derived data. Together they prevent unnecessary re-renders and recomputations.',
    color: 'orange',
  },
  {
    id: 'rx-devtools',
    label: 'DevTools & Time Travel',
    icon: '🔧',
    description: 'Redux DevTools records every action and state change — you can inspect, replay, and "time-travel" through the application history.',
    detail:
      'Redux DevTools (browser extension) provides: Action log — see every dispatched action with type, payload, and timestamp. State diff — see exactly what changed in the state tree after each action. Time travel — click any action to see the app state at that point. Action replay — export actions and replay them to reproduce bugs. This is invaluable for debugging complex banking workflows: replay a failed payment to see exactly which action caused the wrong state. configureStore enables DevTools automatically in development.',
    highlight: 'In banking bug reports, export the Redux action log from DevTools → reproduce the exact sequence of user actions that caused the bug. No guessing, no "works on my machine."',
    color: 'red',
  },
];

/* ────────────────────── React Rendering Pipeline ───────────────────────── */

const reactRenderingSteps: PipelineStep[] = [
  {
    id: 'rr-trigger',
    label: 'Trigger',
    icon: '🎯',
    description: 'A re-render is triggered by: setState, parent re-render, context value change, or forceUpdate.',
    detail:
      'Re-render triggers: (1) setState — the component that calls setState re-renders. (2) Parent renders — all children re-render by default, even if props are unchanged (unless wrapped in React.memo). (3) Context change — every consumer of the changed context re-renders. (4) useReducer dispatch. Re-render does NOT mean DOM update — React may reconcile and find no changes to commit. Understanding triggers is key to preventing unnecessary renders.',
    codeSnippet: `// Parent re-render → ALL children re-render (even if props same)
function Dashboard() {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <Clock time={time} />         {/* Re-renders: prop changed */}
      <AccountList />               {/* ALSO re-renders: parent re-rendered! */}
      <MemoizedChart data={data} /> {/* Skipped: React.memo + same props */}
    </>
  );
}`,
    highlight: 'Parent re-render → all children re-render. React.memo prevents this — but only if props are shallow-equal (no inline objects/callbacks).',
    color: 'blue',
  },
  {
    id: 'rr-render-phase',
    label: 'Render Phase (Pure)',
    icon: '🧮',
    description: 'React calls your component function and builds the new element tree. This phase is PURE — no side effects, no DOM access.',
    detail:
      'React calls the component function. Hooks execute in order. The function returns JSX (element tree). This phase can be interrupted and restarted by React 18 concurrent features (Suspense, transitions). Because it can restart, the render phase must be pure: no DOM manipulation, no API calls, no subscriptions. Side effects belong in useEffect (after paint) or event handlers.',
    highlight: 'The render phase can run TWICE in React 18 StrictMode (development only) to detect impure renders. If your component breaks under double-render, it has a side effect in the render phase.',
    color: 'purple',
  },
  {
    id: 'rr-reconcile',
    label: 'Reconciliation',
    icon: '⚖️',
    description: 'React diffs the new element tree against the previous one — same type+key = update, different type = unmount+remount.',
    detail:
      'Two heuristics: (1) Different element types produce different trees — React unmounts the old tree and mounts the new one entirely. <div> → <span> = full remount. (2) Keys identify elements across renders. key={txn.id} tells React "this is the same transaction row" even if its position changed. Without keys, React uses index — reordering causes every item to remount (losing input focus, animation state). Bail-out: if a memoized component\'s props are shallow-equal, React skips its entire subtree.',
    highlight: 'Reconciliation is O(n) — React walks the tree once. The key optimization: React assumes elements at different tree positions are different trees. This is why wrapping a component in an extra <div> can cause unexpected remounts.',
    color: 'green',
  },
  {
    id: 'rr-commit',
    label: 'Commit Phase',
    icon: '✅',
    description: 'React applies the calculated DOM mutations — insert, update, remove nodes. Then browser lays out and paints.',
    detail:
      'The commit phase is synchronous and cannot be interrupted. React batches all mutations and applies them in one pass. After commit: (1) useLayoutEffect runs (synchronous, before paint — for DOM measurements). (2) Browser layout + paint. (3) useEffect runs (asynchronous, after paint — for API calls, subscriptions). If the commit phase takes >16ms, the user sees a janky frame. This is why expensive renders should use startTransition to stay interruptible.',
    highlight: 'Re-render ≠ DOM update. If reconciliation finds no changes, the commit phase has nothing to do — no DOM is touched, no paint happens.',
    color: 'orange',
  },
];

/* ─────────────────────── Axios Interceptor Chain ───────────────────────── */

const axiosInterceptorSteps: PipelineStep[] = [
  {
    id: 'ax-create',
    label: 'Create Instance',
    icon: '🏗️',
    description: 'axios.create() with baseURL, timeout, and default headers — the single configured HTTP client for the entire app.',
    detail:
      'Create one Axios instance per API. Banking app: api = axios.create({ baseURL: "/api/v1", timeout: 15000 }). All components import this instance — never raw axios. BaseURL means you write api.get("/accounts") instead of repeating the full URL. Timeout prevents hung requests from blocking the UI. Content-Type: application/json by default.',
    codeSnippet: `const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});`,
    highlight: 'One instance, one import. Every request goes through this instance\'s interceptors. Never import raw axios in components.',
    color: 'blue',
  },
  {
    id: 'ax-req-interceptor',
    label: 'Request Interceptor',
    icon: '🔑',
    description: 'Intercepts EVERY outgoing request — injects JWT Bearer token, adds correlation ID, sets tenant header.',
    detail:
      'Request interceptors run before the request leaves the browser. Use cases: (1) JWT injection — read token from storage, add Authorization header. (2) Correlation ID — generate a UUID and add X-Correlation-ID for distributed tracing. (3) Multi-tenant — add X-Tenant-ID header. (4) Request timing — record start time for latency measurement. The token is read fresh on every request — so token refresh updates are picked up automatically.',
    codeSnippet: `api.interceptors.request.use((config) => {
  // 1. JWT injection
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = \`Bearer \${token}\`;

  // 2. Correlation ID for tracing
  config.headers['X-Correlation-ID'] = crypto.randomUUID();

  // 3. Request timing
  config.metadata = { startTime: Date.now() };

  return config;
});`,
    highlight: 'The request interceptor is the security perimeter — every API call automatically gets the JWT without any component knowing about authentication.',
    color: 'purple',
  },
  {
    id: 'ax-network',
    label: 'HTTP Request → Server',
    icon: '🌐',
    description: 'The request travels to the server. The server processes it and returns a response (or error).',
    detail:
      'The browser sends the HTTP request. Possible outcomes: (1) Success (2xx) — data returned. (2) Client error (4xx) — 400 validation, 401 unauthorized, 403 forbidden, 404 not found, 429 rate limited. (3) Server error (5xx) — 500 internal, 502 gateway, 503 unavailable. (4) Network error — no response at all (offline, DNS failure, CORS). (5) Timeout — server didn\'t respond within the configured timeout.',
    highlight: 'In banking, every HTTP call must handle ALL five outcomes — not just success and "something went wrong."',
    color: 'green',
  },
  {
    id: 'ax-res-interceptor',
    label: 'Response Interceptor',
    icon: '🛡️',
    description: 'Intercepts EVERY response — handles 401 token refresh, normalizes errors, logs latency, shows global error toasts.',
    detail:
      'Response interceptors have two handlers: success handler (2xx) and error handler (4xx/5xx/network). Key patterns: (1) 401 → refresh token, queue other failing requests, retry with new token. (2) 403 → redirect to unauthorized page. (3) 429 → wait Retry-After seconds, retry. (4) 5xx → retry with exponential backoff (max 3 attempts). (5) Network error → show offline banner. (6) Latency logging → config.metadata.startTime to measure round-trip time.',
    codeSnippet: `api.interceptors.response.use(
  (response) => {
    // Log latency
    const duration = Date.now() - response.config.metadata?.startTime;
    if (duration > 3000) console.warn(\`Slow API: \${response.config.url} took \${duration}ms\`);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      return handleTokenRefresh(error);  // refresh + retry
    }
    if (error.response?.status === 429) {
      const retryAfter = Number(error.response.headers['retry-after'] || 5);
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      return api(error.config!);  // retry after waiting
    }
    // Normalize error for components
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new AppError(error.response?.status, message));
  }
);`,
    highlight: '401 token refresh with request queue is the most critical interceptor in banking apps — prevents user interruption when tokens expire during form filling.',
    color: 'orange',
  },
  {
    id: 'ax-component',
    label: 'Component Receives Data',
    icon: '📊',
    description: 'The component receives the response data (via TanStack Query, useEffect, or direct call) and renders the UI.',
    detail:
      'Best practice: don\'t call Axios directly in components — use TanStack Query as the data layer. TanStack Query handles caching, background refetching, retry, and loading/error states. The Axios instance handles auth, error normalization, and retry. Together: Axios interceptors (transport layer) + TanStack Query (cache layer) + Component (UI layer). Each layer has a single responsibility.',
    codeSnippet: `// TanStack Query uses the configured Axios instance
function useAccounts(customerId: string) {
  return useQuery({
    queryKey: ['accounts', customerId],
    queryFn: () => api.get(\`/accounts/\${customerId}\`).then(r => r.data),
    // ↑ api = configured Axios instance with interceptors
    staleTime: 30_000,
    retry: 2,  // TanStack Query retry (on top of Axios retry)
  });
}

function AccountList() {
  const { data, isLoading, error } = useAccounts(customerId);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBanner error={error} />;
  return <DataTable rows={data} />;
}`,
    highlight: 'Axios (transport) + TanStack Query (cache) + Component (UI) = three clean layers. Each does one thing well. Don\'t mix concerns.',
    color: 'red',
  },
];

/* ─────────────────── WebSocket Connection Lifecycle ─────────────────────── */

const websocketLifecycleSteps: PipelineStep[] = [
  {
    id: 'ws-handshake',
    label: 'HTTP Upgrade Handshake',
    icon: '🤝',
    description: 'Client sends an HTTP request with Upgrade: websocket header. Server responds with 101 Switching Protocols. The connection is now bidirectional.',
    detail:
      'The WebSocket handshake starts as a normal HTTP GET request with headers: Connection: Upgrade, Upgrade: websocket, Sec-WebSocket-Key (random base64). The server validates the key, responds with 101 and Sec-WebSocket-Accept (hashed key). After this, the TCP connection switches from HTTP to WebSocket protocol — both sides can now send frames at any time without request/response overhead.',
    codeSnippet: `// Client initiates WebSocket connection
const ws = new WebSocket('wss://api.bank.com/prices');

// Under the hood, the browser sends:
// GET /prices HTTP/1.1
// Host: api.bank.com
// Upgrade: websocket
// Connection: Upgrade
// Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
// Sec-WebSocket-Version: 13

// Server responds:
// HTTP/1.1 101 Switching Protocols
// Upgrade: websocket
// Connection: Upgrade
// Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`,
    highlight: 'The handshake is HTTP — after 101, the connection is pure WebSocket. This is why WebSocket URLs use wss:// (secure) like HTTPS uses https://.',
    color: 'blue',
  },
  {
    id: 'ws-open',
    label: 'Connection Open',
    icon: '✅',
    description: 'WebSocket is connected. ws.onopen fires. Reset the reconnection backoff counter. Flush any queued messages.',
    detail:
      'In React, ws.onopen is handled inside a useEffect. On open: (1) set status to "open", (2) reset the retry counter to 0 (backoff resets), (3) flush any messages that were queued while disconnected. The WebSocket instance is stored in a useRef — stable across renders, doesn\'t trigger re-renders on assignment.',
    codeSnippet: `ws.onopen = () => {
  setStatus('open');
  retryRef.current = 0;  // reset exponential backoff

  // Flush queued messages (buffered while disconnected)
  while (queueRef.current.length > 0) {
    ws.send(queueRef.current.shift()!);
  }

  // Subscribe to channels
  ws.send(JSON.stringify({ type: 'subscribe', channels: ['prices', 'alerts'] }));
};`,
    highlight: 'Store the WebSocket in useRef — not useState. useState would cause a re-render every time the socket instance changes (reconnection), useRef doesn\'t.',
    color: 'green',
  },
  {
    id: 'ws-message',
    label: 'Messages Flow',
    icon: '📨',
    description: 'Both client and server can send messages at any time. onmessage receives data. Parse JSON, update React state or TanStack Query cache.',
    detail:
      'Messages arrive as MessageEvent with a data property. For JSON data: JSON.parse(event.data). For binary data: event.data is an ArrayBuffer. In banking: price updates arrive as { type: "price", symbol: "AAPL", price: 182.50, timestamp: 1719000000 }. Best practice: update TanStack Query cache directly with queryClient.setQueryData — the component re-renders automatically, and the data is cached/invalidated by TanStack Query\'s rules.',
    codeSnippet: `ws.onmessage = (event: MessageEvent) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case 'price_update':
      // Update TanStack Query cache — triggers component re-render
      queryClient.setQueryData(
        ['price', msg.symbol],
        (old: Price) => ({ ...old, price: msg.price, updatedAt: msg.timestamp })
      );
      break;

    case 'notification':
      // Show toast notification
      toast.info(msg.message);
      break;

    case 'balance_update':
      // Invalidate balance query — triggers refetch
      queryClient.invalidateQueries({ queryKey: ['balance', msg.accountId] });
      break;
  }
};`,
    highlight: 'Integrate WebSocket with TanStack Query: WebSocket pushes data → setQueryData updates the cache → components re-render automatically. Best of both worlds: real-time + caching.',
    color: 'purple',
  },
  {
    id: 'ws-heartbeat',
    label: 'Heartbeat / Keep-Alive',
    icon: '💓',
    description: 'Send a ping every 30s to keep the connection alive. If no pong within 5s, the connection is dead — close and reconnect.',
    detail:
      'Load balancers and proxies (Nginx, CloudFront, API Gateway) close idle connections after 30-60 seconds. A heartbeat ping prevents this. Implementation: setInterval sends a "ping" message. If the server doesn\'t respond with "pong" within 5 seconds, the connection is dead (zombie connection) — close it and trigger reconnection. Some WebSocket servers handle ping/pong at the protocol level (binary ping frames).',
    codeSnippet: `// Heartbeat: detect zombie connections
const HEARTBEAT_INTERVAL = 30_000;  // 30 seconds
const PONG_TIMEOUT = 5_000;  // 5 seconds to respond

let pongTimer: NodeJS.Timeout;
const heartbeat = setInterval(() => {
  if (ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({ type: 'ping' }));

  // If no pong in 5s, connection is dead
  pongTimer = setTimeout(() => {
    console.warn('WebSocket: no pong received, reconnecting...');
    ws.close();  // triggers onclose → reconnect
  }, PONG_TIMEOUT);
}, HEARTBEAT_INTERVAL);

// Clear pong timer when we receive the pong
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'pong') {
    clearTimeout(pongTimer);
    return;
  }
  // ... handle other messages
};`,
    highlight: 'Without a heartbeat, a "zombie" connection stays open for minutes — the client thinks it\'s connected, but no messages arrive. Heartbeat detects this and forces reconnection.',
    color: 'orange',
  },
  {
    id: 'ws-reconnect',
    label: 'Disconnect → Reconnect',
    icon: '🔄',
    description: 'Connection drops (network switch, server restart). Exponential backoff: wait 1s, 2s, 4s, 8s... max 30s before reconnecting.',
    detail:
      'ws.onclose fires when the connection drops. DO NOT immediately reconnect — if the server is down, you\'ll hammer it with requests. Exponential backoff: delay = min(1000 * 2^retry, 30000). First attempt: 1s. Second: 2s. Third: 4s. After 5 attempts: 30s. On successful reconnect (onopen), reset the counter. Also queue any messages the user sends while disconnected — flush the queue on reconnect.',
    codeSnippet: `ws.onclose = (event) => {
  setStatus('closed');
  clearInterval(heartbeat);  // stop pinging

  if (event.code === 1000) return;  // intentional close — don't reconnect

  // Exponential backoff
  const delay = Math.min(1000 * Math.pow(2, retryRef.current), 30_000);
  retryRef.current++;

  console.log(\`WebSocket: reconnecting in \${delay / 1000}s (attempt \${retryRef.current})\`);

  setTimeout(() => {
    if (mounted) connect();  // reconnect (check component still mounted)
  }, delay);
};

// Cleanup on unmount — intentional close (code 1000)
return () => {
  mounted = false;
  ws.close(1000, 'Component unmounted');
};`,
    highlight: 'Exponential backoff prevents thundering herd — if 1000 clients disconnect during a server restart, they reconnect at staggered intervals instead of all at once.',
    color: 'red',
  },
];

/* ─────────────────── File Upload Chunking Pipeline ─────────────────────── */

const fileUploadSteps: PipelineStep[] = [
  {
    id: 'fu-select',
    label: 'File Selection & Validation',
    icon: '📁',
    description: 'User selects a file via <input type="file"> or drag-and-drop. Validate file type, size, and naming before starting upload.',
    detail:
      'Client-side validation: check file.type (MIME), file.size (reject >5GB), file.name (sanitize special characters). For banking: validate file extension (only .csv, .xlsx, .pdf for batch payments). Show file metadata: name, size, type. For drag-and-drop: use onDragOver, onDrop events. For multiple files: input.multiple attribute.',
    codeSnippet: `function FileDropZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const validate = (file: File) => {
    const MAX = 5 * 1024 ** 3;  // 5GB
    const ALLOWED = ['text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (file.size > MAX) return 'File too large (max 5GB)';
    if (!ALLOWED.includes(file.type)) return 'Invalid file type';
    return null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    const error = validate(file);
    if (error) { toast.error(error); return; }
    onFile(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
    >
      <p>Drop file here or <label>browse<input type="file" hidden onChange={e => onFile(e.target.files![0])} /></label></p>
    </div>
  );
}`,
    highlight: 'Always validate on the client (fast UX feedback) AND on the server (security). Never trust client-side validation alone.',
    color: 'blue',
  },
  {
    id: 'fu-chunk',
    label: 'Chunk the File',
    icon: '✂️',
    description: 'file.slice(start, end) splits the File into 5MB chunks. Each chunk gets an index. A session ID ties all chunks together.',
    detail:
      'File.slice() returns a Blob — a lightweight reference to a portion of the file data (NOT a copy in memory). For a 2GB file with 5MB chunks: 400 chunks. Create a session ID (UUID) so the server knows which chunks belong together. Track chunk status: pending, uploading, complete, failed.',
    codeSnippet: `const CHUNK_SIZE = 5 * 1024 * 1024;  // 5MB

function createChunks(file: File) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const sessionId = crypto.randomUUID();
  const chunks: ChunkInfo[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    chunks.push({
      index: i,
      blob: file.slice(start, end),  // Blob reference — NOT a memory copy
      size: end - start,
      status: 'pending',
    });
  }

  return { sessionId, totalChunks, chunks, fileName: file.name };
}`,
    highlight: 'file.slice() creates a Blob reference — NOT a copy. Even slicing a 5GB file into 1000 chunks uses negligible memory. The actual data is read only when uploaded.',
    color: 'purple',
  },
  {
    id: 'fu-upload',
    label: 'Parallel Upload with Progress',
    icon: '🚀',
    description: 'Upload 3-5 chunks concurrently using a promise pool. Track progress per-chunk and aggregate into overall percentage.',
    detail:
      'Upload chunks in parallel (3-5 concurrent) for speed. Use a promise pool: start N uploads, when one finishes, start the next pending chunk. Track progress per-chunk via XMLHttpRequest.upload.onprogress or Axios onUploadProgress. Aggregate: (completedChunks + currentChunkProgress) / totalChunks * 100. Show: overall progress bar, estimated time remaining (bytes remaining / current speed), chunk-level status.',
    codeSnippet: `async function uploadChunks(
  chunks: ChunkInfo[], sessionId: string, onProgress: (pct: number) => void
) {
  const CONCURRENCY = 4;
  let completed = 0;
  const chunkProgress = new Array(chunks.length).fill(0);

  const pool = chunks.map((chunk, i) => async () => {
    if (chunk.status === 'complete') { completed++; return; }
    const form = new FormData();
    form.append('chunk', chunk.blob);
    form.append('index', String(i));
    form.append('session', sessionId);

    await api.post('/upload/chunk', form, {
      onUploadProgress: (e) => {
        chunkProgress[i] = e.loaded / e.total!;
        const total = chunkProgress.reduce((s, p) => s + p, 0) / chunks.length;
        onProgress(total * 100);
      },
    });
    chunk.status = 'complete';
    completed++;
  });

  // Promise pool: run N at a time
  const executing = new Set<Promise<void>>();
  for (const task of pool) {
    const p = task().then(() => executing.delete(p));
    executing.add(p);
    if (executing.size >= CONCURRENCY) await Promise.race(executing);
  }
  await Promise.all(executing);
}`,
    highlight: 'Promise pool limits concurrency to 3-5 — prevents flooding the server with 400 simultaneous requests. Each finished chunk starts the next pending one.',
    color: 'green',
  },
  {
    id: 'fu-resume',
    label: 'Resume on Failure',
    icon: '🔁',
    description: 'On failure or page reload, ask the server which chunks it has. Skip them. Upload only the missing chunks.',
    detail:
      'Resume flow: (1) GET /upload/status?session=abc → server returns { completedChunks: [0, 1, 2, 5, 6] }. (2) Mark those chunks as "complete" in the client. (3) Upload only the missing chunks (3, 4, 7, 8...). This is why each chunk has a session ID and index. For page reload: store the session ID in sessionStorage — on mount, check if there\'s an active session and resume. The tus protocol standardizes this entire flow.',
    codeSnippet: `async function resumeUpload(sessionId: string, file: File) {
  // Ask server which chunks are already uploaded
  const { data } = await api.get(\`/upload/status?session=\${sessionId}\`);
  const completedSet = new Set<number>(data.completedChunks);

  const { chunks } = createChunks(file);

  // Mark already-uploaded chunks
  chunks.forEach((chunk, i) => {
    if (completedSet.has(i)) chunk.status = 'complete';
  });

  const remaining = chunks.filter(c => c.status !== 'complete');
  console.log(\`Resuming: \${remaining.length} of \${chunks.length} chunks remaining\`);

  // Upload only the missing chunks
  await uploadChunks(chunks, sessionId, setProgress);
}

// Persist session ID for page-reload resume
sessionStorage.setItem('upload_session', JSON.stringify({ sessionId, fileName }));`,
    highlight: 'tus protocol (tus.io) is the open standard for resumable uploads. tus-js-client handles resume, retry, and progress out of the box — use it in production instead of building from scratch.',
    color: 'orange',
  },
  {
    id: 'fu-assemble',
    label: 'Server Assembly & Verification',
    icon: '🔧',
    description: 'After all chunks are uploaded, tell the server to assemble them into the final file. Verify integrity with checksums.',
    detail:
      'Client sends POST /upload/complete with the session ID, file name, total chunks, and SHA-256 hash of the original file. Server: (1) verifies all chunk indices are present, (2) concatenates chunks in order, (3) computes SHA-256 of the assembled file, (4) compares with the client hash — if mismatch, reject. (5) Moves the file to permanent storage. The hash computation on the client should happen in a Web Worker to avoid blocking the UI.',
    codeSnippet: `// Client: compute file hash in a Web Worker
const hashWorker = new Worker('/hash-worker.js');

hashWorker.postMessage({ file });
hashWorker.onmessage = async (e) => {
  const fileHash = e.data.hash;

  // Tell server to assemble
  await api.post('/upload/complete', {
    sessionId,
    fileName: file.name,
    totalChunks: chunks.length,
    fileSize: file.size,
    sha256: fileHash,  // integrity verification
  });

  toast.success('Upload complete!');
  sessionStorage.removeItem('upload_session');  // cleanup
};

// hash-worker.js (Web Worker — runs off main thread)
self.onmessage = async (e) => {
  const buffer = await e.data.file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  self.postMessage({ hash: hex });
};`,
    highlight: 'Web Worker for hashing — computing SHA-256 of a 5GB file takes seconds and would freeze the UI if done on the main thread. Always offload CPU-intensive work to a worker.',
    color: 'red',
  },
];

/* ────────────────── React Testing Pyramid ──────────────────────────────── */

const testingPyramidSteps: PipelineStep[] = [
  {
    id: 'tp-unit',
    label: 'Unit Tests (70%)',
    icon: '🧪',
    description: 'Test individual components with React Testing Library. Query by role, interact with userEvent, assert visible output. Fast, isolated, high coverage.',
    detail:
      'Unit/component tests are the foundation: fast (milliseconds), reliable (no external dependencies), high coverage. Use React Testing Library + Vitest/Jest. Test behavior, not implementation: render the component, find elements by accessible role/label, simulate user interactions (click, type, select), assert on visible output. Mock API calls with MSW (Mock Service Worker) — intercepts at the network level for realistic mocking. Run on every PR commit (fast gate).',
    codeSnippet: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from './mocks/server';  // MSW
import { rest } from 'msw';

test('shows error for invalid transfer amount', async () => {
  const user = userEvent.setup();
  render(<TransferForm />);

  await user.type(screen.getByLabelText('Amount'), '-500');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
});

test('submits transfer successfully', async () => {
  server.use(rest.post('/api/transfers', (req, res, ctx) => res(ctx.json({ success: true }))));
  const user = userEvent.setup();
  render(<TransferForm />);

  await user.type(screen.getByLabelText('Amount'), '1000');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  await screen.findByText('Transfer successful');
});`,
    highlight: 'Query by role (getByRole), not by test-id. This ensures your tests validate accessibility AND behavior at the same time.',
    color: 'green',
  },
  {
    id: 'tp-integration',
    label: 'Integration Tests (20%)',
    icon: '🔗',
    description: 'Test multiple components working together: form → API → state update → UI change. Verify contracts between frontend and backend.',
    detail:
      'Integration tests verify that components compose correctly: a form submission updates the table, a mutation invalidates the cache, a route guard redirects unauthenticated users. Test with MSW intercepting real API calls (not jest.mock). TanStack Query tests: verify query keys, cache invalidation after mutations, retry behavior. Redux tests: dispatch action → assert state. API contract tests: verify the frontend sends the right payload shape and handles the response shape correctly.',
    codeSnippet: `test('transfer flow: form → API → balance update', async () => {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <TransferPage />
    </QueryClientProvider>
  );

  // Verify initial balance
  expect(await screen.findByText('Balance: $10,000')).toBeInTheDocument();

  // Submit transfer
  await user.type(screen.getByLabelText('Amount'), '500');
  await user.click(screen.getByRole('button', { name: 'Transfer' }));

  // Verify balance updated (cache invalidated, refetched)
  await waitFor(() => {
    expect(screen.getByText('Balance: $9,500')).toBeInTheDocument();
  });
});`,
    highlight: 'Integration tests with MSW are worth 10 isolated unit tests. They catch real bugs: "mutation succeeded but forgot to invalidate the balance query."',
    color: 'blue',
  },
  {
    id: 'tp-e2e',
    label: 'E2E Tests (10%)',
    icon: '🌐',
    description: 'Full browser tests with Playwright/Cypress — test critical user journeys end-to-end: login → transfer → confirm → logout.',
    detail:
      'E2E tests run in a real browser against the full application. Only test CRITICAL paths: login flow, payment flow, RBAC (admin sees admin panel, user doesn\'t). Playwright: multi-browser (Chromium, Firefox, WebKit), auto-wait (no sleep()), network interception, tracing (video + screenshots on failure). Run nightly or on merge to main (too slow for every PR). Page Object Model: encapsulate page interactions in classes for DRY tests.',
    codeSnippet: `// Playwright — critical banking journey
test('complete payment flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@bank.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to transfers
  await page.getByRole('link', { name: 'Transfers' }).click();

  // Fill and submit transfer
  await page.getByLabel('To Account').fill('9876543210');
  await page.getByLabel('Amount').fill('1000');
  await page.getByRole('button', { name: 'Review' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Verify success
  await expect(page.getByText('Transfer successful')).toBeVisible();
});`,
    highlight: 'E2E tests are slow and potentially flaky — only test the happy path of CRITICAL journeys. Everything else should be covered by faster unit/integration tests.',
    color: 'purple',
  },
  {
    id: 'tp-coverage',
    label: 'Coverage & CI Gate',
    icon: '📊',
    description: 'Collect coverage reports. Set thresholds: 80% overall, 95% on payment flows. CI fails if coverage drops. Mutation testing for quality.',
    detail:
      'Coverage types: line (was this line executed?), branch (were both if/else paths taken?), function (was this function called?), statement. Tools: Istanbul (istanbul/nyc) or V8 (built into Vitest). CI integration: fail the build if coverage drops below threshold. Coverage doesn\'t measure test QUALITY — a test that calls a function without assertions has 100% coverage but catches nothing. Mutation testing (Stryker) modifies your code (changes === to !==) and verifies your tests catch the mutation — measures test effectiveness, not just execution.',
    codeSnippet: `// vitest.config.ts — coverage configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],  // lcov for CI tools (SonarQube)
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.stories.*'],
    },
  },
});

// package.json scripts
"test": "vitest",
"test:coverage": "vitest --coverage",
"test:ci": "vitest --coverage --reporter=junit"`,
    highlight: 'Coverage = "was this code executed?" Mutation testing = "do your tests actually catch bugs?" Both are needed. Aim for 80% coverage + mutation score >60%.',
    color: 'orange',
  },
];

const WALKTHROUGHS: Record<string, { title: string; subtitle: string; sections: { title: string; steps: PipelineStep[] }[] }> = {
  'rag-fundamentals': {
    title: 'RAG Pipeline — Visual Walkthrough',
    subtitle: 'Step-by-step animated guide: from raw documents to grounded AI answers with citations',
    sections: [
      { title: 'Phase 1: Indexing Pipeline (Offline)', steps: ragIndexingSteps },
      { title: 'Phase 2: Query Pipeline (Real-time)', steps: ragQuerySteps },
    ],
  },
  'react-useeffect': {
    title: 'React Hooks Lifecycle — Visual Walkthrough',
    subtitle: 'How React renders, reconciles, commits, and runs effects — the complete lifecycle with code',
    sections: [
      { title: 'The React Render Cycle', steps: reactHooksLifecycleSteps },
    ],
  },
  'react-redux-deep': {
    title: 'Redux Data Flow — Visual Walkthrough',
    subtitle: 'Action → Middleware → Reducer → Store → Component — the unidirectional data flow with banking examples',
    sections: [
      { title: 'Redux Unidirectional Data Flow', steps: reduxFlowSteps },
    ],
  },
  'react-reconciliation': {
    title: 'React Rendering Pipeline — Visual Walkthrough',
    subtitle: 'Trigger → Render → Reconcile → Commit — understanding what happens on every state change',
    sections: [
      { title: 'The Four Phases of React Rendering', steps: reactRenderingSteps },
    ],
  },
  'react-axios-http': {
    title: 'Axios Interceptor Chain — Visual Walkthrough',
    subtitle: 'How every HTTP request flows through interceptors: JWT injection, error handling, token refresh',
    sections: [
      { title: 'Axios Request → Response Pipeline', steps: axiosInterceptorSteps },
    ],
  },
  'react-websocket': {
    title: 'WebSocket Connection Lifecycle — Visual Walkthrough',
    subtitle: 'Handshake → messages → heartbeat → reconnection — the complete WebSocket lifecycle in React',
    sections: [
      { title: 'WebSocket Lifecycle', steps: websocketLifecycleSteps },
    ],
  },
  'react-file-upload': {
    title: 'Chunked File Upload Pipeline — Visual Walkthrough',
    subtitle: 'How to upload GB-sized files: chunk → parallel upload → resume → verify — with progress tracking',
    sections: [
      { title: 'Chunked Resumable Upload', steps: fileUploadSteps },
    ],
  },
  'react-testing-unit': {
    title: 'React Testing Pyramid — Visual Walkthrough',
    subtitle: 'Unit → Integration → E2E → Coverage: the complete testing strategy with banking examples',
    sections: [
      { title: 'The Testing Pyramid', steps: testingPyramidSteps },
    ],
  },
};

/* ──────────────────────────────── Page Component ────────────────────────── */

export default function VisualWalkthrough() {
  const { tech = '', topicId = '' } = useParams();
  const walkthrough = WALKTHROUGHS[topicId];

  if (!walkthrough) {
    return <Navigate to={`/learning/${tech}`} replace />;
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to={`/learning/${tech}/topic/${topicId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-3)] transition-colors hover:text-[var(--accent-text)]"
      >
        <ArrowLeft size={14} />
        Back to {techLabel(tech)} — {walkthrough.title.replace(' — Visual Walkthrough', '')}
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text)] sm:text-2xl">{walkthrough.title}</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">{walkthrough.subtitle}</p>
      </div>

      {/* Pipeline sections */}
      {walkthrough.sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-sm font-semibold text-[var(--accent-text)]">{section.title}</h2>
          <AnimatedPipeline
            title={section.title}
            subtitle={`${section.steps.length} steps — click any step or press Play`}
            steps={section.steps}
            autoPlayInterval={5000}
          />
        </div>
      ))}

      {/* Summary card */}
      <div className="surface-card rounded-2xl border border-[var(--line)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text)]">Quick Summary</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <SummaryItem emoji="📄" title="Ingest" desc="Load documents + extract text + add metadata" />
          <SummaryItem emoji="✂️" title="Chunk" desc="Split into ~400 tokens with 50 overlap" />
          <SummaryItem emoji="🧬" title="Embed" desc="Convert chunks to vectors (same model for index & query)" />
          <SummaryItem emoji="🗄️" title="Store" desc="Index in vector DB (pgvector, FAISS, Pinecone)" />
          <SummaryItem emoji="🔍" title="Search" desc="Hybrid search: vector cosine + BM25 keyword" />
          <SummaryItem emoji="🏆" title="Rerank" desc="Cross-encoder re-scores top-20 → top-5" />
          <SummaryItem emoji="📝" title="Prompt" desc="Inject chunks + cite instruction into LLM prompt" />
          <SummaryItem emoji="🤖" title="Generate" desc="LLM answers from context only (temperature=0)" />
          <SummaryItem emoji="📊" title="Evaluate" desc="RAGAS: faithfulness, relevancy, precision, recall" />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
      <span className="mt-0.5 text-lg">{emoji}</span>
      <div>
        <span className="text-xs font-semibold text-[var(--text)]">{title}</span>
        <p className="mt-0.5 text-[0.7rem] leading-relaxed text-[var(--text-3)]">{desc}</p>
      </div>
    </div>
  );
}
