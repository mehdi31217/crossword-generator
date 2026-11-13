# CODE AUDIT — Crossword Gen Pro
> تاریخ: ۲۰۲۶-۱۰-۰۳ · روش: خواندن مستقیم کد فعلی (read-only، هیچ کدی تغییر نکرده)
> دامنه: کل فرانت‌اند (App.tsx + ۲۲ hook + ۳۰ کامپوننت)، بک‌اند کامل (سرور + DB + Redis + WS)، موتور بازی، و لایه‌ی محتوا.

---

## ⚠️ ۰. نکته‌ی مهم: مستندات از کد عقب افتاده و گمراه‌کننده شده

این مستندات دیگر قابل اعتماد نیستند — این خودش یک مشکل جدی است:

| ادعای مستند | واقعیت کد |
|---|---|
| `App.tsx` ~۱۹۶۱ خط (God Component) | الان **۱۰۳۴ خط** است و به hookها شکسته شده |
| ۲۴ کتاب داستانی | `campaigns.ts` **۳۲ کتاب** دارد |
| الگوریتم جدول در `glueWords.ts` | `glueWords.ts` فقط **لیست کلمات** است؛ الگوریتم واقعی `gridLogic.ts` (`fillGrid`) + `runSolver.ts` + `freeformGenerator.ts` است |
| پورت‌های ۳۰۰۰/۴۰۰۰ | واقعی: **۸۰۸۰/۸۰۸۱** |
| Supabase (در AGENTS.md) | جایگزین شده با WS خودساخته |

`ALL_ISSUES_AUDIT.md` هم بخشی‌اش کهنه است: از ۱۰ مورد بررسی‌شده، **۴ مورد رفع شده، ۱ مورد رد شد، ۵ مورد هنوز باز**.

---

## 🔴 ۱. بحرانی — امنیت و یکپارچگی داده (این‌ها در audit قدیمی نبودند)

> این‌ها تا وقتی اپ فقط لوکاله مهم نیستند؛ ولی لحظه‌ای که آنلاین با کاربر واقعی و لیگ/امتیاز بشه، همه‌چیز خراب می‌شود.

1. **سکه‌سازی توسط کلاینت (Coin minting).** `/api/match` مقدار `coins` ارسالی کلاینت را می‌پذیرد و اگر از سرور بیشتر باشد، موجودی سرور را overwrite می‌کند — `server/index.js:250-258`. همین اعتماد در `/api/arena/create` (`:1044-1050`) و `/api/arena/join` (`:1115-1124`) هم هست. هر کلاینت می‌تواند سکه‌ی نامحدود بسازد.
2. **IDOR روی API عمومی جدول‌ها.** `app.get('/api/:table')` (`server/index.js:770-809`) اجازه می‌دهد هر کاربر احراز‌هویت‌شده با `?receiver_id=<هرکسی>` پیام‌های خصوصی دیگران را بخواند. `messages` و `notifications` به `req.userId` محدود نشده‌اند.
3. **پرداخت آرنا به کلاینت اعتماد می‌کند.** `winnerId` از سمت کلاینت می‌آید و فقط چک می‌شود ∈ {host,joiner}؛ idempotency (`resultSubmitted`) در حافظه‌ی `roomRegistry` است — با ری‌استارت سرور یا instance دوم، جایزه **دو بار** پرداخت می‌شود (`server/index.js:1248-1283`).
4. **احراز هویت ضعیف.** رمزها با **SHA-256 بدون salt** و مقایسه‌ی غیر‌constant-time هش می‌شوند (`server/index.js:128,160,169`). هویت = `deviceId` کلاینت؛ اگر کاربری `password_hash` نداشته باشد، هر کسی که deviceId را بداند توکن می‌گیرد (`:159-171`).
5. **اندپوینت‌های تغییر‌دهنده‌ی حالت بدون auth.** `/api/player-left` (`server/index.js:1291`) و `/api/room/check` در whitelist بدون احراز هویت‌اند (`server/middleware/sessionAuth.js:83-87`) — هر کسی می‌تواند `player_left` جعلی به هر اتاقی بفرستد (برد کاذب!) یا اتاق‌های ۶ رقمی را enumerate کند.
6. **سکرت‌ها commit شده‌اند.** `server/.env` در git **tracked** است و کلید Supabase و رمز Postgres (`Mmp%4031217`) داخلش است.
7. **`_redisBroadcast` معکوس است → broadcast بین‌سروری مرده.** `server/wsServer.js:89` پیام را با `_redisBroadcast: true` منتشر می‌کند و subscriber در `:167` همان را `return` می‌کند. یعنی **هیچ** پیام بین instanceها نمی‌رسد. Horizontal scaling عملاً غیرفعال.

---

## 🟠 ۲. مهم

8. **`redis.keys('mm:*')` روی اندپوینت‌های بدون auth** (`server/redis.js:215,237,271`) — `KEYS` مسدودکننده است و از `/api/matchmaking/status` و `/leave` عمومی قابل دسترسی است → DoS ساده. باید `SCAN` شود.
9. **Rate limiting بی‌اثر پشت nginx** — هیچ‌جا `app.set('trust proxy')` نیست (`server/middleware/rateLimit.js:17`)، پس `req.ip` برای همه = IP پروکسی → یک سبد مشترک.
10. **`/readyz` همیشه ۵۰۳ می‌دهد** — `_init()` هیچ `return` ندارد، پس `db.ready` مقدار `undefined` resolve می‌کند (`server/db/index.js:125` + `server/index.js:73`). علت ریشه‌ای همان چیزی است که موقع اجرا دیدم.
11. **اسکیمای Postgres ساخته/seed نمی‌شود + drift.** `PostgresDB.js:51-53` قبل از `this.connected = true` تابع `_ensureSchema()`/`_seedIfNeeded()` را صدا می‌زند، ولی هر دو روی `!this.connected` early-return می‌کنند (`:66,231`). نتیجه: اسکیما ساخته نمی‌شود. علاوه بر آن `password_hash` و `card_progress` در `schema.pg.sql` نیستند → auth با رمز روی PG خاموش می‌ماند. (این توضیح می‌دهد چرا `story_books` خالی بود.)
12. **فروشگاه برج کاملاً از کار افتاده.** `App.tsx:213` مقدار `showMainShop` را destructure می‌کند ولی هوک `showShop` برمی‌گرداند (`hooks/useTowerModeV2.ts:370`). پس `showMainShop` = `undefined` و `components/GameModals.tsx:175` هرگز مودال را باز نمی‌کند. **این یک خطای تایپ است که از build رد شده** (زیرا build فقط `vite build` است و `tsc` اجرا نمی‌شود).
13. **بدون typecheck در build.** اسکریپت build = `vite build` (بدون `tsc --noEmit`) → کلاس کاملی از باگ‌ها (مثل مورد ۱۲) بی‌صدا رد می‌شوند.
14. **حل‌کننده‌ی جدول هرگز به Worker نمی‌رود.** `utils/runSolver.ts:88-97` مستقیم `fillGrid(...)` همگام را صدا می‌زند و `initWorker()` کد مرده است. حلقه تا ۲۵-۴۰ تلاش با timeout هرکدام ۱۰۰۰-۳۰۰۰ms و سقف کل **۱۲۰ ثانیه** (`hooks/useGameLogic.ts:489-495`) → UI در تکه‌های ~۲ ثانیه‌ای تا دو دقیقه فریز می‌شود.
15. **اقتصاد شرط‌بندی خراب است.** کسر `battleWager` فقط داخل کال‌بک `onGameStart` انجام می‌شود که فقط مسیر joiner آن را صدا می‌زند (`App.tsx:296-297`)، ولی `returnToMenu` در هر مسیری refund می‌دهد (`hooks/useNavigation.ts:113-115`) و `refundDoneRef` هم **هیچ‌وقت ریست نمی‌شود** (`:82`) → سکه‌ی رایگان / جایزه‌ی phantom (`battleWager*2` که برای غیر‌آرنا هرگز پرداخت نمی‌شود).
16. **برد کاذب روی قطعی موقت.** grace period درون‌بازی فقط **۲ ثانیه** است (`hooks/useMultiplayerState.ts:409-419,556-566,726-736`) در حالی که reconnect ممکن است بیشتر طول بکشد → اعلام برد/forfeit اشتباه.

---

## 🟡 ۳. متوسط

17. **مسیر forfeit اتاق را leak می‌کند** — `returnToMenu` در `hooks/useNavigation.ts:104-105` بدون `leaveRoom` برمی‌گردد (به امید فراخوانی دوم).
18. **floorConfig کهنه در «ادامه»** — `hooks/useTowerActions.ts:120,163-169` بعد از `advanceToNextFloor()` از config رندر فعلی می‌خواند → طبقه‌ی بعد اندازه/زمان طبقه‌ی قبل را می‌گیرد.
19. **۲۱۵ کلمه‌ی تکراری در ۲۶ کتاب داستانی** (مثلاً `afrasiabWords.ts` ۱۵، `bizhanWords.ts` ۱۹، `rostamEsfandiyarWords.ts` ۲۱) — نقض `WORD_CRAFTING_RULES.md:64`. داخل یک فصل تکراری نیست، ولی بین فصل‌ها هست.
20. **Stale closure در `matchmakingHandlerRef`** (`hooks/useMatchmakingActions.ts:65-92` با `[]` deps).
21. **نشتی تایمر/حافظه** — `setTimeout` ۳۰ ثانیه‌ای در `hooks/useChallengeSystem.ts:219` بدون clear؛ `processedChallenges` بی‌مرز؛ `typingTimeoutRef` در `hooks/useSocial.ts` بدون clear.
22. **retry جعلی** — `utils/multiplayer.ts:139-145,244-250` فقط لاگ می‌کند، unsubscribe و rethrow می‌کند؛ retry واقعی رخ نمی‌دهد.
23. **`pendingNotifications` بی‌مرز** — `server/wsServer.js:17-18`؛ `MAX_PENDING_NOTIFS` تعریف شده ولی استفاده نمی‌شود.
24. **Redis هرگز reconnect نمی‌کند** — `server/redis.js:56-58` بعد از ۳ تلاش `null` برمی‌گرداند.
25. **`createEmptyGrid` می‌تواند topology نامعتبر بدهد** — `utils/gridLogic.ts:7-19` بعد از ۱۰۰ تلاش آخرین نتیجه را برمی‌گرداند و بعد از `fillGrid` دوباره validate نمی‌شود.
26. **Side effect داخل setState updater** — `hooks/useGameLogic.ts:110-119` (`shouldAttack`) و `:153-160` (`gameLost`) — با StrictMode دوبار اجرا می‌شود.
27. **`useHintSystem` مستقیم state را mutate می‌کند** — `hooks/useHintSystem.ts:55,127,131` (`.add/.delete` روی Set بدون setState) → هایلایت ممکن است رندر نشود.
28. **RegExp بدون escape** — `utils/dictionary.ts:288` با مقدار سلول از پیش‌پر می‌تواند throw کند.
29. **امتیاز بدون اعتبارسنجی سروری** — `server/index.js:239-267` هر امتیاز ≤۱۰۰۰۰ را می‌پذیرد و وارد leaderboard می‌کند.
30. **نشت پیام خطا** — برگرداندن `e.message` خام به کلاینت (مثلاً `server/index.js:201,224,270`).

---

## 🟢 ۴. کم

- `any` / castهای بدون چک: `App.tsx:180,258,307,466`، `useGameLogic.ts:503,528,612,738`.
- state تکراری: `gameStarted`+`gameStartedRef`، `finalScore`+`gameWon`.
- `catch {}` خالی و ناهماهنگ: `App.tsx:153,365`، `server/redis.js:73,116`.
- نوشتن localStorage بدون محافظت از quota: `App.tsx:122,174`.
- `ORDER BY RANDOM()` روی `/api/dictionary` عمومی با limit 10000.
- شکل نادرست آبجکت: `sender.username` در حالی که `getUser` برمی‌گرداند `{data}` → اسم‌ها «ناشناس» می‌شوند (`server/index.js:346,352,420,456`).

---

## ✅ ۵. از audit قدیمی: این‌ها واقعاً رفع شده‌اند (منصفانه بگیم)

- **صفحه برد کاذب** — نتیجه حالا gate شده (`components/GameResultScreen.tsx:125-133`) + grace timer با reason check. (ریشه‌ی باقی‌مانده: مورد ۱۶ و ۵.)
- **race بین returnToMenu و handleGameOverEvent** — با `gameOverRef` + تأخیر ۱ ثانیه حل شده.
- **overwrite شدن `finalResult`** — همه‌ی ۸ نقطه‌ی نوشتن گارد `prev.status !== null` دارند.
- **race صف matchmaking در Redis** — حالا با **Lua اتمیک** (`server/redis.js:148-165`).
- **TTL ناهماهنگ `room/check`** — حالا از `ROOM_REGISTRY_TTL` استفاده می‌کند (`server/index.js:929`).
- **retry اعلان matchmaking میزبان** — حالا `sendToUserWithRetry` (`server/index.js:958`).
- **تایمر rage قبل از مودال داستان** — دیگر برای فصل‌ها `isTimerActive` ست نمی‌شود.
- **کلمات ۱ حرفی / تکراری در grid** — واقعاً چک می‌شود (`gridLogic.ts:148,170,301,304,406-412`).
- **فایل/فصل خالی در محتوا** — هیچ فایل کلمه‌ای گم نیست و هیچ فصلی ۰ کلمه ندارد.

---

## 🎯 ۶. برای «کامل و بی‌باگ شدن» چه لازم است؟ (نظر من)

اپ یک محصول واقعاً خوب با هسته‌ی قوی است؛ مشکلات هم پراکنده‌اند نه بنیادی. ولی «بی‌باگ» بدون این ۶ ستون عملاً ممکن نیست:

1. **مرز اعتماد سروری (مهم‌ترین).** اقتصاد (سکه)، امتیاز، و پرداخت جایزه باید **روی سرور** محاسبه شوند، نه از کلاینت پذیرفته شوند. تا این نباشد، لیگ/leaderboard بی‌معناست.
2. **احراز هویت واقعی.** جای `deviceId` + SHA-256 بدون salt → `bcrypt/argon2` + JWT با refresh. و اندپوینت‌های تغییر‌دهنده‌ی حالت باید auth بخواهند.
3. **typechecking در build/CI.** اضافه کردن `tsc --noEmit` به build — یک کلاس کامل از باگ (مثل فروشگاه برج) را می‌گیرد.
4. **یک منبع حقیقت برای multiplayer.** الان دو کانال WS + شبیه‌سازی‌های موازی داریم. باید یک لایه‌ی واحد شود، با grace period درست + HTTP re-check قبل از اعلام برد، و cleanup قطعی هنگام خروج.
5. **موتور غیرمسدودکننده.** حل‌کننده به Worker واقعی منتقل شود + validation اجباری روی grid نهایی.
6. **تست خودکار.** الان E2E تستِ واقعی وجود ندارد؛ برای multiplayer (چالش، matchmaking، game_over) حداقل چند تست E2E لازم است.

و در نهایت: **مستندات از نو از روی کد تولید شوند** — الان مستندات فعالانه گمراه‌کننده‌اند.

---

## 🗺️ ۷. ترتیب پیشنهادی رفع (دسته‌بندی‌شده)

| فاز | تمرکز | موارد |
|---|---|---|
| **A** | امنیت و اقتصاد | ۱،۲،۳،۴،۵،۶ |
| **B** | پایداری multiplayer | ۷،۱۰،۱۱،۱۵،۱۶،۱۷،۲۰،۲۲،۲۳،۲۴ |
| **C** | زیرساخت و ابزار | ۸،۹،۱۳ (typecheck)، ۲۹، ۳۰ |
| **D** | موتور و محتوا | ۱۴،۱۸،۲۵،۲۶،۲۷،۲۸،۱۹ |
| **E** | تمیزکاری | موارد 🟢 + بازتولید مستندات |

> پیشنهاد: از فاز **C** به بعد سریع و کم‌ریسک‌اند؛ فاز **A** و **B** بیشترین تأثیر را دارند ولی نیاز به تست دو‌کلاینتی دارند.

---

## ✅ ۸. وضعیت رفع — بروزرسانی ۲۰۲۶-۱۰-۰۳ (پایان کار)

همه‌ی موارد بالا به‌جز مواردی که صریحاً «باز» علامت خورده‌اند رفع شدند. خلاصه:

| # | مورد | وضعیت |
|---|---|---|
| ۱ | سکه‌سازی توسط کلاینت | ✅ محدود شد (`MAX_COINS`، clamp در match/arena) — ولی اقتصاد همچنان **کلاینت-محور** است (نیاز به تصمیم طراحی برای server-authoritative کامل) |
| ۲ | IDOR روی `/api/:table` | ✅ رفع شد |
| ۳ | پرداخت آرنا به کلاینت | ✅ participant-only + ضد پرداخت دوباره |
| ۴ | احراز هویت ضعیف | ✅ scrypt + ارتقای خودکار hash قدیمی |
| ۵ | اندپوینت‌های بدون auth | ✅ identity-bound شدند |
| ۶ | سکرت‌ها در git | ✅ `server/.env` از track خارج شد (فایل روی دیسک ماند) |
| ۷ | `_redisBroadcast` معکوس | ✅ با `INSTANCE_ID`/`_origin` رفع شد |
| ۸ | `redis.keys('mm:*')` | ✅ رفع شد — `scanKeys()` با `SCAN` cursor-based + `COUNT 100` (بدون `KEYS` مسدودکننده) |
| ۹ | `trust proxy` | ✅ از قبل موجود — `app.set('trust proxy', 1)` در `server/index.js:44` |
| ۱۰ | `/readyz` همیشه ۵۰۳ | ✅ رفع شد (`ready` promise) |
| ۱۱ | اسکیمای PG ساخته/seed نمی‌شد | ✅ رفع شد |
| ۱۲ | فروشگاه برج (`showMainShop`) | ✅ در فاز ۱ رفع شد |
| ۱۳ | typecheck در build | ✅ `prebuild` اضافه شد |
| ۱۴ | حل‌کننده هرگز به Worker نمی‌رفت | ✅ Worker واقعی + fallback (ریشه: `window` در `debug.ts`) |
| ۱۵ | اقتصاد شرط‌بندی خراب | ✅ رفع شد (فاز ۱/۳) |
| ۱۶ | برد کاذب روی قطعی موقت | ✅ grace + re-check |
| ۱۷ | leak مسیر forfeit | ✅ رفع شد |
| ۱۸ | floorConfig کهنه | ✅ رفع شد |
| ۱۹ | کلمات تکراری | ✅ ۷۳ ورودی تکراری داخل فصل‌ها حذف شد + dedupe در `freeformGenerator` |
| ۲۰ | stale closure در matchmakingHandlerRef | ✅ رفع شد |
| ۲۱ | نشتی تایمر/حافظه | ✅ timerها clear و مجموعه‌ها bound شدند |
| ۲۲ | retry جعلی | ✅ `subscribeWithRetry` با retry واقعی |
| ۲۳ | `pendingNotifications` بی‌مرز | ✅ `pushPendingNotification` با سقف |
| ۲۴ | Redis reconnect | ✅ هرگز رها نمی‌کند |
| ۲۵ | `createEmptyGrid` topology نامعتبر | ✅ `validateFilledGrid` |
| ۲۶ | side effect داخل setState | ✅ رفع شد (ref + effect) |
| ۲۷ | `useHintSystem` mutate state | ✅ رفع شد |
| ۲۸ | RegExp بدون escape | ✅ escape شد |
| ۲۹ | امتیاز بدون اعتبارسنجی | 🟡 جزئی — `/api/match` امتیاز/زمان/سایز را clamp می‌کند (`MAX_SCORE=10000`, time 5..600, size 5..15). سخت‌گیری بیشتر = بازمحاسبه‌ی امتیاز در سرور (همان refactor اقتصاد server-authoritative) → باز |
| ۳۰ | نشت پیام خطا | ✅ رفع شد — ۳۶ نقطه‌ی `res.status(500).json({error: e.message})` با پیام عمومی `'خطای داخلی سرور'` جایگزین شد؛ خطای واقعی همچنان با `logger.error` لاگ می‌شود |
| 🟢 | `any`/state تکراری/localStorage/`ORDER BY RANDOM()`/شکل `getUser` | شکل `getUser` و localStorage رفع؛ `ORDER BY RANDOM()` اندازه‌گیری شد (~۵ms، بی‌مسئله)؛ `any`ها باقی |

**تست‌ها**: `tsc --noEmit` پاک · `npm run build` موفق (worker: `solver.worker-*.js`) · `npm run test:mp` → **۲۱/۲۱** · تست دو-مرورگری UI (create→join→merge→game→forfeit win) موفق.

**باز باقی‌مانده (نیاز به تصمیم کاربر)**: تنها یک مورد — اقتصاد/امتیاز **server-authoritative کامل** (سکه و امتیاز نهایی هنوز کلاینت-محورند؛ clamp سمت سرور از مقادیر غیرمنطقی جلوگیری می‌کند ولی اثبات‌پذیری کامل نیاز به بازمحاسبه‌ی سمت سرور دارد). سایر موارد بسته شدند.
