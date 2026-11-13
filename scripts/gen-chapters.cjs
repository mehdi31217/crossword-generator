const path = require('path');
const { makeScene, makeSceneLight, writeSVG, cypressTree, mountain, sunCircle, warriorSil, horseFig, dome, crescentMoon, stars, crown, flowerBush, dragonBody, fire, waterWave, persianArch } = require('./svg-utils.cjs');

const CHAPTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'chapters');

function makeDark(w, h, accent, bgSolid, title, extra) {
  return makeScene(w, h, { bgSolid, bgTop: bgSolid, bgBot: '#000', accent, title, textColor: '#fff', content: extra });
}
function makeLight(w, h, accent, bgTop, bgBot, title, textColor, extra) {
  return makeSceneLight(w, h, { accent, bgTop, bgBot, title, textColor, content: extra });
}

function gen() {
  const dir = (name) => path.join(CHAPTERS_DIR, name);

  // ===== ROSTAM 7 =====
  const r7 = dir('rostam7');
  const c = '#d97706';

  writeSVG(path.join(r7, 'khan1.svg'), makeDark(400, 400, c, '#1a1614', 'خوان اول: نبرد رخش با شیر', `
    ${mountain(80, 230, 70, 65, c)}
    ${mountain(320, 230, 70, 65, c)}
    ${cypressTree(70, 270, 70, '#2d6a4f')}
    ${cypressTree(330, 270, 60, '#2d6a4f')}
    ${crescentMoon(320, 60, 16, '#e2e8f0')}
    ${stars(200, 60, 80, '#fff', 4)}
    ${horseFig(200, 240, 2.2, c)}
    <ellipse cx="200" cy="190" rx="45" ry="28" fill="${c}" opacity="0.12"/>
    <circle cx="175" cy="185" r="5" fill="${c}" opacity="0.8"/>
    <circle cx="225" cy="185" r="5" fill="${c}" opacity="0.8"/>
    <path d="M165 165 Q200 145 235 165" fill="none" stroke="${c}" stroke-width="2" opacity="0.4"/>
    <path d="M180 205 Q200 220 220 205" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.3"/>
    <ellipse cx="200" cy="195" rx="30" ry="10" fill="${c}" opacity="0.15"/>
  `));

  writeSVG(path.join(r7, 'khan2.svg'), makeDark(400, 400, c, '#1a1614', 'خوان دوم: بیابان بی‌آب', `
    ${sunCircle(200, 70, 30, '#fbbf24')}
    ${mountain(80, 230, 70, 65, c)}
    ${mountain(320, 230, 70, 65, c)}
    ${warriorSil(200, 205, 1.8, c)}
    <path d="M120 235 Q200 225 280 235" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
    <path d="M140 248 Q200 240 260 248" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="3 6" opacity="0.3"/>
    <circle cx="120" cy="160" r="8" fill="none" stroke="${c}" stroke-width="1" opacity="0.25"/>
    <circle cx="280" cy="140" r="6" fill="none" stroke="${c}" stroke-width="1" opacity="0.25"/>
    <path d="M130 165 L140 175" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
    <path d="M270 145 L280 155" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
  `));

  writeSVG(path.join(r7, 'khan3.svg'), makeDark(400, 400, '#dc2626', '#0f0f0f', 'خوان سوم: جنگ با اژدها', `
    ${mountain(80, 230, 70, 65, '#dc2626')}
    ${mountain(320, 230, 70, 65, '#dc2626')}
    ${dragonBody(200, 195, 2.3, '#dc2626')}
    ${fire(200, 245, 35, '#f97316')}
    <ellipse cx="200" cy="140" rx="50" ry="35" fill="#dc2626" opacity="0.06"/>
    ${stars(200, 55, 90, '#fff', 3)}
  `));

  writeSVG(path.join(r7, 'khan4.svg'), makeDark(400, 400, '#7c3aed', '#0d0d1a', 'خوان چهارم: زن جادوگر', `
    ${crescentMoon(310, 65, 16, '#e2e8f0')}
    ${stars(200, 55, 100, '#fff', 5)}
    ${cypressTree(80, 270, 65, '#2d6a4f')}
    ${cypressTree(320, 270, 65, '#2d6a4f')}
    ${fire(200, 240, 30, '#a78bfa')}
    <path d="M180 170 Q200 150 220 170" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.3"/>
    <ellipse cx="200" cy="165" rx="18" ry="24" fill="#a78bfa" opacity="0.08"/>
    <circle cx="190" cy="160" r="2.5" fill="#a78bfa" opacity="0.5"/>
    <circle cx="210" cy="160" r="2.5" fill="#a78bfa" opacity="0.5"/>
    <path d="M200 180 L200 210" stroke="#a78bfa" stroke-width="1.5" opacity="0.3"/>
    <path d="M182 200 Q200 215 218 200" fill="none" stroke="#a78bfa" stroke-width="1" opacity="0.2"/>
    <path d="M200 80 L210 100" stroke="#a78bfa" stroke-width="1" opacity="0.2"/>
    <path d="M180 90 L205 105" stroke="#a78bfa" stroke-width="1" opacity="0.2"/>
  `));

  writeSVG(path.join(r7, 'khan5.svg'), makeDark(400, 400, '#059669', '#0a1a0f', 'خوان پنجم: اولاد مرزبان', `
    ${stars(200, 50, 100, '#fff', 6)}
    ${mountain(80, 230, 60, 60, '#059669')}
    ${mountain(320, 230, 60, 60, '#059669')}
    ${cypressTree(60, 270, 70, '#2d6a4f')}
    ${cypressTree(340, 270, 70, '#2d6a4f')}
    ${warriorSil(140, 210, 2, '#34d399')}
    ${warriorSil(260, 210, 2.2, c)}
    ${horseFig(140, 238, 2, '#34d399')}
    <path d="M165 220 L180 210" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.5"/>
  `));

  writeSVG(path.join(r7, 'khan6.svg'), makeDark(400, 400, '#dc2626', '#1a0505', 'خوان ششم: ارژنگ دیو', `
    ${mountain(80, 230, 70, 65, '#dc2626')}
    ${mountain(320, 230, 70, 65, '#dc2626')}
    ${fire(180, 236, 25, '#f97316')}
    ${fire(220, 236, 25, '#f97316')}
    <circle cx="200" cy="155" r="45" fill="#dc2626" opacity="0.08"/>
    <path d="M160 155 Q200 125 240 155" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.5"/>
    <circle cx="175" cy="145" r="7" fill="#ef4444" opacity="0.7"/>
    <circle cx="225" cy="145" r="7" fill="#ef4444" opacity="0.7"/>
    <circle cx="175" cy="145" r="2.5" fill="black"/>
    <circle cx="225" cy="145" r="2.5" fill="black"/>
    <path d="M180 195 Q200 225 220 195" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.4"/>
    ${warriorSil(200, 212, 2.5, '#fca5a5')}
  `));

  writeSVG(path.join(r7, 'khan7.svg'), makeDark(400, 400, '#6b7280', '#0a0a0f', 'خوان هفتم: دیو سپید', `
    ${mountain(80, 230, 70, 65, '#6b7280')}
    ${mountain(320, 230, 70, 65, '#6b7280')}
    ${crescentMoon(200, 65, 14, '#e2e8f0')}
    ${stars(200, 55, 90, '#fff', 4)}
    <ellipse cx="200" cy="155" rx="60" ry="50" fill="#9ca3af" opacity="0.06"/>
    <circle cx="200" cy="145" r="35" fill="#9ca3af" opacity="0.05"/>
    <circle cx="178" cy="140" r="10" fill="#ef4444" opacity="0.45"/>
    <circle cx="222" cy="140" r="10" fill="#ef4444" opacity="0.45"/>
    <circle cx="178" cy="140" r="3" fill="black"/>
    <circle cx="222" cy="140" r="3" fill="black"/>
    <path d="M168 125 Q200 105 232 125" fill="none" stroke="#9ca3af" stroke-width="2.5" opacity="0.4"/>
    <path d="M158 190 Q200 220 242 190" fill="none" stroke="#9ca3af" stroke-width="2" opacity="0.3"/>
    ${crown(200, 95, 1.8, '#fbbf24')}
  `));

  // ===== ROSTAM & SOHRAB =====
  const soh = dir('sohrab');
  const s = '#b91c1c';

  writeSVG(path.join(soh, 'ch1.svg'), makeDark(400, 400, s, '#1a0f0f', 'شکار در توران', `
    ${mountain(80, 230, 70, 65, s)}
    ${mountain(320, 230, 70, 65, s)}
    ${sunCircle(200, 65, 26, '#fbbf24')}
    ${cypressTree(60, 270, 75, '#2d6a4f')}
    ${cypressTree(340, 270, 65, '#2d6a4f')}
    ${flowerBush(120, 260, 14, '#fbbf24')}
    ${flowerBush(280, 260, 14, '#fbbf24')}
    ${horseFig(200, 238, 2.2, '#cbd5e1')}
    ${warriorSil(160, 205, 1.7, s)}
  `));

  writeSVG(path.join(soh, 'ch2.svg'), makeDark(400, 400, s, '#1a0f0f', 'دژ سمنگان', `
    ${crescentMoon(310, 60, 16, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 5)}
    ${cypressTree(80, 270, 70, '#2d6a4f')}
    ${cypressTree(320, 270, 70, '#2d6a4f')}
    ${dome(200, 235, 120, 85, '#cbd5e1')}
    <rect x="142" y="205" width="116" height="3" fill="#cbd5e1" opacity="0.4"/>
    <rect x="148" y="220" width="104" height="3" fill="#cbd5e1" opacity="0.3"/>
  `));

  writeSVG(path.join(soh, 'ch3.svg'), makeDark(400, 400, s, '#1a0f0f', 'تهمینه', `
    ${crescentMoon(200, 65, 18, '#e2e8f0')}
    ${stars(200, 50, 100, '#fff', 6)}
    ${flowerBush(100, 260, 16, '#fca5a5')}
    ${flowerBush(300, 260, 16, '#fca5a5')}
    ${persianArch(200, 235, 90, 80, '#fca5a5')}
    <path d="M185 178 Q200 158 215 178" fill="none" stroke="#fca5a5" stroke-width="2" opacity="0.3"/>
    <ellipse cx="200" cy="173" rx="14" ry="20" fill="#fca5a5" opacity="0.06"/>
    <circle cx="192" cy="168" r="2.5" fill="#fca5a5" opacity="0.6"/>
    <circle cx="208" cy="168" r="2.5" fill="#fca5a5" opacity="0.6"/>
    <path d="M200 188 L200 213" stroke="#fca5a5" stroke-width="1.5" opacity="0.3"/>
    <path d="M186 205 Q200 218 214 205" fill="none" stroke="#fca5a5" stroke-width="1" opacity="0.2"/>
    ${crown(200, 85, 1.5, '#fbbf24')}
  `));

  writeSVG(path.join(soh, 'ch4.svg'), makeDark(400, 400, '#7c3aed', '#0d0a1a', 'زادن سهراب', `
    ${sunCircle(200, 60, 22, '#fbbf24')}
    ${stars(200, 50, 90, '#fff', 4)}
    <ellipse cx="200" cy="140" rx="55" ry="40" fill="#7c3aed" opacity="0.05"/>
    <circle cx="200" cy="140" r="18" fill="#a78bfa" opacity="0.12"/>
    <circle cx="200" cy="140" r="8" fill="#c4b5fd" opacity="0.18"/>
    <circle cx="200" cy="140" r="3" fill="#fff" opacity="0.3"/>
    <path d="M180 192 Q200 175 220 192" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.4"/>
    <path d="M160 212 Q200 195 240 212" fill="none" stroke="#7c3aed" stroke-width="1.5" opacity="0.3"/>
    ${crown(200, 72, 2, '#fbbf24')}
  `));

  writeSVG(path.join(soh, 'ch5.svg'), makeDark(400, 400, '#475569', '#0f0f12', 'دژ سپید', `
    ${mountain(80, 230, 70, 65, '#475569')}
    ${mountain(320, 230, 70, 65, '#475569')}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${cypressTree(60, 270, 70, '#2d6a4f')}
    ${cypressTree(340, 270, 70, '#2d6a4f')}
    ${dome(200, 230, 110, 85, '#94a3b8')}
    <rect x="148" y="200" width="104" height="4" fill="#94a3b8" opacity="0.5"/>
    ${warriorSil(160, 205, 1.8, '#fca5a5')}
    ${warriorSil(240, 205, 2, '#94a3b8')}
  `));

  writeSVG(path.join(soh, 'ch6.svg'), makeDark(400, 400, '#dc2626', '#0f0505', 'رویارویی', `
    ${mountain(80, 230, 70, 65, '#dc2626')}
    ${mountain(320, 230, 70, 65, '#dc2626')}
    ${sunCircle(200, 65, 24, '#fbbf24')}
    ${fire(200, 236, 30, '#f97316')}
    ${warriorSil(140, 210, 2.2, '#fca5a5')}
    ${warriorSil(260, 210, 2.5, s)}
    ${horseFig(140, 238, 2, '#cbd5e1')}
    ${horseFig(260, 238, 2.2, '#854d0e')}
    <line x1="195" y1="170" x2="205" y2="170" stroke="#dc2626" stroke-width="1.5" opacity="0.5"/>
    <line x1="195" y1="180" x2="205" y2="180" stroke="#dc2626" stroke-width="1.5" opacity="0.5"/>
    <line x1="195" y1="190" x2="205" y2="190" stroke="#dc2626" stroke-width="1.5" opacity="0.5"/>
  `));

  writeSVG(path.join(soh, 'ch7.svg'), makeDark(400, 400, '#6b7280', '#0a0a0f', 'پایان تراژیک', `
    ${mountain(80, 230, 70, 65, '#6b7280')}
    ${mountain(320, 230, 70, 65, '#6b7280')}
    ${crescentMoon(310, 60, 14, '#e2e8f0')}
    ${stars(200, 55, 90, '#fff', 5)}
    <ellipse cx="200" cy="168" rx="35" ry="48" fill="#6b7280" opacity="0.06"/>
    <path d="M185 158 Q200 143 215 158" fill="none" stroke="#6b7280" stroke-width="2" opacity="0.3"/>
    <circle cx="193" cy="153" r="2" fill="#ef4444" opacity="0.5"/>
    <circle cx="207" cy="153" r="2" fill="#ef4444" opacity="0.5"/>
    <path d="M200 168 L200 200" stroke="#6b7280" stroke-width="1.5" opacity="0.3"/>
    <path d="M180 192 Q200 208 220 192" fill="none" stroke="#6b7280" stroke-width="1.5" opacity="0.2"/>
    <path d="M170 180 L230 180" stroke="#ef4444" stroke-width="0.8" opacity="0.3"/>
    <circle cx="200" cy="205" r="6" fill="#ef4444" opacity="0.15"/>
  `));

  // ===== ROSTAM & AFRASIAB =====
  const afr = dir('afrasiab');
  const a = '#4f46e5';

  writeSVG(path.join(afr, 'ch1.svg'), makeDark(400, 400, a, '#0a0a1a', 'دشمن دیرین', `
    ${mountain(80, 230, 65, 65, a)}
    ${mountain(320, 230, 65, 65, a)}
    ${crescentMoon(200, 60, 14, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 5)}
    ${cypressTree(60, 270, 70, '#2d6a4f')}
    ${cypressTree(340, 270, 70, '#2d6a4f')}
    ${fire(200, 235, 25, '#f97316')}
    ${crown(200, 82, 2.5, '#fbbf24')}
    ${warriorSil(140, 205, 2, a)}
    ${warriorSil(260, 205, 2.2, '#fca5a5')}
    <line x1="180" y1="170" x2="220" y2="170" stroke="${a}" stroke-width="1" stroke-dasharray="4 2" opacity="0.5"/>
  `));

  writeSVG(path.join(afr, 'ch2.svg'), makeDark(400, 400, a, '#0a0a1a', 'نبرد در هامون', `
    ${sunCircle(200, 65, 26, '#fbbf24')}
    ${mountain(80, 230, 70, 65, a)}
    ${mountain(320, 230, 70, 65, a)}
    ${fire(180, 235, 25, '#f97316')}
    ${fire(220, 235, 25, '#f97316')}
    ${warriorSil(140, 205, 2.2, '#fca5a5')}
    ${warriorSil(260, 205, 2.2, a)}
    ${horseFig(140, 236, 2, '#cbd5e1')}
    ${horseFig(260, 236, 2, '#854d0e')}
    <line x1="195" y1="170" x2="205" y2="170" stroke="#dc2626" stroke-width="1.5" opacity="0.4"/>
    <line x1="195" y1="180" x2="205" y2="180" stroke="#dc2626" stroke-width="1.5" opacity="0.4"/>
  `));

  writeSVG(path.join(afr, 'ch3.svg'), makeDark(400, 400, a, '#0a0a1a', 'کمین افراسیاب', `
    ${mountain(80, 230, 70, 65, a)}
    ${mountain(320, 230, 70, 65, a)}
    ${crescentMoon(310, 60, 12, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 5)}
    <polygon points="140,120 260,120 200,80" fill="${a}" opacity="0.08"/>
    <polygon points="160,130 240,130 200,100" fill="none" stroke="${a}" stroke-width="1" opacity="0.3"/>
    <path d="M120 240 L180 210" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 2" opacity="0.3"/>
    ${warriorSil(200, 205, 2, '#fca5a5')}
    <line x1="185" y1="90" x2="215" y2="90" stroke="${a}" stroke-width="1" opacity="0.4"/>
  `));

  writeSVG(path.join(afr, 'ch4.svg'), makeDark(400, 400, '#7c3aed', '#0d0a1a', 'پیکار با جادو', `
    ${crescentMoon(320, 60, 13, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 4)}
    ${fire(200, 235, 30, '#a78bfa')}
    <ellipse cx="200" cy="153" rx="50" ry="40" fill="#7c3aed" opacity="0.06"/>
    <circle cx="175" cy="148" r="6" fill="#a78bfa" opacity="0.6"/>
    <circle cx="225" cy="148" r="6" fill="#a78bfa" opacity="0.6"/>
    <circle cx="175" cy="148" r="2" fill="black"/>
    <circle cx="225" cy="148" r="2" fill="black"/>
    <path d="M165 128 Q200 108 235 128" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.4"/>
    <path d="M170 195 Q200 215 230 195" fill="none" stroke="#a78bfa" stroke-width="2.5" opacity="0.3"/>
    ${warriorSil(200, 208, 2.2, '#fca5a5')}
  `));

  writeSVG(path.join(afr, 'ch5.svg'), makeDark(400, 400, '#dc2626', '#0a0505', 'جنگ هفت گردان', `
    ${mountain(80, 230, 70, 65, '#dc2626')}
    ${mountain(320, 230, 70, 65, '#dc2626')}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${fire(200, 235, 30, '#f97316')}
    ${warriorSil(80, 205, 1.6, a)}
    ${warriorSil(130, 205, 1.7, a)}
    ${warriorSil(180, 205, 1.8, a)}
    ${warriorSil(260, 205, 2.2, '#fca5a5')}
    ${warriorSil(310, 205, 2, '#fca5a5')}
    <line x1="210" y1="170" x2="250" y2="170" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 2" opacity="0.5"/>
  `));

  writeSVG(path.join(afr, 'ch6.svg'), makeDark(400, 400, a, '#0a0a1a', 'تاختن به توران', `
    ${mountain(80, 230, 70, 65, a)}
    ${mountain(320, 230, 70, 65, a)}
    ${sunCircle(200, 65, 24, '#fbbf24')}
    ${fire(200, 235, 30, '#f97316')}
    ${dome(200, 230, 120, 80, '#818cf8')}
    <rect x="145" y="200" width="110" height="3" fill="#818cf8" opacity="0.5"/>
    ${warriorSil(140, 205, 2, '#fca5a5')}
    ${horseFig(140, 236, 2, '#cbd5e1')}
    <line x1="180" y1="165" x2="220" y2="165" stroke="${a}" stroke-width="1" stroke-dasharray="4 2" opacity="0.4"/>
  `));

  writeSVG(path.join(afr, 'ch7.svg'), makeDark(400, 400, '#fbbf24', '#0a0a0f', 'کیفر افراسیاب', `
    ${mountain(80, 230, 70, 65, '#6b7280')}
    ${mountain(320, 230, 70, 65, '#6b7280')}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${cypressTree(60, 270, 75, '#2d6a4f')}
    ${cypressTree(340, 270, 75, '#2d6a4f')}
    ${crown(200, 80, 3, '#fbbf24')}
    <path d="M170 190 L230 190" stroke="#fbbf24" stroke-width="2" opacity="0.5"/>
    <circle cx="200" cy="158" r="20" fill="#fbbf24" opacity="0.06"/>
    <line x1="190" y1="158" x2="210" y2="158" stroke="#fbbf24" stroke-width="1.5" opacity="0.3"/>
    <line x1="200" y1="148" x2="200" y2="168" stroke="#fbbf24" stroke-width="1.5" opacity="0.3"/>
    ${warriorSil(140, 205, 1.8, '#fca5a5')}
  `));

  // ===== HASSAN KACHAL =====
  const has = dir('hassan');
  const h = '#db2777';

  writeSVG(path.join(has, 'ch1.svg'), makeLight(400, 400, h, '#fff1f2', '#fdf2f8', 'نقشه ننه حسن', '#881337', `
    ${sunCircle(200, 60, 22, '#fbbf24')}
    ${flowerBush(100, 250, 18, '#fbcfe8')}
    ${flowerBush(300, 250, 18, '#fbcfe8')}
    <circle cx="200" cy="128" r="25" fill="#fbcfe8" opacity="0.5"/>
    <circle cx="200" cy="128" r="15" fill="#fce7f3" opacity="0.6"/>
    <circle cx="192" cy="124" r="2.5" fill="#831843"/>
    <circle cx="208" cy="124" r="2.5" fill="#831843"/>
    <ellipse cx="200" cy="132" rx="5" ry="2.5" fill="${h}"/>
    <path d="M190 138 Q200 146 210 138" fill="none" stroke="${h}" stroke-width="2"/>
    <circle cx="100" cy="200" r="6" fill="#ef4444" opacity="0.7"/>
    <circle cx="160" cy="215" r="6" fill="#ef4444" opacity="0.6"/>
    <circle cx="240" cy="210" r="6" fill="#ef4444" opacity="0.6"/>
    <circle cx="300" cy="205" r="6" fill="#ef4444" opacity="0.5"/>
    <circle cx="130" cy="210" r="5" fill="#ef4444" opacity="0.5"/>
    <circle cx="270" cy="215" r="5" fill="#ef4444" opacity="0.5"/>
  `));

  writeSVG(path.join(has, 'ch2.svg'), makeDark(400, 400, '#16a34a', '#052e05', 'باغ اسرارآمیز', `
    ${crescentMoon(310, 60, 13, '#e2e8f0')}
    ${stars(200, 50, 90, '#fff', 5)}
    ${cypressTree(60, 270, 75, '#2d6a4f')}
    ${cypressTree(340, 270, 75, '#2d6a4f')}
    <rect x="80" y="140" width="240" height="80" rx="5" fill="#16a34a" opacity="0.06"/>
    ${flowerBush(100, 230, 18, '#dc2626')}
    ${flowerBush(160, 235, 15, '#fbbf24')}
    ${flowerBush(240, 232, 16, '#dc2626')}
    ${flowerBush(300, 228, 15, '#fbbf24')}
    <ellipse cx="200" cy="150" rx="20" ry="35" fill="#14532d" opacity="0.3"/>
    <circle cx="200" cy="150" r="12" fill="#fca5a5" opacity="0.06"/>
    <path d="M190 170 Q200 165 210 170" fill="none" stroke="#16a34a" stroke-width="1" opacity="0.4"/>
  `));

  writeSVG(path.join(has, 'ch3.svg'), makeDark(400, 400, '#fbbf24', '#1a0f05', 'شکستن طلسم', `
    ${sunCircle(200, 60, 22, '#fbbf24')}
    ${stars(200, 50, 90, '#fff', 4)}
    <polygon points="200,95 180,135 220,135" fill="#fbbf24" opacity="0.25"/>
    <polygon points="200,100 186,130 214,130" fill="#fef08a" opacity="0.18"/>
    <circle cx="200" cy="108" r="6" fill="#fef08a" opacity="0.45"/>
    <line x1="200" y1="108" x2="200" y2="130" stroke="#fbbf24" stroke-width="1.5" opacity="0.4"/>
    <line x1="190" y1="118" x2="210" y2="118" stroke="#fbbf24" stroke-width="1.5" opacity="0.4"/>
    <path d="M120 235 Q200 205 280 235" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.3"/>
    <path d="M140 248 Q200 220 260 248" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.2"/>
    ${warriorSil(200, 195, 1.8, '#fcd34d')}
  `));

  // ===== FARSI AVAL =====
  const farsi = dir('farsi-aval');
  const f = '#0ea5e9';

  writeSVG(path.join(farsi, 'ch1.svg'), makeLight(400, 400, f, '#f0f9ff', '#e0f2fe', 'درس اول: آب', '#0c4a6e', `
    ${mountain(80, 210, 60, 55, '#0c4a6e', 2)}
    ${mountain(320, 210, 60, 55, '#0c4a6e', 2)}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${waterWave(200, 235, 140, '#0ea5e9')}
    <text x="200" y="225" text-anchor="middle" font-family="serif" font-size="52" fill="${f}" opacity="0.4" dir="rtl">آب</text>
    <text x="200" y="250" text-anchor="middle" font-family="serif" font-size="16" fill="${f}" opacity="0.25" dir="rtl">بابا آب داد</text>
  `));

  writeSVG(path.join(farsi, 'ch2.svg'), makeLight(400, 400, f, '#f0f9ff', '#bae6fd', 'درس دوم: باران', '#0c4a6e', `
    ${mountain(80, 210, 60, 55, '#0c4a6e', 2)}
    ${mountain(320, 210, 60, 55, '#0c4a6e', 2)}
    <text x="200" y="235" text-anchor="middle" font-family="serif" font-size="42" fill="${f}" opacity="0.4" dir="rtl">باران</text>
    <line x1="100" y1="80" x2="100" y2="120" stroke="#0ea5e9" stroke-width="1.5" opacity="0.3"/>
    <line x1="130" y1="90" x2="130" y2="115" stroke="#0ea5e9" stroke-width="1.5" opacity="0.25"/>
    <line x1="250" y1="85" x2="250" y2="125" stroke="#0ea5e9" stroke-width="1.5" opacity="0.3"/>
    <line x1="280" y1="95" x2="280" y2="120" stroke="#0ea5e9" stroke-width="1.5" opacity="0.25"/>
    <line x1="300" y1="80" x2="300" y2="110" stroke="#0ea5e9" stroke-width="1.5" opacity="0.2"/>
    <circle cx="110" cy="75" r="3" fill="#0ea5e9" opacity="0.3"/>
    <circle cx="260" cy="80" r="3" fill="#0ea5e9" opacity="0.3"/>
    <circle cx="290" cy="78" r="2" fill="#0ea5e9" opacity="0.25"/>
    <ellipse cx="200" cy="120" rx="60" ry="12" fill="#bae6fd" opacity="0.3"/>
  `));

  writeSVG(path.join(farsi, 'ch3.svg'), makeLight(400, 400, '#f59e0b', '#fff7ed', '#fef3c7', 'درس سوم: مدرسه', '#92400e', `
    ${sunCircle(200, 65, 20, '#fbbf24')}
    <rect x="130" y="145" width="140" height="75" rx="4" fill="#f59e0b" opacity="0.06"/>
    <rect x="148" y="155" width="14" height="65" rx="2" fill="#f59e0b" opacity="0.2"/>
    <rect x="168" y="155" width="14" height="65" rx="2" fill="#f59e0b" opacity="0.15"/>
    <rect x="190" y="155" width="14" height="65" rx="2" fill="#f59e0b" opacity="0.2"/>
    <rect x="210" y="155" width="14" height="65" rx="2" fill="#f59e0b" opacity="0.15"/>
    <rect x="230" y="155" width="14" height="65" rx="2" fill="#f59e0b" opacity="0.2"/>
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="36" fill="#f59e0b" opacity="0.4" dir="rtl">مدرسه</text>
    ${flowerBush(70, 250, 14, '#f59e0b')}
    ${flowerBush(330, 250, 14, '#f59e0b')}
  `));

  writeSVG(path.join(farsi, 'ch4.svg'), makeLight(400, 400, '#dc2626', '#fef2f2', '#fecaca', 'درس چهارم: انار', '#7f1d1d', `
    ${mountain(80, 210, 60, 55, '#dc2626', 2)}
    ${mountain(320, 210, 60, 55, '#dc2626', 2)}
    ${sunCircle(200, 65, 20, '#fbbf24')}
    ${cypressTree(60, 260, 60, '#2d6a4f')}
    ${cypressTree(340, 260, 60, '#2d6a4f')}
    <circle cx="200" cy="150" r="32" fill="#dc2626" opacity="0.15"/>
    <circle cx="200" cy="150" r="25" fill="#ef4444" opacity="0.1"/>
    <circle cx="194" cy="145" r="3" fill="#fca5a5" opacity="0.5"/>
    <circle cx="210" cy="148" r="3" fill="#fca5a5" opacity="0.5"/>
    <circle cx="200" cy="155" r="3" fill="#fca5a5" opacity="0.5"/>
    <circle cx="188" cy="152" r="2.5" fill="#fca5a5" opacity="0.4"/>
    <circle cx="206" cy="142" r="2.5" fill="#fca5a5" opacity="0.4"/>
    <path d="M200 116 L205 128 L195 128Z" fill="#166534" opacity="0.5"/>
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="36" fill="#dc2626" opacity="0.4" dir="rtl">انار</text>
  `));

  writeSVG(path.join(farsi, 'ch5.svg'), makeLight(400, 400, '#22c55e', '#f0fdf4', '#dcfce7', 'درس پنجم: ایران', '#166534', `
    ${mountain(80, 210, 60, 55, '#22c55e', 2)}
    ${mountain(320, 210, 60, 55, '#22c55e', 2)}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${cypressTree(60, 260, 70, '#2d6a4f')}
    ${cypressTree(340, 260, 70, '#2d6a4f')}
    <rect x="135" y="135" width="130" height="85" rx="3" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.4"/>
    <rect x="135" y="135" width="43" height="28" fill="#22c55e" opacity="0.25"/>
    <rect x="178" y="135" width="43" height="28" fill="#f8fafc" opacity="0.5"/>
    <rect x="221" y="135" width="44" height="28" fill="#dc2626" opacity="0.25"/>
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="36" fill="#0ea5e9" opacity="0.4" dir="rtl">ایران</text>
  `));

  writeSVG(path.join(farsi, 'ch6.svg'), makeLight(400, 400, '#f97316', '#fff7ed', '#ffedd5', 'درس ششم: بدن', '#9a3412', `
    ${sunCircle(200, 65, 20, '#fbbf24')}
    <circle cx="200" cy="120" r="18" fill="#f97316" opacity="0.08"/>
    <path d="M185 138 L215 138 L220 200 L180 200Z" fill="#f97316" opacity="0.06"/>
    <line x1="200" y1="150" x2="170" y2="195" stroke="#f97316" stroke-width="2" opacity="0.2"/>
    <line x1="200" y1="150" x2="230" y2="195" stroke="#f97316" stroke-width="2" opacity="0.2"/>
    <line x1="200" y1="180" x2="185" y2="220" stroke="#f97316" stroke-width="2" opacity="0.12"/>
    <line x1="200" y1="180" x2="215" y2="220" stroke="#f97316" stroke-width="2" opacity="0.12"/>
    <circle cx="192" cy="116" r="2.5" fill="#f97316" opacity="0.4"/>
    <circle cx="208" cy="116" r="2.5" fill="#f97316" opacity="0.4"/>
    <path d="M193 125 Q200 132 207 125" fill="none" stroke="#f97316" stroke-width="1.5" opacity="0.3"/>
    <text x="200" y="245" text-anchor="middle" font-family="serif" font-size="36" fill="#f97316" opacity="0.4" dir="rtl">بدن</text>
  `));

  writeSVG(path.join(farsi, 'ch7.svg'), makeLight(400, 400, '#0891b2', '#ecfeff', '#cffafe', 'درس هفتم: حیوانات', '#155e75', `
    ${mountain(80, 210, 60, 55, '#0891b2', 2)}
    ${mountain(320, 210, 60, 55, '#0891b2', 2)}
    ${sunCircle(200, 65, 20, '#fbbf24')}
    ${cypressTree(60, 260, 60, '#2d6a4f')}
    ${cypressTree(340, 260, 60, '#2d6a4f')}
    ${flowerBush(100, 245, 12, '#0891b2')}
    ${flowerBush(300, 245, 12, '#0891b2')}
    <circle cx="100" cy="160" r="8" fill="#0891b2" opacity="0.12"/>
    <ellipse cx="100" cy="170" rx="15" ry="7" fill="#0891b2" opacity="0.08"/>
    <circle cx="280" cy="150" r="10" fill="#0891b2" opacity="0.12"/>
    <ellipse cx="280" cy="162" rx="18" ry="7" fill="#0891b2" opacity="0.08"/>
    <path d="M130 195 Q150 165 170 195 Q190 165 210 195 Q230 165 250 195 Q270 165 290 195" fill="none" stroke="#0891b2" stroke-width="2" opacity="0.2"/>
    <text x="200" y="245" text-anchor="middle" font-family="serif" font-size="36" fill="#0891b2" opacity="0.4" dir="rtl">حیوانات</text>
  `));

  writeSVG(path.join(farsi, 'ch8.svg'), makeLight(400, 400, '#e11d48', '#fff1f2', '#ffe4e6', 'درس هشتم: خانواده', '#881337', `
    ${sunCircle(200, 65, 20, '#fbbf24')}
    ${flowerBush(80, 245, 16, '#e11d48')}
    ${flowerBush(320, 245, 16, '#e11d48')}
    <circle cx="200" cy="118" r="14" fill="#e11d48" opacity="0.08"/>
    <path d="M188 132 L212 132 L216 180 L184 180Z" fill="#e11d48" opacity="0.06"/>
    <line x1="200" y1="145" x2="180" y2="170" stroke="#e11d48" stroke-width="1.5" opacity="0.2"/>
    <line x1="200" y1="145" x2="220" y2="170" stroke="#e11d48" stroke-width="1.5" opacity="0.2"/>
    <circle cx="160" cy="155" r="8" fill="#e11d48" opacity="0.07"/>
    <circle cx="240" cy="155" r="8" fill="#e11d48" opacity="0.07"/>
    <path d="M150 172 Q160 165 170 172" fill="none" stroke="#e11d48" stroke-width="1" opacity="0.15"/>
    <path d="M230 172 Q240 165 250 172" fill="none" stroke="#e11d48" stroke-width="1" opacity="0.15"/>
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="36" fill="#e11d48" opacity="0.4" dir="rtl">خانواده</text>
  `));

  writeSVG(path.join(farsi, 'ch9.svg'), makeLight(400, 400, '#16a34a', '#f0fdf4', '#dcfce7', 'درس نهم: طبیعت', '#166534', `
    ${mountain(60, 210, 50, 50, '#15803d', 2)}
    ${mountain(200, 215, 70, 65, '#15803d', 2)}
    ${mountain(340, 210, 50, 50, '#15803d', 2)}
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${cypressTree(80, 260, 65, '#2d6a4f')}
    ${cypressTree(320, 260, 65, '#2d6a4f')}
    ${flowerBush(140, 245, 14, '#16a34a')}
    ${flowerBush(260, 245, 14, '#16a34a')}
    ${waterWave(200, 235, 120, '#0ea5e9')}
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="36" fill="#16a34a" opacity="0.4" dir="rtl">طبیعت</text>
  `));

  writeSVG(path.join(farsi, 'ch10.svg'), makeLight(400, 400, '#f59e0b', '#fefce8', '#fef9c3', 'درس دهم: جشن تولد', '#92400e', `
    ${sunCircle(200, 65, 22, '#fbbf24')}
    ${flowerBush(80, 245, 16, '#f59e0b')}
    ${flowerBush(320, 245, 16, '#f59e0b')}
    <polygon points="200,95 190,120 210,120" fill="#f59e0b" opacity="0.25"/>
    <polygon points="200,90 192,115 208,115" fill="#fef08a" opacity="0.18"/>
    <circle cx="200" cy="122" r="5" fill="#f59e0b" opacity="0.12"/>
    <circle cx="155" cy="155" r="20" fill="#f59e0b" opacity="0.08"/>
    <circle cx="245" cy="155" r="20" fill="#f59e0b" opacity="0.08"/>
    <circle cx="200" cy="140" r="24" fill="#f59e0b" opacity="0.06"/>
    <circle cx="160" cy="153" r="2" fill="#f59e0b" opacity="0.3"/>
    <circle cx="240" cy="153" r="2" fill="#f59e0b" opacity="0.3"/>
    <circle cx="205" cy="138" r="2" fill="#f59e0b" opacity="0.3"/>
    <text x="200" y="240" text-anchor="middle" font-family="serif" font-size="34" fill="#f59e0b" opacity="0.4" dir="rtl">جشن تولد</text>
  `));

  console.log('All chapter SVGs generated!');
}

gen();
