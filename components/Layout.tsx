import React from 'react';
import { View, User } from '../types';
import { LayoutGrid, CalendarRange, Clock, User as UserIcon, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  user: User;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, user, onLogout }) => {
  
  const getHeaderTitle = () => {
    switch (currentView) {
      case View.Studio: return 'PRIMA';
      case View.Planning: return 'Планирование';
      case View.History: return 'История смен';
      case View.Profile: return 'Личный кабинет';
      case View.Admin: return 'Панель админа';
      default: return 'PRIMA CRM';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans pb-24">
      {/* View Header */}
      <div className="px-5 pt-8 pb-2 flex justify-between items-center bg-black">
        <div className="flex items-center gap-2">
          {currentView === View.Profile && <UserIcon className="text-[#FF9900]" size={24} />}
          {currentView === View.Studio && (
             <div className="w-10 h-10 rounded-full bg-[#1b1b1b] flex items-center justify-center border border-zinc-800">
                <UserIcon size={20} className="text-[#FF9900]" />
             </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{getHeaderTitle()}</h1>
            {currentView === View.Studio && <p className="text-xs text-zinc-500">Панель оператора</p>}
          </div>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2">
           {(currentView !== View.Studio) && (
             <span className="px-2 py-1 rounded bg-[#1b1b1b] border border-[#FF9900]/30 text-[10px] text-[#FF9900] uppercase tracking-wider font-bold">
               {user.role === 'admin' ? 'АДМИН' : 'ОПЕРАТОР'}
             </span>
           )}
           
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${currentView === View.Studio ? 'bg-[#1b1b1b] border border-zinc-800' : 'bg-[#1b1b1b]'}`}>
              <span className="text-sm font-bold text-zinc-300">{user.username}</span>
              <button className="text-zinc-500 hover:text-white"><LogOut size={14} /></button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 pb-safe z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center px-8 h-20">
          <NavItem 
            icon={<LayoutGrid size={22} />} 
            label="Студия" 
            isActive={currentView === View.Studio} 
            onClick={() => onNavigate(View.Studio)} 
          />
          <NavItem 
            icon={<CalendarRange size={22} />} 
            label="Планирование" 
            isActive={currentView === View.Planning} 
            onClick={() => onNavigate(View.Planning)} 
          />
          <NavItem 
            icon={<Clock size={22} />} 
            label="История" 
            isActive={currentView === View.History} 
            onClick={() => onNavigate(View.History)} 
          />
          <NavItem 
            icon={<UserIcon size={22} />} 
            label="Кабинет" 
            isActive={currentView === View.Profile} 
            onClick={() => onNavigate(View.Profile)} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-colors duration-200 ${isActive ? 'text-[#FF9900]' : 'text-zinc-600 hover:text-zinc-400'}`}
  >
    <div className={`${isActive ? 'opacity-100 scale-110' : 'opacity-70'} transition-all`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </button>
);