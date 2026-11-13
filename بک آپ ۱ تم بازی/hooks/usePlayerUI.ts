import { useState, type Dispatch, type SetStateAction } from 'react';
import { PlayerState, Language } from '../types';
import { gameServer, type CoinReason } from '../utils/gameServer';

export function usePlayerUI() {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [shopOpen, setShopOpen] = useState(false);

    const handleProfileUpdate = async (
        player: PlayerState | null,
        setPlayer: Dispatch<SetStateAction<PlayerState | null>>,
        name: string,
        avatar: string,
        theme?: 'light' | 'dark',
        showToast?: (msg: string, type?: 'success' | 'error') => void,
        language?: Language
    ) => {
        try {
            const updated = player ? await gameServer.updateProfile(player, name, avatar) : null;
            if (updated) {
                if (theme) updated.theme = theme;
                setPlayer(updated);
                gameServer.savePlayer(updated);
            }
        } catch (e) {
            // server may be offline — still save locally
            const p = player ? { ...player, name, avatar } : null;
            if (p && theme) p.theme = theme;
            if (p) { gameServer.savePlayer(p); setPlayer(p); }
        }
        if (showToast) {
            const isFA = language === 'fa';
            showToast(isFA ? 'پروفایل ذخیره شد ✓' : 'Profile saved ✓');
        }
    };

    const handleShopPurchase = async (
        player: PlayerState | null,
        setPlayer: Dispatch<SetStateAction<PlayerState | null>>,
        itemId: string,
        cost: number,
        showToast: (msg: string, type?: 'success' | 'error') => void,
        language: Language
    ) => {
        const isFA = language === 'fa';
        if (!player || player.coins < cost) return;

        // The server owns the price AND delivers the item; `cost` is only used for
        // the local affordability pre-check so we skip a pointless request.
        const spend = await gameServer.spendCoins(`shop_${itemId}` as CoinReason);
        if (spend.status !== 'ok') {
            showToast(
                spend.status === 'insufficient'
                    ? (isFA ? 'سکه کافی ندارید!' : 'Not enough coins!')
                    : spend.status === 'at_cap'
                    ? (isFA ? 'بلیت برج شما پُر است!' : 'Your tower tickets are already full!')
                    : (isFA ? 'خرید ناموفق بود. دوباره تلاش کنید.' : 'Purchase failed. Try again.'),
                'error'
            );
            return;
        }

        // Balance and item counts both come from the server response. The client
        // used to bump its own counter, which was then discarded on the next load
        // (the server had no idea the item existed, so a bought shield was paid
        // for and thrown away).
        const updated: PlayerState = {
            ...player,
            coins: spend.coins,
            items: spend.items ? { ...player.items, ...spend.items } : player.items,
        };
        if (itemId === 'trophyShield') {
            showToast(isFA ? '🛡️ سپر تروفی خریداری شد!' : '🛡️ Trophy Shield purchased!');
        } else if (itemId === 'trophyBoost') {
            showToast(isFA ? '⚡ تقویت تروفی خریداری شد!' : '⚡ Trophy Boost purchased!');
        } else if (itemId === 'streakShield') {
            showToast(isFA ? '🔥 سپر زنجیره خریداری شد!' : '🔥 Streak Shield purchased!');
        } else if (itemId === 'towerTicket') {
            // The server granted the ticket and returned the new count.
            if (typeof spend.towerTickets === 'number') updated.towerTickets = spend.towerTickets;
            showToast(isFA ? '🎫 بلیت برج خریداری شد!' : '🎫 Tower Ticket purchased!');
        }
        gameServer.savePlayer(updated);
        setPlayer(updated);
    };

    return { showProfileModal, setShowProfileModal, shopOpen, setShopOpen, handleProfileUpdate, handleShopPurchase };
}
