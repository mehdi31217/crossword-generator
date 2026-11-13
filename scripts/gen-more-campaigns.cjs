const path = require('path');
const fs = require('fs');
const {
  writeSVG, cypressTree, mountain, sunCircle, warriorSil, horseFig,
  dome, crescentMoon, stars, crown, flowerBush, fire, waterWave, persianArch
} = require('./svg-utils.cjs');

const CHAPTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'chapters');
const COVERS_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');
const MONSTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'monsters');

function makeDark(w, h, accent, bg, title, extra) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${bg}" rx="6"/>
  <rect x="6" y="6" width="${w-12}" height="${h-12}" fill="none" stroke="${accent}" stroke-width="1.5" rx="4" opacity="0.4"/>
  ${extra}
  <rect x="0" y="${h-38}" width="${w}" height="38" fill="rgba(0,0,0,0.5)"/>
  <text x="${w/2}" y="${h-14}" text-anchor="middle" fill="#fff" font-family="serif" font-size="16" font-weight="bold" dir="rtl">${title}</text>
</svg>`;
}

function cover(title, file, bg, accent, textColor, elements) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="${bg}CC"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#cg)" rx="8"/>
  <rect x="8" y="8" width="384" height="284" fill="none" stroke="${accent}" stroke-width="2" rx="6" opacity="0.6"/>
  <rect x="16" y="16" width="368" height="268" fill="none" stroke="${accent}" stroke-width="1" rx="5" opacity="0.3"/>
  ${elements}
  <rect x="48" y="235" width="304" height="45" rx="5" fill="black" opacity="0.45"/>
  <text x="200" y="262" text-anchor="middle" fill="${textColor}" font-family="serif" font-size="20" font-weight="bold" dir="rtl">${title}</text>
  <rect x="0" y="296" width="400" height="4" fill="${accent}"/><rect x="0" y="0" width="400" height="4" fill="${accent}"/>
</svg>`;
  writeSVG(file, s);
}

function monsterSvg(file, bg, accent, extra) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" fill="${bg}" rx="40"/>
  <g transform="translate(40,40)">
    <ellipse cx="0" cy="-6" rx="20" ry="15" fill="${accent}" opacity="0.6"/>
    <ellipse cx="-9" cy="-14" rx="5" ry="4" fill="${accent}" opacity="0.8"/>
    <ellipse cx="9" cy="-14" rx="5" ry="4" fill="${accent}" opacity="0.8"/>
    <circle cx="-9" cy="-14" r="2" fill="#000"/><circle cx="9" cy="-14" r="2" fill="#000"/>
    <path d="M-5 2 Q0 12 5 2" fill="none" stroke="${accent}" stroke-width="2"/>
    <path d="M-18 -20 L-25 -30 M18 -20 L25 -30" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
    ${extra||''}
  </g></svg>`;
  writeSVG(file, s);
}

function gen() {
  const campa = [
    { dir: 'zal', monst: 'zal', cover: 'zal', accent: '#8b5cf6', bg: '#0f0a1a', ch: 5, cTitle: 'زال و رودابه' },
    { dir: 'arash', monst: 'arash', cover: 'arash', accent: '#f59e0b', bg: '#1c1917', ch: 1, cTitle: 'آرش کمانگیر' },
    { dir: 'khosrow', monst: 'khosrow', cover: 'khosrow', accent: '#ec4899', bg: '#140a0f', ch: 6, cTitle: 'خسرو و شیرین' },
    { dir: 'peykar', monst: 'peykar', cover: 'peykar', accent: '#06b6d4', bg: '#0a0f14', ch: 5, cTitle: 'هفت پیکر' },
    { dir: 'kurosh', monst: 'kurosh', cover: 'kurosh', accent: '#f59e0b', bg: '#0f0a09', ch: 6, cTitle: 'کوروش بزرگ' },
    { dir: 'mosaddegh', monst: 'mosaddegh', cover: 'mosaddegh', accent: '#10b981', bg: '#0a0f0c', ch: 4, cTitle: 'مصدق و نفت' },
  ];

  for (const c of campa) {
    const chDir = path.join(CHAPTERS_DIR, c.dir);
    const moDir = path.join(MONSTERS_DIR, c.monst);
    fs.mkdirSync(chDir, { recursive: true });
    fs.mkdirSync(moDir, { recursive: true });
    fs.mkdirSync(COVERS_DIR, { recursive: true });

    const a = c.accent;

    // Generate chapter images
    for (let i = 1; i <= c.ch; i++) {
      const chFile = path.join(chDir, `ch${i}.svg`);
      // Different scene for each chapter based on index
      const sceneType = (i - 1) % 5;
      let extras = '';
      if (sceneType === 0) extras = `${mountain(60, 230, 70, 65, a)}${mountain(340, 230, 70, 65, a)}${sunCircle(200, 60, 22, '#fbbf24')}${cypressTree(80, 270, 70, '#15803d')}${cypressTree(320, 270, 70, '#15803d')}`;
      else if (sceneType === 1) extras = `${crescentMoon(310, 60, 14, '#e2e8f0')}${stars(200, 50, 90, '#fff', 5)}${dome(200, 235, 100, 80, '#cbd5e1')}${cypressTree(70, 270, 65, '#15803d')}${cypressTree(330, 270, 65, '#15803d')}`;
      else if (sceneType === 2) extras = `${sunCircle(200, 65, 24, '#fbbf24')}${mountain(70, 230, 65, 60, a)}${mountain(330, 230, 65, 60, a)}${dome(200, 230, 90, 75, '#cbd5e1')}${flowerBush(120, 260, 14, '#86efac')}${flowerBush(280, 260, 14, '#86efac')}`;
      else if (sceneType === 3) extras = `${crescentMoon(200, 65, 16, '#e2e8f0')}${stars(200, 50, 100, '#fff', 6)}${persianArch(200, 235, 80, 70, '#86efac')}${flowerBush(100, 260, 14, '#fca5a5')}${flowerBush(300, 260, 14, '#fca5a5')}`;
      else extras = `${mountain(60, 230, 70, 65, a)}${mountain(340, 230, 70, 65, a)}${sunCircle(200, 60, 24, '#fbbf24')}${horseFig(200, 238, 2, '#cbd5e1')}${warriorSil(200, 205, 2, '#fca5a5')}${cypressTree(70, 270, 70, '#15803d')}${cypressTree(330, 270, 70, '#15803d')}`;

      // Special scenes for certain chapters
      if (c.dir === 'zal' && i === 1) {
        extras = `${mountain(200, 220, 100, 90, '#6366f1')}${crescentMoon(310, 60, 14, '#e2e8f0')}${stars(200, 50, 90, '#fff', 5)}${cypressTree(80, 270, 70, '#15803d')}${cypressTree(320, 270, 70, '#15803d')}${dome(200, 220, 80, 65, '#a78bfa')}`;
      } else if (c.dir === 'zal' && i === 4) {
        extras = `${crescentMoon(200, 65, 18, '#e2e8f0')}${stars(200, 50, 100, '#fff', 5)}${persianArch(200, 235, 80, 75, '#c4b5fd')}${flowerBush(110, 260, 14, '#fca5a5')}${flowerBush(290, 260, 14, '#fca5a5')}${warriorSil(200, 210, 1.8, a)}`;
      } else if (c.dir === 'arash') {
        extras = `${mountain(200, 220, 150, 110, a)}${sunCircle(200, 55, 26, '#fbbf24')}${cypressTree(50, 270, 70, '#15803d')}${cypressTree(350, 270, 70, '#15803d')}${crown(200, 72, 2, '#fbbf24')}${warriorSil(200, 210, 2, '#fca5a5')}`;
      } else if (c.dir === 'khosrow' && i === 3) {
        extras = `${mountain(100, 230, 100, 80, a)}${mountain(300, 230, 100, 80, a)}${sunCircle(200, 60, 22, '#fbbf24')}${cypressTree(80, 270, 70, '#15803d')}${cypressTree(320, 270, 70, '#15803d')}${warriorSil(200, 210, 2, '#fca5a5')}${fire(200, 245, 20, '#f97316')}`;
      } else if (c.dir === 'khosrow' && i === 5) {
        extras = `${crescentMoon(310, 60, 14, '#e2e8f0')}${stars(200, 50, 90, '#fff', 4)}${persianArch(200, 235, 90, 80, '#f9a8d4')}${cypressTree(70, 270, 70, '#15803d')}${cypressTree(330, 270, 70, '#15803d')}${flowerBush(130, 260, 14, '#fca5a5')}${flowerBush(270, 260, 14, '#fca5a5')}`;
      } else if (c.dir === 'peykar' && i === 2) {
        extras = `${crescentMoon(200, 60, 16, '#e2e8f0')}${stars(200, 50, 100, '#fff', 6)}${dome(200, 235, 110, 85, '#67e8f9')}${flowerBush(100, 260, 14, '#fca5a5')}${flowerBush(300, 260, 14, '#fca5a5')}`;
      } else if (c.dir === 'kurosh' && i === 3) {
        extras = `${mountain(60, 230, 70, 65, a)}${mountain(340, 230, 70, 65, a)}${sunCircle(200, 60, 24, '#fbbf24')}${horseFig(200, 238, 2.2, '#cbd5e1')}${warriorSil(140, 205, 2, '#fca5a5')}${warriorSil(260, 205, 2, a)}`;
      } else if (c.dir === 'kurosh' && i === 5) {
        extras = `${sunCircle(200, 65, 26, '#fbbf24')}${mountain(200, 220, 120, 90, a)}${dome(200, 230, 100, 80, '#cbd5e1')}${cypressTree(70, 270, 70, '#15803d')}${cypressTree(330, 270, 70, '#15803d')}${crown(200, 72, 2.5, '#fbbf24')}`;
      } else if (c.dir === 'mosaddegh') {
        extras = `${mountain(80, 230, 70, 65, a)}${mountain(320, 230, 70, 65, a)}${sunCircle(200, 60, 22, '#fbbf24')}${cypressTree(70, 270, 70, '#15803d')}${cypressTree(330, 270, 70, '#15803d')}${warriorSil(200, 210, 2, '#86efac')}${crown(200, 72, 1.8, '#fbbf24')}`;
      }

      const chNames = {
        zal: ['تولد زال', 'بازگشت زال', 'عشق زال و رودابه', 'آزمون عشق', 'ازدواج و تولد رستم'],
        arash: ['پرتاب تیر'],
        khosrow: ['خسرو و شیرین', 'ملاقات شیرین', 'فرهاد کوه‌کن', 'رقابت و جدایی', 'مرگ فرهاد', 'پایان تراژیک'],
        peykar: ['بهرام گور', 'هفت گنبد', 'داستان‌های شبانه', 'شکار و قدرت', 'پایان بهرام'],
        kurosh: ['تولد کوروش', 'جوانی کوروش', 'شورش بر مادها', 'فتح لیدیه', 'فتح بابل', 'ارزش‌های کوروش'],
        mosaddegh: ['ملی شدن نفت', 'مرداد ۱۳۳۲', 'مقاومت و شکست', 'میراث مصدق'],
      };

      writeSVG(chFile, makeDark(400, 400, a, c.bg, chNames[c.dir][i - 1], extras));
      monsterSvg(path.join(moDir, `ch${i}-monster.svg`), c.bg, a, `<circle cx="0" cy="6" r="8" fill="${a}" opacity="0.2"/>`);
    }

    // Cover
    const coverFile = path.join(COVERS_DIR, `${c.cover}.svg`);
    cover(c.cTitle, coverFile, c.bg, a, '#fff', `
      <circle cx="200" cy="115" r="55" fill="none" stroke="${a}" stroke-width="3" opacity="0.35"/>
      <circle cx="200" cy="115" r="40" fill="none" stroke="${a}" stroke-width="2" opacity="0.25"/>
      <path d="M175 95 L200 70 L225 95 L225 145 Q200 158 175 145Z" fill="${a}" opacity="0.65"/>
      <circle cx="200" cy="108" r="16" fill="#fbbf24" opacity="0.85"/>
      <circle cx="200" cy="108" r="5" fill="#000"/>
      <path d="M178 132 Q200 150 222 132" fill="none" stroke="${a}" stroke-width="2.5" stroke-linecap="round"/>
      ${mountain(70, 145, 60, 55, a)}
      ${mountain(260, 145, 60, 55, a)}
      ${cypressTree(50, 158, 50, '#15803d')}
      ${cypressTree(350, 158, 50, '#15803d')}
    `);

    console.log(`✅ ${c.cTitle}: ${c.ch} chapters + cover + monsters`);
  }

  console.log(`\n✅ Total: ${campa.reduce((s,c)=>s+c.ch,0)} chapter SVGs + ${campa.length} covers + ${campa.reduce((s,c)=>s+c.ch,0)} monsters = ${campa.reduce((s,c)=>s+c.ch*2,0) + campa.length} SVGs`);
}

gen();
