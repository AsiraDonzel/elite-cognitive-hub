import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';

// --- Shared Utilities ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Game 1: The 300 (Rapid Fire) ---

export const The300: React.FC<GameProps> = ({ currentLevel, onGameOver, onRegisterSolution }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const REQUIRED_STREAK = 5;

  const generateLevel = useCallback((lvl: number) => {
    let q = "", a = 0, sol = "";
    
    if (lvl <= 5) {
      const x = randomInt(5 * lvl, 10 * lvl);
      const y = randomInt(2, 20);
      const op = Math.random() > 0.5 ? '+' : '-';
      a = op === '+' ? x + y : x - y;
      q = `${x} ${op} ${y}`;
      // SAVANT LOGIC: Simplified Arithmetic
      sol = `ELITE METHODOLOGY:\n1. DECONSTRUCT: View ${x} as base units.\n2. OPERATION: Apply ${op} ${y}.\n3. RESULT: ${a}.`;
    } 
    else if (lvl <= 12) {
      const x = randomInt(3, 8 + lvl);
      const y = randomInt(3, 10);
      const z = randomInt(1, 20);
      a = (x * y) - z;
      q = `${x} × ${y} - ${z}`;
      // SAVANT LOGIC: Order of Operations
      sol = `ELITE METHODOLOGY:\n1. MULTIPLY: Calculate ${x} × ${y} = ${x*y}.\n2. SUBTRACT: Reduce by ${z}.\n3. FINAL: ${a}.`;
    } 
    else {
      const x = randomInt(10, 10 + lvl);
      const y = randomInt(10, 20);
      const z = randomInt(50, 200);
      const mult = x * y;
      const op = mult > z ? '-' : '+';
      a = op === '-' ? mult - z : mult + z;
      q = `(${x} × ${y}) ${op} ${z}`;
      // SAVANT LOGIC: Distribution Method
      sol = `ELITE METHODOLOGY:\n1. DISTRIBUTION: (${x} × 10) + (${x} × ${y-10}) = ${mult}.\n2. OFFSET: Apply ${op} ${z}.\n3. RESULT: ${a}.`;
    }

    return { q, a, sol };
  }, []);

  const nextQuestion = () => {
    const { q, a, sol } = generateLevel(currentLevel);
    setQuestion(q);
    setAnswer(a);
    setInput("");
    onRegisterSolution(sol); //
  };

  useEffect(() => {
    nextQuestion();
  }, [currentLevel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === answer) {
      if (streak + 1 >= REQUIRED_STREAK) {
        onGameOver(currentLevel * 300, true);
      } else {
        setStreak(s => s + 1);
        nextQuestion();
      }
    } else {
      onGameOver(streak * 10, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>The 300</h2>
      <p className="text-slate-500 mb-4">Complete {REQUIRED_STREAK} equations to advance.</p>
      <EliteCard className="py-12">
        <div className="font-serif text-4xl md:text-5xl text-elite-gold mb-8 tracking-widest">
          {question}
        </div>
        <form onSubmit={handleSubmit}>
          <input 
            type="number" 
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            className={ELITE_STYLES.input}
            placeholder="?"
          />
          <div className="mt-4 flex justify-between text-xs text-slate-500 uppercase tracking-widest">
            <span>Level {currentLevel}</span>
            <span>Streak: {streak}/{REQUIRED_STREAK}</span>
          </div>
        </form>
      </EliteCard>
    </div>
  );
};

// --- Game 2: Formula Archery ---

export const FormulaArchery: React.FC<GameProps> = ({ currentLevel, onGameOver, onRegisterSolution }) => {
  const [equation, setEquation] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [input, setInput] = useState("");

  const generateLevel = useCallback((lvl: number) => {
    const a = lvl <= 5 ? 1 : randomInt(2, Math.ceil(lvl / 2));
    const x = randomInt(1, 10 + lvl);
    const b = randomInt(1, 10 * lvl);
    const c = (a * x) + b;
    
    const eq = a === 1 ? `x + ${b} = ${c}` : `${a}x + ${b} = ${c}`;
    // SAVANT LOGIC: Isolation Principle
    const sol = `ELITE METHODOLOGY:\n1. ISOLATION: Subtract ${b} from both sides (${c} - ${b} = ${c-b}).\n2. DIVISION: ${a > 1 ? `Divide ${c-b} by ${a}` : 'Direct result'}.\n3. X = ${x}.`;
    
    return { eq, x, sol };
  }, []);

  useEffect(() => {
    const { eq, x, sol } = generateLevel(currentLevel);
    setEquation(eq);
    setTargetX(x);
    onRegisterSolution(sol);
  }, [currentLevel, generateLevel, onRegisterSolution]);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === targetX) {
      onGameOver(currentLevel * 400, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Formula Archery</h2>
      <EliteCard className="py-12">
        <div className="font-serif text-3xl md:text-4xl text-white mb-8 tracking-wide">
          {equation}
        </div>
        <form onSubmit={check} className="flex gap-4 items-center justify-center">
          <span className="font-serif text-2xl text-elite-gold">x =</span>
          <input 
            type="number" 
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            className={`${ELITE_STYLES.input} w-32`}
          />
        </form>
        <EliteButton onClick={check} className="mt-8 w-full">Fire Solution</EliteButton>
      </EliteCard>
    </div>
  );
};

// --- Game 3: Number Target ---

export const NumberTarget: React.FC<GameProps> = ({ currentLevel, onGameOver, onRegisterSolution }) => {
  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [input, setInput] = useState("");

  const generateLevel = useCallback((lvl: number) => {
    const numCount = 4;
    const nums = Array.from({length: numCount}, () => randomInt(2, 5 + lvl));
    let runningTotal = nums[0];
    let pathExplanation = `${nums[0]}`;
    
    for (let i = 1; i < nums.length; i++) {
      const op = lvl < 10 ? 0 : randomInt(0, 1);
      if (op === 0) {
        runningTotal += nums[i];
        pathExplanation = `(${pathExplanation} + ${nums[i]})`;
      } else {
        runningTotal *= nums[i];
        pathExplanation = `(${pathExplanation} × ${nums[i]})`;
      }
    }
    
    // SAVANT LOGIC: Constructive Path
    const sol = `ELITE METHODOLOGY:\n1. BASE: Start with ${nums[0]}.\n2. CONSTRUCTION: Follow the sequence ${pathExplanation}.\n3. TARGET REACHED: ${runningTotal}.`;
    return { nums, target: runningTotal, sol };
  }, []);
  
  useEffect(() => {
    const { nums, target, sol } = generateLevel(currentLevel);
    setNumbers(nums);
    setTarget(target);
    onRegisterSolution(sol);
    setInput("");
  }, [currentLevel, generateLevel, onRegisterSolution]);

  const handleVal = (v: string) => setInput(prev => prev + v);
  
  const submit = () => {
    try {
      const result = eval(input.replace(/×/g, '*')); 
      if (result === target) {
        onGameOver(currentLevel * 500, true);
      } else {
        onGameOver(0, false);
      }
    } catch {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Number Target</h2>
      <EliteCard className="p-6">
        <div className="mb-6">
          <span className="text-slate-500 text-sm uppercase tracking-widest block mb-2">Target Lock</span>
          <span className="text-5xl font-serif text-elite-gold">{target}</span>
        </div>
        <div className="bg-elite-base p-4 border border-slate-800 mb-6 font-mono text-xl min-h-[60px] flex items-center justify-center text-white">
          {input || <span className="text-slate-700">Select sequence...</span>}
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {numbers.map((n, i) => (
            <button key={i} onClick={() => handleVal(n.toString())} className="p-4 border border-slate-700 hover:bg-slate-800 text-xl font-serif">{n}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {['+', '-', '*', '(', ')'].map(op => (
            <button key={op} onClick={() => handleVal(op)} className="p-3 border border-elite-gold/30 text-elite-gold hover:bg-elite-gold/10 font-bold">{op}</button>
          ))}
          <button onClick={() => setInput('')} className="p-3 border border-red-900 text-red-500 hover:bg-red-900/20">CLR</button>
        </div>
        <EliteButton variant="primary" onClick={submit} className="w-full">Execute</EliteButton>
      </EliteCard>
    </div>
  );
};

// --- Game 4: Prime Number Check ---

// --- Game 4: Prime Number Check (STABILIZED & OVERLAY FIXED) ---

export const PrimeNumberCheck: React.FC<GameProps> = ({ currentLevel, onGameOver, onRegisterSolution }) => {
  const [number, setNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7.5);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isPrime = (num: number) => {
    if (num <= 1) return false;
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
      if (num % i === 0) return false;
    return true;
  };

  const getSmallestFactor = (num: number) => {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
      if (num % i === 0) return i;
    return 1;
  };

  const startRound = useCallback(() => {
    const min = 10 + (currentLevel * 20);
    const max = 50 + (currentLevel * 100);
    let n = randomInt(min, max);
    const wantPrime = Math.random() < 0.4;

    if (wantPrime) {
      while (!isPrime(n)) n++;
    } else {
      while (isPrime(n)) n++;
    }

    setNumber(n);
    const truth = isPrime(n);

    // Generate Solution for Briefing
    let sol = "";
    if (truth) {
      sol = `ELITE METHODOLOGY:\n1. ESTIMATION: Sqrt(${n}) ≈ ${Math.floor(Math.sqrt(n))}.\n2. TEST: Check divisibility by 2, 3, 5, 7...\n3. VERIFIED: No factors found. Target is PRIME.`;
    } else {
      const factor = getSmallestFactor(n);
      sol = `ELITE METHODOLOGY:\n1. DIVISIBILITY: Sum of digits or last digit test.\n2. FACTOR: Found divisor ${factor}.\n3. RESULT: Composite (${factor} × ${n / factor}).`;
    }

    onRegisterSolution(sol);
    setTimeLeft(Math.max(3.0, 7.5 - (currentLevel * 0.22)));
    setIsActive(true);
  }, [currentLevel, onRegisterSolution]);

  // Initialize only once per level change
  useEffect(() => {
    startRound();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startRound]);

  // Timer logic decoupled from number generation
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false);
          // TRIGGERS FAILURE OVERLAY ON TIMEOUT
          onGameOver(0, false); 
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, onGameOver]);

  const handleChoice = (choiceIsPrime: boolean) => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const truth = isPrime(number);
    if (choiceIsPrime === truth) {
      // SUCCESS: Progress to next level
      onGameOver(currentLevel * 200 + Math.floor(timeLeft * 100), true); 
    } else {
      // FAILURE: Triggers the retry/solution overlay
      onGameOver(0, false); 
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Prime Check</h2>
      <EliteCard className="py-12">
        <div className="mb-2 h-2 w-full bg-slate-800">
          <div 
            className="h-full bg-elite-gold transition-all duration-100 ease-linear" 
            style={{ width: `${(timeLeft / 7.5) * 100}%` }} 
          />
        </div>
        <div className="text-xs text-right text-slate-500 mb-8 font-mono">{timeLeft.toFixed(1)}s</div>
        <div className="font-serif text-6xl text-white mb-12 tracking-tighter">{number}</div>
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => handleChoice(true)} 
            className="py-4 border border-green-800 text-green-500 hover:bg-green-900/30 font-serif"
          >
            Prime
          </button>
          <button 
            onClick={() => handleChoice(false)} 
            className="py-4 border border-red-800 text-red-500 hover:bg-red-900/30 font-serif"
          >
            Composite
          </button>
        </div>
      </EliteCard>
    </div>
  );
};

// --- Game 5: Equation Battle ---

export const EquationBattle: React.FC<GameProps> = ({ currentLevel, onGameOver, onRegisterSolution }) => {
  const [left, setLeft] = useState({ text: "", val: 0 });
  const [right, setRight] = useState({ text: "", val: 0 });

  const genExp = useCallback((lvl: number) => {
    const x = randomInt(lvl, lvl * 10);
    const y = randomInt(2, 10);
    const op = ['+', '-', '*'][randomInt(0, 2)];
    let val = 0;
    if (op === '+') val = x + y;
    if (op === '-') val = x - y;
    if (op === '*') val = x * y;
    return { text: `${x} ${op === '*' ? '×' : op} ${y}`, val };
  }, []);

  const generateLevel = useCallback((lvl: number) => {
    const l = genExp(lvl);
    let r = Math.random() < 0.3 ? { ...l, text: l.text.split(' ').reverse().join(' ') } : genExp(lvl);
    
    if (r.val === l.val && Math.random() > 0.5) {
       r.val += randomInt(1, 5);
       r.text = `${r.val} + 0`;
    }

    const relation = l.val > r.val ? '>' : l.val < r.val ? '<' : '=';
    // SAVANT LOGIC: Parallel Processing
    const sol = `ELITE METHODOLOGY:\n1. LEFT: ${l.text} = ${l.val}.\n2. RIGHT: ${r.text} = ${r.val}.\n3. DEDUCTION: ${l.val} ${relation} ${r.val}.`;

    return { l, r, sol };
  }, [genExp]);

  useEffect(() => {
    const { l, r, sol } = generateLevel(currentLevel);
    setLeft(l);
    setRight(r);
    onRegisterSolution(sol);
  }, [currentLevel, generateLevel, onRegisterSolution]);

  const decide = (operator: '>' | '<' | '=') => {
    let correct = false;
    if (operator === '>' && left.val > right.val) correct = true;
    if (operator === '<' && left.val < right.val) correct = true;
    if (operator === '=' && left.val === right.val) correct = true;

    if (correct) {
      onGameOver(currentLevel * 250, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Equation Battle</h2>
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center mt-12">
        <EliteCard className="w-full p-8 flex items-center justify-center min-h-[150px]">
           <span className="font-serif text-2xl text-slate-300">{left.text}</span>
        </EliteCard>
        <div className="flex flex-col gap-2 shrink-0">
          <EliteButton onClick={() => decide('>')} className="text-xl px-4">&gt;</EliteButton>
          <EliteButton onClick={() => decide('=')} className="text-xl px-4">=</EliteButton>
          <EliteButton onClick={() => decide('<')} className="text-xl px-4">&lt;</EliteButton>
        </div>
        <EliteCard className="w-full p-8 flex items-center justify-center min-h-[150px]">
           <span className="font-serif text-2xl text-slate-300">{right.text}</span>
        </EliteCard>
      </div>
    </div>
  );
};