import React from 'react';
import { History as HistoryIcon, Search, Download, Trash2, Clock } from 'lucide-react';
import { ChatMessage } from '../../types/os';
import { cn } from '@/src/lib/utils';

export default function History() {
  const [search, setSearch] = React.useState('');
  
  // Real history would be passed via props, but let's mock the viewer experience
  const mockHistory: ChatMessage[] = [
    { id: '1', role: 'user', content: 'How do I hire you?', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', role: 'assistant', content: 'You can use the Wallet.app to process a freelance deposit...', timestamp: new Date(Date.now() - 3500000) },
    { id: '3', role: 'user', content: 'Can you show me your projects?', timestamp: new Date(Date.now() - 7200000) },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="h-14 glass border-b border-white/5 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2 text-os-accent font-bold text-xs uppercase tracking-widest">
          <HistoryIcon className="w-4 h-4" />
          Log Viewer
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search neural logs..."
            className="w-full h-8 bg-white/5 rounded-lg pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-os-accent/30 transition-all placeholder:text-white/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><Download className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/10">
          <Clock className="w-3 h-3" />
          Neural Session: {new Date().toLocaleDateString()}
        </div>

        <div className="space-y-4">
          {mockHistory.map((log) => (
            <div key={log.id} className="relative pl-6 border-l border-white/5 group">
              <div className="absolute left-[-4px] top-1 w-2 h-2 rounded-full bg-white/10 group-hover:bg-os-accent transition-colors" />
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  log.role === 'user' ? "text-[#7C3AED]" : "text-os-accent"
                )}>
                  {log.role === 'user' ? 'Direct Input' : 'AI Response'}
                </span>
                <span className="text-[10px] text-white/10 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-white/60 line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                {log.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 glass text-[10px] font-mono text-white/20 text-center tracking-tighter uppercase">
        End of session • Neural data encryption active (AES-256)
      </div>
    </div>
  );
}
