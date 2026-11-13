# قوانین کاری (Work Rules)

## ⚠️ قوانین ضروری که قبل از هر کاری باید خوند

### ۱. هیچ‌وقت فایل‌های کاری رو بدون اجازه کپی/جایگزین نکن
- قبل از هر edit یا cp، ببین فایل مقصد چی داره
- از پوشه‌های دیگه (مثل sister) مستقیم کپی نکن
- اگه لازم شد کپی کنی، اول با diff مقایسه کن

### ۲. همیشه بعد از تغییرات build بگیر
- `npm run build` بزن تا ببینی خطا نداره
- خطاها رو جدی بگیر و رفع کن

### ۳. مختصات نقشه ایران (IRAN MAP) ⚠️ حساس
- نقشه از ۳۱ استان تشکیل شده با viewBox="0 0 655 594"
- مسیرهای استان‌ها با transform="scale(0.8929788684389911, 0.8780487804878049)" از 733.5x676.5 به 655x594 تبدیل شدن
- نقطه‌های رنگی (markers) باید داخل استان درست خودشون باشن
- برای پیدا کردن موقعیت درست یک استان: centroid مختصات مسیر (path d) استان رو در فضای 733.5x676.5 پیدا کن، سپس scale کن به 655x594
- اگه نقطه‌ای جابجاست، از میانگین x,y های مسیر همون استان استفاده کن
- 🚫 هرگز مختصات رو به صورت حدس‌های دستی یا تقریبی نده. همیشه از centroid مسیر واقعی SVG استان استفاده کن (خوندن path d و parse کردن مختصات)
- 🚫 هرگز مختصات رو از نقشه قدیمی (که viewBox متفاوت داشت) مستقیم کپی نکن
- برای مکان‌های خارج از ایران (مثل توران، بابل، تیسفون، کابل): نزدیک‌ترین استان مرزی ایران رو به عنوان مبنا در نظر بگیر (توران←خراسان رضوی، بابل/تیسفون←ایلام/کرمانشاه، کابل←کرمان/سیستان)
- 🚫 هر وقت مختصات مارکرها رو تغییر دادی، حتماً translate داخل SVG رو هم بررسی کن: `public/images/iran-map.svg` دارای `translate(35, 36)` روی group هست. مارکرها باید با همون translate هماهنگ باشن. (یعنی مارکر_x = centroid_x * 0.893 + 35 و مارکر_y = centroid_y * 0.878 + 36)
- 🚫 rect داخل SVG نقشه باید `x="35" y="36" width="584" height="521"` باشه تا با مسیرها هم‌اندازه باشه و padding اضافی نداشته باشه
- مرزهای استان‌ها با stroke `#3a3a5c` کشیده شدن (در برابر stroke `#4a4a6a` برای استروک عمومی)

### ۴. تغییرات ویوها و state
- view state ها در App.tsx: 'menu' | 'playing' | 'leaderboard' | 'profile' | 'lobby' | 'social' | 'epic_library' | 'epic_chapters' | 'tower_lobby'
- Game mode: 'casual' | 'tower' | 'multiplayer' | 'story'
- هماهنگی بین currentGameMode و view مهمه

### ۵. دیتاها و فایل‌های حساس که نباید دست بخورن
- `data/campaigns.ts` - لیست کامل کتاب‌های داستانی (۲۴ کتاب)
- `server/local-data/story_books.json` - دیتابیس کتاب‌ها (۵۸ کتاب)
- `components/IranMap.tsx` - نقشه ایران با مختصات
- `types.ts` - تایپ‌های اصلی
- فایل‌های `data/shahnameh/` - واژگان و فصل‌های شاهنامه

### ۶. سرویس‌ها
- Frontend: Vite روی پورت ۳۰۰۰
- Backend: Node.js روی پورت ۴۰۰۰
- هر دو باید روشن باشن برای نمایش کامل کتاب‌ها

### ۷. رفع مشکل
- اگه مشکلی پیش اومد، به کاربر بگو دقیقاً چی changed
- قبل از fix، فایل رو بخون
- بعد از fix، build کن

## Rule: Never modify user data without explicit permission

Never modify user data (profile names, avatars, scores, game data, etc.) in the database without the user explicitly asking you to. Data changes in the database require direct confirmation from the user about what exact value to set. If you need to test something, test with TEST accounts, not real user data.
