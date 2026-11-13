import React, { useEffect, useState } from 'react';
import { X, Crown, Lock, Check, Coins, Ticket, Shield, Sparkles, Award } from 'lucide-react';
import { PlayerState } from '../types';
import { gameServer } from '../utils/gameServer';
import { SEASON_PASS_TIERS, seasonTierInfo, EconomyStateView, XpInfo } from '../utils/progression';
import { IAP_PACKAGES } from '../utils/economy';
import { executeGatewayCheckout, getPreferredGateway, setPreferredGateway, PaymentGatewayId, toPersianDigits } from '../utils/paymentAdapter';

interface BattlePassModalProps {
  player: PlayerState;
  onClose: () => void;
  onCoinsChange: (newCoins: number) => void;
  onPlayerSync?: (patch: Partial<PlayerState>) => void;
}

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  player,
  onClose,
  onCoinsChange,
  onPlayerSync,
}) => {
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [xpState, setXpState] = useState<XpInfo>(() => seasonTierInfo((player.score || 0) / 2));
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [gateway, setGateway] = useState<PaymentGatewayId>(() => getPreferredGateway());
  const [buyingPass, setBuyingPass] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    let cancelled = false;
    gameServer.getProgress().then((snap) => {
      if (cancelled || !snap) return;
      if (snap.xp) setXpState(seasonTierInfo(snap.xp.value));
      if (snap.economy) setEconomy(snap.economy);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const showToast = (text: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2600);
  };

  const currentLevel = Math.max(1, xpState.level || (player.level || 1));
  const hasPass = Boolean(economy.hasSeasonPass);

  const handleClaim = async (tierNum: number, track: 'free' | 'gold') => {
    const key = `${tierNum}_${track}`;
    if (busyTier) return;
    setBusyTier(key);
    try {
      const res = await gameServer.claimBattlePassTier(player, tierNum, track);
      if (!res.ok) {
        showToast(res.error || 'خطا در دریافت پاداش', 'err');
        return;
      }
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange(res.coins);
      if (onPlayerSync) {
        onPlayerSync({
          ...(typeof res.coins === 'number' ? { coins: res.coins } : {}),
          ...(res.items ? { items: res.items } : {}),
          ...(typeof res.towerTickets === 'number' ? { towerTickets: res.towerTickets } : {}),
        });
      }
      showToast(`پاداش پله ${toPersianDigits(tierNum)} دریافت شد!`, 'ok');
    } catch {
      showToast('خطا در دریافت پاداش', 'err');
    } finally {
      setBusyTier(null);
    }
  };

  const handleBuyGoldPass = async () => {
    if (buyingPass || hasPass) return;
    const pkg = IAP_PACKAGES.find((p) => p.id === 'season_battle_pass');
    if (!pkg) return;
    setBuyingPass(true);
    try {
      const receipt = await executeGatewayCheckout(pkg, gateway);
      const res = await gameServer.purchaseIapPackage(player, pkg.id, gateway, receipt.receiptId);
      if (!res.ok) {
        showToast(res.error || 'خطا در فعال‌سازی فصل‌نامه', 'err');
        return;
      }
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange(res.coins);
      if (onPlayerSync) {
        onPlayerSync({
          ...(typeof res.coins === 'number' ? { coins: res.coins } : {}),
          ...(res.items ? { items: res.items } : {}),
          ...(typeof res.towerTickets === 'number' ? { towerTickets: res.towerTickets } : {}),
        });
      }
      showToast(`فصل‌نامه طلایی فعال شد! +${toPersianDigits(res.coinsGranted || 0)} سکه هدیه`, 'ok');
    } catch {
      showToast('خطا در تکمیل پرداخت فصل‌نامه', 'err');
    } finally {
      setBuyingPass(false);
    }
  };

  const renderRewardIcon = (kind?: string) => {
    switch (kind) {
      case 'coins':
        return <Coins className="w-4 h-4 text-[#d97706] shrink-0" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#9333ea] shrink-0" />;
      case 'item':
        return <Shield className="w-4 h-4 text-[#2563eb] shrink-0" />;
      case 'jackpot':
        return <Award className="w-4 h-4 text-[#dc2626] shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#d97706] shrink-0" />;
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[28px] bg-[#f4e8d1] border-4 border-[#c89b62] shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.7)] overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3 bg-gradient-to-b from-[#78350f] via-[#5c280b] to-[#451a03] border-b-4 border-[#c89b62] text-[#fef3c7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#fbbf24] to-[#b45309] border-2 border-[#fde68a] flex items-center justify-center shadow-md">
                <Crown className="w-6 h-6 text-[#451a03]" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  فصل ۱: نبرد رستم و دیو سپید
                </h2>
                <p className="text-[11px] font-bold text-[#fde68a]/90">
                  ۳۰ پله پاداش فصلی · هر جدول و مأموریت روزانه XP می‌دهد
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#451a03]/80 border border-[#c89b62]/60 flex items-center justify-center text-[#fde68a] hover:bg-black/40 active:scale-95 transition"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Level & XP Bar */}
          <div className="mt-3 flex items-center gap-3 bg-black/30 rounded-2xl p-2.5 border border-[#c89b62]/40">
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-[#fbbf24] to-[#d97706] text-[#451a03] font-black text-xs shadow">
              پله فعلی: {toPersianDigits(currentLevel)} / ۳۰
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-[#fde68a] mb-1">
                <span>امتیاز تجربه (XP): {toPersianDigits(xpState.value)}</span>
                <span>تا پله بعد: {toPersianDigits(Math.max(0, xpState.need - xpState.into))} XP</span>
              </div>
              <div className="h-2.5 rounded-full bg-black/50 overflow-hidden border border-[#fde68a]/30">
                <div
                  className="h-full bg-gradient-to-l from-[#fbbf24] to-[#f59e0b] transition-all duration-300"
                  style={{ width: `${Math.min(100, xpState.pct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Upgrade Banner if not owned */}
          {!hasPass ? (
            <div className="mt-3 rounded-2xl bg-gradient-to-l from-[#92400e] via-[#b45309] to-[#78350f] p-2.5 border-2 border-[#fcd34d] shadow-inner">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="text-xs font-black text-[#fef3c7] flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#fde68a]" />
                    طومار طلایی فصل (۸۹,۰۰۰ تومان)
                  </div>
                  <div className="text-[10px] font-bold text-[#fde68a]/95">
                    فوراً +۳۵۰ سکه + باز شدن ۳۰ جایزه ستون طلایی (۲,۸۰۰+ سکه، بلیت برج و قاب تاج کیانی)
                  </div>
                </div>
                <button
                  onClick={handleBuyGoldPass}
                  disabled={buyingPass}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#fde047] to-[#eab308] text-[#451a03] font-black text-xs border-b-4 border-[#a16207] shadow active:translate-y-0.5 transition disabled:opacity-50"
                >
                  {buyingPass ? 'در حال فعال‌سازی...' : 'فعال‌سازی طومار طلایی'}
                </button>
              </div>
              {/* Gateway mini selector */}
              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                <span className="text-[#fde68a]/80 font-bold">درگاه:</span>
                {[
                  { id: 'web_shaparak' as const, label: 'وب مستقیم (+۱۵٪ سکه)' },
                  { id: 'bazaar' as const, label: 'کافه‌بازار' },
                  { id: 'myket' as const, label: 'مایکت' },
                ].map((gw) => (
                  <button
                    key={gw.id}
                    onClick={() => {
                      setGateway(gw.id);
                      setPreferredGateway(gw.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg font-bold transition ${
                      gateway === gw.id
                        ? 'bg-[#fef3c7] text-[#451a03] shadow-sm'
                        : 'bg-black/25 text-[#fde68a]/80 hover:bg-black/40'
                    }`}
                  >
                    {gw.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2.5 rounded-xl bg-[#065f46]/90 border border-[#6ee7b7] px-3 py-1.5 flex items-center justify-between text-xs font-black text-[#ecfdf5]">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#6ee7b7]" />
                طومار طلایی فصل برای شما فعال است!
              </span>
              <span className="text-[11px] text-[#a7f3d0]">تمام جوایز ستون طلایی قابل دریافتند</span>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mx-4 mt-2 px-3 py-2 rounded-xl text-xs font-black text-center border ${
              toast.kind === 'ok'
                ? 'bg-[#dcfce7] text-[#14532d] border-[#86efac]'
                : 'bg-[#fee2e2] text-[#7f1d1d] border-[#fca5a5]'
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Column Headers */}
        <div className="grid grid-cols-11 gap-2 px-4 py-2 bg-[#ead7b7] border-b-2 border-[#c89b62] text-[11px] font-black text-[#5c3a1e]">
          <div className="col-span-2 text-center">پله</div>
          <div className="col-span-4 text-center">مسیر رایگان</div>
          <div className="col-span-5 text-center text-[#92400e] flex items-center justify-center gap-1">
            <Crown className="w-3.5 h-3.5 text-[#d97706]" />
            ستون طلایی فصل
          </div>
        </div>

        {/* Tiers List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {SEASON_PASS_TIERS.map((t) => {
            const unlocked = currentLevel >= t.tier;
            const freeClaimed = economy.seasonPassClaimedFree?.includes(t.tier);
            const goldClaimed = economy.seasonPassClaimedGold?.includes(t.tier);

            return (
              <div
                key={t.tier}
                className={`grid grid-cols-11 gap-2 items-center p-2 rounded-2xl border-2 transition ${
                  unlocked
                    ? 'bg-[#fbf3e4] border-[#d4a373] shadow-sm'
                    : 'bg-[#e6d5b8]/70 border-[#cbb28c] opacity-85'
                }`}
              >
                {/* Tier badge */}
                <div className="col-span-2 flex flex-col items-center justify-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border-2 ${
                      unlocked
                        ? 'bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white border-[#fde68a] shadow'
                        : 'bg-[#cbb28c] text-[#5c3a1e] border-[#a98a5f]'
                    }`}
                  >
                    {toPersianDigits(t.tier)}
                  </div>
                </div>

                {/* Free Track */}
                <div className="col-span-4 flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#f4e8d1] border border-[#cbb28c]">
                  {t.freeReward ? (
                    <>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderRewardIcon(t.freeReward.kind)}
                        <span className="text-[11px] font-extrabold text-[#451a03] truncate">
                          {t.freeReward.labelFa}
                        </span>
                      </div>
                      {freeClaimed ? (
                        <span className="w-6 h-6 rounded-lg bg-[#16a34a]/15 text-[#15803d] flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : unlocked ? (
                        <button
                          onClick={() => handleClaim(t.tier, 'free')}
                          disabled={busyTier === `${t.tier}_free`}
                          className="px-2 py-1 rounded-lg bg-[#16a34a] text-white text-[10px] font-black shadow hover:bg-[#15803d] active:scale-95 shrink-0"
                        >
                          دریافت
                        </button>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#8c6d46] shrink-0" />
                      )}
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-[#8c6d46] mx-auto">—</span>
                  )}
                </div>

                {/* Gold Track */}
                <div
                  className={`col-span-5 flex items-center justify-between gap-1.5 p-2 rounded-xl border ${
                    hasPass
                      ? 'bg-gradient-to-l from-[#fef3c7] to-[#fde68a]/70 border-[#f59e0b]'
                      : 'bg-[#ead7b7] border-[#d97706]/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {renderRewardIcon(t.goldReward.kind)}
                    <span className="text-[11px] font-black text-[#78350f] truncate">
                      {t.goldReward.labelFa}
                    </span>
                  </div>
                  {goldClaimed ? (
                    <span className="w-6 h-6 rounded-lg bg-[#d97706]/20 text-[#92400e] flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                  ) : unlocked && hasPass ? (
                    <button
                      onClick={() => handleClaim(t.tier, 'gold')}
                      disabled={busyTier === `${t.tier}_gold`}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-b from-[#f59e0b] to-[#b45309] text-white text-[10px] font-black shadow active:scale-95 shrink-0"
                    >
                      دریافت
                    </button>
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#b45309] shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
