export type AppId = 
  | 'finder' 
  | 'projects' 
  | 'terminal' 
  | 'calendar' 
  | 'wallet' 
  | 'youtube' 
  | 'games' 
  | 'services' 
  | 'notes' 
  | 'recycle-bin' 
  | 'history'
  | 'settings';

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DeletedItem {
  id: string;
  type: 'chat' | 'note' | 'file';
  name: string;
  content: any;
  deletedAt: Date;
}
