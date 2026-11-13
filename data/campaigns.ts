import { StoryBook } from '../types';
import { SHAHNAMEH_CHAPTERS } from './shahnamehChapters';
import { ROSTAM_SOHRAB_CHAPTERS } from './shahnameh/rostamSohrabChapters';
import { ROSTAM_AFRASIAB_CHAPTERS } from './shahnameh/rostamAfrasiabChapters';
import { SIAVOSH_CHAPTERS } from './shahnameh/siavoshanChapters';
import { BIZHAN_CHAPTERS } from './shahnameh/bizhanChapters';
import { ZAL_CHAPTERS } from './shahnameh/zalChapters';
import { ARASH_CHAPTERS } from './shahnameh/arashChapters';
import { KHOSROW_CHAPTERS } from './shahnameh/khosrowChapters';
import { PEYKAR_CHAPTERS } from './shahnameh/peykarChapters';
import { KUROSH_CHAPTERS } from './shahnameh/kuroshChapters';
import { MOSADEGH_CHAPTERS } from './shahnameh/mosaddeghChapters';
import { ZAHAK_CHAPTERS } from './shahnameh/zahhakChapters';
import { KAVEH_CHAPTERS } from './shahnameh/kavehChapters';
import { ESFANDIYAR_CHAPTERS } from './shahnameh/esfandiyarChapters';
import { ROSTAM_ESFANDIYAR_CHAPTERS } from './shahnameh/rostamEsfandiyarChapters';
import { TAHMINEH_CHAPTERS } from './shahnameh/tahminehChapters';
import { ZAL_SIMORGH_CHAPTERS } from './shahnameh/zalSimorghWords';
import { KAYKHOSROW_CHAPTERS } from './shahnameh/kaykhosrowWords';
import { ROSTAM_DEATH_CHAPTERS } from './shahnameh/rostamDeathWords';
import { ROSTAM_AKVAN_CHAPTERS } from './shahnameh/rostamAkvanWords';
import { HUSHANG_CHAPTERS } from './shahnameh/hushangWords';
import { JAMSHID_CHAPTERS } from './shahnameh/jamshidWords';
import { ANUSHIRVAN_CHAPTERS } from './shahnameh/anushirvanWords';
// History imports
import { MEDES_CHAPTERS } from './history/medesChapters';
import { ACHAEMENIDS_CHAPTERS } from './history/achaemenidsChapters';
import { PARTHIANS_CHAPTERS } from './history/parthiansChapters';
import { SASSANIDS_CHAPTERS } from './history/sassanidsChapters';
import { SELJUKS_CHAPTERS } from './history/seljuksChapters';
import { SAFAVIDS_CHAPTERS } from './history/safavidsChapters';
import { QAJARS_CHAPTERS } from './history/qajarsChapters';
import { PERSEPOLIS_CHAPTERS } from './history/persepolisChapters';
import { SILK_ROAD_CHAPTERS } from './history/silkRoadChapters';
import { DARIUSH_CHAPTERS } from './history/dariushChapters';
import { YAQUB_CHAPTERS } from './history/yaqubChapters';
import { ZANDIYEH_CHAPTERS } from './history/zandiyehChapters';
import { AMIR_KABIR_CHAPTERS } from './history/amirKabirChapters';
import { NADERSHAH_CHAPTERS } from './history/nadershahChapters';
import { MASHRUTEH_CHAPTERS } from './history/mashrutehChapters';

export const EPIC_CAMPAIGNS: StoryBook[] = [
    // 1. EPIC: ROSTAM (Hard)
    {
        id: 'rostam_7',
        genre: 'epic',
        title: "هفت خوان رستم",
        author: "فردوسی",
        description: "سفر پرخطر رستم برای نجات کیکاووس از بند دیوان مازندران.",
        coverImage: "/images/covers/rostam7.jpg", // Dark texture
        difficulty: 'hard',
        style: {
            primaryColor: '#d97706', // amber-600
            secondaryColor: '#78350f', // amber-900
            backgroundColor: '#1a1614', // dark brown
            textColor: '#fdf6e3', // cream
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SHAHNAMEH_CHAPTERS
    },

    // 2. FOLKLORE: HASSAN KACHAL (Medium - Dense Words)
    {
        id: 'hassan_kachal',
        genre: 'folklore',
        title: "حسن کچل",
        author: "افسانه قدیمی",
        description: "ماجراهای خنده‌دار حسن که از حمام رفتن فراری بود!",
        coverImage: "/images/covers/hassan-kachal.jpg", // Portrait vibe
        difficulty: 'medium',
        style: {
            primaryColor: '#db2777', // pink-600
            secondaryColor: '#fce7f3', // pink-100
            backgroundColor: '#fff1f2', // rose-50
            textColor: '#881337', // rose-900
            fontFamily: 'sans',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/cubes.png"
        },
        chapters: [
            {
                id: 1,
                title: "نقشه ننه حسن",
                description: "صبح زود است و خورشید تازه از پشت بام‌ها سر زده. ننه حسن، پیرزن مهربان اما زرنگ، از دست تنبلی حسن به تنگ آمده. حسن تمام روز را در رختخواب دراز کشیده و به هیچ کاری تن نمی‌دهد. اما ننه حسن نقشه‌ای کشیده: سیب‌های سرخ و آبدار را از سبد برداشته و یکی‌یکی از خانه تا دم در کوچه چیده تا حسن را از لانه بیرون بکشد. آیا این نقشه کارساز می‌شود؟ کلمات جدول را پیدا کن تا ببینی حسن بالاخره از خانه بیرون می‌آید یا نه!",
                image: "/images/chapters/hassan/ch1.jpg", // Red Apples
                monsterAvatar: "/images/monsters/folktales/div/ch1-monster.jpg",
                monsterName: "دیو باغ",
                victoryText: "سیب‌ها یکی‌یکی داخل دهان حسن رفت و او بدون آنکه بفهمد، خود را دم در کوچه یافت. ننه حسن سریع در را بست و قفل کرد! حسن که تازه فهمید چه بلایی سرش آمده، پشت در نشست و زد زیر گریه. اما دیگر دیر شده بود. حالا یا باید به حمام می‌رفت یا تا شب جلوی در می‌ماند. آه از نهاد حسن بلند شد... اما این تازه اول ماجرا بود!",
                words: [
                    { word: "سیب", clue: "میوه قرمز که ننه روی زمین چید" },
                    { word: "ننه", clue: "مادر پیر و مهربان حسن" },
                    { word: "تنبل", clue: "کسی که حال کار کردن ندارد" },
                    { word: "کوچه", clue: "بیرون از خانه" },
                    { word: "حمام", clue: "جایی که حسن از آن بدش می‌آمد" },
                    { word: "کچل", clue: "کسی که مو ندارد" },
                    { word: "بقچه", clue: "پارچه‌ای که لباس‌ها را در آن می‌پیچند" },
                    { word: "صابون", clue: "وسیله شستشو در حمام" },
                    { word: "کلید", clue: "ننه در را با آن قفل کرد" },
                    { word: "خواب", clue: "کار مورد علاقه حسن" },
                    { word: "گرسنه", clue: "وقتی غذا نخورده باشی" },
                    // New words for variety
                    { word: "خانه", clue: "محل زندگی حسن و ننه" },
                    { word: "درب", clue: "ورودی خانه که بسته شد" },
                    { word: "قفل", clue: "ننه به در زد تا باز نشود" },
                    { word: "غذا", clue: "حسن همیشه دنبال آن بود" },
                    { word: "شام", clue: "وعده غذایی آخر شب" },
                    { word: "ناز", clue: "ادا و اصول حسن برای کار نکردن" }
                ]
            },
            {
                id: 2,
                title: "باغ اسرارآمیز",
                description: "حسن گرسنه و سرگردان در کوچه‌های خلوت پرسه می‌زند. شکمش از گرسنگی قار و قور می‌کند و هیچ‌کس به دادش نمی‌رسد. ناگهان بوی عجیب و دلنشینی از پشت دیواری بلند به مشامش می‌رسد. بوی گل‌های رنگارنگ و میوه‌های رسیده. حسن خود را به دیوار می‌رساند و از لای شاخ و برگ نگاه می‌کند: باغی است بزرگ و سرسبز با درختانی که میوه‌هایشان تا دیوار آویزان شده. اما از داخل باغ، صدای ناله و آواز غمگینی می‌آید. این باغ رازی در خود دارد... کلمات جدول را حل کن تا بفهمی حسن با چه راز ترسناکی در این باغ روبرو می‌شود.",
                image: "/images/chapters/hassan/ch2.jpg", // Garden
                monsterAvatar: "/images/monsters/folktales/div/ch1-monster.jpg",
                monsterName: "دیو باغ",
                victoryText: "حسن یواشکی از لای درختان گذشت و خود را به وسط باغ رساند. آنجا بود که دختری زیبا به نام چهل‌گیس را دید که با زنجیری به درخت بسته شده بود. چشمانش پر از اشک بود و آواز غمگینی می‌خواند. حسن که دلش به رحم آمد، پیش رفت تا او را آزاد کند، اما ناگهان زمین لرزید و سایه‌ای عظیم همه جا را پوشاند. دیو باغ از راه رسیده بود! چشمان سرخ و دندان‌های تیزش در تاریکی برق می‌زد...",
                words: [
                    { word: "باغ", clue: "محل پر از درخت میوه" },
                    { word: "دیو", clue: "موجود ترسناک صاحب باغ" },
                    { word: "ترس", clue: "حسن داشت می‌لرزید" },
                    { word: "درخت", clue: "حسن پشت آن قایم شد" },
                    { word: "دیوار", clue: "دور باغ کشیده شده بود" },
                    { word: "انگور", clue: "میوه‌ای که از دیوار آویزان بود" },
                    { word: "آواز", clue: "صدای خواندن چهل‌گیس" },
                    { word: "طلسم", clue: "جادویی که در باغ بود" },
                    { word: "دختر", clue: "چهل‌گیس زندانی بود" },
                    { word: "شیشه", clue: "عمر دیو در آن بود" },
                    { word: "سنگ", clue: "حسن آن را برداشت" },
                    // New words
                    { word: "میوه", clue: "محصول درختان باغ" },
                    { word: "سایه", clue: "جایی که آفتاب نیست (حسن آنجا نشست)" },
                    { word: "آب", clue: "مایه حیات در جوی باغ" },
                    { word: "برگ", clue: "پوشش سبز درختان" },
                    { word: "راه", clue: "مسیر ورود به باغ" }
                ]
            },
            {
                id: 3,
                title: "شکستن طلسم",
                description: "دیو خشمگین به سوی حسن حمله می‌کند، اما حسن که تا به حال از هیچ چیز نترسیده بود، دست و پای خود را گم نمی‌کند. چهل‌گیس در گوش حسن زمزمه می‌کند: «شیشه‌ای در قفسهٔ سنگی پشت تخت دیو پنهان است. جان دیو به آن شیشه بسته است. اگر آن را بشکنی، دیو نابود می‌شود.» حسن با چشمانی مصمم به قفسه نگاه می‌کند. اما راه رسیدن به آن از میان چنگال‌های دیو می‌گذرد. آیا حسن تنبل می‌تواند شجاع باشد و دیو را شکست دهد؟ کلمات جدول را رمزگشایی کن تا پایان این ماجرای هیجان‌انگیز را ببینی!",
                image: "/images/chapters/hassan/ch3.jpg", // Glass/Light
                monsterAvatar: "/images/monsters/folktales/div/ch1-monster.jpg",
                monsterName: "دیو باغ",
                victoryText: "حسن سنگی برداشت و با تمام قدرت به طرف شیشه پرتاب کرد. صدای شکستن شیشه در تاریکی باغ پیچید. دیو نعره‌ای کشید که کوه و دشت را لرزاند و بدنش مثل دود در هوا ناپدید شد. ناگهان باغ پر از نور شد. گل‌ها شکفتند و پرندگان شروع به خواندن کردند. چهل‌گیس از بند رها شد و به سوی حسن دوید. مردم شهر که صدای دیو را شنیده بودند، به باغ آمدند و حسن را قهرمان خود خواندند. از آن روز به بعد، حسن تنبل دیگر تنبل نبود. او قهرمان شهر شده بود و جشن عروسی‌اش با چهل‌گیس چهل شبانه‌روز طول کشید!",
                words: [
                    { word: "شکست", clue: "وقتی شیشه به سنگ خورد" },
                    { word: "دود", clue: "وقتی دیو نابود شد بلند شد" },
                    { word: "عمر", clue: "جان دیو به آن بسته بود" },
                    { word: "آزاد", clue: "رها شدن چهل‌گیس" },
                    { word: "شادی", clue: "خوشحالی بعد از پیروزی" },
                    { word: "داماد", clue: "حسن بالاخره ... شد" },
                    { word: "عروسی", clue: "جشن پایان قصه" },
                    { word: "مردم", clue: "اهالی شهر که جمع شدند" },
                    { word: "قهرمان", clue: "حسن دیگر تنبل نبود، او یک ... بود" },
                    // New words
                    { word: "نور", clue: "روشنایی بعد از رفتن دیو" },
                    { word: "جشن", clue: "مراسم پایکوبی" },
                    { word: "ساز", clue: "در عروسی می‌زنند" },
                    { word: "شهر", clue: "محل زندگی مردم" },
                    { word: "سیب", clue: "میوه آغاز و پایان قصه" }
                ]
            }
        ]
    },

    // 3. EDUCATION: FARSI GRADE 1 (Easy - Comprehensive)
    {
        id: 'farsi_aval',
        genre: 'education',
        title: "فارسی اول دبستان",
        author: "کتاب درسی",
        description: "۱۰ درس جذاب برای تمرین املا و یادگیری کلمات زیبا.",
        coverImage: "/images/covers/farsi-aval.jpg", // Pencils
        difficulty: 'easy',
        style: {
            primaryColor: '#0ea5e9', // sky-500
            secondaryColor: '#e0f2fe', // sky-100
            backgroundColor: '#f0f9ff', // sky-50
            textColor: '#0c4a6e', // sky-900
            fontFamily: 'sans',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/notebook.png"
        },
        chapters: [
            // Lesson 1: Water
            {
                id: 1,
                title: "درس اول: آب (آ - ب)",
                description: "سلام به کلاس اولی‌های عزیز! امروز اولین روز مدرسه است و ما می‌خواهیم با دو حرف جدید آشنا شویم: «آ» مثل آسمان آبی و «ب» مثل بابای مهربان. وقتی این دو حرف را کنار هم بگذاریم، چه کلمه‌ای ساخته می‌شود؟ بیا کلمات شیرین این درس را پیدا کن و خواندن را شروع کن!",
                image: "/images/chapters/farsi-aval/ch1.jpg", // Water
                victoryText: "آفرین به تو ای دانش‌آموز باهوش! تو توانستی اولین کلمات کتاب فارسی را بخوانی. «بابا آب داد» یعنی بابا به من آب داد. حالا تو می‌توانی این جمله را برای پدرت بخوانی و او را خوشحال کنی. آماده‌ای برای درس بعدی؟",
                words: [
                    { word: "آب", clue: "مایه حیات که می‌نوشیم" },
                    { word: "بابا", clue: "پدر مهربان" },
                    { word: "دریا", clue: "جایی که آب زیاد دارد" },
                    { word: "آبی", clue: "رنگ آسمان" },
                    { word: "باد", clue: "هوای متحرک" },
                    // New Words to Fix "Abi/Ab" conflict and add variety
                    { word: "آباد", clue: "جایی که ویران نیست" },
                    { word: "آداب", clue: "رسوم و رفتار درست" },
                    { word: "بار", clue: "چیزی که حمل می‌کنیم" },
                    { word: "بام", clue: "پشت‌بام خانه" },
                    { word: "باب", clue: "در یا فصل کتاب" },
                    { word: "ادب", clue: "خوش‌رفتاری" },
                    { word: "ابد", clue: "همیشه و جاودان" }
                ]
            },
            // Lesson 2: Rain
            {
                id: 2,
                title: "درس دوم: باران (ر - ن)",
                description: "آسمان ابری شده و قطره‌های نقره‌ای باران از ابرها می‌بارند. باران که می‌آید، دانه‌ها در خاک می‌رویند و نان در سفره‌ها می‌آید. امروز می‌خواهیم با حرف «ر» مثل باران، «ن» مثل نان و «د» مثل دانه آشنا شویم. کلمات این درس مثل قطره‌های باران شیرین و تازه هستند. بیا آن‌ها را پیدا کن!",
                image: "/images/chapters/farsi-aval/ch2.jpg", // Rain
                victoryText: "صد آفرین! باران آمد، دانه رویید، نان به سفره رسید. تو کلمات جدید زیادی یاد گرفتی و حالا می‌توانی جمله‌های بلندتری بخوانی. دانه‌های علم در ذهن تو هم دارد می‌روید. به راهت ادامه بده، دانش‌آموز باهوش!",
                words: [
                    { word: "باران", clue: "قطرات آب که از ابر می‌بارد" },
                    { word: "ابر", clue: "توده سفید در آسمان" },
                    { word: "نان", clue: "برکت سفره که نانوا می‌پزد" },
                    { word: "دانه", clue: "آن را در خاک می‌کاریم" },
                    { word: "آرد", clue: "گندم پودر شده" },
                    // New Words
                    { word: "دانا", clue: "کسی که زیاد می‌داند" },
                    { word: "ندار", clue: "فقیر (کسی که ندارد)" },
                    { word: "دارا", clue: "ثروتمند (کسی که دارد)" },
                    { word: "انبار", clue: "محل نگهداری کالا" },
                    { word: "برنا", clue: "جوان" },
                    { word: "برابر", clue: "مساوی" }
                ]
            },
            // Lesson 3: School
            {
                id: 3,
                title: "درس سوم: مدرسه (م - س)",
                description: "زنگ مدرسه به صدا درآمده و بچه‌ها با خوشحالی وارد کلاس می‌شوند. امروز با دو حرف جدید آشنا می‌شویم: «م» مثل مادر و مدرسه، و «س» مثل سبد. توی کلاس، پشت میزها می‌نشینیم و با مداد رنگی می‌نویسیم. بیا کلمات این درس را پیدا کن و ببین در مدرسه چه خبر است!",
                image: "/images/chapters/farsi-aval/ch3.jpg", // Classroom/School
                victoryText: "آفرین! مدرسه خانه دوم ماست. تو حالا می‌توانی اسم وسایل مدرسه را بخوانی و بنویسی. هر روز که به مدرسه می‌روی، یک قدم به دانایی نزدیک‌تر می‌شوی. به همین شوق ادامه بده، دانش‌آموز مهربان!",
                words: [
                    { word: "مدرسه", clue: "جایی که درس می‌خوانیم" },
                    { word: "کلاس", clue: "اتاق درس" },
                    { word: "میز", clue: "روی آن می‌نویسیم" },
                    { word: "درس", clue: "چیزی که معلم یاد می‌دهد" },
                    { word: "مداد", clue: "با آن می‌نویسیم" },
                    { word: "سبد", clue: "وسیله حمل میوه" },
                    // New words
                    { word: "اسم", clue: "نام هر چیزی" },
                    { word: "آدم", clue: "انسان" },
                    { word: "داس", clue: "ابزار درو کردن" },
                    { word: "سر", clue: "بالاترین عضو بدن" },
                    { word: "سرد", clue: "ضد گرم" }
                ]
            },
            // Lesson 4: Pomegranate (Anar)
            {
                id: 4,
                title: "درس چهارم: انار (اَ - ر)",
                description: "پاییز از راه رسیده و درخت‌ها پر از میوه‌های رنگارنگ شده‌اند. انار سرخ و دانه‌دانه مثل یاقوت روی شاخه‌ها می‌درخشد. توت شیرین، تاب بازی در پارک، و برادر مهربان... این‌ها همه کلماتی هستند که امروز یاد می‌گیریم. بیا کلمات این درس را رمزگشایی کن و از طعم شیرین دانستن لذت ببر!",
                image: "/images/chapters/farsi-aval/ch4.jpg", // Pomegranate
                victoryText: "به به! انار صد دانه یاقوت، توت شیرین، تاب بازی و برادر مهربان. چه کلمات قشنگی! تو مثل درخت انار پربار شده‌ای از کلمات تازه. هر دانه از این کلمات در ذهن تو می‌درخشد و تو را باهوش‌تر می‌کند. به خاطر خودت، به این تلاش شیرین ادامه بده!",
                words: [
                    { word: "انار", clue: "میوه قرمز و دانه‌دار پاییزی" },
                    { word: "توت", clue: "میوه سفید و شیرین" },
                    { word: "تاب", clue: "وسیله بازی در پارک" },
                    { word: "برادر", clue: "پسر خانواده" },
                    { word: "سرد", clue: "وقتی هوا گرم نیست" },
                    // New words
                    { word: "تار", clue: "ساز موسیقی یا کدر" },
                    { word: "رود", clue: "آب جاری" },
                    { word: "ارد", clue: "پودر نان" },
                    { word: "دارا", clue: "اسم پسرانه" },
                    { word: "سارا", clue: "اسم دخترانه" }
                ]
            },
            // Lesson 5: Iran (Patriotism)
            {
                id: 5,
                title: "درس پنجم: ایران (ایـ - یـ)",
                description: "ایران عزیز، سرزمینی با پرچم سه رنگ زیبا: سبز برای طبیعت، سفید برای صلح و سرخ برای شجاعت. امروز با حرف «ایـ» و «یـ» آشنا می‌شویم، حرف‌هایی که نام کشورمان «ایران» با آن شروع می‌شود. با کلمات این درس، عشق به وطن را در جدول پیدا کن!",
                image: "/images/chapters/farsi-aval/ch5.jpg", // Flag/Map theme
                victoryText: "زنده باد ایران! تو فرزند این سرزمین زیبا هستی. پرچم سه رنگ ایران همیشه در قلب تو می‌درخشد. ایران فقط یک کشور نیست، خانه ماست. تو با یادگیری این کلمات، به ایران خود افتخار می‌کنی. آفرین به تو!",
                words: [
                    { word: "ایران", clue: "کشور عزیزمان" },
                    { word: "پرچم", clue: "نشان سه رنگ کشور" },
                    { word: "سبز", clue: "رنگ بالای پرچم" },
                    { word: "سفید", clue: "رنگ وسط پرچم (صلح)" },
                    { word: "ایمان", clue: "باور قلبی به خدا" },
                    { word: "بیدار", clue: "هوشیار (ضد خواب)" },
                    // New words
                    { word: "امین", clue: "امانت‌دار" },
                    { word: "امیر", clue: "فرمانده" },
                    { word: "سیب", clue: "میوه بهشتی" },
                    { word: "میز", clue: "چهارپایه چوبی" },
                    { word: "ریز", clue: "کوچک" }
                ]
            },
            // Lesson 6: Body (Anatomy)
            {
                id: 6,
                title: "درس ششم: بدن انسان",
                description: "بدن ما چه قدر زیباست! با دست‌ها کار می‌کنیم، با پاها راه می‌رویم، با چشم‌ها می‌بینیم و با گوش‌ها می‌شنویم. زبان برای حرف زدن، دندان برای جویدن و بینی برای بو کردن. امروز می‌خواهیم نام اعضای بدن را یاد بگیریم و ببینیم خدا چه نعمت‌های بزرگی به ما داده. بیا کلمات این درس را کشف کن!",
                image: "/images/chapters/farsi-aval/ch6.jpg", // Child/Human
                victoryText: "خدا را شکر برای این بدن سالم و زیبا! حالا تو نام اعضای بدنت را می‌دانی و می‌توانی آن‌ها را بنویسی. از چشم‌هایت برای دیدن خوبی‌ها، از گوش‌هایت برای شنیدن حرف‌های قشنگ و از زبانت برای گفتن کلمات محبت‌آمیز استفاده کن. آفرین!",
                words: [
                    { word: "دست", clue: "با آن کار می‌کنیم و می‌نویسیم" },
                    { word: "پا", clue: "با آن راه می‌رویم" },
                    { word: "چشم", clue: "با آن می‌بینیم" },
                    { word: "گوش", clue: "با آن می‌شنویم" },
                    { word: "مواظب", clue: "کسی که دقت می‌کند (مراقب)" },
                    { word: "تمیز", clue: "پاکیزه (ضد کثیف)" },
                    // New words
                    { word: "سر", clue: "بالای گردن" },
                    { word: "مو", clue: "روی سر می‌روید" },
                    { word: "دندان", clue: "با آن غذا می‌جویم" },
                    { word: "زبان", clue: "با آن حرف می‌زنیم" },
                    { word: "بینی", clue: "با آن بو می‌کنیم" }
                ]
            },
            // Lesson 7: Animals
            {
                id: 7,
                title: "درس هفتم: حیوانات",
                description: "در دنیای زیبای حیوانات، هر کدام دوست داشتنی و خاص هستند. سگ وفادار، گربهٔ بازیگوش، شیر شجاع، خرس قوی و پروانهٔ رنگارنگ. امروز به باغ وحش کلمات سفر می‌کنیم و نام حیوانات مختلف را یاد می‌گیریم. بیا کلمات این درس را پیدا کن و با دنیای شگفت‌انگیز حیوانات آشنا شو!",
                image: "/images/chapters/farsi-aval/ch7.jpg", // Fox/Animal
                victoryText: "حیوانات نشانه‌های قدرت و زیبایی خداوند هستند. هر کدام از آن‌ها دنیایی از شگفتی دارند: شیر سلطان جنگل، پروانه با بال‌های رنگارنگ، و دلفین باهوش دریا. با همهٔ حیوانات مهربان باش، چون آن‌ها هم مانند ما حق زندگی دارند. آفرین به تو که نام آن‌ها را یاد گرفتی!",
                words: [
                    { word: "سگ", clue: "حیوان باوفا و نگهبان" },
                    { word: "گرگ", clue: "حیوان وحشی شبیه سگ" },
                    { word: "گربه", clue: "حیوان خانگی ملوس" },
                    { word: "اردک", clue: "پرنده‌ای که در آب شنا می‌کند" },
                    { word: "لک‌لک", clue: "پرنده پا بلند مهاجر" },
                    { word: "زنبور", clue: "حشره‌ای که عسل می‌سازد" },
                    // New words
                    { word: "شیر", clue: "سلطان جنگل" },
                    { word: "ببر", clue: "گربه بزرگ راه‌راه" },
                    { word: "خرس", clue: "حیوان بزرگ که عسل دوست دارد" },
                    { word: "موش", clue: "حیوان کوچک که پنیر دوست دارد" },
                    { word: "مار", clue: "خزنده بی دست و پا" }
                ]
            },
            // Lesson 8: Family
            {
                id: 8,
                title: "درس هشتم: خانواده",
                description: "خانواده گرم‌ترین جای دنیاست. مادر مهربان که همیشه مراقب ماست، پدر قوی که تکیه‌گاه ماست، خواهر و برادر که همبازی‌های ما هستند. خانه جایی است که همه دور هم جمع می‌شویم و عشق و محبت را تقسیم می‌کنیم. امروز کلمات قشنگ خانواده را در جدول پیدا کن و به مادر و پدرت بگو چقدر دوستشان داری!",
                image: "/images/chapters/farsi-aval/ch8.jpg", // Family
                victoryText: "خانواده گرم‌ترین کانون زندگی است. مادر فرشته مهربان، پدر تکیه‌گاه، خواهر و برادر همراهان همیشگی. خانه جایی نیست که فقط در آن زندگی می‌کنی، خانه جایی است که عشق در آن جریان دارد. همیشه به پدر و مادرت احترام بگذار و قدر آن‌ها را بدان. آفرین به تو!",
                words: [
                    { word: "مادر", clue: "فرشته مهربان خانه" },
                    { word: "پدر", clue: "تکیه‌گاه خانواده" },
                    { word: "خواهر", clue: "دختر خانواده" },
                    { word: "آزاده", clue: "نام دختر (اسم خاص)" },
                    { word: "خانه", clue: "محل زندگی خانواده" },
                    { word: "دامن", clue: "لباس دخترانه" },
                    // New words
                    { word: "برادر", clue: "پسر خانواده" },
                    { word: "پسر", clue: "فرزند مذکر" },
                    { word: "دختر", clue: "فرزند مونث" },
                    { word: "ننه", clue: "مادر بزرگ (قدیمی)" },
                    { word: "بابا", clue: "پدر (محاوره)" }
                ]
            },
            // Lesson 9: Nature/Seasons
            {
                id: 9,
                title: "درس نهم: طبیعت زیبا",
                description: "به دامن طبیعت خوش آمدی! کوه‌های سر به فلک کشیده، رودخانه‌های خنک، جنگل‌های سرسبز و گل‌های رنگارنگ همه نشانه‌های زیبایی خداوند هستند. در بهار، شکوفه‌ها لباس سفید بر تن درختان می‌پوشانند و در زمستان، برف آن‌ها را سفیدپوش می‌کند. بیا با کلمات این درس به دل طبیعت سفر کنیم!",
                image: "/images/chapters/farsi-aval/ch9.jpg", // Forest/Nature
                victoryText: "طبیعت زیباترین هدیهٔ خداوند به ماست. کوه، دریا، جنگل، رودخانه، گل و درخت... هر کدام دنیایی از زیبایی و شگفتی هستند. ما باید از طبیعت مراقبت کنیم، زباله نریزیم، درختان را نشکنیم و به حیوانات احترام بگذاریم. تو با یادگیری این کلمات، به طبیعت نزدیک‌تر شدی. آفرین!",
                words: [
                    { word: "کوه", clue: "بلندی سنگی و بزرگ" },
                    { word: "رود", clue: "آب جاری روی زمین" },
                    { word: "برف", clue: "بارش سفید زمستانی" },
                    { word: "سرد", clue: "هوای زمستان" },
                    { word: "جنگل", clue: "جایی که درخت زیاد دارد" },
                    { word: "شالیزار", clue: "محل کشت برنج" },
                    // New words
                    { word: "دریا", clue: "آب بسیار زیاد" },
                    { word: "دشت", clue: "زمین صاف و هموار" },
                    { word: "گل", clue: "گیاه زیبا و خوشبو" },
                    { word: "برگ", clue: "لباس درخت" },
                    { word: "باغ", clue: "محل درختان میوه" }
                ]
            },
            // Lesson 10: Celebration
            {
                id: 10,
                title: "درس دهم: جشن تولد",
                description: "امروز یک روز خاص است! کیک بزرگ با شمع‌های رنگارنگ، بادکنک‌های شاد و هدیه‌های قشنگ. همه دور هم جمع شده‌اند تا تولد تو را جشن بگیرند. با کلمات این درس، شیرین‌ترین لحظات زندگی را در جدول پیدا کن و به همه بگو: «امروز روز من است!»",
                image: "/images/chapters/farsi-aval/ch10.jpg", // Birthday/Cake
                victoryText: "تولدت مبارک! همیشه شاد و خندان باشی. کیک و شمع، هدیه و جشن، خنده و شادی... این‌ها شیرین‌ترین لحظات زندگی هستند. امیدوارم هر روز زندگیت مثل یک جشن تولد پر از عشق و محبت باشد. کلاس اولی عزیز، تو ده درس را با موفقیت پشت سر گذاشتی. به خودت افتخار کن! آفرین! 🎉",
                words: [
                    { word: "تولد", clue: "روز به دنیا آمدن" },
                    { word: "جشن", clue: "مراسم شادی" },
                    { word: "کیک", clue: "شیرینی مخصوص تولد" },
                    { word: "شمع", clue: "روی کیک فوت می‌کنیم" },
                    { word: "هدیه", clue: "کادو" },
                    { word: "خنده", clue: "نشانه شادی روی لب" },
                    // New words
                    { word: "شادی", clue: "خوشحالی" },
                    { word: "دوست", clue: "رفیق و همراه" },
                    { word: "بازی", clue: "سرگرمی" },
                    { word: "کادو", clue: "هدیه" },
                    { word: "مبارک", clue: "خجسته و میمون" }
                ]
            }
        ]
    },

    // 4. EPIC: ROSTAM & SOHRAB (Hard)
    {
        id: 'rostam_sohrab',
        genre: 'epic',
        title: "رستم و سهراب",
        author: "فردوسی",
        description: "تراژدی غم‌انگیز نبرد ناخواسته پدر و پسر، رستم و سهراب، در میدان جنگ.",
        coverImage: "/images/covers/rostam-sohrab.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#b91c1c',
            secondaryColor: '#7f1d1d',
            backgroundColor: '#1a0f0f',
            textColor: '#fef2f2',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ROSTAM_SOHRAB_CHAPTERS
    },

    // 5. EPIC: ROSTAM & AFRASIAB (Hard)
    {
        id: 'rostam_afrasiab',
        genre: 'epic',
        title: "رستم و افراسیاب",
        author: "فردوسی",
        description: "نبرد سرنوشت‌ساز رستم با افراسیاب، شاه اهریمنی توران، از پیمان‌شکنی تا کیفر نهایی.",
        coverImage: "/images/covers/rostam-afrasiab.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#4f46e5',
            secondaryColor: '#1e1b4b',
            backgroundColor: '#0a0a1a',
            textColor: '#eef2ff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ROSTAM_AFRASIAB_CHAPTERS
    },

    // 6. EPIC: SIAVASH (Hard)
    {
        id: 'siavoshan',
        genre: 'epic',
        title: "سیاوش",
        author: "فردوسی",
        description: "داستان غم‌انگیز شاهزاده سیاوش، از تولد و تعلیم تا عبور از آتش، عشق به فرنگیس، و شهادت مظلومانه در توران.",
        coverImage: "/images/covers/siavoshan.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#e63946',
            secondaryColor: '#6d0f1a',
            backgroundColor: '#1a0a0f',
            textColor: '#ffeedd',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SIAVOSH_CHAPTERS
    },

    // 7. EPIC: BIZHAN & MANIJEH (Hard)
    {
        id: 'bizhan',
        genre: 'epic',
        title: "بیژن و منیژه",
        author: "فردوسی",
        description: "داستان عشق دلیرانه بیژن پهلوان و منیژه دختر افراسیاب، زندان بیژن در چاه تاریک و نجات او به دست رستم.",
        coverImage: "/images/covers/bizhan.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#2d6a4f',
            secondaryColor: '#0b3322',
            backgroundColor: '#0a140f',
            textColor: '#e8f5e9',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: BIZHAN_CHAPTERS
    },

    // 8. EPIC: ZAL & RUDABEH (Hard)
    {
        id: 'zal_rudabeh',
        genre: 'epic',
        title: "زال و رودابه",
        author: "فردوسی",
        description: "داستان عشق زال سپیدموی پهلوان و رودابه دختر مهراب، از تولد زال در آشیانه سیمرغ تا ازدواج و تولد رستم پهلوان.",
        coverImage: "/images/covers/zal-rudabeh.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#d97706',
            secondaryColor: '#78350f',
            backgroundColor: '#1a1614',
            textColor: '#fdf6e3',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ZAL_CHAPTERS
    },

    // 9. EPIC: ARASH THE ARCHER (Hard)
    {
        id: 'arash',
        genre: 'epic',
        title: "آرش کمانگیر",
        author: "اسطوره کهن",
        description: "حماسه آرش کمانگیر که با پرتاب تیر و فدا کردن جان خود، مرز ایران را تا کنار جیحون کشاند و وطن را از چنگ توران رهانید.",
        coverImage: "/images/covers/arash.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#f59e0b',
            secondaryColor: '#92400e',
            backgroundColor: '#1c1917',
            textColor: '#fffbeb',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ARASH_CHAPTERS
    },

    // 10. CLASSIC: KHOSROW & SHIRIN (Hard)
    {
        id: 'khosrow_shirin',
        genre: 'epic',
        title: "خسرو و شیرین",
        author: "نظامی",
        description: "عاشقانه جاودان خسروپرویز و شیرین زیبا، رقابت با فرهاد کوه‌کن و پایان تراژیک این مثلث عشقی در شاهکار نظامی گنجوی.",
        coverImage: "/images/covers/khosrow.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#ec4899',
            secondaryColor: '#9d174d',
            backgroundColor: '#140a0f',
            textColor: '#fdf2f8',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: KHOSROW_CHAPTERS
    },

    // 11. EPIC: HAFT PEYKAR (Hard)
    {
        id: 'haft_peykar',
        genre: 'epic',
        title: "هفت پیکر",
        author: "نظامی",
        description: "داستان بهرام گور، پادشاه دادگر ایران، که هفت گنبد به هفت رنگ برای هفت شاهزاده از هفت اقلیم ساخت و هر شب داستانی شنید.",
        coverImage: "/images/covers/peykar.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#06b6d4',
            secondaryColor: '#0e7490',
            backgroundColor: '#0a0f14',
            textColor: '#ecfeff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: PEYKAR_CHAPTERS
    },

    // 12. HISTORY: KUROSH-E KABIR (Hard)
    {
        id: 'kurosh',
        genre: 'history',
        title: "کوروش بزرگ",
        author: "تاریخ ایران باستان",
        description: "زندگی کوروش بزرگ از تولد تا فتح بابل و نگارش منشور حقوق بشر، بنیان‌گذار شاهنشاهی هخامنشی.",
        coverImage: "/images/covers/kurosh.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#f59e0b',
            secondaryColor: '#b45309',
            backgroundColor: '#0f0a09',
            textColor: '#fffbeb',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: KUROSH_CHAPTERS
    },

    // 14. EPIC: ZAHHAK (Hard)
    {
        id: 'zahhak',
        genre: 'epic',
        title: "ضحاک و کاوه آهنگر",
        author: "فردوسی",
        description: "داستان ضحاک ماروش که اهریمن بر دوشش بوسه زد و کاوه آهنگر که علیه ظلم قیام کرد.",
        coverImage: "/images/covers/zahhak.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#7c3aed',
            secondaryColor: '#2e1065',
            backgroundColor: '#0f0a14',
            textColor: '#f5f3ff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ZAHAK_CHAPTERS
    },

    // 15. EPIC: KAVEH (Hard)
    {
        id: 'kaveh',
        genre: 'epic',
        title: "کاوه آهنگر",
        author: "فردوسی",
        description: "قیام مردانه کاوه آهنگر علیه ضحاک ماردوش و به اهتزاز درآمدن درفش آزادی در ایران.",
        coverImage: "/images/covers/kaveh.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#e11d48',
            secondaryColor: '#881337',
            backgroundColor: '#0f0a0c',
            textColor: '#fff1f2',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: KAVEH_CHAPTERS
    },

    // 16. EPIC: ESFANDIYAR (Hard)
    {
        id: 'esfandiyar',
        genre: 'epic',
        title: "اسفندیار",
        author: "فردوسی",
        description: "سفر پرمخاطره اسفندیار رویین‌تن در هفت خوان برای نجات خواهرانش از بند دشمن.",
        coverImage: "/images/covers/esfandiyar.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#059669',
            secondaryColor: '#064e3b',
            backgroundColor: '#0a0f0c',
            textColor: '#ecfdf5',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ESFANDIYAR_CHAPTERS
    },

    // 17. EPIC: ROSTAM & ESFANDIYAR (Hard)
    {
        id: 'rostam_esfandiyar',
        genre: 'epic',
        title: "رستم و اسفندیار",
        author: "فردوسی",
        description: "نبرد تراژیک دو پهلوان بزرگ ایران که به تیر نگاه رستم به چشم اسفندیار انجامید.",
        coverImage: "/images/covers/rostam-esfandiyar.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#b45309',
            secondaryColor: '#78350f',
            backgroundColor: '#0f0a09',
            textColor: '#fef3c7',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ROSTAM_ESFANDIYAR_CHAPTERS
    },

    // 18. EPIC: TAHMINEH (Hard)
    {
        id: 'tahmineh',
        genre: 'epic',
        title: "تهمینه",
        author: "فردوسی",
        description: "داستان عشق تهمینه و رستم در سمنگان و تولد سهراب از نگاه مادرش.",
        coverImage: "/images/covers/tahmineh.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#d946ef',
            secondaryColor: '#86198f',
            backgroundColor: '#0f0a11',
            textColor: '#fdf4ff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: TAHMINEH_CHAPTERS
    },

    // 19. EPIC: ZAL & SIMORGH (Medium)
    {
        id: 'zal_simorgh',
        genre: 'epic',
        title: "زال و سیمرغ",
        author: "فردوسی",
        description: "داستان زال سپیدمو که در کوه البرز رها شد و سیمرغ افسانه‌ای او را پرورش داد.",
        coverImage: "/images/covers/zal-simorgh.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#0ea5e9',
            secondaryColor: '#075985',
            backgroundColor: '#0a0f14',
            textColor: '#f0f9ff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ZAL_SIMORGH_CHAPTERS
    },

    // 20. EPIC: KAYKHOSROW (Hard)
    {
        id: 'kaykhosrow',
        genre: 'epic',
        title: "کیخسرو و کین سیاوش",
        author: "فردوسی",
        description: "کیخسرو برای انتقام خون پدرش سیاوش به جنگ افراسیاب رفت و او را در دریا غرق کرد.",
        coverImage: "/images/covers/kaykhosrow.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#dc2626',
            secondaryColor: '#991b1b',
            backgroundColor: '#0f0a0a',
            textColor: '#fef2f2',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: KAYKHOSROW_CHAPTERS
    },

    // 21. EPIC: ROSTAM'S DEATH (Hard)
    {
        id: 'rostam_death',
        genre: 'epic',
        title: "مرگ رستم",
        author: "فردوسی",
        description: "خیانت شغاد نابرادر رستم و مرگ غمناک بزرگ‌ترین پهلوان ایران در چاه نیزه.",
        coverImage: "/images/covers/rostam-death.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#4a4a4a',
            secondaryColor: '#1a1a1a',
            backgroundColor: '#0a0a0a',
            textColor: '#f5f5f5',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ROSTAM_DEATH_CHAPTERS
    },

    // 22. EPIC: ROSTAM & AKVAN DIV (Hard)
    {
        id: 'rostam_akvan',
        genre: 'epic',
        title: "رستم و اکوان دیو",
        author: "فردوسی",
        description: "نبرد رستم با دیو سرکش اکوان که رستم را به دریا انداخت و بازگشت پیروزمندانه رستم.",
        coverImage: "/images/covers/rostam-akvan.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#7c3aed',
            secondaryColor: '#4c1d95',
            backgroundColor: '#0e0a14',
            textColor: '#f5f3ff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ROSTAM_AKVAN_CHAPTERS
    },

    // 23. EPIC: HUSHANG (Easy)
    {
        id: 'hushang',
        genre: 'epic',
        title: "هوشنگ و کشف آتش",
        author: "اسطوره‌های ایران باستان",
        description: "هوشنگ پیشدادی، شاه دانایی که آتش را کشف کرد و جشن سده را پایه‌گذاری نمود.",
        coverImage: "/images/covers/hushang.jpg",
        difficulty: 'easy',
        style: {
            primaryColor: '#f97316',
            secondaryColor: '#9a3412',
            backgroundColor: '#0f0a08',
            textColor: '#fff7ed',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: HUSHANG_CHAPTERS
    },

    // 24. EPIC: JAMSHID (Medium)
    {
        id: 'jamshid',
        genre: 'epic',
        title: "جمشید و عصر طلایی",
        author: "اسطوره‌های ایران باستان",
        description: "شکوه جمشید، ساخت تخت جمشید، عصر طلایی ایران و سقوط از فر ایزدی بر اثر غرور.",
        coverImage: "/images/covers/jamshid.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#eab308',
            secondaryColor: '#854d0e',
            backgroundColor: '#0f0e08',
            textColor: '#fefce8',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: JAMSHID_CHAPTERS
    },

    // 25. HISTORY: ANUSHIRVAN (Easy)
    {
        id: 'anushirvan',
        genre: 'history',
        title: "انوشیروان دادگر",
        author: "تاریخ ایران باستان",
        description: "خسرو انوشیروان، دادگرترین شاه ساسانی، وزیرش بزرگمهر، پیروزی بر روم و ایوان مدائن.",
        coverImage: "/images/covers/anushirvan.jpg",
        difficulty: 'easy',
        style: {
            primaryColor: '#06b6d4',
            secondaryColor: '#155e75',
            backgroundColor: '#0a0f12',
            textColor: '#ecfeff',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ANUSHIRVAN_CHAPTERS
    },

    // 26. HISTORY: MEDES (Easy)
    {
        id: 'medes',
        genre: 'history',
        title: "مادها",
        author: "تاریخ ایران باستان",
        description: "از دیاکو تا آستیاگ، نخستین شهریاران آریایی در هگمتانه و بنیان‌گذاران اولین امپراتوری ایران.",
        coverImage: "/images/covers/medes.jpg",
        difficulty: 'easy',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: MEDES_CHAPTERS
    },

    // 27. HISTORY: ACHAEMENIDS (Hard)
    {
        id: 'achaemenids',
        genre: 'history',
        title: "هخامنشیان",
        author: "تاریخ ایران باستان",
        description: "از کوروش بزرگ تا داریوش و خشایارشا، بزرگترین امپراتوری جهان باستان و شکوه تخت جمشید.",
        coverImage: "/images/covers/achaemenids.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ACHAEMENIDS_CHAPTERS
    },

    // 28. HISTORY: PARTHIANS (Medium)
    {
        id: 'parthians',
        genre: 'history',
        title: "اشکانیان",
        author: "تاریخ ایران باستان",
        description: "از شورش ارشک علیه سلوکیان تا شکست روم در حران و پایان کار اشکانیان.",
        coverImage: "/images/covers/parthians.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: PARTHIANS_CHAPTERS
    },

    // 29. HISTORY: SASSANIDS (Hard)
    {
        id: 'sassanids',
        genre: 'history',
        title: "ساسانیان",
        author: "تاریخ ایران باستان",
        description: "از اردشیر بابکان تا شاپور و انوشیروان، شکوه ایرانشهر و تمدن درخشان ساسانی.",
        coverImage: "/images/covers/sassanids.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SASSANIDS_CHAPTERS
    },

    // 30. HISTORY: SELJUKS (Medium)
    {
        id: 'seljuks',
        genre: 'history',
        title: "سلجوقیان",
        author: "تاریخ ایران میانه",
        description: "از ورود طغرل به ایران تا نبرد ملازگرد و حکومت خواجه نظام‌الملک، عصر زرین ادب فارسی.",
        coverImage: "/images/covers/seljuks.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SELJUKS_CHAPTERS
    },

    // 31. HISTORY: SAFAVIDS (Hard)
    {
        id: 'safavids',
        genre: 'history',
        title: "صفویان",
        author: "تاریخ ایران مدرن",
        description: "از شاه اسماعیل و شیخ صفی تا شاه عباس و اصفهان، ایران یکپارچه و شکوه نصف جهان.",
        coverImage: "/images/covers/safavids.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SAFAVIDS_CHAPTERS
    },

    // 32. HISTORY: QAJARS (Medium)
    {
        id: 'qajars',
        genre: 'history',
        title: "قاجار",
        author: "تاریخ ایران معاصر",
        description: "از آغا محمدخان تا انقلاب مشروطه، تهران پایتخت می‌شود و ایران وارد عصر مدرن.",
        coverImage: "/images/covers/qajars.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#14b8a6',
            secondaryColor: '#0f766e',
            backgroundColor: '#0a0f0e',
            textColor: '#f0fdfa',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: QAJARS_CHAPTERS
    },

    // 33. HISTORY: MOSSADEGH (Medium)
    {
        id: 'mosaddegh',
        genre: 'history',
        title: "مصدق و نفت",
        author: "تاریخ معاصر",
        description: "نهضت ملی شدن نفت ایران به رهبری دکتر مصدق، از تصویب قانون ملی شدن تا کودتای ۲۸ مرداد و میراث ماندگارش.",
        coverImage: "/images/covers/mosaddegh.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#10b981',
            secondaryColor: '#065f46',
            backgroundColor: '#0a0f0c',
            textColor: '#ecfdf5',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: MOSADEGH_CHAPTERS
    },

    // 34. HISTORY: PERSEPOLIS & ANCIENT NOWRUZ (Easy)
    {
        id: 'persepolis',
        genre: 'history',
        title: "تخت جمشید و نوروز باستان",
        author: "تاریخ ایران باستان",
        description: "سفر به قلب پارسه؛ از تراشیدن صخره‌های کوه رحمت و ساخت تالار آپادانا و کاخ صدستون تا شکوه جشن نوروز در تخت جمشید.",
        coverImage: "/images/covers/persepolis.jpg",
        difficulty: 'easy',
        style: {
            primaryColor: '#d97706',
            secondaryColor: '#92400e',
            backgroundColor: '#14100a',
            textColor: '#fef3c7',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: PERSEPOLIS_CHAPTERS
    },

    // 35. HISTORY: SILK ROAD & CARAVANS (Easy)
    {
        id: 'silk_road',
        genre: 'history',
        title: "جادهٔ ابریشم و کاروان‌ها",
        author: "تاریخ تمدن ایران",
        description: "همسفر با کاروان‌های ابریشم و ادویه از سمرقند و نیشابور تا ری و تیسفون؛ کاروانسراهای کویر، چاپارخانه‌ها و پیوند تمدن‌های شرق و غرب.",
        coverImage: "/images/covers/silk-road.jpg",
        difficulty: 'easy',
        style: {
            primaryColor: '#0284c7',
            secondaryColor: '#075985',
            backgroundColor: '#0a1017',
            textColor: '#e0f2fe',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: SILK_ROAD_CHAPTERS
    },

    // 36. HISTORY: DARIUS THE GREAT & BEHISTUN (Medium)
    {
        id: 'dariush',
        genre: 'history',
        title: "داریوش بزرگ و کتیبهٔ بیستون",
        author: "تاریخ ایران باستان",
        description: "کارنامهٔ داریوش بزرگ هخامنشی؛ از سرکوب شورش گئومات و حک سنگ‌نبشتهٔ بیستون تا ضرب سکهٔ دریک، راه شاهی و حفر آبراه نیل و دریای سرخ.",
        coverImage: "/images/covers/dariush.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#eab308',
            secondaryColor: '#854d0e',
            backgroundColor: '#121008',
            textColor: '#fef9c3',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: DARIUSH_CHAPTERS
    },

    // 37. HISTORY: YAQUB LAITH SAFFARI (Medium)
    {
        id: 'yaqub_laith',
        genre: 'history',
        title: "یعقوب لیث و احیای زبان فارسی",
        author: "تاریخ ایران میانه",
        description: "خیزش رویگرزادهٔ جوانمرد سیستان؛ اتحاد عیاران، استقلال ایران و فرمان تاریخی «چیزی که من اندر نیابم، چرا باید گفت؟» برای زنده‌داشت زبان فارسی.",
        coverImage: "/images/covers/yaqub-laith.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#ea580c',
            secondaryColor: '#9a3412',
            backgroundColor: '#140c08',
            textColor: '#ffedd5',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: YAQUB_CHAPTERS
    },

    // 38. HISTORY: KARIM KHAN ZAND (Medium)
    {
        id: 'zandiyeh',
        genre: 'history',
        title: "کریم‌خان زند و وکیل‌الرعایا",
        author: "تاریخ ایران",
        description: "فرمانروایی که لقب «وکیل‌الرعایا» را بر شاهی برگزید؛ آرامش و آبادانی شیراز با ارگ، بازار و حمام وکیل تا حماسهٔ لطفعلی‌خان زند.",
        coverImage: "/images/covers/zandiyeh.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#0d9488',
            secondaryColor: '#115e59',
            backgroundColor: '#091413',
            textColor: '#ccfbf1',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: ZANDIYEH_CHAPTERS
    },

    // 39. HISTORY: AMIR KABIR & DAR UL-FUNUN (Medium)
    {
        id: 'amir_kabir',
        genre: 'history',
        title: "امیرکبیر و دارالفنون",
        author: "تاریخ معاصر",
        description: "زندگی و اصلاحات میرزا تقی‌خان امیرکبیر؛ از مبارزه با رشوه و بنیان‌گذاری دارالفنون تا انتشار روزنامهٔ وقایع اتفاقیه، مایه‌کوبی آبله و حمام فین کاشان.",
        coverImage: "/images/covers/amir-kabir.jpg",
        difficulty: 'medium',
        style: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
            backgroundColor: '#090d16',
            textColor: '#dbeafe',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: AMIR_KABIR_CHAPTERS
    },

    // 40. HISTORY: NADER SHAH AFSHAR (Hard)
    {
        id: 'nadershah',
        genre: 'history',
        title: "نادرشاه افشار (شمشیر ایران)",
        author: "تاریخ ایران",
        description: "تندباد شرق؛ برخاستن نادرقلی از درگز و کلات، آزادی اصفهان، بیرون راندن عثمانی و روسیه، تاج‌گذاری در دشت مغان و فتح قندهار و کرنال.",
        coverImage: "/images/covers/nadershah.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#dc2626',
            secondaryColor: '#991b1b',
            backgroundColor: '#140909',
            textColor: '#fee2e2',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: NADERSHAH_CHAPTERS
    },

    // 41. HISTORY: CONSTITUTIONAL REVOLUTION & SATTAR KHAN (Hard)
    {
        id: 'mashruteh',
        genre: 'history',
        title: "مشروطه و ستارخان (سردار ملی)",
        author: "تاریخ معاصر",
        description: "انقلاب مشروطهٔ ایران؛ از عدالت‌خانه و گشایش مجلس بهارستان تا به توپ بستن مجلس، مقاومت یازده‌ماههٔ تبریز به رهبری ستارخان و باقرخان و فتح تهران.",
        coverImage: "/images/covers/mashruteh.jpg",
        difficulty: 'hard',
        style: {
            primaryColor: '#16a34a',
            secondaryColor: '#166534',
            backgroundColor: '#09140c',
            textColor: '#dcfce7',
            fontFamily: 'serif',
            backgroundImagePattern: "https://www.transparenttextures.com/patterns/aged-paper.png"
        },
        chapters: MASHRUTEH_CHAPTERS
    }
];