import { PlayerState, MatchRecord, GridSize, Category, StoryBook, Language } from '../types';
import { gameServer } from '../utils/gameServer';
import { multiplayer } from '../utils/multiplayer';
import { getLeagueName } from '../services/league';
import confetti from 'canvas-confetti';

interface WinMultiplayerState {
    isGameOver: () => boolean;
    opponent?: { id?: string; trophies?: number } | null;
    opponentScore: number;
}

interface WinRunState {
    isActive: boolean;
}

interface WinGameRef {
    current: {
        currentChapterIndex?: number;
    } | null;
}

export function useWinHandler(
    setPendingScore: (s: number) => void,
    setLastWinStars: (s: number) => void,
    view: string,
    runState: WinRunState,
    completeFloor: () => void,
    player: PlayerState | null,
    setPlayer: (p: PlayerState | null) => void,
    isDaily: boolean,
    size: GridSize,
    category: Category,
    currentGameMode: string,
    multiplayerState: WinMultiplayerState,
    selectedBook: StoryBook | null,
    matchScoreRef: { current: number },
    gameRef: WinGameRef,
    setTrophyChange?: (v: number) => void,
    showToast?: (msg: string, type?: 'success' | 'error') => void,
    language?: Language,
    onBookMasterScrollUnlocked?: (book: StoryBook) => void,
): (matchScore: number, finalSeconds: number, starCount?: number) => Promise<void> {

    const handleWin = async (matchScore: number, finalSeconds: number, starCount: number = 1) => {
        setPendingScore(matchScore);
        setLastWinStars(starCount);

        // --- TOWER MODE V2 WIN LOGIC ---
        if (view === 'playing' && runState.isActive) {
            completeFloor();
            return;
        }

        // --- NORMAL / STORY MODE WIN ---
        if (player) {
            const record: MatchRecord = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('fa-IR'),
                score: matchScore,
                time: finalSeconds,
                size: isDaily ? 10 : size,
                category: isDaily ? 'all' : category,
                // Explicit, because `all` @ 10x10 is ALSO a casual «میکس» game —
                // the daily cannot be identified from size+category alone.
                isDaily,
            };

            // Multiplayer uses applyMultiplayerResult for trophies (in useGameResultEffects)
            const isMultiplayer = currentGameMode === 'multiplayer';
            let updatedPlayer = await gameServer.saveMatch(player, record, isMultiplayer);

            // --- MULTIPLAYER WIN LOGIC ---
            if (isMultiplayer) {
                if (multiplayerState.isGameOver()) return;
                multiplayer.signalWin(
                    player.id,
                    matchScoreRef.current,
                    finalSeconds,
                    multiplayerState.opponent?.id,
                    multiplayerState.opponentScore
                );
            }

            if (category === 'shahnameh' && gameRef.current?.currentChapterIndex && selectedBook) {
                const bookId = selectedBook.id;
                const chapId = gameRef.current.currentChapterIndex;
                const starKey = `${bookId}_${chapId}`;
                const existingStars = player.epicStars?.[starKey] || 0;
                const newStars = Math.max(existingStars, starCount);
                const newEpicStars = { ...(player.epicStars || {}), [starKey]: newStars };
                const currentBookProgress = player.epicProgress?.[bookId] || 1;
                let nextLevel = currentBookProgress;
                const justFinishedFinalChapter =
                    chapId === selectedBook.chapters.length &&
                    currentBookProgress <= selectedBook.chapters.length;
                if (chapId === currentBookProgress && currentBookProgress < selectedBook.chapters.length + 1) {
                    nextLevel = currentBookProgress + 1;
                }
                // Record earned Story Card Tier (5 stars -> Tier 3, 4 stars -> Tier 2, else Tier 1)
                // and award +1 Polish Seal (مُهر صیقل) on 4+ star mastery!
                try {
                    const eco = gameServer.getLocalEconomyState();
                    const cardKey = `story:${bookId}:${chapId}`;
                    const earnedTier: 1 | 2 | 3 = starCount >= 5 ? 3 : starCount === 4 ? 2 : 1;
                    const curTier = Number(eco.storyCardTiers?.[cardKey] || 1);
                    if (earnedTier > curTier) {
                        gameServer.saveLocalEconomyPatch({
                            storyCardTiers: { ...(eco.storyCardTiers || {}), [cardKey]: earnedTier },
                        });
                    }
                    if (starCount >= 4) {
                        gameServer.grantPolishSeal(1);
                    }
                } catch {}
                const updates: Partial<PlayerState> = {
                    epicStars: newEpicStars,
                    epicProgress: { ...(player.epicProgress || {}), [bookId]: nextLevel }
                };
                const finalState = { ...updatedPlayer, ...updates };
                await gameServer.syncPlayer(finalState);
                setPlayer(finalState);
                if (justFinishedFinalChapter && onBookMasterScrollUnlocked) {
                    onBookMasterScrollUnlocked(selectedBook);
                }
            } else {
                setPlayer(updatedPlayer);
            }

            // --- TROPHY CHANGE + LEAGUE PROMOTION DETECTION (non-multiplayer) ---
            if (!isMultiplayer) {
                const oldTrophies = player.league.trophies;
                const trophyChange = updatedPlayer.league.trophies - oldTrophies;
                if (trophyChange > 0 && setTrophyChange) setTrophyChange(trophyChange);
                // Detect league promotion (league ID changed to a higher tier)
                const oldLeagueId = player.league.league;
                const newLeagueId = updatedPlayer.league.league;
                if (oldLeagueId !== newLeagueId) {
                    const leagueName = getLeagueName(newLeagueId, language || 'fa');
                    // Promotion! Extra celebration + toast
                    showToast?.(
                        language === 'fa'
                            ? `🎉 تبریک! به لیگ ${leagueName} صعود کردید!`
                            : `🎉 Congratulations! You advanced to ${leagueName}!`,
                        'success'
                    );
                    // Extra promotion confetti shower
                    setTimeout(() => {
                        confetti({ particleCount: 300, spread: 160, origin: { y: 0.4 }, colors: ['#ffd700', '#ff6b6b', '#ffa500', '#fff'] });
                        setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#ffd700', '#ffa500'] }), 300);
                    }, 500);
                }
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            } else {
                confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
            }
        }
    };

    return handleWin;
}
