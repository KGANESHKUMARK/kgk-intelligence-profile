/**
 * EXPERIENCE — career timeline, taken directly from the resume PDF.
 * Achievements are verbatim-derived; no metrics have been invented.
 */

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  /** Human-readable duration shown on the collapsed card. */
  period: string;
  current?: boolean;
  domain: string;
  /** One-line framing of the role. */
  summary: string;
  /** 3-5 technologies shown while collapsed. */
  headlineTech: string[];
  technologies: string[];
  responsibilities: string[];
  achievements: string[];
  /** Project ids from projects.ts. */
  projects: string[];
}

export const experience: Experience[] = [
  {
    id: 'julius-baer',
    company: 'Bank of Julius Baer',
    role: 'Senior Technical Lead | Full Stack Engineer',
    location: 'One Changi City, Singapore',
    start: '2026-01',
    end: 'Present',
    period: 'Jan 2026 — Present',
    current: true,
    domain: 'Private Banking & Wealth Management',
    summary:
      'Leading engineering on an event-driven Global Output Management platform spanning Equities, Securities, FX, Derivatives and Precious Metals — with an agentic AI assistant for output-failure resolution.',
    headlineTech: ['Java 25', 'Spring Boot 3', 'Kafka', 'Snowflake Cortex AI', 'Kubernetes'],
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
      'Event-Driven Architecture',
    ],
    responsibilities: [
      'Lead a 6-member engineering team across backend, front-end and AI workstreams.',
      'Design event ingestion and validation from Kafka and IBM MQ with Avro-governed contracts.',
      'Apply business rules and transformations using Java 25, Spring Boot 3 and Apache Flink on Ververica.',
      'Own document generation via Quadient Scaler and storage/archival on AWS OpsDocs.',
      'Integrate Snowflake, Snowpipe and Cortex AI for ingestion, analytics and AI-assisted insight.',
      'Deliver downstream publishing and client delivery across email, e-post and notification channels.',
    ],
    achievements: [
      'Built an event-driven Global Output Management platform processing transactions, statements, trade confirmations, corporate actions, tax documents and client communications.',
      'Implemented an AI Output Failure Resolution Agent — an agentic operations assistant on Claude AI and Snowflake Cortex that monitors output-processing exceptions, analyses root causes, validates business conditions, recommends or triggers remediation workflows and notifies operations teams.',
      'Integrated Claude AI / LLMs for intelligent document processing across multiple asset classes.',
    ],
    projects: ['gom'],
  },
  {
    id: 'bny',
    company: 'Bank of New York',
    role: 'Lead AI Full Stack Developer',
    location: 'Chennai, India',
    start: '2020-08',
    end: '2026-01',
    period: 'Aug 2020 — Jan 2026 · 5 yr 6 mo',
    domain: 'Capital Markets & Investment Management',
    summary:
      'Led AI and full-stack delivery across three products in the Newton / Aladdin estate: investment performance calculation, client reporting with an NLP + RAG chatbot, and a Rust-based portfolio transaction service.',
    headlineTech: ['Java 21', 'Python', 'Rust', 'LangChain + FAISS', 'Snowflake'],
    technologies: [
      'Java 21',
      'Spring Boot',
      'Microservices',
      'Angular 14',
      'Oracle',
      'Snowflake',
      'Snowpipe',
      'Cortex AI',
      'AWS',
      'Docker',
      'Kafka',
      'Apache Camel',
      'Rust',
      'Tokio',
      'Serde',
      'RdKafka',
      'Python',
      'TensorFlow',
      'PyTorch',
      'Keras',
      'Scikit-learn',
      'NLTK',
      'SpaCy',
      'OpenCV',
      'PySpark',
      'Jupyter',
      'Airflow',
      'MLflow',
      'FAISS',
      'LangChain',
      'AutoGen',
      'CrewAI',
      'Databricks',
      'Jest',
      'Cucumber',
      'TestCafe',
      'SonarQube',
      'Veracode',
      'GitLab',
      'Grafana',
      'AppDynamics',
    ],
    responsibilities: [
      'Architected predictive analytics tools and LLM-based AI chatbots integrated with enterprise data pipelines.',
      'Designed SQL schemas and financial reports for portfolio transaction data.',
      'Implemented CI/CD pipelines, conducted code reviews and enforced quality gates.',
      'Collaborated with data engineers and business analysts on requirement analysis and architecture design.',
      'Managed data preprocessing strategies and improved data collection methods.',
      'Mentored engineers and drove software best practices across the team.',
    ],
    achievements: [
      'Architected a predictive analytics tool for market-trend prediction achieving an 80% accuracy rate, informing strategic investment decisions.',
      'Architected an NPF chatbot using NLP that improved client service response times by 60%.',
      'Developed an NLP-driven Client Reporting System on a LangChain + FAISS RAG architecture.',
      'Enhanced an existing recommendation system, increasing user interaction rates by 20%.',
      'Implemented reinforcement learning algorithms achieving a 95% success rate in dynamic environments.',
      'Implemented clustering algorithms that improved customer segmentation.',
      'Won the BNY Hackcelerator 2.0 AI Innovator Award for the Portfolio-IQ chatbot (2024).',
      'Previously managed a 16-member engineering team delivering scalable enterprise applications.',
    ],
    projects: ['newton-performance', 'newton-client-reporting', 'newton-ptm'],
  },
  {
    id: 'cognizant',
    company: 'Cognizant Technology Solutions',
    role: 'Lead Full Stack Developer',
    location: 'Chennai, India',
    start: '2016-07',
    end: '2020-08',
    period: 'Jul 2016 — Aug 2020 · 4 yr 2 mo',
    domain: 'Telecom OSS — Verizon Business',
    summary:
      'Built and migrated Verizon Broadband Gateway, the OSS managing Layer-1 inventory and provisioning, then moved logical inventory to a cloud-native microservice architecture.',
    headlineTech: ['Java 8', 'React JS', 'Angular 6+', 'Spring Boot', 'Kubernetes'],
    technologies: [
      'Java 8',
      'Core Java',
      'React JS',
      'Angular 6+',
      'Spring Boot',
      'Spring MVC',
      'AWS',
      'Docker',
      'Kubernetes',
      'Microservices',
      'JavaScript',
      'jQuery',
      'HTML5',
      'CSS3',
      'SQL',
      'JDBC',
      'GitLab',
      'Jenkins',
      'Jest',
      'Jasmine',
      'Karma',
      'SonarQube',
      'Stash',
      'Swagger',
      'Jira',
      'Agile',
    ],
    responsibilities: [
      'Analysed existing functionality and developed the UI and REST web services for the application.',
      'Integrated REST APIs with the user interface.',
      'Designed and implemented the mesh network algorithm within the application.',
      'Implemented and tested JUnit, integration and regression test suites.',
      'Coordinated and code-reviewed for team members, resolving bug fixes on time.',
      'Handled onshore user interaction for major change implementation.',
    ],
    achievements: [
      'Migrated logical inventory systems to a cloud-native microservice architecture.',
      'Developed Ring and Mesh algorithms for Broadband Gateway, covering topology building and capacity activation for customer circuits.',
      'Delivered the Verizon Rapid Delivery interface for creating third-party orders in the XO workflow.',
    ],
    projects: ['verizon-xo', 'verizon-bgw'],
  },
  {
    id: 'oviya',
    company: 'Oviya Technologies Pvt Ltd',
    role: 'Software Developer',
    location: 'Bangalore, India',
    start: '2013-06',
    end: '2016-07',
    period: 'Jun 2013 — Jul 2016 · 3 yr 2 mo',
    domain: 'Automotive & Embedded Systems',
    summary:
      'Delivered in-vehicle digital video recording products with live tracking and streaming, spanning embedded Qt, Android and Java web services.',
    headlineTech: ['Java', 'J2EE', 'Spring MVC', 'ActiveMQ', 'Qt-Embedded'],
    technologies: [
      'Java',
      'J2EE',
      'Spring MVC',
      'Hibernate',
      'REST Web Services',
      'AngularJS',
      'Angular UI',
      'HTML5',
      'CSS',
      'JSP',
      'Swing',
      'Beans',
      'ActiveMQ',
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
    responsibilities: [
      'Implemented live vehicle tracking and video streaming.',
      'Stored location data via REST APIs and processed it with ActiveMQ.',
      'Displayed real-time tracking and video on a map interface.',
      'Played a major role in team story deliveries.',
    ],
    achievements: [
      'Delivered the DVR, SWED and MERDS car digital video recording products end to end.',
    ],
    projects: ['car-dvr'],
  },
];

/** Steps rendered in the Banking & Capital Markets flow visualisation. */
export interface BankingFlowStage {
  id: string;
  label: string;
  detail: string;
  tech: string[];
}

export const bankingFlow: BankingFlowStage[] = [
  {
    id: 'client',
    label: 'Client / Portfolio',
    detail: 'Segregated and pooled client portfolios across Equities, Securities, FX, Derivatives and Precious Metals.',
    tech: ['Aladdin', 'Newton'],
  },
  {
    id: 'transaction',
    label: 'Transaction Data',
    detail: 'Trades, corporate actions, statements and tax events arrive as governed events.',
    tech: ['Kafka', 'IBM MQ', 'Avro'],
  },
  {
    id: 'processing',
    label: 'Processing Services',
    detail: 'Validation, business rules and transformation across Java, Rust and Flink services.',
    tech: ['Java 25', 'Spring Boot 3', 'Rust', 'Apache Flink'],
  },
  {
    id: 'calculation',
    label: 'Performance Calculation',
    detail: 'Daily, monthly and attribution returns generated from portfolio accounting data.',
    tech: ['Java', 'Oracle', 'Apache Camel'],
  },
  {
    id: 'analytics',
    label: 'Analytics & AI',
    detail: 'Warehouse analytics, predictive models and Cortex AI insight over processed data.',
    tech: ['Snowflake', 'Snowpipe', 'Cortex AI', 'TensorFlow'],
  },
  {
    id: 'reporting',
    label: 'Reporting & Delivery',
    detail: 'Document generation and client delivery through email, e-post and notification channels.',
    tech: ['Quadient Scaler', 'AWS OpsDocs', 'React 19'],
  },
];
