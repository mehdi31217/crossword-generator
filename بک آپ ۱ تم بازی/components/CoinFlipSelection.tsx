import React, { useState, useEffect, useRef } from 'react';
import { Zap, Merge } from 'lucide-react';
import { Language, GridSize, Category } from '../types';
import { debug } from '../utils/debug';

interface PlayerSelection {
    playerId: string;
    playerName: string;
    playerAvatar: string;
    category: Category;
    size: GridSize;
}

interface CoinFlipSelectionProps {
    language: Language;
    mySelection: PlayerSelection;
    opponentSelection: PlayerSelection;
    isHost: boolean;
    selectedCategory?: Category | null;
    selectedSize?: GridSize | null;
    onComplete: (selectedCategory: Category, selectedSize: GridSize) => void;
}

export const CoinFlipSelection: React.FC<CoinFlipSelectionProps> = ({
    language,
    mySelection,
    opponentSelection,
    isHost,
    selectedCategory: receivedCategory,
    selectedSize: receivedSize,
    onComplete
}) => {
    debug.log('[CoinFlipSelection] Component rendered!', { mySelection, opponentSelection, isHost, receivedCategory, receivedSize });
    const [stage, setStage] = useState<'show-selections' | 'merging' | 'result' | 'done'>('show-selections');
    const [isMerging, setIsMerging] = useState(false);
    const [mergedSize, setMergedSize] = useState<GridSize | null>(null);
    const [mergeProgress, setMergeProgress] = useState(0);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; delay: number }[]>([]);
    const onCompleteCalledRef = useRef(false);

    const isFA = language === 'fa';

    const categoryLabels: Record<Category, { fa: string; en: string; icon: string }> = {
        knowledge: { fa: 'اطلاعات عمومی', en: 'General', icon: '🌍' },
        movies: { fa: 'سینما', en: 'Movies', icon: '🎬' },
        cities: { fa: 'شهرها', en: 'Cities', icon: '🏙️' },
        food: { fa: 'غذا', en: 'Food', icon: '🍕' },
        body: { fa: 'بدن', en: 'Body', icon: '👤' },
        jobs: { fa: 'مشاغل', en: 'Jobs', icon: '💼' },
        tech: { fa: 'تکنولوژی', en: 'Tech', icon: '💻' },
        nature: { fa: 'طبیعت', en: 'Nature', icon: '🌿' },
        shahnameh: { fa: 'شاهنامه', en: 'Shahnameh', icon: '📖' },
        history: { fa: 'تاریخ', en: 'History', icon: '📜' },
        sports: { fa: 'ورزش', en: 'Sports', icon: '⚽' },
        art: { fa: 'هنر', en: 'Art', icon: '🎨' },
        all: { fa: 'همه موضوعات', en: 'Mixed', icon: '🎲' },
        general: { fa: 'عمومی', en: 'General', icon: '📚' }
    };

    const computeMergedSize = (a: GridSize, b: GridSize): GridSize =>
        Math.round(Math.sqrt(a * b)) as GridSize;

    // Generate particles on merge start
    useEffect(() => {
        if (stage === 'merging') {
            const newParticles = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 4 + Math.random() * 8,
                color: ['#B4694B', '#D08A67', '#B07F22', '#E2C079', '#7A5A86'][Math.floor(Math.random() * 5)],
                delay: Math.random() * 1000
            }));
            setParticles(newParticles);
        }
    }, [stage]);

    // Stage 1: Show selections for 2s
    useEffect(() => {
        const t = setTimeout(() => {
            setStage('merging');
            setIsMerging(true);
        }, 2000);
        return () => clearTimeout(t);
    }, []);

    // Merge animation with speed-up effect
    useEffect(() => {
        if (stage === 'merging' && isMerging) {
            let step = 3;
            const interval = setInterval(() => {
                step = Math.min(step + 0.5, 12);
                setMergeProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsMerging(false);
                        const sz = computeMergedSize(mySelection.size, opponentSelection.size);
                        setMergedSize(sz);
                        setStage('result');
                        setTimeout(() => {
                            setStage('done');
                            setTimeout(() => {
                                if (!onCompleteCalledRef.current) {
                                    onCompleteCalledRef.current = true;
                                    onComplete(mySelection.category, sz);
                                }
                            }, 2000);
                        }, 1000);
                        return 100;
                    }
                    return prev + step;
                });
            }, 60);
            return () => clearInterval(interval);
        }
    }, [stage, isMerging, mySelection, opponentSelection, onComplete]);

    // For non-host: receive result from host
    useEffect(() => {
        if (!isHost && receivedSize && !mergedSize) {
            setIsMerging(false);
            setMergedSize(receivedSize);
            setTimeout(() => {
                setStage('result');
                setTimeout(() => {
                    setStage('done');
                    setTimeout(() => {
                        if (!onCompleteCalledRef.current) {
                            onCompleteCalledRef.current = true;
                            if (receivedCategory) onComplete(receivedCategory, receivedSize);
                        }
                    }, 2000);
                }, 1000);
            }, 500);
        }
    }, [receivedSize, isHost, mergedSize, receivedCategory, onComplete]);

    const fa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
    const num = (n: number | string) => (isFA ? fa(n) : String(n));

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-500 overflow-hidden"
            style={{
                backgroundColor: 'var(--paper-2)',
                color: 'var(--ink)',
                backgroundImage:
                    'radial-gradient(circle at 22% 8%, rgba(180,105,75,.20), transparent 58%), radial-gradient(circle at 78% 92%, rgba(176,127,34,.16), transparent 56%)',
            }}
        >
            {/* Warm embers during merge — the palette stays in clay/saffron/plum */}
            {stage === 'merging' && particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full pointer-events-none animate-pulse"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        animationDelay: `${p.delay}ms`,
                        animationDuration: '1.5s',
                        opacity: 0.55
                    }}
                />
            ))}

            <div className="w-full max-w-2xl px-6 py-8 relative z-10" dir={isFA ? 'rtl' : 'ltr'}>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--ink)' }}>
                        {isFA ? '🔀 تلفیق دو انتخاب' : '🔀 Two-Way Merge'}
                    </h2>
                    <p className="font-bold text-sm" style={{ color: 'var(--ink-2)' }}>
                        {isFA
                            ? 'انتخاب هر دو بازیکن در جدول نهایی ترکیب می‌شود'
                            : 'Both players\' choices merge into the final grid'}
                    </p>
                </div>

                {/* Player Selections */}
                {stage === 'show-selections' && (
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="cg-paper p-4" style={{ borderRadius: 16, borderColor: 'rgba(142,78,55,.45)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                    style={{ backgroundColor: 'rgba(180,105,75,.18)', border: '1px solid rgba(142,78,55,.45)' }}
                                >
                                    {mySelection.playerAvatar}
                                </div>
                                <div>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>{mySelection.playerName}</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? '(شما)' : '(You)'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="p-2" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'موضوع:' : 'Topic:'}</p>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                                        {categoryLabels[mySelection.category]?.icon} {isFA ? categoryLabels[mySelection.category]?.fa : categoryLabels[mySelection.category]?.en}
                                    </p>
                                </div>
                                <div className="p-2" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'سایز:' : 'Size:'}</p>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>{num(mySelection.size)}×{num(mySelection.size)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="cg-paper p-4" style={{ borderRadius: 16, borderColor: 'rgba(122,90,134,.45)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                    style={{ backgroundColor: 'rgba(122,90,134,.16)', border: '1px solid rgba(122,90,134,.45)' }}
                                >
                                    {opponentSelection.playerAvatar}
                                </div>
                                <div>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>{opponentSelection.playerName}</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? '(حریف)' : '(Opponent)'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="p-2" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'موضوع:' : 'Topic:'}</p>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                                        {categoryLabels[opponentSelection.category]?.icon} {isFA ? categoryLabels[opponentSelection.category]?.fa : categoryLabels[opponentSelection.category]?.en}
                                    </p>
                                </div>
                                <div className="p-2" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'سایز:' : 'Size:'}</p>
                                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>{num(opponentSelection.size)}×{num(opponentSelection.size)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Merging Animation */}
                {stage === 'merging' && (
                    <div className="mb-8 space-y-6">
                        <div className="cg-paper p-8 text-center relative overflow-hidden" style={{ borderRadius: 20 }}>

                            {/* Category icons converging */}
                            <div className="flex items-center justify-center gap-4 mb-6 relative">
                                <div
                                    className={`text-4xl transition-all duration-500 ${
                                        mergeProgress > 30 ? 'opacity-40 scale-75 translate-x-4' : 'opacity-100 scale-100 translate-x-0'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{categoryLabels[mySelection.category]?.icon}</span>
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? categoryLabels[mySelection.category]?.fa : categoryLabels[mySelection.category]?.en}</span>
                                    </div>
                                </div>

                                <div className={`relative ${mergeProgress > 10 ? 'scale-100' : 'scale-0'} transition-transform duration-500`}>
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'var(--clay-shell)',
                                            border: '1px solid #8E4E37',
                                            boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 10px 18px -12px rgba(70,40,25,.9)',
                                        }}
                                    >
                                        <Merge size={24} style={{ color: '#FFF6EC' }} />
                                    </div>
                                </div>

                                <div
                                    className={`text-4xl transition-all duration-500 ${
                                        mergeProgress > 30 ? 'opacity-40 scale-75 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <span>{categoryLabels[opponentSelection.category]?.icon}</span>
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? categoryLabels[opponentSelection.category]?.fa : categoryLabels[opponentSelection.category]?.en}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full rounded-full h-5 mb-4 overflow-hidden relative" style={{ backgroundColor: 'rgba(36,26,20,.10)', border: '1px solid rgba(36,26,20,.12)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-150 relative"
                                    style={{
                                        width: `${mergeProgress}%`,
                                        background: 'linear-gradient(90deg,#8E4E37,#B07F22,#E2C079)',
                                    }}
                                >
                                    <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg,rgba(255,246,236,.35),transparent)' }} />
                                </div>
                            </div>

                            {/* Counter */}
                            <div className="flex items-center justify-center gap-2">
                                <span
                                    className="font-black tabular-nums text-lg"
                                    style={{
                                        color: 'var(--ink)',
                                        transition: 'all 0.15s ease',
                                        transform: `scale(${1 + (mergeProgress % 10) / 50})`
                                    }}
                                >
                                    {num(Math.round(mergeProgress))}٪
                                </span>
                                <span className="text-sm font-bold" style={{ color: 'var(--ink-3)' }}>
                                    {isFA ? 'تلفیق...' : 'Merging...'}
                                </span>
                            </div>
                        </div>

                        {/* Both sizes converging */}
                        <div className="flex items-center justify-center gap-3">
                            <div
                                className="px-4 py-3 text-center transition-all duration-500"
                                style={{
                                    borderRadius: 12,
                                    backgroundColor: 'var(--paper)',
                                    border: '1px solid var(--paper-well-hair)',
                                    ...(mergeProgress > 50 ? { opacity: .6, transform: 'scale(.95)' } : {}),
                                }}
                            >
                                <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'سایز شما' : 'Your size'}</p>
                                <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>{num(mySelection.size)}×{num(mySelection.size)}</p>
                            </div>
                            <Merge
                                size={20}
                                className={`transition-all duration-500 ${mergeProgress > 50 ? 'rotate-180 scale-125' : 'rotate-0 scale-100'}`}
                                style={{ color: 'var(--clay-ink)' }}
                            />
                            <div
                                className="px-4 py-3 text-center transition-all duration-500"
                                style={{
                                    borderRadius: 12,
                                    backgroundColor: 'var(--paper)',
                                    border: '1px solid var(--paper-well-hair)',
                                    ...(mergeProgress > 50 ? { opacity: .6, transform: 'scale(.95)' } : {}),
                                }}
                            >
                                <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>{isFA ? 'سایز حریف' : 'Opponent size'}</p>
                                <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>{num(opponentSelection.size)}×{num(opponentSelection.size)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result */}
                {stage === 'result' && mergedSize && (
                    <div className="mb-8 space-y-6">
                        {/* Merged size with celebration */}
                        <div
                            className="p-6 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden"
                            style={{
                                borderRadius: 20,
                                background: 'var(--clay-shell)',
                                border: '1px solid #8E4E37',
                                boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 14px 26px -18px rgba(70,40,25,.95)',
                            }}
                        >
                            <div className="relative">
                                <p className="text-sm font-bold mb-2" style={{ color: 'rgba(255,246,236,.85)' }}>
                                    {isFA ? '📏 سایز نهایی (میانگین هندسی)' : '📏 Final Size (Geometric Mean)'}
                                </p>
                                <p className="font-black text-5xl animate-pulse" style={{ color: '#FFF6EC' }}>
                                    {num(mergedSize)}×{num(mergedSize)}
                                </p>
                                <p className="text-xs mt-2 font-bold" style={{ color: 'rgba(255,246,236,.8)' }}>
                                    √({num(mySelection.size)}×{num(opponentSelection.size)}) ≈ {num(mergedSize)}
                                </p>
                            </div>
                        </div>

                        {/* Merged categories */}
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className="p-4 text-center animate-in slide-in-from-left duration-500"
                                style={{
                                    borderRadius: 14,
                                    backgroundColor: 'var(--paper)',
                                    border: '1px solid rgba(142,78,55,.5)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
                                }}
                            >
                                <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>
                                    {isFA ? '🗂️ دسته میزبان (۵۰٪ کلمات)' : '🗂️ Host Category (50% words)'}
                                </p>
                                <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>
                                    {categoryLabels[mySelection.category]?.icon} {isFA ? categoryLabels[mySelection.category]?.fa : categoryLabels[mySelection.category]?.en}
                                </p>
                                <p className="text-xs mt-1 font-bold" style={{ color: 'var(--ink-3)' }}>{mySelection.playerName}</p>
                            </div>
                            <div
                                className="p-4 text-center animate-in slide-in-from-right duration-500"
                                style={{
                                    borderRadius: 14,
                                    backgroundColor: 'var(--paper)',
                                    border: '1px solid rgba(122,90,134,.5)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7)',
                                }}
                            >
                                <p className="text-xs font-bold mb-1" style={{ color: 'var(--ink-3)' }}>
                                    {isFA ? '🗂️ دسته مهمان (۵۰٪ کلمات)' : '🗂️ Guest Category (50% words)'}
                                </p>
                                <p className="font-black text-lg" style={{ color: 'var(--ink)' }}>
                                    {categoryLabels[opponentSelection.category]?.icon} {isFA ? categoryLabels[opponentSelection.category]?.fa : categoryLabels[opponentSelection.category]?.en}
                                </p>
                                <p className="text-xs mt-1 font-bold" style={{ color: 'var(--ink-3)' }}>{opponentSelection.playerName}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Message */}
                {stage === 'done' && (
                    <div className="mt-8 text-center animate-in fade-in duration-500">
                        <div
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full"
                            style={{
                                backgroundColor: 'var(--paper)',
                                border: '1px solid var(--paper-well-hair)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8), 0 8px 16px -12px rgba(70,45,30,.8)',
                            }}
                        >
                            <Zap size={20} className="animate-pulse" style={{ color: 'var(--sand-stamp)' }} />
                            <p className="font-black" style={{ color: 'var(--ink)' }}>
                                {isFA ? 'بازی شروع می‌شود...' : 'Starting game...'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
