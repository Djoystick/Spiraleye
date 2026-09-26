<div align="center">

  <img src="https://raw.githubusercontent.com/Djoystick/Spiraleye/main/assets/social-preview.png" alt="Spiraleye — Music & Sound Design for Indie Games" width="100%">

  <br><br>

  <h1>spiraleye — music & sound design</h1>

  <p>
    <strong>Auteur portfolio &amp; interactive sound design showcase for indie games.</strong><br>
    Crafted with tactile fluid physics, deckle-edge clay cards, a real-time Web Audio API stem mixer, and a visual studio admin console.
  </p>

  <p>
    <a href="https://github.com/Djoystick/Spiraleye"><img src="https://img.shields.io/badge/Version-v1.3.0-fb4142?style=for-the-badge" alt="Version 1.3.0"></a>
    <a href="https://github.com/Djoystick/Spiraleye"><img src="https://img.shields.io/badge/Quality_Gate-PASSED-22c55e?style=for-the-badge&logo=checkmarx" alt="Quality Gate Passed"></a>
    <a href="https://github.com/Djoystick/Spiraleye"><img src="https://img.shields.io/badge/Studio_Admin-Visual_Console-8b5cf6?style=for-the-badge&logo=electron" alt="Studio Admin"></a>
    <a href="https://github.com/Djoystick/Spiraleye"><img src="https://img.shields.io/badge/Audio_Engine-Web_Audio_API-f97316?style=for-the-badge&logo=audacity" alt="Web Audio API"></a>
    <a href="https://github.com/Djoystick/Spiraleye"><img src="https://img.shields.io/badge/Deploy-Vercel_Ready-000000?style=for-the-badge&logo=vercel" alt="Vercel Ready"></a>
  </p>

</div>

---

## 🎛️ 1. Spiraleye Studio — Визуальная панель управления (Admin Console)

В проект встроена автономная **локальная визуальная админка**, позволяющая композитору и саунд-дизайнеру добавлять треки, обложки и многоканальные стемы **без ручного редактирования кода** и риска синтаксических ошибок.

### Быстрый запуск админки:

```bash
npm run admin
```

Команда автоматически запустит локальный сервер и откроет в браузере:  
👉 **`http://localhost:3001/admin`**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  SPIRALEYE STUDIO CONSOLE v1.3                   [● Live Engine]  [🚀 Git Push]│
├─────────────────────────┬──────────────────────────────────────────────────────┤
│  ТРЕКЛИСТ ПОРТФОЛИО     │  РЕДАКТОР ТРЕКА & МЕТАДАННЫЕ                         │
│  [+ Новый трек]         │  - Название, игра, жанр, описание                    │
│                         ├───────────────────────────┬──────────────────────────┤
│  1. Macbeth Darla    ▲▼ │  ОБЛОЖКА (DRAG & DROP)    │  РЕЖИМ ВОСПРОИЗВЕДЕНИЯ   │
│     [4-Track Stems]     │  [ Перетащите картинку ]  │  (•) 4-Track Stems       │
│                         │  Авто-сохранение в covers │  ( ) Stereo Master Mix   │
│  2. Echoes of Hollow ▲▼ ├───────────────────────────┴──────────────────────────┤
│     [4-Track Stems]     │  СЛОТЫ АУДИОДОРОЖЕК (DRAG & DROP)                    │
│                         │  🌿 Ambient | 🎻 Melody | 🍃 Foley | 🔊 Bass         │
│  3. Neon Crawler     ▲▼ │  [ Аудиоплееры предпрослушивания + авто-хронометраж ] │
│     [Stereo Master]     ├──────────────────────────────────────────────────────┤
│                         │  [Удалить трек]          [💾 Сохранить в плейлист]   │
└─────────────────────────┴──────────────────────────────────────────────────────┘
```

### Возможности админки:

1. **Загрузка обложек (Drag & Drop):**
   - Перетащите любую картинку (JPG, PNG, WebP) в поле обложки.
   - Система автоматически сохранит файл в `assets/covers/` и сформирует превью.
2. **Два режима аудио:**
   - **🎛️ 4-Track Stems (Мультитрек):** 4 слота для перетаскивания файлов (*Ambient*, *Melody*, *Foley*, *Bass*). На сайте для них будет работать интерактивный пульт глушения инструментов (MUTE).
   - **📻 Stereo Master Mix (Один файл):** слот для готового мастер-трека.
3. **Авто-детекция длительности (Web Audio API):**
   - Админка мгновенно считывает точный хронометраж загруженного файла прямо в браузере и автоматически заполняет поля длительности (секунды `272` и читаемый формат `4:32`).
4. **Управление порядком (Reorder):**
   - Меняйте порядок треков в плеере на сайте кликом по стрелкам **▲ / ▼**.
5. **Безопасное сохранение:**
   - Данные валидируются и записываются в `js/playlist.js` с автоматическим созданием резервной копии `.bak`.
6. **Синхронизация с GitHub и Vercel в 1 клик:**
   - Нажмите кнопку **«🚀 Запушить на GitHub»** в шапке админки.
   - Все добавленные обложки, аудиофайлы и плейлист моментально отправятся в репозиторий, а **Vercel автоматически обновит ваш сайт в сети за 15 секунд**.

---

## ☁️ 2. Как устроен деплой на Vercel (GitOps 24/7)

```
[ Локальный ПК (npm run admin) ]
             │
             ▼ (Кнопка «🚀 Запушить на GitHub»)
   [ GitHub Репозиторий ] (Файлы хранятся вечно)
             │
             ▼ (Автоматический Webhook)
     [ Vercel CDN ] (Глобальная сеть серверов раздает сайт 24/7)
```

- **Автономность от вашего ПК:** После нажатия кнопки «Запушить на GitHub» все медиафайлы и обложки физически сохраняются на серверах GitHub и Vercel. 
- **Компьютер можно выключать:** Сайт продолжает работать, играть музыку и показывать обложки 24/7 по всему миру независимо от вашего устройства.
- Локальная админка нужна **только в момент добавления нового контента**.

---

## 🎨 3. Визуальный стиль и концепция (Figma Accurate)

**Spiraleye** — авторское портфолио в эстетике инди-геймдева (Pikuniku, Chicory, Amanita Design, Sayonara Wild Hearts):

* **Daylight Poster Mode (Базовый авторский режим):**
  * Холст: теплый маковый киноварно-красный (`#FB4142`).
  * Боковые рельсы: бесконечный встречный счетчик-скролл `SPIRALEYE` (`#D3191A`).
  * Карточки: органический пластилиновый срез (Deckle-edge paper / Clay cutout) бледно-ледяного оттенка (`#E2EFF3`).
  * Шрифты: глубокий бордовый (`#5E0402`) и темный сланец (`#11191B`).
* **Night Studio Mode (Студийный темный режим):**
  * Плавное переключение на глубокий студийный графит (`#0E0F12`) для работы в затемненной звукозаписывающей студии.
  * Мгновенная Zero-Flash гидратация из `localStorage`.

---

## 🎵 4. Интерактивный плеер и изоляция стемов

Вместо статичных скриншотов сайт оснащен полноценным игровым аудио-комбайном:

* **Интерактивный пульт Stems Isolation:**
  * 4 канала: 🌿 **Ambient Pad**, 🎻 **Lead Melody**, 🍃 **Moss Foley**, 🔊 **Bass / Sub**.
  * Мгновенное глушение дорожек кнопками **MUTE** через плавное экспоненциальное затухание Web Audio API `GainNode` (без щелчков).
* **Стерео-режим (Stereo Master Mix):**
  * Для треков с единым мастер-файлом пульт автоматически отображает режим *Stereo Master Mix* и деликатно приглушает кнопки стемов.
* **Синхронизация обложек:**
  * Обложка трека синхронно обновляется в главном окне консоли, списке плейлиста и плавающем нижнем доке.
* **Осциллограф 60 FPS:**
  * Отображение суммарной частотной формы волны активных инструментов в реальном времени.

---

## ⚡ 5. Quality Gate & Стандарты надежности

Проект сертифицирован через автоматизированный harness на базе Chrome Puppeteer:

| Метрика | Допуск | Результат | Статус |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | `< 1200 ms` | **636 ms** | ✅ PASSED |
| **CLS (Cumulative Layout Shift)** | `< 0.0200` | **0.0104 (Zero-CLS)** | ✅ PASSED |
| **DCL (DOMContentLoaded)** | `< 800 ms` | **542 ms** | ✅ PASSED |
| **Ошибки консоли браузера** | `0 ошибок` | **0 ошибок** | ✅ PASSED |
| **Адаптивность под мобильные** | 375px (iPhone) | **Zero horizontal scroll (`overflow-x: clip;`)** | ✅ PASSED |
| **Тактильный отклик (WWDC)** | Мгновенный отклик | **`:active { transform: scale(0.97); }` (80ms)** | ✅ PASSED |

---

## 📁 6. Структура проекта

```text
├── admin/                        # 🎛️ Локальная визуальная панель управления
│   ├── index.html                # Интерфейс админки
│   ├── admin.css                 # Стили темной студийной консоли
│   └── admin.js                  # Загрузка файлов, Web Audio авто-хронометраж, Git sync
├── assets/
│   ├── covers/                   # Обложки треков (macbeth-darla, echoes-of-hollow и др.)
│   ├── logo_clean_alpha.png      # Фирменный векторный логотип
│   └── social-preview.png        # Social card для GitHub и соцсетей
├── audio/                        # Папки с аудиодорожками (audio/<track-id>/<stem>.mp3)
├── css/
│   └── styles.css                # Дизайн-токены, рваные карточки, стили плеера
├── js/
│   ├── playlist.js               # 🎵 Конфигурация треков, обложек и стемов
│   ├── audio-engine.js           # Web Audio API движок, синтезаторы, стем-микшер
│   └── main.js                   # Контроллеры плеера, осциллограф, тактильность
├── scripts/
│   ├── admin-server.js           # Сервер локальной админки (Express + Multer)
│   ├── verify-admin.js           # Сквозное E2E тестирование админки
│   ├── test-harness.js           # Quality Gate & Core Web Vitals аудит
│   └── visual-regression.js      # Сравнение скриншотов с эталоном
├── index.html                    # Главная страница портфолио
├── package.json                  # Конфигурация npm и скрипты
├── CHANGELOG.md                  # История версий (v1.3.0)
└── PROJECT_MEMORY.md             # Архитектурная память проекта
```

---

## 🚀 7. Локальный запуск и разработка

```bash
# 1. Клонирование репозитория
git clone https://github.com/Djoystick/Spiraleye.git
cd Spiraleye

# 2. Установка зависимостей
npm install

# 3. Запуск сайта портфолио (http://localhost:3000)
npm start

# 4. Запуск визуальной админки (http://localhost:3001/admin)
npm run admin

# 5. Прогон тестов Quality Gate
npm run test:harness
```

---

## 📬 8. Контакты

* **Композитор и саунд-дизайнер:** Max (Spiraleye)
* **Telegram:** [@spiraleye](https://t.me/spiraleye)
* **Специализация:** Adaptive OST, Foley, Interactive FMOD/Wwise Implementation for Indie Games.

---

<div align="center">
  <sub>© 2026 Max (Spiraleye). Crafted with pure passion for indie games.</sub>
</div>
