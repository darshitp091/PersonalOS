import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Search, MoreVertical, Edit3, Save, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const initialNotes: Note[] = [
  { id: '1', title: 'The Future of AI OS', content: 'In the coming years, human-computer interaction will move away from static buttons to dynamic neural links...', date: 'Apr 22' },
  { id: '2', title: 'Why Glassmorphism?', content: 'Depth and translucency create a sense of space that flat design lacks. It mimics the physical world of glass...', date: 'Apr 20' },
  { id: '3', title: 'Vite vs Webpack', content: 'Speed is everything. Building with Vite has fundamentally changed my development workflow...', date: 'Apr 18' },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('darshit-notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });
  
  const [selectedId, setSelectedId] = useState(notes[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find(n => n.id === selectedId) || notes[0];

  useEffect(() => {
    localStorage.setItem('darshit-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untilted Note',
      content: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setIsEditing(true);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (selectedId === id) {
      setSelectedId(newNotes[0]?.id || '');
    }
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar List */}
      <div className="w-64 glass border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-os-accent font-bold text-xs uppercase tracking-widest">
            <StickyNote className="w-3.5 h-3.5" />
            Notes
          </div>
          <button 
            onClick={addNote}
            className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-os-accent transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-os-accent transition-colors" />
            <input 
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-8 pr-4 text-[10px] focus:outline-none focus:border-white/10 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="p-10 text-center space-y-2 opacity-20">
              <StickyNote className="w-8 h-8 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest">Empty</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="relative group">
                <button
                  onClick={() => { setSelectedId(note.id); setIsEditing(false); }}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all border border-transparent",
                    selectedId === note.id 
                      ? "bg-white/5 border-white/10 shadow-lg text-white" 
                      : "hover:bg-white/5 text-white/40"
                  )}
                >
                  <div className="font-bold text-sm line-clamp-1">{note.title || 'Untitled'}</div>
                  <div className="text-[10px] uppercase font-bold mt-1.5 flex justify-between">
                    <span>{note.date}</span>
                    <span className="opacity-40">{note.content ? note.content.split(/\s+/).filter(Boolean).length : 0} words</span>
                  </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all scale-75"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <AnimatePresence mode="wait">
        {activeNote ? (
          <motion.div 
            key={activeNote.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col font-sans bg-[#FDFCFA] text-black/80"
          >
            <div className="h-12 flex items-center justify-between px-6 border-b border-black/5">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-40">
                <Edit3 className="w-3 h-3" />
                {isEditing ? 'Write View' : 'Read View'}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    isEditing ? "bg-black text-white" : "bg-black/5 hover:bg-black/10"
                  )}
                >
                  {isEditing ? <Check className="w-3 h-3 inline mr-1" /> : <Edit3 className="w-3 h-3 inline mr-1" />}
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto space-y-6">
              {isEditing ? (
                <>
                  <input 
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    placeholder="Note Title"
                    className="w-full text-4xl font-black tracking-tight text-black bg-transparent outline-none border-b-2 border-transparent focus:border-black/5 pb-2 transition-all"
                  />
                  <div className="w-full h-[2px] bg-black/5 rounded-full" />
                  <textarea 
                    autoFocus
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Start writing..."
                    className="w-full h-[calc(100%-80px)] text-lg leading-relaxed font-serif bg-transparent outline-none resize-none pb-20"
                  />
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-black tracking-tight text-black">{activeNote.title || 'Untitled Note'}</h1>
                  <div className="w-16 h-1 bg-black/10 rounded-full" />
                  <p className="text-lg leading-relaxed font-serif whitespace-pre-wrap">
                    {activeNote.content || <span className="opacity-20 italic">No content yet...</span>}
                  </p>
                </>
              )}
            </div>

            <div className="p-6 bg-black/[0.02] border-t border-black/5 text-[10px] font-bold uppercase tracking-widest opacity-30 text-center">
              Modified by darshitOS logic handler • Local Storage Persisted
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 bg-[#FDFCFA] flex items-center justify-center">
            <div className="text-center space-y-4 opacity-10">
               <StickyNote className="w-24 h-24 mx-auto" strokeWidth={1} />
               <p className="text-xs font-black uppercase tracking-[0.4em]">Select a note to view</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
