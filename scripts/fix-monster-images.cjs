/**
 * Replaces monster portraits whose crop landed on calligraphy or on a photo
 * that does not read at avatar size.
 *
 *   node scripts/fix-monster-images.cjs [--dry]
 *
 * Each entry names a Commons file whose title describes the exact scene. Files
 * marked `detail`/`cropped` are museum close-ups and need no further framing;
 * the rest are full scenes and go through crop-monster-avatars.py.
 */
const fs = require('fs');
const path = require('path');
const { imageInfo } = require('./commons-lib.cjs');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'public/images/_raw/monsters');
const CREDITS = path.join(ROOT, 'public/images/monster-credits.json');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);

const FIXES = {
    'khosrow/ch3-monster.jpg': 'File:"Farhad Carves a Milk Channel for Shirin", Folio 74 from a Khamsa (Quintet) of Nizami MET DP159378.jpg',
    'khosrow/ch5-monster.jpg': "File:Amir Khusraw Dihlavi - Farhad Hears the False News of Shirin?s Death - Walters W62466B - Full Page.jpg",
    'bizhan/ch1-monster.jpg': 'File:"Bizhan Slaughters the Wild Boars of Irman", Folio from a Shahnama (Book of Kings) MET DT214817.jpg',
    'kaykhosrow/ch1-monster.jpg': 'File:Kai Khusrau Enthroned Holding a Sword , Folio from a Shahnama (Book of Kings) MET DP215666-cropped.jpg',
    'kaykhosrow/ch6-monster.jpg': 'File:Kay Khusraw Welcomed by his Grandfather, Kay Kaus, King of Iran - detail 02.jpg',
    'esfandiyar/ch5-monster.jpg': 'File:"Isfandiyar\'s Third Course- He Slays a Dragon", Folio 434v from the Shahnama (Book of Kings) of Shah Tahmasp MET DP107166.jpg',
    'afrasiab/monster6.jpg': 'File:Baysonghori Shahnameh battle-scene-cropped.jpg',
    'afrasiab/monster7.jpg': 'File:"Kai Khusrau Slays Afrasiyab", Folio from a Shahnama (Book of Kings) MET DP108570.jpg',
    'hushang/ch3-monster.jpg': 'File:Sadeh Iranian Festival - 31-01-2014 - No 3.jpg',
    'anushirvan/ch1-monster.jpg': 'File:King Khusraw Anushirvan Enthroned- Page from a Manuscript of the Shahnama (Book of Kings) of Firdawsi LACMA M.73.5.18.jpg',
    'anushirvan/ch2-monster.jpg': 'File:"Buzurjmihr Masters the Hindu Game of Chess", Folio 639v from the Shahnama (Book of Kings) of Shah Tahmasp MET DP105221.jpg',
    'anushirvan/ch3-monster.jpg': 'File:Mosaic of Justinianus I - Basilica San Vitale (Ravenna).jpg',
    'anushirvan/ch4-monster.jpg': 'File:Taq Kasra.jpg',
    'siavoshan/sudabeh.jpg': 'File:"Sudaba\'s Second Accusation Against Siyavush is Judged", Folio 164v from the Shahnama (Book of Kings) of Shah Tahmasp MET DP107141.jpg',
    'siavoshan/slaying.jpg': 'File:The slaying of Siyavash in Turan.jpg',
    'safavids/monster1.jpg': 'File:Sheikh Safi-ad-din Ardabili Statue.jpg',
    'rostam7/khan2-desert.jpg': 'File:2020-01-01 Iran, Kerman, Dasht-e Lut DSC 9191 DxO.jpg',
    'folktales/gol/ch1-monster.jpg': 'File:Jug MET 203711.jpg',
    'folktales/shab/ch1-monster.jpg': 'File:Beneath the Milky Way.jpg',
    'rostam-akvan/ch1-monster.jpg': 'File:"Rustam is Thrown into the Sea by the Div Akvan", Folio from a Shahnama (Book of Kings) of Firdausi MET DP108566.jpg',
    'rostam-akvan/ch2-monster.jpg': 'File:Rustam Pursues Akvan, The Onager-Div, Folio from the Shahnameh (Book of Kings) of Shah Tahmasp.jpg',
    'rostam-akvan/ch3-monster.jpg': 'File:Rakhsh Defends Rustam from the Div Akvan, India, Newark Museum.JPG',
    'rostam-death/ch1-monster.jpg': 'File:"Rustam Shoots His Half-brother Shaghad through a Plane Tree", Folio from a Shahnama (Book of Kings) of Firdausi MET DP215676.jpg',
    'rostam-esfandiyar/ch1-monster.jpg': 'File:No. 55 Esfandiyar slays Arjasp in the Brazen Hold.jpg',
    'rostam-esfandiyar/ch3-monster.jpg': 'File:"Rustam Shoots Isfandiyar in the Eye", Folio from a Shahnama (Book of Kings) MET DP215911.jpg',
    'rostam-esfandiyar/ch4-monster.jpg': 'File:The funeral of isfandiyar safavid shiraz с. 1580 detail.jpg',
    'siavoshan/ch4-monster.jpg': 'File:"The Fire Ordeal of Siyavush", Folio from a Shahnama (Book of Kings) of Firdausi MET DP164658.jpg',
    'sohrab/fate.jpg': 'File:The Death of Sohrab by Joseph Rotter.jpg',
    'sohrab/giant.jpg': 'File:Battle of Rostam and Sohrab by Joseph Rotter.jpg',
    'sohrab/lion.jpg': 'File:Tahminah.jpg',
    'sohrab/wolf.jpg': 'File:Sivayush and Afrasiyab in the hunting field, folio 182b of the Shahnameh of Shah Tahmasp.jpg',
    'sohrab/night-demon.jpg': 'File:Rostam and Tahmina by Joseph Rotter.jpg',
    'sohrab/dragon.jpg': 'File:The simurgh arrives to assist with the birth of Rustam.jpg',
    'sohrab/elephant.jpg': 'File:DiezAlbumsSchahnameGurdafarid.jpg',
    'tahmineh/ch1-monster.jpg': 'File:Tahminah.jpg',
    'tahmineh/ch2-monster.jpg': 'File:Rostam and Tahmina by Joseph Rotter.jpg',
    'tahmineh/ch3-monster.jpg': 'File:The birth of Rustam, signed Hajji Muhammad, Safavid Iran, from a manuscript dated 1685-6.jpg',
    'zahhak/ch3-monster.jpg': 'File:Baysonghori Shahnameh 6 The tyrant Zahhak is nailed to the walls of a cave in Mount Damavand.jpg',
    'zahhak/ch4-monster.jpg': 'File:Sultan Muhammad Tiran Zahhak.jpg',
    'zal/ch3-monster.jpg': 'File:The wedding of Zal and Rudaba, Safavid Iran, circa 1650.jpg',
    'kaveh/ch4-monster.jpg': 'File:Sultan Muhammad Tiran Zahhak.jpg',
    'peykar/ch2-monster.jpg': 'File:Bahram Gur in the Black Pavilion.jpg',
    'jamshid/ch5-monster.jpg': 'File:2018-09-21 Iran, Persepolis, Gate of All Nations (northwestern colossus).jpg',
    'qajars/monster1.jpg': 'File:Agha Mohammad Khan Qajar painting in Soleymaniyeh Palace cropped.jpg',
    'qajars/monster3.jpg': 'File:Portrait of Amir Kabir - Hossein Arjangi (Mir Mosavvar) - Golestan Palace.jpg',
    'qajars/monster5.jpg': 'File:Ahmad Shah Qajar (3x4 cropped).jpg',
    'medes/monster1.jpg': 'File:Deioces.jpg',
    'medes/monster2.jpg': 'File:Tribute bearer from Persepolis, Iran. A Mede man holding a lamb. 5th century BCE Pergamon Museum, Berlin.jpg',
    'medes/monster3.jpg': 'File:Margaret Dovaston - The massacre of the Scythian chiefs by Cyaxares the Mede litho - MeisterDrucke-1550695.jpg',
    'medes/monster4.jpg': 'File:King Astyages submitting to Cyrus.jpg',
    'achaemenids/monster1.jpg': 'File:Cyrus the great, persian achaemenid king of kings.jpg',
    'achaemenids/monster4.jpg': 'File:Darius I (The Great).jpg',
    'arash/ch1-monster.jpg': 'File:Arash the Archer.jpg',
    'safavids/monster1.jpg': 'File:Sheikh Safi Al Din Tomb.jpg',
    'safavids/monster3.jpg': 'File:Portrait of Shah ‘Abbas I. Attributed to Bishandas, circa 1617 (cropped).jpg',
    'safavids/monster5.jpg': 'File:Siege scene, Tarikh-i Jahanara. 1683, Iran (Chester Beatty Library, MS. Per. 278).jpg',
    'seljuks/monster1.jpg': 'File:Seljuk Sultan Tugrul Bey sitting on his throne. Topkapı Sarayı Müzesi 1653-3 (304 B).jpg',
    'seljuks/monster4.jpg': 'File:Ahmad Sanjar detail. Adib Sabir receiving a robe of honour from Ahmad Sanjar. Copied by ʻAbd al-Muʼmin al-ʻAlavi al-Kashi between February 1314–February 1315.jpg',
    'parthians/monster2.jpg': 'File:Tetradrachm of the Parthian king Mithridates II, Susa mint.jpg',
    'parthians/monster4.jpg': "File:Death of Crassus in the battle of Carrhae (Cassell's Illustrated Universal History, vol. 3, 1882).jpg",

    // Folktales: one illustrated book each, sourced from real artwork/photos.
    'folktales/shangool/ch1-monster.jpg': 'File:Portrait of a common european wolf.jpg',
    'folktales/kadoo/ch1-monster.jpg': 'File:Cordelia Wilson - Orange Gourd.jpg',
    'folktales/khoros/ch1-monster.jpg': 'File:Rooster portrait, France.jpg',
    'folktales/mahi/ch1-monster.jpg': 'File:Black Moor Goldfish.jpg',
    'folktales/boz/ch1-monster.jpg': 'File:Goat kid (6362697831).jpg',
    'folktales/gonjeshk/ch1-monster.jpg': 'File:House Sparrow on Branch (49204523043).jpg',
    'folktales/khaleh/ch1-monster.jpg': 'File:Ladybug on apple blossoms in Visby, Gotland.jpg',
    'folktales/mosh/ch1-monster.jpg': 'File:"The Trapped Cat and the Frightened Mouse (Rat ?)", Folio from a Kalila wa Dimna MET DP300779.jpg',
    'folktales/dokhtar/ch1-monster.jpg': 'File:Citrus aurantium Blanco2.304.jpg',
    'folktales/siah/ch1-monster.jpg': 'File:A rare Safavid oil painting of an African soldier, Persia, Isfahan, circa 1680-90.jpg',
    'folktales/gorbeh/ch1-monster.jpg': 'File:Cat and Canary Cage - Kamal-ol-molk - Golestan Palace.png',
    'folktales/div/ch1-monster.jpg': 'File:An illustrated leaf from a manuscript of Firdausi’s Shahnameh; Rustam killing the White Div, Persia, Shiraz, Safavid, circa 1560-80.jpg',
    'folktales/shab/ch1-monster.jpg': 'File:The Milky Way over the Apadana Palace and the Gate of Nations.jpg',
    'folktales/gol/ch1-monster.jpg': 'File:Brooklyn Museum - Two Women Carrying Clay Jugs Not Wearing Tights one of 274 Vintage Photographs - Antoin Sevruguin.jpg',
    'folktales/naneh/ch1-monster.jpg': 'File:Salt and bread on heirloom tablecloth with traditional embroidery.jpg',

    // Bosses must be the antagonist of the chapter, not the hero/object.
    'folktales/khoros/ch1-monster.jpg': 'File:Portrait of a red fox in Rautas fjällurskog.jpg',
    'folktales/gorbeh/ch1-monster.jpg': 'File:Portrait of a red fox in Rautas fjällurskog.jpg',
    'folktales/gonjeshk/ch1-monster.jpg': 'File:Cat portrait (31801560127).jpg',
    'folktales/mahi/ch1-monster.jpg': 'File:Artis Pelican portrait (13011232595).jpg',
    'khosrow/ch1-monster.jpg': 'File:Nizami - Khusraw discovers Shirin bathing in a pool.jpg',
    'siavoshan/ch3-monster.jpg': 'File:Shahnameh - Siyawakhsh in the bower of Sudaba.jpg',
    'qajars/monster4.jpg': 'File:Mozaffar ad-Din Shah Qajar portrait.jpg',
    'hushang/ch2-monster.jpg': 'File:Closeup of raging flames in a large bonfire. - Flickr - shixart1985.jpg',
    'esfandiyar/ch5-monster.jpg': 'File:Closeup of raging flames in a large bonfire. - Flickr - shixart1985.jpg',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
    let done = 0, failed = 0;
    for (const [rel, title] of Object.entries(FIXES)) {
        if (args.includes('--missing') && credits[rel]?.fixed) { continue; }
        if (only.length && !only.includes(rel)) { continue; }
        // Batch lookups normalise some titles (`?` in the Walters file name), so a
        // miss falls back to a single-title request that keeps the exact key.
        let info = (await imageInfo([title], 1400))[title];
        if (!info) info = Object.values(await imageInfo([title], 1400))[0];
        if (!info) { console.warn(`! no info ${rel}: ${title.slice(0, 70)}`); failed++; continue; }
        if (dry) { console.log(`- ${rel} <- ${info.width}x${info.height} ${info.license}`); continue; }
        let ok = false;
        for (let attempt = 0; attempt < 3 && !ok; attempt++) {
            if (attempt) await sleep(8000 * attempt);
        for (const url of [info.thumb, info.url]) {
            try {
                const res = await fetch(url, { headers: { 'User-Agent': 'CrosswordGenPro/1.0 (local asset sourcing)' } });
                const type = res.headers.get('content-type') || '';
                if (!res.ok || !/image\//.test(type)) throw new Error(`HTTP ${res.status} ${type}`);
                const buf = Buffer.from(await res.arrayBuffer());
                if (buf.length < 5000) throw new Error('too small');
                const out = path.join(RAW, rel);
                fs.mkdirSync(path.dirname(out), { recursive: true });
                fs.writeFileSync(out, buf);
                credits[rel] = {
                    out: '/images/monsters/' + rel, raw: path.relative(ROOT, out),
                    title, page: info.page, license: info.license, artist: info.artist, fixed: true,
                };
                fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2));
                console.log(`+ ${rel} <- ${info.width}x${info.height} ${info.license}`);
                ok = true;
                done++;
                break;
            } catch (e) {
                console.warn(`  retry ${rel}: ${e.message}`);
            }
        }
        }
        if (!ok) failed++;
        await sleep(500);
    }
    console.log(`\nreplaced ${done}, failed ${failed}`);
})();
