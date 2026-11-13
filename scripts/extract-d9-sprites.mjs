import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = 'public/assets/aistudio/design-9-clay-diorama_1793121826448_5ad4eaf0_e2d5b2b8.png';
const OUT_DIR = 'public/images/d9';
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1024;
const H = 1280;
const raw = execSync(`ffmpeg -v error -i "${SRC}" -f rawvideo -pix_fmt rgb24 -`, {
  maxBuffer: 50 * 1024 * 1024,
});

const work = Buffer.from(raw);

function getRGB(buf, x, y) {
  const cx = Math.max(0, Math.min(W - 1, Math.round(x)));
  const cy = Math.max(0, Math.min(H - 1, Math.round(y)));
  const i = (cy * W + cx) * 3;
  return [buf[i], buf[i + 1], buf[i + 2]];
}

function setRGB(buf, x, y, r, g, b) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = Math.max(0, Math.min(255, Math.round(r)));
  buf[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
  buf[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
}

function inpaintRectHorizontal(buf, x0, y0, x1, y1) {
  const w = x1 - x0;
  for (let y = y0; y <= y1; y++) {
    const left = getRGB(buf, x0 - 3, y);
    const right = getRGB(buf, x1 + 3, y);
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / Math.max(1, w);
      const n = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 2.4 - 1.2;
      setRGB(
        buf,
        x,
        y,
        left[0] * (1 - t) + right[0] * t + n,
        left[1] * (1 - t) + right[1] * t + n,
        left[2] * (1 - t) + right[2] * t + n
      );
    }
  }
}

// 1. Clean Card 1:
inpaintRectHorizontal(work, 765, 258, 885, 281);
// Top-right avatar overlap on Card 1 sky: clone sky gradient from x=710..775
for (let y = 83; y <= 125; y++) {
  for (let x = 780; x <= 926; x++) {
    const srcX = 720 + ((x - 780) % 52);
    const [sr, sg, sb] = getRGB(raw, srcX, Math.min(125, y + 18));
    setRGB(work, x, y, sr, sg, sb);
  }
}
// Bottom-left spiral tower tip on Card 1 cloud: clone fluffy cloud from left (x - 78)
for (let y = 294; y <= 330; y++) {
  for (let x = 198; x <= 278; x++) {
    const [sr, sg, sb] = getRGB(raw, x - 78, y - 6);
    setRGB(work, x, y, sr, sg, sb);
  }
}

// 2. Clean Card 2 "• • •" above sage pill (x=378..468, y=416..441)
inpaintRectHorizontal(work, 378, 416, 468, 441);

// 3. Clean Card 3 "• • •" above blue pill (x=788..888, y=416..441)
inpaintRectHorizontal(work, 788, 416, 888, 441);

// 4. Clean Card 4 "• • •" above garden pill (x=778..882, y=596..622)
inpaintRectHorizontal(work, 778, 596, 882, 622);

// 5. Clean Play Bar "• • •" (x=522..592, y=1060..1086)
inpaintRectHorizontal(work, 522, 1060, 592, 1086);

function sdRoundRect(x, y, x0, y0, x1, y1, r) {
  const cx = (x0 + x1) * 0.5;
  const cy = (y0 + y1) * 0.5;
  const hx = (x1 - x0) * 0.5 - r;
  const hy = (y1 - y0) * 0.5 - r;
  const dx = Math.abs(x - cx) - hx;
  const dy = Math.abs(y - cy) - hy;
  const outDist = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  const inDist = Math.min(Math.max(dx, dy), 0);
  return outDist + inDist - r;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function saveCropRGBA(filename, x0, y0, x1, y1, pixelFn) {
  const cw = x1 - x0;
  const ch = y1 - y0;
  const out = Buffer.alloc(cw * ch * 4);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const oi = ((y - y0) * cw + (x - x0)) * 4;
      out[oi] = Math.max(0, Math.min(255, Math.round(r)));
      out[oi + 1] = Math.max(0, Math.min(255, Math.round(g)));
      out[oi + 2] = Math.max(0, Math.min(255, Math.round(b)));
      out[oi + 3] = Math.max(0, Math.min(255, Math.round(a * 255)));
    }
  }
  const outPath = path.join(OUT_DIR, filename);
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${cw}x${ch} -i - -c:v libwebp -lossless 1 "${outPath}"`,
    { input: out, maxBuffer: 50 * 1024 * 1024 }
  );
  console.log(`Saved ${outPath} (${cw}x${ch})`);
}

// ============================================================================
// CARD 1: Treasure Banner (x=88..936, y=56..344)
// ============================================================================
saveCropRGBA('card-treasure.webp', 88, 56, 936, 344, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const dBody = sdRoundRect(x, y, 88, 83, 936, 330, 24);
  const aBody = clamp01(0.5 - dBody * 0.85);

  // Top Turquoise Dome & Finial (y = 58..85, x = 360..456)
  let aDome = 0;
  if (y >= 58 && y <= 85 && x >= 360 && x <= 456) {
    const dCol = Math.hypot(r - 206, g - 181, b - 151);
    const dArch = Math.hypot((x - 408) / 47, (y - 96) / 38) - 1.0;
    const dSpire = Math.abs(x - 407.5) - (2.0 + Math.max(0, (y - 58) * 0.35));
    const dEnv = y < 65 ? dSpire : Math.min(dArch * 40, dSpire);
    aDome = clamp01((dCol - 12) / 13) * clamp01(1.2 - dEnv * 0.6);
  }

  // Bottom Floating Island Rock protrusion (y = 327..342, x = 532..632)
  let aRock = 0;
  if (y >= 327 && y <= 342 && x >= 532 && x <= 632) {
    const dCol = Math.hypot(r - 207, g - 181, b - 151);
    const dEllipse = Math.hypot((x - 582) / 46, (y - 327) / 9.5) - 1.0;
    if (dEllipse < 0.15) {
      aRock = clamp01((dCol - 20) / 15) * clamp01(1.0 - dEllipse * 4.5);
    }
  }

  return [r, g, b, Math.max(aBody, aDome, aRock)];
});

// ============================================================================
// CARD 2: Endless Tower (x=88..511, y=298..545)
// Spiral Tower green dome spire & upper turret arches stick out at y=300..339!
// ============================================================================
saveCropRGBA('card-tower.webp', 88, 298, 511, 545, (x, y) => {
  const [r, g, b] = y < 334 ? getRGB(raw, x, y) : getRGB(work, x, y);
  const dBody = sdRoundRect(x, y, 88, 339, 511, 545, 22);
  const aBody = clamp01(0.5 - dBody * 0.85);

  let aTower = 0;
  if (y >= 300 && y <= 342 && x >= 203 && x <= 281) {
    let centerX = 246.5;
    let halfW = 2.0;
    if (y < 306) {
      centerX = 246.5;
      halfW = 2.0 + (y - 300) * 0.55;
    } else if (y < 317) {
      centerX = 246.5;
      halfW = 5.5 + (y - 306) * 1.25;
    } else {
      centerX = 242.5;
      halfW = 24.0 + (y - 317) * 0.62;
    }
    const dx = Math.abs(x - centerX) - halfW;
    const [cr, cg, cb] = getRGB(raw, 195, y);
    const dCloud = Math.hypot(r - cr, g - cg, b - cb);
    if (dx < 2.0) {
      const edgeA = clamp01(1.0 - dx * 0.6);
      const colA = dx < -3.0 ? 1.0 : clamp01((dCloud - 16) / 14);
      aTower = edgeA * colA;
    }
  }

  return [r, g, b, Math.max(aBody, aTower)];
});

// ============================================================================
// CARD 3: Online Battle (x=526..936, y=326..545)
// Protruding shield peak & sword tips above y=339 (sampled strictly from sy >= 344)
// ============================================================================
saveCropRGBA('card-battle.webp', 526, 326, 936, 545, (x, y) => {
  const dBody = sdRoundRect(x, y, 526, 339, 936, 545, 22);
  const aBody = clamp01(0.5 - dBody * 0.85);

  let aSwordProtrude = 0;
  let sr = 0, sg = 0, sb = 0;
  if (y >= 328 && y <= 344 && x >= 548 && x <= 768) {
    const sy = Math.max(344, y + 16);
    const [tr, tg, tb] = getRGB(work, x, sy);
    const dBlue = (tr - tb) + 22;
    if (dBlue > 12) {
      sr = tr;
      sg = tg;
      sb = tb;
      aSwordProtrude = clamp01((dBlue - 12) / 14);
    }
  }

  const [r, g, b] = getRGB(work, x, y);
  if (y < 340 && aSwordProtrude > aBody) {
    return [
      sr * aSwordProtrude + r * (1 - aSwordProtrude),
      sg * aSwordProtrude + g * (1 - aSwordProtrude),
      sb * aSwordProtrude + b * (1 - aSwordProtrude),
      Math.max(aBody, aSwordProtrude),
    ];
  }
  return [r, g, b, Math.max(aBody, aSwordProtrude)];
});

// ============================================================================
// CARD 4: Persian Garden Banner / Duel (x=88..936, y=554..702)
// ============================================================================
saveCropRGBA('card-garden.webp', 88, 554, 936, 702, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const dBody = sdRoundRect(x, y, 88, 554, 936, 702, 22);
  return [r, g, b, clamp01(0.5 - dBody * 0.85)];
});

function saveMedallion(filename, cx, cy, radius, pad = 2) {
  const x0 = Math.round(cx - radius - pad);
  const y0 = Math.round(cy - radius - pad);
  const x1 = Math.round(cx + radius + pad);
  const y1 = Math.round(cy + radius + pad);
  saveCropRGBA(filename, x0, y0, x1, y1, (x, y) => {
    const [r, g, b] = getRGB(work, x, y);
    const d = Math.hypot(x - cx, y - cy) - radius;
    return [r, g, b, clamp01(0.5 - d * 0.9)];
  });
}

saveMedallion('avatar.webp', 853, 55, 53, 2);
saveMedallion('gem.webp', 292, 39, 24, 2);

saveMedallion('medallion-1.webp', 264, 765, 54, 2);
saveMedallion('medallion-2.webp', 510, 765, 54, 2);
saveMedallion('medallion-3.webp', 755, 765, 54, 2);
saveMedallion('medallion-4.webp', 263, 924, 54, 2);
saveMedallion('medallion-5.webp', 510, 924, 54, 2);
saveMedallion('medallion-6.webp', 755, 924, 54, 2);

saveMedallion('nav-1.webp', 175, 1187, 40, 2);
saveMedallion('nav-2.webp', 344, 1187, 40, 2);
saveMedallion('nav-3.webp', 510, 1187, 40, 2);
saveMedallion('nav-4.webp', 676, 1187, 40, 2);
saveMedallion('nav-5.webp', 842, 1187, 40, 2);

saveCropRGBA('play-bar.webp', 328, 1036, 672, 1114, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const d = sdRoundRect(x, y, 330, 1038, 670, 1112, 37);
  return [r, g, b, clamp01(0.5 - d * 0.85)];
});

saveCropRGBA('leaf-left.webp', 92, 995, 202, 1127, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const greenness = g - b * 0.55 - r * 0.42;
  const a = clamp01((greenness - 6) / 10);
  return [r, g, b, a];
});

saveCropRGBA('leaf-right.webp', 805, 1005, 915, 1127, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const greenness = g - b * 0.55 - r * 0.42;
  const a = clamp01((greenness - 6) / 10);
  return [r, g, b, a];
});
