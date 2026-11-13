import React, { useEffect } from 'react';
import { Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { getSetGrandeurInfo } from '../utils/progression';
import { GameCoin } from './GameCoin';
import confetti from 'canvas-confetti';

export interface ScrollCeremonyPayload {
  setId: string; // e.g., `book_${bookId}` or `legend_${legendId}`
  titleFa: string;
  coverImage?: string;
  totalCards: number;
  coinsAwarded: number;
  polishSealsAwarded: number;
}

interface ScrollUnlockCeremonyModalProps {
  ceremony: ScrollCeremonyPayload | null;
  onClose: () => void;
  onOpenCollection?: () => void;
}

const toFa = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export const ScrollUnlockCeremonyModal: React.FC<ScrollUnlockCeremonyModalProps> = ({
  ceremony,
  onClose,
  onOpenCollection,
}) => {
  useEffect(() => {
    if (!ceremony) return;
    try {
      confetti({
        particleCount: 140,
        spread: 95,
        origin: { y: 0.45 },
        colors: ['#F59E0B', '#FDE047', '#10B981', '#EC4899'],
      });
    } catch {
      // ignore if canvas-confetti fails
    }
  }, [ceremony]);

  if (!ceremony) return null;

  const grandeur = getSetGrandeurInfo(ceremony.setId, ceremony.totalCards);

  const degreeTheme =
    grandeur.degree === 3
      ? {
          headerBg: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)',
          border: '#F59E0B',
          badgeBg: 'linear-gradient(90deg, #DC2626, #991B1B)',
          badgeText: '👑 طومار درجه ۳ · شاهکار (+۳۵٪ شکوه)',
          capLabel: 'قابلیت ارتقا تا طومار زمردی شاهانه (رتبه ۴) با قانون ۴ کارت محوری',
        }
      : grandeur.degree === 2
      ? {
          headerBg: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)',
          border: '#FBBF24',
          badgeBg: 'linear-gradient(90deg, #D97706, #B45309)',
          badgeText: '⚔️ طومار درجه ۲ · حماسی (+۱۵٪ شکوه)',
          capLabel: 'قابلیت ارتقا تا طومار زمردی شاهانه (رتبه ۴)',
        }
      : {
          headerBg: 'linear-gradient(135deg, #14532D 0%, #052E16 100%)',
          border: '#86EFAC',
          badgeBg: 'linear-gradient(90deg, #16A34A, #15803D)',
          badgeText: '📜 طومار درجه ۱ · مقدماتی (پایه ۱.۰x)',
          capLabel: 'سقف نهایی ارتقا: کتیبهٔ زرین (رتبه ۳)',
        };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 animate-in zoom-in-95 duration-200"
        style={{
          background: 'linear-gradient(180deg, #FDF6E7 0%, #F3E3C3 100%)',
          borderColor: degreeTheme.border,
          boxShadow: '0 24px 50px rgba(0,0,0,0.65)',
        }}
      >
        {/* Top Royal Banner */}
        <div
          className="px-5 py-4 text-center relative overflow-hidden"
          style={{ background: degreeTheme.headerBg }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-black mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>جشن گشایش طومار مجموعه</span>
          </div>
          <h2 className="text-lg font-black text-amber-50">
            طومار «{ceremony.titleFa}» آزاد شد!
          </h2>
          <p className="text-[11px] font-bold text-amber-200/90 mt-0.5">
            هر {toFa(ceremony.totalCards)} کارت این مجموعه با موفقیت فتح شد
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Emblem / Book Cover */}
          <div className="relative w-20 h-24 mx-auto">
            {ceremony.coverImage ? (
              <img
                src={ceremony.coverImage}
                alt={ceremony.titleFa}
                className="w-full h-full object-cover rounded-2xl border-2 border-amber-700 shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 border-2 border-amber-700 flex items-center justify-center text-3xl shadow-lg">
                📜
              </div>
            )}
            <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 border-2 border-amber-100 text-white flex items-center justify-center shadow">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          {/* Scroll Degree Pill */}
          <div className="space-y-1.5">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black text-white shadow-sm"
              style={{ background: degreeTheme.badgeBg }}
            >
              <span>{degreeTheme.badgeText}</span>
            </div>
            <p className="text-[10.5px] font-extrabold text-[#5C3A21]">
              {degreeTheme.capLabel}
            </p>
          </div>

          {/* Rewards Box */}
          <div
            className="rounded-2xl p-3 border flex items-center justify-around gap-2"
            style={{
              background: 'rgba(255, 250, 240, 0.9)',
              borderColor: 'rgba(146, 64, 14, 0.3)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <GameCoin size={20} />
              <div className="text-right">
                <div className="text-xs font-black text-[#451A03]">
                  +{toFa(ceremony.coinsAwarded)} سکهٔ زرین
                </div>
                <div className="text-[9.5px] font-bold text-[#78350F]">
                  پاداش تکمیل طومار
                </div>
              </div>
            </div>

            {ceremony.polishSealsAwarded > 0 && (
              <div className="flex items-center gap-1.5 border-r border-amber-900/15 pr-3">
                <span className="text-lg">🔥</span>
                <div className="text-right">
                  <div className="text-xs font-black text-amber-900">
                    +{toFa(ceremony.polishSealsAwarded)} مهر صیقل
                  </div>
                  <div className="text-[9.5px] font-bold text-amber-800/80">
                    سهمیهٔ کورهٔ سفالگری
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {onOpenCollection && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCollection();
                }}
                className="w-full py-3 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                  border: '1px solid #A7ECE4',
                }}
              >
                <Award className="w-4 h-4" />
                <span>چیدن طومار در قفسهٔ ۱۰تایی کومبو 📜</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl text-xs font-black text-[#451A03] bg-amber-300/60 hover:bg-amber-300/80 transition"
            >
              ادامهٔ ماجراجویی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
