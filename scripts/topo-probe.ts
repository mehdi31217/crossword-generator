import { createEmptyGrid } from '../utils/gridLogic';
import type { GridSize } from '../types';

const sizes: GridSize[] = [5, 6, 7, 8, 9, 10];
const runsOf = (g: any[][], len: number) => {
  let n = 0;
  const size = g.length;
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      if (g[r][c].isBlack) { c++; continue; }
      let w = 0;
      while (c < size && !g[r][c].isBlack) { w++; c++; }
      if (w === len) n++;
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      if (g[r][c].isBlack) { r++; continue; }
      let w = 0;
      while (r < size && !g[r][c].isBlack) { w++; r++; }
      if (w === len) n++;
    }
  }
  return n;
};
console.log('size  grids  L2avg  L2p50  L2p90  L2max  L3avg  slots  isolatedTopologies');
for (const s of sizes) {
  const N = 300;
  const l2: number[] = [], l3: number[] = [];
  let bad = 0;
  for (let i = 0; i < N; i++) {
    const g: any[][] = createEmptyGrid(s);
    const a = runsOf(g, 2), b = runsOf(g, 3);
    l2.push(a); l3.push(b);
    if (runsOf(g, 1) > 0) bad++;
  }
  const sorted = [...l2].sort((x, y) => x - y);
  const avg = (a: number[]) => (a.reduce((s2, x) => s2 + x, 0) / a.length).toFixed(1);
  console.log(
    `${s}     ${N}    ${avg(l2)}    ${sorted[Math.floor(N * 0.5)]}     ${sorted[Math.floor(N * 0.9)]}      ${sorted[N - 1]}      ${avg(l3)}    -      ${bad}`
  );
}
