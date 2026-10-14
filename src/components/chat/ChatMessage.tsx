import { memo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

/**
 * Minimal inline markdown renderer — handles the subset the model commonly
 * emits: **bold**, `code`, bullet lists, and paragraphs.
 * Kept lightweight intentionally (no external dependency).
 */
function renderMarkdown(text: string, isStreaming?: boolean): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let bulletGroup: string[] = [];
  let elementKey = 0;

  const key = () => (elementKey += 1);

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul key={key()} className="mt-1.5 space-y-1 pl-0.5">
        {bulletGroup.map((b, i) => (
          <li key={i} className="flex gap-2 text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
            <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-[var(--ai-text)]" aria-hidden="true" />
            <span>{renderInline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  const lastNonEmpty = [...lines].reverse().find((l) => l.trim() !== '') ?? '';

  for (let idx = 0; idx < lines.length; idx++) {
    const trimmed = lines[idx].trim();
    const isLast = lines.slice(idx + 1).every((l) => l.trim() === '');

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      bulletGroup.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushBullets();
    } else {
      flushBullets();
      const isLastLine = isLast && trimmed === lastNonEmpty.trim();
      elements.push(
        <p key={key()} className="text-[0.8125rem] leading-relaxed text-[var(--text-2)]">
          {renderInline(trimmed)}
          {isStreaming && isLastLine && <StreamCursor />}
        </p>,
      );
    }
  }
  flushBullets();

  // If the message ends with a bullet list, append the cursor after it.
  if (isStreaming && bulletGroup.length > 0) {
    elements.push(<StreamCursor key={key()} standalone />);
  }

  return <div className="space-y-1.5">{elements}</div>;
}

function StreamCursor({ standalone }: { standalone?: boolean }) {
  return (
    <span
      className={cn(
        'inline-block h-[0.9em] w-0.5 animate-pulse rounded-sm bg-[var(--ai-text)] align-middle',
        standalone ? 'ml-1 mt-0.5 block' : 'ml-0.5',
      )}
      aria-hidden="true"
    />
  );
}

/** Inline: **bold**, `code`, plain. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[0.75rem] text-[var(--ai-text)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export const ChatMessageBubble = memo(function ChatMessageBubble({
  role,
  content,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE }}
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <span
        className={cn(
          'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
          isUser
            ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
            : 'border border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]',
        )}
        aria-hidden="true"
      >
        {isUser ? <User size={12} strokeWidth={2} /> : <Sparkles size={12} strokeWidth={2} />}
      </span>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2.5',
          isUser
            ? 'rounded-tr-sm bg-[var(--accent-soft)]'
            : 'rounded-tl-sm border border-[var(--line)] bg-[var(--surface-2)]',
        )}
      >
        {isUser ? (
          <p className="text-[0.8125rem] leading-relaxed text-[var(--text)]">{content}</p>
        ) : content ? (
          renderMarkdown(content, isStreaming)
        ) : isStreaming ? (
          /* Three-dot typing indicator — shown while waiting for first token */
          <span className="flex items-center gap-1 py-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ai-text)] [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ai-text)] [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ai-text)]" />
          </span>
        ) : null}
      </div>
    </motion.div>
  );
});

// ── Follow-up suggestions ────────────────────────────────────────────────────

/** Keywords mapped to follow-up questions — grounded in Ganesh's profile. */
const FOLLOWUP_MAP: { keywords: string[]; questions: string[] }[] = [
  {
    keywords: ['julius baer', 'gom', 'global output', 'event-driven'],
    questions: [
      'How does the Agentic AI assistant triage output failures?',
      'What tech stack powers the GOM platform?',
      'How does Ganesh handle Kafka consumer lag in production?',
    ],
  },
  {
    keywords: ['kafka', 'consumer', 'producer', 'partition', 'offset'],
    questions: [
      'Explain exactly-once semantics in Kafka',
      'How do Kafka consumer groups work?',
      'What is the role of Schema Registry in Kafka?',
    ],
  },
  {
    keywords: ['genai', 'llm', 'langchain', 'bedrock', 'rag', 'agent'],
    questions: [
      'How does Ganesh implement RAG with LangChain?',
      'What AI Guardrails does Ganesh use in production?',
      'How does Amazon Bedrock fit into the AI pipeline?',
    ],
  },
  {
    keywords: ['bny', 'newton', 'portfolio-iq', 'chatbot', 'award', 'hackcelerator'],
    questions: [
      'What did the Portfolio-IQ chatbot do?',
      'What was the BNY Hackcelerator award for?',
      'How was FAISS used in the RAG chatbot?',
    ],
  },
  {
    keywords: ['java', 'spring boot', 'microservice', 'spring'],
    questions: [
      'How does Ganesh design microservices with Spring Boot?',
      'What Java 21 features does Ganesh use in production?',
      'How does Ganesh handle transaction management in Java?',
    ],
  },
  {
    keywords: ['experience', 'year', 'role', 'lead', 'team', 'leadership'],
    questions: [
      'What is Ganesh\'s team leadership experience?',
      'What domains has Ganesh worked in?',
      'What is Ganesh\'s educational background?',
    ],
  },
  {
    keywords: ['skill', 'technology', 'tech stack', 'stack'],
    questions: [
      'What is Ganesh\'s experience with Python and FastAPI?',
      'How does Ganesh use Kubernetes and Terraform?',
      'What monitoring tools does Ganesh use?',
    ],
  },
];

const DEFAULT_FOLLOWUPS = [
  'What is Ganesh\'s role at Bank of Julius Baer?',
  'How does Ganesh use GenAI and LLMs in production?',
  'What did the Portfolio-IQ chatbot do?',
];

/** Generate 3 follow-up questions based on the conversation context. */
function generateFollowUps(messages: { role: string; content: string }[]): string[] {
  // Combine all assistant + user messages for keyword matching.
  const conversationText = messages.map((m) => m.content.toLowerCase()).join(' ');

  // Find the best-matching category by counting keyword hits.
  let bestQuestions = DEFAULT_FOLLOWUPS;
  let bestScore = 0;

  for (const entry of FOLLOWUP_MAP) {
    const score = entry.keywords.filter((k) => conversationText.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestQuestions = entry.questions;
    }
  }

  // Filter out questions that are very similar to what was already asked.
  const askedQuestions = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase());

  const filtered = bestQuestions.filter(
    (q) =>
      !askedQuestions.some(
        (a) =>
          a.includes(q.toLowerCase().slice(0, 20)) ||
          q.toLowerCase().includes(a.slice(0, 20)),
      ),
  );

  // If we filtered too many, fall back to defaults.
  return filtered.length >= 2 ? filtered.slice(0, 3) : bestQuestions.slice(0, 3);
}

interface FollowUpSuggestionsProps {
  messages: { role: string; content: string }[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export const FollowUpSuggestions = memo(function FollowUpSuggestions({
  messages,
  onSelect,
  disabled,
}: FollowUpSuggestionsProps) {
  const followUps = generateFollowUps(messages);
  if (followUps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="ml-8.5 flex flex-wrap gap-1.5"
    >
      {followUps.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          disabled={disabled}
          className={cn(
            'rounded-full border px-2.5 py-1 text-[0.6875rem] leading-snug transition-all',
            disabled
              ? 'cursor-not-allowed border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-3)] opacity-60'
              : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-2)] hover:border-[var(--ai-line)] hover:bg-[var(--surface-3)] hover:text-[var(--ai-text)]',
          )}
        >
          {q}
        </button>
      ))}
    </motion.div>
  );
});
