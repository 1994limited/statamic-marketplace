// Screenshots of Newsletter for its Marketplace listing: the list in the Control Panel, the
// confirmation email and the confirm page. Run against a Statamic site with Newsletter
// installed and some subscribers in it, served locally:
//
//   cd newsletter/tools && npm install
//   SITE=~/Sites/my-site SITE_URL=http://localhost:8092 CP_EMAIL=... CP_PASSWORD=... npm run screenshots
//
// SITE         the site's folder, for a confirm link and the email (php artisan tinker)
// SITE_URL     the site's address (default http://localhost:8092)
// CP_EMAIL     a super user's email and password, to sign in to the Control Panel
// CP_PASSWORD
// SCREENSHOTS  where to write them (default ./screenshots)
// CHROME       a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const site = (process.env.SITE || '').replace(/^~/, process.env.HOME);
const base = (process.env.SITE_URL || 'http://localhost:8092').replace(/\/$/, '');
const out = process.env.SCREENSHOTS || new URL('./screenshots', import.meta.url).pathname;
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!site || !process.env.CP_EMAIL || !process.env.CP_PASSWORD) throw new Error('Set SITE, CP_EMAIL and CP_PASSWORD');
mkdirSync(out, { recursive: true });

const php = (code) => execFileSync('php', ['artisan', 'tinker', '--execute', code], { cwd: site }).toString().trim();

// A pending sign-up's confirm link, and its confirmation email as HTML.
const confirmUrl = php('echo NineteenNinetyFour\\Newsletter\\Models\\Subscriber::where("status", "pending")->firstOrFail()->confirmUrl();');
const email = php('echo (new NineteenNinetyFour\\Newsletter\\Mail\\ConfirmMail(NineteenNinetyFour\\Newsletter\\Models\\Subscriber::where("status", "pending")->firstOrFail()))->render();');
writeFileSync(`${out}/email.html`, email);

const browser = await chromium.launch({ executablePath: chrome });
const desktop = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: 'light' };

async function settle(page) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
}

// The confirmation email, as a mail app would show it.
const mail = await browser.newContext({ ...desktop, viewport: { width: 720, height: 420 } });
const inbox = await mail.newPage();
await inbox.goto(`file://${out}/email.html`);
await settle(inbox);
await inbox.screenshot({ path: `${out}/email.png` });

// The confirm page the link opens.
const visitor = await (await browser.newContext({ ...desktop, viewport: { width: 1280, height: 720 } })).newPage();
await visitor.goto(confirmUrl);
await settle(visitor);
await visitor.screenshot({ path: `${out}/confirm-page.png` });

// The list, signed in.
const cp = await (await browser.newContext(desktop)).newPage();
await cp.goto(`${base}/cp/auth/login`);
await settle(cp);
await cp.locator('input[type=text], input[type=email]').first().fill(process.env.CP_EMAIL);
await cp.locator('input[type=password]').fill(process.env.CP_PASSWORD);
await cp.locator('button[type=submit]').first().click();
await cp.waitForURL((url) => !url.pathname.includes('/auth/'), { timeout: 20000 });

async function quiet(page) {
    await settle(page);
    const snooze = page.getByText('Snooze', { exact: true });
    if (await snooze.count()) await snooze.first().click().catch(() => {});
    await page.waitForTimeout(300);
}

await cp.goto(`${base}/cp/newsletter`);
await quiet(cp);
await cp.screenshot({ path: `${out}/cp-list.png` });

await browser.close();
console.log(`Screenshots in ${out}`);
