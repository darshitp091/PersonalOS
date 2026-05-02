import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const bootLines = [
    "Loading darshitOS kernel v1.0.0...",
    "Initializing hardware peripherals...",
    "Mounting creative.partition...",
    "Starting portfolio.daemon...",
    "Connecting to Gemini neural link...",
    "Optimizing glassmorphism engine...",
    "Establishing high-frequency vibe...",
    "Ready."
  ];

  useEffect(() => {
    let currentLine = 0;
    const logInterval = setInterval(() => {
      if (currentLine < bootLines.length) {
        setLogs(prev => [...prev, bootLines[currentLine]]);
        currentLine++;
        setProgress((currentLine / bootLines.length) * 100);
      } else {
        clearInterval(logInterval);
        setTimeout(onComplete, 1000);
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white font-mono p-10 flex flex-col justify-center items-center gap-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[#00F5FF]/80 text-xs sm:text-sm"
      >
        <pre className="leading-tight">
{`
   ____                 _     _ _   ____  ____  
  |  _ \\  __ _ _ __ ___| |__ (_) |_/ __ \\/ ___| 
  | | | |/ _\` | '__/ __| '_ \\| | __| |  | \\___ \\ 
  | |_| | (_| | |  \\__ \\ | | | | |_| |__| |___) |
  |____/ \\__,_|_|  |___/_| |_|_|\\__|\\____/|____/ 
                                                  
`}
        </pre>
      </motion.div>

      <div className="w-[300px] sm:w-[500px] h-full flex flex-col justify-start">
        <div className="flex flex-col gap-1 mb-8 overflow-y-auto max-h-[200px] scrollbar-hide">
          {logs.map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[#00F5FF]/60 text-xs"
            >
              <span className="text-white/20 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </motion.div>
          ))}
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#00F5FF]/40">
            <span>System Booting</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 overflow-hidden">
            <motion.div 
              className="h-full bg-os-accent shadow-[0_0_10px_#00F5FF]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
