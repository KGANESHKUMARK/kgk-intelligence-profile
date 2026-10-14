# Master Prompt — Interactive Engineering Intelligence Profile

> Copy this entire document into a fresh AI coding session (Devin, Claude, Cursor, etc.)
> to rebuild this exact class of product for a **different person**, a **different domain**,
> or a **fresh redesign**. Replace every `[BRACKETED]` placeholder with real values before
> or during the build. Everything else describes the architecture, design system and
> behavior that must be reproduced.

---

## How to Use This Prompt

**This prompt does not work standalone — it requires a source document.** Before starting
any build work, the agent (or the person running this prompt) MUST:

1. **Ask the user to upload their resume/CV** (PDF, DOCX, or plain text). This is the
   single source of truth for all facts: name, titles, employers, dates, technologies,
   achievements, education, certifications. Do not proceed to scaffolding without it.
2. **Extract and structure the resume content first**, before writing any component code.
   Turn it into the `src/data/*.ts` files described in §5 as the very first implementation
   step.
3. **Ask clarifying questions** for anything the resume leaves ambiguous or the user wants
   overridden, for example:
   - Preferred display name vs. legal name (e.g. nickname, short form)
   - Total years of experience if the resume's start date and the user's stated total
     don't match exactly
   - Any skills/certifications the user wants included that aren't verbatim on the resume
     (flag these per §11 — do not silently invent credentials)
   - Contact links: LinkedIn URL, GitHub URL, preferred email, phone (with country code)
   - How to frame overlapping/competing skills (e.g. "React vs Angular — which do you want
     positioned as primary?")
   - Whether there's a secondary specialisation (AI, security, data, platform, etc.) worth
     a dedicated section, and what domain-specific spotlight section makes sense
     (§3, "Domain Spotlight" row)
   - The name of the deployed resume PDF file to serve for download, and whether the user
     will supply the actual print-ready PDF separately
4. **Never fabricate metrics, employer names, dates, or certifications.** If the resume is
   silent on something the design needs (e.g. a tagline, an "elevator pitch" paragraph),
   draft it from what IS in the resume and show it to the user for approval rather than
   inventing unsupported claims.
5. Only after the resume is uploaded, parsed, and clarifying questions are answered, proceed
   to §12 (Suggested Build Order) starting from step 1.

If the user has NOT yet provided a resume when this prompt is invoked, the agent's first
response should be a request for the file — not a scaffold, not placeholder data, and not
assumptions about the person's identity.

---

## 0. One-Paragraph Brief

Build a production-quality, highly polished, unique **Interactive Interview Resume /
Developer Portfolio** for **[YOUR NAME]**, a **[YOUR TITLE, e.g. "Lead AI & Full Stack
Engineer"]** with **[YEARS]+ years** of experience in **[DOMAIN, e.g. "banking and capital
markets"]**. Use React, TypeScript, Vite, and Tailwind CSS. Focus on showcasing technical
skills, domain experience, and any specialised expertise (e.g. AI/GenAI). Deploy as a
static site on Vercel. No backend, no database, no authentication, no paid APIs, no
external proprietary services — pure static site with all content baked into the bundle.

Avoid generic resume templates. The product should feel like a premium internal
engineering tool — technical, minimal, fast, and built to be screen-shared live in an
interview.

---

## 1. Technology Stack (non-negotiable choices)

- **React 19** + **TypeScript** (strict mode)
- **Vite 6** — build tooling, dev server
- **Tailwind CSS v4** — via `@theme` and `@utility` directives in a single global CSS file,
  NOT a `tailwind.config.js` (v4 uses CSS-first config)
- **Motion** (the renamed `framer-motion` package, imported as `motion/react`) — all
  animation
- **Lucide React** — icon set, via an explicit icon registry component (see §5.3) so
  tree-shaking works without dynamic imports
- **qrcode.react** — QR code generation (no external QR API/service)
- **clsx** + **tailwind-merge** — a `cn()` utility for conditional classes
- Do **NOT** add: a router (single-page with anchor-based scrollspy is enough), a
  state-management library (React context is enough), a UI kit (shadcn/MUI/etc. — build
  primitives from scratch), a charting library (build SVG visualisations by hand for
  uniqueness and bundle size)
- Package manager: npm

---

## 2. Design System — "Ion" visual identity

Establish a **single design language** and apply it everywhere. Reference identity:

- **Base**: near-black graphite (`#08090c` dark / `#f7f8fa` light), never pure black/white
- **Grid motif**: a barely-visible 56px linear grid background (`--grid` at ~3% opacity)
  used behind hero and interview-mode sections
- **Three signal accent colors**, each with a `soft` (12% bg), `line` (32% border) and
  `text` (bright) variant:
  - **jade/teal** (`--accent`) → engineering, systems, execution, primary CTA color
  - **periwinkle/indigo** (`--ai`) → AI/intelligence-flavoured content
  - **amber** (`--risk`) → risk, production reality, failure modes, leadership
- **Typography**: Inter Variable (sans, `-0.022em` heading letter-spacing) + JetBrains Mono
  Variable (mono, used for labels/indices/tech tags), loaded via `@fontsource-variable`
  packages, imported as the package's default `index.css` export (NOT a `/latin.css`
  subpath — that file does not exist in the published package; this is a common footgun)
- **Cards**: `surface-card` utility = 1px hairline border + subtle shadow + rounded-14px
  corners. A `ticked` utility variant adds four small L-shaped corner brackets (a
  recurring "instrumentation panel" motif) via `::before`/`::after` pseudo-elements
- **Labels**: a `mono-label` utility = JetBrains Mono, 11px, uppercase, 0.14em tracking,
  muted color — used for every eyebrow/index/category label site-wide
- **Section numbering**: every major section gets a two-digit mono index (`01`, `02`, ...)
  rendered next to its eyebrow label — reinforces the "structured technical document"
  feel
- **Motion vocabulary**: restrained, fast, never bouncy. A single custom ease curve
  `[0.22, 1, 0.36, 1]`, a `fadeUp` variant (`y: 14 → 0`, opacity), a `fadeIn` variant, and
  a `stagger()` helper. Respect `prefers-reduced-motion` globally (durations collapse to
  ~0ms via a `@media` block)
- **Theme**: dark is default; light theme fully supported via a `data-theme` attribute on
  `<html>` and a parallel CSS variable palette. Toggle persists to `localStorage` and
  respects `prefers-color-scheme` on first load
- **Print stylesheet**: a completely separate, black-on-white, serif-free print layout
  (see §5.9) hidden on screen (`.print-only { display: none }`) and shown only under
  `@media print`

Implement all of this as **CSS custom properties** exposed to Tailwind via `@theme inline`
mapping (e.g. `--color-accent: var(--accent)`), so components can use both `var(--accent)`
inline styles and Tailwind utility classes like `bg-accent` interchangeably.

---

## 3. Information Architecture — Sections

Build these sections, in this order, each as its own component, composed in `App.tsx`.
Each section is a two-digit-indexed, full-width `<section>` with a consistent
`SectionHeader` (index, eyebrow, title, description) and `max-w-[1240px]` inner container.

| # | Section | Core idea |
|---|---------|-----------|
| 01 | **Hero + Overview** | Name, title, tagline, status badges, primary CTAs (Explore / Interview Mode), a hand-built SVG **Capability Radar** chart (8-10 top-level capability areas, NOT the full skill list — a separate, curated `capabilities[]` dataset, each with a relative `weight` for the polygon shape, a qualitative `level` label, a one-line `contextLine`, an `exampleProject`, `domainRelevance`, and 3-5 representative `technologies`; clicking/hovering a spoke swaps a detail card below the chart), a "Professional Summary" strip below the fold |
| — | **Interview Snapshot** | A responsive grid of 6-8 compact stat cards (Engineering, Domain, Primary Focus, Backend, Frontend, Cloud, AI, Data) each with icon, headline value, and one-line detail |
| — | **What I Bring** | 4-6 value-proposition cards (capability pillars) |
| 02 | **Skills Explorer** | Searchable + filterable grid/list of every technology. Each skill has a qualitative level (not invented years), a one-line "context" positioning, and a **Technology → Capability → Project → Outcome** narrative chain. Clicking a skill opens a **Skill Detail** panel/drawer. A **Domain Stacks** view groups technologies by domain (e.g. "Banking stack", "AI stack") |
| 03 | **Experience Timeline** | Reverse-chronological career timeline, each entry expandable to show responsibilities, achievements, and a technology tag list |
| 04 | **Domain Spotlight** (e.g. "Banking Spotlight") | An illustrated data-flow diagram specific to your primary domain — stages of a real process you've worked on, each stage tagged with the tech used |
| 05 | **Project Explorer** | Card grid of real projects, each opens a **Project Modal** with problem / solution / architecture breakdown / technology list / impact bullets |
| 06 | **AI/Specialisation Engineering** | If you have a specialisation (AI, security, data, etc.): a **capability ladder**, not just a linear pipeline — each stage (e.g. LLM, Prompt Engineering, RAG, Agents, Evaluation, Guardrails) documented with `what` / `why` / `where` (real project it was used on) / `failureModes[]` / `production[]` mitigations, so every stage doubles as interview-ready content; plus a separate system architecture diagram and an "Engineering Thinking" section covering production failure modes and how you mitigate them |
| 07 | **Architecture Playground** | An interactive picker across several (5-8) system-design diagrams. Each diagram is data-driven, not a screenshot: a small layered graph of `nodes` (positioned by `row`/`col` on a grid, tagged with a `kind` like store/stream/service/ui/external/ai, a tone, a one-line `summary`, and expandable `points[]`) connected by `edges` (`from`/`to`, optional `label`, optional `dashed` for async/eventual paths). Clicking any node reveals its detail without navigating away from the diagram |
| 08 | **Technology Constellation** | An orbit-style SVG visualisation: your name/initials at the centre, an inner ring of "core" flagged skills, an outer ring of the remaining skills (capped, e.g. 22), each connected to the centre by a spoke. Click/hover a node to see its capability chain, related projects and related roles in a sticky side panel, with a button to jump into the Skills Explorer pre-filtered to that skill |
| 09 | **Certifications / Education / Awards** | Timeline or grid of certifications with what each one *demonstrates* (not just the name), plus education and awards |
| 09.1 | **Ask Me About** | A chip-based topic picker (10-20 topics) that reveals a headline, a body paragraph, "evidence" (what you'd point at), and related topics — designed to be spoken aloud |
| 10 | **Technical Discussion** | A categorised bank of realistic system-design/behavioral questions, each with an expandable answer broken into **Approach / Key Components / Failure Scenarios / Tradeoffs** — this is the deepest, most differentiated content on the site |
| 11 | **Contact** | Contact channels grid, a live **QR code** (points at `window.location.origin`, so it always resolves correctly wherever deployed), resume download, print button, share button, social links |
| — | **Footer** | Identity mark, quick links, command-palette hint, copyright |

---

## 4. Signature Interactive Features

These are what make it "interactive" rather than a static page. Build all of them.

### 4.1 Command Palette (Ctrl/Cmd + K)
Global keyboard shortcut opens a fuzzy-searchable modal, rendered via `createPortal` to
`document.body`, indexing **four grouped command types**:
- **Navigate** — every section (jump-to via `scrollToSection`)
- **Actions** — toggle Interview Mode, download resume, print resume, share profile,
  toggle theme
- **Links** — GitHub, LinkedIn, email (opens directly)
- **Technologies** — every skill, searchable by name/category; hidden by default and
  only surfaced once the user types a query (keeps the closed-state list short and
  relevant)

Full keyboard support: type to fuzzy-filter, ↑/↓ to move selection (wraps around),
Enter to run the highlighted command, Escape to close. Selected row auto-scrolls into
view. Results list is capped (e.g. 40) once a query is active to keep it fast.

### 4.2 Interview Mode (full-screen overlay)
A dedicated presentation mode, opened via a navbar button or the palette, that takes over
the whole viewport (portal-rendered, `overflow: hidden` on body while open). Two tabs:

- **90-Second Profile** — a single-scroll "elevator pitch" view: role, core strengths,
  key technologies, specialisation summary, key projects, architecture expertise — designed
  to be read aloud in under two minutes. Includes an inline QR code so the interviewer can
  scan and browse independently while you talk.
- **Tell My Story** — a guided, single-step-at-a-time narrative (6-7 steps: Who I am →
  Domain experience → Full-stack breadth → Specialisation evolution → Current strengths →
  Architecture philosophy → What I'm looking for). Each step has a spoken-word script, a
  duration estimate, and bullet talking points. Navigate with on-screen buttons, arrow
  keys, or a progress rail of clickable segments. Escape exits Interview Mode entirely.

### 4.3 Print / PDF Resume View
A `.print-only` component rendered once at the end of the DOM tree, populated from the
**same data files** as the interactive site (never duplicate content). Hidden on screen,
shown only via `@media print`. Triggered by a "Print Resume" button that calls
`window.print()` after a `requestAnimationFrame` double-buffer to ensure the print DOM has
committed. Print CSS is black-on-white, compact, single-column, with `print-avoid-break`
classes on entries that shouldn't split across pages.

### 4.4 Theme Toggle
Dark/light, `localStorage`-persisted, defaults to system preference on first visit.

### 4.5 Share
Uses the native Web Share API where available (`navigator.share`), falling back to
clipboard copy (`navigator.clipboard.writeText`) with a toast confirmation. Handle the
`AbortError` case (user dismissed the native share sheet) as a silent no-op, not an error.

### 4.6 Scrollspy + Reading Progress
A thin progress bar under the sticky navbar reflecting scroll position through the page,
plus active-section highlighting in the nav driven by `IntersectionObserver`.

### 4.7 Role Tailoring (single-file re-positioning)
A `src/config/tailoring.ts` file that centralises everything needed to re-target the site
at a different job description without touching any component:
- `titleVariants` — a map of 4-6 ready-made title/tagline/badge presets (e.g.
  "Lead AI & Full Stack Engineer", "Principal Engineer — Distributed Systems",
  "Senior Full Stack Engineer"), each with its own tagline and status-badge set
- `activeTitle` — which preset is live right now (drives hero heading, tagline, badges,
  browser tab title, and OG/share metadata)
- `hiddenSkills` — skill ids to remove from the Explorer, constellation and command
  palette search index for this application
- `pinnedSkills` — skill ids to sort to the front of the Skills Explorer so the most
  JD-relevant technologies are what an interviewer sees first
- `hiddenSections` — section ids to remove from the page, navbar and command palette
  entirely (`overview` and `contact` are always forced visible)
- `projectOrder` — explicit project id ordering for the Project Explorer, overriding the
  natural most-recent-first order
All of these are typed against the actual `SkillId`/`SectionId` unions, so a typo fails
`npm run build` instead of silently breaking the site at runtime.

---

## 5. Data Layer (single source of truth)

**Rule: no component ever hard-codes content.** Every string, list, or number a visitor
sees comes from a typed file under `src/data/`. This is what makes the site trivially
maintainable and reusable.

```
src/data/
  profile.ts          # name, title, tagline, summary, elevator pitch, contact, social,
                       # snapshot stats, value props, education, awards
  skills.ts            # the full skill graph: id, name, category, level, context,
                       # chain[] (Technology -> Capability -> Project -> Outcome),
                       # projects[], roles[], aliases[], core?, fromBrief?
                       # ALSO exports a separate, curated `capabilities[]` array (8-10
                       # top-level capability areas, distinct from the full skill list)
                       # used only by the Hero's Capability Radar: id, label, weight
                       # (0-1, drives the polygon shape), level, tone, contextLine,
                       # exampleProject, domainRelevance, technologies[]
  experience.ts        # career timeline entries + a domain-specific data-flow array
  projects.ts          # project case studies: problem, solution, architecture[],
                       # technologies[], impact[]
  aiEngineering.ts      # (or renamed to your specialisation) capability-ladder stages:
                       # id, label, short, what, why, where, failureModes[], production[],
                       # tone — each stage is real interview content, not a marketing bullet
  architectures.ts     # architecture playground diagrams: id, label, tagline, description,
                       # cols, nodes[] (id, label, row, col, span?, tone, kind?, summary,
                       # points[]), edges[] (from, to, label?, dashed?)
  certifications.ts    # certification list with "demonstrates" framing, not just names
  interviewTopics.ts   # askTopics[], discussionCategories[] (with nested questions[]),
                       # storySteps[], ninetySecondProfile{}
  navigation.ts         # section registry — drives navbar, scrollspy, command palette;
                       # respects tailoring.hiddenSections
```

Every interface should be explicit TypeScript (no `any`). Comment any field whose value
was inferred/requested rather than sourced verbatim from the resume, so it can be
reviewed before an interview (e.g. `fromBrief?: boolean` on skills).

---

## 6. Component Architecture

```
src/components/
  common/       Button, LinkButton, Badge, Modal, SectionHeader + Section wrapper,
                Icon (explicit lucide-react registry keyed by string name), Chain
                (renders the Technology -> Capability -> Project -> Outcome stepper)
  layout/       Navbar (sticky, scrollspy, mobile menu, theme toggle, share, resume
                download, interview-mode toggle, command-palette trigger), CommandPalette,
                Contact, Footer
  hero/         Hero, CapabilityRadar (hand-rolled SVG radar chart), InterviewSnapshot,
                WhatIBring
  skills/       SkillsExplorer (search + category filters), SkillDetail, DomainStacks
  experience/   ExperienceTimeline, [Domain]Spotlight
  projects/     ProjectExplorer, ProjectModal
  ai/           AIEngineering (or [Specialisation]Engineering), AIArchitecture,
                EngineeringThinking
  architecture/ ArchitecturePlayground, TechnologyConstellation
  certifications/ CertificationTimeline
  interview/    AskMeAbout, TechnicalDiscussion, InterviewMode
  print/        PrintResume
```

```
src/hooks/
  useTheme.ts        # dark/light + localStorage + system preference
  useScrollSpy.ts     # active section id + scroll progress + "is scrolled" boolean
  useShare.ts         # Web Share API + clipboard fallback + status message
  useProfileUrl.ts     # SSR-safe window.location.origin + pathname, for QR/share
  useAppState.tsx     # global context: theme, command-palette open, interview-mode
                       # open, focused-skill cross-link, printResume() action
```

```
src/lib/
  utils.ts      # cn() classname merge, tone-to-CSS-var mapping, scrollToSection()
                # (accounts for sticky header + moves focus for a11y), matches()
                # case-insensitive search helper, polar() for circular SVG layouts
  motion.ts     # EASE constant, fadeUp/fadeIn variants, stagger(), viewportOnce config
```

---

## 7. Accessibility Requirements

- Skip-to-content link, visible on focus
- All interactive elements keyboard-operable; Interview Mode fully navigable via
  arrow keys + Escape
- `aria-live` regions for toast messages (share confirmation)
- `aria-expanded`/`aria-controls` on all disclosure widgets (accordions, modals)
- `:focus-visible` outline styled consistently, never removed
- Respect `prefers-reduced-motion` at the CSS level (not just per-component)
- `scrollToSection()` moves keyboard/screen-reader focus to the target section, not just
  the scroll position

---

## 8. SEO & Deployment Assets

- `index.html` — title, meta description, canonical URL, Open Graph tags (title,
  description, url, image, type=profile), Twitter card tags, and a `Person` JSON-LD
  schema block (name, jobTitle, worksFor, alumniOf, sameAs, knowsAbout)
- `public/favicon.svg` — simple monogram badge matching the design system
- `public/og-image.svg` — a 1200×630 hand-built SVG social preview card (name, title,
  tagline, tech chips) — no external image generation service
- `public/robots.txt` + `public/sitemap.xml`
- `vercel.json` — cache headers for static assets. **Gotcha:** Vercel's route-matching
  does NOT support raw regex alternation groups like `/(.*\.(svg|pdf))` — use simple
  glob-style patterns per file type instead (e.g. separate header blocks for
  `/(.*).svg` and `/(.*).pdf`, or `/assets/:path*` for hashed build output)
- A placeholder or real resume PDF at the path referenced by `profile.resumeFile`

---

## 9. Build & Verification Checklist

Run after every meaningful change:

```bash
npm run build   # tsc -b && vite build — must have zero TS errors
npm run lint    # eslint — must have zero errors, zero warnings
npm run dev     # manually verify in browser: dark + light theme, mobile viewport,
                # command palette, interview mode, print preview, QR code, share
```

Known footguns to avoid (hit and fixed during the original build):
1. `@fontsource-variable/*` packages do **not** export a `/latin.css` subpath — import the
   package root (`@fontsource-variable/inter`) instead, which resolves to `index.css`
   containing all subsets.
2. Vercel `vercel.json` header `source` patterns reject PCRE-style alternation regex —
   keep patterns simple.
3. PowerShell (if developing on Windows) does not support bash heredocs (`<<'EOF'`) or
   `&&` as a statement separator in older versions — write multi-line commit messages to
   a temp file and use `git commit -F file`, and chain commands with `;` instead of `&&`.
4. Recharts (or any generic charting library) is unnecessary bundle weight for the small
   number of custom visualisations here — hand-rolled SVG is smaller, more unique, and
   avoids deprecated-library risk.

---

## 10. Deployment

1. Static build output (`dist/`) deploys to **Vercel** with zero server-side config.
2. Recommended flow: push to a GitHub repo, import into Vercel via the dashboard
   (auto-detects Vite: build command `npm run build`, output directory `dist`), then every
   push to `main` auto-deploys.
3. Git identity for commits should be the site owner's real name and email, not a
   placeholder.
4. Feature work happens on `feature/*` branches (Vercel generates a preview URL per
   branch automatically) — merge to `main` only after review.

---

## 11. Content-Sourcing Discipline

- Every fact must be traceable to the source resume/CV or an explicit clarification from
  the person. Do not invent metrics, years of experience, or certifications.
- If the person requests content that isn't in the source document (e.g. "add this skill
  even though it's not on my resume"), flag it in a code comment (see `fromBrief?` pattern
  in §5) so it can be reviewed before it's presented in an actual interview.
- Resolve every ambiguity (name formatting, contact links, framing of overlapping skills
  like "React vs Angular") explicitly with the person rather than guessing.

---

## 12. Suggested Build Order

1. Scaffold Vite + React + TS + Tailwind v4, install dependencies
2. Design system: theme tokens, fonts, global CSS, primitives (Button, Badge, Modal,
   SectionHeader, Icon, Chain)
3. Data layer: transcribe the resume into every file under `src/data/`
4. Layout shell: Navbar, Footer, CommandPalette, theme + scrollspy hooks
5. Hero + CapabilityRadar + InterviewSnapshot + WhatIBring
6. Skills Explorer + Skill Detail + Domain Stacks
7. Experience Timeline + domain spotlight
8. Project Explorer + Project Modal
9. Specialisation section (AI/other) — pipeline + architecture + engineering thinking
10. Architecture Playground + Technology Constellation
11. Certifications/Education/Awards + Ask Me About + Technical Discussion
12. Contact + QR code + Footer + Share
13. Interview Mode overlay (90-Second Profile + Tell My Story)
14. Print/PDF resume view + print stylesheet
15. SEO metadata, favicon, robots.txt, sitemap, OG image
16. Build + lint, fix everything, manually verify in browser (dark/light, mobile, a11y)
17. README + Vercel config + deploy

---

## 13. Placeholders to Fill In Before Starting

| Placeholder | Example |
|---|---|
| `[YOUR NAME]` | Full legal/display name |
| `[YOUR TITLE]` | Current professional title/positioning |
| `[YEARS]` | Years of experience |
| `[DOMAIN]` | Primary industry/domain |
| `[SPECIALISATION]` | Secondary deep expertise area, if any (AI, security, data, etc.) |
| Contact links | Email, phone, LinkedIn, GitHub |
| Resume PDF | The actual source document to transcribe data from |
| Accent color hexes | Keep the three-tone system, choose hues that fit personal brand |
| Domain-specific section name | e.g. "Banking Spotlight" → "[Domain] Spotlight" |
