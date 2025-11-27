
import React, { useState } from 'react';
import { Shift, PlatformName } from '../types';
import { BarChart3, TrendingUp, Send, FileText, CheckCircle2, Database, Server, Search, RefreshCw, Trash2 } from 'lucide-react';

// Declare Parse globally as it's loaded via CDN
declare const Parse: any;

interface AdminPanelProps {
  shifts: Shift[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ shifts }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const completedShifts = shifts.filter(s => s.status === 'completed');
  const totalRevenue = completedShifts.reduce((acc, s) => acc + s.totalTokens, 0);

  // Group by platform
  const platformStats: Record<string, number> = {};
  completedShifts.forEach(shift => {
    shift.platforms.forEach(p => {
      if (p.isActive) {
        platformStats[p.name] = (platformStats[p.name] || 0) + p.tokensEarned;
      }
    });
  });

  const handleSendReport = () => {
    setIsSending(true);
    
    // 1. Calculate Stats
    const date = new Date().toLocaleDateString('ru-RU');
    const topPlatformEntry = Object.entries(platformStats).sort((a,b) => b[1] - a[1])[0];
    const topPlatform = topPlatformEntry ? `${topPlatformEntry[0]} (${topPlatformEntry[1]})` : 'Нет данных';
    
    // 2. Generate Human Readable Report
    const reportText = `
📊 *ОТЧЕТ PRIMA STUDIO*
📅 Дата: ${date}

💰 *Оборот:* ${totalRevenue.toLocaleString()} tk
👯 *Смен:* ${completedShifts.length}
🏆 *Топ площадка:* ${topPlatform}

--------
#prima #report #statistics
    `.trim();

    const tg = (window as any).Telegram?.WebApp;

    setTimeout(() => {
      if (tg) {
        // We use Telegram Share Link to send text to a chat.
        // We avoid tg.sendData() here because it closes the Mini App.
        // Format: https://t.me/share/url?url={url}&text={text}
        const appUrl = 'https://t.me/PrimaStudioBot/app'; // Placeholder or actual app link
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(reportText)}`;
        tg.openTelegramLink(shareUrl);
      } else {
        // Fallback for browser testing
        alert(reportText);
      }
      
      console.log("Report generated:", reportText);
      setIsSending(false);
      setIsSent(true);
      
      // Reset success state
      setTimeout(() => setIsSent(false), 3000);
    }, 1000);
  };

  const handleTestDbConnection = () => {
    setDbStatus('loading');
    try {
      const gameScore = new Parse.Object("GameScore");
      gameScore.set("score", 1337);
      gameScore.set("playerName", "Sean Plott");
      gameScore.set("cheatMode", false);

      gameScore.save().then((result: any) => {
        console.log('Created object:', result.id);
        alert(`Success! Created objectId: ${result.id}\nCheck your Back4App Dashboard.`);
        setDbStatus('success');
      }).catch((error: any) => {
        console.error('Error:', error.message);
        alert('Error saving to Parse: ' + error.message);
        setDbStatus('error');
      });
    } catch (e) {
      console.error(e);
      alert('Parse SDK not initialized or failed to load.');
      setDbStatus('error');
    }
  };

  const handleTestDbQuery = () => {
    setDbStatus('loading');
    try {
      const query = new Parse.Query("GameScore");
      query.greaterThan("score", 1000);
      query.find().then((results: any[]) => {
        console.log("Query Results:", results);
        const names = results.map(obj => `${obj.get("playerName")} (${obj.get("score")})`).join("\n");
        alert(`Found ${results.length} results:\n${names}`);
        setDbStatus('success');
      }).catch((error: any) => {
        console.error('Error:', error.message);
        alert('Error querying Parse: ' + error.message);
        setDbStatus('error');
      });
    } catch (e) {
      console.error(e);
      alert('Parse error.');
      setDbStatus('error');
    }
  };

  const handleTestDbUpdate = () => {
    setDbStatus('loading');
    try {
      // Find the latest object to update
      const query = new Parse.Query("GameScore");
      query.descending("createdAt");
      query.first().then((gameScore: any) => {
        if (!gameScore) {
          throw new Error("No GameScore object found to update. Try 'Test Write' first.");
        }
        
        // Update logic provided
        gameScore.set("score", 1338);
        return gameScore.save();
      }).then((result: any) => {
        console.log('Updated object');
        alert(`Success! Updated objectId: ${result.id} to score 1338`);
        setDbStatus('success');
      }).catch((error: any) => {
        console.error('Error:', error.message);
        alert('Error updating Parse: ' + error.message);
        setDbStatus('error');
      });
    } catch (e) {
      console.error(e);
      alert('Parse error.');
      setDbStatus('error');
    }
  };

  const handleTestDbDelete = () => {
    setDbStatus('loading');
    try {
      const queryDelete = new Parse.Query("GameScore");
      queryDelete.descending("createdAt"); // Get the most recent one to delete
      queryDelete.first().then((gameScore: any) => {
        if (!gameScore) {
           throw new Error("No GameScore object found to delete.");
        }
        return gameScore.destroy();
      }).then(() => {
        console.log('Deleted object');
        alert('Success! Object deleted.');
        setDbStatus('success');
      }).catch((error: any) => {
        console.error('Error:', error.message);
        alert('Error deleting object: ' + error.message);
        setDbStatus('error');
      });
    } catch (e) {
      console.error(e);
      alert('Parse error.');
      setDbStatus('error');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header Action */}
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-black text-white uppercase tracking-tight">Статистика</h2>
         <button 
           onClick={handleSendReport}
           disabled={isSending || isSent}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
             isSent 
               ? 'bg-green-500 text-black' 
               : 'bg-[#1b1b1b] border border-zinc-700 text-[#FF9900] hover:bg-zinc-900'
           }`}
         >
           {isSent ? <CheckCircle2 size={16} /> : <Send size={16} />}
           {isSent ? 'ОТПРАВЛЕНО' : 'В TELEGRAM'}
         </button>
      </div>

      <div className="bg-[#1b1b1b] p-6 rounded-xl border border-zinc-800 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#FF9900]"></div>
        <div className="text-zinc-500 text-sm uppercase tracking-wider mb-2 font-bold">Общий оборот студии</div>
        <div className="text-5xl font-black text-white mb-2 tracking-tighter tabular-nums">{totalRevenue.toLocaleString()}</div>
        <div className="text-[#FF9900] flex items-center justify-center gap-1 text-sm font-bold bg-[#FF9900]/10 py-1 px-3 rounded-full w-fit mx-auto border border-[#FF9900]/20">
          <TrendingUp size={16} /> +12% к прошлой неделе
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 uppercase">
           <BarChart3 size={20} className="text-[#FF9900]" /> По площадкам
        </h3>
        <div className="bg-[#1b1b1b] rounded-xl border border-zinc-800 p-5 space-y-5">
          {Object.keys(platformStats).length === 0 ? (
            <div className="text-center text-zinc-600 py-4 font-bold">Нет данных за период</div>
          ) : (
            Object.keys(platformStats).map((key) => {
              const name = key as PlatformName;
              const amount = platformStats[name] || 0;
              const max = Math.max(...Object.values(platformStats), 1);
              const percent = (amount / max) * 100;
              
              return (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-zinc-300">{name}</span>
                    <span className="text-white font-mono">{amount}</span>
                  </div>
                  <div className="h-4 w-full bg-black rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF9900] to-yellow-500 transition-all duration-1000 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2">
           <FileText size={20} className="text-[#FF9900]" />
           История смен
        </h3>
        <div className="space-y-2">
            {completedShifts.length === 0 ? (
                 <div className="bg-[#1b1b1b] p-8 rounded-xl border border-zinc-800 text-center text-zinc-500 font-bold">Нет завершенных смен</div>
            ) : (
                completedShifts.map((shift) => (
                    <div key={shift.id} className="bg-[#1b1b1b] p-4 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-600 transition-colors">
                        <div>
                            <span className="text-[#FF9900] font-black block text-sm mb-1">{shift.userName}</span>
                            <span className="text-zinc-500 text-xs font-bold uppercase block">{new Date(shift.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-white font-black text-lg block">{shift.totalTokens} tk</span>
                            <span className="text-xs text-zinc-600 font-bold">
                                {shift.platforms.filter(p => p.isActive).length} площадок
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Database Test Section */}
      <div className="pt-6 border-t border-zinc-800/50">
        <h3 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2">
           <Database size={20} className="text-zinc-500" />
           Система
        </h3>
        <div className="bg-[#1b1b1b] p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dbStatus === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                 <Server size={20} />
              </div>
              <div>
                 <div className="font-bold text-white text-sm">База данных Parse</div>
                 <div className="text-xs text-zinc-500">Back4App Integration</div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={handleTestDbConnection}
                disabled={dbStatus === 'loading'}
                className="px-3 py-3 bg-black border border-zinc-700 hover:border-[#FF9900] text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-2"
             >
                <Database size={14} />
                {dbStatus === 'loading' ? '...' : 'Тест Write'}
             </button>
             <button 
                onClick={handleTestDbQuery}
                disabled={dbStatus === 'loading'}
                className="px-3 py-3 bg-black border border-zinc-700 hover:border-[#FF9900] text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-2"
             >
                <Search size={14} />
                {dbStatus === 'loading' ? '...' : 'Тест Read'}
             </button>
             <button 
                onClick={handleTestDbUpdate}
                disabled={dbStatus === 'loading'}
                className="px-3 py-3 bg-black border border-zinc-700 hover:border-[#FF9900] text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-2"
             >
                <RefreshCw size={14} />
                {dbStatus === 'loading' ? '...' : 'Update'}
             </button>
             <button 
                onClick={handleTestDbDelete}
                disabled={dbStatus === 'loading'}
                className="px-3 py-3 bg-black border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-500 rounded-lg text-xs font-bold transition-all uppercase flex items-center justify-center gap-2"
             >
                <Trash2 size={14} />
                {dbStatus === 'loading' ? '...' : 'Delete'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
