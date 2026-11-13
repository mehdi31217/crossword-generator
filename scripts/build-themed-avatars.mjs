import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/images/avatars');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SIZE = 320;
const MAX_BUF = { maxBuffer: 120 * 1024 * 1024 };

const AVATARS = [
  // ─── 10 FAMOUS CELEBRITIES & HISTORICAL ICONS (مشاهیر ایران و جهان) ───
  {
    id: 'celeb_cyrus',
    src: 'public/images/monsters/achaemenids/monster1.jpg',
    box: [0.04, 0.00, 0.84, 0.76],
    seed: 101,
    gamma: 0.78,
    inkScale: 0.48,
  },
  {
    id: 'celeb_ferdowsi',
    src: 'public/images/monsters/safavids/monster1.jpg',
    box: [0.35, 0.00, 0.75, 0.40],
    seed: 102,
    gamma: 0.88,
    inkScale: 0.65,
  },
  {
    id: 'celeb_avicenna',
    src: 'public/images/covers/seljuks.jpg',
    box: [0.30, 0.04, 0.62, 0.50],
    seed: 103,
    gamma: 0.88,
    inkScale: 0.62,
  },
  {
    id: 'celeb_einstein',
    src: 'public/images/_raw/avatars/einstein.jpg',
    box: [0.08, 0.02, 0.92, 0.86],
    seed: 104,
    gamma: 0.90,
    inkScale: 0.68,
  },
  {
    id: 'celeb_mirzakhani',
    src: 'public/images/_raw/avatars/mirzakhani.jpg',
    box: [0.08, 0.02, 0.92, 0.86],
    seed: 105,
    gamma: 0.95,
    inkScale: 0.75,
  },
  {
    id: 'celeb_amirkabir',
    src: 'public/images/chapters/qajars/ch3.jpg',
    box: [0.34, 0.06, 0.66, 0.58],
    seed: 106,
    gamma: 0.86,
    inkScale: 0.52,
  },
  {
    id: 'celeb_mosaddegh',
    src: 'public/images/covers/mosaddegh.jpg',
    box: [0.28, 0.03, 0.72, 0.75],
    seed: 107,
    gamma: 0.90,
    inkScale: 0.64,
  },
  {
    id: 'celeb_shahabbas',
    src: 'public/images/covers/safavids.jpg',
    box: [0.26, 0.14, 0.72, 0.85],
    seed: 108,
    gamma: 0.86,
    inkScale: 0.58,
  },
  {
    id: 'celeb_davinci',
    src: 'public/images/monsters/achaemenids/monster4.jpg',
    box: [0.02, 0.02, 0.88, 0.88],
    seed: 109,
    gamma: 0.84,
    inkScale: 0.55,
  },
  {
    id: 'celeb_chaplin',
    src: 'public/images/_raw/avatars/chaplin.jpg',
    box: [0.08, 0.02, 0.92, 0.86],
    seed: 110,
    gamma: 0.90,
    inkScale: 0.68,
  },

  // ─── 10 WORLD'S BEST FOOTBALL PLAYERS (بهترین بازیکنان جهان) ───
  {
    id: 'player_messi',
    src: 'public/images/legends/messi_91goals.jpg',
    box: [0.12, 0.02, 0.88, 0.64],
    seed: 201,
  },
  {
    id: 'player_ronaldo',
    src: 'public/images/legends/ronaldo_real.jpg',
    box: [0.10, 0.01, 0.86, 0.60],
    seed: 202,
  },
  {
    id: 'player_pele',
    src: 'public/images/legends/pele_triple.jpg',
    box: [0.06, 0.02, 0.74, 0.56],
    seed: 203,
    gamma: 0.84,
  },
  {
    id: 'player_maradona',
    src: 'public/images/legends/maradona_barcelona.jpg',
    box: [0.14, 0.22, 0.76, 0.68],
    seed: 204,
  },
  {
    id: 'player_zidane',
    src: 'public/images/legends/zidane_galacticos.jpg',
    box: [0.08, 0.02, 0.92, 0.76],
    seed: 205,
  },
  {
    id: 'player_ronaldinho',
    src: 'public/images/legends/ronaldinho_samba.jpg',
    box: [0.24, 0.04, 0.76, 0.42],
    seed: 206,
    gamma: 0.85,
  },
  {
    id: 'player_ronaldo9',
    src: 'public/images/legends/ronaldo9_return.jpg',
    box: [0.08, 0.06, 0.88, 0.70],
    seed: 207,
  },
  {
    id: 'player_mbappe',
    src: 'public/images/legends/mbappe_2018.jpg',
    box: [0.20, 0.02, 0.78, 0.40],
    seed: 208,
  },
  {
    id: 'player_cruyff',
    src: 'public/images/legends/cruyff_ajax.jpg',
    box: [0.24, 0.12, 0.72, 0.52],
    seed: 209,
  },
  {
    id: 'player_maldini',
    src: 'public/images/legends/maldini_captain.jpg',
    box: [0.10, 0.04, 0.90, 0.74],
    seed: 210,
  },
];

function getDimensions(filePath) {
  const out = execSync(`identify -format "%w %h" "${filePath}"`, MAX_BUF).toString().trim();
  const [w, h] = out.split(/\s+/).map(Number);
  return { w, h };
}

function loadCroppedSquareRgba(filePath, boxFrac, outSize) {
  const { w, h } = getDimensions(filePath);
  const x0 = Math.round(boxFrac[0] * w);
  const y0 = Math.round(boxFrac[1] * h);
  const x1 = Math.round(boxFrac[2] * w);
  const y1 = Math.round(boxFrac[3] * h);
  const cw = Math.max(16, x1 - x0);
  const ch = Math.max(16, y1 - y0);
  const cx = Math.round((x0 + x1) * 0.5);
  const cy = Math.round((y0 + y1) * 0.5);
  const side = Math.min(w, h, Math.max(cw, ch));
  const sx0 = Math.max(0, Math.min(w - side, Math.round(cx - side * 0.5)));
  const sy0 = Math.max(0, Math.min(h - side, Math.round(cy - side * 0.5)));

  const buf = execSync(
    `convert "${filePath}" -crop ${side}x${side}+${sx0}+${sy0} +repage -filter Lanczos -resize ${outSize}x${outSize}! -statistic Median 3x3 -paint 1 -depth 8 rgba:-`,
    MAX_BUF
  );
  return new Uint8Array(buf);
}

function saveWebp(filePath, data, w, h, quality = 93) {
  execSync(
    `convert -size ${w}x${h} -depth 8 rgba:- -quality ${quality} -define webp:method=6 "${filePath}"`,
    { ...MAX_BUF, input: Buffer.from(data.buffer, data.byteOffset, data.byteLength) }
  );
}

function hash2(x, y, seed = 1337) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x, y, scale, seed) {
  const sx = x / scale;
  const sy = y / scale;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const fx = sx - ix;
  const fy = sy - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbmAdobe(x, y, seed = 101) {
  const n1 = valueNoise(x, y, 14.0, seed);
  const n2 = valueNoise(x, y, 6.5, seed + 17);
  const n3 = valueNoise(x, y, 2.8, seed + 37);
  const n4 = valueNoise(x, y, 1.35, seed + 73);
  return n1 * 0.42 + n2 * 0.30 + n3 * 0.18 + n4 * 0.10;
}

function sampleClayMicroRelief(x, y, seed = 101) {
  const h0 = fbmAdobe(x, y, seed);
  const hx = fbmAdobe(x + 1.2, y, seed);
  const hy = fbmAdobe(x, y + 1.2, seed);
  const dx = hx - h0;
  const dy = hy - h0;
  const bump = -(dx * 0.65 + dy * 0.76) * 42.0;
  return {
    deltaL: bump + (h0 - 0.5) * 7.0,
    warmth: (h0 - 0.5) * 4.5,
  };
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

// Khaki-Clay & Sepia-Umber Ramp matching the exact khaki clay medallion (#D8C2A3) in hybrid-clay-paper-home.png!
// No outer ring, no colored collar — pure portrait harmonized with the khaki clay background!
function lerpKhakiRamp(t) {
  // 0.00 -> Deep Umber-Charcoal Clay Ink (54, 34, 20)
  // 0.38 -> Sculpted Warm Brown Clay (138, 102, 74)
  // 0.72 -> Warm Khaki Sandstone Clay (208, 182, 148)
  // 1.00 -> Light Khaki-Cream Clay Highlight (232, 212, 184)
  if (t <= 0.38) {
    const u = t / 0.38;
    return [54 + (138 - 54) * u, 34 + (102 - 34) * u, 20 + (74 - 20) * u];
  } else if (t <= 0.72) {
    const u = (t - 0.38) / 0.34;
    return [138 + (208 - 138) * u, 102 + (182 - 102) * u, 74 + (148 - 74) * u];
  } else {
    const u = (t - 0.72) / 0.28;
    return [208 + (232 - 208) * u, 182 + (212 - 182) * u, 148 + (184 - 148) * u];
  }
}

function buildAvatar(entry) {
  let srcPath = path.resolve(entry.src);
  let box = entry.box;
  if (!fs.existsSync(srcPath)) {
    srcPath = path.join(OUT_DIR, `${entry.id}.webp`);
    box = [0.17, 0.13, 0.83, 0.71];
  }
  const raw = loadCroppedSquareRgba(srcPath, box, SIZE);
  const seed = entry.seed;
  const gamma = entry.gamma || 0.90;
  const inkScale = entry.inkScale || 0.65;

  const lum = new Float32Array(SIZE * SIZE);
  const hist = new Uint32Array(256);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const idx = i * 4;
    const l = 0.299 * raw[idx] + 0.587 * raw[idx + 1] + 0.114 * raw[idx + 2];
    lum[i] = l;
    hist[clampByte(l)]++;
  }

  let acc = 0;
  let pLow = 15;
  let pHigh = 240;
  const total = SIZE * SIZE;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= total * 0.04 && pLow === 15) pLow = v;
    if (acc >= total * 0.96) {
      pHigh = v;
      break;
    }
  }
  const span = Math.max(40, pHigh - pLow);

  const normLum = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < total; i++) {
    const lin = Math.max(0, Math.min(1, (lum[i] - pLow) / span));
    normLum[i] = Math.pow(lin, gamma);
  }

  const smoothLum = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= SIZE) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= SIZE) continue;
          sum += normLum[ny * SIZE + nx];
          count++;
        }
      }
      smoothLum[y * SIZE + x] = sum / count;
    }
  }

  const out = new Uint8Array(SIZE * SIZE * 4);
  const cx = (SIZE - 1) * 0.5;
  const cy = (SIZE - 1) * 0.5;
  const maxR = SIZE * 0.465;

  // Exact base khaki color of the top-right clay medallion in hybrid-clay-paper-home.png:
  const KHAKI_R = 212;
  const KHAKI_G = 186;
  const KHAKI_B = 152;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const pIdx = y * SIZE + x;
      const i = pIdx * 4;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const rNorm = dist / maxR;

      if (rNorm >= 1.0) {
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
        out[i + 3] = 0;
        continue;
      }

      const relief = sampleClayMicroRelief(x, y, seed);

      const l0 = normLum[pIdx];
      const lWash = 0.72 * l0 + 0.28 * (Math.round(l0 * 8.0) / 8.0);
      const [rampR, rampG, rampB] = lerpKhakiRamp(lWash);

      const origR = Math.min(255, raw[i] * 0.9 + 18);
      const origG = Math.min(255, raw[i + 1] * 0.86 + 12);
      const origB = Math.min(255, raw[i + 2] * 0.76 + 6);

      let portR = rampR * 0.82 + origR * 0.18;
      let portG = rampG * 0.82 + origG * 0.18;
      let portB = rampB * 0.82 + origB * 0.18;

      if (x > 1 && x < SIZE - 2 && y > 1 && y < SIZE - 2) {
        const s0 = smoothLum[pIdx];
        const lL = smoothLum[pIdx - 1];
        const lR = smoothLum[pIdx + 1];
        const lU = smoothLum[pIdx - SIZE];
        const lD = smoothLum[pIdx + SIZE];
        const gx = lR - lL;
        const gy = lD - lU;
        const grad = Math.hypot(gx, gy);
        const lap = Math.max(0, (lL + lR + lU + lD) * 0.25 - s0);

        const inkRaw = (grad * 1.9 + lap * 3.0) * inkScale;
        const inkWobble = 0.85 + 0.3 * valueNoise(x, y, 4.0, seed + 55);
        const inkMask = Math.max(0, Math.min(0.76, (inkRaw * inkWobble - 0.12) / 0.42));

        // Warm deep brown clay contour (#342012)
        portR = portR * (1 - inkMask) + 52 * inkMask;
        portG = portG * (1 - inkMask) + 32 * inkMask;
        portB = portB * (1 - inkMask) + 18 * inkMask;
      }

      // Blend smoothly into the surrounding khaki clay surface near the outer edge (rNorm = 0.68 .. 0.95)
      // so there is ZERO ring or hard edge around the portrait — it sits naturally on the khaki clay!
      const edgeBlend = Math.max(0, Math.min(1, (rNorm - 0.68) / 0.26));
      const smoothEdge = edgeBlend * edgeBlend * (3 - 2 * edgeBlend);

      const bgR = KHAKI_R + relief.deltaL * 0.55;
      const bgG = KHAKI_G + relief.deltaL * 0.45;
      const bgB = KHAKI_B + relief.deltaL * 0.35;

      portR = (portR + relief.deltaL * 0.45 + relief.warmth * 0.3) * (1 - smoothEdge) + bgR * smoothEdge;
      portG = (portG + relief.deltaL * 0.38 + relief.warmth * 0.18) * (1 - smoothEdge) + bgG * smoothEdge;
      portB = (portB + relief.deltaL * 0.30) * (1 - smoothEdge) + bgB * smoothEdge;

      // Soft feathered alpha at the very outer boundary (rNorm = 0.82 .. 1.0) so it drops onto h-avatar-clean.webp seamlessly!
      const alphaFade = 1.0 - Math.max(0, Math.min(1, (rNorm - 0.80) / 0.20));
      const smoothAlpha = alphaFade * alphaFade * (3 - 2 * alphaFade);

      out[i] = clampByte(portR);
      out[i + 1] = clampByte(portG);
      out[i + 2] = clampByte(portB);
      out[i + 3] = clampByte(smoothAlpha * 255);
    }
  }

  const outPath = path.join(OUT_DIR, `${entry.id}.webp`);
  saveWebp(outPath, out, SIZE, SIZE, 93);
  console.log(`✓ Built frameless khaki-blended ${entry.id}.webp`);
}

for (const entry of AVATARS) {
  buildAvatar(entry);
}
