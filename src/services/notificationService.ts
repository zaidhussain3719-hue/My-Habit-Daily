import { logTelemetryEvent } from './firebaseService';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  icon?: string;
  actionUrl?: string;
}

let notificationListeners: ((notification: ToastNotification) => void)[] = [];

export function subscribeNotifications(listener: (notification: ToastNotification) => void) {
  notificationListeners.push(listener);
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener);
  };
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

export function triggerSmartReminder(title: string, body: string) {
  const notif: ToastNotification = {
    id: 'notif_' + Date.now(),
    title,
    body,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  playNotificationSound();
  logTelemetryEvent('reminder_triggered', { title, body }, 'analytics');

  // Trigger web notification if granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/src/assets/images/my_habit_daily_logo_1785647006620.jpg',
      });
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
