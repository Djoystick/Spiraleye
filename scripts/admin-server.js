const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT_DIR = path.resolve(__dirname, '..');
const PLAYLIST_FILE = path.join(ROOT_DIR, 'js', 'playlist.js');
const COVERS_DIR = path.join(ROOT_DIR, 'assets', 'covers');
const AUDIO_DIR = path.join(ROOT_DIR, 'audio');

// Ensure directories exist
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static serving
app.use('/admin', express.static(path.join(ROOT_DIR, 'admin')));
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets')));

// Audio serving with silent fallback for placeholder demo tracks
app.use('/audio', (req, res, next) => {
  const targetPath = path.join(AUDIO_DIR, decodeURIComponent(req.path));
  if (!fs.existsSync(targetPath)) {
    // Return a minimal valid silent MP3 frame so browsers don't report 404 on un-uploaded demo tracks
    const silentMp3 = Buffer.from([
      0xff, 0xe3, 0x18, 0xc4, 0x00, 0x00, 0x00, 0x03, 0x48, 0x00, 0x00, 0x00, 0x00, 0x4c, 0x41, 0x4d,
      0x45, 0x33, 0x2e, 0x39, 0x38, 0x2e, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': silentMp3.length
    });
    return res.end(silentMp3);
  }
  next();
});
app.use('/audio', express.static(AUDIO_DIR));
app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
app.use('/js', express.static(path.join(ROOT_DIR, 'js')));

// Multer storage for Covers
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, COVERS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const safeName = `${base || 'cover'}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});
const uploadCover = multer({ storage: coverStorage });

// Multer storage for Audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const trackId = (req.body.trackId || 'general').replace(/[^a-z0-9_-]/gi, '-');
    const dest = path.join(AUDIO_DIR, trackId);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    const stemKey = (req.body.stemKey || 'audio').replace(/[^a-z0-9_-]/gi, '-');
    const safeName = `${stemKey}${ext}`;
    cb(null, safeName);
  }
});
const uploadAudio = multer({ storage: audioStorage });

// 1. Get current playlist
app.get('/api/playlist', (req, res) => {
  try {
    delete require.cache[require.resolve(PLAYLIST_FILE)];
    const playlistModule = require(PLAYLIST_FILE);
    const playlist = playlistModule.PLAYLIST || [];
    res.json({ success: true, playlist });
  } catch (err) {
    console.error('Error loading playlist:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Save playlist to js/playlist.js
app.post('/api/save-playlist', (req, res) => {
  try {
    const { playlist } = req.body;
    if (!Array.isArray(playlist)) {
      return res.status(400).json({ success: false, error: 'Playlist must be an array' });
    }

    // Backup existing playlist.js
    if (fs.existsSync(PLAYLIST_FILE)) {
      fs.copyFileSync(PLAYLIST_FILE, `${PLAYLIST_FILE}.bak`);
    }

    const playlistFormatted = JSON.stringify(playlist, null, 2);

    const fileContent = `/**
 * ===================================================================
 *  SPIRALEYE — Audio Playlist & Stems Configuration
 *  Managed automatically via Spiraleye Studio Admin
 * ===================================================================
 */

const PLAYLIST = ${playlistFormatted};

// Вспомогательная функция поиска трека по id
function getTrackById(id) {
  return PLAYLIST.find(t => t.id === id) || PLAYLIST[0];
}

if (typeof window !== 'undefined') {
  window.SPIRAL_PLAYLIST = PLAYLIST;
  window.getSpiralTrackById = getTrackById;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PLAYLIST, getTrackById };
}
`;

    fs.writeFileSync(PLAYLIST_FILE, fileContent, 'utf-8');
    res.json({ success: true, message: 'Плейлист успешно сохранен!', count: playlist.length });
  } catch (err) {
    console.error('Error saving playlist:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Upload Cover Art
app.post('/api/upload-cover', uploadCover.single('cover'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл обложки не предоставлен' });
    }
    const relativePath = `assets/covers/${req.file.filename}`;
    res.json({
      success: true,
      url: relativePath,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Error uploading cover:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Upload Audio / Stem
app.post('/api/upload-audio', uploadAudio.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Аудиофайл не предоставлен' });
    }
    const trackId = (req.body.trackId || 'general').replace(/[^a-z0-9_-]/gi, '-');
    const relativePath = `audio/${trackId}/${req.file.filename}`;
    res.json({
      success: true,
      url: relativePath,
      stemKey: req.body.stemKey,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Error uploading audio:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Git Sync (One-click push)
app.post('/api/git-sync', (req, res) => {
  const commitMsg = req.body.message || 'chore(audio): update playlist & audio assets via Spiraleye Studio Admin';
  const cmd = `git add . && git commit -m "${commitMsg.replace(/"/g, '\\"')}" && git push origin main`;

  exec(cmd, { cwd: ROOT_DIR }, (error, stdout, stderr) => {
    if (error) {
      console.error('Git sync error:', stderr || error.message);
      return res.status(500).json({ success: false, error: stderr || error.message, output: stdout });
    }
    res.json({ success: true, message: 'Успешно отправлено на GitHub!', output: stdout });
  });
});

// Root redirect to /admin
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Start Server
const server = app.listen(PORT, () => {
  const adminUrl = `http://localhost:${PORT}/admin`;
  console.log(`\n🎛️  [Spiraleye Studio Admin] Запущен: ${adminUrl}`);
  console.log(`📁  Рабочая директория: ${ROOT_DIR}`);
  console.log(`✨  Нажмите Ctrl + C для остановки сервера.\n`);

  // Launch browser with --start-maximized (strictly respecting user rule 0)
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(chromePath)) {
    exec(`"${chromePath}" --start-maximized "${adminUrl}"`, (err) => {
      if (err) exec(`start ${adminUrl}`);
    });
  } else {
    exec(`start ${adminUrl}`);
  }
});

module.exports = { app, server };
