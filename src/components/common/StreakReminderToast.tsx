import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame,
  Zap,
  Clock,
  Bell,
  X,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useFocusStore } from '../../store/useFocusStore';
import {
  getStreakReminderConfig,
  saveStreakReminderConfig,
  getTimeRemainingToday,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  triggerDailyStreakReminder,
} from '../../services/notificationService';

export const StreakReminderToast: React.FC = () => {
  const {
    userProfile,
    completedRecords,
    isFocusSessionActive,
    openQuickFocus,
  } = useFocusStore();

  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemainingToday());
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus());
  const [soundEnabled, setSoundEnabled] = useState(getStreakReminderConfig().soundEnabled);

  const todayStr = new Date().toISOString().split('T')[0];

  // Check if today has study activity logged
  const todayRecords = completedRecords.filter((rec) => {
    try {
      return new Date(rec.timestamp).toISOString().split('T')[0] === todayStr;
    } catch {
      return rec.timestamp.startsWith(todayStr);
    }
  });

  const isTodayCompleted =
    todayRecords.length > 0 &&
    (todayRecords.reduce((sum, r) => sum + (r.durationMinutes || 0), 0) >= 15 ||
      userProfile.lastActiveDate === todayStr);

  // Update time remaining every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemainingToday());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Main evaluation: should we show the streak reminder toast?
  const evaluateReminder = useCallback(() => {
    const config = getStreakReminderConfig();
    if (!config.enabled) {
      setIsVisible(false);
      return;
    }

    // Do not show if user is actively in a focus session
    if (isFocusSessionActive) {
      setIsVisible(false);
      return;
    }

    // Do not show if today is already completed
    if (isTodayCompleted) {
      setIsVisible(false);
      return;
    }

    // Check snooze
    if (config.snoozedUntilTimestamp && Date.now() < config.snoozedUntilTimestamp) {
      setIsVisible(false);
      setIsSnoozed(true);
      return;
    }

    // If streak > 0 and today not completed, show toast
    if (userProfile.streak > 0) {
      setIsVisible(true);
      setIsSnoozed(false);
    }
  }, [isFocusSessionActive, isTodayCompleted, userProfile.streak]);

  useEffect(() => {
    evaluateReminder();
  }, [evaluateReminder]);

  // Listen for custom trigger to test or re-open reminder
  useEffect(() => {
    const handleManualTrigger = () => {
      setIsVisible(true);
      setIsSnoozed(false);
      triggerDailyStreakReminder(userProfile.streak, timeRemaining.label);
    };

    window.addEventListener('focus-show-streak-reminder', handleManualTrigger);
    return () => {
      window.removeEventListener('focus-show-streak-reminder', handleManualTrigger);
    };
  }, [userProfile.streak, timeRemaining.label]);

  const handleSnooze = () => {
    const snoozeUntil = Date.now() + 60 * 60 * 1000; // 1 hour
    saveStreakReminderConfig({ snoozedUntilTimestamp: snoozeUntil });
    setIsSnoozed(true);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Dismiss until next page reload or tomorrow
    const snoozeUntil = Date.now() + 30 * 60 * 1000; // 30 mins
    saveStreakReminderConfig({ snoozedUntilTimestamp: snoozeUntil });
    setIsVisible(false);
  };

  const handleToggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    saveStreakReminderConfig({ soundEnabled: nextSound });
  };

  const handleEnablePush = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      triggerDailyStreakReminder(userProfile.streak, timeRemaining.label);
    }
  };

  const handleStartQuickFocus = () => {
    setIsVisible(false);
    openQuickFocus(15, 'Streak Preserver Focus Drill', 'Physics');
  };

  if (!isVisible || isTodayCompleted) {
    return null;
  }

  return (
    <div
      id="streak-reminder-toast"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] animate-slideUp"
    >
      <div className="relative overflow-hidden rounded-3xl p-5 bg-[#0e111a]/95 border border-amber-500/40 shadow-[0_12px_45px_rgba(245,158,11,0.25)] backdrop-blur-xl space-y-3.5 ring-1 ring-amber-500/30">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header Row */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0 animate-pulse">
              <Flame className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Streak Preserver Alert
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-white leading-tight">
                Keep your {userProfile.streak}-day streak alive!
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={soundEnabled ? 'Mute notification chime' : 'Enable notification chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss for now"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Body */}
        <p className="text-xs text-slate-300 leading-relaxed relative z-10">
          You haven't logged study time today. Complete a quick <strong>15-minute</strong> focus session before midnight to maintain your streak momentum.
        </p>

        {/* Urgency & Time Remaining Pill */}
        <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono relative z-10">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Left Today:</span>
          </div>
          <span className="font-bold">{timeRemaining.label}</span>
        </div>

        {/* Optional Push Notification Permission prompt */}
        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[11px] relative z-10">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Get desktop reminder before day ends?</span>
            </div>
            <button
              type="button"
              onClick={handleEnablePush}
              className="px-2 py-0.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-[10px] transition-colors shrink-0"
            >
              Enable
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            type="button"
            id="streak-toast-start-focus"
            onClick={handleStartQuickFocus}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs font-mono shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Start 15m Focus</span>
          </button>

          <button
            type="button"
            onClick={handleSnooze}
            className="py-2.5 px-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 text-xs font-mono transition-colors"
            title="Remind me in 1 hour"
          >
            Snooze 1h
          </button>
        </div>
      </div>
    </div>
  );
};
