import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Repeat, Shuffle, Youtube, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface YTTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // seconds
}

export default function YouTubeMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks, setTracks] = useState<YTTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<{ title: string; message: string; action?: string; link?: string } | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTrack = tracks[currentIndex];

  const handleAuth = async () => {
    setApiError(null);
    const res = await fetch('/api/auth/google/url');
    const { url } = await res.json();
    window.open(url, 'google_auth', 'width=500,height=600');
  };

  const exchangeToken = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const tokens = await res.json();
      if (tokens.access_token) {
        localStorage.setItem('yt_access_token', tokens.access_token);
        fetchLibrary(tokens.access_token);
      }
    } catch (err) {
      console.error("Token exchange failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLibrary = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/youtube/library', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        } else {
          const errorText = await res.text();
          throw new Error(`Server error (${res.status}): ${errorText.substring(0, 100)}`);
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON but received ${contentType}: ${text.substring(0, 100)}`);
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.error("Expected array from YouTube API but got:", data);
        setTracks([]);
        setIsAuthenticated(true);
        return;
      }
      
      const formattedTracks = data.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url,
        duration: parseISO8601Duration(item.contentDetails.duration)
      }));
      
      setTracks(formattedTracks);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Fetch failed:", err.message);
      
      const errorMessage = err.message.toLowerCase();
      
      // Categorize Errors
      if (errorMessage.includes('quota')) {
        setDetailedError({
          title: "Daily Limit Reached",
          message: "The YouTube API quota for this project has been exceeded. This resets every 24 hours.",
          action: "Increase Quota",
          link: "https://console.cloud.google.com/apis/enabled"
        });
      } else if (errorMessage.includes('has not been used') || errorMessage.includes('disabled')) {
        setDetailedError({
          title: "API Not Enabled",
          message: "The YouTube Data API is disabled in your Google Cloud Project. It must be enabled to fetch your library.",
          action: "Enable API Now",
          link: "https://console.developers.google.com/apis/api/youtube.googleapis.com/overview"
        });
      } else if (errorMessage.includes('401') || errorMessage.includes('invalid') || errorMessage.includes('token')) {
        localStorage.removeItem('yt_access_token');
        setIsAuthenticated(false);
        setApiError("Your session has expired. Please sign in again.");
      } else {
        setApiError(err.message || "An unexpected error occurred while connecting to YouTube.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseISO8601Duration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        exchangeToken(e.data.code);
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Check for existing token
    const token = localStorage.getItem('yt_access_token');
    if (token) fetchLibrary(token);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isPlaying && currentTrack && currentTime < currentTrack.duration) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (currentTime >= (currentTrack?.duration || 0) && isPlaying) {
        handleNext();
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentTime, currentTrack]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
      {!isAuthenticated || detailedError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all duration-500",
            detailedError ? "bg-amber-500 shadow-amber-500/20" : "bg-red-600 shadow-red-600/40"
          )}>
            <Youtube className="w-10 h-10 text-white" />
          </div>
          
          <div className="max-w-sm">
            <h2 className="text-2xl font-bold">{detailedError ? detailedError.title : "YouTube Music"}</h2>
            
            {detailedError ? (
              <div className="mt-4 space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">{detailedError.message}</p>
                <div className="flex flex-col gap-2">
                  {detailedError.link && (
                    <button 
                      onClick={() => window.open(detailedError.link, '_blank')}
                      className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg text-xs"
                    >
                      {detailedError.action}
                    </button>
                  )}
                  <button 
                    onClick={() => { setDetailedError(null); fetchLibrary(localStorage.getItem('yt_access_token') || ''); }}
                    className="w-full py-3 bg-white/5 text-slate-400 font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all text-xs"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400 mt-2">Access your YouTube music library directly from ZoOS.</p>
                {apiError && <p className="mt-4 text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{apiError}</p>}
                <button 
                  onClick={handleAuth}
                  className="mt-8 px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl"
                >
                  Connect Account
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative h-full">
          {/* Main Player Display */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="flex flex-col items-center space-y-8 max-w-lg mx-auto">
              <div className="relative group">
                <motion.div 
                  key={currentTrack?.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                  <img 
                    src={currentTrack?.thumbnail} 
                    alt="Album Art" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent text-white" />
                </motion.div>
                <button 
                  onClick={() => setShowQueue(!showQueue)}
                  className="absolute -right-4 -top-4 w-10 h-10 glass-dark rounded-full flex items-center justify-center hover:text-red-500 transition-colors"
                >
                  <ListMusic className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight line-clamp-2">{currentTrack?.title}</h1>
                <p className="text-red-500 font-semibold">{currentTrack?.artist}</p>
              </div>

              {/* Mini List View */}
              <AnimatePresence>
                {showQueue && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full space-y-1 border-t border-white/5 pt-4"
                  >
                    {tracks.map((track, idx) => (
                      <button
                        key={`${track.id}-${idx}`}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setCurrentTime(0);
                          setIsPlaying(true);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors group text-left",
                          currentIndex === idx ? "bg-white/5" : "hover:bg-white/5"
                        )}
                      >
                        <img src={track.thumbnail} className="w-10 h-10 rounded object-cover" alt="" />
                        <div className="flex-1 overflow-hidden">
                          <div className={cn("text-sm font-medium truncate", currentIndex === idx ? "text-red-500" : "text-white")}>
                            {track.title}
                          </div>
                          <div className="text-xs text-white/40 truncate">{track.artist}</div>
                        </div>
                        {currentIndex === idx && isPlaying && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-36 glass-dark border-t border-white/10 p-6 flex flex-col justify-between">
            <div className="w-full">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack?.duration || 0)}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative group cursor-pointer">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 text-slate-400 w-1/4">
                <Shuffle className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                <Repeat className="w-4 h-4 hover:text-red-500 cursor-pointer" />
              </div>

              <div className="flex items-center gap-6">
                <SkipBack onClick={handlePrev} className="w-6 h-6 text-white hover:text-red-500 cursor-pointer transition-colors" />
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                </button>
                <SkipForward onClick={handleNext} className="w-6 h-6 text-white hover:text-red-500 cursor-pointer transition-colors" />
              </div>

              <div className="flex items-center gap-3 text-slate-400 w-1/4 justify-end">
                <Volume2 className="w-4 h-4" />
                <div className="w-20 h-1 bg-white/10 rounded-full group cursor-pointer relative">
                  <div className="w-3/4 h-full bg-red-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
