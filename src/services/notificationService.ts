// Notification and Streak Reminder Service for Focus Academic OS

export interface StreakReminderConfig {
  enabled: boolean;
  reminderHour: number; // 24-hour format, e.g. 20 for 8 PM
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  snoozedUntilTimestamp?: number | null;
  lastNotifiedDate?: string | null;
}

const SETTINGS_KEY = 'focus_streak_reminder_settings_v1';

export const DEFAULT_REMINDER_CONFIG: StreakReminderConfig = {
  enabled: true,
  reminderHour: 20, // 8:00 PM
  soundEnabled: true,
  browserPushEnabled: true,
  snoozedUntilTimestamp: null,
  lastNotifiedDate: null,
};

export function getStreakReminderConfig(): StreakReminderConfig {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_REMINDER_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load streak reminder settings', e);
  }
  return DEFAULT_REMINDER_CONFIG;
}

export function saveStreakReminderConfig(config: Partial<StreakReminderConfig>): StreakReminderConfig {
  const current = getStreakReminderConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save streak reminder settings', e);
  }
  return updated;
}

/**
 * Check if today's study session is completed or pending
 */
export function isTodayStudyCompleted(lastActiveDate?: string, completedRecordsCount = 0): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  if (lastActiveDate === todayStr && completedRecordsCount > 0) {
    return true;
  }
  return false;
}

/**
 * Calculate hours and minutes remaining until the day ends (midnight)
 */
export function getTimeRemainingToday(): { hours: number; minutes: number; label: string } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let label = `${hours}h ${minutes}m`;
  if (hours === 0) {
    label = `${minutes} min`;
  }
  return { hours, minutes, label };
}

/**
 * Check Browser Notification API permission
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request permission for Desktop/Browser notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      saveStreakReminderConfig({ browserPushEnabled: true });
    }
    return permission;
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return 'denied';
  }
}

/**
 * Synthesize a gentle audio chime for study reminder
 */
export function playReminderChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio contexts may be restricted prior to user interaction
  }
}

/**
 * Fire a system push notification if permission is granted
 */
export function sendBrowserPushNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (getNotificationPermissionStatus() !== 'granted') {
    return null;
  }

  try {
    const notifOptions: NotificationOptions = {
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: 'streak-reminder',
      ...options,
    };
    const notif = new Notification(title, notifOptions);

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  } catch (e) {
    console.error('Failed to trigger browser notification', e);
    return null;
  }
}

/**
 * Fire the streak preservation reminder (both push and sound)
 */
export function triggerDailyStreakReminder(
  streakCount: number,
  timeRemainingStr: string
): boolean {
  const config = getStreakReminderConfig();
  if (!config.enabled) return false;

  if (config.soundEnabled) {
    playReminderChime();
  }

  if (config.browserPushEnabled && getNotificationPermissionStatus() === 'granted') {
    sendBrowserPushNotification(`🔥 Don't lose your ${streakCount}-day study streak!`, {
      body: `You haven't completed today's study session. Only ${timeRemainingStr} left to preserve your momentum!`,
      requireInteraction: true,
    });
  }

  // Update last notified date
  const todayStr = new Date().toISOString().split('T')[0];
  saveStreakReminderConfig({ lastNotifiedDate: todayStr });
  return true;
}
