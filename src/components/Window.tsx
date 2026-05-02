import React from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { WindowState } from '../types/os';

interface WindowProps {
  key?: React.Key;
  window: WindowState;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

export default function Window({ window: win, isActive, onClose, onMinimize, onFocus, children }: WindowProps) {
  const dragControls = useDragControls();

  if (win.isMinimized) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      onPointerDown={onFocus}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        zIndex: win.zIndex,
        width: win.isMaximized ? '100vw' : '800px',
        height: win.isMaximized ? 'calc(100vh - 32px)' : '550px',
        top: win.isMaximized ? '32px' : 'calc(50% - 275px)',
        left: win.isMaximized ? '0' : 'calc(50% - 400px)',
      }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={cn(
        "absolute rounded-xl overflow-hidden glass shadow-2xl flex flex-col",
        isActive ? "ring-1 ring-os-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" : "opacity-90"
      )}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-slate-800/80 rounded-t-xl border-b border-white/5 flex items-center justify-between px-3 cursor-default select-none group/title"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex gap-2 w-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-500 transition-all shadow-[0_0_8px_rgba(239,68,68,0.4)] flex items-center justify-center group"
          >
            <X className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-4 h-4 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-all shadow-[0_0_8px_rgba(245,158,11,0.4)] flex items-center justify-center group"
          >
            <Minus className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button className="w-4 h-4 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-all shadow-[0_0_8px_rgba(16,185,129,0.4)] flex items-center justify-center group">
            <Maximize2 className="w-2.5 h-2.5 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="text-[11px] font-medium text-slate-400 font-mono tracking-tight">
          {win.title.toLowerCase()}@os — {win.id}.app
        </div>

        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-black/20 backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
}
