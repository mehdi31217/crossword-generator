import React, { useEffect, useState } from 'react';
import { Loader2, Crown, Sparkles, PlayCircle, CheckCircle2, ShieldCheck, Compass, Gift, CreditCard } from 'lucide-react';
import { InkShield, InkBolt, InkFlame, InkTower, InkClose, InkCheck, InkScroll } from './InkIcons';
import { GameCoin } from './GameCoin';
import { Language, PlayerState } from '../types';
import {
  SHOP_PRICES,
  IAP_PACKAGES,
  IapPackageDef,
  REWARDED_AD_COINS,
  REWARDED_AD_DAILY_CAP,
} from '../utils/economy';
import {
  PAYMENT_GATEWAYS,
  PaymentGatewayId,
  getPreferredGateway,
  setPreferredGateway,
  computeEffectiveCoins,
  executeGatewayCheckout,
  formatToman,
  toPersianDigits,
} from '../utils/paymentAdapter';
import { gameServer } from '../utils/gameServer';
import { track } from '../utils/analytics';
import { COSMETICS, type CosmeticsView, type CosmeticDef, type EconomyStateView } from '../utils/progression';
import { FortuneWheelModal } from './FortuneWheelModal';
import { BattlePassModal } from './BattlePassModal';
import { ClayPiggyBankModal, ClayPiggyJarBadge } from './ClayPiggyBankModal';

interface ShopModalProps {
  isOpen: boolean;
  language: Language;
  player: PlayerState | null;
  onClose: () => void;
  onPurchase: (item: string, cost: number) => void;
  onCoinsChange?: (coins: number) => void;
  onPlayerSync?: (patch: Partial<PlayerState>) => void;
}

type ShopTab = 'special' | 'coins' | 'boosters' | 'cosmetics';

const SHOP_ITEMS = [
  {
    id: 'trophyShield',
    icon: <InkShield size={20} />,
    cost: SHOP_PRICES.trophyShield,
    labelFa: 'سپر تروفی',
    labelEn: 'Trophy Shield',
    descFa: 'باخت بعدی در نبرد آنلاین تروفی کم نمی‌کند',
    descEn: "Next loss won't lose trophies",
  },
  {
    id: 'trophyBoost',
    icon: <InkBolt size={20} />,
    cost: SHOP_PRICES.trophyBoost,
    labelFa: 'تقویت تروفی',
    labelEn: 'Trophy Boost',
    descFa: 'برد بعدی +۵۰٪ تروفی بیشتر می‌دهد',
    descEn: 'Next win gives +50% more trophies',
  },
  {
    id: 'streakShield',
    icon: <InkFlame size={20} />,
    cost: SHOP_PRICES.streakShield,
    labelFa: 'سپر زنجیره روزانه',
    labelEn: 'Streak Shield',
    descFa: 'یک روز غیبت، زنجیره روزانه را نمی‌شکند',
    descEn: 'One missed day keeps the streak alive',
  },
  {
    id: 'towerTicket',
    icon: <InkTower size={20} />,
    cost: SHOP_PRICES.towerTicket,
    labelFa: 'بلیط برج بی‌نهایت',
    labelEn: 'Tower Ticket',
    descFa: 'یک بلیط ورودی اضافه برای صعود در برج',
    descEn: 'Extra ticket for Tower Mode',
  },
];

const FRAME_TONE: Record<string, string> = {
  gold: '#D6A93F',
  mint: '#8FA37E',
  royal: '#AE80A0',
  lapis: '#2A6F97',
  crown: '#C85A32',
  pahlavan: '#B57C2E',
  season: '#E5A93B',
  history: '#C0A277',
  epic: '#C8952B',
  folklore: '#C48C96',
  football: '#7C8C55',
};

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  language,
  player,
  onClose,
  onPurchase,
  onCoinsChange,
  onPlayerSync,
}) => {
  const isFA = language === 'fa';
  const n = (value: number) =>
    isFA ? String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]) : String(value);

  const [activeTab, setActiveTab] = useState<ShopTab>('special');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [cosmetics, setCosmetics] = useState<CosmeticsView | null>(null);
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [busyCosmetic, setBusyCosmetic] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);

  // Payment Gateway & Checkout state
  const [gateway, setGateway] = useState<PaymentGatewayId>(() => getPreferredGateway());
  const [checkoutPkg, setCheckoutPkg] = useState<IapPackageDef | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    title: string;
    receiptId: string;
    coinsGranted: number;
    gatewayLabel: string;
  } | null>(null);

  // Rewarded Video Ad state
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  // Sub-modals
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [showBattlePassModal, setShowBattlePassModal] = useState(false);
  const [showPiggyModal, setShowPiggyModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    track('shop_open');
    setEconomy(gameServer.getLocalEconomyState());
    gameServer.getProgress().then((p) => {
      if (!alive || !p) return;
      setCosmetics(p.cosmetics);
      if (p.economy) setEconomy(p.economy);
    });
    return () => {
      alive = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => setNote(null), 3600);
    return () => window.clearTimeout(id);
  }, [note]);

  if (!isOpen || !player) return null;

  const showNote = (text: string, kind: 'ok' | 'err' = 'ok') => setNote({ text, kind });

  const ownedCount = (id: string) =>
    id === 'trophyShield'
      ? player.items.trophyShield
      : id === 'trophyBoost'
      ? player.items.trophyBoost
      : id === 'streakShield'
      ? player.items.streakShield || 0
      : id === 'towerTicket'
      ? player.towerTickets || 0
      : 0;

  const handleBuyBooster = (id: string, cost: number) => {
    if (player.coins < cost) {
      showNote(isFA ? 'سکه کافی نیست! از تب خزانه سکه تهیه کنید.' : 'Not enough coins', 'err');
      setActiveTab('coins');
      return;
    }
    setPurchasing(id);
    setTimeout(() => {
      onPurchase(id, cost);
      setPurchasing(null);
      showNote(isFA ? 'تقویت‌کننده به کوله‌پشتی شما اضافه شد!' : 'Booster added!', 'ok');
    }, 320);
  };

  const owns = (id: string) => !!cosmetics?.owned.includes(id);
  const equipped = (def: CosmeticDef) =>
    def.kind === 'frame' ? cosmetics?.frame === def.id : cosmetics?.title === def.id;

  const buyCosmetic = async (def: CosmeticDef) => {
    if (player.coins < def.price) {
      showNote(isFA ? 'سکه کافی نیست! از تب خزانه سکه تهیه کنید.' : 'Not enough coins', 'err');
      setActiveTab('coins');
      return;
    }
    setBusyCosmetic(def.id);
    const res = await gameServer.purchaseCosmetic(def.id);
    setBusyCosmetic(null);
    if (!res.ok) {
      showNote(res.error || (isFA ? 'خرید ناموفق بود' : 'Purchase failed'), 'err');
      return;
    }
    setCosmetics((c) => (c ? { ...c, owned: res.owned || [...c.owned, def.id] } : c));
    if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
    track('cosmetic_buy', { id: def.id, price: def.price });
    showNote(isFA ? 'خریداری شد — حالا می‌توانی بپوشی!' : 'Purchased — equip it now', 'ok');
  };

  const equipCosmetic = async (def: CosmeticDef) => {
    const next = equipped(def) ? null : def.id;
    setBusyCosmetic(def.id);
    const res = await gameServer.equipCosmetic(next);
    setBusyCosmetic(null);
    if (!res.ok) {
      showNote(res.error || (isFA ? 'تغییر ناموفق بود' : 'Could not equip'), 'err');
      return;
    }
    setCosmetics(res.cosmetics || null);
    showNote(
      next ? (isFA ? 'با موفقیت پوشیده شد' : 'Equipped') : isFA ? 'برداشته شد' : 'Removed',
      'ok'
    );
  };

  const handleWatchRewardedAd = () => {
    if (watchingAd) return;
    if ((economy.rewardedAdsRemaining ?? REWARDED_AD_DAILY_CAP) <= 0) {
      showNote('سقف ۳ ویدیوی جایزه‌دار امروز تکمیل شده است', 'err');
      return;
    }
    setWatchingAd(true);
    setAdProgress(10);
    const stepTimer = window.setInterval(() => {
      setAdProgress((prev) => Math.min(95, prev + 22));
    }, 650);

    window.setTimeout(async () => {
      window.clearInterval(stepTimer);
      setAdProgress(100);
      try {
        const res = await gameServer.claimRewardedAd(player);
        if (!res.ok) {
          showNote(res.error || 'سقف ۳ ویدیوی امروز پر شده است', 'err');
        } else {
          if (res.economy) setEconomy(res.economy);
          if (typeof res.coins === 'number') {
            onCoinsChange?.(res.coins);
            onPlayerSync?.({ coins: res.coins });
          }
          showNote(`+${toPersianDigits(res.reward || REWARDED_AD_COINS)} سکه هدیه تماشای ویدیو دریافت شد!`, 'ok');
        }
      } catch {
        showNote('خطا در ثبت پاداش ویدیو', 'err');
      } finally {
        setWatchingAd(false);
        setAdProgress(0);
      }
    }, 2600);
  };

  const handleConfirmGatewayPurchase = async () => {
    if (!checkoutPkg || isProcessingPayment) return;
    setIsProcessingPayment(true);
    try {
      const receipt = await executeGatewayCheckout(checkoutPkg, gateway);
      const res = await gameServer.purchaseIapPackage(
        player,
        checkoutPkg.id,
        gateway,
        receipt.receiptId
      );
      if (!res.ok) {
        showNote(res.error || 'خطا در تکمیل پرداخت درون‌برنامه‌ای', 'err');
        return;
      }
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
      onPlayerSync?.({
        ...(typeof res.coins === 'number' ? { coins: res.coins } : {}),
        ...(res.items ? { items: res.items } : {}),
        ...(typeof res.towerTickets === 'number' ? { towerTickets: res.towerTickets } : {}),
      });
      if (res.cosmetics) setCosmetics(res.cosmetics);
      const gwDef = PAYMENT_GATEWAYS.find((g) => g.id === gateway);
      setLastReceipt({
        title: isFA ? checkoutPkg.titleFa : checkoutPkg.titleEn,
        receiptId: receipt.receiptId,
        coinsGranted: res.coinsGranted || 0,
        gatewayLabel: gwDef?.nameFa || gateway,
      });
      setCheckoutPkg(null);
      track('iap_purchase', { id: checkoutPkg.id, gateway, toman: checkoutPkg.priceToman });
    } catch {
      showNote('خطا در تکمیل پرداخت درون‌برنامه‌ای', 'err');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isPackAlreadyOwned = (pkg: IapPackageDef): boolean => {
    if (pkg.id === 'starter_clay_pack') return !!economy.purchasedPacks?.includes('starter_clay_pack');
    if (pkg.id === 'epic_patron_pass') return !!economy.hasEpicPatronPass;
    if (pkg.id === 'season_battle_pass') return !!economy.hasSeasonPass;
    return false;
  };

  const sheet: React.CSSProperties = {
    backgroundColor: 'var(--paper)',
    backgroundImage: 'var(--tex-paper)',
    backgroundSize: '200px 200px',
    border: '1.5px solid rgba(92,54,32,.24)',
    boxShadow: '0 1px 0 rgba(255,255,255,.78) inset, 0 10px 20px -16px rgba(70,45,30,.55)',
    color: 'var(--ink)',
  };

  const specialPacks = IAP_PACKAGES.filter((p) => p.category !== 'coins');
  const coinPacks = IAP_PACKAGES.filter((p) => p.category === 'coins');
  const adsRemaining = economy.rewardedAdsRemaining ?? Math.max(0, REWARDED_AD_DAILY_CAP - (economy.rewardedAdsToday || 0));

  const renderIapCard = (pkg: IapPackageDef) => {
    const owned = isPackAlreadyOwned(pkg);
    const { baseCoins, bonusCoins, totalCoins } = computeEffectiveCoins(pkg, gateway);

    return (
      <div
        key={pkg.id}
        className="relative overflow-hidden rounded-2xl p-3.5 transition-all"
        style={{
          ...sheet,
          background:
            pkg.id === 'starter_clay_pack' || pkg.id === 'epic_patron_pass'
              ? 'linear-gradient(165deg, #FDF6E7 0%, #F2E2C4 100%)'
              : sheet.backgroundColor,
          border: pkg.badgeFa ? '2px solid #B87D24' : '1.5px solid rgba(92,54,32,.24)',
        }}
      >
        {pkg.badgeFa && (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black mb-1.5"
            style={{
              background: 'linear-gradient(180deg, #D98A2B 0%, #A85E12 100%)',
              color: '#FFF8EC',
              boxShadow: '0 2px 4px rgba(40,18,4,0.35)',
            }}
          >
            {isFA ? pkg.badgeFa : pkg.badgeEn}
          </span>
        )}

        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black text-[#2B180A] leading-snug">
              {isFA ? pkg.titleFa : pkg.titleEn}
            </h4>
            <p className="text-[10.5px] font-bold text-[#61442B] mt-0.5 leading-relaxed">
              {isFA ? pkg.descFa : pkg.descEn}
            </p>

            {/* Coin + Bonus Pill */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {totalCoins > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f3dfc1] border border-[#c89b62] text-[10.5px] font-black text-[#451a03]">
                  <GameCoin size={13} />
                  <span>{n(totalCoins)} سکه</span>
                  {bonusCoins > 0 && (
                    <span className="text-[#15803d] font-black">
                      ({n(baseCoins)} + {n(bonusCoins)} هدیه وب)
                    </span>
                  )}
                </span>
              )}
              {pkg.daysSaved > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#e5d5bc] text-[9.5px] font-extrabold text-[#5c3a1e]">
                  ⏳ معادل {n(pkg.daysSaved)} روز پس‌انداز
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {owned ? (
              <span className="px-3 py-2 rounded-xl bg-[#dcfce7] border border-[#86efac] text-[#14532d] font-black text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>فعال است</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setCheckoutPkg(pkg)}
                className="cg-btn-clay px-3.5 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md whitespace-nowrap"
              >
                {formatToman(pkg.priceToman)}
              </button>
            )}

            {pkg.id === 'season_battle_pass' && (
              <button
                type="button"
                onClick={() => setShowBattlePassModal(true)}
                className="text-[10px] font-black text-[#8E4B30] underline hover:opacity-80"
              >
                مشاهده ۳۰ پله جوایز ◀
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCosmetic = (def: CosmeticDef) => {
    const has = owns(def.id);
    const on = equipped(def);
    const busy = busyCosmetic === def.id;
    const canAfford = player.coins >= def.price;
    const locked = def.grantOnly && !has;
    return (
      <div key={def.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={sheet}>
        <div
          className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
          style={
            has
              ? { background: 'rgba(176,127,34,.16)', color: '#9E7418' }
              : {
                  background: 'var(--paper-well-2)',
                  color: 'var(--ink-3)',
                  boxShadow: 'inset 0 1px 2px rgba(86,50,32,.12)',
                }
          }
        >
          {def.kind === 'frame' ? (
            (() => {
              const tone = FRAME_TONE[def.style || ''] || '#9E7418';
              return (
                <span
                  className="grid place-items-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    lineHeight: 1,
                    border: `2.5px ${has ? 'solid' : 'dashed'} ${tone}`,
                    background: 'var(--paper-lift)',
                    boxShadow: has
                      ? `0 0 0 2.5px ${tone}38`
                      : 'inset 0 1px 2px rgba(86,50,32,.14)',
                    opacity: has ? 1 : 0.72,
                  }}
                >
                  👑
                </span>
              );
            })()
          ) : (
            <InkScroll size={16} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate" style={{ color: 'var(--ink)' }}>
            {isFA ? def.nameFa : def.nameEn}
          </p>
          <p className="text-[9.5px] font-bold" style={{ color: 'var(--ink-3)' }}>
            {def.kind === 'frame'
              ? isFA
                ? 'قاب تندیس خشتی'
                : 'Avatar frame'
              : isFA
              ? 'لقب افتخاری پروفایل'
              : 'Profile title'}
          </p>
        </div>
        {busy ? (
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--ink-3)' }} />
        ) : has ? (
          <button
            onClick={() => equipCosmetic(def)}
            className={`px-3 py-1.5 rounded-lg text-[10.5px] font-black transition-all active:scale-95 ${
              on ? 'cg-btn-sage' : 'cg-btn-cream'
            }`}
          >
            {on ? (isFA ? 'پوشیده ✓' : 'Equipped') : isFA ? 'بپوش' : 'Equip'}
          </button>
        ) : locked ? (
          <span
            className="text-[9.5px] font-black px-2 text-center leading-tight"
            style={{ color: 'var(--ink-3)' }}
          >
            {def.id === 'frame_season_gold'
              ? isFA
                ? 'پاداش پله ۳۰ فصل‌نامه'
                : 'Season Tier 30'
              : isFA
              ? 'پاداش کالکشن'
              : 'Collection reward'}
          </span>
        ) : (
          <button
            onClick={() => buyCosmetic(def)}
            className={`${
              canAfford ? 'cg-btn-clay' : 'cg-price-off'
            } px-3 py-1.5 rounded-lg text-[10.5px] font-black flex items-center gap-1.5 transition-all active:scale-95`}
          >
            <GameCoin size={13} />
            <span>{n(def.price)}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(38,20,10,.68)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md cg-glass p-4 sm:p-5 animate-in zoom-in-95 duration-300 max-h-[92dvh] flex flex-col overflow-hidden"
        style={{ borderRadius: 28 }}
        dir={isFA ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center p-1.5"
              style={{
                background: 'var(--clay-shell)',
                border: '1.5px solid var(--clay-ink)',
                color: '#FFF6EC',
                boxShadow:
                  'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3)',
              }}
            >
              <GameCoin size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight" style={{ color: 'var(--ink)' }}>
                {isFA ? 'بازارچه خشتی و خزانه' : 'Clay Bazaar & Treasury'}
              </h3>
              <p className="text-[10px] font-bold text-[#6E4F35]">
                {isFA ? 'خرید مستقیم وب (+۱۵٪ سکه هدیه)، بازار و مایکت' : 'Direct Web (+15% Bonus), Bazaar & Myket'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="cg-chip coin">
              <GameCoin size={15} />
              <span className="font-black text-sm tabular-nums">{n(player.coins)}</span>
            </div>
            <button
              onClick={onClose}
              className="cg-btn-cream w-9 h-9 rounded-full grid place-items-center transition-colors"
              aria-label="بستن"
            >
              <InkClose size={18} />
            </button>
          </div>
        </div>

        {/* Gateway Selector Bar */}
        <div
          className="mb-3 p-1.5 rounded-2xl flex items-center justify-between gap-1 shrink-0"
          style={{
            backgroundColor: '#E5D5BC',
            border: '1px solid rgba(92,54,32,.25)',
          }}
        >
          {PAYMENT_GATEWAYS.map((gw) => {
            const active = gateway === gw.id;
            return (
              <button
                key={gw.id}
                type="button"
                onClick={() => {
                  setGateway(gw.id);
                  setPreferredGateway(gw.id);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center ${
                  active
                    ? 'bg-[#78350f] text-[#FFF8EC] shadow-sm'
                    : 'text-[#4A2E16] hover:bg-black/5'
                }`}
              >
                <span>{gw.id === 'web_shaparak' ? '🌐 درگاه وب' : gw.id === 'bazaar' ? '🛍️ کافه‌بازار' : '📦 مایکت'}</span>
                <span className={`text-[8.5px] ${active ? 'text-[#fde68a]' : 'text-[#8c5828]'}`}>
                  {gw.badgeFa || 'پرداخت آنی'}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4 Category Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 shrink-0">
          {[
            { id: 'special' as ShopTab, labelFa: 'پیشنهاد ویژه', labelEn: 'Special' },
            { id: 'coins' as ShopTab, labelFa: 'خزانه سکه', labelEn: 'Coins' },
            { id: 'boosters' as ShopTab, labelFa: 'تقویت‌کننده', labelEn: 'Boosters' },
            { id: 'cosmetics' as ShopTab, labelFa: 'قاب و لقب', labelEn: 'Cosmetics' },
          ].map((tab) => {
            const on = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 ${
                  on ? 'cg-btn-clay shadow-sm' : 'cg-btn-cream opacity-85'
                }`}
              >
                {isFA ? tab.labelFa : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Toast Notification */}
        {note && (
          <div
            className="mb-2.5 rounded-xl px-3 py-2 text-[11px] font-black text-center shrink-0"
            style={
              note.kind === 'ok'
                ? {
                    backgroundColor: 'rgba(94,110,82,.16)',
                    border: '1px solid rgba(94,110,82,.45)',
                    color: '#2F4820',
                  }
                : {
                    backgroundColor: 'rgba(185,28,28,.12)',
                    border: '1px solid rgba(185,28,28,.35)',
                    color: '#7F1D1D',
                  }
            }
          >
            {note.text}
          </div>
        )}

        {/* Receipt Banner */}
        {lastReceipt && (
          <div className="mb-3 p-3 rounded-2xl bg-[#ecfdf5] border-2 border-[#10b981] text-[#064e3b] text-xs shrink-0">
            <div className="flex items-center justify-between font-black mb-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                خرید با موفقیت ثبت شد!
              </span>
              <button
                onClick={() => setLastReceipt(null)}
                className="text-[10px] underline text-[#047857]"
              >
                بستن رسید
              </button>
            </div>
            <div className="text-[10.5px] font-bold space-y-0.5">
              <div>بسته: {lastReceipt.title}</div>
              {lastReceipt.coinsGranted > 0 && (
                <div>سکه افزوده‌شده: +{n(lastReceipt.coinsGranted)} سکه</div>
              )}
              <div>درگاه: {lastReceipt.gatewayLabel} · کد پیگیری: {lastReceipt.receiptId}</div>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5" style={{ scrollbarWidth: 'none' }}>
          {activeTab === 'special' && (
            <>
              {/* Clay Jar Piggy Bank Feature Card */}
              <div
                onClick={() => setShowPiggyModal(true)}
                className="cursor-pointer p-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all hover:brightness-[1.02] active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(160deg, #FBF4E5 0%, #F2DFC2 62%, #E5C89E 100%)',
                  border: '2px solid #C27B43',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 0 #8F542A, 0 10px 20px -12px rgba(60,32,14,0.45)',
                  color: '#3B200E',
                }}
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#B87B28] bg-[#F5EBDC] shrink-0 shadow-sm">
                  <img
                    src="/images/ui/khomreh-jar.jpg"
                    alt="خمرهٔ زرین سفالی"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-115"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#B86336] text-[#FFF8EE]">
                      خمرهٔ زرین سفالی
                    </span>
                    <span className="text-[10px] font-black text-[#176E67]">
                      +۳ سکه با هر کلمه!
                    </span>
                  </div>
                  <div className="text-xs font-black text-[#3B200E]">
                    موجودی قلک شما: {n(economy.piggyBankCoins ?? 420)} / {n(1500)} سکه
                  </div>
                  <div className="text-[9.5px] font-extrabold text-[#7A4B2A] mt-0.5">
                    مشاهده خمره و شکستن قلک با پتک زرین ◀
                  </div>
                </div>
                <ClayPiggyJarBadge
                  language={language}
                  compact
                  onClick={() => setShowPiggyModal(true)}
                />
              </div>

              {/* Quick Launch Row: Daily Fortune Wheel & Season Battle Pass */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowWheelModal(true)}
                  className="p-3 rounded-2xl text-right transition-all active:scale-95 flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(155deg, #78350F 0%, #451A03 100%)',
                    border: '2px solid #F59E0B',
                    color: '#FEF3C7',
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Compass className="w-5 h-5 text-[#FBBF24]" />
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F59E0B] text-[#451A03]">
                      روزانه رایگان
                    </span>
                  </div>
                  <div className="text-xs font-black">گردونه شانس خشتی</div>
                  <div className="text-[9.5px] text-[#FDE68A]/90 font-bold mt-0.5">
                    تا ۲۵۰ سکه و بلیط برج ◀
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBattlePassModal(true)}
                  className="p-3 rounded-2xl text-right transition-all active:scale-95 flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(155deg, #92400E 0%, #5C280B 100%)',
                    border: '2px solid #FCD34D',
                    color: '#FEF3C7',
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Crown className="w-5 h-5 text-[#FDE047]" />
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FDE047] text-[#451A03]">
                      ۳۰ پله جایزه
                    </span>
                  </div>
                  <div className="text-xs font-black">فصل‌نامه طومار طلایی</div>
                  <div className="text-[9.5px] text-[#FDE68A]/90 font-bold mt-0.5">
                    مشاهده پیشرفت و جوایز ◀
                  </div>
                </button>
              </div>

              {/* Rewarded Video Ad Card (+25 Coins, 3/day) */}
              <div
                className="p-3 rounded-2xl flex items-center justify-between gap-2.5"
                style={{
                  background: 'linear-gradient(165deg, #ECFDF5 0%, #D1FAE5 100%)',
                  border: '1.5px solid #34D399',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[#064E3B] flex items-center gap-1">
                      <span>سکه رایگان با تماشای ویدیو</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-[#10B981]/20 text-[9px] text-[#047857]">
                        {n(adsRemaining)}/{n(REWARDED_AD_DAILY_CAP)} امروز
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-[#047857] truncate">
                      تماشای ویدیوی کوتاه · فوراً +{n(REWARDED_AD_COINS)} سکه هدیه
                    </p>
                    {watchingAd && (
                      <div className="mt-1 h-1.5 w-full rounded-full bg-[#A7F3D0] overflow-hidden">
                        <div
                          className="h-full bg-[#059669] transition-all duration-300"
                          style={{ width: `${adProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleWatchRewardedAd}
                  disabled={watchingAd || adsRemaining <= 0}
                  className="px-3 py-2 rounded-xl bg-[#059669] text-white font-black text-xs shadow active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {watchingAd
                    ? 'در حال پخش...'
                    : adsRemaining > 0
                    ? `+${n(REWARDED_AD_COINS)} سکه`
                    : 'تکمیل شد'}
                </button>
              </div>

              {/* Special Value Bundles */}
              {specialPacks.map(renderIapCard)}
            </>
          )}

          {activeTab === 'coins' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#fef3c7] border border-[#f59e0b] text-[10.5px] font-bold text-[#78350f] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d97706] shrink-0" />
                <span>
                  با انتخاب <b>درگاه مستقیم وب‌سایت</b>، روی تمام بسته‌های سکه <b>+۱۵٪ سکه هدیه بیشتر</b> دریافت می‌کنید!
                </span>
              </div>
              {coinPacks.map(renderIapCard)}
            </>
          )}

          {activeTab === 'boosters' && (
            <div className="space-y-2.5">
              {SHOP_ITEMS.map((item) => {
                const owned = ownedCount(item.id);
                const canAfford = player.coins >= item.cost;
                const isBuying = purchasing === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden p-3.5 rounded-2xl transition-all"
                    style={sheet}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={
                          canAfford
                            ? {
                                background: 'rgba(176,127,34,.14)',
                                color: 'var(--clay-ink)',
                                boxShadow:
                                  'inset 0 2px 3px rgba(86,50,32,.16), inset 0 -1px 0 rgba(255,255,255,.55)',
                              }
                            : {
                                background: 'var(--paper-well-2)',
                                color: 'var(--ink-3)',
                                boxShadow: 'inset 0 2px 3px rgba(86,50,32,.10)',
                              }
                        }
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs sm:text-sm" style={{ color: 'var(--ink)' }}>
                          {isFA ? item.labelFa : item.labelEn}
                        </p>
                        <p className="text-[10px] font-bold truncate" style={{ color: 'var(--ink-3)' }}>
                          {isFA ? item.descFa : item.descEn}
                        </p>
                        <p className="text-[9.5px] font-black mt-0.5" style={{ color: 'var(--clay-ink)' }}>
                          {isFA ? `موجودی فعلی: ${n(owned)}` : `Owned: ${owned}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyBooster(item.id, item.cost)}
                        disabled={isBuying}
                        className={`${
                          isBuying ? 'cg-btn-sage' : canAfford ? 'cg-btn-clay' : 'cg-price-off'
                        } px-3.5 py-2 rounded-xl font-black text-xs transition-all active:scale-95 flex-shrink-0`}
                      >
                        {isBuying ? (
                          <InkCheck size={13} />
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <GameCoin size={13} />
                            <span>{n(item.cost)}</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="space-y-2">
              {cosmetics ? (
                COSMETICS.map(renderCosmetic)
              ) : (
                <div className="flex justify-center py-6">
                  <Loader2 size={18} className="animate-spin" style={{ color: 'var(--ink-3)' }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Gateway Checkout Confirmation Sheet */}
        {checkoutPkg && (
          <div
            className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150"
            onClick={() => !isProcessingPayment && setCheckoutPkg(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-3xl p-4 bg-[#f4e8d1] border-4 border-[#92400e] shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#c89b62] pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#92400e]" />
                  <h4 className="text-sm font-black text-[#451a03]">تأیید و پرداخت امن</h4>
                </div>
                <button
                  onClick={() => !isProcessingPayment && setCheckoutPkg(null)}
                  className="text-xs font-black text-[#78350f]"
                >
                  بستن ✕
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[#fbf3e4] border border-[#d4a373] space-y-1">
                <div className="text-xs font-black text-[#451a03]">{checkoutPkg.titleFa}</div>
                <div className="text-[10.5px] font-bold text-[#61442B]">{checkoutPkg.descFa}</div>
                {(() => {
                  const { baseCoins, bonusCoins, totalCoins } = computeEffectiveCoins(checkoutPkg, gateway);
                  return totalCoins > 0 ? (
                    <div className="pt-1 flex items-center gap-1.5 text-xs font-black text-[#15803d]">
                      <Gift className="w-4 h-4" />
                      <span>
                        دریافتی کل: {n(totalCoins)} سکه {bonusCoins > 0 ? `(شامل +${n(bonusCoins)} سکه هدیه وب)` : `(پایه: ${n(baseCoins)})`}
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Gateway Radio Selection */}
              <div className="space-y-1.5">
                <div className="text-[10.5px] font-black text-[#5c3a1e]">انتخاب درگاه پرداخت:</div>
                {PAYMENT_GATEWAYS.map((gw) => {
                  const selected = gateway === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => {
                        setGateway(gw.id);
                        setPreferredGateway(gw.id);
                      }}
                      className={`w-full p-2.5 rounded-xl border-2 text-right flex items-center justify-between transition ${
                        selected
                          ? 'bg-[#fef3c7] border-[#b45309]'
                          : 'bg-[#ead7b7]/60 border-transparent'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-[#451a03]">{gw.nameFa}</div>
                        <div className="text-[9.5px] font-bold text-[#78350f]">{gw.subtitleFa}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-[#92400e] text-[#fef3c7] text-[9.5px] font-black">
                        {gw.badgeFa || 'پرداخت آنی'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setCheckoutPkg(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#dfd0b8] text-[#451a03] font-black text-xs"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmGatewayPurchase}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#16a34a] to-[#15803d] text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 active:translate-y-0.5"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال اتصال به درگاه...</span>
                    </>
                  ) : (
                    <span>پرداخت {formatToman(checkoutPkg.priceToman)}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-modals launched from Shop */}
      {showWheelModal && (
        <FortuneWheelModal
          isOpen={showWheelModal}
          language={language}
          player={player}
          onClose={() => setShowWheelModal(false)}
          onPlayerSync={(patch) => {
            if (typeof patch.coins === 'number') onCoinsChange?.(patch.coins);
            onPlayerSync?.(patch);
            setEconomy(gameServer.getLocalEconomyState());
          }}
        />
      )}

      {showBattlePassModal && (
        <BattlePassModal
          player={player}
          onClose={() => setShowBattlePassModal(false)}
          onCoinsChange={(c) => onCoinsChange?.(c)}
          onPlayerSync={(patch) => {
            onPlayerSync?.(patch);
            setEconomy(gameServer.getLocalEconomyState());
          }}
        />
      )}

      {showPiggyModal && (
        <ClayPiggyBankModal
          isOpen={showPiggyModal}
          onClose={() => setShowPiggyModal(false)}
          player={player}
          language={language}
          economy={economy}
          onPlayerUpdate={(updated, nextEco) => {
            onCoinsChange?.(updated.coins);
            onPlayerSync?.({ coins: updated.coins });
            if (nextEco) setEconomy(nextEco);
            else setEconomy(gameServer.getLocalEconomyState());
          }}
        />
      )}
    </div>
  );
};
