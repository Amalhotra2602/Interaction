import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const TOTAL_FRAMES = 185;
const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;
const FRAMES_DIR = 'out/frames';
const OUTPUT = 'out/vr-tutorial.mp4';

mkdirSync(FRAMES_DIR, { recursive: true });
mkdirSync('out', { recursive: true });

console.log('Launching browser...');
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewportSize({ width: WIDTH, height: HEIGHT });

// Navigate to the Remotion bundle
const bundleUrl = 'http://localhost:3000';
console.log(`Navigating to ${bundleUrl}...`);
await page.goto(bundleUrl, { waitUntil: 'networkidle', timeout: 30000 });

// Wait for the app to be ready
await page.waitForTimeout(2000);

console.log(`Capturing ${TOTAL_FRAMES} frames...`);

for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
  // Use Remotion's URL params to set the frame
  await page.evaluate((f) => {
    // Try to set frame via Remotion's internal API
    if (window.__REMOTION_PLAYER_SEEK) {
      window.__REMOTION_PLAYER_SEEK(f);
    }
  }, frame);

  await page.waitForTimeout(50);

  const padded = String(frame).padStart(5, '0');
  await page.screenshot({
    path: `${FRAMES_DIR}/frame-${padded}.png`,
    clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
  });

  if (frame % 30 === 0) process.stdout.write(`  Frame ${frame}/${TOTAL_FRAMES}\n`);
}

await browser.close();
console.log('Frames captured. Encoding video...');

execSync(
  `ffmpeg -y -framerate ${FPS} -i ${FRAMES_DIR}/frame-%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${OUTPUT}`,
  { stdio: 'inherit' }
);

console.log(`\nDone! Video saved to ${OUTPUT}`);
