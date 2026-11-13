# Register folktales in the server data
import json, os, re, uuid

FOLKTALE_DIR = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/data/folktales'
BOOKS_FILE = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_books.json'
CHAPTERS_FILE = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_chapters.json'

# Read existing data
with open(BOOKS_FILE) as f:
    existing_books = json.load(f)
with open(CHAPTERS_FILE) as f:
    existing_chapters = json.load(f)

# Map story id -> book info
FOLKTALE_BOOKS = {
    'shangool': {'title': 'شنگول و منگول', 'author': 'قصه‌های عامیانه', 'description': 'داستان دو بزغاله کوچولو که در خانه تنها ماندند و گرگ حیله‌گر سعی کرد آنها را فریب دهد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/shangool.jpg'},
    'kadoo': {'title': 'کدو قلقله زن', 'author': 'قصه‌های عامیانه', 'description': 'ماجرای کدوی قلقله‌زن و پیرزن مهربانی که با خود داستان‌های زیادی به همراه داشت.', 'difficulty': 'easy', 'cover_image': '/images/folktales/kadoo.jpg'},
    'khoros': {'title': 'خروس و روباه', 'author': 'قصه‌های عامیانه', 'description': 'داستان خروس زیرکی که با هوشیاری از چنگال روباه حیله‌گر فرار کرد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/khoros.jpg'},
    'mahi': {'title': 'ماهی سیاه کوچولو', 'author': 'قصه‌های عامیانه', 'description': 'ماهی کوچولوی سیاه که از خانه‌اش بیرون زد و دنیای بزرگ و زیبای رودخانه را کشف کرد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/mahi.jpg'},
    'boz': {'title': 'بزبز قندی', 'author': 'قصه‌های عامیانه', 'description': 'بزغاله کوچولوی سفید که تنها به سفر رفت و با ماجراهای هیجان‌انگیزی روبرو شد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/boz.jpg'},
    'gonjeshk': {'title': 'گنجشکک اشی مشی', 'author': 'قصه‌های عامیانه', 'description': 'گنجشک کوچولویی که در مسیرش گنج‌های مختلفی پیدا کرد و درس‌های ارزشمندی آموخت.', 'difficulty': 'easy', 'cover_image': '/images/folktales/gonjeshk.jpg'},
    'khaleh': {'title': 'خاله سوسکه', 'author': 'قصه‌های عامیانه', 'description': 'ماجراهای خاله سوسکه مهربان و دوستانش در دهکده کوچک.', 'difficulty': 'easy', 'cover_image': '/images/folktales/khaleh.jpg'},
    'mosh': {'title': 'موش و گربه', 'author': 'قصه‌های عامیانه', 'description': 'داستان معروف موش و گربه عبید زاکانی، ماجرای تقابل همیشگی.', 'difficulty': 'easy', 'cover_image': '/images/folktales/mosh.jpg'},
    'dokhtar': {'title': 'دختر نارنج و ترنج', 'author': 'قصه‌های عامیانه', 'description': 'دختری که از دل یک نارنج به دنیا آمد و ماجراهای شگفت‌انگیزی برایش رخ داد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/dokhtar.jpg'},
    'siah': {'title': 'سیاه‌زنگی', 'author': 'قصه‌های عامیانه', 'description': 'داستانی درباره مهربانی و خوبی که پاداش خود را در زندگی می‌گیرد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/siah.jpg'},
    'gorbeh': {'title': 'گربه ناقلا', 'author': 'قصه‌های عامیانه', 'description': 'گربه زرنگی که با هوش و ذکاوت خود از هر مشکلی عبور می‌کرد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/gorbeh.jpg'},
    'div': {'title': 'دیو و کچل', 'author': 'قصه‌های عامیانه', 'description': 'مرد کچل باهوشی که با زرنگی از دست دیو وحشتناک فرار کرد.', 'difficulty': 'easy', 'cover_image': '/images/folktales/div.jpg'},
    'shab': {'title': 'شب‌های شیرین', 'author': 'قصه‌های عامیانه', 'description': 'مجموعه‌ای از قصه‌های شیرین شبانه برای کودکان.', 'difficulty': 'easy', 'cover_image': '/images/folktales/shab.jpg'},
    'gol': {'title': 'گلی و کوزه', 'author': 'قصه‌های عامیانه', 'description': 'دختری به نام گلی که با یک کوزه سفالی ماجراهای زیادی داشت.', 'difficulty': 'easy', 'cover_image': '/images/folktales/gol.jpg'},
    'naneh': {'title': 'نان و نمک', 'author': 'قصه‌های عامیانه', 'description': 'داستانی درباره دوستی و مهمان‌نوازی و ارزش نان و نمک.', 'difficulty': 'easy', 'cover_image': '/images/folktales/naneh.jpg'},
}

def parse_ts_words(filepath):
    """Extract chapter words from a TS word file"""
    with open(filepath) as f:
        content = f.read()
    pairs = re.findall(r'word:\s*"([^"]*)"\s*,\s*clue:\s*"([^"]*)"', content)
    return [{'word': w, 'clue': c} for w, c in pairs]

def parse_ts_chapter_meta(filepath):
    """Extract chapter metadata (title, description, etc.) from TS file"""
    with open(filepath) as f:
        content = f.read()
    
    title = ''
    desc = ''
    image = ''
    monster = ''
    vt = ''
    
    m = re.search(r'title:\s*"([^"]*)"', content)
    if m: title = m.group(1)
    
    # Description is a backtick template literal
    m = re.search(r'description:\s*`([\s\S]*?)`\s*,', content)
    if m: desc = m.group(1).strip()
    
    m = re.search(r'image:\s*"([^"]*)"', content)
    if m: image = m.group(1)
    
    m = re.search(r'monsterAvatar:\s*"([^"]*)"', content)
    if m: monster = m.group(1)
    
    m = re.search(r'victoryText:\s*"([^"]*)"', content)
    if m: vt = m.group(1)
    if not vt:
        m = re.search(r'victoryText:\s*`([\s\S]*?)`\s*,', content)
        if m: vt = m.group(1).strip()
    
    return title, desc, image, monster, vt

# Process each folktale
new_books = []
new_chapters = []
const_names = {}  # word const names from TS

for story_id, info in FOLKTALE_BOOKS.items():
    ts_file = os.path.join(FOLKTALE_DIR, f'{story_id}Words.ts')
    if not os.path.exists(ts_file):
        print(f"  MISSING: {ts_file}")
        continue
    
    words = parse_ts_words(ts_file)
    title, desc, image, monster, vt = parse_ts_chapter_meta(ts_file)
    
    if not title:
        title = info['title']
    if not desc:
        desc = info['description']
    if not image:
        image = f'/images/folktales/{story_id}.jpg'
    
    # Chapter data
    chapter = {
        'id': str(uuid.uuid4()),
        'book_id': story_id,
        'title': title,
        'description': desc,
        'image': image,
        'chapter_index': 1,
        'victory_text': vt or 'پایان داستان! تو این قصه را با موفقیت خواندی و کلمات آن را پیدا کردی.',
        'words': words,
        'monster_avatar': monster or f'/images/monsters/folktales/{story_id}.svg',
        'created_at': '2026-06-05T10:00:00.000Z'
    }
    new_chapters.append(chapter)
    
    # Book data
    book = {
        'id': story_id,
        'genre': 'folklore',
        'title': info['title'],
        'author': info['author'],
        'description': info['description'],
        'cover_image': info['cover_image'],
        'difficulty': info['difficulty'],
    }
    new_books.append(book)
    
    print(f"  {story_id:15s}: {len(words):3d} words, desc={len(desc)}ch")

# Add to existing data
existing_book_ids = {b['id'] for b in existing_books}
existing_chapter_keys = {(c['book_id'], c['chapter_index']) for c in existing_chapters}

added_books = 0
added_chapters = 0

for book in new_books:
    if book['id'] not in existing_book_ids:
        existing_books.append(book)
        added_books += 1

for ch in new_chapters:
    key = (ch['book_id'], ch['chapter_index'])
    if key not in existing_chapter_keys:
        existing_chapters.append(ch)
        added_chapters += 1

# Write back
with open(BOOKS_FILE, 'w') as f:
    json.dump(existing_books, f, ensure_ascii=False, indent=2)

with open(CHAPTERS_FILE, 'w') as f:
    json.dump(existing_chapters, f, ensure_ascii=False, indent=2)

print(f"\nAdded {added_books} books, {added_chapters} chapters")
print(f"Total books: {len(existing_books)}, Total chapters: {len(existing_chapters)}")
PYEOF