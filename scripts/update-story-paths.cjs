/**
 * Repoints story-mode image fields from the generated SVG artwork to the
 * Commons-sourced JPEGs produced by scripts/fetch-story-images.cjs.
 *
 *   node scripts/update-story-paths.cjs [--dry]
 *
 * A path is only rewritten when the JPEG actually exists under
 * public/images/_raw, so a failed download leaves the old asset in place.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'public/images/_raw');
const dry = process.argv.includes('--dry');

const files = [
    ...fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.ts')).map(f => path.join('data', f)),
    ...fs.readdirSync(path.join(ROOT, 'data/shahnameh')).filter(f => f.endsWith('.ts')).map(f => path.join('data/shahnameh', f)),
    ...fs.readdirSync(path.join(ROOT, 'data/history')).filter(f => f.endsWith('.ts')).map(f => path.join('data/history', f)),
    'server/local-data/story_books.json',
    'server/local-data/story_chapters.json',
];

const RE = /\/images\/(covers|chapters)\/[A-Za-z0-9_\-/.]+?\.svg/g;
let changed = 0, missing = 0;

for (const rel of files) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf8');
    let hits = 0;
    const out = src.replace(RE, (m) => {
        const jpg = m.replace(/\.svg$/, '.jpg');
        if (fs.existsSync(path.join(RAW, jpg))) { hits++; return jpg; }
        missing++;
        return m;
    });
    if (hits) {
        changed++;
        if (!dry) fs.writeFileSync(abs, out);
        console.log(`${dry ? 'would update' : 'updated'} ${rel} (${hits})`);
    }
}
console.log(`\nfiles touched: ${changed}, unresolved paths: ${missing}`);
