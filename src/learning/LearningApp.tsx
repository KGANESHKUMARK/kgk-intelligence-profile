import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LearningLayout } from './components/LearningLayout';

/**
 * Route-level code splitting: the resume portal at "/" never downloads any
 * of this, and heavier learning pages load only when visited.
 */
const LearningHome = lazy(() => import('./pages/LearningHome'));
const JavaHome = lazy(() => import('./pages/JavaHome'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const InterviewPractice = lazy(() => import('./pages/InterviewPractice'));
const Flashcards = lazy(() => import('./pages/Flashcards'));
const VisualQuiz = lazy(() => import('./pages/VisualQuiz'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const VersionsPage = lazy(() => import('./pages/VersionsPage'));
const VersionDetail = lazy(() => import('./pages/VersionDetail'));
const LatestJava = lazy(() => import('./pages/LatestJava'));

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
          <Route path="java" element={<JavaHome />} />
          <Route path="java/topic/:topicId" element={<TopicPage />} />
          <Route path="java/category/:category" element={<CategoryPage />} />
          <Route path="java/interview" element={<InterviewPractice />} />
          <Route path="java/flashcards" element={<Flashcards />} />
          <Route path="java/quiz" element={<VisualQuiz />} />
          <Route path="java/glossary" element={<GlossaryPage />} />
          <Route path="java/versions" element={<VersionsPage />} />
          <Route path="java/versions/:version" element={<VersionDetail />} />
          <Route path="java/latest" element={<LatestJava />} />
          {/* Unknown learning routes fall back to the hub rather than a dead end. */}
          <Route path="*" element={<Navigate to="/learning" replace />} />
        </Routes>
      </Suspense>
    </LearningLayout>
  );
}
