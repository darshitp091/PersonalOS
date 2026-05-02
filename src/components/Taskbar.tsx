import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Folder, FileCode, Calendar, Wallet, Play, StickyNote, Trash2, History, Gamepad2, MessageSquare, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AppId, WindowState } from '../types/os';

interface TaskbarProps {
  windows: Record<AppId, WindowState>;
  activeApp: AppId | null;
  onAppClick: (id: AppId) => void;
}

const apps: { id: AppId; icon: any; color: string; label: string }[] = [
  { id: 'finder', icon: Folder, color: '#3B82F6', label: 'Finder' },
  { id: 'projects', icon: FileCode, color: '#10B981', label: 'Projects' },
  { id: 'services', icon: MessageSquare, color: '#EC4899', label: 'Services' },
  { id: 'games', icon: Gamepad2, color: '#F59E0B', label: 'Games' },
  { id: 'terminal', icon: Terminal, color: '#00F5FF', label: 'AI Shell' },
  { id: 'youtube', icon: Play, color: '#FF0000', label: 'Music' },
  { id: 'calendar', icon: Calendar, color: '#F87171', label: 'Events' },
  { id: 'wallet', icon: Wallet, color: '#FBBF24', label: 'Payments' },
  { id: 'settings', icon: Settings, color: '#64748B', label: 'Settings' },
];

export default function Taskbar({ windows, activeApp, onAppClick }: TaskbarProps) {
  return (
    <div className="h-20 w-full flex justify-center items-center pb-6 pointer-events-none z-[1000]">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-thin px-4 py-3 rounded-[2.5rem] flex items-center gap-2 pointer-events-auto border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {apps.map((app) => (
          <motion.button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            whileHover={{ y: -15, scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-3 rounded-2xl group transition-all"
          >
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 blur-md transition-opacity"
              style={{ backgroundColor: app.color }}
            />
            <app.icon 
              className="w-6 h-6 transition-all drop-shadow-lg" 
              style={{ color: app.color }} 
            />
            
            {/* Active Indicator */}
            {windows[app.id].isOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_#fff]" />
            )}

            {/* Label Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 glass-dark rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none border-white/5 whitespace-nowrap text-os-accent">
              {app.label}
            </div>
          </motion.button>
        ))}
        
        <div className="w-[1px] h-8 bg-white/10 mx-2" />
        
        <motion.button
            onClick={() => onAppClick('recycle-bin')}
            whileHover={{ y: -15, scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-3 rounded-2xl group transition-all"
          >
            <Trash2 className="w-6 h-6 text-white/30 group-hover:text-white" />
             {windows['recycle-bin'].isOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 glass-dark rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none border-white/5">
              BIN
            </div>
          </motion.button>
      </motion.div>
    </div>
  );
}
