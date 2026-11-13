const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images');

// ── Templates ──────────────────────────────────────────────
function coverSVG(title, bg, accent, emblem) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <rect width="400" height="600" fill="${bg}"/>
  <rect x="20" y="20" width="360" height="560" rx="16" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
  <rect x="30" y="30" width="340" height="540" rx="12" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>
  ${emblem}
  <text x="200" y="480" text-anchor="middle" fill="${accent}" font-family="serif" font-size="28" font-weight="bold" opacity="0.9">${title}</text>
  <text x="200" y="520" text-anchor="middle" fill="#fff" font-family="serif" font-size="12" opacity="0.4">کتاب داستانی</text>
</svg>`;
}

function chapterSVG(title, bg, accent, elements) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${bg}"/>
  <rect x="8" y="8" width="384" height="284" rx="8" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  ${elements}
  <text x="200" y="270" text-anchor="middle" fill="${accent}" font-family="serif" font-size="14" font-weight="bold" opacity="0.8">${title}</text>
</svg>`;
}

function monsterSVG(body, eyes, horns, glow) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="50" fill="${body}" opacity="0.85"/>
  <circle cx="60" cy="60" r="50" fill="none" stroke="${glow || '#fff'}" stroke-width="1" opacity="0.3"/>
  ${horns}
  <circle cx="44" cy="52" r="7" fill="${eyes}" opacity="0.9"/>
  <circle cx="76" cy="52" r="7" fill="${eyes}" opacity="0.9"/>
  <circle cx="44" cy="52" r="3" fill="#fff" opacity="0.8"/>
  <circle cx="76" cy="52" r="3" fill="#fff" opacity="0.8"/>
  <path d="M48 72 Q60 82 72 72" fill="none" stroke="${glow || '#fff'}" stroke-width="2" opacity="0.5"/>
</svg>`;
}

// ── Campaign Definitions ───────────────────────────────────
const CAMPAIGNS = [
  // ZAHHAK (Epic - purple accent)
  {
    id: 'zahhak', n: 5, accent: '#7c3aed', bg: '#0f0a14',
    coverEmblem: '<circle cx="200" cy="200" r="80" fill="none" stroke="#7c3aed" stroke-width="3" opacity="0.3"/><path d="M160 200 Q200 160 240 200 Q200 240 160 200" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.5"/><circle cx="200" cy="200" r="4" fill="#7c3aed"/>',
    chapters: [
      "پیمان با اهریمن", "ضحاک ماروش", "کاوه آهنگر", "فریدون و کاوه", "زنجیر ضحاک"
    ],
    monsterColors: ['#5b21b6','#6d28d9','#7c3aed','#8b5cf6','#a78bfa'],
    monsterEyes: ['#fef08a','#fde047','#facc15','#eab308','#ca8a04']
  },
  // MEDES (History - teal)
  {
    id: 'medes', n: 4, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<rect x="150" y="140" width="100" height="80" rx="8" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><rect x="165" y="155" width="70" height="50" rx="4" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.3"/><circle cx="200" cy="180" r="10" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.5"/>',
    chapters: ["دیاکو و بنیاد ماد","فرورتیش و اتحاد","هووخشتر و نینوا","آستیاگ و پایان"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf','#5eead4'],
    monsterEyes: ['#fbbf24','#f59e0b','#d97706','#fbbf24','#f59e0b']
  },
  // ACHAEMENIDS (History - teal)
  {
    id: 'achaemenids', n: 6, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<polygon points="200,140 160,200 240,200" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><rect x="170" y="200" width="60" height="40" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.3"/><line x1="160" y1="200" x2="200" y2="160" stroke="#14b8a6" stroke-width="1" opacity="0.2"/>',
    chapters: ["کوروش و پارس‌ها","فتح لیدیه و بابل","منشور حقوق بشر","داریوش و تخت جمشید","خشایارشا و یونان","پایان هخامنشی"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf','#5eead4','#0f766e'],
    monsterEyes: ['#fef08a','#fde047','#fbbf24','#f59e0b','#d97706','#fbbf24']
  },
  // PARTHIANS (History - teal)
  {
    id: 'parthians', n: 4, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<circle cx="200" cy="180" r="40" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><line x1="140" y1="220" x2="200" y2="180" stroke="#14b8a6" stroke-width="1" opacity="0.3"/><line x1="260" y1="220" x2="200" y2="180" stroke="#14b8a6" stroke-width="1" opacity="0.3"/>',
    chapters: ["ارشک و شورش","مهرداد و گسترش","نبرد حران","پایان اشکانی"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf'],
    monsterEyes: ['#fbbf24','#f59e0b','#d97706','#fbbf24']
  },
  // SASSANIDS (History - teal)
  {
    id: 'sassanids', n: 5, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<circle cx="200" cy="160" r="30" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><rect x="170" y="190" width="60" height="30" rx="4" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.3"/><line x1="200" y1="190" x2="200" y2="220" stroke="#14b8a6" stroke-width="1" opacity="0.3"/>',
    chapters: ["اردشیر و بنیاد","شاپور و والرین","انوشیروان دادگر","تاج و تخت ساسانی","حمله اعراب"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf','#5eead4'],
    monsterEyes: ['#fef08a','#fde047','#fbbf24','#f59e0b','#d97706']
  },
  // SELJUKS (History - teal)
  {
    id: 'seljuks', n: 4, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<path d="M140 200 Q170 160 200 180 Q230 200 260 160" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><circle cx="200" cy="190" r="8" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.4"/>',
    chapters: ["طغرل و ورود به ایران","آلب ارسلان و ملازگرد","ملکشاه و نظام‌الملک","سنجر و پایان"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf'],
    monsterEyes: ['#fbbf24','#f59e0b','#d97706','#fbbf24']
  },
  // SAFAVIDS (History - teal)
  {
    id: 'safavids', n: 5, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<path d="M160 160 Q180 140 200 160 Q220 180 240 160" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><line x1="200" y1="180" x2="200" y2="220" stroke="#14b8a6" stroke-width="1" opacity="0.3"/>',
    chapters: ["شیخ صفی و بنیاد","شاه اسماعیل و تبریز","شاه عباس و اصفهان","چالدران","سقوط صفوی"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf','#5eead4'],
    monsterEyes: ['#fef08a','#fde047','#fbbf24','#f59e0b','#d97706']
  },
  // QAJARS (History - teal)
  {
    id: 'qajars', n: 5, accent: '#14b8a6', bg: '#0a0f0e',
    coverEmblem: '<rect x="175" y="160" width="50" height="50" rx="2" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.4"/><rect x="185" y="170" width="30" height="30" rx="2" fill="none" stroke="#14b8a6" stroke-width="1" opacity="0.3"/>',
    chapters: ["آغا محمدخان و تهران","جنگ با روسیه","امیرکبیر","مشروطه","پایان قاجار"],
    monsterColors: ['#0f766e','#115e59','#14b8a6','#2dd4bf','#5eead4'],
    monsterEyes: ['#fbbf24','#f59e0b','#d97706','#fbbf24','#f59e0b']
  },
];

// ── Generate ────────────────────────────────────────────────
CAMPAIGNS.forEach(c => {
  // Cover
  const coverDir = path.join(BASE, 'covers');
  if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });
  fs.writeFileSync(path.join(coverDir, `${c.id}.svg`), coverSVG(c.id === 'zahhak' ? 'ضحاک و کاوه آهنگر' : '', c.bg, c.accent, c.coverEmblem));

  // Chapters & Monsters
  const chDir = path.join(BASE, 'chapters', c.id);
  const moDir = path.join(BASE, 'monsters', c.id);
  fs.mkdirSync(chDir, { recursive: true });
  fs.mkdirSync(moDir, { recursive: true });

  c.chapters.forEach((title, i) => {
    const idx = i + 1;
    // Simple decorative elements based on index
    const elements = [
      `<circle cx="200" cy="120" r="${60 - i * 8}" fill="none" stroke="${c.accent}" stroke-width="1.5" opacity="${0.3 - i * 0.04}"/>`,
      `<line x1="${160 + i * 5}" y1="100" x2="${240 - i * 5}" y2="140" stroke="${c.accent}" stroke-width="1" opacity="0.2"/>`,
      `<text x="200" y="80" text-anchor="middle" fill="${c.accent}" font-family="serif" font-size="12" opacity="0.4">بخش ${idx}</text>`,
    ].join('\n');
    fs.writeFileSync(path.join(chDir, `ch${idx}.svg`), chapterSVG(title, c.bg, c.accent, elements));

    // Monster
    const mc = c.monsterColors[i % c.monsterColors.length];
    const me = c.monsterEyes[i % c.monsterEyes.length];
    const horns = [
      `<path d="M${40 + i * 2} ${30 + i * 2} L${50 + i * 2} ${10 + i * 2} L${55 + i * 2} ${30 + i * 2}" fill="${c.accent}" opacity="0.6"/>`,
      `<path d="M${80 - i * 2} ${30 + i * 2} L${70 - i * 2} ${10 + i * 2} L${65 - i * 2} ${30 + i * 2}" fill="${c.accent}" opacity="0.6"/>`,
    ].join('\n');
    fs.writeFileSync(path.join(moDir, `monster${idx}.svg`), monsterSVG(mc, me, horns, c.accent));
  });

  console.log(`✅ ${c.id}: 1 cover + ${c.chapters.length} chapters + ${c.chapters.length} monsters`);
});

console.log('\n✨ All SVGs generated successfully!');
