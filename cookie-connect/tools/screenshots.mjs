// Screenshots of Dog-ear Books for Cookie Connect for Statamic's docs.
//
//   cd cookie-connect/tools && npm install && npm run screenshots
//
// DEMO         the demo's folder (default ../../../cookie-connect-statamic-demo, beside this repo)
// DEMO_URL     the demo's address (default https://cookie-connect-statamic-demo.test)
// SCREENSHOTS  where to write them (default ../charts, this addon's README and docs images)
// CHROME       a Chrome or Chromium to drive (default: Google Chrome on macOS)
// The Control Panel is signed into as admin@example.com / password (php artisan demo:users).
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer';

const base = (process.env.DEMO_URL || 'https://cookie-connect-statamic-demo.test').replace(/\/$/, '');
const out = process.env.SCREENSHOTS || new URL('../charts', import.meta.url).pathname;
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const demo = (process.env.DEMO || new URL('../../../cookie-connect-statamic-demo', import.meta.url).pathname).replace(/\/?$/, '/');
const settings = `${demo}resources/cookie-connect/default.yaml`;
const settle = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);

await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.removeItem('fake-cmp'));
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await settle(5500);
await page.screenshot({ path: `${out}/site-before.png` });

await page.evaluate(() => { document.querySelector('input[name=marketing]').click(); document.querySelector('[data-a=save]').click(); });
await settle(1500);
await page.screenshot({ path: `${out}/site-after.png` });

// The Control Panel with Cookiebot chosen (an example ID), then the pretend platform back.
const pretend = readFileSync(settings, 'utf8');
copyFileSync(new URL('./cookiebot.yaml', import.meta.url).pathname, settings);

try {
    await page.goto(`${base}/cp/auth/login`, { waitUntil: 'networkidle0' });
    await page.type('input[type=text], input[type=email]', 'admin@example.com');
    await page.type('input[type=password]', 'password');
    await Promise.all([page.waitForNavigation(), page.keyboard.press('Enter')]);
    await page.goto(`${base}/cp/cookie-connect`, { waitUntil: 'networkidle0' });
    await settle(2000);
    // The local site runs Statamic Pro as a trial, which says so in a dialog. That isn't the addon.
    await page.evaluate(() => [...document.querySelectorAll('button, [role=button], div')].find((el) => el.textContent.trim() === 'Snooze')?.click());
    await settle(800);
    await page.screenshot({ path: `${out}/control-panel.png` });

    await page.evaluate(() => [...document.querySelectorAll('h2, h3, div')].find((el) => el.textContent.trim() === 'Scripts')?.scrollIntoView());
    await page.evaluate(() => window.scrollBy(0, -80));
    await settle(600);
    await page.screenshot({ path: `${out}/control-panel-scripts.png` });
} finally {
    writeFileSync(settings, pretend);
}

await browser.close();
console.log(`Saved to ${out}`);
