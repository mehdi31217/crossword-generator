import React, { useState, useEffect, useRef } from 'react';
import { Merge, Check, Copy, X } from 'lucide-react';
import { Language, GridSize, Category } from '../types';
import { getCategoryNameFa, getCategoryNameEn } from '../utils/categoryNames';
import { multiplayer } from '../utils/multiplayer';
import { debug } from '../utils/debug';

// ─── Types ────────────────────────────────────────────────

export interface PlayerChoice {
    playerId: string;
    playerName: string;
    playerAvatar: string;
    category: Category;
    size: GridSize;
}

export interface MergeLobbyProps {
    language: Language;
    myPreference: PlayerChoice | null;
    opponentPreference: PlayerChoice | null;
    opponent: { id: string; name: string; avatar: string } | null;
    isHost: boolean;
    mergedSize: GridSize | null;
    mergedCategories: [Category, Category] | null;
    finalCategory: Category | null;
    roomId: string | null;
    coinFlipActive: boolean;
    coinFlipDone: boolean;
    gridGenerating: boolean;
    gridReady: boolean;
    generatingStatus?: string | null;
    peerOutdated?: boolean;
    onCancel: () => void;
    onMergeLobbyReady?: () => void;
}

// ─── Step definitions ─────────────────────────────────────

interface StepDef {
    key: string;
    icon: string;
    title: { fa: string; en: string };
    subtitle: { fa: string; en: string };
}

const STEPS: StepDef[] = [
    {
        key: 'connected',
        icon: '🔗',
        title: { fa: 'اتصال به حریف', en: 'Connected to opponent' },
        subtitle: { fa: 'ارتباط برقرار شد', en: 'Connection established' },
    },
    {
        key: 'choices',
        icon: '🎯',
        title: { fa: 'انتخاب بازیکنان', en: 'Players chose' },
        subtitle: { fa: 'دسته‌بندی و سایز مشخص شد', en: 'Category & size selected' },
    },
    {
        key: 'merging_size',
        icon: '📏',
        title: { fa: 'ادغام سایزها', en: 'Merging sizes' },
        subtitle: { fa: 'محاسبه میانگین هندسی', en: 'Calculating geometric mean' },
    },
    {
        key: 'merging_categories',
        icon: '🎭',
        title: { fa: 'ادغام دسته‌بندی', en: 'Merging categories' },
        subtitle: { fa: '۵۰٪ کلمات از هر بازیکن', en: '50% from each player' },
    },
    {
        key: 'generating',
        icon: '⚡',
        title: { fa: 'ساخت جدول نهایی', en: 'Building final grid' },
        subtitle: { fa: 'لطفاً صبر کنید...', en: 'Please wait...' },
    },
];

type StepState = 'pending' | 'active' | 'completed';

const CATEGORY_ICONS: Record<Category, string> = {
    knowledge: '🌍', movies: '🎬', cities: '🏙️', food: '🍕', body: '👤',
    jobs: '💼', tech: '💻', nature: '🌿', shahnameh: '📖', history: '📜',
    sports: '⚽', art: '🎨', all: '🎲', general: '📚',
};

function catLabel(cat: Category, isFA: boolean): string {
    return isFA ? getCategoryNameFa(cat) : getCategoryNameEn(cat);
}

const faDigits = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

// ─── StepCircle ───────────────────────────────────────────

function StepCircle({ state }: { state: StepState }) {
    if (state === 'completed') {
        return (
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center animate-in zoom-in duration-300"
                style={{
                    backgroundColor: '#5E6E52',
                    border: '1px solid #46543C',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 6px 10px -8px rgba(40,50,35,.9)',
                }}
            >
                <Check size={16} className="stroke-[3]" style={{ color: '#F6F1E7' }} />
            </div>
        );
    }
    if (state === 'active') {
        return (
            <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: '#8E4E37', borderTopColor: 'transparent' }}
            />
        );
    }
    return (
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '2px dashed rgba(36,26,20,.22)' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(36,26,20,.22)' }} />
        </div>
    );
}

// ─── StepCard ─────────────────────────────────────────────

function StepCard({
    step,
    state,
    delay,
    isFA,
    children,
}: {
    step: StepDef;
    state: StepState;
    delay: number;
    isFA: boolean;
    children?: React.ReactNode;
}) {
    // Only render once state becomes non-pending, then keep it mounted
    const [visible, setVisible] = useState(state !== 'pending');
    const [animatedIn, setAnimatedIn] = useState(false);

    useEffect(() => {
        if (state !== 'pending' && !visible) {
            setVisible(true);
        }
    }, [state, visible]);

    useEffect(() => {
        if (visible && !animatedIn) {
            const t = setTimeout(() => setAnimatedIn(true), delay);
            return () => clearTimeout(t);
        }
    }, [visible, animatedIn, delay]);

    if (!visible) return null;

    return (
        <div
            className={`transition-all duration-700 ${
                animatedIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-500"
                style={
                    state === 'completed'
                        ? { backgroundColor: 'rgba(94,110,82,.10)', border: '1px solid rgba(94,110,82,.35)', opacity: .8 }
                        : state === 'active'
                        ? {
                            backgroundColor: 'var(--paper)',
                            border: '1px solid rgba(142,78,55,.45)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), 0 10px 18px -16px rgba(70,45,30,.9)',
                        }
                        : { backgroundColor: 'rgba(36,26,20,.04)', border: '1px solid rgba(36,26,20,.12)' }
                }
            >
                <div className="flex-shrink-0 mt-0.5">
                    <StepCircle state={state} />
                </div>
                <div className="flex-1 min-w-0">
                    <p
                        className="font-black text-sm"
                        style={{
                            color: state === 'completed' ? '#5E6E52' : state === 'active' ? 'var(--ink)' : 'var(--ink-3)',
                        }}
                    >
                        {step.icon} {isFA ? step.title.fa : step.title.en}
                    </p>
                    {state !== 'completed' && (
                        <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--ink-3)' }}>
                            {isFA ? step.subtitle.fa : step.subtitle.en}
                        </p>
                    )}
                    {children && <div className="mt-2">{children}</div>}
                </div>
                {state === 'active' && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#8E4E37' }} />
                    </div>
                )}
            </div>
            {/* Connecting line to next step */}
            {state !== 'pending' && (
                <div className="w-0.5 h-4 mx-auto" style={{ backgroundColor: 'rgba(36,26,20,.18)' }} />
            )}
        </div>
    );
}

// ─── PlayerCard ───────────────────────────────────────────

function PlayerCard({
    label,
    playerName,
    playerAvatar,
    category,
    size,
    isHost,
    isOpponent,
    isFA,
}: {
    label: string;
    playerName: string;
    playerAvatar: string;
    category: Category | null;
    size: GridSize | null;
    isHost: boolean;
    isOpponent: boolean;
    isFA: boolean;
}) {
    const senderBadge = isHost
        ? (isFA ? 'میزبان' : 'Host')
        : (isOpponent ? (isFA ? 'مهمان' : 'Guest') : '');
    const accent = isOpponent ? '#7A5A86' : '#8E4E37';
    const avatarBg = isOpponent ? 'rgba(122,90,134,.18)' : 'rgba(180,105,75,.18)';
    const num = (n: number) => (isFA ? faDigits(n) : String(n));

    return (
        <div
            className="cg-paper p-4 transition-all duration-500"
            style={{ borderRadius: 16, borderColor: `${accent}66` }}
        >
            <div className="flex items-center gap-2.5 mb-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: avatarBg, border: `1px solid ${accent}80` }}
                >
                    {playerAvatar}
                </div>
                <div className="min-w-0">
                    <p className="font-black text-sm truncate" style={{ color: 'var(--ink)' }}>{playerName}</p>
                    <p className="text-[10px] font-bold" style={{ color: 'var(--ink-3)' }}>{label}</p>
                </div>
                {senderBadge && (
                    <span
                        className="ms-auto text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
                        style={{ color: 'var(--ink-2)', backgroundColor: 'rgba(36,26,20,.06)', border: '1px solid rgba(36,26,20,.12)' }}
                    >
                        {senderBadge}
                    </span>
                )}
            </div>
            {category && (
                <div className="px-3 py-2 mb-1.5" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--ink-3)' }}>
                        {isFA ? '🗂️ دسته‌بندی' : '🗂️ Category'}
                    </p>
                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                        {CATEGORY_ICONS[category]} {catLabel(category, isFA)}
                    </p>
                </div>
            )}
            {size && (
                <div className="px-3 py-2" style={{ borderRadius: 10, backgroundColor: 'rgba(36,26,20,.05)', border: '1px solid rgba(36,26,20,.10)' }}>
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--ink-3)' }}>
                        {isFA ? '📐 سایز' : '📐 Size'}
                    </p>
                    <p className="font-black text-sm" style={{ color: 'var(--ink)' }}>
                        {num(size)}×{num(size)}
                    </p>
                </div>
            )}
            {!category && !size && (
                <p className="text-xs font-bold italic" style={{ color: 'var(--ink-3)' }}>
                    {isFA ? 'در انتظار انتخاب...' : 'Waiting...'}
                </p>
            )}
        </div>
    );
}

// ─── MergeLobby ───────────────────────────────────────────

export const MergeLobby: React.FC<MergeLobbyProps> = ({
    language,
    myPreference,
    opponentPreference,
    opponent,
    isHost,
    mergedSize,
    mergedCategories,
    finalCategory,
    roomId,
    coinFlipActive,
    coinFlipDone,
    gridGenerating,
    gridReady,
    generatingStatus,
    peerOutdated,
    onCancel,
    onMergeLobbyReady,
}) => {
    const isFA = language === 'fa';
    const num = (n: number | string) => (isFA ? faDigits(n) : String(n));
    const [roomCodeCopied, setRoomCodeCopied] = useState(false);
    const stepStates = useRef<StepState[]>(STEPS.map(() => 'pending'));
    const [, forceUpdate] = useState(0);

    // Track waiting time for step 4 (generating) — prevent joiner from hanging forever
    const [stuckMessage, setStuckMessage] = useState<string | null>(null);
    const waitingSinceRef = useRef<number | null>(null);

    // Detect when step 4 is active (generating or waiting for game data)
    const isGeneratingStep = (gridGenerating || coinFlipDone) && !gridReady;

    useEffect(() => {
        if (isGeneratingStep && !waitingSinceRef.current) {
            waitingSinceRef.current = Date.now();
            setStuckMessage(null);
        } else if (!isGeneratingStep) {
            waitingSinceRef.current = null;
            setStuckMessage(null);
        }
    });

    // Show "still waiting" messages at increasing time thresholds
    // For joiner: periodically request game data resend if not received after 15s
    const lastRequestRef = useRef(0);
    const requestCountRef = useRef(0);
    useEffect(() => {
        if (!waitingSinceRef.current) return;
        const check = () => {
            const elapsed = Date.now() - waitingSinceRef.current!;
            if (elapsed > 60000) {
                setStuckMessage(isFA
                    ? 'اتصال به حریف قطع شده است. لطفاً دوباره تلاش کنید.'
                    : 'Connection to opponent lost. Please try again.');
            } else if (elapsed > 30000) {
                setStuckMessage(isFA
                    ? 'ساخت جدول بیش از حد معمول طول کشیده است...'
                    : 'Grid generation is taking longer than usual...');
            }
            // Joiner: request game data resend every 10s starting at 15s
            if (!isHost && elapsed > 15000) {
                const timeSinceLastRequest = Date.now() - lastRequestRef.current;
                if (timeSinceLastRequest > 10000 || lastRequestRef.current === 0) {
                    lastRequestRef.current = Date.now();
                    requestCountRef.current++;
                    debug.log('MergeLobby', `Requesting game data from host (attempt #${requestCountRef.current}, elapsed=${Math.round(elapsed/1000)}s)`);
                    multiplayer.requestGameData();
                }
            }
        };
        check();
        if (!isGeneratingStep) {
            lastRequestRef.current = 0;
            requestCountRef.current = 0;
        }
        const interval = setInterval(check, 5000);
        return () => clearInterval(interval);
    }, [isFA, isGeneratingStep]);

    // Dismiss MergeLobby with a delay after grid is ready — sync transition for both players
    const gridWasReadyRef = useRef(false);
    const onMergeLobbyReadyRef = useRef(onMergeLobbyReady);
    onMergeLobbyReadyRef.current = onMergeLobbyReady;
    useEffect(() => {
        if (gridReady && !gridWasReadyRef.current) {
            gridWasReadyRef.current = true;
            // Show "Grid ready!" briefly, THEN dismiss so both players see it together.
            //
            // This used to hold for 2000 ms. The game clock and mana start at
            // `setExternalGrid` (before this overlay even unmounts), so every one of
            // those milliseconds was time the player could not see or play — a silent
            // ~2 s handicap. A short beat still lands the "Grid ready!" checkmark
            // without costing real match time.
            const t = setTimeout(() => {
                if (onMergeLobbyReadyRef.current) onMergeLobbyReadyRef.current();
            }, 400);
            return () => clearTimeout(t);
        }
        if (!gridReady) {
            gridWasReadyRef.current = false;
        }
    }, [gridReady]); // only depend on gridReady — onMergeLobbyReady via ref to avoid timer reset on re-render

    const determineSteps = (): StepState[] => {
        const states: StepState[] = STEPS.map(() => 'pending');

        // Step 0: Connected
        if (opponent) states[0] = 'completed';

        // Step 1: Choices received
        if (myPreference && opponentPreference) states[1] = 'completed';

        // Step 2: Merging sizes — active when coinFlipActive, completed when mergedSize known
        if (mergedSize || coinFlipDone) states[2] = 'completed';
        else if (coinFlipActive) states[2] = 'active';

        // Step 3: Merging categories — active when mergedSize done, completed when mergedCategories/finalCategory known
        if (mergedCategories || coinFlipDone) states[3] = 'completed';
        else if (states[2] === 'completed' && !mergedCategories && coinFlipActive) states[3] = 'active';

        // Step 4: Generating grid
        if (gridReady) states[4] = 'completed';
        else if (gridGenerating || coinFlipDone) states[4] = 'active';
        else if (states[3] === 'completed') states[4] = 'active';

        // If coinFlip is active but sizes not yet merged, mark step 2 as active
        if (states[2] === 'pending' && coinFlipActive) states[2] = 'active';

        return states;
    };

    // Re-render when props change
    const prev = useRef<string>('');
    useEffect(() => {
        const key = `${!!opponent}:${!!myPreference}:${!!opponentPreference}:${coinFlipActive}:${coinFlipDone}:${!!mergedSize}:${gridGenerating}:${gridReady}`;
        if (key !== prev.current) {
            prev.current = key;
            forceUpdate(n => n + 1);
        }
    }, [opponent, myPreference, opponentPreference, coinFlipActive, coinFlipDone, mergedSize, gridGenerating, gridReady]);

    const states = determineSteps();
    stepStates.current = states;

    return (
        <div
            className="cg-merge-overlay fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto"
            style={{
                backgroundColor: 'var(--paper-2)',
                color: 'var(--ink)',
                backgroundImage:
                    'radial-gradient(circle at 18% 6%, rgba(180,105,75,.18), transparent 58%), radial-gradient(circle at 84% 94%, rgba(176,127,34,.14), transparent 56%)',
            }}
        >
            <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-10" dir={isFA ? 'rtl' : 'ltr'}>
                {/* ─── Header ─────────────────────────────────── */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black" style={{ color: 'var(--ink)' }}>
                        {isFA ? '🔀 تلفیق دو بازیکن' : '🔀 Two-Way Merge'}
                    </h1>
                    <p className="text-sm font-bold mt-1" style={{ color: 'var(--ink-2)' }}>
                        {isFA ? 'در حال آماده‌سازی بازی چندنفره...' : 'Preparing multiplayer game...'}
                    </p>
                    {roomId && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
                                {isFA ? 'کد اتاق:' : 'Room:'}
                            </span>
                            <span className="font-mono font-black text-base tracking-widest" style={{ color: 'var(--clay-ink)' }}>
                                {roomId}
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(roomId).catch(() => {});
                                    setRoomCodeCopied(true);
                                    setTimeout(() => setRoomCodeCopied(false), 2000);
                                }}
                                className="p-1 rounded-lg transition-all active:scale-90"
                                style={{ backgroundColor: 'rgba(36,26,20,.06)', border: '1px solid rgba(36,26,20,.14)' }}
                            >
                                {roomCodeCopied
                                    ? <Check size={14} style={{ color: '#5E6E52' }} />
                                    : <Copy size={14} style={{ color: 'var(--ink-2)' }} />
                                }
                            </button>
                        </div>
                    )}
                </div>

                {/* ─── Player Cards ──────────────────────────── */}
                {peerOutdated && (
                    <div
                        className="mb-4 p-3 text-center animate-in fade-in duration-300"
                        style={{ borderRadius: 12, backgroundColor: 'rgba(158,90,80,.10)', border: '1px solid rgba(158,90,80,.45)' }}
                    >
                        <p className="text-xs font-black leading-5" style={{ color: 'var(--clay-ink)' }}>
                            {isFA
                                ? '⚠️ نسخهٔ بازی حریف قدیمی است و مراحل ساخت اتاق را دریافت نمی‌کند. از او بخواهید صفحه را نوسازی (Refresh) کند.'
                                : '⚠️ Opponent is running an outdated build and receives no room updates. Ask them to refresh the page.'}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <PlayerCard
                        label={isFA ? 'شما' : 'You'}
                        playerName={myPreference?.playerName || '—'}
                        playerAvatar={myPreference?.playerAvatar || '👤'}
                        category={myPreference?.category ?? null}
                        size={myPreference?.size ?? null}
                        isHost={isHost}
                        isOpponent={false}
                        isFA={isFA}
                    />
                    <PlayerCard
                        label={opponent?.name || (isFA ? 'حریف' : 'Opponent')}
                        playerName={opponentPreference?.playerName || opponent?.name || '—'}
                        playerAvatar={opponentPreference?.playerAvatar || opponent?.avatar || '👤'}
                        category={opponentPreference?.category ?? null}
                        size={opponentPreference?.size ?? null}
                        isHost={false}
                        isOpponent={true}
                        isFA={isFA}
                    />
                </div>

                {/* ─── Timeline ───────────────────────────────── */}
                <div className="space-y-0">
                    {STEPS.map((step, i) => (
                        <StepCard key={step.key} step={step} state={states[i]} delay={200 + i * 150} isFA={isFA}>
                            {/* Extra details for specific steps */}
                            {step.key === 'merging_size' && states[i] === 'completed' && mergedSize && myPreference && opponentPreference && (
                                <div className="flex items-center gap-2 mt-2 text-xs font-bold">
                                    <span style={{ color: 'var(--ink-3)' }}>{num(myPreference.size)}×{num(myPreference.size)}</span>
                                    <Merge size={12} style={{ color: 'var(--clay-ink)' }} />
                                    <span style={{ color: 'var(--ink-3)' }}>{num(opponentPreference.size)}×{num(opponentPreference.size)}</span>
                                    <span className="mx-1" style={{ color: 'var(--ink-3)' }}>→</span>
                                    <span className="text-sm" style={{ color: '#5E6E52' }}>{num(mergedSize)}×{num(mergedSize)}</span>
                                </div>
                            )}
                            {step.key === 'merging_categories' && states[i] === 'completed' && mergedCategories && (
                                <div className="flex items-center gap-2 mt-2 text-xs">
                                    <span className="font-bold" style={{ color: 'var(--clay-ink)' }}>
                                        {CATEGORY_ICONS[mergedCategories[0]]} {catLabel(mergedCategories[0], isFA)}
                                    </span>
                                    <span style={{ color: 'var(--ink-3)' }}>+</span>
                                    <span className="font-bold" style={{ color: '#7A5A86' }}>
                                        {CATEGORY_ICONS[mergedCategories[1]]} {catLabel(mergedCategories[1], isFA)}
                                    </span>
                                </div>
                            )}
                            {step.key === 'merging_categories' && states[i] === 'completed' && !mergedCategories && finalCategory && (
                                <div className="mt-2 text-xs font-bold" style={{ color: '#5E6E52' }}>
                                    {CATEGORY_ICONS[finalCategory]} {catLabel(finalCategory, isFA)}
                                </div>
                            )}
                            {step.key === 'generating' && states[i] === 'active' && generatingStatus && (
                                <div className="mt-2 text-xs font-bold" style={{ color: 'var(--ink-2)' }}>
                                    {generatingStatus}
                                </div>
                            )}
                            {step.key === 'generating' && states[i] === 'completed' && (
                                <div className="mt-2 text-xs font-bold flex items-center gap-1" style={{ color: '#5E6E52' }}>
                                    <Check size={10} className="stroke-[3]" />
                                    {isFA ? 'جدول آماده است!' : 'Grid ready!'}
                                </div>
                            )}
                        </StepCard>
                    ))}
                </div>

                {/* ─── Stuck message (joiner waiting too long) ── */}
                {stuckMessage && (
                    <div
                        className="mt-4 p-3 rounded-xl text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ backgroundColor: 'rgba(176,127,34,.12)', border: '1px solid rgba(176,127,34,.38)' }}
                    >
                        <p className="text-xs font-bold mb-2" style={{ color: '#9E7418' }}>{stuckMessage}</p>
                        <button
                            onClick={() => {
                                waitingSinceRef.current = null;
                                setStuckMessage(null);
                                window.location.reload();
                            }}
                            className="px-4 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95"
                            style={{
                                backgroundColor: 'var(--paper)',
                                color: '#9E7418',
                                border: '1px solid rgba(176,127,34,.45)',
                                boxShadow: '0 3px 8px -4px rgba(70,40,25,.55)',
                            }}
                        >
                            {isFA ? '🔄 تلاش مجدد' : '🔄 Retry'}
                        </button>
                    </div>
                )}

                {/* ─── Cancel button ─────────────────────────── */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95"
                        style={{
                            backgroundColor: 'var(--paper)',
                            color: 'var(--ink-2)',
                            border: '1px solid rgba(142,78,55,.32)',
                            boxShadow: '0 6px 14px -10px rgba(70,40,25,.8)',
                        }}
                    >
                        <X size={14} className="inline mr-1.5" />
                        {isFA ? 'لغو بازی' : 'Cancel Game'}
                    </button>
                </div>
            </div>
        </div>
    );
};
