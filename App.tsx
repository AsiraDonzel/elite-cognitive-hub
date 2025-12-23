import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Arena from './components/Arena';
import { GameDefinition } from './types';
import PatternMatrix from './games/PatternMatrix';
import NebulaTrivia from './games/NebulaTrivia';
import { The300, FormulaArchery, NumberTarget, PrimeNumberCheck, EquationBattle } from './games/MathGames';
import { BlindSudoku, PixelNumber, BirthDate, ColorPerception, MatchMix } from './games/MemoryGames';
import { InvestigationSignal, LogicCircuit, Decryption, NumericalSequence, FindMe } from './games/LogicGames';
import { RotationRPS, TripleMaze, ExitStrategy, TrailOfDice, PyramidGame } from './games/SpatialGames';
import { SilentChess, BlackWhite, RPSChess, PerfectNumber, BalanceLogic } from './games/FinalGames';
import { ELITE_STYLES, GAMES_LIST } from './constants';

const GAMES: GameDefinition[] = [
  // --- EASY (Reaction & Simple Memory) ---
  {
    id: GAMES_LIST.MATRIX,
    name: 'Pattern Matrix',
    description: 'High-speed grid memory challenge.',
    category: 'Easy',
    component: PatternMatrix,
    icon: 'cpu'
  },
  {
    id: GAMES_LIST.TRIVIA,
    name: 'Nebula Trivia',
    description: 'General knowledge database access.',
    category: 'Easy',
    component: NebulaTrivia,
    icon: 'brain'
  },
  {
    id: GAMES_LIST.THE_300,
    name: 'The 300',
    description: 'Arithmetic endurance test.',
    category: 'Easy',
    component: The300,
    icon: 'zap'
  },
  {
    id: GAMES_LIST.COLOR,
    name: 'Color Perception',
    description: 'Visual spectrum anomaly detection.',
    category: 'Easy',
    component: ColorPerception,
    icon: 'eye'
  },
  {
    id: GAMES_LIST.MATCH,
    name: 'Match & Mix',
    description: 'Equation pairing protocol.',
    category: 'Easy',
    component: MatchMix,
    icon: 'copy'
  },
  {
    id: GAMES_LIST.DICE,
    name: 'Trail of Dice',
    description: '3D geometry simulation.',
    category: 'Easy',
    component: TrailOfDice,
    icon: 'box'
  },

  // --- INTERMEDIATE (Logic & Pattern Recognition) ---
  {
    id: GAMES_LIST.SUDOKU,
    name: 'Blind Sudoku',
    description: 'Grid structure reconstruction.',
    category: 'Intermediate',
    component: BlindSudoku,
    icon: 'grid'
  },
  {
    id: GAMES_LIST.FORMULA,
    name: 'Formula Archery',
    description: 'Precision variable isolation.',
    category: 'Intermediate',
    component: FormulaArchery,
    icon: 'target'
  },
  {
    id: GAMES_LIST.PIXEL,
    name: 'Pixel Number',
    description: 'Data fragment reconstruction.',
    category: 'Intermediate',
    component: PixelNumber,
    icon: 'image'
  },
  {
    id: GAMES_LIST.SIGNAL,
    name: 'Investigation Signal',
    description: 'Hierarchy deduction from clues.',
    category: 'Intermediate',
    component: InvestigationSignal,
    icon: 'radio'
  },
  {
    id: GAMES_LIST.SEQUENCE,
    name: 'Numerical Sequence',
    description: 'Pattern identification.',
    category: 'Intermediate',
    component: NumericalSequence,
    icon: 'list'
  },
  {
    id: GAMES_LIST.RPS,
    name: 'Rotation! RPS',
    description: 'Anticipatory cyclic logic.',
    category: 'Intermediate',
    component: RotationRPS,
    icon: 'refresh-ccw'
  },
  {
    id: GAMES_LIST.FINDME,
    name: 'Find Me',
    description: 'Triangulation via proximity.',
    category: 'Intermediate',
    component: FindMe,
    icon: 'search'
  },
  {
    id: GAMES_LIST.TARGET,
    name: 'Number Target',
    description: 'Solution construction.',
    category: 'Intermediate',
    component: NumberTarget,
    icon: 'crosshair'
  },

  // --- ADVANCED (Complex Strategy & Multi-step) ---
  {
    id: GAMES_LIST.CIRCUIT,
    name: 'Logic Circuit',
    description: 'Gate logic restoration.',
    category: 'Advanced',
    component: LogicCircuit,
    icon: 'zap'
  },
  {
    id: GAMES_LIST.DECRYPTION,
    name: 'Decryption',
    description: 'Black box algorithm cracking.',
    category: 'Advanced',
    component: Decryption,
    icon: 'terminal'
  },
  {
    id: GAMES_LIST.TRIPLE,
    name: 'Triple Maze',
    description: 'Multi-dimensional navigation.',
    category: 'Advanced',
    component: TripleMaze,
    icon: 'layers'
  },
  {
    id: GAMES_LIST.EXIT,
    name: 'Exit Strategy',
    description: 'Sliding block extraction.',
    category: 'Advanced',
    component: ExitStrategy,
    icon: 'log-out'
  },
  {
    id: GAMES_LIST.SILENT,
    name: 'Silent Chess',
    description: 'Hidden path memorization.',
    category: 'Advanced',
    component: SilentChess,
    icon: 'ghost'
  },
  {
    id: GAMES_LIST.BIDDING,
    name: 'Black & White',
    description: 'Game theory & resource mgmt.',
    category: 'Advanced',
    component: BlackWhite,
    icon: 'dollar-sign'
  },
  {
    id: GAMES_LIST.RPS_CHESS,
    name: 'RPS Chess',
    description: 'Tactical board skirmish.',
    category: 'Advanced',
    component: RPSChess,
    icon: 'shield-alert'
  },
  {
    id: GAMES_LIST.PYRAMID,
    name: 'Pyramid Logic',
    description: 'Structural integrity calculation.',
    category: 'Advanced',
    component: PyramidGame,
    icon: 'triangle'
  },
  {
    id: GAMES_LIST.BALANCE,
    name: 'Balance Logic',
    description: 'Indirect weight comparison.',
    category: 'Advanced',
    component: BalanceLogic,
    icon: 'scale'
  },
  {
    id: GAMES_LIST.PRIME,
    name: 'Prime Check',
    description: 'Speed number theory.',
    category: 'Intermediate', // Moved to intermediate
    component: PrimeNumberCheck,
    icon: 'shield'
  },
  {
    id: GAMES_LIST.BATTLE,
    name: 'Equation Battle',
    description: 'Rapid comparison.',
    category: 'Easy', // Moved to easy
    component: EquationBattle,
    icon: 'swords'
  },
  {
    id: GAMES_LIST.BIRTHDATE,
    name: 'Birth Date',
    description: 'Associative memory.',
    category: 'Easy',
    component: BirthDate,
    icon: 'users'
  },
  {
    id: GAMES_LIST.PERFECT,
    name: 'Perfect Number',
    description: 'Variable isolation.',
    category: 'Intermediate',
    component: PerfectNumber,
    icon: 'hash'
  }
];

const App: React.FC = () => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const activeGame = GAMES.find(g => g.id === activeGameId) || null;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-elite-base text-elite-text font-sans overflow-hidden">
      <Sidebar 
        games={GAMES}
        activeGameId={activeGameId}
        onSelectGame={setActiveGameId}
      />
      
      <Arena activeGame={activeGame} />
    </div>
  );
};

export default App;