import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { Footer } from './components/layout/Footer';
import { Contact } from './components/layout/Contact';
import { Hero } from './components/hero/Hero';
import { InterviewSnapshot, WhatIBring } from './components/hero/InterviewSnapshot';
import { SkillsExplorer } from './components/skills/SkillsExplorer';
import { ExperienceTimeline } from './components/experience/ExperienceTimeline';
import { BankingSpotlight } from './components/experience/BankingSpotlight';
import { ProjectExplorer } from './components/projects/ProjectExplorer';
import { AIEngineering } from './components/ai/AIEngineering';
import { AIArchitecture } from './components/ai/AIArchitecture';
import { EngineeringThinking } from './components/ai/EngineeringThinking';
import { ArchitecturePlayground } from './components/architecture/ArchitecturePlayground';
import { TechnologyConstellation } from './components/architecture/TechnologyConstellation';
import { CertificationTimeline } from './components/certifications/CertificationTimeline';
import { AskMeAbout } from './components/interview/AskMeAbout';
import { TechnicalDiscussion } from './components/interview/TechnicalDiscussion';
import { InterviewMode } from './components/interview/InterviewMode';
import { JdMatch } from './components/jdmatch/JdMatch';
import { Recommendations } from './components/recommendations/Recommendations';
import { TemplateOffer } from './components/product/TemplateOffer';
import { PrintResume } from './components/print/PrintResume';
import { LearningNavProvider } from './learning/hooks/useLearningNav';
import { LearningHubEntry } from './learning/components/LearningHubEntry';
import { Analytics } from '@vercel/analytics/react';

/** The Learning Hub is fully code-split — "/" never downloads it. */
const LearningApp = lazy(() => import('./learning/LearningApp'));

function AppShell() {
  return (
    <>
      <Navbar />
      <InterviewMode />
      <main id="main">
        <Hero />
        <InterviewSnapshot />
        <WhatIBring />
        <SkillsExplorer />
        <ExperienceTimeline />
        <BankingSpotlight />
        <ProjectExplorer />
        <AIEngineering />
        <AIArchitecture />
        <EngineeringThinking />
        <ArchitecturePlayground />
        <TechnologyConstellation />
        <CertificationTimeline />
        <AskMeAbout />
        <TechnicalDiscussion />
        <JdMatch />
        <Recommendations />
        <Contact />
        <TemplateOffer />
      </main>
      <Footer />
      <PrintResume />
      <LearningHubEntry />
    </>
  );
}

function LearningFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]" role="status" aria-live="polite">
      <span className="mono-label animate-pulse">Loading Learning Hub…</span>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <LearningNavProvider>
          {/* Mounted above the route switch so Ctrl/Cmd+K works everywhere. */}
          <CommandPalette />
          <Routes>
            <Route path="/" element={<AppShell />} />
            <Route
              path="/learning/*"
              element={
                <Suspense fallback={<LearningFallback />}>
                  <LearningApp />
                </Suspense>
              }
            />
            {/* Unknown paths fall back to the resume portal. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Analytics />
        </LearningNavProvider>
      </BrowserRouter>
    </AppStateProvider>
  );
}
