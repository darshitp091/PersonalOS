import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const BOARD_SIZE = 10;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

const SNAKES_LADDERS: Record<number, number> = {
  3: 21, 8: 30, 17: 13, 28: 84, 52: 29, 57: 40, 62: 19, 75: 86, 80: 99, 88: 67, 95: 70, 97: 79
};

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function SnakesLaddersBackground() {
  const [positions, setPositions] = useState<[number, number]>([0, 0]); // Player 1, Player 2
  const [turn, setTurn] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [gameLog, setGameLog] = useState<string>("Game starting...");

  const getCoords = (pos: number) => {
    if (pos === 0) return { x: -1, y: 9 };
    const index = pos - 1;
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const x = row % 2 === 0 ? col : (BOARD_SIZE - 1 - col);
    const y = BOARD_SIZE - 1 - row;
    return { x, y };
  };

  const movePlayer = useCallback(async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    await new Promise(r => setTimeout(r, 800)); // Dice animation time
    
    const currentPlayerPos = positions[turn];
    let nextPos = currentPlayerPos + roll;
    
    if (nextPos > TOTAL_SQUARES) {
      setGameLog(`P${turn + 1} needs exactly ${TOTAL_SQUARES - currentPlayerPos} to win!`);
      nextPos = currentPlayerPos;
    } else {
      setGameLog(`P${turn + 1} rolled a ${roll}!`);
      
      // Check for Snakes/Ladders
      if (SNAKES_LADDERS[nextPos]) {
        const target = SNAKES_LADDERS[nextPos];
        const isLadder = target > nextPos;
        await new Promise(r => setTimeout(r, 500));
        setGameLog(isLadder ? `P${turn + 1} found a LADDER! 🚀` : `P${turn + 1} hit a SNAKE! 🐍`);
        nextPos = target;
      }
    }

    const newPositions: [number, number] = [positions[0], positions[1]];
    newPositions[turn] = nextPos;
    setPositions(newPositions);

    if (nextPos === TOTAL_SQUARES) {
      setGameLog(`PLAYER ${turn + 1} WINS! Resetting...`);
      await new Promise(r => setTimeout(r, 2000));
      setPositions([0, 0]);
      setTurn(0);
    } else {
      setTurn(turn === 0 ? 1 : 0);
    }
    
    setIsRolling(false);
  }, [positions, turn, isRolling]);

  useEffect(() => {
    const timer = setTimeout(movePlayer, 2500);
    return () => clearTimeout(timer);
  }, [movePlayer]);

  const DiceIcon = DiceIcons[diceValue - 1];

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-os-bg flex items-center justify-center p-20 opacity-30">
      <div className="relative w-full max-w-[800px] aspect-square flex flex-col gap-8">
        
        {/* Game Stats */}
        <div className="absolute -top-16 left-0 right-0 flex justify-between items-center px-4">
          <div className="flex gap-4">
             <div className={cn("px-4 py-2 glass rounded-xl border-t-2 transition-all", turn === 0 ? "border-os-accent scale-110" : "border-transparent opacity-50")}>
               <span className="text-[10px] font-black text-os-accent uppercase">P1 Agent</span>
               <div className="text-xl font-bold">Square {positions[0]}</div>
             </div>
             <div className={cn("px-4 py-2 glass rounded-xl border-t-2 transition-all", turn === 1 ? "border-[#FF0080] scale-110" : "border-transparent opacity-50")}>
               <span className="text-[10px] font-black text-[#FF0080] uppercase">P2 Agent</span>
               <div className="text-xl font-bold">Square {positions[1]}</div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Auto Engine</div>
              <div className="text-sm font-medium text-white/40 italic truncate max-w-[200px]">{gameLog}</div>
            </div>
            <motion.div 
               animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
               transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
               className="w-12 h-12 glass rounded-xl flex items-center justify-center text-os-accent border border-os-accent/20"
            >
              <DiceIcon className="w-6 h-6" />
            </motion.div>
          </div>
        </div>

        {/* The Board */}
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full glass border-white/5 p-1 rounded-2xl">
          {Array.from({ length: 100 }).map((_, i) => {
            const num = 100 - i;
            const row = Math.floor(i / 10);
            const col = i % 10;
            const actualNum = row % 2 === 0 ? (100 - (row * 10) - col) : (100 - (row * 10) - (9 - col));
            const isSpecial = SNAKES_LADDERS[actualNum];
            
            return (
              <div 
                key={i} 
                className={cn(
                  "border border-white/5 relative flex items-center justify-center text-[10px] font-mono text-white/5",
                  (row + col) % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                )}
              >
                {actualNum}
                {isSpecial && (
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    SNAKES_LADDERS[actualNum] > actualNum ? "text-emerald-500/20" : "text-red-500/20"
                  )}>
                    {SNAKES_LADDERS[actualNum] > actualNum ? "↑" : "↓"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pawns */}
          <AnimatePresence>
            <motion.div
              layout
              key="p1"
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute w-[8%] h-[8%] bg-os-accent rounded-full shadow-[0_0_20px_#00F5FF] z-10 flex items-center justify-center border-2 border-white"
              style={{
                left: `${getCoords(positions[0]).x * 10 + 1}%`,
                top: `${getCoords(positions[0]).y * 10 + 1}%`,
              }}
            >
              <div className="text-[10px] font-bold text-black">P1</div>
            </motion.div>

            <motion.div
              layout
              key="p2"
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute w-[8%] h-[8%] bg-[#FF0080] rounded-full shadow-[0_0_20px_#FF0080] z-10 flex items-center justify-center border-2 border-white"
              style={{
                left: `${getCoords(positions[1]).x * 10 + 1}%`,
                top: `${getCoords(positions[1]).y * 10 + 1}%`,
              }}
            >
              <div className="text-[10px] font-bold text-black">P2</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* HUD Accents */}
      <div className="absolute inset-0 pointer-events-none ring-[100px] ring-os-bg ring-inset" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-os-bg to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-os-bg to-transparent" />
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
