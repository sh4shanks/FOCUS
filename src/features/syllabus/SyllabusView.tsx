import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { Subject, Chapter, ChapterStatus } from '../../types';
import {
  BookOpenCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle,
  RotateCcw,
  Clock,
  Award,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export const SyllabusView: React.FC = () => {
  const { subjects, addSubject, updateChapterProgress, openQuickFocus } = useFocusStore();

  const [expandedSubjectId, setExpandedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#38bdf8');

  // Quick subject completion statistics
  const getSubjectStats = (subject: Subject) => {
    const total = subject.chapters.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = subject.chapters.filter((c) => c.completionPercentage >= 95).length;
    const avgPercentage = Math.round(
      subject.chapters.reduce((sum, c) => sum + c.completionPercentage, 0) / total
    );
    return { total, completed, percentage: avgPercentage };
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    addSubject({
      name: newSubjName.trim(),
      color: newSubjColor,
      iconName: 'BookOpen',
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          title: 'Foundations & Core Principles',
          status: 'in-progress',
          completionPercentage: 25,
          topics: ['Introduction', 'Core Definitions', 'Practice Problems'],
          estimatedHours: 4,
          difficulty: 'Medium',
          examWeightage: 'High',
        },
      ],
    });
    setNewSubjName('');
    setAddSubjectModalOpen(false);
  };

  const statusColors: Record<ChapterStatus, { text: string; bg: string; border: string }> = {
    'completed': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'in-progress': { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    'revision-due': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'not-started': { text: 'text-slate-400', bg: 'bg-white/[0.04]', border: 'border-white/[0.06]' },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>CURRICULUM MAPPING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Syllabus Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track syllabus progress, chapter weightage, and automated revision status across all subjects.
          </p>
        </div>

        <button
          onClick={() => setAddSubjectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subj) => {
          const stats = getSubjectStats(subj);
          const isSelected = expandedSubjectId === subj.id;

          return (
            <div
              key={subj.id}
              onClick={() => setExpandedSubjectId(subj.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-b from-[#141724] to-[#0e111a] border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] scale-[1.01]'
                  : 'bg-[#0e111a]/80 border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subj.color }}
                  />
                  <h3 className="text-base font-bold text-white tracking-tight">{subj.name}</h3>
                </div>
                <span className="font-mono text-sm font-bold text-cyan-400">{stats.percentage}%</span>
              </div>

              <div className="text-xs text-slate-400 mb-3">
                {stats.completed} / {stats.total} chapters completed
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.percentage}%`,
                    backgroundColor: subj.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-white/[0.04]">
                <span>{subj.chapters.length} Chapters</span>
                <span className="text-cyan-400 font-medium">
                  {isSelected ? 'Expanded' : 'Click to View'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Subject Chapters Detail */}
      {subjects.find((s) => s.id === expandedSubjectId) && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0e111a]/90 border border-white/[0.08] backdrop-blur-xl space-y-6">
          {(() => {
            const activeSubject = subjects.find((s) => s.id === expandedSubjectId)!;
            const stats = getSubjectStats(activeSubject);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.06] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeSubject.color }} />
                      <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                        Curriculum Breakdown
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      {activeSubject.name} Chapters & Topics
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono">{stats.percentage}% Mastered</div>
                      <div className="text-[11px] text-slate-400">
                        {stats.completed} of {stats.total} chapters finished
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapter list */}
                <div className="space-y-4">
                  {activeSubject.chapters.map((chapter) => {
                    const stStyle = statusColors[chapter.status] || statusColors['not-started'];

                    return (
                      <div
                        key={chapter.id}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{chapter.title}</h4>
                              <span
                                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${stStyle.text} ${stStyle.bg} ${stStyle.border}`}
                              >
                                {chapter.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>Difficulty: {chapter.difficulty}</span>
                              <span>•</span>
                              <span>Exam Weight: {chapter.examWeightage}</span>
                              <span>•</span>
                              <span className="font-mono">Est. {chapter.estimatedHours}h</span>
                            </div>
                          </div>

                          <button
                            onClick={() => openQuickFocus(30, chapter.title, activeSubject.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
                            title="Start 30-min focus session for this chapter"
                          >
                            <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                            <span>Quick Focus</span>
                          </button>
                        </div>

                        {/* Topics Pill List */}
                        {chapter.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {chapter.topics.map((top, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-slate-300 font-medium"
                              >
                                {top}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Completion Slider & Quick Status Toggles */}
                        <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 max-w-sm">
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                              <span>Progress Slider</span>
                              <span className="text-white font-bold">{chapter.completionPercentage}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={chapter.completionPercentage}
                              onChange={(e) =>
                                updateChapterProgress(
                                  activeSubject.id,
                                  chapter.id,
                                  parseInt(e.target.value, 10)
                                )
                              }
                              className="w-full accent-cyan-400 cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Status:</span>
                            <select
                              value={chapter.status}
                              onChange={(e) =>
                                updateChapterProgress(
                                  activeSubject.id,
                                  chapter.id,
                                  chapter.completionPercentage,
                                  e.target.value as ChapterStatus
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#141724] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="revision-due">Revision Due</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Add Subject Modal */}
      {addSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Add New Subject</h3>
              <button
                onClick={() => setAddSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biology or History"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubjColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        newSubjColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setAddSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
