import { useEffect } from 'react';
import { PlayerState, Language } from '../types';
import { debug } from '../utils/debug';
import { gameServer } from '../utils/gameServer';
import { multiplayer } from '../utils/multiplayer';

interface InitEffectsMultiplayerState {
    isMultiplayer: boolean;
}

export function useInitEffects(
    player: PlayerState | null,
    currentGameMode: string,
    view: string,
    multiplayerState: InitEffectsMultiplayerState,
    setPlayer: (p: PlayerState | null) => void,
    setShowDbSetupModal: (v: boolean) => void,
    setShowStoryModal: (v: boolean) => void,
    gameCurrentChapterIndex: number | undefined,
    gameGrid: any[][] | null,
) {
    // Debug log download via Shift+Ctrl+D
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.shiftKey && e.ctrlKey && e.key === 'D') {
                e.preventDefault();
                debug.downloadLogs();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Theme loading + player init (always force light clay theme)
    useEffect(() => {
        localStorage.setItem('crossword-theme', 'light');
        document.documentElement.classList.remove('dark');

        gameServer.getPlayerState().then(p => {
            if (p && (typeof p.epicProgress === 'number' || !p.epicProgress)) {
                const val = Number(p.epicProgress) || 1;
                p.epicProgress = { 'rostam_7': val };
            }
            if (!p.epicStars) p.epicStars = {};
            if (p) p.theme = 'light';
            setPlayer(p);
        });
        gameServer.checkSchemaHealth().then(healthy => { if (!healthy) setShowDbSetupModal(true); }).catch((e) => { debug.warn('useInitEffects', 'checkSchemaHealth failed (server unreachable):', e); });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Story modal show — now triggered from onPlayEpicChapter before grid loads

    // Beforeunload/pagehide: Notify opponent when user refreshes/closes tab
    useEffect(() => {
        if (currentGameMode !== 'multiplayer' || !player) return;
        const notifyLeave = () => multiplayer.broadcastLeave(player.id);
        window.addEventListener('beforeunload', notifyLeave);
        window.addEventListener('pagehide', notifyLeave);
        return () => {
            window.removeEventListener('beforeunload', notifyLeave);
            window.removeEventListener('pagehide', notifyLeave);
        };
    }, [multiplayerState.isMultiplayer, player?.id]);
}
