import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { Exam } from '../../types';
import {
  GraduationCap,
  Plus,
  Zap,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const { exams, subjects, addExam, openQuickFocus, setCurrentView } = useFocusStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New exam form state
  const [examName, setExamName] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Physics');
  const [examDate, setExamDate] = useState('2026-10-15');
  const [targetScore, setTargetScore] = useState(90);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    // Calculate days remaining
    const days = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );

    const relatedSubject = subjects.find((s) => s.name.toLowerCase() === subject.toLowerCase());
    const totalChapters = relatedSubject ? relatedSubject.chapters.length : 12;
    const completedChapters = relatedSubject
      ? relatedSubject.chapters.filter((c) => c.completionPercentage >= 95).length
      : 5;

    addExam({
      subject,
      examName: examName.trim(),
      date: examDate,
      daysRemaining: days,
      totalChapters,
      completedChapters,
      estimatedHoursNeeded: (totalChapters - completedChapters) * 3.5,
      readinessScore: Math.round((completedChapters / Math.max(1, totalChapters)) * 100),
      recommendedDailyHours: 1.5,
      targetScore: `${targetScore}%`,
      highYieldChapters: relatedSubject
        ? relatedSubject.chapters.slice(0, 3).map((c) => c.title)
        : ['Core Foundations', 'Problem Sets', 'Formula Mastery'],
    });

    setExamName('');
    setCreateModalOpen(false);
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 14) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (days <= 30) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ACADEMIC RADAR</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Exam Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time readiness analytics, syllabus coverage checkpoints, and high-yield preparation trajectories.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Target Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exams.map((exam) => {
          const daysLeft = Math.max(
            0,
            Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          );
          const coveragePercent = Math.round(
            (exam.completedChapters / Math.max(1, exam.totalChapters)) * 100
          );

          return (
            <div
              key={exam.id}
              className="p-6 sm:p-7 rounded-3xl bg-[#0e111a]/85 border border-white/[0.08] backdrop-blur-xl space-y-6 hover:border-white/[0.14] transition-all"
            >
              {/* Top Details */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    {exam.subject}
                  </span>
                  <h3 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
                    {exam.examName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-2xl border text-center font-mono ${getUrgencyColor(daysLeft)}`}>
                  <div className="text-base font-bold leading-none">{daysLeft}</div>
                  <div className="text-[10px] uppercase font-bold leading-none mt-1">Days Left</div>
                </div>
              </div>

              {/* Progress & Metrics Cards */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
                <div>
                  <div className="text-lg font-mono font-bold text-white">{exam.readinessScore}%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Readiness</div>
                </div>
                <div className="border-x border-white/[0.06]">
                  <div className="text-lg font-mono font-bold text-cyan-300">
                    {exam.completedChapters}/{exam.totalChapters}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Chapters Done</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-amber-300">
                    {exam.recommendedDailyHours}h
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Pacing / Day</div>
                </div>
              </div>

              {/* Coverage Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>Syllabus Coverage</span>
                  <span className="text-white font-bold">{coveragePercent}%</span>
                </div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
              </div>

              {/* High-yield focus chapters */}
              {exam.highYieldChapters && exam.highYieldChapters.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Recommended High-Yield Focus
                  </div>
                  <div className="space-y-1.5">
                    {exam.highYieldChapters.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300 truncate">{ch}</span>
                        <button
                          onClick={() => openQuickFocus(30, ch, exam.subject)}
                          className="px-2 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-[11px] shrink-0 ml-2"
                        >
                          Focus 30m
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                <button
                  onClick={() => setCurrentView('syllabus')}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  View Subject Syllabus →
                </button>

                <button
                  onClick={() => openQuickFocus(45, `${exam.subject} Exam Prep`, exam.subject)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/30 text-xs font-bold transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>Exam Prep Session (45m)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Add Target Exam</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Midterm or AP Calculus BC"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
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
                  Track Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
