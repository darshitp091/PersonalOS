import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, User, Briefcase, DollarSign, Clock, MessageSquare, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Services() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Freelance',
    budget: '500-1000',
    timeline: '',
    requirements: '',
    expectations: '',
    availability: '',
    preferredTime: 'Morning',
    preferredDate: new Date().toISOString().split('T')[0],
    company: '',
    urgency: 'Medium',
    goals: '',
    targetAudience: '',
    communication: 'Email',
    referral: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to global consultations list for Calendar integration
    const scheduledDate = new Date(formData.preferredDate);
    const newConsultation = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      title: `${formData.projectType}: ${formData.name}`,
      date: scheduledDate.getDate(),
      month: scheduledDate.getMonth(),
      year: scheduledDate.getFullYear(),
      type: 'busy',
      details: formData
    };

    const existing = JSON.parse(localStorage.getItem('consultations') || '[]');
    localStorage.setItem('consultations', JSON.stringify([...existing, newConsultation]));
    
    // Notify other apps
    window.dispatchEvent(new CustomEvent('consultation_added'));
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar Info */}
      <div className="w-72 glass border-r border-white/5 p-8 flex flex-col gap-10">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-os-accent to-[#7C3AED] bg-clip-text text-transparent">Get In Touch</h2>
          <p className="text-white/40 text-sm mt-2 font-medium">Ready to start your next AI-driven project? Let's connect.</p>
        </div>

        <div className="space-y-6">
          <ContactItem icon={Mail} label="Email" value="darshitp091@gmail.com" color="text-blue-400" />
          <ContactItem icon={Phone} label="Whatsapp" value="+91 92564 51591" color="text-green-400" />
          <ContactItem icon={MapPin} label="Location" value="Surat, Gujarat, India" color="text-red-400" />
        </div>

        <div className="mt-auto p-4 rounded-2xl bg-os-accent/5 border border-os-accent/10">
          <p className="text-[10px] text-os-accent uppercase font-black tracking-[0.2em] mb-1">Availability</p>
          <p className="text-xs text-white/70 font-medium">Accepting custom SaaS and AI automation projects.</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 p-8 overflow-y-auto bg-black/5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto space-y-8 pb-10"
            >
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-os-accent border-b border-os-accent/10 pb-2">Basic Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Full Name" icon={User}>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </InputGroup>
                  <InputGroup label="Email Address" icon={Mail}>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <InputGroup label="Project Type" icon={Briefcase}>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none appearance-none"
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                    >
                      <option className="bg-slate-900">Freelance Project</option>
                      <option className="bg-slate-900">SaaS Development</option>
                      <option className="bg-slate-900">AI Automation</option>
                      <option className="bg-slate-900">Custom Integration</option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Budget" icon={DollarSign}>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none appearance-none"
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    >
                      <option className="bg-slate-900" value="500-1000">$500 - $1k</option>
                      <option className="bg-slate-900" value="1000-5000">$1k - $5k</option>
                      <option className="bg-slate-900" value="5000-10000">$5k - $10k</option>
                      <option className="bg-slate-900" value="10000+">$10k+</option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Project Urgency" icon={Clock}>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none appearance-none"
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    >
                      <option className="bg-slate-900">Low (Just exploring)</option>
                      <option className="bg-slate-900">Medium (Next 1-2 months)</option>
                      <option className="bg-slate-900">High (Need start ASAP)</option>
                    </select>
                  </InputGroup>
                  <InputGroup label="Timeline" icon={Clock}>
                    <input 
                      type="text" 
                      placeholder="2-4 Weeks"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                      onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Company / Product Website" icon={Globe}>
                  <input 
                    type="text" 
                    placeholder="https://yourcompany.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </InputGroup>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-os-accent border-b border-os-accent/10 pb-2">Project Details & Availability</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Preferred Start Date" icon={CalendarIcon}>
                    <input 
                      type="date" 
                      required
                      value={formData.preferredDate}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all [color-scheme:dark]"
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    />
                  </InputGroup>
                  <InputGroup label="Expected Call Time" icon={Clock}>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none appearance-none"
                      onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                    >
                      <option className="bg-slate-900">Morning (9 AM - 12 PM)</option>
                      <option className="bg-slate-900">Afternoon (1 PM - 5 PM)</option>
                      <option className="bg-slate-900">Evening (6 PM - 9 PM)</option>
                    </select>
                  </InputGroup>
                </div>

                <InputGroup label="Days Open for Call / Weekly Availability" icon={CalendarIcon}>
                    <input 
                      type="text" 
                      placeholder="e.g. Mon, Wed, Fri (10am - 4pm EST)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    />
                  </InputGroup>

                <InputGroup label="Expectations & Specific Goals" icon={CheckCircle2}>
                  <textarea 
                    rows={3}
                    placeholder="What specific outcome are you looking for?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all resize-none"
                    onChange={(e) => setFormData({...formData, expectations: e.target.value})}
                  />
                </InputGroup>

                <InputGroup label="Communication Mode" icon={MessageSquare}>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none appearance-none"
                    onChange={(e) => setFormData({...formData, communication: e.target.value})}
                  >
                    <option className="bg-slate-900">Email</option>
                    <option className="bg-slate-900">Slack / Discord</option>
                    <option className="bg-slate-900">Zoom / Meet</option>
                    <option className="bg-slate-900">Local Visit (Surat)</option>
                  </select>
                </InputGroup>

                <InputGroup label="Target Audience / Market Niche" icon={Globe}>
                  <input 
                    type="text" 
                    placeholder="e.g. Real Estate Tech, E-commerce SEO, Crypto Traders"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  />
                </InputGroup>

                <InputGroup label="How did you hear about me?" icon={User}>
                  <input 
                    type="text" 
                    placeholder="GitHub, LinkedIn, Referral, Google Search"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all"
                    onChange={(e) => setFormData({...formData, referral: e.target.value})}
                  />
                </InputGroup>

                <InputGroup label="Core KPIs / Metrics for Success" icon={MessageSquare}>
                  <textarea 
                    rows={2}
                    placeholder="e.g. 20% increase in lead conversion, reduced server latency..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all resize-none"
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  />
                </InputGroup>

                <InputGroup label="Project Brief & Requirements" icon={MessageSquare}>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell me about your project, target audience, and specific requirements..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-os-accent outline-none transition-all resize-none"
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  />
                </InputGroup>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-5 bg-os-accent text-black font-black uppercase tracking-[0.3em] rounded-xl shadow-[0_0_30px_rgba(0,245,255,0.2)] flex items-center justify-center gap-2 text-sm group"
              >
                Launch Request <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </motion.button>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-20 h-20 bg-os-accent/20 rounded-full flex items-center justify-center border border-os-accent/30 mb-2">
                <CheckCircle2 className="w-10 h-10 text-os-accent" />
              </div>
              <h3 className="text-3xl font-bold italic tracking-tight">Request Received!</h3>
              <p className="text-white/50 max-w-sm">
                Thanks, {formData.name}! I've received your request for the {formData.projectType} project. I'll get back to you at {formData.email} within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 glass rounded-full text-xs font-bold uppercase tracking-widest text-os-accent"
              >
                Send Another
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={cn("w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">{label}</p>
        <p className="text-sm font-medium text-white/80">{value}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
        <Icon className="w-3 h-3" /> {label}
      </label>
      {children}
    </div>
  );
}
