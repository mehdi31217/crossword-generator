import { useState } from 'react';
import { GridSize, PlayerState, Language } from '../types';
import { gameServer } from '../utils/gameServer';

type TowerRunState = {
    floor: number;
    loot: number;
    isActive: boolean;
};

type TowerHazard = 'none' | 'freeze' | 'blind';

export const useTowerMode = (
  player: PlayerState | null,
  showToast: (msg: string, type?: 'success' | 'error') => void,
  language: Language
) => {
  const [towerRun, setTowerRun] = useState<TowerRunState>({ floor: 1, loot: 0, isActive: false });
  const [showTowerRestModal, setShowTowerRestModal] = useState(false);
  const [towerTimeLimit, setTowerTimeLimit] = useState<number | undefined>(undefined);
  const [towerHazard, setTowerHazard] = useState<TowerHazard>('none');

  const handleEnterTower = async (consumeTicket: (p: PlayerState) => Promise<PlayerState>) => {
    if (!player) return;
    if (player.towerTickets <= 0) {
      showToast(language === 'fa' ? 'بلیط ندارید!' : 'No Tickets!', 'error');
      return;
    }

    await consumeTicket(player);
    setTowerRun({ floor: 1, loot: 0, isActive: true });
    return 1; // Return floor to start
  };

  const configureTowerLevel = (floor: number): { gridSize: GridSize; timeLimit?: number } => {
    let gridSize: GridSize = 5;
    let timeLimit: number | undefined = undefined;

    if (floor <= 3) {
      gridSize = 5;
    } else if (floor <= 6) {
      gridSize = 6;
      timeLimit = 180;
    } else if (floor <= 9) {
      gridSize = 7;
      timeLimit = 120;
    } else {
      gridSize = 7;
      timeLimit = 90;
    }

    setTowerTimeLimit(timeLimit);
    return { gridSize, timeLimit };
  };

  const handleTowerWin = () => {
    const floorLoot = towerRun.floor * 10;
    setTowerRun(prev => ({
      ...prev,
      loot: prev.loot + floorLoot
    }));
    setTowerHazard('none');
    setShowTowerRestModal(true);
  };

  const handleTowerCashOut = async () => {
    if (!player) return;
    
    const updatedPlayer = await gameServer.updateTowerStats(player, towerRun.loot, towerRun.floor);
    showToast(language === 'fa' ? `${towerRun.loot} سکه ذخیره شد!` : `Cashed out ${towerRun.loot} coins!`);
    
    setTowerRun({ floor: 1, loot: 0, isActive: false });
    setShowTowerRestModal(false);
    return updatedPlayer;
  };

  const handleTowerNextFloor = () => {
    setTowerRun(prev => ({ ...prev, floor: prev.floor + 1 }));
    setShowTowerRestModal(false);
    return towerRun.floor + 1;
  };

  const resetTower = () => {
    setTowerRun({ floor: 1, loot: 0, isActive: false });
    setTowerHazard('none');
    setShowTowerRestModal(false);
    setTowerTimeLimit(undefined);
  };

  return {
    towerRun,
    showTowerRestModal,
    towerTimeLimit,
    towerHazard,
    setTowerHazard,
    handleEnterTower,
    configureTowerLevel,
    handleTowerWin,
    handleTowerCashOut,
    handleTowerNextFloor,
    resetTower
  };
};
