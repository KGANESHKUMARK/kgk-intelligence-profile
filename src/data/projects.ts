/**
 * PROJECTS — expanded from the "Project Summary" section of the resume.
 * Problem/solution framing is a restatement of documented work, not invention.
 * `link` is intentionally empty for client-confidential banking work.
 */

export type ProjectTag = 'Banking' | 'AI' | 'GenAI' | 'Full Stack' | 'Automation' | 'Platform' | 'Telecom' | 'Embedded';

export interface ArchitectureStep {
  label: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  company: string;
  companyId: string;
  period: string;
  category: string;
  tags: ProjectTag[];
  featured?: boolean;
  /** Shown on the collapsed card. */
  blurb: string;
  problem: string;
  solution: string;
  architecture: ArchitectureStep[];
  technologies: string[];
  impact: string[];
  concepts: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    id: 'gom',
    name: 'Global Output Management',
    subtitle: 'Event-driven client communications platform — Zurich',
    company: 'Bank of Julius Baer',
    companyId: 'julius-baer',
    period: 'Jan 2026 — Present',
    category: 'Banking Platform',
    tags: ['Banking', 'GenAI', 'AI', 'Platform', 'Full Stack'],
    featured: true,
    blurb:
      'Processes transactions, statements, trade confirmations, corporate actions and tax documents across five asset classes — with an agentic AI assistant resolving output failures.',
    problem:
      'A global private bank generates client-facing output — statements, trade confirmations, corporate actions, tax documents — across Equities, Securities, FX, Derivatives and Precious Metals. These flows originate in different upstream systems, use different formats, and any failure is visible to the client. Operations teams spend significant effort diagnosing why a document did not produce.',
    solution:
      'An event-driven output management platform. Events are consumed and validated from Kafka and IBM MQ under Avro-governed schemas, then business rules and transformations are applied through Java 25 / Spring Boot 3 microservices and Apache Flink on Ververica. Documents are generated via Quadient Scaler and archived to AWS OpsDocs. Snowflake, Snowpipe and Cortex AI provide ingestion, analytics and AI-assisted insight, while Claude AI handles intelligent document processing. An AI Output Failure Resolution Agent monitors processing exceptions, analyses root causes, validates business conditions, recommends or triggers remediation, and notifies operations.',
    architecture: [
      { label: 'Event Ingestion', detail: 'Kafka topics and IBM MQ queues carrying upstream banking events, schema-governed with Avro.' },
      { label: 'Validation & Rules', detail: 'Java 25 / Spring Boot 3 microservices apply business rules per asset class and product.' },
      { label: 'Stream Processing', detail: 'Apache Flink on Ververica handles stateful transformation and enrichment.' },
      { label: 'Document Generation', detail: 'Quadient Scaler renders statements, confirmations and tax documents.' },
      { label: 'Storage & Archival', detail: 'AWS OpsDocs for durable, auditable document retention.' },
      { label: 'Data & AI Layer', detail: 'Snowpipe ingestion into Snowflake; Cortex AI and Claude AI for insight and document understanding.' },
      { label: 'Agentic Operations', detail: 'AI Output Failure Resolution Agent triages exceptions and drives remediation workflows.' },
      { label: 'Delivery', detail: 'Publishing to email, e-post and notification channels; React 19 console for operations.' },
    ],
    technologies: [
      'Java 25',
      'Spring Boot 3',
      'Microservices',
      'Kafka',
      'IBM MQ',
      'Avro',
      'Apache Flink',
      'Ververica',
      'Snowflake',
      'Snowpipe',
      'Snowflake Cortex AI',
      'Claude AI',
      'Agentic AI',
      'RAG',
      'LLM',
      'AWS',
      'Kubernetes',
      'Docker',
      'Oracle',
      'Flyway',
      'React 19',
      'Quadient Scaler',
      'AWA',
      'REST APIs',
    ],
    impact: [
      'Single platform covering client output across five asset classes.',
      'Agentic AI assistant shifts failure handling from manual triage to guided remediation.',
      'AI-assisted analytics available directly over governed Snowflake data.',
    ],
    concepts: [
      'Event-driven architecture',
      'Schema governance & compatibility',
      'Stateful stream processing',
      'Agentic AI operations',
      'Document lifecycle & archival',
      'Multi-channel delivery',
    ],
  },
  {
    id: 'newton-performance',
    name: 'Newton Performance Product',
    subtitle: 'Investment performance returns on Aladdin',
    company: 'Bank of New York',
    companyId: 'bny',
    period: 'Aug 2020 — Jan 2026',
    category: 'Capital Markets',
    tags: ['Banking', 'AI', 'Full Stack'],
    featured: true,
    blurb:
      'Generates investment performance returns from portfolio and accounting data for segregated and pooled clients — daily, monthly and attribution.',
    problem:
      'Investment performance has to be calculated consistently from portfolio accounting data for both segregated and pooled clients, and published on daily, monthly and attribution cycles. The calculation must be correct, explainable and repeatable, because the numbers feed client-facing reporting and investment decisions.',
    solution:
      'Performance applications consume all portfolio accounting data for segregated and pooled clients and publish daily, monthly and attribution calculation returns. On top of this, predictive analytics tooling was architected for market-trend prediction, and LLM-based AI chatbots were integrated with the enterprise data pipelines so users could interrogate performance data conversationally.',
    architecture: [
      { label: 'Portfolio Accounting Feed', detail: 'Accounting data for segregated and pooled client portfolios.' },
      { label: 'Ingestion', detail: 'Kafka and Apache Camel routes into the performance domain.' },
      { label: 'Calculation Engine', detail: 'Java / Spring Boot services computing daily, monthly and attribution returns.' },
      { label: 'Persistence', detail: 'Oracle for transactional state; Snowflake for analytical access.' },
      { label: 'Predictive Analytics', detail: 'TensorFlow models for market-trend prediction (80% accuracy).' },
      { label: 'Conversational Layer', detail: 'LLM-based chatbots wired into enterprise data pipelines.' },
      { label: 'Publication', detail: 'Returns published downstream to reporting and client channels.' },
    ],
    technologies: [
      'Java 21',
      'Spring Boot',
      'Microservices',
      'Oracle',
      'Snowflake',
      'Snowpipe',
      'Cortex AI',
      'Kafka',
      'Apache Camel',
      'Angular 14',
      'AWS',
      'Docker',
      'Python',
      'TensorFlow',
      'Airflow',
      'MLflow',
      'Grafana',
      'AppDynamics',
      'SonarQube',
    ],
    impact: [
      'Predictive analytics tool for market trends reached an 80% accuracy rate, informing strategic investments.',
      'LLM chatbots gave business users direct conversational access to performance data.',
      'Daily, monthly and attribution returns published for segregated and pooled clients.',
    ],
    concepts: [
      'Portfolio accounting data models',
      'Return attribution',
      'Batch + streaming hybrid processing',
      'Time-series prediction',
      'Enterprise data pipeline integration',
    ],
  },
  {
    id: 'newton-client-reporting',
    name: 'Newton Client Reporting',
    subtitle: 'NLP + RAG client reporting on Aladdin',
    company: 'Bank of New York',
    companyId: 'bny',
    period: 'Aug 2020 — Jan 2026',
    category: 'AI / Capital Markets',
    tags: ['Banking', 'AI', 'GenAI', 'Full Stack'],
    featured: true,
    blurb:
      'NLP-driven client reporting built on a LangChain + FAISS RAG architecture, with an NPF chatbot that cut client service response times by 60%.',
    problem:
      'Client service teams needed answers from a large and fragmented reporting estate. Finding the right report, understanding the right figure and responding to a client took too long, and the underlying data carried redundancy that degraded accuracy.',
    solution:
      'An NLP-driven Client Reporting System built on LangChain with a FAISS vector store for retrieval-augmented generation, so answers are grounded in the bank\'s own reporting content. Alongside it, an NPF chatbot using NLP handles client service queries. Data preprocessing strategies reduced redundancy, improved collection methods increased accuracy, clustering algorithms improved customer segmentation, and the existing recommendation system was enhanced.',
    architecture: [
      { label: 'Document & Data Sources', detail: 'Reporting content and enterprise data across the Newton estate.' },
      { label: 'Preprocessing', detail: 'Redundancy reduction, improved collection methods, cleaning and chunking.' },
      { label: 'Embedding & Index', detail: 'FAISS vector index over embedded reporting knowledge.' },
      { label: 'Retrieval', detail: 'Top-k similarity retrieval with LangChain retrievers.' },
      { label: 'Generation', detail: 'LLM answers grounded in retrieved bank-owned context.' },
      { label: 'NPF Chatbot', detail: 'NLP interface serving client service teams directly.' },
      { label: 'ML Services', detail: 'Clustering for segmentation, recommendation enhancement, reinforcement learning.' },
    ],
    technologies: [
      'Python',
      'LangChain',
      'FAISS',
      'RAG',
      'LLM',
      'NLP',
      'SpaCy',
      'NLTK',
      'TensorFlow',
      'PyTorch',
      'Keras',
      'Scikit-learn',
      'PySpark',
      'Databricks',
      'Airflow',
      'MLflow',
      'AutoGen',
      'CrewAI',
      'Hugging Face',
      'Java 21',
      'Spring Boot',
      'Angular 14',
      'Snowflake',
      'Oracle',
      'AWS',
      'Docker',
    ],
    impact: [
      'NPF chatbot improved client service response times by 60%.',
      'Enhanced recommendation system increased user interaction rates by 20%.',
      'Reinforcement learning algorithms achieved a 95% success rate in dynamic environments.',
      'Clustering algorithms improved customer segmentation; preprocessing reduced data redundancy.',
    ],
    concepts: [
      'Retrieval-Augmented Generation',
      'Vector search & embeddings',
      'Chunking strategy',
      'Grounding & hallucination control',
      'Customer segmentation',
      'Recommendation systems',
      'Reinforcement learning',
    ],
  },
  {
    id: 'newton-ptm',
    name: 'Newton Portfolio Transaction Management',
    subtitle: 'Rust transaction processing and reporting on Aladdin',
    company: 'Bank of New York',
    companyId: 'bny',
    period: 'Aug 2020 — Jan 2026',
    category: 'Capital Markets',
    tags: ['Banking', 'Platform', 'Automation'],
    featured: true,
    blurb:
      'A Rust service managing and analysing financial portfolios — transaction processing, scheduled operations, financial reports and REST APIs, with Kafka streaming.',
    problem:
      'Portfolio transaction data needed to be processed reliably and at volume, turned into financial reports, and exposed to other systems — with periodic operations running on schedule and enough test coverage to trust the numbers.',
    solution:
      'A Rust-based solution for managing and analysing financial portfolios. It processes transaction data, generates financial reports and exposes REST APIs for integration. Kafka provides real-time streaming, cron-style schedulers drive periodic operations, and comprehensive testing underpins reliability and scalability. SQL schemas were designed for the transaction and reporting model, and CI/CD pipelines with Sonar-Rust and cargo-tarpaulin enforce quality.',
    architecture: [
      { label: 'Kafka Streams', detail: 'Real-time transaction events consumed through RdKafka.' },
      { label: 'Async Runtime', detail: 'Tokio drives concurrent processing; Serde handles serialisation.' },
      { label: 'Transaction Processing', detail: 'Portfolio transaction validation, enrichment and persistence.' },
      { label: 'Scheduler', detail: 'Cron schedulers trigger periodic reporting and reconciliation operations.' },
      { label: 'Reporting', detail: 'Financial reports generated to PDF and Excel via pdf-create and excel-rs.' },
      { label: 'REST APIs', detail: 'Integration surface for downstream consumers.' },
      { label: 'Quality Gates', detail: 'Sonar-Rust, cargo-tarpaulin coverage and CI/CD on GitLab.' },
    ],
    technologies: [
      'Rust',
      'Tokio',
      'Serde',
      'Serde-JSON',
      'Cargo',
      'RdKafka',
      'Kafka',
      'REST API',
      'Oracle',
      'Cron Schedulers',
      'pdf-create',
      'excel-rs',
      'GitLab',
      'SonarQube',
      'Sonar-Rust',
      'cargo-tarpaulin',
      'Python',
      'NumPy',
      'Pandas',
      'TensorFlow',
      'LSTM',
      'NLP',
    ],
    impact: [
      'Memory-safe, high-throughput transaction processing for portfolio data.',
      'Financial reports produced on schedule with automated periodic operations.',
      'REST integration surface consumed by downstream Newton systems.',
    ],
    concepts: [
      'Event streaming & consumer groups',
      'Async concurrency (Tokio)',
      'Idempotent processing',
      'Scheduled batch operations',
      'SQL schema design',
      'Coverage-gated CI/CD',
    ],
  },
  {
    id: 'verizon-xo',
    name: 'Verizon XO Migration — BGW UUI 3.0',
    subtitle: 'Cloud-native migration of telecom logical inventory',
    company: 'Cognizant Technology Solutions',
    companyId: 'cognizant',
    period: 'Aug 2019 — Aug 2020',
    category: 'Telecom OSS',
    tags: ['Telecom', 'Platform', 'Full Stack'],
    blurb:
      'Migrated the entire logical inventory estate into Broadband Gateway and moved it to a cloud-native microservice architecture.',
    problem:
      'Verizon sells network capacity to enterprises. Telecom switching equipment, the cables connecting it, patch panels and the physical sites they live in all had to be represented as logical inventory — and the existing estate needed to move into Broadband Gateway.',
    solution:
      'The entire logical inventory dataset was migrated to BGW, and the Verizon Rapid Delivery interface was built for creating third-party orders through the XO workflow. The logical inventory systems were migrated to a cloud-native microservice architecture running on Docker and Kubernetes.',
    architecture: [
      { label: 'Legacy Inventory', detail: 'Existing logical inventory across switching equipment, cables, patch panels and sites.' },
      { label: 'Migration Layer', detail: 'Data migration into the Broadband Gateway model.' },
      { label: 'Microservices', detail: 'Spring Boot services replacing monolithic inventory handling.' },
      { label: 'Rapid Delivery Interface', detail: 'Third-party order creation driving the XO workflow.' },
      { label: 'UI', detail: 'React JS and Angular 6+ front-end for inventory and ordering.' },
      { label: 'Runtime', detail: 'Docker and Kubernetes on AWS.' },
    ],
    technologies: [
      'Java 8',
      'React JS',
      'Angular 6+',
      'Spring Boot',
      'Microservices',
      'AWS',
      'Docker',
      'Kubernetes',
      'SQL',
      'GitLab',
      'Jenkins',
      'Jest',
      'Jasmine',
      'Karma',
      'Agile',
    ],
    impact: [
      'Logical inventory systems migrated to a cloud-native microservice architecture.',
      'Rapid Delivery interface enabled third-party order processing in the XO workflow.',
    ],
    concepts: ['Legacy migration', 'Microservice decomposition', 'Domain modelling', 'Order workflow orchestration'],
  },
  {
    id: 'verizon-bgw',
    name: 'Verizon Broadband Gateway — UUI 2.0',
    subtitle: 'Ring and Mesh algorithms for Layer-1 OSS',
    company: 'Cognizant Technology Solutions',
    companyId: 'cognizant',
    period: 'Jul 2016 — Aug 2019',
    category: 'Telecom OSS',
    tags: ['Telecom', 'Full Stack'],
    blurb:
      'Developed Ring and Mesh network algorithms for Verizon Business OSS, covering Layer-1 inventory, topology building and capacity activation.',
    problem:
      'Broadband Gateway is the OSS for Verizon Business managing Layer-1 inventory and provisioning. Building network topology and activating capacity for customer circuits required algorithmic pathfinding across ring and mesh network structures.',
    solution:
      'Ring and Mesh algorithms were designed and implemented within the application to build topology and activate capacity for customer circuits, backed by a Spring MVC service layer and a JavaScript/jQuery front-end.',
    architecture: [
      { label: 'Layer-1 Inventory', detail: 'Physical network elements, circuits and capacity records.' },
      { label: 'Topology Engine', detail: 'Ring and Mesh algorithms building network topology.' },
      { label: 'Provisioning', detail: 'Capacity activation for customer circuits.' },
      { label: 'Service Layer', detail: 'Spring MVC with JDBC persistence, documented via Swagger.' },
      { label: 'UI', detail: 'JavaScript, jQuery, HTML5 and CSS3 operator interface.' },
    ],
    technologies: [
      'Core Java',
      'Spring MVC',
      'JavaScript',
      'jQuery',
      'HTML5',
      'CSS3',
      'SQL',
      'JDBC',
      'Jenkins',
      'SonarQube',
      'Stash',
      'Swagger',
      'Jira',
    ],
    impact: [
      'Ring and Mesh algorithms enabled topology building and capacity activation for customer circuits.',
    ],
    concepts: ['Graph algorithms', 'Network topology modelling', 'Provisioning workflows', 'OSS domain design'],
  },
  {
    id: 'car-dvr',
    name: 'Car Digital Video Recording',
    subtitle: 'DVR · SWED · MERDS — live tracking and streaming',
    company: 'Oviya Technologies Pvt Ltd',
    companyId: 'oviya',
    period: 'Jun 2013 — Jul 2016',
    category: 'Embedded / Automotive',
    tags: ['Embedded', 'Full Stack', 'Automation'],
    blurb:
      'In-vehicle video recording with live tracking and streaming — location data stored via REST APIs, processed with ActiveMQ and displayed on a live map.',
    problem:
      'Vehicles needed continuous video recording plus live position tracking, with both the footage and the location trail available to a remote operator in real time.',
    solution:
      'Live vehicle tracking and video streaming were implemented, storing location data via REST APIs and processing it asynchronously with ActiveMQ, with real-time tracking and video rendered on a map interface. The stack spanned embedded Qt on Ubuntu Linux, Android, and a Java/J2EE web tier.',
    architecture: [
      { label: 'In-Vehicle Device', detail: 'Qt-Embedded 4.3 on Ubuntu Linux capturing video and GPS.' },
      { label: 'Ingestion APIs', detail: 'REST web services storing location data.' },
      { label: 'Async Processing', detail: 'ActiveMQ decoupling telemetry ingestion from processing.' },
      { label: 'Persistence', detail: 'MySQL, SQLite and Oracle stores.' },
      { label: 'Operator UI', detail: 'AngularJS map interface with real-time tracking and video.' },
    ],
    technologies: [
      'Java',
      'J2EE',
      'Spring MVC',
      'Hibernate',
      'REST Web Services',
      'ActiveMQ',
      'AngularJS',
      'Angular UI',
      'HTML5',
      'CSS',
      'JSP',
      'Apache Tomcat 8',
      'Android Studio',
      'Gradle',
      'MySQL',
      'SQLite',
      'Oracle',
      'C',
      'C++',
      'Qt-Embedded 4.3',
      'Ubuntu Linux',
    ],
    impact: ['Delivered DVR, SWED and MERDS products with live tracking and streaming.'],
    concepts: ['Embedded systems', 'Real-time telemetry', 'Async message processing', 'Geospatial visualisation'],
  },
];

export const projectFilters: (ProjectTag | 'All')[] = [
  'All',
  'Banking',
  'AI',
  'GenAI',
  'Full Stack',
  'Automation',
  'Platform',
  'Telecom',
  'Embedded',
];

export const featuredProjects = projects.filter((p) => p.featured);
