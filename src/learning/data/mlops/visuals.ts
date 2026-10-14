import type { LearningVisual } from '../../types';

export const mlopsVisuals: LearningVisual[] = [
  {
    id: 'mlops-maturity-levels',
    topicId: 'mlops-fundamentals',
    type: 'comparison',
    title: 'MLOps Maturity Levels',
    description: 'The three maturity levels of ML operations, from manual notebooks to fully automated CI/CD.',
    memoryTip: 'Most teams are at Level 0–1. Level 2 is the goal: any code/data/config change triggers automated retrain → eval → deploy.',
    columns: [
      {
        label: 'Level 0 — Manual',
        nodes: [
          { id: 'l0-1', label: 'Train in notebook', caption: 'No reproducibility, no version control' },
          { id: 'l0-2', label: 'Export pickle/model file', caption: 'Manual handoff from scientist to engineer' },
          { id: 'l0-3', label: 'Manual deployment', caption: 'No rollback, no monitoring' },
        ],
      },
      {
        label: 'Level 1 — Automated Pipeline',
        nodes: [
          { id: 'l1-1', label: 'Automated training pipeline', caption: 'Airflow / Kubeflow / Metaflow' },
          { id: 'l1-2', label: 'Model registry', caption: 'MLflow — versioned, staged, with metrics' },
          { id: 'l1-3', label: 'Data versioning', caption: 'DVC — reproducible training datasets' },
          { id: 'l1-4', label: 'Monitoring dashboard', caption: 'Drift detection + prediction quality' },
        ],
      },
      {
        label: 'Level 2 — Full ML CI/CD',
        nodes: [
          { id: 'l2-1', label: 'Any change triggers pipeline', caption: 'Code + data + config → retrain → eval → deploy' },
          { id: 'l2-2', label: 'Feature store', caption: 'Feast / Tecton — no training-serving skew' },
          { id: 'l2-3', label: 'Shadow/canary deployment', caption: 'A/B experiments, safe rollout' },
          { id: 'l2-4', label: 'Automated retraining on drift', caption: 'PSI trigger → retrain → promote if better' },
        ],
      },
    ],
  },
  {
    id: 'mlops-drift-detection',
    topicId: 'mlops-model-monitoring',
    type: 'flow',
    title: 'Drift Detection & Retraining Flow',
    description: 'How to detect model drift and respond with automated retraining.',
    memoryTip: 'Log serving features → run PSI/KS daily → performance gate on delayed labels → retrain → shadow → human approval → promote.',
    nodes: [
      { id: 'log', label: 'Log serving features', caption: 'Every prediction request saves feature vector' },
      { id: 'check', label: 'Daily distribution check', caption: 'PSI / KS test vs training baseline', topicId: 'mlops-model-monitoring' },
      { id: 'drift', label: 'Drift threshold crossed?', caption: 'PSI > 0.2 or KS p < 0.05 → alert' },
      { id: 'labels', label: 'Delayed label join', caption: 'Chargebacks arrive ~14d later → real precision/recall' },
      { id: 'gate', label: 'Performance gate', caption: 'Precision drop > 3% vs baseline → trigger retrain' },
      { id: 'retrain', label: 'Automated retrain', caption: 'Recent N months → MLflow experiment log' },
      { id: 'shadow', label: 'Shadow deploy', caption: 'New model receives live traffic, predictions not served' },
      { id: 'approve', label: 'Human approval + promote', caption: 'If better: register as production in model registry' },
    ],
    edges: [
      { from: 'log', to: 'check' }, { from: 'check', to: 'drift' }, { from: 'drift', to: 'labels' },
      { from: 'labels', to: 'gate' }, { from: 'gate', to: 'retrain' }, { from: 'retrain', to: 'shadow' },
      { from: 'shadow', to: 'approve' },
    ],
  },
];
