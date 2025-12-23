import React, { useState, useEffect, useRef } from 'react';
import { GameProps } from '../types';
import { ELITE_STYLES } from '../constants';
import { EliteButton, EliteCard } from '../components/EliteComponents';
import { ArrowUp, ArrowDown, Zap, Search, Eye, Terminal } from 'lucide-react';

// --- Shared Utils ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Game 1: Investigation Signal (Ranking Logic) ---

export const InvestigationSignal: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [items, setItems] = useState<{id: string, val: number}[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [userOrder, setUserOrder] = useState<string[]>([]);

  useEffect(() => {
    // Generate Items
    const count = Math.min(6, 3 + Math.floor(currentLevel / 5));
    const newItems = [];
    const names = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT'];
    
    // Assign random unique values
    const usedVals = new Set();
    for (let i = 0; i < count; i++) {
      let val;
      do { val = randomInt(1, 100); } while (usedVals.has(val));
      usedVals.add(val);
      newItems.push({ id: names[i], val });
    }

    setItems(newItems);
    
    // Initialize user order (shuffled)
    const shuffled = [...newItems].sort(() => Math.random() - 0.5).map(i => i.id);
    setUserOrder(shuffled);

    // Generate Clues
    const newClues = [];
    // Sort items by value descending for logic generation reference
    const sortedRef = [...newItems].sort((a, b) => b.val - a.val); // High to Low

    // Generate relationships
    for (let i = 0; i < count - 1; i++) {
      const a = sortedRef[i];
      const b = sortedRef[i+1];
      
      // Direct clue
      if (Math.random() > 0.3) {
        newClues.push(`${a.id} has higher clearance than ${b.id}`);
      } else {
        // Obfuscated clue? Simulating simple strict order for now for reliability
        newClues.push(`${b.id} is lower ranked than ${a.id}`);
      }
    }
    
    // Add a random skip clue if level > 5 (e.g. 1 > 3)
    if (currentLevel > 5 && count > 2) {
      newClues.push(`${sortedRef[0].id} > ${sortedRef[2].id}`);
    }
    
    // Shuffle clues
    setClues(newClues.sort(() => Math.random() - 0.5));

  }, [currentLevel]);

  const moveItem = (index: number, direction: -1 | 1) => {
    if ((index === 0 && direction === -1) || (index === userOrder.length - 1 && direction === 1)) return;
    const newOrder = [...userOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + direction];
    newOrder[index + direction] = temp;
    setUserOrder(newOrder);
  };

  const submit = () => {
    // Check if order matches value magnitude (Highest first)
    const sortedCorrectly = [...items].sort((a, b) => b.val - a.val).map(i => i.id);
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(sortedCorrectly);
    
    if (isCorrect) {
      onGameOver(currentLevel * 300, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className={`${ELITE_STYLES.h2} text-center`}>Investigation Signal</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <EliteCard>
          <h3 className="text-elite-gold text-sm tracking-widest mb-4 border-b border-slate-800 pb-2">INTERCEPTED CLUES</h3>
          <ul className="space-y-2 text-xs md:text-sm font-mono text-slate-400">
            {clues.map((clue, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-elite-goldDim">[{i+1}]</span> {clue}
              </li>
            ))}
          </ul>
        </EliteCard>

        <div className="space-y-2">
           <h3 className="text-elite-gold text-sm tracking-widest mb-4 text-center">RANKING (HIGHEST TO LOWEST)</h3>
           {userOrder.map((id, index) => (
             <div key={id} className="bg-elite-surface border border-slate-700 p-3 flex justify-between items-center">
               <span className="font-serif text-white">{id}</span>
               <div className="flex gap-1">
                 <button onClick={() => moveItem(index, -1)} className="p-1 hover:text-elite-gold disabled:opacity-20"><ArrowUp size={16}/></button>
                 <button onClick={() => moveItem(index, 1)} className="p-1 hover:text-elite-gold disabled:opacity-20"><ArrowDown size={16}/></button>
               </div>
             </div>
           ))}
           <EliteButton variant="primary" onClick={submit} className="w-full mt-4">Establish Hierarchy</EliteButton>
        </div>
      </div>
    </div>
  );
};

// --- Game 2: Logic Circuit (Gates) ---

type GateType = 'AND' | 'OR' | 'XOR';

export const LogicCircuit: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [inputs, setInputs] = useState<boolean[]>([]);
  // We'll simulate a fixed structure: 2 layers.
  // Layer 1: 2 gates taking inputs (0,1) and (2,3)
  // Layer 2: 1 gate taking outputs of Layer 1
  const [gates, setGates] = useState<GateType[]>(['AND', 'AND', 'AND']);

  useEffect(() => {
    // 4 Inputs
    const newInputs = Array.from({length: 4}, () => Math.random() > 0.5);
    setInputs(newInputs);
    // Randomize initial gates
    setGates([randomGate(), randomGate(), randomGate()]);
  }, [currentLevel]);

  const randomGate = (): GateType => ['AND', 'OR', 'XOR'][randomInt(0, 2)] as GateType;

  const cycleGate = (index: number) => {
    const types: GateType[] = ['AND', 'OR', 'XOR'];
    const currentIdx = types.indexOf(gates[index]);
    const newGates = [...gates];
    newGates[index] = types[(currentIdx + 1) % 3];
    setGates(newGates);
  };

  const evalGate = (type: GateType, a: boolean, b: boolean) => {
    if (type === 'AND') return a && b;
    if (type === 'OR') return a || b;
    if (type === 'XOR') return a !== b;
    return false;
  };

  // Calculate state
  const mid1 = evalGate(gates[0], inputs[0], inputs[1]);
  const mid2 = evalGate(gates[1], inputs[2], inputs[3]);
  const final = evalGate(gates[2], mid1, mid2);

  const check = () => {
    if (final) {
      onGameOver(currentLevel * 250, true);
    } else {
      // Do nothing, visual feedback is enough
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Logic Circuit</h2>
      <p className="text-slate-500 mb-8 text-sm">Configure gates to energize the final node.</p>

      <EliteCard className="p-8 relative">
        <div className="flex justify-between items-center gap-4">
          
          {/* Inputs Column */}
          <div className="flex flex-col gap-8">
            {inputs.map((val, i) => (
              <div key={i} className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-xs ${val ? 'bg-green-900 border-green-500 text-green-200' : 'bg-red-900 border-red-500 text-red-200'}`}>
                {val ? '1' : '0'}
              </div>
            ))}
          </div>

          {/* Layer 1 Gates */}
          <div className="flex flex-col gap-16">
             {[0, 1].map(i => (
               <button 
                 key={i} 
                 onClick={() => cycleGate(i)}
                 className="w-16 h-12 border border-elite-gold bg-elite-base text-elite-gold font-bold text-xs hover:bg-elite-gold hover:text-black transition-colors"
               >
                 {gates[i]}
               </button>
             ))}
          </div>

          {/* Layer 2 Gate */}
          <div>
            <button 
                 onClick={() => cycleGate(2)}
                 className="w-16 h-12 border border-elite-gold bg-elite-base text-elite-gold font-bold text-xs hover:bg-elite-gold hover:text-black transition-colors"
               >
                 {gates[2]}
               </button>
          </div>

          {/* Output */}
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${final ? 'bg-elite-gold border-white shadow-[0_0_30px_#d4af37]' : 'bg-black border-slate-800'}`}>
            <Zap className={`w-8 h-8 ${final ? 'text-white' : 'text-slate-700'}`} />
          </div>
        </div>
        
        {/* Simple visual wires could be SVG lines here, omitted for brevity/cleanliness */}
      </EliteCard>

      <EliteButton variant="primary" onClick={check} disabled={!final} className="mt-8 w-full">
        ENGAGE SYSTEM
      </EliteButton>
    </div>
  );
};

// --- Game 3: Decryption (Function Guessing) ---

export const Decryption: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [logs, setLogs] = useState<{in: number, out: number}[]>([]);
  const [testInput, setTestInput] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  
  // The hidden function parameters
  const params = useRef({ m: 1, c: 0, type: 'linear' });

  useEffect(() => {
    // Generate Rule
    // Lvl 1-5: mx + c
    // Lvl 6+: x^2 + c or similar
    const type = currentLevel > 8 ? 'quadratic' : 'linear';
    const m = randomInt(2, currentLevel + 2);
    const c = randomInt(1, 10 + currentLevel);
    
    params.current = { m, c, type };
    setLogs([]);
    setTestInput("");
    setFinalAnswer("");
    setTargetX(randomInt(10, 20 + currentLevel));
  }, [currentLevel]);

  const calculate = (x: number) => {
    const { m, c, type } = params.current;
    if (type === 'linear') return (m * x) + c;
    if (type === 'quadratic') return (x * x) + (m * x) + c; // x^2 + mx + c
    return 0;
  };

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    const x = parseInt(testInput);
    if (isNaN(x)) return;
    setLogs([...logs, { in: x, out: calculate(x) }]);
    setTestInput("");
  };

  const handleSolve = () => {
    const ans = parseInt(finalAnswer);
    if (ans === calculate(targetX)) {
      onGameOver(currentLevel * 400, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className={`${ELITE_STYLES.h2} text-center`}>Decryption Protocol</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Test Console */}
        <EliteCard>
          <div className="flex items-center gap-2 mb-4 text-elite-gold">
            <Terminal size={18} />
            <span className="text-xs tracking-widest">INPUT PROBE</span>
          </div>
          <form onSubmit={handleTest} className="flex gap-2 mb-4">
            <input 
              type="number" 
              value={testInput} 
              onChange={e => setTestInput(e.target.value)}
              className={`${ELITE_STYLES.input} text-sm`}
              placeholder="Enter X..."
            />
            <EliteButton type="submit">TEST</EliteButton>
          </form>
          
          <div className="h-48 overflow-y-auto border border-slate-800 bg-black p-2 font-mono text-xs text-green-500">
            {logs.map((l, i) => (
              <div key={i}>
                &gt; f({l.in}) =&gt; {l.out}
              </div>
            ))}
            {logs.length === 0 && <span className="opacity-50">&gt; Awaiting input...</span>}
          </div>
        </EliteCard>

        {/* Challenge Panel */}
        <EliteCard className="flex flex-col justify-center">
           <h3 className="text-center text-slate-400 text-sm mb-6">SOLVE FOR TARGET</h3>
           <div className="text-center mb-6">
             <span className="font-serif text-3xl text-white">f({targetX}) = ?</span>
           </div>
           
           <input 
              type="number" 
              value={finalAnswer} 
              onChange={e => setFinalAnswer(e.target.value)}
              className={ELITE_STYLES.input}
              placeholder="Solution"
            />
            <EliteButton variant="primary" onClick={handleSolve} className="mt-4 w-full">DECRYPT</EliteButton>
        </EliteCard>
      </div>
    </div>
  );
};

// --- Game 4: Numerical Sequence War ---

export const NumericalSequence: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [sequence, setSequence] = useState<(number | null)[]>([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [correctValue, setCorrectValue] = useState(0);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Determine Pattern
    const start = randomInt(1, 10);
    const step = randomInt(2, 5 + currentLevel);
    const type = currentLevel < 5 ? 'add' : currentLevel < 10 ? 'mult' : currentLevel < 15 ? 'square' : 'fib';
    
    let arr: number[] = [];
    
    if (type === 'add') {
      arr = [start, start + step, start + step*2, start + step*3, start + step*4];
    } else if (type === 'mult') {
      arr = [start, start * step, start * step*step, start * step*step*step, start * Math.pow(step, 4)];
    } else if (type === 'square') {
      arr = [1, 2, 3, 4, 5].map(n => (n + start) ** 2);
    } else {
      // Fibonacci-ish
      arr = [start, step];
      for (let i = 2; i < 6; i++) {
        arr[i] = arr[i-1] + arr[i-2];
      }
    }

    const missing = randomInt(1, arr.length - 2); // Don't hide first or last usually
    setMissingIndex(missing);
    setCorrectValue(arr[missing]);
    
    const displayArr = [...arr];
    // @ts-ignore
    displayArr[missing] = null; 
    setSequence(displayArr);
    setInput("");

  }, [currentLevel]);

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === correctValue) {
      onGameOver(currentLevel * 350, true);
    } else {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Numerical Sequence</h2>
      <EliteCard className="py-12">
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {sequence.map((num, i) => (
             <div key={i} className={`text-2xl md:text-4xl font-serif ${i === missingIndex ? 'text-elite-gold' : 'text-slate-500'}`}>
               {num === null ? '[?]' : num}
               {i < sequence.length - 1 && <span className="text-slate-700 ml-4">,</span>}
             </div>
          ))}
        </div>
        
        <form onSubmit={check} className="max-w-xs mx-auto">
          <input 
            type="number" 
            value={input}
            onChange={e => setInput(e.target.value)}
            className={ELITE_STYLES.input}
            autoFocus
          />
          <EliteButton variant="primary" type="submit" className="w-full mt-4">COMPLETE SEQUENCE</EliteButton>
        </form>
      </EliteCard>
    </div>
  );
};

// --- Game 5: Find Me (Deduction Grid) ---

export const FindMe: React.FC<GameProps> = ({ currentLevel, onGameOver }) => {
  const [gridSize, setGridSize] = useState(5);
  const [target, setTarget] = useState({r:0, c:0});
  const [guesses, setGuesses] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(5);
  const [msg, setMsg] = useState("Click to scan sector");
  const [history, setHistory] = useState<{r:number, c:number, dist:number}[]>([]);

  useEffect(() => {
    const size = Math.min(10, 5 + Math.floor(currentLevel / 3));
    setGridSize(size);
    setTarget({ r: randomInt(0, size-1), c: randomInt(0, size-1) });
    setGuesses(0);
    setMaxGuesses(Math.max(3, 8 - Math.floor(currentLevel / 4))); // Guesses decrease or stay tight
    setHistory([]);
    setMsg("Awaiting Scan...");
  }, [currentLevel]);

  const handleCellClick = (r: number, c: number) => {
    if (history.some(h => h.r === r && h.c === c)) return;

    // Calc Manhattan Distance
    const dist = Math.abs(target.r - r) + Math.abs(target.c - c);
    
    if (dist === 0) {
      onGameOver(currentLevel * 500 + (maxGuesses - guesses) * 100, true);
      return;
    }

    const newGuesses = guesses + 1;
    setGuesses(newGuesses);
    setHistory([...history, {r, c, dist}]);
    setMsg(`Distance to target: ${dist}`);

    if (newGuesses >= maxGuesses) {
      onGameOver(0, false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className={ELITE_STYLES.h2}>Find Me</h2>
      <div className="flex justify-between items-center mb-4 px-4 font-mono text-xs text-elite-gold">
         <span>SCANS: {guesses}/{maxGuesses}</span>
         <span>{msg}</span>
      </div>

      <EliteCard className="p-4 flex justify-center">
        <div 
          className="grid gap-1 bg-slate-900 border border-slate-800 p-1"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({length: gridSize * gridSize}).map((_, i) => {
            const r = Math.floor(i / gridSize);
            const c = i % gridSize;
            const scan = history.find(h => h.r === r && h.c === c);
            
            return (
              <button
                key={i}
                onClick={() => handleCellClick(r, c)}
                className={`
                   w-8 h-8 md:w-10 md:h-10 text-xs font-bold transition-all duration-200
                   ${scan ? 'bg-slate-800 text-white' : 'bg-elite-surface hover:bg-slate-800'}
                `}
              >
                {scan ? scan.dist : ''}
              </button>
            );
          })}
        </div>
      </EliteCard>
    </div>
  );
};