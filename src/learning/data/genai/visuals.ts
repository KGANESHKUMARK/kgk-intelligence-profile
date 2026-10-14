import type { LearningVisual } from '../../types';

export const genaiVisuals: LearningVisual[] = [
  {
    id: 'genai-rag-pipeline',
    topicId: 'rag-fundamentals',
    type: 'flow',
    title: 'RAG Pipeline — Index & Query Flow',
    description: 'End-to-end flow for a Retrieval-Augmented Generation system from document ingestion to grounded response.',
    memoryTip: 'Index time: chunk → embed → store. Query time: embed → hybrid search → rerank → stuff → LLM → validate + cite.',
    nodes: [
      { id: 'ingest', label: 'Ingest documents', caption: 'PDF, HTML, DB records — extract clean text' },
      { id: 'chunk', label: 'Chunk (400 tok / 50 overlap)', caption: 'RecursiveCharacterTextSplitter + section metadata', topicId: 'rag-fundamentals' },
      { id: 'embed', label: 'Embed with same model', caption: 'text-embedding-3-small / bge-m3' },
      { id: 'store', label: 'Vector store', caption: 'pgvector / FAISS / Pinecone' },
      { id: 'query', label: 'User query + embed', caption: 'Same model — guardrail: strip PII, detect injection' },
      { id: 'hybrid', label: 'Hybrid search (dense + BM25)', caption: 'Top-20 candidates via RRF fusion + metadata filter' },
      { id: 'rerank', label: 'Rerank (cross-encoder)', caption: 'bge-reranker → keep top-5', topicId: 'rag-fundamentals' },
      { id: 'prompt', label: 'Build prompt', caption: 'System + top-5 chunks (most relevant last) + question' },
      { id: 'llm', label: 'LLM (temp=0)', caption: '"Answer ONLY from context. Cite source/page."', topicId: 'llm-architecture' },
      { id: 'validate', label: 'Faithfulness check', caption: 'RAGAS/NLI — regenerate if < 0.7', topicId: 'llmops-evals' },
    ],
    edges: [
      { from: 'ingest', to: 'chunk' }, { from: 'chunk', to: 'embed' }, { from: 'embed', to: 'store' },
      { from: 'query', to: 'hybrid' }, { from: 'hybrid', to: 'rerank' }, { from: 'rerank', to: 'prompt' },
      { from: 'prompt', to: 'llm' }, { from: 'llm', to: 'validate' },
    ],
  },
  {
    id: 'genai-llm-token-flow',
    topicId: 'llm-architecture',
    type: 'flow',
    title: 'LLM Inference — Token Generation Loop',
    description: 'How an LLM generates a response token by token.',
    memoryTip: 'Prefill (prompt processing) is fast and parallel. Decode (token generation) is sequential and memory-bandwidth bound.',
    nodes: [
      { id: 'tok', label: 'Tokenisation', caption: 'BPE subword units ~4 chars/token' },
      { id: 'emb', label: 'Embedding lookup', caption: 'Token id → dense vector (dim ~4096)' },
      { id: 'attn', label: 'Transformer layers (prefill)', caption: 'Multi-head attention + FFN — all prompt tokens in parallel' },
      { id: 'logit', label: 'Logit projection', caption: 'Hidden state → vocab-size logits (50k–128k)' },
      { id: 'sample', label: 'Temperature + Top-p sampling', caption: 'Softmax → probability distribution → next token' },
      { id: 'decode', label: 'Decode loop (autoregressive)', caption: 'Append token, repeat until EOS — sequential, bandwidth-bound' },
    ],
    edges: [
      { from: 'tok', to: 'emb' }, { from: 'emb', to: 'attn' }, { from: 'attn', to: 'logit' },
      { from: 'logit', to: 'sample' }, { from: 'sample', to: 'decode' }, { from: 'decode', to: 'logit', label: 'next token' },
    ],
  },
  {
    id: 'genai-guardrails-layers',
    topicId: 'llm-guardrails',
    type: 'comparison',
    title: 'LLM Guardrails — Defence Layers',
    description: 'A layered defence around an LLM application.',
    memoryTip: 'Input guardrails are cheap and fast. Output guardrails are slower but catch what the model sneaks through.',
    columns: [
      {
        label: 'Input Guardrails',
        nodes: [
          { id: 'i1', label: 'Keyword / regex rules', caption: 'Fast (<5ms) — injection phrases, PII patterns' },
          { id: 'i2', label: 'Topic / intent classifier', caption: 'ML model — off-topic query detection (20–50ms)' },
          { id: 'i3', label: 'Content moderation', caption: 'OpenAI Moderation API / Llama Guard' },
          { id: 'i4', label: 'System prompt + delimiters', caption: '<user_query>{input}</user_query> limits scope' },
        ],
      },
      {
        label: 'Output Guardrails',
        nodes: [
          { id: 'o1', label: 'Structured output / JSON mode', caption: 'Schema-enforced; parse + retry on failure' },
          { id: 'o2', label: 'Faithfulness check', caption: 'NLI / LLM-as-judge — regenerate if < 0.7', topicId: 'llmops-evals' },
          { id: 'o3', label: 'PII scrubber', caption: 'Regex + NER scan before returning to user' },
          { id: 'o4', label: 'Policy compliance check', caption: 'No regulated advice, no competitor mentions' },
          { id: 'o5', label: 'Audit trail', caption: 'Log every request/response async — compliance' },
        ],
      },
    ],
  },
  {
    id: 'genai-prompting-techniques',
    topicId: 'prompt-engineering',
    type: 'comparison',
    title: 'Prompting Techniques — Selection Guide',
    description: 'When to use each prompting technique based on task complexity.',
    memoryTip: 'Zero-shot → few-shot → CoT → self-consistency → ReAct (agents). Always use structured output for programmatic use.',
    columns: [
      {
        label: 'By task type',
        nodes: [
          { id: 'zs', label: 'Zero-shot', caption: 'Simple / well-known task. Fast. Sensitive to phrasing.' },
          { id: 'fs', label: 'Few-shot (3–5 examples)', caption: 'Custom format, domain-specific extraction, classification.' },
          { id: 'cot', label: 'Chain-of-Thought', caption: '"Think step by step" — arithmetic, logic, multi-step reasoning.' },
          { id: 'sc', label: 'Self-consistency', caption: 'Sample 5–10 CoT; majority vote. More accurate, 5–10× cost.' },
          { id: 'react', label: 'ReAct (Agents)', caption: 'Thought → Action → Observation loop with tools.', topicId: 'llm-agents' },
        ],
      },
      {
        label: 'Always apply',
        nodes: [
          { id: 'so', label: 'Structured output', caption: 'JSON mode / function calling for programmatic parsing.' },
          { id: 'sp', label: 'Strong system prompt', caption: 'Role + constraints + output format + "say I don\'t know".' },
          { id: 'eval', label: 'Eval before shipping', caption: 'Run golden set — measure accuracy before and after change.', topicId: 'llmops-evals' },
        ],
      },
    ],
  },
];
