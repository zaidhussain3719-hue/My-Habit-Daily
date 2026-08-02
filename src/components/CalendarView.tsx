import React, { useState } from 'react';
import { Habit } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Flame } from 'lucide-react';

interface CalendarViewProps {
  habits: Habit[];
  onUpdateLog: (habitId: string, date: string, count: number, notes?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ habits, onUpdateLog }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const activeHabits = habits.filter(h => !h.archived);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Helper to calculate daily completion percentage for heatmap shade
  const getDayCompletionPercent = (dateStr: string): number => {
    if (activeHabits.length === 0) return 0;
    let completed = 0;
    activeHabits.forEach(h => {
      const log = h.logs[dateStr];
      if (log?.completed || (log?.count || 0) >= h.targetValue) completed++;
    });
    return Math.round((completed / activeHabits.length) * 100);
  };

  const getHeatmapBg = (percent: number, isSelected: boolean) => {
    if (isSelected) return 'ring-2 ring-emerald-500 bg-emerald-600 text-white font-bold scale-105';
    if (percent === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    if (percent < 40) return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-semibold';
    if (percent < 80) return 'bg-emerald-300 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 font-bold';
    return 'bg-emerald-500 dark:bg-emerald-600 text-white font-extrabold shadow-sm';
  };

  const selectedDateHabits = activeHabits.map(h => {
    const log = h.logs[selectedDate] || { date: selectedDate, count: 0, completed: false };
    return { habit: h, log };
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Month Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
              {monthName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Blank offset slots */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty_${i}`} className="h-10 sm:h-12" />
          ))}

          {/* Day cells */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const percent = getDayCompletionPercent(dateStr);
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center relative transition-all ${getHeatmapBg(
                  percent,
                  isSelected
                )}`}
              >
                <span className="text-xs sm:text-sm">{dayNum}</span>
                {percent > 0 && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-300 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Heatmap legend */}
        <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-950" />
          <div className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-500" />
          <span>100% Complete</span>
        </div>
      </div>

      {/* Selected Day Habit Detail Drawer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            History Log for {selectedDate}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
            {getDayCompletionPercent(selectedDate)}% Score
          </span>
        </div>

        <div className="space-y-3">
          {selectedDateHabits.map(({ habit, log }) => {
            const completed = log.completed || log.count >= habit.targetValue;
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {habit.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Logged: {log.count} / {habit.targetValue} {habit.unit}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newCount = completed ? 0 : habit.targetValue;
                    onUpdateLog(habit.id, selectedDate, newCount);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    completed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                  }`}
                >
                  {completed ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
