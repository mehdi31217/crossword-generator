import { DictionaryEntry, ShahnamehChapter } from "../../types";

const NANEH_CHAPTER_1: DictionaryEntry[] = [
  { word: "دوست", clue: "همدم صمیمی" },
  { word: "سفر", clue: "رفتن به جای دور" },
  { word: "راه", clue: "مسیری برای رفتن" },
  { word: "نان", clue: "خوراکی از آرد و آب" },
  { word: "نمک", clue: "چاشنی سفید شور" },
  { word: "سفره", clue: "پارچه‌ای که غذا رویش می‌گذارند" },
  { word: "گرسنه", clue: "کسی که شکمش خالی است" },
  { word: "تقسیم", clue: "قسمت کردن بین چند نفر" },
  { word: "همراه", clue: "کسی که با تو می‌آید" },
  { word: "صبح", clue: "اول روز" },
];

const NANEH_CHAPTER_2: DictionaryEntry[] = [
  { word: "کوه", clue: "بلندی بزرگ از سنگ" },
  { word: "باران", clue: "آب ریخته از ابر" },
  { word: "سرد", clue: "دمای پایین" },
  { word: "پناه", clue: "جایی که از خطر در امان می‌مانی" },
  { word: "غار", clue: "حفره در دل کوه" },
  { word: "آتش", clue: "شعله‌ای که می‌سوزاند" },
  { word: "شب", clue: "وقتی هوا تاریک می‌شود" },
  { word: "انتظار", clue: "چشم‌به‌راه بودن" },
  { word: "صبر", clue: "شکیبایی در سختی" },
  { word: "امید", clue: "انتظار خوبی" },
];

const NANEH_CHAPTER_3: DictionaryEntry[] = [
  { word: "ده", clue: "روستای کوچک" },
  { word: "خانه", clue: "جای زندگی" },
  { word: "مهمان", clue: "کسی که به خانه دعوت می‌شود" },
  { word: "مهربان", clue: "خوش‌رفتار با دیگران" },
  { word: "وفادار", clue: "پایبند به عهد" },
  { word: "یادگار", clue: "چیزی که از کسی می‌ماند" },
  { word: "دوستی", clue: "رابطهٔ صمیمی" },
  { word: "همیشه", clue: "در همهٔ زمان‌ها" },
  { word: "شکر", clue: "سپاسگزاری" },
  { word: "پایان", clue: "آخر هر داستان" },
];

export const NANEH_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "نان و نمک",
    description: "دو دوست صبح زود برای سفر آماده شدند. توشه‌شان فقط یک نان و کمی نمک بود. سر راه نشستند، سفره را باز کردند و نان را با هم تقسیم کردند. هیچ‌کدام نمی‌خواست سهم بیشتری بردارد. آن‌ها قول دادند هر جا گرسنه شدند، اول به همسفرشان فکر کنند.",
    image: "/images/folktales/naneh/ch1.jpg",
    victoryText: "نان و نمک ساده، پیوندی محکم بین دو دوست ساخت. آن‌ها با لبخند راه را ادامه دادند.",
    words: NANEH_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/naneh/ch1-monster.jpg",
    monsterName: "نان و نمک",
  },
  {
    id: 2,
    title: "شب در کوه",
    description: "در راه از کوه گذشتند و ناگهان باران گرفت. هوا سرد شد و شب همه‌جا را تاریک کرد. یک غار پیدا کردند و به آن پناه بردند. آتش کوچکی روشن کردند و منتظر ماندند. صبر و امید، دو یار آن شبشان بود.",
    image: "/images/folktales/naneh/ch1.jpg",
    victoryText: "آتش گرمشان کرد و باران آرام شد. وقتی صبح آمد، دوباره راه را ادامه دادند.",
    words: NANEH_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/naneh/ch1-monster.jpg",
    monsterName: "نان و نمک",
  },
  {
    id: 3,
    title: "خانهٔ مهربانی",
    description: "بالاخره به دهی رسیدند. پیرزنی آن‌ها را به خانه دعوت کرد و سفرهٔ گرمی پهن کرد. دو دوست از او تشکر کردند و نانشان را با او تقسیم کردند. آن‌ها فهمیدند که دوستی واقعی مثل نان و نمک ساده است، اما همیشه می‌ماند. و همین یادگار سفرشان شد.",
    image: "/images/folktales/naneh/ch1.jpg",
    victoryText: "دوستی آن‌ها وفادار ماند و قصه‌شان با سفرهٔ مهربانی پایان یافت. نان و نمک، نشانهٔ دوستی همیشگی شد.",
    words: NANEH_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/naneh/ch1-monster.jpg",
    monsterName: "نان و نمک",
  },
];
