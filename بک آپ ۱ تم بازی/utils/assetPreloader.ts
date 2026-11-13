import { LEGEND_PORTRAIT_IMAGES, LEGEND_CHAPTER_IMAGES } from '../data/legendImages';
import { EPIC_CAMPAIGNS } from '../data/campaigns';
import { FOLKTALE_BOOKS } from '../data/folktales/folktalesIndex';

/**
 * Global cache of decoded HTMLImageElement instances.
 * Keeping strong references here + pinning the largest backgrounds/maps in an
 * offscreen DOM container prevents Blink/WebKit from evicting decoded bitmaps
 * when switching between Menu, Maps, and GameView.
 */
const PINNED_IMAGES = new Map<string, HTMLImageElement>();
const PRELOADED_URLS = new Set<string>();

/**
 * Tier 0 — Critical backgrounds, maps, main menu chassis, game console frames,
 * and all 25 World Map portrait pins. Loaded & decoded during SplashScreen.
 */
export const CRITICAL_GAME_ASSETS: string[] = [
  // 1. Full Maps (Iran Epic/History Map + World Football Map)
  '/images/map-iran-clay.webp',
  '/images/map-world-clay.webp',

  // 2. Main Menu Chassis, Hero Tiles & Builder Modal Textures
  '/images/d9/h-tablet-only.webp',
  '/images/d9/h-clean-pill.webp',
  '/images/d9/h-avatar.webp',
  '/images/d9/h-play-bar.webp',
  '/images/d9/h-play-bar-press.webp',
  '/images/d9/h-builder-slab.webp',
  '/images/d9/h-builder-play.webp',
  '/images/d9/h-builder-play-press.webp',
  '/images/d9/h-sage-tray.webp',
  '/images/d9/h-nav-1-press.webp',
  '/images/d9/h-nav-2-press.webp',
  '/images/d9/h-nav-3-press.webp',
  '/images/d9/h-nav-4-press.webp',
  '/images/d9/h-nav-5-press.webp',
  '/images/ui/hero-storyteller.webp',
  '/images/ui/hero-duel.webp',
  '/images/ui/hero-battle.webp',
  '/images/ui/hero-treasure.webp',
  '/images/ui/hero-tower.webp',
  '/images/ui/hero-wheel.webp',
  '/images/ui/hero-pass.webp',
  '/images/ui/hero-quests.webp',
  '/images/ui/khomreh-jar.jpg',

  // 2b. Progressive Persian Clay Tablet Card Frames (Tiers 1..4 + Sealed)
  '/images/worldmap/clay-card-tier1.jpg',
  '/images/worldmap/clay-card-tier2.jpg',
  '/images/worldmap/clay-card-tier3.jpg',
  '/images/worldmap/clay-card-tier4.jpg',
  '/images/worldmap/clay-card-locked.jpg',

  // 3. Builder Category Medallions
  '/images/d9/h-cat-general.webp',
  '/images/d9/h-cat-knowledge.webp',
  '/images/d9/h-cat-cities.webp',
  '/images/d9/h-cat-movies.webp',
  '/images/d9/h-cat-food.webp',
  '/images/d9/h-cat-nature.webp',
  '/images/d9/h-cat-body.webp',
  '/images/d9/h-cat-jobs.webp',
  '/images/d9/h-cat-tech.webp',
  '/images/d9/h-cat-shahnameh.webp',
  '/images/d9/h-cat-all.webp',

  // 4. In-Game Console Backgrounds, Board Frame, Topbar, Clue Bar & Keyboard
  '/images/game/room-bg.webp',
  '/images/game/board-frame.webp',
  '/images/game/board-panel.webp',
  '/images/game/clay-panel.webp',
  '/images/game/clay-panel-dark.webp',
  '/images/game/keyboard-panel.webp',
  '/images/game/clue-panel.webp',
  '/images/game/clue-panel-online.webp',
  '/images/game/topbar.webp',
  '/images/game/topbar-online.webp',
  '/images/game/deck.webp',
  '/images/game/hud-top.webp',

  // 5. All 25 Football Legend Portrait Pins on the World Map
  ...Object.values(LEGEND_PORTRAIT_IMAGES),
];

/**
 * Heavy surfaces that must remain permanently decoded in the browser compositor
 * so switching to Maps or GameView paints in 0ms on the very first frame.
 */
const COMPOSITOR_PINNED_SURFACES: string[] = [
  '/images/map-iran-clay.webp',
  '/images/map-world-clay.webp',
  '/images/d9/h-tablet-only.webp',
  '/images/d9/h-builder-slab.webp',
  '/images/d9/h-sage-tray.webp',
  '/images/d9/h-builder-play.webp',
  '/images/d9/h-builder-play-press.webp',
  '/images/d9/h-play-bar-press.webp',
  '/images/ui/khomreh-jar.jpg',
  '/images/worldmap/clay-card-tier1.jpg',
  '/images/worldmap/clay-card-tier2.jpg',
  '/images/worldmap/clay-card-tier3.jpg',
  '/images/worldmap/clay-card-tier4.jpg',
  '/images/worldmap/clay-card-locked.jpg',
  '/images/game/room-bg.webp',
  '/images/game/board-frame.webp',
  '/images/game/board-panel.webp',
  '/images/game/clay-panel.webp',
  '/images/game/clay-panel-dark.webp',
  '/images/game/keyboard-panel.webp',
  '/images/game/clue-panel.webp',
  '/images/game/clue-panel-online.webp',
  '/images/game/topbar.webp',
  '/images/game/topbar-online.webp',
  ...Object.values(LEGEND_PORTRAIT_IMAGES),
];

/**
 * Tier 1 — Secondary assets (in-game pressed key tiles, story book covers,
 * opening chapter scenes, and legend chapter photos).
 */
export function getSecondaryGameAssets(): string[] {
  const pressAssets: string[] = [
    '/images/game/press/bar-avatar.webp',
    '/images/game/press/bar-bulb.webp',
    '/images/game/press/bar-flip.webp',
    '/images/game/press/bar-home.webp',
    '/images/game/press/bar-purse.webp',
    '/images/game/press/baro-avatar.webp',
    '/images/game/press/baro-bulb.webp',
    '/images/game/press/baro-flip.webp',
    '/images/game/press/baro-home.webp',
    '/images/game/press/baro-purse.webp',
    '/images/game/press/clue-dir.webp',
    '/images/game/press/clue-next.webp',
    '/images/game/press/clue-prev.webp',
    '/images/game/press/clueo-dir.webp',
    '/images/game/press/clueo-next.webp',
    '/images/game/press/clueo-prev.webp',
    '/images/game/press/kb-lamp.webp',
  ];

  // Keyboard key press sprites
  for (let c = 0; c <= 11; c++) pressAssets.push(`/images/game/press/kb-r1c${c}.webp`);
  for (let c = 0; c <= 10; c++) pressAssets.push(`/images/game/press/kb-r2c${c}.webp`);
  for (let c = 0; c <= 8; c++) pressAssets.push(`/images/game/press/kb-r3c${c}.webp`);

  // All story book covers & first chapter backgrounds
  const bookAssets: string[] = [];
  for (const book of [...EPIC_CAMPAIGNS, ...FOLKTALE_BOOKS]) {
    if (book.coverImage) bookAssets.push(book.coverImage);
    if (book.chapters?.[0]?.image) bookAssets.push(book.chapters[0].image);
  }

  // All Football Legend chapter card photos
  const legendChapterAssets = Object.values(LEGEND_CHAPTER_IMAGES);

  return Array.from(new Set([...pressAssets, ...bookAssets, ...legendChapterAssets]));
}

export function isAssetPreloaded(url: string | null | undefined): boolean {
  if (!url) return false;
  return PRELOADED_URLS.has(url);
}

/**
 * Loads and decodes a single image URL, keeping the HTMLImageElement reference
 * alive in `PINNED_IMAGES` so its decoded bitmap is not garbage-collected.
 */
export function preloadAndDecodeImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  const existing = PINNED_IMAGES.get(url);
  if (existing && PRELOADED_URLS.has(url)) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    PINNED_IMAGES.set(url, img);

    const markDone = () => {
      PRELOADED_URLS.add(url);
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {}).finally(() => resolve());
      } else {
        resolve();
      }
    };

    img.onload = markDone;
    img.onerror = () => resolve();
    img.src = url;

    if (img.complete && img.naturalWidth > 0) {
      markDone();
    }
  });
}

function mountCompositorPinContainer(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('cg-compositor-pin')) return;

  const container = document.createElement('div');
  container.id = 'cg-compositor-pin';
  container.setAttribute('aria-hidden', 'true');
  // Placed inside viewport bounds (0,0) at 2x2px with near-zero opacity so Blink/WebKit
  // treats these surfaces as in-viewport and keeps their GPU textures warm.
  container.style.cssText =
    'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0.002;pointer-events:none;overflow:hidden;z-index:0;';

  for (const src of COMPOSITOR_PINNED_SURFACES) {
    const img = document.createElement('img');
    img.src = src;
    img.decoding = 'sync';
    img.loading = 'eager';
    img.width = 2;
    img.height = 2;
    container.appendChild(img);
  }

  // Also pin SVG <image> elements for IranMap, WorldMap, and Legend portraits
  // so SVGImageElement cache is warm before the user opens any map tab.
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '2');
  svg.setAttribute('height', '2');
  svg.setAttribute('viewBox', '0 0 10 10');

  const svgSources = [
    '/images/map-iran-clay.webp',
    '/images/map-world-clay.webp',
    ...Object.values(LEGEND_PORTRAIT_IMAGES),
  ];
  for (const href of svgSources) {
    const svgImg = document.createElementNS(svgNS, 'image');
    svgImg.setAttribute('href', href);
    svgImg.setAttribute('width', '2');
    svgImg.setAttribute('height', '2');
    svg.appendChild(svgImg);
  }
  container.appendChild(svg);

  document.body.appendChild(container);
}

let criticalPreloadPromise: Promise<void> | null = null;

/**
 * Preloads and decodes all critical game backgrounds, maps, and UI panels
 * with progress reporting for SplashScreen, then warms up secondary assets.
 */
export function preloadCriticalGameAssets(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const uniqueUrls = Array.from(new Set(CRITICAL_GAME_ASSETS));
  const total = uniqueUrls.length;
  let loaded = 0;

  const notify = () => {
    loaded++;
    onProgress?.(Math.min(loaded, total), total);
  };

  if (criticalPreloadPromise) {
    onProgress?.(total, total);
    return criticalPreloadPromise;
  }

  mountCompositorPinContainer();

  criticalPreloadPromise = (async () => {
    const concurrency = 10;
    let idx = 0;

    const worker = async () => {
      while (idx < uniqueUrls.length) {
        const currentUrl = uniqueUrls[idx++];
        await preloadAndDecodeImage(currentUrl);
        notify();
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, () => worker())
    );

    // Kick off secondary assets (key press sprites, book covers, legend chapters)
    // in the background so they are also ready before the user opens sub-screens.
    preloadSecondaryAssetsInBackground();
  })();

  return criticalPreloadPromise;
}

let secondaryStarted = false;
function preloadSecondaryAssetsInBackground(): void {
  if (secondaryStarted) return;
  secondaryStarted = true;

  const secondaryUrls = getSecondaryGameAssets();
  let idx = 0;
  const concurrency = 6;

  const worker = async () => {
    while (idx < secondaryUrls.length) {
      const url = secondaryUrls[idx++];
      await preloadAndDecodeImage(url);
    }
  };

  for (let i = 0; i < concurrency; i++) {
    worker();
  }
}
