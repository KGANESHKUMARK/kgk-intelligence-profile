# Engineering Intelligence Profile

An interactive interview resume / developer portfolio for **Ganesh Kumar** — Lead AI & Full Stack Engineer with 13+ years across banking and capital markets.

Built with React, TypeScript, Vite, Tailwind CSS v4, and Motion. Deployable as a static site on Vercel.

## Quick Start

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run build    # production build to /dist
npm run preview  # preview the production build
npm run lint     # eslint
```

## What This Is

Not a standard resume. This is an **Engineering Intelligence Profile** — a premium, interactive, interview-friendly presentation of technical depth, designed to be screen-shared in an interview or browsed privately by a hiring manager.

### Sections

| # | Section | What it does |
|---|---------|-------------|
| 01 | Overview | Hero, capability radar, interview snapshot, value props |
| 02 | Skills | Searchable/filterable skill explorer with Technology → Experience chains |
| 03 | Experience | Career timeline with expandable detail |
| 04 | Banking | Banking & Capital Markets data flow spotlight |
| 05 | Projects | Project explorer with deep-dive modals |
| 06 | AI Engineering | AI/ML pipeline + AI system architecture diagram |
| 07 | Architecture | Interactive architecture playground + technology constellation |
| 08 | Technology Map | Technology constellation visualisation |
| 09 | Certifications | Certification timeline with education and awards |
| 10 | Technical Discussion | Sample design questions with approach, components, failure modes, tradeoffs |
| 11 | Contact | Contact channels, QR code, share, print |

### Interactive Features

- **Command Palette** (Ctrl/Cmd+K) — jump to any section
- **Interview Mode** — a full-screen overlay with a 90-second profile and a guided "Tell My Story" walkthrough
- **Print Resume** — a print-optimised resume view (Ctrl/Cmd+P or the Print button)
- **Theme Toggle** — dark/light with system preference detection
- **Share** — Web Share API with clipboard fallback
- **QR Code** — scan to open the profile on another device

## Customisation

### Update your data

All content lives in `src/data/`:

- `profile.ts` — name, title, contact, summary, education, awards
- `skills.ts` — the interactive skill graph
- `experience.ts` — career timeline
- `projects.ts` — project case studies
- `certifications.ts` — certifications
- `aiEngineering.ts` — AI/ML pipeline stages
- `architectures.ts` — architecture playground diagrams
- `interviewTopics.ts` — Ask Me About, technical discussion, guided story, 90-second profile
- `navigation.ts` — section registry (drives navbar, scrollspy, command palette)

### Tailor for a specific role

Edit `src/config/tailoring.ts` to re-position the entire profile against a job description — change the active title, emphasised skills, and which sections are visible, all from one file.

### Resume PDF

Place your PDF at `public/Lead_AI_FullStack_GaneshkumarK.pdf` (or update `resumeFile` in `src/data/profile.ts`).

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 6** — build tooling
- **Tailwind CSS v4** — styling via CSS custom properties
- **Motion** (Framer Motion) — animations
- **Lucide React** — icons
- **qrcode.react** — QR code generation

No backend, no database, no authentication, no paid APIs. Pure static site.

## Deploy to Vercel

```bash
npm i -g vercel
vercel          # follow the prompts
vercel --prod   # production deploy
```

Or connect the repo to Vercel via the dashboard — the `vercel.json` and Vite build output are already configured.

## Project Structure

```
src/
├── components/
│   ├── ai/              # AI Engineering, AI Architecture, Engineering Thinking
│   ├── architecture/    # Architecture Playground, Technology Constellation
│   ├── certifications/  # Certification Timeline
│   ├── common/          # Button, Badge, Modal, SectionHeader, Icon, Chain
│   ├── experience/      # Experience Timeline, Banking Spotlight
│   ├── hero/            # Hero, Capability Radar, Interview Snapshot
│   ├── interview/       # Ask Me About, Technical Discussion, Interview Mode
│   ├── layout/          # Navbar, CommandPalette, Footer, Contact
│   ├── print/           # Print-only resume view
│   ├── projects/        # Project Explorer, Project Modal
│   └── skills/          # Skills Explorer, Skill Detail, Domain Stacks
├── config/
│   └── tailoring.ts     # One-file role tailoring
├── data/                # All content (single source of truth)
├── hooks/               # useTheme, useScrollSpy, useShare, useAppState
├── lib/                 # utils, motion presets
└── styles/
    └── index.css        # Design system, theme tokens, print styles
```

## License

Personal portfolio content © Ganesh Kumar. Code structure is provided as-is for personal use.
