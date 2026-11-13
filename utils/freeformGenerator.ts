
import { Grid, DictionaryEntry, Clue } from '../types';

type PlacedWord = {
    word: string;
    originalWord: string; // Keep original for display
    clue: string;
    row: number;
    col: number;
    direction: 'across' | 'down';
};

type CharMap = Map<string, string>; // key: "r,c", value: normalized char

// Helper to normalize Persian chars for matching logic ONLY
const normalize = (s: string) => {
    return s.replace(/[\s\u200C]/g, '') // Remove spaces and ZWNJ
            .replace(/[آأإ]/g, 'ا')
            .replace(/[ىي]/g, 'ی')
            .replace(/[کك]/g, 'ک')
            .replace(/[ۀة]/g, 'ه')
            .toUpperCase();
};

export function generateFreeformGrid(words: DictionaryEntry[]): { grid: Grid, clues: { across: Clue[], down: Clue[] } } | null {
    // 1. Prepare words: Normalize for logic, keep original for display
    const processableWords = words.map(w => ({
        ...w,
        clean: normalize(w.word)
    })).filter(w => w.clean.length >= 2); // Filter out single letters if any

    if (processableWords.length === 0) return null;

    // 1b. Dedupe by normalized form (keep the first occurrence). This guarantees
    // a chapter with duplicate entries can never place the same answer twice in
    // one grid — which would otherwise show two clues with an identical answer.
    const seenClean = new Set<string>();
    const uniqueWords = processableWords.filter(w => {
        if (seenClean.has(w.clean)) return false;
        seenClean.add(w.clean);
        return true;
    });

    let bestLayout: PlacedWord[] | null = null;
    let bestScore = -Infinity;

    // 2. Try multiple attempts with random shuffling
    // We try enough times to almost guarantee a good structure
    const MAX_ATTEMPTS = 50; 

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        // Shuffle words to find new connection points
        const shuffled = [...uniqueWords].sort(() => Math.random() - 0.5);
        // Always try to start with a longer word to act as a "spine"
        shuffled.sort((a, b) => (Math.random() > 0.3) ? b.clean.length - a.clean.length : 0);

        const layout = generateLayout(shuffled);
        
        if (layout && layout.length > 0) {
            const score = calculateScore(layout);
            // We prefer layouts with MORE words placed, then compactness
            if (layout.length > (bestLayout?.length || 0) || (layout.length === (bestLayout?.length || 0) && score > bestScore)) {
                bestScore = score;
                bestLayout = layout;
            }
        }
    }

    // If we failed to place even 2 words connectedly after 50 tries, 
    // just place the single longest word so the game doesn't crash.
    if (!bestLayout || bestLayout.length === 0) {
        const longest = [...uniqueWords].sort((a, b) => b.clean.length - a.clean.length)[0];
        bestLayout = [{
            word: longest.clean,
            originalWord: longest.word,
            clue: longest.clue,
            row: 0,
            col: 0,
            direction: 'across'
        }];
    }

    return convertToGrid(bestLayout);
}

function generateLayout(wordList: {word: string, clue: string, clean: string}[]): PlacedWord[] {
    const placedWords: PlacedWord[] = [];
    const charMap: CharMap = new Map();
    const placedIndices = new Set<number>();

    // Place the first word at 0,0
    const first = wordList[0];
    placeWord(first, 0, 0, 'across', placedWords, charMap);
    placedIndices.add(0);

    // Try to place remaining words
    // We loop through the list multiple times because placing word C might enable word B later
    let addedAny = true;
    while (addedAny) {
        addedAny = false;
        for (let i = 1; i < wordList.length; i++) {
            if (placedIndices.has(i)) continue;

            const entry = wordList[i];
            const placement = findBestPlacement(entry.clean, charMap);
            
            if (placement) {
                placeWord(entry, placement.r, placement.c, placement.dir, placedWords, charMap);
                placedIndices.add(i);
                addedAny = true;
            }
        }
    }

    return placedWords;
}

function findBestPlacement(word: string, charMap: CharMap) {
    const candidates: { r: number, c: number, dir: 'across' | 'down' }[] = [];

    // Check every letter of the new word against every occupied cell in the grid
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        
        // Iterate over the grid map to find matching characters
        for (const [key, gridChar] of charMap.entries()) {
            if (gridChar === char) {
                const [rStr, cStr] = key.split(',');
                const r = parseInt(rStr);
                const c = parseInt(cStr);

                // Try placing 'across' intersecting at index i
                if (canPlace(word, r, c - i, 'across', charMap)) {
                    candidates.push({ r: r, c: c - i, dir: 'across' });
                }

                // Try placing 'down' intersecting at index i
                if (canPlace(word, r - i, c, 'down', charMap)) {
                    candidates.push({ r: r - i, c: c, dir: 'down' });
                }
            }
        }
    }

    if (candidates.length === 0) return null;

    // Pick a random valid placement to create variety in shape
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function canPlace(word: string, startR: number, startC: number, dir: 'across' | 'down', charMap: CharMap): boolean {
    // 1. Check bounds and immediate collisions
    for (let i = 0; i < word.length; i++) {
        const r = dir === 'across' ? startR : startR + i;
        const c = dir === 'across' ? startC + i : startC;
        const key = `${r},${c}`;
        const existing = charMap.get(key);

        // If cell is occupied, it MUST match the character
        if (existing && existing !== word[i]) return false;
    }

    // 2. Check adjacencies (Ensure we don't accidentally create invalid words side-by-side)
    for (let i = 0; i < word.length; i++) {
        const r = dir === 'across' ? startR : startR + i;
        const c = dir === 'across' ? startC + i : startC;
        const key = `${r},${c}`;
        const isIntersection = charMap.has(key);

        // If this exact cell was already filled (intersection), we skip neighbor checks for this cell
        // because the neighbors are valid for the existing word.
        if (isIntersection) continue;

        // For a NEWLY filled cell, check neighbors perpendicular to flow
        if (dir === 'across') {
            // Check Up/Down
            if (charMap.has(`${r-1},${c}`) || charMap.has(`${r+1},${c}`)) return false;
        } else {
            // Check Left/Right
            if (charMap.has(`${r},${c-1}`) || charMap.has(`${r},${c+1}`)) return false;
        }
    }

    // 3. Check Ends (Prevent extending existing words improperly)
    // Cell immediately before start
    const beforeR = dir === 'across' ? startR : startR - 1;
    const beforeC = dir === 'across' ? startC - 1 : startC;
    if (charMap.has(`${beforeR},${beforeC}`)) return false;

    // Cell immediately after end
    const afterR = dir === 'across' ? startR : startR + word.length;
    const afterC = dir === 'across' ? startC + word.length : startC;
    if (charMap.has(`${afterR},${afterC}`)) return false;

    return true;
}

function placeWord(entry: {word: string, clue: string, clean: string}, r: number, c: number, dir: 'across' | 'down', list: PlacedWord[], map: CharMap) {
    list.push({ 
        word: entry.clean, 
        originalWord: entry.word, // We store the original visual word (with spaces/Madda if needed) 
        clue: entry.clue, 
        direction: dir, 
        row: r, 
        col: c 
    });
    
    for (let i = 0; i < entry.clean.length; i++) {
        const cr = dir === 'across' ? r : r + i;
        const cc = dir === 'across' ? c + i : c;
        map.set(`${cr},${cc}`, entry.clean[i]);
    }
}

function calculateScore(layout: PlacedWord[]): number {
    if (layout.length === 0) return 0;
    
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    layout.forEach(p => {
        minR = Math.min(minR, p.row);
        maxR = Math.max(maxR, p.direction === 'down' ? p.row + p.word.length : p.row);
        minC = Math.min(minC, p.col);
        maxC = Math.max(maxC, p.direction === 'across' ? p.col + p.word.length : p.col);
    });

    const width = maxC - minC;
    const height = maxR - minR;
    const area = width * height;
    
    // Score = (Number of words * 100) - (Area size)
    // We want lots of words in a small space.
    return (layout.length * 500) - area; 
}

function convertToGrid(layout: PlacedWord[]): { grid: Grid, clues: { across: Clue[], down: Clue[] } } {
    // 1. Determine Bounds
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    layout.forEach(p => {
        minR = Math.min(minR, p.row);
        maxR = Math.max(maxR, p.direction === 'down' ? p.row + p.word.length - 1 : p.row);
        minC = Math.min(minC, p.col);
        maxC = Math.max(maxC, p.direction === 'across' ? p.col + p.word.length - 1 : p.col);
    });

    // Add Padding (Ensure at least 1 cell padding)
    const padding = 2;
    const rows = (maxR - minR) + 1 + (padding * 2); 
    const cols = (maxC - minC) + 1 + (padding * 2);

    // 2. Init Grid
    const grid: Grid = Array(rows).fill(null).map((_, r) => 
        Array(cols).fill(null).map((_, c) => ({
            row: r,
            col: c,
            value: '',
            isBlack: true,
        }))
    );

    // 3. Place Words & Generate Clues
    const acrossClues: Clue[] = [];
    const downClues: Clue[] = [];
    let clueCounter = 1;

    // Sort words by position (top-left to bottom-right) for correct numbering
    const startPositions = new Map<string, number>();
    
    // Normalize coordinates to be positive and inside grid
    const normalizedLayout = layout.map(p => ({
        ...p,
        gridR: p.row - minR + padding,
        gridC: p.col - minC + padding
    }));

    normalizedLayout.sort((a, b) => (a.gridR - b.gridR) || (a.gridC - b.gridC));

    normalizedLayout.forEach(p => {
        const key = `${p.gridR},${p.gridC}`;
        let num = startPositions.get(key);
        if (!num) {
            num = clueCounter++;
            startPositions.set(key, num);
        }

        const cells: {r: number, c: number}[] = [];
        
        // Determine the 'visual' characters from originalWord if lengths match
        // Note: originalWord might have spaces, but clean doesn't. 
        // For simplicity in the grid, we usually assume 1-to-1 mapping for crossword cells.
        // If original is "آب", clean is "اب". We put "آ" in the cell if we want visual fidelity,
        // BUT logic relies on normalized "ا".
        // To avoid conflict at intersections (e.g. 'آ' vs 'ا'), we stick to the NORMALIZED char for the grid value
        // but can use original for the clue hint if needed. 
        // Standard crossword rule: Normalized chars in grid (Alif for Alif-Madda).
        
        for (let i = 0; i < p.word.length; i++) {
            const r = p.direction === 'across' ? p.gridR : p.gridR + i;
            const c = p.direction === 'across' ? p.gridC + i : p.gridC;
            
            // Fill cell
            grid[r][c].value = p.word[i]; // Use normalized char
            grid[r][c].isBlack = false;
            
            if (i === 0) grid[r][c].clueNumber = num;
            
            cells.push({r, c});
        }

        const clueObj: Clue = {
            number: num,
            word: p.word,
            translation: p.clue,
            direction: p.direction,
            cells: cells,
            isStory: true
        };

        if (p.direction === 'across') acrossClues.push(clueObj);
        else downClues.push(clueObj);
    });

    return { grid, clues: { across: acrossClues, down: downClues } };
}
