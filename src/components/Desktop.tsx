import React from 'react';
import { motion } from 'motion/react';
import { Folder, FileCode, Play, StickyNote, Gamepad2, MessageSquare } from 'lucide-react';
import { AppId } from '../types/os';
import { cn } from '@/src/lib/utils';

interface DesktopProps {
  onIconClick: (id: AppId) => void;
}

const desktopIcons: { id: AppId; icon: any; label: string; color: string }[] = [
  { id: 'finder', icon: Folder, label: 'Resume', color: '#3B82F6' },
  { id: 'projects', icon: FileCode, label: 'Projects', color: '#10B981' },
  { id: 'games', icon: Gamepad2, label: 'Games', color: '#F59E0B' },
  { id: 'services', icon: MessageSquare, label: 'Hire Me', color: '#EC4899' },
  { id: 'youtube', icon: Play, label: 'Music', color: '#FF0000' },
  { id: 'notes', icon: StickyNote, label: 'Journal', color: '#EAB308' },
];

export default function Desktop({ onIconClick }: DesktopProps) {
  return (
    <div className="grid grid-cols-1 auto-rows-max gap-4 w-fit select-none p-4">
      {desktopIcons.map((item) => (
        <motion.button
          key={item.id}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick(item.id);
          }}
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl cursor-default group w-20 outline-none"
        >
          <div 
            className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center relative transition-all duration-300 group-hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] overflow-hidden"
            style={{ 
               backgroundColor: `${item.color}20`,
               border: `1px solid ${item.color}40`
            }}
          >
            <item.icon 
              className="w-7 h-7 drop-shadow-2xl transition-transform group-hover:scale-110 duration-500" 
              style={{ color: item.color }} 
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80 drop-shadow-md text-center">
            {item.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
