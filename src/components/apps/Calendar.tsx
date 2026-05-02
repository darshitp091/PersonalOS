import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [consultations, setConsultations] = useState<any[]>([]);
  const [calendlyEvents, setCalendlyEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCalendlyEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/calendly/events');
      const contentType = res.headers.get("content-type");
      
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          console.error('Calendly API Error:', data.error);
          return;
        } else {
          const text = await res.text();
          console.error(`Calendly Server Error (${res.status}):`, text.substring(0, 100));
          return;
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error(`Expected JSON for Calendly but got ${contentType}`);
        return;
      }

      const data = await res.json();
      
      if (data.needsConfig) {
        setIsAuthenticated(false);
        setCalendlyEvents([
          {
            id: 'demo-1',
            date: new Date().getDate() + 2,
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            title: 'Discovery Call: AI Automation',
            type: 'busy',
            details: { preferredTime: '10:30 AM', name: 'Potential Client' }
          },
          {
            id: 'demo-2',
            date: new Date().getDate() + 5,
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
            title: 'Project Kickoff: SaaS MVP',
            type: 'busy',
            details: { preferredTime: '02:00 PM', name: 'Acme Corp' }
          }
        ]);
      } else {
        setCalendlyEvents(data.map((e: any) => ({
          id: e.uri,
          date: new Date(e.start_time).getDate(),
          month: new Date(e.start_time).getMonth(),
          year: new Date(e.start_time).getFullYear(),
          title: e.name,
          type: 'busy',
          details: {
            preferredTime: new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            name: e.event_assignments?.[0]?.user_name || 'Meeting'
          }
        })));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch Calendly events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsultations = () => {
    const saved = JSON.parse(localStorage.getItem('consultations') || '[]');
    setConsultations(saved.map((c: any) => ({
      ...c,
      month: new Date().getMonth(), // Assume current month for local forms if date is just a number
      year: new Date().getFullYear()
    })));
  };

  useEffect(() => {
    loadConsultations();
    fetchCalendlyEvents();
    window.addEventListener('consultation_added', loadConsultations);
    return () => window.removeEventListener('consultation_added', loadConsultations);
  }, []);

  const allEvents = [...calendlyEvents, ...consultations].filter(e => 
    e.month === currentDate.getMonth() && e.year === currentDate.getFullYear()
  );

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleAuth = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=500,height=600');
    } catch(e) {
      // Fallback/Demo mode
      setIsAuthenticated(true);
    }
  };

  const openHireMe = () => {
    window.dispatchEvent(new CustomEvent('open_app', { detail: 'services' }));
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setIsAuthenticated(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-os-accent/20 rounded-lg text-os-accent border border-os-accent/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                {currentDate.toLocaleString('default', { month: 'long' })}
              </h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED]/60">{currentDate.getFullYear()}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-white/20 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 flex-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasEvents = allEvents.filter(e => e.date === day);
            
            return (
              <div 
                key={day} 
                className="aspect-square border border-white/5 p-1 relative hover:bg-white/5 rounded-xl transition-all group overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded transition-all",
                    day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() 
                      ? "bg-os-accent text-black" 
                      : "text-white/30"
                  )}>
                    {day < 10 ? `0${day}` : day}
                  </span>
                </div>

                <div className="mt-1 space-y-0.5 max-h-full overflow-hidden">
                  {hasEvents.map(e => (
                    <motion.div 
                      key={e.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "h-1 rounded-full",
                        e.type === 'busy' ? "bg-[#7C3AED]" : "bg-os-accent"
                      )} 
                      title={e.title}
                    />
                  ))}
                </div>
                
                {hasEvents.length > 0 && (
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-os-accent animate-ping" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Tool */}
      <div className="w-80 glass border-l border-white/5 p-6 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3AED] mb-4">Availability</h3>
          <div className="space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-[10px] font-medium text-white/30 leading-relaxed mb-2">
                    Calendly not connected. Add <code className="text-os-accent">CALENDLY_API_KEY</code> to your environment to sync your real schedule.
                  </p>
                </div>
                <button 
                  onClick={fetchCalendlyEvents}
                  className="w-full py-3 glass hover:bg-os-accent hover:text-black border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Sync Calendly
                </button>
                <button 
                  onClick={handleAuth}
                  className="w-full py-3 glass hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all opacity-50"
                >
                  Connect Google
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-os-accent bg-os-accent/10 p-3 rounded-xl border border-os-accent/20">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Calendly Active</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-os-accent">Upcoming Schedule</h3>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{allEvents.length} Tasks</span>
          </div>
          <div className="space-y-3">
            {allEvents.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">No scheduled tasks</p>
              </div>
            ) : (
              allEvents.map(e => (
                <motion.div 
                  layoutId={e.id}
                  key={e.id} 
                  className={cn(
                    "p-4 glass rounded-2xl border transition-all cursor-default relative overflow-hidden group",
                    e.type === 'busy' ? "border-[#7C3AED]/20 hover:border-[#7C3AED]/40" : "border-os-accent/20 hover:border-os-accent/40"
                  )}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED]/40 group-hover:bg-[#7C3AED] transition-colors" />
                  <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">
                    {currentDate.getMonth() + 1}/{e.date} • {e.details?.preferredTime || '10:00 AM'}
                  </div>
                  <div className="text-xs font-bold text-white/90 truncate">{e.title}</div>
                  {e.details?.name && (
                    <div className="text-[9px] text-white/40 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Client: {e.details.name}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openHireMe}
          className="w-full py-4 bg-os-accent text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_10px_30px_rgba(0,245,255,0.2)] hover:shadow-[0_10px_40px_rgba(0,245,255,0.4)] transition-all"
        >
          Book a Consultation
        </motion.button>
      </div>
    </div>
  );
}
