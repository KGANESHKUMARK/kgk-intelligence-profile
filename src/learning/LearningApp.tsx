import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { LearningLayout } from './components/LearningLayout';
import { GENERIC_TRACK_IDS } from './utils/tech';

/**
 * Route-level code splitting: the resume portal at "/" never downloads any
 * of this, and heavier learning pages load only when visited.
 */
const LearningHome = lazy(() => import('./pages/LearningHome'));
const JavaHome = lazy(() => import('./pages/JavaHome'));
const KafkaHome = lazy(() => import('./pages/KafkaHome'));
const ReactHome = lazy(() => import('./pages/ReactHome'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const InterviewPractice = lazy(() => import('./pages/InterviewPractice'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const VisualQuiz = lazy(() => import('./pages/VisualQuiz'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const VersionsPage = lazy(() => import('./pages/VersionsPage'));
const VersionDetail = lazy(() => import('./pages/VersionDetail'));
const LatestJava = lazy(() => import('./pages/LatestJava'));
const TechHome = lazy(() => import('./pages/TechHome'));

/**
 * Generic module routes (Spring Boot, System Design, GenAI, MLOps, Angular…)
 * resolve the module from the URL. Unknown modules fall back to the hub.
 */
type GenericPage = 'home' | 'topic' | 'category' | 'interview' | 'flashcards' | 'glossary';

function GenericTrackRoute({ page }: { page: GenericPage }) {
  const { tech = '' } = useParams();
  if (!GENERIC_TRACK_IDS.includes(tech)) return <Navigate to="/learning" replace />;
  switch (page) {
    case 'home':
      return <TechHome technology={tech} />;
    case 'topic':
      return <TopicPage key={tech} technology={tech} />;
    case 'category':
      return <CategoryPage technology={tech} />;
    case 'interview':
      return <InterviewPractice key={tech} technology={tech} />;
    case 'flashcards':
      return <Flashcards key={tech} technology={tech} />;
    case 'glossary':
      return <GlossaryPage key={tech} technology={tech} />;
  }
}

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span className="mono-label animate-pulse">Loading…</span>
    </div>
  );
}

export default function LearningApp() {
  return (
    <LearningLayout>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route index element={<LearningHome />} />

          {/* Java module */}
          <Route path="java" element={<JavaHome />} />
          <Route path="java/topic/:topicId" element={<TopicPage technology="java" />} />
          <Route path="java/category/:category" element={<CategoryPage technology="java" />} />
          <Route path="java/interview" element={<InterviewPractice technology="java" />} />
          <Route path="java/flashcards" element={<Flashcards technology="java" />} />
          <Route path="java/quiz" element={<VisualQuiz />} />
          <Route path="java/glossary" element={<GlossaryPage technology="java" />} />
          <Route path="java/versions" element={<VersionsPage />} />
          <Route path="java/versions/:version" element={<VersionDetail />} />
          <Route path="java/latest" element={<LatestJava />} />

          {/* Kafka module */}
          <Route path="kafka" element={<KafkaHome />} />
          <Route path="kafka/topic/:topicId" element={<TopicPage technology="kafka" />} />
          <Route path="kafka/category/:category" element={<CategoryPage technology="kafka" />} />
          <Route path="kafka/interview" element={<InterviewPractice technology="kafka" />} />
          <Route path="kafka/flashcards" element={<Flashcards technology="kafka" />} />
          <Route path="kafka/glossary" element={<GlossaryPage technology="kafka" />} />

          {/* React module */}
          <Route path="react" element={<ReactHome />} />
          <Route path="react/topic/:topicId" element={<TopicPage technology="react" />} />
          <Route path="react/category/:category" element={<CategoryPage technology="react" />} />
          <Route path="react/interview" element={<InterviewPractice technology="react" />} />
          <Route path="react/flashcards" element={<Flashcards technology="react" />} />
          <Route path="react/glossary" element={<GlossaryPage technology="react" />} />

          {/* Generic modules — explicit routes above always win over these params. */}
          <Route path=":tech" element={<GenericTrackRoute page="home" />} />
          <Route path=":tech/topic/:topicId" element={<GenericTrackRoute page="topic" />} />
          <Route path=":tech/category/:category" element={<GenericTrackRoute page="category" />} />
          <Route path=":tech/interview" element={<GenericTrackRoute page="interview" />} />
          <Route path=":tech/flashcards" element={<GenericTrackRoute page="flashcards" />} />
          <Route path=":tech/glossary" element={<GenericTrackRoute page="glossary" />} />

          {/* Unknown learning routes fall back to the hub rather than a dead end. */}
          <Route path="*" element={<Navigate to="/learning" replace />} />
        </Routes>
      </Suspense>
    </LearningLayout>
  );
}
