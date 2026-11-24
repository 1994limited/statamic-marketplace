// Forms Captcha's Marketplace images, in the 1994 house style (../../_style). Its own language is
// the form being checked: the ticked box, the widget in a form, the token sent on and stamped
// passed or refused. Nothing here is measured: every number is a setting or a fact of the code.
//
//   cd forms-captcha/tools && npm install && npm run marketplace
//
// OUT    where to write (default this addon's folder, forms-captcha/)
// CHROME a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import * as house from '../../_style/house.mjs';

const outDir = process.env.OUT || new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const work = new URL('./screenshots', import.meta.url).pathname;
mkdirSync(`${outDir}/charts`, { recursive: true });

// ---------------------------------------------------------------- the look

const { main: colour, tint } = house.addons['forms-captcha'];
const tones = house.ramp(colour);
const cream = '#FFF6EE';
const ink = house.ink;

// The mark: a ticked box, its top-right corner folded like the rest of the family.
const markPaths = (fill, corner) => `<path fill="${fill}" fill-rule="evenodd" d="M1.75 1.75H9.25V4.75H12.25V12.25H1.75Z M3.33 7.97 L6.00 10.63 L10.47 6.17 L9.33 5.03 L6.00 8.37 L4.47 6.83Z"/><path fill="${corner}" d="M9.75 1.75L12.25 4.25H9.75Z"/>`;
const markSvg = (fill, corner) => `<svg viewBox="0 0 14 14">${markPaths(fill, corner)}</svg>`;
const markInk = markSvg(colour, tint);
const who = 'Forms Captcha · for Statamic · free';
const sheetMeta = (right) => house.meta({ mark: markInk, left: who, right });

// Flat line drawings, like Newsletter's: cards, fields, a ticked box.
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${ink}" stroke-width="3"/>`;
const bar = (x, y, w, fill = house.hairline, h = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;
const input = (x, y, w, h = 30) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
const tickBox = (x, y, s = 22, on = true) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="4" fill="${on ? colour : '#fff'}" stroke="${on ? colour : ink}" stroke-width="2.5"/>`
    + (on ? `<path d="M${x + s * 0.22} ${y + s * 0.52} l${s * 0.22} ${s * 0.22} l${s * 0.36} -${s * 0.42}" stroke="#fff" stroke-width="${s / 8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '');
const widget = (x, y, w = 182, on = true) => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="5" fill="#F6F4F1" stroke="${ink}" stroke-width="2"/>${tickBox(x + 12, y + 11, 22, on)}${bar(x + 46, y + 17, 70)}`;
const stamp = (cx, cy, ok, r = 15) => ok
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}"/><path d="M${cx - r * 0.45} ${cy} l${r * 0.33} ${r * 0.33} l${r * 0.6} -${r * 0.66}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${ink}" stroke-width="2.5"/><path d="M${cx - r * 0.4} ${cy - r * 0.4} l${r * 0.8} ${r * 0.8} M${cx + r * 0.4} ${cy - r * 0.4} l-${r * 0.8} ${r * 0.8}" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
const mono = (x, y, t, o = {}) => house.svgText(x, y, t, { size: 15, ...o });

const frames = {};

// ---------------------------------------------------------------- cover: the colour field

frames['cover-1600x900'] = house.page({
    kind: 'cover', colour,
    css: `.ghost { position: absolute; right: 40px; bottom: 0; width: 470px; height: 470px; }
          .claim { position: absolute; left: 66px; top: 200px; font-size: 200px; }
          .lede { position: absolute; left: 72px; bottom: 112px; width: 760px; }
          .facts { position: absolute; left: 72px; bottom: 62px; font: 500 19px 'IBM Plex Mono'; color: rgba(255,246,238,.75); }`,
    body: `<div class="ghost">${markSvg(tones.shade, tones.mid)}</div>
        ${house.meta({ mark: markSvg(cream, tint), left: who, right: 'Turnstile · hCaptcha · reCAPTCHA' })}
        <div class="display claim">Drag in<br>a captcha.</div>
        <p class="lede">A Captcha field for Statamic's forms builder: Cloudflare Turnstile, hCaptcha or Google reCAPTCHA, checked on your server when the form is sent.</p>
        <div class="facts">Free and open source · Statamic 6.44+ · low scores kept as spam</div>`,
});

// ---------------------------------------------------------------- FC-01: four steps, from keys to a checked form

const drawEnv = (x, y) => `${card(x, y, 230, 170)}
    ${mono(x + 22, y + 44, '.env', { weight: 600 })}
    ${['DRIVER=turnstile', 'SITE_KEY=0x4AAA…', 'SECRET_KEY=••••••'].map((t, i) => mono(x + 22, y + 82 + i * 30, t, { size: 14, fill: i === 0 ? colour : ink })).join('')}`;
const drawBuilder = (x, y) => `${card(x, y, 230, 170)}
    <line x1="${x + 78}" y1="${y + 3}" x2="${x + 78}" y2="${y + 167}" stroke="${house.hairline}" stroke-width="2"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${x + 14}" y="${y + 22 + i * 32}" width="50" height="20" rx="4" fill="${i === 1 ? colour : house.hairline}"/>`).join('')}
    ${[0, 1].map((i) => `${bar(x + 96, y + 22 + i * 40, 60, house.muted, 8)}${input(x + 96, y + 34 + i * 40, 112, 18)}`).join('')}
    <rect x="${x + 96}" y="${y + 112}" width="112" height="34" rx="5" fill="${tones.lightest}" stroke="${colour}" stroke-width="2.5" stroke-dasharray="6 5"/>
    <path d="M${x + 150} ${y + 122} l0 30 l8 -8 l6 13 l6 -3 l-6 -13 l11 0 z" fill="#fff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
const drawForm = (x, y) => `${card(x, y, 230, 170)}
    ${input(x + 24, y + 22, 182)}${input(x + 24, y + 62, 182)}
    ${widget(x + 24, y + 104, 128)}
    <rect x="${x + 162}" y="${y + 110}" width="44" height="32" rx="5" fill="${ink}"/>`;
const drawCheck = (x, y) => `${card(x, y, 230, 170)}
    ${mono(x + 22, y + 40, 'siteverify', { weight: 600 })}
    ${stamp(x + 38, y + 80, true)}${bar(x + 64, y + 75, 120, colour)}
    ${stamp(x + 38, y + 126, false)}${bar(x + 64, y + 121, 96)}`;

const flow = [
    [drawEnv, 'Set your provider and its keys once, in .env.'],
    [drawBuilder, 'Drag Captcha into a form in the forms builder.'],
    [drawForm, 'Visitors see the widget where the field is.'],
    [drawCheck, 'Your server checks the token. No pass, no submission.'],
];
frames['01-drag-in'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 1200px; }
          .cap { position: absolute; width: 300px; font: 500 19px/1.45 'IBM Plex Mono'; }`,
    body: `${sheetMeta('FC-01 · setting up')}
        <div class="title t">A field, like any other</div>
        <svg style="position:absolute;left:0;top:0" width="1600" height="900">
            ${flow.map(([draw], i) => draw(92 + i * 372, 420)).join('')}
            ${[0, 1, 2].map((i) => house.arrow(338 + i * 372, 505, 448 + i * 372)).join('')}
            ${flow.map((_, i) => house.stepMark(112 + i * 372, 370, i + 1)).join('')}
        </svg>
        ${flow.map(([, cap], i) => `<div class="cap" style="left:${92 + i * 372}px;top:630px">${cap}</div>`).join('')}
        <div class="foot">Built on Statamic 6.44's forms: a form fieldtype, a validation rule and an event listener. Nothing in core is changed.</div>`,
});

// ---------------------------------------------------------------- FC-02: four providers, one field

// Drawn generically: no provider's look or logo, only its name.
const providers = [
    ['Turnstile', 'Cloudflare’s. Usually no clicking. Full width, normal or compact.', (x, y) => `${widget(x, y, 250)}`],
    ['hCaptcha', 'The checkbox, with a puzzle when it’s unsure.', (x, y) => `${widget(x, y, 250, false)}`],
    ['reCAPTCHA v2', 'Google’s “I’m not a robot” checkbox.', (x, y) => `${widget(x, y, 250, false)}`],
    ['reCAPTCHA v3', 'Nothing to tick: Google scores each visit.', (x, y) => `<line x1="${x}" x2="${x + 250}" y1="${y + 22}" y2="${y + 22}" stroke="${ink}" stroke-width="3"/>
        ${[0, 0.5, 1].map((v) => `<line x1="${x + v * 250}" x2="${x + v * 250}" y1="${y + 14}" y2="${y + 30}" stroke="${ink}" stroke-width="3"/>`).join('')}
        <circle cx="${x + 0.9 * 250}" cy="${y + 22}" r="9" fill="${colour}"/>
        ${mono(x, y + 54, '0.0', { size: 14, fill: house.muted })}${mono(x + 125, y + 54, '0.5', { size: 14, anchor: 'middle', fill: house.muted })}${mono(x + 250, y + 54, '1.0', { size: 14, anchor: 'end', fill: house.muted })}`],
];
frames['02-providers'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 1100px; }
          .l { position: absolute; left: 72px; top: 270px; width: 860px; color: #3a3a3a; }
          .grid { position: absolute; left: 72px; right: 72px; top: 420px; display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 40px; }
          .p { border-top: 3px solid ${ink}; padding-top: 22px; }
          .p svg { display: block; margin: 8px 0 26px; }
          .p b { display: block; font: 900 34px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 10px; }
          .p span { font: 500 19px/1.45 Archivo; color: #3a3a3a; }`,
    body: `${sheetMeta('FC-02 · providers')}
        <div class="title t">Four providers, one field</div>
        <p class="lede l">Choose the provider once, in .env, and every Captcha field uses it. Change it later without touching a form or a template.</p>
        <div class="grid">${providers.map(([name, text, draw]) => `<div class="p"><svg width="320" height="64">${draw(2, 8)}</svg><b>${name}</b><span>${text}</span></div>`).join('')}</div>
        <div class="foot">Or your own, with Captcha::extend(). The null driver lets everything through, for local work, and says so in the log in production.</div>`,
});

// ---------------------------------------------------------------- FC-03: checked on the server, as facts of the code

const checks = [
    ['5', 'seconds', 'The longest it waits for the provider. If it can’t be reached, the submission is refused.'],
    ['1', 'check', 'Per token. Tokens work once, so a reused or forged one fails.'],
    ['0', 'tokens kept', 'The token is never saved with the submission.'],
    ['8', 'KB', 'Longer tokens are refused without asking the provider.'],
];
frames['03-checked'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 560px; }
          .l { position: absolute; left: 72px; top: 450px; width: 520px; color: #3a3a3a; }
          .grid { position: absolute; left: 700px; top: 150px; width: 828px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 48px; }
          .g { padding: 22px 0 30px; border-top: 3px solid ${ink}; }
          .g b { font: 900 120px/0.9 Archivo; font-stretch: 70%; color: ${colour}; letter-spacing: -0.02em; }
          .g em { font: 600 20px 'IBM Plex Mono'; font-style: normal; text-transform: uppercase; margin-left: 10px; }
          .g p { font: 500 19px/1.45 Archivo; color: #3a3a3a; margin-top: 12px; max-width: 360px; }`,
    body: `${sheetMeta('FC-03 · on the server')}
        <div class="title t">Checked on your server</div>
        <p class="lede l">A validation rule on the field, so a failed check is an error like any other. On a multi-page form, the Captcha’s page can’t be skipped.</p>
        <div class="grid">${checks.map(([n, unit, text]) => `<div class="g"><b>${n}</b><em>${unit}</em><p>${text}</p></div>`).join('')}</div>
        <div class="foot">5 seconds is the default timeout, and can be changed in config/forms-captcha.php.</div>`,
});

// ---------------------------------------------------------------- FC-04: low reCAPTCHA v3 scores, kept as spam

const scale = (x, y, w) => {
    const at = (v) => x + v * w;
    const visits = [[0.1, false], [0.3, false], [0.7, true], [0.9, true]];
    return `<rect x="${x}" y="${y - 34}" width="${w / 2}" height="68" fill="${tones.lightest}"/>
        <line x1="${x}" x2="${x + w}" y1="${y}" y2="${y}" stroke="${ink}" stroke-width="3"/>
        ${[0, 0.25, 0.5, 0.75, 1].map((v) => `<line x1="${at(v)}" x2="${at(v)}" y1="${y - 10}" y2="${y + 10}" stroke="${ink}" stroke-width="3"/>`).join('')}
        ${[0, 0.5, 1].map((v) => mono(at(v), y + 40, v.toFixed(1), { anchor: 'middle', size: 16, fill: house.muted })).join('')}
        <line x1="${at(0.5)}" x2="${at(0.5)}" y1="${y - 60}" y2="${y + 14}" stroke="${colour}" stroke-width="3" stroke-dasharray="7 6"/>
        ${mono(at(0.5), y - 72, 'score: 0.5', { anchor: 'middle', size: 16, weight: 600, fill: colour })}
        ${visits.map(([v, ok]) => `<circle cx="${at(v)}" cy="${y}" r="11" fill="${ok ? '#fff' : colour}" stroke="${ok ? ink : colour}" stroke-width="3"/>`).join('')}
        ${mono(x, y - 50, 'LOW SCORES', { size: 15, weight: 600, fill: colour })}`;
};
const tray = (x, y, title, line, hot) => `${card(x, y, 300, 130)}
    ${house.svgText(x + 24, y + 42, title, { size: 18, weight: 600, fill: hot ? colour : ink })}
    ${bar(x + 24, y + 62, 200)}${bar(x + 24, y + 84, 160)}
    ${mono(x + 24, y + 116, line, { size: 14, fill: house.muted })}`;
frames['04-low-scores'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 640px; }
          .l { position: absolute; left: 72px; top: 450px; width: 560px; color: #3a3a3a; }`,
    body: `${sheetMeta('FC-04 · reCAPTCHA v3')}
        <div class="title t">Low scores, kept as spam</div>
        <p class="lede l">reCAPTCHA v3 scores each visit from 0.0 to 1.0. Each field chooses what a low score does: show an error, or keep the submission as spam for you to review, with no emails or connections sent for it.</p>
        <svg style="position:absolute;left:0;top:0" width="1600" height="900">
            ${scale(780, 290, 720)}
            <path d="M920 340 V430" stroke="${ink}" stroke-width="3" stroke-dasharray="10 9" fill="none"/><path d="M920 452 l-11 -18 h22z" fill="${ink}"/>
            <path d="M1320 340 V430" stroke="${ink}" stroke-width="3" stroke-dasharray="10 9" fill="none"/><path d="M1320 452 l-11 -18 h22z" fill="${ink}"/>
            ${tray(770, 470, 'SPAM', 'kept for review · no emails', true)}
            ${tray(1170, 470, 'SUBMISSIONS', 'emails and connections sent', false)}
        </svg>
        <div class="foot">0.5 is the default score, and can be changed in config/forms-captcha.php. Tokens made for another action are always refused.</div>`,
});

// ---------------------------------------------------------------- FC-05: templates and JavaScript

const ways = [
    ['{{ fields }}', 'Statamic’s own field rendering: the widget appears with the rest of the form.'],
    ['{{ forms_captcha }}', 'In a form template you’ve written yourself, with its error message.'],
    ['&lt;s:forms_captcha :fields="$fields" /&gt;', 'The same in Blade.'],
    ['fetch() · axios', 'The widget resets after each response. reCAPTCHA v3 gets its token before your handler runs.'],
];
frames['05-templates'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 520px; }
          .l { position: absolute; left: 72px; top: 450px; width: 480px; color: #3a3a3a; }
          .ways { position: absolute; left: 680px; top: 150px; width: 850px; }
          .w { padding: 24px 0; border-bottom: 1px solid ${house.hairline}; }
          .w:first-child { border-top: 3px solid ${ink}; }
          .w code { font: 600 26px 'IBM Plex Mono'; color: ${colour}; }
          .w small { display: block; font: 500 19px/1.45 Archivo; color: #3a3a3a; margin-top: 6px; }`,
    body: `${sheetMeta('FC-05 · on your site')}
        <div class="title t">Works with your templates</div>
        <p class="lede l">Antlers or Blade, Statamic’s field rendering or your own markup, sent normally or with JavaScript.</p>
        <div class="ways">${ways.map(([c, note]) => `<div class="w"><code>${c}</code><small>${note}</small></div>`).join('')}</div>
        <div class="foot">Errors go under the field’s handle, so {{ error:captcha }} works too. Publish the field’s view to change its markup.</div>`,
});

// ---------------------------------------------------------------- what's in the box: a parts list

const parts = [
    ['Captcha field', 'Drag it into any form in the forms builder. Theme and size per field.'],
    ['Four providers', 'Turnstile, hCaptcha, reCAPTCHA v2 and v3, or your own driver.'],
    ['Server-side check', 'A validation rule, with a timeout. The token is never stored.'],
    ['Spam for low scores', 'reCAPTCHA v3 visits under your score, kept for review.'],
    ['Templates', '{{ fields }}, {{ forms_captcha }} and Blade. A view to publish.'],
    ['JavaScript', 'Resets after fetch() and axios. FormsCaptcha.render() and reset().'],
];
frames['06-everything'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; }
          .grid { position: absolute; left: 72px; top: 300px; right: 72px; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 48px; }
          .p { display: grid; grid-template-columns: 56px 1fr; padding: 24px 0; border-top: 3px solid ${ink}; }
          .p .letter { font: 600 22px 'IBM Plex Mono'; color: ${colour}; }
          .p b { display: block; font: 900 36px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 8px; }
          .p span { font: 500 19px/1.45 Archivo; color: #3a3a3a; }
          .inv { position: absolute; left: 72px; right: 72px; bottom: 56px; display: flex; justify-content: space-between; font: 500 19px 'IBM Plex Mono'; padding-top: 18px; border-top: 1px solid ${house.hairline}; }`,
    body: `${sheetMeta('FC · contents')}
        <div class="title t">What's in the box</div>
        <div class="grid">${parts.map(([name, text], i) => `<div class="p"><span class="letter">${String.fromCharCode(65 + i)}</span><div><b>${name}</b><span>${text}</span></div></div>`).join('')}</div>
        <div class="inv"><span>Statamic 6.44+ · PHP 8.3+</span><span>A Turnstile, hCaptcha or reCAPTCHA account</span><span style="color:${colour}">Free and open source, under the MIT licence.</span></div>`,
});

// ---------------------------------------------------------------- render

await house.render(chromium, frames, outDir, { work, executablePath: chrome });
await house.render(chromium, { 'addon-icon': `<html><body style="margin:0;background:transparent">${readFileSync(`${outDir}/addon-icon.svg`, 'utf8')}</body></html>` }, outDir, { width: 512, height: 512, transparent: true, work, executablePath: chrome });
console.log(`Listing images in ${outDir}`);
