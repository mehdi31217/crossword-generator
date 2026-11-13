import { DictionaryEntry, ShahnamehChapter } from "../../types";

const GONJESHK_CHAPTER_1: DictionaryEntry[] = [
  { word: "گنجشک", clue: "پرندهٔ کوچک قهوه‌ای" },
  { word: "بام", clue: "بالای خانه" },
  { word: "لانه", clue: "خانهٔ پرنده" },
  { word: "دانه", clue: "خوراک ریز پرنده" },
  { word: "بال", clue: "بخشی از بدن پرنده برای پرواز" },
  { word: "پرواز", clue: "حرکت در آسمان با بال" },
  { word: "آسمان", clue: "بالای سر ما که آبی است" },
  { word: "جوجه", clue: "بچهٔ پرنده" },
  { word: "کوچک", clue: "اندازهٔ کم" },
  { word: "شادی", clue: "حس خوشی" },
];

const GONJESHK_CHAPTER_2: DictionaryEntry[] = [
  { word: "سکه", clue: "پول فلزی گرد" },
  { word: "گنج", clue: "چیز باارزش پنهان‌شده" },
  { word: "باغ", clue: "جای پر از درخت و گل" },
  { word: "پیدا", clue: "از پنهان به آشکار آمدن" },
  { word: "خرید", clue: "چیزی را با پول گرفتن" },
  { word: "پول", clue: "وسیلهٔ خرید و فروش" },
  { word: "کیف", clue: "وسیله‌ای برای نگهداری پول و وسایل" },
  { word: "براق", clue: "درخشان و تابان" },
  { word: "خاک", clue: "زمین نرم" },
  { word: "خوشحال", clue: "شاد و راضی" },
];

const GONJESHK_CHAPTER_3: DictionaryEntry[] = [
  { word: "گربه", clue: "حیوان خانگی که میومیو می‌کند" },
  { word: "خطر", clue: "چیزی که ممکن است آسیب برساند" },
  { word: "هشدار", clue: "اطلاع دادن دربارهٔ خطر" },
  { word: "فرار", clue: "دور شدن سریع از خطر" },
  { word: "امن", clue: "بی‌خطر و آرام" },
  { word: "دوست", clue: "کسی که با او صمیمی هستی" },
  { word: "کمک", clue: "یاری رساندن" },
  { word: "شکر", clue: "سپاسگزاری" },
  { word: "دوباره", clue: "یک بار دیگر" },
  { word: "پایان", clue: "آخر هر داستان" },
];

export const GONJESHK_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "دو گنجشک روی بام",
    description: "اشی و مشی دو گنجشک کوچک بودند که روی بام خانه‌ای لانه داشتند. صبح‌ها با هم پرواز می‌کردند، در آسمان می‌چرخیدند و دانه جمع می‌کردند. جوجه‌هایشان در لانه می‌ماندند و منتظر غذا بودند.",
    image: "/images/folktales/gonjeshk/ch1.jpg",
    victoryText: "آن روز آفتاب خوبی بود و دو گنجشک با شکم پر به لانه برگشتند. شادی در بام خانه پیچیده بود.",
    words: GONJESHK_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/gonjeshk/ch1-monster.jpg",
    monsterName: "گربه",
  },
  {
    id: 2,
    title: "سکهٔ براق",
    description: "در باغ همسایه، اشی چیز براقی روی خاک دید. یک سکه بود! کیف کوچکش را باز کرد و سکه را گذاشت. با هم رفتند و برای لانه چیزهای تازه خریدند. مشی گفت: «چه گنجی پیدا کردیم!» و هر دو خوشحال شدند.",
    image: "/images/folktales/gonjeshk/ch1.jpg",
    victoryText: "لانهٔ تازه‌شان گرم و نرم شد. اما در گوشهٔ باغ، دو چشم زرد به آن‌ها نگاه می‌کرد...",
    words: GONJESHK_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/gonjeshk/ch1-monster.jpg",
    monsterName: "گربه",
  },
  {
    id: 3,
    title: "هشدار اشی",
    description: "گربهٔ همسایه آرام به لانه نزدیک شد. اشی او را دید و بلند هشدار داد. دو گنجشک با هم از لانه بیرون پریدند و به شاخهٔ بلندی رفتند. گربه دستش به آن‌ها نرسید و رفت. اشی و مشی از کمک هم تشکر کردند و فهمیدند که دوستی، بهترین گنج است.",
    image: "/images/folktales/gonjeshk/ch1.jpg",
    victoryText: "دو گنجشک دوباره کنار هم نشستند و با خیال راحت آواز خواندند. لانه‌شان امن بود و قصه‌شان تمام شد.",
    words: GONJESHK_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/gonjeshk/ch1-monster.jpg",
    monsterName: "گربه",
  },
];
