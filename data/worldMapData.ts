import { WorldMapChapter } from '../types';

// ─── EXTRA LEGENDS (classic + modern) ──────────────────
// 10 classic legends + 10 modern legends, each with a full 4-chapter life path.
import { OLD_LEGENDS_A_CHAPTERS, OLD_LEGENDS_A_FINAL } from './worldMapExtra/oldLegendsA';
import { OLD_LEGENDS_B_CHAPTERS, OLD_LEGENDS_B_FINAL } from './worldMapExtra/oldLegendsB';
import { MODERN_LEGENDS_A_CHAPTERS, MODERN_LEGENDS_A_FINAL } from './worldMapExtra/modernLegendsA';
import { MODERN_LEGENDS_B_CHAPTERS, MODERN_LEGENDS_B_FINAL } from './worldMapExtra/modernLegendsB';

// ─── MARADONA ──────────────────────────────────────────
// 6 chapters covering his legendary life

export const MARADONA_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'maradona_villa',
    legendId: 'maradona',
    chapterIndex: 0,
    title: { fa: 'کودکی در ویلا فیوریتو', en: 'Childhood in Villa Fiorito' },
    subtitle: { fa: 'از خاک تا ستاره', en: 'From Dust to Star' },
    story: {
      fa: `۳۰ اکتبر ۱۹۶۰، در محله فقیرنشین ویلا فیوریتو در حومه بوئنوس آیرس، دیگو آرماندو مارادونا به دنیا آمد. خانواده‌اش آنقدر فقیر بودند که پدرش دون دیگو، معروف به "چیتورو"، در کارخانه ذرت کار می‌کرد و مادرش دالما از هشت فرزند مراقبت می‌کرد.

دیگو کوچک‌ترین پسر خانواده بود. در پنج سالگی، اولین توپش را به عنوان کادوی کریسمس گرفت - یک توپ فوتبال کهنه. از آن لحظه، توپ هرگز از پاهایش جدا نشد. در کوچه‌های خاکی محله، با بچه‌های بزرگتر بازی می‌کرد و همه را با استعداد عجیبش حیرت‌زده می‌کرد.

عمویش سیریلو، که خود بازیکن فوتبال بود، اولین بار استعداد دیگو را جدی گرفت. او به خانواده گفت: «این بچه استثنایی است. باید از او مراقبت کنید.»

در هشت سالگی، یک پیشاهنگ استعدادیابی به نام فرانسیسکو کورنخو او را در حال بازی دید و بلافاصله به والدینش گفت: «این بچه یک نابغه است.»`,
      en: `On October 30, 1960, in the poor neighborhood of Villa Fiorito on the outskirts of Buenos Aires, Diego Armando Maradona was born. His family was so poor that his father Don Diego, known as "Chitoro," worked at a corn mill while his mother Dalma cared for eight children.

Diego was the youngest son. At age five, he received his first ball as a Christmas gift - an old football. From that moment, the ball never left his feet. He played in the dusty streets with older kids, amazing everyone with his extraordinary talent.

His uncle Cirilo, himself a football player, was the first to take Diego's talent seriously. He told the family: "This kid is exceptional. You must take care of him."

At age eight, a talent scout named Francisco Cornejo saw him playing and immediately told his parents: "This child is a genius."`
    },
    victoryText: {
      fa: 'توپ کهنه را در آغوش گرفتی و به خانه دویدی. استعدادت مثل برق در کوچه‌های خاکی ویلا فیوریتو می‌درخشید. پدر و مادرت با چشمانی اشک‌آلود به تو نگاه می‌کردند - آنها می‌دانستند که این کودک روزی نام آرژانتین را در جهان بلندآوازه خواهد کرد.',
      en: 'You hugged the old ball and ran home. Your talent shone like lightning in the dusty streets of Villa Fiorito. Your parents watched with tearful eyes - they knew this child would one day make Argentina famous around the world.'
    },
    year: '1960-1970',
    words: [
      { word: 'فوتبال', clue: 'دیگو از پنج سالگی در کوچه‌های ویلا فیوریتو عاشق این ورزش شد' },
      { word: 'توپ', clue: 'هدیه کریسمس دیگو در پنج سالگی' },
      { word: 'فقیر', clue: 'خانواده مارادونا در محله فقیرنشین ویلا فیوریتو این وضعیت را داشت' },
      { word: 'کودک', clue: 'دیگو در همان ...ی نابغه‌ای به دنیا آمد' },
      { word: 'محله', clue: 'ویلا فیوریتو یک ... فقیرنشین بود' },
      { word: 'خاکی', clue: 'جنس زمین کوچه‌های ویلا فیوریتو که دیگو روی آن بازی می‌کرد' },
      { word: 'استعداد', clue: 'عمو سیریلو اولین بار این را در دیگو دید' },
      { word: 'نابغه', clue: 'پیشاهنگ به والدین دیگو گفت: این بچه یک ... است' },
      { word: 'کوچه', clue: 'دیگو در ...‌های خاکی ویلا فیوریتو با بچه‌های بزرگتر بازی می‌کرد' },
      { word: 'خانواده', clue: 'مارادونا هشتمین فرزند ... خود بود' },
      { word: 'بازی', clue: 'دیگو در کوچه‌های خاکی محله با بچه‌های بزرگتر این کار را می‌کرد' },
      { word: 'آرژانتین', clue: 'کشور محل تولد مارادونا' },
      { word: 'کریسمس', clue: 'تعطیلاتی که دیگو اولین توپش را گرفت' },
      { word: 'پیشاهنگ', clue: 'فرانسیسکو کورنخو | کسی که استعداد دیگو را کشف کرد' },
    ],
    bgEmoji: '🥅',
  },
  {
    id: 'maradona_debut',
    legendId: 'maradona',
    chapterIndex: 1,
    title: { fa: 'شروع درخشان در آرژانتینوس', en: 'Brilliant Debut at Argentinos' },
    subtitle: { fa: 'پدیده ۱۵ ساله', en: 'The 15-Year-Old Phenomenon' },
    story: {
      fa: `در ۱۲ سالگی، دیگو به تیم جوانان آرژانتینوس جونیورز پیوست. تیم او "لوس سبولیتاس" (پیازهای کوچک) نام داشت و دیگو به سرعت ستاره تیم شد. در یک بازی، تیم حریف که از دست دیگو عصبانی شده بود، او را تا استخوان از پا درآورد، اما دیگو بدون گریه بلند شد و به بازی ادامه داد.

در ۱۵ سالگی و ۳۵۵ روزگی، دیگو اولین بازی حرفه‌ای خود را برای آرژانتینوس جونیورز مقابل تالارس انجام داد. جوان‌ترین بازیکنی بود که تا آن زمان در لیگ آرژانتین بازی کرده بود.

پیراهن شماره ۱۰ معروف را در همان دوران به دست آورد. مربی تیم گفت: «این پسر با پاهایش حرف می‌زند. تماشای بازی‌اش مثل دیدن یک نقاشی زیباست.»

در چهار سال حضور در آرژانتینوس، ۱۱۶ گل زد - رکوردی خارق‌العاده برای یک نوجوان.`,
      en: `At age 12, Diego joined the youth team of Argentinos Juniors. His team was called "Los Cebollitas" (The Little Onions) and Diego quickly became its star. In one match, the opposing team, frustrated with Diego, fouled him brutally, but Diego got up without crying and continued playing.

At 15 years and 355 days, Diego made his professional debut for Argentinos Juniors against Tallares. He was the youngest player ever to play in the Argentine league.

He earned the famous number 10 jersey during this time. His coach said: "This boy speaks with his feet. Watching him play is like seeing a beautiful painting."

In four years at Argentinos, he scored 116 goals - an incredible record for a teenager.`
    },
    victoryText: {
      fa: 'پیراهن شماره ۱۰ را بر تن کردی و وارد زمین شدی. جمعیت فریاد می‌زد "دیگو! دیگو!" و تو با هر دریبل، با هر پاس، ثابت می‌کردی که یک پدیده واقعی هستی. مربی از روی نیمکت لبخند می‌زد: این پسر به اوج خواهد رسید.',
      en: 'You put on the number 10 jersey and stepped onto the field. The crowd shouted "Diego! Diego!" and with every dribble, every pass, you proved you were a true phenomenon. The coach smiled from the bench: this boy will reach the top.'
    },
    year: '1976-1981',
    words: [
      { word: 'جوان', clue: 'دیگو در ۱۵ سال و ۳۵۵ روزگی ...‌ترین بازیکن تاریخ لیگ آرژانتین شد' },
      { word: 'پیراهن', clue: 'شماره ۱۰ معروف روی آن بود' },
      { word: 'گل', clue: 'دیگو ۱۱۶ ... در چهار سال زد' },
      { word: 'زمین', clue: 'بر روی چمن ... حریف دیگو را تا استخوان زد | محل مسابقه فوتبال' },
      { word: 'حرفه‌ای', clue: 'اولین بازی ... دیگو در ۱۵ سالگی' },
      { word: 'مربی', clue: 'کسی که گفت "این پسر با پاهایش حرف می‌زند"' },
      { word: 'تیم', clue: 'لوس سبولیتاس نام ... دیگو در جوانان بود | گروهی که دیگو در آن بازی می‌کرد' },
      { word: 'دریبل', clue: 'مربی گفت این پسر با پاهایش حرف می‌زند و تماشای ...‌هایش مثل نقاشی است' },
      { word: 'رکورد', clue: 'دیگو با ۱۱۶ گل در چهار سال یک ... خارق‌العاده برای یک نوجوان ثبت کرد' },
      { word: 'ستاره', clue: 'دیگو در تیم جوانان لوس سبولیتاس یک ... بود و همه را با استعدادش حیرت‌زده کرد' },
      { word: 'مسابقه', clue: 'بازی تند و تیز مقابل تالارس اولین ... حرفه‌ای دیگو بود | بازی رسمی بین دو تیم' },
      { word: 'باشگاه', clue: 'آرژانتینوس جونیورز یک ... فوتبال است' },
      { word: 'نوجوان', clue: 'رده سنی دیگو در زمان رکوردزنی' },
    ],
    bgEmoji: '⚽',
  },
  {
    id: 'maradona_barcelona',
    legendId: 'maradona',
    chapterIndex: 2,
    title: { fa: 'ماجراجویی در بارسلونا', en: 'Barcelona Adventure' },
    subtitle: { fa: 'گران‌ترین خرید جهان', en: 'The Most Expensive Transfer' },
    story: {
      fa: `در سال ۱۹۸۲، بارسلونا ۵ میلیون پوند برای خرید دیگو پرداخت - رکوردی که جهان فوتبال را شوکه کرد. یک جوان ۲۱ ساله از محله فقیرنشین، حالا گران‌ترین بازیکن تاریخ بود.

اولین فصل در بارسلونا پر از فراز و نشیب بود. مارادونا هپاتیت گرفت و ماه‌ها از میادین دور بود. اما وقتی برگشت، تماشاگران را با مهارت‌های خارق‌العاده‌اش مسحور کرد.

یکی از به‌یادماندنی‌ترین لحظات، بازی مقابل رئال مادرید در جام حذفی بود. دیگو وسط زمین توپ را گرفت، چهار بازیکن را دریبل زد و توپ را به گوشه دروازه کوبید. تماشاگران بلند شدند و او را تشویق کردند. آن گل بعدها "گل قرن" نامیده شد.

اما مصدومیت از ناحیه مچ پا که توسط آندونی گویکوئچئا - مدافع اتلتیک بیلبائو - ایجاد شد، تلخ‌ترین خاطره او در بارسلونا بود.`,
      en: `In 1982, Barcelona paid £5 million for Diego - a record that shocked the football world. A 21-year-old from a poor neighborhood was now the most expensive player in history.

His first season at Barcelona was full of ups and downs. Maradona contracted hepatitis and was away from the fields for months. But when he returned, he mesmerized fans with his extraordinary skills.

One of the most memorable moments was the match against Real Madrid in the Copa del Rey. Diego picked up the ball in midfield, dribbled past four players, and smashed the ball into the corner of the net. The crowd rose to applaud him. That goal was later called "the goal of the century."

But the ankle injury caused by Andoni Goikoetxea - Athletic Bilbao's defender - became his most bitter memory at Barcelona.`
    },
    victoryText: {
      fa: 'گران‌ترین بازیکن جهان وارد زمین شدی. بارسا با همه وجود به تو نیاز داشت. با هپاتیت جنگیدی، با مصدومیت‌ها ساختی و در برابر رئال مادرید یک تنه ایستادی. بارسلونا نفسش را حبس کرده بود - تماشاگران نام تو را فریاد می‌زدند: "دی-گو! دی-گو!"',
      en: 'You stepped onto the field as the most expensive player in the world. Barcelona needed you with all their heart. You fought hepatitis, endured injuries, and stood alone against Real Madrid. Barcelona held its breath - the fans chanted your name: "Die-go! Die-go!"'
    },
    year: '1982-1984',
    words: [
      { word: 'بارسلونا', clue: 'تیمی که دیگو را ۵ میلیون خرید' },
      { word: 'رکورد', clue: 'گران‌ترین خرید تاریخ در آن زمان' },
      { word: 'هپاتیت', clue: 'بیماری که دیگو در بارسلونا گرفت' },
      { word: 'میلیون', clue: '۵ ... پوند برای خرید دیگو پرداخت شد' },
      { word: 'پوند', clue: 'واحد پول پرداخت برای خرید مارادونا' },
      { word: 'مصدومیت', clue: 'آسیب مچ پای دیگو در بارسلونا' },
      { word: 'دریبل', clue: 'عبور از چهار بازیکن رئال' },
      { word: 'تماشاگر', clue: 'بعد از گل به رئال در جام حذفی بلند شدند و کف زدند' },
      { word: 'مادرید', clue: 'تیم پایتخت اسپانیا، رقیب بارسلونا' },
      { word: 'جام', clue: 'حذفی | مسابقه مقابل رئال مادرید که دیگو چهار بازیکن را دریبل زد و گل قرن را در آن زد' },
      { word: 'درخشش', clue: 'پس از بازگشت از هپاتیت، دیگو تماشاگران را با مهارت‌های خارق‌العاده‌اش مسحور کرد و دوباره ...ید' },
    ],
    bgEmoji: '🇪🇸',
  },
  {
    id: 'maradona_napoli',
    legendId: 'maradona',
    chapterIndex: 3,
    title: { fa: 'پادشاه ناپل', en: 'King of Naples' },
    subtitle: { fa: 'طلوع یک امپراطور', en: 'Rise of an Emperor' },
    story: {
      fa: `وقتی مارادونا در سال ۱۹۸۴ به ناپل پیوست، شمالی‌ها مسخره می‌کردند. ناپل فقیرترین شهر ایتالیا بود و تیمش تا به حال قهرمانی نگرفته بود. اما دیگو گفت: «من عاشق این شهر و مردمش هستم. آنها را ناامید نمی‌کنم.»

ناپل خیابان‌ها را رنگ کرد. تصاویر مارادونا روی همه دیوارها بود. مردم هر جا که می‌رفت، او را تشویق می‌کردند. یک روز مردی به او گفت: «دیگو، اگر قهرمان شویم، هر کاری برایت می‌کنیم.» مارادونا لبخند زد و گفت: «قهرمان می‌شویم.»

در فصل ۱۹۸۶-۸۷، ناپل اولین قهرمانی سری آ تاریخ خود را جشن گرفت. یک تیم جنوبی، با یک آرژانتینی، برترین لیگ جهان را فتح کرده بود. مردم ناپل هفته‌ها جشن گرفتند.

او دو بار ناپل را به قهرمانی سری آ رساند و یک بار جام یوفا را بالای سر برد. مجسمه‌هایش در شهر ساخته شد و مردم به او لقب "پادشاه ناپل" دادند.`,
      en: `When Maradona joined Napoli in 1984, northerners mocked them. Naples was Italy's poorest city and their team had never won a championship. But Diego said: "I love this city and its people. I won't let them down."

Naples painted the streets. Images of Maradona covered every wall. People cheered him wherever he went. One day a man told him: "Diego, if we become champions, we'll do anything for you." Maradona smiled and said: "We will become champions."

In the 1986-87 season, Napoli celebrated their first-ever Serie A title. A southern team, with an Argentine, had conquered the world's best league. The people of Naples celebrated for weeks.

He led Napoli to two Serie A titles and one UEFA Cup. Statues of him were built in the city and people gave him the title "King of Naples."`
    },
    victoryText: {
      fa: 'در خاک جنوب ایتالیا، پادشاهی را آغاز کردی که هیچ‌کس باور نمی‌کرد. ناپل فقیر، ناپل مسخره‌شده، حالا قهرمان ایتالیا بود. تو را روی شانه‌ها حمل می‌کردند و می‌گفتند "دیگو خداست!" خیابان‌ها پر از شادی بود و تو پادشاه بی‌تاج این شهر شده بودی.',
      en: 'In the soil of southern Italy, you began a reign no one believed possible. Poor Naples, mocked Naples, was now champion of Italy. They carried you on their shoulders and said "Diego is God!" The streets were full of joy and you had become the uncrowned king of this city.'
    },
    year: '1984-1991',
    words: [
      { word: 'ناپل', clue: 'تیم جنوب ایتالیا که دیگو به آن پیوست' },
      { word: 'قهرمانی', clue: 'اولین ... سری آ برای ناپل' },
      { word: 'ایتالیا', clue: 'کشور محل تیم ناپل' },
      { word: 'شهر', clue: 'مجسمه‌های دیگو در سراسر این ... ساخته شد و مردم به او لقب پادشاه دادند | ناپل ... محل زندگی دیگو' },
      { word: 'پادشاه', clue: 'لقب مارادونا در ناپل' },
      { word: 'سری‌آ', clue: 'لیگ برتر فوتبال ایتالیا' },
      { word: 'مجسمه', clue: 'یادبود دیگو در شهر ناپل' },
      { word: 'فصل', clue: '۸۷-۱۹۸۶ ... قهرمانی ناپل' },
      { word: 'جام', clue: 'یوفا را دیگو برای ناپل برد' },
      { word: 'شمال', clue: 'منطقه‌ای که ناپل را مسخره می‌کرد' },
      { word: 'ملت', clue: 'آرژانتین به عنوان یک ... با قهرمانی دیگو در جام جهانی ۱۹۸۶ سربلند شد | کشور' },
      { word: 'لبخند', clue: 'واکنش دیگو به وعده قهرمانی' },
      { word: 'تاج', clue: 'نماد پادشاهی بر سر دیگو' },
      { word: 'جنوب', clue: 'ناپل در ... ایتالیا قرار دارد و شمالی‌ها آن را مسخره می‌کردند | سمت مخالف شمال' },
      { word: 'عشق', clue: 'دیگو گفت من ...ی به این شهر و مردمش دارم و آنها را ناامید نمی‌کنم | احساس عمیق' },
    ],
    bgEmoji: '👑',
  },
  {
    id: 'maradona_1986',
    legendId: 'maradona',
    chapterIndex: 4,
    title: { fa: 'جام جهانی ۱۹۸۶', en: '1986 World Cup' },
    subtitle: { fa: 'دست خدا و گل قرن', en: 'Hand of God & Goal of the Century' },
    story: {
      fa: `تابستان ۱۹۸۶، مکزیک. جام جهانی. دیگو مارادونا کاپیتان آرژانتین بود. چهار سال قبل از آن، در جنگ فالکلند، آرژانتین از انگلیس شکست خورده بود. حالا در یک چهارم نهایی، آرژانتین مقابل انگلیس قرار می‌گرفت. بیش از یک بازی فوتبال بود - انتقام ملی در میان بود.

دقیقه ۵۱، بازی بدون گل. دیگو توپ را جلو برد و پاسی به سمت راست فرستاد. بعد دوید، پرید و با مشت توپ را به داخل دروازه زد. داور گل را قبول کرد. "دست خدا!" مارادونا بعدها گفت: «کمی با سر دیگو و کمی با دست خدا.»

چهار دقیقه بعد، چیزی رخ داد که بعدها "گل قرن" نامیده شد. دیگو توپ را از وسط زمین گرفت، پنج بازیکن انگلیس - از جمله جان بارنز، پیتر رید، تری بوچر، تری فنویک و پیتر شیلتون - را پشت سر گذاشت و دروازه را باز کرد. ۵۴ متر، ۱۰ ثانیه، ۱۲ قدم - یک شاهکار بی‌نظیر.

تا پایان جام جهانی، آرژانتین قهرمان شد و مارادونا توپ طلا را به عنوان بهترین بازیکن دریافت کرد.`,
      en: `Summer 1986, Mexico. The World Cup. Diego Maradona was captain of Argentina. Four years earlier, in the Falklands War, Argentina had been defeated by England. Now in the quarter-final, Argentina faced England. It was more than a football match - it was national revenge.

Minute 51, the game was goalless. Diego pushed the ball forward and passed to the right. Then he ran, jumped, and punched the ball into the net with his fist. The referee allowed the goal. "The Hand of God!" Maradona later said: "A little with Diego's head and a little with the hand of God."

Four minutes later, something happened that would be called "The Goal of the Century." Diego picked up the ball in midfield, dribbled past five English players - including John Barnes, Peter Reid, Terry Butcher, Terry Fenwick, and Peter Shilton - and scored. 54 meters, 10 seconds, 12 touches - a masterpiece.

By the end of the World Cup, Argentina was champion and Maradona received the Golden Ball as the best player.`
    },
    victoryText: {
      fa: 'این فقط یک بازی نبود، تقابل دو ملت بود. دستت را به سوی آسمان بلند کردی - دست خدا. و چهار دقیقه بعد، چنان گلی زدی که جهان برای همیشه بهت‌زده کرد. پنج بازیکن را پشت سر گذاشتی، دروازه را گشودی و نام خود را در تاریخ فوتبال جاودانه کردی. آرژانتین گریه می‌کرد - اشک شوق.',
      en: 'This was not just a game, it was a clash of two nations. You raised your hand to the sky - the Hand of God. And four minutes later, you scored a goal that stunned the world forever. You left five players behind, opened the goal, and immortalized your name in football history. Argentina wept - tears of joy.'
    },
    year: '1986',
    words: [
      { word: 'مکزیک', clue: 'کشور میزبان جام جهانی ۱۹۸۶' },
      { word: 'انگلیس', clue: 'حریف آرژانتین در یک چهارم نهایی' },
      { word: 'دست', clue: 'خدا، نام معروف گل مارادونا' },
      { word: 'گل', clue: 'قرن، بهترین گل تاریخ فوتبال' },
      { word: 'جام', clue: 'جهانی، بزرگترین تورنمنت فوتبال' },
      { word: 'کاپیتان', clue: 'عنوان دیگو در تیم ملی آرژانتین' },
      { word: 'آرژانتین', clue: 'کشور دیگو در جام جهانی' },
      { word: 'قهرمان', clue: 'عنوانی که آرژانتین در ۱۹۸۶ گرفت' },
      { word: 'شاهکار', clue: 'گل قرن از وسط زمین با دریبل پنج بازیکن یک ... بی‌نظیر بود | کار بزرگ و تحسین‌برانگیز' },
      { word: 'دقیقه', clue: 'در ... ۵۱ بازی بدون گل بود و دیگو با دست خدا دروازه را باز کرد | واحد زمان' },
      { word: 'داور', clue: 'کسی که گل دست خدا را قبول کرد' },
      { word: 'فالکلند', clue: 'جنگی که آرژانتین از انگلیس شکست خورد' },
      { word: 'طلا', clue: 'توپ ... جایزه بهترین بازیکن جام' },
      { word: 'پنج', clue: 'تعداد بازیکنان دریبل خورده در گل قرن' },
      { word: 'جهان', clue: 'جام ...ی ۱۹۸۶ مکزیک جایی که مارادونا دست خدا و گل قرن را خلق کرد | مسابقات جهانی' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'maradona_legacy',
    legendId: 'maradona',
    chapterIndex: 5,
    title: { fa: 'افول و میراث جاودان', en: 'Decline & Eternal Legacy' },
    subtitle: { fa: 'خداحافظی یک اسطوره', en: 'Farewell to a Legend' },
    story: {
      fa: `سال‌های پایانی زندگی مارادونا پر از فراز و نشیب بود. اعتیاد، مشکلات سلامتی و مسائل شخصی سایه بر زندگی او انداخت. در جام جهانی ۱۹۹۴، بعد از یک شروع عالی، تست دوپینگ او مثبت اعلام شد و از مسابقات حذف شد. تصویر گریه‌هایش در کنار زمین، قلب میلیون‌ها نفر را شکست.

اما مارادونا هیچ‌وقت عشق مردم را از دست نداد. او نماد مبارزه طبقه کارگر، صدای بی‌صدایان بود. مردم آرژانتین و ناپل او را می‌پرستیدند.

در ۲۵ نوامبر ۲۰۲۰، دیگو مارادونا در سن ۶۰ سالگی درگذشت. اما او نمرد - اسطوره که هرگز نمی‌میرد. آرژانتین سه روز عزای عمومی اعلام کرد. هزاران نفر در خیابان‌ها اشک ریختند و نام او را فریاد زدند.

میراث مارادونا فراتر از فوتبال است. او به مردم فقیر جهان نشان داد که از پایین‌ترین نقطه هم می‌توان به اوج رسید. دست خدا همیشه بالای سرشان بود.`,
      en: `The final years of Maradona's life were full of ups and downs. Addiction, health problems, and personal issues cast a shadow over his life. At the 1994 World Cup, after a great start, his doping test came back positive and he was expelled from the tournament. The image of his tears on the sidelines broke millions of hearts.

But Maradona never lost the people's love. He was a symbol of the working class struggle, the voice of the voiceless. The people of Argentina and Naples worshipped him.

On November 25, 2020, Diego Maradona passed away at age 60. But he didn't die - legends never die. Argentina declared three days of national mourning. Thousands wept in the streets and shouted his name.

Maradona's legacy transcends football. He showed the poor people of the world that you can reach the top from the very bottom. The hand of God was always above them.`
    },
    victoryText: {
      fa: 'قطره‌های اشک روی صورتت جاری بود، اما تو لبخند می‌زدی. مسیرت را رفته بودی - از خاک ویلا فیوریتو تا قله جهان. مردم فریاد می‌زدند "ال دیگو!" و تو می‌دانستی که این عشق هیچ‌وقت تمام نمی‌شود. اسطوره‌ها هرگز نمی‌میرند، آنها در قلب مردم زنده می‌مانند. دست خدا برای همیشه بالای سر آرژانتین است.',
      en: 'Tears streamed down your face, but you were smiling. You had walked your path - from the dust of Villa Fiorito to the peak of the world. The people shouted "El Diego!" and you knew this love would never end. Legends never die, they live on in people\'s hearts. The hand of God is forever above Argentina.'
    },
    year: '1994-2020',
    words: [
      { word: 'اسطوره', clue: 'مارادونا برای همیشه یک ... باقی ماند' },
      { word: 'اعتیاد', clue: 'مشکل بزرگ سال‌های پایانی زندگی دیگو' },
      { word: 'عزای', clue: 'عمومی، آرژانتین برای مرگ دیگو اعلام کرد' },
      { word: 'دوست', clue: 'مردم آرژانتین و ناپل دیگو را ... می‌داشتند و او را می‌پرستیدند | علاقه داشتن' },
      { word: 'اشک', clue: 'واکنش مردم به مرگ مارادونا | چیزی که در مرگ دیگو ریخته شد' },
      { word: 'خاک', clue: 'ویلا فیوریتو از ... ساخته شده بود' },
      { word: 'جهان', clue: 'مارادونا در سراسر ... محبوب بود و به مردم فقیر ... نشان داد می‌توان از پایین به اوج رسید | کره زمین' },
      { word: 'مردم', clue: 'طبقه کارگر دیگو را نماینده خود می‌دانستند' },
      { word: 'نماد', clue: 'مارادونا ... مبارزه طبقه کارگر بود' },
      { word: 'عشق', clue: 'مارادونا هیچوقت ... مردم را از دست نداد و نماد مبارزه طبقه کارگر بود | علاقه شدید' },
      { word: 'جاودان', clue: 'اسطوره‌ها هرگز نمی‌میرند و مارادونا با گل قرن و دست خدا ... شد | همیشگی و ابدی' },
      { word: 'فریاد', clue: 'نام دیگو در خیابان‌ها ... می‌شد' },
      { word: 'شصت', clue: 'سن مارادونا هنگام مرگ' },
      { word: 'گریه', clue: 'واکنش دیگو بعد از حذف از جام ۱۹۹۴' },
    ],
    bgEmoji: '🌙',
  },
];

// ─── MESSI ─────────────────────────────────────────────
// 7 chapters covering his legendary career

export const MESSI_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'messi_rosario',
    legendId: 'messi',
    chapterIndex: 0,
    title: { fa: 'کودکی در روساریو', en: 'Childhood in Rosario' },
    subtitle: { fa: 'از خاک تا ستاره', en: 'From Dust to Star' },
    story: {
      fa: `۲۴ ژوئن ۱۹۸۷، در شهر روساریو آرژانتین، لیونل مسی در خانواده‌ای فقیر به دنیا آمد. پدرش خورخه در کارخانه فولاد کار می‌کرد و مادرش سلیا با چهار فرزند خانه‌داری می‌کرد. مسی کوچک‌ترین فرزند خانواده بود.

      از سه سالگی، توپ همیشه همراه لیونل بود. مادربزرگش سلیا، بزرگ‌ترین مشوق او بود. هر روز او را به زمین تمرین می‌برد و می‌گفت: «تو روزی بزرگ‌ترین بازیکن جهان می‌شوی.» مسی با پسرعموهایش در کوچه‌های خاکی محله محله لاس هراس بازی می‌کرد و همه را با استعداد شگفت‌انگیزش حیرت‌زده می‌کرد.

      در چهار سالگی، اولین تیمش را به نام گراندولی در محله خودش پیدا کرد. مربی تیم بلافاصله فهمید که این کودک با نبوغ خاصی متولد شده است. توپ به پاهایش چسبیده بود.

      اما در هشت سالگی، خبری تلخ آمد: مادربزرگش سلیا درگذشت. مسی هر گلی که زد را به او تقدیم می‌کرد، به آسمان اشاره می‌کرد و می‌گفت: «این برای تو، مادربزرگ.»`,
      en: `On June 24, 1987, in the city of Rosario, Argentina, Lionel Messi was born into a poor family. His father Jorge worked at a steel factory and his mother Celia was a homemaker with four children. Messi was the youngest of the family.

      From age three, the ball was always with Lionel. His grandmother Celia was his greatest supporter. She took him to practice every day and said: "You will become the greatest player in the world one day." Messi played with his cousins in the dusty streets of Las Heras neighborhood and amazed everyone with his extraordinary talent.

      At age four, he found his first team, Grandoli, in his own neighborhood. The coach immediately understood that this child was born with special genius. The ball was glued to his feet.

      But at age eight, bitter news came: his grandmother Celia passed away. Messi dedicated every goal he scored to her, pointing to the sky and saying: "This is for you, Grandma."`
    },
    victoryText: {
      fa: 'با توپ کهنه در کوچه‌های روساریو می‌دویدی و مادربزرگت از دور نگاهت می‌کرد. چشمانش پر از اشک بود و لبخندی بر لب داشت. او باور داشت و همین باور تو را تا اوج خواهد برد. هر گلی که زدی و هر جامی که گرفتی، تویی که به مادربزرگت قول دادی - این تنها شروع یک افسانه بود.',
      en: 'You ran through the streets of Rosario with an old ball, and your grandmother watched from afar. Her eyes were full of tears and she had a smile on her lips. She believed, and that belief would carry you to the top. Every goal you scored and every trophy you won - you promised your grandmother. This was only the beginning of a legend.'
    },
    year: '1987-2000',
    words: [
      { word: 'فوتبال', clue: 'مسی از سه سالگی در کوچه‌های محله لاس هراس عاشق این ورزش شد' },
      { word: 'کودک', clue: 'مسی کوچک‌ترین ... خانواده بود' },
      { word: 'روساریو', clue: 'شهر محل تولد مسی در آرژانتین' },
      { word: 'استعداد', clue: 'نبوغ ذاتی مسی در فوتبال | چیزی که مسی را از دیگران متمایز می‌کرد' },
      { word: 'مادربزرگ', clue: 'بزرگ‌ترین مشوق مسی در کودکی' },
      { word: 'توپ', clue: 'همیشه همراه مسی از سه سالگی' },
      { word: 'خانواده', clue: 'مسی چهارمین فرزند ... خود بود' },
      { word: 'آرژانتین', clue: 'کشور محل تولد لیونل مسی' },
      { word: 'تمرین', clue: 'مادربزرگ سلیا هر روز مسی را به زمین ... می‌برد و می‌گفت تو روزی بزرگترین می‌شوی | محل آماده‌سازی' },
      { word: 'محله', clue: 'لاس هراس نام ... کودکی مسی' },
      { word: 'بازی', clue: 'مسی با پسرعموهایش در کوچه‌های خاکی محله لاس هراس این کار را می‌کرد' },
      { word: 'مربی', clue: 'اولین ... مسی در گراندولی | کسی که نبوغ مسی را زود تشخیص داد' },
      { word: 'کوچه', clue: 'جایی که مسی با پسرعموهایش بازی می‌کرد' },
      { word: 'فقیر', clue: 'خانواده مسی در روساریو این وضعیت را داشت و پدرش در کارخانه فولاد کار می‌کرد | نداشتن پول کافی' },
    ],
    bgEmoji: '🏘️',
  },
  {
    id: 'messi_napkin',
    legendId: 'messi',
    chapterIndex: 1,
    title: { fa: 'دستمال سفره معروف', en: 'The Famous Napkin Contract' },
    subtitle: { fa: 'قراردادی بر روی کاغذ', en: 'A Contract on Paper' },
    story: {
      fa: `مسی در تیم نولز اولد بویز بازی می‌کرد و رکوردهای گلزنی را می‌شکست. اما در ۱۱ سالگی، پزشکان تشخیص دادند که او دچار کمبود هورمون رشد است. درمان ماهانه ۱۵۰۰ دلار هزینه داشت و خانواده مسی توان پرداخت آن را نداشت. پدرش خورخه از باشگاه ریور پلات کمک خواست، اما آنها حاضر نشدند هزینه درمان را تقبل کنند.

      اینجا بود که کارلس رکساچ، مدیر ورزشی بارسلونا، وارد داستان شد. او مسی را در یک بازی آزمایشی دید و شگفت‌زده شد. اما مشکل این بود که بارسلونا باید سریع تصمیم می‌گرفت و کاغذ اداری در دسترس نبود.

      در رستورانی نزدیک ورزشگاه، رکساچ یک دستمال کاغذی برداشت و روی آن نوشت: «من به عنوان مدیر ورزشی بارسلونا، متعهد می‌شوم هزینه درمان لیونل مسی را تقبل کنم.» مسی و پدرش با چشمانی اشک‌آلود آن دستمال را خواندند. این ساده‌ترین و در عین حال مهم‌ترین قرارداد تاریخ فوتبال بود.

      سال بعد، مسی ۱۳ ساله به همراه پدرش به اسپانیا نقل مکان کرد. دوران لاماسیا آغاز شده بود.`,
      en: `Messi played for Newell's Old Boys and was breaking goal-scoring records. But at age 11, doctors diagnosed him with growth hormone deficiency. Treatment cost $1,500 a month and his family couldn't afford it. His father Jorge asked River Plate for help, but they refused to cover the treatment costs.

      This was when Carles Rexach, Barcelona's sporting director, entered the story. He saw Messi in a trial match and was amazed. But the problem was that Barcelona had to decide quickly and there was no official paper available.

      In a restaurant near the stadium, Rexach picked up a paper napkin and wrote on it: "As Barcelona's sporting director, I commit to covering Lionel Messi's treatment costs." Messi and his father read it with tearful eyes. It was the simplest yet most important contract in football history.

      The following year, 13-year-old Messi moved to Spain with his father. The La Masia era had begun.`
    },
    victoryText: {
      fa: 'پدرت دستمال کاغذی را در جیبش گذاشته بود، انگار که گنجی ارزشمند باشد. اشک در چشمانت حلقه زده بود. یک تکه کاغذ ساده مسیر زندگیات را تغییر می‌داد. از روساریو تا بارسلونا، از یک کودک ناشناخته تا آینده‌ای درخشان. لاماسیا منتظر تو بود و تو حاضر بودی همه چیز را فتح کنی.',
      en: 'Your father had put the paper napkin in his pocket, as if it were a precious treasure. Tears welled in your eyes. A simple piece of paper was changing the course of your life. From Rosario to Barcelona, from an unknown child to a brilliant future. La Masia was waiting for you, and you were ready to conquer everything.'
    },
    year: '2000-2004',
    words: [
      { word: 'بارسلونا', clue: 'تیمی که هزینه درمان مسی را تقبل کرد' },
      { word: 'قرارداد', clue: 'چیزی که روی دستمال نوشته شد' },
      { word: 'دستمال', clue: 'کاغذی که قرارداد مسی روی آن نوشته شد' },
      { word: 'اسپانیا', clue: 'کشوری که مسی برای درمان به آن رفت' },
      { word: 'پزشک', clue: 'کسی که کمبود هورمون رشد مسی را تشخیص داد' },
      { word: 'رشد', clue: 'هورمون ... برای درمان مسی نیاز بود' },
      { word: 'نوجوان', clue: 'سن مسی هنگام انتقال به بارسلونا' },
      { word: 'لاماسیا', clue: 'آکادمی جوانان بارسلونا' },
      { word: 'کاتالونیا', clue: 'منطقه اسپانیا که بارسلونا در آن است' },
      { word: 'مربی', clue: 'کارلس رکساچ ... ورزشی بارسلونا بود' },
      { word: 'آینده', clue: 'با قرارداد بارسلونا و رفتن به لاماسیا، ... درخشان مسی در فوتبال آغاز شد | دوران پیش رو' },
      { word: 'امید', clue: 'بعد از امضای قرارداد روی دستمال کاغذی، ... در دل خانواده مسی زنده شد | انتظار مثبت برای آینده' },
      { word: 'درمان', clue: 'مسی در اسپانیا ... کمبود هورمون رشد را به هزینه بارسلونا دریافت کرد | مداوا' },
    ],
    bgEmoji: '📝',
  },
  {
    id: 'messi_number10',
    legendId: 'messi',
    chapterIndex: 2,
    title: { fa: 'شماره ۱۰ افسانه‌ای', en: 'The Legendary Number 10' },
    subtitle: { fa: 'از نیمکت تا نوکمپ', en: 'From Bench to Camp Nou' },
    story: {
      fa: `۱۶ اکتبر ۲۰۰۴، مسی ۱۷ ساله در بازی مقابل اسپانیول اولین بازی رسمی خود را برای بارسلونا انجام داد. او جوان‌ترین بازیکنی بود که تا آن زمان برای بارسا به میدان رفته بود. فرانک رایکارد، سرمربی وقت، به او اعتماد کرد.

      در اولین گلش برای بارسلونا، پاس رونالدینیو را دریافت کرد و با ضربه‌ای چیپ، دروازه آلباسته را گشود. رونالدینیو او را روی دوش گرفت و به تماشاگران نشان داد: «پادشاه جدید بارسا.» آن لحظه، همه فهمیدند که شماره ۱۰ بعدی بارسلونا متولد شده است.

      وقتی رونالدینیو در سال ۲۰۰۸ بارسلونا را ترک کرد، مسی پیراهن شماره ۱۰ را به تن کرد. پپ گواردیولا به او گفت: «این پیراهن وزن دارد، اما تو می‌توانی آن را حمل کنی.» مسی نه تنها آن را حمل کرد، بلکه بارسلونا را به اوج رساند.

      در فصل ۲۰۰۸-۰۹، مسی ۳۸ گل زد و بارسلونا سه‌گانه (لالیگا، جام حذفی، لیگ قهرمانان) را فتح کرد. تکنیک خارق‌العاده، دریبل‌های کوتاه و دید فوق‌العاده او، دنیای فوتبال را مسحور کرده بود.`,
      en: `On October 16, 2004, 17-year-old Messi made his official debut for Barcelona against Espanyol. He was the youngest player to have played for Barça at that time. Frank Rijkaard, the coach, trusted him.

      For his first goal for Barcelona, he received a pass from Ronaldinho and chipped the ball over the Albacete goalkeeper. Ronaldinho lifted him onto his shoulders and showed him to the fans: "The new king of Barça." In that moment, everyone knew the next number 10 of Barcelona was born.

      When Ronaldinho left Barcelona in 2008, Messi put on the number 10 jersey. Pep Guardiola told him: "This shirt has weight, but you can carry it." Messi not only carried it, but took Barcelona to new heights.

      In the 2008-09 season, Messi scored 38 goals and Barcelona won the treble (La Liga, Copa del Rey, Champions League). His extraordinary technique, short dribbles, and incredible vision mesmerized the football world.`
    },
    victoryText: {
      fa: 'پیراهن شماره ۱۰ را از رونالدینیو تحویل گرفتی، سنگین‌ترین میراث فوتبال. تماشاگران نوکمپ برخاستند و نام تو را فریاد زدند. پپ گفت: «حملش کن.» و تو نه تنها حمل کردی، بلکه با آن پرواز کردی. سه‌گانه، گل‌های بی‌نظیر، دریبل‌های مسحورکننده - تو دیگر مسی کوچک نبودی، تو افسانه بودی.',
      en: 'You received the number 10 jersey from Ronaldinho, the heaviest legacy in football. The Camp Nou crowd rose and shouted your name. Pep said: "Carry it." And you not only carried it, you flew with it. The treble, incredible goals, mesmerizing dribbles - you were no longer little Messi, you were a legend.'
    },
    year: '2004-2009',
    words: [
      { word: 'شماره', clue: '۱۰، پیراهن معروف مسی در بارسلونا' },
      { word: 'پیراهن', clue: 'شماره ۱۰ معروف روی آن نقش بست' },
      { word: 'اولین', clue: 'بازی رسمی مسی در ۱۷ سالگی' },
      { word: 'رونالدینیو', clue: 'ستاره برزیلی که مسی را روی دوش گرفت' },
      { word: 'گل', clue: 'اولین ... مسی با ضربه چیپ بود' },
      { word: 'نوکمپ', clue: 'ورزشگاه خانگی بارسلونا' },
      { word: 'جوان', clue: 'مسی ...‌ترین بازیکن تاریخ بارسا در اولین بازی' },
      { word: 'تکنیک', clue: 'مهارت خارق‌العاده مسی در دریبل' },
      { word: 'دریبل', clue: 'حرکت معروف مسی در عبور از حریف' },
      { word: 'سه‌گانه', clue: 'فاتح لالیگا، جام حذفی و لیگ قهرمانان' },
      { word: 'قهرمانی', clue: 'سه‌گانه بارسلونا در ۲۰۰۹ | نتیجه اولین فصل کامل مسی با شماره ۱۰' },
      { word: 'گواردیولا', clue: 'مربی که پیراهن ۱۰ را به مسی سپرد' },
      { word: 'فوق‌العاده', clue: 'تکنیک ... مسی با دریبل‌های کوتاه و دید بالا دنیای فوتبال را مسحور کرد | بی‌نظیر و شگفت‌انگیز' },
    ],
    bgEmoji: '🔟',
  },
  {
    id: 'messi_91goals',
    legendId: 'messi',
    chapterIndex: 3,
    title: { fa: '۹۱ گل در یک سال', en: '91 Goals in a Calendar Year' },
    subtitle: { fa: 'شکستن رکورد گرد مولر', en: 'Breaking Gerd Muller\'s Record' },
    story: {
      fa: `سال ۲۰۱۲، سالی که مسی تاریخ را بازنویسی کرد. رکورد گرد مولر افسانه‌ای - ۸۵ گل در یک سال میلادی - ۴۰ سال بود که دست‌نخورده باقی مانده بود. خیلی‌ها فکر می‌کردند این رکورد هیچ‌وقت شکسته نمی‌شود. اما مسی آمده بود تا غیرممکن را ممکن کند.

      در ۹ دسامبر ۲۰۱۲، مسی در بازی مقابل رئال بتیس دو گل زد و با ۸۶ گل، رکورد مولر را شکست. ورزشگاه نوکمپ منفجر شد. هواداران فریاد می‌زدند: "مسی! مسی! مسی!" حتی بازیکنان رئال بتیس هم او را تشویق کردند.

      مسی اما متوقف نشد. تا پایان سال، ۹۱ گل زده بود - رکوردی که باورنکردنی به نظر می‌رسید. ۷۹ گل برای بارسلونا و ۱۲ گل برای آرژانتین. در آن سال، چهار بار توپ طلا را پشت سر هم برد.

      ال کلاسیکوها، دربی‌ها، فینال‌ها - مسی در همه مسابقات می‌درخشید. او فقط گل نمی‌زد، شاهکار خلق می‌کرد. هر بازی یک نقاشی، هر گل یک اثر هنری.`,
      en: `The year 2012, the year Messi rewrote history. The legendary Gerd Muller's record - 85 goals in a calendar year - had remained untouched for 40 years. Many thought this record would never be broken. But Messi had come to make the impossible possible.

      On December 9, 2012, Messi scored two goals against Real Betis and broke Muller's record with 86 goals. The Camp Nou exploded. Fans shouted: "Messi! Messi! Messi!" Even the Real Betis players applauded him.

      But Messi didn't stop. By the end of the year, he had scored 91 goals - a record that seemed unbelievable. 79 goals for Barcelona and 12 for Argentina. That year, he won the Ballon d'Or four times in a row.

      El Clásicos, derbies, finals - Messi shone in every match. He didn't just score goals, he created masterpieces. Every game a painting, every goal a work of art.`
    },
    victoryText: {
      fa: 'چهار دهه بود که رکورد گرد مولر دست‌نخورده ایستاده بود و همه می‌گفتند غیرممکن است. اما تو با ۹۱ گل در یک سال، تاریخ را بازنویسی کردی. نوکمپ ایستاده تو را تشویق می‌کرد و حتی حریفان برایت دست می‌زدند. تو نه فقط رکورد شکستی، بلکه مرز باور انسان را جابه‌جا کردی.',
      en: 'For four decades, Gerd Muller\'s record stood untouched and everyone said it was impossible. But with 91 goals in a single year, you rewrote history. Camp Nou stood and cheered, and even opponents applauded you. You didn\'t just break a record - you moved the boundaries of human belief.'
    },
    year: '2010-2014',
    words: [
      { word: 'رکورد', clue: '۸۵ گل گرد مولر که مسی شکست | چیزی که مسی در سال ۲۰۱۲ شکست' },
      { word: 'گل', clue: 'مسی ۹۱ ... در یک سال زد' },
      { word: 'سال', clue: '۲۰۱۲، ... که مسی تاریخ را بازنویسی کرد' },
      { word: 'هنر', clue: 'توصیف بازی مسی: هر بازی یک ... | اثر هنری مسی در زمین' },
      { word: 'شکستن', clue: 'مسی با ۸۶ گل رکورد ۴۰ ساله گرد مولر را ... | خرد کردن رکورد' },
      { word: 'الکلاسیکو', clue: 'بازی بارسلونا و رئال مادرید' },
      { word: 'رکوردشکنی', clue: 'ویژگی برجسته مسی در سال ۲۰۱۲' },
      { word: 'بازیکن', clue: 'مسی با ۹۱ گل در سال ۲۰۱۲ بهترین ... جهان شد و چهار توپ طلا پیاپی برد | فوتبالیست' },
      { word: 'تاریخ', clue: 'سال ۲۰۱۲ مسی صفحه جدیدی در ... فوتبال بازنویسی کرد و رکورد ۴۰ ساله را شکست | گذشته و سابقه' },
      { word: 'بهترین', clue: 'مسی در سال ۲۰۱۲ ... بازیکن سال جهان شد و نوکمپ ایستاده او را تشویق کرد | عالی‌ترین' },
      { word: 'آمار', clue: 'مسی در سال ۲۰۱۲ ... ۷۹ گل برای بارسا و ۱۲ گل برای آرژانتین ثبت کرد | اعداد و ارقام عملکرد' },
      { word: 'مولر', clue: 'گرد ... اسطوره آلمانی که رکوردش شکسته شد' },
      { word: 'چهار', clue: 'تعداد توپ‌های طلای پیاپی مسی' },
    ],
    bgEmoji: '⚡',
  },
  {
    id: 'messi_copa',
    legendId: 'messi',
    chapterIndex: 4,
    title: { fa: 'افسانه کوپا آمریکا', en: 'Copa America Legend' },
    subtitle: { fa: 'سرانجام جام به آرژانتین رسید', en: 'Finally, the Trophy Came to Argentina' },
    story: {
      fa: `داستان مسی با تیم ملی آرژانتین، داستانی پر از عشق و اشک بود. او در سال ۲۰۰۵ اولین بازی ملی خود را انجام داد و در جام جهانی ۲۰۰۶ جوان‌ترین گلزن تاریخ آرژانتین شد. اما سال‌ها طول کشید تا طعم قهرمانی با تیم ملی را بچشد.

      فینال جام جهانی ۲۰۱۴ مقابل آلمان، تلخ‌ترین خاطره مسی بود. در دقیقه ۱۱۳، گوتسه دروازه آرژانتین را باز کرد و مسی با چشمانی اشک‌آلود به جام نگاه کرد که از دستانش دور شد. کوپا آمریکا ۲۰۱۵ و ۲۰۱۶ هم فاجعه بود - دو فینال، دو باخت در ضربات پنالتی. مسی بعد از ۲۰۱۶ از تیم ملی خداحافظی کرد.

      اما عشق مردم آرژانتین به مسی، او را برگرداند. در سال ۲۰۲۱، مسی ۳۴ ساله کاپیتان آرژانتین را در کوپا آمریکا به فینال رساند. در ورزشگاه ماراکانا، مقابل برزیل میزبان. آنجل دی ماریا با پاس فوق‌العاده مسی گل زد و آرژانتین ۱-۰ پیروز شد.

      مسی روی زانوهایش افتاد و گریه کرد. یک عمر انتظار، چهار فینال تلخ - بالاخره جام با آرژانتین بود.`,
      en: `Messi's story with the Argentina national team was a tale full of love and tears. He made his debut in 2005 and became Argentina's youngest goal-scorer at the 2006 World Cup. But it took years for him to taste championship glory with the national team.

      The 2014 World Cup final against Germany was Messi's bitterest memory. In the 113th minute, Götze scored and Messi watched the trophy slip away with tearful eyes. Copa America 2015 and 2016 were disasters - two finals, two losses on penalties. After 2016, Messi retired from the national team.

      But the love of the Argentine people brought him back. In 2021, a 34-year-old Messi captained Argentina to the Copa America final. At the Maracanã stadium, against hosts Brazil. Ángel Di María scored after a brilliant Messi pass, and Argentina won 1-0.

      Messi fell to his knees and cried. A lifetime of waiting, four bitter finals - finally, the trophy belonged to Argentina.`
    },
    victoryText: {
      fa: 'چهار فینال، چهار بار اشک. مردم آرژانتین سال‌ها منتظر این لحظه بودند و تو کاپیتانشان بودی. در برابر برزیل، در ماراکانا، جایی که همه خوابش را دیده بودند. وقتی سوت پایان به صدا درآمد، روی زانوهایت افتادی و آسمان را نگاه کردی. مادربزرگ، این برای تو. این برای همه آرژانتین.',
      en: 'Four finals, four times tears. The people of Argentina had waited years for this moment and you were their captain. Against Brazil, at the Maracanã, where everyone had dreamed of it. When the final whistle blew, you fell to your knees and looked at the sky. Grandma, this is for you. This is for all of Argentina.'
    },
    year: '2015-2021',
    words: [
      { word: 'کوپا', clue: 'آمریکا، مسابقات قهرمانی آمریکای جنوبی' },
      { word: 'آمریکا', clue: 'قاره محل برگزاری کوپا' },
      { word: 'قهرمانی', clue: 'عنوانی که آرژانتین در ۲۰۲۱ گرفت' },
      { word: 'کاپ', clue: 'مسی بالاخره ... کوپا آمریکا را در ماراکانا بالای سر برد و اشک ریخت | جام قهرمانی' },
      { word: 'نهایی', clue: 'فینال مرحله ... مسابقات' },
      { word: 'جام', clue: 'چیزی که مسی بالاخره با آرژانتین برد' },
      { word: 'اشک', clue: 'واکنش مسی بعد از قهرمانی کوپا آمریکا' },
      { word: 'آرژانتین', clue: 'کشوری که مسی برای آن جام گرفت' },
      { word: 'کاپیتان', clue: 'عنوان مسی در تیم ملی آرژانتین' },
      { word: 'افتخار', clue: 'مسی با قهرمانی کوپا آمریکا ۲۰۲۱ ... و شادی را پس از چهار فینال تلخ به آرژانتین آورد | سربلندی' },
      { word: 'مبارزه', clue: 'مسی سالها برای رسیدن به جام با تیم ملی ... کرد و بالاخره در کوپا ۲۰۲۱ پیروز شد | تلاش و جنگیدن' },
      { word: 'سرانجام', clue: 'بعد از سه فینال تلخ پیاپی، مسی ... در ماراکانا جام کوپا را بالای سر برد | عاقبت و نهایت' },
      { word: 'ماراکانا', clue: 'ورزشگاه محل فینال کوپا آمریکا ۲۰۲۱' },
      { word: 'برزیل', clue: 'کشور میزبان و حریف فینال کوپا ۲۰۲۱' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'messi_worldcup',
    legendId: 'messi',
    chapterIndex: 5,
    title: { fa: 'فتح جام جهانی ۲۰۲۲', en: '2022 World Cup Glory' },
    subtitle: { fa: 'رویایی که به حقیقت پیوست', en: 'A Dream Come True' },
    story: {
      fa: `قطر، دسامبر ۲۰۲۲. مسی ۳۵ ساله در آخرین جام جهانی خود، آرژانتین را به فینال رساند. مسیر آسان نبود - شکست شوک‌آور مقابل عربستان در اولین بازی، بردهای نفس‌گیر در مراحل حذفی، و سپس فینال رویایی مقابل فرانسه در ورزشگاه لوسیل.

      فینال، بزرگترین بازی تاریخ فوتبال. مسی از روی نقطه پنالتی گل زد، آنخل دی ماریا یک گل رویایی اضافه کرد، و آرژانتین ۲-۰ جلو بود. اما کیلیان امباپه، ستاره فرانسه، در دو دقیقه دو گل زد و بازی را به تساوی کشاند.

      وقت اضافه: مسی دوباره گل زد، ۳-۲. امباپه هت‌تریک کرد، ۳-۳. ضربات پنالتی. مسی اولین پنالتی را زد. آرژانتین ۴-۲ در پنالتی‌ها پیروز شد.

      مسی بهترین بازیکن مسابقات شد. جام جهانی را بوسید، روی دوش هم‌تیمی‌ها نشست و گریه کرد. تمام زندگی او، تمام مبارزاتش، تمام ناامیدی‌ها - این لحظه ارزش همه را داشت.`,
      en: `Qatar, December 2022. A 35-year-old Messi, in his last World Cup, led Argentina to the final. The path wasn't easy - a shocking loss to Saudi Arabia in the first match, nail-biting wins in the knockout stages, and then a dream final against France at the Lusail Stadium.

      The final, the greatest game in football history. Messi scored from the penalty spot, Ángel Di María added a dream goal, and Argentina led 2-0. But Kylian Mbappé, France's superstar, scored twice in two minutes to level the match.

      Extra time: Messi scored again, 3-2. Mbappé completed his hat-trick, 3-3. Penalties. Messi scored the first penalty. Argentina won 4-2 on penalties.

      Messi became the tournament's best player. He kissed the World Cup, sat on his teammates' shoulders and cried. His entire life, all his struggles, all the disappointments - this moment was worth everything.`
    },
    victoryText: {
      fa: '۳۵ سال، پنج جام جهانی، یک عمر انتظار. فینال لوسیل حماسی‌ترین بازی تاریخ بود و تو در مرکز آن ایستاده بودی. از شکست مقابل عربستان تا ضربات پنالتی، از اشک تا لبخند. وقتی جام را بالای سر بردی، تمام آرژانتین با تو گریست. مادربزرگ، این بار جام مال توست.',
      en: '35 years, five World Cups, a lifetime of waiting. The Lusail final was the most epic game in history and you stood at its center. From the loss to Saudi Arabia to the penalty shootout, from tears to smiles. When you lifted the trophy, all of Argentina wept with you. Grandma, this time the trophy is yours.'
    },
    year: '2022',
    words: [
      { word: 'جهانی', clue: 'جام ... ۲۰۲۲ قطر در ورزشگاه لوسیل جایی که مسی آرژانتین را به قهرمانی رساند | مسابقات بین‌المللی' },
      { word: 'قطر', clue: 'کشور میزبان جام جهانی ۲۰۲۲' },
      { word: 'فینال', clue: 'مرحله آخر جام جهانی مقابل فرانسه' },
      { word: 'فرانسه', clue: 'حریف آرژانتین در فینال ۲۰۲۲' },
      { word: 'پنالتی', clue: 'ضربات ... برنده فینال را مشخص کرد' },
      { word: 'طلایی', clue: 'مسی توپ ... بهترین بازیکن مسابقات را برد' },
      { word: 'برترین', clue: 'مسی با اهدای توپ طلا به عنوان ... بازیکن جام جهانی ۲۰۲۲ انتخاب شد | عالی‌ترین' },
      { word: 'مسی', clue: 'اسطوره آرژانتینی که جام را بالای سر برد' },
      { word: 'آرژانتین', clue: 'قهرمان جهان در سال ۲۰۲۲' },
      { word: 'قهرمان', clue: 'عنوانی که آرژانتین بعد از ۳۶ سال گرفت' },
      { word: 'رویا', clue: 'مسی در قطر ...ی خود را به حقیقت تبدیل کرد و جام جهانی را بوسید و گریه کرد | آرزو' },
      { word: 'افتخار', clue: 'مسی بزرگترین ... تاریخ فوتبال آرژانتین را با قهرمانی جام جهانی ۲۰۲۲ به دست آورد | سربلندی' },
      { word: 'ملی', clue: 'تیم ... آرژانتین با کاپیتانی مسی در فینال لوسیل قهرمان جهان شد | کشوری' },
      { word: 'لوسیل', clue: 'ورزشگاه محل برگزاری فینال ۲۰۲۲' },
    ],
    bgEmoji: '🌍',
  },
  {
    id: 'messi_miami',
    legendId: 'messi',
    chapterIndex: 6,
    title: { fa: 'افسانه در میامی', en: 'Legend in Miami' },
    subtitle: { fa: 'طلوع خورشید در آمریکا', en: 'Sunrise in America' },
    story: {
      fa: `تابستان ۲۰۲۳، مسی تصمیمی گرفت که جهان فوتبال را شگفت‌زده کرد - پیوستن به اینتر میامی در آمریکا. قراردادی که فوتبال آمریکا را برای همیشه تغییر داد. هواداران در فرودگاه میامی منتظر او بودند، اشک می‌ریختند و نامش را فریاد می‌زدند.

      مسی در اولین بازی‌اش برای اینتر میامی، در دقیقه ۹۴ یک ضربه آزاد فوق‌العاده زد که همه را به یاد شماره ۱۰ افسانه‌ای انداخت. در ۷ بازی اول، ۱۰ گل زد و اینتر میامی را به اولین جام تاریخش رساند - لیگ کاپ.

      حالا مسی در میامی زندگی می‌کند، جایی که خورشید همیشه می‌تابد. او ادامه می‌دهد، رکوردها را می‌شکند و همچنان دنیا را شگفت‌زده می‌کند. شماره ۱۰ تیم ملی آرژانتین همیشه مال اوست.

      میراث مسی فقط گل‌ها و جام‌هایش نیست؛ او به نسل جدید نشان داد که با استعداد، سخت‌کوشی و فروتنی می‌توان به غیرممکن‌ها رسید. یک کودک از روساریو که با توپ کهنه در کوچه‌ها بازی می‌کرد، حالا بزرگترین اسطوره تاریخ فوتبال است.`,
      en: `Summer 2023, Messi made a decision that shocked the football world - joining Inter Miami in America. A contract that would change American football forever. Fans waited for him at Miami airport, crying and shouting his name.

      In his first match for Inter Miami, Messi scored an incredible free kick in the 94th minute that reminded everyone of the legendary number 10. In his first 7 games, he scored 10 goals and led Inter Miami to their first trophy - the Leagues Cup.

      Now Messi lives in Miami, where the sun always shines. He continues, breaks records, and still amazes the world. The number 10 jersey of Argentina's national team will always be his.

      Messi's legacy is not just his goals and trophies; he showed a new generation that with talent, hard work, and humility, you can achieve the impossible. A child from Rosario who played with an old ball in the streets is now the greatest legend in football history.`
    },
    victoryText: {
      fa: 'خورشید میامی بر صورتت می‌تابید و تو لبخند می‌زدی. از روساریو تا بارسلونا، از پاریس تا میامی - مسیرت پر از افتخار بود. یک کودک فقیر با رویاهای بزرگ، حالا نماد جهانی فوتبال. مادربزرگت از آسمان نگاه می‌کرد و لبخند می‌زد. افسانه پایان ندارد، فقط تغییر مسیر می‌دهد.',
      en: 'The Miami sun shone on your face and you smiled. From Rosario to Barcelona, from Paris to Miami - your path was full of glory. A poor child with big dreams, now a global icon of football. Your grandmother watched from the sky and smiled. Legends never end, they just change direction.'
    },
    year: '2023-',
    words: [
      { word: 'میامی', clue: 'شهر جدید مسی در آمریکا' },
      { word: 'آمریکا', clue: 'کشوری که مسی به آن نقل مکان کرد' },
      { word: 'اینتر', clue: 'میامی، تیم جدید مسی' },
      { word: 'تاج', clue: 'مسی در میامی با گل ضربه آزاد در دقیقه ۹۴ ثابت کرد که ... پادشاهی فوتبال هنوز بر سر اوست | نماد پادشاهی' },
      { word: 'پایان', clue: 'برخلاف تصور که میامی ... راه مسی است، او همچنان می‌درخشد و رکورد می‌شکند | نقطه تمام' },
      { word: 'اسطوره', clue: 'مسی بزرگترین ... تاریخ فوتبال است' },
      { word: 'طرفداران', clue: 'کسانی که مسی را در فرودگاه میامی استقبال کردند' },
      { word: 'ماندگار', clue: 'میراث مسی در میامی فقط گل‌ها نیست؛ او الهام‌بخش نسل جدید و ... در تاریخ فوتبال است | پایدار و جاویدان' },
      { word: 'خاطره', clue: 'مسی با ضربه آزاد دقیقه ۹۴ در اولین بازی اینتر میامی یک ... فراموش‌نشدنی ساخت | یادگار گذشته' },
      { word: 'عشق', clue: 'هواداران در فرودگاه میامی اشک می‌ریختند و نام مسی را فریاد می‌زدند از سر ... | علاقه شدید' },
      { word: 'فوتبال', clue: 'ورزشی که مسی آن را متحول کرد' },
      { word: 'الهام', clue: 'مسی به نسل جدید نشان داد با استعداد، سخت‌کوشی و فروتنی می‌توان به غیرممکن‌ها رسید و ... بخشید | انگیزه دادن' },
      { word: 'رکورد', clue: 'مسی در میامی با ۱۰ گل در ۷ بازی اینتر میامی را به اولین جام رساند و ... شکستن را ادامه داد | حد نصاب' },
      { word: 'جام', clue: 'مسی اینتر میامی را به اولین ... تاریخش رساند' },
    ],
    bgEmoji: '☀️',
  },
];

// ─── PELE ──────────────────────────────────────────────
// 5 chapters covering his legendary life

export const PELE_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'pele_bauru',
    legendId: 'pele',
    chapterIndex: 0,
    title: { fa: 'کودکی در بائورو', en: 'Childhood in Bauru' },
    subtitle: { fa: 'توپ پارچه‌ای و رویاهای بزرگ', en: 'Rag Ball and Big Dreams' },
    story: {
      fa: `۲۳ اکتبر ۱۹۴۰، در شهر کوچک ترس کوراسویس در میناس گرایس برزیل، ادسون آرانتس دو ناسیمنتو - همان پله افسانه‌ای - به دنیا آمد. پدرش دوندینیو یک فوتبالیست شکست‌خورده بود که به دلیل مصدومیت زانو نتوانست به آرزوهایش برسد. خانواده آنقدر فقیر بودند که گاهی غذا برای خوردن نداشتند.

خانواده پله بعداً به شهر بائورو نقل مکان کردند. در کودکی، پله با یک توپ پارچه‌ای که از جوراب کهنه و روزنامه درست کرده بود در کوچه‌های خاکی بازی می‌کرد. او به جای کفش، پابرهنه بازی می‌کرد و با بچه‌های بزرگتر رقابت می‌کرد.

مادرش سلستین نمی‌خواست پسرش فوتبالیست شود - او می‌ترسید پله مانند پدرش شکست بخورد. اما پله عاشق فوتبال بود. تیم محل‌ای او "دل کیم" نام داشت، تیمی از بچه‌های محله که در مسابقات محلی شرکت می‌کردند.

دوندینیو، پدر پله، با وجود ناامیدی‌های خودش، مخفیانه پسرش را آموزش می‌داد. او به پله یاد داد که چگونه توپ را با پای چپ و راست شوت کند و چگونه سر بزند - مهارت‌هایی که بعدها پله را بی‌نظیر کرد.`,
      en: `On October 23, 1940, in the small town of Três Corações in Minas Gerais, Brazil, Edson Arantes do Nascimento - the legendary Pelé - was born. His father Dondinho was a failed footballer who couldn't reach his dreams due to a knee injury. The family was so poor that sometimes they had nothing to eat.

Pelé's family later moved to the city of Bauru. As a child, Pelé played with a rag ball made from old socks and newspapers in the dusty streets. He played barefoot instead of wearing shoes, competing with older kids.

His mother Celeste didn't want her son to become a footballer - she was afraid Pelé would fail like his father. But Pelé loved football. His local team was called "De Kalim," a group of neighborhood kids who participated in local tournaments.

Dondinho, Pelé's father, despite his own disappointments, secretly trained his son. He taught Pelé how to shoot with both left and right foot and how to head the ball - skills that would later make Pelé unique.`
    },
    victoryText: {
      fa: 'در کوچه‌های خاکی بائورو پابرهنه می‌دویدی و توپ پارچه‌ای را به دیوار می‌زدنی. پدرت از دور نگاهت می‌کرد و لبخند می‌زد - او رؤیای از دست رفته خود را در چشمان تو می‌دید. مادرت هنوز نگران بود، اما تو می‌دانستی که برای چیزی بزرگ ساخته شده‌ای. بائورو کوچک بود، اما رؤیای تو اندازه جهان بود.',
      en: 'You ran barefoot through the dusty streets of Bauru, kicking your rag ball against the wall. Your father watched from a distance and smiled - he saw his lost dream in your eyes. Your mother was still worried, but you knew you were made for something great. Bauru was small, but your dream was the size of the world.'
    },
    year: '1940-1956',
    words: [
      { word: 'فوتبال', clue: 'پله با توپ پارچه‌ای پابرهنه در کوچه‌های بائورو این ورزش را می‌کرد' },
      { word: 'پابرهنه', clue: 'حالت بازی پله در کودکی به دلیل نداشتن کفش' },
      { word: 'فقیر', clue: 'وضعیت اقتصادی خانواده پله' },
      { word: 'پدر', clue: 'دوندینیو ... پله بود' },
      { word: 'توپ', clue: 'پارچه‌ای، اولین ... پله' },
      { word: 'برزیل', clue: 'کشور محل تولد پله' },
      { word: 'رویا', clue: 'توپ پارچه‌ای در کوچه‌های بائورو و ...های بزرگ پله برای قهرمانی جهان | آرزو' },
      { word: 'کودکی', clue: 'دوران ... پله در شهر بائورو گذشت جایی که با توپ پارچه‌ای بازی می‌کرد | خردسالی' },
      { word: 'استعداد', clue: 'ویژگی بارز پله از کودکی' },
      { word: 'کوچه', clue: 'محل بازی پله در محله' },
      { word: 'آموزش', clue: 'کاری که دوندینیو مخفیانه با پله می‌کرد' },
      { word: 'خاکی', clue: 'جنس زمین کوچه‌های محل بازی پله' },
      { word: 'مسابقه', clue: 'تیم دل کیم از بچه‌های محله در ...‌های محلی شرکت می‌کرد و پله ستاره آن بود | رقابت' },
      { word: 'مهارت', clue: 'دوندینیو مخفیانه به پله ... شوت با دو پا و ضربه سر را یاد داد | توانایی فنی' },
    ],
    bgEmoji: '🥅',
  },
  {
    id: 'pele_santos',
    legendId: 'pele',
    chapterIndex: 1,
    title: { fa: 'ستاره سانتوس', en: 'Santos Star' },
    subtitle: { fa: 'نوجوانی که جهان را متحیر کرد', en: 'The Teen Who Amazed the World' },
    story: {
      fa: `در ۱۵ سالگی، پله به باشگاه سانتوس پیوست - تصمیمی که تاریخ فوتبال را تغییر داد. والدینش ابتدا مخالف بودند، اما مربی سانتوس، والدمار دو بریتو، آنها را قانع کرد. دو بریتو به مادر پله گفت: «این پسر بزرگ‌ترین فوتبالیست جهان خواهد شد.»

پله در اولین بازی رسمی خود برای سانتوس در سپتامبر ۱۹۵۶، مقابل کورینتیانس وارد زمین شد و یک گل زد. تنها ۱۵ سال و ۱۱ ماه داشت. تماشاگران نمی‌توانستند باور کنند که یک نوجوان این چنین بازی می‌کند.

در اولین فصل کامل خود (۱۹۵۷)، پله ۳۶ گل در ۳۵ بازی زد - رکوردی خارق‌العاده برای یک بازیکن ۱۶ ساله. مهارت‌های او با توپ، سرعت باورنکردنی و توانایی گلزنی با هر دو پا و سر، او را به یک پدیده تبدیل کرده بود.

سبک بازی پله انقلابی بود. او مهاجمی بود که در سراسر زمین حرکت می‌کرد، از خط میانی شروع می‌کرد، از دفاع‌ها عبور می‌کرد و با قدرت شوت می‌زد. برزیلی‌ها او را "پله" صدا می‌کردند - نامی که خودش معنی آن را نمی‌دانست، اما همه جهان آن را می‌شناختند.`,
      en: `At age 15, Pelé joined Santos FC - a decision that changed football history. His parents were initially opposed, but Santos coach Waldemar de Brito convinced them. De Brito told Pelé's mother: "This boy will become the greatest footballer in the world."

In his first official match for Santos in September 1956, Pelé came on against Corinthians and scored a goal. He was only 15 years and 11 months old. The crowd couldn't believe a teenager could play like this.

In his first full season (1957), Pelé scored 36 goals in 35 games - an incredible record for a 16-year-old player. His ball skills, incredible speed, and ability to score with both feet and his head had made him a phenomenon.

Pelé's playing style was revolutionary. He was a forward who moved across the entire field, starting from midfield, bypassing defenses, and shooting with power. Brazilians called him "Pelé" - a name he himself didn't know the meaning of, but the whole world would come to know.`
    },
    victoryText: {
      fa: 'پیراهن سفید سانتوس را پوشیدی و وارد زمین شدی. تماشاگران با دیدن یک نوجوان ۱۵ ساله مات و مبهوت بودند. اما وقتی توپ به پایت رسید، همه فهمیدند که این یک بازیکن معمولی نیست. با اولین گلت، سکوت را به فریاد تبدیل کردی. سانتوس خانه تو شد و تو قلب هواداران را تسخیر کردی.',
      en: 'You put on the white Santos jersey and stepped onto the field. The crowd was stunned to see a 15-year-old. But when the ball reached your feet, everyone understood this was no ordinary player. With your first goal, you turned silence into roar. Santos became your home and you captured the hearts of the fans.'
    },
    year: '1956-1958',
    words: [
      { word: 'سانتوس', clue: 'باشگاهی که پله در ۱۵ سالگی به آن پیوست' },
      { word: 'نوجوان', clue: 'رده سنی پله در اولین بازی حرفه‌ای' },
      { word: 'گل', clue: 'پله در اولین بازی رسمی برای سانتوس مقابل کورینتیانس یک ... زد و همه را شگفت‌زده کرد' },
      { word: 'فصل', clue: 'پله در اولین ... کامل ۳۶ گل زد' },
      { word: 'سفید', clue: 'رنگ پیراهن سانتوس' },
      { word: 'مربی', clue: 'والدمار دو بریتو ... سانتوس بود' },
      { word: 'پدیده', clue: 'پله در ۱۶ سالگی با ۳۶ گل در ۳۵ بازی یک ... فوتبال شد و سبک بازی انقلابی داشت | نوظهور شگفت‌انگیز' },
      { word: 'دوران', clue: 'با پیوستن به سانتوس در ۱۵ سالگی، ... جدید حرفه‌ای پله در فوتبال آغاز شد | دوره' },
      { word: 'مهارت', clue: '... باورنکردنی پله با توپ و سرعت و توانایی گلزنی با هر دو پا و سر او را تبدیل به یک پدیده کرد | توانایی فنی' },
      { word: 'رکورد', clue: '۳۶ گل در ۳۵ بازی | چیزی که پله در اولین فصل شکست' },
      { word: 'شوت', clue: 'ضربه پله به سمت دروازه با قدرت' },
      { word: 'حضور', clue: 'اولین ... پله در سانتوس در ۱۵ سالگی بود و تماشاگران از دیدن یک نوجوان شگفت‌زده شدند | ورود' },
      { word: 'استعداد', clue: 'نبوغ ذاتی پله در فوتبال | چیزی که پله را از دیگران متمایز می‌کرد' },
    ],
    bgEmoji: '⚓',
  },
  {
    id: 'pele_1958',
    legendId: 'pele',
    chapterIndex: 2,
    title: { fa: 'پدیده ۱۷ ساله', en: '17-Year-Old Phenomenon' },
    subtitle: { fa: 'جام جهانی ۱۹۵۸ سوئد', en: '1958 World Cup in Sweden' },
    story: {
      fa: `جام جهانی ۱۹۵۸ سوئد، جایی که یک نوجوان ۱۷ ساله جهان را شگفت‌زده کرد. پله جوان‌ترین بازیکن تیم ملی برزیل در آن مسابقات بود. در ابتدا روی نیمکت نشسته بود، اما بعد از مصدومیت یک بازیکن، فرصت به او رسید.

اولین بازی: یک چهارم نهایی مقابل ولز. پله ۱۷ سال و ۲۳۹ روزه، جوان‌ترین گلزن تاریخ جام جهانی شد - تنها گل بازی را زد و برزیل را به نیمه نهایی رساند.

نیمه نهایی: مقابل فرانسه قدرتمند. پله هت‌تریک کرد! سه گل در نیمه دوم، و برزیل ۵-۲ پیروز شد. دنیای فوتبال مات و مبهوت بود. یک پسر ۱۷ ساله بهترین تیم‌های جهان را نابود می‌کرد.

فینال: مقابل سوئد میزبان در ورزشگاه روسوندا. استکهلم، ۴۹۸۲۶ تماشاگر. استرس عظیم بود و پله نوجوان بود. اما گل اول را در دقیقه ۹ با یک ضربه سر تماشایی زد. گل سوم را با مهارتی باورنکردنی - توپ را از روی یک مدافع بالا انداخت و بعد از کنترل، به گوشه دروازه کوبید. برزیل ۵-۲ قهرمان شد. پله روی شانه‌های هم‌تیمی‌ها گریه می‌کرد.`,
      en: `The 1958 World Cup in Sweden, where a 17-year-old stunned the world. Pelé was the youngest player on Brazil's national team. Initially on the bench, he got his chance after a teammate's injury.

First match: quarter-final against Wales. Pelé, at 17 years and 239 days, became the youngest goal-scorer in World Cup history - scoring the only goal to send Brazil to the semi-finals.

Semi-final: against a strong France. Pelé scored a hat-trick! Three goals in the second half, and Brazil won 5-2. The football world was stunned. A 17-year-old was destroying the best teams in the world.

Final: against hosts Sweden at Råsunda Stadium. Stockholm, 49,826 spectators. The pressure was immense and Pelé was just a teenager. But he scored the first goal in the 9th minute with a spectacular header. The third goal was with incredible skill - he flicked the ball over a defender, controlled it, and smashed it into the corner. Brazil won 5-2. Pelé cried on his teammates' shoulders.`
    },
    victoryText: {
      fa: '۱۷ ساله بودی، اما مثل یک اسطوره بازی می‌کردی. سوئد چشمانش را باز کرده بود و نمی‌توانست باور کند. هت‌تریک در نیمه نهایی، گل تماشایی در فینال - همه چیز مثل یک رویا بود. وقتی سوت پایان به صدا درآمد، روی زانوهایت افتادی و گریه کردی. تو جوان‌ترین قهرمان جهان شده بودی. مادرت حالا می‌توانست به تو افتخار کند.',
      en: 'You were 17, but you played like a legend. Sweden had opened its eyes and couldn\'t believe it. A hat-trick in the semi-final, a spectacular goal in the final - everything was like a dream. When the final whistle blew, you fell to your knees and cried. You had become the youngest world champion. Your mother could now be proud of you.'
    },
    year: '1958',
    words: [
      { word: 'استکهلم', clue: 'پایتخت سوئد، میزبان فینال ۱۹۵۸' },
      { word: 'هفده', clue: 'سن پله در جام جهانی ۱۹۵۸' },
      { word: 'جهانی', clue: 'پله در جام ... ۱۹۵۸ سوئد جوان‌ترین گلزن تاریخ شد و برزیل را به قهرمانی رساند | مسابقات بین‌المللی' },
      { word: 'گل', clue: 'پله جوان‌ترین ... زن تاریخ جام جهانی شد' },
      { word: 'فینال', clue: 'مرحله آخر جام جهانی مقابل سوئد' },
      { word: 'هتریک', clue: 'سه گل در یک بازی مقابل فرانسه' },
      { word: 'برزیل', clue: 'کشوری که پله برای آن بازی می‌کرد' },
      { word: 'قهرمان', clue: 'عنوانی که برزیل در ۱۹۵۸ گرفت' },
      { word: 'نوجوان', clue: 'رده سنی پله در مسابقات' },
      { word: 'تماشاگر', clue: '۴۹۸۲۶ ... در فینال ۱۹۵۸ حضور داشتند' },
      { word: 'رویا', clue: 'پله ۱۷ ساله در سوئد با هت‌تریک در نیمه‌نهایی و گل در فینال ... خود را زنده کرد | آرزو' },
      { word: 'تماشایی', clue: 'گل سوم پله در فینال با بالا انداختن توپ از روی مدافع و ضربه به گوشه دروازه ... بود | زیبا و خیره‌کننده' },
      { word: 'جهان', clue: 'پله سراسر ... را شگفت‌زده کرد' },
      { word: 'نیمکت', clue: 'محل نشستن پله در ابتدای مسابقات' },
    ],
    bgEmoji: '🌟',
  },
  {
    id: 'pele_triple',
    legendId: 'pele',
    chapterIndex: 3,
    title: { fa: 'سه‌بار قهرمان جهان', en: 'Three-Time World Champion' },
    subtitle: { fa: 'جام ژول ریمه برای همیشه', en: 'The Jules Rimet Trophy Forever' },
    story: {
      fa: `پله تنها بازیکن تاریخ است که سه بار جام جهانی را برده است: ۱۹۵۸، ۱۹۶۲ و ۱۹۷۰.

جام جهانی ۱۹۶۲ شیلی: پله در بازی اول مصدوم شد و بقیه مسابقات را از دست داد. اما برزیل تیم قدرتمندی بود و با وجود غیبت پله، قهرمان شد. گارینشا، ستاره دیگر برزیل، نقش اصلی را ایفا کرد. پله از روی نیمکت هم‌تیمی‌هایش را تشویق می‌کرد.

جام جهانی ۱۹۶۶ انگلیس: بدترین جام پله. برزیل در مرحله گروهی حذف شد. مدافعان حریف پله را بی‌رحمانه می‌زدند و داوران محافظتی نمی‌کردند. پله بعد از مسابقات گفت که دیگر در جام جهانی بازی نمی‌کند. برزیل در غم بود.

اما جام جهانی ۱۹۷۰ مکزیک: بازگشت پله. این بار با بهترین تیم تاریخ فوتبال: پله، ژرسون، ریولینو، جرزینیو، کارلوس آلبرتو و توستائو. فینال مقابل ایتالیا، ۴-۱ برزیل پیروز شد. گل آخر یکی از زیباترین گل‌های تیمی تاریخ بود - توپ از ۷ بازیکن عبور کرد تا کارلوس آلبرتو آن را به تور دروازه کوبید.

برزیل برای سومین بار قهرمان جهان شد و جام ژول ریمه را برای همیشه نگه داشت.`,
      en: `Pelé is the only player in history to win three World Cups: 1958, 1962, and 1970.

1962 World Cup in Chile: Pelé was injured in the first match and missed the rest of the tournament. But Brazil was a strong team and became champions despite Pelé's absence. Garrincha, Brazil's other star, played the main role. Pelé cheered his teammates from the bench.

1966 World Cup in England: Pelé's worst World Cup. Brazil was eliminated in the group stage. Opposing defenders brutally fouled Pelé and referees didn't protect him. After the tournament, Pelé said he wouldn't play in the World Cup again. Brazil mourned.

But 1970 World Cup in Mexico: Pelé's return. This time with the best team in football history: Pelé, Gerson, Rivelino, Jairzinho, Carlos Alberto, and Tostão. The final against Italy, Brazil won 4-1. The last goal was one of the most beautiful team goals in history - the ball passed through 7 players before Carlos Alberto smashed it into the net.

Brazil became world champion for the third time and kept the Jules Rimet Trophy forever.`
    },
    victoryText: {
      fa: 'از مصدومیت ۱۹۶۲ تا ناامیدی ۱۹۶۶، از اشک‌ها تا شک‌ها - اما ۱۹۷۰ همه چیز را تغییر داد. مکزیک آفتابی شاهد بهترین فوتبال تاریخ بود. فینال مقابل ایتالیا، چهار گل، و یک شاهکار تیمی. جام ژول ریمه برای همیشه مال برزیل شد. تو سه بار جهان را فتح کرده بودی، کاری که هیچ‌کس نکرده بود و هیچ‌کس نخواهد کرد.',
      en: 'From the injury of 1962 to the disappointment of 1966, from tears to doubts - but 1970 changed everything. Sunny Mexico witnessed the best football in history. The final against Italy, four goals, and a team masterpiece. The Jules Rimet Trophy belonged to Brazil forever. You had conquered the world three times, something no one had done and no one will ever do.'
    },
    year: '1962-1970',
    words: [
      { word: 'سه', clue: 'تعداد قهرمانی‌های پله در جام جهانی' },
      { word: 'جام', clue: 'پله با سه قهرمانی ... جهانی تنها بازیکنی است که این افتخار را دارد | تورنمنت' },
      { word: 'برزیل', clue: 'کشوری که سه بار با پله قهرمان شد' },
      { word: 'مصدومیت', clue: 'مشکل پله در جام جهانی ۱۹۶۲' },
      { word: 'شیلی', clue: 'کشور میزبان جام جهانی ۱۹۶۲' },
      { word: 'مکزیک', clue: 'کشور میزبان جام جهانی ۱۹۷۰' },
      { word: 'فینال', clue: 'برزیل در ... ۱۹۷۰ مکزیک ۴-۱ ایتالیا را شکست و جام ژول ریمه را برای همیشه نگه داشت | مرحله نهایی' },
      { word: 'گل', clue: 'تیمی، زیباترین گل فینال ۱۹۷۰' },
      { word: 'قهرمانی', clue: 'عنوانی که برزیل سه بار گرفت' },
      { word: 'ژولریمه', clue: 'نام جام قدیمی جهان | جایزه جام جهانی سابق' },
      { word: 'بازگشت', clue: 'جام جهانی ۱۹۷۰ بازگشت پله بود | پله بعد از ۱۹۶۶ ... کرد تا دوباره بدرخشد' },
      { word: 'ایتالیا', clue: 'حریف برزیل در فینال ۱۹۷۰' },
      { word: 'تاریخ', clue: 'پله با سه قهرمانی جام جهانی نام خود را در ... فوتبال جاودانه کرد | گذشته و سابقه' },
      { word: 'جاویدان', clue: 'میراث ... پله با سه جام جهانی و ۱۰۰۰+ گل در ذهن هواداران ثبت شد | ابدی و همیشگی' },
    ],
    bgEmoji: '🏆',
  },
  {
    id: 'pele_rei',
    legendId: 'pele',
    chapterIndex: 4,
    title: { fa: 'شاه فوتبال', en: 'O Rei - The King' },
    subtitle: { fa: 'اسطوره‌ای که هرگز تکرار نمی‌شود', en: 'A Legend Never Repeated' },
    story: {
      fa: `پله در طول دوران حرفه‌ای خود ۱۲۸۳ گل زد - رکوردی که در کتاب گینس ثبت شده است. او ۶۴۳ گل برای سانتوس، ۷۷ گل برای تیم ملی برزیل، و بقیه را در بازی‌های دوستانه و تورهای بین‌المللی به ثمر رساند.

در سال ۱۹۶۹، پله هزارمین گل خود را مقابل واسکو داگاما زد - یک ضربه پنالتی که ورزشگاه ماریو فیله را به اشک و شادی تبدیل کرد. آن گل "milésimo" (هزارمین) نامیده می‌شود و طرفداران برای جشن گرفتن وارد زمین شدند و بازی ۱۵ دقیقه متوقف شد.

پله در سال ۱۹۷۷ از فوتبال خداحافظی کرد، در یک بازی دوستانه بین سانتوس و کاسموس نیویورک. پله نیمی از بازی را برای هر تیم بازی کرد، هر دو پیراهن را پوشید و در حالی که اشک می‌ریخت از فوتبال خداحافظی کرد.

در ۲۹ دسامبر ۲۰۲۲، پله در سن ۸۲ سالگی درگذشت. برزیل سه روز عزای عمومی اعلام کرد. آرامگاه او در بلو هوریزونته، بالاترین قبرستان عمودی جهان، سالانه هزاران بازدیدکننده دارد.

میراث پله فراتر از آمار است. او فوتبال را به هنر تبدیل کرد، نژادپرستی را شکست داد و ثابت کرد که یک کودک فقیر از کوچه‌های بائورو می‌تواند شاه جهان شود. او شماره ۱۰ را جاودانه کرد.`,
      en: `Pelé scored 1,283 goals during his professional career - a record registered in the Guinness Book. He scored 643 goals for Santos, 77 goals for the Brazil national team, and the rest in friendly matches and international tours.

In 1969, Pelé scored his thousandth goal against Vasco da Gama - a penalty that turned the Maracanã Stadium into tears and joy. That goal is called "milésimo" (the thousandth) and fans invaded the field to celebrate, stopping the game for 15 minutes.

Pelé retired from football in 1977, in a friendly match between Santos and New York Cosmos. Pelé played half the game for each team, wore both shirts, and said goodbye to football in tears.

On December 29, 2022, Pelé passed away at the age of 82. Brazil declared three days of national mourning. His grave in Belo Horizonte, the tallest vertical cemetery in the world, receives thousands of visitors annually.

Pelé's legacy goes beyond statistics. He turned football into art, defeated racism, and proved that a poor child from the streets of Bauru could become the king of the world. He immortalized the number 10.`
    },
    victoryText: {
      fa: 'از توپ پارچه‌ای تا هزارمین گل، از بائورو تا قله جهان. تو نه فقط یک بازیکن، بلکه یک افسانه بودی. پله یعنی فوتبال، پله یعنی هنر، پله یعنی برزیل. شماره ۱۰ را پوشیدی و آن را برای همیشه در قلب فوتبال جاودانه کردی. آرام بخواب، ای شاه فوتبال. جهان هرگز تو را فراموش نخواهد کرد.',
      en: 'From a rag ball to the thousandth goal, from Bauru to the top of the world. You were not just a player, but a legend. Pelé means football, Pelé means art, Pelé means Brazil. You wore the number 10 and immortalized it in the heart of football forever. Rest in peace, O Rei. The world will never forget you.'
    },
    year: '1971-2022',
    words: [
      { word: 'شاه', clue: 'لقب پله در دنیای فوتبال به پرتغالی' },
      { word: 'رکورد', clue: '۱۲۸۳ گل ثبت شده در کتاب گینس' },
      { word: 'گل', clue: 'هزارمین ... پله در ورزشگاه ماریو فیله' },
      { word: 'جام', clue: 'پله سه ... جهانی در کارنامه دارد و جام ژول ریمه برای همیشه مال برزیل شد | تورنمنت' },
      { word: 'افسانه', clue: 'پله با ۱۲۸۳ گل و سه جام جهانی یک ... جاویدان در تاریخ فوتبال است | اسطوره' },
      { word: 'برزیل', clue: 'کشوری که پله را می‌پرستید' },
      { word: 'ده', clue: 'شماره پیراهن معروف پله' },
      { word: 'سانتوس', clue: 'تیمی که پله سالها در آن بازی کرد' },
      { word: 'خداحافظی', clue: 'پله در ۱۹۷۷ از فوتبال ... کرد' },
      { word: 'جهان', clue: 'پله نه فقط در برزیل که در سراسر ... محبوب بود و فوتبال را به هنر تبدیل کرد | کره زمین' },
      { word: 'نژادپرستی', clue: 'چیزی که پله با موفقیت خود شکست داد' },
      { word: 'هنر', clue: 'پله فوتبال را به ... تبدیل کرد' },
      { word: 'جاودان', clue: 'شماره ۱۰ با پله در قلب فوتبال ... شد و او برای همیشه شاه فوتبال باقی می‌ماند | ابدی و همیشگی' },
      { word: 'افتخار', clue: 'پله با سه قهرمانی جام جهانی برای برزیل ... و سربلندی به ارمغان آورد | سربلندی' },
    ],
    bgEmoji: '👑',
  },
];

// ─── RONALDO ──────────────────────────────────────────
// 6 chapters covering his legendary life

export const RONALDO_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'ronaldo_madeira',
    legendId: 'ronaldo',
    chapterIndex: 0,
    title: { fa: 'کودکی در مادیرا', en: 'Childhood in Madeira' },
    subtitle: { fa: 'جزیره‌ای که غول ساخت', en: 'The Island That Built a Giant' },
    story: {
      fa: `۵ فوریه ۱۹۸۵، در جزیره مادیرا پرتغال، کریستیانو رونالدو دوس سانتوس آویرو به دنیا آمد. خانواده‌اش فقیر بودند - پدرش خوزه آلینو باغبان بود و مادرش ماریا دولورس آشپز. رونالدو کوچک‌ترین فرزند خانواده بود و در یک اتاق کوچک با خواهر و برادرانش بزرگ شد.

از کودکی، عشق بی‌پایانی به فوتبال داشت. با یک توپ پلاستیکی در کوچه‌های باریک فونچال بازی می‌کرد و ساعتها وقت صرف تمرین دریبل و شوت می‌کرد. هم‌محله‌ای‌ها شاهد استعداد خارق‌العاده‌اش بودند.

مدرسه برایش کسل‌کننده بود - تنها جایی که می‌خواست باشد زمین فوتبال بود. در ۸ سالگی به باشگاه محلی آندورینها پیوست و اولین مربیاش، فرناندو سانتوس، بلافاصله استعداد ناب او را تشخیص داد.`,
      en: `On February 5, 1985, on the island of Madeira, Portugal, Cristiano Ronaldo dos Santos Aveiro was born. His family was poor - his father José Dinis was a gardener and his mother Maria Dolores was a cook. Ronaldo was the youngest child and grew up in a small room with his siblings.

From childhood, he had an endless love for football. He played with a plastic ball in the narrow streets of Funchal and spent hours practicing dribbling and shooting. The neighbors witnessed his extraordinary talent.

School was boring for him - the only place he wanted to be was the football field. At age 8, he joined the local club Andorinha, and his first coach, Fernando Santos, immediately recognized his raw talent.`
    },
    victoryText: {
      fa: 'تو را در کوچه‌های باریک فونچال می‌دیدیم که با توپ پلاستیکی ات تمرین می‌کردی. ماریا دولورس اشک در چشمانش جمع شده بود - می‌دانست پسرش روزی جهان را فتح خواهد کرد. جزیره مادیرا هرگز پسرش را فراموش نخواهد کرد.',
      en: 'We saw you in the narrow streets of Funchal practicing with your plastic ball. Maria Dolores had tears in her eyes - she knew her son would one day conquer the world. The island of Madeira will never forget its son.'
    },
    year: '1985-1998',
    words: [
      { word: 'فوتبال', clue: 'رونالدو با توپ پلاستیکی در کوچه‌های فونچال عاشقانه این ورزش را دنبال می‌کرد' },
      { word: 'مادیرا', clue: 'جزیره محل تولد رونالدو' },
      { word: 'پرتغال', clue: 'کشور رونالدو' },
      { word: 'فقیر', clue: 'خانواده رونالدو در جزیره مادیرا این وضعیت را داشت و در یک اتاق کوچک زندگی می‌کردند | تنگدست' },
      { word: 'خانواده', clue: 'رونالدو کوچک‌ترین فرزند ... بود و با خواهر و برادرانش در یک اتاق کوچک بزرگ شد' },
      { word: 'استعداد', clue: 'نبوغ رونالدو در فوتبال | چیزی که رونالدو را متمایز می‌کرد' },
      { word: 'باشگاه', clue: 'آندورینها اولین ... رونالدو بود' },
      { word: 'کوچه', clue: 'رونالدو در ...‌های باریک فونچال با توپ پلاستیکی ساعتها تمرین می‌کرد' },
      { word: 'تمرین', clue: 'رونالدو ساعتها در کوچه‌های فونچال ... دریبل و شوت می‌کرد تا استعدادش شکوفا شود | آماده‌سازی' },
      { word: 'خوزه', clue: 'نام پدر رونالدو' },
      { word: 'ماریا', clue: 'نام مادر رونالدو' },
      { word: 'فونچال', clue: 'شهر محل تولد رونالدو در مادیرا' },
      { word: 'طفولیت', clue: 'دوران ... رونالدو در جزیره مادیرا با بازی با توپ پلاستیکی در کوچه‌ها گذشت | کودکی' },
    ],
    bgEmoji: '🏝️',
  },
  {
    id: 'ronaldo_sporting',
    legendId: 'ronaldo',
    chapterIndex: 1,
    title: { fa: 'شروع در اسپورتینگ', en: 'Sporting Lisbon Start' },
    subtitle: { fa: 'استعداد درخشان', en: 'Brilliant Talent' },
    story: {
      fa: `در ۱۲ سالگی، رونالدو برای تست در اسپورتینگ لیسبون حاضر شد، اما در ابتدا مسئولان باشگاه او را خیلی لاغر و کوچک می‌دانستند. با این حال، استعداد خارق‌العاده‌اش همه را متقاعد کرد. او به آکادمی معروف اسپورتینگ پیوست - دور از خانه و خانواده در جزیره مادیرا.

دوران سختی بود. بچه‌های دیگر به لهجه مادیراییاش می‌خندیدند و دلتنگ مادرش بود. اما هر روز قبل از طلوع آفتاب بلند می‌شد و تمرین می‌کرد. نوید، پدرش، به او گفته بود: «اگر می‌خواهی بهترین باشی، باید بیش از دیگران تلاش کنی.»

پیشرفت رونالدو شگفت‌انگیز بود. در تیم جوانان اسپورتینگ، ۳۴ گل در ۳۱ بازی به ثمر رساند. در ۱۶ سالگی به تیم اصلی راه یافت و در بازی دوستانه با منچستر یونایتد، آنقدر درخشید که سرالکس فرگوسن را شگفت‌زده کرد.`,
      en: `At age 12, Ronaldo went for a trial at Sporting Lisbon, but initially the club officials thought he was too thin and small. However, his extraordinary talent convinced everyone. He joined the famous Sporting academy - away from home and family on the island of Madeira.

It was a difficult time. Other kids laughed at his Madeiran accent, and he missed his mother. But every day he woke up before sunrise and trained. His father had told him: "If you want to be the best, you have to work harder than everyone else."

Ronaldo's progress was astonishing. In Sporting's youth team, he scored 34 goals in 31 games. At 16, he joined the first team, and in a friendly match against Manchester United, he impressed so much that Sir Alex Ferguson was amazed.`
    },
    victoryText: {
      fa: 'از تمسخر لهجه‌ات تا تحسین فرگوسن - راهت را پیدا کرده بودی. لاغر و کوچک بودی اما قلبت به اندازه یک غول می‌تپید. مادرت در مادیرا دعا می‌خواند و تو در لیسبون ثابت می‌کردی که عشق به فوتبال از هر چیز قوی‌تر است.',
      en: 'From teasing about your accent to impressing Ferguson - you had found your path. You were thin and small but your heart beat like a giant. Your mother prayed in Madeira and you proved in Lisbon that love for football is stronger than anything.'
    },
    year: '1998-2003',
    words: [
      { word: 'اسپورتینگ', clue: 'باشگاه پرتغالی رونالدو' },
      { word: 'لیسبون', clue: 'پایتخت پرتغال و شهر باشگاه' },
      { word: 'لاغر', clue: 'مشکل فیزیکی رونالدو در ابتدا' },
      { word: 'آکادمی', clue: 'جایی که رونالدو فوتبال را یاد گرفت' },
      { word: 'تست', clue: 'اولین حضور رونالدو در اسپورتینگ' },
      { word: 'جوانان', clue: 'تیمی که رونالدو ۳۴ گل زد' },
      { word: 'گل', clue: '۳۴ ... در ۳۱ بازی برای تیم جوانان اسپورتینگ رکوردی شگفت‌انگیز بود | ضربه به تور دروازه' },
      { word: 'مربی', clue: 'فرگوسن ... منچستر بود که در بازی دوستانه استعداد رونالدو را دید و شیفته شد | سرمربی' },
      { word: 'لهجه', clue: 'چیزی که بچه‌ها به آن می‌خندیدند' },
      { word: 'تمرین', clue: 'کاری که رونالدو قبل از طلوع انجام می‌داد' },
      { word: 'تلاش', clue: 'راه رسیدن به موفقیت از نظر پدر رونالدو' },
      { word: 'استعداد', clue: 'فرگوسن در بازی دوستانه اسپورتینگ و منچستر ... ناب رونالدو را دید و شگفت‌زده شد | نبوغ ذاتی' },
    ],
    bgEmoji: '🦁',
  },
  {
    id: 'ronaldo_united',
    legendId: 'ronaldo',
    chapterIndex: 2,
    title: { fa: 'پدیده اولدترافورد', en: 'Old Trafford Phenomenon' },
    subtitle: { fa: 'از شماره ۷ تا توپ طلا', en: 'From Number 7 to Ballon d\'Or' },
    story: {
      fa: `در سال ۲۰۰۳، رونالدو در یک بازی دوستانه مقابل منچستر یونایتد چنان درخشید که بازیکنان حریف از فرگوسن خواستند او را جذب کند. منچستر ۱۲.۲۴ میلیون پوند پرداخت کرد - رکوردشکن برای یک نوجوان ۱۸ ساله. رونالدو شماره ۷ معروف منچستر را به ارث برد؛ شماره‌ای که پیشتر بر تن بست و جرج بست بود.

انتقادها شدید بود. برخی می‌گفتند او فقط یک نمایشگر است و حرکات اضافی زیاد دارد. اما رونالدو با تمرینات بی‌وقفه و انضباط مثال‌زدنی، همه را ساکت کرد. فرگوسن مثل پدری برایش بود و او را راهنمایی می‌کرد.

فصل ۰۸-۲۰۰۷ اوج او در منچستر بود: ۴۲ گل در تمام رقابت‌ها، قهرمانی لیگ قهرمانان اروپا و لیگ برتر. همان سال اولین توپ طلای خود را برد. اولدترافورد غرق در شادی بود.`,
      en: `In 2003, Ronaldo impressed so much in a friendly against Manchester United that the opposing players told Ferguson to sign him. United paid £12.24 million - a record for an 18-year-old. Ronaldo inherited the famous United #7 shirt; a number once worn by Best and Beckham.

Criticism was fierce. Some said he was just a showman with too many tricks. But Ronaldo silenced everyone with relentless training and exemplary discipline. Ferguson was like a father to him, guiding his development.

The 2007-08 season was his peak at United: 42 goals in all competitions, Champions League and Premier League titles. That year he won his first Ballon d'Or. Old Trafford was jubilant.`
    },
    victoryText: {
      fa: 'شماره ۷ را بر تن کردی و وزن تاریخ را روی دوشت حس می‌کردی. از انتقادها نترسیدی - هر روز سخت‌تر کار کردی تا به قله برسی. شب فینال مسکو، با چشمانی اشک‌آلود جام قهرمانی اروپا را بالای سر بردی. تو دیگر یک نوجوان مادیرایی نبودی؛ تو کریستیانو رونالدو بودی.',
      en: 'You wore the #7 shirt and felt the weight of history on your shoulders. You didn\'t fear criticism - you worked harder every day to reach the summit. On the Moscow final night, with teary eyes, you lifted the European Cup. You were no longer a Madeiran teenager; you were Cristiano Ronaldo.'
    },
    year: '2003-2009',
    words: [
      { word: 'منچستر', clue: 'اولین باشگاه بزرگ رونالدو' },
      { word: 'یونایتد', clue: 'نام کامل باشگاه انگلیسی رونالدو' },
      { word: 'فرگوسن', clue: 'مربی اسکاتلندی رونالدو' },
      { word: 'پوند', clue: 'واحد پول قرارداد رونالدو' },
      { word: 'میلیون', clue: '۱۲.۲۴ ... پوند هزینه انتقال' },
      { word: 'شماره', clue: 'پیراهن ... ۷ منچستر که رونالدو پوشید و بعداً ... ۹ در رئال مادرید | عدد' },
      { word: 'توپ', clue: 'جایزه ... طلا' },
      { word: 'لیگ', clue: 'قهرمانی ... برتر و ... قهرمانان اروپا در یک فصل برای رونالدو در منچستر | دسته مسابقات' },
      { word: 'اروپا', clue: 'قهرمانی ... در سال ۲۰۰۸' },
      { word: 'انتقاد', clue: 'برخی رونالدو را نمایشگر می‌نامیدند | چیزی که رونالدو را مصمم‌تر کرد' },
      { word: 'انضباط', clue: 'رونالدو با تمرینات بی‌وقفه و ... مثال‌زدنی منتقدان را ساکت کرد و به توپ طلا رسید | خودنظم‌دهی' },
      { word: 'مسکو', clue: 'شهر فینال لیگ قهرمانان ۲۰۰۸' },
      { word: 'رکورد', clue: '۱۲.۲۴ میلیون پوند برای نوجوان ۱۸ ساله | هزینه انتقال رونالدو ... بود' },
    ],
    bgEmoji: '🔴',
  },
  {
    id: 'ronaldo_real',
    legendId: 'ronaldo',
    chapterIndex: 3,
    title: { fa: 'رکوردشکنی در رئال', en: 'Record Breaker at Real' },
    subtitle: { fa: 'کهکشانی پرتغالی', en: 'The Portuguese Galáctico' },
    story: {
      fa: `در سال ۲۰۰۹، رونالدو با انتقال ۹۴ میلیون یورویی به رئال مادرید پیوست - رکورد تاریخ در آن زمان. ورزشگاه سانتیاگو برنابئو با ۸۰ هزار تماشاگر از او استقبال کرد. شماره ۹ را انتخاب کرد و گفت: «من برای رکوردشکنی آمده‌ام.»

۹ سال در رئال مادرید دوران طلایی رونالدو بود. ۴۵۱ گل در ۴۳۸ بازی - آماری باورنکردنی. چهار توپ طلا (۲۰۱۳، ۲۰۱۴، ۲۰۱۶، ۲۰۱۷)، سه قهرمانی متوالی لیگ قهرمانان اروپا (۲۰۱۶، ۲۰۱۷، ۲۰۱۸) و دو قهرمانی لالیگا.

شب‌های تاریخی در برنابئو با ضربات آزاد خارق‌العاده، پرش‌های بلند و ضربات سر تماشایی او همراه بود. رونالدو در رئال تبدیل به یک اسطوره زنده شد. هواداران با شعار "SIUUU" معروفش او را تشویق می‌کردند.`,
      en: `In 2009, Ronaldo joined Real Madrid for €94 million - a world record at the time. The Santiago Bernabéu welcomed him with 80,000 spectators. He chose the #9 shirt and said: "I came to break records."

9 years at Real Madrid was Ronaldo's golden era. 451 goals in 438 games - an incredible statistic. Four Ballon d'Ors (2013, 2014, 2016, 2017), three consecutive Champions League titles (2016, 2017, 2018), and two La Liga titles.

Historic nights at the Bernabéu were marked by incredible free kicks, towering jumps, and spectacular headers. Ronaldo became a living legend at Madrid. Fans cheered him with his famous "SIUUU" celebration.`
    },
    victoryText: {
      fa: 'برنابئو برایت غرق تشویق بود - ۸۰ هزار نفر نامت را فریاد می‌زدند. "SIUUU"ات جهان را لرزاند و رکوردها یکی پس از دیگری شکستی. از شماره ۹ تا اسطوره واقعی؛ تو به مادرید ثابت کردی که پادشاه جدید برنابئو تویی.',
      en: 'The Bernabéu cheered for you - 80,000 people shouted your name. Your "SIUUU" shook the world and records fell one after another. From number 9 to a true legend; you proved to Madrid that you were the new king of the Bernabéu.'
    },
    year: '2009-2018',
    words: [
      { word: 'چهار', clue: 'تعداد توپ‌های طلای رونالدو در رئال' },
      { word: 'مادرید', clue: 'شهر باشگاه رونالدو' },
      { word: 'سانتیاگو', clue: 'نام ورزشگاه رئال مادرید | سانتیاگو برنابئو' },
      { word: 'یورو', clue: 'واحد پول قرارداد ۹۴ میلیونی' },
      { word: 'توپ', clue: 'چهار جایزه ... طلا در رئال' },
      { word: 'لالیگا', clue: 'دو ... با رونالدو در رئال | لیگ اسپانیا' },
      { word: 'گل', clue: '۴۵۱ ... در ۴۳۸ بازی' },
      { word: 'رکورد', clue: 'هدف رونالدو در رئال' },
      { word: 'قهرمانی', clue: 'سه ... متوالی اروپا' },
      { word: 'ضربه', clue: 'آزاد معروف رونالدو' },
      { word: 'پرش', clue: 'نحوه زدن ضربات سر رونالدو' },
      { word: 'اسطوره', clue: 'رونالدو در رئال تبدیل به یک ... زنده شد | جایگاه رونالدو در رئال' },
    ],
    bgEmoji: '👑',
  },
  {
    id: 'ronaldo_euro',
    legendId: 'ronaldo',
    chapterIndex: 4,
    title: { fa: 'قهرمانی اروپا', en: 'Euro Champion' },
    subtitle: { fa: 'پرتغال بر بام اروپا', en: 'Portugal on Top of Europe' },
    story: {
      fa: `سال ۲۰۱۶، یورو در فرانسه برگزار می‌شد. پرتغال با رهبری رونالدو به فینال رسید. اما در دقیقه ۲۵ فینال، مصدومیت وحشتناکی برای رونالدو رخ داد - اشک‌هایش جاری شد. او روی برانکارد از زمین خارج شد و صورتش را با پیراهن پوشاند.

اما کاپیتان تسلیم نشد. کنار زمین ایستاد و با اشتیاق تیمش را هدایت می‌کرد. در وقت‌های اضافه، ادر گل قهرمانی را زد و پرتغال قهرمان اروپا شد. رونالدو که نمی‌توانست راه برود، روی ویل‌چر جام را بالای سر برد.

این شیرین‌ترین لحظه زندگی رونالدو بود - پسری از جزیره مادیرا که پرچم پرتغال را بالای سر برد. او ثابت کرد که یک کاپیتان واقعی حتی وقتی بازی نمی‌کند، تیمش را به قهرمانی می‌رساند.`,
      en: `2016, the Euros in France. Portugal, led by Ronaldo, reached the final. But in the 25th minute of the final, a terrible injury struck Ronaldo - his tears flowed. He left the pitch on a stretcher, covering his face with his shirt.

But the captain didn't give up. He stood by the sidelines, passionately directing his team. In extra time, Eder scored the winning goal and Portugal became champions of Europe. Ronaldo, unable to walk, lifted the trophy from a wheelchair.

This was the sweetest moment of Ronaldo's life - the boy from Madeira island who raised the Portuguese flag. He proved that a true captain leads his team to victory even when not playing.`
    },
    victoryText: {
      fa: 'اشک‌هایت در فینال تمام جهان را غمگین کرد. مصدومیت تلخ، اما تو کاپیتان بودی - از روی ویل‌چر تیم را هدایت کردی. ادر گل زد و تو جام را بالای سر بردی. پسر مادیرا، پرچم پرتغال را بر بام اروپا به اهتزاز درآوردی.',
      en: 'Your tears in the final saddened the whole world. Bitter injury, but you were the captain - you led the team from a wheelchair. Eder scored and you lifted the trophy. The boy from Madeira raised the Portuguese flag on the roof of Europe.'
    },
    year: '2016-2019',
    words: [
      { word: 'یورو', clue: 'مسابقات قهرمانی اروپا' },
      { word: 'پرتغال', clue: 'تیم ملی رونالدو' },
      { word: 'فینال', clue: 'مرحله پایانی یورو ۲۰۱۶' },
      { word: 'فرانسه', clue: 'کشور میزبان یورو ۲۰۱۶' },
      { word: 'مصدومیت', clue: 'آسیب دیدگی رونالدو در فینال' },
      { word: 'کاپیتان', clue: 'نقش رونالدو در تیم ملی' },
      { word: 'جام', clue: 'قهرمانی اروپا' },
      { word: 'برانکارد', clue: 'وسیله خروج رونالدو از زمین' },
      { word: 'ویلچر', clue: 'وسیله‌ای که رونالدو روی آن جام گرفت' },
      { word: 'گل', clue: 'ضربه ادر در فینال' },
      { word: 'اشک', clue: 'واکنش رونالدو به مصدومیت' },
      { word: 'قهرمانی', clue: 'پرتغال با ... یورو ۲۰۱۶ روی ویلچر توسط کاپیتان مصدومش جشن گرفته شد | مقام اول' },
      { word: 'پیراهن', clue: 'پوشش صورت رونالدو روی برانکارد | چیزی که رونالدو صورتش را با آن پوشاند' },
    ],
    bgEmoji: '🇵🇹',
  },
  {
    id: 'ronaldo_nasr',
    legendId: 'ronaldo',
    chapterIndex: 5,
    title: { fa: 'افسانه در النصر', en: 'Legend at Al-Nassr' },
    subtitle: { fa: 'میراث جاودان', en: 'Eternal Legacy' },
    story: {
      fa: `در سال ۲۰۲۳، رونالدو به النصر عربستان پیوست. بسیاری انتقاد کردند، اما او با ۵۴ گل در ۵۹ بازی، یک فصل خارق‌العاده ثبت کرد و بهترین گلزن سال جهان شد. در ۳۹ سالگی همچنان رکوردهای جدید ثبت می‌کرد.

رونالدو در طول دوران حرفه‌ای خود بیش از ۹۰۰ گل رسمی زده است - رکوردی که شاید هرگز شکسته نشود. پنج توپ طلا، قهرمانی در لیگ‌های پرتغال، انگلیس، اسپانیا، ایتالیا و عربستان و ده‌ها افتخار دیگر.

اما مهم‌تر از همه رکوردها، تأثیر او بر نسل جدید فوتبالیست‌هاست. میلیون‌ها کودک در سراسر جهان با دیدن رونالدو یاد گرفتند که اگر به اندازه کافی تلاش کنند و به خودشان ایمان داشته باشند، هیچ چیز غیرممکن نیست.`,
      en: `In 2023, Ronaldo joined Al-Nassr in Saudi Arabia. Many criticized, but with 54 goals in 59 games, he recorded an extraordinary season and became the world's top scorer. At 39, he was still setting new records.

Ronaldo has scored over 900 official goals in his career - a record that may never be broken. Five Ballon d'Ors, championships in Portugal, England, Spain, Italy, and Saudi Arabia, and dozens of other honors.

But more important than all the records is his impact on the new generation. Millions of children around the world learned from Ronaldo that if you work hard enough and believe in yourself, nothing is impossible.`
    },
    victoryText: {
      fa: 'از کوچه‌های مادیرا تا قله‌های جهان - مسیرت بی‌نظیر بود. ۹۰۰+ گل، ۵ توپ طلا، و قلبی سرشار از عشق به فوتبال. با "SIUUU"ات جهان را تکان دادی و به همه ثابت کردی که محدودیت فقط یک توهم است. ممنون کریستیانو، برای همه خاطره‌ها.',
      en: 'From the streets of Madeira to the peaks of the world - your journey was unparalleled. 900+ goals, 5 Ballon d\'Ors, and a heart full of love for football. With your "SIUUU" you shook the world and proved that limits are just an illusion. Thank you Cristiano, for all the memories.'
    },
    year: '2023-2025',
    words: [
      { word: 'النصر', clue: 'باشگاه عربستانی رونالدو' },
      { word: 'عربستان', clue: 'کشور باشگاه جدید رونالدو' },
      { word: 'رکورد', clue: '۹۰۰ گل رسمی رونالدو' },
      { word: 'گلزنی', clue: 'رونالدو در ۳۹ سالگی با ۵۴ گل در النصر بهترین ... سال جهان شد | به ثمر رساندن گل' },
      { word: 'نسل', clue: 'میلیون‌ها کودک در سراسر جهان از رونالدو یاد گرفتند؛ تأثیر او بر ... جدید فوتبالیست‌ها بی‌نظیر بود | گروه سنی' },
      { word: 'میلیون', clue: '...‌ها کودک در سراسر جهان با دیدن رونالدو یاد گرفتند که هیچ چیز غیرممکن نیست | هزار هزار' },
      { word: 'الهام', clue: 'رونالدو به نسل جدید ... داد که با تلاش و ایمان به خود می‌توان به هر چیزی رسید | انگیزه' },
      { word: 'تلاش', clue: 'رونالدو به میلیون‌ها کودک یاد داد که با ... کافی و ایمان به خود هیچ چیز غیرممکن نیست | کوشش' },
      { word: 'فصل', clue: '۵۴ گل در یک ...' },
      { word: 'میراث', clue: '۹۰۰+ گل و پنج توپ طلا ... رونالدو در تاریخ فوتبال است که شاید هرگز تکرار نشود | آنچه به جا می‌ماند' },
      { word: 'جهان', clue: 'رونالدو در ۳۹ سالگی بهترین گلزن سال ... شد و در النصر ۵۴ گل زد | کره زمین' },
      { word: 'کودک', clue: 'میلیون‌ها ... در سراسر ... از رونالدو یاد گرفتند که با تلاش می‌توان به غیرممکن رسید | خردسال' },
    ],
    bgEmoji: '🌟',
  },
];

// ─── ZIDANE ──────────────────────────────────────────
// 5 chapters covering his legendary life

export const ZIDANE_CHAPTERS: WorldMapChapter[] = [
  {
    id: 'zidane_marseille',
    legendId: 'zidane',
    chapterIndex: 0,
    title: { fa: 'ریشه‌های الجزایری', en: 'Algerian Roots' },
    subtitle: { fa: 'از مارسی تا ستاره شدن', en: 'From Marseille to Stardom' },
    story: {
      fa: `۲۳ ژوئن ۱۹۷۲، در مارسی فرانسه، زین‌الدین یزید زیدان به دنیا آمد. والدینش اسماعیل و ملیکا از الجزایر به فرانسه مهاجرت کرده بودند. زیدان در محله کارگری "لا کاستلان" در شمال مارسی بزرگ شد - محله‌ای که بعدها همیشه با افتخار از آن یاد می‌کرد.

فوتبال را از کوچه‌های تنگ محله شروع کرد. در ۱۰ سالگی به باشگاه محلی "آنس گاردینا" پیوست و خیلی زود استعداد نابش آشکار شد. نخستین مربی‌اش گفت: «زیدان با توپ کاری می‌کند که نمی‌توان باور کرد.»

در ۱۴ سالگی به آکادمی کان دعوت شد. دور از خانه، تمرینات سخت، اما زیدان تسلیم نشد. حرکات دریبل خاص خود را تمرین می‌کرد و سبک منحصربه‌فردش را شکل می‌داد.`,
      en: `On June 23, 1972, in Marseille, France, Zinedine Yazid Zidane was born. His parents Ismail and Malika had emigrated from Algeria to France. Zidane grew up in the working-class neighborhood "La Castellane" in northern Marseille - a place he would always speak of with pride.

He started football in the narrow streets of the neighborhood. At age 10, he joined the local club "AS GARDENNA" and soon his raw talent became evident. His first coach said: "Zidane does things with the ball that are unbelievable."

At 14, he was invited to the Cannes academy. Far from home, hard training, but Zidane never gave up. He practiced his signature dribbling moves and shaped his unique style.`
    },
    victoryText: {
      fa: 'از محله لا کاستلان مارسی تا مرزهای شهرت - راهت پر از عرق و ایمان بود. پدر و مادرت با چشمانی اشک‌آلود به تو نگاه می‌کردند؛ پسر مهاجران الجزایری که با توپ جادو می‌کرد. فرانسه به داشتن تو افتخار می‌کرد، اما تو هرگز ریشه‌هایت را فراموش نکردی.',
      en: 'From La Castellane in Marseille to the borders of fame - your path was full of sweat and faith. Your parents watched with tearful eyes; the son of Algerian immigrants who performed magic with a ball. France was proud of you, but you never forgot your roots.'
    },
    year: '1972-1992',
    words: [
      { word: 'مارسی', clue: 'شهر تولد زیدان' },
      { word: 'فرانسه', clue: 'کشور زیدان' },
      { word: 'الجزایر', clue: 'کشور والدین زیدان' },
      { word: 'مهاجر', clue: 'والدین زیدان ... بودند' },
      { word: 'محله', clue: 'لا کاستلان ... زیدان بود' },
      { word: 'فوتبال', clue: 'زیدان از کوچه‌های محله لا کاستلان مارسی تا ... حرفه‌ای را با استعداد ناب طی کرد | ورزش' },
      { word: 'استعداد', clue: 'مربی آنس گاردینا گفت زیدان با توپ کارهایی می‌کند که باورکردنی نیست؛ ...ی ناب | نبوغ ذاتی' },
      { word: 'باشگاه', clue: 'آنس گاردینا اولین ... زیدان' },
      { word: 'کان', clue: 'آکادمی که زیدان به آن دعوت شد' },
      { word: 'کوچه', clue: 'جایی که زیدان فوتبال را شروع کرد' },
      { word: 'سبک', clue: 'زیدان در آکادمی کان حرکات دریبل خاص خود را تمرین کرد و ... منحصربه‌فردش را شکل داد | شیوه' },
      { word: 'دریبل', clue: 'زیدان حرکات مارپیچ و خاص ... خود را از نوجوانی در کوچه‌های مارسی تمرین می‌کرد | عبور از حریف با توپ' },
    ],
    bgEmoji: '🌊',
  },
  {
    id: 'zidane_juventus',
    legendId: 'zidane',
    chapterIndex: 1,
    title: { fa: 'ستاره در یوونتوس', en: 'Juventus Star' },
    subtitle: { fa: 'شماره ۱۰ جدید', en: 'The New Number 10' },
    story: {
      fa: `در سال ۱۹۹۶، زیدان با ۳.۵ میلیون یورو به یوونتوس ایتالیا پیوست. پیراهن شماره ۱۰ معروف را بر تن کرد - شماره‌ای که اسطوره‌هایی مانند میشل پلاتینی و روبرتو باجو پیشتر پوشیده بودند. وزن این پیراهن سنگین بود، اما زیدان به سرعت خود را ثابت کرد.

در یوونتوس، زیدان به یک هافبک کامل تبدیل شد. قدرت بدنی بالا، دید فوق‌العاده، پاس‌های دقیق و ضربات فنی از ویژگی‌هایش بود. در ۱۷۱ بازی برای یوونتوس، ۲۴ گل زد و ۴۲ پاس گل داد.

دو قهرمانی سری آ (۱۹۹۷ و ۱۹۹۸) و نایب قهرمانی لیگ قهرمانان اروپا (۱۹۹۷ و ۱۹۹۸) از افتخاراتش در یوونتوس بود. در سال ۱۹۹۸، بهترین بازیکن سال فیفا و برنده توپ طلا شد.`,
      en: `In 1996, Zidane joined Juventus in Italy for €3.5 million. He wore the famous number 10 shirt - a number previously worn by legends like Michel Platini and Roberto Baggio. The weight of this shirt was heavy, but Zidane quickly proved himself.

At Juventus, Zidane became a complete midfielder. High physical strength, incredible vision, precise passes, and technical shots were his hallmarks. In 171 games for Juventus, he scored 24 goals and provided 42 assists.

Two Serie A titles (1997 and 1998) and two Champions League runner-up finishes (1997 and 1998) were among his honors at Juventus. In 1998, he was named FIFA World Player of the Year and won the Ballon d'Or.`
    },
    victoryText: {
      fa: 'پیراهن شماره ۱۰ را پوشیدی و سنگینی اش را روی دوشت حس کردی. از پلاتینی و باجو تا تو - حالا تو وارث این شماره بودی. یوونتوس به تو اعتماد کرد و تو با بازی هنرمندانه‌ات تمام ایتالیا را مسحور خود کردی.',
      en: 'You wore the number 10 shirt and felt its weight on your shoulders. From Platini and Baggio to you - now you were the heir to that number. Juventus trusted you and you captivated all of Italy with your artistic play.'
    },
    year: '1996-2001',
    words: [
      { word: 'یوونتوس', clue: 'باشگاه ایتالیایی زیدان' },
      { word: 'ایتالیا', clue: 'کشور باشگاه زیدان' },
      { word: 'شماره', clue: 'پیراهن ۱۰ یوونتوس' },
      { word: 'توپ', clue: 'جایزه ... طلا ۱۹۹۸' },
      { word: 'هافبک', clue: 'پست بازی زیدان' },
      { word: 'سری', clue: 'لیگ ... آ ایتالیا' },
      { word: 'قهرمانی', clue: 'دو ... سری آ' },
      { word: 'پلاتینی', clue: 'اسطوره فرانسوی پیشین یوونتوس' },
      { word: 'پاس', clue: 'زیدان در یوونتوس با ...‌های دقیق و دید فوق‌العاده یک هافبک کامل شد | ارسال توپ' },
      { word: 'بازیکن', clue: 'بهترین ... سال فیفا ۱۹۹۸' },
      { word: 'بیناالمللی', clue: 'زیدان در مسابقات ... و تورنمنت‌های ملی با فرانسه افتخارآفرینی کرد | جهانی' },
      { word: 'تکنیک', clue: 'زیدان با ... بالا و قدرت بدنی و ضربات فنی خود را در یوونتوس ثابت کرد | مهارت فنی' },
    ],
    bgEmoji: '⚪⚫',
  },
  {
    id: 'zidane_1998',
    legendId: 'zidane',
    chapterIndex: 2,
    title: { fa: 'دو ضربه سر طلایی', en: 'Two Golden Headers' },
    subtitle: { fa: 'قهرمان جهان در خانه', en: 'World Champion at Home' },
    story: {
      fa: `۱۲ جولای ۱۹۹۸، فینال جام جهانی در ورزشگاه استاد دو فرانس پاریس. فرانسه مقابل برزیل، مدافع عنوان قهرمانی. تمام جهان چشم به این دیدار داشتند. زیدان که در بازی‌های قبلی عملکرد平均ی داشت، همه را شگفت‌زده کرد.

دو ضربه سر فوق‌العاده از روی کرنر - یکی در دقیقه ۲۷ و دیگری در دقیقه ۴۶. دروازه‌بان برزیل، تافارل، نمی‌توانست باور کند. فرانسه با زیدان به قهرمانی جهان رسید. شب پاریس غرق در جشن و شادی بود.

زیدان در میان اشک‌های شوق، جام جهانی را بالای سر برد. او مهاجرزاده الجزایری بود که فرانسه را بر بام جهان نشاند. خیابان‌های شانزه‌لیزه پر از جمعیت بود و همه یک نام را فریاد می‌زدند: زی-زو!`,
      en: `July 12, 1998, World Cup final at Stade de France in Paris. France vs Brazil, the defending champions. The whole world watched. Zidane, who had average performances in previous games, shocked everyone.

Two spectacular headers from corner kicks - one in the 27th minute and another in the 46th minute. Brazil's goalkeeper Taffarel couldn't believe it. France became world champions with Zidane. The Paris night was filled with celebration.

Zidane, with tears of joy, lifted the World Cup. He was the son of Algerian immigrants who put France on top of the world. The Champs-Élysées was packed and everyone shouted one name: Zi-zou!`
    },
    victoryText: {
      fa: 'ضربه سر اول سرنوشت را تغییر داد و ضربه دوم قهرمانی را قطعی کرد. استاد دو فرانس دیوانه‌وار فریاد می‌زد. پسر محله لا کاستلان، با دو ضربه سر، نامش را در تاریخ جاودانه کرد. فرانسه به تو افتخار می‌کرد - زیدان، اسطوره واقعی.',
      en: 'The first header changed destiny and the second sealed the championship. The Stade de France roared wildly. The boy from La Castellane, with two headers, immortalized his name in history. France was proud of you - Zidane, the true legend.'
    },
    year: '1998-2000',
    words: [
      { word: 'جام', clue: 'جهانی ۱۹۹۸ فرانسه' },
      { word: 'جهانی', clue: 'فینال ۱۹۹۸ ... فرانسه با دو ضربه سر زیدان از کرنر قهرمان جهان شد | رقابتهای جام' },
      { word: 'فینال', clue: 'زیدان در ... ۱۹۹۸ با دو ضربه سر برزیل را شکست داد و فرانسه را قهرمان جهان کرد | مرحله نهایی' },
      { word: 'برزیل', clue: 'حریف فرانسه در فینال' },
      { word: 'ضربه', clue: 'دو ... سر از کرنر' },
      { word: 'سر', clue: 'کرنر امانوئل پتی را زیدان با ضربه ... در دقیقه ۲۷ و ۴۶ به گل تبدیل کرد | عضو بالای بدن' },
      { word: 'کرنر', clue: 'دو ضربه زیدان با ... فرانسه را به قهرمانی جهان رساند | ضربه شروع مجدد از گوشه زمین' },
      { word: 'پاریس', clue: 'شهر میزبان فینال' },
      { word: 'فرانسه', clue: 'کشور قهرمان جهان' },
      { word: 'قهرمانی', clue: 'فرانسه با دو گل زیدان از روی کرنر به ... جهان در جام ۱۹۹۸ رسید | مقام اول' },
      { word: 'تافارل', clue: 'دروازه‌بان برزیل' },
      { word: 'شانزه‌لیزه', clue: 'خیابان معروف پاریس' },
    ],
    bgEmoji: '🇫🇷',
  },
  {
    id: 'zidane_galacticos',
    legendId: 'zidane',
    chapterIndex: 3,
    title: { fa: 'کهکشانی‌ها', en: 'Los Galácticos' },
    subtitle: { fa: 'گران‌ترین بازیکن جهان', en: 'The Most Expensive Player' },
    story: {
      fa: `در سال ۲۰۰۱، زیدان با رکوردشکن ۷۵ میلیون یورو به رئال مادرید پیوست. فلورنتینو پرز، رئیس باشگاه، او را به عنوان جدیدترین "کهکشانی" معرفی کرد. زیدان شماره ۵ را پوشید و جانشین ردو نوم و فرناندو هیرو شد.

اما بهترین لحظه او در رئال، ۱۵ می ۲۰۰۲ بود. فینال لیگ قهرمانان اروپا در همپدن پارک گلاسکو، مقابل بایر لورکوزن. یک ضربه والی خارق‌العاده با پای چپ از روی توپ برگشتی - گلی که در تاریخ جاودانه شد.

آن ضربه والی چنان زیبا بود که هواداران رئال حتی پس از دو دهه هنوز از آن با افتخار یاد می‌کنند. زیدان در رئال مادرید ۴۹ گل زد و ۵ جام از جمله لیگ قهرمانان و لالیگا را برد.`,
      en: `In 2001, Zidane joined Real Madrid for a record €75 million. Florentino Pérez, the club president, introduced him as the newest "Galáctico." Zidane wore the number 5 shirt, succeeding Redondo and Hierro.

But his finest moment at Real came on May 15, 2002. The Champions League final at Hampden Park, Glasgow, against Bayer Leverkusen. An incredible left-foot volley from a looping cross - a goal that became immortal in history.

That volley was so beautiful that Real fans still speak of it with pride even after two decades. Zidane scored 49 goals for Real Madrid and won 5 trophies including the Champions League and La Liga.`
    },
    victoryText: {
      fa: 'ضربه والی‌ات در گلاسکو جهان را متوقف کرد. توپ از آسمان آمد و پای چپت چنان ضربه‌ای زد که تاریخ از حرکت ایستاد. ۷۵ میلیون یورو ارزش تو بود و آن یک ضربه همه چیز را توجیه کرد. کهکشانی واقعی - زیدان در برنابئو جاودانه شد.',
      en: 'Your volley in Glasgow stopped the world. The ball came from the sky and your left foot struck it so perfectly that history paused. €75 million was your price and that single shot justified it all. The true Galáctico - Zidane was immortalized at the Bernabéu.'
    },
    year: '2001-2006',
    words: [
      { word: 'بایر', clue: 'حریف رئال در فینال ۲۰۰۲ | بایر لورکوزن' },
      { word: 'مادرید', clue: 'شهر باشگاه زیدان' },
      { word: 'کهکشانی', clue: 'لقب ستارگان رئال مادرید' },
      { word: 'یورو', clue: '۷۵ میلیون ... رکورد نقل و انتقالات' },
      { word: 'والی', clue: 'ضربه تاریخی زیدان در فینال' },
      { word: 'گلاسکو', clue: 'شهر فینال لیگ قهرمانان ۲۰۰۲' },
      { word: 'لیگ', clue: 'زیدان با ضربه والی تاریخی در فینال ... قهرمانان اروپا ۲۰۰۲ رئال را قهرمان کرد | دسته مسابقات' },
      { word: 'لالیگا', clue: 'قهرمانی زیدان در ... با رئال | لیگ اسپانیا' },
      { word: 'پرز', clue: 'رئیس باشگاه رئال مادرید' },
      { word: 'ضربه', clue: '... والی زیدان با پای چپ در همپدن پارک یکی از زیباترین گل‌های تاریخ است | شیوه زدن توپ' },
      { word: 'فینال', clue: '... لیگ قهرمانان ۲۰۰۲ در گلاسکو میزبان ضربه والی جاودانه زیدان بود | مرحله نهایی' },
      { word: 'جام', clue: 'زیدان در رئال مادرید پنج ... از جمله لیگ قهرمانان و لالیگا را برد | تورنمنت' },
    ],
    bgEmoji: '⚡',
  },
  {
    id: 'zidane_coach',
    legendId: 'zidane',
    chapterIndex: 4,
    title: { fa: 'استاد مربیگری', en: 'Coaching Maestro' },
    subtitle: { fa: 'سه‌گانه اروپا', en: 'European Three-Peat' },
    story: {
      fa: `در سال ۲۰۱۶، زیدان به عنوان مربی رئال مادرید منصوب شد. بسیاری تردید داشتند - او فقط تیم دوم را تمرین داده بود. اما زیدان همه را شگفت‌زده کرد. در اولین فصل، رئال مادرید را به قهرمانی لیگ قهرمانان اروپا رساند.

سه قهرمانی متوالی لیگ قهرمانان (۲۰۱۶، ۲۰۱۷، ۲۰۱۸) - کاری که هیچ مربی دیگری قبل از او نکرده بود. زیدان با آرامش خاص خود، تیم را رهبری می‌کرد و بازیکنان بزرگ را با هوش بالا مدیریت می‌نمود.

جاودانگی زیدان: تنها کسی در تاریخ که هم به عنوان بازیکن و هم به عنوان مربی قهرمان لیگ قهرمانان اروپا شد. استعداد خالص و هوش تاکتیکی - زیدان در هر دو نقش بهترین بود.`,
      en: `In 2016, Zidane was appointed as Real Madrid manager. Many doubted him - he had only coached the B team. But Zidane surprised everyone. In his first season, he led Real Madrid to Champions League glory.

Three consecutive Champions League titles (2016, 2017, 2018) - something no other manager had done before. Zidane led the team with his characteristic calm and managed big players with high intelligence.

Zidane's immortality: the only person in history to win the Champions League as both player and manager. Pure talent and tactical intelligence - Zidane was the best in both roles.`
    },
    victoryText: {
      fa: 'مربی شدی تا به همه بگویی نبوغت فقط در پاهایت نبود، در ذهنت هم بود. سه لیگ قهرمانان متوالی - عددی که تا ابد در تاریخ می‌ماند. از محله لا کاستلان تا قله اروپا، بازیکن و مربی، همیشه بهترین بودی. زیزو، تو واقعاً استادی.',
      en: 'You became a coach to show everyone that your genius wasn\'t just in your feet, it was in your mind too. Three consecutive Champions Leagues - a number that will remain in history forever. From La Castellane to the peak of Europe, player and manager, always the best. Zizou, you truly are a master.'
    },
    year: '2016-2021',
    words: [
      { word: 'مربی', clue: 'نقش جدید زیدان پس از بازی' },
      { word: 'پیاپی', clue: 'سه قهرمانی ... لیگ قهرمانان | متوالی' },
      { word: 'قهرمانی', clue: 'زیدان به عنوان مربی سه ... متوالی لیگ قهرمانان اروپا را برای رئال به ارمغان آورد | مقام اول' },
      { word: 'لیگ', clue: 'زیدان تنها کسی است که هم به عنوان بازیکن و هم به عنوان مربی ... قهرمانان اروپا را برده | دسته مسابقات' },
      { word: 'سه', clue: 'تعداد قهرمانی‌های متوالی' },
      { word: 'تاکتیک', clue: 'هوش ... زیدان در مربیگری' },
      { word: 'بازیکن', clue: 'تنها کسی که هم ... و هم مربی قهرمان شد' },
      { word: 'باشگاه', clue: 'زیدان بازیکنان بزرگ رئال مادرید را با هوش بالا مدیریت کرد و ... را به سه‌گانه اروپا رساند | تیم ورزشی' },
      { word: 'فصل', clue: 'زیدان در اولین ... مربی‌گری رئال مادرید را به قهرمانی لیگ قهرمانان اروپا رساند | دوره مسابقات' },
      { word: 'تیم', clue: 'زیدان قبل از مربیگری تیم اصلی، مربی ... دوم رئال مادرید بود | گروه بازیکنان' },
      { word: 'رکورد', clue: 'سه قهرمانی متوالی اروپا | کاری که هیچ مربی قبل از زیدان نکرد' },
      { word: 'هوش', clue: 'زیدان با ... تاکتیکی بالا و آرامش خاص خود رئال را به سه قهرمانی متوالی رساند | ذکاوت' },
    ],
    bgEmoji: '🎯',
  },
];

// ─── ALL LEGEND CHAPTERS ──────────────────────────────
// Map legendId → chapters for easy lookup
export const WORLD_MAP_CHAPTERS: Record<string, WorldMapChapter[]> = {
  maradona: MARADONA_CHAPTERS,
  messi: MESSI_CHAPTERS,
  pele: PELE_CHAPTERS,
  ronaldo: RONALDO_CHAPTERS,
  zidane: ZIDANE_CHAPTERS,
  // Classic legends (10)
  ...OLD_LEGENDS_A_CHAPTERS,
  ...OLD_LEGENDS_B_CHAPTERS,
  // Modern legends (10)
  ...MODERN_LEGENDS_A_CHAPTERS,
  ...MODERN_LEGENDS_B_CHAPTERS,
};

// ─── FINAL STORIES (shown when all chapters completed) ──
export const LEGEND_FINAL_STORIES: Record<string, { fa: string; en: string }> = {
  maradona: {
    fa: `سفر دیگو آرماندو مارادونا از کوچه‌های خاکی ویلا فیوریتو تا قله‌های افتخار، داستانی از استعداد ناب، اراده پولادین و عشقی پایان‌ناپذیر به فوتبال بود. او با دست خدا و گل قرن، نام خود را در تاریخ جاودانه کرد.

مارادونا فقط یک بازیکن نبود؛ او نماد امید برای مردم آرژانتین و تمام مستضعفان جهان بود. اشک‌هایش در وداع با فوتبال، لبخندهایش در نوکمپ، و قلب بزرگش برای مردم ناپل، همه و همه افسانه‌ای ساختند که تا ابد زنده خواهد ماند.

"ال پیکه د اورو" - پسر طلایی فوتبال - هرگز فراموش نخواهد شد.`,
    en: `Diego Armando Maradona's journey from the dusty streets of Villa Fiorito to the peaks of glory was a story of pure talent, iron will, and an endless love for football. With the Hand of God and the Goal of the Century, he immortalized his name in history.

Maradona was not just a player; he was a symbol of hope for the people of Argentina and the oppressed around the world. His tears in farewell to football, his smiles at Camp Nou, and his great heart for the people of Naples all built a legend that will live forever.

"El Pibe de Oro" - the Golden Boy of football - will never be forgotten.`
  },
  messi: {
    fa: `از پسر بچه‌ای که در روساریو توپ می‌زد تا بهترین بازیکن تاریخ فوتبال، لیونل مسی ثابت کرد که با عشق و پشتکار می‌توان به هر رویایی رسید. او با ۷ توپ طلا، رکورد ۹۱ گل در یک سال، و سرانجام قهرمانی جام جهانی، جایگاه خود را در تاریخ تثبیت کرد.

مسی نه فقط با پاهایش که با قلبش بازی کرد. سکوتش در برابر ناملایمات، فروتنی‌اش در اوج افتخار، و وفاداری‌اش به خانواده و تیم، او را به الگویی بی‌نظیر تبدیل کرد.

"الگوآت" - بهترین تمام دوران - داستانش ادامه دارد.`,
    en: `From a boy kicking a ball in Rosario to the greatest player in football history, Lionel Messi proved that with love and perseverance, any dream can be achieved. With 7 Ballon d'Ors, the record of 91 goals in a calendar year, and finally World Cup glory, he cemented his place in history.

Messi played not just with his feet but with his heart. His silence in adversity, his humility at the peak of glory, and his loyalty to family and team made him an unparalleled role model.

"The GOAT" - the Greatest of All Time - his story continues.`
  },
  ronaldo: {
    fa: `کریستیانو رونالدو از یک جزیره کوچک در پرتغال به قله جهان فوتبال رسید. او با تلاش بی‌وقفه، انضباط آهنین و عطش سیراب‌نشدنی برای موفقیت، ثابت کرد که سخت‌کوشی می‌تواند استعداد را شکست دهد.

۵ توپ طلا، قهرمانی اروپا با پرتغال، و رکوردهای بی‌شمار در منچستر، رئال مادرید و یوونتوس، او را به یکی از بزرگ‌ترین ورزشکاران تاریخ تبدیل کرد. فریاد معروف "SIUUU" او در سراسر جهان طنین‌انداز شد.

"CR7" - ماشین گلزنی تاریخ - ثابت کرد که محدودیت فقط در ذهن ماست.`,
    en: `Cristiano Ronaldo rose from a small island in Portugal to the pinnacle of world football. With relentless effort, iron discipline, and an unquenchable thirst for success, he proved that hard work can defeat talent.

5 Ballon d'Ors, European Championship with Portugal, and countless records at Manchester United, Real Madrid, and Juventus made him one of the greatest athletes in history. His famous "SIUUU" cry echoed around the world.

"CR7" - the goal machine of history - proved that limits only exist in our minds.`
  },
  pele: {
    fa: `ادسون آرانتس دو ناسیمنتو، ملقب به پله، فقط یک فوتبالیست نبود؛ او سلطان ورزش جهان بود. پسرکی که با توپ پارچه‌ای در خیابان‌های بائورو بازی می‌کرد، به جوان‌ترین قهرمان جام جهانی تاریخ تبدیل شد.

سه جام جهانی، ۱۰۰۰+ گل، و لبخندی که جهان را مسحور خود کرد. پله فوتبال را به هنر تبدیل کرد و ثابت کرد که یک بازیکن می‌تواند سفیری برای صلح و دوستی باشد.

"او ری" - شاه فوتبال - تا ابد زنده است.`,
    en: `Edson Arantes do Nascimento, known as Pelé, was not just a footballer; he was the king of world sports. The boy who played with a rag ball in the streets of Bauru became the youngest World Cup champion in history.

Three World Cups, 1000+ goals, and a smile that captivated the world. Pelé turned football into art and proved that a player can be an ambassador for peace and friendship.

"O Rei" - The King of Football - lives forever.`
  },
  zidane: {
    fa: `زین‌الدین زیدان، پسر مهاجران الجزایری از حومه مارسی، به یکی از بانفوذترین چهره‌های تاریخ فوتبال تبدیل شد. سبک بازی او، با آن حرکات مارپیچ و ضربات والی تماشایی، تماشاگران را در سراسر جهان مسحور می‌کرد.

از ضربه سر طلایی در فینال جام جهانی ۱۹۹۸ که فرانسه را قهرمان کرد، تا سه‌گانه لیگ قهرمانان به عنوان مربی، استعداد و ظرافت زیدان در هر صحنه قابل مشاهده بود.

"زیزو" - استاد میانی - به همه آموخت که فوتبال می‌تواند زیباترین هنر باشد.`,
    en: `Zinedine Zidane, the son of Algerian immigrants from the suburbs of Marseille, became one of the most influential figures in football history. His playing style, with those mesmerizing spins and spectacular volleys, captivated audiences worldwide.

From the golden header in the 1998 World Cup final that made France champions, to the Champions League three-peat as a coach, Zidane's talent and elegance were visible in every scene.

"Zizou" - the midfield maestro - taught everyone that football could be the most beautiful art.`
  },
  // Classic legends (10)
  ...OLD_LEGENDS_A_FINAL,
  ...OLD_LEGENDS_B_FINAL,
  // Modern legends (10)
  ...MODERN_LEGENDS_A_FINAL,
  ...MODERN_LEGENDS_B_FINAL,
};

// ─── HELPERS ──────────────────────────────────────────
export const getLegendChapters = (legendId: string): WorldMapChapter[] => {
  return WORLD_MAP_CHAPTERS[legendId] || [];
};

export const getChapterById = (chapterId: string): WorldMapChapter | undefined => {
  for (const chapters of Object.values(WORLD_MAP_CHAPTERS)) {
    const found = chapters.find(c => c.id === chapterId);
    if (found) return found;
  }
  return undefined;
};

export const getLegendFinalStory = (legendId: string): { fa: string; en: string } | null => {
  return LEGEND_FINAL_STORIES[legendId] || null;
};
