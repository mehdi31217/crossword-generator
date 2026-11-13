import { DictionaryEntry, ShahnamehChapter } from "../../types";

const SHAB_CHAPTER_1: DictionaryEntry[] = [
  { word: "شب", clue: "وقتی هوا تاریک می‌شود" },
  { word: "ماه", clue: "نور گرد آسمان تاریک" },
  { word: "ستاره", clue: "نقطهٔ نورانی آسمان" },
  { word: "آسمان", clue: "بالای سر ما" },
  { word: "نور", clue: "روشنایی" },
  { word: "ابر", clue: "تودهٔ سفید در آسمان" },
  { word: "خواب", clue: "حالت استراحت با چشم بسته" },
  { word: "رویا", clue: "آنچه در خواب می‌بینیم" },
  { word: "آرام", clue: "بی‌صدا و راحت" },
  { word: "مادر", clue: "زنی که از فرزندش نگهداری می‌کند" },
];

const SHAB_CHAPTER_2: DictionaryEntry[] = [
  { word: "پرنده", clue: "جانور بالدار" },
  { word: "بال", clue: "عضو پرواز" },
  { word: "پرواز", clue: "حرکت در هوا" },
  { word: "سفر", clue: "رفتن به جای دور" },
  { word: "بهار", clue: "فصل شکوفه‌ها" },
  { word: "لانه", clue: "خانهٔ پرنده" },
  { word: "جنگل", clue: "جای پر از درخت" },
  { word: "آواز", clue: "صدای خوش" },
  { word: "دوست", clue: "همدم صمیمی" },
  { word: "برگ", clue: "بخش سبز گیاه" },
];

const SHAB_CHAPTER_3: DictionaryEntry[] = [
  { word: "گل", clue: "گیاه خوشبو و رنگارنگ" },
  { word: "باغ", clue: "جای پر از درخت و گیاه" },
  { word: "آب", clue: "مایهٔ حیات" },
  { word: "عطر", clue: "بوی خوش" },
  { word: "رنگ", clue: "آنچه چشم از نور می‌بیند" },
  { word: "پروانه", clue: "حشرهٔ بال‌دار رنگارنگ" },
  { word: "خورشید", clue: "ستارهٔ روشنایی زمین" },
  { word: "صبح", clue: "اول روز" },
  { word: "شادی", clue: "حس خوشی" },
  { word: "قصه", clue: "داستان" },
];

export const SHAB_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "ماه و ستاره",
    description: "شب شد و مادر کنار تخت بچه‌ها نشست. ماه از پشت ابرها بیرون آمد و ستاره‌ها یکی‌یکی در آسمان روشن شدند. نور نرم ماه روی بالش افتاد. مادر قصهٔ ماه را تعریف کرد و بچه‌ها آرام چشم‌هایشان را بستند تا رویا ببینند.",
    image: "/images/folktales/shab/ch1.jpg",
    victoryText: "آن شب خواب بچه‌ها پر از ماه و ستاره بود. مادر چراغ را کم کرد و آرام از اتاق بیرون رفت.",
    words: SHAB_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/shab/ch1-monster.jpg",
    monsterName: "شب‌های شیرین",
  },
  {
    id: 2,
    title: "پرندهٔ مهاجر",
    description: "مادر قصهٔ پرنده‌ای را گفت که هر بهار به جنگل برمی‌گشت. پرنده با بال‌هایش پرواز می‌کرد، بالای درخت‌ها می‌چرخید و در لانه‌اش آواز می‌خواند. در سفرش با پرنده‌های دیگر دوست شد و از هر جا برگ سبزی برای لانه‌اش آورد.",
    image: "/images/folktales/shab/ch1.jpg",
    victoryText: "بچه‌ها با شنیدن قصه، خودشان را روی بال پرنده تصور کردند و لبخند زدند.",
    words: SHAB_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/shab/ch1-monster.jpg",
    monsterName: "شب‌های شیرین",
  },
  {
    id: 3,
    title: "باغِ صبح",
    description: "آخرین قصه دربارهٔ باغی بود که صبح‌ها بوی عطر گل‌هایش همه‌جا می‌رفت. آب از جوی کوچک رد می‌شد و پروانه‌های رنگارنگ روی گل‌ها می‌نشستند. خورشید که بالا می‌آمد، باغ پر از رنگ و شادی می‌شد. مادر گفت: «فردا صبح با هم به باغ می‌رویم.»",
    image: "/images/folktales/shab/ch1.jpg",
    victoryText: "بچه‌ها با لبخند خوابیدند و خواب دیدند که در باغ می‌دوند. شب‌های شیرین همین‌طور تمام شد.",
    words: SHAB_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/shab/ch1-monster.jpg",
    monsterName: "شب‌های شیرین",
  },
];
