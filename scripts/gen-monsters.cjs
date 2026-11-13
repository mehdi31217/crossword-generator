const path = require('path');
const { writeSVG } = require('./svg-utils.cjs');

const MONSTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'monsters');

function mon(dir, file, title, bg, accent, elements) {
  const w = 200, h = 200;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="mbg" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#000"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}" rx="40" opacity="0.25"/>
  <circle cx="${w / 2}" cy="${h * 0.42}" r="${w * 0.46}" fill="url(#mbg)" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
  ${elements}
  <rect x="0" y="${h - 24}" width="${w}" height="24" fill="${accent}" opacity="0.8" rx="0"/>
  <text x="${w / 2}" y="${h - 7}" text-anchor="middle" fill="#fff" font-family="serif" font-size="10" font-weight="bold" dir="rtl">${title}</text>
</svg>`;
  writeSVG(path.join(dir, file), svg);
}

function eye(cx, cy, r, color) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.7"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="black"/>`;
}

function horn(cx, cy, color) {
  return `<polygon points="${cx - 4},${cy} ${cx},${cy - 16} ${cx + 4},${cy}" fill="${color}" opacity="0.6"/>`;
}

// === ROSTAM 7 MONSTERS ===
const r7d = path.join(MONSTERS_DIR, 'rostam7');
mon(r7d, 'khan1-lion.svg', 'شیر بیشه', '#1c1917', '#c2410c', `
  <ellipse cx="100" cy="98" rx="45" ry="35" fill="#c2410c" opacity="0.12"/>
  ${eye(85, 93, 10, '#fb923c')}
  ${eye(115, 93, 10, '#fb923c')}
  <ellipse cx="100" cy="112" rx="30" ry="12" fill="#c2410c" opacity="0.45"/>
  <circle cx="90" cy="106" r="3" fill="#fef08a" opacity="0.4"/>
  <circle cx="110" cy="106" r="3" fill="#fef08a" opacity="0.4"/>
  <path d="M70 88 Q100 68 130 88" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round"/>
  <path d="M80 128 Q100 138 120 128" fill="none" stroke="#ea580c" stroke-width="2"/>
`);
mon(r7d, 'khan2-skull.svg', 'جمجمه کویر', '#1c1917', '#d4a574', `
  <ellipse cx="100" cy="95" rx="28" ry="32" fill="#d4a574" opacity="0.12"/>
  ${eye(85, 90, 6, '#ef4444')}
  ${eye(115, 90, 6, '#ef4444')}
  <ellipse cx="100" cy="100" rx="8" ry="4" fill="#d4a574" opacity="0.35"/>
  <line x1="90" y1="115" x2="110" y2="128" stroke="#d4a574" stroke-width="1.5" opacity="0.3"/>
  <line x1="110" y1="115" x2="90" y2="128" stroke="#d4a574" stroke-width="1.5" opacity="0.3"/>
  <path d="M100 90 L100 75" stroke="#d4a574" stroke-width="2" opacity="0.3"/>
  <circle cx="100" cy="72" r="4" fill="#d4a574" opacity="0.2"/>
`);
mon(r7d, 'khan3-dragon.svg', 'اژدها', '#0f0f0f', '#dc2626', `
  <path d="M55 100 Q100 65 145 100 Q120 120 100 130 Q80 120 55 100" fill="#dc2626" opacity="0.08"/>
  ${eye(85, 90, 8, '#ef4444')}
  ${eye(115, 90, 8, '#ef4444')}
  <path d="M75 80 Q100 65 125 80" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M80 115 Q100 125 120 115" fill="none" stroke="#dc2626" stroke-width="2"/>
  <path d="M90 105 L85 120" stroke="#ef4444" stroke-width="1" opacity="0.4"/>
  <path d="M110 105 L115 120" stroke="#ef4444" stroke-width="1" opacity="0.4"/>
  <path d="M65 100 Q55 90 50 95" fill="none" stroke="#dc2626" stroke-width="1.5" opacity="0.3"/>
`);
mon(r7d, 'khan4-witch.svg', 'جادوگر', '#0d0d1a', '#7c3aed', `
  <path d="M90 70 L100 50 L110 70 Z" fill="#7c3aed" opacity="0.25"/>
  <ellipse cx="100" cy="80" rx="20" ry="22" fill="#7c3aed" opacity="0.06"/>
  ${eye(92, 78, 3.5, '#a78bfa')}
  ${eye(108, 78, 3.5, '#a78bfa')}
  <ellipse cx="100" cy="84" rx="5" ry="2" fill="#a78bfa" opacity="0.3"/>
  <path d="M90 92 Q100 100 110 92" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity="0.3"/>
  <path d="M85 105 Q100 115 115 105" fill="none" stroke="#7c3aed" stroke-width="1" opacity="0.2"/>
  <circle cx="100" cy="72" r="4" fill="none" stroke="#a78bfa" stroke-width="0.8" opacity="0.3"/>
`);
mon(r7d, 'khan5-warrior.svg', 'اولاد مرزبان', '#0a1a0f', '#059669', `
  <circle cx="100" cy="75" r="10" fill="#059669" opacity="0.1"/>
  <path d="M90 85 L110 85 L115 110 L85 110Z" fill="#059669" opacity="0.08"/>
  <path d="M80 100 L120 100" stroke="#059669" stroke-width="2" opacity="0.3"/>
  <path d="M92 110 L92 130" stroke="#059669" stroke-width="2.5" opacity="0.2"/>
  <path d="M108 110 L108 130" stroke="#059669" stroke-width="2.5" opacity="0.2"/>
  <circle cx="100" cy="97" r="3" fill="#34d399" opacity="0.4"/>
`);
mon(r7d, 'khan6-demon.svg', 'ارژنگ دیو', '#1a0505', '#dc2626', `
  <circle cx="100" cy="80" r="30" fill="#dc2626" opacity="0.06"/>
  <path d="M60 80 Q100 55 140 80" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.5"/>
  ${eye(82, 75, 8, '#ef4444')}
  ${eye(118, 75, 8, '#ef4444')}
  <path d="M70 100 Q100 120 130 100" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.4"/>
  <polygon points="90,52 95,38 100,52" fill="#ef4444" opacity="0.4"/>
  <polygon points="100,52 105,38 110,52" fill="#ef4444" opacity="0.4"/>
`);
mon(r7d, 'khan7-white-beast.svg', 'دیو سپید', '#0a0a0f', '#6b7280', `
  <circle cx="100" cy="80" r="35" fill="#9ca3af" opacity="0.04"/>
  <circle cx="100" cy="80" r="20" fill="#9ca3af" opacity="0.06"/>
  ${eye(88, 76, 7, '#ef4444')}
  ${eye(112, 76, 7, '#ef4444')}
  <path d="M78 65 Q100 50 122 65" fill="none" stroke="#9ca3af" stroke-width="2.5" opacity="0.4"/>
  <path d="M75 102 Q100 118 125 102" fill="none" stroke="#9ca3af" stroke-width="2" opacity="0.3"/>
  ${horn(92, 60, '#6b7280')}
  ${horn(108, 60, '#6b7280')}
`);

// === SOHRAB MONSTERS ===
const sohd = path.join(MONSTERS_DIR, 'sohrab');
mon(sohd, 'wolf.svg', 'گرگ تورانی', '#1a0f0f', '#b91c1c', `
  <ellipse cx="100" cy="95" rx="35" ry="25" fill="#b91c1c" opacity="0.1"/>
  ${eye(85, 88, 8, '#ef4444')}
  ${eye(115, 88, 8, '#ef4444')}
  <path d="M65 80 Q100 60 135 80" fill="none" stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M80 108 Q100 118 120 108" fill="none" stroke="#b91c1c" stroke-width="2"/>
  <polygon points="72,72 76,62 82,72" fill="#b91c1c" opacity="0.4"/>
  <polygon points="118,72 124,62 128,72" fill="#b91c1c" opacity="0.4"/>
`);
mon(sohd, 'lion.svg', 'شیر دروازه‌بان', '#1a0f0f', '#c2410c', `
  <ellipse cx="100" cy="95" rx="40" ry="30" fill="#c2410c" opacity="0.1"/>
  ${eye(85, 90, 9, '#fb923c')}
  ${eye(115, 90, 9, '#fb923c')}
  <ellipse cx="100" cy="110" rx="25" ry="8" fill="#c2410c" opacity="0.4"/>
  <circle cx="92" cy="105" r="2.5" fill="#fef08a" opacity="0.35"/>
  <circle cx="108" cy="105" r="2.5" fill="#fef08a" opacity="0.35"/>
  <path d="M70 85 Q100 68 130 85" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round"/>
`);
mon(sohd, 'night-demon.svg', 'اهریمن شب', '#0d0a1a', '#7c3aed', `
  <circle cx="100" cy="85" r="25" fill="#7c3aed" opacity="0.06"/>
  ${eye(88, 82, 5, '#a78bfa')}
  ${eye(112, 82, 5, '#a78bfa')}
  <path d="M75 95 Q100 105 125 95" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.3"/>
  ${horn(92, 68, '#7c3aed')}
  ${horn(108, 68, '#7c3aed')}
  <path d="M80 65 Q100 52 120 65" fill="none" stroke="#a78bfa" stroke-width="1" opacity="0.2"/>
`);
mon(sohd, 'dragon.svg', 'اژدهای سامان', '#0f0f0f', '#dc2626', `
  <path d="M50 100 Q100 60 150 100 Q130 120 100 130 Q70 120 50 100" fill="#dc2626" opacity="0.06"/>
  ${eye(85, 88, 8, '#ef4444')}
  ${eye(115, 88, 8, '#ef4444')}
  <path d="M75 78 Q100 62 125 78" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M80 120 Q100 130 120 120" fill="none" stroke="#dc2626" stroke-width="2"/>
`);
mon(sohd, 'elephant.svg', 'پیل سپید', '#0f0f12', '#475569', `
  <ellipse cx="100" cy="100" rx="40" ry="30" fill="#475569" opacity="0.1"/>
  ${eye(85, 90, 6, '#94a3b8')}
  ${eye(115, 90, 6, '#94a3b8')}
  <path d="M60 90 Q100 70 140 90" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M80 120 Q100 130 120 120" fill="none" stroke="#475569" stroke-width="2"/>
  <ellipse cx="100" cy="108" rx="15" ry="6" fill="#475569" opacity="0.3"/>
`);
mon(sohd, 'giant.svg', 'غول نبرد', '#0a0505', '#dc2626', `
  <circle cx="100" cy="80" r="28" fill="#dc2626" opacity="0.06"/>
  ${eye(85, 76, 7, '#ef4444')}
  ${eye(115, 76, 7, '#ef4444')}
  <path d="M65 95 Q100 115 135 95" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.4"/>
  <path d="M90 105 L90 130" stroke="#dc2626" stroke-width="3" opacity="0.2"/>
  <path d="M110 105 L110 130" stroke="#dc2626" stroke-width="3" opacity="0.2"/>
  ${horn(92, 60, '#dc2626')}
  ${horn(108, 60, '#dc2626')}
`);
mon(sohd, 'fate.svg', 'تقدیر', '#0a0a0f', '#6b7280', `
  <circle cx="100" cy="80" r="25" fill="#6b7280" opacity="0.05"/>
  <circle cx="100" cy="80" r="15" fill="#9ca3af" opacity="0.08"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24" opacity="0.2"/>
  <path d="M75 100 Q100 115 125 100" fill="none" stroke="#6b7280" stroke-width="2" opacity="0.3"/>
  <path d="M80 68 Q100 55 120 68" fill="none" stroke="#6b7280" stroke-width="1.5" opacity="0.2"/>
`);

// === AFRASIAB MONSTERS ===
const afrd = path.join(MONSTERS_DIR, 'afrasiab');
mon(afrd, 'ancient-evil.svg', 'اهریمن دیرین', '#0a0a1a', '#4f46e5', `
  <circle cx="100" cy="80" r="30" fill="#4f46e5" opacity="0.06"/>
  ${eye(85, 76, 7, '#818cf8')}
  ${eye(115, 76, 7, '#818cf8')}
  <path d="M65 95 Q100 115 135 95" fill="none" stroke="#818cf8" stroke-width="2.5" opacity="0.4"/>
  ${horn(92, 58, '#4f46e5')}
  ${horn(108, 58, '#4f46e5')}
  <circle cx="100" cy="62" r="3" fill="#818cf8" opacity="0.3"/>
`);
mon(afrd, 'plain-giant.svg', 'غول دشت', '#0a0a1a', '#4f46e5', `
  <circle cx="100" cy="78" r="32" fill="#4f46e5" opacity="0.06"/>
  ${eye(85, 74, 8, '#818cf8')}
  ${eye(115, 74, 8, '#818cf8')}
  <path d="M62 95 Q100 118 138 95" fill="none" stroke="#818cf8" stroke-width="3" opacity="0.4"/>
  <path d="M88 105 L88 132" stroke="#4f46e5" stroke-width="3" opacity="0.2"/>
  <path d="M112 105 L112 132" stroke="#4f46e5" stroke-width="3" opacity="0.2"/>
  ${horn(90, 56, '#4f46e5')}
  ${horn(110, 56, '#4f46e5')}
`);
mon(afrd, 'ambush-demon.svg', 'دیو کمین', '#0a0a1a', '#4f46e5', `
  <path d="M50 95 Q100 55 150 95 Q130 115 100 120 Q70 115 50 95" fill="#4f46e5" opacity="0.05"/>
  ${eye(85, 82, 6, '#818cf8')}
  ${eye(115, 82, 6, '#818cf8')}
  <path d="M75 72 Q100 58 125 72" fill="none" stroke="#818cf8" stroke-width="2" opacity="0.3"/>
  <path d="M80 108 Q100 118 120 108" fill="none" stroke="#818cf8" stroke-width="2" opacity="0.3"/>
`);
mon(afrd, 'sorcery-demon.svg', 'اهریمن جادو', '#0d0a1a', '#7c3aed', `
  <circle cx="100" cy="80" r="28" fill="#7c3aed" opacity="0.06"/>
  ${eye(88, 76, 6, '#a78bfa')}
  ${eye(112, 76, 6, '#a78bfa')}
  <path d="M70 95 Q100 112 130 95" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.3"/>
  <polygon points="100,52 95,42 105,42" fill="#a78bfa" opacity="0.3"/>
  <circle cx="100" cy="46" r="3" fill="#a78bfa" opacity="0.15"/>
`);
mon(afrd, 'war-demon.svg', 'دیو سپاه', '#0a0505', '#dc2626', `
  <circle cx="100" cy="78" r="30" fill="#dc2626" opacity="0.06"/>
  ${eye(85, 74, 8, '#ef4444')}
  ${eye(115, 74, 8, '#ef4444')}
  <path d="M65 95 Q100 118 135 95" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.4"/>
  <path d="M88 105 L88 132" stroke="#dc2626" stroke-width="3" opacity="0.2"/>
  <path d="M112 105 L112 132" stroke="#dc2626" stroke-width="3" opacity="0.2"/>
  ${horn(90, 56, '#dc2626')}
  ${horn(110, 56, '#dc2626')}
`);
mon(afrd, 'fortress-giant.svg', 'غول دژ', '#0a0a1a', '#4f46e5', `
  <path d="M70 65 L100 45 L130 65 L130 120 L70 120Z" fill="#4f46e5" opacity="0.06"/>
  ${eye(88, 78, 6, '#818cf8')}
  ${eye(112, 78, 6, '#818cf8')}
  <path d="M75 100 Q100 112 125 100" fill="none" stroke="#818cf8" stroke-width="2" opacity="0.3"/>
  <rect x="95" y="100" width="10" height="20" fill="#4f46e5" opacity="0.15"/>
`);
mon(afrd, 'turan-demon.svg', 'اهریمن توران', '#0a0a1a', '#4f46e5', `
  <circle cx="100" cy="78" r="28" fill="#4f46e5" opacity="0.06"/>
  ${eye(86, 74, 7, '#818cf8')}
  ${eye(114, 74, 7, '#818cf8')}
  <path d="M68 95 Q100 115 132 95" fill="none" stroke="#818cf8" stroke-width="2.5" opacity="0.4"/>
  ${horn(92, 56, '#4f46e5')}
  ${horn(108, 56, '#4f46e5')}
  <circle cx="100" cy="60" r="3" fill="#818cf8" opacity="0.2"/>
`);

console.log('All monster SVGs generated!');
