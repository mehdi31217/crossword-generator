import React from 'react';
import { Language } from '../../types';
import { CheckCircle, TrendingUp, Briefcase } from 'lucide-react';
import { GameCoin } from '../GameCoin';

interface TowerRestModalProps {
  isOpen: boolean;
  language: Language;
  floor: number;
  loot: number;
  onNextFloor: () => void;
  onCashOut: () => void;
}

export const TowerRestModal: React.FC<TowerRestModalProps> = ({
  isOpen,
  language,
  floor,
  loot,
  onNextFloor,
  onCashOut
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95" style={{ backgroundColor: 'rgba(46,28,18,.72)' }}>
      <div className="w-full max-w-sm cg-glass p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundImage: 'var(--clay-shell)' }} />
        
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
          style={{ backgroundColor: 'rgba(94,110,82,.14)', border: '1px solid rgba(94,110,82,.28)', color: '#5E6E52' }}
        >
          <CheckCircle size={40} />
        </div>
        
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--ink)' }}>
          {language === 'fa' ? `طبقه ${floor} کامل شد!` : `Floor ${floor} Cleared!`}
        </h2>
        <p className="font-bold text-xs mb-6" style={{ color: 'var(--ink-2)' }}>
          {language === 'fa' ? 'تصمیم بگیرید:' : 'Make your choice:'}
        </p>
        
        <div
          className="p-4 rounded-2xl mb-6"
          style={{ backgroundColor: 'rgba(176,127,34,.10)', border: '1px solid rgba(176,127,34,.26)' }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9E7418' }}>
            {language === 'fa' ? 'موجودی کیف' : 'LOOT BAG'}
          </span>
          <div className="text-4xl font-black flex items-center justify-center gap-2 mt-1" style={{ color: '#8A6415' }}>
            {loot} <GameCoin size={32} />
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onNextFloor}
            className="w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-clay"
          >
            <TrendingUp size={20} />
            {language === 'fa' ? 'ادامه (ریسک)' : 'Continue (Risk)'}
          </button>
          
          <button 
            onClick={onCashOut}
            className="w-full py-3 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-sage"
          >
            <Briefcase size={18} />
            {language === 'fa' ? 'برداشت و خروج' : 'Cash Out & Leave'}
          </button>
        </div>
      </div>
    </div>
  );
};
