import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, BrainCircuit } from 'lucide-react';
import { preloadCriticalGameAssets } from '../utils/assetPreloader';

interface SplashScreenProps {
  onFinish: () => void;
}

const toFaDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let cancelled = false;
    const showTimer = setTimeout(() => {
      if (!cancelled) setVisible(true);
    }, 30);

    const minDisplayPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, 650)
    );

    // Preload & GPU-decode all maps, game backgrounds, menu tiles, and portraits
    // plus warm up lazy modal chunks before dismissing the splash screen.
    const assetsPromise = Promise.all([
      preloadCriticalGameAssets((loaded, total) => {
        if (!cancelled && total > 0) {
          setProgress(Math.max(8, Math.round((loaded / total) * 100)));
        }
      }),
      import('./GameModals').catch(() => {}),
    ]);

    // Safety cap of 3.5s so slow networks never hang indefinitely
    const timeoutCap = new Promise<void>((resolve) =>
      setTimeout(resolve, 3500)
    );

    Promise.all([
      minDisplayPromise,
      Promise.race([assetsPromise, timeoutCap]),
    ]).then(() => {
      if (cancelled) return;
      setProgress(100);
      setExiting(true);
      setTimeout(() => {
        if (!cancelled) onFinish();
      }, 240);
    });

    return () => {
      cancelled = true;
      clearTimeout(showTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundColor: '#E7D3B7',
        backgroundImage:
          'radial-gradient(900px 700px at 88% -8%, #FDF6EA 0%, transparent 58%), ' +
          'radial-gradient(760px 620px at 6% 106%, #E7D2B6 0%, transparent 58%), ' +
          'linear-gradient(180deg,#F6EAD8 0%,#EFDFC7 55%,#E7D3B7 100%)',
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full blur-[80px] animate-pulse" style={{ background: 'rgba(201,123,90,.38)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full blur-[80px] animate-pulse [animation-delay:1s]" style={{ background: 'rgba(226,192,121,.45)' }} />
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Icon */}
        <div className="relative mb-8">
          <div
            className="w-28 h-28 rounded-[2rem] flex items-center justify-center rotate-6 border-t-4 animate-[float_4s_ease-in-out_infinite]"
            style={{
              background: 'var(--clay-shell)',
              borderTopColor: 'rgba(255,232,208,.45)',
              borderTopStyle: 'solid',
              boxShadow: '0 0 50px rgba(180,100,74,.42), inset 0 1px 0 rgba(255,226,204,.5), inset 0 -3px 0 rgba(58,30,18,.28)',
            }}
          >
            <BrainCircuit size={56} style={{ color: '#FFF6EC' }} className="drop-shadow-md" />
          </div>
          <div
            className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce"
            style={{ backgroundImage: 'linear-gradient(180deg,#EED08A,#D9AE55)', color: '#6A4A10' }}
          >
            <Zap size={20} className="fill-current" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span style={{ color: '#8E4E37' }}>کراس‌</span>
            <span style={{ color: '#B07F22' }}>ورد</span>
            <span style={{ color: '#8E4E37' }}> پرو</span>
          </h1>
          <p
            className="text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3"
            style={{ color: '#6B5A4D' }}
          >
            <Sparkles size={12} style={{ color: '#B07F22' }} />
            نسل جدید جداول هوشمند
            <Sparkles size={12} style={{ color: '#B07F22' }} />
          </p>
        </div>

        {/* Clay & Gold Preload Progress Bar */}
        <div className="w-56 flex flex-col items-center gap-1.5 mt-2" dir="rtl">
          <div
            className="w-full h-2.5 rounded-full overflow-hidden p-[1.5px]"
            style={{
              backgroundColor: 'rgba(110, 58, 36, 0.22)',
              boxShadow: 'inset 0 1px 2px rgba(42, 20, 10, 0.35)',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8E4E37 0%, #C88C28 60%, #E8B94F 100%)',
                boxShadow: '0 0 8px rgba(200, 140, 40, 0.5)',
              }}
            />
          </div>
          <span className="text-[10px] font-black tracking-wide" style={{ color: '#7A4B32' }}>
            در حال آماده‌سازی نقشه‌ها و پس‌زمینه‌ها... {toFaDigits(progress)}٪
          </span>
        </div>
      </div>
    </div>
  );
};
