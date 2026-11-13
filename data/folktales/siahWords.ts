import { DictionaryEntry, ShahnamehChapter } from "../../types";

const SIAH_CHAPTER_1: DictionaryEntry[] = [
  { word: "مرد", clue: "انسان بالغ" },
  { word: "شهر", clue: "جای بزرگ با خانه‌های زیاد" },
  { word: "بازار", clue: "جای خرید و فروش" },
  { word: "نان", clue: "خوراکی از آرد و آب" },
  { word: "پول", clue: "وسیلهٔ خرید" },
  { word: "فقیر", clue: "کسی که پول کافی ندارد" },
  { word: "مهربان", clue: "خوش‌رفتار با دیگران" },
  { word: "کمک", clue: "یاری رساندن" },
  { word: "غریبه", clue: "کسی که آشنا نیست" },
  { word: "تن", clue: "بدن" },
];

const SIAH_CHAPTER_2: DictionaryEntry[] = [
  { word: "ظاهر", clue: "آنچه از بیرون دیده می‌شود" },
  { word: "ترس", clue: "حس نگرانی از خطر" },
  { word: "مردم", clue: "همهٔ انسان‌ها" },
  { word: "حرف", clue: "سخن" },
  { word: "دور", clue: "فاصلهٔ زیاد" },
  { word: "تنها", clue: "بی‌همراه" },
  { word: "دل", clue: "قلب" },
  { word: "خوبی", clue: "کار نیک" },
  { word: "بخشش", clue: "بدون منت دادن" },
  { word: "لبخند", clue: "حالت خوشایند صورت" },
];

const SIAH_CHAPTER_3: DictionaryEntry[] = [
  { word: "قحطی", clue: "کمبود شدید غذا" },
  { word: "گرسنه", clue: "کسی که شکمش خالی است" },
  { word: "تقسیم", clue: "قسمت کردن بین چند نفر" },
  { word: "انبار", clue: "جای نگهداری کالا" },
  { word: "گندم", clue: "دانه‌ای که از آن آرد می‌سازند" },
  { word: "آرد", clue: "پودر سفید گندم" },
  { word: "نانوا", clue: "کسی که نان می‌پزد" },
  { word: "دعا", clue: "خواستن چیزی از خدا" },
  { word: "پاداش", clue: "جبران خوبی" },
  { word: "دوست", clue: "کسی که با او صمیمی هستی" },
];

export const SIAH_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "مردی در بازار",
    description: "در شهری قدیمی مردی زندگی می‌کرد که از سرزمینی دور آمده بود. هر روز به بازار می‌رفت و برای فقیرها نان می‌خرید. پول کمی داشت، اما همان را هم با کسانی تقسیم می‌کرد که تنشان به او نمی‌خورد. مردم از دور نگاهش می‌کردند.",
    image: "/images/folktales/siah/ch1.jpg",
    victoryText: "آن روز هم با لبخند نانی به دست پیرمردی داد و رفت. کار خوب، برای او عادت بود نه نمایش.",
    words: SIAH_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/siah/ch1-monster.jpg",
    monsterName: "سیاه‌زنگی",
  },
  {
    id: 2,
    title: "قلبِ پنهان",
    description: "مردم به خاطر ظاهر متفاوتش از او دور می‌شدند و پشت سرش حرف می‌زدند. او خیلی تنها بود، اما دلش پر از خوبی بود. هیچ‌وقت جواب بدی را با بدی نمی‌داد و همیشه با لبخند از کنارشان می‌گذشت. بخشش، زبان او بود.",
    image: "/images/folktales/siah/ch1.jpg",
    victoryText: "کم‌کم چند نفر فهمیدند که مهربانی او واقعی است. آوازهٔ خوبی‌اش در شهر پیچید.",
    words: SIAH_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/siah/ch1-monster.jpg",
    monsterName: "سیاه‌زنگی",
  },
  {
    id: 3,
    title: "سالِ قحطی",
    description: "آن سال قحطی آمد و گندم کم شد. مرد همهٔ آرد انبارش را به نانوا داد و نان تازه بین گرسنه‌ها تقسیم کرد. وقتی مردم دیدند او همه‌چیزش را بخشیده، شرمنده شدند. از آن روز او را دوست خود خواندند و برایش دعا کردند. خوبی او پاداشش را گرفت.",
    image: "/images/folktales/siah/ch1.jpg",
    victoryText: "شهر از قحطی گذشت و همه فهمیدند که ظاهر مهم نیست؛ قلب مهربان است که ارزش دارد.",
    words: SIAH_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/siah/ch1-monster.jpg",
    monsterName: "سیاه‌زنگی",
  },
];
