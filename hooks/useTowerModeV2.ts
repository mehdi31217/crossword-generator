import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TowerRunState,
  TowerFloorConfig,
  TowerShopItem
} from '../types';
import { TOWER_FLOOR_REWARD } from '../utils/economy';

/**
 * Tower Mode V2 - Advanced Hook
 * Features: HP System, Boss Floors, Shop, Progressive Difficulty
 */

// ============================================
// FLOOR CONFIGURATION GENERATOR
// ============================================

export const getTowerFloorConfig = (floor: number): TowerFloorConfig => {
  const isBossFloor = floor % 5 === 0;
  
  if (isBossFloor) {
    return {
      floor,
      type: 'boss',
      gridSize: 8,
      timeLimit: 150,
      hazardChance: 0.3,
      baseReward: floor * TOWER_FLOOR_REWARD.boss,
      bossName: `باس طبقه ${floor}`,
      bossAvatar: '👹'
    };
  }
  
  // Normal floors - Progressive difficulty
  if (floor <= 3) {
    return {
      floor,
      type: 'normal',
      gridSize: 5,
      timeLimit: null, // No time limit
      hazardChance: 0,
      baseReward: floor * TOWER_FLOOR_REWARD.normal
    };
  } else if (floor <= 6) {
    return {
      floor,
      type: 'normal',
      gridSize: 6,
      timeLimit: 180,
      hazardChance: 0.2,
      baseReward: floor * TOWER_FLOOR_REWARD.normal
    };
  } else if (floor <= 9) {
    return {
      floor,
      type: 'normal',
      gridSize: 7,
      timeLimit: 120,
      hazardChance: 0.4,
      baseReward: floor * TOWER_FLOOR_REWARD.normal
    };
  } else {
    return {
      floor,
      type: 'normal',
      gridSize: 7,
      timeLimit: 90,
      hazardChance: 0.6,
      baseReward: floor * TOWER_FLOOR_REWARD.deep
    };
  }
};

// ============================================
// SHOP ITEMS
// ============================================

export const TOWER_SHOP_ITEMS: TowerShopItem[] = [
  {
    id: 'extra_life',
    name: '❤️ جان اضافی',
    nameEn: '❤️ Extra Life',
    description: 'یک جان اضافی برای ادامه مبارزه',
    descriptionEn: 'One additional life to continue',
    cost: 50,
    icon: '❤️',
    effect: 'extra_life'
  },
  {
    id: 'time_boost',
    name: '⏰ زمان بیشتر',
    nameEn: '⏰ Time Boost',
    description: '+30 ثانیه به زمان طبقه بعد',
    descriptionEn: '+30 seconds to next floor',
    cost: 30,
    icon: '⏰',
    effect: 'time_boost'
  },
  {
    id: 'shield',
    name: '🛡️ سپر محافظ',
    nameEn: '🛡️ Shield',
    description: 'یک اشتباه رایگان',
    descriptionEn: 'One free mistake',
    cost: 40,
    icon: '🛡️',
    effect: 'shield'
  },
  {
    id: 'hazard_immunity',
    name: '✨ مصونیت',
    nameEn: '✨ Hazard Immunity',
    description: 'ایمنی در برابر موانع طبقه بعد',
    descriptionEn: 'Immunity to hazards for next floor',
    cost: 60,
    icon: '✨',
    effect: 'hazard_immunity'
  }
];

// ============================================
// HOOK
// ============================================

export const useTowerModeV2 = () => {
  const [runState, setRunState] = useState<TowerRunState>({
    floor: 0,
    lives: 5,
    maxLives: 5,
    loot: 0,
    isActive: false,
    mistakes: 0,
    timeBonus: 0,
    hasShield: false,
    hasHazardImmunity: false,
    comboMultiplier: 1.0
  });
  // Ref that always holds the latest runState (avoids stale closure issues)
  const runStateRef = useRef(runState);
  runStateRef.current = runState;

  const [showShop, setShowShop] = useState(false);
  const [currentFloorConfig, setCurrentFloorConfig] = useState<TowerFloorConfig | null>(null);

  // ============================================
  // START NEW RUN
  // ============================================
  const startTowerRun = useCallback(() => {
    const initialFloor = 1;
    const config = getTowerFloorConfig(initialFloor);
    
    setRunState({
      floor: initialFloor,
      lives: 5, // START with 5 lives, not 3
      maxLives: 5,
      loot: 0,
      isActive: true,
      mistakes: 0,
      timeBonus: 0,
      hasShield: false,
      hasHazardImmunity: false,
      comboMultiplier: 1.0
    });
    
    setCurrentFloorConfig(config);
    setShowShop(false);
  }, []);

  // ============================================
  // HANDLE MISTAKE
  // ============================================
  const handleMistake = useCallback(() => {
    setRunState(prev => {
      // If shield is active, consume it (but still count mistake)
      if (prev.hasShield) {
        return {
          ...prev,
          hasShield: false,
          mistakes: prev.mistakes + 1
        };
      }

      // Lose HALF a life (0.5) per mistake
      const newLives = prev.lives - 0.5;
      const newMistakes = prev.mistakes + 1;

      // Game over if lives <= 0
      if (newLives <= 0) {
        return {
          ...prev,
          lives: 0,
          mistakes: newMistakes,
          comboMultiplier: 1.0,
          isActive: false // Game over
        };
      }

      // Reset combo if mistake
      return {
        ...prev,
        lives: newLives,
        mistakes: newMistakes,
        comboMultiplier: 1.0,
        isActive: true
      };
    });
  }, []);

  // ============================================
  // COMPLETE FLOOR
  // ============================================
  const completeFloor = useCallback(() => {
    setRunState(prev => {
      // Derive the config from the floor being completed (not from a possibly
      // stale `currentFloorConfig` captured in this closure), so the reward
      // always matches the correct floor.
      const config = getTowerFloorConfig(prev.floor);
      if (!config) return prev;

      // Calculate reward
      let reward = config.baseReward;
      
      // Boss floor bonus - ONLY 1.1x multiplier (not 3x)
      if (config.type === 'boss') {
        reward = Math.floor(reward * 1.1);
      }
      
      // No mistake bonus (only for normal floors, not stacking with boss)
      if (prev.mistakes === 0 && config.type !== 'boss') {
        reward = Math.floor(reward * 1.5);
        // Increase combo multiplier
        const newCombo = Math.min(prev.comboMultiplier + 0.1, 2.0);
        reward = Math.floor(reward * newCombo);
      }

      const newLoot = prev.loot + reward;

      // DO NOT restore lives - lives stay constant throughout tower run
      // Only shop items can restore lives

      // Reset floor-specific states
      return {
        ...prev,
        // lives: stays the same, no automatic restoration
        loot: newLoot,
        mistakes: 0,
        timeBonus: 0,
        hasHazardImmunity: false,
        comboMultiplier: prev.mistakes === 0 ? Math.min(prev.comboMultiplier + 0.1, 2.0) : 1.0
      };
    });

    // Show shop after floor
    setShowShop(true);
  }, []);

  // ============================================
  // ADVANCE TO NEXT FLOOR
  // ============================================
  const advanceToNextFloor = useCallback(() => {
    let nextFloor = 0;
    setRunState(prev => {
      nextFloor = prev.floor + 1;
      return {
        ...prev,
        floor: nextFloor
      };
    });
    // Call setCurrentFloorConfig OUTSIDE setRunState updater to avoid side effects
    if (nextFloor > 0) {
      setCurrentFloorConfig(getTowerFloorConfig(nextFloor));
    }
    setShowShop(false);
  }, []);

  // ============================================
  // CASH OUT (Leave tower with loot)
  // ============================================
  const cashOut = useCallback(() => {
    setRunState(prev => ({
      ...prev,
      isActive: false
    }));
    setShowShop(false);
    return runStateRef.current.loot;
  }, []);

  // ============================================
  // GAME OVER (Lost all lives) - LOSE EVERYTHING
  // ============================================
  const gameOver = useCallback(() => {
    setRunState(prev => ({
      ...prev,
      isActive: false,
      loot: 0 // RESET LOOT - player loses everything
    }));
    setShowShop(false);

    // Return stats showing player LOST everything
    return {
      floor: runStateRef.current.floor,
      loot: 0, // Player gets NOTHING when they die
      reason: 'lives'
    };
  }, []);

  // ============================================
  // TIME OVER
  // ============================================
  const timeOver = useCallback(() => {
    setRunState(prev => ({
      ...prev,
      isActive: false
    }));
    setShowShop(false);

    // Boss floor: lose 50% loot
    // Normal floor: lose all loot
    const isBoss = currentFloorConfig?.type === 'boss';
    const finalLoot = isBoss ? Math.floor(runStateRef.current.loot * 0.5) : 0;

    return {
      floor: runStateRef.current.floor,
      loot: finalLoot,
      reason: 'time'
    };
  }, [currentFloorConfig]);

  // ============================================
  // BUY SHOP ITEM
  // ============================================
  const buyShopItem = useCallback((item: TowerShopItem): boolean => {
    if (runStateRef.current.loot < item.cost) return false;

    setRunState(prev => {
      const newLoot = prev.loot - item.cost;
      
      switch (item.effect) {
        case 'extra_life':
          return {
            ...prev,
            loot: newLoot,
            lives: Math.min(prev.lives + 1, prev.maxLives)
          };
        case 'time_boost':
          return {
            ...prev,
            loot: newLoot,
            timeBonus: 30
          };
        case 'shield':
          return {
            ...prev,
            loot: newLoot,
            hasShield: true
          };
        case 'hazard_immunity':
          return {
            ...prev,
            loot: newLoot,
            hasHazardImmunity: true
          };
        default:
          return prev;
      }
    });

    return true;
  }, []);

  return {
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
    shopItems: TOWER_SHOP_ITEMS,
    getTowerFloorConfig // Export the function for external use
  };
};
