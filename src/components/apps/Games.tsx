import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Trophy, RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

type GameType = 'snake' | 'flappy' | 'none';

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameType>('none');

  return (
    <div className="h-full flex flex-col bg-black/20">
      <div className="h-12 glass border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-os-accent">
          <Gamepad2 className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Arcade Hub</span>
        </div>
        {activeGame !== 'none' && (
          <button 
            onClick={() => setActiveGame('none')}
            className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white"
          >
            Exit Game
          </button>
        )}
      </div>

      <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden">
        {activeGame === 'none' ? (
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <GameCard 
              title="Snake.js" 
              icon="🐍" 
              color="from-green-500/20 to-emerald-500/10" 
              onClick={() => setActiveGame('snake')} 
            />
            <GameCard 
              title="FlappyOS" 
              icon="🐦" 
              color="from-yellow-500/20 to-orange-500/10" 
              onClick={() => setActiveGame('flappy')} 
            />
          </div>
        ) : (
          <div className="w-full h-full max-w-xl mx-auto glass rounded-2xl overflow-hidden border border-white/10 relative">
             {activeGame === 'snake' && <SnakeGame />}
             {activeGame === 'flappy' && <FlappyGame />}
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ title, icon, color, onClick }: { title: string; icon: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl bg-gradient-to-br border border-white/5 flex flex-col items-center justify-center gap-4 group",
        color
      )}
    >
      <div className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all">
        {icon}
      </div>
      <span className="font-bold tracking-tight text-white/80">{title}</span>
    </motion.button>
  );
}

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snake-best') || 0));
  const [dims, setDims] = useState({ width: 400, height: 400, gridSize: 20 });
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver'>('ready');

  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 5, y: 5 },
    dx: 1,
    dy: 0,
    nextDx: 1,
    nextDy: 0,
    lastUpdate: 0,
    speed: 100 // ms per move
  });

  // Responsive Scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const size = Math.min(width - 40, height - 100, 400);
        const gridSize = Math.floor(size / 20);
        setDims({ width: size, height: size, gridSize });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const loop = (timestamp: number) => {
      const s = state.current;
      
      if (gameState === 'playing') {
        if (timestamp - s.lastUpdate > s.speed) {
          s.lastUpdate = timestamp;
          s.dx = s.nextDx;
          s.dy = s.nextDy;

          const head = { x: s.snake[0].x + s.dx, y: s.snake[0].y + s.dy };
          const tileCount = 20;

          // Collision
          if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || 
              s.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
              setGameState('gameOver');
              setGameOver(true);
              return;
          }

          s.snake.unshift(head);

          if (head.x === s.food.x && head.y === s.food.y) {
            setScore(sc => sc + 10);
            s.food = {
              x: Math.floor(Math.random() * tileCount),
              y: Math.floor(Math.random() * tileCount)
            };
            s.speed = Math.max(50, s.speed - 1); // Speed up slightly
          } else {
            s.snake.pop();
          }
        }
      }

      // Draw
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, dims.width, dims.height);

      // Grid
      ctx.strokeStyle = '#ffffff05';
      ctx.lineWidth = 1;
      for(let i=0; i<20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * dims.gridSize, 0);
        ctx.lineTo(i * dims.gridSize, dims.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * dims.gridSize);
        ctx.lineTo(dims.width, i * dims.gridSize);
        ctx.stroke();
      }

      // Snake
      s.snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#10B981' : '#059669';
        const padding = 2;
        ctx.fillRect(
          segment.x * dims.gridSize + padding, 
          segment.y * dims.gridSize + padding, 
          dims.gridSize - padding * 2, 
          dims.gridSize - padding * 2
        );
      });

      // Food
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(
        s.food.x * dims.gridSize + dims.gridSize / 2,
        s.food.y * dims.gridSize + dims.gridSize / 2,
        dims.gridSize / 3,
        0, Math.PI * 2
      );
      ctx.fill();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, dims]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      
      if (e.key === 'ArrowUp' && s.dy === 0) { s.nextDx = 0; s.nextDy = -1; }
      if (e.key === 'ArrowDown' && s.dy === 0) { s.nextDx = 0; s.nextDy = 1; }
      if (e.key === 'ArrowLeft' && s.dx === 0) { s.nextDx = -1; s.nextDy = 0; }
      if (e.key === 'ArrowRight' && s.dx === 0) { s.nextDx = 1; s.nextDy = 0; }
      
      if (e.key === ' ' && gameState !== 'playing') reset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const reset = () => {
    state.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 5, y: 5 },
      dx: 1, dy: 0, nextDx: 1, nextDy: 0,
      lastUpdate: 0,
      speed: 100
    };
    setScore(0);
    setGameOver(false);
    setGameState('playing');
  };

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-best', score.toString());
    }
  }, [score, highScore]);

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center h-full gap-4 bg-[#0a0a0a] select-none">
      <div className="flex justify-between w-full max-w-[400px] px-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Score</span>
          <div className="text-os-accent font-black text-xl">{score}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">High Score</span>
          <div className="text-white/60 font-black text-xl">{highScore}</div>
        </div>
      </div>
      
      <div className="relative group">
        <canvas 
          ref={canvasRef} 
          width={dims.width} 
          height={dims.height} 
          className="rounded-2xl border border-white/5 shadow-2xl"
        />
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-[2px]">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              className="w-16 h-16 bg-os-accent rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(var(--os-accent-rgb),0.3)]"
            >
              <Play className="w-8 h-8 fill-current" />
            </motion.button>
            <p className="mt-6 text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Press Space to Start</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-2xl z-20">
            <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">Game Over</h3>
            <p className="text-os-accent font-bold mb-8">Score: {score}</p>
            <button 
              onClick={reset}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-os-accent transition-colors uppercase text-xs tracking-widest"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-2 opacity-20 group-hover:opacity-100 transition-opacity">
        <div />
        <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white text-xs">↑</div>
        <div />
        <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white text-xs">←</div>
        <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white text-xs">↓</div>
        <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white text-xs">→</div>
      </div>
    </div>
  );
}


function FlappyGame() {
  const [scoreVal, setScoreVal] = useState(0);
  const scoreRef = useRef(0);
  const [gameStateVal, setGameStateVal] = useState(0); // 0: ready, 1: play, 2: gameOver
  const gameStateRef = useRef(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLImageElement | null>(null);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('flappy-best') || 0));
  const [dims, setDims] = useState({ width: 320, height: 480 });

  useEffect(() => {
    gameStateRef.current = gameStateVal;
  }, [gameStateVal]);

  useEffect(() => {
    scoreRef.current = scoreVal;
  }, [scoreVal]);

  // Game state held in ref for the 60fps loop
  const state = useRef({
    frame: 0,
    shake: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    bird: {
      animation: [
        { imgX: 276, imgY: 112 },
        { imgX: 276, imgY: 139 },
        { imgX: 276, imgY: 164 },
        { imgX: 276, imgY: 139 }
      ],
      fr: 0,
      x: 50,
      y: 150,
      w: 34,
      h: 24,
      r: 12,
      fly: 4.8,
      gravity: 0.22,
      velocity: 0,
      rotation: 0
    },
    bg: { imgX: 0, imgY: 0, width: 275, height: 226, x: 0, y: 0, w: 275, h: 226, dx: 0.15 },
    clouds: { x: 0, dx: 0.1 },
    pipes: {
      top: { imgX: 553, imgY: 0 },
      bot: { imgX: 502, imgY: 0 },
      width: 52,
      height: 400,
      w: 52,
      h: 400,
      gap: 130,
      dx: 2,
      freq: 100, // frame frequency
      minY: -320,
      maxY: -100,
      pipeGenerator: [] as { x: number; y: number; passed?: boolean }[]
    },
    ground: { imgX: 276, imgY: 0, width: 224, height: 112, x: 0, y: 0, w: 224, h: 112, dx: 1.8 },
    map: [
      { imgX: 496, imgY: 60, width: 12, height: 18 },
      { imgX: 135, imgY: 455, width: 10, height: 18 },
      { imgX: 292, imgY: 160, width: 12, height: 18 },
      { imgX: 306, imgY: 160, width: 12, height: 18 },
      { imgX: 320, imgY: 160, width: 12, height: 18 },
      { imgX: 334, imgY: 160, width: 12, height: 18 },
      { imgX: 292, imgY: 184, width: 12, height: 18 },
      { imgX: 306, imgY: 184, width: 12, height: 18 },
      { imgX: 320, imgY: 184, width: 12, height: 18 },
      { imgX: 334, imgY: 184, width: 12, height: 18 }
    ],
    getReady: { imgX: 0, imgY: 228, width: 173, height: 152, x: 0, y: 80, w: 173, h: 152 },
    gameOver: { imgX: 175, imgY: 228, width: 225, height: 202, x: 0, y: 90, w: 225, h: 202 }
  });

  const setDifficultyParams = (diff: typeof difficulty) => {
    const s = state.current.pipes;
    if (diff === 'easy') {
      s.gap = 160;
      s.dx = 1.6;
      s.freq = 120;
    } else if (diff === 'medium') {
      s.gap = 130;
      s.dx = 2.2;
      s.freq = 95;
    } else {
      s.gap = 110;
      s.dx = 2.8;
      s.freq = 75;
    }
  };

  // Dynamic resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // Adjust width based on height to keep a good portrait ratio but allow more room
        const targetWidth = Math.min(width - 40, height * 0.7, 500); 
        setDims({ width: targetWidth, height: height });
        
        // Update positions based on new dimensions
        const s = state.current;
        const groundY = height - 112;
        s.bg.y = height - 226 - 112;
        s.ground.y = groundY;
        s.pipes.maxY = groundY - s.pipes.h - s.pipes.gap - 30; // Leave 30px buffer above ground
        s.pipes.minY = -s.pipes.h + 50; // Leave 50px buffer at ceiling
        s.getReady.x = targetWidth / 2 - s.getReady.w / 2;
        s.gameOver.x = targetWidth / 2 - s.gameOver.w / 2;
        s.bird.x = targetWidth * 0.3; // Bird slightly more to the left
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [dims.height]);

  const jump = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    const s = state.current;
    if (gameStateRef.current === 0) {
      setDifficultyParams(difficulty);
      s.frame = 1;
      s.score = 0;
      s.pipes.pipeGenerator = [];
      s.bird.y = dims.height / 2;
      s.bird.velocity = -s.bird.fly;
      setGameStateVal(1);
      setScoreVal(0);
    } else if (gameStateRef.current === 1) {
      if (s.bird.y > -20) {
        s.bird.velocity = -s.bird.fly;
        // Spark particles on jump
        for(let i=0; i<3; i++) {
          s.particles.push({
            x: s.bird.x,
            y: s.bird.y,
            vx: -Math.random() * 2,
            vy: Math.random() * 2 - 1,
            life: 40,
            color: '#fff'
          });
        }
      }
    } else if (gameStateRef.current === 2) {
      s.pipes.pipeGenerator = [];
      s.bird.y = dims.height / 2;
      s.bird.velocity = 0;
      s.bird.rotation = 0;
      s.frame = 0;
      setScoreVal(0);
      setGameStateVal(0);
    }
  };

  const dive = () => {
    const s = state.current;
    if (gameStateRef.current === 1) {
      s.bird.velocity = s.bird.fly * 1.3; // Quick descent
    }
  };

  const spawnImpact = (x: number, y: number, s: any) => {
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30 + Math.random() * 20,
        color: i % 2 === 0 ? '#ef4444' : '#fff'
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const sprite = new Image();
    sprite.crossOrigin = "anonymous";
    sprite.onload = () => setAssetsLoaded(true);
    sprite.onerror = () => setAssetsLoaded(true);
    sprite.src = 'https://raw.githubusercontent.com/Code-Explained/Flappy-Bird-JavaScript/master/img/sprite.png';
    spriteRef.current = sprite;

    let animationId: number;

    const loop = () => {
      const gState = gameStateRef.current;
      const s = state.current;
      const img = spriteRef.current;
      const loaded = (img && img.complete && img.naturalWidth !== 0);

      // UPDATE
      if (s.shake > 0) s.shake--;

      // Update Particles
      s.particles = s.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
      });

      if (gState === 0) {
        if (s.frame % 15 === 0) s.bird.fr = (s.bird.fr + 1) % 4;
        s.bg.x = (s.bg.x - s.bg.dx) % s.bg.w;
        s.clouds.x = (s.clouds.x - s.clouds.dx) % s.bg.w;
        s.ground.x = (s.ground.x - s.ground.dx) % (s.ground.w / 2);
        s.bird.y = (dims.height / 2) + Math.sin(s.frame / 10) * 10;
      } else {
        if (s.frame % 5 === 0) s.bird.fr = (s.bird.fr + 1) % 4;

        if (gState === 1) {
          s.bird.velocity += s.bird.gravity;
          s.bird.y += s.bird.velocity;

          // Smoother rotation
          const targetRotation = s.bird.velocity <= s.bird.fly ? -25 * (Math.PI / 180) : 90 * (Math.PI / 180);
          s.bird.rotation += (targetRotation - s.bird.rotation) * 0.1;
          
          if (s.bird.rotation > 90 * (Math.PI / 180)) s.bird.rotation = 90 * (Math.PI / 180);

          // Ground collision
          const groundY = dims.height - s.ground.h;
          if (s.bird.y + s.bird.h / 2 >= groundY) {
            s.bird.y = groundY - s.bird.h / 2;
            s.shake = 15;
            spawnImpact(s.bird.x, s.bird.y, s);
            setGameStateVal(2);
          }

          // Ceiling collision
          if (s.bird.y - s.bird.h / 2 <= -50) { // Fatal ceiling
             s.shake = 15;
             spawnImpact(s.bird.x, s.bird.y, s);
             setGameStateVal(2);
          } else if (s.bird.y - s.bird.h / 2 <= 0) { // Soft ceiling bounce
            s.bird.y = s.bird.h / 2;
            s.bird.velocity = Math.max(s.bird.velocity, 0);
          }

          s.bg.x = (s.bg.x - s.bg.dx) % s.bg.w;
          s.clouds.x = (s.clouds.x - s.clouds.dx) % s.bg.w;
          s.ground.x = (s.ground.x - s.ground.dx) % (s.ground.w / 2);

          if (s.frame % s.pipes.freq === 0) {
            s.pipes.pipeGenerator.push({
              x: dims.width,
              y: Math.floor(Math.random() * (s.pipes.maxY - s.pipes.minY + 1)) + s.pipes.minY,
              passed: false
            });
          }

          for (let i = 0; i < s.pipes.pipeGenerator.length; i++) {
            let p = s.pipes.pipeGenerator[i];
            p.x -= s.pipes.dx;

            let bX = s.bird.x;
            let bY = s.bird.y;
            let bR = s.bird.r - 2; // Precise collision

            let pLeft = p.x;
            let pRight = p.x + s.pipes.w;
            let pTopHeight = s.pipes.h;
            let pGapTop = p.y + pTopHeight;
            let pGapBottom = pGapTop + s.pipes.gap;

            // Check top pipe collision
            if (bX + bR > pLeft && bX - bR < pRight && bY - bR < pGapTop) {
              s.shake = 15;
              spawnImpact(bX, bY, s);
              setGameStateVal(2);
            }
            // Check bottom pipe collision
            if (bX + bR > pLeft && bX - bR < pRight && bY + bR > pGapBottom) {
              s.shake = 15;
              spawnImpact(bX, bY, s);
              setGameStateVal(2);
            }

            if (p.x + s.pipes.w < s.bird.x && !p.passed) {
              p.passed = true;
              setScoreVal(score => score + 1);
            }
          }
          s.pipes.pipeGenerator = s.pipes.pipeGenerator.filter(p => p.x > -s.pipes.w);
        }
      }

      // DRAW
      ctx.save();
      if (s.shake > 0) {
        ctx.translate(Math.random() * s.shake - s.shake / 2, Math.random() * s.shake - s.shake / 2);
      }

      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, dims.width, dims.height);

      if (loaded && img) {
        // BG
        for (let i = 0; i < 4; i++) {
          ctx.drawImage(img, s.bg.imgX, s.bg.imgY, s.bg.width, s.bg.height, s.bg.x + (i * s.bg.w), s.bg.y, s.bg.w, s.bg.h);
        }

        // Clouds (Parallax)
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 4; i++) {
          ctx.drawImage(img, 0, 0, 275, 226, s.clouds.x + (i * s.bg.w) + 50, s.bg.y - 100, s.bg.w, s.bg.h);
        }
        ctx.globalAlpha = 1;

        // Pipes
        for (let i = 0; i < s.pipes.pipeGenerator.length; i++) {
          let p = s.pipes.pipeGenerator[i];
          ctx.drawImage(img, s.pipes.top.imgX, s.pipes.top.imgY, s.pipes.width, s.pipes.height, p.x, p.y, s.pipes.w, s.pipes.h);
          ctx.drawImage(img, s.pipes.bot.imgX, s.pipes.bot.imgY, s.pipes.width, s.pipes.height, p.x, p.y + s.pipes.h + s.pipes.gap, s.pipes.w, s.pipes.h);
        }

        // Ground
        for (let i = 0; i < 4; i++) {
          ctx.drawImage(img, s.ground.imgX, s.ground.imgY, s.ground.width, s.ground.height, s.ground.x + (i * s.ground.w), s.ground.y, s.ground.w, s.ground.h);
        }

        // Bird
        ctx.save();
        ctx.translate(s.bird.x, s.bird.y);
        ctx.rotate(s.bird.rotation);
        let b = s.bird.animation[s.bird.fr];
        ctx.drawImage(img, b.imgX, b.imgY, s.bird.width, s.bird.height, -s.bird.w/2, -s.bird.h/2, s.bird.w, s.bird.h);
        ctx.restore();

        // UI
        if (gState === 0) {
          ctx.drawImage(img, s.getReady.imgX, s.getReady.imgY, s.getReady.width, s.getReady.height, s.getReady.x, s.getReady.y, s.getReady.w, s.getReady.h);
        }
        if (gState === 2) {
          ctx.drawImage(img, s.gameOver.imgX, s.gameOver.imgY, s.gameOver.width, s.gameOver.height, s.gameOver.x, s.gameOver.y, s.gameOver.w, s.gameOver.h);
        }

        // Score
        if (gState !== 0) {
          ctx.save();
          let str = scoreRef.current.toString();
          let mid = dims.width / 2;
          let charW = 18;
          let totalW = str.length * charW;
          
          const scoreScale = 1 + Math.sin(s.frame / 5) * 0.05;
          ctx.translate(mid, 70);
          ctx.scale(scoreScale, scoreScale);
          ctx.translate(-mid, -70);

          for (let i = 0; i < str.length; i++) {
            let n = parseInt(str[i]);
            let m = s.map[n];
            ctx.drawImage(img, m.imgX, m.imgY, m.width, m.height, mid - (totalW / 2) + (i * charW), 60, 16, 26);
          }
          ctx.restore();
        }

        // Draw Particles
        s.particles.forEach(p => {
          ctx.globalAlpha = p.life / 40;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        ctx.restore(); // Restore world translation/shake
      } else {
        // High-Quality Shape Fallback (Bird)
        ctx.fillStyle = '#fbb025';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.bird.x, s.bird.y, s.bird.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(s.bird.x + 6, s.bird.y - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(s.bird.x + 8, s.bird.y - 4, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Pipes
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2;
        for (let p of s.pipes.pipeGenerator) {
          const topH = p.y + s.pipes.h;
          ctx.fillRect(p.x, 0, s.pipes.w, topH);
          ctx.strokeRect(p.x, 0, s.pipes.w, topH);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(p.x - 4, topH - 20, s.pipes.w + 8, 20);
          ctx.strokeRect(p.x - 4, topH - 20, s.pipes.w + 8, 20);
          ctx.fillStyle = '#22c55e';

          const botY = topH + s.pipes.gap;
          const botH = dims.height - botY - s.ground.h;
          ctx.fillRect(p.x, botY, s.pipes.w, botH);
          ctx.strokeRect(p.x, botY, s.pipes.w, botH);
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(p.x - 4, botY, s.pipes.w + 8, 20);
          ctx.strokeRect(p.x - 4, botY, s.pipes.w + 8, 20);
          ctx.fillStyle = '#22c55e';
        }

        // Ground
        ctx.fillStyle = '#C2915A';
        ctx.fillRect(0, dims.height - s.ground.h, dims.width, s.ground.h);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, dims.height - s.ground.h, dims.width, 2);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${scoreRef.current}`, dims.width / 2, 80);
      }

      s.frame++;
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [dims]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'ArrowDown') {
        dive();
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dims, difficulty]);

  useEffect(() => {
    if (scoreVal > highScore) {
      setHighScore(scoreVal);
      localStorage.setItem('flappy-best', scoreVal.toString());
    }
  }, [scoreVal, highScore]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center select-none bg-black overflow-hidden relative">
       <canvas 
        ref={canvasRef} 
        width={dims.width} 
        height={dims.height} 
        onMouseDown={jump}
        onTouchStart={jump}
        className="shadow-inner cursor-pointer bg-[#70c5ce]"
      />
      
      {gameStateVal === 0 && assetsLoaded && (
        <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-6 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {(['easy', 'medium', 'hard'] as const).map((lv) => (
              <button
                key={lv}
                onClick={(e) => { e.stopPropagation(); setDifficulty(lv); }}
                className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                  difficulty === lv ? "bg-white text-black" : "bg-white/10 text-white/40 hover:bg-white/20"
                )}
              >
                {lv}
              </button>
            ))}
          </div>
          <div className="text-center space-y-2">
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white text-[11px] font-black uppercase tracking-[0.3em] drop-shadow-md"
            >
              Press Space to Fly
            </motion.p>
            <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">Arrow Down to Dive</p>
          </div>
        </div>
      )}

      {gameStateVal === 2 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="mt-40 flex flex-col items-center gap-2 pointer-events-auto">
             <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Current BEST</div>
             <div className="text-4xl font-black text-white drop-shadow-lg">{highScore}</div>
             <button 
               onClick={jump}
               className="mt-4 px-6 py-2 bg-white text-black font-black rounded-lg text-[10px] uppercase tracking-widest hover:bg-os-accent transition-colors"
             >
               Play Again
             </button>
          </div>
        </div>
      )}

      {scoreVal > 0 && gameStateVal === 1 && (
         <div className="absolute top-4 right-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
           Best: {highScore}
         </div>
      )}

      {!assetsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <p className="text-white text-xs font-black tracking-widest animate-pulse uppercase">Initializing Engine...</p>
        </div>
      )}
    </div>
  );
}


