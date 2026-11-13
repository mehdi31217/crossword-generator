/**
 * Renders public/images/story-credits.json as a human-readable markdown file
 * grouped by book, so every artwork's Commons page and licence is auditable.
 *
 *   node scripts/story-credits-md.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/images/story-credits.json');
const OUT = path.join(ROOT, 'public/images/story-credits.md');

const credits = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const books = new Map();

for (const [key, c] of Object.entries(credits)) {
    if (!books.has(c.book)) books.set(c.book, []);
    books.get(c.book).push({ ...c, key });
}

const strip = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
const lines = [
    '# Story artwork credits',
    '',
    'All images are sourced from Wikimedia Commons. Every entry links to the source page;',
    'licence text is taken from the file metadata at download time. Images were composed',
    '(blurred backdrop + contained artwork) but not otherwise altered.',
    '',
];

for (const [book, list] of [...books.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`## ${book}`, '');
    list.sort((a, b) => (a.kind === 'cover' ? -1 : b.kind === 'cover' ? 1 : a.chapter - b.chapter));
    for (const c of list) {
        const label = c.kind === 'cover' ? 'cover' : `chapter ${c.chapter}`;
        const artist = strip(c.artist);
        lines.push(`- **${label}** — ${c.title}`);
        lines.push(`  ${c.license || 'unknown'}${artist ? ` · ${artist}` : ''} · ${c.page}`);
    }
    lines.push('');
}

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${books.size} books, ${Object.keys(credits).length} files → ${path.relative(ROOT, OUT)}`);
