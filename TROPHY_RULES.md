# قوانین تروفی (Trophy Rules)

## خلاصه

**فقط بازی‌های "شروع مسابقه" (Quick Match / Matchmaking) روی تعداد تروفی‌ها تأثیر می‌گذارند.**  
بازی‌های دوستانه (دعوت مستقیم، کد اتاق) هیچ تأثیری روی تروفی‌ها ندارند.

---

## جزئیات

### ✅ بازی‌هایی که تروفی کم/زیاد می‌شود
- **شروع مسابقه** (دکمه Start Match / Quick Match)
- کاربر با یک نفر کاملاً تصادفی (ناشناس) هم‌بازی می‌شود
- سیستم matchmaking از طریق `createRoomWithId` (اتاق توسط سرور ساخته می‌شود)
- `matchType = 'matchmaking'`

### ❌ بازی‌هایی که تروفی تغییر نمی‌کند
- **دعوت دوستان** (از پنل اجتماعی → دعوت به بازی)
- **کد اتاق** (اشتراک‌گذاری کد اتاق با دوستان)
- **بازی‌های کژوال ساخته شده توسط خود کاربر**
- تمام بازی‌هایی که `matchType = 'direct'` دارند (دعوت مستقیم یا کد اتاق)

---

## نحوه پیاده‌سازی (فنی)

1. **`useMultiplayerState.ts`**:
   - متغیر `matchType` از نوع `'matchmaking' | 'direct' | null`
   - `createRoom` → `matchType = 'direct'` (دعوت دوستان)
   - `createRoomWithId` → `matchType = 'matchmaking'` (شروع مسابقه)
   - `resetState` → `matchType = null`
   - `setMatchType` به صورت عمومی در دسترس است

2. **`useMatchmakingActions.ts`**:
   - قبل از `joinRoom` برای جوینر مسابقه → `setMatchType('matchmaking')`

3. **`useChallengeSystem.ts`**:
   - قبل از `joinRoom` برای جوینر دعوت → `setMatchType('direct')`

4. **`useGameResultEffects.ts`**:
   - فقط وقتی `matchType === 'matchmaking'` تروفی اعمال می‌شود
   - بازی‌های مستقیم (`direct`) هیچ تغییری در تروفی ایجاد نمی‌کنند

5. **`useWinHandler.ts` + `gameServer.saveMatch`**:
   - در حالت `multiplayer`، `saveMatch` با پارامتر `skipTrophies: true` صدا زده می‌شود
   - تروفی فقط از طریق `applyMultiplayerResult` در `useGameResultEffects` اعمال می‌شود

---

## تست

- بازیکن A دوست خود B را دعوت کند → بازی انجام شود → تروفی هیچکدام تغییر نکند
- بازیکن A دکمه "شروع مسابقه" را بزند → با یک نفر تصادفی هم‌بازی شود → تروفی برنده زیاد و بازنده کم شود
