
import { PlatformName, Task, DaySchedule, Guide } from './types';

// Updated platform styling for the grid view
export const PLATFORM_CONFIG = {
  [PlatformName.Chaturbate]: { 
    initial: 'C', 
    color: 'text-orange-500', 
    border: 'border-orange-500/50',
    site: 'chaturbate.com'
  },
  [PlatformName.Stripchat]: { 
    initial: 'S', 
    color: 'text-rose-500', 
    border: 'border-rose-500/50',
    site: 'stripchat.com' 
  },
  [PlatformName.Camsoda]: { 
    initial: 'C', 
    color: 'text-blue-500', 
    border: 'border-blue-500/50',
    site: 'camsoda.com' 
  },
  [PlatformName.Cam4]: { 
    initial: 'C', 
    color: 'text-pink-500', 
    border: 'border-pink-500/50',
    site: 'cum4k.com' 
  },
  [PlatformName.Jasmin]: { 
    initial: 'J', 
    color: 'text-yellow-500', 
    border: 'border-yellow-500/50',
    site: 'jasmin.com' 
  },
};

export const DEFAULT_PLATFORMS = [
  PlatformName.Chaturbate,
  PlatformName.Stripchat,
  PlatformName.Camsoda,
  PlatformName.Cam4,
  PlatformName.Jasmin,
];

// Token Rates per platform
export const TOKEN_RATES: Record<PlatformName, number> = {
  [PlatformName.Chaturbate]: 0.05,
  [PlatformName.Stripchat]: 0.05,
  [PlatformName.Camsoda]: 0.05,
  [PlatformName.Jasmin]: 0.05,
  [PlatformName.Cam4]: 0.10, // Cum4K rate is higher
};

// Mock Data for Planning
export const INITIAL_TASKS: Task[] = [
  { id: '1', date: 26, type: 'video', title: 'Снять TikTok тренд', description: 'Музыка: "Bad Habit"', isCompleted: false },
  { id: '2', date: 26, type: 'social', title: 'Stories: Анонс эфира', description: 'За 30 мин до старта', isCompleted: true },
  { id: '3', date: 26, type: 'photo', title: 'Фото сет в белье', description: 'Для Twitter/X', isCompleted: false },
  { id: '4', date: 27, type: 'social', title: 'Ответы на комментарии', isCompleted: false },
  { id: '5', date: 28, type: 'video', title: 'Reels: Backstage', isCompleted: false },
];

export const INITIAL_SCHEDULE: DaySchedule[] = [
  { date: 24, isWorking: true, startTime: '16:00', endTime: '00:00' },
  { date: 25, isWorking: false, note: 'Выходной' },
  { date: 26, isWorking: true, startTime: '18:00', endTime: '02:00', note: 'Тематический эфир' },
  { date: 27, isWorking: true, startTime: '18:00', endTime: '02:00' },
  { date: 28, isWorking: true, startTime: '20:00', endTime: '04:00', note: 'Ночная смена' },
  { date: 29, isWorking: false, note: 'Отгул' },
  { date: 30, isWorking: true, startTime: '18:00', endTime: '02:00' },
];

export const GUIDES: Guide[] = [
  {
    id: '1',
    title: 'Подготовка рабочего места',
    content: 'Освещение, фон, чистота в кадре. Проверьте работу оборудования за 15 минут до начала смены.',
    level: 'Novice'
  },
  {
    id: '2',
    title: 'Настройка OBS и плагинов',
    content: 'Как подключить Lovense к OBS. Настройка алертов и виджетов для повышения вовлеченности.',
    level: 'Technical'
  },
  {
    id: '3',
    title: 'Психология общения',
    content: 'Техники удержания пользователя в привате. Как переводить гостей в платную зону.',
    level: 'Advanced'
  }
];
