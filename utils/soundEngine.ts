/**
 * Acoustic Physical-Modeling Persian Sound Engine (Karplus-Strong & Organic Foley)
 *
 * Uses true Karplus-Strong string synthesis (AudioBuffer waveguide delay lines)
 * and physical acoustic impulse modeling instead of raw electronic oscillators.
 *
 * Capabilities:
 *  - Karplus-Strong Physical Santoor & Qanun Strings (Natural woody pluck, metallic overtones, organic decay)
 *  - Karplus-Strong Warm Setar / Oud Lute (Soft gut/silk string damping & body resonance)
 *  - Physical Frame Drum (Daf / Bendir) with natural skin membrane modes
 *  - Organic Foley Gameplay SFX:
 *      * Walnut & Glazed Ceramic Tile Tap (18ms physical impulse — zero synth pitch sweep)
 *      * Soft Acoustic Muted String & Wood Thud for Mistakes (zero harsh buzzers)
 *      * Lush Santoor & Harp Glissando for Word Completion & Grid Construction
 *  - Composed Traditional Persian Acoustic Soundtrack (Dastgah Bayat-e Esfahan & Mahur)
 *    performed on solo Karplus-Strong Santoor & Setar with natural rubato and zero continuous hum.
 */

export type ScrollTier = 1 | 2 | 3 | 4;

export interface AudioSettings {
  sfxMuted: boolean;
  bgmMuted: boolean;
  sfxVolume: number; // 0 to 1
  bgmVolume: number; // 0 to 1
}

const STORAGE_KEY = 'crossword_persian_audio_settings_v3';

// Persian Concert Pitch Frequencies (Hz) — Bayat-e Esfahan & Mahur
const FREQ = {
  G2: 98.00,
  A2: 110.00,
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  Ab3: 207.65,
  A3: 220.00,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fsharp4: 369.99,
  G4: 392.00,
  Ab4: 415.30,
  A4: 440.00,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  Ab5: 830.61,
  A5: 880.00,
  Bb5: 932.33,
  C6: 1046.50,
  D6: 1174.66,
  E6: 1318.51,
  G6: 1567.98,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;

  // Cache of pre-computed Karplus-Strong buffers by key (`freq_brightness_duration`)
  private stringBufferCache = new Map<string, AudioBuffer>();
  private tileTapBuffers: AudioBuffer[] = [];

  private settings: AudioSettings = {
    sfxMuted: false,
    bgmMuted: true,
    sfxVolume: 0.85,
    bgmVolume: 0,
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch {}
  }

  public saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {}
    this.updateGains();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setSfxMuted(muted: boolean): void {
    this.settings.sfxMuted = muted;
    this.saveSettings();
  }

  public setBgmMuted(muted: boolean): void {
    this.settings.bgmMuted = muted;
    this.saveSettings();
    if (muted) {
      this.pauseBgm();
    } else {
      this.startBgm();
    }
  }

  public setSfxVolume(vol: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public setBgmVolume(vol: number): void {
    this.settings.bgmVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Master bus with soft limiter curve
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.95, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.connect(this.masterGain);

      this.buildWarmHallReverb();
      this.buildTactileTileBuffers();
      this.updateGains();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Builds a smooth, warm acoustic room impulse response (early reflections + velvet tail)
   * with lowpass filtering so high frequencies are never harsh or metallic.
   */
  private buildWarmHallReverb(): void {
    if (!this.ctx || !this.masterGain) return;
    try {
      const sr = this.ctx.sampleRate;
      const duration = 2.2;
      const length = Math.floor(sr * duration);
      const buffer = this.ctx.createBuffer(2, length, sr);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      let lpL = 0;
      let lpR = 0;
      for (let i = 0; i < length; i++) {
        const t = i / sr;
        // Smooth exponential decay with soft 18ms pre-delay envelope
        const env = Math.min(1, t / 0.018) * Math.exp(-t * 2.8);
        // One-pole lowpass filter on the white noise to create warm wooden hall reflections
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;
        lpL = lpL * 0.72 + whiteL * 0.28;
        lpR = lpR * 0.72 + whiteR * 0.28;
        left[i] = lpL * env * 0.6;
        right[i] = lpR * env * 0.6;
      }

      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = buffer;

      this.reverbWetGain = this.ctx.createGain();
      this.reverbWetGain.gain.setValueAtTime(0.34, this.ctx.currentTime);

      this.reverbNode.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.masterGain);
    } catch {}
  }

  private sendToReverb(sourceNode: AudioNode, wetAmount = 0.35): void {
    if (!this.ctx || !this.reverbNode) return;
    const send = this.ctx.createGain();
    send.gain.setValueAtTime(wetAmount, this.ctx.currentTime);
    sourceNode.connect(send);
    send.connect(this.reverbNode);
  }

  private updateGains(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.sfxGain) {
      const v = this.settings.sfxMuted ? 0 : this.settings.sfxVolume;
      this.sfxGain.gain.setTargetAtTime(v, now, 0.04);
    }
    if (this.bgmGain) {
      const v = this.settings.bgmMuted ? 0 : this.settings.bgmVolume;
      this.bgmGain.gain.setTargetAtTime(v, now, 0.08);
    }
  }

  // ===========================================================================
  // 1. KARPLUS-STRONG PHYSICAL STRING MODELING (صدای کاملاً طبیعی سنتور، قانون و سه‌تار)
  // Generates a real acoustic vibrating string waveform in an AudioBuffer.
  // ===========================================================================
  private getPluckedStringBuffer(
    freq: number,
    duration = 2.4,
    character: 'santoor' | 'setar' | 'harp' = 'santoor'
  ): AudioBuffer | null {
    if (!this.ctx) return null;
    const key = `${ freq.toFixed(1) }_${character}_${duration.toFixed(1)}`;
    const cached = this.stringBufferCache.get(key);
    if (cached) return cached;

    const sr = this.ctx.sampleRate;
    const totalSamples = Math.floor(sr * duration);
    const buffer = this.ctx.createBuffer(2, totalSamples, sr);
    const outL = buffer.getChannelData(0);
    const outR = buffer.getChannelData(1);

    // Dual slightly detuned courses (Santoor has 4 strings per course; modeling 2 stereo courses gives rich natural acoustic shimmer)
    const detuneFactors = character === 'santoor' ? [0.9993, 1.0007] : [1.0, 1.0003];

    for (let ch = 0; ch < 2; ch++) {
      const out = ch === 0 ? outL : outR;
      const f = freq * detuneFactors[ch];
      const period = Math.max(4, Math.round(sr / f));
      const delayLine = new Float32Array(period);

      // 1. Pluck excitation: warm filtered noise + half-sine wooden hammer/mezrab impulse
      let prevNoise = 0;
      const smoothAlpha = character === 'harp' ? 0.35 : character === 'setar' ? 0.55 : 0.48;
      for (let i = 0; i < period; i++) {
        const phase = i / period;
        const pluckShape = Math.sin(phase * Math.PI);
        const raw = Math.random() * 2 - 1;
        prevNoise = prevNoise * (1 - smoothAlpha) + raw * smoothAlpha;
        delayLine[i] = prevNoise * 0.65 + pluckShape * 0.35;
      }

      // 2. Waveguide feedback loop with lowpass damping
      // Higher damping = warmer/mellower tone; higher feedback = longer sustain
      const feedback =
        character === 'santoor'
          ? Math.min(0.9968, 0.992 + (f / 2000) * 0.004)
          : character === 'setar'
          ? Math.min(0.9945, 0.989 + (f / 2000) * 0.004)
          : 0.995;

      const brightness = character === 'santoor' ? 0.38 : character === 'setar' ? 0.45 : 0.62;

      let ptr = 0;
      let lastSample = 0;
      for (let i = 0; i < totalSamples; i++) {
        const current = delayLine[ptr];
        // Two-point weighted lowpass filter inside the string feedback loop
        const filtered = (current * (1 - brightness) + lastSample * brightness) * feedback;
        delayLine[ptr] = filtered;
        lastSample = current;
        ptr = (ptr + 1) % period;

        // Soft attack envelope (3ms) to prevent digital clicks + natural tail fade
        const env = i < 120 ? i / 120 : 1 - Math.pow(i / totalSamples, 2.5);
        out[i] = current * env * 0.55;
      }
    }

    this.stringBufferCache.set(key, buffer);
    return buffer;
  }

  /**
   * Plays a physical Karplus-Strong Santoor note
   */
  public playSantoorNote(
    freq: number,
    duration = 2.4,
    velocity = 0.75,
    startTime?: number,
    targetBus: 'sfx' | 'bgm' = 'sfx',
    character: 'santoor' | 'setar' | 'harp' = 'santoor'
  ): void {
    const ctx = this.initContext();
    if (!ctx) return;
    const bus = targetBus === 'bgm' ? this.bgmGain : this.sfxGain;
    const isMuted = targetBus === 'bgm' ? this.settings.bgmMuted : this.settings.sfxMuted;
    if (!bus || isMuted) return;

    const buffer = this.getPluckedStringBuffer(freq, duration, character);
    if (!buffer) return;

    const t = startTime ?? ctx.currentTime;
    const vel = Math.max(0.05, Math.min(1.0, velocity));

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // Warm soundboard resonance filter (cuts harsh digital highs above 4200Hz)
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(character === 'harp' ? 2800 : 4200, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vel * 0.55, t);

    src.connect(bodyFilter);
    bodyFilter.connect(gain);
    gain.connect(bus);

    this.sendToReverb(gain, targetBus === 'bgm' ? 0.5 : 0.38);

    src.start(t);
  }

  /**
   * Plays a warm Karplus-Strong Setar / Tar note with octave string sympathy
   */
  public playTarPluck(freq: number, duration = 2.0, velocity = 0.8, startTime?: number): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;
    const t = startTime ?? ctx.currentTime;

    this.playSantoorNote(freq, duration, velocity, t, 'sfx', 'setar');
    // Sympathetic octave string (زنگ سه‌تار و تار)
    this.playSantoorNote(freq * 2, duration * 0.8, velocity * 0.38, t + 0.012, 'sfx', 'santoor');
  }

  // ===========================================================================
  // 2. PHYSICAL WOOD & CERAMIC FOLEY BUFFERS (صدای طبیعی کاشی و چوب بدون سینت)
  // ===========================================================================
  private buildTactileTileBuffers(): void {
    if (!this.ctx) return;
    const sr = this.ctx.sampleRate;
    const dur = 0.045; // 45ms crisp physical tap
    const len = Math.floor(sr * dur);

    // Pre-build 4 micro-variations of a real wooden/ceramic chess-tile tap
    const resonantPitches = [390, 415, 440, 465];
    this.tileTapBuffers = resonantPitches.map((resFreq) => {
      const buf = this.ctx!.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);

      for (let i = 0; i < len; i++) {
        const t = i / sr;
        // 1. Crisp 2.5ms fingertip/tile contact impulse
        const contact = Math.exp(-t / 0.0022) * (Math.random() * 2 - 1) * 0.45;
        // 2. Damped walnut/ceramic modal resonance (two natural wood modes, zero frequency sweep!)
        const mode1 = Math.sin(2 * Math.PI * resFreq * t) * Math.exp(-t / 0.0085) * 0.65;
        const mode2 = Math.sin(2 * Math.PI * (resFreq * 2.38) * t) * Math.exp(-t / 0.0045) * 0.32;
        data[i] = (contact + mode1 + mode2) * 0.7;
      }
      return buf;
    });
  }

  /**
   * Crisp, warm physical ceramic/wood tile tap (selecting cells or pressing buttons)
   */
  public playTileClick(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted || this.tileTapBuffers.length === 0) return;

    const buf = this.tileTapBuffers[Math.floor(Math.random() * this.tileTapBuffers.length)];
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.55, ctx.currentTime);

    src.connect(gain);
    gain.connect(this.sfxGain);
    src.start(ctx.currentTime);
  }

  public playUiClick(): void {
    this.playTileClick();
  }

  /**
   * Correct Letter Placement:
   * Plays the warm tactile tile tap + a delicate, whisper-soft Karplus-Strong harp string
   * that ascends gently along the Persian scale as the word nears completion.
   */
  public playCorrectLetterProgress(progress = 0): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    // 1. Physical ceramic tile tap
    this.playTileClick();

    // 2. Soft harmonic harp string resonance scaled to word progress
    const scaleNotes = [FREQ.C4, FREQ.D4, FREQ.E4, FREQ.G4, FREQ.A4, FREQ.C5, FREQ.D5, FREQ.E5];
    const idx = Math.min(scaleNotes.length - 1, Math.floor(progress * scaleNotes.length));
    this.playSantoorNote(scaleNotes[idx], 1.2, 0.28, ctx.currentTime + 0.008, 'sfx', 'harp');
  }

  /**
   * Natural Acoustic Mistake Sound (حرف یا کلمه اشتباه)
   * Plays a soft, muted low Oud/Setar string pluck + warm muffled wood tap.
   * Zero buzzers, zero harsh square/sawtooth waves.
   */
  public playMistake(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;

    // Soft low muffled frame-drum touch
    this.playDaf('chap', 0.55, t);
    // Gentle damped low string interval (D3 -> C3)
    this.playSantoorNote(FREQ.D3, 0.45, 0.42, t, 'sfx', 'harp');
    this.playSantoorNote(FREQ.A2, 0.55, 0.48, t + 0.075, 'sfx', 'harp');
  }

  /**
   * Soft Backspace / Erase Sound
   */
  public playTileErase(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;
    this.playSantoorNote(FREQ.G3, 0.35, 0.25, ctx.currentTime, 'sfx', 'harp');
  }

  /**
   * Acoustic Frame Drum (Daf / Tonbak) modeled with natural skin modes
   */
  public playDaf(type: 'dum' | 'tek' | 'chap' = 'dum', velocity = 0.8, startTime?: number): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = startTime ?? ctx.currentTime;
    const vel = Math.max(0.1, Math.min(1, velocity));
    const sr = ctx.sampleRate;

    if (type === 'dum') {
      // Deep warm skin bass resonance (88Hz fundamental + 142Hz overtone + soft leather thud)
      const dur = 0.45;
      const len = Math.floor(sr * dur);
      const buf = ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const sec = i / sr;
        const fEnv = 82 + 34 * Math.exp(-sec / 0.045);
        const body = Math.sin(2 * Math.PI * fEnv * sec) * Math.exp(-sec / 0.14);
        const overtone = Math.sin(2 * Math.PI * (fEnv * 1.58) * sec) * Math.exp(-sec / 0.05) * 0.3;
        const thud = (Math.random() * 2 - 1) * Math.exp(-sec / 0.008) * 0.2;
        d[i] = (body + overtone + thud) * 0.75;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vel * 0.7, t);
      src.connect(gain);
      gain.connect(this.sfxGain);
      this.sendToReverb(gain, 0.35);
      src.start(t);
    } else if (type === 'tek') {
      // Crisp wooden frame edge tap
      const dur = 0.12;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const sec = i / sr;
        const mode1 = Math.sin(2 * Math.PI * 310 * sec) * Math.exp(-sec / 0.022);
        const mode2 = Math.sin(2 * Math.PI * 520 * sec) * Math.exp(-sec / 0.012) * 0.5;
        const snap = (Math.random() * 2 - 1) * Math.exp(-sec / 0.004) * 0.35;
        d[i] = (mode1 + mode2 + snap) * 0.6;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vel * 0.55, t);
      src.connect(gain);
      gain.connect(this.sfxGain);
      src.start(t);
    } else {
      // Soft palm 'chap'
      const dur = 0.09;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const sec = i / sr;
        const mode = Math.sin(2 * Math.PI * 165 * sec) * Math.exp(-sec / 0.025);
        const soft = (Math.random() * 2 - 1) * Math.exp(-sec / 0.006) * 0.25;
        d[i] = (mode + soft) * 0.55;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vel * 0.5, t);
      src.connect(gain);
      gain.connect(this.sfxGain);
      src.start(t);
    }
  }

  /**
   * Grid Constructed / Board Ready (ساخته شدن جدول)
   * Warm parchment brush + soothing 5-string acoustic Qanun/Santoor chord strum
   */
  public playGridConstructed(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    this.playDaf('dum', 0.5, t);

    const chord = [FREQ.C4, FREQ.G4, FREQ.C5, FREQ.D5, FREQ.E5, FREQ.G5];
    chord.forEach((f, i) => {
      this.playSantoorNote(f, 2.5, 0.52 + i * 0.05, t + 0.04 + i * 0.065, 'sfx', 'santoor');
    });
  }

  /**
   * Word Complete (حل شدن یک کلمه در جدول)
   * Lush 4-note acoustic Santoor & Harp arpeggio
   */
  public playWordComplete(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    const notes = [FREQ.G4, FREQ.C5, FREQ.E5, FREQ.G5];
    notes.forEach((f, i) => {
      this.playSantoorNote(f, 2.2, 0.62 + i * 0.06, t + i * 0.07, 'sfx', 'santoor');
    });
  }

  /**
   * Full Puzzle Victory (اتمام کل جدول)
   */
  public playGridComplete(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    this.playDaf('dum', 0.85, t);
    this.playDaf('tek', 0.6, t + 0.22);
    this.playDaf('dum', 0.8, t + 0.44);

    // Rich cascading Persian Mahur melody on acoustic Santoor & Setar
    const run = [
      FREQ.C4, FREQ.E4, FREQ.G4, FREQ.C5,
      FREQ.D5, FREQ.E5, FREQ.G5, FREQ.C6,
    ];
    run.forEach((f, i) => {
      this.playSantoorNote(f, 2.8, 0.72, t + 0.05 + i * 0.075, 'sfx', 'santoor');
    });

    this.playTarPluck(FREQ.C3, 2.8, 0.85, t + 0.65);
    this.playTarPluck(FREQ.G3, 2.8, 0.85, t + 0.72);
    this.playTarPluck(FREQ.C4, 3.0, 0.9, t + 0.8);
  }

  // ===========================================================================
  // 3. SCROLL CEREMONY, FORGE POLISH & SYNERGY SOUNDS
  // ===========================================================================

  public playScrollWhoosh(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    const dur = 0.9;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1;
      lp = lp * 0.82 + w * 0.18;
      data[i] = lp * Math.sin((i / data.length) * Math.PI);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.exponentialRampToValueAtTime(980, t + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(260, t + dur);
    filter.Q.setValueAtTime(2.2, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + dur * 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    this.sendToReverb(gain, 0.4);

    source.start(t);
  }

  public playScrollUnroll(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    // Soft wooden roller & parchment unfurl
    for (let i = 0; i < 4; i++) {
      this.playDaf('chap', 0.35, t + i * 0.055);
    }
    this.playSantoorNote(FREQ.G4, 1.8, 0.45, t + 0.05, 'sfx', 'harp');
    this.playSantoorNote(FREQ.C5, 2.0, 0.55, t + 0.12, 'sfx', 'harp');
  }

  public playScrollGrandFanfare(tier: ScrollTier): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;

    switch (tier) {
      case 1: {
        this.playDaf('dum', 0.65, t);
        this.playSantoorNote(FREQ.D4, 2.2, 0.7, t);
        this.playSantoorNote(FREQ.F4, 2.4, 0.75, t + 0.11);
        this.playSantoorNote(FREQ.A4, 2.6, 0.85, t + 0.22);
        this.playSantoorNote(FREQ.D5, 2.8, 0.85, t + 0.34);
        break;
      }
      case 2: {
        this.playDaf('dum', 0.75, t);
        const notes = [FREQ.C4, FREQ.E4, FREQ.G4, FREQ.C5, FREQ.E5];
        notes.forEach((f, i) => {
          this.playSantoorNote(f, 2.5, 0.75, t + i * 0.085);
        });
        break;
      }
      case 3: {
        this.playDaf('dum', 0.85, t);
        this.playDaf('tek', 0.6, t + 0.2);
        this.playTarPluck(FREQ.C3, 2.4, 0.8, t);
        this.playTarPluck(FREQ.G3, 2.4, 0.85, t + 0.1);
        const notes = [FREQ.C4, FREQ.D4, FREQ.E4, FREQ.G4, FREQ.A4, FREQ.C5, FREQ.E5, FREQ.G5];
        notes.forEach((f, i) => {
          this.playSantoorNote(f, 2.6, 0.8, t + 0.12 + i * 0.065);
        });
        break;
      }
      case 4: {
        this.playDaf('dum', 0.95, t);
        this.playDaf('tek', 0.7, t + 0.22);
        this.playDaf('dum', 0.9, t + 0.45);
        this.playTarPluck(FREQ.C3, 3.0, 0.9, t);
        this.playTarPluck(FREQ.G3, 3.0, 0.95, t + 0.08);
        this.playTarPluck(FREQ.C4, 3.0, 0.95, t + 0.16);

        const emeraldRun = [
          FREQ.C4, FREQ.E4, FREQ.G4, FREQ.A4,
          FREQ.C5, FREQ.D5, FREQ.E5, FREQ.G5, FREQ.A5,
          FREQ.C6, FREQ.E6, FREQ.G6,
        ];
        emeraldRun.forEach((f, i) => {
          this.playSantoorNote(f, 3.0, 0.85, t + 0.1 + i * 0.055);
        });
        break;
      }
    }
  }

  /**
   * Card Kiln Polish (صیقل کارت در کوره)
   * Warm bronze bell resonance + ascending Santoor triad (no square wave!)
   */
  public playCardPolish(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    this.playDaf('tek', 0.65, t);
    this.playSantoorNote(FREQ.G4, 2.0, 0.7, t + 0.02);
    this.playSantoorNote(FREQ.C5, 2.2, 0.78, t + 0.1);
    this.playSantoorNote(FREQ.E5, 2.4, 0.85, t + 0.18);
    this.playSantoorNote(FREQ.G5, 2.6, 0.9, t + 0.26);
  }

  public playSynergyActivation(count: 3 | 6 | 10): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    if (count === 3) {
      this.playSantoorNote(FREQ.C4, 2.0, 0.7, t);
      this.playSantoorNote(FREQ.E4, 2.0, 0.75, t + 0.08);
      this.playSantoorNote(FREQ.G4, 2.2, 0.8, t + 0.16);
    } else if (count === 6) {
      this.playDaf('dum', 0.65, t);
      [FREQ.C4, FREQ.E4, FREQ.G4, FREQ.C5, FREQ.E5].forEach((f, i) => {
        this.playSantoorNote(f, 2.3, 0.8, t + i * 0.075);
      });
    } else {
      this.playScrollGrandFanfare(4);
    }
  }

  public playMonsterHit(): void {
    const ctx = this.initContext();
    if (!ctx || !this.sfxGain || this.settings.sfxMuted) return;

    const t = ctx.currentTime;
    this.playDaf('dum', 0.9, t);
    this.playDaf('tek', 0.75, t + 0.04);
    this.playTarPluck(FREQ.D3, 1.2, 0.75, t + 0.02);
  }

  // Background music has been completely removed per user preference (SFX only)
  public startBgm(): void {
    // No-op: background music is disabled
  }

  public pauseBgm(): void {
    // No-op: background music is disabled
  }

  public toggleBgm(): boolean {
    return false;
  }

  public isBgmRunning(): boolean {
    return false;
  }
}

// Global Singleton Instance
export const soundEngine = new SoundEngine();

