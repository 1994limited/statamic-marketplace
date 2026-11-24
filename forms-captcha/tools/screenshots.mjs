// Screenshots of Forms Captcha for its README and docs: a form with the widget, the same form
// refused, and the Captcha field in the forms builder. Run against the demo
// (forms-captcha-statamic-demo), served locally with Turnstile's test keys:
//
//   cd forms-captcha/tools && npm install
//   SITE_URL=http://forms-captcha-demo.test CP_EMAIL=... CP_PASSWORD=... npm run screenshots
//
// SITE_URL     the demo's address (default http://localhost:8000)
// CP_EMAIL     a super user's email and password, to sign in to the Control Panel
// CP_PASSWORD
// SCREENSHOTS  where to write them (default ./screenshots)
// CHROME       a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const base = (process.env.SITE_URL || 'http://localhost:8000').replace(/\/$/, '');
const out = process.env.SCREENSHOTS || new URL('./screenshots', import.meta.url).pathname;
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!process.env.CP_EMAIL || !process.env.CP_PASSWORD) throw new Error('Set CP_EMAIL and CP_PASSWORD');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: chrome });
const desktop = { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' };

async function settle(page, wait = 800) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(wait);
}

// The widget needs a moment to load and pass.
const waitForToken = (page) => page.waitForFunction(() => {
    const input = document.querySelector('main [name="cf-turnstile-response"]');
    return input && input.value;
}, null, { timeout: 20000 });

// Ask a bookseller, filled in, with the widget passed.
const visitor = await (await browser.newContext(desktop)).newPage();
await visitor.goto(`${base}/ask-a-bookseller`);
await waitForToken(visitor);
await visitor.fill('#ask-name', 'Ada Reader');
await visitor.fill('#ask-email', 'ada@example.com');
await visitor.fill('#ask-liked', 'Small Weathers');
await visitor.fill('#ask-question', 'Something quiet for the winter evenings.');
await settle(visitor, 1500);
await visitor.locator('main').screenshot({ path: `${out}/site-form.png` });

// The same form refused: sent without its token, as a bot would.
await visitor.evaluate(() => {
    document.querySelector('main [name="cf-turnstile-response"]').remove();
    document.querySelector('main form').submit();
});
await visitor.waitForLoadState('load');
await waitForToken(visitor);
await settle(visitor, 1500);
await visitor.locator('main').screenshot({ path: `${out}/site-refused.png` });

// The Captcha field in the forms builder, with its settings open.
const cp = await (await browser.newContext({ ...desktop, viewport: { width: 1440, height: 900 } })).newPage();
await cp.goto(`${base}/cp/auth/login`);
await settle(cp);
await cp.locator('input[type=text], input[type=email]').first().fill(process.env.CP_EMAIL);
await cp.locator('input[type=password]').fill(process.env.CP_PASSWORD);
await cp.locator('button[type=submit]').first().click();
await cp.waitForURL((url) => !url.pathname.includes('/auth/'), { timeout: 20000 });

await cp.goto(`${base}/cp/forms/contact/builder`);
await settle(cp, 1500);
const snooze = cp.getByText('Snooze', { exact: true });
if (await snooze.count()) await snooze.first().click().catch(() => {});
await cp.getByText('Are you a person?', { exact: true }).first().click();
await settle(cp, 1500);
await cp.screenshot({ path: `${out}/cp-builder.png` });

await browser.close();
console.log(`Screenshots in ${out}`);
