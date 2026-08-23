/**
 * CERTIFICATIONS — exactly as listed on the resume.
 * No certificate IDs or credential URLs are invented; add them here if you
 * want them rendered (an "id" or "url" field will surface automatically).
 */

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
  /** What this credential actually demonstrates to an interviewer. */
  demonstrates: string;
  category: 'Cloud' | 'Data' | 'AI' | 'Database' | 'Language';
  tone: 'accent' | 'ai' | 'risk';
  icon: string;
  /** Optional — add your credential URL when you have it. */
  url?: string;
}

export const certifications: Certification[] = [
  {
    id: 'azure-architect',
    name: 'Microsoft Azure Solutions Architect Expert',
    issuer: 'Microsoft',
    demonstrates:
      'Expert-level cloud architecture — designing compute, storage, networking, identity and governance for enterprise workloads.',
    category: 'Cloud',
    tone: 'accent',
    icon: 'Cloud',
  },
  {
    id: 'snowpro',
    name: 'SnowPro Associate',
    issuer: 'Snowflake',
    demonstrates:
      'Snowflake platform fundamentals — warehouse design, data loading with Snowpipe, and governed access to analytical data.',
    category: 'Data',
    tone: 'accent',
    icon: 'Database',
  },
  {
    id: 'claude-vertex',
    name: 'Claude with Google Vertex AI',
    issuer: 'Google Cloud / Anthropic',
    demonstrates:
      'Deploying and operating Claude models on managed cloud infrastructure — the same stack used for production document processing.',
    category: 'AI',
    tone: 'ai',
    icon: 'BrainCircuit',
  },
  {
    id: 'aws-developer',
    name: 'AWS Developer Associate',
    issuer: 'Amazon Web Services',
    demonstrates:
      'Building, deploying and debugging cloud-native applications on AWS, including the SDK, deployment and security models.',
    category: 'Cloud',
    tone: 'accent',
    icon: 'Cloud',
  },
  {
    id: 'ocjp',
    name: 'Oracle Certified Java Professional (OCJP)',
    issuer: 'Oracle',
    demonstrates: 'Depth in the Java language and platform — the foundation under 13+ years of JVM engineering.',
    category: 'Language',
    tone: 'accent',
    icon: 'Coffee',
  },
  {
    id: 'oracle-dba',
    name: 'Oracle Database 10g & 11g Administrator Certified Professional',
    issuer: 'Oracle',
    demonstrates:
      'Database administration at professional level (OCA + OCP) — schema design, tuning, backup and recovery on the database still underpinning most banking estates.',
    category: 'Database',
    tone: 'accent',
    icon: 'Database',
  },
];
