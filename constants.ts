// Standardized "Elite" classes for consistency across games
export const ELITE_STYLES = {
  // Typography
  h1: "font-serif text-3xl md:text-4xl text-elite-gold tracking-widest uppercase mb-6",
  h2: "font-serif text-xl md:text-2xl text-elite-text tracking-wide mb-4",
  body: "font-sans text-gray-400 text-sm leading-relaxed",
  
  // Interactive
  btn: "px-6 py-2 bg-transparent border border-elite-gold text-elite-gold font-serif tracking-widest hover:bg-elite-gold hover:text-elite-base transition-all duration-300 uppercase text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed",
  btnPrimary: "px-8 py-3 bg-elite-gold text-elite-base font-bold font-serif tracking-widest hover:bg-white transition-all duration-300 uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)]",
  input: "bg-elite-surface border border-slate-700 text-elite-gold p-3 focus:outline-none focus:border-elite-gold transition-colors w-full font-sans text-center text-xl tracking-wider",
  
  // Layout
  card: "bg-elite-surface border border-slate-800 p-6 shadow-2xl relative overflow-hidden",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  
  // Utility
  timer: "font-mono text-xl text-elite-gold",
  divider: "h-px w-full bg-gradient-to-r from-transparent via-elite-goldDim to-transparent my-4 opacity-30",
};

export const GAMES_LIST = {
  MATRIX: 'pattern_matrix',
  TRIVIA: 'nebula_trivia',
  THE_300: 'the_300',
  FORMULA: 'formula_archery',
  TARGET: 'number_target',
  PRIME: 'prime_check',
  BATTLE: 'equation_battle',
  SUDOKU: 'blind_sudoku',
  PIXEL: 'pixel_number',
  BIRTHDATE: 'birth_date',
  COLOR: 'color_perception',
  MATCH: 'match_mix',
  SIGNAL: 'investigation_signal',
  CIRCUIT: 'logic_circuit',
  DECRYPTION: 'decryption_protocol',
  SEQUENCE: 'sequence_war',
  FINDME: 'find_me',
  RPS: 'rotation_rps',
  TRIPLE: 'triple_maze',
  EXIT: 'exit_strategy',
  DICE: 'trail_dice',
  PYRAMID: 'pyramid_game',
  SILENT: 'silent_chess',
  BIDDING: 'black_white',
  RPS_CHESS: 'rps_chess',
  PERFECT: 'perfect_number',
  BALANCE: 'balance_game',
};