#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const CHAPTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'chapters');
const MONSTERS_DIR = path.join(__dirname, '..', 'public', 'images', 'monsters');
const COVERS_DIR = path.join(__dirname, '..', 'public', 'images', 'covers');

// Clean old files
console.log('Cleaning old SVGs...');
for (const d of [CHAPTERS_DIR, MONSTERS_DIR, COVERS_DIR]) {
  if (fs.existsSync(d)) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        const files = fs.readdirSync(p);
        for (const f of files) {
          if (f.endsWith('.svg')) fs.unlinkSync(path.join(p, f));
        }
      } else if (e.name.endsWith('.svg')) {
        fs.unlinkSync(p);
      }
    }
  }
}

console.log('\n=== Generating Chapter SVGs ===');
require('./gen-chapters.cjs');

console.log('\n=== Generating Cover SVGs ===');
require('./gen-covers.cjs');

console.log('\n=== Generating Monster SVGs ===');
require('./gen-monsters.cjs');

console.log('\n✅ All SVGs regenerated successfully!');
