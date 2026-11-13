# Crossword Gen Pro - مستندات پروژه برای AI Agents

## 📋 خلاصه پروژه
یک بازی جدول کلمات متقاطع پیشرفته با React + TypeScript + Vite که قابلیت‌های چندنفره، حالت داستانی، و تولید خودکار جدول با AI دارد.

## 🚀 اجرای پروژه
```bash
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2"
npm install
npm run dev  # روی http://127.0.0.1:8080 اجرا می‌شود
```

## 📦 تکنولوژی‌ها
- **Frontend**: React 19.2.3 + TypeScript 5.8.2
- **Build Tool**: Vite 6.4.3
- **UI Icons**: Lucide React
- **AI**: Google Gemini API (@google/genai)
- **Backend**: Express + WebSocket (`ws`) خودساخته + PostgreSQL 15 + Redis (Supabase حذف شده)
- **Effects**: Canvas Confetti
- **Ports**: Frontend `8080` · Backend `8081` · PostgreSQL `8173` · Redis `6379`

## 🏗️ ساختار پروژه

### 📁 فایل‌های اصلی ریشه
- `App.tsx` (~۱۰۵۰ خط) - کامپوننت اصلی برنامه، مدیریت state و navigation
- `index.tsx` - Entry point برنامه
- `index.html` - HTML template
- `types.ts` - تعریف تمام TypeScript types
- `vite.config.ts` - تنظیمات Vite
- `.env.local` - کلید API Gemini (نباید commit شود)

### 📁 components/ (19 کامپوننت)
کامپوننت‌های UI React:

**کامپوننت‌های اصلی بازی:**
- `GameView.tsx` (28KB) - صفحه اصلی بازی
- `CrosswordGrid.tsx` (18KB) - Grid جدول متقاطع
- `Controls.tsx` - دکمه‌های کنترل بازی
- `GameKeyboard.tsx` - صفحه کلید مجازی
- `ActiveClueBar.tsx` - نمایش سرنخ فعال

**Multi-player:**
- `Lobby.tsx` (11KB) - لابی چندنفره
- `MultiplayerHeader.tsx` - هدر حالت چندنفره
- `BattleControls.tsx` - کنترل‌های حالت Battle
- `BattleTutorial.tsx` - آموزش حالت Battle

**حالت داستانی (Epic Mode):**
- `EpicLibrary.tsx` - کتابخانه داستان‌ها
- `EpicModeMenu.tsx` - منوی حالت Epic
- `TowerLobby.tsx` - لابی حالت Tower

**Social & Profile:**
- `SocialPanel.tsx` (27KB) - پنل اجتماعی، دوستان، چت
- `ProfileModal.tsx` - مودال پروفایل کاربر
- `AuthModal.tsx` - احراز هویت

**UI:**
- `Leaderboard.tsx` - جدول امتیازات
- `HintModal.tsx` - مودال راهنما
- `GameFeedback.tsx` - بازخورد بصری بازی
- `SplashScreen.tsx` - صفحه ورودی

### 📁 data/
دیتاهای استاتیک بازی:

- `wordLists.ts` (96KB) - لیست کلمات و سرنخ‌های فارسی/انگلیسی برای دسته‌بندی‌های مختلف
- `shahnamehWords.ts` (7.8KB) - کلمات مرتبط با شاهنامه
- `shahnamehChapters.ts` - فصل‌های داستانی شاهنامه
- `campaigns.ts` (23KB) - کمپین‌های بازی
- `shahnameh/` - 7 فایل (khan1.ts تا khan7.ts) - خان‌های هفتگانه
- `worldMapData.ts` - محتوای فصل‌های اسطوره‌های فوتبال (۵ اسطوره‌ی اول) + رجیستری‌های `WORLD_MAP_CHAPTERS` / `LEGEND_FINAL_STORIES`
- `worldMapExtra/` - ۴ فایل (oldLegendsA/B, modernLegendsA/B) - ۲۰ اسطوره‌ی دیگر (۱۰ قدیمی + ۱۰ جدید)، هر کدام ۴ فصل
- `legendImages.ts` - تصاویر فصل‌ها + گرادیان جایگزین (`getChapterFallbackGradient`)

### 🗺️ World Map — دو رجیستری که باید هم‌خوان بمانند
1. `FOOTBALL_LEGENDS` در `components/WorldMap.tsx` — متادیتای نقشه (نام، کشور، `countryX/countryY`، ایموجی، رنگ).
2. `WORLD_MAP_CHAPTERS` + `LEGEND_FINAL_STORIES` در `data/worldMapData.ts` — محتوای واقعی و قابل‌بازی.

**قانون طلایی**: شناسه‌ی هر فصل باید `<legendId>_<slug>` باشد، چون `getChapterLegendId(id) = id.split('_')[0]` گرادیان پس‌زمینه را از همین پیشوند می‌گیرد. `WorldMapChapter.legendId` هم باید با شناسه‌ی اسطوره یکی باشد.

آرایه‌ی `chapters` هر اسطوره در `WorldMap.tsx` حالا با `legendChapters(legendId)` از محتوا ساخته می‌شود، پس شمارنده‌ی `level/N` و لیست فصل‌ها هرگز از محتوای واقعی جدا نمی‌افتد.

### 📁 hooks/
Custom React Hooks:

- `useGameLogic.ts` (24KB) - منطق اصلی بازی (مهم‌ترین hook)
- `useMultiplayerState.ts` (11KB) - مدیریت state چندنفره
- `useSocial.ts` (9KB) - قابلیت‌های اجتماعی

### 📁 utils/
توابع کمکی:

- `gameServer.ts` - کلاینت سرور بازی، مدیریت اتاق‌ها، بازیکنان و `LocalChannel`
- `gridLogic.ts` - **الگوریتم واقعی ساخت جدول** (`fillGrid` CSP solver) + `numberGrid` + `validateFilledGrid`
- `runSolver.ts` - اجرای solver در **Web Worker** با fallback همگام
- `glueWords.ts` - فقط **لیست کلمات** (الگوریتم نیست)
- `freeformGenerator.ts` - تولید جدول آزاد (حالت داستانی)
- `multiplayer.ts` - توابع multiplayer (شامل `subscribeWithRetry`)
- `dictionary.ts` - مدیریت دیکشنری + وضعیت solver برای Worker
- `api.ts` - ارتباط با API

### 📁 server/
Backend ساده Node.js:

- `index.js` - سرور اصلی
- `models.js` - مدل‌های دیتابیس
- `package.json` - وابستگی‌های سرور

## 🎯 Types مهم (types.ts)

### Grid & Game
- `Cell` - هر خانه از grid
- `Grid` - آرایه دوبعدی Cell
- `GridSize` - سایز grid: 5-10
- `Clue` - سرنخ با شماره، کلمه، ترجمه
- `Slot` - محل قرار گرفتن کلمه

### Game Modes
- `GameMode`: 'speed' | 'battle'
- `GameView`: 'menu' | 'playing' | 'leaderboard' | 'profile' | 'lobby' | 'social' | 'epic_library' | 'epic_chapters' | 'tower_lobby'

### Player & Social
- `PlayerState` - اطلاعات بازیکن (coins, score, level, history, etc.)
- `Friend` - دوست در شبکه اجتماعی
- `ChatMessage` - پیام چت
- `SocialNotification` - اعلان‌های اجتماعی

### Story Mode
- `StoryBook` - کتاب داستانی (شاهنامه، etc.)
- `ShahnamehChapter` - فصل از داستان
- `StoryGenre`: 'epic' | 'folklore' | 'education'

### Data
- `Category`: 'general' | 'movies' | 'cities' | 'knowledge' | 'food' | 'body' | 'jobs' | 'tech' | 'nature' | 'shahnameh' | 'all'
- `Language`: 'fa' | 'en'
- `DictionaryEntry` - کلمه + سرنخ

## 🔑 قابلیت‌های کلیدی

1. **تولید خودکار جدول**: با استفاده از AI (Gemini) یا الگوریتم داخلی
2. **Multi-player**: حالت Speed و Battle با قابلیت حمله
3. **Epic Mode**: بازی داستانی با فصل‌های شاهنامه
4. **Tower Mode**: چالش طبقات با سیستم ticket
5. **Social**: دوستان، چت، Friend Code
6. **Gamification**: سکه، امتیاز، سطح، تاریخچه بازی
7. **چندزبانه**: فارسی و انگلیسی

## 🎮 جریان اصلی بازی

1. کاربر وارد می‌شود → `SplashScreen` → `AuthModal` (اگر لازم باشد)
2. انتخاب حالت بازی از منو
3. تنظیمات: سایز grid، دسته‌بندی، زبان
4. تولید جدول: `gridLogic.ts` (`fillGrid`) از طریق `runSolver.ts` (Web Worker) — یا `freeformGenerator.ts` در حالت داستانی
5. بازی شروع می‌شود → `GameView` با `CrosswordGrid`
6. بعد از تکمیل → امتیاز، سکه، بازخورد

## 💡 نکات مهم برای توسعه

- **State Management**: اکثر state در `App.tsx` و `useGameLogic.ts`
- **Grid Algorithm**: الگوریتم اصلی در `gridLogic.ts` (`fillGrid`) — پیچیده و حساس. در `runSolver.ts` روی Web Worker اجرا می‌شود و در صورت خطا/timeout به اجرای همگام برمی‌گردد.
- **AI Integration**: در `api.ts` - نیاز به GEMINI_API_KEY در `.env.local`
- **Supabase**: حذف شد — جایگزین با WebSocket + HTTP خودساخته. کلاینت از `LocalChannel` (در `gameServer.ts`) استفاده می‌کند.
- **RTL Support**: پروژه از فارسی پشتیبانی می‌کند
- **Build**: `npm run build` قبل از build، `tsc --noEmit` را اجرا می‌کند (`prebuild`).
- **Test (multiplayer)**: `npm run test:mp` — تست E2E دو-کلاینتی پروتکل آنلاین (سرور باید روی 8081 بالا باشد).

## 🐛 Debug و Testing

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## 📝 TODO/Ideas (اگر می‌خواهی توسعه بدی)
- [ ] بهبود الگوریتم تولید grid
- [ ] افزودن دسته‌بندی‌های جدید
- [ ] بهبود UI/UX
- [ ] افزودن sound effects
- [ ] Progressive Web App (PWA)
- [ ] مود آفلاین کامل

---

## 🐛 Session History

### Session 2 (Jun 1, 2026) - Fix: Monster Rage Timer Before Story Modal

**Problem**: In epic/story mode, selecting a chapter loaded the grid and immediately started the monster rage timer (`setIsTimerActive(true)` in `generateGrid`), dealing damage to hero HP while the player was still reading the story intro modal.

**Fix in `hooks/useGameLogic.ts`**:
- Added `startTimer()` function that sets `isTimerActive = true` (exported)
- Line 430: Removed `setIsTimerActive(true)` from the story mode freeform branch (inside `if (chapterId && language === 'fa')`)
- Line 454: Made `setIsTimerActive(true)` conditional on `!chapterId` for the fallback grid path

**Fix in `App.tsx`**:
- Line 920: "ادامه و شروع" button now calls `game.startTimer()` after `setShowStoryModal(false)`, so the timer only starts when the player dismisses the modal

---

## 🐛 Session History

### Session 3 (Jun 1, 2026) - Added 2 New Epic Campaigns: Rostam & Sohrab + Rostam & Afrasiab

**New Campaigns Added**:
1. **رستم و سهراب** (`rostam_sohrab`) - 7 chapters, hard difficulty
   - شکار در توران → دژ سمنگان → تهمینه → زادن سهراب → دژ سپید → رویارویی → پایان تراژیک
2. **رستم و افراسیاب** (`rostam_afrasiab`) - 7 chapters, hard difficulty
   - دشمن دیرین → نبرد در هامون → کمین افراسیاب → پیکار با جادو → جنگ هفت گردان → تاختن به توران → کیفر افراسیاب

**New Files Created**:
- `data/shahnameh/rostamSohrabChapters.ts` - 7 chapters with full narrative
- `data/shahnameh/rostamAfrasiabChapters.ts` - 7 chapters with full narrative  
- `data/shahnameh/sohrabWords.ts` - ~130 new Persian crossword words
- `data/shahnameh/afrasiabWords.ts` - ~130 new Persian crossword words
- `public/images/monsters/sohrab/*.svg` - 7 monster SVGs
- `public/images/monsters/afrasiab/*.svg` - 7 monster SVGs
- `public/images/monsters/rostam7/*.svg` - 7 monster SVGs (replaced old Unsplash URLs)

**Files Modified**:
- `data/campaigns.ts` - added 2 new entries to EPIC_CAMPAIGNS
- `data/shahnamehChapters.ts` - all `monsterAvatar` URLs → local `/images/monsters/rostam7/*.svg`
- `server/local-data/story_books.json` - added 2 new books (total: 5)
- `server/local-data/story_chapters.json` - added 14 new chapters (total: 34)
- `server/local-data/game.db` - deleted & re-migrated

**Monster Images**: All 21 monsters (7 Haft Khan + 7 Sohrab + 7 Afrasiab) use local SVG files in `public/images/monsters/`. Each has a distinct color palette, horns, glowing eyes, and thematic name banner.

**Data Flow**: Frontend fetches from `localhost:8081/api/story/books` → server reads PostgreSQL → falls back to `EPIC_CAMPAIGNS` if server unreachable. (DB currently holds **58** books: 32 در `EPIC_CAMPAIGNS` + کتاب‌های folklore و درسی.)

---

### Session 4 (Jun 1, 2026) - Replaced All Abstract SVGs with Persian Miniature-Inspired Art

**Problem**: All SVG images (chapters, covers, monsters) were just abstract geometric shapes (circles, ellipses, paths with no recognizable form) that didn't look like Persian mythology at all.

**Solution**: Created a comprehensive SVG generation system in `scripts/` that generates 60 SVG files with proper Persian miniature-inspired artwork:

**New Files Created** (`scripts/`):
- `svg-utils.cjs` - Reusable SVG components: borders (Islamic geometric), cypress trees, mountains, warriors, horses, dragons, domes, crescent moons, crowns, flowers, fire, water waves, Persian arches
- `gen-chapters.cjs` - 34 chapter scene generators with unique per-chapter composition
- `gen-covers.cjs` - 5 cover image generators with campaign-specific branding
- `gen-monsters.cjs` - 21 monster avatar generators with horns, glowing eyes, thematic styling
- `generate-all-svgs.cjs` - Master script that cleans and regenerates everything

**What Changed**:
| Before | After |
|--------|-------|
| Abstract circles/ellipses | Recognizable Persian-style scenes |
| No border decoration | Islamic geometric borders on all images |
| Single color per image | Rich layered palettes per campaign |
| No scene elements | Mountains, cypress trees, warriors, horses, dragons, etc. |
| 5 campaign covers | Covers with helmets, crowns, faces, Persian motifs |

**Persian Miniature Elements Used**:
- **Geometric borders**: Grid-based decorative tile patterns with rounded corners
- **Cypress trees**: Curved, iconic Persian tree shape
- **Layered mountains**: Triangular with snow caps, Persian miniature style
- **Cloud bands**: Moon, stars, celestial elements  
- **Architecture**: Persian domes, arches, ornate portals
- **Figures**: Stylized warriors, horses, dragons, silhouettes
- **Color palettes per campaign**:
  - Rostam 7: Gold/amber on dark brown
  - Sohrab: Deep red on dark background
  - Afrasiab: Indigo/blue on dark navy
  - Hassan Kachal: Pink/rose on cream
  - Farsi Aval: Sky blue on white

**Images Regenerated**: 34 chapters + 5 covers + 21 monsters = **60 SVGs**

**Build**: ✅ `npm run build` passes

---

## 🐛 Session History

### Session 5 (Jun 2, 2026) - Word Expansion: 15,300 New Persian Words Across 9 Categories

**Problem**: Each category-specific game had only 200-500 words available after removing generic MASSIVE_GLUE_FA filler. The CSP solver struggled with 100-200 words per category, visiting only 2-72 nodes before timeout.

**Root Cause**: The dictionary.json (from server seeding) mixed 413 MASSIVE_GLUE_FA words into every category, making them 40-70% generic filler. After filtering them out, each category had only 200-600 actual thematic words — insufficient for reliable grid generation.

**Solution**: Generated 15,300 new Persian words (1,700 per category) using an algorithmic word generator (`scripts/generate-words.cjs`) that:
- Starts with 100-300 quality category stems (foods, movies, cities, etc.)
- Generates short words (2-4 chars) from category-specific short word pools for connector diversity
- Generates medium words (5-7 chars) using valid Persian prefix+stem and stem+suffix compounding
- Generates long words (7-12 chars) using double suffix + prefix combinations
- Each word gets a rotating clue from 15 category-specific clue templates
- Checks only against the same category's existing words to ensure no duplicates

**Integration in `utils/dictionary.ts`**:
- Imported all 9 expanded word arrays from `data/expandedGlueWords.ts`
- Added `EXPANDED_CATEGORY_MAP_FA` mapping categories to their expanded lists
- In `loadCategory`, expanded words are added after category glue but before indexing
- DB words (higher quality clues) come first, so they're preferred on duplicates

**Result per category (FA words)**:
| Category | DB words | After filtering | Glue | Expanded | Total |
|----------|----------|----------------|------|----------|-------|
| food | 958 | ~554 | 138 | 1,700 | **~2,392** |
| body | 994 | ~590 | 126 | 1,700 | **~2,416** |
| movies | 699 | ~295 | 124 | 1,700 | **~2,119** |
| cities | 540 | ~136 | 103 | 1,700 | **~1,939** |
| nature | 546 | ~142 | 129 | 1,700 | **~1,971** |
| knowledge | 544 | ~140 | 140 | 1,700 | **~1,980** |
| jobs | 521 | ~117 | 110 | 1,700 | **~1,927** |
| tech | 573 | ~169 | 116 | 1,700 | **~1,985** |
| shahnameh | 0 | 0 | 124 | 1,700 | **~1,824** |

**Short glue words (2-4 chars)**: ~200+ per category ✓ (from MASSIVE_GLUE_FA keep-short + category glue + expanded short entries)

**New Files**:
- `scripts/generate-words.cjs` - Word generator script
- `data/expandedGlueWords.ts` (932KB, 15,300 entries) - Generated word lists

**Build**: ✅ `npm run build` passes (1,583 KB bundle, 312 KB gzipped)

---

### Session 6 (Jun 2, 2026) - Replaced 15,300 AI-Generated Words with 897 Hand-Curated Real Persian Words

**Problem**: The previous session generated 15,300 artificial compound words (prefix+stem, stem+suffix) with only 15 rotating generic clues per category — producing duplicate clues and non-real words like "همخور". The `loadCategory()` still used the old `EXPANDED_CATEGORY_MAP_FA`, and each category had deficits of 80-550 words to reach MIN_PER_LEN=50.

**Solution**: Complete rewrite of the word expansion strategy:

**What Changed**:
1. **Removed all 15,300 bad words** from `data/expandedGlueWords.ts` (932KB file deleted from codebase)
2. **Restored `dictionary.json`** to original 7,033 quality entries (all unique clues)
3. **Rewrote `loadCategory()`** in `utils/dictionary.ts` with 3-tier supplement:
   - Tier 1: Category primary words + category glue
   - Tier 2: Neighbor categories (food↔body, tech↔knowledge, cities↔nature)
   - Tier 3: Other categories + MASSIVE_GLUE_FA (last resort)
4. **Changed MIN_PER_LEN** from 35 to 50 for all categories
5. **Wrote `scripts/add-curated-words.cjs`** with 897 hand-curated REAL Persian words, each with a UNIQUE clue:
   - food: +65 words (dishes, ingredients, drinks)
   - movies: +82 words (film terms, genres, roles)
   - cities: +94 words (city names, provinces)
   - nature: +121 words (mountains, rivers, plants, animals)
   - knowledge: +94 words (sciences, planets, math, history)
   - body: +105 words (organs, systems, diseases)
   - jobs: +103 words (professions, medical, engineering)
   - tech: +89 words (programming, hardware, cybersecurity)
   - shahnameh: +144 words (heroes, places, epic concepts)

**Result per category (total FA in dictionary.json)**:
| Category | Original | After | Supplement | Purity |
|----------|----------|-------|------------|--------|
| food | 958 | 1,022 | 9% | 91% |
| movies | 699 | 771 | 15% | 85% |
| cities | 540 | 634 | 27% | 73% |
| nature | 546 | 666 | 21% | 79% |
| knowledge | 544 | 637 | 23% | 77% |
| body | 994 | 1,097 | 7% | 93% |
| jobs | 521 | 624 | 23% | 77% |
| tech | 573 | 662 | 23% | 77% |
| shahnameh | 0 | 144 | 75% | 25% |

**All categories reach MIN_PER_LEN=50** with the supplement strategy. Category purity is 73-93% for most categories. Shahnameh has limited vocabulary (character names are short) so relies more on supplements.

**New Files**:
- `scripts/add-curated-words.cjs` - Hand-curated word list appender (897 words with unique clues)

**Files Modified**:
- `server/local-data/dictionary.json` - 7,930 entries (original 7,033 + 897 curated)
- `utils/dictionary.ts` - New 3-tier supplement strategy, MIN_PER_LEN=50

**Deleted**:
- `data/expandedGlueWords.ts` - Removed 15,300 AI-generated bad words

**Build**: ✅ `npm run build` passes (753 KB bundle, 213 KB gzipped)

---

### Session 7 (Jun 4, 2026) - Two New Epic Campaigns: Siavosh + Bizhan & Manijeh

**New Campaigns Added**:
1. **سیاوش** (`siavoshan`) - 8 chapters, hard difficulty
   - تولد سیاوش → تعلیم سیاوش → دام سودابه → عبور از آتش → سفر به توران → سیاوش و فرنگیس → شهادت سیاوش → کین سیاوش
2. **بیژن و منیژه** (`bizhan`) - 6 chapters, hard difficulty
   - شکار بیژن در توران → عشق پنهانی → غضب افراسیاب → منیژه در ایران → رستم در توران → رهایی و بازگشت

**New Files Created**:
- `data/shahnameh/siavoshanWords.ts` - 160 words across 8 chapters (20 per chapter)
- `data/shahnameh/siavoshanChapters.ts` - 8 chapters with full Persian descriptions
- `data/shahnameh/bizhanWords.ts` - 120 words across 6 chapters (20 per chapter)
- `data/shahnameh/bizhanChapters.ts` - 6 chapters with full Persian descriptions
- `scripts/gen-new-campaigns.cjs` - SVG generator for 14 chapter scenes + 2 covers + 14 monster avatars
- `scripts/register-new-campaigns.cjs` - Server JSON registration script
- `public/images/chapters/siavoshan/` - 8 chapter SVGs (Persian miniature style, red accent)
- `public/images/chapters/bizhan/` - 6 chapter SVGs (Persian miniature style, green accent)
- `public/images/monsters/siavoshan/` - 8 monster SVGs
- `public/images/monsters/bizhan/` - 6 monster SVGs
- `public/images/covers/siavoshan.svg` - Cover image with fire + mountain motifs
- `public/images/covers/bizhan.svg` - Cover image with cypress + double-figure motif

**Files Modified**:
- `data/campaigns.ts` - added 2 new entries to EPIC_CAMPAIGNS (total: 7)
- `data/shahnamehChapters.ts` - added siavoshanChapter scenes + words
- `server/local-data/story_books.json` - added 2 new books (total: 7)
- `server/local-data/story_chapters.json` - added 14 new chapters (total: 48)

**Color Palettes**:
- Siavosh: Deep red `#e63946` on dark brown `#1a0a0f` (fire, blood, tragedy)
- Bizhan: Rich green `#2d6a4f` on dark forest `#0a140f` (nature, hope, love)

---

### Session 8 (Jun 4, 2026) - Six New Campaigns: Zal & Rudabeh, Arash, Khosrow & Shirin, Haft Peykar, Kurosh, Mosaddegh

**New Campaigns Added**:
1. **زال و رودابه** (`zal_rudabeh`) - 5 chapters, hard difficulty (purple `#8b5cf6`)
   - زال در کوه → دیدار زال و رودابه → مهر رودابه → رهایی از آتش → کابین
2. **آرش کمانگیر** (`arash`) - 1 chapter, hard difficulty (amber `#f59e0b`)
   - تیر آرش
3. **خسرو و شیرین** (`khosrow_shirin`) - 6 chapters, hard difficulty (pink `#ec4899`)
   - خسرو پرویز → عشق شیرین → جدایی → کوه بیستون → حماسه فرهاد → پیوند دوباره
4. **هفت پیکر** (`haft_peykar`) - 5 chapters, hard difficulty (cyan `#06b6d4`)
   - بهرام گور → هفت گنبد → راز دختران → شکنجه موبد → پایان افسانه
5. **کوروش بزرگ** (`kurosh`) - 6 chapters, medium difficulty (amber `#f59e0b`)
   - تولد کوروش → نبرد با آژیدهاک → فتح لیدیه → سقوط بابل → آزادی یهود → منشور حقوق بشر
6. **مصدق و نفت** (`mosaddegh`) - 4 chapters, medium difficulty (green `#10b981`)
   - دکتر مصدق → ملی شدن نفت → کودتا → دادگاه تاریخ

**New Files Created**:
- `data/shahnameh/zalRudabehWords.ts` - 100 words (20 per chapter)
- `data/shahnameh/zalRudabehChapters.ts` - 5 chapters with full Persian descriptions
- `data/shahnameh/arashWords.ts` - 20 words
- `data/shahnameh/arashChapters.ts` - 1 chapter
- `data/shahnameh/khosrowShirinWords.ts` - 120 words (20 per chapter)
- `data/shahnameh/khosrowShirinChapters.ts` - 6 chapters
- `data/shahnameh/haftPeykarWords.ts` - 100 words (20 per chapter)
- `data/shahnameh/haftPeykarChapters.ts` - 5 chapters
- `data/shahnameh/kuroshWords.ts` - 120 words (20 per chapter)
- `data/shahnameh/kuroshChapters.ts` - 6 chapters
- `data/shahnameh/mosaddeghWords.ts` - 80 words (20 per chapter)
- `data/shahnameh/mosaddeghChapters.ts` - 4 chapters
- `scripts/gen-more-campaigns.cjs` - SVG generator for all 6 campaigns
- `scripts/register-more-campaigns.cjs` - Server JSON registration script
- `public/images/chapters/{zal,arash,khosrow,peykar,kurosh,mosaddegh}/` - 27 chapter SVGs
- `public/images/monsters/{zal,arash,khosrow,peykar,kurosh,mosaddegh}/` - 27 monster SVGs
- `public/images/covers/{zal,arash,khosrow,peykar,kurosh,mosaddegh}.svg` - 6 cover SVGs
- `components/IranMap.tsx` - Interactive Iran map with geographic markers for all 13 books

**Files Modified**:
- `data/campaigns.ts` - 6 new entries (total: 13 campaign books)
- `data/shahnamehChapters.ts` - 6 new imports + scenes mapping (total: 75 chapters)
- `server/local-data/story_books.json` - 6 new books (total: 13 books)
- `server/local-data/story_chapters.json` - 27 new chapters (total: 75 chapters, 1133 words)
- `components/EpicLibrary.tsx` - Added map/list toggle, integrated IranMap component

**Iran Map**:
- Interactive SVG map of Iran with 11 clickable geographic markers
- Uses real Iran map SVG downloaded from mapsvg.com (CC0 license)
- Genre filter (only shows markers for active genre)
- Hover effects with location labels
- Progress indicator (triangle) for completed books
- Colors change per active genre tab (amber epic, pink folklore, sky education)

**New Files**:
- `public/images/iran-map.svg` - Real Iran map with 31 provinces (mapsvg.com, 69KB)

**Build**: ✅ `npm run build` passes (934 KB JS, 2.4s)

---

### Session 9 (Jun 4, 2026) - Four New Epic Campaigns: Kaveh, Esfandiyar, Rostam & Esfandiyar, Tahmineh

**New Campaigns Added**:
1. **کاوه آهنگر** (`kaveh`) - 4 chapters, hard difficulty (red `#e11d48`)
   - فریاد کاوه → قیام و درفش → اتحاد با فریدون → زنجیر شدن ضحاک
2. **اسفندیار** (`esfandiyar`) - 7 chapters, hard difficulty (green `#059669`)
   - خوان اول: نبرد با گرگان → خوان دوم: شیر و اژدها → خوان سوم: زن جادوگر → خوان چهارم: مرغ سهمگین → خوان پنجم: آتش و تفنگ → خوان ششم: تنگه مرگ → خوان هفتم: دیو بزرگ
3. **رستم و اسفندیار** (`rostam_esfandiyar`) - 5 chapters, hard difficulty (amber `#b45309`)
   - پیام گشتاسپ → نبرد دو پهلوان → تیر نگاه رستم → مرگ اسفندیار → پیامد تلخ
4. **تهمینه** (`tahmineh`) - 3 chapters, hard difficulty (purple `#d946ef`)
   - عشق در سمنگان → شب وصال → تولد سهراب

**New Files Created**:
- `data/shahnameh/kavehWords.ts` - 80 words across 4 chapters
- `data/shahnameh/kavehChapters.ts` - 4 chapters with full Persian descriptions
- `data/shahnameh/esfandiyarWords.ts` - 140 words across 7 chapters
- `data/shahnameh/esfandiyarChapters.ts` - 7 chapters with full Persian descriptions
- `data/shahnameh/rostamEsfandiyarWords.ts` - 100 words across 5 chapters
- `data/shahnameh/rostamEsfandiyarChapters.ts` - 5 chapters with full Persian descriptions
- `data/shahnameh/tahminehWords.ts` - 60 words across 3 chapters
- `data/shahnameh/tahminehChapters.ts` - 3 chapters with full Persian descriptions
- `scripts/gen-four-campaigns.cjs` - SVG generator for 4 campaigns
- `public/images/chapters/{kaveh,esfandiyar,rostam-esfandiyar,tahmineh}/` - 19 chapter SVGs
- `public/images/monsters/{kaveh,esfandiyar,rostam-esfandiyar,tahmineh}/` - 19 monster SVGs
- `public/images/covers/{kaveh,esfandiyar,rostam-esfandiyar,tahmineh}.svg` - 4 cover SVGs

**Files Modified**:
- `data/campaigns.ts` - 4 new entries (total: 17 campaign books)
- `server/local-data/story_books.json` - 4 new books (total: 25 books: 14 epic + 1 folklore + 7 history + 3 education)
- `server/local-data/story_chapters.json` - 19 new chapters (total: 132 chapters, 2,127 words)
- `components/IranMap.tsx` - 4 new locations + 3 new story groups

**Iran Map Updates**:
- Babel (2nd marker) for Zahhak + Kaveh overlapping
- Sistan location for Esfandiyar + Rostam & Esfandiyar (green group)
- Samangan for Tahmineh (added to Rostam timeline between Zal and Haft Khan)
- New story groups: `kaveh_zahhak` (red), `esfandiyar_group` (green)

**Build**: ✅ `npm run build` passes (1,159 KB bundle, 300 KB gzipped)

---

### Session 10 (Jun 4, 2026) - Seven New Campaigns: Zal & Simorgh, Kaykhosrow, Rostam Death, Rostam & Akvan, Hushang, Jamshid, Anushirvan

**New Campaigns Added**:
1. **زال و سیمرغ** (`zal_simorgh`) - 5 chapters, medium (sky blue `#0ea5e9`)
   - تولد زال → سیمرغ → حکمت کوهستان → بازگشت به وطن → زال پهلوان
2. **کیخسرو و کین سیاوش** (`kaykhosrow`) - 6 chapters, hard (red `#dc2626`)
   - تاجگذاری کیخسرو → لشکرکشی بزرگ → نبرد با افراسیاب → غرق شدن افراسیاب → پیروزی و بازگشت → دوران طلایی
3. **مرگ رستم** (`rostam_death`) - 5 chapters, hard (gray `#4a4a4a`)
   - شغاد خیانتکار → دام مرگ → آخرین تیر → وداع با رخش → پایان افسانه
4. **رستم و اکوان دیو** (`rostam_akvan`) - 3 chapters, hard (purple `#7c3aed`)
   - دیو اکوان → نبرد در کوهستان → پیروزی و بازگشت
5. **هوشنگ و کشف آتش** (`hushang`) - 3 chapters, easy (orange `#f97316`)
   - شاه هوشنگ → کشف آتش → جشن سده
6. **جمشید و عصر طلایی** (`jamshid`) - 5 chapters, medium (gold `#eab308`)
   - جمشید پادشاه → تخت جمشید → شکوه و غرور → سقوط جمشید → میراث جمشید
7. **انوشیروان دادگر** (`anushirvan`) - 4 chapters, medium (cyan `#06b6d4`)
   - تاجگذاری انوشیروان → بزرگمهر وزیر → جنگ با روم → ایوان مدائن

**New Files Created**:
- `data/shahnameh/zalSimorghWords.ts` - 100 words, 5 chapters
- `data/shahnameh/kaykhosrowWords.ts` - ~114 words, 6 chapters
- `data/shahnameh/rostamDeathWords.ts` - 100 words, 5 chapters
- `data/shahnameh/rostamAkvanWords.ts` - 60 words, 3 chapters
- `data/shahnameh/hushangWords.ts` - 60 words, 3 chapters
- `data/shahnameh/jamshidWords.ts` - 100 words, 5 chapters
- `data/shahnameh/anushirvanWords.ts` - ~80 words, 4 chapters
- `scripts/gen-seven-campaigns.cjs` - SVG generator for 7 campaigns
- `public/images/chapters/{zal-simorgh,kaykhosrow,rostam-death,rostam-akvan,hushang,jamshid,anushirvan}/` - 31 chapter SVGs
- `public/images/monsters/...` - 31 monster SVGs
- `public/images/covers/{zal-simorgh,kaykhosrow,rostam-death,rostam-akvan,hushang,jamshid,anushirvan}.svg` - 7 cover SVGs

**Files Modified**:
- `data/campaigns.ts` - 7 new entries (total: 32 campaign books در `EPIC_CAMPAIGNS`؛ کل کتاب‌های دیتابیس ۵۸)
- `server/local-data/story_books.json` - 7 new books (total: 32 books)
- `server/local-data/story_chapters.json` - 31 new chapters (total: 163 chapters)
- `components/IranMap.tsx` - 7 new locations + 4 new story groups

**Iran Map Updates**: Locations for البرز (Zal & Simorgh), توران (Kaykhosrow), کابل (Rostam Death), مازندران (Rostam & Akvan), پاسارگاد (Hushang), تخت جمشید (Jamshid), تیسفون (Anushirvan). New groups: `rostam_timeline`, connecting Zal-Simorgh to Zal-Rudabeh, and Rostam-Akvan to Rostam-7.

**Build**: ✅ `npm run build` passes (1,248 KB bundle, 318 KB gzipped)

---

### Session 11 (Jun 6, 2026) - Fix: Presence System + WebSocket Auto-Reconnect

**Three Critical Multiplayer Bugs Found & Fixed**:

1. **`LocalChannel.on('presence',...)` - Callback stored incorrectly** (`utils/gameServer.ts:73-77`)
   - Before: `this.handlers.push({ event: 'presence', callback: filterOrCb, ...})` where `filterOrCb` was the FILTER OBJECT `{event:'sync'}`, not the callback function
   - After: `callback: cb || filterOrCb` — the actual callback function (3rd arg) is now used
   - Impact: `presence_sync` events from server never triggered `onPlayerJoin` → host never knew opponent joined

2. **`presenceState()` always returned `{}`** (`utils/gameServer.ts:145-147`)
   - Before: `return {}` — hardcoded empty object
   - After: Stores `_presenceState` parsed from server's `presence_sync` messages
   - Also: Detects users who left and fires `leave` callbacks

3. **WebSocket auto-reconnect race condition** (`utils/gameServer.ts` + `server/wsServer.js`)
   - Client: `onclose` always reconnected, even on intentional `unsubscribe()`. Fixed by capturing `currentWs` and checking `this.ws === currentWs` before reconnect.
   - Client: Added heartbeat ping every 15s to prevent idle disconnects.
   - Server: Added 5-second `LEAVE_GRACE_PERIOD` before broadcasting `player_left`. If user rejoins within grace period, the leave is cancelled.

**Files Modified**:
- `utils/gameServer.ts` — Presence handler fix, presenceState storage, heartbeat, safe reconnect
- `server/wsServer.js` — Grace period, explicit leave handler (no grace on explicit leave)

**New Files**:
- `ROADMAP.md` — Comprehensive roadmap with scalability plan (5 phases), architecture decisions, session history

---

### Session 12 (Jun 6, 2026) - Scalability Planning + Documentation

**Changes Made**:
- Full scalability assessment: codebase rated 2/10 for architecture, max ~20 concurrent users
- Created `ROADMAP.md` with 5-phase plan (0: Fix online battle, 1: Database/server, 2: Frontend cleanup, 3: Grid gen worker, 4: WS scaling, 5: Deployment)
- Updated `AGENTS.md` with complete session history
- Architecture decisions documented:
  - Database: better-sqlite3 → PostgreSQL (when needed)
  - WS: Current server → +Redis (when needed)
  - Hosting: Single VPS → Load balanced (when needed)
  - State: Context API → Zustand (if complexity grows)
  - Supabase SKIPPED (filtered in Iran)
- All bugs (presence, presenceState, WS reconnect) confirmed fixed in code but NOT yet verified end-to-end

**Known Remaining Multiplayer Issues (NOT FIXED)**:
1. Challenge accept flow still fails — after joiner clicks accept, game doesn't start properly
2. `useSocial.ts` has its OWN WebSocket implementation with similar race condition (not yet fixed)
3. Coin flip timing may have race condition between host calculating result and broadcasting to joiner
4. Room/channel lifecycle: needs investigation if room_xxxx channel is properly created before invite is sent

**Files Modified**:
- `AGENTS.md` — Updated with session 12
- `ROADMAP.md` — Created

---

### Session 13 (Jun 7, 2026) - Fix: Presence Handler Event Firing + Leave/Cancel Buttons

**CRITICAL BUG FIX — Unrelated presence handlers were firing on every `presence_sync`**

**Root Cause**: In `gameServer.ts:LocalChannel.onmessage`, when `presence_sync` arrived, ALL presence handlers (`sync` AND `leave`) were fired for both events. The `leave` handler's callback received `{ event: 'sync' }` where `key` was `undefined`, and `undefined !== player.id` was always `true` → `onPlayerLeft()` was called immediately after room creation → `setJoinError()` → cleanup effect returned host to menu.

**Fix** (`utils/gameServer.ts`):
- `on()` method: store `filterOrCb.event` ('sync' or 'leave') as the `filter` value for presence handlers
- `onmessage` handler: use `h.filter === 'sync'` for sync callbacks and `h.filter === 'leave'` for leave callbacks

**Effect**: After creating a room, the first `presence_sync` (with just the host) no longer incorrectly triggers `onPlayerLeft` → waiting overlay stays visible. Opponent join/leave detection still works correctly.

**Problem**: When host or joiner left during the waiting/preference/loading phase, the other party had no way to exit (no cancel button), and `onPlayerLeft` was not implemented properly — leaving the stranded party stuck on a loading screen forever.

**Changes Made**:
1. **Cancel Button on All Waiting States** (`App.tsx`: waiting overlay):
   - دکمه «✕ لغو و بازگشت» اضافه شد به سه مرحله: «در انتظار حریف»، «در حال توافق بر سر دسته‌بندی»، «در حال ساخت جدول»
   - `handleLeaveWaiting()` تابع جدید — `leaveRoom()` + `game.resetGame()` + `resetState()` + `setView('menu')` + `setCurrentGameMode('casual')`

2. **Host Leaves While Joiner Waits** (`useMultiplayerState.ts:onPlayerLeft`):
   - `setJoinError('سازنده بازی انصراف داد.')` — به joiner پیام می‌دهد که host رفته
   - `leaveRoom()` دیگر در `onPlayerLeft` صدا زده نمی‌شود (اجرا به `joinError` effect در App.tsx منتقل شد)

3. **Joiner Leaves While Host Waits** (`useMultiplayerState.ts:onPlayerLeft`):
   - `setJoinError('حریف بازی را لغو کرد.')` — به host پیام می‌دهد
   - `leaveRoom()` نیز به `joinError` effect منتقل شد

4. **joinError Effect in App.tsx** (خط ~540):
   - اثر جدید `useEffect` که `joinError` را مانیتور می‌کند
   - Cleanup کامل: `leaveRoom()` → `resetState()` → `setView('menu')` → `game.resetGame()` → `setCurrentGameMode('casual')`
   - از race condition بین `setJoinError` و `leaveRoom` جلوگیری می‌کند

5. **Server-Side Leave Grace Period** (`server/wsServer.js`):
   - `LEAVE_GRACE_PERIOD = 5000ms` قبل از broadcast `player_left`
   - اگر user دوباره join کند در این مدت، leave کنسل می‌شود
   - `cancelPendingLeave(userId, channelName)` در `joinChannel`
   - `channel:leave` explicit بلافاصله اجرا می‌شود (بدون grace)

**Fixed Bugs**:
- 🐛 **No cancel button** → دکمه لغو در همه مراحل انتظار اضافه شد
- 🐛 **onPlayerLeft unimplemented** → host و joiner هر دو پیام مناسب می‌بینند و به منو برمی‌گردند
- 🐛 **Multiple leaveRoom calls** → همه cleanup در `joinError` effect متمرکز شد
- 🐛 **No distinction between host/joiner leaving** → پیام متفاوت برای هر کدام

**Files Modified**:
- `App.tsx` — `handleLeaveWaiting()`, `joinError` effect, دکمه لغو در waiting overlay, `onPlayerLeft` handler
- `hooks/useMultiplayerState.ts` — `onPlayerLeft` changed: host → «سازنده بازی انصراف داد», joiner → «حریف بازی را لغو کرد», removed `leaveRoom()`
- `server/wsServer.js` — Grace period implementation (from session 11)

---

### Session 14 (Jun 7, 2026) - Two-Way Merge System (فاز ۱-۳)

**Problem**: Coin flip system picked a single winner for category + size. Joiner's category was completely ignored (line 737: `setCategory(hostCategory)`). Size used `Math.min` which was unfair (always picks the smaller size).

**Solution**: Two-Way Merge system that fairly combines both players' choices:

**Phase 1 — Geometric Mean for Size**:
- `finalSize = Math.round(Math.sqrt(hostSize × guestSize))`
- Host=10, Guest=6 → √60 ≈ 8 (fair middle ground)
- Host=5, Guest=5 → 5 (full agreement)

**Phase 2 — 50/50 Category Merge**:
- 50% words from host's category, 50% from guest's category
- Uses existing `loadMergedCategories()` in `dictionary.ts`
- Alternating slots in `glueWords.ts` solver
- Each player has expertise in their own category's clues

**Phase 3 — Merge Animation**:
- `CoinFlipSelection.tsx` rewritten from winner-takes-all coin flip to merge animation
- Shows progress bar of two selections converging
- Displays geometric mean formula visually
- Shows both category cards side-by-side with 50% labels

**Changes Made**:

1. **`App.tsx` — `handleAcceptChallenge`**: Joiner stores their OWN category + size (not host's). Merge happens later via preference exchange.
2. **`App.tsx` — `handleCoinFlipComplete`**: Computes geometric mean from both preferences, stores both categories as `mergedCategories`.
3. **`App.tsx` — New state `mergedCategories`**: `[Category, Category] | null` — tracks both categories for grid generation.
4. **`App.tsx` — Grid generation effect**: Passes `mergedCategories` to `game.generateGrid()` which calls `loadMergedCategories()` for 50/50 word selection.
5. **`App.tsx` — `multiplayer.startGame()`**: Uses primary category (merged[0]) as label for broadcast.
6. **`CoinFlipSelection.tsx`**: Complete rewrite — merge animation with progress bar, geometric mean display, dual category cards.
7. **`ONLINE_BATTLE_RULES.md`**: New file — complete rules documentation for online battle mode.

**Data Flow**:
```
Host picks size+cat ──┐
                      ├──► Preference Exchange ──► Two-Way Merge ──► Grid Gen (50/50)
Guest picks size+cat ─┘        (via room)         (geometric mean     (loadMergedCategories)
                                                  + both cats)
```

**Files Modified**:
- `App.tsx` — `handleAcceptChallenge`, `handleCoinFlipComplete`, new `mergedCategories` state, grid gen with merged cats
- `components/CoinFlipSelection.tsx` — Complete rewrite to merge animation

**New Files**:
- `ONLINE_BATTLE_RULES.md` — Complete rules documentation for online mode

---

### Session 15 (Jun 7, 2026) - Final Bug Fixes: Room Check, Decline Button, Reconnect, Challenge Rejected

**1. fix: `/api/room/check` used undefined `channels` instead of `wsChannels`**
- `server/index.js:548`: `channels.get(channelName)` → variable `channels` was **undefined** because the import was renamed to `wsChannels` on line 5
- Result: `checkRoom()` always returned `false` → Accept overlay always showed "invite expired"
- Fix: `wsChannels.get(channelName)`

**2. fix: Decline button called non-existent function `gameServer.sendChallengeDeclined`**
- `App.tsx:979`: `gameServer.sendChallengeDeclined(...)` — **never defined** → `TypeError` → `setIncomingChallenge(null)` never ran → overlay stayed visible
- Fix: replaced with existing `gameServer.rejectChallenge()` which does `POST /api/challenge/reject` + WS `challenge:rejected`
- Also clears challenge notifications from local state immediately on decline

**3. fix: Safe WebSocket reconnect in `useSocial.ts` (prevent stale connections)**
- Added `mountedRef` to track component lifecycle
- Stale `connectWS` from old effect closure could fire after cleanup → duplicate connections
- Fixed: `onclose` checks `mountedRef.current` + `playerRef.current` before scheduling reconnect
- Added `reconnectTimerRef` for clean timeout management
- Cleanup clears timer + sets `mountedRef = false`

**4. fix: `challenge_rejected` not closing host's waiting overlay**
- `challenge:rejected` WS message → `onEvent?.('challenge_rejected')` fell through to `showToast(msg)` → showed raw `"challenge_rejected"` text
- Fixed: added proper handler that calls `leaveRoom()` → reset state → `setView('menu')` + toast "حریف دعوت شما را رد کرد"
- Stale closure bug: `view` and `currentGameMode` in `onEvent` callback were stale (captured when `useSocial` effect ran, but effect deps are `[player?.id,...]`, not view-dependent). Removed the `if (view === 'playing' && ...)` guard — cleanup now runs unconditionally.

**5. fix: room existence check before showing challenge settings dialog**
- Accept button on overlay now calls `gameServer.checkRoom(roomId)` FIRST
- If room is gone (host cancelled), shows toast + clears notification **without ever showing the settings dialog**

**Server Management**:
- Server kept dying after shell tool timeouts → switched to `screen -dmS crossword-server` for persistent session
- To restart: `screen -dmS crossword-server bash -c 'cd "/path/server" && node index.js'`

**Build**: ✅ `npm run build` passes (10 commits this session)

---

### Session 16 (Jun 10, 2026) - Final Bug Fixes + Dead Code Cleanup + Merge Ack

**Bug Fixes**:

1. **fix: `challenge:accepted` WS message added** — When joiner clicks Accept, now sends a dedicated WS+HTTP notification to the host (`POST /api/challenge/accept` + WS `challenge:accepted`). Host receives it via useSocial's `onEvent('challenge_accepted')` and shows a toast. This provides a SECOND notification channel alongside presence_sync.

2. **fix: Two-Way Merge race condition with `merge:ack` handshake** — After the merge animation completes, the joiner sends a `merge:ack` broadcast on the room channel. The host waits for this acknowledgment (`mergeAckReceived` state) before generating the grid. This prevents the race where the host would generate the grid before the joiner finished processing the merge result.

3. **fix: CoinFlip double `onComplete` call** — Added `onCompleteCalledRef` to prevent `onComplete` from being called twice (once from the local merge animation and once from the host's broadcast).

4. **fix: `direct_message` WS type added** — Generic direct message support in wsServer.js for future extensibility.

**Dead Code Cleanup**:
- Removed `server/sqliteDb.js` (310 lines, orphaned after sql.js → node:sqlite migration)
- Removed `server/localDb.js` (183 lines, orphaned)
- Removed `sql.js` from `server/package.json` + `npm uninstall`
- Removed `@supabase/supabase-js` from frontend `package.json` (replaced by LocalChannel)
- Removed `RealtimeChannel` type import from `utils/multiplayer.ts`
- Changed `channel` type from `RealtimeChannel | null` to `any`

**Documentation**:
- Updated AGENTS.md (Supabase mention, session 16 history)

**Build**: ✅ `npm run build` passes (1,285 KB bundle, 328 KB gzipped, 3.03s)

---

### Session 17 (Jun 11, 2026) - UI Polish: Victory Confetti, Unified Dialog, Improved Merge Animation, Grid Info on Loading Screens

**Changes Made**:

1. **Unified Challenge Dialog** (`components/SocialPanel.tsx`):
   - Rewrote the `acceptingChallenge` dialog to match the Lobby's "Battle Settings" style (indigo theme, same layout, opponent's settings badge with category icon + size)
   - Changed size display to use geometric mean formula (`Math.round(Math.sqrt(...))`) instead of `Math.min`
   - Removed outdated "(فعلاً فقط دسته حریف استفاده می‌شود)" text
   - Added `acceptingChallenge.senderName` display

2. **Victory Confetti + Floating Emoji** (`App.tsx`):
   - Added a 3-burst confetti sequence for multiplayer winner: gold center burst @0ms → purple left burst @300ms → pink right burst @600ms
   - Added floating animated emoji (👑🎉⭐🌟💫🏆✨) on the winner result screen using Tailwind's `animate-bounce` with staggered delays

3. **Improved Merge Animation** (`components/CoinFlipSelection.tsx`):
   - Added floating particle effects during merge stage (20 colored dots with glow and pulse)
   - Progress bar now speeds up as it progresses (step starts at 3, increases by 0.5 per tick, max 12)
   - Added glow effects on the merge container (gradient overlay, shimmer animation)
   - Category icons now show labels and converge (fade+scale) during merge
   - Added rotating merge icon that scales up
   - Added animated percentage counter with dynamic scale
   - Merged size result now pulses with `animate-pulse` for emphasis
   - Category cards in result stage now have colored shadow glows

4. **Grid Info on Loading Screens** (`App.tsx`):
   - Added final category + size badge to the "Building battle grid..." waiting overlay (emerald/slate badge with `finalCategory` and `finalSize`)
   - Added same badge to the fallback "Preparing..." loading screen for multiplayer mode
   - Badge shows Persian/English category name and size (e.g., "اطلاعات عمومی • ۸×۸")

5. **Loading screen merged categories** (`App.tsx`):
   - Badge now shows both categories when they differ (e.g., "بدن + اطلاعات عمومی • ۸×۸")
   - Shows a single category when both players chose the same one

**Build**: ✅ `npm run build` passes (1,301 KB bundle, 332 KB gzipped, 2.83s)

---

### Session 18 (Jun 11, 2026) - Fix: Safari Notification Not Received + WS Heartbeat

**Bug**: Challenges sent from Safari never reached Chrome recipient, but Chrome→Safari worked fine.

**Root Cause**: Two independent WS connections exist in each browser:
- **WS #1** (`useSocial.ts`) — `global_social` channel for notifications/chat — **HAD NO HEARTBEAT** → silently disconnected
- **WS #2** (`gameServer.ts` `LocalChannel`) — room channels — **HAS heartbeat** (15s ping) → stayed alive

When server called `sendToUser(chromeUserId, notification:new)`, it found Chrome only on WS #2 (room channel), sent the message there, but `LocalChannel.onmessage` didn't handle `notification:new` → **silently dropped**.

**Fixes**:

1. **Heartbeat in `useSocial.ts`** — Added 15s ping interval (matching LocalChannel) to keep `global_social` WS alive:
   - `(ws as any)._heartbeat` interval stored, cleared on close
   - Prevents silent disconnection of the notification channel

2. **Defense-in-depth in `gameServer.ts`** — `LocalChannel.onmessage` now handles `notification:new`:
   - Dispatches `window` CustomEvent `notification:new` with the notification detail
   - `useSocial.ts` listens for this event and adds to notifications state
   - Catches the edge case where notification arrives on the wrong WS

3. **`sendToUser` logging** (`server/wsServer.js`):
   - Added `console.warn` when target user not found in any channel
   - Previously failed silently — now visible in server logs

**Loading Screen Fix**: Badge now uses `mergedCategories` (when available):
   - Same categories → single label (e.g., "بدن • ۸×۸")
   - Different categories → combined label (e.g., "بدن + اطلاعات عمومی • ۸×۸")
   - Falls back to `finalCategory` when `mergedCategories` not yet set

**Build**: ✅ `npm run build` passes (1,302 KB bundle, 332 KB gzipped, 3.10s)

---

### Session 18 (Jun 11, 2026) - Fix: Safari Notification Not Received + WS Heartbeat

**Bug**: Challenges sent from Safari never reached Chrome recipient, but Chrome→Safari worked fine.

**Root Cause**: Two independent WS connections exist in each browser:
- **WS #1** (`useSocial.ts`) — `global_social` channel for notifications/chat — **HAD NO HEARTBEAT** → silently disconnected
- **WS #2** (`gameServer.ts` `LocalChannel`) — room channels — **HAS heartbeat** (15s ping) → stayed alive

When server called `sendToUser(chromeUserId, notification:new)`, it found Chrome only on WS #2 (room channel), sent the message there, but `LocalChannel.onmessage` didn't handle `notification:new` → **silently dropped**.

**Fixes**:

1. **Heartbeat in `useSocial.ts`** — Added 15s ping interval (matching LocalChannel) to keep `global_social` WS alive:
   - `(ws as any)._heartbeat` interval stored, cleared on close
   - Prevents silent disconnection of the notification channel

2. **Defense-in-depth in `gameServer.ts`** — `LocalChannel.onmessage` now handles `notification:new`:
   - Dispatches `window` CustomEvent `notification:new` with the notification detail
   - `useSocial.ts` listens for this event and adds to notifications state
   - Catches the edge case where notification arrives on the wrong WS

3. **`sendToUser` logging** (`server/wsServer.js`):
   - Added `console.warn` when target user not found in any channel
   - Previously failed silently — now visible in server logs

4. **Auth error fallback** (`useSocial.ts`): When Chrome has an expired auth token, the WS auth fails with `auth_error`. Previously the handler just `return`ed — never joining `global_social`, leaving Chrome with **no notification channel**. Now on `auth_error`, the token is cleared and the user joins `global_social` as a guest.

5. **Duplicate `sendChallengeAccepted` removed** (`utils/gameServer.ts`): Two identical function definitions caused a build warning; the dead duplicate was removed.

**Loading Screen Fix**: Badge now uses `mergedCategories` (when available):
   - Same categories → single label (e.g., "بدن • ۸×۸")
   - Different categories → combined label (e.g., "بدن + اطلاعات عمومی • ۸×۸")
   - Falls back to `finalCategory` when `mergedCategories` not yet set

**Build**: ✅ `npm run build` passes (1,302 KB bundle, 332 KB gzipped, 3.10s)

---

### Session 18 (Jun 11, 2026) - Fix: Safari Notification Not Received + WS Heartbeat

**Bug**: Challenges sent from Safari never reached Chrome recipient, but Chrome→Safari worked fine.

**Root Cause**: Two independent WS connections exist in each browser:
- **WS #1** (`useSocial.ts`) — `global_social` channel for notifications/chat — **HAD NO HEARTBEAT** → silently disconnected
- **WS #2** (`gameServer.ts` `LocalChannel`) — room channels — **HAS heartbeat** (15s ping) → stayed alive

When server called `sendToUser(chromeUserId, notification:new)`, it found Chrome only on WS #2 (room channel), sent the message there, but `LocalChannel.onmessage` didn't handle `notification:new` → **silently dropped**.

**Fixes**:

1. **Heartbeat in `useSocial.ts`** — Added 15s ping interval (matching LocalChannel) to keep `global_social` WS alive:
   - `(ws as any)._heartbeat` interval stored, cleared on close
   - Prevents silent disconnection of the notification channel

2. **Defense-in-depth in `gameServer.ts`** — `LocalChannel.onmessage` now handles `notification:new`:
   - Dispatches `window` CustomEvent `notification:new` with the notification detail
   - `useSocial.ts` listens for this event and adds to notifications state
   - Catches the edge case where notification arrives on the wrong WS

3. **`sendToUser` logging** (`server/wsServer.js`):
   - Added `console.warn` when target user not found in any channel
   - Previously failed silently — now visible in server logs

4. **Auth error fallback** (`useSocial.ts`): When Chrome has an expired auth token, the WS auth fails with `auth_error`. Previously the handler just `return`ed — never joining `global_social`, leaving Chrome with **no notification channel**. Now on `auth_error`, the token is cleared and the user joins `global_social` as a guest.

5. **Duplicate `sendChallengeAccepted` removed** (`utils/gameServer.ts`): Two identical function definitions caused a build warning; the dead duplicate was removed.

6. **Direct challenge polling** (`App.tsx`): Added a dedicated 2-second HTTP polling cycle for challenge notifications. This catches challenges even when WebSocket delivery fails.

**Loading Screen Fix**: Badge now uses `mergedCategories` (when available):
   - Same categories → single label (e.g., "بدن • ۸×۸")
   - Different categories → combined label (e.g., "بدن + اطلاعات عمومی • ۸×۸")
   - Falls back to `finalCategory` when `mergedCategories` not yet set

**Build**: ✅ `npm run build` passes (1,302 KB bundle, 332 KB gzipped, 3.10s)

---

### Session 19 (Jun 11, 2026) - Fix: Opponent Score Zero + Floating Emoji Sync

**Bug 1 — Opponent score shows 0 after game ends**:
- `handleGameOverEvent` in `useMultiplayerState.ts` received `loserScore` from the `game_over` broadcast but **ignored it**, using React state `opponentScore` instead (defaults to 0)
- Fix: Changed line 158 to prefer the broadcast `loserScore`, falling back to React state only if undefined

**Bug 2 — Floating emojis not synced**:
- `floatingEmojis` state was populated by `spawnFloatingEmoji` but **never rendered** in any component
- Battle attack handlers (freeze, blind) never called `spawnFloatingEmoji` for either sender or receiver
- Fixes:
  - Added `floatingEmojis` prop to `GameView.tsx` and rendered emoji elements in the grid area
  - Added `spawnFloatingEmoji(emoji)` calls in both `handleAttack` (sender, GameView.tsx) and `handleAttackReceived` (receiver, useMultiplayerState.ts) for freeze and blind attacks
  - Passed `floatingEmojis` from App.tsx to GameView

**Build**: ✅ `npm run build` passes (1,303 KB bundle, 333 KB gzipped, 2.95s)

---

### Session 20 (Jun 11, 2026) - League Trophy Integration + Build Verification

**Changes Made**:

1. **League Trophy Changes Applied on Multiplayer Result**:
   - `App.tsx`: Added `useEffect` that fires when `multiplayerState.finalResult.status` changes → calls `gameServer.applyMultiplayerResult()` with win/loss and opponent trophies
   - Computes `trophyChange` state from the difference between old and new trophy count
   - Stores updated `PlayerState` back via `setPlayer()`

2. **Trophy Change Display in Result Screen**:
   - Added gold trophy badge (▲ green for gain, ▼ red for loss) in multiplayer game summary section
   - Shows current trophy count (e.g., "Current trophies: 1250")
   - Positioned before the "Deciding factor" badge

3. **`MultiPlayerInfo` type extension**:
   - `types.ts` - Added optional `trophies?: number` field to `MultiPlayerInfo` for opponent trophy information

4. **State additions**:
   - `App.tsx` - Added `trophyChange` state (default 0) for display in result screen

**Build**: ✅ `npm run build` passes (1,317 KB bundle, 337 KB gzipped, 3.56s)

---

### Session 21 (Jun 11, 2026) - Matchmaking System (Quick Match Queue)

**Problem**: «شروع مسابقه» (Quick Match) button was calling `onCreate` directly — creating a private room and waiting, instead of searching for an opponent in a shared pool. Two players clicking it simultaneously each got their own room.

**Solution**: Full matchmaking queue with server-side matching:

**Server** (`server/index.js`):
- Added `matchmakingQueue` in-memory array with 30s timeout per entry
- `/api/matchmaking/join` — checks queue for compatible match (same mode + wager). If found, creates room + returns `{status:'matched', roomId, isHost, opponent}` to joiner + sends WS `matchmaking:matched` to host. If not found, adds to queue and returns `{status:'waiting'}`
- `/api/matchmaking/leave` — removes player from queue
- `/api/matchmaking/status` — poll endpoint for first player (returns `waiting/timeout/unknown`)
- Stale entries cleaned every 5s via `setInterval`
- `sendToUser()` called with `matchmaking:matched` WS event to host

**Frontend WebSocket** (`hooks/useSocial.ts`):
- Added `matchmaking:matched` → `onEvent('matchmaking_matched', rawMsg)` handler
- Added `matchmaking:timeout` → `onEvent('matchmaking_timeout')` handler

**Matchmaking API** (`utils/gameServer.ts`):
- `joinMatchmaking(playerId, name, avatar, mode, wager, trophies)` — POST to server
- `leaveMatchmaking(playerId)` — POST to remove from queue
- `checkMatchmakingStatus(playerId)` — POST to poll

**App.tsx**:
- Added `isMatchmaking`, `matchmakingStatus`, `matchmakingOpponentRef`, `matchmakingPollRef`, `matchmakingHandlerRef` state/refs
- `handleQuickMatch()` — joins matchmaking queue. If `status === 'matched'`, immediately joins room. If `waiting`, starts 2s polling and shows search overlay
- `handleMatchmakingCancel()` — leaves queue, clears polling, resets to menu
- `handleMatchmakingMatched()` (via WS `matchmakingHandlerRef`) — host receives via WS, creates room with `createRoomWithId`. Joiner receives via HTTP response, calls `handleJoinRoom`
- Matchmaking search overlay with animated spinner + bouncing dots + cancel button

**useMultiplayerState.ts**:
- Added `createRoomWithId(roomId, mode, ...)` — same as `createRoom()` but uses provided roomId instead of generating one. Exposed in return

**Lobby.tsx**:
- Added `onQuickMatch` prop
- Quick Match button calls `onQuickMatch || onCreate` — falls back to old behavior if no matchmaking handler

**Flow**:
```
Player A clicks "شروع مسابقه":
  1. POST /api/matchmaking/join → { status: 'waiting' }
  2. Show search overlay, poll every 2s
  3. ← WS matchmaking:matched { roomId, isHost: true, opponent }
  4. createRoomWithId(roomId) → subscribe + track
  5. Show "Waiting for opponent..." overlay

Player B clicks "شروع مسابقه":
  1. POST /api/matchmaking/join → { status: 'matched', roomId, isHost: false, opponent }
  2. handleJoinRoom(roomId) → subscribe + track
  3. Both detect each other via presence_sync
  4. Normal Two-Way Merge + grid gen continues
```

**Build**: ✅ `npm run build` passes (1,323 KB bundle, 338 KB gzipped, 3.40s)

---

## 🐛 Session History

### Session 5 (Oct 3, 2026) — Phases 1–6: stability, security, engine, cleanup

**Phase 3 — Security & economy (`server/`)**
- `PostgresDB.js`: the whole schema/migration/seed pipeline was dead (guards on `this.connected` which is set *after* those calls). Fixed to guard on `this.pool`; added a `ready` promise awaited by `db/index.js`.
- Added `password_hash` / `card_progress` columns + `difficulty TEXT` migration; `_bulkInsert` now injects a UUID when a seed row has no `id`.
- Real password hashing: scrypt (`N=16384,r=8,p=1`) + legacy SHA-256 verify + transparent upgrade.
- Hardened authz: IDOR on `/api/:table`, arena participant-only payout + double-pay race, identity-bound matchmaking/player-left/room-register, notification ownership, `MAX_COINS` clamp. Stopped leaking `password_hash`.

**Phase 4 — Multiplayer reliability**
- `wsServer.js`: `INSTANCE_ID`/`_origin` fixes the inverted Redis broadcast; `userSockets` index makes `sendToUser` work before a channel join (fixed matchmaking host never being notified).
- `redis.js`: never give up reconnecting.
- `utils/gameServer.ts`: `getPlayerState()` is token-first with `/api/me`.

**Phase 5 — Engine & content**
- **Solver now runs in a real Web Worker.** `dictionary.ts` exports serializable solver state; `workers/solver.worker.ts` restores it; `runSolver.ts` posts the grid+state and falls back to synchronous `fillGrid` on any error/timeout. Root cause of the old "worker never worked": `utils/debug.ts` referenced `window` at module load (crashes in a Worker) — now guarded.
- `gridLogic.ts`: added `validateFilledGrid()`; `fillGrid` rejects grids with empty/isolated white cells (prevents an instant false win).
- `useHintSystem.ts`: no longer mutates the `powerRevealedCells` Set in place (highlight now renders).
- `useGameLogic.ts`: removed setState side effects from updaters (rage interval + monster attack) via refs + a loss effect (StrictMode-safe).
- `useTowerModeV2.ts` / `useTowerActions.ts`: stale `floorConfig` fixed — reward/size resolved from the requested floor.
- `dictionary.ts`: RegExp metacharacters escaped in `getMatchingWords`.
- `freeformGenerator.ts`: dedupes by normalized word; removed 73 within-chapter duplicate word entries across 11 story word files.
- `useChallengeSystem.ts` / `useSocial.ts`: tracked + cleared leaked timers; bounded `processedChallenges`.
- `useMatchmakingActions.ts`: matchmaking handler no longer frozen to the first render (stale closure).
- `multiplayer.ts`: `subscribeWithRetry()` performs real retries (the old code only logged "Retrying…" then rethrew).

**Phase 6 — Cleanup, tests & docs**
- Fixed 5 `getUser {data}` shape bugs (friend/challenge notifications showed «ناشناس»).
- `pushPendingNotification()` centralizes the per-user pending cap using `MAX_PENDING_NOTIFS`.
- Guarded `localStorage.setItem` against quota/unavailable errors.
- Added `npm run test:mp` (`scripts/mp_e2e.cjs`) — two-client protocol E2E (21 checks).

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `npm run test:mp` **21/21** · two-browser UI test (arena create → join → coin flip → merge → synced game → opponent leaves → «🏆 پیروزی!») · grid generation confirmed on the worker path (no sync fallback).

---

### Session 6 (Oct 3, 2026) — World Map: 20 اسطوره‌ی جدید فوتبال (۱۰ قدیمی + ۱۰ جدید)

**درخواست**: دقیقاً مثل ۵ اسطوره‌ی قبلی (مسی، مارادونا، رونالدو، پله، زیدان)، برای ≥۱۰ اسطوره‌ی قدیمی و ≥۱۰ اسطوره‌ی جدید مسیر کامل زندگی + کارت‌های جدول ساخته و روی نقاط مختلف نقشه جایگذاری شود.

**اسطوره‌های جدید (هر کدام ۴ فصل، هر فصل ۱۰ کلمه با سرنخ فارسی + داستان fa/en + متن پیروزی):**
- **قدیمی**: کرویف (NL)، بکن‌باوئر (DE)، رونالدینیو (BR)، رونالدو نازاریو (BR)، مالدینی (IT)، اوزه‌بیو (PT)، پوشکاش (HU)، یاشین (RU)، بست (GB)، پلاتینی (FR)
- **جدید**: نیمار (BR)، امباپه (FR)، هالند (NO)، دی بروین (BE)، مودریچ (HR)، صلاح (EG)، لواندوفسکی (PL)، اینیستا (ES)، سون (KR)، فن‌دایک (NL)

**فایل‌های جدید**: `data/worldMapExtra/{oldLegendsA,oldLegendsB,modernLegendsA,modernLegendsB}.ts` (۳۳۷۱ خط). هر فایل علاوه بر آرایه‌ی هر اسطوره، یک مپ تجمیعی (`OLD_LEGENDS_X_CHAPTERS` / `..._FINAL`) هم export می‌کند.

**فایل‌های تغییریافته**:
- `components/WorldMap.tsx` — ۲۰ ورودی جدید + رنگ‌های گروهی. مختصات هر بازیکن از bbox کشورش در `public/images/world-map.svg` محاسبه و داخل مرز کشورش قرار گرفت (برزیل ۴، فرانسه ۳، هلند ۲ اسطوره — با فاصله‌گذاری دستی).
- `data/worldMapData.ts` — spread کردن مپ‌های جدید در `WORLD_MAP_CHAPTERS` و `LEGEND_FINAL_STORIES`.
- `data/legendImages.ts` — گرادیان اختصاصی برای هر ۲۰ اسطوره.

**بهبود ساختاری**: آرایه‌ی `chapters` هر اسطوره در `WorldMap.tsx` حالا با `legendChapters()` از `getLegendChapters()` ساخته می‌شود (قبلاً دستی کپی می‌شد و از محتوا جدا افتاده بود — مثلاً مارادونا در رجیستری ۳ فصل داشت ولی محتوا ۶ فصل بود). حالا شمارنده‌ی `level/N`، لیست فصل‌ها و نقطه‌های مدار همیشه با محتوای قابل‌بازی یکی است.

**باگ پیدا و رفع‌شده**: شناسه‌های فصل لواندوفسکی با پیشوند `lewa_` نوشته شده بودند ولی شناسه‌ی اسطوره `lewandowski` است؛ این باعث می‌شد گرادیان پس‌زمینه‌اش بیفتد. به `lewandowski_*` اصلاح شد.

**جمع کل نقشه**: **۲۵ اسطوره، ۱۰۹ فصل** (۵ اسطوره‌ی قبلی + ۲۰ جدید).

**Verification**: `tsc --noEmit` clean · `npm run build` OK (WorldMap 11.53 kB، WorldMapChapters 22.70 kB) · اسکریپت اعتبارسنجی (esbuild-bundled) → ۲۵ اسطوره / ۲۵ مپ محتوا / ۲۵ داستان پایانی / ۱۰۹ فصل، همه‌ی پیشوندها == شناسه‌ی اسطوره · تست مرورگر: هر ۲۵ نشانگر رندر می‌شوند و تعداد فصل‌های هر کدام با محتوا می‌خواند (مسی ۷، مارادونا ۶، رونالدو ۶، پله ۵، زیدان ۵، بقیه ۴) · تولید جدول برای یک اسطوره از **هر ۴ فایل** تأیید شد (مودریچ، هالند، یاشین، رونالدینیو — سرنخ‌های فعال مستقیماً از محتوای جدید آمدند).

**نکته**: `marker` کریستیانو رونالدو روی (422,350) عمداً بیرون bbox پرتغال است (جزیره‌ی مادیرا). آن را «درست» نکنید.

---

### Session 7 (Oct 4, 2026) — زوم/پَن روی نقشه جهان + رفع ازدحام برچسب‌ها

**درخواست**: قابلیت zoom in / zoom out روی نقشه، هم با موس و هم با جسچر دست؛ چون در بعضی نقاط (خوشه‌ی اروپا) نشانگرها آن‌قدر فشرده‌اند که نمی‌شود فهمید اسم کدام بازیکن است یا درست انتخابش کرد.

**پیاده‌سازی در `components/WorldMap.tsx`** (تنها فایل تغییریافته):
- **مدل زوم**: یک `<g transform="translate(tx ty) scale(s)">` دور تصویر نقشه + نشانگرها. `s ∈ [1, 9]`. تبدیل با `clampView()` محدود می‌شود تا نقشه هیچ‌وقت از کادر بیرون نزند (`tx ∈ [W(1-s), 0]`).
- **چرخ ماوس** → زوم حول نقطه‌ی نشانگر. **پینچ ترک‌پد** (`wheel` با `ctrlKey`) → زوم. **اسکرول دو انگشتی ترک‌پد** (delta کسری) → پَن. تشخیص با هیوریستیک: `ctrlKey` یا (deltaX==0 و |deltaY|>=40 و عدد صحیح). شنونده‌ی `wheel` به‌صورت native و `{passive:false}` وصل می‌شود (React رویداد wheel را passive ثبت می‌کند).
- **درگ با موس** → پَن. **دو انگشت روی تاچ** → پینچ + پَن.
- **پینچ بدون لرزش**: در شروع جسچر، فاصله‌ی مبنا + مقیاس مبنا + نقطه‌ی نقشه‌ی زیر وسط انگشتان ذخیره می‌شود؛ هر حرکت از همین مبنا بازمحاسبه می‌شود (نه از رویداد قبلی) — وگرنه پَن دو انگشتی باعث دریفت زوم می‌شد (تست: ۱.۳۶ → ۱.۰۷).
- **نشانگرها اندازه‌ی ثابت روی صفحه دارند**: همه‌ی اندازه‌ها در `1/scale` ضرب می‌شوند تا با زوم بزرگ نشوند (مثل نقشه‌های واقعی).
- **دکمه‌های + / − / بازنشانی** + نمایش درصد زوم در گوشه، و یک نوار راهنما پایین نقشه.
- **دوبار کلیک** روی فضای خالی → زوم.

**رفع ازدحام برچسب (label declutter)**: در هر رندر، برچسب‌ها به‌ترتیب اولویت (انتخاب‌شده/هاور > آنلاک‌شده > ترتیب نقشه) حریصانه چیده می‌شوند و هر برچسبی که با برچسب قبلی برخورد کند پنهان می‌شود. در ۱۰۰٪ حدود ۱۵ نام دیده می‌شود و بقیه با زوم ظاهر می‌شوند (در ۹۰۰٪ هر ۲۵ نام). نوار راهنما تعداد نام‌های پنهان را نشان می‌دهد. اندازه‌ی متن برچسب با زوم کمی رشد می‌کند (سقف ۱.۷ برابر) و ریاضیات برخورد با همان ضریب هم‌خوان نگه داشته شده.

**مدار فصل‌های اسطوره‌ی انتخاب‌شده**: نقاط مدار همیشه رسم می‌شوند، اما **عنوان فصل‌ها فقط از زوم ۱۸۰٪ به بالا** نمایش داده می‌شود (`showOrbitTitles = view.scale >= 1.8`). در ۱۰۰٪ این متن‌های ریز در خوشه‌ی اروپا فقط شلوغی اضافه می‌کردند؛ لیست کامل فصل‌ها در پنل پایین نقشه هست.

**دو باگ ظریف که در تست پیدا و رفع شد**:
1. **`setPointerCapture` رویداد `click` را به `<svg>` منتقل می‌کند**، پس `onClick` نشانگرها هرگز اجرا نمی‌شد. انتخاب در `pointerup` و با hit-test دستی انجام می‌شود.
2. **hit-test ساده نشانگر اشتباه را انتخاب می‌کرد**: در خوشه‌ی هلند (کرویف و فن‌دایک ~۱۰ واحد فاصله)، دایره‌های لمس روی هم می‌افتند و `elementFromPoint` بالاترین (آخری در DOM) را برمی‌گرداند. حالا `pickNearestMarker()` نزدیک‌ترین نشانگر را انتخاب می‌کند. تست در ۱۰۰٪ / ۱۹۳٪ / ۳۰۰٪: هر دو به‌درستی و جداگانه انتخاب می‌شوند.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · تست مرورگر (agent-browser) با رویدادهای مصنوعی: چرخ ماوس ✓، پینچ ترک‌پد ✓، پَن دو انگشتی ✓، درگ ✓، پینچ دو انگشتی ✓ با صفر دریفت زوم ✓، کلمپ ۱۰۰٪–۹۰۰٪ ✓، انتخاب نشانگر در حالت زوم ✓، شروع فصل از روی نقشه‌ی زوم‌شده ✓، بستن پنل با کلیک روی دریا ✓، درگ باعث انتخاب/لغو انتخاب نمی‌شود ✓، ۲۵/۲۵ برچسب در ۹۰۰٪ ✓.

**تست عدم رگرسیون**: `npm run test:mp` → **۲۱/۲۱** · بازی سریع از منو: جدول ساخته شد، سرنخ نمایش داده شد، تایمر روشن، بدون هشدار fallback ورکر ✓ · نقشه با ۲۵ نشانگر سالم ✓ · عنوان‌های مدار در ۱۰۰٪ پنهان و در ۲۴۱٪ نمایان ✓.

---

### Session 8 (Oct 23, 2026) — خودترمیمی اتاق آنلاین + رفع باگ «اتصال حریف» در حالت رنکد

**باگ گزارش‌شده**: در مسابقه‌ی رنکد، یک بازیکن مراحل merge را می‌دید و جدول برایش ساخته می‌شد، اما بازیکن دیگر تا ابد روی «اتصال حریف» می‌ماند.

**ریشه‌ی مشکل**: پروتکل اتاق کاملاً fire-and-forget بود. `presence_sync` فقط یک‌بار هنگام join فرستاده می‌شد و `player_preference` / `coin_flip_result` / `start_game` هم فقط یک broadcast داشتند. اگر یک فریم (هنگام subscribe دیرهنگام یا reconnect) گم می‌شد، هیچ‌چیز آن را دوباره نمی‌فرستاد؛ آن سمت هیچ‌وقت حریف را نمی‌دید و در `MultiplayerWaitingOverlay` می‌ماند. در لاگ واقعی (room_242436) بازیکن دوم join شده بود ولی هیچ preference‌ای نفرستاده بود و حریف را ندیده بود.

**راه‌حل — کش و بازپخش وضعیت اتاق در سرور** (`server/wsServer.js`):
- سه کش سبک برای هر `room_*`: `roomPreferences` (per-user)، `roomMergeResults` (coin_flip_result) و `roomStartGames` (start_game).
- `presence_sync` حالا `preferences[]` و `mergeResult` را هم حمل می‌کند؛ `buildPresenceMessage()` تنها سازنده‌ی این پیام است (join، leave، mirror ردیس، heartbeat).
- هارت‌بیت اتاق هر ۴ ثانیه `presence_sync` را تکرار می‌کند (تا وقتی `start_game` ثبت شود) — دیگر یک فریم گم‌شده باعث بن‌بست نمی‌شود.
- پیام جدید `room:sync` (به کلاینت هدف) برای درخواست فوری همان وضعیت؛ در allowlist مهمان هم اضافه شد.
- `request_game_data` حالا از کش `start_game` مستقیماً به درخواست‌کننده پاسخ می‌دهد (`senderId:'server'`) تا به ارسال مجدد هاست وابسته نباشد.
- کش فقط وقتی اتاق خالی شود پاک می‌شود (با احترام به grace period پنج‌ثانیه‌ای).

**سمت کلاینت**:
- `net/LocalChannel.ts`: `userId` حالا از `data.id` ست می‌شود (قبلاً همیشه `'guest'` بود و فیلتر فرستنده کار نمی‌کرد)؛ بازپخش `preferences`/`mergeResult` از `presence_sync` با dedupe بر اساس امضا؛ متد `requestSync()`.
- `utils/multiplayer.ts`: فیلتر preference خودی (کش سرور ممکن است pref خودمان را برگرداند)؛ `requestSync()`.
- `hooks/useMultiplayerState.ts`: پولینگ `room:sync` هر ۲.۵ ثانیه تا وقتی حریف دیده شود؛ dedupe روی `opponentPreference`؛ جلوگیری از تغییر هویت آبجکت `opponent` در هارت‌بیت (`prev.id === p.id`).
- `hooks/useCoinFlip.ts`: بازاعلام preference هر ۳ ثانیه تا رسیدن preference حریف (حداکثر ۱۰ تلاش).

**باگ دوم (همان مسیر)**: صف matchmaking در Redis و fallback حافظه‌ای، ورودی‌های رهاشده را بدون بررسی سن match می‌کرد؛ بازیکن تازه با «شبح» جفت می‌شد و در اتاقی می‌ماند که کسی نمی‌آید. حالا در Lua (`ZREMRANGEBYSCORE`) و در fallback حافظه‌ای ورودی‌های قدیمی‌تر از ۳۰ ثانیه قبل از match حذف می‌شوند.

**باگ سوم (پول واقعی)**: KV در `server/redis.js` هیچ fallback حافظه‌ای نداشت؛ بدون Redis، رکورد escrow و settle ناپدید می‌شد → دوبار debit و عدم پرداخت pot. حالا `set/get/del/setIfNotExists` یک fallback حافظه‌ای با TTL و سقف ۵۰۰۰ کلید دارند (تک‌پروسه، atomic به‌خاطر single-threaded بودن Node). وقتی Redis وصل است، مقدار remote معتبر است و local فقط در خطا استفاده می‌شود.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `npm run test:mp` → **۳۷/۳۷** (قبلاً ۲۶/۳۷ به‌خاطر نبود Redis) · تست پروتکل خام (`/tmp/cw-protocol.cjs`) → **۶/۶**: دریافت preference کش‌شده توسط join دیرهنگام، `room:sync`، بازپخش mergeResult، بازپخش start_game، توقف heartbeat بعد از start، پاک‌شدن کش با خالی‌شدن اتاق · تست دو مرورگر مجزا (CDP) ۴ بار: هر دو سمت merge + جدول را کامل می‌گیرند · تست تزریق خطا با حذف ۸ ثانیه‌ای همه‌ی `presence_sync`های یک کلاینت: همان کلاینت با پولینگ `room:sync` خودش را بازیابی کرد و بازی کامل شد.

---

### Session 9 (Oct 23, 2026) — ارسال preference در لحظه‌ی join + کوتاه‌کردن انتظار هاست

**باگ گزارش‌شده (room_914913)**: میزبان (مهسا) فقط «🔗 اتصال به حریف» را می‌دید و کارت مهمان «در انتظار انتخاب...» بود، در حالی که مهمان (مهدی) مراحل merge را می‌دید و جدول برایش ساخته می‌شد؛ میزبان حدود ۴۶ ثانیه پشت همان صفحه می‌ماند.

**ریشه‌ی مشکل (از لاگ سرور)**: مهمان هرگز هیچ `player_preference`ای broadcast نکرد؛ میزبان اما preference خودش را ۱۲ بار (هر ۳ ثانیه) فرستاد و بعد از ۴۵ ثانیه fallback را اجرا کرد. یعنی شرط ارسال preference در `useCoinFlip` به دیده‌شدن حریف (`opponent`) گره خورده بود و یک کلاینت که حریف را دیر/اصلاً نمی‌دید، هیچ‌وقت انتخابش را اعلام نمی‌کرد.

**راه‌حل** (`hooks/useCoinFlip.ts`):
- اعلام preference از «وقتی حریف دیده شد» به «وقتی اتاق join شد» منتقل شد (`roomId || opponent`). سرور این broadcast را کش می‌کند و از طریق `presence_sync` به حریف می‌رساند، پس اعلام زودهنگام بی‌خطر و کافی است.
- حلقه‌ی بازاعلام هر ۱.۵ ثانیه دیگر به وجود `opponent` نیاز ندارد (تا رسیدن preference حریف، حداکثر ۲۰ تلاش).
- fallback میزبان از **۴۵ ثانیه به ۱۲ ثانیه** کاهش یافت تا یک حریف ساکت/کلاینت قدیمی نتواند میزبان را در «اتصال به حریف» نگه دارد.
- `roomId?: string | null` به اینترفیس `CoinFlipMultiplayerState` اضافه شد (App از قبل آن را پاس می‌داد).

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `npm run test:mp` → **۳۷/۳۷** · تست پروتکل خام → **۶/۶** · دو مرورگر: هر دو preference را درست هنگام join (بدون دیدن حریف) فرستادند و کل مسیر merge تا جدول ~۵ ثانیه شد · تست «حریف ساکت» (حذف تمام `player_preference`های خروجی کلاینت دوم): میزبان دقیقاً در ثانیه‌ی ۱۲ fallback را اجرا کرد، `start_game` فرستاد و هر دو بازیکن ۸×۸ بازی مشترک را دیدند.

---

### Session 10 (Oct 23, 2026) — ریشه‌ی واقعی باگ رنکد: نشست منقضی = «مهمانِ بی‌صدا» در اتاق

**نشانه‌ی قطعی (از `/tmp/crossword-server.log`)**: در هر ۶ اتاق واقعی (289368, 601638, 914913, 481805, 546586, 147150) فقط برای «مهسا» لاگ `[battle/escrow]` ثبت شده و برای «مهدی» **هیچ‌وقت** — نه escrow، نه یک broadcast. هیچ کلاینتِ قدیمی‌ای نمی‌تواند وارد صف matchmaking (ساخته‌شده در ژوئن ۲۰۲۶) شود، پس فرض «باندل ماه‌ها قدیمی» منتفی بود.

**ریشه‌ی مشکل**: JWT پیش‌فرض ۲۴ ساعته است. تب/نشستی که از یک روز بیشتر باز مانده، پروفایل معتبر در localStorage دارد ولی توکنش مرده است:
- `useSocial` روی `auth_error` توکن را پاک می‌کرد؛ `LocalChannel` هم بدون تلاش برای تازه‌سازی به guest سقوط می‌کرد.
- سرور در `wsServer.js` برای سوکت **غیراحراز‌شده** فقط `channel:join` (مهمان)، `global_social`، ping، leave و `room:sync` را مجاز می‌کرد؛ `channel:broadcast` رد می‌شد.
- نتیجه: آن بازیکن در اتاق دیده می‌شد و broadcastهای حریف را می‌گرفت، اما preference / coin_flip_result / merge_ack او هیچ‌وقت نمی‌رسید. سمت مقابل تا ابد منتظر می‌ماند؛ دقیقاً همان گزارش کاربر.
- `/api/battle/escrow` هم 401 می‌داد و `escrowWagerFor` همه‌ی خطاها غیر از «سکه کافی نیست» را نادیده می‌گرفت → ورود به مسابقه‌ی شرطی بدون پرداخت (pot یک‌طرفه).

**راه‌حل**:
- `server/wsServer.js`: مهمانی که واقعاً به یک `room_*` join کرده، حالا داخل همان اتاق broadcast می‌کند (`isJoinedRoomBroadcast`). broadcast مهمان به اتاقی که join نکرده هنوز رد و **لاگ** می‌شود. تسویه‌ی `game_over` همچنان فقط با هویت سوکت احراز‌شده انجام می‌شود.
- `api/client.ts`: تابع `refreshToken()` (dedupe شده) با `POST /login` و `player_state.id` توکن تازه می‌سازد؛ `api()` هم از همان استفاده می‌کند و حالا `error.status` را ست می‌کند.
- `net/LocalChannel.ts`: اگر توکنی در storage نباشد ابتدا `refreshToken()` را امتحان می‌کند؛ روی `auth_error` یک‌بار با توکن تازه روی **همان سوکت** دوباره `auth` می‌فرستد و فقط در صورت شکست به guest می‌رود.
- `hooks/useSocial.ts`: به‌جای پاک‌کردن توکن، همان مسیر refresh → re-auth → guest.
- `hooks/useMatchmakingActions.ts` + `utils/gameServer.ts`: خطای 401 در escrow حالا مسابقه را با پیام «نشست منقضی شده؛ دوباره وارد شوید» متوقف می‌کند.

**محافظت اضافی (defense-in-depth)**:
- `PROTOCOL_VERSION = 3` در `utils/config.ts`؛ `LocalChannel` آن را روی هر `channel:join` می‌فرستد و `player_joined` هم آن را حمل می‌کند. `isPeerOutdated()` در `utils/multiplayer.ts` حریفِ بدون `proto` (باندل قدیمی) را تشخیص می‌دهد؛ `useMultiplayerState` بنر هشدار در `MergeLobby` نشان می‌دهد و پس از ۸ ثانیه از مسیر `joinError` (با استرداد شرط) خارج می‌شود. سرور هم ناهم‌خوانی نسخه را در `logProtocolMismatch()` لاگ می‌کند.
- `vite.config.ts`: پلاگین dev-only `cg-build-stamp` که روی هر تغییر سورس، stamp را عوض می‌کند؛ صفحه `/__build_stamp` را هر ۶ ثانیه poll می‌کند و تبِ جامانده را reload می‌کند.

**Verification**: `tsc --noEmit` clean · `node --check server/wsServer.js` OK · `npm run build` OK · `/tmp/cw-guest-broadcast.cjs` → **۱۰/۱۰** (join مهمان، دریافت/ارسال preference و merge_ack، حضور `proto=3` برای هر دو، رد broadcast مهمان در اتاقی که join نکرده) · `/tmp/cw-protocol.cjs` → **۶/۶** · `npm run test:mp` → **۳۷/۳۷** · دو مرورگر CDP: هر دو در ثانیه‌ی ۱۲ بازی همگام با یک جدول و یک سرنخ (`#1 ساز چوپان`) بودند.

---

### Session 11 (Oct 23, 2026) — همگام‌سازی جدول آنلاین: فقط کلمه‌ی کامل، فقط خانه‌های خالی

**باگ گزارش‌شده**: در مسابقه‌ی آنلاین هر حرف درستی که تایپ می‌شد، بلافاصله در جدول حریف هم می‌نشست. باید فقط وقتی یک کلمه کامل و درست شد به حریف برود، و سمت حریف تنها خانه‌هایی پر شوند که خودش هنوز پر نکرده است.

**ریشه**: `hooks/useNavigation.ts` بعد از هر کلید درست، رویداد `cell_fill` را برای همان یک خانه broadcast می‌کرد (علاوه بر `word_solved` در پایان کلمه). گیرنده (`handleCellFill` در `useMultiplayerState.ts`) مقدار را بی‌قید‌و‌شرط در `userGrid` می‌نوشت — و حتی `handleWordSolved` هم خانه‌های پرشده را با مقدار ورودی بازنویسی می‌کرد.

**تغییرات**:
- `hooks/useNavigation.ts`: ارسال `cell_fill` برای هر حرف حذف شد. فقط `word_solved` (کلمه‌ی کامل) می‌رود؛ همان بلوک «کلمه‌ی دیگرِ متقاطع هم کامل شد» هم دست‌نخورده ماند.
- `hooks/useMultiplayerState.ts`: `handleWordSolved` حالا فقط خانه‌های خالی (`''`) را پر می‌کند؛ خانه‌ای که بازیکن خودش پر کرده هرگز بازنویسی نمی‌شود. `handleCellFill` حذف شد. همچنین فقط همان خانه‌های تازه‌پر‌شده به `opponentFilled` اضافه می‌شوند — قبلاً *همه‌ی* خانه‌های کلمه اضافه می‌شد و خانه‌هایی که بازیکن خودش سبز پر کرده بود، با رسیدن کلمه‌ی حریف قرمز می‌شدند. حالا منشأ هر خانه حفظ می‌شود: حرف خودم سبز، حرف حریف قرمز، و فقط سوراخ‌ها با رسیدن کلمه قرمز می‌شوند.
- `utils/multiplayer.ts`: ثبت‌شنود `cell_fill`، `onCellFill` از اینترفیس و `sendCellFill` حذف شدند.
- `hooks/useGameLogic.ts`: فیلدهای `r`/`c` از نتیجه‌ی `handleKeyPress` (که فقط برای همان broadcast تک‌خانه‌ای لازم بودند) و کامنت قدیمی حذف شدند.

**اثر جانبی آگاهانه**: بعد از حمله‌ی Eraser، اگر بازیکن فقط همان یک حرف را دوباره تایپ کند و کلمه هنوز جای خالی دیگری داشته باشد، آن حرف تا تکمیل‌شدن کلمه به حریف نمی‌رسد (طبق خواسته‌ی صریح کاربر: هیچ حرف تکی‌ای به حریف نرود). با تکمیل کلمه، `word_solved` همه‌ی خانه‌های خالی را پر می‌کند.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `npm run test:mp` → **۳۷/۳۷** · تست مرورگری دو-نفره‌ی جدید `/tmp/cw-wordsync.cjs` → **۱۵/۱۵**: کلمه‌ی «اشک» روی کلاینت A حرف‌به‌حرف تایپ شد؛ بعد از «ا» و «ش» جدول B کاملاً خالی ماند؛ فقط پس از «ک» هر سه خانه (`ا ش ک`) روی B پر و قرمز شد. در مرحله‌ی دوم، B خودش حرف اول «ادب» را زد (سبز) و بعد A کل کلمه را ساخت: حرف B سبز ماند، فقط `د` و `ب` قرمز شدند، و کلمه‌ی مرحله‌ی اول همچنان قرمز بود. `target clue is active` برای هر دو سرنخ هم تأیید شد.

---

### Session 12 (Oct 23, 2026) — رفع باگ «کلمه‌ی کامل‌شده بعد از پاک‌کن نمی‌رسد»

**باگ گزارش‌شده**: بعد از زدن پاک‌کن روی یک خانه از کلمه‌ی حریف، وقتی آن حرف دوباره پر می‌شد، کلمه‌ی کامل‌شده گاهی برای حریف نمی‌رفت؛ گاهی هم یک کلمه‌ی کامل‌شده اصلاً به حریف نمی‌رسید.

**ریشه‌ی ۱ — بلوک تشخیص کلمه‌ی متقاطع مرده بود**: `useNavigation.handleInput` بعد از هر کلید، کلمه‌ی فعال را می‌فرستاد (این مسیر سالم بود) و در یک بلوک دوم سعی می‌کرد کلمه‌ی متقاطع همان خانه را هم تشخیص دهد. اما شرط آن بلوک `game.selectedCell && game.clues && game.userGrid` بود و **`App.tsx` هیچ‌کدام از این سه را به `useNavigation` پاس نمی‌داد** — پس بلوک دوم هرگز اجرا نمی‌شد. هر کلمه‌ای که با یک کلید کامل می‌شد ولی کلمه‌ی فعال نبود (دقیقاً حالت «پاک شد، دوباره پر کردم»)، بی‌صدا گم می‌شد.

**ریشه‌ی ۲ — ترتیب هوک‌ها، رنگ و هدف پاک‌کن را خراب می‌کرد**: در `handleWordSolved` مجموعه‌ی `writtenByOpponent` داخل updater مربوط به `setUserGrid` پر می‌شد و بعد `setOpponentFilled` از آن استفاده می‌کرد. اما `useMultiplayerState` (خط ۲۹۹ ف App) **قبل از** `useGameLogic` (خط ۴۴۰) صدا زده می‌شود، پس وقتی هر دو آپدیت در یک رندر پردازش می‌شوند updater مربوط به `opponentFilled` **اول** اجرا می‌شود و مجموعه را خالی می‌بیند. نتیجه: حرف تازه‌رسیده‌ی حریف فقط وقتی قرمز می‌شد (و فقط وقتی هدف پاک‌کن می‌شد) که React آپدیت جدول را eager ارزیابی می‌کرد — یعنی تصادفی.

**تغییرات**:
- `hooks/useGameLogic.ts`: `handleKeyPress` حالا لیست `completedClues` را برمی‌گرداند — **همه‌ی** سرنخ‌هایی (across + down) که در جدول جدید کامل‌اند ولی در همان جدولی که کلید روی آن اعمال شد کامل نبودند. منطق: «complete شدنی که قبلاً نبود» — پس هم کلمه‌ی متقاطع و هم کلمه‌ای که پس از پاک‌کن دوباره کامل می‌شود، دقیق و بدون هیوریستیک تشخیص داده می‌شود.
- `hooks/useNavigation.ts`: دو بلوک قبلی حذف و با یک حلقه روی `result.completedClues` جایگزین شدند. فیلدهای بلااستفاده `selectedCell/clues/userGrid` از `NavGame` حذف شدند.
- `hooks/useMultiplayerState.ts`: `handleWordSolved` حالا `userGridRef` را می‌گیرد و خانه‌های تازه‌پر‌شده و برخورد (collision) را **قبل از dispatch** از روی جدول کامیت‌شده حساب می‌کند؛ updater جدول همچنان functional می‌ماند تا کلید تازه‌تایپ‌شده گم نشود. این کار وابستگی به ترتیب هوک‌ها را حذف می‌کند.
- `utils/multiplayer.ts`: `sendWordSolved` مثل `sendCellReset` تا ۳ بار retry می‌کند (ارسال دوباره بی‌خطر است چون گیرنده فقط خانه‌های خالی را پر می‌کند). `word_solved` تنها کانال انتقال حروف است، پس یک فریم گم‌شده یعنی یک کلمه‌ی گم‌شده.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-wordsync.cjs` → **۱۵/۱۵** · تست دو-مرورگری جدید `/tmp/cw-erase.cjs` → **۱۱/۱۱ در دو اجرای متوالی**: B کلمه‌ی «بنا» را حل کرد، A پاک‌کن زد (خانه‌ی `1,1` خالی شد)، B همان حرف `ن` را دوباره تایپ کرد و A کلمه‌ی کامل‌شده را دریافت کرد (`text-rose-900` / `bg-rose-200` — یعنی به‌عنوان حرف حریف، نه سبز). اجرای دوم خانه‌ی `0,2` را پاک کرد و همان نتیجه را داد.

---

### Session 13 (Oct 25, 2026) — جایگزینی تصاویر AI بخش داستانی با آثار واقعی موزه‌ای (ویکی‌مدیا کامنز)

**درخواست**: تصاویر تولیدشده با AI برای کاور/فصل‌های داستانی زشت‌اند؛ برای هر داستان — و به‌طور مشخص برای هر خوان از **هفت خوان رستم** — تصویر واقعیِ متناسب با همان صحنه، با تم بصری واحد، از اینترنت جمع‌آوری و جایگزین شود.

**نتیجه‌ی بررسی اولیه**: کمپین «هفت خوان رستم» اصلاً تصویر واقعی نداشت — فایل‌های `public/images/chapters/rostam7/khan1..7.jpg` نسخه‌های ۱۰۲۴×۱۰۲۴ تولید AI بودند و `PICKS.rostam_7` در کاتالوگ فقط یک کاور داشت.

**خط لوله‌ی جمع‌آوری تصویر (اسکریپت‌های جدید در `scripts/`)**:
- `story-image-catalog.cjs` — `BOOKS` (کوئری جست‌وجو + الگوی پذیرش برای هر فصل) و `PICKS` (فایل دقیق انتخابی برای هر فصل، تا بازتولید عین همان تصویر باشد).
- `fetch-story-images.cjs` — گرفتن از کامنز: کاور ۱۱۰۰px و فصل ۸۰۰px، فاصله‌ی ۱۶۰۰ms بین درخواست‌ها، `infoFor()` فایل‌های ≥۵۰۰px و ترجیح public-domain را نگه می‌دارد. `--books=<id>`، `--force`، `--dry`.
- `smart-crop.py` — تشخیص عکسِ صفحه‌ی نسخه‌ی خطی با آزمون «کاغذ گرم» (`arr[...,2] <= arr[...,0] + 0.06`) و `paper > 0.18`؛ سپس `painted_region()` با کاشی‌های ۳۲۰px، تنوع رنگ (hue diversity)، بزرگ‌ترین مؤلفه و گاردهای مساحت/عرض/ارتفاع.
- `compose-story-images.py` — چیدن روی بوم ۳:۲ (کاور ۱۱۰۰×۷۳۴، فصل ۸۰۰×۵۳۴) با پس‌زمینه‌ی محو‌شده و حاشیه‌ی طلایی.
- `story-contact-sheet.py` — شیت تماس برای بازبینی چشمی هر کمپین.
- `update-story-paths.cjs` / `update-story-paths-db.cjs` — تغییر مسیرها از `.svg` به `.jpg` در ۳۲ فایل داده و در دیتابیس.
- `story-credits-md.cjs` — تولید `public/images/story-credits.md` (۳۲ کتاب، ۱۹۵ فایل).

**هفت خوان رستم — تم واحد از یک نسخه‌ی خطی**: هر هفت خوان از **Walters Art Museum Ms. W.597** (گزیده‌ی شاهنامه) گرفته شد که همه‌ی هفت‌خوان را در یک سبک دارد؛ تنها «خوان دوم: بیابان بی‌آب» از **شاهنامه‌ی طهماسبی، folio 118r** آمد چون W.597 آن خوان را ندارد و شماره‌گذاری داخلی‌اش با اپ یکی نیست (خوان پنجم آن «چهارمین» کار است). کاور از **Cleveland Museum of Art 1988.96.a** (نبرد رستم با دیو سپید).

**فایل‌های تغییریافته**:
- `scripts/story-image-catalog.cjs` — ۷ فصل `rostam_7` به `BOOKS.chapters` و `PICKS.rostam_7` با نگاشت فایل هر خوان اضافه شد.
- `scripts/fetch-story-images.cjs` — `DIR` برای نام پوشه‌ها (`sohrab`, `zal`, `rostam7`, …) و `STEM` برای نام فایل (`rostam_7` → `khan{n}`).
- `scripts/smart-crop.py` — `MANUAL_CROPS` برای هفت برگ W.597 (هر برگ کمی جابه‌جا عکاسی شده، پس کادر مینیاتور برگ‌به‌برگ اندازه‌گیری شد) به‌همراه چهار فایل قبلی (rostam-death ch1، zal ch2، haft_peykar ch4، rostam-akvan ch1).
- `server/local-data/story_books.json` / `story_chapters.json` — مسیرهای قدیمی `covers/zal.svg`، `chapters/khosrow/`، `chapters/peykar/` به `zal-rudabeh`، `khosrow_shirin`، `haft_peykar` اصلاح شد.

**نکته‌ی رگرسیونی که رفع شد**: UPDATE عمومیِ `.svg`→`.jpg` در دیتابیس، ۱۲ کاور `public/images/school/*.svg` را هم عوض کرده بود؛ با یک پاس هدفمند به `.svg` برگردانده شد.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · هر ۸ فایل هفت‌خوان با HTTP 200 و ابعاد بوم (کاور ۱۱۰۰×۷۳۴، فصل‌ها ۸۰۰×۵۳۴) · در مرورگر، لیست فصل‌های هفت خوان هر هفت URL `khan1..7.jpg` را لود کرد و «رستم و سهراب» هم به `sohrab/ch1..7.jpg` اشاره می‌کند · اعتبارسنجی JSON: ۲۷۴ ردیف، صفر مسیر `.svg` در حماسه/تاریخ؛ ۳۰ مسیر گمشده‌ی باقی‌مانده همه `/images/folktales/*` هستند که از قبل روی دیسک نبودند.

---

### Session 14 (Oct 25, 2026) — غول‌های ۱۵ قصه‌ی عامیانه: تصاویر واقعی + کاور + تصویر فصل

**درخواست**: برای تمام داستان‌هایی که یک «غول» دارند تصویر درخور، زیبا و **غیر-AI** از اینترنت انتخاب شود که دقیقاً به محتوای داستان بخورد.

**نتیجه‌ی بررسی**: از ۱۷۷ ارجاع آواتار، ۱۵ قصه‌ی عامیانه هیچ فایل تصویری نداشتند — نه آواتار غول، نه کاور کتاب و نه تصویر فصل. هر سه مسیر در داده‌ها به `/images/folktales/*.svg` اشاره می‌کردند که روی دیسک وجود نداشت، پس کارت کتابخانه‌ی این ۱۵ کتاب تصویر شکسته نشان می‌داد. (۱۲ آیکون مدرسه عمداً دست‌نخورده ماندند؛ آیکون عمومی هر پایه‌اند نه غول داستان.)

**منابع (ویکی‌مدیا کامنز، همه Public Domain یا CC)** — هر تصویر با موضوع دقیق همان قصه:
- شنگول و منگول → `Portrait of a common european wolf.jpg`
- کدو قلقله‌زن → نقاشی `Cordelia Wilson - Orange Gourd.jpg`
- خروس و روباه → `Rooster portrait, France.jpg`
- ماهی سیاه کوچولو → `Black Moor Goldfish.jpg`
- بزبز قندی → `Goat kid (6362697831).jpg`
- گنجشکک اشی مشی → `House Sparrow on Branch (49204523043).jpg`
- خاله سوسکه → `Ladybug on apple blossoms in Visby, Gotland.jpg`
- موش و گربه → برگه‌ی `Kalila wa Dimna` (موش و گربه)، موزه‌ی متروپولیتن
- دختر نارنج و ترنج → `Citrus aurantium Blanco2.304.jpg`
- سیاه‌زنگی → `A rare Safavid oil painting of an African soldier, Persia, Isfahan, circa 1680-90.jpg`
- گربه ناقلا → `Cat and Canary Cage - Kamal-ol-molk - Golestan Palace.png`
- دیو و کچل → `Rustam killing the White Div`، شاهنامه‌ی صفوی شیراز (~۱۵۶۰-۸۰)
- شب‌های شیرین → `The Milky Way over the Apadana Palace and the Gate of Nations.jpg`
- گلی و کوزه → عکس آنتوان سوریوگین، `Two Women Carrying Clay Jugs`، موزه‌ی بروکلین
- نان و نمک → `Salt and bread on heirloom tablecloth with traditional embroidery.jpg`

**سه خروجی از هر منبع خام** (کادر سوژه‌محور، نه برش وسط):
- آواتار غول ۵۱۲×۵۱۲ → `public/images/monsters/folktales/<slug>/ch1-monster.jpg`
- کاور کتاب ۱۱۰۰×۷۳۴ → `public/images/folktales/<slug>.jpg`
- تصویر فصل ۱۲۸۰×۷۲۰ → `public/images/folktales/<slug>/ch1.jpg`

**فایل‌های تغییریافته**:
- `scripts/fix-monster-images.cjs` — ۱۵ ورودی `FIXES` برای قصه‌های عامیانه؛ خودش خام را در `public/images/_raw/monsters/` می‌نویسد و مجوز/هنرمند/صفحه را در `public/images/monster-credits.json` ثبت می‌کند.
- `scripts/crop-monster-avatars.py` — ۱۵ ورودی `MANUAL_CROPS` (کادر دستی روی سوژه)، دیکشنری `COVER_FOCUS` برای جاهایی که مرکز کادر بهترین قاب کاور نیست، و حالت `--covers` با توابع `wide_crop()`/`write_wide()` که از همان خام، کاور و تصویر فصل را با نسبت و نقطه‌ی کانونی می‌سازد.
- `data/folktales/*Words.ts` + `data/folktales/folktalesIndex.ts` — ۳۰ مسیر `.svg` → `.jpg` (آواتار و تصویر فصل و کاور).
- `server/local-data/story_books.json` / `story_chapters.json` — همان ۳۰ مسیر.
- `scripts/register-folktales.py` — مسیرهای پیش‌فرض seed هم به `.jpg` تغییر کرد تا بازتولید دیتابیس این باگ را برنگرداند.
- دیتابیس Postgres — ۱۵ ردیف `story_books.cover_image` و ۱۵ ردیف `story_chapters.image`+`monster_avatar` با یک اسکریپت یک‌باره که خودِ `dotenv` سرور را لود می‌کند (بدون خواندن `.env`).

**دو بازبرش پس از بازبینی چشمی**: «نان و نمک» منبعش به عکس نان+کاسه‌ی نمک روی سفره‌ی گلدوزی‌شده عوض شد و کادر دور هر دو سوژه تنظیم شد؛ «شب‌های شیرین» کادر به مجسمه‌های لاماسوی تخت جمشید زیر آسمان پرستاره منتقل شد چون برش قبلی فقط آسمان خالی نشان می‌داد.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · API (`/api/story/books`) هر ۱۵ کاور را با `.jpg` و هر ۱۵ آواتار را با `.jpg` برمی‌گرداند · همه‌ی ۳۰ فایل با HTTP 200 (کاور ۱۱۰۰×۷۳۴، آواتار ۵۱۲×۵۱۲) · در مرورگر تب «قصه‌ها» هر ۱۵ کارت با `naturalWidth=1100` لود شد؛ کارت و مودال داستان شنگول تصویر فصل و صفحه‌ی بازی آواتار گرگ را نشان داد · اسکن همه‌ی مسیرهای تصویری داده‌ها: ۵۵۹ ارجاع، صفر فایل گمشده.

---

### Session 14 (Oct 25, 2026) — آواتار Boss متناسب با محتوای هر فصل + نمایش نام Boss در HUD

**درخواست**: آواتار Boss در بازی جدول باید برای هر فصل، دقیقاً همان «غول/دشمن» همان داستان باشد، نه یک تصویر عمومی یا تکراریِ بی‌ربط.

**راه‌حل**:
- `scripts/apply-boss-roster.cjs` — یک فهرست محتوا‌محور برای هر ۴۶ پوشه‌ی داستانی (۱۶۸ فصل) که برای هر فصل، فایل آواتار + نام فارسی دشمن را تعیین می‌کند (مثلاً هفت‌خوان: شیر/بیابان بی‌آب/اژدها/زن جادوگر/اولاد مرزبان/ارژنگ دیو/دیو سپید؛ سیاوش: سیاوش، سودابه، آتش، افراسیاب، فرنگیس، گرسیوز، کیخسرو). اسکریپت هم فایل‌های `data/**/*Chapters.ts` (و فصل‌های inline در `*Words.ts`) و هم `server/local-data/story_chapters.json` را بازنویسی می‌کند.
- ستون `monster_name` به `story_chapters` اضافه شد (`server/db/PostgresDB.js` + migration `ADD COLUMN IF NOT EXISTS`)؛ `server/scripts/sync-story-monsters.js` آن را از JSON به Postgres می‌برد و `/api/story/books` هر دو فیلد `monsterAvatar` و `monsterName` را برمی‌گرداند.
- `components/GameView.tsx` — زیر آواتار Boss در HUD، نام فارسی دشمن (یا «Boss») نمایش داده می‌شود و هم‌زمان به‌صورت `title` کامل است.

**جایگزینی تصاویر ضعیف تاریخ بر اساس بازبینی چشمی**:
- مادها: دیاکو → پرتره‌ی واقعی Deioces؛ فرورتیش → حامل خراج ماد در تخت جمشید؛ هووخشتر → لیتوگراف Dovaston با تبر در کشتار سران سکایی؛ آستیاگ → شاه زنجیرشده در برابر کوروش (تاپستری). تصویر قبلی آستیاگ یک نقاشی با زن و کودک بود (بی‌ربط) و برش هووخشتر فقط سنگ خالی نشان می‌داد.
- هخامنشیان: داریوش → نقش‌برجسته‌ی بیستون؛ کوروش/منشور کوروش دست‌نخورده ماند.
- اشکانی: مهرداد دوم → تترادراخمای نقره‌ی سوس؛ سورنا → سنگ‌نگاره‌ی «مرگ کراسوس» (کاسل).
- سلجوقیان: طغرل → مینیاتور «طغرل بر تخت» (توپکاپی)؛ سلطان سنجر → پرتره‌ی مینیاتور سنجر (دیگر از تصویر آرامگاه استفاده نمی‌شود). ملکشاه و آلب‌ارسلان قبلاً درست بودند.

**همه‌ی منابع** از Wikimedia Commons با مجوز آزاد، در `public/images/monster-credits.json` و `scripts/fix-monster-images.cjs` (برای بازتولید) ثبت شدند.

**Verification**: `tsc --noEmit` clean · `npm run build` OK · `sync-story-monsters` → ۲۱۶ ردیف به‌روز، ۱۶۸ ردیف با `monster_name`، ۴۸ ردیف `.svg` فقط در کتاب‌های مدرسه · همه‌ی ۲۱۶ مسیر `.jpg` روی دیسک موجود (صفر مفقود) · API برای medes/achaemenids/parthians/seljuks نام و تصویر درست می‌دهد · بازی واقعی «هووخشتر» در مرورگر: HUD نام «هووخشتر» و تصویر `medes/monster3.jpg` (تبرِ Dovaston) را نشان داد · همه‌ی ۹ فایل جدید با HTTP 200 و ۵۱۲×۵۱۲.

---

### Session 15 (Oct 25, 2026) — «گنجینه»: یک کتابخانه با چهار قفسه + بازسازی ۱۵ قصه

**درخواست**: تجمیع کتابخانه زیر نام «گنجینه» با چهار قفسه‌ی تاریخ ایران (نقشه)، حماسه‌ها، قصه‌ها و اسطوره‌های فوتبال (نقشه‌ی جهان داخل گنجینه)، غیرفعال‌کردن بخش مدرسه، بازسازی قصه‌ها بر اساس الگوی طراحی/محتوای موجود و قوانین ساخت سرنخ، و اصلاح ناوبری برنامه.

**ناوبری و طراحی**:
- `components/MainMenu.tsx` — کاشی‌های «داستان» و «نقشهٔ جهان» حذف و با یک کاشی پهن `mm-tile-wide` به نام «گنجینه» جایگزین شدند. کد مرده (`Library`/`Globe`/`Flame`/`Send`، شمارنده‌های قدیمی) پاک شد.
- `index.css` — کلاس `.mm-tile-wide` (تمام‌عرض، چیدمان افقی) اضافه شد.
- `components/EpicLibrary.tsx` — بازنویسی کامل به‌عنوان صفحه‌ی «گنجینه» با نوار چهار قفسه، آمار هر قفسه و کارت فشرده‌ی کتاب. قفسه‌ی تاریخ `IranMap` و قفسه‌ی فوتبال `WorldMap` را **درون خود** رندر می‌کند (نقشه‌ی جهان دیگر از منو باز نمی‌شود). کتاب‌های `genre === 'education'` از قفسه‌ها و شمارنده‌ها فیلتر می‌شوند.
- `components/GameViews.tsx` — `libraryShelf` در خودِ GameViews نگه داشته می‌شود (نه در کتابخانه) تا برگشت از یک فصل، همان قفسه را برگرداند؛ برگشت از فصل‌های فوتبال و مودال پایان نقشه به `epic_library` می‌رود.

**بازسازی قصه‌ها** (۱۵ قصه × ۳ فصل × ۱۰ کلمه = ۴۵ فصل / ۴۵۰ کلمه):
- همه‌ی فایل‌های `data/folktales/*Words.ts` بازنویسی شدند: واژه‌های ساده ۲–۶ حرفی، سرنخ‌های داستانی و بدون تکرار واژه در سرنخ، سه فصل با قوس روایی مستقل، `victoryText` برای هر فصل، `monsterName` فارسی.
- چون برای هر قصه فقط یک تصویر فصل و یک آواتار غول موجود است، هر سه فصل همان `ch1.jpg` و `ch1-monster.jpg` را استفاده می‌کنند (بدون تولید تصویر AI جدید).
- `scripts/validate-folktales.cjs` — دروازه‌ی محتوا: تعداد فصل، تعداد کلمه، طول واژه/سرنخ، نبود واژه در سرنخ، تکرار نشدن واژه در کتاب، وجود فایل تصویر و `monsterName`. اکنون: `books=15 chapters=45 words=450 — all checks passed`.
- `scripts/sync-folktales.cjs` — بسته‌بندی `folktalesIndex.ts` با esbuild و به‌روزرسانی `server/local-data/story_books.json` + `story_chapters.json` و سپس upsert در PostgreSQL (شناسه‌ی فصل‌ها deterministic از `book|chapter`، حذف فصل‌های اضافی قدیمی، `--dry`/`--json-only`).

**ساده‌سازی منو**: نوار «مجموعهٔ اسطوره‌ها» (کارت‌های همیشه‌قفل فوتبالی) از صفحه‌ی خانه حذف شد — هیچ‌وقت باز نمی‌شد و فقط شلوغی بود. حالت‌های بازی از سه سطر به دو سطر رسید: گنجینه تمام‌عرض در سطر اول، برج بی‌نهایت و نبرد آنلاین کنار هم در سطر دوم (ارتفاع این دو کاشی به ۱۵۲px و گنجینه به ۱۱۲px رسید تا صفحه خالی نماند).

**بازگردانی نقشه‌ی حماسه**: قفسه‌ی «حماسه» هم مثل تاریخ روی `IranMap` نشسته است (کارت‌های فشرده فقط برای قصه‌ها ماند). دلیلش خط داستانی است: با انتخاب هر نشانگر، حلقه‌های همان قوس روشن می‌شوند و نوار پایین نقشه کل زنجیره را نشان می‌دهد — مثلاً زال و سیمرغ → زال و رودابه → هفت‌خوان → اکوان دیو → تهمینه → سهراب → افراسیاب → اسفندیار → رستم و اسفندیار → مرگ رستم. کارت‌های فهرستی این ارتباط را از بین می‌بردند.

**Verify**: `tsc --noEmit` clean · `npm run build` OK · `/api/story/books` → ۱۵ قصه، هر کدام ۳ فصل با عنوان/کلمه‌های جدید · مرورگر: کاشی «گنجینه» در منو، چهار قفسه با آمار (تاریخ ۹ کتاب، حماسه ۲۱، قصه‌ها ۱۶، فوتبال ۲۵ اسطوره/۱۰۹ فصل)، مدرسه غایب، نقشه‌ی ایران و نقشه‌ی جهان درون قفسه‌ها، انتخاب مسی → ۷ فصل → برگشت به همان نقشه، کتاب شنگول → ۳ فصل → شروع نبرد با جدول ساخته‌شده و سرنخ «بزغاله ساده‌لوح که زود فریب خورد» از محتوای جدید، بدون خطای کنسول.

---

### Session 16 (Oct 25, 2026) — تب «کالکشن من»: نمایش واقعی کارت‌های بازیکن

**درخواست**: تب پایین «مجموعه» (گالری کارت‌های فوتبالی قدیمی) معنی نداشت؛ حذف شود و جایش صفحه‌ای بیاید که کالکشن واقعی بازیکن را نشان دهد.

**تغییرات**:
- `components/MainMenu.tsx` — تب `cards` با `collection` («کالکشن») جایگزین شد؛ `TabKey` به‌روزرسانی شد. گالری قدیمی دیگر از هیچ نقطه‌ای در UI باز نمی‌شود.
- `types.ts` — `'collection'` به `GameView` اضافه شد.
- `components/CollectionScreen.tsx` (فایل جدید) — یک صفحه با چهار قفسه (تاریخ، حماسه، قصه‌ها، فوتبال)، نوار پیشرفت کل («۱۹ از ۳۰۷ کارت»)، آمار هر قفسه روی تب‌ها و بخش‌بندی بر اساس کتاب/اسطوره:
  - قفسه‌های داستانی از `gameServer.fetchStoryLibrary()` (با fallback به `EPIC_CAMPAIGNS + FOLKTALE_BOOKS`) و `player.epicProgress` می‌خوانند؛ فصل‌های کامل‌شده با تصویر فصل و عنوان، فصل‌های قفل با سایه و قفل و «؟؟؟» (بدون اسپویل).
  - قفسه‌ی فوتبال از `FOOTBALL_LEGENDS` + `WORLD_MAP_CHAPTERS` و `worldMapCardProgress` می‌خواند و همان `LegendCard` نقشه‌ی جهان (رنگ‌بندی کمیابی) را رندر می‌کند.
  - کلیک روی هر کارت یا سرِ هر بخش، همان کتاب/اسطوره را باز می‌کند تا مسیر «دیدن کالکشن → بازی فصل بعدی» کامل باشد.
- `components/GameViews.tsx` — `CollectionScreen` به‌صورت lazy رندر می‌شود؛ `collectionShelf` در GameViews نگه داشته می‌شود (برگشت از فصل، همان قفسه را برمی‌گرداند)؛ `collectionOriginRef` باعث می‌شود دکمه‌ی برگشت از `epic_chapters` / `world_map_chapters` وقتی از کالکشن آمده‌ایم به کالکشن برگردد، نه به گنجینه.

**Verify**: `tsc --noEmit` clean · `npm run build` OK · مرورگر: تب «کالکشن» → «کالکشن من» با شمارش واقعی (تاریخ ۱۹/۴۳، حماسه ۱۶/۱۰۷، قصه‌ها ۱/۴۸، فوتبال ۰/۱۰۹) · کلیک روی کارت «ارشک و شورش» → فصل‌های اشکانیان → برگشت به کالکشن · قفسه‌ی فوتبال ۱۰۹ کارت `LegendCard` با کمیابی · کلیک روی کارت مسی → فصل‌های مسی → برگشت به کالکشن با قفسه‌ی فوتبال فعال · صفر خطای کنسول · بدون سرریز افقی در ۸۵۸px (۸ ستون، کارت ۸۹×۱۱۹).

**نکته‌ی باقی‌مانده**: حالت مینی‌گیم کارت قدیمی (`CardGallery`/`CardStoryModal`/`data/cards.ts` و `view === 'cards'`) حالا از UI قابل دسترسی نیست؛ کدش دست‌نخورده مانده تا با تأیید کاربر حذف یا جایگزین شود.

---

### Session 17 (Oct 25, 2026) — کارت فوتبالی: بازطراحی رد شد، بازگشت به نسخه‌ی قبلی + تنظیم ملایم عکس و فونت

**درخواست اولیه**: عکس و فونت کارت خیلی بزرگ است؛ هر متنی (کوتاه یا بلند) باید زیبا دیده شود؛ یک طرح پشت‌کارت پیشنهاد شود؛ و انیمیشن چرخش کارت لگ دارد و هیجان‌بخش نیست — هرچه کارت باارزش‌تر، رونمایی باید باشکوه‌تر باشد.

**آنچه انجام شد و رد شد**: هویت کارت از «اسکریم تیره + متن سفید» به **پلیت کرم/روشن** عوض شد، چیدمان عکس و تیتر بازنویسی شد و انیمیشن رونمایی (اورشوت، حلقه‌های شارژ، ذرات، هولو) جایگزین چرخش قبلی شد. کار از نظر فنی سالم بود (`tsc`، build، ۱۵۷ فریم بدون افت) اما کاربر گفت «خیلی افتضاح شد، قبلا خیلی خیلی بهتر بود».

**درس طراحی (مهم برای آینده)**: «عکس/فونت بزرگ است» اجازه‌ی عوض‌کردن هویت بصری کارت نیست. اسکریم تیره، متن سفید وزین و فریم PNG فعلی، هویت موردپسند کاربرند؛ تغییر باید فقط اندازه‌ای و در همان زبان بصری باشد.

**بازگردانی**:
- `components/LegendCard.tsx` از بکاپ file-history (`eaad0687…@v1`) برگردانده شد — همان اسکریم تیره‌ی `#020617` (۵۴٪→۸۰٪)، تیتر سفید ۹۰۰، ردیف سال/کمیابی و نوار رنگی بالای کارت.
- `components/WorldMapCardRevealModal.tsx` از `4b410038…@v1` برگردانده شد — چرخش اصلی `cardSpinReveal` (۱۹۸۰ درجه) با پشت‌کارت قدیمی، پنل آمار شیشه‌ای روشن.
- `components/WorldMapCardGallery.tsx` از `b110f4ff…@v1` برگردانده شد — پنل ۳۰۰px، کارت ۲۱۰px، چرخش ۶۵۰ms.

**تنظیم ملایم باقی‌مانده (فقط اندازه، همان زبان بصری)**:
- پنجره‌ی عکس: `top 14%→17%`, `left/right 17%→19%`, `height 46%→38%` (نسخه‌ی `thumb`: ۱۷٪/۱۹٪/۵۸٪). دلیل عدد ۱۷٪: سپر کارت بالای ارتفاع ۲۰٪ جمع می‌شود — در `y=14.5%` فقط `18.9%→80.9%` باز است، پس عکسِ `18.5%` گوشه‌های بالایش ~۱٪ بیرون فریم می‌زد؛ در `y=17%` سپر تا `13.5%→86.5%` باز است و عکس کامل داخل می‌نشیند. کادر حالت قفل هم دقیقاً روی همین هندسه تنظیم شد.
- تیتر با auto-fit: `cq((isLarge ? 6.4 : 6) * titleFit)` با `titleFit = len>30 ? .76 : len>22 ? .85 : len>14 ? .93 : 1`، `lineHeight 1.18`، `textWrap: 'balance'` و clamp دو خط. (قبلاً `7.4/7` بدون auto-fit بود.)
- نام `5cqw → 4.4cqw`، ردیف سال/کمیابی `4.4cqw → 3.9cqw`.
- بلوک متن `top 60%→57.5%`, `bottom 26%→20%` تا تیتر دو‌خطی + نام + متا داخل نوار اسکریم بمانند و به لوگوی «FUT CARDS» (~۸۳.۵٪) نرسند.
- `public/images/worldmap/card-back.svg` روی دیسک ماند (کد فعلی به آن ارجاع نمی‌دهد) — حذف نشد تا اگر کاربر خواست دوباره استفاده شود.

**Verify**: `tsc --noEmit` clean · `npm run build` OK (۷۸۷ KB / ۲۲۴ KB gzip) · مرورگر: گرید کالکشن ۱۰۹ کارت با ابعاد ۱۱۳×۱۵۸، تیتر ۵.۵۸cqw روی `top 57.5%` تا `bot 62.2%`، نام `62.7%–66.5%` (هیچ سرریزی روی لوگوی پایین) · گالری «کلکسیون کارت‌ها» دو ستونه سالم · نمای بزرگ‌شده ۲۱۰×۲۹۳ با همان چیدمان · صفر خطای کنسول.

---

### Session 18 (Oct 26, 2026) — دوئل غیرهم‌زمان + یکپارچه‌سازی کالکشن روی سرور

**درخواست**: فاز بعدی = (۱) کالکشن کارت‌های فوتبال فقط روی حساب کاربر باشد (قبلاً گرید کالکشن localStorage را هم می‌خواند) و (۲) دوئل غیرهم‌زمان: بازیکن برای دوستِ آفلاین جدولش را بفرستد و او بعداً همان جدول را بازی کند.

**کالکشن روی سرور**:
- ستون `profiles.worldmap_cards` (TEXT با JSON) در هر دو درایور (`PostgresDB.js` + migration، `SQLiteDB.js`) و در `JSON_FIELDS` ثبت شد.
- `mergeWorldMapCards()` در `server/index.js`: ادغام یک‌طرفه‌ی رو به بالا — برای هر شناسه‌ی کارت بیشترین «درجه/تعداد» نگه داشته می‌شود، مقادیر بی‌معنی و شناسه‌های ناشناس حذف می‌شوند. پس `PUT /api/profile` هرگز کالکشن را عقب نمی‌برد (تست: `{messi_1:2,messi_2:1}` → ارتقا به ۴ → تلاش برای برگشت به ۱ نادیده گرفته شد).
- `utils/gameServer.ts` کالکشن را روی سرور می‌نویسد و همان را در localStorage آینه می‌کند؛ `WorldMapCardGallery` نسخه‌ی سرور را منبع حقیقت می‌گیرد.

**دوئل غیرهم‌زمان — سرور**:
- جدول `async_duels` با ستون‌های `code` (۶ کاراکتر یکتا)، `creator_id`/`opponent_id`، `category`، `size`، `board` (JSON)، `creator_result`/`opponent_result`، `status` (`open`/`playing`/`completed`)، `rewarded`، `created_at`.
- مسیرها: `POST /api/duel/create` (سقف ۵ دوئل باز = ۴۰۹، throttle ۱۰ در دقیقه، هدف‌گیری دوست با `areFriends`)، `POST /api/duel/accept` (کد `^[A-Z0-9]{6}$`، ۴۱۰ برای منقضی، `db.claimDuel` اتمیک)، `POST /api/duel/result` (فقط حریف، idempotent)، `GET /api/duel/list` → `{incoming, mine}` با فیلتر TTL.
- ثابت‌ها: `DUEL_TTL_MS = 7d`، `DUEL_BOARD_BYTES = 120_000`، `DUEL_COINS = { win: 20, draw: 10, loss: 5 }`، `DUEL_OPEN_LIMIT = 5`.
- `sanitizeDuelBoard` گرید ۵..۱۰، حداکثر ۸۰ سرنخ، سلول‌های سرنخ به شکل `{r,c}` و سقف بایت را اعتبارسنجی می‌کند.
- پس از ثبت نتیجه، سازنده نوتیفیکیشن `duel_result` + پوش WS می‌گیرد و هر دو طرف به‌اندازه‌ی یک‌بار سکه می‌گیرند (`rewarded` + بررسی `completed`).
- `GET /api/duel/list` دوئل‌های `open` قدیمی‌تر از TTL را فیلتر می‌کند تا هرگز کارت مرده نمایش داده نشود.

**دوئل غیرهم‌زمان — کلاینت**:
- `components/AsyncDuelScreen.tsx`: مرکز دوئل — فرستادن آخرین جدول (`crossword_last_board`)، پذیرش با کد، لیست دعوت‌های دوستان/دوئل‌های من، و انتخاب دوست برای دعوت هدفمند.
- `App.tsx`: `startDuelGame` جدول ذخیره‌شده را با `setExternalGrid` بازپخش می‌کند و `isDuelReplay` را روشن می‌کند؛ شاخه‌ی دوئل در `wrappedHandleWin` نتیجه را به سرور می‌فرستد، پاداش را در پروفایل می‌نشاند و فقط در برد کانفتی می‌زند.
- `hooks/useGameResultEffects.ts`: پارامتر `isDuelReplay` اضافه شد تا باخت در بازپخش دوئل، دوش پیروزی تک‌نفره را روشن نکند.
- `components/SocialPanel.tsx`: کارت‌های `duel` و `duel_result` از هم جدا شدند (قبلاً هر دو مثل «درخواست دوستی» با دکمه‌ی `acceptFriend` رندر می‌شدند). حالا «بازی دوئل» مستقیم از صندوق پیام با `acceptDuel(code)` + `onPlayDuel` جدول را باز می‌کند.
- بنر نتیجه، **دلتای پاداش** را نشان می‌دهد نه موجودی؛ سرور فیلد `reward` را برمی‌گرداند (`coins` = موجودی نهایی).

**باگ‌های واقعی که در تست پیدا و رفع شدند**:
1. **۵۰۰ روی `/api/duel/result`**: `opponentGain` داخل بلوک `try` با `const` تعریف شده بود و در ساخت پاسخ بیرون از آن بلوک استفاده می‌شد → `ReferenceError`. حالا در محدوده‌ی بیرونی اعلام می‌شود. (این باگ با تست دو-مرورگری کشف شد، نه با typecheck چون فایل سرور JS است.)
2. **لاگ بی‌اثر**: `logger.error('[duel/result]', e)` با pino استک را چاپ نمی‌کرد؛ به `logger.error({ err: e }, '…')` تغییر کرد.
3. **حلقه‌ی بی‌پایان درخواست**: `refresh` در `AsyncDuelScreen` به `onShowToast` وابسته بود که والد آن را inline می‌سازد → هر رندر یک تابع تازه → refetch بی‌پایان. با `toastRef` و deps `[isFA, isGuest]` رفع شد.
4. **کارت دوئل به‌جای دوستی**: نوع `SocialNotification.type` گسترش یافت (`'duel' | 'duel_result'`) و شاخه‌بندی صندوق بازنویسی شد.
5. **پاداش = موجودی**: خط بنر «۲۵۵ سکه پاداش گرفتی» می‌نوشت؛ فیلد `reward` (دلتا) اضافه شد.

**Verify**: `tsc --noEmit` clean · `npm run build` OK (۷۹۲ KB / ۲۲۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-duel-api2.cjs` → **۱۷/۱۷** (دوستی، دعوت هدفمند، پذیرش/ادامه، تسویه ۲۰/۵، idempotent بدون پرداخت دوباره، سقف ۵، ۴۰۹، ۴۰۴) · `/tmp/cw-duel-ui.cjs` دو `BrowserContext` مجزا → **۲۷/۲۷** (ساخت دوئل با کد، پذیرش، ۲۵ خانه، حل «سلام» + «ب»، بنر نتیجه، دلتای پاداش، کیف پول هر دو طرف رشد کرد) · `/tmp/cw-duel-inbox.cjs` → **۱۸/۱۸** (دعوت هدفمند واقعی → تب «پیام» → برچسب «دوئل غیرهم‌زمان» نه «درخواست دوستی» → «بازی دوئل» → سرنخ درست → حل کلمه → بنر + پاداش دلتا → رسیدن نوتیفیکیشن `duel_result` به سازنده) · `/tmp/cw-duel-quick.cjs` → **۷/۷** (دکمه‌ی «یک بازی سریع» در صفحه‌ی دوئل واقعاً بازی تک‌نفره را شروع می‌کند).

**دو اصلاح کوچک پایانی**:
- `onPlayQuick` دیگر فقط به منو برنمی‌گردد؛ همان مسیر «شروع سریع» منو را صدا می‌زند (`nav.onGenerateClick(false)`).
- `isDuelReplay` با یک effect روی `view` پاک می‌شود؛ اگر بازیکن وسط دوئل خارج شود، دوش پیروزی بازی بعدی‌اش خاموش نمی‌ماند.

**نکته‌ی باز برای تصمیم محصول**: پاداش سکه‌ی دوئل فعلاً `۲۰/۱۰/۵` و یک‌بار توسط سرور پرداخت می‌شود؛ اگر اقتصاد بازی اقتضا کرد باید تنظیم شود.

---

### Session 19 (Oct 26, 2026) — داوری منصفانه‌ی دوئل + بازسازی صفحه‌ی دوئل + چیپ زنده

**شکایت‌های کاربر**: (۱) «کلی اشتباه زدم و حریف خیلی کم، ولی امتیاز من بیشتر شد»؛ (۲) سقف ساخت دوئل نامعلوم؛ (۳) امکان حذف دوئل نیست؛ (۴) نمی‌شود اندازه و موضوع جدول دوئل را انتخاب کرد؛ (۵) پذیرش با کد بی‌معنی است چون مخاطب مشخص است؛ (۶) به‌جای فلش پایین، دکمه‌ی «مبارزه» با مودال انتخاب چند دوست.

**۱) مدل امتیاز داوری (فقط دوئل — `server/index.js`)**
- امتیاز داخلی بازی مبنای عادلانه‌ای برای مقایسه نیست: با ضریب Combo بالا می‌رود و به ترتیب پیمایش کلمات بستگی دارد؛ یک بازی شلخته می‌تواند روی همان جدول از یک بازی دقیق بیشتر بگیرد.
- داوری وزن‌های مستقل خودش را دارد: `DUEL_POINTS = { cell: 100, second: 2, mistake: 40, assisted: 60 }` → `۱۰۰×خانه‌ی درست − ۲×ثانیه − ۴۰×غلط − ۶۰×کمک`، کف صفر، تساوی با ثانی‌ی کمتر شکست می‌خورد.
- `assisted` خانه‌هایی است که بازیکن با توانایی/هینت ببیند، نه خودش بنویسد. `DUEL_COINS` و اقتصاد تک‌نفره/آنلاین عمداً دست‌نخورده ماند (تصمیم کاربر: «فقط داوری دوئل»).
- رفع جابه‌جایی `points` / `opponentPoints` در شاخه‌ی `alreadyCompleted` (دوئل تسویه‌شده دوباره باز می‌شد).
- `faDigits()` برای همه‌ی پیام‌های دوئل: رقم لاتین داخل جمله‌ی راست‌به‌چپ ترتیب خواندن را می‌شکند.
- سقف و پاک‌سازی: `DUEL_OPEN_LIMIT = 10` (با پیام «فقط جای N دوئل باز دارید»)، `DUEL_INVITE_MAX = 10`، throttle ساخت ۱۰/دقیقه و حذف ۲۰/دقیقه، و `setInterval` sweep که دوئل‌های پذیرفته‌نشده‌ی قدیمی‌تر از `DUEL_TTL_MS` (۷ روز) را حذف می‌کند. ۲۱ دوئل باز قدیمی باطل و پاک شدند (تصمیم کاربر).

**۲) آینه‌ی کلاینت + نمایش زنده**
- `utils/duelScoring.ts`: `DUEL_WEIGHTS`، `duelPoints()`، `duelPointsOf()`، `duelCounters()` — کپی دقیق وزن‌های سرور؛ «Change one, change the other».
- `components/GameView.tsx`: کادر «⚔️ امتیاز داوری» بالا-چپ جدول (امتیاز زنده، خانه‌ها، ساعت، غلط، کمک، و امتیاز حریف که از قبل مشخص است).
- `components/GameViews.tsx`: ساخت `duelLive` از `myFilledCells/seconds/wrongAnswerCount/assistedCount` فقط وقتی `duel.replay` وجود دارد.

**۳) باگ واقعی پیدا و رفع شد: شمارنده‌های خطا هرگز به UI نمی‌رسیدند**
- نشانه‌ها: چیپ همیشه «۰ غلط» می‌گفت، جدول در پاسخ غلط هرگز نمی‌لرزید، و امتیاز زنده بیشتر از واقع نشان داده می‌شد. ارسال نتیجه به سرور سالم بود، پس داوری نهایی درست بود و فقط نمایش خراب بود.
- ریشه: `App.tsx` برای `GameViews` یک آبجکت **گزینش‌شده**‌ی `game={{…}}` می‌سازد، در حالی که `gameRef.current` (در `hooks/useSyncEffects.ts`) آبجکت کامل هوک را می‌گیرد. در آن آبجکت گزینش‌شده `wrongAnswerCount` و `assistedCount` نبود، پس `GameViews` همیشه صفر می‌دید.
- رفع: افزودن همین دو فیلد به آبجکت گزینش‌شده (`App.tsx:1140-1141`).
- **قاعده‌ی هشدار برای آینده**: هر فیلدی که هوک بازی برمی‌گرداند و کامپوننت‌های فرزند می‌خوانند باید صریحاً به `GameViews` پاس شود؛ اضافه‌کردن فیلد به `useGameLogic` به‌تنهایی کافی نیست و بدون typecheck هم رد می‌شود.

**۴) بازطراحی دوئل به مدل «میدان + دعوت»**
- مدل ذهنی کاربر: میدان = یک بازی تمام‌شده‌ی من (اسنپ‌شات جدول + نتیجه‌ی خودم). هنگام ساخت، کسی دعوت نمی‌شود؛ دوستان بعداً به همان میدان دعوت می‌شوند و همان جدول را بازی می‌کنند. **نتیجه‌ها هرگز پاک نمی‌شوند.**
- سقف‌ها: هر بازیکن **۵ میدان فعال** (`DUEL_ARENA_LIMIT`) و هر میدان **۵ دعوت** (`DUEL_INVITE_LIMIT`). میدان بسته/منقضی هم تا پایان TTL جای خود را می‌گیرد.
- انقضا: `DUEL_TTL_MS = ۷ روز`. sweep هر ۱۰ دقیقه دعوت‌های بی‌پاسخ (`open`) را با کارت صندوقشان پاک می‌کند، میدان‌های بی‌دعوت را حذف و میدان‌های دارای نتیجه را می‌بندد؛ دعوت `playing` دست‌نخورده می‌ماند تا بازپخش نیمه‌کاره تمام شود. راهنمای کوچک در UI: «هر میدان ۷ روز اعتبار دارد و نتیجه‌ها همیشه می‌مانند.»
- قفل بازکردن: ساخت میدان با همان پله‌های امتیاز بازی محدود است و **سرور هم چک می‌کند** (`DUEL_SIZE_UNLOCK` / `DUEL_CATEGORY_UNLOCK`، پاسخ ۴۰۳ با نیاز امتیاز) تا فراخوانی خام API قفل را دور نزند.
- حذف/بستن: «حذف میدان» فقط تا وقتی هیچ نتیجه‌ای ندارد (`can_delete = invites.completed === 0`). بعد از اولین نتیجه جایش «بستن میدان» می‌آید: دعوت تازه نمی‌گیرد، رکوردها سر جایشان می‌مانند. حذف، دعوت‌ها و اعلان‌های `duel`/`duel_result` هر دو طرف را هم پاک می‌کند.

**۵) داده، API و صفحه**
- `server/schema.pg.sql` + `server/schema.sql`: دو جدول `duel_arenas` و `duel_invites` (جانشین تک‌جدولی `async_duels`) با ایندکس‌ها. هر دو درایور (`PostgresDB.js`، `SQLiteDB.js`) متدهای میدان/دعوت را دارند؛ ستون‌های JSON: `board` / `creator_result` / `opponent_result`.
- مسیرها: `POST /api/duel/create` (بدون دعوت، سقف ۵، قفل اندازه/موضوع)، `POST /api/duel/invite` (`{arena_id, opponent_ids}`، فقط دوست، سقف ۵، dedupe)، `POST /api/duel/accept` (با `duel_id`؛ دعوت باز روی میدان منقضی → ۴۱۰)، `POST /api/duel/delete` (فقط سازنده؛ ۴۰۹ `arena_has_results`)، `POST /api/duel/close`، `POST /api/duel/result` (idempotent)، `GET /api/duel/list` → `{arenas, incoming, results}`.
- `publicArena()` فیلدهای `expired/closed/creator_points/can_delete/can_invite/invite_slots_left/invites[]` را می‌سازد؛ `outcome` هر دعوت (برد تو / برد دوست / مساوی) از امتیاز داوری دو طرف حساب می‌شود.
- `components/AsyncDuelScreen.tsx`: دکمه‌ی «مبارزه» بالای صفحه حذف شد. «ساخت میدان از این بازی» آخرین بازی را منتشر می‌کند؛ هر میدان یک ردیف با نشان باز/بسته/منقضی، فهرست دوستان دعوت‌شده با امتیاز و وضعیت، و دکمه‌های «دعوت دوستان (N جا)»، «حذف میدان» یا «بستن میدان» (هر دو دو مرحله‌ای) دارد. «جزئیات» مودال شمارنده‌ها را باز می‌کند و فرمول فقط پشت دکمه‌ی «چطور حساب می‌شود؟» است. بخش ثابت «نتیجه‌های من» رکوردهای بازی‌شده را نگه می‌دارد.
- **باگ واقعی پیدا و رفع شد**: `createDuelInvite` در هر دو درایور نام/آواتار دعوت‌شده را همیشه خالی می‌گذاشت و فقط `claimDuelInvite` هنگام پذیرش آن را می‌نوشت؛ سازنده تا قبل از بازی دوست، «دوست دعوت‌شده» می‌دید. حالا مسیر دعوت مشخصات هر دوست را از `getUser` می‌گیرد و درج می‌کند.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۷۹۴ KB / ۲۲۷ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-duel-arena.cjs` (API میدان/دعوت/حذف/بستن/سقف/قفل‌ها) → **۳۸/۳۸** · `/tmp/cw-duel-expiry.cjs` (بک‌دیت ۸ روزه: انقضا، مسدودی دعوت، آزادشدن جا، حفظ نتیجه) → **۸/۸** · `/tmp/cw-duel-arena-ui.cjs` (دو مرورگر واقعی) → **۶۸/۶۸**: حذف دکمه‌ی بالا، راهنمای ۷ روز، جزئیات با فرمول بسته، پیام قفل ۹×۹ و «مشاغل»، ساخت میدان از آخرین بازی، حذف دو مرحله‌ای قبل از نتیجه، دعوت دوست از ردیف میدان با نام و ۴ جای باقی‌مانده، بازپخش ۵×۵ توسط دوست، بنر «داور: تو بردی!» و ۲۰ سکه، «نتیجه‌های من» ماندگار، نمایش «برد دوست» و قفل‌شدن حذف برای سازنده، بستن میدان با حفظ رکورد، و «۵ از ۵ میدان» با دکمه‌ی غیرفعال — صفر خطای کنسول.

**نکته**: هارنس‌های قدیمی دوئل (`cw-duel-ui.cjs`, `cw-duel-fair.cjs`, `cw-duel-del.cjs`, `cw-duel-build.cjs`, `cw-duel-smoke.cjs`) روی مدل تک‌دوئلی/کد‌دار نوشته شده‌اند و با مدل میدان نمی‌خوانند؛ مرجع فعلی `cw-duel-arena.cjs`، `cw-duel-expiry.cjs` و `cw-duel-arena-ui.cjs` هستند.

### Session 20 (Oct 26, 2026) — «میدان» → «چالش» + اعلان دعوت + رفع ریشه‌ای کجی زمان‌سرور

**درخواست**: کاربر باید بفهمد به یک چالش دعوت شده (چیزی شبیه نوتیفیکیشن)، و اصطلاح «میدان» کاملاً به «چالش» تغییر کند.

**تغییر نام**: ۲۷ رشته در `components/AsyncDuelScreen.tsx` و ۲۱ رشته در `server/index.js` و متن‌های `components/SocialPanel.tsx` (برچسب صندوق، دکمه‌ها، پیام‌های خطا) از «میدان» به «چالش» رفتند؛ معادل‌های انگلیسی هم arena→challenge. واژه‌ی «میدان» در `utils/glueWords.ts` (کلمه‌ی دیکشنری جدول) عمداً دست‌نخورده ماند.

**اعلان دعوت**:
- `components/MainMenu.tsx`: کاشی «چالش دوئل» حالا نشان عددی (`.mm-dot`) و زیرنویس «N دعوت منتظر توست» دارد. استایل در `index.css` (نبض ملایم + احترام به `prefers-reduced-motion`).
- `App.tsx`: `pendingChallenges` از حقیقت سرور (`listDuels().incoming` با `status === 'open'`) پر می‌شود، پس با بازی‌شدن دعوت صفر می‌شود (اعلان‌ها در صندوق می‌مانند، ولی شمارنده نه).
- توست «⚔️ <نام دوست> تو را به چالش دعوت کرد» فقط برای دعوتی می‌آید که **بعد از باز شدن صفحه** برسد. معیار «تازگی» رسیدن است نه `createdAt`؛ برای همین `useSocial` یک `notificationsReady` داد که اولین پاسخ سرور را مشخص می‌کند (دعوت‌های از قبل موجود، به‌صورت انبوه توست نمی‌دهند).
- `components/GameViews.tsx` فقط لوله‌کشی پراپ `pendingChallenges` را دارد.

**باگ ریشه‌ای کشف‌شده (خارج از خود فیچر)**: بررسی نشان داد نوتیفیکیشن تازه با `createdAt` حدود ۳٫۵ ساعت در گذشته می‌رسید.
- ستون‌ها `TIMESTAMP` بدون منطقه‌زمانی‌اند و همه‌ی نوشتن‌ها رشته‌ی UTC (`toISOString`) می‌فرستند؛ Postgres نشانه‌ی `Z` را برای این نوع نادیده می‌گیرد و ساعت دیواری UTC ذخیره می‌کند، ولی `node-postgres` مقدار بدون منطقه را **به وقت محلی پروسه** (`Asia/Tehran`) می‌خواند → هر ردیف ۳٫۵ ساعت عقب‌تر.
- اثر: زمان پیام‌های چت و اعلان‌ها غلط، مهلت ۷ روزه‌ی چالش‌ها ۳٫۵ ساعت زودتر، و توست دعوت بی‌صدا رد می‌شد.
- رفع در `server/db/PostgresDB.js`: `types.setTypeParser(1114, …)` مقدار را UTC تفسیر می‌کند و Pool با `options: '-c timezone=UTC'` بالا می‌آید تا `NOW()` هم همان ساعت دیواری UTC را ذخیره کند. آزمون رفت‌وبرگشت: `created_at` تا ۸۲ میلی‌ثانیه با `Date.now()` یکی شد.

**Verification**: `tsc --noEmit` پاک · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-duel-arena-ui.cjs` → **۷۳/۷۳** (شامل: نشان «۱» روی کاشی، زیرنویس «۱ دعوت منتظر توست»، توست دعوت، پاک‌شدن نشان بعد از بازی، و کل چرخه‌ی چالش/دعوت/داوری/بستن/سقف) · `/tmp/cw-dbg-toast.cjs` → توست ۱۸۴ms بعد از دعوت، و بازکردن مجدد صفحه با دعوتِ موجود: نشان هست، توست نیست · صفر خطای کنسول.

---

### Session 21 (Oct 26, 2026) — نردبان «هدف بعدی» در منو

**درخواست**: پیشنهاد ۳ — بازیکن بداند امتیازش به چه چیزی باز می‌شود، چون قفل ۹×۹ (۵۰۰۰) و موضوع‌ها (تا ۸۰۰۰) وجود داشت ولی هیچ‌جا گفته نمی‌شد.

**پیاده‌سازی** (`components/MainMenu.tsx` + `index.css`): کارت باریک «هدف بعدی» بلافاصله زیر قرص‌های آمار.
- `SIZE_SCORE_THRESHOLDS` و `CATEGORY_SCORE_THRESHOLDS` در یک نردبان ادغام می‌شوند؛ چون چند آستانه مشترک‌اند (۱۵۰۰ = ۷×۷ + سینما/شهرها، ۳۰۰۰ = ۸×۸ + بدن/مشاغل، ۵۰۰۰ = ۹×۹ + تکنولوژی/طبیعت، ۸۰۰۰ = ۱۰×۱۰ + تاریخ/ورزش/هنر)، هر پله یک ردیف است.
- متن: «هدف بعدی **۸۰ امتیاز** / تا ۷×۷ + سینما، شهرها» با نوار پیشرفت نسبی بین پلهٔ قبلی و بعدی (حداقل ۴٪ تا نوار خالی به‌نظر نرسد).
- وقتی همه‌چیز باز شد: «همهٔ جدول‌ها و موضوع‌ها باز است — کارت‌ها و کالکشن را کامل کن» و نوار حذف می‌شود.
- ارقام با `toFa`؛ نوار با `inset-inline` تا در RTL از راست پر شود.

**Verification**: `tsc --noEmit` پاک · `/tmp/cw-goal-ui.cjs` (CDP، موبایل ۴۳۰×۹۰۰) → **۱۲/۱۲**: امتیاز ۰ → «۵۰۰ امتیاز تا ۶×۶» با نوار ۴٪، امتیاز ۱۴۲۰ → «۸۰ امتیاز تا ۷×۷ + سینما، شهرها» با نوار ۹۲٪، امتیاز ۳۰۰۰ → «۲۰۰۰ امتیاز تا ۹×۹ + تکنولوژی، طبیعت»، امتیاز ۸۰۰۰ → پیام کامل‌شدن بدون نوار، بدون سرریز افقی · بازبینی چشمی اسکرین‌شات (`/tmp/goal-ladder.png`، `/tmp/goal-ladder-progress.png`).

---

### Session 22 (Oct 26, 2026) — مهار تورم سکه: بازتنظیم شیرها، حذف آیتم بی‌اثر، رفع باگ برداشت برج

**درخواست**: «تورم سکه رو هم دقیق بررسی کن درستش کن!»

**حسابرسی (قبل)** — درآمد روزانهٔ یک بازیکن فعال در برابر کل کاتالوگ فروشگاه:

| منبع | مقدار روزانه (قبل) | ملاحظه |
|---|---|---|
| پازل روزانه | ۲۵۰ | یک‌بار در روز |
| برج بی‌نهایت | تا ۱۰۰۰ (`DAILY_TOWER_COIN_CAP`) | لوت هر طبقه ≈ ۵۰×شمارهٔ طبقه |
| برد لیگ | ۲۰ به‌ازای هر برد | تک‌نفره، idempotent نیست در روزهای متعدد |
| دوئل | ۲۰ / ۱۰ / ۵ | هر دو طرف پاداش می‌گیرند |
| **جمع** | **≈ ۱۴۰۰–۱۵۰۰** | **در برابر کاتالوگ ۲۶۰ سکه‌ای** |

یعنی یک هفتهٔ بازی، کل فروشگاه را چند بار می‌خرید؛ آیتم‌ها معنا نداشتند.

**حسابرسی (بعد)**:

| منبع | مقدار جدید | دلیل عدد |
|---|---|---|
| پازل روزانه | ۱۵۰ | یک‌بار در روز؛ هنوز بهترین منبع ثابت |
| سقف درآمد برج | ۴۰۰ | یک ران تا طبقه ۱۰ (۱۲۰ سکه) سقف را پر می‌کند؛ عمیق‌تر رفتن دیگر سکهٔ اضافه نمی‌دهد |
| لوت طبقه | نرمال ×۶ / عمیق ×۹ / باس ×۱۲ | طبقه ۳ = ۱۸، طبقه ۵ (باس) = ۶۰، طبقه ۱۰ = ۱۲۰ — جمع ۱۲ طبقه ۶۲۷ که با سقف ۴۰۰ مهار می‌شود |
| برد لیگ | ۱۵ | کمترین کاهش، تا لیگ همچنان انگیزه بماند |
| دوئل | ۱۵ / ۸ / ۳ | هنوز سودده برای برنده، ولی نه بیشتر از پازل روزانه |
| **جمع** | **≈ ۵۷۰–۶۵۰** | **≈ ۲.۵ برابر کاتالوگ** — فضای خرید واقعی بدون اشباع |

**باگ‌هایی که در جریان حسابرسی پیدا شد**:
1. **آیتم «آنلاک مرحله» ۵۰ سکه می‌گرفت و هیچ‌چیز نمی‌داد** — نه فصل باز می‌کرد، نه فیلدی در سرور داشت؛ فقط سینک خالی بود. کلا حذف شد (از `ShopModal`، `usePlayerUI`، `CoinReason` و `SHOP_ITEM_GRANTS`).
2. **برداشت برج بالای ۱۰۰ سکه با HTTP 400 رد می‌شد** — ولی یک ران تا طبقه ۵ حدود ۲۴۰ سکه لوت دارد؛ بازیکن سکه را در کلاینت می‌دید، سرور ردش می‌کرد و در لود بعدی ناپدید می‌شد. سقف غلط با `TOWER_MAX_RUN_COINS = 5000` (فقط گارد ورودی بی‌معنی) جایگزین شد؛ مهار واقعی همان سهمیهٔ روزانه است.

**تمرکز ثابت‌ها** (الگوی «یکی را عوض کن، دیگری را هم عوض کن»):
- `server/economy.js` — تنها منبع حقیقت: `DAILY_PUZZLE_REWARD`, `DAILY_TOWER_COIN_CAP`, `TOWER_MAX_RUN_COINS`, `COIN_PRICES`, `SHOP_ITEM_GRANTS`, `LEAGUE_WIN_REWARD`, `DUEL_COINS`.
- `utils/economy.ts` — آینهٔ نمایشی کلاینت: `DAILY_PUZZLE_REWARD`, `TOWER_DAILY_COIN_CAP`, `TOWER_FLOOR_REWARD`, `HINT_PRICES`, `SHOP_PRICES`.
- همهٔ مقادیر پراکنده در `server/index.js` با ایمپورت جایگزین شدند؛ UIها (`MainMenu`, `TowerLobby`, `Lobby`, `HintModal`, `ShopModal`) دیگر عدد جادویی ندارند.

**نکته‌ای که دست‌نخورده ماند**: اقتصاد بازی‌های شرط‌بندی‌شده (arena/wagered) صفر‌جمع است و به تورم اضافه نمی‌شود، پس ضریب برداشت آن تغییر نکرد. خریدهای فروشگاه هم قیمت‌شان ثابت ماند؛ فقط عرضه (شیرها) کم شد.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۷۹۷ KB / ۲۲۸ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-economy.cjs` (API) → **۱۸/۱۸**: پازل روزانه یک‌بار ۱۵۰، برج ۲۵۰ کامل اعتبار می‌گیرد، سقف ۴۰۰ (`coins=800 daily=400`)، ورودی ۹۹۹۹۹۹ رد می‌شود، `shop_chapterUnlock` حالا ۴۰۰ است، سپر ۱۰۰/بلیت ۳۰ با گرنت درست، بلیت دوم بالای سقف رد می‌شود · `/tmp/cw-economy-ui.cjs` (مرورگر واقعی با حساب سروری) → **۱۷/۱۷**: چیپ روزانه «جایزه ۱۵۰ سکه» و نبود ۲۵۰، فروشگاه دقیقاً ۳ آیتم با ۱۰۰/۸۰/۳۰ و نبود «آنلاک مرحله»، بنر «سقف درآمد روزانه (۴۰۰ سکه)» در لابی برج، قیمت راهنما ۲۰/۵۰، صفر خطای کنسول · لوت طبقات از باندل واقعی: ۶، ۱۲، ۱۸، ۲۴، ۶۰ (باس)، ۳۶، ۴۲، ۴۸، ۵۴، ۱۲۰ (باس)، ۹۹، ۱۰۸.

---

---

### Session 23 (Oct 26, 2026) — بستهٔ نگه‌داشت بازیکن: زنجیره، مأموریت، XP، فصل، کالکشن، فروشگاه

**درخواست**: «به نظرم پیشنهادات خیلی خوبن همه رو اجرا کن» — یعنی هشت پیشنهاد نگه‌داشت، همه در یک بسته.

**۱) زیرساخت سرور (`server/progression.js` + `server/index.js`)**
- `XP` با جدول سطح (هر سطح ۱۰۰ + ۲۰×سطح؟ طبق `xpInfo`) و «صندوق سطح» هر ۵ سطح (`LEVEL_CHEST_COINS = 100`).
- **زنجیرهٔ روزانه**: `daily_streak`, `daily_streak_best`, `daily_streak_last`؛ نردبان ضریب `[1, 1.1, 1.2, 1.3, 1.5, 1.7, 2]`؛ سپر زنجیره (`streakShield`) یک روز غیبت را می‌بخشد و در `planDaily` مصرف می‌شود.
- **سه مأموریت روزانه** از استخر شش‌تایی (`daily`, `grid7`, `solo3`, `duel`, `online`, `tower`) با پاداش ۳۰–۵۰ سکه. انتخاب با هش `userId|date` (پایدار در روز)، یک بار «تغییر» (`.mm-quest-reroll` → `daily_quests.rerolled`). پیشرفت و کامل‌شدن فقط از سمت سرور (`grantProgress` از مسیر match/tower/league/duel) قابل تغییر است؛ کلاینت فقط «کدام مأموریت» را نام می‌برد، نه «انجام شده».
- **فصل ۲۸ روزه**: `season_id`, `season_pending_tier`, `season_reward_claimed`؛ ریست نرم با `SEASON_KEEP_RATIO` و جایزه بر اساس تیری که فصل را در آن تمام کرده‌اید (`rollSeason`).
- **کازمتیک**: `COSMETICS` (قاب‌های `frame_gold/frame_mint/frame_royal` + قاب قفسه‌ها که فقط با کامل‌کردن مجموعه داده می‌شوند + عنوان‌های `title_master/title_explorer/title_streaker`)، در ستون `cosmetics` (JSON) ذخیره می‌شود.
- **پاداش تکمیل ست**: `claimed_sets` با کلید `${shelf}:${setId}` و `SET_REWARD_COINS = 50` برای هر کتاب/اسطورهٔ کامل.
- **رویدادها**: جدول `events` + `POST /api/events` (حداکثر ۲۰ ردیف در هر درخواست، مهمان هم مجاز است).
- ستون‌ها/فیلدهای JSON اضافه‌شده به `profiles`: `xp, daily_streak, daily_streak_best, daily_streak_last, season_id, season_pending_tier, season_reward_claimed` و JSONهای `daily_quests, cosmetics, claimed_sets` (کنار `epic_progress_map, epic_stars, game_history, card_progress, worldmap_cards, items` که از قبل بودند). هر دو درایور (`PostgresDB.js` + migration، `SQLiteDB.js`) هم‌خوان شدند.
- مسیرها: `GET /api/progress`, `POST /api/quests/claim`, `POST /api/quests/reroll`, `POST /api/season/claim`, `POST /api/cosmetics/purchase`, `POST /api/cosmetics/equip`, `POST /api/collection/claim-set`, `POST /api/events`.

**۲) کلاینت — سطوح پیشرفت در منو (`components/MainMenu.tsx` + `index.css`)**
- نوار XP («سطح N» + «X از Y XP»)، کارت **«امروز»** با سه کاشی (زنجیره + ضریب فردا، مأموریت‌های آمادهٔ دریافت، شمارش معکوس بلیت رایگان برج)، خط فصل (`فصل N · M روز مانده` + جایزه/دریافت جایزه)، چیپ **زنجیرهٔ برد**، کارت **مأموریت‌های امروز** با نوار پیشرفت و دکمهٔ دریافت.
- کادر `mm-levelup` برای جشن صندوق سطح و توست سبز برای جایزه‌ها؛ قاب و عنوان روی آواتار/کنار نام (`mm-frame-*`, `mm-title-chip`).
- همهٔ اعداد با `toFa` و کلاس‌های `mm-*` داخل بلوک «PROGRESSION SURFACES» در `index.css` (با نسخهٔ `.dark` و احترام به `prefers-reduced-motion`).

**۳) کالکشن (`components/CollectionScreen.tsx`)**: چیپ «+۵۰ سکه» روی سرِ هر مجموعهٔ کامل + پیل «گرفته شد»؛ دریافت جایزه قاب همان قفسه را هم باز می‌کند؛ بنر اطلاع‌رسانی پایین صفحه.

**۴) فروشگاه (`components/ShopModal.tsx`) بلوک کازمتیک گرفت**: چهارمین مصرفی «🔥 سپر زنجیره» (۴۰ سکه)، بخش «قاب و عنوان» با چهار حالت (خرید/استفاده/در حال استفاده/فقط با کامل‌کردن کالکشن). ضمناً باگ واقعی رفع شد: `useState`ها بعد از `if (!isOpen) return null` اعلام می‌شدند (هوک شرطی)؛ همه به بالای گارد منتقل شدند.

**۵) آنالیتیکس**: `track()` روی `menu_view`, `game_start` (mode/category/size), `shop_open`, `cosmetic_buy`, `set_claim`, `duel_invite`, `quest_claim`, `season_claim`, `level_up`.

**۶) اصلاح متن راهنما (`OnboardingGuide.tsx`)**: عبارت کهنهٔ «۲۴ کتاب داستانی» با توضیح «گنجینه با چهار قفسه» عوض شد.

**۷) باگ هم‌خوانی زنجیرهٔ برد (پیدا شده در تست مرورگر)**: چیپ منو «۱ برد پیاپی» نشان می‌داد در حالی که شمارنده با هر برد **تک‌نفره** بالا می‌رفت، اما جایزهٔ هر ۳ برد فقط در مسیر **رنکد** پرداخت می‌شد — یعنی چیپ چیزی را وعده می‌داد که بازیکن تک‌نفره هرگز نمی‌گرفت.
- `payStreakBonus()` در `server/index.js` تنها سازندهٔ پرداخت شد و **هر دو مسیر** (`/api/match` و `/api/league/result`) از آن استفاده می‌کنند.
- سقف روزانه: `WIN_STREAK_BONUS = { every: 3, coins: 30, dailyCap: 90 }` (آینه در `utils/progression.ts`). بدون این سقف، بردهای پشت‌سرهم تک‌نفره شیر سکه می‌شد؛ همان منطق `DAILY_TROPHY_CAP`. باقی‌ماندهٔ امروز در `/api/progress` به‌صورت `streakBonusLeft` می‌آید و چیپ در حالت تمام‌شده «جایزهٔ امروز گرفته شد» می‌گوید.
- باگ دوم همان مسیر: وقتی سهمیهٔ **تروفی** روزانه تمام می‌شد، `applyLeagueResult` اصلاً صدا زده نمی‌شد و آن برد در `win_streak` ثبت نمی‌شد؛ حالا با `credit = 0` هم فراخوانی می‌شود (تروفی صفر، برد ثبت).
- جایزه در منو هم اعلام می‌شود: صف `takeStreakBonuses()` مثل صف سطح‌ها روی mount منو خالی می‌شود (توست «🔥 N برد پیاپی: ۳۰ سکه جایزه گرفتی»).
- اصلاح راست‌به‌چپ: پیل پاداش مأموریت با LRM (`\u200e+۳۰`) تا علامت مثبت بعد از عدد نیفتد.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۸۱۰٫۶۷ KB / ۲۳۲٫۳۱ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-progress-api.cjs` → **۴۵/۴۵** (زنجیره، سپر، مأموریت/تغییر/دریافت، فصل، کازمتیک، ست، رویدادها، سطح) · `/tmp/cw-progression-ui.cjs` (CDP موبایل ۴۳۰×۹۴۰) → **۲۷/۲۷**: نوار XP و برچسب سطح، کارت امروز با سه کاشی و «۱ روز»، خط فصل، چیپ «۳ برد پیاپی ۳ تا ۳۰ سکه»، سه ردیف مأموریت، عنوان «استاد جدول»، قاب طلایی، دریافت مأموریت (توست سبز + کیف پول ۲۴۸۰→۲۵۱۰)، «عوض شد» و تغییر فهرست، دریافت پاداش مجموعهٔ کامل (+۵۰) · `/tmp/cw-streak-ui.cjs` → **۴/۴**: نه برد → دقیقاً سه جایزه (۳۰+۳۰+۳۰)، `streakBonusLeft = 0`، چیپ «جایزهٔ امروز گرفته شد» · تست API جداگانه با `DAILY_TROPHY_CAP=30`: بردها با تمام‌شدن سهمیهٔ تروفی هم ثبت می‌شوند (streak ۳+ و جایزه سر جایش) · بازبینی چشمی اسکرین‌شات‌ها (`/tmp/menu-top.png`, `/tmp/menu-quests.png`, `/tmp/menu-bottom.png`, `/tmp/progression-menu.png`) · صفر خطای کنسول.

**چیزی که عمداً انجام نشد**: **Web Push** واقعی. ارسال پوش نیاز به کلیدهای VAPID دارد و `server/.env` طبق قواعد این پروژه دست‌نیافتنی است. جایش، کارت «امروز» + شمارندهٔ دعوت‌های چالش روی کاشی منو و نوتیفیکیشن درون‌برنامه‌ای موجود استفاده شد؛ اگر کلیدها بعداً اضافه شد، تنها مسیر `/api/push/subscribe` و ثبت `subscription` در پروفایل باقی می‌ماند.

**یادآوری اقتصادی**: با این بسته، سقف درآمد روزانهٔ یک بازیکن فعال ≈ پازل ۱۵۰ + برج ۴۰۰ + لیگ ۱۵ + دوئل ۱۵ + مأموریت‌ها ۹۰–۱۴۰ + جایزهٔ زنجیرهٔ برد ۹۰ ≈ **۷۶۰–۹۰۰ سکه** است در برابر کاتالوگ ~۳۰۰ سکه‌ای فروشگاه؛ یعنی خرید واقعی هست ولی شیرها هنوز مهارشده‌اند.

---

### Session 24 (Oct 26, 2026) — مأموریت‌های روزانه به شکل چک‌لیست + مسیر رسیدن به آن‌ها

**درخواست**: «الان ماموریت‌های روزانشو کجا داره می‌بینه؟ چیزی باشه تیک بزنی نشونش بدی بهتر نیست؟»

**وضعیت قبلی**: کارت در منو بود ولی چهار بلوک پایین‌تر از کاشی‌های آماری (بعد از XP، کارت «امروز»، هدف بعدی و کارت معمای روزانه)؛ روی موبایل ۴۳۰×۹۴۰ بالای کارت فقط در لبهٔ پایین دیده می‌شد. آیکون هر ردیف `Target` بود — یعنی حتی وقتی مأموریت تمام شده بود، شکل ردیف عوض نمی‌شد جز یک تیک ریز که فقط در حالت *دریافت‌شده* ظاهر می‌شد.

**تغییرات** (`components/MainMenu.tsx` + `index.css`):
- هر ردیف یک **چک‌باکس واقعی** گرفت: مربع خالی با حاشیه در حالت جاری، مربع سبز پُر با تیک وقتی مأموریت کامل شد، و مربع محو با تیک وقتی جایزه‌اش دریافت شد. برچسب ردیف‌های دریافت‌شده خط‌خورده می‌شود. `aria-hidden` روی مربع است چون قابل تغییر نیست و شمارندهٔ `۰/۱` همان اطلاعات را می‌دهد.
- **شمارندهٔ سرتیتر**: «۱ از ۳» کنار عنوان، و «همه انجام شد» (سبز) وقتی هر سه تمام شده‌اند. این شمارنده با دریافت جایزه پایین نمی‌آید — «انجام دادم» و «پول گرفتم» دو چیز مختلف‌اند.
- **مسیر رسیدن**: کاشی مأموریت در کارت «امروز» از یک `<div>` به `<button>` تبدیل شد؛ با لمس، صفحه به کارت چک‌لیست می‌رود و کارت یک بار پالس می‌زند (حلقهٔ بنفش ۱٫۴ ثانیه‌ای) تا چشم رویش بیفتد. یک `▾` کوچک هم گوشهٔ کاشی گذاشته شد، چون ظاهرش با دو کاشی غیرفعال کنارش یکی بود.
- پالس با `prefers-reduced-motion` خاموش می‌شود.

**نکته‌ای که در تست پیدا شد**: `scrollIntoView({behavior:'smooth'})` در تست‌های CDP هرگز حرکت نمی‌کند (هدف پس‌زمینه است و `requestAnimationFrame` throttle می‌شود)؛ ضمناً همان throttle باعث می‌شود `.mm-rise` در اسکرین‌شات‌های headless روی `opacity:0` بماند و صفحه خالی به‌نظر برسد. برای همین پرش «فوری» انتخاب شد (در مرورگر واقعی هم FSOL/مستقیم است) و برای اسکرین‌شات، استایل `animation:none` تزریق می‌شود. **این را با باگ چیدمان اشتباه نگیرید.**

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۸۱۱٫۲۶ KB / ۲۳۲٫۵۰ KB gzip) · `/tmp/cw-quest-checklist.cjs` → **۲۰/۲۰** (سه ردیف و سه چک‌باکس، تعداد تیک‌ها == تعداد مأموریت‌های تمام‌شدهٔ سرور، سبزِ پُر برای تمام‌شده و خالیِ حاشیه‌دار برای ناتمام، «۲ از ۳»، اسکرول از کاشی «امروز»، پالس و پاک‌شدنش، خط‌خورده‌شدن و حفظ تیک بعد از دریافت، ثابت‌ماندن شمارنده، صفر خطای کنسول) · `/tmp/cw-progression-ui.cjs` → **۲۷/۲۷** (بدون رگرسیون در دریافت مأموریت/تغییر/کالکشن) · بازبینی چشمی `/tmp/quest-top.png`، `/tmp/quest-checklist.png`، `/tmp/quest-checklist-claimed.png`.

---

### Session 25 (Oct 27, 2026) — منوی فشرده + شیت «امروز من»، تنزل معمای روزانه، ادغام هدف با بازی سریع، برق روی کاشی‌ها

**درخواست‌ها**: (۱) «خیلی خیلی صفحه شلوغ شده… یه کاری کنیم انقدر شلوغ به نظر نیاد» → گزینهٔ تأییدشده: کارت فشرده + شیت. (۲) «هدف بعدی و بازی سریع رو یه کاری کن تو یه باکس قرار بگیرن… این معمای روزانه انقدر باکس مهمی نیست که اینطور داره بولد میشه… بقیه قسمت‌ها ارزش اینکه افکت برق زدن خاص خودشون رو داشته باشن بهتره.»

**۱) کارت فشرده + شیت** (`components/MainMenu.tsx` + `index.css`): بلوک XP + کارت «امروز» (سه کاشی) + فصل + زنجیرهٔ برد + کارت مأموریت‌ها با **یک ردیف ۵۷–۷۰ پیکسلی** (`‏.mm-glance`) جایگزین شد: سطح و `into/need`، زنجیره (با `×ضریب` فردا)، تعداد مأموریت‌های مانده/آماده، `‹` و یک خط XP سه‌پیکسلی روی لبهٔ پایین. با یک لمس، شیت پایین‌کشویی «امروز من» باز می‌شود: چک‌لیست مأموریت‌ها + تغییر، کاشی‌های زنجیره/بلیت، چیپ زنجیرهٔ برد، نوار XP و خط فصل. شیت `role=dialog` + `aria-modal` دارد، اسکرول پشتش قفل می‌شود (`.mm-screen.sheet-open .mm-scroll{overflow:hidden}`)، با کلیک پس‌زمینه / × / Escape بسته می‌شود، و لمس داخلش آن را نمی‌بندد.

**۲) معمای روزانه از هیرو به نوار**: کارت `‏.mm-hero` (h2 + چیپ‌ها + CTA + `‏.mm-sheen` + بج «انجام شد») حذف و با یک نوار ~۵۷ پیکسلی جایگزین شد: آیکون ۳۲px، «معمای روزانه» + چیپ جایزه (طلایی `‎+۱۵۰` / سبزِ وضعیت)، خط «۱۰×۱۰ · فقط یک بار در روز»، چیپ ضریب زنجیره (فقط وقتی زنجیره > ۰) و دکمهٔ «شروع»/«فردا». **هیچ برقی روی این نوار نیست.** حالت انجام‌شده هم دیگر گرادیان سبز و بجِ فِلِت‌شده ندارد: پس‌زمینهٔ همان شیشهٔ روشن، تیکِ کم‌رنگ و دکمهٔ خط‌دارِ غیرفعال — یک وضعیت است، نه یک دعوت دوباره.

**۳) هدف بعدی داخل «بازی سریع»**: بلوک جدا حذف شد؛ نردبان حالا بالای `Controls` در همان باکس `‏.mm-quick` است (`‏.mm-goal-inline`: نوار باریک با آیکون `Target`، متن «هدف بعدی N امتیاز / تا ۷×۷ + سینما، شهرها» و نوار پیشرفت). دلیلش دقیقاً همان است که کاربر گفت: «هدف بعدی» توضیح می‌دهد انتخاب‌های همین باکس چه چیزی را باز می‌کنند.

**۴) برق روی کاشی‌های حالت بازی**: چهار کاشی (`گنجینه`، `برج بی‌نهایت`، `نبرد آنلاین`، `چالش دوئل`) هر کدام یک `<span class="mm-sheen">` گرفتند با تأخیر ۰٫۲ / ۲٫۴ / ۴٫۱ / ۵٫۸ ثانیه (چرخهٔ ۷٫۵ ثانیه) تا هیچ‌وقت هم‌زمان ندرخشند. `pointer-events:none` و `z-index:-1` — چون `‏.mm-glass` با `backdrop-filter` خودش بسترِ انباشت می‌سازد، نوار بالای پس‌زمینهٔ کاشی و زیر متن/آیکون می‌ماند.
- **اندازه‌گیری مهم**: نوار سفید (`rgba(255,255,255,.5)`) روی کاشیِ ۶۲٪ سفید فقط **۶ از ۲۵۵** اختلاف پیکسل می‌داد — یعنی عملاً دیده نمی‌شد. رنگ نوار به لهجهٔ خودِ کاشی تغییر کرد (`--sheen` روی `.t-violet/.t-blue/.t-teal/.t-pink`) با هستهٔ ۰٫۳۰: اختلاف به **~۵۰** رسید و حالا یک باریکهٔ نورِ رنگیِ محسوس است، ولی هم‌خانوادهٔ همان کاشی. در دارک‌مود `mix-blend-mode:screen` تا نوار نور اضافه کند نه رنگِ مات.

**اعداد قبل/بعد** (موبایل ۴۳۰×۹۴۰، CDP):

| اندازه | قبل | بعد |
|---|---|---|
| ارتفاع کل صفحهٔ منو | ۱۸۹۶px | **۱۲۷۹px** |
| جای اولین کاشی بازی | y≈۹۹۵ (زیر خط تاشو) | **y=۳۱۲** |
| ردیف وضعیت | XP + کارت امروز + فصل + زنجیرهٔ برد + مأموریت‌ها (≈۴۵۰px) | **۵۷–۷۰px** |
| کارت معمای روزانه | ~۱۸۰px + برق | **۵۷px، بدون برق** |

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۸۱۱٫۹۳ KB / ۲۳۲٫۵۹ KB gzip) · `/tmp/cw-today-sheet.cjs` → **۴۷/۴۷** (ارتفاع صفحه، کاشی اول بالای خط تاشو، ردیف فشرده، نوار روزانه ≤۷۰px و بدون `.mm-sheen`، چهار برق با چهار تأخیر یکتا و `pointer-events:none`، هدف فقط داخل `.mm-quick`، باز/بسته‌شدن شیت از سه مسیر، قفل اسکرول، دریافت جایزه داخل شیت، دارک، صفر خطای کنسول) · `/tmp/cw-daily-fresh.cjs` → **۲۳/۲۳** (حساب تازه: آیکون آبی، چیپ `‎+۱۵۰`، «شروع» فعال؛ کلیک واقعاً بازی روزانه را می‌سازد — جدول رندر شد و روز هم در localStorage و هم روی سرور مصرف شد؛ برگشت به منو: تیک کم‌رنگ + «فردا» غیرفعال) · `/tmp/cw-progression-ui.cjs` → **۳۴/۳۴** (بازنویسی‌شده برای معماری تازه: سطوح منو + همهٔ جزئیات داخل شیت + دریافت/تغییر + کالکشن) · `npm run test:mp` → **۳۷/۳۷** · بازبینی چشمی `/tmp/daily-fresh.png`، `/tmp/daily-fresh-done.png`، `/tmp/sheet-open.png`، `/tmp/tiles-grid.png`.

**هشدارهای CDP که دوباره به درد خورد**: هدفِ پس‌زمینه `requestAnimationFrame` را جلو نمی‌برد، پس `.mm-rise` روی `opacity:0` و شیت روی `translateY(100%)` می‌ماند؛ تست‌ها باید `animation:none` تزریق کنند و برای اندازه‌گیری برق از تفاضل پیکسلی دو فریم استفاده کنند (نه از اسکرین‌شات چشمی). ضمناً mount سرد برنامه ~۵–۶ ثانیه طول می‌کشد: قبل از seed کردن localStorage باید منتظر `#root` ماند.

---

### Session 26 (Oct 27, 2026) — افکت تازه برای «برج بی‌نهایت» و «نبرد آنلاین»: قوسِ نوری روی لبه

**درخواست**: «افکت گنجینه و چالش دوئل رو دوست دارم؛ برای برج بی‌نهایت و نبرد آنلاین یه افکت جذاب دیگه بذار» — یعنی دو ردیف پهن (`گنجینه`، `چالش دوئل`) همان گذرِ نور مورب روی شیشه را نگه دارند و دو کاشی نصف‌عرض افکت جدا و متفاوتی بگیرند.

**طراحی**: دو ردیف پهن «خطی»‌اند (نوار نور از عرض کارت رد می‌شود)؛ دو کاشی نصف‌عرضِ دیگر «دورانی + شعاعی + فقط روی لبه» گرفتند تا هیچ‌وقت با عنوان/زیرعنوان تلاقی نکند و کلاس افکت تکرار نشود:
- `::before` یک قوس ~۲۱٪ از محیط با سرِ سفیدِ داغ (`rgba(255,255,255,.98)`) و دنبالهٔ رنگیِ اکسنتِ خودِ کاشی، که با `@property --mm-beam` + `conic-gradient(from var(--mm-beam),…)` دور کارت می‌چرخد (`mm-beam 6.4s linear infinite`).
- قوس با `padding:2.5px` + ماسک دو‌لایه (`mask-composite:exclude`) به یک حلقهٔ لبه‌ای محدود شده؛ `filter:drop-shadow(0 0 7px rgba(var(--sheen),.6))` همان قوس را درخشان می‌کند (سایه دنبالِ شکلِ ماسک می‌افتد، پس به‌شکل یک شهاب دور کارت می‌چرخد).
- `::after` همان هالهٔ نفس‌کش پشت آیکون (`mm-halo 5.6s`) است.
- عدم‌هم‌زمانی: `‎.mm-tile.t-pink::before{animation-delay:-3.2s}` و `‎.t-pink::after{animation-delay:1.9s}` تا برج و نبرد هیچ‌وقت با هم نچرخند.
- `‎.mm-tile.locked::before/::after{display:none}` — کاشی قفلِ نبرد «دعوت به ورود» است، نه چیزِ زنده.

**چیزهایی که در مسیر رد شدند**: «ذرات ریز شناور» (خوانا نبود، یکی روی زیرعنوان «رقابت زندهٔ PvP» می‌افتاد) و «حلقهٔ سونار» (در لبهٔ کارت بریده می‌شد و شکل مستطیلِ گرد بدی می‌گرفت). نسخهٔ اولِ خودِ قوس هم ۳۶٪ محیط بود (۵۸٪→۹۴٪) و در حالت روشن مثل یک حاشیهٔ رنگیِ یک‌دست دیده می‌شد؛ به ۲۱٪ (۷۱٪→۹۲٪) کوتاه شد و سرِ سفیدش به ۸۳٪ رفت.

**نکتهٔ پیاده‌سازی**: `animation` روی یک custom property ثبت‌شده فقط با `@property` کار می‌کند؛ بدون آن قوس ساکن می‌مانَد (که باز هم «لبهٔ روشن» خوانده می‌شود، پس خرابیِ زشت نیست). ماوس/کلیک دست‌نخورده است چون `pointer-events:none` روی هر دو شبه‌عنصر است.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۸۱۱٫۸۲ KB / ۲۳۲٫۵۹ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-today-sheet.cjs` → **۵۱/۵۱** (به‌روزشده: فقط ۲ ردیف پهن `.mm-sheen` با تأخیرهای یکتا، دو کاشی نصف‌عرض با `conic-gradient` + `mm-beam 6.4s` + `pointer-events:none` + `drop-shadow`، تأخیرهای متفاوت، هاله روی هر دو، و خاموش‌شدن هر دو شبه‌عنصر روی کاشی قفل) · `/tmp/cw-beam-verify.cjs` → **۴/۴**: fps با افکت ۵۴ در برابر ۵۶ بدون افکت (≈۴٪ هزینه، دو المان ۱۹۴×۱۵۲)، `prefers-reduced-motion` هر دو انیمیشن را خاموش می‌کند و قوس ساکن سر جایش می‌ماند، صفر خطای کنسول · `/tmp/cw-daily-fresh.cjs` → **۲۳/۲۳** · `/tmp/cw-progression-ui.cjs` → **۳۴/۳۴** · بازبینی چشمی `/tmp/real-strip-light.png`، `/tmp/real-strip-dark.png`، `/tmp/menu-beam-light.png`، `/tmp/menu-beam-dark.png` (قوس آبی روی برج، قوس رز روی نبرد؛ در دارک حالت شبیه شهابِ روشن روی لبه است).

**هشدار CDP (تازه)**: در تب پس‌زمینهٔ headless اصلاً `requestAnimationFrame` اجرا نمی‌شود و اندازه‌گیری fps بی‌معنی می‌شود؛ با `Emulation.setFocusEmulationEnabled({enabled:true})` باز می‌شود. برای مقایسهٔ هزینهٔ افکت باید fps «با افکت» و «بدون افکت» را در همان صفحه اندازه گرفت (نسبت ≥۹۰٪)، نه یک عدد مطلق.

---

### Session 27 (Oct 27, 2026) — مأموریت‌های روزانه دوباره روی صفحه دیده می‌شوند

**شکایت**: «خب چالش های روزانه چی شد؟ اصلا نیست تو صفحه دیگه؟» — مأموریت‌ها حذف نشده بودند، اما در فشرده‌سازی Session 25 فقط یک سلول از نوار «امروز» برایشان مانده بود که **عددِ خالی** را در خط درشت می‌نوشت («۳ مانده») و واژهٔ «مأموریت» را در کپشن ۹ پیکسلی پنهان می‌کرد؛ نتیجه اینکه نوار اصلاً نمی‌گفت موضوعش چیست.

**تغییرات** (`components/MainMenu.tsx` + `index.css`):
- خط درشت سلول سوم حالا **اسم** است نه عددِ بی‌موضوع: «۳ مأموریت» (توازی با «سطح ۲» و «۱ روز» در دو سلول دیگر). کپشن همان وضعیت را می‌دهد: «۲ آماده» → «۳ مانده» → و وقتی همه گرفته شد «امروز تمام».
- حالت آماده‌بودن فقط به حاشیهٔ سبز و آیکون نبض‌دار نوار بسنده نمی‌کند: خودِ عدد و کپشن سبز می‌شوند (`.mm-glance-item.gift.ready b/i` در `index.css`)، تا «دو جایزه منتظر است» بدون باز کردن شیت هم خوانده شود.
- چک‌لیست کامل (سه ردیف با چک‌باکس، نوار پیشرفت، دکمهٔ دریافت و «تغییر») همچنان در شیت «امروز من» است که با همان یک لمس روی نوار باز می‌شود — ارتفاع صفحه و چیدمان دست‌نخورده ماند (۱۲۷۹px، کاشی اول روی ۳۱۲px).

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۸۱۱٫۹۱ KB / ۲۳۲٫۶۰ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-today-sheet.cjs` → **۵۱/۵۱** (به‌روزشده: نوار باید «۳ مأموریت» + وضعیت آماده/مانده را با هم داشته باشد؛ متن نوار بعد از دریافت جایزه از «۳ مأموریت ۱ آماده» به «۳ مأموریت ۲ مانده» می‌رود) · `/tmp/cw-progression-ui.cjs` → **۳۴/۳۴** · بازبینی چشمی `/tmp/sheet-home.png` (سلول سبز «۳ مأموریت / ۱ آماده» روی نوار) و `/tmp/sheet-open.png` (چک‌لیست داخل شیت).

**رفع شکنندگی هارنس**: مجموعهٔ سه‌مأموریتی از شش گزینه قرعه‌کشی می‌شود و کاربر هارنس هر اجرا شناسهٔ تازه دارد؛ اگر قرعه فقط `duel/online/tower` می‌افتاد، هیچ مأموریتی با سه بازی seed شده کامل نمی‌شد و بلوک «دریافت جایزه» بی‌دلیل قرمز می‌شد (یک اجرا از بیست). حالا هارنس اگر هیچ مأموریت کاملی نبیند، یک‌بار `POST /api/quests/reroll` می‌زند و وضعیت را دوباره می‌خواند.

---

### Session 28 (Oct 28, 2026) — زبان متریال «سفال و کاغذ»: دیوار خشت، حک‌شدن کارت‌ها، سینیِ نقشه و جدولِ مرکب‌کشیده

**درخواست‌های این بسته** (همه پس از تأیید پنج موکاپ `vibe_images/hybrid-clay-paper-*`):
۱) «این افکت‌های نقطه‌نقطه که هیچ‌چیز را نشان نمی‌دهند دقیقاً زیر کارت‌ها چیست؟ اگر استفاده‌ای ندارند حذفشان کن»؛
۲) «پس‌زمینهٔ خشت قشنگ مشخص باشد که خشت است»؛
۳) «کارت‌ها انگار توی خشت حک شده‌اند — دقیقاً مثل طرحی که توافق کردیم».

**۱) قانون material (مبنای همهٔ تغییرات بعدی)**
سازه و پوسته = **خشتِ پخته** (terracotta، پخِ برجسته، نور از بالا-چپ)؛ محتوا و سند = **کاغذ کرم** که داخل خشت گذاشته شده. نقطه فقط وقتی مجاز است که **حفرهٔ پیشرفت** باشد (مثل سینیِ موکاپ: یک حفرهٔ طلایی و بقیه خالی). ردیف نقطهٔ بی‌محتوا حذف می‌شود.

**۲) حذف نقاط بی‌معنی**
- `components/CollectionScreen.tsx`: ردیف سه‌تایی `<i>` زیر هر کارت (`ChapterCard`) حذف شد؛ جای آن `coll-card-band` به **شیارِ بریده‌شده در پایِ صفحه** تبدیل شد (طلایی = فصل باز شده، خالی = قفل).
- کل بلوک `.coll-pips` از `index.css` پاک شد.
- عمداً **ماندند**: `.mm-dot` (نشان شمارش دعوت روی کاشی منو — عدد واقعی)، `.map-pin-dot` (پرچم نشانگر)، `.cg-menu .mm-band.tone-*` و `.mm-dots` روی هیرو (همان حفره‌های موکاپ خانه).

**۳) خشتِ خوانا — توکن `--tex-brick`**
آرایهٔ کاهگلِ running bond به‌صورت SVG درون‌خطی (`168×112`، ارتفاع هر ردیف ۵۶، درزِ ردیف دوم روی x=84). هر درز **دو بار** کشیده می‌شود: خطِ تیرهٔ برش (`#4A2412`، opacity .10، پهنای ۱٫۷) و خطِ روشنِ نورگرفته (`#FFE3C6`، .09، ۱٫۲) کمی پایین‌تر/راست‌تر — پس یک فرورفتگی روی دیوارِ تخت، «آجرچیده» خوانده می‌شود نه «گچِ بژ».
نسخهٔ اول (۱۳۲×۸۸ و opacity .12/.10) شبیه کاشیِ سرویس بهداشتی شد؛ آجر بزرگ‌تر و درز کم‌رنگ‌تر شد.

**۴) `.clay-wall` — سطحِ قابل‌استفادهٔ دوباره**
`--tex-grain` (دو باند نویز: لکه‌های درشت `baseFrequency .028` + شنِ ریز `.62`، کاشی ۲۲) روی `--tex-brick` (۱۶۸×۱۱۲) روی نورِ شعاعی بالا روی گرادیان پایه؛ `background-blend-mode: overlay, normal, normal, normal` (دارک: `soft-light,…`)؛ پخِ فرورفته `inset 0 2px 0 …, inset 0 -10px 22px …`؛ `color:#FFF3E4`.
دو کمکیِ متن: `.on-clay` (کرمِ فشرده در خاک + سایهٔ برش) و `.on-clay-2` — هر دو با نسخهٔ دارک، و **اسکوپ‌شده زیر `.clay-wall`** تا صفحه‌های کاغذی که خودشان `color:var(--ink)` می‌گذارند خراب نشوند.
کاربردها: ریشهٔ `components/EpicLibrary.tsx` (گنجینه)، ریشهٔ `components/CollectionScreen.tsx` (کالکشن)، و عمیق‌کردن `.cg-menu` روی همان دیوار.
**عمداً روشن ماند**: `#root` و `.cg-sand` — صفحه‌های داستانی/نقشه/نتیجه مرکبِ تیره را مستقیم روی همان ماسه می‌نویسند، تیره‌کردنشان کنتراست را می‌شکند.

**۵) حک‌شدن کارت‌ها**
- **قفسهٔ گنجینه** (`shelf-line` / `shelf-line-books` / `shelf-board`): ردیف کتاب یک **طاقچهٔ بریده‌شده در خشت** است — قابِ دیوار، جیبِ فرورفته (سایهٔ تیرهٔ بالا + لبهٔ روشنِ برشِ کناری) و تختهٔ پیش‌آمد که روی پایِ کارت‌ها می‌افتد.
- **کالکشن**: هر دو گرید داخل `.coll-bay` جدید رفتند (همان برشِ طاقچه، بی‌تخته)؛ متنِ سرِ هر مجموعه از اینکاهِ کرمِ حک‌شده (`.coll-set-txt b/i`) و نوار پیشرفت از شیارِ بریده شد؛ `.coll-claimed` به یک **اینلاکِ کرم** روی خشت تبدیل شد.
- **نقشهٔ جهان**: پنل پایین از «برگهٔ کاغذ روی نقشه» به **سینیِ خشتیِ قالب‌گرفته** (`map-tray`) تبدیل شد — همان کاهگل و پخِ برجسته؛ ردیف **حفره‌های پیشرفت** (`map-tray-holes` / `map-hole.won`) با دو **شیار** (`map-tray-slot`) در دو طرفش، دقیقاً مثل موکاپ؛ صفحه‌های فصل داخل جیبِ فرورفته (`map-tray-bay`) ایستاده‌اند.
  فصل‌های بازنشده دیگر کاغذ ندارند: کلاس `map-plate-locked` آن‌ها را **خشتِ لخت با نوشتهٔ حک‌شده** می‌کند (کاغذ فقط وقتی گذاشته می‌شود که فصل باز شود)، فصلِ بعدی با `map-plate.now` یک حاشیهٔ خط‌خطی + هالهٔ زعفرانی می‌گیرد تا در دارک با خشت اشتباه نشود.
  **باگِ واقعی که در تست پیدا شد**: کلاس `map-plate` هم‌زمان روی المانِ قفل می‌نشست و چون بعد از `map-plate-locked` در فایل آمده بود، `background-color` را برمی‌گرداند → کارت‌های قفل کرمِ بی‌متن می‌شدند (متن هم کرم بود). حالا سه حالت **مفهوم‌ساز**‌اند: `map-plate` / `map-plate now` / `map-plate-locked`.
- **میزِ بازی**: `.cg-playfield` از ماسه به **دیوارِ خشت** تبدیل شد (grain + brick + نور بالا، هر دو تم) و `.cg-keydeck` هم همین آجر را گرفت.
- **جدول**: قابِ سفالی (`cg-board`) حالا یک **برگهٔ مرکب‌کشیده** نگه می‌دارد — `.cg-board-sheet` با پس‌زمینهٔ مرکب و گپ ۱px، یعنی خطوطِ جدول **مرکب‌اند نه درزِ گِل** و خانه‌های سیاه دقیقاً روی همان خطوط می‌نشینند (موکاپِ بازی). برای این کار یک لایهٔ میانی به `components/CrosswordGrid.tsx` اضافه شد.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۹۱۸٫۹۵ KB / ۲۵۸٫۴۲ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · هارنس‌های CDP (موبایل ۴۳×۹۴۰، `animation:none` تزریق‌شده، `setFocusEmulationEnabled`) همگی **صفر استثنا**: `cw-redesign-shots --only=collection` (روشن+تاریک)، `cw-shelf-shot` (روشن+تاریک)، `cw-game-shot` (روشن+تاریک)، و هارنس تازهٔ `/tmp/cw-mapshot.cjs` (گنجینه → فوتبال → تپ روی نشانگر با رویداد PointerEvent دستی → سنجش سینی: `h=167, holes=4, won=0, plates=4`) · بازبینی چشمی `/tmp/rd-light-maptray.png`، `/tmp/rd-dark-maptray.png`، `/tmp/rd-light-game.png`، `/tmp/rd-dark-game.png`، `/tmp/rd-light-collection.png`.

**نکته برای ادامه**: درازای آجر ۱۶۸×۱۱۲ در `--tex-brick` با `background-size` در چهار جا (`clay-wall`، `cg-menu`، `cg-playfield`، `cg-keydeck`) و در `.coll-bay`/`.map-tray*` بی‌قواره تکرار شده؛ اگر روزی اندازه عوض شود، همه باید هم‌خوان بمانند. همچنین **دریا/خشکیِ خودِ `public/images/world-map.svg` هنوز رنگِ کاغذی دارد** — موکاپ دریا را آبیِ سفالی می‌خواهد؛ این تصمیم باز مانده است.

---

### Session 29 (Oct 28, 2026) — تکمیل زبان سفال: اعداد فارسی، پیش‌نمایش کازمتیک، صفرِ خوانا، نوار تبِ شب

**وضعیت پایه**: `tsc --noEmit` پاک · `npm run build` OK (۹۲۱٫۵۳ KB / ۲۵۹٫۱۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · `/tmp/cw-sweep.cjs` روشن و `--dark` → **صفر استثنا** · `/tmp/cw-rooms-shot.cjs` روشن و `--dark` → **صفر استثنا** (حالا مودال راهنما در دارک هم گرفته می‌شود: `/tmp/rm-dark-hint.png`).

**۱) درزِ زیرِ کارت‌ها باگ نبود**
شکِ «خط‌های هر ۱۶۸ پیکسل» با رندر ایزوله (`/tmp/cw-brick-probe.cjs` → `/tmp/brick-probe.png`) و خواندن مسیرهای SVG بررسی شد: چیدمان **running bond** درست است (درز ردیف اول روی x≡۰، ردیف دوم روی x≡۸۴٫۸۵) و خط‌های محو، همان درزِ عامدانهٔ ۰٫۱۰ هستند. هیچ تغییری در `--tex-brick` داده نشد.

**۲) اعداد فارسی در لابی برج** (`components/TowerLobby.tsx`)
`faNum()` محلی اضافه شد (هم‌خانوادهٔ `toFa`).
- شمارندهٔ بلیت: «۱ از ۲ بلیت» — و همان ردیف `dir={isFA ? 'rtl' : 'ltr'}` گرفت، چون **کل برنامه عمداً `dir` را در سطح سند ندارد** (`index.html` با `lang="en"` و بدون `dir`؛ هر صفحه خودش بلوک‌هایش را RTL می‌کند). بدون آن، «۱» سمت چپِ عبارت می‌نشست و ترتیب خواندن برعکس می‌شد. اسمِ «بلیت» هم به مخرج چسبید، چون «۱» تنها در ۳۶px فقط یک خطِ ایستاده است.
- تایمر پر شدن: `۵:۵۹` به‌جای `5:59`.
- رکورد طبقه وقتی صفر است رسم نمی‌شود (همان قاعدهٔ «صفرِ فارسی در ۱۰px یک نقطهٔ تنها است»).
- بازه‌ها با «تا» بازنویسی شدند («طبقه ۱ تا ۳ — آسان، بدون زمان»، …) و خطِ باس: «طبقه‌های ۵، ۱۰، ۱۵… باس!».
- «بلیط» → «بلیت» (یکدست با بقیهٔ فایل و `Lobby.tsx`)، و `‎+۱` با LRM تا علامت مثبت بعد از عدد نیفتد.

**۳) پیش‌نمایش واقعی کازمتیک در فروشگاه** (`components/ShopModal.tsx`)
هر هفت ردیف قاب، آیکونِ عمومی `InkShield` را نشان می‌داد؛ یعنی خرید یک قاب هیچ‌چیز را پیش‌نمایش نمی‌کرد. حالا نقشهٔ `FRAME_TONE` (آینهٔ رنگ‌های `.mm-frame-*` در CSS) هر ردیف را با **حلقهٔ همان قاب و آواتار خود بازیکن** داخلش رسم می‌کند. قابِ خریده‌نشده رنگش را **نگه می‌دارد** (رنگِ حلقه همان چیزی است که فروخته می‌شود) و فقط با خطِ **داش‌داش و شفافیت ۰٫۶۲** می‌گوید «هنوز مالِ تو نیست» — نسخهٔ اول با `grayscale(.7)` همهٔ حلقه‌ها را خاکستری می‌کرد و مقایسهٔ رنگ‌ها را ناممکن می‌ساخت. عنوان‌ها همان `InkScroll` را نگه داشتند.
در همین مسیر یک هم‌پوشانی رنگی هم رفع شد: قابِ `football` و `mint` هر دو `#8FA37E` بودند و دو جایزهٔ دو قفسه یکسان دیده می‌شدند؛ فوتبال به زیتونیِ `#7C8C55` رفت.

**۴) صفرِ تنها در قرصِ رکورد** (`components/MainMenu.tsx`)
رکورد صفر در قرص آمار «۰» می‌نوشت و کنار مدالِ رُز مثل یک لکهٔ گرد خوانده می‌شد؛ حالا خط تیره (`—`) می‌نشیند.

**۵) حالت خالی دوستان** (`components/SocialPanel.tsx`)
پیام «هنوز دوستی ندارید!» بالای یک پنل بلندِ خالی می‌شود و تنها راهِ اقدام یک لینکِ زیرخط‌دار ریز بود. حالا بلوک با `min-h-[52vh]` وسط‌چین است، یک خط توضیح دارد («کد دوستیِ دوستت را در تب «افزودن» وارد کن…») و دکمهٔ سفالی `cg-btn-clay` با `UserPlus`.

**۶) نوار تبِ پایین در دارک، شبِ سفالی شد** (`index.css`)
`.cg-menu .mm-tabbar` یک گرادیانِ اسلیت می‌کشید. در روشن، `:root:not(.dark) .mm-tabbar` (اختصاص ۰٫۳٫۰) رویش را می‌گرفت؛ در تاریک اما `.dark .cg-menu .mm-tabbar` (۰٫۳٫۰ و **بعدتر در فایل**) از `.dark .mm-tabbar` جلو می‌زد → تنها جسمِ خاکستریِ اتاقِ شب همان نوار بود. حالا `.cg-menu .mm-tabbar` فقط هندسه است و اوررایدِ تاریک، خشتِ شب است: `linear-gradient(180deg,#4A3526,#352419)` با هایلایتِ درونِ گرم.

**Verification**: `tsc --noEmit` پاک · `npm run build` OK (۹۲۱٫۵۳ KB / ۲۵۹٫۱۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · sweepها و rooms روشن/تاریک → صفر استثنا · `cw-redesign-shots` هر **۱۰ صحنه در هر دو تم** → صفر استثنا (منو، فروشگاه، گنجینه، کالکشن، برج، چالش، نبرد، پروفایل، رتبه‌ها، دوستان) · بازبینی چشمی `/tmp/rm-light-tower.png` و `/tmp/rm-dark-tower.png` (ترتیب «۱ از ۲ بلیت» و بازه‌های «تا»)، `/tmp/rd-light-shop.png` و `/tmp/rd-dark-shop.png` (هفت حلقهٔ رنگی قاب با آواتار)، `/tmp/sw-light-me.png` و `/tmp/sw-dark-home.png` (خط تیرهٔ رکورد و نوار تبِ گرم) · صفر خطای کنسول.

**باز مانده (عمدی)**: رنگِ دریا/خشکیِ `public/images/world-map.svg`؛ کد مردهٔ مینی‌گیم کارت (`CardGallery`/`CardStoryModal`/`data/cards.ts`) که بدون تأیید حذف نمی‌شود؛ `public/images/worldmap/card-back.svg` که فعلاً ارجاعی ندارد ولی روی دیسک مانده؛ و کارهای استخر واژه (#۴۸–#۵۱).

---

### Session 30 (Oct 28, 2026) — جدولِ سفالی مطابق موکاپ: سینیِ راهنما، دکمهٔ ایموجی فقط آنلاین، و گذرِ نور روی کلمهٔ کامل‌شده

**زمینه**: دو پوستر سفالی (نقشه/جدول) تأیید شده بود و پیاده‌سازی «کل نقشه و جدول با همان عکس‌ها + افکت‌های جذاب + مه واکنشی و موج آب» درخواست شد. نقشه (پوستر، موج، مه) در Session قبل تمام شد؛ این Session سه اختلاف باقی‌ماندهٔ **جدول** را بست.

**۱) سینیِ سفالیِ راهنما** (`components/GameView.tsx` + `index.css`)
نوار راهنما در حالت کنسول روی یک لبهٔ سفالی نشست: `<div className="w-full max-w-2xl shrink-0 cg-clueslab">{clueBar}</div>`. خودِ `cg-clueslab` یک پلاک خشتی با `--tex-grain` و پخِ برجسته است (روشن: `#C7845F→#A96543`، تاریک: `#46301D→#2F1E11`). قبلاً نوار لخت روی پس‌زمینه شنا می‌کرد و در موکاپ نبود.

**۲) دکمهٔ ایموجی: فقط آنلاین** (`components/ClueEmojiKnob.tsx` جدید)
- دکمهٔ سبزِ سه‌نقطهٔ موکاپ حالا واقعاً دکمهٔ واکنش بازی است: ۶ ایموجی (`🔥😂💀👏😤🤝`) در یک کارتِ کاغذیِ ۳×۲ که بالای دکمه باز می‌شود، با بستن روی کلیک بیرون و `Escape`.
- ارسال از همان مسیر موجود multiplayer (`sendEmoji`) انجام می‌شود، پس ایموجی روی هر دو کلاینت شناور می‌شود.
- **جای درست در RTL**: دکمه اولین فرزند ردیف `dir="rtl"` است (`ActiveClueBar` پراپ `knob` گرفت و `{clay && knob}` را قبل از سینی رندر می‌کند)؛ اگر بعد از سینی می‌آمد، در RTL به لبهٔ چپ می‌پرید. سینی `flex-1 min-w-0` است، پس در بازی تک‌نفره بدون دکمه تا انتهای راست کشیده می‌شود (همان خواستهٔ قبلی).
- دکمهٔ شناورِ ایموجیِ قدیمی در `GameFeedback` کامل حذف شد (پراپ‌های `isMultiplayer`/`playerId` هم رفتند) تا دو ورودی برای یک کار نباشد.

**۳) افکتِ «کلمه کامل شد»** (`components/CrosswordGrid.tsx` + `index.css`)
`cell-word-complete` از قبل در CSS بود ولی هیچ‌جا کلاس نمی‌گرفت (کد مرده). حالا یک **نوار نورِ اندازه‌گیری‌شده** از روی خودِ کلمه رد می‌شود:
- افکت با مقایسهٔ `userGrid` و `clues` تشخیص می‌دهد کدام سرنخ تازه کامل شده (`solvedRef` نگه می‌دارد چه چیزی قبلاً کامل بود) و هندسه را با `offsetLeft/offsetTop` خانه‌های واقعی می‌سازد — پس در کنسول بی‌قاب، در جدولِ کاغذیِ داستان و در RTL یکسان درست است.
- کلمات «آکروس» در RTL با کلاس `rev` در جهت معکوس sweep می‌شوند تا نور با جهت خواندن برود.
- دو محافظ: هنگام `entranceActive` هیچ نوری شلیک نمی‌شود و `solvedRef` از ابتدا seed می‌شود، تا برگشت به یک جدولِ نیمه‌تمام یا جدولِ داستانی، sweepهای تکراری ندهد. تایمر ۱٫۵ ثانیه‌ای عنصرها را پاک می‌کند.
- `prefers-reduced-motion` کل نوار را `display:none` می‌کند.

**۴) پلاک گرد نقشهٔ ایران** (`components/IranMap.tsx`)
پوستر ایران گوشه‌های نرم دارد، ولی رندر یک مستطیل بریده بود که مثل یک تکهٔ آبی روی کاغذ کرم شنا می‌کرد. `clipPath id="iranPlate"` (rx=20) دور تصویر+موج+مه آمد و یک قاب موی‌باریک دور پلاک.

**Verification**:
- `tsc --noEmit` پاک · `npm run build` OK (۹۲۱٫۵۴ KB / ۲۵۹٫۱۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷**.
- تک‌نفره (CDP ۴۳۰×۹۴۰): `slab 414×56` با `slip 402` یعنی سینی تمام‌عرض · **۰** دکمهٔ ایموجی · ۲ دکمهٔ chevron · صفر استثنا (`/tmp/bd-light-game.png`, `/tmp/bd-dark-game.png`).
- آنلاین (دو `BrowserContext` مجزا + دو حسابِ موقت): هر دو در ~۵ ثانیه به هم match شدند و هر کدام **۱** دکمه داشتند · کارت واکنش `132×92` در `x=284..416` و دکمه در `x=372` (لبهٔ راستِ سینی که در `366` تمام می‌شود) → جای موکاپ · کلیک `🔥` کارت را بست و ایموجی روی کلاینت حریف شناور شد (`/tmp/knob-A-pop.png`, `/tmp/knob-B-after-emoji.png`). حساب‌های تست بعد از اجرا حذف شدند.
- sweep: نوار واقعاً روی جدولِ واقعی ساخته شد — `316×62` دقیقاً به اندازهٔ ردیفِ ۵ خانه‌ایِ کامل‌شده، `animation: cg-sweep-x-rev`، `opacity 0.926` وسط پرواز، و بعد از ۱٫۵ ثانیه `0` عنصر · با فریزِ آزمایشیِ `::before` دیده شد که نوار **بالای** پس‌زمینهٔ خانه‌ها نقاشی می‌شود (`z-index:25` روی خانه‌های `z-20`).
- رگرسیون: `cw-redesign-shots` (۱۰ صحنه × ۲ تم) · `cw-rooms-shot` · `cw-shelf-shot` · `cw-mapshot` (`h=167, holes=4, plates=4`) · `cw-mapmotion` → **۱۴/۱۴** — همه با **صفر استثنا**.

**نکتهٔ هارنس (برای دفعهٔ بعد)**: برای دیدنِ یک انیمیشنِ ۰٫۸ ثانیه‌ای، اسکرین‌شاتِ ساده دیر می‌رسد و `Animation.setPlaybackRate` هم کافی نبود. دو راهی که جواب داد: (۱) شمارشِ «خانه‌های پرشدهٔ کل جدول» برای brute-force کردنِ کلمه (شمارشِ خانه‌های کلمهٔ فعال بی‌فایده است چون با کامل‌شدنِ یک کلمه، کلمهٔ فعال عوض می‌شود و لوپ گیر می‌کند)؛ (۲) فریزِ `::before` با یک استایلِ صرفاً-آزمایشی برای اثبات ترتیبِ نقاشی. ترفند دوم فقط برای تست است و در کد نمی‌ماند.

**عمداً دست‌نخورده**: فاصلهٔ خالیِ بالا/پایین کنسول روی گوشیِ باریک (نسبتِ تصویر vs موکاپِ مربع‌تر) — چیدمانِ `cg-console` در Session‌های قبل تأیید شده و این Session فقط لبهٔ راهنما، دکمه و افکت را بست.

---

### Session 31 (Oct 28, 2026) — هم‌ترازی دقیقِ جدولِ کنسول با موکاپ تأییدشده (عادی + آنلاین)

**درخواست**: «جدولی که ساختی و با تم دقیق هماهنگش کردی اون هم اجرا کن حتماً. دقیق و بدون مشکل می‌خوام حتماً اجرا بشه، هم برای بخش آنلاین هم برای بخش عادی بازی.»

**نکتهٔ معماری که کار را کوتاه کرد**: `clayConsole = !storyChapter && !towerFloor && !worldMapAccent` در `components/GameView.tsx` از قبل هم بازیِ عادی (شروع سریع، معمای روزانه، دوئل) و هم نبرد آنلاین را به یک جدول می‌برد و `<CrosswordGrid bare={clayConsole} />` را پاس می‌داد. پس این Session یک پاسِ «دقت» بود، نه سیم‌کشیِ دو مسیر.

**پالت با اندازه‌گیری، نه حدس** (مُد و میانهٔ پیکسل‌های برشِ موکاپ ۷۴۴×۶۷۴):

| عنصر | موکاپ | پیاده‌سازی |
|---|---|---|
| کاغذ خانه | `#E1CDB9` | `bg-[#E1CDB9]` |
| کلمهٔ فعال | `#F4E5CA` | `bg-[#F4E5CA]` |
| خانهٔ انتخاب‌شده | `#F3DCA6` + خط `#C8952B` | `bg-[#F3DCA6] ring-[1.5px] ring-[#C8952B] ring-inset` |
| خانهٔ سیاه | `#383838` | `bg-[#383738]` |
| مرکبِ حرف/شماره | `#241A14` / `#33281F` | `text-[#241A14]` / `text-[#33281F]` |
| خطِ جدول (مرکبِ چاپ) | `#26241F` روی کاغذِ یک‌دست | `.cg-console-slot .cg-board-sheet{background:#26241F}` + `gap:1px` |
| خطِ قطرِ خانه (۸۱px موکاپ) | ۲px | ۱px (چون خانهٔ ما ۴۰px و بزرگ‌نمایی ≈۱٫۵۵) |
| حرف | وزنِ سنگین، مرکب | `font-clay text-[18px] font-black` (Vazirmatn) |
| شمارهٔ سرنخ | ۸px بالا-کنار | `text-[8px] font-bold` در `top-[3px]` |

**تغییرات**:
- `components/CrosswordGrid.tsx` — شاخهٔ `bare` در همان زنجیرهٔ `if/else` که شاخهٔ داستان و شاخهٔ کاغذِ قاب‌دار را دارد (ترتیب: story → bare → framed). فقط همین شاخه و دو خطِ `numberClass`/`letter` تغییر کرد.
  - خانه‌ها **مربعِ دقیق**: `${isStoryMode ? … : bare ? 'rounded-none' : 'rounded-[1px]'}` — گردیِ ۱px با بزرگ‌نمایی حالا به‌صورت گوشهٔ پله‌ای دیده می‌شد.
  - **تینت سبزِ «درست» حذف شد**: `hooks/useGameLogic.ts` هر حرفِ غلط را قبل از `setUserGrid` برمی‌گرداند، پس هر حرفی که در جدول ایستاده به‌تعریف درست است و رنگ سبز فقط برگه را «حل‌شده» نشان می‌داد. مرکب، مرکب می‌ماند؛ فقط حرفِ حریف گلِ رز (`#8A4A42` روی `#F0D8CE`) را نگه می‌دارد تا منشأ هر خانه معلوم بماند.
- `index.css` — یک بلوکِ محدود به `.cg-console-slot .cg-board-sheet` (پس مسیر داستان/برج/نقشه اصلاً به آن نمی‌رسد): پس‌زمینهٔ مرکبِ `#26241F`، `border-radius:2px`، `box-shadow:none` و `> div{border-radius:0}`. نسخهٔ پایهٔ `.cg-board-sheet` (`#2A1E16` + پدینگ ۱px + گوشهٔ ۵px + سایهٔ فرورفته) دست‌نخورده ماند.

**Verification** (موبایل ۴۳۰×۹۴۰، dpr ۲، `animation:none` تزریق‌شده، `setFocusEmulationEnabled`):
- **تک‌نفره روشن**: خانه `61.9px` مربعِ `radius:0`، `bg rgb(225,205,185)`، حرف `18px/900` Vazirmatn `rgb(36,26,20)`، شماره `8px rgb(51,40,31)`، برگه `rgb(38,36,31)`، صفر استثنا. (**شب**: همان اعداد زیر فیلترِ `.dark .cg-console`.)
- **آنلاین (دو `BrowserContext` + دو حساب موقت) → ۱۲/۱۲ در روشن و ۱۲/۱۲ در شب**: هر دو کلاینت پالتِ یکسان `[["rgb(225,205,185)",18],["rgb(56,55,56)",4],["rgb(244,229,202)",2],["rgb(243,220,166)",1]]`، مجموعهٔ خانه‌های سیاهِ یکسان، حلقهٔ انتخاب `rgb(200,149,43) 1.5px inset` بدون سایهٔ بیرونی، صفر تینت سبز، سینی راهنما + دکمهٔ ایموجی روی هر دو. کلمهٔ کامل‌شده (`سرا` / `یک` / `عدد`) با مرکبِ رز روی حریف نشست: `{bg:rgb(240,216,206), color:rgb(138,74,66)}`.
- **بدون رگرسیون روی مسیرهای دیگر**:
  - داستان/فصل نقشهٔ جهان (`cw-framed.cjs` جدید) → **۱۳/۱۳** روشن و شب: کاغذِ پارچمنت `#FDF6E3` (روز) / `#2A211A` (شب، از remapِ موجودِ `public/css/dark-mode.css`)، خانهٔ سیاه همچنان پنهان، گردیِ ۲px، خطِ ۱px `#d4a373`، `bare`/کنسول = ۰.
  - برج (`cw-tower-frame.cjs` جدید) → **۷/۷** روشن و شب: کاغذ `#FBF5E8`، `radius:1px`، برگه `#2A1E16` + گوشهٔ ۵px + سایهٔ `inset 0 2px 5px -2px`، قاب `cg-board p-[7px] rounded-[14px]`.
- `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۱٫۵۴ KB / ۲۵۹٫۱۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷** · sweepها: `cw-redesign-shots` ۱۰ صحنه × ۲ تم، `cw-rooms-shot`، `cw-shelf-shot`، `cw-mapmotion` → **۱۴/۱۴** — همه صفر استثنا.

**سه دامِ هارنس که وقت گرفت (برای دفعهٔ بعد)**:
1. `Page.captureScreenshot` با `clip` فقط `{x,y,width,height}` می‌خواهد؛ نسخهٔ اول `{x,y,w,h}` می‌داد و **بی‌صدا** هیچ فایلی ذخیره نمی‌کرد (پاسخ `error` بود، نه `result`). همیشه `s.error` را چاپ کنید.
2. اسکرین‌شاتِ «قبل از تایپ» را با «بعد از تایپ» اشتباه نگیرید: در هارنس آنلاین عکسِ حریف قبل از حلِ کلمه گرفته می‌شد و جدولش خالی به‌نظر می‌رسید. عکسِ اثبات باید **بعد** از `afterword` گرفته شود.
3. شبکهٔ `dir="rtl"` است، پس ستونِ ۰ در **راست** رندر می‌شود؛ خواندنِ اسکرین‌شات از چپ به راست، جدول را با راه‌حلِ استخراج‌شده ناهم‌خوان نشان می‌دهد.

**همچنین رفع شد (هارنس، نه محصول)**: `cw-mapmotion` اولّین `image[href^="/images/map-"]` را می‌گرفت؛ با ماندنِ هر دو نقشه در DOM، نشانگرِ مه روی نقشهٔ پنهان حرکت می‌کرد و «halo follows the pointer» تصادفی رد می‌شد. حالا بزرگ‌ترین تصویرِ دیده‌شدنی انتخاب می‌شود → **۱۴/۱۴**.

---

### Session 32 (Oct 29, 2026) — صفحهٔ جدول از بالا به پایین: نوار بالا، سینی راهنما و کیبورد پوستر

**درخواست**: فقط صفحهٔ جدول (آنلاین و تک‌نفره) تک‌تک از بالا به پایین با دو پوستر تأییدشده هم‌تراز شود، بدون تغییر پس‌زمینه و متریال خشتی؛ و در گام فعلی **فقط نوار کیبورد** دقیقاً مثل پوستر روی بازی بنشیند.

**مسیر مشترک**: `clayConsole = !storyChapter && !towerFloor && !worldMapAccent` (در `components/GameView.tsx`) هم بازی عادی (شروع سریع/معمای روزانه/دوئل) و هم نبرد آنلاین را به یک چیدمان می‌برد: `Header` با `clay`، `cg-console` → `CrosswordGrid bare`، سینی راهنما `cg-clueslab`، و فوتر `cg-deckwrap` → `GameKeyboard clay`.

**نوار بالا** (`components/Header.tsx`): `cg-topbar` با ارتفاع ۶۴px، آواتار ۵۲px + نشان حریف، سه حفرهٔ کنده‌کاری‌شده ۲۶px، ساعت ۴۸px با `--dial-fill`، قرص امتیاز (خط تیره وقتی هر دو صفرند) و کیف سکه با جداکنندهٔ فارسی `٫`.
**سینی راهنما** (`components/ActiveClueBar.tsx`): اسلیپ `cg-clueclip` با ارتفاع ۵۲px؛ به ترتیب RTL: دکمهٔ ایموجی (فقط آنلاین) ← فلش قبلی ← بلوک متن (فلش آبی + چیپ شماره + متن) ← فلش بعدی. عرض رندرشده ۴۰۰×۵۲ در برابر ۴۰۲×۵۲ پوستر.

**کیبورد** — اعداد از پوستر (عرض سینی ۹۵۳px واقعی ÷ ۴۰۲ CSS ⇒ ضریب ۰٫۴۲۱۸) و همان اعداد در رندر:

| سنجه | پوستر (CSS) | رندر |
|---|---|---|
| ارتفاع سینی | ۱۴۵٫۵ | ۱۴۴ |
| فاصلهٔ بالای کلیدها | ۱۰٫۱ | ۱۰ |
| ارتفاع کلید | ۲۴٫۳ | ۲۴ |
| فاصلهٔ ردیف‌ها | ۱۴٫۳ | ۱۴ |
| لبهٔ جلویی پایین | ۳۵ | ۳۴ |
| فاصلهٔ افقی کلیدها | ۲٫۵ | ۳ |
| عرض کلیدها | ۳۵۷٫۷ | ۳۶۶ |
| تعداد کلید | ۳۳ | ۳۳ |

`components/GameKeyboard.tsx`: `paddingBottom` در حالت سفالی دیگر `0.25rem` اضافه نمی‌گذارد (فقط `env(safe-area-inset-bottom)`)؛ ردیف‌ها `gap-[14px] sm:gap-3`؛ کلید طلایی چراغ `flex-[1.12]` و آیکون ۱۴px؛ حرف‌ها `text-[14px] sm:text-lg`.
`index.css`: `.cg-keywell{padding:0 20px 34px;border-radius:18px}` (قبلاً ریتم برعکس بود: ۳۳ بالا / ۱۳ پایین) و در دسکتاپ `padding:4px 24px 30px`؛ `.cg-key{border-radius:8px}`؛ گلیز آبی کم‌اشباع‌تر مطابق پوستر `#8093A8→#66798E` با `--lip:#48596B`.
**چیدمان حروف و نقش گلیز** مو‌به‌مو با پوستر یکی است: ۱۲/۱۱/۹ کلید، ردیف اول از راست ض ص ث ق ف غ ع ه خ ح ج چ، الگوی `c s c c b c c c s c b c` / `c c s c b c c s c b c` / `s c c b c c s c b` و کلید طلایی چراغ اول ردیف سوم.

**Verification**:
- `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۲٫۰۹ KB / ۲۵۹٫۳۴ KB gzip) · `npm run test:mp` → **۳۷/۳۷**.
- `/tmp/cw-kb.cjs` (موبایل ۴۳۰×۹۴۰، dpr ۲، روشن و `--dark`) → سینی `430×144`، `topPad 10`، `bottomPad 34`، `rowGap 14`، `keyGap 3`، کلید `27.8×24` با `radius 8px` و فونت `14px`، `keyCount 33`، `docH 940`، **صفر استثنا**؛ تصاویر `/tmp/kb-light-game.png` و `/tmp/kb-dark-game.png`.
- `/tmp/cw-board-online.cjs` (دو `BrowserContext` + دو حساب موقت) → **۱۷/۱۷**: پالت یکسان هر دو کلاینت، خطوط برگه `#26241F`، حلقهٔ انتخاب `rgb(200,149,43) 1.5px inset`، کلمهٔ کامل‌شده با مرکب رز، دکمهٔ ایموجی و سینی راهنما روی هر دو، صفر استثنا.
- بدون رگرسیون: `/tmp/cw-framed.cjs` → **۱۳/۱۳** (کیبورد فصل نقشه هنوز سینی جداست، بدون `is-inset`) و `/tmp/cw-tower-frame.cjs` → **۷/۷** (کاغذ `#FBF5E8` و برگهٔ `#2A1E16` دست‌نخورده) — چون `.cg-key`/`.cg-keywell` بین مسیرها مشترک‌اند.
- **اختلاف آگاهانهٔ باقی‌مانده**: در پوستر سینی کیبورد ~۱۳–۱۶px از لبه‌های صفحه تو رفته و خشتی از میز دیده می‌شود؛ در پیاده‌سازی فوتر `w-full` است و سینی لبه‌به‌لبه می‌نشیند (کلیدها با ۳۲px حاشیه داخلش). این را عوض نکردم چون فوتر تمام‌عرض است و inset کردنش ریسک سرریز افقی دارد. همچنین در حالت آنلاین، پنل «انرژی نبرد» بالای کیبورد می‌نشیند؛ در پوستر نیست چون قابلیت واقعی بازی است، نه عنصر دکوری.

---

### Session 32 (Oct 29, 2026) — کیبورد الفبا = پیکسلِ خودِ پوستر، نه بازسازی CSS

**درخواست (نقل مستقیم)**: «کیبورد الفبا دقیقا باید بشه دقیقا کیبورد توی تصویر. دقیقا کیبورد توی تصویر. اصلا نباید تصویر پس زمینه و اون خشت هایی که توش المنتها هستن تغییری بکنن! … من میخوام دقیقا عکس رو توی صفحه ببینم.» و بعد محدوده‌کردن کار: «فعلا فقط نوار کیبورد رو کامل بذار تو صفحه. تک تک پیش بریم.»

**تصمیم**: ردیف کیبورد دیگر با `.cg-keydeck`/`.cg-keywell`/`.cg-key` کشیده نمی‌شود. خودِ نوارِ پوستر به‌عنوان یک تصویر RGBA درمی‌آید و رویش **دکمه‌های نامرئی** می‌نشیند. دلیل: تلاش قبلی برای «شبیه‌سازی» سفال با CSS هر بار تفاوت ریز داشت (گلیز، پخِ لبه، ریتم فاصله‌ها) و کاربر دقیقاً همان را رد کرد.

**`scripts/crop-keyboard-panel.py` (تازه)** — بازتولیدپذیر، هم‌سبک با `scripts/crop-console-panels.py`:
- برش `BOX = (38, 876, 991, 1278)` از `vibe_images/clay-game-final-online.png` → **۹۵۳×۴۰۲**، خروجی `public/images/game/keyboard-panel.webp` (کیفیت ۹۲، ~۶۲ KB).
- ماسک آلفا: بزرگ‌ترین مؤلفهٔ متصلِ «نارنجیِ گرم» (`G/R < 0.735`, `R ≥ 105`, `R−B ≥ 45`) → `binary_closing 5×5` → `fill_holes` → منهای برشِ گوشه‌های هندسی → `dilate/erode 3×3` → گاوس `0.85` → `clip((a−0.30)/0.50)` و در پایان `alpha[outside] = 0`.
- **چرا فقط رنگ کافی نبود**: کاغذِ کرم (`G/R ≈ 0.886`)، کفِ حناییِ میز (`0.771`)، خطِ سایهٔ کاغذ (`R < 120`) و **دیوارِ اتاق در گوشهٔ بالا-راست** (`0.655`) همه در همسایگیِ رنگِ سینیِ سایه‌دار (`0.606`) هستند. «بزرگ‌ترین مؤلفهٔ گرم» کاغذ و توکن‌های سبز را حذف می‌کند و دیوار فقط با برشِ هندسی بیرون می‌رود: لبهٔ راست `872` (y ۰..۷۴) سپس ease کسینوسی `938 + 14·(0.5−0.5·cos πt)` تا y=۱۹۰، لبهٔ چپ `80→22` در y ۰..۶۰.
- هندسهٔ اندازه‌گیری‌شده (در docstring): لبهٔ بالای سینی y≈۱۳، مرکز ردیف‌ها cy = ۱۰۴ / ۱۹۵ / ۲۸۷، گام ۷۱٫۲۷ / ۷۷٫۷ / ۸۱٫۵، راست‌ترین مرکز ۸۷۲٫۵ / ۸۶۳٫۵ / ۸۴۹٫۵، لامپ راهنما cx=۱۱۱.

**`components/GameKeyboard.tsx`**: شاخهٔ `if (clay && isFA)` تصویر را با `aspect-[953/402]` و `object-fill` رندر می‌کند و ۳۳ ناحیهٔ لمسیِ درصدی (`POSTER_ROWS` / `POSTER_HINT`) رویش می‌گذارد؛ هر ناحیه `aria-label` برابر حرف خودش دارد و کلیکش همان `onKeyPress` قدیمی را صدا می‌زند. لامپ راهنما در حالت آنلاین `is-off` است (چون هینت سهم حریف را می‌سوزاند). مسیر انگلیسی و صفحه‌های غیرکنسول (داستان/برج/نقشه) همان کلیدهای CSS قبلی را نگه داشتند.

**`index.css`**: `.cg-postkbd-art` بدون `pointer-events` (تصویر فقط نقاشی است)، `.cg-postkbd-key` شفاف با `border-radius:14px`، حالت `:active` یک سایهٔ فرورفته روی همان کاشیِ نقاشی‌شده (نه دکمهٔ تازه)، `:focus-visible` حلقهٔ کهربایی، و `.dark .cg-postkbd-art{filter:brightness(.74) saturate(.95) sepia(.16) contrast(1.05)}` تا شب هم‌خانوادهٔ بقیهٔ صفحه شود (روشنایی میانگینِ نوار در تست: ۱۲۹٫۸ → ۷۸٫۳).

**Verification** (همه پس از تولید asset با اسکریپت، روی همان فایلِ نهایی):
- `/tmp/cw-postkb.cjs` روشن → **۱۵/۱۵**: سینی `400.2×168.8` در `y=771.2` (۹۳٫۰۷٪ عرض دید)، نسبت `0.4218` دقیقاً برابر پوستر، تصویر ۹۵۳×۴۰۲، ۳۳ ناحیه، صفر `.cg-key`/`.cg-keywell` قدیمی، برچسب‌ها بر ردیف‌های پوستر منطبق، هر ردیف روی یک خط و یک‌جهته، لامپ سمت چپِ ردیف سوم، کلیک واقعی حرف را در خانه نوشت، تصویر `pointer-events:none`، نواحی شفاف، صفر استثنا.
- همان هارنس با `--dark` → **۱۵/۱۵** (تایپ «ا» در خانهٔ ۱).
- `/tmp/cw-framed.cjs` → **۱۳/۱۳** (جدولِ داستان/نقشهٔ جهان دست‌نخورده) · `/tmp/cw-tower-frame.cjs` → **۷/۷** (برج هنوز کلیدهای CSS، چون `clay=false`) · `/tmp/cw-board-online.cjs` (دو کلاینت) → **۱۷/۱۷** — سلکتور تایپِ هارنس به `.cg-postkbd-key,.cg-key` گسترده شد و روی `aria-label` تطبیق می‌دهد.
- `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۲٫۰۹ KB / ۲۵۹٫۳۶ KB gzip) · `npm run test:mp` → **۳۷/۳۷**.
- تصاویر اثبات: `/tmp/pk-light-deck.png`، `/tmp/pk-dark-deck.png` (نوار پوستر با سینی، لبه و همهٔ کاشی‌های سرامیکی؛ هیچ باقی‌ماندهٔ کاغذ/دیوار در گوشه‌ها نیست).

**مرحلهٔ بعد (طبق «تک تک پیش بریم»)**: نوار بالا، نوار سرنخ و پس‌زمینهٔ صفحه باید به همین روش از خودِ پوستر بیایند. جدول از قبل داخل قابِ پوستر نشسته است. تا تأیید نهایی، هیچ‌کدام دست‌کاری نمی‌شوند.

---

### Session 33 (Oct 29, 2026) — پوستر تأییدشده = خودِ صفحهٔ جدول (بدون هیچ تعامل) + پرکردن نوارهای اضافی

**درخواست (نقل مستقیم)**: «چرا انقدر سخت داری انجام میدی؟ دقیقا عکس رو بذار روی صفحه! … اصلا نمیخوام هیچ چیزیش کار کنه. فقط عکس که تولید کردیم رو بذار به جای تصویر کلی صفحه کراس ورد. بعد میام بهت میگم دقبقا چیو چی کار کنی.» و بعد: «اون نقاط بخش اضافی که میمونه که به علت ارتفاع زیاد صفحه با تم و صفحه برنامه پر نمیشه رو یه کاری کن پر بشن. زشتن!»

**تصمیم**: هیچ پنلی دیگر با CSS بازسازی نمی‌شود. در شاخهٔ کنسول (`clayConsole = !storyChapter && !towerFloor && !worldMapAccent`) خروجی `GameView` یک تصویر تمام‌صفحه است و بس. مسیرهای داستان/برج/نقشهٔ جهان دست‌نخورده ماندند.

**`components/GameView.tsx`** — return زودهنگام پیش از return اصلی:
- دو asset تازه: `public/images/game/screen-solo.png` و `screen-online.png` (کپی بایت‌به‌بایت `vibe_images/mockups/final-solo-fixed.png` و `final-online.png`، هر دو ۱۰۲۴×۱۲۸۰). `isMultiplayer` انتخاب می‌کند.
- کانتینر `fixed inset-0 z-[200]`: با `z-40` هدرِ `sticky z-50` اپ روی عکس می‌افتاد، پس `z-[200]`.
- عکس اصلی `object-contain` (بدون برش، بدون اعوجاج) و `pointer-events-none`؛ عمداً بدون هیچ دکمه/جدول/کیبوردِ زنده.

**پرکردن نوارهای اضافی — راه‌حل نهایی: پس‌زمینهٔ واقعی اتاق، بدون هیچ ساختِ دستی**

درخواست بعدی کاربر: «ببین پس زمینه بدون این خشت و جدول و اینها رو داری؟ اگه داری طوری انجام بده که پس زمینه بر اساس سایز صفحه بزرگ و کوچیک بشه و کل صفحه رو بگیره! نه اینکه خودت پرش کنی. زوم به اندازه‌ای که کل صفحه رو بپوشونه و بعدش این المان‌ها و عکس خشت به صورت کامل تو بیشترین حالتی که می‌تونه توی صفحه قرار بگیره روی پس زمینه بشینه.»

- لایهٔ صفرِ صفحه، `public/images/game/room-bg.webp` (۱۰۲۴×۱۷۹۲) است: همان بک‌دراپِ رندر اتاق سفالی که از قبل به‌عنوان دیوارِ `.cg-playfield` استفاده می‌شد — بدون خشت‌ها، بدون جدول، بدون نوارها. همیشه کل ویوپورت را می‌پوشاند و با اندازهٔ صفحه بزرگ/کوچک می‌شود.
- لایهٔ یک، خودِ پوستر است با `object-contain`: **هیچ پیکسلی از آن بریده نمی‌شود** و در بزرگ‌ترین اندازه‌ای می‌نشیند که کامل جا شود. روی موبایل ۴۳۰px (نسبت ۰٫۴۵۷ در برابر ۰٫۸ پوستر) یعنی عرض کامل ۴۳۰ و ارتفاع ۵۳۷٫۵ در وسط؛ روی دسکتاپ ۱۲۸۰×۸۰۰ یعنی کل ارتفاع و عرض ۶۴۰.
- **هیچ آینه، کشش، بلورِ ساختگی یا گرادیانِ پرکننده‌ای در کد نماند.** سه نسخهٔ قبلی (نوار آینه‌ای ۱٫۵×، نوار بازتاب ۱:۱ + بوکه، و واشرِ بلور ۶۴px) کامل حذف شدند؛ کاربر صریحاً گفت «نه اینکه خودت پرش کنی».

**اصلاح نوار پایین — مقیاس بر اساس ناحیهٔ اشیا، نه کل فایل** (درخواست بعدی: «بالای تصویر خوبه. ولی پایین تصویر زیر کیبورد من چیزی از پس زمینه نمی‌بینم!»)

- ریشهٔ مشکل: از ۱۷۹۲ پیکسل ارتفاعِ `room-bg.webp` فقط ۱۰۲۴ پیکسلِ بالایی اشیا دارد (گلدان، کتاب‌ها، شلف، گربه، ماگ)؛ پایین‌تر از y≈۱۰۲۴ میزِ لخت است (سنجش با «جزئیات محلی» روی بلوک‌های ۶۴px: همهٔ ردیف‌های y≥۱۰۲۴ مقدار ≤۳). با `object-cover` روی ۴۳۰×۹۴۰، مقیاس = 940/1792 = ۰٫۵۲۴۶ یعنی **کل** ارتفاع فایل دیده می‌شد، پس نوارِ زیر کیبورد روی انتهای همان میزِ خالی می‌افتاد.
- راه‌حل: پس‌زمینه نه بر اساس کل فایل، بلکه بر اساس همان ناحیهٔ ۱۰۲۴×۱۰۰۰ اشیا اندازه‌گیری می‌شود: `style={{ width: 'max(100vw, 102.4vh)' }}` با `h-auto` و `top-0 left-0` (۱۰۲۴/۱۰۰۰ = ۱٫۰۲۴). یعنی صحنه ارتفاع ویوپورت را پر می‌کند و همان قید عرض تضمین می‌کند روی صفحه‌های پهن هم کامل پوشیده شود. جهتِ خطا امن است: `vh` در سافاری موبایل بزرگ‌تر از ویوپورت واقعی است، پس فقط بیش‌پوشش می‌دهد نه کم‌پوشش.
- ریاضیِ لازم برای اینکه نوارِ پایین واقعاً محتوا داشته باشد: نوار پایین از کسرِ `fb` شروع می‌شود، پس ناحیهٔ دیده‌شده `[(1−fb)·R, R]` است. برای اینکه گربهٔ خوابیده (y ۷۶۰..۹۶۰) کامل داخل نوار بیفتد باید `R ≤ 780/(1−fb)`؛ با `fb = 0.5 − 0.625·vw/vh` روی ۴۳۰×۹۴۰ نتیجه `R ≤ ۹۹۲` می‌شود — یعنی همان ۱۰۰۰ انتخابی، و کوچک‌ترکردنش سرِ گربه را زیر پوستر پنهان می‌کند.
- نتیجهٔ اندازه‌گیری‌شده (`/tmp/cw-poster-geo.cjs`): در ۴۳۰×۹۴۰ نوار پایین پیکسل‌های y=۷۸۶..۱۰۰۰ (گربه)، بالای پوستر ۰..۲۱۴ (گلدان/دیوار)؛ ۴۳۰×۱۲۰۰ → ۷۲۴..۱۰۰۰؛ ۳۹۰×۸۴۴ → ۷۸۹..۱۰۰۰؛ ۳۷۵×۶۶۷ → ۸۵۱..۱۰۰۰ (نوار فقط ۹۹px است، تنهٔ گربه)؛ ۷۶۸×۱۰۲۴ → ۹۶۹..۱۰۰۰ (نوار فقط ۳۱px)؛ در حالت‌های افقی (۸۴۴×۳۹۰، ۱۲۸۰×۸۰۰، ۱۹۲۰×۱۰۸۰) اصلاً نوار بالا/پایین وجود ندارد و نوارهای کنار، گلدان/کتاب و شلف/ماگ را نشان می‌دهند.
- اثر جانبی آگاهانه: روی موبایل گربهٔ ناحیهٔ پایین به‌صورت یک شیءِ نزدیک/بوکه دیده می‌شود (چون رندر ۱۰۲۴px روی نمایشگر رتینا بزرگ‌نمایی می‌شود) و مقیاسش با بک‌دراپِ خودِ پوستر یکی نیست؛ این تنها راهِ دیدنِ محتوا در آن نوار است بدون ساختِ مصنوعی.

**Verification**:
- `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۱٫۴۰ KB / ۲۵۹٫۳۱ KB gzip) · `npm run test:mp` → **۳۷/۳۷**.
- `/tmp/cw-poster-geo.cjs` (تازه، ۸ نسبت‌ابعاد ۴۳۰×۹۴۰، ۴۳۰×۱۲۰۰، ۳۹۰×۸۴۴، ۳۷۵×۶۶۷، ۸۴۴×۳۹۰، ۷۶۸×۱۰۲۴، ۱۲۸۰×۸۰۰، ۱۹۲۰×۱۰۸۰): در همه `coversWholeViewport=true`، پوستر کامل (`posterWhole`)، `doc` برابر ویوپورت. تصاویر `/tmp/pg-*.png`.
- `/tmp/cw-poster-quick.cjs` (۴۳۰×۹۴۰، ۴۳۰×۱۲۰۰، ۳۹۰×۸۴۴، ۱۲۸۰×۸۰۰): هر چهار حالت پر، بدون نوار خالی، فقط خطای شناخته‌شدهٔ `favicon.ico`.
- `/tmp/cw-imgscreen.cjs` (سولو + دو کلاینت آنلاین): سولو `screen-solo.png` و آنلاین `screen-online.png` با `object-fit: contain`، `doc` = ویوپورت، صفر استثنا. حساب‌های پروب قبل از اجرا با اسکریپت یک‌بارهٔ `db.updateUser({coins})` شارژ شدند (۲۰ سکهٔ شرط مسابقهٔ رنکد تمام شده بود و مودال «سکه ناکافی» بازی را شروع نمی‌کرد).
- تصاویر: `/tmp/pq-430x940.png`، `/tmp/pq-430x1200.png`، `/tmp/pq-390x844.png`، `/tmp/pq-desktop.png`، `/tmp/pg-375x667.png`، `/tmp/pg-844x390.png`، `/tmp/img-solo.png`، `/tmp/img-solo-tall.png`، `/tmp/img-solo-desktop.png`، `/tmp/img-online-onA.png`، `/tmp/img-online-onB.png`.

**مرحلهٔ بعد**: منتظر دستور کاربر. لایهٔ زنده (نواحی لمسیِ نامرئی روی دکمه‌های چاپ‌شده، جدول جای جدول تصویر، متن‌ها جای متن‌های تصویر) تا اعلام صریح شروع نمی‌شود.

---

### Session 34 (Oct 29, 2026) — لایهٔ زندهٔ پوستر: جدول واقعی داخل پنل جدول، متن سرنخ زنده، و اورلی فشارِ ۲پیکسلی روی همهٔ کلیدها/دکمه‌ها

**درخواست (نقل مستقیم)**: «ویو همینی که هست اصلا نباید دست بخوره و باز طراحی نیاز نیست. وقیقا روی صفحه روی هر کلید یه اورلی بذار که وقتی فشارش میدی نشون داده بشه که کلید فشار داده شده… دقیق هر اورلی باید طوری باشه که سایز اظلاعض در حد ۲ پیکسل از سایز خود کلید کوچکتر باشه… بعدش بیا برای قسمت راهنما هم همین کارو بکن… و دقیقا متن و داخل متنی که تو تصویره بر اساس انتخاب داخل حدول بارگذاری کن. بعد بیا برو برای جدول دولی که ما میسازیم رو داخل پنل جدول دقیقا ایی که براش اختصاص داده شده جایدگذاری کن. بالای بالای هم همینطور اورلی و فشار دکمه و تابعی که باید اجرا بشه. تصویر رو اصلا دست نزن و طراحی رو عوض نکن.»

**اصل معماری**: خودِ پوستر «صفحه» است؛ هیچ عنصری بازسازی نمی‌شود. فقط نواحیِ لمسیِ **کاملاً شفاف** روی اجزای چاپ‌شده می‌نشینند و مقادیر زنده (حرف‌های جدول، متن سرنخ، عدد سکه/امتیاز) روی همان خانه‌های چاپ‌شده نوشته می‌شوند. جای هر چیز درصدی از خودِ پوستر است (`x/1024`, `y/1280`)، پس در هر اندازه‌ای مو‌به‌مو می‌نشیند.

**۱) جدول واقعی داخل پنل جدول پوستر** (`components/CrosswordGrid.tsx` + `components/GameView.tsx`)
- شاخهٔ `bare` همان پالت کنسول را نگه داشت (کاغذ `#DEC6AC`، مرکب `#241A14`، خطوط برگهٔ `#26241F`) و با `fitPadding={0}` داخل باکس چاپ‌شدهٔ جدول رندر می‌شود؛ برگه یک سطح یک‌دست است، پس هیچ لبه یا درز چاپی از زیرش بیرون نمی‌زند.
- تأیید پیکسلی (`/tmp/pl-solo.png` در برابر `/tmp/poster-grid-box.png`): جدول زندهٔ ۵×۵ دقیقاً روی همان کادر ۵۳۴×۵۳۸ پوستر می‌نشیند، بدون نوار چاپیِ باقی‌مانده.

**۲) متن سرنخ زنده روی سینی چاپ‌شده** (`components/ActiveClueBar.tsx`)
- `poster` prop مسیر `is-poster` را روشن می‌کند: سرنخِ فعالِ جدول با `paperFontSize` داخل `cg-postclue-text` نوشته می‌شود و چیپ شماره هم همان شمارهٔ سرنخ جاری است. قبلاً سینی حدود ۴۰ پیکسل بالاتر می‌نشست چون `poster` به `ActiveClueBar` پاس نمی‌شد.
- ناحیه‌های لمسی (در مختصات برشِ ۸۰۵×۱۶۸): عادی `{prev 690,56,54,56; next 62,56,52,56; text 116,46,394,88; chip 522,66,40,42; dir 572,66,42,42}` و آنلاین `{prev 562,56; next 62,56; text 116,46,332,88; chip 455,66; dir 509,66; knob 668,32,96,100}`.

**۳) نوار بالا** (`components/Header.tsx`) — پنج ناحیهٔ فعال روی آواتار، خانه، چرخش جهت، لامپ راهنما و کیف سکه/فروشگاه، به‌همراه ساعت و قرص امتیاز زنده (`BAR_SLOTS`: avatar 634,20 108×92؛ home/flip/bulb 44×45؛ pursePill 39,45 145×51؛ clock 387,45؛ scorePill 209,44 138×54).

**۴) اورلیِ فشار — یک الگو برای همه** (`hooks/usePressHold.ts` تازه + `index.css`)
```ts
export const usePressHold = () => {
  const [down, setDown] = useState<string | null>(null);
  const bind = useCallback((id: string) => ({
    onPointerDown: () => setDown(id),
    onPointerUp: () => setDown(null),
    onPointerLeave: () => setDown(null),
    onPointerCancel: () => setDown(null),
  }), []);
  return { down, bind };
};
```
- هر ناحیه یک `<i className="cg-pressface …" aria-hidden />` دارد؛ خودِ face `position:absolute; inset:2px` است، یعنی **۲ پیکسل از هر طرف کوچک‌تر از دکمهٔ چاپ‌شده** — دقیقاً همان چیزی که خواسته شد. `opacity` از ۰ به ۱ با `.07s` می‌رود و با `:active` هم روشن می‌شود.
- چرا `useState` و نه فقط `:active`: در iOS فقط وقتی روشن می‌شود که خودِ المنت شنوندهٔ لمسی داشته باشد، و با سُر خوردن انگشت از روی کاشی خاموش می‌شود — همان لحظه‌ای که بازیکن هنوز نگه داشته است. حالت React با `pointerleave/cancel` درست رفتار می‌کند.
- شکل face با کلاس: `is-round` (دیسک‌های چرخش/سرنخ/اموجی → `border-radius:50%`)، `is-pill` (کیف سکه → `999px`)، `is-square` (دکمهٔ جهت سینی → `26%`). روی دکمه‌های غیرفعال (`is-off`/`disabled`) face کاملاً `display:none` است.
- **`:active` قدیمی که خودِ دکمه را بازرنگ می‌کرد از نوار بالا و سینی راهنما حذف شد**؛ حالا فقط face عوض می‌شود، پس تصویر و خشتی که دکمه‌ها داخلش‌اند هرگز تکان نمی‌خورد یا روشن نمی‌شود.
- کیبورد فارسی مسیر جدا و از قبل تأییدشدهٔ خودش را دارد: `keyboard-panel.webp` + ۳۳ ناحیهٔ درصدی + `.cg-postkbd-face` با همان `inset:2px`، و لامپ راهنما در حالت آنلاین `is-off` است (چون هینت سهم حریف را می‌سوزاند).

**Verification**:
- `npx tsc --noEmit` پاک · `npm run build` OK · `npm run test:mp` → **۳۷/۳۷**.
- `/tmp/cw-poster-live.cjs` (روشن و `DARK=1`) → probe: `keyCount 33، faceCount 33، faceInset "2px/2px/2px/2px"، barHits 5، clueHits 3، barFaces 5، clueFaces 3، gridCells 25، sheetBg rgb(38,36,31)، errors []`; `barPress` برای خانه (نیم‌دایره)، کیف سکه (قرص) و هر دو فلش سرنخ `down.op "1" → up.op "0"` با `radius` درست.
- `/tmp/cw-poster-live.cjs` — تایپ واقعی: چون `useGameLogic` حرف غلط را نمی‌نویسد، کلیدها تا پیدا شدن حرفِ درست آزموده شدند و نتیجه `{label:"و", letters:["و"]}` بود؛ یعنی کیبورد پوستر واقعاً در جدول زنده می‌نویسد.
- `/tmp/cw-poster-online.cjs` (دو `BrowserContext` مجزا، دو حساب موقت، پورت‌های ۹۳۹۱/۹۳۹۲) → **۱۵/۱۵**: هر دو کلاینت `screen-online.png`، ۳۳ کلید و ۳۳ face، سرنخ زنده روی هر دو سینی، لامپ راهنما غیرفعال، دکمهٔ اموجی موجود، و کلمهٔ حل‌شده روی A به‌صورت حرف رز (`rgb(138,74,66)` روی `rgb(240,216,206)`) روی B نشست؛ صفر خطای کنسول در هر دو (`favicon` فیلتر شد).
- `/tmp/cw-poster-hold.cjs` (نمای بزرگ‌نمایی‌شدهٔ ۳×): هر چهار نگه‌داشتن از `op:"0"` به `heldOpacity 1` رفتند — `/tmp/ph-next.png` (face گرد داخل دیسک فلش چاپی) و `/tmp/ph-purse.png` (face قرص داخل پیلِ سکه؛ خورشید و «۲۵۰» هنوز خواناست).
- `/tmp/cw-framed.cjs` **۱۳/۱۳** (جدول داستان/نقشهٔ جهان دست‌نخورده) و `/tmp/cw-tower-frame.cjs` **۷/۷** (برج هنوز کلیدهای CSS خودش را دارد، چون `clay=false`).

**نکتهٔ هارنس**: `typed` اولش خالی برمی‌گشت چون کلید «ص» برای خانهٔ فعال غلط بود و نوشته نمی‌شد؛ الگوی درست «آزمودن کلیدها تا فرودِ یک حرف» است. همچنین خطای ۴۰۴ فاوآیکن در سنجش «صفر خطای کنسول» باید فیلتر شود.

---

### Session 35 (Oct 30, 2026) — حالت فشردهٔ چاپی: تصویر واقعی «فرو رفته» زیر هر کنترل، بدون اورلی

**درخواست**: «همین حالت‌های فشرده خوبن اجراشون کن.» — یعنی همان طرح تأییدشده (کنترل در گِل فرو می‌رود) واقعاً روی صفحهٔ جدول، هم تک‌نفره هم آنلاین، اجرا شود؛ تصویر پوستر و چیدمان دست‌نخورده.

**اصل**: فشار یک اورلی نیمه‌شفاف نیست. خودِ هنر با همان دستور پخت تأییدشده دوباره رندر می‌شود، پس لبهٔ چاپی، گلیز و پخِ لبه مو‌به‌مو عوض می‌شوند — همان چیزی که در تصویر تأیید دیده شد.

**۱) تولید کاشی‌ها (`scripts/press-panels.py`، تازه)**
- برای هر کنترل، پنل یک بار با **فقط همان کنترل فشرده** رندر می‌شود (`recess2` از `scripts/press_recess.py`؛ ماسک‌ها از `press_gold.py` / `press_shape.py` / `press_util.py`) و ناحیهٔ برخورد ±۱۰px برش می‌خورد. چون همسایه‌ها در کاشی همان‌طور می‌مانَند که پنلِ آرام نقاشی می‌کند، کاشی‌ها می‌توانند هم‌پوشانی داشته باشند بدون آرتیفکت.
- چهار دستهٔ پارامتر مطابق تأیید: `KEY_P` (کلیدهای کیبورد)، `GOLD_P` (کلید چراغ طلایی، `grow=2`)، `DISC_P` (دیسک‌های گرد: آواتار/چرخش/لامپ/فلش سرنخ)، `PILL_P` (قرص کیف سکه).
- خروجی: `public/images/game/press/*.webp` (**۴۹ فایل**) + `components/pressTiles.ts` که مستطیل هر کاشی را **در پیکسل خود پنل** نگه می‌دارد، تا جای‌گذاری هرگز از برش جدا نیفتد:
  - `keyboard` ۹۵۳×۴۰۲ → ۳۳ کاشی (۳۲ حرف + لامپ راهنما)
  - `topbar` و `topbarOnline` ۷۶۸×۱۳۶ → هر کدام ۵ (آواتار، خانه، چرخش جهت، لامپ، کیف سکه)
  - `clue` و `clueOnline` ۸۰۵×۱۶۸ → هر کدام ۳ (فلش قبلی، فلش بعدی، دکمهٔ جهت)
- بازتولید: `python3 scripts/press-panels.py` از ریشهٔ مخزن (کل پوشهٔ خروجی را پاک و از نو می‌سازد).

**۲) نمایش (`components/PressArt.tsx` + بلوک `.cg-pressart` در `index.css`)**
- هر کاشی **همیشه در DOM می‌مانَد** با `opacity:0` و فقط وقتی `down` صادق است `opacity:1` می‌شود (`transition: opacity .06s linear`) — پس اولین لمس منتظر دانلود نمی‌مانَد.
- مختصات با درصدِ همان پنل حساب می‌شود (`left/top/width/height` از `x/y/w/h` تقسیم بر `w/h` پنل)، بنابراین کاشی در هر اندازه‌ای دقیقاً روی چاپ می‌نشیند.
- `pointer-events:none` + `aria-hidden` + `draggable={false}`: کاشی فقط نقاشی است و هیچ ورودی‌ای نمی‌گیرد.
- **فیلتر شب** مثل خودِ پنل: `brightness(.74) saturate(.95) sepia(.16) contrast(1.05)` برای نوار بالا/کیبورد و `brightness(.78) saturate(.96) sepia(.14) contrast(1.04)` برای سینی سرنخ — ولی `drop-shadow` نوار بالا **تکرار نمی‌شود**، چون روی درزِ برش سایه می‌کشد.

**۳) رانش (`hooks/usePressHold.ts`)**
`const { down, bind } = usePressHold();` بعد `{...bind('next')}` روی ناحیهٔ لمسی و `<PressArt … down={down === 'next'} />`. `onPointerDown/Up/Leave/Cancel` لازم است چون `:active` در iOS فقط با شنوندهٔ لمسی روشن می‌شود و با سُر خوردن انگشت، همان لحظه‌ای که بازیکن هنوز نگه داشته، خاموش می‌شود.

**۴) تنها استثنا: دکمهٔ واکنش (سه‌نقطهٔ سبز سینی)**
این تنها کنترل چاپی است که کاشی ندارد (پس از تأیید، بیرون از فهرست بود). همان faceِ کم‌رنگِ قبلی را نگه می‌دارد: `.cg-postclue-knob-hit > .cg-pressface` با `inset:2px`. **این را باگ ندانید و «یکسان‌سازی» نکنید** — عمدی است و در هارنس هم جداگانه شمرده می‌شود (`strayFaces == 0 && knobFaces == 1`).

**Verification**:
- `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۶٫۴۱ KB / ۲۶۰٫۴۲ KB gzip) · `npm run test:mp` → **۳۷/۳۷**.
- `/tmp/cw-press.cjs` (تک‌نفره، روشن و شب) → **۲۶/۲۶**: ۴۱ کاشی سوار، همه در حالت آرام `opacity:0`، هر فشار فقط کاشی خودش را روشن می‌کند و رها‌کردن به ۰ برمی‌گردد؛ ترازِ برش `{scale:0.4199, offX:9.82, offY:9.49, padX:9.99, padY:9.51}` یعنی دقیقاً همان حاشیهٔ ۱۰ پیکسلی پنل.
- **درزِ برش وجود ندارد**: اختلاف پیکسلی چهار گوشهٔ کاشیِ کلیدِ فشرده **۰٫۰** در روشن و شب؛ و در شب کاشی دقیقاً به همان اندازهٔ پنل تیره می‌شود (اختلاف گوشه ۰٫۰)، در حالی که پوستر و پس‌زمینه دست‌نخورده می‌مانند. مربع روشنِ محو دور هر کلید در حالت آرام هم هست — یعنی در خودِ هنر چاپ شده (هر کلید در حفرهٔ خودش)، نه آرتیفکت.
- `/tmp/cw-press-online.cjs` (دو Chrome مستقل + دو حساب موقت، مسابقهٔ رنکد واقعی) → **۲۵/۲۵**: هر دو کلاینت `topbar-online.webp` و `clue-panel-online.webp`، کاشی‌های نوار همه `baro-*` و سینی همه `clueo-*`، ۳۳ کاشی/۳۳ ناحیهٔ کیبورد، ۴۱/۴۱ دیکود‌شده، هیچ کاشی روشن در حالت آرام، صفر face قدیمی، و فشارِ آواتار/فلش سرنخ همان کاشی درست را روشن کرد.
- بازبینی چشمی `/tmp/po-a-avatar.png` و `/tmp/po-b-clue.png`: اختلاف فشرده/آرامِ آواتار فقط روی خطِ دورِ سیماست (بیشینهٔ اختلاف ۱۳۷، بدون هیچ لبهٔ راست‌گوشه؛ تصویر کوچکِ نارنجیِ «دو نفر» بخشی از خودِ چاپ است و در حالت آرام هم دیده می‌شود)، و فلش قبلی در حالت فشرده صاف و تیره شده در حالی که فلش بعدی همان گِلِ برجسته را دارد.

**نکتهٔ هارنس (تکرار شده، جدی بگیرید)**: `nudge()` که هر دکمه‌ای با متنِ شامل «شروع/ادامه/بریم/بازی» را کلیک می‌کند، بازیکن را از صفِ matchmaking بیرون می‌اندازد و به منو برمی‌گرداند (دو اجرا این‌طور حرام شد). مسابقهٔ رنکد کاملاً خودکار است؛ فقط اگر دقیقاً دکمه‌ای با متن `^(شروع بازی|ادامه)$` ظاهر شد کلیک کنید و به‌محض وجود `.cg-postbar` دست نگه دارید.

**دست‌نخورده و منتظر تصمیم**: قرصِ امتیازِ خالی در نوار بالا («۱۱» داخل قرصِ سبزِ بی‌متن) و اجازهٔ ویرایش خودِ `topbar*.webp`؛ کد مردهٔ مینی‌گیم کارت؛ `public/images/worldmap/card-back.svg`؛ استخر واژه‌های #۴۸–#۵۱.

---

### Session 36 (Oct 31, 2026) — چیدمان چهارتکه روی صفحهٔ اصلی: جدول، سرنخ، نوار بالا و کیبورد همه زنده

**درخواست (نقل مستقیم)**: «ینی اینو الان بذاری توی صفحه اصلی دیگه درست میشه؟ اجرا کن کامل با تمام توابع و جدولو همه دکمه ها و افکتهای فشار دکمه. دقی ببینم چی در اومده» — یعنی همان چیدمانی که خودِ کاربر از چهار تکه ساخته بود (`پنل بالا` / `کیبورد و راهنما` / `جدول` + `room-bg`) واقعاً صفحهٔ بازی شود، با تمام توابع.

**ساختار**: `clayConsole = !storyChapter && !towerFloor && !worldMapAccent` در `components/GameView.tsx` از قبل هر چهار مسیر (شروع سریع، معمای روزانه، بازپخش دوئل و نبرد آنلاین) را به یک صفحه می‌برد. صحنه ۱۰۲۴×۱۲۸۰ است (`width: min(100vw, 80vh)` + `aspectRatio`)، روی `room-bg.webp` که با `width: max(100vw, 102.4vh)` کل ویوپورت را می‌پوشاند. جای هر اسپرایت:

| قطعه | اسپرایت | اسلات (stage) |
|---|---|---|
| نوار بالا | `hud-top.webp` ۵۰۹×۸۷ | ۱۲۸، ۲۱، ۷۶۸×۱۳۱٫۵ |
| قاب جدول | `board-frame.webp` ۲۹۴×۲۷۴ | ۲۰۱٫۳، ۱۸۲٫۲، ۶۲۱٫۵×۵۷۹٫۳ |
| جدول زنده | — | ۲۷۹٫۵، ۲۳۹٫۳، ۴۶۳×۴۶۵٫۲ |
| سینی + کیبورد | `deck.webp` ۵۰۴×۲۶۰ | ۹، ۷۵۷، ۱۰۰۸×۵۲۰ |

**سه اصلاحی که در همین دور لازم شد**
1. **جدول روی کادر چاپی، نه روی حفرهٔ کاغذ**: اسپرایت قاب، خودِ جدول ۷×۷ و حاشیهٔ کاغذی‌اش را چاپ‌شده دارد (کاغذ ۱۷..۲۶۸×۱۹..۲۵۴، جدول چاپی ۳۷..۲۵۶×۲۷..۲۴۷ از برش ۲۹۴×۲۷۴). اسلات از حفره به `279.5,239.3,463,465.2` برگشت؛ نتیجه: برگهٔ زنده دقیقاً روی جدول چاپی می‌نشیند و حاشیهٔ کاغذیِ خودِ قاب دیده می‌شود — همان چیزی که چیدمان تأییدشده دارد.
2. **مرکبِ خطوط `#1B1613`**: رنگ قبلی (`#67533B`) در یک پیکسل مثل یک چینِ نرم دیده می‌شد؛ از اسکن پیکسلی پوستر، مغزِ خط ۱۱–۲۳ بود.
3. **صفرِ لوزی در نوار بالا**: دو علت داشت — `font-variant-numeric: tabular-nums` (صفرِ جدولیِ وزیرمتن نقطهٔ توپر است) و `-webkit-text-stroke` (حلقهٔ صفرِ تناسبی را می‌بست). علت اصلی اما فونت بود: `font-sans` روی ریشهٔ اپ از `body{font-family:'Vazirmatn'…}` جلو می‌زند و فونت سیستم، U+06F0 را لوزی می‌کشد. حالا `.cg-postbar-val` صریحاً Vazirmatn می‌خواهد و `font-variant-numeric:normal` است. ساعت هم روی مرکز واقعی قابِ گرد (`BAR_SLOTS.clock = barRect(255,20,42,40)`؛ مرکز ۲۷۵٫۵،۴۰) نشست.

**هم‌خوانی رنگ با چیدمان تأییدشده** (نمونه‌برداری پیکسلی از هر دو تصویر): کاغذ خانه‌های غیرفعال مرجع `(222,198,172)` و پیاده‌سازی `(222,199,172)`؛ کلمهٔ فعال مرجع `(244,226,191)` و پیاده‌سازی `(244,227,192)`؛ حاشیهٔ کاغذی قاب مرجع `(220,190,157)` و پیاده‌سازی `(218,191,165)` — یعنی تفاوتِ حاشیه با خانه‌ها در خودِ پوستر هم هست، نه آرتیفکت ما.

**Verification**: `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۲٫۵۸ KB / ۲۵۹٫۶۱ KB gzip) · `/tmp/cw-live.cjs` → **۲۱/۲۱** (مرحله ۱۰۲۴×۱۲۸۰، ۵ ناحیهٔ نوار، ۳۶ ناحیهٔ سینی، ۳۳ کلید، ۴۱ face با `inset:2px`، تایپ واقعی در جدول، سرنخ/شمارهٔ زنده، ساعت و سکه با رقم فارسی) · همان هارنس با `online` → **۴۰/۴۰** (دو کلاینت مستقل: هر دو `hud-top.webp` و `deck.webp`، هر دو ۳۳ کلید و ۴۱ face، قرص امتیاز نام دو بازیکن، فشار آواتار/فلش سرنخ، حروف تایپ‌شده روی جدول حریف) · اسکرین‌شات ۱۰۲۴×۱۲۸۰ (`/tmp/stage-final.png`) و گوشی ۴۳۰×۹۴۰ (`/tmp/live-solo.png`، `/tmp/live-solo-held.png`) · ترکیب ۵۰٪ با چیدمان تأییدشده: اختلاف میانگین کل ۲۶٫۶، نوار بالا **۷٫۳**، سینی ۱۱٫۳، جدول ۵۳٫۵ (اختلافِ جدول از الگوی متفاوت جدولِ تولیدشده است، نه هندسه — خطوط روی هم می‌افتند).

**نکته‌ای که «باگ» نیست**: جدولِ بازیِ سریع ۵×۵ است و روی همان قاب ۷×۷ می‌نشیند؛ با انتخاب ۷×۷ خطوط زنده دقیقاً روی خطوط چاپی می‌افتند.

> حاشیهٔ بالا/پایینِ این نسخه (صحنهٔ ۴:۵ وسط صفحه) در Session 37 حذف شد — پایین را بخوانید.

---

### Session 37 (Oct 31, 2026) — سه‌باندِ تمام‌صفحه: نوار بالا به لبهٔ بالا، جدولِ پهن‌تر در وسط، کیبورد به لبهٔ پایین

**درخواست (نقل مستقیم)**: «المنت‌ها به این صورتن که پنل بالایی باید بچسبه بالای صفحه. جدول باید وسط صفحه رو امل بگیره.و کیبورد و راهنما چسبیده بهش باید بچسبه پایین صفحه و این فضای بینشون رو بر اساس سایز صفحه تغییر بدی. و اینکه جدول باید بیشتری عرض رو بگیره. دقیق باید کاری کنی که توصفحه موباید خیلی خیلی خوب دیده بشه و فضای کافی رو استفاده کنی» — یعنی صحنهٔ ثابتِ ۱۰۲۴×۱۲۸۰ و حاشیهٔ بالا/پایینش ممنوع.

**ساختار تازه** (`components/GameView.tsx` + `index.css`): به‌جای «صحنهٔ ثابت + اسلاتِ درصدی»، یک ستونِ فلکسِ تمام‌قد:
- `.cg-console-col` = `display:flex; flex-direction:column; height:100dvh; width:min(100%, 56vh, 560px)` (با fallback `vh`)، همراه `padding` برای `env(safe-area-inset-*)`.
- باندِ اول: `PosterTopBar fill` چسبیده به لبهٔ بالا (نسبت ۵۰۹/۸۷).
- باندِ میانی: `flex-1` با `items-center` — قابِ جدول (`294 / 274`) تمامِ عرض ستون را می‌گیرد، و **باقیِ ارتفاع به دو گپِ مساوی** بالا و پایینِ آن تبدیل می‌شود.
- باندِ سوم: `GameDeck` چسبیده به لبهٔ پایین (نسبت ۵۰۴/۲۶۰).
- `slot()` و مرحلهٔ ۱۰۲۴×۱۲۸۰ کاملاً حذف شدند؛ جدولِ زنده حالا **نسبت به خودِ قاب** جای‌گذاری می‌شود: `left 12.585% · top 9.854% · width 74.49% · height 80.292%` — یعنی همان کادرِ چاپیِ ۳۷..۲۵۶×۲۷..۲۴۷ از برشِ ۲۹۴×۲۷۴؛ پس در هر عرضی مو‌به‌مو روی چاپ می‌نشیند.

**ریاضیِ عرض (چرا در هیچ نسبتی سرریز نمی‌کند)**: سه اسپرایت روی هم `0.17092 + 0.9320 + 0.51587 = 1.6188 × W` ارتفاع می‌خواهند؛ با `W = min(100%, 56vh, 560px)` همیشه ≥۹٪ از ارتفاع برای گپ‌ها می‌مانَد. مقادیر اندازه‌گیری‌شده:

| ویوپورت | عرض ستون | گپ بالا/پایین |
|---|---|---|
| ۴۳۰×۹۴۰ | ۴۳۰ | ۱۲۲ / ۱۲۲ |
| ۴۳۰×۱۲۰۰ | ۴۳۰ | ۲۵۲ / ۲۵۲ |
| ۳۹۰×۸۴۴ | ۳۹۰ | ۱۰۶٫۴ / ۱۰۶٫۴ |
| ۳۷۵×۶۶۷ | ۳۷۳٫۵ | ۳۱٫۲ / ۳۱٫۲ |
| ۷۶۸×۱۰۲۴ | ۵۶۰ | ۵۸٫۸ / ۵۸٫۸ |
| ۱۲۸۰×۸۰۰ | ۴۴۸ | ۳۷٫۴ / ۳۷٫۴ |
| ۸۴۴×۳۹۰ (افقی) | ۲۱۸٫۴ | ۱۸٫۳ / ۱۸٫۳ |

**گپ‌ها خالی نیستند**: `room-bg.webp` با `width:max(100vw, 102.4vh)` همان بک‌دراپِ اتاق را در آن نوارها می‌کشد، پس «فضای کافی» واقعاً استفاده می‌شود، نه سفیدی.

**Verification**: `npx tsc --noEmit` پاک · `npm run build` OK (۹۲۲٫۵۸ KB / ۲۵۹٫۶۲ KB gzip) · `/tmp/cw-live.cjs` → **۲۴/۲۴** · `node /tmp/cw-live.cjs online` → **۴۳/۴۳** (هر دو کلاینت آنلاین: `hud-top.webp` و `deck.webp`، ۳۳ کلید و ۴۱ face، قرص امتیاز هر دو بازیکن، تایپ واقعی و رسیدن کلمه به جدول حریف — یعنی همان شاخهٔ `clayConsole` برای نبرد رنکد هم همین چیدمان را دارد) · `/tmp/cw-bands.cjs` → **۷۰/۷۰** روی ۷ ویوپورت بالا (نوار چسبیده به لبهٔ بالا، سینی چسبیده به لبهٔ پایین، جدول تمامِ عرضِ ستون، گپ‌ها مثبت و متعادل، بدون سرریز افقی، ۳۳ کلید + ۴۱ face، صفر خطای کنسول) · اسکرین‌شات‌ها: `/tmp/live-solo.png`، `/tmp/bands-small.png`، `/tmp/bands-tall.png`، `/tmp/bands-desktop.png`، `/tmp/bands-landscape.png`.

**تصمیم آگاهانه**: روی دسکتاپ ستون وسط‌چین با سقف ۵۶۰px می‌مانَد (به‌جای کشیدنِ هنر تا عرض ۱۲۸۰) — چون این هنر برای صفحهٔ گوشی ساخته شده و بزرگ‌کردنش فقط اسپرایت را تار می‌کند؛ دو طرفش بک‌دراپِ اتاق پر می‌شود.

---

**آخرین بروزرسانی**: ۳۱ اکتبر ۲۰۲۶  
**نسخه**: 0.0.0  
**وضعیت**: ✅ فازهای ۱–۶ + خودترمیمی اتاق آنلاین + تصاویر واقعی داستان/قصه‌ها + آواتار محتوا‌محور Boss + دوئل غیرهم‌زمان با داوری منصفانه، چیپ زنده و مدل «چالش + دعوت» (سقف ۵ چالش / ۵ دعوت، انقضای ۷ روزه، حذف فقط پیش از نتیجه، بستن به‌جای حذف بعد از آن) + اعلان دعوت روی منو + مهار تورم سکه (پازل ۱۵۰، برج ۴۰۰، لیگ ۱۵، دوئل ۱۵/۸/۳) + بستهٔ نگه‌داشت (زنجیره/سپر/مأموریت/XP/فصل/کالکشن/کازمتیک/آنالیتیکس) + منوی فشرده با شیت «امروز من»، معمای روزانه به‌صورت نوار کم‌رنگ، «هدف بعدی» داخل باکس «بازی سریع»، گذرِ نور روی دو ردیف پهن و قوسِ نوری چرخان روی لبهٔ برج/نبرد + زبان متریال سفال و کاغذ: دیوارِ خشتِ آجرچیده (`clay-wall`)، طاقچه و جیبِ بریده‌شده برای کارت‌ها، سینیِ خشتیِ نقشهٔ جهان با حفره‌های پیشرفت، جدولِ مرکب‌کشیده روی برگهٔ کاغذِ قاب‌گرفته در سفال و حذف نقاط بی‌معنی + تکمیل زبان سفال (اعداد فارسی لابی برج، پیش‌نمایش قاب‌های کازمتیک، صفرِ خوانا در رکورد، حالت خالی دوستان، نوار تبِ شبِ سفالی) + جدولِ کنسول دقیقاً مطابق موکاپ در بازیِ عادی و آنلاین (کاغذِ یک‌دست `#E1CDB9`، مرکبِ `#241A14`، خانه‌های مربع، خطِ انتخاب ۱٫۵px طلایی، بدون تینت سبز، گلِ رز برای حروف حریف) + لایهٔ زندهٔ پوستر (جدول ساخته‌شده داخل پنل جدولِ خودِ تصویر، متن سرنخ روی سینی چاپ‌شده، و اورلیِ فشارِ ۲پیکسلی با توابع واقعی روی ۳۳ کلید کیبورد + ۳ دکمهٔ راهنما + ۵ دکمهٔ نوار بالا، بدون هیچ تغییری در تصویر) + حالت فشردهٔ چاپی روی همان کنترل‌ها (۴۹ کاشیِ بازرندرشده از خودِ هنر با دستور پختِ تأییدشده؛ تصویر پوستر و چیدمان دست‌نخورده، فقط کاشیِ فرو‌رفته جای faceهای اورلی) + چیدمان چهارتکه روی صفحهٔ اصلی (نوار بالا، قاب جدول با جدولِ زنده روی کادر چاپی، سینی سرنخ و کیبورد؛ همهٔ دکمه‌ها و اثرهای فشار فعال، ساعت/سکه/امتیاز/سرنخ زنده با رقم فارسی) + چیدمان سه‌باندِ تمام‌صفحه (نوار بالا به لبهٔ بالا، قابِ جدول تمام‌عرض در وسط با دو گپِ کشسان، کیبورد و راهنما به لبهٔ پایین؛ روی گوشی لبه‌به‌لبه و روی دسکتاپ ستونِ وسط‌چین ۵۶۰px) — build/typecheck/E2E سبز
