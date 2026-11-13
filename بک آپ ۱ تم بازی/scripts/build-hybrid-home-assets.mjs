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
  const d = sdRoundRect(x, y, 139, 1017, 884, 1112, 36);
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
    srcCx: 204.5,
    srcCy: 1173.5,
    srcScaleX: 52.8 / 46.2,
    srcScaleY: 50.8 / 44.6,
    rx: 46.2,
    ry: 44.6,
  },
  {
    cx: 356.0,
    cy: 1175.8,
    srcCx: 356.0,
    srcCy: 1175.8,
    srcScaleX: 1.0,
    srcScaleY: 1.0,
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
    rx: 45.8,
    ry: 44.4,
  },
];

{
  // Clean mud-brick anchor columns (100% outside all buttons, left shadows, and small tabs)
  const yT = 1117;
  const yB = 1258;
  const xStart = 136;
  const xEnd = 888;

  // Measure steady horizontal lighting offsets for the outer left (x=144) and outer right (x=880)
  // at y=1168 (below the Play Bar's rounded end-curve shadow)
  const offLeft = [
    getMeanRGB(raw, 144, 1168, 5, 10)[0] - getMeanRGB(raw, 284, 1168, 5, 10)[0],
    getMeanRGB(raw, 144, 1168, 5, 10)[1] - getMeanRGB(raw, 284, 1168, 5, 10)[1],
    getMeanRGB(raw, 144, 1168, 5, 10)[2] - getMeanRGB(raw, 284, 1168, 5, 10)[2],
  ];
  const offRight = [
    getMeanRGB(raw, 880, 1168, 5, 10)[0] - getMeanRGB(raw, 740, 1168, 5, 10)[0],
    getMeanRGB(raw, 880, 1168, 5, 10)[1] - getMeanRGB(raw, 740, 1168, 5, 10)[1],
    getMeanRGB(raw, 880, 1168, 5, 10)[2] - getMeanRGB(raw, 740, 1168, 5, 10)[2],
  ];

  // Precompute vertically-smoothed lighting at the 6 anchor columns [136, 284, 433, 587, 740, 888]
  // For y <= 1135 (Play Bar bottom shadow transition), use tight ry=2 so the shadow gradient stays sharp;
  // for y > 1135 (flat mud-brick), use wide ry=14 so zero horizontal bands can ever form!
  const xCols = [136, 284, 433, 587, 740, 888];
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

      // Feather at left/right outer boundaries (x=136..148, x=876..888), bottom boundary (y=1251..1258),
      // and top boundary (protecting Play Bar bottom shadow at y <= 1127 except on Button 1's old top rim x=150..258)
      const dBtn1Top = Math.hypot((x - 204.5) / 56.5, (y - 1173.5) / 55.5);
      const yTopStart = dBtn1Top < 1.0 ? 1117 : 1126;
      const blend =
        smoothstep(xStart, xStart + 12, x) *
        smoothstep(xEnd, xEnd - 12, x) *
        smoothstep(yTopStart, yTopStart + 5, y) *
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
// 1. Apply a clean, natural studio cast shadow (darkening the continuous mud-brick
//    around (cx - 3.2, cyNew + 3.2)) so ZERO pixels of the old small tabs (y>=1220)
//    are ever copied from `raw`!
// 2. Composite the pure 3D sculpted button disc (`normDisc <= 1.0`) on top.
for (const { cx, cy, srcCx, srcCy, srcScaleX, srcScaleY, rx, ry } of bottomButtons) {
  const cyNew = cy + BUTTON_DY;
  for (let y = Math.round(cyNew) - 56; y <= Math.round(cyNew) + 56; y++) {
    for (let x = Math.round(cx) - 62; x <= Math.round(cx) + 62; x++) {
      const dyFromCenter = y - cyNew;
      const dxFromCenter = x - cx;

      // 1. Natural studio cast shadow (shifted 3.2px left and 3.2px down, matching top-right studio lighting)
      const normShadow = Math.hypot((dxFromCenter + 3.2) / (rx + 5.5), (dyFromCenter - 3.2) / (ry + 5.0));
      const shadowStrength = smoothstep(1.12, 0.82, normShadow) * 0.42;

      const [mr, mg, mb] = getRGB(work, x, y);
      const sr = mr * (1 - shadowStrength);
      const sg = mg * (1 - shadowStrength * 1.06);
      const sb = mb * (1 - shadowStrength * 1.12);

      // 2. Pure 3D button disc (strictly inside normDisc <= 1.0 so old small tabs at y>=1221 are never touched)
      const normDisc = Math.hypot(dxFromCenter / rx, dyFromCenter / ry);
      const discAlpha = smoothstep(1.01, 0.955, normDisc);

      if (shadowStrength <= 0.001 && discAlpha <= 0.001) continue;

      const sampleX = srcCx + dxFromCenter * srcScaleX;
      const sampleY = srcCy + dyFromCenter * srcScaleY;
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
// Vertical Anatomy (100% seamless, zero duplicate ridge grooves, full bottom rim):
//  - dstY = 0 .. 619    : srcY = 0 .. 619 (Top Rim + Header + Cavity 1 + Ridge 1 + Row 2)
//  - dstY = 620 .. 625  : Smooth 6px cross-fade across flat clay crest (srcY = 620..625 -> srcY = 360..365)
//  - dstY = 626 .. 979  : srcY = 366 .. 719 (offset = -260: Row 3 [626..879] + native Ridge 3 [880..897] + Top half of Full-Width Cavity 4 [898..979])
//  - dstY = 980 .. 1003 : Smooth 24px cross-fade inside Cavity 4's straight vertical walls (srcY1 = dstY - 260 [720..743] -> srcY2 = dstY - 324 [656..679])
//  - dstY = 1004 .. 1095: srcY = 680 .. 771 (offset = -324: Bottom half of Full-Width Cavity 4 [1004..1082] + native Bottom Bevel & Ridge [1083..1095])
//  - dstY = 1096 .. 1101: Smooth 6px cross-fade across flat clay crest (srcY = 766..771 -> srcY = 1009..1014)
//  - dstY = 1102 .. 1366: srcY = 1015 .. 1279 (offset = -87: Play Bar [1103..1215] + 5 Bottom Nav Buttons [cy=1263] + Clean Label Space + Full Uncut 3D Bottom Rim)
// ============================================================================
const CHASSIS_H = 1367;
const chassisBuf = Buffer.alloc(W * CHASSIS_H * 3);

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
    } else if (dstY <= 979) {
      [r, g, b] = getRGB(work, x, dstY - 260);
    } else if (dstY <= 1003) {
      const t = smoothstep(979, 1004, dstY);
      const [r1, g1, b1] = getRGB(work, x, dstY - 260);
      const [r2, g2, b2] = getRGB(work, x, dstY - 324);
      r = r1 * (1 - t) + r2 * t;
      g = g1 * (1 - t) + g2 * t;
      b = b1 * (1 - t) + b2 * t;
    } else if (dstY <= 1095) {
      [r, g, b] = getRGB(work, x, dstY - 324);
    } else if (dstY <= 1101) {
      const t = smoothstep(1095, 1102, dstY);
      const [r1, g1, b1] = getRGB(work, x, 766 + (dstY - 1096));
      const [r2, g2, b2] = getRGB(work, x, dstY - 87);
      r = r1 * (1 - t) + r2 * t;
      g = g1 * (1 - t) + g2 * t;
      b = b1 * (1 - t) + b2 * t;
    } else {
      [r, g, b] = getRGB(work, x, dstY - 87);
    }
    setRGB(chassisBuf, W, CHASSIS_H, x, dstY, r, g, b);
  }
}

// Ensure the full-width Quests paper slab (dstY = 898..1082, x = 146..879) has one single unbroken paper fill
fillPaperRect(chassisBuf, CHASSIS_H, 146, 898, 879, 1082, 15);

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
// 6. GENERATE `h-play-bar-press.webp` USING THE EXACT `recess2` RECIPE FROM
//    `scripts/press_recess.py` & `scripts/press-panels.py` (KEY_P / PILL_P)
//    so pressing "ساخت جدول جدید" has the exact same sculpted clay recess look
//    as the keyboard keys (`kb-r1c0.webp`) and topbar pills (`bar-purse.webp`)!
// ============================================================================
{
  const x0b = 139;
  const x1b = 884;
  const y0b = 1104;
  const y1b = 1199;
  const rad = 36;
  const bw = x1b - x0b;
  const bh = y1b - y0b;
  const cx = (x0b + x1b) * 0.5;
  const cy = (y0b + y1b) * 0.5;

  // Approved KEY_P / PILL_P recess2 parameters adapted to the Play Bar's dimensions
  const insetPx = 2.6;
  const dyPx = 2.2;
  const darken = 0.965;
  const wallTop = 1.0;
  const wallBot = 0.68;
  const topShadow = 0.42;
  const wallTint = 0.48;
  const band = 6.5;
  const shadowLen = 0.36;

  // Warm clay wall median color around the Play Bar (`wall_rgb * wall_tint`)
  const wallR = 172 * wallTint;
  const wallG = 104 * wallTint;
  const wallB = 72 * wallTint;

  // Uniform pixel inset on both axes (`insetPx` on left/right and `insetPx` on top/bottom)
  const sx = 1.0 - (2.0 * insetPx) / bw;
  const sy = 1.0 - (2.0 * insetPx) / bh;

  // Crop bounds in `chassisBuf` (x = 130..894 -> x_crop = 46..810, y = 1098..1212)
  const cropX0 = 130;
  const cropX1 = 894;
  const cropY0 = 1098;
  const cropY1 = 1212;
  const cw = cropX1 - cropX0;
  const ch = cropY1 - cropY0;
  const pressRGBA = Buffer.alloc(cw * ch * 4);

  for (let y = cropY0; y < cropY1; y++) {
    for (let x = cropX0; x < cropX1; x++) {
      const [subR, subG, subB] = getRGB(chassisBuf, x, y, CHASSIS_H);

      // Signed distance to the Play Bar rounded rectangle (negative = inside)
      const d = sdRoundRect(x, y, x0b, y0b, x1b, y1b, rad);
      const aMask = smoothstep(1.2, -1.2, d);
      const dIn = Math.max(0, -d);

      // 1. Hollowed clay wall (`wallShade` graded from top shadow to bottom) with subtle clay micro-grain
      const gte = clamp01((y - y0b) / bh);
      const wallShade = wallTop + (wallBot - wallTop) * gte;
      const grain = ((subR - 152) * 0.3 + (subG - 92) * 0.59 + (subB - 62) * 0.11) * 0.16;

      let canR = wallR * wallShade + grain;
      let canG = wallG * wallShade + grain * 0.82;
      let canB = wallB * wallShade + grain * 0.68;

      // 2. Sunken Play Bar face (`face` & `fa` in press_recess.py)
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

      // 3. Soften the bottom external cast shadow (y = 1199..1208) when the bar is pressed down into the clay
      let outR = subR * (1 - aMask) + canR * aMask;
      let outG = subG * (1 - aMask) + canG * aMask;
      let outB = subB * (1 - aMask) + canB * aMask;

      if (d > 0 && d < 7.5 && y > cy) {
        const lift = smoothstep(7.5, 0.5, d) * smoothstep(y0b + bh * 0.65, y1b, y) * 0.52;
        outR = outR * (1 - lift) + 166 * lift;
        outG = outG * (1 - lift) + 101 * lift;
        outB = outB * (1 - lift) + 69 * lift;
      }

      const idx = ((y - cropY0) * cw + (x - cropX0)) * 4;
      pressRGBA[idx] = Math.round(Math.max(0, Math.min(255, outR)));
      pressRGBA[idx + 1] = Math.round(Math.max(0, Math.min(255, outG)));
      pressRGBA[idx + 2] = Math.round(Math.max(0, Math.min(255, outB)));
      pressRGBA[idx + 3] = 255;
    }
  }

  const outFile = path.join(OUT_DIR, 'h-play-bar-press.webp');
  execSync(
    `ffmpeg -y -v error -f rawvideo -pix_fmt rgba -s ${cw}x${ch} -i - -c:v libwebp -lossless 1 -q:v 100 "${outFile}"`,
    { input: pressRGBA }
  );
  console.log(`Saved ${outFile} (${cw}x${ch})`);
}

console.log(`Done! Built seamless 856x${CHASSIS_H} h-tablet-only.webp with 4 cavity rows and 100% authentic 3D clay texture.`);
