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
