import React from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import {
  Zap,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckSquare,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Clock,
  Compass,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, userProfile } = useFocusStore();

  const handleStart = () => {
    if (userProfile.onboarded) {
      setCurrentView('dashboard');
    } else {
      // Trigger onboarding modal
      useFocusStore.setState({ onboardingOpen: true, currentView: 'dashboard' });
    }
  };

  const scrollToDemo = () => {
    const el = document.getElementById('how-it-works');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08090d]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          </div>
          <span className="font-extrabold text-lg tracking-widest text-white">FOCUS</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Direct App Preview
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <span>Start Focusing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 sm:pt-28 sm:pb-36 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-cyan-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Academic Operating System</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl">
          FOCUS
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-200 via-slate-200 to-slate-400 bg-clip-text text-transparent mt-3 mb-6">
          Make every minute count.
        </h2>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          A smarter study workspace that turns your syllabus, deadlines and available time into a clear plan for what to do next.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Focusing</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-200 font-medium text-sm transition-all"
          >
            <span>See How It Works</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Interactive Teaser Card: "I have 30 minutes" */}
        <div className="w-full max-w-2xl mt-16 rounded-3xl bg-[#0e1017]/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl p-6 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">The Core Question</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-semibold">“I have 30 minutes.”</span>
          </div>

          <p className="text-sm font-semibold text-white mb-3">
            What should I study right now?
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs">
              <span className="font-mono text-cyan-400 font-semibold">00:00 – 12:00</span>
              <span className="text-slate-200 font-medium truncate mx-3">Revise Macbeth Act 3 Scene 2 (Soliloquy & Quotes)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">Revision Due</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs">
              <span className="font-mono text-cyan-400 font-semibold">12:00 – 22:00</span>
              <span className="text-slate-200 font-medium truncate mx-3">Solve 3 calculus integration by parts questions</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">High Priority</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs">
              <span className="font-mono text-cyan-400 font-semibold">22:00 – 30:00</span>
              <span className="text-slate-200 font-medium truncate mx-3">Active recall + quick review</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">Consolidation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <div id="how-it-works" className="border-t border-white/[0.06] bg-[#090b10]">
        {/* Section 1: Stop wondering what to study */}
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                Decision Fatigue Solved
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mt-2 mb-4">
                Stop wondering what to study.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Most students lose 20 minutes just deciding which textbook to open or which assignment is most urgent. FOCUS eliminates that paralysis with a single click.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Instant prioritization across all exams, tasks, and overdue chapters</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>Never sit down to study and wonder where to start</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#11131c] border border-white/[0.08] shadow-xl">
              <div className="text-xs font-mono text-slate-400 uppercase mb-3">Adaptive Engine</div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] mb-3">
                <div className="text-xs text-slate-400">Next Recommended Action</div>
                <div className="text-base font-bold text-white mt-1">Ray Optics — Refraction & Lenses</div>
                <div className="text-xs text-cyan-300 mt-1 font-mono">Exam in 24 days • 35 min study allocated</div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Evaluates exam weightage, elapsed time since last revision, and pending problem sets in real time.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Your time. Your workload. One clear plan. */}
        <section className="px-6 py-20 max-w-5xl mx-auto border-t border-white/[0.04]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Practical Harmony
            </span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-2 mb-4">
              Your time. Your workload. One clear plan.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No unrealistic 14-hour study schedules that collapse after day two. FOCUS respects your real availability and dynamically adapts when life gets in the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#11131c]/70 border border-white/[0.07] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Available Time Budgeting</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Declare your realistic daily hours (e.g. 3.5h). FOCUS will never schedule more than you can handle.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#11131c]/70 border border-white/[0.07] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Adaptive Redistribution</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Missed Monday's session? With one click, FOCUS shifts remaining work into open future slots automatically.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#11131c]/70 border border-white/[0.07] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Assignment Breaker</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Turn intimidating mega-projects into 15–20 minute actionable bites with durations and deadlines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: From syllabus to study session */}
        <section className="px-6 py-20 max-w-5xl mx-auto border-t border-white/[0.04]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="p-6 rounded-3xl bg-[#11131c] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">PHYSICS SYLLABUS</span>
                <span className="text-xs font-mono text-slate-400">12 / 16 Chapters • 75%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-400 rounded-full"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-xs">
                  <span className="text-slate-200">Wave Optics & Interference</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Completed</span>
                </div>
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="text-cyan-200 font-semibold">Ray Optics — Refraction</span>
                  <span className="text-amber-400 font-mono text-[11px]">Revision Due</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between text-xs">
                  <span className="text-slate-400">Electromagnetic Induction</span>
                  <span className="text-slate-400 font-mono text-[11px]">60%</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                Complete Curriculum Mapping
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mt-2 mb-4">
                From syllabus to study session.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your syllabus is not a static PDF. In FOCUS, every chapter, topic, and weightage directly feeds your study planner and daily focus recommendations.
              </p>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Granular chapter progress tracking & difficulty ratings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Automated spaced repetition triggers when recall drops</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Built for real student life */}
        <section className="px-6 py-20 max-w-5xl mx-auto border-t border-white/[0.04]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Distraction-Free Engineering
            </span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight mt-2 mb-4">
              Built for real student life.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No distracting social feeds, fake chatbots, or pointless gamified badges. Just clean, calm focus tools designed for deep cognitive retention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-cyan-400 text-sm font-bold mb-1">Local & Private</div>
              <p className="text-xs text-slate-400">Your study logs and notes remain private on your device.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-cyan-400 text-sm font-bold mb-1">Ambient Audio</div>
              <p className="text-xs text-slate-400">Synthesized rainfall, theta binaural drone, and soft white noise.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-cyan-400 text-sm font-bold mb-1">Exam Radar</div>
              <p className="text-xs text-slate-400">Real-time countdowns and syllabus coverage checks for major exams.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-cyan-400 text-sm font-bold mb-1">Non-Judgmental</div>
              <p className="text-xs text-slate-400">Focus Score guides your workload without guilt or anxiety.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Your progress, without the pressure */}
        <section className="px-6 py-20 max-w-5xl mx-auto border-t border-white/[0.04]">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyan-950/30 via-[#10131e] to-blue-950/30 border border-cyan-500/20 text-center flex flex-col items-center">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Empowerment
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
              Your progress, without the pressure.
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Study smarter by aligning every available 15, 30, or 60-minute window with what actually moves your academic needle.
            </p>

            <div className="text-xl font-bold text-white mb-6">
              Ready to focus?
            </div>

            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Focusing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-xs text-slate-500">
        <p>FOCUS Academic OS • Make every minute count • Built for student success</p>
      </footer>
    </div>
  );
};
