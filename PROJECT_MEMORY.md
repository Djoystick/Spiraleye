# 🧠 PROJECT MEMORY: Spiraleye — Game Audio & Music Portfolio

> **Проект:** Официальный сайт-портфолио композитора и саунд-дизайнера инди-игр Max (Spiraleye).  
> **Локация проекта:** `H:\Work\Site_Spiraleye`  
> **Стандарты:** `AGENTS.md` (Non-negotiables), `fluid-design-craft` (Apple WWDC 60fps), `production-web-craft` (Zero-CLS, Quality Gate, LCP < 1.2s).  
> **Дата инициализации:** 26.09.2026.

---

## 1. Честный архитектурный анализ (Disagree When You Disagree)

* **Фактический визуальный референс (Figma):**
  - **Цветовой манифест:** Это НЕ шаблонный «черный сайт» с неоном. Это яркая, авторская эстетика **красного постера и стоп-моушн / claymation** (по мотивам инди-хитов уровня Pikuniku, Chicory, Amanita Design, Sayonara Wild Hearts).
  - **Базовый фон:** Насыщенный теплый киноварно-красный / маковый (`#FB4142`).
  - **Контейнеры (Cards):** Рваная бумага / пластилиновый срез (Deckle-edge paper / Clay cutout) бледно-ледяного оттенка глины (`#E2EFF3`).
  - **Текстовые чернила:** Глубокий благородный бордовый/марсала (`#5E0402`) на красном холсте и глубокий графит/сланец (`#11191B`) внутри бумажных карточек.
  - **Боковые бегущие ленты (Side Rails):** Тон-в-тон вертикальный капс `SPIRALEYE SPIRALEYE` (`#D3191A`), формирующий кинематографический плакатный фрейм.
* **Решение по темному режиму:**
  - Базовый дефолтный слой воспроизводит оригинальный авторский стиль Figma (100% аутентичность).
  - Реализуется бесшовный тактильный тумблер **"Night Studio / Dark Tape"** (для работы в затемненной звукозаписывающей студии) с плавной сменой палитры на глубокий графит `#111115` с сохранением бумажных карточек и теплых коралловых индикаторов.

---

## 2. Дизайн-система и Токены (Design Tokens)

### Цветовая палитра:
```css
:root {
  /* Базовый холст (Figma Canvas) */
  --canvas-bg: #fb4142;
  --canvas-rail-text: #d3191a;
  --canvas-text: #5e0402;
  
  /* Карточки (Clay / Torn Paper Cutout) */
  --card-bg: #e2eff3;
  --card-text-primary: #11191b;
  --card-text-secondary: #4b5563;
  --card-shadow: 0 24px 48px -12px rgba(80, 5, 5, 0.28), 0 8px 16px -6px rgba(0, 0, 0, 0.12);
  
  /* Медиаплеер и консольные элементы */
  --player-bg: #0f1115;
  --player-accent: #fb4142;
  --player-progress: #ffffff;
  
  /* Тактильные микро-границы */
  --interactive-focus: rgba(94, 4, 2, 0.4);
}

/* Ночной режим студии */
[data-theme="dark"] {
  --canvas-bg: #0e0f12;
  --canvas-rail-text: #22252c;
  --canvas-text: #f4f4f5;
  --card-bg: #181a20;
  --card-text-primary: #f4f4f5;
  --card-text-secondary: #9ca3af;
  --card-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6);
}
```

### Типографическая сетка:
* **Заголовки секций:** Geometric Grotesque All-Caps, `letter-spacing: 0.15em`, флюидный `clamp(1.1rem, 2.2vw, 1.6rem)`.
* **Основной текст карточек:** Чистый, тактильный sans-serif (`Plus Jakarta Sans`), `clamp(0.95rem, 1.1vw, 1.05rem)`, `line-height: 1.65`.
* **Боковой маркер (Side Rails):** `writing-mode: vertical-rl; transform: rotate(180deg);` монолитный гротеск с разреженным трекингом.

---

## 3. Анатомия компонентов и Физика движения (Fluid Standards)

1. **Органический контур карточек (Deckle Edge / Clay Cutout):**
   - Реализация через адаптивный CSS SVG `clip-path` и маску волнообразного контура, предотвращающая артефакты пикселизации и обеспечивающая Zero-CLS.
   - Эластичная физика пружин (`damping: 1.0`).
2. **Нулевая задержка нажатия (Zero-Latency Press):**
   - На всех интерактивных элементах (кнопки плеера, треки, ссылки соцсетей):
   - `:active { transform: scale(0.97); transition-duration: 40ms; }` на событие `pointerdown`.
3. **Интерактивный Game Audio Player:**
   - Деморил (видео/аудио) с покадровой синхронизацией и кастомными контроллерами (Play/Pause, Seek ±15s, Scrubbing, Timecode, Volume).
   - Поддержка мультитрекового переключения стемов (Full Mix / Ambience / SFX / Lead Synth) — ключевая фича для портфолио игрового композитора.
4. **Безопасность мобильного скролла:**
   - `overflow-x: clip;` для предотвращения залипания кинетического скролла в мобильных браузерах.

---

## 4. Карта разделов лендинга (Information Architecture)

1. **Header & Brand:** Логотип со стекающей каплей чернил (`spiraleye`), подпись `music & sound design`, навигация (`Projects`, `About`), иконки платформ (Gamepad/Steam/Itch, Email, Twitter/X).
2. **About Me Card:** Персональное вступительное слово («Hi, I'm Max and I love everything related to sound :)»), карточка с эффектом рваного бумажного среза.
3. **Work Demonstration (Showreel Player):** Главный шоурил с игрой *Macbeth Darla*, живым таймлайном, переключением видео/аудио и тактильным управлением.
4. **Recent Projects:** Сетка проектов инди-игр (карточки с саундтреками, стилями: Chiptune, Orchestral, Dark Synth, Ambient, звуковой дизайн монстров/интерфейсов).
5. **Interactive Stem Sandbox:** Интерактивный пульт саунд-дизайнера (возможность в реальном времени замьютить стемы и услышать Foley, атмосферу и музыку отдельно).
6. **Tooling & Middleware:** FMOD, Wwise, Ableton Live, Reaper, аналоговый сетап.
7. **Contact / Hire Me:** Быстрые способы связи (Telegram, Email, Discord, форма запроса сметы на аудиопак).
8. **Persistent Audio Dock:** Плавающий микроплеер внизу экрана для непрерывного прослушивания музыки при скролле.

---

---

## 5. Кинематика и микроанимации (WebTactics Animation Suite)

1. **Fluid Magnetic Cursor:**
   - Двойное кольцо (`#cursor-dot` 6px + `#cursor-ring` 36px) с интерполяцией Lerp (`0.22`).
   - Наведение на кликабельные элементы расширяет кольцо до 58px и переключает цвет.
   - Автоматически отключается на тач-устройствах (`@media (pointer: coarse)`).
2. **3D Tilt & Specular Dynamic Sheen (Физика глиняных карточек):**
   - Интерактивное отслеживание координат курсора над `.deckle-card-wrapper` с расчетом дельты `±3.8deg` (`--tilt-x`, `--tilt-y`).
   - Динамический радиальный блик (`--sheen-x`, `--sheen-y`, `--sheen-opacity`), скользящий по поверхности бумаги.
3. **WWDC Magnetic Pull on Buttons:**
   - Кнопки плавно притягиваются к курсору в радиусе наведения (`translate3d(dx * 0.22, dy * 0.22, 0)`).
4. **Бесконечный вертикальный контр-скролл боковых рельсов (Infinite Counter-Marquee):**
   - Боковые ленты `SPIRALEYE` движутся непрерывно во встречных направлениях: левая сторона поднимается вверх, правая сторона спускается вниз.
   - Анимация вынесена на GPU-поток композитора браузера через CSS `@keyframes` с `will-change: transform`, гарантируя 60/120 FPS без просадок при любом скролле или нагрузке на CPU.
   - Двойной сегмент текста (`.rail-segment`) и цикл 26s обеспечивают идеальную бесшовность.
5. **In-View Kinetic Reveals:**
   - Плавное появление секций из глубины (`translateY(32px) scale(0.985)`) с линией-вайпом под заголовками секций.
6. **Audio-Reactive Breathing:**
   - В реальном времени считывает энергию низких частот из `AudioContext Analyser` и модулирует легкое «дыхание» плеера (`--audio-scale`).

---

## 6. Регламент качества (Quality Gate)
* **LCP:** < 1.2s
* **CLS:** 0.0000 (Zero-CLS)
* **Mobile Viewport:** 375px без горизонтального скролла.
* **Test Harness:** `scripts/test-harness.js` (автоматическая валидация через Puppeteer).
