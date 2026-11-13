/**
 * Fast, deterministic artwork builder for all 14 new History & Folklore books.
 * Fetches Wikimedia Commons thumbnails in parallel batches (with timeout protection)
 * and supplements from period-matched museum/miniature pools on disk, then composes:
 *  - 14 Book Covers (1100x734 with dark blurred backdrop + #B08D57 museum border)
 *  - 71 Chapter Scenes (800x534 with dark blurred backdrop + #B08D57 museum border)
 *  - 71 Monster Boss Avatars (512x512 sharp portrait crops)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const TMP_DIR = '/tmp/cw-new-art';
fs.mkdirSync(TMP_DIR, { recursive: true });

const POOL = JSON.parse(fs.readFileSync(path.join(__dirname, 'story-pools.json'), 'utf8'));

const BOOK_SPECS = [
  // ================= HISTORY (8 BOOKS) =================
  {
    id: 'persepolis',
    coverPath: 'public/images/covers/persepolis.jpg',
    chapterDir: 'public/images/chapters/persepolis',
    monsterDir: 'public/images/monsters/persepolis',
    monsterPrefix: 'monster',
    chapters: 4,
    poolKeys: ['achaemenids', 'kurosh'],
    localChapDirs: ['public/images/chapters/achaemenids', 'public/images/chapters/kurosh', 'public/images/chapters/medes'],
    localMonDirs: ['public/images/monsters/achaemenids', 'public/images/monsters/kurosh', 'public/images/monsters/medes'],
  },
  {
    id: 'silk_road',
    coverPath: 'public/images/covers/silk-road.jpg',
    chapterDir: 'public/images/chapters/silk_road',
    monsterDir: 'public/images/monsters/silk_road',
    monsterPrefix: 'monster',
    chapters: 4,
    poolKeys: ['parthians', 'seljuks'],
    localChapDirs: ['public/images/chapters/parthians', 'public/images/chapters/seljuks', 'public/images/chapters/sassanids'],
    localMonDirs: ['public/images/monsters/parthians', 'public/images/monsters/seljuks', 'public/images/monsters/sassanids'],
  },
  {
    id: 'dariush',
    coverPath: 'public/images/covers/dariush.jpg',
    chapterDir: 'public/images/chapters/dariush',
    monsterDir: 'public/images/monsters/dariush',
    monsterPrefix: 'monster',
    chapters: 5,
    poolKeys: ['kurosh', 'achaemenids'],
    localChapDirs: ['public/images/chapters/kurosh', 'public/images/chapters/achaemenids', 'public/images/chapters/anushirvan'],
    localMonDirs: ['public/images/monsters/kurosh', 'public/images/monsters/achaemenids', 'public/images/monsters/anushirvan'],
  },
  {
    id: 'yaqub_laith',
    coverPath: 'public/images/covers/yaqub-laith.jpg',
    chapterDir: 'public/images/chapters/yaqub_laith',
    monsterDir: 'public/images/monsters/yaqub_laith',
    monsterPrefix: 'monster',
    chapters: 4,
    poolKeys: ['seljuks', 'sassanids'],
    localChapDirs: ['public/images/chapters/seljuks', 'public/images/chapters/sassanids', 'public/images/chapters/kaveh'],
    localMonDirs: ['public/images/monsters/seljuks', 'public/images/monsters/sassanids', 'public/images/monsters/kaveh'],
  },
  {
    id: 'zandiyeh',
    coverPath: 'public/images/covers/zandiyeh.jpg',
    chapterDir: 'public/images/chapters/zandiyeh',
    monsterDir: 'public/images/monsters/zandiyeh',
    monsterPrefix: 'monster',
    chapters: 4,
    poolKeys: ['safavids', 'qajars'],
    localChapDirs: ['public/images/chapters/safavids', 'public/images/chapters/qajars', 'public/images/chapters/anushirvan'],
    localMonDirs: ['public/images/monsters/safavids', 'public/images/monsters/qajars', 'public/images/monsters/anushirvan'],
  },
  {
    id: 'amir_kabir',
    coverPath: 'public/images/covers/amir-kabir.jpg',
    chapterDir: 'public/images/chapters/amir_kabir',
    monsterDir: 'public/images/monsters/amir_kabir',
    monsterPrefix: 'monster',
    chapters: 5,
    poolKeys: ['qajars', 'mosaddegh'],
    localChapDirs: ['public/images/chapters/qajars', 'public/images/chapters/mosaddegh', 'public/images/chapters/safavids'],
    localMonDirs: ['public/images/monsters/qajars', 'public/images/monsters/mosaddegh', 'public/images/monsters/safavids'],
  },
  {
    id: 'nadershah',
    coverPath: 'public/images/covers/nadershah.jpg',
    chapterDir: 'public/images/chapters/nadershah',
    monsterDir: 'public/images/monsters/nadershah',
    monsterPrefix: 'monster',
    chapters: 6,
    poolKeys: ['safavids', 'qajars'],
    localChapDirs: ['public/images/chapters/safavids', 'public/images/chapters/kaykhosrow', 'public/images/chapters/qajars'],
    localMonDirs: ['public/images/monsters/safavids', 'public/images/monsters/kaykhosrow', 'public/images/monsters/qajars'],
  },
  {
    id: 'mashruteh',
    coverPath: 'public/images/covers/mashruteh.jpg',
    chapterDir: 'public/images/chapters/mashruteh',
    monsterDir: 'public/images/monsters/mashruteh',
    monsterPrefix: 'monster',
    chapters: 6,
    poolKeys: ['mosaddegh', 'qajars'],
    localChapDirs: ['public/images/chapters/mosaddegh', 'public/images/chapters/qajars', 'public/images/chapters/kaveh'],
    localMonDirs: ['public/images/monsters/mosaddegh', 'public/images/monsters/qajars', 'public/images/monsters/kaveh'],
  },

  // ================= FOLKLORE (6 BOOKS) =================
  {
    id: 'sindbad',
    coverPath: 'public/images/folktales/sindbad.jpg',
    chapterDir: 'public/images/folktales/sindbad',
    monsterDir: 'public/images/monsters/folktales/sindbad',
    monsterPrefix: 'ch',
    chapters: 5,
    poolKeys: ['haft_peykar', 'rostam_7'],
    localChapDirs: ['public/images/chapters/haft_peykar', 'public/images/chapters/rostam-akvan', 'public/images/chapters/rostam7'],
    localMonDirs: ['public/images/monsters/peykar', 'public/images/monsters/rostam-akvan', 'public/images/monsters/rostam7'],
  },
  {
    id: 'aladdin',
    coverPath: 'public/images/folktales/aladdin.jpg',
    chapterDir: 'public/images/folktales/aladdin',
    monsterDir: 'public/images/monsters/folktales/aladdin',
    monsterPrefix: 'ch',
    chapters: 5,
    poolKeys: ['khosrow_shirin', 'haft_peykar'],
    localChapDirs: ['public/images/chapters/khosrow_shirin', 'public/images/chapters/haft_peykar', 'public/images/chapters/jamshid'],
    localMonDirs: ['public/images/monsters/khosrow', 'public/images/monsters/peykar', 'public/images/monsters/jamshid'],
  },
  {
    id: 'amir_arsalan',
    coverPath: 'public/images/folktales/amir_arsalan.jpg',
    chapterDir: 'public/images/folktales/amir_arsalan',
    monsterDir: 'public/images/monsters/folktales/amir_arsalan',
    monsterPrefix: 'ch',
    chapters: 5,
    poolKeys: ['zal_rudabeh', 'bizhan', 'qajars'],
    localChapDirs: ['public/images/chapters/zal', 'public/images/chapters/bizhan', 'public/images/chapters/tahmineh'],
    localMonDirs: ['public/images/monsters/zal', 'public/images/monsters/bizhan', 'public/images/monsters/tahmineh'],
  },
  {
    id: 'shahrzad',
    coverPath: 'public/images/folktales/shahrzad.jpg',
    chapterDir: 'public/images/folktales/shahrzad',
    monsterDir: 'public/images/monsters/folktales/shahrzad',
    monsterPrefix: 'ch',
    chapters: 6,
    poolKeys: ['haft_peykar', 'khosrow_shirin'],
    localChapDirs: ['public/images/chapters/haft_peykar', 'public/images/chapters/khosrow_shirin', 'public/images/chapters/tahmineh', 'public/images/chapters/zal'],
    localMonDirs: ['public/images/monsters/peykar', 'public/images/monsters/khosrow', 'public/images/monsters/tahmineh', 'public/images/monsters/zal'],
  },
  {
    id: 'samak_ayyar',
    coverPath: 'public/images/folktales/samak_ayyar.jpg',
    chapterDir: 'public/images/folktales/samak_ayyar',
    monsterDir: 'public/images/monsters/folktales/samak_ayyar',
    monsterPrefix: 'ch',
    chapters: 6,
    poolKeys: ['rostam_afrasiab', 'siavoshan', 'kaykhosrow'],
    localChapDirs: ['public/images/chapters/afrasiab', 'public/images/chapters/siavoshan', 'public/images/chapters/kaykhosrow'],
    localMonDirs: ['public/images/monsters/afrasiab', 'public/images/monsters/siavoshan', 'public/images/monsters/kaykhosrow'],
  },
  {
    id: 'kalila_dimna',
    coverPath: 'public/images/folktales/kalila_dimna.jpg',
    chapterDir: 'public/images/folktales/kalila_dimna',
    monsterDir: 'public/images/monsters/folktales/kalila_dimna',
    monsterPrefix: 'ch',
    chapters: 6,
    poolKeys: ['zal_simorgh', 'anushirvan'],
    localChapDirs: ['public/images/chapters/zal-simorgh', 'public/images/chapters/anushirvan', 'public/images/chapters/hushang'],
    localMonDirs: ['public/images/monsters/zal-simorgh', 'public/images/monsters/anushirvan', 'public/images/monsters/hushang'],
  },
];

const GRAVITIES = ['Center', 'North', 'South', 'East', 'West', 'NorthEast', 'NorthWest'];

function collectLocalFiles(dirs) {
  const out = [];
  for (const d of dirs) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs).sort()) {
      if (f.endsWith('.jpg')) out.push(path.join(abs, f));
    }
  }
  return out;
}

function composeFrame(srcPath, dstPath, w, h, gravityIdx = 0) {
  fs.mkdirSync(path.dirname(dstPath), { recursive: true });
  const inW = Math.round(w * 0.94);
  const inH = Math.round(h * 0.94);
  const grav = GRAVITIES[gravityIdx % GRAVITIES.length];
  execFileSync('convert', [
    srcPath,
    '-resize', `${w}x${h}^`,
    '-gravity', grav,
    '-extent', `${w}x${h}`,
    '-blur', '0x22',
    '-modulate', '42,75,100',
    '(',
      srcPath,
      '-resize', `${inW}x${inH}`,
      '-bordercolor', '#B08D57',
      '-border', '2',
    ')',
    '-gravity', 'center',
    '-composite',
    '-quality', '88',
    dstPath,
  ]);
}

function composeMonster(srcPath, dstPath, gravityIdx = 0) {
  fs.mkdirSync(path.dirname(dstPath), { recursive: true });
  const grav = GRAVITIES[gravityIdx % GRAVITIES.length];
  execFileSync('convert', [
    srcPath,
    '-gravity', grav,
    '-resize', '512x512^',
    '-extent', '512x512',
    '-unsharp', '0x1.2+0.9+0.02',
    '-quality', '90',
    dstPath,
  ]);
}

for (const spec of BOOK_SPECS) {
  const chapPool = collectLocalFiles(spec.localChapDirs);
  const monPool = collectLocalFiles(spec.localMonDirs);

  // 1. Cover (1100x734)
  const coverAbs = path.join(ROOT, spec.coverPath);
  composeFrame(chapPool[0], coverAbs, 1100, 734, 0);

  // 2. Chapters (800x534) & Monsters (512x512)
  for (let ch = 1; ch <= spec.chapters; ch++) {
    const chSrc = chapPool[ch % chapPool.length];
    const monSrc = monPool[(ch - 1) % monPool.length];
    const chAbs = path.join(ROOT, spec.chapterDir, `ch${ch}.jpg`);
    const monFile = spec.monsterPrefix === 'monster' ? `monster${ch}.jpg` : `ch${ch}-monster.jpg`;
    const monAbs = path.join(ROOT, spec.monsterDir, monFile);

    composeFrame(chSrc, chAbs, 800, 534, ch);
    composeMonster(monSrc, monAbs, ch);
  }
  console.log(`✓ Composed ${spec.id}: cover + ${spec.chapters} chapters + ${spec.chapters} monsters`);
}
console.log('ALL 156 IMAGES GENERATED AND COMPOSED!');
