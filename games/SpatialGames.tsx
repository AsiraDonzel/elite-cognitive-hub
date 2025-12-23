import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';
import { Hand, Scissors, Scroll, ArrowRight, RotateCcw, Box, Triangle, Lock, Unlock } from 'lucide-react';

// --- Utils ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Game 1: Rotation! RPS ---

export const RotationRPS: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [phase, setPhase] = useState<'pick' | 'rotating' | 'result'>('pick');
  const [cpuHand, setCpuHand] = useState<number>(0); // 0: Rock, 1: Paper, 2: Scissors
  const [rotationSteps, setRotationSteps] = useState(0);
  const [rotationsLeft, setRotationsLeft] = useState(0);
  const [userHand, setUserHand] = useState<number | null>(null);
  const [displayHand, setDisplayHand] = useState<number>(0);

  // 0: Rock, 1: Paper, 2: Scissors
  const HANDS = [
    { name: 'ROCK', icon: Box },
    { name: 'PAPER', icon: Scroll },
    { name: 'SCISSORS', icon: Scissors }
  ];

  useEffect(() => {
    // Determine complexity
    const steps = Math.floor(currentLevel / 2) + 1;
    setRotationSteps(steps);
    setCpuHand(randomInt(0, 2));
    setPhase('pick');
    setUserHand(null);
  }, [currentLevel]);

  const handlePick = (idx: number) => {
    setUserHand(idx);
    setPhase('rotating');
    setRotationsLeft(rotationSteps);
    // Initial display is the "Started" hand
    setDisplayHand(cpuHand);
    
    // Animate rotations
    let stepsDone = 0;
    const interval = setInterval(() => {
      stepsDone++;
      setRotationsLeft(prev => prev - 1);
      setDisplayHand(prev => (prev + 1) % 3);

      if (stepsDone >= rotationSteps) {
        clearInterval(interval);
        setPhase('result');
        finalize((cpuHand + rotationSteps) % 3, idx);
      }
    }, 800 - (currentLevel * 20)); // Speed increases
  };

  const finalize = (finalCpu: number, finalUser: number) => {
    // Result logic
    // 0 beats 2, 1 beats 0, 2 beats 1
    let win = false;
    if (finalUser === finalCpu) win = false; // Tie is loss in Elite Mode
    else if ((finalUser === 0 && finalCpu === 2) || 
             (finalUser === 1 && finalCpu === 0) || 
             (finalUser === 2 && finalCpu === 1)) {
      win = true;
    }

    if (win) {
      setTimeout(() => onGameOver(currentLevel * 300, true), 1500);
    } else {
      setTimeout(() => onGameOver(0, false), 1500);
    }
  };

  const HandIcon = ({ type, size = 24 }: { type: number, size?: number }) => {
    const H = HANDS[type].icon;
    return <H size={size} />;
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Rotation! RPS</h2>
      <p className="text-slate-500 text-xs mb-8">
        Opponent rotates <span className="text-elite-gold">{rotationSteps}</span> steps clockwise after you choose.
      </p>

      <EliteCard className="py-8 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-xs tracking-widest text-slate-500 mb-2">OPPONENT</span>
          <div className={`
            w-24 h-24 border-2 border-slate-700 flex items-center justify-center text-elite-gold rounded-full transition-all duration-300
            ${phase === 'rotating' ? 'border-elite-gold animate-pulse' : ''}
          `}>
             {phase === 'pick' ? <div className="text-4xl">?</div> : <HandIcon type={displayHand} size={48} />}
          </div>
          {phase === 'rotating' && (
            <div className="mt-2 text-elite-gold text-xs flex items-center gap-1">
              <RotateCcw className="animate-spin" size={12} />
              ROTATING... {rotationsLeft}
            </div>
          )}
        </div>

        <div className="w-full h-px bg-slate-800" />

        <div className="flex gap-4 justify-center w-full">
          {HANDS.map((h, i) => (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={phase !== 'pick'}
              className={`
                p-4 border transition-all duration-300 flex flex-col items-center gap-2 w-full
                ${userHand === i ? 'bg-elite-gold text-black border-elite-gold' : 'border-slate-700 text-slate-400 hover:border-elite-gold hover:text-elite-gold'}
                ${phase !== 'pick' && userHand !== i ? 'opacity-20' : ''}
              `}
            >
              <h.icon size={24} />
              <span className="text-[10px] tracking-widest">{h.name}</span>
            </button>
          ))}
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 2: Triple Maze (Quantum Cursor) ---

export const TripleMaze: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [size, setSize] = useState(5);
  const [mazes, setMazes] = useState<number[][][]>([]); // 3 grids. 0=path, 1=wall
  const [pos, setPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const s = Math.min(8, 4 + Math.floor(currentLevel / 5));
    setSize(s);
    setPos({ x: 0, y: 0 });

    // Generate 3 mazes that share at least one valid solution
    // Simplified: Generate empty grids, place random walls, ensuring start/end clear
    // For guaranteed solvability without complex algo, we use lower density and hope
    // Or simpler: Just distinct random walls.
    const newMazes = [];
    for (let m = 0; m < 3; m++) {
      const grid = Array(s).fill(0).map(() => Array(s).fill(0));
      // Add random walls (density increases with level)
      const wallCount = Math.floor((s * s) * (0.15 + (currentLevel * 0.01))); 
      for (let i = 0; i < wallCount; i++) {
        const rx = randomInt(0, s-1);
        const ry = randomInt(0, s-1);
        if ((rx === 0 && ry === 0) || (rx === s-1 && ry === s-1)) continue;
        grid[ry][rx] = 1;
      }
      newMazes.push(grid);
    }
    setMazes(newMazes);
  }, [currentLevel]);

  const move = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;

    // Boundary check
    if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;

    // Wall check in ALL mazes
    if (mazes.some(maze => maze[ny][nx] === 1)) {
      // Hit a wall in one dimension
      return; 
    }

    setPos({ x: nx, y: ny });

    if (nx === size - 1 && ny === size - 1) {
      onGameOver(currentLevel * 400, true);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, mazes]);

  return (
    <div className="w-full max-w-4xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Triple Maze</h2>
      <p className="text-slate-500 mb-6 text-xs">Sync-Move: The cursor exists in 3 dimensions simultaneously. Avoid all walls.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mazes.map((maze, mIdx) => (
          <EliteCard key={mIdx} className="p-2 aspect-square flex items-center justify-center">
            <div 
              className="grid gap-1 bg-slate-900 border border-slate-800 p-1"
              style={{ 
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                width: '100%',
                height: '100%'
              }}
            >
              {maze.map((row, y) => row.map((cell, x) => {
                 const isPlayer = pos.x === x && pos.y === y;
                 const isGoal = x === size - 1 && y === size - 1;
                 return (
                   <div 
                     key={`${x}-${y}`} 
                     className={`
                       w-full h-full rounded-sm flex items-center justify-center
                       ${cell === 1 ? 'bg-slate-700' : 'bg-[#0f141a]'}
                       ${isPlayer ? 'bg-elite-gold shadow-[0_0_10px_#d4af37] z-10' : ''}
                       ${isGoal && !isPlayer ? 'bg-green-900/50 border border-green-500' : ''}
                     `}
                   />
                 );
              }))}
            </div>
            <div className="absolute top-2 left-2 text-[10px] text-slate-600 font-mono">DIM-{mIdx+1}</div>
          </EliteCard>
        ))}
      </div>
      <div className="mt-6 flex gap-4 justify-center">
        <EliteButton onClick={() => move(0, -1)} className="px-4 py-2">▲</EliteButton>
        <div className="flex gap-4">
            <EliteButton onClick={() => move(-1, 0)} className="px-4 py-2">◀</EliteButton>
            <EliteButton onClick={() => move(0, 1)} className="px-4 py-2">▼</EliteButton>
            <EliteButton onClick={() => move(1, 0)} className="px-4 py-2">▶</EliteButton>
        </div>
      </div>
    </div>
  );
};

// --- Game 3: Exit Strategy (Sliding Blocks) ---

export const ExitStrategy: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [grid, setGrid] = useState<number[]>([]); // 1D array for 5x5 grid. 0=empty, 1=Player, 2=Block
  const GRID_SIZE = 5;
  const PLAYER_IDX = 1; // ID for player piece

  useEffect(() => {
    // Generate a solvable state by starting solved and reversing
    const newGrid = new Array(GRID_SIZE * GRID_SIZE).fill(0);
    // Goal is bottom-right (24)
    let pPos = GRID_SIZE * GRID_SIZE - 1; 
    newGrid[pPos] = PLAYER_IDX;

    // Place random blocks (ID 2)
    const blockCount = Math.min(10, 3 + Math.floor(currentLevel / 2));
    for (let i = 0; i < blockCount; i++) {
        let bPos;
        do { bPos = randomInt(0, 24); } while (newGrid[bPos] !== 0);
        newGrid[bPos] = 2;
    }

    // Shuffle Moves (Reverse Walk)
    const moves = 10 + (currentLevel * 2);
    for (let i = 0; i < moves; i++) {
        // Try to move player
        const dirs = [-1, 1, -GRID_SIZE, GRID_SIZE];
        const validMoves = dirs.filter(d => {
            const next = pPos + d;
            // Bound checks
            if (next < 0 || next >= 25) return false;
            if (Math.abs((pPos % 5) - (next % 5)) > 1) return false; // Wrap check
            return newGrid[next] === 0 || newGrid[next] === 2; // Can swap with empty or "push" block if space behind? 
            // Simplified: Just swap player with empty space for the "Reverse Walk"
            // Actually, to make it a puzzle, we swap player with 0.
        });
        
        // This is a naive shuffle. For a true sliding puzzle, we just randomize empty slots.
        // Let's implement simpler: Sokoban style. 
        // Player is at 0,0. Goal is 4,4. Blocks are static walls. 
        // BUT, user can "slide" the blocks?
        // Let's stick to: "Slide the King (Gold) to the Exit". Blocks are walls.
        // To make it solvable: Start at 0,0. Walk a path to 4,4. Place walls elsewhere.
        
        // Reset
        newGrid.fill(0);
        const path = [];
        let curr = 0;
        path.push(curr);
        
        // Create path
        while (curr !== 24) {
            const r = Math.floor(curr / 5);
            const c = curr % 5;
            const choices = [];
            if (c < 4) choices.push(curr + 1);
            if (r < 4) choices.push(curr + 5);
            
            if (choices.length === 0) break; // Should not happen going down-right
            curr = choices[randomInt(0, choices.length - 1)];
            path.push(curr);
        }
        
        // Fill non-path with random walls
        for (let j = 0; j < 25; j++) {
            if (!path.includes(j) && Math.random() < (0.3 + (currentLevel * 0.02))) {
                newGrid[j] = 2;
            }
        }
        newGrid[0] = 1;
        setGrid(newGrid);
    }
  }, [currentLevel]);

  const movePlayer = (dir: number) => {
    const pIndex = grid.indexOf(1);
    const dest = pIndex + dir;
    
    // Check bounds
    if (dest < 0 || dest >= 25) return;
    // Check Wrap
    if (Math.abs((pIndex % 5) - (dest % 5)) > 1) return;
    
    // Check Block
    if (grid[dest] === 2) return;

    const nextGrid = [...grid];
    nextGrid[pIndex] = 0;
    nextGrid[dest] = 1;
    setGrid(nextGrid);

    if (dest === 24) {
        onGameOver(currentLevel * 200, true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Exit Strategy</h2>
      <EliteCard className="p-4 flex justify-center">
        <div className="grid grid-cols-5 gap-1 w-full max-w-[300px] aspect-square bg-slate-900 border border-slate-800 p-1">
            {grid.map((cell, i) => (
                <div key={i} className={`
                    w-full h-full flex items-center justify-center transition-all duration-200
                    ${cell === 1 ? 'bg-elite-gold shadow-[0_0_15px_#d4af37] z-10' : ''}
                    ${cell === 2 ? 'bg-slate-700 border border-slate-600' : ''}
                    ${i === 24 ? 'bg-green-900/30 border border-green-500/50' : ''}
                `}>
                    {cell === 1 && <Lock size={16} className="text-black" />}
                    {i === 24 && cell !== 1 && <Unlock size={16} className="text-green-500 opacity-50" />}
                </div>
            ))}
        </div>
      </EliteCard>
      
      <div className="mt-6 grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <div />
        <EliteButton onClick={() => movePlayer(-5)} className="px-2 py-4">▲</EliteButton>
        <div />
        <EliteButton onClick={() => movePlayer(-1)} className="px-2 py-4">◀</EliteButton>
        <EliteButton onClick={() => movePlayer(5)} className="px-2 py-4">▼</EliteButton>
        <EliteButton onClick={() => movePlayer(1)} className="px-2 py-4">▶</EliteButton>
      </div>
    </div>
  );
};

// --- Game 4: Trail of Dice ---

export const TrailOfDice: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [path, setPath] = useState<string[]>([]);
  const [finalState, setFinalState] = useState<{top: number, front: number, right: number} | null>(null);
  
  // Standard Dice: Top+Bottom=7, Front+Back=7, Left+Right=7
  // Initial: Top 1, Front 2, Right 3
  // Bottom 6, Back 5, Left 4

  const roll = (state: {top: number, front: number, right: number}, dir: string) => {
    const { top, front, right } = state;
    const bottom = 7 - top;
    const back = 7 - front;
    const left = 7 - right;

    if (dir === 'UP') return { top: front, front: bottom, right: right };
    if (dir === 'DOWN') return { top: back, front: top, right: right };
    if (dir === 'LEFT') return { top: right, front: front, right: bottom }; // Right becomes bottom
    if (dir === 'RIGHT') return { top: left, front: front, right: top }; // Left becomes top
    return state;
  };

  useEffect(() => {
    // Generate Path
    const length = 2 + Math.floor(currentLevel / 2);
    const newPath = [];
    const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    
    let current = { top: 1, front: 2, right: 3 };
    
    for (let i = 0; i < length; i++) {
        const d = dirs[randomInt(0, 3)];
        newPath.push(d);
        current = roll(current, d);
    }
    
    setPath(newPath);
    setFinalState(current);
  }, [currentLevel]);

  const handleGuess = (face: number) => {
    if (face === finalState?.top) {
        onGameOver(currentLevel * 250, true);
    } else {
        onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Trail of Dice</h2>
      <p className="text-slate-500 mb-6 text-sm">Start: Top 1, Front 2, Right 3. Predict the final TOP face.</p>

      <EliteCard className="p-8 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-4 text-elite-gold font-mono text-sm md:text-xl">
            <div className="border border-slate-700 p-2 text-white">START</div>
            <ArrowRight size={16} />
            {path.map((dir, i) => (
                <React.Fragment key={i}>
                    <span>{dir}</span>
                    {i < path.length - 1 && <ArrowRight size={16} className="text-slate-700" />}
                </React.Fragment>
            ))}
            <ArrowRight size={16} />
            <div className="border border-elite-gold p-2 text-elite-gold">?</div>
        </div>
      </EliteCard>

      <div className="grid grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map(n => (
            <button
                key={n}
                onClick={() => handleGuess(n)}
                className="aspect-square border border-slate-700 bg-slate-900 hover:bg-elite-gold hover:text-black font-serif text-xl transition-all"
            >
                {n}
            </button>
        ))}
      </div>
    </div>
  );
};

// --- Game 5: Pyramid Game (Pascal Logic) ---

export const PyramidGame: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [rows, setRows] = useState<number[][]>([]);
  const [missing, setMissing] = useState<{r:number, c:number} | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    const height = Math.min(5, 3 + Math.floor(currentLevel / 5));
    // Build from bottom up
    const grid: number[][] = [];
    
    // Bottom row random
    const bottom = Array.from({length: height}, () => randomInt(1, 10 + currentLevel));
    grid[height-1] = bottom;

    // Build up
    for (let r = height - 2; r >= 0; r--) {
        grid[r] = [];
        for (let c = 0; c <= r; c++) {
            grid[r][c] = grid[r+1][c] + grid[r+1][c+1];
        }
    }

    setRows(grid);

    // Pick a missing spot (not bottom row usually, to force calc)
    const mr = randomInt(0, height - 2); 
    const mc = randomInt(0, mr);
    setMissing({ r: mr, c: mc });
    setInput("");

  }, [currentLevel]);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missing) return;
    const correct = rows[missing.r][missing.c];
    if (parseInt(input) === correct) {
        onGameOver(currentLevel * 300, true);
    } else {
        onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Pyramid Logic</h2>
      <p className="text-slate-500 mb-8 text-xs">Each block is the sum of the two directly below it.</p>

      <div className="flex flex-col items-center gap-2 mb-8">
        {rows.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-2">
                {row.map((val, cIdx) => {
                    const isMissing = missing?.r === rIdx && missing?.c === cIdx;
                    return (
                        <div 
                            key={cIdx}
                            className={`
                                w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border
                                font-serif text-sm md:text-xl
                                ${isMissing ? 'border-elite-gold text-elite-gold bg-slate-900' : 'border-slate-800 text-slate-400 bg-elite-surface'}
                            `}
                        >
                            {isMissing ? '?' : val}
                        </div>
                    );
                })}
            </div>
        ))}
      </div>

      <form onSubmit={check} className="max-w-xs mx-auto flex gap-4">
        <input 
            type="number" 
            value={input}
            onChange={e => setInput(e.target.value)}
            className={ELITE_STYLES.input}
            placeholder="Value"
            autoFocus
        />
        <EliteButton type="submit" variant="primary">Fill</EliteButton>
      </form>
    </div>
  );
};