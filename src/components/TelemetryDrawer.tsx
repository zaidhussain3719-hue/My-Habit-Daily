import React, { useState, useEffect } from 'react';
import { getTelemetryLogs, testFirestoreConnection } from '../services/firebaseService';
import { AnalyticsEvent } from '../types';
import { X, Activity, RefreshCw, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AnalyticsEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const refreshLogs = async () => {
    setLogs(getTelemetryLogs());
    setConnectionStatus('checking');
    const isOnline = await testFirestoreConnection();
    setConnectionStatus(isOnline ? 'online' : 'offline');
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 text-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-4">
        <div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold font-display">Firebase Telemetry Monitor</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection status banner */}
          <div className="my-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Firestore Sync Engine</span>
            </div>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                connectionStatus === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {connectionStatus === 'checking' ? 'Testing...' : connectionStatus === 'online' ? 'Connected (Firestore)' : 'Offline Local Caching'}
            </span>
          </div>

          {/* Log Stream */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Event Log Stream ({logs.length})
              </span>
              <button onClick={refreshLogs} className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No events logged yet</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-bold">{log.name}</span>
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {JSON.stringify(log.params)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3 text-center">
          Material 3 • Android SDK • Firebase Analytics & Crashlytics Integration
        </div>
      </div>
    </div>
  );
};
