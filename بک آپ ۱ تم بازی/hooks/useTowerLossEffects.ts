import { useEffect, useRef } from 'react';

interface TowerLossRunState {
    lives?: number;
    floor: number;
    isActive: boolean;
}

interface TowerLossCurrentFloorConfig {
    timeLimit?: number;
}

interface TowerLossGame {
    seconds: number;
}

interface TowerLossActions {
    setLivesShaking: (v: boolean) => void;
    setTowerLossReason: (r: 'time' | 'lives' | 'quit') => void;
    setShowTowerLossModal: (v: boolean) => void;
}

export function useTowerLossEffects(
    view: string,
    runState: TowerLossRunState,
    currentFloorConfig: TowerLossCurrentFloorConfig | undefined,
    game: TowerLossGame,
    isCashingOut: boolean,
    actions: TowerLossActions,
) {
    const prevLivesRef = useRef<number | undefined>(undefined);
    const prevRunStateRef = useRef<TowerLossRunState>(runState);
    const towerLossTriggeredRef = useRef(false);

    // Detect life loss and trigger shake animation
    useEffect(() => {
        if (runState.lives !== undefined && prevLivesRef.current !== undefined) {
            if (runState.lives < prevLivesRef.current) {
                actions.setLivesShaking(true);
                setTimeout(() => actions.setLivesShaking(false), 500);
            }
        }
        prevLivesRef.current = runState.lives;
    }, [runState.lives]);

    // Tower Mode Loss Detection
    useEffect(() => {
        // Reset loss trigger when view changes away from playing or when starting new tower run
        if (view !== 'playing' || (runState.isActive && runState.floor === 1 && prevRunStateRef.current.floor !== 1)) {
            towerLossTriggeredRef.current = false;
        }

        // Only trigger loss modal if we're IN a tower run and haven't already triggered it
        if (view === 'playing' && !towerLossTriggeredRef.current && !isCashingOut) {
            // Check for lives = 0 (run became inactive but floor > 0)
            if (!runState.isActive && runState.floor > 0 && prevRunStateRef.current.isActive) {
                actions.setTowerLossReason('lives');
                actions.setShowTowerLossModal(true);
                towerLossTriggeredRef.current = true;
            }
            // Check for time out
            else if (runState.isActive && currentFloorConfig?.timeLimit && game.seconds >= currentFloorConfig.timeLimit) {
                actions.setTowerLossReason('time');
                actions.setShowTowerLossModal(true);
                towerLossTriggeredRef.current = true;
            }
        }

        prevRunStateRef.current = runState;
    }, [view, runState, currentFloorConfig, game.seconds]);
}
