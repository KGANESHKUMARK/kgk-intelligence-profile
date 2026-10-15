import type { LearningVisual } from '../../types';
export const cicdVisuals: LearningVisual[] = [
  {
    id: 'cicd-pipeline-stages',
    topicId: 'cicd-pipeline-fundamentals',
    type: 'flow',
    title: 'Production Spring Boot CI Pipeline',
    description: 'Every stage from commit to Docker image — < 10 min feedback loop',
    nodes: [
      { id: 's1', label: 'Code Push', description: 'git push to PR or main branch triggers GitHub Actions workflow.' },
      { id: 's2', label: 'Compile Fast', description: './mvnw compile -T 4. Fail fast — catch compilation errors in 30s. Maven cache from previous run.' },
      { id: 's3', label: 'Tests (parallel)', description: 'Unit tests (JUnit, no I/O): 2 min. Integration tests (TestContainers): 8 min. Run simultaneously — 8 min wall time, not 10.' },
      { id: 's4', label: 'Quality Gate', description: 'SonarQube: coverage ≥ 80%, no new CRITICAL bugs/vulns. OWASP Dependency Check: no HIGH CVEs in dependencies.' },
      { id: 's5', label: 'Build Image', description: 'Multi-stage Dockerfile. Builder: JDK 21. Runtime: JRE 21-slim. Tag: git SHA. Build with BuildKit (layer cache).' },
      { id: 's6', label: 'Trivy Scan', description: 'Scan final image for OS and library CVEs. Fail pipeline on CRITICAL. Report on HIGH.' },
      { id: 's7', label: 'Push to ECR', description: 'Only on main branch. AWS OIDC (no static key). Push payment-service:{sha} to ECR.' },
      { id: 's8', label: 'Update Config Repo', description: 'Bump image tag in Kustomize overlay. PR auto-merged or human review required for production.' },
    ],
    memoryTip: 'Parallel jobs cut wall time. Cache Maven dependencies. Quality + security gates are mandatory. Config repo is separate from app code — ArgoCD owns the cluster.',
  },
  {
    id: 'cicd-gitops-flow',
    topicId: 'cicd-gitops',
    type: 'flow',
    title: 'GitOps Deployment Flow (CI → Git → ArgoCD → Cluster)',
    description: 'How a code commit becomes a running pod without kubectl in CI',
    nodes: [
      { id: 'dev', label: 'Developer', description: 'Merges PR to main. Does not touch the cluster directly.' },
      { id: 'ci', label: 'CI Pipeline', description: 'Tests → builds image → pushes to ECR → opens PR in config repo (image tag bump).' },
      { id: 'git', label: 'Config Git Repo', description: 'K8s manifests, Helm values, Kustomize overlays. Every change = a commit. Full audit trail.' },
      { id: 'argo', label: 'ArgoCD', description: 'Polls config repo every 3 min (or webhook). Compares Git state vs cluster state. Detects diff.' },
      { id: 'cluster', label: 'K8s Cluster', description: 'ArgoCD applies diff. Rolling update / canary begins. Self-heal: reverts manual kubectl changes.' },
    ],
    memoryTip: 'CI never touches the cluster. Git is the single source of truth. ArgoCD pulls — cluster is never pushed to. Manual changes are auto-reverted.',
  },
  {
    id: 'cicd-deployment-comparison',
    topicId: 'cicd-deployment-strategies',
    type: 'comparison',
    title: 'Blue-Green vs Canary vs Feature Flags',
    description: 'Choose the right deployment strategy for your risk profile',
    columns: [
      {
        label: 'Blue-Green',
        nodes: [
          { id: 'bg1', label: 'How it works', description: 'Two environments. Switch LB from blue to green. Rollback = switch back. 2× infra cost.' },
          { id: 'bg2', label: 'Best for', description: 'Scheduled releases, DB schema migrations, compliance windows, fast rollback requirement.' },
          { id: 'bg3', label: 'Risk', description: 'DB must be backward-compatible during switch. Use expand-contract pattern for schema changes.' },
          { id: 'bg4', label: 'Rollback time', description: 'Seconds — just switch the load balancer. No redeployment needed.' },
        ],
      },
      {
        label: 'Canary + Feature Flags',
        nodes: [
          { id: 'c1', label: 'Canary: how', description: '5% → 25% → 100% traffic shift. Monitor metrics. Auto-rollback if error rate > SLO. Argo Rollouts.' },
          { id: 'c2', label: 'Canary: best for', description: 'Performance improvements, API changes, infrastructure upgrades — gradual traffic exposure.' },
          { id: 'f1', label: 'Flags: how', description: 'Code deployed always. Feature activated per-user/segment via LaunchDarkly/Flagsmith at runtime.' },
          { id: 'f2', label: 'Flags: best for', description: 'New user features, A/B testing, kill switches, trunk-based development, decoupled releases.' },
        ],
      },
    ],
    memoryTip: 'Blue-green = infrastructure switch. Canary = gradual traffic. Flags = user targeting. They are complementary — use canary for versions, flags for features.',
  },
];
