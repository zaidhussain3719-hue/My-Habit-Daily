import React, { useState } from 'react';
import { Habit, CategoryType } from '../types';
import { Search, Plus, Archive, Edit3, Trash2, Bell, Sparkles, Filter } from 'lucide-react';

interface HabitsViewProps {
  habits: Habit[];
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleArchive: (habitId: string) => void;
}

const CATEGORIES: ('All' | CategoryType)[] = ['All', 'Health', 'Fitness', 'Productivity', 'Mindfulness', 'Learning', 'Finance'];

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onOpenCreateModal,
  onEditHabit,
  onDeleteHabit,
  onToggleArchive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryType>('All');
  const [showArchived, setShowArchived] = useState(false);

  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) || (h.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesArchived = showArchived ? h.archived : !h.archived;
    return matchesSearch && matchesCat && matchesArchived;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
            Habits Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, categorize and adjust your personal habit routines
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-2xl border transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active vs Archived Toggle */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {showArchived ? 'Archived Habits' : 'Active Habits'} ({filteredHabits.length})
        </span>

        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{showArchived ? 'View Active' : 'View Archived'}</span>
        </button>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
          <Filter className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching habits found</h4>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map(habit => (
            <div
              key={habit.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {habit.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Goal: {habit.targetValue} {habit.unit}/day
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleArchive(habit.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      title={habit.archived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {habit.title}
                </h3>
                {habit.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {habit.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                <span className="capitalize">Frequency: {habit.frequency}</span>
                {habit.reminderTime && (
                  <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                    <Bell className="w-3 h-3" />
                    {habit.reminderTime}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
