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

  // 7. WebTactics Fluid Magnetic Cursor (Desktop)
  setupFluidCursor();

  // 8. Interactive Playlist Controls & Navigation
  setupPlaylistControls();

  // 9. Apple WWDC Magnetic Pull on Header & Footer Buttons
  setupMagneticButtons();

  // 10. Multiplane Infinite Marquee on Lateral Rails
  setupScrollParallax();
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

  window.spiralAudio.onTrackChange = (track, index) => {
    // 1. Cross-fade poster cover
    const poster = document.getElementById('showreel-poster');
    if (poster && track.cover) {
      poster.style.opacity = '0.35';
      setTimeout(() => {
        poster.src = track.cover;
        poster.alt = `${track.title} Cover`;
        poster.style.opacity = '1';
      }, 120);
    }

    // 2. Track badges and details
    const badge = document.getElementById('player-track-badge');
    if (badge) {
      badge.textContent = `TRACK 0${index + 1} / 0${window.spiralAudio.playlist.length} • ${track.hasStems ? 'STEMS' : 'STEREO'}`;
    }

    const trackTitle = document.getElementById('player-track-title');
    if (trackTitle) trackTitle.textContent = track.title;

    const trackSubtitle = document.getElementById('player-track-subtitle');
    if (trackSubtitle) trackSubtitle.textContent = `${track.game} • ${track.genre}`;

    const durEl = document.getElementById('timecode-duration');
    if (durEl) durEl.textContent = track.durationFormatted || formatTime(track.duration);

    // 3. Stems Mixer Mode
    const notice = document.getElementById('stems-stereo-notice');
    const mixerBadge = document.getElementById('mixer-mode-badge');
    const stemMuteBtns = document.querySelectorAll('[data-stem-mute]');
    if (notice) {
      notice.style.display = track.hasStems ? 'none' : 'block';
    }
    if (mixerBadge) {
      mixerBadge.textContent = track.hasStems ? 'Realtime Web Audio API' : 'Stereo Master Mix Mode';
    }
    stemMuteBtns.forEach(btn => {
      btn.disabled = !track.hasStems;
      btn.style.opacity = track.hasStems ? '1' : '0.4';
    });

    // 4. Update Playlist items active state
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === index);
    });

    // 5. Update Bottom Dock
    const dockThumb = document.getElementById('dock-cover-thumb');
    const dockTitle = document.getElementById('dock-title');
    const dockSubtitle = document.getElementById('dock-subtitle');
    if (dockThumb && track.cover) dockThumb.src = track.cover;
    if (dockTitle) dockTitle.textContent = track.title;
    if (dockSubtitle) dockSubtitle.textContent = `${track.game} • Playing Live Interactive Reel`;
  };

  const toggleMainPlay = () => {
    window.spiralAudio.togglePlay();
  };

  if (playBtn) playBtn.addEventListener('click', toggleMainPlay);
  if (centerTrigger) centerTrigger.addEventListener('click', toggleMainPlay);

  const prevBtn = document.getElementById('main-prev-btn');
  const nextBtn = document.getElementById('main-next-btn');
  if (prevBtn) prevBtn.addEventListener('click', () => window.spiralAudio.prevTrack());
  if (nextBtn) nextBtn.addEventListener('click', () => window.spiralAudio.nextTrack());

  const dockPrevBtn = document.getElementById('dock-prev-btn');
  const dockNextBtn = document.getElementById('dock-next-btn');
  if (dockPrevBtn) dockPrevBtn.addEventListener('click', () => window.spiralAudio.prevTrack());
  if (dockNextBtn) dockNextBtn.addEventListener('click', () => window.spiralAudio.nextTrack());

  if (rewindBtn) {
    rewindBtn.addEventListener('click', () => window.spiralAudio.seekRelative(-15));
  }
  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => window.spiralAudio.seekRelative(15));
  }

  // Playlist drawer scroll toggle
  const playlistToggleBtn = document.getElementById('main-playlist-btn');
  const playlistTray = document.getElementById('playlist-tray');
  if (playlistToggleBtn && playlistTray) {
    playlistToggleBtn.addEventListener('click', () => {
      playlistTray.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
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
 * 4. Interactive Playlist Controls
 */
function setupPlaylistControls() {
  const items = document.querySelectorAll('.playlist-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-track-index'), 10);
      if (!isNaN(idx)) {
        window.spiralAudio.loadTrack(idx);
        if (!window.spiralAudio.isPlaying) {
          window.spiralAudio.play();
        }
      }
    });
  });
}

/**
 * 5. Stems Mixer Sandbox
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
 * 6. Recent Projects & Bottom Dock Synchronization
 */
function setupProjectCardPlayers() {
  const playBadges = document.querySelectorAll('[data-project-play]');
  const dock = document.getElementById('bottom-dock');
  const dockPlayBtn = document.getElementById('dock-play-btn');
  const dockPlayIcon = document.getElementById('dock-play-icon');

  playBadges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackId = badge.getAttribute('data-project-play');
      if (trackId) {
        window.spiralAudio.selectTrackById(trackId);
      } else {
        window.spiralAudio.resume();
        if (!window.spiralAudio.isPlaying) {
          window.spiralAudio.play();
        }
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
      document.documentElement.style.setProperty('--audio-scale', '1');
      return;
    }

    window.spiralAudio.getByteFrequencyData(dataArray);

    // Audio-Reactive breathing modulation for showreel
    let bassSum = 0;
    for (let b = 0; b < 6; b++) bassSum += dataArray[b];
    const bassAvg = bassSum / (6 * 255);
    const audioScale = (1 + bassAvg * 0.024).toFixed(4);
    document.documentElement.style.setProperty('--audio-scale', audioScale);

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

/**
 * 7. WebTactics Fluid Magnetic Cursor (Desktop)
 */
function setupFluidCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isVisible = false;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    isVisible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  // Smooth lerp loop for the magnetic outer ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.22;
    ringY += (mouseY - ringY) * 0.22;
    ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover state expansions
  const hoverTargets = 'a, button, .deckle-card, [data-project-play], [data-stem-mute], .progress-container';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hovering');
    }
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove('cursor-hovering');
    }
  }, { passive: true });
}

/**
 * 8. Apple WWDC Magnetic Pull (Strictly on Header & Footer/Dock Buttons)
 */
function setupMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const magnetics = document.querySelectorAll(
    '.site-header .btn-tactile, .site-header .icon-pill, .site-header .theme-switch-btn, .site-header a, .bottom-audio-dock .dock-btn, .site-footer a'
  );

  magnetics.forEach(el => {
    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      el.style.transform = `translate3d(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.22).toFixed(1)}px, 0)`;
    }, { passive: true });

    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    }, { passive: true });
  });
}

/**
 * 9. Multiplane Infinite Marquee on Lateral Rails
 * Handled via hardware-accelerated GPU compositor CSS keyframes (Left: UP, Right: DOWN)
 */
function setupScrollParallax() {
  // Continuous 60/120fps motion is maintained purely on the GPU thread via CSS @keyframes
}
