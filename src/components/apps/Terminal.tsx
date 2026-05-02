import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { askGemini } from '@/src/lib/gemini';
import { ChatMessage } from '@/src/types/os';
import { cn } from '@/src/lib/utils';

interface TerminalProps {
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onDeleteChat: (id: string) => void;
}

export default function Terminal({ history, setHistory, onDeleteChat }: TerminalProps) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (input.toLowerCase() === 'hack') {
      runMatrixEffect();
      setIsTyping(false);
      return;
    }

    const aiResponse = await askGemini(input, history);
    
    const botMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: aiResponse || "Service unavailable.",
      timestamp: new Date()
    };

    setHistory(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const runMatrixEffect = () => {
    const matrixId = `matrix-${Math.random().toString(36).substr(2, 9)}`;
    setHistory(prev => [...prev, {
      id: matrixId,
      role: 'assistant',
      content: "Unauthorized access detected... Initiating Matrix bypass...",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-full flex flex-col font-mono text-[13px] text-slate-300">
      {/* Console Output */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide bg-black/90"
      >
        <div className="text-slate-500 border-b border-white/5 pb-2 mb-4 text-[11px]">
          darshit@zo-os — zsh — 80×24<br />
          ● System AI initialized (v4.2.1-lts)
        </div>

        {history.map((msg) => (
          <div key={msg.id} className="relative group">
            <div className="flex gap-2">
              <span className={msg.role === 'user' ? "text-cyan-400" : "text-emerald-400"}>
                {msg.role === 'user' ? 'user@zo-os:~$ ' : 'ai@zo-os:~$ '}
              </span>
              <div className={cn(
                "flex-1 whitespace-pre-wrap",
                msg.id.startsWith('matrix') ? "text-emerald-500/60 text-[11px]" : "text-slate-200"
              )}>
                {msg.content}
                {msg.id.startsWith('matrix') && (
                  <div className="mt-2 opacity-50">
                    1010101011110001010101010111100010101010101111000<br/>
                    0101110101011010101110101011010101110101011010101<br/>
                    1110001011010111100010110101111000101101011110001
                  </div>
                )}
              </div>
              <button 
                onClick={() => onDeleteChat(msg.id)}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 text-os-accent animate-pulse">
            <span>ai-agent@os:</span>
            <span className="animate-bounce">...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="h-14 border-t border-white/5 flex items-center px-4 gap-3 glass-dark focus-within:ring-1 focus-within:ring-os-accent/30 transition-all"
      >
        <span className="text-os-accent">❯</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything or type 'help'..."
          className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-white/10"
        />
        <button 
          type="submit"
          className="p-2 hover:text-os-accent transition-all disabled:opacity-50"
          disabled={!input.trim() || isTyping}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
