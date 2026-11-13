/**
 * Assigns every story chapter a boss that belongs to that chapter's content:
 * the antagonist of the story (Afrasiab, Zahhak, the div, the wolf, the fox…)
 * instead of calligraphy pages, buildings, or the hero/object the tale is
 * named after.
 *
 *   node scripts/apply-boss-roster.cjs [--dry]
 *
 * Updates the frontend chapter files, server/local-data/story_chapters.json,
 * and (via sync-story-monsters.js) PostgreSQL.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY = process.argv.includes('--dry');
const M = (p) => `/images/monsters/${p}`;

// Per image-directory roster, one entry per chapter in story order.
const ROSTER = {
  rostam7: [
    ['rostam7/khan1-lion.jpg', 'شیر'],
    ['rostam7/khan2-desert.jpg', 'بیابان بی‌آب'],
    ['rostam7/khan3-dragon.jpg', 'اژدها'],
    ['rostam7/khan4-witch.jpg', 'زن جادوگر'],
    ['rostam7/khan5-warrior.jpg', 'اولاد مرزبان'],
    ['rostam7/khan6-demon.jpg', 'ارژنگ دیو'],
    ['rostam7/khan7-white-beast.jpg', 'دیو سپید'],
  ],
  sohrab: [
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/giant.jpg', 'سهراب'],
    ['sohrab/fate.jpg', 'سهراب'],
  ],
  afrasiab: [
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['afrasiab/monster7.jpg', 'افراسیاب'],
  ],
  siavoshan: [
    ['siavoshan/ch3-monster.jpg', 'سیاوش'],
    ['siavoshan/ch2-monster.jpg', 'سیاوش'],
    ['siavoshan/sudabeh.jpg', 'سودابه'],
    ['siavoshan/ch1-monster.jpg', 'آتش'],
    ['siavoshan/ch5-monster.jpg', 'افراسیاب'],
    ['siavoshan/ch6-monster.jpg', 'فرنگیس'],
    ['siavoshan/slaying.jpg', 'گرسیوز'],
    ['kaykhosrow/ch3-monster.jpg', 'کیخسرو'],
  ],
  bizhan: [
    ['bizhan/ch1-monster.jpg', 'گرازهای ارمان'],
    ['bizhan/ch4-monster.jpg', 'منیژه'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['bizhan/ch3-monster.jpg', 'منیژه'],
    ['bizhan/ch5-monster.jpg', 'رستم'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
  ],
  zal: [
    ['zal/ch5-monster.jpg', 'سیمرغ'],
    ['zal/ch2-monster.jpg', 'زال'],
    ['zal/ch3-monster.jpg', 'رودابه'],
    ['zal/ch1-monster.jpg', 'مهراب'],
    ['zal/ch4-monster.jpg', 'زال و رودابه'],
  ],
  arash: [['arash/ch1-monster.jpg', 'آرش کمانگیر']],
  khosrow_shirin: [
    ['khosrow/ch1-monster.jpg', 'خسرو'],
    ['khosrow/ch3-monster.jpg', 'شیرین'],
    ['khosrow/ch5-monster.jpg', 'فرهاد'],
    ['khosrow/ch6-monster.jpg', 'خسرو'],
    ['khosrow/ch2-monster.jpg', 'فرهاد'],
    ['khosrow/ch4-monster.jpg', 'خسرو'],
  ],
  haft_peykar: [
    ['peykar/ch1-monster.jpg', 'بهرام گور'],
    ['peykar/ch5-monster.jpg', 'هفت گنبد'],
    ['peykar/ch3-monster.jpg', 'باربد'],
    ['peykar/ch2-monster.jpg', 'بهرام گور'],
    ['peykar/ch4-monster.jpg', 'موبد'],
  ],
  kurosh: [
    ['medes/monster4.jpg', 'آستیاگ'],
    ['achaemenids/monster1.jpg', 'کوروش'],
    ['kurosh/ch3-monster.jpg', 'کوروش'],
    ['kurosh/ch4-monster.jpg', 'کرزوس'],
    ['achaemenids/monster3.jpg', 'منشور کوروش'],
    ['kurosh/ch6-monster.jpg', 'آرامگاه کوروش'],
  ],
  mosaddegh: [
    ['mosaddegh/ch1-monster.jpg', 'مصدق'],
    ['mosaddegh/ch3-monster.jpg', 'محمدرضا شاه'],
    ['mosaddegh/ch3-monster.jpg', 'محمدرضا شاه'],
    ['mosaddegh/ch1-monster.jpg', 'مصدق'],
  ],
  zahhak: [
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
  ],
  medes: [
    ['medes/monster1.jpg', 'دیاکو'],
    ['medes/monster2.jpg', 'فرورتیش'],
    ['medes/monster3.jpg', 'هووخشتر'],
    ['medes/monster4.jpg', 'آستیاگ'],
  ],
  achaemenids: [
    ['achaemenids/monster1.jpg', 'کوروش'],
    ['achaemenids/monster5.jpg', 'کوروش'],
    ['achaemenids/monster3.jpg', 'منشور کوروش'],
    ['achaemenids/monster4.jpg', 'داریوش'],
    ['achaemenids/monster5.jpg', 'خشایارشا'],
    ['achaemenids/monster6.jpg', 'اسکندر'],
  ],
  parthians: [
    ['parthians/monster1.jpg', 'مهرداد'],
    ['parthians/monster2.jpg', 'مهرداد دوم'],
    ['parthians/monster4.jpg', 'سورنا'],
    ['sassanids/monster1.jpg', 'اردشیر بابکان'],
  ],
  sassanids: [
    ['sassanids/monster1.jpg', 'اردشیر'],
    ['sassanids/monster2.jpg', 'شاپور'],
    ['anushirvan/ch1-monster.jpg', 'انوشیروان'],
    ['sassanids/monster4.jpg', 'خسرو'],
    ['sassanids/monster5.jpg', 'یزدگرد'],
  ],
  seljuks: [
    ['seljuks/monster1.jpg', 'طغرل'],
    ['seljuks/monster2.jpg', 'آلب ارسلان'],
    ['seljuks/monster3.jpg', 'ملکشاه'],
    ['seljuks/monster4.jpg', 'سلطان سنجر'],
  ],
  safavids: [
    ['safavids/monster1.jpg', 'شیخ صفی'],
    ['safavids/monster2.jpg', 'شاه اسماعیل'],
    ['safavids/monster3.jpg', 'شاه عباس'],
    ['safavids/monster4.jpg', 'شاه اسماعیل'],
    ['safavids/monster5.jpg', 'سلطان حسین'],
  ],
  qajars: [
    ['qajars/monster1.jpg', 'آغا محمدخان'],
    ['qajars/monster2.jpg', 'فتحعلی شاه'],
    ['qajars/monster3.jpg', 'امیرکبیر'],
    ['qajars/monster4.jpg', 'مظفرالدین شاه'],
    ['qajars/monster5.jpg', 'احمد شاه'],
  ],
  kaveh: [
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
  ],
  esfandiyar: [
    ['esfandiyar/ch1-monster.jpg', 'گرگ‌ها'],
    ['rostam7/khan1-lion.jpg', 'شیر'],
    ['rostam7/khan4-witch.jpg', 'زن جادوگر'],
    ['esfandiyar/ch4-monster.jpg', 'مرغ سهمگین'],
    ['esfandiyar/ch5-monster.jpg', 'آتش'],
    ['esfandiyar/ch6-monster.jpg', 'تنگه مرگ'],
    ['rostam7/khan7-white-beast.jpg', 'دیو بزرگ'],
  ],
  'rostam-esfandiyar': [
    ['rostam-esfandiyar/ch1-monster.jpg', 'گشتاسپ'],
    ['rostam-esfandiyar/ch3-monster.jpg', 'اسفندیار'],
    ['rostam-death/ch1-monster.jpg', 'رستم'],
    ['rostam-esfandiyar/ch4-monster.jpg', 'اسفندیار'],
    ['rostam-esfandiyar/ch5-monster.jpg', 'سوگ اسفندیار'],
  ],
  tahmineh: [
    ['tahmineh/ch1-monster.jpg', 'تهمینه'],
    ['tahmineh/ch2-monster.jpg', 'تهمینه'],
    ['tahmineh/ch3-monster.jpg', 'سهراب'],
  ],
  'zal-simorgh': [
    ['zal-simorgh/ch2-monster.jpg', 'سیمرغ'],
    ['zal-simorgh/ch2-monster.jpg', 'سیمرغ'],
    ['zal-simorgh/ch2-monster.jpg', 'سیمرغ'],
    ['zal-simorgh/ch2-monster.jpg', 'سیمرغ'],
    ['zal-simorgh/ch2-monster.jpg', 'سیمرغ'],
  ],
  kaykhosrow: [
    ['kaykhosrow/ch1-monster.jpg', 'کیخسرو'],
    ['kaykhosrow/ch2-monster.jpg', 'افراسیاب'],
    ['kaykhosrow/ch3-monster.jpg', 'افراسیاب'],
    ['afrasiab/ancient-evil.jpg', 'افراسیاب'],
    ['kaykhosrow/ch5-monster.jpg', 'کیخسرو'],
    ['kaykhosrow/ch6-monster.jpg', 'کیخسرو'],
  ],
  'rostam-death': [
    ['rostam-death/ch2-monster.jpg', 'شغاد'],
    ['rostam-death/ch3-monster.jpg', 'چاه'],
    ['rostam-death/ch1-monster.jpg', 'رستم'],
    ['rostam-death/ch4-monster.jpg', 'رخش'],
    ['rostam-death/ch5-monster.jpg', 'سوگ رستم'],
  ],
  'rostam-akvan': [
    ['rostam-akvan/ch3-monster.jpg', 'اکوان دیو'],
    ['rostam-akvan/ch3-monster.jpg', 'اکوان دیو'],
    ['rostam-akvan/ch3-monster.jpg', 'اکوان دیو'],
  ],
  hushang: [
    ['folktales/div/ch1-monster.jpg', 'دیو سیاه'],
    ['hushang/ch2-monster.jpg', 'آتش'],
    ['hushang/ch3-monster.jpg', 'جشن سده'],
  ],
  jamshid: [
    ['jamshid/ch1-monster.jpg', 'جمشید'],
    ['jamshid/ch5-monster.jpg', 'تخت جمشید'],
    ['jamshid/ch3-monster.jpg', 'جمشید'],
    ['zahhak/ch3-monster.jpg', 'ضحاک'],
    ['jamshid/ch4-monster.jpg', 'میراث جمشید'],
  ],
  anushirvan: [
    ['anushirvan/ch1-monster.jpg', 'انوشیروان'],
    ['anushirvan/ch2-monster.jpg', 'بزرگمهر'],
    ['anushirvan/ch3-monster.jpg', 'قیصر روم'],
    ['anushirvan/ch4-monster.jpg', 'ایوان مدائن'],
  ],
  // Folktales: the boss is the story's antagonist (wolf/fox/cat), not the
  // animal or object the tale is named after.
  boz: [['folktales/boz/ch1-monster.jpg', 'گرگ']],
  div: [['folktales/div/ch1-monster.jpg', 'دیو']],
  dokhtar: [['folktales/dokhtar/ch1-monster.jpg', 'دختر نارنج']],
  gol: [['folktales/gol/ch1-monster.jpg', 'گلی']],
  gonjeshk: [['folktales/gonjeshk/ch1-monster.jpg', 'گربه']],
  gorbeh: [['folktales/gorbeh/ch1-monster.jpg', 'روباه']],
  kadoo: [['folktales/kadoo/ch1-monster.jpg', 'گرگ']],
  khaleh: [['folktales/khaleh/ch1-monster.jpg', 'خاله سوسکه']],
  khoros: [['folktales/khoros/ch1-monster.jpg', 'روباه']],
  mahi: [['folktales/mahi/ch1-monster.jpg', 'پلیکان']],
  mosh: [['folktales/mosh/ch1-monster.jpg', 'گربه']],
  naneh: [['folktales/naneh/ch1-monster.jpg', 'نان و نمک']],
  shab: [['folktales/shab/ch1-monster.jpg', 'شب‌های شیرین']],
  shangool: [['folktales/shangool/ch1-monster.jpg', 'گرگ']],
  siah: [['folktales/siah/ch1-monster.jpg', 'سیاه‌زنگی']],
};

// hassan_kachal has no avatar at all in the client fallback file.
const HASSAN = [
  ['folktales/div/ch1-monster.jpg', 'دیو باغ'],
  ['folktales/div/ch1-monster.jpg', 'دیو باغ'],
  ['folktales/div/ch1-monster.jpg', 'دیو باغ'],
];

function dataFiles() {
  const out = [];
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.ts')) out.push(p);
    }
  };
  walk(path.join(ROOT, 'data'));
  return out;
}

let changed = 0;
for (const file of dataFiles()) {
  let text = fs.readFileSync(file, 'utf8');
  const dirs = [...text.matchAll(/image:\s*"\/images\/(?:chapters|folktales)\/([^/"]+)/g)].map(m => m[1]);
  const dir = dirs[0];
  const roster = ROSTER[dir];
  if (!roster) continue;
  const before = text;

  let i = 0;

  // Drop any boss name already attached to an avatar (multi-line form).
  text = text.replace(
    /(^[ \t]*monsterAvatar:[ \t]*"[^"]*",?[ \t]*\r?\n)[ \t]*monsterName:[ \t]*"[^"]*",?[ \t]*\r?\n/gm,
    '$1'
  );

  // Multi-line chapter objects (*Chapters.ts).
  text = text.replace(/^([ \t]*)monsterAvatar:[ \t]*"[^"]*"([ \t]*,)?[ \t]*$/gm, (line, indent, comma) => {
    const entry = roster[i++];
    if (!entry) return line;
    return `${indent}monsterAvatar: "${M(entry[0])}",\n${indent}monsterName: "${entry[1]}"${comma ? ',' : ''}`;
  });

  // Inline chapter objects (*Words.ts) keep the whole chapter on one line.
  text = text.replace(/monsterAvatar:[ \t]*"[^"]*"(?=[ \t]*,[^\n])/g, (match) => {
    const entry = roster[i++];
    if (!entry) return match;
    return `monsterAvatar: "${M(entry[0])}", monsterName: "${entry[1]}"`;
  });

  if (text !== before) {
    if (!DRY) fs.writeFileSync(file, text);
    console.log('+', path.relative(ROOT, file), `${i} avatars`);
    changed++;
  }
  const expected = dir === 'hassan' ? HASSAN.length : roster.length;
  if (i !== expected) console.warn(`! ${file}: replaced ${i} of ${expected}`);
}

// Hassan Kachal's chapters live inline in data/campaigns.ts.
{
  const p = path.join(ROOT, 'data/campaigns.ts');
  let text = fs.readFileSync(p, 'utf8');
  const before = text;
  text = text.replace(
    /(^[ \t]*image:[ \t]*"\/images\/chapters\/hassan\/[^"]+",?[^\n]*\r?\n)(?:[ \t]*monsterAvatar:[^\n]*\r?\n[ \t]*monsterName:[^\n]*\r?\n)+/gm,
    '$1'
  );
  let j = 0;
  text = text.replace(/^([ \t]*)(image:[ \t]*"\/images\/chapters\/hassan\/[^"]+",[^\n]*)$/gm, (line, indent) => {
    const entry = HASSAN[j++];
    if (!entry) return line;
    return `${line}\n${indent}monsterAvatar: "${M(entry[0])}",\n${indent}monsterName: "${entry[1]}",`;
  });
  if (text !== before) {
    if (!DRY) fs.writeFileSync(p, text);
    console.log('+ data/campaigns.ts', `${j} avatars`);
    changed++;
  }
  if (j !== HASSAN.length) console.warn(`! data/campaigns.ts: replaced ${j} of ${HASSAN.length}`);
}

// JSON seed used by PostgreSQL.
const jsonPath = path.join(ROOT, 'server/local-data/story_chapters.json');
const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const BOOK_DIR = {
  rostam_7: 'rostam7', hassan_kachal: 'hassan', rostam_sohrab: 'sohrab',
  rostam_afrasiab: 'afrasiab', siavoshan: 'siavoshan', bizhan: 'bizhan',
  zal_rudabeh: 'zal', arash: 'arash', khosrow_shirin: 'khosrow_shirin',
  haft_peykar: 'haft_peykar', kurosh: 'kurosh', mosaddegh: 'mosaddegh',
  zahhak: 'zahhak', medes: 'medes', achaemenids: 'achaemenids',
  parthians: 'parthians', sassanids: 'sassanids', seljuks: 'seljuks',
  safavids: 'safavids', qajars: 'qajars', kaveh: 'kaveh',
  esfandiyar: 'esfandiyar', rostam_esfandiyar: 'rostam-esfandiyar',
  tahmineh: 'tahmineh', zal_simorgh: 'zal-simorgh', kaykhosrow: 'kaykhosrow',
  rostam_death: 'rostam-death', rostam_akvan: 'rostam-akvan',
  hushang: 'hushang', jamshid: 'jamshid', anushirvan: 'anushirvan',
};
let jsonChanged = 0;
for (const row of rows) {
  const dir = BOOK_DIR[row.book_id] || row.book_id;
  const roster = dir === 'hassan' ? HASSAN : ROSTER[dir];
  if (!roster) continue;
  const entry = roster[Number(row.chapter_index) - 1];
  if (!entry) continue;
  const avatar = M(entry[0]);
  if (row.monster_avatar !== avatar || row.monster_name !== entry[1]) {
    row.monster_avatar = avatar;
    row.monster_name = entry[1];
    jsonChanged++;
  }
}
if (!DRY) fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));
console.log(`\n${DRY ? 'would update' : 'updated'} ${changed} data files, ${jsonChanged} JSON rows`);
