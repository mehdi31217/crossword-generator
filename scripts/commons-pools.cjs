/**
 * Builds a cached pool of Commons file candidates per book so the image fetcher
 * does not hammer the search API once per chapter. Commons rate-limits by
 * request rate, so requests are spaced and 429s are retried with backoff.
 *
 *   node scripts/commons-pools.cjs [--refresh=book1,book2]
 */
const fs = require('fs');
const path = require('path');
const { categoryFiles, searchFiles, sleep } = require('./commons-lib.cjs');

const CACHE = path.join(__dirname, 'story-pools.json');
const refresh = (process.argv.find(a => a.startsWith('--refresh=')) || '').slice(10).split(',').filter(Boolean);

const POOLS = {
    rostam_7: { cats: ['Rostam'], q: ['Rostam Shahnameh', 'Rostam div Shahnameh'] },
    rostam_sohrab: { cats: ['Sohrab'], q: ['Rostam Sohrab', 'Suhrab Shahnameh', 'Rostam Tahmina'] },
    rostam_afrasiab: { cats: ['Afrasiab'], q: ['Rostam Afrasiab', 'Rostam battle Shahnameh'] },
    siavoshan: { cats: ['Siyavash'], q: ['Siyavush Shahnameh', 'Siyavash fire', 'Siyavush portrait'] },
    bizhan: { cats: [], q: ['Bizhan Manizheh', 'Bijan Manijeh Shahnameh', 'Rostam Bizhan', 'Manizheh Shahnameh'] },
    zal_rudabeh: { cats: [], q: ['Zal Rudabeh', 'Zal Rudaba Shahnameh', 'Zal Shahnameh'] },
    arash: { cats: [], q: ['Arash archer', 'Arash Kamangir', 'Arash Kamangir statue Tehran'] },
    khosrow_shirin: { cats: ['Khosrow and Shirin'], q: ['Khusrau Shirin Khamsa', 'Farhad Shirin'] },
    haft_peykar: { cats: [], q: ['Haft Paykar', 'Bahram Gur Khamsa', 'Bahram Gur'] },
    kurosh: { cats: ['Cyrus the Great'], q: ['Cyrus Cylinder', 'Cyrus the Great painting'] },
    zahhak: { cats: ['Zahhak'], q: ['Faridun Zahhak', 'Kaveh blacksmith Shahnameh'] },
    kaveh: { cats: ['Kaveh the Blacksmith'], q: ['Faridun Shahnameh', 'Derafsh Kaviani'] },
    esfandiyar: { cats: ['Esfandiyar'], q: ['Isfandiyar Shahnameh', 'Isfandiyar Simurgh'] },
    rostam_esfandiyar: { cats: [], q: ['Rostam Isfandiyar', 'Rustam Isfandiyar death'] },
    tahmineh: { cats: ['Tahmina'], q: ['Rostam Tahmina', 'Tahminah Shahnameh'] },
    zal_simorgh: { cats: ['Simurgh'], q: ['Zal Simurgh', 'Simurgh Shahnameh'] },
    kaykhosrow: { cats: [], q: ['Kay Khosrow', 'Kai Khusrau Shahnameh', 'Afrasiab death'] },
    rostam_death: { cats: ['Shaghad'], q: ['death of Rustam', 'Rostam Shaghad', 'Rakhsh'] },
    rostam_akvan: { cats: [], q: ['Rostam Akvan', 'Akvan div'] },
    hushang: { cats: [], q: ['Hushang Shahnameh', 'Sadeh festival'] },
    jamshid: { cats: ['Jamshid'], q: ['Persepolis Apadana relief', 'Persepolis'] },
    anushirvan: { cats: [], q: ['Khosrow I', 'Anushirvan', 'Bozorgmehr', 'Taq Kasra'] },
    mosaddegh: { cats: [], q: ['Mohammad Mosaddegh', '1953 Iranian coup'] },
    hassan_kachal: { cats: [], q: ['Persian miniature garden', 'Persian miniature bathhouse', 'Persian miniature div'] },
    farsi_aval: { cats: [], q: ['water splash drop', 'rain clouds', 'classroom Iran', 'pomegranate fruit', 'flag of Iran', 'human anatomy illustration', 'red fox', 'Iranian family', 'Hyrcanian forest', 'birthday cake'] },

    // History campaigns: real artefacts, reliefs and documented photographs
    // rather than modern illustration, so the timeline reads like a museum wall.
    medes: { cats: ['Medes'], q: ['Ecbatana', 'Battle of Nineveh', 'Astyages', 'Persepolis Median guard relief'] },
    achaemenids: { cats: ['Achaemenid Empire'], q: ['Cyrus Cylinder', 'Persepolis Apadana relief', 'Battle of Salamis painting', 'Alexander Mosaic Issus', 'Darius I', 'Fall of Babylon painting', 'Croesus Cyrus'] },
    parthians: { cats: ['Parthian Empire'], q: ['Parthian statue Shami', 'Battle of Carrhae', 'Ardashir I relief Naqsh-e Rostam', 'Mithridates Parthian'] },
    sassanids: { cats: ['Sasanian Empire'], q: ['Shapur I Naqsh-e Rostam', 'Taq Kasra', 'Sasanian plate', 'Battle of al-Qadisiyyah', 'Ardashir I relief'] },
    seljuks: { cats: ['Seljuk Empire'], q: ['Sultan Sanjar Mausoleum', 'Battle of Manzikert', 'Nizam al-Mulk', 'Seljuk mausoleum Iran'] },
    safavids: { cats: ['Safavid Iran'], q: ['Shah Abbas I portrait', 'Sheikh Safi al-Din shrine', 'Naqsh-e Jahan Square', 'Battle of Chaldiran', 'Siege of Isfahan', 'Shah Ismail I'] },
    qajars: { cats: ['Qajar Iran'], q: ['Fath-Ali Shah Qajar', 'Amir Kabir', 'Persian Constitutional Revolution', 'Agha Mohammad Khan Qajar', 'Ahmad Shah Qajar'] },
};

(async () => {
    const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
    for (const [book, def] of Object.entries(POOLS)) {
        if (refresh.length && !refresh.includes(book)) continue;
        if (!refresh.length && cache[book]?.titles?.length) continue;
        process.stdout.write(book + ' … ');
        const titles = new Set(refresh.length ? (cache[book]?.titles || []) : []);
        for (const cat of def.cats) {
            try {
                for (const t of await categoryFiles(cat, 80)) if (/\.(jpe?g|png)$/i.test(t)) titles.add(t);
            } catch (e) { console.log('cat fail ' + cat + ': ' + e.message); }
            await sleep(1600);
        }
        for (const q of def.q) {
            try {
                for (const t of await searchFiles(q, 40)) if (/\.(jpe?g|png)$/i.test(t)) titles.add(t);
            } catch (e) { console.log('q fail ' + q + ': ' + e.message); }
            await sleep(1600);
        }
        cache[book] = { titles: [...titles] };
        fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
        console.log(titles.size);
    }
    console.log('cached → ' + CACHE);
})();
