import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Code2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Finder() {
  const [activeTab, setActiveTab] = useState('bio');

  const tabs = [
    { id: 'bio', icon: User, label: 'Biography' },
    { id: 'stack', icon: Code2, label: 'Tech Stack' },
    { id: 'exp', icon: Briefcase, label: 'Experience' },
    { id: 'edu', icon: GraduationCap, label: 'Education' },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 glass border-r border-white/5 flex flex-col p-2 gap-1 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.id 
                ? "bg-os-accent/20 text-os-accent shadow-[0_0_15px_-5px_rgba(0,245,255,0.4)]" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-black/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl"
          >
            {activeTab === 'bio' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-os-accent to-[#7C3AED] p-[1px] shadow-xl">
                    <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-3xl">
                      👨‍💻
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Patel Darshit</h1>
                    <p className="text-os-accent text-sm font-semibold uppercase tracking-widest">Fullstack & AI Architect</p>
                  </div>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Driven Computer Science student and Full-stack Developer specializing in Python, Java, and AI-driven automation. 
                  Expertise in Prompt Engineering and building production-ready SaaS platforms featuring integrated voice and automation capabilities.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 glass text-[10px] uppercase font-bold text-white/40">Available for Freelance</span>
                  <span className="px-2 py-1 glass text-[10px] uppercase font-bold text-os-accent">Surat, Gujarat, India</span>
                </div>
              </div>
            )}

            {activeTab === 'stack' && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#7C3AED] mb-4">Programming & Web</h3>
                  <div className="space-y-2">
                    {['Python / Java / JS', 'Next.js / Next.js 15', 'PostgreSQL', 'Supabase', 'Web Development'].map(s => (
                      <div key={s} className="flex items-center gap-2 text-sm text-white/70 border-b border-white/5 pb-2">
                        <ChevronRight className="w-3 h-3 text-os-accent" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-os-accent mb-4">AI & Core</h3>
                  <div className="space-y-2">
                    {['Prompt Engineering', 'Vertex AI', 'Voice Automation', 'LLM Workflows', 'Machine Learning'].map(s => (
                      <div key={s} className="flex items-center gap-2 text-sm text-white/70 border-b border-white/5 pb-2">
                        <ChevronRight className="w-3 h-3 text-[#7C3AED]" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exp' && (
              <div className="space-y-8">
                {[
                  { company: 'Deloitte Australia', role: 'Technology Consultant (Simulation)', date: 'Remote', desc: 'Engaged in software analysis and problem-solving within a corporate consulting framework. Developed innovative technology-driven solutions.' },
                  { company: 'NIMS University', role: 'B.Tech in Computer Science', date: '2023 - 2027', desc: 'Focused on Full-stack architecture and AI systems development.' },
                ].map((exp, i) => (
                  <div key={i} className="relative pl-6 border-l border-white/10 group">
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-os-accent/40 group-hover:bg-os-accent transition-colors" />
                    <div className="text-os-accent text-[10px] font-bold uppercase tracking-wider mb-1">{exp.date}</div>
                    <h3 className="font-bold text-lg">{exp.role} @ {exp.company}</h3>
                    <p className="text-sm text-white/60 mt-1">{exp.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
