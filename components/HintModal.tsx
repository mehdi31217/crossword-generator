
import React from 'react';
import { Lightbulb, CaseSensitive, WholeWord } from 'lucide-react';
import { GameCoin } from './GameCoin';
import { Language } from '../types';
import { HINT_PRICES } from '../utils/economy';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

const faNum = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface HintModalProps {
  language: Language;
  coins: number;
  onClose: () => void;
  onRevealCell: () => void;
  onRevealWord: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({ 
  language, 
  coins, 
  onClose, 
  onRevealCell, 
  onRevealWord 
}) => {
  const isFA = language === 'fa';
  const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
  const discountPct = deckBuffs.hintDiscountPct || 0;

  // Mirrors server/economy.js — discounted by active Folklore clay cards
  const COST_CELL = Math.max(10, Math.round(HINT_PRICES.letter * (1 - discountPct / 100)));
  const COST_WORD = Math.max(25, Math.round(HINT_PRICES.word * (1 - discountPct / 100)));

  const sheet: React.CSSProperties = {
    backgroundColor: 'var(--paper)',
    backgroundImage: 'var(--tex-paper)',
    backgroundSize: '200px 200px',
    border: '1px solid rgba(36,26,20,.16)',
    color: 'var(--ink)',
  };

  const priceChip = (affordable: boolean): React.CSSProperties => affordable
    ? { backgroundImage: 'linear-gradient(180deg,#F7E3B4,#EFD08A)', color: '#6A4A10', border: '1px solid rgba(255,246,222,.9)' }
    : { backgroundColor: 'rgba(36,26,20,.06)', color: 'var(--ink-3)', border: '1px solid rgba(36,26,20,.12)' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(46,28,18,.55)' }}
        onClick={onClose}
      />
      
      <div
        className="relative w-full max-w-sm cg-glass p-6 animate-in zoom-in-95 duration-300"
        style={{ borderRadius: 28 }}
        dir={isFA ? 'rtl' : 'ltr'}
      >
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div
                    className="w-11 h-11 rounded-xl grid place-items-center"
                    style={{ background: 'rgba(176,127,34,.16)', color: '#9E7418', border: '1px solid rgba(176,127,34,.3)' }}
                >
                    <Lightbulb size={22} fill="currentColor" className="animate-pulse" />
                </div>
                <h3 className="text-xl font-black" style={{ color: 'var(--ink)' }}>
                    {isFA ? 'فروشگاه راهنما' : 'Hint Shop'}
                </h3>
            </div>
            <div
                className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{
                    backgroundImage: 'linear-gradient(180deg,#F7E3B4,#EFD08A)',
                    border: '1px solid rgba(255,246,222,.9)',
                    color: '#6A4A10',
                }}
            >
                <GameCoin size={16} />
                <span className="font-black tabular-nums">{isFA ? faNum(coins) : coins}</span>
            </div>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onRevealCell}
                disabled={coins < COST_CELL}
                className="w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-95"
                style={sheet}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(78,107,114,.14)', color: '#4E6B72' }}
                    >
                        <CaseSensitive size={20} />
                    </div>
                    <div className="text-right">
                        <div className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                            {isFA ? 'نمایش یک حرف' : 'Reveal Letter'}
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>
                            {isFA ? 'خانه انتخاب شده را حل می‌کند' : 'Solves the selected cell'}
                        </div>
                    </div>
                </div>
                <div className="font-black text-sm ps-2.5 pe-3 py-1 rounded-lg flex items-center gap-1 tabular-nums" style={priceChip(coins >= COST_CELL)}>
                    {isFA ? faNum(COST_CELL) : COST_CELL} <GameCoin size={13} />
                </div>
            </button>

            <button 
                onClick={onRevealWord}
                disabled={coins < COST_WORD}
                className="w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-95"
                style={sheet}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(158,90,80,.14)', color: '#9E5A50' }}
                    >
                        <WholeWord size={20} />
                    </div>
                    <div className="text-right">
                        <div className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                            {isFA ? 'نمایش کل کلمه' : 'Reveal Word'}
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>
                            {isFA ? 'تمام حروف کلمه فعلی' : 'Solves the active word'}
                        </div>
                    </div>
                </div>
                <div className="font-black text-sm ps-2.5 pe-3 py-1 rounded-lg flex items-center gap-1 tabular-nums" style={priceChip(coins >= COST_WORD)}>
                    {isFA ? faNum(COST_WORD) : COST_WORD} <GameCoin size={13} />
                </div>
            </button>
        </div>

        <button
            onClick={onClose}
            className="mt-6 w-full py-3 font-bold text-xs transition-colors"
            style={{ color: 'var(--ink-3)' }}
        >
            {isFA ? 'بازگشت به بازی' : 'Back to Game'}
        </button>
      </div>
    </div>
  );
};
