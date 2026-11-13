import React from 'react';
import {
  Language, PlayerState, GameView as ViewType, StoryBook,
  Category, GridSize, Grid, Clue, GameMode, CardDef, WorldMapChapter,
  LoadingStage, TowerRunState, WorldMapCardRarity, AsyncDuel, DuelOutcome, LastPlayedBoard,
} from '../types';
import { getCategoryNameFa, getCategoryNameEn } from '../utils/categoryNames';
import { duelPoints, duelPointsOf } from '../utils/duelScoring';
import { multiplayer } from '../utils/multiplayer';

// Eagerly loaded views so switching to Maps, Story Library, or GameView has zero chunk-loading lag
import { GameView as GameViewComponent } from './GameView';
import { EpicLibrary } from './EpicLibrary';
import { EpicModeMenu } from './EpicModeMenu';
import { Lobby } from './Lobby';
import { SocialPanel } from './SocialPanel';
import { TowerLobby } from './TowerLobby';
import { Leaderboard } from './Leaderboard';
import { CardGallery } from './CardGallery';
import { CollectionScreen, type CollectionShelf } from './CollectionScreen';
import { WorldMap } from './WorldMap';
import { WorldMapChapters } from './WorldMapChapters';
import { AsyncDuelScreen } from './AsyncDuelScreen';

// Eager components
import { MatchmakingOverlay } from './MatchmakingOverlay';
import { MultiplayerWaitingOverlay } from './MultiplayerWaitingOverlay';
import { StoryLoseScreen } from './StoryLoseScreen';
import { Header } from './Header';
import { GameResultScreen } from './GameResultScreen';
import { MainMenu } from './MainMenu';
import { ProfileModal } from './ProfileModal';
import { GamePreparing } from './GamePreparing';
import { MergeLobby, type PlayerChoice } from './MergeLobby';
import { TowerBossIndicator } from './TowerBossIndicator';
import { ScrollRevealCeremony, type ScrollAwardPayload } from './ScrollRevealCeremony';
import { WORLD_MAP_CHAPTERS } from '../data/worldMapData';
import { resolveSetScrollTier, getBookFamily } from '../utils/progression';
import { gameServer } from '../utils/gameServer';

interface MultiplayerState {
  opponent: any;
  isHost: boolean;
  roomId: string | null;
  showCoinFlip: boolean;
  gameMode: GameMode;
  matchType: 'matchmaking' | 'direct' | 'arena' | null;
  myPreference: PlayerChoice | null;
  opponentPreference: PlayerChoice | null;
  opponentScore: number;
  opponentProgress: number;
  opponentFilled: Set<string>;
  setOpponentFilled: React.Dispatch<React.SetStateAction<Set<string>>>;
  mana: number;
  setMana: React.Dispatch<React.SetStateAction<number>>;
  isFrozen: boolean;
  isBlinded: boolean;
  spawnFloatingEmoji: (e: string) => void;
  floatingEmojis: { id: number; emoji: string }[];
  finalResult: { status?: string | null };
  waitingForHost: boolean;
  generatingStatus?: string | null;
  peerOutdated?: boolean;
}

interface NavActions {
  returnToMenu: () => Promise<void>;
  handleHomeClick: () => Promise<void>;
  onGenerateClick: (daily?: boolean, chapterOverride?: number) => Promise<void>;
  onPlayEpicChapter: (chapterId: number) => Promise<void>;
  handleInput: (key: string) => void;
}

interface MatchmakingActions {
  handleLeaveWaiting: () => Promise<void>;
  handleCreateRoom: (mode: GameMode, wager: number) => Promise<string | null>;
  handleQuickMatch: (mode: GameMode, wager: number) => Promise<void>;
  handleJoinRoom: (rid: string) => Promise<void>;
  handleMatchmakingCancel: () => Promise<void>;
  handleCreateArenaGame: (mode: GameMode, wager: number) => Promise<string | null>;
  handleJoinArenaGame: (gameId: string) => Promise<boolean>;
  handleCancelArenaGame: (gameId: string) => Promise<boolean>;
}

interface ChallengeActions {
  handleChallengeFriend: (friendId: string, size: GridSize, cat: Category) => Promise<void>;
  handleAcceptChallenge: (n: any, cat?: Category, size?: GridSize) => Promise<void>;
}

interface Game {
  grid: any[][] | null;
  userGrid: string[][];
  clues: { across: any[]; down: any[] } | null;
  loadingStage: LoadingStage;
  gameWon: boolean;
  gameLost: boolean;
  matchScore: number;
  seconds: number;
  selectedCell: { r: number; c: number } | null;
  activeClue: any;
  direction: 'across' | 'down';
  myFilledCells: Set<string>;
  wrongAnswerCount?: number;
  assistedCount?: number;
  combo: number;
  heroHp: number;
  monsterHp: number;
  monsterRage: number;
  isFinishingMove: boolean;
  powerMeter: number;
  powerRevealedCells: Set<string>;
  usePowerRevealCell: () => void;
  usePowerRevealWord: () => void;
  isHeroHit: boolean;
  isMonsterHit: boolean;
  isMonsterAttacking: boolean;
  isHeroHeal: boolean;
  updateSelection: (r: number, c: number) => void;
  setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>;
  handleBackspace: (frozen: boolean) => void;
  handleNavigateClue: (dir: number) => void;
  toggleDirection: () => void;
  canToggleDirection: boolean;
  resetGame: () => void;
  reviveHero?: () => void;
  currentChapterIndex?: number;
}

export interface GameViewsProps {
  // State
  view: ViewType;
  currentGameMode: string;
  language: Language;
  player: PlayerState | null;
  size: GridSize;
  category: Category;
  isDaily: boolean;
  /** Server-returned coin balance after a quest/season payout. */
  onCoinsChange?: (coins: number) => void;

  // Game
  game: Game;
  entranceKey: number;

  // Multiplayer
  multiplayerState: MultiplayerState;
  mergedCategories: [Category, Category] | null;
  finalCategory: Category | null;
  finalSize: GridSize | null;
  showMultiplayerRetryModal: boolean;

  // Matchmaking
  isMatchmaking: boolean;
  matchmakingStatus: string;

  // Friends / Social
  friends: any[];
  allOnlinePlayers: any[];
  notifications: any[];
  messages: Record<string, any[]>;
  typingUsers: Record<string, any>;
  unreadCounts: Record<string, number>;
  loadChatHistory: (friendId: string) => Promise<void>;
  sendMessage: (friendId: string, content: string) => void;
  sendTyping: (friendId: string) => void;
  deleteNotification: (id: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  onMarkChatRead?: (friendId: string) => void;
  onSetActiveChat?: (friendId: string | null) => void;

  // Cards
  unlockedCards: Record<string, { stars: number }>;
  selectedCard: CardDef | null;

  // World Map
  selectedLegend: {
    id: string;
    name: { fa: string; en: string };
    color: string;
    icon: string;
    country: { fa: string; en: string };
  } | null;
  onSelectLegend: (legend: {
    id: string;
    name: { fa: string; en: string };
    color: string;
    icon: string;
    country: { fa: string; en: string };
  }) => void;
  onStartWorldMapChapter: (chapter: WorldMapChapter) => void;
  worldMapProgress: Record<string, number>;
  worldMapAccent: string | null;
  worldMapBgImage: string | null;
  worldMapCardProgress: Record<string, WorldMapCardRarity>;
  worldMapWordCount: number;
  animatingChapterIndex: number | null;
  setSelectedCard: (c: CardDef | null) => void;

  // Async duels
  duel: {
    lastBoard: LastPlayedBoard | null;
    outcome: DuelOutcome | null;
    /** Non-null only while an accepted duel is being replayed — drives the live verdict chip. */
    replay: AsyncDuel | null;
    onStartBoard: (duel: AsyncDuel) => void;
    onPlayQuick: () => void;
    onBuildBoard: (size: GridSize, category: Category) => void;
    onClearOutcome: () => void;
    onRequireAuth: () => void;
  };

  // Story
  selectedBook: StoryBook | null;

  // Tower
  runState: TowerRunState;
  currentFloorConfig: { type?: string; timeLimit?: number; bossName?: string; bossAvatar?: string } | null;
  towerTimeLimit: number | undefined;
  livesShaking: boolean;
  handleEnterTower: () => Promise<void>;
  onGetFreeTicket: () => void;

  // Navigation / Actions
  nav: NavActions;
  matchmakingActions: MatchmakingActions;
  challengeActions: ChallengeActions;

  // State booleans
  showProfileModal: boolean;

  // Setters
  setView: (v: ViewType) => void;
  setSize: (s: GridSize) => void;
  setLanguage: (l: Language) => void;
  setCategory: (c: Category) => void;
  setShowAuthModal: (v: boolean) => void;
  setShopOpen: (v: boolean) => void;
  setShowProfileModal: (v: boolean) => void;
  setShowHintModal: (v: boolean) => void;
  setSelectedBook: (b: StoryBook | null) => void;
  setBattleWager: (w: number) => void;
  setShowMultiplayerRetryModal: (v: boolean) => void;
  setCurrentGameMode: (m: GameMode) => void;
  setIsMatchmaking?: (v: boolean) => void;
  setMatchmakingStatus?: (s: string) => void;
  setMergedCategories: (v: [Category, Category] | null) => void;
  setFinalCategory: (v: Category | null) => void;
  setFinalSize: (v: GridSize | null) => void;

  // Callbacks
  handleProfileUpdate: (name: string, avatar: string, theme?: 'light' | 'dark') => void;
  handleLogout: () => void;
  handleRevealCell: () => void;
  handleRevealWord: () => void;

  // Toast (optional; currently unused by GameViews)
  showToast?: (msg: string, type?: 'success' | 'error') => void;

  // Last win / trophy
  lastWinStars: number;
  battleWager: number;
  trophyChange: number;

  // Notifications count (for header)
  notificationCount: number;
  /** Unanswered duel challenges, shown as a badge on the menu tile. */
  pendingChallenges: number;

  // Arena
  pendingGames: { gameId: string; mode: GameMode; wager: number; mine?: boolean }[];
  myPendingGameId: string | null;
  setMyPendingGameId: (v: string | null) => void;
  pendingGamesLoading: string | null;
  setPendingGamesLoading: (v: string | null) => void;
}

export const GameViews: React.FC<GameViewsProps> = React.memo((props) => {
  const {
    view, currentGameMode, language, player, size, category, isDaily, onCoinsChange,
    game, entranceKey,
    multiplayerState,
    mergedCategories, finalCategory, finalSize,
    isMatchmaking, matchmakingStatus,
    friends, allOnlinePlayers, notifications, messages, typingUsers, unreadCounts,
    loadChatHistory, sendMessage, sendTyping, deleteNotification,
    refreshFriends, refreshNotifications, onMarkChatRead, onSetActiveChat,
    unlockedCards, selectedCard, setSelectedCard, selectedBook,
    runState, currentFloorConfig, towerTimeLimit, livesShaking, handleEnterTower, onGetFreeTicket,
    nav, matchmakingActions, challengeActions,
    setView, setSize, setLanguage, setCategory,
    showProfileModal,
            setShowAuthModal, setShopOpen, setShowProfileModal, setShowHintModal,
    setSelectedBook,
    setCurrentGameMode, setShowMultiplayerRetryModal, setMergedCategories, setFinalCategory, setFinalSize,
    handleProfileUpdate, handleLogout, handleRevealCell, handleRevealWord,
    lastWinStars, battleWager, trophyChange,
    notificationCount,
    pendingChallenges,
    pendingGames, myPendingGameId, setMyPendingGameId, pendingGamesLoading, setPendingGamesLoading,
    selectedLegend, onSelectLegend, onStartWorldMapChapter, worldMapProgress, worldMapAccent, worldMapBgImage,
    worldMapCardProgress, worldMapWordCount, animatingChapterIndex,
    duel,
  } = props;

  const isGameActive = view === 'playing' && !!game.grid;
  const isFA = language === 'fa';
  const isPlaying = view === 'playing';
  const isTower = isPlaying && currentGameMode === 'tower';
  const isLoading = game.loadingStage !== 'idle';
  /* plain play owns the whole viewport with the approved poster, which carries
     its own printed top bar — the app header would only duplicate it */
  const clayPoster = isGameActive && !game.currentChapterIndex && !runState.isActive && !worldMapAccent;

  // Synchronized MergeLobby dismissal: when grid is ready, MergeLobby stays visible
  // for a brief grace period so BOTH players see "Grid ready!" together before transition.
  const [mergeLobbyDismissed, setMergeLobbyDismissed] = React.useState(false);
  // Lives here (not in the library) so returning from a chapter restores the
  // same shelf the player opened — e.g. back from a football chapter lands on
  // the world map, not on the history shelf.
  const [libraryShelf, setLibraryShelf] = React.useState<'history' | 'epic' | 'folklore' | 'football'>('history');
  // Chapters opened from «کالکشن من» must return there, not to the treasure
  // shelves the player never visited.
  const collectionOriginRef = React.useRef(false);
  // Kept outside the screen so returning from a chapter reopens the same shelf.
  const [collectionShelf, setCollectionShelf] = React.useState<CollectionShelf>('football');
  const [globalScrollAward, setGlobalScrollAward] = React.useState<ScrollAwardPayload | null>(null);

  // Detect newly unlocked Master Scroll when returning from playing the final chapter of a Legend or Story Book
  React.useEffect(() => {
    if (view === 'playing' || view === 'collection') return;

    const CELEBRATED_KEY = 'cg_celebrated_scroll_tiers';
    let celebratedMap: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(CELEBRATED_KEY);
      if (raw) celebratedMap = JSON.parse(raw);
    } catch {}

    // 1. Check active Football Legend if returning to world_map_chapters
    if (selectedLegend) {
      const chapters = WORLD_MAP_CHAPTERS[selectedLegend.id] || [];
      if (chapters.length > 0) {
        const tiers = chapters.map((ch) => worldMapCardProgress[ch.id] ?? null);
        const status = resolveSetScrollTier(
          `scroll:legend:${selectedLegend.id}`,
          selectedLegend.id,
          selectedLegend.name.fa,
          selectedLegend.name.en,
          'football',
          selectedLegend.icon,
          selectedLegend.color,
          tiers,
        );
        if (status.isUnlocked && status.scrollTier) {
          const prevTier = Number(celebratedMap[status.scrollKey] || 0);
          if (status.scrollTier > prevTier) {
            celebratedMap[status.scrollKey] = status.scrollTier;
            try {
              localStorage.setItem(CELEBRATED_KEY, JSON.stringify(celebratedMap));
            } catch {}
            gameServer.syncScrollTiers({ [status.scrollKey]: status.scrollTier });
            setGlobalScrollAward({
              scrollKey: status.scrollKey,
              titleFa: status.titleFa,
              subtitleFa: `${status.totalCards} از ${status.totalCards} کارت کامل`,
              family: 'football',
              tier: status.scrollTier,
              totalCards: status.totalCards,
              isUpgrade: prevTier > 0,
            });
            return;
          }
        }
      }
    }

    // 2. Check active Story Book if returning to epic_chapters
    if (selectedBook && player) {
      const total = selectedBook.chapters.length;
      const done = Math.min(Math.max((player.epicProgress?.[selectedBook.id] || 1) - 1, 0), total);
      if (total > 0 && done >= total) {
        const scrollKey = `scroll:book:${selectedBook.id}`;
        const prevTier = Number(celebratedMap[scrollKey] || 0);
        if (prevTier === 0) {
          celebratedMap[scrollKey] = 1;
          try {
            localStorage.setItem(CELEBRATED_KEY, JSON.stringify(celebratedMap));
          } catch {}
          gameServer.syncScrollTiers({ [scrollKey]: 1 });
          setGlobalScrollAward({
            scrollKey,
            titleFa: selectedBook.title,
            subtitleFa: `${total} از ${total} فصل کامل`,
            family: getBookFamily(selectedBook.id, selectedBook.genre),
            tier: 1,
            totalCards: total,
            isUpgrade: false,
          });
        }
      }
    }
  }, [view, selectedLegend, worldMapCardProgress, selectedBook, player]);

  React.useEffect(() => {
    // Reset when leaving multiplayer
    if (currentGameMode !== 'multiplayer' || !multiplayerState.opponent) {
      setMergeLobbyDismissed(false);
    }
  }, [currentGameMode, multiplayerState.opponent]);

  // Pre-computed labels for waiting overlay
  const waitingPrimaryLabel = (() => {
    if (mergedCategories) {
      return isFA ? getCategoryNameFa(mergedCategories[0]) : getCategoryNameEn(mergedCategories[0]);
    }
    if (finalCategory) {
      return isFA ? getCategoryNameFa(finalCategory) : getCategoryNameEn(finalCategory);
    }
    return null;
  })();
  const waitingSecondaryLabel = mergedCategories && mergedCategories[0] !== mergedCategories[1]
    ? (isFA ? getCategoryNameFa(mergedCategories[1]) : getCategoryNameEn(mergedCategories[1]))
    : null;

  return (
    <>
      {/* MERGE LOBBY — single unified page replacing MultiplayerWaitingOverlay + CoinFlipSelection + GamePreparing for multiplayer */}
      {view === 'playing' && currentGameMode === 'multiplayer' && multiplayerState.opponent && !mergeLobbyDismissed && (
        <MergeLobby
          language={language}
          myPreference={multiplayerState.myPreference}
          opponentPreference={multiplayerState.opponentPreference}
          opponent={multiplayerState.opponent}
          isHost={multiplayerState.isHost}
          mergedSize={finalSize}
          mergedCategories={mergedCategories}
          finalCategory={finalCategory}
          roomId={multiplayerState.roomId}
          coinFlipActive={multiplayerState.showCoinFlip}
          coinFlipDone={!multiplayerState.showCoinFlip && finalSize !== null && currentGameMode === 'multiplayer'}
          gridGenerating={game.loadingStage !== 'idle'}
          gridReady={!!game.grid}
          generatingStatus={multiplayerState.generatingStatus}
          peerOutdated={multiplayerState.peerOutdated}
          onCancel={matchmakingActions.handleLeaveWaiting}
          onMergeLobbyReady={() => setMergeLobbyDismissed(true)}
        />
      )}

      {view !== 'menu' && !clayPoster && (
      <Header
        view={view}
        currentGameMode={currentGameMode}
        language={language}
        player={player}
        loadingStage={game.loadingStage}
        hasGrid={!!game.grid}
        seconds={game.seconds}
        towerLives={runState.lives}
        towerMaxLives={runState.maxLives}
        towerFloor={runState.floor}
        towerLoot={runState.loot}
        towerTimeLimit={towerTimeLimit}
        livesShaking={livesShaking}
        hasShield={runState.hasShield}
        notificationCount={notificationCount}
        onProfileClick={() => setShowProfileModal(true)}
        onHomeClick={nav.handleHomeClick}
        onSocialClick={() => setView('social')}
        onOpenShop={() => setShopOpen(true)}
        onShowAuth={() => setShowAuthModal(true)}
        onCollectionClick={() => setView('collection')}
        clay={clayPoster}
        score={game.matchScore}
        combo={game.combo}
        opponent={multiplayerState.opponent}
        opponentScore={multiplayerState.opponentScore}
        onHint={() => setShowHintModal(true)}
        canToggleDirection={game.canToggleDirection}
        onToggleDirection={game.toggleDirection}
      />
      )}

      <main className={`cg-canvas flex-1 min-h-0 flex flex-col relative ${isGameActive || view === 'menu' || view === 'epic_library' || view === 'epic_chapters' || view === 'tower_lobby' || view === 'cards' || view === 'collection' || view === 'world_map' || view === 'world_map_chapters' || view === 'leaderboard' || view === 'duel' ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
        <React.Suspense fallback={<div className="flex items-center justify-center p-12"><div className="w-10 h-10 border-[5px] border-[#B4694B] border-t-transparent rounded-full animate-spin" /></div>}>

          {view === 'duel' && player && (
            <AsyncDuelScreen
              language={language}
              player={player}
              friends={friends}
              lastBoard={duel.lastBoard}
              outcome={duel.outcome}
              onBack={() => setView('menu')}
              onStartBoard={duel.onStartBoard}
              onPlayQuick={duel.onPlayQuick}
              onBuildBoard={duel.onBuildBoard}
              onClearOutcome={duel.onClearOutcome}
              onRequireAuth={() => setShowAuthModal(true)}
              onShowToast={(msg, type) => props.showToast?.(msg, type)}
            />
          )}
          {view === 'epic_library' && player && (
            <EpicLibrary
              player={player}
              language={language}
              shelf={libraryShelf}
              onShelfChange={setLibraryShelf}
              onBack={() => { setSelectedBook(null); setView('menu'); }}
              onSelectBook={(book) => { collectionOriginRef.current = false; setSelectedBook(book); setView('epic_chapters'); }}
              worldMapProgress={worldMapProgress}
              onSelectLegend={(legend: any) => {
                collectionOriginRef.current = false;
                setLibraryShelf('football');
                onSelectLegend({
                  id: legend.id,
                  name: legend.name,
                  color: legend.color,
                  icon: legend.icon,
                  country: legend.country,
                });
              }}
              onCoinsChange={onCoinsChange}
              onOpenShop={() => setShopOpen(true)}
              onOpenCollection={() => {
                setCollectionShelf(libraryShelf);
                setView('collection');
              }}
            />
          )}

          {view === 'epic_chapters' && player && selectedBook && (
            <EpicModeMenu
              onBack={() => setView(collectionOriginRef.current ? 'collection' : 'epic_library')}
              onPlayChapter={nav.onPlayEpicChapter}
              isLoading={game.loadingStage !== 'idle'}
              progress={player.epicProgress?.[selectedBook.id] || 1}
              isGuest={player.id === 'guest'}
              book={selectedBook}
              stars={player.epicStars}
            />
          )}

          {view === 'tower_lobby' && player && (
            <TowerLobby
              player={player}
              language={language}
              onBack={() => setView('menu')}
              onEnterTower={handleEnterTower}
              onGetFreeTicket={onGetFreeTicket}
            />
          )}

          {view === 'collection' && player && (
            <CollectionScreen
              player={player}
              language={language}
              shelf={collectionShelf}
              onShelfChange={setCollectionShelf}
              worldMapProgress={worldMapProgress}
              worldMapCardProgress={worldMapCardProgress}
              onSelectBook={(book) => {
                collectionOriginRef.current = true;
                setSelectedBook(book);
                setView('epic_chapters');
              }}
              onSelectLegend={(legend) => {
                collectionOriginRef.current = true;
                onSelectLegend(legend);
              }}
              onBack={() => { collectionOriginRef.current = false; setView('menu'); }}
              onCoinsChange={onCoinsChange}
            />
          )}

          {view === 'cards' && player && !selectedCard && (
            <CardGallery
              language={language}
              playerCoins={player.coins}
              unlockedCards={unlockedCards}
              onSelectCard={(card) => setSelectedCard(card)}
              onBack={() => setView('menu')}
            />
          )}

          {view === 'world_map' && player && (
            <WorldMap
              language={language}
              unlockedChapters={worldMapProgress}
              player={player}
              onCoinsChange={onCoinsChange}
              onOpenShop={() => setShopOpen(true)}
              onSelectLegend={(legend: any) => {
                collectionOriginRef.current = false;
                onSelectLegend({
                  id: legend.id,
                  name: legend.name,
                  color: legend.color,
                  icon: legend.icon,
                  country: legend.country,
                });
              }}
            />
          )}

          {view === 'world_map_chapters' && player && selectedLegend && (
            <WorldMapChapters
              language={language}
              legendId={selectedLegend.id}
              legendName={selectedLegend.name}
              legendColor={selectedLegend.color}
              legendIcon={selectedLegend.icon}
              legendCountry={selectedLegend.country}
              unlockedChapters={worldMapProgress}
              cardProgress={worldMapCardProgress}
              animatingChapterIndex={animatingChapterIndex}
              onBack={() => setView(collectionOriginRef.current ? 'collection' : 'epic_library')}
              onStartChapter={onStartWorldMapChapter}
              onOpenCollection={() => {
                setCollectionShelf('football');
                setView('collection');
              }}
            />
          )}

          {view === 'menu' && (
            <MainMenu
              player={player}
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
              pendingChallenges={pendingChallenges}
              onCoinsChange={onCoinsChange}
            />
          )}

          {view === 'leaderboard' && player && (
            <Leaderboard language={language} playerScore={player.score} />
          )}

          {showProfileModal && player && (
            <ProfileModal
              player={player}
              language={language}
              onClose={() => setShowProfileModal(false)}
              onUpdate={(name, avatar, theme) => handleProfileUpdate(name, avatar, theme)}
              onAuthTrigger={() => setShowAuthModal(true)}
              onLogout={handleLogout}
              onCoinsChange={onCoinsChange}
              onOpenShop={() => setShopOpen(true)}
            />
          )}

          {view === 'lobby' && player && (
            <Lobby
              language={language}
              onBack={() => setView('menu')}
              onCreate={matchmakingActions.handleCreateRoom}
              onQuickMatch={matchmakingActions.handleQuickMatch}
              onJoin={matchmakingActions.handleJoinRoom}
              isLoading={false}
              size={size}
              setSize={setSize}
              playerScore={player.score}
              playerCoins={player.coins}
              onlineFriends={allOnlinePlayers}
              friends={friends}
              onChallenge={challengeActions.handleChallengeFriend}
              playerLeague={player.league}
              pendingGames={pendingGames}
              myPendingGameId={myPendingGameId}
              setMyPendingGameId={setMyPendingGameId}
              pendingGamesLoading={pendingGamesLoading}
              setPendingGamesLoading={setPendingGamesLoading}
              onArenaCreate={async (mode: GameMode, wager: number) => {
                const gid = await matchmakingActions.handleCreateArenaGame(mode, wager);
                if (gid) setMyPendingGameId(gid);
                return gid;
              }}
              onArenaJoin={async (gameId: string) => {
                setPendingGamesLoading(gameId);
                // If we are sitting on our OWN listing, retire it before joining
                // someone else's game. Otherwise it lingers in the arena forever
                // with the wager still escrowed — and because the lobby used to
                // hide the joinable list while waiting, two players who both
                // created a game could never find each other and both sat on
                // "waiting for opponent" indefinitely.
                if (myPendingGameId && myPendingGameId !== gameId) {
                  await matchmakingActions.handleCancelArenaGame(myPendingGameId);
                }
                await matchmakingActions.handleJoinArenaGame(gameId);
                setPendingGamesLoading(null);
                setMyPendingGameId(null);
              }}
              onArenaCancel={async (gameId: string) => {
                const success = await matchmakingActions.handleCancelArenaGame(gameId);
                if (success) setMyPendingGameId(null);
              }}
              isArenaJoining={pendingGamesLoading !== null}
              onOpenCollection={() => setView('collection')}
            />
          )}

          {view === 'social' && player && (
            <SocialPanel
              player={player}
              language={language}
              friends={friends}
              notifications={notifications}
              messages={messages}
              typingUsers={typingUsers}
              unreadCounts={unreadCounts}
              onLoadChat={loadChatHistory}
              onClose={() => setView('menu')}
              onChallenge={challengeActions.handleChallengeFriend}
              onAcceptChallenge={challengeActions.handleAcceptChallenge}
              onChallengeAcceptClick={(n) => { setView('menu'); }}
              onRefresh={() => { refreshFriends(); refreshNotifications(); }}
              onSendMessage={sendMessage}
              onSendTyping={sendTyping}
              deleteNotification={deleteNotification}
              onMarkChatRead={onMarkChatRead}
              onSetActiveChat={onSetActiveChat}
              onPlayDuel={(d) => duel.onStartBoard(d)}
            />
          )}

          <MatchmakingOverlay
            isMatchmaking={isMatchmaking}
            matchmakingStatus={matchmakingStatus}
            language={language}
            onCancel={() => {
              matchmakingActions.handleMatchmakingCancel();
            }}
          />

          <MultiplayerWaitingOverlay
            show={currentGameMode === 'multiplayer' && !game.grid && view === 'playing' && !multiplayerState.opponent}
            language={language}
            opponent={multiplayerState.opponent}
            isHost={multiplayerState.isHost}
            showCoinFlip={multiplayerState.showCoinFlip}
            roomId={multiplayerState.roomId}
            categoryLabel={waitingPrimaryLabel}
            secondaryCategoryLabel={waitingSecondaryLabel}
            finalSize={finalSize}
            onCancel={matchmakingActions.handleLeaveWaiting}
          />

          {view === 'playing' && (
            <div className="flex-1 min-h-0 h-full w-full flex flex-col items-center">
              {!game.grid ? (
                currentGameMode !== 'multiplayer' && (
                  <GamePreparing
                    language={language}
                    finalSize={finalSize}
                    currentGameMode={currentGameMode}
                    mergedCategories={mergedCategories}
                    finalCategory={finalCategory}
                  />
                )
              ) : (
                <React.Fragment>
                  {/* Tower Boss Indicator V2 */}
                  {runState.isActive && currentFloorConfig?.type === 'boss' && (
                    <TowerBossIndicator
                      floor={runState.floor}
                      lives={runState.lives}
                      maxLives={runState.maxLives}
                      loot={runState.loot}
                      timeRemaining={currentFloorConfig.timeLimit ? currentFloorConfig.timeLimit - game.seconds : null}
                      bossName={currentFloorConfig.bossName || 'Boss'}
                      bossAvatar={currentFloorConfig.bossAvatar || '👹'}
                      language={language}
                      hasShield={runState.hasShield}
                      hasHazardImmunity={runState.hasHazardImmunity}
                      comboMultiplier={runState.comboMultiplier}
                    />
                  )}
                  <GameViewComponent
                    grid={game.grid}
                    userGrid={game.userGrid}
                    clues={game.clues!}
                    selectedCell={game.selectedCell}
                    activeClue={game.activeClue}
                    direction={game.direction}
                    language={language}
                    player={player!}
                    localScore={game.matchScore}
                    myFilledCells={game.myFilledCells}
                    wrongAnswerCount={game.wrongAnswerCount}
                    duelLive={duel.replay ? {
                      points: duelPoints({
                        typed: game.myFilledCells.size,
                        seconds: game.seconds,
                        mistakes: game.wrongAnswerCount ?? 0,
                        assisted: game.assistedCount ?? 0,
                      }),
                      typed: game.myFilledCells.size,
                      seconds: game.seconds,
                      mistakes: game.wrongAnswerCount ?? 0,
                      assisted: game.assistedCount ?? 0,
                      opponentPoints: duel.replay.creator_points ?? duelPointsOf(duel.replay.creator_result),
                      opponentName: duel.replay.creator_name,
                    } : null}
                    gameWon={game.gameWon}
                    gameLost={game.gameLost}
                    combo={game.combo}
                    seconds={game.seconds}
                    timeLimit={currentFloorConfig?.timeLimit || undefined}
                    towerFloor={runState.isActive ? runState.floor : undefined}
                    towerLives={runState.isActive ? runState.lives : undefined}
                    towerMaxLives={runState.isActive ? runState.maxLives : undefined}
                    towerLoot={runState.isActive ? runState.loot : undefined}
                    towerHasShield={runState.isActive ? runState.hasShield : undefined}
                    worldMapAccent={worldMapAccent}
                    worldMapBgImage={worldMapBgImage}
                    worldMapWordCount={worldMapWordCount}
                    heroHp={game.heroHp}
                    monsterHp={game.monsterHp}
                    monsterRage={game.monsterRage}
                    isFinishingMove={game.isFinishingMove}
                    powerMeter={game.powerMeter}
                    powerRevealedCells={game.powerRevealedCells}
                    usePowerRevealCell={game.usePowerRevealCell}
                    usePowerRevealWord={game.usePowerRevealWord}
                    isHeroHit={game.isHeroHit}
                    isMonsterHit={game.isMonsterHit}
                    isMonsterAttacking={game.isMonsterAttacking}
                    isHeroHeal={game.isHeroHeal}
                    onKeyPress={nav.handleInput}
                    onBackspace={() => {
                        game.handleBackspace(multiplayerState.isFrozen);
                    }}
                    onSelect={game.updateSelection}
                    onNextClue={() => game.handleNavigateClue(1)}
                    onPrevClue={() => game.handleNavigateClue(-1)}
                    onToggleDirection={game.toggleDirection}
                    canToggle={game.canToggleDirection}
                    onHint={() => setShowHintModal(true)}
                    onShowToast={() => {}}
                    onProfileClick={() => setShowProfileModal(true)}
                    onHomeClick={nav.handleHomeClick}
                    onOpenShop={() => setShopOpen(true)}
                    isMultiplayer={currentGameMode === 'multiplayer'}
                    isArena={multiplayerState.matchType === 'arena'}
                    gameMode={multiplayerState.gameMode}
                    opponent={multiplayerState.opponent}
                    opponentScore={multiplayerState.opponentScore}
                    opponentProgress={multiplayerState.opponentProgress}
                    opponentFilled={multiplayerState.opponentFilled}
                    setOpponentFilled={multiplayerState.setOpponentFilled}
                    setUserGrid={game.setUserGrid}
                    onZapCell={(r, c) => { /* handled internally */ }}
                    mana={multiplayerState.mana}
                    setMana={multiplayerState.setMana}
                    isFrozen={multiplayerState.isFrozen}
                    isBlinded={multiplayerState.isBlinded}
                    spawnFloatingEmoji={multiplayerState.spawnFloatingEmoji}
                    floatingEmojis={multiplayerState.floatingEmojis}
                    entranceKey={entranceKey}
                    selectedBook={selectedBook}
                    currentChapterIndex={game.currentChapterIndex || 1}
                    category={currentGameMode === 'multiplayer' ? (isFA ? getCategoryNameFa(category) : getCategoryNameEn(category)) : undefined}
                    gridSize={currentGameMode === 'multiplayer' ? size : undefined}
                  />
                </React.Fragment>
              )}
            </div>
          )}

          {game.gameLost && currentGameMode === 'story' && (
            <StoryLoseScreen
              currentChapterIndex={game.currentChapterIndex || 1}
              player={player}
              onCoinsChange={onCoinsChange}
              onRevive={game.reviveHero}
              onRetry={(daily, chapterId) => nav.onGenerateClick(daily, chapterId)}
              onBackToChapters={() => { setView('epic_chapters'); game.resetGame(); }}
            />
          )}

          {/* Don't show GameResultScreen for World Map games — skip directly to chapters with card fly-in */}
          {!(currentGameMode === 'casual' && !!selectedLegend) && <GameResultScreen
            view={view}
            gameWon={game.gameWon}
            currentGameMode={currentGameMode}
            language={language}
            category={category}
            currentChapterIndex={game.currentChapterIndex || 1}
            selectedBook={selectedBook}
            lastWinStars={lastWinStars}
            player={player}
            finalResult={multiplayerState.finalResult}
            opponent={multiplayerState.opponent}
            gameMode={multiplayerState.gameMode}
            battleWager={battleWager}
            trophyChange={trophyChange}
            matchType={multiplayerState.matchType}
            matchScore={game.matchScore}
            onReturnToMenu={nav.returnToMenu}
            onBackToChapters={() => { setView('epic_chapters'); game.resetGame(); }}
            onRematch={async () => {
              await nav.returnToMenu();
              setTimeout(() => {
                setCurrentGameMode('multiplayer');
                setView('lobby');
              }, 200);
            }}
            categoryNameFa={getCategoryNameFa(category)}
            categoryNameEn={getCategoryNameEn(category)}
            gridSize={size}
          />}

          {globalScrollAward && (
            <ScrollRevealCeremony
              award={globalScrollAward}
              onEquipNow={(scrollKey) => {
                gameServer.toggleDeckCard(scrollKey);
              }}
              onClose={() => setGlobalScrollAward(null)}
            />
          )}
        </React.Suspense>
      </main>
    </>
  );
});
