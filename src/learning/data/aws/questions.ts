import type { InterviewQuestion } from '../../types';

const T = 'aws';

export const awsQuestions: InterviewQuestion[] = [
  {
    id: 'q-aws-lambda-cold-start',
    technology: T,
    question: 'What is a Lambda cold start, why does it affect Java, and how do you mitigate it?',
    category: 'Compute',
    difficulty: 'advanced',
    quickAnswer: 'Cold start = new execution environment initialisation. Java is slow (JVM startup + class loading). Fix: SnapStart, provisioned concurrency, or GraalVM native.',
    interviewAnswer: `A cold start occurs when Lambda creates a new execution environment — it provisions a Firecracker micro-VM, copies the deployment package, initialises the runtime, and runs your static initialisation code. For Java this includes JVM startup and class loading, which can take 5-10 seconds. Warm invocations reuse the environment (< 5ms). Mitigations: (1) Lambda SnapStart — snapshots the JVM after initialisation, restores from the snapshot on cold start, reducing Java cold starts to ~200ms. (2) Provisioned Concurrency — pre-warms N environments, guaranteed warm at cost. (3) GraalVM native image — no JVM, < 100ms cold start (but loses Spring reflection-heavy features without AOT). (4) Reduce package size — smaller JAR = faster deployment package download. (5) Minimise static initialisation — lazy-load heavy resources.`,
    detailedAnswer: `Lambda billing doesn't include cold start time — you're not charged for the initialisation phase. But API Gateway times out after 29 seconds, so a 10-second cold start consuming 19 of those 29 seconds is problematic. SnapStart works by taking a snapshot after INIT phase completion (after your @PostConstruct and ApplicationContext startup). Each invocation restores from the snapshot, bypassing JVM startup. Uniqueness per-snapshot: SnapStart generates a unique randomness seed per restore so crypto operations remain secure.`,
    seniorAnswer: `In production, I combine strategies: SnapStart for the Java function (cuts cold start 80%), provisioned concurrency=2 for the API endpoints that are latency-sensitive (auth, checkout), and a CloudWatch alarm + Lambda warmer for endpoints that would cold start after periods of inactivity. For internal background jobs (SQS triggers, S3 events) cold starts are acceptable — latency doesn't matter.`,
    keyTerms: ['cold start', 'SnapStart', 'provisioned concurrency', 'GraalVM', 'Firecracker', 'execution environment'],
    conceptsTested: ['Lambda internals', 'Java on serverless', 'Latency optimisation'],
    strongAnswerKeywords: ['SnapStart', 'provisioned concurrency', 'GraalVM', 'JVM startup', 'warm invocation'],
    whatIsBeingTested: ['Java + Lambda production experience', 'Latency problem-solving'],
    interviewerIntent: 'Distinguishes candidates who actually ran Java on Lambda from those who only read the docs.',
    codeExample: `# Lambda function config with SnapStart
resource "aws_lambda_function" "payment_api" {
  function_name = "payment-api"
  runtime       = "java21"
  snap_start { apply_on = "PublishedVersions" }  # SnapStart
  
  # Provisioned concurrency for P99 latency SLA
  # (configure on version/alias, not $LATEST)
}

# GraalVM native — Spring AOT build
mvn -Pnative spring-boot:build-image  # produces native Docker image
# Cold start: ~80ms vs 8000ms for regular JVM Lambda`,
    followUps: ['q-aws-ecs-vs-eks'],
  },
  {
    id: 'q-aws-ecs-vs-eks',
    technology: T,
    question: 'When would you choose ECS over EKS, or vice versa?',
    category: 'Compute',
    difficulty: 'advanced',
    quickAnswer: 'ECS = simpler AWS-native orchestration. EKS = full Kubernetes for portability, complex scheduling, or existing K8s expertise.',
    interviewAnswer: `ECS is simpler — tight AWS integration, AWS-native IAM task roles, service discovery via Cloud Map, and no Kubernetes API to learn. Fargate on ECS abstracts node management completely. Choose ECS when: team has no K8s experience, workload is straightforward microservices, or AWS-lock-in is acceptable. EKS is Kubernetes managed by AWS — control plane is on AWS but worker nodes are yours (or Fargate profiles). Choose EKS when: you need Kubernetes-specific features (custom operators, CRDs, Helm ecosystem), you want portability across clouds (GKE, AKS), your team already has K8s expertise, or you need advanced scheduling (GPU nodes, node affinity, topology-spread). EKS has higher operational overhead (node group patching, Kubernetes version upgrades) but more flexibility.`,
    detailedAnswer: `A common migration path: start on ECS (faster to deploy, simpler), move to EKS as complexity grows (need Helm charts, custom controllers, GitOps with ArgoCD). Fargate works with both — no node management — but ECS Fargate has lower cold start than EKS Fargate because EKS Fargate provisions a full node per pod (slower). For cost, ECS on EC2 with Spot instances is often 40% cheaper than EKS Fargate for compute-intensive workloads.`,
    seniorAnswer: `Multi-cloud or hybrid-cloud strategies almost always end up on EKS/GKE/AKS — Kubernetes is the common denominator. If the org has a cloud-agnostic platform strategy, ECS is a dead end. But for a pure AWS shop with simple workloads, ECS is genuinely less operational overhead and I'd choose it.`,
    keyTerms: ['ECS', 'EKS', 'Fargate', 'Kubernetes portability', 'Cloud Map', 'operator pattern'],
    conceptsTested: ['AWS container services', 'Architecture decision-making', 'Trade-off analysis'],
    strongAnswerKeywords: ['AWS-native vs portable', 'Fargate abstraction', 'K8s ecosystem', 'operational overhead'],
    whatIsBeingTested: ['Real AWS decision-making experience'],
    interviewerIntent: 'Tests ability to make reasoned architectural choices, not just list features.',
    followUps: ['q-aws-iam-best-practices'],
  },
  {
    id: 'q-aws-dynamodb-design',
    technology: T,
    question: 'How do you design DynamoDB partition keys and when would you use a GSI?',
    category: 'Storage & Databases',
    difficulty: 'advanced',
    quickAnswer: 'Partition key must have high cardinality and uniform access to avoid hot partitions. GSI allows querying by non-key attributes.',
    interviewAnswer: `DynamoDB distributes data across partitions by hashing the partition key — a bad key concentrates access. Rules: (1) High cardinality — transaction_id (millions) beats status (3 values). (2) Uniform access — avoid keys where 20% of values get 80% of traffic. (3) Access pattern first: design the table around queries, not data shape. For one-to-many relationships, use composite key: partition_key=accountId, sort_key=transactionDate#transactionId — this retrieves all transactions for an account, sorted by date, in a single Query (not Scan). GSI (Global Secondary Index) projects a copy of the table with a different partition and sort key — allows queries on non-primary-key attributes. You pay for the GSI storage and write throughput, so keep projected attributes minimal.`,
    detailedAnswer: `Write sharding for high-traffic keys: suffix the partition key with a random shard number (userId_1, userId_2, ..., userId_10) to distribute writes. Reads aggregate across all shards. DynamoDB Streams + Lambda enables event-driven updates to GSIs or downstream systems. Single-table design: put multiple entity types in one table with overloaded partition/sort keys (PK=USER#123, SK=PROFILE for profile; PK=USER#123, SK=ORDER#456 for order) — enables transactional writes across entity types.`,
    seniorAnswer: `Single-table design sounds clever but creates a maintenance nightmare for teams unfamiliar with it. I use it when there are genuine transactions across entity types and latency is critical. For most microservices, a table per entity type with GSIs is more maintainable and easier to IAM-scope. Document the access patterns in a query table in your design doc — DynamoDB's cost and performance entirely depend on getting this right upfront.`,
    keyTerms: ['partition key', 'sort key', 'GSI', 'hot partition', 'single-table design', 'write sharding'],
    conceptsTested: ['NoSQL data modelling', 'DynamoDB specifics', 'Access pattern design'],
    strongAnswerKeywords: ['high cardinality', 'uniform access', 'access pattern first', 'GSI trade-off', 'hot partition'],
    whatIsBeingTested: ['NoSQL design skill', 'DynamoDB production experience'],
    codeExample: `// Access pattern: get all transactions for account, ordered by date
// Schema: PK=accountId, SK=date#txnId (composite sort key enables range query)
QueryRequest query = QueryRequest.builder()
    .tableName("Transactions")
    .keyConditionExpression("accountId = :acct AND #date BETWEEN :start AND :end")
    .expressionAttributeValues(Map.of(
        ":acct",  AttributeValue.fromS("ACC-001"),
        ":start", AttributeValue.fromS("2025-01-01"),
        ":end",   AttributeValue.fromS("2025-12-31")
    ))
    .build();
// Single Query, no Scan — O(log N) not O(N)`,
    interviewerIntent: 'DynamoDB design is the #1 DynamoDB interview topic — bad partition keys cause silent throttling in production.',
    followUps: ['q-aws-s3-patterns'],
  },
  {
    id: 'q-aws-s3-patterns',
    technology: T,
    question: 'What are the key S3 security and performance patterns for production?',
    category: 'Storage & Databases',
    difficulty: 'intermediate',
    quickAnswer: 'Presigned URLs for client uploads, bucket policies + block public access, versioning + lifecycle, S3 Transfer Acceleration for global uploads.',
    interviewAnswer: `Security: block public access at account level, use bucket policies to enforce SSL (aws:SecureTransport condition), use presigned URLs for time-limited client access without exposing credentials, enable versioning to protect against accidental deletes, enable S3 Object Lock for compliance (WORM). Performance: S3 supports 3,500 PUT/s and 5,500 GET/s per prefix — for high-throughput workloads spread keys across multiple prefixes (random prefix vs date prefix). S3 Transfer Acceleration routes uploads through CloudFront edge nodes for global users. For large objects, multipart upload is mandatory above 5 GB and recommended above 100 MB — allows parallel part uploads and resume on failure.`,
    detailedAnswer: `S3 Event Notifications trigger Lambda, SQS, or SNS on object create/delete — the foundation of event-driven data pipelines. S3 Lifecycle policies automate tiering: move to S3-IA after 30 days, Glacier after 90 days, delete after 365 days — typical pattern for compliance data archival. S3 Replication (CRR) copies objects to another region for DR or reduced latency. With S3 Object Lambda, you transform objects on the way out — redact PII from documents without storing a second copy.`,
    seniorAnswer: `In banking, all S3 buckets are configured with: bucket-level encryption (SSE-KMS with a CMK per data classification), versioning enabled, access logging to a central audit bucket, and S3 Inventory for compliance reporting. An SCP at the organisation level prevents any new bucket from being created without these controls.`,
    keyTerms: ['presigned URL', 'block public access', 'versioning', 'S3 Object Lock', 'multipart upload', 'lifecycle policy', 'SSE-KMS'],
    conceptsTested: ['S3 security', 'S3 performance', 'Cost and compliance patterns'],
    strongAnswerKeywords: ['presigned URL', 'block public access', 'SSE-KMS', 'multipart', 'lifecycle'],
    whatIsBeingTested: ['S3 production knowledge', 'Security mindset'],
    interviewerIntent: 'Tests beyond basic S3 usage to security and performance depth.',
    followUps: ['q-aws-dynamodb-design'],
  },
  {
    id: 'q-aws-iam-best-practices',
    technology: T,
    question: 'What are IAM best practices and how do you implement least privilege in a microservices architecture?',
    category: 'Networking & Security',
    difficulty: 'advanced',
    quickAnswer: 'No root usage, MFA everywhere, IAM roles not users for services, least privilege per service, SCPs for organisational guardrails.',
    interviewAnswer: `Principles: (1) Never use root except for account setup — lock it down with MFA and no access keys. (2) No long-lived access keys for services — use IAM roles with temporary credentials (STS AssumeRole). (3) Least privilege — each ECS task/Lambda gets its own role with exactly the permissions it needs (specific S3 bucket, specific DynamoDB table, not S3:* or DynamoDB:*). (4) Use AWS-managed policies as a starting point, then restrict. (5) Enable IAM Access Analyzer to find resources shared with external accounts. (6) Service Control Policies in AWS Organizations to set maximum permissions per OU — even an admin in a member account cannot exceed what the SCP allows.`,
    detailedAnswer: `For microservices: each service has an ECS task role (or K8s ServiceAccount with IRSA for EKS). Define IAM policies in Terraform per service, reviewed in code review. Use IAM Access Advisor to identify permissions granted but never used — prune them. Permission Boundaries prevent privilege escalation: even if a developer creates an IAM role, it cannot exceed the boundary. Resource-based policies on S3/KMS/SQS add a second enforcement layer.`,
    seniorAnswer: `In a multi-account organisation: centralise IAM Identity Center (SSO) for human access with permission sets. Each AWS account (dev, staging, prod) is separate — a compromised dev credential cannot touch production. SCPs at the OU level deny access to unsupported regions, prevent disabling CloudTrail, and enforce tagging. This is the AWS Security Reference Architecture pattern.`,
    keyTerms: ['least privilege', 'IAM role', 'STS', 'SCP', 'IRSA', 'IAM Access Analyzer', 'Permission Boundary'],
    conceptsTested: ['IAM principles', 'AWS security architecture', 'Microservices security'],
    strongAnswerKeywords: ['no long-lived keys', 'task roles', 'least privilege per service', 'SCP', 'Access Analyzer'],
    whatIsBeingTested: ['Security maturity', 'IAM depth'],
    interviewerIntent: 'Banking interviews always probe security — weak IAM answers are a red flag for fintech roles.',
    codeExample: `# IRSA — EKS pod gets AWS permissions via K8s ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payment-service
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123:role/payment-service-role
# No credentials in pods — STS vends temporary tokens via IMDS`,
    followUps: ['q-aws-vpc-design'],
  },
  {
    id: 'q-aws-sqs-idempotency',
    technology: T,
    question: 'How do you handle duplicate SQS messages and ensure idempotent processing?',
    category: 'Event-Driven',
    difficulty: 'advanced',
    quickAnswer: 'SQS Standard delivers at-least-once (may duplicate). Use a deduplication store (DynamoDB/Redis) keyed on message ID, or use FIFO queues for exactly-once.',
    interviewAnswer: `SQS Standard guarantees at-least-once delivery — the same message can be delivered multiple times if the consumer crashes mid-processing or the visibility timeout expires. Approaches: (1) Idempotent operation design — make the business operation naturally idempotent (e.g. set balance = X, not add X to balance). (2) Deduplication store — on every message, check a Redis/DynamoDB table using the SQS MessageId as key; skip if already processed. (3) SQS FIFO queue — built-in deduplication using the MessageDeduplicationId (same ID within 5 minutes = delivered once). FIFO has lower throughput (3,000 msg/s with batching vs Standard's virtually unlimited). (4) Database unique constraints — design the insert to fail gracefully on duplicate key violations.`,
    detailedAnswer: `Visibility timeout is the window after a message is received where it is invisible to other consumers. If processing takes longer than the timeout, SQS re-enqueues the message as if it wasn't processed — another instance picks it up. Fix: extend visibility timeout programmatically, or design processing to be fast and atomic. Lambda SQS triggers: report per-message batch failures so only failed messages are retried — use SqsBatchResponse with batchItemFailures.`,
    seniorAnswer: `The most subtle idempotency bug: the payment is processed successfully but the application crashes before deleting the SQS message. On retry, the payment runs again. Solution: use an outbox pattern — write the result to the DB and mark the message as processed in the same transaction, then delete the SQS message. This is exactly the "transactional outbox" pattern applied to SQS consumers.`,
    keyTerms: ['at-least-once delivery', 'idempotency', 'MessageId', 'deduplication store', 'FIFO queue', 'visibility timeout'],
    conceptsTested: ['SQS semantics', 'Distributed systems reliability', 'Idempotency patterns'],
    strongAnswerKeywords: ['at-least-once', 'deduplication store', 'idempotent operation', 'FIFO', 'visibility timeout'],
    whatIsBeingTested: ['Production messaging experience', 'Distributed systems reliability'],
    codeExample: `// Idempotency with DynamoDB deduplication table
@SqsListener("payment-events")
public void handle(PaymentEvent event, @Header("MessageId") String msgId) {
    // Conditional write — fails if msgId already exists (idempotency key)
    try {
        deduplication.putItem(PutItemRequest.builder()
            .tableName("ProcessedMessages")
            .item(Map.of("messageId", AttributeValue.fromS(msgId),
                         "ttl", AttributeValue.fromN(String.valueOf(Instant.now().plusSeconds(86400).getEpochSecond()))))
            .conditionExpression("attribute_not_exists(messageId)")
            .build());
    } catch (ConditionalCheckFailedException e) {
        log.info("Duplicate message {}, skipping", msgId);
        return;  // already processed
    }
    paymentProcessor.process(event);  // guaranteed exactly-once now
}`,
    interviewerIntent: 'Critical topic for fintech — duplicate payments are a catastrophic failure mode.',
    followUps: ['q-aws-event-driven'],
  },
  {
    id: 'q-aws-event-driven',
    technology: T,
    question: 'How do you choose between SQS, SNS, EventBridge, and Kinesis?',
    category: 'Event-Driven',
    difficulty: 'advanced',
    quickAnswer: 'SQS = decoupled queuing. SNS = fan-out pub/sub. EventBridge = rule-based routing. Kinesis = ordered, replayable, high-throughput streams.',
    interviewAnswer: `Decision tree: Need fan-out to multiple consumers? → SNS (or EventBridge). Point-to-point decoupling? → SQS. Need content-based routing rules? → EventBridge. Need ordered, replayable, high-throughput (> 1MB/s)? → Kinesis. SQS: pull-based, at-least-once, consumers compete (one receives per message). SNS: push-based, fan-out, all subscribers receive each message. EventBridge: serverless event bus with rule patterns matching JSON payloads, cross-account, cross-service; 14-day event archive for replay. Kinesis: consumers maintain offsets independently (like Kafka) — multiple consumer apps each read the full stream independently; retain up to 365 days.`,
    detailedAnswer: `SNS + SQS fan-out pattern: SNS → multiple SQS queues → each service consumes at its own rate. This is more resilient than SNS → Lambda (if Lambda is throttled, SNS retries for a limited time then drops the message; SQS absorbs the burst). Kinesis Enhanced Fan-Out: push-based consumers (no polling), 2MB/s per shard per consumer — reduces polling latency from 200ms to ~70ms. EventBridge replaces custom SNS/SQS bus logic with declarative rules and has better AWS service integration (CloudTrail events, RDS events, CodePipeline events natively).`,
    seniorAnswer: `For a real-time fraud detection system: payment events → Kinesis (ordered, each consumer reads independently; fraud model reads the same stream as the analytics pipeline). For asynchronous notifications: payment events → SNS → SQS queues for email, push notification, and audit. The decision comes down to: ordering requirement (Kinesis/FIFO), fan-out (SNS), content routing (EventBridge), or simple decoupling (SQS).`,
    keyTerms: ['SQS', 'SNS', 'EventBridge', 'Kinesis', 'fan-out', 'shard', 'consumer offset', 'replay'],
    conceptsTested: ['AWS messaging trade-offs', 'Event-driven design', 'Producer-consumer patterns'],
    strongAnswerKeywords: ['fan-out', 'ordering', 'replay', 'content routing', 'pull vs push'],
    whatIsBeingTested: ['AWS messaging breadth', 'Architectural decision making'],
    interviewerIntent: 'Tests beyond knowing what each service is to making the right choice in context.',
    followUps: ['q-aws-well-architected'],
  },
  {
    id: 'q-aws-well-architected',
    technology: T,
    question: 'Walk me through the AWS Well-Architected Framework and how you have applied it.',
    category: 'Architecture Patterns',
    difficulty: 'advanced',
    quickAnswer: '6 pillars: Operational Excellence, Security, Reliability, Performance, Cost, Sustainability. In practice: IaC, least-privilege, multi-AZ, right-sizing, Spot/Savings Plans.',
    interviewAnswer: `Operational Excellence: IaC (Terraform/CDK), CI/CD pipelines, runbooks, game days, CloudWatch dashboards. Security: least-privilege IAM, encryption in transit and at rest, VPC isolation, WAF, GuardDuty. Reliability: multi-AZ deployments, circuit breakers, retry with exponential backoff, chaos engineering (Fault Injection Simulator), Route 53 health checks. Performance Efficiency: right-size instances, use Graviton3, CDN (CloudFront), ElastiCache, async processing. Cost Optimisation: tagging, right-sizing, Reserved Instances for baseline, Spot for batch, turn off dev/test overnight, Cost Anomaly Detection. Sustainability: Graviton (better performance-per-watt), consolidate workloads, serverless where appropriate.`,
    detailedAnswer: `Applied in practice at Julius Baer: (1) Ran the WA Tool self-assessment — found 3 high-risk gaps in Security pillar (no GuardDuty, no CloudTrail log validation, root account used for manual tasks). (2) Fixed within a sprint. (3) Reliability: proved multi-AZ failover with Fault Injection Simulator — induced an AZ failure, measured RTO at 47 seconds (well under 2-minute SLA). (4) Cost: moved ML inference batch jobs to Spot Instances, 67% cost reduction.`,
    seniorAnswer: `The Well-Architected Framework is the best conversation framework for a design review. I use it as a checklist for every new system: "Does this violate any pillar?" It catches problems early when they're cheap to fix. The biggest missed pillar I see is Operational Excellence — teams build the system but not the runbook to operate it under failure.`,
    keyTerms: ['6 pillars', 'IaC', 'multi-AZ', 'RTO', 'RPO', 'Spot', 'Savings Plan', 'GuardDuty', 'Fault Injection Simulator'],
    conceptsTested: ['AWS architecture principles', 'Production operations', 'Cost management'],
    strongAnswerKeywords: ['6 pillars', 'IaC', 'multi-AZ', 'right-sizing', 'chaos engineering', 'Sustainability'],
    whatIsBeingTested: ['Cloud architecture maturity', 'Real-world application'],
    interviewerIntent: 'Tests cloud architecture depth and real production experience vs theoretical knowledge.',
    followUps: ['q-aws-cost-optimisation'],
  },
  {
    id: 'q-aws-cost-optimisation',
    technology: T,
    question: 'How have you reduced AWS costs in production?',
    category: 'Architecture Patterns',
    difficulty: 'advanced',
    quickAnswer: 'Right-size instances, switch to Graviton, buy Reserved Instances/Savings Plans for steady-state, Spot for batch, eliminate waste (idle resources, oversized RDS).',
    interviewAnswer: `Practical levers I've used: (1) Right-sizing: CloudWatch metrics showed p99 CPU at 15% on m5.xlarge instances — moved to m7g.medium (Graviton3), 60% cheaper, same performance. (2) Reserved Instances: bought 1-year No Upfront RIs for EKS nodes running 24/7 — 40% saving. (3) Spot Instances: moved ML batch inference from On-Demand to Spot via a mixed instance group (SQS-triggered, handles interruptions with graceful shutdown) — 80% cost reduction on that workload. (4) Eliminating waste: AWS Cost Explorer + Trusted Advisor found 12 unattached EBS volumes and 3 idle RDS instances from decommissioned services — deleted, saving £2K/month. (5) Aurora Serverless v2: replaced a fixed-size RDS for a dev environment that ran intermittently — dropped from $200/month to $30.`,
    detailedAnswer: `Tagging is the foundation — without resource tags, you cannot attribute costs to teams. Enforce tagging via SCPs or AWS Config Rules. Cost Anomaly Detection sends alerts when spend deviates unexpectedly. Savings Plans (Compute Savings Plans cover EC2, Lambda, Fargate) are more flexible than Reserved Instances — they apply to any instance type, size, or region within the committed spend level.`,
    seniorAnswer: `FinOps culture matters as much as technical optimization: give each team visibility into their own AWS spend (AWS Cost Explorer filtered by service tag), set per-team budgets with alerts, and celebrate cost reductions in sprint reviews. Engineers who can see their costs optimise them; engineers who can't, don't.`,
    keyTerms: ['right-sizing', 'Reserved Instances', 'Savings Plans', 'Spot Instances', 'Cost Explorer', 'Cost Anomaly Detection', 'Graviton'],
    conceptsTested: ['FinOps', 'AWS cost management', 'Production operations'],
    strongAnswerKeywords: ['right-sizing', 'Graviton', 'Spot', 'Savings Plans', 'tagging', 'Cost Anomaly Detection'],
    whatIsBeingTested: ['Production cost management experience', 'FinOps maturity'],
    interviewerIntent: 'Lead/Principal role interviews always ask about cost — it shows business awareness beyond coding.',
    followUps: ['q-aws-vpc-design'],
  },
  {
    id: 'q-aws-vpc-design',
    technology: T,
    question: 'Design a secure three-tier VPC architecture for a banking microservices platform.',
    category: 'Networking & Security',
    difficulty: 'advanced',
    quickAnswer: 'ALB in public subnets, services in private app subnets, databases in private data subnets. Multi-AZ. Security Groups per tier. No public database access.',
    interviewAnswer: `Three-tier VPC: (1) Public subnets in each AZ — only ALB and NAT Gateways. ALB Security Group: inbound 443 from 0.0.0.0/0. (2) Private app subnets — ECS/EKS services. App SG: inbound 8080 only from ALB SG. Outbound to data SG and internet via NAT (for ECR image pulls, external APIs). (3) Private data subnets — RDS Aurora (Multi-AZ), ElastiCache. Data SG: inbound 5432 only from app SG. No outbound to internet. Additionally: VPC Flow Logs to CloudWatch for network audit. AWS PrivateLink for ECR, S3, SSM, CloudWatch — traffic stays within AWS network, no NAT needed. WAF on ALB — OWASP top 10 rules, rate limiting, geo-blocking. Route 53 health checks + failover for cross-region DR.`,
    detailedAnswer: `Multi-AZ means at least 2 AZs for every tier. NAT Gateway per AZ for resilience (single NAT GW = single point of failure). VPC endpoints for S3/DynamoDB (gateway type, free) avoid NAT costs and keep traffic off the internet. For cross-service communication, AWS PrivateLink or VPC peering — Service Mesh (Istio/App Mesh) adds mTLS and observability at the application layer.`,
    seniorAnswer: `In a regulated banking environment, I add: (1) Network Firewall between NAT Gateway and IGW for deep packet inspection of outbound traffic — blocks unexpected connections to external IPs. (2) Security Hub + Config Rules for continuous compliance (CIS AWS Foundations Benchmark). (3) GuardDuty for anomaly detection — flags cryptocurrency mining traffic, credential exfiltration patterns, unusual API calls. (4) Macie for S3 PII scanning.`,
    keyTerms: ['three-tier VPC', 'ALB', 'private subnet', 'Security Group', 'PrivateLink', 'VPC endpoint', 'NAT Gateway', 'GuardDuty'],
    conceptsTested: ['VPC architecture', 'Network security', 'AWS security services'],
    strongAnswerKeywords: ['public ALB only', 'private app subnet', 'private data subnet', 'SG-to-SG rules', 'VPC endpoint', 'WAF'],
    whatIsBeingTested: ['AWS network architecture', 'Security depth', 'Production design'],
    interviewerIntent: 'System design question with heavy AWS + security context — classic for senior cloud engineering roles.',
    followUps: ['q-aws-iam-best-practices'],
  },
];
