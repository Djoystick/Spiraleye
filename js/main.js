/**
 * ===================================================================
 *  SPIRALEYE Main Application Logic
 *  Player Interactions, Canvas Visualizer & Tactile State Management
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Zero-Latency Press Interactions (Apple WWDC Fluid Standards)
  setupTactilePressListeners();

  // 2. Theme Management (Zero-Flash Persistent Dark Studio Mode)
  setupThemeManager();

  // 3. Main Showreel & Video/Audio Player Controls
  setupShowreelPlayer();

  // 4. Interactive Stems Sandbox Mixer
  setupStemsMixer();

  // 5. Recent Projects Mini-Players & Bottom Audio Dock
  setupProjectCardPlayers();

  // 6. Audio Waveform Oscilloscope Canvas
  initVisualizerCanvas();
});

/**
 * 1. Zero-Latency Press: Triggers immediate physical micro-compression on pointerdown
 */
function setupTactilePressListeners() {
  const interactiveSelector = '.btn-tactile, .interactive-pill, button, a.btn-link, .ctrl-btn, .project-card, .stem-channel';
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (!target) return;
    target.style.transitionDuration = '40ms';
    target.style.transform = 'scale(0.965)';
  }, { passive: true });

  const releaseHandler = (e) => {
    const target = e.target.closest(interactiveSelector);
    if (!target) return;
    target.style.transitionDuration = '140ms';
    target.style.transform = '';
  };

  document.addEventListener('pointerup', releaseHandler, { passive: true });
  document.addEventListener('pointercancel', releaseHandler, { passive: true });
}

/**
 * 2. Theme Manager: Daylight Figma Poster vs Night Studio Dark Mode
 */
function setupThemeManager() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeIcon = document.getElementById('theme-icon');

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeLabel) themeLabel.textContent = 'Daylight';
      if (themeIcon) themeIcon.setAttribute('data-lucide', 'sun');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeLabel) themeLabel.textContent = 'Night Studio';
      if (themeIcon) themeIcon.setAttribute('data-lucide', 'moon');
    }
    if (window.lucide) lucide.createIcons();
    localStorage.setItem('spiraleye_theme', theme);
  };

  const savedTheme = localStorage.getItem('spiraleye_theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
}

/**
 * 3. Main Showreel Player
 */
function setupShowreelPlayer() {
  const playBtn = document.getElementById('main-play-btn');
  const centerTrigger = document.getElementById('center-play-trigger');
  const centerIcon = document.getElementById('center-play-icon');
  const playIcon = document.getElementById('main-play-icon');
  const rewindBtn = document.getElementById('main-rewind-btn');
  const forwardBtn = document.getElementById('main-forward-btn');
  const progressContainer = document.getElementById('player-progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const progressThumb = document.getElementById('progress-thumb');
  const timecode = document.getElementById('timecode-current');
  const durationText = document.getElementById('timecode-duration');
  const volumeBtn = document.getElementById('main-volume-btn');
  const volumeIcon = document.getElementById('main-volume-icon');

  let isMuted = false;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updatePlayIcons = (isPlaying) => {
    if (playIcon) {
      playIcon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
    }
    if (centerIcon) {
      centerIcon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
    }
    if (centerTrigger) {
      centerTrigger.style.opacity = isPlaying ? '0.35' : '1';
    }
    if (window.lucide) lucide.createIcons();
  };

  // Wire Audio Engine callbacks
  window.spiralAudio.onTick = (current, duration) => {
    const pct = (current / duration) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressThumb) progressThumb.style.left = `${pct}%`;
    if (timecode) timecode.textContent = formatTime(current);
    if (durationText) durationText.textContent = formatTime(duration);

    // Update bottom dock
    updateBottomDockProgress(pct, current);
  };

  window.spiralAudio.onStateChange = (isPlaying) => {
    updatePlayIcons(isPlaying);
    const dock = document.getElementById('bottom-dock');
    if (dock && isPlaying) {
      dock.classList.add('visible');
    }
  };

  const toggleMainPlay = () => {
    window.spiralAudio.togglePlay();
  };

  if (playBtn) playBtn.addEventListener('click', toggleMainPlay);
  if (centerTrigger) centerTrigger.addEventListener('click', toggleMainPlay);

  if (rewindBtn) {
    rewindBtn.addEventListener('click', () => window.spiralAudio.seekRelative(-15));
  }
  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => window.spiralAudio.seekRelative(15));
  }

  // Scrubber scrubbing
  if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(clickX / rect.width, 1));
      const targetSec = pct * window.spiralAudio.duration;
      window.spiralAudio.seek(targetSec);
    });
  }

  if (volumeBtn) {
    volumeBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      window.spiralAudio.setMasterVolume(isMuted ? 0 : 0.8);
      if (volumeIcon) {
        volumeIcon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

/**
 * 4. Stems Mixer Sandbox
 */
function setupStemsMixer() {
  const stemButtons = document.querySelectorAll('[data-stem-mute]');
  stemButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const stemKey = btn.getAttribute('data-stem-mute');
      const channel = btn.closest('.stem-channel');
      const isMuted = window.spiralAudio.toggleMuteStem(stemKey);

      btn.classList.toggle('is-muted', isMuted);
      btn.textContent = isMuted ? 'UNMUTE' : 'MUTE';
      if (channel) {
        channel.classList.toggle('muted', isMuted);
      }
    });
  });
}

/**
 * 5. Recent Projects & Bottom Dock Synchronization
 */
function setupProjectCardPlayers() {
  const playBadges = document.querySelectorAll('[data-project-play]');
  const dock = document.getElementById('bottom-dock');
  const dockPlayBtn = document.getElementById('dock-play-btn');
  const dockPlayIcon = document.getElementById('dock-play-icon');
  const dockTitle = document.getElementById('dock-title');
  const dockSubtitle = document.getElementById('dock-subtitle');

  playBadges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = badge.closest('.project-card');
      const title = card ? card.querySelector('.project-title')?.textContent : 'Macbeth Darla';
      const genre = card ? card.querySelector('.project-genre')?.textContent : 'Indie OST';

      if (dockTitle) dockTitle.textContent = title;
      if (dockSubtitle) dockSubtitle.textContent = genre;

      window.spiralAudio.resume();
      if (!window.spiralAudio.isPlaying) {
        window.spiralAudio.play();
      }
      if (dock) dock.classList.add('visible');
    });
  });

  if (dockPlayBtn) {
    dockPlayBtn.addEventListener('click', () => {
      const isPlaying = window.spiralAudio.togglePlay();
      if (dockPlayIcon) {
        dockPlayIcon.setAttribute('data-lucide', isPlaying ? 'pause' : 'play');
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  // Scroll listener to toggle bottom dock visibility
  window.addEventListener('scroll', () => {
    const showreel = document.getElementById('showreel-section');
    if (!showreel || !dock) return;
    const rect = showreel.getBoundingClientRect();
    if (rect.bottom < 0 && window.spiralAudio.isPlaying) {
      dock.classList.add('visible');
    }
  }, { passive: true });
}

function updateBottomDockProgress(pct, current) {
  // Sync if needed
}

/**
 * 6. Oscilloscope / Real-Time Waveform Visualizer
 */
function initVisualizerCanvas() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const bufferLength = 64;
  const dataArray = new Uint8Array(bufferLength);

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    requestAnimationFrame(draw);
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!window.spiralAudio.isPlaying) {
      return;
    }

    window.spiralAudio.getByteFrequencyData(dataArray);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * (canvas.height * 0.28);
      
      // Warm coral / cinnabar gradient
      ctx.fillStyle = `rgba(251, 65, 66, ${0.15 + (dataArray[i] / 255) * 0.45})`;
      ctx.fillRect(x, canvas.height - barHeight - 4, barWidth - 1, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}
