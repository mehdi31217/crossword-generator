import React, { useState } from 'react';
import { StoryBook, PlayerState, StoryGenre } from '../types';
import { IRAN_WAVES } from '../data/mapWaves';
import { SeaWaves, SeaMist, SeaMistDefs } from './MapSeaFx';
import { InkTrophy } from './InkIcons';

interface IranMapProps {
  books: StoryBook[];
  activeGenre: StoryGenre;
  onSelectBook: (book: StoryBook) => void;
  player: PlayerState;
  difficultyFilter?: 'all' | 'easy' | 'medium' | 'hard';
}

interface MapLocation {
  id: string;
  x: number;
  y: number;
  label: string;
  bookId: string;
}

const LOCATIONS: MapLocation[] = [
  // === Epic locations based on province centroids (21 Epic books) ===
  { id: 'rostam_7', x: 285, y: 154, label: 'مازندران', bookId: 'rostam_7' },
  { id: 'rostam_akvan', x: 304, y: 162, label: 'مازندران', bookId: 'rostam_akvan' },
  { id: 'zal_simorgh', x: 239, y: 182, label: 'البرز', bookId: 'zal_simorgh' },
  { id: 'arash', x: 285, y: 172, label: 'دماوند', bookId: 'arash' },
  { id: 'rostam_sohrab', x: 484, y: 164, label: 'مرز توران', bookId: 'rostam_sohrab' },
  { id: 'rostam_afrasiab', x: 506, y: 164, label: 'توران', bookId: 'rostam_afrasiab' },
  { id: 'siavoshan', x: 526, y: 168, label: 'سیاوش‌گرد', bookId: 'siavoshan' },
  { id: 'bizhan', x: 484, y: 186, label: 'توران', bookId: 'bizhan' },
  { id: 'tahmineh', x: 506, y: 186, label: 'سمنگان', bookId: 'tahmineh' },
  { id: 'kaykhosrow', x: 430, y: 119, label: 'توران', bookId: 'kaykhosrow' },
  // Western borders (Babylon, Ctesiphon → Iraq area)
  { id: 'zahhak', x: 112, y: 274, label: 'بابل', bookId: 'zahhak' },
  { id: 'kaveh', x: 198, y: 282, label: 'اصفهان', bookId: 'kaveh' },
  // Southeast (Kabul → Afghanistan border)
  { id: 'zal_rudabeh', x: 440, y: 453, label: 'کابل', bookId: 'zal_rudabeh' },
  { id: 'rostam_death', x: 545, y: 492, label: 'کابل', bookId: 'rostam_death' },
  // Sistan
  { id: 'esfandiyar', x: 542, y: 468, label: 'زابلستان', bookId: 'esfandiyar' },
  { id: 'rostam_esfandiyar', x: 566, y: 472, label: 'سیستان', bookId: 'rostam_esfandiyar' },
  // Fars (Pasargadae, Persepolis)
  { id: 'hushang', x: 294, y: 396, label: 'پارس', bookId: 'hushang' },
  { id: 'jamshid', x: 316, y: 398, label: 'جمشیدگرد', bookId: 'jamshid' },
  // Esfahan / Central
  { id: 'haft_peykar', x: 258, y: 297, label: 'گنبدهای بهرام', bookId: 'haft_peykar' },
  // West Azarbaijan / Kermanshah
  { id: 'khosrow_shirin', x: 136, y: 218, label: 'بیستون و قصرشیرین', bookId: 'khosrow_shirin' },
  // Khorasan (Ferdowsi's Tus - Bijan & Manijeh / Shahnameh)
  { id: 'ferdowsi', x: 472, y: 146, label: 'توس خراسان', bookId: 'ferdowsi' },

  // === Historical locations (All 18 Iran History books) ===
  // 1. Ancient Era (Easy & Medium)
  { id: 'medes', x: 174, y: 217, label: 'هگمتانه (همدان)', bookId: 'medes' },
  { id: 'kurosh', x: 294, y: 392, label: 'پاسارگاد', bookId: 'kurosh' },
  { id: 'dariush', x: 145, y: 242, label: 'بیستون (کرمانشاه)', bookId: 'dariush' },
  { id: 'persepolis', x: 326, y: 416, label: 'تخت جمشید (پارسه)', bookId: 'persepolis' },
  { id: 'achaemenids', x: 165, y: 322, label: 'شوش هخامنشی', bookId: 'achaemenids' },
  { id: 'parthians', x: 386, y: 158, label: 'صددروازه (دامغان)', bookId: 'parthians' },
  { id: 'silk_road', x: 454, y: 188, label: 'نیشابور (جاده ابریشم)', bookId: 'silk_road' },
  { id: 'sassanids', x: 266, y: 438, label: 'فیروزآباد پارس', bookId: 'sassanids' },
  { id: 'anushirvan', x: 116, y: 268, label: 'تیسفون (ایوان مدائن)', bookId: 'anushirvan' },

  // 2. Post-Islamic & Classical Era (Medium & Hard)
  { id: 'yaqub_laith', x: 528, y: 422, label: 'زرنج سیستان', bookId: 'yaqub_laith' },
  { id: 'seljuks', x: 245, y: 256, label: 'ری و اصفهان سلجوقی', bookId: 'seljuks' },
  { id: 'safavids', x: 273, y: 297, label: 'میدان نقش جهان (اصفهان)', bookId: 'safavids' },
  { id: 'nadershah', x: 498, y: 148, label: 'کلات نادری (خراسان)', bookId: 'nadershah' },
  { id: 'zandiyeh', x: 286, y: 432, label: 'ارگ کریم‌خانی (شیراز)', bookId: 'zandiyeh' },

  // 3. Modern Era (Easy, Medium & Hard)
  { id: 'qajars', x: 284, y: 186, label: 'کاخ گلستان (تهران)', bookId: 'qajars' },
  { id: 'amir_kabir', x: 218, y: 234, label: 'هزاوه فراهان و دارالفنون', bookId: 'amir_kabir' },
  { id: 'mashruteh', x: 118, y: 124, label: 'تبریز و بهارستان', bookId: 'mashruteh' },
  { id: 'mosaddegh', x: 254, y: 192, label: 'تهران و آبادان (ملی شدن نفت)', bookId: 'mosaddegh' },
];

// Story groups with their own timeline color
interface StoryGroup {
  id: string;
  color: string;
  links: { from: string; to: string }[];
}

const STORY_GROUPS: StoryGroup[] = [
  // === ARK 1: اساطیر پیشدادی (Pishdadian Myths) ===
  // هوشنگ → جمشید → ضحاک → کاوه → آرش
  {
    id: 'pishdadian',
    color: '#d97706',
    links: [
      { from: 'hushang', to: 'jamshid' },
      { from: 'jamshid', to: 'zahhak' },
      { from: 'zahhak', to: 'kaveh' },
      { from: 'kaveh', to: 'arash' },
    ],
  },
  // === ARK 2: خاندان زال و رستم (House of Zal & Rostam) ===
  {
    id: 'zal_rostam',
    color: '#f59e0b',
    links: [
      { from: 'zal_simorgh', to: 'zal_rudabeh' },
      { from: 'zal_rudabeh', to: 'rostam_7' },
      { from: 'rostam_7', to: 'rostam_akvan' },
      { from: 'rostam_akvan', to: 'tahmineh' },
      { from: 'tahmineh', to: 'rostam_sohrab' },
      { from: 'rostam_sohrab', to: 'rostam_afrasiab' },
      { from: 'rostam_afrasiab', to: 'esfandiyar' },
      { from: 'esfandiyar', to: 'rostam_esfandiyar' },
      { from: 'rostam_esfandiyar', to: 'rostam_death' },
    ],
  },
  // === ARK 3: کیخسرو و توران (Kaykhosrow Cycle) ===
  {
    id: 'kaykhosrow',
    color: '#e63946',
    links: [
      { from: 'siavoshan', to: 'kaykhosrow' },
      { from: 'kaykhosrow', to: 'bizhan' },
    ],
  },
  // === ARK 4: روایت‌های خسروانی و حکیم توس (Sassanid & Ferdowsi Epic Cycle) ===
  {
    id: 'sassanid_tales',
    color: '#06b6d4',
    links: [
      { from: 'haft_peykar', to: 'khosrow_shirin' },
      { from: 'khosrow_shirin', to: 'ferdowsi' },
    ],
  },
  // === ARK 5: تاریخ ایران باستان (Ancient Iran History — 9 Books) ===
  {
    id: 'iran_ancient_history',
    color: '#14b8a6',
    links: [
      { from: 'medes', to: 'kurosh' },
      { from: 'kurosh', to: 'dariush' },
      { from: 'dariush', to: 'persepolis' },
      { from: 'persepolis', to: 'achaemenids' },
      { from: 'achaemenids', to: 'parthians' },
      { from: 'parthians', to: 'silk_road' },
      { from: 'silk_road', to: 'sassanids' },
      { from: 'sassanids', to: 'anushirvan' },
    ],
  },
  // === ARK 6: تاریخ ایران از رستاخیز تا معاصر (Classical to Modern Iran — 9 Books) ===
  {
    id: 'iran_modern_history',
    color: '#0ea5e9',
    links: [
      { from: 'yaqub_laith', to: 'seljuks' },
      { from: 'seljuks', to: 'safavids' },
      { from: 'safavids', to: 'nadershah' },
      { from: 'nadershah', to: 'zandiyeh' },
      { from: 'zandiyeh', to: 'qajars' },
      { from: 'qajars', to: 'amir_kabir' },
      { from: 'amir_kabir', to: 'mashruteh' },
      { from: 'mashruteh', to: 'mosaddegh' },
    ],
  },
];

function getLevel(book: StoryBook, player: PlayerState): number {
  return player.epicProgress?.[book.id] || 1;
}

function isCompleted(book: StoryBook, player: PlayerState): boolean {
  return getLevel(book, player) > book.chapters.length;
}

export const IranMap: React.FC<IranMapProps> = ({ books, activeGenre, onSelectBook, player, difficultyFilter = 'all' }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const diffFilter = difficultyFilter;

  function getGroupsForLocation(locId: string): string[] {
    const groups: string[] = [];
    for (const g of STORY_GROUPS) {
      if (g.links.some(l => l.from === locId || l.to === locId)) groups.push(g.id);
    }
    return groups;
  }

  function isInSelectedGroup(locId: string): boolean {
    if (selectedGroups.length === 0) return false;
    const locGroups = getGroupsForLocation(locId);
    return locGroups.some(g => selectedGroups.includes(g));
  }

  function handleCircleClick(book: StoryBook, locId: string) {
    if (selectedId === locId) {
      onSelectBook(book);
    } else {
      setSelectedId(locId);
      setSelectedGroups(getGroupsForLocation(locId));
    }
  }

  function handleBackdropClick() {
    setSelectedId(null);
    setSelectedGroups([]);
  }

  function getChain(groupId: string): StoryBook[] {
    const group = STORY_GROUPS.find(g => g.id === groupId);
    if (!group || group.links.length === 0) return [];

    const outgoing = new Map<string, string>();
    const incoming = new Map<string, string>();
    for (const link of group.links) {
      outgoing.set(link.from, link.to);
      incoming.set(link.to, link.from);
    }

    let start = group.links[0].from;
    while (incoming.has(start)) start = incoming.get(start)!;

    const ids: string[] = [start];
    while (outgoing.has(start)) {
      start = outgoing.get(start)!;
      ids.push(start);
    }

    return ids.map(id => books.find(b => b.id === id)).filter(Boolean) as StoryBook[];
  }

  const genreColors: Record<StoryGenre, string> = {
    epic: '#d97706',
    folklore: '#db2777',
    education: '#0ea5e9',
    history: '#14b8a6',
  };

  const DIFF_STYLE: Record<'easy' | 'medium' | 'hard', {
    fill: string;
    ring: string;
    bg: string;
    text: string;
    label: string;
    short: string;
    dot: string;
  }> = {
    easy: {
      fill: '#16A34A',
      ring: '#86EFAC',
      bg: '#DCFCE7',
      text: '#14532D',
      label: 'آسان',
      short: 'آسان',
      dot: '#16A34A',
    },
    medium: {
      fill: '#D97706',
      ring: '#FDE68A',
      bg: '#FEF3C7',
      text: '#78350F',
      label: 'متوسط',
      short: 'متوسط',
      dot: '#D97706',
    },
    hard: {
      fill: '#DC2626',
      ring: '#FECACA',
      bg: '#FEE2E2',
      text: '#7F1D1D',
      label: 'سخت',
      short: 'سخت',
      dot: '#DC2626',
    },
  };

  const accent = genreColors[activeGenre] || '#d97706';

  const chainBooks = selectedGroups.length > 0 ? getChain(selectedGroups[0]) : [];
  const chainColor = selectedGroups.length > 0
    ? (STORY_GROUPS.find(g => g.id === selectedGroups[0])?.color || accent)
    : accent;

  const allGenreLocations = LOCATIONS.filter(loc =>
    books.find(b => b.id === loc.bookId && b.genre === activeGenre)
  );

  const visibleLocations = allGenreLocations.filter(loc => {
    if (diffFilter === 'all') return true;
    const b = books.find(bk => bk.id === loc.bookId);
    return b?.difficulty === diffFilter;
  });

  // Compute decluttered persistent labels so non-overlapping pins show their name + difficulty right on the map
  const declutteredLabelIds = new Set<string>();
  const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];
  const prioritizedLocs = [...visibleLocations].sort((a, b) => {
    if (a.id === selectedId) return -1;
    if (b.id === selectedId) return 1;
    return 0;
  });
  for (const loc of prioritizedLocs) {
    const book = books.find(b => b.id === loc.bookId);
    if (!book) continue;
    const w = Math.max(78, book.title.length * 5.2 + 34);
    const h = 16;
    const box = { x: loc.x - w / 2, y: loc.y + 13, w, h };
    const overlaps = placedBoxes.some(
      p =>
        Math.abs((p.x + p.w / 2) - (box.x + box.w / 2)) < (p.w + box.w) / 2 + 4 &&
        Math.abs((p.y + p.h / 2) - (box.y + box.h / 2)) < (p.h + box.h) / 2 + 3
    );
    if (!overlaps || loc.id === selectedId) {
      declutteredLabelIds.add(loc.id);
      placedBoxes.push(box);
    }
  }

  const selectedBook = selectedId ? books.find(b => b.id === selectedId) || null : null;
  const selectedLoc = selectedId ? allGenreLocations.find(l => l.id === selectedId) || null : null;
  const activeGroupObj = selectedGroups.length > 0
    ? STORY_GROUPS.find(g => g.id === selectedGroups[0]) || null
    : null;

  const toFa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const easyCount = books.filter(b => b.difficulty === 'easy').length;
  const medCount = books.filter(b => b.difficulty === 'medium').length;
  const hardCount = books.filter(b => b.difficulty === 'hard').length;

  const stripSourceBooks = (chainBooks.length > 0 ? chainBooks : books).filter(b =>
    diffFilter === 'all' ? true : b.difficulty === diffFilter
  );

  return (
    <div
      className="iran-map relative w-full h-full flex flex-col"
      style={{ color: 'var(--ink)' }}
    >
      <div className="iran-map-stage">
        <div className="iran-map-frame" aria-hidden="true" />
        <div className="map-cartouche" dir="rtl">
          <span className="map-cartouche-kicker">
            {activeGenre === 'epic' ? `قفسهٔ حماسه · ${toFa(books.length)} کتاب` : `قفسهٔ تاریخ · ${toFa(books.length)} کتاب`}
          </span>
          <span className="map-cartouche-title">
            {activeGenre === 'epic' ? 'نقشهٔ حماسه‌های ایران' : 'نقشهٔ تاریخ ایران'}
          </span>
          <span className="map-cartouche-note">رنگ هر نشانگر درجهٔ سختی داستان را نشان می‌دهد</span>
        </div>

        {/* Selected book quick-launch card */}
        {selectedBook && (
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-3 z-20 flex items-center gap-2.5 p-2 rounded-2xl shadow-xl border border-[#8E4E37]/60 max-w-[295px] sm:max-w-[340px] animate-in fade-in duration-150"
            style={{
              background: 'rgba(248, 241, 229, 0.97)',
              boxShadow: '0 10px 24px -10px rgba(36, 26, 20, 0.65)',
            }}
          >
            <img
              src={selectedBook.coverImage}
              alt={selectedBook.title}
              className="w-12 h-14 rounded-xl object-cover border border-[#8E4E37]/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-[#241A14] truncate">{selectedBook.title}</span>
                {(() => {
                  const ds = DIFF_STYLE[selectedBook.difficulty] || DIFF_STYLE.medium;
                  return (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-black inline-flex items-center gap-1"
                      style={{ background: ds.bg, color: ds.text, border: `1px solid ${ds.fill}` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ds.fill }} />
                      {ds.label} · {toFa(selectedBook.chapters.length)} فصل
                    </span>
                  );
                })()}
              </div>
              {selectedLoc && (
                <p className="text-[10px] font-bold text-[#6E3A29] truncate mt-0.5">
                  📍 {selectedLoc.label}
                </p>
              )}
              <button
                type="button"
                onClick={() => onSelectBook(selectedBook)}
                className="mt-1.5 w-full py-1 px-2.5 rounded-lg text-[10.5px] font-black text-[#FFF9EE] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)',
                }}
              >
                <span>ورود به داستان</span>
                <span>←</span>
              </button>
            </div>
          </div>
        )}

        <svg viewBox="0 0 655 594" className="iran-map-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <SeaMistDefs id="iranMist" />
            <clipPath id="iranPlate">
              <rect x="0" y="0" width="655" height="594" rx="20" />
            </clipPath>
          </defs>

          <g clipPath="url(#iranPlate)">
            <image
              href="/images/map-iran-clay.webp"
              width="655" height="594"
              className="iran-map-land"
            />
            <SeaWaves anchors={IRAN_WAVES} />
            <SeaMist gradId="iranMist" w={655} h={594} />
          </g>
          <rect x="0.5" y="0.5" width="654" height="593" rx="20" fill="none"
            stroke="rgba(36,26,20,.30)" strokeWidth="1" pointerEvents="none" />

          {/* Backdrop tap to deselect */}
          <rect x="0" y="0" width="655" height="594" fill="transparent"
            onClick={handleBackdropClick}
            style={{ pointerEvents: selectedId ? 'auto' : 'none' }}
          />

          {/* Story chain route lines when a pin/group is selected */}
          {activeGroupObj && activeGroupObj.links.map((link, idx) => {
            const fromLoc = allGenreLocations.find(l => l.id === link.from);
            const toLoc = allGenreLocations.find(l => l.id === link.to);
            if (!fromLoc || !toLoc) return null;
            return (
              <line
                key={`route-${idx}`}
                x1={fromLoc.x}
                y1={fromLoc.y}
                x2={toLoc.x}
                y2={toLoc.y}
                stroke={activeGroupObj.color}
                strokeWidth="2.4"
                strokeDasharray="5 4"
                opacity="0.78"
                pointerEvents="none"
              />
            );
          })}

          {[...visibleLocations]
            .sort((a, b) => {
              if (a.id === selectedId) return 1;
              if (b.id === selectedId) return -1;
              return 0;
            })
            .map(loc => {
            const book = books.find(b => b.id === loc.bookId);
            if (!book) return null;
            const isHovered = selectedId === loc.id;
            const done = isCompleted(book, player);
            const inGroup = isInSelectedGroup(loc.id);
            const groupColor = inGroup ? (() => {
              const matchedGroup = STORY_GROUPS.find(g => selectedGroups.includes(g.id));
              return matchedGroup ? matchedGroup.color : null;
            })() : null;

            const ds = DIFF_STYLE[book.difficulty] || DIFF_STYLE.medium;
            const size = isHovered ? 16 : 12.5;
            // Pin fill directly shows difficulty (Green=Easy, Amber=Medium, Crimson=Hard)
            const fill = done ? '#15803D' : ds.fill;
            const opacity = 0.96;

            return (
              <g key={loc.id}
                onClick={(e) => { e.stopPropagation(); handleCircleClick(book, loc.id); }}
                style={{ cursor: 'pointer' }}
              >
                {/* Group highlight ring */}
                {inGroup && !isHovered && (
                  <>
                    <circle cx={loc.x} cy={loc.y} r={size + 10}
                      fill="none" stroke={groupColor || '#fbbf24'} strokeWidth="2"
                      opacity="0.55"
                    >
                      <animate attributeName="r" from={size + 10} to={size + 18} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.55" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={loc.x} cy={loc.y} r={size + 6}
                      fill="none" stroke={groupColor || '#fbbf24'} strokeWidth="1.5"
                      opacity="0.65"
                    />
                  </>
                )}

                {/* Difficulty halo + paper ring */}
                <circle className="map-pin-ring" cx={loc.x} cy={loc.y} r={size + 3.8} />
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={size}
                  fill={fill}
                  opacity={opacity}
                  stroke="#FFFDF9"
                  strokeWidth={isHovered ? 2.2 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />

                {/* Difficulty micro-indicator inside pin when not selected */}
                {!isHovered && (
                  <text
                    x={loc.x}
                    y={loc.y + 0.5}
                    fill="#FFFDF9"
                    fontSize="7.5"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                  >
                    {book.difficulty === 'easy' ? 'آ' : book.difficulty === 'hard' ? 'س' : 'م'}
                  </text>
                )}

                {/* Pulsating ring on selected */}
                {isHovered && (
                  <circle cx={loc.x} cy={loc.y} r={size + 4}
                    fill="none" stroke={fill} strokeWidth="2" opacity="0.65"
                  >
                    <animate attributeName="r" from={size + 4} to={size + 15} dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.65" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Play icon inside circle — shown on selected */}
                {isHovered && (
                  <polygon points={`${loc.x - 4},${loc.y - 5} ${loc.x - 4},${loc.y + 5} ${loc.x + 5},${loc.y}`}
                    fill="var(--paper)" opacity="0.95"
                  />
                )}
              </g>
            );
          })}

          {/* Trophies — separate, unsorted loop */}
          {visibleLocations.map(loc => {
            const book = books.find(b => b.id === loc.bookId);
            const done = book && isCompleted(book, player);
            const isHovered = selectedId === loc.id;
            if (!done) return null;
            return (
              <foreignObject key={`trophy-${loc.id}`}
                x={loc.x - 8} y={loc.y - 30} width={16} height={40}
                style={{ overflow: 'visible', pointerEvents: 'none' }}
              >
                <div style={{
                  width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `translateY(${isHovered ? 0 : 22}px)`,
                  transition: 'transform 0.5s ease-in-out',
                  pointerEvents: 'none',
                }}>
                  <InkTrophy size={12} style={{ color: 'var(--paper)' }} />
                </div>
              </foreignObject>
            );
          })}

          {/* Persistent decluttered labels + Selected label with difficulty pill */}
          {visibleLocations.map(loc => {
            const book = books.find(b => b.id === loc.bookId);
            if (!book) return null;
            const isHovered = selectedId === loc.id;
            if (!isHovered && !declutteredLabelIds.has(loc.id)) return null;

            const ds = DIFF_STYLE[book.difficulty] || DIFF_STYLE.medium;
            const labelStr = `${book.title} · ${ds.label}`;
            const boxW = Math.max(82, labelStr.length * 4.7 + 16);
            const boxH = isHovered ? 20 : 16;
            const boxY = loc.y + (isHovered ? 18 : 14);

            return (
              <g
                key={`label-${loc.id}`}
                onClick={(e) => { e.stopPropagation(); handleCircleClick(book, loc.id); }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={loc.x - boxW / 2}
                  y={boxY}
                  width={boxW}
                  height={boxH}
                  rx={boxH / 2}
                  fill={isHovered ? '#FFFDF9' : 'rgba(248, 242, 232, 0.93)'}
                  stroke={ds.fill}
                  strokeWidth={isHovered ? 1.5 : 0.9}
                />
                <circle
                  cx={loc.x + boxW / 2 - 7}
                  cy={boxY + boxH / 2}
                  r={3}
                  fill={ds.fill}
                />
                <text
                  x={loc.x - 3}
                  y={boxY + boxH / 2 + 0.5}
                  fill="#241A14"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fontSize={isHovered ? '9.5' : '8.2'}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {labelStr}
                </text>
              </g>
            );
          })}

          {visibleLocations.length === 0 && (
            <text x="327" y="300" textAnchor="middle" fill="#9A8879" fontFamily="serif" fontSize="14">
              هیچ مکانی با این فیلتر یافت نشد
            </text>
          )}
        </svg>
      </div>

      {/* Index strip — lists the shelf's places with clear difficulty dots & badges */}
      <div className="map-index" dir="rtl">
        <span className="map-index-label">
          {chainBooks.length > 0 ? 'خط داستانی' : `فهرست نقشه (${toFa(stripSourceBooks.length)})`}
        </span>
        <div className="map-index-chips">
          {chainBooks.length > 0 && (
            <button
              type="button"
              className="map-chip"
              onClick={() => {
                handleBackdropClick();
              }}
              style={{ background: '#E8D8C0', fontWeight: 900 }}
            >
              همهٔ کتاب‌ها ({toFa(books.length)})
            </button>
          )}
          {stripSourceBooks.map((book, i) => {
            const ds = DIFF_STYLE[book.difficulty] || DIFF_STYLE.medium;
            return (
              <React.Fragment key={book.id}>
                {chainBooks.length > 0 && i > 0 && (
                  <span className="map-index-arrow" style={{ color: chainColor }}>←</span>
                )}
                <button
                  className={[
                    'map-chip flex items-center gap-1.5',
                    book.id === selectedId ? 'on' : '',
                    isCompleted(book, player) ? 'done' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    borderColor: book.id === selectedId ? ds.fill : undefined,
                  }}
                  onClick={() => handleCircleClick(book, book.id)}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: ds.fill }}
                  />
                  <span>{book.title}</span>
                  <span
                    className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black"
                    style={{ background: ds.bg, color: ds.text }}
                  >
                    {ds.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
