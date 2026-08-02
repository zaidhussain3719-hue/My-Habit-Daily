import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { Navigation, BottomNav, NavTab } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { HabitsView } from './components/HabitsView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { HabitFormModal } from './components/HabitFormModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AdMobBanner } from './components/AdMobBanner';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { AndroidFrame } from './components/AndroidFrame';
import { HomeScreenWidget } from './components/HomeScreenWidget';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StorageService, calculateHabitStreak } from './services/storageService';
import { auth, isFirebaseAvailable, logTelemetryEvent } from './services/firebaseService';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { 
  subscribeNotifications, 
  subscribeNotificationTap,
  triggerSmartReminder, 
  ToastNotification,
  requestNotificationPermission,
  cancelScheduledNotificationsForHabit,
  checkAndTriggerScheduledReminders,
  getMotivationalMessageForHabit
} from './services/notificationService';
import { UserProfile, Habit, Achievement } from './types';
import { BellRing, X, ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(StorageService.getProfile());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [habits, setHabits] = useState<Habit[]>(StorageService.getHabits());
  const [achievements, setAchievements] = useState<Achievement[]>(StorageService.getAchievements());

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isFrameActive, setIsFrameActive] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const currentLanguage = userProfile.language || 'en';

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
        if (firebaseUser) {
          setIsLoggedIn(true);
          const currentProfile = StorageService.getProfile();
          const updatedProfile: UserProfile = {
            ...currentProfile,
            uid: firebaseUser.uid,
            email: firebaseUser.email || currentProfile.email,
            name: firebaseUser.displayName || currentProfile.name || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            photoUrl: firebaseUser.photoURL || currentProfile.photoUrl,
            isGuest: false,
          };
          setUserProfile(updatedProfile);
          StorageService.saveProfile(updatedProfile);
          logTelemetryEvent('firebase_auth_state_changed', { uid: firebaseUser.uid, email: firebaseUser.email });
        }
      });
      return unsubscribe;
    }
  }, []);

  // Listen to Firestore real-time updates for habits and profile
  useEffect(() => {
    if (isLoggedIn && userProfile.uid && !userProfile.isGuest) {
      const unsubHabits = StorageService.subscribeHabitsSync(userProfile.uid, fetchedHabits => {
        setHabits(fetchedHabits);
      });
      const unsubProfile = StorageService.subscribeProfileSync(userProfile.uid, fetchedProfile => {
        setUserProfile(fetchedProfile);
      });
      return () => {
        unsubHabits();
        unsubProfile();
      };
    }
  }, [isLoggedIn, userProfile.uid, userProfile.isGuest]);

  // Subscribe to smart reminder toast notifications
  useEffect(() => {
    const unsubscribe = subscribeNotifications(notif => {
      setActiveToast(notif);
      setTimeout(() => {
        setActiveToast(prev => (prev?.id === notif.id ? null : prev));
      }, 7000);
    });
    return unsubscribe;
  }, []);

  // Handle tapping notification to open specific habit inside the app
  useEffect(() => {
    const unsubscribeTap = subscribeNotificationTap(habitId => {
      setActiveTab('today');
      if (habitId) {
        const found = habits.find(h => h.id === habitId);
        if (found) {
          setEditingHabit(found);
          setIsFormModalOpen(true);
        }
      }
    });
    return unsubscribeTap;
  }, [habits]);

  // Background Automatic Daily Notification Scheduler Engine
  useEffect(() => {
    checkAndTriggerScheduledReminders(habits, userProfile);

    const interval = setInterval(() => {
      checkAndTriggerScheduledReminders(habits, userProfile);
    }, 10000);

    return () => clearInterval(interval);
  }, [habits, userProfile]);

  // Sync theme with HTML root class
  useEffect(() => {
    if (userProfile.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.themeMode]);

  // Max streak across all active habits
  const streakCount = Math.max(
    0,
    ...habits.filter(h => !h.archived).map(h => calculateHabitStreak(h).currentStreak)
  );

  const handleUpdateLog = (habitId: string, date: string, count: number, notes?: string) => {
    const updatedHabits = StorageService.updateHabitLog(habitId, date, count, notes);
    setHabits([...updatedHabits]);
    setAchievements(StorageService.getAchievements());
  };

  const handleSaveHabit = (habitData: Partial<Habit>) => {
    let updated: Habit[];
    if (editingHabit) {
      updated = habits.map(h => (h.id === editingHabit.id ? ({ ...h, ...habitData } as Habit) : h));
    } else {
      const newHabit: Habit = {
        id: 'habit_' + Date.now(),
        title: habitData.title || 'New Habit',
        description: habitData.description || '',
        category: habitData.category || 'Health',
        icon: habitData.icon || 'CheckCircle2',
        color: habitData.color || 'emerald',
        frequency: habitData.frequency || 'daily',
        targetValue: habitData.targetValue || 1,
        unit: habitData.unit || 'times',
        reminderTime: habitData.reminderTime || '08:00',
        reminderTimes: habitData.reminderTimes || ['08:00'],
        reminderEnabled: habitData.reminderEnabled ?? true,
        archived: false,
        createdAt: new Date().toISOString(),
        logs: {},
      };
      updated = [newHabit, ...habits];
    }

    setHabits(updated);
    StorageService.saveHabits(updated);
    setAchievements(StorageService.checkAchievements());
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      const updated = habits.filter(h => h.id !== habitId);
      setHabits(updated);
      StorageService.saveHabits(updated);
      cancelScheduledNotificationsForHabit(habitId);
    }
  };

  const handleToggleArchive = (habitId: string) => {
    const updated = habits.map(h => (h.id === habitId ? { ...h, archived: !h.archived } : h));
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const handleToggleTheme = () => {
    const newMode = userProfile.themeMode === 'dark' ? 'light' : 'dark';
    handleUpdateProfile({ ...userProfile, themeMode: newMode });
  };

  const handleTriggerTestReminder = () => {
    requestNotificationPermission();
    const activeHabit = habits.find(h => !h.archived);
    if (activeHabit) {
      const body = getMotivationalMessageForHabit(activeHabit.title);
      triggerSmartReminder(`Reminder: ${activeHabit.title}`, body, activeHabit.id, 'daily_reminders');
    } else {
      triggerSmartReminder(
        'My Habit Daily Reminder', 
        'Stay consistent! Create your first habit and start crushing your goals.',
        undefined,
        'motivation'
      );
    }
  };

  // If splash screen is active
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If user is not logged in and hasn't selected guest mode
  if (!isLoggedIn && !userProfile.uid) {
    return (
      <AuthScreen
        onLoginSuccess={profile => {
          setUserProfile(profile);
          StorageService.saveProfile(profile);
          setIsLoggedIn(true);
        }}
        onContinueAsGuest={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AndroidFrame isActive={isFrameActive}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
          {/* Navigation Header */}
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userProfile={userProfile}
            onToggleTheme={handleToggleTheme}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenTelemetry={() => setIsTelemetryOpen(true)}
            streakCount={streakCount}
            language={currentLanguage}
          />

          {/* Material 3 Smart Reminder Push Notification Banner */}
          {activeToast && (
            <div className="sticky top-16 z-50 mx-4 my-2 p-4 bg-slate-900/95 dark:bg-slate-900/95 text-white rounded-3xl border border-emerald-500/30 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-600/30 text-emerald-400 rounded-2xl shrink-0 mt-0.5">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {activeToast.channelName || 'Daily Habit Reminder'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{activeToast.timestamp}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">{activeToast.title}</h4>
                    <p className="text-xs text-slate-300 leading-snug">{activeToast.body}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveToast(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const habitId = activeToast.habitId;
                    setActiveToast(null);
                    if (habitId) {
                      const found = habits.find(h => h.id === habitId);
                      if (found) {
                        setEditingHabit(found);
                        setIsFormModalOpen(true);
                      }
                    } else {
                      setActiveTab('today');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Open Habit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Main View Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4">
            {activeTab === 'today' && (
              <TodayView
                habits={habits}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onUpdateLog={handleUpdateLog}
                onOpenCreateModal={() => {
                  setEditingHabit(null);
                  setIsFormModalOpen(true);
                }}
                onEditHabit={habit => {
                  setEditingHabit(habit);
                  setIsFormModalOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
                onTriggerTestReminder={handleTriggerTestReminder}
                onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
                language={currentLanguage}
              />
            )}

            {activeTab === 'habits' && (
              <HabitsView
                habits={habits}
                onOpenCreateModal={() => {
                  setEditingHabit(null);
                  setIsFormModalOpen(true);
                }}
                onEditHabit={habit => {
                  setEditingHabit(habit);
                  setIsFormModalOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
                onToggleArchive={handleToggleArchive}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView habits={habits} onUpdateLog={handleUpdateLog} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView habits={habits} userProfile={userProfile} language={currentLanguage} />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                userProfile={userProfile}
                habits={habits}
                onUpdateProfile={handleUpdateProfile}
                onOpenAchievements={() => setIsAchievementsOpen(true)}
                onSignOut={async () => {
                  if (isFirebaseAvailable && auth) {
                    try {
                      await firebaseSignOut(auth);
                      logTelemetryEvent('firebase_sign_out_success');
                    } catch (err) {
                      console.warn('Firebase sign out error', err);
                    }
                  }
                  setIsLoggedIn(false);
                  setUserProfile({ ...userProfile, uid: '', isGuest: true });
                }}
                onImportHabits={imported => {
                  setHabits(imported);
                  StorageService.saveHabits(imported);
                }}
                onToggleAdMob={() => {
                  handleUpdateProfile({
                    ...userProfile,
                    adMobEnabled: !userProfile.adMobEnabled,
                  });
                }}
                onToggleFrame={() => setIsFrameActive(!isFrameActive)}
                isFrameActive={isFrameActive}
                language={currentLanguage}
              />
            )}
          </main>

          {/* Google AdMob Test Banner */}
          {userProfile.adMobEnabled && (
            <AdMobBanner
              onClose={() => {
                handleUpdateProfile({ ...userProfile, adMobEnabled: false });
              }}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} language={currentLanguage} />

          {/* Modals & Drawers */}
          <HabitFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setEditingHabit(null);
            }}
            onSave={handleSaveHabit}
            initialHabit={editingHabit}
          />

          <AchievementsModal
            isOpen={isAchievementsOpen}
            onClose={() => setIsAchievementsOpen(false)}
            achievements={achievements}
          />

          <TelemetryDrawer
            isOpen={isTelemetryOpen}
            onClose={() => setIsTelemetryOpen(false)}
          />

          <HomeScreenWidget
            isOpen={isWidgetModalOpen}
            onClose={() => setIsWidgetModalOpen(false)}
            habits={habits}
            onUpdateLog={handleUpdateLog}
            language={currentLanguage}
          />
        </div>
      </AndroidFrame>
    </ErrorBoundary>
  );
}
