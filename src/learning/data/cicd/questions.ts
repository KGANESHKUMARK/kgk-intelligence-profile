import type { InterviewQuestion } from '../../types';
const T = 'cicd';
export const cicdQuestions: InterviewQuestion[] = [
  {
    id: 'q-cicd-pipeline-design', technology: T, question: 'Design a CI/CD pipeline for a Spring Boot microservice from commit to production.',
    category: 'CI Pipelines', difficulty: 'advanced',
    quickAnswer: 'Commit → compile + test (parallel unit/integration) → SonarQube gate → Trivy CVE scan → build image → push to ECR → update config repo → ArgoCD syncs → canary deploy.',
    interviewAnswer: `Complete pipeline: (1) Trigger: push to main or PR. (2) Compile: ./mvnw verify -T 4. Fail fast. (3) Parallel: unit tests (JUnit, no I/O) in one job; integration tests (TestContainers) in another — saves wall time. (4) Quality gate: SonarQube — fail if coverage < 80% or new critical bugs/security vulnerabilities. (5) Security scan: OWASP Dependency Check (known CVEs in libraries), Trivy (container image scan for OS/library CVEs) — fail on CRITICAL. (6) Build Docker image: multi-stage Dockerfile (builder + minimal runtime). Tag with git SHA. (7) Push to ECR (only on main). (8) Update config repo: bump image tag in Kustomize overlay via PR. (9) ArgoCD detects commit, syncs deployment. (10) Argo Rollouts: canary (5% → 25% → 100% with metric gate). Total pipeline time target: < 10 minutes for developer feedback.`,
    keyTerms: ['parallel jobs', 'SonarQube', 'Trivy', 'ECR', 'config repo', 'ArgoCD', 'canary'],
    conceptsTested: ['CI/CD end-to-end knowledge', 'Security integration'],
    strongAnswerKeywords: ['parallel unit and integration', 'quality gate', 'Trivy', 'separate config repo', 'canary rollout'],
    whatIsBeingTested: ['End-to-end delivery pipeline knowledge'],
    interviewerIntent: 'Comprehensive question — tests whether candidate has owned a full delivery pipeline.',
    followUps: ['q-cicd-github-actions'],
  },
  {
    id: 'q-cicd-github-actions', technology: T, question: 'How do you handle secrets in GitHub Actions without hardcoding them?',
    category: 'CI Pipelines', difficulty: 'intermediate',
    quickAnswer: 'GitHub Secrets for short-lived values. AWS OIDC (no static key) for AWS access. Never in YAML. Audit with git-secrets or truffleHog.',
    interviewAnswer: `Options: (1) GitHub Secrets: encrypted values stored in GitHub, injected as env vars (secrets.MY_SECRET). Scoped to repo, environment, or organisation. Good for non-AWS tokens. (2) AWS OIDC (best for AWS): GitHub Actions gets a short-lived OIDC token from GitHub, exchanges it at AWS STS for temporary credentials via AssumeRoleWithWebIdentity. No static AWS access key stored anywhere — no key to rotate or leak. The IAM role has a trust policy limiting which repo/branch can assume it. (3) Vault Agent: for Vault-stored secrets, use the hashicorp/vault-action GitHub Action — authenticates to Vault with GitHub OIDC, fetches secrets, exports as env vars. Never: echo secrets to logs, add to YAML directly, or use a personal AWS key. CI tool: truffleHog in pre-commit hook and PR checks scans for accidentally committed credentials.`,
    keyTerms: ['GitHub Secrets', 'OIDC', 'AssumeRoleWithWebIdentity', 'no static key', 'truffleHog'],
    conceptsTested: ['CI security', 'AWS IAM'],
    strongAnswerKeywords: ['OIDC no static key', 'AssumeRoleWithWebIdentity', 'trust policy', 'truffleHog'],
    whatIsBeingTested: ['Security-conscious CI knowledge'],
    codeExample: `# GitHub Actions: AWS OIDC (no static access key)
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123:role/github-ci-role
    aws-region: eu-west-1
# No VITE_AWS_ACCESS_KEY or VITE_AWS_SECRET anywhere`,
    interviewerIntent: 'Security-aware senior engineers know OIDC over static keys.',
    followUps: ['q-cicd-gitops'],
  },
  {
    id: 'q-cicd-gitops', technology: T, question: 'Why use GitOps (ArgoCD) instead of kubectl apply in CI?',
    category: 'GitOps', difficulty: 'advanced',
    quickAnswer: 'GitOps: audit trail for every change, self-healing drift, rollback = git revert, no CI credentials to cluster, pull-based (ArgoCD) vs push-based (CI).',
    interviewAnswer: `Problems with kubectl apply in CI: (1) No audit trail — who changed what? The CI log is ephemeral. (2) No drift detection — someone kubectl applies a hotfix directly; CI pipeline doesn't know. (3) CI has cluster credentials — if CI is compromised, attacker has cluster access. (4) No rollback story — to rollback you need to re-run the pipeline with old parameters. GitOps (ArgoCD) solves all four: every change is a Git commit (immutable audit trail), ArgoCD detects and corrects drift (self-heal), rollback = git revert (single command), ArgoCD pulls from Git (CI never touches the cluster). Separation of duties: the pipeline proves the image is safe (tests, scans), Git history proves what is deployed, ArgoCD reconciles.`,
    keyTerms: ['audit trail', 'self-heal', 'drift', 'rollback = git revert', 'pull-based vs push-based'],
    conceptsTested: ['GitOps principles', 'Deployment security'],
    strongAnswerKeywords: ['Git audit trail', 'self-heal', 'no cluster credentials in CI', 'rollback = revert'],
    whatIsBeingTested: ['Mature delivery practices knowledge'],
    interviewerIntent: 'Tests whether candidate understands the rationale, not just the tools.',
    followUps: ['q-cicd-argocd'],
  },
  {
    id: 'q-cicd-argocd', technology: T, question: 'What does ArgoCD\'s sync operation do and what is app-of-apps pattern?',
    category: 'GitOps', difficulty: 'advanced',
    quickAnswer: 'Sync applies Git state to cluster. App-of-apps: one root Application manages all child Applications — one ArgoCD config governs 50 services.',
    interviewAnswer: `ArgoCD sync: compares the Git repo state (desired) with the cluster state (actual). Computes a diff. Applies the diff using kubectl under the hood. With automated sync + selfHeal: any drift from Git state is corrected automatically. Sync status: Synced (cluster matches Git), OutOfSync (drift detected). Health status: Healthy (all pods running), Degraded (pods crashing), Progressing (rolling update in progress). App-of-apps: a parent Application points to a directory containing other Application manifests. ArgoCD applies the parent → creates child Applications → each child syncs its own service. For 50 microservices: maintain one app-of-apps Application; add a new Application YAML to onboard a new service. Also: ApplicationSet (newer) — generates Applications dynamically from a list or directory structure, replacing manual app-of-apps for large fleets.`,
    keyTerms: ['sync', 'OutOfSync', 'selfHeal', 'app-of-apps', 'ApplicationSet', 'drift'],
    conceptsTested: ['ArgoCD internals', 'Large-scale GitOps'],
    strongAnswerKeywords: ['desired vs actual state', 'selfHeal', 'app-of-apps for scale', 'ApplicationSet'],
    whatIsBeingTested: ['GitOps operational depth'],
    interviewerIntent: 'Tests practical ArgoCD knowledge for teams managing many services.',
    followUps: ['q-cicd-blue-green'],
  },
  {
    id: 'q-cicd-blue-green', technology: T, question: 'Explain blue-green deployment and how you handle database migrations with it.',
    category: 'Deployment Strategies', difficulty: 'advanced',
    quickAnswer: 'Blue-green: two environments, switch traffic. DB migration challenge: both blue and green read the same DB simultaneously during switch — migration must be backward compatible.',
    interviewAnswer: `Blue-green: maintain two identical environments. Current traffic → blue. Deploy new version to green. Smoke test green. Switch load balancer → green becomes live. Rollback: switch LB back to blue (instant). DB challenge: blue and green share the same database during the switch. If green requires a schema change that breaks blue (DROP COLUMN, RENAME), rolling back means blue breaks. Solution — expand/contract (backward-compatible migrations): (1) Expand: add new column (nullable) alongside old. Deploy green that writes to both. (2) Contract: after green is fully live and blue is retired, drop old column. This requires multiple releases but makes instant rollback safe. Flyway enforces migration ordering. For destructive migrations: never do destructive and code change in the same deployment. Separate into 3 deployments: add new column → switch to green → drop old column.`,
    keyTerms: ['blue-green', 'expand-contract', 'backward-compatible migration', 'Flyway', 'instant rollback'],
    conceptsTested: ['Deployment strategy + DB migration interaction'],
    strongAnswerKeywords: ['expand-contract', 'backward-compatible', 'shared DB', 'instant rollback', 'Flyway'],
    whatIsBeingTested: ['Production deployment maturity'],
    interviewerIntent: 'DB migration + blue-green is a senior question — most candidates only know the networking side.',
    followUps: ['q-cicd-canary'],
  },
  {
    id: 'q-cicd-canary', technology: T, question: 'How does Argo Rollouts implement canary deployment with automatic rollback?',
    category: 'Deployment Strategies', difficulty: 'advanced',
    quickAnswer: 'Rollout spec defines steps (setWeight + pause + analysis). AnalysisTemplate queries Prometheus. If error rate > threshold, automatic rollback to stable.',
    interviewAnswer: `Argo Rollouts replaces the K8s Deployment object. Canary strategy: steps define the rollout progression: setWeight=5 (5% traffic to new ReplicaSet), pause (wait or for duration), analysis (query Prometheus AnalysisTemplate), setWeight=25... Analysis template: queries Prometheus for error rate of canary pods. If rate > 1%, analysis fails → Rollout rolls back to stable ReplicaSet automatically. During rollout: two ReplicaSets exist (stable + canary). Istio or Nginx ingress splits traffic by percentage using VirtualService weights. Canary metadata labels let Grafana dashboard show canary vs stable metrics side-by-side. Manual promotion: if automated analysis passes, engineer approves the final 100% step. Manual abort: rollout undo restores 100% to stable in seconds.`,
    keyTerms: ['Argo Rollouts', 'AnalysisTemplate', 'setWeight', 'Prometheus', 'automatic rollback', 'stable ReplicaSet'],
    conceptsTested: ['Canary internals', 'Progressive delivery'],
    strongAnswerKeywords: ['AnalysisTemplate', 'Prometheus error rate', 'automatic rollback', 'stable + canary ReplicaSets', 'VirtualService weights'],
    whatIsBeingTested: ['Advanced deployment tooling knowledge'],
    codeExample: `apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
spec:
  metrics:
  - name: error-rate
    provider:
      prometheus:
        query: |
          sum(rate(http_requests_total{status=~"5..",app="payment-service"}[5m]))
          / sum(rate(http_requests_total{app="payment-service"}[5m]))
    successCondition: result[0] < 0.01   # < 1% error rate`,
    interviewerIntent: 'Senior-level — tests knowledge of automated progressive delivery.',
    followUps: ['q-cicd-feature-flags'],
  },
  {
    id: 'q-cicd-feature-flags', technology: T, question: 'What are feature flags and when would you use them vs a canary deployment?',
    category: 'Deployment Strategies', difficulty: 'advanced',
    quickAnswer: 'Feature flags: decouple code deployment from feature activation. Canary: gradually shift traffic to a new version. Flags = per-user targeting. Canary = percentage of all traffic.',
    interviewAnswer: `Feature flags: a feature is deployed in production but gated by a runtime config check. LaunchDarkly/Flagsmith evaluates the flag per request — can target specific users, segments, or percentages. Benefits: (1) Deploy anytime, activate separately — releases are not deployments. (2) Instant kill switch — turn off a misbehaving feature in seconds without a rollback. (3) A/B testing — show new feature to 10% of users and measure conversion. (4) Trunk-based development — incomplete features are merged to main but hidden. Canary vs feature flags: canary shifts all traffic (anonymous) to the new service version — good for infrastructure changes, performance improvements, or when you can't instrument every code path. Feature flags target specific users — good for user-facing features, gradual activation by segment, or kill switches. Often combined: canary first (confirm new version works), then feature flag to activate the feature for users progressively.`,
    keyTerms: ['feature flag', 'kill switch', 'trunk-based development', 'per-user targeting', 'LaunchDarkly', 'canary vs flag'],
    conceptsTested: ['Delivery decoupling', 'Progressive feature rollout'],
    strongAnswerKeywords: ['deploy != release', 'kill switch', 'user targeting', 'canary = traffic split, flag = per-user'],
    whatIsBeingTested: ['Advanced delivery practices'],
    interviewerIntent: 'DORA research shows feature flags correlate with elite performance — tests awareness of modern delivery practices.',
    followUps: ['q-cicd-pipeline-design'],
  },
];
