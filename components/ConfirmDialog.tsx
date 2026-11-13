import React from 'react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(46,28,18,.55)' }}
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-sm cg-glass p-6 animate-in zoom-in-95 duration-200"
        style={{ borderRadius: 26, color: 'var(--ink)' }}
        dir="auto"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={isDanger
              ? { background: 'rgba(158,90,80,.16)', color: '#9E5A50', border: '1px solid rgba(158,90,80,.34)' }
              : { background: 'rgba(176,127,34,.16)', color: '#9E7418', border: '1px solid rgba(176,127,34,.34)' }}
          >
            {isDanger ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-center mb-2" style={{ color: 'var(--ink)' }}>{title}</h3>

        {/* Message */}
        <p className="text-sm text-center leading-relaxed mb-6" style={{ color: 'var(--ink-2)' }}>{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="cg-btn-cream flex-1 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all"
            style={{ minHeight: 48 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`${isDanger ? 'cg-btn-brick' : 'cg-btn-clay'} flex-1 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-all`}
            style={{ minHeight: 48 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
