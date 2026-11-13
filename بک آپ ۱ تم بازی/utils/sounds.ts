let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxVolume = 0.5;
let musicVolume = 0.3;
let isMuted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = sfxVolume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

export function setVolume(v: number) { sfxVolume = v; if (masterGain) masterGain.gain.value = isMuted ? 0 : v; }
export function toggleMute() { isMuted = !isMuted; if (masterGain) masterGain.gain.value = isMuted ? 0 : sfxVolume; return isMuted; }
export function getIsMuted() { return isMuted; }

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3, delay: number = 0) {
  const ctx = getCtx();
  const master = getMaster();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playNoise(duration: number, volume: number = 0.15, delay: number = 0) {
  const ctx = getCtx();
  const master = getMaster();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  source.connect(gain);
  gain.connect(master);
  source.start(ctx.currentTime + delay);
}

// --- GAME SOUNDS ---

export function playCorrectLetter(combo: number = 0, wordProgress: number = 0) {
  // wordProgress: 0 = just started the word, 1 = about to complete
  // Pitch rises as user progresses through the word, then resets on next word
  const pitchRise = 1 + wordProgress * 0.6; // 1x to 1.6x pitch range as word fills
  const baseFreq = (440 + combo * 15) * pitchRise;
  const clampedFreq = Math.min(baseFreq, 1200);
  // Softer, rounder envelope for a "progression" feel
  playTone(clampedFreq, 0.14, 'sine', 0.22);
  playTone(clampedFreq * 1.25, 0.1, 'triangle', 0.08, 0.02);
  // Gentle high shimmer that intensifies near completion
  if (wordProgress > 0.5) {
    playTone(clampedFreq * 2, 0.08, 'sine', 0.04 * wordProgress, 0.04);
  }
}

export function playWrongLetter() {
  playTone(130, 0.2, 'sawtooth', 0.15);
  playTone(110, 0.25, 'square', 0.08);
  playNoise(0.15, 0.06);
}

export function playWordComplete(combo: number = 0) {
  const notes = [523, 659, 784, 1047];
  const startNote = Math.min(Math.floor(combo / 3), notes.length - 3);
  const selectedNotes = notes.slice(startNote, startNote + 4);
  selectedNotes.forEach((freq, i) => {
    playTone(freq, 0.2, 'sine', 0.2, i * 0.1);
    playTone(freq * 2, 0.15, 'triangle', 0.06, i * 0.1);
  });
}

export function playComboStreak(combo: number) {
  const freq = 440 + combo * 30;
  playTone(Math.min(freq, 1200), 0.15, 'triangle', 0.2);
  playTone(Math.min(freq * 1.5, 1800), 0.1, 'sine', 0.1, 0.06);
}

export function playVictory() {
  const melody = [523, 659, 784, 1047, 784, 1047, 1319];
  melody.forEach((freq, i) => {
    playTone(freq, 0.3, 'sine', 0.25, i * 0.15);
    playTone(freq * 2, 0.2, 'triangle', 0.08, i * 0.15 + 0.05);
  });
  setTimeout(() => {
    [1047, 1319, 1568, 2093].forEach((freq, i) => {
      playTone(freq, 0.5, 'sine', 0.2, i * 0.2);
    });
  }, melody.length * 150);
}

export function playDefeat() {
  const notes = [392, 349, 330, 262, 220, 196];
  notes.forEach((freq, i) => {
    playTone(freq, 0.4, 'sine', 0.15, i * 0.2);
    playTone(freq * 0.5, 0.5, 'triangle', 0.06, i * 0.2);
  });
}

export function playButtonClick() {
  playTone(660, 0.05, 'sine', 0.15);
  playTone(880, 0.04, 'sine', 0.08, 0.02);
}

export function playAttack() {
  playTone(180, 0.15, 'sawtooth', 0.25);
  playTone(120, 0.2, 'square', 0.15, 0.05);
  playNoise(0.1, 0.2);
}

export function playFreeze() {
  const ctx = getCtx();
  const master = getMaster();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
  // Ice shards
  playNoise(0.3, 0.04);
  setTimeout(() => playNoise(0.2, 0.03), 100);
  setTimeout(() => playNoise(0.15, 0.02), 200);
}

export function playBlind() {
  playTone(300, 0.1, 'sine', 0.1);
  playTone(200, 0.1, 'sine', 0.1, 0.08);
  playTone(100, 0.2, 'sawtooth', 0.15, 0.16);
  playTone(60, 0.3, 'square', 0.12, 0.24);
}

export function playPowerUp() {
  const notes = [440, 554, 659, 880];
  notes.forEach((freq, i) => {
    playTone(freq, 0.12, 'sine', 0.18, i * 0.06);
    playTone(freq * 2, 0.1, 'triangle', 0.05, i * 0.06 + 0.03);
  });
}

export function playTimerWarning() {
  playTone(440, 0.1, 'square', 0.08);
  setTimeout(() => playTone(440, 0.1, 'square', 0.08), 500);
}

export function playGridBuildComplete() {
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    playTone(freq, 0.2, 'triangle', 0.15, i * 0.12);
  });
}

export function playCountdown() {
  playTone(880, 0.15, 'sine', 0.2);
}

export function playCountdownGo() {
  playTone(1047, 0.3, 'sine', 0.25);
  playTone(1319, 0.4, 'triangle', 0.15, 0.1);
}
