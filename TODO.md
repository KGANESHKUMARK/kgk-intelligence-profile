# Future Features — TODO

> **Workflow:** All future feature work happens on a `feature/*` branch, reviewed, then merged to `main`.
> **Current constraint:** The site is a static SPA on Vercel (no backend, no database, no auth).
> Features marked **[needs backend]** require infrastructure changes before implementation.

---

## 0. Sell the Build Template — Dedicated Section [needs 3rd-party checkout] — **TOP PRIORITY**

**Goal:** Let visitors buy `BUILD_PROMPT_TEMPLATE.md` (and optionally the full source repo)
as a digital product, right from a dedicated section on the main page, and receive it
automatically after payment — no manual fulfilment.

**Decisions already made (2026-08-23):**
- Payment method: **card only** (no PayNow) — simplest path, works globally
- Placement: a **dedicated section** on the main page (not a discreet footer link)

**Reality check on payment:**
- Personal PayNow QR (bank app "Receive" QR) has **no verification API** — a static site
  can never know a payment happened through it. Automatic unlock requires a real payment
  gateway sitting between buyer and bank.
- Chosen approach: **Gumroad or Lemon Squeezy** (Payhip is a third option). All three:
  - Host the digital file (the template `.md`, optionally a zipped repo export)
  - Generate a hosted checkout page (card payments, Apple Pay, Google Pay)
  - Deliver the file automatically via download link + email receipt the instant payment
    clears — zero backend code, zero webhook to maintain ourselves
  - Give you a simple "Buy" URL or embeddable button to drop into the new section

**Implementation sketch:**
1. Package the product: `BUILD_PROMPT_TEMPLATE.md` alone (cheap tier) and/or a zipped
   export of the full repo minus personal data (premium tier) — decide pricing/tiers
2. Create the product listing on Gumroad or Lemon Squeezy, upload the file(s), set price
3. New component: `src/components/product/TemplateOffer.tsx` — a dedicated section
   (next logical index after Contact, or its own anchor) with:
   - What the template is / who it's for (developers wanting a similar interactive resume)
   - What's included (data-driven architecture, design system, all interactive features)
   - Price + a prominent "Buy Now" button linking to the Gumroad/Lemon Squeezy checkout
     URL (`target="_blank"`)
   - Optional: a short feature list reusing content from `BUILD_PROMPT_TEMPLATE.md` §3-4
4. Add the new section id to `src/data/navigation.ts` so it appears in the navbar/command
   palette like every other section
5. No serverless function, no webhook, no database — the checkout provider owns all of
   that. This keeps the portfolio itself still a pure static site; only an outbound link
   changes.

**Open questions before building (ask the user):**
- Price point(s) — single price, or a tiered "template only" vs "template + full source"?
- Exact product name/positioning (e.g. "Engineering Intelligence Profile — Build Template")
- Gumroad vs Lemon Squeezy vs Payhip — any existing account preference?
- Should the full source repo (with placeholders, minus personal data) be a real
  deliverable, or is the markdown prompt alone the product for now?

**Status:** Not started. Build on `feature/template-offer` branch per the workflow in
§5 below.

---

## 1. Viewer Analytics Dashboard [needs backend]

**Goal:** Know who viewed the profile, from where, and which sections/skills they spent time on.

**What it gives you:**
- Total views, unique visitors, geographic distribution
- Which sections get the most attention (skills, projects, AI, etc.)
- Whether a viewer is from a recruiter IP range (corporate vs residential)
- Time-on-page and scroll depth

**Reality check:**
- A pure static site cannot collect analytics on its own — there's no server to log requests
- **Option A (easiest, free):** Vercel Analytics or Plausible Analytics — drop a script tag, get a dashboard. No code changes beyond a snippet. Tells you views, location, devices, top pages. Cannot tell you which *section* someone looked at.
- **Option B (medium effort, free):** Google Analytics 4 — same script-tag approach, more detail, but heavier and Google-owned
- **Option C (custom dashboard, needs backend):** A lightweight API (Vercel Edge Function + KV store or Supabase) that receives beacon events from the SPA. The SPA sends events like `section_viewed:skills`, `skill_clicked:rust`, `project_opened:gom`. You get a custom dashboard. This is the only way to know *which skills they looked at*.

**Recommendation:** Start with Vercel Analytics (free, built-in, zero code). Add custom event tracking later if you need section-level insight.

---

## 2. JD Upload + AI Match Analysis [needs backend + AI API]

**Goal:** An HR person or interviewer pastes/uploads a job description. The site analyses it against your profile and says:
- "Strong match on Java, Spring Boot, Kafka, banking domain"
- "Gap: expects Go experience — not in your stack"
- "Stretch: mentions team leadership at scale — you have 16-engineer team history"

**What it gives you:**
- A recruiter lands on your page, pastes their JD, and immediately sees how you fit — without you being in the room
- Turns your portfolio from passive (read about me) to interactive (am I a match?)

**Reality check:**
- Requires an LLM API call (OpenAI, Anthropic, or a Vercel AI SDK endpoint) — this is a paid API
- Needs a serverless function (Vercel Edge Function) to keep the API key secret
- The LLM needs your full profile data as context — we already have it structured in `src/data/`
- Cost is negligible per request (~$0.01 per JD analysis on Claude/GPT-4)
- This is the single most differentiated feature you could add

**Implementation sketch:**
- `POST /api/match` Vercel serverless function
- Takes JD text, loads your profile from the same data files, sends both to an LLM with a structured prompt
- Returns: matched skills, gaps, stretch areas, suggested talking points
- Frontend: a modal or section "Paste a job description — see how I match"

---

## 3. LinkedIn Recommendations in the Portal

**Goal:** Display the recommendation quotes people wrote on your LinkedIn profile.

**What it gives you:**
- Social proof without the visitor needing to leave your site
- Third-party validation from managers and colleagues

**Reality check:**
- LinkedIn's API requires OAuth authentication and an app review process — not practical for a personal site
- **Simplest approach:** Manually copy the recommendation text from your LinkedIn profile into a data file (`src/data/recommendations.ts`), with the person's name, title, company, and the quote
- Render them as a carousel or grid of testimonial cards
- This is low-effort, high-value — do this one first

**Implementation sketch:**
- `src/data/recommendations.ts` — `{ name, title, company, relationship, quote, date }[]`
- A `Recommendations.tsx` component — testimonial cards with the person's initials avatar
- No backend needed, no API, just structured data

---

## 4. Personal JD Library + Skill Gap Tracker [needs backend]

**Goal:** You upload JDs you're interested in. The system tracks:
- What skills each JD asks for
- Which ones you already have
- Which ones you need to learn
- A learning roadmap over time

**What it gives you:**
- A private tool for your own career planning
- Pattern recognition across multiple JDs ("every senior AI role asks for Kubernetes — I have that")
- A study tracker for gaps

**Reality check:**
- This is a personal productivity tool, not a public-facing feature
- Needs persistence (database or local storage) and ideally auth so only you see it
- Could be a separate private app rather than part of the public portfolio
- Could be done with localStorage only (no backend) but you'd lose data across devices

**Recommendation:** Build this as a separate private tool, not on the public portfolio. Keep the public site focused on presenting you, not on your internal planning.

---

## 5. Feature Branch Workflow

**Going forward:**
```bash
# Create a feature branch
git checkout -b feature/recommendations

# Work, commit, push the branch
git push -u origin feature/recommendations

# Review on GitHub (Pull Request)
# Merge to main after review
git checkout main
git merge feature/recommendations
git push
```

Vercel deploys preview URLs for every branch automatically — you can test features before merging.

---

---

## 6. Hugging Face Chat — Profile-Aware AI Assistant [free, no backend required]

**Goal:** Embed a chat widget powered by a free Hugging Face Inference API model that answers questions *only* from Ganesh's resume data and skills — visitors ask "What projects did you work on at Julius Baer?" or "Do you know Kafka?" and get accurate, grounded answers.

**Why Hugging Face (free tier):**
- Hugging Face Inference API has a free tier (rate-limited but zero cost) — no OpenAI or Anthropic billing needed.
- Models like `mistralai/Mistral-7B-Instruct-v0.3`, `HuggingFaceH4/zephyr-7b-beta`, or `google/flan-t5-large` are available on the free tier.
- The free tier is sufficient for a personal portfolio: low concurrent visitors, no SLA needed.

**Architecture (static site friendly — no custom backend needed):**
- The profile data (`src/data/profile.ts`, `skills.ts`, `experience.ts`, `projects.ts`, `certifications.ts`) is serialised into a compact "profile context" string at build time or in the component.
- Each user message is sent to the Hugging Face Inference API directly from the browser, with the profile context prepended as a system/instruction prompt — grounding the model to answer only from that data.
- The HF API key is a public read-only Inference API token (safe to expose in a static site; it has no write permissions and rate-limits per IP anyway). Alternatively, wrap in a Vercel Edge Function to keep it server-side.
- A guardrail prompt instructs the model: "Answer only from the provided profile. If the question is unrelated, reply: 'I can only answer questions about Ganesh's background.'"

**Implementation sketch:**
1. New component: `src/components/chat/ProfileChat.tsx` — a floating chat bubble (bottom-right) that expands to a chat panel.
2. `src/lib/profileContext.ts` — builds the grounded context string from the existing data files (name, summary, skills, experience, projects, certs) — no duplication of resume text.
3. `src/lib/hfChat.ts` — thin wrapper around `fetch('https://api-inference.huggingface.co/models/<model>', ...)` with the context injected.
4. Add the chat bubble to `src/App.tsx` (always visible, like the command palette trigger).
5. Add section to `src/data/navigation.ts` if a standalone page is preferred over a floating widget.

**Recommended free models to evaluate (in order of preference):**
- `mistralai/Mistral-7B-Instruct-v0.3` — best instruction following, good at staying grounded.
- `HuggingFaceH4/zephyr-7b-beta` — fine-tuned for helpfulness, free tier available.
- `google/flan-t5-large` — smaller, faster, good for factual Q&A, less conversational.

**Open questions before building:**
- Floating widget or dedicated `/chat` page (or both)?
- Should the model also answer Learning Hub questions (Java/Kafka topics), or strictly resume/skills only?
- Should the HF token be in a Vercel environment variable (server-side Edge Function) or exposed as a read-only public token in the client?

**Status:** Not started. Build on `feature/hf-chat` branch.

---

## Priority Order

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **1** | **Sell the build template — dedicated section** | **Low-Medium** | **High — direct monetization, decided by user 2026-08-23** |
| 2 | LinkedIn recommendations | Low | High — social proof, no infra needed |
| 3 | Vercel Analytics | Trivial | Medium — basic view counts for free |
| 4 | **HuggingFace profile-aware chat** | **Low-Medium** | **Very high — most differentiating visitor experience, free** |
| 5 | JD upload + AI match | Medium | Very high — most differentiated recruiter feature |
| 6 | Custom section-level analytics | High | Medium — only if you need recruiter detail |
| 7 | Personal JD library | High | Low — better as a separate private app |
