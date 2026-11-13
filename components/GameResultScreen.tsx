import React, { useState } from 'react';
import { Star, Swords, Feather, Trophy, Send, Share2, Flame } from 'lucide-react';
import { GameCoin } from './GameCoin';
import { Language, StoryBook, PlayerState, WORLD_MAP_RARITY, WorldMapCardRarity } from '../types';
import { gameServer } from '../utils/gameServer';
import { KILN_POLISH_COSTS, getKilnPolishRecipe } from '../utils/economy';

const faNum = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

interface FinalResult {
  status?: 'win' | 'lose' | 'draw' | string;
  reason?: string;
  myScore?: number;
  opScore?: number;
  myTime?: number;
  opTime?: number;
}

interface MultiPlayerInfo {
  avatar: string;
  name: string;
}

interface GameResultScreenProps {
  gameWon: boolean;
  currentGameMode: string;
  language: Language;
  category: string;
  currentChapterIndex: number | null;
  selectedBook: StoryBook | null;
  lastWinStars: number;
  player: PlayerState | null;
  finalResult: FinalResult;
  opponent: MultiPlayerInfo | null;
  gameMode: string;
  battleWager: number;
  trophyChange: number;
  matchType?: 'matchmaking' | 'direct' | 'arena' | null;
  matchScore?: number;
  onReturnToMenu: () => void;
  onBackToChapters: () => void;
  onRematch: () => void;
  categoryNameFa?: string;
  categoryNameEn?: string;
  gridSize?: number;
  view?: string;
}

function shareToTelegram(text: string) {
  const encoded = encodeURIComponent(text);
  // Try native Telegram URL scheme first, fall back to web
  const tgUrl = `tg://msg?text=${encoded}`;
  const webUrl = `https://t.me/share/url?url=&text=${encoded}`;

  // Try opening with Telegram app, fall back to web after a delay
  const w = window.open(tgUrl, '_blank');
  if (!w || w.closed || typeof w.closed === 'undefined') {
    window.open(webUrl, '_blank');
  }
}

function getShareText(
  gameWon: boolean,
  currentGameMode: string,
  category: string,
  finalResult: FinalResult,
  categoryNameFa?: string,
  categoryNameEn?: string,
  gridSize?: number,
  matchScore?: number,
): { fa: string; en: string } {
  const catFa = categoryNameFa || category;
  const catEn = categoryNameEn || category;
  const score = matchScore || finalResult?.myScore || 0;
  const size = gridSize ? `${gridSize}×${gridSize}` : '';

  if (currentGameMode === 'multiplayer') {
    const opScore = finalResult?.opScore || 0;
    if (finalResult?.status === 'win') {
      return {
        fa: `🏆 توی کراس‌ورد پرو در نبرد آنلاین برنده شدم!\n\n⚔️ من: ${score} امتیاز\n⚔️ حریف: ${opScore} امتیاز\n📐 ${size}\n\n⬇️ دانلود کن: crossword-pro.app`,
        en: `🏆 I won an online battle in Crossword Pro!\n\n⚔️ Me: ${score} pts\n⚔️ Opponent: ${opScore} pts\n📐 ${size}\n\n⬇️ Download: crossword-pro.app`,
      };
    }
    return {
      fa: `💔 توی کراس‌ورد پرو در نبرد آنلاین باختم...\n\n⚔️ من: ${score} امتیاز\n⚔️ حریف: ${opScore} امتیاز\n📐 ${size}\n\n⬇️ دانلود کن: crossword-pro.app`,
      en: `💔 I lost an online battle in Crossword Pro...\n\n⚔️ Me: ${score} pts\n⚔️ Opponent: ${opScore} pts\n📐 ${size}\n\n⬇️ Download: crossword-pro.app`,
    };
  }

  if (currentGameMode === 'story') {
    return {
      fa: `📖 من یک فصل از داستان‌های کراس‌ورد پرو رو فتح کردم!\n\n⭐ امتیاز: ${score}\n📐 ${size}\n📂 ${catFa}\n\n⬇️ دانلود کن: crossword-pro.app`,
      en: `📖 I conquered a chapter in Crossword Pro!\n\n⭐ Score: ${score}\n📐 ${size}\n📂 ${catEn}\n\n⬇️ Download: crossword-pro.app`,
    };
  }

  return {
    fa: `🎯 من توی کراس‌ورد پرو ${score} امتیاز گرفتم!\n\n📐 ${size}\n📂 ${catFa}\n\n⬇️ دانلود کن: crossword-pro.app`,
    en: `🎯 I scored ${score} in Crossword Pro!\n\n📐 ${size}\n📂 ${catEn}\n\n⬇️ Download: crossword-pro.app`,
  };
}

export const GameResultScreen: React.FC<GameResultScreenProps> = ({
  gameWon,
  currentGameMode,
  language,
  category,
  currentChapterIndex,
  selectedBook,
  lastWinStars,
  player,
  finalResult,
  opponent,
  gameMode,
  battleWager,
  trophyChange,
  matchType,
  matchScore,
  onReturnToMenu,
  onBackToChapters,
  onRematch,
  categoryNameFa,
  categoryNameEn,
  gridSize,
  view,
}) => {
  const [economy, setEconomy] = useState(() => gameServer.getLocalEconomyState());
  const [storyPolishMsg, setStoryPolishMsg] = useState<string | null>(null);

  // Only show result screen on the playing view — prevents stale gameWon=true
  // from overlaying lobby/menu during multiplayer reconnect or HMR
  if (!gameWon || currentGameMode === 'tower') {
    return null;
  }
  if (currentGameMode === 'multiplayer' && !finalResult.status) {
    return null;
  }
  if (view && view !== 'playing') {
    return null;
  }

  const isFA = language === 'fa';
  const shareTexts = getShareText(gameWon, currentGameMode, category, finalResult, categoryNameFa, categoryNameEn, gridSize, matchScore);

  const handleShare = () => {
    shareToTelegram(isFA ? shareTexts.fa : shareTexts.en);
  };

  const storyCardKey = selectedBook && currentChapterIndex ? `story:${selectedBook.id}:${currentChapterIndex}` : '';
  const currentStoryTier = (Math.min(
    4,
    Math.max(1, Number(economy.storyCardTiers?.[storyCardKey] || Math.min(4, Math.max(1, lastWinStars - 1)) || 1)),
  ) as WorldMapCardRarity);

  const handleStoryPolish = (useFreeSeal: boolean) => {
    if (!player || !storyCardKey || currentStoryTier >= 4) return;
    const nextTier = (Math.min(4, currentStoryTier + 1) as 2 | 3 | 4);
    const res = gameServer.polishCardInKiln(player, storyCardKey, nextTier, useFreeSeal, true);
    setEconomy(res.economy);
    if (!res.ok) {
      setStoryPolishMsg(res.error || 'سکه کافی ندارید');
      return;
    }
    setStoryPolishMsg(`✨ لوح خشتی این فصل به «${WORLD_MAP_RARITY[nextTier].fa}» صیقل یافت!`);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-4 sm:p-8 text-center animate-in zoom-in touch-none overflow-y-auto"
      style={{
        backgroundColor: 'var(--paper)',
        backgroundImage: 'var(--tex-paper), radial-gradient(circle at 20% 4%, rgba(180,105,75,.18), transparent 56%), radial-gradient(circle at 84% 96%, rgba(176,127,34,.16), transparent 54%)',
        backgroundSize: '200px 200px, auto, auto',
        backgroundBlendMode: 'multiply, normal, normal',
        color: 'var(--ink)',
      }}
    >
      {category === 'shahnameh' && currentChapterIndex && selectedBook ? (
        <div
          className="p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border-4 relative overflow-hidden max-w-sm w-full"
          style={{ backgroundColor: selectedBook.style.backgroundColor, borderColor: selectedBook.style.primaryColor }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${selectedBook.style.backgroundImagePattern})` }} />

          <div className="relative z-10 flex flex-col items-center">
            {/* Stars Display */}
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(s => {
                const achieved = s <= lastWinStars;
                return (
                  <Star
                    key={s}
                    size={26}
                    fill={achieved ? '#fbbf24' : 'transparent'}
                    className={achieved ? 'text-amber-400 animate-in zoom-in-110 duration-500 delay-[200ms]' : ''}
                    style={achieved ? undefined : { color: 'rgba(36,26,20,.22)' }}
                  />
                );
              })}
            </div>

            {/* Chapter Scene Image */}
            <div
              className="w-full h-40 mb-3 rounded-xl overflow-hidden shadow-inner border-2"
              style={{ borderColor: `${selectedBook.style.primaryColor}30` }}
            >
              <img
                src={selectedBook.chapters.find(c => c.id === currentChapterIndex)?.image}
                alt="Chapter"
                className="w-full h-full object-cover"
              />
            </div>

            <h2
              className="text-2xl sm:text-3xl font-black mb-1.5"
              style={{ fontFamily: selectedBook.style.fontFamily === 'serif' ? 'serif' : 'sans-serif', color: selectedBook.style.textColor }}
            >
              {isFA ? 'پیروزی!' : 'Victory!'}
            </h2>

            <p
              className="text-xs sm:text-sm font-bold leading-6 mb-3 px-3.5 py-2.5 rounded-xl border opacity-90 italic"
              style={{ backgroundColor: `${selectedBook.style.secondaryColor}40`, borderColor: `${selectedBook.style.primaryColor}40`, color: selectedBook.style.textColor }}
            >
              <Feather size={14} className="inline-block ml-1 mb-1" style={{ color: selectedBook.style.primaryColor }} />
              {selectedBook.chapters.find(c => c.id === currentChapterIndex)?.victoryText}
            </p>

            {/* Kiln Card Polishing Box for Story Chapters */}
            <div
              dir="rtl"
              className="w-full mb-3 rounded-2xl p-3 bg-[#2B160B]/95 border border-[#C89347] text-[#FFF3D6] text-right space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="flex items-center gap-1 text-[#FFD666]">
                  <Flame size={14} className="text-[#F5B82E]" />
                  {isFA ? 'عیار خشت این خوان:' : 'Chapter Tablet Tier:'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#F5B82E]/20 text-[#FFE396] text-[10px]">
                  {WORLD_MAP_RARITY[currentStoryTier].fa}
                </span>
              </div>
              {currentStoryTier < 4 && (() => {
                const nextTier = (currentStoryTier + 1) as 2 | 3 | 4;
                const recipe = getKilnPolishRecipe(nextTier);
                const curSeals = economy.freePolishTokens ?? 0;
                return (
                  <div className="flex flex-col sm:flex-row items-stretch gap-1.5 pt-1">
                    {curSeals >= recipe.sealOnlyCost && (
                      <button
                        type="button"
                        onClick={() => handleStoryPolish(true)}
                        className="flex-1 py-2 px-2 rounded-xl bg-gradient-to-r from-[#239693] to-[#166664] text-white text-[10px] font-black border border-[#7CE8C8] active:scale-95"
                      >
                        🔥 {recipe.sealOnlyLabelFa} ({faNum(curSeals)})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStoryPolish(false)}
                      className="flex-1 py-2 px-2 rounded-xl bg-gradient-to-b from-[#F5B82E] to-[#C87810] text-[#3B1A0B] text-[10px] font-black border border-[#FFF1B8] active:scale-95"
                    >
                      🔥 {recipe.hybridLabelFa}
                    </button>
                  </div>
                );
              })()}
              {storyPolishMsg && (
                <div className="rounded-xl bg-[#1A3C2A] border border-[#34D399] px-2 py-1 text-[10px] font-black text-[#A7F3D0] text-center">
                  {storyPolishMsg}
                </div>
              )}
            </div>

            <button
              onClick={onBackToChapters}
              className="w-full py-3.5 rounded-xl font-black text-base shadow-lg active:scale-95 transition-transform text-white"
              style={{ backgroundColor: selectedBook.style.primaryColor }}
            >
              {isFA ? 'بازگشت به نقشه' : 'Back to Map'}
            </button>

            {/* Share button for story mode */}
            <button
              onClick={handleShare}
              className="w-full mt-2.5 py-2.5 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#0088cc', color: 'white' }}
            >
              <Send size={15} />
              {isFA ? 'اشتراک در تلگرام' : 'Share on Telegram'}
            </button>
          </div>
        </div>
      ) : currentGameMode === 'multiplayer' ? (
        <div className="flex flex-col items-center max-w-md w-full px-4">
          {/* WINNER SCREEN */}
          {finalResult.status === 'win' && (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-amber-300/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {['👑', '🎉', '⭐', '🌟', '💫', '🏆', '✨'].map((emoji, i) => (
                  <span
                    key={i}
                    className="absolute text-xl animate-bounce"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${1.5 + Math.random() * 2}s`,
                      opacity: 0.5 + Math.random() * 0.5,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>
                <Trophy size={80} className="text-amber-500 mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-in zoom-in-110 duration-700" />
              </div>
              <h2 className="text-4xl font-black text-[color:var(--ink-win)] mb-2 drop-shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                {isFA ? '🏆 پیروزی!' : '🏆 Victory!'}
              </h2>
              <p className="text-[color:var(--ink-win)] opacity-80 font-bold text-sm mb-8 animate-in fade-in duration-700">
                {finalResult.reason === 'forfeit'
                  ? (isFA ? 'حریف بازی را ترک کرد' : 'Opponent forfeited')
                  : (isFA ? 'تبریک! شما برنده شدید!' : 'Congratulations! You won!')}
              </p>
            </>
          )}

          {/* LOSER SCREEN */}
          {finalResult.status === 'lose' && (
            <>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(158,90,80,.16), rgba(158,90,80,.04) 45%, transparent)' }} />
              <div className="relative">
                <div className="text-7xl mb-4 animate-in zoom-in-110 duration-700">💔</div>
              </div>
              <h2 className="text-4xl font-black text-[color:var(--ink-lose)] mb-2 drop-shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                {isFA ? '💔 شکست' : '💔 Defeat'}
              </h2>
              <p className="text-[color:var(--ink-lose)] opacity-80 font-bold text-sm mb-8 animate-in fade-in duration-700">
                {finalResult.reason === 'forfeit'
                  ? (isFA ? 'شما بازی را ترک کردید' : 'You left the game')
                  : (isFA ? 'نگران نباش، دفعه بعد برنده می‌شوی!' : "Don't worry, next time you'll win!")}
              </p>
            </>
          )}

          {/* DRAW SCREEN */}
          {finalResult.status === 'draw' && (
            <>
              <div className="text-7xl mb-4 animate-in zoom-in-110 duration-700">🤝</div>
              <h2 className="text-4xl font-black text-[color:var(--ink-draw)] mb-2 drop-shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                {isFA ? '🤝 تساوی' : '🤝 Draw'}
              </h2>
              <p className="text-[color:var(--ink-draw)] opacity-80 font-bold text-sm mb-8 animate-in fade-in duration-700">
                {isFA ? 'مسابقه بسیار نزدیک بود!' : 'What a close match!'}
              </p>
            </>
          )}

          {/* Game Summary */}
          <div className="w-full cg-paper rounded-3xl p-6 mb-6 space-y-4 max-h-[50vh] overflow-y-auto" dir={isFA ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-black text-[color:var(--ink)] mb-3 flex items-center gap-2">
              <span>{isFA ? '📊 خلاصه بازی' : '📊 Game Summary'}</span>
            </h3>

            {/* Your Stats */}
            <div className={`rounded-2xl p-4 border-2 transition-all ${finalResult.status === 'win' ? 'bg-[rgba(176,127,34,.14)] border-[rgba(176,127,34,.45)]' : finalResult.status === 'lose' ? 'bg-[rgba(158,90,80,.12)] border-[rgba(158,90,80,.38)]' : 'bg-[rgba(122,90,134,.12)] border-[rgba(122,90,134,.36)]'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${finalResult.status === 'win' ? 'bg-[rgba(226,192,121,.45)] border-[#B07F22]' : finalResult.status === 'lose' ? 'bg-[rgba(196,121,91,.25)] border-[#9E5A50]' : 'bg-[rgba(122,90,134,.18)] border-[#7A5A86]'}`}>
                  {player?.avatar}
                </div>
                <div className="flex-1">
                  <span className="font-black text-[color:var(--ink)]">{player?.name}</span>
                  <span className="text-xs text-[color:var(--ink-3)] mr-2 font-bold">({isFA ? 'شما' : 'You'})</span>
                </div>
                {finalResult.status === 'win' && <span className="text-2xl">👑</span>}
                {finalResult.status === 'lose' && <span className="text-[color:var(--ink-3)] text-2xl">💔</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: "var(--paper-well)", border: "1px solid var(--paper-well-hair)" }}>
                  <p className="text-[color:var(--ink-3)] text-xs font-bold mb-1">{isFA ? '⭐ امتیاز' : '⭐ Score'}</p>
                  <p className={`text-2xl font-black ${finalResult.status === 'win' ? 'text-[color:var(--ink-win)]' : 'text-[color:var(--ink)]'}`}>
                    {finalResult.myScore}
                  </p>
                </div>
                {finalResult.myTime !== undefined && (
                  <div className="rounded-xl p-3" style={{ backgroundColor: "var(--paper-well)", border: "1px solid var(--paper-well-hair)" }}>
                    <p className="text-[color:var(--ink-3)] text-xs font-bold mb-1">{isFA ? '⏱ زمان' : '⏱ Time'}</p>
                    <p className="text-2xl font-black text-[color:var(--ink)]">{Math.floor(finalResult.myTime / 60)}:{(finalResult.myTime % 60).toString().padStart(2, '0')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Opponent Stats */}
            {opponent && (
              <div className="bg-[color:var(--paper-well-2)] rounded-2xl p-4 border-2 border-[color:var(--paper-well-hair)]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[color:var(--paper-well-2)] flex items-center justify-center text-lg border-2 border-[color:var(--paper-well-hair)]">
                    {opponent.avatar}
                  </div>
                  <div className="flex-1">
                    <span className="font-black text-[color:var(--ink)]">{opponent.name}</span>
                  </div>
                  {finalResult.status === 'lose' && <span className="text-2xl">👑</span>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: "var(--paper-well)", border: "1px solid var(--paper-well-hair)" }}>
                    <p className="text-[color:var(--ink-3)] text-xs font-bold mb-1">{isFA ? '⭐ امتیاز' : '⭐ Score'}</p>
                    <p className="text-2xl font-black text-[color:var(--ink)]">{finalResult.opScore}</p>
                  </div>
                  {finalResult.opTime !== undefined && (
                    <div className="rounded-xl p-3" style={{ backgroundColor: "var(--paper-well)", border: "1px solid var(--paper-well-hair)" }}>
                      <p className="text-[color:var(--ink-3)] text-xs font-bold mb-1">{isFA ? '⏱ زمان' : '⏱ Time'}</p>
                      <p className="text-2xl font-black text-[color:var(--ink)]">{Math.floor(finalResult.opTime / 60)}:{(finalResult.opTime % 60).toString().padStart(2, '0')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trophy Change — hidden when trophy doesn't change (arena matches, etc.) */}
            {matchType !== 'arena' && trophyChange !== 0 && (
              <div className={`rounded-2xl p-4 border-2 ${trophyChange >= 0 ? 'bg-[rgba(176,127,34,.12)] border-[rgba(176,127,34,.42)]' : 'bg-[rgba(158,90,80,.10)] border-[rgba(158,90,80,.34)]'}`}>
                <p className="text-xs font-bold text-[color:var(--ink-3)] mb-2">{isFA ? '🏆 تغییر جام‌ها:' : '🏆 Trophy change:'}</p>
                <p className={`text-2xl font-black flex items-center gap-2 ${trophyChange >= 0 ? 'text-[color:var(--ink-win)]' : 'text-[color:var(--ink-lose)]'}`}>
                  {trophyChange >= 0 ? '▲' : '▼'} {Math.abs(trophyChange)}
                  <span className="text-xs font-bold text-[color:var(--ink-3)] ml-auto">{isFA ? 'جام فعلی' : 'Current trophies'}: {player?.league.trophies ?? 0}</span>
                </p>
              </div>
            )}

            {/* Deciding Factor */}
          </div>

          {/* Prize / Pot — show arena pot label for betting matches */}
          {battleWager > 0 && finalResult.status === 'win' && (
            <div
              className="px-6 py-4 rounded-2xl font-black mb-6 flex items-center gap-3 animate-in zoom-in-110 duration-500 text-[#FFF6EC]"
              style={{
                background: 'linear-gradient(180deg,#C99433,#A5731C)',
                border: '1px solid #8E6417',
                boxShadow: 'inset 0 1px 0 rgba(255,232,190,.5), inset 0 -2px 0 rgba(70,45,10,.38), 0 14px 24px -16px rgba(120,80,10,.95)',
              }}
            >
              <GameCoin size={26} className="drop-shadow shrink-0" />
              <span className="text-lg">
                {matchType === 'arena' ? (isFA ? '🎯 برندهٔ pot:' : '🎯 Pot:') : (isFA ? '🏆 جایزه:' : '🏆 Prize:')}{' '}
                <span className="text-2xl">{battleWager * 2}</span> {isFA ? 'سکه' : 'coins'}
              </span>
            </div>
          )}

          {battleWager > 0 && finalResult.status === 'lose' && (
            <div
              className="px-6 py-4 rounded-2xl font-black mb-6 flex items-center gap-3 text-[#FFF6EC]"
              style={{
                background: 'linear-gradient(180deg,#A98A72,#8A6B54)',
                border: '1px solid #6E5240',
                boxShadow: 'inset 0 1px 0 rgba(255,236,214,.35), inset 0 -2px 0 rgba(50,32,20,.35)',
              }}
            >
              <GameCoin size={26} className="shrink-0 opacity-70" />
              <span className="text-lg">
                {matchType === 'arena' ? (isFA ? '💰 باخت شرط:' : '💰 Wager:') : (isFA ? '💰 شرط باخته:' : '💰 Wager lost:')}{' '}
                <span className="text-2xl line-through">{battleWager}</span> {isFA ? 'سکه' : 'coins'}
              </span>
            </div>
          )}

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={onReturnToMenu}
              className="flex-1 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95"
              style={{
                backgroundColor: 'var(--paper-lift)',
                color: 'var(--ink)',
                border: '1px solid rgba(142,78,55,.32)',
                boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 12px 22px -16px rgba(70,45,30,.8)',
              }}
            >
              {isFA ? 'منو' : 'Menu'}
            </button>
            <button
              onClick={onRematch}
              className="flex-1 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 text-[#FFF6EC]"
              style={{
                background: 'var(--clay-shell)',
                border: '1px solid #8E4E37',
                boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 14px 24px -14px rgba(70,40,25,.95)',
              }}
            >
              <Swords size={20} className="inline mr-1.5" />
              {isFA ? 'بازی دوباره' : 'Rematch'}
            </button>
          </div>

          {/* Telegram Share Button */}
          <button
            onClick={handleShare}
            className="w-full max-w-xs mt-4 py-4 rounded-[2rem] font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#0088cc] text-white hover:bg-[#0077b3]"
          >
            <Send size={18} />
            {isFA ? 'اشتراک نتیجه در تلگرام' : 'Share result on Telegram'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center max-w-xs w-full px-4">
          <Trophy size={64} className="text-amber-500 mb-4 animate-bounce" />
          <h2 className="text-3xl font-black text-[color:var(--ink)] mb-2">
            {isFA ? '🎉 پیروزی!' : '🎉 Victory!'}
          </h2>
          {/* Show score for casual mode */}
          {matchScore !== undefined && matchScore > 0 && (
            <p className="text-lg font-black text-[color:var(--ink-3)] mb-6">
              {isFA ? `⭐ ${matchScore} امتیاز` : `⭐ ${matchScore} points`}
            </p>
          )}
          <button
            onClick={onReturnToMenu}
            className="w-full py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 text-[#FFF6EC]"
            style={{
              background: 'var(--clay-shell)',
              border: '1px solid #8E4E37',
              boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 14px 24px -14px rgba(70,40,25,.95)',
            }}
          >
            {isFA ? 'ادامه' : 'Continue'}
          </button>
          {/* Telegram Share Button */}
          <button
            onClick={handleShare}
            className="w-full mt-3 py-3.5 rounded-[2rem] font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#0088cc] text-white hover:bg-[#0077b3]"
          >
            <Share2 size={18} />
            {isFA ? 'اشتراک در تلگرام' : 'Share on Telegram'}
          </button>
        </div>
      )}
    </div>
  );
};
