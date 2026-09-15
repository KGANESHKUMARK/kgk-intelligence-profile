/**
 * CHANGELOG — release history for the Engineering Intelligence Profile.
 *
 * This is the single source of truth for "what shipped, and when".
 * Add a new entry at the TOP of the array whenever you push a release.
 * The UI renders the list verbatim — no component edits required.
 *
 * Entry shape:
 *   {
 *     version: '1.4.0',                 // semver-ish, displayed
 *     date: '2026-09-15',               // ISO date, displayed as rendered
 *     title: 'Short release title',     // one line, what this release is
 *     summary: 'Longer paragraph ...',  // optional, shown under the title
 *     type: 'feature',                  // feature | fix | content | infra
 *     changes: [                        // bullet list of what changed
 *       'Added ...',
 *       'Fixed ...',
 *     ],
 *     commit?: 'a72451a',               // optional short SHA, links to GitHub
 *   }
 *
 * `type` drives the accent colour and the icon. Keep entries honest —
 * this is a public record of what the site actually does.
 */

export type ChangeType = 'feature' | 'fix' | 'content' | 'infra';

export interface ChangeEntry {
  version: string;
  date: string;
  title: string;
  summary?: string;
  type: ChangeType;
  changes: string[];
  commit?: string;
}

export const changelog: ChangeEntry[] = [
  {
    version: '1.5.0',
    date: '2026-09-16',
    title: 'Kafka Engineering Lab — Learning Hub Module 2',
    summary:
      'Full Kafka module added to the Learning Hub — topics, interview questions, glossary, visuals, and a dedicated home page. The registry is now multi-technology aware; Java and Kafka share the same topic, question, and visual engines.',
    type: 'feature',
    changes: [
      'New Kafka module: 13 fully-built topics across Core, Producer, Consumer, Delivery Guarantees, Infrastructure, and Ecosystem.',
      'New interview question bank: 9 questions from intermediate to architect level — covering ordering, exactly-once, rebalancing, Avro, consumer lag, and partition design.',
      'New Kafka glossary: 12 terms with plain-English and technical definitions.',
      'New visuals: Kafka cluster architecture, consumer group partition assignment, and producer send lifecycle.',
      'KafkaHome page with progress tracking, category explorer, bookmarks, and production context note.',
      'Registry updated to multi-technology aware: getTopic, getQuestion, topicRoute, glossaryByTechnology all resolve across Java and Kafka.',
      'All existing pages (TopicPage, CategoryPage, InterviewPractice, Flashcards, GlossaryPage) now accept a technology prop — breadcrumbs, filters, and back-links adapt automatically.',
      'Kafka routes wired: /learning/kafka, /learning/kafka/topic/:id, /learning/kafka/interview, /learning/kafka/flashcards, /learning/kafka/glossary.',
      'LearningHome marks Kafka as available; JavaHome scope note updated.',
    ],
  },
  {
    version: '1.4.0',
    date: '2026-09-15',
    title: 'Resume alignment — September 2026 QR edition',
    summary:
      'Synced every data-driven surface with the updated resume PDF, including new GenAI, backend, data and DevOps technologies.',
    type: 'content',
    changes: [
      'Replaced public resume PDF with the QR edition (LinkedIn QR embedded).',
      'Added GenAI skills: Amazon Bedrock, Titan, MCP, AI Guardrails, AIops, LLMOps.',
      'Added backend skills: Thymeleaf, Flask, Django, Zafire, Harness, Python 3.13.',
      'Added data skill: Tableau. Added DevOps skill: GitHub Copilot.',
      'Wired Julius Baer experience and GOM project with the new technology list.',
      'Wired BNY experience and Newton Client Reporting / Newton Performance projects.',
      'Updated Capability Radar and Tech Stack by Domain tabs.',
      'Updated Event-Driven architecture diagram node to reflect Bedrock + Guardrails + MCP.',
    ],
    commit: 'a72451a',
  },
  {
    version: '1.3.0',
    date: '2026-09-06',
    title: 'Java Learning Hub',
    summary:
      'A code-split learning experience for Java and AI interview prep, with data-driven content, visual tools and interview practice.',
    type: 'feature',
    changes: [
      'Added Java Learning Hub at /learning with data-driven topic pages.',
      'Interview practice mode with question cards and flashcards.',
      'Visual quizzes and a Java versions reference.',
      'Mounted as a lazy route so the main profile never downloads it.',
    ],
    commit: '550f056',
  },
  {
    version: '1.2.2',
    date: '2026-09-06',
    title: 'Collapsible Conversation Starters',
    type: 'fix',
    changes: ['Made the "Ask Me About" chips collapsible so the section stays compact on long lists.'],
    commit: '3d8373a',
  },
  {
    version: '1.2.1',
    date: '2026-09-06',
    title: 'Section-level analytics events',
    type: 'infra',
    changes: ['Added custom analytics events per section so engagement is measurable per area, not just per page.'],
    commit: '1aef2ab',
  },
  {
    version: '1.2.0',
    date: '2026-09-06',
    title: 'Recommendations, JD Match, Template Offer',
    summary:
      'Three new sections for social proof, job-description tailoring, and a reusable template offer.',
    type: 'feature',
    changes: [
      'Added Recommendations section with testimonial cards.',
      'Added JD Match section to score a pasted job description against the profile.',
      'Added Template Offer section for visitors who want the same structure.',
      'Integrated Vercel Analytics.',
    ],
    commit: '7556580',
  },
  {
    version: '1.1.1',
    date: '2026-08-31',
    title: 'Certifications tab fix',
    type: 'fix',
    changes: ['Fixed the Certifications tab being clipped behind the Interview Mode button on smaller screens.'],
    commit: '562a77d',
  },
  {
    version: '1.1.0',
    date: '2026-08-23',
    title: 'Identity and routing corrections',
    type: 'fix',
    changes: [
      'Updated name to Ganeshkumar Karuppaiah and email to kganeshkumarr@hotmail.com.',
      'Fixed vercel.json route patterns and updated canonical URLs to the live domain.',
    ],
    commit: '57e5e63',
  },
  {
    version: '1.0.0',
    date: '2026-08-23',
    title: 'Initial release — Engineering Intelligence Profile',
    summary:
      'The first public release of the interactive resume and engineering intelligence profile.',
    type: 'feature',
    changes: [
      'Hero with capability radar and professional summary.',
      'Skills Explorer with category filters, search and technology constellation.',
      'Experience timeline, banking spotlight and project explorer.',
      'AI Engineering deep-dive with reference architecture and failure-mode catalogue.',
      'Architecture Playground with interactive diagrams.',
      'Certifications timeline, Ask Me About, Technical Discussion, Interview Mode.',
      'Print-only resume view and downloadable PDF.',
    ],
    commit: '1abdd16',
  },
];

/** GitHub commit URL for a short SHA — used by the changelog UI. */
export function commitUrl(sha?: string): string | undefined {
  if (!sha) return undefined;
  return `https://github.com/KGANESHKUMARK/kgk-intelligence-profile/commit/${sha}`;
}
