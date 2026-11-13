# Restore corrupted word entries using reverse WORD_CLUES lookup + JSON fallback
import re, json, os

WORD_DIR = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/data/shahnameh'
CHAPTERS_JSON = '/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server/local-data/story_chapters.json'

with open(CHAPTERS_JSON) as f:
    all_chapters = json.load(f)

# Build reverse clue→word map from WORD_CLUES (from fix-all-clues.py)
WORD_CLUES = {
    "سام": "پهلوان ایرانی پدر زال که فرزندش را در کوه رها کرد",
    "زال": "پهلوان سپیدموی ایرانی پسر سام و پدر رستم",
    # ... I'll rebuild this from the JSON data instead
}

# Build clue→word map from JSON (all chapters)
JSON_CLUE_TO_WORD = {}
JSON_WORD_TO_CLUE = {}
for ch in all_chapters:
    for w in ch.get('words', []):
        word = w.get('word', '')
        clue = w.get('clue', '')
        if clue and word:
            JSON_CLUE_TO_WORD[clue] = word
            if word not in JSON_WORD_TO_CLUE:
                JSON_WORD_TO_CLUE[word] = clue

print(f"JSON has {len(JSON_CLUE_TO_WORD)} unique clue→word mappings")

# Process files
files_to_fix = ['zalSimorghWords.ts', 'kaykhosrowWords.ts', 'rostamAkvanWords.ts', 
                'rostamDeathWords.ts', 'hushangWords.ts', 'jamshidWords.ts',
                'anushirvanWords.ts', 'esfandiyarWords.ts', 'tahminehWords.ts',
                'rostamEsfandiyarWords.ts', 'zalWords.ts']

total_fixed = 0
total_unfixable = 0

for fn in files_to_fix:
    path = os.path.join(WORD_DIR, fn)
    with open(path) as f:
        content = f.read()
    
    # Find corrupted entries: word contains "clue:"
    # Pattern: word: "XXXclue: "clue_text"
    # There might be a comma before clue or not, depending on corruption type
    
    # Strategy: replace each corrupted entry completely
    # Corrupted pattern: { word: "Xclue: "CLUE" },
    # Need to: { word: "ORIGINAL_WORD", clue: "CLUE" },
    
    fixed_in_file = 0
    unfixable_in_file = 0
    
    # Find all corrupted word entries
    # They look like: word: "SOMETHINGclue: "WHATEVER"
    corrupt_pattern = r'word:\s*"([^"]*)clue:\s*"([^"]*)"'
    
    for match in re.finditer(corrupt_pattern, content):
        word_start = match.group(1)  # The partial word before "clue:"
        clue = match.group(2)        # The clue text
        
        # Try to find the original word
        original_word = None
        
        # Method 1: Reverse lookup from clue (most clues were from WORD_CLUES)
        if clue in JSON_CLUE_TO_WORD:
            original_word = JSON_CLUE_TO_WORD[clue]
        
        # Method 2: Try partial match - the word_start is the beginning of the original word
        if not original_word and word_start:
            # Find all words in JSON that start with word_start
            candidates = [w for w in JSON_CLUE_TO_WORD.values() if w.startswith(word_start)]
            if len(candidates) == 1:
                original_word = candidates[0]
            elif len(candidates) > 1:
                # Filter by book
                book_id = fn.replace('Words.ts', '').lower()
                book_id = book_id.replace('zal', 'zal_').replace('rostam', 'rostam_')
                # Try various book ID formats
                book_candidates = [w for w in candidates 
                                   if any(c['book_id'].replace('-','_') in fn.lower() or fn.lower().replace('words.ts','').replace('zal','zal_').replace('rostam','rostam_').replace('esfandiyar','esfandiyar').replace('tahmineh','tahmineh') for c in all_chapters if c.get('words',[]))]
                if len(book_candidates) == 1:
                    original_word = book_candidates[0]
        
        if original_word:
            # Replace the corrupted entry
            # The corrupted: { word: "Xclue: "CLUE" },
            # The correct:   { word: "ORIGINAL_WORD", clue: "CLUE" },
            old = match.group(0)
            new = f'word: "{original_word}", clue: "{clue}"'
            content = content.replace(old, new, 1)
            fixed_in_file += 1
            total_fixed += 1
        else:
            unfixable_in_file += 1
            total_unfixable += 1
            # Show what we couldn't fix
            line = content[max(0, match.start()-20):match.end()+20]
            print(f"  UNFIXABLE in {fn}: word_start='{word_start}' clue='{clue[:30]}...' context: ...{line.strip()[:60]}...")
    
    if fixed_in_file > 0:
        with open(path, 'w') as f:
            f.write(content)
        print(f"{fn:35s}: fixed {fixed_in_file}, unfixable {unfixable_in_file}, clue count after: {len(re.findall(r'clue:\s*"', content))}")

print(f"\nTotal fixed: {total_fixed}, unfixable: {total_unfixable}")
