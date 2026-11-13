const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, '..', 'scaled-outline-path.txt'), 'utf-8');

// Parse all coordinate pairs from M and L commands
const coordRegex = /[ML]\s+([\d.-]+),([\d.-]+)/g;
let match;
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
const coords = [];

while ((match = coordRegex.exec(data)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  minX = Math.min(minX, x);
  minY = Math.min(minY, y);
  maxX = Math.max(maxX, x);
  maxY = Math.max(maxY, y);
  coords.push({ x, y });
}

console.log(`Path: ${coords.length} points`);
console.log(`Bounding box: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}] Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);
console.log(`Width: ${(maxX - minX).toFixed(2)}, Height: ${(maxY - minY).toFixed(2)}`);

// Check if it covers Iran's full extent
// Original viewBox is 733.5 x 676.5
// Iran extent in original coords should be roughly [27-596] x [3-564] based on province coords
// After scale: X ~ [24-532], Y ~ [3-495]
console.log(`\nExpected Iran extent (scaled): X ~ [24, 532], Y ~ [3, 495]`);

// Find the highest/lowest points
coords.sort((a, b) => a.y - b.y);
console.log(`\nNorthernmost (smallest Y): (${coords[0].x.toFixed(2)}, ${coords[0].y.toFixed(2)})`);
console.log(`Southernmost (largest Y): (${coords[coords.length-1].x.toFixed(2)}, ${coords[coords.length-1].y.toFixed(2)})`);
coords.sort((a, b) => a.x - b.x);
console.log(`Westernmost (smallest X): (${coords[0].x.toFixed(2)}, ${coords[0].y.toFixed(2)})`);
console.log(`Easternmost (largest X): (${coords[coords.length-1].x.toFixed(2)}, ${coords[coords.length-1].y.toFixed(2)})`);

// Count by geography quadrants to ensure coverage
const nw = coords.filter(c => c.x < 300 && c.y < 250).length;
const ne = coords.filter(c => c.x >= 300 && c.y < 250).length;
const sw = coords.filter(c => c.x < 300 && c.y >= 250).length;
const se = coords.filter(c => c.x >= 300 && c.y >= 250).length;
console.log(`\nPoints per quadrant: NW=${nw}, NE=${ne}, SW=${sw}, SE=${se}`);
