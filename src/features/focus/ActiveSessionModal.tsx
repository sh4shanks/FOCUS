import React, { useState, useEffect, useRef } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import { soundEngine } from '../../services/audioService';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Maximize2,
  Minimize2,
  Check,
  Flame,
} from 'lucide-react';

export const ActiveSessionModal: React.FC = () => {
  const {
    isFocusSessionActive,
    activeFocusSession,
    finishFocusSession,
    cancelFocusSession,
    openQuickFocus,
  } = useFocusStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const [ambientType, setAmbientType] = useState<'rain' | 'drone' | 'whitenoise'>('rain');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Initialize timer on session start
  useEffect(() => {
    if (isFocusSessionActive && activeFocusSession) {
      const totalSecs = activeFocusSession.totalMinutes * 60;
      setTotalSessionSeconds(totalSecs);
      setSecondsRemaining(totalSecs);
      setCurrentStepIndex(0);
      setCompletedStepIds([]);
      setIsCompleted(false);
      setIsPaused(false);
      soundEngine.playChime('step');
    }
  }, [isFocusSessionActive, activeFocusSession]);

  // Main countdown timer
  useEffect(() => {
    if (!isFocusSessionActive || isPaused || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleSessionFinished();
          return 0;
        }

        // Check if we passed into the next step
        if (activeFocusSession) {
          const elapsedSecs = totalSessionSeconds - (prev - 1);
          const elapsedMins = elapsedSecs / 60;
          const currentStep = activeFocusSession.steps[currentStepIndex];

          if (currentStep && elapsedMins >= currentStep.endMinute && currentStepIndex < activeFocusSession.steps.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            soundEngine.playChime('step');
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFocusSessionActive, isPaused, isCompleted, currentStepIndex, totalSessionSeconds, activeFocusSession]);

  if (!isFocusSessionActive || !activeFocusSession) return null;

  const currentStep = activeFocusSession.steps[currentStepIndex] || activeFocusSession.steps[0];

  const handleSessionFinished = () => {
    setIsCompleted(true);
    soundEngine.playChime('success');
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#a855f7', '#34d399', '#f59e0b'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handlePauseToggle = () => {
    soundEngine.playChime('click');
    setIsPaused((prev) => !prev);
  };

  const handleSkipStep = () => {
    soundEngine.playChime('click');
    if (currentStepIndex < activeFocusSession.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      soundEngine.playChime('step');
    } else {
      handleSessionFinished();
    }
  };

  const handleToggleTaskCheck = (stepId: string) => {
    soundEngine.playChime('click');
    setCompletedStepIds((prev) =>
      prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]
    );
  };

  const handleDone = () => {
    if (ambientOn) soundEngine.stopAmbient();
    const tasksDone = activeFocusSession.steps.map((s) => s.title);
    finishFocusSession(activeFocusSession.totalMinutes, tasksDone);
  };

  const handleExtend = (minutes: number) => {
    soundEngine.playChime('click');
    setIsCompleted(false);
    setSecondsRemaining((prev) => prev + minutes * 60);
    setTotalSessionSeconds((prev) => prev + minutes * 60);
  };

  const toggleAmbientSound = () => {
    if (ambientOn) {
      soundEngine.stopAmbient();
      setAmbientOn(false);
    } else {
      soundEngine.startAmbient(ambientType, 0.15);
      setAmbientOn(true);
    }
  };

  const cycleAmbientType = () => {
    const list: ('rain' | 'drone' | 'whitenoise')[] = ['rain', 'drone', 'whitenoise'];
    const nextIdx = (list.indexOf(ambientType) + 1) % list.length;
    const nextType = list[nextIdx];
    setAmbientType(nextType);
    if (ambientOn) soundEngine.startAmbient(nextType, 0.15);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Progress percentage
  const progressPercent = totalSessionSeconds > 0 ? ((totalSessionSeconds - secondsRemaining) / totalSessionSeconds) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#06070a] text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Subtle background glow effect */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
            Distraction-Free Focus
          </span>
          <span className="text-xs text-slate-600">•</span>
          <span className="text-xs text-slate-300 font-medium">{activeFocusSession.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Ambient Sound Controller */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full p-1 text-xs">
            <button
              onClick={toggleAmbientSound}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
                ambientOn ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ambientOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="capitalize font-mono text-[11px]">{ambientOn ? ambientType : 'Ambient'}</span>
            </button>
            {ambientOn && (
              <button
                onClick={cycleAmbientType}
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-cyan-300 uppercase font-mono"
              >
                Switch
              </button>
            )}
          </div>

          {/* End / Exit early */}
          <button
            onClick={cancelFocusSession}
            className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all font-medium"
          >
            Exit Early
          </button>
        </div>
      </div>

      {/* Main Focus Canvas */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full">
        {!isCompleted ? (
          <>
            {/* Step Indicator */}
            <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-bold">
                Step {currentStepIndex + 1} of {activeFocusSession.steps.length}
              </span>
              <span>•</span>
              <span className="capitalize text-slate-400">{currentStep?.type}</span>
            </div>

            {/* Current Active Task Headline */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3 px-4 max-w-xl">
              {currentStep?.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-medium">
                {currentStep?.subject}
              </span>
              <span>•</span>
              <span>Allocated {currentStep?.durationMinutes} min</span>
            </div>

            {/* Huge Clean Countdown Display */}
            <div className="relative my-2 font-mono font-bold tracking-tighter text-7xl sm:text-8xl md:text-9xl text-white select-none drop-shadow-[0_0_50px_rgba(255,255,255,0.06)]">
              {formatTimer(secondsRemaining)}
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full max-w-md h-1.5 bg-white/[0.06] rounded-full overflow-hidden my-6">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>

            {/* Interactive Step Checklist for this session */}
            <div className="w-full max-w-md space-y-2 mb-8 text-left">
              {activeFocusSession.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isChecked = completedStepIds.includes(step.id);
                return (
                  <div
                    key={step.id}
                    onClick={() => handleToggleTaskCheck(step.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                        : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] transition-colors ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                            : 'border-white/20'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`truncate ${isChecked ? 'line-through text-slate-500' : ''}`}>
                        {step.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                      {step.durationMinutes}m
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Controls Bar: Pause, Skip, Finish Session */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePauseToggle}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-white font-medium text-xs sm:text-sm transition-all active:scale-95"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={handleSkipStep}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 font-medium text-xs sm:text-sm transition-all active:scale-95"
                title="Skip to next step"
              >
                <SkipForward className="w-4 h-4" />
                <span className="hidden sm:inline">Next Step</span>
              </button>

              <button
                onClick={handleSessionFinished}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finish Session</span>
              </button>
            </div>
          </>
        ) : (
          /* Completion State */
          <div className="space-y-6 animate-scaleUp text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(6,182,212,0.5)]">
              <Check className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
                Goal Accomplished
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Session Complete.</h2>
              <p className="text-slate-300 mt-2 text-base">
                {activeFocusSession.totalMinutes} minutes well spent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] max-w-sm mx-auto flex items-center justify-around text-center">
              <div>
                <div className="text-lg font-mono font-bold text-white">{activeFocusSession.totalMinutes}m</div>
                <div className="text-[11px] text-slate-400">Study Logged</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-lg font-mono font-bold text-cyan-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>+1</span>
                </div>
                <div className="text-[11px] text-slate-400">Streak Active</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-lg font-mono font-bold text-emerald-400">95%</div>
                <div className="text-[11px] text-slate-400">Efficiency</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleDone}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-95"
              >
                Done & Record Progress
              </button>

              <button
                onClick={() => handleExtend(10)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-medium text-xs transition-all active:scale-95"
              >
                Extend +10 min
              </button>

              <button
                onClick={() => {
                  handleDone();
                  setTimeout(() => openQuickFocus(30), 200);
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-medium text-xs transition-all active:scale-95"
              >
                Start Another Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status / Quote */}
      <div className="relative z-10 px-6 py-4 text-center border-t border-white/[0.04]">
        <p className="text-[11px] text-slate-500 font-mono">
          FOCUS — Silent Mode • No notifications • Deep Cognition
        </p>
      </div>
    </div>
  );
};
