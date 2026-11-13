import { DictionaryEntry, ShahnamehChapter } from "../../types";

const GORBEH_CHAPTER_1: DictionaryEntry[] = [
  { word: "گربه", clue: "حیوان خانگی میومیوکن" },
  { word: "روستا", clue: "جای کوچک بیرون شهر" },
  { word: "حیاط", clue: "محوطهٔ باز خانه" },
  { word: "آفتاب", clue: "نور خورشید" },
  { word: "چرت", clue: "خواب کوتاه" },
  { word: "پشم", clue: "موی نرم حیوان" },
  { word: "زرنگ", clue: "باهوش و تیز" },
  { word: "ناقلا", clue: "زرنگ و بازیگوش" },
  { word: "شیر", clue: "نوشیدنی سفید" },
  { word: "خانه", clue: "جای زندگی" },
];

const GORBEH_CHAPTER_2: DictionaryEntry[] = [
  { word: "روباه", clue: "حیوان نارنجی حیله‌گر" },
  { word: "قفس", clue: "جای بسته برای نگهداری حیوان" },
  { word: "فریب", clue: "گول زدن" },
  { word: "فرار", clue: "دور شدن از خطر" },
  { word: "چاه", clue: "گودال عمیق" },
  { word: "دیوار", clue: "آنچه دور خانه می‌کشند" },
  { word: "چنگ", clue: "ناخن تیز" },
  { word: "ترس", clue: "حس نگرانی" },
  { word: "داد", clue: "فریاد بلند" },
  { word: "کمک", clue: "یاری رساندن" },
];

const GORBEH_CHAPTER_3: DictionaryEntry[] = [
  { word: "چوپان", clue: "نگهبان گله" },
  { word: "طناب", clue: "ریسمان ضخیم" },
  { word: "بالا", clue: "سمت آسمان" },
  { word: "نجات", clue: "رهایی از خطر" },
  { word: "تشکر", clue: "سپاسگزاری" },
  { word: "دوست", clue: "همدم صمیمی" },
  { word: "درس", clue: "آموزه" },
  { word: "دوباره", clue: "یک بار دیگر" },
  { word: "امن", clue: "بی‌خطر" },
  { word: "قصه", clue: "داستان" },
];

export const GORBEH_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "گربهٔ ناقلا",
    description: "در روستایی گربه‌ای زرنگ و بازیگوش زندگی می‌کرد که همه او را ناقلا صدا می‌زدند. صبح‌ها در حیاط زیر آفتاب چرت می‌زد و پشم‌هایش را گرم می‌کرد. ظهرها هم می‌رفت کنار خانهٔ همسایه و کاسهٔ شیر می‌خواست. هیچ‌کس به اندازهٔ او زرنگ نبود.",
    image: "/images/folktales/gorbeh/ch1.jpg",
    victoryText: "ناقلا با شکم پر روی دیوار حیاط نشست و به آفتاب نگاه کرد. روز خوبی بود، تا اینکه روباهی از راه رسید.",
    words: GORBEH_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/gorbeh/ch1-monster.jpg",
    monsterName: "روباه",
  },
  {
    id: 2,
    title: "قفس و چاه",
    description: "روباه با حرف‌های شیرین ناقلا را فریب داد و در قفس انداخت. اما ناقلا با چنگ‌هایش قفل را باز کرد و فرار کرد. روباه دنبالش کرد. گربه از دیوار بالا رفت، اما پایین افتاد و در چاه عمیقی گرفتار شد. از ترس بلند داد زد و کمک خواست.",
    image: "/images/folktales/gorbeh/ch1.jpg",
    victoryText: "ناقلا در ته چاه منتظر ماند. صدایش از دیوارهای سرد بالا رفت... کسی می‌آمد؟",
    words: GORBEH_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/gorbeh/ch1-monster.jpg",
    monsterName: "روباه",
  },
  {
    id: 3,
    title: "طنابِ چوپان",
    description: "چوپانی که گله‌اش را می‌برد، صدای گربه را شنید. طنابش را پایین انداخت و ناقلا با چنگ‌هایش از آن بالا آمد. گربه از چوپان تشکر کرد و آن دو دوست شدند. ناقلا درس گرفت که زرنگی بدون احتیاط کافی نیست. از آن روز، آرام و امن در حیاط زندگی کرد.",
    image: "/images/folktales/gorbeh/ch1.jpg",
    victoryText: "چوپان گربه را نجات داد و ناقلا فهمید که کمک گرفتن عیب نیست. قصهٔ او در روستا ماند.",
    words: GORBEH_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/gorbeh/ch1-monster.jpg",
    monsterName: "روباه",
  },
];
