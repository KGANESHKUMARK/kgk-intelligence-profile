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
import { PrintResume } from './components/print/PrintResume';

function AppShell() {
  return (
    <>
      <Navbar />
      <CommandPalette />
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
        <Contact />
      </main>
      <Footer />
      <PrintResume />
    </>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}
