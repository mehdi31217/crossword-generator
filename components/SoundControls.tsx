import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { soundEngine, AudioSettings } from '../utils/soundEngine';

interface SoundControlsProps {
  /** If provided, renders compact floating button or inline widget */
  compact?: boolean;
  className?: string;
}

export const SoundControls: React.FC<SoundControlsProps> = ({ compact = true, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(() => soundEngine.getSettings());

  useEffect(() => {
    setSettings(soundEngine.getSettings());
  }, []);

  const handleToggleSfx = () => {
    soundEngine.initContext();
    const nextState = !settings.sfxMuted;
    soundEngine.setSfxMuted(nextState);
    setSettings(soundEngine.getSettings());
  };

  const handleSfxVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundEngine.setSfxVolume(val);
    if (val > 0 && settings.sfxMuted) {
      soundEngine.setSfxMuted(false);
    }
    setSettings(soundEngine.getSettings());
  };

  const playTest = (action: () => void) => {
    soundEngine.initContext();
    if (settings.sfxMuted) {
      soundEngine.setSfxMuted(false);
      setSettings(soundEngine.getSettings());
    }
    action();
  };

  const modalNode =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            dir="rtl"
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 select-none"
            onClick={() => setIsOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl p-6 text-[#352A1E] shadow-2xl border-2 border-[#9C7A58]"
              style={{
                background: 'linear-gradient(180deg, #FDF9F2 0%, #F5ECDD 60%, #E9DAC4 100%)',
                boxShadow:
                  '0 24px 60px rgba(20, 8, 2, 0.78), inset 0 2px 0 rgba(255,255,255,0.9)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#D8C7B0] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#FFEAD0]"
                    style={{
                      background: 'linear-gradient(135deg, #A85828 0%, #5C2209 100%)',
                      boxShadow: '0 2px 6px rgba(92, 34, 9, 0.4)',
                    }}
                  >
                    <Volume2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-[#472109] leading-tight">
                      تنظیمات افکت‌های صوتی بازی
                    </h3>
                    <p className="text-[11px] font-bold text-[#8A6A4E]">
                      صدای کاشی‌ها، حل جدول، صیقل کوره و طومارها
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#E6DAC6] hover:bg-[#D5C2AA] text-[#5C4532] transition-colors active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SFX Toggle & Volume Slider */}
              <div className="mb-5">
                <div className="p-3.5 rounded-xl bg-[#EFE4D2]/85 border border-[#D8C5AB]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B87B3E]" />
                      <span className="text-xs font-black text-[#472109]">
                        جلوه‌های صوتی بازی (SFX)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleSfx}
                      className={`px-3.5 py-1 rounded-full text-xs font-black transition-all active:scale-95 ${
                        settings.sfxMuted
                          ? 'bg-[#D5C7B4] text-[#6B5A47]'
                          : 'bg-[#C8704A] text-white shadow-sm'
                      }`}
                    >
                      {settings.sfxMuted ? 'خاموش' : 'روشن'}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.sfxMuted ? 0 : settings.sfxVolume}
                      onChange={handleSfxVol}
                      className="w-full accent-[#C8704A] cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-[#7A6048] w-10 text-left tabular-nums">
                      {Math.round((settings.sfxMuted ? 0 : settings.sfxVolume) * 100)}٪
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Lab Buttons */}
              <div className="border-t border-[#D8C7B0] pt-3">
                <span className="text-[11px] font-black text-[#7A5B40] block mb-2.5">
                  تست جلوه‌های صوتی بازی:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playCorrectLetterProgress(0.7))}
                    className="px-2 py-2.5 rounded-xl bg-[#EAE0CD] hover:bg-[#E0D2BC] active:scale-95 text-[11px] font-black text-[#472109] border border-[#C5B49B] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>🧱 کاشی و تایپ</span>
                    <span className="text-[9px] text-[#8A6A4E] font-medium">تقهٔ سفال لعاب‌دار</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playMistake())}
                    className="px-2 py-2.5 rounded-xl bg-[#F8E3DD] hover:bg-[#EED2C9] active:scale-95 text-[11px] font-black text-[#8A2E18] border border-[#DEB0A5] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>⚠️ خطای کلمه</span>
                    <span className="text-[9px] text-[#9A3E28] font-medium">مضراب خفه</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playGridConstructed())}
                    className="px-2 py-2.5 rounded-xl bg-[#EAE0CD] hover:bg-[#E0D2BC] active:scale-95 text-[11px] font-black text-[#472109] border border-[#C5B49B] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>🧩 ساخت جدول</span>
                    <span className="text-[9px] text-[#8A6A4E] font-medium">آرپژ شروع بازی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playWordComplete())}
                    className="px-2 py-2.5 rounded-xl bg-[#EAE0CD] hover:bg-[#E0D2BC] active:scale-95 text-[11px] font-black text-[#472109] border border-[#C5B49B] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>🎶 حل کلمه</span>
                    <span className="text-[9px] text-[#8A6A4E] font-medium">سنتور ماهور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playScrollGrandFanfare(3))}
                    className="px-2 py-2.5 rounded-xl bg-[#FAF0D4] hover:bg-[#F3E2BD] active:scale-95 text-[11px] font-black text-[#8B6214] border border-[#E3C57B] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>👑 طومار زرین</span>
                    <span className="text-[9px] text-[#9A7426] font-medium">مارش شاهانه</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => playTest(() => soundEngine.playScrollGrandFanfare(4))}
                    className="px-2 py-2.5 rounded-xl bg-[#DFF7ED] hover:bg-[#C8EEDF] active:scale-95 text-[11px] font-black text-[#0A5C3C] border border-[#78D3AD] transition-transform flex flex-col items-center gap-1"
                  >
                    <span>✨ طومار زمرد</span>
                    <span className="text-[9px] text-[#127750] font-medium">آیین تاج‌گذاری</span>
                  </button>
                </div>
              </div>

              {/* Done button */}
              <div className="mt-5 pt-3 border-t border-[#D8C7B0] flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-black text-white shadow-md active:scale-95 transition-transform"
                  style={{
                    background: 'linear-gradient(180deg, #A85828 0%, #6B3312 100%)',
                  }}
                >
                  تأیید و بستن
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          soundEngine.initContext();
          setIsOpen(true);
        }}
        className={`relative flex items-center justify-center rounded-full transition-transform active:scale-90 focus:outline-none ${className}`}
        style={{
          width: compact ? '32px' : '40px',
          height: compact ? '32px' : '40px',
          backgroundColor: '#EAE0CE',
          backgroundImage: 'linear-gradient(180deg, #F5EDE0 0%, #E6DAC6 62%, #D4C3AA 100%)',
          boxShadow:
            'inset 0 1.5px 1px rgba(255, 253, 248, 0.92), inset 0 -2px 2px rgba(154, 132, 104, 0.52), 0 3px 5px rgba(28, 10, 3, 0.55)',
          border: '1px solid rgba(110, 78, 52, 0.45)',
        }}
        title="تنظیمات افکت‌های صوتی"
      >
        {settings.sfxMuted ? (
          <VolumeX className="w-4 h-4 text-[#8C3A27]" />
        ) : (
          <Volume2 className="w-4 h-4 text-[#472109]" />
        )}
      </button>

      {modalNode}
    </>
  );
};
