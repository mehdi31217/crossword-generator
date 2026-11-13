const path = require('path');
const fs = require('fs');
const {
  makeScene, makeSceneLight, writeSVG,
  cypressTree, mountain, sunCircle, warriorSil, horseFig,
  dome, crescentMoon, stars, crown, flowerBush,
  dragonBody, dragonSil, fire, waterWave, persianArch
} = require('./svg-utils.cjs');

const CHAPTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'chapters');
const COVERS_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');
const MONSTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'monsters');

function makeDark(w, h, accent, bgSolid, title, extra) {
  return makeScene(w, h, { bgSolid, bgTop: bgSolid, bgBot: '#000', accent, title, textColor: '#fff', content: extra });
}
function makeLight(w, h, accent, bgTop, bgBot, title, textColor, extra) {
  return makeSceneLight(w, h, { accent, bgTop, bgBot, title, textColor, content: extra });
}

function cover(title, file, bg, accent, textColor, elements) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}CC"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#cg)" rx="8"/>
  <rect x="8" y="8" width="384" height="284" fill="none" stroke="${accent}" stroke-width="2" rx="6" opacity="0.6"/>
  <rect x="16" y="16" width="368" height="268" fill="none" stroke="${accent}" stroke-width="1" rx="5" opacity="0.3"/>
  ${elements}
  <rect x="${400 * 0.12}" y="${300 - 65}" width="${400 * 0.76}" height="45" rx="5" fill="black" opacity="0.45"/>
  <text x="200" y="${300 - 38}" text-anchor="middle" fill="${textColor}" font-family="serif" font-size="20" font-weight="bold" dir="rtl">${title}</text>
  <rect x="0" y="${300 - 4}" width="400" height="4" fill="${accent}"/>
  <rect x="0" y="0" width="400" height="4" fill="${accent}"/>
</svg>`;
  writeSVG(file, s);
}

function monster(cx, cy, s, accent, fillColor, element) {
  const scale = s || 1;
  return `<g transform="translate(${cx},${cy}) scale(${scale})">
    <circle cx="0" cy="0" r="34" fill="${fillColor}" opacity="0.15"/>
    <ellipse cx="0" cy="-8" rx="22" ry="18" fill="${fillColor}" opacity="0.4"/>
    <ellipse cx="0" cy="-6" rx="20" ry="14" fill="${fillColor}" opacity="0.6"/>
    <ellipse cx="-9" cy="-14" rx="5" ry="4" fill="${accent}" opacity="0.8"/>
    <ellipse cx="9" cy="-14" rx="5" ry="4" fill="${accent}" opacity="0.8"/>
    <circle cx="-9" cy="-14" r="2" fill="#000"/>
    <circle cx="9" cy="-14" r="2" fill="#000"/>
    <path d="M-5 2 Q0 12 5 2" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
    ${element || ''}
    <path d="M-18 -20 L-25 -30 M18 -20 L25 -30" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
    <path d="M-16 -6 L-30 -4 M16 -6 L30 -4" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
  </g>`;
}

function monsterSVG(file, bg, accent, fillColor, cx, cy, s, element) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <rect width="80" height="80" fill="${bg}" rx="40"/>
  ${monster(cx || 40, cy || 40, s || 1, accent, fillColor || accent, element || '')}
</svg>`;
  writeSVG(file, svg);
}

function gen() {
  const siavo = path.join(CHAPTERS_DIR, 'siavoshan');
  const bizh = path.join(CHAPTERS_DIR, 'bizhan');
  const monstSiavo = path.join(MONSTERS_DIR, 'siavoshan');
  const monstBizh = path.join(MONSTERS_DIR, 'bizhan');

  for (const d of [siavo, bizh, monstSiavo, monstBizh, COVERS_DIR]) {
    fs.mkdirSync(d, { recursive: true });
  }

  const c = '#e63946'; // siavosh red accent
  const g = '#2d6a4f'; // bizhan green accent

  // ===== SIAVOSH CHAPTERS =====
  const sia = siavo; const ms = monstSiavo;

  writeSVG(path.join(sia, 'ch1.svg'), makeDark(400, 400, c, '#1a0a0f', 'تولد سیاوش', `
    ${crescentMoon(310, 60, 16, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 6)}
    ${cypressTree(80, 270, 70, '#2d6a4f')}
    ${cypressTree(320, 270, 70, '#2d6a4f')}
    ${dome(200, 230, 100, 80, '#cbd5e1')}
    <rect x="150" y="210" width="100" height="20" fill="#cbd5e1" opacity="0.2"/>
    <ellipse cx="200" cy="220" rx="18" ry="12" fill="#fca5a5" opacity="0.08"/>
    <circle cx="200" cy="216" r="5" fill="#fca5a5" opacity="0.15"/>
  `));
  monsterSVG(path.join(ms, 'ch1-monster.svg'), '#1a0a0f', c, c, 40, 40, 1,
    `<circle cx="0" cy="8" r="8" fill="${c}" opacity="0.2"/>
     <path d="M-6 4 Q0 -2 6 4" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/>`);

  writeSVG(path.join(sia, 'ch2.svg'), makeDark(400, 400, c, '#1a0a0f', 'تعلیم سیاوش', `
    ${sunCircle(200, 60, 24, '#fbbf24')}
    ${mountain(60, 230, 70, 65, c)}
    ${mountain(340, 230, 70, 65, c)}
    ${cypressTree(75, 270, 70, '#2d6a4f')}
    ${cypressTree(325, 270, 70, '#2d6a4f')}
    ${warriorSil(155, 205, 1.7, '#fca5a5')}
    ${warriorSil(245, 205, 2, c)}
    <line x1="190" y1="185" x2="210" y2="185" stroke="${c}" stroke-width="2" opacity="0.4"/>
  `));
  monsterSVG(path.join(ms, 'ch2-monster.svg'), '#1a0a0f', '#fbbf24', c, 40, 40, 1,
    `<path d="M-8 6 L0 -4 L8 6" fill="none" stroke="${c}" stroke-width="2"/>`);

  writeSVG(path.join(sia, 'ch3.svg'), makeDark(400, 400, '#b91c1c', '#1a0a0f', 'دام سودابه', `
    ${crescentMoon(200, 65, 18, '#e2e8f0')}
    ${stars(200, 50, 100, '#fff', 5)}
    ${persianArch(200, 235, 85, 75, '#fca5a5')}
    <path d="M180 175 Q200 158 220 175" fill="none" stroke="#fca5a5" stroke-width="2" opacity="0.3"/>
    <ellipse cx="200" cy="172" rx="12" ry="16" fill="#fca5a5" opacity="0.06"/>
    <circle cx="194" cy="167" r="2" fill="#fca5a5" opacity="0.6"/>
    <circle cx="206" cy="167" r="2" fill="#fca5a5" opacity="0.6"/>
    ${flowerBush(100, 260, 14, '#fca5a5')}
    ${flowerBush(300, 260, 14, '#fca5a5')}
  `));
  monsterSVG(path.join(ms, 'ch3-monster.svg'), '#1a0a0f', '#fca5a5', '#b91c1c', 40, 40, 1,
    `<path d="M-10 4 Q0 -8 10 4" fill="none" stroke="#fca5a5" stroke-width="2"/>`);

  writeSVG(path.join(sia, 'ch4.svg'), makeDark(400, 400, '#f97316', '#1a0a0f', 'عبور از آتش', `
    ${fire(200, 240, 50, '#f97316')}
    ${fire(160, 250, 20, '#fbbf24')}
    ${fire(240, 250, 20, '#fbbf24')}
    ${stars(200, 55, 100, '#fff', 5)}
    ${crescentMoon(310, 60, 14, '#e2e8f0')}
    ${warriorSil(200, 220, 2.2, '#fca5a5')}
  `));
  monsterSVG(path.join(ms, 'ch4-monster.svg'), '#1a0a0f', '#f97316', '#f97316', 40, 40, 1,
    `<path d="M-3 6 L0 -6 L3 6" fill="none" stroke="#fbbf24" stroke-width="2"/>`);

  writeSVG(path.join(sia, 'ch5.svg'), makeDark(400, 400, '#6366f1', '#0a0a1a', 'سفر به توران', `
    ${mountain(80, 230, 60, 60, '#6366f1')}
    ${mountain(320, 230, 60, 60, '#6366f1')}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${cypressTree(70, 270, 65, '#2d6a4f')}
    ${cypressTree(330, 270, 65, '#2d6a4f')}
    ${horseFig(200, 238, 2.2, '#cbd5e1')}
    ${warriorSil(200, 205, 2, c)}
    <rect x="0" y="260" width="400" height="10" fill="#6366f1" opacity="0.15"/>
  `));
  monsterSVG(path.join(ms, 'ch5-monster.svg'), '#0a0a1a', '#6366f1', '#6366f1', 40, 40, 1,
    `<ellipse cx="0" cy="6" rx="10" ry="5" fill="#6366f1" opacity="0.3"/>`);

  writeSVG(path.join(sia, 'ch6.svg'), makeDark(400, 400, '#ec4899', '#1a0a0f', 'سیاوش و فرنگیس', `
    ${crescentMoon(200, 65, 18, '#e2e8f0')}
    ${stars(200, 50, 100, '#fff', 6)}
    ${flowerBush(100, 260, 16, '#fbcfe8')}
    ${flowerBush(300, 260, 16, '#fbcfe8')}
    ${persianArch(200, 235, 80, 75, '#fbcfe8')}
    <circle cx="185" cy="176" r="3" fill="#fbcfe8" opacity="0.3"/>
    <circle cx="215" cy="176" r="3" fill="#fbcfe8" opacity="0.3"/>
    <path d="M200 170 L200 195" stroke="#fbcfe8" stroke-width="1" opacity="0.2"/>
    ${crown(200, 85, 1.5, '#fbbf24')}
  `));
  monsterSVG(path.join(ms, 'ch6-monster.svg'), '#1a0a0f', '#ec4899', '#ec4899', 40, 40, 1,
    `<path d="M-5 8 Q0 -4 5 8" fill="none" stroke="#ec4899" stroke-width="2"/>`);

  writeSVG(path.join(sia, 'ch7.svg'), makeDark(400, 400, '#6b7280', '#0a0a0f', 'شهادت سیاوش', `
    ${mountain(80, 230, 65, 65, '#6b7280')}
    ${mountain(320, 230, 65, 65, '#6b7280')}
    ${crescentMoon(310, 60, 14, '#e2e8f0')}
    ${stars(200, 55, 90, '#fff', 5)}
    <ellipse cx="200" cy="168" rx="35" ry="48" fill="#6b7280" opacity="0.06"/>
    <path d="M185 158 Q200 143 215 158" fill="none" stroke="#6b7280" stroke-width="2" opacity="0.3"/>
    <circle cx="193" cy="153" r="2" fill="#ef4444" opacity="0.5"/>
    <circle cx="207" cy="153" r="2" fill="#ef4444" opacity="0.5"/>
    <path d="M200 168 L200 200" stroke="#6b7280" stroke-width="1.5" opacity="0.3"/>
    <path d="M170 180 L230 180" stroke="#ef4444" stroke-width="0.8" opacity="0.3"/>
    <circle cx="200" cy="205" r="6" fill="#ef4444" opacity="0.15"/>
  `));
  monsterSVG(path.join(ms, 'ch7-monster.svg'), '#0a0a0f', '#ef4444', '#6b7280', 40, 40, 1, '',
    `<path d="M-8 2 L8 2 M0 -4 L0 8" stroke="#ef4444" stroke-width="2"/>`);

  writeSVG(path.join(sia, 'ch8.svg'), makeDark(400, 400, '#f59e0b', '#0a0a0f', 'کین سیاوش', `
    ${sunCircle(200, 65, 26, '#fbbf24')}
    ${mountain(80, 230, 70, 65, '#f59e0b')}
    ${mountain(320, 230, 70, 65, '#f59e0b')}
    ${cypressTree(70, 270, 70, '#2d6a4f')}
    ${cypressTree(330, 270, 70, '#2d6a4f')}
    ${warriorSil(200, 205, 2.5, '#fca5a5')}
    ${crown(200, 72, 2.5, '#fbbf24')}
  `));
  monsterSVG(path.join(ms, 'ch8-monster.svg'), '#0a0a0f', '#f59e0b', '#f59e0b', 40, 40, 1,
    `<circle cx="0" cy="6" r="6" fill="#fbbf24" opacity="0.2"/>`);

  // ===== BIZHAN CHAPTERS =====
  const bz = bizh; const mb = monstBizh;

  writeSVG(path.join(bz, 'ch1.svg'), makeDark(400, 400, g, '#0a140f', 'شکار در توران', `
    ${mountain(80, 230, 70, 65, g)}
    ${mountain(320, 230, 70, 65, g)}
    ${sunCircle(200, 65, 24, '#fbbf24')}
    ${cypressTree(60, 270, 75, '#15803d')}
    ${cypressTree(340, 270, 65, '#15803d')}
    ${flowerBush(120, 260, 14, '#fbbf24')}
    ${flowerBush(280, 260, 14, '#fbbf24')}
    ${horseFig(200, 238, 2, '#cbd5e1')}
    ${warriorSil(165, 208, 1.6, '#fca5a5')}
  `));
  monsterSVG(path.join(mb, 'ch1-monster.svg'), '#0a140f', '#fbbf24', g, 40, 40, 1,
    `<ellipse cx="0" cy="6" rx="10" ry="4" fill="${g}" opacity="0.3"/>`);

  writeSVG(path.join(bz, 'ch2.svg'), makeDark(400, 400, g, '#0a140f', 'عشق پنهانی', `
    ${crescentMoon(200, 65, 18, '#e2e8f0')}
    ${stars(200, 50, 100, '#fff', 6)}
    ${flowerBush(100, 260, 16, '#86efac')}
    ${flowerBush(300, 260, 16, '#86efac')}
    ${persianArch(200, 235, 85, 75, '#86efac')}
    <circle cx="188" cy="175" r="3" fill="#86efac" opacity="0.3"/>
    <circle cx="212" cy="175" r="3" fill="#86efac" opacity="0.3"/>
    <path d="M186 195 Q200 210 214 195" fill="none" stroke="#86efac" stroke-width="1.5" opacity="0.2"/>
  `));
  monsterSVG(path.join(mb, 'ch2-monster.svg'), '#0a140f', '#86efac', g, 40, 40, 1,
    `<path d="M-6 6 Q0 -4 6 6" fill="none" stroke="#86efac" stroke-width="2"/>`);

  writeSVG(path.join(bz, 'ch3.svg'), makeDark(400, 400, '#4b5563', '#050a0f', 'غضب افراسیاب', `
    ${mountain(80, 230, 60, 60, '#4b5563')}
    ${mountain(320, 230, 60, 60, '#4b5563')}
    ${crescentMoon(310, 60, 14, '#e2e8f0')}
    ${stars(200, 55, 90, '#fff', 5)}
    <ellipse cx="200" cy="180" rx="40" ry="50" fill="#4b5563" opacity="0.05"/>
    <path d="M180 165 Q200 155 220 165" fill="none" stroke="#4b5563" stroke-width="2" opacity="0.3"/>
    <circle cx="192" cy="162" r="2" fill="#ef4444" opacity="0.4"/>
    <circle cx="208" cy="162" r="2" fill="#ef4444" opacity="0.4"/>
    <path d="M200 173 L200 210" stroke="#4b5563" stroke-width="1.5" opacity="0.3"/>
    <rect x="185" y="210" width="30" height="40" fill="#4b5563" opacity="0.1" rx="2"/>
  `));
  monsterSVG(path.join(mb, 'ch3-monster.svg'), '#050a0f', '#ef4444', '#4b5563', 40, 40, 1,
    `<circle cx="0" cy="4" r="10" fill="#4b5563" opacity="0.2"/>`);

  writeSVG(path.join(bz, 'ch4.svg'), makeDark(400, 400, '#22c55e', '#0a140f', 'منیژه در ایران', `
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${mountain(80, 230, 65, 60, '#22c55e')}
    ${mountain(320, 230, 65, 60, '#22c55e')}
    ${cypressTree(70, 270, 70, '#15803d')}
    ${cypressTree(330, 270, 70, '#15803d')}
    ${dome(200, 235, 95, 80, '#cbd5e1')}
    <ellipse cx="200" cy="185" rx="10" ry="16" fill="#fca5a5" opacity="0.08"/>
  `));
  monsterSVG(path.join(mb, 'ch4-monster.svg'), '#0a140f', '#22c55e', '#22c55e', 40, 40, 1,
    `<path d="M-8 0 L0 -8 L8 0" fill="none" stroke="#22c55e" stroke-width="2"/>`);

  writeSVG(path.join(bz, 'ch5.svg'), makeDark(400, 400, '#3b82f6', '#0a0a1a', 'رستم در توران', `
    ${crescentMoon(310, 60, 16, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 5)}
    ${dome(200, 235, 100, 85, '#cbd5e1')}
    <rect x="142" y="210" width="116" height="3" fill="#cbd5e1" opacity="0.3"/>
    ${warriorSil(200, 208, 2, '#fca5a5')}
    <rect x="0" y="250" width="400" height="3" fill="#3b82f6" opacity="0.3"/>
  `));
  monsterSVG(path.join(mb, 'ch5-monster.svg'), '#0a0a1a', '#3b82f6', '#3b82f6', 40, 40, 1,
    `<ellipse cx="0" cy="4" rx="12" ry="4" fill="#3b82f6" opacity="0.3"/>`);

  writeSVG(path.join(bz, 'ch6.svg'), makeDark(400, 400, '#f59e0b', '#0a140f', 'رهایی و بازگشت', `
    ${sunCircle(200, 65, 26, '#fbbf24')}
    ${mountain(70, 230, 70, 65, '#22c55e')}
    ${mountain(330, 230, 70, 65, '#22c55e')}
    ${cypressTree(60, 270, 75, '#15803d')}
    ${cypressTree(340, 270, 65, '#15803d')}
    ${horseFig(170, 238, 2, '#cbd5e1')}
    ${horseFig(240, 238, 2, '#cbd5e1')}
    ${warriorSil(170, 205, 1.8, '#fca5a5')}
    ${warriorSil(240, 205, 1.8, '#86efac')}
  `));
  monsterSVG(path.join(mb, 'ch6-monster.svg'), '#0a140f', '#f59e0b', '#f59e0b', 40, 40, 1,
    `<circle cx="0" cy="6" r="6" fill="#fbbf24" opacity="0.2"/>`);


  // ===== COVERS =====
  cover('سیاوش', path.join(COVERS_DIR, 'siavoshan.svg'), '#1a0a0f', c, '#ffeedd', `
    <circle cx="200" cy="115" r="60" fill="none" stroke="${c}" stroke-width="3" opacity="0.35"/>
    <circle cx="200" cy="115" r="45" fill="none" stroke="${c}" stroke-width="2" opacity="0.25"/>
    <path d="M175 95 L200 70 L225 95 L225 145 Q200 158 175 145Z" fill="${c}" opacity="0.65"/>
    <circle cx="200" cy="108" r="16" fill="#fbbf24" opacity="0.85"/>
    <circle cx="200" cy="108" r="5" fill="#1a0a0f"/>
    <path d="M178 132 Q200 150 222 132" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
    ${mountain(70, 145, 60, 55, c)}
    ${mountain(260, 145, 60, 55, c)}
    ${fire(200, 155, 18, '#f97316')}
  `);

  cover('بیژن و منیژه', path.join(COVERS_DIR, 'bizhan.svg'), '#0a140f', g, '#e8f5e9', `
    <circle cx="200" cy="115" r="55" fill="none" stroke="${g}" stroke-width="3" opacity="0.3"/>
    <circle cx="200" cy="115" r="40" fill="none" stroke="${g}" stroke-width="2" opacity="0.2"/>
    <circle cx="185" cy="106" r="3" fill="#86efac" opacity="0.6"/>
    <circle cx="215" cy="106" r="3" fill="#86efac" opacity="0.6"/>
    <path d="M185 120 Q200 134 215 120" fill="none" stroke="${g}" stroke-width="2" stroke-linecap="round"/>
    <path d="M170 95 L185 70 L200 95 L200 138 Q185 148 170 138Z" fill="${g}" opacity="0.5"/>
    <path d="M230 95 L215 70 L200 95 L200 138 Q215 148 230 138Z" fill="${g}" opacity="0.5"/>
    ${cypressTree(80, 145, 55, '#15803d')}
    ${cypressTree(320, 145, 55, '#15803d')}
    ${mountain(110, 148, 45, 40, g)}
    ${mountain(290, 148, 45, 40, g)}
  `);

  console.log('✅ All Siavosh and Bizhan SVGs generated!');
}

gen();
