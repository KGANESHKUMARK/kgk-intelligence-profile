import type { LearningTopic } from '../../types';

const T = 'docker-k8s';

export const dockerK8sTopics: LearningTopic[] = [
  /* -------------------------------------------------- Container Fundamentals */
  {
    id: 'dk-container-fundamentals',
    technology: T,
    title: 'Docker & Container Fundamentals',
    category: 'Containers',
    slug: 'dk-container-fundamentals',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'A container packages an app with its runtime so it runs identically everywhere — no more "works on my machine".',
    mentalModel: 'A Docker image is a layered cake of read-only filesystem snapshots. Running a container adds a thin writable layer on top without changing any layer below.',
    memoryTip: 'Image = recipe (immutable). Container = dish (running instance). Dockerfile = chef instructions.',
    keyTerms: ['Dockerfile', 'image layer', 'union filesystem', 'OCI', 'containerd', 'namespace', 'cgroup', 'multi-stage build'],
    visualIds: ['dk-image-layers'],
    interviewAnswer: `Docker packages an application and all its dependencies into an image — a stack of read-only layers stored as content-addressed blobs. Running a container adds a thin writable layer on top via a union filesystem (OverlayFS). Isolation comes from Linux kernel primitives: namespaces (pid, net, mnt, uts, ipc, user) constrain what the process can see; cgroups (cpu, memory, blkio) constrain how much it can consume. I use multi-stage builds to keep images small: compile in a full JDK image, then COPY only the JAR into a slim JRE base. Production images should run as non-root and have no shell or package manager.`,
    detailedExplanation: `Layer caching is the key Docker performance lever: put rarely-changing instructions (base image, dependency download) early in the Dockerfile; put frequently-changing code COPY at the end. Each RUN creates a new layer — chain commands with && to minimise layers. .dockerignore is as important as .gitignore: building without it sends your entire node_modules or target/ into the daemon. Distroless or scratch base images reduce attack surface and image size dramatically.`,
    internalWorking: `Container runtimes follow the OCI (Open Container Initiative) spec. containerd (used by Kubernetes) calls runc to start containers. runc uses clone() with CLONE_NEWPID | CLONE_NEWNET | ... to create isolated namespaces, sets cgroup limits, then exec()s the process. No hypervisor involved — containers share the host kernel.`,
    codeExample: `# Multi-stage Dockerfile — Spring Boot JAR
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B          # cache dependencies layer
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]`,
    codeOutput: 'Image ~180 MB (vs ~600 MB with full JDK). Runs as non-root user "app".',
    practicalExample: `At Julius Baer, every microservice uses multi-stage builds. The build stage uses a full Maven + JDK image; the runtime stage uses Alpine JRE. Images are scanned with Trivy in CI — critical CVEs block promotion to production.`,
    commonMistakes: [
      'Using latest tag instead of pinned digest — breaks reproducible builds.',
      'Running containers as root — violates least-privilege principle.',
      'Copying source code in one layer before installing dependencies — breaks caching.',
      'Not setting MaxRAMPercentage — JVM reads host memory and over-allocates in containers.',
    ],
    seniorInsight: `Set -XX:MaxRAMPercentage=75 (not -Xmx) so the JVM adapts to the container memory limit at runtime. Without it the JVM queries host memory, sets its heap to 25% of 64 GB, and immediately gets OOMKilled in a 512 MB container — a very common production incident.`,
    aiAwareness: {
      strongAnswerShouldMention: ['union filesystem', 'namespaces', 'cgroups', 'multi-stage build', 'non-root', 'MaxRAMPercentage'],
      weakAnswer: 'Docker is like a lightweight VM.',
      redFlags: ['Confuses image with container', 'Unaware of layer caching order'],
      likelyFollowUp: ['How do you reduce image size?', 'What is the difference between CMD and ENTRYPOINT?', 'How does a container differ from a VM?'],
    },
    prerequisites: [],
    relatedTopics: ['dk-k8s-architecture', 'dk-k8s-workloads'],
    nextTopics: ['dk-k8s-architecture'],
    interviewQuestions: ['q-dk-container-vs-vm', 'q-dk-multistage'],
  },
  /* ----------------------------------------------------- Kubernetes Architecture */
  {
    id: 'dk-k8s-architecture',
    technology: T,
    title: 'Kubernetes Architecture',
    category: 'Kubernetes Core',
    slug: 'dk-k8s-architecture',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Kubernetes is a distributed operating system for containers — the control plane decides what to run, worker nodes run it.',
    mentalModel: 'The control plane is a thermostat: you declare desired state (spec), it continuously reconciles actual state to match. Worker nodes are the heating units.',
    memoryTip: 'etcd = source of truth. kube-apiserver = single entry point. scheduler = assigns pods to nodes. controller-manager = reconciliation loops. kubelet = node agent.',
    keyTerms: ['etcd', 'kube-apiserver', 'kube-scheduler', 'controller-manager', 'kubelet', 'kube-proxy', 'CRI', 'reconciliation loop'],
    visualIds: ['dk-k8s-arch'],
    interviewAnswer: `The control plane has four components: etcd (consistent, distributed KV store — the single source of truth), kube-apiserver (the only component that reads/writes etcd; all others talk to the API), kube-scheduler (watches for unscheduled pods, scores nodes by resource availability and affinity/anti-affinity, assigns a node), and controller-manager (runs built-in control loops: ReplicaSet controller, Deployment controller, etc.). Worker nodes run kubelet (watches PodSpecs from the API, reconciles containers via CRI), kube-proxy (programs iptables/IPVS rules for Service ClusterIPs), and the container runtime (containerd, CRI-O).`,
    detailedExplanation: `Everything in Kubernetes is level-triggered (reconciliation), not edge-triggered. A controller watches for objects whose actual state differs from desired state and acts to close the gap. This makes the system self-healing: if a node reboots, kubelet reports its pods as Unknown, the node controller marks them Terminating, and the ReplicaSet controller creates replacements elsewhere. etcd uses Raft consensus — writes require a quorum, so production clusters need 3 or 5 etcd nodes.`,
    internalWorking: `Pod scheduling pipeline: pod created with no nodeName → scheduler watches via informer → filters nodes (resource, taints, affinity) → scores remaining nodes → binds pod to winning node (writes nodeName to API). kubelet on that node watches its assigned pods, calls CRI to pull image and start container, reports status back. Controllers use "watch + list" with resource versions to avoid full API polls.`,
    codeExample: `# Inspect control plane components
kubectl get pods -n kube-system
# kube-apiserver, etcd, kube-scheduler, kube-controller-manager, coredns

# See reconciliation: delete a pod, watch it restart
kubectl delete pod my-app-7d4f9-abc12
kubectl get pods -w   # ReplicaSet controller creates a replacement immediately

# Node info — allocatable vs capacity
kubectl describe node worker-1 | grep -A5 Allocatable`,
    practicalExample: `When debugging why a pod is Pending, the first step is kubectl describe pod — look at Events. "Insufficient memory" means the scheduler cannot find a node with enough free allocatable memory. "0/3 nodes are available: 3 Taints" means taints are blocking scheduling — add a toleration or remove the taint.`,
    commonMistakes: [
      'Confusing container limits (cgroup ceiling) with requests (scheduling signal).',
      'Setting no resource requests — scheduler cannot make good placement decisions.',
      'Not understanding that kube-proxy is stateless — it only programs iptables rules.',
      'Single etcd node in production — no quorum = cluster brain-dead on restart.',
    ],
    seniorInsight: `Requests are what the scheduler uses; limits are enforced at runtime by cgroups. If a pod has no requests, it lands on whichever node is first — guaranteeing poor bin-packing. For JVM services, set requests = limits to avoid the scheduler moving pods when the JVM expands its heap after GC.`,
    aiAwareness: {
      strongAnswerShouldMention: ['etcd', 'reconciliation', 'kube-apiserver', 'scheduler scoring', 'requests vs limits'],
      weakAnswer: 'Kubernetes manages containers across machines.',
      redFlags: ['Thinks kubectl is a control plane component', 'Confuses kubelet with kubectl'],
      likelyFollowUp: ['What happens when the API server goes down?', 'How does the scheduler pick a node?', 'What is etcd and why does it need quorum?'],
    },
    prerequisites: ['dk-container-fundamentals'],
    relatedTopics: ['dk-k8s-workloads', 'dk-k8s-networking'],
    nextTopics: ['dk-k8s-workloads'],
    interviewQuestions: ['q-dk-k8s-arch', 'q-dk-requests-limits'],
  },
  /* ---------------------------------------------------- Workloads & Scaling */
  {
    id: 'dk-k8s-workloads',
    technology: T,
    title: 'Workloads, Health Probes & Auto-scaling',
    category: 'Workloads & Scaling',
    slug: 'dk-k8s-workloads',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Deployments manage stateless apps; StatefulSets manage ordered, identity-preserving workloads; HPA scales pods based on metrics.',
    mentalModel: 'Deployment = fleet of identical taxis (any one is fine). StatefulSet = assigned parking spaces (pod-0 is always pod-0, has its own PVC, and starts before pod-1).',
    memoryTip: 'Liveness = is the process alive? Readiness = can it serve traffic? Startup = give it time to boot.',
    keyTerms: ['Deployment', 'StatefulSet', 'DaemonSet', 'HPA', 'VPA', 'liveness probe', 'readiness probe', 'startup probe', 'PodDisruptionBudget'],
    visualIds: ['dk-hpa-flow'],
    interviewAnswer: `Deployments manage stateless replicated Pods via a ReplicaSet and support rolling updates with configurable maxUnavailable/maxSurge. StatefulSets give each pod a stable network identity (pod-0, pod-1) and its own PersistentVolumeClaim — essential for databases and Kafka brokers. DaemonSets run one pod per node (log collectors, monitoring agents). HPA watches metrics (CPU, memory, or custom via metrics-server/KEDA) and adjusts replica count automatically. Health probes: liveness restarts a stuck process; readiness removes an overloaded pod from Service load balancing; startup prevents premature liveness checks during slow JVM boot.`,
    detailedExplanation: `Rolling update strategy: during a rollout, Kubernetes creates new ReplicaSet pods (maxSurge) and terminates old ones (maxUnavailable) simultaneously, ensuring minimum availability. Set minReadySeconds to prevent new pods from counting as available until they've been ready for a period. PodDisruptionBudgets ensure voluntary disruptions (node drain, rolling update) never take too many pods offline at once — crucial for high availability. KEDA (Kubernetes Event-Driven Autoscaling) extends HPA to scale on queue depth, Prometheus queries, or any external metric.`,
    internalWorking: `HPA polls the metrics-server every 15 seconds, computes desiredReplicas = ceil(currentReplicas × (currentMetricValue / desiredMetricValue)), and updates the Deployment's replicas field. The Deployment controller then creates/deletes ReplicaSet pods to match. Scale-down has a 5-minute stabilisation window by default to avoid flapping. For JVM services, CPU HPA is unreliable — prefer request-rate or latency metrics via Prometheus adapter.`,
    codeExample: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0   # never reduce available pods below 3
      maxSurge: 1         # allow one extra pod during rollout
  template:
    spec:
      containers:
      - name: payment
        image: payment-service:1.4.2
        resources:
          requests: { cpu: "500m", memory: "512Mi" }
          limits:   { cpu: "1000m", memory: "512Mi" }
        readinessProbe:
          httpGet: { path: /actuator/health/readiness, port: 8080 }
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet: { path: /actuator/health/liveness, port: 8080 }
          initialDelaySeconds: 30
          periodSeconds: 10
        startupProbe:
          httpGet: { path: /actuator/health, port: 8080 }
          failureThreshold: 30   # 30 × 10s = 5 min for slow JVM boot
          periodSeconds: 10
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payment-service-hpa
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: payment-service }
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target: { type: Utilization, averageUtilization: 60 }`,
    practicalExample: `We use Spring Boot Actuator's split readiness/liveness endpoints (added in 2.3) on every service. During a long database migration the readiness probe fails automatically, removing the pod from the Service — requests route to healthy instances. Once the migration completes, readiness recovers with no manual intervention.`,
    commonMistakes: [
      'Using liveness probe on /health which checks DB — kills the pod during DB downtime instead of just stopping traffic.',
      'No startup probe for JVM apps — liveness fires before app finishes loading and kills it.',
      'Memory limit = memory request — no headroom for JVM GC burst; set limit 25% above request for JVM.',
      'No PodDisruptionBudget — a node drain kills all pods if they happen to be on the same node.',
    ],
    seniorInsight: `Split readiness and liveness: liveness should only check the process is alive and not deadlocked; readiness checks whether it can serve traffic (DB pool, downstream health). A DB outage should fail readiness (stop new traffic) but not liveness (don't restart — it won't help).`,
    aiAwareness: {
      strongAnswerShouldMention: ['readiness vs liveness', 'startup probe', 'HPA metrics', 'PodDisruptionBudget', 'StatefulSet identity'],
      weakAnswer: 'HPA scales pods based on CPU.',
      redFlags: ['Checking DB in liveness probe', 'No startup probe for JVM'],
      likelyFollowUp: ['What is a PodDisruptionBudget?', 'How does KEDA differ from HPA?', 'When do you use StatefulSet vs Deployment?'],
    },
    prerequisites: ['dk-k8s-architecture'],
    relatedTopics: ['dk-k8s-networking', 'dk-helm-gitops'],
    nextTopics: ['dk-k8s-networking'],
    interviewQuestions: ['q-dk-probes', 'q-dk-statefulset'],
  },
  /* ----------------------------------------------- Service Discovery & Networking */
  {
    id: 'dk-k8s-networking',
    technology: T,
    title: 'K8s Networking — Services, Ingress & Network Policies',
    category: 'Networking',
    slug: 'dk-k8s-networking',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Services give pods a stable virtual IP; Ingress routes external HTTP traffic; NetworkPolicy is the firewall between pods.',
    mentalModel: 'ClusterIP = internal phone extension. NodePort/LoadBalancer = external phone number. Ingress = reception desk routing calls to the right extension.',
    memoryTip: 'ClusterIP (default) = inside cluster only. NodePort = host port. LoadBalancer = cloud LB. ExternalName = DNS alias.',
    keyTerms: ['ClusterIP', 'NodePort', 'LoadBalancer', 'Ingress', 'CoreDNS', 'NetworkPolicy', 'CNI', 'kube-proxy', 'headless service'],
    visualIds: ['dk-k8s-network'],
    interviewAnswer: `A Service gives a stable virtual IP (ClusterIP) to a group of pods selected by label — kube-proxy programs iptables/IPVS rules so any packet to that VIP is DNAT'd to one of the pod IPs. CoreDNS resolves my-service.my-namespace.svc.cluster.local to the ClusterIP. Ingress exposes HTTP/HTTPS externally: an Ingress controller (nginx, Traefik, AWS ALB) watches Ingress resources and configures the reverse proxy accordingly. NetworkPolicy is the firewall: by default all pod-to-pod traffic is allowed; a NetworkPolicy with podSelector restricts ingress and egress to specific label selectors and ports.`,
    detailedExplanation: `Headless services (clusterIP: None) skip the VIP and kube-proxy — DNS returns A records for each pod IP directly. StatefulSets use headless services for stable DNS names: kafka-0.kafka-headless, kafka-1.kafka-headless. The CNI (Container Network Interface) plugin provides the IP-per-pod model: Calico, Cilium (eBPF-based, faster than iptables), Flannel. Cilium is increasingly preferred because it replaces kube-proxy with eBPF maps and provides native NetworkPolicy enforcement at L7.`,
    codeExample: `# NetworkPolicy: only allow payment-service to reach db on port 5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-payment-to-db
  namespace: banking
spec:
  podSelector:
    matchLabels: { app: postgres }
  policyTypes: [Ingress]
  ingress:
  - from:
    - podSelector:
        matchLabels: { app: payment-service }
    ports:
    - protocol: TCP
      port: 5432
---
# Ingress — route /api/payments to payment-service
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: banking-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts: [api.bank.example.com]
    secretName: bank-tls
  rules:
  - host: api.bank.example.com
    http:
      paths:
      - path: /api/payments
        pathType: Prefix
        backend:
          service: { name: payment-service, port: { number: 8080 } }`,
    practicalExample: `In a banking microservices cluster, we apply a default-deny NetworkPolicy to every namespace, then selectively open ports. The fraud-detection service can only be reached from payment-service — the network enforces this, not just application config.`,
    commonMistakes: [
      'Forgetting NetworkPolicy is additive — a default-deny policy requires explicit allow rules for CoreDNS and other infra.',
      'Using NodePort in production — exposes a port on every node; use LoadBalancer or Ingress.',
      'Not setting session affinity for stateful protocols — causes "user logged out" bugs on scaling.',
    ],
    seniorInsight: `Cilium with eBPF replaces kube-proxy entirely — no iptables chain traversal, L7 NetworkPolicy (HTTP path-based), and built-in Hubble observability showing live flow maps of which services talk to which. For security-sensitive workloads this replaces a separate service mesh.`,
    aiAwareness: {
      strongAnswerShouldMention: ['ClusterIP VIP', 'CoreDNS', 'NetworkPolicy default-deny', 'CNI', 'Ingress controller'],
      weakAnswer: 'Services expose pods to the network.',
      redFlags: ['Thinks LoadBalancer always provisions a cloud LB in local clusters', 'Unaware of CNI plugins'],
      likelyFollowUp: ['What is a headless service and when do you use it?', 'How does CoreDNS resolve service names?', 'What is Cilium?'],
    },
    prerequisites: ['dk-k8s-architecture'],
    relatedTopics: ['dk-helm-gitops'],
    nextTopics: ['dk-helm-gitops'],
    interviewQuestions: ['q-dk-service-types', 'q-dk-network-policy'],
  },
  /* --------------------------------------------------------- Helm & GitOps */
  {
    id: 'dk-helm-gitops',
    technology: T,
    title: 'Helm Charts & GitOps with ArgoCD',
    category: 'Helm & GitOps',
    slug: 'dk-helm-gitops',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Helm packages K8s manifests into versioned, templated releases; GitOps uses Git as the single source of truth with a reconciliation agent keeping the cluster in sync.',
    mentalModel: 'Helm = apt/npm for Kubernetes. ArgoCD = a controller that continuously diffs Git vs the cluster and applies changes automatically.',
    memoryTip: 'GitOps: Git is truth → CD agent → cluster. Push to Git, never kubectl apply in production.',
    keyTerms: ['Helm chart', 'values.yaml', 'helm upgrade', 'ArgoCD', 'ApplicationSet', 'GitOps', 'drift detection', 'sync wave'],
    visualIds: [],
    interviewAnswer: `Helm is the package manager for Kubernetes — a chart bundles templates, default values and dependencies. helm upgrade --install applies the chart and stores the release as a secret in the cluster; helm rollback reverts to a previous release snapshot. GitOps (ArgoCD/Flux) takes this further: the cluster's desired state lives in Git; a controller continuously reconciles actual cluster state to match. No developer ever kubectl applies directly — all changes go through a PR, get reviewed, merged to main, and ArgoCD detects the Git diff and syncs automatically. This gives complete auditability (Git history = change log) and instant rollback (revert the commit).`,
    detailedExplanation: `Helm chart structure: Chart.yaml (metadata), values.yaml (defaults), templates/ (Go-templated manifests). Override values per environment with -f prod-values.yaml. Use Helm hooks (pre-install, pre-upgrade, post-upgrade) for DB migrations. ArgoCD ApplicationSets generate Applications from a single template — one per cluster, one per team. Sync waves order resource creation: CRDs in wave 0, Namespace in wave 1, Deployments in wave 2. Sealed Secrets or External Secrets Operator keeps secrets out of plaintext Git.`,
    codeExample: `# values.yaml
replicaCount: 3
image:
  repository: bank/payment-service
  tag: "1.4.2"
resources:
  requests: { cpu: 500m, memory: 512Mi }
  limits:   { cpu: 1000m, memory: 512Mi }
ingress:
  enabled: true
  host: api.bank.example.com

# templates/deployment.yaml (excerpt)
replicas: {{ .Values.replicaCount }}
image: {{ .Values.image.repository }}:{{ .Values.image.tag }}

# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: payment-service
  namespace: argocd
spec:
  project: banking
  source:
    repoURL: https://github.com/bank/k8s-config
    targetRevision: main
    path: charts/payment-service
    helm:
      valueFiles: [values-prod.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: banking
  syncPolicy:
    automated:
      prune: true        # delete resources removed from Git
      selfHeal: true     # revert any manual kubectl apply`,
    practicalExample: `Every microservice at Julius Baer is deployed via ArgoCD. selfHeal: true means if a developer accidentally kubectl scales a Deployment to 1, ArgoCD reverts it to 3 within 3 minutes. prune: true means deleting a ConfigMap from Git removes it from the cluster — no orphaned resources.`,
    commonMistakes: [
      'Storing secrets in plain text in Git — use Sealed Secrets or External Secrets Operator.',
      'Using helm install without --atomic — a failed upgrade leaves the cluster in a broken state.',
      'No sync waves — CRDs applied after resources that use them causes errors.',
      'Disabling selfHeal — defeats the point of GitOps; manual changes accumulate as drift.',
    ],
    seniorInsight: `In a regulated environment, every cluster change must be traceable to a change request. GitOps gives you that for free: the PR is the change request, the merge commit is the approval, and ArgoCD's sync history is the deployment log. Audit teams love it.`,
    aiAwareness: {
      strongAnswerShouldMention: ['Helm as package manager', 'GitOps single source of truth', 'ArgoCD self-heal', 'Sealed Secrets', 'audit trail'],
      weakAnswer: 'Helm manages YAML files for Kubernetes.',
      redFlags: ['kubectl apply in production', 'Secrets in plaintext Git'],
      likelyFollowUp: ['How does ArgoCD handle secret management?', 'What is a sync wave?', 'How do you roll back with Helm vs GitOps?'],
    },
    prerequisites: ['dk-k8s-workloads'],
    relatedTopics: [],
    nextTopics: [],
    interviewQuestions: ['q-dk-gitops', 'q-dk-helm-vs-kustomize'],
  },
];
