import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children, isActive }) => {
  if (!isActive) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-900 py-4 px-2 flex justify-center items-center overflow-x-hidden">
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Physical Ear Speaker & Camera Pill Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 border border-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-8 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Screen Content Container */}
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[36px] overflow-y-auto overflow-x-hidden relative flex flex-col">
          {children}
        </div>

        {/* Android Gesture Home Bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 w-32 h-1 bg-slate-400/50 rounded-full" />
      </div>
    </div>
  );
};
