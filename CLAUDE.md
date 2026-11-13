# Crossword Gen Pro - پروژه جدول کلمات متقاطع ایرانی

یک بازی جدول کلمات متقاطع پیشرفته با React + TypeScript + Vite با قابلیت‌های چندنفره، حالت داستانی، تولید خودکار جدول، و سیستم مسابقه‌دهی (matchmaking).

---

## 🚀 اجرا

### ۱. Redis (اجباری برای چندنفره)

Redis از قبل نصب شده در:  
`/Users/mehdipoursoleiman/Downloads/redis-stack-server-7.2.0-v9.catalina.x86_64/bin/`

```bash
# شروع Redis (اگر از قبل اجرا نیست):
/Users/mehdipoursoleiman/Downloads/redis-stack-server-7.2.0-v9.catalina.x86_64/bin/redis-server --daemonize yes --port 6379

# تست:
/Users/mehdipoursoleiman/Downloads/redis-stack-server-7.2.0-v9.catalina.x86_64/bin/redis-cli ping
# → باید PONG برگرداند
```

> **نکته:** اگر پورت ۶۳۷۹ گرفته است، یعنی Redis در حال اجراست. نیازی به restart نیست.

### ۲. Backend (پورت ۸۰۸۱)

```bash
lsof -ti:8081 | xargs kill -9 2>/dev/null
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server"
node index.js
```

خروجی موفق:
```
[redis] ✅ Connected to Redis
[PostgresDB] ✅ Connected to PostgreSQL
✅ WebSocket server ready
✅ Crossword Local Server running on port 8081
```

### ۳. Frontend (پورت ۸۰۸۰)

```bash
lsof -ti:8080 | xargs kill -9 2>/dev/null
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2"
npx vite --port 8080 --host 127.0.0.1
```

### روش یک‌خطی (start script):

```bash
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2"
# 1. Redis
/Users/mehdipoursoleiman/Downloads/redis-stack-server-7.2.0-v9.catalina.x86_64/bin/redis-server --daemonize yes --port 6379
# 2. Backend (background)
lsof -ti:8081 | xargs kill -9 2>/dev/null; cd server && node index.js &
sleep 2
# 3. Frontend
lsof -ti:8080 | xargs kill -9 2>/dev/null; cd .. && npx vite --port 8080 --host 127.0.0.1
```

> **نکته:** فرانت‌اند نیاز به API Key ندارد (`.env.local` placeholder است). بک‌اند از Supabase استفاده می‌کند (کلید در `server/.env`).

---

## 📡 پورت‌ها

| سرویس  | پورت | کانفیگ |
|--------|------|--------|
| Frontend (Vite) | 8080 | `utils/config.ts` → `FRONTEND_PORT` |
| Backend (Express+WS) | 8081 | `utils/config.ts` → `API_PORT` + `server/.env` → `PORT` |

---

## 🏗️ ساختار پروژه

```
crossword-gen-pro (8) 2 2/
├── App.tsx                    # کامپوننت اصلی (144KB) - state, navigation, game loop
├── types.ts                   # تمام TypeScript types
├── index.tsx / index.html     # Entry point
├── vite.config.ts             # تنظیمات Vite (port, proxy)
├── utils/config.ts            # کانفیگ متمرکز پورت‌ها
├── utils/
│   ├── glueWords.ts           # (مهم) الگوریتم اصلی ساخت جدول - پیچیده و حساس
│   ├── gridLogic.ts           # منطق grid و validation
│   ├── gameServer.ts          # (مهم) سرور بازی محلی (LocalChannel)، مدیریت اتاق، WebSocket
│   ├── freeformGenerator.ts   # تولید جدول آزاد
│   ├── dictionary.ts          # مدیریت دیکشنری کلمات (3-tier supplement)
│   ├── multiplayer.ts         # توابع چندنفره
│   ├── api.ts                 # ارتباط با API خارجی (Gemini AI)
│   ├── config.ts              # پورت‌ها: FRONTEND_PORT=8080, API_PORT=8081
│   ├── debug.ts               # دیباگ
│   ├── glueWords.ts           # الگوریتم چسباندن کلمات در grid
│   └── sounds.ts              # افکت‌های صوتی
├── components/
│   ├── Controls.tsx            # منوی اصلی
│   ├── GameView.tsx            # صفحه اصلی بازی
│   ├── CrosswordGrid.tsx       # نمایش جدول کلمات
│   ├── GameKeyboard.tsx        # کیبورد مجازی
│   ├── ActiveClueBar.tsx       # نمایش سرنخ فعال
│   ├── GameFeedback.tsx        # بازخورد بصری
│   ├── HintModal.tsx           # مودال راهنما
│   ├── AuthModal.tsx           # احراز هویت
│   ├── ProfileModal.tsx        # پروفایل کاربر
│   ├── ShopModal.tsx           # فروشگاه
│   ├── Leaderboard.tsx         # جدول امتیازات
│   ├── SplashScreen.tsx        # صفحه ورودی
│   ├── Lobby.tsx               # لابی چندنفره
│   ├── MultiplayerHeader.tsx   # هدر چندنفره
│   ├── BattleControls.tsx      # کنترل‌های حالت Battle
│   ├── BattleTutorial.tsx      # آموزش Battle
│   ├── SocialPanel.tsx         # (مهم) پنل اجتماعی - دوستان، چت، نوتیفیکیشن
│   ├── EpicLibrary.tsx         # کتابخانه داستان‌ها
│   ├── EpicModeMenu.tsx        # منوی حالت داستانی
│   ├── TowerLobby.tsx          # لابی Tower
│   ├── TowerBossIndicator.tsx  # نشانگر باس Tower
│   ├── CoinFlipSelection.tsx   # انیمیشن Two-Way Merge برای چندنفره
│   ├── IranMap.tsx             # نقشه تعاملی ایران
│   ├── LeagueBadge.tsx         # نشان لیگ
│   ├── LeagueInfoModal.tsx     # اطلاعات لیگ
│   └── modals/                 # مودال‌های اضافی
├── hooks/
│   ├── useGameLogic.ts         # (مهم) منطق اصلی بازی
│   ├── useMultiplayerState.ts  # مدیریت state چندنفره
│   ├── useSocial.ts            # قابلیت‌های اجتماعی + WebSocket
│   ├── useEpicMode.ts          # حالت داستانی
│   ├── useTowerMode.ts         # حالت Tower (قدیمی)
│   └── useTowerModeV2.ts       # حالت Tower V2
├── data/
│   ├── campaigns.ts            # ۲۴ کتاب داستانی (لیست کامل)
│   ├── shahnamehChapters.ts    # فصل‌های شاهنامه
│   ├── shahnamehWords.ts       # کلمات شاهنامه
│   ├── wordLists.ts            # لیست کلمات و سرنخ‌های فارسی/انگلیسی
│   ├── glueWords.ts            # کلمات چسب (filler)
│   ├── glueWordsExtra.ts       # کلمات چسب اضافی
│   ├── shahnameh/              # فایل‌های کلمات و فصل‌های هر کتاب
│   ├── folktales/              # قصه‌های عامیانه
│   ├── school/                 # کتب درسی
│   └── history/                # داستان‌های تاریخی
├── server/
│   ├── index.js                # (مهم) سرور Express + WebSocket
│   ├── wsServer.js             # (مهم) WebSocket server برای چندنفره
│   ├── models.js               # مدل‌های دیتابیس
│   ├── db/                     # دیتابیس
│   ├── middleware/              # میدل‌ور
│   ├── scripts/                # اسکریپت‌های سرور
│   ├── local-data/             # دیتای محلی (JSON, SQLite)
│   ├── data.sqlite             # دیتابیس اصلی
│   └── .env                    # SUPABASE_URL, SUPABASE_KEY, PORT=8081
├── services/
│   └── league.ts               # سرویس لیگ
├── net/
│   └── LocalChannel.ts         # کانال محلی برای شبکه
├── api/
│   └── client.ts               # کلاینت API
├── scripts/                    # اسکریپت‌های تولید محتوا (Node.js)
│   ├── generate-words.cjs      # تولید کلمات جدید
│   ├── add-curated-words.cjs   # افزودن کلمات منتخب
│   ├── svg-utils.cjs           # ابزارهای SVG (تکثیر شونده)
│   ├── gen-chapters.cjs        # تولید SVG فصل‌ها
│   ├── gen-covers.cjs          # تولید SVG کاورها
│   ├── gen-monsters.cjs        # تولید SVG مونسترها
│   └── ...                     # اسکریپت‌های دیگر
├── public/images/
│   ├── chapters/               # تصاویر فصل‌ها
│   ├── covers/                 # تصاویر کاور کتاب‌ها
│   ├── monsters/               # تصاویر مونسترها
│   └── iran-map.svg            # نقشه ایران
├── AGENTS.md                   # مستندات کامل برای AI agents
├── RULES.md                    # قوانین کاری
├── ROADMAP.md                  # نقشه راه توسعه
├── ONLINE_BATTLE_RULES.md      # قوانین بازی آنلاین
└── WORD_CRAFTING_RULES.md      # قوانین ساخت کلمات
```

---

## 🎮 حالت‌های بازی

1. **Casual** - جدول کلمات متقاطع معمولی با انتخاب سایز و دسته‌بندی
2. **Epic/Story** - حالت داستانی با داستان‌های شاهنامه و ایران باستان (۲۴ کتاب، ۱۶۳+ فصل)
3. **Multiplayer** - دو نفره (Speed یا Battle) با Two-Way Merge
4. **Tower** - چالش طبقات با سیستم Ticket و Boss Fight

### Game Views (`types.ts`)
```
'menu' | 'playing' | 'leaderboard' | 'profile' | 'lobby' | 'social' |
'epic_library' | 'epic_chapters' | 'tower_lobby'
```

### Game Modes
```typescript
type GameMode = 'speed' | 'battle' | 'casual';
```

### دسته‌بندی کلمات
```typescript
type Category = 'general' | 'movies' | 'cities' | 'knowledge' | 'food' |
                'body' | 'jobs' | 'tech' | 'nature' | 'shahnameh' | 'history' |
                'sports' | 'art' | 'all';
```

---

## 🧠 نکات مهم فنی

### Grid Algorithm (`utils/glueWords.ts`)
- الگوریتم پیچیده و حساس برای ساخت جدول کلمات متقاطع
- از CSP (Constraint Satisfaction Problem) برای قرار دادن کلمات استفاده می‌کند
- سایزهای ۵×۵ تا ۱۰×۱۰
- پشتیبانی از دو دسته‌بندی همزمان در حالت چندنفره (merged categories)

### WebSocket Architecture
- دو WebSocket مستقل در هر کلاینت:
  - **WS #1** (`useSocial.ts`): کانال `global_social` برای نوتیفیکیشن و چت
  - **WS #2** (`gameServer.ts` LocalChannel): کانال اتاق برای بازی
- هر دو heartbeat 15 ثانیه‌ای دارند
- سرور (wsServer.js) grace period 5 ثانیه قبل از broadcast `player_left`

### Two-Way Merge System (Multiplayer)
- **سایز**: میانگین هندسی `Math.round(Math.sqrt(hostSize × guestSize))`
- **دسته‌بندی**: ۵۰٪ کلمات از دسته میزبان + ۵۰٪ از دسته مهمان
- انیمیشن merge در `CoinFlipSelection.tsx`

### Matchmaking (Quick Match)
- صف درون‌حافظه‌ای در سرور با 30 ثانیه timeout
- Players با mode + wager مشابه باهم match می‌شوند
- Polling 2 ثانیه‌ای + WebSocket notification

### دیکشنری و کلمات
- ۷۹۳۰ کلمه فارسی واقعی در dictionary.json
- 9 دسته‌بندی با پشتیبانی 3-tier supplement (کلمات اصلی ← همسایه ← سایر دسته‌ها)
- کلمات حداقل 50 تایی در هر طول برای هر دسته (MIN_PER_LEN=50)

### Dark Mode
- CSS injection از طریق `DARK_CSS` constant در `App.tsx`
- به جای Tailwind dark: prefix
- کلاس `html.dark` روی HTML tag

### نقشه ایران (`components/IranMap.tsx`)
- SVG با 31 استان، viewBox="0 0 655 594"
- تبدیل از 733.5x676.5 به 655x594 با scale
- translate(35, 36) روی group اصلی
- 29+ مارکر جغرافیایی برای کتاب‌های داستانی

---

## 🐛 Session History (خلاصه)

| Session | تاریخ | تغییرات |
|---------|------|---------|
| 1 | Jun 1 | پروژه اولیه |
| 2 | Jun 1 | Fix: Monster Rage Timer Before Story Modal |
| 3 | Jun 1 | 2 کمپین جدید: رستم و سهراب + رستم و افراسیاب |
| 4 | Jun 1 | جایگزینی SVGs انتزاعی با مینیاتور ایرانی |
| 5 | Jun 2 | ۱۵,۳۰۰ کلمه جدید (بعداً حذف شد) |
| 6 | Jun 2 | جایگزینی با ۸۹۷ کلمه منتخب واقعی |
| 7 | Jun 4 | 2 کمپین جدید: سیاوش + بیژن و منیژه |
| 8 | Jun 4 | 6 کمپین جدید: زال و رودابه, آرش, خسرو و شیرین, هفت پیکر, کوروش, مصدق |
| 9 | Jun 4 | 4 کمپین جدید: کاوه, اسفندیار, رستم و اسفندیار, تهمینه |
| 10 | Jun 4 | 7 کمپین جدید: زال و سیمرغ, کیخسرو, مرگ رستم, رستم و اکوان, هوشنگ, جمشید, انوشیروان |
| 11 | Jun 6 | Fix: Presence System + WebSocket Auto-Reconnect |
| 12 | Jun 6 | Scalability Planning + Documentation |
| 13 | Jun 7 | Fix: Presence Handler + Leave/Cancel Buttons |
| 14 | Jun 7 | Two-Way Merge System (فاز ۱-۳) |
| 15 | Jun 7 | Final Bug Fixes: Room Check, Decline Button, Reconnect |
| 16 | Jun 10 | Dead Code Cleanup + Merge Ack |
| 17 | Jun 11 | UI Polish: Victory Confetti, Merge Animation, Grid Info |
| 18 | Jun 11 | Fix: Safari Notification + WS Heartbeat, Auth Fallback |
| 19 | Jun 11 | Fix: Opponent Score Zero + Floating Emoji Sync |
| 20 | Jun 11 | League Trophy Integration |
| 21 | Jun 11 | Matchmaking System (Quick Match Queue) |

---

## 🛠 Session History

### Session 22 (Jun 12, 2026) - Fix: Profile name not persisting after refresh + Trophy count wrong

**Bug 1 — Profile name reverts after refresh**:
- Catch block in `App.tsx:onUpdate` only saved theme on error, name/avatar silently lost
- `getPlayerState` for registered users returned server state (old name) over local
- **Fix**: Catch block now saves name+avatar+theme; `getPlayerState` prefers local name over server

**Bug 2 — Trophy count shows highScore instead**:
- First stat card in `ProfileModal.tsx` showed "بیشترین امتیاز" with `player.highScore`
- Changed to "تعداد جام" with `player.league.trophies`
- HighScore moved to a small inline row below the cards

**Bug 3 — All data lost on refresh (trophies + highScore + score reset to 0)**:
- `getPlayerState()` for registered users returned server state on login, but server state could have stale/zero values (e.g., server DB reset or mismatched deviceId). Local values for score, highScore, trophies were NOT merged — they were silently lost.
- Cache corruption in localStorage was silently caught with empty `catch {}` — no logging.
- **Fix**: Added complete local→server merge in `getPlayerState` for registered users: score, highScore, coins, level, trophies, winStreak, wins/losses, towerTickets, towerHighFloor, history all prefer the maximum of local vs server. Added console.warn in catch for corruption debugging. Merged state is saved back to localStorage.

**Bug 4 — Trophy count not persisting (always 0 for casual games)**:
- `saveMatch()` in `utils/gameServer.ts` never awarded trophies for casual/single-player games
- Only multiplayer (`applyMultiplayerResult`) awarded trophies
- After changing profile card to show `player.league.trophies`, it was always 0 for casual players
- **Fix**: Added trophy award in `saveMatch`:
  ```
  trophyGain = max(1, min(30, floor(record.score / 100) × 2 + record.size - 4))
  ```
  Example: score=200, size=6 → 5 trophies | score=600, size=8 → 16 trophies

**Build**: ✅ `npm run build` passes (1,402 KB bundle, 358 KB gzipped, 2.92s)

### Session 22.2 (Jun 12, 2026) - Fix: Header Trophy icon shows score instead of trophies

**Bug**: The header bar next to the avatar showed `player.score` with a Trophy icon, misleading users into thinking it was their trophy count.

**Fix**: Changed `player?.score` to `player?.league?.trophies ?? player?.score ?? 0` in `App.tsx:1804`.

**Build**: ✅ `npm run build` passes (1,403 KB bundle, 359 KB gzipped, 2.90s)

**Bug**: Changing the username in ProfileModal shows "ذخیره شد" but reverts to old name after page refresh.

**Root Cause (2 issues):**

1. **Catch block in `App.tsx:onUpdate`** — When `gameServer.updateProfile` threw (e.g., null player), the catch block only saved theme (`if (t) { ... theme: t }`). Name and avatar changes were silently lost, yet the toast still said "ذخیره شد".

2. **Server state overriding local** (`utils/gameServer.ts:getPlayerState`) — For registered users, on page refresh, `getPlayerState` logs in to the server and returns `serverState` via `mapProfileToState`. If the `/profile` PUT API call had failed silently earlier, the server still had the old name. The server state completely replaced the localStorage state.

**Fixes Applied**:
- `App.tsx`: Catch block now saves `name` + `avatar` + `theme` to localStorage and calls `setPlayer()` with full data
- `utils/gameServer.ts:getPlayerState`: After login, local `parsed.name`/`parsed.avatar` take priority over server values
- Also added explicit `gameServer.savePlayer()` call in the success path for extra safety

**Build**: ✅ `npm run build` passes (1,402 KB bundle, 358 KB gzipped, 3.66s)

---

## ⚠️ مشکلات شناخته‌شده

1. ✅ ~~Presence/Sync خراب~~ (رفع شد session 11)
2. ✅ ~~WebSocket reconnect بی‌مورد~~ (رفع شد session 11)
3. ✅ ~~سرور grace period~~ (اضافه شد session 11)
4. ⚠️ بازی آنلاین: دعوت‌شونده می‌پذیرد ولی بازی ساخته نمی‌شود — نیاز به تست end-to-end
5. ⚠️ `useSocial.ts` WebSocket مستقل خودش را دارد (ممکن است race condition مشابه داشته باشد)
6. ⚠️ Coin flip timing race condition بین host و joiner
7. ⚠️ Room/channel lifecycle: بررسی شود که room_xxxx کانال قبل از ارسال invite ساخته شود

---

## 🔧 Build & Deploy

```bash
npm run build      # Build production
npm run preview    # Preview build
npm run dev        # Development server (Vite)
```

حجم بیلد فعلی: ~1,323 KB bundle (~338 KB gzipped), ~3.40s
