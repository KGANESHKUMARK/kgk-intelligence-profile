import type { LearningTopic } from '../../types';

const T = 'cicd';

export const cicdTopics: LearningTopic[] = [
  /* ---------------------------------------- CI Pipeline Fundamentals */
  {
    id: 'cicd-pipeline-fundamentals',
    technology: T,
    title: 'CI Pipeline Design — GitHub Actions & Jenkins',
    category: 'CI Pipelines',
    slug: 'cicd-pipeline-fundamentals',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A CI pipeline automatically builds, tests, and validates every code change — the first line of defence against regressions, security issues, and broken builds.',
    mentalModel: 'CI pipeline = assembly line quality gate. Each stage (compile → test → scan → build → publish) runs in sequence; failure at any stage stops the line. Fast feedback = short loop time.',
    memoryTip: 'GitHub Actions: workflow.yaml → trigger → jobs → steps. Jenkins: Jenkinsfile (Groovy) → stages → steps. Both support parallel jobs. GitHub Actions is simpler; Jenkins is more customisable but requires maintenance.',
    keyTerms: ['GitHub Actions', 'Jenkins', 'Jenkinsfile', 'workflow', 'job', 'step', 'artifact', 'cache', 'matrix build', 'SAST', 'DAST', 'SonarQube', 'Trivy'],
    visualIds: ['cicd-pipeline-stages'],
    interviewAnswer: `A production CI pipeline for a Spring Boot service: (1) Trigger: on push to main or PR. (2) Compile & test: ./mvnw verify — runs unit + integration tests in parallel. (3) Static analysis: SonarQube quality gate — fail if code coverage < 80% or new critical issues. (4) Security scan: Trivy (container image CVE scan), OWASP Dependency Check (known vulnerable dependencies). (5) Build Docker image: multi-stage Dockerfile, tag with git SHA. (6) Publish to ECR: only on main branch push. GitHub Actions: YAML workflows in .github/workflows/, free for public repos, GitHub-hosted runners. Jenkins: Jenkinsfile in repo root, Groovy pipeline DSL, self-hosted — more control but higher operational overhead. Key CI principles: fail fast (compile before heavy tests), cache dependencies (Maven cache between runs), parallelise (unit tests in one job, integration in another), short pipeline (< 10 min feedback loop).`,
    codeExample: `# .github/workflows/ci.yaml — Spring Boot CI pipeline
name: CI
on:
  push:
    branches: [main, 'release/**']
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
        
      - name: Cache Maven
        uses: actions/cache@v4
        with:
          path: ~/.m2
          key: maven-\${{ hashFiles('**/pom.xml') }}
          
      - name: Build & Test
        run: ./mvnw verify -T 4 --no-transfer-progress
        
      - name: SonarQube Analysis
        run: ./mvnw sonar:sonar -Dsonar.token=\${{ secrets.SONAR_TOKEN }}
        
      - name: Scan image for CVEs
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: payment-service:latest
          exit-code: 1
          severity: CRITICAL,HIGH
          
  publish:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin \$ECR_REGISTRY
          docker tag payment-service:latest \$ECR_REGISTRY/payment-service:\${{ github.sha }}
          docker push \$ECR_REGISTRY/payment-service:\${{ github.sha }}`,
    practicalExample: `Reduced CI cycle time from 25 minutes to 7 minutes: (1) Split tests into unit (2 min) and integration (8 min) jobs running in parallel — total wall time 8 min. (2) Caching Maven dependencies: 3 min → 20s download time. (3) Running Maven with -T 4 (4 threads) for parallel module builds. The faster feedback loop increased developer confidence in committing frequently.`,
    commonMistakes: [
      'No caching — re-downloading 200 MB of dependencies on every build.',
      'Running all tests sequentially — unit tests are fast (1 min) and should not wait for integration tests (10 min).',
      'Secrets in workflow YAML — use GitHub Actions secrets or AWS IAM OIDC, never hardcode credentials.',
      'No quality gate — allowing merges with failing tests or new critical security vulnerabilities.',
    ],
    seniorInsight: `Ephemeral CI environments using TestContainers (no shared dev DB) and LocalStack (no shared AWS) make CI results reproducible — the same test passes locally and in CI without "works on my machine" problems. Combined with deterministic builds (pinned dependency versions, no -SNAPSHOT in production), CI becomes a reliable quality signal rather than a flaky gate.`,
    aiAwareness: {
      strongAnswerShouldMention: ['fail fast', 'parallel jobs', 'dependency caching', 'security scanning (Trivy/OWASP)', 'quality gate'],
      weakAnswer: 'We have a Jenkins pipeline that builds and runs tests on every commit.',
      redFlags: ['No parallel jobs', 'Secrets in YAML', 'No security scanning'],
      likelyFollowUp: ['How do you keep CI fast?', 'How do you handle secrets in GitHub Actions?', 'What is a quality gate?'],
    },
    prerequisites: [],
    relatedTopics: ['cicd-gitops', 'cicd-deployment-strategies'],
    nextTopics: ['cicd-gitops'],
    interviewQuestions: ['q-cicd-pipeline-design', 'q-cicd-github-actions'],
  },
  /* ---------------------------------------------- GitOps & ArgoCD */
  {
    id: 'cicd-gitops',
    technology: T,
    title: 'GitOps & ArgoCD — Declarative Continuous Deployment',
    category: 'GitOps',
    slug: 'cicd-gitops',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'GitOps uses Git as the single source of truth for infrastructure and app configuration; ArgoCD continuously reconciles the cluster to match the Git state.',
    mentalModel: 'GitOps = CI builds + pushes image → PR updates K8s manifests → ArgoCD pulls from Git → cluster self-heals to match. Never kubectl apply in CI — let ArgoCD own the cluster.',
    memoryTip: 'ArgoCD: Application CRD = Git repo + path + target cluster. Sync = apply Git state to cluster. Diff = cluster state vs Git state. Self-heal: ArgoCD reverts manual changes automatically.',
    keyTerms: ['GitOps', 'ArgoCD', 'Application', 'sync', 'drift', 'self-heal', 'app-of-apps', 'image updater', 'Kustomize', 'Helm values'],
    visualIds: ['cicd-gitops-flow'],
    interviewAnswer: `GitOps principles: (1) Declarative — desired state in Git (K8s YAML/Helm). (2) Versioned — every change is a commit with a review trail. (3) Pulled — ArgoCD watches Git and pulls changes rather than CI pushing kubectl apply. (4) Reconciled — ArgoCD continuously compares cluster state with Git and corrects drift. Workflow: CI pipeline tests → tags Docker image with git SHA → bumps image tag in the Git config repo (separate from app code) → ArgoCD detects the commit → syncs the deployment → new pods roll out. Benefits: full audit trail (who changed what, when), rollback = git revert, no pipeline credentials to the cluster, self-healing prevents drift from manual changes. ArgoCD app-of-apps pattern: a parent Application that manages all child Applications — one ArgoCD configuration for 50 services.`,
    codeExample: `# ArgoCD Application manifest
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service
  namespace: argocd
spec:
  project: banking
  source:
    repoURL: https://github.com/org/k8s-configs.git
    targetRevision: main
    path: apps/payment-service/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: banking-prod
  syncPolicy:
    automated:
      prune: true         # delete resources removed from Git
      selfHeal: true      # revert manual kubectl changes
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 3

# CI: bump image tag in config repo (no kubectl in CI)
- name: Update image tag in config repo
  run: |
    git clone https://github.com/org/k8s-configs.git
    cd k8s-configs
    sed -i "s|image: payment-service:.*|image: payment-service:\${{ github.sha }}|" \\
      apps/payment-service/overlays/prod/kustomization.yaml
    git commit -am "ci: update payment-service to \${{ github.sha }}"
    git push`,
    practicalExample: `ArgoCD self-heal caught a manual kubectl scale to 1 replica during an incident. The engineer scaled down to investigate logs — ArgoCD detected drift and restored 3 replicas within 3 minutes, maintaining the production SLA. The change was visible in ArgoCD's history: "drift detected, re-synced from Git at 14:37:23". Without GitOps, the scale-down would have persisted until someone noticed.`,
    commonMistakes: [
      'kubectl apply in the CI pipeline — no audit trail, no self-healing, secrets in CI environment.',
      'Application code and K8s config in the same repo — CI/CD triggers become complex; separate repos give cleaner separation.',
      'Not enabling selfHeal — manual kubectl changes persist and cause configuration drift.',
      'No ArgoCD RBAC — all developers can sync/delete any application.',
    ],
    seniorInsight: `Config repo separation is the key GitOps discipline: the application code repo triggers CI (test + build + push image); a separate config repo holds all K8s manifests, Helm values, and Kustomize overlays. The CI pipeline PRs into the config repo (bumping image tag) — a human approves the PR to deploy. This makes every production change auditable, reviewable, and rollback-able via git revert. In a SOX-compliant bank, this separation-of-duties is a compliance requirement.`,
    aiAwareness: {
      strongAnswerShouldMention: ['Git as source of truth', 'pull-based (ArgoCD) vs push-based (kubectl)', 'self-heal', 'drift detection', 'audit trail'],
      weakAnswer: 'GitOps means we store Kubernetes manifests in Git and deploy from there.',
      redFlags: ['kubectl apply in CI', 'No self-heal', 'Single repo for code and config'],
      likelyFollowUp: ['Why use pull-based over push-based CD?', 'How does ArgoCD handle secrets?', 'What is the app-of-apps pattern?'],
    },
    prerequisites: ['cicd-pipeline-fundamentals'],
    relatedTopics: ['cicd-deployment-strategies'],
    nextTopics: ['cicd-deployment-strategies'],
    interviewQuestions: ['q-cicd-gitops', 'q-cicd-argocd'],
  },
  /* ---------------------------------------- Deployment Strategies */
  {
    id: 'cicd-deployment-strategies',
    technology: T,
    title: 'Deployment Strategies — Blue-Green, Canary & Feature Flags',
    category: 'Deployment Strategies',
    slug: 'cicd-deployment-strategies',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Blue-green enables instant rollback; canary progressively exposes new versions to reduce blast radius; feature flags decouple deployment from feature activation.',
    mentalModel: 'Blue-green = two identical environments, switch traffic instantly. Canary = gradually shift traffic 5% → 25% → 100% while monitoring error rate. Feature flag = deploy code dark, activate by config.',
    memoryTip: 'Blue-green: fast rollback (switch LB), but needs 2× infrastructure. Canary: slow rollout, catches issues early, needs traffic splitting. Feature flag: deploy always, activate/deactivate without deployment.',
    keyTerms: ['blue-green', 'canary', 'feature flag', 'traffic splitting', 'LaunchDarkly', 'Flagsmith', 'rollback', 'progressive delivery', 'Argo Rollouts', 'kill switch'],
    visualIds: ['cicd-deployment-comparison'],
    interviewAnswer: `Blue-green: maintain two identical production environments (blue = current, green = new). Deploy new version to green, smoke test, then switch the load balancer from blue to green. Rollback = switch LB back instantly. Cost: 2× infrastructure running simultaneously. Best for: scheduled maintenance windows, database migrations (blue and green use the same DB — both schemas must be compatible). Canary: gradually shift traffic from old version to new (5% → 25% → 50% → 100%), monitoring error rate and latency at each step. Argo Rollouts automates this in K8s with automatic rollback if metrics degrade. Best for: continuous delivery with fast feedback. Feature flags: deploy code to production but gate the feature behind a flag checked at runtime. Activate/deactivate without deployment — no code change, no pipeline. LaunchDarkly/Flagsmith serve flag values per user/segment. Trunk-based development: all code on main, features hidden by flags, merge daily. Removes long-lived feature branches.`,
    codeExample: `# Argo Rollouts canary strategy
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: payment-service
spec:
  strategy:
    canary:
      steps:
      - setWeight: 5          # 5% traffic to new version
      - pause: {duration: 5m}  # pause, watch metrics
      - setWeight: 25
      - analysis:              # auto-rollback if error rate > 1%
          templates:
          - templateName: error-rate-analysis
      - setWeight: 50
      - pause: {duration: 10m}
      - setWeight: 100
      canaryMetadata:
        labels:
          role: canary

// Feature flag in Spring Boot (with Flagsmith or LaunchDarkly)
@Component
public class FeatureFlagService {
    private final LDClient ldClient;
    
    public boolean isEnabled(String flagKey, LDUser user) {
        return ldClient.boolVariation(flagKey, user, false);  // default=false (off)
    }
}

@PostMapping("/payments")
public PaymentResult pay(@RequestBody PaymentRequest req, 
                          @AuthenticationPrincipal UserDetails user) {
    LDUser ldUser = new LDUser.Builder(user.getUsername())
        .custom("tier", user.getTier())   // segment by tier
        .build();
    
    if (featureFlags.isEnabled("new-payment-engine", ldUser)) {
        return newPaymentEngine.process(req);  // dark launch
    }
    return legacyPaymentEngine.process(req);
}`,
    practicalExample: `New FX pricing engine: deployed to all pods on main behind a feature flag. Activated for 5% of premium customers first. Monitored pricing accuracy and error rate. After 48 hours with no issues, activated for all customers with a single config change — no deployment, no pipeline, rollback = toggle the flag off.`,
    commonMistakes: [
      'Blue-green with a shared DB — if the schema migration is destructive, you cannot roll back easily.',
      'Manual canary — shifting traffic manually without metric-based auto-rollback relies on engineer attention.',
      'Feature flags without cleanup — old flags accumulate technical debt; create a ticket to remove each flag after full rollout.',
      'Activating feature flags for all users at once — defeats the purpose of progressive delivery.',
    ],
    seniorInsight: `Trunk-based development + feature flags is the highest-performing engineering practice according to DORA (DevOps Research and Assessment). Teams using it deploy 200× more frequently with 3× lower change failure rate than teams using long-lived branches. The discipline: commit to main daily, hide incomplete work behind flags, delete flags within 2 weeks of full rollout. It requires test coverage and a culture of incremental work but transforms delivery confidence.`,
    aiAwareness: {
      strongAnswerShouldMention: ['blue-green instant rollback', 'canary progressive traffic shift', 'Argo Rollouts auto-rollback', 'feature flags decouple deploy from release'],
      weakAnswer: 'We use blue-green deployment to switch between environments.',
      redFlags: ['Blue-green with destructive DB migration', 'Manual canary without auto-rollback'],
      likelyFollowUp: ['How do you handle database migrations with blue-green?', 'What is trunk-based development?', 'How do you auto-rollback a canary?'],
    },
    prerequisites: ['cicd-gitops'],
    relatedTopics: ['cicd-pipeline-fundamentals'],
    nextTopics: [],
    interviewQuestions: ['q-cicd-blue-green', 'q-cicd-canary', 'q-cicd-feature-flags'],
  },
];
