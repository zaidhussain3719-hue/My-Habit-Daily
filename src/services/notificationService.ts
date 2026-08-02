import { logTelemetryEvent } from './firebaseService';
import { Habit, UserProfile } from '../types';

export interface ToastNotification {
  id: string;
  habitId?: string;
  title: string;
  body: string;
  timestamp: string;
  icon?: string;
  channel?: 'daily_reminders' | 'evening_wrapup' | 'motivation';
  channelName?: string;
  actionUrl?: string;
}

// Daily changing motivational messages list
const MOTIVATIONAL_TEMPLATES = [
  "Consistency build destiny! Time for {title}.",
  "Small steps lead to big victories! Don't forget {title} today.",
  "Keep your streak blazing hot! Complete {title} now.",
  "Future you will thank you for finishing {title} today.",
  "Success is standard practice. Take 2 minutes for {title}.",
  "Stay focused and driven: {title} awaits your check-in!",
  "Make today count—log your progress for {title}.",
  "Every repetition makes you stronger. Complete {title}!",
  "Mindset is everything. Crush your goal for {title} today.",
  "Build momentum today: check off {title}."
];

let notificationListeners: ((notification: ToastNotification) => void)[] = [];
let tapNotificationListeners: ((habitId?: string) => void)[] = [];
let triggeredTodayMap: Record<string, boolean> = {}; // HabitId_HH:mm_YYYY-MM-DD -> true

// Load triggered map from storage
try {
  const saved = localStorage.getItem('myhabit_triggered_notifications');
  if (saved) triggeredTodayMap = JSON.parse(saved);
} catch (e) {
  console.warn('Could not read triggered notifications from storage', e);
}

function saveTriggeredMap() {
  try {
    localStorage.setItem('myhabit_triggered_notifications', JSON.stringify(triggeredTodayMap));
  } catch (e) {}
}

export function getMotivationalMessageForHabit(habitTitle: string, dateStr?: string): string {
  const today = dateStr || new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash += today.charCodeAt(i);
  }
  for (let i = 0; i < habitTitle.length; i++) {
    hash += habitTitle.charCodeAt(i);
  }

  const template = MOTIVATIONAL_TEMPLATES[Math.abs(hash) % MOTIVATIONAL_TEMPLATES.length];
  return template.replace('{title}', habitTitle);
}

export function subscribeNotifications(listener: (notification: ToastNotification) => void) {
  notificationListeners.push(listener);
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener);
  };
}

export function subscribeNotificationTap(listener: (habitId?: string) => void) {
  tapNotificationListeners.push(listener);
  return () => {
    tapNotificationListeners = tapNotificationListeners.filter(l => l !== listener);
  };
}

export function triggerNotificationTap(habitId?: string) {
  tapNotificationListeners.forEach(fn => fn(habitId));
}

export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn('Audio play restricted or unsupported', e);
  }
}

export function triggerSmartReminder(
  title: string, 
  body: string, 
  habitId?: string, 
  channel: 'daily_reminders' | 'evening_wrapup' | 'motivation' = 'daily_reminders'
) {
  const channelNames = {
    daily_reminders: 'Daily Habit Reminders',
    evening_wrapup: 'Evening Wrap-up Alert',
    motivation: 'Motivation Boost'
  };

  const notif: ToastNotification = {
    id: 'notif_' + Date.now(),
    habitId,
    title,
    body,
    channel,
    channelName: channelNames[channel],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  playNotificationSound();
  logTelemetryEvent('reminder_triggered', { title, body, habitId, channel }, 'analytics');

  // Trigger web notification if granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      const webNotif = new Notification(title, {
        body,
        icon: '/src/assets/images/my_habit_daily_logo_1785647006620.jpg',
        tag: habitId || 'general_reminder',
      });
      webNotif.onclick = () => {
        window.focus();
        triggerNotificationTap(habitId);
      };
    } catch (e) {
      console.warn('Browser notification failed', e);
    }
  }

  // Notify active React toast subscribers
  notificationListeners.forEach(fn => fn(notif));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;

  try {
    const result = await Notification.requestPermission();
    logTelemetryEvent('notification_permission_result', { permission: result });
    return result === 'granted';
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return false;
  }
}

export function cancelScheduledNotificationsForHabit(habitId: string) {
  // Purge any pending keys in triggeredTodayMap associated with habitId
  Object.keys(triggeredTodayMap).forEach(key => {
    if (key.startsWith(habitId + '_')) {
      delete triggeredTodayMap[key];
    }
  });
  saveTriggeredMap();
  logTelemetryEvent('notifications_cancelled_for_habit', { habitId });
}

/**
 * Background Auto-Scheduler Engine.
 * Scans all active habits and triggers notifications for matching reminder times.
 */
export function checkAndTriggerScheduledReminders(habits: Habit[], profile: UserProfile) {
  if (!profile.notificationsEnabled) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHH = String(now.getHours()).padStart(2, '0');
  const currentMM = String(now.getMinutes()).padStart(2, '0');
  const currentHHMM = `${currentHH}:${currentMM}`;

  const activeHabits = habits.filter(h => !h.archived);

  activeHabits.forEach(habit => {
    if (!habit.reminderEnabled) return;

    // Build list of times for this habit (single or multiple)
    const timesToTest: string[] = habit.reminderTimes && habit.reminderTimes.length > 0
      ? habit.reminderTimes
      : (habit.reminderTime ? [habit.reminderTime] : ['08:00']);

    timesToTest.forEach(time => {
      if (time === currentHHMM) {
        const triggerKey = `${habit.id}_${time}_${todayStr}`;
        if (!triggeredTodayMap[triggerKey]) {
          triggeredTodayMap[triggerKey] = true;
          saveTriggeredMap();

          const log = habit.logs[todayStr];
          const isCompleted = log?.completed || (log?.count || 0) >= habit.targetValue;

          // Only remind if not yet completed today
          if (!isCompleted) {
            const body = getMotivationalMessageForHabit(habit.title, todayStr);
            triggerSmartReminder(`Reminder: ${habit.title}`, body, habit.id, 'daily_reminders');
          }
        }
      }
    });
  });

  // Evening Wrap-up check at 20:00 (8:00 PM)
  if (currentHHMM === '20:00') {
    const wrapupKey = `evening_wrapup_${todayStr}`;
    if (!triggeredTodayMap[wrapupKey]) {
      triggeredTodayMap[wrapupKey] = true;
      saveTriggeredMap();

      const incompleteCount = activeHabits.filter(h => {
        const log = h.logs[todayStr];
        return !log?.completed && (log?.count || 0) < h.targetValue;
      }).length;

      if (incompleteCount > 0) {
        triggerSmartReminder(
          'Evening Habit Wrap-up 🌙',
          `You have ${incompleteCount} habit(s) remaining today! Keep your streak alive before midnight.`,
          undefined,
          'evening_wrapup'
        );
      }
    }
  }
}
