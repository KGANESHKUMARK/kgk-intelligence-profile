import type { LearningTopic } from '../../../types';

export const reactArchitectureTopics: LearningTopic[] = [
  {
    id: 'react-error-boundaries',
    technology: 'react',
    title: 'Error Boundaries & Error Strategy',
    category: 'Architecture',
    slug: 'react-error-boundaries',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Error boundaries catch render-time and lifecycle errors in their subtree and show a fallback — one broken widget must not blank the whole banking dashboard.',
    mentalModel:
      'Error boundaries are circuit breakers: the portfolio chart can fail while accounts, payments and the header keep working. They do NOT catch event handlers, async callbacks or server-side errors — those you handle where they happen.',
    memoryTip:
      'Boundary = render/lifecycle errors only. Event handlers and promises need try/catch or query error state. Place boundaries per feature, not just one at the root.',
    keyTerms: ['Error Boundary', 'fallback UI', 'getDerivedStateFromError', 'error state vs exception', 'retry', 'reset'],
    interviewAnswer:
      'An error boundary is a component that catches errors thrown by its descendants during rendering, in lifecycle methods and in constructors, and renders a fallback instead of letting the tree unmount. Since React has no component-based boundary API for function components, teams use react-error-boundary or a class component wrapping route/section roots. Boundaries do not catch: event handlers (use try/catch there), async code (handle in the promise/query layer), server-side rendering errors, or errors in the boundary itself. The architecture pattern is layered: query libraries normalise API failures into state, boundaries contain unexpected render crashes to the affected panel, and a top-level boundary is the last resort with reporting hooks. In banking terms: a charting library crash should never take down the payment form next to it.',
    practicalExample:
      'NexusBank wraps each dashboard widget in an ErrorBoundary with a panel-scoped fallback ("Portfolio chart failed — others unaffected") and an onReset. API errors never reach the boundary — TanStack Query surfaces them as error state with retry; the boundary is only for the unexpected.',
    commonMistakes: [
      'One boundary around the entire app — one widget bug blanks the whole portal.',
      'Expecting boundaries to catch event-handler or async errors.',
      'Swallowing the error without logging/reporting — silent failures in an audit-heavy domain.',
    ],
    seniorInsight:
      'Boundary placement is an architecture decision: per-route minimum, per-widget where panels are independent (dashboard, operations monitoring). Pair with error reporting (correlation ID attached) so a boundary hit is observable, not silent. The senior answer distinguishes expected failures (API — handled as state) from unexpected ones (bugs — contained by boundaries).',
    aiAwareness: {
      strongAnswerShouldMention: ['what boundaries catch vs not', 'placement granularity', 'fallback + retry', 'reporting'],
      weakAnswer: 'try/catch in the component catches everything.',
      redFlags: ['Thinking boundaries catch event handler errors.', 'No fallback UX.'],
      likelyFollowUp: ['Why don’t error boundaries catch async errors?', 'Where do you place boundaries in a large app?'],
    },
    prerequisites: ['react-state'],
    relatedTopics: ['react-testing-rtl', 'react-frontend-system-design'],
    nextTopics: ['react-testing-rtl'],
    references: [
      { title: 'Error Boundaries (legacy docs, still authoritative)', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', source: 'react.dev', type: 'official' },
      { title: 'react-error-boundary', url: 'https://github.com/bvaughn/react-error-boundary', source: 'GitHub', type: 'documentation' },
    ],
  },

  {
    id: 'react-testing-rtl',
    technology: 'react',
    title: 'Testing React — Behaviour over Implementation',
    category: 'Architecture',
    slug: 'react-testing-rtl',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning:
      'Test what the user experiences — render, interact, assert on visible outcomes — not internal state or class names; the user is the contract.',
    mentalModel:
      'React Testing Library: "The more your tests resemble the way your software is used, the more confidence they give." Query by role/label/text like a user would; never by component internals.',
    memoryTip:
      'Test behaviour, not implementation. getByRole > getByTestId > querySelector. User events (userEvent.type) over fireEvent. MSW for the network layer.',
    keyTerms: ['React Testing Library', 'user-event', 'MSW', 'testing trophy', 'E2E', 'accessibility queries'],
    interviewAnswer:
      'Component tests with React Testing Library render the component, interact through user-event (typing, clicking), and assert on what the user sees — roles, labels, text — never on internal state or prop drilling, because tests coupled to implementation break on every refactor without catching regressions. The pyramid (or trophy) balances it: pure functions unit-tested directly (fee calculators, reducers, date ranges), component tests for interaction contracts, a thin layer of integration tests around critical flows, and a few E2E journeys (Playwright/Cypress) covering login → dashboard → search transaction → submit payment. Network is mocked at the boundary with MSW so tests exercise the real request/response path. Async UX (spinners, optimistic updates) is tested with findBy queries against realistic latency, not fake timers everywhere.',
    practicalExample:
      'A NexusBank payment test: fill amount, select beneficiary, submit, assert the confirmation screen shows the reference number — asserting on user-visible outcomes, not on how many times a child component rendered. MSW returns a simulated 402 for insufficient funds, and the test asserts the visible error message, not the internal error state.',
    commonMistakes: [
      'Asserting on component internals (state, props, instance methods) — refactor-hostile tests.',
      'fireEvent.change for typing instead of userEvent — misses focus/keyboard semantics.',
      'Mocking fetch with ad-hoc jest mocks instead of a network layer (MSW) — tests stop catching contract breaks.',
      'Snapshot-testing everything — diffs get approved blindly.',
    ],
    seniorInsight:
      'The senior question is what to test at each level: pure logic unit-tested exhaustively, critical user journeys integration-tested with real-ish network, and a small E2E set for the money paths (login, payment, transfer). "Test user behaviour, not implementation" is not dogma — it is what keeps the suite valuable through refactors.',
    aiAwareness: {
      strongAnswerShouldMention: ['RTL philosophy', 'query by accessible role', 'MSW at the network boundary', 'E2E for critical journeys'],
      weakAnswer: 'We test with Jest and Enzyme, snapshot everything.',
      redFlags: ['Testing internal state or props directly.', 'No accessibility-aware queries.'],
      likelyFollowUp: ['How do you mock API responses in component tests?', 'What would you E2E test in a banking app?'],
    },
    prerequisites: ['react-overview'],
    relatedTopics: ['react-security-rbac', 'react-nextjs-rendering'],
    nextTopics: ['react-nextjs-rendering'],
    references: [
      { title: 'React Testing Library — Philosophy', url: 'https://testing-library.com/docs/react-testing-library/intro/', source: 'Testing Library', type: 'official' },
    ],
  },

  {
    id: 'react-nextjs-rendering',
    technology: 'react',
    title: 'Next.js Rendering Strategies — SSR, SSG, ISR, RSC',
    category: 'Architecture',
    slug: 'react-nextjs-rendering',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Rendering strategy is a per-route decision: where and when does HTML get produced — server on request (SSR), at build (SSG), revalidated in the background (ISR), or client after load (CSR) — with React Server Components moving data-dependent UI server-side.',
    mentalModel:
      'Pick per page: marketing/rates → SSG (fast, static); account dashboard → SSR or streaming RSC (fresh, personalised); heavy interactive tools → client components. The trade is always freshness vs latency vs cost.',
    memoryTip:
      'SSG = build time. SSR = request time. ISR = cached + revalidated. Server Components = no client JS, direct data access; Client Components = interactivity.',
    keyTerms: ['SSR', 'SSG', 'ISR', 'hydration', 'Server Components', 'streaming', 'trade-offs'],
    interviewAnswer:
      'SSG renders HTML at build time — fastest delivery and CDN-cacheable, right for content that changes between deploys (rates pages, help). ISR regenerates static pages in the background after a revalidate window — near-static speed with bounded freshness. SSR renders per request — always fresh and personalised, but every hit costs server time; streaming and Suspense shrink time-to-first-byte. React Server Components render on the server, ship zero component JS, and can read databases/APIs directly — ideal for data-heavy, low-interaction views (statements, audit logs); anything with state, events or browser APIs is a Client Component. The senior discipline: choose per route by asking what the page needs — freshness, personalisation, interactivity — and accept the trade-off each choice brings (SSR: server cost and hydration; SSG: staleness; CSR: slow first paint, SEO cost).',
    practicalExample:
      'NexusBank: the marketing and rates pages are SSG with ISR (fresh hourly, CDN-fast); the logged-in dashboard streams server-rendered balance/portfolio panels while the transactions grid hydrates as a client component with TanStack Query; the admin console is fully client-side behind auth.',
    commonMistakes: [
      'Choosing SSR for everything — you pay server cost and latency for pages that never change.',
      'Fetching in Server Components for data that changes per keystroke — that belongs client-side with a cache.',
      'Assuming SSR fixes SEO for authenticated app shells — nothing to render before auth.',
      'Hydrating giant trees with data that changed between render and hydration — mismatch bugs.',
    ],
    seniorInsight:
      'The senior answer frames rendering as a portfolio decision with explicit trade-offs: SSG/ISR for scale and speed on public content, SSR/RSC for personalised freshness, client components for interactivity islands — plus the security note that Server Components keep data-fetching logic and secrets off the client bundle.',
    aiAwareness: {
      strongAnswerShouldMention: ['per-route strategy', 'hydration cost', 'RSC vs Client Components', 'ISR revalidation', 'trade-off framing'],
      weakAnswer: 'Next.js is React with routing.',
      redFlags: ['Cannot state a single trade-off.', 'No idea when SSR is unnecessary.'],
      likelyFollowUp: ['Where do Server Components NOT work?', 'SSR vs CSR for a banking dashboard — what do you choose and why?'],
    },
    prerequisites: ['react-overview'],
    relatedTopics: ['react-frontend-system-design', 'react-code-splitting'],
    nextTopics: ['react-security-rbac'],
    references: [
      { title: 'Next.js — Rendering', url: 'https://nextjs.org/docs/app/building-your-application/rendering', source: 'Vercel', type: 'official' },
    ],
  },

  {
    id: 'react-security-rbac',
    technology: 'react',
    title: 'Security & RBAC in the Frontend',
    category: 'Architecture',
    slug: 'react-security-rbac',
    status: 'published',
    difficulty: 'senior',
    oneLineMeaning:
      'Frontend authorization shapes the experience; backend authorization enforces the rules — hiding a button is UX, never security.',
    mentalModel:
      'The frontend is a shop window: you can hide the vault door, but the vault’s lock lives in the bank. Every permission the UI knows about, the API must enforce independently.',
    memoryTip:
      '"Frontend controls experience, backend controls authorization." If I hide the Admin button, is the API secure? No.',
    keyTerms: ['RBAC', 'permission vs role', 'XSS', 'CSRF', 'CORS', 'token storage', 'defence in depth'],
    interviewAnswer:
      'Frontend authorization (role/permission gates on routes, components, actions) shapes the experience; it is not a security control — the API must enforce every rule independently, because the client is untrusted. The frontend still matters operationally: derive permissions from the session (never hardcode role checks), gate routes and UI with a permission component rather than scattered role checks, and fail closed. Security hygiene in a banking SPA: output-encode anything user-sourced (XSS — dangerouslySetInnerHTML is a code smell), prefer httpOnly secure cookies or careful token storage with short-lived access tokens plus refresh rotation, add CSRF protection for cookie-based flows, validate on submit AND on the server, and keep dependencies audited. The classic interview question — "I hid the Admin button, is the API secure?" — the answer is no: the UI is a convenience; the API is the boundary.',
    practicalExample:
      'NexusBank’s <Can permission="APPROVE_PAYMENT"> hides the approve action from CUSTOMER and ANALYST roles — but the approve endpoint re-checks the permission server-side on every call, because a crafted request ignoring the UI must still be rejected. Audit log entries carry the correlation ID and the acting principal.',
    commonMistakes: [
      'Treating hidden UI as authorization — the API is the enforcement point.',
      'Storing long-lived tokens in localStorage and calling it fine because "the API checks roles".',
      'Rendering user input as HTML (dangerouslySetInnerHTML) without sanitisation — XSS in a banking app is catastrophic.',
      'Client-side amount validation only — the backend must validate limits, currency and idempotency.',
    ],
    seniorInsight:
      'The senior framing is defence in depth: the frontend shapes the experience and catches honest mistakes; the backend assumes every request is hostile. RBAC checks belong in one place (a <Can> component / permission hook over the session claims) so the permission model is auditable — exactly what a BFSI security review asks for.',
    aiAwareness: {
      strongAnswerShouldMention: ['frontend ≠ security boundary', 'server-side enforcement', 'XSS/CSRF basics', 'token storage trade-offs', 'fail closed'],
      weakAnswer: 'We hide admin routes for non-admins.',
      redFlags: ['Believing UI hiding is authorization.', 'No backend-enforcement mention.'],
      likelyFollowUp: ['Where do you store JWTs and why?', 'How do you prevent CSRF with cookie sessions?'],
    },
    prerequisites: ['react-usecontext'],
    relatedTopics: ['react-frontend-system-design', 'react-state-taxonomy'],
    nextTopics: ['react-frontend-system-design'],
    references: [
      { title: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/', source: 'OWASP', type: 'documentation' },
    ],
  },

  {
    id: 'react-frontend-system-design',
    technology: 'react',
    title: 'Frontend System Design — Banking Portal',
    category: 'Architecture',
    slug: 'react-frontend-system-design',
    status: 'published',
    difficulty: 'architect',
    oneLineMeaning:
      'System design for a banking frontend means walking requirements → architecture → data flow → trade-offs: component boundaries, state taxonomy, API/cache strategy, performance budget, security model and failure handling.',
    mentalModel:
      'A design interview is a guided tour: requirements → assumptions → architecture → data flow → performance → security → failure modes. Every layer answers "what breaks at 10x?"',
    memoryTip:
      'Design answer skeleton: Requirements → Architecture → Components → State (local/client/server) → API & caching → Performance → Security → Observability → Failure modes → Trade-offs.',
    keyTerms: ['requirements', 'component boundaries', 'state taxonomy', 'caching layers', 'performance budget', 'RBAC', 'observability', 'trade-offs'],
    interviewAnswer:
      'A strong banking-dashboard design starts with requirements and assumptions: who are the users (customers vs operations), what volume (millions of transactions, server-side paging), what latency budget, what compliance constraints. Architecture: route-level code splitting; a design-system layer of primitives (Button, Modal, DataGrid) composed into feature modules; state split by ownership — local UI state in components, session/permissions in context or store, server data in a query cache with keyed invalidation. Data flow: API gateway → typed client with cancellation and retries → normalized cache; high-frequency updates (live transaction feed) arrive over WebSocket/SSE into a store with selector subscriptions, not context. Performance: route-level code splitting, virtualized grids, debounced search with request cancellation, memoized rows; measured with the Profiler and Web Vitals. Security: RBAC enforced in UI and re-checked server-side, tokens in httpOnly cookies, CSP, output encoding. Failure handling: error boundaries per panel, retry with backoff, offline/empty states, observability with correlation IDs end-to-end. Close with trade-offs: cache freshness vs consistency, client state vs server cache, micro-frontends only when team scale demands it.',
    practicalExample:
      'A strong NexusBank design: shell app (auth, layout, routing) with portal modules (customer, operations, admin) as separately deployed bundles; transaction search as a server-driven DataGrid (cursor pagination, debounced filters, AbortController, virtualized rows); payments as a state-machine form with idempotency keys and optimistic UI with rollback; observability via correlation ID from click to microservice.',
    commonMistakes: [
      'Jumping to libraries ("we will use Redux") before stating requirements and constraints.',
      'No failure-mode discussion — no answer to "what happens when the API is down or slow?"',
      'Ignoring security until prompted — RBAC, token handling and PII handling are first-class in BFSI.',
      'No trade-offs: presenting one path as free.',
    ],
    seniorInsight:
      'The senior/lead signal is structure and trade-offs, not tools: clarify requirements, state assumptions, design in layers (components, state taxonomy, API, caching, performance, security, observability, failure modes), then name the trade-offs you accepted. Interviewers hire the person who says "it depends — here is what it depends on".',
    aiAwareness: {
      strongAnswerShouldMention: ['requirements first', 'state taxonomy', 'performance budget', 'failure modes', 'explicit trade-offs'],
      weakAnswer: 'I would build it with React and Redux.',
      redFlags: ['No requirements phase.', 'No security or failure discussion.', 'Technology-first reasoning.'],
      likelyFollowUp: ['How does the design change for 10x users?', 'Where does real-time fit in?', 'How do you split it across teams?'],
    },
    prerequisites: ['react-state-taxonomy', 'react-tanstack-query', 'react-virtualization'],
    relatedTopics: ['react-nextjs-rendering', 'react-security-rbac', 'react-error-boundaries'],
    nextTopics: [],
    references: [
      { title: 'Frontend System Design — patterns', url: 'https://www.frontendinterviewhandbook.com/front-end-system-design/', source: 'GreatFrontEnd', type: 'article' },
    ],
  },
];
