
import React, { useState, useEffect } from 'react';
import { User as UserType, PlatformName } from '../types';
import { Calendar, Clock, DollarSign, Eye, EyeOff, User, CheckCircle2, Save } from 'lucide-react';
import { PLATFORM_CONFIG, DEFAULT_PLATFORMS } from '../constants';

interface ProfileProps {
  user: UserType;
  onToggleRole: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onToggleRole }) => {
  // State for credentials storage
  const [credentials, setCredentials] = useState<Record<string, {login: string, password: string}>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [savedPlatform, setSavedPlatform] = useState<string | null>(null);

  // Load credentials from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('prima_credentials');
    if (stored) {
      try {
        setCredentials(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse credentials", e);
      }
    }
  }, []);

  const handleChange = (platform: string, field: 'login' | 'password', value: string) => {
     setCredentials(prev => ({
       ...prev,
       [platform]: {
         ...(prev[platform] || { login: '', password: '' }),
         [field]: value
       }
     }));
  };

  const handleSave = (platform: string) => {
    localStorage.setItem('prima_credentials', JSON.stringify(credentials));
    setSavedPlatform(platform);
    setTimeout(() => setSavedPlatform(null), 2000);
  };

  const togglePasswordVisibility = (platform: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const getDotColor = (name: PlatformName) => {
    switch(name) {
      case PlatformName.Chaturbate: return 'bg-orange-500';
      case PlatformName.Stripchat: return 'bg-rose-500';
      case PlatformName.Camsoda: return 'bg-blue-500';
      case PlatformName.Cam4: return 'bg-pink-500';
      case PlatformName.Jasmin: return 'bg-yellow-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800">
         <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-2xl font-bold border-2 border-[#FF9900] text-[#FF9900]">
            {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full rounded-full" /> : user.firstName[0]}
         </div>
         <div>
            <h2 className="text-xl font-black text-white">{user.firstName}</h2>
            <div className="flex gap-2 mt-1">
               <span className="text-xs bg-[#FF9900] text-black px-2 py-0.5 rounded-sm uppercase font-black tracking-wider">
                 {user.role === 'admin' ? 'Администратор' : 'Оператор'}
               </span>
            </div>
         </div>
         <button onClick={onToggleRole} className="ml-auto text-xs text-zinc-600 underline hover:text-[#FF9900]">Role</button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
         <div className="bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-2">
            <Calendar className="text-[#FF9900]" size={24} />
            <span className="text-2xl font-black text-white">1</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Смены</span>
         </div>
         <div className="bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-2">
            <Clock className="text-[#FF9900]" size={24} />
            <span className="text-2xl font-black text-white">0</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Часы</span>
         </div>
         <div className="bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-2">
            <DollarSign className="text-[#FF9900]" size={24} />
            <span className="text-2xl font-black text-white">$0</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Доход</span>
         </div>
      </div>

      {/* Credentials Section */}
      <div>
         <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full border-2 border-[#FF9900] flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Учетные записи</h3>
         </div>

         <p className="text-xs text-zinc-500 mb-4 bg-[#1b1b1b] p-3 rounded-lg border border-zinc-800">
           Введите логины и пароли для быстрого доступа во время смены.
         </p>

         <div className="space-y-4">
           {DEFAULT_PLATFORMS.map((name) => {
             const isSaved = savedPlatform === name;
             return (
               <div key={name} className={`bg-[#1b1b1b] rounded-xl border transition-colors p-5 space-y-4 ${isSaved ? 'border-green-500/50' : 'border-zinc-800'}`}>
                  <div className={`flex items-center justify-between font-black mb-2 text-white`}>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getDotColor(name)}`}></div>
                        {name}
                     </div>
                     {isSaved && <span className="text-green-500 text-xs flex items-center gap-1 animate-fade-in"><CheckCircle2 size={12} /> Сохранено</span>}
                  </div>
                  
                  <div className="space-y-3">
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                          type="text" 
                          placeholder="Логин"
                          value={credentials[name]?.login || ''}
                          onChange={(e) => handleChange(name, 'login', e.target.value)}
                          onBlur={() => handleSave(name)}
                          className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:border-[#FF9900] focus:outline-none font-bold transition-colors"
                        />
                     </div>
                     <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </div>
                        <input 
                          type={visiblePasswords[name] ? "text" : "password"}
                          placeholder="Пароль"
                          value={credentials[name]?.password || ''}
                          onChange={(e) => handleChange(name, 'password', e.target.value)}
                          onBlur={() => handleSave(name)}
                          className="w-full bg-black border border-zinc-700 rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-700 focus:border-[#FF9900] focus:outline-none font-bold transition-colors"
                        />
                        <button 
                           onClick={() => togglePasswordVisibility(name)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#FF9900] transition-colors"
                        >
                           {visiblePasswords[name] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                     
                     <button
                        onClick={() => handleSave(name)}
                        className="w-full flex items-center justify-center gap-2 bg-[#1b1b1b] border border-zinc-700 hover:border-[#FF9900] text-zinc-300 hover:text-white py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                     >
                        <Save size={14} /> Сохранить
                     </button>
                  </div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
};
