import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = 'public/assets/aistudio/hybrid-clay-paper-home_1793126504768_d3eb2651_7955bffa.png';
const OUT_DIR = 'public/images/d9';
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1024;
const H = 1280;
const raw = execSync(`ffmpeg -v error -i "${SRC}" -f rawvideo -pix_fmt rgb24 -`, {
  maxBuffer: 60 * 1024 * 1024,
});

function getRGB(buf, x, y, h = H) {
  const cx = Math.max(0, Math.min(W - 1, Math.round(x)));
  const cy = Math.max(0, Math.min(h - 1, Math.round(y)));
  const i = (cy * W + cx) * 3;
  return [buf[i], buf[i + 1], buf[i + 2]];
}

function setRGB(buf, w, h, x, y, r, g, b) {
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const i = (y * w + x) * 3;
  buf[i] = Math.max(0, Math.min(255, Math.round(r)));
  buf[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
  buf[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

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

function getMeanRGB(buf, cx, cy, rx = 2, ry = rx, h = H) {
  let sr = 0,
    sg = 0,
    sb = 0,
    cnt = 0;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      const [r, g, b] = getRGB(buf, cx + dx, cy + dy, h);
      sr += r;
      sg += g;
      sb += b;
      cnt++;
    }
  }
  return [sr / cnt, sg / cnt, sb / cnt];
}

// Triangle-wave ping-pong coordinate so texture sampling never has step jumps
function pingPong(v, period) {
  const m = ((v % (2 * period)) + 2 * period) % (2 * period);
  return m < period ? m : 2 * period - 1 - m;
}

function saveCropRGBA(filename, x0, y0, x1, y1, pixelFn, quality = 95) {
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
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${cw}x${ch} -i - -c:v libwebp -quality ${quality} "${outPath}"`,
    { input: out, maxBuffer: 60 * 1024 * 1024 }
  );
  console.log(`Saved ${outPath} (${cw}x${ch})`);
}

function saveEllipse(buf, filename, cx, cy, rx, ry, pad = 2) {
  const x0 = Math.round(cx - rx - pad);
  const y0 = Math.round(cy - ry - pad);
  const x1 = Math.round(cx + rx + pad);
  const y1 = Math.round(cy + ry + pad);
  saveCropRGBA(filename, x0, y0, x1, y1, (x, y) => {
    const [r, g, b] = getRGB(buf, x, y);
    const norm = Math.hypot((x - cx) / rx, (y - cy) / ry);
    const dPx = (norm - 1.0) * Math.min(rx, ry);
    return [r, g, b, clamp01(0.5 - dPx * 0.9)];
  });
}

const work = Buffer.from(raw);

// ============================================================================
// 1. CLEAN TOP-RIGHT KHAKI AVATAR MEDALLION BASE (cx=829.5, cy=58, rx=47.5, ry=44)
// ============================================================================
for (let y = 14; y <= 102; y++) {
  for (let x = 782; x <= 876; x++) {
    const d = Math.hypot((x - 829.5) / 47.5, (y - 58.0) / 44.0);
    if (d < 0.92) {
      const gx = 220 + (x - 782);
      const gy = 20 + (y - 14);
      const [mr, mg, mb] = getRGB(raw, gx, gy);
      const [mmR, mmG, mmB] = getMeanRGB(raw, gx, gy, 4, 4);
      const dome = (829.5 - x) * 0.12 + (54 - y) * 0.15;
      const baseR = 197 + dome + (mr - mmR) * 0.7;
      const baseG = 158 + dome * 0.88 + (mg - mmG) * 0.7;
      const baseB = 123 + dome * 0.72 + (mb - mmB) * 0.7;

      const blend = clamp01((0.92 - d) * 10.0);
      const [or, og, ob] = getRGB(work, x, y);
      setRGB(
        work,
        W,
        H,
        x,
        y,
        or * (1 - blend) + baseR * blend,
        og * (1 - blend) + baseG * blend,
        ob * (1 - blend) + baseB * blend
      );
    }
  }
}
saveEllipse(work, 'h-avatar.webp', 829.5, 58, 47, 44, 1);

// ============================================================================
// 2. SEAMLESS HEADER PILLS & PROGRESS BAR REMOVAL (x=510..776, y=12..106)
// Copies the 100% clean photographic header mud-brick from (x - 310, y) with
// left-boundary lighting match and feathers cleanly into the natural cast
// shadow of the top-right khaki avatar medallion!
// ============================================================================
{
  const xL = 510;
  const xR = 776;
  const yT = 12;
  const yB = 106;

  for (let y = yT; y <= yB; y++) {
    const mDstL = getMeanRGB(raw, xL - 2, y, 4, 4);
    const mSrcL = getMeanRGB(raw, xL - 2 - 310, y, 4, 4);

    const dR = mDstL[0] - mSrcL[0];
    const dG = mDstL[1] - mSrcL[1];
    const dB = mDstL[2] - mSrcL[2];

    for (let x = xL; x <= xR; x++) {
      const tx = (x - xL) / (xR - xL);
      const [sr, sg, sb] = getRGB(raw, x - 310, y);

      // Gentle -4 RGB natural studio falloff toward the right side
      const cr = sr + dR - tx * 4.0;
      const cg = sg + dG - tx * 3.5;
      const cb = sb + dB - tx * 3.0;

      const fxL = smoothstep(xL, xL + 16, x);
      const fxR = smoothstep(xR, xR - 10, x);
      const fyT = smoothstep(yT, yT + 6, y);
      const fyB = smoothstep(yB, yB - 6, y);
      const blend = fxL * fxR * fyT * fyB;

      const [or, og, ob] = getRGB(work, x, y);
      setRGB(
        work,
        W,
        H,
        x,
        y,
        or * (1 - blend) + cr * blend,
        og * (1 - blend) + cg * blend,
        ob * (1 - blend) + cb * blend
      );
    }
  }
}

// ============================================================================
// 3. CLEAN DOTS ON PLAY BAR (x=278..388 and x=634..746 at y=1048..1092)
// ============================================================================
for (let y = 1048; y <= 1092; y++) {
  for (let x = 278; x <= 388; x++) {
    const sx = x - 112;
    const [tr, tg, tb] = getRGB(raw, sx, y);
    const [mSrcR, mSrcG, mSrcB] = getMeanRGB(raw, sx, y, 5, 4);
    const [mL, mLG, mLB] = getMeanRGB(raw, 272, y, 4, 4);
    const [mR, mRG, mRB] = getMeanRGB(raw, 394, y, 4, 4);
    const tx = (x - 278) / (388 - 278);
    const cr = tr - mSrcR + (mL * (1 - tx) + mR * tx);
    const cg = tg - mSrcG + (mLG * (1 - tx) + mRG * tx);
    const cb = tb - mSrcB + (mLB * (1 - tx) + mRB * tx);
    const blend =
      smoothstep(278, 285, x) *
      smoothstep(388, 381, x) *
      smoothstep(1048, 1054, y) *
      smoothstep(1092, 1086, y);
    const [or, og, ob] = getRGB(work, x, y);
    setRGB(work, W, H, x, y, or * (1 - blend) + cr * blend, og * (1 - blend) + cg * blend, ob * (1 - blend) + cb * blend);
  }
  for (let x = 634; x <= 746; x++) {
    const sx = x + 114;
    const [tr, tg, tb] = getRGB(raw, sx, y);
    const [mSrcR, mSrcG, mSrcB] = getMeanRGB(raw, sx, y, 5, 4);
    const [mL, mLG, mLB] = getMeanRGB(raw, 628, y, 4, 4);
    const [mR, mRG, mRB] = getMeanRGB(raw, 752, y, 4, 4);
    const tx = (x - 634) / (746 - 634);
    const cr = tr - mSrcR + (mL * (1 - tx) + mR * tx);
    const cg = tg - mSrcG + (mLG * (1 - tx) + mRG * tx);
    const cb = tb - mSrcB + (mLB * (1 - tx) + mRB * tx);
    const blend =
      smoothstep(634, 641, x) *
      smoothstep(746, 739, x) *
      smoothstep(1048, 1054, y) *
      smoothstep(1092, 1086, y);
    const [or, og, ob] = getRGB(work, x, y);
    setRGB(work, W, H, x, y, or * (1 - blend) + cr * blend, og * (1 - blend) + cg * blend, ob * (1 - blend) + cb * blend);
  }
}

saveCropRGBA('h-play-bar.webp', 130, 1011, 894, 1125, (x, y) => {
  const [r, g, b] = getRGB(work, x, y);
  const d = sdRoundRect(x, y, 140, 1017, 883, 1106, 36);
  return [r, g, b, clamp01(0.5 - d * 0.85)];
});

// Extract bottom nav buttons
saveEllipse(work, 'h-nav-1.webp', 203, 1176, 46, 45, 2);
saveEllipse(work, 'h-nav-2.webp', 356, 1176, 45, 44, 2);
saveEllipse(work, 'h-nav-3.webp', 510, 1176, 45, 44, 2);
saveEllipse(work, 'h-nav-4.webp', 664, 1176, 45, 44, 2);
saveEllipse(work, 'h-nav-5.webp', 817, 1176, 45, 44, 2);

// ============================================================================
// 3B. SHIFT THE 5 BOTTOM CIRCULAR BUTTONS DOWN BY 12PX & RESTORE 100% SEAMLESS,
//     CONTINUOUS, UN-MIRRORED MUD-BRICK ACROSS THE ENTIRE BOTTOM STRIP (y=1118..1258)
//
// Why this is 100% artifact-free:
// 1. No tight circle/pill masks (`dOldBtn` / `dOldPill`): we heal the entire strip
//    x=136..888, y=1127..1258 continuously between the clean inter-button anchor
//    columns x=[136, 284, 433, 587, 740, 886], so zero left-shadow crescents or
//    tab rims can ever remain.
// 2. Smooth 2D lighting field (ry=16 vertical smoothing on anchor columns) so zero
//    horizontal streaks are stretched across the buttons.
// 3. Forward-only (never upside-down!) photographic clay grain from the clean
//    header (`work` x=148..768, y=18..99) using two forward passes cross-faded
//    behind the buttons (y=1177..1197), eliminating `pingPong` mirror symmetry lines.
// 4. Pure 3D button disc extraction (`normDisc <= 1.0`, never sampling the old
//    small tab edge at y>=1220!) + natural studio cast shadow darkening the
//    underlying mud-brick clay around (cx - 3.2, cyNew + 3.2).
// ============================================================================
const BUTTON_DY = 12;
const bottomButtons = [
  {
    cx: 204.5,
    cy: 1175.8,
    // Outer 3D clay rim in `raw` spans x=164.3..257.1 (cx=210.7, rx=46.4) and y=1130.5..1215.5 (cy=1173.0, ry=42.5)
    // (x=155..163 in `raw` is the external cast shadow on the wall, NOT the button disc!)
    srcCx: 210.7,
    srcCy: 1173.0,
    srcScaleX: 46.4 / 45.8,
    srcScaleY: 42.5 / 44.4,
    // Inner cream house icon in `raw` spans x=190..227 (cx=208.5) and y=1153..1191 (cy=1172.3)
    iconCx: 208.5,
    iconCy: 1172.3,
    shadowDx: 0.0,
    shadowDy: -3.5,
    rx: 45.8,
    ry: 44.4,
  },
  {
    cx: 356.0,
    cy: 1175.8,
    srcCx: 356.0,
    srcCy: 1175.8,
    srcScaleX: 1.0,
    srcScaleY: 1.0,
    shadowDx: 1.2,
    shadowDy: -3.4,
    rx: 45.8,
    ry: 44.4,
  },
  {
    cx: 510.0,
    cy: 1175.8,
    srcCx: 510.0,
    srcCy: 1175.8,
    srcScaleX: 1.0,
    srcScaleY: 1.0,
    shadowDx: 1.2,
    shadowDy: -3.4,
    rx: 45.8,
    ry: 44.4,
  },
  {
    cx: 664.0,
    cy: 1175.8,
    srcCx: 664.0,
    srcCy: 1175.8,
    srcScaleX: 1.0,
    srcScaleY: 1.0,
    shadowDx: 1.2,
    shadowDy: -3.4,
    rx: 45.8,
    ry: 44.4,
  },
  {
    cx: 817.0,
    cy: 1175.8,
    srcCx: 817.0,
    srcCy: 1175.8,
    srcScaleX: 1.0,
    srcScaleY: 1.0,
    shadowDx: 1.2,
    shadowDy: -3.4,
    rx: 45.8,
    ry: 44.4,
  },
];

{
  // Clean mud-brick anchor columns (100% outside all buttons, left shadows, and small tabs)
  const yT = 1117;
  const yB = 1258;
  const xStart = 128;
  const xEnd = 892;

  // Measure steady horizontal lighting offsets for the outer left (x=134) and outer right (x=884)
  // at y=1168 (below the Play Bar's rounded end-curve shadow and outside Button 1's left shadow)
  const offLeft = [
    getMeanRGB(raw, 134, 1168, 4, 10)[0] - getMeanRGB(raw, 284, 1168, 5, 10)[0],
    getMeanRGB(raw, 134, 1168, 4, 10)[1] - getMeanRGB(raw, 284, 1168, 5, 10)[1],
    getMeanRGB(raw, 134, 1168, 4, 10)[2] - getMeanRGB(raw, 284, 1168, 5, 10)[2],
  ];
  const offRight = [
    getMeanRGB(raw, 884, 1168, 4, 10)[0] - getMeanRGB(raw, 740, 1168, 5, 10)[0],
    getMeanRGB(raw, 884, 1168, 4, 10)[1] - getMeanRGB(raw, 740, 1168, 5, 10)[1],
    getMeanRGB(raw, 884, 1168, 4, 10)[2] - getMeanRGB(raw, 740, 1168, 5, 10)[2],
  ];

  const xCols = [128, 284, 433, 587, 740, 892];
  const colMeans = new Map();
  for (let y = yT; y <= yB; y++) {
    const rySmooth = y <= 1135 ? 2 : Math.min(14, Math.max(2, y - 1133));
    const m284 = getMeanRGB(raw, 284, y, 5, rySmooth);
    const m433 = getMeanRGB(raw, 433, y, 5, rySmooth);
    const m587 = getMeanRGB(raw, 587, y, 5, rySmooth);
    const m740 = getMeanRGB(raw, 740, y, 5, rySmooth);
    const m136 = [m284[0] + offLeft[0], m284[1] + offLeft[1], m284[2] + offLeft[2]];
    const m888 = [m740[0] + offRight[0], m740[1] + offRight[1], m740[2] + offRight[2]];
    colMeans.set(y, [m136, m284, m433, m587, m740, m888]);
  }

  // Snapshot the clean 620px-wide header of `work` (x=145..765, y=18..100) as our pure, un-mirrored clay texture donor
  const headerDonor = Buffer.from(work);

  for (let y = yT; y <= yB; y++) {
    const rowAnchors = colMeans.get(y);

    // Forward-only vertical texture coordinates (no upside-down pingPong mirroring!)
    const gy1 = 18 + Math.min(80, Math.max(0, y - 1117));
    const gy2 = 18 + Math.min(80, Math.max(0, y - 1178));
    const passMix = smoothstep(1178, 1196, y);

    for (let x = xStart; x <= xEnd; x++) {
      // Find surrounding anchor segment
      let seg = 0;
      while (seg < xCols.length - 2 && x > xCols[seg + 1]) seg++;
      const x0 = xCols[seg];
      const x1 = xCols[seg + 1];
      const tx = clamp01((x - x0) / (x1 - x0));
      // Smooth hermite interpolation across x so column transitions are 100% invisible
      const sx = tx * tx * (3 - 2 * tx);

      const mA = rowAnchors[seg];
      const mB = rowAnchors[seg + 1];
      const baseR = mA[0] * (1 - sx) + mB[0] * sx;
      const baseG = mA[1] * (1 - sx) + mB[1] * sx;
      const baseB = mA[2] * (1 - sx) + mB[2] * sx;

      // Sample forward-only high-frequency + medium-frequency clay grain from headerDonor (x=150..755)
      const gx1 = 152 + ((x - xStart) % 590);
      const gx2 = 152 + ((x - xStart + 295) % 590);

      const [tr1, tg1, tb1] = getRGB(headerDonor, gx1, gy1);
      const [mr1, mg1, mb1] = getMeanRGB(headerDonor, gx1, gy1, 14, 10);
      const dR1 = tr1 - mr1;
      const dG1 = tg1 - mg1;
      const dB1 = tb1 - mb1;

      const [tr2, tg2, tb2] = getRGB(headerDonor, gx2, gy2);
      const [mr2, mg2, mb2] = getMeanRGB(headerDonor, gx2, gy2, 14, 10);
      const dR2 = tr2 - mr2;
      const dG2 = tg2 - mg2;
      const dB2 = tb2 - mb2;

      const grainR = dR1 * (1 - passMix) + dR2 * passMix;
      const grainG = dG1 * (1 - passMix) + dG2 * passMix;
      const grainB = dB1 * (1 - passMix) + dB2 * passMix;

      const cr = baseR + grainR;
      const cg = baseG + grainG;
      const cb = baseB + grainB;

      // Feather at left/right outer boundaries, bottom boundary, and smooth top boundary
      const dBtn1Top = Math.hypot((x - 208.0) / 60.0, (y - 1173.5) / 58.0);
      const yTopStart = 1126 - 9.0 * smoothstep(1.3, 0.85, dBtn1Top);
      const blend =
        smoothstep(xStart, xStart + 14, x) *
        smoothstep(xEnd, xEnd - 14, x) *
        smoothstep(yTopStart, yTopStart + 6, y) *
        smoothstep(yB, yB - 6, y);

      if (blend <= 0.001) continue;

      const [or, og, ob] = getRGB(work, x, y);
      setRGB(
        work,
        W,
        H,
        x,
        y,
        or * (1 - blend) + cr * blend,
        og * (1 - blend) + cg * blend,
        ob * (1 - blend) + cb * blend
      );
    }
  }
}

// Composite the 5 circular 3D clay buttons shifted down by BUTTON_DY = 12px:
for (const { cx, cy, srcCx, srcCy, srcScaleX, srcScaleY, iconCx, iconCy, shadowDx = 1.2, shadowDy = -3.4, rx, ry } of bottomButtons) {
  const cyNew = cy + BUTTON_DY;
  for (let y = Math.round(cyNew) - 56; y <= Math.round(cyNew) + 56; y++) {
    for (let x = Math.round(cx) - 62; x <= Math.round(cx) + 62; x++) {
      const dyFromCenter = y - cyNew;
      const dxFromCenter = x - cx;

      // 1. Natural studio cast shadow aligned directly beneath the button disc
      const normShadow = Math.hypot((dxFromCenter + shadowDx) / (rx + 4.5), (dyFromCenter + shadowDy) / (ry + 4.8));
      const shadowStrength = smoothstep(1.12, 0.82, normShadow) * 0.40;

      const [mr, mg, mb] = getRGB(work, x, y);
      const sr = mr * (1 - shadowStrength);
      const sg = mg * (1 - shadowStrength * 1.06);
      const sb = mb * (1 - shadowStrength * 1.12);

      // 2. Pure 3D button disc (strictly inside normDisc <= 1.0 so old small tabs at y>=1221 are never touched)
      const normDisc = Math.hypot(dxFromCenter / rx, dyFromCenter / ry);
      const discAlpha = smoothstep(1.01, 0.955, normDisc);

      if (shadowStrength <= 0.001 && discAlpha <= 0.001) continue;

      // Smoothly blend between centered icon coordinates (inner disc) and full 3D bevel rim (outer disc)
      const rimMix = iconCx !== undefined ? smoothstep(0.52, 0.74, normDisc) : 1.0;
      const rimSampleX = srcCx + dxFromCenter * srcScaleX;
      const rimSampleY = srcCy + dyFromCenter * srcScaleY;
      const icoSampleX = (iconCx ?? srcCx) + dxFromCenter * 0.96;
      const icoSampleY = (iconCy ?? srcCy) + dyFromCenter * 0.96;

      const sampleX = icoSampleX * (1 - rimMix) + rimSampleX * rimMix;
      const sampleY = icoSampleY * (1 - rimMix) + rimSampleY * rimMix;
      const [br, bg, bb] = getRGB(raw, sampleX, sampleY);

      setRGB(
        work,
        W,
        H,
        x,
        y,
        sr * (1 - discAlpha) + br * discAlpha,
        sg * (1 - discAlpha) + bg * discAlpha,
        sb * (1 - discAlpha) + bb * discAlpha
      );
    }
  }
}

// ============================================================================
// 4. CLEAN INNER PAPER OF CARVED CAVITIES
// Uses smooth ping-pong mirrored parchment grain (no step jumps or grid blocks)
// while leaving the 3D sculpted terracotta rim and dark inner shadow untouched!
// ============================================================================
function fillPaperRect(buf, bufH, x0, y0, x1, y1, radius = 15) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const d = sdRoundRect(x, y, x0, y0, x1, y1, radius);
      if (d < 0) {
        const sx = 590 + pingPong(x - x0, 44);
        const sy = 150 + pingPong(y - y0, 32);
        const [pr, pg, pb] = getRGB(raw, sx, sy);
        const [pmR, pmG, pmB] = getMeanRGB(raw, sx, sy, 4, 4);
        const dr = Math.max(-3.2, Math.min(3.2, (pr - pmR) * 0.7));
        const dg = Math.max(-3.2, Math.min(3.2, (pg - pmG) * 0.7));
        const db = Math.max(-3.2, Math.min(3.2, (pb - pmB) * 0.7));
        const cr = 229 + dr;
        const cg = 212 + dg;
        const cb = 189 + db;
        const blend = clamp01(-d / 3.5);
        const [or, og, ob] = getRGB(buf, x, y, bufH);
        setRGB(
          buf,
          W,
          bufH,
          x,
          y,
          or * (1 - blend) + cr * blend,
          og * (1 - blend) + cg * blend,
          ob * (1 - blend) + cb * blend
        );
      }
    }
  }
}

fillPaperRect(work, H, 141, 123, 882, 348, 15); // Cavity 1 (Hero Card)
fillPaperRect(work, H, 147, 381, 495, 611, 15); // Cavity 2A (Duel)
fillPaperRect(work, H, 531, 381, 877, 611, 15); // Cavity 2B (Battle)
fillPaperRect(work, H, 146, 638, 879, 758, 15); // Native Full-Width Row in `work`

// Extract clean bone-cream pill bar
const pillBuf = Buffer.from(raw);
for (let y = 555; y <= 605; y++) {
  for (let x = 174; x <= 232; x++) {
    const sx = x + 64;
    const [cr, cg, cb] = getRGB(raw, sx, y);
    const blend = smoothstep(174, 180, x) * smoothstep(232, 226, x);
    const [or, og, ob] = getRGB(pillBuf, x, y);
    setRGB(pillBuf, W, H, x, y, or * (1 - blend) + cr * blend, og * (1 - blend) + cg * blend, ob * (1 - blend) + cb * blend);
  }
  for (let x = 394; x <= 461; x++) {
    const sx = x - 72;
    const [cr, cg, cb] = getRGB(raw, sx, y);
    const blend = smoothstep(394, 400, x) * smoothstep(461, 455, x);
    const [or, og, ob] = getRGB(pillBuf, x, y);
    setRGB(pillBuf, W, H, x, y, or * (1 - blend) + cr * blend, og * (1 - blend) + cg * blend, ob * (1 - blend) + cb * blend);
  }
}
saveCropRGBA('h-clean-pill.webp', 161, 555, 477, 605, (x, y) => {
  const [r, g, b] = getRGB(pillBuf, x, y);
  const d = sdRoundRect(x, y, 163, 557, 475, 603, 23);
  return [r, g, b, clamp01(0.5 - d * 0.9)];
});

// ============================================================================
// 5. BUILD THE SEAMLESS TALL TABLET CHASSIS (`h-tablet-only.webp`, 856x1367)
//
// Row 4 (dstY = 882..1090) is constructed uniformly across its entire width
// from Row 2's sculpted bevels and vertical divider (srcY = 361..620) so that
// all 3 cavities and both vertical dividers share the exact same top shadow
// groove (dstY = 897) and bottom bevel groove (dstY = 1083) with zero steps or seams!
// ============================================================================
const CHASSIS_H = 1367;
const chassisBuf = Buffer.alloc(W * CHASSIS_H * 3);

// Horizontal mapping for Row 4 that samples Row 2 (work at srcY = 360..621)
// across 3 equal cavities (146..366, 402..622, 658..878) and 2 dividers (cx = 384, 640)
// with smooth 10px cross-fades along the straight cavity walls
function sampleRow4FromRow2(x, srcY) {
  if (x < 138 || x > 886) {
    return getRGB(work, x, srcY);
  }
  // Helper to sample with local horizontal lighting match at the two dividers
  const sampleDiv1 = (xx) => {
    const [r, g, b] = getRGB(work, 513 + (xx - 384), srcY);
    return [r + 1.5, g + 1.0, b + 0.8];
  };
  const sampleDiv2 = (xx) => {
    const [r, g, b] = getRGB(work, 513 + (xx - 640), srcY);
    return [r - 1.5, g - 1.0, b - 0.8];
  };
  const sampleMid = (xx) => getRGB(work, 218 + (xx - 418), srcY);

  if (x <= 345) {
    return getRGB(work, x, srcY);
  } else if (x < 355) {
    const t = smoothstep(345, 355, x);
    const [r1, g1, b1] = getRGB(work, x, srcY);
    const [r2, g2, b2] = sampleDiv1(x);
    return [r1 * (1 - t) + r2 * t, g1 * (1 - t) + g2 * t, b1 * (1 - t) + b2 * t];
  } else if (x <= 413) {
    return sampleDiv1(x);
  } else if (x < 423) {
    const t = smoothstep(413, 423, x);
    const [r1, g1, b1] = sampleDiv1(x);
    const [r2, g2, b2] = sampleMid(x);
    return [r1 * (1 - t) + r2 * t, g1 * (1 - t) + g2 * t, b1 * (1 - t) + b2 * t];
  } else if (x <= 601) {
    return sampleMid(x);
  } else if (x < 611) {
    const t = smoothstep(601, 611, x);
    const [r1, g1, b1] = sampleMid(x);
    const [r2, g2, b2] = sampleDiv2(x);
    return [r1 * (1 - t) + r2 * t, g1 * (1 - t) + g2 * t, b1 * (1 - t) + b2 * t];
  } else if (x <= 669) {
    return sampleDiv2(x);
  } else if (x < 679) {
    const t = smoothstep(669, 679, x);
    const [r1, g1, b1] = sampleDiv2(x);
    const [r2, g2, b2] = getRGB(work, x, srcY);
    return [r1 * (1 - t) + r2 * t, g1 * (1 - t) + g2 * t, b1 * (1 - t) + b2 * t];
  } else {
    return getRGB(work, x, srcY);
  }
}

function getRow4Pixel(x, dstY) {
  let srcY;
  if (dstY <= 916) {
    srcY = dstY - 521; // 357..395 (top ridge + top shadow at dstY=897 + top inner corner curves)
  } else if (dstY >= 1064) {
    srcY = dstY - 469; // 595..626 (bottom inner corner curves + bottom groove at dstY=1083 + bottom highlight + 1:1 flat clay crest)
  } else {
    const tMid = (dstY - 916) / (1064 - 916);
    srcY = Math.round(395 + tMid * (595 - 395));
  }
  return sampleRow4FromRow2(x, srcY);
}

for (let dstY = 0; dstY < CHASSIS_H; dstY++) {
  for (let x = 0; x < W; x++) {
    let r, g, b;
    if (dstY <= 619) {
      [r, g, b] = getRGB(work, x, dstY);
    } else if (dstY <= 625) {
      const t = smoothstep(619, 626, dstY);
      const [r1, g1, b1] = getRGB(work, x, dstY);
      const [r2, g2, b2] = getRGB(work, x, dstY - 260);
      r = r1 * (1 - t) + r2 * t;
      g = g1 * (1 - t) + g2 * t;
      b = b1 * (1 - t) + b2 * t;
    } else if (dstY <= 877) {
      // Row 3 (dstY = 626..877 -> srcY = 366..617, includes Row 3 bottom bevel & highlight)
      [r, g, b] = getRGB(work, x, dstY - 260);
    } else if (dstY <= 885) {
      // Smooth 8px 1:1 cross-fade across the flat clay crest between Row 3 and Row 4
      const t = smoothstep(877, 886, dstY);
      const [r1, g1, b1] = getRGB(work, x, dstY - 260);
      const [r2, g2, b2] = getRow4Pixel(x, dstY);
      r = r1 * (1 - t) + r2 * t;
      g = g1 * (1 - t) + g2 * t;
      b = b1 * (1 - t) + b2 * t;
    } else if (dstY <= 1089) {
      // Row 4 with 3 unified cavities and 2 vertical dividers (dstY = 886..1089, 1:1 unstretched bottom bevel & crest)
      [r, g, b] = getRow4Pixel(x, dstY);
    } else if (dstY <= 1095) {
      // Smooth 6px 1:1 unstretched cross-fade on the flat clay crest into the Play Bar top ridge (dstY - 87 = 1003..1008)
      const t = smoothstep(1089, 1096, dstY);
      const [r1, g1, b1] = getRow4Pixel(x, dstY);
      const [r2, g2, b2] = getRGB(work, x, Math.max(1006, dstY - 87));
      r = r1 * (1 - t) + r2 * t;
      g = g1 * (1 - t) + g2 * t;
      b = b1 * (1 - t) + b2 * t;
    } else {
      [r, g, b] = getRGB(work, x, dstY - 87);
    }
    setRGB(chassisBuf, W, CHASSIS_H, x, dstY, r, g, b);
  }
}

// Fill the 3 separate 1/3-width sunken cavities in Row 4 with clean parchment paper
fillPaperRect(chassisBuf, CHASSIS_H, 147, 898, 366, 1081, 15); // Cavity 4A (Left 1/3: Fortune Wheel)
fillPaperRect(chassisBuf, CHASSIS_H, 402, 898, 622, 1081, 15); // Cavity 4B (Center 1/3: Season Pass)
fillPaperRect(chassisBuf, CHASSIS_H, 658, 898, 877, 1081, 15); // Cavity 4C (Right 1/3: Daily Quests)

saveCropRGBA(
  'h-tablet-only.webp',
  84,
  0,
  940,
  CHASSIS_H,
  (x, y) => {
    const i = (y * W + x) * 3;
    const r = chassisBuf[i];
    const g = chassisBuf[i + 1];
    const b = chassisBuf[i + 2];

    const yFade = smoothstep(45, 95, y) * smoothstep(CHASSIS_H - 45, CHASSIS_H - 95, y);
    const xOutLeft = smoothstep(103, 98, x);
    const xOutRight = smoothstep(921, 926, x);
    const bgWeight = yFade * Math.max(xOutLeft, xOutRight);

    if (bgWeight <= 0.001) {
      return [r, g, b, 1.0];
    }

    const bgY = (y / (CHASSIS_H - 1)) * (H - 1);
    const [br, bg, bb] = getRGB(raw, x, bgY);
    return [
      r * (1 - bgWeight) + br * bgWeight,
      g * (1 - bgWeight) + bg * bgWeight,
      b * (1 - bgWeight) + bb * bgWeight,
      1.0,
    ];
  },
  95
);

// ============================================================================
// 6. GENERATE `h-play-bar-press.webp` AND `h-nav-1..5-press.webp` USING THE
//    EXACT `recess2` RECIPE so pressing the Play Bar or any of the 5 Bottom
//    Navigation Buttons recesses it naturally into the clay tablet!
// ============================================================================
{
  const x0b = 141;
  const x1b = 882;
  const y0b = 1105;
  const y1b = 1193;
  const rad = 37;
  const bw = x1b - x0b;
  const bh = y1b - y0b;
  const cx = (x0b + x1b) * 0.5;
  const cy = (y0b + y1b) * 0.5;

  const insetPx = 2.6;
  const dyPx = 2.2;
  const darken = 0.965;
  const wallTop = 1.0;
  const wallBot = 0.68;
  const topShadow = 0.42;
  const wallTint = 0.48;
  const shadowLen = 0.36;

  const wallR = 172 * wallTint;
  const wallG = 104 * wallTint;
  const wallB = 72 * wallTint;

  const sx = 1.0 - (2.0 * insetPx) / bw;
  const sy = 1.0 - (2.0 * insetPx) / bh;

  const cropX0 = 130;
  const cropX1 = 894;
  const cropY0 = 1098;
  const cropY1 = 1212;
  const cw = cropX1 - cropX0;
  const ch = cropY1 - cropY0;
  const pressRGBA = Buffer.alloc(cw * ch * 4);

  // Tightly-cropped 744x90 buffers for the Builder Modal ("شروع بازی") with ZERO outer background strip!
  const bX0 = 140;
  const bX1 = 884;
  const bY0 = 1104;
  const bY1 = 1194;
  const bW = bX1 - bX0;
  const bH = bY1 - bY0;
  const builderPlayRGBA = Buffer.alloc(bW * bH * 4);
  const builderPressRGBA = Buffer.alloc(bW * bH * 4);

  for (let y = cropY0; y < cropY1; y++) {
    for (let x = cropX0; x < cropX1; x++) {
      const [subR, subG, subB] = getRGB(chassisBuf, x, y, CHASSIS_H);
      const d = sdRoundRect(x, y, x0b, y0b, x1b, y1b, rad);
      const aMask = smoothstep(1.2, -1.2, d);

      const gte = clamp01((y - y0b) / bh);
      const wallShade = wallTop + (wallBot - wallTop) * gte;
      const grain = ((subR - 152) * 0.3 + (subG - 92) * 0.59 + (subB - 62) * 0.11) * 0.16;

      let canR = wallR * wallShade + grain;
      let canG = wallG * wallShade + grain * 0.82;
      let canB = wallB * wallShade + grain * 0.68;

      const u = (x - cx) / sx + cx;
      const v = (y - cy - dyPx) / sy + cy;
      const dShift = sdRoundRect(u, v, x0b, y0b, x1b, y1b, rad);
      const fa = smoothstep(1.2, -1.2, dShift);

      if (fa > 0.001) {
        const [fR0, fG0, fB0] = getRGB(chassisBuf, u, v, CHASSIS_H);
        const tv = clamp01((v - y0b) / bh);
        const ts = clamp01(tv / shadowLen);
        const shade = darken * (1.0 - topShadow * (1.0 - ts) * (1.0 - ts));

        const fR = fR0 * shade;
        const fG = fG0 * shade;
        const fB = fB0 * shade;

        canR = canR * (1 - fa) + fR * fa;
        canG = canG * (1 - fa) + fG * fa;
        canB = canB * (1 - fa) + fB * fa;
      }

      let outR = subR * (1 - aMask) + canR * aMask;
      let outG = subG * (1 - aMask) + canG * aMask;
      let outB = subB * (1 - aMask) + canB * aMask;

      if (d > 0 && d < 8.5 && y > cy) {
        const lift = smoothstep(8.5, 0.5, d) * smoothstep(y0b + bh * 0.65, y1b, y) * 0.55;
        outR = outR * (1 - lift) + 166 * lift;
        outG = outG * (1 - lift) + 101 * lift;
        outB = outB * (1 - lift) + 69 * lift;
      }

      const edgeFade = smoothstep(9.5, 3.5, d);
      const idx = ((y - cropY0) * cw + (x - cropX0)) * 4;
      pressRGBA[idx] = Math.round(Math.max(0, Math.min(255, outR)));
      pressRGBA[idx + 1] = Math.round(Math.max(0, Math.min(255, outG)));
      pressRGBA[idx + 2] = Math.round(Math.max(0, Math.min(255, outB)));
      pressRGBA[idx + 3] = Math.round(Math.max(0, Math.min(255, edgeFade * 255)));

      if (x >= bX0 && x < bX1 && y >= bY0 && y < bY1) {
        const bIdx = ((y - bY0) * bW + (x - bX0)) * 4;
        const pillAlpha = clamp01(0.5 - d * 0.9);
        builderPlayRGBA[bIdx] = Math.round(Math.max(0, Math.min(255, subR)));
        builderPlayRGBA[bIdx + 1] = Math.round(Math.max(0, Math.min(255, subG)));
        builderPlayRGBA[bIdx + 2] = Math.round(Math.max(0, Math.min(255, subB)));
        builderPlayRGBA[bIdx + 3] = Math.round(Math.max(0, Math.min(255, pillAlpha * 255)));

        builderPressRGBA[bIdx] = Math.round(Math.max(0, Math.min(255, canR)));
        builderPressRGBA[bIdx + 1] = Math.round(Math.max(0, Math.min(255, canG)));
        builderPressRGBA[bIdx + 2] = Math.round(Math.max(0, Math.min(255, canB)));
        builderPressRGBA[bIdx + 3] = Math.round(Math.max(0, Math.min(255, pillAlpha * 255)));
      }
    }
  }

  const outFile = path.join(OUT_DIR, 'h-play-bar-press.webp');
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${cw}x${ch} -i - -c:v libwebp -lossless 1 -q:v 100 "${outFile}"`,
    { input: pressRGBA }
  );
  console.log(`Saved ${outFile} (${cw}x${ch})`);

  const outBuilderPlay = path.join(OUT_DIR, 'h-builder-play.webp');
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${bW}x${bH} -i - -c:v libwebp -lossless 1 -q:v 100 "${outBuilderPlay}"`,
    { input: builderPlayRGBA }
  );
  console.log(`Saved ${outBuilderPlay} (${bW}x${bH})`);

  const outBuilderPress = path.join(OUT_DIR, 'h-builder-play-press.webp');
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${bW}x${bH} -i - -c:v libwebp -lossless 1 -q:v 100 "${outBuilderPress}"`,
    { input: builderPressRGBA }
  );
  console.log(`Saved ${outBuilderPress} (${bW}x${bH})`);

  // Generate `h-builder-slab.webp` (760x880) from the authentic photographic mud-brick of `work`
  // (strictly inside the unblemished left-center header clay x=155..495, y=24..92)
  // so the Builder Modal ("انتخاب ابعاد و موضوع جدول") has the exact same clay texture & color
  // as the Main Menu chassis, `h-sage-tray.webp`, and `h-builder-play.webp`!
  const slabW = 760;
  const slabH = 880;
  const slabRGB = Buffer.alloc(slabW * slabH * 3);
  for (let sy = 0; sy < slabH; sy++) {
    const ty = sy / (slabH - 1);
    for (let sx2 = 0; sx2 < slabW; sx2++) {
      const tx = sx2 / (slabW - 1);
      const gx = 155 + pingPong(sx2, 340);
      const gy = 24 + pingPong(sy, 68);
      const [gr, gg, gb] = getRGB(work, gx, gy);
      const [gmR, gmG, gmB] = getMeanRGB(work, gx, gy, 5, 5);
      const dR = (gr - gmR) * 0.92;
      const dG = (gg - gmG) * 0.92;
      const dB = (gb - gmB) * 0.92;

      const light = (1 - tx) * 0.45 + (1 - ty) * 0.55 - 0.5;
      const baseR = 173 + light * 16 + dR;
      const baseG = 107 + light * 13 + dG;
      const baseB = 74 + light * 10 + dB;

      const si = (sy * slabW + sx2) * 3;
      slabRGB[si] = Math.round(Math.max(0, Math.min(255, baseR)));
      slabRGB[si + 1] = Math.round(Math.max(0, Math.min(255, baseG)));
      slabRGB[si + 2] = Math.round(Math.max(0, Math.min(255, baseB)));
    }
  }
  const outSlab = path.join(OUT_DIR, 'h-builder-slab.webp');
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgb24 -s ${slabW}x${slabH} -i - -c:v libwebp -quality 95 "${outSlab}"`,
    { input: slabRGB }
  );
  console.log(`Saved ${outSlab} (${slabW}x${slabH})`);
}

// Generate `h-nav-1-press.webp` .. `h-nav-5-press.webp` for the 5 circular bottom buttons
bottomButtons.forEach((btn, idx) => {
  const cx = btn.cx;
  const cy = btn.cy + BUTTON_DY + 87; // 1274.8 in chassisBuf
  const rx = btn.rx;
  const ry = btn.ry;
  const bw = rx * 2;
  const bh = ry * 2;
  const y0b = cy - ry;

  const insetPx = 2.5;
  const dyPx = 2.2;
  const darken = 0.955;
  const wallTop = 1.0;
  const wallBot = 0.66;
  const topShadow = 0.42;
  const wallTint = 0.46;
  const shadowLen = 0.38;

  const wallR = 168 * wallTint;
  const wallG = 101 * wallTint;
  const wallB = 68 * wallTint;

  const sx = 1.0 - (2.0 * insetPx) / bw;
  const sy = 1.0 - (2.0 * insetPx) / bh;

  const padX = 12;
  const padY = 12;
  const cropX0 = Math.round(cx - rx - padX);
  const cropX1 = Math.round(cx + rx + padX);
  const cropY0 = Math.round(cy - ry - padY);
  const cropY1 = Math.round(cy + ry + padY);
  const cw = cropX1 - cropX0;
  const ch = cropY1 - cropY0;
  const pressRGBA = Buffer.alloc(cw * ch * 4);

  const sdEllipse = (px, py) =>
    (Math.hypot((px - cx) / rx, (py - cy) / ry) - 1.0) * Math.min(rx, ry);

  for (let y = cropY0; y < cropY1; y++) {
    for (let x = cropX0; x < cropX1; x++) {
      const [subR, subG, subB] = getRGB(chassisBuf, x, y, CHASSIS_H);
      const d = sdEllipse(x, y);
      const aMask = smoothstep(1.2, -1.2, d);

      const gte = clamp01((y - y0b) / bh);
      const wallShade = wallTop + (wallBot - wallTop) * gte;
      const grain = ((subR - 152) * 0.3 + (subG - 92) * 0.59 + (subB - 62) * 0.11) * 0.16;

      let canR = wallR * wallShade + grain;
      let canG = wallG * wallShade + grain * 0.82;
      let canB = wallB * wallShade + grain * 0.68;

      const u = (x - cx) / sx + cx;
      const v = (y - cy - dyPx) / sy + cy;
      const dShift = sdEllipse(u, v);
      const fa = smoothstep(1.2, -1.2, dShift);

      if (fa > 0.001) {
        const [fR0, fG0, fB0] = getRGB(chassisBuf, u, v, CHASSIS_H);
        const tv = clamp01((v - y0b) / bh);
        const ts = clamp01(tv / shadowLen);
        const shade = darken * (1.0 - topShadow * (1.0 - ts) * (1.0 - ts));

        const fR = fR0 * shade;
        const fG = fG0 * shade;
        const fB = fB0 * shade;

        canR = canR * (1 - fa) + fR * fa;
        canG = canG * (1 - fa) + fG * fa;
        canB = canB * (1 - fa) + fB * fa;
      }

      let outR = subR * (1 - aMask) + canR * aMask;
      let outG = subG * (1 - aMask) + canG * aMask;
      let outB = subB * (1 - aMask) + canB * aMask;

      // Soften the bottom-left external cast shadow when the disc is pressed into the clay
      if (d > 0 && d < 7.0 && (y > cy - 10 || x < cx + 10)) {
        const lift = smoothstep(7.0, 0.5, d) * 0.45;
        outR = outR * (1 - lift) + 162 * lift;
        outG = outG * (1 - lift) + 98 * lift;
        outB = outB * (1 - lift) + 66 * lift;
      }

      // Smooth outer alpha fade on the 12px pad so the circular press patch blends invisibly
      const edgeFade = smoothstep(9.5, 4.5, d);

      const oi = ((y - cropY0) * cw + (x - cropX0)) * 4;
      pressRGBA[oi] = Math.round(Math.max(0, Math.min(255, outR)));
      pressRGBA[oi + 1] = Math.round(Math.max(0, Math.min(255, outG)));
      pressRGBA[oi + 2] = Math.round(Math.max(0, Math.min(255, outB)));
      pressRGBA[oi + 3] = Math.round(Math.max(0, Math.min(255, edgeFade * 255)));
    }
  }

  const outFile = path.join(OUT_DIR, `h-nav-${idx + 1}-press.webp`);
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${cw}x${ch} -i - -c:v libwebp -lossless 1 -q:v 100 "${outFile}"`,
    { input: pressRGBA }
  );
  console.log(`Saved ${outFile} (${cw}x${ch})`);
});

console.log(`Done! Built seamless 856x${CHASSIS_H} h-tablet-only.webp with 4 cavity rows and 100% authentic 3D clay texture.`);
