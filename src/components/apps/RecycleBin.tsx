import React from 'react';
import { Trash2, RotateCcw, ShieldAlert, History } from 'lucide-react';
import { DeletedItem } from '../../types/os';
import { cn } from '@/src/lib/utils';

interface RecycleBinProps {
  items: DeletedItem[];
  onRestore: (id: string) => void;
  onClear: (id: string) => void;
}

export default function RecycleBin({ items, onRestore, onClear }: RecycleBinProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-12 glass border-b border-white/5 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-white/40">
          <Trash2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Trash Directory</span>
        </div>
        <div className="text-[10px] font-bold text-white/20">
          {items.length} items suspended
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
            <Trash2 className="w-12 h-12" />
            <div className="text-xs font-bold uppercase tracking-widest">Directory Empty</div>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id}
              className="glass p-3 rounded-xl border border-white/5 hover:border-white/10 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-white/40">
                  {item.type === 'chat' ? <History className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/80">{item.name}</div>
                  <div className="text-[10px] text-white/20 uppercase font-bold tracking-wider">Deleted {new Date(item.deletedAt).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onRestore(item.id)}
                  className="p-2 hover:bg-os-accent/20 hover:text-os-accent rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onClear(item.id)}
                  className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"
                  title="Wipe Manually"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-red-500/5 text-red-500/40 text-[10px] flex items-center gap-2 justify-center font-mono select-none">
        <ShieldAlert className="w-3 h-3" />
        Items here occupy system cache. Wipe manually to free up logic sectors.
      </div>
    </div>
  );
}
