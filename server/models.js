/**
 * models.js - Supabase Schema Reference
 *
 * دیگه از MongoDB استفاده نمیشه. همه دیتاها توی Supabase ذخیره میشن.
 * جداول مورد نیاز:
 *
 * 1. auth.users (built-in Supabase Auth)
 * 2. profiles (user profiles & game stats)
 * 3. matches (game history)
 * 4. friendships (social graph)
 * 5. notifications (friend requests, challenges)
 * 6. messages (chat)
 * 7. dictionary (words & clues)
 * 8. story_books (epic mode books)
 * 9. story_chapters (epic mode chapters)
 *
 * SQL schema: utils/gameServer.ts → getCompleteSchemaSQL()
 * یا مستقیم از Supabase SQL Editor اجرا کن.
 */

module.exports = {
  note: 'Models are managed via Supabase schema. Run the SQL from getCompleteSchemaSQL() in Supabase dashboard.',
};
