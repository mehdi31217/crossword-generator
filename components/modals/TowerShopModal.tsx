import React, { useState } from 'react';
import { ShoppingBag, Heart, Clock, Shield, Sparkles } from 'lucide-react';
import { GameCoin } from '../GameCoin';
import type { TowerShopItem, TowerRunState } from '../../types';

interface TowerShopModalProps {
  isOpen: boolean;
  runState: TowerRunState;
  shopItems: TowerShopItem[];
  onBuyItem: (item: TowerShopItem) => boolean;
  onContinue: () => void;
  onCashOut: () => void;
  language: 'fa' | 'en';
}

const sheet: React.CSSProperties = {
  backgroundColor: 'var(--paper)',
  backgroundImage: 'var(--tex-paper)',
  backgroundSize: '200px 200px',
  border: '1px solid rgba(36,26,20,.16)',
  boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 14px 24px -20px rgba(70,45,30,.8)'
};

const TowerShopModal: React.FC<TowerShopModalProps> = ({
  isOpen,
  runState,
  shopItems,
  onBuyItem,
  onContinue,
  onCashOut,
  language
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFa = language === 'fa';

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 2000);
  };

  const getItemIcon = (effect: string) => {
    switch (effect) {
      case 'extra_life': return <Heart className="w-6 h-6" />;
      case 'time_boost': return <Clock className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'hazard_immunity': return <Sparkles className="w-6 h-6" />;
      default: return <ShoppingBag className="w-6 h-6" />;
    }
  };

  const handleBuy = (item: TowerShopItem) => {
    const success = onBuyItem(item);
    if (!success) {
      showError(isFa ? 'سکه کافی ندارید!' : 'Not enough coins!');
    }
  };

  const canAfford = (cost: number) => runState.loot >= cost;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(46,28,18,.72)', backdropFilter: 'blur(10px)' }}
    >
      <div className="cg-glass cg-rise rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="sticky top-0 z-10 p-6 rounded-t-[2rem]"
          style={{
            backgroundImage: 'var(--clay-shell)',
            borderBottom: '1px solid rgba(36,26,20,.24)',
            boxShadow: '0 1px 0 rgba(255,255,255,.28) inset'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--paper-lift)',
                  color: 'var(--clay-ink)',
                  border: '1px solid rgba(36,26,20,.16)',
                  boxShadow: '0 1px 0 rgba(255,255,255,.4) inset'
                }}
              >
                <ShoppingBag className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-black" style={{ color: '#FBF4E7' }}>
                {isFa ? 'فروشگاه برج' : 'Tower Shop'}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold" style={{ color: 'rgba(251,244,231,.78)' }}>
                {isFa ? `طبقه ${runState.floor}` : `Floor ${runState.floor}`}
              </div>
              <div
                className="text-2xl font-black tabular-nums flex items-center gap-1.5 justify-end"
                style={{ color: '#FBF4E7' }}
              >
                <GameCoin size={22} />
                {runState.loot}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className="grid grid-cols-3 gap-3 p-4"
          style={{ backgroundColor: 'var(--paper-lift)', borderBottom: '1px solid var(--paper-well-hair)' }}
        >
          <div className="text-center">
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>
              {isFa ? 'جان‌ها' : 'Lives'}
            </div>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: runState.maxLives }).map((_, i) => (
                <span key={i} className={`text-lg ${i < runState.lives ? 'opacity-100' : 'opacity-25'}`}>
                  ❤️
                </span>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>
              {isFa ? 'ضریب' : 'Combo'}
            </div>
            <div className="text-xl font-black tabular-nums" style={{ color: '#8A6415' }}>
              ×{runState.comboMultiplier.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>
              {isFa ? 'آیتم‌ها' : 'Items'}
            </div>
            <div className="flex items-center justify-center gap-2 h-7">
              {runState.hasShield && <span className="text-lg">🛡️</span>}
              {runState.hasHazardImmunity && <span className="text-lg">✨</span>}
              {runState.timeBonus > 0 && <span className="text-lg">⏰</span>}
              {!runState.hasShield && !runState.hasHazardImmunity && runState.timeBonus === 0 && (
                <span className="text-lg font-bold" style={{ color: 'var(--ink-3)' }}>—</span>
              )}
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div className="p-6 space-y-3">
          <h3 className="text-sm font-black mb-3" style={{ color: 'var(--ink-2)' }}>
            {isFa ? 'آیتم‌های موجود' : 'Available Items'}
          </h3>

          {shopItems.map((item) => {
            const affordable = canAfford(item.cost);
            const disabled = !affordable ||
              (item.effect === 'extra_life' && runState.lives >= runState.maxLives) ||
              (item.effect === 'shield' && runState.hasShield) ||
              (item.effect === 'hazard_immunity' && runState.hasHazardImmunity);

            return (
              <div
                key={item.id}
                className="relative rounded-2xl p-4 transition-all"
                style={{
                  ...sheet,
                  borderColor: affordable ? 'rgba(176,127,34,.34)' : 'rgba(36,26,20,.12)',
                  opacity: disabled ? 0.55 : 1
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      backgroundColor: affordable ? 'rgba(176,127,34,.13)' : 'rgba(36,26,20,.06)',
                      color: affordable ? 'var(--sand-stamp)' : 'var(--ink-3)',
                      border: `1px solid ${affordable ? 'rgba(176,127,34,.28)' : 'rgba(36,26,20,.10)'}`
                    }}
                  >
                    {getItemIcon(item.effect)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black mb-1" style={{ color: 'var(--ink)' }}>
                      {isFa ? item.name : item.nameEn}
                    </h4>
                    <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                      {isFa ? item.description : item.descriptionEn}
                    </p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={disabled}
                    className={`shrink-0 px-4 py-2.5 rounded-xl font-black transition-all ${disabled ? 'cursor-not-allowed' : 'cg-btn-clay active:scale-95'}`}
                    style={
                      disabled
                        ? {
                            backgroundColor: 'rgba(36,26,20,.07)',
                            color: 'var(--ink-3)',
                            border: '1px solid rgba(36,26,20,.10)'
                          }
                        : undefined
                    }
                  >
                    <div className="text-base tabular-nums flex items-center gap-1.5 justify-center">
                      <GameCoin size={15} />
                      {item.cost}
                    </div>
                    <div className="text-[11px] opacity-90">
                      {isFa ? 'خرید' : 'Buy'}
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mb-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <div
              className="px-4 py-3 rounded-xl text-sm font-black text-center"
              style={{
                backgroundColor: 'rgba(158,90,80,.12)',
                border: '1px solid rgba(158,90,80,.34)',
                color: '#8A4A42'
              }}
            >
              {errorMsg}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="sticky bottom-0 p-5 space-y-2.5"
          style={{
            backgroundColor: 'var(--paper)',
            backgroundImage: 'var(--tex-paper)',
            backgroundSize: '200px 200px',
            borderTop: '1px solid var(--paper-well-hair)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <button
            onClick={onContinue}
            className="cg-btn-clay w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all"
          >
            {isFa ? 'ادامه به طبقه بعد' : 'Continue to Next Floor'}
          </button>

          <button
            onClick={onCashOut}
            className="cg-btn-sage w-full py-3.5 rounded-2xl font-black text-base active:scale-95 transition-all"
          >
            {isFa ? `خروج با ${runState.loot} سکه` : `Cash Out ${runState.loot} coins`}
          </button>

          <p className="text-center text-[11px] font-bold pt-1" style={{ color: 'var(--ink-3)' }}>
            {isFa
              ? 'در صورت باخت، همه سکه‌ها از دست می‌روند'
              : 'If you lose, all coins will be lost'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TowerShopModal;
