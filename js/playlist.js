/**
 * ===================================================================
 *  SPIRALEYE — Audio Playlist & Stems Configuration
 *  
 *  ИНСТРУКЦИЯ ПО ДОБАВЛЕНИЮ СВОИХ ТРЕКОВ:
 *  1. Обложки: положите картинку (JPG/PNG/WebP, рекомендуемый размер 1200x675 или квадрат)
 *     в папку `assets/covers/your-cover.jpg` и укажите путь в поле `cover`.
 *  2. Аудиофайлы со стемами (4 дорожки):
 *     Положите дорожки в папку, например `audio/track_name/`:
 *     - ambient: 'audio/your_track/ambient.mp3'
 *     - melody:  'audio/your_track/melody.mp3'
 *     - foley:   'audio/your_track/foley.mp3'
 *     - bass:    'audio/your_track/bass.mp3'
 *     И установите `hasStems: true`.
 *  3. Обычный трек (один готовый MP3 стерео-микс):
 *     Укажите `hasStems: false` и путь в `audioUrl: 'audio/your_track/full_mix.mp3'`.
 * ===================================================================
 */

const PLAYLIST = [
  {
    id: 'macbeth-darla',
    title: 'Macbeth Darla — Meadow Explorations',
    game: 'Macbeth Darla',
    genre: 'Adaptive OST / Stop-Motion',
    duration: 272, // 4:32 в секундах
    durationFormatted: '4:32',
    cover: 'assets/covers/macbeth-darla.jpg',
    hasStems: true,
    stems: {
      ambient: 'audio/darla/ambient.mp3',
      melody: 'audio/darla/melody.mp3',
      foley: 'audio/darla/foley.mp3',
      bass: 'audio/darla/bass.mp3'
    },
    soundscapePreset: 'darla',
    description: 'Живой стоп-моушн саундскейп с винтажным пианино, калимбой и звуками шуршания мха.'
  },
  {
    id: 'echoes-of-hollow',
    title: 'Echoes of Hollow — Sunken Cathedral',
    game: 'Echoes of Hollow',
    genre: 'Isometric Mystery / Dark Fantasy',
    duration: 195, // 3:15
    durationFormatted: '3:15',
    cover: 'assets/covers/echoes-of-hollow.jpg',
    hasStems: true,
    stems: {
      ambient: 'audio/hollow/cathedral_pad.mp3',
      melody: 'audio/hollow/bell_chimes.mp3',
      foley: 'audio/hollow/water_drops.mp3',
      bass: 'audio/hollow/deep_organ_sub.mp3'
    },
    soundscapePreset: 'hollow',
    description: 'Интерактивная адаптивная партитура для FMOD с мрачным органом, колоколами и каплями воды.'
  },
  {
    id: 'cyber-crawler',
    title: 'Neon Crawler 2088 — Boss Core Overdrive',
    game: 'Soul Crawler 2088',
    genre: 'Chiptune / Cyberpunk Synth (140 BPM)',
    duration: 168, // 2:48
    durationFormatted: '2:48',
    cover: 'assets/covers/cyber-crawler.jpg',
    hasStems: false, // Режим стерео-мастера
    audioUrl: 'audio/crawler/full_mix.mp3',
    soundscapePreset: 'crawler',
    description: 'Плотный высокоскоростной босс-файт трек в стерео-миксе с аналоговыми синтами и чиптюн-басом.'
  }
];

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

