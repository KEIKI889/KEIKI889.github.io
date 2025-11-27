
export enum PlatformName {
  Chaturbate = 'Chaturbate',
  Stripchat = 'Stripchat',
  Cam4 = 'Cum4K', // Renamed to match screenshot "Cum4K"
  Camsoda = 'CamSoda',
  Jasmin = 'Jasmin',
}

export interface PlatformMetric {
  name: PlatformName;
  isActive: boolean;
  tokensEarned: number;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp
  platforms: PlatformMetric[];
  totalTokens: number;
  aiFeedback?: string;
  status: 'active' | 'completed';
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  role: 'operator' | 'admin';
  photoUrl?: string;
}

export enum View {
  Studio = 'studio',
  Planning = 'planning',
  History = 'history',
  Profile = 'profile',
  Admin = 'admin',
}

export type TaskType = 'video' | 'photo' | 'social' | 'admin';

export interface Task {
  id: string;
  date: number; // day of month
  type: TaskType;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface DaySchedule {
  date: number; // day of month
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
  note?: string;
}

export interface Guide {
  id: string;
  title: string;
  content: string;
  level: 'Novice' | 'Advanced' | 'Technical';
}
