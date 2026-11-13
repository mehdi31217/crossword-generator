import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Language, PlayerState } from '../types';
import { getLegendChapters } from '../data/worldMapData';
import { getLegendPortraitImage } from '../data/legendImages';
import { WORLD_WAVES } from '../data/mapWaves';
import { SeaWaves, SeaMist, SeaMistDefs } from './MapSeaFx';
import { Star, Lock, ChevronRight, Plus, Minus, RotateCcw, Sparkles } from 'lucide-react';
import { FREE_FOOTBALL_LEGEND_IDS, getLegendUnlockCost } from '../utils/economy';
import { gameServer } from '../utils/gameServer';
import { GameCoin } from './GameCoin';
import { CornerFlorets } from './InkIcons';

// ─── Football Legend Data ─────────────────────────────────
export interface LegendChapter {
  id: string;
  title: { fa: string; en: string };
  subtitle: { fa: string; en: string };
  year: string;
}

export interface FootballLegend {
  id: string;
  name: { fa: string; en: string };
  nickname: { fa: string; en: string };
  country: { fa: string; en: string };
  countryCode: string; // ISO 3166-1 alpha-2
  countryX: number; // position on world map
  countryY: number;
  icon: string;
  color: string;
  chapters: LegendChapter[];
}

const toFaDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

/**
 * Chapter metadata for the map is derived directly from the playable content in
 * `data/worldMapData.ts` (via `getLegendChapters`). This guarantees the map's
 * chapter list, progress counters and orbit dots can never drift out of sync
 * with the actual chapters a player can open.
 */
const legendChapters = (legendId: string): LegendChapter[] =>
  getLegendChapters(legendId).map(c => ({
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    year: c.year,
  }));

export const FOOTBALL_LEGENDS: FootballLegend[] = [
  // ── The originals ─────────────────────────────────────
  {
    id: 'messi',
    name: { fa: 'لیونل مسی', en: 'Lionel Messi' },
    nickname: { fa: 'الگو: پسر آرژانتین', en: 'The GOAT' },
    country: { fa: 'آرژانتین', en: 'Argentina' },
    countryCode: 'AR',
    countryX: 296,
    countryY: 587,
    icon: '🐐',
    color: '#3b82f6',
    chapters: legendChapters('messi'),
  },
  {
    id: 'maradona',
    name: { fa: 'دیگو مارادونا', en: 'Diego Maradona' },
    nickname: { fa: 'الگو: دست خدا', en: 'El Pibe de Oro' },
    country: { fa: 'آرژانتین', en: 'Argentina' },
    countryCode: 'AR',
    countryX: 310,
    countryY: 575,
    icon: '🇦🇷',
    color: '#f59e0b',
    chapters: legendChapters('maradona'),
  },
  {
    id: 'ronaldo',
    name: { fa: 'کریستیانو رونالدو', en: 'Cristiano Ronaldo' },
    nickname: { fa: 'الگو: ماشین گلزنی', en: 'CR7' },
    country: { fa: 'پرتغال', en: 'Portugal' },
    countryCode: 'PT',
    countryX: 422,
    countryY: 350,
    icon: '🇵🇹',
    color: '#dc2626',
    chapters: legendChapters('ronaldo'),
  },
  {
    id: 'pele',
    name: { fa: 'پله', en: 'Pelé' },
    nickname: { fa: 'الگو: شاه فوتبال', en: 'O Rei' },
    country: { fa: 'برزیل', en: 'Brazil' },
    countryCode: 'BR',
    countryX: 322,
    countryY: 506,
    icon: '👑',
    color: '#22c55e',
    chapters: legendChapters('pele'),
  },
  {
    id: 'zidane',
    name: { fa: 'زین‌الدین زیدان', en: 'Zinedine Zidane' },
    nickname: { fa: 'الگو: استاد میانی', en: 'Le Maestro' },
    country: { fa: 'فرانسه', en: 'France' },
    countryCode: 'FR',
    countryX: 482,
    countryY: 316,
    icon: '🇫🇷',
    color: '#8b5cf6',
    chapters: legendChapters('zidane'),
  },

  // ── Classic legends ───────────────────────────────────
  {
    id: 'cruyff',
    name: { fa: 'یوهان کرویف', en: 'Johan Cruyff' },
    nickname: { fa: 'الگو: معمار فوتبال مدرن', en: 'The Architect' },
    country: { fa: 'هلند', en: 'Netherlands' },
    countryCode: 'NL',
    countryX: 486,
    countryY: 295,
    icon: '🇳🇱',
    color: '#f97316',
    chapters: legendChapters('cruyff'),
  },
  {
    id: 'beckenbauer',
    name: { fa: 'فرانتس بکن‌باوئر', en: 'Franz Beckenbauer' },
    nickname: { fa: 'الگو: قیصر', en: 'Der Kaiser' },
    country: { fa: 'آلمان', en: 'Germany' },
    countryCode: 'DE',
    countryX: 508,
    countryY: 300,
    icon: '🇩🇪',
    color: '#64748b',
    chapters: legendChapters('beckenbauer'),
  },
  {
    id: 'ronaldinho',
    name: { fa: 'رونالدینیو', en: 'Ronaldinho' },
    nickname: { fa: 'الگو: جادوگر', en: 'The Magician' },
    country: { fa: 'برزیل', en: 'Brazil' },
    countryCode: 'BR',
    countryX: 300,
    countryY: 528,
    icon: '🇧🇷',
    color: '#facc15',
    chapters: legendChapters('ronaldinho'),
  },
  {
    id: 'ronaldo9',
    name: { fa: 'رونالدو نازاریو', en: 'Ronaldo Nazário' },
    nickname: { fa: 'الگو: پدیده', en: 'O Fenômeno' },
    country: { fa: 'برزیل', en: 'Brazil' },
    countryCode: 'BR',
    countryX: 348,
    countryY: 545,
    icon: '⚽',
    color: '#0ea5e9',
    chapters: legendChapters('ronaldo9'),
  },
  {
    id: 'maldini',
    name: { fa: 'پائولو مالدینی', en: 'Paolo Maldini' },
    nickname: { fa: 'الگو: دیوار روسونری', en: 'The Wall' },
    country: { fa: 'ایتالیا', en: 'Italy' },
    countryCode: 'IT',
    countryX: 508,
    countryY: 330,
    icon: '🇮🇹',
    color: '#0284c7',
    chapters: legendChapters('maldini'),
  },
  {
    id: 'eusebio',
    name: { fa: 'اوزه‌بیو', en: 'Eusébio' },
    nickname: { fa: 'الگو: پلنگ سیاه', en: 'The Black Panther' },
    country: { fa: 'پرتغال', en: 'Portugal' },
    countryCode: 'PT',
    countryX: 450,
    countryY: 345,
    icon: '🇵🇹',
    color: '#b91c1c',
    chapters: legendChapters('eusebio'),
  },
  {
    id: 'puskas',
    name: { fa: 'فرنتس پوشکاش', en: 'Ferenc Puskás' },
    nickname: { fa: 'الگو: سرگرد گلزن', en: 'The Galloping Major' },
    country: { fa: 'مجارستان', en: 'Hungary' },
    countryCode: 'HU',
    countryX: 529,
    countryY: 313,
    icon: '🇭🇺',
    color: '#16a34a',
    chapters: legendChapters('puskas'),
  },
  {
    id: 'yashin',
    name: { fa: 'لو یاشین', en: 'Lev Yashin' },
    nickname: { fa: 'الگو: عنکبوت سیاه', en: 'The Black Spider' },
    country: { fa: 'روسیه', en: 'Russia' },
    countryCode: 'RU',
    countryX: 760,
    countryY: 240,
    icon: '🧤',
    color: '#475569',
    chapters: legendChapters('yashin'),
  },
  {
    id: 'best',
    name: { fa: 'جورج بست', en: 'George Best' },
    nickname: { fa: 'الگو: پنجمین بیتلز', en: 'The Fifth Beatle' },
    country: { fa: 'بریتانیا', en: 'United Kingdom' },
    countryCode: 'GB',
    countryX: 468,
    countryY: 272,
    icon: '🇬🇧',
    color: '#7c3aed',
    chapters: legendChapters('best'),
  },
  {
    id: 'platini',
    name: { fa: 'میشل پلاتینی', en: 'Michel Platini' },
    nickname: { fa: 'الگو: استاد ایستگاهی', en: 'Le Roi' },
    country: { fa: 'فرانسه', en: 'France' },
    countryCode: 'FR',
    countryX: 468,
    countryY: 326,
    icon: '🇫🇷',
    color: '#2563eb',
    chapters: legendChapters('platini'),
  },

  // ── Modern legends ────────────────────────────────────
  {
    id: 'neymar',
    name: { fa: 'نیمار', en: 'Neymar' },
    nickname: { fa: 'الگو: وارث پله', en: 'The Heir' },
    country: { fa: 'برزیل', en: 'Brazil' },
    countryCode: 'BR',
    countryX: 352,
    countryY: 495,
    icon: '🇧🇷',
    color: '#10b981',
    chapters: legendChapters('neymar'),
  },
  {
    id: 'mbappe',
    name: { fa: 'کیلیان امباپه', en: 'Kylian Mbappé' },
    nickname: { fa: 'الگو: موشک پاریس', en: 'The Rocket' },
    country: { fa: 'فرانسه', en: 'France' },
    countryCode: 'FR',
    countryX: 492,
    countryY: 310,
    icon: '🇫🇷',
    color: '#1d4ed8',
    chapters: legendChapters('mbappe'),
  },
  {
    id: 'haaland',
    name: { fa: 'ارلینگ هالند', en: 'Erling Haaland' },
    nickname: { fa: 'الگو: ربات گلزن', en: 'The Terminator' },
    country: { fa: 'نروژ', en: 'Norway' },
    countryCode: 'NO',
    countryX: 520,
    countryY: 215,
    icon: '🇳🇴',
    color: '#ef4444',
    chapters: legendChapters('haaland'),
  },
  {
    id: 'debruyne',
    name: { fa: 'کوین دی بروین', en: 'Kevin De Bruyne' },
    nickname: { fa: 'الگو: معمار بلژیک', en: 'The Maestro' },
    country: { fa: 'بلژیک', en: 'Belgium' },
    countryCode: 'BE',
    countryX: 490,
    countryY: 302,
    icon: '🇧🇪',
    color: '#eab308',
    chapters: legendChapters('debruyne'),
  },
  {
    id: 'modric',
    name: { fa: 'لوکا مودریچ', en: 'Luka Modrić' },
    nickname: { fa: 'الگو: معمار رئال', en: 'The Architect' },
    country: { fa: 'کرواسی', en: 'Croatia' },
    countryCode: 'HR',
    countryX: 521,
    countryY: 321,
    icon: '🇭🇷',
    color: '#dc2626',
    chapters: legendChapters('modric'),
  },
  {
    id: 'salah',
    name: { fa: 'محمد صلاح', en: 'Mohamed Salah' },
    nickname: { fa: 'الگو: پادشاه آنفیلد', en: 'The Egyptian King' },
    country: { fa: 'مصر', en: 'Egypt' },
    countryCode: 'EG',
    countryX: 561,
    countryY: 385,
    icon: '🇪🇬',
    color: '#0d9488',
    chapters: legendChapters('salah'),
  },
  {
    id: 'lewandowski',
    name: { fa: 'روبرت لواندوفسکی', en: 'Robert Lewandowski' },
    nickname: { fa: 'الگو: ماشین گلزنی', en: 'Lewy' },
    country: { fa: 'لهستان', en: 'Poland' },
    countryCode: 'PL',
    countryX: 528,
    countryY: 292,
    icon: '🇵🇱',
    color: '#e11d48',
    chapters: legendChapters('lewandowski'),
  },
  {
    id: 'iniesta',
    name: { fa: 'آندرس اینیستا', en: 'Andrés Iniesta' },
    nickname: { fa: 'الگو: گلزن فینال', en: 'El Ilusionista' },
    country: { fa: 'اسپانیا', en: 'Spain' },
    countryCode: 'ES',
    countryX: 466,
    countryY: 340,
    icon: '🇪🇸',
    color: '#f59e0b',
    chapters: legendChapters('iniesta'),
  },
  {
    id: 'son',
    name: { fa: 'سون هیونگ-مین', en: 'Son Heung-min' },
    nickname: { fa: 'الگو: کاپیتان کره', en: 'Sonny' },
    country: { fa: 'کره جنوبی', en: 'South Korea' },
    countryCode: 'KR',
    countryX: 833,
    countryY: 353,
    icon: '🇰🇷',
    color: '#db2777',
    chapters: legendChapters('son'),
  },
  {
    id: 'vandijk',
    name: { fa: 'ویرخیل فن‌دایک', en: 'Virgil van Dijk' },
    nickname: { fa: 'الگو: دیوار لیورپول', en: 'The Wall' },
    country: { fa: 'هلند', en: 'Netherlands' },
    countryCode: 'NL',
    countryX: 493,
    countryY: 288,
    icon: '🇳🇱',
    color: '#ea580c',
    chapters: legendChapters('vandijk'),
  },
];

// ─── Constants ──────────────────────────────────────────
const MAP_VIEWBOX = { w: 1009.6727, h: 665.96301 };

const LEGEND_GROUP_COLORS: Record<string, string> = {
  messi: '#3b82f6',
  maradona: '#f59e0b',
  ronaldo: '#dc2626',
  pele: '#22c55e',
  zidane: '#8b5cf6',
  cruyff: '#f97316',
  beckenbauer: '#64748b',
  ronaldinho: '#facc15',
  ronaldo9: '#0ea5e9',
  maldini: '#0284c7',
  eusebio: '#b91c1c',
  puskas: '#16a34a',
  yashin: '#475569',
  best: '#7c3aed',
  platini: '#2563eb',
  neymar: '#10b981',
  mbappe: '#1d4ed8',
  haaland: '#ef4444',
  debruyne: '#eab308',
  modric: '#dc2626',
  salah: '#0d9488',
  lewandowski: '#e11d48',
  iniesta: '#f59e0b',
  son: '#db2777',
  vandijk: '#ea580c',
};

// ─── Component ──────────────────────────────────────────
interface WorldMapProps {
  language: Language;
  unlockedChapters: Record<string, number>; // legendId: chapter level (1-based, 0 = not started)
  onSelectLegend: (legend: FootballLegend) => void;
  player?: PlayerState | null;
  onCoinsChange?: (coins: number) => void;
  onOpenShop?: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 9;

export const WorldMap: React.FC<WorldMapProps> = ({
  language,
  unlockedChapters,
  onSelectLegend,
  player,
  onCoinsChange,
  onOpenShop,
}) => {
  const isFA = language === 'fa';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setView] = useState<{ scale: number; tx: number; ty: number }>({ scale: 1, tx: 0, ty: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // ── Economy: legend unlock state & modal prompt ──────────────────
  const [unlockedLegends, setUnlockedLegends] = useState<string[]>(() => {
    try {
      const eco = gameServer.getLocalEconomyState();
      return Array.isArray(eco.unlockedLegends) && eco.unlockedLegends.length > 0
        ? eco.unlockedLegends
        : FREE_FOOTBALL_LEGEND_IDS;
    } catch {
      return FREE_FOOTBALL_LEGEND_IDS;
    }
  });

  const [unlockLegendPrompt, setUnlockLegendPrompt] = useState<{
    legend: FootballLegend;
    cost: number;
    error?: string;
    isUnlocking?: boolean;
  } | null>(null);

  const isLegendUnlocked = useCallback((legendId: string): boolean => {
    if (FREE_FOOTBALL_LEGEND_IDS.includes(legendId)) return true;
    try {
      const eco = gameServer.getLocalEconomyState();
      if (eco.hasEpicPatronPass) return true;
    } catch {}
    return unlockedLegends.includes(legendId);
  }, [unlockedLegends]);

  const handleAttemptOpenLegend = useCallback((legend: FootballLegend) => {
    if (isLegendUnlocked(legend.id)) {
      onSelectLegend(legend);
      return;
    }
    const cost = getLegendUnlockCost(legend.id);
    setUnlockLegendPrompt({ legend, cost });
  }, [isLegendUnlocked, onSelectLegend]);

  const handleConfirmUnlock = useCallback(async () => {
    if (!unlockLegendPrompt || unlockLegendPrompt.isUnlocking) return;
    const { legend, cost } = unlockLegendPrompt;
    setUnlockLegendPrompt(prev => prev ? { ...prev, isUnlocking: true, error: undefined } : null);

    const res = await gameServer.unlockContent(player || null, 'legend', legend.id);
    if (res.ok) {
      if (typeof res.coins === 'number' && onCoinsChange) {
        onCoinsChange(res.coins);
      }
      setUnlockedLegends(prev => prev.includes(legend.id) ? prev : [...prev, legend.id]);
      const targetLegend = legend;
      setUnlockLegendPrompt(null);
      // Immediately open legend chapters after successful unlock
      onSelectLegend(targetLegend);
    } else {
      const errMsg = res.error === 'insufficient_coins'
        ? (isFA ? `سکه کافی ندارید (${cost} سکه لازم است).` : `Not enough coins (${cost} needed).`)
        : (isFA ? 'خطا در بازگشایی اسطوره.' : 'Could not unlock legend.');
      setUnlockLegendPrompt(prev => prev ? { ...prev, isUnlocking: false, error: errMsg } : null);
    }
  }, [unlockLegendPrompt, player, onCoinsChange, onSelectLegend, isFA]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const stageGroupRef = useRef<SVGGElement | null>(null);
  const viewRef = useRef<{ scale: number; tx: number; ty: number }>({ scale: 1, tx: 0, ty: 0 });
  const lastCommittedRef = useRef<{ scale: number; tx: number; ty: number }>({ scale: 1, tx: 0, ty: 0 });
  const rafCommitRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const animRafRef = useRef<number | null>(null);
  const ctmCacheRef = useRef<{ a: number; d: number; e: number; f: number; ts: number } | null>(null);

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; scale: number; anchorX: number; anchorY: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const W = MAP_VIEWBOX.w;
  const H = MAP_VIEWBOX.h;

  // ── Zoom / pan helpers ────────────────────────────────
  const clampView = useCallback((v: { scale: number; tx: number; ty: number }) => {
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale));
    return {
      scale: s,
      tx: Math.min(0, Math.max(W * (1 - s), v.tx)),
      ty: Math.min(0, Math.max(H * (1 - s), v.ty)),
    };
  }, [W, H]);

  const getFastCTM = useCallback((forceRefresh = false) => {
    const now = performance.now();
    if (!forceRefresh && ctmCacheRef.current && now - ctmCacheRef.current.ts < 250) {
      return ctmCacheRef.current;
    }
    const el = svgRef.current;
    const m = el?.getScreenCTM();
    if (!m) return { a: 1, d: 1, e: 0, f: 0, ts: now };
    const cached = { a: m.a, d: m.d, e: m.e, f: m.f, ts: now };
    ctmCacheRef.current = cached;
    return cached;
  }, []);

  const clientToViewBox = useCallback((clientX: number, clientY: number, forceRefresh = false) => {
    const m = getFastCTM(forceRefresh);
    return {
      x: (clientX - m.e) / (m.a || 1),
      y: (clientY - m.f) / (m.d || 1),
    };
  }, [getFastCTM]);

  /**
   * Immediately updates the SVG <g> transform attribute for 0ms latency 60-120fps
   * movement, and throttles React state commits so heavy marker/label calculations
   * never block the frame rate.
   */
  const commitView = useCallback((next: { scale: number; tx: number; ty: number }, immediateReact = false) => {
    viewRef.current = next;
    if (stageGroupRef.current) {
      stageGroupRef.current.setAttribute(
        'transform',
        `translate(${next.tx.toFixed(2)} ${next.ty.toFixed(2)}) scale(${next.scale.toFixed(4)})`
      );
    }

    if (immediateReact) {
      if (rafCommitRef.current !== null) {
        cancelAnimationFrame(rafCommitRef.current);
        rafCommitRef.current = null;
      }
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      lastCommittedRef.current = next;
      setView(next);
      return;
    }

    const prev = lastCommittedRef.current;
    const scaleDelta = Math.abs(next.scale - prev.scale) / (prev.scale || 1);

    // If scale changed noticeably, schedule a single rAF React state sync
    if (scaleDelta >= 0.035 && rafCommitRef.current === null) {
      rafCommitRef.current = requestAnimationFrame(() => {
        rafCommitRef.current = null;
        lastCommittedRef.current = viewRef.current;
        setView(viewRef.current);
      });
    }

    // Always ensure a final React commit once the gesture/wheel settles
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(() => {
      settleTimerRef.current = null;
      lastCommittedRef.current = viewRef.current;
      setView(viewRef.current);
    }, 80);
  }, []);

  const stopAnim = useCallback(() => {
    if (animRafRef.current !== null) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
  }, []);

  /** Smoothly animate to a target view (for +/- buttons, reset, double-click). */
  const animateToView = useCallback((target: { scale: number; tx: number; ty: number }, duration = 200) => {
    stopAnim();
    const start = { ...viewRef.current };
    const end = clampView(target);
    if (
      Math.abs(start.scale - end.scale) < 0.001 &&
      Math.abs(start.tx - end.tx) < 0.5 &&
      Math.abs(start.ty - end.ty) < 0.5
    ) {
      commitView(end, true);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3); // cubic ease-out
      const cur = clampView({
        scale: start.scale + (end.scale - start.scale) * ease,
        tx: start.tx + (end.tx - start.tx) * ease,
        ty: start.ty + (end.ty - start.ty) * ease,
      });
      commitView(cur, p >= 1);
      if (p < 1) {
        animRafRef.current = requestAnimationFrame(step);
      } else {
        animRafRef.current = null;
      }
    };
    animRafRef.current = requestAnimationFrame(step);
  }, [clampView, commitView, stopAnim]);

  useEffect(() => {
    return () => {
      stopAnim();
      if (rafCommitRef.current !== null) cancelAnimationFrame(rafCommitRef.current);
      if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current);
    };
  }, [stopAnim]);

  /** Zoom keeping the point under (clientX, clientY) fixed on screen. */
  const zoomAt = useCallback((clientX: number, clientY: number, factor: number, smooth = false) => {
    const p = clientToViewBox(clientX, clientY);
    const prev = viewRef.current;
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
    if (nextScale === prev.scale) return;
    const r = nextScale / prev.scale;
    const next = clampView({
      scale: nextScale,
      tx: p.x - r * (p.x - prev.tx),
      ty: p.y - r * (p.y - prev.ty),
    });
    if (smooth) {
      animateToView(next, 210);
    } else {
      stopAnim();
      commitView(next, false);
    }
  }, [clientToViewBox, clampView, animateToView, stopAnim, commitView]);

  const zoomByButton = useCallback((factor: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor, true);
  }, [zoomAt]);

  const resetView = useCallback(() => {
    animateToView({ scale: 1, tx: 0, ty: 0 }, 240);
  }, [animateToView]);

  // Wheel: trackpad pinch (ctrlKey) and mouse wheel zoom, two-finger scroll pans.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const dy = e.deltaY * unit;
      const dx = e.deltaX * unit;
      const pinch = e.ctrlKey; // trackpad pinch-zoom arrives as ctrl+wheel
      const mouseNotch = !pinch && dx === 0 && Math.abs(dy) >= 40 && Number.isInteger(dy);
      if (pinch || mouseNotch) {
        zoomAt(e.clientX, e.clientY, Math.exp(-dy * (pinch ? 0.012 : 0.0025)), false);
      } else {
        stopAnim();
        const k = getFastCTM().a || 1;
        const prev = viewRef.current;
        commitView(clampView({ ...prev, tx: prev.tx - dx / k, ty: prev.ty - dy / k }), false);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt, clampView, getFastCTM, stopAnim, commitView]);

  // ── Pointer / touch gestures ──────────────────────────
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAnim();
    getFastCTM(true); // refresh CTM once at gesture start
    const el = svgRef.current;
    try { el?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    suppressClickRef.current = false;

    if (pointersRef.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
      pinchRef.current = null;
    } else if (pointersRef.current.size === 2) {
      dragRef.current = null;
      const [a, b] = [...pointersRef.current.values()];
      const mx0 = (a.x + b.x) / 2;
      const my0 = (a.y + b.y) / 2;
      const cur = viewRef.current;
      const v0 = clientToViewBox(mx0, my0);
      pinchRef.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: cur.scale,
        anchorX: (v0.x - cur.tx) / cur.scale,
        anchorY: (v0.y - cur.ty) / cur.scale,
      };
      suppressClickRef.current = true;
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Two pointers → pinch zoom + pan, both anchored to the gesture midpoint.
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const base = pinchRef.current;
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      if (base.dist > 0 && dist > 0) {
        const v1 = clientToViewBox(mx, my);
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, base.scale * (dist / base.dist)));
        commitView(clampView({
          scale: nextScale,
          tx: v1.x - nextScale * base.anchorX,
          ty: v1.y - nextScale * base.anchorY,
        }), false);
      }
      suppressClickRef.current = true;
      return;
    }

    // One pointer → drag to pan (updates SVG transform directly without React re-render!).
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return; // still a tap, not a drag
    if (!d.moved) {
      d.moved = true;
      suppressClickRef.current = true;
      setIsPanning(true);
    }
    const k = getFastCTM().a || 1;
    const prev = viewRef.current;
    commitView(clampView({ ...prev, tx: prev.tx + dx / k, ty: prev.ty + dy / k }), false);
    d.x = e.clientX;
    d.y = e.clientY;
  };

  /**
   * Pick the marker nearest to a screen point (within its own radius + tolerance).
   */
  const pickNearestMarker = useCallback((clientX: number, clientY: number): string | null => {
    let bestId: string | null = null;
    let bestDist = Infinity;
    const groups = document.querySelectorAll<SVGGElement>('[data-marker]');
    for (const g of Array.from(groups)) {
      const circle = g.querySelector('circle');
      if (!circle) continue;
      const r = circle.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(clientX - cx, clientY - cy);
      const reach = Math.max(r.width, r.height) / 2 + 6;
      if (d <= reach && d < bestDist) {
        bestDist = d;
        bestId = g.getAttribute('data-marker');
      }
    }
    return bestId;
  }, []);

  const endPointer = (e: React.PointerEvent<SVGSVGElement>, cancelled = false) => {
    const wasGesture = suppressClickRef.current;
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;

    if (pointersRef.current.size === 0) {
      setIsPanning(false);
      commitView(viewRef.current, true);
      const d = dragRef.current;
      dragRef.current = null;
      if (!cancelled && !wasGesture && d && !d.moved) {
        setSelectedId(pickNearestMarker(e.clientX, e.clientY));
      }
    }
    try { svgRef.current?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const onDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pickNearestMarker(e.clientX, e.clientY)) return;
    zoomAt(e.clientX, e.clientY, 1.75, true);
  };

  // ── Dynamic Marker Sizing (Zoom + Viewport Sparsity + Local Neighbor Spacing) ──
  const minNeighborDistById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of FOOTBALL_LEGENDS) {
      let best = Infinity;
      for (const b of FOOTBALL_LEGENDS) {
        if (a.id === b.id) continue;
        const d = Math.hypot(a.countryX - b.countryX, a.countryY - b.countryY);
        if (d < best) best = d;
      }
      map[a.id] = best;
    }
    return map;
  }, []);

  const visibleInViewportCount = useMemo(() => {
    const minX = -view.tx / view.scale - 25;
    const maxX = (W - view.tx) / view.scale + 25;
    const minY = -view.ty / view.scale - 25;
    const maxY = (H - view.ty) / view.scale + 25;
    let count = 0;
    for (const l of FOOTBALL_LEGENDS) {
      if (l.countryX >= minX && l.countryX <= maxX && l.countryY >= minY && l.countryY <= maxY) {
        count++;
      }
    }
    return Math.max(1, count);
  }, [view.tx, view.ty, view.scale, W, H]);

  // When fewer legends are on screen (or as you zoom in), circles grow substantially on screen
  const sparseBoost =
    visibleInViewportCount <= 2
      ? 1.48
      : visibleInViewportCount <= 4
      ? 1.36
      : visibleInViewportCount <= 7
      ? 1.24
      : visibleInViewportCount <= 12
      ? 1.12
      : 1.0;

  const getScreenMarkerRadius = useCallback(
    (legendId: string, isSelected: boolean, isHovered: boolean) => {
      const nnDist = minNeighborDistById[legendId] || 40;
      const screenNNDist = nnDist * view.scale;
      const zoomGrowth = Math.pow(view.scale, 0.46);
      const desiredScreenR = 23 * zoomGrowth * sparseBoost;
      // In very tight clusters at 1x zoom, keep circles from swallowing neighbors;
      // as soon as you zoom in, screenNNDist grows and the cap opens up to 58!
      const neighborCap = Math.max(19, Math.min(58, screenNNDist * 0.62));
      const baseR = Math.max(19, Math.min(56, Math.min(desiredScreenR, neighborCap)));
      if (isSelected) return Math.min(66, baseR * 1.34);
      if (isHovered) return Math.min(60, baseR * 1.18);
      return baseR;
    },
    [minNeighborDistById, view.scale, sparseBoost]
  );

  // ── Label decluttering ────────────────────────────────
  const labelScale = Math.min(2.1, Math.pow(view.scale, 0.42) * Math.sqrt(sparseBoost));
  const labelWidth = (l: FootballLegend) =>
    (4.8 * (isFA ? l.name.fa.length : l.name.en.length) + 10) * labelScale;

  const visibleLabels = useMemo(() => {
    const vis: Record<string, boolean> = {};
    const accepted: FootballLegend[] = [];
    const hits = (a: FootballLegend, b: FootballLegend) =>
      Math.abs(view.scale * (a.countryY - b.countryY)) < 14 * labelScale &&
      Math.abs(view.scale * (a.countryX - b.countryX)) < (labelWidth(a) + labelWidth(b)) / 2;

    // The selected / hovered legend always keeps its label.
    const forced = FOOTBALL_LEGENDS.filter(l => l.id === selectedId || l.id === hoveredId);
    for (const l of forced) { vis[l.id] = true; accepted.push(l); }

    // Unlocked legends get priority, then map order.
    const rest = FOOTBALL_LEGENDS
      .filter(l => !vis[l.id])
      .slice()
      .sort((a, b) => ((unlockedChapters[b.id] || 0) > 0 ? 1 : 0) - ((unlockedChapters[a.id] || 0) > 0 ? 1 : 0));

    for (const l of rest) {
      if (accepted.some(a => hits(a, l))) { vis[l.id] = false; continue; }
      vis[l.id] = true;
      accepted.push(l);
    }
    return vis;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.scale, labelScale, isFA, selectedId, hoveredId, unlockedChapters]);

  const hiddenLabelCount = FOOTBALL_LEGENDS.length - Object.values(visibleLabels).filter(Boolean).length;
  const zoomPct = Math.round(view.scale * 100);

  const selectedLegend = selectedId
    ? FOOTBALL_LEGENDS.find(l => l.id === selectedId)
    : null;

  const getLegendLevel = (legendId: string): number => {
    return unlockedChapters[legendId] || 0;
  };

  const getLegendProgress = (legendId: string): string => {
    const legend = FOOTBALL_LEGENDS.find(l => l.id === legendId);
    if (!legend) return '';
    const level = getLegendLevel(legendId);
    if (level === 0) return isFA ? 'قفل' : 'Locked';
    return `${level}/${legend.chapters.length}`;
  };

  const inv = 1 / view.scale;
  // Only label the selected legend's chapter orbit once there is room for it.
  const showOrbitTitles = view.scale >= 1.8;

  // Sort markers so hovered and selected legends always paint on top of neighbors
  const sortedLegends = useMemo(() => {
    return FOOTBALL_LEGENDS.slice().sort((a, b) => {
      const rank = (id: string) => (id === selectedId ? 2 : id === hoveredId ? 1 : 0);
      return rank(a.id) - rank(b.id);
    });
  }, [selectedId, hoveredId]);

  // Stickers and controls sit on printed paper, so they are cream labels with an
  // ink hairline rather than the dark chips a screen map would use.
  const paperPill: React.CSSProperties = {
    backgroundColor: 'rgba(246,241,231,.94)',
    border: '1px solid rgba(36,26,20,.22)',
    color: 'var(--ink)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7), 0 6px 12px -8px rgba(70,45,30,.7)',
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #64798C 0%, #5A6E80 46%, #4B5E6A 100%)',
        color: 'var(--ink)',
      }}
    >
      {/* World Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="map-sheet-wash" aria-hidden="true" />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ touchAction: 'none', userSelect: 'none', position: 'relative', zIndex: 1, cursor: isPanning ? 'grabbing' : 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={(e) => endPointer(e, true)}
          onPointerLeave={() => setHoveredId(null)}
          onDoubleClick={onDoubleClick}
        >
          <defs>
            <clipPath id="legendPortraitClip" clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.5" />
            </clipPath>
            <SeaMistDefs id="worldMist" />
          </defs>

          <g
            ref={stageGroupRef}
            transform={`translate(${viewRef.current.tx} ${viewRef.current.ty}) scale(${viewRef.current.scale})`}
            style={{ willChange: 'transform' }}
          >
            {/* The painted sheet: the approved poster material, rendered without
                pins or names so the live markers below own every coordinate. */}
            <image href="/images/map-world-clay.webp" width={W} height={H} opacity="1" pointerEvents="none"
              className="map-plate-img" />

            {/* Living water, drawn straight onto the painted ripple anchors */}
            <SeaWaves anchors={WORLD_WAVES} />
            <SeaMist gradId="worldMist" w={W} h={H} inv={inv} />

            {/* Connection lines from selected legend (constant on-screen size). */}
            {selectedLegend && (
              <g>
                {selectedLegend.chapters.map((ch, idx) => {
                  const angle = (idx / selectedLegend.chapters.length) * Math.PI * 2 - Math.PI / 2;
                  const selectedScreenR = getScreenMarkerRadius(selectedLegend.id, true, false);
                  const orbitR = (selectedScreenR + 34) * inv;
                  const cx = selectedLegend.countryX;
                  const cy = selectedLegend.countryY;
                  const x = cx + Math.cos(angle) * orbitR;
                  const y = cy + Math.sin(angle) * orbitR;
                  return (
                    <g key={ch.id}>
                      <line
                        x1={cx} y1={cy} x2={x} y2={y}
                        stroke={selectedLegend.color} strokeWidth={1.5 * inv} opacity="0.35"
                      />
                      <circle cx={x} cy={y} r={5 * inv} fill={selectedLegend.color} opacity="0.65" />
                      {showOrbitTitles && (
                        <text
                          x={x + 9 * inv} y={y + 3 * inv}
                          fill={selectedLegend.color}
                          fontSize={8 * inv}
                          opacity="0.9"
                          fontFamily="sans-serif"
                          stroke="rgba(246,241,231,0.95)"
                          strokeWidth={2.5 * inv}
                          paintOrder="stroke"
                        >
                          {isFA ? ch.title.fa : ch.title.en}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Legend portrait medallions */}
            {sortedLegends.map(legend => {
              const level = getLegendLevel(legend.id);
              const isSelected = selectedId === legend.id;
              const isHovered = hoveredId === legend.id;
              const isUnlocked = level > 0;
              const screenR = getScreenMarkerRadius(legend.id, isSelected, isHovered);
              const markerSize = screenR * inv;
              const portraitUrl = getLegendPortraitImage(legend.id);
              const labelText = isFA ? legend.name.fa : legend.name.en;
              const labelFont = 8.5 * labelScale * inv;
              const labelH = 12 * labelScale * inv;
              const labelTop = legend.countryY + markerSize + 5 * labelScale * inv;
              const labelW = (4.8 * labelText.length + 10) * labelScale * inv;
              const showLabel = !!visibleLabels[legend.id];

              return (
                <g
                  key={legend.id}
                  data-marker={legend.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (suppressClickRef.current) return; // finished a pan/pinch, not a tap
                    setSelectedId(legend.id);
                  }}
                  onMouseEnter={() => { if (!isPanning) setHoveredId(legend.id); }}
                  onMouseLeave={() => { if (!isPanning) setHoveredId(null); }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible hit area — easier to tap in crowded regions */}
                  <circle
                    cx={legend.countryX}
                    cy={legend.countryY}
                    r={markerSize + 9 * inv}
                    fill="transparent"
                  />

                  {/* Soft halo + pulse ring when selected (pure vector, zero filter cost) */}
                  {isSelected && (
                    <>
                      <circle
                        cx={legend.countryX}
                        cy={legend.countryY}
                        r={markerSize + 4.5 * inv}
                        fill={legend.color}
                        opacity={0.22}
                      />
                      <circle
                        cx={legend.countryX}
                        cy={legend.countryY}
                        r={markerSize + 6 * inv}
                        fill="none"
                        stroke={legend.color}
                        strokeWidth={1.6 * inv}
                        opacity={0.75}
                      >
                        <animate
                          attributeName="r"
                          values={`${markerSize + 3 * inv};${markerSize + 11 * inv};${markerSize + 3 * inv}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Pure vector drop shadow (replaces expensive SVG feDropShadow filter) */}
                  <circle
                    cx={legend.countryX}
                    cy={legend.countryY + 1.8 * inv}
                    r={markerSize + 2.1 * inv}
                    fill="rgba(26, 13, 5, 0.36)"
                    className="pointer-events-none"
                  />

                  {/* Outer medallion frame */}
                  <circle
                    cx={legend.countryX}
                    cy={legend.countryY}
                    r={markerSize + 1.8 * inv}
                    fill="#F6EFE2"
                    stroke={legend.color}
                    strokeWidth={(isSelected ? 3.2 : isHovered ? 2.4 : 1.8) * inv}
                  />

                  {/* Footballer Portrait Photo inside circle */}
                  <image
                    href={portraitUrl}
                    x={legend.countryX - markerSize}
                    y={legend.countryY - markerSize}
                    width={markerSize * 2}
                    height={markerSize * 2}
                    preserveAspectRatio="xMidYMin slice"
                    clipPath="url(#legendPortraitClip)"
                    className="pointer-events-none select-none"
                  />

                  {/* Crisp inner accent rim */}
                  <circle
                    cx={legend.countryX}
                    cy={legend.countryY}
                    r={markerSize}
                    fill="none"
                    stroke={isUnlocked || isSelected || isHovered ? legend.color : 'rgba(255,248,236,0.85)'}
                    strokeWidth={(isSelected ? 2.0 : 1.1) * inv}
                    className="pointer-events-none"
                  />

                  {/* Small corner badge for unlocked star / country icon / lock */}
                  <g className="pointer-events-none">
                    <circle
                      cx={legend.countryX + markerSize * 0.72}
                      cy={legend.countryY + markerSize * 0.72}
                      r={markerSize * 0.30}
                      fill={!isLegendUnlocked(legend.id) ? '#3A2016' : '#F6F1E7'}
                      stroke={!isLegendUnlocked(legend.id) ? '#B07F22' : legend.color}
                      strokeWidth={0.9 * inv}
                    />
                    <text
                      x={legend.countryX + markerSize * 0.72}
                      y={legend.countryY + markerSize * 0.74}
                      fontSize={markerSize * 0.34}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {!isLegendUnlocked(legend.id) ? '🔒' : isUnlocked ? '⭐' : legend.icon}
                    </text>
                  </g>

                  {/* Name label (decluttered) */}
                  {showLabel && (
                    <g className="pointer-events-none">
                      <rect
                        x={legend.countryX - labelW / 2}
                        y={labelTop}
                        width={labelW}
                        height={labelH}
                        rx={3.5 * labelScale * inv}
                        fill={isSelected || isHovered ? 'rgba(246,241,231,.98)' : 'rgba(246,241,231,.92)'}
                        stroke={isSelected || isHovered ? legend.color : 'rgba(36,26,20,.32)'}
                        strokeWidth={(isSelected || isHovered ? 1.1 : 0.7) * inv}
                      />
                      <text
                        x={legend.countryX}
                        y={labelTop + labelH / 2}
                        fill={isSelected || isHovered ? '#241A14' : '#3E2E22'}
                        fontSize={labelFont}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        {labelText}
                      </text>
                    </g>
                  )}

                  {/* Progress badge */}
                  {isSelected && (
                    <g className="pointer-events-none">
                      <rect
                        x={legend.countryX + markerSize + 5 * inv}
                        y={legend.countryY - 9 * inv}
                        width={22 * inv}
                        height={12 * inv}
                        rx={3.5 * inv}
                        fill="rgba(246,241,231,.96)"
                        stroke={legend.color}
                        strokeWidth={0.8 * inv}
                      />
                      <text
                        x={legend.countryX + markerSize + 16 * inv}
                        y={legend.countryY - 3 * inv}
                        fill="#241A14"
                        fontSize={6 * inv}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                      >
                        {getLegendProgress(legend.id)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div
          dir="ltr"
          className="absolute top-3 left-3 z-20 flex flex-col items-center gap-1.5 select-none"
        >
          <button
            onClick={() => zoomByButton(1.6)}
            disabled={view.scale >= MAX_SCALE}
            title={isFA ? 'بزرگ‌نمایی' : 'Zoom in'}
            aria-label={isFA ? 'بزرگ‌نمایی' : 'Zoom in'}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-35 disabled:active:scale-100"
            style={paperPill}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => zoomByButton(1 / 1.6)}
            disabled={view.scale <= MIN_SCALE}
            title={isFA ? 'کوچک‌نمایی' : 'Zoom out'}
            aria-label={isFA ? 'کوچک‌نمایی' : 'Zoom out'}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-35 disabled:active:scale-100"
            style={paperPill}
          >
            <Minus size={16} />
          </button>
          <button
            onClick={resetView}
            disabled={view.scale === 1 && view.tx === 0 && view.ty === 0}
            title={isFA ? 'بازنشانی نقشه' : 'Reset map'}
            aria-label={isFA ? 'بازنشانی نقشه' : 'Reset map'}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-35 disabled:active:scale-100"
            style={{ ...paperPill, color: 'var(--ink-2)' }}
          >
            <RotateCcw size={14} />
          </button>
          <div
            className="mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold tabular-nums"
            style={{ ...paperPill, color: 'var(--ink-2)' }}
          >
            {zoomPct}%
          </div>
        </div>

        {/* Hint bar */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap pointer-events-none"
          style={{ ...paperPill, color: 'var(--ink-2)' }}
        >
          <span>{isFA ? '🖱️ اسکرول یا 🤏 دو انگشت برای زوم' : '🖱️ Scroll or 🤏 pinch to zoom'}</span>
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <span>{isFA ? '✋ بکش تا جابه‌جا شود' : '✋ Drag to pan'}</span>
          {hiddenLabelCount > 0 && (
            <>
              <span style={{ color: 'var(--ink-3)' }}>·</span>
              <span style={{ color: '#9E7418' }}>
                {isFA ? `${hiddenLabelCount} نام با زوم دیده می‌شود` : `${hiddenLabelCount} names need zoom`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Info Panel — a moulded clay tray the chapter plates stand in */}
      {selectedLegend && (
        <div className="map-tray shrink-0 animate-in slide-in-from-bottom duration-300" dir="rtl">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full overflow-hidden shrink-0 relative flex items-center justify-center"
              style={{
                backgroundColor: 'var(--paper)',
                border: `2.5px solid ${selectedLegend.color}`,
                boxShadow: 'inset 0 0 0 1px rgba(36,26,20,.16), 0 5px 11px -8px rgba(30,12,4,.9)',
              }}
            >
              <img
                src={getLegendPortraitImage(selectedLegend.id)}
                alt={isFA ? selectedLegend.name.fa : selectedLegend.name.en}
                className="w-full h-full object-cover object-top"
                draggable={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="on-clay text-sm font-black truncate">
                {isFA ? selectedLegend.name.fa : selectedLegend.name.en}
              </h3>
              <p className="on-clay-2 text-[10px] font-bold">
                {isFA ? `از ${selectedLegend.country.fa}` : `From ${selectedLegend.country.en}`}
              </p>
            </div>
            {isLegendUnlocked(selectedLegend.id) ? (
              <button
                onClick={() => onSelectLegend(selectedLegend)}
                className="px-4 py-2 rounded-lg text-xs font-black active:scale-95 transition-all flex items-center gap-1.5"
                style={{
                  background: 'var(--clay-shell)',
                  color: '#FFF6EC',
                  border: '1px solid #8E4E37',
                  boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 8px 16px -12px rgba(70,40,25,.9)',
                }}
              >
                <span>{isFA ? 'شروع' : 'Start'} {isFA ? selectedLegend.name.fa : selectedLegend.name.en}</span>
              </button>
            ) : (
              <button
                onClick={() => handleAttemptOpenLegend(selectedLegend)}
                className="px-3.5 py-2 rounded-lg text-xs font-black active:scale-95 transition-all flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #7A3626 0%, #4D1F15 100%)',
                  color: '#FFE2B8',
                  border: '1px solid #C4823F',
                  boxShadow: 'inset 0 1px 0 rgba(255,226,184,.3), 0 8px 16px -10px rgba(40,15,8,.9)',
                }}
              >
                <Lock size={12} className="text-[#FBBF24]" />
                <span className="tabular-nums font-black">{toFaDigits(getLegendUnlockCost(selectedLegend.id))}</span>
                <GameCoin size={13} />
              </button>
            )}
          </div>

          {/* the drilled progress row: one hole per chapter, gold once won */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="map-tray-slot" />
            <div className="map-tray-holes shrink-0">
              {selectedLegend.chapters.map((ch, idx) => (
                <span
                  key={ch.id}
                  className={`map-hole${idx < getLegendLevel(selectedLegend.id) ? ' won' : ''}`}
                />
              ))}
            </div>
            <span className="map-tray-slot" />
          </div>

          {/* Chapter list */}
          <div className="map-tray-bay">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {selectedLegend.chapters.map((ch, idx) => {
                const level = getLegendLevel(selectedLegend.id);
                const isUnlocked = idx < level;
                const isCurrent = idx === level;
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleAttemptOpenLegend(selectedLegend)}
                    className={`shrink-0 w-20 rounded-lg p-2 text-center transition-all cursor-pointer ${isUnlocked ? 'map-plate' : isCurrent ? 'map-plate now' : 'map-plate-locked'}`}
                  >
                    <div className="text-[9px] font-black leading-tight mb-0.5">
                      {isFA ? ch.title.fa : ch.title.en}
                    </div>
                    <div className="text-[6px] font-bold opacity-70">{ch.year}</div>
                    {isUnlocked ? (
                      <Star size={7} className="mx-auto mt-0.5" style={{ color: '#B07F22', fill: '#B07F22' }} />
                    ) : isCurrent ? (
                      <ChevronRight size={7} className="mx-auto mt-0.5" style={{ color: '#8E4E37' }} />
                    ) : (
                      <Lock size={7} className="mx-auto mt-0.5 opacity-60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Terracotta Unlock Confirmation Modal */}
      {unlockLegendPrompt && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl p-5 text-center relative border overflow-hidden"
            dir="rtl"
            style={{
              backgroundColor: '#26160F',
              backgroundImage: 'radial-gradient(ellipse at top, rgba(196,130,63,.15), transparent 70%)',
              borderColor: '#8E4E37',
              boxShadow: 'inset 0 1px 0 rgba(255,226,204,.2), 0 24px 48px -12px rgba(10,5,2,.95)',
            }}
          >
            <CornerFlorets color="#C4823F" size={24} />

            <div className="mx-auto mb-3 w-16 h-16 rounded-full overflow-hidden border-2 relative flex items-center justify-center shadow-lg"
                 style={{ borderColor: unlockLegendPrompt.legend.color, backgroundColor: '#3A2016' }}>
              <img
                src={getLegendPortraitImage(unlockLegendPrompt.legend.id)}
                alt={isFA ? unlockLegendPrompt.legend.name.fa : unlockLegendPrompt.legend.name.en}
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] py-0.5 text-center font-bold text-amber-200">
                {unlockLegendPrompt.legend.country.fa}
              </span>
            </div>

            <h3 className="text-base font-black text-[#FFEAD2] mb-1">
              {isFA ? 'بازگشایی فصل‌های اسطوره' : 'Unlock Legend Chapters'}
            </h3>
            <p className="text-xs text-[#D8B99E] mb-4">
              {isFA
                ? `آیا می‌خواهید تمام ۴ فصلِ «${unlockLegendPrompt.legend.name.fa}» را بازگشایی کنید؟`
                : `Unlock all 4 chapters for "${unlockLegendPrompt.legend.name.en}"?`}
            </p>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-4 border"
              style={{
                backgroundColor: 'rgba(58,32,22,.8)',
                borderColor: '#683624',
              }}
            >
              <span className="text-xs font-bold text-[#E6C29E]">
                {isFA ? 'هزینه بازگشایی:' : 'Unlock Cost:'}
              </span>
              <span className="text-sm font-black text-[#FBBF24] tabular-nums">
                {toFaDigits(unlockLegendPrompt.cost)}
              </span>
              <GameCoin size={16} />
            </div>

            {/* Error / Insufficient message */}
            {unlockLegendPrompt.error && (
              <div className="mb-4 text-xs font-bold text-[#F87171] bg-red-950/50 border border-red-800/60 rounded-lg p-2.5">
                {unlockLegendPrompt.error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnlockLegendPrompt(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: 'rgba(58,32,22,.6)',
                  color: '#CDB299',
                  border: '1px solid #552B1C',
                }}
              >
                {isFA ? 'انصراف' : 'Cancel'}
              </button>

              {unlockLegendPrompt.error && onOpenShop ? (
                <button
                  type="button"
                  onClick={() => {
                    setUnlockLegendPrompt(null);
                    onOpenShop();
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #B07F22 0%, #7A5313 100%)',
                    color: '#FFF8E7',
                    border: '1px solid #E5AA38',
                    boxShadow: '0 8px 16px -8px rgba(176,127,34,.7)',
                  }}
                >
                  <Sparkles size={13} />
                  <span>{isFA ? 'خرید سکه' : 'Get Coins'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmUnlock}
                  disabled={unlockLegendPrompt.isUnlocking}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #A85A3C 0%, #753521 100%)',
                    color: '#FFF5EB',
                    border: '1px solid #C4823F',
                    boxShadow: 'inset 0 1px 0 rgba(255,226,204,.4), 0 8px 16px -8px rgba(90,40,20,.8)',
                  }}
                >
                  <Lock size={13} />
                  <span>{unlockLegendPrompt.isUnlocking ? (isFA ? 'در حال بازگشایی...' : 'Unlocking...') : (isFA ? 'بازگشایی دائمی' : 'Unlock Now')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
