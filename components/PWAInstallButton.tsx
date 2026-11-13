import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        title="نصب بازی روی گوشی"
        className="cg-chip !px-2 !py-1 flex items-center gap-1 text-[10px] font-black text-amber-950 shrink-0 transition active:scale-95"
      >
        <Download className="w-3 h-3 text-amber-800" />
        <span className="hidden sm:inline">نصب بازی</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="راهنمای نصب روی آیفون"
          className="cg-chip !px-2 !py-1 flex items-center gap-1 text-[10px] font-black text-amber-950 shrink-0 transition active:scale-95"
        >
          <Download className="w-3 h-3 text-amber-800" />
          <span className="hidden sm:inline">نصب روی آیفون</span>
        </button>

        {showIOSGuide && (
          <div
            dir="rtl"
            className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl bg-[#FDF6E7] border-4 border-[#92400E] p-5 shadow-2xl text-right space-y-3"
            >
              <h3 className="text-sm font-black text-[#451A03]">
                نصب بازی روی آیفون و آیپد
              </h3>
              <p className="text-xs font-bold text-[#61442B] leading-relaxed">
                ۱. در مرورگر Safari دکمهٔ <strong>Share (اشتراک‌گذاری)</strong> در نوار پایین را بزنید.
                <br />
                ۲. گزینهٔ <strong>Add to Home Screen</strong> را انتخاب کنید تا بازی تمام‌صفحه روی گوشی شما نصب شود.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-amber-800 py-2 text-xs font-black text-amber-50"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
