# Final fix: map all 79 remaining severe weak clues
import re, os

WORD_DIR = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/data/shahnameh'

REMAINING_WORD_CLUES = {
    # afrasiab
    "طوس": "سردار نامدار ایرانی و یکی از پهلوانان شاهنامه",
    # anushirvan
    "امتحان": "آزمون و سنجش دانش (انوشیروان بزرگمهر را امتحان کرد)",
    "جنگ": "مبارزه مسلحانه میان دو کشور",
    "پیروز": "موفق و برنده در نبرد",
    "فتح": "تصرف و پیروزی در جنگ با کشور دیگر",
    "آباد": "دارای رونق و آبادانی و جمعیت",
    "دانشگاه": "مرکز آموزش عالی و تحقیقات",
    "کتاب": "مجموعه برگ‌های نوشته شده برای مطالعه",
    "حکمت": "فلسفه و خرد و معرفت عمیق",
    # hushang
    "تمدن": "مجموعه پیشرفت‌های بشری در یک جامعه",
    "پوشاک": "لباس و آنچه بر تن پوشیده می‌شود",
    "خانه": "محل سکونت و زندگی خانواده",
    "نور": "روشنایی و تابش (آتش این را ایجاد می‌کند)",
    "خوراک": "غذا و آنچه خورده می‌شود",
    "حفاظت": "نگهبانی و محافظت از خطر",
    "پاکی": "پاکیزگی و بدون آلودگی (آتش نشان‌دهنده این بود)",
    "شاهنامه": "کتاب حماسی فردوسی شامل داستان‌های ایران باستان",
    "اسطوره": "افسانه و داستان کهن و اساطیری",
    # jamshid
    "طلایی": "رنگ زرد درخشان مانند طلا (دوران اوج)",
    "قدرت": "توانایی و اقتدار و نیروی بسیار",
    "فلز": "ماده سخت مانند آهن و مس برای ساخت ابزار",
    "ابریشم": "پارچه لطیف و گرانبها از پیله کرم ابریشم",
    "پارچه": "ماده بافته شده برای دوخت لباس",
    "ثروت": "دارایی و مال و سرمایه فراوان",
    "پیشه": "شغل و حرفه و کار تخصصی",
    "کار": "فعالیت و انجام وظیفه",
    "زینت": "آرایش و زیباسازی و تزئین",
    "نمایش": "نشان دادن و به رخ کشیدن",
    "شورش": "قیام و طغیان علیه حکومت",
    "جدایی": "دوری و فاصله گرفتن از چیزی",
    "سقوط": "افتادن و فروپاشی از بالا به پایین",
    "پایان": "آخر و سرانجام و تمام شدن",
    "عاقبت": "سرنوشت نهایی و فرجام کار",
    "پشیمانی": "حسرت و افسوس از کار انجام شده",
    "هنر": "مهارت و استادی در آفرینش زیبایی",
    "سنت": "رسوم و آیین‌های به ارث رسیده از گذشته",
    "فرهنگ": "مجموعه دانش و هنر و آداب یک جامعه",
    "ثبت": "نوشتن و ضبط کردن در جایی رسمی",
    "تمدنساز": "کسی که بنیان‌گذار تمدن است",
    # kaykhosrow
    "بند": "طناب و زنجیر برای بستن اسیر (افراسیاب)",
    "حکم": "دستور و فرمان رسمی",
    "غرق": "فرو رفتن در آب و خفه شدن",
    "آب": "مایع حیات‌بخش (ماده اصلی دریا)",
    "سرانجام": "نتیجه نهایی و عاقبت کار",
    "آزادی": "رهایی از بند و اسارت",
    "داد": "عدالت و انصاف در حکومت",
    # khosrow
    "پرویز": "لقب خسرو دوم پادشاه ساسانی",
    # mosaddegh
    "نخست‌وزیر": "مقام اول اجرایی دولت بعد از رئیس‌جمهور یا شاه",
    # peykar
    "پایان": "آخر و سرانجام یک داستان",
    # rostam_akvan
    "اسیر": "کسی که در جنگ به بند کشیده شده",
    "نیرو": "قدرت و توان بدنی یا ذهنی",
    "دلیری": "شجاعت و بی‌باکی در برابر خطر",
    "سفر": "مسافرت و رفتن به جایی دوردست",
    # rostam_death
    "خیانت": "پشت کردن به اعتماد و نادیده گرفتن وفاداری",
    "ظاهر": "نمای بیرونی و آنچه دیده می‌شود",
    "باطن": "دل و درون و حقیقت پنهان",
    "اهریمن": "دیو و موجود اهریمنی و بدسرشت",
    "شیطان": "ابلیس و وسوسه‌گر و اغواکننده",
    "کمین": "مخفی شدن برای حمله ناگهانی به دشمن",
    "سقوط": "افتادن در چاه یا از بلندی",
    "افتادن": "سرنگون شدن و فرو افتادن",
    "غافل": "بی‌خبر و بی‌توجه و غافلگیر",
    "هدف": "نشانه و مقصد (تیر به آن می‌نشیند)",
    "جان": "روح و حیات یک انسان",
    "بیداد": "ظلم و ستم و بی‌عدالتی",
    "دل": "قلب و محل احساسات",
    "گریه": "اشک ریختن از سر غم یا درد",
    "یاد": "خاطره و ذهن (در خاطر داشتن)",
    "دلیری": "شجاعت و نترسی در نبرد",
    "ببر": "حیوان وحشی راه‌راه از گربه‌سانان",
}

def apply_final_fixes():
    bad_patterns = ['این را', 'این بود', 'در این', 'به این', 'از این', 'برای این', 'بدین', 'این کرد', 'این شد', 'این داشت', 'این داشتند', 'این کردند', 'این کرده']
    
    total_fixed = 0
    for fn in sorted(f for f in os.listdir(WORD_DIR) if f.endswith('Words.ts') and f != 'shahnamehWords.ts'):
        path = os.path.join(WORD_DIR, fn)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all word-clue pairs, process right-to-left
        pairs = list(re.finditer(r'word:\s*"([^"]*)"\s*,\s*clue:\s*"([^"]*)"', content))
        fixed = 0
        
        for match in reversed(pairs):
            word = match.group(1)
            clue = match.group(2)
            clue_start = match.start(2) - 1  # before opening "
            clue_end = match.end(2)           # after closing "
            old_full = match.group(0)
            
            if any(p in clue for p in bad_patterns) and word in REMAINING_WORD_CLUES:
                new_clue = REMAINING_WORD_CLUES[word]
                content = content[:clue_start] + f'"{new_clue}"' + content[clue_end:]
                fixed += 1
        
        # Also check entries with | pipe
        pairs2 = list(re.finditer(r'word:\s*"([^"]*)"\s*,\s*clue:\s*"([^"]*)"', content))
        for match in reversed(pairs2):
            word = match.group(1)
            clue = match.group(2)
            clue_start = match.start(2) - 1
            clue_end = match.end(2)
            
            if any(p in clue for p in bad_patterns) and word in REMAINING_WORD_CLUES:
                new_clue = REMAINING_WORD_CLUES[word]
                content = content[:clue_start] + f'"{new_clue}"' + content[clue_end:]
                fixed += 1
        
        if fixed > 0:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
        
        # Count remaining
        clues = re.findall(r'clue:\s*"([^"]*)"', content)
        remaining = sum(1 for c in clues if any(p in c for p in bad_patterns))
        total_fixed += fixed
        print(f"{fn:35s}: fixed {fixed:3d}, remaining: {remaining:3d}/{len(clues):3d}")
    
    print(f"\nTotal fixed in final pass: {total_fixed}")

apply_final_fixes()
