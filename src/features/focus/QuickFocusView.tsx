import React, { useState, useEffect } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { generateQuickFocusSession } from '../../services/quickFocusAlgorithm';
import { GeneratedFocusSession } from '../../types';
import {
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sliders,
  CheckCircle2,
  Filter,
  History,
} from 'lucide-react';

export const QuickFocusView: React.FC = () => {
  const {
    tasks,
    revisionItems,
    exams,
    subjects,
    completedRecords,
    startFocusSession,
  } = useFocusStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('25');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [sessionPlan, setSessionPlan] = useState<GeneratedFocusSession | null>(null);

  useEffect(() => {
    const filteredTasks =
      selectedSubjectFilter === 'all'
        ? tasks
        : tasks.filter((t) => t.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());

    const filteredRevisions =
      selectedSubjectFilter === 'all'
        ? revisionItems
        : revisionItems.filter((r) => r.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());

    const plan = generateQuickFocusSession({
      durationMinutes: selectedDuration,
      tasks: filteredTasks,
      revisionItems: filteredRevisions,
      exams,
      subjects,
    });

    setSessionPlan(plan);
  }, [selectedDuration, selectedSubjectFilter, tasks, revisionItems, exams, subjects]);

  const handleSelectPreset = (mins: number) => {
    setIsCustom(false);
    setSelectedDuration(mins);
  };

  const handleCustomChange = (val: string) => {
    setCustomMinutes(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 5 && n <= 180) {
      setSelectedDuration(n);
    }
  };

  const formatTime = (minutes: number) => {
    const m = Math.floor(minutes);
    return `${m < 10 ? '0' : ''}${m}:00`;
  };

  const handleLaunch = () => {
    if (sessionPlan) {
      startFocusSession(sessionPlan);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
          <Zap className="w-3.5 h-3.5 fill-cyan-400" />
          <span>SIGNATURE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          What can you accomplish right now?
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Select your available time window. FOCUS synthesizes upcoming exam dates, revision intervals, syllabus weighting, and tasks into a high-yield study session.
        </p>
      </div>

      {/* Main Selector & Generation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Duration & Filter Controls */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Available Time
              </span>
              <span className="text-cyan-400">{selectedDuration} min</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleSelectPreset(dur)}
                  className={`py-3 rounded-2xl text-xs font-mono font-bold transition-all border ${
                    !isCustom && selectedDuration === dur
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] text-slate-300 border-white/[0.07] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {dur} min
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCustom(true)}
              className={`w-full py-2.5 rounded-2xl text-xs font-mono font-bold transition-all border ${
                isCustom
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.05] hover:bg-white/[0.05]'
              }`}
            >
              Custom Duration
            </button>

            {isCustom && (
              <div className="pt-2">
                <label className="block text-[11px] text-slate-400 mb-1">Enter minutes (5 to 180):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">min</span>
                </div>
              </div>
            )}
          </div>

          {/* Subject Filter */}
          <div className="rounded-3xl p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                Target Subject
              </span>
            </div>

            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">Auto-Adaptive (All Subjects)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} Only
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Auto-Adaptive cross-references approaching exam dates across all your subjects.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Generated Session Preview */}
        <div className="lg:col-span-2 space-y-6">
          {sessionPlan && (
            <div className="rounded-3xl p-6 sm:p-7 bg-[#0e111a]/80 border border-white/[0.08] backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Real-time Optimization
                  </span>
                  <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
                    Your {selectedDuration}-Minute Session
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-300 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{sessionPlan.steps.length} Timed Stages</span>
                </div>
              </div>

              {/* Timeline Breakdown */}
              <div className="space-y-3">
                {sessionPlan.steps.map((step) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 transition-all flex items-start gap-4 group"
                  >
                    <div className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 font-mono text-xs font-bold text-cyan-300 shrink-0 mt-0.5">
                      {formatTime(step.startMinute)} – {formatTime(step.endMinute)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-[11px] text-slate-300">
                          {step.subject}
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-400 text-[11px]">{step.type}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{step.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reasoning Card */}
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-cyan-300/90 leading-relaxed">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-cyan-200">Algorithmic Balance: </span>
                  {sessionPlan.reasoning}
                </div>
              </div>

              {/* Launch CTA */}
              <div className="pt-2">
                <button
                  onClick={handleLaunch}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Start Focus Session Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Recent Completed Focus Sessions */}
          {completedRecords.length > 0 && (
            <div className="rounded-3xl p-6 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-3">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Recent Focus Logs
                </h3>
              </div>
              <div className="space-y-2">
                {completedRecords.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{rec.title}</span>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">
                        {rec.durationMinutes}m • {rec.subject}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-mono font-medium">Logged</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
