import { useEffect, useRef } from 'react';
import { PlayerState, Category, GridSize, Grid, Clue, DictionaryEntry, Language, GameMode } from '../types';
import { debug } from '../utils/debug';
import { multiplayer } from '../utils/multiplayer';

interface CoinFlipActions {
    setMergedCategories: (v: [Category, Category] | null) => void;
    setFinalCategory: (v: Category | null) => void;
    setFinalSize: (v: GridSize | null) => void;
    setCategory: (c: Category) => void;
    setSize: (s: GridSize) => void;
    setShowMultiplayerRetryModal: (v: boolean) => void;
    resetGame: () => void;
}

interface CoinFlipGameActions {
    grid: any[] | null;
    loadingStage: string;
    setGameWon: (v: boolean) => void;
    setIsTimerActive: (v: boolean) => void;
    generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: DictionaryEntry[], mergedCategories?: [Category, Category]) => Promise<{ grid: Grid; clues: { across: Clue[]; down: Clue[] } } | null>;
}

interface CoinFlipMultiplayerState {
    isHost: boolean;
    isMultiplayer: boolean;
    roomId?: string | null;
    opponent: any;
    myPreference: any;
    opponentPreference: any;
    showCoinFlip: boolean;
    mergeAckReceived: boolean;
    gameMode: GameMode;
    setShowCoinFlip: (v: boolean) => void;
    setCoinFlipDone: () => void;
    setMergeAckReceived: (v: boolean) => void;
    setMyPreference: (v: any) => void;
    setGameStarted: (v: boolean) => void;
    setGameData: (grid: any, clues: any, category: Category, mode: GameMode) => void;
    onCoinFlipResultRef: { current: ((cat: Category, size: GridSize) => void) | null };
    onGameFinishedRef: { current: (() => void) | null };
}

export function useCoinFlip(
    player: PlayerState | null,
    currentGameMode: string,
    category: Category,
    size: GridSize,
    language: Language,
    game: CoinFlipGameActions,
    multiplayerState: CoinFlipMultiplayerState,
    mergedCategories: [Category, Category] | null,
    finalCategory: Category | null,
    finalSize: GridSize | null,
    showMultiplayerRetryModal: boolean,
    challengeRef: React.MutableRefObject<any>,
    actions: CoinFlipActions,
) {
    const hasGeneratedForOpponentRef = useRef(false);
    const multiplayerTimeoutRef = useRef<number | null>(null);
    // Refs for use in handleCoinFlipComplete to avoid stale closures
    const isHostRef = useRef(multiplayerState.isHost);
    const myPreferenceRef = useRef(multiplayerState.myPreference);
    const opponentPreferenceRef = useRef(multiplayerState.opponentPreference);
    const playerIdRef = useRef(player?.id);
    useEffect(() => { isHostRef.current = multiplayerState.isHost; }, [multiplayerState.isHost]);
    useEffect(() => { myPreferenceRef.current = multiplayerState.myPreference; }, [multiplayerState.myPreference]);
    useEffect(() => { opponentPreferenceRef.current = multiplayerState.opponentPreference; }, [multiplayerState.opponentPreference]);
    useEffect(() => { playerIdRef.current = player?.id; }, [player?.id]);

    // --- Send my preference as soon as the room is joined ---
    // Waiting for `opponent` here was the reason a side could sit on "waiting for
    // opponent" for the whole round: if that client never announced, the peer's
    // presence never confirmed and neither preference was ever broadcast. The
    // server now caches broadcasts per room and replays them in presence_sync,
    // so announcing on join is enough for the peer to receive it later.
    useEffect(() => {
        const roomReady = multiplayerState.isMultiplayer && (!!multiplayerState.roomId || !!multiplayerState.opponent);
        if (
            currentGameMode === 'multiplayer' &&
            roomReady &&
            player &&
            !multiplayerState.myPreference
        ) {
            const myPref = {
                playerId: player.id,
                playerName: player.name,
                playerAvatar: player.avatar,
                category: category,
                size: size
            };
            debug.log('App', `Sending preference: cat=${myPref.category} size=${myPref.size} room=${multiplayerState.roomId} opp=${multiplayerState.opponent?.id} myPrefSet=${!!multiplayerState.myPreference}`);
            multiplayerState.setMyPreference(myPref);
            multiplayer.sendPreference(myPref);
        }
    }, [multiplayerState.roomId, multiplayerState.opponent, multiplayerState.isMultiplayer, multiplayerState.myPreference, player, category, size, currentGameMode]);

    // Re-announce my preference until the opponent's arrives. The first send is
    // fire-and-forget and can land while the peer is still subscribing; without
    // this, that one lost frame leaves the merge waiting forever.
    useEffect(() => {
        if (
            currentGameMode !== 'multiplayer' ||
            !multiplayerState.isMultiplayer ||
            !multiplayerState.myPreference ||
            multiplayerState.opponentPreference
        ) {
            return;
        }
        let attempts = 0;
        const timer = window.setInterval(() => {
            attempts += 1;
            if (attempts > 20 || opponentPreferenceRef.current) {
                window.clearInterval(timer);
                return;
            }
            const pref = myPreferenceRef.current;
            if (pref) multiplayer.sendPreference(pref);
        }, 1500);
        return () => window.clearInterval(timer);
    }, [
        currentGameMode,
        multiplayerState.isMultiplayer,
        multiplayerState.myPreference,
        multiplayerState.opponentPreference,
    ]);

    // FALLBACK: if the opponent's preference never arrives (silent/legacy client),
    // proceed with the host's own choice instead of stranding the host. 12s covers
    // several of the preference retries but is far shorter than the old 45s,
    // which left the host staring at "waiting for opponent" for the whole round.
    useEffect(() => {
        const shouldFallback = (
            multiplayerState.isHost &&
            multiplayerState.opponent &&
            multiplayerState.myPreference &&
            !multiplayerState.showCoinFlip &&
            !multiplayerState.opponentPreference &&
            !game.grid
        );
        if (shouldFallback) {
            const t = window.setTimeout(() => {
                debug.log('App', 'FALLBACK (12s): opponent preference never arrived, auto-generating');
                const hostPref = multiplayerState.myPreference!;
                const guestPref = challengeRef.current?.challengeGuestPref?.current;
                const guestCat = (guestPref?.category as Category) || 'all';
                const mergedSize = guestPref
                    ? Math.round(Math.sqrt(hostPref.size * guestPref.size)) as GridSize
                    : hostPref.size as GridSize;
                const mergedCats: [Category, Category] = [hostPref.category, guestCat];

                actions.setFinalCategory(hostPref.category);
                actions.setFinalSize(mergedSize);
                actions.setCategory(hostPref.category);
                actions.setSize(mergedSize);
                actions.setMergedCategories(mergedCats);
                // Tag with the host id so the room's replay cache never echoes
                // this result back to the sender as the opponent's decision.
                multiplayer.sendCoinFlipResult(hostPref.category, mergedSize, player?.id);
                multiplayerState.setShowCoinFlip(false);
                multiplayerState.setCoinFlipDone();
                multiplayerState.setMergeAckReceived(true);
            }, 12000);
            return () => clearTimeout(t);
        }
    }, [multiplayerState.isHost, multiplayerState.opponent, multiplayerState.myPreference, multiplayerState.showCoinFlip, multiplayerState.opponentPreference, game.grid]);

	    const handleCoinFlipComplete = async (selectedCategory: Category, selectedSize: GridSize) => {
        // Use refs to avoid stale closure — these are kept in sync via useEffect
        const isHost = isHostRef.current;
        const myPref = myPreferenceRef.current;
        const oppPref = opponentPreferenceRef.current;
        const pid = playerIdRef.current;

        debug.log('App', `handleCoinFlipComplete: cat=${selectedCategory} size=${selectedSize} isHost=${isHost}`);

        const hostCat = myPref?.category || selectedCategory;
        const guestCat = oppPref?.category || hostCat;
        const mergedCats: [Category, Category] = [hostCat, guestCat];

        actions.setMergedCategories(mergedCats);
        actions.setFinalCategory(hostCat);
        actions.setFinalSize(selectedSize);
        actions.setCategory(hostCat);
        actions.setSize(selectedSize);

        if (isHost) {
            debug.log('App', `Host: sending coin flip result cat=${hostCat} size=${selectedSize}`);
            // Await broadcast so the joiner receives it before we hide the coin flip UI
            try { await multiplayer.sendCoinFlipResult(hostCat, selectedSize, pid); } catch (e) { debug.warn('App', 'sendCoinFlipResult failed:', e); }
        } else {
            debug.log('App', `Joiner: sending merge ack`);
            try { await multiplayer.sendMergeAck(pid || ''); } catch (e) { debug.warn('App', 'sendMergeAck failed:', e); }
        }

        multiplayerState.setShowCoinFlip(false);
        multiplayerState.setCoinFlipDone();
    };

    // Set callback for receiving coin flip result from host (for joiner)
    useEffect(() => {
        multiplayerState.onCoinFlipResultRef.current = async (selectedCategory: Category, selectedSize: GridSize) => {
            debug.log('[App] Received coin flip result from host:', selectedCategory, selectedSize);
            // Send merge_ack immediately to avoid race: host's coin_flip_result arrives
            // before joiner's auto-trigger fires, causing merge_ack to never be sent.
            const pid = playerIdRef.current;
            if (pid) {
                try { await multiplayer.sendMergeAck(pid); } catch (e) { debug.warn('App', 'sendMergeAck in onCoinFlipResultRef failed:', e); }
            }
            actions.setFinalCategory(selectedCategory);
            actions.setFinalSize(selectedSize);
            actions.setCategory(selectedCategory);
            actions.setSize(selectedSize);
            // Also clear showCoinFlip for joiner so coinFlipDone prop becomes true
            // Without this, MergeLobby's isGeneratingStep stays false and stuck-message
            // timer never triggers requestGameData()
            multiplayerState.setShowCoinFlip(false);
            multiplayerState.setCoinFlipDone();
        };
        return () => { multiplayerState.onCoinFlipResultRef.current = null; };
    }, [multiplayerState.onCoinFlipResultRef, actions, multiplayerState.setShowCoinFlip, multiplayerState.setCoinFlipDone]);

    // Show result screen when multiplayer game_over received (for the loser)
    useEffect(() => {
        multiplayerState.onGameFinishedRef.current = () => {
            game.setGameWon(true);
            game.setIsTimerActive(false);
        };
    }, [multiplayerState, game.setGameWon, game.setIsTimerActive]);

    // --- MERGE ACK TIMEOUT: If host doesn't receive ack within 15s, auto-proceed ---
    const mergeAckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        const coinFlipFinished = !multiplayerState.showCoinFlip && finalCategory && finalSize;
        if (
            multiplayerState.isHost &&
            currentGameMode === 'multiplayer' &&
            multiplayerState.opponent &&
            !game.grid &&
            coinFlipFinished &&
            !multiplayerState.mergeAckReceived &&
            !mergeAckTimeoutRef.current
        ) {
            debug.log('App', 'Starting merge_ack timeout (15s)');
            mergeAckTimeoutRef.current = setTimeout(() => {
                debug.log('App', 'MERGE ACK TIMEOUT: proceeding without joiner ack');
                multiplayerState.setMergeAckReceived(true);
                mergeAckTimeoutRef.current = null;
            }, 15000);
        }
        if (multiplayerState.mergeAckReceived && mergeAckTimeoutRef.current) {
            clearTimeout(mergeAckTimeoutRef.current);
            mergeAckTimeoutRef.current = null;
        }
        return () => {
            if (mergeAckTimeoutRef.current) {
                clearTimeout(mergeAckTimeoutRef.current);
                mergeAckTimeoutRef.current = null;
            }
        };
    }, [multiplayerState.isHost, multiplayerState.mergeAckReceived, multiplayerState.opponent,
        multiplayerState.showCoinFlip, game.grid, finalCategory, finalSize, currentGameMode]);

    // --- HOST: Generate grid only AFTER coin flip completes ---
    useEffect(() => {
        let mounted = true;
        let statusInterval: ReturnType<typeof setInterval> | null = null;

        const canGenerate = (
            multiplayerState.isHost &&
            currentGameMode === 'multiplayer' &&
            multiplayerState.opponent &&
            !game.grid &&
            game.loadingStage === 'idle' &&
            !showMultiplayerRetryModal &&
            player &&
            !hasGeneratedForOpponentRef.current &&
            finalCategory && finalSize &&
            multiplayerState.mergeAckReceived
        );
        debug.log('App', `Grid gen effect check: canGenerate=${canGenerate} isHost=${multiplayerState.isHost} mode=${currentGameMode} opp=${!!multiplayerState.opponent} grid=${!!game.grid} load=${game.loadingStage} finalCat=${finalCategory} finalSize=${finalSize} mergeAck=${multiplayerState.mergeAckReceived} genRef=${hasGeneratedForOpponentRef.current}`);
        if (canGenerate) {
            hasGeneratedForOpponentRef.current = true;
            const merged = mergedCategories || undefined;
            // Broadcast generating status immediately — no artificial delay
            multiplayer.sendGeneratingStatus('در حال ساخت جدول...');
            statusInterval = setInterval(() => {
                if (mounted) {
                    multiplayer.sendGeneratingStatus('در حال ساخت جدول... لطفاً منتظر بمانید');
                }
            }, 15000);
            (async () => {
                try {
                    const res = await game.generateGrid(false, finalSize, undefined, undefined, merged);
                    if (statusInterval) { clearInterval(statusInterval); statusInterval = null; }
                    if (res && currentGameMode === 'multiplayer' && multiplayerState.isHost && player) {
                        multiplayerState.setGameStarted(true);
                        const label = merged ? merged[0] : finalCategory;
                        // Store game data for re-send if joiner requests it
                        multiplayerState.setGameData(res.grid, res.clues, label, multiplayerState.gameMode);
                        multiplayer.startGame(res.grid, res.clues, label, multiplayerState.gameMode, {
                            id: player.id, name: player.name, avatar: player.avatar, progress: 0, score: 0, isHost: true
                        });
                    } else if (!res) {
                        hasGeneratedForOpponentRef.current = false;
                        multiplayer.sendGeneratingStatus('ساخت جدول با مشکل مواجه شد. تلاش مجدد...');
                        actions.setShowMultiplayerRetryModal(true);
                    }
                } catch (e) {
                    if (statusInterval) { clearInterval(statusInterval); statusInterval = null; }
                    if (!mounted) return;
                    debug.warn('App', 'Grid generation failed:', e);
                    hasGeneratedForOpponentRef.current = false;
                    actions.setShowMultiplayerRetryModal(true);
                }
            })();
        } else if (!multiplayerState.opponent) {
            // Only reset the generation guard when we're NOT currently generating
            hasGeneratedForOpponentRef.current = false;
        }

        return () => {
            mounted = false;
            if (statusInterval) {
                clearInterval(statusInterval);
                statusInterval = null;
            }
        };
    }, [multiplayerState.opponent, multiplayerState.isHost, multiplayerState.isMultiplayer,
        multiplayerState.mergeAckReceived,
        game.grid, game.loadingStage, showMultiplayerRetryModal, finalCategory, finalSize, mergedCategories,
        currentGameMode, player]);

    return {
        hasGeneratedForOpponentRef,
        handleCoinFlipComplete,
    };
}
