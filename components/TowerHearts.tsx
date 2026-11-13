import React from 'react';
import { Heart, Shield } from 'lucide-react';

interface TowerHeartsProps {
  lives: number;
  maxLives: number;
  shield: boolean;
  livesShaking: boolean;
}

export const TowerHearts: React.FC<TowerHeartsProps> = ({
  lives,
  maxLives,
  shield,
  livesShaking,
}) => {
  const heartbeatClass =
    lives <= 0.5 ? 'lives-heartbeat-0-5' :
    lives <= 1 ? 'lives-heartbeat-1' :
    lives <= 2 ? 'lives-heartbeat-2' :
    lives <= 3 ? 'lives-heartbeat-3' : '';

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-xl tower-lives-container ${heartbeatClass} ${livesShaking ? 'life-lost' : ''}`}
      style={{ backgroundColor: 'rgba(252,247,236,.94)', border: '1px solid rgba(158,90,80,.45)', boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 6px 12px -10px rgba(70,40,25,.8)' }}>
      {Array.from({ length: maxLives }).map((_, i) => {
        const heartIndex = maxLives - 1 - i;
        const isFullHeart = heartIndex < Math.floor(lives);
        const isHalfHeart = heartIndex === Math.floor(lives) && lives % 1 !== 0;
        const isActive = isFullHeart || isHalfHeart;

        return (
          <Heart
            key={i}
            size={16}
            className={`transition-all duration-300 tower-heart ${
              isActive
                ? 'fill-current'
                : 'opacity-25'
            }`}
            style={{
              color: isActive ? '#A8463C' : '#B6A695',
              ...(isHalfHeart ? { clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' } : {}),
            }}
            fill={isActive ? 'currentColor' : 'none'}
          />
        );
      })}
      {shield && <Shield size={14} className="ml-1" style={{ color: '#4E6B72' }} fill="currentColor" />}
    </div>
  );
};
