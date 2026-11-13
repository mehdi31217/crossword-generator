
import React, { useState, useEffect } from 'react';
import { ArrowRight, Ticket, Clock, ShieldAlert, Play, AlertTriangle, Heart, Zap, Crown } from 'lucide-react';
import { PlayerState, Language } from '../types';
import { TOWER_DAILY_COIN_CAP } from '../utils/economy';

interface TowerLobbyProps {
  player: PlayerState;
  language: Language;
  onBack: () => void;
  onEnterTower: () => void;
  onGetFreeTicket: () => void;
}

const faNum = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export const TowerLobby: React.FC<TowerLobbyProps> = ({ player, language, onBack, onEnterTower, onGetFreeTicket }) => {
  const [timeToRefill, setTimeToRefill] = useState<string>('');
  const isFA = language === 'fa';

  useEffect(() => {
    const updateTimer = () => {
      if (player.towerTickets >= 2 || !player.lastTicketRefill) {
        setTimeToRefill('');
        return;
      }
      
      const last = new Date(player.lastTicketRefill).getTime();
      const now = Date.now();
      const refillTime = 12 * 60 * 60 * 1000; // 12 Hours
      const diff = refillTime - (now - last);

      if (diff <= 0) {
        setTimeToRefill(isFA ? 'آماده دریافت' : 'Ready');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToRefill(isFA ? faNum(`${h}:${m.toString().padStart(2, '0')}`) : `${h}:${m.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [player.lastTicketRefill, player.towerTickets, isFA]);

  const canEnter = player.towerTickets > 0;

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--paper-2)', color: 'var(--ink)' }}
    >
      {/* Background Effect — a warm clay glow instead of a neon gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(180,105,75,.16) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(176,127,34,.14) 0%, transparent 55%)',
        }}
      />

      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between z-10 animate-[card-enter_0.5s_ease-out]">
        <button onClick={onBack} className="cg-chip !rounded-full !p-2 transition-all hover:brightness-105">
            <ArrowRight size={20} className={isFA ? 'rotate-180' : ''} />
        </button>
        <div className="flex flex-col items-end">
            <h1 className="text-xl sm:text-2xl font-black" style={{ color: 'var(--ink)' }}>
                {isFA ? 'برج بی‌نهایت' : 'Endless Tower'}
            </h1>
            {/* a zero record is not drawn: at 10px a Persian zero is a lone round
                mark and reads as a stray dot next to the label */}
            {!!player.towerHighFloor && (
              <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--ink-3)' }}>
                {isFA ? `رکورد شما: طبقه ${faNum(player.towerHighFloor)}` : `Best: Floor ${player.towerHighFloor}`}
              </span>
            )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-4 gap-5 sm:gap-7 overflow-y-auto scrollbar-hide z-10">

        {/* Ticket — a printed admission stub */}
        <div className="relative animate-[card-enter_0.5s_ease-out_0.1s_both]">
            <div
              className="relative w-36 h-36 sm:w-40 sm:h-40 flex flex-col items-center justify-center gap-2 cg-paper"
              style={{ borderRadius: 18 }}
            >
                <Ticket size={44} style={{ color: canEnter ? 'var(--sand-stamp)' : 'var(--ink-3)' }} />
                <div className="flex items-baseline gap-1" dir={isFA ? 'rtl' : 'ltr'}>
                    <span className="text-4xl font-black tabular-nums" style={{ color: canEnter ? 'var(--ink)' : 'var(--ink-3)' }}>
                      {isFA ? faNum(player.towerTickets) : player.towerTickets}
                    </span>
                    {/* the noun stays with the denominator: a lone «۱» at 36px is a
                        bare vertical stroke and reads as a stray mark */}
                    <span className="text-[11px] font-bold" style={{ color: 'var(--ink-3)' }}>{isFA ? 'از ۲ بلیت' : 'of 2'}</span>
                </div>
                {timeToRefill && (
                    <div
                      className="absolute -bottom-4 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: 'var(--paper)',
                        border: '1px solid var(--paper-well-hair)',
                        color: 'var(--ink-2)',
                        boxShadow: '0 6px 12px -8px rgba(70,45,30,.8)',
                      }}
                    >
                        <Clock size={12} /> {timeToRefill}
                    </div>
                )}
            </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-3">
          {/* Rules card */}
          <div className="cg-paper p-4 sm:p-5 text-center flex flex-col items-center gap-2" style={{ borderRadius: 12 }}>
            <div className="flex items-center justify-center gap-2 font-black text-sm" style={{ color: 'var(--ink)' }}>
              <ShieldAlert size={16} style={{ color: 'var(--sand-stamp)' }} />
              {isFA ? 'سیستم جدید برج' : 'New Tower System'}
            </div>
            <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--saffron)' }} />
            <p className="text-xs leading-5 font-medium" style={{ color: 'var(--ink-2)' }} dir={isFA ? 'rtl' : 'ltr'}>
              {isFA 
                ? 'با ۳ جان شروع کنید! هر اشتباه یک جان کم می‌شود. بعد از هر طبقه می‌توانید از فروشگاه خرید کنید. طبقات ۵، ۱۰، ۱۵ باس دارند!' 
                : 'Start with 3 lives! Each mistake costs 1 life. Shop between floors. Boss fights every 5 floors!'}
            </p>
          </div>

          {/* Feature tiles */}
          <div className="grid grid-cols-3 gap-2.5 animate-[card-enter_0.4s_ease-out_0.3s_both]">
            {[
              { Icon: Heart, title: isFA ? '۳ جان' : '3 Lives', note: isFA ? '+۱ هر طبقه' : '+1 per floor', tone: 'var(--ink-lose)' },
              { Icon: Zap, title: isFA ? 'فروشگاه' : 'Shop', note: isFA ? 'آیتم‌های قدرتمند' : 'Power-ups', tone: 'var(--ink-win)' },
              { Icon: Crown, title: isFA ? 'باس' : 'Boss', note: isFA ? 'هر ۵ طبقه' : 'Every 5', tone: 'var(--ink-draw)' },
            ].map(({ Icon, title, note, tone }) => (
              <div
                key={title}
                className="flex flex-col items-center p-2.5 rounded-xl"
                style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--paper-well-hair)' }}
              >
                <Icon className="w-5 h-5 mb-1.5" style={{ color: tone }} />
                <div className="text-[11px] font-black" style={{ color: 'var(--ink)' }}>{title}</div>
                <div className="text-[9px] font-bold" style={{ color: 'var(--ink-3)' }}>{note}</div>
              </div>
            ))}
          </div>

          {/* Difficulty */}
          <div
            className="p-3 rounded-xl animate-[card-enter_0.4s_ease-out_0.35s_both]"
            style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--paper-well-hair)' }}
          >
            <div className="text-xs text-center flex flex-col gap-1">
              <div className="font-black mb-1.5" style={{ color: 'var(--ink)' }}>
                {isFA ? '📊 سختی پیشرونده' : '📊 Progressive Difficulty'}
              </div>
              <div className="text-[10px] font-medium flex flex-col gap-0.5" style={{ color: 'var(--ink-2)' }} dir={isFA ? 'rtl' : 'ltr'}>
                <div>{isFA ? '🟢 طبقه ۱ تا ۳ — آسان، بدون زمان' : '🟢 Floor 1-3: Easy, No timer'}</div>
                <div>{isFA ? '🟡 طبقه ۴ تا ۶ — متوسط، ۱۸۰ ثانیه' : '🟡 Floor 4-6: Medium, 180s'}</div>
                <div>{isFA ? '🟠 طبقه ۷ تا ۹ — سخت، ۱۲۰ ثانیه' : '🟠 Floor 7-9: Hard, 120s'}</div>
                <div>{isFA ? '🔴 طبقه ۱۰ به بالا — خیلی سخت، ۹۰ ثانیه' : '🔴 Floor 10+: Very Hard, 90s'}</div>
                <div>{isFA ? '👹 طبقه‌های ۵، ۱۰، ۱۵… باس!' : '👹 Floor 5,10,15...: BOSS!'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-xs flex flex-col gap-2.5 animate-[card-enter_0.5s_ease-out_0.4s_both]">
            <button 
                onClick={onEnterTower}
                disabled={!canEnter}
                className="w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95"
                style={
                  canEnter
                    ? {
                        background: 'var(--clay-shell)',
                        color: '#FFF6EC',
                        border: '1px solid #8E4E37',
                        boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 12px 24px -16px rgba(70,40,25,.9)',
                      }
                    : {
                        backgroundColor: 'var(--paper-well-2)',
                        color: 'var(--ink-3)',
                        border: '1px dashed var(--paper-well-hair)',
                        cursor: 'not-allowed',
                      }
                }
            >
                {canEnter ? <Play fill="currentColor" /> : <Clock />}
                {isFA ? 'شروع صعود' : 'Enter Tower'}
            </button>

            {!canEnter && (
                <button 
                    onClick={onGetFreeTicket}
                    className="w-full py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                      backgroundColor: 'var(--paper)',
                      border: '1px solid rgba(94,110,82,.55)',
                      color: 'var(--cg-green)',
                    }}
                >
                    <Ticket size={16} />
                    {isFA ? 'دریافت بلیت رایگان (\u200e+۱)' : 'Get free ticket (+1)'}
                </button>
            )}
        </div>

        {player.dailyTowerCoins >= TOWER_DAILY_COIN_CAP && (
             <div
               className="flex items-center gap-2 text-[10px] font-bold px-4 py-2 rounded-xl"
               style={{ color: 'var(--sand-stamp)', backgroundColor: 'rgba(200,149,43,.12)', border: '1px solid rgba(200,149,43,.3)' }}
             >
                 <AlertTriangle size={12} />
                 {isFA
                   ? `سقف درآمد روزانه (${TOWER_DAILY_COIN_CAP.toLocaleString('fa-IR')} سکه) پر شده است.`
                   : `Daily coin cap (${TOWER_DAILY_COIN_CAP}) reached.`}
             </div>
        )}

      </div>
    </div>
  );
};
