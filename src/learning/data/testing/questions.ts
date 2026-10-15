import type { InterviewQuestion } from '../../types';
const T = 'testing';
export const testingQuestions: InterviewQuestion[] = [
  {
    id: 'q-test-tdd', technology: T, question: 'Explain TDD (Test-Driven Development) and why it improves design, not just coverage.',
    category: 'Testing Strategy', difficulty: 'intermediate',
    quickAnswer: 'Red (failing test) → Green (minimal code) → Refactor. TDD forces testable design: untestable code signals poor design (hidden dependencies, global state, large classes).',
    interviewAnswer: `TDD cycle: Red — write a failing test for the next piece of behaviour (the test is the spec). Green — write the minimum code to make it pass (resist over-engineering). Refactor — improve the code with the test as safety net. Design benefit: untestable code is a design smell. If you cannot write a unit test without instantiating 10 dependencies, the class has too many responsibilities. TDD forces you to write small, focused classes with injected dependencies. You discover coupling problems during test writing, not production debugging. Coverage benefit: writing tests first means the test coverage is a natural outcome — you only write code to satisfy a test. No untested code paths accumulate. Documentation benefit: the test suite is live documentation of expected behaviour. Reading the test tells you what the system should do.`,
    keyTerms: ['Red-Green-Refactor', 'testable design', 'test as spec', 'design signal'],
    conceptsTested: ['TDD discipline', 'Design principles'],
    strongAnswerKeywords: ['failing test first', 'minimum code', 'refactor with safety net', 'untestable = design smell'],
    whatIsBeingTested: ['Engineering discipline and design thinking'],
    codeExample: `// Red: write the failing test first (spec)
@Test void shouldCalculateFXWithSpread() {
    assertThat(fxEngine.convert(100, "GBP", "EUR")).isEqualTo(new BigDecimal("116.50"));
}
// ↑ Fails — FxEngine doesn't exist. Now write FxEngine to satisfy this test.`,
    interviewerIntent: 'TDD is a senior engineering practice — tests whether candidate has used it beyond theory.',
    followUps: ['q-test-pyramid'],
  },
  {
    id: 'q-test-pyramid', technology: T, question: 'Describe the test pyramid and how you balance unit, integration, and E2E tests.',
    category: 'Testing Strategy', difficulty: 'intermediate',
    quickAnswer: '70% unit (fast, no I/O, catch logic errors), 20% integration (real DB/services, catch wiring), 10% E2E (full flow, catch interaction bugs). Ice cream = anti-pattern (too many E2E).',
    interviewAnswer: `Test pyramid levels: (1) Unit (70%): test one class, all dependencies mocked. Run in milliseconds. Written with JUnit 5 + Mockito. Catch: logic errors, business rule violations, edge cases. (2) Integration (20%): test a vertical slice — the HTTP layer (@WebMvcTest), the persistence layer (@DataJpaTest + TestContainers), or the message listener. Real DB, real queue, no mocks. Catch: SQL mistakes, JPA mapping errors, serialisation issues, Spring wiring. Run in seconds. (3) E2E (10%): the full system, all services running, real HTTP. Playwright for UI, REST Assured for API. Catch: cross-service integration bugs, contract violations. Run in minutes. Anti-pattern — ice cream cone: many manual E2E tests (slow, brittle) and few automated unit tests. Costs: E2E tests are 100× slower to run and 10× more expensive to maintain than unit tests. Strategy: E2E tests only for the most critical user journeys (happy path checkout, authentication flow).`,
    keyTerms: ['test pyramid', 'unit 70%', 'integration 20%', 'E2E 10%', 'ice cream anti-pattern'],
    conceptsTested: ['Testing strategy', 'Test economics'],
    strongAnswerKeywords: ['70% unit', '20% integration', '10% E2E', 'ice cream anti-pattern', 'TestContainers for integration'],
    whatIsBeingTested: ['Testing maturity'],
    interviewerIntent: 'Tests whether candidate has a systematic testing strategy, not just "we write tests".',
    followUps: ['q-test-testcontainers'],
  },
  {
    id: 'q-test-testcontainers', technology: T, question: 'How do you use TestContainers and why is it better than H2 for Spring Boot integration tests?',
    category: 'Integration Testing', difficulty: 'advanced',
    quickAnswer: 'TestContainers: real Docker PostgreSQL/Redis/Kafka. H2 dialect differences hide production bugs. @ServiceConnection auto-configures DataSource from container.',
    interviewAnswer: `H2 limitations: H2 supports a subset of PostgreSQL syntax. JSONB queries, specific index types, row-level locking, PostgreSQL-specific functions — all fail silently on H2 but break in production. TestContainers starts a real PostgreSQL Docker container for tests — exact same dialect as production. Spring Boot 3.1 @ServiceConnection: annotate a PostgreSQLContainer field with @ServiceConnection and Spring auto-configures the DataSource (no @DynamicPropertySource boilerplate). Pattern: static @Container — one container shared across all tests in the class; not restarted per test. @BeforeEach cleanup: DELETE statements or @Sql(cleanupScript) resets state between tests. Container reuse (testcontainers.reuse.enable=true): containers stay running between Maven/Gradle invocations — first run 45s (cold), subsequent runs 3s (warm container reused). Same for Redis, Kafka, Elasticsearch.`,
    keyTerms: ['TestContainers', '@ServiceConnection', '@DynamicPropertySource', 'static container', 'H2 limitations', 'container reuse'],
    conceptsTested: ['Integration testing tooling', 'Test reliability'],
    strongAnswerKeywords: ['H2 dialect differences hide bugs', '@ServiceConnection', 'static shared container', 'reuse mode for speed'],
    whatIsBeingTested: ['Modern testing toolchain knowledge'],
    codeExample: `@SpringBootTest @Testcontainers
class PaymentIT {
    @Container @ServiceConnection
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16");
    @Container @ServiceConnection  
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));
    @BeforeEach void clean() { repo.deleteAll(); }
    @Test void shouldPublishEvent() { /* real DB + real Kafka */ }
}`,
    interviewerIntent: 'TestContainers is the current industry standard for Java integration testing.',
    followUps: ['q-test-integration-strategy'],
  },
  {
    id: 'q-test-integration-strategy', technology: T, question: 'What is the difference between @SpringBootTest, @WebMvcTest, and @DataJpaTest?',
    category: 'Integration Testing', difficulty: 'intermediate',
    quickAnswer: '@WebMvcTest: HTTP layer only (controllers, filters). @DataJpaTest: persistence layer only (JPA + real DB). @SpringBootTest: full context (slowest but most realistic).',
    interviewAnswer: `Spring Boot test slices: @WebMvcTest(PaymentController.class) — loads only the web layer (controllers, filters, security, Jackson). Services are auto-mocked. Tests HTTP request/response, serialisation, validation, security rules. Fast (no DB). Use: test controller input validation, response formats, security annotations. @DataJpaTest — loads only the JPA layer (entities, repositories). Configures a test DataSource (H2 by default, or TestContainers with @AutoConfigureTestDatabase(replace=NONE)). Tests custom JPQL queries, derived query methods, N+1 detection. Fast. Use: test repository queries. @SpringBootTest — full application context. Use when you need the complete Spring context (testing across multiple layers, full application config). Slowest — starts everything. Use sparingly: only for E2E API tests and critical integration flows. @SpringBootTest(webEnvironment=RANDOM_PORT) — starts a real HTTP server on a random port. Combine with REST Assured or TestRestTemplate.`,
    keyTerms: ['@WebMvcTest', '@DataJpaTest', '@SpringBootTest', 'test slice', 'full context'],
    conceptsTested: ['Spring Boot test architecture'],
    strongAnswerKeywords: ['@WebMvcTest = HTTP layer only', '@DataJpaTest = JPA only', '@SpringBootTest = full context slowest'],
    whatIsBeingTested: ['Spring testing knowledge'],
    interviewerIntent: 'Spring Boot testing is daily work — tests whether candidate knows how to write fast, focused tests.',
    followUps: ['q-test-contract'],
  },
  {
    id: 'q-test-contract', technology: T, question: 'What is consumer-driven contract testing and when should you use it?',
    category: 'Contract Testing', difficulty: 'advanced',
    quickAnswer: 'Consumer writes the contract (expectations). Provider verifies it runs against real code. Pact Broker + can-i-deploy blocks deployments that break contracts.',
    interviewAnswer: `Consumer-driven contract testing solves the microservices integration problem: E2E tests are slow/brittle; mocks don't guarantee the real API matches. With Pact: (1) Consumer writes test defining what it needs (request shape + response shape). Test generates a pact file (JSON). (2) Pact file published to Pact Broker. (3) Provider CI fetches the pact, runs tests against real implementation. Fails if the contract is not satisfied. (4) can-i-deploy CLI checks if all consumers' contracts pass before deployment. This means: if the fraud service changes its response schema, payment service's pact fails the fraud service's CI before deployment. The deployment is blocked. When to use: services have independent deployment pipelines, multiple teams own different services, E2E tests are becoming a bottleneck. When NOT to use: all services deploy together (monolith release — contracts add overhead without the independence benefit).`,
    keyTerms: ['Pact', 'consumer owns contract', 'Pact Broker', 'can-i-deploy', 'provider verification'],
    conceptsTested: ['Microservices testing strategy', 'Team independence'],
    strongAnswerKeywords: ['consumer writes contract', 'provider verifies against real code', 'can-i-deploy blocks bad deployments', 'independent deployment'],
    whatIsBeingTested: ['Advanced microservices testing'],
    interviewerIntent: 'Contract testing is critical for independent team deployments — senior/lead expectation.',
    followUps: ['q-test-pact-flow'],
  },
  {
    id: 'q-test-pact-flow', technology: T, question: 'Describe the Pact workflow from consumer test to provider verification.',
    category: 'Contract Testing', difficulty: 'advanced',
    quickAnswer: 'Consumer: @Pact method defines interaction → test runs against mock server → pact.json generated → published to Pact Broker → Provider: fetches pact → @PactVerification against real service.',
    interviewAnswer: `Step by step: (1) Consumer test: @ExtendWith(PactConsumerTestExt.class). @Pact method uses DSL to define: given("account exists"), upon receiving POST /fraud/check, respond with {score:0.1, approved:true}. The @Test method calls the real FraudClient against PactMockServer (started automatically). Test passes → pact.json generated in target/pacts/. (2) Publish pact: pact-broker publish target/pacts/ --consumer-app-version=$SHA — done in CI. (3) Provider verification: @Provider("fraud-service") @PactBroker in the fraud service's test. @State("account exists") method sets up the DB state. @PactVerification runs: fetches pact from broker, starts the Spring app, replays the consumer's request, checks the response matches the contract. Fails if response shape changed. (4) can-i-deploy: pact-broker can-i-deploy --pacticipant fraud-service --version $SHA --to-environment production — checks all consumer pacts pass. Blocks deployment if any fail.`,
    keyTerms: ['@Pact', 'PactMockServer', 'pact.json', 'Pact Broker publish', '@PactVerification', '@State', 'can-i-deploy'],
    conceptsTested: ['Pact workflow depth'],
    strongAnswerKeywords: ['mock server for consumer', 'pact.json generated', 'provider verifies real code', '@State for setup', 'can-i-deploy gate'],
    whatIsBeingTested: ['Hands-on Pact experience'],
    interviewerIntent: 'Detail-level Pact question — tests whether candidate has actually implemented it.',
    followUps: ['q-test-chaos'],
  },
  {
    id: 'q-test-chaos', technology: T, question: 'What is chaos engineering and how do you run a chaos experiment?',
    category: 'Chaos Engineering', difficulty: 'advanced',
    quickAnswer: 'Hypothesis + steady state → inject failure (Toxiproxy/AWS FIS) → measure vs steady state → learn. Start in staging. Always define stop condition.',
    interviewAnswer: `Chaos engineering process: (1) Define steady state: the metrics that define normal operation — P99 latency < 500ms, error rate < 0.1%, payment success rate > 99.9%. (2) Hypothesis: "the payment service handles 3-second latency on fraud service calls within the SLO because the circuit breaker opens and the fallback activates." (3) Inject failure: using Toxiproxy (add 3s latency) in staging, or AWS FIS (network latency injection) in production during low-traffic period. (4) Observe: did steady state hold? Error rate still < 0.1%? Did the circuit breaker open? Did the fallback activate? (5) Learn: if hypothesis was wrong, fix the gap (tune circuit breaker thresholds, add fallback). If right, document as verified behaviour. Stop condition: always define an automated stop condition (AWS FIS: stop if CloudWatch alarm fires). Game days: announce a 2-hour window, invite oncall, inject failures, validate runbook accuracy.`,
    keyTerms: ['steady state', 'hypothesis', 'blast radius', 'stop condition', 'AWS FIS', 'Toxiproxy', 'game day'],
    conceptsTested: ['Chaos engineering methodology'],
    strongAnswerKeywords: ['steady state hypothesis', 'stop condition mandatory', 'game day', 'learn from unexpected results'],
    whatIsBeingTested: ['Production resilience engineering'],
    codeExample: `// Toxiproxy: inject 3s latency in integration test
fraudProxy.toxics().latency("slow-fraud", DOWNSTREAM, 3000);
StopWatch timer = new StopWatch();
timer.start();
PaymentResult result = paymentService.process(req);
timer.stop();
assertThat(result.getStatus()).isEqualTo(COMPLETED); // circuit breaker used fallback
assertThat(timer.getTotalTimeMillis()).isLessThan(200); // did NOT wait 3s`,
    interviewerIntent: 'Chaos engineering for senior/lead — shows experience with production resilience.',
    followUps: ['q-test-resilience'],
  },
  {
    id: 'q-test-resilience', technology: T, question: 'What is mutation testing and why is code coverage alone insufficient?',
    category: 'Testing Strategy', difficulty: 'advanced',
    quickAnswer: 'Mutation testing injects code changes (flip > to >=, negate returns) and checks if tests fail. Survived mutant = test executed the code but didn\'t catch the bug. Coverage says code was run, not tested.',
    interviewAnswer: `Code coverage tells you which lines were executed during tests — not whether the tests verified the correct behaviour. Example: test calls a method and asserts result != null. Coverage shows 100%. But if you change the method to always return the wrong value, the test still passes. This is a "survived mutant." Mutation testing (PIT framework): injects mutations into production code — flip condition (> → >=), negate return value, change constant, remove conditional. Runs the test suite against each mutation. If at least one test fails, the mutant is "killed" — tests catch the change. If no test fails, the mutant "survives" — tests are inadequate. Mutation score = killed / total. A mutation score > 80% is a meaningful quality bar. Run: mvn test-compile org.pitest:pitest-maven:mutationCoverage. Warning: slow (runs tests for every mutation) — run on critical modules only, in CI nightly.`,
    keyTerms: ['mutation testing', 'PIT', 'mutant', 'mutation score', 'coverage vs mutation score'],
    conceptsTested: ['Advanced testing metrics', 'Test quality'],
    strongAnswerKeywords: ['coverage = executed not tested', 'mutant = code change', 'killed = test catches it', 'PIT framework', 'mutation score > 80%'],
    whatIsBeingTested: ['Senior-level testing quality thinking'],
    interviewerIntent: 'Mutation testing knowledge separates senior engineers who think about test quality from those who just track coverage.',
    followUps: ['q-test-tdd'],
  },
];
