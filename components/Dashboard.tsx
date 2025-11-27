
import React from 'react';
import { Shift, User } from '../types';
import { Sparkles, History, Wallet } from 'lucide-react';
import { TOKEN_RATES } from '../constants';

interface DashboardProps {
  user: User;
  shifts: Shift[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, shifts }) => {
  const completedShifts = shifts.filter(s => s.status === 'completed').sort((a, b) => b.startTime - a.startTime);
  
  const totalTokens = completedShifts.reduce((sum, s) => sum + s.totalTokens, 0);
  
  // Calculate USD based on specific platform rates
  const totalUsd = completedShifts.reduce((acc, shift) => {
    const shiftUsd = shift.platforms.reduce((pAcc, platform) => {
      const rate = TOKEN_RATES[platform.name] || 0.05;
      return pAcc + (platform.tokensEarned * rate);
    }, 0);
    return acc + shiftUsd;
  }, 0);

  const estimatedUsd = totalUsd.toFixed(2);
  
  // Last shift AI message
  const lastShift = completedShifts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Привет, {user.firstName} 👋</h1>
          <p className="text-zinc-400 text-sm">Удачной смены!</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          {user.firstName[0]}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
            <Wallet size={14} />
            <span>Баланс</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalTokens}</div>
          <div className="text-xs text-zinc-500">~${estimatedUsd}</div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-xs mb-2">
            <History size={14} />
            <span>Смен</span>
          </div>
          <div className="text-2xl font-bold text-white">{completedShifts.length}</div>
          <div className="text-xs text-zinc-500">в этом месяце</div>
        </div>
      </div>

      {/* AI Feedback Card */}
      {lastShift && lastShift.aiFeedback && (
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 rounded-2xl border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold mb-2">
            <Sparkles size={16} />
            <span>PRIMA AI Анализ</span>
          </div>
          <p className="text-zinc-200 text-sm leading-relaxed">
            "{lastShift.aiFeedback}"
          </p>
        </div>
      )}

      {/* Recent History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">История смен</h3>
        <div className="space-y-3">
          {completedShifts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              История пуста. Начните свою первую смену!
            </div>
          ) : (
            completedShifts.map((shift) => (
              <div key={shift.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">
                    {new Date(shift.startTime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {shift.platforms.filter(p => p.isActive).map(p => p.name).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold">{shift.totalTokens} tk</div>
                  <div className="text-xs text-zinc-600">
                    {shift.endTime ? ((shift.endTime - shift.startTime) / (1000 * 60 * 60)).toFixed(1) + ' ч' : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
