import React from 'react';
import { RefreshCw, Search, LayoutGrid, Layers, Sparkles, AlertTriangle } from 'lucide-react';
import { Language, LoadingStage } from '../types';

interface LoadingOverlayProps {
  loadingStage: LoadingStage;
  retryCount: number;
  maxRetries: number;
  language: Language;
  error?: string | null;
  onRetry?: () => void;
}

const stageConfig: Record<LoadingStage, { icon: React.ReactNode; label: (isFA: boolean) => string; desc: (isFA: boolean) => string }> = {
  loading_dict: {
    icon: <Search size={36} color="#8E4E37" />,
    label: (isFA) => isFA ? 'در حال بارگذاری واژه‌ها...' : 'Loading words...',
    desc: (isFA) => isFA ? 'دریافت از دیکشنری' : 'Fetching from dictionary',
  },
  generating_ai: {
    icon: <Sparkles size={36} color="#9E7418" />,
    label: (isFA) => isFA ? 'در حال ساخت جدول...' : 'Generating grid...',
    desc: (isFA) => isFA ? 'طراحی الگوی جدول' : 'Designing grid pattern',
  },
  constructing: {
    icon: <LayoutGrid size={36} color="#5E6E52" />,
    label: (isFA) => isFA ? 'در حال چیدمان جدول...' : 'Constructing grid...',
    desc: (isFA) => isFA ? 'حل جدول کلمات' : 'Solving crossword',
  },
  finalizing: {
    icon: <Layers size={36} color="#7A5A86" />,
    label: (isFA) => isFA ? 'در حال نهایی‌سازی...' : 'Finalizing...',
    desc: (isFA) => isFA ? 'آماده‌سازی سرنخ‌ها' : 'Preparing clues',
  },
  idle: {
    icon: <RefreshCw size={36} color="#9A8879" />,
    label: () => '',
    desc: () => '',
  },
};

const stageOrder: LoadingStage[] = ['loading_dict', 'generating_ai', 'constructing', 'finalizing'];

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loadingStage,
  retryCount,
  maxRetries,
  language,
  error,
  onRetry,
}) => {
  const isFA = language === 'fa';

  // Error state
  if (error && loadingStage === 'idle') {
    return (
      <div
        className="cg-sand fixed inset-0 z-[70] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(158,90,80,.14)', border: '1px solid rgba(158,90,80,.32)' }}
        >
          <AlertTriangle size={40} color="#9E5A50" />
        </div>
        <h3 className="font-black text-xl mb-2" style={{ color: 'var(--ink)' }}>
          {isFA ? 'خطا در ساخت جدول' : 'Grid Generation Failed'}
        </h3>
        <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--ink-2)' }}>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="cg-btn-clay px-6 py-3 font-black text-sm rounded-xl active:scale-95 transition-all"
          >
            {isFA ? 'تلاش دوباره' : 'Try Again'}
          </button>
        )}
      </div>
    );
  }

  if (loadingStage === 'idle') return null;

  const current = stageConfig[loadingStage];
  const currentIndex = stageOrder.indexOf(loadingStage);

  return (
    <div
      className="cg-sand fixed inset-0 z-[70] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300"
    >
      {/* Spinning ring */}
      <div className="relative w-36 h-36 mb-8">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: '12px solid rgba(142,78,55,.16)' }}
        />
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{ border: '12px solid #B4694B', borderTopColor: 'transparent' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {current.icon}
        </div>
      </div>

      {/* Stage title */}
      <h3 className="font-black text-2xl mb-2 transition-all duration-300" style={{ color: 'var(--ink)' }}>
        {current.label(isFA)}
      </h3>

      {/* Stage description */}
      <p className="text-sm font-semibold mb-6" style={{ color: 'var(--ink-3)' }}>
        {current.desc(isFA)}
      </p>

      {/* Step progress bar */}
      <div className="flex items-center gap-1.5 mb-2">
        {stageOrder.map((stage, i) => (
          <React.Fragment key={stage}>
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === currentIndex ? 'animate-pulse scale-150' : ''
              }`}
              style={{
                backgroundColor: i <= currentIndex ? '#B4694B' : 'rgba(36,26,20,.14)',
                boxShadow: i === currentIndex ? '0 0 10px rgba(180,105,75,.55)' : 'none',
              }}
            />
            {i < stageOrder.length - 1 && (
              <div
                className="w-5 h-[3px] rounded-full transition-all duration-500"
                style={{ backgroundColor: i < currentIndex ? '#C97B5A' : 'rgba(36,26,20,.14)' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stage hint text */}
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#9E7418' }}>
        {isFA
          ? ['بارگیری واژه', 'طراحی', 'چیدمان', 'نهایی'][currentIndex] || ''
          : ['Dict Load', 'Design', 'Construct', 'Finalize'][currentIndex] || ''}
      </p>

      {/* Retry count */}
      {retryCount > 0 && (
        <p className="text-sm font-bold animate-pulse mt-2" style={{ color: '#9E7418' }}>
          {isFA
            ? `تلاش ${retryCount} از ${maxRetries}`
            : `Attempt ${retryCount} of ${maxRetries}`}
        </p>
      )}
    </div>
  );
};
