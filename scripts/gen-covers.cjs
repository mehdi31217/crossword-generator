const path = require('path');
const { islBorder, mountain, writeSVG, crown } = require('./svg-utils.cjs');

const COVERS_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');
const w = 400, h = 300;

function cover(title, file, bg, accent, textColor, elements) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg}CC"/>
    </linearGradient>
    <linearGradient id="cg2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#cg)" rx="8"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="${accent}" stroke-width="2" rx="6" opacity="0.6"/>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="${accent}" stroke-width="1" rx="5" opacity="0.3"/>
  ${islBorder(w, h, accent, 0.3, 1)}
  ${elements}
  <rect x="${w * 0.12}" y="${h - 65}" width="${w * 0.76}" height="45" rx="5" fill="black" opacity="0.45"/>
  <text x="${w / 2}" y="${h - 38}" text-anchor="middle" fill="${textColor}" font-family="serif" font-size="20" font-weight="bold" dir="rtl">${title}</text>
  <rect x="0" y="${h - 4}" width="${w}" height="4" fill="${accent}"/>
  <rect x="0" y="0" width="${w}" height="4" fill="${accent}"/>
</svg>`;
  writeSVG(file, svg);
}

cover('هفت خوان رستم', path.join(COVERS_DIR, 'rostam7.svg'), '#1a1614', '#d97706', '#fff', `
  <circle cx="200" cy="115" r="65" fill="none" stroke="#d97706" stroke-width="3" opacity="0.35"/>
  <circle cx="200" cy="115" r="48" fill="none" stroke="#d97706" stroke-width="2" opacity="0.25"/>
  <path d="M170 90 L200 60 L230 90 L230 145 Q200 163 170 145Z" fill="#d97706" opacity="0.65"/>
  <circle cx="200" cy="108" r="16" fill="#fbbf24" opacity="0.85"/>
  <circle cx="200" cy="108" r="5" fill="#1a1614"/>
  <path d="M175 132 Q200 154 225 132" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
  ${mountain(80, 140, 60, 55, '#d97706')}
  ${mountain(320, 140, 60, 55, '#d97706')}
`);

cover('حسن کچل', path.join(COVERS_DIR, 'hassan-kachal.svg'), '#fff1f2', '#db2777', '#881337', `
  <circle cx="200" cy="108" r="35" fill="#fbcfe8" opacity="0.5"/>
  <circle cx="200" cy="108" r="25" fill="#fce7f3" opacity="0.6"/>
  <circle cx="190" cy="103" r="4" fill="#831843"/>
  <circle cx="210" cy="103" r="4" fill="#831843"/>
  <ellipse cx="200" cy="113" rx="7" ry="3" fill="#db2777"/>
  <path d="M185 123 Q200 134 215 123" fill="none" stroke="#db2777" stroke-width="2.5"/>
  <circle cx="200" cy="82" r="30" fill="none" stroke="#db2777" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
  <circle cx="200" cy="58" r="3" fill="#db2777" opacity="0.4"/>
  <circle cx="180" cy="63" r="2" fill="#db2777" opacity="0.3"/>
  <circle cx="220" cy="63" r="2" fill="#db2777" opacity="0.3"/>
  <circle cx="100" cy="185" r="5" fill="#ef4444" opacity="0.45"/>
  <circle cx="150" cy="195" r="4" fill="#ef4444" opacity="0.35"/>
  <circle cx="250" cy="190" r="5" fill="#ef4444" opacity="0.35"/>
  <circle cx="300" cy="185" r="4" fill="#ef4444" opacity="0.3"/>
`);

cover('فارسی اول دبستان', path.join(COVERS_DIR, 'farsi-aval.svg'), '#f0f9ff', '#0ea5e9', '#0c4a6e', `
  <text x="200" y="125" text-anchor="middle" font-family="serif" font-size="72" fill="#0ea5e9" opacity="0.18" dir="rtl">الف</text>
  <text x="200" y="165" text-anchor="middle" font-family="serif" font-size="60" fill="#0ea5e9" opacity="0.12" dir="rtl">ب</text>
  <circle cx="100" cy="70" r="12" fill="#fbbf24" opacity="0.25"/>
  <circle cx="300" cy="70" r="10" fill="#f97316" opacity="0.25"/>
  <circle cx="130" cy="215" r="8" fill="#10b981" opacity="0.2"/>
  <circle cx="270" cy="215" r="9" fill="#8b5cf6" opacity="0.2"/>
  <rect x="150" y="50" width="12" height="95" rx="3" fill="#f59e0b" opacity="0.18" transform="rotate(-15, 156, 97)"/>
  <rect x="170" y="45" width="12" height="100" rx="3" fill="#ef4444" opacity="0.18" transform="rotate(-5, 176, 95)"/>
  <rect x="190" y="40" width="12" height="105" rx="3" fill="#10b981" opacity="0.18"/>
  <rect x="210" y="45" width="12" height="100" rx="3" fill="#3b82f6" opacity="0.18" transform="rotate(5, 216, 95)"/>
  <rect x="230" y="50" width="12" height="95" rx="3" fill="#8b5cf6" opacity="0.18" transform="rotate(15, 236, 97)"/>
`);

cover('رستم و سهراب', path.join(COVERS_DIR, 'rostam-sohrab.svg'), '#1a0f0f', '#b91c1c', '#fff', `
  <circle cx="200" cy="112" r="60" fill="none" stroke="#b91c1c" stroke-width="3" opacity="0.3"/>
  <path d="M160 92 Q200 52 240 92 L240 147 Q200 167 160 147Z" fill="#b91c1c" opacity="0.55"/>
  <path d="M170 98 Q200 65 230 98 L230 138 Q200 153 170 138Z" fill="#dc2626" opacity="0.25"/>
  <circle cx="200" cy="105" r="14" fill="#fca5a5" opacity="0.55"/>
  <circle cx="200" cy="105" r="4" fill="#1a0f0f"/>
  <path d="M178 130 Q200 148 222 130" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round"/>
  <path d="M310 55 A14 14 0 1 1 310 83 A10.5 10.5 0 1 0 310 55Z" fill="#e2e8f0" opacity="0.7"/>
`);

cover('رستم و افراسیاب', path.join(COVERS_DIR, 'rostam-afrasiab.svg'), '#0a0a1a', '#4f46e5', '#fff', `
  <circle cx="200" cy="112" r="60" fill="none" stroke="#4f46e5" stroke-width="3" opacity="0.3"/>
  <path d="M165 88 Q200 53 235 88 L235 147 Q200 167 165 147Z" fill="#4f46e5" opacity="0.55"/>
  <circle cx="200" cy="103" r="14" fill="#818cf8" opacity="0.55"/>
  <circle cx="200" cy="103" r="4" fill="#0a0a1a"/>
  <path d="M178 130 Q200 148 222 130" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
  ${crown(200, 58, 2.2, '#fbbf24')}
  ${mountain(70, 140, 50, 50, '#4f46e5')}
  ${mountain(330, 140, 50, 50, '#4f46e5')}
`);

console.log('All cover SVGs generated!');
