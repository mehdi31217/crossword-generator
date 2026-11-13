import React, { useState } from 'react';
import { Language } from '../types';
import { Check, Copy } from 'lucide-react';

interface MultiplayerWaitingOverlayProps {
  show: boolean;
  language: Language;
  opponent: any;
  isHost: boolean;
  showCoinFlip: boolean;
  roomId: string | null;
  categoryLabel: string | null;
  secondaryCategoryLabel: string | null;
  finalSize: number | null;
  onCancel: () => void;
}

const Spinner: React.FC<{ tint: string }> = ({ tint }) => (
  <div
    className="w-14 h-14 rounded-full animate-spin"
    style={{ border: `4px solid ${tint}`, borderTopColor: 'transparent' }}
  />
);

export const MultiplayerWaitingOverlay: React.FC<MultiplayerWaitingOverlayProps> = ({
  show,
  language,
  opponent,
  isHost,
  showCoinFlip,
  roomId,
  categoryLabel,
  secondaryCategoryLabel,
  finalSize,
  onCancel,
}) => {
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  if (!show) return null;

  const isFA = language === 'fa';

  return (
    <div className="fixed inset-0 z-[100] cg-dark cg-merge-overlay flex items-center justify-center px-6">
      <div
        className="w-full max-w-sm cg-glass cg-rise px-7 py-9 text-center"
        style={{ color: 'var(--ink)' }}
      >
        {!opponent ? (
          <div className="flex flex-col items-center gap-4">
            <Spinner tint="#B4694B" />
            <h2 className="text-xl font-black">
              {isFA ? 'در انتظار حریف...' : 'Waiting for opponent...'}
            </h2>
            {isHost && roomId && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold" style={{ color: 'var(--ink-2)' }}>
                  {isFA ? 'کد اتاق:' : 'Room:'}
                </span>
                <span
                  className="font-mono font-black text-xl tracking-widest"
                  dir="ltr"
                  style={{ color: 'var(--clay-ink)' }}
                >
                  {roomId}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomId).catch(() => {});
                    setRoomCodeCopied(true);
                    setTimeout(() => setRoomCodeCopied(false), 2000);
                  }}
                  className="p-2 rounded-lg transition-all active:scale-90"
                  style={{
                    background: 'var(--paper-lift)',
                    border: '1px solid rgba(142,78,55,.32)',
                    boxShadow: '0 4px 10px -8px rgba(70,40,25,.8)',
                  }}
                  title={isFA ? 'کپی کد' : 'Copy code'}
                >
                  {roomCodeCopied ? (
                    <Check size={16} style={{ color: '#5E6E52' }} />
                  ) : (
                    <Copy size={16} style={{ color: '#8E4E37' }} />
                  )}
                </button>
              </div>
            )}
            {!isHost && (
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--ink-2)' }}>
                {isFA ? 'در حال اتصال...' : 'Connecting...'}
              </p>
            )}
            <button
              onClick={onCancel}
              className="cg-btn-cream w-full mt-7 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95"
            >
              {isFA ? '✕ لغو و بازگشت' : '✕ Cancel & Return'}
            </button>
          </div>
        ) : showCoinFlip ? (
          <div className="flex flex-col items-center gap-4">
            <Spinner tint="#B07F22" />
            <h2 className="text-xl font-black">
              {isFA ? 'در حال توافق بر سر دسته‌بندی...' : 'Agreeing on category...'}
            </h2>
            <p className="text-sm font-bold" style={{ color: 'var(--ink-2)' }}>
              {isFA ? 'انتخاب نهایی با شیر یا خط' : 'Final choice via coin flip'}
            </p>
            <button
              onClick={onCancel}
              className="cg-btn-cream w-full mt-7 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95"
            >
              {isFA ? '✕ لغو و بازگشت' : '✕ Cancel & Return'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Spinner tint="#5E6E52" />
            <h2 className="text-xl font-black">
              {isFA ? 'در حال ساخت جدول نبرد...' : 'Building battle grid...'}
            </h2>
            {(categoryLabel || secondaryCategoryLabel) && finalSize && (
              <div className="cg-paper flex items-center gap-2 mt-1 px-5 py-2.5">
                <span className="font-black text-sm" style={{ color: '#5E6E52' }}>
                  {secondaryCategoryLabel ? (
                    <>
                      {categoryLabel}
                      <span style={{ color: 'var(--ink-3)' }} className="mx-1">+</span>
                      {secondaryCategoryLabel}
                    </>
                  ) : (
                    categoryLabel
                  )}
                </span>
                <span style={{ color: 'var(--ink-3)' }}>|</span>
                <span className="font-black" style={{ color: '#9E7418' }}>
                  {finalSize}×{finalSize}
                </span>
              </div>
            )}
            <p className="text-sm font-bold" style={{ color: 'var(--ink-2)' }}>
              {isFA ? 'به زودی بازی شروع می‌شود' : 'Game will start shortly'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
