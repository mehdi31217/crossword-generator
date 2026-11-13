import React, { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, X, Copy, Swords, Check, Trash, Message, Send, ArrowLeft, Spinner,
} from './GlassIcons';
import { GameCoin } from './GameCoin';
import { Friend, Language, PlayerState, SocialNotification, ChatMessage, GridSize, Category, AsyncDuel } from '../types';
import { gameServer } from '../utils/gameServer';
import { ConfirmDialog } from './ConfirmDialog';
import { BattleInviteDialog } from './BattleInviteDialog';
import { AvatarRenderer } from './AvatarRenderer';

interface SocialPanelProps {
  player: PlayerState;
  language: Language;
  friends: Friend[];
  notifications: SocialNotification[];
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, boolean>;
  unreadCounts: Record<string, number>;
  onLoadChat: (friendId: string) => void;
  onClose: () => void;
  onChallenge: (friendId: string, size: GridSize, category: Category) => void;
  onAcceptChallenge: (n: SocialNotification, joinerCategory?: Category, joinerSize?: GridSize) => void;
  onChallengeAcceptClick: (n: SocialNotification) => void;
  onRefresh: () => void;
  onSendMessage: (friendId: string, content: string) => void;
  onSendTyping: (friendId: string) => void;
  deleteNotification: (nId: string) => Promise<void>;
  onMarkChatRead?: (friendId: string) => void;
  onSetActiveChat?: (friendId: string | null) => void;
  /** Start a friend's async duel straight from its inbox notification. */
  onPlayDuel?: (duel: AsyncDuel) => void;
}

const PRIMARY = 'var(--clay-shell)';

const TILE_CLAY: React.CSSProperties = {
  width: 42, height: 42, borderRadius: 13,
  background: PRIMARY, color: '#FFF6EC', border: '1px solid #8E4E37',
  boxShadow: '0 1px 0 rgba(255,226,204,.45) inset, 0 -2px 0 rgba(58,30,18,.22) inset, 0 10px 18px -14px rgba(70,40,25,.9)',
};

const TILE_SOFT: React.CSSProperties = {
  width: 56, height: 56, borderRadius: 18,
  background: 'var(--paper-lift)', border: '1px solid rgba(142,78,55,.3)',
  boxShadow: '0 1px 0 rgba(255,255,255,.75) inset',
};

export const SocialPanel: React.FC<SocialPanelProps> = ({
  player, language, friends, notifications, messages, typingUsers, unreadCounts, onLoadChat, onClose, onChallenge, onAcceptChallenge, onChallengeAcceptClick, onRefresh, onSendMessage, onSendTyping, deleteNotification, onMarkChatRead, onSetActiveChat, onPlayDuel
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'inbox' | 'chat'>('list');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const flashMessage = (msg: string, type: 'error' | 'success') => {
    if (type === 'error') setLocalError(msg); else setLocalSuccess(msg);
    setTimeout(() => { setLocalError(null); setLocalSuccess(null); }, 3000);
  };
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [acceptingChallenge, setAcceptingChallenge] = useState<SocialNotification | null>(null);
  const [joinerSize, setJoinerSize] = useState<GridSize>(5);
  const [joinerCategory, setJoinerCategory] = useState<Category>('all');
  const [configuringBattleFor, setConfiguringBattleFor] = useState<Friend | null>(null);
  const [battleSize, setBattleSize] = useState<GridSize>(6);
  const [battleCategory, setBattleCategory] = useState<Category>('all');
  const [addCode, setAddCode] = useState('');
  const [addStatus, setAddStatus] = useState<{ type: string; msg: string }>({ type: 'idle', msg: '' });
  const [msgInput, setMsgInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Friend | null>(null);
  const isFA = language === 'fa';

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const lastTypingSentRef = useRef(0);

  // Load Chat when opening a friend, and tell the hook which chat is open so it
  // never shows an unread badge for the conversation the user is looking at.
  useEffect(() => {
    if (activeTab === 'chat' && activeFriend) {
      onSetActiveChat?.(activeFriend.friendId);
      onLoadChat(activeFriend.friendId);
    } else {
      onSetActiveChat?.(null);
    }
    return () => { onSetActiveChat?.(null); };
  }, [activeTab, activeFriend?.friendId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark the conversation read on open AND whenever a new message arrives while
  // it is open (the guard goes false right after, so this can't loop).
  useEffect(() => {
    if (activeTab !== 'chat' || !activeFriend) return;
    const hasUnread = (messages[activeFriend.friendId] || []).some(m => !m.isMine && !m.read);
    if (hasUnread) onMarkChatRead?.(activeFriend.friendId);
  }, [activeTab, activeFriend?.friendId, messages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive active messages directly from props to ensure reactivity
  const activeMessages = activeFriend ? (messages[activeFriend.friendId] || []) : [];

  // Auto-scroll whenever messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [activeMessages, activeTab, activeFriend, typingUsers]);

  const handleAddFriend = async () => {
    if (addCode.length < 6) return;
    setAddStatus({ type: 'loading', msg: '...' });
    const res = await gameServer.sendFriendRequest(player.id, addCode);

    if (res.success) {
      setAddStatus({ type: 'success', msg: isFA ? 'درخواست ارسال شد!' : 'Request Sent!' });
      setAddCode('');
    } else {
      setAddStatus({ type: 'error', msg: res.msg || 'Error' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsgInput(e.target.value);
    if (activeFriend) {
      const now = Date.now();
      // Throttle typing events to once every 2 seconds
      if (now - lastTypingSentRef.current > 2000) {
        onSendTyping(activeFriend.friendId);
        lastTypingSentRef.current = now;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!msgInput.trim() || !activeFriend) return;
    const content = msgInput.trim();
    setMsgInput('');
    onSendMessage(activeFriend.friendId, content);
  };

  const handleRemoveFriend = async (friend: Friend) => {
    setRemoveTarget(friend);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveFriend = async () => {
    if (!removeTarget) return;
    await gameServer.removeFriend(removeTarget.id, player.id);
    setShowRemoveConfirm(false);
    setRemoveTarget(null);
    onRefresh();
  };

  const cancelRemoveFriend = () => {
    setShowRemoveConfirm(false);
    setRemoveTarget(null);
  };

  const openChat = (f: Friend) => {
    setActiveFriend(f);
    setActiveTab('chat');
  };

  const startBattleConfig = (f: Friend) => {
    if (!f.isOnline) {
      flashMessage(
        isFA
          ? 'دوست شما آفلاین است — دعوت ذخیره می‌شود و به‌محض آنلاین شدن می‌بیند'
          : 'Friend is offline — the invite is saved and shown when they come online',
        'success'
      );
    }
    setConfiguringBattleFor(f);
  };

  const sendChallenge = () => {
    if (configuringBattleFor) {
      onChallenge(configuringBattleFor.friendId, battleSize, battleCategory);
      setConfiguringBattleFor(null);
    }
  };

  const acceptChallengeAction = () => {
    if (acceptingChallenge) {
      onAcceptChallenge(acceptingChallenge, joinerCategory, joinerSize);
      setAcceptingChallenge(null);
    }
  };

  const isFriendTyping = activeFriend && typingUsers[activeFriend.friendId];
  const unreadOf = (f: Friend) => unreadCounts?.[f.friendId] || 0;
  const totalUnread = friends.reduce((sum, f) => sum + unreadOf(f), 0);

  const TABS: { id: 'list' | 'inbox' | 'add'; labelFa: string; labelEn: string }[] = [
    { id: 'list', labelFa: 'دوستان', labelEn: 'Friends' },
    { id: 'inbox', labelFa: 'پیام‌ها', labelEn: 'Inbox' },
    { id: 'add', labelFa: 'افزودن', labelEn: 'Add' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" style={{ background: 'rgba(46,28,18,.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} onClick={onClose} />

      <div
        className="relative w-full max-w-md cg-glass rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300"
        dir={isFA ? 'rtl' : 'ltr'}
        style={{ border: '1px solid var(--cg-hair)' }}
      >
        {/* Header */}
        <header className="p-4 flex items-center justify-between sticky top-0 z-20"
          style={{ background: 'var(--cg-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--cg-hair)' }}>
          <div className="flex items-center gap-3 min-w-0">
            {activeTab === 'chat' && activeFriend ? (
              <button onClick={() => setActiveTab('list')} className="p-2 -ml-2 rounded-full text-[var(--cg-ink2)] hover:bg-[rgba(36,26,20,.06)] transition-colors" aria-label="back">
                <ArrowLeft size={22} className={isFA ? 'rotate-180' : ''} />
              </button>
            ) : (
              <span className="grid place-items-center shrink-0" style={TILE_CLAY}><Users size={22} /></span>
            )}
            <h2 className="text-base sm:text-xl font-black text-[var(--cg-ink)] truncate">
              {activeTab === 'chat' && activeFriend
                ? activeFriend.name
                : (isFA ? 'دوستان و نبرد' : 'Social Hub')}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-[var(--cg-ink2)] hover:bg-[rgba(36,26,20,.06)] active:bg-[rgba(36,26,20,.10)] transition-colors shrink-0"
            aria-label={isFA ? 'بستن' : 'Close'} style={{ background: 'rgba(250,243,232,.55)' }}>
            <X size={22} />
          </button>
        </header>

        {/* Chat subheader (online status + battle) */}
        {activeTab === 'chat' && activeFriend && (
          <div className="px-4 py-2 flex items-center justify-between" style={{ background: 'rgba(250,243,232,.45)', borderBottom: '1px solid var(--cg-hair)' }}>
            <div className="flex items-center gap-2 text-xs font-black">
              <AvatarRenderer avatar={activeFriend.avatar} size={32} />
              <span className={activeFriend.isOnline ? 'text-[#4E5E44]' : 'text-[var(--cg-ink3)]'}>
                {isFriendTyping
                  ? (isFA ? 'در حال نوشتن...' : 'Typing...')
                  : (activeFriend.isOnline ? (isFA ? 'آنلاین' : 'Online') : (isFA ? 'آفلاین' : 'Offline'))}
              </span>
            </div>
            {activeFriend.isOnline && (
              <button onClick={() => startBattleConfig(activeFriend)}
                className="px-3 py-1.5 rounded-2xl text-white text-[11px] font-black shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                style={{ background: PRIMARY }}>
                <Swords size={15} />
                {isFA ? 'نبرد' : 'Battle'}
              </button>
            )}
          </div>
        )}

        {/* Segmented tabs (hidden in chat) */}
        {activeTab !== 'chat' && (
          <div className="px-4 pt-4">
            <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--paper-well)', border: '1px solid var(--cg-hair)' }}>
              {TABS.map((t) => {
                const active = activeTab === t.id;
                const badge = t.id === 'list' ? totalUnread : t.id === 'inbox' ? notifications.length : 0;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className="relative flex-1 py-2.5 rounded-xl text-xs font-black transition-all"
                    style={{
                      background: active ? 'var(--paper-lift)' : 'transparent',
                      color: active ? 'var(--clay-ink)' : 'var(--cg-ink3)',
                      border: active ? '1px solid rgba(142,78,55,.22)' : '1px solid transparent',
                      boxShadow: active ? '0 1px 0 rgba(255,255,255,.7) inset, 0 8px 16px -12px rgba(70,45,30,.7)' : 'none',
                    }}>
                    {t.id === 'list' && <Users size={15} className="inline mr-1 -mt-0.5" />}
                    {t.id === 'inbox' && <Message size={15} className="inline mr-1 -mt-0.5" />}
                    {t.id === 'add' && <UserPlus size={15} className="inline mr-1 -mt-0.5" />}
                    {isFA ? t.labelFa : t.labelEn}
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#9E5A50] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md tabular-nums" style={{ border: '2px solid var(--paper)' }}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Flash Messages */}
        {(localError || localSuccess) && (
          <div className="px-4 pt-3">
            <div className="px-3 py-2 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2"
              style={{
                background: localError ? 'rgba(255,55,95,.14)' : 'rgba(48,209,88,.16)',
                color: localError ? '#8E4E37' : '#4E5E44',
                border: `1px solid ${localError ? 'rgba(255,55,95,.3)' : 'rgba(48,209,88,.34)'}`,
              }}>
              {localError || localSuccess}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none', background: 'transparent' }}>

          {activeTab === 'list' && (
            <>
              {friends.length === 0 ? (
                <div className="text-center min-h-[52vh] flex flex-col items-center justify-center gap-3 text-[var(--cg-ink3)]">
                  <span className="grid place-items-center shrink-0" style={TILE_SOFT}><Users size={28} style={{ color: '#8E4E37' }} /></span>
                  <p className="text-xs font-black">{isFA ? 'هنوز دوستی ندارید!' : 'No friends yet.'}</p>
                  <p className="text-[10.5px] font-bold leading-5 max-w-[220px]">
                    {isFA
                      ? 'کد دوستیِ دوستت را در تب «افزودن» وارد کن تا چالش و بازی مشترک باز شود.'
                      : 'Enter a friend code in the "Add" tab to unlock duels and shared games.'}
                  </p>
                  <button onClick={() => setActiveTab('add')} className="cg-btn-clay px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-transform active:scale-95">
                    <UserPlus size={13} /> {isFA ? 'افزودن دوست' : 'Add a friend'}
                  </button>
                </div>
              ) : (
                friends.map((f, fi) => {
                  const unread = unreadOf(f);
                  return (
                    <div key={f.id}
                      className="p-3 rounded-3xl flex items-center justify-between animate-card-enter"
                      style={{
                        background: unread > 0 ? 'rgba(142,78,55,.10)' : 'rgba(250,244,233,.65)',
                        border: `1px solid ${unread > 0 ? 'rgba(94,92,230,.28)' : 'var(--cg-hair)'}`,
                        animationDelay: `${0.1 + fi * 0.06}s`,
                      }}>
                      <button onClick={() => openChat(f)} className="flex items-center gap-3 min-w-0 text-left">
                        <div className="relative">
                          <AvatarRenderer avatar={f.avatar} size={44} />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#FBF4EA] ${f.isOnline ? 'bg-[#5E6E52]' : 'bg-[rgba(36,26,20,.22)]'}`} />
                          {unread > 0 && (
                            <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-[#9E5A50] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#FBF4EA] tabular-nums">
                              {unread > 99 ? '99+' : unread}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-[var(--cg-ink)] text-sm truncate">{f.name}</span>
                          <span className={`text-[10px] font-bold ${unread > 0 ? 'text-[#8E4E37]' : 'text-[var(--cg-ink3)]'}`}>
                            {unread > 0
                              ? (isFA ? `${unread} پیام خوانده‌نشده` : `${unread} new message${unread > 1 ? 's' : ''}`)
                              : (f.isOnline ? (isFA ? 'آنلاین' : 'Online') : (isFA ? 'آفلاین' : 'Offline'))}
                          </span>
                        </div>
                      </button>

                      <div className="flex gap-1.5">
                        <button onClick={() => openChat(f)} className="relative p-2.5 rounded-2xl transition-colors"
                          style={{ background: unread > 0 ? PRIMARY : 'rgba(142,78,55,.12)', color: unread > 0 ? '#fff' : '#8E4E37' }} title={isFA ? 'چت' : 'Chat'}>
                          <Message size={18} />
                        </button>
                        <button onClick={() => startBattleConfig(f)} className="p-2.5 rounded-2xl transition-all active:scale-95"
                          style={{
                            background: f.isOnline ? PRIMARY : 'rgba(250,243,232,.6)',
                            color: f.isOnline ? '#fff' : 'var(--cg-ink3)',
                          }} title={f.isOnline ? (isFA ? 'دعوت به نبرد' : 'Challenge') : (isFA ? 'دعوت (آفلاین)' : 'Challenge (offline)')}>
                          <Swords size={18} />
                        </button>
                        <button onClick={() => handleRemoveFriend(f)} className="p-2.5 rounded-2xl transition-colors"
                          style={{ background: 'rgba(255,55,95,.12)', color: '#8E4E37' }} title={isFA ? 'حذف دوست' : 'Remove Friend'}>
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-3 pb-2" style={{ scrollbarWidth: 'none' }}>
                {activeMessages.length === 0 ? (
                  <div className="text-center text-[var(--cg-ink3)] py-12 text-xs font-bold italic">
                    {isFA ? 'پیامی نیست. سلام کنید!' : 'No messages yet. Say Hi!'}
                  </div>
                ) : (
                  activeMessages.map(m => (
                    <div key={m.id} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[80%] p-3 rounded-3xl text-sm font-bold shadow-sm ${m.isMine ? 'text-white rounded-tr-md' : 'rounded-tl-md'}`}
                        style={m.isMine
                          ? { background: PRIMARY }
                          : { background: 'rgba(252,247,238,.9)', border: '1px solid var(--cg-hair)', color: 'var(--cg-ink)' }}>
                        {m.content}
                        <div className={`text-[8px] mt-1 flex items-center gap-1 ${m.isMine ? 'text-white/70 justify-end' : 'text-[var(--cg-ink3)] justify-start'}`}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {m.isMine && (
                            <span className={m.read ? 'text-white font-black' : 'text-white/50'} title={m.read ? (isFA ? 'خوانده شد' : 'Seen') : (isFA ? 'ارسال شد' : 'Sent')}>
                              {m.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isFriendTyping && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-3 rounded-3xl rounded-tl-md flex gap-1 items-center" style={{ background: 'rgba(250,244,233,.75)', border: '1px solid var(--cg-hair)' }}>
                      <span className="w-2 h-2 bg-[var(--cg-ink3)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-[var(--cg-ink3)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-[var(--cg-ink3)] rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold outline-none transition-all"
                  style={{ background: 'rgba(250,244,233,.8)', border: '2px solid var(--cg-hair)' }}
                  placeholder={isFA ? 'پیام بنویسید...' : 'Type a message...'}
                  value={msgInput}
                  onChange={handleInputChange}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={!msgInput.trim()}
                  className="text-white p-3.5 rounded-2xl shadow-lg disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: PRIMARY }}>
                  <Send size={18} className={isFA ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-[var(--cg-ink3)]">
                  <span className="grid place-items-center shrink-0" style={TILE_SOFT}><Message size={28} style={{ color: '#8E4E37' }} /></span>
                  <p className="text-xs font-black mt-3">{isFA ? 'صندوق پیام خالی است' : 'No new notifications'}</p>
                </div>
              ) : (
                notifications.map((n, ni) => {
                  const isChallenge = n.type === 'challenge';
                  const isDuel = n.type === 'duel';
                  const isDuelResult = n.type === 'duel_result';
                  const duelPayload = n.payload || {};
                  const senderLabel = n.payload?.senderName || n.senderName;
                  return (
                  <div key={n.id} className="p-4 rounded-3xl flex flex-col gap-3 animate-card-enter"
                    style={{ background: 'rgba(250,244,233,.72)', border: '1px solid var(--cg-hair)', animationDelay: `${0.1 + ni * 0.08}s` }}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest" style={{ color: '#8E4E37' }}>
                        {isChallenge || isDuel || isDuelResult ? <Swords size={15} /> : <UserPlus size={15} />}
                        {isChallenge
                          ? (isFA ? 'دعوت به نبرد' : 'CHALLENGE')
                          : isDuel
                            ? (isFA ? 'چالش دوئل' : 'DUEL CHALLENGE')
                            : isDuelResult
                              ? (isFA ? 'نتیجه چالش' : 'CHALLENGE RESULT')
                              : (isFA ? 'درخواست دوستی' : 'FRIEND REQUEST')}
                      </div>
                      <span className="text-[9px] text-[var(--cg-ink3)] font-mono">{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[var(--cg-ink)] leading-snug mb-2">
                        <span style={{ color: '#8E4E37' }}>{senderLabel}</span>{' '}
                        {isChallenge
                          ? (isFA ? 'شما را به نبرد دعوت کرد!' : 'challenged you to a battle!')
                          : isDuel
                            ? (isFA ? 'تو را به چالش دعوت کرد.' : 'invited you to a duel challenge.')
                            : isDuelResult
                              ? (isFA ? 'نتیجهٔ چالش تو را ثبت کرد.' : 'played your challenge.')
                              : (isFA ? 'می‌خواهد با شما دوست شود.' : 'wants to be friends.')}
                      </p>

                      {isChallenge && n.payload && (
                        <div className="inline-flex gap-2">
                          <div className="px-3 py-1 rounded-xl flex items-center gap-1" style={{ background: 'rgba(142,78,55,.12)', border: '1px solid rgba(94,92,230,.24)' }}>
                            <Swords size={12} style={{ color: '#8E4E37' }} />
                            <span className="text-xs font-black" style={{ color: '#8E4E37' }}>{n.payload.size || 5}x{n.payload.size || 5}</span>
                          </div>
                        </div>
                      )}

                      {isDuel && (
                        <div className="inline-flex gap-2">
                          <div className="px-3 py-1 rounded-xl flex items-center gap-1" style={{ background: 'rgba(142,78,55,.12)', border: '1px solid rgba(94,92,230,.24)' }}>
                            <Swords size={12} style={{ color: '#8E4E37' }} />
                            <span className="text-xs font-black" style={{ color: '#8E4E37' }}>
                              {isFA ? 'امتیاز داوری' : 'verdict'} {duelPayload.points ?? 0}
                            </span>
                          </div>
                          <div className="px-3 py-1 rounded-xl text-xs font-black" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.24)', color: '#0f766e' }}>
                            {duelPayload.size || 5}x{duelPayload.size || 5}
                          </div>
                        </div>
                      )}

                      {isDuelResult && (
                        <div className="inline-flex gap-2 flex-wrap">
                          <div className="px-3 py-1 rounded-xl text-xs font-black" style={{
                            background: duelPayload.outcome === 'win' ? 'rgba(16,185,129,.14)' : 'rgba(244,63,94,.12)',
                            color: duelPayload.outcome === 'win' ? '#0f766e' : '#8E4E37',
                          }}>
                            {duelPayload.outcome === 'win'
                              ? (isFA ? 'بردی' : 'You won')
                              : (isFA ? 'باختی' : 'You lost')}
                          </div>
                          <div className="px-3 py-1 rounded-xl text-xs font-black" style={{ background: 'rgba(142,78,55,.12)', color: '#8E4E37' }}>
                            {duelPayload.creatorPoints ?? duelPayload.creatorScore ?? 0} — {duelPayload.opponentPoints ?? duelPayload.opponentScore ?? 0}
                          </div>
                          {typeof duelPayload.rewardCoins === 'number' && (
                            <div className="px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5" style={{ background: 'rgba(245,158,11,.14)', color: '#b45309' }}>
                              <GameCoin size={14} /> <span>{duelPayload.rewardCoins}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-1">
                      {isChallenge ? (
                        <button
                          onClick={() => {
                            const payload = n.payload || {};
                            const oppSize = (payload.size || 5) as GridSize;
                            const oppCategory = (payload.category || 'all') as Category;
                            setJoinerSize(oppSize);
                            setJoinerCategory(oppCategory);
                            setAcceptingChallenge(n);
                          }}
                          className="flex-1 text-white py-2.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all"
                          style={{ background: PRIMARY }}>
                          {isFA ? 'قبول و ورود' : 'Accept & Join'}
                        </button>
                      ) : isDuel ? (
                        <button
                          onClick={async () => {
                            try {
                              const duel = await gameServer.acceptDuel(String(duelPayload.duelId || ''));
                              if (!duel?.board) throw new Error(isFA ? 'جدول چالش پیدا نشد' : 'Challenge board missing');
                              if (onPlayDuel) onPlayDuel(duel);
                              else flashMessage(isFA ? 'چالش آماده است' : 'Challenge ready', 'success');
                              await deleteNotification(n.id);
                              onRefresh();
                            } catch (e: any) {
                              flashMessage(e?.message || (isFA ? 'پذیرش چالش ناموفق بود' : 'Could not accept the challenge'), 'error');
                            }
                          }}
                          className="flex-1 text-white py-2.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          style={{ background: 'linear-gradient(135deg,#6E8160,#4E5E44)' }}>
                          <Swords size={14} />
                          {isFA ? 'شروع چالش' : 'Play challenge'}
                        </button>
                      ) : isDuelResult ? null : (
                        <button onClick={async () => {
                          const res = await gameServer.acceptFriend(n.senderId, player.id, n.id);
                          if (res.success) {
                            flashMessage(isFA ? 'درخواست دوستی قبول شد' : 'Friend request accepted', 'success');
                          } else {
                            flashMessage(res.error || (isFA ? 'خطا در پذیرش' : 'Accept failed'), 'error');
                          }
                          await deleteNotification(n.id);
                          onRefresh();
                        }} className="flex-1 text-white py-2.5 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg,#6E8160,#4E5E44)' }}>{isFA ? 'قبول' : 'Accept'}</button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="px-3.5 rounded-2xl transition-colors"
                        style={{ background: 'rgba(255,55,95,.12)', color: '#8E4E37' }} title={isFA ? 'حذف' : 'Delete'}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'add' && (
            <div className="space-y-4 pt-1">
              <div className="p-5 rounded-3xl" style={{ background: 'rgba(250,244,233,.72)', border: '1px solid var(--cg-hair)' }}>
                <div className="text-[11px] font-black text-[var(--cg-ink3)] uppercase mb-2 tracking-widest">{isFA ? 'کد اختصاصی شما' : 'Your Friend Code'}</div>
                <button
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed cursor-pointer hover:shadow-md transition-all active:scale-[0.97] relative overflow-hidden"
                  style={{ background: 'rgba(94,92,230,.08)', borderColor: 'rgba(94,92,230,.35)' }}
                  onClick={() => {
                    navigator.clipboard.writeText(player.friendCode).catch((e) => console.warn('copy failed:', e));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  <span className="text-3xl font-mono font-black tracking-[0.15em]" style={{ color: '#3a3899' }}>{player.friendCode}</span>
                  {copied ? <Check size={18} style={{ color: '#1aa84a' }} className="animate-in zoom-in" /> : <Copy size={18} style={{ color: '#7c5cff' }} />}
                  {copied && (
                    <span className="absolute -top-1 -right-1 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-in zoom-in shadow-lg" style={{ background: '#5E6E52' }}>
                      {isFA ? 'کپی شد!' : 'COPIED!'}
                    </span>
                  )}
                </button>
                <p className="text-[10px] text-[var(--cg-ink3)] mt-2 font-bold text-center">{isFA ? 'برای کپی ضربه بزنید' : 'Tap to copy'}</p>

                <button
                  onClick={() => {
                    const text = isFA
                      ? `سلام! بیا تو کراس‌ورد پرو باهم جدول حل کنیم 🎯\n\nکد دوستی من: ${player.friendCode}\n\nاپلیکیشن رو نصب کن و با این کد منو اضافه کن!`
                      : `Hey! Let's play Crossword Pro together 🎯\n\nMy friend code: ${player.friendCode}\n\nInstall the app and add me with this code!`;
                    const encoded = encodeURIComponent(text);
                    window.open(`tg://msg?text=${encoded}`, '_blank');
                  }}
                  className="w-full mt-3 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white"
                  style={{ background: 'linear-gradient(135deg,#2ea7e0,#0a84ff)' }}
                >
                  <Send size={16} className={isFA ? '' : 'rotate-180'} />
                  {isFA ? 'دعوت در تلگرام' : 'Invite via Telegram'}
                </button>
              </div>

              <div className="p-5 rounded-3xl" style={{ background: 'rgba(250,244,233,.72)', border: '1px solid var(--cg-hair)' }}>
                <div className="text-[11px] font-black text-[var(--cg-ink3)] uppercase mb-3 tracking-widest">{isFA ? 'افزودن دوست جدید' : 'Add a Friend'}</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3.5 text-center font-mono font-black uppercase text-lg rounded-2xl outline-none transition-all"
                    style={{ background: 'rgba(250,244,233,.8)', border: '2px solid var(--cg-hair)' }}
                    placeholder="CODE"
                    maxLength={6}
                    value={addCode}
                    onChange={e => { setAddCode(e.target.value.toUpperCase()); setAddStatus({ type: 'idle', msg: '' }); }}
                  />
                  <button
                    onClick={handleAddFriend}
                    disabled={addCode.length < 6 || addStatus.type === 'loading'}
                    className="px-4 rounded-2xl shadow-lg disabled:opacity-40 active:scale-95 transition-all text-white"
                    style={{ background: PRIMARY }}
                  >
                    {addStatus.type === 'loading' ? <Spinner size={24} className="animate-spin" /> : <Check size={24} strokeWidth={3} />}
                  </button>
                </div>

                {addStatus.type !== 'idle' && (
                  <p className={`text-xs font-bold mt-3 animate-pulse ${addStatus.type === 'error' ? 'text-[#8E4E37]' : 'text-[#4E5E44]'}`}>
                    {addStatus.msg}
                  </p>
                )}

                {addStatus.type === 'error' && addStatus.msg.includes('Error') && (
                  <div className="mt-3 p-2 rounded-xl text-[9px] text-[#8E4E37] text-left" dir="ltr" style={{ background: 'rgba(255,55,95,.1)' }}>
                    <b>Tip:</b> If this error persists, you may need to update the database schema.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        show={showRemoveConfirm}
        title={isFA ? 'حذف دوست' : 'Remove Friend'}
        message={removeTarget ? (isFA ? `آیا واقعاً می‌خواهید "${removeTarget.name}" را از لیست دوستان حذف کنید؟` : `Are you sure you want to remove "${removeTarget.name}" from friends?`) : ''}
        confirmLabel={isFA ? 'حذف' : 'Remove'}
        cancelLabel={isFA ? 'انصراف' : 'Cancel'}
        variant="danger"
        onConfirm={confirmRemoveFriend}
        onCancel={cancelRemoveFriend}
      />

      {/* BattleInviteDialog: Accept Challenge overlay */}
      {acceptingChallenge && (
        <BattleInviteDialog
          show={true}
          mode="accept"
          language={language}
          playerScore={player.score}
          opponentName={acceptingChallenge.senderName}
          size={joinerSize}
          category={joinerCategory}
          onSizeChange={(s) => setJoinerSize(s)}
          onCategoryChange={(c) => setJoinerCategory(c)}
          opponentSize={acceptingChallenge.payload?.size || 5}
          opponentCategory={acceptingChallenge.payload?.category || 'all'}
          onPrimaryAction={acceptChallengeAction}
          onCancel={() => setAcceptingChallenge(null)}
        />
      )}

      {/* BattleInviteDialog: Send Challenge overlay */}
      {configuringBattleFor && (
        <BattleInviteDialog
          show={true}
          mode="invite"
          language={language}
          playerScore={player.score}
          opponentName={configuringBattleFor.name}
          size={battleSize}
          category={battleCategory}
          onSizeChange={(s) => setBattleSize(s)}
          onCategoryChange={(c) => setBattleCategory(c)}
          onPrimaryAction={sendChallenge}
          onCancel={() => setConfiguringBattleFor(null)}
        />
      )}
    </div>
  );
};
