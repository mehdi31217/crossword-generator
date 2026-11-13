import { WorldMapChapter } from '../../types';

// ─── LUKA MODRIĆ (کرواسی) ─────────────────────────────
// 4 فصل از زندگی هافبک افسانه‌ای رئال مادرید

export const MODRIC_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'modric_zadar',
    legendId: 'modric',
    chapterIndex: 0,
    title: { fa: 'کودکی در زادار', en: 'Childhood in Zadar' },
    subtitle: { fa: 'جنگ، پناهندگی و یک توپ', en: 'War, refuge and a ball' },
    story: {
      fa: `لوکا مودریچ در ۹ سپتامبر ۱۹۸۵ در شهر زادار کرواسی به دنیا آمد؛ زمانی که کرواسی هنوز بخشی از یوگسلاوی بود. خانواده‌اش در یک خانه‌ی ساده در روستای مودریچی زندگی می‌کردند و پدربزرگش، لوکا، بزرگ‌ترین مشوق او بود.

با آغاز جنگ استقلال کرواسی، زندگی این خانواده زیر و رو شد. پدربزرگش در جریان جنگ کشته شد و خانواده مجبور شد خانه‌شان را ترک کند. آن‌ها به‌عنوان پناهنده در هتلی در زادار اسکان یافتند و لوکای کوچک بیشتر روزها را در پارکینگ هتل با توپ می‌گذراند.

لاغری و جثه‌ی کوچکش باعث می‌شد مربیان اول به او شک کنند، اما هوش و تکنیکش چنان بود که خیلی زود به تیم جوانان زادار و سپس به دینامو زاگرب راه یافت. هیچ‌کس آن پسر پناهنده را باور نمی‌کرد، جز خودش.`,
      en: `Luka Modrić was born on September 9, 1985 in the town of Zadar, Croatia — back when Croatia was still part of Yugoslavia. His family lived in a simple house in the village of Modrići, and his grandfather Luka was his greatest supporter.

With the outbreak of the Croatian War of Independence, the family's life was turned upside down. His grandfather was killed in the war and the family had to leave their home. They were housed as refugees in a hotel in Zadar, where young Luka spent most of his days playing with a ball in the hotel parking lot.

His slim, small frame made coaches doubt him at first, but his intelligence and technique were such that he soon joined the Zadar youth team and then Dinamo Zagreb. Nobody believed in that refugee boy — except himself.`
    },
    victoryText: {
      fa: 'در پارکینگ هتل، میان سایه‌ی جنگ، توپ را رها نمی‌کنی. تو با همان توپ کهنه یاد می‌گیری که هیچ شرایطی نمی‌تواند رویا را از تو بگیرد. از زادار، راه یک افسانه آغاز می‌شود.',
      en: 'In the hotel parking lot, amid the shadow of war, you never let go of the ball. With that old ball you learn that no circumstance can take your dream away. From Zadar, a legend\'s road begins.'
    },
    year: '1985-2001',
    words: [
      { word: 'زادار', clue: 'شهری در کرواسی که مودریچ در آن به دنیا آمد' },
      { word: 'پناهنده', clue: 'وضعیت خانواده مودریچ پس از ترک خانه در جنگ' },
      { word: 'پدربزرگ', clue: 'بزرگ‌ترین مشوق مودریچ که در جنگ کشته شد' },
      { word: 'توپ', clue: 'چیزی که مودریچ در پارکینگ هتل با آن بازی می‌کرد' },
      { word: 'هتل', clue: 'محل اسکان پناهندگان خانواده مودریچ در زادار' },
      { word: 'جنگ', clue: 'رویدادی که زندگی خانواده مودریچ را زیر و رو کرد' },
      { word: 'پارکینگ', clue: 'جایی که مودریچ بیشتر روزها در آن با توپ بازی می‌کرد' },
      { word: 'لاغر', clue: 'جثه‌ای که باعث شک مربیان به مودریچ می‌شد' },
      { word: 'هوش', clue: 'ویژگی بازی مودریچ که از کودکی چشمگیر بود' },
      { word: 'کرواسی', clue: 'کشور زادگاه مودریچ' },
    ],
    bgEmoji: '🇭🇷',
  },
  {
    id: 'modric_dinamo',
    legendId: 'modric',
    chapterIndex: 1,
    title: { fa: 'از دینامو تا تاتنهام', en: 'From Dinamo to Tottenham' },
    subtitle: { fa: 'بالاخره دیده شد', en: 'Finally seen' },
    story: {
      fa: `مودریچ در دینامو زاگرب به بازیکنی کامل تبدیل شد. او با دینامو سه بار پیاپی قهرمان لیگ کرواسی شد و در سال ۲۰۰۷ جایزه‌ی بهترین بازیکن لیگ کرواسی را گرفت. سبک بازی‌اش — پاس‌های دقیق، دید بالا و توانایی حفظ توپ — توجه اروپا را جلب کرد.

در سال ۲۰۰۸، باشگاه تاتنهام او را به لیگ برتر انگلیس آورد. انتقالی که برای برخی ریسکی به نظر می‌رسید، به یکی از هوشمندانه‌ترین خریدهای تاریخ تاتنهام تبدیل شد. مودریچ در مرکز زمین مثل یک معمار عمل می‌کرد و بازی را می‌ساخت.

او چهار فصل در تاتنهام ماند و در سال ۲۰۱۲، در حالی که باشگاه‌های بزرگ به دنبالش بودند، راهی رئال مادرید شد. هواداران تاتنهام او را هرگز فراموش نکردند.`,
      en: `At Dinamo Zagreb, Modrić became a complete player. He won the Croatian league three times in a row and in 2007 was named the league's best player. His style — precise passing, high vision and the ability to keep the ball — drew Europe's attention.

In 2008, Tottenham brought him to the English Premier League. A transfer some considered a risk became one of the smartest buys in Tottenham's history. Modrić operated in the centre of the pitch like an architect, building the game.

He stayed four seasons at Tottenham and in 2012, with the giants chasing him, moved to Real Madrid. Tottenham fans never forgot him.`
    },
    victoryText: {
      fa: 'پاس‌هایت در مرکز زمین مثل شعر جریان می‌گیرد و تاتنهام را به خانه‌ی جدیدت تبدیل می‌کنی. از اینجا راه به‌سوی قله‌ی فوتبال جهان باز می‌شود.',
      en: 'Your passes flow through midfield like poetry and Tottenham becomes your new home. From here, the road to the summit of world football opens.'
    },
    year: '2001-2012',
    words: [
      { word: 'دینامو', clue: 'باشگاه کروات که مودریچ را به بازیکنی کامل تبدیل کرد' },
      { word: 'زاگرب', clue: 'شهر باشگاه دینامو' },
      { word: 'تاتنهام', clue: 'باشگاه انگلیسی که مودریچ در ۲۰۰۸ به آن پیوست' },
      { word: 'پاس', clue: 'مهارت اصلی مودریچ در مرکز زمین' },
      { word: 'معمار', clue: 'نقشی که مودریچ در مرکز زمین داشت' },
      { word: 'لیگ', clue: 'مودریچ سه بار پیاپی این عنوان را با دینامو برد' },
      { word: 'انگلیس', clue: 'کشوری که لیگ برتر آن مقصد بعدی مودریچ بود' },
      { word: 'دید', clue: 'ویژگی بازی مودریچ که توجه اروپا را جلب کرد' },
      { word: 'وسط', clue: 'ناحیه‌ای از زمین که مودریچ در آن بازی می‌کرد' },
      { word: 'رئال', clue: 'باشگاهی که مودریچ در ۲۰۱۲ راهی آن شد' },
    ],
    bgEmoji: '⚽',
  },
  {
    id: 'modric_real',
    legendId: 'modric',
    chapterIndex: 2,
    title: { fa: 'معمار رئال مادرید', en: 'The Architect of Real Madrid' },
    subtitle: { fa: 'پنج لیگ قهرمانان و یک توپ طلا', en: 'Five Champions Leagues and a Ballon d\'Or' },
    story: {
      fa: `در رئال مادرید، مودریچ به قلب تپنده‌ی تیمی تبدیل شد که تاریخ‌ساز شد. او با رئال پنج بار لیگ قهرمانان اروپا را فتح کرد؛ از جمله سه قهرمانی متوالی در سال‌های ۲۰۱۶ تا ۲۰۱۸ که در دوران مدرن بی‌سابقه بود.

سبک بازی او تغییری در مفهوم هافبک مدرن ایجاد کرد: نه گلزن، نه فقط تخریب‌کننده، بلکه مغزی که آهنگ بازی را تنظیم می‌کرد. پاس‌های بیرون پای او به امضای بازی‌اش تبدیل شد.

در سال ۲۰۱۸، مودریچ با شکستن هژمونی ده‌ساله‌ی مسی و رونالدو، توپ طلا را برد و به نخستین بازیکن کروات تاریخ تبدیل شد که این جایزه را می‌گیرد. همچنین عنوان بهترین بازیکن جهان فیفا را از آن خود کرد.`,
      en: `At Real Madrid, Modrić became the beating heart of a team that made history. He won the Champions League five times with Real, including three consecutive titles from 2016 to 2018 — unprecedented in the modern era.

His style redefined the modern midfielder: neither a scorer nor merely a destroyer, but the brain that set the tempo of the game. His outside-of-the-boot passes became the signature of his play.

In 2018, breaking the decade-long dominance of Messi and Ronaldo, Modrić won the Ballon d'Or and became the first Croatian player ever to claim it. He also took FIFA's Best Player award.`
    },
    victoryText: {
      fa: 'در برنابئو، بازی را مثل یک ارکستر رهبری می‌کنی. سه جام اروپایی پیاپی، و سپس توپ طلایی که هژمونی ده‌ساله را می‌شکند. جهان می‌فهمد که مغز بازی، خودِ تو هستی.',
      en: 'At the Bernabéu you conduct the game like an orchestra. Three European titles in a row, and then the Ballon d\'Or that breaks a decade of dominance. The world understands that the brain of the game is you.'
    },
    year: '2012-2018',
    words: [
      { word: 'برنابئو', clue: 'ورزشگاه خانه‌ی رئال مادرید' },
      { word: 'اروپا', clue: 'مودریچ پنج بار قهرمانی این قاره را با رئال برد' },
      { word: 'توپ', clue: 'مودریچ در ۲۰۱۸ جایزه‌ی طلای این را برد' },
      { word: 'هافبک', clue: 'پستی که مودریچ مفهوم مدرن آن را تغییر داد' },
      { word: 'مغز', clue: 'نقش مودریچ در تیم؛ تنظیم‌کننده‌ی آهنگ بازی' },
      { word: 'کروات', clue: 'ملیتی که مودریچ نخستین برنده‌ی توپ طلای آن شد' },
      { word: 'مسی', clue: 'ستاره‌ای که مودریچ هژمونی‌اش را در توپ طلا شکست' },
      { word: 'تمپو', clue: 'آهنگ بازی که مودریچ آن را تنظیم می‌کرد' },
      { word: 'متوالی', clue: 'سه قهرمانی پیاپی رئال در لیگ قهرمانان' },
      { word: 'پاس', clue: 'امضای بازی مودریچ، به‌ویژه نوع بیرون پای او' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'modric_legacy',
    legendId: 'modric',
    chapterIndex: 3,
    title: { fa: 'کاپیتان نسل طلایی', en: 'Captain of the Golden Generation' },
    subtitle: { fa: 'رکوردها و میراث', en: 'Records and legacy' },
    story: {
      fa: `مودریچ کاپیتان تیمی شد که در جام جهانی ۲۰۱۸ روسیه تا فینال رفت. کرواسی، کشوری کوچک با جمعیتی کمتر از چهار میلیون نفر، با رهبری او به بزرگ‌ترین افتخار تاریخ فوتبالش رسید. مودریچ در همان جام توپ طلای بهترین بازیکن را گرفت.

او رکوردها را یکی‌یکی جابه‌جا کرد: مسن‌ترین گلزن تاریخ یورو، پرافتخارترین بازیکن تاریخ رئال مادرید، و یکی از معدود بازیکنانی که بیش از ۱۸۰ بازی ملی پوشیده است.

در سال ۲۰۲۳، کرواسی با مودریچ به فینال لیگ ملت‌های اروپا رسید و او همچنان در ۳۸ سالگی قلب تیم بود. داستان مودریچ نشان داد که پشتکار و هوش می‌تواند از هر مانعی عبور کند.`,
      en: `Modrić captained a team that reached the 2018 World Cup final in Russia. Croatia, a small nation of fewer than four million people, reached the greatest honor in its football history under his leadership. Modrić took the Golden Ball as the tournament's best player.

He broke records one by one: the oldest scorer in Euros history, the most decorated player in Real Madrid's history, and one of the few players to earn more than 180 caps.

In 2023, Croatia with Modrić reached the Nations League final and he was still the team's heart at 38. Modrić's story showed that perseverance and intelligence can overcome any obstacle.`
    },
    victoryText: {
      fa: 'پیراهن کرواسی را با غرور می‌پوشی و کشوری کوچک را به فینال جهان می‌رسانی. در ۳۸ سالگی هنوز قلب تیمی؛ ثابت کردی که افسانه‌ها پیری نمی‌شناسند.',
      en: 'You wear Croatia\'s shirt with pride and take a small nation to a world final. At 38 you are still the heart of the team; you proved that legends do not age.'
    },
    year: '2018-2024',
    words: [
      { word: 'کاپیتان', clue: 'نقش مودریچ در تیم ملی کرواسی' },
      { word: 'روسیه', clue: 'کشوری که جام جهانی ۲۰۱۸ در آن برگزار شد' },
      { word: 'فینال', clue: 'مرحله‌ای که کرواسی در ۲۰۱۸ به آن رسید' },
      { word: 'رکورد', clue: 'مودریچ آن‌ها را یکی‌یکی جابه‌جا کرد' },
      { word: 'یورو', clue: 'تورنمنتی که مودریچ مسن‌ترین گلزن تاریخ آن شد' },
      { word: 'کرواسی', clue: 'کشوری که مودریچ کاپیتانش بود' },
      { word: 'پیراهن', clue: 'مودریچ بیش از ۱۸۰ بار پیراهن ملی این را پوشید' },
      { word: 'ملت', clue: 'لیگ ...‌های اروپا؛ تورنمنتی که کرواسی در ۲۰۲۳ فینالیستش شد' },
      { word: 'قلب', clue: 'نقش مودریچ در تیم حتی در ۳۸ سالگی' },
      { word: 'میراث', clue: 'آنچه مودریچ به‌عنوان هافبک افسانه‌ای باقی گذاشت' },
    ],
    bgEmoji: '🥇',
  },
];

// ─── MOHAMED SALAH (مصر) ──────────────────────────────
// 4 فصل از زندگی پادشاه آنفیلد

export const SALAH_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'salah_nagrig',
    legendId: 'salah',
    chapterIndex: 0,
    title: { fa: 'پسری از نگریگ', en: 'A Boy from Nagrig' },
    subtitle: { fa: 'روستایی در دلتای نیل', en: 'A village in the Nile Delta' },
    story: {
      fa: `محمد صلاح در ۱۵ ژوئن ۱۹۹۲ در روستای کوچک نگریگ در استان غربیه مصر به دنیا آمد. خانواده‌اش متوسط و ساده بودند و پدرش کارمند بود. صلاح از کودکی عاشق فوتبال بود و هر روز با دوستانش در زمین‌های خاکی روستا بازی می‌کرد.

او برای تمرین در باشگاه المقاولون العرب، مجبور بود روزانه چند ساعت با اتوبوس بین روستا و قاهره رفت‌وآمد کند. بسیاری از پسران در این مسیر خسته می‌شدند و رها می‌کردند، اما صلاح هرگز تسلیم نشد.

در ۱۴ سالگی به آکادمی المقاولون العرب پیوست و خیلی زود در تیم بزرگسالان این باشگاه بازی کرد. مردمی که او را در آن اتوبوس‌های طولانی دیده بودند، می‌دانستند که این پسر برای چیزهای بزرگی ساخته شده است.`,
      en: `Mohamed Salah was born on June 15, 1992 in the small village of Nagrig in Egypt's Gharbia governorate. His family was modest and ordinary, and his father was an employee. Salah loved football from childhood and played every day with his friends on the village's dirt fields.

To train at the El Mokawloon club, he had to commute several hours daily by bus between the village and Cairo. Many boys gave up on this road out of exhaustion, but Salah never surrendered.

At 14 he joined El Mokawloon's academy and soon played for the club's senior team. The people who had seen him on those long bus rides knew this boy was built for great things.`
    },
    victoryText: {
      fa: 'هر روز ساعتها در اتوبوس می‌نشینی تا به تمرین برسی، اما لبخند از لبت نمی‌رود. در زمین‌های خاکی نگریگ یاد می‌گیری که راه طولانی، به مقصد بزرگ می‌رسد.',
      en: 'Every day you sit for hours on the bus to reach training, but the smile never leaves your face. On the dirt fields of Nagrig you learn that a long road leads to a great destination.'
    },
    year: '1992-2010',
    words: [
      { word: 'نگریگ', clue: 'روستای زادگاه صلاح در مصر' },
      { word: 'مصر', clue: 'کشور زادگاه صلاح' },
      { word: 'اتوبوس', clue: 'وسیله‌ای که صلاح با آن بین روستا و قاهره رفت‌وآمد می‌کرد' },
      { word: 'قاهره', clue: 'پایتخت مصر که صلاح برای تمرین به آن می‌رفت' },
      { word: 'خاکی', clue: 'جنس زمین‌هایی که صلاح در روستا روی آن بازی می‌کرد' },
      { word: 'المقاولون', clue: 'باشگاهی که صلاح در ۱۴ سالگی به آکادمی‌اش پیوست' },
      { word: 'پدر', clue: 'عضو خانواده صلاح که کارمند بود' },
      { word: 'دلتا', clue: 'نگریگ در این ناحیه‌ی مصر واقع است' },
      { word: 'تمرین', clue: 'کاری که صلاح هر روز برایش مسافت طولانی می‌پیمود' },
      { word: 'تسلیم', clue: 'کاری که صلاح در برابر سختی راه نکرد' },
    ],
    bgEmoji: '🇪🇬',
  },
  {
    id: 'salah_basel',
    legendId: 'salah',
    chapterIndex: 1,
    title: { fa: 'پرش به اروپا', en: 'Leap to Europe' },
    subtitle: { fa: 'بازل و نخستین گام‌ها', en: 'Basel and the first steps' },
    story: {
      fa: `درخشش صلاح در لیگ مصر و بازی‌های ملی، توجه باشگاه‌های اروپایی را جلب کرد. در سال ۲۰۱۲، باشگاه بازل سوئیس او را جذب کرد و صلاح نخستین گامش را در فوتبال اروپا برداشت.

در بازل، صلاح خیلی زود به ستاره تبدیل شد. او با سرعت برق‌آسا و دریبل‌های رو به جلو، مدافعان را به زحمت می‌انداخت. در لیگ اروپا مقابل تاتنهام درخشید و نامش در سراسر قاره پیچید.

با بازل دو بار قهرمان لیگ سوئیس شد و در سال ۲۰۱۳ عنوان بهترین بازیکن لیگ سوئیس را از آن خود کرد. اروپا فهمید که ستاره‌ای از مصر آمده است.`,
      en: `Salah's brilliance in the Egyptian league and national games drew the attention of European clubs. In 2012, Switzerland's Basel signed him and Salah took his first step into European football.

At Basel, Salah quickly became a star. With lightning speed and forward dribbles, he tormented defenders. He shone against Tottenham in the Europa League and his name spread across the continent.

He won the Swiss league twice with Basel and in 2013 was named the Swiss league's best player. Europe realized a star had come from Egypt.`
    },
    victoryText: {
      fa: 'با سرعتی که مدافعان را جا می‌گذارد، در سوئیس می‌درخشی و نامت را در اروپا مطرح می‌کنی. نخستین قدم در قاره‌ی بزرگ برداشته شد.',
      en: 'With speed that leaves defenders behind, you shine in Switzerland and make your name in Europe. The first step on the great continent has been taken.'
    },
    year: '2010-2014',
    words: [
      { word: 'بازل', clue: 'باشگاه سوئیسی که صلاح در ۲۰۱۲ به آن پیوست' },
      { word: 'سوئیس', clue: 'کشوری که نخستین باشگاه اروپایی صلاح در آن بود' },
      { word: 'سرعت', clue: 'ویژگی بارز بازی صلاح' },
      { word: 'دریبل', clue: 'حرکتی که صلاح با آن مدافعان را جا می‌گذاشت' },
      { word: 'مدافع', clue: 'کسی که صلاح با سرعتش او را به زحمت می‌انداخت' },
      { word: 'تاتنهام', clue: 'تیمی که صلاح در لیگ اروپا مقابلش درخشید' },
      { word: 'اروپا', clue: 'قاره‌ای که صلاح در ۲۰۱۲ به فوتبالش قدم گذاشت' },
      { word: 'قهرمانی', clue: 'صلاح دو بار این عنوان را با بازل در لیگ سوئیس کسب کرد' },
      { word: 'لیگ', clue: 'صلاح در ۲۰۱۳ بهترین بازیکن این رقابت سوئیس شد' },
      { word: 'مصر', clue: 'کشوری که ستاره‌اش به اروپا آمد' },
    ],
    bgEmoji: '🇨🇭',
  },
  {
    id: 'salah_roma',
    legendId: 'salah',
    chapterIndex: 2,
    title: { fa: 'راه دشوار', en: 'The Hard Road' },
    subtitle: { fa: 'چلسی، فیورنتینا و رم', en: 'Chelsea, Fiorentina and Roma' },
    story: {
      fa: `در سال ۲۰۱۴، باشگاه چلسی صلاح را جذب کرد، اما در لندن فرصت کمی به او رسید. نیمکت‌نشینی در چلسی می‌توانست اعتماد او را بشکند، اما صلاح تصمیم گرفت مسیر دیگری را امتحان کند.

او ابتدا به‌صورت قرضی به فیورنتینا رفت و درخشید؛ سپس به رم پیوست و در پایتخت ایتالیا دوباره متولد شد. در رم، صلاح به یکی از خطرناک‌ترین وینگرهای سری آ تبدیل شد و در فصل ۲۰۱۶-۲۰۱۷ در ۳۱ بازی ۱۵ گل زد و ۱۱ پاس گل داد.

رم او را به بازیکنی کامل تبدیل کرد: سریع، گلزن و سازنده. حالا باشگاه‌های بزرگ دوباره به او نگاه می‌کردند و این بار صلاح آماده بود.`,
      en: `In 2014, Chelsea signed Salah, but he got few chances in London. Warming the bench at Chelsea could have broken his confidence, but Salah chose to try a different path.

He first went on loan to Fiorentina and shone; then he joined Roma and was reborn in the Italian capital. At Roma, Salah became one of Serie A's most dangerous wingers, scoring 15 goals and providing 11 assists in 31 games in the 2016-17 season.

Roma made him a complete player: fast, a scorer and a creator. Now the big clubs were looking at him again — and this time Salah was ready.`
    },
    victoryText: {
      fa: 'نیمکت چلسی تو را نمی‌شکند. در فلورانس و رم دوباره متولد می‌شوی و به یکی از خطرناک‌ترین وینگرهای ایتالیا تبدیل می‌شوی. راه دشوار، تو را قوی‌تر کرد.',
      en: 'The Chelsea bench does not break you. In Florence and Rome you are reborn and become one of Italy\'s most dangerous wingers. The hard road made you stronger.'
    },
    year: '2014-2017',
    words: [
      { word: 'چلسی', clue: 'باشگاه انگلیسی که در ۲۰۱۴ صلاح را جذب کرد' },
      { word: 'نیمکت', clue: 'جایی که صلاح در چلسی زیاد روی آن نشست' },
      { word: 'فیورنتینا', clue: 'باشگاه ایتالیایی که صلاح به‌صورت قرضی به آن رفت' },
      { word: 'رم', clue: 'باشگاهی که صلاح در آن دوباره متولد شد' },
      { word: 'وینگر', clue: 'پستی که صلاح در ایتالیا در آن درخشید' },
      { word: 'گل', clue: 'صلاح در فصل ۲۰۱۶-۲۰۱۷ رم، ۱۵ بار این را زد' },
      { word: 'پاس', clue: 'صلاح در آن فصل ۱۱ بار این را داد' },
      { word: 'سری', clue: 'لیگ برتر ایتالیا با نام ... آ' },
      { word: 'قرضی', clue: 'نوع انتقال صلاح از چلسی به فیورنتینا' },
      { word: 'ایتالیا', clue: 'کشوری که صلاح در آن دوباره شکوفا شد' },
    ],
    bgEmoji: '🇮🇹',
  },
  {
    id: 'salah_liverpool',
    legendId: 'salah',
    chapterIndex: 3,
    title: { fa: 'پادشاه آنفیلد', en: 'King of Anfield' },
    subtitle: { fa: 'رکوردها، جام‌ها و اسطوره', en: 'Records, trophies and legend' },
    story: {
      fa: `در سال ۲۰۱۷، لیورپول صلاح را با مبلغ ۳۶.۹ میلیون پوند جذب کرد. کمتر کسی تصور می‌کرد که این انتقال به یکی از بهترین خریدهای تاریخ لیگ برتر تبدیل شود. در نخستین فصل، صلاح ۳۲ گل در لیگ برتر زد و رکورد ۳۱ گلی تاریخ این رقابت را شکست.

او لیورپول را به فینال لیگ قهرمانان ۲۰۱۸ رساند و در سال ۲۰۱۹ قهرمانی این تورنمنت را جشن گرفت. یک سال بعد، لیورپول با درخشش او پس از ۳۰ سال قهرمان لیگ برتر شد.

صلاح سه بار کفش طلای لیگ برتر را برد و به نماد امید برای مصر و جهان عرب تبدیل شد. در روستای نگریگ، او مدرسه و بیمارستان ساخت و نامش به نیکی در یادها ماند. او فقط یک بازیکن نیست؛ یک الگو است.`,
      en: `In 2017, Liverpool signed Salah for £36.9 million. Few imagined this transfer would become one of the best buys in Premier League history. In his first season, Salah scored 32 league goals, breaking the competition's 31-goal record.

He took Liverpool to the 2018 Champions League final and celebrated that trophy's triumph in 2019. A year later, Liverpool with his brilliance won the Premier League after 30 years.

Salah won the Premier League Golden Boot three times and became a symbol of hope for Egypt and the Arab world. In his village of Nagrig he built a school and a hospital, and his name lived on kindly. He is not just a player; he is a role model.`
    },
    victoryText: {
      fa: 'در آنفیلد، ۳۲ گل در یک فصل می‌زنی و رکورد لیگ برتر را می‌شکنی. جام اروپا و پس از ۳۰ سال، قهرمانی لیگ. اما افتخار بزرگ‌تر، مدرسه و بیمارستانی است که در زادگاهت می‌سازی.',
      en: 'At Anfield you score 32 goals in a season and break the Premier League record. The European cup, and after 30 years, the league title. But the greater honor is the school and hospital you build in your hometown.'
    },
    year: '2017-',
    words: [
      { word: 'لیورپول', clue: 'باشگاهی که صلاح در ۲۰۱۷ به آن پیوست' },
      { word: 'آنفیلد', clue: 'ورزشگاه خانه‌ی لیورپول' },
      { word: 'رکورد', clue: 'صلاح در نخستین فصل، رکورد گل لیگ برتر را شکست' },
      { word: 'کفش', clue: 'صلاح سه بار جایزه‌ی طلای این را در لیگ برتر برد' },
      { word: 'قهرمانان', clue: 'لیگ ... اروپا که صلاح در ۲۰۱۹ با لیورپول برد' },
      { word: 'سی', clue: 'صلاح ۳۲ گل در این عدد از بازی‌ها زد' },
      { word: 'مدرسه', clue: 'صلاح در روستای نگریگ این را ساخت' },
      { word: 'بیمارستان', clue: 'صلاح در زادگاهش این را نیز ساخت' },
      { word: 'الگو', clue: 'صلاح برای مصر و جهان عرب این نقش را دارد' },
      { word: 'امید', clue: 'صلاح نماد این برای مردم مصر شد' },
    ],
    bgEmoji: '🔴',
  },
];

// ─── ROBERT LEWANDOWSKI (لهستان) ──────────────────────
// 4 فصل از زندگی ماشین گلزنی

export const LEWANDOWSKI_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'lewandowski_warsaw',
    legendId: 'lewandowski',
    chapterIndex: 0,
    title: { fa: 'از ورشو تا لخ', en: 'From Warsaw to Lech' },
    subtitle: { fa: 'پسری که پدرش آرزویش را داشت', en: 'A boy whose father dreamed for him' },
    story: {
      fa: `روبرت لواندوفسکی در ۲۱ اوت ۱۹۸۸ در ورشو لهستان به دنیا آمد. پدرش کریستوف، قهرمان جودوی لهستان و بازیکن فوتبال دسته پایین بود، و مادرش ایونا، والیبالیست. روبرت از کودکی در فضایی ورزشی بزرگ شد.

پدرش آرزو داشت روبرت فوتبالیست بزرگی شود، اما در سال ۲۰۰۵ و در سن ۴۹ سالگی بر اثر بیماری درگذشت. آن فقدان، انگیزه‌ای شد که روبرت هرگز فراموشش نکرد؛ او هر گل را به پدرش تقدیم می‌کرد.

لواندوفسکی در باشگاه‌های کوچک ورشو و سپس لخ پوزنان رشد کرد. در سال ۲۰۱۰ با لخ قهرمان لیگ لهستان شد و عنوان بهترین گلزن لیگ را گرفت. دروازه‌ی اروپا به روی او باز شد.`,
      en: `Robert Lewandowski was born on August 21, 1988 in Warsaw, Poland. His father Krzysztof was a Polish judo champion and a lower-division footballer, and his mother Iwona was a volleyball player. Robert grew up in a sporting environment from childhood.

His father dreamed that Robert would become a great footballer, but in 2005, at the age of 49, he passed away from illness. That loss became a motivation Robert never forgot; he dedicated every goal to his father.

Lewandowski developed at small Warsaw clubs and then Lech Poznań. In 2010 he won the Polish league with Lech and took the league's top scorer title. Europe's door opened for him.`
    },
    victoryText: {
      fa: 'هر گل را به پدرت تقدیم می‌کنی؛ به کسی که آرزویش را در تو کاشت. در لخ پوزنان قهرمان لهستان می‌شوی و دروازه‌ی اروپا به رویت باز می‌شود.',
      en: 'You dedicate every goal to your father; to the man who planted his dream in you. At Lech Poznań you become Polish champion and Europe\'s door opens for you.'
    },
    year: '1988-2010',
    words: [
      { word: 'ورشو', clue: 'شهر زادگاه لواندوفسکی' },
      { word: 'لهستان', clue: 'کشور زادگاه لواندوفسکی' },
      { word: 'پدر', clue: 'عضو خانواده لواندوفسکی که در ۲۰۰۵ درگذشت' },
      { word: 'جودو', clue: 'ورزشی که پدر لواندوفسکی قهرمان لهستان در آن بود' },
      { word: 'والیبال', clue: 'ورزشی که مادر لواندوفسکی در آن فعالیت داشت' },
      { word: 'لخ', clue: 'باشگاه لهستانی که لواندوفسکی با آن قهرمان شد' },
      { word: 'پوزنان', clue: 'شهری که باشگاه لخ در آن قرار دارد' },
      { word: 'گلزن', clue: 'عنوانی که لواندوفسکی در لیگ لهستان گرفت' },
      { word: 'آرزو', clue: 'آنچه پدر لواندوفسکی برای پسرش داشت' },
      { word: 'انگیزه', clue: 'آنچه فقدان پدر برای لواندوفسکی شد' },
    ],
    bgEmoji: '🇵🇱',
  },
  {
    id: 'lewandowski_dortmund',
    legendId: 'lewandowski',
    chapterIndex: 1,
    title: { fa: 'انفجار در دورتموند', en: 'Explosion at Dortmund' },
    subtitle: { fa: 'چهار گل به رئال مادرید', en: 'Four goals against Real Madrid' },
    story: {
      fa: `در سال ۲۰۱۰، بوروسیا دورتموند لواندوفسکی را جذب کرد. او در آلمان به گلزنی بی‌رحم تبدیل شد و با دورتموند دو بار پیاپی قهرمان بوندسلیگا شد. در فصل ۲۰۱۱-۲۰۱۲، ۲۲ گل زد و بهترین بازیکن لیگ آلمان شد.

شب افسانه‌ای او در نیمه‌نهایی لیگ قهرمانان ۲۰۱۳ رقم خورد؛ جایی که در بازی مقابل رئال مادرید، چهار گل در یک بازی زد و جهان را شوکه کرد. آن شب، او به یکی از معدود بازیکنانی تبدیل شد که در یک بازی نیمه‌نهایی لیگ قهرمانان چهار گل می‌زند.

با دورتموند به فینال لیگ قهرمانان ۲۰۱۳ رسید، اما در ومبلی مقابل بایرن مونیخ باخت. با این حال، درخشش او تمام اروپا را قانع کرده بود که این لهستانی، گلزنی نسل خود است.`,
      en: `In 2010, Borussia Dortmund signed Lewandowski. In Germany he became a ruthless scorer and won the Bundesliga twice in a row with Dortmund. In the 2011-12 season he scored 22 goals and was named the German league's best player.

His legendary night came in the 2013 Champions League semi-final, when he scored four goals in one game against Real Madrid, shocking the world. That night he became one of the few players ever to score four in a Champions League semi-final.

With Dortmund he reached the 2013 Champions League final but lost to Bayern Munich at Wembley. Still, his brilliance had convinced all of Europe that this Pole was the striker of his generation.`
    },
    victoryText: {
      fa: 'در شب نیمه‌نهایی، چهار بار دروازه‌ی رئال را می‌گشایی و جهان را شوکه می‌کنی. بوندسلیگا را فتح می‌کنی و اروپا می‌داند که یک گلزن بی‌رحم از لهستان آمده است.',
      en: 'On that semi-final night you open Real\'s goal four times and shock the world. You conquer the Bundesliga and Europe knows a ruthless scorer has come from Poland.'
    },
    year: '2010-2014',
    words: [
      { word: 'دورتموند', clue: 'باشگاه آلمانی که لواندوفسکی در ۲۰۱۰ به آن پیوست' },
      { word: 'بوندسلیگا', clue: 'لیگ برتر آلمان' },
      { word: 'رئال', clue: 'تیمی که لواندوفسکی در نیمه‌نهایی ۲۰۱۳ چهار گل به آن زد' },
      { word: 'چهار', clue: 'تعداد گل‌های لواندوفسکی در یک بازی مقابل رئال' },
      { word: 'فینال', clue: 'مرحله‌ای که دورتموند در ۲۰۱۳ به آن رسید' },
      { word: 'ومبلی', clue: 'ورزشگاهی که فینال ۲۰۱۳ در آن برگزار شد' },
      { word: 'بایرن', clue: 'تیمی که دورتموند در فینال ۲۰۱۳ مقابلش باخت' },
      { word: 'گلزن', clue: 'عنوانی که لواندوفسکی در آلمان از آنِ خود کرد' },
      { word: 'نیمه', clue: 'مرحله‌ای از لیگ قهرمانان که شب افسانه‌ای لواندوفسکی در آن رقم خورد' },
      { word: 'لهستانی', clue: 'ملیت لواندوفسکی' },
    ],
    bgEmoji: '🟡',
  },
  {
    id: 'lewandowski_bayern',
    legendId: 'lewandowski',
    chapterIndex: 2,
    title: { fa: 'ماشین گلزنی بایرن', en: 'The Bayern Goal Machine' },
    subtitle: { fa: 'پنج گل در ۹ دقیقه', en: 'Five goals in nine minutes' },
    story: {
      fa: `در سال ۲۰۱۴، لواندوفسکی به‌صورت آزاد به بایرن مونیخ پیوست. در مونیخ، او به یکی از بزرگ‌ترین گلزنان تاریخ فوتبال تبدیل شد. با بایرن هشت بار قهرمان بوندسلیگا شد و چندین بار عنوان آقای گل لیگ را برد.

شب ۲۲ سپتامبر ۲۰۱۵، در بازی مقابل وولفسبورگ، لواندوفسکی در نقش یار تعویضی وارد زمین شد و در عرض ۹ دقیقه پنج گل زد؛ رکوردی که در تاریخ بوندسلیگا بی‌سابقه است و او را به کتاب رکوردهای گینس برد.

در سال ۲۰۲۰، لواندوفسکی با بایرن سه‌گانه (بوندسلیگا، جام حذفی و لیگ قهرمانان) را فتح کرد و عنوان بهترین بازیکن جهان فیفا را گرفت. او در بایرن ۳۴۴ گل در ۳۷۵ بازی زد و به یکی از بهترین شماره ۹های تاریخ تبدیل شد.`,
      en: `In 2014, Lewandowski joined Bayern Munich on a free transfer. In Munich he became one of football's greatest scorers. He won the Bundesliga eight times with Bayern and took the league's top scorer title several times.

On September 22, 2015, in a match against Wolfsburg, Lewandowski came on as a substitute and scored five goals in nine minutes — a record unprecedented in Bundesliga history that earned him a place in the Guinness Book of Records.

In 2020, Lewandowski won the treble with Bayern (Bundesliga, DFB-Pokal and Champions League) and took FIFA's Best Player award. He scored 344 goals in 375 games for Bayern and became one of the greatest number 9s in history.`
    },
    victoryText: {
      fa: 'در ۹ دقیقه پنج گل می‌زنی و نامت در کتاب رکوردهای گینس ثبت می‌شود. سه‌گانه را فتح می‌کنی و به بهترین بازیکن جهان تبدیل می‌شوی. ماشین گلزنی، به اوج رسید.',
      en: 'You score five goals in nine minutes and your name enters the Guinness Book of Records. You win the treble and become the world\'s best player. The goal machine has reached its peak.'
    },
    year: '2014-2022',
    words: [
      { word: 'بایرن', clue: 'باشگاهی که لواندوفسکی در ۲۰۱۴ به آن پیوست' },
      { word: 'مونیخ', clue: 'شهری که باشگاه بایرن در آن است' },
      { word: 'پنج', clue: 'تعداد گل‌های لواندوفسکی در ۹ دقیقه مقابل وولفسبورگ' },
      { word: 'نه', clue: 'تعداد دقیقه‌هایی که لواندوفسکی در آن پنج گل زد' },
      { word: 'وولفسبورگ', clue: 'تیمی که لواندوفسکی در ۲۰۱۵ پنج گل به آن زد' },
      { word: 'گینس', clue: 'کتاب رکوردهایی که نام لواندوفسکی در آن ثبت شد' },
      { word: 'سه‌گانه', clue: 'افتخاری که لواندوفسکی در ۲۰۲۰ با بایرن کسب کرد' },
      { word: 'فیفا', clue: 'نهادی که لواندوفسکی در ۲۰۲۰ عنوان بهترین بازیکن جهانش را گرفت' },
      { word: 'آقای', clue: 'عنوان ... گل لیگ آلمان که لواندوفسکی چند بار برد' },
      { word: 'شماره', clue: 'لواندوفسکی یکی از بهترین ... ۹های تاریخ است' },
    ],
    bgEmoji: '🔴',
  },
  {
    id: 'lewandowski_barca',
    legendId: 'lewandowski',
    chapterIndex: 3,
    title: { fa: 'فصل جدید در بارسا', en: 'A New Chapter at Barça' },
    subtitle: { fa: 'تاج گلزنی لالیگا', en: 'La Liga scoring crown' },
    story: {
      fa: `در سال ۲۰۲۲، لواندوفسکی پس از هشت سال درخشان در بایرن، به بارسلونا پیوست. او در ۳۴ سالگی به لیگ جدید و کشوری جدید رفت؛ تصمیمی که بسیاری آن را ریسکی می‌دانستند، اما او با اطمینان آن را گرفت.

در نخستین فصلش با بارسا، لواندوفسکی ۲۳ گل در لالیگا زد و کفش طلای این رقابت را برد. او در ۳۵ سالگی ثابت کرد که هنوز یکی از بهترین گلزنان جهان است و در رختکن بارسا به رهبری تیم تبدیل شد.

لواندوفسکی در طول دوران حرفه‌ای‌اش بیش از ۶۰۰ گل باشگاهی زد و به یکی از پرگل‌ترین بازیکنان تاریخ فوتبال تبدیل شد. از ورشو تا بارسلونا، او مسیری را طی کرد که با انضباط، پشتکار و عشق به گلزنی ساخته شده بود.`,
      en: `In 2022, after eight brilliant years at Bayern, Lewandowski joined Barcelona. At 34 he moved to a new league and a new country — a decision many considered risky, but he took it with confidence.

In his first season at Barça, Lewandowski scored 23 La Liga goals and won the competition's Golden Boot. At 35 he proved he was still one of the world's best scorers and became a leader in Barcelona's dressing room.

Over his career, Lewandowski scored more than 600 club goals and became one of football's most prolific players ever. From Warsaw to Barcelona, he walked a road built on discipline, perseverance and a love of scoring.`
    },
    victoryText: {
      fa: 'در ۳۴ سالگی به کشوری جدید می‌روی و در نخستین فصل، کفش طلای لالیگا را می‌بری. از ورشو تا بارسلونا، مسیری پر از گل را پیمودی و ثابت کردی که پشتکار، هیچ سنی نمی‌شناسد.',
      en: 'At 34 you move to a new country and in your first season win the La Liga Golden Boot. From Warsaw to Barcelona, you walked a road full of goals and proved that perseverance knows no age.'
    },
    year: '2022-',
    words: [
      { word: 'بارسلونا', clue: 'باشگاهی که لواندوفسکی در ۲۰۲۲ به آن پیوست' },
      { word: 'لالیگا', clue: 'لیگ برتر اسپانیا' },
      { word: 'کفش', clue: 'لواندوفسکی در نخستین فصل بارسا، جایزه‌ی طلای این را برد' },
      { word: 'بیست', clue: 'لواندوفسکی در نخستین فصل بارسا، ۲۳ گل در لالیگا زد' },
      { word: 'رهبر', clue: 'نقشی که لواندوفسکی در رختکن بارسا گرفت' },
      { word: 'انضباط', clue: 'ویژگی‌ای که مسیر لواندوفسکی بر آن بنا شده بود' },
      { word: 'پشتکار', clue: 'ویژگی‌ای که لواندوفسکی را به یکی از پرگل‌ترین‌ها تبدیل کرد' },
      { word: 'گلزنی', clue: 'هنری که لواندوفسکی عاشقش بود' },
      { word: 'اسپانیا', clue: 'کشوری که لواندوفسکی در ۲۰۲۲ به آن نقل مکان کرد' },
      { word: 'ششصد', clue: 'لواندوفسکی بیش از این تعداد گل باشگاهی زد' },
    ],
    bgEmoji: '🔵',
  },
];

// ─── ANDRÉS INIESTA (اسپانیا) ─────────────────────────
// 4 فصل از زندگی گلزن فینال جهان

export const INIESTA_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'iniesta_fuentealbilla',
    legendId: 'iniesta',
    chapterIndex: 0,
    title: { fa: 'از فوئنته‌آلبییا', en: 'From Fuentealbilla' },
    subtitle: { fa: 'پسری که گریه کرد تا بماند', en: 'The boy who cried to stay' },
    story: {
      fa: `آندرس اینیستا در ۱۱ مه ۱۹۸۴ در روستای کوچک فوئنته‌آلبییا در مرکز اسپانیا به دنیا آمد. جایی که کمتر کسی تصور می‌کرد روزی ستاره‌ای جهانی از آن برخیزد. خانواده‌اش ساده بودند و آندرس کودکی خجالتی و آرام بود.

در ۱۲ سالگی، آکادمی معروف بارسلونا «لا ماسیا» او را کشف کرد. اینیستا که از خانواده‌اش جدا می‌شد، آن‌قدر گریه کرد که پدرش نگران شد؛ اما آندرس تصمیم گرفت بماند و بجنگد. آن شب‌های دلتنگی، او را به مردی محکم تبدیل کرد.

در لا ماسیا، اینیستا با ژاوی، پویول و مسی هم‌تیمی شد؛ نسلی که بعدها فوتبال جهان را تغییر داد. سبک بازی او از همان نوجوانی مشخص بود: آرام، هوشمند و با توپ چسبیده به پا.`,
      en: `Andrés Iniesta was born on May 11, 1984 in the small village of Fuentealbilla in central Spain — a place where few imagined a global star would one day rise. His family was simple and Andrés was a shy, quiet child.

At 12, Barcelona's famous academy "La Masia" discovered him. Separated from his family, Iniesta cried so much that his father grew worried; but Andrés decided to stay and fight. Those homesick nights turned him into a strong man.

At La Masia, Iniesta became teammates with Xavi, Puyol and Messi — a generation that later changed world football. His style was clear even as a teenager: calm, intelligent, with the ball glued to his feet.`
    },
    victoryText: {
      fa: 'در ۱۲ سالگی از خانواده جدا می‌شوی و اشک می‌ریزی، اما می‌مانی. در لا ماسیا با نسلی هم‌تیمی می‌شوی که فوتبال جهان را تغییر خواهد داد. راه افسانه از یک روستای کوچک آغاز شد.',
      en: 'At 12 you leave your family and cry, but you stay. At La Masia you become teammates with a generation that will change world football. The legend\'s road began in a small village.'
    },
    year: '1984-2002',
    words: [
      { word: 'اینیستا', clue: 'نام خانوادگی این ستاره اسپانیایی' },
      { word: 'فوئنته', clue: 'بخشی از نام روستای زادگاه اینیستا' },
      { word: 'ماسیا', clue: 'آکادمی معروف بارسلونا' },
      { word: 'خجالتی', clue: 'ویژگی شخصیتی اینیستا در کودکی' },
      { word: 'اشک', clue: 'این را در ۱۲ سالگی هنگام جدایی از خانواده ریخت' },
      { word: 'بارسلونا', clue: 'باشگاهی که اینیستا از نوجوانی به آن پیوست' },
      { word: 'ژاوی', clue: 'هم‌تیمی اینیستا در لا ماسیا و بارسا' },
      { word: 'مسی', clue: 'هم‌تیمی افسانه‌ای اینیستا در بارسلونا' },
      { word: 'اسپانیا', clue: 'کشور زادگاه اینیستا' },
      { word: 'توپ', clue: 'این همیشه به پای اینیستا چسبیده بود' },
    ],
    bgEmoji: '🇪🇸',
  },
  {
    id: 'iniesta_barca',
    legendId: 'iniesta',
    chapterIndex: 1,
    title: { fa: 'قلب بارسلونا', en: 'The Heart of Barcelona' },
    subtitle: { fa: 'تیکی‌تاکا و شماره ۸', en: 'Tiki-taka and the number 8' },
    story: {
      fa: `اینیستا در سال ۲۰۰۲ نخستین بازی‌اش را برای تیم اصلی بارسلونا انجام داد و خیلی زود به یکی از ارکان ترکیب تبدیل شد. با آمدن پپ گواردیولا در ۲۰۰۸، بارسلونا سبکی را اجرا کرد که «تیکی‌تاکا» نام گرفت؛ پاس‌های کوتاه و سریع که حریف را از نفس می‌انداخت.

اینیستا و ژاوی، قلب این سبک بودند. آن‌ها با هوش و آرامش خود، بازی را کنترل می‌کردند و بارسلونا را به یکی از بهترین تیم‌های تاریخ تبدیل کردند. اینیستا با بارسا چهار بار لیگ قهرمانان اروپا را فتح کرد.

در فینال لیگ قهرمانان ۲۰۰۹ مقابل منچستر یونایتد، اینیستا بازی را رهبری کرد و بارسا قهرمان شد. سبک او — بدون سرعت و قدرت بدنی زیاد، اما با هوش و تکنیک بی‌نظیر — الگویی برای بازیکنان کوچک‌جثه در سراسر جهان شد.`,
      en: `Iniesta made his first-team debut for Barcelona in 2002 and soon became a pillar of the lineup. With Pep Guardiola's arrival in 2008, Barcelona implemented a style called "tiki-taka" — short, quick passes that left opponents breathless.

Iniesta and Xavi were the heart of this style. With their intelligence and calm, they controlled the game and turned Barcelona into one of the best teams in history. Iniesta won the Champions League four times with Barça.

In the 2009 Champions League final against Manchester United, Iniesta led the game and Barça became champions. His style — without great speed or physical power, but with unmatched intelligence and technique — became a model for small players around the world.`
    },
    victoryText: {
      fa: 'با پاس‌های کوتاه و هوش بی‌نظیرت، بارسلونا را به یکی از بهترین تیم‌های تاریخ تبدیل می‌کنی. در فینال ۲۰۰۹، بازی را رهبری می‌کنی و جام را بالای سر می‌بری.',
      en: 'With your short passes and unmatched intelligence, you turn Barcelona into one of the best teams in history. In the 2009 final, you lead the game and lift the trophy.'
    },
    year: '2002-2009',
    words: [
      { word: 'تیکی', clue: 'بخشی از نام سبک پاس‌کاری بارسلونا' },
      { word: 'تاکا', clue: 'بخش دوم نام سبک معروف بارسلونا' },
      { word: 'گواردیولا', clue: 'مربی‌ای که سبک تیکی‌تاکا را در بارسا پیاده کرد' },
      { word: 'هشت', clue: 'شماره پیراهن اینیستا' },
      { word: 'منچستر', clue: 'تیمی که بارسا در فینال ۲۰۰۹ مقابلش قهرمان شد' },
      { word: 'هوش', clue: 'ویژگی بازی اینیستا که جای قدرت بدنی را گرفت' },
      { word: 'تکنیک', clue: 'مهارت بی‌نظیر اینیستا با توپ' },
      { word: 'پاس', clue: 'اسلحه اصلی سبک بارسلونا' },
      { word: 'چهار', clue: 'تعداد لیگ قهرمانان‌هایی که اینیستا با بارسا برد' },
      { word: 'قلب', clue: 'نقش اینیستا و ژاوی در تیم بارسلونا' },
    ],
    bgEmoji: '🔵',
  },
  {
    id: 'iniesta_2010',
    legendId: 'iniesta',
    chapterIndex: 2,
    title: { fa: 'گل تاریخ', en: 'The Goal of History' },
    subtitle: { fa: 'فینال جام جهانی ۲۰۱۰', en: 'The 2010 World Cup Final' },
    story: {
      fa: `تابستان ۲۰۱۰، اسپانیا با نسل طلایی‌اش به جام جهانی آفریقای جنوبی رفت. اینیستا در اوج دوران بازی‌اش بود و تیمش را در تمام تورنمنت رهبری می‌کرد. اسپانیا با سبک تیکی‌تاکا به فینال رسید.

فینال مقابل هلند، سخت و پرتنش بود. بازی به وقت اضافه کشید و در دقیقه‌ی ۱۱۶، اینیستا با یک ضربه‌ی دقیق، دروازه‌ی هلند را گشود. آن گل، اسپانیا را برای نخستین بار در تاریخ، قهرمان جهان کرد.

اینیستا پیراهن خود را بالا برد تا نام دنیل خارکه، دوست و هم‌تیمی فقیدش را نشان دهد؛ ادای احترامی که جهان را به گریه انداخت. آن شب، او فقط یک قهرمان نبود؛ یک انسان بزرگ بود.`,
      en: `In the summer of 2010, Spain with its golden generation went to the World Cup in South Africa. Iniesta was at the peak of his career and led his team through the entire tournament. Spain reached the final with tiki-taka.

The final against the Netherlands was hard and tense. The game went to extra time and in the 116th minute, Iniesta opened the Dutch goal with a precise strike. That goal made Spain world champion for the first time in history.

Iniesta lifted his shirt to reveal the name of Dani Jarque, his late friend and teammate — a tribute that moved the world to tears. That night he was not just a champion; he was a great human being.`
    },
    victoryText: {
      fa: 'در دقیقه‌ی ۱۱۶ فینال، دروازه‌ی هلند را می‌گشایی و اسپانیا برای نخستین بار قهرمان جهان می‌شود. پیراهنت را بالا می‌بری تا نام دوست فقیدت را نشان دهی؛ آن شب، تو قهرمانی و انسان بزرگی.',
      en: 'In the 116th minute of the final you open the Dutch goal and Spain becomes world champion for the first time. You lift your shirt to show your late friend\'s name; that night, you are a champion and a great human.'
    },
    year: '2010',
    words: [
      { word: 'جهانی', clue: 'جام ... ۲۰۱۰ که اسپانیا قهرمانش شد' },
      { word: 'آفریقا', clue: 'قاره‌ای که جام جهانی ۲۰۱۰ در آن برگزار شد' },
      { word: 'هلند', clue: 'تیمی که اسپانیا در فینال ۲۰۱۰ مقابلش بازی کرد' },
      { word: 'صد', clue: 'اینیستا گل قهرمانی را در دقیقه‌ی ۱۱۶ زد' },
      { word: 'خارکه', clue: 'نام دوست فقید اینیستا که روی پیراهنش بود' },
      { word: 'پیراهن', clue: 'اینیستا در جشن قهرمانی این را بالا برد' },
      { word: 'اضافه', clue: 'وقت ...؛ مرحله‌ای که گل قهرمانی در آن زده شد' },
      { word: 'اسپانیا', clue: 'کشوری که با گل اینیستا قهرمان جهان شد' },
      { word: 'قهرمان', clue: 'عنوانی که اسپانیا در ۲۰۱۰ برای نخستین بار گرفت' },
      { word: 'ضربه', clue: 'اینیستا گل قهرمانی را با این زد' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'iniesta_legacy',
    legendId: 'iniesta',
    chapterIndex: 3,
    title: { fa: 'خداحافظی با اشک', en: 'A Farewell in Tears' },
    subtitle: { fa: 'ژاپن و میراث', en: 'Japan and the legacy' },
    story: {
      fa: `اینیستا در سال ۲۰۱۸، پس از ۲۲ سال حضور در بارسلونا، با چشمانی اشک‌آلود از باشگاهی که خانه‌ی دومش بود خداحافظی کرد. در مراسم وداع، او گفت که هرگز نمی‌خواست این روز برسد؛ اما بارسا تا ابد در قلبش خواهد ماند.

او سپس راهی ژاپن شد و به باشگاه ویسل کوبه پیوست؛ جایی که به سفیر فوتبال و الگویی برای بازیکنان جوان آسیایی تبدیل شد. پس از آن نیز در امارات بازی کرد و در سال ۲۰۲۴ از فوتبال خداحافظی کرد.

میراث اینیستا فقط جام‌ها و گل‌ها نبود؛ او نشان داد که فروتنی، آرامش و انسانیت می‌تواند با بزرگی در زمین همراه باشد. او یکی از محبوب‌ترین بازیکنان تاریخ فوتبال است و نامش همیشه با احترام یاد می‌شود.`,
      en: `In 2018, after 22 years at Barcelona, Iniesta said farewell with tearful eyes to the club that was his second home. At the farewell ceremony he said he never wanted this day to come; but Barça would remain in his heart forever.

He then went to Japan and joined Vissel Kobe, where he became an ambassador for football and a role model for young Asian players. He later played in the UAE and retired from football in 2024.

Iniesta's legacy was not just trophies and goals; he showed that humility, calm and humanity can coexist with greatness on the pitch. He is one of the most beloved players in football history, and his name is always spoken with respect.`
    },
    victoryText: {
      fa: 'با اشک از بارسا خداحافظی می‌کنی، اما نامت در تاریخ آن باشگاه جاودانه می‌ماند. در ژاپن، سفیر فوتبال می‌شوی و نشان می‌دهی که فروتنی و بزرگی می‌توانند با هم باشند.',
      en: 'You say goodbye to Barça in tears, but your name remains immortal in that club\'s history. In Japan you become an ambassador for football and show that humility and greatness can coexist.'
    },
    year: '2010-2024',
    words: [
      { word: 'خداحافظی', clue: 'کاری که اینیستا در ۲۰۱۸ با بارسا کرد' },
      { word: 'ژاپن', clue: 'کشوری که اینیستا پس از بارسا به آن رفت' },
      { word: 'کوبه', clue: 'شهر باشگاه ژاپنی اینیستا (ویسل ...)' },
      { word: 'فروتنی', clue: 'ویژگی انسانی اینیستا در کنار بزرگی‌اش' },
      { word: 'آرامش', clue: 'ویژگی بازی اینیستا که او را متمایز می‌کرد' },
      { word: 'انسانیت', clue: 'ویژگی‌ای که اینیستا با بزرگی در زمین همراه کرد' },
      { word: 'سفیر', clue: 'نقشی که اینیستا در ژاپن به‌عنوان نماینده فوتبال داشت' },
      { word: 'امارات', clue: 'کشوری که اینیستا پس از ژاپن در آن بازی کرد' },
      { word: 'میراث', clue: 'آنچه اینیستا به فوتبال جهان باقی گذاشت' },
      { word: 'بارسا', clue: 'باشگاهی که اینیستا آن را خانه‌ی دومش می‌دانست' },
    ],
    bgEmoji: '👏',
  },
];

// ─── SON HEUNG-MIN (کره جنوبی) ────────────────────────
// 4 فصل از زندگی کاپیتان کره و تاتنهام

export const SON_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'son_chuncheon',
    legendId: 'son',
    chapterIndex: 0,
    title: { fa: 'پسری از چونچئون', en: 'A Boy from Chuncheon' },
    subtitle: { fa: 'پدری که مربی‌اش شد', en: 'A father who became his coach' },
    story: {
      fa: `سون هیونگ-مین در ۸ ژوئیه ۱۹۹۲ در شهر چونچئون کره جنوبی به دنیا آمد. پدرش سون وونگ-جونگ، بازیکن سابق فوتبال، بزرگ‌ترین مربی زندگی او شد. او از کودکی پسرش را با تمرین‌های سخت و انضباط آهنین پرورش داد.

پدر سون، به‌جای فشار برای برد، روی پایه‌های تکنیکی تأکید می‌کرد. سون مجبور بود ساعت‌ها دریبل و کنترل توپ تمرین کند؛ تمرین‌هایی که بعدها به پایه‌ی بازی درخشانش تبدیل شد. این انضباط، او را از سایر هم‌سن‌هایش جدا کرد.

در ۱۶ سالگی، سون فرصتی نادر یافت: او به آکادمی باشگاه هامبورگ آلمان پیوست؛ نخستین گام یک پسر کره‌ای به‌سوی فوتبال اروپا. جدایی از خانواده سخت بود، اما رویای بزرگ‌تر از دلتنگی بود.`,
      en: `Son Heung-min was born on July 8, 1992 in the city of Chuncheon, South Korea. His father Son Woong-jung, a former footballer, became the greatest coach of his life. From childhood he raised his son with hard training and iron discipline.

Rather than pressure to win, Son's father emphasized technical foundations. Son had to practice dribbling and ball control for hours — drills that later became the base of his brilliant game. This discipline set him apart from his peers.

At 16, Son found a rare opportunity: he joined the academy of Hamburg in Germany — a Korean boy's first step toward European football. Leaving his family was hard, but the dream was bigger than homesickness.`
    },
    victoryText: {
      fa: 'پدرت تو را با انضباط و تمرین‌های بی‌پایان می‌سازد. در ۱۶ سالگی به آلمان می‌روی و نخستین کره‌ای می‌شوی که راه اروپا را در پیش می‌گیرد. جدایی سخت است، اما رویا بزرگ‌تر است.',
      en: 'Your father builds you with discipline and endless drills. At 16 you go to Germany and become the first Korean to set out for Europe. The separation is hard, but the dream is bigger.'
    },
    year: '1992-2010',
    words: [
      { word: 'چونچئون', clue: 'شهر زادگاه سون در کره جنوبی' },
      { word: 'کره', clue: 'کشور زادگاه سون (کره جنوبی)' },
      { word: 'پدر', clue: 'مربی اصلی و نخستین سون در کودکی' },
      { word: 'انضباط', clue: 'ویژگی‌ای که پدر سون در او پرورش داد' },
      { word: 'دریبل', clue: 'مهارتی که سون ساعت‌ها آن را تمرین کرد' },
      { word: 'هامبورگ', clue: 'باشگاه آلمانی که سون در ۱۶ سالگی به آکادمی‌اش پیوست' },
      { word: 'آلمان', clue: 'کشوری که نخستین مقصد اروپایی سون بود' },
      { word: 'تکنیک', clue: 'پایه‌ای که پدر سون روی آن تأکید می‌کرد' },
      { word: 'تمرین', clue: 'کاری که سون ساعت‌ها انجام می‌داد' },
      { word: 'رویا', clue: 'آنچه برای سون از دلتنگی بزرگ‌تر بود' },
    ],
    bgEmoji: '🇰🇷',
  },
  {
    id: 'son_hamburg',
    legendId: 'son',
    chapterIndex: 1,
    title: { fa: 'شکوفایی در هامبورگ', en: 'Blossoming at Hamburg' },
    subtitle: { fa: 'نخستین گل در بوندسلیگا', en: 'First goal in the Bundesliga' },
    story: {
      fa: `سون در آکادمی هامبورگ به‌سرعت پیشرفت کرد و در سال ۲۰۱۰ نخستین بازی حرفه‌ای‌اش را در بوندسلیگا انجام داد. در همان نخستین فصل، در ۱۸ سالگی، نخستین گلش را در لیگ آلمان زد و به جوان‌ترین گلزن تاریخ باشگاه هامبورگ تبدیل شد.

او در هامبورگ سه فصل بازی کرد و با سرعت، شوت‌های قدرتمند با هر دو پا و حرکت‌های هوشمندانه، توجه باشگاه‌های بزرگ را جلب کرد. سون با هر فصل بهتر می‌شد و به یکی از امیدهای درخشان بوندسلیگا تبدیل شد.

در سال ۲۰۱۳، سون هامبورگ را ترک کرد و به بایر لورکوزن پیوست؛ گامی رو به جلو در مسیر حرفه‌ای‌اش. مسیر یک پسر کره‌ای به‌سوی ستاره شدن، جدی‌تر از همیشه شده بود.`,
      en: `Son progressed quickly at Hamburg's academy and in 2010 made his professional debut in the Bundesliga. In that very first season, at 18, he scored his first goal in the German league and became the youngest scorer in Hamburg's history.

He played three seasons at Hamburg and with his speed, powerful shots with both feet and clever movement drew the attention of big clubs. Son improved with each season and became one of the Bundesliga's brightest prospects.

In 2013, Son left Hamburg and joined Bayer Leverkusen — a step forward in his professional path. The road of a Korean boy toward stardom had become more serious than ever.`
    },
    victoryText: {
      fa: 'در ۱۸ سالگی نخستین گل بوندسلیگایت را می‌زنی و جوان‌ترین گلزن تاریخ هامبورگ می‌شوی. با هر فصل بهتر می‌شوی و باشگاه‌های بزرگ نامت را در دفترشان می‌نویسند.',
      en: 'At 18 you score your first Bundesliga goal and become the youngest scorer in Hamburg\'s history. You improve every season and the big clubs write your name in their books.'
    },
    year: '2010-2013',
    words: [
      { word: 'هامبورگ', clue: 'باشگاه آلمانی که سون نخستین بازی حرفه‌ای‌اش را در آن کرد' },
      { word: 'هجده', clue: 'سن سون در نخستین گلش در بوندسلیگا' },
      { word: 'گل', clue: 'سون نخستین این را در ۱۸ سالگی در بوندسلیگا زد' },
      { word: 'جوان', clue: 'سون ...‌ترین گلزن تاریخ هامبورگ شد' },
      { word: 'لورکوزن', clue: 'باشگاهی که سون در ۲۰۱۳ به آن پیوست' },
      { word: 'شوت', clue: 'سون با هر دو پا این را قدرتمند می‌زد' },
      { word: 'دو', clue: 'سون با این تعداد پا شوت‌های قدرتمند می‌زد' },
      { word: 'بوندسلیگا', clue: 'لیگ برتر آلمان' },
      { word: 'آکادمی', clue: 'سون در ...‌ی هامبورگ پیشرفت کرد' },
      { word: 'ستاره', clue: 'مسیری که سون پس از هامبورگ در پیش گرفت' },
    ],
    bgEmoji: '⚽',
  },
  {
    id: 'son_leverkusen',
    legendId: 'son',
    chapterIndex: 2,
    title: { fa: 'ستاره لورکوزن', en: 'The Star of Leverkusen' },
    subtitle: { fa: 'آماده‌ی جهش بزرگ', en: 'Ready for the big leap' },
    story: {
      fa: `در بایر لورکوزن، سون به یکی از بهترین وینگرهای بوندسلیگا تبدیل شد. او در دو فصل، در ۸۷ بازی ۲۹ گل زد و در لیگ قهرمانان اروپا نیز درخشید. سرعت انفجاری و شوت‌های دقیقش، مدافعان را به دردسر می‌انداخت.

در لورکوزن، سون به بازیکنی تبدیل شد که می‌توانست در هر لحظه سرنوشت بازی را تغییر دهد. او با هوش تاکتیکی و انگیزه‌ی بی‌پایان، نظر باشگاه‌های بزرگ اروپا را جلب کرد.

در سال ۲۰۱۵، سون با مبلغی حدود ۲۲ میلیون پوند به تاتنهام پیوست؛ انتقالی که او را به یکی از گران‌ترین بازیکنان آسیایی تاریخ تبدیل کرد. اکنون، صحنه برای جهش بزرگ آماده بود.`,
      en: `At Bayer Leverkusen, Son became one of the Bundesliga's best wingers. In two seasons he scored 29 goals in 87 games and shone in the Champions League too. His explosive speed and precise shots tormented defenders.

At Leverkusen, Son became a player who could change the fate of a game at any moment. With his tactical intelligence and endless motivation, he drew the attention of Europe's big clubs.

In 2015, Son joined Tottenham for around £22 million — a transfer that made him one of the most expensive Asian players in history. Now the stage was set for the big leap.`
    },
    victoryText: {
      fa: 'در لورکوزن به یکی از بهترین وینگرهای آلمان تبدیل می‌شوی. ۲۹ گل در دو فصل و درخشش در اروپا. حالا تاتنهام با ۲۲ میلیون پوند به سراغت می‌آید؛ جهش بزرگ نزدیک است.',
      en: 'At Leverkusen you become one of Germany\'s best wingers. 29 goals in two seasons and brilliance in Europe. Now Tottenham comes for you with £22 million; the big leap is near.'
    },
    year: '2013-2015',
    words: [
      { word: 'لورکوزن', clue: 'باشگاه آلمانی که سون دو فصل در آن درخشید' },
      { word: 'وینگر', clue: 'پستی که سون در آن به یکی از بهترین‌های بوندسلیگا تبدیل شد' },
      { word: 'بیست', clue: 'سون در دو فصل لورکوزن ۲۹ گل زد' },
      { word: 'سرعت', clue: 'ویژگی انفجاری بازی سون' },
      { word: 'تاتنهام', clue: 'باشگاهی که سون در ۲۰۱۵ به آن پیوست' },
      { word: 'آسیا', clue: 'قاره‌ای که سون یکی از گران‌ترین بازیکنانش شد' },
      { word: 'میلیون', clue: 'مبلغ انتقال سون به تاتنهام حدود ۲۲ این واحد بود' },
      { word: 'هوش', clue: 'ویژگی تاکتیکی سون در لورکوزن' },
      { word: 'انگیزه', clue: 'ویژگی بی‌پایان سون که توجه باشگاه‌های بزرگ را جلب کرد' },
      { word: 'جهش', clue: 'سون در لورکوزن آماده‌ی این بزرگ بود' },
    ],
    bgEmoji: '🔴',
  },
  {
    id: 'son_tottenham',
    legendId: 'son',
    chapterIndex: 3,
    title: { fa: 'کاپیتان کره و تاتنهام', en: 'Captain of Korea and Tottenham' },
    subtitle: { fa: 'کفش طلا و رکوردها', en: 'The Golden Boot and records' },
    story: {
      fa: `سون در تاتنهام به یکی از محبوب‌ترین بازیکنان تاریخ باشگاه تبدیل شد. او در کنار هری کین، یکی از خطرناک‌ترین زوج‌های هجومی لیگ برتر را ساخت. سرعت، شوت‌های دوپا و لبخند همیشگی‌اش، او را به چهره‌ای دوست‌داشتنی تبدیل کرد.

در فصل ۲۰۲۱-۲۰۲۲، سون با ۲۳ گل — بدون یک گل از روی نقطه‌ی پنالتی — کفش طلای لیگ برتر را برد و نخستین بازیکن آسیایی تاریخ شد که این عنوان را کسب می‌کند. او در سال ۲۰۲۳ کاپیتان تاتنهام شد.

سون همچنین کاپیتان تیم ملی کره جنوبی است و در جام جهانی ۲۰۲۲ با گل حساسش مقابل پرتغال، کره را به مرحله‌ی حذفی رساند. او الگوی میلیون‌ها جوان آسیایی است و نشان داد که با انضباط و فروتنی می‌توان به قله‌های جهان رسید.`,
      en: `At Tottenham, Son became one of the most beloved players in the club's history. Alongside Harry Kane, he formed one of the Premier League's most dangerous attacking duos. His speed, two-footed shots and ever-present smile made him a lovable figure.

In the 2021-22 season, Son won the Premier League Golden Boot with 23 goals — none from the penalty spot — and became the first Asian player ever to claim the title. In 2023 he became Tottenham's captain.

Son is also captain of South Korea's national team and at the 2022 World Cup, with his crucial goal against Portugal, took Korea to the knockout stage. He is a role model for millions of young Asians and showed that with discipline and humility one can reach the summits of the world.`
    },
    victoryText: {
      fa: 'با ۲۳ گل، کفش طلای لیگ برتر را می‌بری و نخستین آسیایی تاریخ می‌شوی که این عنوان را کسب می‌کند. کاپیتان تاتنهام و کره می‌شوی و به الگوی میلیون‌ها جوان تبدیل می‌شوی.',
      en: 'With 23 goals you win the Premier League Golden Boot and become the first Asian in history to claim the title. You become captain of Tottenham and Korea and a role model for millions of youth.'
    },
    year: '2015-',
    words: [
      { word: 'کین', clue: 'هم‌تیمی سون در خط حمله تاتنهام (هری ...)' },
      { word: 'کفش', clue: 'سون در ۲۰۲۲ جایزه‌ی طلای لیگ برتر را برد' },
      { word: 'بیست', clue: 'سون در آن فصل ۲۳ گل در لیگ برتر زد' },
      { word: 'پنالتی', clue: 'سون آن ۲۳ گل را بدون گل از روی این نقطه زد' },
      { word: 'کاپیتان', clue: 'نقشی که سون در ۲۰۲۳ در تاتنهام گرفت' },
      { word: 'کره', clue: 'کشوری که سون کاپیتان تیم ملی آن است' },
      { word: 'پرتغال', clue: 'تیمی که سون در جام جهانی ۲۰۲۲ مقابلش گل زد' },
      { word: 'خندان', clue: 'ویژگی ظاهری همیشگی سون (لبخند ...)' },
      { word: 'آسیایی', clue: 'سون نخستین بازیکن این قاره بود که کفش طلا برد' },
      { word: 'انضباط', clue: 'ویژگی‌ای که سون را به قله رساند' },
    ],
    bgEmoji: '⚪',
  },
];

// ─── VIRGIL VAN DIJK (هلند) ───────────────────────────
// 4 فصل از زندگی دیوار لیورپول

export const VANDIJK_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'vandijk_breda',
    legendId: 'vandijk',
    chapterIndex: 0,
    title: { fa: 'از بردا تا خرونینگن', en: 'From Breda to Groningen' },
    subtitle: { fa: 'پسری که ظرف می‌شست', en: 'The boy who washed dishes' },
    story: {
      fa: `ویرخیل فن‌دایک در ۸ ژوئیه ۱۹۹۱ در شهر بردا هلند به دنیا آمد. خانواده‌اش متوسط بودند و ویرخیل برای کمک به هزینه‌ها، در یک رستوران ظرف می‌شست. او از کودکی بلندقد و قدرتمند بود، اما در دفاع چپ بازی می‌کرد.

پیشرفت او آهسته بود. فن‌دایک تا ۱۸ سالگی در باشگاه‌های کوچک بازی می‌کرد و کمتر کسی او را آینده‌ی فوتبال هلند می‌دانست. اما اراده و پشتکارش او را از دیگران متمایز می‌کرد.

در سال ۲۰۱۰، باشگاه خرونینگن او را کشف کرد و به تیم برد. در آنجا، مربیان او را از دفاع چپ به قلب دفاع منتقل کردند؛ تصمیمی که مسیر زندگی‌اش را تغییر داد. فن‌دایک در پست جدید شکوفا شد.`,
      en: `Virgil van Dijk was born on July 8, 1991 in the city of Breda, Netherlands. His family was middle-class and Virgil washed dishes at a restaurant to help with expenses. He was tall and strong from childhood, but played at left-back.

His progress was slow. Until 18, Van Dijk played at small clubs and few considered him the future of Dutch football. But his will and perseverance set him apart.

In 2010, Groningen discovered him and brought him to the team. There, the coaches moved him from left-back to centre-back — a decision that changed his life. Van Dijk blossomed in the new position.`
    },
    victoryText: {
      fa: 'در رستوران ظرف می‌شویی و در زمین‌های کوچک می‌جنگی. در ۱۹ سالگی خرونینگن تو را کشف می‌کند و از دفاع چپ به قلب دفاع می‌برد. مسیر زندگی‌ات برای همیشه تغییر می‌کند.',
      en: 'You wash dishes in a restaurant and fight on small pitches. At 19 Groningen discovers you and moves you from left-back to centre-back. The path of your life changes forever.'
    },
    year: '1991-2013',
    words: [
      { word: 'بردا', clue: 'شهر زادگاه فن‌دایک در هلند' },
      { word: 'هلند', clue: 'کشور زادگاه فن‌دایک' },
      { word: 'رستوران', clue: 'جایی که فن‌دایک در نوجوانی ظرف می‌شست' },
      { word: 'ظرف', clue: 'کاری که فن‌دایک برای کمک به خانواده انجام می‌داد' },
      { word: 'خرونینگن', clue: 'باشگاهی که فن‌دایک را در ۲۰۱۰ کشف کرد' },
      { word: 'دفاع', clue: 'پستی که فن‌دایک در آن شکوفا شد (قلب ...)' },
      { word: 'چپ', clue: 'پستی که فن‌دایک پیش از قلب دفاع در آن بازی می‌کرد' },
      { word: 'پشتکار', clue: 'ویژگی‌ای که فن‌دایک را از دیگران متمایز کرد' },
      { word: 'بلندقد', clue: 'ویژگی جسمی فن‌دایک از کودکی' },
      { word: 'اراده', clue: 'ویژگی‌ای که پیشرفت آهسته فن‌دایک را ممکن کرد' },
    ],
    bgEmoji: '🇳🇱',
  },
  {
    id: 'vandijk_celtic',
    legendId: 'vandijk',
    chapterIndex: 1,
    title: { fa: 'پله‌ها در سلتیک', en: 'Steps at Celtic' },
    subtitle: { fa: 'جام‌ها در اسکاتلند', en: 'Trophies in Scotland' },
    story: {
      fa: `در سال ۲۰۱۳، فن‌دایک به باشگاه سلتیک اسکاتلند پیوست. در گلاسکو، او به یکی از بهترین مدافعان لیگ اسکاتلند تبدیل شد و با سلتیک جام‌های متعددی برد؛ از جمله دو قهرمانی لیگ و یک جام اتحادیه.

سبک بازی او در سلتیک شکل گرفت: آرام، قدرتمند در نبردهای هوایی، و توانا در بازی‌سازی از عقب. فن‌دایک نه فقط یک مدافع تخریب‌کننده، بلکه آغازگر حمله‌ها بود؛ ویژگی‌ای که او را در فوتبال مدرن متمایز می‌کرد.

درخشش او در سلتیک، توجه باشگاه‌های انگلیسی را جلب کرد. در سال ۲۰۱۵، فن‌دایک با مبلغی حدود ۱۳ میلیون پوند به ساوتهمپتون پیوست؛ نخستین گامش در لیگ برتر انگلیس.`,
      en: `In 2013, Van Dijk joined Scotland's Celtic. In Glasgow he became one of the best defenders in the Scottish league and won numerous trophies with Celtic, including two league titles and a League Cup.

His style took shape at Celtic: calm, powerful in aerial duels, and capable of building play from the back. Van Dijk was not merely a destroying defender but a starter of attacks — a trait that set him apart in modern football.

His brilliance at Celtic drew the attention of English clubs. In 2015, Van Dijk joined Southampton for around £13 million — his first step in the English Premier League.`
    },
    victoryText: {
      fa: 'در گلاسکو جام‌ها را یکی‌یکی می‌بری و به یکی از بهترین مدافعان اسکاتلند تبدیل می‌شوی. سبک بازی‌ات شکل می‌گیرد: آرام، قدرتمند و آغازگر حمله از عقب. لیگ برتر انگلیس منتظر توست.',
      en: 'In Glasgow you win trophies one by one and become one of Scotland\'s best defenders. Your style takes shape: calm, powerful and a starter of attacks from the back. The English Premier League awaits you.'
    },
    year: '2013-2015',
    words: [
      { word: 'سلتیک', clue: 'باشگاه اسکاتلندی که فن‌دایک در ۲۰۱۳ به آن پیوست' },
      { word: 'گلاسکو', clue: 'شهری که باشگاه سلتیک در آن است' },
      { word: 'اسکاتلند', clue: 'کشوری که فن‌دایک در لیگ آن درخشید' },
      { word: 'جام', clue: 'فن‌دایک چندین این را با سلتیک برد' },
      { word: 'هوایی', clue: 'فن‌دایک در نبردهای این نوع قدرتمند بود' },
      { word: 'مدافع', clue: 'پستی که فن‌دایک در آن به یکی از بهترین‌ها تبدیل شد' },
      { word: 'ساوتهمپتون', clue: 'باشگاه انگلیسی که فن‌دایک در ۲۰۱۵ به آن پیوست' },
      { word: 'سیزده', clue: 'مبلغ انتقال فن‌دایک به ساوتهمپتون حدود ۱۳ میلیون پوند بود' },
      { word: 'حمله', clue: 'فن‌دایک نه فقط مدافع، بلکه آغازگر این بود' },
      { word: 'آرام', clue: 'ویژگی سبک دفاعی فن‌دایک' },
    ],
    bgEmoji: '🟢',
  },
  {
    id: 'vandijk_southampton',
    legendId: 'vandijk',
    chapterIndex: 2,
    title: { fa: 'آغازی در لیگ برتر', en: 'A Start in the Premier League' },
    subtitle: { fa: 'اثبات خود در ساوتهمپتون', en: 'Proving himself at Southampton' },
    story: {
      fa: `در ساوتهمپتون، فن‌دایک به‌سرعت ثابت کرد که جایگاهش در لیگ برتر است. او در نخستین فصلش به یکی از بهترین مدافعان لیگ تبدیل شد و رهبر خط دفاعی ساوتهمپتون شد. قدرت بدنی، سرعت و خواندن بازی‌اش، او را متمایز می‌کرد.

هواداران ساوتهمپتون او را «ویرخیل بزرگ» می‌نامیدند و در نظرسنجی‌ها او را یکی از بهترین مدافعان تاریخ باشگاه می‌دانستند. بازی‌های درخشانش باعث شد باشگاه‌های بزرگ یکی‌یکی به سراغش بیایند.

در ژانویه‌ی ۲۰۱۸، لیورپول با رکورد ۷۵ میلیون پوند — بالاترین مبلغ برای یک مدافع در تاریخ آن زمان — فن‌دایک را جذب کرد. حالا او باید ثابت می‌کرد که ارزش آن رقم را دارد.`,
      en: `At Southampton, Van Dijk quickly proved he belonged in the Premier League. In his first season he became one of the league's best defenders and the leader of Southampton's back line. His physical power, speed and reading of the game set him apart.

Southampton fans called him "the great Virgil" and in polls considered him one of the club's best defenders ever. His brilliant games brought the big clubs one by one.

In January 2018, Liverpool signed Van Dijk for a record £75 million — the highest fee for a defender at the time. Now he had to prove he was worth that figure.`
    },
    victoryText: {
      fa: 'در ساوتهمپتون رهبر خط دفاع می‌شوی و هواداران تو را «ویرخیل بزرگ» می‌نامند. در ژانویه‌ی ۲۰۱۸، لیورپول با رکورد ۷۵ میلیون پوند به سراغت می‌آید. حالا باید ارزش این رقم را ثابت کنی.',
      en: 'At Southampton you become the leader of the back line and the fans call you "the great Virgil". In January 2018, Liverpool comes for you with a record £75 million. Now you must prove your worth that figure.'
    },
    year: '2015-2018',
    words: [
      { word: 'ساوتهمپتون', clue: 'باشگاهی که فن‌دایک پیش از لیورپول در آن درخشید' },
      { word: 'دفاع', clue: 'فن‌دایک رهبر خط این در ساوتهمپتون شد' },
      { word: 'لیورپول', clue: 'باشگاهی که فن‌دایک در ژانویه ۲۰۱۸ به آن پیوست' },
      { word: 'هفتاد', clue: 'مبلغ انتقال فن‌دایک به لیورپول ۷۵ میلیون پوند بود' },
      { word: 'رکورد', clue: 'انتقال فن‌دایک رکورد این را برای یک مدافع شکست' },
      { word: 'مدافع', clue: 'پستی که انتقال فن‌دایک رکورد گران‌ترین آن شد' },
      { word: 'رهبر', clue: 'نقش فن‌دایک در خط دفاعی ساوتهمپتون' },
      { word: 'سرعت', clue: 'ویژگی جسمی فن‌دایک در کنار قدرتش' },
      { word: 'بازی', clue: 'فن‌دایک در خواندن این مهارت داشت' },
      { word: 'ژانویه', clue: 'ماهی که انتقال فن‌دایک به لیورپول در آن انجام شد' },
    ],
    bgEmoji: '🔴',
  },
  {
    id: 'vandijk_liverpool',
    legendId: 'vandijk',
    chapterIndex: 3,
    title: { fa: 'دیوار لیورپول', en: 'The Wall of Liverpool' },
    subtitle: { fa: 'جام اروپا و قهرمانی لیگ', en: 'European glory and the league title' },
    story: {
      fa: `در لیورپول، فن‌دایک به یکی از بهترین مدافعان جهان تبدیل شد. او خط دفاعی لیورپول را متحول کرد و در فصل ۲۰۱۸-۲۰۱۹، تیمش را به قهرمانی لیگ قهرمانان اروپا رساند. در همان سال، عنوان بهترین بازیکن لیگ برتر را گرفت.

فصل ۲۰۱۹-۲۰۲۰، اوج دوران او بود. فن‌دایک با لیورپول پس از ۳۰ سال قهرمان لیگ برتر شد و به‌عنوان یکی از بهترین مدافعان تاریخ لیگ برتر شناخته شد. او در نظرسنجی توپ طلا ۲۰۱۹، دوم شد؛ افتخاری نادر برای یک مدافع.

فن‌دایک کاپیتان تیم ملی هلند نیز هست و در جام جهانی ۲۰۲۲ رهبری هلند را بر عهده داشت. او ثابت کرد که مدافع بودن، فقط تخریب نیست؛ بلکه هنر رهبری، آرامش و ساختن از عقب است.`,
      en: `At Liverpool, Van Dijk became one of the best defenders in the world. He transformed Liverpool's back line and in the 2018-19 season led his team to the Champions League title. That same year he was named the Premier League's best player.

The 2019-20 season was the peak of his career. Van Dijk won the Premier League with Liverpool after 30 years and was recognized as one of the best defenders in Premier League history. He finished second in the 2019 Ballon d'Or vote — a rare honor for a defender.

Van Dijk is also captain of the Netherlands national team and led the Dutch at the 2022 World Cup. He proved that being a defender is not just about destroying; it is the art of leadership, calm and building from the back.`
    },
    victoryText: {
      fa: 'خط دفاعی لیورپول را به یک دیوار تبدیل می‌کنی، جام اروپا را می‌بری و پس از ۳۰ سال لیگ برتر را فتح می‌کنی. در توپ طلا دوم می‌شوی و ثابت می‌کنی که مدافع بودن، یک هنر است.',
      en: 'You turn Liverpool\'s back line into a wall, win the European cup and conquer the Premier League after 30 years. You finish second in the Ballon d\'Or and prove that being a defender is an art.'
    },
    year: '2018-',
    words: [
      { word: 'دیوار', clue: 'لقبی که به خط دفاعی لیورپول با فن‌دایک دادند' },
      { word: 'قهرمانان', clue: 'لیگ ... اروپا که فن‌دایک در ۲۰۱۹ با لیورپول برد' },
      { word: 'سی', clue: 'لیورپول پس از این تعداد سال قهرمان لیگ برتر شد' },
      { word: 'توپ', clue: 'فن‌دایک در نظرسنجی این طلا ۲۰۱۹ دوم شد' },
      { word: 'دوم', clue: 'رتبه فن‌دایک در توپ طلای ۲۰۱۹' },
      { word: 'کاپیتان', clue: 'نقش فن‌دایک در تیم ملی هلند' },
      { word: 'هلند', clue: 'کشوری که فن‌دایک کاپیتان تیم ملی آن است' },
      { word: 'رهبری', clue: 'هنری که فن‌دایک به‌عنوان مدافع نشان داد' },
      { word: 'آرامش', clue: 'ویژگی بازی فن‌دایک در قلب دفاع' },
      { word: 'بهترین', clue: 'فن‌دایک در ۲۰۱۹ عنوان ... بازیکن لیگ برتر را گرفت' },
    ],
    bgEmoji: '🏆',
  },
];

export const MODERN_LEGENDS_B_CHAPTERS: Record<string, WorldMapChapter[]> = {
  modric: MODRIC_CHAPTERS,
  salah: SALAH_CHAPTERS,
  lewandowski: LEWANDOWSKI_CHAPTERS,
  iniesta: INIESTA_CHAPTERS,
  son: SON_CHAPTERS,
  vandijk: VANDIJK_CHAPTERS,
};

// ─── FINAL STORIES ────────────────────────────────────
export const MODERN_LEGENDS_B_FINAL: Record<string, { fa: string; en: string }> = {
  modric: {
    fa: `داستان لوکا مودریچ، داستان پسری از یک روستای کوچک در کرواسی است که جنگ خانه‌اش را گرفت، اما رویا را از او نگرفت. او از پارکینگ هتلی در زادار تا قله‌ی فوتبال جهان رفت و با هوش، فروتنی و پشتکارش، توپ طلا را به خانه برد.

مودریچ ثابت کرد که برای بزرگ بودن، لازم نیست بلندقد یا سریع‌ترین باشی؛ کافی است مغزت از همه تیزتر و قلبت از همه محکم‌تر باشد. او کاپیتان نسل طلایی کرواسی بود و کشوری کوچک را به فینال جهان رساند.

"معمار" — نامی که برای مودریچ باقی ماند — نشان داد که فوتبال، بیش از قدرت، هنر اندیشیدن است.`,
    en: `Luka Modrić's story is the story of a boy from a small village in Croatia whose home was taken by war, but whose dream was not. He went from a hotel parking lot in Zadar to the summit of world football and, with his intelligence, humility and perseverance, brought the Ballon d'Or home.

Modrić proved that to be great you need not be the tallest or the fastest; it is enough for your mind to be sharpest and your heart strongest. He was the captain of Croatia's golden generation and took a small nation to a world final.

"The Architect" — the name that stayed with Modrić — showed that football is, more than power, the art of thinking.`
  },
  salah: {
    fa: `محمد صلاح از روستای کوچک نگریگ در دلتای نیل تا آنفیلد، مسیری پر از سختی و ایمان را پیمود. پسرکی که ساعتها در اتوبوس می‌نشست تا به تمرین برسد، به پادشاه لیگ برتر و نماد امید مصر و جهان عرب تبدیل شد.

صلاح با سرعت برق‌آسا و گل‌های بی‌شمار، رکوردها را شکست و جام‌ها را برد. اما مهم‌تر از همه، او فراموش نکرد از کجا آمده است؛ در زادگاهش مدرسه و بیمارستان ساخت و نامش را به نیکی جاودانه کرد.

"پادشاه" — لقبی که هواداران لیورپول به او دادند — فقط به خاطر گل‌هایش نبود؛ به خاطر قلبی بود که برای مردمش می‌تپید.`,
    en: `From the small village of Nagrig in the Nile Delta to Anfield, Mohamed Salah walked a road full of hardship and faith. The boy who sat for hours on a bus to reach training became the king of the Premier League and a symbol of hope for Egypt and the Arab world.

With lightning speed and countless goals, Salah broke records and won trophies. But most importantly, he never forgot where he came from; he built a school and a hospital in his hometown and immortalized his name kindly.

"The King" — the title Liverpool fans gave him — was not just for his goals; it was for the heart that beat for his people.`
  },
  lewandowski: {
    fa: `روبرت لواندوفسکی از ورشو تا بارسلونا، یکی از پرگل‌ترین مسیرهای تاریخ فوتبال را پیمود. پدرش آرزوی بزرگی برای او داشت و روبرت آن آرزو را با هر گل زنده نگه داشت؛ هر جشن گل، ادای احترامی به پدرش بود.

او در دورتموند و بایرن به ماشین گلزنی تبدیل شد: چهار گل در نیمه‌نهایی لیگ قهرمانان، پنج گل در ۹ دقیقه، و رکوردی که در کتاب گینس ثبت شد. لواندوفسکی با انضباط و پشتکار، به یکی از بهترین شماره ۹های تاریخ تبدیل شد.

"ماشین گلزنی" — لقبی که شایسته‌ی او بود — ثابت کرد که استعداد، بدون انضباط و تلاش، هرگز به افسانه تبدیل نمی‌شود.`,
    en: `From Warsaw to Barcelona, Robert Lewandowski walked one of the most prolific roads in football history. His father had a great dream for him, and Robert kept that dream alive with every goal; each goal celebration was a tribute to his father.

At Dortmund and Bayern he became a goal machine: four goals in a Champions League semi-final, five goals in nine minutes, and a record entered in the Guinness Book. With discipline and perseverance, Lewandowski became one of the greatest number 9s in history.

"The Goal Machine" — the title he deserved — proved that talent, without discipline and effort, never becomes a legend.`
  },
  iniesta: {
    fa: `آندرس اینیستا، پسر خجالتی روستای فوئنته‌آلبییا، به قلب یکی از بهترین تیم‌های تاریخ فوتبال تبدیل شد. او با پاس‌های کوتاه و هوش بی‌نظیرش، سبک تیکی‌تاکا را به هنر تبدیل کرد و بارسلونا را به قله‌های اروپا رساند.

اما لحظه‌ی جاودانه‌ی او، گل قهرمانی جهان در فینال ۲۰۱۰ بود؛ گلی که اسپانیا را برای نخستین بار قهرمان کرد. اینیستا در آن شب، با بالا بردن پیراهن دوست فقیدش، نشان داد که قلب بزرگی دارد.

او ثابت کرد که بزرگی در زمین، با فروتنی و انسانیت در بیرون آن همراه است. اینیستا یکی از محبوب‌ترین بازیکنان تاریخ فوتبال است و نامش همیشه با احترام یاد می‌شود.`,
    en: `Andrés Iniesta, the shy boy from the village of Fuentealbilla, became the heart of one of the best teams in football history. With his short passes and unmatched intelligence, he turned tiki-taka into art and took Barcelona to the summits of Europe.

But his immortal moment was the world-champion goal in the 2010 final — the goal that made Spain champions for the first time. That night, by lifting his late friend's shirt, Iniesta showed he had a great heart.

He proved that greatness on the pitch comes with humility and humanity off it. Iniesta is one of the most beloved players in football history, and his name is always spoken with respect.`
  },
  son: {
    fa: `سون هیونگ-مین، پسر چونچئون، با انضباطی که پدرش در او کاشت، از یک روستای کره به قلب تاتنهام رسید. او با سرعت و لبخند همیشگی‌اش، به محبوب‌ترین بازیکن آسیایی تاریخ لیگ برتر تبدیل شد.

سون با ۲۳ گل، کفش طلای لیگ برتر را برد و نخستین آسیایی تاریخ شد که این عنوان را کسب می‌کند. او کاپیتان تاتنهام و کره شد و در جام جهانی ۲۰۲۲ با گلی حساس، کشورش را به مرحله‌ی حذفی رساند.

"کاپیتان" — لقبی که شایسته‌ی اوست — به میلیون‌ها جوان آسیایی نشان داد که با انضباط، فروتنی و لبخند می‌توان به قله‌های جهان رسید.`,
    en: `Son Heung-min, the boy from Chuncheon, with the discipline his father planted in him, went from a Korean village to the heart of Tottenham. With his speed and ever-present smile, he became the most beloved Asian player in Premier League history.

With 23 goals, Son won the Premier League Golden Boot and became the first Asian in history to claim the title. He became captain of Tottenham and Korea and at the 2022 World Cup, with a crucial goal, took his country to the knockout stage.

"Captain" — the title he deserves — showed millions of young Asians that with discipline, humility and a smile one can reach the summits of the world.`
  },
  vandijk: {
    fa: `ویرخیل فن‌دایک، پسر بردا که در رستوران ظرف می‌شست، به دیوار لیورپول و یکی از بهترین مدافعان تاریخ لیگ برتر تبدیل شد. مسیر او آهسته بود، اما با اراده‌ای که هرگز تسلیم نشد، به قله رسید.

او با لیورپول جام اروپا را برد و پس از ۳۰ سال، لیگ برتر را فتح کرد. در توپ طلا ۲۰۱۹ دوم شد؛ افتخاری نادر برای یک مدافع. فن‌دایک ثابت کرد که دفاع کردن، فقط تخریب نیست؛ هنر رهبری، آرامش و ساختن از عقب است.

"دیوار" — لقبی که به او دادند — نشان داد که قدرتی که با هوش و آرامش همراه شود، شکست‌ناپذیر است.`,
    en: `Virgil van Dijk, the boy from Breda who washed dishes in a restaurant, became the wall of Liverpool and one of the best defenders in Premier League history. His road was slow, but with a will that never surrendered, he reached the summit.

He won the European cup with Liverpool and, after 30 years, conquered the Premier League. He finished second in the 2019 Ballon d'Or — a rare honor for a defender. Van Dijk proved that defending is not just destroying; it is the art of leadership, calm and building from the back.

"The Wall" — the title he was given — showed that power combined with intelligence and calm is invincible.`
  },
};
