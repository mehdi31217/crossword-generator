const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'public', 'images', 'iran-map.svg');
const svgContent = fs.readFileSync(SVG_PATH, 'utf-8');

// Extract all path d attributes
const pathRegex = /<path\s+d="([^"]+)"/g;
const dStrings = [];
let match;
while ((match = pathRegex.exec(svgContent)) !== null) {
  dStrings.push(match[1]);
}
console.log(`Found ${dStrings.length} paths`);

// Parse all paths into segments
function parsePathToSegments(dStr) {
  const subpaths = dStr.split(/z\s*m\s*/i);
  const segments = [];
  for (const subpath of subpaths) {
    const cleanStr = (subpath.startsWith('m') || subpath.startsWith('M') ? subpath : 'm ' + subpath).trim();
    const tokens = cleanStr.match(/[mlzMLZ][\d.\s,\-]*/gi);
    if (!tokens) continue;
    const points = [];
    let cx = 0, cy = 0;
    for (const token of tokens) {
      const cmd = token[0].toLowerCase();
      const rest = token.slice(1).trim();
      if (cmd === 'z') continue;
      const coords = rest.match(/-?[\d.]+/g);
      if (!coords || coords.length < 2) continue;
      const isRel = token[0] === cmd;
      if (cmd === 'm') {
        if (isRel) { cx += parseFloat(coords[0]); cy += parseFloat(coords[1]); }
        else { cx = parseFloat(coords[0]); cy = parseFloat(coords[1]); }
        points.push([cx, cy]);
        for (let i = 2; i < coords.length; i += 2) {
          if (isRel) { cx += parseFloat(coords[i]); cy += parseFloat(coords[i+1]); }
          else { cx = parseFloat(coords[i]); cy = parseFloat(coords[i+1]); }
          points.push([cx, cy]);
        }
      } else if (cmd === 'l') {
        for (let i = 0; i < coords.length; i += 2) {
          if (isRel) { cx += parseFloat(coords[i]); cy += parseFloat(coords[i+1]); }
          else { cx = parseFloat(coords[i]); cy = parseFloat(coords[i+1]); }
          points.push([cx, cy]);
        }
      }
    }
    for (let i = 0; i < points.length - 1; i++) {
      segments.push({ x1: points[i][0], y1: points[i][1], x2: points[i+1][0], y2: points[i+1][1] });
    }
    if (points.length > 2) {
      segments.push({ x1: points[points.length-1][0], y1: points[points.length-1][1], x2: points[0][0], y2: points[0][1] });
    }
  }
  return segments;
}

const allSegments = [];
for (const d of dStrings) allSegments.push(...parsePathToSegments(d));
console.log(`Total raw segments: ${allSegments.length}`);

// Find boundary segments (edges that appear exactly once)
function round2(n) { return Math.round(n * 100) / 100; }
const segMap = new Map();
for (const seg of allSegments) {
  const x1 = round2(seg.x1), y1 = round2(seg.y1), x2 = round2(seg.x2), y2 = round2(seg.y2);
  let key;
  if (x1 < x2 || (x1 === x2 && y1 < y2)) key = `${x1},${y1}-${x2},${y2}`;
  else key = `${x2},${y2}-${x1},${y1}`;
  if (!segMap.has(key)) segMap.set(key, { count: 0, x1, y1, x2, y2 });
  segMap.get(key).count++;
}

const boundarySegs = [];
for (const data of segMap.values()) {
  if (data.count === 1) boundarySegs.push(data);
}
console.log(`Boundary segments: ${boundarySegs.length}`);

// Find ALL connected chains
const used = new Array(boundarySegs.length).fill(false);
const chains = [];

for (let startIdx = 0; startIdx < boundarySegs.length; startIdx++) {
  if (used[startIdx]) continue;
  const chain = [{ x: boundarySegs[startIdx].x1, y: boundarySegs[startIdx].y1 },
                 { x: boundarySegs[startIdx].x2, y: boundarySegs[startIdx].y2 }];
  used[startIdx] = true;
  let changed = true;
  while (changed) {
    changed = false;
    const last = chain[chain.length - 1];
    for (let i = 0; i < boundarySegs.length; i++) {
      if (used[i]) continue;
      const s = boundarySegs[i];
      if (Math.abs(s.x1 - last.x) + Math.abs(s.y1 - last.y) < 0.01) {
        chain.push({ x: s.x2, y: s.y2 }); used[i] = true; changed = true; break;
      }
      if (Math.abs(s.x2 - last.x) + Math.abs(s.y2 - last.y) < 0.01) {
        chain.push({ x: s.x1, y: s.y1 }); used[i] = true; changed = true; break;
      }
    }
    if (changed) continue;
    const first = chain[0];
    for (let i = 0; i < boundarySegs.length; i++) {
      if (used[i]) continue;
      const s = boundarySegs[i];
      if (Math.abs(s.x2 - first.x) + Math.abs(s.y2 - first.y) < 0.01) {
        chain.unshift({ x: s.x1, y: s.y1 }); used[i] = true; changed = true; break;
      }
      if (Math.abs(s.x1 - first.x) + Math.abs(s.y1 - first.y) < 0.01) {
        chain.unshift({ x: s.x2, y: s.y2 }); used[i] = true; changed = true; break;
      }
    }
  }
  chains.push(chain);
}

chains.sort((a, b) => b.length - a.length);
console.log(`Found ${chains.length} chains, longest: ${chains[0].length} points`);

const mainChain = chains[0];

// Simplify with Douglas-Peucker
function simplifyDP(points, epsilon) {
  if (points.length <= 2) return points;
  let maxDist = 0, maxIdx = 0;
  const first = points[0], last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const dx = last.x - first.x, dy = last.y - first.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    let dist;
    if (len === 0) {
      dist = Math.sqrt((points[i].x - first.x) ** 2 + (points[i].y - first.y) ** 2);
    } else {
      const t = ((points[i].x - first.x) * dx + (points[i].y - first.y) * dy) / (len * len);
      const px = first.x + t * dx, py = first.y + t * dy;
      dist = Math.sqrt((points[i].x - px) ** 2 + (points[i].y - py) ** 2);
    }
    if (dist > maxDist) { maxDist = dist; maxIdx = i; }
  }
  if (maxDist < epsilon) return [first, last];
  const left = simplifyDP(points.slice(0, maxIdx + 1), epsilon);
  const right = simplifyDP(points.slice(maxIdx), epsilon);
  return left.slice(0, -1).concat(right);
}

const simplified = simplifyDP(mainChain, 0.25);
console.log(`Simplified: ${simplified.length} points`);

// Scale and build path
const scaleX = 655 / 733.5;
const scaleY = 594 / 676.5;

let d = `M ${(simplified[0].x * scaleX).toFixed(4)},${(simplified[0].y * scaleY).toFixed(4)}`;
for (let i = 1; i < simplified.length; i++) {
  d += ` L ${(simplified[i].x * scaleX).toFixed(4)},${(simplified[i].y * scaleY).toFixed(4)}`;
}
d += ' Z';

console.log(`Path length: ${d.length} chars`);

// Path must be > 20K chars? Use Option A instead
let finalD = d;
if (d.length > 20000) {
  console.log(`Path > 20K chars (${d.length}), using Option A (epsilon=0.5)...`);
  const simplified2 = simplifyDP(mainChain, 0.5);
  let d2 = `M ${(simplified2[0].x * scaleX).toFixed(4)},${(simplified2[0].y * scaleY).toFixed(4)}`;
  for (let i = 1; i < simplified2.length; i++) {
    d2 += ` L ${(simplified2[i].x * scaleX).toFixed(4)},${(simplified2[i].y * scaleY).toFixed(4)}`;
  }
  d2 += ' Z';
  finalD = d2;
  console.log(`Option A path length: ${d2.length} chars, ${simplified2.length} points`);
} else {
  console.log(`Option B path: ${simplified.length} points, ${d.length} chars`);
}

// Write SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 655 594" aria-label="Map of Iran">
  <path d="${finalD}" fill="#1e1e2e" stroke="#3a3a5c" stroke-width="1" />
</svg>`;

fs.writeFileSync(SVG_PATH, svg);
console.log(`\n✅ Written to ${SVG_PATH}`);

// Verify
const verify = fs.readFileSync(SVG_PATH, 'utf-8');
console.log(`\n=== VERIFICATION ===`);
console.log(`Total chars: ${verify.length}`);
console.log(`First 100 chars: ${verify.slice(0, 100)}`);
console.log(`Last 50 chars: ${verify.slice(-50)}`);
console.log(`Starts with M: ${finalD.startsWith('M')}`);
console.log(`Ends with Z: ${finalD.endsWith(' Z')}`);
console.log(`<path d=" count: ${(verify.match(/d="/g) || []).length}`);
console.log(`<path    count: ${(verify.match(/<path/g) || []).length}`);
