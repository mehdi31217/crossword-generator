# Comprehensive Issues Audit — Crossword Gen Pro

> جمع‌آوری تمام مشکلات برنامه. تاریخ: ۲۰۲۶-۰۶-۱۹
> **هشدار:** این سند فقط برای مرور است - هیچ کدی تغییر داده نشده.

---

## فهرست مشکلات (۲۶ مورد)

| # | دسته | شدت | مشکل | فایل‌های مرتبط |
|---|------|------|------|----------------|
| 1 | 🎮 **صفحه برد کاذب** | 🔴 بحرانی | Victory screen حتی در بار اول بازی هم نمایش داده می‌شود | `useMultiplayerState.ts`, `useCoinFlip.ts`, `useGameLogic.ts` |
| 2 | 🔄 **بازگشت به منو** | 🔴 بحرانی | `returnToMenu` در مسیر forfeit زود برمی‌گردد و cleanup نمی‌کند | `useNavigation.ts:96-100` |
| 3 | 🔄 **race condition بازگشت به منو** | 🔴 بحرانی | همزمانی `returnToMenu` و `handleGameOverEvent` کاربر را قفل می‌کند | `useNavigation.ts`, `useMultiplayerState.ts` |
| 4 | 🎯 **چالش کاذب** | 🔴 بحرانی | `finalResult` بدون بررسی از چند مسیر همزمان overwrite می‌شود | `useMultiplayerState.ts:237-244` |
| 5 | 📡 **Broadcast cross-instance** | 🔴 بحرانی | `_redisBroadcast` باعث می‌شود WebSocket بین سرورها کار نکند | `server/wsServer.js:36-55,124-141` |
| 6 | 🎲 **تولید مجدد جدول بدون merge** | 🔴 بحرانی | Retry بعد از شکست grid، merged category/size را نادیده می‌گیرد | `useMatchmakingActions.ts:193-204` |
| 7 | 📖 **currentChapterIndex=1 ثابت** | 🔴 بحرانی | فصل‌های داستانی بعد از ۱ محتوای victoryText را نمی‌بینند | `components/GameViews.tsx:525,536,548` |
| 8 | 👤 **حضور کاذب (False Presence Leave)** | 🔴 بحرانی | presence:leave از auto-reconnect WebSocket باعث برد کاذب می‌شود | `utils/multiplayer.ts:76-78,167-169`, `useMultiplayerState.ts:326,444,562` |
| 9 | 🔁 **ناهماهنگی کانال دوگانه WS** | 🔴 بحرانی | دو کانال WS مستقل (global_social + room_XXXXX) رویدادها را تکراری تحویل می‌دهند | `useChallengeSystem.ts`, `useMultiplayerState.ts`, `utils/multiplayer.ts` |
| 10 | 💰 **ضریب coin اشتباه** | 🔴 بحرانی | `battleWager` می‌تواند چندبار Refund شود و سکه بازیکن را باد کند | `App.tsx:189-193`, `useNavigation.ts:104-106` |
| 11 | ⏱️ **Timeout ناهماهنگ** | ⚠️ مهم | Grace timerهای 20s و 30s و 180s برای leave/join ناهماهنگ هستند | `useMultiplayerState.ts:358,483,518,594` |
| 12 | 🎪 **MergeLobby قفل شدن** | ⚠️ مهم | MergeLobby روی مرحله ۴ (Generating) اگر grid fail شود قفل می‌ماند | `components/MergeLobby.tsx:305`, `useCoinFlip.ts:264-268` |
| 13 | 📨 **اعلان چالش تکراری** | ⚠️ مهم | Polling 2s + 5s برای notification می‌توانند اعلان تکراری ایجاد کنند | `useChallengeSystem.ts:203-223` |
| 14 | 🔐 **چالش دوطرفه همزمان** | ⚠️ مهم | اگر دو نفر همزمان به هم challenge بدهند، دو بازی مجزا ساخته می‌شود | `useChallengeSystem.ts:52-85` |
| 15 | 🎲 **بدون Timeout برای joiner در CoinFlip** | ⚠️ مهم | Joiner هیچ Timeout داخلی برای دریافت coin_flip_result ندارد | `useCoinFlip.ts:95-127` |
| 16 | ♻️ **Stale Closure در matchmakingHandlerRef** | ⚠️ مهم | `matchmakingHandlerRef` متغیرهای stale را در اختیار می‌گیرد | `useMatchmakingActions.ts:56-83` |
| 17 | 🔍 **Matchmaking Polling بی‌صدا می‌میرد** | ⚠️ مهم | Polling 'unknown' را دریافت می‌کند و بدون تغییر state متوقف می‌شود | `E2E_AUDIT.md:248-268`, `useMatchmakingActions.ts:105-110` |
| 18 | 📡 **Matchmaking WS notification بدون Retry** | ⚠️ مهم | `sendToUser()` برای میزبان یک بار فرستاده می‌شود و Retry ندارد | `server/index.js:893` |
| 19 | 🗄️ **redis.keys() مسدودکننده** | ⚠️ مهم | `KEYS` در Redis event loop را مسدود می‌کند - باید `SCAN` شود | `server/redis.js:209-219` |
| 20 | 🗄️ **Race در matchmaking Redis** | ⚠️ مهم | ZADD + ZRANGEBYSCORE اتمیک نیست - دو کاربر می‌توانند همزمان اضافه شوند | `server/redis.js:146-183` |
| 21 | 🏰 **cashOut در Tower Mode** | ⚠️ مهم | `cashOut()` مقدار `runState.loot` کهنه را برمی‌گرداند | `hooks/useTowerModeV2.ts:272-279` |
| 22 | 🏰 **completeFloor با floorConfig کهنه** | ⚠️ مهم | `completeFloor()` از `currentFloorConfig` کهنه استفاده می‌کند | `hooks/useTowerModeV2.ts:208-248` |
| 23 | 🤖 **MonsterRage side effect** | ⚠️ مهم | `setMonsterRage` updater دارای عارضه جانبی (`shouldAttack`) است | `hooks/useGameLogic.ts:110-118` |
| 24 | 📝 **غیرفعال نبودن دکمه START** | 🟡 کم | Controls.tsx دکمه را UI Lock می‌کند ولی validation کد ندارد | `Controls.tsx:262-277` |
| 25 | 💾 **dailyTowerCoins همگام‌سازی** | 🟡 کم | `dailyTowerCoins` به سرور sync نمی‌شود | `gameServer.ts:170,551-570` |
| 26 | 🔄 **leaveRoom تأخیر ۱ ثانیه‌ای** | 🟡 کم | `leaveRoom` یک ثانیه منتظر می‌ماند که UX را کند می‌کند | `useMultiplayerState.ts:665-672` |

---

## جزئیات مشکلات

### ۱. 🟠 صفحه برد کاذب (False Victory Screen) — بحرانی

**علائم:** حتی در اولین بار شروع بازی، صفحه برد (Victory Screen) نمایش داده می‌شود. کاربر چندین بار این را گزارش کرده.

**علل ریشه‌ای (۴ مسیر مختلف):**

**مسیر A — Presence Leave از Auto-Reconnect WebSocket:**
- وقتی WebSocket یک بازیکن auto-reconnect می‌کند، Supabase presence:leave می‌فرستد
- هر سه `onPlayerLeft` هندلر (`useMultiplayerState.ts:326, 444, 562`) بدون بررسی حقیقی بودن leave، برد را اعلام می‌کنند
- Fix قبلی (grace timer 5s) اضافه شده اما فقط تأخیر می‌اندازد، مشکل را ریشه‌ای حل نمی‌کند

**مسیر B — gameWon=true برای هر دو بازیکن:**
- `useCoinFlip.ts:179-184`: `onGameFinishedRef` به `setGameWon(true)` برای **برنده و بازنده** اشاره می‌کند
- فقط `finalResult.status` تشخیص می‌دهد که چه کسی برنده است
- اگر `finalResult` به هر دلیلی reset شود، هر دو بازیکن صفحه برد می‌بینند

**مسیر C — رویداد game_over به فرستنده هم برمی‌گردد:**
- `server/wsServer.js:394-402`: `broadcastToChannel` فرستنده را حذف نمی‌کند
- برنده broadcast `game_over` می‌فرستد و خودش هم آن را دریافت می‌کند
- فیلتر `senderId` باید جلوی پردازش مضاعف را بگیرد ولی execution order را غیرقابل پیش‌بینی می‌کند

**مسیر D — no cleanup روی onGameFinishedRef:**
- `useCoinFlip.ts:179-184`: اثر (effect) تابع پاک‌کننده ندارد
- اگر کامپوننت unmount شود و broadcast `game_over` برسد، `setGameWon(true)` روی state کانال‌شده اجرا می‌شود

**فایل‌ها:**
- `hooks/useCoinFlip.ts:162-176,179-184`
- `hooks/useMultiplayerState.ts:326, 444, 562`
- `utils/multiplayer.ts:76-78, 167-169`
- `server/wsServer.js:394-402`

---

### ۲. 🟠 بازگشت به منو در مسیر Forfeit — بحرانی

**فایل:** `hooks/useNavigation.ts:96-100`

```typescript
if (view === 'playing' && game.grid && !game.gameWon && !game.gameLost && !waitingForHost) {
    await multiplayerState.forfeitGame();
    return;  // ← بدون هیچ cleanup!
}
```

بعد از `forfeitGame()`، تابع `return` می‌کند بدون اینکه:
- View را به `'menu'` تغییر دهد
- `game.resetGame()` را صدا بزند
- `currentGameMode` را به `'casual'` برگرداند
- Category/Size merged را پاک کند
- `hasGeneratedForOpponentRef` را ریست کند

**اتکا به second call:** کد متکی است که کاربر از صفحه defeat روی "Menu" کلیک کند تا یک `returnToMenu` دوم فراخوانی شود. اگر صفحه defeat به دلیل مشکل `finalResult` رندر نشود، کاربر روی view 'playing' گیر می‌افتد.

---

### ۳. 🟠 Race Condition: returnToMenu و handleGameOverEvent — بحرانی

**فایل‌ها:** `hooks/useNavigation.ts:96-99`, `hooks/useMultiplayerState.ts:203-244`

سناریوی race:
1. `handleGameOverEvent` → `gameOverRef.current = true` + `setGameWon(true)` (صف بندی شده)
2. کاربر روی "Menu" کلیک می‌کند
3. `returnToMenu` بررسی می‌کند: `view === 'playing'` ✓, `game.grid` ✓, `!game.gameWon` ← بستگی به زمان بندی React دارد
4. اگر `gameWon` هنوز آپدیت نشده باشد، `returnToMenu` وارد مسیر forfeit می‌شود
5. `forfeitGame()` → `if (gameOverRef.current) return;` (مسدود شد)
6. `returnToMenu` هم با `return` خالی برمی‌گردد
7. کاربر جایی نمی‌رود

---

### ۴. 🟠 finalResult از چند مسیر همزمان Overwrite — بحرانی

**فایل:** `hooks/useMultiplayerState.ts:237-244`

`finalResult` در ۴ جا set می‌شود:
- `handleGameOverEvent` (خط ۲۳۷) — **بدون** `if (prev.status !== null)`
- `onPlayerLeft` grace timer در createRoom (خط ۳۴۸)
- `onPlayerLeft` grace timer در joinRoom (خط ۶۱۳)
- `forfeitGame` (خط ۶۵۰) — بدون بررسی

`handleGameOverEvent` و `forfeitGame` مقدار finalResult را بدون بررسی اینکه آیا قبلاً set شده، عوض می‌کنند. اگر `game_over` بعد از grace timer برسد، نتیجه درست را overwrite می‌کند.

---

### ۵. 🟠 Broadcast Cross-Instance — بحرانی

**فایل:** `server/wsServer.js:36-55, 124-141`

پرچم `_redisBroadcast: true` برای جلوگیری از پخش مضاعف روی همان instance اضافه شده ولی:
- چون در Redis persistence دارد، **همه instanceها** این پرچم را می‌بینند
- نتیجه: broadcastهای بین سروری هرگز به instanceهای دیگر نمی‌رسند
- Horizontal scaling عملاً غیرفعال است

**تحت تأثیر:** `game_over`، `progress`، `word_solved`، `attack` و همه broadcastهای دیگر

---

### ۶. 🟠 Retry Grid بدون Merge Context — بحرانی

**فایل:** `hooks/useMatchmakingActions.ts:193-204`

```typescript
const handleMultiplayerRetry = async () => {
    actions.setShowMultiplayerRetryModal(false);
    const res = await game.generateGrid(false);  // ← mergedCategories ارسال نمی‌شود
    // ...
};
```

بعد از شکست grid در بازی چندنفره، retry `game.generateGrid(false)` را با **category/size اصلی میزبان** صدا می‌زند، نه category/size توافق شده در coin flip. طرف مقابل grid اشتباه دریافت می‌کند.

---

### ۷. 🟠 currentChapterIndex = 1 ثابت — بحرانی

**فایل:** `components/GameViews.tsx:525, 536, 548`

سه کامپوننت `currentChapterIndex={1}` سخت‌کد شده دریافت می‌کنند:
- `GameViewComponent`
- `StoryLoseScreen`
- `GameResultScreen`

مقدار `currentChapterIndex` در Runtime از `game.currentChapterIndex` در `App.tsx` در دسترس است ولی در اینترفیس `GameViewsProps.Game` تعریف نشده. `GameResultScreen` از این مقدار در خط ۱۹۱ برای `victoryText` استفاده می‌کند — برای فصل‌های غیر از ۱، `find()` برنمی‌گردد و متنی نشان داده نمی‌شود.

---

### ۸. 🟠 حضور کاذب (Presence:leave از WebSocket Reconnect) — بحرانی

**فایل‌ها:**
- `utils/multiplayer.ts:76-78, 167-169`: هندلر `presence.leave` بدون بررسی حقیقی بودن leave صدا زده می‌شود
- `hooks/useMultiplayerState.ts:326, 444, 562`: سه `onPlayerLeft` بلافاصله forfeit صدا می‌زنند

وقتی WebSocket یک کلاینت reconnect می‌کند (حتی در همان ثانیه)، Supabase:
1. Presence `leave` را broadcast می‌کند
2. Presence `join` را broadcast می‌کند

اگر `leave` بین reconnect و `join` بیفتد، `onPlayerLeft` فعال می‌شود. Fix قبلی (grace timer 5s) کمک می‌کند ولی:
- صد در صد مشکل را حل نمی‌کند (اگر leave و join در بازه ۵ ثانیه نباشند)
- فقط تأخیر می‌اندازد
- کاربر همچنان گزارش کرده که بار اول هم این مشکل هست

---

### ۹. 🟠 دو کانال WS مستقل — بحرانی

**فایل‌ها:**
- `hooks/useChallengeSystem.ts` — کانال global_social
- `hooks/useMultiplayerState.ts` + `utils/multiplayer.ts` — کانال room_XXXXX (Supabase)

رویدادهای تکراری:
- `challenge:accepted` هم از WS #1 (از طریق `sendToUser`) و هم از WS #2 (از طریق `player_joined`) می‌رسد
- `game_over` هم به فرستنده برمی‌گردد (WS #2 هیچ ws exclusion ندارد)
- Fabric: `player_joined` از WS #2 با ۳ retry فرستاده می‌شود و `challenge:accepted` از WS #1 با ۵ retry — ترتیب arrival غیرقابل پیش‌بینی

---

### ۱۰. 🟠 Refund چندباره battleWager — بحرانی

**فایل‌ها:** `App.tsx:189-193`, `hooks/useNavigation.ts:104-106`

سناریو:
1. کاربر matchmaking می‌کند — ۱۰۰ coin کسر می‌شود
2. matchmaking پیدا می‌شود (`handleQuickMatch`)
3. `createRoomWithId` خطا می‌دهد → `returnToMenu` اجرا می‌شود
4. `returnToMenu` چک می‌کند `!multiplayerState.finalResult.status` → `true` (بازی شروع نشده)
5. Refund اعمال می‌شود
6. (در useEffect خطا) `returnToMenu` دوباره صدا زده می‌شود
7. Refund دوباره اعمال می‌شود

اگر `returnToMenu` چندبار در طول matchmaking فراخوانی شود، coins چندبار برمی‌گردد.

---

### ۱۱. 🟡 Timeout ناهماهنگ — مهم

Grace timerهای `onPlayerLeft`:
- `createRoom`: **۲۰ ثانیه** برای pre-game (خط ۳۵۸)
- `createRoomWithId`: **۲۰ ثانیه** برای pre-game (خط ۴۸۳)
- `joinRoom`: **۳۰ ثانیه** برای pre-game (خط ۵۹۴)
- `joinRoom`: global join timeout **۱۸۰ ثانیه** (خط ۵۱۸)

ناهماهنگی ۲۰/۳۰/۱۸۰ ثانیه‌ای باعث می‌شود تجربه کاربری host و joiner متفاوت باشد. مستند نیست.

---

### ۱۲. 🟡 MergeLobby قفل شدن — مهم

**فایل‌ها:** `components/MergeLobby.tsx:305`, `hooks/useCoinFlip.ts:264-268`

وقتی grid generation روی سرور host fail می‌شود و `showMultiplayerRetryModal` نمایش داده می‌شود:
- Host MergeLobby را ترک می‌کند
- Joiner در مرحله "Generating" (گام ۴) قفل می‌ماند
- Joiner تا وقتی Stuck Message ظاهر نشود (بعد از ۳۰-۶۰ ثانیه) متوجه نمی‌شود
- حتی بعد از آن، راهکار فقط `window.location.reload()` است

علاوه بر این، catch block در `useCoinFlip.ts:264-268` مقدار `mounted` را بررسی نمی‌کند — اگر کامپوننت unmount شود، باز `hasGeneratedForOpponentRef` را ریست می‌کند و modal را نشان می‌دهد.

---

### ۱۳. 🟡 اعلان چالش تکراری — مهم

**فایل:** `hooks/useChallengeSystem.ts:203-223`

دو polling مستقل:
- `useChallengeSystem`: هر **۲ ثانیه** notificationها را poll می‌کند (خط ۲۰۴)
- `useSocial`: هر **۵ ثانیه** `loadNotifications()` را صدا می‌زند (خط ۲۵۸)

هر دو می‌توانند یک notification را دریافت کنند. `processedChallenges` ref از پردازش تکراری جلوگیری می‌کند ولی `setNotifications` از `useSocial` خبر ندارد.

همچنین auto-dismiss timeoutها متفاوت هستند:
- از WS: **۱۲۰ ثانیه** (خط ۱۷۵)
- از Poll: **۲۰ ثانیه** (خط ۲۱۴)

---

### ۱۴. 🟡 چالش دوطرفه همزمان — مهم

**فایل:** `hooks/useChallengeSystem.ts:52-85`

اگر دو نفر همزمان به هم challenge کنند:
1. هر دو `sendChallenge` صدا می‌زنند
2. هر دو `createRoom` صدا می‌زنند (دو اتاق مجزا)
3. هر دو notification یکدیگر را دریافت می‌کنند
4. هر دو قبول می‌کنند → دو بازی مجزا شروع می‌شود

بدون تشخیص mutual challenge، این سناریو اتاق‌های بی‌استفاده ایجاد می‌کند.

---

### ۱۵. 🟡 بدون Timeout برای Joiner در CoinFlip — مهم

**فایل:** `hooks/useCoinFlip.ts:95-127`

Host یک fallback 45 ثانیه‌ای برای دریافت preference حریف دارد. Joiner **هیچ** timeout ای برای دریافت `coin_flip_result` از host ندارد. تنها پشتیبان `joinTimeout` 180 ثانیه‌ای در `joinRoom` است که خیلی طولانی است.

MergeLobby بعد از 30-60 ثانیه یک "stuck message" نشان می‌دهد ولی گزینه عملی فقط `window.location.reload()` است.

---

### ۱۶. 🟡 Stale Closure در matchmakingHandlerRef — مهم

**فایل:** `hooks/useMatchmakingActions.ts:56-83`

```typescript
useEffect(() => {
    if (hasSetupHandlerRef.current) return;
    hasSetupHandlerRef.current = true;
    refState.matchmakingHandlerRef.current = (rawMsg: any) => {
        // از showToast، returnToMenu، language در closure استفاده می‌کند
    };
}, []); // ← خالی
```

- `matchmakingHandlerRef` یک بار set می‌شود و **هیچ وقت پاک نمی‌شود**
- اگر کاربر از matchmaking خارج و دوباره وارد شود، هندلر قبلی باقی می‌ماند
- مقادیر `showToast` و `returnToMenu` و `language` در closure قدیمی باقی می‌مانند

---

### ۱۷. 🟡 Polling Matchmaking بی‌صدا — مهم

**فایل:** `hooks/useMatchmakingActions.ts:105-110` (موارد ۲۷ در E2E_AUDIT)

وقتی polling `'unknown'` دریافت می‌کند:
- Polling متوقف می‌شود (clearInterval)
- ولی `setIsMatchmaking(false)` یا `setMatchmakingStatus('idle')` فراخوانی نمی‌شود
- UI روی "در انتظار..." گیر می‌افتد

---

### ۱۸. 🟡 Matchmaking WS Notification بدون Retry — مهم

**فایل:** `server/index.js:893` (مورد FIX 1 در E2E_AUDIT)

بعد از اینکه `redis.matchmakingAdd` match پیدا کرد، `sendToUser(opponent.playerId, ...)` **یک بار** فرستاده می‌شود:
- اگر host به طور موقت قطع باشد، notification از دست می‌رود
- Host به polling ادامه می‌دهد → `'unknown'` دریافت می‌کند → بی‌صدا منصرف می‌شود
- Joiner `'matched'` دریافت کرده و منتظر host می‌ماند → تا ابد

---

### ۱۹. 🟡 redis.keys() مسدودکننده — مهم

**فایل:** `server/redis.js:209-219`

سه تابع از `KEYS` (O(N)) استفاده می‌کنند:
- `matchmakingRemove` (خط ۲۰۹)
- `matchmakingStatus` (خط ۲۳۱)
- `matchmakingCleanup` (خط ۲۶۵)

با صف matchmaking بزرگ، این دستورات Redis event loop را مسدود می‌کنند و تاخیر ایجاد می‌کنند. باید با `SCAN` جایگزین شوند.

---

### ۲۰. 🟡 Race در Redis Matchmaking — مهم

**فایل:** `server/redis.js:146-183` (مورد FIX 2 در E2E_AUDIT)

```javascript
// ZADD
// ZRANGEBYSCORE
// این دو دستور اتمیک نیستند — TOCTOU race
```

دو درخواست همزمان از instanceهای مختلف:
1. هر دو ZADD را انجام می‌دهند
2. هر دو zcard=1 می‌بینند
3. هر دو تصور می‌کنند حریف ندارند و به صف اضافه می‌شوند
4. هیچکدام match نمی‌شوند

راه‌حل: استفاده از Lua scripting (EVAL)

---

### ۲۱. 🟡 cashOut مقدار کهنه برمی‌گرداند — مهم

**فایل:** `hooks/useTowerModeV2.ts:272-279`

```typescript
const cashOut = useCallback(() => {
    setRunState(prev => ({ ...prev, isActive: false }));
    setShowShop(false);
    return runState.loot;  // ← از closure، قبل از setRunState
}, [runState.loot]);
```

`runState.loot` مقداری است که در زمان ایجاد callback گرفته شده، نه مقدار فعلی state. همان مشکل در `gameOver` و `timeOver`.

---

### ۲۲. 🟡 completeFloor با floorConfig کهنه — مهم

**فایل:** `hooks/useTowerModeV2.ts:208-248`

`completeFloor` از `currentFloorConfig` در closure استفاده می‌کند. وقتی `advanceToNextFloor` فراخوانی می‌شود، `currentFloorConfig` برای طبقه بعد عوض می‌شود. اگر `completeFloor` callback قدیمی در لحظه‌ای که floorConfig جدید است صدا زده شود، پاداش طبقه با config اشتباه محاسبه می‌شود.

---

### ۲۳. 🟡 MonsterRage Side Effect در setState — مهم

**فایل:** `hooks/useGameLogic.ts:110-118`

```typescript
setMonsterRage(prev => {
    if (prev >= 100) {
        shouldAttack = true;  // ← side effect داخل updater!
        return 0;
    }
    return prev + incrementPerTick;
});
if (shouldAttack) handleMonsterAttack();
```

`shouldAttack` داخل `setMonsterRage` updater set می‌شود. React این را به عنوان anti-pattern مستند کرده. با Concurrent Mode React می‌تواند updater را چندبار صدا بزند و `shouldAttack` را چندبار true کند.

---

### ۲۴. 🟢 غیرفعال نبودن دکمه START — کم

**فایل:** `Controls.tsx:262-277`

دکمه QUICK START در UI برای size/category قفل‌شده grey می‌شود ولی validation کدنویسی‌شده‌ای ندارد. اگر کسی `onGenerate` را با size/category نامعتبر programmatically صدا بزند، `generateGrid` تلاش می‌کند.

---

### ۲۵. 🟢 dailyTowerCoins Sync نشدن — کم

**فایل:** `gameServer.ts:170, 551-570`

- خط ۱۷۰: `dailyTowerCoins: profile.daily_tower_coins ?? 0` — از سرور خوانده می‌شود
- خطوط ۵۵۱-۵۷۰: `updateTowerStats` فقط `coins_earned` می‌فرستد
- `dailyTowerCoins` هرگز به سرور sync نمی‌شود
- localStorage value حفظ می‌شود ولی در device دیگر یا پاک شدن localStorage ریست می‌شود

---

### ۲۶. 🟢 تأخیر ۱ ثانیه‌ای leaveRoom — کم

**فایل:** `hooks/useMultiplayerState.ts:665-672`

```typescript
if (currentPlayer && !gameOverRef.current) {
    await new Promise(r => setTimeout(r, 1000));  // ← 1s delay
    if (!gameOverRef.current) {
        await multiplayer.broadcastLeave(currentPlayer.id);
    }
}
```

تأخیر ۱ ثانیه‌ای برای این است که `handleGameOverEvent` اول `gameOverRef.current = true` را set کند. ولی:
- در صفحه نتیجه (result screen)، کلیک "Menu" باعث می‌شود کاربر ۱ ثانیه صبر کند
- اگر بازی در این ۱ ثانیه تمام شود، broadcast لغو می‌شود

---

## خلاصه مشکلات تروفی (تأیید شده)

بر اساس `TROPHY_RULES.md` و کد فعلی:

1. **حالت matchmaking** (`matchType='matchmaking'`) ← تروفی کم/زیاد می‌شود ✓
2. **دعوت دوستان** (`matchType='direct'`) ← تروفی تغییر نمی‌کند ✓
3. **بازی کژوال** ← تروفی اضافه می‌شود ✓ (از طریق `saveMatch`)
4. **حالت داستانی** ← تروفی اضافه می‌شود ✓ (از طریق `saveMatch`)

تغییرات اعمال‌شده (قبلاً commit شده):
- `matchType` فیلد و `setMatchType` به `useMultiplayerState.ts` اضافه شد
- `useGameResultEffects.ts` فقط برای `matchType === 'matchmaking'` تروفی اعمال می‌کند
- `useWinHandler.ts` `skipTrophies: true` را برای multiplayer به `saveMatch` می‌فرستد
- `gameServer.ts` پارامتر `skipTrophies` را به `saveMatch` اضافه کرد
- `useChallengeSystem.ts` قبل از `joinRoom`، `setMatchType('direct')` صدا می‌زند
- `useMatchmakingActions.ts` قبل از `joinRoom`، `setMatchType('matchmaking')` صدا می‌زند

**نتیجه:** قوانین تروفی به درستی پیاده‌سازی شده است. دو نقطه ضعف احتمالی:
- اگر `setMatchType` قبل از `joinRoom` fail شود (exception)، `matchType` سِت نمی‌شود
- اگر بازیکن مستقیم به اتاق دعوت شود (room code) ولی `setMatchType` صدا زده نشود، مقدار `matchType=null` می‌ماند و تروفی اعمال نمی‌شود ✓ (ایمن)

---

## خلاصه Fixهای قبلی (قبلاً commit شده)

این fixها قبلاً commit شده‌اند و بخشی از کد فعلی هستند:

| Fix | فایل | شرح |
|-----|------|------|
| Presence:leave grace timer | `useMultiplayerState.ts` | 5s grace timer در هر سه `onPlayerLeft` |
| Logging | `utils/multiplayer.ts` | `debug.log('MP', ...)` به `presence.leave` اضافه شد |
| matchType system | `useMultiplayerState.ts` | `matchType` state + `setMatchType`, `resetState` ریست `gameOverRef` |
| Challenge dialog defaults | `useChallengeSystem.ts` | استفاده از guest's unlocked size/category |
| Trophy guard با matchType | `useGameResultEffects.ts` | فقط matchmaking روی تروفی تأثیر دارد |
| skipTrophies در saveMatch | `gameServer.ts`, `useWinHandler.ts` | `skipTrophies: true` برای multiplayer |
| TROPHY_RULES.md | جدید | مستندات قوانین تروفی |

---

## مشکلات تاییدشده قبلی از CLAUDE.md

| # | مشکل | وضعیت |
|---|------|--------|
| 1 | Presence/Sync خراب | ✅ رفع شد (Session 11) |
| 2 | WebSocket reconnect بی‌مورد | ✅ رفع شد (Session 11) |
| 3 | سرور grace period | ✅ اضافه شد (Session 11) |
| 4 | دعوت‌شونده می‌پذیرد ولی بازی ساخته نمی‌شود | ⚠️ نیاز به تست E2E |
| 5 | useSocial.ts WS مستقل -> race condition | ⚠️ هنوز باز |
| 6 | Coin flip timing race بین host و joiner | ⚠️ هنوز باز |
| 7 | Room/channel lifecycle | ⚠️ هنوز باز |

---

## جمع‌بندی

**تعداد کل مشکلات: ۳۳** (۲۶ مشکل جدید + ۷ مشکل قبلی)

**اولویت‌های تعمیر بر اساس شدت و تأثیر:**

1. **صفحه برد کاذب** (مشکل ۱) — آزاردهنده‌ترین مشکل برای کاربر، نیاز به رفع ریشه‌ای
2. **returnToMenu در forfeit** (مشکل ۲) — کاربر را قفل می‌کند
3. **Race returnToMenu و handleGameOverEvent** (مشکل ۳) — کاربر را قفل می‌کند
4. **اخطار چالش دوگانه** (مشکل ۹) — ساختار دو کانال WS مشکل‌ساز است
5. **چالش کاذب از چند مسیر** (مشکل ۴) — result screen اشتباه
6. **Grid retry بدون merged category** (مشکل ۶) — جدول اشتباه در retry
7. **currentChapterIndex=1** (مشکل ۷) — محتوای داستانی خراب
8. و بقیه به ترتیب اولویت...

> **نکته:** این سند فقط برای جمع‌آوری و مرور است. هیچ کدی تغییر داده نشده. لطفاً بررسی کنید و بگویید از کدام مشکلات شروع کنیم.
