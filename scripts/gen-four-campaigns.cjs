const fs = require('fs');
const path = require('path');

const BASE = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/public';

function islamicBorder(w, h, c = '#8b5cf6', inset = 4) {
  const s = Math.min(w, h);
  const ps = s * 0.03;
  const cx = w / 2;
  const hy = h / 2;
  let pts = '';
  for (let a = 0; a < 360; a += 30) {
    const r = (a % 60 === 0) ? ps * 2 : ps;
    const rad = (a * Math.PI) / 180;
    pts += `${cx + r * Math.cos(rad)},${hy + r * Math.sin(rad)} `;
  }
  return `<rect x="${inset}" y="${inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${ps}" fill="none" stroke="${c}" stroke-width="${ps * 0.5}" opacity="0.7"/>
<polygon points="${pts}" fill="none" stroke="${c}" stroke-width="${ps * 0.3}" opacity="0.4" transform="translate(0,0)"/>`;
}

function cypress(x, y, h, c = '#065f46') {
  let p = '';
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const yy = y - t * h;
    const ww = (1 - t) * 18;
    const lx = x - ww;
    const rx = x + ww;
    if (i === 0) p += `M ${lx} ${yy} `;
    else p += `L ${lx} ${yy} `;
  }
  for (let i = 10; i >= 0; i--) {
    const t = i / 10;
    const yy = y - t * h;
    const ww = (1 - t) * 18;
    const rx = x + ww;
    p += `L ${rx} ${yy} `;
  }
  p += 'Z';
  return `<path d="${p}" fill="${c}" opacity="0.8"/>`;
}

function mountain(x, y, w, h, c) {
  const x1 = x - w / 2, x2 = x, x3 = x + w / 2;
  const y1 = y, y2 = y - h, y3 = y;
  const snow = y2 - h * 0.15;
  return `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${c}" opacity="0.7"/>
<polygon points="${x1 + (x2 - x1) * 0.3},${y1 - h * 0.1} ${x2},${snow} ${x3 - (x3 - x2) * 0.3},${y1 - h * 0.1}" fill="#fff" opacity="0.3"/>`;
}

function warriorSilhouette(cx, y, h, c = '#1a1a2e') {
  const headR = h * 0.08;
  const neckY = y - h * 0.3;
  const bodyH = h * 0.45;
  const armW = h * 0.2;
  return `<circle cx="${cx}" cy="${neckY - headR}" r="${headR}" fill="${c}"/>
<ellipse cx="${cx}" cy="${neckY + bodyH * 0.4}" rx="${h * 0.12}" ry="${bodyH * 0.5}" fill="${c}"/>
<line x1="${cx - h * 0.08}" y1="${neckY + 2}" x2="${cx - armW}" y2="${neckY + bodyH * 0.6}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
<line x1="${cx + h * 0.08}" y1="${neckY + 2}" x2="${cx + armW}" y2="${neckY + bodyH * 0.6}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
<line x1="${cx - armW * 0.3}" y1="${y}" x2="${cx - h * 0.06}" y2="${y + h * 0.15}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
<line x1="${cx + h * 0.06}" y1="${y + h * 0.15}" x2="${cx + armW * 0.3}" y2="${y}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
}

function shield(cx, cy, r, c = '#b91c1c') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="2.5"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="none" stroke="${c}" stroke-width="1.5"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="${c}" opacity="0.4"/>`;
}

function sword(cx, y, h, c = '#9ca3af') {
  const bladeH = h * 0.7;
  const handleH = h * 0.2;
  const guardW = h * 0.15;
  return `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + bladeH}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx - guardW}" y1="${y + bladeH * 0.8}" x2="${cx + guardW}" y2="${y + bladeH * 0.8}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
<rect x="${cx - 3}" y="${y + bladeH}" width="6" height="${handleH}" rx="1.5" fill="${c}"/>`;
}

function dragon(cx, y, h, c = '#ef4444') {
  const bodyY = y - h * 0.5;
  return `<path d="M ${cx - h * 0.3} ${bodyY + h * 0.3} Q ${cx} ${bodyY - h * 0.2} ${cx + h * 0.3} ${bodyY + h * 0.3}"
fill="none" stroke="${c}" stroke-width="3"/>
<ellipse cx="${cx}" cy="${bodyY}" rx="${h * 0.15}" ry="${h * 0.12}" fill="${c}"/>
<circle cx="${cx - h * 0.08}" cy="${bodyY - h * 0.02}" r="2" fill="#fff"/>
<circle cx="${cx + h * 0.08}" cy="${bodyY - h * 0.02}" r="2" fill="#fff"/>
<path d="M ${cx} ${bodyY - h * 0.12} L ${cx} ${bodyY - h * 0.22}" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>
<path d="M ${cx - h * 0.3} ${bodyY + h * 0.3} Q ${cx - h * 0.4} ${bodyY + h * 0.5} ${cx - h * 0.35} ${bodyY + h * 0.4}"
fill="none" stroke="${c}" stroke-width="2"/>`;
}

function dome(cx, y, w, h, c = '#fbbf24') {
  return `<path d="M ${cx - w / 2} ${y} Q ${cx} ${y - h} ${cx + w / 2} ${y}" fill="${c}" opacity="0.8" stroke="#78350f" stroke-width="1.5"/>
<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h * 0.2}" fill="${c}" opacity="0.6" stroke="#78350f" stroke-width="1"/>`;
}

function moon(cx, cy, r, c = '#fde047') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.8"/>
<circle cx="${cx + r * 0.3}" cy="${cy - r * 0.2}" r="${r * 0.85}" fill="#1a1a2e" opacity="0.9"/>`;
}

function fire(cx, y, h, c = '#f97316') {
  const pts = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const a = Math.sin(t * Math.PI * 3) * 0.2;
    const yy = y - t * h;
    const ww = (1 - t * 0.7) * h * 0.3 * (1 + a);
    pts.push(`${cx - ww},${yy}`);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const a = Math.sin(t * Math.PI * 3) * 0.2;
    const yy = y - t * h;
    const ww = (1 - t * 0.7) * h * 0.3 * (1 + a);
    pts.push(`${cx + ww},${yy}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${c}" opacity="0.7"/>
<ellipse cx="${cx}" cy="${y - h * 0.5}" rx="${h * 0.08}" ry="${h * 0.25}" fill="#fde047" opacity="0.5"/>`;
}

function stars(cx, cy, r, c = '#fff') {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    const a2 = a + Math.PI / 5;
    const px2 = cx + r * 0.4 * Math.cos(a2);
    const py2 = cy + r * 0.4 * Math.sin(a2);
    s += `M ${px} ${py} L ${px2} ${py2} `;
  }
  s += 'Z';
  return `<path d="${s}" fill="${c}" opacity="0.8"/>`;
}

function horse(cx, y, h, c = '#444') {
  const bodyY = y - h * 0.35;
  return `<ellipse cx="${cx}" cy="${bodyY}" rx="${h * 0.25}" ry="${h * 0.15}" fill="${c}"/>
<ellipse cx="${cx + h * 0.22}" cy="${bodyY - h * 0.05}" rx="${h * 0.08}" ry="${h * 0.06}" fill="${c}"/>
<line x1="${cx + h * 0.28}" y1="${bodyY - h * 0.1}" x2="${cx + h * 0.35}" y2="${bodyY - h * 0.15}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
<line x1="${cx - h * 0.2}" y1="${bodyY}" x2="${cx - h * 0.25}" y2="${y}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx - h * 0.1}" y1="${bodyY + h * 0.05}" x2="${cx - h * 0.08}" y2="${y}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx + h * 0.15}" y1="${bodyY + h * 0.05}" x2="${cx + h * 0.18}" y2="${y}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx + h * 0.05}" y1="${bodyY}" x2="${cx}" y2="${y}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function makeMonster(cx, cy, c1, c2) {
  const r = 20;
  const eyeR = 3;
  const hornH = 12;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" opacity="0.9" stroke="${c2}" stroke-width="2"/>
<circle cx="${cx - 5}" cy="${cy - 2}" r="${eyeR}" fill="#fff"/>
<circle cx="${cx + 5}" cy="${cy - 2}" r="${eyeR}" fill="#fff"/>
<circle cx="${cx - 5}" cy="${cy - 2}" r="1.5" fill="#111"/>
<circle cx="${cx + 5}" cy="${cy - 2}" r="1.5" fill="#111"/>
<polygon points="${cx - 7},${cy - r + 2} ${cx - 4},${cy - r - hornH + 2} ${cx - 1},${cy - r + 2}" fill="${c2}" opacity="0.8"/>
<polygon points="${cx + 1},${cy - r + 2} ${cx + 4},${cy - r - hornH + 2} ${cx + 7},${cy - r + 2}" fill="${c2}" opacity="0.8"/>
<path d="M ${cx - 5} ${cy + 6} Q ${cx} ${cy + 12} ${cx + 5} ${cy + 6}" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.6"/>
<rect x="${cx - 12}" y="${cy + r - 3}" width="24" height="3" rx="1" fill="${c2}" opacity="0.5"/>`;
}

function makeChapterSvg(title, elements, c1, c2) {
  const w = 500, h = 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${adjustBrightness(c1, -60)}"/>
<stop offset="100%" stop-color="${adjustBrightness(c1, -85)}"/>
</linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
${islamicBorder(w, h, c2, 8)}
${elements.join('\n')}
<rect x="100" y="${h - 80}" width="300" height="36" rx="18" fill="${c2}" opacity="0.85"/>
<text x="250" y="${h - 57}" text-anchor="middle" fill="#fff" font-family="serif" font-size="16" font-weight="bold">${title}</text>
</svg>`;
}

function makeCoverSvg(title, subtitle, elements, c1, c2) {
  const w = 400, h = 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${c1}"/>
<stop offset="100%" stop-color="${adjustBrightness(c1, -50)}"/>
</linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
${islamicBorder(w, h, c2, 10)}
${elements.join('\n')}
<rect x="40" y="${h - 140}" width="320" height="50" rx="10" fill="${c2}" opacity="0.85"/>
<text x="200" y="${h - 108}" text-anchor="middle" fill="#fff" font-family="serif" font-size="24" font-weight="bold">${title}</text>
${subtitle ? `<text x="200" y="${h - 82}" text-anchor="middle" fill="#fff" font-family="serif" font-size="13" opacity="0.8">${subtitle}</text>` : ''}
</svg>`;
}

function makeMonsterSvg(c1, c2) {
  const w = 100, h = 100;
  const cx = 50, cy = 48;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="${adjustBrightness(c1, -70)}" rx="12"/>
${makeMonster(cx, cy, c1, c2)}
</svg>`;
}

function adjustBrightness(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amt));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

// ====== CAMPAIGN 1: KAVEH (Red theme) ======
const KAVEH_C1 = '#e11d48', KAVEH_C2 = '#881337';
const kavehChapters = [
  {
    file: 'ch1',
    title: 'فریاد کاوه',
    elements: [
      d3call(cx => dome(250, 60, 160, 50, KAVEH_C2)),
      d3call(cx => warriorSilhouette(150, 400, 120, '#333')),
      d3call(cx => fire(250, 480, 70, KAVEH_C1)),
      d3call(cx => `<text x="250" y="160" text-anchor="middle" fill="${KAVEH_C1}" font-family="serif" font-size="20" opacity="0.7">ضحاک ماردوش</text>`),
      d3call(cx => `<path d="M 100 200 Q 80 220 100 240" fill="none" stroke="#444" stroke-width="3" opacity="0.6"/>`),
      d3call(cx => dragon(350, 130, 40, KAVEH_C1)),
      d3call(cx => cypress(80, 550, 100, '#3a1a1a')),
      d3call(cx => cypress(420, 550, 100, '#3a1a1a')),
    ]
  },
  {
    file: 'ch2',
    title: 'قیام و درفش',
    elements: [
      d3call(cx => warriorSilhouette(130, 380, 100, '#333')),
      d3call(cx => warriorSilhouette(370, 380, 100, '#333')),
      d3call(cx => `<rect x="225" y="80" width="50" height="160" rx="3" fill="${KAVEH_C2}" opacity="0.8"/>`),
      d3call(cx => `<rect x="220" y="60" width="60" height="25" rx="4" fill="${KAVEH_C1}" opacity="0.9"/>`),
      d3call(cx => `<text x="250" y="78" text-anchor="middle" fill="#fff" font-family="serif" font-size="8" font-weight="bold">درفش کاوه</text>`),
      d3call(cx => `<path d="M 225 85 Q 210 110 200 140 M 275 85 Q 290 110 300 140" fill="none" stroke="${KAVEH_C1}" stroke-width="2" opacity="0.5"/>`),
      d3call(cx => cypress(60, 550, 80, '#3a1a1a')),
      d3call(cx => cypress(440, 550, 80, '#3a1a1a')),
      d3call(cx => moon(400, 55, 18, '#fde047')),
    ]
  },
  {
    file: 'ch3',
    title: 'اتحاد با فریدون',
    elements: [
      d3call(cx => warriorSilhouette(160, 380, 100, '#333')),
      d3call(cx => warriorSilhouette(340, 380, 100, '#4a2a1a')),
      d3call(cx => `<line x1="230" y1="380" x2="270" y2="380" stroke="${KAVEH_C1}" stroke-width="4" stroke-linecap="round"/>`),
      d3call(cx => dome(250, 70, 140, 40, KAVEH_C2)),
      d3call(cx => mountain(80, 470, 200, 80, '#2a1a1a')),
      d3call(cx => mountain(420, 470, 200, 80, '#2a1a1a')),
      d3call(cx => fire(250, 510, 50, KAVEH_C1)),
      d3call(cx => cypress(50, 550, 100, '#3a1a1a')),
      d3call(cx => cypress(450, 550, 100, '#3a1a1a')),
    ]
  },
  {
    file: 'ch4',
    title: 'زنجیر شدن ضحاک',
    elements: [
      d3call(cx => dome(250, 70, 160, 50, KAVEH_C2)),
      d3call(cx => warriorSilhouette(160, 380, 100, '#333')),
      d3call(cx => warriorSilhouette(340, 380, 100, '#4a2a1a')),
      d3call(cx => `<line x1="220" y1="230" x2="220" y2="350" stroke="#9ca3af" stroke-width="3" stroke-dasharray="5 3" opacity="0.6"/>`),
      d3call(cx => `<line x1="280" y1="230" x2="280" y2="350" stroke="#9ca3af" stroke-width="3" stroke-dasharray="5 3" opacity="0.6"/>`),
      d3call(cx => dragon(250, 120, 35, KAVEH_C1)),
      d3call(cx => mountain(250, 400, 300, 150, '#1a0a0a')),
      d3call(cx => cypress(60, 540, 80, '#3a1a1a')),
      d3call(cx => cypress(440, 540, 80, '#3a1a1a')),
      d3call(cx => `<circle cx="420" cy="55" r="25" fill="#fde047" opacity="0.6"/>`),
    ]
  },
];

// ====== CAMPAIGN 2: ESFANDIYAR (Green theme) ======
const ESF_C1 = '#059669', ESF_C2 = '#064e3b';
const esfChapters = [
  {
    file: 'ch1',
    title: 'خوان اول: نبرد با گرگان',
    elements: [
      d3call(cx => mountain(250, 320, 400, 150, '#0a2a1a')),
      d3call(cx => mountain(150, 350, 200, 80, '#0f3a2a')),
      d3call(cx => mountain(350, 350, 200, 80, '#0f3a2a')),
      d3call(cx => warriorSilhouette(250, 380, 100, '#1a3a2a')),
      d3call(cx => `<ellipse cx="180" cy="300" rx="8" ry="5" fill="#ef4444" opacity="0.7"/>`),
      d3call(cx => `<ellipse cx="320" cy="280" rx="8" ry="5" fill="#ef4444" opacity="0.7"/>`),
      d3call(cx => `<circle cx="180" cy="298" r="2" fill="#fde047"/>`),
      d3call(cx => `<circle cx="320" cy="278" r="2" fill="#fde047"/>`),
      d3call(cx => cypress(70, 520, 80, '#0f3a2a')),
      d3call(cx => cypress(430, 520, 80, '#0f3a2a')),
      d3call(cx => moon(400, 55, 20, '#fde047')),
    ]
  },
  {
    file: 'ch2',
    title: 'خوان دوم: شیر و اژدها',
    elements: [
      d3call(cx => mountain(250, 300, 350, 120, '#0a2a1a')),
      d3call(cx => warriorSilhouette(250, 400, 100, '#1a3a2a')),
      d3call(cx => `<path d="M 140 230 Q 160 200 180 230 Q 200 250 220 230" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.7"/>`),
      d3call(cx => dragon(360, 200, 50, '#ef4444')),
      d3call(cx => fire(250, 480, 60, ESF_C1)),
      d3call(cx => cypress(60, 530, 80, '#0f3a2a')),
      d3call(cx => cypress(440, 530, 80, '#0f3a2a')),
    ]
  },
  {
    file: 'ch3',
    title: 'خوان سوم: زن جادوگر',
    elements: [
      d3call(cx => `<rect x="80" y="300" width="340" height="120" rx="8" fill="#1a1a2e" opacity="0.7"/>`),
      d3call(cx => `<text x="250" y="370" text-anchor="middle" fill="#a855f7" font-family="serif" font-size="14" opacity="0.6">طلسم جادو</text>`),
      d3call(cx => warriorSilhouette(250, 400, 100, '#1a3a2a')),
      d3call(cx => `<circle cx="130" cy="260" r="20" fill="#a855f7" opacity="0.3"/>`),
      d3call(cx => `<circle cx="370" cy="260" r="20" fill="#a855f7" opacity="0.3"/>`),
      d3call(cx => stars(250, 80, 15, '#fde047')),
      d3call(cx => cypress(70, 530, 80, '#0f3a2a')),
      d3call(cx => cypress(430, 530, 80, '#0f3a2a')),
    ]
  },
  {
    file: 'ch4',
    title: 'خوان چهارم: مرغ سهمگین',
    elements: [
      d3call(cx => mountain(250, 320, 400, 150, '#0a2a1a')),
      d3call(cx => `<path d="M 200 80 Q 250 40 300 80 Q 320 60 340 80 Q 300 100 250 90 Q 200 100 200 80" fill="#475569" opacity="0.7"/>`),
      d3call(cx => `<path d="M 180 90 Q 150 150 120 200" fill="none" stroke="#475569" stroke-width="3" opacity="0.6"/>`),
      d3call(cx => warriorSilhouette(250, 380, 100, '#1a3a2a')),
      d3call(cx => cypress(60, 520, 80, '#0f3a2a')),
      d3call(cx => cypress(440, 520, 80, '#0f3a2a')),
    ]
  },
  {
    file: 'ch5',
    title: 'خوان پنجم: آتش و تفنگ',
    elements: [
      d3call(cx => fire(100, 450, 80, '#ef4444')),
      d3call(cx => fire(200, 450, 80, '#f97316')),
      d3call(cx => fire(300, 450, 80, '#f97316')),
      d3call(cx => fire(400, 450, 80, '#ef4444')),
      d3call(cx => warriorSilhouette(250, 380, 100, '#1a3a2a')),
      d3call(cx => `<rect x="380" y="240" width="20" height="30" rx="3" fill="#9ca3af"/>`),
      d3call(cx => `<rect x="380" y="235" width="20" height="8" rx="2" fill="#6b7280"/>`),
      d3call(cx => cypress(60, 520, 80, '#0f3a2a')),
      d3call(cx => cypress(440, 520, 80, '#0f3a2a')),
    ]
  },
  {
    file: 'ch6',
    title: 'خوان ششم: تنگه مرگ',
    elements: [
      d3call(cx => `<rect x="100" y="100" width="300" height="350" rx="5" fill="#0a0a0a" opacity="0.8"/>`),
      d3call(cx => `<rect x="150" y="100" width="200" height="350" rx="3" fill="#000" opacity="0.5"/>`),
      d3call(cx => `<line x1="150" y1="100" x2="150" y2="450" stroke="#333" stroke-width="2"/>`),
      d3call(cx => `<line x1="350" y1="100" x2="350" y2="450" stroke="#333" stroke-width="2"/>`),
      d3call(cx => warriorSilhouette(250, 350, 90, '#1a3a2a')),
      d3call(cx => `<circle cx="250" cy="160" r="2" fill="#fde047"/>`),
      d3call(cx => `<circle cx="250" cy="170" r="2" fill="#fde047"/>`),
    ]
  },
  {
    file: 'ch7',
    title: 'خوان هفتم: دیو بزرگ',
    elements: [
      d3call(cx => `<ellipse cx="250" cy="200" rx="80" ry="100" fill="#111" opacity="0.9"/>`),
      d3call(cx => `<circle cx="210" cy="160" r="5" fill="#ef4444"/>`),
      d3call(cx => `<circle cx="290" cy="160" r="5" fill="#ef4444"/>`),
      d3call(cx => warriorSilhouette(250, 400, 90, '#1a3a2a')),
      d3call(cx => `<path d="M 180 300 Q 200 280 220 300" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.5"/>`),
      d3call(cx => `<path d="M 280 300 Q 300 280 320 300" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.5"/>`),
      d3call(cx => cypress(60, 520, 80, '#0f3a2a')),
      d3call(cx => cypress(440, 520, 80, '#0f3a2a')),
    ]
  },
];

// ====== CAMPAIGN 3: ROSTAM & ESFANDIYAR (Amber theme) ======
const RE_C1 = '#b45309', RE_C2 = '#78350f';
const reChapters = [
  {
    file: 'ch1',
    title: 'پیام گشتاسپ',
    elements: [
      d3call(cx => dome(250, 70, 160, 50, RE_C2)),
      d3call(cx => warriorSilhouette(160, 380, 100, '#1a1a2e')),
      d3call(cx => horse(340, 420, 60, '#555')),
      d3call(cx => `<text x="250" y="160" text-anchor="middle" fill="${RE_C1}" font-family="serif" font-size="14" opacity="0.6">کاخ گشتاسپ در بلخ</text>`),
      d3call(cx => cypress(70, 540, 80, '#3a2a1a')),
      d3call(cx => cypress(430, 540, 80, '#3a2a1a')),
      d3call(cx => moon(400, 55, 20, '#fde047')),
    ]
  },
  {
    file: 'ch2',
    title: 'نبرد دو پهلوان',
    elements: [
      d3call(cx => warriorSilhouette(150, 380, 110, '#1a1a2e')),
      d3call(cx => warriorSilhouette(350, 380, 110, '#2a2a1e')),
      d3call(cx => shield(150, 300, 25, RE_C1)),
      d3call(cx => shield(350, 300, 25, RE_C2)),
      d3call(cx => sword(150, 280, 80, '#9ca3af')),
      d3call(cx => sword(350, 280, 80, '#9ca3af')),
      d3call(cx => mountain(250, 400, 350, 100, '#1a1410')),
      d3call(cx => cypress(70, 530, 80, '#3a2a1a')),
      d3call(cx => cypress(430, 530, 80, '#3a2a1a')),
    ]
  },
  {
    file: 'ch3',
    title: 'تیر نگاه رستم',
    elements: [
      d3call(cx => warriorSilhouette(130, 370, 100, '#1a1a2e')),
      d3call(cx => warriorSilhouette(370, 370, 100, '#2a2a1e')),
      d3call(cx => `<line x1="130" y1="280" x2="370" y2="270" stroke="#ef4444" stroke-width="2" stroke-dasharray="8 4" opacity="0.7"/>`),
      d3call(cx => `<circle cx="370" cy="270" r="4" fill="#ef4444"/>`),
      d3call(cx => mountain(250, 420, 300, 80, '#1a1410')),
      d3call(cx => cypress(70, 530, 80, '#3a2a1a')),
      d3call(cx => cypress(430, 530, 80, '#3a2a1a')),
      d3call(cx => fire(250, 490, 40, RE_C1)),
    ]
  },
  {
    file: 'ch4',
    title: 'مرگ اسفندیار',
    elements: [
      d3call(cx => warriorSilhouette(250, 330, 100, '#2a2a1e')),
      d3call(cx => `<ellipse cx="250" cy="400" rx="60" ry="15" fill="#333" opacity="0.5"/>`),
      d3call(cx => `<path d="M 230 380 Q 250 370 270 380" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.5"/>`),
      d3call(cx => mountain(250, 400, 400, 130, '#1a1410')),
      d3call(cx => cypress(80, 530, 90, '#3a2a1a')),
      d3call(cx => cypress(420, 530, 90, '#3a2a1a')),
      d3call(cx => `<circle cx="250" cy="60" r="25" fill="#ef4444" opacity="0.3"/>`),
    ]
  },
  {
    file: 'ch5',
    title: 'پیامد تلخ',
    elements: [
      d3call(cx => dome(250, 70, 140, 40, RE_C2)),
      d3call(cx => warriorSilhouette(160, 350, 90, '#1a1a2e')),
      d3call(cx => `<rect x="80" y="380" width="340" height="80" rx="8" fill="#1a1410" opacity="0.7"/>`),
      d3call(cx => `<text x="250" y="420" text-anchor="middle" fill="#9ca3af" font-family="serif" font-size="12" opacity="0.6">سوگ ایران</text>`),
      d3call(cx => cypress(80, 530, 90, '#3a2a1a')),
      d3call(cx => cypress(420, 530, 90, '#3a2a1a')),
    ]
  },
];

// ====== CAMPAIGN 4: TAHMINEH (Purple theme) ======
const TAH_C1 = '#d946ef', TAH_C2 = '#86198f';
const tahChapters = [
  {
    file: 'ch1',
    title: 'عشق در سمنگان',
    elements: [
      d3call(cx => dome(250, 70, 140, 40, TAH_C2)),
      d3call(cx => warriorSilhouette(170, 380, 100, '#1a1a2e')),
      d3call(cx => `<circle cx="340" cy="300" r="15" fill="${TAH_C1}" opacity="0.3"/>`),
      d3call(cx => `<circle cx="340" cy="300" r="15" fill="none" stroke="${TAH_C1}" stroke-width="2" opacity="0.7"/>`),
      d3call(cx => moon(380, 55, 22, '#fde047')),
      d3call(cx => `<text x="250" y="160" text-anchor="middle" fill="${TAH_C1}" font-family="serif" font-size="14" opacity="0.6">قلعه سمنگان</text>`),
      d3call(cx => cypress(70, 540, 80, '#2a1a2a')),
      d3call(cx => cypress(430, 540, 80, '#2a1a2a')),
      d3call(cx => `<circle cx="340" cy="295" r="2" fill="#fff" opacity="0.8"/>`),
    ]
  },
  {
    file: 'ch2',
    title: 'شب وصال',
    elements: [
      d3call(cx => dome(250, 60, 130, 35, TAH_C2)),
      d3call(cx => warriorSilhouette(180, 370, 90, '#1a1a2e')),
      d3call(cx => `<circle cx="330" cy="310" r="12" fill="${TAH_C1}" opacity="0.25"/>`),
      d3call(cx => `<circle cx="330" cy="310" r="12" fill="none" stroke="${TAH_C1}" stroke-width="2" opacity="0.6"/>`),
      d3call(cx => `<line x1="180" y1="310" x2="320" y2="310" stroke="${TAH_C1}" stroke-width="2" opacity="0.5"/>`),
      d3call(cx => moon(370, 50, 25, '#fde047')),
      d3call(cx => cypress(70, 530, 80, '#2a1a2a')),
      d3call(cx => cypress(430, 530, 80, '#2a1a2a')),
      d3call(cx => stars(250, 90, 10, '#fde047')),
    ]
  },
  {
    file: 'ch3',
    title: 'تولد سهراب',
    elements: [
      d3call(cx => dome(250, 70, 140, 40, TAH_C2)),
      d3call(cx => `<circle cx="250" cy="300" r="30" fill="${TAH_C1}" opacity="0.15"/>`),
      d3call(cx => `<circle cx="250" cy="300" r="15" fill="${TAH_C1}" opacity="0.3"/>`),
      d3call(cx => `<text x="250" y="298" text-anchor="middle" fill="${TAH_C1}" font-family="serif" font-size="10" font-weight="bold">سهراب</text>`),
      d3call(cx => `<circle cx="250" cy="295" r="3" fill="#fff" opacity="0.8"/>`),
      d3call(cx => warriorSilhouette(170, 380, 90, '#1a1a2e')),
      d3call(cx => cypress(70, 530, 90, '#2a1a2a')),
      d3call(cx => cypress(430, 530, 90, '#2a1a2a')),
      d3call(cx => `<circle cx="420" cy="55" r="25" fill="#fde047" opacity="0.5"/>`),
    ]
  },
];

// d3call helper
function d3call(fn) {
  return fn(1);
}

function generateAll() {
  console.log('🧹 Cleaning directories...');
  const campaigns = [
    { name: 'kaveh', c1: KAVEH_C1, c2: KAVEH_C2, chapters: kavehChapters, title: 'کاوه آهنگر', subtitle: 'فردوسی' },
    { name: 'esfandiyar', c1: ESF_C1, c2: ESF_C2, chapters: esfChapters, title: 'اسفندیار', subtitle: 'فردوسی' },
    { name: 'rostam-esfandiyar', c1: RE_C1, c2: RE_C2, chapters: reChapters, title: 'رستم و اسفندیار', subtitle: 'فردوسی' },
    { name: 'tahmineh', c1: TAH_C1, c2: TAH_C2, chapters: tahChapters, title: 'تهمینه', subtitle: 'فردوسی' },
  ];

  for (const camp of campaigns) {
    // Ensure directories
    ensureDir(`${BASE}/images/chapters/${camp.name}/`);
    ensureDir(`${BASE}/images/monsters/${camp.name}/`);

    // Chapter SVGs
    for (const ch of camp.chapters) {
      const svg = makeChapterSvg(ch.title, ch.elements, camp.c1, camp.c2);
      fs.writeFileSync(`${BASE}/images/chapters/${camp.name}/${ch.file}.svg`, svg);
      console.log(`  📄 chapters/${camp.name}/${ch.file}.svg`);
    }

    // Monster SVGs
    const chapterCount = camp.chapters.length;
    for (let i = 1; i <= chapterCount; i++) {
      const svg = makeMonsterSvg(camp.c1, camp.c2);
      fs.writeFileSync(`${BASE}/images/monsters/${camp.name}/ch${i}-monster.svg`, svg);
      console.log(`  👹 monsters/${camp.name}/ch${i}-monster.svg`);
    }

    // Cover SVG
    const coverSvg = makeCoverSvg(camp.title, camp.subtitle, [
      d3call(cx => camp.name === 'kaveh' ? fire(200, 400, 80, camp.c1) : ''),
      d3call(cx => camp.name === 'kaveh' ? fire(200, 400, 80, camp.c2) : ''),
      d3call(cx => camp.name === 'kaveh' ? cypress(80, 520, 100, '#3a1a1a') : ''),
      d3call(cx => camp.name === 'kaveh' ? cypress(320, 520, 100, '#3a1a1a') : ''),
      d3call(cx => camp.name === 'kaveh' ? `<path d="M 100 200 Q 130 180 160 200" fill="none" stroke="${camp.c1}" stroke-width="4" opacity="0.5"/>` : ''),
      d3call(cx => camp.name === 'kaveh' ? `<path d="M 240 200 Q 270 180 300 200" fill="none" stroke="${camp.c1}" stroke-width="4" opacity="0.5"/>` : ''),
      d3call(cx => (camp.name === 'esfandiyar' || camp.name === 'rostam-esfandiyar') ? mountain(200, 400, 350, 120, '#0a2a1a') : ''),
      d3call(cx => (camp.name === 'esfandiyar' || camp.name === 'rostam-esfandiyar') ? warriorSilhouette(200, 400, 100, '#1a3a2a') : ''),
      d3call(cx => (camp.name === 'esfandiyar' || camp.name === 'rostam-esfandiyar') ? cypress(100, 520, 100, '#0f3a2a') : ''),
      d3call(cx => (camp.name === 'esfandiyar' || camp.name === 'rostam-esfandiyar') ? cypress(300, 520, 100, '#0f3a2a') : ''),
      d3call(cx => (camp.name === 'esfandiyar') ? sword(200, 310, 70, '#9ca3af') : ''),
      d3call(cx => (camp.name === 'rostam-esfandiyar') ? shield(200, 330, 30, camp.c1) : ''),
      d3call(cx => (camp.name === 'rostam-esfandiyar') ? sword(180, 300, 60, '#9ca3af') : ''),
      d3call(cx => (camp.name === 'rostam-esfandiyar') ? sword(220, 300, 60, '#9ca3af') : ''),
      d3call(cx => camp.name === 'tahmineh' ? moon(200, 360, 40, '#fde047') : ''),
      d3call(cx => camp.name === 'tahmineh' ? dome(200, 150, 140, 40, camp.c2) : ''),
      d3call(cx => camp.name === 'tahmineh' ? stars(200, 280, 20, '#fde047') : ''),
      d3call(cx => camp.name === 'tahmineh' ? cypress(100, 520, 100, '#2a1a2a') : ''),
      d3call(cx => camp.name === 'tahmineh' ? cypress(300, 520, 100, '#2a1a2a') : ''),
    ], camp.c1, camp.c2);
    fs.writeFileSync(`${BASE}/images/covers/${camp.name}.svg`, coverSvg);
    console.log(`  🎨 covers/${camp.name}.svg`);
  }

  console.log('\n✅ All SVGs generated successfully!');
}

generateAll();
