
import React, { useState, useEffect } from 'react';
import { Grid, Clue, WordDirection, Language, GameMode, PlayerState, AttackType, StoryBook, WorldMapCardRarity, WORLD_MAP_RARITY } from '../types';
import { CrosswordGrid } from './CrosswordGrid';
import { GameKeyboard } from './GameKeyboard';
import { ActiveClueBar } from './ActiveClueBar';
import { BattleControls } from './BattleControls';
import { MultiplayerHeader } from './MultiplayerHeader';
import { GameFeedback } from './GameFeedback';
import { ClueEmojiKnob } from './ClueEmojiKnob';
import { GameDeck } from './GameDeck';
import { PosterTopBar } from './Header';
import { multiplayer } from '../utils/multiplayer';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';
import { preloadAndDecodeImage } from '../utils/assetPreloader';
import { computeActiveDeckBuffs } from '../utils/progression';
import { gameServer } from '../utils/gameServer';
import { Swords, Heart, Zap, Flame, Target, Skull, Shield, Timer, TrendingUp, AlertTriangle, Snowflake, EyeOff } from 'lucide-react';

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const duelClock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

interface GameViewProps {
    grid: Grid;
    userGrid: string[][];
    clues: { across: Clue[], down: Clue[] };
    selectedCell: { r: number, c: number } | null;
    activeClue: Clue | null;
    direction: WordDirection;
    language: Language;
    player: PlayerState;
    localScore: number; 
    gameWon: boolean;
    gameLost: boolean;
    combo: number;
    seconds: number;
    timeLimit?: number; // NEW PROP: Optional Time Limit for Tower Mode
    myFilledCells: Set<string>;
    heroHp: number;
    monsterHp: number;
    monsterRage?: number; 
    isFinishingMove?: boolean;
    powerMeter: number;
    powerRevealedCells: Set<string>; 
    usePowerRevealCell: () => void;
    usePowerRevealWord: () => void;
    isHeroHit: boolean;
    isMonsterHit: boolean;
    isMonsterAttacking: boolean; 
    isHeroHeal: boolean;
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
    onSelect: (r: number, c: number, dir?: WordDirection) => void;
    onNextClue: () => void;
    onPrevClue: () => void;
    onToggleDirection: () => void;
    canToggle: boolean;
    onHint: () => void;
    onShowToast?: (msg: string, type?: 'success' | 'error') => void; // NEW: Show toast messages
    isMultiplayer: boolean;
    isArena?: boolean;
    gameMode: GameMode;
    opponent: any;
    opponentScore: number;
    opponentProgress: number;
    opponentFilled: Set<string>;
    setOpponentFilled: React.Dispatch<React.SetStateAction<Set<string>>>;
    setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>;
    onZapCell: (r: number, c: number) => void;
    mana: number;
    setMana: React.Dispatch<React.SetStateAction<number>>;
    isFrozen: boolean;
    isBlinded: boolean;
    spawnFloatingEmoji: (e: string) => void;
    floatingEmojis: {id: number, emoji: string}[];
    selectedBook: StoryBook | null;
    currentChapterIndex: number | null;
    towerFloor?: number; // NEW PROP: Current Tower Floor
    towerLives?: number; // NEW PROP: Tower lives
    towerMaxLives?: number; // NEW PROP: Tower max lives
    towerLoot?: number; // NEW PROP: Tower loot
    towerHasShield?: boolean; // NEW PROP: Tower shield status
    wrongAnswerCount?: number; // For grid shake animation
    entranceKey?: number; // triggers cell wave + focus on change
    worldMapAccent?: string; // accent color for world map game backgrounds
    worldMapBgImage?: string | null; // player photo as grid background
    worldMapWordCount?: number; // word count for world map rarity indicator
    category?: string; // display label for multiplayer opponent header
    gridSize?: number; // grid size label for multiplayer opponent header
    /** Poster screen: the printed top bar's own hit areas (profile, home, shop). */
    onProfileClick?: () => void;
    onHomeClick?: () => void;
    onOpenShop?: () => void;
    /** Async duel replay: the live verdict number the server will judge this run by. */
    duelLive?: {
        points: number; typed: number; seconds: number; mistakes: number; assisted: number;
        opponentPoints?: number | null; opponentName?: string;
    } | null;
}

// ─── World Map Card Rarity Live Indicator ─────────────────────────
// Shows the best card rarity still achievable during gameplay.
// Rules:
//   Platinum (4) = score >= words*90  AND  time <= words*12 sec
//   Gold     (3) = score >= words*90  (speed doesn't matter)
//   Silver   (2) = time  <= words*12 sec (score doesn't matter)
//   Bronze   (1) = fallback
// Once the speed window passes, Silver and Platinum are lost.
// Score only ever increases, so Gold is always achievable.

const RARITY_ORDER: WorldMapCardRarity[] = [1, 2, 3, 4];

function calcCurrentRarity(score: number, seconds: number, wordCount: number): WorldMapCardRarity {
  const fast = seconds <= wordCount * 12;
  const goodScore = score >= wordCount * 90;
  if (goodScore && fast) return 4;
  if (goodScore) return 3;
  if (fast) return 2;
  return 1;
}

function calcMaxRarity(seconds: number, wordCount: number): WorldMapCardRarity {
  // If still within the speed window → Platinum is possible, thus Silver too
  if (seconds <= wordCount * 12) return 4;
  // Speed window lost → best is Gold (score is always improvable)
  return 3;
}

interface RarityIndicatorProps {
  matchScore: number;
  seconds: number;
  wordCount: number;
  language: Language;
  accent: string;
}

const WorldMapRarityIndicator: React.FC<RarityIndicatorProps> = ({
  matchScore, seconds, wordCount, language, accent,
}) => {
  const isFA = language === 'fa';
  const currentRarity = calcCurrentRarity(matchScore, seconds, wordCount);
  const maxRarity = calcMaxRarity(seconds, wordCount);

  // Time remaining fraction for the speed window (wordCount * 12 seconds)
  const fastThreshold = wordCount * 12;
  const timeRemaining = Math.max(0, fastThreshold - seconds);
  const timeFraction = Math.min(1, seconds / fastThreshold);

  return (
    <div className="absolute top-2 right-2 z-50 flex items-stretch gap-1.5">
      {/* Rarity badges — one per tier */}
      {RARITY_ORDER.map((rarity) => {
        const info = WORLD_MAP_RARITY[rarity];
        const isAchievable = rarity <= maxRarity;
        const isCurrent = rarity === currentRarity;
        const isMax = rarity === maxRarity;

        return (
          <div
            key={rarity}
            className="flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition-all duration-500"
            style={{
              background: isAchievable
                ? `${info.color}18`
                : 'rgba(255,255,255,0.03)',
              border: isCurrent
                ? `1.5px solid ${info.color}`
                : '1px solid transparent',
              boxShadow: isCurrent
                ? `0 0 10px ${info.color}40`
                : 'none',
              opacity: isAchievable ? 1 : 0.3,
            }}
          >
            {/* Rarity dot */}
            <div
              className="rounded-full transition-all duration-500"
              style={{
                width: isCurrent ? '8px' : '6px',
                height: isCurrent ? '8px' : '6px',
                background: isAchievable ? info.color : 'rgba(255,255,255,0.15)',
                boxShadow: isCurrent && isAchievable ? `0 0 6px ${info.color}` : 'none',
              }}
            />
            {/* Rarity label */}
            <span
              className="font-black tracking-tight transition-all duration-500"
              style={{
                fontSize: isCurrent ? '6px' : '5px',
                color: isAchievable ? info.color : 'rgba(255,255,255,0.2)',
              }}
            >
              {isFA ? info.fa : info.en}
            </span>
            {/* Small status text */}
            {isCurrent && (
              <span
                className="text-[4px] font-bold tracking-widest"
                style={{ color: info.color }}
              >
                {isFA ? 'اکنون' : 'NOW'}
              </span>
            )}
            {isMax && !isCurrent && (
              <span
                className="text-[4px] font-bold tracking-widest"
                style={{ color: info.color }}
              >
                {isFA ? 'حداکثر' : 'MAX'}
              </span>
            )}
          </div>
        );
      })}

      {/* Time remaining ring */}
      <div className="flex flex-col items-center justify-center rounded-lg px-1.5 py-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" className="mb-0.5">
          {/* Background circle */}
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {/* Progress circle */}
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke={timeFraction >= 1 ? '#ef4444' : timeFraction > 0.8 ? '#f59e0b' : accent}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 8}`}
            strokeDashoffset={`${2 * Math.PI * 8 * (1 - timeFraction)}`}
            transform="rotate(-90 10 10)"
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Clock icon inside */}
          <text x="10" y="13" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9">⏱</text>
        </svg>
        <span className="text-[5px] font-bold whitespace-nowrap" style={{ color: timeRemaining > 0 ? 'rgba(255,255,255,0.5)' : '#ef4444' }}>
          {timeRemaining > 0
            ? `${Math.ceil(timeRemaining)}s`
            : isFA ? 'تمام' : 'Passed'}
        </span>
      </div>
    </div>
  );
};

export const GameView: React.FC<GameViewProps> = (props) => {
    const { 
        grid, userGrid, clues, selectedCell, activeClue, direction, language, 
        gameWon, gameLost, combo, localScore, heroHp, monsterHp, monsterRage, powerMeter,
        powerRevealedCells, usePowerRevealCell, usePowerRevealWord,
        isHeroHit, isMonsterHit, isMonsterAttacking, isHeroHeal, isFinishingMove,
        onKeyPress, onBackspace, onSelect, onNextClue, onPrevClue, onToggleDirection, canToggle, onHint, onShowToast,
        isMultiplayer, isArena, gameMode, opponent, opponentScore, opponentFilled, setOpponentFilled, onZapCell,
        mana, setMana, isFrozen, isBlinded, spawnFloatingEmoji, floatingEmojis, player,
        selectedBook, currentChapterIndex,
        timeLimit, towerFloor, towerLives, towerMaxLives, towerLoot, towerHasShield, entranceKey, worldMapAccent, worldMapBgImage,
	        worldMapWordCount, seconds
	    } = props;
    const duelLive = props.duelLive;

    const isFA = language === 'fa';
    const storyChapter = currentChapterIndex && selectedBook
        ? (selectedBook.chapters?.find(c => String(c.id) === String(currentChapterIndex)) ||
           [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS].find(b => b.id === selectedBook.id)?.chapters?.find(c => String(c.id) === String(currentChapterIndex)))
        : undefined;
    // The clay console artwork is the board's real background only in plain play;
    // story, tower and world-map chapters keep their own scenes.
    const clayConsole = !storyChapter && !towerFloor && !worldMapAccent;
    
    // Slash direction toggle state (0 or 1) to alternate hit animation
    const [slashDirection, setSlashDirection] = useState(0);
    
    // Tower lives animation state
    const [prevTowerLives, setPrevTowerLives] = useState<number | undefined>(towerLives);
    const [livesShaking, setLivesShaking] = useState(false);

    // Detect when tower lives decrease
    useEffect(() => {
        if (towerLives !== undefined && prevTowerLives !== undefined && towerLives < prevTowerLives) {
            // Lives decreased - trigger shake animation
            setLivesShaking(true);
            setTimeout(() => setLivesShaking(false), 500);
        }
        setPrevTowerLives(towerLives);
    }, [towerLives]);
    
    // Random Hit Text Logic
    const HIT_WORDS_FA = ["بوم!", "گرومب!", "شپلق!", "آخ!", "ضربه!", "هوار!", "تـرق!", "خاش!"];
    const HIT_WORDS_EN = ["POW!", "BAM!", "WHAM!", "SMASH!", "SLASH!", "CRUSH!", "BANG!", "ZAP!"];
    
    const [hitWord, setHitWord] = useState("");
    const [hitRotation, setHitRotation] = useState(0);

    useEffect(() => {
        if (isMonsterHit) {
            // Toggle direction randomly or flip flop
            setSlashDirection(prev => (prev === 0 ? 1 : 0));
            
            // Randomize Hit Word and Rotation
            const words = isFA ? HIT_WORDS_FA : HIT_WORDS_EN;
            setHitWord(words[Math.floor(Math.random() * words.length)]);
            setHitRotation(Math.floor(Math.random() * 60) - 30); // Random rotation between -30 and 30 degrees
        }
    }, [isMonsterHit, isFA]);

    // Auto-select first clue if none is active (for Casual Mode)
    useEffect(() => {
        if (!activeClue && clues && !gameWon && !gameLost) {
            const firstClue = clues.across[0] || clues.down[0];
            if (firstClue && onSelect) {
                // Auto-select first cell of first clue
                setTimeout(() => {
                    onSelect(firstClue.cells[0].r, firstClue.cells[0].c, firstClue.direction);
                }, 50);
            }
        }
    }, [activeClue, clues, gameWon, gameLost]);

    const handleAttack = (type: AttackType) => {
        if (!opponent) return;
        const discountPct = computeActiveDeckBuffs(gameServer.getLocalEconomyState()).onlineAttackDiscountPct || 0;
        const costs = {
            erase: Math.max(25, Math.round(40 * (1 - discountPct / 100))),
            blind: Math.max(40, Math.round(60 * (1 - discountPct / 100))),
            freeze: Math.max(65, Math.round(100 * (1 - discountPct / 100))),
        };
        if (mana >= costs[type]) {
            if (type === 'erase') {
                // `opponentFilled` now holds every cell the opponent has filled, which can
                // include cells we filled too (both boards carry the same letters). Erasing
                // one of those also wipes OUR letter, so prefer cells that are the opponent's
                // alone. Never refuse to fire though: if every remaining target is shared,
                // the shared ones are still legitimate — the cell is genuinely filled on the
                // opponent's board, and whoever re-fills it first wins the race.
                const allTargets = Array.from(opponentFilled);
                const theirsOnly = allTargets.filter(k => !props.myFilledCells.has(k));
                const filledList = theirsOnly.length > 0 ? theirsOnly : allTargets;
                if (filledList.length > 0) {
                    const targetStr = filledList[Math.floor(Math.random() * filledList.length)] as string;
                    const [r, c] = targetStr.split(',').map(Number);
                    multiplayer.sendCellReset(player.id, r, c);
                    onZapCell(r, c);
                    setOpponentFilled(prev => {
                        const next = new Set(prev);
                        next.delete(targetStr);
                        return next;
                    });
                    // Also clear the cell from our own userGrid — since opponent's letters now
                    // get written there (via handleWordSolved in battle mode too), erasing
                    // must remove the letter so it doesn't stay as a "green" filled cell.
                    props.setUserGrid(prev => {
                        const newG = prev.map(row => [...row]);
                        newG[r][c] = '';
                        return newG;
                    });
                    setMana(m => m - costs[type]);
                }
            } else {
                setMana(m => m - costs[type]);
                const atkEmoji = type === 'freeze' ? '❄️' : '👁️‍🗨️';
                spawnFloatingEmoji(atkEmoji);
                multiplayer.sendAttack(opponent.id, type);
            }
        }
    };

    // Timer Display Logic
    const remainingTime = timeLimit ? Math.max(0, timeLimit - props.seconds) : 0;
    const isLowTime = timeLimit ? remainingTime < 30 : false;
    
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- MONSTER VISUALS & EFFECTS ---
    // Use the chapter-specific avatar if available, otherwise fallback
    const monsterImgUrl = storyChapter?.monsterAvatar || "https://cdn-icons-png.flaticon.com/512/3799/3799971.png"; 
    // Fallback if image fails to load
    const fallbackImgUrl = "https://cdn-icons-png.flaticon.com/512/10003/10003204.png";

    useEffect(() => {
        if (storyChapter?.image) void preloadAndDecodeImage(storyChapter.image);
        if (storyChapter?.monsterAvatar) void preloadAndDecodeImage(storyChapter.monsterAvatar);
        if (props.worldMapBgImage) void preloadAndDecodeImage(props.worldMapBgImage);
    }, [storyChapter?.image, storyChapter?.monsterAvatar, props.worldMapBgImage]);

    const getMonsterEffects = () => {
        let containerClass = "transition-all duration-300 ease-out transform";
        let imageStyle: React.CSSProperties = { transition: 'all 0.3s ease' };
        let showZzz = false;
        let showSteam = false;

        // 1. Critical Events
        if (isFinishingMove) {
            containerClass += " animate-monster-death opacity-50";
            imageStyle.filter = "grayscale(100%) brightness(40%)";
        } else if (isMonsterAttacking) {
            containerClass += " scale-125 z-50 drop-shadow-[0_0_20px_rgba(225,29,72,0.8)]";
            imageStyle.filter = "saturate(200%) brightness(120%)";
        } else if (isMonsterHit) {
            containerClass += " animate-monster-hit";
            imageStyle.filter = "brightness(300%) contrast(200%) sepia(100%) hue-rotate(-50deg)"; // Flash effect
        } 
        // 2. Idle State Based on Rage
        else if (monsterRage !== undefined) {
            if (monsterRage < 30) { // Sleeping/Calm
                imageStyle.filter = "grayscale(10%)"; // Removed brightness reduction to avoid black look
                showZzz = true;
            } else if (monsterRage > 70) { // Furious
                containerClass += " animate-shake";
                imageStyle.filter = "saturate(150%) hue-rotate(-20deg) drop-shadow(0 0 5px red)";
                showSteam = true;
            }
        }

        return { containerClass, imageStyle, showZzz, showSteam };
    };

    const monsterFX = getMonsterEffects();

    /* The mockup hangs the clue plate off the bottom of the board's own clay
       base, so in console mode it leaves the keyboard tray and sits under the
       board — one machine, then the keys as a separate tray. */
    const clueBar = (
        <ActiveClueBar 
            activeClue={activeClue} 
            language={language} 
            onNext={onNextClue} 
            onPrev={onPrevClue} 
            canToggle={canToggle} 
            onToggle={onToggleDirection} 
            isBlinded={isBlinded} 
            clay={clayConsole}
            poster={clayConsole}
            online={isMultiplayer}
            knob={clayConsole && isMultiplayer && !gameWon && !gameLost
                ? <ClueEmojiKnob playerId={player.id} spawnFloatingEmoji={spawnFloatingEmoji} />
                : null}
        />
    );

    /* The three pieces fill the screen instead of sitting inside a fixed 4:5
       stage: the bar is glued to the top edge, the deck (clue slip + keys, one
       sprite) to the bottom edge, and the board frame is the only thing between
       them, so the leftover height becomes the two gaps and grows or shrinks
       with the device. Sprites keep their own aspect ratios, so nothing is
       stretched; the board now spans the full column instead of 61% of a stage.

       the frame sprite still carries the 7x7 grid it was printed with plus an
       ivory margin (paper 17..268 x 19..254, printed grid 37..256 x 27..247 of
       its 294x274 crop), so the live sheet covers exactly that printed rect:
       its paper and ink land on the print and the margin keeps showing the
       frame's own paper. */
    if (clayConsole) {
        return (
            <div className="fixed inset-0 z-[90] overflow-hidden bg-[#C08E68]">
                {/* Only the top 1000px of the 1792px-tall render has furniture
                    in it; the rest is a bare tabletop, so covering the whole
                    file leaves the band under the keyboard empty. Sizing the
                    backdrop against that 1024×1000 scene keeps the room in
                    both bands above and below the artwork. */}
                <img
                    src="/images/game/room-bg.webp"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="cg-room-bg absolute top-0 left-0 h-auto max-w-none select-none pointer-events-none"
                />

                <div className="cg-console-col relative z-10 select-none">
                    {/* the printed slot bar's hollows: avatar, home, flip, bulb,
                        dial, score pill, purse */}
                    <div className="w-full shrink-0">
                        <PosterTopBar
                            fill
                            language={language}
                            player={player}
                            seconds={seconds}
                            score={localScore}
                            opponent={opponent}
                            opponentScore={opponentScore}
                            onProfileClick={props.onProfileClick}
                            onHomeClick={props.onHomeClick}
                            onOpenShop={props.onOpenShop}
                            onHint={onHint}
                            canToggleDirection={canToggle}
                            onToggleDirection={onToggleDirection}
                        />
                    </div>

                    {/* the middle band: the board takes all the width the column
                        has, and the two gaps around it absorb the rest of the
                        height, so the board reads as the centre of the screen */}
                    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                        <div className="relative w-full shrink-0" style={{ aspectRatio: '294 / 274' }}>
                            {/* the board's clay frame; it carries the printed
                                7x7 grid and its ivory paper margin, so the live
                                sheet sits exactly on the printed grid rect */}
                            <img
                                src="/images/game/board-frame.webp"
                                alt=""
                                aria-hidden="true"
                                draggable={false}
                                loading="eager"
                                decoding="sync"
                                fetchPriority="high"
                                className="absolute inset-0 h-full w-full select-none pointer-events-none"
                            />

                            <div
                                className="cg-poster-grid absolute overflow-hidden"
                                style={{
                                    left: '12.585%',
                                    top: '9.854%',
                                    width: '74.49%',
                                    height: '80.292%',
                                    backgroundColor: '#DEC7AC',
                                }}
                            >
                            <CrosswordGrid
                                grid={grid}
                                loading={false}
                                userGrid={userGrid}
                                onCellChange={() => {}}
                                selectedCell={selectedCell}
                                direction={direction}
                                onSelect={(r, c, d) => !isFrozen && !gameWon && !gameLost && onSelect(r, c, d)}
                                activeClue={activeClue}
                                language={language}
                                opponentFilled={opponentFilled}
                                clues={clues}
                                powerRevealedCells={powerRevealedCells}
                                wrongAnswerCount={props.wrongAnswerCount || 0}
                                entranceKey={entranceKey}
                                bare
                                fitPadding={0}
                            />

                            {floatingEmojis?.length > 0 && (
                                <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
                                    {floatingEmojis.slice(-10).map(fe => {
                                        const seed = ((fe.id * 9301 + 49297) % 233280) / 233280;
                                        const drift = -10 + seed * 20;
                                        const angle = -20 + seed * 40;
                                        const startScale = 0.5 + seed * 0.7;
                                        return (
                                            <span
                                                key={fe.id}
                                                className="absolute text-3xl drop-shadow-xl"
                                                style={{
                                                    left: `${24 + drift}%`,
                                                    bottom: '8%',
                                                    animation: 'emoji-balloon 2.8s ease-out forwards',
                                                    '--emoji-angle': `${angle}deg`,
                                                    '--emoji-start-scale': `${startScale}`,
                                                } as React.CSSProperties}
                                            >
                                                {fe.emoji}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {isFrozen && (
                                <div
                                    className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center animate-in fade-in"
                                    style={{ backgroundColor: 'rgba(122,164,178,.30)', backdropFilter: 'blur(2px)' }}
                                >
                                    <Snowflake size={28} className="animate-pulse" style={{ color: '#3C545A' }} />
                                </div>
                            )}
                            </div>
                        </div>
                    </div>

                    {/* the clue slip and the key deck are one crop (504x260),
                        so they sit on the bottom edge as a single piece */}
                    <div className="w-full shrink-0" style={{ aspectRatio: '504 / 260' }}>
                        <GameDeck
                            language={language}
                            activeClue={activeClue}
                            isBlinded={isBlinded}
                            canToggle={canToggle}
                            onPrev={onPrevClue}
                            onNext={onNextClue}
                            onToggle={onToggleDirection}
                            onKeyPress={onKeyPress}
                            onHint={onHint}
                            isMultiplayer={isMultiplayer || !!isArena}
                            isArena={!!isArena}
                            onShowToast={(msg) => onShowToast?.(msg, 'error')}
                        />
                    </div>
                </div>

                <style>{`
                    @keyframes emoji-balloon {
                        0% {
                            transform: translateY(0) scale(var(--emoji-start-scale, 0.7)) rotate(var(--emoji-angle, 0deg));
                            opacity: 1;
                        }
                        25% {
                            transform: translateY(-50px) scale(1.2) rotate(calc(var(--emoji-angle, 0deg) + 10deg));
                            opacity: 1;
                        }
                        60% {
                            transform: translateY(-160px) scale(1.7) rotate(calc(var(--emoji-angle, 0deg) - 5deg));
                            opacity: 0.8;
                        }
                        100% {
                            transform: translateY(-300px) scale(2.4) rotate(calc(var(--emoji-angle, 0deg) + 5deg));
                            opacity: 0;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <div className={`w-full h-full flex-1 min-h-0 flex flex-col items-center relative overflow-hidden transition-all duration-300 ${isHeroHit ? 'animate-shake' : ''}`}>
                
                {/* HAZARD OVERLAYS */}
                {isFrozen && (
                    <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center animate-in fade-in" style={{ backgroundColor: 'rgba(122,164,178,.22)', backdropFilter: 'blur(2px)' }}>
                        <div className="cg-paper p-4 rounded-3xl flex flex-col items-center animate-bounce" style={{ borderWidth: 2, borderStyle: 'solid', borderColor: '#7FA0A8', boxShadow: '0 18px 30px -20px rgba(30,50,55,.85)' }}>
                            <Snowflake size={48} className="mb-2" style={{ color: '#4E6B72' }} />
                            <span className="font-black text-xl uppercase tracking-widest" style={{ color: '#3C545A' }}>{isFA ? 'یخ زده!' : 'FROZEN!'}</span>
                        </div>
                    </div>
                )}
                {/* Blinded effect - only hides clues, not the whole screen */}

                {/* DAMAGE VIGNETTE */}
                <div className={`absolute inset-0 z-[55] pointer-events-none transition-opacity duration-300 ${isHeroHit ? 'opacity-60' : 'opacity-0'}`}
                    style={{ background: 'radial-gradient(circle, transparent 50%, rgba(239, 68, 68, 0.6) 100%)' }}></div>

                {/* DUEL VERDICT — the number the server judges this replay by */}
                {duelLive && (
                    <div
                        dir="rtl"
                        className="absolute top-1 left-1 z-40 rounded-2xl px-2.5 py-1.5 pointer-events-none"
                        style={{
                            backgroundColor: 'rgba(246,241,231,.94)',
                            backgroundImage: 'var(--tex-paper)',
                            backgroundSize: '200px 200px',
                            backgroundBlendMode: 'multiply',
                            border: '1px solid rgba(142,78,55,.32)',
                            boxShadow: '0 1px 0 rgba(255,255,255,.8) inset, 0 10px 20px -16px rgba(70,45,30,.7)',
                        }}
                    >
                        <p className="text-[9px] font-black leading-none mb-1" style={{ color: '#8E4E37' }}>⚔️ امتیاز داوری</p>
                        <div className="flex items-end gap-1.5">
                            <span className="text-lg font-black tabular-nums leading-none" style={{ color: 'var(--ink)' }}>{toFa(duelLive.points)}</span>
                            <span className="text-[9px] font-bold tabular-nums leading-none" style={{ color: 'var(--ink-2)' }}>
                                {toFa(duelLive.typed)} خانه · {toFa(duelClock(duelLive.seconds))}
                                {duelLive.mistakes > 0 && ` · ${toFa(duelLive.mistakes)} غلط`}
                                {duelLive.assisted > 0 && ` · ${toFa(duelLive.assisted)} کمک`}
                            </span>
                        </div>
                        {typeof duelLive.opponentPoints === 'number' && (
                            <p className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: 'var(--ink-3)' }}>
                                {duelLive.opponentName || 'حریف'}: {toFa(duelLive.opponentPoints)}
                            </p>
                        )}
                    </div>
                )}

                {/* BACKGROUND */}
                {storyChapter && (
                    <div className="absolute inset-0 z-0 pointer-events-none bg-[#1a1614]">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-1000 blur-[2px]"
                            style={{ backgroundImage: `url(${storyChapter.image})` }}
                        ></div>
                        <div
                            className="absolute inset-0"
                            style={{ backgroundImage: 'linear-gradient(180deg, rgba(26,22,20,.94) 0%, rgba(26,22,20,.55) 45%, rgba(26,22,20,.92) 100%)' }}
                        />
                    </div>
                )}

                {/* TOWER MODE BACKGROUND - Lighter */}
                {towerFloor && !worldMapAccent && (
                    <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: 'var(--paper-2)' }}>
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(160deg,#FBF4E6 0%,#F1E3CB 55%,#E9D7B9 100%)' }} />
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(142,78,55,.6) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                    </div>
                )}

                {/* WORLD MAP (LEGEND) BACKGROUND — player photo */}
                {worldMapAccent && !storyChapter && !towerFloor && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* Photo background */}
                        <div
                            className="absolute inset-0 bg-cover bg-center scale-105 opacity-25 transition-all duration-700"
                            style={{
                                backgroundImage: worldMapBgImage ? `url(${worldMapBgImage})` : undefined,
                                filter: 'blur(4px) brightness(0.5)',
                            }}
                        />
                        {/* Accent gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: worldMapBgImage
                                    ? `linear-gradient(180deg, ${worldMapAccent}30 0%, transparent 40%, transparent 70%, #1A1614 100%)`
                                    : `
                                        radial-gradient(ellipse at 50% 0%, ${worldMapAccent}18 0%, transparent 60%),
                                        radial-gradient(ellipse at 50% 100%, ${worldMapAccent}0A 0%, transparent 50%)
                                    `,
                            }}
                        />
                        {/* Warm veil for text readability */}
                        <div
                            className="absolute inset-0"
                            style={{ backgroundImage: 'linear-gradient(180deg, rgba(26,22,20,.55) 0%, rgba(26,22,20,.18) 45%, rgba(26,22,20,.8) 100%)' }}
                        />
                    </div>
                )}

                {/* WORLD MAP CARD RARITY LIVE INDICATOR */}
                {worldMapAccent && worldMapWordCount && worldMapWordCount > 0 && !gameWon && !gameLost && (
                    <WorldMapRarityIndicator
                        matchScore={localScore}
                        seconds={seconds}
                        wordCount={worldMapWordCount}
                        language={language}
                        accent={worldMapAccent}
                    />
                )}

                {/* TOWER HUD - MOVED TO HEADER */}

                {/* TIMER HUD - REMOVED: Now shown in header */}

                {/* === BATTLE HUD (RPG STYLE) — smaller on mobile === */}
                {storyChapter && !gameLost && (
                    <div className="w-full px-3 pt-2 sm:pt-3 z-40 relative flex flex-col gap-1.5 sm:gap-2">
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                            {/* --- HERO SECTION --- */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                <div className={`relative shrink-0 w-11 h-11 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-[#FBF1E4] z-10 bg-[#E7DCC8] flex items-center justify-center overflow-hidden transition-transform ${isHeroHit ? 'scale-90 border-red-500' : ''}`} style={{ boxShadow: '0 1px 0 rgba(255,255,255,.55) inset, 0 -2px 0 rgba(80,45,30,.3) inset, 0 10px 20px -12px rgba(86,52,33,.85)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8FA8BE] to-[#5A768D] opacity-80"></div>
                                    <span className="relative z-10 text-xl sm:text-3xl drop-shadow-md">{player.avatar}</span>
                                    <div className="absolute top-0 w-full h-1/2 bg-white/20 rounded-t-full"></div>
                                </div>
                                <div className="flex flex-col w-full max-w-[100px] sm:max-w-[140px]">
                                    <div className="flex justify-between items-end px-1 mb-0.5">
                                        <span className="text-[8px] sm:text-[10px] font-black tracking-wider" style={{ color: 'var(--ink-2)' }}>{player.name}</span>
                                        <span className="text-[7px] sm:text-[9px] font-bold" style={{ color: '#5E6E52' }}>{Math.ceil(heroHp)}%</span>
                                    </div>
                                    <div className="h-2 sm:h-4 rounded sm:rounded-lg relative overflow-hidden" style={{ backgroundColor: 'rgba(36,26,20,.14)', border: '1px solid rgba(36,26,20,.22)' }}>
                                        <div
                                            className="absolute top-0 left-0 h-full transition-all duration-500 ease-out flex items-center"
                                            style={{ width: `${heroHp}%`, background: 'linear-gradient(90deg,#6E8160,#A8C09B)' }}
                                        >
                                            <div className="glass-bar w-full h-full"></div>
                                        </div>
                                        {isHeroHit && <div className="absolute inset-0 bg-red-500/50 animate-pulse"></div>}
                                    </div>
                                </div>
                            </div>
                            {/* --- VS INDICATOR --- */}
                            <div className="shrink-0 flex flex-col items-center justify-center -mt-3 sm:-mt-4">
                                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded sm:rounded-lg rotate-45 flex items-center justify-center z-20" style={{ background: 'var(--clay-shell)', border: '1px solid #8E4E37', boxShadow: 'inset 0 1px 0 rgba(255,226,204,.5), inset 0 -2px 0 rgba(58,30,18,.3), 0 6px 12px -8px rgba(70,40,25,.9)' }}>
                                    <div className="-rotate-45 font-black text-[10px] sm:text-xs" style={{ color: '#FFF6EC' }}>VS</div>
                                </div>
                            </div>
                            {/* --- MONSTER SECTION --- */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 flex-row-reverse">
                                <div className={`relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 z-10 transition-all ${monsterFX.containerClass}`}>
                                    <div className="w-full h-full rounded-full border-4 border-[#9E5A50] bg-[#EFE7D8] overflow-hidden relative z-10" style={{ boxShadow: '0 10px 20px -14px rgba(86,52,33,.9)' }}>
                                        <img 
                                            src={monsterImgUrl} 
                                            alt="Monster" 
                                            className="w-full h-full object-cover relative z-10"
                                            style={monsterFX.imageStyle}
                                            onError={(e) => { e.currentTarget.src = fallbackImgUrl; }}
                                        />
                                    </div>
                                    {monsterRage !== undefined && monsterRage > 50 && (
                                        <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-30 pointer-events-none"></div>
                                    )}
                                    {monsterFX.showZzz && !isMonsterHit && !isFinishingMove && (
                                        <div className="absolute -top-3 -right-3 z-[20] px-2 py-1 rounded-2xl rounded-bl-none text-xs font-black animate-bounce" style={{ backgroundColor: '#FBF4E8', color: 'var(--ink)', border: '1px solid rgba(142,78,55,.35)', boxShadow: '0 10px 18px -12px rgba(70,40,25,.9)' }}>Zzz...</div>
                                    )}
                                    {(isMonsterHit) && !isFinishingMove && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                            <div 
                                                className={`h-2 w-full bg-white absolute shadow-[0_0_15px_white,0_0_30px_cyan] animate-slash-fast`}
                                                style={{ 
                                                    transform: slashDirection === 0 ? 'rotate(45deg)' : 'rotate(-45deg)',
                                                    clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)'
                                                }}
                                            ></div>
                                        </div>
                                    )}
                                    {isFinishingMove && (
                                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                            <div className="h-1 bg-white absolute rotate-45 w-full animate-slash-fast [animation-delay:0s]" style={{clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)'}}></div>
                                            <div className="h-1 bg-white absolute -rotate-45 w-full animate-slash-fast [animation-delay:0.1s]" style={{clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)'}}></div>
                                            <div className="h-1 bg-white absolute rotate-90 w-full animate-slash-fast [animation-delay:0.2s]" style={{clipPath: 'polygon(0 50%, 50% 0, 100% 50%, 50% 100%)'}}></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col w-full max-w-[100px] sm:max-w-[140px] items-end">
                                    <div className="flex justify-between items-end px-1 mb-0.5 w-full flex-row-reverse">
                                        <span
                                            className="text-[8px] sm:text-[10px] font-black tracking-wider truncate max-w-[62px] sm:max-w-[96px]"
                                            title={storyChapter?.monsterName || 'Boss'}
                                            style={{ color: '#9E5A50' }}
                                        >
                                            {storyChapter?.monsterName || 'Boss'}
                                        </span>
                                        <span className="text-[7px] sm:text-[9px] font-bold" style={{ color: '#9E5A50' }}>{Math.ceil(monsterHp)}%</span>
                                    </div>
                                    <div className="h-2 sm:h-4 w-full rounded sm:rounded-lg relative overflow-hidden" style={{ backgroundColor: 'rgba(36,26,20,.14)', border: '1px solid rgba(36,26,20,.22)' }}>
                                        <div 
                                            className="absolute top-0 right-0 h-full transition-all duration-300 ease-out"
                                            style={{ width: `${monsterHp}%`, background: 'linear-gradient(270deg,#9E5A50,#C4795B)' }}
                                        >
                                            <div className="glass-bar w-full h-full"></div>
                                        </div>
                                        {isMonsterHit && <div className="absolute inset-0 bg-white/60 animate-pulse"></div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-20 left-0 w-full h-0 pointer-events-none z-50">
                            {isHeroHit && (
                                <div className="absolute left-16 top-0 animate-damage-pop text-red-500 font-black text-2xl drop-shadow-[0_2px_2px_black] stroke-white flex items-center gap-1">
                                    -{currentChapterIndex ? (4 + currentChapterIndex) : 5} <Heart size={20} fill="currentColor" />
                                </div>
                            )}
                            {isHeroHeal && (
                                <div className="absolute left-16 top-0 animate-heal-pop font-black text-xl drop-shadow-md flex items-center gap-1" style={{ color: '#A8C99B' }}>
                                    +5 <Heart size={18} fill="currentColor" />
                                </div>
                            )}
                            {isMonsterHit && (
                                <div 
                                    className="absolute right-12 top-4 animate-damage-pop text-amber-400 font-black text-2xl italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-black z-50" 
                                    style={{ textShadow: '0 0 10px red', transform: `rotate(${hitRotation}deg)` }}
                                >
                                    {hitWord}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isMultiplayer && !clayConsole && (
                    <MultiplayerHeader 
                        player={player}
                        localScore={localScore}
                        opponent={opponent}
                        opponentScore={opponentScore}
                    />
                )}

                {/* GRID AREA */}
                <div className={`${storyChapter || towerFloor || worldMapAccent ? '' : 'cg-playfield'} flex-1 min-h-0 w-full relative flex flex-col items-center justify-center overflow-hidden z-10 transition-opacity duration-1000 ${isFinishingMove ? 'opacity-50 blur-sm grayscale' : 'opacity-100'}`}>
                    
                    <GameFeedback 
                        combo={combo}
                        gameWon={gameWon || gameLost}
                        spawnFloatingEmoji={spawnFloatingEmoji}
                    />

                    {/* Floating Emoji Balloons */}
                    <div className="absolute top-0 right-0 z-[100] w-56 h-full pointer-events-none overflow-hidden">
                        {floatingEmojis?.slice(-10).map(fe => {
                            const seed = ((fe.id * 9301 + 49297) % 233280) / 233280;
                            const drift = -10 + seed * 20;
                            const angle = -20 + seed * 40;
                            const startScale = 0.5 + seed * 0.7;
                            return (
                                <span
                                    key={fe.id}
                                    className="absolute text-3xl drop-shadow-xl"
                                    style={{
                                        right: `${24 + drift}px`,
                                        bottom: '50px',
                                        animation: 'emoji-balloon 2.8s ease-out forwards',
                                        '--emoji-angle': `${angle}deg`,
                                        '--emoji-start-scale': `${startScale}`,
                                    } as React.CSSProperties}
                                >
                                    {fe.emoji}
                                </span>
                            );
                        })}
                    </div>
                    <style>{`
                        @keyframes emoji-balloon {
                            0% {
                                transform: translateY(0) scale(var(--emoji-start-scale, 0.7)) rotate(var(--emoji-angle, 0deg));
                                opacity: 1;
                            }
                            25% {
                                transform: translateY(-50px) scale(1.2) rotate(calc(var(--emoji-angle, 0deg) + 10deg));
                                opacity: 1;
                            }
                            60% {
                                transform: translateY(-160px) scale(1.7) rotate(calc(var(--emoji-angle, 0deg) - 5deg));
                                opacity: 0.8;
                            }
                            100% {
                                transform: translateY(-300px) scale(2.4) rotate(calc(var(--emoji-angle, 0deg) + 5deg));
                                opacity: 0;
                            }
                        }
                    `}</style>

                    {/* the plate cannot grow past the phone width, so the height the
                        poster spends on a bigger board has to live in the wall: split
                        evenly above and below the plate keeps both bands equal
                        (top-anchoring it would dump all of it above the keyboard). */}
                    <div className={`w-full h-full flex-1 min-h-0 relative px-2 flex flex-col items-center justify-center gap-2.5 sm:gap-3 ${clayConsole ? 'pt-1' : ''}`}>
                          <div className={clayConsole ? 'cg-console' : 'w-full h-full flex-1 min-h-0 relative'}>
                          <div className={clayConsole ? 'cg-console-slot' : 'w-full h-full flex-1 min-h-0 relative'}>
                            <CrosswordGrid 
                                grid={grid} 
                                loading={false} 
                                userGrid={userGrid} 
                                onCellChange={() => {}} 
                                selectedCell={selectedCell} 
                                direction={direction} 
                                onSelect={(r,c,d) => !isFrozen && !gameWon && !gameLost && onSelect(r, c, d)} 
                                activeClue={activeClue} 
                                language={language} 
                                opponentFilled={opponentFilled} 
                                clues={clues} 
                                powerRevealedCells={powerRevealedCells}
                                wrongAnswerCount={props.wrongAnswerCount || 0}
                                entranceKey={entranceKey}
                                bare={clayConsole}
                            />
                          </div>
                          </div>
                          {clayConsole && <div className="w-full max-w-2xl shrink-0 cg-postclue-wrap">{clueBar}</div>}
                    </div>
                </div>

                {/* BOTTOM UI STACK */}
                <div
                    className={`w-full shrink-0 z-40 safe-bottom transition-transform duration-500 ${isFinishingMove ? 'translate-y-full' : 'translate-y-0'}`}
                    style={clayConsole ? undefined : { backgroundColor: 'var(--paper)', boxShadow: '0 -10px 40px rgba(70,45,30,.10)' }}
                >
                    
                    {/* SPECIAL ABILITY BAR (Fighting Game Style) - Smaller on mobile */}
                    {storyChapter && (
                        <div className="w-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-4" style={{ backgroundImage: 'linear-gradient(180deg,#F4E7D5,#E6D3B9)', borderTop: '2px solid rgba(142,78,55,.35)' }}>
                            <div className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[7px] sm:text-[9px] font-black tracking-tighter flex items-center gap-1" style={{ color: '#9E7418' }}>
                                        <Zap size={8} fill="currentColor" /> {isFA ? 'مهر ایزدی' : 'DIVINE POWER'}
                                    </span>
                                    <span className={`text-[7px] sm:text-[10px] font-black ${powerMeter >= 100 ? 'animate-pulse' : ''}`} style={{ color: powerMeter >= 100 ? '#B07F22' : 'var(--ink-3)' }}>
                                        {powerMeter >= 100 ? 'MAX POWER' : `${Math.floor(powerMeter)}%`}
                                    </span>
                                </div>
                                <div className="h-2 sm:h-4 rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(36,26,20,.14)', border: '1px solid rgba(36,26,20,.24)' }}>
                                    <div
                                        className={`h-full transition-all duration-300 ${powerMeter >= 100 ? 'animate-pulse' : ''}`}
                                        style={{
                                            width: `${powerMeter}%`,
                                            background: powerMeter >= 100
                                                ? 'linear-gradient(90deg,#B07F22,#E2C079,#B07F22)'
                                                : powerMeter >= 30
                                                ? 'linear-gradient(90deg,#4E6B72,#7FA0A8)'
                                                : 'linear-gradient(90deg,#9A8879,#B6A695)',
                                        }}
                                    />
                                    <div className="absolute top-0 left-[30%] w-0.5 h-full bg-black/20"></div>
                                    <div className="absolute top-0 left-[100%] w-0.5 h-full bg-black/20"></div>
                                </div>
                            </div>

                            <div className="flex gap-1.5 sm:gap-2">
                                <button
                                    onClick={usePowerRevealCell}
                                    disabled={powerMeter < 30 || gameWon || gameLost || powerRevealedCells.size > 0}
                                    className={`flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all active:scale-90 ${powerMeter >= 30 ? 'text-[#F6F1E7]' : 'opacity-55 cursor-not-allowed'}`}
                                    style={powerMeter >= 30 ? {
                                        backgroundColor: '#4E6B72',
                                        border: '1px solid #3C545A',
                                        boxShadow: 'inset 0 1px 0 rgba(226,240,240,.35), inset 0 -2px 0 rgba(20,35,38,.35), 0 6px 12px -8px rgba(30,50,55,.85)',
                                    } : {
                                        backgroundColor: 'rgba(246,241,231,.75)',
                                        border: '1px dashed rgba(36,26,20,.28)',
                                        color: 'var(--ink-3)',
                                    }}
                                >
                                    <Target size={14} />
                                    <span className="text-[6px] sm:text-[7px] font-black mt-0.5">{isFA ? 'تک حرف' : 'REVEAL'}</span>
                                </button>

                                <button
                                    onClick={usePowerRevealWord}
                                    disabled={powerMeter < 100 || gameWon || gameLost || powerRevealedCells.size > 0}
                                    className={`flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all active:scale-90 ${powerMeter >= 100 ? 'text-[#FFF6EC] animate-bounce' : 'opacity-55 cursor-not-allowed'}`}
                                    style={powerMeter >= 100 ? {
                                        backgroundColor: '#B07F22',
                                        border: '1px solid #8E6417',
                                        boxShadow: 'inset 0 1px 0 rgba(255,232,190,.5), inset 0 -2px 0 rgba(70,45,10,.4), 0 8px 14px -8px rgba(120,80,10,.9)',
                                    } : {
                                        backgroundColor: 'rgba(246,241,231,.75)',
                                        border: '1px dashed rgba(36,26,20,.28)',
                                        color: 'var(--ink-3)',
                                    }}
                                >
                                    <Flame size={14} />
                                    <span className="text-[6px] sm:text-[7px] font-black mt-0.5">{isFA ? 'کل کلمه' : 'STRIKE'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isMultiplayer && gameMode === 'battle' && !gameWon && (
                        <div
                            className={`w-full relative z-30 ${clayConsole ? 'cg-battleslab mx-1.5 mb-1.5 px-2 pt-1 pb-1.5' : 'py-0.5'}`}
                            style={clayConsole ? undefined : { backgroundColor: 'var(--paper)', borderTop: '1px solid rgba(36,26,20,.10)' }}
                        >
                            <BattleControls 
                                language={language} 
                                mana={mana} 
                                onAttack={handleAttack} 
                                isFrozen={isFrozen}
                                opponentFilledCount={opponentFilled.size}
                                clay={clayConsole}
                            />
                        </div>
                    )}

                    <div className="relative z-40">
                    {!clayConsole && clueBar}
                    </div>

                    <div className={`w-full relative z-50 ${clayConsole ? '' : ''}`} style={clayConsole ? undefined : { backgroundColor: 'rgba(240,229,210,.94)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(142,78,55,.22)' }}>
                        <GameKeyboard 
                            language={language} 
                            onKeyPress={onKeyPress} 
                            onBackspace={onBackspace} 
                            onHint={onHint}
                            isMultiplayer={isMultiplayer || !!isArena}
                            isArena={!!isArena}
                            onShowToast={(msg) => onShowToast?.(msg, 'error')}
                            clay={clayConsole}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
