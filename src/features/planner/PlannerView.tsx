import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { PlannedSession, Priority } from '../../types';
import {
  CalendarDays,
  Plus,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw,
  Check,
  X,
  Sliders,
} from 'lucide-react';

export const PlannerView: React.FC = () => {
  const {
    plannedSessions,
    subjects,
    userProfile,
    addPlannedSession,
    toggleSessionCompleted,
    deleteSession,
    runAutoSchedule,
    triggerAdaptiveRedistribution,
    openQuickFocus,
  } = useFocusStore();

  const [calendarMode, setCalendarMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [autoPlanModalOpen, setAutoPlanModalOpen] = useState(false);
  const [redistributionNotice, setRedistributionNotice] = useState<string | null>(null);

  // Manual Session form state
  const [sessionSubject, setSessionSubject] = useState(subjects[0]?.name || 'Physics');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDate, setSessionDate] = useState(selectedDate);
  const [sessionTime, setSessionTime] = useState('18:00');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [sessionPriority, setSessionPriority] = useState<Priority>('high');

  // Auto planner state
  const [autoExamDate, setAutoExamDate] = useState('2026-10-14');
  const [autoDailyHours, setAutoDailyHours] = useState(userProfile.dailyGoalHours || 3.5);
  const [autoPrioritySubj, setAutoPrioritySubj] = useState(subjects[0]?.name || 'Physics');

  const todayStr = new Date().toISOString().split('T')[0];

  // Check for missed sessions in past
  const missedSessions = plannedSessions.filter(
    (s) => !s.completed && s.date < todayStr
  );

  const handleAdaptiveAdjustment = () => {
    const res = triggerAdaptiveRedistribution();
    setRedistributionNotice(res.message);
    setTimeout(() => setRedistributionNotice(null), 7000);
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTopic.trim()) return;

    addPlannedSession({
      subject: sessionSubject,
      topic: sessionTopic.trim(),
      date: sessionDate,
      startTime: sessionTime,
      durationMinutes: sessionDuration,
      priority: sessionPriority,
      completed: false,
    });

    setSessionTopic('');
    setCreateModalOpen(false);
  };

  const handleRunAutoPlan = (e: React.FormEvent) => {
    e.preventDefault();
    runAutoSchedule({
      examDate: autoExamDate,
      availableDailyHours: autoDailyHours,
      selectedSubjects: subjects.map((s) => s.name),
      prioritySubject: autoPrioritySubj,
      startDate: todayStr,
    });
    setAutoPlanModalOpen(false);
    setRedistributionNotice(
      `Generated suggested high-yield schedule through ${autoExamDate} balancing ${autoDailyHours}h daily availability.`
    );
    setTimeout(() => setRedistributionNotice(null), 6000);
  };

  // Filter sessions based on calendar view
  const getVisibleSessions = () => {
    if (calendarMode === 'daily') {
      return plannedSessions.filter((s) => s.date === selectedDate);
    }
    if (calendarMode === 'weekly') {
      // 7 days window starting from selectedDate
      const start = new Date(selectedDate);
      const weekDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        weekDates.push(d.toISOString().split('T')[0]);
      }
      return plannedSessions.filter((s) => weekDates.includes(s.date));
    }
    // Monthly
    const monthPrefix = selectedDate.substring(0, 7); // YYYY-MM
    return plannedSessions.filter((s) => s.date.startsWith(monthPrefix));
  };

  const visibleSessions = getVisibleSessions();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>CALENDAR & TIME SLOTS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Study Planner</h1>
          <p className="text-sm text-slate-400 mt-1">
            Harmonize daily sessions with your declared available study hours ({userProfile.dailyGoalHours}h/day).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAutoPlanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Planner</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Adaptive Redistribution Alert banner (Major feature from prompt) */}
      {missedSessions.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scaleUp">
          <div className="flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-200">
                Your schedule needs a small adjustment.
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                You have {missedSessions.length} missed study session{missedSessions.length > 1 ? 's' : ''} from earlier. FOCUS can automatically redistribute them across your upcoming available slots without overloading your daily hours.
              </p>
            </div>
          </div>

          <button
            onClick={handleAdaptiveAdjustment}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Auto-Redistribute Workload</span>
          </button>
        </div>
      )}

      {/* Success/Notice Toast */}
      {redistributionNotice && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{redistributionNotice}</span>
        </div>
      )}

      {/* Calendar Controls (Daily / Weekly / Monthly toggle & Date selector) */}
      <div className="rounded-3xl p-5 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Mode Tabs */}
        <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCalendarMode(mode)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                calendarMode === mode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - (calendarMode === 'weekly' ? 7 : 1));
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-white px-2">
            {calendarMode === 'daily' && (selectedDate === todayStr ? 'Today, ' : '')}
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + (calendarMode === 'weekly' ? 7 : 1));
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="text-xs text-cyan-400 hover:underline font-mono ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Sessions Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-xs font-mono uppercase text-slate-400">
          <span>
            {visibleSessions.length} Scheduled Study Session{visibleSessions.length !== 1 ? 's' : ''}
          </span>
          <span>
            Total:{' '}
            <strong className="text-white font-mono">
              {visibleSessions.reduce((acc, s) => acc + s.durationMinutes, 0)} min
            </strong>
          </span>
        </div>

        {visibleSessions.length > 0 ? (
          <div className="space-y-3">
            {visibleSessions.map((session) => {
              const isPast = session.date < todayStr;
              const isMissed = !session.completed && isPast;

              return (
                <div
                  key={session.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    session.completed
                      ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-300'
                      : isMissed
                      ? 'bg-amber-950/10 border-amber-500/30'
                      : 'bg-[#0e111a]/80 border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <button
                      onClick={() => toggleSessionCompleted(session.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                        session.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-white/20 hover:border-cyan-400'
                      }`}
                    >
                      {session.completed && <Check className="w-4 h-4 stroke-[2.5]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{session.startTime}</span>
                        <span className="text-slate-600">•</span>
                        <h4
                          className={`text-sm font-semibold ${
                            session.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {session.topic}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-slate-300 font-medium">{session.subject}</span>
                        <span>•</span>
                        <span className="font-mono">{session.durationMinutes} min</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{session.date}</span>
                        {isMissed && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Missed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!session.completed && (
                      <button
                        onClick={() => openQuickFocus(session.durationMinutes, session.topic, session.subject)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 fill-cyan-300" />
                        <span>Start Session</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-[#0e111a]/40 border border-white/[0.05] text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No sessions scheduled for this period</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Plan manually or use the Auto-Planner to distribute syllabus study blocks automatically.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08]"
            >
              Add Session
            </button>
          </div>
        )}
      </div>

      {/* Manual Schedule Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Schedule Study Session</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                <select
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Topic / Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Lens Maker Formula or Calculus Problem Set"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={sessionPriority}
                    onChange={(e) => setSessionPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Planner Modal */}
      {autoPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f111a] border border-white/10 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Suggested Auto-Schedule Generator</h3>
              </div>
              <button onClick={() => setAutoPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your target exam date and daily hours ceiling. FOCUS will automatically lay out realistic 45-minute study sessions across available days without overloading you.
            </p>

            <form onSubmit={handleRunAutoPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Exam Date</label>
                <input
                  type="date"
                  value={autoExamDate}
                  onChange={(e) => setAutoExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Available Daily Study Hours (Max ceiling)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  step="0.5"
                  value={autoDailyHours}
                  onChange={(e) => setAutoDailyHours(parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  FOCUS guarantees never to schedule more study time than this limit.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority Subject</label>
                <select
                  value={autoPrioritySubj}
                  onChange={(e) => setAutoPrioritySubj(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setAutoPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
                >
                  Generate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
