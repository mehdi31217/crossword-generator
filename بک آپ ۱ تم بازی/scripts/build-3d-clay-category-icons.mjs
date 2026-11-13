import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'public/images/d9';
fs.mkdirSync(OUT_DIR, { recursive: true });

// Palette configurations for the 4 clay button base types matching h-nav-1..5.webp:
const THEMES = {
  terracotta: {
    stop1: '#E27E58',
    stop2: '#B85532',
    stop3: '#8E391A',
    stop4: '#581F0A',
    highlight: '#FFD2C0',
    shadow: '#1C0A03',
    insetStroke: '#3A1408',
    strokeDark: '#3A180A',
  },
  sage: {
    stop1: '#8EA67D',
    stop2: '#688057',
    stop3: '#455A38',
    stop4: '#28381F',
    highlight: '#D5E6C9',
    shadow: '#0E1A0A',
    insetStroke: '#1E2C17',
    strokeDark: '#203018',
  },
  slate: {
    stop1: '#6E899E',
    stop2: '#4A6376',
    stop3: '#2D4454',
    stop4: '#182732',
    highlight: '#B8D3E8',
    shadow: '#0B141B',
    insetStroke: '#12202A',
    strokeDark: '#14222D',
  },
  gold: {
    stop1: '#E8B65A',
    stop2: '#BF8C34',
    stop3: '#92621D',
    stop4: '#5C380A',
    highlight: '#FFEABE',
    shadow: '#1C1002',
    insetStroke: '#3E2408',
    strokeDark: '#3C2208',
  },
};

const CATEGORIES = [
  {
    key: 'shahnameh',
    theme: 'terracotta',
    draw: `
      <!-- Crown Base -->
      <path d="M38 72L42 46L52 58L60 40L68 58L78 46L82 72H38Z" fill="url(#emblemGrad)"/>
      <path d="M36 78H84" stroke="#FAF0E4" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Gold Gem -->
      <circle cx="60" cy="40" r="4.5" fill="#F7D788"/>
      <circle cx="42" cy="46" r="3.5" fill="#F7D788"/>
      <circle cx="78" cy="46" r="3.5" fill="#F7D788"/>
    `,
  },
  {
    key: 'general',
    theme: 'terracotta',
    draw: `
      <circle cx="60" cy="60" r="25" fill="none" stroke="url(#emblemGrad)" stroke-width="3" opacity="0.4"/>
      <path d="M60 34L66 54L86 60L66 66L60 86L54 66L34 60L54 54Z" fill="url(#emblemGrad)"/>
      <circle cx="60" cy="60" r="4.5" fill="#F7D788"/>
    `,
  },
  {
    key: 'history',
    theme: 'slate',
    draw: `
      <path d="M48 38H72M52 38V46C46 51 43 59 45 68C47 76 52 82 60 82C68 82 73 76 75 68C77 59 74 51 68 46V38" fill="url(#emblemGrad)"/>
      <path d="M46 82H74" stroke="#FAF0E4" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M52 48C42 48 42 62 48 66" fill="none" stroke="url(#emblemGrad)" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M68 48C78 48 78 62 72 66" fill="none" stroke="url(#emblemGrad)" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },
  {
    key: 'nature',
    theme: 'sage',
    draw: `
      <path d="M60 84V44" stroke="url(#emblemGrad)" stroke-width="5" stroke-linecap="round"/>
      <path d="M60 64C46 64 38 52 38 40C52 40 60 50 60 64Z" fill="url(#emblemGrad)"/>
      <path d="M60 58C74 58 82 46 82 34C68 34 60 44 60 58Z" fill="url(#emblemGrad)"/>
      <circle cx="60" cy="84" r="4" fill="#F7D788"/>
    `,
  },
  {
    key: 'food',
    theme: 'sage',
    draw: `
      <path d="M36 54H84C84 70 73 82 60 82C47 82 36 70 36 54Z" fill="url(#emblemGrad)"/>
      <path d="M50 36C50 42 54 44 54 48M70 34C70 40 74 42 74 46" stroke="#FAF0E4" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>
      <path d="M34 54H86" stroke="#FAF0E4" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },
  {
    key: 'movies',
    theme: 'slate',
    draw: `
      <rect x="36" y="50" width="48" height="32" rx="5" fill="url(#emblemGrad)"/>
      <path d="M36 50L44 38H84L76 50H36Z" fill="url(#emblemGrad)"/>
      <path d="M52 38L46 50M66 38L60 50M80 38L74 50" stroke="#182732" stroke-width="2.5" opacity="0.5"/>
    `,
  },
  {
    key: 'cities',
    theme: 'slate',
    draw: `
      <path d="M42 82V60C42 48 50 38 60 32C70 38 78 48 78 60V82H42Z" fill="url(#emblemGrad)"/>
      <path d="M52 82V66C52 62 55 58 60 58C65 58 68 62 68 66V82" fill="#182732" opacity="0.5"/>
      <circle cx="60" cy="30" r="3" fill="#F7D788"/>
    `,
  },
  {
    key: 'knowledge',
    theme: 'gold',
    draw: `
      <path d="M60 44C52 40 42 40 34 44V76C42 72 52 72 60 76C68 72 78 72 86 76V44C78 40 68 40 60 44Z" fill="url(#emblemGrad)"/>
      <path d="M60 44V76" stroke="#5C380A" stroke-width="3.5" opacity="0.6"/>
      <path d="M42 52H52M42 60H52M68 52H78M68 60H78" stroke="#5C380A" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/>
    `,
  },
  {
    key: 'body',
    theme: 'terracotta',
    draw: `
      <path d="M60 82C60 82 38 66 38 49C38 40 44 34 52 34C57 34 60 37 60 41C60 37 63 34 68 34C76 34 82 40 82 49C82 66 60 82 60 82Z" fill="url(#emblemGrad)"/>
      <path d="M42 52H50L54 44L58 60L62 48L66 52H78" fill="none" stroke="#581F0A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    `,
  },
  {
    key: 'jobs',
    theme: 'gold',
    draw: `
      <rect x="36" y="48" width="48" height="34" rx="6" fill="url(#emblemGrad)"/>
      <path d="M50 48V40C50 38 52 36 54 36H66C68 36 70 38 70 40V48" fill="none" stroke="url(#emblemGrad)" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M36 62H84" stroke="#5C380A" stroke-width="3" opacity="0.5"/>
    `,
  },
  {
    key: 'tech',
    theme: 'slate',
    draw: `
      <rect x="42" y="42" width="36" height="36" rx="6" fill="url(#emblemGrad)"/>
      <path d="M50 32V42M70 32V42M50 78V88M70 78V88M32 50H42M32 70H42M78 50H88M78 70H88" stroke="#FAF0E4" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="60" cy="60" r="5" fill="#F7D788"/>
    `,
  },
  {
    key: 'sports',
    theme: 'sage',
    draw: `
      <path d="M44 38H76V56C76 65 69 72 60 72C51 72 44 65 44 56V38Z" fill="url(#emblemGrad)"/>
      <path d="M60 72V82M48 82H72" stroke="#FAF0E4" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 42C36 42 36 54 44 56" fill="none" stroke="url(#emblemGrad)" stroke-width="3.5"/>
      <path d="M76 42C84 42 84 54 76 56" fill="none" stroke="url(#emblemGrad)" stroke-width="3.5"/>
      <circle cx="60" cy="48" r="4" fill="#F7D788"/>
    `,
  },
  {
    key: 'art',
    theme: 'gold',
    draw: `
      <path d="M72 36L82 26" stroke="#FAF0E4" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="52" cy="64" rx="18" ry="14" transform="rotate(-40 52 64)" fill="url(#emblemGrad)"/>
      <circle cx="56" cy="60" r="3.5" fill="#5C380A" opacity="0.6"/>
    `,
  },
  {
    key: 'all',
    theme: 'terracotta',
    draw: `
      <rect x="36" y="36" width="48" height="48" rx="8" fill="url(#emblemGrad)"/>
      <path d="M60 36V84M36 60H84" stroke="#581F0A" stroke-width="3.5" opacity="0.6"/>
      <circle cx="60" cy="60" r="5" fill="#F7D788"/>
    `,
  },
];

console.log('Generating 14 high-fidelity 3D Clay Category Medallion WebP icons...');

for (const cat of CATEGORIES) {
  const t = THEMES[cat.theme];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <!-- 3D Clay Disc Radial Gradient -->
    <radialGradient id="clayBase" cx="35%" cy="30%" r="72%">
      <stop offset="0%" stop-color="${t.stop1}"/>
      <stop offset="55%" stop-color="${t.stop2}"/>
      <stop offset="85%" stop-color="${t.stop3}"/>
      <stop offset="100%" stop-color="${t.stop4}"/>
    </radialGradient>

    <!-- Top-Left Light Reflection Highlight -->
    <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.highlight}" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="${t.highlight}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${t.shadow}" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Cream Clay Emblem Gradient -->
    <radialGradient id="emblemGrad" cx="35%" cy="28%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="65%" stop-color="#FAF0E4"/>
      <stop offset="100%" stop-color="#DCD0C0"/>
    </radialGradient>
  </defs>

  <!-- Outer Drop Shadow -->
  <circle cx="60" cy="63" r="50" fill="${t.shadow}" opacity="0.5"/>

  <!-- Main 3D Clay Disc -->
  <circle cx="60" cy="60" r="50" fill="url(#clayBase)"/>
  <circle cx="60" cy="60" r="49" fill="none" stroke="url(#rimLight)" stroke-width="2"/>
  <circle cx="60" cy="60" r="46.5" fill="none" stroke="${t.insetStroke}" stroke-width="1.2" opacity="0.35"/>

  <!-- 3D Bevel Shadow under Emblem -->
  <g transform="translate(1, 2)" opacity="0.65">
    ${cat.draw.replace(/fill="url\(#emblemGrad\)"/g, `fill="${t.shadow}"`).replace(/stroke="#FAF0E4"/g, `stroke="${t.shadow}"`).replace(/stroke="url\(#emblemGrad\)"/g, `stroke="${t.shadow}"`)}
  </g>

  <!-- 3D Highlight for Emblem -->
  <g transform="translate(-0.5, -1)" opacity="0.8">
    ${cat.draw.replace(/fill="url\(#emblemGrad\)"/g, 'fill="#FFFFFF"').replace(/stroke="#FAF0E4"/g, 'stroke="#FFFFFF"').replace(/stroke="url\(#emblemGrad\)"/g, 'stroke="#FFFFFF"')}
  </g>

  <!-- Main 3D Relief Emblem Artwork -->
  <g stroke="${t.strokeDark}" stroke-width="0.8">
    ${cat.draw}
  </g>
</svg>`;

  const tempSvg = path.join(OUT_DIR, `temp_${cat.key}.svg`);
  const outWebp = path.join(OUT_DIR, `h-cat-${cat.key}.webp`);

  fs.writeFileSync(tempSvg, svg);
  execSync(`ffmpeg -y -v error -i "${tempSvg}" -c:v libwebp -quality 95 "${outWebp}"`);
  fs.unlinkSync(tempSvg);

  console.log(`Generated ${outWebp}`);
}

console.log('All 14 3D Clay Category Medallion icons generated successfully!');
