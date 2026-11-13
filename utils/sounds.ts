import { soundEngine } from './soundEngine';

export function setVolume(v: number) {
  soundEngine.setSfxVolume(v);
}

export function toggleMute() {
  const current = soundEngine.getSettings().sfxMuted;
  soundEngine.setSfxMuted(!current);
  return !current;
}

export function getIsMuted() {
  return soundEngine.getSettings().sfxMuted;
}

// --- PERSIAN ENRICHED GAME SOUNDS ---

/**
 * Satisfying tactile ceramic-tile "thock" with ascending harmonic progress
 * As word fills up, pitch rises harmoniously in Dastgah Mahur
 */
export function playCorrectLetter(_combo: number = 0, wordProgress: number = 0) {
  soundEngine.playCorrectLetterProgress(wordProgress);
}

/**
 * Organic Persian Mistake Sound (warm wooden double-knock with damped string buzz)
 * Clearly distinct, satisfying to hear, never annoying or shrill
 */
export function playWrongLetter() {
  soundEngine.playMistake();
}

/**
 * Joyful 4-note Santoor arpeggio in Dastgah Mahur with caravanserai hall reverb
 */
export function playWordComplete(_combo: number = 0) {
  soundEngine.playWordComplete();
}

export function playComboStreak(combo: number) {
  if (combo >= 6) {
    soundEngine.playSynergyActivation(6);
  } else if (combo >= 3) {
    soundEngine.playSynergyActivation(3);
  } else {
    soundEngine.playTileClick();
  }
}

/**
 * Full victory celebration with Daf beats, Santoor cascade, and victorious Tar chord
 */
export function playVictory() {
  soundEngine.playGridComplete();
}

export function playDefeat() {
  soundEngine.playMistake();
  soundEngine.playDaf('dum', 0.85);
}

/**
 * Crisp tactile mobile UI click for buttons, tabs and dialogs
 */
export function playButtonClick() {
  soundEngine.playUiClick();
}

export function playAttack() {
  soundEngine.playMonsterHit();
}

export function playFreeze() {
  soundEngine.playScrollWhoosh();
}

export function playBlind() {
  soundEngine.playDaf('dum', 0.7);
  soundEngine.playMistake();
}

export function playPowerUp() {
  soundEngine.playCardPolish();
}

export function playTimerWarning() {
  soundEngine.playDaf('tek', 0.6);
}

/**
 * Mystical Grid Constructed Fanfare:
 * Gentle Daf roll + ascending 5-note Santoor glissando in Dastgah Mahur + crystal bell
 */
export function playGridBuildComplete() {
  soundEngine.playGridConstructed();
}

export function playCountdown() {
  soundEngine.playDaf('tek', 0.65);
}

export function playCountdownGo() {
  soundEngine.playDaf('dum', 0.95);
  soundEngine.playGridConstructed();
}

export { soundEngine };
