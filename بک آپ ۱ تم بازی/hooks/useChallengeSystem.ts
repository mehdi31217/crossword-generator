import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { PlayerState, SocialNotification, GridSize, Category, ViewType, GameMode, Language } from '../types';
import { gameServer } from '../utils/gameServer';
import { debug } from '../utils/debug';
import { SIZE_SCORE_THRESHOLDS, getUnlockedCategories } from '../utils/config';

interface ChallengeActions {
    setView: (v: ViewType) => void;
    setSize: (s: GridSize) => void;
    setCategory: (c: Category) => void;
    setCurrentGameMode: (m: GameMode) => void;
    setBattleWager: (w: number) => void;
    setShowMultiplayerRetryModal: (v: boolean) => void;
    resetGame: () => void;
}

interface MultiplayerActions {
    createRoom: (mode: GameMode, setUserGrid: Dispatch<SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][] | null>) => Promise<string | null>;
    createRoomWithId?: (roomId: string, mode: GameMode, setUserGrid: Dispatch<SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][] | null>) => Promise<string | null>;
    joinRoom: (rid: string, setUserGrid: Dispatch<SetStateAction<string[][]>>, userGridRef: React.MutableRefObject<string[][] | null>) => Promise<void>;
    leaveRoom: () => Promise<void>;
    waitingForHost: boolean;
    setMatchType?: (t: 'matchmaking' | 'direct' | null) => void;
}

export function useChallengeSystem(
    player: PlayerState | null,
    setPlayer: (p: PlayerState | null) => void,
    language: Language,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    view: ViewType,
    actions: ChallengeActions,
    setUserGrid: Dispatch<SetStateAction<string[][]>>,
    userGridRef: React.MutableRefObject<string[][] | null>,
    multiplayerActions: MultiplayerActions,
    notifications: SocialNotification[],
    setNotifications: Dispatch<SetStateAction<SocialNotification[]>>,
    refreshNotifications: () => Promise<void>,
) {
    const [incomingChallenge, setIncomingChallenge] = useState<SocialNotification | null>(null);
    const processedChallenges = useRef<Set<string>>(new Set());
    const pendingChallengeNotifId = useRef<string | null>(null);
    const pendingChallengeFriendId = useRef<string | null>(null);
    const challengeGuestPref = useRef<{ size: GridSize; category: Category } | null>(null);
    const [showChallengeAcceptDialog, setShowChallengeAcceptDialog] = useState(false);
    const [joinerCategory, setJoinerCategory] = useState<Category>('all');
    const [joinerSize, setJoinerSize] = useState<GridSize>(5);
    const [sendingChallenge, setSendingChallenge] = useState(false);

    // --- HANDLERS ---

    const handleChallengeFriend = async (friendId: string, s: GridSize, c: Category) => {
        setSendingChallenge(true);
        actions.setSize(s);
        actions.setCategory(c);
        actions.setBattleWager(0);
        actions.setCurrentGameMode('multiplayer');
        actions.setShowMultiplayerRetryModal(false);
        actions.resetGame();
        try {
            const rid = await multiplayerActions.createRoom('battle', setUserGrid, userGridRef);
            if (!rid || !player) {
                throw new Error('Failed to create room');
            }
            pendingChallengeFriendId.current = friendId;
            // Register room via HTTP so the friend can check it without WS dependency
            // Must await — if registerRoom fails, joiner's room check will show room as missing
            const regResult = await gameServer.registerRoom(rid, player.id);
            if (!regResult) {
                debug.warn('challenge', 'registerRoom returned false for room', rid, '— WS channel may still work');
            }
            const notif = await gameServer.sendChallenge(player.id, player.name, friendId, rid, 'battle', s, c);
            if (notif?.id) {
                pendingChallengeNotifId.current = notif.id;
                actions.setView('playing');
                showToast(language === 'fa' ? 'دعوت‌نامه ارسال شد' : 'Challenge Sent');
            } else {
                showToast(language === 'fa' ? 'خطا در ارسال دعوت‌نامه' : 'Failed to send challenge', 'error');
            }
        } catch (e) {
            showToast(language === 'fa' ? 'خطا در ارسال دعوت‌نامه' : 'Failed to send challenge', 'error');
        } finally {
            setSendingChallenge(false);
        }
    };

    const handleChallengeClickAccept = async () => {
        const roomId = incomingChallenge?.payload?.roomId;
        if (roomId) {
            const roomOk = await gameServer.checkRoom(roomId);
            if (!roomOk) {
                showToast(language === 'fa' ? 'دعوت‌نامه منقضی شده است' : 'This challenge has expired');
                setIncomingChallenge(null);
                setNotifications(prev => prev.filter(n => n.type !== 'challenge'));
                refreshNotifications();
                return;
            }
        }
        // Default to GUEST's best unlocked size, NOT host's size
        const playerScore = player?.score || 0;
        const unlockedSizes = [10, 9, 8, 7, 6, 5].filter(s => playerScore >= (SIZE_SCORE_THRESHOLDS[s] ?? 0));
        setJoinerSize((unlockedSizes[0] || 5) as GridSize);
        // Default to a category the guest actually has unlocked
        const unlockedCats = getUnlockedCategories(playerScore);
        if (unlockedCats.includes(incomingChallenge?.payload?.category)) {
            setJoinerCategory(incomingChallenge.payload.category as Category);
        } else {
            setJoinerCategory((unlockedCats[0] || 'all') as Category);
        }
        setShowChallengeAcceptDialog(true);
    };

    const handleChallengeClickDecline = () => {
        if (incomingChallenge?.senderId && player) {
            gameServer.rejectChallenge(incomingChallenge.id, incomingChallenge.senderId, player.id);
        }
        setNotifications(prev => prev.filter(n => n.type !== 'challenge'));
        setIncomingChallenge(null);
    };

    const handleChallengeDialogAccept = () => {
        if (!incomingChallenge) return;
        handleAcceptChallenge(incomingChallenge, joinerCategory, joinerSize);
        setShowChallengeAcceptDialog(false);
        setIncomingChallenge(null);
    };

    const handleAcceptChallenge = async (n: SocialNotification, joinerCategory?: Category, joinerSize?: GridSize) => {
        setIncomingChallenge(null);
        const roomId = n.payload?.roomId;
        if (roomId && player) {
            // Check if the room still exists (host might have cancelled)
            const roomOk = await gameServer.checkRoom(roomId);
            if (!roomOk) {
                showToast(language === 'fa' ? 'دعوت‌نامه منقضی شده است' : 'This challenge has expired');
                await gameServer.clearNotification(n.id);
                refreshNotifications();
                return;
            }
            // TWO-WAY MERGE: each player sends their own preference via the room
            // The merge (geometric mean size + 50/50 categories) happens in handleCoinFlipComplete
            const mySize = joinerSize || (n.payload?.size as GridSize) || 5;
            const myCat = joinerCategory || n.payload?.category || 'all';
            actions.setSize(mySize);
            actions.setCategory(myCat);

            // Notify host via HTTP+WS that challenge was accepted
            try {
                await gameServer.sendChallengeAccepted(player.id, player.name, player.avatar, n.senderId, roomId, n.id, mySize, myCat);
            } catch (e) {
                debug.warn('useChallengeSystem', 'sendChallengeAccepted failed (non-fatal):', e);
            }

            // Join the room — mark as friend/direct game (no trophy impact)
            actions.resetGame();
            actions.setCurrentGameMode('multiplayer');
            multiplayerActions.setMatchType?.('direct');
            await multiplayerActions.joinRoom(roomId, setUserGrid, userGridRef);
            actions.setView('playing');

            await gameServer.clearNotification(n.id);
            refreshNotifications();
        } else {
            showToast('خطا در دریافت اطلاعات اتاق', 'error');
        }
    };

    // --- EFFECT: Challenge notification watcher ---
    useEffect(() => {
        const timers: number[] = [];
        const clearTimers = () => timers.forEach(t => clearTimeout(t));

        const latest = notifications.find(n => n.type === 'challenge');
        if (latest && !processedChallenges.current.has(latest.id)) {
            processedChallenges.current.add(latest.id);
            setIncomingChallenge(latest);
            if (navigator.vibrate) navigator.vibrate(200);
            timers.push(window.setTimeout(() => setIncomingChallenge(prev => prev?.id === latest.id ? null : prev), 30000));
        }

        // Handle challenge declined notification
        const declined = notifications.find(n => n.type === 'challenge_declined');
        if (declined && !processedChallenges.current.has(declined.id)) {
            processedChallenges.current.add(declined.id);
            const declinerName = declined.payload?.declinerName || 'بازیکن';
            showToast(
                language === 'fa'
                    ? `${declinerName} دعوت شما را رد کرد`
                    : `${declinerName} declined your challenge`,
                'error'
            );

            // If waiting in lobby, go back to menu
            if (view === 'lobby' && multiplayerActions.waitingForHost) {
                multiplayerActions.leaveRoom();
                actions.setView('menu');
            }

            // Auto-clear this notification
            if (declined.id) {
                gameServer.clearNotification(declined.id);
            }
        }

        return clearTimers;
    }, [notifications, language]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- REMOVED: a second, independent `/api/notifications` poller ---
    // This effect used to hit `gameServer.fetchNotifications` every 2 s as a
    // "backup for unreliable WS notification delivery". It was redundant: the
    // watcher effect above already surfaces an incoming challenge from the
    // shared `notifications` state, which `useSocial` refreshes every 5 s AND
    // pushes live over WS (`notification:new`). Two pollers of the same endpoint
    // meant ~42 GET /api/notifications per minute per client (one per 1.4 s
    // measured); two clients behind one IP were enough to push the endpoint into
    // HTTP 429. Challenges still arrive instantly over WS, with the 5 s poll as
    // the fallback.

    return {
        incomingChallenge,
        processedChallenges,
        pendingChallengeNotifId,
        pendingChallengeFriendId,
        challengeGuestPref,
        showChallengeAcceptDialog, setShowChallengeAcceptDialog,
        joinerCategory, setJoinerCategory,
        joinerSize, setJoinerSize,
        sendingChallenge,
        // Handlers
        handleChallengeFriend,
        handleChallengeClickAccept,
        handleChallengeClickDecline,
        handleChallengeDialogAccept,
        handleAcceptChallenge,
        // Re-expose for App.tsx useSocial callback
        setIncomingChallenge,
    };
}
