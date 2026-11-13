const fs = require('fs');
const path = require('path');

function islBorder(w, h, color, opacity = 0.6, strokeW = 2) {
  const tile = Math.round(Math.min(w, h) / 14);
  let shapes = '';
  for (let x = 0; x <= w - tile; x += tile) {
    for (let y = 0; y <= h - tile; y += tile) {
      const inset = tile * 0.15;
      shapes += `<rect x="${x + inset}" y="${y + inset}" width="${tile - inset * 2}" height="${tile - inset * 2}" fill="none" stroke="${color}" stroke-width="${strokeW * 0.3}" opacity="${opacity * 0.4}" rx="${tile * 0.2}"/>`;
      if (x % (tile * 2) === 0 && y % (tile * 2) === 0) {
        shapes += `<circle cx="${x + tile / 2}" cy="${y + tile / 2}" r="${tile * 0.12}" fill="${color}" opacity="${opacity * 0.3}"/>`;
      }
    }
  }
  return shapes;
}

function cypressTree(cx, cy, h, color) {
  const w = h * 0.14;
  return `<path d="M${cx} ${cy - h} Q${cx - w * 2} ${cy - h * 0.6} ${cx - w * 1.2} ${cy - h * 0.2} Q${cx - w * 0.3} ${cy} ${cx} ${cy + h * 0.05} Q${cx + w * 0.3} ${cy} ${cx + w * 1.2} ${cy - h * 0.2} Q${cx + w * 2} ${cy - h * 0.6} ${cx} ${cy - h}Z" fill="${color}" opacity="0.9"/>
    <path d="M${cx} ${cy - h * 0.65} L${cx - w * 0.4} ${cy - h * 0.35}" stroke="${color}" stroke-width="1" fill="none" opacity="0.3"/>
    <path d="M${cx} ${cy - h * 0.45} L${cx + w * 0.4} ${cy - h * 0.2}" stroke="${color}" stroke-width="1" fill="none" opacity="0.3"/>`;
}

function mountain(cx, cy, w, h, color, layers = 1) {
  let svg = '';
  for (let i = 0; i < layers; i++) {
    const yOff = i * h * 0.15;
    const wOff = w * 0.12 * i;
    const op = 0.4 - i * 0.08;
    svg += `<polygon points="${cx - w + wOff},${cy + yOff} ${cx},${cy - h + yOff * 0.5} ${cx + w - wOff},${cy + yOff}" fill="${color}" opacity="${Math.max(op, 0.1)}"/>`;
    if (i === 1) svg += `<polygon points="${cx - w * 0.15},${cy - h * 0.7 + yOff * 0.3} ${cx},${cy - h + yOff * 0.5} ${cx + w * 0.15},${cy - h * 0.7 + yOff * 0.3}" fill="${color}" opacity="0.2"/>`;
  }
  return svg;
}

function sunCircle(cx, cy, r, color) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="0.9"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.25}" fill="white" opacity="0.3"/>`;
}

function warriorSil(cx, cy, s, color) {
  return `<circle cx="${cx}" cy="${cy - 18 * s}" r="${6 * s}" fill="${color}"/>
    <path d="M${cx - 8 * s} ${cy - 12 * s} L${cx + 8 * s} ${cy - 12 * s} L${cx + 12 * s} ${cy - 2 * s} L${cx - 12 * s} ${cy - 2 * s}Z" fill="${color}"/>
    <path d="M${cx - 3 * s} ${cy - 2 * s} L${cx - 3 * s} ${cy + 10 * s}" stroke="${color}" stroke-width="${3 * s}" stroke-linecap="round"/>
    <path d="M${cx + 3 * s} ${cy - 2 * s} L${cx + 3 * s} ${cy + 10 * s}" stroke="${color}" stroke-width="${3 * s}" stroke-linecap="round"/>
    <path d="M${cx - 10 * s} ${cy + 1 * s} L${cx + 10 * s} ${cy + 1 * s}" stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round"/>`;
}

function horseFig(cx, cy, s, color) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${12 * s}" ry="${6 * s}" fill="${color}" opacity="0.8"/>
    <rect x="${cx - 10 * s}" y="${cy - 8 * s}" width="${8 * s}" height="${12 * s}" rx="${3 * s}" fill="${color}" opacity="0.8"/>
    <rect x="${cx + 2 * s}" y="${cy - 8 * s}" width="${8 * s}" height="${12 * s}" rx="${3 * s}" fill="${color}" opacity="0.8"/>
    <path d="M${cx - 14 * s} ${cy - 2 * s} Q${cx - 20 * s} ${cy - 8 * s} ${cx - 18 * s} ${cy - 2 * s}" fill="none" stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round"/>
    <line x1="${cx + 10 * s}" y1="${cy}" x2="${cx + 14 * s}" y2="${cy - 6 * s}" stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round"/>`;
}

function dome(cx, cy, w, h, color) {
  return `<path d="M${cx - w / 2} ${cy} L${cx - w / 2} ${cy - h * 0.6} Q${cx} ${cy - h} ${cx + w / 2} ${cy - h * 0.6} L${cx + w / 2} ${cy}Z" fill="${color}" opacity="0.6"/>
    <rect x="${cx - w / 2}" y="${cy - h * 0.6}" width="${w}" height="${h * 0.02}" fill="${color}" opacity="0.7"/>
    <line x1="${cx - w * 0.15}" y1="${cy - h * 0.82}" x2="${cx + w * 0.15}" y2="${cy - h * 0.82}" stroke="${color}" stroke-width="1.5" opacity="0.5"/>`;
}

function crescentMoon(cx, cy, r, color) {
  return `<path d="M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r * 0.75} ${r * 0.75} 0 1 0 ${cx} ${cy - r}Z" fill="${color}" opacity="0.85"/>
    <circle cx="${cx}" cy="${cy - r * 0.4}" r="${r * 0.06}" fill="white" opacity="0.3"/>
    <circle cx="${cx + r * 0.35}" cy="${cy}" r="${r * 0.04}" fill="white" opacity="0.2"/>`;
}

function stars(cx, cy, r, color, count = 3) {
  let svg = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = r * 0.5 + Math.random() * r * 0.4;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const sz = 1 + Math.random() * 1.5;
    svg += `<circle cx="${x}" cy="${y}" r="${sz}" fill="${color}" opacity="${0.3 + Math.random() * 0.4}"/>`;
  }
  return svg;
}

function crown(cx, cy, s, color) {
  return `<path d="M${cx - 10 * s} ${cy} L${cx - 8 * s} ${cy - 8 * s} L${cx - 4 * s} ${cy - 4 * s} L${cx} ${cy - 12 * s} L${cx + 4 * s} ${cy - 4 * s} L${cx + 8 * s} ${cy - 8 * s} L${cx + 10 * s} ${cy}Z" fill="${color}" opacity="0.85"/>
    <circle cx="${cx - 4 * s}" cy="${cy - 4 * s}" r="${1.5 * s}" fill="white" opacity="0.4"/>
    <circle cx="${cx}" cy="${cy - 12 * s}" r="${1.5 * s}" fill="white" opacity="0.4"/>
    <circle cx="${cx + 4 * s}" cy="${cy - 4 * s}" r="${1.5 * s}" fill="white" opacity="0.4"/>
    <circle cx="0" cy="0" r="10" fill="red"/>`.replace(/<circle cx="0" cy="0" r="10" fill="red"\/>/, '');
}

function flowerBush(cx, cy, size, color) {
  let svg = '';
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const x = cx + Math.cos(angle) * size * 0.35;
    const y = cy + Math.sin(angle) * size * 0.35;
    const r = size * 0.12;
    svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color || '#fff'}" opacity="${0.3 + (i % 2) * 0.2}"/>
      <circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="white" opacity="0.3"/>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${size * 0.1}" fill="${color || '#fff'}" opacity="0.5"/>`;
  return svg;
}

function dragonSil(cx, cy, s, color) {
  return `<path d="M${cx - 12 * s} ${cy} Q${cx - 18 * s} ${cy - 8 * s} ${cx - 10 * s} ${cy - 14 * s} Q${cx - 3 * s} ${cy - 18 * s} ${cx + 3 * s} ${cy - 10 * s}" fill="none" stroke="${color}" stroke-width="${2 * s}" stroke-linecap="round"/>
    <circle cx="${cx + 3 * s}" cy="${cy - 10 * s}" r="${4 * s}" fill="${color}" opacity="0.8"/>
    <circle cx="${cx + 3 * s}" cy="${cy - 11 * s}" r="${1.5 * s}" fill="#ef4444"/>
    <path d="M${cx + 3 * s} ${cy - 6 * s} Q${cx + 10 * s} ${cy - 4 * s} ${cx + 15 * s} ${cy - 2 * s} Q${cx + 18 * s} ${cy} ${cx + 16 * s} ${cy + 6 * s} Q${cx + 14 * s} ${cy + 8 * s} ${cx + 10 * s} ${cy + 4 * s}" fill="none" stroke="${color}" stroke-width="${1.5 * s}" stroke-linecap="round"/>`;
}

function dragonBody(cx, cy, s, color) {
  let body = '';
  for (let i = 0; i < 4; i++) {
    const x = cx - i * 5 * s;
    const y = cy + Math.sin(i * 0.7) * 3 * s;
    body += `<ellipse cx="${x}" cy="${y}" rx="${3 * s}" ry="${1.5 * s}" fill="${color}" opacity="${0.3 + (4 - i) * 0.1}"/>`;
  }
  return body + dragonSil(cx, cy, s, color);
}

function fire(cx, cy, size, color) {
  return `<path d="M${cx - size * 0.35} ${cy} Q${cx - size * 0.25} ${cy - size * 0.5} ${cx + size * 0.05} ${cy - size} Q${cx + size * 0.3} ${cy - size * 0.5} ${cx + size * 0.4} ${cy - size * 0.2} Q${cx + size * 0.2} ${cy - size * 0.35} ${cx + size * 0.1} ${cy - size * 0.45} Q${cx + size * 0.15} ${cy - size * 0.1} ${cx - size * 0.35} ${cy}Z" fill="${color}" opacity="0.6"/>
    <path d="M${cx - size * 0.15} ${cy} Q${cx} ${cy - size * 0.5} ${cx + size * 0.2} ${cy - size * 0.3} Q${cx + size * 0.1} ${cy - size * 0.15} ${cx - size * 0.15} ${cy}Z" fill="${color}" opacity="0.85"/>`;
}

function waterWave(cx, cy, w, color) {
  return `<path d="M${cx - w / 2} ${cy} Q${cx - w / 4} ${cy - 4} ${cx} ${cy + 2} Q${cx + w / 4} ${cy + 8} ${cx + w / 2} ${cy + 2}" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
    <path d="M${cx - w / 3} ${cy + 5} Q${cx - w / 6} ${cy + 1} ${cx} ${cy + 7} Q${cx + w / 6} ${cy + 13} ${cx + w / 3} ${cy + 7}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3"/>`;
}

function persianArch(cx, cy, w, h, color) {
  return `<path d="M${cx - w / 2} ${cy} L${cx - w / 2} ${cy - h * 0.6} Q${cx} ${cy - h} ${cx + w / 2} ${cy - h * 0.6} L${cx + w / 2} ${cy}Z" fill="none" stroke="${color}" stroke-width="2" opacity="0.5"/>
    <path d="M${cx - w / 3} ${cy} L${cx - w / 3} ${cy - h * 0.45} Q${cx} ${cy - h * 0.7} ${cx + w / 3} ${cy - h * 0.45} L${cx + w / 3} ${cy}Z" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>`;
}

function makeScene(w, h, elements) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${elements.bgTop || '#1c1917'}" stop-opacity="${elements.bgTopOp || '0.85'}"/>
      <stop offset="100%" stop-color="${elements.bgBot || '#000000'}"/>
    </radialGradient>
    ${elements.gradients || ''}
  </defs>
  <rect width="${w}" height="${h}" fill="${elements.bgSolid || '#000'}" rx="12"/>
  <circle cx="${w / 2}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.48}" fill="url(#bg)" stroke="${elements.accent}" stroke-width="2"/>
  <circle cx="${w / 2}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.45}" fill="none" stroke="${elements.accent}" stroke-width="${elements.borderW || 1}" opacity="${elements.borderOp || 0.3}"/>
  ${islBorder(w, h, elements.accent, 0.35, 1)}
  ${elements.content || ''}
  <rect x="0" y="${h - 60}" width="${w}" height="60" fill="black" opacity="0.5"/>
  <text x="${w / 2}" y="${h - 25}" text-anchor="middle" fill="${elements.textColor || '#fff'}" font-family="serif" font-size="20" font-weight="bold" dir="rtl">${elements.title}</text>
</svg>`;
}

function makeSceneLight(w, h, elements) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bgL" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${elements.bgTop || '#f0f9ff'}"/>
      <stop offset="100%" stop-color="${elements.bgBot || '#e0f2fe'}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bgL)" rx="12"/>
  <circle cx="${w / 2}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.46}" fill="none" stroke="${elements.accent}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="${w / 2}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.43}" fill="none" stroke="${elements.accent}" stroke-width="0.5" opacity="0.15"/>
  ${islBorder(w, h, elements.accent, 0.2, 0.5)}
  ${elements.content || ''}
  <rect x="0" y="${h - 60}" width="${w}" height="60" fill="${elements.accent}" opacity="0.7"/>
  <text x="${w / 2}" y="${h - 25}" text-anchor="middle" fill="${elements.textColor || '#1e3a5f'}" font-family="sans" font-size="18" font-weight="bold" dir="rtl">${elements.title}</text>
</svg>`;
}

function writeSVG(filePath, svgContent) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, svgContent);
  console.log(`  ${path.relative(path.join(__dirname, '..'), filePath)}`);
}

module.exports = {
  islBorder, cypressTree, mountain, sunCircle, warriorSil, horseFig,
  dome, crescentMoon, stars, crown, flowerBush, dragonBody, fire,
  waterWave, persianArch, makeScene, makeSceneLight, writeSVG
};
