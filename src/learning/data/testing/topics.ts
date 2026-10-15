import type { LearningTopic } from '../../types';

const T = 'testing';

export const testingTopics: LearningTopic[] = [
  /* ---------------------------------------- Test Pyramid Strategy */
  {
    id: 'test-pyramid',
    technology: T,
    title: 'Testing Strategy — The Test Pyramid & TDD',
    category: 'Testing Strategy',
    slug: 'test-pyramid',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'The test pyramid guides how many tests to write at each level: many fast unit tests at the base, fewer integration tests in the middle, minimal E2E tests at the top.',
    mentalModel: 'Pyramid: Unit (70%, fast, no I/O) → Integration (20%, I/O, real DB) → E2E (10%, full stack, slow). TDD: Red (write failing test) → Green (minimal code to pass) → Refactor. Tests are specs, not afterthoughts.',
    memoryTip: 'Unit: milliseconds, no DB, mock dependencies. Integration: seconds, real DB (TestContainers), real cache. E2E: minutes, full browser/API. TDD = Red-Green-Refactor. Mutation testing = killing mutants.',
    keyTerms: ['test pyramid', 'unit test', 'integration test', 'E2E test', 'TDD', 'Red-Green-Refactor', 'test coverage', 'mutation testing', 'test isolation', 'test doubles'],
    visualIds: ['test-pyramid-visual'],
    interviewAnswer: `The test pyramid: (1) Unit tests (70%) — test a single class or method in isolation, all dependencies mocked. Run in milliseconds. Catch logic errors. JUnit 5 + Mockito. (2) Integration tests (20%) — test a slice (HTTP layer, persistence layer, message listener) with real infrastructure (real DB via TestContainers, real Redis). Catch wiring, SQL, and serialisation errors. Spring @DataJpaTest, @WebMvcTest, @SpringBootTest(webEnvironment=RANDOM_PORT). (3) E2E tests (10%) — test the full system through the external API, with all services running. Slow, fragile, expensive. Catch interaction bugs. Playwright/Cypress for UI; REST Assured for APIs. TDD (Test-Driven Development): write the failing test first (Red), write the minimum code to make it pass (Green), then refactor with the safety net. Benefits: tests act as design force (untestable code signals poor design), living documentation, faster feedback, higher coverage by construction.`,
    codeExample: `// TDD — Red: write the failing test first
@Test
void shouldRejectPaymentWhenAccountBalanceInsufficient() {
    // Arrange
    Account account = Account.builder()
        .id("ACC-001")
        .balance(new BigDecimal("50.00"))
        .currency("GBP")
        .build();
    given(accountRepository.findById("ACC-001")).willReturn(Optional.of(account));
    
    PaymentRequest req = new PaymentRequest("ACC-001", new BigDecimal("100.00"), "GBP");
    
    // Act & Assert — test fails because PaymentService doesn't exist yet
    assertThatThrownBy(() -> paymentService.process(req))
        .isInstanceOf(InsufficientFundsException.class)
        .hasMessageContaining("Insufficient balance");
}

// Green: implement minimum code to pass
@Service
public class PaymentService {
    public PaymentResult process(PaymentRequest req) {
        Account account = accountRepository.findById(req.getAccountId())
            .orElseThrow(() -> new AccountNotFoundException(req.getAccountId()));
        if (account.getBalance().compareTo(req.getAmount()) < 0) {
            throw new InsufficientFundsException(
                "Insufficient balance: " + account.getBalance() + " < " + req.getAmount());
        }
        // ... rest of implementation
    }
}

// Mutation testing with PIT — add to Maven pom.xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <configuration>
        <targetClasses>com.bank.payment.*</targetClasses>
        <mutators>DEFAULTS</mutators>
        <mutationThreshold>85</mutationThreshold>  <!-- fail build if < 85% mutants killed -->
    </configuration>
</plugin>`,
    practicalExample: `Switching from "write tests after" to TDD on the payment engine: test coverage went from 45% to 87%, not because we wrote more tests but because untestable code — long methods, hidden dependencies, global state — was impossible to write test-first. TDD forced better design. Critical bug count in the first month after release dropped 60%.`,
    commonMistakes: [
      'Testing implementation details instead of behaviour — tests break on every refactor.',
      'No test isolation — tests share state or order-dependent — flaky tests destroy CI confidence.',
      '100% line coverage with low mutation score — tests execute code without asserting outcomes.',
      'E2E tests for every feature — slow, brittle, expensive. E2E tests for the most critical user journeys only.',
    ],
    seniorInsight: `Mutation testing (PIT) catches the weakness of conventional coverage: 100% line coverage but assertions like assertTrue(result != null) — no assertion on the actual value. PIT injects mutations (flip > to >=, change return value) and checks if tests fail. A "survived mutant" means a test executed that code path but didn't catch the wrong behaviour. Mutation score > 80% is a meaningful quality bar.`,
    aiAwareness: {
      strongAnswerShouldMention: ['test pyramid ratios', 'TDD Red-Green-Refactor', 'unit tests mock I/O', 'integration tests real DB', 'mutation testing'],
      weakAnswer: 'We write unit tests with JUnit and integration tests with Spring Boot Test.',
      redFlags: ['100% coverage as the only metric', 'E2E tests for everything', 'Tests after code always'],
      likelyFollowUp: ['What is the difference between unit and integration tests?', 'How do you measure test quality beyond coverage?', 'What is mutation testing?'],
    },
    prerequisites: [],
    relatedTopics: ['test-testcontainers', 'test-contract'],
    nextTopics: ['test-testcontainers'],
    interviewQuestions: ['q-test-tdd', 'q-test-pyramid'],
  },
  /* ----------------------------------------------- TestContainers */
  {
    id: 'test-testcontainers',
    technology: T,
    title: 'TestContainers — Real Infrastructure in Integration Tests',
    category: 'Integration Testing',
    slug: 'test-testcontainers',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'TestContainers spins up real Docker containers (PostgreSQL, Redis, Kafka) for integration tests — no mocks, no shared dev DB, deterministic and reproducible.',
    mentalModel: 'TestContainers: test class starts → Docker pulls image → container starts → Spring configures DataSource to point to container → tests run → container stops. Exactly like production, isolated per test run.',
    memoryTip: 'Use @Testcontainers + @Container on a static field for one container shared across all tests in the class. Use @DynamicPropertySource to inject container port into Spring context. Reuse containers between test runs with withReuse(true) for speed.',
    keyTerms: ['TestContainers', '@Testcontainers', '@Container', 'PostgreSQLContainer', 'KafkaContainer', 'RedisContainer', '@DynamicPropertySource', 'container reuse', 'Ryuk'],
    visualIds: [],
    interviewAnswer: `TestContainers eliminates the "works on my machine" problem by using real Docker containers for integration tests. No mocked repositories, no H2 in-memory DB (which doesn't support PostgreSQL-specific syntax), no shared dev DB with state from other developers. Each test class gets its own container, guaranteed to start clean. Spring Boot 3.1 integrates natively: @ServiceConnection annotation automatically configures the DataSource from a PostgreSQLContainer without @DynamicPropertySource boilerplate. Key patterns: static container shared across the class (not restarted per test — much faster); @BeforeEach to reset state (Flyway + clean schema or DELETE statements); testcontainers.reuse.enable=true in ~/.testcontainers.properties to reuse running containers between Gradle/Maven runs.`,
    codeExample: `// Spring Boot 3.1+ with @ServiceConnection (cleanest)
@SpringBootTest
@Testcontainers
class PaymentServiceIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("banking_test")
        .withUsername("test")
        .withPassword("test");
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));
    
    // Spring Boot 3.1+: @ServiceConnection auto-configures DataSource from container
    @ServiceConnection
    static PostgreSQLContainer<?> postgresConn = postgres;
    
    // Or pre-3.1: manual property injection
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }
    
    @Autowired PaymentService paymentService;
    @Autowired TransactionRepository transactionRepository;
    
    @BeforeEach
    void cleanup() {
        transactionRepository.deleteAll();  // reset state between tests
    }
    
    @Test
    void shouldPersistTransactionOnSuccessfulPayment() {
        PaymentRequest req = new PaymentRequest("ACC-001", BigDecimal.TEN, "GBP");
        PaymentResult result = paymentService.process(req);
        
        assertThat(result.getStatus()).isEqualTo(COMPLETED);
        assertThat(transactionRepository.findByAccountId("ACC-001"))
            .hasSize(1)
            .first()
            .satisfies(tx -> {
                assertThat(tx.getAmount()).isEqualByComparingTo(BigDecimal.TEN);
                assertThat(tx.getStatus()).isEqualTo(COMPLETED);
            });
    }
}`,
    practicalExample: `Replaced H2 in-memory DB (used for speed) with PostgreSQL TestContainers after finding 3 bugs that only manifested in PostgreSQL: (1) JSONB query syntax not supported by H2, (2) case-sensitive column names in a native query, (3) a sequence gap when running tests in parallel. TestContainers added 45 seconds to the first test run (container startup), then reused the container for subsequent runs (reuse mode).`,
    commonMistakes: [
      'Creating a new container per test method — add @Container as static field to share one container across all tests in the class.',
      'Not resetting DB state between tests — test order dependency causes flaky tests.',
      'Using H2 for "speed" — H2 dialect differences hide production bugs that only appear on PostgreSQL.',
      'Not pinning container versions — latest tag can change between runs, breaking tests unexpectedly.',
    ],
    seniorInsight: `For CI: cache the Docker images in the CI layer (GitHub Actions cache action for /var/lib/docker) so TestContainers pulls are fast. For local development: testcontainers.reuse.enable=true in ~/.testcontainers.properties keeps containers running between Gradle test runs — integration tests go from 45s (cold) to 5s (warm, container already running). This makes the developer experience of integration tests nearly as fast as unit tests.`,
    aiAwareness: {
      strongAnswerShouldMention: ['real Docker containers', 'no H2 in-memory', '@ServiceConnection / @DynamicPropertySource', 'static container for speed', 'container reuse'],
      weakAnswer: 'TestContainers starts real Docker containers for our integration tests instead of using mocks.',
      redFlags: ['New container per test method', 'Not resetting state between tests', 'H2 for PostgreSQL features'],
      likelyFollowUp: ['How do you make TestContainers fast?', 'What is @DynamicPropertySource?', 'How do you reset DB state between tests?'],
    },
    prerequisites: ['test-pyramid'],
    relatedTopics: ['test-contract', 'test-chaos'],
    nextTopics: ['test-contract'],
    interviewQuestions: ['q-test-testcontainers', 'q-test-integration-strategy'],
  },
  /* ----------------------------------------- Contract Testing */
  {
    id: 'test-contract',
    technology: T,
    title: 'Contract Testing — Pact & Consumer-Driven Contracts',
    category: 'Contract Testing',
    slug: 'test-contract',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Contract tests verify that service APIs match consumer expectations without running the full provider service — enabling independent team deployments.',
    mentalModel: 'Consumer writes the contract (what I expect from the API). Provider verifies the contract (I can satisfy what consumers expect). Pact broker stores contracts. Broken contract = deployment blocked.',
    memoryTip: 'Pact flow: Consumer test → generates pact file → published to Pact Broker → Provider test fetches pact → verifies against real code. can-i-deploy checks if all contracts pass before deployment.',
    keyTerms: ['Pact', 'consumer-driven contract', 'pact file', 'Pact Broker', 'can-i-deploy', 'provider verification', 'Spring Cloud Contract', 'CDC testing'],
    visualIds: [],
    interviewAnswer: `Contract testing solves the microservices integration testing problem: E2E tests are slow and fragile; mocks don't guarantee the real API matches the mock. Consumer-Driven Contract testing: the consumer writes tests defining what it needs from the API (request/response shape); these generate a pact file (JSON contract). The provider's CI fetches the pact from the Pact Broker and verifies its real code satisfies the contract. If the provider breaks a consumer's contract, deployment is blocked via the can-i-deploy CLI check. This enables independent team deployments — the payment team can deploy without coordinating with the fraud team, as long as all pact tests pass. Spring Cloud Contract is the Spring-native alternative: contracts defined as Groovy/YAML DSL in the provider repo; generates WireMock stubs for consumers and JUnit tests for the provider.`,
    codeExample: `// Consumer side (JUnit 5 + Pact)
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "fraud-service", pactVersion = PactSpecVersion.V4)
class FraudClientPactTest {
    
    @Pact(consumer = "payment-service")
    RequestResponsePact fraudCheckPact(PactDslWithProvider builder) {
        return builder
            .given("a valid account exists")
            .uponReceiving("a fraud check request for valid payment")
            .method("POST")
            .path("/api/fraud/check")
            .body(new PactDslJsonBody()
                .stringType("accountId", "ACC-001")
                .decimalType("amount", 100.00)
                .stringType("currency", "GBP"))
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody()
                .decimalType("score", 0.1)
                .booleanType("approved", true))
            .toPact();
    }
    
    @Test
    @PactTestFor(pactMethod = "fraudCheckPact")
    void shouldCallFraudServiceWithCorrectRequest(MockServer mockServer) {
        FraudClient client = new FraudClient(mockServer.getUrl());
        FraudResponse resp = client.check(new FraudRequest("ACC-001", BigDecimal.TEN, "GBP"));
        assertThat(resp.isApproved()).isTrue();
    }
}

// CI: can-i-deploy check before deployment
- name: Can I deploy?
  run: pact-broker can-i-deploy 
    --pacticipant payment-service 
    --version \${{ github.sha }}
    --to-environment production
    --broker-base-url https://pact-broker.banking.internal`,
    practicalExample: `Fraud service changed the response schema: renamed approved to isApproved. Without contract tests: the payment service deployed successfully (it didn't call the fraud service in CI), and production started returning NullPointerException because the field was null. With Pact: the fraud service's CI fetched the consumer pact, saw it expected approved (not isApproved), failed verification, and blocked deployment. The bug was caught before it reached production.`,
    commonMistakes: [
      'Testing API documentation instead of actual consumer needs — contracts should reflect how consumers actually call the API.',
      'No Pact Broker — pact files emailed between teams lose the can-i-deploy safeguard.',
      'Using integration tests for what contracts should test — E2E tests are expensive; contracts are cheap.',
      'Provider team owning the contracts — consumers should own contracts (consumer-driven).',
    ],
    seniorInsight: `Contract tests are most valuable when teams have independent deployment pipelines. If you deploy all services together (a monolith release), contract tests add process overhead without the independence benefit. For a 50-service platform with independent teams, Pact can-i-deploy is the safeguard that allows 10 deployments/day without coordination. It moves the integration check from "run E2E tests in staging" (hours) to "check pact broker" (seconds).`,
    aiAwareness: {
      strongAnswerShouldMention: ['consumer writes the contract', 'provider verifies against real code', 'Pact Broker stores contracts', 'can-i-deploy blocks bad deployments'],
      weakAnswer: 'Contract testing checks that the API documentation matches the implementation.',
      redFlags: ['Provider owns the contracts', 'No Pact Broker', 'Confused with API documentation'],
      likelyFollowUp: ['What is the difference between contract testing and integration testing?', 'What is can-i-deploy?', 'How does Pact handle provider states?'],
    },
    prerequisites: ['test-testcontainers'],
    relatedTopics: ['test-chaos'],
    nextTopics: ['test-chaos'],
    interviewQuestions: ['q-test-contract', 'q-test-pact-flow'],
  },
  /* ------------------------------------------ Chaos Engineering */
  {
    id: 'test-chaos',
    technology: T,
    title: 'Chaos Engineering & Production Resilience Testing',
    category: 'Chaos Engineering',
    slug: 'test-chaos',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Chaos engineering deliberately injects failures into systems to prove resilience — finding weaknesses before users do, not after a 3am incident.',
    mentalModel: 'Chaos: form a hypothesis ("the system handles payment service failure gracefully"), define steady state (SLO: 99.9% success rate), inject failure (kill 50% of pods), measure against steady state, learn from results.',
    memoryTip: 'Hypothesis → Steady State → Experiment → Observe → Learn. Start in staging. Add stop conditions (abort if error rate > SLO). Run game days to validate runbooks.',
    keyTerms: ['chaos engineering', 'steady state hypothesis', 'blast radius', 'stop condition', 'AWS FIS', 'Chaos Monkey', 'Toxiproxy', 'game day', 'fault injection', 'resilience testing'],
    visualIds: [],
    interviewAnswer: `Chaos engineering is disciplined resilience testing: form a hypothesis about system behaviour under failure, define steady state metrics (P99 latency, error rate), inject a controlled failure, measure if steady state is maintained. Key principles: (1) Start small: run in staging first, then controlled production experiments during low-traffic periods. (2) Define stop conditions: if error rate exceeds the SLO threshold, abort the experiment automatically. (3) Minimise blast radius: start with one pod, one node, one AZ. (4) Learn, not just validate: unexpected results are more valuable than confirming known resilience. Tools: AWS FIS (Fault Injection Simulator) — EKS pod terminations, EC2 instance failures, RDS failover, API throttling, network latency injection. Toxiproxy (local/staging) — adds latency, packet loss, connection reset to dependencies. Netflix Chaos Monkey — random pod/instance termination in production.`,
    codeExample: `# AWS FIS experiment — inject 3s latency on 50% of payment service calls
resource "aws_fis_experiment_template" "payment_latency" {
  description = "Inject 3s latency on payment service → fraud service calls"
  role_arn    = aws_iam_role.fis.arn

  action {
    name        = "network-latency"
    action_id   = "aws:eks:inject-network-latency"
    parameter { key = "kubernetesServiceAccount"; value = "payment-service" }
    parameter { key = "durationSeconds"; value = "120" }
    parameter { key = "delayMilliseconds"; value = "3000" }
    parameter { key = "percentage"; value = "50" }
  }
  
  # Stop condition — abort if error rate exceeds SLO
  stop_condition {
    source = "aws:cloudwatch:alarm"
    value  = aws_cloudwatch_metric_alarm.payment_error_rate.arn
  }
  
  target {
    name          = "eks-pods"
    resource_type = "aws:eks:pod"
    selection_mode = "PERCENT(50)"
  }
}

# Toxiproxy — local latency injection for integration tests
@Test
void shouldFallbackToCache_whenFraudServiceIsSlowly() {
    // Add 500ms latency to fraud service calls
    Proxy fraudProxy = toxiproxyClient.createProxy("fraud-service", "localhost:8081", "fraud-service:8080");
    fraudProxy.toxics().latency("fraud-latency", ToxicDirection.DOWNSTREAM, 500);
    
    // Payment should complete within 200ms using cached fraud score
    StopWatch timer = new StopWatch();
    timer.start();
    PaymentResult result = paymentService.process(request);
    timer.stop();
    
    assertThat(result.getStatus()).isEqualTo(COMPLETED);
    assertThat(timer.getTotalTimeMillis()).isLessThan(200);  // circuit breaker kicked in
    
    fraudProxy.delete();
}`,
    practicalExample: `Game day: announced a 2-hour window. Injected network partition between payment service and fraud service using Toxiproxy. Expected: circuit breaker opens, payment falls back to cached fraud score, error rate stays under SLO. Actual: circuit breaker didn't open — it was configured with requestVolumeThreshold=20 and there was only 3 req/s at game day time (needed 20 requests in 10s to trigger). Configuration bug found and fixed before the real incident.`,
    commonMistakes: [
      'No stop condition — an experiment that goes wrong with no stop condition causes a real outage.',
      'Starting chaos in production without staging validation — blast radius is unpredictable.',
      'Only testing happy-path resilience — inject the uncommon failures (DNS failure, SSL cert expiry, memory pressure).',
      'Running chaos without monitoring — can\'t measure steady state deviation without observability.',
    ],
    seniorInsight: `The most valuable chaos experiments are the ones that fail your hypothesis — they reveal real vulnerabilities before a real incident does. "We expected the circuit breaker to open but it didn't" is worth infinitely more than "we confirmed what we already knew works." Create a chaos experiment backlog: list every assumption your architecture makes about failure behaviour, and systematically test each one.`,
    aiAwareness: {
      strongAnswerShouldMention: ['steady state hypothesis', 'stop conditions', 'blast radius minimisation', 'start in staging', 'game days', 'Toxiproxy/AWS FIS'],
      weakAnswer: 'Chaos engineering means randomly killing services to test resilience.',
      redFlags: ['No stop conditions', 'Starting chaos in production first', 'No monitoring during experiment'],
      likelyFollowUp: ['How do you define steady state in a chaos experiment?', 'What tools do you use for chaos testing?', 'What did you learn from a chaos experiment?'],
    },
    prerequisites: ['test-testcontainers'],
    relatedTopics: ['test-pyramid'],
    nextTopics: [],
    interviewQuestions: ['q-test-chaos', 'q-test-resilience'],
  },
];
