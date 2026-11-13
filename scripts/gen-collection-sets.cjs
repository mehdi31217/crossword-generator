/**
 * Generates server/collection-sets.json — the football collection sets the
 * server needs to validate a set-completion reward. The client already owns the
 * display copy (worldMapData + WorldMap registry); the server only needs
 * `legendId -> [chapter ids]`, nothing else.
 *
 * Re-run after adding a legend or a chapter:
 *   node scripts/gen-collection-sets.cjs
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'server', 'collection-sets.json');
const TMP = path.join(ROOT, 'server', '.collection-sets.tmp.json');
const TMP_BUNDLE = path.join(ROOT, 'server', '.collection-sets.tmp.cjs');

// Parsing the bundle's stdout is unreliable: esbuild emits its own code around
// the call. The bundle writes the raw map to a temp file, and we require() it.
esbuild.buildSync({
  stdin: {
    contents: `
      import fs from 'node:fs';
      import { WORLD_MAP_CHAPTERS } from './data/worldMapData';
      const sets = {};
      for (const [legendId, chapters] of Object.entries(WORLD_MAP_CHAPTERS)) {
        sets[legendId] = chapters.map((c) => c.id);
      }
      fs.writeFileSync(${JSON.stringify(TMP)}, JSON.stringify(sets));
    `,
    resolveDir: ROOT,
    loader: 'ts',
  },
  outfile: TMP_BUNDLE,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  logLevel: 'silent',
});

require(TMP_BUNDLE);

const sets = JSON.parse(fs.readFileSync(TMP, 'utf8'));
fs.unlinkSync(TMP);
fs.unlinkSync(TMP_BUNDLE);

const payload = { football: sets };
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');

const legends = Object.keys(sets).length;
const chapters = Object.values(sets).reduce((n, ids) => n + ids.length, 0);
console.log(`wrote ${path.relative(ROOT, OUT)} — ${legends} legends, ${chapters} chapters`);
