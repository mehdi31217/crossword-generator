import React from 'react';
import { Language, PlayerState, StoryBook, GridSize, Category, LoadingStage, TowerRunState, TowerShopItem, GameView as ViewType } from '../types';
import { gameServer, AuthResult } from '../utils/gameServer';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { MultiplayerRetryModal } from './modals/MultiplayerRetryModal';
import TowerShopModal from './modals/TowerShopModal';
import { TowerCashOutSuccessModal } from './modals/TowerCashOutSuccessModal';
import { TowerQuitConfirmModal } from './modals/TowerQuitConfirmModal';
import { TowerLossModal } from './modals/TowerLossModal';
import { IncomingChallengeNotification } from './IncomingChallengeNotification';
import { BattleInviteDialog } from './BattleInviteDialog';
import { StoryModal } from './StoryModal';
import { DbSetupModal } from './DbSetupModal';
import { LeaveConfirmModal } from './modals/LeaveConfirmModal';
import { AuthModal } from './AuthModal';
import { HintModal } from './HintModal';
import { ShopModal } from './ShopModal';
import { LoadingOverlay } from './LoadingOverlay';

interface ChallengeState {
  incomingChallenge: any;
  showChallengeAcceptDialog: boolean;
  joinerSize: GridSize;
  joinerCategory: Category;
  setJoinerSize: (s: GridSize) => void;
  setJoinerCategory: (c: Category) => void;
  handleChallengeClickAccept: () => void;
  handleChallengeClickDecline: () => void;
  handleChallengeDialogAccept: () => void;
  setIncomingChallenge: (n: any) => void;
  setShowChallengeAcceptDialog: (v: boolean) => void;
}

interface GameActions {
  grid: any[][] | null;
  loadingStage: LoadingStage;
  retryCount: number;
  maxRetries: number;
  seconds: number;
  error: string | null;
  setError: (e: string | null) => void;
  resetGame: () => void;
  startTimer: () => void;
  generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: any[]) => Promise<any>;
}

interface MultiplayerState {
  isHost: boolean;
}

interface NavActions {
  returnToMenu: () => Promise<void>;
  onGenerateClick: (daily?: boolean, chapterOverride?: number) => Promise<void>;
}

interface TowerActions {
  handleTowerContinue: () => void;
  handleTowerCashOut: () => void;
  handleTowerQuit: () => void;
}

interface MatchmakingActions {
  handleMultiplayerRetry: () => Promise<void>;
  handleMultiplayerCancel: () => Promise<void>;
}

export interface GameModalsProps {
  // Shared
  language: Language;
  player: PlayerState | null;
  currentGameMode: string;
  /** Server-returned balance, so a cosmetic purchase updates the coin pill. */
  onCoinsChange?: (coins: number) => void;
  onPlayerSync?: (patch: Partial<PlayerState>) => void;
  // Needed by the loading overlay's retry: it re-runs the generator, and without
  // this the retry silently came back as a casual puzzle instead of the daily.
  isDaily: boolean;

  // Multiplayer retry
  showMultiplayerRetryModal: boolean;
  game: GameActions;
  multiplayerState: MultiplayerState;
  matchmakingActions: MatchmakingActions;

  // Tower modals
  showMainShop: boolean;
  showTowerCashOutModal: boolean;
  showTowerQuitConfirm: boolean;
  showTowerLossModal: boolean;
  towerLossReason: 'time' | 'lives' | 'quit';
  runState: TowerRunState;
  shopItems: TowerShopItem[];
  buyShopItem: (item: TowerShopItem) => boolean;
  towerActions: TowerActions;
  currentFloorConfig: { type?: string; timeLimit?: number; bossName?: string; bossAvatar?: string } | null;
  gameOverFn: () => void;  // gameOver from tower mode
  setShowTowerCashOutModal: (v: boolean) => void;
  setShowTowerLossModal: (v: boolean) => void;
  setShowTowerQuitConfirm: (v: boolean) => void;
  setView: (v: ViewType) => void;
  setIsCashingOut: (v: boolean) => void;

  // Challenge / BattleInvite
  challengeState: ChallengeState;
  deleteNotification: (id: string) => void;

  // Story modal
  showStoryModal: boolean;
  setShowStoryModal: (v: boolean) => void;
  selectedBook: StoryBook | null;
  pendingChapterId: number | null;
  pendingChapterRef: React.MutableRefObject<number | null>;
  entranceKey: number;
  setEntranceKey: (fn: (k: number) => number) => void;

  // DB Setup
  showDbSetupModal: boolean;
  setShowDbSetupModal: (v: boolean) => void;
  showToastFn: (msg: string) => void;

  // Leave confirm
  showLeaveConfirm: boolean;
  setShowLeaveConfirm: (v: boolean) => void;
  nav: NavActions;

  // Auth
  showAuthModal: boolean;
  pendingScore: number;
  handleRegister: (phone: string, pass: string, stats: { score: number; coins: number; epicProgress: Record<string, number> } | undefined, setPlayer: (p: PlayerState | null) => void) => Promise<AuthResult>;
  setShowAuthModal: (v: boolean) => void;

  // Hint
  showHintModal: boolean;
  handleRevealCell: () => void;
  handleRevealWord: () => void;
  setShowHintModal: (v: boolean) => void;

  // Shop
  shopOpen: boolean;
  handleShopPurchase: (itemId: string, cost: number) => void;
  setShopOpen: (v: boolean) => void;
}

export const GameModals: React.FC<GameModalsProps> = React.memo((props) => {
  const { language, player, currentGameMode } = props;

  return (
    <>
      {/* MULTIPLAYER RETRY MODAL */}
      <MultiplayerRetryModal
        isOpen={props.showMultiplayerRetryModal && props.multiplayerState.isHost}
        language={language}
        loadingStage={props.game.loadingStage}
        onRetry={props.matchmakingActions.handleMultiplayerRetry}
        onCancel={props.matchmakingActions.handleMultiplayerCancel}
      />

      {/* TOWER SHOP MODAL V2 */}
      <TowerShopModal
        isOpen={props.showMainShop && !props.showTowerCashOutModal}
        runState={props.runState}
        shopItems={props.shopItems}
        onBuyItem={props.buyShopItem}
        onContinue={props.towerActions.handleTowerContinue}
        onCashOut={props.towerActions.handleTowerCashOut}
        language={language}
      />

      {/* TOWER CASH OUT SUCCESS MODAL */}
      <TowerCashOutSuccessModal
        isOpen={props.showTowerCashOutModal}
        language={language}
        coinsEarned={props.runState.loot}
        floorsCleared={props.runState.floor}
        onContinue={() => {
          props.setShowTowerCashOutModal(false);
          props.setView('tower_lobby');
          props.game.resetGame();
          props.setIsCashingOut(false);
        }}
      />

      {/* TOWER QUIT CONFIRM MODAL */}
      <TowerQuitConfirmModal
        isOpen={props.showTowerQuitConfirm}
        language={language}
        lootAtRisk={props.runState.loot}
        currentFloor={props.runState.floor}
        onConfirmQuit={props.towerActions.handleTowerQuit}
        onCancel={() => props.setShowTowerQuitConfirm(false)}
      />

      {/* TOWER LOSS SCREEN V2 */}
      <TowerLossModal
        isOpen={props.showTowerLossModal}
        language={language}
        lostLoot={props.runState.loot}
        floor={props.runState.floor}
        reason={props.towerLossReason}
        totalMistakes={props.runState.mistakes}
        isBossFloor={props.currentFloorConfig?.type === 'boss'}
        onReturn={() => {
          props.gameOverFn();
          props.setShowTowerLossModal(false);
          props.setView('tower_lobby');
          props.game.resetGame();
        }}
      />

      <IncomingChallengeNotification
        incomingChallenge={props.challengeState.showChallengeAcceptDialog ? null : props.challengeState.incomingChallenge}
        language={language}
        onAccept={() => {
          props.setView('menu');
          props.challengeState.handleChallengeClickAccept();
        }}
        onDecline={() => {
          const nId = props.challengeState.incomingChallenge?.id;
          props.challengeState.handleChallengeClickDecline();
          if (nId) props.deleteNotification(nId);
        }}
      />

      <BattleInviteDialog
        show={props.challengeState.showChallengeAcceptDialog && !!props.challengeState.incomingChallenge}
        mode="accept"
        language={language}
        playerScore={player?.score || 0}
        opponentName={props.challengeState.incomingChallenge?.senderName || ''}
        size={props.challengeState.joinerSize}
        category={props.challengeState.joinerCategory}
        onSizeChange={(s) => props.challengeState.setJoinerSize(s)}
        onCategoryChange={(c) => props.challengeState.setJoinerCategory(c)}
        opponentSize={props.challengeState.incomingChallenge?.payload?.size || 5}
        opponentCategory={props.challengeState.incomingChallenge?.payload?.category || 'all'}
        onPrimaryAction={props.challengeState.handleChallengeDialogAccept}
        onCancel={() => props.challengeState.setShowChallengeAcceptDialog(false)}
      />

      <StoryModal
        show={props.showStoryModal && !!props.selectedBook && currentGameMode === 'story'}
        language={language}
        selectedBook={props.selectedBook}
        chapterImage={props.selectedBook?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.image || [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === props.selectedBook?.id)?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.image}
        chapterTitle={props.selectedBook?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.title || [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === props.selectedBook?.id)?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.title}
        chapterDescription={props.selectedBook?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.description || [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === props.selectedBook?.id)?.chapters.find(c => String(c.id) === String(props.pendingChapterId))?.description}
        onStart={async () => {
          const chapterId = props.pendingChapterRef.current;
          if (chapterId && props.selectedBook) {
            const chapterData = props.selectedBook.chapters.find(c => String(c.id) === String(chapterId));
            let words = chapterData?.words;
            if (!words || words.length === 0) {
              const bundled = [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === props.selectedBook?.id);
              const bundledCh = bundled?.chapters.find(c => String(c.id) === String(chapterId));
              words = bundledCh?.words;
            }
            props.setEntranceKey(k => k + 1);
            if (!props.game.grid) {
              await props.game.generateGrid(false, 7, Number(chapterId), words);
            }
          }
          props.setShowStoryModal(false);
          props.game.startTimer?.();
        }}
        onClose={() => props.setShowStoryModal(false)}
      />

      <DbSetupModal
        show={props.showDbSetupModal}
        language={language}
        onCopySQL={() => { navigator.clipboard.writeText(gameServer.getCompleteSchemaSQL()); props.showToastFn('کپی شد!'); }}
        onClose={() => props.setShowDbSetupModal(false)}
      />

      {/* LEAVE CONFIRM MODAL - Multiplayer */}
      <LeaveConfirmModal
        isOpen={props.showLeaveConfirm}
        language={language}
        onConfirm={async () => {
          props.setShowLeaveConfirm(false);
          await props.nav.returnToMenu();
        }}
        onCancel={() => props.setShowLeaveConfirm(false)}
      />

      {props.showAuthModal && (
        <AuthModal
          language={language}
          scoreToSave={props.pendingScore}
          guestStats={{
            score: player?.score || 0,
            // `?? 250`, not `|| 250`: a genuinely drained balance of 0 must be
            // sent as 0, not silently rewritten to 250.
            coins: player?.coins ?? 250,
            // Pass the real progress map. This used to be the bare number 1, which
            // the server then wrote into the `epic_progress_map` JSONB column as
            // the scalar `1` — an unreadable map.
            epicProgress: player?.epicProgress || { rostam_7: 1 },
          }}
          onRegister={(phone, pass, stats) => props.handleRegister(phone, pass, stats, () => {})}
          onSkip={() => props.setShowAuthModal(false)}
        />
      )}

      {/* Hint Modal */}
      {props.showHintModal && (
        <HintModal
          language={language}
          coins={player?.coins || 0}
          onClose={() => props.setShowHintModal(false)}
          onRevealCell={props.handleRevealCell}
          onRevealWord={props.handleRevealWord}
        />
      )}

      {/* SHOP MODAL */}
      <ShopModal
        isOpen={props.shopOpen}
        player={player}
        language={language}
        onClose={() => props.setShopOpen(false)}
        onPurchase={(itemId, cost) => props.handleShopPurchase(itemId, cost)}
        onCoinsChange={props.onCoinsChange}
        onPlayerSync={props.onPlayerSync}
      />

      <LoadingOverlay
        loadingStage={props.game.loadingStage}
        retryCount={props.game.retryCount}
        maxRetries={props.game.maxRetries}
        language={language}
        error={props.game.error}
        // `props.isDaily` matters: called with no argument, `dailyMode` defaults to
        // false, so retrying after a failed DAILY generation silently produced an
        // ordinary puzzle — wrong size, no daily lock, no prize.
        onRetry={() => { props.game.setError(null); props.nav.onGenerateClick(props.isDaily) }}
      />
    </>
  );
});
