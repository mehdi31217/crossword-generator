import React from 'react';
import { Database, Copy } from 'lucide-react';
import { Language } from '../types';

interface DbSetupModalProps {
  show: boolean;
  language: Language;
  onCopySQL: () => void;
  onClose: () => void;
}

export const DbSetupModal: React.FC<DbSetupModalProps> = ({
  show,
  language,
  onCopySQL,
  onClose,
}) => {
  if (!show) return null;

  const isFA = language === 'fa';

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in backdrop-blur-md"
      style={{ backgroundColor: 'rgba(46,28,18,.72)' }}
    >
      <div className="w-full max-w-md cg-glass p-6 text-center" style={{ borderRadius: 26 }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(176,127,34,.16)', color: '#9E7418', border: '1px solid rgba(176,127,34,.32)' }}
        >
          <Database size={32} />
        </div>
        <h3 className="text-xl font-black mb-4" style={{ color: 'var(--ink)' }}>
          {isFA ? 'راه‌اندازی اولیه دیتابیس' : 'Database Setup Required'}
        </h3>
        <button
          onClick={onCopySQL}
          className="cg-btn-clay w-full py-4 rounded-xl font-black mb-3 flex items-center justify-center gap-2"
        >
          <Copy size={20} /> {isFA ? 'کپی کد کامل SQL' : 'Copy SQL Code'}
        </button>
        <button onClick={onClose} className="text-xs font-bold" style={{ color: 'var(--ink-3)' }}>
          {isFA ? 'بعداً انجام می‌دهم' : 'I\'ll do it later'}
        </button>
      </div>
    </div>
  );
};
