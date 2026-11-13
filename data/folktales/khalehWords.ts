import { DictionaryEntry, ShahnamehChapter } from "../../types";

const KHALEH_CHAPTER_1: DictionaryEntry[] = [
  { word: "خاله", clue: "خطاب مهربان به زنی در خانواده" },
  { word: "سوسکه", clue: "حشرهٔ ریز قهوه‌ای آشپزخانه" },
  { word: "خانه", clue: "جایی که زندگی می‌کنیم" },
  { word: "تنها", clue: "بی‌همراه" },
  { word: "جارو", clue: "وسیلهٔ تمیز کردن زمین" },
  { word: "کوزه", clue: "ظرف سفالی برای آب" },
  { word: "چای", clue: "نوشیدنی گرم" },
  { word: "سفره", clue: "پارچه‌ای که غذا رویش می‌گذارند" },
  { word: "گوشه", clue: "کنارهٔ یک جا" },
  { word: "مهربان", clue: "خوش‌رفتار با دیگران" },
];

const KHALEH_CHAPTER_2: DictionaryEntry[] = [
  { word: "داماد", clue: "مردی که در جشن ازدواج کنار عروس می‌ایستد" },
  { word: "موش", clue: "حیوان کوچک خاکستری" },
  { word: "گربه", clue: "حیوان خانگی میومیوکن" },
  { word: "سگ", clue: "حیوان وفادار" },
  { word: "خروس", clue: "پرندهٔ صبح‌خوان" },
  { word: "کبوتر", clue: "پرندهٔ سفید و مهربان" },
  { word: "در", clue: "ورودی خانه" },
  { word: "سلام", clue: "واژهٔ آغازین برای احوال‌پرسی" },
  { word: "عیب", clue: "نقص و کمبود" },
  { word: "انتخاب", clue: "برگزیدن یکی از چند چیز" },
];

const KHALEH_CHAPTER_3: DictionaryEntry[] = [
  { word: "عروسی", clue: "جشن ازدواج" },
  { word: "لباس", clue: "چیزی که به تن می‌پوشیم" },
  { word: "سفید", clue: "رنگ روشن مثل برف" },
  { word: "آینه", clue: "سطحی که تصویر را نشان می‌دهد" },
  { word: "شانه", clue: "وسیلهٔ مرتب کردن مو" },
  { word: "آواز", clue: "صدای خوش خواندن" },
  { word: "شادی", clue: "حس خوشی" },
  { word: "مهمان", clue: "کسی که به خانه دعوت می‌شود" },
  { word: "جشن", clue: "مراسم شاد" },
  { word: "همیشه", clue: "در همهٔ زمان‌ها" },
];

export const KHALEH_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "خانهٔ خاله سوسکه",
    description: "خاله سوسکه در گوشه‌ای از یک خانهٔ قدیمی تنها زندگی می‌کرد. هر روز با جارو زمین را تمیز می‌کرد، کوزه را پر از آب می‌کرد و برای خودش چای می‌ریخت. سفرهٔ کوچکش همیشه مرتب بود. اما دلش می‌خواست کسی هم‌صحبتش باشد.",
    image: "/images/folktales/khaleh/ch1.jpg",
    victoryText: "خاله سوسکه تصمیم گرفت ازدواج کند تا خانه‌اش پر از صدا و خنده شود. آفتاب از پنجره به سفرهٔ او می‌تابید.",
    words: KHALEH_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/khaleh/ch1-monster.jpg",
    monsterName: "خاله سوسکه",
  },
  {
    id: 2,
    title: "خواستگارها",
    description: "اول آقا موش با سلام آمد، بعد آقا گربه و آقا سگ. هر کدام خودشان را معرفی می‌کردند و از خاله سوسکه می‌خواستند دامادشان شود. خاله سوسکه به هر کدام نگاه می‌کرد و یک عیب می‌دید. تصمیم گرفتن آسان نبود و انتخاب را به فردا گذاشت.",
    image: "/images/folktales/khaleh/ch1.jpg",
    victoryText: "در آخر یک کبوتر سفید به خانه آمد و آرام در زد. خاله سوسکه لبخند زد؛ انگار انتخابش را پیدا کرده بود.",
    words: KHALEH_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/khaleh/ch1-monster.jpg",
    monsterName: "خاله سوسکه",
  },
  {
    id: 3,
    title: "جشن عروسی",
    description: "خاله سوسکه لباس سفید پوشید، جلوی آینه نشست و موهایش را شانه کرد. همهٔ حیوانات به عروسی آمدند؛ موش، گربه، سگ و خروس. مهمان‌ها آواز خواندند و تا شب جشن گرفتند. از آن روز خانهٔ خاله سوسکه همیشه پر از شادی بود.",
    image: "/images/folktales/khaleh/ch1.jpg",
    victoryText: "خاله سوسکه و کبوتر سفید با هم زندگی تازه‌ای شروع کردند و هر شب، سفره‌شان برای مهمان‌ها باز بود.",
    words: KHALEH_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/khaleh/ch1-monster.jpg",
    monsterName: "خاله سوسکه",
  },
];
