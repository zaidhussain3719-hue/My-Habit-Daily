import React from 'react';
import { Habit, HabitLog } from '../types';
import { calculateHabitStreak } from '../services/storageService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, Flame, Trophy, Award, CheckCircle2, Target } from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits }) => {
  const activeHabits = habits.filter(h => !h.archived);

  // 1. Calculate Last 7 Days completion stats
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let count = 0;
    activeHabits.forEach(h => {
      const log = h.logs[dStr];
      if (log?.completed || (log?.count || 0) >= h.targetValue) count++;
    });

    const percent = activeHabits.length > 0 ? Math.round((count / activeHabits.length) * 100) : 0;
    return { day: dayLabel, completed: count, percent, date: dStr };
  });

  // 2. Calculate Last 14 Days trend line
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;

    let count = 0;
    activeHabits.forEach(h => {
      const log = h.logs[dStr];
      if (log?.completed || (log?.count || 0) >= h.targetValue) count++;
    });

    const rate = activeHabits.length > 0 ? Math.round((count / activeHabits.length) * 100) : 0;
    return { date: dayLabel, rate };
  });

  // 3. Category distribution
  const categoryCounts: Record<string, number> = {};
  activeHabits.forEach(h => {
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  const CATEGORY_COLORS = ['#10b981', '#14b8a6', '#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6'];

  // Overall calculations
  let totalCompletions = 0;
  let maxStreakAcrossHabits = 0;

  activeHabits.forEach(h => {
    Object.values(h.logs).forEach((l: HabitLog) => {
      if (l.completed) totalCompletions++;
    });
    const { currentStreak, bestStreak } = calculateHabitStreak(h);
    if (bestStreak > maxStreakAcrossHabits) maxStreakAcrossHabits = bestStreak;
  });

  const averageWeeklyPercent = Math.round(
    weeklyData.reduce((acc, curr) => acc + curr.percent, 0) / 7
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Progress & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Comprehensive statistics, streak analysis and habit performance
        </p>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 w-fit mb-2">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {totalCompletions}
          </span>
          <span className="text-[11px] font-medium text-slate-500">Total Habits Finished</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit mb-2">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {maxStreakAcrossHabits} Days
          </span>
          <span className="text-[11px] font-medium text-slate-500">Best Streak Record</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 w-fit mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {averageWeeklyPercent}%
          </span>
          <span className="text-[11px] font-medium text-slate-500">7-Day Consistency</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-2">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {activeHabits.length}
          </span>
          <span className="text-[11px] font-medium text-slate-500">Active Routines</span>
        </div>
      </div>

      {/* Weekly Completion Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          7-Day Habit Completion Count
        </h3>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 14-Day Consistency Trend Line */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          14-Day Completion Rate (%) Trend
        </h3>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Habits Category Distribution
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col justify-center">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{cat.value} habit(s)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
