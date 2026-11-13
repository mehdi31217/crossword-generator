import React, { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-3 left-3 z-[90] flex items-center gap-2 rounded-full bg-amber-800/95 border border-amber-300/50 px-3 py-1.5 text-[10.5px] font-black text-amber-50 shadow-lg"
    >
      <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
      <span>حالت آفلاین فعال است — بازی از حافظهٔ کش اجرا می‌شود</span>
    </div>
  );
};
