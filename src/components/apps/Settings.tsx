import React, { useRef, useState } from 'react';
import { 
  Settings as SettingsIcon, Moon, Sun, Monitor, Palette, 
  Image as ImageIcon, Sliders, ChevronRight, Check, Upload,
  Info, Cpu, HardDrive, RefreshCcw, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useSettings, WallpaperType } from '@/src/lib/SettingsContext';

const GRADIENTS = [
  { name: 'Midnight', value: 'from-os-bg to-black' },
  { name: 'Deep Space', value: 'from-slate-900 to-black' },
  { name: 'Purple Haze', value: 'from-purple-900/40 to-black' },
  { name: 'Oceanic', value: 'from-cyan-900/40 to-black' },
  { name: 'Forest', value: 'from-emerald-900/40 to-black' },
  { name: 'Mars', value: 'from-red-900/40 to-black' },
];

const COLORS = [
  { name: 'Default', value: '#0F172A' },
  { name: 'Deep Gray', value: '#1A1A1A' },
  { name: 'Pure Black', value: '#000000' },
  { name: 'Navy', value: '#020617' },
  { name: 'Burgundy', value: '#1A0505' },
];

type SettingsTab = 'appearance' | 'personalization' | 'system';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleWallpaperChange = (type: WallpaperType, value: string) => {
    updateSettings({ wallpaper: { type, value } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleWallpaperChange('image', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetOS = () => {
    if (confirm('Are you sure you want to reset all settings and cache? This will reload the OS.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const sidebarItems = [
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Monitor },
    { id: 'personalization' as SettingsTab, label: 'Personalization', icon: Palette },
    { id: 'system' as SettingsTab, label: 'System', icon: Sliders },
  ];

  return (
    <div className="h-full flex overflow-hidden bg-black/20 backdrop-blur-md text-white/90">
      {/* Sidebar */}
      <div className="w-48 border-r border-white/5 flex flex-col p-4 gap-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-2 select-none">Settings</div>
        
        {sidebarItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border group select-none relative overflow-hidden",
              activeTab === item.id 
                ? "bg-white/10 border-white/10 text-os-accent shadow-lg" 
                : "hover:bg-white/5 text-white/40 border-transparent hover:text-white/60"
            )}
          >
            <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-os-accent" : "text-inherit")} />
            {item.label}
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-pill"
                className="absolute right-0 w-1 h-4 bg-os-accent rounded-l-full"
              />
            )}
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-3xl space-y-12"
          >
            {activeTab === 'appearance' && (
              <section className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">Appearance</h2>
                  <p className="text-xs text-white/30 font-medium">Control the visual identity of your workstation.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dark Mode Toggle */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-os-accent/10 flex items-center justify-center">
                          {settings.darkMode ? <Moon className="w-5 h-5 text-os-accent" /> : <Sun className="w-5 h-5 text-os-accent" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold">Dark Mode</div>
                          <div className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Active UI Theme</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                          settings.darkMode ? "bg-os-accent shadow-[0_0_15px_-3px_var(--color-os-accent)]" : "bg-white/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: settings.darkMode ? 24 : 0 }}
                          className="w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Intensity Slider */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-os-accent/10 flex items-center justify-center text-os-accent">
                        <Zap className={cn("w-5 h-5", settings.bgIntensity > 50 ? "animate-pulse" : "")} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">FX Intensity</div>
                        <div className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Global Motion Blur</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={settings.bgIntensity}
                        onChange={(e) => updateSettings({ bgIntensity: parseInt(e.target.value) })}
                        className="w-full accent-os-accent cursor-pointer h-1 bg-white/10 rounded-full appearance-none outline-none"
                      />
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                        <span>Static</span>
                        <span>Hyper</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Feedback Preview */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 flex flex-col items-center justify-center gap-4 group">
                  <div className="w-full h-24 rounded-lg bg-os-accent/5 border border-white/5 relative overflow-hidden flex items-center justify-center">
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.2, 1],
                         rotate: [0, 45, 0],
                         opacity: [0.1, settings.bgIntensity / 100, 0.1]
                       }}
                       transition={{ duration: 4, repeat: Infinity }}
                       className="w-32 h-32 bg-os-accent rounded-full blur-3xl opacity-20"
                    />
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] opacity-20">Live Preview</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/20 text-center uppercase tracking-widest leading-relaxed">
                    Visual effects are rendered in real-time<br/>using the snakes-ladders engine.
                  </p>
                </div>
              </section>
            )}

            {activeTab === 'personalization' && (
              <section className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    Personalization
                  </h2>
                  <p className="text-xs text-white/30 font-medium">Define your environment with curated aesthetics.</p>
                </div>

                <div className="space-y-10">
                  {/* Gradients */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Palette className="w-3.5 h-3.5 text-os-accent" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Premium Gradients</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {GRADIENTS.map((g) => (
                        <button 
                          key={g.value}
                          onClick={() => handleWallpaperChange('gradient', g.value)}
                          className={cn(
                            "group relative h-24 rounded-2xl transition-all border-2 overflow-hidden",
                            settings.wallpaper.type === 'gradient' && settings.wallpaper.value === g.value 
                              ? "border-os-accent ring-4 ring-os-accent/10" 
                              : "border-transparent hover:border-white/20"
                          )}
                        >
                          <div className={cn("absolute inset-0 bg-gradient-to-br", g.value)} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest">{g.name}</span>
                          </div>
                          {settings.wallpaper.type === 'gradient' && settings.wallpaper.value === g.value && (
                            <div className="absolute top-2 right-2 bg-os-accent rounded-full p-0.5 shadow-lg">
                              <Check className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solid Colors */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Palette className="w-3.5 h-3.5 text-os-accent" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Minimalist Colors</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {COLORS.map((c) => (
                        <button 
                          key={c.value}
                          onClick={() => handleWallpaperChange('color', c.value)}
                          className={cn(
                            "w-14 h-14 rounded-full transition-all border-2 flex items-center justify-center hover:scale-110",
                            settings.wallpaper.type === 'color' && settings.wallpaper.value === c.value 
                              ? "border-os-accent ring-4 ring-os-accent/10" 
                              : "border-transparent hover:border-white/20"
                          )}
                          style={{ backgroundColor: c.value }}
                        >
                          {settings.wallpaper.type === 'color' && settings.wallpaper.value === c.value && (
                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Image Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <ImageIcon className="w-3.5 h-3.5 text-os-accent" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Custom Layer</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-48 h-28 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-os-accent transition-all group"
                      >
                        <Upload className="w-6 h-6 text-white/20 group-hover:text-os-accent transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-white/20">Inject Module</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                      
                      {settings.wallpaper.type === 'image' && (
                        <div className="h-28 w-48 rounded-2xl border-2 border-os-accent overflow-hidden relative group">
                          <img src={settings.wallpaper.value} className="w-full h-full object-cover" alt="Custom wallpaper" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="w-8 h-8 text-os-accent" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'system' && (
              <section className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">System Information</h2>
                  <p className="text-xs text-white/30 font-medium">Architecture monitoring and environment control.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* OS Info Card */}
                  <div className="bg-white/5 rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <SettingsIcon className="w-40 h-40" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-os-accent flex items-center justify-center shadow-[0_0_20px_-5px_var(--color-os-accent)]">
                          <Zap className="w-8 h-8 text-black" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Darshit OS</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-os-accent">Version 2.0.4 - "Lightning"</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white/40">
                             <Cpu className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Processor</span>
                          </div>
                          <p className="text-xs font-bold">Gemini-3-Flash Neural Engine</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white/40">
                             <Monitor className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Live Deployment</span>
                          </div>
                          <p className="text-xs font-bold text-os-accent truncate">personal-os-bice.vercel.app</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white/40">
                             <HardDrive className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Storage</span>
                          </div>
                          <p className="text-xs font-bold">Local Persistence Layer (Active)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-os-accent" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Terminal Operations</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                         onClick={() => alert('Checking for updates... All modules are at current HEAD.')}
                         className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-xl text-xs font-bold transition-all"
                       >
                         <RefreshCcw className="w-4 h-4" />
                         Check for Updates
                       </button>
                       <button 
                         onClick={resetOS}
                         className="flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 p-4 rounded-xl text-xs font-bold text-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                       >
                         <RefreshCcw className="w-4 h-4" />
                         Reset Environment
                       </button>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4 border-t border-white/5">
                     <div className="flex items-center gap-2">
                       <Info className="w-3.5 h-3.5 text-os-accent" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Legal & Credits</span>
                    </div>
                    <div className="text-[10px] text-white/20 font-medium leading-relaxed max-w-lg">
                      Darshit OS is a conceptual interface designed for high-performance portfolio browsing. Created with React 19, Vite, and Motion. Built by Darshit Patel. 2026 All rights Reserved.
                    </div>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
