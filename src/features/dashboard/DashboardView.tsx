import React from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { calculateFocusScore } from '../../services/analyticsService';
import { DashboardAIWidget } from './DashboardAIWidget';
import { DailyStudyStreakTracker } from './DailyStudyStreakTracker';
import {
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  RotateCcw,
  AlertCircle,
  GraduationCap,
  ChevronRight,
  Check,
  Plus,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    userProfile,
    tasks,
    revisionItems,
    exams,
    subjects,
    plannedSessions,
    completedRecords,
    openQuickFocus,
    toggleTaskStatus,
    completeRevisionItem,
    setCurrentView,
  } = useFocusStore();

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = plannedSessions.filter((s) => s.date === todayStr);
  const completedTodaySessions = todaySessions.filter((s) => s.completed).length;
  const progressPercent = todaySessions.length > 0 ? Math.round((completedTodaySessions / todaySessions.length) * 100) : 0;

  // Upcoming nearest exam
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nearestExam = sortedExams[0];
  const daysToExam = nearestExam
    ? Math.max(0, Math.ceil((new Date(nearestExam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Pending important tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);

  // Revision due today
  const dueRevisions = revisionItems.filter((r) => r.urgency === 'due-today');

  // Focus Score calculation
  const focusScoreData = calculateFocusScore(
    tasks,
    revisionItems,
    exams,
    subjects,
    plannedSessions,
    completedRecords
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Hero Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Personal Academic OS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {userProfile.name}.
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Let's make today's study time count.
          </p>
        </div>

        {/* Quick Streak & Target pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Flame className="w-4 h-4 fill-amber-400" />
            <div>
              <div className="text-xs font-bold leading-none">{userProfile.streak} Days</div>
              <div className="text-[10px] text-amber-400/80 leading-none mt-0.5">Study Streak</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            <Sparkles className="w-4 h-4" />
            <div>
              <div className="text-xs font-bold leading-none">{focusScoreData.score} / 100</div>
              <div className="text-[10px] text-cyan-300/80 leading-none mt-0.5">Focus Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Study Streak Tracker */}
      <DailyStudyStreakTracker />

      {/* FOCUS AI Copilot Quick Launcher Widget */}
      <DashboardAIWidget />

      {/* Signature Feature: HOW MUCH TIME DO YOU HAVE? */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-cyan-950/40 via-[#0e111a] to-blue-950/40 border border-cyan-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-mono font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 fill-cyan-300" />
              SIGNATURE QUICK FOCUS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              HOW MUCH TIME DO YOU HAVE?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Answer the question <span className="text-cyan-300 font-medium">“What should I study right now?”</span> based on your current syllabus, deadlines, and revisions.
            </p>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {[15, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => openQuickFocus(mins)}
                className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-mono font-bold transition-all border shadow-sm hover:scale-105 active:scale-95 ${
                  mins === 30
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 font-extrabold shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/[0.1]'
                }`}
              >
                {mins} min
              </button>
            ))}

            <button
              onClick={() => openQuickFocus(25)}
              className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-mono font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all hover:scale-105"
            >
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* Primary 3-Column Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Today's Progress */}
        <div className="rounded-3xl p-5 sm:p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col justify-between hover:border-white/[0.12] transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider font-mono">Today's Progress</span>
              <span className="text-cyan-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {progressPercent}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {completedTodaySessions} of {todaySessions.length} planned sessions completed.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              onClick={() => setCurrentView('planner')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Today's Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Upcoming Exam */}
        <div className="rounded-3xl p-5 sm:p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col justify-between hover:border-white/[0.12] transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider font-mono">Upcoming Exam</span>
              <span className="text-amber-400 font-mono">{daysToExam ?? 0} days remaining</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {nearestExam?.subject || 'Physics'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {nearestExam?.completedChapters || 12} / {nearestExam?.totalChapters || 16} chapters completed
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              {nearestExam?.examName || 'Board Examination'}
            </span>
            <button
              onClick={() => setCurrentView('exams')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Exam Radar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Today's Priority */}
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-950/30 via-[#0e111a] to-cyan-950/20 border border-white/[0.07] backdrop-blur-xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold uppercase tracking-wider font-mono text-cyan-400">Today's Priority</span>
              <span className="text-slate-400 font-mono">Est. 35 min</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Optics — Refraction
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High exam weightage with formula sheet revision due.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => openQuickFocus(35, 'Optics — Refraction', 'Physics')}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-cyan-300" />
              <span>Study This Now (35m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Pending Tasks, Revision Due, & Focus Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tasks (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending Tasks
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>All Tasks ({tasks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTasks.length > 0 ? (
            <div className="space-y-2.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="w-5 h-5 rounded-lg border border-white/20 hover:border-cyan-400 flex items-center justify-center transition-colors shrink-0 group-hover:border-white/40"
                    >
                      {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-cyan-300/80">{task.subject}</span>
                        <span>•</span>
                        <span className="font-mono">{task.durationMinutes} min</span>
                        <span>•</span>
                        <span className={`capitalize ${task.priority === 'high' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openQuickFocus(task.durationMinutes, task.title, task.subject)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/[0.06] hover:border-cyan-500/30 text-slate-300 text-xs font-mono shrink-0 transition-all flex items-center gap-1"
                    title="Launch targeted focus session for this task"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <p className="font-medium text-slate-300">You're all caught up on urgent tasks!</p>
              <p className="mt-1">Add new assignments or explore your syllabus.</p>
            </div>
          )}
        </div>

        {/* Revision Due Today */}
        <div className="rounded-3xl p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Revision Due
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {dueRevisions.length} Due
              </span>
            </div>

            {dueRevisions.length > 0 ? (
              <div className="space-y-3">
                {dueRevisions.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all space-y-2"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{item.topic}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.subject} • Last studied {item.daysSinceLastStudy} days ago
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        ~{item.estimatedMinutes} min review
                      </span>
                      <button
                        onClick={() => openQuickFocus(item.estimatedMinutes, item.topic, item.subject)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-medium transition-all"
                      >
                        Revise Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <p className="text-slate-300">Nothing is due for revision right now.</p>
                <p className="mt-1">Spaced repetition schedule is clean.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4">
            <button
              onClick={() => setCurrentView('revision')}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              Open Full Revision Engine →
            </button>
          </div>
        </div>
      </div>

      {/* Focus Score Feedback Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 to-[#0e111a]/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Focus Organization Health</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {focusScoreData.rating}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {focusScoreData.actionableInsights[0] || 'Your study workload is well paced. No urgent bottlenecks detected.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('analytics')}
          className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-slate-200 shrink-0 transition-colors"
        >
          View Breakdown
        </button>
      </div>
    </div>
  );
};
