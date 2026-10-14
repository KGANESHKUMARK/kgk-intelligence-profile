import type { LearningTopic } from '../../types';

const T = 'aws';

export const awsTopics: LearningTopic[] = [
  /* --------------------------------------------------------- Core Compute */
  {
    id: 'aws-compute',
    technology: T,
    title: 'Compute — EC2, ECS, EKS & Lambda',
    category: 'Compute',
    slug: 'aws-compute',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'AWS compute ranges from VMs (EC2) to containers (ECS/EKS) to serverless functions (Lambda) — pick the right abstraction for your workload.',
    mentalModel: 'EC2 = own a server. ECS/EKS = Kubernetes managed by AWS. Lambda = run a function, pay per millisecond. More abstraction = less ops overhead but less control.',
    memoryTip: 'EC2 = IaaS. ECS/EKS = CaaS. Lambda = FaaS. ASG = EC2 elastic scaling. Fargate = serverless containers (no node management).',
    keyTerms: ['EC2', 'AMI', 'Auto Scaling Group', 'ECS', 'EKS', 'Fargate', 'Lambda', 'cold start', 'provisioned concurrency'],
    visualIds: ['aws-compute-comparison'],
    interviewAnswer: `EC2 gives full VM control — choose instance type, OS, storage. Use Auto Scaling Groups for elastic, self-healing fleets with launch templates. ECS (Elastic Container Service) runs Docker containers on Fargate (serverless, no node management) or EC2. EKS (Elastic Kubernetes Service) is managed Kubernetes — AWS manages the control plane; you manage worker node groups or use Fargate profiles. Lambda is serverless functions: event-driven, scales to zero, billed per 100ms execution. Lambda cold starts (50ms–1s) are the main latency concern — mitigate with provisioned concurrency for latency-sensitive paths. In banking microservices I use EKS + Fargate for services needing fine-grained K8s control and Lambda for event triggers (S3 uploads, SQS messages, scheduled jobs).`,
    detailedExplanation: `EC2 instance families: general purpose (m7g), compute-optimised (c7g, good for CPU-heavy services), memory-optimised (r7g, good for JVM heap-heavy workloads), storage-optimised (i3, for Kafka brokers). Graviton3 (ARM) instances cost 20% less and outperform x86 for JVM and Go workloads. Spot Instances: up to 90% cheaper than On-Demand but can be reclaimed with 2-minute notice — use for batch jobs, stateless workers with graceful shutdown. ECS task definitions specify containers, CPU/memory limits, and IAM task roles (fine-grained per-task AWS permissions without managing IAM on EC2).`,
    internalWorking: `Lambda: an event triggers a function invocation. Lambda service picks (or creates) an execution environment (micro-VM via Firecracker), loads the deployment package, runs the handler. A warm execution environment reuses the JVM runtime — only the handler runs; the static initialisation block does not. Cold start occurs when no warm environment is available. SnapStart (Java) snapshots a running JVM to dramatically reduce cold starts for Java functions.`,
    codeExample: `// Spring Cloud Function on Lambda — zero framework lock-in
@Bean
public Function<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> processPayment() {
    return event -> {
        String body = event.getBody();
        PaymentRequest req = objectMapper.readValue(body, PaymentRequest.class);
        PaymentResult result = paymentService.process(req);
        return APIGatewayProxyResponseEvent.builder()
            .withStatusCode(200)
            .withBody(objectMapper.writeValueAsString(result))
            .build();
    };
}

# Fargate task definition (Terraform excerpt)
resource "aws_ecs_task_definition" "payment" {
  family                   = "payment-service"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"   # each task gets its own ENI + IP
  cpu                      = "1024"    # 1 vCPU
  memory                   = "2048"    # 2 GB
  execution_role_arn       = aws_iam_role.ecs_exec.arn
  task_role_arn            = aws_iam_role.payment_task.arn
  container_definitions = jsonencode([{
    name  = "payment"
    image = "123456789.dkr.ecr.eu-west-1.amazonaws.com/payment:1.4.2"
    portMappings = [{ containerPort = 8080 }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group  = "/ecs/payment-service"
        awslogs-region = "eu-west-1"
      }
    }
  }])
}`,
    practicalExample: `At Julius Baer we run microservices on EKS with Graviton3 nodes — 20% cost saving vs x86 with no code changes (JVM is architecture-neutral). Lambda handles async tasks: when a trade confirmation PDF is uploaded to S3, a Lambda parses it and publishes to SQS for downstream processing. Lambda with SnapStart reduced cold starts from 8s to 0.3s for the Java function.`,
    commonMistakes: [
      'Not using IAM task roles — hardcoding AWS credentials in environment variables.',
      'Ignoring Lambda cold starts for API Gateway-backed Lambda — use provisioned concurrency for latency-sensitive endpoints.',
      'Oversizing EC2 instances — profile CPU/memory first; right-sizing typically reduces costs 30-40%.',
      'Not configuring graceful shutdown for Spot Instance interruptions — 2-minute warning is enough if the app handles SIGTERM.',
    ],
    seniorInsight: `For Java on Lambda: GraalVM native image eliminates the JVM cold start entirely (< 100ms) but loses dynamic reflection features used by Spring. Spring Native (AOT processing) makes this practical but requires testing all bean wiring. For Lambda with databases, use RDS Proxy to pool connections — Lambda can scale to thousands of concurrent instances, which would exhaust a database connection pool instantly.`,
    aiAwareness: {
      strongAnswerShouldMention: ['ECS vs EKS trade-offs', 'Fargate vs EC2 nodes', 'Lambda cold start', 'provisioned concurrency', 'IAM task roles'],
      weakAnswer: 'EC2 is a virtual machine, Lambda is serverless.',
      redFlags: ['Hardcoding AWS credentials', 'Not knowing what cold start means'],
      likelyFollowUp: ['How do you handle Lambda cold starts for Java?', 'When would you choose ECS over EKS?', 'What are Spot Instances and when should you use them?'],
    },
    prerequisites: [],
    relatedTopics: ['aws-storage-db', 'aws-networking'],
    nextTopics: ['aws-storage-db'],
    interviewQuestions: ['q-aws-lambda-cold-start', 'q-aws-ecs-vs-eks'],
  },
  /* -------------------------------------------------- Storage & Databases */
  {
    id: 'aws-storage-db',
    technology: T,
    title: 'Storage & Databases — S3, RDS, DynamoDB, ElastiCache',
    category: 'Storage & Databases',
    slug: 'aws-storage-db',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'S3 for object storage, RDS/Aurora for relational, DynamoDB for key-value at scale, ElastiCache for in-memory caching.',
    mentalModel: 'S3 = infinite file cabinet. RDS = managed PostgreSQL/MySQL. DynamoDB = NoSQL with guaranteed single-digit millisecond latency. ElastiCache = RAM for your app.',
    memoryTip: 'S3 — 11 nines durability. RDS Multi-AZ = sync standby. Aurora = 6-way replication. DynamoDB = eventual or strong consistency per read. ElastiCache = Redis or Memcached.',
    keyTerms: ['S3', 'presigned URL', 'RDS', 'Aurora', 'Multi-AZ', 'Read Replica', 'DynamoDB', 'partition key', 'GSI', 'ElastiCache'],
    visualIds: ['aws-data-tier'],
    interviewAnswer: `S3 is object storage with 11 nines durability — use lifecycle rules to transition old objects to Glacier, presigned URLs for time-limited direct client uploads (no server as proxy). RDS provides managed relational DBs (PostgreSQL, MySQL, Oracle); Multi-AZ deploys a synchronous standby for failover; Read Replicas offload reporting queries. Aurora is AWS's MySQL/PostgreSQL-compatible engine with 6-copy replication across 3 AZs and 30% better throughput. DynamoDB is a fully-managed NoSQL key-value/document store with single-digit millisecond latency at any scale — choose your partition key carefully to avoid hot partitions. ElastiCache (Redis) sits in front of RDS for session storage, caching expensive queries, and distributed rate limiting.`,
    detailedExplanation: `DynamoDB partition key design is critical: a bad key (e.g. user_type which has 3 values) creates hot partitions that throttle. Good keys have high cardinality and uniform access distribution — account_id, transaction_id. GSI (Global Secondary Index) allows querying by non-key attributes. DynamoDB Streams + Lambda enables event-driven processing. S3 Intelligent-Tiering automatically moves objects between access tiers based on access patterns — reduces cost by 40% for unpredictable access. RDS Proxy pools connections — essential when Lambda functions connect to RDS (Lambda can fan out to thousands of concurrent instances, each opening a DB connection).`,
    codeExample: `// Spring Data DynamoDB — transaction lookup by account
@DynamoDBTable(tableName = "Transactions")
public class Transaction {
    @DynamoDBHashKey  private String accountId;     // partition key
    @DynamoDBRangeKey private String transactionId;  // sort key
    @DynamoDBAttribute private Instant createdAt;
    @DynamoDBAttribute private BigDecimal amount;
}

// S3 presigned URL — client uploads directly, no server as proxy
public String generateUploadUrl(String key) {
    S3Presigner presigner = S3Presigner.create();
    PutObjectPresignRequest request = PutObjectPresignRequest.builder()
        .signatureDuration(Duration.ofMinutes(15))
        .putObjectRequest(r -> r.bucket("trade-docs").key(key))
        .build();
    return presigner.presignPutObject(request).url().toString();
}

// ElastiCache Redis — cache-aside pattern with Spring
@Cacheable(value = "exchange-rates", key = "#currency")
public ExchangeRate getRate(String currency) {
    return ratesRepository.findByCurrency(currency); // DB hit only on cache miss
}`,
    practicalExample: `In the portfolio RAG chatbot: documents are stored in S3, ingested by a Lambda triggered by S3 events, chunked, embedded and written to a vector store. Pre-signed URLs let users upload documents directly to S3 without going through the API server — reduces latency and server load.`,
    commonMistakes: [
      'Using DynamoDB like a relational DB — modeling relationships as joins doesn\'t work at NoSQL scale.',
      'Hot partition key in DynamoDB — status field with 3 values = 33% of traffic to one partition, instantly throttled.',
      'Not using RDS Proxy with Lambda — too many connections exhausts the DB pool.',
      'Public S3 bucket for user uploads — use presigned URLs with bucket policy denying public access.',
    ],
    seniorInsight: `Aurora Serverless v2 is a game-changer for variable-load APIs: it scales from 0.5 to 128 ACUs in seconds, and you pay per ACU-second. For batch-heavy overnight jobs + low daytime traffic, Aurora Serverless v2 can cut DB costs 60% vs a fixed RDS instance.`,
    aiAwareness: {
      strongAnswerShouldMention: ['S3 presigned URL', 'RDS Multi-AZ vs Read Replica', 'DynamoDB partition key design', 'ElastiCache cache-aside', 'RDS Proxy'],
      weakAnswer: 'S3 stores files, RDS is a managed database.',
      redFlags: ['Public S3 buckets', 'No partition key strategy for DynamoDB'],
      likelyFollowUp: ['How do you design DynamoDB partition keys?', 'When would you use DynamoDB vs RDS?', 'What is Aurora Serverless?'],
    },
    prerequisites: ['aws-compute'],
    relatedTopics: ['aws-networking', 'aws-events'],
    nextTopics: ['aws-networking'],
    interviewQuestions: ['q-aws-dynamodb-design', 'q-aws-s3-patterns'],
  },
  /* ----------------------------------------- Networking & Security (IAM) */
  {
    id: 'aws-networking',
    technology: T,
    title: 'VPC, IAM, Security Groups & CloudFront',
    category: 'Networking & Security',
    slug: 'aws-networking',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'VPC is your private network in AWS; IAM controls who can do what; Security Groups are stateful firewalls at the instance/ENI level.',
    mentalModel: 'VPC = your own data centre network in AWS. Subnets = rooms. Security Groups = door locks. IAM = access badges. NACL = floor-level firewall. NAT Gateway = controlled internet exit.',
    memoryTip: 'Public subnet = has internet gateway route. Private subnet = no IGW, exits via NAT. Security Group = stateful. NACL = stateless (must allow both in and out).',
    keyTerms: ['VPC', 'subnet', 'internet gateway', 'NAT Gateway', 'Security Group', 'NACL', 'IAM role', 'least privilege', 'VPC peering', 'PrivateLink'],
    visualIds: ['aws-vpc-layout'],
    interviewAnswer: `A VPC is a logically isolated network with configurable CIDR blocks. Public subnets have a route to an Internet Gateway (direct internet access); private subnets route through a NAT Gateway (outbound only). Security Groups are stateful firewalls attached to ENIs — allowing inbound port 443 automatically allows the response. NACLs are stateless at the subnet level — you must explicitly allow both inbound and outbound ports. IAM uses the principle of least privilege: EC2 instances and ECS tasks get IAM Roles (no hardcoded credentials), scoped to exactly the S3 buckets, DynamoDB tables, and SQS queues they need. VPC Peering or AWS PrivateLink allows private connectivity between VPCs without internet exposure.`,
    detailedExplanation: `Three-tier network pattern: ALB in public subnets, application servers in private app subnets, databases in private data subnets. Application tier can only reach data tier — Security Group on RDS allows inbound 5432 only from the app SG. ALB SG allows inbound 443 from 0.0.0.0/0. Bastions or AWS Systems Manager Session Manager for SSH access (SSM preferred — no open SSH port). IAM Permission Boundaries and Service Control Policies (SCPs) in AWS Organizations control the maximum permissions even an admin can grant, preventing privilege escalation in large organisations.`,
    codeExample: `# Terraform — VPC with public/private subnets
resource "aws_vpc" "banking" {
  cidr_block = "10.0.0.0/16"
}
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.banking.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"
  map_public_ip_on_launch = true
}
resource "aws_subnet" "private_app" {
  cidr_block = "10.0.10.0/24"
  availability_zone = "eu-west-1a"
}
resource "aws_subnet" "private_db" {
  cidr_block = "10.0.20.0/24"
  availability_zone = "eu-west-1a"
}

# IAM role for ECS task — least privilege: only its own DynamoDB table
resource "aws_iam_role_policy" "payment_task" {
  role = aws_iam_role.payment_task.id
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:Query"]
      Resource = "arn:aws:dynamodb:eu-west-1:*:table/Transactions"
    },{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage"]
      Resource = aws_sqs_queue.payment_events.arn
    }]
  })
}`,
    practicalExample: `All microservices at Julius Baer run in private subnets. The only public-facing component is the ALB. No EC2 instance has a public IP. RDS Security Group allows port 5432 only from the ECS task Security Group — not from the entire VPC CIDR. IAM task roles are defined per service in Terraform — the payment service cannot access the fraud-detection service's KMS key or DynamoDB table by construction.`,
    commonMistakes: [
      'Hardcoding AWS credentials instead of using IAM roles.',
      'Overly permissive Security Groups (0.0.0.0/0 on port 5432) instead of SG-to-SG rules.',
      'Putting databases in public subnets for "convenience".',
      'Confusing Security Groups (stateful) with NACLs (stateless) — forgetting to allow outbound in a NACL.',
    ],
    seniorInsight: `In regulated environments, use AWS Config Rules + Security Hub to detect and auto-remediate security group drift. If someone adds an SSH rule from 0.0.0.0/0, a Lambda triggered by Config removes it within 60 seconds and creates a Security Hub finding linked to a JIRA ticket.`,
    aiAwareness: {
      strongAnswerShouldMention: ['private subnets', 'least privilege IAM roles', 'Security Group vs NACL', 'no hardcoded credentials', 'VPC PrivateLink'],
      weakAnswer: 'VPC is Amazon\'s private network, IAM controls permissions.',
      redFlags: ['Hardcoding credentials', 'Database in public subnet', 'Allow all on security group'],
      likelyFollowUp: ['What is the difference between a Security Group and a NACL?', 'How do you give a Lambda function access to an S3 bucket?', 'What is VPC PrivateLink?'],
    },
    prerequisites: ['aws-compute'],
    relatedTopics: ['aws-events', 'aws-patterns'],
    nextTopics: ['aws-events'],
    interviewQuestions: ['q-aws-iam-best-practices', 'q-aws-vpc-design'],
  },
  /* ------------------------------------- Event-Driven Architecture on AWS */
  {
    id: 'aws-events',
    technology: T,
    title: 'Event-Driven Architecture — SQS, SNS, EventBridge & Kinesis',
    category: 'Event-Driven',
    slug: 'aws-events',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Decouple services with queues (SQS), topics (SNS), event buses (EventBridge), or streams (Kinesis) depending on ordering, replay, and fan-out needs.',
    mentalModel: 'SQS = point-to-point queue. SNS = pub/sub fan-out. EventBridge = rule-based event router. Kinesis = ordered, replayable stream for high-throughput data.',
    memoryTip: 'Need decoupling? SQS. Need fan-out? SNS. Need rules/filtering? EventBridge. Need ordered, replayable, high throughput? Kinesis.',
    keyTerms: ['SQS', 'FIFO queue', 'DLQ', 'SNS', 'EventBridge', 'Kinesis', 'consumer group', 'at-least-once delivery', 'idempotency'],
    visualIds: [],
    interviewAnswer: `SQS is a pull-based message queue: producers enqueue, consumers poll. Standard queues deliver at-least-once (may duplicate); FIFO queues guarantee ordering and exactly-once processing (lower throughput). Always attach a Dead Letter Queue — messages that fail N times go to the DLQ for inspection without blocking the main queue. SNS is a pub/sub broker — a single publish fans out to multiple SQS queues, Lambda functions, HTTP endpoints, or email. EventBridge is a serverless event bus with content-based routing rules — great for cross-service, cross-account events and AWS service integrations (e.g. route all failed RDS events to a PagerDuty Lambda). Kinesis Data Streams provides ordered, replayable, high-throughput streaming — consumers can replay from any timestamp within the retention window (default 24h, up to 365 days).`,
    detailedExplanation: `Idempotency is essential with SQS at-least-once delivery: design message handlers to be safe to run twice (check-then-act, or use a deduplication table with the SQS message ID). Lambda SQS integration uses batch processing — configure a batch size (e.g. 10) and report per-message failures using SQS batch item failures so Lambda re-tries only failed messages, not the whole batch. SNS → SQS fan-out pattern: one SNS topic, multiple SQS queues (payment, audit, notification) — each service consumes independently at its own pace.`,
    codeExample: `// SQS consumer in Spring Boot with Spring Cloud AWS
@SqsListener(value = "payment-events-queue", deletionPolicy = ON_SUCCESS)
public void handlePaymentEvent(PaymentEvent event, @Header("MessageId") String msgId) {
    // Idempotency check — skip if already processed
    if (processedMessages.contains(msgId)) return;
    
    try {
        paymentProcessor.process(event);
        processedMessages.add(msgId);   // ideally in Redis/DynamoDB
    } catch (TransientException e) {
        throw e;  // Spring Cloud AWS will not delete — SQS retries
    } catch (PermanentException e) {
        log.error("Permanent failure, message will go to DLQ: {}", msgId, e);
        // do NOT throw — acknowledge to SQS, message goes to DLQ after maxReceiveCount
    }
}

# Terraform — SQS with DLQ
resource "aws_sqs_queue" "payment_events_dlq" {
  name = "payment-events-dlq"
}
resource "aws_sqs_queue" "payment_events" {
  name = "payment-events"
  visibility_timeout_seconds = 60
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.payment_events_dlq.arn
    maxReceiveCount     = 3    # after 3 failures, move to DLQ
  })
}`,
    practicalExample: `Trade confirmation workflow: trade service publishes to SNS → fans out to (1) audit SQS queue → Lambda writes to S3 audit store, (2) notification SQS → Lambda sends email, (3) risk-engine SQS → processes for limit checks. Each consumer is independent, decoupled, and can fail without affecting the others.`,
    commonMistakes: [
      'No DLQ — a poison-pill message loops forever, blocking the queue.',
      'Non-idempotent SQS handler — at-least-once delivery means duplicates happen (network retry, visibility timeout expiry).',
      'Kinesis for simple queuing — use SQS instead; Kinesis shines for ordered, high-throughput streams.',
      'Not handling Lambda SQS batch item failures — one bad message fails the whole batch.',
    ],
    seniorInsight: `EventBridge Schema Registry auto-discovers event schemas from traffic and generates typed SDKs for your team. Combined with EventBridge Pipes (source → filter → enrich → target), you can build complex event routing without any Lambda glue code, reducing cold start overhead and simplifying operational monitoring.`,
    aiAwareness: {
      strongAnswerShouldMention: ['DLQ', 'idempotency', 'SNS fan-out', 'Kinesis replayable', 'batch item failures'],
      weakAnswer: 'SQS is a queue, SNS is for notifications.',
      redFlags: ['No DLQ', 'Not handling at-least-once delivery'],
      likelyFollowUp: ['How do you ensure idempotency with SQS?', 'When would you use Kinesis vs SQS?', 'What happens to messages that fail repeatedly?'],
    },
    prerequisites: ['aws-compute', 'aws-storage-db'],
    relatedTopics: ['aws-patterns'],
    nextTopics: ['aws-patterns'],
    interviewQuestions: ['q-aws-sqs-idempotency', 'q-aws-event-driven'],
  },
  /* -------------------------------------------- Well-Architected Patterns */
  {
    id: 'aws-patterns',
    technology: T,
    title: 'Cloud-Native Patterns & Cost Optimisation',
    category: 'Architecture Patterns',
    slug: 'aws-patterns',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'The AWS Well-Architected Framework gives 6 pillars to evaluate cloud architecture; cost optimisation and security are the most impactful in practice.',
    mentalModel: 'Well-Architected = CROPSS: Cost, Reliability, Operational Excellence, Performance, Sustainability, Security. For interviews, know the trade-offs between them.',
    memoryTip: '6 pillars: Operational Excellence, Security, Reliability, Performance, Cost, Sustainability. OSRPCS → "Our Services Run Pretty Cost-effectively Sustainably".',
    keyTerms: ['Well-Architected Framework', 'Reserved Instance', 'Savings Plan', 'Spot Instance', 'right-sizing', 'multi-AZ', 'disaster recovery', 'RTO/RPO', 'Infrastructure as Code'],
    visualIds: ['aws-well-architected'],
    interviewAnswer: `The AWS Well-Architected Framework has six pillars: Operational Excellence (IaC, observability, runbooks), Security (least privilege, encryption, network isolation), Reliability (multi-AZ, retries, circuit breakers, chaos engineering), Performance Efficiency (right instance types, caching, serverless), Cost Optimisation (right-sizing, Reserved Instances/Savings Plans for predictable load, Spot for batch), and Sustainability (Graviton, minimise unused resources). For cost: Reserved Instances give up to 72% discount for committed 1-3 year usage; Compute Savings Plans give 66% for any EC2/Lambda/Fargate; Spot Instances save 90% for interruption-tolerant workloads. RTO (Recovery Time Objective) and RPO (Recovery Point Objective) drive DR architecture: multi-AZ covers most scenarios; multi-region active-active is needed for RTO < 1 minute.`,
    detailedExplanation: `Infrastructure as Code (Terraform, CloudFormation, AWS CDK) is a pillar of Operational Excellence — every resource is version-controlled, reviewable, reproducible. Drift detection (Terraform plan in CI) catches manual console changes. Tagging strategy is the foundation of cost allocation: team, environment, service, cost-centre tags on every resource enable showback/chargeback dashboards in AWS Cost Explorer. For reliability, chaos engineering (AWS Fault Injection Simulator) deliberately injects failures to validate that retry, circuit breaker, and failover mechanisms work before production incidents reveal they don't.`,
    codeExample: `# AWS CDK (TypeScript) — complete three-tier stack with best practices
const vpc = new ec2.Vpc(this, 'BankingVpc', {
  maxAzs: 3,                        // Reliability: multi-AZ
  natGateways: 1,                   // Cost: one NAT GW (add per-AZ for production)
  subnetConfiguration: [
    { name: 'public', subnetType: ec2.SubnetType.PUBLIC },
    { name: 'app', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    { name: 'data', subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  ],
});

const cluster = new ecs.Cluster(this, 'Cluster', {
  vpc,
  containerInsights: true,          // Observability: CloudWatch Container Insights
});

const db = new rds.DatabaseCluster(this, 'AuroraDb', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_3 }),
  instanceProps: {
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.R7G, ec2.InstanceSize.LARGE), // Graviton3
    vpc,
    vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  },
  backup: { retention: Duration.days(35) }, // RPO: 35-day backup window
  storageEncrypted: true,           // Security: encryption at rest
});`,
    practicalExample: `For cost optimisation at scale: Savings Plans for EKS node groups running 24/7 (predictable), Spot Instances in a node group for batch ML inference jobs (preemptible), and automatic tagging via AWS Config Rules to enforce the tagging policy. AWS Cost Anomaly Detection alerts on unexpected spend spikes before the monthly bill arrives.`,
    commonMistakes: [
      'No tagging strategy — cannot allocate costs to teams or services.',
      'Running Dev/Test at production size overnight — use Lambda schedules to stop EC2 instances outside business hours.',
      'No multi-AZ for databases — a single-AZ RDS instance failure causes hours of downtime.',
      'Using console for all infrastructure — no audit trail, no reproducibility, drift accumulates.',
    ],
    seniorInsight: `A well-architected review before a product launch has saved more money and prevented more incidents than any post-launch optimisation I've done. It takes 2 hours to fill in the AWS WA Tool questionnaire; the report highlights the highest-risk gaps. In banking, the Security and Reliability pillars surface compliance gaps (encryption-in-transit not enforced, no MFA on root account) that would be expensive findings in a security audit.`,
    aiAwareness: {
      strongAnswerShouldMention: ['6 pillars', 'Reserved Instances vs Savings Plans', 'multi-AZ reliability', 'IaC', 'RTO/RPO'],
      weakAnswer: 'AWS has a Well-Architected Framework with five pillars about best practices.',
      redFlags: ['Says 5 pillars (Sustainability added in 2021)', 'No mention of cost controls', 'Manual console infrastructure'],
      likelyFollowUp: ['What is the difference between RTO and RPO?', 'How do you optimise AWS costs?', 'What is the difference between Reserved Instances and Savings Plans?'],
    },
    prerequisites: ['aws-compute', 'aws-networking'],
    relatedTopics: [],
    nextTopics: [],
    interviewQuestions: ['q-aws-well-architected', 'q-aws-cost-optimisation'],
  },
];
