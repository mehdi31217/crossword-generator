import React, { useState } from 'react';
import { Play, Library, Swords, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Language } from '../types';

interface OnboardingGuideProps {
  language: Language;
  onClose: () => void;
}

const steps = (isFA: boolean) => [
  {
    icon: <Play size={36} />,
    tint: '#5E6E52',
    wash: 'rgba(94,110,82,.12)',
    badge: '1',
    title: isFA ? 'فقط بازی کن' : 'Quick Play',
    desc: isFA
      ? 'اندازه و موضوع جدول را انتخاب کن و مستقیماً بازی را شروع کن. بدون نیاز به ثبت‌نام!'
      : 'Pick a size and topic, then start playing instantly. No registration needed!',
  },
  {
    icon: <Library size={36} />,
    tint: '#B07F22',
    wash: 'rgba(176,127,34,.13)',
    badge: '2',
    title: isFA ? 'گنجینهٔ داستان‌ها' : 'The Treasure',
    desc: isFA
      ? 'در گنجینه چهار قفسه هست: تاریخ ایران، حماسه‌های شاهنامه، قصه‌های عامیانه و اسطوره‌های فوتبال. هر فصل یک جدول تازه با کلمات همان داستان.'
      : 'The Treasure holds four shelves: Persian history, Shahnameh epics, folk tales and football legends. Each chapter is a crossword built from its own story.',
  },
  {
    icon: <Swords size={36} />,
    tint: '#9E5A50',
    wash: 'rgba(158,90,80,.13)',
    badge: '3',
    title: isFA ? 'رقابت آنلاین' : 'Online Battle',
    desc: isFA
      ? 'دوستانت را دعوت کن یا با غریبه‌ها مبارزه کن. هرکس سریع‌تر جدول را کامل کند، برنده است!'
      : 'Invite friends or battle strangers. Merge your categories and race to complete the grid!',
  },
];

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ language, onClose }) => {
  const [step, setStep] = useState(0);
  const isFA = language === 'fa';
  const s = steps(isFA);
  const total = s.length;

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(46,28,18,.62)' }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm cg-glass cg-rise overflow-hidden animate-in zoom-in-95 duration-300"
        dir={isFA ? 'rtl' : 'ltr'}
      >
        {/* Top clay bar */}
        <div className="h-1.5" style={{ backgroundImage: 'var(--clay-shell)' }} />

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 pt-5 pb-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={i === step
                ? { width: 32, backgroundImage: 'var(--clay-shell)' }
                : { width: 8, backgroundColor: 'rgba(36,26,20,.14)' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 pb-6 pt-4 text-center">
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500"
              style={{
                backgroundColor: s[step].wash,
                color: s[step].tint,
                border: '1px solid rgba(36,26,20,.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
              }}
            >
              {s[step].icon}
            </div>
          </div>

          {/* Decorative sparkle */}
          <Sparkles size={16} className="mx-auto mb-2" style={{ color: '#C9A26A' }} />

          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--ink)' }}>{s[step].title}</h2>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink-2)' }}>{s[step].desc}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-2">
          {/* Skip / Back */}
          {step > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 cg-btn-cream"
            >
              <ChevronRight size={16} className={isFA ? '' : 'rotate-180'} />
              {isFA ? 'قبلی' : 'Back'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
              style={{ color: 'var(--ink-3)' }}
            >
              <X size={14} />
              {isFA ? 'رد شدن' : 'Skip'}
            </button>
          )}

          {/* Next / Start */}
          <button
            onClick={handleNext}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-black text-xs active:scale-95 transition-all ${
              step < total - 1 ? 'cg-btn-clay' : 'cg-btn-sage'
            }`}
          >
            {step < total - 1 ? (
              <>{isFA ? 'بعدی' : 'Next'} <ChevronLeft size={16} className={isFA ? '' : 'rotate-180'} /></>
            ) : (
              <>{isFA ? 'شروع بازی!' : 'Start Playing!'} <Sparkles size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
