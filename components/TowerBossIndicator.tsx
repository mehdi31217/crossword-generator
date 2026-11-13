import React from 'react';
import { Crown, Zap, Target } from 'lucide-react';
import type { Language } from '../types';

interface TowerBossIndicatorProps {
  floor: number;
  lives: number;
  maxLives: number;
  loot: number;
  timeRemaining: number | null;
  bossName: string;
  bossAvatar: string;
  language: Language;
  hasShield: boolean;
  hasHazardImmunity: boolean;
  comboMultiplier: number;
}

/**
 * Boss Floor Indicator - Shows when player is on a boss floor
 */
export const TowerBossIndicator: React.FC<TowerBossIndicatorProps> = ({
  floor,
  lives,
  maxLives,
  loot,
  timeRemaining,
  bossName,
  bossAvatar,
  language,
  hasShield,
  hasHazardImmunity,
  comboMultiplier
}) => {
  const isFa = language === 'fa';

  return (
    <div
      className="w-full py-3 px-4 animate-pulse-slow"
      style={{
        backgroundImage: 'linear-gradient(90deg,#5A3026 0%,#7A3E30 50%,#5A3026 100%)',
        borderTop: '4px solid #E2C079',
        borderBottom: '4px solid #E2C079',
        boxShadow: 'inset 0 1px 0 rgba(255,226,204,.28), 0 14px 26px -20px rgba(46,28,18,.95)',
      }}>
      <div className="max-w-4xl mx-auto">
        {/* Boss Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce" style={{ backgroundColor: '#8E4E37', border: '2px solid #E2C079' }}>
              {bossAvatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5" style={{ color: '#E2C079' }} />
                <span className="font-black text-sm uppercase tracking-wide" style={{ color: '#F0D08C' }}>
                  {isFa ? 'باس فلور' : 'BOSS FLOOR'}
                </span>
              </div>
              <div className="font-bold text-lg" style={{ color: '#FBF3E6' }}>
                {bossName}
              </div>
            </div>
          </div>

          {/* Floor Number */}
          <div className="text-right">
            <div className="text-xs" style={{ color: '#E2C079' }}>
              {isFa ? 'طبقه' : 'Floor'}
            </div>
            <div className="text-3xl font-black" style={{ color: '#FBF3E6' }}>
              {floor}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Lives */}
          <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(0,0,0,.24)', border: '1px solid rgba(158,90,80,.45)' }}>
            <div className="flex items-center justify-center gap-1 mb-1">
              {Array.from({ length: maxLives }).map((_, i) => (
                <span key={i} className={`text-sm ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                  ❤️
                </span>
              ))}
            </div>
            <div className="text-[10px] text-center font-bold" style={{ color: '#EFC9C2' }}>
              {lives}/{maxLives}
            </div>
          </div>

          {/* Loot */}
          <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(0,0,0,.24)', border: '1px solid rgba(226,192,121,.45)' }}>
            <div className="text-center text-xl font-black" style={{ color: '#F0D08C' }}>
              💰 {loot}
            </div>
            <div className="text-[10px] text-center font-bold" style={{ color: '#E2C079' }}>
              {isFa ? 'غنیمت' : 'Loot'}
            </div>
          </div>

          {/* Time */}
          <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(0,0,0,.24)', border: '1px solid rgba(111,143,168,.45)' }}>
            <div className="text-center text-xl font-black" style={{ color: '#BBD2E2' }}>
              {timeRemaining !== null ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}` : '∞'}
            </div>
            <div className="text-[10px] text-center font-bold" style={{ color: '#A9C3D2' }}>
              {isFa ? 'زمان' : 'Time'}
            </div>
          </div>

          {/* Combo */}
          <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(0,0,0,.24)', border: '1px solid rgba(122,90,134,.5)' }}>
            <div className="text-center text-xl font-black" style={{ color: '#D6BEDF' }}>
              ×{comboMultiplier.toFixed(1)}
            </div>
            <div className="text-[10px] text-center font-bold" style={{ color: '#C9B2D3' }}>
              {isFa ? 'ضریب' : 'Combo'}
            </div>
          </div>
        </div>

        {/* Active Items */}
        {(hasShield || hasHazardImmunity) && (
          <div className="mt-2 flex items-center justify-center gap-2">
            {hasShield && (
              <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'rgba(111,143,168,.22)', border: '1px solid rgba(111,143,168,.5)', color: '#BBD2E2' }}>
                🛡️ {isFa ? 'سپر' : 'Shield'}
              </div>
            )}
            {hasHazardImmunity && (
              <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: 'rgba(122,90,134,.24)', border: '1px solid rgba(122,90,134,.5)', color: '#D6BEDF' }}>
                ✨ {isFa ? 'مصونیت' : 'Immunity'}
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="mt-3 text-center text-xs font-bold animate-pulse" style={{ color: '#E2C079' }}>
          {isFa ? '⚠️ باخت در باس فلور: فقط 50% سکه‌ها از دست می‌رود' : '⚠️ Boss Floor Loss: Only 50% coins lost'}
        </div>
      </div>
    </div>
  );
};
