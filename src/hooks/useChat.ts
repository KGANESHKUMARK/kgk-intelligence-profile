/**
 * useChat — conversation state management for the profile chat widget.
 *
 * Features:
 *  - Messages persisted to localStorage (survives refresh).
 *  - Streaming: assistant message updates token-by-token as the model responds.
 *  - Abort: cancel an in-flight request when the user sends a new message or closes.
 *  - Error recovery: errors are shown as system messages, conversation continues.
 *  - Clear: reset the conversation.
 *  - Cooldown: 3-second client-side delay between messages to avoid rate limits.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, type ChatError, type ChatMessage } from '../lib/hfChat';

const STORAGE_KEY = 'eip-chat-messages';
const COOLDOWN_MS = 5000; // client-side rate limit guard (Groq free tier: 30 req/min)

type UIMessage = ChatMessage & { id: string; timestamp: number };

function loadMessages(): UIMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: UIMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Private browsing — fail silently.
  }
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

export interface UseChatReturn {
  messages: UIMessage[];
  isStreaming: boolean;
  error: ChatError | null;
  /** Seconds remaining on the cooldown timer, or 0 if ready. */
  cooldown: number;
  sendMessage: (text: string) => void;
  abort: () => void;
  clear: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<UIMessage[]>(loadMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const lastSentRef = useRef(0);

  // Persist messages to localStorage on every change.
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Abort any in-flight request on unmount.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  // Cooldown countdown timer.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
    setCooldown(0);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return;

      // Client-side cooldown to avoid hitting the 30 req/min rate limit.
      const elapsed = Date.now() - lastSentRef.current;
      if (elapsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        setCooldown(remaining);
        return;
      }

      // Abort any previous request.
      controllerRef.current?.abort();
      setError(null);
      lastSentRef.current = Date.now();

      const userMsg: UIMessage = {
        id: nextId(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };

      // Create a placeholder assistant message for streaming.
      const assistantId = nextId();
      const assistantMsg: UIMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      // Build the history to send (includes the new user message).
      const history: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text.trim() },
      ];

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      controllerRef.current = streamChat(history, {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          );
        },
        onDone: (fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullText } : m,
            ),
          );
          setIsStreaming(false);
          controllerRef.current = null;
        },
        onError: (err) => {
          if (err.type === 'aborted') {
            // Remove the empty assistant placeholder if nothing was streamed.
            setMessages((prev) =>
              prev.filter((m) => !(m.id === assistantId && m.content === '')),
            );
          } else {
            setError(err);
            // Replace the empty assistant placeholder with an error note.
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: `⚠️ ${err.message}` }
                  : m,
              ),
            );
          }
          setIsStreaming(false);
          controllerRef.current = null;
        },
      });
    },
    [isStreaming, messages],
  );

  return { messages, isStreaming, error, cooldown, sendMessage, abort, clear };
}
