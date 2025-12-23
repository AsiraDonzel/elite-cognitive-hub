import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../types';
import { EliteLeagueHub } from '../services/EliteLeagueHub';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard, EliteLoader } from './EliteComponents';
import { getCoachAdvice } from '../services/geminiService';
import { Sparkles, Clock, Lock, ArrowRight, BookOpen, RotateCcw, Play, Info } from 'lucide-react';
import tutorialData from '../data/TutorialData.json';

interface ArenaProps {
  activeGame: GameDefinition | null;
}

type GameState = 'playing' | 'won' | 'lost';

const Arena: React.FC<ArenaProps> = ({ activeGame }) => {
  const [key, setKey] = useState(0); 
  const [gameState, setGameState] = useState<GameState>('playing');
  const [seconds, setSeconds] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionText, setSolutionText] = useState<string | null>(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  
  const [isBriefing, setIsBriefing] = useState(false);
  const [hasSeenBriefing, setHasSeenBriefing] = useState(false);

  const [registeredSolution, setRegisteredSolution] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const stats = activeGame ? EliteLeagueHub.getGameStats(activeGame.id) : { unlockedLevels: 1, highScore: 0 };
  const maxLevel = 20;

  useEffect(() => {
    if (activeGame) {
      setGameState('playing');
      setSeconds(0);
      setShowSolution(false);
      setSolutionText(null);
      setRegisteredSolution(null);
      
      if (stats.unlockedLevels === 1 && !hasSeenBriefing) {
        setIsBriefing(true);
        stopTimer(); 
      } else {
        setIsBriefing(false);
        startTimer();
      }
    }
    return () => stopTimer();
  }, [activeGame, key, stats.unlockedLevels, hasSeenBriefing]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleBeginChallenge = () => {
    setIsBriefing(false);
    setHasSeenBriefing(true);
    startTimer();
  };

  const handleGameOver = useCallback((score: number, success: boolean = false) => {
    stopTimer();
    
    setShowSolution(false);
    setIsBriefing(false);
    
    setGameState(success ? 'won' : 'lost');

    if (success && activeGame) {
      EliteLeagueHub.completeLevel(activeGame.id, stats.unlockedLevels, score);
    }
  }, [activeGame, stats.unlockedLevels]);

  const handleRegisterSolution = useCallback((solution: string) => {
    setRegisteredSolution(solution);
  }, []);

  const handleNextLevel = () => {
    if (stats.unlockedLevels < maxLevel) {
      setKey(k => k + 1);
    }
  };

  const handleRetry = () => {
    setKey(k => k + 1);
  };

  const handleShowSolution = async () => {
    setShowSolution(true);
    if (registeredSolution) {
      setSolutionText(registeredSolution);
      return;
    }
    if (!solutionText && activeGame) {
      setLoadingSolution(true);
      const analysis = await getCoachAdvice(activeGame.name, stats.unlockedLevels, 'loss'); 
      setSolutionText(analysis);
      setLoadingSolution(false);
    }
  };

  const handleGiveUp = () => {
    stopTimer();
    handleGameOver(0, false); 
    handleShowSolution();
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!activeGame) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#0a0e14]">
        <h2 className="text-4xl font-serif text-elite-gold tracking-widest uppercase">ARENA IDLE</h2>
      </div>
    );
  }

  const GameComponent = activeGame.component;

  const cleanId = activeGame.id
    .toUpperCase()
    .replace(/\s+/g, '')        
    .replace(/_/g, '')          
    .replace(/[^A-Z0-9]/g, ''); 

  const gameData = (tutorialData.games as any)[cleanId];

  return (
    <main className="flex-1 h-full relative flex flex-col overflow-hidden bg-elite-base">
      <div className="h-20 border-b border-slate-800 bg-elite-surface/80 backdrop-blur flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-lg font-serif text-white tracking-widest uppercase">{activeGame.name}</h1>
          <div className="text-xs text-elite-gold font-mono">{activeGame.category} Tier</div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end min-w-[100px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Level Progress</span>
            <div className="font-serif text-xl text-white">{stats.unlockedLevels} / {maxLevel}</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col items-end min-w-[80px]">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Time</span>
            <div className={`font-mono text-xl ${gameState === 'playing' ? 'text-elite-gold' : 'text-slate-400'}`}>{formatTime(seconds)}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center relative z-10">
        <div className="w-full max-w-4xl relative">
          
          {isBriefing && (
            <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
              <EliteCard className="max-w-xl w-full p-8 border-elite-gold/50 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                <div className="flex items-center gap-3 text-elite-gold mb-4">
                  <Info size={24} />
                  <h2 className="text-2xl font-serif tracking-[0.2em] uppercase">Tactical Briefing</h2>
                </div>
                <div className="space-y-6 mb-8 text-left">
                  <div className="p-4 bg-elite-gold/10 border border-elite-gold/30">
                    <h3 className="text-xs font-mono text-elite-gold uppercase tracking-widest mb-3">Mission Protocol (How to Play)</h3>
                    <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-wrap text-sm">
                      {gameData?.howToPlay || "DATA ERROR: Logic not found for ID: " + cleanId}
                    </p>
                  </div>
                </div>
                <EliteButton variant="primary" onClick={handleBeginChallenge} className="w-full">Initialize Challenge</EliteButton>
              </EliteCard>
            </div>
          )}

          <div className={`
            ${gameState !== 'playing' ? 'opacity-20 pointer-events-none filter grayscale' : ''} 
            ${isBriefing ? 'blur-md pointer-events-none' : ''}
            transition-all duration-700
          `}>
             <GameComponent 
               key={`${activeGame.id}-${stats.unlockedLevels}-${key}`} 
               currentLevel={stats.unlockedLevels}
               onGameOver={handleGameOver}
               onRegisterSolution={handleRegisterSolution}
             />
          </div>

          {gameState !== 'playing' && !showSolution && (
            <div className="absolute inset-0 flex items-center justify-center z-[70] animate-fadeIn">
              <EliteCard className="p-8 w-full max-w-md text-center border-2 border-elite-gold bg-black shadow-[0_0_60px_rgba(212,175,55,0.3)]">
                {gameState === 'won' ? (
                  <>
                    <h2 className="text-3xl font-serif text-elite-gold mb-2 tracking-widest uppercase">Level Cleared</h2>
                    <p className="text-slate-400 font-mono text-sm mb-8">Performance verified in {formatTime(seconds)}.</p>
                    <div className="flex flex-col gap-3">
                      {stats.unlockedLevels < maxLevel ? (
                        <EliteButton variant="primary" onClick={handleNextLevel} className="w-full flex items-center justify-center gap-2">
                          Next Level <ArrowRight size={16} />
                        </EliteButton>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-green-500 font-serif text-xl border border-green-900 p-4 bg-green-900/20 uppercase tracking-widest">Mastery Achieved</div>
                          
                          {/* Protocol Reset Button integrated here */}
                          <button 
                            onClick={() => {
                              if(window.confirm("PROTOCOL RESET: This will permanently wipe all neural progress across ALL sectors. Proceed?")) {
                                EliteLeagueHub.resetAllProgress();
                              }
                            }}
                            className="text-[10px] text-red-900 hover:text-red-500 font-mono underline uppercase tracking-[0.2em] transition-colors"
                          >
                            Terminate Career & Reset All Progress
                          </button>
                        </div>
                      )}
                      <EliteButton onClick={handleShowSolution} className="w-full flex items-center justify-center gap-2 text-xs"><BookOpen size={14} /> Review Solution</EliteButton>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-serif text-red-500 mb-2 tracking-widest uppercase">Mission Failed</h2>
                    <p className="text-slate-400 font-mono text-sm mb-8">Pattern recognition failed.</p>
                    <div className="flex flex-col gap-3">
                      <EliteButton variant="primary" onClick={handleRetry} className="w-full flex items-center justify-center gap-2"><RotateCcw size={16} /> Retry Level</EliteButton>
                      <EliteButton onClick={handleShowSolution} className="w-full flex items-center justify-center gap-2 text-xs"><Lock size={14} /> Reveal Solution</EliteButton>
                    </div>
                  </>
                )}
              </EliteCard>
            </div>
          )}
        </div>
      </div>

      {showSolution && (
        <div className="absolute inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-elite-surface border border-elite-gold p-8 max-w-2xl w-full shadow-2xl relative">
            <h3 className="text-xl font-serif text-elite-gold mb-6 flex items-center gap-2"><Sparkles size={18} /> ELITE SOLUTION ANALYSIS</h3>
            <div className="bg-black border border-slate-800 p-6 min-h-[200px] font-mono text-sm text-slate-300 leading-relaxed overflow-y-auto max-h-[50vh]">
              {loadingSolution ? <EliteLoader /> : <div className="whitespace-pre-wrap">{solutionText || "No analysis available."}</div>}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <EliteButton onClick={() => setShowSolution(false)}>Close</EliteButton>
              {gameState === 'lost' && <EliteButton variant="primary" onClick={handleRetry}>Retry Level</EliteButton>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Arena;