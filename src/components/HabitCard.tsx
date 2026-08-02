import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import { calculateHabitStreak } from '../services/storageService';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Plus, 
  Flame, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Bell, 
  BellOff, 
  Droplets, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Moon, 
  Heart, 
  Target, 
  Award, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string; // YYYY-MM-DD
  onUpdateLog: (habitId: string, date: string, count: number, notes?: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onToggleReminder?: (habitId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Droplets,
  Sparkles,
  BookOpen,
  Activity,
  Moon,
  Heart,
  Target,
  Award,
  CheckCircle2,
};

const COLOR_STYLES: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-500', bar: 'bg-emerald-500' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-400', ring: 'ring-teal-500', bar: 'bg-teal-500' },
  green: { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-400', ring: 'ring-green-500', bar: 'bg-green-500' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', ring: 'ring-indigo-500', bar: 'bg-indigo-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-500', bar: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', ring: 'ring-rose-500', bar: 'bg-rose-500' },
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
  onUpdateLog,
  onEdit,
  onDelete,
  onToggleReminder,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const log: HabitLog = habit.logs[selectedDate] || { date: selectedDate, count: 0, completed: false };
  const currentCount = log.count || 0;
  const isCompleted = log.completed || currentCount >= habit.targetValue;
  const progressPercent = Math.min(100, Math.round((currentCount / habit.targetValue) * 100));

  const streakInfo = calculateHabitStreak(habit);
  const IconComponent = ICON_MAP[habit.icon] || CheckCircle2;
  const colorStyle = COLOR_STYLES[habit.color] || COLOR_STYLES.emerald;

  const handleIncrement = (amount: number = 1) => {
    const newCount = Math.min(habit.targetValue * 2, currentCount + amount);
    const becameCompleted = newCount >= habit.targetValue && !log.completed;

    if (becameCompleted) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#14b8a6', '#f59e0b'],
      });
    }

    onUpdateLog(habit.id, selectedDate, newCount);
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      onUpdateLog(habit.id, selectedDate, 0);
    } else {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#fef08a'],
      });
      onUpdateLog(habit.id, selectedDate, habit.targetValue);
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Habit Icon & Info */}
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-2xl ${colorStyle.bg} ${colorStyle.text} shrink-0 shadow-inner`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {habit.title}
              </h3>
              {habit.reminderTime && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  {habit.reminderTime}
                </span>
              )}
            </div>

            {habit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorStyle.bg} ${colorStyle.text}`}>
                {habit.category}
              </span>
              {streakInfo.currentStreak > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {streakInfo.currentStreak}d streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 text-xs">
              <button
                onClick={() => { setShowMenu(false); onEdit(habit); }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                Edit Habit
              </button>
              {onToggleReminder && (
                <button
                  onClick={() => { setShowMenu(false); onToggleReminder(habit.id); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  {habit.reminderEnabled ? <BellOff className="w-3.5 h-3.5 text-slate-400" /> : <Bell className="w-3.5 h-3.5 text-emerald-500" />}
                  {habit.reminderEnabled ? 'Mute Alert' : 'Enable Alert'}
                </button>
              )}
              <button
                onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Quick Actions */}
      <div className="space-y-2 mt-4">
        <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 font-medium">
          <span>
            {currentCount} / {habit.targetValue} {habit.unit}
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {progressPercent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyle.bar} transition-all duration-500 rounded-full`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          {habit.targetValue > 1 ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleIncrement(1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                +1 {habit.unit}
              </button>
              <button
                onClick={() => handleIncrement(Math.min(5, habit.targetValue))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                +Step
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Daily Goal</span>
          )}

          {/* Big completion checkmark button */}
          <button
            onClick={handleToggleComplete}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-750'
            }`}
          >
            <Check className={`w-4 h-4 ${isCompleted ? 'stroke-[3]' : ''}`} />
            <span>{isCompleted ? 'Done!' : 'Mark Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
