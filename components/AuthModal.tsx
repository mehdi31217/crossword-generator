
import React, { useState } from 'react';
import { Phone, Lock, Save, Flame, AlertCircle, Info } from 'lucide-react';
import { Language } from '../types';
import { AuthResult } from '../utils/gameServer';

interface AuthModalProps {
  language: Language;
  scoreToSave: number;
  // We can pass the whole player object or specific stats
  guestStats?: { score: number, coins: number, epicProgress: Record<string, number> };
  onRegister: (phone: string, pass: string, guestStats?: { score: number, coins: number, epicProgress: Record<string, number> }) => Promise<AuthResult>;
  onSkip: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, scoreToSave, guestStats, onRegister, onSkip }) => {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFA = language === 'fa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 4) {
      setError(isFA ? 'شماره موبایل نامعتبر است' : 'Phone number too short');
      return;
    }
    if (pass.length < 6) {
      setError(isFA ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 chars');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
        const result = await onRegister(phone, pass, guestStats);
        if (!result.success) {
            setError(result.message || (isFA ? 'خطا در ثبت نام' : 'Registration failed'));
        }
        // If success, the parent component handles closing
    } catch (err) {
        setError(isFA ? 'خطای غیرمنتظره' : 'Unexpected error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(46,28,18,.55)' }} />
      
      <div className="relative w-full max-w-sm cg-glass overflow-hidden animate-in zoom-in-95 duration-300" style={{ borderRadius: 28 }}>
        <div
          className="p-6 text-center relative overflow-hidden"
          style={{
            background: 'var(--clay-shell)',
            borderBottom: '1px solid rgba(58,30,18,.35)',
            color: '#FFF6EC',
          }}
        >
            <div className="absolute top-0 right-0 p-4 opacity-15"><Save size={80} /></div>
            <h2 className="text-xl font-black relative z-10 mb-1">
                {isFA ? 'ذخیره دائمی امتیاز!' : 'Save Your Score!'}
            </h2>
            <div className="text-xs font-bold uppercase tracking-widest relative z-10" style={{ color: 'rgba(255,246,236,.86)' }}>
                {isFA ? `امتیاز ${scoreToSave.toLocaleString()} در خطر است` : `${scoreToSave.toLocaleString()} PTS AT RISK`}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" dir={isFA ? 'rtl' : 'ltr'}>
            <div
              className="p-3 rounded-xl flex gap-2 items-start"
              style={{ background: 'rgba(176,127,34,.12)', border: '1px solid rgba(176,127,34,.3)' }}
            >
                <Info size={16} className="shrink-0 mt-0.5" style={{ color: '#9E7418' }} />
                <p className="text-[10px] font-bold leading-relaxed" style={{ color: '#8A6415' }}>
                    {isFA 
                    ? 'برای ورود یا ثبت‌نام، شماره و رمز دلخواه خود را وارد کنید. اگر قبلاً ثبت نام کرده‌اید، همان رمز را بزنید.' 
                    : 'Enter phone and password to Login or Register. Use same password if returning.'}
                </p>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <Phone className="absolute top-3.5 left-3" style={{ color: 'var(--ink-3)' }} size={18} />
                    <input 
                        type="tel" 
                        placeholder={isFA ? "شماره موبایل" : "Phone Number"}
                        className="w-full rounded-xl py-3 pl-10 pr-4 font-black focus:outline-none transition-all text-left"
                        style={{ background: 'var(--paper)', border: '2px solid rgba(36,26,20,.16)', color: 'var(--ink)' }}
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g,'')); setError(''); }}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute top-3.5 left-3" style={{ color: 'var(--ink-3)' }} size={18} />
                    <input 
                        type="password" 
                        placeholder={isFA ? "رمز عبور (حداقل ۶ رقم)" : "Password (min 6 chars)"}
                        className="w-full rounded-xl py-3 pl-10 pr-4 font-black focus:outline-none transition-all text-left"
                        style={{ background: 'var(--paper)', border: '2px solid rgba(36,26,20,.16)', color: 'var(--ink)' }}
                        value={pass}
                        onChange={e => { setPass(e.target.value); setError(''); }}
                    />
                </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl animate-shake"
                style={{ background: 'rgba(158,90,80,.12)', border: '1px solid rgba(158,90,80,.34)' }}
              >
                <AlertCircle size={14} className="shrink-0" style={{ color: '#9E5A50' }} />
                <span className="text-[10px] font-black leading-tight" style={{ color: '#9E5A50' }}>{error}</span>
              </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="cg-btn-clay w-full py-4 rounded-xl font-black active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={18} />
                        {isFA ? 'ثبت و ذخیره' : 'Save & Continue'}
                    </>
                )}
            </button>

            <button 
                type="button" 
                onClick={onSkip}
                className="w-full py-3 text-[10px] font-black transition-colors flex items-center justify-center gap-1 group"
                style={{ color: 'var(--ink-3)' }}
            >
                <Flame size={12} className="group-hover:fill-current transition-all" style={{ color: '#9E5A50' }} />
                {isFA ? 'فعلاً نه، امتیاز را نمی‌خواهم' : 'Not now, skip score'}
            </button>
        </form>
      </div>
    </div>
  );
};
