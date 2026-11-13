import React, { useState, useEffect, useRef } from 'react';
import { Flame } from 'lucide-react';

interface GameFeedbackProps {
    combo: number;
    gameWon: boolean;
    spawnFloatingEmoji: (e: string) => void;
}

export const GameFeedback: React.FC<GameFeedbackProps> = ({ 
    combo, 
    gameWon, 
    spawnFloatingEmoji 
}) => {
    const [brokenCombo, setBrokenCombo] = useState<number | null>(null);
    const prevComboRef = useRef(combo);
    const gameStartedRef = useRef(false);

    // Track that the game has actually started (guard against initial render artifacts)
    useEffect(() => {
        if (combo > 0 || gameWon) {
            gameStartedRef.current = true;
        }
    }, [combo, gameWon]);

    // Track combo breaking
    useEffect(() => {
        // If combo drops to 0 AND it was high enough before AND we didn't just win
        if (combo === 0 && prevComboRef.current >= 2 && !gameWon) {
            setBrokenCombo(prevComboRef.current);
            // Hide the broken animation after it plays
            const t = setTimeout(() => setBrokenCombo(null), 800);
            return () => clearTimeout(t);
        }
        prevComboRef.current = combo;
    }, [combo, gameWon]);

    const getComboStyles = (count: number) => {
        if (count < 5) return { bg: "from-[#E2C079] to-[#B07F22]", scale: "scale-50 sm:scale-65", text: "text-xs sm:text-lg" };
        if (count < 10) return { bg: "from-[#C97B5A] to-[#A9532F]", scale: "scale-65 sm:scale-80", text: "text-sm sm:text-xl" };
        return { bg: "from-[#8B6A97] to-[#5E4468]", scale: "scale-75 sm:scale-90", text: "text-base sm:text-2xl" };
    };

    const comboStyle = getComboStyles(combo);
    // Use the broken combo value for the broken animation style
    const brokenStyle = brokenCombo ? getComboStyles(brokenCombo) : comboStyle; 
    const multiplier = 1 + (combo * 0.1);
    const brokenMultiplier = 1 + ((brokenCombo || 0) * 0.1);

    // Reusable inner content for the broken pieces
    // Removed w-full h-full to allow intrinsic sizing via spacer
    const BrokenPieceContent = () => (
        <div className={`flex flex-col items-center justify-center px-2 py-0.5 bg-gradient-to-br ${brokenStyle.bg} text-white rounded-xl shadow-lg border border-white/50 transform rotate-3`}>
            <div className="flex items-center gap-1">
                <Flame size={14} fill="#F6D98A" style={{ color: '#F6D98A' }} />
                <span className={`font-black italic ${brokenStyle.text}`}>x{brokenCombo}</span>
            </div>
            <span className="text-[6px] font-black tracking-widest" style={{ color: '#FFF3D6' }}>{brokenMultiplier.toFixed(1)}x</span>
        </div>
    );

    return (
        <>
            {/* ACTIVE COMBO */}
            {gameStartedRef.current && combo >= 2 && !gameWon && (
                <div key={combo} className="absolute top-1 right-1 sm:top-4 sm:right-4 z-50 animate-combo-slam pointer-events-none transform origin-top-right">
                    <div className={`flex flex-col items-center justify-center px-2 py-0.5 bg-gradient-to-br ${comboStyle.bg} text-white rounded-xl shadow-lg border border-white/50 transform rotate-3 ${comboStyle.scale}`}>
                        <div className="flex items-center gap-1">
                            <Flame size={14} fill="#F6D98A" className="animate-pulse" style={{ color: '#F6D98A' }} />
                            <span className={`font-black italic ${comboStyle.text}`}>x{combo}</span>
                        </div>
                        <span className="text-[6px] font-black tracking-widest" style={{ color: '#FFF3D6' }}>{multiplier.toFixed(1)}x</span>
                    </div>
                </div>
            )}

            {/* BROKEN COMBO ANIMATION */}
            {brokenCombo && (
                <div 
                    className="absolute top-4 right-4 z-[51] pointer-events-none origin-top-right"
                    // Match the final state of 'animate-combo-slam' (scale 1.1, rotate -6deg)
                    style={{ transform: 'scale(1.1) rotate(-6deg)' }}
                >
                    <div className={`relative ${brokenStyle.scale}`}>
                        
                        {/* INVISIBLE SPACER */}
                        <div className="opacity-0">
                            <BrokenPieceContent />
                        </div>

                        {/* Left Half (Clipped & Animated) */}
                        <div className="absolute inset-0 animate-break-left" style={{ clipPath: 'polygon(0 0, 55% 0, 45% 100%, 0 100%)' }}>
                            <BrokenPieceContent />
                        </div>
                        
                        {/* Right Half (Clipped & Animated) */}
                        <div className="absolute inset-0 animate-break-right" style={{ clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 45% 100%)' }}>
                            <BrokenPieceContent />
                        </div>
                        
                        {/* Slash Effect on Break */}
                        <div className="absolute top-1/2 left-1/2 animate-slash z-20"></div>
                        
                        {/* Flash Effect on Break */}
                        <div className="absolute inset-0 bg-white rounded-xl animate-ping opacity-50 z-10" style={{ animationDuration: '0.4s' }}></div>
                    </div>
                </div>
            )}

        </>
    );
};