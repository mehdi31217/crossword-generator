import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { PlayerState, Language } from '../types';
import { LeagueBadge } from './LeagueBadge';
import { LeagueInfoModal } from './LeagueInfoModal';
import { AvatarRenderer } from './AvatarRenderer';
import { GameCoin } from './GameCoin';
import { gameServer } from '../utils/gameServer';
import { FREE_AVATAR_IDS, getAvatarUnlockCost } from '../utils/economy';
import { EconomyStateView } from '../utils/progression';
import {
  CELEBRITY_AVATARS,
  FOOTBALL_AVATARS,
  getAvatarItem,
  AvatarItem,
} from '../data/avatars';
import {
  User, Award, History, Save, X, Calendar, Clock, Zap, LogIn, LogOut,
} from './GlassIcons';

const DEFAULT_CLAY_AVATAR_ID = 'clay_default';

interface ProfileModalProps {
  player: PlayerState;
  language: Language;
  onClose: () => void;
  onUpdate: (name: string, avatar: string, theme?: 'light' | 'dark') => void;
  onAuthTrigger: () => void;
  onLogout: () => void;
  onCoinsChange?: (coins: number) => void;
  onOpenShop?: () => void;
}

type TileTone = 'clay' | 'saffron' | 'sage' | 'dusty';

const TILES: Record<TileTone, { bg: string; border: string; ink: string }> = {
  clay: { bg: 'linear-gradient(150deg,#D08A67,#B4694B)', border: '#8E4E37', ink: '#FFF6EC' },
  saffron: { bg: 'linear-gradient(150deg,#E2C079,#B07F22)', border: '#9E7418', ink: '#3E2C0B' },
  sage: { bg: 'linear-gradient(150deg,#7C8C6E,#5E6E52)', border: '#4C5A42', ink: '#F6F8F2' },
  dusty: { bg: 'linear-gradient(150deg,#6F8E96,#4E6B72)', border: '#3F5A60', ink: '#F2F7F8' },
};

const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const Tile: React.FC<{ tone: TileTone; size: number; radius: number; children: React.ReactNode }> = ({ tone, size, radius, children }) => {
  const t = TILES[tone];
  return (
    <span
      className="grid place-items-center shrink-0"
      style={{
        width: size, height: size, borderRadius: radius,
        background: t.bg, border: `1px solid ${t.border}`, color: t.ink,
        boxShadow: '0 1px 0 rgba(255,226,204,.45) inset, 0 -2px 0 rgba(58,30,18,.22) inset, 0 10px 18px -14px rgba(70,40,25,.9)',
      }}
    >
      {children}
    </span>
  );
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  player,
  language,
  onClose,
  onUpdate,
  onAuthTrigger,
  onLogout,
  onCoinsChange,
  onOpenShop,
}) => {
  const isFA = language === 'fa';
  const [name, setName] = useState(player.name);
  const [avatar, setAvatar] = useState(player.avatar || DEFAULT_CLAY_AVATAR_ID);
  const [avatarTab, setAvatarTab] = useState<'celebrities' | 'football'>(() => {
    const item = getAvatarItem(player.avatar);
    return item?.category === 'football' ? 'football' : 'celebrities';
  });
  const [showLeagueInfo, setShowLeagueInfo] = useState(false);
  const [economy, setEconomy] = useState<EconomyStateView>(() => gameServer.getLocalEconomyState());
  const [busyUnlock, setBusyUnlock] = useState(false);
  const [unlockNote, setUnlockNote] = useState<string | null>(null);

  useEffect(() => {
    setName(player.name);
    setAvatar(player.avatar || DEFAULT_CLAY_AVATAR_ID);
    const item = getAvatarItem(player.avatar);
    if (item?.category === 'football') setAvatarTab('football');
    else if (item?.category === 'celebrities') setAvatarTab('celebrities');
    gameServer.getProgress().then((snap) => {
      if (snap?.economy) setEconomy(snap.economy);
    }).catch(() => {});
  }, [player]);

  const isAvatarUnlocked = (id: string): boolean => {
    if (!id || id === DEFAULT_CLAY_AVATAR_ID) return true;
    if (id === player.avatar) return true;
    if (FREE_AVATAR_IDS.includes(id)) return true;
    if (economy.unlockedAvatars?.includes(id)) return true;
    return false;
  };

  const selectedUnlocked = isAvatarUnlocked(avatar);
  const selectedUnlockCost = getAvatarUnlockCost(avatar);

  const handleUnlockSelectedAvatar = async () => {
    if (selectedUnlocked || busyUnlock) return;
    if (player.coins < selectedUnlockCost) {
      if (onOpenShop) {
        onClose();
        onOpenShop();
      } else {
        setUnlockNote(isFA ? 'سکه کافی نیست! از فروشگاه سکه تهیه کنید.' : 'Not enough coins');
      }
      return;
    }
    setBusyUnlock(true);
    try {
      const res = await gameServer.unlockContent(player, 'avatar', avatar);
      if (!res.ok) {
        setUnlockNote(res.error || (isFA ? 'خطا در بازگشایی تندیس' : 'Could not unlock'));
        return;
      }
      if (res.economy) setEconomy(res.economy);
      if (typeof res.coins === 'number') onCoinsChange?.(res.coins);
      setUnlockNote(isFA ? 'تندیس خشتی باز شد! اکنون ذخیره کنید.' : 'Avatar unlocked!');
    } catch {
      setUnlockNote(isFA ? 'خطا در بازگشایی تندیس' : 'Could not unlock');
    } finally {
      setBusyUnlock(false);
    }
  };

  const handleSave = () => {
    if (!selectedUnlocked) {
      handleUnlockSelectedAvatar();
      return;
    }
    localStorage.setItem('crossword-theme', 'light');
    document.documentElement.classList.remove('dark');
    onUpdate(name, avatar, 'light');
  };

  const selectedAvatarMeta: AvatarItem | null = getAvatarItem(avatar);
  const activeCatalog = avatarTab === 'celebrities' ? CELEBRITY_AVATARS : FOOTBALL_AVATARS;
  const isGuest = player.id === 'guest';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" style={{ background: 'rgba(46,28,18,.52)' }} onClick={onClose} />

      <div
        className="relative w-full max-w-sm sm:max-w-lg cg-glass rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom-20 duration-500 mx-2 sm:mx-0"
        dir={isFA ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <header className="p-4 sm:p-5 flex items-center justify-between sticky top-0 z-10"
          style={{ background: 'var(--cg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--cg-hair)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <Tile tone="clay" size={42} radius={13}>
              <User size={22} />
            </Tile>
            <h2 className="text-base sm:text-xl font-black text-[var(--cg-ink)] truncate">
              {isFA ? 'پروفایل و تندیس خشتی' : 'Player Profile & Clay Medallion'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="cg-chip coin">
              <GameCoin size={14} />
              <span className="font-black text-xs tabular-nums">{isFA ? toFa(player.coins) : player.coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[var(--cg-ink2)] transition-colors shrink-0"
              aria-label={isFA ? 'بستن' : 'Close'}
              style={{
                background: 'var(--paper-lift)',
                border: '1px solid rgba(142,78,55,.28)',
                boxShadow: '0 4px 10px -8px rgba(70,40,25,.8)',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5" style={{ scrollbarWidth: 'none' }}>
          {isGuest && (
            <div className="p-4 rounded-3xl flex items-center gap-3.5 animate-card-enter"
              style={{ background: 'rgba(176,127,34,.13)', border: '1px solid rgba(176,127,34,.36)' }}>
              <Tile tone="saffron" size={44} radius={14}>
                <LogIn size={22} />
              </Tile>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-sm" style={{ color: '#8A6415' }}>{isFA ? 'حساب مهمان خشتی' : 'Guest Account'}</h3>
                <p className="text-[11px] font-bold leading-relaxed mt-0.5" style={{ color: '#9E7418' }}>
                  {isFA ? 'می‌توانید تندیس و نام خود را همینجا تغییر دهید یا برای ثبت جهانی وارد شوید.' : 'Pick your clay medallion below, or sign in to sync globally.'}
                </p>
              </div>
              <button
                onClick={onAuthTrigger}
                className="cg-btn-clay shrink-0 px-3.5 py-2 rounded-2xl font-black text-xs transition-all active:scale-95"
              >
                {isFA ? 'ورود' : 'Login'}
              </button>
            </div>
          )}

          {unlockNote && (
            <div className="px-3 py-2 rounded-2xl text-xs font-black text-center bg-[#fef3c7] border border-[#f59e0b] text-[#78350f]">
              {unlockNote}
            </div>
          )}

          {/* Identity & 20 Themed Clay Medallion Avatars */}
          <section className="space-y-4">
            {/* Recessed Terracotta Showcase Pedestal */}
            <div
              className="rounded-[26px] p-4 flex flex-col items-center gap-3"
              style={{
                background: 'linear-gradient(180deg, #B56949 0%, #9E5437 100%)',
                border: '2px solid #6E331B',
                boxShadow:
                  'inset 0 4px 10px rgba(32, 10, 2, 0.72), 0 2px 0 rgba(255, 232, 206, 0.5)',
              }}
            >
              {/* Deep Carved Socket around Selected Medallion */}
              <div className="flex items-center gap-4 w-full">
                <div
                  className="relative w-24 h-24 rounded-full p-1.5 shrink-0 flex items-center justify-center"
                  style={{
                    background: '#7A3B21',
                    boxShadow:
                      'inset 3px 4px 8px rgba(18, 5, 1, 0.88), 0 1.5px 0 rgba(255, 226, 194, 0.45)',
                    border: '1.5px solid #53230E',
                  }}
                >
                  <AvatarRenderer avatar={avatar} size={84} />
                  {!selectedUnlocked && (
                    <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-[#451a03] border border-[#fde68a] text-[#fde68a] text-[9.5px] font-black flex items-center gap-1 shadow">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{isFA ? toFa(selectedUnlockCost) : selectedUnlockCost}</span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black mb-1"
                    style={{
                      background: 'rgba(38, 15, 5, 0.45)',
                      color: '#FFE3BA',
                      border: '1px solid rgba(255, 224, 184, 0.25)',
                    }}
                  >
                    {selectedAvatarMeta
                      ? isFA
                        ? selectedAvatarMeta.category === 'celebrities'
                          ? 'تندیس خشتی مشاهیر'
                          : 'تندیس خشتی اسطوره فوتبال'
                        : selectedAvatarMeta.category === 'celebrities'
                        ? 'Historical & Cultural Icon'
                        : 'World Football Legend'
                      : isFA
                      ? 'تندیس خشتی کلاسیک'
                      : 'Classic Clay Bust'}
                  </span>
                  <h3
                    className="text-lg font-black text-[#FFF7EA] truncate"
                    style={{ textShadow: '0 2px 3px rgba(24, 8, 2, 0.8)' }}
                  >
                    {selectedAvatarMeta
                      ? isFA
                        ? selectedAvatarMeta.nameFa
                        : selectedAvatarMeta.nameEn
                      : isFA
                      ? 'مسافر خشتی (پیش‌فرض)'
                      : 'Clay Traveler (Default)'}
                  </h3>
                  <p className="text-xs font-extrabold text-[#F5D6B1] mt-0.5">
                    {selectedAvatarMeta
                      ? isFA
                        ? selectedAvatarMeta.titleFa
                        : selectedAvatarMeta.titleEn
                      : isFA
                      ? 'نقش‌برجسته سفالی دست‌ساز'
                      : 'Hand-sculpted terracotta bust'}
                  </p>
                </div>
              </div>

              {/* Category Switcher: 10 Celebrities vs 10 Football Legends + Classic */}
              <div
                className="w-full grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl"
                style={{
                  background: '#7E3E24',
                  boxShadow: 'inset 2px 3px 6px rgba(20, 6, 1, 0.82)',
                  border: '1px solid #592712',
                }}
              >
                <button
                  type="button"
                  onClick={() => setAvatarTab('celebrities')}
                  className="py-2 px-3 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={
                    avatarTab === 'celebrities'
                      ? {
                          background: 'linear-gradient(180deg, #F6E9D2 0%, #DFC9A6 100%)',
                          color: '#2B160A',
                          border: '1.5px solid #5A2812',
                          boxShadow: '0 3px 0 #4D210E, inset 0 1.5px 0 rgba(255,255,255,0.85)',
                        }
                      : {
                          background: 'transparent',
                          color: '#F3D6B3',
                        }
                  }
                >
                  <span>🏛️</span>
                  <span>{isFA ? '۱۰ چهره ماندگار و مشاهیر' : '10 Famous Icons'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab('football')}
                  className="py-2 px-3 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={
                    avatarTab === 'football'
                      ? {
                          background: 'linear-gradient(180deg, #F6E9D2 0%, #DFC9A6 100%)',
                          color: '#2B160A',
                          border: '1.5px solid #5A2812',
                          boxShadow: '0 3px 0 #4D210E, inset 0 1.5px 0 rgba(255,255,255,0.85)',
                        }
                      : {
                          background: 'transparent',
                          color: '#F3D6B3',
                        }
                  }
                >
                  <span>⚽</span>
                  <span>{isFA ? '۱۰ اسطوره برتر فوتبال' : '10 Football Legends'}</span>
                </button>
              </div>

              {/* 5x2 Recessed Clay Medallion Grid (10 Portraits per Tab) */}
              <div
                className="w-full rounded-2xl p-2.5 grid grid-cols-5 gap-2"
                style={{
                  background: '#864328',
                  boxShadow: 'inset 2px 4px 8px rgba(20, 6, 1, 0.85)',
                  border: '1.5px solid #5D2914',
                }}
              >
                {activeCatalog.map((item) => {
                  const isSelected = avatar === item.id;
                  const unlocked = isAvatarUnlocked(item.id);
                  const cost = getAvatarUnlockCost(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setAvatar(item.id);
                        setUnlockNote(null);
                      }}
                      className={`relative group flex flex-col items-center gap-1 p-1 rounded-2xl transition-all active:scale-95 ${
                        isSelected ? 'scale-[1.04]' : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(180deg, #F7EAD3 0%, #DFC8A2 100%)'
                          : 'rgba(42, 16, 6, 0.42)',
                        border: isSelected ? '2px solid #F2B749' : '1.5px solid rgba(40, 14, 4, 0.65)',
                        boxShadow: isSelected
                          ? '0 4px 10px rgba(20, 6, 1, 0.65), inset 0 1px 0 rgba(255,255,255,0.85)'
                          : 'inset 1px 2px 4px rgba(15, 4, 1, 0.75)',
                      }}
                      title={isFA ? `${item.nameFa} — ${item.titleFa}` : `${item.nameEn} — ${item.titleEn}`}
                    >
                      <div style={{ filter: unlocked ? 'none' : 'grayscale(0.35) brightness(0.88)' }}>
                        <AvatarRenderer avatar={item.id} size={50} />
                      </div>
                      {!unlocked && (
                        <span className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded-full bg-[#451a03]/90 border border-[#fde68a]/70 text-[#fde68a] text-[8px] font-black flex items-center gap-0.5">
                          <Lock className="w-2 h-2" />
                          <span>{isFA ? toFa(cost) : cost}</span>
                        </span>
                      )}
                      <span
                        className="text-[9.5px] font-black leading-tight truncate max-w-full px-0.5"
                        style={{
                          color: isSelected ? '#2C160A' : '#F8E3C6',
                        }}
                      >
                        {isFA ? item.nameFa : item.nameEn.split(' ').pop()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Option to reset to Classic Clay Traveler Bust */}
              <div className="w-full flex items-center justify-between pt-0.5 px-1">
                <span className="text-[10px] font-bold text-[#F3D5B0]">
                  {isFA ? 'فردوسی و مسی رایگان · سایر تندیس‌ها با سکه باز می‌شوند' : 'Hand-crafted clay & ink medallions'}
                </span>
                <button
                  type="button"
                  onClick={() => setAvatar(DEFAULT_CLAY_AVATAR_ID)}
                  className="text-[10.5px] font-black px-2.5 py-1 rounded-xl transition-all active:scale-95"
                  style={{
                    background:
                      avatar === DEFAULT_CLAY_AVATAR_ID
                        ? '#F3E5CE'
                        : 'rgba(38, 14, 4, 0.45)',
                    color: avatar === DEFAULT_CLAY_AVATAR_ID ? '#2C160A' : '#FFE3BE',
                    border: '1px solid rgba(255, 226, 192, 0.3)',
                  }}
                >
                  {isFA ? 'تندیس کلاسیک' : 'Classic Bust'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--cg-ink3)] uppercase tracking-widest">{isFA ? 'نام کاربری' : 'Nickname'}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl font-black text-[var(--cg-ink)] outline-none transition-all"
                style={{ background: 'var(--paper)', border: '2px solid rgba(36,26,20,.18)' }}
                maxLength={15}
              />
            </div>

            <div className="flex gap-2">
              {selectedUnlocked ? (
                <button
                  onClick={handleSave}
                  className="cg-btn-clay flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  {isFA ? 'ذخیره تندیس و نام' : 'Save Profile'}
                </button>
              ) : (
                <button
                  onClick={handleUnlockSelectedAvatar}
                  disabled={busyUnlock}
                  className="cg-btn-clay flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <GameCoin size={18} />
                  <span>
                    {busyUnlock
                      ? isFA
                        ? 'در حال بازگشایی...'
                        : 'Unlocking...'
                      : isFA
                      ? `بازگشایی تندیس با ${toFa(selectedUnlockCost)} سکه`
                      : `Unlock Bust (${selectedUnlockCost} Coins)`}
                  </span>
                </button>
              )}
              {!isGuest && (
                <button
                  onClick={onLogout}
                  className="px-4 rounded-2xl font-black transition-colors active:scale-95"
                  style={{ background: 'rgba(158,90,80,.14)', border: '2px solid rgba(158,90,80,.34)', color: '#9E5A50' }}
                  title={isFA ? 'خروج' : 'Logout'}
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </section>

          {/* League */}
          <section>
            <LeagueBadge league={player.league} language={language} size="md" showProgress showInfoButton onInfoClick={() => setShowLeagueInfo(true)} />
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl flex flex-col items-center" style={{ background: 'rgba(176,127,34,.13)', border: '1px solid rgba(176,127,34,.32)' }}>
              <Tile tone="saffron" size={36} radius={11}><Award size={18} /></Tile>
              <span className="text-[10px] font-black uppercase mt-2" style={{ color: '#8A6415' }}>{isFA ? 'تعداد جام' : 'Trophies'}</span>
              <span className="text-xl font-black" style={{ color: '#7A5410' }}>{player.league.trophies}</span>
            </div>
            <div className="p-4 rounded-3xl flex flex-col items-center" style={{ background: 'rgba(78,107,114,.12)', border: '1px solid rgba(78,107,114,.3)' }}>
              <Tile tone="dusty" size={36} radius={11}><Zap size={18} /></Tile>
              <span className="text-[10px] font-black uppercase mt-2" style={{ color: '#4E6B72' }}>{isFA ? 'مسابقات' : 'Matches'}</span>
              <span className="text-xl font-black" style={{ color: '#3F5A60' }}>{player.history.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl flex flex-col items-center" style={{ background: 'rgba(142,78,55,.10)', border: '1px solid rgba(142,78,55,.26)' }}>
              <span className="text-[9px] font-black uppercase" style={{ color: '#8E4E37' }}>{isFA ? 'مجموع امتیاز' : 'Total Score'}</span>
              <span className="text-lg font-black" style={{ color: '#6E3A29' }}>{player.score.toLocaleString()}</span>
            </div>
            <div className="p-3.5 rounded-2xl flex flex-col items-center" style={{ background: 'rgba(94,110,82,.13)', border: '1px solid rgba(94,110,82,.3)' }}>
              <span className="text-[9px] font-black uppercase" style={{ color: '#5E6E52' }}>{isFA ? 'بهترین امتیاز' : 'Best Score'}</span>
              <span className="text-lg font-black" style={{ color: '#4C5A42' }}>{player.highScore.toLocaleString()}</span>
            </div>
          </div>

          {/* History */}
          <section className="space-y-3 pb-2">
            <div className="flex items-center gap-2 text-[var(--cg-ink2)]">
              <History size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest">{isFA ? 'آخرین رقابت‌ها' : 'Match History'}</h3>
            </div>
            <div className="space-y-2">
              {player.history.length === 0 ? (
                <div className="text-center py-8 text-[var(--cg-ink3)] font-bold italic text-sm">
                  {isFA ? 'هنوز رقابتی ثبت نشده است' : 'No matches played yet'}
                </div>
              ) : (
                player.history.map((m, i) => (
                  <div key={m.id} className="p-3.5 rounded-2xl flex items-center justify-between"
                    style={{ background: 'var(--paper-lift)', border: '1px solid rgba(36,26,20,.12)', animationDelay: `${0.4 + i * 0.08}s` }}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-[var(--cg-ink)] truncate">{m.category.toUpperCase()} {m.size}x{m.size}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--cg-ink3)] font-bold mt-0.5">
                        <Calendar size={11} /> {m.date}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block font-black text-sm" style={{ color: '#8E4E37' }}>+{m.score}</span>
                      <div className="flex items-center gap-1 text-[10px] text-[var(--cg-ink3)] font-bold justify-end">
                        <Clock size={11} /> {Math.floor(m.time / 60)}:{(m.time % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {showLeagueInfo && (
        <LeagueInfoModal language={language} playerLeague={player.league} onClose={() => setShowLeagueInfo(false)} />
      )}
    </div>
  );
};
