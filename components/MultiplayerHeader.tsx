
import React, { useEffect, useState } from 'react';
import { PlayerState, MultiPlayerInfo } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

const AnimatedScore: React.FC<{ value: number, className?: string, color?: string }> = ({ value, className, color }) => {
    const [pop, setPop] = useState(false);
    useEffect(() => {
        setPop(true);
        const t = setTimeout(() => setPop(false), 300);
        return () => clearTimeout(t);
    }, [value]);
    return <span className={`${className} transition-transform duration-300 ${pop ? 'scale-150' : 'scale-100'} inline-block`} style={{ color }}>{value}</span>;
};

interface MultiplayerHeaderProps {
    player: PlayerState;
    localScore: number;
    opponent: MultiPlayerInfo | null;
    opponentScore: number;
}

const chip: React.CSSProperties = {
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--paper-well-hair)',
};

export const MultiplayerHeader: React.FC<MultiplayerHeaderProps> = ({ 
    player, 
    localScore, 
    opponent, 
    opponentScore 
}) => {
    const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
    const familyIcons = deckBuffs.cards.map(c =>
        c.family === 'football' ? '⚽' : c.family === 'epic' ? '🛡️' : c.family === 'history' ? '👑' : '🔮'
    );

    return (
        <div
            className="w-full h-12 shrink-0 flex justify-center items-center px-4 z-40"
            style={{ ...chip, borderWidth: '0 0 1px 0', borderColor: 'rgba(120,80,52,.22)' }}
        >
            <div className="w-full max-w-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <AvatarRenderer avatar={player.avatar} size={28} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[6px] font-black tracking-widest uppercase" style={{ color: '#5E6E52' }}>YOU</span>
                        <AnimatedScore value={localScore} className="text-xs font-black tabular-nums" color="#4C5A42" />
                    </div>
                    {familyIcons.length > 0 && (
                        <span
                            className="px-1.5 py-0.5 rounded-md text-[9px] font-black flex items-center gap-0.5"
                            style={{
                                background: 'linear-gradient(180deg,#F7E3B4,#E5B552)',
                                color: '#5A3808',
                                border: '1px solid rgba(176,127,34,.45)',
                            }}
                            title="کارت‌های خشتی فعال شما در نبرد آنلاین"
                        >
                            {familyIcons.join('')}
                            {deckBuffs.hasSynergy && <span className="text-[8px]">✨</span>}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-tighter italic" style={{ color: 'var(--ink-3)' }}>VS</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[6px] font-black tracking-widest uppercase" style={{ color: '#9E5A50' }}>{opponent ? opponent.name.slice(0,8) : 'OPP'}</span>
                        <AnimatedScore value={opponentScore} className="text-xs font-black tabular-nums" color="#9E5A50" />
                    </div>
                    <AvatarRenderer avatar={opponent ? opponent.avatar : 'celeb_cyrus'} size={28} />
                </div>
            </div>
        </div>
    );
};
