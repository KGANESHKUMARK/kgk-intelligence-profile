import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, BrainCircuit, RotateCcw, Sparkles, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { isChatEnabled, providerLabel } from '../../lib/hfChat';
import { CHAT_SUGGESTIONS } from '../../lib/profileContext';
import { trackEvent } from '../../lib/analytics';
import { cn } from '../../lib/utils';
import { EASE } from '../../lib/motion';
import { ChatMessageBubble } from './ChatMessage';

/**
 * ProfileChat — floating chat widget powered by Hugging Face Inference API.
 *
 * The trigger pill is deliberately styled to match LearningHubEntry — same
 * rounded-full shape, same border/shadow tokens, same icon+label layout —
 * so both buttons form a clean vertical stack in the bottom-right corner.
 *
 * Stack order (bottom to top):
 *   bottom-4 right-4  — LearningHubEntry "Learning Hub" pill
 *   bottom-20 right-4 — ProfileChat "Ask AI" pill   (this component)
 *
 * Z-index: 60 — above Navbar (50), below CommandPalette (100).
 * no-print: excluded from PDF/print resume output.
 */
export function ProfileChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isStreaming, cooldown, sendMessage, abort, clear } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      abort();
    }
  }, [isOpen, abort]);

  if (!isChatEnabled) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || cooldown > 0) return;
    trackEvent('chat_message_sent', { length: input.length });
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    if (isStreaming || cooldown > 0) return;
    trackEvent('chat_suggestion_clicked', { suggestion });
    sendMessage(suggestion);
  };

  const handleOpen = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) trackEvent('chat_opened', {});
  };

  const handleClear = () => {
    clear();
    trackEvent('chat_cleared', {});
    inputRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── Trigger pill — matches LearningHubEntry style exactly ────── */}
      <motion.div
        className="no-print fixed bottom-20 right-4 z-[60] sm:right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.25, ease: EASE }}
      >
        <AnimatePresence>
          {/* Tooltip — shown when panel is closed */}
          {!isOpen && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0, y: 6 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute right-0 bottom-full mb-2 whitespace-nowrap rounded-lg border border-[var(--line-strong)] bg-[var(--bg-elev)] px-3 py-2 text-[0.75rem] text-[var(--text-2)] shadow-[var(--shadow-lift)]"
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleOpen}
          aria-label={isOpen ? 'Close AI chat' : 'Ask AI about Ganesh'}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="flex items-center gap-2.5 rounded-full border border-[var(--ai-line)] bg-[var(--bg-elev)] py-3 pr-4 pl-3 shadow-[var(--shadow-lift)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ai)]"
        >
          {/* Icon with pulse dot */}
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ai-soft)] text-[var(--ai-text)]">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </motion.span>
              ) : (
                <motion.span
                  key="brain"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <BrainCircuit size={14} strokeWidth={1.75} aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
            {!isOpen && (
              <span
                className="absolute -top-px -right-px h-1.5 w-1.5 rounded-full bg-[var(--ai)] opacity-90"
                aria-hidden="true"
              />
            )}
          </span>

          {/* Label */}
          <span className="text-[0.8125rem] font-medium tracking-tight text-[var(--text)]">
            {isOpen ? 'Close chat' : 'Ask AI'}
          </span>
        </button>
      </motion.div>

      {/* ── Chat panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="no-print fixed bottom-36 right-4 z-[60] flex h-[min(560px,68vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--bg-elev)] shadow-[var(--shadow-lift)] sm:right-6"
            role="dialog"
            aria-modal="true"
            aria-label="AI assistant"
          >
            {/* ── Header ────────────────────────────────────────────── */}
            <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--line)] px-4 py-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]">
                <Sparkles size={14} strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight">Ask about Ganesh</p>
                <p className="text-[0.6875rem] text-[var(--text-3)]">
                  Grounded to profile · Java · Kafka
                </p>
              </div>
              {hasMessages && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-3)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-2)]"
                >
                  <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </header>

            {/* ── Messages ──────────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
              aria-live="polite"
              aria-atomic="false"
            >
              {/* Empty state */}
              {!hasMessages && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--ai-line)] bg-[var(--ai-soft)] text-[var(--ai-text)]">
                    <BrainCircuit size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      Ask me anything about Ganesh
                    </p>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--text-3)]">
                      Experience · skills · projects · Java & Kafka
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-1.5">
                    {CHAT_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSuggestion(s)}
                        className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-left text-[0.75rem] leading-snug text-[var(--text-2)] transition-all hover:border-[var(--ai-line)] hover:bg-[var(--surface-3)] hover:text-[var(--ai-text)]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((m, i) => (
                <ChatMessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  isStreaming={isStreaming && m.role === 'assistant' && i === messages.length - 1}
                />
              ))}
            </div>

            {/* ── Input ─────────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-[var(--line)] bg-[var(--surface-2)] px-3 pt-2.5 pb-2"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-grow: reset height then set to scrollHeight, capped at 96px.
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about experience, skills, Kafka, Java…"
                  rows={1}
                  aria-label="Chat message"
                  disabled={isStreaming}
                  className="max-h-24 min-h-[36px] flex-1 resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-elev)] px-2.5 py-2 text-[0.8125rem] leading-relaxed text-[var(--text)] caret-[var(--ai)] outline-none transition-colors placeholder:text-[var(--text-3)] focus:border-[var(--ai-line)] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming || cooldown > 0}
                  aria-label="Send message"
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all',
                    input.trim() && !isStreaming && cooldown === 0
                      ? 'bg-[var(--ai)] text-[var(--bg)] hover:brightness-110'
                      : 'cursor-not-allowed bg-[var(--surface-3)] text-[var(--text-3)]',
                  )}
                >
                  <ArrowUp size={15} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[0.625rem] text-[var(--text-3)]">
                {cooldown > 0
                  ? `Please wait ${cooldown}s before sending…`
                  : `${providerLabel} · grounded to profile only`}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
