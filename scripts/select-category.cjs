#!/usr/bin/env node
// Category list for crossword-gen-pro optimization
// Usage:  node scripts/select-category.cjs
// Then tell me the number of your chosen category in the chat.

const CATEGORIES = [
  { num: 1,  id: 'MOVIES_FA',     name: 'فیلم',        glue: 'MOVIES_GLUE_FA' },
  { num: 2,  id: 'CITIES_FA',     name: 'شهرها',       glue: 'CITIES_GLUE_FA' },
  { num: 3,  id: 'NATURE_FA',     name: 'طبیعت',       glue: 'NATURE_GLUE_FA' },
  { num: 4,  id: 'KNOWLEDGE_FA',  name: 'دانستنی‌ها',  glue: 'KNOWLEDGE_GLUE_FA' },
  { num: 5,  id: 'BODY_FA',       name: 'بدن',          glue: 'BODY_GLUE_FA' },
  { num: 6,  id: 'TECH_FA',       name: 'تکنولوژی',     glue: 'TECH_GLUE_FA' },
  { num: 7,  id: 'JOBS_FA',       name: 'شغل‌ها',       glue: 'JOBS_GLUE_FA' },
  { num: 8,  id: 'HISTORY_FA',    name: 'تاریخ',        glue: 'HISTORY_GLUE_FA' },
  { num: 9,  id: 'SPORTS_FA',     name: 'ورزش',         glue: 'SPORTS_GLUE_FA' },
  { num: 10, id: 'ART_FA',        name: 'هنر',          glue: 'ART_GLUE_FA' },
  { num: 11, id: 'SHAHNAMEH_FA',  name: 'شاهنامه',      glue: 'SHAHNAMEH_GLUE_FA' },
];

console.log('');
console.log('📋  لیست دسته‌های قابل بهینه‌سازی:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
CATEGORIES.forEach((cat) => {
  console.log(`  ${cat.num}. ${cat.name} (${cat.id})`);
});
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  🎯  نوع کار: +50 کلمه اصلی + 10 کلمه glue`);
console.log(`  📏  تست: Best-of-N برای سایزهای ۵×۵ تا ۱۰×۱۰`);
console.log(`  ✅  هدف: حداقل ۷۰-۸۰٪ خلوص`);
console.log('');
