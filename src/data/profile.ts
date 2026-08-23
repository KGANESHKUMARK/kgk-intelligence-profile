/**
 * PROFILE — single source of truth for identity, contact and positioning.
 * Everything here is derived from Lead_AI_FullStack_GaneshkumarK_16082026.pdf.
 * Edit this file to update the site; no component hard-codes these values.
 *
 * The job title, tagline and status badges come from `src/config/tailoring.ts`
 * so you can re-position the whole profile against a job description by
 * changing one line.
 */

import { tailoring, titleVariants } from '../config/tailoring';

const positioning = titleVariants[tailoring.activeTitle];

export interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
  phone: string;
}

export interface SnapshotItem {
  label: string;
  value: string;
  detail: string;
  tone: 'accent' | 'ai' | 'risk' | 'neutral';
  icon: string;
}

export interface ValueProp {
  title: string;
  body: string;
  icon: string;
  tone: 'accent' | 'ai' | 'risk';
}

export const profile = {
  name: 'Ganesh Kumar',
  /** Name exactly as it appears on the resume / official documents. */
  legalName: 'Ganeshkumar K',

  /** Driven by tailoring.activeTitle — change it in src/config/tailoring.ts. */
  title: positioning.title,
  tagline: positioning.tagline,

  altTitles: ['Senior Technical Lead', 'Lead AI Full Stack Developer'],

  summary:
    'Programming professional with 13+ years designing and operating distributed systems for banking and capital markets. Specialised in Large Language Models, Generative AI and cloud-based AI pipelines across AWS, Azure and GCP — covering the full lifecycle from data ingestion and fine-tuning through RAG, evaluation and production deployment. Currently leading engineering on an event-driven Global Output Management platform at Bank of Julius Baer.',

  /** The 60-second version, used in Interview Mode. */
  elevator:
    "I'm a Lead AI and Full Stack Engineer with 13+ years across banking and capital markets. Today I'm a Senior Technical Lead at Bank of Julius Baer in Singapore, building an event-driven Global Output Management platform on Java 25, Spring Boot 3, Kafka, Flink and Snowflake — including an Agentic AI assistant that triages output-processing failures. Before that I spent five and a half years at Bank of New York as Lead AI Full Stack Developer on the Newton/Aladdin estate: investment performance calculation, client reporting with a LangChain + FAISS RAG chatbot, and a Rust transaction-management service. I hold an M.Tech in AI/ML from BITS Pilani and I won BNY's Hackcelerator 2.0 AI Innovator Award for the Portfolio-IQ chatbot.",

  yearsExperience: '13+',
  location: 'Singapore',
  currentCompany: 'Bank of Julius Baer',
  currentRole: 'Senior Technical Lead | Full Stack Engineer',
  availability: 'Open to Lead / Principal engineering conversations',

  domains: ['Banking', 'Capital Markets', 'Wealth Management', 'Financial Services', 'Telecom OSS'],

  /** Small status chips rendered under the hero heading (from tailoring). */
  badges: positioning.badges as readonly string[],

  leadership: {
    current: 'Leading a 6-member engineering team',
    previous: 'Previously managed a 16-member engineering team delivering scalable enterprise applications',
  },

  social: {
    github: 'https://github.com/KGANESHKUMARK/',
    linkedin: 'https://www.linkedin.com/in/kgk/',
    email: 'KGaneshkumarr@hotmail.com',
    phone: '+65-98918619',
  } satisfies SocialLinks,

  /** Filename of the PDF served from /public. */
  resumeFile: '/Lead_AI_FullStack_GaneshkumarK.pdf',
} as const;

/** Compact "Interview Snapshot" grid directly under the hero. */
export const snapshot: SnapshotItem[] = [
  {
    label: 'Engineering',
    value: '13+ Years',
    detail: 'Distributed systems, enterprise delivery, technical leadership',
    tone: 'accent',
    icon: 'Activity',
  },
  {
    label: 'Domain',
    value: 'Banking & Capital Markets',
    detail: 'Julius Baer · BNY · Equities, FX, Derivatives, Precious Metals',
    tone: 'accent',
    icon: 'Landmark',
  },
  {
    label: 'Primary Focus',
    value: 'AI + Full Stack',
    detail: 'Agentic AI, RAG and LLM systems on production banking platforms',
    tone: 'ai',
    icon: 'Sparkles',
  },
  {
    label: 'Backend',
    value: 'Java · Python · Rust',
    detail: 'Java 25, Spring Boot 3, Microservices, Rust/Tokio, FastAPI',
    tone: 'neutral',
    icon: 'Server',
  },
  {
    label: 'Frontend',
    value: 'React · Angular · TypeScript',
    detail: 'React 19, Angular 20, ES6, responsive enterprise UIs',
    tone: 'neutral',
    icon: 'LayoutGrid',
  },
  {
    label: 'Cloud & Platform',
    value: 'AWS · Kubernetes · Docker',
    detail: 'AWS, Azure, GCP, Kubernetes, Helm, ArgoCD, Terraform, CI/CD',
    tone: 'neutral',
    icon: 'Cloud',
  },
  {
    label: 'AI',
    value: 'LLM · RAG · Agents',
    detail: 'Claude, Cortex AI, LangChain, AutoGen, CrewAI, FAISS, Hugging Face',
    tone: 'ai',
    icon: 'BrainCircuit',
  },
  {
    label: 'Data',
    value: 'Snowflake · Oracle · Kafka',
    detail: 'Snowpipe, Cortex AI, PostgreSQL, Airflow, Flink, Databricks',
    tone: 'neutral',
    icon: 'Database',
  },
];

/** "What I Bring" — six capability cards. */
export const valueProps: ValueProp[] = [
  {
    title: 'Enterprise Engineering',
    body: 'Event-driven platforms that process transactions, statements and trade confirmations at bank scale — designed for throughput, auditability and recovery.',
    icon: 'Boxes',
    tone: 'accent',
  },
  {
    title: 'Banking Domain',
    body: 'Investment performance returns, portfolio accounting, client reporting and transaction workflows across Equities, Securities, FX, Derivatives and Precious Metals.',
    icon: 'Landmark',
    tone: 'accent',
  },
  {
    title: 'AI Engineering',
    body: 'LLMs, RAG, agentic operations assistants and the full ML lifecycle — ingestion, fine-tuning, evaluation and production deployment on regulated data.',
    icon: 'BrainCircuit',
    tone: 'ai',
  },
  {
    title: 'Full Stack',
    body: 'Java and Python services, Rust for latency-sensitive processing, React and Angular front-ends, REST APIs, SQL schema design and cloud infrastructure.',
    icon: 'Layers',
    tone: 'accent',
  },
  {
    title: 'Platform Engineering',
    body: 'Docker, Kubernetes, Helm, ArgoCD, Terraform, GitLab CI and Jenkins pipelines, with SonarQube, Veracode, Grafana, Splunk and AppDynamics for quality and observability.',
    icon: 'Container',
    tone: 'accent',
  },
  {
    title: 'Technical Leadership',
    body: 'Currently leading a 6-member team; previously managed 16 engineers. Requirement analysis, architecture design, code review and delivery accountability.',
    icon: 'Users',
    tone: 'risk',
  },
];

export interface EducationItem {
  degree: string;
  institution: string;
  score: string;
  year: string;
}

export const education: EducationItem[] = [
  { degree: 'M.Tech. in AI & ML', institution: 'BITS Pilani', score: '81%', year: '2025' },
  { degree: 'B.E. in Electronics & Communication', institution: 'Anna University', score: '73%', year: '2013' },
  { degree: 'HSSC', institution: 'Higher Secondary', score: '87%', year: '2009' },
  { degree: 'SSLC', institution: 'Secondary School', score: '76.6%', year: '2007' },
];

export interface Award {
  title: string;
  detail: string;
  year: string;
  issuer: string;
}

export const awards: Award[] = [
  {
    title: 'BNY Hackcelerator 2.0 — AI Innovator Award',
    detail: 'Portfolio-IQ chatbot',
    year: '2024',
    issuer: 'Bank of New York',
  },
];
