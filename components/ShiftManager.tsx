import React, { useState, useEffect } from 'react';
import { PlatformName, Shift, PlatformMetric, User } from '../types';
import { DEFAULT_PLATFORMS, PLATFORM_CONFIG } from '../constants';
import { Play, Square, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { analyzeShift } from '../services/aiService';

interface ShiftManagerProps {
  user: User;
  activeShift: Shift | null;
  onStartShift: (platforms: PlatformName[]) => void;
  onEndShift: (completedShift: Shift) => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({ user, activeShift, onStartShift, onEndShift }) => {
  // Local state for the "Start Shift" phase
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformName>>(new Set());
  
  // Local state for the "End Shift" phase
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // FIX: Use scoped interval variable instead of NodeJS.Timeout to avoid namespace error
    if (activeShift) {
      // Calculate initial elapsed time
      setElapsedTime(Date.now() - activeShift.startTime);
      
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - activeShift.startTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeShift]);

  const togglePlatform = (name: PlatformName) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedPlatforms(newSet);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (selectedPlatforms.size === 0) return;
    onStartShift(Array.from(selectedPlatforms));
  };

  const handleEndSubmit = async () => {
    if (!activeShift) return;
    setIsSubmitting(true);

    const updatedPlatforms: PlatformMetric[] = activeShift.platforms.map(p => ({
      ...p,
      tokensEarned: p.isActive ? parseInt(tokenInputs[p.name] || '0', 10) : 0
    }));

    const totalTokens = updatedPlatforms.reduce((sum, p) => sum + p.tokensEarned, 0);

    const completedShift: Shift = {
      ...activeShift,
      endTime: Date.now(),
      status: 'completed',
      platforms: updatedPlatforms,
      totalTokens,
    };

    // Call AI Service
    const aiFeedback = await analyzeShift(completedShift);
    completedShift.aiFeedback = aiFeedback;

    setIsSubmitting(false);
    onEndShift(completedShift);
    setTokenInputs({});
  };

  // --- RENDER: ACTIVE SHIFT ---
  if (activeShift) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center py-10 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none" />
          <div className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Время в смене</div>
          <div className="text-5xl font-mono font-bold text-white tracking-wider tabular-nums">
            {formatTime(elapsedTime)}
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-center px-4">
            {activeShift.platforms.filter(p => p.isActive).map(p => (
              <span key={p.name} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-700">
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Завершение смены</h3>
          <p className="text-zinc-400 text-sm mb-6">Введите заработанные токены для каждой площадки:</p>
          
          <div className="space-y-4">
            {activeShift.platforms.filter(p => p.isActive).map(p => {
               const platformStyle = PLATFORM_CONFIG[p.name];
               return (
                <div key={p.name}>
                  <label className={`block text-xs font-medium mb-1 ${platformStyle?.color}`}>{p.name}</label>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="0"
                    value={tokenInputs[p.name] || ''}
                    onChange={(e) => setTokenInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleEndSubmit}
            disabled={isSubmitting}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Square size={20} fill="currentColor" />}
            Завершить смену
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: SETUP SHIFT ---
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-xl font-bold text-white mb-2">Начать работу</h2>
        <p className="text-zinc-400 text-sm mb-6">Выберите активные площадки на сегодня</p>

        <div className="grid grid-cols-1 gap-3">
          {DEFAULT_PLATFORMS.map((platformName) => {
            const isSelected = selectedPlatforms.has(platformName);
            const config = PLATFORM_CONFIG[platformName];
            return (
              <button
                key={platformName}
                onClick={() => togglePlatform(platformName)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? `bg-[#1e293b] ${config.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <span className={`font-medium ${isSelected ? config.color : 'text-zinc-400'}`}>
                  {platformName}
                </span>
                {isSelected && <CheckCircle2 size={20} className={config.color} />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={selectedPlatforms.size === 0}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          selectedPlatforms.size > 0
            ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20 active:scale-95'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        <Play fill="currentColor" />
        Открыть смену
      </button>
    </div>
  );
};