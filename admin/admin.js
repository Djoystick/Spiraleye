/**
 * ===================================================================
 *  SPIRALEYE STUDIO ADMIN — Client Controller Logic
 * ===================================================================
 */

let state = {
  playlist: [],
  selectedTrackIndex: 0,
  isNewTrack: false,
  activeMode: 'stems', // 'stems' | 'stereo'
  audioCtx: null
};

// DOM Elements
const tracksListContainer = document.getElementById('tracks-list-container');
const trackCountBadge = document.getElementById('track-count-badge');
const editorHeading = document.getElementById('editor-heading');
const editorSubheading = document.getElementById('editor-subheading');

// Inputs
const inputTitle = document.getElementById('track-title');
const inputGame = document.getElementById('track-game');
const inputGenre = document.getElementById('track-genre');
const inputId = document.getElementById('track-id');
const inputPreset = document.getElementById('track-preset');
const inputDesc = document.getElementById('track-desc');
const inputDurFormatted = document.getElementById('track-duration-formatted');
const inputDurSec = document.getElementById('track-duration-sec');

// Cover
const coverDropzone = document.getElementById('cover-dropzone');
const coverFileInput = document.getElementById('cover-file-input');
const coverPreviewImg = document.getElementById('cover-preview-img');
const coverPathLabel = document.getElementById('cover-path-label');
const btnSelectCover = document.getElementById('btn-select-cover');

// Mode Switch
const modeStemsBtn = document.getElementById('mode-stems-btn');
const modeStereoBtn = document.getElementById('mode-stereo-btn');
const stemsSection = document.getElementById('stems-section');
const stereoSection = document.getElementById('stereo-section');

// Stereo
const dropStereo = document.getElementById('drop-stereo');
const stereoFileInput = document.getElementById('stereo-file-input');
const stereoPreviewRow = document.getElementById('stereo-preview-row');
const stereoPathLabel = document.getElementById('stereo-path-label');
const stereoAudioPlayer = document.getElementById('stereo-audio-player');

// Buttons
const btnAddTrack = document.getElementById('btn-add-track');
const btnSaveTrack = document.getElementById('btn-save-track');
const btnSaveBottom = document.getElementById('btn-save-bottom');
const btnDeleteTrack = document.getElementById('btn-delete-track');
const btnRevertTrack = document.getElementById('btn-revert-track');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const btnOpenSite = document.getElementById('btn-open-site');
const btnGitSync = document.getElementById('btn-git-sync');

// Modals & Toast
const gitModal = document.getElementById('git-modal');
const gitModalClose = document.getElementById('git-modal-close');
const gitModalCancel = document.getElementById('git-modal-cancel');
const gitModalSubmit = document.getElementById('git-modal-submit');
const gitCommitMsg = document.getElementById('git-commit-msg');
const gitConsoleLog = document.getElementById('git-console-log');
const toastContainer = document.getElementById('toast-container');

// Audio Context for Auto-Duration
function getAudioContext() {
  if (!state.audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioCtx();
  }
  return state.audioCtx;
}

// Format seconds -> M:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 1. Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 2. Fetch Playlist from server
async function loadPlaylist() {
  try {
    const res = await fetch('/api/playlist');
    const data = await res.json();
    if (data.success && Array.isArray(data.playlist)) {
      state.playlist = data.playlist;
      renderTracklist();
      if (state.playlist.length > 0) {
        selectTrack(0);
      }
    } else {
      showToast('Ошибка загрузки плейлиста', 'error');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Не удалось подключиться к серверу админки', 'error');
  }
}

// 3. Render Tracklist
function renderTracklist() {
  trackCountBadge.textContent = `${state.playlist.length} треков`;
  tracksListContainer.innerHTML = '';

  if (state.playlist.length === 0) {
    tracksListContainer.innerHTML = '<div class="loading-state">Нет треков. Нажмите "+ Новый трек".</div>';
    return;
  }

  state.playlist.forEach((track, index) => {
    const isSelected = index === state.selectedTrackIndex && !state.isNewTrack;
    const card = document.createElement('div');
    card.className = `track-card-item btn-tactile ${isSelected ? 'is-selected' : ''}`;
    card.innerHTML = `
      <img src="../${track.cover || 'assets/covers/macbeth-darla.jpg'}" alt="${track.title}" class="item-thumb">
      <div class="item-info">
        <span class="item-title">${track.title}</span>
        <span class="item-meta">${track.game || 'Game OST'}</span>
        <div class="item-pill-row">
          <span class="${track.hasStems ? 'badge-stems-pill' : 'badge-stereo-pill'}">
            ${track.hasStems ? '4-Track Stems' : 'Stereo Master'}
          </span>
          <span class="item-dur">${track.durationFormatted || formatTime(track.duration || 0)}</span>
        </div>
      </div>
      <div class="item-reorder-actions">
        <button class="btn-arrow" data-action="up" data-idx="${index}" title="Сдвинуть вверх" ${index === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn-arrow" data-action="down" data-idx="${index}" title="Сдвинуть вниз" ${index === state.playlist.length - 1 ? 'disabled' : ''}>▼</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-arrow')) return;
      selectTrack(index);
    });

    tracksListContainer.appendChild(card);
  });

  // Attach reorder listeners
  tracksListContainer.querySelectorAll('.btn-arrow').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      if (action === 'up' && idx > 0) {
        const temp = state.playlist[idx];
        state.playlist[idx] = state.playlist[idx - 1];
        state.playlist[idx - 1] = temp;
        state.selectedTrackIndex = idx - 1;
        savePlaylistToServer('Порядок треков обновлен');
      } else if (action === 'down' && idx < state.playlist.length - 1) {
        const temp = state.playlist[idx];
        state.playlist[idx] = state.playlist[idx + 1];
        state.playlist[idx + 1] = temp;
        state.selectedTrackIndex = idx + 1;
        savePlaylistToServer('Порядок треков обновлен');
      }
    });
  });
}

// 4. Select Track to Edit
function selectTrack(index) {
  if (index < 0 || index >= state.playlist.length) return;
  state.selectedTrackIndex = index;
  state.isNewTrack = false;

  const track = state.playlist[index];
  editorHeading.textContent = `Редактирование: ${track.game || track.title}`;
  editorSubheading.textContent = `ID: ${track.id} • ${track.hasStems ? 'Многоканальные стемы' : 'Стерео мастер'}`;

  // Fill form
  inputTitle.value = track.title || '';
  inputGame.value = track.game || '';
  inputGenre.value = track.genre || '';
  inputId.value = track.id || '';
  inputPreset.value = track.soundscapePreset || 'darla';
  inputDesc.value = track.description || '';
  inputDurFormatted.value = track.durationFormatted || formatTime(track.duration || 0);
  inputDurSec.value = track.duration || 0;

  // Cover
  coverPreviewImg.src = `../${track.cover || 'assets/covers/macbeth-darla.jpg'}`;
  coverPathLabel.textContent = track.cover || 'assets/covers/macbeth-darla.jpg';

  // Mode
  setMode(track.hasStems ? 'stems' : 'stereo');

  // Fill Stems
  ['ambient', 'melody', 'foley', 'bass'].forEach(stemKey => {
    const statusEl = document.getElementById(`status-${stemKey}`);
    const previewEl = document.getElementById(`preview-${stemKey}`);
    const audioEl = previewEl.querySelector('audio');
    const path = track.stems ? track.stems[stemKey] : null;

    if (path) {
      statusEl.textContent = path.split('/').pop();
      statusEl.style.color = '#4ade80';
      audioEl.src = `../${path}`;
      previewEl.style.display = 'block';
    } else {
      statusEl.textContent = 'Не загружен';
      statusEl.style.color = 'var(--text-dim)';
      audioEl.src = '';
      previewEl.style.display = 'none';
    }
  });

  // Fill Stereo
  if (track.audioUrl) {
    stereoPathLabel.textContent = track.audioUrl;
    stereoAudioPlayer.src = `../${track.audioUrl}`;
    stereoPreviewRow.style.display = 'flex';
  } else {
    stereoPathLabel.textContent = 'audio/.../full_mix.mp3';
    stereoAudioPlayer.src = '';
    stereoPreviewRow.style.display = 'none';
  }

  renderTracklist();
}

// 5. Add New Track
function initNewTrack() {
  state.isNewTrack = true;
  state.selectedTrackIndex = -1;

  editorHeading.textContent = 'Новый трек';
  editorSubheading.textContent = 'Заполните информацию о проекте и загрузите дорожки';

  inputTitle.value = '';
  inputGame.value = '';
  inputGenre.value = '';
  inputId.value = '';
  inputPreset.value = 'darla';
  inputDesc.value = '';
  inputDurFormatted.value = '3:00';
  inputDurSec.value = 180;

  coverPreviewImg.src = '../assets/covers/macbeth-darla.jpg';
  coverPathLabel.textContent = 'assets/covers/macbeth-darla.jpg';

  setMode('stems');

  ['ambient', 'melody', 'foley', 'bass'].forEach(stemKey => {
    const statusEl = document.getElementById(`status-${stemKey}`);
    const previewEl = document.getElementById(`preview-${stemKey}`);
    statusEl.textContent = 'Не загружен';
    statusEl.style.color = 'var(--text-dim)';
    previewEl.querySelector('audio').src = '';
    previewEl.style.display = 'none';
  });

  stereoPathLabel.textContent = 'audio/.../full_mix.mp3';
  stereoAudioPlayer.src = '';
  stereoPreviewRow.style.display = 'none';

  renderTracklist();
  inputTitle.focus();
}

// Auto-derive ID slug when typing Title
inputTitle.addEventListener('input', () => {
  if (state.isNewTrack) {
    inputId.value = inputTitle.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

// 6. Mode Switcher
function setMode(mode) {
  state.activeMode = mode;
  if (mode === 'stems') {
    modeStemsBtn.classList.add('is-active');
    modeStereoBtn.classList.remove('is-active');
    stemsSection.style.display = 'grid';
    stereoSection.style.display = 'none';
  } else {
    modeStereoBtn.classList.add('is-active');
    modeStemsBtn.classList.remove('is-active');
    stemsSection.style.display = 'none';
    stereoSection.style.display = 'block';
  }
}

modeStemsBtn.addEventListener('click', () => setMode('stems'));
modeStereoBtn.addEventListener('click', () => setMode('stereo'));

// 7. Cover Upload Handlers
coverDropzone.addEventListener('click', () => coverFileInput.click());
btnSelectCover.addEventListener('click', () => coverFileInput.click());

['dragenter', 'dragover'].forEach(eventName => {
  coverDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    coverDropzone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(eventName => {
  coverDropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    coverDropzone.classList.remove('dragover');
  });
});

coverDropzone.addEventListener('drop', (e) => {
  if (e.dataTransfer.files.length > 0) {
    uploadCoverFile(e.dataTransfer.files[0]);
  }
});

coverFileInput.addEventListener('change', () => {
  if (coverFileInput.files.length > 0) {
    uploadCoverFile(coverFileInput.files[0]);
  }
});

async function uploadCoverFile(file) {
  const formData = new FormData();
  formData.append('cover', file);

  showToast('Загрузка обложки...', 'success');
  try {
    const res = await fetch('/api/upload-cover', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      coverPreviewImg.src = `../${data.url}`;
      coverPathLabel.textContent = data.url;
      showToast('Обложка успешно загружена!', 'success');
    } else {
      showToast(`Ошибка: ${data.error}`, 'error');
    }
  } catch (err) {
    showToast('Сбой загрузки обложки', 'error');
  }
}

// 8. Audio Upload Handlers & Auto-Duration
async function detectAudioDuration(file) {
  try {
    const ctx = getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const duration = Math.round(audioBuffer.duration);
    if (duration > 0) {
      inputDurSec.value = duration;
      inputDurFormatted.value = formatTime(duration);
      showToast(`Хронометраж определен: ${formatTime(duration)}`, 'success');
    }
  } catch (e) {
    console.warn('Could not decode audio duration in browser:', e);
  }
}

// Stems Upload Listeners
document.querySelectorAll('.stem-dropzone-card').forEach(card => {
  const stemKey = card.dataset.stem;
  const dropSlot = card.querySelector('.audio-slot-drop');
  const fileInput = card.querySelector('.stem-file-input');

  dropSlot.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(ev => {
    dropSlot.addEventListener(ev, (e) => {
      e.preventDefault();
      dropSlot.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    dropSlot.addEventListener(ev, (e) => {
      e.preventDefault();
      dropSlot.classList.remove('dragover');
    });
  });

  dropSlot.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length > 0) {
      handleStemUpload(stemKey, e.dataTransfer.files[0], card);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleStemUpload(stemKey, fileInput.files[0], card);
    }
  });
});

async function handleStemUpload(stemKey, file, card) {
  const trackId = inputId.value.trim() || 'custom-track';
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('trackId', trackId);
  formData.append('stemKey', stemKey);

  detectAudioDuration(file);

  const statusEl = card.querySelector('.stem-status');
  statusEl.textContent = 'Загрузка...';

  try {
    const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      statusEl.textContent = file.name;
      statusEl.style.color = '#4ade80';
      const preview = card.querySelector('.stem-audio-preview');
      preview.style.display = 'block';
      preview.querySelector('audio').src = `../${data.url}`;
      card.dataset.uploadedPath = data.url;
      showToast(`Стем ${stemKey} загружен!`, 'success');
    } else {
      statusEl.textContent = 'Ошибка';
      statusEl.style.color = '#ef4444';
      showToast(`Ошибка: ${data.error}`, 'error');
    }
  } catch (err) {
    statusEl.textContent = 'Ошибка сети';
    showToast('Сбой загрузки аудио', 'error');
  }
}

// Stereo Upload Listeners
dropStereo.addEventListener('click', () => stereoFileInput.click());
['dragenter', 'dragover'].forEach(ev => {
  dropStereo.addEventListener(ev, (e) => {
    e.preventDefault();
    dropStereo.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach(ev => {
  dropStereo.addEventListener(ev, (e) => {
    e.preventDefault();
    dropStereo.classList.remove('dragover');
  });
});

dropStereo.addEventListener('drop', (e) => {
  if (e.dataTransfer.files.length > 0) {
    handleStereoUpload(e.dataTransfer.files[0]);
  }
});
stereoFileInput.addEventListener('change', () => {
  if (stereoFileInput.files.length > 0) {
    handleStereoUpload(stereoFileInput.files[0]);
  }
});

async function handleStereoUpload(file) {
  const trackId = inputId.value.trim() || 'custom-track';
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('trackId', trackId);
  formData.append('stemKey', 'full_mix');

  detectAudioDuration(file);

  showToast('Загрузка стерео-мастера...', 'success');
  try {
    const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      stereoPathLabel.textContent = data.url;
      stereoAudioPlayer.src = `../${data.url}`;
      stereoPreviewRow.style.display = 'flex';
      stereoSection.dataset.uploadedPath = data.url;
      showToast('Стерео-мастер успешно сохранен!', 'success');
    } else {
      showToast(`Ошибка: ${data.error}`, 'error');
    }
  } catch (err) {
    showToast('Сбой загрузки аудио', 'error');
  }
}

// 9. Save Track Logic
async function saveCurrentTrack() {
  const title = inputTitle.value.trim();
  const game = inputGame.value.trim();
  const id = inputId.value.trim();

  if (!title || !game || !id) {
    showToast('Пожалуйста, заполните Название, Игру и ID трека', 'error');
    return;
  }

  const durationSec = parseInt(inputDurSec.value, 10) || 180;
  const durationFormatted = inputDurFormatted.value.trim() || formatTime(durationSec);
  const coverPath = coverPathLabel.textContent.trim();
  const hasStems = state.activeMode === 'stems';

  let stemsObj = {};
  if (hasStems) {
    document.querySelectorAll('.stem-dropzone-card').forEach(card => {
      const key = card.dataset.stem;
      const uploaded = card.dataset.uploadedPath;
      if (uploaded) {
        stemsObj[key] = uploaded;
      } else if (!state.isNewTrack && state.playlist[state.selectedTrackIndex]?.stems?.[key]) {
        stemsObj[key] = state.playlist[state.selectedTrackIndex].stems[key];
      } else {
        stemsObj[key] = `audio/${id}/${key}.mp3`;
      }
    });
  }

  const audioUrl = !hasStems 
    ? (stereoSection.dataset.uploadedPath || (!state.isNewTrack ? state.playlist[state.selectedTrackIndex]?.audioUrl : `audio/${id}/full_mix.mp3`))
    : undefined;

  const trackData = {
    id,
    title,
    game,
    genre: inputGenre.value.trim() || 'Indie Game OST',
    duration: durationSec,
    durationFormatted,
    cover: coverPath,
    hasStems,
    soundscapePreset: inputPreset.value,
    description: inputDesc.value.trim()
  };

  if (hasStems) {
    trackData.stems = stemsObj;
  } else {
    trackData.audioUrl = audioUrl;
  }

  if (state.isNewTrack) {
    state.playlist.push(trackData);
    state.selectedTrackIndex = state.playlist.length - 1;
    state.isNewTrack = false;
  } else {
    state.playlist[state.selectedTrackIndex] = trackData;
  }

  await savePlaylistToServer('Трек успешно сохранен!');
}

async function savePlaylistToServer(successMsg) {
  try {
    const res = await fetch('/api/save-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlist: state.playlist })
    });
    const data = await res.json();
    if (data.success) {
      showToast(successMsg || 'Плейлист сохранен!', 'success');
      renderTracklist();
      selectTrack(state.selectedTrackIndex);
    } else {
      showToast(`Ошибка: ${data.error}`, 'error');
    }
  } catch (err) {
    showToast('Сбой сохранения на сервер', 'error');
  }
}

// 10. Delete Track
btnDeleteTrack.addEventListener('click', () => {
  if (state.isNewTrack) {
    selectTrack(0);
    return;
  }
  const track = state.playlist[state.selectedTrackIndex];
  if (confirm(`Вы уверены, что хотите удалить трек "${track.title}" из плейлиста?`)) {
    state.playlist.splice(state.selectedTrackIndex, 1);
    state.selectedTrackIndex = Math.max(0, state.selectedTrackIndex - 1);
    savePlaylistToServer('Трек удален из плейлиста');
  }
});

// Event Bindings
btnSaveTrack.addEventListener('click', saveCurrentTrack);
btnSaveBottom.addEventListener('click', saveCurrentTrack);
btnAddTrack.addEventListener('click', initNewTrack);
btnRevertTrack.addEventListener('click', () => {
  if (state.isNewTrack) initNewTrack();
  else selectTrack(state.selectedTrackIndex);
});
btnCancelEdit.addEventListener('click', () => selectTrack(0));

// Open Live Site
btnOpenSite.addEventListener('click', () => {
  window.open('http://localhost:3000', '_blank');
});

// Git Sync Modal
btnGitSync.addEventListener('click', () => {
  gitModal.classList.add('is-open');
  gitModal.setAttribute('aria-hidden', 'false');
});

function closeGitModal() {
  gitModal.classList.remove('is-open');
  gitModal.setAttribute('aria-hidden', 'true');
  gitConsoleLog.style.display = 'none';
}

gitModalClose.addEventListener('click', closeGitModal);
gitModalCancel.addEventListener('click', closeGitModal);

gitModalSubmit.addEventListener('click', async () => {
  const message = gitCommitMsg.value.trim() || 'chore: update playlist via Spiraleye Studio';
  const btnText = gitModalSubmit.querySelector('.btn-text');
  const btnSpinner = gitModalSubmit.querySelector('.btn-spinner');

  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';
  gitModalSubmit.disabled = true;

  try {
    const res = await fetch('/api/git-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    gitConsoleLog.style.display = 'block';
    gitConsoleLog.textContent = data.output || data.error || 'Операция завершена.';

    if (data.success) {
      showToast('Успешно отправлено на GitHub!', 'success');
    } else {
      showToast('Ошибка при синхронизации с Git', 'error');
    }
  } catch (err) {
    showToast('Сетевой сбой при Git sync', 'error');
  } finally {
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    gitModalSubmit.disabled = false;
  }
});

// Tactile micro-compression (Apple WWDC Fluid Standards)
function setupTactilePress() {
  const selector = '.btn-tactile, .btn, .seg-btn, .audio-slot-drop, .cover-dropzone, .track-card-item';
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest(selector);
    if (!target) return;
    target.style.transitionDuration = '40ms';
    target.style.transform = 'scale(0.97)';
  }, { passive: true });

  const releaseHandler = (e) => {
    const target = e.target.closest(selector);
    if (!target) return;
    target.style.transitionDuration = '120ms';
    target.style.transform = '';
  };
  document.addEventListener('pointerup', releaseHandler, { passive: true });
  document.addEventListener('pointercancel', releaseHandler, { passive: true });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  setupTactilePress();
  loadPlaylist();
});
