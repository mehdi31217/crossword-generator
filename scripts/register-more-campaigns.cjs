const fs = require('fs');
const path = require('path');

const BOOKS_FILE = path.join(__dirname, '..', 'server', 'local-data', 'story_books.json');
const CHAPTERS_FILE = path.join(__dirname, '..', 'server', 'local-data', 'story_chapters.json');

// Extract word/clue arrays from TypeScript files
function extractWords(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Find all `{ word: "...", clue: "..." }` patterns
  const regex = /\{\s*word:\s*"([^"]+)"\s*,\s*clue:\s*"([^"]+)"\s*\}/g;
  const words = []; const clues = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    words.push({ word: match[1], clue: match[2] });
  }
  return words;
}

// Split words into chapter groups
function splitIntoChapters(words, chapterSizes) {
  const result = []; let idx = 0;
  for (const size of chapterSizes) {
    result.push(words.slice(idx, idx + size));
    idx += size;
  }
  return result;
}

const bookDefs = [
  { id: 'zal_rudabeh', title: 'زال و رودابه', genre: 'epic', author: 'فردوسی',
    desc: 'داستان عشق ممنوعه زال سپیدمو و رودابه زیبا، از تولد زال در آشیانه سیمرغ تا ازدواج و تولد رستم.',
    cover: '/images/covers/zal.svg', diff: 'hard',
    style: { primaryColor: '#8b5cf6', secondaryColor: '#5b21b6', backgroundColor: '#0f0a1a', textColor: '#f5f3ff', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'zalWords.ts', dir: 'zal', chapterSizes: [20,20,20,20,20],
    titles: ['تولد زال', 'بازگشت زال', 'عشق زال و رودابه', 'آزمون عشق', 'ازدواج و تولد رستم'],
    descs: [
      'سام پهلوان صاحب پسری می‌شود که موهایش چون برف سپید است. شرمنده از این پدیده، کودک را در بیابان رها می‌کند. اما سیمرغ افسانه‌ای، نوزاد را یافته به آشیانه خود می‌برد و او را چون فرزند خود پرورش می‌دهد.',
      'سام شبانه در خواب می‌بیند که فرزندش زنده است. پشیمان از کرده خویش، به کوه قاف می‌رود و زال را بازمی‌طلبد. سیمرغ زال را به سام می‌سپارد. زال به زابل بازمی‌گردد و در فنون رزم استاد می‌شود.',
      'زال از زیبایی رودابه، دختر مهراب شاه کابل، می‌شنود و دلداده او می‌شود. پیامی برایش می‌فرستد و رودابه نیز دل به او می‌بندد. دیداری پنهانی در باغ کابل ترتیب می‌دهند و عشقشان ریشه می‌دواند.',
      'رودابه در کاخ پدری زندانیست. شبی زال به بارگاه مهراب نزدیک می‌شود. رودابه گیسوان بلندش را از فراز دیوار آویزان می‌کند تا زال از آن بالا رود و به دیدار معشوق بشتابد.',
      'پس از کش‌وقوس‌های بسیار، خانواده‌ها با ازدواج موافقت می‌کنند. جشنی بزرگ برپا می‌شود و رودابه باردار می‌گردد. نوزادی عظیم‌جثه چون پیل به دنیا می‌آورد که نامش رستم می‌شود.'
    ],
    victories: [
      'زال در آشیانه سیمرغ رشد می‌کند و پرنده مهربان به او خردورزی می‌آموزد. زال از بالای کوه قاف به جهان می‌نگرد و نمی‌داند که روزی به سرزمین پدری بازخواهد گشت.',
      'زال در زابلستان به چابکی و دانایی شهره می‌شود. اما دلش در جستجوی ماجرایی بزرگ‌تر است و سرنوشت او را به سوی کابل می‌کشاند.',
      'زال و رودابه در باغ کابل همدیگر را می‌بینند و عشقشان استوار می‌شود. زال به رودابه قول می‌دهد جز او با هیچ‌کس ازدواج نکند.',
      'زال به بام کاخ می‌رسد و رودابه را در آغوش می‌گیرد. آن دو پیمان می‌بندند تا پایان عمر در کنار هم باشند.',
      'رستم در دامان زال و رودابه رشد می‌کند. چنان نیرومند است که در کودکی گهواره را می‌شکند. زال می‌داند که نام پسرش از نام او و سام فراتر خواهد رفت.'
    ]
  },
  { id: 'arash', title: 'آرش کمانگیر', genre: 'epic', author: 'اسطوره کهن',
    desc: 'حماسه آرش کمانگیر که با پرتاب تیر و فدا کردن جان خود، مرز ایران را تا کنار جیحون کشاند.',
    cover: '/images/covers/arash.svg', diff: 'hard',
    style: { primaryColor: '#f59e0b', secondaryColor: '#92400e', backgroundColor: '#1c1917', textColor: '#fffbeb', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'arashWords.ts', dir: 'arash', chapterSizes: [20],
    titles: ['پرتاب تیر'],
    descs: ['سال‌ها جنگ بین ایران و توران، مردم را خسته کرده. سرانجام دو طرف پیمان می‌بندند هر جا تیری از کمان پهلوانی ایرانی بر زمین نشیند، همان مرز باشد. آرش، تیرانداز ماهر، داوطلب این مأموریت می‌شود و می‌داند باید تمام جان خود را صرف کند.'],
    victories: ['آرش بر فراز دماوند کمان را می‌کشد و با تمام وجود تیر را رها می‌کند. تیر مرز ایران را تا جیحون می‌کشاند اما آرش با پرتاب آن جان می‌سپارد. او با ایثار خود ایران را نجات می‌دهد.']
  },
  { id: 'khosrow_shirin', title: 'خسرو و شیرین', genre: 'epic', author: 'نظامی',
    desc: 'عاشقانه جاودان خسروپرویز و شیرین زیبا، رقابت با فرهاد کوه‌کن و پایان تراژیک این مثلث عشقی.',
    cover: '/images/covers/khosrow.svg', diff: 'hard',
    style: { primaryColor: '#ec4899', secondaryColor: '#9d174d', backgroundColor: '#140a0f', textColor: '#fdf2f8', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'khosrowWords.ts', dir: 'khosrow', chapterSizes: [20,20,20,20,20,20],
    titles: ['خسرو و شیرین', 'ملاقات شیرین', 'فرهاد کوه‌کن', 'رقابت و جدایی', 'مرگ فرهاد', 'پایان تراژیک'],
    descs: [
      'خسروپرویز از زیبایی شیرین، دوشیزه ارمنی می‌شنود و دلداده او می‌شود. با راهنمایی شاپور، نقاشی از چهره شیرین می‌کشد و عشقش صدچندان می‌شود.',
      'خسرو به ارمنستان می‌رود و شیرین را کنار جویباری می‌یابد که گیسوانش را می‌شوید. دیدارشان در باغی پرگل اتفاق می‌افتد و عشقشان آغاز می‌شود.',
      'فرهاد، کوه‌کن نامدار، نیز عاشق شیرین است. خسرو برای دور کردنش از او می‌خواهد کوه بیستون را بتراشد. فرهاد با عشق، کوه را می‌تراشد و پیکر شیرین را در دل سنگ نقش می‌کند.',
      'خسرو به فرهاد رشک می‌برد و کارهای ناممکن از او می‌خواهد. فرهاد همه را انجام می‌دهد اما دلش از جدایی شیرین شکسته است.',
      'خسرو خبر دروغ مرگ شیرین را به فرهاد می‌رساند. فرهاد از غم، خود را از فراز کوه به پایین می‌افکند و جان می‌سپارد.',
      'خسرو و شیرین پس از فرهاد به هم می‌رسند اما پایانی تراژیک در انتظارشان است. شیرین پس از مرگ خسرو، زهر می‌نوشد و به او می‌پیوندد.'
    ],
    victories: [
      'خسرو راهی ارمنستان می‌شود تا شیرین را بیابد. دلش پر از شوق و امید است.',
      'خسرو و شیرین در باغ به هم می‌رسند و دل به هم می‌بازند.',
      'فرهاد در دل کوه بیستون نقش شیرین را می‌تراشد و عشقش را جاودانه می‌کند.',
      'فرهاد همه کارها را انجام می‌دهد اما دلش از غم جدایی می‌سوزد.',
      'فرهاد از فراز کوه به پایین می‌افتد و با عشق شیرین در دل جان می‌سپارد.',
      'شیرین بر بستر خسرو زهر می‌نوشد و در کنار او برای همیشه می‌آرامد.'
    ]
  },
  { id: 'haft_peykar', title: 'هفت پیکر', genre: 'epic', author: 'نظامی',
    desc: 'داستان بهرام گور که هفت گنبد به هفت رنگ برای هفت شاهزاده از هفت اقلیم ساخت و هر شب داستانی شنید.',
    cover: '/images/covers/peykar.svg', diff: 'hard',
    style: { primaryColor: '#06b6d4', secondaryColor: '#0e7490', backgroundColor: '#0a0f14', textColor: '#ecfeff', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'peykarWords.ts', dir: 'peykar', chapterSizes: [20,20,20,20,20],
    titles: ['بهرام گور', 'هفت گنبد', 'داستان‌های شبانه', 'شکار و قدرت', 'پایان بهرام'],
    descs: [
      'بهرام گور در جوانی به شکار و تیراندازی شهره بود. پس از مرگ پدرش یزدگرد، با درایت و شجاعت بر تخت پادشاهی ایران نشست.',
      'بهرام دستور ساخت هفت گنبد به هفت رنگ را داد: سیاه، زرد، سبز، قرمز، آبی، صندل‌رنگ و سپید برای هفت شاهزاده از هفت اقلیم.',
      'هر شب یکی از شاهزادگان برای بهرام داستانی می‌گفت. داستان‌هایی از عشق، خرد، عبرت و ماجراهای شگفت‌انگیز.',
      'بهرام به شکار می‌رفت و با عدالت بر کشور حکومت می‌کرد. او پادشاهی دادگر و توانا بود.',
      'بهرام روزی در تعقیب گوری به شکار رفت و در غاری ناپدید شد. هیچ‌کس او را نیافت و افسانه ناپدیدیش جاودانه شد.'
    ],
    victories: [
      'بهرام با شجاعت و درایت بر تخت نشست و ایران را به آبادانی رساند.',
      'هفت گنبد در کاخ بهرام برافراشته شد و از هر گنبد نوری به رنگ دیگر می‌تابید.',
      'بهرام هر شب از داستان‌ها خرد بیشتری می‌آموخت و بر دانایی‌اش افزوده می‌شد.',
      'بهرام پادشاهی دادگر و توانا بود که همه از او راضی بودند.',
      'بهرام گور به افسانه‌ای جاودان تبدیل شد و نامش در تاریخ ماندگار گردید.'
    ]
  },
  { id: 'kurosh', title: 'کوروش بزرگ', genre: 'education', author: 'تاریخ ایران',
    desc: 'زندگی کوروش بزرگ از تولد تا فتح بابل و نگارش منشور حقوق بشر.',
    cover: '/images/covers/kurosh.svg', diff: 'medium',
    style: { primaryColor: '#f59e0b', secondaryColor: '#b45309', backgroundColor: '#0f0a09', textColor: '#fffbeb', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'kuroshWords.ts', dir: 'kurosh', chapterSizes: [20,20,20,20,20,20],
    titles: ['تولد کوروش', 'جوانی کوروش', 'شورش بر مادها', 'فتح لیدیه', 'فتح بابل', 'ارزش‌های کوروش'],
    descs: [
      'آستیاگ شاه ماد در خواب می‌بیند که سیل از دخترش سراسر آسیا را فرا می‌گیرد. خوابگزاران می‌گویند فرزند او روزی پادشاه جهان می‌شود. آستیاگ دستور مرگ نوزاد را می‌دهد اما هارپاگ کودک را به شبان می‌سپارد.',
      'کوروش در میان چوپانان بزرگ می‌شود و از همان کودکی رهبری طبیعی از خود نشان می‌دهد. او در بازی‌ها پادشاه می‌شد و دیگران را فرمان می‌داد. سرانجام آستیاگ او را می‌شناسد.',
      'کوروش قبایل پارس را متحد می‌کند و علیه آستیاگ قیام می‌کند. در نبرد هگمتانه، سپاه ماد شکست می‌خورد و کوروش پادشاهی ماد را فتح می‌کند.',
      'کرزوس، شاه ثروتمند لیدیه، به جنگ کوروش می‌آید اما شکست می‌خورد. کوروش او را می‌بخشد و از ثروتش برای آبادانی استفاده می‌کند.',
      'کوروش بابل را بدون جنگ فتح می‌کند و یهودیان را از اسارت آزاد می‌سازد. منشور معروف خود را صادر می‌کند که نخستین منشور حقوق بشر جهان است.',
      'کوروش در پاسارگاد آرام می‌گیرد و مقبره‌اش هنوز پابرجاست. منشور او الهام‌بخش نسل‌های متمادی است.'
    ],
    victories: [
      'کوروش توسط شبان نجات می‌یابد و در میان چوپانان رشد می‌کند.',
      'کوروش به جوانی دلیر و باهوش تبدیل می‌شود که همه او را دوست دارند.',
      'کوروش هگمتانه را فتح می‌کند و پادشاهی ماد را سرنگون می‌سازد.',
      'کوروش با بزرگواری کرزوس را می‌بخشد و حکمتش را تحسین می‌کند.',
      'کوروش منشور حقوق بشر را صادر می‌کند و آزادی را به جهان هدیه می‌دهد.',
      'نام کوروش به عنوان بزرگ‌ترین پادشاه تاریخ در دل‌ها جاودانه می‌ماند.'
    ]
  },
  { id: 'mosaddegh', title: 'مصدق و نفت', genre: 'education', author: 'تاریخ معاصر',
    desc: 'نهضت ملی شدن نفت ایران به رهبری دکتر مصدق، از تصویب قانون تا کودتا و میراث ماندگارش.',
    cover: '/images/covers/mosaddegh.svg', diff: 'medium',
    style: { primaryColor: '#10b981', secondaryColor: '#065f46', backgroundColor: '#0a0f0c', textColor: '#ecfdf5', fontFamily: 'serif', backgroundImagePattern: 'https://www.transparenttextures.com/patterns/aged-paper.png' },
    wordFile: 'mosaddeghWords.ts', dir: 'mosaddegh', chapterSizes: [20,20,20,20],
    titles: ['ملی شدن نفت', 'مرداد ۱۳۳۲', 'مقاومت و شکست', 'میراث مصدق'],
    descs: [
      'دکتر مصدق مبارزه برای ملی شدن صنعت نفت را رهبری می‌کند. با حمایت ملت و مجلس، قانون ملی شدن نفت به تصویب می‌رسد و امتیاز نفت از شرکت نفت ایران و انگلیس گرفته می‌شود.',
      'در ۲۸ مرداد ۱۳۳۲، کودتایی به رهبری سازمان سیا و عوامل داخلی علیه دولت مصدق اجرا می‌شود. درگیری در خیابان‌های تهران رخ می‌دهد و مردم به حمایت از مصدق به پا می‌خیزند.',
      'مصدق پس از کودتا دستگیر می‌شود. در دادگاه نظامی از خود دفاع می‌کند و سخنرانی تاریخی خود را ایراد می‌کند. به سه سال زندان و سپس تبعید به کهریزک محکوم می‌شود.',
      'مصدق در کهریزک تا پایان عمر در تنهایی و انزوا می‌ماند. اما راه او الهام‌بخش مبارزان راه آزادی می‌شود. امروز او نماد مبارزه با استعمار در ایران است.'
    ],
    victories: [
      'نفت ایران ملی می‌شود و مصدق به عنوان نخست‌وزیر انتخاب می‌گردد.',
      'مردم در خیابان‌ها مقاومت می‌کنند اما کودتا با پشتیبانی خارجی پیروز می‌شود.',
      'مصدق در دادگاه سخنرانی تاریخی خود را ایراد می‌کند و به تبعید می‌رود.',
      'میراث مصدق در تاریخ ایران زنده می‌ماند و نسل‌های آینده از او الهام می‌گیرند.'
    ]
  }
];

// Read all TS files and extract words
const wordsDir = path.join(__dirname, '..', 'data', 'shahnameh');
const booksJson = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
const chaptersJson = JSON.parse(fs.readFileSync(CHAPTERS_FILE, 'utf8'));

let addedChapters = 0;

for (const bd of bookDefs) {
  if (booksJson.find(b => b.id === bd.id)) {
    console.log(`Book "${bd.id}" exists, skipping.`);
    continue;
  }

  // Extract words from TS file
  const tsPath = path.join(wordsDir, bd.wordFile);
  const allWords = extractWords(tsPath);
  const chapterWords = splitIntoChapters(allWords, bd.chapterSizes);

  // Add book
  booksJson.push({
    id: bd.id, genre: bd.genre, title: bd.title, author: bd.author,
    description: bd.desc, cover_image: bd.cover, difficulty: bd.diff,
    style: bd.style, required_stars: 0, created_at: new Date().toISOString()
  });
  console.log(`Added book: ${bd.title}`);

  // Add chapters
  for (let i = 0; i < bd.titles.length; i++) {
    const nextId = chaptersJson.length > 0 ? Math.max(...chaptersJson.map(c => c.id)) + 1 : 1;
    chaptersJson.push({
      id: nextId,
      book_id: bd.id,
      chapter_order: i + 1,
      chapter_index: i,
      title: bd.titles[i],
      description: bd.descs[i],
      image: `/images/chapters/${bd.dir}/ch${i+1}.svg`,
      victory_text: bd.victories[i],
      monster_avatar: `/images/monsters/${bd.dir}/ch${i+1}-monster.svg`,
      words: chapterWords[i] || [],
      created_at: new Date().toISOString()
    });
    addedChapters++;
  }
  console.log(`  Added ${bd.titles.length} chapters`);
}

fs.writeFileSync(BOOKS_FILE, JSON.stringify(booksJson, null, 2), 'utf8');
fs.writeFileSync(CHAPTERS_FILE, JSON.stringify(chaptersJson, null, 2), 'utf8');

console.log(`\n✅ Server JSON updated: ${booksJson.length} books, ${chaptersJson.length} chapters total (${addedChapters} new)`);
