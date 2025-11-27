import React, { useEffect, useState } from 'react';
import { Send, Zap, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tgUser, setTgUser] = useState<{first_name: string} | null>(null);

  useEffect(() => {
    // Check if we are physically inside Telegram to show "Continue as..."
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setTgUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#FF9900] rounded-full opacity-5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-900 rounded-full opacity-10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm z-10 space-y-12">
        
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-[#1b1b1b] rounded-3xl mx-auto flex items-center justify-center border-2 border-[#FF9900] shadow-[0_0_30px_rgba(255,153,0,0.2)] mb-6 transform rotate-3">
             <Zap size={48} className="text-[#FF9900]" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-1">PRIMA</h1>
            <p className="text-[#FF9900] text-sm font-bold tracking-[0.3em] uppercase">Webcam Studio CRM</p>
          </div>
        </div>

        {/* Features / Info */}
        <div className="space-y-4">
           <div className="bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#FF9900]">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <h3 className="text-white font-bold text-sm">Безопасный вход</h3>
                 <p className="text-zinc-500 text-xs font-medium">Авторизация через Telegram</p>
              </div>
           </div>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="group w-full bg-[#54a9eb] hover:bg-[#4a97d1] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Send size={24} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span>
              {tgUser ? `Продолжить как ${tgUser.first_name}` : 'Войти через Telegram'}
            </span>
          </button>
          
          <p className="text-center text-zinc-600 text-xs font-medium">
            Нажимая кнопку, вы принимаете <span className="underline cursor-pointer hover:text-zinc-400">правила студии</span>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-zinc-800 text-[10px] font-bold uppercase tracking-widest">
        Prima Studio App v1.2.0
      </div>
    </div>
  );
};
