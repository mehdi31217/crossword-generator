
import React from 'react';
import { Eraser, Snowflake, EyeOff, Zap } from 'lucide-react';
import { Language, AttackType } from '../types';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

interface BattleControlsProps {
  language: Language;
  mana: number;
  onAttack: (type: AttackType) => void;
  isFrozen: boolean;
  opponentFilledCount: number; // NEW PROP
  clay?: boolean;
}

export const BattleControls: React.FC<BattleControlsProps> = ({ 
  language, 
  mana, 
  onAttack,
  isFrozen,
  opponentFilledCount,
  clay = false
}) => {
  const isFA = language === 'fa';
  const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
  const discountPct = deckBuffs.onlineAttackDiscountPct || 0;
  const costErase = Math.max(25, Math.round(40 * (1 - discountPct / 100)));
  const costBlind = Math.max(40, Math.round(60 * (1 - discountPct / 100)));
  const costFreeze = Math.max(65, Math.round(100 * (1 - discountPct / 100)));

  const attacks = [
    { 
      id: 'erase' as AttackType, 
      cost: costErase, 
      icon: <Eraser size={14} />, 
      label: isFA ? 'پاک‌کن' : 'Eraser',
      gradient: 'linear-gradient(180deg,#B85C4E 0%,#9E4A3E 100%)',
      tint: '#8A4A42'
    },
    { 
      id: 'blind' as AttackType, 
      cost: costBlind, 
      icon: <EyeOff size={14} />, 
      label: isFA ? 'تاریکی' : 'Blind',
      gradient: 'linear-gradient(180deg,#6E5478 0%,#5E4468 100%)',
      tint: '#5E4468'
    },
    { 
      id: 'freeze' as AttackType, 
      cost: costFreeze, 
      icon: <Snowflake size={14} />, 
      label: isFA ? 'انجماد' : 'Freeze',
      gradient: 'linear-gradient(180deg,#5C7C84 0%,#4E6B72 100%)',
      tint: '#3F5A60'
    }
  ];

  return (
    <div className={`w-full max-w-md mx-auto px-4 py-2 ${isFrozen ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
      
      {/* Mana Bar - More Compact */}
      <div className="mb-2">
        <div className="flex justify-between items-end mb-0.5 px-1">
            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: clay ? '#F3DEC4' : '#8E4E37' }}>
                <Zap size={10} fill="currentColor" /> {isFA ? 'انرژی نبرد' : 'BATTLE ENERGY'}
                {discountPct > 0 && (
                    <span
                        className="ms-1 px-1.5 py-0.2 rounded text-[8px] font-black"
                        style={{ background: 'rgba(58,107,76,.18)', color: clay ? '#B4F0C8' : '#2E5A3E', border: '1px solid rgba(58,107,76,.35)' }}
                    >
                        ⚽ -{discountPct}%
                    </span>
                )}
            </span>
            <span className="text-[10px] font-black" style={{ color: clay ? '#F3DEC4' : 'var(--ink)' }}>{Math.floor(mana)}%</span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden relative"
          style={{
            backgroundColor: clay ? '#4A2616' : 'var(--paper-2)',
            border: clay ? '1px solid rgba(0,0,0,.35)' : '1px solid rgba(36,26,20,.18)',
            boxShadow: clay ? 'inset 0 2px 4px rgba(0,0,0,.6), 0 1px 0 rgba(255,232,208,.20)' : 'inset 0 1px 2px rgba(36,26,20,.14)',
          }}
        >
            <div 
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${mana}%`,
                  backgroundImage: 'linear-gradient(90deg,#B07F22 0%,#C97B5A 55%,#A8463C 100%)',
                }}
            />
            <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: 'rgba(255,255,255,.24)' }}></div>
        </div>
      </div>

      {/* Attack Buttons - Horizontal Layout */}
      <div className="grid grid-cols-3 gap-2">
        {attacks.map((atk) => {
            // Eraser logic: needs mana AND needs red cells to erase
            let isDisabled = mana < atk.cost;
            if (atk.id === 'erase' && opponentFilledCount === 0) {
                isDisabled = true;
            }

            return (
                <button
                    key={atk.id}
                    onClick={() => onAttack(atk.id)}
                    disabled={isDisabled}
                    className="relative py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-90"
                    style={isDisabled ? {
                        backgroundColor: clay ? 'rgba(74,38,20,.55)' : 'rgba(36,26,20,.06)',
                        color: clay ? 'rgba(243,222,196,.50)' : 'var(--ink-3)',
                        border: clay ? '1px solid rgba(0,0,0,.30)' : '1px solid rgba(36,26,20,.10)',
                        boxShadow: clay ? 'inset 0 2px 5px rgba(0,0,0,.45)' : 'none',
                        cursor: 'not-allowed',
                        transform: 'scale(.95)',
                    } : {
                        backgroundImage: atk.gradient,
                        color: '#FBF3E6',
                        border: '1px solid rgba(255,255,255,.18)',
                        boxShadow: 'inset 0 1px 0 rgba(255,232,214,.32), 0 6px 12px -10px rgba(46,28,18,.9)',
                    }}
                >
                    <div className={isDisabled ? 'opacity-50' : 'animate-pulse-slow'}>
                        {atk.icon}
                    </div>
                    <span className="text-[9px] font-black whitespace-nowrap">{atk.label}</span>
                    <span
                      className="absolute -top-1.5 -right-1 text-[8px] font-black px-1 rounded"
                      style={isDisabled ? {
                        backgroundColor: clay ? 'rgba(30,14,6,.55)' : 'rgba(36,26,20,.08)',
                        color: clay ? 'rgba(243,222,196,.55)' : 'var(--ink-3)',
                        border: clay ? '1px solid rgba(0,0,0,.25)' : '1px solid rgba(36,26,20,.12)',
                      } : {
                        backgroundColor: '#FCF7EC',
                        color: atk.tint,
                        border: '1px solid rgba(36,26,20,.14)',
                      }}
                    >
                        {atk.cost}
                    </span>
                </button>
            );
        })}
      </div>
    </div>
  );
};
