import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { isFirebaseAvailable } from '../services/firebaseService';
import { 
  CalendarDays, 
  BarChart3, 
  User, 
  CheckSquare, 
  ListTodo, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  Bell, 
  Trophy,
  Activity,
  Sparkles
} from 'lucide-react';

export type NavTab = 'today' | 'habits' | 'calendar' | 'analytics' | 'profile';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userProfile: UserProfile;
  onToggleTheme: () => void;
  onOpenAchievements: () => void;
  onOpenTelemetry: () => void;
  streakCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userProfile,
  onToggleTheme,
  onOpenAchievements,
  onOpenTelemetry,
  streakCount,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 transition-colors">
      {/* Android System Status Bar (Material 3 Android feel) */}
      <div className="w-full bg-emerald-950 text-emerald-200/90 text-[11px] px-4 py-1 flex justify-between items-center font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">{currentTime || '09:41'}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection state */}
          <button 
            onClick={onOpenTelemetry}
            title="Firebase Telemetry & Sync Status"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {isFirebaseAvailable ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-300">Cloud Firestore</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-300">Offline Caching</span>
              </>
            )}
          </button>
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      {/* Material 3 App Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-sm flex items-center justify-center">
            <img
              src="/src/assets/images/my_habit_daily_logo_1785647006620.jpg"
              alt="Logo"
              className="w-full h-full object-cover rounded-[10px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-tight">
              My Habit Daily
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">
              {activeTab === 'today' && "Today's Routine"}
              {activeTab === 'habits' && 'Manage Habits'}
              {activeTab === 'calendar' && 'Habit Calendar'}
              {activeTab === 'analytics' && 'Progress Statistics'}
              {activeTab === 'profile' && 'User Settings'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Streak pill button */}
          <button
            onClick={onOpenAchievements}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold hover:scale-105 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streakCount} Day Streak</span>
          </button>

          {/* Theme switch */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {userProfile.themeMode === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Profile Avatar button */}
          <button
            onClick={() => onTabChange('profile')}
            className={`w-9 h-9 rounded-full p-0.5 border-2 transition-all overflow-hidden ${
              activeTab === 'profile'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'habits', label: 'Habits', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 transition-colors">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-emerald-100/80 dark:bg-emerald-950/60 rounded-2xl -z-10 animate-fade-in" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
