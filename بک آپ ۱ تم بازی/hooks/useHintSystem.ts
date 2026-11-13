import { Language, PlayerState, Grid, Clue } from '../types';
import { gameServer } from '../utils/gameServer';

// We avoid importing the full game hook type to keep this independent
interface GameActions {
    grid: Grid | null;
    userGrid: string[][];
    clues: { across: Clue[]; down: Clue[] } | null;
    activeClue: Clue | null;
    selectedCell: { r: number; c: number } | null;
    matchScore: number;
    seconds: number;
    powerRevealedCells: Set<string>;
    setPowerRevealedCells: (s: Set<string>) => void;
    markAssisted: (keys: string[]) => void;
    setUserGrid: (g: string[][]) => void;
    updateSelection: (r: number, c: number) => void;
    setActiveClue: (c: Clue) => void;
    setDirection: (d: 'across' | 'down') => void;
}

export function useHintSystem(
    game: GameActions,
    player: PlayerState | null,
    setPlayer: (p: PlayerState | null) => void,
    handleWin: (score: number, seconds: number) => void,
    showToast: (msg: string, type?: 'success' | 'error') => void,
    setShowHintModal: (v: boolean) => void,
    language: Language
) {
    const isFA = language === 'fa';

    const handleRevealCell = async () => {
        if (!player || !game.selectedCell || !game.grid) {
            showToast(isFA ? 'لطفاً یک خانه انتخاب کنید!' : 'Please select a cell!', 'error');
            return;
        }
        if (player.coins < 20) {
            showToast(isFA ? 'سکه کافی ندارید!' : 'Not enough coins!', 'error');
            return;
        }

        const { r, c } = game.selectedCell;
        if (game.userGrid[r][c] === game.grid[r][c].value) {
            showToast(isFA ? 'این خانه قبلاً پر شده!' : 'This cell is already filled!', 'error');
            return;
        }

        setShowHintModal(false);

        // Charge first, server-side. If the server refuses we must not reveal:
        // the old code revealed and then subtracted locally, so a page reload
        // handed the coins straight back and the hint was effectively free.
        const spend = await gameServer.spendCoins('hint_letter');
        if (spend.status !== 'ok') {
            showToast(
                spend.status === 'insufficient'
                    ? (isFA ? 'سکه کافی ندارید!' : 'Not enough coins!')
                    : (isFA ? 'کسر سکه ناموفق بود. دوباره تلاش کنید.' : 'Could not charge coins. Try again.'),
                'error'
            );
            return;
        }
        setPlayer({ ...player, coins: spend.coins });

        // Reveal the letter
        const newG = game.userGrid.map(row => [...row]);
        newG[r][c] = game.grid[r][c].value;
        game.setUserGrid(newG);
        game.markAssisted([`${r},${c}`]);

        // Highlight the revealed cell (immutable update so React re-renders)
        game.setPowerRevealedCells(new Set([`${r},${c}`]));

        // DELAY: wait 2s so user can see the revealed letter
        setTimeout(() => {
            game.setPowerRevealedCells(new Set());

            const isComplete = game.grid!.every((row, rowIdx) =>
                row.every((cell, colIdx) => cell.isBlack || newG[rowIdx][colIdx] === cell.value)
            );

            if (isComplete) {
                game.setUserGrid([...newG]);
                setTimeout(() => { if (handleWin) handleWin(game.matchScore, game.seconds); }, 100);
                return;
            }

            game.setUserGrid([...newG]);

            // Find next empty cell
            let moved = false;
            if (game.activeClue && game.activeClue.cells) {
                const currentIdx = game.activeClue.cells.findIndex(cell => cell.r === r && cell.c === c);
                const nextEmpty = game.activeClue.cells.find((cell, idx) => idx > currentIdx && newG[cell.r][cell.c] !== game.grid![cell.r][cell.c].value);
                if (nextEmpty) {
                    game.updateSelection(nextEmpty.r, nextEmpty.c);
                    moved = true;
                }
            }

            if (!moved) {
                for (let row = 0; row < game.grid!.length; row++) {
                    for (let col = 0; col < game.grid![row].length; col++) {
                        if (!game.grid![row][col].isBlack && game.grid![row][col].value && newG[row][col] !== game.grid![row][col].value) {
                            game.updateSelection(row, col);
                            moved = true;
                            break;
                        }
                    }
                    if (moved) break;
                }
            }
        }, 2000);

        showToast(isFA ? `حرف نمایش داده شد! (-20 سکه)` : `Letter revealed! (-20 coins)`, 'success');
    };

    const handleRevealWord = async () => {
        if (!player || !game.activeClue || !game.grid) {
            showToast(isFA ? 'لطفاً یک کلمه انتخاب کنید!' : 'Please select a word!', 'error');
            return;
        }
        if (player.coins < 50) {
            showToast(isFA ? 'سکه کافی ندارید!' : 'Not enough coins!', 'error');
            return;
        }

        setShowHintModal(false);

        // Charge first, server-side (see handleRevealCell).
        const spend = await gameServer.spendCoins('hint_word');
        if (spend.status !== 'ok') {
            showToast(
                spend.status === 'insufficient'
                    ? (isFA ? 'سکه کافی ندارید!' : 'Not enough coins!')
                    : (isFA ? 'کسر سکه ناموفق بود. دوباره تلاش کنید.' : 'Could not charge coins. Try again.'),
                'error'
            );
            return;
        }
        setPlayer({ ...player, coins: spend.coins });

        // Reveal word
        const newG = game.userGrid.map(row => [...row]);
        const revealedSet = new Set<string>();
        const assistedKeys: string[] = [];

        game.activeClue.cells.forEach(cell => {
            const key = `${cell.r},${cell.c}`;
            if (newG[cell.r][cell.c] !== game.grid![cell.r][cell.c].value) assistedKeys.push(key);
            newG[cell.r][cell.c] = game.grid![cell.r][cell.c].value;
            revealedSet.add(key);
        });

        game.setUserGrid(newG);
        game.markAssisted(assistedKeys);
        revealedSet.forEach(key => game.powerRevealedCells.add(key));

        // DELAY: Wait 2s so user can see the word
        setTimeout(() => {
            revealedSet.forEach(key => game.powerRevealedCells.delete(key));

            const isComplete = game.grid!.every((row, rowIdx) =>
                row.every((cell, colIdx) => cell.isBlack || newG[rowIdx][colIdx] === cell.value)
            );

            if (isComplete) {
                game.setUserGrid([...newG]);
                setTimeout(() => { if (handleWin) handleWin(game.matchScore, game.seconds); }, 100);
                return;
            }

            game.setUserGrid([...newG]);

            // Find next unsolved clue
            if (game.clues) {
                const allClues = [...(game.clues.across || []), ...(game.clues.down || [])];
                for (const clue of allClues) {
                    const hasEmpty = clue.cells?.some(cell => newG[cell.r][cell.c] !== game.grid![cell.r][cell.c].value);
                    if (hasEmpty && clue.cells) {
                        const firstEmpty = clue.cells.find(cell => newG[cell.r][cell.c] !== game.grid![cell.r][cell.c].value);
                        if (firstEmpty) {
                            game.updateSelection(firstEmpty.r, firstEmpty.c);
                            game.setActiveClue(clue);
                            game.setDirection(clue.direction);
                            break;
                        }
                    }
                }
            }
        }, 2000);

        showToast(isFA ? `کلمه نمایش داده شد! (-50 سکه)` : `Word revealed! (-50 coins)`, 'success');
    };

    return { handleRevealCell, handleRevealWord };
}
