import React, { useState, useEffect } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { generateQuickFocusSession } from '../../services/quickFocusAlgorithm';
import { GeneratedFocusSession } from '../../types';
import {
  Zap,
  X,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const QuickFocusModal: React.FC = () => {
  const {
    quickFocusModalOpen,
    closeQuickFocus,
    preselectedQuickFocusDuration,
    preselectedTopic,
    preselectedSubject,
    tasks,
    revisionItems,
    exams,
    subjects,
    startFocusSession,
  } = useFocusStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customDurationInput, setCustomDurationInput] = useState<string>('25');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [generatedSession, setGeneratedSession] = useState<GeneratedFocusSession | null>(null);

  useEffect(() => {
    if (quickFocusModalOpen) {
      const initialDur = preselectedQuickFocusDuration || 30;
      if ([15, 30, 45, 60].includes(initialDur)) {
        setSelectedDuration(initialDur);
        setIsCustom(false);
      } else {
        setSelectedDuration(initialDur);
        setCustomDurationInput(initialDur.toString());
        setIsCustom(true);
      }
      if (preselectedSubject) {
        setSelectedSubjectFilter(preselectedSubject);
      } else {
        setSelectedSubjectFilter('all');
      }
    }
  }, [quickFocusModalOpen, preselectedQuickFocusDuration, preselectedSubject]);

  // Re-generate session whenever duration or filters change
  useEffect(() => {
    if (!quickFocusModalOpen) return;

    const filteredTasks =
      selectedSubjectFilter === 'all'
        ? tasks
        : tasks.filter((t) => t.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());

    const filteredRevisions =
      selectedSubjectFilter === 'all'
        ? revisionItems
        : revisionItems.filter((r) => r.subject.toLowerCase() === selectedSubjectFilter.toLowerCase());

    const session = generateQuickFocusSession({
      durationMinutes: selectedDuration,
      tasks: filteredTasks,
      revisionItems: filteredRevisions,
      exams,
      subjects,
      specificTopic: preselectedTopic || undefined,
      specificSubject: preselectedSubject || (selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined),
    });

    setGeneratedSession(session);
  }, [selectedDuration, selectedSubjectFilter, quickFocusModalOpen, preselectedTopic, preselectedSubject, tasks, revisionItems, exams, subjects]);

  if (!quickFocusModalOpen || !generatedSession) return null;

  const handleSelectPreset = (dur: number) => {
    setIsCustom(false);
    setSelectedDuration(dur);
  };

  const handleCustomChange = (val: string) => {
    setCustomDurationInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 5 && num <= 180) {
      setSelectedDuration(num);
    }
  };

  const handleLaunch = () => {
    if (generatedSession) {
      startFocusSession(generatedSession);
    }
  };

  // Helper for formatting timestamp (e.g., 00:00 - 12:00)
  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = '00';
    return `${mins < 10 ? '0' : ''}${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f111a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">What can you accomplish right now?</h2>
              <p className="text-xs text-slate-400">Intelligently optimized against your syllabus, revisions & exams</p>
            </div>
          </div>
          <button
            onClick={closeQuickFocus}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Select Available Time
              </span>
              <span className="text-xs text-cyan-400 font-mono font-medium">{selectedDuration} Minutes</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[15, 30, 45, 60].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleSelectPreset(dur)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                    !isCustom && selectedDuration === dur
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] scale-[1.02]'
                      : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  {dur} min
                </button>
              ))}

              <button
                onClick={() => setIsCustom(true)}
                className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  isCustom
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs text-slate-300">Set minutes:</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={customDurationInput}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="w-20 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-mono">(5 - 180 min)</span>
              </div>
            )}
          </div>

          {/* Generated Plan Breakdown */}
          <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/[0.08] p-4.5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                  Intelligent Composition
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Your {selectedDuration}-Minute Session
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
                <Sparkles className="w-3 h-3" />
                <span>{generatedSession.steps.length} Steps</span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-2.5">
              {generatedSession.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-start gap-3 group"
                >
                  <div className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-xs font-semibold text-cyan-400 whitespace-nowrap mt-0.5">
                    {formatTime(step.startMinute)} – {formatTime(step.endMinute)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors truncate">
                        {step.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="capitalize px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.05] text-[10px]">
                        {step.type}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">{step.subject}</span>
                      <span>•</span>
                      <span className="font-mono">{step.durationMinutes} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Algorithm Reasoning */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-300/90 leading-relaxed">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-200">Why this plan: </span>
                {generatedSession.reasoning}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-[#0c0d14] flex items-center justify-between gap-3">
          <button
            onClick={closeQuickFocus}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Focus Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
