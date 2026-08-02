import React, { useState } from 'react';
import { Habit, HabitLog, UserProfile } from '../types';
import { calculateHabitStreak } from '../services/storageService';
import { exportHabitsToCSV, exportHabitsToPDF } from '../services/exportService';
import { getTranslation, Language } from '../services/i18nService';
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
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  Trophy, 
  Award, 
  CheckCircle2, 
  Target, 
  FileText, 
  Download, 
  Printer 
} from 'lucide-react';

interface AnalyticsViewProps {
  habits: Habit[];
  userProfile: UserProfile;
  language?: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits, userProfile, language = 'en' }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const activeHabits = habits.filter(h => !h.archived);

  // Timeframe length configuration
  const daysCount = timeframe === 'daily' ? 7 : timeframe === 'weekly' ? 14 : 30;

  // 1. Calculate completion stats based on timeframe
  const chartData = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((daysCount - 1) - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLabel = daysCount <= 7 
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : `${d.getMonth() + 1}/${d.getDate()}`;

    let count = 0;
    activeHabits.forEach(h => {
      const log = h.logs[dStr];
      if (log?.completed || (log?.count || 0) >= h.targetValue) count++;
    });

    const percent = activeHabits.length > 0 ? Math.round((count / activeHabits.length) * 100) : 0;
    return { day: dayLabel, completed: count, percent, date: dStr };
  });

  // 2. Category distribution
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
    const { bestStreak } = calculateHabitStreak(h);
    if (bestStreak > maxStreakAcrossHabits) maxStreakAcrossHabits = bestStreak;
  });

  const averagePercent = Math.round(
    chartData.reduce((acc, curr) => acc + curr.percent, 0) / (chartData.length || 1)
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Title & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {getTranslation('progressAnalytics', language)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {getTranslation('analyticsSubtitle', language)}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportHabitsToCSV(habits)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{getTranslation('exportCsv', language)}</span>
          </button>

          <button
            onClick={() => exportHabitsToPDF(habits, userProfile)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{getTranslation('exportPdf', language)}</span>
          </button>
        </div>
      </div>

      {/* Timeframe selector tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800 flex items-center gap-1 w-fit">
        <span className="text-xs font-bold text-slate-400 px-3">{getTranslation('timeframe', language)}:</span>
        <button
          onClick={() => setTimeframe('daily')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'daily'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {getTranslation('daily', language)} (7D)
        </button>
        <button
          onClick={() => setTimeframe('weekly')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'weekly'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {getTranslation('weekly', language)} (14D)
        </button>
        <button
          onClick={() => setTimeframe('monthly')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            timeframe === 'monthly'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {getTranslation('monthly', language)} (30D)
        </button>
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
          <span className="text-[11px] font-medium text-slate-500">{getTranslation('totalFinished', language)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 w-fit mb-2">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {maxStreakAcrossHabits} Days
          </span>
          <span className="text-[11px] font-medium text-slate-500">{getTranslation('bestStreak', language)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 w-fit mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {averagePercent}%
          </span>
          <span className="text-[11px] font-medium text-slate-500">{getTranslation('consistency', language)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-fit mb-2">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {activeHabits.length}
          </span>
          <span className="text-[11px] font-medium text-slate-500">{getTranslation('activeRoutines', language)}</span>
        </div>
      </div>

      {/* Completion Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
          {timeframe} Habit Completion Count
        </h3>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consistency Trend Line */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Completion Rate (%) Performance Trend
        </h3>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Line type="monotone" dataKey="percent" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
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
