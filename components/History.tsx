
import React from 'react';
import { Shift, PlatformName } from '../types';
import { Clock, ArrowRight } from 'lucide-react';
import { PLATFORM_CONFIG, TOKEN_RATES } from '../constants';

interface HistoryProps {
  shifts: Shift[];
}

export const History: React.FC<HistoryProps> = ({ shifts }) => {
  const completedShifts = shifts.filter(s => s.status === 'completed').sort((a, b) => b.startTime - a.startTime);

  const calculateShiftUsd = (shift: Shift) => {
    return shift.platforms.reduce((acc, p) => {
        const rate = TOKEN_RATES[p.name] || 0.05;
        return acc + (p.tokensEarned * rate);
    }, 0);
  };

  return (
    <div className="space-y-4">
      {completedShifts.length === 0 ? (
        <div className="text-center text-zinc-600 py-10 font-bold uppercase">История пуста</div>
      ) : (
        completedShifts.map((shift) => (
          <div key={shift.id} className="bg-[#1b1b1b] rounded-xl p-5 border border-zinc-800 relative overflow-hidden">
            {/* Top Row: Date and Earnings */}
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-2 text-zinc-300">
                  <Clock size={16} className="text-[#FF9900]" />
                  <span className="font-bold text-sm">
                    {new Date(shift.startTime).toLocaleDateString('ru-RU')}
                  </span>
               </div>
               <div className="text-right">
                  <div className="text-[#FF9900] font-black text-lg tracking-tight">$ {calculateShiftUsd(shift).toFixed(2)}</div>
                  <div className="text-xs text-zinc-500 font-bold">{shift.totalTokens} tk</div>
               </div>
            </div>

            {/* Platform Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
               {shift.platforms.filter(p => p.isActive).map(p => (
                 <span key={p.name} className="px-3 py-1 bg-black border border-zinc-700 rounded-md text-xs text-zinc-300 font-bold">
                    {p.name}
                 </span>
               ))}
            </div>

            {/* Time Info */}
            <div className="flex justify-between items-center text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-800">
               <div className="flex items-center gap-1 font-bold">
                 <Clock size={12} />
                 <span>{shift.endTime ? Math.floor((shift.endTime - shift.startTime) / (1000 * 60)) : 0} мин</span>
               </div>
               <div className="font-mono">
                  {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
               </div>
            </div>

            {/* AI Feedback Box */}
            <div className="bg-black rounded-lg p-3 border border-zinc-800">
               <p className="text-xs italic text-zinc-400 font-medium">
                 "{shift.aiFeedback || 'Анализ недоступен'}"
               </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
