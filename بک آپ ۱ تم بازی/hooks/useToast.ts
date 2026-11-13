import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    msg: string;
    type: ToastType;
    exiting?: boolean;
}

export function useToast() {
    const [toast, setToast] = useState<Toast | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const idRef = useRef(0);

    const showToast = useCallback((msg: string, type: ToastType = 'success') => {
        const id = ++idRef.current;
        // Clear any existing timer
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast({ id, msg, type });

        // Start exit animation after 2.5s
        timerRef.current = setTimeout(() => {
            setToast(prev => prev?.id === id ? { ...prev, exiting: true } : prev);
            // Remove from DOM after animation
            setTimeout(() => {
                setToast(prev => prev?.id === id ? null : prev);
            }, 300);
        }, 2500);
    }, []);

    const hideToast = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(prev => prev ? { ...prev, exiting: true } : null);
        setTimeout(() => setToast(null), 300);
    }, []);

    return { toast, showToast, hideToast };
}
