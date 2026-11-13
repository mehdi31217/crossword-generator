# Comprehensive recovery: rebuild 7 from JSON, repair 4 from TS+JSON
import re, json, os

WORD_DIR = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/data/shahnameh'
CHAPTERS_JSON = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_chapters.json'

with open(CHAPTERS_JSON) as f:
    all_chapters = json.load(f)

# Build reverse maps
JSON_CLUE_TO_WORD = {}
for ch in all_chapters:
    for w in ch.get('words', []):
        word = w.get('word', '')
        clue = w.get('clue', '')
        if clue and word:
            JSON_CLUE_TO_WORD[clue] = word

# WORD_CLUES reverse map
WORD_CLUES = {}
#  extract from fix-all-clues.py 
exec(open('/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/scripts/fix-all-clues.py').read().split('# Fix Phase 1')[0].replace('WORD_CLUES = {','_WORD_CLUES = {'))
# Actually let me just read it directly
import ast

def get_word_clues():
    with open('/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/scripts/fix-all-clues.py') as f:
        content = f.read()
    start = content.index('WORD_CLUES = {')
    end = content.index('\n}\n\n# ===========', start) + 3
    dict_text = content[start:end]
    # Parse as Python dict - but it may have f-strings or complex stuff
    # Just eval it carefully
    local_vars = {}
    try:
        exec(dict_text, {"__builtins__": {}}, local_vars)
        return local_vars.get('WORD_CLUES', {})
    except:
        # Fall back to regex parsing
        print("Warning: Could not parse WORD_CLUES, using JSON only")
        return {}

WORD_CLUES_DICT = get_word_clues()
# Build reverse lookup
WC_CLUE_TO_WORD = {v: k for k, v in WORD_CLUES_DICT.items()}

# Merge with JSON
CLUE_TO_WORD = {**JSON_CLUE_TO_WORD, **WC_CLUE_TO_WORD}

def recover_word(word_start, clue):
    """Try to recover original word from partial word start + clue"""
    if clue in CLUE_TO_WORD:
        return CLUE_TO_WORD[clue]
    if clue in WC_CLUE_TO_WORD:
        return WC_CLUE_TO_WORD[clue]
    # Try prefix match
    candidates = [w for w in CLUE_TO_WORD.values() if w.startswith(word_start)]
    if len(candidates) == 1:
        return candidates[0]
    return None

# Files categorized
COMPLETE_JSON_BOOKS = {
    'zal_simorgh': 'zalSimorghWords.ts',
    'kaykhosrow': 'kaykhosrowWords.ts',
    'rostam_akvan': 'rostamAkvanWords.ts',
    'rostam_death': 'rostamDeathWords.ts',
    'hushang': 'hushangWords.ts',
    'jamshid': 'jamshidWords.ts',
    'anushirvan': 'anushirvanWords.ts',
}

INCOMPLETE_JSON_BOOKS = {
    'esfandiyar': 'esfandiyarWords.ts',
    'tahmineh': 'tahminehWords.ts',
    'rostam_esfandiyar': 'rostamEsfandiyarWords.ts',
    'zal_rudabeh': 'zalWords.ts',
}

def rebuild_from_json(book_id, ts_filename):
    """Completely rebuild a Words.ts file from JSON data"""
    book_chapters = [c for c in all_chapters if c['book_id'] == book_id]
    book_chapters.sort(key=lambda c: c['chapter_index'])
    
    const_name = book_id.upper()
    if book_id == 'zal_simorgh': const_name = 'ZAL_SIMORGH'
    elif book_id == 'rostam_akvan': const_name = 'ROSTAM_AKVAN'
    elif book_id == 'rostam_death': const_name = 'ROSTAM_DEATH'
    elif book_id == 'rostam_esfandiyar': const_name = 'ROSTAM_ESFANDIYAR'
    elif book_id == 'zal_rudabeh': const_name = 'ZAL'
    
    lines = ['import { DictionaryEntry, ShahnamehChapter } from "../../types";\n']
    
    # Word arrays
    word_const_names = []
    for ch in book_chapters:
        idx = ch['chapter_index']
        wc_name = f"{const_name}_CHAPTER_{idx}"
        word_const_names.append(wc_name)
        words = ch.get('words', [])
        lines.append(f"const {wc_name}: DictionaryEntry[] = [")
        for w in words:
            word = w.get('word', '')
            clue = w.get('clue', '')
            lines.append(f'  {{ word: "{word}", clue: "{clue}" }},')
        lines.append("];\n")
    
    # Chapter export
    lines.append(f"export const {const_name}_CHAPTERS: ShahnamehChapter[] = [")
    for i, ch in enumerate(book_chapters):
        idx = ch['chapter_index']
        wc_name = f"{const_name}_CHAPTER_{idx}"
        title = ch.get('title', '')
        desc = ch.get('description', '') or ''
        image = ch.get('image', '') or ''
        monster = ch.get('monster_avatar', '') or ''
        vt = ch.get('victory_text', '') or ''
        created = ch.get('created_at', '2026-06-04T22:00:00.000Z')
        
        # Escape special chars for TS template literal
        desc_escaped = desc.replace('\\', '\\\\').replace('`', '\\`')
        vt_escaped = vt.replace('\\', '\\\\').replace('`', '\\`')
        
        comma = ',' if i < len(book_chapters) - 1 else ''
        lines.append(f'  {{ id: {idx}, title: "{title}", description: `{desc_escaped}`, image: "{image}", monsterAvatar: "{monster}", victoryText: "{vt_escaped}", words: {wc_name}, created_at: "{created}" }}{comma}')
    lines.append("];\n")
    
    path = os.path.join(WORD_DIR, ts_filename)
    with open(path, 'w') as f:
        f.write('\n'.join(lines) + '\n')
    
    wc = len(re.findall(r'word:\s*"', '\n'.join(lines)))
    print(f"  Rebuilt {ts_filename}: {wc} words from JSON")

def repair_ts_file(book_id, ts_filename):
    """Repair corrupted entries in TS file, keep clean entries"""
    path = os.path.join(WORD_DIR, ts_filename)
    with open(path) as f:
        content = f.read()
    
    # Fix corrupted entries
    corrupt_pattern = r'word:\s*"([^"]*)clue:\s*"([^"]*)"'
    fixed = 0
    unfixable = 0
    
    for match in re.finditer(corrupt_pattern, content):
        word_start = match.group(1)
        clue = match.group(2)
        
        original_word = recover_word(word_start, clue)
        if original_word:
            old = match.group(0)
            new = f'word: "{original_word}", clue: "{clue}"'
            content = content.replace(old, new, 1)
            fixed += 1
        else:
            unfixable += 1
            print(f"    UNFIXABLE: start='{word_start}' clue='{clue[:30]}'")
    
    # Also fix cases where field separator was mangled
    # Sometimes the replacement joined word end to clue start without comma
    content = re.sub(r'"\s+clue:', '", clue:', content)
    content = re.sub(r'word:\s*"([^"]{1,3})"\s+clue:', r'word: "\1", clue:', content)
    
    if fixed > 0:
        with open(path, 'w') as f:
            f.write(content)
    
    wc = len(re.findall(r'word:\s*"', content))
    print(f"  Repaired {ts_filename}: fixed {fixed}, unfixable {unfixable}, total {wc} words")
    
    # If still missing words, supplement from JSON
    ts_chapters = [c for c in all_chapters if c['book_id'] == book_id]
    json_word_count = sum(len(c.get('words',[])) for c in ts_chapters)
    
    if json_word_count > 0 and wc < json_word_count:
        print(f"    Warning: TS has {wc} words but JSON has {json_word_count}")
        # Could supplement but skipping for now

# Process complete JSON books
print("=== Books with complete JSON data (rebuilding from JSON) ===")
for book_id, ts_file in COMPLETE_JSON_BOOKS.items():
    rebuild_from_json(book_id, ts_file)

# Process incomplete JSON books
print("\n=== Books with incomplete JSON data (repairing TS files) ===")
for book_id, ts_file in INCOMPLETE_JSON_BOOKS.items():
    repair_ts_file(book_id, ts_file)

print("\nDone. Verifying...")

# Final verification
for fn in sorted(os.listdir(WORD_DIR)):
    if not fn.endswith('Words.ts') or fn == 'shahnamehWords.ts':
        continue
    path = os.path.join(WORD_DIR, fn)
    with open(path) as f:
        content = f.read()
    wc = len(re.findall(r'word:\s*"', content))
    cc = len(re.findall(r'clue:\s*"', content))
    pairs = len(re.findall(r'word:\s*"[^"]*"\s*,\s*clue:\s*"[^"]*"', content))
    corrupt = len(re.findall(r'word:\s*"[^"]*clue:', content))
    print(f"  {fn:35s}: {wc}w/{cc}c, {pairs}pairs, {corrupt}corrupt")
