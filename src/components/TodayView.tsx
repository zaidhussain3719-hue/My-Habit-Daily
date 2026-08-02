import React, { useState } from 'react';
import { Habit } from '../types';
import { HabitCard } from './HabitCard';
import { DAILY_QUOTES } from '../data/initialData';
import { getTranslation, Language } from '../services/i18nService';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Quote, 
  BellRing,
  Search,
  Filter,
  RefreshCw,
  Smartphone,
  X
} from 'lucide-react';

interface TodayViewProps {
  habits: Habit[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onUpdateLog: (habitId: string, date: string, count: number, notes?: string) => void;
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onTriggerTestReminder: () => void;
  onOpenWidgetModal: () => void;
  language?: Language;
}

export const TodayView: React.FC<TodayViewProps> = ({
  habits,
  selectedDate,
  onSelectDate,
  onUpdateLog,
  onOpenCreateModal,
  onEditHabit,
  onDeleteHabit,
  onTriggerTestReminder,
  onOpenWidgetModal,
  language = 'en',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'completed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate date carousel items (-3 to +3 days)
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i - 3));
    const dStr = d.toISOString().split('T')[0];
    const isToday = dStr === new Date().toISOString().split('T')[0];
    const dayName = isToday ? getTranslation('today', language) : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr: dStr, dayName, dayNum, isToday };
  });

  const activeHabits = habits.filter(h => !h.archived);

  // Calculate today's completion statistics
  let completedCount = 0;
  activeHabits.forEach(h => {
    const log = h.logs[selectedDate];
    if (log?.completed || (log?.count || 0) >= h.targetValue) {
      completedCount++;
    }
  });

  const totalCount = activeHabits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const currentQuote = DAILY_QUOTES[quoteIndex % DAILY_QUOTES.length];

  // Search & Filter Logic
  const filteredHabits = activeHabits.filter(habit => {
    // 1. Text Search
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      habit.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory = selectedCategory === 'All' || habit.category === selectedCategory;

    // 3. Status Filter
    const log = habit.logs[selectedDate];
    const isCompleted = log?.completed || (log?.count || 0) >= habit.targetValue;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? isCompleted
        : !isCompleted;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Pull to Refresh Bar */}
      <div className="flex justify-center -mt-2 mb-1">
        <button
          onClick={handlePullToRefresh}
          className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[11px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Pull to Refresh'}</span>
        </button>
      </div>

      {/* Horizontal Date Picker Carousel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center gap-1.5 overflow-x-auto">
        {dateOptions.map(item => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <button
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              className={`flex-1 min-w-[50px] py-2 px-1 rounded-2xl flex flex-col items-center transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold tracking-wide">
                {item.dayName}
              </span>
              <span className="text-base font-extrabold mt-0.5">{item.dayNum}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/15">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
              {getTranslation('dailyProgress', language)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display mt-0.5">
              {completedCount} of {totalCount} {getTranslation('habitsCompleted', language)}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-sm">
              {completionPercent >= 100
                ? '🎉 Perfect score! All habits finished for today!'
                : completionPercent >= 50
                ? '🔥 Great momentum! You are over halfway there.'
                : '🌱 Every small step counts. Keep building your routine!'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Widget launcher button */}
            <button
              onClick={onOpenWidgetModal}
              title="Open Android Widget"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>{getTranslation('quickWidget', language)}</span>
            </button>

            {/* Radial percentage badge */}
            <div className="relative w-14 h-14 rounded-full bg-emerald-800/40 border-4 border-emerald-400/40 flex items-center justify-center font-extrabold text-base text-white shrink-0">
              <span>{completionPercent}%</span>
            </div>

            <button
              onClick={onTriggerTestReminder}
              title="Test Push Notification"
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <BellRing className="w-4 h-4 animate-pulse text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={getTranslation('searchPlaceholder', language)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns / pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {['All', 'Health', 'Fitness', 'Productivity', 'Mindfulness', 'Learning', 'Finance'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? getTranslation('allCategories', language) : cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">{getTranslation('allStatus', language)}</option>
            <option value="incomplete">{getTranslation('incomplete', language)}</option>
            <option value="completed">{getTranslation('completed', language)}</option>
          </select>
        </div>
      </div>

      {/* Motivational Quote Card */}
      <div className="bg-emerald-50/70 dark:bg-slate-900/70 rounded-3xl p-4 border border-emerald-100 dark:border-slate-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs sm:text-sm font-medium italic text-slate-700 dark:text-slate-300">
              "{currentQuote.quote}"
            </p>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
              — {currentQuote.author}
            </span>
          </div>
        </div>

        <button
          onClick={() => setQuoteIndex(prev => prev + 1)}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 font-semibold"
        >
          Next Quote
        </button>
      </div>

      {/* Habit List */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {getTranslation('todayHabits', language)} ({filteredHabits.length})
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {activeHabits.length} Active Total
          </span>
        </div>

        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {activeHabits.length === 0 ? getTranslation('noHabitsCreated', language) : getTranslation('noHabitsFound', language)}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
              {activeHabits.length === 0
                ? getTranslation('createFirstHabit', language)
                : 'Try adjusting your search query or category filters.'}
            </p>
            {activeHabits.length === 0 && (
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                + {getTranslation('addHabit', language)}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                selectedDate={selectedDate}
                onUpdateLog={onUpdateLog}
                onEdit={onEditHabit}
                onDelete={onDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Creating Habit */}
      <button
        onClick={onOpenCreateModal}
        className="fixed bottom-20 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-full shadow-2xl shadow-emerald-600/40 flex items-center justify-center gap-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
        <span className="hidden sm:inline">{getTranslation('addHabit', language)}</span>
      </button>
    </div>
  );
};
