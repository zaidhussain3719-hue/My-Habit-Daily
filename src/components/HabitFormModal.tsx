import React, { useState, useEffect } from 'react';
import { Habit, CategoryType, FrequencyType } from '../types';
import { 
  X, 
  Droplets, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Moon, 
  Heart, 
  Target, 
  Award, 
  CheckCircle2,
  Clock,
  Bell,
  Plus,
  Trash2
} from 'lucide-react';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

const CATEGORIES: CategoryType[] = ['Health', 'Fitness', 'Productivity', 'Mindfulness', 'Learning', 'Finance', 'Custom'];

const ICONS = [
  { id: 'Droplets', label: 'Water / Water' },
  { id: 'Sparkles', label: 'Mind / Zen' },
  { id: 'BookOpen', label: 'Read / Book' },
  { id: 'Activity', label: 'Fitness / Sport' },
  { id: 'Moon', label: 'Sleep / Rest' },
  { id: 'Heart', label: 'Health / Care' },
  { id: 'Target', label: 'Goal / Target' },
  { id: 'Award', label: 'Badge / Trophy' },
  { id: 'CheckCircle2', label: 'Task / Check' },
];

const COLORS = [
  { id: 'emerald', bg: 'bg-emerald-500' },
  { id: 'teal', bg: 'bg-teal-500' },
  { id: 'green', bg: 'bg-green-500' },
  { id: 'indigo', bg: 'bg-indigo-500' },
  { id: 'amber', bg: 'bg-amber-500' },
  { id: 'rose', bg: 'bg-rose-500' },
];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('Health');
  const [icon, setIcon] = useState('CheckCircle2');
  const [color, setColor] = useState('emerald');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('times');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category);
      setIcon(initialHabit.icon);
      setColor(initialHabit.color);
      setFrequency(initialHabit.frequency);
      setTargetValue(initialHabit.targetValue);
      setUnit(initialHabit.unit);
      const initialTimes = initialHabit.reminderTimes && initialHabit.reminderTimes.length > 0
        ? initialHabit.reminderTimes
        : [initialHabit.reminderTime || '08:00'];
      setReminderTimes(initialTimes);
      setReminderTime(initialTimes[0] || '08:00');
      setReminderEnabled(initialHabit.reminderEnabled ?? true);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Health');
      setIcon('Droplets');
      setColor('emerald');
      setFrequency('daily');
      setTargetValue(8);
      setUnit('glasses');
      setReminderTimes(['08:00']);
      setReminderTime('08:00');
      setReminderEnabled(true);
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleAddReminderTime = () => {
    setReminderTimes([...reminderTimes, '12:00']);
  };

  const handleRemoveReminderTime = (index: number) => {
    if (reminderTimes.length <= 1) return;
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleUpdateReminderTime = (index: number, value: string) => {
    const updated = [...reminderTimes];
    updated[index] = value;
    setReminderTimes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      icon,
      color,
      frequency,
      targetValue: Number(targetValue) || 1,
      unit: unit.trim() || 'times',
      reminderTime: reminderTimes[0] || '08:00',
      reminderTimes: reminderTimes,
      reminderEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 p-6 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            {initialHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Drink 8 Glasses of Water"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Motivation (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. For hydration and glowing energy"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Goal Quantity
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                required
                value={targetValue}
                onChange={e => setTargetValue(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit (e.g. glasses, mins)
              </label>
              <input
                type="text"
                placeholder="glasses, mins, times"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Choose Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setIcon(i.id)}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    icon === i.id
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {i.id === 'Droplets' && <Droplets className="w-5 h-5" />}
                  {i.id === 'Sparkles' && <Sparkles className="w-5 h-5" />}
                  {i.id === 'BookOpen' && <BookOpen className="w-5 h-5" />}
                  {i.id === 'Activity' && <Activity className="w-5 h-5" />}
                  {i.id === 'Moon' && <Moon className="w-5 h-5" />}
                  {i.id === 'Heart' && <Heart className="w-5 h-5" />}
                  {i.id === 'Target' && <Target className="w-5 h-5" />}
                  {i.id === 'Award' && <Award className="w-5 h-5" />}
                  {i.id === 'CheckCircle2' && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Accent Theme Color
            </label>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                    color === c.id ? 'ring-4 ring-slate-400 dark:ring-slate-600 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Smart Reminder Setup */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Daily Reminder Alerts</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Custom daily push notifications</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  reminderEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    reminderEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Scheduled Times (Multiple Reminders)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddReminderTime}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Add Time Slot
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {reminderTimes.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="time"
                        value={t}
                        onChange={e => handleUpdateReminderTime(idx, e.target.value)}
                        className="bg-transparent text-xs font-mono text-slate-900 dark:text-white focus:outline-none flex-1"
                      />
                      {reminderTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReminderTime(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
            >
              {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
