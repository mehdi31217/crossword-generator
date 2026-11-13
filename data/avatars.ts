export type AvatarCategory = 'celebrities' | 'football';

export interface AvatarItem {
  id: string;
  category: AvatarCategory;
  nameFa: string;
  nameEn: string;
  titleFa: string;
  titleEn: string;
  src: string;
}

export const DEFAULT_CLAY_AVATAR_SRC = '/images/avatars/celeb_ferdowsi.webp';

export const CELEBRITY_AVATARS: AvatarItem[] = [
  {
    id: 'celeb_cyrus',
    category: 'celebrities',
    nameFa: 'کوروش بزرگ',
    nameEn: 'Cyrus the Great',
    titleFa: 'بنیان‌گذار هخامنشیان',
    titleEn: 'Founder of Achaemenid Empire',
    src: '/images/avatars/celeb_cyrus.webp',
  },
  {
    id: 'celeb_ferdowsi',
    category: 'celebrities',
    nameFa: 'حکیم فردوسی',
    nameEn: 'Ferdowsi',
    titleFa: 'حماسه‌سرای شاهنامه',
    titleEn: 'Poet of the Shahnameh',
    src: '/images/avatars/celeb_ferdowsi.webp',
  },
  {
    id: 'celeb_avicenna',
    category: 'celebrities',
    nameFa: 'ابن سینا',
    nameEn: 'Avicenna (Ibn Sina)',
    titleFa: 'حکیم و پزشک نامدار',
    titleEn: 'Persian Polymath & Physician',
    src: '/images/avatars/celeb_avicenna.webp',
  },
  {
    id: 'celeb_einstein',
    category: 'celebrities',
    nameFa: 'آلبرت اینشتین',
    nameEn: 'Albert Einstein',
    titleFa: 'نابغه فیزیک نظری',
    titleEn: 'Theoretical Physicist',
    src: '/images/avatars/celeb_einstein.webp',
  },
  {
    id: 'celeb_mirzakhani',
    category: 'celebrities',
    nameFa: 'مریم میرزاخانی',
    nameEn: 'Maryam Mirzakhani',
    titleFa: 'نابغه ریاضیات جهان',
    titleEn: 'Fields Medal Mathematician',
    src: '/images/avatars/celeb_mirzakhani.webp',
  },
  {
    id: 'celeb_amirkabir',
    category: 'celebrities',
    nameFa: 'امیرکبیر',
    nameEn: 'Amir Kabir',
    titleFa: 'بنیان‌گذار دارالفنون',
    titleEn: 'Founder of Dar ul-Funun',
    src: '/images/avatars/celeb_amirkabir.webp',
  },
  {
    id: 'celeb_mosaddegh',
    category: 'celebrities',
    nameFa: 'دکتر محمد مصدق',
    nameEn: 'Dr. Mohammad Mosaddegh',
    titleFa: 'معمار ملی شدن صنعت نفت',
    titleEn: 'Leader of Oil Nationalization',
    src: '/images/avatars/celeb_mosaddegh.webp',
  },
  {
    id: 'celeb_shahabbas',
    category: 'celebrities',
    nameFa: 'شاه عباس بزرگ',
    nameEn: 'Shah Abbas I',
    titleFa: 'شکوه معماری اصفهان',
    titleEn: 'Golden Age of Isfahan',
    src: '/images/avatars/celeb_shahabbas.webp',
  },
  {
    id: 'celeb_davinci',
    category: 'celebrities',
    nameFa: 'لئوناردو داوینچی',
    nameEn: 'Leonardo da Vinci',
    titleFa: 'استاد نقاشی و اختراع',
    titleEn: 'Renaissance Polymath',
    src: '/images/avatars/celeb_davinci.webp',
  },
  {
    id: 'celeb_chaplin',
    category: 'celebrities',
    nameFa: 'چارلی چاپلین',
    nameEn: 'Charlie Chaplin',
    titleFa: 'اسطوره جاودان سینما',
    titleEn: 'Legend of Cinema',
    src: '/images/avatars/celeb_chaplin.webp',
  },
];

export const FOOTBALL_AVATARS: AvatarItem[] = [
  {
    id: 'player_messi',
    category: 'football',
    nameFa: 'لیونل مسی',
    nameEn: 'Lionel Messi',
    titleFa: 'اسطوره آرژانتین · شماره ۱۰',
    titleEn: 'Argentina Legend · #10',
    src: '/images/avatars/player_messi.webp',
  },
  {
    id: 'player_ronaldo',
    category: 'football',
    nameFa: 'کریستیانو رونالدو',
    nameEn: 'Cristiano Ronaldo',
    titleFa: 'اسطوره پرتغال · شماره ۷',
    titleEn: 'Portugal Legend · #7',
    src: '/images/avatars/player_ronaldo.webp',
  },
  {
    id: 'player_pele',
    category: 'football',
    nameFa: 'پله',
    nameEn: 'Pelé',
    titleFa: 'پادشاه فوتبال برزیل',
    titleEn: 'King of Football · Brazil',
    src: '/images/avatars/player_pele.webp',
  },
  {
    id: 'player_maradona',
    category: 'football',
    nameFa: 'دیگو مارادونا',
    nameEn: 'Diego Maradona',
    titleFa: 'پسر طلایی آرژانتین',
    titleEn: 'Golden Boy · 1986 Champion',
    src: '/images/avatars/player_maradona.webp',
  },
  {
    id: 'player_zidane',
    category: 'football',
    nameFa: 'زین‌الدین زیدان',
    nameEn: 'Zinedine Zidane',
    titleFa: 'جادوگر میانه میدان فرانسه',
    titleEn: 'French Maestro · #10',
    src: '/images/avatars/player_zidane.webp',
  },
  {
    id: 'player_ronaldinho',
    category: 'football',
    nameFa: 'رونالدینیو',
    nameEn: 'Ronaldinho',
    titleFa: 'جادوگر لبخند و تکنیک',
    titleEn: 'Samba Magician · Brazil',
    src: '/images/avatars/player_ronaldinho.webp',
  },
  {
    id: 'player_ronaldo9',
    category: 'football',
    nameFa: 'رونالدو نازاریو',
    nameEn: 'Ronaldo Nazário',
    titleFa: 'پدیده تکرارنشدنی برزیل',
    titleEn: 'O Fenômeno · #9',
    src: '/images/avatars/player_ronaldo9.webp',
  },
  {
    id: 'player_mbappe',
    category: 'football',
    nameFa: 'کیلیان امباپه',
    nameEn: 'Kylian Mbappé',
    titleFa: 'ستاره سرعتی فرانسه',
    titleEn: 'French Superstar · #10',
    src: '/images/avatars/player_mbappe.webp',
  },
  {
    id: 'player_cruyff',
    category: 'football',
    nameFa: 'یوهان کرایف',
    nameEn: 'Johan Cruyff',
    titleFa: 'معمار توتال فوتبال هلند',
    titleEn: 'Total Football Architect · #14',
    src: '/images/avatars/player_cruyff.webp',
  },
  {
    id: 'player_maldini',
    category: 'football',
    nameFa: 'پائولو مالدینی',
    nameEn: 'Paolo Maldini',
    titleFa: 'کاپیتان افسانه ای ایتالیا',
    titleEn: 'Legendary Captain · #3',
    src: '/images/avatars/player_maldini.webp',
  },
];

export const ALL_THEMED_AVATARS: AvatarItem[] = [
  ...CELEBRITY_AVATARS,
  ...FOOTBALL_AVATARS,
];

const AVATAR_BY_ID: Record<string, AvatarItem> = Object.fromEntries(
  ALL_THEMED_AVATARS.map((item) => [item.id, item])
);

export function getAvatarItem(avatarValue?: string | null): AvatarItem | null {
  if (!avatarValue) return null;
  if (AVATAR_BY_ID[avatarValue]) return AVATAR_BY_ID[avatarValue];
  const byPath = ALL_THEMED_AVATARS.find((a) => a.src === avatarValue);
  return byPath || null;
}

export function resolveAvatarSrc(avatarValue?: string | null): string | null {
  if (!avatarValue || avatarValue === '👤' || avatarValue === 'clay_default') {
    return DEFAULT_CLAY_AVATAR_SRC;
  }
  const item = getAvatarItem(avatarValue);
  if (item) return item.src;
  if (avatarValue.startsWith('/') || avatarValue.startsWith('http')) {
    return avatarValue;
  }
  return null;
}
