import { useState, useRef } from 'react';

export function useTowerUI() {
    const [showTowerLossModal, setShowTowerLossModal] = useState(false);
    const [showTowerCashOutModal, setShowTowerCashOutModal] = useState(false);
    const [showTowerQuitConfirm, setShowTowerQuitConfirm] = useState(false);
    const [towerLossReason, setTowerLossReason] = useState<'time' | 'lives' | 'quit'>('lives');
    const [isCashingOut, setIsCashingOut] = useState(false);
    const [livesShaking, setLivesShaking] = useState(false);
    const prevLivesRef = useRef<number | undefined>(undefined);

    return {
        showTowerLossModal, setShowTowerLossModal,
        showTowerCashOutModal, setShowTowerCashOutModal,
        showTowerQuitConfirm, setShowTowerQuitConfirm,
        towerLossReason, setTowerLossReason,
        isCashingOut, setIsCashingOut,
        livesShaking, setLivesShaking,
        prevLivesRef,
    };
}
