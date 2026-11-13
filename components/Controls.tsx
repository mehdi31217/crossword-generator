import React from 'react';
import { GameView, Language } from '../types';

interface ControlsProps {
  currentView: GameView;
  setView: (view: GameView) => void;
  language: Language;
  unreadCount?: number;
  onOpenShop?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  currentView,
  setView,
  language,
  unreadCount = 0,
  onOpenShop,
}) => {
  const isFa = language === 'fa';

  // Exact 5 sculpted 3D clay medallions from design-9 bottom navigation bar
  const navItems: {
    id: string;
    labelFa: string;
    labelEn: string;
    sprite: string;
    active: boolean;
    onClick: () => void;
    badge?: number;
  }[] = [
    {
      id: 'home',
      labelFa: 'خانه',
      labelEn: 'Home',
      sprite: '/images/d9/nav-1.webp', // Terracotta Home medallion
      active: currentView === 'menu',
      onClick: () => setView('menu'),
    },
    {
      id: 'puzzle',
      labelFa: 'پازل‌ها',
      labelEn: 'Puzzles',
      sprite: '/images/d9/nav-2.webp', // Sage Puzzle medallion
      active: currentView === 'epic_library' || currentView === 'tower_lobby',
      onClick: () => setView('epic_library'),
    },
    {
      id: 'leaderboard',
      labelFa: 'برترین‌ها',
      labelEn: 'Ranks',
      sprite: '/images/d9/nav-3.webp', // Blue Trophy medallion
      active: currentView === 'leaderboard',
      onClick: () => setView('leaderboard'),
    },
    {
      id: 'social',
      labelFa: 'دوستان',
      labelEn: 'Friends',
      sprite: '/images/d9/nav-4.webp', // Sage Friends medallion
      active: currentView === 'social',
      onClick: () => setView('social'),
      badge: unreadCount,
    },
    {
      id: 'profile',
      labelFa: 'پروفایل',
      labelEn: 'Profile',
      sprite: '/images/d9/nav-5.webp', // Blue Gear/Profile medallion
      active: currentView === 'profile',
      onClick: () => (onOpenShop ? setView('profile') : setView('profile')),
    },
  ];

  return (
    <nav
      dir="ltr"
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none flex justify-center px-2 pb-1.5"
    >
      <div
        className="pointer-events-auto w-full max-w-[470px] rounded-[28px] px-3 py-2 flex items-center justify-around"
        style={{
          background:
            'linear-gradient(180deg, #dec6a5 0%, #cfb38e 55%, #c2a37c 100%)',
          boxShadow:
            '0 -4px 18px rgba(45, 24, 10, 0.32), 0 8px 20px rgba(45, 24, 10, 0.45), inset 0 2px 2px rgba(255, 248, 236, 0.78), inset 0 -3px 5px rgba(95, 56, 28, 0.35)',
          border: '2.5px solid #a86c47',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="group relative flex flex-col items-center focus:outline-none"
          >
            {/* Outer recessed ring on active medallion (matching design-9 Home icon ring) */}
            <div
              className={`
                relative flex items-center justify-center rounded-full transition-all duration-200
                ${
                  item.active
                    ? 'p-1 -translate-y-1 scale-105'
                    : 'p-1 hover:scale-105 active:scale-95 opacity-90'
                }
              `}
              style={
                item.active
                  ? {
                      background:
                        'radial-gradient(circle, #c89f78 0%, #d8bc9a 100%)',
                      boxShadow:
                        'inset 0 2px 4px rgba(75, 42, 18, 0.38), 0 1px 1px rgba(255, 248, 236, 0.7)',
                    }
                  : undefined
              }
            >
              <img
                src={item.sprite}
                alt={isFa ? item.labelFa : item.labelEn}
                className="w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] object-contain pointer-events-none select-none"
                style={{
                  filter: item.active
                    ? 'drop-shadow(0 5px 8px rgba(48, 22, 8, 0.45))'
                    : 'drop-shadow(0 3px 5px rgba(48, 22, 8, 0.3))',
                }}
              />

              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c94a29] text-white text-[10px] font-black flex items-center justify-center border border-[#fff5e6] shadow">
                  {item.badge}
                </span>
              ) : null}
            </div>

            {/* 3 sculpted clay dots + label under each nav medallion (matching design-9) */}
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: item.active ? '#b0552c' : '#856e54',
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: item.active ? '#b0552c' : '#856e54',
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: item.active ? '#b0552c' : '#856e54',
                }}
              />
            </div>
            <span
              className={`text-[9.5px] font-black mt-0.5 leading-none ${
                item.active ? 'text-[#8c3d19]' : 'text-[#5a3e24]'
              }`}
            >
              {isFa ? item.labelFa : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Controls;
