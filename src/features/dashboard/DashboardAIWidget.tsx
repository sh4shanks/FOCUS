import React, { useState } from 'react';
import { Sparkles, Camera, ArrowRight, Zap, Lightbulb, HelpCircle, BrainCircuit } from 'lucide-react';
import { useFocusStore } from '../../store/useFocusStore';

export const DashboardAIWidget: React.FC = () => {
  const { setCurrentView, createConversation, addMessageToConversation, openPracticeMode } = useFocusStore();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickAsk = (customText?: string) => {
    const text = (customText || quickQuery).trim();
    if (!text) {
      setCurrentView('focus-ai');
      return;
    }

    const convId = createConversation(text.slice(0, 30));
    addMessageToConversation(convId, {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setCurrentView('focus-ai');
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/30 p-4 sm:p-5 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.08)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">FOCUS AI Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Active Context
              </span>
            </div>
            <p className="text-xs text-slate-400">Ask questions, explain formulas, or snap a textbook photo.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPracticeMode()}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(168,85,247,0.15)]"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setCurrentView('snap-solve')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Snap & Solve</span>
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center rounded-xl bg-black/40 border border-white/10 focus-within:border-cyan-500/50 transition-all p-1">
        <input
          type="text"
          value={quickQuery}
          onChange={(e) => setQuickQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuickAsk()}
          placeholder="Ask a question or describe what you're stuck on..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleQuickAsk()}
          className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center gap-1 transition-all"
        >
          <span>Ask</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2.5 text-xs no-scrollbar">
        <button
          onClick={() => handleQuickAsk('What should I study right now with 30 minutes?')}
          className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <Zap className="w-3 h-3 text-cyan-400" /> What to study right now?
        </button>
        <button
          onClick={() => handleQuickAsk('Explain the photoelectric effect and work function.')}
          className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" /> Explain Photoelectric Effect
        </button>
        <button
          onClick={() => handleQuickAsk('Test me with a hard physics numerical on ray optics.')}
          className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-[11px] whitespace-nowrap transition-colors flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3 text-purple-400" /> Test Me on Optics
        </button>
      </div>
    </div>
  );
};
