import React from 'react';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { GameCoin } from '../GameCoin';
import { Language } from '../../types';

interface TowerQuitConfirmModalProps {
    isOpen: boolean;
    language: Language;
    lootAtRisk: number;
    currentFloor: number;
    onConfirmQuit: () => void;
    onCancel: () => void;
}

export const TowerQuitConfirmModal: React.FC<TowerQuitConfirmModalProps> = ({
    isOpen,
    language,
    lootAtRisk,
    currentFloor,
    onConfirmQuit,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ backgroundColor: 'rgba(46,28,18,.72)' }}>
            <div className="relative w-full max-w-md cg-glass p-8 text-center animate-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* Warning Border */}
                <div className="absolute top-0 left-0 w-full h-2 animate-pulse" style={{ backgroundImage: 'linear-gradient(90deg,#9E5A50,#C97B5A,#9E5A50)' }} />
                
                {/* Warning Icon */}
                <div className="relative mb-6">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse"
                        style={{
                            backgroundImage: 'linear-gradient(150deg,#C97B5A,#9E5A50)',
                            boxShadow: 'inset 0 1px 0 rgba(255,226,204,.4), 0 16px 26px -18px rgba(46,28,18,.9)',
                        }}
                    >
                        <AlertTriangle size={48} style={{ color: '#FBF3E6' }} />
                    </div>
                    <div
                        className="absolute -top-2 -right-2 rounded-full p-2"
                        style={{ backgroundColor: 'var(--paper)', border: '1px solid rgba(36,26,20,.14)', boxShadow: '0 6px 12px -8px rgba(46,28,18,.7)' }}
                    >
                        <Home size={20} style={{ color: '#8A4A42' }} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--clay-ink)' }}>
                    {language === 'fa' ? '⚠️ هشدار!' : '⚠️ Warning!'}
                </h2>
                
                <p className="font-bold text-base mb-6 leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                    {language === 'fa' 
                        ? 'آیا مطمئنی می‌خواهی از برج خارج شوی؟' 
                        : 'Are you sure you want to quit the tower?'}
                </p>

                {/* Loss Info */}
                <div className="space-y-3 mb-6">
                    {/* Current Floor */}
                    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--paper-lift)', border: '1px solid rgba(36,26,20,.12)' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundImage: 'var(--clay-shell)', boxShadow: 'inset 0 1px 0 rgba(255,232,214,.4)' }}
                                >
                                    <span className="font-black text-lg">🏰</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
                                        {language === 'fa' ? 'طبقه فعلی' : 'Current Floor'}
                                    </p>
                                    <p className="text-2xl font-black" style={{ color: '#8E4E37' }}>
                                        {currentFloor}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coins at Risk */}
                    <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(158,90,80,.10)', border: '1px solid rgba(158,90,80,.28)' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center p-1.5"
                                    style={{ backgroundImage: 'linear-gradient(180deg,#C97B5A,#9E5A50)', boxShadow: 'inset 0 1px 0 rgba(255,226,204,.35)' }}
                                >
                                    <GameCoin size={26} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold" style={{ color: '#8A4A42' }}>
                                        {language === 'fa' ? 'سکه‌های در خطر' : 'Coins at Risk'}
                                    </p>
                                    <p className="text-2xl font-black" style={{ color: '#8A4A42' }}>
                                        {lootAtRisk} 💰
                                    </p>
                                </div>
                            </div>
                            <div className="text-4xl animate-pulse">⚠️</div>
                        </div>
                    </div>
                </div>

                {/* Warning Message */}
                <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'rgba(158,90,80,.08)', border: '1px solid rgba(158,90,80,.2)' }}>
                    <p className="text-sm font-bold leading-relaxed" style={{ color: '#8A4A42' }}>
                        {language === 'fa' 
                            ? '⚠️ با خروج از برج، تمام سکه‌های این دور از دست می‌روند!' 
                            : '⚠️ All coins from this run will be lost if you quit!'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl font-black text-base active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-cream"
                    >
                        <ArrowLeft size={20} />
                        {language === 'fa' ? 'ادامه بازی' : 'Keep Playing'}
                    </button>
                    <button
                        onClick={onConfirmQuit}
                        className="flex-1 py-4 rounded-2xl font-black text-base active:scale-95 transition-all flex items-center justify-center gap-2 cg-btn-brick"
                    >
                        <Home size={20} />
                        {language === 'fa' ? 'خروج' : 'Quit'}
                    </button>
                </div>
            </div>
        </div>
    );
};
