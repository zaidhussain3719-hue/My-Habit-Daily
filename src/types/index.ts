export type CategoryType = 'Health' | 'Fitness' | 'Productivity' | 'Mindfulness' | 'Learning' | 'Finance' | 'Custom';

export type FrequencyType = 'daily' | 'weekly' | 'specific_days';

export interface HabitLog {
  date: string; // YYYY-MM-DD
  count: number;
  completed: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: CategoryType;
  icon: string; // Lucide icon name
  color: string; // Tailwind color token (e.g., 'emerald', 'teal', 'green', 'indigo', 'amber', 'rose')
  frequency: FrequencyType;
  targetDaysPerWeek?: number; // for weekly (e.g., 3 days)
  specificDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  targetValue: number; // e.g., 8
  unit: string; // e.g., 'glasses', 'mins', 'times', 'pages'
  reminderTime?: string; // Legacy HH:mm format
  reminderTimes?: string[]; // Multiple reminder times per day (e.g., ['08:00', '14:00', '20:00'])
  reminderEnabled?: boolean;
  archived: boolean;
  createdAt: string;
  logs: Record<string, HabitLog>; // key is YYYY-MM-DD
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  bio?: string;
  dailyTargetPercent: number; // e.g., 80%
  themeMode: 'light' | 'dark' | 'system';
  isGuest: boolean;
  joinedAt: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  batteryOptimizationIgnored?: boolean;
  notificationChannelConfig?: {
    dailyReminders: boolean;
    eveningWrapup: boolean;
    motivationBoost: boolean;
  };
  adMobEnabled: boolean;
  language?: 'en' | 'hi';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  params: Record<string, any>;
  timestamp: string;
  type: 'analytics' | 'crashlytics' | 'firestore';
}

export interface DailyQuote {
  quote: string;
  author: string;
}
