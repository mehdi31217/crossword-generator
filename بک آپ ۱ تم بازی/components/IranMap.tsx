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
}

interface MapLocation {
  id: string;
  x: number;
  y: number;
  label: string;
  bookId: string;
}

const LOCATIONS: MapLocation[] = [
  // === Epic locations based on province centroids ===
  { id: 'rostam_7', x: 285, y: 154, label: 'مازندران', bookId: 'rostam_7' },
  { id: 'rostam_akvan', x: 300, y: 161, label: 'مازندران', bookId: 'rostam_akvan' },
  { id: 'zal_simorgh', x: 239, y: 182, label: 'البرز', bookId: 'zal_simorgh' },
  { id: 'arash', x: 285, y: 169, label: 'دماوند', bookId: 'arash' },
  { id: 'rostam_sohrab', x: 487, y: 168, label: 'توران', bookId: 'rostam_sohrab' },
  { id: 'rostam_afrasiab', x: 502, y: 168, label: 'توران', bookId: 'rostam_afrasiab' },
  { id: 'siavoshan', x: 517, y: 168, label: 'توران', bookId: 'siavoshan' },
  { id: 'bizhan', x: 487, y: 183, label: 'توران', bookId: 'bizhan' },
  { id: 'tahmineh', x: 502, y: 183, label: 'سمنگان', bookId: 'tahmineh' },
  { id: 'kaykhosrow', x: 430, y: 119, label: 'توران', bookId: 'kaykhosrow' },
  // Western borders (Babylon, Ctesiphon → Iraq area)
  { id: 'zahhak', x: 112, y: 274, label: 'بابل', bookId: 'zahhak' },
  { id: 'kaveh', x: 99, y: 228, label: 'بابل', bookId: 'kaveh' },
  { id: 'anushirvan', x: 119, y: 282, label: 'تیسفون', bookId: 'anushirvan' },
  // Southeast (Kabul → Afghanistan border)
  { id: 'zal_rudabeh', x: 440, y: 453, label: 'کابل', bookId: 'zal_rudabeh' },
  { id: 'rostam_death', x: 550, y: 489, label: 'کابل', bookId: 'rostam_death' },
  // Sistan
  { id: 'esfandiyar', x: 550, y: 474, label: 'سیستان', bookId: 'esfandiyar' },
  { id: 'rostam_esfandiyar', x: 565, y: 474, label: 'سیستان', bookId: 'rostam_esfandiyar' },
  // Fars (Pasargadae, Persepolis)
  { id: 'hushang', x: 298, y: 398, label: 'پاسارگاد', bookId: 'hushang' },
  { id: 'jamshid', x: 313, y: 398, label: 'تخت جمشید', bookId: 'jamshid' },
  { id: 'kurosh', x: 298, y: 413, label: 'پاسارگاد', bookId: 'kurosh' },
  // Esfahan
  { id: 'haft_peykar', x: 258, y: 297, label: 'اصفهان', bookId: 'haft_peykar' },
  // West Azarbaijan (Armenia)
  { id: 'khosrow_shirin', x: 64, y: 107, label: 'ارمنستان', bookId: 'khosrow_shirin' },
  // Tehran (Modern era)
  { id: 'mosaddegh', x: 266, y: 188, label: 'تهران', bookId: 'mosaddegh' },
  // Historical dynasties - based on their capital locations
  { id: 'medes', x: 174, y: 217, label: 'هگمتانه', bookId: 'medes' },
  { id: 'achaemenids', x: 313, y: 413, label: 'پاسارگاد', bookId: 'achaemenids' },
  { id: 'parthians', x: 119, y: 289, label: 'تیسفون', bookId: 'parthians' },
  { id: 'sassanids', x: 114, y: 236, label: 'تیسفون', bookId: 'sassanids' },
  { id: 'safavids', x: 273, y: 297, label: 'اصفهان', bookId: 'safavids' },
  { id: 'qajars', x: 281, y: 188, label: 'تهران', bookId: 'qajars' },
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
  // زال و سیمرغ → زال و رودابه → هفت‌خان → اکوان دیو → تهمینه → سهراب → افراسیاب → اسفندیار → رستم و اسفندیار → مرگ رستم
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
  // سیاوش → کیخسرو → بیژن و منیژه
  {
    id: 'kaykhosrow',
    color: '#e63946',
    links: [
      { from: 'siavoshan', to: 'kaykhosrow' },
      { from: 'kaykhosrow', to: 'bizhan' },
    ],
  },
  // === ARK 4: روایت‌های ساسانی (Sassanid Tales) ===
  // هفت پیکر → انوشیروان → خسرو و شیرین
  {
    id: 'sassanid_tales',
    color: '#06b6d4',
    links: [
      { from: 'haft_peykar', to: 'anushirvan' },
      { from: 'anushirvan', to: 'khosrow_shirin' },
    ],
  },
  // === ARK 5: تاریخ ایران (Iran History) ===
  // ماد → هخامنشی → اشکانی → ساسانی → صفوی → قاجار
  {
    id: 'iran_history',
    color: '#14b8a6',
    links: [
      { from: 'medes', to: 'achaemenids' },
      { from: 'achaemenids', to: 'parthians' },
      { from: 'parthians', to: 'sassanids' },
      { from: 'sassanids', to: 'safavids' },
      { from: 'safavids', to: 'qajars' },
    ],
  },
  // === ARK 6: آموزش (Education) ===
  // کوروش → مصدق
  {
    id: 'education',
    color: '#10b981',
    links: [
      { from: 'kurosh', to: 'mosaddegh' },
    ],
  },
];

function getLevel(book: StoryBook, player: PlayerState): number {
  return player.epicProgress?.[book.id] || 1;
}

function isCompleted(book: StoryBook, player: PlayerState): boolean {
  return getLevel(book, player) > book.chapters.length;
}

export const IranMap: React.FC<IranMapProps> = ({ books, activeGenre, onSelectBook, player }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

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

  const accent = genreColors[activeGenre] || '#d97706';

  const chainBooks = selectedGroups.length > 0 ? getChain(selectedGroups[0]) : [];
  const chainColor = selectedGroups.length > 0
    ? (STORY_GROUPS.find(g => g.id === selectedGroups[0])?.color || accent)
    : accent;

  const visibleLocations = LOCATIONS.filter(loc =>
    books.find(b => b.id === loc.bookId && b.genre === activeGenre)
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
            {activeGenre === 'epic' ? 'قفسهٔ حماسه' : 'قفسهٔ تاریخ'}
          </span>
          <span className="map-cartouche-title">
            {activeGenre === 'epic' ? 'نقشهٔ حماسه‌های ایران' : 'نقشهٔ تاریخ ایران'}
          </span>
          <span className="map-cartouche-note">روی هر نشانگر بزنید تا خط داستانی‌اش روشن شود</span>
        </div>
        <svg viewBox="0 0 655 594" className="iran-map-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <SeaMistDefs id="iranMist" />
            {/* the poster's plate has softened corners, not a cut rectangle */}
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

            {/* Living water: the same ripple anchors the artwork was painted with */}
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

          {[...visibleLocations]
            .sort((a, b) => {
              if (a.id === selectedId) return 1;
              if (b.id === selectedId) return -1;
              return 0;
            })
            .map(loc => {
            const book = books.find(b => b.id === loc.bookId);
            const isHovered = selectedId === loc.id;
            const done = book ? isCompleted(book, player) : false;
            const inGroup = isInSelectedGroup(loc.id);
            const groupColor = inGroup ? (() => {
              const matchedGroup = STORY_GROUPS.find(g => selectedGroups.includes(g.id));
              return matchedGroup ? matchedGroup.color : null;
            })() : null;

            if (!book) return null;

            const size = isHovered ? 16 : 12;
            // Not-yet-started places are deep-clay pins set in a paper ring,
            // like pins pressed through a printed map — a plain disc vanished
            // against the cream land.
            let fill = '#6E3A29';
            let opacity = 0.95;

            if (done) {
              fill = '#5E6E52';
              opacity = 0.85;
            } else if (inGroup) {
              fill = groupColor || accent;
              opacity = 1;
            } else if (isHovered) {
              fill = accent;
              opacity = 1;
            } else if (getLevel(book, player) > 1) {
              fill = accent;
              opacity = 0.9;
            }

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
                      opacity="0.5"
                    >
                      <animate attributeName="r" from={size + 10} to={size + 18} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={loc.x} cy={loc.y} r={size + 6}
                      fill="none" stroke={groupColor || '#fbbf24'} strokeWidth="1.5"
                      opacity="0.6"
                    />
                  </>
                )}

                {/* Glow ring */}
                {done && (
                  <circle cx={loc.x} cy={loc.y} r={size + 8}
                    fill="#5E6E52" opacity={isHovered ? 0.12 : 0.06}
                    filter="url(#glow)"
                  />
                )}
                {!done && inGroup && (
                  <circle cx={loc.x} cy={loc.y} r={size + 8}
                    fill={groupColor || accent} opacity="0.12"
                    filter="url(#glow)"
                  />
                )}
                {!done && !inGroup && getLevel(book, player) > 1 && (
                  <circle cx={loc.x} cy={loc.y} r={size + 8}
                    fill={accent} opacity={isHovered ? 0.12 : 0.06}
                    filter="url(#glow)"
                  />
                )}

                {/* Pin — a clay disc pressed through a paper ring */}
                <circle className="map-pin-ring" cx={loc.x} cy={loc.y} r={size + 3.6} />
                <circle cx={loc.x} cy={loc.y} r={size}
                  fill={fill} opacity={opacity}
                  stroke="rgba(36,26,20,.28)" strokeWidth={0.7}
                  style={{ transition: 'all 0.2s' }}
                />
                {!isHovered && <circle className="map-pin-dot" cx={loc.x} cy={loc.y} r={2.4} />}

                {/* Pulsating ring on selected */}
                {isHovered && (
                  <circle cx={loc.x} cy={loc.y} r={size + 4}
                    fill="none" stroke={fill} strokeWidth="1.5" opacity="0.5"
                  >
                    <animate attributeName="r" from={size + 4} to={size + 14} dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Play icon inside circle — shown on selected */}
                {isHovered && (
                  <polygon points={`${loc.x - 4},${loc.y - 5} ${loc.x - 4},${loc.y + 5} ${loc.x + 5},${loc.y}`}
                    fill="var(--paper)" opacity="0.92"
                  />
                )}
              </g>
            );
          })}

          {/* Trophies — separate, unsorted loop (stable DOM = working transitions) */}
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

          {/* Selected label — rendered last for highest z-index, centered below circle */}
          {visibleLocations.map(loc => {
            const book = books.find(b => b.id === loc.bookId);
            const isHovered = selectedId === loc.id;
            if (!isHovered || !book) return null;
            return (
              <g key={`label-${loc.id}`}>
                <rect x={loc.x - 58} y={loc.y + 18} width={116} height={18} rx={9}
                  fill="rgba(246,241,231,0.96)" stroke="rgba(36,26,20,0.3)" strokeWidth="0.5"
                />
                <text x={loc.x} y={loc.y + 28}
                  fill="#241A14" fontFamily="serif" fontSize="10"
                  textAnchor="middle" dominantBaseline="middle"
                >
                  {book.title}
                </text>
              </g>
            );
          })}

          {visibleLocations.length === 0 && (
            <text x="327" y="300" textAnchor="middle" fill="#9A8879" fontFamily="serif" fontSize="14">
              هیچ مکانی یافت نشد
            </text>
          )}
        </svg>
      </div>

      {/* Index strip — never empty. It lists the shelf's places as printed chips
          and becomes the story chain, in reading order, once a pin is picked. */}
      <div className="map-index" dir="rtl">
        <span className="map-index-label">
          {chainBooks.length > 0 ? 'خط داستانی' : 'فهرست نقشه'}
        </span>
        <div className="map-index-chips">
          {(chainBooks.length > 0 ? chainBooks : books).map((book, i) => (
            <React.Fragment key={book.id}>
              {chainBooks.length > 0 && i > 0 && (
                <span className="map-index-arrow" style={{ color: chainColor }}>←</span>
              )}
              <button
                className={[
                  'map-chip',
                  book.id === selectedId ? 'on' : '',
                  isCompleted(book, player) ? 'done' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleCircleClick(book, book.id)}
              >
                {book.title}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
