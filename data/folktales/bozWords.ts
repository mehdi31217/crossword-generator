import { DictionaryEntry, ShahnamehChapter } from "../../types";

const BOZ_CHAPTER_1: DictionaryEntry[] = [
  { word: "بز", clue: "حیوان شاخدار شیرده" },
  { word: "مادر", clue: "بزی که همراه بچه‌اش زندگی می‌کرد" },
  { word: "دشت", clue: "زمین صاف و سبز" },
  { word: "علف", clue: "غذای سبز حیوان در دشت" },
  { word: "چشمه", clue: "جایی که آب از زمین می‌جوشد" },
  { word: "شیر", clue: "نوشیدنی سفیدی که از بز می‌گیرند" },
  { word: "شاخ", clue: "بخش نوک‌تیز روی سر بز" },
  { word: "سم", clue: "پای سخت بز" },
  { word: "سفید", clue: "رنگ پشم این بز" },
  { word: "چرا", clue: "خوردن علف در دشت" },
];

const BOZ_CHAPTER_2: DictionaryEntry[] = [
  { word: "گرگ", clue: "حیوان وحشی خاکستری" },
  { word: "ترس", clue: "حسی که در دل می‌افتد" },
  { word: "دویدن", clue: "حرکت سریع با پا" },
  { word: "کوه", clue: "بلندی بزرگ از سنگ" },
  { word: "غار", clue: "حفرهٔ بزرگ در دل کوه" },
  { word: "پناه", clue: "جایی که از خطر در امان می‌مانی" },
  { word: "شجاع", clue: "کسی که از خطر نمی‌ترسد" },
  { word: "سنگ", clue: "تکهٔ سخت کوه" },
  { word: "بالا", clue: "سمتی رو به آسمان" },
  { word: "نفس", clue: "هوایی که به ریه می‌رود" },
];

const BOZ_CHAPTER_3: DictionaryEntry[] = [
  { word: "چوپان", clue: "کسی که از گله نگهداری می‌کند" },
  { word: "چوب", clue: "شاخهٔ خشک و بلند" },
  { word: "سگ", clue: "حیوان وفادار نگهبان گله" },
  { word: "نجات", clue: "رهایی از خطر" },
  { word: "شکر", clue: "سپاسگزاری" },
  { word: "آغوش", clue: "حلقهٔ دست‌ها برای در بر گرفتن" },
  { word: "قول", clue: "عهدی که می‌دهیم" },
  { word: "خانه", clue: "جایی که زندگی می‌کنیم" },
  { word: "صلح", clue: "آرامش و بی‌جنگی" },
  { word: "دوباره", clue: "یک بار دیگر" },
];

export const BOZ_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "بزغالهٔ سفید",
    description: "بزبز قندی بزغاله‌ای سفید و شیرین بود که با مادرش در دشت زندگی می‌کرد. صبح‌ها با هم به چرا می‌رفتند، از چشمه آب می‌نوشیدند و علف تازه می‌خوردند. شاخ‌های کوچکش تازه درآمده بود و سم‌هایش روی سنگ‌ها محکم می‌ایستاد.",
    image: "/images/folktales/boz/ch1.jpg",
    victoryText: "مادر گفت: «من به بازار می‌روم. در خانه بمان و مراقب خودت باش.» بزبز قندی سرش را بالا گرفت و گفت: «نترس!»",
    words: BOZ_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/boz/ch1-monster.jpg",
    monsterName: "گرگ",
  },
  {
    id: 2,
    title: "گرگ از راه رسید",
    description: "گرگ گرسنه از پشت سنگ‌ها بیرون آمد. بزبز قندی اول ترسید، اما یادش آمد که باید شجاع باشد. تیز دوید و از کوه بالا رفت. گرگ دنبالش کرد. بز روی صخره ایستاد، نفسش تند می‌زد و شاخ‌هایش را رو به جلو گرفت.",
    image: "/images/folktales/boz/ch1.jpg",
    victoryText: "گرگ نزدیک‌تر می‌شد و بز پشت سنگی پناه گرفت. صدای مادر از دور شنیده می‌شد...",
    words: BOZ_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/boz/ch1-monster.jpg",
    monsterName: "گرگ",
  },
  {
    id: 3,
    title: "صدای چوپان",
    description: "چوپان صدای بز را شنید و با چوب و سگش به کمک آمد. گرگ تا سگ را دید فرار کرد. چوپان بزبز قندی را نجات داد و به آغوش مادرش برگرداند. بز قول داد دیگر تنها به کوه نرود. آن شب همه در خانه بودند و صلح و آرامش بر دشت برگشت.",
    image: "/images/folktales/boz/ch1.jpg",
    victoryText: "بزبز قندی از چوپان تشکر کرد و فهمید که شجاعت خوب است، اما کمک گرفتن از دیگران هم لازم است.",
    words: BOZ_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/boz/ch1-monster.jpg",
    monsterName: "گرگ",
  },
];
