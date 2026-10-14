/**
 * AI CHAT CLIENT — multi-provider with automatic failover
 *
 * Browser-compatible providers (CORS-enabled), tried in priority order:
 *   1. Groq primary model   (VITE_GROQ_TOKEN)  — llama-3.1-8b-instant by default
 *   2. Groq fallback model  (VITE_GROQ_TOKEN)  — gemma2-9b-it (separate rate-limit bucket)
 *   3. HF Free Inference    (VITE_HF_TOKEN)    — api-inference.huggingface.co (NO credits needed)
 *
 * Why multiple Groq entries?
 *   Groq rate limits are per-model — using a second model gives a second independent
 *   quota bucket, so a 429 on model A automatically retries on model B.
 *
 * Why HF Inference API (not HF Router)?
 *   router.huggingface.co requires paid HF PRO credits.
 *   api-inference.huggingface.co/models/{model}/v1/chat/completions is FREE for
 *   public models that support the Text Generation Inference (TGI) format.
 *
 * Server-only providers (NOT CORS-enabled — need a Vercel Edge Function):
 *   - NVIDIA NIM  (VITE_NVIDIA_TOKEN)  — works server-side only, blocked by browser CORS
 *
 * Env vars (Vite):
 *   VITE_GROQ_TOKEN    — Groq API key (console.groq.com) — CORS ✅
 *   VITE_GROQ_MODEL    — optional primary Groq model override (default: llama-3.1-8b-instant)
 *   VITE_HF_TOKEN      — HF token (huggingface.co/settings/tokens) — CORS ✅
 *   VITE_HF_MODEL      — optional HF model override (default: Qwen/Qwen2.5-7B-Instruct)
 *   VITE_NVIDIA_TOKEN  — NVIDIA NIM key (build.nvidia.com) — server-only, CORS ❌
 *   VITE_NVIDIA_MODEL  — optional NVIDIA model override
 */

import { getProfileContext, SYSTEM_PROMPT } from './profileContext';

// ── Token + model config ─────────────────────────────────────────────────────

const GROQ_TOKEN = (import.meta.env.VITE_GROQ_TOKEN as string | undefined)?.trim();
// qwen/qwen3.8-27b — the model confirmed working on this Groq account.
// Rate-limit mitigation: context is now ~900 tokens (was ~2600), so 4-6 questions/min is typical.
const GROQ_MODEL =
  (import.meta.env.VITE_GROQ_MODEL as string | undefined)?.trim() ?? 'qwen/qwen3.8-27b';

// NVIDIA NIM: VITE_NVIDIA_TOKEN + VITE_NVIDIA_MODEL are NOT loaded in the browser.
// NVIDIA's API doesn't support CORS, so browser fetch is blocked. These env vars
// are intended for a future Vercel Edge Function (server-side, no CORS restriction).
// When that's built, read import.meta.env.VITE_NVIDIA_TOKEN there.

const HF_TOKEN = (import.meta.env.VITE_HF_TOKEN as string | undefined)?.trim();
// HF Router — CORS-compatible, OpenAI-compatible. Requires HF PRO credits (free monthly allowance
// resets each month). Used only as a fallback when Groq exhausts all retries.
const HF_MODEL =
  (import.meta.env.VITE_HF_MODEL as string | undefined)?.trim() ?? 'Qwen/Qwen3.8-27B';

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
  // ── Groq (primary) ───────────────────────────────────────────────────────
  // Context is now ~900 tokens (was 2600+), so the token/min limit goes ~3× further.
  {
    name: 'groq',
    label: 'Groq · Qwen 3',
    token: GROQ_TOKEN,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: GROQ_MODEL,
  },
  // ── HuggingFace Router (fallback) ────────────────────────────────────────
  // CORS-compatible, OpenAI-compatible. Needs HF PRO credits (free monthly allowance).
  // NVIDIA NIM is NOT included — blocked by browser CORS; needs a Vercel Edge Function.
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

const MAX_HISTORY = 6;   // 10 → 6: saves ~1000 tokens/request from accumulated conversation
const MAX_TOKENS = 256;  // 512 → 256: portfolio Q&A never needs longer; saves tokens/min quota
const TEMPERATURE = 0.65;
/** Per-provider attempt timeout — guards against a hung connection leaving the UI stuck forever. */
const RESPONSE_TIMEOUT_MS = 20000;
/** On a 429 rate-limit, wait this long then retry the SAME provider before falling to the next. */
const RATE_LIMIT_RETRY_DELAY_MS = 6000;

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
  | { type: 'timeout'; message: string }
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
  // getProfileContext() is memoised — computed once per page load, never rebuilt per-request.
  return [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n${getProfileContext()}` },
    ...history.slice(-MAX_HISTORY),
  ];
}

// ── SSE parser (shared) ──────────────────────────────────────────────────────

async function parseSSEStream(
  response: Response,
  attemptController: AbortController,
  callbacks: ChatStreamCallbacks,
): Promise<ProviderResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    return { status: 'fatal', error: { type: 'unknown', message: 'No response stream.' } };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      if (attemptController.signal.aborted) {
        reader.cancel().catch(() => {});
        return { status: 'aborted' };
      }

      const { done, value } = await reader.read();
      if (done) break;

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
  } catch {
    // reader.read() rejects when the attempt is aborted mid-stream (user
    // cancelled, or our own timeout below fired) — never let that become
    // an unhandled rejection that leaves the UI stuck mid-response.
    return { status: 'aborted' };
  }

  callbacks.onDone(fullText.trim());
  return { status: 'success' };
}

// ── Single provider attempt ──────────────────────────────────────────────────

/** Wait ms then resolve — respects the shared abort signal (resolves early on abort). */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });
}

async function tryProvider(
  provider: ProviderConfig,
  history: ChatMessage[],
  controller: AbortController,
  callbacks: ChatStreamCallbacks,
  /** How many times this provider has already been retried (rate-limit backoff). */
  retryCount = 0,
): Promise<ProviderResult> {
  // A per-attempt controller lets us time out (or abort) THIS provider's
  // request without aborting the shared, user-facing controller — which
  // would otherwise block failover to the next provider. User aborts on
  // the shared controller are forwarded down to this one.
  const attemptController = new AbortController();
  const forwardAbort = () => attemptController.abort();
  controller.signal.addEventListener('abort', forwardAbort);

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    attemptController.abort();
  }, RESPONSE_TIMEOUT_MS);

  const cleanup = () => {
    clearTimeout(timeoutId);
    controller.signal.removeEventListener('abort', forwardAbort);
  };

  let response: Response;
  try {
    response = await fetch(provider.url, {
      method: 'POST',
      signal: attemptController.signal,
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
    cleanup();
    if (timedOut) {
      return { status: 'retryable', error: { type: 'timeout', message: `${provider.label} took too long to respond.` } };
    }
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
    cleanup();
    return {
      status: 'retryable',
      error: { type: 'unknown', message: `${provider.label} auth failed.` },
    };
  }
  if (response.status === 429) {
    cleanup();
    // On first rate-limit hit: wait 6 s then retry the same provider.
    // This transparently handles transient token/min quota resets without switching providers.
    if (retryCount === 0 && !controller.signal.aborted) {
      await delay(RATE_LIMIT_RETRY_DELAY_MS, controller.signal);
      if (controller.signal.aborted) return { status: 'aborted' };
      return tryProvider(provider, history, controller, callbacks, 1);
    }
    // Second 429 in a row — give up on this provider, try the next.
    return {
      status: 'retryable',
      error: { type: 'rate_limit', message: `${provider.label} rate limit reached.` },
    };
  }
  if (response.status === 503) {
    // Overloaded/cold start → retryable.
    cleanup();
    return {
      status: 'retryable',
      error: { type: 'cold_start', message: `${provider.label} is overloaded.` },
    };
  }
  if (response.status === 402) {
    // Credits depleted → retryable (try next provider with different billing).
    cleanup();
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
    cleanup();
    return {
      status: 'retryable',
      error: { type: 'unknown', message: `${provider.label} error (HTTP ${response.status})${detail ? ` — ${detail}` : ''}.` },
    };
  }

  // ── Success → parse the stream ────────────────────────────────────────
  const result = await parseSSEStream(response, attemptController, callbacks);
  cleanup();

  // Our own timeout firing looks identical to an abort from inside the
  // stream parser — reclassify it as a retryable timeout instead of a
  // (silent) user cancellation so the next provider gets a chance and,
  // if none succeed, the user sees a real "took too long" message.
  if (result.status === 'aborted' && timedOut) {
    return { status: 'retryable', error: { type: 'timeout', message: `${provider.label} took too long to respond.` } };
  }
  return result;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Stream a chat completion with automatic failover.
 *
 * Tries providers in priority order:
 *   Groq (llama-3.1-8b-instant) → Groq (gemma2-9b-it) → HF Free Inference API
 *
 * If a provider returns 429 (rate limit), 503 (overloaded), 402 (credits depleted),
 * or a network error, the request is automatically retried on the next available provider.
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

    try {
      for (const provider of availableProviders) {
        if (controller.signal.aborted) {
          callbacks.onError({ type: 'aborted' });
          return;
        }

        const result = await tryProvider(provider, history, controller, callbacks);

        if (result.status === 'success') return; // onDone already called inside parseSSEStream.

        if (result.status === 'aborted') {
          callbacks.onError({ type: 'aborted' });
          return;
        }

        // Retryable error — save it and try the next provider.
        lastError = result.error;
      }

      // All providers exhausted — report a friendly message.
      // Rate-limit errors are especially common on free-tier accounts; add guidance.
      const friendlyError: ChatError =
        lastError.type === 'rate_limit'
          ? { type: 'rate_limit', message: 'All AI providers are rate-limited right now. Please wait a few seconds and try again.' }
          : lastError.type === 'timeout'
            ? { type: 'timeout', message: 'The AI took too long to respond. Please try again.' }
            : lastError;
      callbacks.onError(friendlyError);
    } catch (err) {
      // Defensive: no matter what throws above, the UI must never be left
      // waiting forever with isStreaming stuck true.
      if (controller.signal.aborted) {
        callbacks.onError({ type: 'aborted' });
      } else {
        callbacks.onError({
          type: 'unknown',
          message: err instanceof Error ? err.message : 'Something unexpected went wrong.',
        });
      }
    }
  })();

  return controller;
}
