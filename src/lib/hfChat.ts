/**
 * AI CHAT CLIENT — multi-provider with automatic failover
 *
 * Browser-compatible providers (CORS-enabled):
 *   1. Groq       (VITE_GROQ_TOKEN)    — primary, free, fast, real SSE
 *   2. HF Router  (VITE_HF_TOKEN)      — fallback (needs credits or PRO)
 *
 * Server-only providers (NOT CORS-enabled — need a Vercel Edge Function):
 *   - NVIDIA NIM  (VITE_NVIDIA_TOKEN)  — works server-side only, blocked by browser CORS
 *
 * When the active provider returns 429 (rate limit) or 503 (overloaded),
 * the request is automatically retried on the next available browser provider.
 *
 * Env vars (Vite):
 *   VITE_GROQ_TOKEN    — Groq API key (console.groq.com) — CORS ✅
 *   VITE_GROQ_MODEL    — optional Groq model override
 *   VITE_HF_TOKEN      — HF token (huggingface.co/settings/tokens) — CORS ✅
 *   VITE_HF_MODEL      — optional HF model override
 *   VITE_NVIDIA_TOKEN  — NVIDIA NIM key (build.nvidia.com) — server-only, CORS ❌
 *   VITE_NVIDIA_MODEL  — optional NVIDIA model override
 */

import { buildProfileContext, SYSTEM_PROMPT } from './profileContext';

// ── Token + model config ─────────────────────────────────────────────────────

const GROQ_TOKEN = (import.meta.env.VITE_GROQ_TOKEN as string | undefined)?.trim();
const GROQ_MODEL =
  (import.meta.env.VITE_GROQ_MODEL as string | undefined)?.trim() ?? 'qwen/qwen3.8-27b';

// NVIDIA NIM token + model — loaded for future server-side use (Vercel Edge Function).
// NOT used in the browser: NVIDIA's API doesn't support CORS, so fetch is blocked.
// Kept here so a future Edge Function can read the same env var without code changes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NVIDIA_TOKEN = (import.meta.env.VITE_NVIDIA_TOKEN as string | undefined)?.trim();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NVIDIA_MODEL =
  (import.meta.env.VITE_NVIDIA_MODEL as string | undefined)?.trim() ??
  'nvidia/nemotron-3.5-lightning-30b-a3b';

const HF_TOKEN = (import.meta.env.VITE_HF_TOKEN as string | undefined)?.trim();
const HF_MODEL =
  (import.meta.env.VITE_HF_MODEL as string | undefined)?.trim() ??
  'Qwen/Qwen3.8-27B';

// ── Provider registry ────────────────────────────────────────────────────────

type Provider = 'groq' | 'nvidia' | 'hf';

interface ProviderConfig {
  name: Provider;
  label: string;
  token: string | undefined;
  url: string;
  model: string;
  /** Extra body fields (e.g. chat_template_kwargs for NVIDIA). */
  extraBody?: Record<string, unknown>;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: 'groq',
    label: 'Groq · Qwen 3',
    token: GROQ_TOKEN,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: GROQ_MODEL,
  },
  // NVIDIA NIM is NOT included here — its API doesn't support CORS, so browser
  // fetch is blocked. It can only be used via a server proxy (Vercel Edge Function).
  // The NVIDIA token is still loaded from env for future server-side use.
  {
    name: 'hf',
    label: 'Hugging Face · Qwen 3',
    token: HF_TOKEN,
    url: 'https://router.huggingface.co/v1/chat/completions',
    model: HF_MODEL,
  },
];

// Only providers with tokens configured are available.
const availableProviders = PROVIDERS.filter((p) => p.token);

export const isChatEnabled = availableProviders.length > 0;

/** Label for the currently first-in-line (primary) provider. */
export const providerLabel = availableProviders[0]?.label ?? '';

// ── Shared types ─────────────────────────────────────────────────────────────

const MAX_HISTORY = 10;
const MAX_TOKENS = 512;
const TEMPERATURE = 0.65;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: ChatError) => void;
}

export type ChatError =
  | { type: 'rate_limit'; message: string }
  | { type: 'cold_start'; message: string }
  | { type: 'network'; message: string }
  | { type: 'aborted' }
  | { type: 'unknown'; message: string };

/**
 * Result of a single provider attempt.
 * - 'success'    → streaming completed, we're done.
 * - 'retryable'  → rate limit / cold start / network — try next provider.
 * - 'fatal'     → auth error / bad request — don't try next provider.
 * - 'aborted'   → user cancelled.
 */
type ProviderResult =
  | { status: 'success' }
  | { status: 'retryable'; error: ChatError }
  | { status: 'fatal'; error: ChatError }
  | { status: 'aborted' };

// ── Context builder ──────────────────────────────────────────────────────────

function buildMessages(history: ChatMessage[]): { role: string; content: string }[] {
  return [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${buildProfileContext()}` },
    ...history.slice(-MAX_HISTORY),
  ];
}

// ── SSE parser (shared) ──────────────────────────────────────────────────────

async function parseSSEStream(
  response: Response,
  controller: AbortController,
  callbacks: ChatStreamCallbacks,
): Promise<ProviderResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    return { status: 'fatal', error: { type: 'unknown', message: 'No response stream.' } };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (controller.signal.aborted) {
      reader.cancel();
      return { status: 'aborted' };
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        if (raw === '[DONE]') continue;
        try {
          const json = JSON.parse(raw);
          const token: string = json?.choices?.[0]?.delta?.content ?? '';
          if (token) {
            fullText += token;
            callbacks.onToken(token);
          }
        } catch { /* partial chunk */ }
      }
    }
  }

  callbacks.onDone(fullText.trim());
  return { status: 'success' };
}

// ── Single provider attempt ──────────────────────────────────────────────────

async function tryProvider(
  provider: ProviderConfig,
  history: ChatMessage[],
  controller: AbortController,
  callbacks: ChatStreamCallbacks,
): Promise<ProviderResult> {
  let response: Response;
  try {
    response = await fetch(provider.url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.token}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: buildMessages(history),
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        stream: true,
        ...provider.extraBody,
      }),
    });
  } catch {
    if (controller.signal.aborted) return { status: 'aborted' };
    // Network error is retryable — try next provider.
    return {
      status: 'retryable',
      error: { type: 'network', message: `Could not reach ${provider.label}.` },
    };
  }

  // ── HTTP status → result classification ────────────────────────────────
  if (response.status === 401 || response.status === 403) {
    // Auth error is fatal for this provider, but we can try others.
    return {
      status: 'retryable',
      error: { type: 'unknown', message: `${provider.label} auth failed.` },
    };
  }
  if (response.status === 429) {
    // Rate limit → retryable (try next provider).
    return {
      status: 'retryable',
      error: { type: 'rate_limit', message: `${provider.label} rate limit reached.` },
    };
  }
  if (response.status === 503) {
    // Overloaded/cold start → retryable.
    return {
      status: 'retryable',
      error: { type: 'cold_start', message: `${provider.label} is overloaded.` },
    };
  }
  if (response.status === 402) {
    // Credits depleted → retryable (try next provider with different billing).
    return {
      status: 'retryable',
      error: { type: 'unknown', message: `${provider.label} credits depleted.` },
    };
  }
  if (response.status >= 400) {
    // Other client errors (bad model, etc.) → fatal for this provider.
    let detail = '';
    try {
      const body = await response.json();
      detail = body?.error?.message ?? body?.error ?? '';
    } catch { /* ignore */ }
    return {
      status: 'retryable',
      error: { type: 'unknown', message: `${provider.label} error (HTTP ${response.status})${detail ? ` — ${detail}` : ''}.` },
    };
  }

  // ── Success → parse the stream ────────────────────────────────────────
  return parseSSEStream(response, controller, callbacks);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Stream a chat completion with automatic failover.
 *
 * Tries providers in priority order (Groq → NVIDIA → HF).
 * If a provider returns 429 (rate limit), 503 (overloaded), or a network
 * error, the request is automatically retried on the next available provider.
 * The user sees a seamless response from whichever provider succeeds.
 *
 * Returns an AbortController so the caller can cancel at any time.
 */
export function streamChat(
  history: ChatMessage[],
  callbacks: ChatStreamCallbacks,
): AbortController {
  const controller = new AbortController();

  (async () => {
    let lastError: ChatError = { type: 'unknown', message: 'No AI provider configured.' };

    for (const provider of availableProviders) {
      if (controller.signal.aborted) {
        callbacks.onError({ type: 'aborted' });
        return;
      }

      const result = await tryProvider(provider, history, controller, callbacks);

      if (result.status === 'success' || result.status === 'aborted') {
        return; // Done — onDone or onError already called inside parseSSEStream.
      }

      // Retryable error — save it and try the next provider.
      lastError = result.error;
    }

    // All providers failed — report the last error to the user.
    callbacks.onError(lastError);
  })();

  return controller;
}
