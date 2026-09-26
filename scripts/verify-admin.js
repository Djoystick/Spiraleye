const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  process.env.PORT = '3099'; // Use isolated test port
  const { app, server } = require('./admin-server.js');

  console.log('Testing Admin Panel on http://localhost:3099/admin ...');

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
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  await page.goto('http://localhost:3099/admin', { waitUntil: 'networkidle0' });

  // 1. Check Title & Brand
  const title = await page.title();
  console.log(`1. Admin Page Title: "${title}"`);
  if (!title.includes('Spiraleye Studio')) throw new Error('Invalid page title');

  // 2. Check Tracklist Items Loaded
  await page.waitForSelector('.track-card-item');
  const trackCount = await page.$$eval('.track-card-item', els => els.length);
  console.log(`2. Track Cards Rendered: ${trackCount}`);
  if (trackCount < 3) throw new Error(`Expected at least 3 tracks, found ${trackCount}`);

  // 3. Check Form Population on Select
  const initialTitleVal = await page.$eval('#track-title', el => el.value);
  console.log(`3. Form Initial Title Value: "${initialTitleVal}"`);
  if (!initialTitleVal.includes('Macbeth Darla')) throw new Error('First track title not populated');

  // 4. Select Track 3 (Stereo Master)
  console.log('4. Selecting Track 3 (Neon Crawler)...');
  await page.click('.track-card-item:nth-child(3)');
  await new Promise(r => setTimeout(r, 200));

  const track3TitleVal = await page.$eval('#track-title', el => el.value);
  const isStereoActive = await page.$eval('#mode-stereo-btn', el => el.classList.contains('is-active'));
  console.log(`   Track 3 Title in Form: "${track3TitleVal}", Stereo Tab Active: ${isStereoActive}`);
  if (!track3TitleVal.includes('Neon Crawler')) throw new Error('Track 3 not loaded into editor');
  if (!isStereoActive) throw new Error('Stereo tab should be active for Track 3');

  // 5. Test "Новый трек" Button
  console.log('5. Testing "+ Новый трек" button...');
  await page.click('#btn-add-track');
  await new Promise(r => setTimeout(r, 200));
  const newTitleVal = await page.$eval('#track-title', el => el.value);
  console.log(`   New Track Form Title Value (should be empty): "${newTitleVal}"`);
  if (newTitleVal !== '') throw new Error('New track form title should be empty');

  // 6. Test Git Modal Opening
  console.log('6. Testing Git Sync modal...');
  await page.click('#btn-git-sync');
  await new Promise(r => setTimeout(r, 200));
  const isModalOpen = await page.$eval('#git-modal', el => el.classList.contains('is-open'));
  console.log(`   Git Modal Open: ${isModalOpen}`);
  if (!isModalOpen) throw new Error('Git modal did not open');

  await page.click('#git-modal-close');
  await new Promise(r => setTimeout(r, 200));
  const isModalClosed = await page.$eval('#git-modal', el => !el.classList.contains('is-open'));
  console.log(`   Git Modal Closed: ${isModalClosed}`);
  if (!isModalClosed) throw new Error('Git modal did not close');

  // 7. Capture visual screenshot
  const screenshotDir = path.join(ROOT_DIR, '.test-artifacts');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  const previewPath = path.join(screenshotDir, 'admin-preview.png');
  await page.screenshot({ path: previewPath, fullPage: true });
  console.log(`7. Admin Screenshot saved to: ${previewPath}`);

  // 8. Console Errors
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
    throw new Error('Admin page produced console errors');
  }

  console.log('\n=============================================');
  console.log('🎉 ALL ADMIN PANEL AUTOMATION TESTS PASSED!');
  console.log('=============================================');

  await browser.close();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Admin test failed:', err);
  process.exit(1);
});
