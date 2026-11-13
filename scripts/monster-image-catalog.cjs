/**
 * Monster-avatar artwork catalog.
 *
 * Every narrative chapter shows a round "monster" portrait next to the hero.
 * These were abstract generated SVGs; this catalog maps each chapter to a real
 * artwork on Wikimedia Commons so the portrait is a close-up of the actual
 * scene (or of a different folio of the same episode than the chapter backdrop).
 *
 * `q`       search queries, tried in order
 * `accept`  regex the Commons file title must satisfy
 * `want`    words that boost a candidate
 * `pick`    optional exact title substring (wins over scoring)
 */
const { BOOKS } = require('./story-image-catalog.cjs');

// Queries that need to be sharper than the backdrop's (the backdrop query is
// tuned for a wide scene; the avatar needs the creature itself).
const OVERRIDES = {
    'rostam_7::1': { pick: 'Rakhsh Kills a Lion while Rustam is Asleep', q: ['Rakhsh kills a lion Rustam asleep'], accept: /rakhsh|rostam|rustam/i, want: ['lion', 'met'] },
    'rostam_7::3': { pick: 'Rustam kills the dragon', q: ['Rustam kills the dragon Shahnameh'], accept: /dragon|rustam|rustam/i, want: ['walters', 'met', 'aga khan'] },
    'rostam_7::4': { pick: "Rustam's Fourth Course, He Cleaves a Witch", q: ["Rustam's Fourth Course He Cleaves a Witch"], accept: /witch|rustam|rustam/i, want: ['tahmasp', 'met'] },
    'rostam_7::6': { pick: 'Rustam kills Arzhang Div', q: ['Rustam Arzhang Div'], accept: /arzhang|div|rustam/i, want: ['div'] },
    'rostam_7::7': { pick: 'Rustam Slays the White Div', q: ['Rustam Slays the White Div'], accept: /white div|rustam|rustam/i, want: ['white div'] },

    'rostam_sohrab::1': { pick: 'Rustam hunting', q: ['Rustam hunting Shahnameh'], accept: /rostam|rustam|hunt/i, want: ['hunt', 'onager'] },
    'rostam_sohrab::6': { pick: 'Rostam and Sohrab combat', q: ['Rostam and Sohrab combat', 'Rustam Suhrab battle'], accept: /sohrab|suhrab|rostam|rustam/i, want: ['combat', 'battle'] },
    'rostam_sohrab::7': { pick: 'Rostam mourns Sohrab', q: ['Rostam mourns Sohrab', 'Rustam Suhrab death'], accept: /sohrab|suhrab|rostam|rustam/i, want: ['mourn', 'death'] },

    'rostam_afrasiab::1': { pick: 'Rustam Afrasiab', q: ['Rustam Afrasiab combat'], accept: /rostam|rustam|afrasiab/i, want: ['combat', 'battle'] },
    'rostam_afrasiab::7': { pick: 'Afrasiab', q: ['Afrasiab captured death Shahnameh'], accept: /afrasiab/i, want: ['captur', 'death', 'execution'] },

    'zahhak::1': { pick: 'Zahhak', q: ['Zahhak serpents Shahnameh'], accept: /zahhak|zohak/i, want: ['serpent', 'dragon', 'enthroned'] },
    'zahhak::4': { pick: 'Faridun', q: ['Faridun Zahhak battle Shahnameh'], accept: /zahhak|faridun|fereydun/i, want: ['battle', 'combat'] },
    'zahhak::5': { pick: 'Zahhak nailed', q: ['Zahhak nailed Mount Damavand'], accept: /zahhak|damavand|faridun/i, want: ['nailed', 'cave'] },

    'kaveh::1': { pick: 'Kaveh', q: ['Kaveh blacksmith Shahnameh'], accept: /kaveh|kavah/i, want: ['blacksmith'] },
    'kaveh::4': { pick: 'Zahhak', q: ['Zahhak chained Shahnameh'], accept: /zahhak|faridun/i, want: ['chain', 'cave'] },

    'esfandiyar::1': { pick: 'Isfandiyar', q: ['Isfandiyar wolves Shahnameh'], accept: /isfandiyar|esfandiyar/i, want: ['wolf', 'wolves'] },
    'esfandiyar::2': { pick: 'Isfandiyar', q: ['Isfandiyar lion dragon Shahnameh'], accept: /isfandiyar|esfandiyar/i, want: ['dragon', 'lion'] },
    'esfandiyar::3': { pick: 'Isfandiyar', q: ['Isfandiyar witch Shahnameh'], accept: /isfandiyar|esfandiyar|witch/i, want: ['witch'] },
    'esfandiyar::7': { pick: 'Isfandiyar', q: ['Isfandiyar div Shahnameh'], accept: /isfandiyar|esfandiyar|div/i, want: ['div', 'demon'] },

    'rostam_akvan::1': { pick: 'Akvan', q: ['Rostam Akvan Div'], accept: /akvan|rostam|rustam/i, want: ['div'] },
    'rostam_akvan::2': { pick: 'Akvan', q: ['Rostam Akvan Div fight'], accept: /akvan|rostam|rustam/i, want: ['fight', 'div'] },

    'zal_simorgh::2': { pick: 'Simurgh', q: ['Zal Simurgh Shahnameh'], accept: /simurgh|simorgh|zal/i, want: ['simurgh'] },
    'zal_simorgh::1': { pick: 'Simurgh carries Zal', q: ['Simurgh carries Zal nest'], accept: /simurgh|simorgh|zal/i, want: ['nest', 'carries'] },

    'kaykhosrow::3': { pick: 'Afrasiab', q: ['Kay Khosrow Afrasiab battle'], accept: /khosrow|khusraw|afrasiab/i, want: ['battle'] },
    'kaykhosrow::4': { pick: 'Afrasiab', q: ['Afrasiab drowning Shahnameh'], accept: /afrasiab/i, want: ['drown', 'death'] },

    'hushang::1': { pick: 'Hushang', q: ['Hushang black div Shahnameh'], accept: /hushang|hoshang/i, want: ['div', 'demon'] },
    'jamshid::4': { pick: 'Zahhak', q: ['Zahhak Jamshid Shahnameh'], accept: /zahhak|jamshid/i, want: ['zahhak'] },
    'haft_peykar::4': { pick: 'Bahram Gur hunting', q: ['Bahram Gur hunting'], accept: /bahram/i, want: ['hunt'] },
    'rostam_death::1': { pick: 'Shaghad', q: ['Shaghad Rostam Shahnameh'], accept: /shaghad|rostam|rustam/i, want: ['shaghad', 'pit'] },
    'rostam_death::2': { pick: 'Rostam', q: ['Rostam pit Shaghad'], accept: /rostam|rustam|shaghad/i, want: ['pit', 'trap'] },

    'mosaddegh::1': { pick: 'Mosaddegh', q: ['Mohammad Mosaddegh oil nationalization'], accept: /mosadde|mossade/i, want: ['parliament', 'oil'] },
    'mosaddegh::2': { pick: '1953 Iranian coup', q: ['1953 Iranian coup Mosaddegh'], accept: /coup|mosadde|mossade|1953/i, want: ['coup'] },

    'medes::1': { pick: 'Diako', q: ['Deioces Median king'], accept: /deioc|diako|median|medes/i, want: ['king', 'relief'] },
    'medes::3': { pick: 'Nineveh', q: ['Battle of Nineveh Cyaxares'], accept: /nineveh|cyaxares|huvakhshtra/i, want: ['battle', 'relief'] },
    'achaemenids::6': { pick: 'Alexander', q: ['Alexander the Great Darius battle'], accept: /alexander|darius/i, want: ['battle', 'mosaic'] },
    'parthians::3': { pick: 'Battle of Carrhae', q: ['Battle of Carrhae Surena'], accept: /carrhae|surena|parthian/i, want: ['battle'] },
    'sassanids::2': { pick: 'Shapur Valerian', q: ['Shapur I Valerian relief'], accept: /shapur|valerian|sassan/i, want: ['relief'] },
    'sassanids::5': { pick: 'Battle of al-Qadisiyyah', q: ['Battle of al-Qadisiyyah', 'Arab conquest Persia'], accept: /qadisiy|arab|sassan|persia/i, want: ['battle'] },
    'seljuks::2': { pick: 'Battle of Manzikert', q: ['Battle of Manzikert'], accept: /manzikert|alparslan|alp arslan/i, want: ['battle'] },
    'safavids::4': { pick: 'Battle of Chaldiran', q: ['Battle of Chaldiran'], accept: /chaldiran|ismail|safavid/i, want: ['battle'] },
    'qajars::2': { pick: 'Russo-Persian War', q: ['Russo-Persian War 1826'], accept: /russo|persian|fath ali|abbas mirza/i, want: ['war', 'battle'] },
    'qajars::4': { pick: 'Persian Constitutional Revolution', q: ['Persian Constitutional Revolution'], accept: /constitution|mashrut|persian/i, want: ['revolution'] },
};

// Folktales have no chapter backdrop to fall back to, so each needs its own
// artwork: an animal, object or character that the tale revolves around.
const FOLKTALES = {
    shangool: { q: ['wolf goat illustration', 'wolf sheep painting'], accept: /wolf|goat|sheep|lamb/i, want: ['illustration', 'painting'] },
    kadoo: { q: ['Persian woman miniature Qajar', 'old woman Persian painting'], accept: /woman|qajar|persian|miniature/i, want: ['portrait', 'painting'] },
    khoros: { q: ['rooster fox fable illustration', 'cock and fox'], accept: /rooster|cock|fox/i, want: ['fable', 'illustration'] },
    mahi: { q: ['fish Persian miniature', 'black fish painting'], accept: /fish/i, want: ['miniature', 'painting'] },
    boz: { q: ['goat Persian painting', 'goat miniature'], accept: /goat/i, want: ['painting', 'miniature'] },
    gonjeshk: { q: ['sparrow Persian miniature', 'bird miniature Persia'], accept: /sparrow|bird/i, want: ['miniature', 'painting'] },
    khaleh: { q: ['insect Persian miniature', 'ladybird illustration'], accept: /insect|ladybird|ladybug|beetle/i, want: ['painting', 'illustration'] },
    mosh: { q: ['cat and mouse Persian miniature', 'cat mouse painting'], accept: /cat|mouse/i, want: ['miniature', 'painting'] },
    dokhtar: { q: ['orange tree Persian miniature', 'orange blossom painting'], accept: /orange|blossom|tree/i, want: ['miniature', 'painting'] },
    siah: { q: ['black musician Persian miniature', 'servant Persian miniature'], accept: /musician|servant|black/i, want: ['miniature', 'painting'] },
    gorbeh: { q: ['cat Persian miniature', 'cat painting Persia'], accept: /cat/i, want: ['miniature', 'painting'] },
    div: { q: ['div Shahnameh', 'demon Persian miniature'], accept: /div|demon/i, want: ['shahnameh', 'miniature'] },
    shab: { q: ['Persian night scene miniature', 'night garden Persian painting'], accept: /night|garden/i, want: ['miniature', 'painting'] },
    gol: { q: ['flower vase Persian painting', 'Persian still life flowers'], accept: /flower|vase|blossom/i, want: ['painting', 'miniature'] },
    naneh: { q: ['Persian bread baking painting', 'bread oven miniature'], accept: /bread|baker|oven/i, want: ['painting', 'miniature'] },
};

const SKIP_BOOKS = new Set(['farsi_aval', 'hassan_kachal']);

function buildMonsters() {
    const out = {};
    for (const [book, chapters] of Object.entries(BOOKS.chapters)) {
        if (SKIP_BOOKS.has(book)) continue;
        out[book] = chapters.map(spec => {
            const ov = OVERRIDES[`${book}::${spec.n}`] || {};
            return {
                n: spec.n,
                q: ov.q || spec.q,
                accept: ov.accept || spec.accept,
                want: ov.want || spec.want || [],
                pick: ov.pick || null,
            };
        });
    }
    for (const [book, spec] of Object.entries(FOLKTALES)) {
        out[book] = [{ n: 1, ...spec }];
    }
    return out;
}

module.exports = { MONSTERS: buildMonsters(), OVERRIDES, FOLKTALES };
