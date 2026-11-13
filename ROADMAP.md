# Crossword Gen Pro - Roadmap & Decisions

> آخرین بروزرسانی: ۶ ژوئن ۲۰۲۶
> وضعیت: تکمیل MVP، رفع باگ هم‌اکنون، آماده‌سازی برای مقیاس در مرحله بعد

---

## ۱. وضعیت فعلی

### ✅ کارهای انجام‌شده

**بازی اصلی:**
- تولید خودکار جدول با AI (Gemini) و الگوریتم داخلی (`glueWords.ts`, `freeformGenerator.ts`)
- ۲۴ کتاب داستانی (۲۱ حماسی + ۱ فولکلور + ۲ آموزش) با ۱۶۳ فصل
- ۹ دسته‌بندی کلمات با ۷۹۳۰ کلمه فارسی واقعی
- حالت Tower با tickets و چالش طبقات
- سیستم امتیاز و سکه

**مالتی‌پلیر:**
- WebSocket اختصاصی (`wsServer.js`) روی localhost:4000
- `LocalChannel` شیم برای backward compatibility با Supabase API
- سیستم اتاق با presence management
- دعوت دوستان با Friend Code
- حالت Speed و Battle

**UI/UX:**
- تم تیره/روشن با CSS injection (نه Tailwind dark:)
- انیمیشن‌های ورودی (_card-enter_, _float_, _glow-pulse_, _shimmer_)
- نقشه تعاملی ایران با ۲۹ مارکر
- پنل اجتماعی، دوستان و چت
- پروفایل کاربر با تنظیمات تم

**زیرساخت:**
- فرانت: Vite 6.4.1 + React 19 + TypeScript
- بک‌اند: Node.js + Express + WebSocket
- دیتابیس: sql.js (SQLite WASM درون‌فرآیند)
- گیت initialized با commit‌های متوالی

### ❌ مشکلات شناخته‌شده

1. **Presence/Sync در مالتی‌پلیر خراب بود (رفع شد):**
   - `LocalChannel.on('presence',...)` callback را اشتباه ذخیره می‌کرد ← فیلتر آبجکت به‌جای تابع
   - `presenceState()` همیشه `{}` برمی‌گردوند
   - **وضعیت:** RFT (رفع شد توی session 11)

2. **WebSocket reconnect بی‌مورد (رفع شد):**
   - `onclose` همیشه auto-reconnect می‌زد ← باعث قطعی و broadcast `player_left` به حریف
   - با capture متغیر `currentWs` حل شد: فقط اگه WS عوض نشده باشه reconnect می‌کنه
   - heartbeat ping هر ۱۵ ثانیه برای زنده نگه‌داشتن connection
   - **وضعیت:** RFT

3. **سرور grace period برای قطعی (اضافه شد):**
   - قبل از broadcast `player_left`، ۵ ثانیه صبر می‌کنه
   - اگه کاربر reconnect کنه توی این مدت، `player_left` کنسل می‌شه
   - **وضعیت:** RFT

4. **بازی آنلاین: دعوت‌شونده می‌پذیرد ولی بازی ساخته نمی‌شود — مشکل باقی‌مانده:**
   - بعد از fixهای بالا، به احتمال زیاد presence کار می‌کنه
   - نیاز به تست end-to-end داره
   - **وضعیت:** نیاز به تست

### 🔴 محدودیت‌های مقیاس (Scalability Bottlenecks)

| رتبه | مشکل | Severity | راه‌حل |
|------|------|----------|--------|
| ۱ | `sql.js` درون‌فرآیند WASM — هیچ concurrenyای ندارد | CRITICAL | `better-sqlite3` (WAL) |
| ۲ | WebSocket state در RAM process — نمی‌شود horizontal scale کرد | CRITICAL | Redis pub/sub |
| ۳ | Grid generation همزمان — event loop را قفل می‌کند | CRITICAL | Worker Thread |
| ۴ | App.tsx ۱۹۶۱ خط — God Component | HIGH | Context + شکستن به ماژول |
| ۵ | Rate limiting وجود ندارد | HIGH | express-rate-limit |
| ۶ | Error handling `catch {}` خالی در همه جا | HIGH | Structured logging |
| ۷ | عدم lazy loading در فرانت | MEDIUM | React.lazy + Suspense |
| ۸ | Full-table scan در API dictionary | MEDIUM | Pagination + ایندکس |

---

## ۲. تصمیمات معماری

### دیتابیس
- **فعلاً:** `better-sqlite3` با WAL mode (جایگزین `sql.js`)
- **بعداً:** PostgreSQL (با لایه repository abstract)
- **دلیل:** `sql.js` اصلاً concurrent نیست، درون WASM اجرا می‌شه و event loop رو قفل می‌کنه
- **هزینه:** رایگان (همون SQLite، فقط native)

### WebSocket / Presence
- **فعلاً:** WS سرور خودمون با sticky sessions
- **بعداً:** + Redis pub/sub برای multi-instance
- **دلیل:** سوپابیس فیلتره، نمی‌تونیم از Supabase Realtime استفاده کنیم
- **هزینه:** رایگان الآن، Redis حدود $3/ماه بعداً

### Auth
- **فعلاً:** deviceId + guest accounts
- **بعداً:** JWT با refresh tokens
- **دلیل:** سادگی در MVP، امنیت در production

### Hosting
- **فعلاً:** Local development (localhost:3000 + localhost:4000)
- **بعداً:** یه VPS ۴-۵ یورویی (Hetzner/Liara/یک هاست ایران)
- **Frontend:** همون VPS با Nginx یا CDN جدا
- **دلیل:** همه‌چیز رو یه جا داریم، ساده و کم‌هزینه

### State Management
- **فعلاً:** بازنویسی به Context API (شکستن App.tsx)
- **بعداً:** زاستاند (Zustand) یا Redux Toolkit اگه پیچیدگی زیاد بشه
- **دلیل:** Context برای مقیاس فعلی کافیه و ساده‌ست

---

## ۳. پلان اجرایی (Phased Plan)

### فاز ۰: تکمیل بازی آنلاین (هم‌اکنون)
- [ ] تست و رفع باگ accept challenge → join room → game start
- [ ] تست end-to-end دو کلاینت هم‌زمان
- [ ] اطمینان از کارکرد presence, start_game, progress, attacks

### فاز ۱: دیتابیس و سرور (Scalability Step 1)
- [ ] جایگزینی `sql.js` با `better-sqlite3`
- [ ] افزودن `express-rate-limit`
- [ ] افزودن Structured Logging (pino یا winston)
- [ ] افزودن Database Indexes
- [ ] لایه Repository برای swap آسان به PostgreSQL
- [ ] Health check endpoints (`/healthz`, `/readyz`)

### فاز ۲: فرانت‌اند (تمیزکاری)
- [ ] شکستن `App.tsx` به Contextهای مجزا (GameContext, MultiplayerContext, PlayerContext)
- [ ] افزودن `React.lazy` + `Suspense` برای Modalها
- [ ] افزودن `React.memo` به کامپوننت‌های سنگین
- [ ] بهبود error handling (جایگزینی `catch {}` با notif کاربر)

### فاز ۳: Grid Generation
- [ ] انتقال به Worker Thread
- [ ] Timeout protection و fallback
- [ ] Caching نتایج (برای gridهای تکراری)

### فاز ۴: WebSocket و Multiplayer
- [ ] Ping/pong استاندارد در سرور
- [ ] Rate limiting پیام‌های WS
- [ ] لایه Abstract برای Pub/Sub (آماده برای Redis)
- [ ] Sticky session support

### فاز ۵: Deployment
- [ ] Dockerize کردن پروژه
- [ ] Nginx reverse proxy
- [ ] PM2 cluster mode یا Docker Swarm
- [ ] CI/CD pipeline

---

## ۴. First Priority Tasks (فاز ۰)

### تست جریان Battle آنلاین

سناریوی تست:
1. کاربر A (هاست) لاگین کنه، بره توی پنل اجتماعی
2. کاربر B (جوینر) لاگین کنه، دوست A باشه
3. A بزنه Challenge به B
4. B نوتیف رو ببینه و Accept بزنه
5. چک کنیم:
   - [ ] presence_sync با ۲ کاربر به هر دو برسه
   - [ ] host شروع به generating grid کنه
   - [ ] start_game broadcast بشه
   - [ ] بازی شروع بشه (grid و clues به joiner برسه)

### خطاهای محتمل بعد از fixها
1. Coin flip flow (اگه فعال باشه)
2. Grid generation timeout (اگه الگوریتم نتوسته جدول بسازه)
3. WebSocket disconnect در حین grid generation

---

## ۵. نکات فنی مهم

### درباره `LocalChannel` شیم
- توی `utils/gameServer.ts` تعریف شده
- API شبیه Supabase Realtime داره ولی با WebSocket ساده کار می‌کنه
- نمی‌تونه scale بشه به چند instance بدون Redis
- برای الآن کافیه، بعداً باید Redis backend بهش اضافه بشه

### درباره Grid Generation
- `freeformGenerator.ts`: الگوریتم اصلی، همزمان و CPU-intensive
- `glueWords.ts`: کلمات static + الگوریتم چسباندن کلمات
- توی `useGameLogic.ts` (حوالی line ۴۰۱-۴۷۲) صدا زده می‌شه
- راه‌حل Worker Thread ساده‌ست: پیام می‌فرسته به worker، worker جواب میده، event loop آزاد

### درباره CSS Theme
- از Tailwind dark: استفاده نمی‌کنیم چون CDN `darkMode:'class'` رو نادیده می‌گرفت
- به جاش از CSS injection استفاده می‌کنیم: `DARK_CSS` string توی `App.tsx` و `ProfileModal.tsx`
- کلاس `dark` روی `<html>` + تزریق `<style id="crossword-dark-styles">`

---

## ۶. تصمیمات قبلی (Session History)

### Session 1 - ساختار اولیه
- پروژه React + TypeScript + Vite
- ۱۸ کامپوننت UI، الگوریتم grid، دیتاهای فارسی/انگلیسی
- Supabase شیم (LocalChannel) برای backward compatibility

### Sessions 2-10 - اضافه شدن محتوا
- ۲۴ کمپین داستانی با ۱۶۳ فصل و ۲۷۵۷+ کلمه اختصاصی
- ۶۰ SVG به سبک مینیاتور ایرانی
- ۱۵۳۰۰ کلمه → حذف شد → ۸۹۷ کلمه دست‌چین جایگزین
- نقشه تعاملی ایران

### Session 11 - رفع باگ Presence
- `LocalChannel.on('presence',...)` callback درست شد
- `presenceState()` واقعی شد (قبلاً همیشه `{}` بود)
- grace period ۵ ثانیه برای قطعی WebSocket در سرور
- heartbeat ping برای زنده نگه‌داشتن connection
- جلوگیری از auto-reconnect بی‌مورد (با capture currentWs)

### Session 12 - تصمیمات معماری
- ارزیابی Scalability: کد فعلی تا ۲۰ یوزر هم‌زمان رو جواب میده
- پلان ۵ فازه برای رسیدن به ۵۰۰۰+ یوزر
- Supabase فیلتره، پس از Redis + PostgreSQL self-hosted استفاده می‌کنیم
- اولویت: تکمیل بازی آنلاین بعد تمیزکاری و مقیاس

---

> **اصل راهنما:** هر تغییری که الآن می‌دیم باید backward compatible باشه و راه رو برای آینده باز بذاره. کد رو طوری می‌نویسیم که فردا با عوض کردن یه کانفیگ بره روی PostgreSQL و Redis.
