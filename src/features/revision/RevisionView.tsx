import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { RevisionItem, RevisionUrgency } from '../../types';
import {
  RotateCcw,
  Zap,
  Plus,
  CheckCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  Filter,
  X,
  Layers,
} from 'lucide-react';

export const RevisionView: React.FC = () => {
  const {
    revisionItems,
    subjects,
    completeRevisionItem,
    addRevisionItem,
    openQuickFocus,
  } = useFocusStore();

  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New revision item state
  const [newTopic, setNewTopic] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Physics');
  const [newEstMins, setNewEstMins] = useState(25);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    addRevisionItem({
      topic: newTopic.trim(),
      subject: newSubject,
      lastStudied: new Date().toISOString().split('T')[0],
      daysSinceLastStudy: 0,
      nextRevisionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      intervalStage: 1,
      intervalDays: 1,
      estimatedMinutes: newEstMins,
      urgency: 'upcoming',
      retentionScore: 90,
    });

    setNewTopic('');
    setCreateModalOpen(false);
  };

  const filteredItems = revisionItems.filter((item) => {
    if (filterUrgency !== 'all' && item.urgency !== filterUrgency) return false;
    return true;
  });

  const dueCount = revisionItems.filter((i) => i.urgency === 'due-today').length;
  const upcomingCount = revisionItems.filter((i) => i.urgency === 'upcoming').length;
  const masteredCount = revisionItems.filter((i) => i.urgency === 'mastered').length;

  const urgencyBadge = (urgency: RevisionUrgency) => {
    switch (urgency) {
      case 'due-today':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Due Today
          </span>
        );
      case 'upcoming':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Scheduled
          </span>
        );
      case 'mastered':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Mastered
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ACTIVE RECALL & SPACED RETRIEVAL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Revision Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automate cognitive retention using the Ebbinghaus forgetting curve intervals (1, 3, 7, 14, 30 days).
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic to Revision</span>
        </button>
      </div>

      {/* Forgetting Curve Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#0e111a]/80 border border-amber-500/20 backdrop-blur-xl">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1">
            Due Today
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{dueCount}</div>
          <p className="text-xs text-slate-400 mt-1">High priority for memory consolidation</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e111a]/80 border border-cyan-500/20 backdrop-blur-xl">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            Upcoming Intervals
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{upcomingCount}</div>
          <p className="text-xs text-slate-400 mt-1">Scheduled for next 3 to 14 days</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#0e111a]/80 border border-emerald-500/20 backdrop-blur-xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            Mastered Topics
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{masteredCount}</div>
          <p className="text-xs text-slate-400 mt-1">Long-term memory consolidated (30+ days)</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1.5 w-fit">
        {[
          { key: 'all', label: 'All Items' },
          { key: 'due-today', label: `Due Today (${dueCount})` },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'mastered', label: 'Mastered' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterUrgency(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filterUrgency === tab.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revision Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0e111a]/80 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {item.topic}
                  </h4>
                  {urgencyBadge(item.urgency)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="text-cyan-300/80 font-medium">{item.subject}</span>
                  <span>•</span>
                  <span>Studied {item.daysSinceLastStudy} days ago</span>
                  <span>•</span>
                  <span className="font-mono">Current interval: {item.intervalDays} days</span>
                  <span>•</span>
                  <span>Retention: {item.retentionScore}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                {/* Revise Now -> Launches Quick Focus directly */}
                <button
                  onClick={() => openQuickFocus(item.estimatedMinutes, item.topic, item.subject)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Launch timed focus session for active retrieval"
                >
                  <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>Revise Now ({item.estimatedMinutes}m)</span>
                </button>

                {/* Mark Done -> advances interval */}
                <button
                  onClick={() => completeRevisionItem(item.id)}
                  className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/[0.06] hover:border-emerald-500/30 text-slate-300 text-xs font-medium transition-all flex items-center gap-1"
                  title="Mark reviewed and advance spaced interval"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Done</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-3xl bg-[#0e111a]/40 border border-white/[0.05] text-center space-y-2">
            <p className="text-sm font-bold text-slate-300">No revision topics in this category</p>
            <p className="text-xs text-slate-500">Your spaced retrieval schedule is up to date.</p>
          </div>
        )}
      </div>

      {/* Add Topic Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Add Revision Topic</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Topic / Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photoelectric Effect Equations"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
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
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Estimated Review Time (min)
                </label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  step="5"
                  value={newEstMins}
                  onChange={(e) => setNewEstMins(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
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
                  Schedule in Interval Loop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
