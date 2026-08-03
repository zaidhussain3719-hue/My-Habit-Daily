import { Habit, UserProfile, Achievement, HabitLog } from '../types';
import { DEFAULT_USER, INITIAL_HABITS, INITIAL_ACHIEVEMENTS } from '../data/initialData';
import { db, auth, isFirebaseAvailable, logTelemetryEvent } from './firebaseService';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEYS = {
  HABITS: 'my_habit_daily_habits_v2',
  PROFILE: 'my_habit_daily_profile_v2',
  ACHIEVEMENTS: 'my_habit_daily_achievements_v2',
};

// Calculate habits streak based on daily completions
export function calculateHabitStreak(habit: Habit): { currentStreak: number; bestStreak: number } {
  const dates = Object.keys(habit.logs).sort();
  if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // Check if completed today or yesterday to maintain active streak
  const lastCompletedDate = [...dates].reverse().find(d => habit.logs[d]?.completed);

  if (lastCompletedDate === todayStr || lastCompletedDate === yesterdayStr) {
    let checkDate = new Date(lastCompletedDate);
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (habit.logs[dStr]?.completed) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak historically
  let prevTimestamp = 0;
  dates.forEach(dStr => {
    if (habit.logs[dStr]?.completed) {
      const curTimestamp = new Date(dStr).getTime();
      if (prevTimestamp === 0 || curTimestamp - prevTimestamp === 86400000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      prevTimestamp = curTimestamp;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
  });

  return { currentStreak, bestStreak: Math.max(currentStreak, bestStreak) };
}

// Storage Manager
export class StorageService {
  static getProfile(): UserProfile {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse cached profile', e);
    }
    return DEFAULT_USER;
  }

  static saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    logTelemetryEvent('user_profile_updated', { name: profile.name, email: profile.email });

    if (isFirebaseAvailable && db && auth?.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, profile, { merge: true }).catch(err => {
        logTelemetryEvent('firestore_profile_sync_error', { err: String(err) }, 'firestore');
      });
    }
  }

  static subscribeProfileSync(userId: string, callback: (profile: UserProfile) => void): () => void {
    if (isFirebaseAvailable && db && userId) {
      const userRef = doc(db, 'users', userId);
      return onSnapshot(userRef, snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          if (data) {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
            callback(data);
            logTelemetryEvent('firestore_profile_synced', { name: data.name }, 'firestore');
          }
        } else {
          const fallbackProf: UserProfile = {
            ...DEFAULT_USER,
            uid: userId,
            email: auth?.currentUser?.email || DEFAULT_USER.email,
            name: auth?.currentUser?.displayName || auth?.currentUser?.email?.split('@')[0] || DEFAULT_USER.name,
            isGuest: false,
          };
          setDoc(userRef, fallbackProf, { merge: true }).catch(console.error);
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(fallbackProf));
          callback(fallbackProf);
        }
      }, err => {
        logTelemetryEvent('firestore_profile_snapshot_error', { err: String(err) }, 'firestore');
      });
    }
    return () => {};
  }

  static getHabits(): Habit[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse habits', e);
    }
    return INITIAL_HABITS;
  }

  static saveHabits(habits: Habit[]): void {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));

    if (isFirebaseAvailable && db && auth?.currentUser) {
      const habitsRef = doc(db, 'user_habits', auth.currentUser.uid);
      setDoc(habitsRef, { habits, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => {
        logTelemetryEvent('firestore_habits_sync_error', { err: String(err) }, 'firestore');
      });
    }
  }

  static subscribeHabitsSync(userId: string, callback: (habits: Habit[]) => void): () => void {
    if (isFirebaseAvailable && db && userId) {
      const habitsRef = doc(db, 'user_habits', userId);
      return onSnapshot(habitsRef, snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && Array.isArray(data.habits)) {
            localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data.habits));
            callback(data.habits);
            logTelemetryEvent('firestore_habits_synced', { count: data.habits.length }, 'firestore');
          }
        } else {
          const initial = INITIAL_HABITS;
          setDoc(habitsRef, { habits: initial, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.error);
          localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(initial));
          callback(initial);
          logTelemetryEvent('firestore_habits_seeded', { count: initial.length }, 'firestore');
        }
      }, err => {
        logTelemetryEvent('firestore_habits_snapshot_error', { err: String(err) }, 'firestore');
      });
    }
    return () => {};
  }

  static getAchievements(): Achievement[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse achievements', e);
    }
    return INITIAL_ACHIEVEMENTS;
  }

  static saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  static updateHabitLog(habitId: string, date: string, count: number, notes?: string): Habit[] {
    const habits = StorageService.getHabits();
    const habit = habits.find(h => h.id === habitId);

    if (habit) {
      const completed = count >= habit.targetValue;
      habit.logs[date] = { date, count, completed, notes: notes || habit.logs[date]?.notes };
      StorageService.saveHabits(habits);

      logTelemetryEvent('habit_log_updated', { habitId, date, count, completed });
      StorageService.checkAchievements();
    }
    return habits;
  }

  static checkAchievements(): Achievement[] {
    const habits = StorageService.getHabits();
    const achievements = StorageService.getAchievements();
    let updated = false;

    let totalCompletions = 0;
    let maxStreak = 0;

    habits.forEach(h => {
      Object.values(h.logs).forEach((l: HabitLog) => {
        if (l.completed) totalCompletions++;
      });
      const streak = calculateHabitStreak(h).currentStreak;
      if (streak > maxStreak) maxStreak = streak;
    });

    achievements.forEach(ach => {
      if (ach.id === 'ach_1' && totalCompletions >= 1) {
        if (!ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); updated = true; }
        ach.progress = 1;
      }
      if (ach.id === 'ach_2' && maxStreak >= 3) {
        if (!ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); updated = true; }
        ach.progress = Math.min(maxStreak, 3);
      }
      if (ach.id === 'ach_3') {
        ach.progress = Math.min(maxStreak, 7);
        if (maxStreak >= 7 && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); updated = true; }
      }
      if (ach.id === 'ach_5') {
        ach.progress = Math.min(habits.length, 5);
        if (habits.length >= 5 && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); updated = true; }
      }
      if (ach.id === 'ach_6') {
        ach.progress = Math.min(totalCompletions, 100);
        if (totalCompletions >= 100 && !ach.unlocked) { ach.unlocked = true; ach.unlockedAt = new Date().toISOString(); updated = true; }
      }
    });

    if (updated) {
      StorageService.saveAchievements(achievements);
      logTelemetryEvent('achievement_unlocked', { totalCompletions, maxStreak });
    }
    return achievements;
  }
}
