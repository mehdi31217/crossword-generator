import React from 'react';
import { X } from 'lucide-react';
import { Language, StoryBook } from '../types';

interface StoryModalProps {
  show: boolean;
  language: Language;
  selectedBook: StoryBook | null;
  chapterImage?: string;
  chapterTitle?: string;
  chapterDescription?: string;
  onStart: () => void;
  onClose?: () => void; // NEW: Add close handler
}

export const StoryModal: React.FC<StoryModalProps> = ({
  show,
  language,
  selectedBook,
  chapterImage,
  chapterTitle,
  chapterDescription,
  onStart,
  onClose,
}) => {
  if (!show || !selectedBook) return null;

  const isFA = language === 'fa';
  const accent = selectedBook.style.primaryColor;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 animate-in fade-in duration-700"
      style={{ backgroundColor: 'rgba(28,18,13,.62)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
    >
      {/* the book's own colour survives as a wash behind the sheet, not as its material */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 22%, ${accent}2E 0%, transparent 62%)` }}
      />

      <div
        dir={isFA ? 'rtl' : 'ltr'}
        className="cg-paper w-full max-w-sm max-h-[86vh] overflow-y-auto relative animate-in zoom-in-95 duration-500"
        style={{ borderRadius: '8px' }}
      >
        {onClose && (
          <button
            onClick={onClose}
            aria-label="بستن"
            className="absolute top-3 left-3 z-20 w-9 h-9 grid place-items-center rounded-full active:scale-95 transition-transform"
            style={{
              backgroundColor: 'var(--paper-2)',
              border: '1px solid rgba(36,26,20,.16)',
              color: 'var(--ink)',
              boxShadow: '0 1px 0 rgba(255,255,255,.7) inset, 0 6px 12px -8px rgba(50,30,20,.7)',
            }}
          >
            <X size={17} strokeWidth={3} />
          </button>
        )}

        <div className="px-6 pb-6 pt-5">
          <div className="flex items-center justify-between mb-3 pl-12">
            <span
              className="text-[9px] font-black tracking-wide px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid rgba(36,26,20,.14)' }}
            >
              {isFA ? 'کمپین داستانی' : 'Story chapter'}
            </span>
            <span className="text-[9px] font-bold" style={{ color: 'var(--ink-3)' }}>
              {isFA ? 'پیش از نبرد بخوان' : 'Read before the battle'}
            </span>
          </div>

          <div
            className="w-full aspect-[3/2] mb-4 overflow-hidden rounded-[5px]"
            style={{ border: '1px solid rgba(36,26,20,.26)', boxShadow: '0 1px 0 rgba(255,255,255,.5) inset' }}
          >
            <img src={chapterImage} alt="Chapter" className="w-full h-full object-cover" />
          </div>

          <h2
            className="text-2xl font-black leading-tight mb-2"
            style={{ fontFamily: selectedBook.style.fontFamily === 'serif' ? 'serif' : 'sans-serif', color: 'var(--ink)' }}
          >
            {chapterTitle}
          </h2>
          <div className="w-16 h-1 mb-4 rounded-full" style={{ backgroundColor: 'var(--saffron)' }} />
          <p className="text-[13px] font-bold leading-7 mb-7" style={{ color: 'var(--ink-2)' }}>
            {chapterDescription}
          </p>

          <button
            onClick={onStart}
            className="cg-btn-clay w-full py-3.5 rounded-xl text-base font-black active:scale-95 transition-transform"
          >
            {isFA ? 'ادامه و شروع' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
};
