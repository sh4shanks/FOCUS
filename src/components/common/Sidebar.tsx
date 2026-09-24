import React from 'react';
import { useFocusStore, AppView } from '../../store/useFocusStore';
import {
  LayoutDashboard,
  Zap,
  BookOpenCheck,
  CalendarDays,
  CheckSquare,
  RotateCcw,
  GraduationCap,
  BarChart3,
  StickyNote,
  Settings,
  Sparkles,
  Camera,
  BrainCircuit,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, tasks, revisionItems, exams, openQuickFocus } = useFocusStore();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const dueRevisionsCount = revisionItems.filter((r) => r.urgency === 'due-today').length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quick-focus', label: 'Quick Focus', icon: Zap, badge: 'Key' },
    { id: 'focus-ai', label: 'FOCUS AI', icon: Sparkles, badge: 'Copilot' },
    { id: 'practice', label: 'Practice Mode', icon: BrainCircuit, badge: 'Active' },
    { id: 'snap-solve', label: 'Snap & Solve', icon: Camera },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpenCheck },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'revision', label: 'Revision', icon: RotateCcw, badge: dueRevisionsCount > 0 ? dueRevisionsCount : undefined },
    { id: 'exams', label: 'Exams', icon: GraduationCap, badge: exams.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.06] bg-[#0b0c13]/90 backdrop-blur-xl h-screen sticky top-0 justify-between shrink-0 p-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Minimalist Geometric Brand Logo */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="relative w-9 h-9 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.15)] group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            {/* Concentric geometric focus rings */}
            <div className="absolute inset-1.5 rounded-lg border border-cyan-400/30"></div>
            <div className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-widest text-base text-white">FOCUS</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Make every minute count</p>
          </div>
        </div>

        {/* Quick Launch Card */}
        <div className="rounded-xl p-3 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Instant Session
            </span>
            <span className="font-mono text-[10px] text-slate-400">Adaptive</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
            Have unexpected free time? Build a smart session right now.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => openQuickFocus(15)}
              className="py-1 px-2 rounded-lg bg-white/[0.05] hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/[0.06] hover:border-cyan-500/30 text-slate-300 text-xs font-mono transition-all text-center"
            >
              15 min
            </button>
            <button
              onClick={() => openQuickFocus(30)}
              className="py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-mono font-bold transition-all text-center shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            >
              30 min
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-370px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-white/[0.09] text-white border border-white/[0.12] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : item.badge === 'Key'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Link to Landing / Info */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-1.5 hover:text-slate-300 transition-colors text-[11px]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Product Overview</span>
        </button>
        <span className="font-mono text-[10px] text-slate-600">v1.0 Pro</span>
      </div>
    </aside>
  );
};
