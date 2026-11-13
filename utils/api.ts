
import { GoogleGenAI } from "@google/genai";
import { DictionaryEntry, Language, Category } from "../types";
import { debug } from './debug';

// Expanded Expansion topics to ensure variety
const SUB_TOPICS: Record<Category, Record<Language, string[]>> = {
    shahnameh: {
        en: ["Heroes", "Battles", "Creatures", "Kings", "Women of Shahnameh", "Places", "Weapons"],
        fa: ["پهلوانان و قهرمانان", "پادشاهان پیشدادی و کیانی", "زنان شاهنامه", "دیوها و موجودات افسانه‌ای", "سلاح‌ها و ابزار جنگی", "مکان‌های جغرافیایی شاهنامه", "هفت خوان رستم"]
    },
    body: {
        en: ["Internal Organs", "Bones & Skeleton", "Face Parts", "Medical Symptoms", "Muscles", "Verbs related to body", "Five Senses", "Hair Types", "Digestive System", "Nervous System"],
        fa: ["اعضای داخلی بدن", "استخوان ها و اسکلت", "اجزای صورت", "بیماری ها و علائم", "ماهیچه ها", "افعال بدنی", "حواس پنجگانه", "انواع مو", "دستگاه گوارش", "دستگاه عصبی"]
    },
    movies: {
        en: ["Action Movies", "Comedy Terms", "Film Crew Roles", "Famous Directors", "Cinema Equipment", "Movie Genres", "Awards & Festivals", "Famous Actors", "Animation Terms", "Lighting & Sound"],
        fa: ["فیلم های اکشن", "اصطلاحات کمدی", "عوامل صحنه", "کارگردانان معروف", "تجهیزات سینما", "ژانرهای فیلم", "جشنواره ها و جوایز", "بازیگران مشهور", "اصطلاحات انیمیشن", "نور و صدا"]
    },
    tech: {
        en: ["Computer Hardware", "Programming Terms", "Internet Slang", "Software Names", "Electronic Components", "Cybersecurity", "Social Media", "AI Terms", "Gadgets", "Data Science"],
        fa: ["سخت افزار کامپیوتر", "اصطلاحات برنامه نویسی", "اینترنت و شبکه", "نرم افزارها", "قطعات الکترونیکی", "امنیت سایبری", "شبکه های اجتماعی", "هوش مصنوعی", "گجت ها", "علم داده"]
    },
    food: {
        en: ["Fruits & Vegetables", "Cooking Methods", "Spices & Herbs", "Desserts", "Kitchen Tools", "Drinks", "Meat Cuts", "International Dishes", "Dairy Products", "Breakfast Items"],
        fa: ["میوه و سبزیجات", "روش های پخت", "ادویه و سبزی", "دسر و شیرینی", "وسایل آشپزخانه", "نوشیدنی ها", "انواع گوشت", "غذاهای ملل", "لبنیات", "صبحانه"]
    },
    nature: {
        en: ["Animals", "Plants & Trees", "Weather Terms", "Geological Features", "Space & Stars", "Insects", "Marine Life", "Natural Disasters", "Minerals & Rocks", "Seasons"],
        fa: ["حیوانات", "گیاهان و درختان", "آب و هوا", "عوارض زمین", "فضا و ستارگان", "حشرات", "موجودات دریایی", "بلایای طبیعی", "سنگ ها و کانی ها", "فصل ها"]
    },
    cities: {
        en: ["European Capitals", "Asian Cities", "US States & Cities", "Famous Landmarks", "Countries", "Geography Terms", "African Cities", "South American Cities", "Airports", "Tourist Spots"],
        fa: ["پایتخت های اروپا", "شهرهای آسیا", "شهرهای ایران", "مکان های دیدنی", "کشورها", "اصطلاحات جغرافیا", "شهرهای آفریقا", "شهرهای آمریکای جنوبی", "فرودگاه ها", "مراکز توریستی"]
    },
    jobs: {
        en: ["Medical Professions", "Construction Jobs", "Office Roles", "Artistic Careers", "Service Industry", "Academic Titles", "Engineering Fields", "Legal Professions", "Manual Labor", "Tech Jobs"],
        fa: ["شغل های پزشکی", "کارهای ساختمانی", "شغل های اداری", "کارهای هنری", "خدمات", "عناوین دانشگاهی", "رشته های مهندسی", "شغل های حقوقی", "کارهای یدی", "شغل های تکنولوژی"]
    },
    knowledge: {
        en: ["Science Terms", "History Facts", "Literature", "Physics", "Chemistry", "Math Terms", "Philosophy", "Astronomy", "Biology", "Psychology"],
        fa: ["اصطلاحات علمی", "تاریخ", "ادبیات", "فیزیک", "شیمی", "ریاضیات", "فلسفه", "نجوم", "زیست شناسی", "روانشناسی"]
    },
    history: {
        en: ["Ancient Civilizations", "World Wars", "Revolutions", "Famous Leaders", "Empires", "Age of Exploration", "Inventions", "Treaties"],
        fa: ["تمدن‌های باستان", "جنگ‌های جهانی", "انقلاب‌ها", "رهبران مشهور", "امپراتوری‌ها", "عصر اکتشاف", "اختراعات", "پیمان‌ها"]
    },
    sports: {
        en: ["Football", "Olympics", "Basketball", "Tennis", "Athletics", "Swimming", "Team Sports", "Sports Equipment"],
        fa: ["فوتبال", "المپیک", "بسکتبال", "تنیس", "دو و میدانی", "شنا", "ورزش‌های تیمی", "تجهیزات ورزشی"]
    },
    art: {
        en: ["Painting", "Sculpture", "Music", "Architecture", "Dance", "Theater", "Art Movements", "Museums"],
        fa: ["نقاشی", "مجسمه‌سازی", "موسیقی", "معماری", "رقص", "تئاتر", "سبک‌های هنری", "موزه‌ها"]
    },
    general: {
        en: ["Common Verbs", "Adjectives", "Household Items", "Emotions", "Colors & Shapes", "Time & Calendar", "Clothing", "Furniture", "Tools", "Vehicles"],
        fa: ["افعال پرکاربرد", "صفات", "وسایل خانه", "احساسات", "رنگ و اشکال", "زمان و تقویم", "پوشاک", "مبلمان", "ابزار آلات", "وسایل نقلیه"]
    },
    all: { en: [], fa: [] }
};

export async function generateCategoryExpansion(category: Category, language: Language, _ignoredIndex: number): Promise<{ words: DictionaryEntry[], nextIndex: number, done: boolean }> {
    if (category === 'all') return { words: [], nextIndex: 0, done: true };
    
    const topics = SUB_TOPICS[category][language];
    
    // Pick a RANDOM sub-topic to ensure variety and avoid "index" limitations
    const randomIndex = Math.floor(Math.random() * topics.length);
    const currentTopic = topics[randomIndex];
    
    debug.log('api', `Generating expansion for category: ${category}, Sub-topic: ${currentTopic}`);

    const words = await compileDictionary(`${category} (Focus on: ${currentTopic})`, language);
    
    return {
        words,
        nextIndex: randomIndex, // Not really used anymore, but kept for signature compatibility
        done: false // Never "done", user can always keep clicking to add more random words
    };
}

/**
 * Fetches a focused dictionary of words and clues.
 */

export async function generateImage(prompt: string): Promise<string | null> {
    debug.log('api', `Generating image for prompt: ${prompt}`);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // NOTE: `ai.models.image(...)` was never part of @google/genai. Use the
        // documented generateContent entrypoint; the model returns an image part.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ text: prompt }],
        });

        // The image generation response structure might be complex.
        // We're looking for base64 data within the candidates.
        const imagePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

        if (imagePart && imagePart.mimeType && imagePart.data) {
            debug.log('api', `Image generated successfully, mimeType: ${imagePart.mimeType}`);
            // Return base64 data directly for frontend consumption
            return `data:${imagePart.mimeType};base64,${imagePart.data}`;
        } else {
            debug.warn('api', 'No image data found in Gemini response.');
            return null;
        }
    } catch (error) {
        debug.error('api', 'Error generating image:', error);
        throw error;
    }
}

export async function compileDictionary(topic: string, language: Language): Promise<DictionaryEntry[]> {
    // Note: We deliberately do NOT catch errors here so they propagate to the UI controls
    const langName = language === 'fa' ? 'Persian (Farsi)' : 'English';
    const alphabetConstraint = language === 'fa' 
      ? 'Use standard Persian alphabet.' 
      : 'Use English alphabet (A-Z).';

    const prompt = `
      Act as a professional Crossword Compiler in ${langName}.
      Main Topic: "${topic}"
      
      Generate 50 UNIQUE, High-Quality words with short, clever clues.
      
      CRITICAL INSTRUCTIONS:
      1. Words must be between 2 and 7 letters long.
      2. MIX LENGTHS: Include many 3, 4, and 5 letter words (Vital for filling grids).
      3. AVOID DUPLICATES: Try to think of less obvious words related to the topic.
      4. Format strictly as: WORD|CLUE
      5. No spaces, hyphens, or special characters in the WORD column.
      6. ${alphabetConstraint}
      7. Do not number the lines. No Markdown. Just raw text.
      
      Example Output:
      PLANET|Orbiting body
      STAR|Burning gas ball
    `;

    // Initialize API. Assuming process.env.API_KEY is available as per instructions.
    // If process is undefined (browser), this might throw ReferenceError if not handled by bundler.
    // We let it throw so the user sees "ReferenceError" or "Auth Error" in the UI.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    if (response.text) {
      const lines = response.text.split('\n');
      const entries: DictionaryEntry[] = [];

      for (const line of lines) {
        if (!line.includes('|')) continue;
        
        const [rawWord, rawClue] = line.split('|');
        
        if (rawWord && rawClue) {
           // Basic cleanup
           let w = rawWord.trim().replace(/[^a-zA-Z\u0600-\u06FF]/g, ''); 
           const c = rawClue.trim();

           // Strict length check
           if (w.length >= 2 && w.length <= 7) {
             // Persian normalization (just in case)
             if (language === 'fa') {
                 w = w.replace(/[آأإ]/g, 'ا').replace(/ئ/g, 'ی').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
             } else {
                 w = w.toUpperCase();
             }
             
             entries.push({ word: w, clue: c });
           }
        }
      }

      debug.log('api', `Parsed ${entries.length} valid words for ${topic}.`);
      return entries;
    }
    
    // If we get here but response.text is empty/null without error
    throw new Error("AI returned empty response");
}

// Deprecated
export async function generateTopicWords(topic: string): Promise<string[]> { return []; }
export async function translateWordsToPersian(words: string[]): Promise<Record<string, string>> { return {}; }
