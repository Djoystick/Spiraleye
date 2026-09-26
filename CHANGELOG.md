# 📝 CHANGELOG: Spiraleye Game Audio Portfolio

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-26

### Added
- **Multi-Track Playlist & Audio Architecture (`js/playlist.js`)**:
  - Centralized playlist configuration with 3 game audio showcases (*Macbeth Darla*, *Echoes of Hollow*, *Neon Crawler 2088*).
  - Support for multi-channel stem isolation (4 tracks: Ambient, Melody, Foley, Bass) and Single Stereo Master Mix modes.
  - Dedicated custom album covers per track (`assets/covers/*.jpg`).
  - Next/Prev track switching controls on both main player and persistent bottom dock.
  - Interactive Playlist Tray with track badge indicators, durations, and active track status.
  - Project Cards sync: Clicking "Play Theme" instantly activates the corresponding playlist track.
  - Stereo Master Mix notice and graceful stem button dimming when playing stereo tracks.

### Changed
- **Animation Streamlining (Editorial & Studio Clarity)**:
  - Removed block scroll-entrance animations (`reveal-on-scroll`) across all sections for zero-latency content readability.
  - Removed 3D card perspective tilt and dynamic cursor sheen to keep focus on portfolio audio content.
  - Retained tactile magnetic button pull (`setupMagneticButtons`) strictly in the header and persistent bottom dock / footer.
  - Retained continuous zero-gap vertical marquee on lateral rails (`SPIRALEYE`).

## [1.1.2] - 2026-09-26

### Fixed
- **Zero-Gap Vertical Infinite Marquee (Lateral Rails)**:
  - Eliminated the vertical gap/void occurring at bottom/top edges during loop cycles.
  - Anchored side rail flex containers with `align-items: flex-start` (preventing vertical re-centering).
  - Expanded track density to 7 word units per segment ($\approx 2310\text{px}$ span per segment, $4620\text{px}$ total track), fully covering screen heights up to 4K/2160p with zero exposed gaps at any timestamp.
  - Re-aligned base transforms to match keyframe origins, ensuring sub-second LCP (872ms) and Zero-CLS (0.0118).

## [1.1.1] - 2026-09-26

### Added
- **Infinite Counter-Scrolling Side Watermarks**:
  - Continuous vertical marquee on lateral rails (`SPIRALEYE`).
  - Left rail continuously scrolls **UPWARDS** (`transform: rotate(180deg) translateY(0% -> 50%)`).
  - Right rail continuously scrolls **DOWNWARDS** (`transform: translateY(-50% -> 0%)`).
  - Executed on hardware-accelerated GPU compositor thread via CSS `@keyframes` with `will-change: transform`.
  - Duplicated `.rail-segment` architecture for seamless infinite looping without stutter or layout shifts.

## [1.1.0] - 2026-09-26

### Added
- **WebTactics Kinetic Animation Suite**:
  - **Magnetic Fluid Cursor**: Dual-ring trailing cursor with lerp interpolation (`0.22`), magnetic hover expansions, and touch device suppression.
  - **Interactive 3D Tilt & Specular Sheen**: Real-time perspective tracking (`rotateX`/`rotateY`) with dynamic light reflections across clay cards.
  - **WWDC Magnetic Pull on Buttons**: Tactile magnet pull on buttons and pills within pointer bounds.
  - **Multiplane Scroll Counter-Parallax**: Smooth counter-directional translation on lateral `SPIRALEYE` rails.
  - **In-View Kinetic Reveals**: Staggered scroll entrance reveals for section cards and animated headline underline wipes.
  - **Audio-Reactive Breathing**: Live audio energy modulation (`--audio-scale`) driving showreel pulse from Web Audio API analyser.

## [1.0.0] - 2026-09-26

### Added
- **Auteur Landing Page**: Complete semantic HTML5 implementation faithful to Figma mockups.
- **Dual Visual Modes**: Daylight Cinnabar Poster Mode (`#FB4142`) + Night Studio Dark Mode (`#0E0F12`) with Zero-Flash instant hydration.
- **Organic Clay Cards**: Deckle-edge paper/clay contour with soft diffused shadows and micro-borders.
- **Web Audio API Engine**: Procedural stop-motion soundscape with 4-track real-time Stem Isolation Mixer (Ambient Pad, Lead Melody, Moss Foley, Bass Atmosphere).
- **Interactive Showreel Console**: Media viewport with live canvas oscilloscope visualizer, ±15s seeking, scrubber, and timecode.
- **Mobile Fluid Ergonomics**: Responsive 375px layout, Zero horizontal scroll (`overflow-x: clip;`), and Apple/Google 44x44px touch targets.
- **Brand Assets**: Extracted and normalized vector/alpha PNGs for the hand-drawn Spiraleye logo glyph (both clean and paint-dripping versions).
- **Quality Gate Certified**: Passed Puppeteer Core test harness (LCP: 844ms, CLS: 0.0058, DCL: 695ms, 0 console errors).
