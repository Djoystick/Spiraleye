/**
 * ===================================================================
 *  SPIRALEYE Interactive Audio Engine (Web Audio API)
 *  Playlist Management, Multi-Stem Isolation & Hybrid Soundscapes
 * ===================================================================
 */

class SpiralAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.analyser = null;
    this.masterGain = null;
    
    // Playlist references
    this.playlist = typeof window !== 'undefined' && window.SPIRAL_PLAYLIST ? window.SPIRAL_PLAYLIST : [];
    this.currentTrackIndex = 0;
    this.currentTrack = this.playlist[0] || null;

    // 4 Stems Architecture & Gain Nodes
    this.stems = {
      ambient: { gainNode: null, isMuted: false, volume: 0.7, label: '🌿 Ambient Pad' },
      melody: { gainNode: null, isMuted: false, volume: 0.65, label: '🎹 Melody / OST' },
      foley: { gainNode: null, isMuted: false, volume: 0.8, label: '🐾 Moss Foley' },
      bass: { gainNode: null, isMuted: false, volume: 0.75, label: '🔊 Bass Atmosphere' }
    };
    
    this.timerInterval = null;
    this.sequencerInterval = null;
    this.currentTime = 0;
    this.duration = this.currentTrack ? this.currentTrack.duration : 272;
    this.step = 0;

    // Real audio elements (if local audio files are loaded)
    this.audioElements = {};

    // Event callbacks
    this.onTick = null;
    this.onStateChange = null;
    this.onTrackChange = null;
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
    
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTime += 1;
      if (this.currentTime >= this.duration) {
        // Auto advance to next track when finished
        this.nextTrack();
        return;
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

  // --- Playlist Navigation ---
  loadTrack(index) {
    if (!this.playlist.length) return;
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    this.currentTrackIndex = (index + this.playlist.length) % this.playlist.length;
    this.currentTrack = this.playlist[this.currentTrackIndex];
    this.duration = this.currentTrack.duration;
    this.currentTime = 0;
    this.step = 0;

    // Reset mute states
    for (const key in this.stems) {
      this.stems[key].isMuted = false;
      if (this.stems[key].gainNode && this.ctx) {
        this.stems[key].gainNode.gain.setValueAtTime(this.stems[key].volume, this.ctx.currentTime);
      }
    }

    if (this.onTrackChange) {
      this.onTrackChange(this.currentTrack, this.currentTrackIndex);
    }
    if (this.onTick) {
      this.onTick(this.currentTime, this.duration);
    }

    if (wasPlaying) {
      this.play();
    }
  }

  nextTrack() {
    this.loadTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    this.loadTrack(this.currentTrackIndex - 1);
  }

  selectTrackById(id) {
    const idx = this.playlist.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.loadTrack(idx);
      if (!this.isPlaying) {
        this.play();
      }
    }
  }

  // --- Procedural Game Soundscapes for Playlist Tracks ---
  startMusicSequencer() {
    clearInterval(this.sequencerInterval);
    const preset = this.currentTrack ? this.currentTrack.soundscapePreset : 'darla';

    if (preset === 'hollow') {
      this.startHollowSequencer();
    } else if (preset === 'crawler') {
      this.startCrawlerSequencer();
    } else {
      this.startDarlaSequencer();
    }
  }

  // Preset 1: Macbeth Darla (Whimsical Claymation Folk)
  startDarlaSequencer() {
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // C Maj7
      [220.00, 261.63, 329.63, 392.00], // Am9
      [174.61, 220.00, 261.63, 329.63], // F Maj7
      [196.00, 246.94, 293.66, 392.00]  // Gadd9
    ];
    const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 659.25];
    let chordIdx = 0;
    let noteIdx = 0;

    this.sequencerInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.step++;

      if (this.step % 8 === 1 && !this.stems.ambient.isMuted) {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        chord.forEach(freq => this.playWarmPad(freq, t, 3.8));
      }

      if (this.step % 2 === 0 && !this.stems.melody.isMuted) {
        const freq = melodyNotes[noteIdx % melodyNotes.length];
        noteIdx++;
        this.playKalimbaPluck(freq, t);
      }

      if (this.step % 4 === 1 && !this.stems.foley.isMuted) {
        this.playOrganicFoley(t);
      }

      if (this.step % 8 === 1 && !this.stems.bass.isMuted) {
        const bassFreq = chords[chordIdx % chords.length][0] / 2;
        this.playBassTone(bassFreq, t, 3.5);
      }
    }, 450);
  }

  // Preset 2: Echoes of Hollow (Gothic Cathedral / Dark Ambient)
  startHollowSequencer() {
    const minorChords = [
      [220.00, 261.63, 329.63, 415.30], // A min (maj7)
      [174.61, 220.00, 261.63, 349.23], // F add9
      [146.83, 220.00, 261.63, 329.63], // D min9
      [164.81, 246.94, 329.63, 392.00]  // E min
    ];
    const bellNotes = [880.00, 659.25, 523.25, 659.25, 783.99, 587.33];
    let chordIdx = 0;
    let bellIdx = 0;

    this.sequencerInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.step++;

      // Deep Organ Cathedral Pad
      if (this.step % 8 === 1 && !this.stems.ambient.isMuted) {
        const chord = minorChords[chordIdx % minorChords.length];
        chordIdx++;
        chord.forEach(freq => this.playOrganPad(freq, t, 4.2));
      }

      // Bell Chimes
      if (this.step % 3 === 0 && !this.stems.melody.isMuted) {
        const freq = bellNotes[bellIdx % bellNotes.length];
        bellIdx++;
        this.playBellChime(freq, t);
      }

      // Cave Water Drops
      if (this.step % 4 === 2 && !this.stems.foley.isMuted) {
        this.playWaterDrop(t);
      }

      // Deep Organ Sub Drone
      if (this.step % 8 === 1 && !this.stems.bass.isMuted) {
        const bassFreq = minorChords[chordIdx % minorChords.length][0] / 2;
        this.playBassTone(bassFreq, t, 4.0);
      }
    }, 520);
  }

  // Preset 3: Neon Crawler 2088 (140 BPM High-Energy Synth)
  startCrawlerSequencer() {
    const synthNotes = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
    let stepIdx = 0;

    this.sequencerInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      this.step++;
      stepIdx++;

      // Arpeggiated Lead Synth
      if (!this.stems.melody.isMuted) {
        const freq = synthNotes[stepIdx % synthNotes.length];
        this.playSynthArp(freq, t);
      }

      // Electro Hi-Hat / Snare
      if (this.step % 2 === 1 && !this.stems.foley.isMuted) {
        this.playElectroHat(t);
      }

      // Driving 808 Bass Kick
      if (this.step % 4 === 1 && !this.stems.bass.isMuted) {
        this.playKickBass(t);
      }

      // Cyber Drone Sweep
      if (this.step % 16 === 1 && !this.stems.ambient.isMuted) {
        this.playWarmPad(110.00, t, 3.2);
      }
    }, 214); // ~140 BPM 16th-groove
  }

  // --- Sound Synthesizers ---
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

  playOrganPad(freq, time, dur) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, time);

    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.08, time + 0.8);
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

    g.gain.setValueAtTime(0.22, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.85);

    osc.connect(g);
    g.connect(this.stems.melody.gainNode);

    osc.start(time);
    osc.stop(time + 0.9);
  }

  playBellChime(freq, time) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    g.gain.setValueAtTime(0.18, time);
    g.gain.exponentialRampToValueAtTime(0.0005, time + 1.4);

    osc.connect(g);
    g.connect(this.stems.melody.gainNode);

    osc.start(time);
    osc.stop(time + 1.5);
  }

  playSynthArp(freq, time) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, time);

    g.gain.setValueAtTime(0.14, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.stems.melody.gainNode);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  playOrganicFoley(time) {
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

  playWaterDrop(time) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, time);
    osc.frequency.exponentialRampToValueAtTime(500, time + 0.08);

    g.gain.setValueAtTime(0.12, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(g);
    g.connect(this.stems.foley.gainNode);

    osc.start(time);
    osc.stop(time + 0.09);
  }

  playElectroHat(time) {
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.15, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(g);
    g.connect(this.stems.foley.gainNode);

    noise.start(time);
  }

  playKickBass(time) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.15);

    g.gain.setValueAtTime(0.35, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(g);
    g.connect(this.stems.bass.gainNode);

    osc.start(time);
    osc.stop(time + 0.28);
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
