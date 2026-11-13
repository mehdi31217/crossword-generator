import { useState, useRef } from 'react';

export type MatchmakingStatus = 'idle' | 'waiting' | 'matched' | 'timeout';

export function useMatchmaking() {
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingStatus>('idle');
    const matchmakingOpponentRef = useRef<any>(null);
    const matchmakingPollRef = useRef<number | null>(null);
    const matchmakingHandlerRef = useRef<((msg: any) => void) | null>(null);

    return {
        isMatchmaking, setIsMatchmaking,
        matchmakingStatus, setMatchmakingStatus,
        matchmakingOpponentRef,
        matchmakingPollRef,
        matchmakingHandlerRef,
    };
}
