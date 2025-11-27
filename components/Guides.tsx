import React, { useState } from 'react';
import { GUIDES } from '../constants';
import { ChevronDown, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Guide } from '../types';

export const Guides: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>(GUIDES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<'Novice' | 'Advanced' | 'Technical'>('Novice');

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  const handleAddClick = () => {
    setEditingGuideId(null);
    setTitle('');
    setContent('');
    setLevel('Novice');
    setIsModalOpen(true);
  };

  const handleEditClick = (guide: Guide, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGuideId(guide.id);
    setTitle(guide.title);
    setContent(guide.content);
    setLevel(guide.level);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить методику?')) {
        setGuides(prev => prev.filter(g => g.id !== id));
        if (expandedId === id) setExpandedId(null);
    }
  };

  const handleSaveGuide = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingGuideId) {
        // Update existing
        setGuides(prev => prev.map(g => g.id === editingGuideId ? { ...g, title, content, level } : g));
    } else {
        // Create new
        const newGuide: Guide = {
            id: Date.now().toString(),
            title,
            content,
            level
        };
        setGuides([...guides, newGuide]);
    }
    setIsModalOpen(false);
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      // Adjusted for Dark/Orange theme - keep colors but make them pop against black
      case 'Novice': return 'bg-green-900/40 text-green-400 border-green-500/50';
      case 'Advanced': return 'bg-purple-900/40 text-purple-400 border-purple-500/50';
      case 'Technical': return 'bg-blue-900/40 text-blue-400 border-blue-500/50';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const translateLevel = (level: string) => {
    switch (level) {
      case 'Novice': return 'НОВИЧОК';
      case 'Advanced': return 'ПРОДВИНУТЫЙ';
      case 'Technical': return 'ТЕХНИЧЕСКИЙ';
      default: return level;
    }
  }

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-black text-white uppercase tracking-tight">База знаний</h2>
         <button 
            onClick={handleAddClick}
            className="w-8 h-8 rounded-md bg-[#FF9900] flex items-center justify-center text-black active:scale-90 transition-transform font-bold"
         >
            <Plus size={20} />
         </button>
      </div>

      <div className="space-y-3">
        {guides.map((guide) => {
          const isOpen = expandedId === guide.id;
          return (
            <div key={guide.id} className={`bg-[#1b1b1b] rounded-xl border overflow-hidden transition-all ${isOpen ? 'border-[#FF9900]' : 'border-zinc-800'}`}>
              <button 
                onClick={() => toggle(guide.id)}
                className="w-full p-5 flex items-center justify-between text-left group"
              >
                <div className="pr-4">
                  <h3 className={`font-bold mb-2 text-lg group-hover:text-[#FF9900] transition-colors ${isOpen ? 'text-[#FF9900]' : 'text-white'}`}>{guide.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeColor(guide.level)}`}>
                    {translateLevel(guide.level)}
                  </span>
                </div>
                <div className={`p-2 rounded-full bg-black text-zinc-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-[#FF9900]' : ''}`}>
                   <ChevronDown size={20} />
                </div>
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-0">
                   <div className="border-t border-zinc-800 pt-4 mb-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {guide.content}
                   </div>

                   {/* Actions */}
                   <div className="flex justify-end gap-2 pt-2">
                      <button 
                         onClick={(e) => handleEditClick(guide, e)}
                         className="flex items-center gap-1 px-3 py-1.5 rounded bg-black border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#FF9900] text-xs font-bold transition-colors uppercase"
                      >
                         <Pencil size={12} /> Редактировать
                      </button>
                      <button 
                         onClick={(e) => handleDeleteClick(guide.id, e)}
                         className="flex items-center gap-1 px-3 py-1.5 rounded bg-black border border-zinc-700 text-red-500 hover:bg-red-900/20 text-xs font-bold transition-colors uppercase"
                      >
                         <Trash2 size={12} /> Удалить
                      </button>
                   </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-8 p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-600 text-sm font-bold uppercase">
           Дополнительные методики могут быть добавлены администратором.
        </div>
      </div>

      {/* EDIT/ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative w-full max-w-md bg-[#1b1b1b] rounded-t-xl sm:rounded-xl border border-zinc-800 p-6 animate-slide-up shadow-2xl h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6 flex-shrink-0">
                 <h3 className="text-xl font-black text-white uppercase">{editingGuideId ? 'Редактировать' : 'Новый гайд'}</h3>
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-zinc-400 hover:text-white border border-zinc-800"
                 >
                    <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Название</label>
                    <input 
                       type="text" 
                       value={title}
                       onChange={(e) => setTitle(e.target.value)}
                       placeholder="Название методики"
                       className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] placeholder-zinc-700 font-bold"
                    />
                 </div>

                 <div>
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Уровень</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['Novice', 'Advanced', 'Technical'].map((l) => (
                          <button
                             key={l}
                             onClick={() => setLevel(l as any)}
                             className={`px-2 py-3 rounded-lg text-xs font-black uppercase transition-all border ${
                                level === l 
                                   ? 'bg-[#FF9900] border-[#FF9900] text-black' 
                                   : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                             }`}
                          >
                             {translateLevel(l)}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-[#FF9900] uppercase tracking-wider mb-2 block">Содержание</label>
                    <textarea 
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       placeholder="Текст гайда..."
                       className="w-full flex-1 min-h-[200px] bg-black border border-zinc-700 rounded-lg p-4 text-white focus:outline-none focus:border-[#FF9900] placeholder-zinc-700 resize-none text-sm leading-relaxed font-medium"
                    />
                 </div>
              </div>

              <div className="pt-4 mt-auto flex-shrink-0">
                 <button 
                    onClick={handleSaveGuide}
                    disabled={!title.trim() || !content.trim()}
                    className="w-full bg-[#FF9900] text-black font-black py-4 rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 uppercase"
                 >
                    {editingGuideId ? 'Сохранить' : 'Создать'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};