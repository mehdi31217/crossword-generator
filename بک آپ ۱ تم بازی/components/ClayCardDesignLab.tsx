import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Award, Eye } from 'lucide-react';

export interface MuseumCardModelSpec {
  id: number;
  nameFa: string;
  subtitleFa: string;
  ornamentStyleFa: string;
  descriptionFa: string;
  evolutionNotesFa: string[];
  recommended?: boolean;
}

export const TEN_CLAY_CARD_MODELS: MuseumCardModelSpec[] = [
  {
    id: 1,
    nameFa: 'طرح ۱۰ (مدل ۱) — قابِ موزه‌ایِ «اسلیمیِ سلطنتی و تراشِ زمرد»',
    subtitleFa: 'لچکی‌های منحنیِ قلم‌زنی‌شدهٔ اسلیمی که دقیقاً روی انحنای قاب می‌نشینند + تاج‌نگینِ هشت‌وجهی و کتیبهٔ خطاطی',
    ornamentStyleFa: 'لچکیِ اسلیمی و نگینِ تراشِ زمرد',
    descriptionFa:
      'بر پایهٔ طرح شماره ۱۰ (پنجرهٔ تمام‌قدِ تصویر + کتیبهٔ شناور): تمامِ تزییناتِ گوشه و بالای قاب با منحنی‌های ظریفِ اسلیمی و مخراج‌کاریِ چندوجهی طراحی شده‌اند تا کاملاً هم‌تراز با انحنای قاب باشند. کتیبهٔ شناور نیز به فرمِ الواحِ خطاطیِ هشت‌گوش با جدول‌کشیِ دوبلِ طلایی طراحی شده است.',
    evolutionNotesFa: [
      '🔒 قفل: قابِ خشتِ خامِ مات با جدولِ گود و مُهرِ استوانه‌ایِ مفرغی در مرکز',
      '🧱 رده ۱ (سفالین): قابِ سرامیکیِ سفالِ نیشابور + جدولِ ظریفِ درونی و کتیبهٔ کاغذ سمرقند',
      '💠 رده ۲ (لعاب فیروزه): قابِ لعابِ فیروزه با زهوارِ مسی-طلایی + لچکی‌های اسلیمی و ۲ نگینِ تراش‌خورده',
      '👑 رده ۳ (زرین هخامنشی): قابِ طلای چکش‌خورده با زنجیرهٔ مروارید + تاج‌نگینِ بالایی و طومارِ کتیبه',
      '💚 رده ۴ (زمردیِ شاهانه): قابِ مینای زمردِ سلطنتی با طلاکوبیِ برجستهٔ اسلیمی، ۴ گوهرِ تراشِ برلیان و کتیبهٔ بال‌دار',
    ],
    recommended: true,
  },
  {
    id: 2,
    nameFa: 'طرح ۱۰ (مدل ۲) — قابِ موزه‌ایِ «بال‌های ظریفِ هما و طوقِ مروارید ساسانی»',
    subtitleFa: 'خوابیدنِ ظریفِ پرهای قلم‌زنی‌شدهٔ هما روی کمانِ بالای قاب و در آغوش گرفتنِ دو سویِ کتیبهٔ شناور',
    ornamentStyleFa: 'قلم‌زنیِ بالِ هما و مرواریدِ ساسانی',
    descriptionFa:
      'در این مدل، هیچ قطعهٔ تیز یا بیرونیِ ناموزونی وجود ندارد؛ در لبهٔ بالای قاب، دو بالِ ظریف و قلم‌زنی‌شدهٔ هما به نرمی روی انحنای قاب خوابیده‌اند و یک گوهرِ بیضیِ تراش‌خورده را در بر گرفته‌اند. در پایین نیز پرهای ظریفِ طلایی، قوسِ چپ و راستِ کتیبهٔ سمرقند را در آغوش می‌گیرند.',
    evolutionNotesFa: [
      '🔒 قفل: قابِ سنگی-سفالی با حلقهٔ مهروموم‌شدهٔ مفرغی',
      '🧱 رده ۱ (سفالین): قابِ خشتیِ صیقلی + کتیبهٔ قوسیِ نرمِ کاغذ سمرقند',
      '💠 رده ۲ (لعاب فیروزه): قابِ فیروزه‌ای با زنجیرهٔ مرواریدِ درونی و نگینِ بیضی در پیشانیِ قاب',
      '👑 رده ۳ (زرین هخامنشی): قابِ زرین با یک جفت بالِ قلم‌زنی‌شدهٔ هما در بالای قاب و کنارِ کتیبه',
      '💚 رده ۴ (زمردیِ شاهانه): قابِ زمردِ سلطنتی با بال‌های دولایهٔ طلاکوب، یاقوتِ سرخِ مرکزی و هالهٔ زمردین',
    ],
    recommended: true,
  },
  {
    id: 3,
    nameFa: 'طرح ۱۰ (مدل ۳) — قابِ موزه‌ایِ «شیارهای تخت‌جمشید و گلِ نیلوفرِ دوازده‌پر»',
    subtitleFa: 'لبه‌های شیاردارِ ستونی در طرفینِ قاب، سرستون‌های ظریفِ نیلوفر در کنج‌ها و نیم‌ترنجِ تخت‌جمشید در بالا',
    ornamentStyleFa: 'شیارِ تخت‌جمشیدی و گلِ نیلوفر',
    descriptionFa:
      'الهام‌گرفته از ظرافتِ حجاری‌های تخت‌جمشید: ستون‌های باریکِ چپ و راستِ قاب دارای شیارهای موازیِ بسیار ظریف هستند که در چهار گوشه به غنچه‌های نیلوفر ختم می‌شوند. در بالای قاب، یک نیم‌ترنجِ دوازده‌پرِ نیلوفر با مخراج‌کاریِ جواهر نشسته است.',
    evolutionNotesFa: [
      '🔒 قفل: لوحِ خشتیِ شیاردار با مُهرِ قفلِ هخامنشی',
      '🧱 رده ۱ (سفالین): قابِ سفالین با شیارهای ستونیِ ظریف در طرفین و کتیبهٔ لوحی',
      '💠 رده ۲ (لعاب فیروزه): قابِ فیروزه با غنچه‌های نیلوفر در چهار کنج و جدولِ طلایی',
      '👑 رده ۳ (زرین هخامنشی): قابِ زرین با نیم‌ترنجِ گلِ نیلوفرِ دوازده‌پر در پیشانیِ کارت',
      '💚 رده ۴ (زمردیِ شاهانه): قابِ زمردِ تراش‌خورده با سرستون‌های زرین، قرصِ مهرِ یاقوت‌نشان و کتیبهٔ شاهنشاهی',
    ],
  },
  {
    id: 4,
    nameFa: 'طرح ۱۰ (مدل ۴) — قابِ موزه‌ایِ «مرقعِ تذهیب و سرلوحِ ترنجی»',
    subtitleFa: 'الهام‌گرفته از برگ‌های تذهیبِ شاهنامهٔ طهماسبی با جدول‌کشیِ دوبلِ زرین و کتیبهٔ سرترنج‌دار',
    ornamentStyleFa: 'جدولِ تذهیب و سرلوحِ ترنجی',
    descriptionFa:
      'طراحیِ بسیار اصیل و موزه‌ای به سبکِ مرقعاتِ خط و مینیاتور: درونِ قابِ اصلی، یک «جدول‌کشیِ دوبلِ طلایی» با فاصلهٔ ظریف روی تصویر کشیده شده که در چهار گوشه دارای لچکی‌های مینیاتوریِ دالبری است. کتیبهٔ شناورِ پایین نیز دارای دو «سرترنجِ برگیِ ظریف» در چپ و راست است.',
    evolutionNotesFa: [
      '🔒 قفل: قابِ خشتِ خام با جدولِ مینیاتوریِ حک‌شده',
      '🧱 رده ۱ (سفالین): قابِ سفالین با جدولِ تک‌خطی و کتیبهٔ سرترنج‌دارِ سمرقند',
      '💠 رده ۲ (لعاب فیروزه): قابِ فیروزه با جدولِ دوبلِ طلایی و لچکی‌های دالبریِ فیروزه‌نشان',
      '👑 رده ۳ (زرین هخامنشی): قابِ زرین با سرلوحِ ترنجیِ قلم‌زنی‌شده در بالای تصویر',
      '💚 رده ۴ (زمردیِ شاهانه): قابِ مینای زمرد و طلای کهن با سرلوحِ جواهرنشان و کتیبهٔ تذهیبِ سلطنتی',
    ],
    recommended: true,
  },
  {
    id: 5,
    nameFa: 'طرح ۱۰ (مدل ۵) — قابِ موزه‌ایِ «تراشِ جواهر و خانه‌بندیِ میناکاری (Cloisonné)»',
    subtitleFa: 'تراش‌های پخ‌خوردهٔ ساعت‌سازی و جواهرسازی روی لبهٔ قاب با مخراج‌کاریِ شش‌ضلعیِ هم‌سطح',
    ornamentStyleFa: 'تراشِ فستِ جواهر و میناکاری',
    descriptionFa:
      'مدرن‌ترین و لوکس‌ترین پرداختِ سرامیک و جواهر روی طرح شماره ۱۰: لبه‌های قاب دارای تراش‌های زاویه‌دارِ نوری (Faceted Bevel) هستند که نور را مثل سنگِ قیمتیِ تراش‌خورده بازتاب می‌دهند. نگین‌های چهارگوشه درونِ پایه‌های شش‌ضلعیِ طلایی کاملاً هم‌سطح با قاب مخراج‌کاری شده‌اند.',
    evolutionNotesFa: [
      '🔒 قفل: قابِ سنگیِ تراش‌خورده با مُهرِ شش‌ضلعیِ قفل',
      '🧱 رده ۱ (سفالین): قابِ سفالِ تراش‌خورده با پخ‌های نوری و پلاکِ سمرقند',
      '💠 رده ۲ (لعاب فیروزه): قابِ بلورینِ فیروزه با پایه‌های جواهرِ شش‌ضلعی در کنج‌ها',
      '👑 رده ۳ (زرین هخامنشی): قابِ شمشِ زرینِ تراش‌خورده با تاج‌نگینِ مارکیز در بالا',
      '💚 رده ۴ (زمردیِ شاهانه): قابِ زمردِ کریستالیِ چندوجهی با شبکه‌های طلاکوب و گوهرهای یاقوت و الماس',
    ],
  },
];

// Keep backwards-compatible export alias
export const FIVE_WINGED_MODELS = TEN_CLAY_CARD_MODELS;

interface StageRichPalette {
  tier: 0 | 1 | 2 | 3 | 4;
  labelFa: string;
  shortFa: string;
  // 3D Bottom Lip & Outer Stroke
  lipDark: string;
  outerStroke: string;
  // Main Frame Body Gradient (4 stops for rich metallic/ceramic sheen)
  frameStop1: string;
  frameStop2: string;
  frameStop3: string;
  frameStop4: string;
  // Inner Bevel / Filigree Metal Gradient (Gold / Bronze / Champagne)
  filigreeHi: string;
  filigreeMid: string;
  filigreeDark: string;
  // Secondary Enamel / Inlay Gradient
  inlayHi: string;
  inlayMid: string;
  inlayDark: string;
  // Faceted Primary Gemstone
  gemHi: string;
  gemMid: string;
  gemDeep: string;
  // Faceted Secondary Gemstone
  gem2Hi: string;
  gem2Mid: string;
  gem2Deep: string;
  // Samarkand Paper Cartouche
  paperTop: string;
  paperMid: string;
  paperBot: string;
  cartoucheBorder: string;
  cartoucheInnerRule: string;
  titleColor: string;
  subColor: string;
  // Bottom Tier Pill
  pillTop: string;
  pillBot: string;
  pillBorder: string;
  pillText: string;
  glow: string;
}

const STAGE_PALETTES: Record<0 | 1 | 2 | 3 | 4, StageRichPalette> = {
  // Stage 0: Locked Unfired Clay & Cast Bronze
  0: {
    tier: 0,
    labelFa: 'قفل (خشت خام)',
    shortFa: '🔒 قفل',
    lipDark: '#2E1E14',
    outerStroke: '#422C1E',
    frameStop1: '#AD947E',
    frameStop2: '#8C725D',
    frameStop3: '#6E5542',
    frameStop4: '#4F3B2C',
    filigreeHi: '#B8A08A',
    filigreeMid: '#8A715C',
    filigreeDark: '#574333',
    inlayHi: '#967E69',
    inlayMid: '#735C49',
    inlayDark: '#4D3B2C',
    gemHi: '#AD9884',
    gemMid: '#786452',
    gemDeep: '#4A3B2E',
    gem2Hi: '#9E8975',
    gem2Mid: '#6B5847',
    gem2Deep: '#423428',
    paperTop: '#E3D7C7',
    paperMid: '#CFC0AC',
    paperBot: '#B8A58E',
    cartoucheBorder: '#69513E',
    cartoucheInnerRule: '#9C846E',
    titleColor: '#3D2A1B',
    subColor: '#69513E',
    pillTop: '#735B47',
    pillBot: '#4D3A2B',
    pillBorder: '#A38B75',
    pillText: '#EFE5D8',
    glow: 'transparent',
  },

  // Stage 1: Kiln-Baked Nishapur Terracotta & Warm Copper-Bronze
  1: {
    tier: 1,
    labelFa: 'رده ۱ · سفالین',
    shortFa: '★ سفالین',
    lipDark: '#4A1F0D',
    outerStroke: '#5E2811',
    frameStop1: '#EEA984',
    frameStop2: '#CC7B52',
    frameStop3: '#A35430',
    frameStop4: '#753518',
    filigreeHi: '#F7C8A8',
    filigreeMid: '#C97B53',
    filigreeDark: '#824122',
    inlayHi: '#E0966E',
    inlayMid: '#AD5E38',
    inlayDark: '#6E3216',
    gemHi: '#FAD4B8',
    gemMid: '#C47046',
    gemDeep: '#783618',
    gem2Hi: '#F5C4A2',
    gem2Mid: '#B05D35',
    gem2Deep: '#692E12',
    paperTop: '#FFFDF9',
    paperMid: '#F9EEDC',
    paperBot: '#EBD6B7',
    cartoucheBorder: '#99502E',
    cartoucheInnerRule: '#D49B78',
    titleColor: '#2B1307',
    subColor: '#7D4527',
    pillTop: '#B86640',
    pillBot: '#823E1E',
    pillBorder: '#F2B896',
    pillText: '#FFF8EE',
    glow: 'rgba(204, 123, 82, 0.14)',
  },

  // Stage 2: Lustrous Nishapur Turquoise Glaze & Champagne-Bronze Bezel
  2: {
    tier: 2,
    labelFa: 'رده ۲ · لعاب فیروزه',
    shortFa: '★★ فیروزه',
    lipDark: '#093835',
    outerStroke: '#0D4F4B',
    frameStop1: '#68EDE4',
    frameStop2: '#26A69E',
    frameStop3: '#15756F',
    frameStop4: '#0B4A46',
    filigreeHi: '#F7DFAA',
    filigreeMid: '#CFA052',
    filigreeDark: '#825B1E',
    inlayHi: '#94F7F0',
    inlayMid: '#249991',
    inlayDark: '#0D524D',
    gemHi: '#B0FFF9',
    gemMid: '#1FB5AC',
    gemDeep: '#095954',
    gem2Hi: '#FCE5AC',
    gem2Mid: '#D49636',
    gem2Deep: '#7D500E',
    paperTop: '#FFFDF9',
    paperMid: '#F7EEDC',
    paperBot: '#E8D5B7',
    cartoucheBorder: '#167D76',
    cartoucheInnerRule: '#7CC7C1',
    titleColor: '#162927',
    subColor: '#146E68',
    pillTop: '#249E96',
    pillBot: '#105954',
    pillBorder: '#8CF5EE',
    pillText: '#FFFFFF',
    glow: 'rgba(38, 166, 158, 0.28)',
  },

  // Stage 3: Burnished 24k Achaemenid Gold & Lapis-Turquoise Accents
  3: {
    tier: 3,
    labelFa: 'رده ۳ · زرین هخامنشی',
    shortFa: '★★★ زرین',
    lipDark: '#422405',
    outerStroke: '#5E3408',
    frameStop1: '#FFF2B8',
    frameStop2: '#EBB13B',
    frameStop3: '#BD7E14',
    frameStop4: '#804E06',
    filigreeHi: '#FFF8D6',
    filigreeMid: '#E5AA34',
    filigreeDark: '#8C5908',
    inlayHi: '#FFE596',
    inlayMid: '#C98718',
    inlayDark: '#734505',
    gemHi: '#9EFFF8',
    gemMid: '#22A39B',
    gemDeep: '#0B4F4B',
    gem2Hi: '#FFF5C2',
    gem2Mid: '#E3A029',
    gem2Deep: '#855306',
    paperTop: '#FFFEF9',
    paperMid: '#FAF0DA',
    paperBot: '#EDD7B2',
    cartoucheBorder: '#B57914',
    cartoucheInnerRule: '#E5BE6E',
    titleColor: '#261204',
    subColor: '#8C580B',
    pillTop: '#E5A832',
    pillBot: '#99620C',
    pillBorder: '#FFF2B8',
    pillText: '#241004',
    glow: 'rgba(235, 177, 59, 0.34)',
  },

  // Stage 4: Deep Royal Emerald Enamel + Heavy 3D Sculpted Antique Gold Filigree & Crimson Ruby
  // (100% distinct from Stage 3's Gold Frame!)
  4: {
    tier: 4,
    labelFa: 'رده ۴ · زمردیِ شاهانه (اوج شکوه)',
    shortFa: '★★★★ زمردِ شاهانه',
    lipDark: '#042619',
    outerStroke: '#073D29',
    frameStop1: '#42EBAC',
    frameStop2: '#129666',
    frameStop3: '#096341',
    frameStop4: '#043622',
    filigreeHi: '#FFF3BD',
    filigreeMid: '#E5AA36',
    filigreeDark: '#8F5C0A',
    inlayHi: '#78F7C6',
    inlayMid: '#128C5F',
    inlayDark: '#053D27',
    gemHi: '#FF9E94',
    gemMid: '#D92B2B',
    gemDeep: '#6E0B0B',
    gem2Hi: '#96FFDA',
    gem2Mid: '#14AD75',
    gem2Deep: '#054A30',
    paperTop: '#FFFEF9',
    paperMid: '#FBF0D9',
    paperBot: '#EED6AC',
    cartoucheBorder: '#D49826',
    cartoucheInnerRule: '#199E6D',
    titleColor: '#0A291C',
    subColor: '#0E754F',
    pillTop: '#128F61',
    pillBot: '#06472E',
    pillBorder: '#FAD878',
    pillText: '#FFFDF7',
    glow: 'rgba(20, 173, 117, 0.46)',
  },
};

export interface WingedClayBadgeProps {
  designId: number;
  tier?: 0 | 1 | 2 | 3 | 4;
  titleFa?: string;
  subtitleFa?: string;
  badgeTextFa?: string;
  avatarUrl?: string | null;
  fallbackIcon?: string;
  accentColor?: string;
  progressPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
}

/**
 * Renders a multi-faceted luxury gemstone inside a sculpted metallic bezel (`گوهرِ چندوجهی با مخراج‌کاری طلایی`).
 */
const renderFacetedJewel = (
  cx: number,
  cy: number,
  r: number,
  uid: string,
  p: StageRichPalette,
  variant: 'primary' | 'secondary' = 'primary',
  shape: 'octagon' | 'diamond' | 'oval' = 'octagon',
) => {
  const hi = variant === 'primary' ? p.gemHi : p.gem2Hi;
  const mid = variant === 'primary' ? p.gemMid : p.gem2Mid;
  const deep = variant === 'primary' ? p.gemDeep : p.gem2Deep;

  if (shape === 'diamond') {
    return (
      <g>
        {/* Outer Gold Prong Bezel */}
        <polygon
          points={`${cx},${cy - r * 1.35} ${cx + r * 1.35},${cy} ${cx},${cy + r * 1.35} ${cx - r * 1.35},${cy}`}
          fill={`url(#${uid}-filigree)`}
          stroke={p.lipDark}
          strokeWidth="1"
        />
        {/* Deep Gem Body */}
        <polygon
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
          fill={deep}
        />
        {/* Upper Crown Facet */}
        <polygon
          points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy} ${cx - r},${cy}`}
          fill={mid}
        />
        {/* Inner Table Facet */}
        <polygon
          points={`${cx},${cy - r * 0.55} ${cx + r * 0.55},${cy} ${cx},${cy + r * 0.55} ${cx - r * 0.55},${cy}`}
          fill={hi}
          opacity="0.85"
        />
        {/* Specular Glint */}
        <circle cx={cx - r * 0.22} cy={cy - r * 0.25} r={r * 0.2} fill="#FFFFFF" opacity="0.9" />
      </g>
    );
  }

  return (
    <g>
      {/* Sculpted Bezel Cup */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 1.6}
        fill={`url(#${uid}-filigree)`}
        stroke={p.lipDark}
        strokeWidth="1"
      />
      {/* Deep Gem Base */}
      <circle cx={cx} cy={cy} r={r} fill={deep} />
      {/* Mid Facet */}
      <circle cx={cx} cy={cy} r={r * 0.82} fill={mid} />
      {/* Faceted Octagon Table */}
      <polygon
        points={`${cx - r * 0.35},${cy - r * 0.55} ${cx + r * 0.35},${cy - r * 0.55} ${cx + r * 0.55},${cy - r * 0.2} ${cx + r * 0.55},${cy + r * 0.25} ${cx + r * 0.25},${cy + r * 0.5} ${cx - r * 0.25},${cy + r * 0.5} ${cx - r * 0.55},${cy + r * 0.25} ${cx - r * 0.55},${cy - r * 0.2}`}
        fill={hi}
        opacity="0.55"
      />
      {/* Top-Left Specular Glint */}
      <ellipse
        cx={cx - r * 0.25}
        cy={cy - r * 0.28}
        rx={r * 0.32}
        ry={r * 0.18}
        transform={`rotate(-30 ${cx - r * 0.25} ${cy - r * 0.28})`}
        fill="#FFFFFF"
        opacity="0.92"
      />
    </g>
  );
};

export const WingedClayBadge: React.FC<WingedClayBadgeProps> = ({
  designId,
  tier = 4,
  titleFa = 'رستم دستان',
  subtitleFa = 'شاهنامه فردوسی',
  badgeTextFa,
  avatarUrl = '/images/covers/rostam_7.svg',
  fallbackIcon = '🦁',
  size = 'md',
  selected = false,
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const p = STAGE_PALETTES[tier];
  const uid = `m10-v${designId}-t${tier}-${titleFa.replace(/\s+/g, '')}`;
  const isLocked = tier === 0;
  const effectiveBadgeText = badgeTextFa || p.shortFa;

  const sizeClass =
    size === 'sm'
      ? 'w-[142px] h-[198px]'
      : size === 'lg'
        ? 'w-[242px] h-[336px]'
        : 'w-[180px] h-[250px]';

  // Full-Bleed Museum Art Window (occupies ~76% of the card height)
  const artWindowPath =
    'M15,32 C15,20 23,14 35,14 L145,14 C157,14 165,20 165,32 L165,178 C165,188 157,194 145,194 L35,194 C23,194 15,188 15,178 Z';

  /**
   * Renders the crystalline emerald facets & gold guilloché pattern on the outer frame
   * so that Tier 4 (`زمردیِ شاهانه`) and Tier 2 (`لعاب فیروزه`) have unmistakable surface luxury.
   */
  const renderFrameSurfaceLuxury = () => {
    if (tier === 0) return null;

    return (
      <g pointerEvents="none">
        {/* Tier 4 Crystalline Emerald Facet Reflections & Gold Filigree Ribs on the Frame */}
        {tier === 4 && (
          <g opacity="0.55">
            {/* Diagonal Crystalline Emerald Light Bands across the frame bezel */}
            <path d="M8,36 L44,7 L68,7 L8,58 Z" fill="url(#emerald-sheen)" />
            <path d="M172,44 L118,92 L172,72 Z" fill={p.frameStop1} opacity="0.35" />
            <path d="M8,140 L32,120 L8,168 Z" fill={p.frameStop1} opacity="0.35" />
            <path d="M132,238 L172,196 L172,222 L152,238 Z" fill={p.frameStop1} opacity="0.4" />
            {/* Gold Cloisonné Divider Ribs on the Frame Rails */}
            {[56, 96, 136].map((y) => (
              <g key={y}>
                <line x1="6.5" y1={y} x2="15" y2={y} stroke={p.filigreeHi} strokeWidth="1.4" />
                <line x1="165" y1={y} x2="173.5" y2={y} stroke={p.filigreeHi} strokeWidth="1.4" />
              </g>
            ))}
          </g>
        )}

        {/* Tier 2 Turquoise Glaze Crazing / Tile Shimmer */}
        {tier === 2 && (
          <g opacity="0.38">
            <path d="M10,30 L38,8 L56,8 L10,48 Z" fill="#B8FFF9" />
            <path d="M140,238 L172,206 L172,224 L156,238 Z" fill="#B8FFF9" />
          </g>
        )}

        {/* Tier 3 & Tier 4 Sassanian Micro-Beading / Gold Rope Rule along the inner bezel */}
        {tier >= 3 && (
          <rect
            x="11.5"
            y="10.5"
            width="157"
            height="223"
            rx="22"
            fill="none"
            stroke={p.filigreeHi}
            strokeWidth="1.2"
            strokeDasharray={designId === 2 ? '2 3.5' : '6 3'}
            opacity="0.82"
          />
        )}
      </g>
    );
  };

  /**
   * Renders the 5 distinct, high-class, contour-hugging Frame Ornaments (`المنت‌های آرتِ باکلاس و پرجزئیات`)
   * based on Card #10's Full-Bleed Museum Frame.
   */
  const renderHighClassFrameOrnaments = () => {
    if (isLocked) return null;

    // Inner Illuminated Golden Jadval Rule inside the portrait window (Tier 2+)
    const innerJadval = tier >= 2 && (
      <rect
        x="19"
        y="18"
        width="142"
        height="170"
        rx="14"
        fill="none"
        stroke={tier === 4 ? p.filigreeHi : p.filigreeMid}
        strokeWidth={tier >= 3 ? '1.2' : '0.9'}
        strokeOpacity={tier >= 3 ? '0.8' : '0.55'}
      />
    );

    // =========================================================================
    // VARIATION 1: Royal Islimi Filigree Corners & Octagonal Emerald-Cut Keystone
    // =========================================================================
    if (designId === 1) {
      return (
        <g>
          {innerJadval}

          {/* Contour-Hugging Islimi Filigree Corner Brackets (`لچکی‌های منحنیِ اسلیمی هم‌تراز با انحنای قاب`) */}
          {tier >= 2 &&
            [
              { tx: 0, ty: 0, sx: 1, sy: 1 },
              { tx: 180, ty: 0, sx: -1, sy: 1 },
            ].map((tr, i) => (
              <g
                key={i}
                transform={`translate(${tr.tx}, ${tr.ty}) scale(${tr.sx}, ${tr.sy})`}
              >
                {/* Outer Curved Islimi Bracket hugging rx=20 */}
                <path
                  d="M14,48 C14,24 24,14 48,14 L54,14 C40,18 32,24 28,32 C24,40 18,44 14,54 Z"
                  fill={`url(#${uid}-filigree)`}
                  stroke={p.lipDark}
                  strokeWidth="1.2"
                />
                {/* Inner Delicate Islimi Spiral Volute */}
                {tier >= 3 && (
                  <path
                    d="M19,40 C20,26 26,20 40,19 C33,23 29,28 29,34 C29,38 25,40 22,38"
                    fill="none"
                    stroke={p.lipDark}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                )}
                {/* Corner Faceted Gem */}
                {tier >= 3 &&
                  renderFacetedJewel(
                    25,
                    25,
                    tier === 4 ? 3.8 : 3,
                    uid,
                    p,
                    tier === 4 ? 'secondary' : 'primary',
                    'diamond',
                  )}
              </g>
            ))}

          {/* Top-Center Low-Profile Octagonal Emerald-Cut Royal Clasp (`تاج‌نگینِ هشت‌وجهی در کمانِ بالای قاب`) */}
          {tier >= 2 && (
            <g>
              {/* Filigree Side Scrolls hugging the top edge (y=14) */}
              {tier >= 3 && (
                <path
                  d="M52,14 C64,8 76,6 90,6 C104,6 116,8 128,14 C118,20 104,22 90,22 C76,22 62,20 52,14 Z"
                  fill={`url(#${uid}-filigree)`}
                  stroke={p.lipDark}
                  strokeWidth="1.4"
                />
              )}
              {/* Inner Enamel Bed */}
              {tier === 4 && (
                <path
                  d="M60,14 C70,10 80,8 90,8 C100,8 110,10 120,14 C112,18 100,19 90,19 C80,19 68,18 60,14 Z"
                  fill={`url(#${uid}-inlay)`}
                  stroke={p.filigreeHi}
                  strokeWidth="0.9"
                />
              )}
              {/* Central Octagonal Jewel Setting */}
              {renderFacetedJewel(90, 14, tier === 4 ? 5.8 : tier === 3 ? 4.8 : 3.8, uid, p, 'primary', 'octagon')}
              {tier === 4 && (
                <>
                  {renderFacetedJewel(72, 14, 3, uid, p, 'secondary', 'diamond')}
                  {renderFacetedJewel(108, 14, 3, uid, p, 'secondary', 'diamond')}
                </>
              )}
            </g>
          )}
        </g>
      );
    }

    // =========================================================================
    // VARIATION 2: Sleek Homa-Wing Filigree & Sassanian Pearl-Collar
    // =========================================================================
    if (designId === 2) {
      return (
        <g>
          {innerJadval}

          {/* Top Sleek Horizontal Homa Wings hugging the upper frame rim */}
          {tier >= 2 && (
            <g>
              {[1, -1].map((dir) => (
                <g
                  key={dir}
                  transform={dir === -1 ? 'translate(180, 0) scale(-1, 1)' : undefined}
                >
                  {/* Primary Outer Sleek Wing Feather hugging top bar */}
                  <path
                    d="M90,14 C106,8 126,8 144,13 C140,18 128,20 114,20 C104,20 96,18 90,16 Z"
                    fill={`url(#${uid}-filigree)`}
                    stroke={p.lipDark}
                    strokeWidth="1.2"
                  />
                  {/* Second Layered Feather (Tier 3+) */}
                  {tier >= 3 && (
                    <path
                      d="M92,16 C106,13 122,14 134,18 C128,22 116,23 104,22 C98,21 94,19 92,16 Z"
                      fill={tier === 4 ? `url(#${uid}-inlay)` : `url(#${uid}-filigree)`}
                      stroke={p.lipDark}
                      strokeWidth="1.1"
                    />
                  )}
                  {/* Third Inner Feather + Feather Quill Lines (Tier 4) */}
                  {tier === 4 && (
                    <path
                      d="M94,18 C104,17 114,18 122,22 C116,25 106,25 98,23 Z"
                      fill={`url(#${uid}-filigree)`}
                      stroke={p.lipDark}
                      strokeWidth="1"
                    />
                  )}
                </g>
              ))}

              {/* Central Sassanian Crescent & Jewel clasping the Homa wings */}
              <path
                d="M78,16 C82,22 86,24 90,24 C94,24 98,22 102,16 C98,19 94,20 90,20 C86,20 82,19 78,16 Z"
                fill={`url(#${uid}-filigree)`}
                stroke={p.lipDark}
                strokeWidth="1.1"
              />
              {renderFacetedJewel(90, 14, tier === 4 ? 5.5 : 4.2, uid, p, 'primary', 'octagon')}
            </g>
          )}

          {/* Upper Corner Pearl Rosettes (Tier 3+) */}
          {tier >= 3 && (
            <>
              {renderFacetedJewel(23, 23, 3.2, uid, p, 'secondary', 'octagon')}
              {renderFacetedJewel(157, 23, 3.2, uid, p, 'secondary', 'octagon')}
            </>
          )}
        </g>
      );
    }

    // =========================================================================
    // VARIATION 3: Persepolis Micro-Fluted Columns & 12-Petal Lotus Arch
    // =========================================================================
    if (designId === 3) {
      return (
        <g>
          {innerJadval}

          {/* Fine Vertical Persepolis Column Fluting on Left & Right Rails */}
          {[14, 160].map((x, idx) => (
            <g key={idx}>
              <rect
                x={x}
                y="34"
                width="6"
                height="112"
                rx="3"
                fill={`url(#${uid}-filigree)`}
                stroke={p.lipDark}
                strokeWidth="1"
              />
              {/* Lotus Capital at top of side rail */}
              {tier >= 2 && (
                <path
                  d={`M${x - 2},26 L${x + 8},26 L${x + 6},35 L${x},35 Z`}
                  fill={tier === 4 ? `url(#${uid}-inlay)` : `url(#${uid}-filigree)`}
                  stroke={p.lipDark}
                  strokeWidth="1.1"
                />
              )}
              {tier >= 3 &&
                renderFacetedJewel(x + 3, 23, 2.8, uid, p, 'secondary', 'octagon')}
            </g>
          ))}

          {/* Top 12-Petal Persepolis Lotus Fan (`نیم‌ترنجِ گلِ نیلوفرِ تخت‌جمشید`) */}
          {tier >= 2 && (
            <g>
              <path
                d="M62,14 C70,7 80,5 90,5 C100,5 110,7 118,14 C112,21 102,24 90,24 C78,24 68,21 62,14 Z"
                fill={`url(#${uid}-filigree)`}
                stroke={p.lipDark}
                strokeWidth="1.4"
              />
              {/* Sculpted Lotus Petals */}
              {[-18, -9, 0, 9, 18].map((dx, i) => (
                <path
                  key={i}
                  d={`M90,14 L${86 + dx},22 L${90 + dx * 1.1},24 L${94 + dx},22 Z`}
                  fill={i % 2 === 0 ? p.filigreeHi : p.inlayMid}
                  stroke={p.lipDark}
                  strokeWidth="0.8"
                />
              ))}
              {renderFacetedJewel(90, 13, tier === 4 ? 5 : 4, uid, p, 'primary', 'octagon')}
            </g>
          )}
        </g>
      );
    }

    // =========================================================================
    // VARIATION 4: Illuminated Manuscript Jadval & Sar-Louh Toranj Header
    // =========================================================================
    if (designId === 4) {
      return (
        <g>
          {/* Double Illuminated Manuscript Jadval Rule */}
          <rect
            x="19"
            y="18"
            width="142"
            height="170"
            rx="13"
            fill="none"
            stroke={p.filigreeHi}
            strokeWidth="1.4"
          />
          {tier >= 2 && (
            <rect
              x="22"
              y="21"
              width="136"
              height="164"
              rx="11"
              fill="none"
              stroke={tier === 4 ? p.inlayHi : p.filigreeMid}
              strokeWidth="0.9"
              strokeDasharray="4 2"
            />
          )}

          {/* Scalloped Safavid Corner Spandrels inside the Jadval (Tier 2+) */}
          {tier >= 2 &&
            [
              { tx: 0, ty: 0, sx: 1, sy: 1 },
              { tx: 180, ty: 0, sx: -1, sy: 1 },
            ].map((tr, i) => (
              <g
                key={i}
                transform={`translate(${tr.tx}, ${tr.ty}) scale(${tr.sx}, ${tr.sy})`}
              >
                <path
                  d="M19,18 L48,18 C42,24 38,28 32,32 C28,38 24,42 19,48 Z"
                  fill={tier === 4 ? `url(#${uid}-inlay)` : `url(#${uid}-filigree)`}
                  stroke={p.filigreeHi}
                  strokeWidth="1.2"
                />
                {tier >= 3 &&
                  renderFacetedJewel(27, 26, 3, uid, p, 'secondary', 'diamond')}
              </g>
            ))}

          {/* Sleek Toranj Sar-Louh Header at Top of Jadval (Tier 3+) */}
          {tier >= 3 && (
            <g>
              <path
                d="M54,18 C66,10 78,8 90,8 C102,8 114,10 126,18 C114,24 102,26 90,26 C78,26 66,24 54,18 Z"
                fill={`url(#${uid}-filigree)`}
                stroke={p.lipDark}
                strokeWidth="1.3"
              />
              {renderFacetedJewel(90, 17, tier === 4 ? 5 : 4, uid, p, 'primary', 'diamond')}
            </g>
          )}
        </g>
      );
    }

    // =========================================================================
    // VARIATION 5: Faceted Bevel-Armor & Cloisonné Hexagonal Jewel Sockets
    // =========================================================================
    return (
      <g>
        {innerJadval}

        {/* Chamfered Watchmaker/Jewelry Bevel Lines in the 4 Corners */}
        {tier >= 2 &&
          [
            [22, 22],
            [158, 22],
            [22, 224],
            [158, 224],
          ].map(([cx, cy], idx) => {
            if (tier === 2 && idx >= 2) return null;
            return (
              <g key={idx}>
                {renderFacetedJewel(
                  cx,
                  cy,
                  tier === 4 ? 4.2 : 3.4,
                  uid,
                  p,
                  idx < 2 ? 'primary' : 'secondary',
                  'diamond',
                )}
              </g>
            );
          })}

        {/* Sleek Faceted Chevron-Keystone Bar at Top Center (Tier 3+) */}
        {tier >= 3 && (
          <g>
            <polygon
              points="58,12 90,6 122,12 114,21 90,24 66,21"
              fill={`url(#${uid}-filigree)`}
              stroke={p.lipDark}
              strokeWidth="1.4"
            />
            {tier === 4 && (
              <polygon
                points="66,13 90,8.5 114,13 108,19 90,21.5 72,19"
                fill={`url(#${uid}-inlay)`}
                stroke={p.filigreeHi}
                strokeWidth="0.9"
              />
            )}
            {renderFacetedJewel(90, 15, tier === 4 ? 5 : 4, uid, p, 'primary', 'diamond')}
          </g>
        )}
      </g>
    );
  };

  /**
   * Renders the Floating Samarkand Cartouche (`کتیبهٔ سه‌بعدیِ شناور روی پایینِ تصویر`)
   * with progressive filigree side-brackets, double inner rules, and a jewel-set Tier Seal.
   */
  const renderLuxuryFloatingCartouche = () => {
    const cyTop = 152;
    const cHeight = 54;

    // 5 subtle cartouche silhouette variations matching the 5 models:
    // Chamfered 8-corner (1), Ogee Wing-Scroll (2), Stepped Persepolis (3), Toranj-End (4), Faceted Shield (5)
    const getCartouchePath = (inset = 0) => {
      const L = 19 + inset;
      const R = 161 - inset;
      const T = cyTop + inset;
      const B = cyTop + cHeight - inset;
      const c = Math.max(4, 9 - inset * 0.6);

      if (designId === 1 || designId === 5) {
        // Aristocratic 8-corner chamfered Persian tablet
        return `M${L + c},${T} L${R - c},${T} L${R},${T + c} L${R},${B - c} L${R - c},${B} L${L + c},${B} L${L},${B - c} L${L},${T + c} Z`;
      }
      if (designId === 3) {
        // Stepped Persepolis inscription tablet
        return `M${L + 6},${T} L${R - 6},${T} L${R - 6},${T + 5} L${R},${T + 5} L${R},${B - 5} L${R - 6},${B - 5} L${R - 6},${B} L${L + 6},${B} L${L + 6},${B - 5} L${L},${B - 5} L${L},${T + 5} L${L + 6},${T + 5} Z`;
      }
      // Smooth rounded royal cartouche (Models 2 & 4)
      return `M${L + 12},${T} L${R - 12},${T} C${R - 4},${T} ${R},${T + 5} ${R},${T + 12} L${R},${B - 12} C${R},${B - 5} ${R - 4},${B} ${R - 12},${B} L${L + 12},${B} C${L + 4},${B} ${L},${B - 5} ${L},${B - 12} L${L},${T + 12} C${L},${T + 5} ${L + 4},${T} ${L + 12},${T} Z`;
    };

    return (
      <g>
        {/* 1. Ambient Shadow under the Floating Cartouche */}
        <path
          d={getCartouchePath(0)}
          fill="rgba(12, 5, 2, 0.55)"
          transform="translate(0, 4.5)"
        />

        {/* 2. Progressive Side Filigree / Wing-Clasp Brackets (`گوشواره‌های قلم‌زنی‌شده در دو سوی کتیبه`) */}
        {tier >= 3 && (
          <>
            {[1, -1].map((dir) => (
              <g
                key={dir}
                transform={dir === -1 ? 'translate(180, 0) scale(-1, 1)' : undefined}
              >
                {/* Sleek Contour-Hugging Side Wing/Scroll clasping the cartouche edge */}
                <path
                  d="M22,154 C12,150 9,140 15,132 C19,138 23,144 26,152 Z"
                  fill={`url(#${uid}-filigree)`}
                  stroke={p.lipDark}
                  strokeWidth="1.2"
                />
                {tier === 4 && (
                  <path
                    d="M20,164 C10,160 8,150 13,142 C17,148 21,154 23,160 Z"
                    fill={`url(#${uid}-inlay)`}
                    stroke={p.filigreeHi}
                    strokeWidth="1"
                  />
                )}
              </g>
            ))}
          </>
        )}

        {/* 3. Outer Metallic / Glazed Bezel of the Floating Cartouche */}
        <path
          d={getCartouchePath(0)}
          fill={`url(#${uid}-filigree)`}
          stroke={p.lipDark}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* 4. Inner Samarkand Cream Parchment Tablet */}
        <path
          d={getCartouchePath(2.8)}
          fill={`url(#${uid}-paper)`}
          stroke={p.cartoucheBorder}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* 5. Delicate Inner Illuminated Hairline Rule (`جدولِ مینیاتوریِ درونِ کتیبه`) */}
        {tier >= 2 && (
          <path
            d={getCartouchePath(5.2)}
            fill="none"
            stroke={p.cartoucheInnerRule}
            strokeWidth="0.9"
            strokeLinejoin="round"
            opacity="0.85"
          />
        )}

        {/* 6. Left & Right Jewel Bosses on the Cartouche */}
        {tier >= 1 && (
          <>
            {renderFacetedJewel(
              27,
              cyTop + cHeight / 2,
              tier >= 3 ? 3.6 : 2.8,
              uid,
              p,
              tier === 4 ? 'secondary' : 'primary',
              designId === 4 || designId === 5 ? 'diamond' : 'octagon',
            )}
            {renderFacetedJewel(
              153,
              cyTop + cHeight / 2,
              tier >= 3 ? 3.6 : 2.8,
              uid,
              p,
              tier === 4 ? 'secondary' : 'primary',
              designId === 4 || designId === 5 ? 'diamond' : 'octagon',
            )}
          </>
        )}

        {/* 7. Top-Center Mini Crest on the Cartouche Upper Rim (Tier 3+) */}
        {tier >= 3 && (
          <g>
            <path
              d={`M74,${cyTop} L90,${cyTop - 5.5} L106,${cyTop} L98,${cyTop + 3.5} L82,${cyTop + 3.5} Z`}
              fill={`url(#${uid}-filigree)`}
              stroke={p.lipDark}
              strokeWidth="1.1"
            />
            {renderFacetedJewel(90, cyTop - 1, tier === 4 ? 3.2 : 2.5, uid, p, 'primary', 'diamond')}
          </g>
        )}

        {/* 8. Crisp Hero Title & Subtitle + Subtle Divider Line */}
        <text
          x="90"
          y={cyTop + 21}
          textAnchor="middle"
          fill={p.titleColor}
          fontSize="13.5"
          fontWeight="900"
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {isLocked ? 'لوحِ مهروموم‌شده' : titleFa}
        </text>

        {/* Fine Calligraphy Divider with Center Diamond */}
        <line
          x1="50"
          y1={cyTop + 27.5}
          x2="130"
          y2={cyTop + 27.5}
          stroke={p.cartoucheInnerRule}
          strokeWidth="0.8"
          opacity="0.7"
        />
        <polygon
          points={`90,${cyTop + 25.5} 92.5,${cyTop + 27.5} 90,${cyTop + 29.5} 87.5,${cyTop + 27.5}`}
          fill={p.cartoucheBorder}
        />

        <text
          x="90"
          y={cyTop + 40}
          textAnchor="middle"
          fill={p.subColor}
          fontSize="9.2"
          fontWeight="800"
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {subtitleFa}
        </text>

        {/* 9. Bottom Jewel-Set Tier Seal Capsule (`نشانِ مخراج‌کاری‌شدهٔ رده در لبهٔ زیرین`) */}
        <rect
          x="42"
          y="214"
          width="96"
          height="20"
          rx="10"
          fill={p.lipDark}
          transform="translate(0, 2.2)"
        />
        <rect
          x="42"
          y="214"
          width="96"
          height="20"
          rx="10"
          fill={`url(#${uid}-pill)`}
          stroke={p.pillBorder}
          strokeWidth="1.5"
        />
        <text
          x="90"
          y="227.5"
          textAnchor="middle"
          fill={p.pillText}
          fontSize="9.2"
          fontWeight="900"
          style={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {effectiveBadgeText}
        </text>
      </g>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-all duration-200 ${sizeClass} ${
        onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-97' : ''
      }`}
      style={{
        filter: selected
          ? 'drop-shadow(0 14px 24px rgba(20, 173, 117, 0.45))'
          : 'drop-shadow(0 10px 18px rgba(38, 16, 6, 0.32))',
      }}
    >
      <svg viewBox="0 0 180 250" className="w-full h-full overflow-visible">
        <defs>
          {/* Main 4-Stop Ceramic / Gold / Emerald Frame Gradient */}
          <linearGradient id={`${uid}-frame`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.frameStop1} />
            <stop offset="38%" stopColor={p.frameStop2} />
            <stop offset="78%" stopColor={p.frameStop3} />
            <stop offset="100%" stopColor={p.frameStop4} />
          </linearGradient>

          {/* Sculpted Gold / Bronze Filigree Gradient */}
          <linearGradient id={`${uid}-filigree`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.filigreeHi} />
            <stop offset="52%" stopColor={p.filigreeMid} />
            <stop offset="100%" stopColor={p.filigreeDark} />
          </linearGradient>

          {/* Secondary Enamel / Emerald Inlay Gradient */}
          <linearGradient id={`${uid}-inlay`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.inlayHi} />
            <stop offset="55%" stopColor={p.inlayMid} />
            <stop offset="100%" stopColor={p.inlayDark} />
          </linearGradient>

          {/* Samarkand Cream Paper Cartouche Gradient */}
          <linearGradient id={`${uid}-paper`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.paperTop} />
            <stop offset="58%" stopColor={p.paperMid} />
            <stop offset="100%" stopColor={p.paperBot} />
          </linearGradient>

          {/* Bottom Tier Pill Gradient */}
          <linearGradient id={`${uid}-pill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.pillTop} />
            <stop offset="100%" stopColor={p.pillBot} />
          </linearGradient>

          <linearGradient id="emerald-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(160, 255, 220, 0.55)" />
            <stop offset="100%" stopColor="rgba(160, 255, 220, 0)" />
          </linearGradient>

          <clipPath id={`${uid}-art-clip`}>
            <path d={artWindowPath} />
          </clipPath>
        </defs>

        {/* 0. Ambient Aura for Tier 3 (Gold) & Tier 4 (Royal Emerald) */}
        {tier >= 3 && (
          <rect
            x="3"
            y="3"
            width="174"
            height="242"
            rx="28"
            fill={p.glow}
            style={{ filter: 'blur(11px)' }}
          />
        )}

        {/* 1. 3D EXTRUDED PHYSICAL BASE LIP (`ضخامتِ سه‌بعدیِ زیرِ کارت`) */}
        <rect
          x="6"
          y="12"
          width="168"
          height="232"
          rx="25"
          fill={p.lipDark}
        />

        {/* 2. MAIN OUTER SCULPTED FRAME BODY (Clay -> Turquoise -> Gold -> Royal Emerald) */}
        <rect
          x="6"
          y="6"
          width="168"
          height="232"
          rx="25"
          fill={`url(#${uid}-frame)`}
          stroke={p.outerStroke}
          strokeWidth="2.4"
        />

        {/* Outer Gold Filigree Rim for Tier 4 (`زهوارِ طلاکوبِ دورِ قابِ زمردی در رده ۴`) */}
        {tier === 4 && (
          <rect
            x="7.5"
            y="7.5"
            width="165"
            height="229"
            rx="23.5"
            fill="none"
            stroke={`url(#${uid}-filigree)`}
            strokeWidth="2"
          />
        )}

        {/* Top Specular Ceramic/Crystal Highlight */}
        <path
          d="M28,9.5 L152,9.5"
          stroke="rgba(255, 255, 255, 0.62)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 3. SURFACE LUXURY DETAILS ON THE FRAME (Emerald Crystalline Facets / Beading) */}
        {renderFrameSurfaceLuxury()}

        {/* 4. FULL-BLEED MUSEUM ARTWORK WINDOW (`پنجرهٔ بزرگِ نمایش تصویر قهرمان`) */}
        <path
          d={artWindowPath}
          fill={isLocked ? p.paperBot : '#1C0E07'}
          stroke={p.lipDark}
          strokeWidth="2.4"
        />

        {isLocked ? (
          <g clipPath={`url(#${uid}-art-clip)`}>
            {/* Subtle Engraved Sun-Wheel on Unfired Clay */}
            <circle cx="90" cy="94" r="54" fill="none" stroke={p.outerStroke} strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
            <circle cx="90" cy="94" r="38" fill="none" stroke={p.outerStroke} strokeWidth="1.2" opacity="0.4" />
            {/* Sculpted Bronze & Clay Cylinder-Seal Lock Medallion */}
            <circle cx="90" cy="94" r="24" fill={`url(#${uid}-frame)`} stroke={p.outerStroke} strokeWidth="2.2" />
            <circle cx="90" cy="94" r="18" fill={p.paperMid} stroke={p.outerStroke} strokeWidth="1.2" />
            <text x="90" y="102" textAnchor="middle" fontSize="22">
              🔒
            </text>
          </g>
        ) : avatarUrl && !imgError ? (
          <g clipPath={`url(#${uid}-art-clip)`}>
            <image
              href={avatarUrl}
              x="14"
              y="12"
              width="152"
              height="184"
              preserveAspectRatio="xMidYMid slice"
              onError={() => setImgError(true)}
            />
            {/* Museum Vignette Shadow around the inside of the Portrait Window */}
            <path
              d={artWindowPath}
              fill="none"
              stroke="rgba(20, 8, 2, 0.45)"
              strokeWidth="7"
            />
            {/* Soft Upper Crystal Glaze Reflection */}
            <ellipse
              cx="90"
              cy="22"
              rx="56"
              ry="12"
              fill="rgba(255, 255, 255, 0.20)"
            />
          </g>
        ) : (
          <g clipPath={`url(#${uid}-art-clip)`}>
            <text x="90" y="106" textAnchor="middle" fontSize="46">
              {fallbackIcon}
            </text>
          </g>
        )}

        {/* Crisp Metallic Inner Rim around the Portrait Window */}
        <path
          d={artWindowPath}
          fill="none"
          stroke={`url(#${uid}-filigree)`}
          strokeWidth={tier >= 3 ? '2.6' : '1.8'}
        />

        {/* 5. HIGH-CLASS CONTOUR-HUGGING FRAME ORNAMENTS (Models 1..5) */}
        {renderHighClassFrameOrnaments()}

        {/* 6. FLOATING 3D SAMARKAND CARTOUCHE & TIER SEAL */}
        {renderLuxuryFloatingCartouche()}
      </svg>

      {selected && (
        <div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-[#FFF8EA]"
          style={{ background: 'linear-gradient(180deg, #14AD75 0%, #075E3E 100%)' }}
        >
          <Check size={14} className="text-white stroke-[3]" />
        </div>
      )}
    </div>
  );
};

// Backwards-compatible alias
export const ClayCardPrototype = WingedClayBadge;

interface ClayCardDesignLabModalProps {
  onClose: () => void;
  onSelectDesign?: (designId: number) => void;
}

const SAMPLE_HEROES: Array<{
  id: string;
  titleFa: string;
  subtitleFa: string;
  avatarUrl: string;
  fallbackIcon: string;
}> = [
  {
    id: 'rostam',
    titleFa: 'رستم دستان',
    subtitleFa: 'شاهنامه فردوسی',
    avatarUrl: '/images/covers/rostam_7.svg',
    fallbackIcon: '🦁',
  },
  {
    id: 'siavash',
    titleFa: 'سیاوش پاک‌نهاد',
    subtitleFa: 'آزمون آتش',
    avatarUrl: '/images/covers/siavoshan.svg',
    fallbackIcon: '🔥',
  },
  {
    id: 'kurosh',
    titleFa: 'کوروش بزرگ',
    subtitleFa: 'منشور جاویدان',
    avatarUrl: '/images/covers/kurosh.svg',
    fallbackIcon: '👑',
  },
];

const TIER_STAGES: Array<{
  tier: 0 | 1 | 2 | 3 | 4;
  titleFa: string;
  descFa: string;
}> = [
  { tier: 0, titleFa: '🔒 قفل (خشت خام)', descFa: 'لوح مات با مُهر استوانه‌ای مفرغی' },
  { tier: 1, titleFa: '🧱 رده ۱: سفالین', descFa: 'سفال نیشابور + کاغذ سمرقند' },
  { tier: 2, titleFa: '💠 رده ۲: لعاب فیروزه', descFa: 'قاب فیروزه + لچکی و نگین تراش‌خورده' },
  { tier: 3, titleFa: '👑 رده ۳: قاب زرین', descFa: 'شمش زرین + قلم‌زنی و تاج‌نگین' },
  { tier: 4, titleFa: '💚 رده ۴: زمردیِ شاهانه', descFa: 'مینای زمرد سلطنتی با طلاکوبی و یاقوت' },
];

export const ClayCardDesignLabModal: React.FC<ClayCardDesignLabModalProps> = ({
  onClose,
  onSelectDesign,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<number>(1);
  const [heroIdx, setHeroIdx] = useState<number>(0);
  const [zoomedStage, setZoomedStage] = useState<{ modelId: number; tier: 0 | 1 | 2 | 3 | 4 } | null>(
    null,
  );

  const hero = SAMPLE_HEROES[heroIdx];
  const selectedSpec =
    TEN_CLAY_CARD_MODELS.find((m) => m.id === selectedModelId) || TEN_CLAY_CARD_MODELS[0];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-[30px] overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #FBF2E1 0%, #EFE0C6 52%, #E2CCA8 100%)',
          border: '3px solid #753D20',
          boxShadow: '0 24px 60px rgba(0,0,0,0.65), inset 0 2px 0 rgba(255,255,255,0.75)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#B88C5A]/45"
          style={{
            background: 'linear-gradient(180deg, #5A2B15 0%, #3E1C0C 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border border-[#F6D28B]/50"
              style={{
                background: 'linear-gradient(135deg, #14AD75 0%, #085E3E 100%)',
              }}
            >
              <Award className="text-[#FFFDF8]" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-[#FFF7E8]">
                  ۵ طرحِ فاخر و پرجزئیات بر پایهٔ «کارت شماره ۱۰ (تمام‌تصویرِ موزه‌ای)»
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#129666] text-white border border-[#8CF7C6]/40">
                  شاملِ ردهٔ ۴ «زمردیِ شاهانه» با طلاکوبیِ برجسته
                </span>
              </div>
              <p className="text-xs text-[#E8CFA8] mt-0.5">
                تزییناتِ مثلثیِ ساده حذف شد و با قلم‌زنیِ اسلیمی، بال‌های ظریفِ هما، جدولِ تذهیب، گوهرهای چندوجهی و قابِ «زمردِ سلطنتی» جایگزین شد.
              </p>
            </div>
          </div>

          {/* Hero Switcher & Close */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#2A1207] p-1 rounded-xl border border-[#8A5432]/50">
              {SAMPLE_HEROES.map((h, idx) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHeroIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    heroIdx === idx
                      ? 'bg-[#E5AA39] text-[#281105] shadow-xs'
                      : 'text-[#DEC39B] hover:text-white'
                  }`}
                >
                  {h.fallbackIcon} {h.titleFa}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#7C3626] hover:bg-[#99412D] text-[#FFF3E3] border border-[#FFA894]/30 transition-colors"
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Jump Pills for 1..5 */}
        <div className="px-4 py-2 bg-[#EFE0C4] border-b border-[#C9AD84]/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-black text-[#5C3418] shrink-0 ml-1">پرش سریع بین ۵ مدل:</span>
          {TEN_CLAY_CARD_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedModelId(m.id);
                const el = document.getElementById(`museum-card-model-${m.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all ${
                selectedModelId === m.id
                  ? 'bg-[#129666] text-white shadow-xs'
                  : 'bg-[#FFFDF8] text-[#4E2C15] border border-[#C5A478]'
              }`}
            >
              مدل {m.id}: {m.ornamentStyleFa}
            </button>
          ))}
        </div>

        {/* Scrollable 5 Refined Models of Card #10 with Full 5-Stage Evolution Rows */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">
          {TEN_CLAY_CARD_MODELS.map((model) => {
            const isChosen = selectedModelId === model.id;
            return (
              <div
                id={`museum-card-model-${model.id}`}
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`rounded-[26px] p-3.5 sm:p-5 transition-all cursor-pointer border-2 ${
                  isChosen
                    ? 'border-[#129666] ring-3 ring-[#129666]/25'
                    : 'border-[#C5A478]/80 hover:border-[#9E6A3C]'
                }`}
                style={{
                  background: isChosen
                    ? 'linear-gradient(180deg, #FFFDF8 0%, #F5E7CE 100%)'
                    : 'linear-gradient(180deg, #FAF1DF 0%, #EBDCB9 100%)',
                  boxShadow: '0 8px 22px rgba(62, 31, 12, 0.12)',
                }}
              >
                {/* Model Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#C9AD84]/60">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black text-white shadow-xs"
                      style={{
                        background: isChosen
                          ? 'linear-gradient(135deg, #14AD75 0%, #095E3E 100%)'
                          : 'linear-gradient(135deg, #8F4A29 0%, #5E2D16 100%)',
                      }}
                    >
                      مدل پیشنهادی {model.id}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-[#2D160A]">
                      {model.nameFa}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#E5D2B0] text-[#5C3418] border border-[#B89463]">
                      سبک تزیینات: {model.ornamentStyleFa}
                    </span>
                    {model.recommended && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DDF7EC] text-[#095E3E] border border-[#14AD75]">
                        ★ بسیار باکلاس و پرجزئیات
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModelId(model.id);
                      if (onSelectDesign) onSelectDesign(model.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                      isChosen
                        ? 'bg-[#129666] text-white shadow-sm'
                        : 'bg-[#E3CEAD] text-[#4A2711] hover:bg-[#D5BC94]'
                    }`}
                  >
                    <Check size={14} />
                    <span>{isChosen ? 'مدل انتخاب‌شده' : `انتخاب مدل ${model.id}`}</span>
                  </button>
                </div>

                <p className="text-xs text-[#5E3A1E] font-medium leading-relaxed mb-4">
                  {model.descriptionFa}
                </p>

                {/* 5-Stage Evolution Strip: Locked -> Clay -> Turquoise -> Gold -> Royal Emerald */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {TIER_STAGES.map((st) => (
                    <div
                      key={st.tier}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModelId(model.id);
                        setZoomedStage({ modelId: model.id, tier: st.tier });
                      }}
                      className="group rounded-2xl p-2.5 flex flex-col items-center justify-between border border-[#CFB58C] bg-[#FFFBF2]/80 hover:bg-[#FFFDF9] hover:border-[#129666] transition-all"
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-black text-[#4E2C15] mb-1.5 px-1">
                        <span>{st.titleFa}</span>
                        <span className="text-[#129666] opacity-75 group-hover:opacity-100 flex items-center gap-0.5">
                          <Eye size={11} /> بزرگ‌نمایی
                        </span>
                      </div>

                      <div className="my-1 flex items-center justify-center">
                        <WingedClayBadge
                          designId={model.id}
                          tier={st.tier}
                          titleFa={hero.titleFa}
                          subtitleFa={hero.subtitleFa}
                          avatarUrl={hero.avatarUrl}
                          fallbackIcon={hero.fallbackIcon}
                          size="sm"
                        />
                      </div>

                      <div className="text-[10px] text-center font-bold text-[#6E472B] bg-[#F2E3C9]/80 w-full py-1 px-1.5 rounded-lg mt-1">
                        {st.descFa}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Bar */}
        <div
          className="px-4 sm:px-6 py-3.5 border-t-2 border-[#B88C5A]/50 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{
            background: 'linear-gradient(180deg, #F6E7CC 0%, #E7D0A9 100%)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <Shield className="text-[#0E754F] shrink-0 mt-0.5" size={20} />
            <div>
              <div className="text-xs sm:text-sm font-black text-[#2E1608]">
                مدل انتخابی فعلی: <span className="text-[#0E754F]">{selectedSpec.nameFa}</span>
              </div>
              <div className="text-[11px] text-[#5C3A1E] mt-0.5">
                شمارهٔ مدل دلخواهتان (۱ تا ۵) را در چت اعلام کنید تا روی کل گالری کالکشن و کومبو اعمال شود.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onSelectDesign) onSelectDesign(selectedModelId);
                onClose();
              }}
              className="px-4 py-2 rounded-xl font-black text-xs sm:text-sm text-[#261205] flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(180deg, #F4C96B 0%, #DDA130 60%, #B87B19 100%)',
                border: '2px solid #6E420C',
              }}
            >
              <Sparkles size={15} />
              <span>تأیید مدل شماره {selectedModelId}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Click-to-Zoom Modal for inspecting any card stage in large size */}
      {zoomedStage && (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setZoomedStage(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-[28px] p-5 sm:p-6 max-w-md w-full flex flex-col items-center text-center border-3 border-[#8F4A29] shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #FFFDF8 0%, #F2E2C4 100%)',
            }}
          >
            <div className="text-sm font-black text-[#2D160A] mb-1">
              {TEN_CLAY_CARD_MODELS.find((m) => m.id === zoomedStage.modelId)?.nameFa}
            </div>
            <div className="text-xs font-bold text-[#0E754F] mb-4">
              {TIER_STAGES.find((s) => s.tier === zoomedStage.tier)?.titleFa}
            </div>

            <WingedClayBadge
              designId={zoomedStage.modelId}
              tier={zoomedStage.tier}
              titleFa={hero.titleFa}
              subtitleFa={hero.subtitleFa}
              avatarUrl={hero.avatarUrl}
              fallbackIcon={hero.fallbackIcon}
              size="lg"
            />

            <p className="text-xs font-bold text-[#5C3A1E] mt-4">
              {
                TEN_CLAY_CARD_MODELS.find((m) => m.id === zoomedStage.modelId)?.evolutionNotesFa[
                  zoomedStage.tier
                ]
              }
            </p>

            <div className="flex items-center gap-2 mt-4">
              {([0, 1, 2, 3, 4] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setZoomedStage({ modelId: zoomedStage.modelId, tier: t })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                    zoomedStage.tier === t
                      ? 'bg-[#129666] text-white'
                      : 'bg-[#E5D3B3] text-[#4E2C15]'
                  }`}
                >
                  {t === 0 ? '🔒 قفل' : t === 4 ? '💚 رده ۴ زمردی' : `رده ${t}`}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setZoomedStage(null)}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-black bg-[#5A2B15] text-[#FFF7E8]"
            >
              بستن بزرگ‌نمایی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
