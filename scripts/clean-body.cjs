#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const DICT = path.join(__dirname, '..', 'server', 'local-data', 'dictionary.json');
const dict = JSON.parse(fs.readFileSync(DICT, 'utf-8'));
const latin = /[a-zA-Z]/;

const FIXES = {
  'زر': 'فلز گرانبهای مورد استفاده در روکش دندان',
  'کتف': 'استخوان پشت شانه بین گردن و بازو',
  'ظلم': 'احساس ناراحتی و درد ظالمانه جسمی',
  'صلح': 'آرامش ذهنی پس از درمان',
  'دزد': 'عامل غیرمجاز در بدن مانند سلول سرطانی',
  'کارد': 'تیغ جراحی در پزشکی',
  'مغازه': 'محل خرید لوازم بهداشتی و دارو',
  'پزشک': 'دکتر متخصص درمان بیماریها',
  'هدیه': 'اهدای عضو پیوندی به بیمار',
  'صورت': 'پیشانی و گونه و لب و بینی',
  'شانه': 'اتصال بازو به تنه',
  'گونه': 'پوست روی استخوان گونه بالا',
  'دیابت': 'اختلال قند خون مزمن',
  'سرطان': 'رشد غیرقابل کنترل سلول بدخیم',
};

let fixed = 0;
for (const entry of dict) {
  if (entry.category === 'body' && entry.language === 'fa' && FIXES[entry.word]) {
    const old = entry.clue;
    entry.clue = FIXES[entry.word];
    if (old !== entry.clue) fixed++;
  }
}
console.log('Fixed clues:', fixed);

let removed = 0;
const cleaned = [];
for (const entry of dict) {
  if (entry.category === 'body' && entry.language === 'fa') {
    if (entry.word.includes(' ') || latin.test(entry.word)) {
      removed++;
      continue;
    }
  }
  cleaned.push(entry);
}
console.log('Removed space/latin:', removed);
console.log('Body FA remaining:', cleaned.filter(e => e.category === 'body' && e.language === 'fa').length);

fs.writeFileSync(DICT, JSON.stringify(cleaned, null, 2), 'utf-8');
