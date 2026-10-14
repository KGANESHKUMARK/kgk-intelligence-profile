import type { LearningTopic } from '../../types';

const T = 'mlops';

export const mlopsTopics: LearningTopic[] = [
  /* ────────────────────────────────────────────────────── Core MLOps ─────── */
  {
    id: 'mlops-fundamentals',
    technology: T,
    title: 'MLOps — Principles & Maturity Levels',
    category: 'MLOps Core',
    slug: 'mlops-fundamentals',
    status: 'published',
    difficulty: 'intermediate',
    oneLineMeaning: 'MLOps applies DevOps practices (CI/CD, monitoring, reproducibility) to ML systems, which are unlike normal software because the code, data and model all change.',
    mentalModel: 'MLOps is DevOps + data version control + model registry + drift monitoring. The extra dimension is that the model itself is a stateful artefact that must be versioned, tested and monitored like code.',
    memoryTip: 'MLOps maturity: Level 0 = manual; Level 1 = automated retraining; Level 2 = full ML CI/CD. Most companies are at Level 0–1.',
    keyTerms: ['model registry', 'feature store', 'data versioning', 'CI/CD for ML', 'experiment tracking', 'model drift', 'pipeline orchestration', 'MLflow', 'Kubeflow'],
    interviewAnswer: `MLOps addresses the "deployment gap": 80% of ML projects that work in a notebook never make it to production. The gap exists because ML systems have three interdependent artefacts: code, data, and model weights — all of which can change.

MLOps maturity levels (Google):
- Level 0: manual experiment → manual deployment. Scientist hands off a pickle file. No reproducibility, no monitoring.
- Level 1: automated retraining pipeline. Feature pipeline → training → evaluation → model registry → automated deployment when metrics improve. Data and model versioning.
- Level 2: full ML CI/CD. Changes to pipeline code trigger automated retrain+eval+shadow deploy. Feature store ensures training/serving consistency. Monitoring pipeline with automated retraining on drift.

Core components: Experiment tracking (MLflow, W&B — log hyperparameters, metrics, artifacts), Model registry (version, stage: staging/production, metadata), Feature store (Feast, Tecton — consistent feature computation for training and serving, prevents feature skew), Pipeline orchestration (Kubeflow, Airflow, Metaflow), Model serving (Seldon, BentoML, SageMaker Endpoints).`,
    codeExample: `import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

X, y = make_classification(n_samples=1000, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

with mlflow.start_run():
    params = {"n_estimators": 100, "max_depth": 5}
    mlflow.log_params(params)

    model = RandomForestClassifier(**params, random_state=42)
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))

    mlflow.log_metric("accuracy", acc)
    mlflow.sklearn.log_model(model, "model", registered_model_name="fraud_classifier")
    print(f"Accuracy: {acc:.3f}  — run logged to MLflow")`,
    codeLanguage: 'Python',
    codeOutput: 'Accuracy: 0.924  — run logged to MLflow',
    commonMistakes: [
      'Training on different features than are available at serving time (training-serving skew).',
      'No model versioning — cannot roll back to the previous production model.',
      'Monitoring only system metrics (CPU/RAM) not model metrics (prediction distribution, accuracy).',
    ],
    prerequisites: [],
    relatedTopics: ['mlops-model-monitoring', 'mlops-feature-store', 'aiops-fundamentals'],
    nextTopics: ['mlops-model-monitoring', 'mlops-feature-store'],
    references: [
      { title: 'MLOps Principles — Google Cloud', url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', source: 'Google Cloud', type: 'documentation' },
    ],
    interviewQuestions: ['q-mlops-deployment-gap', 'q-mlops-training-serving-skew'],
  },
  {
    id: 'mlops-model-monitoring',
    technology: T,
    title: 'Model Monitoring & Drift Detection',
    category: 'MLOps Core',
    slug: 'mlops-model-monitoring',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Continuously measuring whether a deployed model is performing as expected — detecting data drift, concept drift, and prediction quality degradation before they cause real harm.',
    mentalModel: 'A deployed model is like a factory machine: it needs regular calibration checks. The data distribution is the raw material; if the material changes, the output quality degrades silently unless you are measuring.',
    memoryTip: 'Data drift = input distribution changed. Concept drift = the relationship between X and y changed. Monitor both input distribution and prediction quality separately.',
    keyTerms: ['data drift', 'concept drift', 'PSI', 'KL divergence', 'Wasserstein distance', 'prediction monitoring', 'Evidently AI', 'Seldon Alibi Detect', 'alerting'],
    interviewAnswer: `Model degradation in production has two root causes:
1. Data drift: the distribution of input features changes (seasonal shifts, new customer segments, data pipeline changes). The model was trained on data that no longer represents the incoming data.
2. Concept drift: the underlying relationship between features and target changes (fraud patterns evolve, economic conditions change). Even if inputs look the same, the right prediction is different.

Detection:
- Statistical tests: PSI (Population Stability Index) for categorical feature shift, KS test or Wasserstein distance for numerical; threshold PSI > 0.2 as alert.
- Ground truth delay: for models where labels arrive later (fraud labels from chargebacks take weeks), monitor proxy metrics (chargeback rate, customer complaint rate) until real labels are available.
- Prediction distribution monitoring: track the distribution of model output scores/classes. A shift in score distribution often precedes performance degradation.
- Shadow model: deploy a new candidate model in shadow mode (receives the same traffic but does not serve predictions); compare score distributions with the current production model.

Remediation: retrain on recent data (with or without feature engineering changes), update feature pipelines, recalibrate thresholds.`,
    codeExample: `from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, DataQualityPreset
import pandas as pd

# Reference: training data distribution
reference = pd.DataFrame({"score": [0.1, 0.2, 0.15, 0.3], "amount": [100, 200, 150, 500]})
# Current: last 24h of serving data
current   = pd.DataFrame({"score": [0.6, 0.7, 0.65, 0.8], "amount": [100, 200, 150, 500]})

report = Report(metrics=[DataDriftPreset(), DataQualityPreset()])
report.run(reference_data=reference, current_data=current)
report.save_html("drift_report.html")
print("Drift report saved — check score feature for significant drift")`,
    codeLanguage: 'Python',
    codeOutput: 'Drift report saved — check score feature for significant drift',
    commonMistakes: [
      'Monitoring only system metrics (CPU, memory) not model output quality.',
      'No ground truth labels pipeline — cannot measure real accuracy in production.',
      'Retraining immediately on drifted data without root-cause analysis (bad data upstream).',
    ],
    prerequisites: ['mlops-fundamentals'],
    relatedTopics: ['mlops-fundamentals', 'aiops-fundamentals'],
    references: [
      { title: 'Evidently AI — Open-source model monitoring', url: 'https://docs.evidentlyai.com/', source: 'Evidently AI', type: 'documentation' },
    ],
    interviewQuestions: ['q-mlops-model-drift'],
  },
  {
    id: 'mlops-feature-store',
    technology: T,
    title: 'Feature Store — Eliminating Training-Serving Skew',
    category: 'MLOps Core',
    slug: 'mlops-feature-store',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'A centralised system that computes, stores and serves ML features consistently for both model training and online inference, eliminating the most common source of production degradation.',
    mentalModel: 'Without a feature store: the data scientist computes "average spend last 30 days" in a training notebook; the engineer computes it differently in the production API. Predictions are different. The feature store is the single contract for feature definitions.',
    memoryTip: 'Online store = low-latency serving (Redis). Offline store = bulk training reads (S3/BigQuery). Feature pipeline = defines the computation once.',
    keyTerms: ['feature store', 'training-serving skew', 'online store', 'offline store', 'point-in-time correct joins', 'Feast', 'Tecton', 'Vertex AI Feature Store'],
    interviewAnswer: `Training-serving skew is the most common cause of silent model degradation: training uses one computation of a feature (e.g. rolling average in pandas), production uses a different implementation (SQL or a different time window). The predictions are systematically different from what the model was trained to produce.

A feature store solves this by defining features once, computing them in a pipeline, and serving the same values to both training and production:
- Offline store: materialises features into a data warehouse (BigQuery, Redshift, S3/Parquet) for training; supports point-in-time correct joins so the model is not trained on features that were not available at prediction time (avoiding future leakage).
- Online store: low-latency key-value store (Redis, DynamoDB) for real-time feature retrieval at serving time. Features are precomputed and written here by the feature pipeline.
- Feature pipeline: runs on a schedule or event-driven; computes feature values and writes to both online and offline stores.

Tools: Feast (open-source), Tecton (managed), Vertex AI Feature Store, AWS SageMaker Feature Store.`,
    codeExample: `from feast import FeatureStore, FeatureService, Entity, Feature, FeatureView, FileSource, ValueType

# Define the feature view once — used for both training and serving
account_features = FeatureView(
    name="account_features",
    entities=["account_id"],
    features=[
        Feature(name="avg_spend_30d", dtype=ValueType.FLOAT),
        Feature(name="txn_count_7d", dtype=ValueType.INT64),
    ],
    source=FileSource(path="data/account_features.parquet"),
)

# Training: point-in-time correct historical features
store = FeatureStore(repo_path=".")
training_df = store.get_historical_features(
    entity_df=labels_df,  # DataFrame with entity keys and event_timestamps
    features=["account_features:avg_spend_30d", "account_features:txn_count_7d"],
).to_df()

# Serving: real-time feature lookup (same definition, online store)
feature_vector = store.get_online_features(
    features=["account_features:avg_spend_30d"],
    entity_rows=[{"account_id": "A001"}],
).to_dict()`,
    codeLanguage: 'Python',
    commonMistakes: [
      'Computing features differently in notebooks vs production (training-serving skew).',
      'No point-in-time correctness — using future feature values during historical training (leakage).',
      'Not versioning feature definitions alongside model versions.',
    ],
    prerequisites: ['mlops-fundamentals'],
    relatedTopics: ['mlops-model-monitoring'],
    references: [
      { title: 'Feast — Open-source Feature Store', url: 'https://docs.feast.dev/', source: 'Feast', type: 'documentation' },
    ],
    interviewQuestions: ['q-mlops-training-serving-skew'],
  },

  /* ────────────────────────────────────────────────────── AIOps ──────────── */
  {
    id: 'aiops-fundamentals',
    technology: T,
    title: 'AIOps — AI for IT Operations',
    category: 'AIOps',
    slug: 'aiops-fundamentals',
    status: 'published',
    difficulty: 'advanced',
    oneLineMeaning: 'Using ML and AI to automate and enhance IT operations — anomaly detection, root cause analysis, event correlation, and incident prediction on observability data.',
    mentalModel: 'A senior SRE who never sleeps: AIOps ingests millions of log lines and metrics, spots the unusual signal, correlates it to a root cause, and either pages the right team or resolves it automatically.',
    memoryTip: 'Observe → Detect (anomaly) → Correlate (events) → Diagnose (root cause) → Act (auto-remediate or alert). The "AI" is in each step.',
    keyTerms: ['anomaly detection', 'root cause analysis', 'event correlation', 'predictive alerting', 'log analytics', 'MTTD', 'MTTR', 'Dynatrace', 'Splunk ITSI', 'OpenAI on logs'],
    interviewAnswer: `AIOps applies machine learning to observability data (metrics, logs, traces, events) to reduce alert fatigue and accelerate incident resolution.

Core use cases:
1. Anomaly detection: time-series models (Facebook Prophet, Isolation Forest, LSTM) detect metric anomalies (unusual latency spike, memory leak pattern) without fixed static thresholds — adaptive to seasonality and trends.
2. Event correlation / noise reduction: ML clusters thousands of alerts from different monitoring tools into a handful of probable incidents, reducing alert fatigue by 70–90%.
3. Root cause analysis: graph-based approaches trace cascading failures across service dependencies; topology-aware correlation identifies the upstream cause of a downstream alert storm.
4. Predictive alerting: detect the early signal of an impending incident (gradual memory growth, increasing error rate) before SLO breach.
5. Auto-remediation: for known issue types (OOM → restart pod, disk full → purge old logs), trigger automated runbooks. Agentic LLMs increasingly drive this.

Metrics: MTTD (Mean Time to Detect) and MTTR (Mean Time to Recover) are the KPIs. A good AIOps deployment reduces MTTD from 30 min to < 5 min and MTTR from hours to 30 min on known incident types.`,
    codeExample: `import numpy as np
from scipy import stats

# Simple anomaly detection — Z-score on rolling window
def detect_anomalies(metric_values: list[float], window: int = 20,
                     threshold: float = 3.0) -> list[int]:
    """Return indices of anomalous points."""
    anomalies = []
    for i in range(window, len(metric_values)):
        window_data = metric_values[i - window:i]
        z = abs(stats.zscore([metric_values[i]], ddof=0,
                              *[np.mean(window_data), np.std(window_data)]))
        # Simplified: just compute z directly
        mean, std = np.mean(window_data), np.std(window_data) or 1
        z_score = abs((metric_values[i] - mean) / std)
        if z_score > threshold:
            anomalies.append(i)
    return anomalies

# Simulate latency metrics with a spike
latency_ms = [50] * 30 + [52, 51, 200, 210, 55] + [50] * 15  # spike at index 32-33
anomalies = detect_anomalies(latency_ms)
print("Anomaly indices:", anomalies)   # [32, 33]`,
    codeLanguage: 'Python',
    codeOutput: 'Anomaly indices: [32, 33]',
    whyOutput: 'The rolling Z-score detects the 200ms spike against a 50ms baseline (Z ≈ 150). Static thresholds (e.g. alert if > 100ms) would flood during legitimate traffic spikes; rolling Z-score adapts to the current distribution.',
    commonMistakes: [
      'Static thresholds for seasonal metrics (high false-positive rate outside normal hours).',
      'Alert fatigue from correlating alerts into too-granular incidents.',
      'Auto-remediation without a "dry run" mode for new runbooks.',
    ],
    prerequisites: ['mlops-fundamentals'],
    relatedTopics: ['mlops-fundamentals', 'mlops-model-monitoring'],
    references: [
      { title: 'AIOps — Gartner Market Guide', url: 'https://www.gartner.com/en/information-technology/glossary/aiops-artificial-intelligence-for-it-operations', source: 'Gartner', type: 'article' },
    ],
    interviewQuestions: ['q-mlops-aiops-vs-mlops'],
  },
];
