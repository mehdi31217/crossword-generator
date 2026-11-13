import React from 'react';
import { Language } from '../../types';
import { Skull, Heart, Clock, Target, TrendingUp } from 'lucide-react';
import { GameCoin } from '../GameCoin';

interface TowerLossModalProps {
  isOpen: boolean;
  language: Language;
  lostLoot: number;
  floor: number;
  reason: 'lives' | 'time' | 'quit';
  totalMistakes?: number;
  isBossFloor?: boolean;
  onReturn: () => void;
}

const statCard: React.CSSProperties = {
  backgroundColor: 'var(--paper)',
  backgroundImage: 'var(--tex-paper)',
  backgroundSize: '200px 200px',
  border: '1px solid var(--paper-well-hair)',
  boxShadow: '0 1px 0 rgba(255,255,255,.35) inset'
};

export const TowerLossModal: React.FC<TowerLossModalProps> = ({
  isOpen,
  language,
  lostLoot,
  floor,
  reason,
  totalMistakes = 0,
  isBossFloor = false,
  onReturn
}) => {
  if (!isOpen) return null;

  const isFa = language === 'fa';

  const getReasonText = () => {
    if (reason === 'quit') {
      return isFa ? 'خروج از برج' : 'Quit Tower';
    } else if (reason === 'lives') {
      return isFa ? 'جان‌ها تمام شد' : 'No Lives Left';
    } else if (isBossFloor) {
      return isFa ? 'زمان تمام شد (باس)' : 'Time Over (Boss)';
    } else {
      return isFa ? 'زمان تمام شد' : 'Time Over';
    }
  };

  const getLootStatus = () => {
    if (reason === 'quit') {
      return {
        text: isFa ? 'تمام سکه‌ها از دست رفت!' : 'All Coins Lost!',
        color: 'var(--ink-lose)',
        showMinus: true
      };
    } else if (reason === 'lives') {
      return {
        text: isFa ? 'تمام سکه‌ها سوختند!' : 'All Coins Burned!',
        color: 'var(--ink-lose)',
        showMinus: true
      };
    } else if (lostLoot === 0) {
      return {
        text: isFa ? 'تمام سکه‌ها از دست رفت' : 'All Coins Lost',
        color: 'var(--ink-lose)',
        showMinus: true
      };
    } else {
      return {
        text: isFa ? 'سکه‌های نجات یافته (۵۰٪)' : 'Coins Saved (50%)',
        color: 'var(--sand-stamp)',
        showMinus: false
      };
    }
  };

  const lootStatus = getLootStatus();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in zoom-in-95"
      style={{ backgroundColor: 'rgba(46,28,18,.72)', backdropFilter: 'blur(10px)' }}
    >
      <div className="cg-glass w-full max-w-md rounded-[2.5rem] p-8 text-center relative overflow-hidden">
        {/* top rule */}
        <div
          className="absolute top-0 left-0 w-full h-1.5"
          style={{ backgroundImage: 'linear-gradient(90deg,#9E5A50,#C97B5A,#9E5A50)' }}
        />

        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundImage: 'linear-gradient(150deg,#C97B5A,#9E5A50)',
            border: '1px solid rgba(60,25,20,.35)',
            boxShadow: '0 1px 0 rgba(255,226,214,.3) inset, 0 16px 26px -18px rgba(60,25,20,.9)'
          }}
        >
          {reason === 'lives' ? (
            <Heart size={36} className="animate-pulse" style={{ color: '#FBF1E4' }} />
          ) : reason === 'quit' ? (
            <Skull size={36} style={{ color: '#FBF1E4' }} />
          ) : (
            <Clock size={36} className="animate-pulse" style={{ color: '#FBF1E4' }} />
          )}
        </div>

        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--ink-lose)' }}>
          {isFa ? 'شکست خوردید!' : 'DEFEATED!'}
        </h2>

        <p className="font-bold text-sm mb-1" style={{ color: 'var(--ink-2)' }}>
          {isFa ? `طبقه ${floor}` : `Floor ${floor}`}
          {isBossFloor && ' 👹'}
        </p>

        <p className="text-xs font-bold mb-6" style={{ color: 'var(--ink-lose)' }}>
          {getReasonText()}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-3" style={statCard}>
            <Target size={16} className="mx-auto mb-1" style={{ color: 'var(--ink-3)' }} />
            <div className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
              {isFa ? 'اشتباهات' : 'Mistakes'}
            </div>
            <div className="text-xl font-black tabular-nums" style={{ color: 'var(--ink)' }}>
              {totalMistakes}
            </div>
          </div>

          <div className="rounded-2xl p-3" style={statCard}>
            <TrendingUp size={16} className="mx-auto mb-1" style={{ color: 'var(--ink-3)' }} />
            <div className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
              {isFa ? 'بالاترین' : 'Highest'}
            </div>
            <div className="text-xl font-black tabular-nums" style={{ color: 'var(--ink)' }}>
              {floor}
            </div>
          </div>
        </div>

        <div
          className="p-5 rounded-2xl mb-6"
          style={{
            backgroundColor: 'rgba(158,90,80,.10)',
            border: '1px solid rgba(158,90,80,.32)'
          }}
        >
          <span className="text-[11px] font-black tracking-widest" style={{ color: lootStatus.color }}>
            {lootStatus.text}
          </span>
          <div
            className="text-4xl font-black flex items-center justify-center gap-2 mt-2 tabular-nums"
            style={{ color: lootStatus.color }}
          >
            {lootStatus.showMinus && '-'}{lostLoot}
            <GameCoin size={28} style={{ opacity: reason === 'lives' ? 0.35 : 0.75 }} />
          </div>
          {reason === 'lives' && (
            <div
              className="text-xs font-bold mt-3 py-2 px-3 rounded-lg"
              style={{ backgroundColor: 'rgba(158,90,80,.12)', color: 'var(--ink-lose)' }}
            >
              {isFa ? 'با تمام شدن جان‌ها، تمام امتیازات از بین می‌رود' : 'When lives reach zero, all rewards are lost'}
            </div>
          )}
          {isBossFloor && lostLoot > 0 && reason !== 'lives' && (
            <div className="text-xs font-bold mt-2" style={{ color: '#4C5A42' }}>
              {isFa ? 'باس فلور: ۵۰٪ حفظ شد' : 'Boss: 50% saved'}
            </div>
          )}
        </div>

        <button
          onClick={onReturn}
          className="cg-btn-cream w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all"
        >
          {isFa ? 'بازگشت به لابی' : 'Return to Lobby'}
        </button>
      </div>
    </div>
  );
};
