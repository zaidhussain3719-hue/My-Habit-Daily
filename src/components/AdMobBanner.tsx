import React, { useState } from 'react';
import { X, Tv, Sparkles, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdMobBannerProps {
  onClose: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ onClose }) => {
  const [showRewardedModal, setShowRewardedModal] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [adWatching, setAdWatching] = useState(false);

  const handleWatchRewardedAd = () => {
    setAdWatching(true);
    setTimeout(() => {
      setAdWatching(false);
      setRewardClaimed(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
    }, 2500);
  };

  return (
    <>
      <div className="fixed bottom-12 left-0 right-0 z-30 flex justify-center px-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700/80 px-3 py-1.5 flex items-center gap-3 max-w-sm w-full text-xs select-none">
          <div className="bg-emerald-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white tracking-widest shrink-0">
            AdMob Test
          </div>

          <div className="flex-1 truncate">
            <span className="font-semibold block text-slate-200">Google AdMob Banner</span>
            <span className="text-[10px] text-slate-400">Sample 320x50 Android Ad</span>
          </div>

          <button
            onClick={() => setShowRewardedModal(true)}
            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] shrink-0"
          >
            Rewarded Ad
          </button>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white shrink-0"
            title="Hide AdMob Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rewarded Video Ad Simulator Modal */}
      {showRewardedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Tv className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold">AdMob Rewarded Video</h3>
            <p className="text-xs text-slate-400">
              Watch a simulated 3-second test ad to claim 50 Habit XP bonus!
            </p>

            {adWatching ? (
              <div className="py-6 space-y-2">
                <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs font-mono text-amber-300">Playing Ad Video (0:03)...</span>
              </div>
            ) : rewardClaimed ? (
              <div className="py-4 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <span className="text-sm font-bold text-amber-300 block">Reward Claimed! +50 XP</span>
                <button
                  onClick={() => setShowRewardedModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
                >
                  Close Ad
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setShowRewardedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Skip
                </button>
                <button
                  onClick={handleWatchRewardedAd}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  Watch Video Ad
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
