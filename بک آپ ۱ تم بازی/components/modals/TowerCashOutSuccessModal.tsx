import React from 'react';
import { Trophy, TrendingUp, Star, Sparkles, ArrowRight } from 'lucide-react';
import { GameCoin } from '../GameCoin';
import { Language } from '../../types';

interface TowerCashOutSuccessModalProps {
    isOpen: boolean;
    language: Language;
    coinsEarned: number;
    floorsCleared: number;
    onContinue: () => void;
}

const statSheet: React.CSSProperties = {
    backgroundColor: 'var(--paper)',
    backgroundImage: 'var(--tex-paper)',
    backgroundSize: '200px 200px',
    border: '1px solid rgba(36,26,20,.16)',
    boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 14px 24px -20px rgba(70,45,30,.8)'
};

export const TowerCashOutSuccessModal: React.FC<TowerCashOutSuccessModalProps> = ({
    isOpen,
    language,
    coinsEarned,
    floorsCleared,
    onContinue
}) => {
    if (!isOpen) return null;

    // Dynamic messages based on performance
    const getPerformanceLevel = () => {
        if (floorsCleared >= 10) return 'legendary';
        if (floorsCleared >= 7) return 'epic';
        if (floorsCleared >= 5) return 'great';
        if (floorsCleared >= 3) return 'good';
        return 'start';
    };

    const performanceLevel = getPerformanceLevel();

    const messages = {
        fa: {
            legendary: {
                title: 'افسانه‌ای!',
                subtitle: 'تو یک قهرمان واقعی هستی!',
                encouragement: 'رکورد تو باورنکردنی است! آیا جرئت داری رکورد خودت را بشکنی؟'
            },
            epic: {
                title: 'حماسی!',
                subtitle: 'عملکرد فوق‌العاده‌ای داشتی!',
                encouragement: 'تو در حال تبدیل شدن به یک استاد هستی! به این سرعت ادامه بده!'
            },
            great: {
                title: 'عالی!',
                subtitle: 'کار خوبی انجام دادی!',
                encouragement: 'داری پیشرفت می‌کنی! بار بعدی می‌تونی بیشتر از این بری!'
            },
            good: {
                title: 'خوب بود!',
                subtitle: 'شروع خوبی داشتی!',
                encouragement: 'با تمرین بیشتر، می‌تونی به طبقات بالاتر برسی!'
            },
            start: {
                title: 'شروع کردی!',
                subtitle: 'هر سفری از یک قدم شروع میشه!',
                encouragement: 'نترس! هر بار که تلاش کنی، بهتر میشی. دوباره امتحان کن!'
            }
        },
        en: {
            legendary: {
                title: 'LEGENDARY!',
                subtitle: 'You are a true champion!',
                encouragement: 'Your record is unbelievable! Do you dare to break it?'
            },
            epic: {
                title: 'EPIC!',
                subtitle: 'Outstanding performance!',
                encouragement: 'You\'re becoming a master! Keep up this pace!'
            },
            great: {
                title: 'GREAT!',
                subtitle: 'Well done!',
                encouragement: 'You\'re making progress! Next time you can go even higher!'
            },
            good: {
                title: 'GOOD!',
                subtitle: 'Nice start!',
                encouragement: 'With more practice, you can reach higher floors!'
            },
            start: {
                title: 'You Started!',
                subtitle: 'Every journey begins with one step!',
                encouragement: 'Don\'t worry! Every try makes you better. Try again!'
            }
        }
    };

    const currentMessage = messages[language][performanceLevel];

    const tier = {
        legendary: { tint: '#7A5A86', wash: 'rgba(122,90,134,.11)', border: 'rgba(122,90,134,.34)' },
        epic: { tint: '#4E6B72', wash: 'rgba(78,107,114,.11)', border: 'rgba(78,107,114,.32)' },
        great: { tint: '#4C5A42', wash: 'rgba(94,110,82,.12)', border: 'rgba(94,110,82,.32)' },
        good: { tint: '#8A6415', wash: 'rgba(176,127,34,.11)', border: 'rgba(176,127,34,.30)' },
        start: { tint: '#6B5A4D', wash: 'rgba(36,26,20,.05)', border: 'rgba(36,26,20,.14)' }
    }[performanceLevel];

    const tierLabel =
        performanceLevel === 'legendary' ? (language === 'fa' ? 'افسانه‌ای!' : 'LEGENDARY!') :
        performanceLevel === 'epic' ? (language === 'fa' ? 'حماسی!' : 'EPIC!') :
        performanceLevel === 'great' ? (language === 'fa' ? 'عالی!' : 'GREAT!') :
        performanceLevel === 'good' ? (language === 'fa' ? 'خوب!' : 'GOOD!') :
        (language === 'fa' ? 'شروع خوب!' : 'Good Start!');

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
            style={{ backgroundColor: 'rgba(46,28,18,.72)', backdropFilter: 'blur(10px)' }}
        >
            <div className="cg-glass cg-rise relative w-full max-w-md rounded-[2.5rem] p-8 text-center overflow-hidden">

                {/* top rule */}
                <div
                    className="absolute top-0 left-0 w-full h-1.5"
                    style={{ backgroundImage: 'linear-gradient(90deg,#B07F22,#E2C079,#B07F22)' }}
                />

                {/* Success Icon */}
                <div className="relative mb-6">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-bounce"
                        style={{
                            backgroundImage: 'linear-gradient(150deg,#D9B15C,#B07F22)',
                            border: '1px solid rgba(106,74,16,.4)',
                            boxShadow: '0 1px 0 rgba(255,240,205,.5) inset, 0 18px 28px -18px rgba(106,74,16,.9)'
                        }}
                    >
                        <Trophy size={44} style={{ color: '#3E2C0B' }} />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 animate-pulse" style={{ color: '#C9A26A' }} size={22} />
                    <Sparkles className="absolute -bottom-2 -left-2 animate-pulse" style={{ color: '#B07F22' }} size={18} />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black mb-2" style={{ color: '#8A6415' }}>
                    {currentMessage.title}
                </h2>

                <p className="font-bold text-sm mb-6" style={{ color: 'var(--ink-2)' }}>
                    {currentMessage.subtitle}
                </p>

                {/* Stats Cards */}
                <div className="space-y-3 mb-6">
                    {/* Coins Earned */}
                    <div className="rounded-2xl p-4" style={statSheet}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5"
                                    style={{
                                        backgroundImage: 'linear-gradient(150deg,#D9B15C,#B07F22)',
                                        border: '1px solid rgba(106,74,16,.35)'
                                    }}
                                >
                                    <GameCoin size={26} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
                                        {language === 'fa' ? 'سکه‌های دریافتی' : 'Coins Earned'}
                                    </p>
                                    <p className="text-2xl font-black tabular-nums" style={{ color: '#8A6415' }}>
                                        +{coinsEarned}
                                    </p>
                                </div>
                            </div>
                            <div className="text-3xl">💰</div>
                        </div>
                    </div>

                    {/* Floors Cleared */}
                    <div className="rounded-2xl p-4" style={statSheet}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'rgba(78,107,114,.14)',
                                        border: '1px solid rgba(78,107,114,.30)',
                                        color: '#3F5A60'
                                    }}
                                >
                                    <TrendingUp size={22} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
                                        {language === 'fa' ? 'طبقات گذرانده شده' : 'Floors Cleared'}
                                    </p>
                                    <p className="text-2xl font-black tabular-nums" style={{ color: '#3F5A60' }}>
                                        {floorsCleared}
                                    </p>
                                </div>
                            </div>
                            <div className="text-3xl">🏆</div>
                        </div>
                    </div>
                </div>

                {/* Encouragement Message */}
                <div
                    className="rounded-2xl p-4 mb-6"
                    style={{ backgroundColor: tier.wash, border: `1px solid ${tier.border}` }}
                >
                    <div className="flex items-center gap-2 justify-center mb-2">
                        <Star size={18} style={{ color: tier.tint }} />
                        <p className="text-sm font-black" style={{ color: tier.tint }}>
                            {tierLabel}
                        </p>
                        <Star size={18} style={{ color: tier.tint }} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                        {currentMessage.encouragement}
                    </p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="cg-btn-clay w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {language === 'fa' ? 'بازگشت به لابی' : 'Back to Lobby'}
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
