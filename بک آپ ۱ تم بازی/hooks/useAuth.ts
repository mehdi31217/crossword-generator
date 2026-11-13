import { useState } from 'react';
import { PlayerState } from '../types';
import { gameServer, AuthResult } from '../utils/gameServer';
import { debug } from '../utils/debug';

export function useAuth() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingScore, setPendingScore] = useState(0);

    const handleRegister = async (
        phone: string,
        pass: string,
        guestStats: any,
        setPlayer: (p: PlayerState | null) => void
    ): Promise<AuthResult> => {
        try {
            const res = await gameServer.registerUser(phone, pass, guestStats);
            if (res.success && res.player) {
                if (!res.player.epicProgress || typeof res.player.epicProgress === 'number') {
                    res.player.epicProgress = { 'rostam_7': Number(res.player.epicProgress) || 1 };
                }
                setPlayer(res.player);
                setShowAuthModal(false);
            }
            return res;
        } catch (e) {
            debug.warn('useAuth', 'register failed:', e);
            return { success: false, message: 'خطا در اتصال به سرور' };
        }
    };

    return { showAuthModal, setShowAuthModal, pendingScore, setPendingScore, handleRegister };
}
