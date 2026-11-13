import { useState, useEffect, useRef } from 'react';
import { gameServer } from '../utils/gameServer';
import { Friend, SocialNotification, PlayerState, ChatMessage } from '../types';
import { WS_URL } from '../utils/config';
import { debug } from '../utils/debug';
import { refreshToken } from '../api/client';

function getToken(): string | null {
  try { return localStorage.getItem('auth_token'); } catch (e) { debug.warn('useSocial', 'getToken failed:', e); return null; }
}

const MAX_MESSAGES_PER_CHAT = 200;
const MAX_NOTIFICATIONS = 100;

export const useSocial = (player: PlayerState | null, onEvent?: (msg: string, rawMsg?: any) => void) => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [allOnlinePlayers, setAllOnlinePlayers] = useState<Friend[]>([]);
    const [notifications, setNotifications] = useState<SocialNotification[]>([]);
    // True once the first server fetch of notifications has landed. Anything that
    // was already waiting at that moment is history; only later arrivals are news.
    const [notificationsReady, setNotificationsReady] = useState(false);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
    // Unread DM counts keyed by friend id — drives the badge on friend rows.
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef<number>(0);
    const typingTimeoutRef = useRef<Record<string, any>>({});
    const wsNotifIdsRef = useRef<Set<string>>(new Set());
    const playerRef = useRef(player);
    const onEventRef = useRef(onEvent);
    const mountedRef = useRef(true);
    // The friend whose chat is currently open — new messages from them must NOT
    // bump the unread badge (they're being read live).
    const activeChatRef = useRef<string | null>(null);
    // Friends whose chat we read locally, with the time we read it. The periodic
    // reconcile must not resurrect their badge if the mark-read call failed — but the
    // suppression is time-bounded so a message arriving during a WS outage still shows.
    const readLocallyRef = useRef<Map<string, number>>(new Map());
    const READ_SUPPRESS_MS = 45000; // just over one reconcile cycle

    playerRef.current = player;
    onEventRef.current = onEvent;

    useEffect(() => {
        mountedRef.current = true;
        if (!player) return;

        if (player.id !== 'guest') {
            loadFriends();
            loadNotifications();
        }

        const connectWS = () => {
            try {
                // Close any existing WS before creating new one (prevents duplicate connections)
                if (wsRef.current) {
                    const oldWs = wsRef.current;
                    wsRef.current = null;
                    try { oldWs.close(); } catch (e) { debug.warn('useSocial', 'close old WS:', e); }
                }
                const ws = new WebSocket(WS_URL);

                let authenticated = false;
                let authRefreshTried = false;

                ws.onopen = () => {
                    if (!mountedRef.current) { ws.close(); return; }
                    wsRef.current = ws;
                    reconnectAttemptRef.current = 0; // Reset backoff on successful connection
                    // Send auth token first
                    const token = getToken();
                    if (token) {
                        ws.send(JSON.stringify({ type: 'auth', token }));
                    } else {
                        // The session may just have expired (24h JWT) and been
                        // cleared; try minting a fresh token before going guest.
                        refreshToken().then((fresh) => {
                            if (!mountedRef.current || ws.readyState !== WebSocket.OPEN) return;
                            if (fresh) {
                                ws.send(JSON.stringify({ type: 'auth', token: fresh }));
                                return;
                            }
                            authenticated = true;
                            ws.send(JSON.stringify({
                                type: 'channel:join',
                                channel: 'global_social',
                                data: { id: player.id, name: player.name, avatar: player.avatar }
                            }));
                        });
                    }
                    // Request missed events from server after reconnect
                    ws.send(JSON.stringify({ type: 'reconnect_sync', userId: player.id }));
                    // Poll for missed notifications after reconnect
                    loadNotifications().catch((e) => { debug.warn('useSocial', 'loadNotifications failed:', e); });

                    // Heartbeat ping every 15 seconds to keep connection alive
                    const hbInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN && authenticated) {
                            ws.send(JSON.stringify({ type: 'ping' }));
                        }
                    }, 15000);
                    (ws as any)._heartbeat = hbInterval;
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === 'connected') return;

                        // Handle auth response
                        if (msg.type === 'auth_ok' && !authenticated) {
                            authenticated = true;
                            ws.send(JSON.stringify({
                                type: 'channel:join',
                                channel: 'global_social',
                                data: { id: player.id, name: player.name, avatar: player.avatar }
                            }));
                            loadUnreadCounts().catch((e) => { debug.warn('useSocial', 'loadUnreadCounts failed:', e); });
                            return;
                        }
                        if (msg.type === 'auth_error') {
                            // Token expired/invalid. Try one refresh on this same
                            // socket; only degrade to guest if that fails. Clearing
                            // the token here used to log the user out of HTTP too.
                            if (!authRefreshTried) {
                                authRefreshTried = true;
                                refreshToken().then((fresh) => {
                                    if (!mountedRef.current || ws.readyState !== WebSocket.OPEN) return;
                                    if (fresh) {
                                        ws.send(JSON.stringify({ type: 'auth', token: fresh }));
                                        return;
                                    }
                                    authenticated = true;
                                    ws.send(JSON.stringify({
                                        type: 'channel:join',
                                        channel: 'global_social',
                                        data: { id: player.id, name: player.name, avatar: player.avatar }
                                    }));
                                });
                                return;
                            }
                            authenticated = true;
                            ws.send(JSON.stringify({
                                type: 'channel:join',
                                channel: 'global_social',
                                data: { id: player.id, name: player.name, avatar: player.avatar }
                            }));
                            return;
                        }

                        if (msg.type === 'presence_sync' && msg.channel === 'global_social') {
                            debug.log('[useSocial] Received presence_sync for global_social:', msg.users?.length, 'users');
                            const users = msg.users || [];
                            const onlineIds = new Set<string>();
                            const seen = new Set<string>();

                            users.forEach((u: any) => {
                                if (u.id) onlineIds.add(u.id);
                                if (u.id && u.id !== player.id && !seen.has(u.id)) {
                                    seen.add(u.id);
                                }
                            });

                            const onlinePlayersList: Friend[] = [];
                            users.forEach((u: any) => {
                                if (u.id && u.id !== player.id && seen.has(u.id)) {
                                    seen.delete(u.id);
                                    onlinePlayersList.push({
                                        id: u.id,
                                        friendId: u.id,
                                        name: u.name || 'بازیکن',
                                        avatar: u.avatar || '👤',
                                        status: 'accepted'
                                    });
                                }
                            });

                            setOnlineUsers(onlineIds);
                            setAllOnlinePlayers(onlinePlayersList);
                        }

                        if (msg.type === 'notification:new' && msg.notification) {
                            const n = msg.notification;
                            wsNotifIdsRef.current.add(n.id);
                            debug.log('[useSocial] Received notification:new via WS', { id: n.id, type: n.type, senderId: n.senderId });
                            setNotifications(prev => {
                                if (prev.some(x => x.id === n.id)) return prev;
                                debug.log('[useSocial] Adding notification', n.id);
                                const updated = [n, ...prev];
                                if (updated.length > MAX_NOTIFICATIONS) {
                                    return updated.slice(0, MAX_NOTIFICATIONS);
                                }
                                return updated;
                            });
                        }

                        if (msg.type === 'challenge:rejected') {
                            onEventRef.current?.('challenge_rejected');
                        }

                        if (msg.type === 'challenge:accepted') {
                            onEventRef.current?.('challenge_accepted', msg);
                        }

                        if (msg.type === 'challenge:cancelled') {
                            onEventRef.current?.('challenge_cancelled');
                        }

                        if (msg.type === 'friend:accepted') {
                            // Friend request was accepted — refresh friends list
                            loadFriends().catch((e) => { debug.warn('useSocial', 'loadFriends after accept failed:', e); });
                            onEventRef.current?.('friend_accepted', msg);
                        }

                        if (msg.type === 'friend:removed') {
                            // Someone removed us as friend — refresh list immediately
                            loadFriends().catch((e) => { debug.warn('useSocial', 'loadFriends after remove failed:', e); });
                            onEventRef.current?.('friend_removed', msg);
                        }

                        if (msg.type === 'matchmaking:matched') {
                            onEventRef.current?.('matchmaking_matched', msg);
                        }

                        if (msg.type === 'matchmaking:timeout') {
                            onEventRef.current?.('matchmaking_timeout');
                        }

                        if (msg.type === 'arena:matched') {
                            onEventRef.current?.('arena:matched', msg);
                        }

                        if (msg.type === 'message:new' && msg.message) {
                            const m = msg.message;
                            const friendId = m.senderId;
                            setMessages(prev => {
                                const existing = prev[friendId] || [];
                                if (existing.some(x => x.id === m.id)) return prev;
                                const updated = [...existing, { ...m, isMine: m.senderId === player.id }];
                                if (updated.length > MAX_MESSAGES_PER_CHAT) {
                                    return { ...prev, [friendId]: updated.slice(-MAX_MESSAGES_PER_CHAT) };
                                }
                                return { ...prev, [friendId]: updated };
                            });
                            // Clear the "typing…" flag — the message arrived.
                            setTypingUsers(prev => prev[friendId] ? { ...prev, [friendId]: false } : prev);
                            // Bump the unread badge unless that chat is open right now.
                            if (friendId !== player.id && activeChatRef.current !== friendId) {
                                // A genuinely new message means it is unread again.
                                readLocallyRef.current.delete(friendId);
                                setUnreadCounts(prev => ({ ...prev, [friendId]: (prev[friendId] || 0) + 1 }));
                            }
                        }

                        // Read receipt: a friend opened our chat and read our messages.
                        if (msg.type === 'message:read' && msg.readerId) {
                            const friendId = msg.readerId;
                            setMessages(prev => {
                                const msgs = prev[friendId];
                                if (!msgs) return prev;
                                // `read` may be undefined on optimistically-sent messages,
                                // so test falsiness rather than `=== false`.
                                if (!msgs.some(m => m.isMine && !m.read)) return prev;
                                return { ...prev, [friendId]: msgs.map(m => (m.isMine && !m.read) ? { ...m, read: true } : m) };
                            });
                        }

                        // Direct "typing…" relay (sent peer-to-peer, not broadcast).
                        if (msg.type === 'message:typing' && msg.senderId && msg.senderId !== player.id) {
                            const senderId = msg.senderId;
                            setTypingUsers(prev => ({ ...prev, [senderId]: true }));
                            if (typingTimeoutRef.current[senderId]) {
                                clearTimeout(typingTimeoutRef.current[senderId]);
                            }
                            typingTimeoutRef.current[senderId] = setTimeout(() => {
                                setTypingUsers(prev => ({ ...prev, [senderId]: false }));
                            }, 3000);
                        }

                        if (msg.type === 'channel:event' && msg.channel === 'global_social') {
                            if (msg.event === 'typing' && msg.payload?.senderId !== player.id) {
                                setTypingUsers(prev => ({ ...prev, [msg.payload.senderId]: true }));
                                if (typingTimeoutRef.current[msg.payload.senderId]) {
                                    clearTimeout(typingTimeoutRef.current[msg.payload.senderId]);
                                }
                                typingTimeoutRef.current[msg.payload.senderId] = setTimeout(() => {
                                    setTypingUsers(prev => ({ ...prev, [msg.payload.senderId]: false }));
                                }, 3000);
                            }
                        }
                    } catch (e) {
                        debug.warn('useSocial', 'ws.onmessage error:', e);
                    }
                };

                ws.onclose = (ev: CloseEvent) => {
                    debug.log('useSocial', `WS closed code=${ev.code} reason=${ev.reason} wasClean=${ev.wasClean}`);
                    if ((ws as any)._heartbeat) {
                        clearInterval((ws as any)._heartbeat);
                    }
                    if (wsRef.current === ws) wsRef.current = null;
                    // Only reconnect if THIS ws is still the active one (guard against stale onclose from old WS)
                    if (mountedRef.current && wsRef.current === null && playerRef.current && playerRef.current.id !== 'guest') {
                        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
                        const attempt = reconnectAttemptRef.current++;
                        const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // 1s, 2s, 4s, 8s, 16s, 30s cap
                        debug.log('useSocial', `WS reconnecting in ${delay}ms (attempt ${attempt + 1})`);
                        reconnectTimerRef.current = setTimeout(connectWS, delay);
                    }
                };

                ws.onerror = (ev: Event) => {
                    debug.log('useSocial', `WS error — closing`);
                    ws.close();
                };
            } catch (e) {
                debug.warn('useSocial', 'connectWS setup error:', e);
            }
        };

        connectWS();

        // Listen for notification:new from LocalChannel fallback (gameServer.ts)
        const handleNotifFromLocalChannel = (e: Event) => {
            const n = (e as CustomEvent).detail;
            wsNotifIdsRef.current.add(n.id);
            setNotifications(prev => {
                if (prev.some(x => x.id === n.id)) return prev;
                const updated = [n, ...prev];
                if (updated.length > MAX_NOTIFICATIONS) {
                    return updated.slice(0, MAX_NOTIFICATIONS);
                }
                return updated;
            });
        };
        window.addEventListener('notification:new', handleNotifFromLocalChannel);

        const pollInterval = setInterval(() => {
            loadNotifications().catch((e) => { debug.warn('useSocial', 'loadNotifications failed:', e); });
        }, 5000);

        // Reconcile unread badges less often — live updates come from `message:new`.
        const unreadInterval = setInterval(() => {
            loadUnreadCounts().catch((e) => { debug.warn('useSocial', 'loadUnreadCounts failed:', e); });
        }, 30000);

        return () => {
            window.removeEventListener('notification:new', handleNotifFromLocalChannel);
            mountedRef.current = false;
            // Stop the pollers FIRST. They used to be cleared LAST, after an
            // unguarded `ws.send()` — and `WebSocket.send()` throws
            // `InvalidStateError` whenever the socket is still CONNECTING. Any
            // throw there skipped both clearInterval calls, so each effect re-run
            // leaked another live 5 s poller (StrictMode's mount→cleanup→mount
            // makes that easy to hit). Measured: 20 GET /api/notifications in
            // 25 s from a single tab — 4x the intended rate — which is what drove
            // /api/notifications into HTTP 429.
            clearInterval(pollInterval);
            clearInterval(unreadInterval);
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
            // Clear any pending "typing…" timers so they don't fire after unmount
            for (const key of Object.keys(typingTimeoutRef.current)) {
                clearTimeout(typingTimeoutRef.current[key]);
            }
            typingTimeoutRef.current = {};
            if (wsRef.current) {
                const oldWs = wsRef.current;
                wsRef.current = null;
                // The leave message is best-effort: never let teardown throw.
                try {
                    if (oldWs.readyState === WebSocket.OPEN) {
                        oldWs.send(JSON.stringify({ type: 'channel:leave', channel: 'global_social' }));
                    }
                } catch (e) {
                    debug.warn('useSocial', 'teardown channel:leave failed:', e);
                }
                try { oldWs.close(); } catch (e) { debug.warn('useSocial', 'teardown close failed:', e); }
            }
        };
    }, [player?.id, player?.name, player?.avatar]);

    const sendMessage = async (friendId: string, content: string) => {
        const p = playerRef.current;
        if (!p) return;

        const tempMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            senderId: p.id,
            receiverId: friendId,
            content: content,
            createdAt: new Date().toISOString(),
            read: false,
            isMine: true
        };

        setMessages(prev => {
            const existing = prev[friendId] || [];
            const updated = [...existing, tempMsg];
            if (updated.length > MAX_MESSAGES_PER_CHAT) {
                return { ...prev, [friendId]: updated.slice(-MAX_MESSAGES_PER_CHAT) };
            }
            return { ...prev, [friendId]: updated };
        });

        const saved = await gameServer.sendMessage(p.id, friendId, content);
        if (saved) {
            setMessages(prev => {
                const existing = prev[friendId] || [];
                const tempIndex = existing.findIndex(m => m.id.startsWith('temp-') && m.content === content);
                if (tempIndex !== -1) {
                    const updated = [...existing];
                    updated[tempIndex] = {
                        id: saved.id,
                        senderId: p.id,
                        receiverId: friendId,
                        content: content,
                        createdAt: saved.created_at || new Date().toISOString(),
                        read: false,
                        isMine: true
                    };
                    return { ...prev, [friendId]: updated };
                }
                return prev;
            });
        }
    };

    const sendTyping = async (friendId: string) => {
        const p = playerRef.current;
        if (!p || !wsRef.current) return;
        if (!friendId) return;
        // Relay the typing event straight to the friend instead of broadcasting it
        // to everyone in the global_social channel.
        wsRef.current.send(JSON.stringify({
            type: 'direct_message',
            targetId: friendId,
            eventType: 'message:typing',
            senderId: p.id,
            payload: { senderId: p.id }
        }));
    };

    const loadFriends = async () => {
        try {
            const p = playerRef.current;
            if (!p) return;
            const list = await gameServer.getFriends(p.id);
            setFriends(list);
        } catch (e) {
            debug.warn('useSocial', 'loadFriends failed:', e);
        }
    };

    const loadNotifications = async () => {
        try {
            const p = playerRef.current;
            if (!p || p.id === 'guest') return;
            const data = await gameServer.fetchNotifications(p.id);
            const normalized: SocialNotification[] = (data || []).map((n: any) => ({
                ...n,
                senderId: n.senderId || n.sender_id,
                senderName: n.senderName || n.sender_name,
                senderAvatar: n.senderAvatar || n.sender_avatar,
                createdAt: n.createdAt || n.created_at,
            }));
            setNotifications(prev => {
                // Server response is authoritative base
                const serverIds = new Set(normalized.map(n => n.id));
                // Preserve WS-delivered notifications not yet persisted
                const wsOnly = prev.filter(n => wsNotifIdsRef.current.has(n.id) && !serverIds.has(n.id));
                return [...normalized, ...wsOnly];
            });
        } catch (e) {
            debug.warn('useSocial', 'loadNotifications failed:', e);
        } finally {
            if (mountedRef.current) setNotificationsReady(true);
        }
    };

    const loadChatHistory = async (friendId: string) => {
        const p = playerRef.current;
        if (!p) return;
        const msgs = await gameServer.fetchMessages(p.id, friendId);
        setMessages(prev => ({ ...prev, [friendId]: msgs }));
    };

    const loadUnreadCounts = async () => {
        const p = playerRef.current;
        if (!p || p.id === 'guest') return;
        const counts = await gameServer.fetchUnreadCounts(p.id);
        if (!mountedRef.current) return;
        // Never resurrect a badge for a chat we read locally in the last few seconds —
        // the server may still report it unread if the mark-read call failed.
        const now = Date.now();
        const filtered: Record<string, number> = {};
        for (const [friendId, n] of Object.entries(counts)) {
            const readAt = readLocallyRef.current.get(friendId);
            if (readAt !== undefined && now - readAt < READ_SUPPRESS_MS) continue;
            if (activeChatRef.current === friendId) continue;
            filtered[friendId] = n;
        }
        setUnreadCounts(filtered);
    };

    /** Open/close tracking so an open chat never shows an unread badge. */
    const setActiveChat = (friendId: string | null) => {
        activeChatRef.current = friendId;
        if (friendId) {
            setUnreadCounts(prev => {
                if (!prev[friendId]) return prev;
                const next = { ...prev };
                delete next[friendId];
                return next;
            });
        }
    };

    const markChatRead = (friendId: string) => {
        // Remember this locally so the reconcile can't bring the badge back.
        readLocallyRef.current.set(friendId, Date.now());
        // Clear the unread badge immediately.
        setUnreadCounts(prev => {
            if (!prev[friendId]) return prev;
            const next = { ...prev };
            delete next[friendId];
            return next;
        });
        // Flip our received bubbles to read so the UI is consistent.
        setMessages(prev => {
            const msgs = prev[friendId];
            if (!msgs || !msgs.some(m => !m.isMine && !m.read)) return prev;
            const updated = msgs.map(m => (!m.isMine && !m.read) ? { ...m, read: true } : m);
            return { ...prev, [friendId]: updated };
        });
        // Persist on the server; this also emits a read receipt to the sender.
        // Retry a couple of times — a transient failure would otherwise bring the
        // badge back on the next reconcile.
        const p = playerRef.current;
        if (p && p.id !== 'guest') {
            const attempt = (n: number) => {
                gameServer.markMessagesRead(p.id, friendId)
                    .then((ok) => {
                        if (!ok && n < 2 && mountedRef.current) {
                            setTimeout(() => attempt(n + 1), 1500 * (n + 1));
                        }
                    })
                    .catch(() => {
                        if (n < 2 && mountedRef.current) setTimeout(() => attempt(n + 1), 1500 * (n + 1));
                    });
            };
            attempt(0);
        }
    };

    const deleteNotification = async (nId: string) => {
        // Remove from wsNotifIdsRef so loadNotifications won't preserve it
        wsNotifIdsRef.current.delete(nId);
        // Remove from local state immediately
        setNotifications(prev => prev.filter(n => n.id !== nId));
        // Call API to delete on server
        await gameServer.clearNotification(nId);
        // Refresh from server for consistency
        await loadNotifications();
    };

    return {
        friends: friends.map(f => ({ ...f, isOnline: onlineUsers.has(f.friendId) })),
        allOnlinePlayers,
        notifications,
        notificationsReady,
        setNotifications,
        messages,
        typingUsers,
        unreadCounts,
        sendMessage,
        sendTyping,
        loadChatHistory,
        refreshFriends: loadFriends,
        refreshNotifications: loadNotifications,
        refreshUnread: loadUnreadCounts,
        deleteNotification,
        markChatRead,
        setActiveChat
    };
};
