/**
 * Fix bad clues where the answer word appears in the clue itself.
 * Also fixes non-engaging clues to be more story-relevant.
 * Run: node scripts/fix-clues.cjs
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..');
const SHAHNAMEH_DIR = path.join(DIR, 'data/shahnameh');
const SERVER_JSON = path.join(DIR, 'server/local-data/story_chapters.json');

// ---- Replacement rules: [file, word, oldClue, newClue] ----
// Each rule applies to a specific word in a specific file
const rules = [
  // ===== khan1.ts (Rostam 7 ch1) =====
  ['khan1.ts', 'یار', 'دوست و همراه (رخش یار رستم بود)', 'رخش برای رستم در نبرد با شیر چه بود'],

  // ===== khan3.ts (Rostam 7 ch3) =====
  ['khan3.ts', 'خواب', 'استراحت با چشم بسته (رستم دوباره خوابید)', 'حالتی که رستم بعد از خوردن کباب گورخر به آن فرو رفت'],
  ['khan3.ts', 'ترس', 'وحشت (اژدها می‌خواست رستم را بترساند)', 'احساسی که اژدها می‌خواست در رستم ایجاد کند'],

  // ===== khan4.ts (Rostam 7 ch4) =====
  ['khan4.ts', 'رنگ', 'رخسار (رنگ صورت جادوگر سیاه شد)', 'ویژگی صورت جادوگر که پس از بطلان طلسم دگرگون شد'],

  // ===== khan5.ts (Rostam 7 ch5) =====
  ['khan5.ts', 'تاریک', 'بدون نور (رستم در تاریکی به دشتی رسید)', 'محیطی که رستم نیمه‌شب وارد آن شد و چیزی نمی‌دید'],
  ['khan5.ts', 'شب', 'زمان تاریکی (رستم در شب حمله نکرد)', 'وقتی خورشید غروب می‌کند و ماه در آسمان است'],
  ['khan5.ts', 'کشت', 'مزرعه (رستم رخش را در کشتزار رها کرد)', 'زمینی که در آن گندم یا جو می‌کارند'],
  ['khan5.ts', 'نام', 'اسم (اولاد نام رستم را پرسید)', 'چیزی که هر کس دارد و با آن شناخته می‌شود'],
  ['khan5.ts', 'فرار', 'گریختن (سپاه اولاد فرار کردند)', 'واکنش سپاه اولاد بعد از دیدن قدرت رستم'],
  ['khan5.ts', 'شاه', 'پادشاه (رستم وعده داد اولاد را شاه کند)', 'مقامی که رستم به اولاد وعده داد'],
  ['khan5.ts', 'بند', 'طناب (رستم اولاد را در بند کرد)', 'وسیله‌ای که رستم با آن اولاد را بست و به درخت محکم کرد'],

  // ===== khan6.ts (Rostam 7 ch6) =====
  ['khan6.ts', 'سر', 'کله (رستم سر دیو را کند)', 'بالاترین عضو بدن که رستم از تن ارژنگ جدا کرد'],
  ['khan6.ts', 'شهر', 'منطقه مسکونی (به سمت شهر مازندران رفتند)', 'مقصد بعدی رستم پس از پیروزی بر ارژنگ'],

  // ===== khan7.ts (Rostam 7 ch7) =====
  ['khan7.ts', 'دست', 'رستم یک دست دیو را قطع کرد', 'اندام بالایی دیو که اولین بار در نبرد با رستم از تن جدا شد'],
  ['khan7.ts', 'جان', 'زندگی (رستم جان دیو را گرفت)', 'چیزی که رستم با شکست دیو از او گرفت'],
  ['khan7.ts', 'چشم', 'عضو بینایی (چشم کیکاووس نابینا بود)', 'عضو حساس صورت که کیکاووس آن را در بند دیو از دست داده بود'],
  ['khan7.ts', 'شاه', 'پادشاه (کیکاووس در زندان بود)', 'مقام کیکاووس که دیو او را به بند کشیده بود'],
  ['khan7.ts', 'پا', 'رستم پای دیو را هم قطع کرد', 'اندام پایینی که دیو پس از دست در نبرد با رستم از دست داد'],

  // ===== sohrabWords.ts =====
  ['sohrabWords.ts', 'راه', 'رستم پیاده به سوی سمنگان به راه افتاد', 'مسیری که رستم برای یافتن اسبش طی کرد'],
  ['sohrabWords.ts', 'شاه', 'تهمینه دختر شاه سمنگان بود', 'لقب پدر تهمینه که بر سمنگان حکومت می‌کرد'],
  ['sohrabWords.ts', 'کاخ', 'رستم وارد کاخ شاه سمنگان شد', 'محل زندگی شاه و تهمینه که رستم مهمانشان شد'],
  ['sohrabWords.ts', 'شب', 'رستم یک شب در سمنگان ماند', 'مدت اقامت رستم در سمنگان قبل از رفتن'],
  ['sohrabWords.ts', 'زین', 'رستم زین را بر پشت رخش گذاشت', 'وسیله چرمی روی اسب که رستم سوار شد'],

  // ===== afrasiabWords.ts =====
  ['afrasiabWords.ts', 'دشت', 'نبرد رستم و افراسیاب در دشت began', 'محل نبرد میان رستم و افراسیاب'],
  ['afrasiabWords.ts', 'گردن', 'رستم گردن ... دشمن را زد', 'محل ضربه نیزه رستم به دشمن در نبرد'],
  ['afrasiabWords.ts', 'خون', 'زمین ازخون دشمن رنگین شد', 'مایع قرمزی که در میدان نبرد جاری شد'],
  ['afrasiabWords.ts', 'خنجر', 'ضحاک بر دوش‌اش مار داشت از ... خنجر', 'جای ضربه‌ای که بر دوش ضحاک زده شد'],
  ['afrasiabWords.ts', 'دروغ', 'افراسیاب به پیمان خود وفا نکرد و... زد', 'سخن نادرست که افراسیاب به آن متوسل شد'],
  ['afrasiabWords.ts', 'خاک', 'رستم دشمن را به ... نشاند', 'چیزی که صورت دشمن بعد از شکست به آن مالیده شد'],

  // ===== siavoshanWords.ts =====
  ['siavoshanWords.ts', 'شاه', 'پدر سیاوش و پادشاه ایران', 'مقام کیکاووس که سیاوش پسر او بود'],
  ['siavoshanWords.ts', 'نو', 'نوزادی که تازه به دنیا آمده', 'تازه‌متولدشده (سیاوش وقتی به دنیا آمد)'],
  ['siavoshanWords.ts', 'ناز', 'سیاوش در ناز و نعمت بزرگ شد', 'نوع پرورش شاهزاده‌ای که همه او را دوست داشتند'],
  ['siavoshanWords.ts', 'فریب', 'سودابه با آن خواست سیاوش را بفریبد', 'نیرنگی که سودابه برای گول زدن سیاوش به کار برد'],

  // ===== khosrowWords.ts =====
  ['khosrowWords.ts', 'امید', 'فرهاد امید داشت روزی به شیرین برسد', 'احساسی که فرهاد را زنده نگه داشته بود'],

  // ===== peykarWords.ts =====
  ['peykarWords.ts', 'می', 'بهرام در جشن‌هایش از آن می‌نوشید', 'نوشیدنی که در جشن‌های بهرام جاری بود'],

  // ===== kuroshWords.ts =====
  ['kuroshWords.ts', 'نهان', 'کوروش را از دید آستیاگ پنهان نگه داشتند', 'وضعیت کوروش وقتی از دید پدربزرگش مخفی بود'],
  ['kuroshWords.ts', 'گنج', 'کرزوس گنجینه خود را به کوروش تقدیم کرد', 'ثروت انباشته شده که کرزوس به کوروش داد'],
];

// ---- Fix source .ts files ----
console.log('Fixing .ts source files...');
let fixedCount = 0;
rules.forEach(([file, word, oldClue, newClue]) => {
  const filePath = path.join(SHAHNAMEH_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${file} not found`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Find the exact word+clue pattern and replace
  // Pattern: { word: "word", clue: "oldClue" }
  const escapedOld = oldClue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(word:\\s*['"]${word}['"][^}]*clue:\\s*['"])${escapedOld}(['"])`, 'g');
  const newContent = content.replace(regex, `$1${newClue}$2`);
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    fixedCount++;
    console.log(`  [FIX] ${file}: ${word}`);
  } else {
    console.log(`  [MISS] ${file}: ${word} not found (clue might differ)`);
  }
});
console.log(`Fixed ${fixedCount} source .ts files.`);

// ---- Fix server JSON ----
console.log('\nFixing server story_chapters.json...');
let serverJson = JSON.parse(fs.readFileSync(SERVER_JSON, 'utf8'));
let jsonFixed = 0;

serverJson.forEach(ch => {
  if (!ch.words) return;
  ch.words.forEach(w => {
    // Find matching rule
    rules.forEach(([file, word, oldClue, newClue]) => {
      // Match by book_id + word + oldClue
      const bookMap = {
        'khan1.ts': 'rostam_7',
        'khan3.ts': 'rostam_7',
        'khan4.ts': 'rostam_7',
        'khan5.ts': 'rostam_7',
        'khan6.ts': 'rostam_7',
        'khan7.ts': 'rostam_7',
        'sohrabWords.ts': 'rostam_sohrab',
        'afrasiabWords.ts': 'rostam_afrasiab',
        'siavoshanWords.ts': 'siavoshan',
        'khosrowWords.ts': 'khosrow_shirin',
        'peykarWords.ts': 'haft_peykar',
        'kuroshWords.ts': 'kurosh',
      };
      // For hassan_kachal and farsi_aval (inline in campaigns.ts)
      if (file === 'khan1.ts') {
        // ch1 corresponds to id=1 for rostam_7
        // khan1 = rostam_7 ch1 (chapter_index 1)
        if (ch.book_id === 'rostam_7' && w.word === word && w.clue === oldClue) {
          w.clue = newClue;
          jsonFixed++;
        }
      } else {
        if (bookMap[file]) {
          // Match chapter_index for multi-chapter books
          const chIndex = parseInt(file.match(/khan(\d)/)?.[1] || '0');
          if (ch.book_id === bookMap[file] && w.word === word && w.clue === oldClue) {
            w.clue = newClue;
            jsonFixed++;
          }
        }
      }
    });
  });
});

// Also fix farsi_aval inline clues
serverJson.forEach(ch => {
  if (!ch.words || ch.book_id !== 'farsi_aval') return;
  ch.words.forEach(w => {
    if (w.word === 'بام' && w.clue === 'پشت‌بام خانه') {
      w.clue = 'بالاترین بخش خانه که بالای سرتان است';
      jsonFixed++;
    }
    if (w.word === 'نان' && w.clue === 'برکت سفره که نانوا می‌پزد') {
      w.clue = 'برکت سفره که با آرد پخته می‌شود';
      jsonFixed++;
    }
    if (w.word === 'ندار' && w.clue === 'فقیر (کسی که ندارد)') {
      w.clue = 'کسی که پول و دارایی کافی ندارد';
      jsonFixed++;
    }
  });
});

// Fix rostam_afrasiab ch3 (chapter_index 3)
serverJson.forEach(ch => {
  if (!ch.words || ch.book_id !== 'rostam_afrasiab') return;
  ch.words.forEach(w => {
    if (w.word === 'اهریمن' && w.clue.includes('اهریمنی')) {
      w.clue = 'نیروی شر و پلیدی در باور ایرانیان باستان';
      jsonFixed++;
    }
  });
});

fs.writeFileSync(SERVER_JSON, JSON.stringify(serverJson, null, 2));
console.log(`Fixed ${jsonFixed} clues in story_chapters.json.`);
console.log('\nDone! Run npm run build to verify.');
