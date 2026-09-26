/**
 * ===================================================================
 *  SPIRALEYE Interactive Audio Engine (Web Audio API)
 *  Procedural Game Soundscape, Stem Isolation & Oscilloscope Visualizer
 * ===================================================================
 */

class SpiralAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.analyser = null;
    this.masterGain = null;
    
    // Stems & Gains
    this.stems = {
      ambient: { gainNode: null, isMuted: false, volume: 0.7 },
      melody: { gainNode: null, isMuted: false, volume: 0.65 },
      foley: { gainNode: null, isMuted: false, volume: 0.8 },
      bass: { gainNode: null, isMuted: false, volume: 0.75 }
    };
    
    this.intervalId = null;
    this.currentTime = 0;
    this.duration = 272; // 4:32 in seconds
    this.onTick = null;
    this.onStateChange = null;
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.82;
    
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Initialize Stem Gain nodes
    for (const key in this.stems) {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(this.stems[key].volume, this.ctx.currentTime);
      g.connect(this.masterGain);
      this.stems[key].gainNode = g;
    }
  }

  async resume() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  play() {
    this.resume();
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true);

    this.startMusicSequencer();
    
    this.timerInterval = setInterval(() => {
      this.currentTime += 1;
      if (this.currentTime >= this.duration) {
        this.currentTime = 0;
      }
      if (this.onTick) this.onTick(this.currentTime, this.duration);
    }, 1000);
  }

  pause() {
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange(false);
    clearInterval(this.timerInterval);
    clearInterval(this.sequencerInterval);
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.onTick) this.onTick(this.currentTime, this.duration);
  }

  seekRelative(delta) {
    this.seek(this.currentTime + delta);
  }

  setMasterVolume(val) {
    if (!this.masterGain) return;
    const v = Math.max(0, Math.min(val, 1));
    this.masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
  }

  toggleMuteStem(stemKey) {
    const stem = this.stems[stemKey];
    if (!stem || !stem.gainNode) return false;
    stem.isMuted = !stem.isMuted;
    const targetGain = stem.isMuted ? 0 : stem.volume;
    stem.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    return stem.isMuted;
  }

  // --- Procedural Game Soundscape (Indie Stop-Motion OST) ---
  startMusicSequencer() {
    clearInterval(this.sequencerInterval);
    
    // Warm indie chord scale: C Maj7, Am9, F Maj7, Gadd9 (nostalgic claymation vibe)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C, E, G, B
      [220.00, 261.63, 329.63, 392.00], // A, C, E, G
      [174.61, 220.00, 261.63, 329.63], // F, A, C, E
      [196.00, 246.94, 293.66, 392.00]  // G, B, D, G
    ];

    const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 659.25]; // C5, D5, E5, G5, A5, E5
    let chordIdx = 0;
    let noteIdx = 0;

    this.sequencerInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.step++;

      // 1. Ambient Warm Pad (every 4 bars)
      if (this.step % 8 === 1 && !this.stems.ambient.isMuted) {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        chord.forEach(freq => this.playWarmPad(freq, t, 3.8));
      }

      // 2. Playful Kalimba / Music Box Pluck (Melody)
      if (this.step % 2 === 0 && !this.stems.melody.isMuted) {
        const freq = melodyNotes[noteIdx % melodyNotes.length];
        noteIdx++;
        this.playKalimbaPluck(freq, t);
      }

      // 3. Gentle Stop-Motion Foley (Moss rustle & organic tap)
      if (this.step % 4 === 1 && !this.stems.foley.isMuted) {
        this.playOrganicFoley(t);
      }

      // 4. Sub / Deep Bass Drone
      if (this.step % 8 === 1 && !this.stems.bass.isMuted) {
        const bassFreq = chords[chordIdx % chords.length][0] / 2;
        this.playBassTone(bassFreq, t, 3.5);
      }
    }, 450);
  }

  playWarmPad(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(1400, time + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(600, time + dur);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.12, time + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.stems.ambient.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  playKalimbaPluck(freq, time) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Warm wooden transient
    g.gain.setValueAtTime(0.22, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.85);

    osc.connect(g);
    g.connect(this.stems.melody.gainNode);

    osc.start(time);
    osc.stop(time + 0.9);
  }

  playOrganicFoley(time) {
    // White noise filtered to mimic gentle footsteps on moss
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, time);
    filter.Q.setValueAtTime(2.5, time);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.18, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.stems.foley.gainNode);

    noise.start(time);
  }

  playBassTone(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.25, time + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(g);
    g.connect(this.stems.bass.gainNode);

    osc.start(time);
    osc.stop(time + dur);
  }

  getByteFrequencyData(array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(array);
    }
  }
}

// Global Audio Engine Instance
window.spiralAudio = new SpiralAudioEngine();
