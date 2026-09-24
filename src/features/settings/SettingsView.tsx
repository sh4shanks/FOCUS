import React, { useState } from 'react';
import { useFocusStore } from '../../store/useFocusStore';
import {
  Settings,
  User,
  Clock,
  Volume2,
  Database,
  RotateCcw,
  Download,
  Trash2,
  Check,
  Sparkles,
  Shield,
  Bell,
  Flame,
} from 'lucide-react';
import {
  getStreakReminderConfig,
  saveStreakReminderConfig,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  StreakReminderConfig,
} from '../../services/notificationService';

export const SettingsView: React.FC = () => {
  const { userProfile, updateProfile, resetToDemoData } = useFocusStore();

  const [name, setName] = useState(userProfile.name);
  const [grade, setGrade] = useState(userProfile.grade);
  const [dailyGoalHours, setDailyGoalHours] = useState(userProfile.dailyGoalHours);
  const [priorities, setPriorities] = useState(userProfile.academicPriorities);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [reminderConfig, setReminderConfig] = useState<StreakReminderConfig>(getStreakReminderConfig);
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermissionStatus);
  const [testSent, setTestSent] = useState(false);

  const handleUpdateReminder = (updates: Partial<StreakReminderConfig>) => {
    const next = saveStreakReminderConfig(updates);
    setReminderConfig(next);
    setSavedMessage('Study streak reminder settings saved.');
    setTimeout(() => setSavedMessage(null), 3500);
  };

  const handleEnablePush = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      handleUpdateReminder({ browserPushEnabled: true });
    }
  };

  const handleTriggerTest = () => {
    window.dispatchEvent(new CustomEvent('focus-show-streak-reminder'));
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      grade: grade.trim(),
      dailyGoalHours,
      academicPriorities: priorities.trim(),
    });
    setSavedMessage('Profile and study preferences updated successfully.');
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleExportData = () => {
    const state = useFocusStore.getState();
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-academic-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all subjects, tasks, and schedules to initial demo state?')) {
      resetToDemoData();
      setName('Alex Chen');
      setGrade('12th Grade / Senior');
      setDailyGoalHours(3.5);
      setSavedMessage('Workspace restored to pristine demo state.');
      setTimeout(() => setSavedMessage(null), 4000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto pb-24 lg:pb-12 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>PREFERENCES & STORAGE</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your study constraints, target daily hours, and manage local data persistence.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
          <User className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Student Academic Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Grade / Academic Year
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span>Daily Study Time Ceiling</span>
              <span className="font-mono text-cyan-400 font-bold">{dailyGoalHours} hours/day</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              The Auto-Planner and Adaptive Scheduling will strictly respect this limit.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Academic Priorities / Focus Objective
            </label>
            <textarea
              rows={3}
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Study Streak & Push Notification Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Study Streak & Push Alerts
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            {userProfile.streak}-Day Active Streak
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Receive timely nudges before midnight to ensure you complete at least 15 minutes of study and maintain your daily momentum.
        </p>

        <div className="space-y-4">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <div className="text-xs font-bold text-white">Daily Streak Reminder Alert</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Shows in-app alert toast and plays chime if no study logged today
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUpdateReminder({ enabled: !reminderConfig.enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                reminderConfig.enabled ? 'bg-amber-500' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  reminderConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Time Selector */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">Daily Reminder Time</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                When to nudge you if study is still pending
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[18, 19, 20, 21].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleUpdateReminder({ reminderHour: h })}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer ${
                    reminderConfig.reminderHour === h
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {h > 12 ? `${h - 12} PM` : `${h} AM`}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Push Permission */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">System Push Notifications</span>
                {permissionStatus === 'granted' && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Granted
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Receive browser alerts even when the tab is running in the background
              </div>
            </div>

            {permissionStatus !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnablePush}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-semibold transition-colors shrink-0"
              >
                Enable Push
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-mono font-medium">Ready</span>
            )}
          </div>

          {/* Test Reminder Trigger */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Want to see how your streak reminder looks and sounds?
            </span>
            <button
              type="button"
              id="settings-test-reminder-btn"
              onClick={handleTriggerTest}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{testSent ? 'Alert Dispatched! 🔥' : 'Test Alert Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local Storage & Data Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0e111a]/80 border border-white/[0.07] backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Privacy & Data Storage
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          FOCUS operates local-first on your device. Your syllabus progress, task deadlines, revision intervals, and study notes are stored securely in browser <code className="font-mono text-cyan-300">localStorage</code>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
