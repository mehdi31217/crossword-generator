/**
 * Downloads a real artwork for every story-mode monster portrait.
 *
 *   node scripts/fetch-monster-images.cjs [--books=rostam_7,zahhak] [--force] [--dry]
 *
 * The chosen artwork is never the same file as the chapter backdrop (when an
 * alternative exists), so the round avatar reads as a close-up of the scene
 * rather than a duplicate. Results are recorded in
 * public/images/monster-credits.json; the raw downloads land in
 * public/images/_raw/monsters/<folder>/<stem>.jpg for crop-monster-avatars.py.
 */
const fs = require('fs');
const path = require('path');
const { MONSTERS } = require('./monster-image-catalog.cjs');
const { searchFiles, imageInfo } = require('./commons-lib.cjs');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'public/images/_raw/monsters');
const CREDITS = path.join(ROOT, 'public/images/monster-credits.json');
const MANIFEST = '/tmp/cw-monsters.json';
const CHAPTERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/local-data/story_chapters.json'), 'utf8'));
const STORY_CREDITS = fs.existsSync(path.join(ROOT, 'public/images/story-credits.json'))
    ? JSON.parse(fs.readFileSync(path.join(ROOT, 'public/images/story-credits.json'), 'utf8'))
    : {};
const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--books=')) || '').slice(8).split(',').filter(Boolean);
const force = args.includes('--force');
const dry = args.includes('--dry');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice(8)) : Infinity;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const normalize = s => s.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
// Story credits store bare titles; the Commons API needs the File: prefix.
const commonsTitle = t => (/^File:/i.test(t) ? t : 'File:' + t);

const chapterRows = (Array.isArray(CHAPTERS) ? CHAPTERS : CHAPTERS.chapters || Object.values(CHAPTERS))
    .filter(c => c.monster_avatar && c.monster_avatar.includes('/images/monsters/'));

// Chapter backdrop per book::chapter, so we can avoid picking it again.
const backdrop = {};
for (const c of Object.values(STORY_CREDITS)) {
    if (c.kind === 'chapter' && c.chapter != null) backdrop[`${c.book}::${c.chapter}`] = normalize(c.title || '');
}

function score(title, spec) {
    const t = title.toLowerCase();
    if (!spec.accept.test(title)) return -1;
    let s = 0;
    if (/shahnameh|shahnama|folio|miniature|khamsa|nizami|album/i.test(t)) s += 5;
    if (/detail|cropped/i.test(t)) s += 2;
    for (const w of spec.want || []) if (t.includes(w.toLowerCase())) s += 3;
    if (/\.(jpg|jpeg|png)$/i.test(t)) s += 1;
    if (/\.(pdf|djvu|svg|tif|tiff)$/i.test(t)) s -= 15;
    if (/map|coin|stamp|diagram|chart|logo|flag of|emblem|cover|book cover/i.test(t)) s -= 20;
    return s;
}

const INFO_CACHE = '/tmp/cw-monster-info.json';
const infoCache = fs.existsSync(INFO_CACHE) ? JSON.parse(fs.readFileSync(INFO_CACHE, 'utf8')) : {};

async function infoFor(titles, width) {
    const key = t => `${width}|${t}`;
    const missing = titles.filter(t => !infoCache[key(t)]);
    for (let i = 0; i < missing.length; i += 15) {
        const chunk = missing.slice(i, i + 15);
        const fresh = await imageInfo(chunk, width);
        for (const t of chunk) infoCache[key(t)] = fresh[t] || null;
        fs.writeFileSync(INFO_CACHE, JSON.stringify(infoCache));
    }
    return titles.map(t => infoCache[key(t)]).filter(Boolean)
        .filter(i => Math.max(i.width, i.height) >= 480 && Math.min(i.width, i.height) >= 320);
}

function pickBest(cands, spec, bgTitle, usedInBook) {
    return cands
        .filter(t => normalize(t) !== bgTitle)
        .filter(t => !usedInBook.has(normalize(t)))
        .map(t => ({ t, s: score(t, spec) }))
        .filter(x => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .map(x => x.t);
}

async function findFor(spec, bgTitle, usedInBook) {
    // 1) Explicit pick, then any query that contains it.
    if (spec.pick) {
        const p = normalize(spec.pick);
        let hits = [];
        for (const q of [spec.pick, ...(spec.q || [])]) {
            hits = (await searchFiles(q, 10)).filter(t => normalize(t).includes(p));
            await sleep(700);
            if (hits.length) break;
        }
        const chosen = await infoFor(hits.filter(t => normalize(t) !== bgTitle).slice(0, 6), 900);
        if (chosen.length) return chosen[0];
        console.warn(`   ! pick not found: ${spec.pick}`);
    }

    // 2) Live searches, best-scoring usable file.
    for (const q of spec.q || []) {
        const titles = await searchFiles(q, 12);
        await sleep(700);
        const ranked = pickBest(titles, spec, bgTitle, usedInBook);
        if (!ranked.length) continue;
        const info = await infoFor(ranked.slice(0, 8), 900);
        if (info.length) {
            info.sort((a, b) => score(b.title, spec) - score(a.title, spec));
            return info[0];
        }
    }
    return null;
}

async function download(url, out) {
    for (let i = 0; i < 6; i++) {
        const res = await fetch(url, { headers: { 'User-Agent': 'CrosswordGenPro/1.0 (local asset sourcing)' } });
        if (res.status === 429) { await sleep(4000 * (i + 1)); continue; }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const type = res.headers.get('content-type') || '';
        const buf = Buffer.from(await res.arrayBuffer());
        if (!/image\//.test(type) || buf.length < 5000) throw new Error(`bad payload (${type}, ${buf.length}b)`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, buf);
        return buf.length;
    }
    throw new Error('rate limited');
}

(async () => {
    const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
    const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
    const byKey = new Map(manifest.map(m => [`${m.book}::${m.chapter}`, m]));
    const books = Object.keys(MONSTERS).filter(b => !only.length || only.includes(b));
    let done = 0, skipped = 0, failed = 0;

    for (const book of books) {
        const rows = chapterRows.filter(c => c.book_id === book);
        if (!rows.length) { console.warn(`! no chapters in DB for ${book}`); continue; }
        const usedInBook = new Set();
        // Seed the de-dupe set from backdrops so two chapters don't share one.
        console.log(`\n== ${book} (${rows.length} chapters)`);

        for (const spec of MONSTERS[book]) {
            if (done >= limit) break;
            const row = rows.find(r => Number(r.chapter_index) === spec.n);
            if (!row) { console.warn(`   ! chapter ${spec.n} missing in DB`); continue; }
            const rel = row.monster_avatar.replace('/images/monsters/', '').replace(/\.svg$/i, '.jpg');
            const rawOut = path.join(RAW, rel);
            const key = `${book}::${spec.n}`;
            if (!force && fs.existsSync(rawOut) && byKey.has(key)) { skipped++; usedInBook.add(normalize(byKey.get(key).title)); continue; }

            const bgTitle = backdrop[key] || '';
            if (dry) {
                console.log(`   - ${book} ${spec.n}: would search ${spec.q?.[0] || spec.pick}`);
                continue;
            }

            let info = await findFor(spec, bgTitle, usedInBook);
            let fallback = false;
            if (!info) {
                // No second artwork: use the chapter's own backdrop and crop a
                // detail out of it. Still real art, still the right scene.
                const bg = Object.values(STORY_CREDITS).find(c => c.book === book && Number(c.chapter) === spec.n && c.kind === 'chapter');
                if (bg) {
                    const found = await infoFor([commonsTitle(bg.title)], 1000);
                    if (found.length) { info = found[0]; fallback = true; }
                }
            }
            if (!info) { console.warn(`   ! no artwork for ${book} ${spec.n}`); failed++; continue; }

            try {
                await download(info.thumb || info.url, rawOut);
                usedInBook.add(normalize(info.title));
                const entry = {
                    book, chapter: spec.n, out: row.monster_avatar.replace(/\.svg$/i, '.jpg'),
                    raw: path.relative(ROOT, rawOut), title: info.title, page: info.page,
                    license: info.license, artist: info.artist, fallback,
                };
                credits[`${book}::${spec.n}::${path.basename(rel)}`] = entry;
                const mIdx = manifest.findIndex(m => m.book === book && m.chapter === spec.n);
                if (mIdx >= 0) manifest[mIdx] = entry; else manifest.push(entry);
                fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2));
                fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
                done++;
                console.log(`   + ${spec.n}: ${info.title.slice(0, 88)}${fallback ? '  [backdrop]' : ''}`);
                await sleep(250);
            } catch (e) {
                console.warn(`   ! download failed ${book} ${spec.n}: ${e.message}`);
                failed++;
            }
        }
        if (done >= limit) break;
    }
    console.log(`\nfetched ${done}, skipped ${skipped}, failed ${failed}`);
})();
