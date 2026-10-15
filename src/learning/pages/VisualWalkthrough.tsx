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

const WALKTHROUGHS: Record<string, { title: string; subtitle: string; sections: { title: string; steps: PipelineStep[] }[] }> = {
  'rag-fundamentals': {
    title: 'RAG Pipeline — Visual Walkthrough',
    subtitle: 'Step-by-step animated guide: from raw documents to grounded AI answers with citations',
    sections: [
      { title: 'Phase 1: Indexing Pipeline (Offline)', steps: ragIndexingSteps },
      { title: 'Phase 2: Query Pipeline (Real-time)', steps: ragQuerySteps },
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
