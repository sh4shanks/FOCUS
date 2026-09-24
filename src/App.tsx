import React from 'react';
import { useFocusStore } from './store/useFocusStore';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { QuickFocusModal } from './components/common/QuickFocusModal';
import { ActiveSessionModal } from './features/focus/ActiveSessionModal';
import { OnboardingModal } from './features/onboarding/OnboardingModal';
import { StreakReminderToast } from './components/common/StreakReminderToast';

import { LandingPage } from './features/landing/LandingPage';
import { DashboardView } from './features/dashboard/DashboardView';
import { QuickFocusView } from './features/focus/QuickFocusView';
import { SyllabusView } from './features/syllabus/SyllabusView';
import { PlannerView } from './features/planner/PlannerView';
import { TasksView } from './features/tasks/TasksView';
import { RevisionView } from './features/revision/RevisionView';
import { ExamsView } from './features/exams/ExamsView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { NotesView } from './features/notes/NotesView';
import { SettingsView } from './features/settings/SettingsView';
import { FocusAIView } from './features/ai/FocusAIView';
import { SnapAndSolveView } from './features/ai/SnapAndSolveView';
import { PracticeMode } from './features/ai/components/PracticeMode';
import { PracticeModeModal } from './features/ai/components/PracticeModeModal';

export default function App() {
  const {
    currentView,
    practiceModalOpen,
    closePracticeMode,
    practiceInitialSubject,
    practiceInitialTopic,
    practiceInitialDifficulty,
    practiceInitialCount,
    practiceInitialSet,
    practiceAutoStart,
  } = useFocusStore();

  // If user is on the marketing landing page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage />
        <QuickFocusModal />
        <ActiveSessionModal />
        <OnboardingModal />
        <PracticeModeModal
          isOpen={practiceModalOpen}
          onClose={closePracticeMode}
          initialSubject={practiceInitialSubject || undefined}
          initialTopic={practiceInitialTopic || undefined}
          initialDifficulty={practiceInitialDifficulty || undefined}
          initialCount={practiceInitialCount || undefined}
          practiceSet={practiceInitialSet || undefined}
          autoStart={practiceAutoStart}
        />
        <StreakReminderToast />
      </>
    );
  }

  // Active Applet Workspace View
  return (
    <div className="flex h-screen bg-[#08090d] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Floating App Header */}
        <Header />

        {/* Scrollable Workspace Stage */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'quick-focus' && <QuickFocusView />}
          {currentView === 'focus-ai' && <FocusAIView />}
          {currentView === 'snap-solve' && <SnapAndSolveView />}
          {currentView === 'practice' && <PracticeMode />}
          {currentView === 'syllabus' && <SyllabusView />}
          {currentView === 'planner' && <PlannerView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'revision' && <RevisionView />}
          {currentView === 'exams' && <ExamsView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'notes' && <NotesView />}
          {currentView === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav />
      </div>

      {/* Global Modals & Distraction-Free Focus Mode */}
      <QuickFocusModal />
      <ActiveSessionModal />
      <OnboardingModal />
      <PracticeModeModal
        isOpen={practiceModalOpen}
        onClose={closePracticeMode}
        initialSubject={practiceInitialSubject || undefined}
        initialTopic={practiceInitialTopic || undefined}
        initialDifficulty={practiceInitialDifficulty || undefined}
        initialCount={practiceInitialCount || undefined}
        practiceSet={practiceInitialSet || undefined}
        autoStart={practiceAutoStart}
      />
      <StreakReminderToast />
    </div>
  );
}
