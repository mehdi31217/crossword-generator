
import { useState, useRef, useEffect } from 'react';
import { MultiPlayerInfo, GameMode, AttackType, Grid, Clue, Category, PlayerState, GridSize } from '../types';
import { multiplayer, isPeerOutdated } from '../utils/multiplayer';
import { debug } from '../utils/debug';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

export type GameResult = {
    status: 'win' | 'lose' | 'draw' | null;
    myScore: number;
    opScore: number;
    myTime?: number;
    opTime?: number;
    reason?: 'normal' | 'forfeit'; // Added reason
};

export const useMultiplayerState = (
    player: PlayerState | null, 
    selectedCellRef: React.MutableRefObject<{r: number, c: number} | null>,
    matchScoreRef: React.MutableRefObject<number>,
    onCollision: (newGrid: string[][]) => void,
    onGameStart: (g: Grid, c: { across: Clue[], down: Clue[] }, cat: Category, mode: GameMode) => void,
    onWin: () => void
) => {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [opponent, setOpponent] = useState<MultiPlayerInfo | null>(null);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [isMultiplayer, setIsMultiplayer] = useState(false);
    const [waitingForHost, setWaitingForHost] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>('speed');
    const [opponentFilled, setOpponentFilled] = useState<Set<string>>(new Set());
    const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string}[]>([]);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [finalResult, setFinalResult] = useState<GameResult>({ status: null, myScore: 0, opScore: 0, reason: 'normal' });
    const [matchType, setMatchType] = useState<'matchmaking' | 'direct' | 'arena' | null>(null);

    // Refs to avoid stale closures in WebSocket callbacks
    const opponentScoreRef = useRef(opponentScore);
    
    const [gameStarted, setGameStartedState] = useState(false);
    const setGameStarted = (v: boolean) => {
        gameStartedRef.current = v;
        setGameStartedState(v);
    };
    
    // Attacks
    const [mana, setMana] = useState(0);
    const [isFrozen, setIsFrozen] = useState(false);
    const [isBlinded, setIsBlinded] = useState(false);

    // NEW: Coin flip preference states
    const [myPreference, setMyPreference] = useState<any>(null);
    const [opponentPreference, setOpponentPreference] = useState<any>(null);
    const [showCoinFlip, setShowCoinFlip] = useState(false);

    // Merge acknowledgment state (joiner → host)
    const [mergeAckReceived, setMergeAckReceived] = useState(false);

    // Generating status (host → joiner, shows progress during grid generation)
    const [generatingStatus, setGeneratingStatus] = useState<string | null>(null);

    // The opponent's browser is running a pre-handshake bundle (no `proto` on
    // its join). The room can never converge in that state — the old client
    // broadcasts nothing, so this side would wait forever.
    const [peerOutdated, setPeerOutdated] = useState(false);

    // Auto-trigger coin flip when both preferences are set AND multiplayer is active (with delay)
    useEffect(() => {
        debug.log(`[useMP] showCoinFlip effect: myPref=${!!myPreference} oppPref=${!!opponentPreference} showCoinFlip=${showCoinFlip} isMulti=${isMultiplayer} roomId=${roomId} done=${coinFlipDoneRef.current}`);
        if (myPreference && opponentPreference && !showCoinFlip && isMultiplayer && roomId && !coinFlipDoneRef.current) {
            debug.log('[useMP] Both preferences set, scheduling coin flip in 2s');
            const t = setTimeout(() => setShowCoinFlip(true), 2000);
            return () => clearTimeout(t);
        }
    }, [myPreference, opponentPreference, isMultiplayer, roomId, showCoinFlip]);

    // While alone in a room, actively poll for the room's state. A single lost
    // presence frame used to strand one player on "اتصال به حریف" forever while
    // the other already had the grid.
    useEffect(() => {
        if (!isMultiplayer || !roomId || opponent) return;
        const sync = () => multiplayer.requestSync();
        sync();
        const timer = window.setInterval(sync, 2500);
        return () => window.clearInterval(timer);
    }, [isMultiplayer, roomId, opponent]);

    // A peer that predates the current protocol cannot broadcast preferences or
    // merge acks, so this room is dead on arrival. Give the player a moment to
    // read the banner, then leave through the normal joinError path (which
    // refunds the escrowed wager) instead of hanging on "در انتظار حریف".
    useEffect(() => {
        if (!peerOutdated || gameStarted) return;
        const timer = window.setTimeout(() => {
            setJoinError('نسخهٔ بازی حریف قدیمی است. از او بخواهید صفحه را نوسازی (Refresh) کند.');
        }, 8000);
        return () => window.clearTimeout(timer);
    }, [peerOutdated, gameStarted]);

    const coinFlipDoneRef = useRef(false);
    const opponentDetectedRef = useRef(false); // Guard against double onPlayerJoin
    // The server replays cached preferences on every presence sync; ignore
    // re-deliveries so the merge UI doesn't churn (and timers don't reset).
    const lastOpponentPrefSigRef = useRef<string | null>(null);
    const emojiIdCounter = useRef(0);
    const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hostWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
    const gameStartedRef = useRef(false);
    const gameOverRef = useRef(false); // Tracks if game_over was already received
    const gameSessionRef = useRef(0); // Incremented each createRoom/joinRoom — filters stale events
    const participantLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Grace timer for pre-game presence:leave
    const eraseShieldRemainingRef = useRef(0); // 1x auto-shield against incoming Erase from Epic Tier 3+ loadout

    const addTimeout = (fn: () => void, delay: number): ReturnType<typeof setTimeout> => {
        const id = setTimeout(() => {
            timeoutIdsRef.current.delete(id);
            fn();
        }, delay);
        timeoutIdsRef.current.add(id);
        return id;
    };

    const clearAllTimeouts = () => {
        for (const id of timeoutIdsRef.current) clearTimeout(id);
        timeoutIdsRef.current.clear();
        if (joinTimeoutRef.current) { clearTimeout(joinTimeoutRef.current); joinTimeoutRef.current = null; }
        if (hostWaitTimeoutRef.current) { clearTimeout(hostWaitTimeoutRef.current); hostWaitTimeoutRef.current = null; }
        if (participantLeaveTimerRef.current) { clearTimeout(participantLeaveTimerRef.current); participantLeaveTimerRef.current = null; }
    };

    // Refs to avoid stale closures
    const onCollisionRef = useRef(onCollision);
    const onGameStartRef = useRef(onGameStart);
    const onWinRef = useRef(onWin);
    const playerRef = useRef(player);
    const gameModeRef = useRef(gameMode); // NEW: Track game mode
    const myPreferenceRef = useRef(myPreference); // NEW: Track myPreference
    const onCoinFlipResultRef = useRef<((cat: Category, sz: GridSize) => void) | null>(null); // NEW: For coin flip result callback
    const onGameFinishedRef = useRef<(() => void) | null>(null); // For triggering result screen on game_over
    const gameDataRef = useRef<{grid: any; clues: any; category: Category; mode: GameMode} | null>(null); // Stored game data for re-send on request
    // Callback fired on EVERY word_solved — allows App.tsx to check if the
    // opponent's solved word affects the user's activeClue and navigate away.
    // Receives just the cell coords; the handler reads committed state from its closure.
    const onOpponentWordSolvedRef = useRef<((cells: { r: number, c: number, val: string }[]) => void) | null>(null);

    // Store game data so host can re-broadcast on request_game_data
    const setGameData = (grid: any, clues: any, category: Category, mode: GameMode) => {
        gameDataRef.current = { grid, clues, category, mode };
    };

    useEffect(() => { onCollisionRef.current = onCollision; }, [onCollision]);
    useEffect(() => { onGameStartRef.current = onGameStart; }, [onGameStart]);
    useEffect(() => { onWinRef.current = onWin; }, [onWin]);
    useEffect(() => { playerRef.current = player; }, [player]);
    useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]); // NEW: Sync game mode
    useEffect(() => { myPreferenceRef.current = myPreference; }, [myPreference]); // NEW: Sync myPreference
    useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);
    useEffect(() => { opponentScoreRef.current = opponentScore; }, [opponentScore]);

    const applyOpponentPreference = (pref: any) => {
        if (!pref) return;
        const sig = JSON.stringify(pref);
        if (lastOpponentPrefSigRef.current === sig) return;
        lastOpponentPrefSigRef.current = sig;
        setOpponentPreference(pref);
    };

    const handleAttackReceived = (type: AttackType, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>) => {
        const buffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
        const resistFactor = Math.max(0.4, 1 - (buffs.onlineDebuffResistPct || 0) / 100);
        if (type === 'freeze') {
            spawnFloatingEmoji(buffs.onlineDebuffResistPct > 0 ? '❄️🛡️' : '❄️');
            setIsFrozen(true);
            addTimeout(() => setIsFrozen(false), Math.round(5000 * resistFactor));
        }
        else if (type === 'blind') {
            spawnFloatingEmoji(buffs.onlineDebuffResistPct > 0 ? '👁️‍🗨️🛡️' : '👁️‍🗨️');
            setIsBlinded(true);
            addTimeout(() => setIsBlinded(false), Math.round(8000 * resistFactor));
        }
        else if (type === 'erase') {
           // Logic handled via cell_reset
        }
    };

    const handleWordSolved = (cells: { r: number, c: number, val: string }[], setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>) => {
        debug.log('WS', 'handleWordSolved cells=', JSON.stringify(cells));

        // Decide the write set against the committed board BEFORE dispatching.
        //
        // `setOpponentFilled` belongs to this hook, which App declares BEFORE
        // `useGameLogic`. When both updates render in the same pass the marker
        // updater therefore runs FIRST — so reading a Set that the `setUserGrid`
        // updater was supposed to populate gives an empty Set. That is why an
        // incoming word only sometimes turned red (and only sometimes became an
        // Eraser target): it depended on React evaluating the grid updater eagerly.
        const snapshot = userGridRef.current || [];
        const writtenByOpponent = new Set<string>();
        let collision = false;
        const collisionGrid = snapshot.map(row => [...row]);

        cells.forEach(cell => {
            const prevVal = snapshot[cell.r]?.[cell.c];
            if (prevVal === '') {
                writtenByOpponent.add(`${cell.r},${cell.c}`);
                collisionGrid[cell.r][cell.c] = cell.val;
            }
            if (selectedCellRef.current && selectedCellRef.current.r === cell.r && selectedCellRef.current.c === cell.c) {
                collision = true;
            }
        });

        // Authoritative write — still a functional update so a keystroke that
        // committed since the snapshot is never dropped.
        setUserGrid(prev => {
            const newG = prev.map(row => [...row]);

            cells.forEach(cell => {
                const prevVal = newG[cell.r]?.[cell.c];
                if (prevVal === undefined) return;
                // Word-level sync: an incoming word only fills the HOLES it finds.
                // A cell this player already filled (their own solved letter, or an
                // earlier opponent word) is left untouched, so the opponent's
                // completed words can never overwrite letters on this board.
                if (prevVal === '') {
                    debug.log('WS', 'handleWordSolved WRITE cell', cell.r + ',' + cell.c, 'new=', cell.val);
                    newG[cell.r][cell.c] = cell.val;
                } else {
                    debug.log('WS', 'handleWordSolved KEEP cell', cell.r + ',' + cell.c, 'existing=', prevVal);
                }
            });

            return newG;
        });

        // Only the cells this word actually FILLED are the opponent's contribution.
        // Cells that were already filled keep their origin (the player's own letter
        // stays green, an earlier opponent word stays red), and they are not handed
        // to this player as fresh Eraser targets either.
        if (writtenByOpponent.size > 0) {
            setOpponentFilled(prev => {
                const next = new Set(prev);
                writtenByOpponent.forEach(key => next.add(key));
                return next;
            });
        }

        // Fire collision callback outside setState updaters (pure function rule)
        if (collision) {
            addTimeout(() => {
                if (onCollisionRef.current) onCollisionRef.current(collisionGrid);
            }, 50);
        }

        // Always fire onOpponentWordSolvedRef — allows App.tsx to handle
        // the case where the user's activeClue intersects with the opponent's
        // solved word but the user's cursor wasn't on a cell directly (no collision).
        // Delay slightly so the grid state has been committed.
        if (onOpponentWordSolvedRef.current) {
            addTimeout(() => {
                if (onOpponentWordSolvedRef.current) {
                    onOpponentWordSolvedRef.current(cells);
                }
            }, 100);
        }
    };

    const handleCellReset = (coords: { r: number, c: number }, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>) => {
        const cellKey = `${coords.r},${coords.c}`;
        debug.log('WS', 'handleCellReset coords=' + JSON.stringify(coords));

        // Active Epic/Shahnameh Tier 3+ clay card grants 1x automatic Erase Shield per match
        if (eraseShieldRemainingRef.current > 0) {
            eraseShieldRemainingRef.current -= 1;
            spawnFloatingEmoji('🛡️✨');
            return;
        }

        setUserGrid(prev => {
            const newG = prev.map(row => [...row]);
            newG[coords.r][coords.c] = '';
            return newG;
        });
        setOpponentFilled(prev => {
            if (!prev.has(cellKey)) return prev;
            const next = new Set(prev);
            next.delete(cellKey);
            return next;
        });
    };

    const spawnFloatingEmoji = (emoji: string) => {
        const id = ++emojiIdCounter.current;
        setFloatingEmojis(prev => [...prev, {id, emoji}]);
        addTimeout(() => { setFloatingEmojis(prev => prev.filter(e => e.id !== id)); }, 2500);
    };

    const handleGameOverEvent = (winnerId: string, winnerScore: number, winnerTime: number, loserId?: string, loserScore?: number) => {
        const currentPlayer = playerRef.current;
        debug.log('MP', 'handleGameOverEvent called: winnerId=' + winnerId + ' winnerScore=' + winnerScore + ' myId=' + currentPlayer?.id + ' alreadyOver=' + gameOverRef.current);
        if (!currentPlayer) return;

        // Guard: only process the FIRST game_over event
        if (gameOverRef.current) return;
        gameOverRef.current = true;

        // Signal that the game ended (shows result screen for both players)
        debug.log('MP', 'handleGameOverEvent: calling onGameFinishedRef.current() to set gameWon=true');
        if (onGameFinishedRef.current) onGameFinishedRef.current();
        
        let status: 'win' | 'lose' | 'draw';
        let opScore: number;
        const myScore = matchScoreRef.current;
        const currentMode = gameModeRef.current;

        if (currentMode === 'battle') {
            if (currentPlayer.id === winnerId) {
                // I finished first — opponent score = their last tracked score
                const latestOpScore = loserScore !== undefined ? loserScore : opponentScoreRef.current;
                if (myScore > latestOpScore) status = 'win';
                else if (myScore < latestOpScore) status = 'lose';
                else status = 'draw';
                opScore = latestOpScore;
            } else {
                // Opponent finished first — their finishing score IS the opponent score
                const opWinnerScore = winnerScore;
                if (myScore > opWinnerScore) status = 'win';
                else if (myScore < opWinnerScore) status = 'lose';
                else status = 'draw';
                opScore = opWinnerScore;
            }
        } else {
            // Speed mode
            if (currentPlayer.id === winnerId) {
                status = 'win';
                opScore = loserScore !== undefined ? loserScore : opponentScoreRef.current;
            } else {
                status = 'lose';
                opScore = winnerScore;
            }
        }

        setFinalResult(prev => {
            if (prev.status !== null) return prev; // Never overwrite an existing result
            return {
                status,
                myScore,
                opScore,
                myTime: currentPlayer.id === winnerId ? winnerTime : undefined,
                opTime: currentPlayer.id !== winnerId ? winnerTime : undefined,
                reason: 'normal'
            };
        });
    };

    // Return string to allow caller to use the ID
    const createRoom = async (mode: GameMode, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>): Promise<string | null> => {
        const currentPlayer = playerRef.current;
        if (!currentPlayer) return null;
        
        resetState();
        setMatchType('direct'); // Friend/direct game — no trophy impact
        setGameStarted(false);
        const rid = multiplayer.generateRoomId();
        setRoomId(rid);
        setIsHost(true);
        setIsMultiplayer(true);
        setGameMode(mode);
        
        const session = ++gameSessionRef.current; // Capture session generation for stale event filtering
        await multiplayer.createRoom(rid, { id: currentPlayer.id, name: currentPlayer.name, avatar: currentPlayer.avatar, progress: 0, score: 0, isHost: true }, mode, {
            onPlayerJoin: (p) => {
                if (session !== gameSessionRef.current) return; // Stale event from previous session
                // ALWAYS cancel leave timer on any join event (opponent may have reconnected after WS drop)
                if (participantLeaveTimerRef.current) {
                    debug.log('[useMultiplayerState createRoom] Opponent rejoined, cancelling leave timer');
                    clearTimeout(participantLeaveTimerRef.current);
                    participantLeaveTimerRef.current = null;
                }
                if (opponentDetectedRef.current) { debug.log('[useMultiplayerState createRoom] onPlayerJoin already handled, skipping'); return; }
                opponentDetectedRef.current = true;
                debug.log(`[useMultiplayerState createRoom] onPlayerJoin called: ${JSON.stringify(p)}`);
                if (isPeerOutdated(p)) setPeerOutdated(true);
                setOpponent(p);
                // Cancel host wait timeout — opponent arrived
                if (hostWaitTimeoutRef.current) { clearTimeout(hostWaitTimeoutRef.current); hostWaitTimeoutRef.current = null; }
            },
            onGameStart: () => { setMana(0); },
            onProgressUpdate: (id, p, s) => {
                if(id !== currentPlayer.id) {
                    setOpponentProgress(p);
                    setOpponentScore(s);
                }
            },
            onGameOver: (...args) => {
                if (session !== gameSessionRef.current) return; // Stale event
                handleGameOverEvent(...args);
            },
            onAttackReceived: (t) => handleAttackReceived(t, setUserGrid, userGridRef),
            onWordSolved: (cells) => handleWordSolved(cells, setUserGrid, userGridRef),
            onEmojiReceived: spawnFloatingEmoji,
            onPreferenceReceived: (pref) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState createRoom] Received preference: ${JSON.stringify(pref)}`);
                applyOpponentPreference(pref);
            },
            onCoinFlipResult: (selectedCategory, selectedSize) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState createRoom] Received coin flip result: cat=${selectedCategory} size=${selectedSize}`);
                if (onCoinFlipResultRef.current) {
                    onCoinFlipResultRef.current(selectedCategory, selectedSize);
                }
            },
            onMergeAck: () => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log('[useMultiplayerState createRoom] Received merge ack — setting mergeAckReceived=true');
                setMergeAckReceived(true);
            },
            onRequestGameData: () => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log('[useMultiplayerState createRoom] Received request_game_data, resending game...');
                const d = gameDataRef.current;
                if (d) {
                    multiplayer.startGame(d.grid, d.clues, d.category, d.mode, {
                        id: currentPlayer.id, name: currentPlayer.name, avatar: currentPlayer.avatar, progress: 0, score: 0, isHost: true
                    });
                } else {
                    debug.warn('[useMultiplayerState createRoom] No game data to resend');
                }
            },
            onCellReset: (coords) => handleCellReset(coords, setUserGrid),
            onPlayerLeft: (reason) => {
                // Stale event from previous session (e.g., presence:leave from old channel unsubscribe)
                if (session !== gameSessionRef.current) return;
                // If game already ended, ignore player_left (winner just returned to menu)
                if (gameOverRef.current) return;
                if (gameStartedRef.current) {
                    // POST-GAME:
                    //   'forfeit'  → opponent explicitly left, declare win IMMEDIATELY (fast notification)
                    //   'presence' → possible WS reconnect, use short grace timer (2s)
                    if (reason === 'forfeit') {
                        debug.log('[useMultiplayerState createRoom] Opponent forfeited — immediate win');
                        gameOverRef.current = true;
                        if (onWinRef.current) onWinRef.current();
                        setFinalResult(prev => {
                            if (prev.status !== null) return prev;
                            return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                        });
                        return;
                    }
                    // Presence leave (possible WS reconnect): short grace timer
                    if (participantLeaveTimerRef.current) {
                        debug.log('[useMultiplayerState createRoom] Player left during game, rejoin timer already running');
                        return;
                    }
                    debug.log('[useMultiplayerState createRoom] Presence leave during game, starting 2s rejoin grace timer');
                    participantLeaveTimerRef.current = setTimeout(() => {
                        debug.log('[useMultiplayerState createRoom] Rejoin grace timer expired, opponent did not rejoin — forfeit win');
                        participantLeaveTimerRef.current = null;
                        if (gameOverRef.current) return;
                        gameOverRef.current = true;
                        if (onWinRef.current) onWinRef.current();
                        setFinalResult(prev => {
                            if (prev.status !== null) return prev;
                            return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                        });
                    }, 2000);
                } else {
                    // PRE-GAME:
                    //   'leave'/'forfeit' → explicit cancel, immediately exit merge screen
                    //   'presence'       → possible WS reconnect, use 20s grace timer
                    if (reason === 'leave' || reason === 'forfeit') {
                        debug.log('[useMultiplayerState createRoom] Opponent explicitly cancelled during pre-game — immediate exit');
                        if (participantLeaveTimerRef.current) {
                            clearTimeout(participantLeaveTimerRef.current);
                            participantLeaveTimerRef.current = null;
                        }
                        setJoinError('حریف بازی را لغو کرد.');
                        leaveRoom(true);
                        return;
                    }
                    // 'presence' → possible WS reconnect, start 20s grace timer
                    if (participantLeaveTimerRef.current) return; // Already waiting
                    debug.log('[useMultiplayerState createRoom] Player left during pre-game, starting 20s grace timer');
                    participantLeaveTimerRef.current = setTimeout(() => {
                        debug.log('[useMultiplayerState createRoom] Grace timer expired, showing opponent left error');
                        participantLeaveTimerRef.current = null;
                        setJoinError('حریف بازی را لغو کرد.');
                    }, 20000);
                }
            }
        });

        // Old channel is cleaned up inside multiplayer.createRoom — safe to reset refs now
        gameOverRef.current = false;
        gameStartedRef.current = false;

        // Host-side timeout: if opponent doesn't join within 60s, show error
        hostWaitTimeoutRef.current = setTimeout(() => {
            setJoinError('حریف به اتاق نپیوست. ممکن است دعوت‌نامه منقضی شده باشد.');
            leaveRoom(true);
            hostWaitTimeoutRef.current = null;
        }, 60000);

        return rid;
    };

    // Same as createRoom but uses a provided roomId (for matchmaking)
    const createRoomWithId = async (roomId: string, mode: GameMode, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>, matchTypeOverride?: 'matchmaking' | 'arena'): Promise<string | null> => {
        const currentPlayer = playerRef.current;
        if (!currentPlayer) return null;

        resetState();
        setMatchType(matchTypeOverride || 'matchmaking');
        setGameStarted(false);
        setRoomId(roomId);
        setIsHost(true);
        setIsMultiplayer(true);
        setGameMode(mode);

        const session = ++gameSessionRef.current; // Capture session generation for stale event filtering
        await multiplayer.createRoom(roomId, { id: currentPlayer.id, name: currentPlayer.name, avatar: currentPlayer.avatar, progress: 0, score: 0, isHost: true }, mode, {
            onPlayerJoin: (p) => {
                if (session !== gameSessionRef.current) return; // Stale event from previous session
                // ALWAYS cancel leave timer on any join event (opponent may have reconnected after WS drop)
                if (participantLeaveTimerRef.current) {
                    debug.log('[useMultiplayerState createRoomWithId] Opponent rejoined, cancelling leave timer');
                    clearTimeout(participantLeaveTimerRef.current);
                    participantLeaveTimerRef.current = null;
                }
                if (opponentDetectedRef.current) { debug.log('[useMultiplayerState createRoomWithId] onPlayerJoin already handled, skipping'); return; }
                opponentDetectedRef.current = true;
                debug.log(`[useMultiplayerState createRoomWithId] onPlayerJoin called: ${JSON.stringify(p)}`);
                if (isPeerOutdated(p)) setPeerOutdated(true);
                setOpponent(p);
                if (hostWaitTimeoutRef.current) { clearTimeout(hostWaitTimeoutRef.current); hostWaitTimeoutRef.current = null; }
            },
            onGameStart: () => { setMana(0); },
            onProgressUpdate: (id, p, s) => {
                if(id !== currentPlayer.id) {
                    setOpponentProgress(p);
                    setOpponentScore(s);
                }
            },
            onGameOver: (...args) => {
                if (session !== gameSessionRef.current) return; // Stale event
                handleGameOverEvent(...args);
            },
            onAttackReceived: (t) => handleAttackReceived(t, setUserGrid, userGridRef),
            onWordSolved: (cells) => handleWordSolved(cells, setUserGrid, userGridRef),
            onEmojiReceived: spawnFloatingEmoji,
            onPreferenceReceived: (pref) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState createRoomWithId] Received preference: ${JSON.stringify(pref)}`);
                applyOpponentPreference(pref);
            },
            onCoinFlipResult: (selectedCategory, selectedSize) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState createRoomWithId] Received coin flip result: cat=${selectedCategory} size=${selectedSize}`);
                if (onCoinFlipResultRef.current) {
                    onCoinFlipResultRef.current(selectedCategory, selectedSize);
                }
            },
            onMergeAck: () => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log('[useMultiplayerState createRoomWithId] Received merge ack — setting mergeAckReceived=true');
                setMergeAckReceived(true);
            },
            onRequestGameData: () => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log('[useMultiplayerState createRoomWithId] Received request_game_data, resending game...');
                const d = gameDataRef.current;
                if (d) {
                    multiplayer.startGame(d.grid, d.clues, d.category, d.mode, {
                        id: currentPlayer.id, name: currentPlayer.name, avatar: currentPlayer.avatar, progress: 0, score: 0, isHost: true
                    });
                } else {
                    debug.warn('[useMultiplayerState createRoomWithId] No game data to resend');
                }
            },
            onCellReset: (coords) => handleCellReset(coords, setUserGrid),
            onPlayerLeft: (reason) => {
                if (session !== gameSessionRef.current) return; // Stale event from previous session
                if (gameOverRef.current) return;
                if (gameStartedRef.current) {
                    // POST-GAME:
                    //   'forfeit'  → opponent explicitly left, declare win IMMEDIATELY
                    //   'presence' → possible WS reconnect, use short grace timer (2s)
                    if (reason === 'forfeit') {
                        debug.log('[useMultiplayerState createRoomWithId] Opponent forfeited — immediate win');
                        gameOverRef.current = true;
                        if (onWinRef.current) onWinRef.current();
                        setFinalResult(prev => {
                            if (prev.status !== null) return prev;
                            return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                        });
                        return;
                    }
                    // Presence leave: short grace timer
                    if (participantLeaveTimerRef.current) {
                        debug.log('[useMultiplayerState createRoomWithId] Player left during game, rejoin timer already running');
                        return;
                    }
                    debug.log('[useMultiplayerState createRoomWithId] Presence leave during game, starting 2s rejoin grace timer');
                    participantLeaveTimerRef.current = setTimeout(() => {
                        debug.log('[useMultiplayerState createRoomWithId] Rejoin grace timer expired, opponent did not rejoin — forfeit win');
                        participantLeaveTimerRef.current = null;
                        if (gameOverRef.current) return;
                        gameOverRef.current = true;
                        if (onWinRef.current) onWinRef.current();
                        setFinalResult(prev => {
                            if (prev.status !== null) return prev;
                            return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                        });
                    }, 2000);
                } else {
                    // PRE-GAME:
                    //   'leave'/'forfeit' → explicit cancel, immediately exit merge screen
                    //   'presence'       → possible WS reconnect, use 20s grace timer
                    if (reason === 'leave' || reason === 'forfeit') {
                        debug.log('[useMultiplayerState createRoomWithId] Opponent explicitly cancelled during pre-game — immediate exit');
                        if (participantLeaveTimerRef.current) {
                            clearTimeout(participantLeaveTimerRef.current);
                            participantLeaveTimerRef.current = null;
                        }
                        setJoinError('حریف بازی را لغو کرد.');
                        leaveRoom(true);
                        return;
                    }
                    if (participantLeaveTimerRef.current) return; // Already waiting
                    debug.log('[useMultiplayerState createRoomWithId] Player left during pre-game, starting 20s grace timer');
                    participantLeaveTimerRef.current = setTimeout(() => {
                        debug.log('[useMultiplayerState createRoomWithId] Grace timer expired, showing opponent left error');
                        participantLeaveTimerRef.current = null;
                        setJoinError('حریف بازی را لغو کرد.');
                    }, 20000);
                }
            }
        });

        // Old channel is cleaned up inside multiplayer.createRoom — safe to reset refs now
        gameOverRef.current = false;
        gameStartedRef.current = false;

        // Host-side timeout: if opponent doesn't join within 60s, show error
        hostWaitTimeoutRef.current = setTimeout(() => {
            setJoinError('حریف به اتاق نپیوست. ممکن است دعوت‌نامه منقضی شده باشد.');
            leaveRoom(true);
            hostWaitTimeoutRef.current = null;
        }, 60000);

        return roomId;
    };

    const joinRoom = async (rid: string, setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][]>) => {
        const currentPlayer = playerRef.current;
        if (!currentPlayer) return;

        resetState();
        setGameStarted(false);
        setRoomId(rid);
        setIsHost(false);
        setIsMultiplayer(true);
        setWaitingForHost(true);

        if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current);
        
        joinTimeoutRef.current = setTimeout(() => {
            setJoinError('سازنده بازی از اتاق خارج شد یا جدول ساخته نشد.');
            leaveRoom(true);
        }, 180000); // 180s - allows merged-category grid generation (capped at 120s) + preference merge

        const session = ++gameSessionRef.current; // Capture session generation for stale event filtering
        await multiplayer.joinRoom(rid, { id: currentPlayer.id, name: currentPlayer.name, avatar: currentPlayer.avatar, progress: 0, score: 0, isHost: false }, {
            onPlayerJoin: (p) => {
                if (session !== gameSessionRef.current) return; // Stale event from previous session
                // Cancel pending leave timer — host rejoined (was temporary WS drop)
                if (participantLeaveTimerRef.current) {
                    debug.log('[useMultiplayerState joinRoom] Host rejoined, cancelling leave timer');
                    clearTimeout(participantLeaveTimerRef.current);
                    participantLeaveTimerRef.current = null;
                }
                debug.log(`[useMultiplayerState joinRoom] onPlayerJoin called: ${JSON.stringify(p)}`);
                if (isPeerOutdated(p)) setPeerOutdated(true);
                // presence_sync repeats on the room heartbeat — keep the existing
                // object when it's the same player so dependent effects don't re-run.
                setOpponent(prev => (prev?.id === p.id ? prev : p));
            },
            onGameOver: (...args) => {
                if (session !== gameSessionRef.current) return; // Stale event
                handleGameOverEvent(...args);
            },
            onGameStart: (g, c, cat, m, hostInfo) => {
                if (session !== gameSessionRef.current) return; // Stale event
                if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current);
                setWaitingForHost(false);
                setGameMode(m);
                gameModeRef.current = m;
                setOpponent(hostInfo);
                setMana(0);
                setGameStarted(true);
                gameStartedRef.current = true;
                if (onGameStartRef.current) onGameStartRef.current(g, c, cat, m);
            },
            onProgressUpdate: (id, p, s) => {
                if(id !== currentPlayer.id) {
                    setOpponentProgress(p);
                    setOpponentScore(s);
                }
            },
            onAttackReceived: (t) => handleAttackReceived(t, setUserGrid, userGridRef),
            onWordSolved: (cells) => handleWordSolved(cells, setUserGrid, userGridRef),
            onEmojiReceived: spawnFloatingEmoji,
            onPreferenceReceived: (pref) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState joinRoom] Received preference: ${JSON.stringify(pref)}`);
                applyOpponentPreference(pref);
            },
            onCoinFlipResult: (selectedCategory, selectedSize) => {
                if (session !== gameSessionRef.current) return; // Stale event
                debug.log(`[useMultiplayerState joinRoom] Received coin flip result: cat=${selectedCategory} size=${selectedSize}`);
                if (onCoinFlipResultRef.current) {
                    onCoinFlipResultRef.current(selectedCategory, selectedSize);
                }
            },
            onMergeAck: () => {
                debug.log('[useMultiplayerState joinRoom] Received merge ack (joiner side, ignoring)');
            },
            onGeneratingStatus: (status) => {
                setGeneratingStatus(status);
            },
            onCellReset: (coords) => handleCellReset(coords, setUserGrid),
            onPlayerLeft: (reason) => {
                if (session !== gameSessionRef.current) return; // Stale event from previous session
                if (gameOverRef.current) return;
                if (!gameStartedRef.current) {
                    // PRE-GAME:
                    //   'leave'/'forfeit' → explicit cancel, immediately exit merge screen
                    //   'presence'       → possible WS reconnect, use 20s grace timer
                    if (reason === 'leave' || reason === 'forfeit') {
                        debug.log('[useMultiplayerState joinRoom] Host explicitly cancelled during pre-game — immediate exit');
                        if (participantLeaveTimerRef.current) {
                            clearTimeout(participantLeaveTimerRef.current);
                            participantLeaveTimerRef.current = null;
                        }
                        setJoinError('سازنده بازی از اتاق خارج شد یا جدول ساخته نشد.');
                        leaveRoom(true);
                        return;
                    }
                    if (participantLeaveTimerRef.current) return; // Already waiting
                    debug.log('[useMultiplayerState joinRoom] Host left during pre-game, starting 20s grace timer');
                    participantLeaveTimerRef.current = setTimeout(() => {
                        debug.log('[useMultiplayerState joinRoom] Grace timer expired, showing host left error');
                        participantLeaveTimerRef.current = null;
                        setJoinError('سازنده بازی از اتاق خارج شد یا جدول ساخته نشد.');
                    }, 20000);
                    return;
                }
                // POST-GAME:
                //   'forfeit'  → opponent explicitly left, declare win IMMEDIATELY
                //   'presence' → possible WS reconnect, use short grace timer (2s)
                if (reason === 'forfeit') {
                    debug.log('[useMultiplayerState joinRoom] Host forfeited — immediate win');
                    gameOverRef.current = true;
                    if (onWinRef.current) onWinRef.current();
                    setFinalResult(prev => {
                        if (prev.status !== null) return prev;
                        return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                    });
                    return;
                }
                // Presence leave: short grace timer
                if (participantLeaveTimerRef.current) {
                    debug.log('[useMultiplayerState joinRoom] Host left during game, rejoin timer already running');
                    return;
                }
                debug.log('[useMultiplayerState joinRoom] Presence leave during game, starting 2s rejoin grace timer');
                participantLeaveTimerRef.current = setTimeout(() => {
                    debug.log('[useMultiplayerState joinRoom] Rejoin grace timer expired, host did not rejoin — forfeit win');
                    participantLeaveTimerRef.current = null;
                    if (gameOverRef.current) return;
                    gameOverRef.current = true;
                    if (onWinRef.current) onWinRef.current();
                    setFinalResult(prev => {
                        if (prev.status !== null) return prev;
                        return { status: 'win', myScore: matchScoreRef.current, opScore: 0, reason: 'forfeit' };
                    });
                }, 2000);
            }
        });
        // Old channel is cleaned up inside multiplayer.joinRoom — safe to reset refs now
        gameOverRef.current = false;
        gameStartedRef.current = false;
    };

    /**
     * Forfeit mid-game: shows defeat screen to the leaver, notifies opponent.
     * Does NOT clean up the channel — that happens when user clicks "منو" on the result screen.
     */
    const forfeitGame = async (): Promise<boolean> => {
        debug.log('MP', 'forfeitGame called, gameOverRef.current=', gameOverRef.current);
        if (gameOverRef.current) {
            debug.log('MP', 'Already over, skipping');
            return false; // Already over — didn't forfeit
        }
        gameOverRef.current = true;
        debug.log('MP', 'Set gameOverRef=true');

        // Notify opponent
        const currentPlayer = playerRef.current;
        debug.log('MP', 'playerRef.current=', currentPlayer?.id, currentPlayer?.name);
        if (currentPlayer) {
            debug.log('MP', 'Broadcasting player_left...');
            await multiplayer.broadcastLeave(currentPlayer.id);
            debug.log('MP', 'Broadcast done');
        }

        // Trigger result screen with defeat status
        debug.log('MP', 'Calling onWinRef.current()...');
        if (onWinRef.current) onWinRef.current();
        debug.log('MP', 'Setting finalResult to lose/forfeit');
        setFinalResult(prev => {
            if (prev.status !== null) return prev;
            return {
                status: 'lose',
                myScore: matchScoreRef.current,
                opScore: 0,
                reason: 'forfeit'
            };
        });
        debug.log('MP', 'Done');
        return true; // Forfeit actually executed
    };

    const leaveRoom = async (keepError = false) => {
        const currentPlayer = playerRef.current;
        if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current);
        if (hostWaitTimeoutRef.current) { clearTimeout(hostWaitTimeoutRef.current); hostWaitTimeoutRef.current = null; }
        // Only broadcast if game is NOT already over — otherwise opponent's onPlayerLeft
        // would process it as a forfeit win during rematch (race condition)
        if (currentPlayer && !gameOverRef.current) {
            // Small delay so handleGameOverEvent can set gameOverRef.current=true
            // before we check it; prevents a race where the winner clicks
            // "Play Again" before the game_over broadcast returns to sender.
            await new Promise(r => setTimeout(r, 1000));
            if (!gameOverRef.current) {
                await multiplayer.broadcastLeave(currentPlayer.id);
            }
        }

        await multiplayer.leaveRoom();
        resetState(keepError);
    };

    const resetState = (keepError = false) => {
		opponentDetectedRef.current = false;
	setOpponent(null);
	setOpponentProgress(0);
        setOpponentScore(0);
        setOpponentFilled(new Set());
        setMana(0);
        eraseShieldRemainingRef.current = computeActiveDeckBuffs(gameServer.getLocalEconomyState()).onlineEraseShieldCharges || 0;
        setGameStarted(false);
        gameStartedRef.current = false;
        gameOverRef.current = false;
        setMatchType(null);
                clearAllTimeouts();
        coinFlipDoneRef.current = false;
	    setMyPreference(null);
        lastOpponentPrefSigRef.current = null;
        setOpponentPreference(null);
        setShowCoinFlip(false);
        setMergeAckReceived(false);
        setIsFrozen(false);
        setIsBlinded(false);
        setFinalResult({ status: null, myScore: 0, opScore: 0, reason: 'normal' });
        setGeneratingStatus(null);
        setPeerOutdated(false);
        if (!keepError) {
            setJoinError(null);
        }
    };

    // Mana Regeneration (boosted by active Football Legends clay cards in Online Battle)
    useEffect(() => {
        let t: number;
        if (isMultiplayer && gameMode === 'battle' && !finalResult.status && roomId && gameStarted) {
            eraseShieldRemainingRef.current = computeActiveDeckBuffs(gameServer.getLocalEconomyState()).onlineEraseShieldCharges || 0;
            t = window.setInterval(() => {
                const buffs = computeActiveDeckBuffs(gameServer.getLocalEconomyState());
                const regenStep = +(2 * (1 + (buffs.onlineManaChargeBonusPct || 0) / 100)).toFixed(1);
                setMana(prev => Math.min(100, +(prev + regenStep).toFixed(1)));
            }, 1000);
        }
        return () => clearInterval(t);
    }, [isMultiplayer, gameMode, finalResult.status, roomId, gameStarted]);

    return {
        roomId, isHost, opponent, opponentProgress, opponentScore, isMultiplayer, waitingForHost, gameMode,
        opponentFilled, finalResult, setFinalResult, matchType, setMatchType,
        mana, setMana, isFrozen, isBlinded, floatingEmojis, spawnFloatingEmoji, joinError,
        createRoom, createRoomWithId, joinRoom, leaveRoom, forfeitGame, handleAttackReceived, setOpponentFilled, resetState,
        setGameStarted,
        // NEW: Coin flip states
        myPreference, setMyPreference, opponentPreference, showCoinFlip, setShowCoinFlip,
        mergeAckReceived, setMergeAckReceived, // Merge acknowledgment
        generatingStatus, // Generating status for joiner UI
        peerOutdated, // Opponent is running a stale client bundle
        setCoinFlipDone: () => { coinFlipDoneRef.current = true; },
        onCoinFlipResultRef, // NEW: Expose ref for setting callback
        onGameFinishedRef, // For triggering result screen when game_over received
        isGameOver: () => gameOverRef.current, // Check if game_over WS was received
        setGameData, // Store game data for re-send on request
        onOpponentWordSolvedRef, // Expose for App.tsx to wire active-clue navigation check
    };
};
