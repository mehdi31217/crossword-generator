import React, { useEffect, useState, useMemo } from 'react';
import {
  Lock,
  Sparkles,
  Plus,
  RefreshCw,
  Sliders,
  RotateCcw,
  Check,
  Copy,
  X,
} from 'lucide-react';
import {
  Category,
  GameView,
  GridSize,
  Language,
  LoadingStage,
  PlayerState,
} from '../types';
import {
  DAILY_PUZZLE_REWARD,
  SIZE_UNLOCK_COSTS,
  CATEGORY_UNLOCK_COSTS,
} from '../utils/economy';
import {
  xpInfo,
  ProgressSnapshot,
  QuestView,
} from '../utils/progression';
import { gameServer } from '../utils/gameServer';
import { FortuneWheelModal } from './FortuneWheelModal';
import { BattlePassModal } from './BattlePassModal';
import { ScrollRevealCeremony } from './ScrollRevealCeremony';
import GameCoin from './GameCoin';
import { AvatarRenderer } from './AvatarRenderer';
import { getAvatarItem } from '../data/avatars';
import {
  InkTome,
  InkTower,
  InkSwords,
  InkCalendar,
  InkFlame,
  InkGift,
  CornerFlorets,
} from './InkIcons';

export interface MainMenuProps {
  player: PlayerState | null;
  language: Language;
  size: GridSize;
  category: Category;
  loadingStage: LoadingStage;
  setSize: (s: GridSize) => void;
  setLanguage: (l: Language) => void;
  setCategory: (c: Category) => void;
  onShowAuth: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onStartDailyChallenge: () => void;
  onStartQuickPlay: () => void;
  onNavigate: (view: GameView) => void;
  pendingChallenges?: number;
  onCoinsChange?: (coins: number) => void;
}

const SIZE_COSTS: Record<GridSize, number> = SIZE_UNLOCK_COSTS as Record<GridSize, number>;

const CATEGORY_COSTS: Record<Category, number> = CATEGORY_UNLOCK_COSTS as Record<Category, number>;

const CATEGORY_META: Record<
  Category,
  {
    fa: string;
    en: string;
    isHero?: boolean;
  }
> = {
  shahnameh: { fa: 'شاهنامه', en: 'Shahnameh', isHero: true },
  general: { fa: 'عمومی', en: 'General' },
  history: { fa: 'تاریخ', en: 'History' },
  nature: { fa: 'طبیعت', en: 'Nature' },
  food: { fa: 'غذاها', en: 'Food' },
  movies: { fa: 'سینما', en: 'Movies' },
  cities: { fa: 'شهرها', en: 'Cities' },
  knowledge: { fa: 'دانستنی', en: 'Trivia' },
  body: { fa: 'بدن انسان', en: 'Anatomy' },
  jobs: { fa: 'مشاغل', en: 'Jobs' },
  tech: { fa: 'فناوری', en: 'Tech' },
  sports: { fa: 'ورزشی', en: 'Sports' },
  art: { fa: 'هنر', en: 'Art' },
  all: { fa: 'همه موضوعات', en: 'All Topics' },
};

const ALL_CATEGORIES: Category[] = [
  'shahnameh',
  'general',
  'history',
  'nature',
  'food',
  'movies',
  'cities',
  'knowledge',
  'body',
  'jobs',
  'tech',
  'sports',
  'art',
  'all',
];

const SIZES: GridSize[] = [5, 6, 7, 8, 9, 10];

// Hand-inked Sepia & Ochre SVG icons tailored to each of the 14 categories,
// rendered on top of the authentic 3D terracotta-ring + cream-paper medallion (`h-medallion-clean.webp`)
const CategoryInkGlyph: React.FC<{
  category: Category;
  size?: number;
  stroke?: string;
  fill?: string;
}> = ({
  category,
  size = 24,
  stroke = '#2A1A10',
  fill = 'rgba(202, 150, 58, 0.32)',
}) => {
  switch (category) {
    case 'shahnameh':
      // Persian Royal Crown & Twin Plumes
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 17L5.5 9L9.5 13L12 7L14.5 13L18.5 9L20 17H4Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M3.5 19.5H20.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'general':
      // 4-Point Star Compass
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={stroke} strokeWidth="1.6" />
          <path
            d="M12 5L14 10L19 12L14 14L12 19L10 14L5 12L10 10L12 5Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'history':
      // Ancient Amphora / Historical Vessel
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5H15M10 5V8C8 9.5 7 12 7.5 15C8 17.5 9.5 19 12 19C14.5 19 16 17.5 16.5 15C17 12 16 9.5 14 8V5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M8.5 19.5H15.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'nature':
      // Botanical Sprout & Twin Leaves
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 20V8" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          <path
            d="M12 14C8 14 5.5 11 5.5 7.5C9 7.5 12 10 12 14Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 12C16 12 18.5 9 18.5 5.5C15 5.5 12 8 12 12Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'food':
      // Steaming Traditional Persian Bowl
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4.5 12H19.5C19.5 16.2 16.2 19 12 19C7.8 19 4.5 16.2 4.5 12Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M9 6.5C9 8 10 8.5 10 10M14.5 6C14.5 7.5 15.5 8 15.5 9.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'movies':
      // Cinema Clapperboard
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="9" width="16" height="10" rx="2" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M4 9L6 5H19L17 9H4Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 5L7.5 9M14 5L12.5 9" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'cities':
      // Persian Dome & Minaret Arch
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M6 19V13C6 9.5 8.8 6.8 12 5C15.2 6.8 18 9.5 18 13V19H6Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10 19V14.5C10 13.4 10.9 12.5 12 12.5C13.1 12.5 14 13.4 14 14.5V19" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'knowledge':
      // Open Scholarly Tome
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 7C9.5 5.8 6.5 5.8 4 6.8V18C6.5 17 9.5 17 12 18.2C14.5 17 17.5 17 20 18V6.8C17.5 5.8 14.5 5.8 12 7Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 7V18" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'body':
      // Anatomical Heart & Pulse
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 19.5C12 19.5 5 14.8 5 9.8C5 7.4 6.8 5.8 9 5.8C10.4 5.8 11.5 6.5 12 7.5C12.5 6.5 13.6 5.8 15 5.8C17.2 5.8 19 7.4 19 9.8C19 14.8 12 19.5 12 19.5Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'jobs':
      // Craftsman Briefcase / Guild Emblem
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="8" width="16" height="11" rx="2" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M9 8V6C9 5.4 9.4 5 10 5H14C14.6 5 15 5.4 15 6V8" stroke={stroke} strokeWidth="1.6" />
          <path d="M4 13H20" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'tech':
      // Microchip / Circuit Node
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="7" y="7" width="10" height="10" rx="2" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M9.5 4V7M14.5 4V7M9.5 17V20M14.5 17V20M4 9.5H7M4 14.5H7M17 9.5H20M17 14.5H20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'sports':
      // Championship Trophy
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M7 5H17V10C17 12.8 14.8 15 12 15C9.2 15 7 12.8 7 10V5Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path d="M12 15V19M8.5 19H15.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'art':
      // Persian Oud / Lute
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M14.5 9.5L19 5" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <ellipse
            cx="10"
            cy="14"
            rx="5.5"
            ry="4.2"
            transform="rotate(-45 10 14)"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.6"
          />
        </svg>
      );
    case 'all':
    default:
      // 4-Cell Crossword Grid Emblem
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="14" height="14" rx="2.5" fill={fill} stroke={stroke} strokeWidth="1.6" />
          <path d="M12 5V19M5 12H19" stroke={stroke} strokeWidth="1.6" />
        </svg>
      );
  }
};

export const MainMenu: React.FC<MainMenuProps> = ({
  player,
  language,
  size,
  category,
  loadingStage,
  setSize,
  setLanguage,
  setCategory,
  onOpenShop,
  onOpenProfile,
  onStartDailyChallenge,
  onStartQuickPlay,
  onNavigate,
  pendingChallenges = 0,
  onCoinsChange,
}) => {
  const isFa = language === 'fa';
  const fmt = (n: number | string) =>
    isFa
      ? String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
      : String(n);

  const [showTodaySheet, setShowTodaySheet] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [showBattlePassModal, setShowBattlePassModal] = useState(false);
  const [showScrollCeremonyLab, setShowScrollCeremonyLab] = useState(false);
  const [isPlayBarPressed, setIsPlayBarPressed] = useState(false);
  const [isBuilderPlayPressed, setIsBuilderPlayPressed] = useState(false);
  const [pressedNavId, setPressedNavId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [unlockedCategories, setUnlockedCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('unlocked_categories');
      return saved ? JSON.parse(saved) : ['all', 'general', 'food', 'shahnameh'];
    } catch {
      return ['all', 'general', 'food', 'shahnameh'];
    }
  });
  const [unlockedSizes, setUnlockedSizes] = useState<GridSize[]>(() => {
    try {
      const saved = localStorage.getItem('unlocked_sizes');
      return saved ? JSON.parse(saved) : [5, 6];
    } catch {
      return [5, 6];
    }
  });
  const [unlockPrompt, setUnlockPrompt] = useState<{
    type: 'category' | 'size';
    value: Category | GridSize;
    cost: number;
    label: string;
  } | null>(null);

  // Profile Avatar Box fine-tuning configuration (auto-saved to localStorage)
  const defaultAvatarConfig = {
    leftPct: 81.54,
    topPct: 1.22,
    widthPct: 11.10,
    heightPct: 7.65,
    imgScale: 135,
    imgOffsetX: 0,
    imgOffsetY: 0,
    objectFit: 'cover' as 'cover' | 'fill' | 'contain',
    withClayBacking: true,
  };
  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('avatar_box_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const left = Math.min(92, Math.max(70, Number(parsed.leftPct) || 81.54));
        const top = Math.min(12, Math.max(-2, Number(parsed.topPct) || 1.22));
        const width = Math.min(22, Math.max(6, Number(parsed.widthPct) || 11.10));
        const height = Math.min(18, Math.max(4, Number(parsed.heightPct) || 7.65));
        const scale = parsed.imgScale === 100 ? 135 : (parsed.imgScale || 135);
        return {
          ...defaultAvatarConfig,
          ...parsed,
          leftPct: left,
          topPct: top,
          widthPct: width,
          heightPct: height,
          imgScale: scale,
          objectFit: parsed.objectFit || 'cover',
          withClayBacking: parsed.withClayBacking ?? true,
        };
      }
    } catch {}
    return defaultAvatarConfig;
  });
  const [showAvatarTuner, setShowAvatarTuner] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const updateAvatarConfig = (partial: Partial<typeof defaultAvatarConfig>) => {
    setAvatarConfig((prev: typeof defaultAvatarConfig) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem('avatar_box_config', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetAvatarConfig = () => {
    setAvatarConfig(defaultAvatarConfig);
    try {
      localStorage.removeItem('avatar_box_config');
    } catch {}
  };

  useEffect(() => {
    let active = true;
    gameServer
      .getProgress()
      .then((snap) => {
        if (active && snap) {
          setProgress(snap);
          if (snap.economy?.unlockedCategories?.length) {
            setUnlockedCategories((prev) =>
              Array.from(new Set([...prev, ...(snap.economy!.unlockedCategories as Category[])]))
            );
          }
          if (snap.economy?.unlockedSizes?.length) {
            setUnlockedSizes((prev) =>
              Array.from(new Set([...prev, ...(snap.economy!.unlockedSizes as GridSize[])]))
            );
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [player?.id, player?.score, player?.coins]);

  const xp = progress?.xp ?? xpInfo((player?.score || 0) / 2);
  const [isRefreshingQuests, setIsRefreshingQuests] = useState(false);
  const [questRefreshMessage, setQuestRefreshMessage] = useState<string | null>(null);

  // Today's ISO date string (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  // Check if today's quest has already been rerolled (either from server progress or local storage)
  const [localRerollDate, setLocalRerollDate] = useState<string>(() => {
    try {
      return localStorage.getItem('quest_reroll_date') || '';
    } catch {
      return '';
    }
  });

  const isQuestRerolledToday = useMemo(() => {
    if (progress?.quests?.rerolled && progress?.quests?.date === todayStr) {
      return true;
    }
    return localRerollDate === todayStr;
  }, [progress?.quests?.rerolled, progress?.quests?.date, todayStr, localRerollDate]);

  const [questRefreshTick, setQuestRefreshTick] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('quest_refresh_tick') || 0);
    } catch {
      return 0;
    }
  });
  const [localClaimedQuests, setLocalClaimedQuests] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('local_claimed_quests');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const dailyDone = progress?.streak?.playedToday ?? false;
  const dailyReward = progress?.streak?.nextReward ?? DAILY_PUZZLE_REWARD;
  const streakDays = progress?.streak?.current ?? 0;

  const towerFloor = Math.max(1, player?.towerHighFloor || 1);
  const epicStageCount = Object.values(player?.epicProgress || {}).reduce(
    (acc, val) => acc + Math.max(0, (Number(val) || 1) - 1),
    0
  );
  const trophies = player?.league?.trophies ?? 1200;
  const isGenerating = loadingStage !== 'idle';

  // Fallback quests for guest/offline mode so the Daily Quests tile is always rich and active
  const fallbackQuestPool: QuestView[] = [
    {
      id: 'daily',
      type: 'daily',
      target: 1,
      progress: dailyDone ? 1 : 0,
      claimed: !!localClaimedQuests['daily'],
      reward: 40,
      labelFa: 'معمای روزانه را کامل کن',
      labelEn: 'Finish the daily puzzle',
    },
    {
      id: 'solo3',
      type: 'solo3',
      target: 3,
      progress: Math.min(3, player?.history?.length || 0),
      claimed: !!localClaimedQuests['solo3'],
      reward: 30,
      labelFa: 'سه جدول کامل کن',
      labelEn: 'Complete three grids',
    },
    {
      id: 'tower',
      type: 'tower',
      target: 1,
      progress: towerFloor >= 3 ? 1 : 0,
      claimed: !!localClaimedQuests['tower'],
      reward: 35,
      labelFa: 'در برج به طبقه ۳ برس',
      labelEn: 'Reach tower floor 3',
    },
    {
      id: 'grid7',
      type: 'grid7',
      target: 1,
      progress: (player?.history || []).some((h) => (h.size || 0) >= 7) ? 1 : 0,
      claimed: !!localClaimedQuests['grid7'],
      reward: 30,
      labelFa: 'یک جدول ۷×۷ یا بزرگ‌تر بزن',
      labelEn: 'Finish a 7×7 or bigger grid',
    },
    {
      id: 'duel',
      type: 'duel',
      target: 1,
      progress: 0,
      claimed: !!localClaimedQuests['duel'],
      reward: 40,
      labelFa: 'یک چالش دوئل را بازی کن',
      labelEn: 'Play a duel challenge',
    },
    {
      id: 'online',
      type: 'online',
      target: 1,
      progress: (player?.league?.totalWins || 0) > 0 ? 1 : 0,
      claimed: !!localClaimedQuests['online'],
      reward: 50,
      labelFa: 'یک نبرد آنلاین را ببر',
      labelEn: 'Win an online battle',
    },
  ];

  const serverQuests: QuestView[] = progress?.quests?.items || [];
  const quests: QuestView[] =
    serverQuests.length > 0
      ? serverQuests
      : [0, 1, 2].map(
          (i) => fallbackQuestPool[(i + questRefreshTick * 2) % fallbackQuestPool.length]
        );

  const unclaimedCount = quests.filter(
    (q) => q.progress >= q.target && !q.claimed
  ).length;

  const handleSelectSize = (s: GridSize) => {
    if (unlockedSizes.includes(s) || SIZE_COSTS[s] === 0) {
      setSize(s);
    } else {
      setUnlockPrompt({
        type: 'size',
        value: s,
        cost: SIZE_COSTS[s],
        label: isFa ? `سایز ${fmt(s)}×${fmt(s)}` : `Size ${s}×${s}`,
      });
    }
  };

  const handleSelectCategory = (c: Category) => {
    if (unlockedCategories.includes(c) || CATEGORY_COSTS[c] === 0) {
      setCategory(c);
    } else {
      setUnlockPrompt({
        type: 'category',
        value: c,
        cost: CATEGORY_COSTS[c],
        label: isFa ? CATEGORY_META[c].fa : CATEGORY_META[c].en,
      });
    }
  };

  const confirmUnlock = async () => {
    if (!unlockPrompt || !player) return;
    if (player.coins < unlockPrompt.cost) {
      setUnlockPrompt(null);
      onOpenShop();
      return;
    }
    const targetPrompt = unlockPrompt;
    setUnlockPrompt(null);
    try {
      const res = await gameServer.unlockContent(
        player,
        targetPrompt.type,
        String(targetPrompt.value)
      );
      if (typeof res.coins === 'number') {
        onCoinsChange?.(res.coins);
      } else {
        onCoinsChange?.(player.coins - targetPrompt.cost);
      }
    } catch {
      const nextCoins = player.coins - targetPrompt.cost;
      onCoinsChange?.(nextCoins);
    }

    if (targetPrompt.type === 'category') {
      const cat = targetPrompt.value as Category;
      const next = Array.from(new Set([...unlockedCategories, cat]));
      setUnlockedCategories(next);
      try {
        localStorage.setItem('unlocked_categories', JSON.stringify(next));
      } catch {}
      setCategory(cat);
    } else {
      const sz = targetPrompt.value as GridSize;
      const next = Array.from(new Set([...unlockedSizes, sz]));
      setUnlockedSizes(next);
      try {
        localStorage.setItem('unlocked_sizes', JSON.stringify(next));
      } catch {}
      setSize(sz);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      const res = await gameServer.claimQuest(questId);
      if (res && res.ok) {
        if (typeof res.coins === 'number') {
          onCoinsChange?.(res.coins);
        }
        const snap = await gameServer.getProgress();
        if (snap) setProgress(snap);
        return;
      }
    } catch {}
    // Fallback claim for guest/offline quests
    const found = quests.find((q) => q.id === questId);
    if (found && found.progress >= found.target && !found.claimed) {
      const nextMap = { ...localClaimedQuests, [questId]: true };
      setLocalClaimedQuests(nextMap);
      try {
        localStorage.setItem('local_claimed_quests', JSON.stringify(nextMap));
      } catch {}
      if (player) {
        onCoinsChange?.((player.coins || 0) + found.reward);
      }
    }
  };

  const handleRefreshQuests = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isRefreshingQuests) return;

    // Guard: only 1 reroll allowed per day
    if (isQuestRerolledToday) {
      setQuestRefreshMessage(
        isFa
          ? 'فرصت تعویض امروزت تمام شده! فردا دوباره سر بزن.'
          : 'Daily reroll already used! Come back tomorrow.'
      );
      return;
    }

    setIsRefreshingQuests(true);
    setQuestRefreshMessage(null);

    try {
      const rerollRes = await gameServer.rerollQuests();
      if (rerollRes?.ok && rerollRes.quests) {
        setProgress((prev) =>
          prev ? { ...prev, quests: rerollRes.quests! } : prev
        );
      } else {
        const snap = await gameServer.getProgress();
        if (snap) setProgress(snap);
      }
    } catch {}

    // Mark today as rerolled locally
    setLocalRerollDate(todayStr);
    try {
      localStorage.setItem('quest_reroll_date', todayStr);
    } catch {}

    setQuestRefreshTick((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('quest_refresh_tick', String(next));
      } catch {}
      return next;
    });

    setQuestRefreshMessage(
      isFa
        ? 'ماموریت‌ها با موفقیت تغییر کردند. برای تعویض بعدی فردا بیا!'
        : 'Quests refreshed! Next refresh available tomorrow.'
    );

    setTimeout(() => {
      setIsRefreshingQuests(false);
    }, 450);
  };

  // The 5 real circular 3D clay bottom buttons baked into `h-tablet-only.webp` (856x1367):
  // Centers in chassisBuf: cx_work = [204.5, 356, 510, 664, 817] (cx_crop = cx_work - 84), cy = 1274.8, rx = 45.8, ry = 44.4
  // Pressed recess crops (`h-nav-1..5-press.webp`): cropX0_crop = [63, 214, 368, 522, 675], cropW = [115, 116, 116, 116, 116], cropY0 = 1218, cropH = 113
  const bottomNavItems = [
    {
      id: 'home',
      labelFa: 'خانه',
      labelEn: 'Home',
      leftPct: ((120.5 - 46) / 856) * 100,
      pressImg: '/images/d9/h-nav-1-press.webp',
      pressLeftPct: (63 / 856) * 100,
      pressWidthPct: (115 / 856) * 100,
      onClick: () => onNavigate('menu'),
    },
    {
      id: 'collection',
      labelFa: 'کالکشن',
      labelEn: 'Cards',
      leftPct: ((272 - 46) / 856) * 100,
      pressImg: '/images/d9/h-nav-2-press.webp',
      pressLeftPct: (214 / 856) * 100,
      pressWidthPct: (116 / 856) * 100,
      onClick: () => onNavigate('collection'),
    },
    {
      id: 'leaderboard',
      labelFa: 'برترین‌ها',
      labelEn: 'Ranks',
      leftPct: ((426 - 46) / 856) * 100,
      pressImg: '/images/d9/h-nav-3-press.webp',
      pressLeftPct: (368 / 856) * 100,
      pressWidthPct: (116 / 856) * 100,
      onClick: () => onNavigate('leaderboard'),
    },
    {
      id: 'social',
      labelFa: 'دوستان',
      labelEn: 'Friends',
      leftPct: ((580 - 46) / 856) * 100,
      pressImg: '/images/d9/h-nav-4-press.webp',
      pressLeftPct: (522 / 856) * 100,
      pressWidthPct: (116 / 856) * 100,
      badge: pendingChallenges,
      onClick: () => onNavigate('social'),
    },
    {
      id: 'profile',
      labelFa: 'پروفایل',
      labelEn: 'Profile',
      leftPct: ((733 - 46) / 856) * 100,
      pressImg: '/images/d9/h-nav-5-press.webp',
      pressLeftPct: (675 / 856) * 100,
      pressWidthPct: (116 / 856) * 100,
      onClick: onOpenProfile,
    },
  ];

  // Authentic 3D raised bone-cream clay capsule style matching `h-clean-pill.webp`
  const raisedCreamPillStyle: React.CSSProperties = {
    backgroundColor: '#EAE0CE',
    backgroundImage: `
      var(--tex-paper),
      linear-gradient(180deg, #F5EDE0 0%, #E6DAC6 62%, #D4C3AA 100%)
    `,
    backgroundSize: '160px 160px, auto',
    backgroundBlendMode: 'multiply, normal',
    boxShadow: `
      inset 0 1.5px 1px rgba(255, 253, 248, 0.92),
      inset 0 -2px 2px rgba(154, 132, 104, 0.52),
      0 3px 5px rgba(28, 10, 3, 0.55)
    `,
    border: '1px solid rgba(110, 78, 52, 0.45)',
  };

  // Scale factor converting 1151-calibrated vertical percentages to the 1367-tall 4-row chassis
  const vScale = 1151 / 1367;

  return (
    <div
      dir={isFa ? 'rtl' : 'ltr'}
      className="relative w-full h-[100dvh] flex items-center justify-center p-0 select-none overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #B49B82 0%, #978067 52%, #76634E 100%)',
      }}
    >
      {/* ===================================================================
          THE REAL HAND-MOLDED MUD-BRICK TABLET CHASSIS (`h-tablet-only.webp`, 856x1367)
          On mobile screens (<640px), fills 100vw × 100dvh so there are zero ugly
          top/bottom margins; on desktop (>=640px), locks cleanly to 856:1367!
         =================================================================== */}
      <div
        className="relative mx-auto shrink-0 overflow-hidden w-[100vw] h-[100dvh] rounded-none sm:rounded-[22px] sm:w-[min(98vw,calc(98.8dvh*856/1367))] sm:h-[min(98.8dvh,calc(98vw*1367/856))] shadow-[0_22px_50px_rgba(24,10,2,0.55)]"
      >
        {/* Photographic Mud-Brick Chassis with Carved Cavities, Bevels, Inner Shadows & Paper Slabs */}
        <img
          src="/images/d9/h-tablet-only.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-fill pointer-events-none select-none block"
        />

        {/* =================================================================
            1. TOP HEADER BAR — VERTICALLY CENTERED WITH THE AVATAR MEDALLION
            Aligned with the vertical center of the top-right khaki medallion (cy=58 in 856x1367):
            - Single cohesive row: Player Identity Capsule + Raised Cream-Clay Coins Capsule + Raised Cream-Clay Score Capsule
           ================================================================= */}
        <div
          dir="rtl"
          className="absolute z-10 flex items-center"
          style={{
            left: '6.54%',
            top: '1.03%',
            width: '73.36%',
            height: '6.44%',
          }}
        >
          {/* Single Row: Uniform-Height Capsules Vertically Centered with Avatar Medallion */}
          <div className="w-full grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-2.5 h-[30px] sm:h-[34px]">
            {/* Player Identity Capsule (Next to the Top-Right Khaki Medallion) */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="h-full flex items-center justify-between gap-1.5 px-2.5 sm:px-3.5 rounded-full active:scale-95 transition-transform focus:outline-none min-w-0"
              style={{
                backgroundColor: 'rgba(84, 34, 14, 0.66)',
                boxShadow:
                  'inset 0 2px 4px rgba(18, 5, 1, 0.85), 0 1px 0 rgba(252, 214, 186, 0.52)',
                border: '1px solid rgba(60, 22, 7, 0.68)',
              }}
              title={isFa ? 'پروفایل و تندیس‌های خشتی' : 'Profile & Avatars'}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {/* Warm Gold Royal Crest Icon */}
                <span
                  className="w-4 h-4 sm:w-[18px] sm:h-[18px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #F7D98C 0%, #CFA64B 65%, #9B7122 100%)',
                    boxShadow: '0 1px 2px rgba(20, 6, 1, 0.6)',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 17L6 9L10 13L12 6L14 13L18 9L20 17H4Z"
                      fill="#3B210B"
                      stroke="#3B210B"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  className="text-[11px] sm:text-[12px] font-black text-[#FFF6E8] leading-none truncate min-w-0"
                  style={{ textShadow: '0 1px 2px rgba(24, 8, 2, 0.92)' }}
                >
                  {player?.name || (isFa ? 'مسافر خشتی' : 'Guest')}
                </span>
              </span>
              <span
                className="text-[9px] sm:text-[9.5px] font-black text-[#2C1808] leading-none shrink-0 px-2 py-0.5 rounded-full"
                style={{
                  background:
                    'linear-gradient(180deg, #F3D393 0%, #D4A44E 100%)',
                  boxShadow: '0 1px 2px rgba(20, 6, 1, 0.5)',
                }}
              >
                {isFa ? `سطح ${fmt(xp.level)}` : `Lv.${xp.level}`}
              </span>
            </button>

            {/* Raised 3D Cream-Clay Capsule 1: Coins + Shop (`سکه + فروشگاه`) */}
            <button
              type="button"
              onClick={onOpenShop}
              className="h-full flex items-center gap-1.5 px-2.5 sm:px-3 rounded-full active:scale-95 transition-transform focus:outline-none shrink-0"
              style={raisedCreamPillStyle}
              title={isFa ? 'فروشگاه سکه' : 'Coin Shop'}
            >
              <GameCoin size={15} />
              <span className="text-[11px] sm:text-[12px] font-black text-[#2C1A0C] tabular-nums tracking-tight leading-none">
                {fmt(player?.coins ?? 0)}
              </span>
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[#FFF7EA] shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #C8704A 0%, #944424 100%)',
                  boxShadow: '0 1px 2px rgba(28, 10, 3, 0.5)',
                }}
              >
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            </button>

            {/* Raised 3D Cream-Clay Capsule 2: Total Score (`امتیاز کل`) */}
            <button
              type="button"
              onClick={() => onNavigate('leaderboard')}
              className="h-full flex items-center gap-1.5 px-2.5 sm:px-3 rounded-full active:scale-95 transition-transform focus:outline-none shrink-0"
              style={raisedCreamPillStyle}
              title={isFa ? 'امتیاز کل و جدول برترین‌ها' : 'Total Score & Ranks'}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    'radial-gradient(circle at 32% 28%, #88A3B5 0%, #5B778A 62%, #3E5463 100%)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(20,8,2,0.5)',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#FFF8EC">
                  <path d="M12 2L14.9 8.6L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.1 8.6L12 2Z" />
                </svg>
              </span>
              <span className="text-[11px] sm:text-[12px] font-black text-[#243644] tabular-nums tracking-tight leading-none">
                {fmt(player?.score ?? 0)}
              </span>
              <span className="text-[9px] font-extrabold text-[#546A7B] hidden sm:inline leading-none">
                {isFa ? 'امتیاز' : 'PTS'}
              </span>
            </button>
          </div>
        </div>

        {/* =================================================================
            1E. TOP-RIGHT KHAKI CLAY PROFILE MEDALLION
            Centered directly over the 3D khaki clay disc (`cx_crop=745.5, cy=58, rx=47.5, ry=44`)!
           ================================================================= */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="absolute z-10 rounded-full flex items-center justify-center active:scale-95 transition-transform focus:outline-none group"
          style={{
            left: `${avatarConfig.leftPct}%`,
            top: `${avatarConfig.topPct * vScale}%`,
            width: `${avatarConfig.widthPct}%`,
            height: `${avatarConfig.heightPct * vScale}%`,
          }}
          title={
            isFa
              ? 'پروفایل و انتخاب تندیس خشتی (۲۰ چهره مشاهیر و فوتبال)'
              : 'Profile & Clay Medallion Avatars'
          }
        >
          <AvatarRenderer
            avatar={player?.avatar}
            framelessOnKhaki={!avatarConfig.withClayBacking}
            withClayBacking={avatarConfig.withClayBacking}
            objectFit={avatarConfig.objectFit}
            imageScale={avatarConfig.imgScale / 100}
            imageOffsetX={avatarConfig.imgOffsetX}
            imageOffsetY={avatarConfig.imgOffsetY}
            className="w-full h-full group-hover:scale-105 transition-transform"
          />
        </button>

        {/* =================================================================
            2. CAVITY 1 — HERO SUNKEN MUD-BRICK NICHE (`گنجینه شاهنامه و اسطوره‌ها`)
            Inset inside the cream paper slab (x_crop=73..784, y=132..338 in 856x1367)
           ================================================================= */}
        <button
          type="button"
          onClick={() => onNavigate('epic_library')}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.99] transition-transform"
          style={{
            left: '8.53%',
            top: '9.66%',
            width: '83.06%',
            height: '15.07%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow:
              'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
        >
          <CornerFlorets inset={3} size={7} color="#2A1E15" />
          <img
            src="/images/ui/hero-storyteller.webp"
            alt={isFa ? 'گنجینه شاهنامه و اسطوره‌ها' : 'Shahnameh & Legends'}
            className="w-full h-full object-fill group-hover:scale-[1.02] transition-transform duration-500 select-none pointer-events-none"
          />

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1.5 inset-x-[14%] h-[23px] sm:h-[26px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-3"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #E0B254 0%, #C08C2C 68%, #8F6318 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,245,215,0.65), 0 1px 2px rgba(32,14,4,0.45)',
                  }}
                />
                <span className="text-[11px] sm:text-[12px] font-black text-[#261910] truncate">
                  {isFa ? 'گنجینه شاهنامه و اسطوره‌ها' : 'Shahnameh & Legends'}
                </span>
              </div>
              <span className="text-[9.5px] sm:text-[10px] font-black text-[#6B4A2B] shrink-0">
                {isFa
                  ? `مرحله ${fmt(epicStageCount + 1)} ◀`
                  : `Stage ${epicStageCount + 1} ▶`}
              </span>
            </div>
          </div>
        </button>

        {/* =================================================================
            3. ROW 2 (CAVITY 2A & 2B) — TWO SIDE-BY-SIDE CARVED MUD-BRICK NICHES
            Inset inside each cream paper slab (x_crop=75..399 and 458..782, y=389..601 in 856x1367)
           ================================================================= */}

        {/* 3A. Row 2 Left Sunken Mud-Brick Niche — چالش دوئل نوبتی (1v1 Turn-Based Duel) */}
        <button
          type="button"
          onClick={() => onNavigate('duel')}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '8.76%',
            top: '28.46%',
            width: '37.85%',
            height: '15.51%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow: 'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
        >
          <CornerFlorets inset={3} size={7} color="#2A1E15" />
          <img
            src="/images/ui/hero-duel.webp"
            alt={isFa ? 'چالش دوئل نوبتی' : '1v1 Turn-Based Duel'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {pendingChallenges > 0 && (
            <span className="absolute top-1.5 right-2 z-10 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#C95B3C] text-[#FFF6E8] border border-[#4A1C0D] shadow-sm">
              {fmt(pendingChallenges)}!
            </span>
          )}

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[22px] sm:h-[25px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #E0B254 0%, #C08C2C 68%, #8F6318 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,245,215,0.65), 0 1px 2px rgba(32,14,4,0.45)',
                  }}
                />
                <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'چالش دوئل نوبتی' : '1v1 Duel'}
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-black text-[#5A3A1E] shrink-0">
                {isFa ? 'نبرد ◀' : 'Play ▶'}
              </span>
            </div>
          </div>
        </button>

        {/* 3B. Row 2 Right Sunken Mud-Brick Niche — نبرد آنلاین (Online Battle) */}
        <button
          type="button"
          onClick={() => onNavigate('lobby')}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '53.50%',
            top: '28.46%',
            width: '37.85%',
            height: '15.51%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow: 'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
        >
          <CornerFlorets inset={3} size={7} color="#2A1E15" />
          <img
            src="/images/ui/hero-battle.webp"
            alt={isFa ? 'نبرد آنلاین' : 'Online Battle'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[22px] sm:h-[25px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #8FA47E 0%, #6B825E 68%, #4C6040 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(235,245,225,0.65), 0 1px 2px rgba(20,30,14,0.45)',
                  }}
                />
                <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'نبرد آنلاین' : 'Online Battle'}
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-black text-[#465A3C] shrink-0">
                {isFa ? `${fmt(trophies)} جام` : `${trophies}`}
              </span>
            </div>
          </div>
        </button>

        {/* =================================================================
            4. ROW 3 (CAVITY 3A & 3B) — TWO SIDE-BY-SIDE CARVED MUD-BRICK NICHES
            Inset inside each cream paper slab (x_crop=75..399 and 458..782, y=649..861 in 856x1367)
           ================================================================= */}

        {/* 4A. Row 3 Left Sunken Mud-Brick Niche — معمای روزانه (Daily Puzzle & Streak) */}
        <button
          type="button"
          onClick={onStartDailyChallenge}
          disabled={dailyDone}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform disabled:opacity-85"
          style={{
            left: '8.76%',
            top: '47.48%',
            width: '37.85%',
            height: '15.51%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow: 'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
        >
          <CornerFlorets inset={3} size={7} color="#2A1E15" />
          <img
            src="/images/ui/hero-treasure.webp"
            alt={isFa ? 'معمای روزانه' : 'Daily Puzzle'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* Top Reward / Streak Badges */}
          <div className="absolute top-1.5 inset-x-2 z-10 flex items-center justify-between pointer-events-none">
            <span
              className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black flex items-center gap-0.5 shadow-sm"
              style={raisedCreamPillStyle}
            >
              <InkFlame size={9} className="text-[#B85028] shrink-0" />
              <span className="text-[#2B1B10]">
                {streakDays > 0
                  ? isFa
                    ? `${fmt(streakDays)} روز`
                    : `${streakDays}d`
                  : isFa
                  ? 'ویژه'
                  : 'Bonus'}
              </span>
            </span>
            <span
              className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[8.5px] font-black flex items-center gap-0.5 shrink-0 shadow-sm border border-[#3E240E]/40"
              style={{
                backgroundColor: dailyDone ? '#5A6E4E' : '#C88C28',
                color: '#FFF8EC',
              }}
            >
              {dailyDone ? (
                <span>{isFa ? 'حل شد ✓' : 'Done ✓'}</span>
              ) : (
                <>
                  <GameCoin size={10} />
                  <span>+{fmt(dailyReward)}</span>
                </>
              )}
            </span>
          </div>

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[22px] sm:h-[25px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #E0B254 0%, #C08C2C 68%, #8F6318 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,245,215,0.65), 0 1px 2px rgba(32,14,4,0.45)',
                  }}
                />
                <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'معمای روزانه' : 'Daily Puzzle'}
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-black text-[#5A3A1E] shrink-0">
                {dailyDone
                  ? isFa
                    ? 'تکمیل'
                    : 'Solved'
                  : isFa
                  ? 'شروع ◀'
                  : 'Start ▶'}
              </span>
            </div>
          </div>
        </button>

        {/* 4B. Row 3 Right Sunken Mud-Brick Niche — برج بی‌نهایت (Endless Tower) */}
        <button
          type="button"
          onClick={() => onNavigate('tower_lobby')}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '53.50%',
            top: '47.48%',
            width: '37.85%',
            height: '15.51%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow: 'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
        >
          <CornerFlorets inset={3} size={7} color="#2A1E15" />
          <img
            src="/images/ui/hero-tower.webp"
            alt={isFa ? 'برج بی‌نهایت' : 'Endless Tower'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[22px] sm:h-[25px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #88A3B5 0%, #5B778A 68%, #3E5463 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(235,245,255,0.65), 0 1px 2px rgba(14,24,34,0.45)',
                  }}
                />
                <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'برج بی‌نهایت' : 'Endless Tower'}
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-black text-[#384D5C] shrink-0">
                {isFa ? `طبقه ${fmt(towerFloor)}` : `F.${towerFloor}`}
              </span>
            </div>
          </div>
        </button>

        {/* =================================================================
            4C. ROW 4 (THREE 1/3-WIDTH CARVED MUD-BRICK NICHES)
            Aligned 1:1 with the 3 sunken cavities in `h-tablet-only.webp` (dstY = 906..1074):
            - Right Niche (67.99%): ماموریت‌ها (Daily Quests — `/images/ui/hero-quests.webp`)
            - Center Niche (38.08%): فصل‌نامه (Season Battle Pass — `/images/ui/hero-pass.webp`)
            - Left Niche (8.18%): گردونه شانس (Daily Fortune Wheel — `/images/ui/hero-wheel.webp`)
           ================================================================= */}

        {/* Row 4 Left 1/3 Sunken Mud-Brick Niche — گردونه شانس (Daily Fortune Wheel) */}
        <button
          type="button"
          onClick={() => setShowWheelModal(true)}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '8.18%',
            top: '66.28%',
            width: '23.83%',
            height: '12.29%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow:
              'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
          title={isFa ? 'گردونه سرنوشت خشتی (چرخش روزانه)' : 'Daily Fortune Wheel'}
        >
          <CornerFlorets inset={3} size={6} color="#2A1E15" />
          <img
            src="/images/ui/hero-wheel.webp"
            alt={isFa ? 'گردونه شانس' : 'Fortune Wheel'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* Top Status Badges */}
          <div className="absolute top-1.5 inset-x-1.5 z-10 flex items-center justify-between pointer-events-none">
            <span
              className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#2B1B10] shadow-sm truncate"
              style={raisedCreamPillStyle}
            >
              {isFa
                ? `${fmt(Math.max(0, 3 - (progress?.economy?.wheelSpinsToday ?? 0)))}/۳ چرخش`
                : `${Math.max(0, 3 - (progress?.economy?.wheelSpinsToday ?? 0))}/3`}
            </span>
            <span
              className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#FFF8EC] flex items-center gap-0.5 shrink-0 shadow-sm border border-[#243B18]/40"
              style={{
                background:
                  progress?.economy?.wheelFreeAvailable !== false
                    ? 'linear-gradient(180deg, #6E8E53 0%, #4A6634 100%)'
                    : 'linear-gradient(180deg, #D49B35 0%, #9E6B15 100%)',
              }}
            >
              {progress?.economy?.wheelFreeAvailable !== false ? (
                <span>{isFa ? 'رایگان!' : 'FREE!'}</span>
              ) : (
                <>
                  <GameCoin size={9} />
                  <span>+{fmt(250)}</span>
                </>
              )}
            </span>
          </div>

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[20px] sm:h-[23px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-1.5"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #58B8B0 0%, #2C8A82 68%, #185A54 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(220,255,250,0.65), 0 1px 2px rgba(10,32,28,0.45)',
                  }}
                />
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'گردونه شانس' : 'Wheel'}
                </span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-black text-[#265A54] shrink-0">
                {isFa ? 'بچرخان ◀' : 'Spin ▶'}
              </span>
            </div>
          </div>
        </button>

        {/* Row 4 Center 1/3 Sunken Mud-Brick Niche — فصل‌نامه (Season Battle Pass) */}
        <button
          type="button"
          onClick={() => setShowBattlePassModal(true)}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '38.08%',
            top: '66.28%',
            width: '23.83%',
            height: '12.29%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow:
              'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
          title={isFa ? 'فصل‌نامه حماسی (پاس نبرد ۳۰ پله‌ای)' : 'Season Battle Pass'}
        >
          <CornerFlorets inset={3} size={6} color="#2A1E15" />
          <img
            src="/images/ui/hero-pass.webp"
            alt={isFa ? 'فصل‌نامه' : 'Season Pass'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* Top Status Badges */}
          <div className="absolute top-1.5 inset-x-1.5 z-10 flex items-center justify-between pointer-events-none">
            <span
              className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#2B1B10] shadow-sm truncate"
              style={raisedCreamPillStyle}
            >
              {isFa
                ? `پله ${fmt(Math.min(30, Math.floor((player?.score || 0) / 250) + 1))}/۳۰`
                : `Tier ${Math.min(30, Math.floor((player?.score || 0) / 250) + 1)}/30`}
            </span>
            <span
              className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#2C1808] flex items-center gap-0.5 shrink-0 shadow-sm border border-[#5E3B0C]/45"
              style={{
                background: 'linear-gradient(180deg, #F6DC9E 0%, #D4A13E 100%)',
              }}
            >
              <span>👑</span>
              <span>
                {progress?.economy?.hasSeasonPass
                  ? isFa
                    ? 'طلایی'
                    : 'VIP'
                  : isFa
                  ? 'فصل ۱'
                  : 'S1'}
              </span>
            </span>
          </div>

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[20px] sm:h-[23px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-1.5"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #F4CA64 0%, #C88E22 68%, #8F5E0C 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,248,220,0.7), 0 1px 2px rgba(32,14,4,0.45)',
                  }}
                />
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'فصل‌نامه' : 'Season Pass'}
                </span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-black text-[#6E4514] shrink-0">
                {isFa ? 'جوایز ◀' : 'Open ▶'}
              </span>
            </div>
          </div>
        </button>

        {/* Row 4 Right 1/3 Sunken Mud-Brick Niche — ماموریت‌ها (Daily Quests) */}
        <button
          type="button"
          onClick={() => setShowTodaySheet(true)}
          className="group absolute z-10 overflow-hidden focus:outline-none active:scale-[0.98] transition-transform"
          style={{
            left: '67.99%',
            top: '66.28%',
            width: '23.83%',
            height: '12.29%',
            borderRadius: '7px',
            border: '1.5px solid #2A1E15',
            boxShadow:
              'inset 0 0 0 2px #EAE0CE, inset 0 0 0 3px rgba(42, 30, 21, 0.55)',
          }}
          title={isFa ? 'ماموریت‌های روزانه و دریافت پاداش' : 'Daily Quests & Rewards'}
        >
          <CornerFlorets inset={3} size={6} color="#2A1E15" />
          <img
            src="/images/ui/hero-quests.webp"
            alt={isFa ? 'ماموریت‌ها' : 'Daily Quests'}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
          />

          {/* Top Status Badges */}
          <div className="absolute top-1.5 inset-x-1.5 z-10 flex items-center justify-between pointer-events-none">
            <span
              className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#2B1B10] shadow-sm truncate"
              style={raisedCreamPillStyle}
            >
              {isFa
                ? `${fmt(quests.filter((q) => q.progress >= q.target).length)}/${fmt(quests.length || 3)} تکمیل`
                : `${quests.filter((q) => q.progress >= q.target).length}/${quests.length || 3} Done`}
            </span>
            {unclaimedCount > 0 ? (
              <span
                className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#FFF8EC] flex items-center gap-0.5 shrink-0 shadow-sm animate-pulse border border-[#5E2914]/50"
                style={{
                  background: 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)',
                }}
              >
                <span>{fmt(unclaimedCount)}</span>
                <span>{isFa ? 'جایزه!' : 'Claim!'}</span>
              </span>
            ) : (
              <span
                className="px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8px] font-black text-[#FFF8EC] flex items-center gap-0.5 shrink-0 shadow-sm border border-[#3E240E]/40"
                style={{
                  background: 'linear-gradient(180deg, #C88C28 0%, #966414 100%)',
                }}
              >
                <GameCoin size={9} />
                <span>+{fmt(quests.reduce((s, q) => s + q.reward, 0))}</span>
              </span>
            )}
          </div>

          {/* 3D Bone-Cream Clay Pill (`h-clean-pill.webp`) */}
          <div className="absolute bottom-1 inset-x-1 h-[20px] sm:h-[23px] flex items-center justify-center">
            <img
              src="/images/d9/h-clean-pill.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-fill pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(24,8,2,0.45)]"
            />
            <div
              dir={isFa ? 'rtl' : 'ltr'}
              className="absolute inset-0 flex items-center justify-between px-1.5"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #E07A54 0%, #B8522C 68%, #823416 100%)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,235,220,0.65), 0 1px 2px rgba(32,14,4,0.45)',
                  }}
                />
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#26160A] truncate">
                  {isFa ? 'ماموریت‌ها' : 'Quests'}
                </span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-black text-[#5A3A1E] shrink-0">
                {isFa ? 'لیست ◀' : 'List ▶'}
              </span>
            </div>
          </div>
        </button>

        {/* =================================================================
            5. CAVITY 5 — REAL SCULPTED 3D TERRACOTTA PLAY BUTTON BAR
            Uses the exact `recess2` pressed clay tile (`/images/d9/h-play-bar-press.webp`)
            and `.cg-pressart` overlay architecture from `GameKeyboard.tsx` so pressing
            the bar recesses it naturally into the clay tablet with zero dark cave gap!
           ================================================================= */}
        <img
          src="/images/d9/h-play-bar-press.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`cg-pressart${isPlayBarPressed ? ' is-down' : ''}`}
          style={{
            left: `${(46 / 856) * 100}%`,
            top: `${(1098 / 1367) * 100}%`,
            width: `${(764 / 856) * 100}%`,
            height: `${(114 / 1367) * 100}%`,
          }}
        />
        <button
          type="button"
          onPointerDown={() => setIsPlayBarPressed(true)}
          onPointerUp={() => setIsPlayBarPressed(false)}
          onPointerLeave={() => setIsPlayBarPressed(false)}
          onPointerCancel={() => setIsPlayBarPressed(false)}
          onClick={() => {
            setIsPlayBarPressed(true);
            setTimeout(() => {
              setIsPlayBarPressed(false);
              setShowBuilderModal(true);
            }, 140);
          }}
          disabled={isGenerating}
          dir="ltr"
          className="group absolute z-10 focus:outline-none rounded-full"
          style={{
            left: `${(55 / 856) * 100}%`,
            top: `${(1104 / 1367) * 100}%`,
            width: `${(745 / 856) * 100}%`,
            height: `${(95 / 1367) * 100}%`,
          }}
          title={
            isFa
              ? `ساخت جدول جدید (${CATEGORY_META[category].fa} · ${fmt(size)}×${fmt(size)})`
              : `Build Crossword (${CATEGORY_META[category].en} · ${size}×${size})`
          }
        >
          {/* Inner Labels — Shift 1.8px down & scale 0.985 in sync with the recessed clay face (matching `.cg-key.is-down`) */}
          <div
            className={`relative w-full h-full flex items-center justify-between rounded-full transition-all duration-[55ms] ease-out ${
              isPlayBarPressed
                ? 'translate-y-[1.8px] scale-[0.985] opacity-[0.94]'
                : 'group-active:translate-y-[1.8px] group-active:scale-[0.985] group-active:opacity-[0.94]'
            }`}
          >
            {/* Left Side of Central Play Triangle: Active Topic & Size Engraved Directly on the Clay Bar */}
            <div className="relative z-10 w-[41%] h-full flex items-center justify-center px-2">
              <span
                className="text-[11px] sm:text-[12.5px] font-black text-[#FBE9D4] truncate flex items-center gap-1"
                style={{
                  textShadow:
                    '0 1.5px 2.5px rgba(32, 10, 2, 0.92), 0 0 1px rgba(48, 16, 4, 0.8)',
                }}
              >
                <span>
                  {isFa
                    ? `${CATEGORY_META[category].fa} · ${fmt(size)}×${fmt(size)}`
                    : `${CATEGORY_META[category].en} · ${size}×${size}`}
                </span>
                <span className="text-[9px] opacity-90 text-[#FFD8B5]">▾</span>
              </span>
            </div>

            {/* Center 3D Cream-Clay Play Triangle (Spinner when generating) */}
            <div className="relative z-10 w-[18%] h-full flex items-center justify-center">
              {isGenerating && (
                <RefreshCw className="w-6 h-6 text-[#F6EFE2] animate-spin drop-shadow-md" />
              )}
            </div>

            {/* Right Side of Central Play Triangle: "ساخت جدول جدید" */}
            <div className="relative z-10 w-[41%] h-full flex items-center justify-center px-2">
              <span
                className="text-[12.5px] sm:text-[14px] font-black text-[#FFF5E4] truncate"
                style={{
                  textShadow:
                    '0 1.5px 2.5px rgba(32, 10, 2, 0.92), 0 0 1px rgba(48, 16, 4, 0.8)',
                }}
              >
                {isFa ? 'ساخت جدول جدید' : 'New Puzzle'}
              </span>
            </div>
          </div>
        </button>

        {/* =================================================================
            6. BOTTOM 5 CIRCULAR 3D CLAY NAVIGATION BUTTONS
            Uses the exact `recess2` pressed clay discs (`h-nav-1..5-press.webp`)
            and `.cg-pressart` overlay architecture matching the Play Bar!
           ================================================================= */}
        {bottomNavItems.map((item) => (
          <React.Fragment key={item.id}>
            <img
              src={item.pressImg}
              alt=""
              aria-hidden="true"
              draggable={false}
              className={`cg-pressart${pressedNavId === item.id ? ' is-down' : ''}`}
              style={{
                left: `${item.pressLeftPct.toFixed(2)}%`,
                top: `${((1218 / 1367) * 100).toFixed(2)}%`,
                width: `${item.pressWidthPct.toFixed(2)}%`,
                height: `${((113 / 1367) * 100).toFixed(2)}%`,
              }}
            />
            <button
              type="button"
              onPointerDown={() => setPressedNavId(item.id)}
              onPointerUp={() => setPressedNavId(null)}
              onPointerLeave={() => setPressedNavId(null)}
              onPointerCancel={() => setPressedNavId(null)}
              onClick={() => {
                setPressedNavId(item.id);
                setTimeout(() => {
                  setPressedNavId(null);
                  item.onClick();
                }, 140);
              }}
              aria-label={isFa ? item.labelFa : item.labelEn}
              className="group absolute z-10 rounded-full flex items-center justify-center focus:outline-none"
              style={{
                left: `${item.leftPct.toFixed(2)}%`,
                top: '89.98%',
                width: '10.75%',
                height: '6.58%',
              }}
              title={isFa ? item.labelFa : item.labelEn}
            >
              {item.id === 'collection' && (
                <span
                  className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[7.5px] sm:text-[8.5px] font-black text-[#FFF9EE] whitespace-nowrap shadow-md border border-[#A7ECE4]"
                  style={{
                    background: 'linear-gradient(180deg, #289E92 0%, #176B62 100%)',
                  }}
                >
                  {isFa ? '🃏 کومبو' : '🃏 Combo'}
                </span>
              )}
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#C94A29] text-[#FFF8EC] text-[9px] font-black flex items-center justify-center border border-[#FFF5E6] shadow-md">
                  {fmt(item.badge)}
                </span>
              ) : null}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* ===================================================================
          BUILDER POPUP MODAL (انتخاب ابعاد و موضوع جدول در حوضچه خشت سبز واقعی تصویر مرجع)
          Uses `h-sage-tray.webp`, `h-medallion-clean.webp` + CategoryInkGlyph, and `h-play-bar.webp`!
         =================================================================== */}
      {showBuilderModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/72 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowBuilderModal(false)}
        >
          <div
            className="relative w-full max-w-[440px] p-3.5 sm:p-4 flex flex-col gap-3 max-h-[92dvh] overflow-y-auto"
            style={{
              borderRadius: '30px',
              backgroundColor: '#AD6B4A',
              backgroundImage: "url('/images/d9/h-builder-slab.webp')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              border: '2px solid #753B1F',
              boxShadow: `
                inset 2.5px 3.5px 4px rgba(250, 218, 192, 0.58),
                inset -3px -5px 7px rgba(56, 22, 8, 0.52),
                0 7px 0 #5E2B14,
                0 28px 52px rgba(0, 0, 0, 0.85)
              `,
              scrollbarWidth: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <img
                    src={`/images/d9/h-cat-${category}.webp`}
                    alt={isFa ? CATEGORY_META[category].fa : CATEGORY_META[category].en}
                    className="w-full h-full object-contain drop-shadow-[0_3px_6px_rgba(20,6,1,0.65)]"
                  />
                </div>
                <div>
                  <h3
                    className="text-[14.5px] sm:text-[15.5px] font-black text-[#FFF7EA] leading-tight"
                    style={{ textShadow: '0 2px 3px rgba(32, 12, 4, 0.85)' }}
                  >
                    {isFa ? 'انتخاب ابعاد و موضوع جدول' : 'Choose Grid & Topic'}
                  </h3>
                  <p className="text-[10px] font-extrabold text-[#F5D7B0]">
                    {isFa
                      ? `انتخاب فعلی: ${CATEGORY_META[category].fa} (${fmt(size)}×${fmt(size)})`
                      : `Selected: ${CATEGORY_META[category].en} (${size}×${size})`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBuilderModal(false)}
                className="px-3 py-1 rounded-full text-xs font-black text-[#2C1A0C] active:scale-95 transition-transform"
                style={raisedCreamPillStyle}
              >
                {isFa ? 'بستن ✕' : 'Close ✕'}
              </button>
            </div>

            {/* Grid Size Selector (۵×۵ تا ۱۰×۱۰) Recessed into the Mud-Brick Tablet */}
            <div
              className="grid grid-cols-6 gap-1.5 p-1.5 rounded-2xl"
              style={{
                backgroundColor: 'rgba(74, 34, 16, 0.58)',
                border: '1px solid rgba(56, 22, 8, 0.55)',
                boxShadow:
                  'inset 0 3px 6px rgba(24, 8, 2, 0.72), 0 1.5px 0 rgba(248, 212, 184, 0.45)',
              }}
            >
              {SIZES.map((s) => {
                const isSelected = size === s;
                const isUnlocked =
                  unlockedSizes.includes(s) || SIZE_COSTS[s] === 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSelectSize(s)}
                    className="relative py-1.5 rounded-xl text-[11px] sm:text-[12px] font-black flex items-center justify-center gap-0.5 active:translate-y-[1px] transition-all focus:outline-none"
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#C06E4C',
                            backgroundImage:
                              'linear-gradient(180deg, #D48462 0%, #B25E3C 65%, #944626 100%)',
                            color: '#FFF7EB',
                            border: '1.5px solid #59220C',
                            boxShadow:
                              'inset 0 1.5px 0 rgba(255, 232, 208, 0.7), 0 2px 4px rgba(0,0,0,0.5)',
                          }
                        : isUnlocked
                        ? {
                            ...raisedCreamPillStyle,
                            color: '#2E2116',
                          }
                        : {
                            backgroundColor: '#431C0B',
                            color: '#D8B89C',
                            border: '1px dashed rgba(245, 210, 180, 0.35)',
                          }
                    }
                  >
                    <span>
                      {fmt(s)}×{fmt(s)}
                    </span>
                    {!isUnlocked && (
                      <Lock className="w-2.5 h-2.5 opacity-85 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* THE REAL EXTRACTED SAGE-GREEN CLAY TRAY (`h-sage-tray.webp`) WITH SCULPTED CATEGORY MEDALLIONS */}
            <div
              className="relative w-full p-3 sm:p-3.5 rounded-[22px] overflow-hidden"
              style={{
                backgroundImage: "url('/images/d9/h-sage-tray.webp')",
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-2 gap-x-1.5 justify-items-center py-1">
                {ALL_CATEGORIES.map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const isSelected = category === catKey;
                  const isUnlocked =
                    unlockedCategories.includes(catKey) ||
                    CATEGORY_COSTS[catKey] === 0;

                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleSelectCategory(catKey)}
                      className="group flex flex-col items-center w-full focus:outline-none active:scale-95 transition-transform"
                      title={isFa ? meta.fa : meta.en}
                    >
                      <div
                        className={`relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] flex items-center justify-center transition-transform ${
                          isSelected
                            ? 'scale-110 drop-shadow-[0_0_10px_rgba(252,224,140,0.9)]'
                            : 'group-hover:scale-105'
                        }`}
                        style={{
                          filter: isUnlocked
                            ? 'drop-shadow(0 4px 6px rgba(14, 22, 6, 0.68))'
                            : 'grayscale(0.35) brightness(0.85)',
                        }}
                      >
                        <img
                          src={`/images/d9/h-cat-${catKey}.webp`}
                          alt={isFa ? meta.fa : meta.en}
                          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_3px_5px_rgba(16,6,1,0.6)]"
                        />

                        {!isUnlocked && (
                          <span
                            className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 text-[8.5px] font-black text-[#FFF5E4] shadow-md"
                            style={{
                              background:
                                'linear-gradient(180deg, #8C4A27 0%, #5E2C12 100%)',
                              border: '1px solid #F5E2C8',
                            }}
                          >
                            <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                            <span>{fmt(CATEGORY_COSTS[catKey])}</span>
                          </span>
                        )}
                      </div>

                      <span
                        className="mt-0.5 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black leading-tight text-center max-w-full truncate shadow-sm transition-all"
                        style={
                          isSelected
                            ? {
                                backgroundColor: '#566B48',
                                backgroundImage:
                                  'linear-gradient(180deg, #6B7E5D 0%, #435436 100%)',
                                color: '#FFF8EE',
                                border: '1px solid #88B272',
                                boxShadow:
                                  '0 0 8px rgba(138, 175, 118, 0.65), 0 2px 4px rgba(0,0,0,0.5)',
                              }
                            : {
                                backgroundColor: '#425136',
                                backgroundImage:
                                  'linear-gradient(180deg, #526345 0%, #3C4B31 100%)',
                                color: '#F0E8D8',
                                border: '1px solid #2D3924',
                              }
                        }
                      >
                        {isFa ? meta.fa : meta.en}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Start Button Using Tightly-Cropped 3D Sculpted Clay Bar (`h-builder-play.webp` + `h-builder-play-press.webp`)
                Zero extra background strip underneath, matching `h-builder-slab.webp` & Main Menu press physics! */}
            <button
              type="button"
              onPointerDown={() => setIsBuilderPlayPressed(true)}
              onPointerUp={() => setIsBuilderPlayPressed(false)}
              onPointerLeave={() => setIsBuilderPlayPressed(false)}
              onPointerCancel={() => setIsBuilderPlayPressed(false)}
              onClick={() => {
                setIsBuilderPlayPressed(true);
                setTimeout(() => {
                  setIsBuilderPlayPressed(false);
                  setShowBuilderModal(false);
                  onStartQuickPlay();
                }, 140);
              }}
              disabled={isGenerating}
              dir="ltr"
              className="group relative w-full aspect-[744/90] rounded-full flex items-center justify-between focus:outline-none bg-transparent border-0 p-0"
            >
              <img
                src="/images/d9/h-builder-play.webp"
                alt=""
                aria-hidden="true"
                className={`w-full h-full object-fill pointer-events-none select-none transition-all duration-[55ms] ${
                  isBuilderPlayPressed
                    ? 'opacity-0'
                    : 'opacity-100 drop-shadow-[0_4px_6px_rgba(36,12,3,0.58)] group-active:opacity-0'
                }`}
              />
              <img
                src="/images/d9/h-builder-play-press.webp"
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full object-fill pointer-events-none select-none transition-opacity duration-[55ms] ${
                  isBuilderPlayPressed
                    ? 'opacity-100'
                    : 'opacity-0 group-active:opacity-100'
                }`}
              />
              <div
                className={`absolute inset-0 flex items-center justify-between px-[6%] transition-all duration-[55ms] ease-out ${
                  isBuilderPlayPressed
                    ? 'translate-y-[1.8px] scale-[0.985] opacity-[0.94]'
                    : 'group-active:translate-y-[1.8px] group-active:scale-[0.985] group-active:opacity-[0.94]'
                }`}
              >
                <span
                  className="w-[38%] text-left text-[11px] sm:text-[12.5px] font-black text-[#FBE9D4] truncate"
                  style={{ textShadow: '0 1.5px 2px rgba(36, 12, 3, 0.9)' }}
                >
                  {isFa
                    ? `${CATEGORY_META[category].fa} (${fmt(size)}×${fmt(size)})`
                    : `${CATEGORY_META[category].en} (${size}×${size})`}
                </span>
                <span
                  className="w-[38%] text-right text-[12px] sm:text-[13.5px] font-black text-[#FFF7EA] truncate"
                  style={{ textShadow: '0 1.5px 2px rgba(36, 12, 3, 0.9)' }}
                >
                  {isFa ? 'شروع بازی ◀' : 'Start Now'}
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          UNLOCK CONFIRMATION MODAL
         =================================================================== */}
      {unlockPrompt && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
          onClick={() => setUnlockPrompt(null)}
        >
          <div
            className="w-full max-w-xs p-5 text-center relative rounded-[22px]"
            style={{
              backgroundColor: '#EAE0CE',
              border: '3px solid #8E4B30',
              boxShadow:
                'inset 0 0 0 2px rgba(42,26,16,0.65), 0 24px 48px rgba(0,0,0,0.65)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CornerFlorets inset={6} size={12} color="#3A2618" />
            <div
              className="mx-auto mb-3 w-14 h-14 rounded-full text-[#FFF6EA] flex items-center justify-center shadow-md"
              style={{
                background: 'linear-gradient(180deg, #C86C44 0%, #964220 100%)',
                border: '2px solid #5C2610',
              }}
            >
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-[#2B1B10] mb-1">
              {isFa
                ? `باز کردن ${unlockPrompt.label}`
                : `Unlock ${unlockPrompt.label}`}
            </h3>
            <p className="text-xs font-bold text-[#5C4430] mb-4">
              {isFa
                ? `آیا می‌خواهی این بخش را با ${fmt(unlockPrompt.cost)} سکه باز کنی؟`
                : `Unlock this for ${unlockPrompt.cost} coins?`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnlockPrompt(null)}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black text-[#3A2618] bg-[#DFCBB0] border border-[#8C6E4E]"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmUnlock}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black text-[#FFF7EB] flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)',
                  border: '1.5px solid #5E2914',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,230,200,0.5), 0 2.5px 0 #4A1E0C',
                }}
              >
                <GameCoin size={18} />
                <span>{fmt(unlockPrompt.cost)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TODAY'S QUESTS SHEET MODAL
         =================================================================== */}
      {showTodaySheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-3"
          onClick={() => setShowTodaySheet(false)}
        >
          <div
            className="w-full max-w-md p-5 max-h-[82vh] overflow-y-auto relative rounded-[24px]"
            style={{
              backgroundColor: '#EAE0CE',
              border: '3px solid #8E4B30',
              boxShadow:
                'inset 0 0 0 2px rgba(42,26,16,0.65), 0 24px 48px rgba(0,0,0,0.68)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CornerFlorets inset={6} size={12} color="#3A2618" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A8552B]" />
                <h3 className="text-base font-black text-[#2B1B10]">
                  {isFa ? 'ماموریت‌های امروز' : "Today's Quests"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshQuests}
                  disabled={isRefreshingQuests || isQuestRerolledToday}
                  className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                    isQuestRerolledToday
                      ? 'opacity-60 bg-[#D4C3AB] text-[#6E553D] border border-[#B09980] cursor-not-allowed shadow-none'
                      : 'text-[#2B1B10] bg-[#E6D6BE] border border-[#8C6E4E] active:scale-95 shadow-xs hover:bg-[#EFE3CF]'
                  }`}
                  title={
                    isQuestRerolledToday
                      ? isFa
                        ? 'فرصت تعویض امروزت استفاده شده؛ فردا برگرد'
                        : 'Daily refresh used; return tomorrow'
                      : isFa
                      ? 'یک‌بار تعویض ماموریت‌ها'
                      : 'One free daily refresh'
                  }
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshingQuests
                        ? 'animate-spin text-[#8E4B30]'
                        : isQuestRerolledToday
                        ? 'text-[#8C7662]'
                        : 'text-[#8E4B30]'
                    }`}
                  />
                  <span>
                    {isQuestRerolledToday
                      ? isFa
                        ? 'فردا بیا'
                        : 'Tomorrow'
                      : isFa
                      ? 'تعویض مأموریت'
                      : 'Refresh'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTodaySheet(false);
                    setQuestRefreshMessage(null);
                  }}
                  className="px-3 py-1 rounded-full text-xs font-black text-[#2B1B10] bg-[#DFCBB0] border border-[#8C6E4E] hover:bg-[#E7D6BD] active:scale-95 transition-transform"
                >
                  {isFa ? 'بستن' : 'Close'}
                </button>
              </div>
            </div>

            {/* Informational banner about 1-time daily reroll */}
            {isQuestRerolledToday ? (
              <div
                className="mb-3.5 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border"
                style={{
                  backgroundColor: 'rgba(92,58,35,0.08)',
                  borderColor: '#A88460',
                  color: '#4A301D',
                }}
              >
                <span className="text-base select-none">⏳</span>
                <span className="leading-snug">
                  {isFa
                    ? 'تعویض مأموریت‌های امروزت انجام شد! برای تعویض جدید باید فردا برگردی.'
                    : "Today's quest refresh has been used! Come back tomorrow for a new set."}
                </span>
              </div>
            ) : questRefreshMessage ? (
              <div
                className="mb-3.5 px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border"
                style={{
                  backgroundColor: 'rgba(78,110,60,0.12)',
                  borderColor: '#78955A',
                  color: '#2D4419',
                }}
              >
                <span className="text-base select-none">✨</span>
                <span className="leading-snug">{questRefreshMessage}</span>
              </div>
            ) : null}

            <div className="space-y-2.5">
              {quests.length === 0 ? (
                <div className="p-4 rounded-2xl text-center text-xs font-bold text-[#4A3422] bg-[#E5D4BC] border border-[#B09472]">
                  {isFa
                    ? 'یک جدول حل کن تا ماموریت‌های امروزت فعال شوند!'
                    : 'Solve a puzzle to activate your daily quests!'}
                </div>
              ) : (
                quests.map((q) => {
                  const pct = Math.min(
                    100,
                    Math.round((q.progress / Math.max(1, q.target)) * 100)
                  );
                  const done = q.progress >= q.target;
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl flex items-center justify-between gap-3"
                      style={{
                        backgroundColor: '#E6D6BE',
                        border: '1.5px solid #9E805C',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-[#2B1B10] mb-1">
                          {isFa ? q.labelFa : q.labelEn}
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#C4AC8C] overflow-hidden p-[1px]">
                          <div
                            className="h-full rounded-full bg-[#687A4E]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[10.5px] font-bold text-[#5C4328] mt-1">
                          {fmt(q.progress)} / {fmt(q.target)}
                        </div>
                      </div>

                      {q.claimed ? (
                        <span className="px-3 py-1.5 rounded-xl text-[11px] font-black text-[#3F4E2B] bg-[#C5CFAF] border border-[#7E8F64]">
                          {isFa ? 'دریافت شد ✓' : 'Claimed ✓'}
                        </span>
                      ) : done ? (
                        <button
                          type="button"
                          onClick={() => handleClaimQuest(q.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black text-[#FFF7EB] flex items-center gap-1 shadow-md animate-bounce"
                          style={{
                            background:
                              'linear-gradient(180deg, #C86C44 0%, #9E4A28 100%)',
                            border: '1px solid #5E2914',
                          }}
                        >
                          <GameCoin size={16} />
                          <span>+{fmt(q.reward)}</span>
                        </button>
                      ) : (
                        <div className="px-2.5 py-1 rounded-xl text-[11px] font-black text-[#4A321C] bg-[#D6C0A0] border border-[#9E805C] flex items-center gap-1">
                          <GameCoin size={15} />
                          <span>+{fmt(q.reward)}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}


      {showWheelModal && player && (
        <FortuneWheelModal
          isOpen={showWheelModal}
          language={language}
          player={player}
          onClose={() => setShowWheelModal(false)}
          onPlayerSync={(patch) => {
            if (typeof patch.coins === 'number') onCoinsChange?.(patch.coins);
          }}
        />
      )}

      {showBattlePassModal && player && (
        <BattlePassModal
          player={player}
          onClose={() => setShowBattlePassModal(false)}
          onCoinsChange={(c) => onCoinsChange?.(c)}
        />
      )}

      {/* Floating Button to Test the 5 Master Scroll Reveal Ceremony Animations across all 4 Tiers */}
      <button
        type="button"
        onClick={() => setShowScrollCeremonyLab(true)}
        className="fixed bottom-4 left-4 z-[90] px-3.5 py-2 rounded-full font-black text-xs text-[#FFF9F0] flex items-center gap-1.5 shadow-xl active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #129666 0%, #064E33 60%, #C88B28 100%)',
          border: '1.5px solid #FFE285',
          boxShadow: '0 6px 20px rgba(18, 150, 102, 0.5)',
        }}
      >
        <Sparkles size={14} className="text-[#FFE285]" />
        <span>🎬 تست ۵ انیمیشن طومار</span>
      </button>

      {showScrollCeremonyLab && (
        <ScrollRevealCeremony
          isTestLab={true}
          onClose={() => setShowScrollCeremonyLab(false)}
        />
      )}
    </div>
  );
};

export default MainMenu;
