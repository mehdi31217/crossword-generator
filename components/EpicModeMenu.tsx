import React, { useEffect, useRef, useMemo } from 'react';
import { ArrowRight, Lock, Star, Swords, AlertTriangle, Check, RotateCcw } from 'lucide-react';
import { StoryBook, WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { LegendCard, ClayTierBadge } from './LegendCard';
import { getStoryChapterClayTier } from './CollectionScreen';
import { preloadAndDecodeImage } from '../utils/assetPreloader';
import { debug } from '../utils/debug';

interface EpicModeMenuProps {
  onBack: () => void;
  onPlayChapter: (chapterId: number) => void;
  isLoading: boolean;
  progress: number;
  isGuest: boolean;
  book: StoryBook;
  stars: Record<string, number>; // BookID_ChapterID -> count
}

const toFa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export const EpicModeMenu: React.FC<EpicModeMenuProps> = ({ onBack, onPlayChapter, isLoading, progress, isGuest, book, stars }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalStarsAchieved = useMemo(() => {
      let count = 0;
      Object.keys(stars).forEach(key => {
          if (key.startsWith(book.id)) count += stars[key];
      });
      return count;
  }, [stars, book.id]);

  const totalChapters = book.chapters.length;
  const completedChapters = book.chapters.filter(c => c.id < progress).length;
  const progressPct = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0;

  useEffect(() => {
    if (book.coverImage) void preloadAndDecodeImage(book.coverImage);
    book.chapters.forEach((ch) => {
      if (ch.image) void preloadAndDecodeImage(ch.image);
      if (ch.monsterAvatar) void preloadAndDecodeImage(ch.monsterAvatar);
    });
    if (scrollRef.current) {
        const activeCard = scrollRef.current.querySelector('[data-active="true"]');
        if (activeCard) {
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [book]);

  const genreIcon =
    book.genre === 'history' ? '👑' : book.genre === 'folklore' ? '🌿' : '⚔️';
  const genreColor =
    book.genre === 'history' ? '#C8952B' : book.genre === 'folklore' ? '#26A69A' : '#B85D38';

  return (
    <div
        dir="rtl"
        className="cg-sand w-full h-full flex flex-col overflow-hidden relative"
    >
        <header className="relative z-20 shrink-0 px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full transition-all active:scale-90"
                    style={{ backgroundColor: 'var(--sand-chip)', border: '1px solid rgba(36,26,20,.14)', color: 'var(--ink-2)' }}
                    aria-label="بازگشت"
                >
                    <ArrowRight size={18} />
                </button>

                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
                        style={{
                            backgroundColor: 'var(--paper-2)',
                            border: '2px solid var(--sand-hair-strong)',
                            boxShadow: '0 1px 0 var(--sand-lip) inset, 0 10px 16px -14px rgba(70,45,30,.85)',
                        }}
                    >
                        <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[8px] font-black tracking-[0.18em]" style={{ color: 'var(--ink-3)' }}>کمپین داستانی · لوح‌های خشتی</span>
                        <h1 className="text-base font-black leading-tight truncate" style={{ color: 'var(--ink)' }}>{book.title}</h1>
                    </div>
                </div>

                <div
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(200,149,43,.14)', border: '1px solid rgba(176,127,34,.35)' }}
                >
                    <Star size={13} fill="var(--cg-amber)" style={{ color: 'var(--cg-amber)' }} />
                    <span className="font-black text-xs" style={{ color: 'var(--sand-stamp)' }}>{toFa(totalStarsAchieved)}</span>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <span className="text-[8px] font-bold shrink-0" style={{ color: 'var(--ink-3)' }}>پیشرفت الواح</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sand-track)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#B4694B,#C8952B)' }}
                    />
                </div>
                <span className="text-[8px] font-black shrink-0" style={{ color: 'var(--ink-2)' }}>{toFa(completedChapters)}/{toFa(totalChapters)}</span>
            </div>
        </header>

        {isGuest && (
            <div
                className="relative z-20 mx-4 mb-1 rounded-2xl flex gap-2.5 items-start px-3.5 py-3"
                style={{ backgroundColor: 'rgba(200,149,43,.12)', border: '1px solid rgba(176,127,34,.34)', boxShadow: 'inset 0 1px 0 var(--sand-lip)' }}
                dir="rtl"
            >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--cg-amber)' }} />
                <div>
                    <h3 className="font-black text-[11px] mb-0.5" style={{ color: 'var(--sand-stamp)' }}>هشدار: حالت مهمان</h3>
                    <p className="text-[9px] leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                        برای ذخیره ستاره‌ها و پیشرفت در داستان، وارد حساب کاربری شوید.
                    </p>
                </div>
            </div>
        )}

        <div ref={scrollRef} className="flex-1 w-full overflow-y-auto px-4 pb-8 z-10 scrollbar-hide">
            <div className="max-w-md mx-auto relative pt-2">
                <div
                    className="absolute top-6 bottom-16 right-[21px] w-[3px] rounded-full"
                    style={{ background: 'linear-gradient(to bottom, var(--sand-hair-strong) 0%, var(--sand-hair) 72%, transparent 100%)' }}
                />

                {book.chapters.map((chapter, ci) => {
                    debug.log('[EPIC MENU] book.id:', book.id, 'progress:', progress, 'chapter.id:', chapter.id, 'isUnlocked:', chapter.id <= progress);
                    const isUnlocked = chapter.id <= progress;
                    const isCompleted = chapter.id < progress;
                    const isCurrent = chapter.id === progress;
                    const starCount = stars[`${book.id}_${chapter.id}`] || 0;

                    // Progressive Clay Tablet Tier for this chapter
                    const baseTier = getStoryChapterClayTier(ci, totalChapters);
                    const starTier: WorldMapCardRarity =
                        starCount >= 5 ? 4 : starCount >= 4 ? 3 : starCount >= 2 ? 2 : 1;
                    const chapterTier: WorldMapCardRarity = isCompleted
                        ? (Math.max(baseTier, starTier) as WorldMapCardRarity)
                        : baseTier;
                    const tierInfo = WORLD_MAP_RARITY[chapterTier];

                    return (
                        <div key={chapter.id} data-active={isCurrent}
                            className="relative mb-6 last:mb-16 group transition-all duration-500 animate-[card-enter_0.4s_ease-out_both]"
                            style={{ animationDelay: `${0.1 + ci * 0.08}s` }}>

                            <div
                                className="absolute right-[11px] top-6 w-6 h-6 rounded-full z-20 grid place-items-center transition-all duration-500"
                                style={{
                                    backgroundColor: isCompleted ? tierInfo.color : isCurrent ? 'var(--saffron)' : 'var(--paper)',
                                    border: `3px solid ${isCompleted || isCurrent ? 'var(--paper)' : 'var(--sand-hair)'}`,
                                    boxShadow: isCurrent
                                        ? '0 0 0 4px rgba(200,149,43,.22), 0 6px 12px -8px rgba(70,40,25,.9)'
                                        : '0 2px 4px -2px rgba(70,40,25,.7)',
                                }}
                            >
                                {isCompleted && <Check size={12} color="#FFF6EC" strokeWidth={4} />}
                            </div>

                            <div onClick={() => isUnlocked && !isLoading && onPlayChapter(chapter.id)}
                                className={`mr-10 ml-1 rounded-2xl overflow-hidden relative transition-all duration-300 ${isUnlocked ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : ''}`}
                                style={{
                                    backgroundColor: 'var(--paper)',
                                    backgroundImage: 'var(--tex-paper)',
                                    backgroundSize: '200px 200px',
                                    backgroundBlendMode: 'multiply',
                                    border: isCompleted
                                        ? `2px solid ${tierInfo.border}`
                                        : isCurrent
                                        ? '2px solid var(--sand-hair-strong)'
                                        : '1.5px solid var(--sand-hair)',
                                    boxShadow: isCurrent
                                        ? '0 1px 0 var(--sand-lip) inset, 0 18px 30px -22px rgba(20,10,5,.9)'
                                        : '0 1px 0 var(--sand-lip) inset, 0 12px 22px -20px rgba(20,10,5,.8)',
                                    color: 'var(--ink)',
                                }}>

                                {/* Top tier accent bar */}
                                <div
                                    className="h-1 w-full"
                                    style={{
                                        background: isUnlocked
                                            ? `linear-gradient(90deg, ${tierInfo.color}, ${tierInfo.border})`
                                            : 'rgba(120,85,60,0.2)',
                                    }}
                                />

                                <div className="h-28 w-full relative">
                                    <img
                                        src={chapter.image}
                                        alt={chapter.title}
                                        className={`w-full h-full object-cover ${isUnlocked ? '' : 'grayscale'}`}
                                        loading="eager"
                                        decoding="sync"
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--paper) 4%, transparent 65%)' }} />
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: 'rgba(36,26,20,.42)', backdropFilter: 'blur(2px)' }}>
                                            <span
                                                className="grid place-items-center w-9 h-9 rounded-full"
                                                style={{ backgroundColor: 'rgba(246,241,231,.16)', border: '1px solid rgba(246,241,231,.4)' }}
                                            >
                                                <Lock size={16} color="#F6F1E7" />
                                            </span>
                                        </div>
                                    )}

                                    {isUnlocked && (
                                        <div
                                            className="absolute bottom-1.5 left-2 flex items-center gap-0.5 px-1.5 py-[3px] rounded-full"
                                            style={{ backgroundColor: 'var(--sand-chip)', border: '1px solid var(--sand-hair)' }}
                                        >
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    size={9}
                                                    fill={i <= starCount ? '#C8952B' : 'transparent'}
                                                    style={{ color: i <= starCount ? '#C8952B' : 'var(--ink-3)' }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Chapter number + Sculpted Clay Tier Badge */}
                                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5 pointer-events-none">
                                        <ClayTierBadge tier={chapterTier} isFA size="sm" />
                                        <div
                                            className="px-2 py-[3px] rounded-md"
                                            style={{ backgroundColor: 'var(--sand-chip)', border: '1px solid var(--sand-hair)' }}
                                        >
                                            <span className="font-black text-[9px]" style={{ color: 'var(--sand-stamp)' }}>مرحله {toFa(chapter.id)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3.5 pt-2 pb-3 relative flex items-center gap-3" dir="rtl">
                                    {/* Miniature Progressive Clay Tablet Card for this Story Chapter */}
                                    <div className="w-[52px] shrink-0 -mt-5 relative z-10">
                                        <LegendCard
                                            chapterId={`${book.id}_${chapter.id}`}
                                            legend={{
                                                id: book.id,
                                                name: { fa: book.title, en: book.title },
                                                icon: genreIcon,
                                                color: genreColor,
                                            }}
                                            title={{ fa: chapter.title, en: chapter.title }}
                                            year={`خوان ${toFa(chapter.id)}`}
                                            rarity={isCompleted ? chapterTier : isUnlocked ? chapterTier : null}
                                            bgImage={chapter.image || null}
                                            isFA
                                            variant="thumb"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-[13px] mb-1 leading-snug truncate" style={{ color: 'var(--ink)' }}>{chapter.title}</h3>
                                        <p className="text-[10px] leading-relaxed line-clamp-1" style={{ color: 'var(--ink-2)' }}>
                                            {isUnlocked ? chapter.description : 'قفل است. مراحل قبل را تکمیل کنید.'}
                                        </p>

                                        <div className="mt-2.5 flex items-center justify-between">
                                            {isCompleted ? (
                                                <button className="cg-btn-cream px-3 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all">
                                                    <RotateCcw size={10} /> بازی مجدد
                                                </button>
                                            ) : isCurrent ? (
                                                <button className="cg-btn-clay px-4 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 active:scale-95 transition-all">
                                                    <Swords size={14} /> شروع نبرد
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: 'var(--ink-3)' }}>
                                                    <Lock size={11} /> لوح مهروموم
                                                </span>
                                            )}

                                            {isUnlocked && (
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--ink-3)' }}>
                                                    {isCompleted ? `لوح کسب‌شده · ${toFa(starCount)}/۵` : `پاداش: ${tierInfo.fa}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
