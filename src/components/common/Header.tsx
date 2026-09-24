import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { soundEngine } from '../../services/audioService';
import { Zap, Flame, Volume2, VolumeX, Sparkles, Plus, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const { userProfile, openQuickFocus, plannedSessions, setCurrentView } = useFocusStore();
  const [ambientActive, setAmbientActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'rain' | 'drone' | 'whitenoise'>('rain');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlanned = plannedSessions.filter((s) => s.date === todayStr);
  const todayDone = todayPlanned.filter((s) => s.completed).length;

  const toggleSound = () => {
    if (ambientActive) {
      soundEngine.stopAmbient();
      setAmbientActive(false);
    } else {
      soundEngine.startAmbient(ambientSound, 0.15);
      setAmbientActive(true);
    }
  };

  const cycleSoundMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modes: ('rain' | 'drone' | 'whitenoise')[] = ['rain', 'drone', 'whitenoise'];
    const nextIdx = (modes.indexOf(ambientSound) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setAmbientSound(nextMode);
    if (ambientActive) {
      soundEngine.startAmbient(nextMode, 0.15);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-xl px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200 tracking-tight">FOCUS OS</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                Academic Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {todayPlanned.length > 0 ? `${todayDone} of ${todayPlanned.length} sessions completed today` : 'Ready to structure your study'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ambient Sound Pill */}
        <div className="relative flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-0.5 text-xs">
          <button
            onClick={toggleSound}
            title={ambientActive ? 'Mute ambient sound' : 'Turn on focus ambient sound'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs ${
              ambientActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {ambientActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="capitalize font-mono hidden md:inline">{ambientActive ? ambientSound : 'Ambient'}</span>
          </button>
          {ambientActive && (
            <button
              onClick={cycleSoundMode}
              className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors uppercase font-mono"
              title="Change soundscape (Rain / Binaural Drone / White Noise)"
            >
              Mode
            </button>
          )}
        </div>

        {/* Study Streak */}
        <div
          onClick={() => setCurrentView('analytics')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium cursor-pointer hover:bg-amber-500/15 transition-colors"
          title={`Current Streak: ${userProfile.streak} days. Best: ${userProfile.bestStreak} days.`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-mono font-bold">{userProfile.streak}</span>
          <span className="text-amber-400/70 hidden sm:inline text-[11px]">days</span>
        </div>

        {/* Signature Quick Focus Button */}
        <button
          onClick={() => openQuickFocus(30)}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span className="whitespace-nowrap">I Have 30 Min</span>
        </button>
      </div>
    </header>
  );
};
