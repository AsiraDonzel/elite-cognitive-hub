import React, { useState, useEffect, useCallback } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';

const PatternMatrix: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'showing' | 'playing' | 'result'>('showing');
  const [message, setMessage] = useState("Memorize the pattern");

  // Determine difficulty based on level
  useEffect(() => {
    // Level 1-5: 3x3, Level 6-10: 4x4, Level 11+: 5x5
    const size = currentLevel <= 5 ? 3 : currentLevel <= 10 ? 4 : 5;
    setGridSize(size);
    startRound(size, currentLevel + 2); // Sequence length increases with level
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  const startRound = useCallback((size: number, length: number) => {
    const newPattern: number[] = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(Math.floor(Math.random() * (size * size)));
    }
    setPattern(newPattern);
    setUserSequence([]);
    setGameState('showing');
    setMessage("Memorize...");
    
    // Show pattern logic
    let i = 0;
    const interval = setInterval(() => {
      // Logic handled in render by checking index vs active display
    }, 800);
    
    setTimeout(() => {
      clearInterval(interval);
      setGameState('playing');
      setMessage("Repeat the pattern");
    }, 1000 * length + 500);

  }, []);

  const handleCellClick = (index: number) => {
    if (gameState !== 'playing') return;

    const newSequence = [...userSequence, index];
    setUserSequence(newSequence);

    // Validate
    const checkIndex = newSequence.length - 1;
    if (newSequence[checkIndex] !== pattern[checkIndex]) {
      setGameState('result');
      setMessage("Sequence Failed");
      setTimeout(() => onGameOver(currentLevel * 100, false), 1500);
      return;
    }

    if (newSequence.length === pattern.length) {
      setGameState('result');
      setMessage("Pattern Verified");
      setTimeout(() => onGameOver(currentLevel * 500, true), 1500);
    }
  };

  const [activeCell, setActiveCell] = useState<number | null>(null);

  // Effect to visualize pattern
  useEffect(() => {
    if (gameState === 'showing') {
      let i = 0;
      const interval = setInterval(() => {
        if (i >= pattern.length) {
          setActiveCell(null);
          clearInterval(interval);
        } else {
          setActiveCell(pattern[i]);
          setTimeout(() => setActiveCell(null), 500);
          i++;
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [gameState, pattern]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <h2 className={ELITE_STYLES.h2}>Level {currentLevel}: Pattern Matrix</h2>
      <p className="text-elite-gold mb-6 font-mono text-lg">{message}</p>

      <EliteCard className="p-8">
        <div 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={gameState !== 'playing'}
              className={`
                w-16 h-16 md:w-20 md:h-20 border transition-all duration-200
                ${activeCell === i ? 'bg-elite-gold border-white shadow-[0_0_20px_#d4af37]' : ''}
                ${userSequence.includes(i) && gameState === 'result' ? 'bg-green-900 border-green-500' : ''}
                ${gameState === 'playing' ? 'border-slate-700 hover:border-elite-gold hover:bg-elite-surface' : 'border-slate-800 cursor-default'}
              `}
            />
          ))}
        </div>
      </EliteCard>
      
      <div className="mt-8 text-center text-xs text-gray-600 font-sans">
        MEMORY STABILITY: {Math.max(0, 100 - userSequence.length * 5)}%
      </div>
    </div>
  );
};

export default PatternMatrix;