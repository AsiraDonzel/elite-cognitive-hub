import React, { useState, useEffect, useCallback } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';
import { Flag, Scissors, Box, Scroll, Scale, Trophy, Users, AlertTriangle, Search } from 'lucide-react';

// --- Shared Utils ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Game 1: Silent Human Chess (Hidden Path) ---

export const SilentChess: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [gridSize, setGridSize] = useState(5);
  const [playerPos, setPlayerPos] = useState(0);
  const [traps, setTraps] = useState<number[]>([]);
  const [revealedTraps, setRevealedTraps] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const size = Math.min(8, 5 + Math.floor(currentLevel / 5));
    setGridSize(size);
    setPlayerPos(0); // Start top-left
    
    // Generate Path to ensure solvability
    const path = new Set<number>();
    let curr = 0;
    const target = (size * size) - 1;
    path.add(curr);
    
    while (curr !== target) {
      const r = Math.floor(curr / size);
      const c = curr % size;
      const neighbors = [];
      if (c < size - 1) neighbors.push(curr + 1);
      if (r < size - 1) neighbors.push(curr + size);
      if (c > 0) neighbors.push(curr - 1); // Allow going back slightly for complexity
      if (r > 0) neighbors.push(curr - size);
      
      // Bias towards goal
      const valid = neighbors.filter(n => !path.has(n));
      if (valid.length === 0) break; // Should rare happen in simple grid
      
      // Simple greedyish walk
      curr = valid[randomInt(0, valid.length - 1)];
      path.add(curr);
    }

    // Place traps everywhere NOT on path
    const newTraps: number[] = [];
    const trapDensity = 0.3 + (currentLevel * 0.02);
    for (let i = 0; i < size * size; i++) {
        if (!path.has(i) && i !== target && i !== 0) {
            if (Math.random() < trapDensity) newTraps.push(i);
        }
    }
    
    setTraps(newTraps);
    setRevealedTraps([]);
    setLives(Math.max(1, 4 - Math.floor(currentLevel / 6)));
    setMoves(0);
  }, [currentLevel]);

  const move = (idx: number) => {
    // Check adjacency
    const currR = Math.floor(playerPos / gridSize);
    const currC = playerPos % gridSize;
    const destR = Math.floor(idx / gridSize);
    const destC = idx % gridSize;
    
    if (Math.abs(currR - destR) + Math.abs(currC - destC) !== 1) return;

    if (traps.includes(idx)) {
        // Hit trap
        if (!revealedTraps.includes(idx)) {
            setRevealedTraps([...revealedTraps, idx]);
            setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) onGameOver(0, false);
                return newLives;
            });
        }
    } else {
        // Valid move
        setPlayerPos(idx);
        setMoves(m => m + 1);
        if (idx === (gridSize * gridSize) - 1) {
            onGameOver(currentLevel * 400 - (moves * 10), true);
        }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Silent Human Chess</h2>
      <div className="flex justify-between text-xs text-elite-gold mb-4 font-mono">
        <span>LIVES: {lives}</span>
        <span>MOVES: {moves}</span>
      </div>
      <EliteCard className="p-4 flex justify-center">
        <div 
          className="grid gap-1 bg-slate-900 border border-slate-800 p-1"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({length: gridSize * gridSize}).map((_, i) => {
            const isPlayer = playerPos === i;
            const isGoal = i === (gridSize * gridSize) - 1;
            const isTrapRevealed = revealedTraps.includes(i);

            return (
              <div 
                key={i}
                onClick={() => move(i)}
                className={`
                   w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-all duration-200
                   ${isPlayer ? 'bg-elite-gold shadow-[0_0_15px_#d4af37] z-10' : 'bg-elite-surface hover:bg-slate-800'}
                   ${isGoal ? 'border-2 border-green-500' : 'border border-slate-900'}
                   ${isTrapRevealed ? 'bg-red-900/50 border-red-500' : ''}
                `}
              >
                {isPlayer && <Users size={20} className="text-black" />}
                {isGoal && !isPlayer && <Flag size={20} className="text-green-500" />}
                {isTrapRevealed && <AlertTriangle size={16} className="text-red-500" />}
              </div>
            );
          })}
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 2: Black and White (Bidding) ---

export const BlackWhite: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [playerRes, setPlayerRes] = useState(100);
  const [aiRes, setAiRes] = useState(100);
  const [round, setRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);
  const [bid, setBid] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'bidding' | 'result'>('bidding');

  useEffect(() => {
    // Reset
    setPlayerRes(100);
    setAiRes(100 + (currentLevel * 5)); // AI gets slightly richer
    setRound(1);
    setPlayerWins(0);
    setAiWins(0);
    setLogs([]);
    setBid("");
    setGameState('bidding');
  }, [currentLevel]);

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    const playerBid = parseInt(bid);
    
    if (isNaN(playerBid) || playerBid < 0) return;
    if (playerBid > playerRes) {
        setLogs(l => [`Invalid bid: Insufficient funds.`, ...l]);
        return;
    }

    // AI Logic
    const roundsLeft = 6 - round;
    let aiBid = 0;
    
    // Strategy: Random but centered around average needed
    const aiAvg = aiRes / roundsLeft;
    const variance = aiAvg * 0.4; // 40% variance
    aiBid = Math.floor(aiAvg + (Math.random() * variance * 2 - variance));
    // Clamp
    aiBid = Math.min(aiBid, aiRes);
    aiBid = Math.max(0, aiBid);

    // Resolve
    let msg = `Round ${round}: You bid ${playerBid}, AI bid ${aiBid}. `;
    if (playerBid > aiBid) {
        setPlayerWins(w => w + 1);
        msg += "You won the point.";
    } else if (aiBid > playerBid) {
        setAiWins(w => w + 1);
        msg += "AI won the point.";
    } else {
        msg += "Draw.";
    }

    setPlayerRes(r => r - playerBid);
    setAiRes(r => r - aiBid);
    setLogs(l => [msg, ...l]);
    setBid("");

    if (round >= 5) {
        // Game Over
        setGameState('result');
        const finalP = playerBid > aiBid ? playerWins + 1 : playerWins;
        const finalA = aiBid > playerBid ? aiWins + 1 : aiWins;
        // Check winner logic in render/effect? Simpler here
        setTimeout(() => {
            const pTotal = playerBid > aiBid ? playerWins + 1 : playerWins;
            const aTotal = aiBid > playerBid ? aiWins + 1 : aiWins;
            
            if (pTotal > aTotal) onGameOver(currentLevel * 300 + playerRes, true);
            else onGameOver(0, false);
        }, 2000);
    } else {
        setRound(r => r + 1);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Black & White</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <EliteCard className="p-4 bg-slate-900">
            <h3 className="text-xs text-slate-500 tracking-widest mb-1">PLAYER CAPITAL</h3>
            <div className="text-3xl font-serif text-elite-gold">{playerRes}</div>
            <div className="mt-2 text-xs text-white">Score: {playerWins}</div>
        </EliteCard>
        <EliteCard className="p-4 bg-slate-900">
            <h3 className="text-xs text-slate-500 tracking-widest mb-1">AI CAPITAL</h3>
            <div className="text-3xl font-serif text-slate-400">?</div>
            <div className="mt-2 text-xs text-white">Score: {aiWins}</div>
        </EliteCard>
      </div>

      <EliteCard className="p-6 mb-6">
        <div className="text-sm font-mono text-elite-gold mb-4">ROUND {round} / 5</div>
        {gameState === 'bidding' ? (
             <form onSubmit={handleBid} className="flex gap-4">
                 <input 
                    type="number" 
                    value={bid}
                    onChange={e => setBid(e.target.value)}
                    className={ELITE_STYLES.input}
                    placeholder="Enter Bid"
                    autoFocus
                 />
                 <EliteButton type="submit" variant="primary">BID</EliteButton>
             </form>
        ) : (
            <div className="text-xl text-white animate-pulse">CALCULATING FINAL OUTCOME...</div>
        )}
      </EliteCard>

      <div className="text-left text-xs font-mono text-slate-500 space-y-1 bg-black p-4 border border-slate-900 h-32 overflow-y-auto">
        {logs.map((l, i) => <div key={i}>&gt; {l}</div>)}
      </div>
    </div>
  );
};

// --- Game 3: RPS Chess ---

interface Unit {
    id: number;
    owner: 'player' | 'ai';
    type: 'R' | 'P' | 'S' | 'F'; // Rock, Paper, Scissors, Flag
    row: number;
    col: number;
}

export const RPSChess: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');

  useEffect(() => {
    // Setup Board 4x5
    // Player Bottom (Rows 3,4), AI Top (Rows 0,1)
    const newUnits: Unit[] = [];
    let id = 0;

    // Player Setup
    newUnits.push({ id: id++, owner: 'player', type: 'F', row: 4, col: 2 }); // Flag
    newUnits.push({ id: id++, owner: 'player', type: 'R', row: 3, col: 1 });
    newUnits.push({ id: id++, owner: 'player', type: 'P', row: 3, col: 2 });
    newUnits.push({ id: id++, owner: 'player', type: 'S', row: 3, col: 3 });
    // Add more for higher levels
    if (currentLevel > 5) newUnits.push({ id: id++, owner: 'player', type: 'R', row: 3, col: 0 });

    // AI Setup
    newUnits.push({ id: id++, owner: 'ai', type: 'F', row: 0, col: 1 }); // Flag
    newUnits.push({ id: id++, owner: 'ai', type: 'R', row: 1, col: 1 });
    newUnits.push({ id: id++, owner: 'ai', type: 'P', row: 1, col: 2 });
    newUnits.push({ id: id++, owner: 'ai', type: 'S', row: 1, col: 3 });
    if (currentLevel > 5) newUnits.push({ id: id++, owner: 'ai', type: 'S', row: 1, col: 0 });

    setUnits(newUnits);
    setTurn('player');
    setSelected(null);
  }, [currentLevel]);

  const canCapture = (attacker: string, defender: string) => {
    if (defender === 'F') return true;
    if (attacker === 'R' && defender === 'S') return true;
    if (attacker === 'S' && defender === 'P') return true;
    if (attacker === 'P' && defender === 'R') return true;
    return false;
  };

  const handleClick = (r: number, c: number) => {
    if (turn !== 'player') return;

    const clickedUnit = units.find(u => u.row === r && u.col === c);

    if (selected === null) {
        if (clickedUnit && clickedUnit.owner === 'player') {
            setSelected(clickedUnit.id);
        }
    } else {
        const mover = units.find(u => u.id === selected);
        if (!mover) return;

        // Check Valid Move (1 step orthogonal)
        if (Math.abs(mover.row - r) + Math.abs(mover.col - c) !== 1) {
            // Deselect if clicking elsewhere or invalid
            setSelected(null);
            if (clickedUnit && clickedUnit.owner === 'player') setSelected(clickedUnit.id);
            return;
        }

        // Action
        let capture = false;
        let valid = true;
        let gameOver = false;
        let win = false;

        if (clickedUnit) {
            if (clickedUnit.owner === 'player') {
                setSelected(clickedUnit.id); // Switch selection
                return;
            } else {
                // Attack
                if (canCapture(mover.type, clickedUnit.type)) {
                    capture = true;
                    if (clickedUnit.type === 'F') {
                        gameOver = true;
                        win = true;
                    }
                } else {
                    valid = false; // Cannot capture
                }
            }
        }

        if (valid) {
            const nextUnits = units.filter(u => !capture || u.id !== clickedUnit?.id).map(u => {
                if (u.id === mover.id) return { ...u, row: r, col: c };
                return u;
            });
            setUnits(nextUnits);
            setSelected(null);
            
            if (gameOver) {
                onGameOver(currentLevel * 400, true);
            } else {
                setTurn('ai');
                setTimeout(aiTurn, 1000); // Trigger AI
            }
        }
    }
  };

  const aiTurn = () => {
    // Simple Random AI
    // Re-query units from state ref equivalent in callback?
    // Using functional update hack or just ignoring strict safety for this demo size
    setUnits(prevUnits => {
        const aiUnits = prevUnits.filter(u => u.owner === 'ai');
        const pUnits = prevUnits.filter(u => u.owner === 'player');
        
        // Find capture if possible
        for (const ai of aiUnits) {
            if (ai.type === 'F') continue; // Flag doesn't move
            const neighbors = [
                {r: ai.row+1, c: ai.col}, {r: ai.row-1, c: ai.col},
                {r: ai.row, c: ai.col+1}, {r: ai.row, c: ai.col-1}
            ];
            for (const n of neighbors) {
                const target = pUnits.find(p => p.row === n.r && p.col === n.c);
                if (target && canCapture(ai.type, target.type)) {
                     if (target.type === 'F') {
                         setTimeout(() => onGameOver(0, false), 500); // AI Wins
                     }
                     // Execute Capture
                     setTurn('player');
                     return prevUnits.filter(u => u.id !== target.id).map(u => u.id === ai.id ? {...u, row: n.r, col: n.c} : u);
                }
            }
        }

        // Random move if no capture
        const movable = aiUnits.filter(u => u.type !== 'F');
        if (movable.length === 0) {
            setTurn('player');
            return prevUnits;
        }
        
        const mover = movable[randomInt(0, movable.length - 1)];
        const neighbors = [
            {r: mover.row+1, c: mover.col}, {r: mover.row-1, c: mover.col},
            {r: mover.row, c: mover.col+1}, {r: mover.row, c: mover.col-1}
        ];
        
        // Filter valid empty spots (AI generally won't suicide into player for now)
        const validMoves = neighbors.filter(n => 
            n.r >= 0 && n.r < 5 && n.c >= 0 && n.c < 4 && 
            !prevUnits.some(u => u.row === n.r && u.col === n.c)
        );

        if (validMoves.length > 0) {
            const move = validMoves[randomInt(0, validMoves.length - 1)];
            setTurn('player');
            return prevUnits.map(u => u.id === mover.id ? {...u, row: move.r, col: move.c} : u);
        }

        setTurn('player');
        return prevUnits;
    });
  };

  const getIcon = (type: string) => {
    if (type === 'R') return <Box size={16} />;
    if (type === 'P') return <Scroll size={16} />;
    if (type === 'S') return <Scissors size={16} />;
    return <Flag size={16} />;
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>RPS Chess</h2>
      <div className="flex justify-between items-center mb-4 px-8">
        <span className={`text-xs tracking-widest ${turn === 'ai' ? 'text-elite-gold animate-pulse' : 'text-slate-600'}`}>AI TURN</span>
        <span className={`text-xs tracking-widest ${turn === 'player' ? 'text-elite-gold animate-pulse' : 'text-slate-600'}`}>YOUR TURN</span>
      </div>

      <EliteCard className="p-4 flex justify-center">
        <div className="grid grid-cols-4 gap-1 bg-slate-900 border border-slate-800 p-1 w-full aspect-[4/5] max-w-[300px]">
            {Array.from({length: 20}).map((_, i) => {
                const r = Math.floor(i / 4);
                const c = i % 4;
                const unit = units.find(u => u.row === r && u.col === c);
                const isSelected = selected === unit?.id;
                
                return (
                    <div 
                        key={i}
                        onClick={() => handleClick(r, c)}
                        className={`
                            relative border flex items-center justify-center transition-all duration-200
                            ${isSelected ? 'bg-elite-gold border-white' : 'border-slate-800'}
                            ${!unit && (selected !== null) && (Math.abs((units.find(u=>u.id===selected)?.row||0) - r) + Math.abs((units.find(u=>u.id===selected)?.col||0) - c) === 1) ? 'bg-green-900/30 cursor-pointer' : ''}
                        `}
                    >
                        {unit && (
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${unit.owner === 'player' ? 'bg-blue-900 text-blue-200 border border-blue-500' : 'bg-red-900 text-red-200 border border-red-500'}
                            `}>
                                {getIcon(unit.type)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 4: Perfect Number (Property Hunt) ---

export const PerfectNumber: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [grid, setGrid] = useState<number[]>([]);
  const [question, setQuestion] = useState("");
  const [condition, setCondition] = useState<(n: number) => boolean>(() => false);
  
  useEffect(() => {
    // Generate Criteria
    const type = randomInt(0, 3);
    let desc = "";
    let check: (n: number) => boolean = () => false;

    if (type === 0) {
        const div = randomInt(3, 9);
        desc = `Divisible by ${div}`;
        check = (n) => n % div === 0;
    } else if (type === 1) {
        const sum = randomInt(5, 15);
        desc = `Digits sum to ${sum}`;
        check = (n) => n.toString().split('').reduce((a,b) => a + parseInt(b), 0) === sum;
    } else if (type === 2) {
        desc = "Is a Prime Number";
        check = (n) => {
            if (n < 2) return false;
            for(let i=2; i<=Math.sqrt(n); i++) if(n%i===0) return false;
            return true;
        };
    } else {
        desc = "Ends with 7";
        check = (n) => n % 10 === 7;
    }

    setQuestion(desc);
    setCondition(() => check);

    // Generate Grid ensuring at least 1 match
    const newGrid = [];
    let hasMatch = false;
    for (let i = 0; i < 16; i++) {
        const n = randomInt(10, 99 + (currentLevel * 10));
        newGrid.push(n);
        if (check(n)) hasMatch = true;
    }
    
    // Force match if none
    if (!hasMatch) {
        let valid = 0;
        // Brute force find a valid number for condition
        // Simplified: Just use known logic to generate one
        if (type === 0) valid = randomInt(2, 20) * (parseInt(desc.split(' ').pop() || '1'));
        if (type === 1) valid = 10 + (parseInt(desc.split(' ').pop() || '5') - 1); // rough hack
        if (type === 2) valid = 17; // fallback prime
        if (type === 3) valid = 27;

        // Better approach: Loop until valid found (dangerous) or pre-calc.
        // Let's just regenerate grid slot 0 with a forced valid manually?
        // For stability in this demo, let's keep it random and if user clicks wrong we just say wrong.
        // Actually, let's just insert a valid number at random index.
        const idx = randomInt(0, 15);
        let val = 10;
        while (!check(val)) val++;
        newGrid[idx] = val;
    }
    
    setGrid(newGrid);

  }, [currentLevel]);

  const handleSelect = (n: number) => {
    if (condition(n)) {
        onGameOver(currentLevel * 200, true);
    } else {
        onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Perfect Number</h2>
      <EliteCard className="p-6">
        <div className="flex items-center justify-center gap-2 mb-6 text-elite-gold">
            <Search size={20} />
            <span className="font-serif text-lg tracking-wide">{question}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
            {grid.map((n, i) => (
                <button
                    key={i}
                    onClick={() => handleSelect(n)}
                    className="p-4 border border-slate-700 bg-slate-900 hover:bg-elite-gold hover:text-black hover:border-elite-gold font-mono text-lg transition-all"
                >
                    {n}
                </button>
            ))}
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 5: Balance Game (Logic) ---

export const BalanceLogic: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [items, setItems] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<{left: string, right: string, res: '>'|'<'|'='}[]>([]);
  const [question, setQuestion] = useState<'heaviest' | 'lightest'>('heaviest');
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  useEffect(() => {
    const count = Math.min(6, 3 + Math.floor(currentLevel / 5));
    const alphabet = "ABCDEF".split('').slice(0, count);
    
    const weights: Record<string, number> = {};
    const weightValues = Array.from({length: count}, (_, i) => (i + 1) * 10);
    const shuffledWeights = [...weightValues].sort(() => Math.random() - 0.5);
    
    alphabet.forEach((char, i) => {
        weights[char] = shuffledWeights[i];
    });

    const targetType = Math.random() > 0.5 ? 'heaviest' : 'lightest';
    setQuestion(targetType);

    const sortedItems = [...alphabet].sort((a, b) => weights[b] - weights[a]);
    setCorrectAnswer(targetType === 'heaviest' ? sortedItems[0] : sortedItems[sortedItems.length - 1]);
    
    const comps = [];
    for (let i = 0; i < count - 1; i++) {
        const a = alphabet[i];
        const b = alphabet[i + 1];
        const res = weights[a] > weights[b] ? '>' : '<';
        comps.push({ left: a, right: b, res });
    }

    setItems(alphabet);
    setComparisons(comps.sort(() => Math.random() - 0.5));
  }, [currentLevel]);

  const check = (choice: string) => {
    if (choice === correctAnswer) {
      onGameOver(currentLevel * 350, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Balance Logic</h2>
      <p className="text-slate-500 mb-6 text-sm">Analyze the weight distribution data.</p>
      
      <div className="grid gap-4 mb-8">
        {comparisons.map((c, i) => (
            <div key={i} className="flex items-center justify-center gap-4 bg-slate-900 p-3 border border-slate-800">
                <div className="w-10 h-10 border border-elite-gold flex items-center justify-center text-elite-gold font-bold">{c.left}</div>
                <Scale 
                    size={20} 
                    className={`text-slate-500 transform ${c.res === '>' ? '-rotate-12' : 'rotate-12'}`} 
                />
                <div className="w-10 h-10 border border-elite-gold flex items-center justify-center text-elite-gold font-bold">{c.right}</div>
            </div>
        ))}
      </div>

      <EliteCard className="p-6">
        <h3 className="text-white text-lg mb-4 uppercase tracking-widest">Select the {question}</h3>
        <div className="flex gap-4 justify-center">
            {items.map(item => (
                <button
                    key={item}
                    onClick={() => check(item)}
                    className="w-12 h-12 bg-elite-gold text-black font-bold text-xl hover:bg-white transition-colors shadow-lg"
                >
                    {item}
                </button>
            ))}
        </div>
      </EliteCard>
    </div>
  );
};