import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';

// --- Game 1: Blind Sudoku ---

export const BlindSudoku: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [gridSize, setGridSize] = useState(3);
  const [grid, setGrid] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    // Level 1: 2x2, Level 20: 5x5
    const size = Math.min(5, Math.floor(currentLevel / 5) + 2);
    setGridSize(size);
    
    // Generate random numbers (doesn't need to be valid sudoku logic for pure memory)
    const newGrid = Array.from({ length: size * size }, () => Math.floor(Math.random() * 9) + 1);
    setGrid(newGrid);
    setUserInput(new Array(size * size).fill(""));
    setPhase('memorize');
    
    // Time decreases as level increases
    const memTime = Math.max(3, 10 - Math.floor(currentLevel / 3));
    setTimer(memTime);

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setPhase('recall');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentLevel]);

  const handleSubmit = () => {
    const isCorrect = grid.every((val, idx) => parseInt(userInput[idx]) === val);
    if (isCorrect) {
      onGameOver(currentLevel * 300, true);
    } else {
      onGameOver(0, false);
    }
  };

  const handleInput = (idx: number, val: string) => {
    const next = [...userInput];
    next[idx] = val.slice(-1); // Only last char
    setUserInput(next);
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Blind Sudoku</h2>
      <p className="mb-4 text-elite-gold font-mono text-sm">
        {phase === 'memorize' ? `MEMORIZE: ${timer}s` : 'RECONSTRUCT THE GRID'}
      </p>

      <EliteCard className="p-8 flex justify-center">
        <div 
          className="grid gap-2" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {grid.map((num, i) => (
            <div key={i} className="w-12 h-12 md:w-16 md:h-16">
              {phase === 'memorize' ? (
                <div className="w-full h-full border border-elite-gold flex items-center justify-center text-xl md:text-2xl font-serif text-white bg-slate-900">
                  {num}
                </div>
              ) : (
                <input
                  type="number"
                  value={userInput[i]}
                  onChange={(e) => handleInput(i, e.target.value)}
                  className="w-full h-full border border-slate-700 bg-elite-surface text-center text-xl text-elite-gold focus:border-elite-gold focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </EliteCard>
      
      {phase === 'recall' && (
        <EliteButton variant="primary" onClick={handleSubmit} className="mt-8 w-full">
          Verify Grid
        </EliteButton>
      )}
    </div>
  );
};

// --- Game 2: Pixel Number (Canvas) ---

export const PixelNumber: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [target, setTarget] = useState(0);

  useEffect(() => {
    const digit = Math.floor(Math.random() * 10);
    setTarget(digit);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create offscreen canvas to draw the perfect digit
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Draw digit on offscreen
    offCtx.fillStyle = '#d4af37'; // Gold
    offCtx.font = 'bold 200px Cinzel';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(digit.toString(), canvas.width / 2, canvas.height / 2);

    // Get pixel data
    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const totalPixels = pixels.length / 4;

    // Difficulty: Density drops as level increases
    // Level 1: 15% density, Level 20: 0.5% density
    const density = Math.max(0.005, 0.15 - (currentLevel * 0.007));
    
    const finalImageData = ctx.createImageData(canvas.width, canvas.height);
    const finalPixels = finalImageData.data;

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      // If the offscreen pixel is gold (has alpha)
      if (pixels[idx + 3] > 0) {
        // Randomly decide to copy it based on density
        if (Math.random() < density) {
          finalPixels[idx] = pixels[idx];     // R
          finalPixels[idx + 1] = pixels[idx + 1]; // G
          finalPixels[idx + 2] = pixels[idx + 2]; // B
          finalPixels[idx + 3] = 255; // Alpha
        }
      }
    }
    
    ctx.putImageData(finalImageData, 0, 0);

  }, [currentLevel]);

  const handleGuess = (guess: number) => {
    if (guess === target) {
      onGameOver(currentLevel * 200, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Pixel Number</h2>
      <EliteCard className="p-4 flex flex-col items-center">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="border border-slate-800 bg-black mb-6 w-full max-w-[300px]"
        />
        <div className="grid grid-cols-5 gap-2 w-full">
          {[0,1,2,3,4,5,6,7,8,9].map(n => (
            <button 
              key={n}
              onClick={() => handleGuess(n)}
              className="p-3 border border-slate-700 hover:bg-elite-gold hover:text-black font-serif text-xl transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 3: Birth Date (Concentration) ---

interface Card {
  id: number;
  content: string;
  type: 'name' | 'date';
  matchId: number; // The ID of the card that matches this one
  isFlipped: boolean;
  isMatched: boolean;
}

export const BirthDate: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const pairCount = Math.min(12, 2 + Math.floor(currentLevel / 2));
    const newCards: Card[] = [];
    
    const names = ["ZER0", "KAY", "JINX", "NEO", "LUX", "ECHO", "FURY", "ION", "NOVA", "ASH", "RIX", "VEX"];
    const years = ["1999", "2049", "2077", "2023", "2001", "1984", "3000", "2100", "2012", "1997", "2088", "2050"];

    for (let i = 0; i < pairCount; i++) {
      const pairId = i;
      newCards.push({ id: i*2, content: names[i], type: 'name', matchId: i*2+1, isFlipped: false, isMatched: false });
      newCards.push({ id: i*2+1, content: years[i], type: 'date', matchId: i*2, isFlipped: false, isMatched: false });
    }

    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlipped([]);
    setIsLocked(false);
  }, [currentLevel]);

  const handleCardClick = (idx: number) => {
    if (isLocked || cards[idx].isFlipped || cards[idx].isMatched) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].matchId === cards[secondIdx].id) {
        // Match
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlipped([]);
          setIsLocked(false);
          
          if (matchedCards.every(c => c.isMatched)) {
            onGameOver(currentLevel * 400, true);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlipped([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Birth Date Protocol</h2>
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => handleCardClick(idx)}
            className={`
              aspect-[3/4] cursor-pointer transition-all duration-500 transform border border-slate-800
              flex items-center justify-center p-2 text-xs md:text-sm font-mono tracking-widest
              ${card.isFlipped || card.isMatched ? 'bg-elite-surface text-elite-gold rotate-y-180' : 'bg-slate-900 text-transparent'}
              ${card.isMatched ? 'border-green-500 opacity-50' : ''}
              hover:border-elite-gold
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.content : '?'}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Game 4: Color Perception (Canvas) ---

export const ColorPerception: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridSize, setGridSize] = useState(2);
  const [target, setTarget] = useState({row: 0, col: 0});

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Difficulty
    const size = Math.min(10, 2 + Math.floor(currentLevel / 2)); // 2x2 to 10x10
    setGridSize(size);

    // Color Logic
    const hue = Math.floor(Math.random() * 360);
    const baseLight = 50;
    // Difference gets smaller as level increases (20% -> 2%)
    const diff = Math.max(2, 20 - currentLevel); 
    const isLighter = Math.random() > 0.5;
    
    const tRow = Math.floor(Math.random() * size);
    const tCol = Math.floor(Math.random() * size);
    setTarget({ row: tRow, col: tCol });

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / size;
    const cellH = height / size;
    const gap = 4;

    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isTarget = r === tRow && c === tCol;
        const l = isTarget ? (isLighter ? baseLight + diff : baseLight - diff) : baseLight;
        
        ctx.fillStyle = `hsl(${hue}, 70%, ${l}%)`;
        ctx.fillRect(c * cellW + gap/2, r * cellH + gap/2, cellW - gap, cellH - gap);
      }
    }
  }, [currentLevel]);

  useEffect(() => {
    renderGame();
  }, [renderGame]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellW = canvas.width / gridSize;
    const cellH = canvas.height / gridSize;
    
    const clickedCol = Math.floor(x / cellW);
    const clickedRow = Math.floor(y / cellH);

    if (clickedRow === target.row && clickedCol === target.col) {
      onGameOver(currentLevel * 100, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Color Perception</h2>
      <EliteCard className="p-4 flex justify-center">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          onClick={handleClick}
          className="cursor-crosshair w-full max-w-[400px]"
        />
      </EliteCard>
    </div>
  );
};

// --- Game 5: Match & Mix (Math Memory) ---

export const MatchMix: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const pairCount = Math.min(10, 2 + Math.floor(currentLevel / 2.5));
    const newCards: Card[] = [];
    
    // Generate Equations
    for (let i = 0; i < pairCount; i++) {
      const a = Math.floor(Math.random() * (5 + currentLevel)) + 1;
      const b = Math.floor(Math.random() * (5 + currentLevel)) + 1;
      const op = Math.random() > 0.5 ? '+' : '-';
      
      let res = 0;
      let eq = '';
      
      if (op === '+') {
        res = a + b;
        eq = `${a} + ${b}`;
      } else {
        // Ensure positive for simplicity
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        res = big - small;
        eq = `${big} - ${small}`;
      }

      newCards.push({ id: i*2, content: eq, type: 'name', matchId: i*2+1, isFlipped: false, isMatched: false });
      newCards.push({ id: i*2+1, content: res.toString(), type: 'date', matchId: i*2, isFlipped: false, isMatched: false });
    }

    // Shuffle
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setFlipped([]);
    setIsLocked(false);
  }, [currentLevel]);

  const handleCardClick = (idx: number) => {
    if (isLocked || cards[idx].isFlipped || cards[idx].isMatched) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [firstIdx, secondIdx] = newFlipped;
      
      if (cards[firstIdx].matchId === cards[secondIdx].id) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlipped([]);
          setIsLocked(false);
          
          if (matchedCards.every(c => c.isMatched)) {
            onGameOver(currentLevel * 450, true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlipped([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Match & Mix</h2>
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => handleCardClick(idx)}
            className={`
              aspect-square cursor-pointer transition-all duration-300 transform border border-slate-800
              flex items-center justify-center p-2 text-sm md:text-xl font-serif
              ${card.isFlipped || card.isMatched ? 'bg-elite-surface text-elite-gold' : 'bg-[#0f141a] text-transparent hover:bg-[#151b22]'}
              ${card.isMatched ? 'border-elite-gold opacity-50' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.content : 'Σ'}
          </div>
        ))}
      </div>
    </div>
  );
};