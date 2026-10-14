import type { InterviewQuestion } from '../../types';

const T = 'mlops';

export const mlopsQuestions: InterviewQuestion[] = [
  {
    id: 'q-mlops-deployment-gap',
    technology: T,
    question: 'Why do 80% of ML projects fail to reach production, and what does MLOps solve?',
    category: 'MLOps Core',
    difficulty: 'intermediate',
    tags: ['MLOps', 'deployment gap', 'production ML', 'reproducibility'],
    quickAnswer: 'The deployment gap: notebooks are brittle, non-reproducible, and have no CI/CD, monitoring, or serving infrastructure. MLOps closes the gap with pipelines, versioning, evaluation gates, and monitoring.',
    interviewAnswer: `The "deployment gap" exists because a working notebook is very far from a production system. Common failure modes:

Technical:
- No reproducibility: different library versions, random seeds, data ordering. "Works on my laptop."
- Training-serving skew: features computed differently in training vs production.
- No monitoring: model silently degrades when data distribution shifts.
- Manual, fragile deployment: copy-paste model files, undocumented serving endpoints.

Organisational:
- Data scientists and engineers work in silos with no shared tooling or contracts.
- No CI/CD equivalent: model changes are deployed manually with no automated tests.
- No rollback plan: a bad model cannot be quickly reverted.

MLOps solutions:
- Reproducibility: DVC for data versioning, MLflow for experiment tracking, Docker for environment.
- Training-serving consistency: feature store, model registry with the exact training environment.
- CI/CD: automated training → evaluation → registration → deployment pipelines.
- Monitoring: data drift detection, prediction quality monitoring, automated retraining triggers.`,
    keyTerms: ['deployment gap', 'reproducibility', 'CI/CD for ML', 'feature skew', 'model monitoring'],
    commonMistakes: ['Treating the deployment gap as a purely technical problem (it is also organisational)'],
    followUpQuestions: [
      { question: 'What are the three maturity levels of MLOps?', hint: 'Level 0: manual; Level 1: automated retraining; Level 2: full CI/CD with automated pipeline.' },
    ],
    interviewerIntent: 'Tests high-level MLOps motivation and understanding of the problem space.',
    whatIsTested: ['MLOps necessity', 'Deployment gap causes', 'MLOps components'],
    topicId: 'mlops-fundamentals',
  },
  {
    id: 'q-mlops-training-serving-skew',
    technology: T,
    question: 'What is training-serving skew and how do you prevent it?',
    category: 'MLOps Core',
    difficulty: 'advanced',
    tags: ['training-serving skew', 'feature store', 'feature pipeline', 'production ML'],
    quickAnswer: 'When features are computed differently in training vs production, causing systematic prediction differences. Prevented by a feature store that defines and serves features consistently.',
    interviewAnswer: `Training-serving skew happens when the feature value the model was trained on differs from the feature value it receives at serving time.

Common causes:
1. Different code: training uses pandas rolling mean, production uses a SQL query with slightly different time window.
2. Different data: training uses a batch dump of yesterday's data, production queries a real-time stream.
3. Data leakage: training accidentally uses future information (a feature computed after the label event).
4. Pipeline bugs: a normalisation step applied in training but missing in the serving code.

Prevention:
- Feature store: define feature computation once (Python function or SQL), materialize to both offline (training) and online (serving) stores. Same code path, guaranteed consistency.
- Point-in-time correct joins: when building training datasets, join feature values as they were at the time of each training example's label event — prevents leakage.
- Log serving features: log the exact feature vector used for each prediction. When labels arrive, join them back to compute real accuracy. Also detects drift.
- Integration tests: a test that runs the training pipeline and the serving pipeline on the same input and asserts the feature vectors are identical.`,
    codeExample: `# Detect skew: log features at serving time, compare with training distribution
import pandas as pd
from scipy.stats import ks_2samp

train_features = pd.read_parquet("training_features.parquet")
serve_features = pd.read_parquet("served_features_last_7d.parquet")

for col in ["avg_spend_30d", "txn_count_7d"]:
    stat, p_value = ks_2samp(train_features[col], serve_features[col])
    status = "DRIFT DETECTED" if p_value < 0.05 else "ok"
    print(f"{col:20s}  KS={stat:.3f}  p={p_value:.4f}  {status}")`,
    codeLanguage: 'Python',
    expectedOutput: 'avg_spend_30d         KS=0.421  p=0.0002  DRIFT DETECTED\ntxn_count_7d          KS=0.051  p=0.8200  ok',
    followUpQuestions: [
      { question: 'What is point-in-time correctness and why does it matter?', hint: 'Using only features available at prediction time during training — prevents future leakage.' },
    ],
    keyTerms: ['training-serving skew', 'feature store', 'KS test', 'feature logging', 'point-in-time correctness'],
    commonMistakes: ['Not logging serving features (cannot measure skew)'],
    interviewerIntent: 'Tests production ML engineering knowledge — a common source of hard-to-debug model failures.',
    whatIsTested: ['Skew causes', 'Feature store role', 'Statistical skew detection'],
    topicId: 'mlops-feature-store',
  },
  {
    id: 'q-mlops-model-drift',
    technology: T,
    question: 'How do you detect and respond to model drift in production?',
    category: 'MLOps Core',
    difficulty: 'advanced',
    tags: ['model drift', 'data drift', 'concept drift', 'PSI', 'retraining', 'monitoring'],
    quickAnswer: 'Monitor input feature distributions (PSI/KS test for drift), prediction distribution, and proxy metrics for concept drift. Alert and trigger retraining when drift exceeds thresholds.',
    interviewAnswer: `Two types:
- Data drift: input features change (new product categories, seasonal shifts, upstream data pipeline changes). Model was not trained on this distribution.
- Concept drift: the X→y relationship changes (fraud patterns evolve, consumer behaviour shifts post-COVID). Even the same inputs should now produce different outputs.

Detection:
- Feature drift: PSI > 0.2 or KS p < 0.05 on individual features. Run daily on a sample of serving requests vs the training set distribution.
- Prediction drift: monitor the distribution of output scores/classes. Sudden shift in positive-class rate is often an early signal.
- Performance drift (with delayed labels): for fraud, labels (chargebacks) arrive weeks later. Track proxy metrics (dispute rate, manual review rate) as leading indicators. When real labels arrive, compute actual precision/recall.

Response ladder:
1. Alert → SRE investigates → root cause: upstream data issue? Retrain not needed.
2. Data drift confirmed → retrain on recent data → shadow deploy → evaluate → promote.
3. Concept drift confirmed → new feature engineering or model architecture may be needed; coordinate with data scientists.

Automation: connect drift alerts to automated retraining pipelines (MLflow + Airflow) with a human approval step before promotion to production.`,
    followUpQuestions: [
      { question: 'How do you set drift thresholds?', hint: 'Empirically: simulate past drift events, find the PSI/KS value that preceded performance degradation, set threshold slightly below that.' },
    ],
    keyTerms: ['PSI', 'KS test', 'prediction drift', 'delayed labels', 'proxy metrics', 'automated retraining'],
    commonMistakes: ['No ground truth labels pipeline for real accuracy measurement', 'Retraining on drifted data without diagnosing the root cause'],
    interviewerIntent: 'Tests production ML monitoring maturity — differentiates senior from junior ML engineers.',
    whatIsTested: ['Drift types', 'Detection methods', 'Retraining triggers', 'Production monitoring'],
    topicId: 'mlops-model-monitoring',
  },
  {
    id: 'q-mlops-aiops-vs-mlops',
    technology: T,
    question: 'What is the difference between MLOps and AIOps? How do they relate?',
    category: 'AIOps',
    difficulty: 'intermediate',
    tags: ['MLOps', 'AIOps', 'MTTD', 'MTTR', 'observability', 'IT operations'],
    quickAnswer: 'MLOps: operational discipline for ML/AI applications. AIOps: using AI/ML to run IT operations better. Complementary — AIOps may use MLOps-built models to power its anomaly detection.',
    interviewAnswer: `MLOps: applies DevOps practices (CI/CD, versioning, monitoring) to the development and operation of machine learning systems. It answers: "How do I reliably build, deploy and maintain ML models?" Stakeholders: ML engineers, data scientists, data engineers.

AIOps (Artificial Intelligence for IT Operations): uses ML and AI on IT observability data (metrics, logs, traces, events) to improve operational excellence — anomaly detection, event correlation, root cause analysis, and automated remediation. It answers: "How do I use AI to run my infrastructure more reliably?" Stakeholders: SREs, platform engineers, IT operations.

Relationship: AIOps systems often contain ML models, which need MLOps practices to build and maintain — so AIOps is both a consumer and a showcase of MLOps. An AIOps anomaly detection model has a feature store (log embeddings, metric windows), a training pipeline, a model registry, and production monitoring — all MLOps artefacts.

In practice: a team may deliver an AIOps capability (reduce MTTD on production incidents) using MLOps tooling (MLflow, Kubeflow) and LLMOps practices (LLM-driven RCA).`,
    followUpQuestions: [
      { question: 'What are the key KPIs for AIOps?', hint: 'MTTD (time to detect), MTTR (time to resolve), alert-to-incident ratio (noise reduction), auto-remediation success rate.' },
    ],
    keyTerms: ['MLOps', 'AIOps', 'MTTD', 'MTTR', 'observability', 'anomaly detection', 'event correlation'],
    commonMistakes: ['Confusing MLOps with AIOps — they are about different things'],
    interviewerIntent: 'Distinguishes candidates who have broad platform/AI engineering knowledge.',
    whatIsTested: ['MLOps vs AIOps distinction', 'Relationship and overlap', 'KPIs'],
    topicId: 'aiops-fundamentals',
  },
];
