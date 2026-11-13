import json

CHAPTERS_FILE = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_chapters.json'

# More words per chapter for grades that need them
EXTRA_WORDS = {
    ('seventh_grade', 1): [('کتاب', 'مجموعه برگ'), ('قلم', 'نوشت‌افزار'), ('آموزگار', 'معلم')],
    ('seventh_grade', 2): [('طرح', 'نقشه'), ('رنگ', 'لون'), ('زیبایی', 'جمال'), ('اثر', 'کار هنری')],
    ('seventh_grade', 3): [('رفتار', 'عمل'), ('سخاوت', 'بخشش'), ('بزرگی', 'کرم')],
    ('seventh_grade', 4): [('فردا', 'روز بعد'), ('بهتر', 'خوب‌تر'), ('تلاش', 'سعی')],
    ('eighth_grade', 1): [('دانایی', 'معرفت'), ('دانش', 'علم'), ('نکته', 'نکته'), ('سنجش', 'اندازه')],
    ('eighth_grade', 2): [('دادرسی', 'عدالت'), ('مساوات', 'برابری'), ('انصاف', 'عدل')],
    ('eighth_grade', 3): [('نجات', 'رهایی'), ('خلاصی', 'رهایی'), ('آزاده', 'آزاد')],
    ('eighth_grade', 4): [('پرچم', 'رایت'), ('دلیر', 'شجاع'), ('دوستی', 'محبت')],
    ('ninth_grade', 1): [('رزمنده', 'جنگجو'), ('دشمن', 'خصم'), ('شمشیر', 'تیغ'), ('سپر', 'مجن')],
    ('ninth_grade', 2): [('درویش', 'صوفی'), ('فقر', 'نیاز'), ('غنا', 'بی‌نیازی')],
    ('ninth_grade', 3): [('آدم', 'بشر'), ('نوع', 'گونه'), ('خلق', 'آفرینش')],
    ('ninth_grade', 4): [('زمین', 'ارض'), ('فلک', 'آسمان'), ('اختر', 'ستاره')],
    ('tenth_grade', 1): [('میخانه', 'خرابات'), ('باده', 'شراب'), ('معشوق', 'محبوب')],
    ('tenth_grade', 2): [('آموزش', 'تعلیم'), ('اخلاق', 'ادب'), ('سفر', 'مسافرت'), ('تجربه', 'آزمون')],
    ('tenth_grade', 3): [('زال', 'سپیدموی'), ('سیمرغ', 'مرغ'), ('کی‌قباد', 'شاه')],
    ('tenth_grade', 4): [('عاشق', 'دلداده'), ('درد', 'الم'), ('راز', 'سر')],
    ('eleventh_grade', 1): [('آگاه', 'باخبر'), ('حرکت', 'جنبش'), ('خیزش', 'قیام')],
    ('eleventh_grade', 2): [('سلطنت', 'پادشاهی'), ('دستور', 'فرمان'), ('انجمن', 'مجمع')],
    ('eleventh_grade', 3): [('تحریم', 'ممنوعیت'), ('شوروی', 'روس'), ('آمریکا', 'ایالات')],
    ('eleventh_grade', 4): [('نظام', 'سامان'), ('اسلام', 'دین'), ('شعار', 'ندای')],
    ('twelfth_grade', 1): [('ایمان', 'یقین'), ('عرفان', 'تصوف'), ('سلوك', 'سیر')],
    ('twelfth_grade', 2): [('پارسا', 'زاهد'), ('نیت', 'قصد'), ('صفا', 'پاکی')],
    ('twelfth_grade', 3): [('فداکار', 'ازخودگذشته'), ('جانباز', 'فداکار'), ('اسطوره', 'افسانه')],
    ('twelfth_grade', 4): [('بهشت', 'فردوس'), ('جهنم', 'دوزخ'), ('حشر', 'قیامت'), ('خلود', 'جاودانگی')],
}

with open(CHAPTERS_FILE, encoding='utf-8') as f:
    chapters = json.load(f)

added = 0
for (book_id, ch_idx), wordlist in EXTRA_WORDS.items():
    for c in chapters:
        if c['book_id'] == book_id and c['chapter_index'] == ch_idx:
            existing_words = {w['word'] for w in c['words']}
            for word, clue in wordlist:
                if word not in existing_words:
                    c['words'].append({'word': word, 'clue': clue})
                    added += 1
            break

with open(CHAPTERS_FILE, 'w', encoding='utf-8') as f:
    json.dump(chapters, f, ensure_ascii=False, indent=2)

# Report
for gid in ['seventh_grade','eighth_grade','ninth_grade','tenth_grade','eleventh_grade','twelfth_grade']:
    chs = [c for c in chapters if c['book_id'] == gid]
    wc = sum(len(c.get('words',[])) for c in chs)
    print(f'{gid:20s}: {len(chs)}ch, {wc}w (+{added if gid==ch "{added}" else "0"})')

print(f'Total added: {added}')
