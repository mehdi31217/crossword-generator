#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DICT = path.join(__dirname, '..', 'server', 'local-data', 'dictionary.json');
const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
const existingAll = new Set(dict.map(e => e.word));

// Generate compounds: word + suffix/prefix patterns for tech terms
const stems = [
  'پردازش', 'محاسبه', 'شبکه', 'داده', 'برنامه', 'سیستم', 'رایانه',
  'کامپیوتر', 'اطلاعات', 'ارتباط', 'ذخیره', 'حافظه', 'ورودی', 'خروجی',
  'کنترل', 'مدیریت', 'نگهداری', 'بازیابی', 'بهبود', 'توسعه', 'طراحی',
  'پیاده', 'اجرا', 'تولید', 'تحلیل', 'بررسی', 'آزمایش', 'اندازه',
  'شبیه', 'محاسباتی', 'دیجیتال', 'منطقی', 'الکترونیک', 'نرم‌افزار',
  'سخت‌افزار', 'میان‌افزار', 'پایگاه', 'سرور', 'کلاینت', 'مرورگر',
  'رمزنگاری', 'امنیتی', 'حفاظت', 'دسترسی', 'شخصی', 'سازمانی',
  'تجاری', 'عمومی', 'اختصاصی', 'متمرکز', 'توزیع', 'موازی',
  'ترتیبی', 'همزمان', 'ناهمزمان', 'تعاملی', 'خودکار', 'هوشمند',
  'پویا', 'ایستا', 'الگوریتمی', 'تابعی', 'شی‌گرا', 'ساختاری',
  'پایگاه', 'رابطه', 'سندی', 'گرافی', 'دودویی', 'درختی',
  'صفی', 'پشته', 'پیوندی', 'هش', 'اندیس', 'کلیدی',
  'عددی', 'متنی', 'صوتی', 'تصویری', 'چندرسانه', 'بصری',
  'لمسی', 'صوتی', 'حرکتی', 'موقعیتی', 'زمانی', 'مکانی',
  'جستجو', 'مرتب', 'فیلتر', 'دسته', 'خوشه', 'الگو',
  'شناسایی', 'تشخیص', 'پیشگویی', 'تخمین', 'بهینه', 'تطبیق',
  'ثبت', 'گزارش', 'نمایش', 'داشبورد', 'نمودار', 'جدول',
];

const suffixes = [
  'گر', 'نده', 'ای', 'ی', 'پذیر', 'شدنی', 'کاری', 'سازی',
  'دهنده', 'کننده', 'شونده', 'گار', 'مانند', 'وار', 'نامه',
  'گاه', 'کده', 'خانه', 'افزار', 'ساخت', 'پایه', 'محور',
  'بنیان', 'مدار', 'سان', 'آسا', 'فکن', 'انداز',
];

const prefixes = [
  'رایانه', 'داده', 'خود', 'هم', 'نو', 'دگر', 'باز', 'درون',
  'برون', 'پیش', 'پس', 'زیر', 'ابر', 'کلان', 'ریز', 'نیمه',
  'چند', 'تک', 'همه', 'فرا', 'درون', 'میان', 'بین', 'بدون',
];

let added = 0;

// Generate compound words
for (const stem of stems) {
  // stem + suffix
  for (const suf of suffixes) {
    const word = stem + suf;
    if (word.length > 12 || word.length < 3) continue;
    if (existingAll.has(word)) continue;
    const clue = `مربوط به ${stem} در کامپیوتر`;
    dict.push({ word, clue, category: 'tech', language: 'fa' });
    existingAll.add(word);
    added++;
    if (added >= 500) break;
  }
  if (added >= 500) break;
}

if (added < 500) {
  // prefix + stem
  for (const stem of stems) {
    for (const pre of prefixes) {
      const word = pre + stem;
      if (word.length > 12 || word.length < 3) continue;
      if (existingAll.has(word)) continue;
      const clue = `نوعی ${stem} در فناوری اطلاعات`;
      dict.push({ word, clue, category: 'tech', language: 'fa' });
      existingAll.add(word);
      added++;
      if (added >= 500) break;
    }
    if (added >= 500) break;
  }
}

console.log('Generated and added:', added);

fs.writeFileSync(DICT, JSON.stringify(dict, null, 2), 'utf-8');

const finalDict = dict.filter(e => e.category === 'tech' && e.language === 'fa').length;
console.log('Final dict tech FA:', finalDict);

// Remove the script line for uniqueness
const all = new Set(dict.filter(e => e.category === 'tech' && e.language === 'fa').map(e => e.word));
console.log('Total unique tech dict:', all.size);
