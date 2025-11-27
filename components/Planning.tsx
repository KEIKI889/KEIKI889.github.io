
import React, { useState, useEffect } from 'react';
import { Calendar, Video, CheckCircle2, Circle, Camera, MessageCircle, FileText, Clock, Coffee, Plus, X, Trash2, Pencil, Settings, Save } from 'lucide-react';
import { INITIAL_TASKS, INITIAL_SCHEDULE } from '../constants';
import { Task, DaySchedule, TaskType } from '../types';

export const Planning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'schedule'>('schedule');
  const [selectedDay, setSelectedDay] = useState(26);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State with Persistence
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('prima_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('prima_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('prima_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('prima_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('video');

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedIsWorking, setSchedIsWorking] = useState(false);
  const [schedStartTime, setSchedStartTime] = useState('');
  const [schedEndTime, setSchedEndTime] = useState('');
  const [schedNote, setSchedNote] = useState('');

  // Generate a week of days around the selected day (mock logic for demo)
  const days = [
    { day: 'Пн', date: 24 },
    { day: 'Вт', date: 25 },
    { day: 'Ср', date: 26 },
    { day: 'Чт', date: 27 },
    { day: 'Пт', date: 28 },
    { day: 'Сб', date: 29 },
    { day: 'Вс', date: 30 },
  ];

  const currentSchedule = schedules.find(s => s.date === selectedDay);
  const dayTasks = tasks.filter(t => t.date === selectedDay);

  const handleManualSave = () => {
    setIsSaving(true);
    // Mimic saving delay for UX
    setTimeout(() => {
        setIsSaving(false);
    }, 1000);
  };

  // --- Task Handlers ---

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const openAddTask = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskType('video');
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskType(task.type);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Удалить задачу?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === editingTaskId ? {
        ...t,
        title: taskTitle,
        description: taskDesc,
        type: taskType
      } : t));
    } else {
      // Create new
      const newTask: Task = {
        id: Date.now().toString(),
        date: selectedDay,
        type: taskType,
        title: taskTitle,
        description: taskDesc,
        isCompleted: false
      };
      setTasks([...tasks, newTask]);
    }
    setIsTaskModalOpen(false);
  };

  // --- Schedule Handlers ---

  const openEditSchedule = () => {
    if (currentSchedule) {
      setSchedIsWorking(currentSchedule.isWorking);
      setSchedStartTime(currentSchedule.startTime || '18:00');
      setSchedEndTime(currentSchedule.endTime || '02:00');
      setSchedNote(currentSchedule.note || '');
    } else {
      // Default values if no schedule exists for this day yet
      setSchedIsWorking(true);
      setSchedStartTime('18:00');
      setSchedEndTime('02:00');
      setSchedNote('');
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = () => {
    setSchedules(prev => {
      const existingIndex = prev.findIndex(s => s.date === selectedDay);
      const newSchedule: DaySchedule = {
        date: selectedDay,
        isWorking: schedIsWorking,
        startTime: schedIsWorking ? schedStartTime : undefined,
        endTime: schedIsWorking ? schedEndTime : undefined,
        note: schedNote
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newSchedule;
        return updated;
      } else {
        return [...prev, newSchedule];
      }
    });
    setIsScheduleModalOpen(false);
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'video': return <Video size={18} className="text-[#FF9900]" />;
      case 'photo': return <Camera size={18} className="text-pink-500" />;
      case 'social': return <MessageCircle size={18} className="text-blue-500" />;
      default: return <FileText size={18} className="text-zinc-400" />;
    }
  };

  const taskTypes: { type: TaskType; label: string; icon: React.ReactNode }[] = [
     { type: 'video', label: 'Видео', icon: <Video size={16} /> },
     { type: 'photo', label: 'Фото', icon: <Camera size={16} /> },
     { type: 'social', label: 'Social', icon: <MessageCircle size={16} /> },
     { type: 'admin', label: 'Админ', icon: <FileText size={16} /> },
  ];

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Top Toggle */}
      <div className="grid grid-cols-2 gap-4">
        <button 
           onClick={() => setActiveTab('content')}
           className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'content' ? 'bg-[#1b1b1b] border-[#FF9900] text-[#FF9900] font-bold' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}
        >
          <FileText size={18} />
          <span className="text-sm">Контент-план</span>
        </button>
        <button 
           onClick={() => setActiveTab('schedule')}
           className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === 'schedule' ? 'bg-[#1b1b1b] border-[#FF9900] text-[#FF9900] font-bold' : 'bg-black border-zinc-800 text-zinc-500 hover:text-white'}`}
        >
           <Calendar size={18} />
           <span className="text-sm">График смен</span>
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="bg-[#1b1b1b] rounded-xl p-5 border border-zinc-800">
         <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
               <span className="capitalize">{new Date().toLocaleString('ru-RU', { month: 'long' })}</span>
               <span className="text-zinc-500 font-bold">2025</span>
            </div>
         </div>
         
         <div className="flex justify-between items-center overflow-x-auto pb-2 no-scrollbar gap-2">
            {days.map((item) => {
              const isSelected = item.date === selectedDay;
              const hasShift = schedules.find(s => s.date === item.date)?.isWorking;
              
              return (
                <button 
                  key={item.date} 
                  onClick={() => setSelectedDay(item.date)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-lg min-w-[44px] transition-all relative ${isSelected ? 'bg-[#FF9900] text-black scale-105 shadow-md' : 'text-zinc-500 hover:bg-zinc-800'}`}
                >
                   <span className="text-[10px] font-bold uppercase tracking-wider">{item.day}</span>
                   <span className={`text-xl font-black ${isSelected ? 'text-black' : 'text-zinc-400'}`}>{item.date}</span>
                   {/* Indicator Dot */}
                   {!isSelected && hasShift && (
                      <div className="w-1.5 h-1.5 rounded-full mt-1 bg-zinc-600"></div>
                   )}
                </button>
              );
            })}
         </div>
      </div>

      {/* CONTENT PLAN TAB */}
      {activeTab === 'content' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold text-white">Задачи на {selectedDay} ноября</h2>
             <button 
                onClick={openAddTask}
                className="w-8 h-8 rounded-full bg-[#FF9900] flex items-center justify-center text-black font-bold hover:bg-[#ffad33] transition-transform"
             >
                <Plus size={18} />
             </button>
          </div>

          {dayTasks.length === 0 ? (
            <div className="bg-[#1b1b1b] rounded-xl p-8 text-center border border-zinc-800 border-dashed">
               <p className="text-zinc-500 text-sm font-medium">Нет задач на этот день</p>
               <button 
                  onClick={openAddTask}
                  className="text-[#FF9900] text-sm font-bold mt-2 hover:underline transition-colors"
                >
                  Добавить задачу
               </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`bg-[#1b1b1b] p-4 rounded-xl border transition-all cursor-pointer group relative ${task.isCompleted ? 'border-zinc-800 opacity-60' : 'border-zinc-800 hover:border-zinc-600'}`}
                >
                  <div className="flex items-start gap-4 pr-16">
                     <div className={`mt-1 transition-colors ${task.isCompleted ? 'text-[#FF9900]' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                        {task.isCompleted ? <CheckCircle2 size={22} className="fill-[#FF9900]/20" /> : <Circle size={22} />}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           {getTaskIcon(task.type)}
                           <span className={`font-bold ${task.isCompleted ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</span>
                        </div>
                        {task.description && (
                           <p className="text-xs text-zinc-500 ml-7 font-medium">{task.description}</p>
                        )}
                     </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1">
                      <button 
                        onClick={(e) => openEditTask(task, e)}
                        className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                      >
                         <Pencil size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="p-2 text-zinc-500 hover:text-red-500 rounded-full hover:bg-zinc-800 transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
             onClick={handleManualSave}
             className={`w-full py-4 mt-4 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
          >
             {isSaving ? (
                <>
                   <CheckCircle2 size={20} />
                   Сохранено
                </>
             ) : (
                <>
                   <Save size={20} />
                   Сохранить изменения
                </>
             )}
          </button>
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="animate-fade-in space-y-4">
           {currentSchedule && currentSchedule.isWorking ? (
             // Working Day Card
             <div className="bg-[#1b1b1b] rounded-xl p-1 border border-zinc-800">
                <div className="bg-[#222] rounded-[10px] p-6 border-b border-zinc-800 relative">
                   {/* Edit Button */}
                   <button 
                     onClick={openEditSchedule}
                     className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#FF9900] transition-colors"
                   >
                     <Settings size={16} />
                   </button>

                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <h2 className="text-2xl font-black text-white mb-1">Рабочая смена</h2>
                         <div className="flex items-center gap-2 text-[#FF9900] text-sm font-bold bg-[#FF9900]/10 px-3 py-1 rounded-sm w-fit border border-[#FF9900]/20">
                            <div className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse"></div>
                            ЗАПЛАНИРОВАНО
                         </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center text-white border border-zinc-800">
                         <Clock size={24} className="text-[#FF9900]" />
                      </div>
                   </div>

                   <div className="flex items-end gap-3 mb-2">
                      <span className="text-5xl font-mono font-bold text-white tracking-tighter">
                         {currentSchedule.startTime}
                      </span>
                      <span className="text-zinc-500 pb-2 text-lg font-bold">- {currentSchedule.endTime}</span>
                   </div>
                   <p className="text-zinc-500 text-sm font-medium">Длительность: 8 часов</p>
                </div>

                <div className="p-6">
                   {currentSchedule.note ? (
                      <div className="bg-black p-4 rounded-lg border border-zinc-800">
                         <span className="text-xs font-bold text-[#FF9900] uppercase tracking-wider block mb-2">Заметка</span>
                         <p className="text-zinc-300 text-sm font-medium">{currentSchedule.note}</p>
                      </div>
                   ) : (
                      <div className="text-center text-zinc-600 text-sm font-bold">Нет заметок</div>
                   )}
                </div>
             </div>
           ) : (
             // Day Off Card (or No Data)
             <div className="bg-[#1b1b1b] rounded-xl p-8 border border-zinc-800 text-center flex flex-col items-center justify-center min-h-[300px] relative">
                <button 
                   onClick={openEditSchedule}
                   className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#FF9900] transition-colors"
                 >
                   <Settings size={16} />
                 </button>

                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-zinc-600 mb-6 border border-zinc-800">
                   <Coffee size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">ВЫХОДНОЙ</h2>
                <p className="text-zinc-500 text-sm max-w-[200px] mb-8 font-medium">
                   {currentSchedule?.note || 'Отдыхайте и набирайтесь сил для новых эфиров!'}
                </p>
                <button 
                  onClick={openEditSchedule}
                  className="px-6 py-3 rounded-md bg-[#FF9900]/10 text-[#FF9900] text-sm font-bold border border-[#FF9900]/50 hover:bg-[#FF9900] hover:text-black transition-colors uppercase"
                >
                   Поставить смену
                </button>
             </div>
           )}

           <button 
             onClick={handleManualSave}
             className={`w-full py-4 mt-4 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
          >
             {isSaving ? (
                <>
                   <CheckCircle2 size={20} />
                   Сохранено
                </>
             ) : (
                <>
                   <Save size={20} />
                   Сохранить расписание
                </>
             )}
          </button>
        </div>
      )}

      {/* TASK MODAL (Add/Edit) */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTaskModalOpen(false)}></div>
           <div className="relative w-full max-w-md bg-[#1b1b1b] rounded-t-xl sm:rounded-xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-white uppercase">{editingTaskId ? 'Редактировать' : 'Новая задача'}</h3>
                 <button 
                    onClick={() => setIsTaskModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Тип задачи</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                       {taskTypes.map((t) => (
                          <button
                             key={t.type}
                             onClick={() => setTaskType(t.type)}
                             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold border transition-all whitespace-nowrap uppercase ${
                                taskType === t.type 
                                   ? 'bg-[#FF9900] border-[#FF9900] text-black' 
                                   : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                             }`}
                          >
                             {t.icon}
                             {t.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Название</label>
                    <input 
                       type="text" 
                       value={taskTitle}
                       onChange={(e) => setTaskTitle(e.target.value)}
                       placeholder="Например: Снять Reels"
                       className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] placeholder-zinc-700 font-bold"
                    />
                 </div>

                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Описание (опционально)</label>
                    <textarea 
                       value={taskDesc}
                       onChange={(e) => setTaskDesc(e.target.value)}
                       placeholder="Детали, ссылки, идеи..."
                       rows={3}
                       className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] placeholder-zinc-700 resize-none font-medium"
                    />
                 </div>

                 <button 
                    onClick={handleSaveTask}
                    disabled={!taskTitle.trim()}
                    className="w-full bg-[#FF9900] text-black font-black py-4 rounded-lg mt-4 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 uppercase tracking-wide"
                 >
                    {editingTaskId ? 'Сохранить изменения' : 'СОХРАНИТЬ'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)}></div>
           <div className="relative w-full max-w-md bg-[#1b1b1b] rounded-t-xl sm:rounded-xl border border-zinc-800 p-6 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-white uppercase">Расписание</h3>
                 <button 
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="space-y-6">
                 {/* Toggle Working */}
                 <div 
                    onClick={() => setSchedIsWorking(!schedIsWorking)}
                    className="flex items-center justify-between p-4 bg-black rounded-lg border border-zinc-800 cursor-pointer group"
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${schedIsWorking ? 'bg-[#FF9900] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Clock size={20} className="font-bold" />
                       </div>
                       <div>
                          <div className="font-bold text-white group-hover:text-[#FF9900] transition-colors">Рабочая смена</div>
                          <div className="text-xs text-zinc-500 font-medium">{schedIsWorking ? 'Вы работаете в этот день' : 'Выходной день'}</div>
                       </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${schedIsWorking ? 'bg-[#FF9900]' : 'bg-zinc-800'}`}>
                       <div className={`w-4 h-4 rounded-full bg-white transition-transform ${schedIsWorking ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                 </div>

                 {schedIsWorking && (
                   <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Начало</label>
                        <input 
                           type="time" 
                           value={schedStartTime}
                           onChange={(e) => setSchedStartTime(e.target.value)}
                           className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF9900] font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Конец</label>
                        <input 
                           type="time" 
                           value={schedEndTime}
                           onChange={(e) => setSchedEndTime(e.target.value)}
                           className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#FF9900] font-bold"
                        />
                      </div>
                   </div>
                 )}

                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Заметка</label>
                    <textarea 
                       value={schedNote}
                       onChange={(e) => setSchedNote(e.target.value)}
                       placeholder={schedIsWorking ? "Например: Тематический эфир" : "Например: Отдых, встреча..."}
                       rows={2}
                       className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] placeholder-zinc-700 resize-none font-medium"
                    />
                 </div>

                 <button 
                    onClick={handleSaveSchedule}
                    className="w-full bg-[#FF9900] hover:bg-[#ffad33] text-black font-black py-4 rounded-lg mt-2 active:scale-95 transition-transform uppercase tracking-wide"
                 >
                    Сохранить
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
