/**
 * Minimal Wikimedia Commons API client used by the story-image scripts.
 *
 * Commons rate-limits anonymously by request rate, so every call is paced and
 * HTTP 429 is retried with an increasing backoff.
 */
const UA = 'CrosswordGenPro/1.0 (local asset sourcing; educational game)';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const PACE = 1200;
let lastCall = 0;

async function api(params) {
    const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
        format: 'json', formatversion: '2', ...params,
    });
    for (let i = 0; i < 7; i++) {
        const wait = lastCall + PACE - Date.now();
        if (wait > 0) await sleep(wait);
        lastCall = Date.now();
        const res = await fetch(url, { headers: { 'User-Agent': UA } });
        if (res.status === 429) { await sleep(6000 * (i + 1)); continue; }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    }
    throw new Error('rate limited');
}

async function categoryFiles(cat, limit = 100) {
    const out = [];
    let cont;
    do {
        const d = await api({
            action: 'query', list: 'categorymembers', cmtitle: 'Category:' + cat,
            cmtype: 'file', cmlimit: String(limit), ...(cont ? { cmcontinue: cont } : {}),
        });
        for (const m of d.query?.categorymembers || []) out.push(m.title);
        cont = d.continue?.cmcontinue;
    } while (cont && out.length < limit);
    return out;
}

async function searchFiles(q, limit = 12) {
    const d = await api({
        action: 'query', generator: 'search', gsrnamespace: '6',
        gsrsearch: q, gsrlimit: String(limit),
    });
    return (d.query?.pages || []).map(p => p.title);
}

async function imageInfo(titles, width = 1000) {
    const out = {};
    for (let i = 0; i < titles.length; i += 20) {
        const chunk = titles.slice(i, i + 20);
        const d = await api({
            action: 'query', titles: chunk.join('|'), prop: 'imageinfo',
            iiprop: 'url|size|extmetadata', iiurlwidth: String(width),
        });
        for (const p of d.query?.pages || []) {
            if (!p.imageinfo) continue;
            const ii = p.imageinfo[0];
            const md = ii.extmetadata || {};
            out[p.title] = {
                title: p.title,
                thumb: ii.thumburl || ii.url,
                url: ii.url,
                width: ii.width,
                height: ii.height,
                license: md.LicenseShortName?.value,
                artist: (md.Artist?.value || '').replace(/<[^>]+>/g, '').trim(),
                description: (md.ImageDescription?.value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200),
                page: 'https://commons.wikimedia.org/wiki/' + p.title.replace(/ /g, '_'),
            };
        }
    }
    return out;
}

module.exports = { categoryFiles, searchFiles, imageInfo, api, sleep };
