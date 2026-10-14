import type { LearningVisual } from '../../types';

export const awsVisuals: LearningVisual[] = [
  {
    id: 'aws-compute-comparison',
    topicId: 'aws-compute',
    type: 'comparison',
    title: 'AWS Compute: EC2 vs ECS/EKS vs Lambda',
    description: 'Choosing the right abstraction layer for your workload',
    columns: [
      {
        label: 'EC2 + Auto Scaling',
        nodes: [
          { id: 'c1', label: 'Full OS control', description: 'Instance type, AMI, storage, networking — most flexibility.' },
          { id: 'c2', label: 'ASG for elastic fleets', description: 'Launch Templates + target tracking scaling policy.' },
          { id: 'c3', label: 'Spot Instances', description: '90% cost saving for batch/stateless (handle SIGTERM).' },
          { id: 'c4', label: 'You patch OS/runtime', description: 'SSM Patch Manager automates this in practice.' },
        ],
      },
      {
        label: 'ECS / EKS (Fargate)',
        nodes: [
          { id: 'ecs1', label: 'Container orchestration', description: 'No OS management. ECS = AWS-native, EKS = Kubernetes.' },
          { id: 'ecs2', label: 'Fargate = serverless nodes', description: 'Pay per task CPU/memory-second. No node patching.' },
          { id: 'ecs3', label: 'IRSA / ECS task roles', description: 'Per-service AWS IAM permissions. No hardcoded credentials.' },
          { id: 'ecs4', label: 'Best for microservices', description: 'ECS for simplicity; EKS for K8s ecosystem + portability.' },
        ],
      },
      {
        label: 'Lambda (Serverless)',
        nodes: [
          { id: 'l1', label: 'Event-driven, scales to zero', description: 'Pay per 100ms. No idle cost.' },
          { id: 'l2', label: 'Cold start mitigation', description: 'SnapStart (Java ~200ms), GraalVM native (~80ms).' },
          { id: 'l3', label: 'Best for async handlers', description: 'S3 triggers, SQS consumers, scheduled jobs, API backends.' },
          { id: 'l4', label: 'Limits: 15 min / 10 GB RAM', description: 'Not for long-running processes or stateful workloads.' },
        ],
      },
    ],
    memoryTip: 'More abstraction = less control but less ops. EC2 for control, containers for portability, Lambda for events.',
  },
  {
    id: 'aws-data-tier',
    topicId: 'aws-storage-db',
    type: 'comparison',
    title: 'AWS Data Services: Choose the Right Store',
    description: 'Data service selection by access pattern, scale, and consistency needs',
    columns: [
      {
        label: 'Relational (RDS / Aurora)',
        nodes: [
          { id: 'r1', label: 'ACID + SQL + joins', description: 'For complex relationships, transactions, reporting.' },
          { id: 'r2', label: 'Aurora = 6-copy replication', description: '30% faster than RDS, auto-scales storage.' },
          { id: 'r3', label: 'Multi-AZ + Read Replicas', description: 'Multi-AZ = sync failover. Read Replica = read scale.' },
          { id: 'r4', label: 'Aurora Serverless v2', description: 'Scales 0.5–128 ACUs in seconds. Ideal for variable load.' },
        ],
      },
      {
        label: 'NoSQL (DynamoDB)',
        nodes: [
          { id: 'd1', label: 'Single-digit ms at any scale', description: 'Design access patterns first — table follows query.' },
          { id: 'd2', label: 'Partition key = high cardinality', description: 'Uniform access avoids hot partitions + throttling.' },
          { id: 'd3', label: 'GSI for alternate queries', description: 'Projects copy of table with different key — extra cost.' },
          { id: 'd4', label: 'DynamoDB Streams + Lambda', description: 'Event-driven processing on table changes.' },
        ],
      },
      {
        label: 'Object / Cache (S3 + ElastiCache)',
        nodes: [
          { id: 's1', label: 'S3 = 11-nines durability', description: 'Virtually unlimited. Lifecycle to Glacier for compliance.' },
          { id: 's2', label: 'Presigned URLs', description: 'Time-limited direct client upload — no server as proxy.' },
          { id: 's3', label: 'ElastiCache Redis', description: 'Cache-aside, sessions, rate limiting, pub/sub.' },
          { id: 's4', label: 'RDS Proxy', description: 'Connection pooling for Lambda → RDS (avoids exhausting pool).' },
        ],
      },
    ],
    memoryTip: 'Relational = ACID + SQL. DynamoDB = huge scale + simple access. S3 = objects. ElastiCache = speed layer in front of DB.',
  },
  {
    id: 'aws-vpc-layout',
    topicId: 'aws-networking',
    type: 'architecture',
    title: 'Three-Tier VPC Architecture for Banking',
    description: 'Secure multi-AZ VPC with public ALB, private app and data tiers',
    nodes: [
      { id: 'internet', label: 'Internet', description: 'Route 53 → CloudFront → WAF (OWASP rules, rate limiting).' },
      { id: 'alb', label: 'ALB — Public Subnets', description: 'SG: inbound 443 from 0.0.0.0/0. WAF attached. Multi-AZ.' },
      { id: 'app', label: 'App Tier — Private Subnets', description: 'ECS/EKS tasks. SG: inbound 8080 from ALB SG only. NAT for egress.' },
      { id: 'db', label: 'Data Tier — Private Isolated', description: 'Aurora Multi-AZ + ElastiCache. SG: inbound 5432 from app SG only.' },
      { id: 'endpoints', label: 'VPC Endpoints', description: 'S3, DynamoDB (gateway), ECR, SSM, CloudWatch — no NAT cost.' },
    ],
    memoryTip: 'Public = ALB only. Private app = services. Private isolated = databases. VPC endpoints remove NAT cost for AWS-internal traffic.',
  },
  {
    id: 'aws-well-architected',
    topicId: 'aws-patterns',
    type: 'comparison',
    title: 'AWS Well-Architected Framework — 6 Pillars',
    description: 'Key concerns and primary AWS services for each pillar',
    columns: [
      {
        label: 'Ops Excellence & Security',
        nodes: [
          { id: 'o1', label: 'IaC — Terraform/CDK', description: 'All infrastructure version-controlled, reproducible, auditable.' },
          { id: 'o2', label: 'CI/CD + runbooks', description: 'Automated pipelines, game days, on-call readiness.' },
          { id: 'o3', label: 'Least privilege IAM', description: 'Roles not users. Per-service task roles. No long-lived keys.' },
          { id: 'o4', label: 'GuardDuty + SecurityHub', description: 'Threat detection + centralised compliance findings.' },
        ],
      },
      {
        label: 'Reliability & Performance',
        nodes: [
          { id: 'r1', label: 'Multi-AZ everywhere', description: 'ALB, ECS/EKS, Aurora — no single AZ as SPOF.' },
          { id: 'r2', label: 'Chaos Engineering (FIS)', description: 'Prove resilience before incidents prove it isn\'t there.' },
          { id: 'r3', label: 'Graviton3 instances', description: '20% cheaper + better perf for JVM/Go workloads.' },
          { id: 'r4', label: 'CloudFront + ElastiCache', description: 'CDN + in-memory caching for latency reduction.' },
        ],
      },
      {
        label: 'Cost & Sustainability',
        nodes: [
          { id: 'c1', label: 'Resource tagging strategy', description: 'Team + env + service tags → Cost Explorer attribution.' },
          { id: 'c2', label: 'Reserved Instances / Savings Plans', description: '40-72% saving on predictable, steady-state compute.' },
          { id: 'c3', label: 'Spot Instances', description: '90% saving for batch/stateless. Handle SIGTERM in 2 min.' },
          { id: 'c4', label: 'Cost Anomaly Detection', description: 'Alerts on unexpected spend before the month-end bill.' },
        ],
      },
    ],
    memoryTip: '6 pillars: Operational Excellence, Security, Reliability, Performance, Cost, Sustainability. All 6 — missing one is a red flag.',
  },
];
