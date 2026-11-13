/**
 * Downloads real artwork for story-mode books from Wikimedia Commons.
 *
 *   node scripts/fetch-story-images.cjs [--books=rostam_7,zahhak] [--force] [--dry]
 *
 * Picks the best-matching Commons file per chapter, stores an 800px (covers:
 * 1100px) JPEG in public/images/..., and records the source page + licence in
 * public/images/story-credits.json. Commons rate-limits bulk traffic, so every
 * request is paced and retried with backoff.
 */
const fs = require('fs');
const path = require('path');
const { BOOKS, PICKS } = require('./story-image-catalog.cjs');
const { searchFiles, imageInfo } = require('./commons-lib.cjs');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'public/images/_raw');
const CREDITS = path.join(ROOT, 'public/images/story-credits.json');
const POOL_FILE = path.join(__dirname, 'story-pools.json');
const POOL = fs.existsSync(POOL_FILE) ? JSON.parse(fs.readFileSync(POOL_FILE, 'utf8')) : {};
const args = process.argv.slice(2);
const only = (args.find(a => a.startsWith('--books=')) || '').slice(8).split(',').filter(Boolean);
const force = args.includes('--force');
const dry = args.includes('--dry');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function score(title, spec) {
    const t = title.toLowerCase();
    let s = 0;
    if (!spec.accept.test(title)) return -1;
    if (/\.svg$|logo|flag of|emblem|coin|map of|stamp|diagram|chart|flowchart|ballet|film/i.test(title)) s -= 12;
    if (/shahnameh|shahnama|folio|khamsa|nizami|miniature|album/i.test(t)) s += 6;
    for (const w of spec.want || []) if (t.includes(w)) s += 3;
    return s;
}

const INFO_CACHE = '/tmp/cw-info.json';
const infoCache = fs.existsSync(INFO_CACHE) ? JSON.parse(fs.readFileSync(INFO_CACHE, 'utf8')) : {};

async function infoFor(titles, width) {
    const key = t => `${width}|${t}`;
    const missing = titles.filter(t => !infoCache[key(t)]);
    if (missing.length) {
        const fresh = await imageInfo(missing, width);
        for (const m of missing) infoCache[key(m)] = fresh[m] || null;
        fs.writeFileSync(INFO_CACHE, JSON.stringify(infoCache));
    }
    const info = {};
    for (const t of titles) { const v = infoCache[key(t)]; if (v) info[t] = v; }
    return titles.map(t => info[t]).filter(Boolean)
        .filter(i => Math.max(i.width, i.height) >= 500 && Math.min(i.width, i.height) >= 300)
        .sort((a, b) => {
            const pa = /public domain|pd/i.test(a.license || '') ? 2 : 1;
            const pb = /public domain|pd/i.test(b.license || '') ? 2 : 1;
            if (pa !== pb) return pb - pa;
            return (b.width * b.height) - (a.width * a.height);
        });
}

async function pick(book, spec, used) {
    const pool = (POOL[book]?.titles || []).filter(t => !used.has(t));

    // 1) Hand-picked file (unique substring of the Commons title).
    if (spec.pick) {
        let hits = pool.filter(t => t.toLowerCase().includes(spec.pick.toLowerCase()));
        if (!hits.length) {
            const found = await searchFiles(spec.pick, 8);
            await sleep(800);
            hits = found.filter(t => t.toLowerCase().includes(spec.pick.toLowerCase()));
        }
        if (hits.length) {
            const chosen = await infoFor(hits.sort((a, b) => a.length - b.length).slice(0, 6), spec.width);
            if (chosen.length) return chosen[0];
        }
        console.warn(`\n   ! pick not found: ${spec.pick}`);
    }

    // 2) Score the cached candidate pool.
    const cands = pool
        .map(t => ({ title: t, sc: score(t, spec) }))
        .filter(c => c.sc >= 0)
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 6)
        .map(c => c.title);
    if (cands.length) {
        const chosen = await infoFor(cands, spec.width);
        if (chosen.length) return chosen[0];
    }

    // 3) Live search as a last resort.
    for (const q of spec.q || []) {
        const titles = (await searchFiles(q, 10)).filter(t => !used.has(t) && score(t, spec) >= 0);
        await sleep(800);
        if (!titles.length) continue;
        const chosen = await infoFor(titles.sort((a, b) => score(b, spec) - score(a, spec)).slice(0, 5), spec.width);
        if (chosen.length) return chosen[0];
    }
    return null;
}

async function download(url, out) {
    for (let i = 0; i < 8; i++) {
        const res = await fetch(url, { headers: { 'User-Agent': 'CrosswordGenPro/1.0 (local asset sourcing)' } });
        if (res.status === 429) { await sleep(5000 * (i + 1)); continue; }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 5000) throw new Error('too small');
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, buf);
        return buf.length;
    }
    throw new Error('rate limited');
}

(async () => {
    const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
    const books = Object.keys(BOOKS).filter(k => k !== 'chapters');
    const usedPerBook = new Map();

    // Chapter folders as referenced by data/shahnameh/*.ts, which do not always
    // match the book id.
    const DIR = {
        rostam_sohrab: 'sohrab', rostam_afrasiab: 'afrasiab', zal_rudabeh: 'zal',
        rostam_esfandiyar: 'rostam-esfandiyar', zal_simorgh: 'zal-simorgh',
        rostam_death: 'rostam-death', rostam_akvan: 'rostam-akvan',
        hassan_kachal: 'hassan', farsi_aval: 'farsi-aval', rostam_7: 'rostam7',
    };
    // The Haft Khan chapters are referenced as khan1..khan7 by the story data.
    const STEM = { rostam_7: n => `khan${n}` };

    const jobs = [];
    for (const b of books) {
        if (only.length && !only.includes(b)) continue;
        const spec = BOOKS[b];
        jobs.push({
            book: b, kind: 'cover', out: spec.cover,
            spec: { ...spec, pick: PICKS[b]?.cover, width: 1100 },
        });
    }
    for (const [b, list] of Object.entries(BOOKS.chapters)) {
        if (only.length && !only.includes(b)) continue;
        for (const ch of list) {
            jobs.push({
                book: b, kind: 'chapter', n: ch.n,
                out: `/images/chapters/${DIR[b] || b}/${STEM[b] ? STEM[b](ch.n) : 'ch' + ch.n}.jpg`,
                spec: { ...ch, pick: PICKS[b]?.ch?.[ch.n], width: 800 },
            });
        }
    }

    let ok = 0, skipped = 0, failed = 0;
    for (const j of jobs) {
        const abs = path.join(RAW, j.out);
        const key = j.book + '::' + j.kind + '::' + (j.n || 0);
        if (!force && fs.existsSync(abs)) { skipped++; continue; }
        const used = usedPerBook.get(j.book) || new Set();
        usedPerBook.set(j.book, used);
        process.stdout.write(`${key} … `);
        try {
            const hit = await pick(j.book, j.spec, used);
            if (!hit) { console.log('NO MATCH'); failed++; continue; }
            used.add(hit.title);
            if (dry) { console.log(hit.title); continue; }
            const bytes = await download(hit.thumb, abs);
            credits[key] = {
                book: j.book, kind: j.kind, chapter: j.n || null, out: j.out,
                title: hit.title.replace(/^File:/, ''), page: hit.page,
                license: hit.license || 'unknown', artist: hit.artist || '',
                downloadedAt: new Date().toISOString().slice(0, 10),
            };
            fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2));
            console.log(`${(bytes / 1024) | 0}KB  ${hit.title.slice(5, 90)}`);
            ok++;
        } catch (e) {
            console.log('FAIL ' + e.message);
            failed++;
        }
        await sleep(1600);
    }
    console.log(`\ndone: ok=${ok} skipped=${skipped} failed=${failed}`);
})();
