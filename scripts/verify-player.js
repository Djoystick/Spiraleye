const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

async function main() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(ROOT_DIR, decodeURIComponent(req.url.split('?')[0]));
    if (req.url === '/' || req.url === '') filePath = path.join(ROOT_DIR, 'index.html');
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  console.log(`Test server running at http://127.0.0.1:${port}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });

  // 1. Initial State Check
  const track1Title = await page.$eval('#player-track-title', el => el.textContent.trim());
  console.log(`1. Initial Track Title: "${track1Title}"`);
  if (!track1Title.includes('Macbeth Darla')) throw new Error('Expected initial track to be Macbeth Darla');

  // 2. Click Next Track
  console.log('2. Testing Next Track button...');
  await page.click('#main-next-btn');
  await new Promise(r => setTimeout(r, 200));
  const track2Title = await page.$eval('#player-track-title', el => el.textContent.trim());
  console.log(`   After Next: "${track2Title}"`);
  if (!track2Title.includes('Echoes of Hollow')) throw new Error('Expected track to be Echoes of Hollow');

  // 3. Click Prev Track
  console.log('3. Testing Prev Track button...');
  await page.click('#main-prev-btn');
  await new Promise(r => setTimeout(r, 200));
  const trackBackTitle = await page.$eval('#player-track-title', el => el.textContent.trim());
  console.log(`   After Prev: "${trackBackTitle}"`);
  if (!trackBackTitle.includes('Macbeth Darla')) throw new Error('Expected track to be Macbeth Darla');

  // 4. Click Track 3 (Stereo Master Mix)
  console.log('4. Testing Playlist Track 3 selection (Stereo mode)...');
  await page.click('.playlist-item[data-track-index="2"]');
  await new Promise(r => setTimeout(r, 200));
  const track3Title = await page.$eval('#player-track-title', el => el.textContent.trim());
  const stereoNoticeDisplay = await page.$eval('#stems-stereo-notice', el => window.getComputedStyle(el).display);
  const muteBtnDisabled = await page.$eval('.mute-btn', el => el.disabled);
  console.log(`   Selected Track 3: "${track3Title}"`);
  console.log(`   Stereo Notice Display: "${stereoNoticeDisplay}", Mute Btn Disabled: ${muteBtnDisabled}`);
  if (!track3Title.includes('Neon Crawler')) throw new Error('Expected track to be Neon Crawler');
  if (stereoNoticeDisplay === 'none') throw new Error('Stereo notice should be visible for stereo track');
  if (!muteBtnDisabled) throw new Error('Mute button should be disabled for stereo track');

  // 5. Test Mini-play button on Project card
  console.log('5. Testing Project Mini Play button for echoes-of-hollow...');
  await page.click('button[data-project-play="echoes-of-hollow"]');
  await new Promise(r => setTimeout(r, 200));
  const trackProjectTitle = await page.$eval('#player-track-title', el => el.textContent.trim());
  console.log(`   Switched via Project card: "${trackProjectTitle}"`);
  if (!trackProjectTitle.includes('Echoes of Hollow')) throw new Error('Expected track to switch to Echoes of Hollow');

  // 6. Test Dock Sync
  const dockTitle = await page.$eval('#dock-title', el => el.textContent.trim());
  console.log(`6. Dock Title: "${dockTitle}"`);
  if (!dockTitle.includes('Echoes of Hollow')) throw new Error('Dock should be synced with active track');

  // 7. Test Stem Muting on multi-track
  console.log('7. Testing Stem Mute Button...');
  const firstMuteBtn = await page.$('[data-stem-mute="ambient"]');
  await firstMuteBtn.click();
  await new Promise(r => setTimeout(r, 200));
  const isMutedClass = await page.$eval('.stem-channel:first-child', el => el.classList.contains('muted'));
  console.log(`   Stem Channel Muted Class Present: ${isMutedClass}`);
  if (!isMutedClass) throw new Error('Stem channel should have muted class after click');

  // 8. Verify no console errors
  if (consoleErrors.length > 0) {
    console.error('Console errors detected:', consoleErrors);
    throw new Error('Verification failed due to console errors');
  }

  console.log('\n=============================================');
  console.log('🎉 ALL 7 PLAYER & STEM INTERACTION TESTS PASSED!');
  console.log('=============================================');

  await browser.close();
  server.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
