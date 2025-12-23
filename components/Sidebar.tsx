import React, { useEffect, useState } from 'react';
import { GameDefinition, GameCategory } from '../types';
import { EliteLeagueHub } from '../services/EliteLeagueHub';
import { Trophy, Target, ChevronDown, ChevronRight, Activity } from 'lucide-react';

interface SidebarProps {
  games: GameDefinition[];
  activeGameId: string | null;
  onSelectGame: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ games, activeGameId, onSelectGame }) => {
  const [, setTick] = useState(0);
  // Default all categories to open
  const [openCategories, setOpenCategories] = useState<Record<GameCategory, boolean>>({
    'Easy': true,
    'Intermediate': true,
    'Advanced': true
  });

  useEffect(() => {
    const unsubscribe = EliteLeagueHub.subscribe(() => setTick(t => t + 1));
    return unsubscribe;
  }, []);

  const toggleCategory = (cat: GameCategory) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const renderCategory = (category: GameCategory) => {
    const categoryGames = games.filter(g => g.category === category);
    const isOpen = openCategories[category];

    return (
      <div key={category} className="mb-4">
        <button 
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-serif text-elite-gold uppercase tracking-widest border-b border-slate-800 hover:bg-slate-900 transition-colors"
        >
          <span>{category} Tier</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {isOpen && (
          <div className="space-y-1 mt-2 pl-2">
            {categoryGames.map(game => {
              const stats = EliteLeagueHub.getGameStats(game.id);
              const isActive = activeGameId === game.id;
              
              return (
                <button
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className={`
                    w-full text-left p-3 transition-all duration-300 border-l-2 relative overflow-hidden group
                    ${isActive 
                      ? 'bg-slate-900/50 border-elite-gold' 
                      : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-700'}
                  `}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span className={`font-sans text-sm ${isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {game.name}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className={`flex items-center gap-1 ${stats.unlockedLevels >= 20 ? 'text-elite-gold' : ''}`}>
                        Lvl {stats.unlockedLevels}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-80 bg-[#06080c] border-r border-slate-900 flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-8 border-b border-slate-900 shrink-0">
        <h1 className="font-serif text-xl text-elite-gold tracking-[0.2em] flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          ELITE LEAGUE
        </h1>
        <p className="text-xs text-slate-500 mt-2 font-mono uppercase">Portal v2.6.1</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {renderCategory('Easy')}
        {renderCategory('Intermediate')}
        {renderCategory('Advanced')}
      </div>

      <div className="p-4 border-t border-slate-900 shrink-0">
        <div className="bg-slate-900/50 p-3 border border-slate-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="text-[10px] text-slate-500 font-mono">
            <div>STATUS: ONLINE</div>
            <div>SYNC: LOCAL</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;