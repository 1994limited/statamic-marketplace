// Screenshots of Dog-ear Books for Cookie Connect for Craft's docs, taken
// with the pretend consent platform chosen (see README.md).
//
//   cd cookie-connect-craft/tools && npm install && npm run screenshots
//
// DEMO         the demo's folder (default ../../../cookie-connect-craft-demo, beside this repo)
// DEMO_URL     the demo's address (default https://cookie-connect-craft-demo.test)
// SCREENSHOTS  where to write them (default ../charts, this addon's README and docs images)
// CHROME       a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer';

const base = (process.env.DEMO_URL || 'https://cookie-connect-craft-demo.test').replace(/\/$/, '');
const out = process.env.SCREENSHOTS || new URL('../charts', import.meta.url).pathname;
const demo = (process.env.DEMO || new URL('../../../cookie-connect-craft-demo', import.meta.url).pathname).replace(/\/?$/, '/');
const here = new URL('.', import.meta.url).pathname;
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const settle = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, args: ['--ignore-certificate-errors'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }]);

// The site, as a first-time visitor sees it: the platform's banner, the video held back.
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.removeItem('fake-cmp'));
await page.goto(`${base}/`, { waitUntil: 'networkidle0' });
await settle(5500); // the pretend platform says nothing until asked, so Cookie Connect gives up waiting after five seconds
await page.screenshot({ path: `${out}/site-before.png` });

// After allowing marketing only: the video runs, analytics doesn't.
await page.evaluate(() => { document.querySelector('input[name=marketing]').click(); document.querySelector('[data-a=save]').click(); });
await settle(1500);
await page.screenshot({ path: `${out}/site-after.png` });

// The control panel page with Cookiebot chosen (an example ID), then the pretend platform back.
execFileSync('php', ['scripts/use-platform.php', `${here}cookiebot.json`], { cwd: demo });
const link = execFileSync('php', ['craft', 'users/impersonate', 'admin'], { cwd: demo, encoding: 'utf8' }).match(/https?:\/\/\S+/)[0];
await page.goto(link, { waitUntil: 'networkidle0' });
await page.goto(`${base}/admin/cookie-connect`, { waitUntil: 'networkidle0' });
await page.addStyleTag({ content: '#notifications, #global-footer, #trial-info, #devmode, .cc-provider[hidden] { display: none !important; }' });
await settle();
await page.screenshot({ path: `${out}/control-panel.png`, fullPage: false });
await page.evaluate(() => window.scrollTo(0, document.querySelector('#settings-cc-scripts-field, [id$=cc-scripts-field]')?.getBoundingClientRect().top + window.scrollY - 120));
await settle(500);
await page.screenshot({ path: `${out}/control-panel-scripts.png`, fullPage: false });
execFileSync('php', ['scripts/use-platform.php', `${here}pretend.json`], { cwd: demo });

await browser.close();
console.log(`Saved to ${out}`);
