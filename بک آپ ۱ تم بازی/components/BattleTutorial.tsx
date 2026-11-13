
import React from 'react';
import { Eraser, Snowflake, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface BattleTutorialProps {
  language: Language;
}

export const BattleTutorial: React.FC<BattleTutorialProps> = ({ language }) => {
  const isFA = language === 'fa';

  return (
    <div
      className="w-full max-w-sm backdrop-blur-sm rounded-3xl p-5 mt-6 animate-in slide-in-from-bottom-10 fade-in duration-700"
      dir={isFA ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: 'var(--paper)',
        backgroundImage: 'var(--tex-paper)',
        backgroundSize: '200px 200px',
        border: '1px solid rgba(36,26,20,.16)',
        boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 18px 30px -22px rgba(46,28,18,.75)',
      }}
    >
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(36,26,20,.12)' }}>
        <AlertCircle size={20} style={{ color: 'var(--clay-ink)' }} />
        <h3 className="font-black text-sm" style={{ color: 'var(--ink)' }}>{isFA ? 'راهنمای سریع نبرد' : 'Battle Quick Guide'}</h3>
      </div>

      <div className="space-y-4">
        {/* Red Cells Explanation */}
        <div className="flex gap-3 items-start">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs"
            style={{ backgroundColor: 'rgba(158,90,80,.14)', border: '1px solid rgba(158,90,80,.3)', color: '#8A4A42' }}
          >
            A
          </div>
          <div>
            <h4 className="font-bold text-xs mb-0.5" style={{ color: '#8A4A42' }}>{isFA ? 'خانه‌های قرمز' : 'Red Cells'}</h4>
            <p className="text-[10px] leading-tight font-medium" style={{ color: 'var(--ink-2)' }}>
              {isFA 
                ? 'حروفی که حریف پر می‌کند قرمز می‌شوند. شما می‌توانید بعد از پاک کردن تصادفی آن‌ها با «پاک‌کن»، رویشان بنویسید و امتیاز حریف را بدزدید!' 
                : 'Opponent fills appear in RED. Use the Eraser to randomly clear them, then write over them to steal the score!'}
            </p>
          </div>
        </div>

        {/* Mana & Eraser */}
        <div className="flex gap-3 items-start">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(176,127,34,.14)', border: '1px solid rgba(176,127,34,.26)', color: '#9E7418' }}
          >
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <h4 className="font-bold text-xs mb-0.5" style={{ color: '#9E7418' }}>{isFA ? 'انرژی و حملات' : 'Mana & Attacks'}</h4>
            <p className="text-[10px] leading-tight font-medium" style={{ color: 'var(--ink-2)' }}>
              {isFA 
                ? 'با گذشت زمان انرژی بگیرید و به حریف حمله کنید:' 
                : 'Gain Mana over time and launch attacks:'}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
                <div
                  className="p-1.5 rounded-lg flex flex-col items-center gap-1"
                  style={{ backgroundColor: 'rgba(158,90,80,.1)', border: '1px solid rgba(158,90,80,.2)', color: '#8A4A42' }}
                >
                    <Eraser size={12} />
                    <span className="text-[8px] font-black text-center leading-none">{isFA ? 'پاک‌کن' : 'Erase'}</span>
                </div>
                <div
                  className="p-1.5 rounded-lg flex flex-col items-center gap-1"
                  style={{ backgroundColor: 'rgba(94,68,104,.1)', border: '1px solid rgba(94,68,104,.2)', color: '#5E4468' }}
                >
                    <EyeOff size={12} />
                    <span className="text-[8px] font-black text-center leading-none">{isFA ? 'تاریکی' : 'Blind'}</span>
                </div>
                <div
                  className="p-1.5 rounded-lg flex flex-col items-center gap-1"
                  style={{ backgroundColor: 'rgba(78,107,114,.1)', border: '1px solid rgba(78,107,114,.2)', color: '#3F5A60' }}
                >
                    <Snowflake size={12} />
                    <span className="text-[8px] font-black text-center leading-none">{isFA ? 'انجماد' : 'Freeze'}</span>
                </div>
            </div>
            <p
              className="text-[9px] mt-2 font-bold p-1.5 rounded-md"
              style={{ color: '#8A4A42', backgroundColor: 'rgba(158,90,80,.1)', border: '1px solid rgba(158,90,80,.18)' }}
            >
                {isFA ? 'نکته: پاک‌کن فقط خانه‌های قرمز (حریف) را هدف می‌گیرد!' : 'Note: Eraser only targets RED (opponent) cells!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
