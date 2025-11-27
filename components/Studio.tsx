
import React, { useState, useEffect } from 'react';
import { PlatformName, Shift, PlatformMetric, User } from '../types';
import { PLATFORM_CONFIG, DEFAULT_PLATFORMS } from '../constants';
import { Play, Square, Globe, Loader2, Eye, EyeOff, Copy, Check, ArrowLeft, Save } from 'lucide-react';
import { analyzeShift } from '../services/aiService';

interface StudioProps {
  user: User;
  activeShift: Shift | null;
  onStartShift: (platforms: PlatformName[]) => void;
  onEndShift: (completedShift: Shift) => void;
}

export const Studio: React.FC<StudioProps> = ({ user, activeShift, onStartShift, onEndShift }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformName>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // State to toggle between Timer and Token Entry
  
  // Credentials State
  const [credentials, setCredentials] = useState<Record<string, {login: string, password: string}>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load credentials
    const stored = localStorage.getItem('prima_credentials');
    if (stored) {
      try {
        setCredentials(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (activeShift && !isEnding) {
      setElapsedTime(Date.now() - activeShift.startTime);
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - activeShift.startTime);
      }, 1000);
      return () => clearInterval(interval);
    } else if (!activeShift) {
      setIsEnding(false);
      setTokenInputs({});
    }
  }, [activeShift, isEnding]);

  const togglePlatform = (name: PlatformName) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedPlatforms(newSet);
  };

  const togglePasswordVisibility = (platform: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
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

    const aiFeedback = await analyzeShift(completedShift);
    completedShift.aiFeedback = aiFeedback;

    setIsSubmitting(false);
    onEndShift(completedShift);
    setTokenInputs({});
    setIsEnding(false);
  };

  // --- ACTIVE SHIFT VIEW ---
  if (activeShift) {
    // VIEW 1: WORKING PHASE (Timer & Credentials)
    if (!isEnding) {
      return (
        <div className="space-y-6 animate-fade-in pb-20">
          <div className="bg-[#1b1b1b] rounded-xl p-8 text-center relative overflow-hidden border border-zinc-800 shadow-xl">
             {/* Top accent bar */}
             <div className="absolute top-0 left-0 w-full h-1 bg-[#FF9900]"></div>
             <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2 font-bold">Активная смена</p>
             <div className="text-5xl font-mono font-bold text-white mb-6 tabular-nums tracking-wider text-shadow">{formatTime(elapsedTime)}</div>
             
             <div className="flex flex-wrap justify-center gap-2 mb-6">
               {activeShift.platforms.filter(p => p.isActive).map(p => {
                 const config = PLATFORM_CONFIG[p.name];
                 return (
                  <span key={p.name} className={`px-3 py-1.5 rounded-lg text-xs font-bold border bg-opacity-10 ${config.color} ${config.border} flex items-center gap-2`}>
                     <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-black bg-black">
                        {config.initial}
                     </div>
                     {p.name}
                  </span>
                 );
               })}
             </div>
          </div>
  
          {/* Credentials Display for Active Platforms */}
          <div className="bg-[#1b1b1b] rounded-xl border border-zinc-800 p-5">
             <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FF9900] rounded-full"></div>
                Доступы к площадкам
             </h3>
             <div className="space-y-3">
               {activeShift.platforms.filter(p => p.isActive).map(p => {
                  const creds = credentials[p.name];
                  const isVisible = visiblePasswords[p.name];
                  const config = PLATFORM_CONFIG[p.name];
  
                  return (
                     <div key={p.name} className="bg-black rounded-lg p-3 border border-zinc-800">
                        <div className={`text-xs font-bold mb-2 flex justify-between items-center ${config.color}`}>
                          <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border border-current bg-[#111]`}>
                                  {config.initial}
                              </div>
                              <span className="text-sm">{p.name}</span>
                          </div>
                          <a href={`https://${config.site}`} target="_blank" className="text-zinc-600 hover:text-white"><Globe size={12}/></a>
                        </div>
                        {creds ? (
                          <div className="grid grid-cols-2 gap-3">
                             <div className="bg-[#111] p-2 rounded border border-zinc-800/50">
                                <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Логин</div>
                                <div className="text-white text-xs font-mono truncate select-all">{creds.login}</div>
                             </div>
                             <div className="bg-[#111] p-2 rounded border border-zinc-800/50 relative">
                                <div className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Пароль</div>
                                <div className="text-white text-xs font-mono truncate pr-6">
                                  {isVisible ? creds.password : '••••••••'}
                                </div>
                                <button onClick={() => togglePasswordVisibility(p.name)} className="absolute right-2 bottom-2 text-zinc-500 hover:text-[#FF9900]">
                                  {isVisible ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                             </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-600 italic font-medium p-2 bg-[#111] rounded">Данные не сохранены в профиле</div>
                        )}
                     </div>
                  );
               })}
             </div>
          </div>
  
          <button
              onClick={() => setIsEnding(true)}
              className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700"
            >
              <Square size={20} fill="currentColor" className="text-[#FF9900]" />
              ЗАВЕРШИТЬ СМЕНУ
          </button>
        </div>
      );
    } else {
      // VIEW 2: REPORTING PHASE (Enter Tokens)
      return (
        <div className="space-y-6 animate-fade-in pb-20">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setIsEnding(false)} className="w-10 h-10 rounded-full bg-[#1b1b1b] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-black text-white uppercase">Итоги смены</h2>
          </div>

          <div className="bg-[#1b1b1b] rounded-xl p-6 border border-zinc-800">
             <div className="text-center mb-6">
               <p className="text-zinc-500 text-sm font-bold uppercase mb-1">Отработано</p>
               <p className="text-3xl font-mono font-bold text-white tracking-wider text-shadow">{formatTime(elapsedTime)}</p>
             </div>

             <div className="space-y-4">
                <p className="text-sm text-zinc-400 font-bold mb-2 border-b border-zinc-800 pb-2">Введите заработок (токены):</p>
                {activeShift.platforms.filter(p => p.isActive).map(p => {
                  const config = PLATFORM_CONFIG[p.name];
                  return (
                    <div key={p.name}>
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border border-current bg-[#111] ${config.color} ${config.border}`}>
                            {config.initial}
                         </div>
                         <label className={`text-xs font-bold block ${config.color}`}>{p.name}</label>
                      </div>
                      <input
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder="0"
                        autoFocus={tokenInputs[p.name] === undefined} // Auto focus first input
                        value={tokenInputs[p.name] || ''}
                        onChange={(e) => setTokenInputs(prev => ({...prev, [p.name]: e.target.value}))}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] text-lg font-mono font-bold"
                      />
                    </div>
                  );
                })}
             </div>
             
             <button
              onClick={handleEndSubmit}
              disabled={isSubmitting}
              className="w-full mt-8 bg-[#FF9900] hover:bg-[#ffad33] text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              СОХРАНИТЬ РЕЗУЛЬТАТ
            </button>
          </div>
        </div>
      )
    }
  }

  // --- START SHIFT VIEW ---
  return (
    <div className="space-y-6">
      {/* Access List Card */}
      <div className="bg-[#1b1b1b] rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
           <div className="w-1 h-4 bg-[#FF9900] rounded-full"></div>
           <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Доступы</h3>
           <span className="ml-auto bg-zinc-800 text-[10px] px-2 py-0.5 rounded text-zinc-400 font-bold border border-zinc-700">Только для вас</span>
        </div>
        
        <div className="space-y-3">
           {DEFAULT_PLATFORMS.map(name => {
             const platform = PLATFORM_CONFIG[name];
             const creds = credentials[name];
             const isVisible = visiblePasswords[name];

             return (
               <div key={name} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                 <div className="flex flex-col gap-1 w-full max-w-[40%]">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-black bg-[#111] ${platform.color} ${platform.border}`}>
                         {platform.initial}
                       </div>
                       <span className="text-sm font-bold text-zinc-200">{name}</span>
                    </div>
                    <a 
                     href={`https://${platform.site}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-[#FF9900] text-[10px] flex items-center gap-1 hover:underline font-bold ml-11 truncate"
                    >
                     <Globe size={10} /> {platform.site}
                    </a>
                 </div>

                 {/* Credentials Display */}
                 <div className="flex items-center justify-end gap-2 w-full">
                    {creds ? (
                       <div className="flex items-center gap-2 bg-black px-2 py-1.5 rounded border border-zinc-800">
                          <div className="text-[10px] text-zinc-400 font-mono select-all">{creds.login}</div>
                          <div className="w-[1px] h-3 bg-zinc-800"></div>
                          <div className="text-[10px] text-zinc-400 font-mono w-[60px] truncate text-right">
                             {isVisible ? creds.password : '••••••'}
                          </div>
                          <button onClick={() => togglePasswordVisibility(name)} className="text-zinc-500 hover:text-white">
                             {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                       </div>
                    ) : (
                       <span className="text-[10px] text-zinc-600 italic font-medium px-2 py-1 bg-black rounded border border-zinc-800">Нет данных</span>
                    )}
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Selector Grid */}
      <div className="bg-[#1b1b1b] rounded-xl border border-zinc-800 p-5">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FF9900] rounded-full"></div>
            Выберите площадки
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
           {DEFAULT_PLATFORMS.map(name => {
             const config = PLATFORM_CONFIG[name];
             const isSelected = selectedPlatforms.has(name);
             return (
               <button
                 key={name}
                 onClick={() => togglePlatform(name)}
                 className={`group relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 text-center
                   ${isSelected 
                      ? 'bg-black border-[#FF9900] shadow-[0_0_15px_rgba(255,153,0,0.15)]' 
                      : 'bg-black border-zinc-800 hover:border-zinc-700'}`}
               >
                 {/* Icon Circle */}
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black transition-transform duration-300 group-active:scale-95
                    ${isSelected ? `bg-[#FF9900] text-black` : `bg-[#111] text-zinc-600 group-hover:text-zinc-400`}`}>
                    {config.initial}
                 </div>
                 
                 {/* Text */}
                 <div>
                    <div className={`text-sm font-bold uppercase transition-colors ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                        {name}
                    </div>
                    <div className={`text-[10px] font-mono transition-colors ${isSelected ? 'text-[#FF9900]' : 'text-zinc-700'}`}>
                        {config.site}
                    </div>
                 </div>

                 {/* Selection Indicator */}
                 <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-[#FF9900] border-[#FF9900]' : 'bg-transparent border-zinc-700'}`}>
                    {isSelected && <Check size={10} className="text-black stroke-[3]" />}
                 </div>
               </button>
             );
           })}
        </div>
      </div>

      {/* Start Button */}
      {selectedPlatforms.size > 0 && (
         <button
          onClick={handleStart}
          className="w-full py-4 bg-[#FF9900] hover:bg-[#ffad33] rounded-xl font-black text-lg text-black shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          <Play fill="currentColor" size={20} />
          НАЧАТЬ СМЕНУ
        </button>
      )}
    </div>
  );
};
