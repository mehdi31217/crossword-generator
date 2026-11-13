# Rebuild corrupted Words.ts files from story_chapters.json
import json, os, re

CHAPTERS_JSON = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_chapters.json'
OUTPUT_DIR = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/data/shahnameh'

with open(CHAPTERS_JSON) as f:
    chapters = json.load(f)

# Books to rebuild - all 11 corrupted files
books_to_rebuild = {
    'zal_simorgh': {'output': 'zalSimorghWords.ts', 'const': 'ZAL_SIMORGH', 'chapters_file': 'zalSimorghChapters.ts'},
    'kaykhosrow': {'output': 'kaykhosrowWords.ts', 'const': 'KAYKHOSROW', 'chapters_file': 'kaykhosrowChapters.ts'},
    'rostam_akvan': {'output': 'rostamAkvanWords.ts', 'const': 'ROSTAM_AKVAN', 'chapters_file': None},
    'rostam_death': {'output': 'rostamDeathWords.ts', 'const': 'ROSTAM_DEATH', 'chapters_file': None},
    'hushang': {'output': 'hushangWords.ts', 'const': 'HUSHANG', 'chapters_file': None},
    'jamshid': {'output': 'jamshidWords.ts', 'const': 'JAMSHID', 'chapters_file': None},
    'anushirvan': {'output': 'anushirvanWords.ts', 'const': 'ANUSHIRVAN', 'chapters_file': None},
    'tahmineh': {'output': 'tahminehWords.ts', 'const': 'TAHMINEH', 'chapters_file': 'tahminehChapters.ts'},
    'rostam_esfandiyar': {'output': 'rostamEsfandiyarWords.ts', 'const': 'ROSTAM_ESFANDIYAR', 'chapters_file': 'rostamEsfandiyarChapters.ts'},
    'esfandiyar': {'output': 'esfandiyarWords.ts', 'const': 'ESFANDIYAR', 'chapters_file': 'esfandiyarChapters.ts'},
    'zal': {'output': 'zalWords.ts', 'const': 'ZAL', 'chapters_file': 'zalChapters.ts'},
}

# Also check if kavehWords.ts was corrupted (it wasn't in my fix list but verify)
# And check afrasiabWords.ts etc

def rebuild_word_file(book_id, config):
    book_chapters = [c for c in chapters if c['book_id'] == book_id]
    if not book_chapters:
        print(f"  No chapters found for {book_id}")
        return
    
    book_chapters.sort(key=lambda c: c['chapter_index'])
    const_name = config['const']
    
    lines = []
    lines.append("import { DictionaryEntry, ShahnamehChapter } from '../../types';\n")
    
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
    
    # Check if chapters file exists and has the export data
    chapters_file = config.get('chapters_file')
    if chapters_file:
        ch_path = os.path.join(OUTPUT_DIR, chapters_file)
        if os.path.exists(ch_path):
            with open(ch_path) as f:
                ch_content = f.read()
            # Find the export const block from the chapters file
            export_match = re.search(
                r'(export\s+const\s+\w+CHAPTERS\s*:\s*ShahnamehChapter\[\]\s*=\s*\[[\s\S]*?\]\s*;)',
                ch_content
            )
            if export_match:
                lines.append(export_match.group(1))
            else:
                print(f"  Could not find export in {chapters_file}")
                return
        else:
            print(f"  Chapters file not found: {chapters_file}")
            return
    else:
        # No chapters file - generate one from JSON data
        lines.append(f"export const {const_name}_CHAPTERS: ShahnamehChapter[] = [")
        for i, ch in enumerate(book_chapters):
            idx = ch['chapter_index']
            wc_name = f"{const_name}_CHAPTER_{idx}"
            title = ch.get('title', '')
            desc = ch.get('description', '')
            image = ch.get('image', '')
            monster = ch.get('monster_avatar', '')
            vt = ch.get('victory_text', '')
            created = ch.get('created_at', '2026-06-04T22:00:00.000Z')
            
            # Escape backticks and backslashes in description
            desc_escaped = desc.replace('\\', '\\\\').replace('`', '\\`')
            vt_escaped = vt.replace('\\', '\\\\').replace('`', '\\`')
            
            comma = ',' if i < len(book_chapters) - 1 else ''
            lines.append(f'  {{ id: {idx}, title: "{title}", description: `{desc_escaped}`, image: "{image}", monsterAvatar: "{monster}", victoryText: "{vt_escaped}", words: {wc_name}, created_at: "{created}" }}{comma}')
        lines.append("];\n")
    
    output_path = os.path.join(OUTPUT_DIR, config['output'])
    with open(output_path, 'w') as f:
        f.write('\n'.join(lines) + '\n')
    
    # Verify word count
    with open(output_path) as f:
        content = f.read()
    words_found = len(re.findall(r'word:\s*"', content))
    total_expected = sum(len(c.get('words',[])) for c in book_chapters)
    print(f"  {config['output']:35s}: {words_found}/{total_expected} words")

# Rebuild
for book_id, config in books_to_rebuild.items():
    print(f"Rebuilding {book_id}...")
    rebuild_word_file(book_id, config)

print("\nDone rebuilding.")
