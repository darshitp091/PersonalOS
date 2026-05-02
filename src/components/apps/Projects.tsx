import React, { useState } from 'react';
import { ExternalLink, Github, Filter, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const projects = [
  { 
    id: 1, 
    title: 'Snippets Factory', 
    desc: 'AI-Powered Code Management SaaS utilizing Next.js 15 and Supabase for enterprise-grade snippet organization.', 
    tech: ['Next.js 15', 'Supabase', 'AI Search', 'Razorpay'],
    type: 'SaaS',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    id: 2, 
    title: 'FlowCoach', 
    desc: 'Multi-tenant CRM platform for coaching businesses with advanced RBAC and complex automation workflows.', 
    tech: ['CRM', 'Automation', 'RBAC', 'Razorpay'],
    type: 'Web',
    image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    id: 3, 
    title: 'LinkedAI', 
    desc: 'AI Content Scheduler for LinkedIn featuring AI-driven content creation and automated scheduling.', 
    tech: ['AI Scheduler', 'LLMs', 'Analytics'],
    type: 'AI',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=300&h=200&auto=format&fit=crop'
  },
  { 
    id: 4, 
    title: 'Defence Engine', 
    desc: 'High-Performance Security System utilizing quantum-inspired hashing and AI-powered threat detection.', 
    tech: ['Security', 'Python', 'AI Detection', 'Hashing'],
    type: 'Security',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b63761a9?q=80&w=300&h=200&auto=format&fit=crop'
  }
];

export default function Projects() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? projects : projects.filter(p => p.type === filter);

  return (
    <div className="h-full flex flex-col">
      {/* Header / Filter Toolbar */}
      <div className="h-12 glass border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-os-accent">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Repository</span>
          </div>
          <div className="flex gap-2">
            {['All', 'SaaS', 'Web', 'AI', 'Security'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === f 
                    ? "bg-white text-black shadow-lg" 
                    : "text-white/40 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-white/40">
          <button className="hover:text-os-accent transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="glass relative group overflow-hidden rounded-xl border border-white/5 hover:border-os-accent/30 transition-all duration-300"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-1.5 rounded-lg glass-dark text-white/60 hover:text-white">
                      <Github className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight">{p.title}</h3>
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-os-accent transition-colors" />
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2 mb-4 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((t, tidx) => (
                      <span key={`${p.id}-${t}-${tidx}`} className="text-[9px] font-bold text-os-accent/80 border border-os-accent/20 px-1.5 py-0.5 rounded tracking-wider uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
