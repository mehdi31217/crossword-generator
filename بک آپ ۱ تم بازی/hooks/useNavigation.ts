import { useRef, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import { PlayerState, GridSize, Category, Grid, Clue, DictionaryEntry, StoryBook, Language, ViewType, GameMode } from '../types';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { debug } from '../utils/debug';
import { gameServer } from '../utils/gameServer';
import { multiplayer } from '../utils/multiplayer';
import { track } from '../utils/analytics';

interface NavActions {
    setView: (v: ViewType) => void;
    setCurrentGameMode: (m: GameMode) => void;
    setSize: (s: GridSize) => void;
    setCategory: (c: Category) => void;
    setIsDaily: (d: boolean) => void;
    setPlayer: Dispatch<SetStateAction<PlayerState | null>>;
    setMergedCategories: (v: [Category, Category] | null) => void;
    setFinalCategory: (v: Category | null) => void;
    setFinalSize: (v: GridSize | null) => void;
    setShowLeaveConfirm: (v: boolean) => void;
    setShowTowerQuitConfirm: (v: boolean) => void;
    setPendingChapter: (id: number | null) => void;
    setShowStoryModal: (v: boolean) => void;
    setSelectedBook: (v: StoryBook | null) => void;
}

interface NavGame {
    resetGame: () => void;
    generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: DictionaryEntry[]) => Promise<{ grid: Grid; clues: { across: Clue[]; down: Clue[] } } | null>;
    handleKeyPress: (key: string, frozen: boolean) => { wasMistake?: boolean; isWordComplete?: boolean; activeClue?: Clue | null; completedClues?: Clue[] } | null;
    handleBackspace: (frozen: boolean) => boolean;
    handleNavigateClue: (dir: number) => void;
    toggleDirection: () => void;
    canToggleDirection: boolean;
    grid: Grid | null;
    gameWon: boolean;
    gameLost: boolean;
    loadingStage: string;
}

interface NavMultiplayerState {
    roomId: string | null;
    leaveRoom: () => Promise<void>;
    forfeitGame: () => Promise<boolean>;
    createRoom: (mode: GameMode, setUserGrid: Dispatch<SetStateAction<string[][]>>, userGridRef: MutableRefObject<string[][]>) => Promise<string | null>;
    joinRoom: (rid: string, setUserGrid: Dispatch<SetStateAction<string[][]>>, userGridRef: MutableRefObject<string[][]>) => Promise<void>;
    setGameStarted: (v: boolean) => void;
    isHost: boolean;
    gameMode: GameMode;
    isFrozen: boolean;
    waitingForHost: boolean;
    finalResult: { status?: string | null };
}

interface NavChallengeRef {
    current: {
        pendingChallengeNotifId?: { current: string | null };
        pendingChallengeFriendId?: { current: string | null };
        challengeGuestPref?: { current: { size: GridSize; category: Category } | null };
    } | null;
}

export function useNavigation(
    player: PlayerState | null,
    language: Language,
    currentGameMode: string,
    category: Category,
    size: GridSize,
    view: string,
    game: NavGame,
    multiplayerState: NavMultiplayerState,
    runState: { isActive: boolean },
    selectedBook: StoryBook | null,
    battleWager: number,
    mergedCategories: [Category, Category] | null,
    finalCategory: Category | null,
    finalSize: GridSize | null,
    hasGeneratedForOpponentRef: MutableRefObject<boolean>,
    challengeRef: NavChallengeRef,
    handleMistake: () => void,
    towerSetShowQuitConfirm: (v: boolean) => void,
    actions: NavActions,
    showToast: (msg: string, type?: 'success' | 'error') => void,
) {
    const refundDoneRef = useRef(false);
    const returnToMenu = async () => {
        if (currentGameMode === 'multiplayer') {
            const notifId = challengeRef.current?.pendingChallengeNotifId?.current;
            const friendId = challengeRef.current?.pendingChallengeFriendId?.current;
            if (friendId && player && notifId) {
                await gameServer.cancelChallenge(notifId, friendId, player.id);
                if (challengeRef.current) {
                    challengeRef.current.pendingChallengeNotifId.current = null;
                    challengeRef.current.pendingChallengeFriendId.current = null;
                }
            }

            // MID-GAME FORFEIT: If game is active and not over, show defeat screen
            // instead of silently navigating to menu. The result screen's "منو" button
            // will call returnToMenu() again to clean up.
            debug.log('NAV', 'returnToMenu view=' + view + ' won=' + game.gameWon + ' lost=' + game.gameLost);
            if (view === 'playing' && game.grid && !game.gameWon && !game.gameLost && !multiplayerState.waitingForHost) {
                debug.log('NAV', 'FORFEIT PATH');
                const didForfeit = await multiplayerState.forfeitGame();
                if (didForfeit) {
                    // forfeitGame actually ran — result screen will show, return for user to see it
                    debug.log('NAV', 'Forfeit executed, deferring cleanup to next call');
                    return;
                }
                // Game was already decided (race with handleGameOverEvent) — fall through to cleanup
                debug.log('NAV', 'Forfeit skipped (game already over), falling through to cleanup');
            }
            debug.log('NAV', 'CLEANUP PATH');

            await multiplayerState.leaveRoom();
            // The wager sits in SERVER-side escrow, so the refund has to come from
            // the server too. This used to add `battleWager` to the local balance
            // unconditionally — anyone who left a wagered match minted coins
            // without ever having paid them. The server also refuses to refund a
            // match that already has a `game_over` record (that one settles via
            // /battle/result instead, so leaving cannot dodge a loss).
            const roomId = multiplayerState.roomId;
            if (battleWager > 0 && player && roomId && !multiplayerState.finalResult.status && !refundDoneRef.current) {
                refundDoneRef.current = true;
                const refund = await gameServer.cancelBattle(roomId);
                const refundedCoins = refund.coins;
                if (refund.ok && typeof refundedCoins === 'number') {
                    actions.setPlayer(prev => prev ? ({ ...prev, coins: refundedCoins }) : null);
                }
            }
        }
        actions.setView('menu');
        game.resetGame();
        actions.setCurrentGameMode('casual');
        actions.setMergedCategories(null);
        actions.setFinalCategory(null);
        actions.setFinalSize(null);
        actions.setSelectedBook(null);
        hasGeneratedForOpponentRef.current = false;
        if (challengeRef.current) challengeRef.current.challengeGuestPref.current = null;
    };

    const handleHomeClick = async () => {
        if (currentGameMode === 'multiplayer' && view === 'playing' && !game.gameWon && !game.gameLost && !multiplayerState.waitingForHost && game.grid) {
            actions.setShowLeaveConfirm(true);
        } else if (currentGameMode === 'tower' && runState.isActive && view === 'playing') {
            towerSetShowQuitConfirm(true);
        } else {
            await returnToMenu();
        }
    };

    const onGenerateClick = async (dailyMode: boolean = false, chapterOverride?: number) => {
        actions.setIsDaily(dailyMode);
        actions.setCurrentGameMode('casual');

        let storyWords: DictionaryEntry[] | undefined = undefined;
        if (chapterOverride && category === 'shahnameh' && selectedBook) {
            storyWords = selectedBook.chapters.find(c => String(c.id) === String(chapterOverride))?.words;
            if (!storyWords || storyWords.length === 0) {
                const allBundled = [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS];
                const bundled = allBundled.find(b => b.id === selectedBook.id);
                storyWords = bundled?.chapters.find(c => String(c.id) === String(chapterOverride))?.words;
            }
            if (currentGameMode === 'multiplayer') {
                await multiplayerState.leaveRoom();
            }
        }
        const res = await game.generateGrid(dailyMode, undefined, chapterOverride, storyWords);

        // The daily is once a day, and the day is consumed HERE — after the grid
        // generated, so a generation failure does not burn it. The lock used to be
        // written only when the run was WON (`saveMatch` ← `useWinHandler`), so
        // starting the daily, quitting, and starting again was an unlimited retry
        // loop while the card promised «فقط یک تلاش».
        if (res && dailyMode && player) {
            const claim = await gameServer.claimDaily(player);
            if (claim.alreadyPlayed) {
                actions.setIsDaily(false);
                showToast(language === 'fa' ? 'امروز انجامش دادی! فردا دوباره بیا' : 'Already played today! Come back tomorrow', 'error');
                return;
            }
            // Lock the card now — the player is about to leave the menu, so there is
            // no later render that would pick the new date up.
            if (claim.player) actions.setPlayer(claim.player);
        }

        if (res && currentGameMode === 'multiplayer' && multiplayerState.isHost && player) {
            multiplayerState.setGameStarted(true);
            multiplayer.startGame(res.grid, res.clues, category, multiplayerState.gameMode, {
                id: player.id, name: player.name, avatar: player.avatar, progress: 0, score: 0, isHost: true
            });
        }
        if (res) {
            actions.setView('playing');
            track('game_start', {
                mode: dailyMode ? 'daily' : currentGameMode === 'multiplayer' ? 'multiplayer' : 'quick',
                category,
                size,
            });
        } else {
            showToast(language === 'fa' ? 'خطا در ساخت جدول. دوباره تلاش کنید.' : 'Failed to generate grid. Try again.', 'error');
        }
    };

    const onPlayEpicChapter = async (chapterId: number) => {
        actions.setCategory('shahnameh');
        actions.setSize(7);
        actions.setIsDaily(false);
        actions.setCurrentGameMode('story');
        actions.setPendingChapter(chapterId);

        let storyWords: DictionaryEntry[] | undefined = undefined;
        if (selectedBook) {
            const chapterData = selectedBook.chapters.find(c => String(c.id) === String(chapterId));
            storyWords = chapterData?.words;
        }
        if (!storyWords || storyWords.length === 0) {
            const allBundled = [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS];
            const bundled = allBundled.find(b => b.id === selectedBook?.id);
            const bundledCh = bundled?.chapters.find(c => String(c.id) === String(chapterId));
            storyWords = bundledCh?.words;
        }

        actions.setShowStoryModal(true);
        actions.setView('playing');

        // Generate grid immediately so it is completely ready when user starts
        void game.generateGrid(false, 7, Number(chapterId), storyWords);
    };

    const handleInput = (key: string) => {
        const frozen = currentGameMode === 'multiplayer' ? multiplayerState.isFrozen : false;
        const result = game.handleKeyPress(key, frozen);

        if (result && currentGameMode === 'tower' && runState.isActive && result.wasMistake) {
            handleMistake();
        }

        if (result && currentGameMode === 'multiplayer' && player && game.grid) {
            // Only whole solved words cross the wire. `handleKeyPress` reports every
            // clue this keystroke completed — across and down, including words that
            // became complete again after an Eraser — so delivery never depends on
            // which clue happened to be active when the last letter landed.
            const completed = result.completedClues ?? [];
            debug.log('INPUT', 'key=' + key + ' completedClues=' + completed.length);
            completed.forEach(clue => {
                const cells = clue.cells.map(cell => ({
                    r: cell.r, c: cell.c, val: game.grid![cell.r][cell.c].value
                }));
                debug.log('INPUT', 'SEND word_solved clue #' + clue.number + clue.direction + ' cells=' + JSON.stringify(cells));
                multiplayer.sendWordSolved(player.id, cells);
            });
        }
    };

    return {
        returnToMenu,
        handleHomeClick,
        onGenerateClick,
        onPlayEpicChapter,
        handleInput,
    };
}
