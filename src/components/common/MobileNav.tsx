import React, { useState } from 'react';
import { useFocusStore, AppView } from '../../store/useFocusStore';
import {
  LayoutDashboard,
  Zap,
  CheckSquare,
  CalendarDays,
  Menu,
  X,
  BookOpenCheck,
  RotateCcw,
  GraduationCap,
  BarChart3,
  StickyNote,
  Settings,
  Sparkles,
  Camera,
  BrainCircuit,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, openQuickFocus, tasks, revisionItems } = useFocusStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const pendingRev = revisionItems.filter((r) => r.urgency === 'due-today').length;

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setMenuOpen(false);
  };

  const moreItems: { id: AppView; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'focus-ai', label: 'FOCUS AI Copilot', icon: Sparkles, badge: 'AI' },
    { id: 'practice', label: 'Practice Mode', icon: BrainCircuit, badge: 'Active' },
    { id: 'snap-solve', label: 'Snap & Solve', icon: Camera },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'syllabus', label: 'Syllabus Manager', icon: BookOpenCheck },
    { id: 'revision', label: 'Revision Engine', icon: RotateCcw, badge: pendingRev || undefined },
    { id: 'exams', label: 'Exam Command Center', icon: GraduationCap },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'notes', label: 'Study Notes', icon: StickyNote },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <>
      {/* Slide-up drawer for secondary items */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#0f111a] border-t border-white/10 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-wide">All Sections</span>
                <span className="text-xs text-slate-400 font-mono">Navigation</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="flex-1 truncate">
                      <div className="text-xs font-semibold">{item.label}</div>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMenuOpen(false);
                openQuickFocus(30);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Instant 30-Minute Session
            </button>
          </div>
        </div>
      )}

      {/* Fixed bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] transition-colors ${
            currentView === 'dashboard' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentView('tasks')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] transition-colors ${
            currentView === 'tasks' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
          {pendingTasks > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-cyan-400"></span>
          )}
        </button>

        {/* Center Quick Focus Floating Action */}
        <button
          onClick={() => openQuickFocus(30)}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-transform border border-white/20"
          title="Instant 30 Min Focus"
        >
          <Zap className="w-6 h-6 fill-slate-950" />
        </button>

        <button
          onClick={() => setCurrentView('focus-ai')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] transition-colors ${
            currentView === 'focus-ai' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>FOCUS AI</span>
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] transition-colors ${
            menuOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
