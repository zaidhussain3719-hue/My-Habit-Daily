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
import { StorageService, calculateHabitStreak } from './services/storageService';
import { 
  subscribeNotifications, 
  triggerSmartReminder, 
  ToastNotification,
  requestNotificationPermission 
} from './services/notificationService';
import { UserProfile, Habit, Achievement } from './types';
import { BellRing, X } from 'lucide-react';

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

  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  // Subscribe to smart reminder toast notifications
  useEffect(() => {
    const unsubscribe = subscribeNotifications(notif => {
      setActiveToast(notif);
      setTimeout(() => {
        setActiveToast(prev => (prev?.id === notif.id ? null : prev));
      }, 5000);
    });
    return unsubscribe;
  }, []);

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
    }
  };

  const handleToggleArchive = (habitId: string) => {
    const updated = habits.map(h => (h.id === habitId ? { ...h, archived: !h.archived } : h));
    setHabits(updated);
    StorageService.saveHabits(updated);
  };

  const handleToggleReminder = (habitId: string) => {
    const updated = habits.map(h =>
      h.id === habitId ? { ...h, reminderEnabled: !h.reminderEnabled } : h
    );
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
    const title = activeHabit ? `Reminder: ${activeHabit.title}` : 'My Habit Daily Reminder';
    const body = activeHabit
      ? `Time for your daily routine: ${activeHabit.targetValue} ${activeHabit.unit}`
      : 'Stay consistent! Log your daily habits now.';
    triggerSmartReminder(title, body);
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
        />

        {/* Smart Reminder Toast Notification Banner */}
        {activeToast && (
          <div className="sticky top-16 z-50 mx-4 my-2 p-3 bg-emerald-900 text-white rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold">{activeToast.title}</h4>
                <p className="text-[11px] text-emerald-200">{activeToast.body}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="p-1 text-emerald-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
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

          {activeTab === 'analytics' && <AnalyticsView habits={habits} />}

          {activeTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              habits={habits}
              onUpdateProfile={handleUpdateProfile}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onSignOut={() => {
                setIsLoggedIn(false);
                setUserProfile({ ...userProfile, uid: '' });
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
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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
      </div>
    </AndroidFrame>
  );
}
