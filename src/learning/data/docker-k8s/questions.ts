import type { InterviewQuestion } from '../../types';

const T = 'docker-k8s';

export const dockerK8sQuestions: InterviewQuestion[] = [
  {
    id: 'q-dk-container-vs-vm',
    technology: T,
    question: 'How does a container differ from a virtual machine, and what are the security implications?',
    category: 'Containers',
    difficulty: 'intermediate',
    quickAnswer: 'Containers share the host kernel via namespaces/cgroups; VMs virtualise hardware. Containers are faster but share the kernel attack surface.',
    interviewAnswer: `A VM runs a full guest OS on a hypervisor that abstracts hardware — complete isolation but 1-5 GB overhead and slow boot. A container uses Linux kernel primitives — namespaces isolate the process view (PID, network, filesystem, users) and cgroups limit resources — no second kernel, so startup is sub-second and overhead is megabytes. The security implication: a kernel vulnerability exploits all containers on the host simultaneously (shared kernel = shared attack surface). Mitigations: run as non-root, use read-only filesystems, drop capabilities (--cap-drop ALL), use seccomp profiles, and consider gVisor or Kata Containers (user-space kernel) for multi-tenant workloads.`,
    detailedAnswer: `Container escape vulnerabilities (CVE-2019-5736 runc, CVE-2022-0185 kernel) let a root container break out to the host. Defence in depth: never run as root (USER in Dockerfile), set allowPrivilegeEscalation: false, use seccomp profiles to block rarely-used syscalls, scan images with Trivy/Grype. For strict isolation in banking, we use gVisor (runsc) which intercepts syscalls in a user-space kernel, preventing most kernel exploits.`,
    seniorAnswer: `In regulated environments I treat container root-on-host as a P1 security finding. Beyond Dockerfile USER, enforce via OPA/Gatekeeper admission policies: any pod with runAsNonRoot: false is rejected at the API server before it ever schedules. SecurityContextConstraints (OpenShift) or PodSecurity admission (Kubernetes 1.25+) enforce this cluster-wide.`,
    keyTerms: ['namespace', 'cgroup', 'seccomp', 'gVisor', 'non-root', 'capability'],
    conceptsTested: ['Container internals', 'Security hardening', 'Trade-offs vs VMs'],
    strongAnswerKeywords: ['shared kernel', 'namespaces', 'cgroups', 'non-root', 'seccomp', 'escape'],
    whatIsBeingTested: ['Understanding of OS-level isolation', 'Security awareness'],
    interviewerIntent: 'Distinguishes candidates who memorised marketing copy from those who understand the kernel-level mechanism.',
    codeExample: `# Secure pod security context
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: [ALL]`,
    followUps: ['q-dk-multistage'],
  },
  {
    id: 'q-dk-multistage',
    technology: T,
    question: 'How do multi-stage Docker builds work and why are they important in production?',
    category: 'Containers',
    difficulty: 'intermediate',
    quickAnswer: 'Each FROM starts a fresh stage; COPY --from=stage copies artefacts, leaving build tools out of the final image.',
    interviewAnswer: `Multi-stage builds let you compile in a heavy builder image (full JDK, Maven, node_modules) but ship only the compiled artefact in a minimal runtime image. The final image has no compiler, no build tools, no source code — just the JAR and JRE. This reduces image size (600 MB → 180 MB), slashes attack surface (no gcc/bash to exploit), and makes image scanning faster. Layer caching still applies per stage: the dependency-download layer is cached if pom.xml didn't change.`,
    detailedAnswer: `Named stages (AS build) allow cherry-picking: COPY --from=build. You can have as many stages as needed — test stage, security-scan stage, final stage. Distroless images (gcr.io/distroless/java21) have no shell at all, so exec into container is impossible — a security feature, not a limitation.`,
    seniorAnswer: `I enforce a Trivy scan stage in CI between build and push. If Trivy finds a CRITICAL CVE the pipeline fails and the image never reaches the registry. Combined with pinned base image digests (FROM eclipse-temurin:21-jre@sha256:abc...) this ensures the supply chain is reproducible and auditable.`,
    keyTerms: ['multi-stage build', 'distroless', 'layer cache', 'attack surface', 'image scanning'],
    conceptsTested: ['Docker internals', 'Security', 'CI/CD integration'],
    strongAnswerKeywords: ['COPY --from', 'minimal runtime image', 'attack surface', 'layer caching'],
    whatIsBeingTested: ['Production awareness', 'Security thinking'],
    codeExample: `FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline    # cached unless pom.xml changes
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","app.jar"]`,
    interviewerIntent: 'Tests practical Docker knowledge and security awareness beyond basic containerization.',
    followUps: ['q-dk-container-vs-vm'],
  },
  {
    id: 'q-dk-k8s-arch',
    technology: T,
    question: 'Walk me through what happens when you run "kubectl apply -f deployment.yaml".',
    category: 'Kubernetes Core',
    difficulty: 'advanced',
    quickAnswer: 'kubectl → API server (auth/admission/validate/persist to etcd) → controller creates ReplicaSet/Pods → scheduler assigns nodes → kubelet starts containers.',
    interviewAnswer: `1. kubectl serialises the manifest and sends a POST/PATCH to kube-apiserver over TLS. 2. API server authenticates (certificate/OIDC), authorises via RBAC, runs admission webhooks (OPA, Kyverno) and built-in admission controllers (e.g. LimitRanger). 3. Object is validated against OpenAPI schema and written to etcd. 4. Deployment controller watches for the new Deployment, creates a ReplicaSet. 5. ReplicaSet controller creates Pod objects (no nodeName yet). 6. kube-scheduler watches for unscheduled Pods, filters nodes by resources/taints/affinity, scores them, writes nodeName. 7. kubelet on that node watches its assigned Pods, calls containerd CRI to pull the image and start the container, reports status. 8. kube-proxy programs iptables rules once a Service selects the new Pod.`,
    detailedAnswer: `Every step is asynchronous and idempotent. If any component crashes and restarts, it re-syncs from etcd state and continues. The API server is the only component that writes to etcd — all others use watches. Admission webhooks run in step 2 before persistence: mutating webhooks can inject sidecars (Istio does this), validating webhooks can reject non-compliant resources.`,
    seniorAnswer: `Understanding this pipeline explains why 'kubectl apply' is fast but Pod startup takes seconds: the API write is instant, but scheduler placement + image pull (if not cached) + JVM boot can easily be 30+ seconds. This affects how you configure readiness/startup probes and why you pre-pull images on nodes in latency-sensitive environments.`,
    keyTerms: ['kube-apiserver', 'etcd', 'admission webhook', 'RBAC', 'ReplicaSet controller', 'kubelet', 'CRI'],
    conceptsTested: ['K8s control plane internals', 'Scheduling pipeline', 'Admission control'],
    strongAnswerKeywords: ['admission webhook', 'etcd', 'scheduler', 'kubelet', 'CRI', 'RBAC'],
    whatIsBeingTested: ['Deep K8s knowledge', 'Ability to debug slow deployments'],
    interviewerIntent: 'Separates kubectl users from engineers who understand the control plane.',
    followUps: ['q-dk-requests-limits'],
  },
  {
    id: 'q-dk-requests-limits',
    technology: T,
    question: 'What is the difference between resource requests and limits in Kubernetes, and what happens when a pod exceeds its limit?',
    category: 'Kubernetes Core',
    difficulty: 'advanced',
    quickAnswer: 'Requests = scheduling signal (guaranteed). Limits = runtime enforcement. Exceeding CPU limit = throttling. Exceeding memory limit = OOMKill.',
    interviewAnswer: `Requests are what the scheduler uses to find a node with enough allocatable capacity — they are the guaranteed minimum. Limits are the runtime ceiling enforced by cgroups. If a container exceeds its CPU limit, it is throttled (slowed down) — no restart. If it exceeds its memory limit, the kernel sends SIGKILL (OOMKill) and Kubernetes restarts the pod. For JVM services: set memory requests = limits to prevent the scheduler from placing the pod on a node that can't sustain the JVM's heap; set CPU requests conservatively but limits higher (JVM GC spikes need headroom). Never set no limits — a runaway pod will starve neighbours.`,
    detailedAnswer: `CPU is a compressible resource (throttled). Memory is incompressible (OOMKilled). QoS classes affect eviction order: Guaranteed (requests=limits) are evicted last; Burstable (requests<limits) are evicted second; BestEffort (no requests or limits) are evicted first. For JVM, use -XX:MaxRAMPercentage=75 not -Xmx so the JVM reads the cgroup memory limit, not host memory.`,
    seniorAnswer: `The most common production incident I've seen: a JVM pod with no memory limit starts fine, then GC pressure causes heap growth. It starts stealing memory from neighbouring pods, which get OOMKilled. Root cause: no limit. Prevention: LimitRange object in the namespace sets a default limit so nameless pods still have a ceiling.`,
    keyTerms: ['requests', 'limits', 'cgroup', 'OOMKill', 'CPU throttle', 'QoS', 'LimitRange', 'MaxRAMPercentage'],
    conceptsTested: ['Resource management', 'JVM in containers', 'Production reliability'],
    strongAnswerKeywords: ['scheduler uses requests', 'cgroup enforces limits', 'OOMKill', 'MaxRAMPercentage', 'QoS'],
    whatIsBeingTested: ['Kubernetes resource model', 'JVM container awareness'],
    codeExample: `resources:
  requests:
    cpu: "500m"      # scheduler: need half a core
    memory: "512Mi"  # scheduler: need 512 MB
  limits:
    cpu: "1000m"     # throttled if exceeded (not killed)
    memory: "512Mi"  # OOMKilled if exceeded (restarted)

# JVM arg — reads cgroup limit, not host memory
env:
- name: JAVA_OPTS
  value: "-XX:MaxRAMPercentage=75"`,
    interviewerIntent: 'Tests understanding of why pods get OOMKilled and how to size JVM containers correctly.',
    followUps: ['q-dk-probes'],
  },
  {
    id: 'q-dk-probes',
    technology: T,
    question: 'What are the three Kubernetes health probes and what should each check?',
    category: 'Workloads & Scaling',
    difficulty: 'intermediate',
    quickAnswer: 'Startup = is it booted? Liveness = is it alive? Readiness = can it serve traffic? Check only what each probe needs to decide.',
    interviewAnswer: `Startup probe runs until it succeeds (gives the app time to initialise); liveness restarts the container if it fails (detects deadlock/corruption); readiness removes the pod from the Service endpoint slice if it fails (stops new traffic without restarting). Startup replaces the need for a long initialDelaySeconds on liveness — use it for slow-boot JVM apps. Liveness should check only that the process is alive and not deadlocked — never check the database. Readiness can check the database (if the DB is down, stop accepting requests); it can also check internal queues or downstream circuit breakers. Spring Boot Actuator provides /actuator/health/liveness and /actuator/health/readiness that map exactly to this split.`,
    detailedAnswer: `A common anti-pattern: liveness checks the database. When the DB is slow, liveness fails → pod restarts → pod re-connects to DB → DB load spikes from reconnections → all pods restart in a cascade. Readiness on the DB is correct: it removes pods from load balancing, reducing DB pressure, without restarting anything.`,
    seniorAnswer: `I include a custom readiness indicator for the Kafka consumer lag: if lag exceeds threshold, mark the pod not-ready and alert. This prevents a stuck consumer from receiving more HTTP traffic while it's processing a backlog. Spring Boot's @ReadinessStateChanged event lets you programmatically flip readiness based on application state.`,
    keyTerms: ['startup probe', 'liveness probe', 'readiness probe', 'initialDelaySeconds', 'failureThreshold', 'Spring Actuator'],
    conceptsTested: ['Health probe semantics', 'Production reliability', 'Spring Boot integration'],
    strongAnswerKeywords: ['startup for slow boot', 'liveness = deadlock check', 'readiness = traffic check', 'no DB in liveness'],
    whatIsBeingTested: ['Probe design judgement', 'Cascade failure prevention'],
    codeExample: `livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 8080 }
  periodSeconds: 10
  failureThreshold: 3    # restart after 30s of failure

readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 8080 }
  periodSeconds: 5
  failureThreshold: 2    # remove from LB after 10s

startupProbe:
  httpGet: { path: /actuator/health, port: 8080 }
  periodSeconds: 10
  failureThreshold: 30   # 5 min for slow JVM boot`,
    interviewerIntent: 'Checks real production experience — this question surfaces candidates who have caused cascade failures.',
    followUps: ['q-dk-requests-limits'],
  },
  {
    id: 'q-dk-gitops',
    technology: T,
    question: 'What is GitOps and how does ArgoCD implement it?',
    category: 'Helm & GitOps',
    difficulty: 'advanced',
    quickAnswer: 'GitOps = Git is the source of truth; an agent continuously syncs the cluster to match. ArgoCD is that agent for Kubernetes.',
    interviewAnswer: `GitOps is an operating model where cluster state is stored as declarative config in Git, and an agent — not a CI pipeline — applies changes to the cluster. ArgoCD watches a Git repo for changes, diffs the desired state against the actual cluster state, and applies the diff (sync). With selfHeal: true, manual kubectl changes are automatically reverted. With prune: true, removing a resource from Git removes it from the cluster. Benefits: every cluster change is a Git commit with author, PR review, and timestamp. Rollback is a git revert. Disaster recovery is re-apply from Git. Access control: developers push to Git but never have kubectl write access to production.`,
    detailedAnswer: `ArgoCD also provides drift detection: if someone kubectl-applies an emergency fix, ArgoCD shows the app as OutOfSync within 3 minutes. You choose to either sync back to Git (reverting the change) or update Git to match (capturing the change). This prevents the "snowflake cluster" problem where the cluster's state diverges from what anyone believes it is.`,
    seniorAnswer: `In a bank, GitOps satisfies SOX and PCI-DSS change management controls automatically: every deployment is traceable to a JIRA ticket (linked in the PR), approved by at least two reviewers, and deployed by ArgoCD (not a human with kubectl). The audit log is the Git history. This replaces a manual change-approval process that used to take days.`,
    keyTerms: ['GitOps', 'ArgoCD', 'selfHeal', 'prune', 'drift detection', 'ApplicationSet', 'sync wave'],
    conceptsTested: ['GitOps principles', 'ArgoCD configuration', 'Audit and compliance'],
    strongAnswerKeywords: ['Git as source of truth', 'selfHeal', 'drift detection', 'audit trail', 'no kubectl in prod'],
    whatIsBeingTested: ['Production deployment maturity', 'Compliance awareness'],
    interviewerIntent: 'Tests whether candidate understands declarative ops vs scripted CI/CD push.',
    followUps: ['q-dk-helm-vs-kustomize'],
  },
  {
    id: 'q-dk-helm-vs-kustomize',
    technology: T,
    question: 'When would you choose Kustomize over Helm?',
    category: 'Helm & GitOps',
    difficulty: 'advanced',
    quickAnswer: 'Helm for reusable packages with rich templating; Kustomize for environment-specific overlays on plain YAML without a template engine.',
    interviewAnswer: `Helm is a package manager with Go templating — powerful for creating reusable charts with complex logic (loops, conditionals, defaults). Ideal for third-party charts (ingress-nginx, cert-manager, Kafka). Kustomize is a patching layer: you start with base YAML and apply overlays per environment (dev, staging, prod) using JSON patches or strategic merge patches. No template engine, no rendering — just plain YAML transformations. I use Helm for vendor charts and complex internal services; Kustomize (or Helm + ArgoCD valueFiles) for environment-specific overrides. They can be composed: helm template | kustomize.`,
    detailedAnswer: `Helm's template engine makes debugging hard — use helm template to preview rendered output. Kustomize's lack of templating is a feature for some teams: the resulting YAML is readable and diffable. ArgoCD supports both natively. FluxCD uses Kustomize as its primary model.`,
    seniorAnswer: `Large organisations often use both: Helm charts are published to an internal chart repository (ChartMuseum, ECR), pinned at a version in an ArgoCD Application, and environment-specific values are overridden via values files in the GitOps repo — Helm's power for reuse, Kustomize-style structure for per-env config.`,
    keyTerms: ['Helm', 'Kustomize', 'overlay', 'patch', 'chart museum', 'ArgoCD'],
    conceptsTested: ['Kubernetes config management', 'GitOps tooling', 'Trade-off analysis'],
    strongAnswerKeywords: ['Helm = package manager with templating', 'Kustomize = plain YAML + overlays', 'they compose'],
    whatIsBeingTested: ['Practical Kubernetes tooling knowledge'],
    interviewerIntent: 'Checks real-world exposure to both tools and ability to justify tooling choices.',
    followUps: ['q-dk-gitops'],
  },
  {
    id: 'q-dk-statefulset',
    technology: T,
    question: 'When do you use a StatefulSet instead of a Deployment?',
    category: 'Workloads & Scaling',
    difficulty: 'advanced',
    quickAnswer: 'StatefulSet when pods need stable identity (persistent hostname, PVC), ordered startup, or are part of a cluster (Kafka, PostgreSQL, Redis Sentinel).',
    interviewAnswer: `Use StatefulSet when: (1) each pod needs a stable, unique network identity that persists across restarts (kafka-0.kafka-headless remains kafka-0 forever); (2) each pod needs its own PersistentVolumeClaim (each Kafka broker has its own disk); (3) ordered, graceful startup/shutdown is required (broker-1 starts only after broker-0 is ready). Deployments assume all pods are interchangeable — any pod can be deleted and replaced by a new identical one. StatefulSets cost more operationally: scaling down does not delete the PVC, so you must manage storage manually.`,
    detailedAnswer: `Kafka, Zookeeper, PostgreSQL primary/replica sets, Redis Sentinel and Elasticsearch are all StatefulSet workloads. Even some stateless apps use StatefulSets if they need sticky session identity. Headless service + StatefulSet = direct pod addressing without going through a load-balanced ClusterIP.`,
    seniorAnswer: `A common mistake: running a database as a Deployment with a single PVC mounted by ReadWriteMany NFS. This works until a rolling update creates two pods simultaneously — both try to write to the same disk. StatefulSet enforces at-most-one-pod-per-identity and orderly transitions, preventing split-brain.`,
    keyTerms: ['StatefulSet', 'headless service', 'stable identity', 'PVC per pod', 'ordered startup'],
    conceptsTested: ['Stateful workload management', 'Kubernetes primitives'],
    strongAnswerKeywords: ['stable network identity', 'own PVC', 'ordered startup', 'headless service'],
    whatIsBeingTested: ['Understanding of stateful workloads in K8s'],
    interviewerIntent: 'Checks whether candidate knows when not to use a Deployment.',
    codeExample: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
spec:
  serviceName: kafka-headless   # headless service gives stable DNS
  replicas: 3
  template:
    spec:
      containers:
      - name: kafka
        env:
        - name: KAFKA_BROKER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name   # "kafka-0", "kafka-1", "kafka-2"
  volumeClaimTemplates:
  - metadata: { name: data }
    spec:
      accessModes: [ReadWriteOnce]
      resources:
        requests: { storage: 100Gi }`,
    followUps: ['q-dk-probes'],
  },
];
