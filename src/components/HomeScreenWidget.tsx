import React from 'react';
import { Habit } from '../types';
import { getTranslation, Language } from '../services/i18nService';
import { X, CheckCircle2, Flame, Sparkles, Smartphone, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HomeScreenWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onUpdateLog: (habitId: string, date: string, count: number) => void;
  language?: Language;
}

export const HomeScreenWidget: React.FC<HomeScreenWidgetProps> = ({
  isOpen,
  onClose,
  habits,
  onUpdateLog,
  language = 'en',
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeHabits = habits.filter(h => !h.archived);

  const completedCount = activeHabits.filter(h => {
    const log = h.logs[todayStr];
    return log?.completed || (log?.count || 0) >= h.targetValue;
  }).length;

  const totalCount = activeHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleHabit = (habit: Habit) => {
    const log = habit.logs[todayStr] || { date: todayStr, count: 0, completed: false };
    const isCompleted = log.completed || log.count >= habit.targetValue;
    const newCount = isCompleted ? 0 : habit.targetValue;
    onUpdateLog(habit.id, todayStr, newCount);

    if (!isCompleted) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold font-display">{getTranslation('widgetTitle', language)}</h3>
              <span className="text-[10px] text-slate-400 block">{getTranslation('widgetSubtitle', language)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Android Material You 4x2 Widget Preview Box */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-5 rounded-3xl border-2 border-emerald-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-display">
                {progressPercent}%
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Daily Habit Target</span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  {completedCount} of {totalCount} {getTranslation('habitsCompleted', language)}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Material You Widget
            </span>
          </div>

          {/* Quick habit toggle list inside widget */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activeHabits.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No active habits available</p>
            ) : (
              activeHabits.map(habit => {
                const log = habit.logs[todayStr];
                const isCompleted = log?.completed || (log?.count || 0) >= habit.targetValue;

                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-900/40 border-emerald-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-500 bg-transparent'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isCompleted ? 'line-through text-slate-300' : 'text-white'}`}>
                          {habit.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log?.count || 0} / {habit.targetValue} {habit.unit}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-900/80 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {isCompleted ? 'Done' : 'Tap to Mark'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <span>{getTranslation('widgetPinned', language)}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
          >
            Close Widget
          </button>
        </div>
      </div>
    </div>
  );
};
