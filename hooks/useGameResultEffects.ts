import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PlayerState, Language } from '../types';
import { gameServer } from '../utils/gameServer';
import { getLeagueName } from '../services/league';
import { computeActiveDeckBuffs } from '../utils/progression';

interface MultiplayerState {
    finalResult: { status?: string };
    opponent?: { id?: string; trophies?: number } | null;
    roomId?: string | null;
    matchType?: 'matchmaking' | 'direct' | 'arena' | null;
}

interface GameState {
    gameWon: boolean;
}

export function useGameResultEffects(
    game: GameState,
    currentGameMode: string,
    multiplayerState: MultiplayerState,
    player: PlayerState | null,
    setPlayer: (p: PlayerState | null) => void,
    setTrophyChange: (v: number) => void,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    language: Language,
    battleWager: number = 0,
    // A duel replay also flips `gameWon`, but its verdict comes from the server
    // comparison — a loss must not fire the solo victory shower.
    isDuelReplay: boolean = false,
) {
    // Always-current player snapshot. The effect below only re-runs when
    // finalResult.status changes, so reading `player` from the closure can be
    // stale (e.g. missing the wager deduction) — read the ref instead.
    const playerRef = useRef(player);
    useEffect(() => { playerRef.current = player; }, [player]);
    // Credit the arena pot at most once per room (StrictMode runs effects twice
    // in dev, and a re-render must never double-credit).
    const arenaCreditedRef = useRef<string | null>(null);

    // Handle arena result submission + league trophy changes
    useEffect(() => {
        if (!multiplayerState.finalResult.status || !player || currentGameMode !== 'multiplayer') return;

        const isArena = multiplayerState.matchType === 'arena';

        // Arena: submit result to server so pot is awarded, then update local coins
        if (isArena && multiplayerState.roomId) {
            const won = multiplayerState.finalResult.status === 'win';
            const lost = multiplayerState.finalResult.status === 'lose';
            const roomId = multiplayerState.roomId;
            if (arenaCreditedRef.current === roomId) return; // already settled this room
            arenaCreditedRef.current = roomId;
            const submitAndUpdate = async () => {
                let pot: number | null = null;
                if (won) {
                    pot = await gameServer.submitArenaResult(roomId, player.id);
                } else if (lost && multiplayerState.opponent?.id) {
                    pot = await gameServer.submitArenaResult(roomId, multiplayerState.opponent.id);
                }
                // Base the credit on the LATEST coins, never the closure snapshot.
                const current = playerRef.current || player;
                // If we won the pot, add it to our coins (loser's wager was already deducted on join)
                if (pot !== null && pot > 0 && won) {
                    const updated = { ...current, coins: Math.max(0, current.coins + pot) };
                    gameServer.savePlayer(updated);
                    setPlayer(updated);
                } else if (pot !== null && pot > 0 && lost) {
                    // Loser: wager already deducted on join, no extra change
                    // Ensure coins don't go negative (guard against stale state)
                    if (current.coins < 0) {
                        const updated = { ...current, coins: 0 };
                        gameServer.savePlayer(updated);
                        setPlayer(updated);
                    }
                }
            };
            submitAndUpdate();
            // Draw: no result submission (refund handled server-side)
            return; // Arena: no trophy changes
        }

        // League settlement ONLY for matchmaking (random opponent), NOT friend games
        const isMatchmaking = multiplayerState.matchType === 'matchmaking';
        if (!isMatchmaking) return;
        if (multiplayerState.finalResult.status && player && currentGameMode === 'multiplayer') {
            const oldLeagueId = player.league.league;
            const won = multiplayerState.finalResult.status === 'win';
            const oppTrophies = multiplayerState.opponent?.trophies ?? player.league.trophies;
            // Local score/streak bookkeeping only — trophies, shield/boost and the
            // win reward are settled SERVER-side (see below).
            const { state: updated } = gameServer.applyMultiplayerResult(player, won, oppTrophies);
            setPlayer(updated);

            // The server decides win/loss from the recorded `game_over` claim and
            // applies the trophy delta, consumes any shield/boost, and pays the +20.
            // The client just adopts the result — it can no longer compute its own
            // rating (that is why profiles.trophies was always 0 before).
            const roomId = multiplayerState.roomId;
            if (roomId) {
                gameServer.submitLeagueResult(roomId).then((res) => {
                    const current = playerRef.current || updated;
                    const next: PlayerState = { ...current };
                    const deckBuffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
                    const trophyBonusMult = 1 + (deckBuffs.onlineTrophyBonusPct || 0) / 100;
                    const boostedTrophyChange = res.trophyChange > 0
                        ? Math.round(res.trophyChange * trophyBonusMult)
                        : res.trophyChange;
                    const extraTrophies = Math.max(0, boostedTrophyChange - res.trophyChange);

                    if (res.coins !== null) next.coins = res.coins;
                    if (res.league) {
                        next.league = {
                            ...current.league,
                            ...res.league,
                            trophies: (res.league.trophies || 0) + extraTrophies,
                        } as PlayerState['league'];
                    }
                    if (res.items) next.items = res.items;
                    gameServer.savePlayer(next);
                    setPlayer(next);

                    setTrophyChange(boostedTrophyChange);
                    if (res.shieldUsed) showToast(language === 'fa' ? '🛡️ سپر تروفی مصرف شد!' : '🛡️ Trophy shield used!');
                    if (res.boostUsed) showToast(language === 'fa' ? '⚡ تقویت تروفی فعال شد!' : '⚡ Trophy boost active!');

                    // Detect league promotion (server-computed tier)
                    const newLeagueId = next.league.league;
                    if (oldLeagueId !== newLeagueId && newLeagueId) {
                        const leagueName = getLeagueName(newLeagueId, language);
                        confetti({
                            particleCount: 300, spread: 160, origin: { y: 0.4 },
                            colors: ['#ffd700', '#ff6b6b', '#ffa500', '#fff']
                        });
                        setTimeout(() => confetti({
                            particleCount: 200, spread: 120, origin: { y: 0.5 },
                            colors: ['#ffd700', '#ffa500']
                        }), 300);
                        showToast(
                            language === 'fa'
                                ? `🎉 تبریک! به لیگ ${leagueName} رسیدید!`
                                : `🎉 Congratulations! You reached ${leagueName}!`,
                            'success'
                        );
                    }

                    // Wagered ranked match: the pot is settled server-side from the
                    // same `game_over` arbitration record that decided the league
                    // result. The server owns the payout (and the void/refund), so
                    // the client only mirrors the balance it reports.
                    if (battleWager > 0) {
                        gameServer.settleBattle(roomId).then((battle) => {
                            if (!battle.ok) return;
                            const after = playerRef.current || next;
                            const settled: PlayerState = { ...after };
                            if (battle.coins !== null) settled.coins = battle.coins;
                            gameServer.savePlayer(settled);
                            setPlayer(settled);
                            if (battle.won && battle.pot > 0) {
                                showToast(
                                    language === 'fa' ? `🏆 بردی! ${battle.pot} سکه` : `🏆 You won ${battle.pot} coins!`,
                                    'success'
                                );
                            } else if (battle.voided && battle.wager > 0) {
                                showToast(
                                    language === 'fa' ? 'این مسابقه باطل شد و شرط برگشت.' : 'Match voided — your wager was refunded.'
                                );
                            }
                        });
                    }
                }).catch(() => { /* keep local state on failure */ });
            }
        }
    }, [multiplayerState.finalResult.status]);

    // Victory confetti for single-player / story mode win
    useEffect(() => {
        if (game.gameWon && !isDuelReplay && currentGameMode !== 'multiplayer' && currentGameMode !== 'tower') {
            confetti({
                particleCount: 180,
                spread: 120,
                origin: { y: 0.5 },
                colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fff', '#8b5cf6']
            });
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    spread: 80,
                    angle: 60,
                    origin: { x: 0.2, y: 0.4 },
                    colors: ['#ec4899', '#f472b6', '#f9a8d4']
                });
            }, 400);
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    spread: 80,
                    angle: 120,
                    origin: { x: 0.8, y: 0.4 },
                    colors: ['#06b6d4', '#22d3ee', '#67e8f9']
                });
            }, 700);
        }
    }, [game.gameWon, currentGameMode]);

    // Victory confetti for multiplayer winner
    useEffect(() => {
        if (multiplayerState.finalResult.status === 'win') {
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.4 },
                colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fff']
            });
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 60,
                    angle: 60,
                    origin: { x: 0, y: 0.5 },
                    colors: ['#8b5cf6', '#a78bfa', '#c084fc']
                });
            }, 300);
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 60,
                    angle: 120,
                    origin: { x: 1, y: 0.5 },
                    colors: ['#ec4899', '#f472b6', '#f9a8d4']
                });
            }, 600);
        }
    }, [multiplayerState.finalResult.status]);
}
