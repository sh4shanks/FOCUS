import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { Task, Priority } from '../../types';
import {
  CheckSquare,
  Plus,
  Zap,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Check,
  Filter,
  X,
  ChevronRight,
  ListTodo,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    toggleTaskStatus,
    deleteTask,
    breakDownAssignment,
    openQuickFocus,
  } = useFocusStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [breakerModalOpen, setBreakerModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(subjects[0]?.name || 'General');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');

  // Assignment Breaker form state
  const [assignmentTitle, setAssignmentTitle] = useState('History Research Paper');
  const [assignmentSubject, setAssignmentSubject] = useState(subjects[0]?.name || 'History');
  const [assignmentDays, setAssignmentDays] = useState(5);
  const [breakerFeedback, setBreakerFeedback] = useState<string | null>(null);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      subject: taskSubject,
      deadline: taskDueDate || new Date().toISOString().split('T')[0],
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      durationMinutes: taskDuration,
      priority: taskPriority,
      status: 'todo',
      tags: ['assignment'],
    });

    setTaskTitle('');
    setCreateModalOpen(false);
  };

  const handleRunBreaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim()) return;

    breakDownAssignment(assignmentTitle.trim(), assignmentSubject, assignmentDays);
    setBreakerFeedback(
      `Successfully generated structured subtasks for "${assignmentTitle}" across ${assignmentDays} days!`
    );
    setBreakerModalOpen(false);
    setTimeout(() => setBreakerFeedback(null), 6000);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>TASK & ASSIGNMENT HUB</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Tasks & Assignments</h1>
          <p className="text-sm text-slate-400 mt-1">
            Break down overwhelming deadlines into clear, timed actionable subtasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setBreakerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Assignment Breaker</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Assignment Breaker Feature Banner */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-purple-950/30 via-[#0e111a] to-indigo-950/20 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              Cognitive Relief Feature
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Have an intimidating paper, lab report, or presentation?
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Never stare at a huge multi-page assignment in dread. Use the Assignment Breaker to deconstruct it into sequential, 15 to 60-minute bites mapped to deadlines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setBreakerModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shrink-0 transition-all shadow-md active:scale-95"
        >
          Break Down Assignment
        </button>
      </div>

      {/* Success Notification */}
      {breakerFeedback && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{breakerFeedback}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-3xl p-4 bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  isCompleted
                    ? 'bg-white/[0.01] border-white/[0.04] text-slate-500'
                    : 'bg-[#0e111a]/80 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                      isCompleted
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                        : 'border-white/20 hover:border-cyan-400'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[2.5]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.parentAssignment && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono shrink-0">
                          Subtask
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-cyan-300/80 font-medium">{task.subject}</span>
                      <span>•</span>
                      <span className="font-mono">{task.durationMinutes} min</span>
                      <span>•</span>
                      <span className="font-mono">Due {task.dueDate || task.deadline}</span>
                      <span>•</span>
                      <span
                        className={`capitalize ${
                          task.priority === 'high'
                            ? 'text-rose-400 font-medium'
                            : task.priority === 'medium'
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => openQuickFocus(task.durationMinutes, task.title, task.subject)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Launch distraction-free focus timer for this task"
                    >
                      <Zap className="w-3.5 h-3.5 fill-cyan-300" />
                      <span>Focus Session</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-3xl bg-[#0e111a]/40 border border-white/[0.05] text-center space-y-3">
            <ListTodo className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No tasks in this view</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a new task or use Assignment Breaker to plan your assignments.
            </p>
          </div>
        )}
      </div>

      {/* Assignment Breaker Modal */}
      {breakerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f111a] border border-white/10 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Assignment Breaker</h3>
              </div>
              <button onClick={() => setBreakerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Enter any intimidating project, essay, or research task. FOCUS deconstructs it into sequential subtasks with realistic time estimates and spaced due dates.
            </p>

            <form onSubmit={handleRunBreaker} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. History Research Paper or Organic Chemistry Lab Report"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                  <select
                    value={assignmentSubject}
                    onChange={(e) => setAssignmentSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-purple-500 focus:outline-none"
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
                    Days until Deadline
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={assignmentDays}
                    onChange={(e) => setAssignmentDays(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preview of breakdown rules */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300/90 space-y-1">
                <div className="font-semibold text-purple-200">What will be generated:</div>
                <div>• Step 1: Research, sources & thesis collection (45 min)</div>
                <div>• Step 2: Outline key arguments (30 min)</div>
                <div>• Step 3: Draft introduction and primary sections (60 min)</div>
                <div>• Step 4: Draft body paragraphs & conclusion (60 min)</div>
                <div>• Step 5: Citation check, bibliography & final proofread (30 min)</div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setBreakerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-all"
                >
                  Deconstruct Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#0f111a] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Calculus Problem Set 4"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject</label>
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
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
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Duration (min)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#131622] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
