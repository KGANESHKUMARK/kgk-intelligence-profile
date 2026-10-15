import type { LearningVisual } from '../../types';
export const testingVisuals: LearningVisual[] = [
  {
    id: 'test-pyramid-visual',
    topicId: 'test-pyramid',
    type: 'comparison',
    title: 'The Test Pyramid — Speed, Cost & Confidence',
    description: 'Why 70% unit / 20% integration / 10% E2E is the optimal ratio',
    columns: [
      {
        label: 'Pyramid Levels (bottom to top)',
        nodes: [
          { id: 'unit', label: 'Unit Tests (70%)', description: 'JUnit 5 + Mockito. No I/O. Milliseconds each. 1000 tests = 5 seconds. Catch: logic errors, edge cases, business rules.' },
          { id: 'int', label: 'Integration Tests (20%)', description: 'TestContainers (real DB/Kafka). Seconds each. @DataJpaTest, @WebMvcTest, @SpringBootTest. Catch: SQL, JPA, wiring, serialisation.' },
          { id: 'e2e', label: 'E2E Tests (10%)', description: 'Full stack, real HTTP. Minutes each. REST Assured, Playwright. Catch: cross-service bugs. Only for critical happy paths.' },
        ],
      },
      {
        label: 'Anti-Pattern: Ice Cream Cone',
        nodes: [
          { id: 'anti1', label: 'Many E2E Tests (70%)', description: 'Pipeline takes 2 hours. Brittle — any service downtime breaks all tests. Expensive to maintain.' },
          { id: 'anti2', label: 'Few Integration Tests', description: 'SQL bugs slip through. JPA mapping errors found in production.' },
          { id: 'anti3', label: 'Few or No Unit Tests', description: 'No fast feedback. Logic bugs found in staging after 2-hour pipeline.' },
          { id: 'anti4', label: 'Manual Tests on Top', description: 'Regressions introduced every release. Manual testing is the bottleneck.' },
        ],
      },
    ],
    memoryTip: 'Unit tests are cheap and fast. E2E tests are expensive and slow. More tests at the bottom = faster CI, higher confidence, cheaper to maintain.',
  },
  {
    id: 'test-pact-flow',
    topicId: 'test-contract',
    type: 'flow',
    title: 'Pact Contract Testing Workflow',
    description: 'From consumer test to deployment gate — enabling independent team deployments',
    nodes: [
      { id: 'consumer', label: 'Consumer Test', description: '@Pact: define expected interaction (request + response). Test runs against PactMockServer. Pact JSON generated.' },
      { id: 'publish', label: 'CI: Publish Pact', description: 'pact-broker publish pact.json --version=$SHA. Pact Broker stores the contract.' },
      { id: 'broker', label: 'Pact Broker', description: 'Stores all pact files. Tracks versions and verification results. can-i-deploy checks here.' },
      { id: 'provider', label: 'Provider Verification', description: '@PactBroker fetches pact. @State sets up test data. Verifies real implementation against contract.' },
      { id: 'deploy', label: 'can-i-deploy Gate', description: 'pact-broker can-i-deploy --pacticipant fraud-service --to-environment production. Fails if any consumer pact unverified or failing.' },
    ],
    memoryTip: 'Consumer owns the contract. Provider must satisfy it. can-i-deploy is the deployment gate. If fraud-service breaks payment-service\'s contract, fraud-service cannot deploy.',
  },
  {
    id: 'test-spring-slices',
    topicId: 'test-testcontainers',
    type: 'comparison',
    title: 'Spring Boot Test Annotations — When to Use Each',
    description: 'Choosing the right test slice: fast targeted tests vs full context',
    columns: [
      {
        label: 'Fast Slices (seconds)',
        nodes: [
          { id: 'wmt', label: '@WebMvcTest', description: 'HTTP layer only. Controller + filters + security + Jackson. Services are @MockBean. Test: validation, HTTP status, serialisation, @PreAuthorize.' },
          { id: 'djt', label: '@DataJpaTest', description: 'JPA + DataSource only. Add TestContainers to use real PostgreSQL. Test: custom @Query, derived methods, N+1 detection.' },
          { id: 'mlt', label: '@MybatisTest / @JdbcTest', description: 'JDBC/MyBatis slice. Real DataSource, no JPA. Test: native SQL, stored procedures, batch JDBC.' },
        ],
      },
      {
        label: 'Full Context (slower)',
        nodes: [
          { id: 'sbt', label: '@SpringBootTest', description: 'Full context. All beans loaded. Use sparingly: full integration flows, config validation, cross-layer tests.' },
          { id: 'rp', label: 'RANDOM_PORT', description: '@SpringBootTest(webEnvironment=RANDOM_PORT). Real HTTP server. Use with REST Assured or WebTestClient.' },
          { id: 'tc', label: '+ TestContainers', description: 'Combine with PostgreSQLContainer + @DynamicPropertySource. Full stack with real infrastructure. Integration and E2E.' },
        ],
      },
    ],
    memoryTip: 'Prefer narrow slices (@WebMvcTest, @DataJpaTest) for fast feedback. Use @SpringBootTest only when testing across multiple layers.',
  },
];
