import type { LearningVisual } from '../../types';

export const dockerK8sVisuals: LearningVisual[] = [
  {
    id: 'dk-image-layers',
    topicId: 'dk-container-fundamentals',
    type: 'architecture',
    title: 'Docker Image Layer Model',
    description: 'Read-only image layers + thin writable container layer via OverlayFS',
    nodes: [
      { id: 'scratch', label: 'Base OS Layer', description: 'Alpine Linux 5 MB — rarely changes, cached forever' },
      { id: 'jre', label: 'JRE Layer', description: 'Eclipse Temurin 21 JRE — changes only on security patch' },
      { id: 'deps', label: 'Dependencies Layer', description: 'mvn dependency:go-offline — cached unless pom.xml changes' },
      { id: 'app', label: 'Application JAR Layer', description: 'COPY app.jar — changes every build, must be last' },
      { id: 'container', label: 'Writable Container Layer', description: 'Ephemeral: deleted when container stops. Tiny.' },
    ],
    memoryTip: 'Layer order matters: rarely-changing layers first (base, deps), frequently-changing last (app code). Cache invalidates from first changed layer downward.',
  },
  {
    id: 'dk-k8s-arch',
    topicId: 'dk-k8s-architecture',
    type: 'comparison',
    title: 'Kubernetes Control Plane & Worker Node',
    description: 'Control plane manages desired state; workers run containers',
    columns: [
      {
        label: 'Control Plane',
        nodes: [
          { id: 'etcd', label: 'etcd', description: 'Distributed KV store — single source of truth. Raft quorum.' },
          { id: 'api', label: 'kube-apiserver', description: 'Only component that reads/writes etcd. All traffic through here.' },
          { id: 'sched', label: 'kube-scheduler', description: 'Watches for unscheduled pods, scores nodes, assigns nodeName.' },
          { id: 'ctrl', label: 'controller-manager', description: 'Runs reconciliation loops: ReplicaSet, Deployment, Node controllers.' },
        ],
      },
      {
        label: 'Worker Node',
        nodes: [
          { id: 'kubelet', label: 'kubelet', description: 'Node agent. Reconciles PodSpecs via CRI. Reports status.' },
          { id: 'proxy', label: 'kube-proxy', description: 'Programs iptables/IPVS for Service ClusterIPs.' },
          { id: 'cri', label: 'containerd / CRI-O', description: 'Container runtime. Pulls images, starts containers.' },
          { id: 'cni', label: 'CNI plugin', description: 'Provides pod IP-per-pod networking (Calico, Cilium, Flannel).' },
        ],
      },
    ],
    memoryTip: 'etcd → API server → controllers → scheduler → kubelet. Nothing talks directly to etcd except the API server.',
  },
  {
    id: 'dk-hpa-flow',
    topicId: 'dk-k8s-workloads',
    type: 'flow',
    title: 'HPA Autoscaling Decision Loop',
    description: 'How the Horizontal Pod Autoscaler decides replica count every 15 seconds',
    nodes: [
      { id: 'metrics', label: 'metrics-server', description: 'Aggregates CPU/memory from kubelets every 60s' },
      { id: 'hpa', label: 'HPA Controller', description: 'Polls metrics-server every 15s, computes desired replicas' },
      { id: 'formula', label: 'desiredReplicas formula', description: 'ceil(current × actual/target) — e.g. 3 pods at 80% CPU, 60% target → 4' },
      { id: 'deploy', label: 'Deployment', description: 'Replica count updated; ReplicaSet creates/deletes pods' },
      { id: 'stabilise', label: 'Stabilisation Window (5 min)', description: 'Prevents flapping on scale-down. Scale-out is immediate.' },
    ],
    memoryTip: 'HPA is reactive. For bursty traffic use KEDA with queue-depth metrics — scales before CPU spikes.',
  },
  {
    id: 'dk-k8s-network',
    topicId: 'dk-k8s-networking',
    type: 'comparison',
    title: 'K8s Networking: Service Types & Traffic Flow',
    description: 'How traffic reaches pods through different Service types',
    columns: [
      {
        label: 'Internal Traffic',
        nodes: [
          { id: 'cip', label: 'ClusterIP (default)', description: 'Virtual IP inside cluster only. kube-proxy DNAT → pod IP.' },
          { id: 'dns', label: 'CoreDNS', description: 'svc.namespace.svc.cluster.local resolves to ClusterIP.' },
          { id: 'headless', label: 'Headless (ClusterIP: None)', description: 'DNS returns pod IPs directly. Used by StatefulSets.' },
          { id: 'netpol', label: 'NetworkPolicy', description: 'L3/L4 firewall enforced by CNI. Default allow → add deny rules.' },
        ],
      },
      {
        label: 'External Traffic',
        nodes: [
          { id: 'np', label: 'NodePort', description: 'Opens port on every node (30000-32767). Dev/testing only.' },
          { id: 'lb', label: 'LoadBalancer', description: 'Provisions cloud LB (AWS ALB/NLB). Routes to NodePort.' },
          { id: 'ingress', label: 'Ingress (L7)', description: 'HTTP/HTTPS routing, TLS termination, path-based rules.' },
          { id: 'ctrl', label: 'Ingress Controller', description: 'nginx/Traefik/AWS ALB — watches Ingress resources.' },
        ],
      },
    ],
    memoryTip: 'Production: Ingress for HTTP, LoadBalancer for TCP. Never NodePort — exposes ports on all nodes, bypasses Ingress.',
  },
];
