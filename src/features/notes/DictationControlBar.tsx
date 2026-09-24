import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

export type DictationTarget = 'content' | 'title' | 'formulas';

interface DictationControlBarProps {
  context: 'create' | 'edit';
  isSupported: boolean;
  isListening: boolean;
  activeContext: 'create' | 'edit' | null;
  activeTarget: DictationTarget;
  interimTranscript: string;
  speechError: string | null;
  onToggle: (target?: DictationTarget) => void;
  onSelectTarget: (target: DictationTarget) => void;
  onStop: () => void;
}

export const DictationControlBar: React.FC<DictationControlBarProps> = ({
  context,
  isSupported,
  isListening,
  activeContext,
  activeTarget,
  interimTranscript,
  speechError,
  onToggle,
  onSelectTarget,
  onStop,
}) => {
  const isCurrentContextActive = isListening && activeContext === context;

  const targetLabels: Record<DictationTarget, string> = {
    content: 'Explanation',
    title: 'Title',
    formulas: 'Formulas',
  };

  return (
    <div
      id={`${context}-dictation-bar`}
      className={`p-3.5 rounded-2xl border transition-all duration-300 ${
        isCurrentContextActive
          ? 'bg-gradient-to-r from-cyan-950/40 via-rose-950/20 to-black/70 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.18)]'
          : 'bg-white/[0.02] border-white/[0.08]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id={`${context}-mic-toggle-btn`}
            onClick={() => onToggle()}
            disabled={!isSupported}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              !isSupported
                ? 'opacity-40 cursor-not-allowed bg-white/5 text-slate-500'
                : isCurrentContextActive
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-white'
            }`}
            title={
              !isSupported
                ? 'Speech recognition not supported in this browser'
                : isCurrentContextActive
                ? 'Stop voice dictation'
                : 'Start voice dictation'
            }
          >
            {isCurrentContextActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">Speech Recognition</span>
              {isCurrentContextActive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>LISTENING</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-cyan-400/80">Hands-Free Dictate</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isCurrentContextActive
                ? `Transcribing voice into [${targetLabels[activeTarget]}] in real-time...`
                : 'Click mic or dictate into any field below to transcribe your voice directly into the note'}
            </p>
          </div>
        </div>

        {/* Target Field Switcher */}
        <div className="flex items-center gap-1.5 text-[11px] bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          <span className="text-[10px] text-slate-500 px-1 font-mono hidden sm:inline">Target:</span>
          {(['content', 'title', 'formulas'] as DictationTarget[]).map((t) => {
            const isSelected = activeTarget === t;
            return (
              <button
                key={t}
                type="button"
                id={`${context}-target-btn-${t}`}
                onClick={() => onSelectTarget(t)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all font-medium ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {targetLabels[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Interim Transcript Bubble & Audio Visualizer */}
      {isCurrentContextActive && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Audio Wave Visualizer */}
            <div className="flex items-center gap-0.5 h-4 shrink-0 px-1">
              <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" />
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1 h-4.5 bg-cyan-200 rounded-full animate-bounce" />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </div>

            <p className="text-xs text-cyan-200 font-mono truncate italic">
              {interimTranscript ? `"${interimTranscript}"` : 'Listening for your voice... speak now'}
            </p>
          </div>

          <button
            type="button"
            id={`${context}-done-speaking-btn`}
            onClick={onStop}
            className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[11px] text-slate-300 font-medium transition-colors shrink-0"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Error or Browser Compatibility Notice */}
      {!isSupported && (
        <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.</span>
        </div>
      )}

      {speechError && activeContext === context && (
        <div className="mt-2 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}
    </div>
  );
};
