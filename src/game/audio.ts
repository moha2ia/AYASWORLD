/**
 * All audio is synthesised in the browser with the WebAudio API, so there are
 * no licensed music files, no downloads, and the game still works silently if
 * audio is blocked.
 */

type SoundName =
  | 'collect'
  | 'crystal'
  | 'jump'
  | 'land'
  | 'footstep'
  | 'discovery'
  | 'reward'
  | 'ui'
  | 'door'
  | 'finale';

class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = true;
  private ambientTimer: ReturnType<typeof setInterval> | null = null;
  private ambientNodes: AudioScheduledSourceNode[] = [];
  private chordIndex = 0;

  /** Must be called from a user gesture (browser autoplay policy). */
  unlock() {
    try {
      if (!this.context) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = this.enabled ? 1 : 0;
        this.master.connect(this.context.destination);

        this.musicBus = this.context.createGain();
        this.musicBus.gain.value = 0.13;
        this.musicBus.connect(this.master);

        this.sfxBus = this.context.createGain();
        this.sfxBus.gain.value = 0.4;
        this.sfxBus.connect(this.master);

        this.noiseBuffer = this.createNoiseBuffer(this.context);
      }
      if (this.context.state === 'suspended') {
        void this.context.resume().catch(() => undefined);
      }
    } catch {
      this.context = null;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAmbient();
      if (this.context && this.master) {
        this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.08);
      }
      return;
    }
    this.unlock();
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(1, this.context.currentTime, 0.15);
    }
    this.startAmbient();
  }

  startAmbient() {
    if (!this.enabled) return;
    this.unlock();
    if (!this.context || !this.musicBus || this.ambientTimer) return;
    this.playChord();
    this.ambientTimer = setInterval(() => this.playChord(), 7600);
  }

  stopAmbient() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    for (const node of this.ambientNodes) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    }
    this.ambientNodes = [];
  }

  private createNoiseBuffer(context: AudioContext) {
    const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /** Soft, slow-changing pads. Original generative music, no samples. */
  private playChord() {
    const context = this.context;
    const musicBus = this.musicBus;
    if (!context || !musicBus || !this.enabled) return;

    const chords = [
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [110.0, 130.81, 164.81, 196.0], // Am7
      [87.31, 130.81, 174.61, 220.0], // Fmaj7
      [98.0, 123.47, 146.83, 196.0], // G
    ];
    const notes = chords[this.chordIndex % chords.length];
    this.chordIndex += 1;
    const now = context.currentTime;
    const duration = 8.4;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.4;
    filter.connect(musicBus);

    notes.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = freq;
      oscillator.detune.value = (index - 1.5) * 4;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055 / (index + 1), now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.1);
      oscillator.onended = () => gain.disconnect();
      this.ambientNodes.push(oscillator);
    });

    // A tiny music-box arpeggio floating over the pad.
    if (this.chordIndex % 2 === 0) {
      const sparkle = [notes[2] * 2, notes[3] * 2, notes[1] * 4];
      sparkle.forEach((freq, i) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        const start = now + 2.2 + i * 0.72;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.016, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.3);
        oscillator.connect(gain);
        gain.connect(musicBus);
        oscillator.start(start);
        oscillator.stop(start + 1.4);
        oscillator.onended = () => gain.disconnect();
        this.ambientNodes.push(oscillator);
      });
    }

    // Keep the bookkeeping list small.
    if (this.ambientNodes.length > 80) {
      this.ambientNodes = this.ambientNodes.slice(-40);
    }
  }

  private tone(
    frequency: number,
    options: {
      duration?: number;
      type?: OscillatorType;
      volume?: number;
      delay?: number;
      slideTo?: number;
    } = {},
  ) {
    if (!this.enabled) return;
    this.unlock();
    const context = this.context;
    const sfxBus = this.sfxBus;
    if (!context || !sfxBus) return;
    try {
      const {
        duration = 0.25,
        type = 'sine',
        volume = 0.16,
        delay = 0,
        slideTo,
      } = options;
      const start = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(sfxBus);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
      oscillator.onended = () => gain.disconnect();
    } catch {
      // Audio is a bonus, never a blocker.
    }
  }

  private noise(duration = 0.12, volume = 0.05, frequency = 900, delay = 0) {
    if (!this.enabled) return;
    this.unlock();
    const context = this.context;
    const sfxBus = this.sfxBus;
    const buffer = this.noiseBuffer;
    if (!context || !sfxBus || !buffer) return;
    try {
      const start = context.currentTime + delay;
      const source = context.createBufferSource();
      source.buffer = buffer;
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = frequency;
      filter.Q.value = 0.8;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(sfxBus);
      source.start(start);
      source.stop(start + duration + 0.02);
      source.onended = () => gain.disconnect();
    } catch {
      // ignore
    }
  }

  play(name: SoundName) {
    if (!this.enabled) return;
    switch (name) {
      case 'collect':
        this.tone(880, { duration: 0.22, volume: 0.13 });
        this.tone(1318, { duration: 0.3, volume: 0.1, delay: 0.07 });
        this.tone(1760, { duration: 0.4, volume: 0.06, delay: 0.14 });
        break;
      case 'crystal':
        this.tone(1046, { duration: 0.5, type: 'triangle', volume: 0.09 });
        this.tone(1568, { duration: 0.6, volume: 0.05, delay: 0.08 });
        break;
      case 'jump':
        this.tone(430, { duration: 0.18, type: 'triangle', volume: 0.09, slideTo: 720 });
        break;
      case 'land':
        this.tone(150, { duration: 0.14, volume: 0.11, slideTo: 90 });
        this.noise(0.1, 0.035, 420);
        break;
      case 'footstep':
        this.noise(0.08, 0.018, 620);
        break;
      case 'discovery':
        this.tone(523, { duration: 0.5, volume: 0.09 });
        this.tone(659, { duration: 0.6, volume: 0.08, delay: 0.1 });
        this.tone(784, { duration: 0.8, volume: 0.08, delay: 0.2 });
        break;
      case 'reward':
        [523, 659, 784, 1046, 1318].forEach((freq, i) => {
          this.tone(freq, { duration: 0.9, volume: 0.08, delay: i * 0.11 });
        });
        break;
      case 'ui':
        this.tone(660, { duration: 0.1, volume: 0.05 });
        break;
      case 'door':
        this.tone(196, { duration: 0.3, type: 'triangle', volume: 0.07, slideTo: 147 });
        this.noise(0.18, 0.03, 300);
        break;
      case 'finale':
        [523, 659, 784, 1046, 1318, 1568].forEach((freq, i) => {
          this.tone(freq, { duration: 1.6, volume: 0.075, delay: i * 0.13 });
        });
        break;
    }
  }
}

export const audio = new AudioManager();
