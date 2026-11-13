import { DictionaryEntry, ShahnamehChapter } from "../../types";

const GOL_CHAPTER_1: DictionaryEntry[] = [
  { word: "گلی", clue: "اسم دختری در این قصه" },
  { word: "کوزه", clue: "ظرف سفالی برای آب" },
  { word: "چشمه", clue: "جایی که آب از زمین می‌جوشد" },
  { word: "آب", clue: "مایهٔ حیات" },
  { word: "مادر", clue: "زنی که از فرزندش نگهداری می‌کند" },
  { word: "بیمار", clue: "کسی که حال خوبی ندارد" },
  { word: "صبح", clue: "اول روز" },
  { word: "راه", clue: "مسیری برای رفتن" },
  { word: "سنگ", clue: "تکهٔ سخت زمین" },
  { word: "شکست", clue: "از هم جدا شدن" },
];

const GOL_CHAPTER_2: DictionaryEntry[] = [
  { word: "گریه", clue: "ریختن اشک از چشم" },
  { word: "همسایه", clue: "کسی که در خانهٔ بغلی زندگی می‌کند" },
  { word: "مهربان", clue: "خوش‌رفتار با دیگران" },
  { word: "کمک", clue: "یاری رساندن" },
  { word: "دست", clue: "عضو گرفتن و کار کردن" },
  { word: "دلداری", clue: "آرام کردن کسی که غمگین است" },
  { word: "خانه", clue: "جای زندگی" },
  { word: "نو", clue: "تازه و بی‌استفاده" },
  { word: "سفال", clue: "خاک پخته‌شده برای ساختن ظرف" },
  { word: "امید", clue: "انتظار خوبی" },
];

const GOL_CHAPTER_3: DictionaryEntry[] = [
  { word: "صبر", clue: "شکیبایی در سختی" },
  { word: "شکر", clue: "سپاسگزاری" },
  { word: "لبخند", clue: "حالت خوشایند صورت" },
  { word: "فردا", clue: "روز بعد" },
  { word: "آرام", clue: "بی‌صدا و راحت" },
  { word: "درس", clue: "آموزه" },
  { word: "سختی", clue: "دشواری" },
  { word: "آسانی", clue: "راحتی" },
  { word: "دوست", clue: "همدم صمیمی" },
  { word: "قصه", clue: "داستان" },
];

export const GOL_CHAPTERS: ShahnamehChapter[] = [
  {
    id: 1,
    title: "کوزهٔ گلی",
    description: "گلی با مادر بیمارش در روستا زندگی می‌کرد. هر صبح کوزهٔ سفالی را برمی‌داشت و به سمت چشمه راه می‌افتاد تا آب تازه بیاورد. مادرش از پنجره نگاهش می‌کرد. اما یک روز، پای گلی به سنگی خورد و کوزه شکست.",
    image: "/images/folktales/gol/ch1.jpg",
    victoryText: "آب روی خاک ریخت و کوزهٔ گلی تکه‌تکه شد. گلی کنار راه ایستاد و به خانهٔ خودش نگاه کرد.",
    words: GOL_CHAPTER_1,
    monsterAvatar: "/images/monsters/folktales/gol/ch1-monster.jpg",
    monsterName: "گلی",
  },
  {
    id: 2,
    title: "همسایهٔ مهربان",
    description: "گلی نشست و گریه کرد. همسایهٔ مهربان صدای او را شنید و از خانه بیرون آمد. دست گلی را گرفت، دلداری‌اش داد و گفت: «گریه نکن، با هم فکری می‌کنیم.» بعد از خانه‌اش یک کوزهٔ نو و سفالی آورد. امید دوباره در دل گلی روشن شد.",
    image: "/images/folktales/gol/ch1.jpg",
    victoryText: "گلی کوزهٔ نو را در آغوش گرفت و از همسایه تشکر کرد. دوباره راه چشمه را در پیش گرفت.",
    words: GOL_CHAPTER_2,
    monsterAvatar: "/images/monsters/folktales/gol/ch1-monster.jpg",
    monsterName: "گلی",
  },
  {
    id: 3,
    title: "بعد از سختی",
    description: "گلی آب را به خانه آورد و به مادرش داد. مادر لبخند زد و گفت: «تو صبر کردی و ناامید نشدی.» گلی فهمید که بعد از هر سختی، آسانی می‌آید. فردا دوباره به چشمه رفت، این بار آرام‌تر و مراقب‌تر. از آن روز همسایه را همیشه دوست خود دانست و درس این قصه در دلش ماند.",
    image: "/images/folktales/gol/ch1.jpg",
    victoryText: "مادر حالش بهتر شد و خانه پر از آرامش بود. گلی با خودش گفت: «سختی می‌گذرد، آدم‌های مهربان می‌مانند.»",
    words: GOL_CHAPTER_3,
    monsterAvatar: "/images/monsters/folktales/gol/ch1-monster.jpg",
    monsterName: "گلی",
  },
];
