import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Folder, FileCode, Calendar, Wallet, Music, StickyNote, Trash2, History, Battery, Wifi, Clock, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AppId, WindowState, ChatMessage, DeletedItem } from './types/os';

// --- Components ---
import BootScreen from './components/BootScreen';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Window from './components/Window';
import SnakesLaddersBackground from './components/SnakesLaddersBackground';

// --- App Windows ---
import FinderApp from './components/apps/Finder';
import ProjectsApp from './components/apps/Projects';
import TerminalApp from './components/apps/Terminal';
import CalendarApp from './components/apps/Calendar';
import WalletApp from './components/apps/Wallet';
import YouTubeMusicApp from './components/apps/YouTubeMusic';
import NotesApp from './components/apps/Notes';
import RecycleBinApp from './components/apps/RecycleBin';
import GamesApp from './components/apps/Games';
import ServicesApp from './components/apps/Services';

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [windows, setWindows] = useState<Record<AppId, WindowState>>({
    finder: { id: 'finder', title: 'Finder', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    projects: { id: 'projects', title: 'Projects', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    terminal: { id: 'terminal', title: 'Terminal', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    calendar: { id: 'calendar', title: 'Calendar', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    wallet: { id: 'wallet', title: 'Wallet', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    youtube: { id: 'youtube', title: 'YouTube Music', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    games: { id: 'games', title: 'Arcade Hub', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    services: { id: 'services', title: 'Service Request', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    notes: { id: 'notes', title: 'Notes', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    'recycle-bin': { id: 'recycle-bin', title: 'Recycle Bin', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
    history: { id: 'history', title: 'History', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  });
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [topZ, setTopZ] = useState(10);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recycleBin, setRecycleBin] = useState<DeletedItem[]>([]);

  // Persistent storage simulation
  useEffect(() => {
    const savedChat = localStorage.getItem('os_chat_history');
    if (savedChat) setChatHistory(JSON.parse(savedChat));
    
    const savedBin = localStorage.getItem('os_recycle_bin');
    if (savedBin) setRecycleBin(JSON.parse(savedBin));
  }, []);

  useEffect(() => {
    localStorage.setItem('os_chat_history', JSON.stringify(chatHistory));
    localStorage.setItem('os_recycle_bin', JSON.stringify(recycleBin));
  }, [chatHistory, recycleBin]);

  const toggleWindow = (id: AppId) => {
    setWindows(prev => {
      const next = { ...prev };
      if (!next[id].isOpen) {
        next[id].isOpen = true;
        next[id].isMinimized = false;
        next[id].zIndex = topZ + 1;
        setTopZ(topZ + 1);
        setActiveApp(id);
      } else if (next[id].isMinimized) {
        next[id].isMinimized = false;
        next[id].zIndex = topZ + 1;
        setTopZ(topZ + 1);
        setActiveApp(id);
      } else if (activeApp === id) {
        next[id].isMinimized = true;
        setActiveApp(null);
      } else {
        next[id].zIndex = topZ + 1;
        setTopZ(topZ + 1);
        setActiveApp(id);
      }
      return next;
    });
  };

  const closeWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false }
    }));
    if (activeApp === id) setActiveApp(null);
  };

  const focusWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: topZ + 1 }
    }));
    setTopZ(topZ + 1);
    setActiveApp(id);
  };

  useEffect(() => {
    const handleOpenApp = (e: any) => {
      const appId = e.detail as AppId;
      if (windows[appId]) {
        toggleWindow(appId);
      }
    };
    window.addEventListener('open_app', handleOpenApp);
    return () => window.removeEventListener('open_app', handleOpenApp);
  }, [windows, toggleWindow]);

  if (!isBooted) {
    return <BootScreen onComplete={() => setIsBooted(true)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-os-bg flex flex-col relative font-sans text-slate-200">
      <SnakesLaddersBackground />
      
      {/* Mesh Background Blobs (keeping for extra depth) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-400/5 blur-[150px]"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[150px]"></div>
      </div>

      {/* Menubar */}
      <nav className="h-8 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-[1000]">
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
          <button className="flex items-center gap-2 hover:text-os-accent transition-colors">
            <span className="text-os-accent font-black">Darshit OS v2.0</span>
          </button>
          <div className="flex items-center gap-4 text-white/60">
            <button className="hover:text-white transition-colors">File</button>
            <button className="hover:text-white transition-colors">Edit</button>
            <button className="hover:text-white transition-colors">View</button>
            <button className="hover:text-white transition-colors">Go</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-white/70 px-2 py-0.5 rounded-full hover:bg-white/5 cursor-default transition-all border border-transparent hover:border-white/10">
            <Search className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
            <ClockDisplay />
          </div>
        </div>
      </nav>

      {/* Main Desktop Area */}
      <main className="flex-1 relative p-4" onClick={() => setActiveApp(null)}>
        <Desktop onIconClick={toggleWindow} />
        
        <AnimatePresence>
          {Object.values(windows).map((win: WindowState) => {
            if (!win.isOpen) return null;
            
            return (
              <Window 
                key={win.id}
                window={win}
                isActive={activeApp === win.id}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => toggleWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
              >
                {/* Dynamic App Content Rendering */}
                {win.id === 'finder' && <FinderApp />}
                {win.id === 'projects' && <ProjectsApp />}
                {win.id === 'terminal' && (
                  <TerminalApp 
                    history={chatHistory} 
                    setHistory={setChatHistory} 
                    onDeleteChat={(id) => {
                      const chat = chatHistory.find(c => c.id === id);
                      if (chat) {
                        setRecycleBin(prev => [...prev, {
                          id: chat.id,
                          type: 'chat',
                          name: `Chat Message: ${chat.content.substring(0, 20)}...`,
                          content: chat,
                          deletedAt: new Date()
                        }]);
                        setChatHistory(prev => prev.filter(c => c.id !== id));
                      }
                    }}
                  />
                )}
                {win.id === 'calendar' && <CalendarApp />}
                {win.id === 'wallet' && <WalletApp />}
                {win.id === 'youtube' && <YouTubeMusicApp />}
                {win.id === 'games' && <GamesApp />}
                {win.id === 'services' && <ServicesApp />}
                {win.id === 'notes' && <NotesApp />}
                {win.id === 'recycle-bin' && (
                  <RecycleBinApp 
                    items={recycleBin} 
                    onRestore={(id) => {
                      const item = recycleBin.find(i => i.id === id);
                      if (item && item.type === 'chat') {
                        setChatHistory(prev => [...prev, item.content]);
                        setRecycleBin(prev => prev.filter(i => i.id !== id));
                      }
                    }}
                    onClear={(id) => setRecycleBin(prev => prev.filter(i => i.id !== id))}
                  />
                )}
              </Window>
            );
          })}
        </AnimatePresence>
      </main>

      {/* Taskbar / Dock */}
      <Taskbar 
        windows={windows} 
        activeApp={activeApp} 
        onAppClick={toggleWindow} 
      />
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-xs font-medium tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}
