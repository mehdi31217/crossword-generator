import { useEffect, useRef } from 'react';
import { PlayerState } from '../types';
import { multiplayer } from '../utils/multiplayer';

interface SyncGame {
    triggerSmartNavigation?: (g: string[][]) => void;
    setExternalGrid?: (g: any, c: any) => void;
    setGameWon?: (w: boolean) => void;
    setIsTimerActive?: (a: boolean) => void;
    manualLose?: () => void;
    matchScore: number;
    myFilledCells: Set<string>;
    grid: any[][] | null;
    selectedCell: { r: number; c: number } | null;
}

interface SyncMultiplayerState {
    isMultiplayer: boolean;
    joinError?: string | null;
}

interface SyncGameActionsRef {
    current: {
        triggerSmartNavigation?: (g: string[][]) => void;
        setExternalGrid?: (g: any, c: any) => void;
        setGameWon?: (w: boolean) => void;
        setIsTimerActive?: (a: boolean) => void;
        manualLose?: () => void;
    };
}

export function useSyncEffects(
    gameRef: React.MutableRefObject<any>,
    game: SyncGame,
    gameActionsRef: SyncGameActionsRef,
    matchScoreRef: React.MutableRefObject<number>,
    currentGameMode: string,
    player: PlayerState | null,
    multiplayerState: SyncMultiplayerState,
    selectedCellRef: React.MutableRefObject<{ r: number; c: number } | null>,
    challengeRef: React.MutableRefObject<any>,
    challengeState: any,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    returnToMenu: () => Promise<void>,
) {
    // Sync gameRef (for useWinHandler circular dep)
    useEffect(() => {
        gameRef.current = game;
    }, [game]);

    // Sync gameActionsRef (for useMultiplayerState callbacks)
    useEffect(() => {
        gameActionsRef.current = {
            triggerSmartNavigation: game.triggerSmartNavigation,
            setExternalGrid: game.setExternalGrid,
            setGameWon: game.setGameWon,
            setIsTimerActive: game.setIsTimerActive,
            manualLose: game.manualLose,
        };
    }, [game.triggerSmartNavigation, game.setExternalGrid, game.setGameWon, game.setIsTimerActive, game.manualLose]);

    // ─── Multiplayer progress sync (THROTTLED) ────────────────────────────────
    // This effect fires on every `matchScore` change, i.e. once per correct
    // letter. The server drops any message past its per-user budget
    // (server/wsServer.js → checkWsRateLimit), so sending one `progress` per
    // letter used to exhaust the whole allowance and silently kill
    // game-critical broadcasts — most visibly the Eraser's `cell_reset`, which
    // made an erase apply for the attacker but never for the opponent.
    // Leading edge fires immediately; a trailing timer guarantees the newest
    // value still lands, so the opponent's progress bar stays accurate.
    const PROGRESS_MIN_INTERVAL_MS = 400;
    const lastProgressSentRef = useRef(0);
    const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestProgressRef = useRef<{ id: string; progress: number; score: number } | null>(null);

    useEffect(() => {
        matchScoreRef.current = game.matchScore;
        if (currentGameMode !== 'multiplayer' || !player || !game.grid) return;

        const totalCells = game.grid.flat().filter((c: any) => !c.isBlack).length;
        const correctCellsCount = game.myFilledCells.size;
        const progress = totalCells > 0 ? Math.floor((correctCellsCount / totalCells) * 100) : 0;
        latestProgressRef.current = { id: player.id, progress, score: game.matchScore };

        const elapsed = Date.now() - lastProgressSentRef.current;
        if (elapsed >= PROGRESS_MIN_INTERVAL_MS) {
            lastProgressSentRef.current = Date.now();
            multiplayer.sendProgress(player.id, progress, game.matchScore);
            return;
        }

        // Too soon — coalesce everything until the window closes.
        if (progressTimerRef.current) return;
        progressTimerRef.current = setTimeout(() => {
            progressTimerRef.current = null;
            const latest = latestProgressRef.current;
            if (!latest) return;
            lastProgressSentRef.current = Date.now();
            multiplayer.sendProgress(latest.id, latest.progress, latest.score);
        }, PROGRESS_MIN_INTERVAL_MS - elapsed);
    }, [game.matchScore, game.myFilledCells, player, multiplayerState.isMultiplayer, game.grid]);

    // Never leave a pending progress timer behind.
    useEffect(() => () => {
        if (progressTimerRef.current) {
            clearTimeout(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    }, []);

    // Sync selectedCellRef
    useEffect(() => {
        selectedCellRef.current = game.selectedCell;
    }, [game.selectedCell]);

    // Join error handler
    useEffect(() => {
        if (multiplayerState.joinError) {
            showToast(multiplayerState.joinError, 'error');
            returnToMenu();
        }
    }, [multiplayerState.joinError]);

    // Sync challengeRef (for useSocial callback access)
    useEffect(() => {
        challengeRef.current = challengeState;
    }, [challengeState]);
}
