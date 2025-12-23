import React from 'react';
import { ELITE_STYLES } from '../constants';

export const EliteButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }> = ({ 
  className = '', 
  variant = 'outline',
  children,
  ...props 
}) => {
  const baseClass = variant === 'primary' ? ELITE_STYLES.btnPrimary : ELITE_STYLES.btn;
  return (
    <button className={`${baseClass} transition-all duration-300 active:scale-95 ${className}`} {...props}>
      {children}
    </button>
  );
};

/**
 * Updated EliteCard with Glassmorphism support
 * Integrated backdrop-blur and subtle gold border transparency
 */
export const EliteCard: React.FC<{ children: React.ReactNode; className?: string; glass?: boolean }> = ({ 
  children, 
  className = '',
  glass = false 
}) => {
  // Base styles combined with glassmorphism if requested
  const glassClasses = glass 
    ? "bg-opacity-70 backdrop-blur-xl border-elite-gold/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]" 
    : "";

  return (
    <div className={`${ELITE_STYLES.card} ${glassClasses} ${className} relative`}>
      {children}
      
      {/* Decorative Gold Corners */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-elite-gold opacity-50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-elite-gold opacity-50" />
      
      {/* Subtle Scanner Line Effect for "Savant" feel */}
      {glass && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded">
          <div className="w-full h-[1px] bg-elite-gold/10 animate-scanline" />
        </div>
      )}
    </div>
  );
};

export const EliteLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8 gap-3">
    <div className="w-12 h-12 border-2 border-elite-surface border-t-elite-gold rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
    <span className="text-[10px] font-mono text-elite-gold animate-pulse uppercase tracking-tighter">Synchronizing Neural Link...</span>
  </div>
);