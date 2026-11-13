import React from 'react';
import { Hourglass } from 'lucide-react';
import { Language, Category } from '../types';
import { getCategoryNameFa, getCategoryNameEn } from '../utils/categoryNames';

interface GamePreparingProps {
  language: Language;
  finalSize: number | null;
  currentGameMode: string;
  mergedCategories: [Category, Category] | null;
  finalCategory: Category | null;
}

export const GamePreparing: React.FC<GamePreparingProps> = ({
  language,
  finalSize,
  currentGameMode,
  mergedCategories,
  finalCategory,
}) => {
  const isFA = language === 'fa';

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-sm cg-glass p-8 text-center space-y-6" style={{ color: 'var(--ink)' }}>
        <Hourglass className="animate-spin-slow mx-auto mb-4" size={40} style={{ color: '#B4694B' }} />
        <h3 className="text-xl font-black">{isFA ? 'در حال آماده‌سازی...' : 'Preparing...'}</h3>
        {finalSize && currentGameMode === 'multiplayer' && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl"
            style={{ backgroundColor: 'rgba(176,127,34,.10)', border: '1px solid rgba(176,127,34,.26)' }}
          >
            {mergedCategories ? (
              mergedCategories[0] === mergedCategories[1] ? (
                <span className="font-black text-xs" style={{ color: 'var(--sand-stamp)' }}>{isFA ? getCategoryNameFa(mergedCategories[0]) : getCategoryNameEn(mergedCategories[0])}</span>
              ) : (
                <span className="font-black text-xs" style={{ color: 'var(--sand-stamp)' }}>
                  {isFA ? getCategoryNameFa(mergedCategories[0]) : getCategoryNameEn(mergedCategories[0])}
                  <span className="mx-1" style={{ color: 'var(--ink-3)' }}>+</span>
                  {isFA ? getCategoryNameFa(mergedCategories[1]) : getCategoryNameEn(mergedCategories[1])}
                </span>
              )
            ) : finalCategory ? (
              <span className="font-black text-xs" style={{ color: 'var(--sand-stamp)' }}>{isFA ? getCategoryNameFa(finalCategory) : getCategoryNameEn(finalCategory)}</span>
            ) : null}
            <span style={{ color: 'var(--ink-3)' }}>•</span>
            <span className="font-black text-xs" style={{ color: 'var(--ink-2)' }}>{finalSize}×{finalSize}</span>
          </div>
        )}
      </div>
    </div>
  );
};
