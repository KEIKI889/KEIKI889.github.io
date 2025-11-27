import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Studio } from './components/Studio';
import { Planning } from './components/Planning';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { User, Shift, View, PlatformName } from './types';
import { DEFAULT_PLATFORMS } from './constants';

// Declare Parse global from the script tag in index.html
declare const Parse: any;

// Initialize Parse (Back4App)
try {
  if (typeof Parse !== 'undefined') {
    Parse.initialize("APP_ID", "JS_KEY");
    Parse.serverURL = 'https://parseapi.back4app.com';
  }
} catch (error) {
  console.error("Parse initialization failed:", error);
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Studio);
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp Styling
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor('#000000');
      tg.setHeaderColor('#000000');
    }

    // Load LocalStorage Data
    const storedShifts = localStorage.getItem('prima_shifts');
    if (storedShifts) setShifts(JSON.parse(storedShifts));

    const storedActiveShiftId = localStorage.getItem('prima_active_shift_id');
    if (storedActiveShiftId) setActiveShiftId(storedActiveShiftId);
  }, []);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    
    let storedRole = localStorage.getItem('prima_user_role');
    if (storedRole !== 'admin' && storedRole !== 'operator') storedRole = 'operator';

    // If running inside Telegram, use real data
    // If running in browser (dev), use mock data
    const userData: User = {
      id: tgUser?.id?.toString() || 'user_dev_123',
      firstName: tgUser?.first_name || 'keikiiiii',
      username: tgUser?.username || 'keikiiiii',
      role: (storedRole as 'operator' | 'admin'),
      photoUrl: tgUser?.photo_url
    };

    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleStartShift = (platformNames: PlatformName[]) => {
    if (!user) return;
    const newShift: Shift = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.firstName,
      startTime: Date.now(),
      status: 'active',
      totalTokens: 0,
      platforms: DEFAULT_PLATFORMS.map(name => ({
        name,
        isActive: platformNames.includes(name),
        tokensEarned: 0
      }))
    };
    setShifts(prev => {
      const updated = [...prev, newShift];
      localStorage.setItem('prima_shifts', JSON.stringify(updated));
      return updated;
    });
    setActiveShiftId(newShift.id);
    localStorage.setItem('prima_active_shift_id', newShift.id);
  };

  const handleEndShift = (completedShift: Shift) => {
    setShifts(prev => {
      const updated = prev.map(s => s.id === completedShift.id ? completedShift : s);
      localStorage.setItem('prima_shifts', JSON.stringify(updated));
      return updated;
    });
    setActiveShiftId(null);
    localStorage.removeItem('prima_active_shift_id');
    setCurrentView(View.History);
  };

  const toggleRole = () => {
    if (!user) return;
    const newRole = user.role === 'operator' ? 'admin' : 'operator';
    setUser({ ...user, role: newRole });
    localStorage.setItem('prima_user_role', newRole);
  };

  // 1. Show Login Screen if not authenticated
  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Show Main App Layout
  const activeShift = shifts.find(s => s.id === activeShiftId) || null;

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} user={user}>
      {currentView === View.Studio && (
        <Studio 
          user={user} 
          activeShift={activeShift}
          onStartShift={handleStartShift}
          onEndShift={handleEndShift}
        />
      )}
      {currentView === View.Planning && <Planning />}
      {currentView === View.History && <History shifts={shifts} />}
      {currentView === View.Profile && <Profile user={user} onToggleRole={toggleRole} />}
      {currentView === View.Admin && <AdminPanel shifts={shifts} />}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);