import { PlayerState, ViewType, GameMode, GridSize, Category, Language, Grid, Clue, DictionaryEntry, TowerRunState } from '../types';
import { gameServer } from '../utils/gameServer';

interface TowerModeActions {
    runState: TowerRunState;
    currentFloorConfig: { gridSize: GridSize; timeLimit?: number; type?: string; bossName?: string; bossAvatar?: string } | null;
    startTowerRun: () => void;
    advanceToNextFloor: () => void;
    cashOut: () => number;
    gameOver: () => void;
    getTowerFloorConfig: (floor: number) => { gridSize: GridSize; timeLimit?: number; type?: string; bossName?: string; bossAvatar?: string } | null;
}

interface TowerUIActions {
    setIsCashingOut: (v: boolean) => void;
    setShowTowerCashOutModal: (v: boolean) => void;
    setShowTowerQuitConfirm: (v: boolean) => void;
    setTowerLossReason: (r: 'time' | 'lives' | 'quit') => void;
    setShowTowerLossModal: (v: boolean) => void;
}

interface AppActions {
    setView: (v: ViewType) => void;
    setCurrentGameMode: (m: GameMode) => void;
    setSize: (s: GridSize) => void;
    setCategory: (c: Category) => void;
    setPlayer: (p: PlayerState | null) => void;
    setShowShop: (v: boolean) => void;
}

interface GameActions {
    resetGame: () => void;
    generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: DictionaryEntry[]) => Promise<{ grid: Grid; clues: { across: import('../types').Clue[]; down: import('../types').Clue[] } } | null>;
    setGameWon: (v: boolean) => void;
    setGameLost: (v: boolean) => void;
    matchScore: number;
    myFilledCells: Set<string>;
    selectedCell: { r: number; c: number } | null;
    setUserGrid: (g: string[][]) => void;
    updateSelection: (r: number, c: number) => void;
    setActiveClue: (c: import('../types').Clue) => void;
    setDirection: (d: 'across' | 'down') => void;
    powerRevealedCells: Set<string>;
    handleKeyPress: (key: string, frozen: boolean) => { wasMistake?: boolean; isWordComplete?: boolean; activeClue?: import('../types').Clue } | null;
    handleBackspace: (frozen: boolean) => void;
    handleNavigateClue: (dir: number) => void;
    toggleDirection: () => void;
    canToggleDirection: boolean;
}

// Minimal game interface needed for tower actions
interface TowerGameActions {
    resetGame: () => void;
    generateGrid: (daily?: boolean, size?: GridSize, chapterOverride?: number, storyWords?: DictionaryEntry[]) => Promise<{ grid: Grid; clues: { across: import('../types').Clue[]; down: import('../types').Clue[] } } | null>;
    setGameWon: (v: boolean) => void;
    setGameLost: (v: boolean) => void;
}

export function useTowerActions(
    player: PlayerState | null,
    language: Language,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    appActions: AppActions,
    tower: TowerModeActions,
    ui: TowerUIActions,
    game: TowerGameActions,
) {
    const handleEnterTower = async () => {
        if (!player || player.towerTickets < 1) {
            showToast(language === 'fa' ? 'بلیط کافی ندارید!' : 'Not enough tickets!', 'error');
            return;
        }

        // Switch to playing view IMMEDIATELY to avoid flickering
        appActions.setView('playing');
        appActions.setCurrentGameMode('tower');

        // Prepare the game - FULL RESET
        game.resetGame();
        appActions.setSize(5);
        appActions.setCategory('all');

        const res = await game.generateGrid(false, 5);

        if (!res) {
            showToast(language === 'fa' ? 'خطا در ساخت جدول. دوباره تلاش کنید.' : 'Error generating grid. Please retry.', 'error');
            appActions.setView('tower_lobby');
            appActions.setCurrentGameMode('casual');
            return;
        }

        // Grid generated successfully - NOW consume ticket and start
        const updatedPlayer = await gameServer.consumeTowerTicket(player);
        appActions.setPlayer(updatedPlayer);

        // Start tower run (view is already set to 'playing')
        tower.startTowerRun();
    };

    const startTowerFloor = async (floor: number) => {
        // Switch to playing view IMMEDIATELY to prevent flickering back to lobby
        appActions.setView('playing');

        game.resetGame();

        // Resolve the config for the REQUESTED floor first. `currentFloorConfig`
        // may still describe the previous floor right after advanceToNextFloor().
        const config = tower.getTowerFloorConfig(floor) || tower.currentFloorConfig;
        if (!config) {
            appActions.setView('tower_lobby');
            return;
        }

        appActions.setSize(config.gridSize);
        appActions.setCategory('all');

        const res = await game.generateGrid(false, config.gridSize);
        if (!res) {
            showToast(language === 'fa' ? 'خطا در ساخت جدول' : 'Error generating grid', 'error');
            appActions.setView('tower_lobby');
        }
        // If successful, view is already 'playing' - no need to set again
    };

    const handleTowerCashOut = async () => {
        // Mark that we're cashing out (not losing)
        ui.setIsCashingOut(true);

        const finalLoot = tower.cashOut();

        // IMPORTANT: Reset game state to prevent win/lose screens from showing
        game.setGameWon(false);
        game.setGameLost(false);

        if (player && finalLoot > 0) {
            const updatedPlayer = await gameServer.updateTowerStats(player, finalLoot, tower.runState.floor);
            appActions.setPlayer(updatedPlayer);

            // Open success modal and close shop modal simultaneously
            ui.setShowTowerCashOutModal(true);
            appActions.setShowShop(false);
        } else {
            // If no loot, just go back to lobby
            appActions.setShowShop(false);
            appActions.setView('tower_lobby');
            game.resetGame();
            ui.setIsCashingOut(false);
        }
    };

    const handleTowerContinue = async () => {
        const nextFloor = tower.runState.floor + 1;
        tower.advanceToNextFloor();
        appActions.setShowShop(false);

        await startTowerFloor(nextFloor);
    };

    const handleTowerQuit = () => {
        ui.setShowTowerQuitConfirm(false);
        ui.setTowerLossReason('quit');
        ui.setShowTowerLossModal(true);
        tower.gameOver();
    };

    return {
        handleEnterTower,
        startTowerFloor,
        handleTowerCashOut,
        handleTowerContinue,
        handleTowerQuit,
    };
}
