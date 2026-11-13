import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GAME_DIR = path.resolve('public/images/game');
const BACKUP_DIR = path.resolve('public/images/game/.backup_orig');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const MAX_BUF = { maxBuffer: 120 * 1024 * 1024 };

function getDimensions(filePath) {
  const out = execSync(`identify -format "%w %h" "${filePath}"`, MAX_BUF).toString().trim();
  const [w, h] = out.split(/\s+/).map(Number);
  return { w, h };
}

function loadRgba(filePath, targetW = null, targetH = null) {
  const resizeArg = targetW && targetH ? `-filter Lanczos -resize ${targetW}x${targetH}!` : '';
  const buf = execSync(`convert "${filePath}" ${resizeArg} -depth 8 rgba:-`, MAX_BUF);
  const { w, h } = targetW && targetH ? { w: targetW, h: targetH } : getDimensions(filePath);
  return { data: new Uint8Array(buf), w, h };
}

function saveWebp(filePath, data, w, h, quality = 95) {
  execSync(
    `convert -size ${w}x${h} -depth 8 rgba:- -quality ${quality} -define webp:method=6 "${filePath}"`,
    { ...MAX_BUF, input: Buffer.from(data.buffer, data.byteOffset, data.byteLength) }
  );
}

//Backup originals once so the script is idempotent across re-runs
for (const name of [
  'topbar.webp',
  'topbar-online.webp',
  'board-frame.webp',
  'board-panel.webp',
  'deck.webp',
  'clue-panel.webp',
  'clue-panel-online.webp',
  'keyboard-panel.webp',
  'clay-panel.webp',
  'clay-panel-dark.webp',
]) {
  const src = path.join(GAME_DIR, name);
  const bak = path.join(BACKUP_DIR, name);
  if (fs.existsSync(src) && !fs.existsSync(bak)) {
    fs.copyFileSync(src, bak);
  }
}

// ============================================================================
// Procedural Multi-Scale Adobe / Terracotta Noise & Bump Mapping Engine
// ============================================================================
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

/**
 * Computes directional bump lighting + pore/grit detail for kiln-fired clay (بافت خشت و سفال)
 */
function sampleClayMicroRelief(x, y, seed = 101) {
  const h0 = fbmAdobe(x, y, seed);
  const hx = fbmAdobe(x + 1.2, y, seed);
  const hy = fbmAdobe(x, y + 1.2, seed);
  // Directional light from top-left (-0.65, -0.76)
  const dx = hx - h0;
  const dy = hy - h0;
  const bump = -(dx * 0.65 + dy * 0.76) * 62.0;

  // Fine mineral pores (tiny dark clay pits) & silica warm flecks
  const fine = hash2(Math.floor(x), Math.floor(y), seed + 999);
  const med = valueNoise(x, y, 2.2, seed + 555);
  let pore = 0;
  if (fine < 0.065 && med < 0.48) {
    pore = -10.5 * (1 - fine / 0.065); // tiny kiln pit
  } else if (fine > 0.945 && med > 0.52) {
    pore = +7.0 * ((fine - 0.945) / 0.055); // warm ochre mineral speck
  }

  // Subtle horizontal/diagonal hand-troweled adobe striation
  const trowel = (valueNoise(x * 0.6 + y * 0.15, y * 1.4, 5.0, seed + 313) - 0.5) * 5.5;

  return {
    deltaL: bump + pore + trowel + (h0 - 0.5) * 8.0,
    warmth: (h0 - 0.5) * 6.0 + (pore < 0 ? pore * 0.35 : pore * 0.25),
  };
}

function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Signed Distance Field for a Rounded Perspective Trapezoid
 * Returns d < 0 inside, d = 0 on boundary, d > 0 outside.
 */
function trapezoidRoundedSDF(x, y, cfg) {
  const {
    yTop,
    yBot,
    xLeftTop,
    xRightTop,
    xLeftBot,
    xRightBot,
    rTop = 32,
    rBot = 32,
    organicAmp = 0.65,
  } = cfg;

  const h = Math.max(1, yBot - yTop);
  const ty = Math.max(0, Math.min(1, (y - yTop) / h));
  const xL = xLeftTop + (xLeftBot - xLeftTop) * ty;
  const xR = xRightTop + (xRightBot - xRightTop) * ty;
  const r = rTop + (rBot - rTop) * ty;

  const cx = 0.5 * (xL + xR);
  const cy = 0.5 * (yTop + yBot);
  const halfW = Math.max(r + 1, 0.5 * (xR - xL));
  const halfH = Math.max(r + 1, 0.5 * h);

  const qx = Math.abs(x - cx) - (halfW - r);
  const qy = Math.abs(y - cy) - (halfH - r);

  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  let d = outDist + inDist - r;

  if (organicAmp > 0 && Math.abs(d) < 16) {
    // Hand-molded clay edge irregularity
    const wave =
      Math.sin(x * 0.09 + y * 0.07) * 0.45 +
      Math.cos(x * 0.21 - y * 0.16) * 0.30 +
      (valueNoise(x, y, 9.0, 777) - 0.5) * 0.85;
    d += wave * organicAmp;
  }
  return d;
}

/**
 * Computes a sculpted 3D terracotta clay rim color at signed distance `d` (-rimWidth..0)
 * and normal vector `(nx, ny)` so corners have clean, continuous, attractive bevels.
 */
function sculptedTerracottaRimColor(x, y, d, nx, ny, rimWidth = 22, seed = 101) {
  // t goes from 0 at outer edge (d=0) to 1 at inner edge of rim (d=-rimWidth)
  const t = Math.max(0, Math.min(1, -d / rimWidth));
  // 3D round bevel profile across the rim cross-section
  const profileAngle = (1 - t) * (Math.PI * 0.5);
  const rimNx = nx * Math.sin(profileAngle);
  const rimNy = ny * Math.sin(profileAngle);

  // Sunlight from top-left (-0.55, -0.83)
  const lightDot = -(rimNx * 0.52 + rimNy * 0.85);
  // Specular ridge right around t = 0.22..0.48 on sunlit edges
  const ridge = Math.exp(-Math.pow((t - 0.30) / 0.18, 2));
  const rimOuterDarken = smoothstep(0.0, 0.14, t); // dark outer contour line

  // Base kiln-fired terracotta clay color
  let r = 186;
  let g = 112;
  let b = 75;

  // Apply 3D directional bevel lighting
  if (lightDot > 0) {
    const sun = lightDot * (0.55 + 0.45 * ridge);
    r += sun * 46;
    g += sun * 38;
    b += sun * 29;
  } else {
    const shade = -lightDot * (0.75 + 0.25 * (1 - t));
    r -= shade * 58;
    g -= shade * 46;
    b -= shade * 34;
  }

  // Crisp outer edge outline (kiln crust)
  const crust = 0.76 + 0.24 * rimOuterDarken;
  r *= crust;
  g *= crust;
  b *= crust;

  // Add subtle incised inner groove at t ~ 0.82..0.96
  const groove = Math.exp(-Math.pow((t - 0.88) / 0.07, 2));
  r -= groove * (lightDot > 0 ? 14 : -8);
  g -= groove * (lightDot > 0 ? 11 : -6);
  b -= groove * (lightDot > 0 ? 8 : -4);

  // Add adobe micro-relief
  const relief = sampleClayMicroRelief(x, y, seed);
  r += relief.deltaL * 1.05 + relief.warmth;
  g += relief.deltaL * 0.82 + relief.warmth * 0.4;
  b += relief.deltaL * 0.62;

  return [clampByte(r), clampByte(g), clampByte(b)];
}

/**
 * Enhances clay micro-texture across an entire RGBA buffer for terracotta & sandstone pixels
 */
function enhanceClaySurfaceBuffer(data, w, h, seed = 101, strength = 1.0) {
  // Keep a copy for 3x3 unsharp mask on clay luminance
  const src = new Uint8Array(data);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const a = src[i + 3];
      if (a < 16) continue;

      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      const rb = r - b;
      const rg = r - g;

      // Determine how strongly this pixel belongs to terracotta clay vs sandstone/parchment
      // Terracotta has high R-B (70..135) and R-G (50..95)
      const isTerracotta = smoothstep(64, 88, rb) * smoothstep(38, 62, rg) * smoothstep(225, 175, g);
      // Sandstone/parchment frame has moderate warmth (R-B 35..70)
      const isSandstone = (1 - isTerracotta) * smoothstep(28, 48, rb) * smoothstep(130, 175, r);

      if (isTerracotta < 0.02 && isSandstone < 0.02) continue;

      // Local 3x3 high-pass (unsharp mask) to crisp up blurry WebP texture
      const iL = i - 4;
      const iR = i + 4;
      const iU = i - w * 4;
      const iD = i + w * 4;
      const avgR = (src[iL] + src[iR] + src[iU] + src[iD]) * 0.25;
      const avgG = (src[iL + 1] + src[iR + 1] + src[iU + 1] + src[iD + 1]) * 0.25;
      const avgB = (src[iL + 2] + src[iR + 2] + src[iU + 2] + src[iD + 2]) * 0.25;

      const detailR = r - avgR;
      const detailG = g - avgG;
      const detailB = b - avgB;

      const relief = sampleClayMicroRelief(x, y, seed);
      const wClay = isTerracotta * strength;
      const wSand = isSandstone * 0.32 * strength;
      const totalW = wClay + wSand;

      // Boost local micro-contrast + inject procedural kiln-fired adobe relief
      const sharpGain = isTerracotta * 0.65 * strength + isSandstone * 0.22 * strength;
      const nr = r + detailR * sharpGain + (relief.deltaL * 1.10 + relief.warmth) * totalW + wClay * 3.5;
      const ng = g + detailG * sharpGain + (relief.deltaL * 0.82 + relief.warmth * 0.35) * totalW - wClay * 1.0;
      const nb = b + detailB * sharpGain + relief.deltaL * 0.58 * totalW - wClay * 3.5;

      data[i] = clampByte(nr);
      data[i + 1] = clampByte(ng);
      data[i + 2] = clampByte(nb);
    }
  }
}

/**
 * Draws a subtle carved Persian terracotta corner rosette / boss (گل‌میخ خشتی)
 */
function stampCornerRosette(data, w, h, cx, cy, radius) {
  const rOuter = radius;
  for (let dy = -Math.ceil(rOuter); dy <= Math.ceil(rOuter); dy++) {
    for (let dx = -Math.ceil(rOuter); dx <= Math.ceil(rOuter); dx++) {
      const px = Math.round(cx + dx);
      const py = Math.round(cy + dy);
      if (px < 0 || px >= w || py < 0 || py >= h) continue;
      const dist = Math.hypot(dx, dy);
      if (dist > rOuter) continue;

      const i = (py * w + px) * 4;
      if (data[i + 3] < 200) continue;

      const t = dist / rOuter;
      const angle = Math.atan2(dy, dx);
      // 8-petal Persian lotus/star modulation
      const petal = 0.5 + 0.5 * Math.cos(angle * 8);
      const dome = Math.cos(t * Math.PI * 0.5);
      // Ring groove at t ~ 0.72..0.88
      const ringGroove = Math.exp(-Math.pow((t - 0.80) / 0.10, 2));
      // Center button
      const centerBtn = t < 0.35 ? Math.cos((t / 0.35) * Math.PI * 0.5) : 0;

      // Height field h(dx, dy)
      const heightVal = dome * (0.55 + 0.25 * petal) + centerBtn * 0.35 - ringGroove * 0.55;
      // Directional light from top-left
      const light = -(dx / rOuter * 0.55 + dy / rOuter * 0.83);
      const delta = (light * 18.0 + (heightVal - 0.3) * 14.0 - ringGroove * 16.0) * smoothstep(1.0, 0.78, t);

      data[i] = clampByte(data[i] + delta * 1.15);
      data[i + 1] = clampByte(data[i + 1] + delta * 0.85);
      data[i + 2] = clampByte(data[i + 2] + delta * 0.60);
    }
  }
}

// ============================================================================
// 1. TOPBAR & TOPBAR-ONLINE (768 x 136)
// ============================================================================
function processTopBar(filename, seed) {
  const bakPath = path.join(BACKUP_DIR, filename);
  const outPath = path.join(GAME_DIR, filename);
  const { data, w, h } = loadRgba(bakPath);

  const sdfCfg = {
    yTop: 6,
    yBot: 127,
    xLeftTop: 14,
    xRightTop: 754,
    xLeftBot: 7,
    xRightBot: 761,
    rTop: 34,
    rBot: 34,
    organicAmp: 0.55,
  };

  const rimW = 18;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = trapezoidRoundedSDF(x, y, sdfCfg);

      if (d > 0.8) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      // Compute SDF normal
      const dx = trapezoidRoundedSDF(x + 1, y, sdfCfg) - d;
      const dy = trapezoidRoundedSDF(x, y + 1, sdfCfg) - d;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      const alpha = Math.round(smoothstep(0.8, -0.9, d) * 255);
      data[i + 3] = alpha;

      // Protect the blue profile medallion on the right (center ~ 687, 73, radius ~ 60)
      // and the left cream purse pill (center ~ 115, 73)
      const distAvatar = Math.hypot(x - 687, y - 73);
      const avatarProtect = smoothstep(55, 63, distAvatar);

      if (d > -rimW && avatarProtect > 0.01) {
        const [rr, gg, bb] = sculptedTerracottaRimColor(x, y, d, nx, ny, rimW, seed);
        // Smooth radial corner weight (no hard box edges)
        const cornerDist = Math.min(
          Math.hypot(x - 36, y - 34),
          Math.hypot(x - (w - 36), y - 34),
          Math.hypot(x - 32, y - (h - 32)),
          Math.hypot(x - (w - 32), y - (h - 32))
        );
        const cornerW = smoothstep(46, 18, cornerDist);
        const rimEdgeW = smoothstep(-rimW, -3.5, d);
        const botEdgeW = smoothstep(h - 22, h - 10, y) * smoothstep(-rimW, -6, d);

        const blend = Math.min(
          1.0,
          Math.max(rimEdgeW * 0.82, cornerW * smoothstep(-rimW, -6, d) * 0.95, botEdgeW * 0.92) *
            avatarProtect
        );
        data[i] = clampByte(data[i] * (1 - blend) + rr * blend);
        data[i + 1] = clampByte(data[i + 1] * (1 - blend) + gg * blend);
        data[i + 2] = clampByte(data[i + 2] * (1 - blend) + bb * blend);
      }
    }
  }

  enhanceClaySurfaceBuffer(data, w, h, seed, 1.15);
  saveWebp(outPath, data, w, h, 96);
  console.log(`✓ Enhanced ${filename} (${w}x${h})`);
}

// ============================================================================
// 2. BOARD-PANEL (697 x 646) & BOARD-FRAME (upgraded to 882 x 822, exact 3x of 294x274)
// ============================================================================
function buildSculptedBoard(soloData, soloW, outW, outH, wellBoundsPct, seed) {
  const data = new Uint8Array(outW * outH * 4);
  const scale = outW / 697;

  // Outer terracotta trapezoid SDF
  const outerCfg = {
    yTop: Math.round(3 * scale),
    yBot: Math.round(641 * scale),
    xLeftTop: Math.round(10 * scale),
    xRightTop: Math.round((697 - 10) * scale),
    xLeftBot: Math.round(3 * scale),
    xRightBot: Math.round((697 - 3) * scale),
    rTop: Math.round(36 * scale),
    rBot: Math.round(38 * scale),
    organicAmp: 0.65 * scale,
  };

  // Sandstone middle molding SDF (sits inside the outer terracotta rim)
  const sandCfg = {
    yTop: Math.round(28 * scale),
    yBot: Math.round(615 * scale),
    xLeftTop: Math.round(35 * scale),
    xRightTop: Math.round((697 - 35) * scale),
    xLeftBot: Math.round(29 * scale),
    xRightBot: Math.round((697 - 29) * scale),
    rTop: Math.round(24 * scale),
    rBot: Math.round(25 * scale),
    organicAmp: 0.45 * scale,
  };

  // Inner crossword recess well SDF — spans the full grid opening so zero old grid lines peek out!
  const wellCfg = {
    yTop: Math.round(wellBoundsPct.top * outH),
    yBot: Math.round(wellBoundsPct.bot * outH),
    xLeftTop: Math.round(wellBoundsPct.left * outW),
    xRightTop: Math.round(wellBoundsPct.right * outW),
    xLeftBot: Math.round((wellBoundsPct.left - 0.005) * outW),
    xRightBot: Math.round((wellBoundsPct.right + 0.005) * outW),
    rTop: Math.round(20 * scale),
    rBot: Math.round(20 * scale),
    organicAmp: 0.30 * scale,
  };

  const wellBevelW = 9 * scale;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const i = (y * outW + x) * 4;
      const dOuter = trapezoidRoundedSDF(x, y, outerCfg);

      if (dOuter > 0.8) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      const alpha = Math.round(smoothstep(0.8, -0.9, dOuter) * 255);
      data[i + 3] = alpha;

      const dSand = trapezoidRoundedSDF(x, y, sandCfg);
      const dWell = trapezoidRoundedSDF(x, y, wellCfg);

      // Compute continuous Sandstone Molding color (used between outer rim and inner well)
      const sdx = trapezoidRoundedSDF(x + 1, y, sandCfg) - dSand;
      const sdy = trapezoidRoundedSDF(x, y + 1, sandCfg) - dSand;
      const slen = Math.hypot(sdx, sdy) || 1;
      const snx = sdx / slen;
      const sny = sdy / slen;

      const sandRelief = sampleClayMicroRelief(x * 0.9, y * 0.9, seed + 202);
      const sandLight = -(snx * 0.55 + sny * 0.83);
      // Distance across sandstone band (0 at outer sand boundary -> 1 at inner well boundary)
      const sandBandSpan = Math.max(1, Math.abs(dSand) + Math.abs(dWell));
      const sandT = Math.max(0, Math.min(1, -dSand / sandBandSpan));
      // Subtle sculptedpillow arch across the sandstone molding + inner shadow next to terracotta rim
      const outerCrevice = Math.exp(-Math.pow(dSand / (4.5 * scale), 2));
      const pillowArch = Math.sin(sandT * Math.PI) * 9.0;

      let sr = 212 + sandLight * 14 + pillowArch - outerCrevice * 18 + sandRelief.deltaL * 0.72 + sandRelief.warmth * 0.4;
      let sg = 185 + sandLight * 12 + pillowArch * 0.9 - outerCrevice * 15 + sandRelief.deltaL * 0.58;
      let sb = 159 + sandLight * 9 + pillowArch * 0.8 - outerCrevice * 12 + sandRelief.deltaL * 0.44;

      // Compute continuous Inner Parchment Well color
      const wdx = trapezoidRoundedSDF(x + 1, y, wellCfg) - dWell;
      const wdy = trapezoidRoundedSDF(x, y + 1, wellCfg) - dWell;
      const wlen = Math.hypot(wdx, wdy) || 1;
      const wnx = wdx / wlen;
      const wny = wdy / wlen;

      const ux = (x / outW - 0.5) * 2;
      const uy = (y / outH - 0.5) * 2;
      const vig = (ux * ux + uy * uy) * 6.0;
      const wellRelief = sampleClayMicroRelief(x * 0.85, y * 0.85, seed + 303);

      // Recessed inner shadow along top/left of well boundary, warm catchlight along bottom/right
      const wellGroove = Math.exp(-Math.pow(dWell / (3.8 * scale), 2));
      const wellStepShadow = smoothstep(wellBevelW, -wellBevelW, dWell);
      const innerWallLight = wnx * 0.55 + wny * 0.83; // negative on top-left (shadow), positive on bottom-right (lit)

      let pr = 225 - vig + wellRelief.deltaL * 0.36 + (innerWallLight * 16 - 13) * wellGroove;
      let pg = 203 - vig * 0.95 + wellRelief.deltaL * 0.30 + (innerWallLight * 13 - 11) * wellGroove;
      let pb = 179 - vig * 0.88 + wellRelief.deltaL * 0.25 + (innerWallLight * 10 - 9) * wellGroove;

      // Blend Sandstone Molding and Inner Parchment Well seamlessly across dWell = 0
      let r = sr * (1 - wellStepShadow) + pr * wellStepShadow;
      let g = sg * (1 - wellStepShadow) + pg * wellStepShadow;
      let b = sb * (1 - wellStepShadow) + pb * wellStepShadow;

      // Outer Terracotta Rim (where dSand > -3 * scale)
      if (dSand > -4 * scale) {
        const odx = trapezoidRoundedSDF(x + 1, y, outerCfg) - dOuter;
        const ody = trapezoidRoundedSDF(x, y + 1, outerCfg) - dOuter;
        const olen = Math.hypot(odx, ody) || 1;
        const onx = odx / olen;
        const ony = ody / olen;

        const rimSpan = Math.max(12 * scale, Math.abs(dOuter) + Math.abs(dSand));
        const [rr, gg, bb] = sculptedTerracottaRimColor(
          x,
          y,
          Math.max(dOuter, -rimSpan),
          onx,
          ony,
          rimSpan,
          seed
        );

        // Smooth transition from Outer Terracotta Rim into Sandstone Molding at dSand = 0
        const rimWeight = smoothstep(-2.2 * scale, 1.5 * scale, dSand);
        r = r * (1 - rimWeight) + rr * rimWeight;
        g = g * (1 - rimWeight) + gg * rimWeight;
        b = b * (1 - rimWeight) + bb * rimWeight;
      }

      data[i] = clampByte(r);
      data[i + 1] = clampByte(g);
      data[i + 2] = clampByte(b);
    }
  }

  // Stamp 4 subtle carved Persian terracotta corner rosettes on the 4 corners of the outer clay rim
  const rosetteR = 11.5 * scale;
  stampCornerRosette(data, outW, outH, 23 * scale, 21 * scale, rosetteR);
  stampCornerRosette(data, outW, outH, (697 - 23) * scale, 21 * scale, rosetteR);
  stampCornerRosette(data, outW, outH, 18 * scale, (646 - 22) * scale, rosetteR);
  stampCornerRosette(data, outW, outH, (697 - 18) * scale, (646 - 22) * scale, rosetteR);

  enhanceClaySurfaceBuffer(data, outW, outH, seed, 1.25);
  return data;
}

// ============================================================================
// 3. CLUE-PANEL & CLUE-PANEL-ONLINE (805 x 168)
// ============================================================================
function processCluePanel(filename, seed) {
  const bakPath = path.join(BACKUP_DIR, filename);
  const outPath = path.join(GAME_DIR, filename);
  const { data, w, h } = loadRgba(bakPath);

  const sdfCfg = {
    yTop: 10,
    yBot: 158,
    xLeftTop: 12,
    xRightTop: w - 12,
    xLeftBot: 7,
    xRightBot: w - 7,
    rTop: 34,
    rBot: 34,
    organicAmp: 0.55,
  };

  const rimW = 20;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = trapezoidRoundedSDF(x, y, sdfCfg);

      if (d > 0.8) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      const dx = trapezoidRoundedSDF(x + 1, y, sdfCfg) - d;
      const dy = trapezoidRoundedSDF(x, y + 1, sdfCfg) - d;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      data[i + 3] = Math.round(smoothstep(0.8, -0.9, d) * 255);

      if (d > -rimW) {
        const [rr, gg, bb] = sculptedTerracottaRimColor(x, y, d, nx, ny, rimW, seed);
        const isTopOrBotEdge = y < 22 || y > h - 24 || x < 48 || x > w - 48;
        const blend = isTopOrBotEdge
          ? smoothstep(-rimW, -6, d) * 0.95
          : smoothstep(-rimW, -4, d) * 0.82;
        data[i] = clampByte(data[i] * (1 - blend) + rr * blend);
        data[i + 1] = clampByte(data[i + 1] * (1 - blend) + gg * blend);
        data[i + 2] = clampByte(data[i + 2] * (1 - blend) + bb * blend);
      }
    }
  }

  enhanceClaySurfaceBuffer(data, w, h, seed, 1.15);
  saveWebp(outPath, data, w, h, 96);
  console.log(`✓ Enhanced ${filename} (${w}x${h})`);
}

// ============================================================================
// 4. KEYBOARD-PANEL (953 x 402)
// ============================================================================
function processKeyboardPanel(seed) {
  const filename = 'keyboard-panel.webp';
  const bakPath = path.join(BACKUP_DIR, filename);
  const outPath = path.join(GAME_DIR, filename);
  const { data, w, h } = loadRgba(bakPath);

  const sdfCfg = {
    yTop: 12,
    yBot: h - 8,
    xLeftTop: 15,
    xRightTop: w - 15,
    xLeftBot: 4,
    xRightBot: w - 4,
    rTop: 38,
    rBot: 38,
    organicAmp: 0.65,
  };

  const rimW = 22;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = trapezoidRoundedSDF(x, y, sdfCfg);

      if (d > 0.8) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      const dx = trapezoidRoundedSDF(x + 1, y, sdfCfg) - d;
      const dy = trapezoidRoundedSDF(x, y + 1, sdfCfg) - d;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      data[i + 3] = Math.round(smoothstep(0.8, -0.9, d) * 255);

      if (d > -rimW) {
        const [rr, gg, bb] = sculptedTerracottaRimColor(x, y, d, nx, ny, rimW, seed);
        const isCorner = (x < 68 || x > w - 68) && (y < 52 || y > h - 52);
        const blend = isCorner
          ? smoothstep(-rimW, -6, d) * 0.94
          : smoothstep(-rimW, -4, d) * 0.78;
        data[i] = clampByte(data[i] * (1 - blend) + rr * blend);
        data[i + 1] = clampByte(data[i + 1] * (1 - blend) + gg * blend);
        data[i + 2] = clampByte(data[i + 2] * (1 - blend) + bb * blend);
      }
    }
  }

  enhanceClaySurfaceBuffer(data, w, h, seed, 1.15);
  saveWebp(outPath, data, w, h, 95);
  console.log(`✓ Enhanced ${filename} (${w}x${h})`);
}

// ============================================================================
// 5. DECK.WEBP (Upgraded from 504x260 to full 1008x520 poster resolution!)
// ============================================================================
function processDeck(soloData, soloW, seed) {
  const outW = 1008;
  const outH = 520;
  const bakDeck = loadRgba(path.join(BACKUP_DIR, 'deck.webp'), outW, outH).data;
  const data = new Uint8Array(outW * outH * 4);

  // Crop (0, 756) to (1008, 1276) from lossless 1024x1280 screen-solo.png,
  // EXCEPT inside the clue text well (x: 248..768, y: 34..122) where bakDeck already has the painted Persian text cleanly inpainted!
  for (let y = 0; y < outH; y++) {
    const sy = 756 + y;
    for (let x = 0; x < outW; x++) {
      const sx = x;
      const outIdx = (y * outW + x) * 4;
      const soloIdx = (sy * soloW + sx) * 4;

      // Inpainted clue text box: blend smoothly from bakDeck inside (250..766, 36..120)
      const inClueWellX = smoothstep(235, 255, x) * smoothstep(785, 765, x);
      const inClueWellY = smoothstep(28, 40, y) * smoothstep(130, 118, y);
      const wInpaint = inClueWellX * inClueWellY;

      for (let c = 0; c < 3; c++) {
        data[outIdx + c] = Math.round(
          soloData[soloIdx + c] * (1 - wInpaint) + bakDeck[outIdx + c] * wInpaint
        );
      }
      data[outIdx + 3] = 255;
    }
  }

  // Smoothly unite the Clue Bar trapezoid and Keyboard Tray trapezoid with a smooth Minimum (smin) SDF!
  const clueCfg = {
    yTop: 5,
    yBot: 162,
    xLeftTop: 122,
    xRightTop: 898,
    xLeftBot: 114,
    xRightBot: 906,
    rTop: 34,
    rBot: 26,
    organicAmp: 0.55,
  };

  const kbCfg = {
    yTop: 140,
    yBot: 514,
    xLeftTop: 38,
    xRightTop: 982,
    xLeftBot: 16,
    xRightBot: 1004,
    rTop: 38,
    rBot: 36,
    organicAmp: 0.65,
  };

  function smin(a, b, k = 16.0) {
    const h = Math.max(k - Math.abs(a - b), 0.0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
  }

  function deckSDF(x, y) {
    const d1 = trapezoidRoundedSDF(x, y, clueCfg);
    const d2 = trapezoidRoundedSDF(x, y, kbCfg);
    return smin(d1, d2, 18.0);
  }

  const rimW = 20;
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const i = (y * outW + x) * 4;
      const d = deckSDF(x, y);

      if (d > 0.8) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
        continue;
      }

      const dx = deckSDF(x + 1, y) - d;
      const dy = deckSDF(x, y + 1) - d;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;

      data[i + 3] = Math.round(smoothstep(0.8, -0.9, d) * 255);

      if (d > -rimW) {
        const [rr, gg, bb] = sculptedTerracottaRimColor(x, y, d, nx, ny, rimW, seed);
        const rb = data[i] - data[i + 2];
        // Clean up top of clue bar (y < 20), shoulder L-junctions (y in 125..175), and bottom corners (y > 475)
        const isCriticalCorner =
          y < 22 ||
          (y > 122 && y < 178 && (x < 155 || x > 865)) ||
          (y > 468 && (x < 75 || x > 945)) ||
          rb < 82;
        const blend = isCriticalCorner
          ? smoothstep(-rimW, -6, d) * 0.94
          : smoothstep(-rimW, -4, d) * 0.78;

        data[i] = clampByte(data[i] * (1 - blend) + rr * blend);
        data[i + 1] = clampByte(data[i + 1] * (1 - blend) + gg * blend);
        data[i + 2] = clampByte(data[i + 2] * (1 - blend) + bb * blend);
      }
    }
  }

  enhanceClaySurfaceBuffer(data, outW, outH, seed, 1.15);
  saveWebp(path.join(GAME_DIR, 'deck.webp'), data, outW, outH, 95);
  console.log(`✓ Enhanced deck.webp (${outW}x${outH} full poster resolution)`);
}

// ============================================================================
// 6. CLAY-PANEL & CLAY-PANEL-DARK (905 x 688)
// ============================================================================
function processClaySlab(filename, isDark, seed) {
  const bakPath = path.join(BACKUP_DIR, filename);
  const outPath = path.join(GAME_DIR, filename);
  const { data, w, h } = loadRgba(bakPath);

  enhanceClaySurfaceBuffer(data, w, h, seed, isDark ? 0.9 : 1.25);

  // Add subtle kiln-baked corner warmth and bevel depth around the slab perimeter
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const relief = sampleClayMicroRelief(x * 0.9, y * 0.9, seed + 404);
      const gain = isDark ? 0.45 : 0.75;
      data[i] = clampByte(data[i] + (relief.deltaL * 0.9 + relief.warmth * 0.6) * gain);
      data[i + 1] = clampByte(data[i + 1] + relief.deltaL * 0.68 * gain);
      data[i + 2] = clampByte(data[i + 2] + relief.deltaL * 0.48 * gain);
    }
  }

  saveWebp(outPath, data, w, h, 94);
  console.log(`✓ Enhanced ${filename} (${w}x${h})`);
}

// ============================================================================
// Run All Panel Enhancements
// ============================================================================
console.log('Loading lossless master screen-solo.png (1024x1280)...');
const solo = loadRgba(path.join(GAME_DIR, 'screen-solo.png'));

processTopBar('topbar.webp', 101);
processTopBar('topbar-online.webp', 102);

// board-panel.webp (697x646)
const boardPanelData = buildSculptedBoard(
  solo.data,
  solo.w,
  697,
  646,
  { left: 96 / 697, right: 601 / 697, top: 72 / 646, bot: 572 / 646 },
  201
);
saveWebp(path.join(GAME_DIR, 'board-panel.webp'), boardPanelData, 697, 646, 95);
console.log('✓ Enhanced board-panel.webp (697x646)');

// board-frame.webp (882x822 — 3x resolution of 294x274, exact same aspect ratio & GameView.tsx well alignment)
const boardFrameData = buildSculptedBoard(
  solo.data,
  solo.w,
  882,
  822,
  { left: 0.118, right: 0.880, top: 0.090, bot: 0.902 },
  202
);
saveWebp(path.join(GAME_DIR, 'board-frame.webp'), boardFrameData, 882, 822, 95);
console.log('✓ Enhanced board-frame.webp (882x822 — 3x HD resolution)');

processCluePanel('clue-panel.webp', 301);
processCluePanel('clue-panel-online.webp', 302);
processKeyboardPanel(401);
processDeck(solo.data, solo.w, 501);
processClaySlab('clay-panel.webp', false, 601);
processClaySlab('clay-panel-dark.webp', true, 602);

console.log('All crossword clay panels enhanced successfully!');
