import React, { useState } from 'react';
import { UserProfile, Habit } from '../types';
import { auth, isFirebaseAvailable, logTelemetryEvent } from '../services/firebaseService';
import { requestNotificationPermission } from '../services/notificationService';
import { exportHabitsToCSV, exportHabitsToPDF } from '../services/exportService';
import { getTranslation, Language } from '../services/i18nService';
import { signOut } from 'firebase/auth';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  LogOut, 
  Trophy, 
  Download, 
  Upload, 
  ShieldCheck, 
  Tv, 
  Sparkles, 
  Edit2, 
  Save, 
  Bell, 
  BellRing,
  Volume2, 
  VolumeX,
  Smartphone,
  BatteryCharging,
  CheckCircle2,
  Sliders,
  Globe,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

interface ProfileViewProps {
  userProfile: UserProfile;
  habits: Habit[];
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenAchievements: () => void;
  onSignOut: () => void;
  onImportHabits: (imported: Habit[]) => void;
  onToggleAdMob: () => void;
  onToggleFrame: () => void;
  isFrameActive: boolean;
  language?: Language;
}

const AVATAR_OPTIONS = [
  '/src/assets/images/user_profile_avatar_1785647019010.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  habits,
  onUpdateProfile,
  onOpenAchievements,
  onSignOut,
  onImportHabits,
  onToggleAdMob,
  onToggleFrame,
  isFrameActive,
  language = 'en',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.photoUrl);
  const [dailyTarget, setDailyTarget] = useState(userProfile.dailyTargetPercent);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(
    typeof Notification !== 'undefined' ? Notification.permission === 'granted' : false
  );

  const handleGrantPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  };

  const handleToggleGlobalNotifications = () => {
    onUpdateProfile({
      ...userProfile,
      notificationsEnabled: !userProfile.notificationsEnabled,
    });
  };

  const handleToggleBatteryOpt = () => {
    onUpdateProfile({
      ...userProfile,
      batteryOptimizationIgnored: !userProfile.batteryOptimizationIgnored,
    });
  };

  const handleLanguageChange = (lang: Language) => {
    onUpdateProfile({
      ...userProfile,
      language: lang,
    });
  };

  const handleToggleChannel = (channel: 'dailyReminders' | 'eveningWrapup' | 'motivationBoost') => {
    const currentConfig = userProfile.notificationChannelConfig || {
      dailyReminders: true,
      eveningWrapup: true,
      motivationBoost: true,
    };
    onUpdateProfile({
      ...userProfile,
      notificationChannelConfig: {
        ...currentConfig,
        [channel]: !currentConfig[channel],
      },
    });
  };

  const channelConfig = userProfile.notificationChannelConfig || {
    dailyReminders: true,
    eveningWrapup: true,
    motivationBoost: true,
  };

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      name,
      bio,
      photoUrl: selectedAvatar,
      dailyTargetPercent: dailyTarget,
    });
    setIsEditing(false);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MyHabitDaily_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logTelemetryEvent('export_user_data', { habitCount: habits.length });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportHabits(parsed);
          alert('Successfully imported habits data backup!');
          logTelemetryEvent('import_user_data_success');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <img
              src={selectedAvatar}
              alt={userProfile.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md"
              referrerPolicy="no-referrer"
            />
            {isEditing && (
              <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full text-xs shadow">
                <Edit2 className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            {isEditing ? (
              <div className="space-y-2 max-w-xs mx-auto sm:mx-0">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Short bio"
                  className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {userProfile.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    {userProfile.isGuest ? 'Guest User' : 'Firebase Sync Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{userProfile.email}</p>
                {userProfile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                    "{userProfile.bio}"
                  </p>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Avatar Picker when editing */}
        {isEditing && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Choose Avatar:</span>
            <div className="flex gap-3">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === url ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trophies & Achievements Quick Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-display">Habit Achievements</h3>
            <p className="text-xs text-amber-100">Unlock gamified badges & streak rewards</p>
          </div>
        </div>

        <button
          onClick={onOpenAchievements}
          className="px-4 py-2 bg-white text-amber-700 font-extrabold text-xs rounded-xl shadow hover:bg-amber-50"
        >
          View Badges
        </button>
      </div>

      {/* Language & Regional Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{getTranslation('languageSetting', language)}</span>
              <span className="text-[11px] text-slate-500">Switch app display language</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                language === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {getTranslation('appPreferences', language)}
        </h3>

        <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Global Notifications ON/OFF Switch */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BellRing className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Global Notification System</span>
                <span className="text-[11px] text-slate-500">Enable or disable all app reminders</span>
              </div>
            </div>

            <button
              onClick={handleToggleGlobalNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                userProfile.notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  userProfile.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Android 13+ / Web Notification Runtime Permission status */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Android 13+ Permission</span>
                <span className="text-[11px] text-slate-500">
                  {permissionGranted ? 'Push notification permission granted' : 'Permission required for push alerts'}
                </span>
              </div>
            </div>

            <button
              onClick={handleGrantPermission}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                permissionGranted
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-emerald-600 text-white shadow'
              }`}
            >
              {permissionGranted ? 'Granted' : 'Request Access'}
            </button>
          </div>

          {/* Material 3 Notification Channels */}
          <div className="pt-3 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Material 3 Notification Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleToggleChannel('dailyReminders')}
                className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                  channelConfig.dailyReminders
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex justify-between items-center">
                  <span>Daily Reminders</span>
                  {channelConfig.dailyReminders && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">High Priority channel</span>
              </button>

              <button
                onClick={() => handleToggleChannel('eveningWrapup')}
                className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                  channelConfig.eveningWrapup
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex justify-between items-center">
                  <span>Evening Wrap-up</span>
                  {channelConfig.eveningWrapup && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">20:00 incomplete habit check</span>
              </button>

              <button
                onClick={() => handleToggleChannel('motivationBoost')}
                className={`p-2.5 rounded-2xl border text-left text-xs transition-all ${
                  channelConfig.motivationBoost
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold flex justify-between items-center">
                  <span>Motivation Boost</span>
                  {channelConfig.motivationBoost && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Daily dynamic quote alerts</span>
              </button>
            </div>
          </div>

          {/* Android Battery Optimization Exemption */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Ignore Battery Optimization</span>
                <span className="text-[11px] text-slate-500">Ensure background alerts fire after reboot</span>
              </div>
            </div>

            <button
              onClick={handleToggleBatteryOpt}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userProfile.batteryOptimizationIgnored
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {userProfile.batteryOptimizationIgnored ? 'Unrestricted' : 'Optimized'}
            </button>
          </div>
        </div>
      </div>

      {/* App Preferences & Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
          Display & App Data Tools
        </h3>

        <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Daily Goal Target Slider */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Daily Target Completion Goal</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dailyTarget}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={dailyTarget}
              onChange={e => setDailyTarget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Android Device Bezel Toggle */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{getTranslation('androidFrame', language)}</span>
                <span className="text-[11px] text-slate-500">Preview inside realistic Pixel 8 shell</span>
              </div>
            </div>
            <button
              onClick={onToggleFrame}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                isFrameActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isFrameActive ? 'Frame Enabled' : 'Full Screen'}
            </button>
          </div>

          {/* AdMob Banner toggle */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{getTranslation('adMobTest', language)}</span>
                <span className="text-[11px] text-slate-500">Display 320x50 test banner at bottom</span>
              </div>
            </div>
            <button
              onClick={onToggleAdMob}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                userProfile.adMobEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {userProfile.adMobEnabled ? 'AdMob Active' : 'AdMob Hidden'}
            </button>
          </div>

          {/* Export & Backup Tools */}
          <div className="pt-3 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Data Backup & Export Tools
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                {getTranslation('exportBackup', language)}
              </button>

              <label className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                {getTranslation('restoreBackup', language)}
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={() => exportHabitsToCSV(habits)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                {getTranslation('exportCsvData', language)}
              </button>

              <button
                onClick={() => exportHabitsToPDF(habits, userProfile)}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                {getTranslation('exportPdfData', language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={onSignOut}
        className="w-full py-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span>{getTranslation('signOut', language)}</span>
      </button>
    </div>
  );
};
