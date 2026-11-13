const fs = require('fs');
const path = require('path');

const BASE = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/public';

function adjustBrightness(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amt));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((r << 8) | g).toString(16).padStart(4, '0')}`;
  // simpler version
}

function adjustBrightness2(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amt));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function islamicBorder(w, h, c, inset = 8) {
  const ps = Math.min(w, h) * 0.025;
  return `<rect x="${inset}" y="${inset}" width="${w - 2*inset}" height="${h - 2*inset}" rx="${ps}" fill="none" stroke="${c}" stroke-width="${ps*0.5}" opacity="0.7"/>
<path d="M ${w/2} ${inset + ps} L ${w/2} ${inset + ps*2} M ${inset + ps} ${h/2} L ${inset + ps*2} ${h/2} M ${w - inset - ps} ${h/2} L ${w - inset - ps*2} ${h/2}" fill="none" stroke="${c}" stroke-width="${ps*0.3}" opacity="0.4"/>`;
}

function cypress(x, y, h, c) {
  let pts = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const yy = y - t * h;
    const ww = (1 - t) * 15;
    pts.push(`${x - ww},${yy}`);
  }
  for (let i = 10; i >= 0; i--) {
    const t = i / 10;
    const yy = y - t * h;
    const ww = (1 - t) * 15;
    pts.push(`${x + ww},${yy}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${c}" opacity="0.8"/>`;
}

function mountain(x, y, w, h, c) {
  return `<polygon points="${x - w/2},${y} ${x},${y - h} ${x + w/2},${y}" fill="${c}" opacity="0.7"/>
<polygon points="${x - w*0.15},${y - h*0.2} ${x},${y - h*0.85} ${x + w*0.15},${y - h*0.2}" fill="#fff" opacity="0.25"/>`;
}

function silhouette(cx, y, h, c) {
  const headR = h * 0.07;
  const neckY = y - h * 0.3;
  const bodyH = h * 0.4;
  return `<circle cx="${cx}" cy="${neckY - headR}" r="${headR}" fill="${c}"/>
<ellipse cx="${cx}" cy="${neckY + bodyH*0.35}" rx="${h*0.1}" ry="${bodyH*0.4}" fill="${c}"/>
<line x1="${cx - h*0.06}" y1="${neckY + 2}" x2="${cx - h*0.15}" y2="${neckY + bodyH*0.5}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx + h*0.06}" y1="${neckY + 2}" x2="${cx + h*0.15}" y2="${neckY + bodyH*0.5}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx - h*0.08}" y1="${y}" x2="${cx}" y2="${y + h*0.1}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
<line x1="${cx + h*0.08}" y1="${y}" x2="${cx}" y2="${y + h*0.1}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>`;
}

function dome(cx, y, w, h, c) {
  return `<path d="M ${cx - w/2} ${y} Q ${cx} ${y - h} ${cx + w/2} ${y}" fill="${c}" opacity="0.8" stroke="${adjustBrightness2(c, -40)}" stroke-width="1.5"/>
<rect x="${cx - w/2}" y="${y}" width="${w}" height="${h*0.15}" fill="${adjustBrightness2(c, -20)}" opacity="0.6" stroke="${adjustBrightness2(c, -40)}" stroke-width="1"/>`;
}

function moon(cx, cy, r, c) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.9"/>
<circle cx="${cx + r*0.3}" cy="${cy - r*0.15}" r="${r*0.82}" fill="#111" opacity="0.9"/>`;
}

function fire(cx, y, h, c) {
  let pts = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    const yy = y - t * h;
    const ww = (1 - t * 0.7) * h * 0.25 * (1 + Math.sin(t * Math.PI * 3) * 0.15);
    pts.push(`${cx - ww},${yy}`);
  }
  for (let i = 5; i >= 0; i--) {
    const t = i / 5;
    const yy = y - t * h;
    const ww = (1 - t * 0.7) * h * 0.25 * (1 + Math.sin(t * Math.PI * 3) * 0.15);
    pts.push(`${cx + ww},${yy}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${c}" opacity="0.8"/>
<ellipse cx="${cx}" cy="${y - h*0.4}" rx="${h*0.06}" ry="${h*0.2}" fill="#fde047" opacity="0.6"/>`;
}

function column(cx, y, h, c) {
  return `<rect x="${cx - 5}" y="${y - h}" width="10" height="${h}" rx="2" fill="${c}" opacity="0.7"/>
<rect x="${cx - 8}" y="${y - h}" width="16" height="4" rx="1" fill="${c}" opacity="0.5"/>
<rect x="${cx - 8}" y="${y}" width="16" height="4" rx="1" fill="${c}" opacity="0.5"/>`;
}

function tree(x, y, h, c) {
  return `<rect x="${x - 2}" y="${y - h*0.5}" width="4" height="${h*0.5}" rx="1" fill="#3a2a1a" opacity="0.8"/>
<circle cx="${x}" cy="${y - h*0.6}" r="${h*0.3}" fill="${c}" opacity="0.7"/>
<circle cx="${x - h*0.15}" cy="${y - h*0.5}" r="${h*0.2}" fill="${c}" opacity="0.6"/>
<circle cx="${x + h*0.15}" cy="${y - h*0.5}" r="${h*0.2}" fill="${c}" opacity="0.6"/>`;
}

function wave(cx, y, w, c) {
  return `<path d="M ${cx - w/2} ${y} Q ${cx - w/4} ${y - 12} ${cx} ${y} Q ${cx + w/4} ${y + 12} ${cx + w/2} ${y}" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/>`;
}

function book(cx, cy, h, c) {
  const w = h * 0.7;
  return `<rect x="${cx - w/2}" y="${cy - h/2}" width="${w}" height="${h}" rx="2" fill="${c}" opacity="0.7"/>
<line x1="${cx}" y1="${cy - h/2 + 3}" x2="${cx}" y2="${cy + h/2 - 3}" stroke="${adjustBrightness2(c, -40)}" stroke-width="1.5"/>
<line x1="${cx - w/4}" y1="${cy - h/4}" x2="${cx + w/4}" y2="${cy - h/4}" stroke="${adjustBrightness2(c, -40)}" stroke-width="1" opacity="0.6"/>
<line x1="${cx - w/4}" y1="${cy}" x2="${cx + w/4}" y2="${cy}" stroke="${adjustBrightness2(c, -40)}" stroke-width="1" opacity="0.6"/>
<line x1="${cx - w/4}" y1="${cy + h/4}" x2="${cx + w/4}" y2="${cy + h/4}" stroke="${adjustBrightness2(c, -40)}" stroke-width="1" opacity="0.6"/>`;
}

function makeChapterSvg(title, elements, c1, c2) {
  const w = 500, h = 600;
  const bg = adjustBrightness2(c1, -60);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="${adjustBrightness2(c1, -50)}"/>
<stop offset="100%" stop-color="${adjustBrightness2(c1, -80)}"/>
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
<stop offset="0%" stop-color="${adjustBrightness2(c1, 10)}"/>
<stop offset="100%" stop-color="${c1}"/>
</linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
${islamicBorder(w, h, c2, 10)}
${elements.join('\n')}
<rect x="30" y="${h - 150}" width="340" height="50" rx="10" fill="${c2}" opacity="0.85"/>
<text x="200" y="${h - 118}" text-anchor="middle" fill="#fff" font-family="serif" font-size="22" font-weight="bold">${title}</text>
${subtitle ? `<text x="200" y="${h - 92}" text-anchor="middle" fill="#fff" font-family="serif" font-size="13" opacity="0.8">${subtitle}</text>` : ''}
</svg>`;
}

function makeMonsterSvg(c1, c2) {
  const w = 100, h = 100;
  const cx = 50, cy = 48;
  const r = 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="${adjustBrightness2(c1, -70)}" rx="12"/>
<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" opacity="0.9" stroke="${c2}" stroke-width="2"/>
<circle cx="${cx - 5}" cy="${cy - 2}" r="3" fill="#fff"/>
<circle cx="${cx + 5}" cy="${cy - 2}" r="3" fill="#fff"/>
<circle cx="${cx - 5}" cy="${cy - 2}" r="1.5" fill="#111"/>
<circle cx="${cx + 5}" cy="${cy - 2}" r="1.5" fill="#111"/>
<polygon points="${cx - 7},${cy - r + 2} ${cx - 4},${cy - r - 12 + 2} ${cx - 1},${cy - r + 2}" fill="${c2}" opacity="0.8"/>
<polygon points="${cx + 1},${cy - r + 2} ${cx + 4},${cy - r - 12 + 2} ${cx + 7},${cy - r + 2}" fill="${c2}" opacity="0.8"/>
<path d="M ${cx - 5} ${cy + 6} Q ${cx} ${cy + 12} ${cx + 5} ${cy + 6}" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.6"/>
<rect x="${cx - 12}" y="${cy + r - 3}" width="24" height="3" rx="1" fill="${c2}" opacity="0.5"/>
</svg>`;
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

const CAMPAIGNS = [
  {
    name: 'zal-simorgh',
    c1: '#0ea5e9', c2: '#075985',
    title: 'زال و سیمرغ', subtitle: 'فردوسی',
    chapters: [
      { file: 'ch1', title: 'تولد زال', elements: [
        mountain(250, 350, 400, 150, '#0f2a3a'),
        cypress(80, 530, 100, '#0f3a4a'),
        cypress(420, 530, 100, '#0f3a4a'),
        `<circle cx="250" cy="350" r="8" fill="#fff" opacity="0.5"/>`,
        silhouette(250, 380, 80, '#1a3a4a'),
        moon(380, 55, 22, '#fde047'),
      ]},
      { file: 'ch2', title: 'سیمرغ', elements: [
        `<path d="M 180 120 Q 250 60 320 120 Q 280 140 250 130 Q 220 140 180 120" fill="#0ea5e9" opacity="0.6"/>`,
        `<path d="M 160 140 Q 140 200 130 250" fill="none" stroke="#0ea5e9" stroke-width="4" opacity="0.5"/>`,
        mountain(250, 350, 400, 150, '#0f2a3a'),
        cypress(80, 530, 100, '#0f3a4a'),
        cypress(420, 530, 100, '#0f3a4a'),
        silhouette(250, 380, 80, '#1a3a4a'),
        `<circle cx="250" cy="310" r="5" fill="#fff" opacity="0.4"/>`,
      ]},
      { file: 'ch3', title: 'حکمت کوهستان', elements: [
        mountain(150, 350, 250, 120, '#0f2a3a'),
        mountain(350, 350, 250, 120, '#0f2a3a'),
        silhouette(250, 380, 80, '#1a3a4a'),
        cypress(70, 530, 100, '#0f3a4a'),
        cypress(430, 530, 100, '#0f3a4a'),
        moon(400, 55, 22, '#fde047'),
        `<circle cx="150" cy="150" r="2" fill="#fde047" opacity="0.6"/>`,
        `<circle cx="350" cy="130" r="2" fill="#fde047" opacity="0.6"/>`,
      ]},
      { file: 'ch4', title: 'بازگشت به وطن', elements: [
        dome(250, 70, 140, 40, '#075985'),
        silhouette(160, 380, 90, '#1a3a4a'),
        silhouette(340, 380, 90, '#0f3a2a'),
        `<line x1="200" y1="330" x2="300" y2="330" stroke="#0ea5e9" stroke-width="2" opacity="0.5"/>`,
        cypress(70, 530, 100, '#0f3a4a'),
        cypress(430, 530, 100, '#0f3a4a'),
        `<circle cx="420" cy="55" r="25" fill="#fde047" opacity="0.5"/>`,
      ]},
      { file: 'ch5', title: 'زال پهلوان', elements: [
        dome(250, 70, 140, 40, '#075985'),
        silhouette(250, 380, 100, '#1a3a4a'),
        column(160, 400, 100, '#0ea5e9'),
        column(340, 400, 100, '#0ea5e9'),
        cypress(70, 530, 100, '#0f3a4a'),
        cypress(430, 530, 100, '#0f3a4a'),
      ]},
    ]
  },
  {
    name: 'kaykhosrow',
    c1: '#dc2626', c2: '#991b1b',
    title: 'کیخسرو و کین سیاوش', subtitle: 'فردوسی',
    chapters: [
      { file: 'ch1', title: 'تاجگذاری کیخسرو', elements: [
        dome(250, 60, 160, 50, '#991b1b'),
        silhouette(160, 380, 100, '#1a1a1a'),
        silhouette(340, 380, 100, '#2a1a1a'),
        `<text x="250" y="160" text-anchor="middle" fill="#dc2626" font-family="serif" font-size="14" opacity="0.6">تاج ایران</text>`,
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch2', title: 'لشکرکشی بزرگ', elements: [
        silhouette(100, 380, 80, '#1a1a1a'), silhouette(180, 380, 80, '#1a1a1a'),
        silhouette(320, 380, 80, '#1a1a1a'), silhouette(400, 380, 80, '#1a1a1a'),
        `<line x1="150" y1="320" x2="180" y2="300" stroke="#dc2626" stroke-width="2" opacity="0.5"/>`,
        `<line x1="350" y1="320" x2="320" y2="300" stroke="#dc2626" stroke-width="2" opacity="0.5"/>`,
        mountain(250, 400, 350, 100, '#1a0a0a'),
        fire(250, 470, 40, '#dc2626'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch3', title: 'نبرد با افراسیاب', elements: [
        silhouette(150, 380, 100, '#1a1a1a'),
        dome(350, 100, 120, 35, '#991b1b'),
        `<circle cx="150" cy="300" r="4" fill="#ef4444"/>`,
        `<circle cx="350" cy="200" r="4" fill="#ef4444"/>`,
        fire(250, 480, 50, '#dc2626'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch4', title: 'غرق شدن افراسیاب', elements: [
        `<path d="M 80 350 Q 250 280 420 350" fill="none" stroke="#2563eb" stroke-width="3" opacity="0.5"/>`,
        `<path d="M 80 370 Q 250 300 420 370" fill="none" stroke="#2563eb" stroke-width="2" opacity="0.3"/>`,
        `<text x="250" y="180" text-anchor="middle" fill="#ef4444" font-family="serif" font-size="14" opacity="0.6">طوفان دریا</text>`,
        silhouette(250, 350, 80, '#1a1a1a'),
        `<path d="M 200 200 Q 220 180 240 190" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.4"/>`,
        `<path d="M 260 190 Q 280 180 300 200" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.4"/>`,
        cypress(60, 530, 100, '#2a1a1a'),
        cypress(440, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch5', title: 'پیروزی و بازگشت', elements: [
        dome(250, 60, 160, 50, '#991b1b'),
        silhouette(250, 380, 100, '#1a1a1a'),
        `<circle cx="250" cy="180" r="35" fill="#fde047" opacity="0.25"/>`,
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
        `<text x="250" y="300" text-anchor="middle" fill="#fde047" font-family="serif" font-size="12" opacity="0.5">پیروزی ایران</text>`,
      ]},
      { file: 'ch6', title: 'دوران طلایی', elements: [
        dome(250, 60, 160, 50, '#991b1b'),
        column(150, 400, 120, '#dc2626'),
        column(350, 400, 120, '#dc2626'),
        silhouette(250, 380, 100, '#1a1a1a'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
    ]
  },
  {
    name: 'rostam-death',
    c1: '#4a4a4a', c2: '#1a1a1a',
    title: 'مرگ رستم', subtitle: 'فردوسی',
    chapters: [
      { file: 'ch1', title: 'شغاد خیانتکار', elements: [
        silhouette(130, 380, 100, '#222'),
        silhouette(370, 380, 100, '#333'),
        `<line x1="200" y1="340" x2="300" y2="340" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 5" opacity="0.5"/>`,
        mountain(250, 420, 300, 80, '#151515'),
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
        moon(400, 55, 20, '#9ca3af'),
      ]},
      { file: 'ch2', title: 'دام مرگ', elements: [
        `<rect x="220" y="250" width="60" height="100" rx="3" fill="#000" opacity="0.8"/>`,
        `<line x1="220" y1="350" x2="280" y2="350" stroke="#ef4444" stroke-width="2" opacity="0.5"/>`,
        silhouette(250, 350, 90, '#222'),
        silhouette(370, 360, 100, '#333'),
        `<line x1="280" y1="300" x2="370" y2="310" stroke="#fff" stroke-width="1" opacity="0.3"/>`,
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
      ]},
      { file: 'ch3', title: 'آخرین تیر', elements: [
        `<rect x="220" y="250" width="60" height="100" rx="3" fill="#000" opacity="0.9"/>`,
        silhouette(250, 340, 80, '#222'),
        `<line x1="250" y1="300" x2="370" y2="290" stroke="#ef4444" stroke-width="2" opacity="0.7"/>`,
        `<circle cx="370" cy="290" r="3" fill="#ef4444"/>`,
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
      ]},
      { file: 'ch4', title: 'وداع با رخش', elements: [
        `<rect x="220" y="250" width="60" height="100" rx="3" fill="#000" opacity="0.9"/>`,
        silhouette(250, 340, 80, '#222'),
        `<ellipse cx="360" cy="300" rx="15" ry="10" fill="#333"/>`,
        `<rect x="360" y="295" width="3" height="20" rx="1" fill="#333"/>`,
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
      ]},
      { file: 'ch5', title: 'پایان افسانه', elements: [
        dome(250, 70, 140, 40, '#333'),
        `<ellipse cx="250" cy="380" rx="80" ry="15" fill="#1a1a1a" opacity="0.5"/>`,
        `<text x="250" y="380" text-anchor="middle" fill="#6b7280" font-family="serif" font-size="12" opacity="0.6">آرامگاه رستم</text>`,
        cypress(80, 530, 120, '#1a1a1a'),
        cypress(420, 530, 120, '#1a1a1a'),
      ]},
    ]
  },
  {
    name: 'rostam-akvan',
    c1: '#7c3aed', c2: '#4c1d95',
    title: 'رستم و اکوان دیو', subtitle: 'فردوسی',
    chapters: [
      { file: 'ch1', title: 'دیو اکوان', elements: [
        mountain(250, 300, 400, 150, '#1a0a2a'),
        `<circle cx="200" cy="180" r="15" fill="#7c3aed" opacity="0.4"/>`,
        `<circle cx="300" cy="180" r="15" fill="#7c3aed" opacity="0.4"/>`,
        silhouette(250, 400, 100, '#1a1a2e'),
        cypress(70, 530, 100, '#1a1a2a'),
        cypress(430, 530, 100, '#1a1a2a'),
        moon(390, 55, 22, '#fde047'),
      ]},
      { file: 'ch2', title: 'نبرد در کوهستان', elements: [
        mountain(250, 320, 400, 150, '#1a0a2a'),
        silhouette(150, 380, 100, '#1a1a2e'),
        `<circle cx="350" cy="200" r="18" fill="#7c3aed" opacity="0.5"/>`,
        `<circle cx="350" cy="195" r="3" fill="#ef4444"/>`,
        `<circle cx="350" cy="195" r="1.5" fill="#fff"/>`,
        fire(250, 470, 40, '#7c3aed'),
        cypress(70, 530, 100, '#1a1a2a'),
        cypress(430, 530, 100, '#1a1a2a'),
      ]},
      { file: 'ch3', title: 'پیروزی و بازگشت', elements: [
        mountain(250, 320, 350, 120, '#1a0a2a'),
        silhouette(150, 380, 100, '#1a1a2e'),
        `<rect x="220" y="180" width="60" height="40" rx="3" fill="#4c1d95" opacity="0.8"/>`,
        `<line x1="220" y1="200" x2="250" y2="200" stroke="#fde047" stroke-width="2" opacity="0.5"/>`,
        `<line x1="260" y1="200" x2="280" y2="200" stroke="#fde047" stroke-width="2" opacity="0.5"/>`,
        cypress(70, 530, 100, '#1a1a2a'),
        cypress(430, 530, 100, '#1a1a2a'),
      ]},
    ]
  },
  {
    name: 'hushang',
    c1: '#f97316', c2: '#9a3412',
    title: 'هوشنگ و کشف آتش', subtitle: 'اسطوره‌های ایران باستان',
    chapters: [
      { file: 'ch1', title: 'شاه هوشنگ', elements: [
        mountain(250, 320, 400, 150, '#1a0f08'),
        silhouette(250, 380, 100, '#2a1a1a'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch2', title: 'کشف آتش', elements: [
        mountain(250, 350, 300, 100, '#1a0f08'),
        silhouette(250, 380, 100, '#2a1a1a'),
        `<path d="M 220 300 L 200 280" stroke="#f97316" stroke-width="2"/>`,
        `<path d="M 200 280 L 220 300" stroke="#f97316" stroke-width="2"/>`,
        `<circle cx="210" cy="290" r="5" fill="#fde047"/>`,
        fire(280, 350, 40, '#f97316'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch3', title: 'جشن سده', elements: [
        fire(250, 400, 100, '#f97316'),
        fire(180, 410, 70, '#ea580c'),
        fire(320, 410, 70, '#ea580c'),
        silhouette(100, 380, 60, '#2a1a1a'),
        silhouette(400, 380, 60, '#2a1a1a'),
        `<circle cx="250" cy="80" r="8" fill="#fde047" opacity="0.5"/>`,
        `<circle cx="250" cy="80" r="15" fill="#fde047" opacity="0.2"/>`,
        cypress(60, 530, 100, '#2a1a1a'),
        cypress(440, 530, 100, '#2a1a1a'),
      ]},
    ]
  },
  {
    name: 'jamshid',
    c1: '#eab308', c2: '#854d0e',
    title: 'جمشید و عصر طلایی', subtitle: 'اسطوره‌های ایران باستان',
    chapters: [
      { file: 'ch1', title: 'جمشید پادشاه', elements: [
        dome(250, 60, 160, 50, '#854d0e'),
        silhouette(250, 380, 100, '#1a1a1a'),
        `<circle cx="250" cy="280" r="30" fill="#fde047" opacity="0.15"/>`,
        column(130, 400, 120, '#eab308'),
        column(370, 400, 120, '#eab308'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch2', title: 'تخت جمشید', elements: [
        column(100, 400, 150, '#eab308'),
        column(190, 400, 150, '#eab308'),
        column(310, 400, 150, '#eab308'),
        column(400, 400, 150, '#eab308'),
        `<rect x="100" y="250" width="300" height="15" rx="2" fill="#854d0e" opacity="0.6"/>`,
        `<rect x="120" y="265" width="260" height="10" rx="1" fill="#854d0e" opacity="0.4"/>`,
        silhouette(250, 380, 100, '#1a1a1a'),
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch3', title: 'شکوه و غرور', elements: [
        dome(250, 60, 160, 50, '#854d0e'),
        silhouette(250, 380, 100, '#1a1a1a'),
        `<circle cx="250" cy="180" r="40" fill="#fde047" opacity="0.2"/>`,
        `<text x="250" y="180" text-anchor="middle" fill="#fde047" font-family="serif" font-size="10" opacity="0.6">غرور</text>`,
        cypress(70, 530, 100, '#2a1a1a'),
        cypress(430, 530, 100, '#2a1a1a'),
      ]},
      { file: 'ch4', title: 'سقوط جمشید', elements: [
        dome(250, 70, 140, 40, '#333'),
        silhouette(250, 380, 100, '#1a1a1a'),
        `<line x1="180" y1="280" x2="320" y2="280" stroke="#ef4444" stroke-width="2" opacity="0.5"/>`,
        `<text x="250" y="310" text-anchor="middle" fill="#6b7280" font-family="serif" font-size="12" opacity="0.5">سقوط</text>`,
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
      ]},
      { file: 'ch5', title: 'میراث جمشید', elements: [
        column(100, 400, 150, '#6b7280'),
        column(190, 400, 150, '#6b7280'),
        column(310, 400, 150, '#6b7280'),
        column(400, 400, 150, '#6b7280'),
        `<rect x="100" y="250" width="300" height="15" rx="2" fill="#4a4a4a" opacity="0.5"/>`,
        `<text x="250" y="180" text-anchor="middle" fill="#eab308" font-family="serif" font-size="14" opacity="0.6">ویرانه‌های تخت جمشید</text>`,
        cypress(70, 530, 100, '#1a1a1a'),
        cypress(430, 530, 100, '#1a1a1a'),
      ]},
    ]
  },
  {
    name: 'anushirvan',
    c1: '#06b6d4', c2: '#155e75',
    title: 'انوشیروان دادگر', subtitle: 'تاریخ ایران باستان',
    chapters: [
      { file: 'ch1', title: 'تاجگذاری انوشیروان', elements: [
        dome(250, 60, 180, 55, '#155e75'),
        silhouette(250, 380, 100, '#1a1a2e'),
        `<circle cx="250" cy="280" r="30" fill="#06b6d4" opacity="0.15"/>`,
        cypress(70, 530, 100, '#0a2a3a'),
        cypress(430, 530, 100, '#0a2a3a'),
      ]},
      { file: 'ch2', title: 'بزرگمهر وزیر', elements: [
        dome(250, 60, 140, 40, '#155e75'),
        silhouette(160, 380, 90, '#1a1a2e'),
        silhouette(340, 380, 90, '#2a1a2e'),
        book(340, 280, 30, '#06b6d4'),
        cypress(70, 530, 100, '#0a2a3a'),
        cypress(430, 530, 100, '#0a2a3a'),
      ]},
      { file: 'ch3', title: 'جنگ با روم', elements: [
        silhouette(130, 380, 100, '#1a1a2e'),
        silhouette(370, 380, 100, '#2a1a2e'),
        `<line x1="200" y1="320" x2="300" y2="320" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 5"/>`,
        dome(250, 60, 120, 35, '#155e75'),
        cypress(70, 530, 100, '#0a2a3a'),
        cypress(430, 530, 100, '#0a2a3a'),
      ]},
      { file: 'ch4', title: 'ایوان مدائن', elements: [
        `<path d="M 150 370 Q 250 200 350 370" fill="none" stroke="#06b6d4" stroke-width="5"/>`,
        `<rect x="150" y="370" width="200" height="30" rx="3" fill="#155e75" opacity="0.8"/>`,
        column(160, 380, 120, '#06b6d4'),
        column(340, 380, 120, '#06b6d4'),
        silhouette(250, 370, 90, '#1a1a2e'),
        cypress(70, 530, 100, '#0a2a3a'),
        cypress(430, 530, 100, '#0a2a3a'),
      ]},
    ]
  },
];

function generateAll() {
  console.log('🧹 Generating SVGs for 7 new campaigns...');
  for (const camp of CAMPAIGNS) {
    ensureDir(`${BASE}/images/chapters/${camp.name}/`);
    ensureDir(`${BASE}/images/monsters/${camp.name}/`);
    for (const ch of camp.chapters) {
      const svg = makeChapterSvg(ch.title, ch.elements, camp.c1, camp.c2);
      fs.writeFileSync(`${BASE}/images/chapters/${camp.name}/${ch.file}.svg`, svg);
      console.log(`  📄 chapters/${camp.name}/${ch.file}.svg`);
    }
    for (let i = 1; i <= camp.chapters.length; i++) {
      const svg = makeMonsterSvg(camp.c1, camp.c2);
      fs.writeFileSync(`${BASE}/images/monsters/${camp.name}/ch${i}-monster.svg`, svg);
      console.log(`  👹 monsters/${camp.name}/ch${i}-monster.svg`);
    }
    const coverSvg = makeCoverSvg(camp.title, camp.subtitle, [
      camp.name === 'zal-simorgh' ? cypress(200, 400, 100, '#075985') : '',
      camp.name === 'zal-simorgh' ? mountain(200, 400, 250, 100, '#0f2a3a') : '',
      camp.name === 'zal-simorgh' ? `<path d="M 150 200 Q 200 160 250 200 Q 200 180 150 200" fill="#0ea5e9" opacity="0.6"/>` : '',
      camp.name === 'kaykhosrow' ? silhouette(200, 420, 100, '#1a1a1a') : '',
      camp.name === 'kaykhosrow' ? fire(200, 480, 50, '#dc2626') : '',
      camp.name === 'kaykhosrow' ? dome(200, 150, 120, 35, '#991b1b') : '',
      camp.name === 'rostam-death' ? `<rect x="180" y="300" width="40" height="80" rx="3" fill="#000" opacity="0.8"/>` : '',
      camp.name === 'rostam-death' ? silhouette(200, 380, 90, '#222') : '',
      camp.name === 'rostam-akvan' ? mountain(200, 400, 300, 120, '#1a0a2a') : '',
      camp.name === 'rostam-akvan' ? silhouette(200, 400, 90, '#1a1a2e') : '',
      camp.name === 'rostam-akvan' ? `<circle cx="100" cy="280" r="15" fill="#7c3aed" opacity="0.4"/>` : '',
      camp.name === 'hushang' ? fire(200, 400, 80, '#f97316') : '',
      camp.name === 'jamshid' ? column(160, 360, 120, '#eab308') : '',
      camp.name === 'jamshid' ? column(240, 360, 120, '#eab308') : '',
      camp.name === 'jamshid' ? dome(200, 150, 130, 40, '#854d0e') : '',
      camp.name === 'anushirvan' ? `<path d="M 120 380 Q 200 200 280 380" fill="none" stroke="#06b6d4" stroke-width="4"/>` : '',
      camp.name === 'anushirvan' ? `<rect x="120" y="380" width="160" height="20" rx="2" fill="#155e75" opacity="0.7"/>` : '',
    ], camp.c1, camp.c2);
    fs.writeFileSync(`${BASE}/images/covers/${camp.name}.svg`, coverSvg);
    console.log(`  🎨 covers/${camp.name}.svg`);
  }
  console.log('\n✅ All SVGs generated!');
}

generateAll();
