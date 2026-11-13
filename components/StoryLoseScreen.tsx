import React, { useState } from 'react';
import { Skull, RotateCcw, Heart, Film } from 'lucide-react';
import { PlayerState } from '../types';
import { gameServer } from '../utils/gameServer';
import { REVIVE_COST_COINS } from '../utils/economy';

const faNum = (n: number | string) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface StoryLoseScreenProps {
  currentChapterIndex: number | null;
  player?: PlayerState | null;
  onCoinsChange?: (coins: number) => void;
  onRevive?: () => void;
  onRetry: (dailyMode: boolean, chapterId: number) => void;
  onBackToChapters: () => void;
}

export const StoryLoseScreen: React.FC<StoryLoseScreenProps> = ({
  currentChapterIndex,
  player,
  onCoinsChange,
  onRevive,
  onRetry,
  onBackToChapters,
}) => {
  const [reviveError, setReviveError] = useState<string | null>(null);
  const [adPlaying, setAdPlaying] = useState(false);

  const econ = gameServer.getLocalEconomyState();
  const canUseAdRevive = !econ.reviveAdUsedToday;
  const playerCoins = player?.coins ?? 0;

  const handleReviveCoins = async () => {
    if (!player) return;
    setReviveError(null);
    const res = gameServer.revivePlayer(player, 'coins');
    if (!res.ok) {
      setReviveError(res.error || 'سکهٔ کافی برای احیا ندارید!');
      return;
    }
    if (typeof res.coins === 'number') {
      onCoinsChange?.(res.coins);
    }
    onRevive?.();
  };

  const handleReviveAd = async () => {
    if (!player) return;
    setReviveError(null);
    setAdPlaying(true);
    setTimeout(() => {
      const res = gameServer.revivePlayer(player, 'ad');
      setAdPlaying(false);
      if (!res.ok) {
        setReviveError(res.error || 'سهمیهٔ احیای رایگان امروز استفاده شده است.');
        return;
      }
      onRevive?.();
    }, 1100);
  };

  return (
    <div
      className="cg-sand fixed inset-0 z-[600] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in touch-none overflow-hidden"
      dir="rtl"
    >
      <Skull size={68} className="mb-4 animate-bounce" style={{ color: '#9E5A50' }} />
      <h2 className="text-3xl font-black mb-1.5" style={{ color: 'var(--ink)' }}>شکست در نبرد!</h2>
      <p className="text-sm font-bold mb-5 leading-relaxed max-w-xs" style={{ color: 'var(--ink-2)' }}>
        خون پهلوان به پایان رسید! می‌خواهید همین‌جا با ۶۰٪ جان به نبرد برگردید و جدول نیمه‌تمام را کامل کنید؟
      </p>

      {/* Second-Chance Revive Card */}
      {onRevive && (
        <div
          className="w-full max-w-xs rounded-[24px] p-4 mb-5 flex flex-col gap-2.5"
          style={{
            background: 'linear-gradient(180deg, rgba(252,245,231,.96), rgba(236,220,194,.96))',
            border: '1.5px solid rgba(176,127,34,.45)',
            boxShadow: '0 12px 26px -14px rgba(46,28,18,.5)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black flex items-center gap-1.5" style={{ color: '#7A3224' }}>
              <Heart size={15} fill="#C64632" color="#C64632" /> فرصت دوم — ادامهٔ همین جدول با ۶۰٪ جان
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(176,127,34,.16)', color: '#6A4A10' }}>
              🪙 {faNum(playerCoins)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleReviveCoins}
            disabled={playerCoins < REVIVE_COST_COINS || adPlaying}
            className="w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            style={{
              backgroundImage: 'linear-gradient(180deg,#F7DF9C,#D99E32)',
              color: '#3F2605',
              border: '1px solid rgba(122,82,16,.5)',
              boxShadow: '0 6px 14px -8px rgba(176,127,34,.6)',
            }}
          >
            ❤️‍🔥 احیای فوری پهلوان ({faNum(REVIVE_COST_COINS)} سکه)
          </button>

          {canUseAdRevive && (
            <button
              type="button"
              onClick={handleReviveAd}
              disabled={adPlaying}
              className="w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(180deg,#5E8F7B,#3E6B58)',
                color: '#FBF5E8',
                border: '1px solid rgba(46,90,62,.5)',
              }}
            >
              <Film size={14} />
              {adPlaying ? 'در حال بازیابی نیروی پهلوان...' : 'احیای رایگان روزانه (۱ بار در روز)'}
            </button>
          )}

          {reviveError && (
            <div className="text-[10px] font-black text-[#8A3228]">{reviveError}</div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => onRetry(false, currentChapterIndex || 1)}
          className="cg-btn-brick w-full py-4 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RotateCcw size={18} /> شروع از اول فصل
        </button>
        <button
          onClick={onBackToChapters}
          className="cg-btn-cream w-full py-3.5 rounded-[2rem] font-bold text-sm active:scale-95 transition-transform"
        >
          بازگشت به فهرست فصل‌ها
        </button>
      </div>
    </div>
  );
};

