import { useRef, useEffect } from 'react';
import { PlayerState, GameMode, GridSize, Category, Grid, Clue, DictionaryEntry, Language, ViewType } from '../types';
import { debug } from '../utils/debug';
import { multiplayer } from '../utils/multiplayer';
import { gameServer } from '../utils/gameServer';
import { MatchmakingStatus } from './useMatchmaking';

interface MatchmakingActions {
    setView: (v: ViewType) => void;
    setBattleWager: (w: number) => void;
    setCurrentGameMode: (m: GameMode) => void;
    setShowMultiplayerRetryModal: (v: boolean) => void;
    resetGame: () => void;
    setPlayer: (p: PlayerState | null) => void;
}

interface MatchmakingGameActions {
    resetGame: () => void;
    generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: DictionaryEntry[], mergedCategories?: [Category, Category]) => Promise<{ grid: Grid; clues: { across: Clue[]; down: Clue[] } } | null>;
    setUserGrid: (g: string[][]) => void;
    userGridRef: React.MutableRefObject<string[][] | null>;
}

interface MatchmakingMultiplayerState {
    createRoom: (mode: GameMode, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>) => Promise<string | null>;
    createRoomWithId?: (roomId: string, mode: GameMode, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>, matchTypeOverride?: 'matchmaking' | 'arena') => Promise<string | null>;
    joinRoom: (rid: string, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>) => Promise<void>;
    setGameStarted: (v: boolean) => void;
    gameMode: GameMode;
    isHost: boolean;
    setMatchType?: (t: 'matchmaking' | 'direct' | 'arena' | null) => void;
}

interface MatchmakingRefState {
    matchmakingPollRef: React.MutableRefObject<number | null>;
    matchmakingOpponentRef: React.MutableRefObject<any>;
    matchmakingHandlerRef: React.MutableRefObject<((msg: any) => void) | null>;
    setMatchmakingStatus: (s: MatchmakingStatus) => void;
    setIsMatchmaking: (v: boolean) => void;
}

export function useMatchmakingActions(
    player: PlayerState | null,
    language: Language,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    currentGameMode: string,
    category: Category,
    multiplayerState: MatchmakingMultiplayerState,
    game: MatchmakingGameActions,
    refState: MatchmakingRefState,
    actions: MatchmakingActions,
    returnToMenu: () => Promise<void>,
    mergedCategories?: [Category, Category] | null,
    finalSizeArg?: GridSize | null,
) {
    // Keep mutable values in refs so the handler always sees the latest version
    const showToastRef = useRef(showToast);
    const languageRef = useRef(language);
    showToastRef.current = showToast;
    languageRef.current = language;

    // ─── Wager escrow ────────────────────────────────────────
    // A ranked match can carry a coin wager. The coins are held SERVER-side,
    // keyed by roomId, and the amount comes from the room registry — so the
    // client only says "escrow my wager for this room" and mirrors the balance
    // the server reports. A no-op for free (wager = 0) rooms.
    //
    // Returns false only when the player genuinely cannot cover the wager; any
    // other failure (network, unknown room) must not block play — the match is
    // still valid, it simply has no pot behind it.
    const escrowWagerFor = async (roomId: string): Promise<boolean> => {
        const res = await gameServer.escrowBattle(roomId);
        if (res.ok) {
            const coins = res.coins;
            if (player && typeof coins === 'number') {
                actions.setPlayer({ ...player, coins });
            }
            return true;
        }
        if (res.insufficient) {
            showToastRef.current(
                languageRef.current === 'fa'
                    ? 'سکه کافی برای این شرط را ندارید'
                    : 'Not enough coins for this wager',
                'error',
            );
            return false;
        }
        if (res.unauthorized) {
            // The session could not be refreshed. Letting the player enter anyway
            // would start a wagered match in which only the opponent paid.
            showToastRef.current(
                languageRef.current === 'fa'
                    ? 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.'
                    : 'Your session has expired. Please sign in again.',
                'error',
            );
            return false;
        }
        return true;
    };

    // Set up matchmaking handler ref after multiplayerState is available.
    // Re-assigned on EVERY render (no dependency array) so the handler always
    // closes over the latest state/handlers. Previously it was frozen to the
    // first render's closures, which made handleJoinRoom go stale.
    useEffect(() => {
        refState.matchmakingHandlerRef.current = async (rawMsg: any) => {
            if (!rawMsg?.roomId) return;
            const { roomId, isHost, opponent, mode, wager } = rawMsg;
            debug.log('App', 'matchmaking_matched', { roomId, isHost, opponent });
            refState.setMatchmakingStatus('matched');
            refState.matchmakingOpponentRef.current = opponent;
            refState.setIsMatchmaking(false);
            if (refState.matchmakingPollRef.current) {
                clearInterval(refState.matchmakingPollRef.current);
                refState.matchmakingPollRef.current = null;
            }
            (showToastRef.current)(languageRef.current === 'fa' ? 'حریف پیدا شد!' : 'Opponent found!');
            if (isHost) {
                game.resetGame();
                actions.setBattleWager(wager || 0);
                actions.setShowMultiplayerRetryModal(false);
                actions.setCurrentGameMode('multiplayer');
                // Escrow BEFORE entering the room, so a player who cannot cover the
                // wager never ends up in a match they cannot pay for.
                if (!(await escrowWagerFor(roomId))) {
                    actions.setCurrentGameMode('casual');
                    return;
                }
                multiplayerState.createRoomWithId!(roomId, mode, game.setUserGrid, game.userGridRef).then(() => {
                    actions.setView('playing');
                });
            } else {
                await handleJoinRoom(roomId);
            }
        };
    });

    const handleCreateRoom = async (mode: GameMode, wager: number): Promise<string | null> => {
        debug.log('App', `handleCreateRoom: mode=${mode}`);
        game.resetGame();
        actions.setBattleWager(wager);
        actions.setShowMultiplayerRetryModal(false);
        actions.setCurrentGameMode('multiplayer');
        const rid = await multiplayerState.createRoom(mode, game.setUserGrid, game.userGridRef);
        if (!rid) {
            debug.warn('App', 'handleCreateRoom: got null rid');
            return null;
        }
        // Escrow our side of the wager (a no-op when the room carries none).
        if (!(await escrowWagerFor(rid))) {
            actions.setCurrentGameMode('casual');
            return null;
        }
        debug.log('App', `handleCreateRoom: room created rid=${rid}`);
        actions.setView('playing');
        return rid;
    };

    const startMatchmakingPolling = (mode: GameMode, wager: number) => {
        if (refState.matchmakingPollRef.current) clearInterval(refState.matchmakingPollRef.current);
        const poll = async () => {
            if (!player) return;
            const result = await gameServer.checkMatchmakingStatus(player.id);
            if (!result || result.status === 'unknown') {
                if (refState.matchmakingPollRef.current) {
                    clearInterval(refState.matchmakingPollRef.current);
                    refState.matchmakingPollRef.current = null;
                }
                refState.setIsMatchmaking(false);
                refState.setMatchmakingStatus('idle');
                showToast(language === 'fa' ? 'خطا در اتصال به سرور' : 'Connection error', 'error');
                return;
            }
            if (result.status === 'timeout') {
                refState.setMatchmakingStatus('timeout');
                refState.setMatchmakingStatus('idle');
                refState.setIsMatchmaking(false);
                showToast(language === 'fa' ? 'وقت جستجوی حریف تمام شد' : 'Matchmaking timed out', 'error');
                if (refState.matchmakingPollRef.current) {
                    clearInterval(refState.matchmakingPollRef.current);
                    refState.matchmakingPollRef.current = null;
                }
                return;
            }
        };
        refState.matchmakingPollRef.current = window.setInterval(poll, 2000);
    };

    const handleQuickMatch = async (mode: GameMode, wager: number) => {
        if (!player) return;
        debug.log('App', `handleQuickMatch: mode=${mode} wager=${wager}`);
        game.resetGame();
        actions.setBattleWager(wager);
        actions.setCurrentGameMode('multiplayer');
        refState.setMatchmakingStatus('waiting');
        refState.setIsMatchmaking(true);
        refState.matchmakingOpponentRef.current = null;

        const result = await gameServer.joinMatchmaking(
            player.id, player.name, player.avatar,
            mode, wager, player.league.trophies
        );
        if (!result) {
            showToast(language === 'fa' ? 'خطا در جستجوی حریف' : 'Matchmaking error', 'error');
            refState.setMatchmakingStatus('idle');
            refState.setIsMatchmaking(false);
            return;
        }
        if (result.status === 'matched') {
            debug.log('App', 'Quick match found!', result);
            refState.setMatchmakingStatus('matched');
            refState.matchmakingOpponentRef.current = result.opponent;
            refState.setIsMatchmaking(false);

            const { roomId, isHost: isHostFromResponse, opponent, mode: m, wager: w } = result;
            showToast(language === 'fa' ? 'حریف پیدا شد!' : 'Opponent found!');

            if (isHostFromResponse) {
                game.resetGame();
                actions.setBattleWager(w || 0);
                actions.setCurrentGameMode('multiplayer');
                // Escrow before entering the room — same rule as the WS-matched path.
                if (!(await escrowWagerFor(roomId))) {
                    refState.setMatchmakingStatus('idle');
                    actions.setCurrentGameMode('casual');
                    return;
                }
                await multiplayerState.createRoomWithId!(roomId, m, game.setUserGrid, game.userGridRef);
                actions.setView('playing');
            } else {
                await handleJoinRoom(roomId);
            }
            return;
        }
        // status === 'waiting' — first player in queue, poll for match
        debug.log('App', 'Quick match waiting in queue...');
        startMatchmakingPolling(mode, wager);
    };

    const handleMatchmakingCancel = async () => {
        debug.log('App', 'handleMatchmakingCancel');
        if (refState.matchmakingPollRef.current) {
            clearInterval(refState.matchmakingPollRef.current);
            refState.matchmakingPollRef.current = null;
        }
        if (player) {
            await gameServer.leaveMatchmaking(player.id);
        }
        refState.setMatchmakingStatus('idle');
        refState.setIsMatchmaking(false);
        refState.matchmakingOpponentRef.current = null;
        game.resetGame();
        actions.setCurrentGameMode('casual');
        actions.setView('menu');
    };

    const handleMultiplayerRetry = async () => {
        actions.setShowMultiplayerRetryModal(false);
        // Use the original merged categories/size from the coin flip (not host defaults)
        const mc = mergedCategories ?? undefined;
        const fs = finalSizeArg ?? undefined;
        const res = await game.generateGrid(false, fs, undefined, undefined, mc);
        if (res && currentGameMode === 'multiplayer' && multiplayerState.isHost && player) {
            multiplayerState.setGameStarted(true);
            multiplayer.startGame(res.grid, res.clues, category, multiplayerState.gameMode, {
                id: player.id, name: player.name, avatar: player.avatar, progress: 0, score: 0, isHost: true
            });
        } else if (!res) {
            actions.setShowMultiplayerRetryModal(true);
        }
    };

    const handleMultiplayerCancel = async () => {
        actions.setShowMultiplayerRetryModal(false);
        await returnToMenu();
    };

    const handleLeaveWaiting = async () => {
        await returnToMenu();
    };

    const handleJoinRoom = async (rid: string) => {
        debug.log('App', `handleJoinRoom: rid=${rid}`);
        game.resetGame();
        actions.setCurrentGameMode('multiplayer');
        multiplayerState.setMatchType?.('matchmaking'); // Matchmaking game — affects trophies
        // Escrow our side of the wager before joining. This covers every joiner —
        // ranked matchmaking, a room code, or a direct invite — and is a no-op
        // for rooms that carry no wager. The amount is the server's, not ours.
        if (!(await escrowWagerFor(rid))) {
            actions.setCurrentGameMode('casual');
            actions.setView('menu');
            return;
        }
        try {
            await multiplayerState.joinRoom(rid, game.setUserGrid, game.userGridRef);
            debug.log('App', `handleJoinRoom: joinRoom completed rid=${rid}`);
            actions.setView('playing');
        } catch (e: any) {
            debug.error('App', `handleJoinRoom failed:`, e);
            showToast(
                language === 'fa'
                    ? 'اتصال به اتاق ممکن نیست. کد را بررسی کنید.'
                    : 'Cannot join room. Check the code.',
                'error'
            );
            actions.resetGame();
            actions.setCurrentGameMode('casual');
            actions.setView('menu');
        }
    };

    // ─── Arena Handlers ─────────────────────────────────────

    // Track the wager of the pending arena game for refund on cancel
    const currentArenaWagerRef = useRef(0);

    const handleCreateArenaGame = async (mode: GameMode, wager: number): Promise<string | null> => {
        if (!player) return null;
        debug.log('App', `handleCreateArenaGame: mode=${mode} wager=${wager}`);
        game.resetGame();
        actions.setBattleWager(wager);
        actions.setCurrentGameMode('multiplayer');

        const result = await gameServer.createArenaGame(player.id, mode, wager);
        if (result.gameId) {
            // Deduct wager from local player coins
            currentArenaWagerRef.current = wager;
            actions.setPlayer({ ...player, coins: Math.max(0, player.coins - wager) });
            return result.gameId;
        }
        // Show the actual server error, or a generic fallback
        const errMsg = result.error;
        let userMsg: string;
        if (errMsg === 'User not found') {
            userMsg = language === 'fa'
                ? 'لطفاً ابتدا ثبت‌نام کنید'
                : 'Please register first';
        } else if (errMsg === 'Insufficient coins') {
            const balanceMsg = language === 'fa'
                ? `سکه کافی ندارید (${player.coins} سکه دارید)`
                : `Not enough coins (you have ${player.coins})`;
            showToast(balanceMsg, 'error');
            return null;
        } else {
            userMsg = language === 'fa'
                ? `خطا در ساخت بازی: ${errMsg}`
                : `Error creating game: ${errMsg}`;
        }
        showToast(userMsg, 'error');
        return null;
    };

    const handleJoinArenaGame = async (gameId: string): Promise<boolean> => {
        if (!player) return false;
        debug.log('App', `handleJoinArenaGame: gameId=${gameId}`);
        game.resetGame();
        actions.setCurrentGameMode('multiplayer');

        const result = await gameServer.joinArenaGame(gameId, player.id);
        if (!result) {
            showToast(
                language === 'fa'
                    ? 'خطا در پیوستن به بازی. ممکن است بازی حذف شده باشد.'
                    : 'Error joining game. It may have been removed.',
                'error'
            );
            actions.resetGame();
            actions.setCurrentGameMode('casual');
            return false;
        }

        // Deduct wager from local player coins
        actions.setPlayer({ ...player, coins: Math.max(0, player.coins - result.wager) });

        // Set arena match type (no trophy changes)
        multiplayerState.setMatchType?.('arena');
        actions.setBattleWager(result.wager);

        // Join the room as the joiner
        try {
            await multiplayerState.joinRoom(result.roomId, game.setUserGrid, game.userGridRef);
            actions.setView('playing');
            return true;
        } catch (e: any) {
            debug.error('App', `handleJoinArenaGame: joinRoom failed:`, e);
            showToast(
                language === 'fa'
                    ? 'خطا در اتصال به اتاق بازی.'
                    : 'Failed to connect to game room.',
                'error'
            );
            actions.resetGame();
            actions.setCurrentGameMode('casual');
            return false;
        }
    };

    // Handles arena:matched WS event — called from App.tsx when the creator
    // receives notification that someone joined their arena game
    const handleArenaMatched = async (rawMsg: any) => {
        if (!rawMsg?.roomId || !player) return;
        debug.log('App', 'handleArenaMatched', { roomId: rawMsg.roomId, opponent: rawMsg.opponent });
        game.resetGame();
        actions.setBattleWager(rawMsg.wager || 0);
        actions.setCurrentGameMode('multiplayer');
        multiplayerState.setMatchType?.('arena');

        // As host, create the room with the given roomId
        const rid = await multiplayerState.createRoomWithId?.(
            rawMsg.roomId,
            rawMsg.mode,
            game.setUserGrid,
            game.userGridRef,
            'arena'
        );
        if (rid) {
            actions.setView('playing');
        } else {
            showToast(
                language === 'fa'
                    ? 'خطا در ایجاد اتاق بازی.'
                    : 'Failed to create game room.',
                'error'
            );
            actions.resetGame();
            actions.setCurrentGameMode('casual');
        }
    };

    const handleCancelArenaGame = async (gameId: string): Promise<boolean> => {
        if (!player) return false;
        debug.log('App', `handleCancelArenaGame: gameId=${gameId}`);
        const result = await gameServer.cancelArenaGame(gameId, player.id);
        if (result.success) {
            currentArenaWagerRef.current = 0;
            // The refund happens server-side; mirror the balance the server reports.
            // (This used to add the wager locally, with a bogus `+50` fallback that
            // minted coins whenever the wager ref happened to be unset.)
            if (typeof result.coins === 'number') {
                actions.setPlayer({ ...player, coins: result.coins });
            }
            showToast(
                language === 'fa' ? 'بازی لغو شد. سکه بازگردانده شد.' : 'Game cancelled. Coins refunded.',
                'success'
            );
        } else {
            showToast(
                language === 'fa' ? 'خطا در لغو بازی.' : 'Error cancelling game.',
                'error'
            );
        }
        return result.success;
    };

    return {
        handleCreateRoom,
        handleQuickMatch,
        handleMatchmakingCancel,
        handleMultiplayerRetry,
        handleMultiplayerCancel,
        handleLeaveWaiting,
        handleJoinRoom,
        handleCreateArenaGame,
        handleJoinArenaGame,
        handleArenaMatched,
        handleCancelArenaGame,
    };
}
