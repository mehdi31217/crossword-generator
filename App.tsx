
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { GridSize, Language, Category, GameMode, PlayerState, GameView as ViewType, Grid, Clue, StoryBook, CardDef, DictionaryEntry, calcWorldMapStars, type WorldMapCardRarity, type AsyncDuel, type DuelOutcome, type LastPlayedBoard } from './types';
import { generateFreeformGrid } from './utils/freeformGenerator';
import { getLegendChapters, getLegendFinalStory } from './data/worldMapData';
import { getChapterBgImage } from './data/legendImages';
import { MainMenu } from './components/MainMenu';
import { SplashScreen } from './components/SplashScreen';
import { useSocial } from './hooks/useSocial';
import { useTowerModeV2 } from './hooks/useTowerModeV2';
import { useEpicMode } from './hooks/useEpicMode';
import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { usePlayerUI } from './hooks/usePlayerUI';
import { useHintSystem } from './hooks/useHintSystem';
import { useTowerUI } from './hooks/useTowerUI';
import { useMatchmaking } from './hooks/useMatchmaking';
import { useChallengeSystem } from './hooks/useChallengeSystem';
import { useTowerActions } from './hooks/useTowerActions';
import { useGameResultEffects } from './hooks/useGameResultEffects';
import { useCoinFlip } from './hooks/useCoinFlip';
import { useMatchmakingActions } from './hooks/useMatchmakingActions';
import { useNavigation } from './hooks/useNavigation';
import { useWinHandler } from './hooks/useWinHandler';
import { useInitEffects } from './hooks/useInitEffects';
import { useTowerLossEffects } from './hooks/useTowerLossEffects';
import { useSyncEffects } from './hooks/useSyncEffects';

import ErrorBoundary from './components/ErrorBoundary';
import { GameViews } from './components/GameViews';
import { CardStoryModal } from './components/CardStoryModal';
import { WorldMapStoryModal } from './components/WorldMapStoryModal';
import { WorldMapCompleteModal } from './components/WorldMapCompleteModal';
import { WorldMapCardRevealModal } from './components/WorldMapCardRevealModal';
import { useGameLogic } from './hooks/useGameLogic';
import { useMultiplayerState } from './hooks/useMultiplayerState';
import { gameServer } from './utils/gameServer';
import { duelCounters } from './utils/duelScoring';

// Eager components (small, always available)
import { Toast } from './components/Toast';
import { OnboardingGuide } from './components/OnboardingGuide';
import { ScrollUnlockCeremonyModal, ScrollCeremonyPayload } from './components/ScrollUnlockCeremonyModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getSetGrandeurInfo } from './utils/progression';
import { soundEngine } from './utils/soundEngine';

// Lazy-loaded components (modals — only loaded when their view is active)
const GameModals = React.lazy(() => import('./components/GameModals').then(m => ({ default: m.GameModals })));

type TowerRunState = {
    floor: number;
    loot: number;
    isActive: boolean;
};

const App: React.FC = () => {
  // --- SPLASH STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(
      () => !localStorage.getItem('crossword_onboarding_seen')
  );

  const [view, setView] = useState<ViewType>('menu');
  const [size, setSize] = useState<GridSize>(5);
  const [language, setLanguage] = useState<Language>('fa');
  const [category, setCategory] = useState<Category>('knowledge');
  const [isDaily, setIsDaily] = useState(false);
  const [player, setPlayer] = useState<PlayerState | null>(null);
  
  // Track what mode we're in: casual, tower, multiplayer, or story
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('casual');

  // Initialize Web Audio context for SFX on first user interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      soundEngine.initContext();
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);
  
  const { showAuthModal, setShowAuthModal, pendingScore, setPendingScore, handleRegister } = useAuth();
  const { showProfileModal, setShowProfileModal, shopOpen, setShopOpen, handleProfileUpdate, handleShopPurchase } = usePlayerUI();
  const [showHintModal, setShowHintModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDbSetupModal, setShowDbSetupModal] = useState(false); 
  const [showMultiplayerRetryModal, setShowMultiplayerRetryModal] = useState(false);
  const {
      showTowerLossModal, setShowTowerLossModal,
      showTowerCashOutModal, setShowTowerCashOutModal,
      showTowerQuitConfirm, setShowTowerQuitConfirm,
      towerLossReason, setTowerLossReason,
      isCashingOut, setIsCashingOut,
      livesShaking, setLivesShaking,
  } = useTowerUI();
  const [mergedCategories, setMergedCategories] = useState<[Category, Category] | null>(null);
  const [finalCategory, setFinalCategory] = useState<Category | null>(null);
  const [finalSize, setFinalSize] = useState<GridSize | null>(null);

  // World Map Legend State
  const [selectedLegend, setSelectedLegend] = useState<{
    id: string;
    name: { fa: string; en: string };
    color: string;
    icon: string;
    country: { fa: string; en: string };
  } | null>(null);
  const [showWorldMapStoryModal, setShowWorldMapStoryModal] = useState(false);
  const [pendingWorldMapChapter, setPendingWorldMapChapter] = useState<import('./types').WorldMapChapter | null>(null);
  const [unlockedChapters, setUnlockedChapters] = useState<Record<string, number>>({});
  const [showWorldMapCompleteModal, setShowWorldMapCompleteModal] = useState(false);
  const [completingLegend, setCompletingLegend] = useState<{
    id: string;
    name: { fa: string; en: string };
    color: string;
    icon: string;
    country: { fa: string; en: string };
  } | null>(null);
  const [completingFinalStory, setCompletingFinalStory] = useState<{ fa: string; en: string } | null>(null);
  const [completingBgImage, setCompletingBgImage] = useState<string | null>(null);
  const [showCardReveal, setShowCardReveal] = useState(false);
  const [revealedCard, setRevealedCard] = useState<{
    chapterId?: string;
    chapterTitle: { fa: string; en: string };
    chapterSubtitle: { fa: string; en: string };
    rarity: import('./types').WorldMapCardRarity;
    legendColor: string;
    legendIcon: string;
    legendName: { fa: string; en: string };
    matchScore: number;
    finalSeconds: number;
    wordCount: number;
    bgImage: string | null;
  } | null>(null);
  const isWorldMapGameRef = useRef(false);
  const worldMapChapterRef = useRef<import('./types').WorldMapChapter | null>(null); // persists across game
  const worldMapBgImageRef = useRef<string | null>(null); // bg image for grid during gameplay
  const worldMapWordCountRef = useRef<number>(0); // actual word count from the generated grid

  // ── World Map Card Progress ──
  const WORLD_MAP_CARD_KEY = 'crossword_worldmap_cards';
  const loadWorldMapCardProgress = (): Record<string, WorldMapCardRarity> => {
    try {
      const raw = localStorage.getItem(WORLD_MAP_CARD_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const [worldMapCardProgress, setWorldMapCardProgress] = useState<Record<string, WorldMapCardRarity>>(loadWorldMapCardProgress);
  const saveWorldMapCardProgress = (cards: Record<string, WorldMapCardRarity>) => {
    try { localStorage.setItem(WORLD_MAP_CARD_KEY, JSON.stringify(cards)); } catch { /* storage full / unavailable */ }
    setWorldMapCardProgress(cards);
    if (player && player.id !== 'guest') {
      gameServer.syncWorldMapCards(cards).catch(() => {});
    }
    console.log('[WorldMap] Card progress saved:', JSON.stringify(cards));
  };

  // The account owns the collection. On each login, union this device's cards
  // with the server's copy and push the result back — the server merges
  // monotonically, so nothing earned on another device (or in a stale tab) is
  // ever lost.
  const cardsSyncedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!player || player.id === 'guest') return;
    if (cardsSyncedForRef.current === player.id) return;
    cardsSyncedForRef.current = player.id;

    const serverCards = player.worldmapCards || {};
    const merged: Record<string, WorldMapCardRarity> = { ...serverCards };
    for (const [id, rarity] of Object.entries(worldMapCardProgress)) {
      if (!merged[id] || rarity > merged[id]) merged[id] = rarity;
    }
    const mergedJson = JSON.stringify(merged);
    if (mergedJson === JSON.stringify(worldMapCardProgress)) return;

    try { localStorage.setItem(WORLD_MAP_CARD_KEY, mergedJson); } catch { /* ignore */ }
    setWorldMapCardProgress(merged);
    if (JSON.stringify(serverCards) !== mergedJson) {
      gameServer.syncWorldMapCards(merged).catch(() => {});
    }
  }, [player?.id]);

  const [animatingChapterIndex, setAnimatingChapterIndex] = useState<number | null>(null);

  // ── Async duels: the last finished board is the one you can send as a duel ──
  const LAST_BOARD_KEY = 'crossword_last_board';
  const loadLastBoard = (): LastPlayedBoard | null => {
    try {
      const raw = localStorage.getItem(LAST_BOARD_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.board && parsed.board.grid ? parsed : null;
    } catch { return null; }
  };
  const [lastBoard, setLastBoard] = useState<LastPlayedBoard | null>(loadLastBoard);
  const duelSessionRef = useRef<AsyncDuel | null>(null);
  const [duelOutcome, setDuelOutcome] = useState<DuelOutcome | null>(null);
  // A duel replay also flips `gameWon`; the verdict is decided server-side.
  const [isDuelReplay, setIsDuelReplay] = useState(false);
  // Kept separately because the live verdict chip needs the creator's name and
  // points while the replay is running.
  const [duelReplay, setDuelReplay] = useState<AsyncDuel | null>(null);
  // Abandoning a duel mid-game must not silence the next solo win's shower.
  useEffect(() => {
    if (view !== 'playing') { setIsDuelReplay(false); setDuelReplay(null); }
  }, [view]);

  /** Keep the most recent finished solo board so it can become a duel later. */
  const saveLastBoard = (entry: LastPlayedBoard) => {
    setLastBoard(entry);
    try { localStorage.setItem(LAST_BOARD_KEY, JSON.stringify(entry)); } catch { /* storage full */ }
  };

  // Clean up legend state when leaving world map entirely (not between map/chapters switching)
  useEffect(() => {
    if (view !== 'world_map' && view !== 'world_map_chapters' && view !== 'playing') {
      setSelectedLegend(null);
    }
    // Clean up world map game ref if leaving playing view without winning
    if (view !== 'playing') {
      isWorldMapGameRef.current = false;
      worldMapChapterRef.current = null;
      worldMapBgImageRef.current = null;
      worldMapWordCountRef.current = 0;
    }
  }, [view]);

  // Load saved world map progress from localStorage on mount + sync on cg-cards-updated
  useEffect(() => {
    try {
      const saved = localStorage.getItem('crossword_worldmap_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          setUnlockedChapters(parsed);
        }
      }
    } catch {}

    const onCardsUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.worldmapCards) {
        setWorldMapCardProgress((prev) => ({ ...prev, ...detail.worldmapCards }));
      }
      if (detail?.worldmapProgress) {
        setUnlockedChapters((prev) => ({ ...prev, ...detail.worldmapProgress }));
      }
      if (detail?.player) {
        setPlayer(detail.player);
      }
    };
    window.addEventListener('cg-cards-updated', onCardsUpdated);
    return () => window.removeEventListener('cg-cards-updated', onCardsUpdated);
  }, []);

  // Battle Wager State
  const [battleWager, setBattleWager] = useState<number>(0);

  // Arena State
  const [myPendingGameId, setMyPendingGameId] = useState<string | null>(null);
  const [pendingGames, setPendingGames] = useState<{ gameId: string; mode: GameMode; wager: number; mine?: boolean }[]>([]);
  const [pendingGamesLoading, setPendingGamesLoading] = useState<string | null>(null); // gameId being joined

  // --- CARDS COLLECTION ---
  const CARD_STORAGE_KEY = 'crossword_card_progress';
  const loadUnlockedCards = (): Record<string, { stars: number }> => {
    try {
      const raw = localStorage.getItem(CARD_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  };
  const [unlockedCards, setUnlockedCards] = useState<Record<string, { stars: number }>>(loadUnlockedCards);
  const saveUnlockedCards = (cards: Record<string, { stars: number }>) => {
    try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(cards)); } catch { /* storage full / unavailable */ }
    setUnlockedCards(cards);
  };
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);
  const [showCardStoryModal, setShowCardStoryModal] = useState(false);
  const isCardGameRef = useRef<string | null>(null); // card.id when playing a card puzzle
  const challengeRef = useRef<any>(null);

  // League trophy change display
  const [trophyChange, setTrophyChange] = useState<number>(0);

  const selectedCellRef = useRef<{r: number, c: number} | null>(null);
  const matchScoreRef = useRef<number>(0);
  
  const gameActionsRef = useRef<{
      triggerSmartNavigation?: (g: string[][]) => void;
      setExternalGrid?: (g: Grid, c: { across: Clue[], down: Clue[] }) => void;
      setGameWon?: (w: boolean) => void;
      setIsTimerActive?: (a: boolean) => void;
      manualLose?: () => void; // Added for Tower
  }>({});

  const { isMatchmaking, setIsMatchmaking, matchmakingStatus, setMatchmakingStatus, matchmakingOpponentRef, matchmakingPollRef, matchmakingHandlerRef } = useMatchmaking();

  const { toast, showToast, hideToast } = useToast();

  // Story State (using useEpicMode hook)
  const epicMode = useEpicMode();
  const { selectedBook, showStoryModal, lastWinStars, setSelectedBook, setShowStoryModal, setLastWinStars } = epicMode;

  const [entranceKey, setEntranceKey] = useState(0);
  const [pendingChapterId, setPendingChapterId] = useState<number | null>(null);
  const pendingChapterRef = useRef<number | null>(null);

  // Tower State V2 (using new useTowerModeV2 hook)
  const towerModeV2 = useTowerModeV2();
  const { 
    runState, 
    currentFloorConfig, 
    showShop, 
    startTowerRun, 
    handleMistake, 
    completeFloor, 
    advanceToNextFloor, 
    cashOut, 
    gameOver, 
    timeOver,
    buyShopItem, 
    setShowShop,
    shopItems,
    getTowerFloorConfig
  } = towerModeV2;

  const towerTimeLimit = runState.isActive ? currentFloorConfig?.timeLimit : undefined;

  const {
      friends, allOnlinePlayers, notifications, notificationsReady, setNotifications, messages, typingUsers, unreadCounts, loadChatHistory, refreshFriends,
      refreshNotifications, sendMessage, sendTyping, deleteNotification, markChatRead, setActiveChat
  } = useSocial(player, (msg: string, rawMsg?: any) => {
      if (msg === 'challenge_cancelled') {
          challengeRef.current?.setIncomingChallenge(null);
          challengeRef.current?.setShowChallengeAcceptDialog(false);
          setNotifications(prev => prev.filter(n => n.type !== 'challenge'));
          refreshNotifications();
          showToast(language === 'fa' ? 'دعوت‌نامه توسط سازنده لغو شد' : 'Challenge cancelled by inviter');
          return;
      }
      if (msg === 'challenge_rejected') {
          multiplayerState.leaveRoom().then(() => {
              game.resetGame();
              setCurrentGameMode('casual');
              setView('menu');
              setMergedCategories(null);
              setFinalCategory(null);
              setFinalSize(null);
              hasGeneratedForOpponentRef.current = false;
              if (challengeRef.current) challengeRef.current.challengeGuestPref.current = null;
          });
          showToast(language === 'fa' ? 'حریف دعوت شما را رد کرد' : 'Opponent declined your challenge');
          return;
      }
      if (msg === 'challenge_accepted') {
          showToast(language === 'fa' ? 'حریف دعوت را پذیرفت و به اتاق پیوست' : 'Opponent accepted your challenge and joined');
          if (rawMsg?.joinerSize) {
              if (challengeRef.current) challengeRef.current.challengeGuestPref.current = { size: rawMsg.joinerSize as GridSize, category: rawMsg.joinerCategory as Category };
          }
          return;
      }
      if (msg === 'matchmaking_matched') {
          if (matchmakingHandlerRef.current) {
              matchmakingHandlerRef.current(rawMsg);
          }
          return;
      }
      if (msg === 'arena:matched') {
          if (matchmakingActions.handleArenaMatched) {
              matchmakingActions.handleArenaMatched(rawMsg);
          }
          setMyPendingGameId(null); // Clear pending game state since we matched
          return;
      }
      if (msg === 'matchmaking_timeout') {
          setMatchmakingStatus('timeout');
          setMatchmakingStatus('idle');
          setIsMatchmaking(false);
          showToast(language === 'fa' ? 'وقت جستجوی حریف تمام شد' : 'Matchmaking timed out', 'error');
          return;
      }
      showToast(msg);
  });

  // ── Duel challenges: badge on the menu tile + a toast when one lands ──
  // Invitations only lived in the inbox, and the inbox is two taps away, so a
  // friend's challenge could sit unseen for days. The badge counts *unanswered*
  // invitations from the server (notifications stay around after being played),
  // and an invitation that arrives while the page is open gets a toast.
  const [pendingChallenges, setPendingChallenges] = useState(0);
  const duelNotifSignature = notifications
      .filter((n: any) => n.type === 'duel')
      .map((n: any) => n.id)
      .join(',');
  // Freshness is decided by arrival, not by the row's timestamp: the first batch
  // that lands after the page opens is history (those invites were already
  // waiting), and anything that shows up afterwards is news worth a toast.
  const seenDuelNotifsRef = useRef<{ playerId: string | null; ids: Set<string> }>({ playerId: null, ids: new Set() });

  useEffect(() => {
      if (!notificationsReady || !player?.id) return;
      const invites = notifications.filter((n: any) => n.type === 'duel');
      if (seenDuelNotifsRef.current.playerId !== player.id) {
          // First batch for this account (and a clean slate when the account changes).
          seenDuelNotifsRef.current = {
              playerId: player.id,
              ids: new Set(invites.map((n: any) => String(n.id))),
          };
          return;
      }
      for (const n of invites) {
          const id = String(n.id);
          if (seenDuelNotifsRef.current.ids.has(id)) continue;
          seenDuelNotifsRef.current.ids.add(id);
          const name = (n as any).payload?.senderName || (n as any).payload?.fromName
              || (n as any).senderName
              || (language === 'fa' ? 'یک دوست' : 'A friend');
          showToast(
              language === 'fa' ? `⚔️ ${name} تو را به چالش دعوت کرد` : `⚔️ ${name} invited you to a challenge`,
              'success',
          );
      }
      // Keyed on the signature: `notifications` is a fresh array every 5s poll.
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duelNotifSignature, language, notificationsReady, player?.id]);

  useEffect(() => {
      let alive = true;
      const load = async () => {
          if (!player?.id || player.id === 'guest') { setPendingChallenges(0); return; }
          try {
              const data = await gameServer.listDuels();
              if (alive) setPendingChallenges((data.incoming || []).filter(d => d.status === 'open').length);
          } catch {
              // The badge is best-effort: a failed poll must never disturb play.
          }
      };
      load();
      const id = window.setInterval(load, 60_000);
      return () => { alive = false; window.clearInterval(id); };
  }, [player?.id, duelNotifSignature]);

  const multiplayerState = useMultiplayerState(player, selectedCellRef, matchScoreRef,
    (newG) => gameActionsRef.current.triggerSmartNavigation?.(newG),
    async (g, c, cat, m) => {
        // --- GAME START HANDLER ---
        setCategory(cat);
        gameActionsRef.current.setExternalGrid?.(g, c);
        // Brief pause so overlay transition is visible
        await new Promise(r => setTimeout(r, 800));
        setView('playing');
        
        // The wager is escrowed SERVER-side (POST /api/battle/escrow) as soon as
        // the client learns its roomId — see useMatchmakingActions. It used to be
        // deducted here locally, which a client could simply skip; the matching
        // local-only refund on leaving was an unlimited coin mint.
    }, 
    () => {
        gameActionsRef.current.setGameWon?.(true);
        gameActionsRef.current.setIsTimerActive?.(false);
    }
  );

  const [scrollCeremony, setScrollCeremony] = useState<ScrollCeremonyPayload | null>(null);
  const gameRef = useRef<any>(null);
  const handleWin = useWinHandler(
      setPendingScore, setLastWinStars,
      view, runState, completeFloor,
      player, setPlayer,
      isDaily, size, category, currentGameMode,
      multiplayerState, selectedBook, matchScoreRef, gameRef,
      setTrophyChange,
      showToast,
      language,
      (completedBook) => {
        const setId = `book_${completedBook.id}`;
        const grandeur = getSetGrandeurInfo(setId, completedBook.chapters.length);
        setScrollCeremony({
          setId,
          titleFa: completedBook.title,
          coverImage: completedBook.coverImage,
          totalCards: completedBook.chapters.length,
          coinsAwarded: grandeur.rewardCoins,
          polishSealsAwarded: grandeur.rewardPolishTokens,
        });
      },
  );

  // Wrap handleWin to detect card mode → save stars to cards collection instead
  const wrappedHandleWin = React.useCallback(async (matchScore: number, finalSeconds: number, starCount: number = 1) => {
    console.log('[WW] wrappedHandleWin called', { matchScore, finalSeconds, starCount, isCardGame: isCardGameRef.current, isWorldMap: isWorldMapGameRef.current, hasSelectedLegend: !!selectedLegend });

    // ── Async duel replay finished ──
    // The server owns the duel rewards, so this path must NOT run the solo win
    // flow (no coins/trophies for a duel; the comparison decides the payout).
    const duel = duelSessionRef.current;
    if (duel) {
      duelSessionRef.current = null;
      const g = gameRef.current;
      const total = g?.grid ? g.grid.flat().filter((c: any) => !c.isBlack).length : 0;
      try {
        const res = await gameServer.submitDuelResult(duel.id, {
          score: matchScore,
          seconds: Math.round(finalSeconds),
          solved: total,
          total,
          completed: true,
          ...duelCounters(g),
        });
        setDuelOutcome({ duel: res.duel, outcome: res.outcome, coins: res.coins ?? null, reward: res.reward ?? null });
        if (typeof res.coins === 'number') {
          setPlayer(prev => (prev ? { ...prev, coins: res.coins as number } : prev));
        }
        if (res.outcome === 'win') {
          const { default: confetti } = await import('canvas-confetti');
          confetti({ particleCount: 200, spread: 110, origin: { y: 0.45 }, colors: ['#f59e0b', '#fbbf24', '#fff', '#8b5cf6'] });
          setTimeout(() => confetti({ particleCount: 90, spread: 70, angle: 60, origin: { x: 0.2, y: 0.4 }, colors: ['#ec4899', '#f472b6'] }), 350);
          setTimeout(() => confetti({ particleCount: 90, spread: 70, angle: 120, origin: { x: 0.8, y: 0.4 }, colors: ['#06b6d4', '#22d3ee'] }), 650);
        }
      } catch (e: any) {
        showToast(
          e?.message || (language === 'fa' ? 'ثبت نتیجه دوئل ناموفق بود' : 'Could not submit the duel result'),
          'error',
        );
      }
      setIsDuelReplay(false);
      gameRef.current?.resetGame?.();
      setView('duel');
      return;
    }

    // Remember this board so it can be sent as a duel later (solo games only).
    const finished = gameRef.current;
    if (finished?.grid && finished?.clues && !isCardGameRef.current && !isWorldMapGameRef.current) {
      const total = finished.grid.flat().filter((c: any) => !c.isBlack).length;
      saveLastBoard({
        board: {
          grid: finished.grid,
          clues: [...(finished.clues.across || []), ...(finished.clues.down || [])],
        },
        category,
        language,
        size: (finished.grid.length || size) as GridSize,
        result: {
          score: matchScore,
          seconds: Math.round(finalSeconds),
          solved: total,
          total,
          completed: true,
          ...duelCounters(finished),
        },
        at: Date.now(),
      });
    }

    const cardId = isCardGameRef.current;
    if (cardId) {
      // Card mode: save stars, don't touch player score/trophy
      isCardGameRef.current = null;
      const updated = { ...unlockedCards };
      const existing = updated[cardId];
      if (!existing || starCount > existing.stars) {
        updated[cardId] = { stars: starCount };
        saveUnlockedCards(updated);
      }
      // Sync card progress to server
      if (player && player.id !== 'guest') {
        const syncedPlayer = { ...player, cardProgress: { ...updated } };
        gameServer.savePlayer(syncedPlayer);
        gameServer.syncPlayer(syncedPlayer).catch(() => {});
      }
      game.resetGame();
      setSelectedCard(null);
      setView('cards');
      showToast(
        language === 'fa'
          ? `⭐ ${starCount} ستاره کسب کردی!`
          : `⭐ Earned ${starCount} star${starCount > 1 ? 's' : ''}!`,
        'success'
      );
      return;
    }
    // World Map chapter game: save card + navigate to chapters IMMEDIATELY
    // (handleWin runs in background for stats, NOT awaited — avoids delay)
    if (isWorldMapGameRef.current) {
      console.log('[WW] World map game detected, saving card progress...', { chapter: worldMapChapterRef.current?.id, legendId: selectedLegend?.id });
      isWorldMapGameRef.current = false;
      const chapter = worldMapChapterRef.current;
      worldMapChapterRef.current = null;
      // Fire handleWin in background for stats (don't await — saves 1-5s network wait)
      handleWin(matchScore, finalSeconds, starCount).catch(() => {});
      const legendId = selectedLegend?.id;
      if (legendId && chapter) {
        const chapters = getLegendChapters(legendId);
        const chapterIdx = chapter.chapterIndex;
        const newLevel = Math.max(chapterIdx + 1, unlockedChapters[legendId] || 0);
        const updated = { ...unlockedChapters, [legendId]: newLevel };
        setUnlockedChapters(updated);
        try { localStorage.setItem('crossword_worldmap_progress', JSON.stringify(updated)); } catch {}

        // Calculate and save card rarity based on performance
        const wordCount = worldMapWordCountRef.current || chapter.words.length;
        worldMapWordCountRef.current = 0;
        const rarity = calcWorldMapStars(matchScore, finalSeconds, wordCount);
        const existing = worldMapCardProgress[chapter.id];
        if (!existing || rarity > existing) {
          const cardUpdated = { ...worldMapCardProgress, [chapter.id]: rarity };
          saveWorldMapCardProgress(cardUpdated);
        }
        if (rarity >= 3) {
          gameServer.grantPolishSeal(1);
        }

        // Set up card reveal modal data
        if (selectedLegend) {
          setRevealedCard({
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            chapterSubtitle: chapter.subtitle || { fa: '', en: '' },
            rarity,
            legendColor: selectedLegend.color,
            legendIcon: selectedLegend.icon,
            legendName: selectedLegend.name,
            matchScore,
            finalSeconds,
            wordCount,
            bgImage: getChapterBgImage(chapter.id),
          });
          setShowCardReveal(true);
        }

        // Navigate to chapters with card fly-in animation — IMMEDIATELY
        setView('world_map_chapters');
        setAnimatingChapterIndex(chapter.chapterIndex);
        setTimeout(() => setAnimatingChapterIndex(null), 1200);

        // If all chapters done, award bonus coins + show completion modal
        if (selectedLegend && newLevel >= chapters.length) {
          const finalStory = getLegendFinalStory(legendId);
          if (finalStory) {
            // Award completion bonus coins (150 coins)
            const completionBonusCoins = 150;
            setPlayer(prev => prev ? { ...prev, coins: (prev.coins || 0) + completionBonusCoins } : prev);
            try {
              const raw = localStorage.getItem('crossword_economy_state');
              const parsed = raw ? JSON.parse(raw) : {};
              parsed.coins = (parsed.coins || 0) + completionBonusCoins;
              localStorage.setItem('crossword_economy_state', JSON.stringify(parsed));
            } catch {}

            setCompletingLegend({
              id: selectedLegend.id,
              name: selectedLegend.name,
              color: selectedLegend.color,
              icon: selectedLegend.icon,
              country: { fa: '', en: '' },
            });
            setCompletingFinalStory(finalStory);
            setCompletingBgImage(getChapterBgImage(chapter.id));
            setShowWorldMapCompleteModal(true);
          }
        }
      }
      return;
    }

    // Non-world-map path: await handleWin normally
    try {
      await handleWin(matchScore, finalSeconds, starCount);
    } catch (err) {
      console.warn('handleWin failed:', err);
    }
  }, [handleWin, unlockedCards, language, showToast, selectedLegend, unlockedChapters, worldMapCardProgress, category, size]);

  const game = useGameLogic(size, language, category, wrappedHandleWin);

  /**
   * Replay an accepted duel: the board snapshot is loaded as-is (same grid, same
   * clues), the clock restarts at zero, and the run is flagged so the next win
   * submits a duel result instead of the solo win flow.
   */
  const startDuelGame = (duel: AsyncDuel) => {
    const board = duel.board;
    if (!board || !Array.isArray(board.grid) || !Array.isArray(board.clues)) {
      showToast(language === 'fa' ? 'جدول این دوئل پیدا نشد' : 'Duel board missing', 'error');
      return;
    }
    duelSessionRef.current = duel;
    setDuelOutcome(null);
    setIsDuelReplay(true);
    setDuelReplay(duel);
    setCurrentGameMode('casual');
    setCategory(duel.category);
    setSize(board.grid.length as GridSize);
    game.resetGame();
    gameActionsRef.current.setExternalGrid?.(board.grid, {
      across: board.clues.filter(c => c.direction === 'across'),
      down: board.clues.filter(c => c.direction === 'down'),
    });
    setView('playing');
  };

  // Wire onOpponentWordSolvedRef — triggers cursor navigation on EVERY opponent
  // word_solved, not just when the cursor directly collides with a solved cell.
  // Handles the case where the user's activeClue intersects the opponent's solved
  // word (e.g., across/down sharing cells) but the cursor wasn't on the exact cell.
  multiplayerState.onOpponentWordSolvedRef.current = () => {
    if (game.userGridRef.current?.length) {
      gameActionsRef.current.triggerSmartNavigation?.(game.userGridRef.current);
    }
  };

  // Init effects: debug keyboard shortcut, theme+player init, story modal, beforeunload
  useInitEffects(
      player,
      currentGameMode,
      view,
      multiplayerState,
      setPlayer,
      setShowDbSetupModal,
      setShowStoryModal,
      game.currentChapterIndex,
      game.grid,
  );


  // Tower loss effects: life shake + loss detection
  useTowerLossEffects(
      view,
      runState,
      currentFloorConfig,
      { seconds: game.seconds },
      isCashingOut,
      { setLivesShaking, setTowerLossReason, setShowTowerLossModal },
  );

  // Game result effects: league trophy, victory confetti (SP + MP)
  useGameResultEffects(
      { gameWon: game.gameWon },
      currentGameMode,
      multiplayerState,
      player,
      setPlayer,
      setTrophyChange,
      showToast,
      language,
      battleWager,
      isDuelReplay,
  );

  // Coin flip + grid generation logic (preferences, coin flip, callback setup, grid gen for host)
  const { hasGeneratedForOpponentRef, handleCoinFlipComplete } = useCoinFlip(
      player,
      currentGameMode,
      category,
      size,
      language,
      { grid: game.grid, loadingStage: game.loadingStage, setGameWon: game.setGameWon, setIsTimerActive: game.setIsTimerActive, generateGrid: game.generateGrid },
      multiplayerState as any,
      mergedCategories,
      finalCategory,
      finalSize,
      showMultiplayerRetryModal,
      challengeRef,
      {
          setMergedCategories,
          setFinalCategory,
          setFinalSize,
          setCategory,
          setSize,
          setShowMultiplayerRetryModal,
          resetGame: game.resetGame,
      },
  );

  // Auto-trigger coin flip completion (replaces CoinFlipSelection's animation-complete callback)
  // Use ref to avoid stale-closure timer resets (handleCoinFlipComplete is recreated each render)
  const coinFlipAutoTriggeredRef = useRef(false);
  const coinFlipHandlerRef = useRef(handleCoinFlipComplete);
  coinFlipHandlerRef.current = handleCoinFlipComplete;
  useEffect(() => {
    if (currentGameMode !== 'multiplayer' || !multiplayerState.showCoinFlip) {
      coinFlipAutoTriggeredRef.current = false;
      return;
    }
    if (
      view === 'playing' &&
      multiplayerState.myPreference &&
      multiplayerState.opponentPreference &&
      !coinFlipAutoTriggeredRef.current
    ) {
      coinFlipAutoTriggeredRef.current = true;
      const t = setTimeout(() => {
        const mergedSize = Math.round(Math.sqrt(
          multiplayerState.myPreference!.size * multiplayerState.opponentPreference!.size
        )) as GridSize;
        coinFlipHandlerRef.current(multiplayerState.myPreference!.category, mergedSize);
      }, 2000); // 2s for visual step animation
      return () => clearTimeout(t);
    }
  }, [view, currentGameMode, multiplayerState.showCoinFlip, multiplayerState.myPreference, multiplayerState.opponentPreference]);

  // Arena: poll pending games when lobby is open
  useEffect(() => {
    if (view !== 'lobby') return;
    const poll = async () => {
      const games = await gameServer.fetchArenaGames();
      setPendingGames(games);
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [view]);

  // Navigation functions: returnToMenu, onGenerateClick, onPlayEpicChapter, handleInput, handleHomeClick
  const nav = useNavigation(
      player,
      language,
      currentGameMode,
      category,
      size,
      view,
      {
          resetGame: game.resetGame,
          generateGrid: game.generateGrid,
          handleKeyPress: game.handleKeyPress,
          handleBackspace: game.handleBackspace,
          handleNavigateClue: game.handleNavigateClue,
          toggleDirection: game.toggleDirection,
          canToggleDirection: game.canToggleDirection,
          grid: game.grid,
          gameWon: game.gameWon,
          gameLost: game.gameLost,
          loadingStage: game.loadingStage,
      },
      {
          roomId: multiplayerState.roomId,
          leaveRoom: multiplayerState.leaveRoom,
          forfeitGame: multiplayerState.forfeitGame,
          createRoom: multiplayerState.createRoom,
          joinRoom: multiplayerState.joinRoom,
          setGameStarted: multiplayerState.setGameStarted,
          isHost: multiplayerState.isHost,
          gameMode: multiplayerState.gameMode,
          isFrozen: multiplayerState.isFrozen,
          waitingForHost: multiplayerState.waitingForHost,
          finalResult: multiplayerState.finalResult,
      },
      runState,
      selectedBook,
      battleWager,
      mergedCategories,
      finalCategory,
      finalSize,
      hasGeneratedForOpponentRef,
      challengeRef,
      handleMistake,
      setShowTowerQuitConfirm,
      {
          setView,
          setCurrentGameMode,
          setSize,
          setCategory,
          setIsDaily,
          setPlayer,
          setMergedCategories,
          setFinalCategory,
          setFinalSize,
          setShowLeaveConfirm,
          setShowTowerQuitConfirm,
          setPendingChapter: (id: number | null) => { pendingChapterRef.current = id; setPendingChapterId(id); },
          setShowStoryModal,
          setSelectedBook,
      },
      showToast,
  );

  // A duel board is built with the player's own size + topic, but
  // `onGenerateClick` closes over the CURRENT `size`/`category`. The pick is
  // stashed in a ref, the state update commits, and this effect then generates
  // with the freshly applied settings (once — the ref is consumed immediately).
  const duelBuildRef = useRef<{ size: GridSize; category: Category } | null>(null);
  const [duelBuildTick, setDuelBuildTick] = useState(0);
  useEffect(() => {
    if (!duelBuildRef.current) return;
    duelBuildRef.current = null;
    void nav.onGenerateClick(false);
  }, [duelBuildTick, nav]);

  // --- TOWER V2 LOGIC FUNCTIONS ---
  const towerActions = useTowerActions(
      player,
      language,
      showToast,
      { setView, setCurrentGameMode, setSize, setCategory, setPlayer, setShowShop },
      {
          runState,
          currentFloorConfig,
          startTowerRun,
          advanceToNextFloor,
          cashOut,
          gameOver,
          getTowerFloorConfig,
      },
      {
          setIsCashingOut,
          setShowTowerCashOutModal,
          setShowTowerQuitConfirm,
          setTowerLossReason,
          setShowTowerLossModal,
      },
      { resetGame: game.resetGame, generateGrid: game.generateGrid, setGameWon: game.setGameWon, setGameLost: game.setGameLost },
  );

  // Matchmaking actions (create room, quick match, join, retry, cancel)
  const matchmakingActions = useMatchmakingActions(
      player,
      language,
      showToast,
      currentGameMode,
      category,
      {
          createRoom: multiplayerState.createRoom,
          createRoomWithId: multiplayerState.createRoomWithId,
          joinRoom: multiplayerState.joinRoom,
          setGameStarted: multiplayerState.setGameStarted,
          gameMode: multiplayerState.gameMode,
          isHost: multiplayerState.isHost,
          setMatchType: multiplayerState.setMatchType,
      },
      {
          resetGame: game.resetGame,
          generateGrid: game.generateGrid,
          setUserGrid: game.setUserGrid,
          userGridRef: game.userGridRef,
      },
      {
          matchmakingPollRef,
          matchmakingOpponentRef,
          matchmakingHandlerRef,
          setMatchmakingStatus,
          setIsMatchmaking,
      },
      {
          setView,
          setBattleWager,
          setCurrentGameMode,
          setShowMultiplayerRetryModal,
          resetGame: game.resetGame,
          setPlayer,
      },
      nav.returnToMenu,
      mergedCategories,
      finalSize,
  );

  // Challenge System — all challenge state, handlers, and effects
  const challengeState = useChallengeSystem(
      player ?? null,
      (p) => { if (p) setPlayer(p); },
      language,
      showToast,
      view,
      {
          setView,
          setSize,
          setCategory,
          setCurrentGameMode,
          setBattleWager,
          setShowMultiplayerRetryModal,
          resetGame: game.resetGame,
      },
      game.setUserGrid,
      game.userGridRef,
      {
          createRoom: multiplayerState.createRoom,
          createRoomWithId: multiplayerState.createRoomWithId,
          joinRoom: multiplayerState.joinRoom,
          leaveRoom: multiplayerState.leaveRoom,
          waitingForHost: multiplayerState.waitingForHost,
          setMatchType: multiplayerState.setMatchType,
      },
      notifications,
      setNotifications,
      refreshNotifications,
  );

  // Sync effects: gameRef, gameActionsRef, multiplayer progress, selectedCell, joinError, challengeRef
  useSyncEffects(
      gameRef,
      game,
      gameActionsRef,
      matchScoreRef,
      currentGameMode,
      player,
      multiplayerState,
      selectedCellRef,
      challengeRef,
      challengeState,
      showToast,
      nav.returnToMenu,
  );

  const { handleRevealCell, handleRevealWord } = useHintSystem(
      game, player, setPlayer, wrappedHandleWin, showToast, setShowHintModal, language
  );

  // ─── CARD GAME FLOW ─────────────────────────────────────────────
  // When user selects a card from the gallery → show story modal
  useEffect(() => {
    if (selectedCard && !showCardStoryModal && view === 'cards') {
      setShowCardStoryModal(true);
    }
  }, [selectedCard]);

  // Free tower ticket — the SERVER meters it (one per refill window, capped), so
  // the client only mirrors the count it returns. This used to increment the local
  // count with no server call at all: an unlimited mint of a consumable the shop
  // sells for 30 coins.
  const handleGetFreeTicket = async () => {
    if (!player) return;
    const res = await gameServer.claimFreeTicket();
    const newTickets = res.towerTickets;
    if (res.ok && typeof newTickets === 'number') {
      setPlayer(prev => {
        if (!prev) return prev;
        const updated = { ...prev, towerTickets: newTickets, lastTicketRefill: res.lastTicketRefill ?? prev.lastTicketRefill };
        gameServer.savePlayer(updated);
        return updated;
      });
      showToast(language === 'fa' ? 'یک بلیط رایگان گرفتی! 🎫' : 'Got a free ticket! 🎫', 'success');
      return;
    }
    if (res.atCap) {
      showToast(language === 'fa' ? 'بلیت‌هایت پُر است!' : 'Your tickets are already full!', 'error');
      return;
    }
    if (res.cooldown) {
      showToast(
        language === 'fa' ? 'بلیط رایگان بعدی هنوز آماده نشده' : 'Your next free ticket is not ready yet',
        'error'
      );
      return;
    }
    showToast(language === 'fa' ? 'دریافت بلیط ناموفق بود' : 'Could not claim the free ticket', 'error');
  };

  // Log out of the account. The profile modal's logout button used to be wired to
  // `() => {}` in GameViews, so it did nothing at all — and `gameServer.logout()`
  // was therefore dead code. Clear the persisted session (player_state + auth
  // token), drop the React player back to the guest state, and close the modal.
  // The inbox is cleared too: `loadNotifications` early-returns for guests, so a
  // stale array would otherwise leave the previous account's notifications on
  // screen after logging out.
  const handleLogout = async () => {
    const guest = await gameServer.logout();
    setPlayer(guest);
    setNotifications([]);
    setShowProfileModal(false);
    showToast(language === 'fa' ? 'از حساب خارج شدید' : 'Logged out', 'success');
  };

  const handleCardGameStart = async () => {
    if (!selectedCard || !player) return;
    const card = selectedCard; // capture before clearing
    setShowCardStoryModal(false);
    setSelectedCard(null); // prevent useEffect from re-showing modal
    isCardGameRef.current = card.id;
    isWorldMapGameRef.current = false;

    // Generate freeform grid from card words
    const entries: DictionaryEntry[] = card.words.map((w: { word: string; clue: string }) => ({ word: w.word, clue: w.clue, category: '' }));
    const puzzle = generateFreeformGrid(entries);
    if (!puzzle) {
      showToast(language === 'fa' ? 'خطا در ساخت پازل کارت' : 'Error generating card puzzle', 'error');
      return;
    }

    // Set the grid and start playing
    gameActionsRef.current.setExternalGrid?.(puzzle.grid, puzzle.clues);
    setCurrentGameMode('casual');
    setEntranceKey(k => k + 1);
    setView('playing');
  };

  // ─── WORLD MAP CHAPTER GAME FLOW ──────────────────────────────────
  // Step 1: User clicks a chapter → show story modal
  const handleWorldMapChapterClick = (chapter: import('./types').WorldMapChapter) => {
    setPendingWorldMapChapter(chapter);
    setShowWorldMapStoryModal(true);
  };

  // Step 2: User clicks "Start" on story modal → generate grid and play
  const handleStartWorldMapGame = async () => {
    const chapter = pendingWorldMapChapter;
    if (!chapter || !player) return;
    setShowWorldMapStoryModal(false);
    setPendingWorldMapChapter(null);
    const entries: DictionaryEntry[] = chapter.words.map((w: { word: string; clue: string }) => ({ word: w.word, clue: w.clue, category: '' }));
    const puzzle = generateFreeformGrid(entries);
    if (!puzzle) {
      showToast(language === 'fa' ? 'خطا در ساخت پازل' : 'Error generating puzzle', 'error');
      return;
    }
    isWorldMapGameRef.current = true;
    worldMapChapterRef.current = chapter;
    worldMapBgImageRef.current = getChapterBgImage(chapter.id);
    worldMapWordCountRef.current = puzzle.clues.across.length + puzzle.clues.down.length;
    gameActionsRef.current.setExternalGrid?.(puzzle.grid, puzzle.clues);
    setCurrentGameMode('casual');
    setEntranceKey(k => k + 1);
    setView('playing');
  };

  if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show onboarding for first-time users once splash finishes
  if (view === 'menu' && showOnboarding) {
      return (
          <>
            <div className="cg-canvas flex flex-col text-slate-900 font-sans select-none h-[100dvh] overflow-hidden w-full relative">
              <Toast toast={toast} onDismiss={hideToast} />
              <main className="flex-1 relative overflow-hidden">
                <MainMenu
                  player={player!}
                  language={language}
                  size={size}
                  category={category}
                  loadingStage={game.loadingStage}
                  setSize={setSize}
                  setLanguage={setLanguage}
                  setCategory={setCategory}
                  onShowAuth={() => setShowAuthModal(true)}
                  onOpenShop={() => setShopOpen(true)}
                  onOpenProfile={() => setShowProfileModal(true)}
                  onStartDailyChallenge={() => nav.onGenerateClick(true)}
                  onStartQuickPlay={() => nav.onGenerateClick(false)}
                  onNavigate={(v) => setView(v)}
                  onCoinsChange={(coins) => setPlayer(prev => (prev ? { ...prev, coins } : prev))}
                />
              </main>
            </div>
            <OnboardingGuide
              language={language}
              onClose={() => {
                try { localStorage.setItem('crossword_onboarding_seen', '1'); } catch { /* storage unavailable */ }
                setShowOnboarding(false);
              }}
            />
          </>
      );
  }

  return (
    <div className="cg-canvas flex flex-col text-slate-900 font-sans select-none h-[100dvh] min-h-[100dvh] overflow-hidden w-full relative" style={{ height: '100dvh', minHeight: '100dvh' }}>
      <Toast toast={toast} onDismiss={hideToast} />

      <ErrorBoundary>
        <Suspense fallback={null}>
        <GameModals
          language={language}
          player={player}
          currentGameMode={currentGameMode}
          isDaily={isDaily}
          onCoinsChange={(coins) => setPlayer(prev => (prev ? { ...prev, coins } : prev))}
          onPlayerSync={(patch) => setPlayer(prev => (prev ? { ...prev, ...patch } : prev))}
          showMultiplayerRetryModal={showMultiplayerRetryModal}
          game={{
            grid: game.grid,
            loadingStage: game.loadingStage,
            retryCount: game.retryCount,
            maxRetries: game.maxRetries,
            seconds: game.seconds,
            error: game.error,
            setError: game.setError,
            resetGame: game.resetGame,
            startTimer: game.startTimer,
            generateGrid: game.generateGrid,
          }}
          multiplayerState={{ isHost: multiplayerState.isHost }}
          matchmakingActions={{
            handleMultiplayerRetry: matchmakingActions.handleMultiplayerRetry,
            handleMultiplayerCancel: matchmakingActions.handleMultiplayerCancel,
          }}
          showMainShop={showShop}
          showTowerCashOutModal={showTowerCashOutModal}
          showTowerQuitConfirm={showTowerQuitConfirm}
          showTowerLossModal={showTowerLossModal}
          towerLossReason={towerLossReason}
          runState={runState}
          shopItems={shopItems}
          buyShopItem={buyShopItem}
          towerActions={towerActions}
          currentFloorConfig={currentFloorConfig}
          gameOverFn={gameOver}
          setShowTowerCashOutModal={setShowTowerCashOutModal}
          setShowTowerLossModal={setShowTowerLossModal}
          setShowTowerQuitConfirm={setShowTowerQuitConfirm}
          setView={setView}
          setIsCashingOut={setIsCashingOut}
          challengeState={challengeState}
          deleteNotification={deleteNotification}
          showStoryModal={showStoryModal}
          setShowStoryModal={setShowStoryModal}
          selectedBook={selectedBook}
          pendingChapterId={pendingChapterId}
          pendingChapterRef={pendingChapterRef}
          entranceKey={entranceKey}
          setEntranceKey={setEntranceKey}
          showDbSetupModal={showDbSetupModal}
          setShowDbSetupModal={setShowDbSetupModal}
          showToastFn={showToast}
          showLeaveConfirm={showLeaveConfirm}
          setShowLeaveConfirm={setShowLeaveConfirm}
          nav={nav}
          showAuthModal={showAuthModal}
          pendingScore={pendingScore}
          handleRegister={(phone, pass, stats) => handleRegister(phone, pass, stats, setPlayer)}
          setShowAuthModal={setShowAuthModal}
          showHintModal={showHintModal}
          handleRevealCell={handleRevealCell}
          handleRevealWord={handleRevealWord}
          setShowHintModal={setShowHintModal}
          shopOpen={shopOpen}
          handleShopPurchase={(itemId, cost) => handleShopPurchase(player, setPlayer, itemId, cost, showToast, language)}
          setShopOpen={setShopOpen}
        />
      </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <GameViews
        view={view}
        currentGameMode={currentGameMode}
        language={language}
        player={player}
        size={size}
        category={category}
        isDaily={isDaily}
        onCoinsChange={(coins) => setPlayer(prev => (prev ? { ...prev, coins } : prev))}
        game={{
          grid: game.grid,
          userGrid: game.userGrid,
          clues: game.clues,
          loadingStage: game.loadingStage,
          gameWon: game.gameWon,
          gameLost: game.gameLost,
          matchScore: game.matchScore,
          seconds: game.seconds,
          selectedCell: game.selectedCell,
          activeClue: game.activeClue,
          direction: game.direction,
          myFilledCells: game.myFilledCells,
          // Both counters feed the grid shake and the duel verdict chip; without them
          // the curated object below silently reports zero mistakes to the UI.
          wrongAnswerCount: game.wrongAnswerCount,
          assistedCount: game.assistedCount,
          combo: game.combo,
          heroHp: game.heroHp,
          monsterHp: game.monsterHp,
          monsterRage: game.monsterRage,
          isFinishingMove: game.isFinishingMove,
          powerMeter: game.powerMeter,
          powerRevealedCells: game.powerRevealedCells,
          usePowerRevealCell: game.usePowerRevealCell,
          usePowerRevealWord: game.usePowerRevealWord,
          isHeroHit: game.isHeroHit,
          isMonsterHit: game.isMonsterHit,
          isMonsterAttacking: game.isMonsterAttacking,
          isHeroHeal: game.isHeroHeal,
          updateSelection: game.updateSelection,
          handleBackspace: game.handleBackspace,
          handleNavigateClue: game.handleNavigateClue,
          toggleDirection: game.toggleDirection,
          canToggleDirection: game.canToggleDirection,
          resetGame: game.resetGame,
          reviveHero: game.reviveHero,
          currentChapterIndex: game.currentChapterIndex,
          setUserGrid: game.setUserGrid,
        }}
        entranceKey={entranceKey}
        multiplayerState={multiplayerState}
        mergedCategories={mergedCategories}
        finalCategory={finalCategory}
        finalSize={finalSize}
        showMultiplayerRetryModal={showMultiplayerRetryModal}
        isMatchmaking={isMatchmaking}
        matchmakingStatus={matchmakingStatus}
        friends={friends}
        allOnlinePlayers={allOnlinePlayers}
        notifications={notifications}
        messages={messages}
        typingUsers={typingUsers}
        unreadCounts={unreadCounts}
        loadChatHistory={loadChatHistory}
        sendMessage={sendMessage}
        sendTyping={sendTyping}
        deleteNotification={deleteNotification}
        refreshFriends={refreshFriends}
        refreshNotifications={refreshNotifications}
        onMarkChatRead={markChatRead}
        onSetActiveChat={setActiveChat}
        selectedBook={selectedBook}
        worldMapAccent={selectedLegend?.color || null}
        worldMapBgImage={isWorldMapGameRef.current ? worldMapBgImageRef.current : null}
        worldMapCardProgress={worldMapCardProgress}
        worldMapWordCount={worldMapWordCountRef.current}
        animatingChapterIndex={animatingChapterIndex}
        selectedLegend={selectedLegend}
        onSelectLegend={(legend: any) => {
          setSelectedLegend(legend);
          setView('world_map_chapters');
        }}
        onStartWorldMapChapter={handleWorldMapChapterClick}
        worldMapProgress={unlockedChapters}
        duel={{
          lastBoard,
          outcome: duelOutcome,
          replay: duelReplay,
          onStartBoard: startDuelGame,
          onPlayQuick: () => { void nav.onGenerateClick(false); },
          onBuildBoard: (nextSize: GridSize, nextCategory: Category) => {
            duelBuildRef.current = { size: nextSize, category: nextCategory };
            setCategory(nextCategory);
            setSize(nextSize);
            setDuelBuildTick(t => t + 1);
          },
          onClearOutcome: () => setDuelOutcome(null),
          onRequireAuth: () => setShowAuthModal(true),
        }}
        unlockedCards={unlockedCards}
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        runState={runState}
        currentFloorConfig={currentFloorConfig}
        towerTimeLimit={towerTimeLimit}
        livesShaking={livesShaking}
        handleEnterTower={towerActions.handleEnterTower}
        onGetFreeTicket={handleGetFreeTicket}
        nav={nav}
        matchmakingActions={matchmakingActions}
        challengeActions={challengeState}
        setView={setView}
        setSize={setSize}
        setLanguage={setLanguage}
        setCategory={setCategory}
        setShowAuthModal={setShowAuthModal}
        setShopOpen={setShopOpen}
        setShowProfileModal={setShowProfileModal}
        setShowHintModal={setShowHintModal}
        setSelectedBook={setSelectedBook}
        setBattleWager={setBattleWager}
        setShowMultiplayerRetryModal={setShowMultiplayerRetryModal}
        setCurrentGameMode={setCurrentGameMode}
        setMergedCategories={setMergedCategories}
        setFinalCategory={setFinalCategory}
        setFinalSize={setFinalSize}
        handleProfileUpdate={(name, avatar, theme) => handleProfileUpdate(player, setPlayer, name, avatar, theme, showToast, language)}
        handleLogout={handleLogout}
        handleRevealCell={handleRevealCell}
        handleRevealWord={handleRevealWord}
        lastWinStars={lastWinStars}
        battleWager={battleWager}
        trophyChange={trophyChange}
        notificationCount={notifications.length + Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
        pendingChallenges={pendingChallenges}
        showToast={showToast}
        showProfileModal={showProfileModal}
        pendingGames={pendingGames}
        myPendingGameId={myPendingGameId}
        setMyPendingGameId={setMyPendingGameId}
        pendingGamesLoading={pendingGamesLoading}
        setPendingGamesLoading={setPendingGamesLoading}
      />
      </ErrorBoundary>

      {showCardStoryModal && selectedCard && (
        <CardStoryModal
          card={selectedCard}
          language={language}
          onStart={handleCardGameStart}
          onClose={() => { setShowCardStoryModal(false); setSelectedCard(null); }}
        />
      )}

      {showWorldMapStoryModal && pendingWorldMapChapter && selectedLegend && (
        <WorldMapStoryModal
          chapter={pendingWorldMapChapter}
          legendColor={selectedLegend.color}
          legendName={selectedLegend.name}
          language={language}
          bgImage={getChapterBgImage(pendingWorldMapChapter.id)}
          onStart={handleStartWorldMapGame}
          onClose={() => { setShowWorldMapStoryModal(false); setPendingWorldMapChapter(null); }}
        />
      )}
      {showWorldMapCompleteModal && completingLegend && completingFinalStory && (
        <WorldMapCompleteModal
          language={language}
          legendName={completingLegend.name}
          legendColor={completingLegend.color}
          legendIcon={completingLegend.icon}
          chapters={getLegendChapters(completingLegend.id).length}
          finalStory={completingFinalStory}
          bgImage={completingBgImage}
          onBackToMap={() => {
            setShowWorldMapCompleteModal(false);
            setCompletingLegend(null);
            setCompletingFinalStory(null);
            setCompletingBgImage(null);
            setView('epic_library');
          }}
        />
      )}

      {showCardReveal && revealedCard && (
        <WorldMapCardRevealModal
          language={language}
          chapterId={revealedCard.chapterId}
          chapterTitle={revealedCard.chapterTitle}
          chapterSubtitle={revealedCard.chapterSubtitle}
          rarity={revealedCard.rarity}
          bgImage={revealedCard.bgImage}
          legendColor={revealedCard.legendColor}
          legendIcon={revealedCard.legendIcon}
          legendName={revealedCard.legendName}
          matchScore={revealedCard.matchScore}
          finalSeconds={revealedCard.finalSeconds}
          wordCount={revealedCard.wordCount}
          player={player}
          onPlayerUpdate={(updated) => setPlayer(updated)}
          onCardPolished={(newRarity) => {
            if (revealedCard.chapterId) {
              const cardUpdated = { ...worldMapCardProgress, [revealedCard.chapterId]: newRarity };
              saveWorldMapCardProgress(cardUpdated);
            }
          }}
          onClose={() => setShowCardReveal(false)}
          onContinue={() => setShowCardReveal(false)}
        />
      )}

      <ScrollUnlockCeremonyModal
        ceremony={scrollCeremony}
        onClose={() => setScrollCeremony(null)}
        onOpenCollection={() => setView('collection')}
      />
      <OfflineIndicator />
    </div>
  );
};

export default App;
