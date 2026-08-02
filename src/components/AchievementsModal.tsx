import React from 'react';
import { Achievement } from '../types';
import { X, Award, Zap, Flame, Droplets, CheckCircle2, Trophy, Lock } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  Award,
  Zap,
  Flame,
  Droplets,
  CheckCircle2,
  Trophy,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 dark:border-slate-800 p-6 space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
              Habit Badges & Trophies
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map(ach => {
            const IconComponent = ICON_COMPONENTS[ach.icon] || Award;
            const percent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-850 dark:to-amber-950/30 border-amber-200 dark:border-amber-900/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      ach.unlocked ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {ach.unlocked ? <IconComponent className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      {ach.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {ach.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {ach.description}
                    </p>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>{ach.unlocked ? 'Unlocked!' : 'Progress'}</span>
                        <span>{ach.progress} / {ach.maxProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
