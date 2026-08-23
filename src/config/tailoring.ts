/* ============================================================================
 * TAILORING — the ONE file to edit when you target a new job description.
 * ============================================================================
 *
 * Nothing here changes the UI code. Change the values, save, redeploy.
 *
 *   1. Change your title/positioning ....... `activeTitle`
 *   2. Hide a technology from the site ..... `hiddenSkills`
 *   3. Push a technology to the front ...... `pinnedSkills`
 *   4. Hide a whole section ................ `hiddenSections`
 *   5. Add a brand-new technology .......... see NOTE at the bottom
 *
 * Everything is type-checked: a typo in a skill id or section id will fail
 * `npm run build`, so you cannot silently break the site.
 * ------------------------------------------------------------------------- */

import type { SectionId } from '../data/navigation';
import type { SkillId } from '../data/skills';

/** Ready-made positionings. Add your own — copy any block and edit it. */
export const titleVariants = {
  'lead-ai-fullstack': {
    title: 'Lead AI & Full Stack Engineer',
    tagline:
      'Building enterprise-grade AI, banking platforms, intelligent automation and scalable software systems.',
    badges: [
      '13+ Years Engineering',
      'Banking & Capital Markets',
      'AI / GenAI',
      'Full Stack',
      'Cloud & Platform Engineering',
    ],
  },

  'senior-technical-lead': {
    title: 'Senior Technical Lead — Banking Platforms',
    tagline:
      'Leading engineering on event-driven banking platforms — from Kafka ingestion through to client delivery.',
    badges: [
      '13+ Years Engineering',
      'Banking & Capital Markets',
      'Event-Driven Architecture',
      'Team Leadership',
      'Cloud & Platform Engineering',
    ],
  },

  'ai-engineering-lead': {
    title: 'AI Engineering Lead',
    tagline:
      'Taking LLMs, RAG and agentic systems from prototype to production inside regulated financial institutions.',
    badges: ['13+ Years Engineering', 'M.Tech AI/ML', 'LLM · RAG · Agents', 'Production AI', 'Banking Domain'],
  },

  'principal-engineer': {
    title: 'Principal Engineer — Distributed Systems',
    tagline:
      'Designing distributed systems for correctness under failure: retry, replay, reconciliation and rollback.',
    badges: [
      '13+ Years Engineering',
      'Distributed Systems',
      'Kafka · Flink · Microservices',
      'Kubernetes',
      'Banking & Capital Markets',
    ],
  },

  'java-backend-lead': {
    title: 'Lead Backend Engineer — Java & Cloud',
    tagline:
      'Java 25 and Spring Boot 3 microservices carrying money-moving and reporting workloads at bank scale.',
    badges: ['13+ Years Engineering', 'Java 8 → 25', 'Spring Boot · Microservices', 'AWS · Kubernetes', 'Banking'],
  },

  'fullstack-engineer': {
    title: 'Senior Full Stack Engineer',
    tagline:
      'React and Angular front-ends over Java, Python and Rust services — owned end to end, from UI to warehouse.',
    badges: ['13+ Years Engineering', 'React 19 · Angular 20', 'Java · Python · Rust', 'TypeScript', 'Cloud Native'],
  },
} as const;

export type TitleVariantId = keyof typeof titleVariants;

/* ========================================================================== */
/*  EDIT BELOW THIS LINE                                                      */
/* ========================================================================== */

export const tailoring = {
  /**
   * 1. YOUR TITLE — pick one key from `titleVariants` above.
   *    This drives the hero heading, the tagline, the status badges,
   *    the browser tab title and the share/OG metadata.
   */
  activeTitle: 'lead-ai-fullstack' as TitleVariantId,

  /**
   * 2. HIDE TECHNOLOGIES — skill ids listed here disappear from the
   *    Skills Explorer, the constellation and the search index.
   *    Use this when a JD makes something irrelevant, or when you would
   *    rather not be asked about it.
   *
   *    e.g. hiddenSkills: ['opencv', 'c-cpp', 'activemq'],
   */
  hiddenSkills: [] as SkillId[],

  /**
   * 3. PIN TECHNOLOGIES — these sort to the front of the Skills Explorer
   *    so the first thing an interviewer sees matches their JD.
   *
   *    e.g. pinnedSkills: ['java', 'spring-boot', 'kafka', 'aws'],
   */
  pinnedSkills: [] as SkillId[],

  /**
   * 4. HIDE SECTIONS — remove a whole section from the page, the navbar
   *    and the command palette. 'overview' and 'contact' always render.
   *
   *    e.g. hiddenSections: ['discussion', 'constellation'],
   */
  hiddenSections: [] as SectionId[],

  /**
   * 5. FEATURED PROJECT ORDER — project ids, most relevant first.
   *    Leave empty to use the natural (most recent first) order.
   *
   *    e.g. projectOrder: ['gom', 'newton-ptm', 'newton-client-reporting'],
   */
  projectOrder: [] as string[],
} as const;

/* ----------------------------------------------------------------------------
 * NOTE — ADDING A BRAND-NEW TECHNOLOGY
 *
 * Open `src/data/skills.ts`, copy any existing entry, and change the fields.
 * The only required shape is:
 *
 *   {
 *     id: 'graphql',                    // unique, kebab-case
 *     name: 'GraphQL',                  // displayed
 *     category: 'Backend',              // must be one of `skillCategories`
 *     level: 'Strong',                  // Advanced | Strong | Working Knowledge
 *     context: 'One line on how you use it.',
 *     chain: ['GraphQL', 'Capability', 'Where you used it', 'Outcome'],
 *     projects: ['gom'],                // ids from projects.ts (may be empty)
 *     roles: ['julius-baer'],           // ids from experience.ts (may be empty)
 *     aliases: ['Apollo', 'schema'],    // extra search keywords (optional)
 *     core: true,                       // shows in the constellation (optional)
 *   }
 *
 * It appears immediately in the explorer, search, filters, constellation and
 * command palette. No component changes required.
 *
 * To REMOVE one permanently, delete the entry. To remove it just for this
 * application, add its id to `hiddenSkills` above.
 * -------------------------------------------------------------------------- */
