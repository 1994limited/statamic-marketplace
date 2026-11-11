// Newsletter's Marketplace images, in the 1994 house style (../../_style). Its own language is
// the post: a form, an envelope, a button pressed, and the list as a ledger. Nothing here is
// measured, so no image claims a number that isn't a setting or a fact of the code.
//
//   cd newsletter/tools && npm install && npm run marketplace
//
// OUT    where to write (default this addon's folder, newsletter/)
// CHROME a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import * as house from '../../_style/house.mjs';

const outDir = process.env.OUT || new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const work = new URL('./screenshots', import.meta.url).pathname;
mkdirSync(`${outDir}/charts`, { recursive: true });

// ---------------------------------------------------------------- the look

const { main: colour, tint } = house.addons.newsletter;
const tones = house.ramp(colour);
const cream = '#FFF6EE';
const markSvg = (fill, corner) => `<svg viewBox="0 0 14 14"><path fill="${fill}" fill-rule="evenodd" d="M1.75 3H9V5.5H12.25V11.25H1.75Z M2.85 4.35L7 7.6L9.6 5.55L10.35 6.5L7 9.15L2.1 5.3Z"/><path fill="${corner}" d="M9.5 3L12.25 5H9.5Z"/></svg>`;
const markInk = markSvg(colour, tint);
const who = 'Newsletter · for Statamic';
const sheetMeta = (right) => house.meta({ mark: markInk, left: who, right });
const S = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="${house.ink}" stroke-width="3" ${extra}/>`;

const frames = {};

// ---------------------------------------------------------------- cover: the colour field

frames['cover-1600x900'] = house.page({
    kind: 'cover', colour,
    css: `.ghost { position: absolute; right: 40px; bottom: 0; width: 470px; height: 470px; }
          .claim { position: absolute; left: 66px; top: 200px; font-size: 200px; }
          .lede { position: absolute; left: 72px; bottom: 112px; width: 720px; }
          .facts { position: absolute; left: 72px; bottom: 62px; font: 500 19px 'IBM Plex Mono'; color: rgba(255,246,238,.75); }`,
    body: `<div class="ghost">${markSvg(tones.shade, tones.mid)}</div>
        ${house.meta({ mark: markSvg(cream, tint), left: who, right: 'double opt-in' })}
        <div class="display claim">A list people<br>confirmed.</div>
        <p class="lede">A sign-up form, double opt-in, and the list in your Control Panel, ready to download as a CSV for whatever you send with.</p>
        <div class="facts">One tag · confirm links that last 72 hours · one-click unsubscribe</div>`,
});

// ---------------------------------------------------------------- NL-01: double opt-in, in four steps

// Line drawings, flat: the post, not Flatpack's isometric boards.
const drawForm = (x, y) => `${S(x, y, 230, 170, 'rx="10"')}
    <rect x="${x + 24}" y="${y + 30}" width="182" height="34" rx="5" fill="none" stroke="${house.ink}" stroke-width="2.5"/>
    <text x="${x + 36}" y="${y + 53}" font-family="IBM Plex Mono" font-size="15" fill="${house.muted}">you@example.com</text>
    <rect x="${x + 24}" y="${y + 80}" width="18" height="18" rx="3" fill="${colour}" stroke="${colour}" stroke-width="2.5"/>
    <path d="M${x + 28} ${y + 89} l4 4 l7 -9" stroke="#fff" stroke-width="2.5" fill="none"/>
    <rect x="${x + 52}" y="${y + 84}" width="120" height="9" rx="4" fill="${house.hairline}"/>
    <rect x="${x + 24}" y="${y + 114}" width="110" height="34" rx="5" fill="${house.ink}"/>`;
const drawEnvelope = (x, y) => `${S(x, y, 230, 160, 'rx="8"')}
    <path d="M${x + 4} ${y + 6} L${x + 115} ${y + 92} L${x + 226} ${y + 6}" stroke="${house.ink}" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M${x + 180} ${y} h50 v38 z" fill="${tint}" stroke="${house.ink}" stroke-width="3" stroke-linejoin="round"/>`;
const drawButton = (x, y) => `${S(x, y, 230, 170, 'rx="10"')}
    <rect x="${x + 24}" y="${y + 30}" width="150" height="14" rx="6" fill="${house.ink}"/>
    <rect x="${x + 24}" y="${y + 58}" width="182" height="9" rx="4" fill="${house.hairline}"/>
    <rect x="${x + 24}" y="${y + 92}" width="140" height="44" rx="6" fill="${colour}"/>
    <path d="M${x + 150} ${y + 122} l0 34 l9 -9 l7 15 l7 -3 l-7 -15 l12 0 z" fill="#fff" stroke="${house.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
const drawList = (x, y) => `${S(x, y, 230, 170, 'rx="10"')}
    ${[0, 1, 2, 3].map((i) => `<rect x="${x + 24}" y="${y + 30 + i * 32}" width="${i === 3 ? 120 : 150}" height="12" rx="5" fill="${i === 3 ? colour : house.hairline}"/>
        <line x1="${x + 18}" x2="${x + 212}" y1="${y + 52 + i * 32}" y2="${y + 52 + i * 32}" stroke="${house.hairline}" stroke-width="2"/>`).join('')}
    <circle cx="${x + 196}" cy="${y + 132}" r="13" fill="${colour}"/><path d="M${x + 189} ${y + 132} l5 5 l9 -10" stroke="#fff" stroke-width="3" fill="none"/>`;

const optin = [
    [drawForm, 'They sign up with <span style="white-space:nowrap">{{ newsletter }}</span>, ticking your consent box.'],
    [drawEnvelope, 'They get an email with a signed link that lasts 72 hours.'],
    [drawButton, 'The link opens a page with a button, so mail scanners can’t confirm.'],
    [drawList, 'Only then are they on the list, with their consent kept.'],
];
frames['01-double-opt-in'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 1100px; }
          .cap { position: absolute; width: 300px; font: 500 19px/1.45 'IBM Plex Mono'; }`,
    body: `${sheetMeta('NL-01 · double opt-in')}
        <div class="title t">Double opt-in, done properly</div>
        <svg style="position:absolute;left:0;top:0" width="1600" height="900">
            ${optin.map(([draw, ], i) => draw(92 + i * 372, 420)).join('')}
            ${[0, 1, 2].map((i) => house.arrow(338 + i * 372, 505, 448 + i * 372)).join('')}
            ${optin.map((_, i) => house.stepMark(112 + i * 372, 370, i + 1)).join('')}
        </svg>
        ${optin.map(([, cap], i) => `<div class="cap" style="left:${92 + i * 372}px;top:630px">${cap}</div>`).join('')}
        <div class="foot">The form says the same thing whether an address is new or already on the list, so it can’t be used to find out who is.</div>`,
});

// ---------------------------------------------------------------- NL-02: the list as a CSV

const headings = ['Email', 'Name', 'Status', 'Signed up', 'Confirmed', 'Agreed to', 'Unsubscribe link'];
const rows = [
    ['amara.okafor@example.com', 'Amara Okafor', 'subscribed', '2026-11-10 10:07', '2026-11-10 10:12', 'Email me the…', 'https://…/unsubscribe…'],
    ['ben.hartley@example.com', 'Ben Hartley', 'subscribed', '2026-11-09 11:14', '2026-11-09 11:20', 'Email me the…', 'https://…/unsubscribe…'],
    ['clara.voss@example.com', 'Clara Voss', 'subscribed', '2026-11-08 12:21', '2026-11-08 12:28', 'Email me the…', 'https://…/unsubscribe…'],
    ['elif.yilmaz@example.com', 'Elif Yılmaz', 'subscribed', '2026-11-06 14:35', '2026-11-06 14:44', 'Email me the…', 'https://…/unsubscribe…'],
    ['grace.liu@example.com', 'Grace Liu', 'subscribed', '2026-11-03 17:56', '2026-11-03 18:04', 'Email me the…', 'https://…/unsubscribe…'],
];
frames['02-csv'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 900px; }
          .l { position: absolute; left: 72px; top: 270px; width: 820px; color: #3a3a3a; }
          .sheet { position: absolute; left: 72px; top: 440px; right: 72px; border: 3px solid ${house.ink}; font: 500 15px 'IBM Plex Mono'; display: grid; grid-template-columns: 44px 270px 150px 120px 170px 170px 150px 1fr; }
          .sheet > div { padding: 11px 10px; border-right: 1px solid ${house.hairline}; border-bottom: 1px solid ${house.hairline}; white-space: nowrap; overflow: hidden; }
          .sheet .n { color: ${house.muted}; text-align: right; background: #F6F4F1; }
          .sheet .h { font-weight: 600; text-transform: uppercase; letter-spacing: .03em; background: #F6F4F1; }
          .sheet .hot { color: ${colour}; font-weight: 600; }
          .sheet .hot.h { background: ${tones.lightest}; }`,
    body: `${sheetMeta('NL-02 · the list')}
        <div class="title t">The list, as a CSV</div>
        <p class="lede l">Confirmed subscribers, ready for Mailchimp, Brevo, Campaign Monitor or whatever you send with. Each row brings its own unsubscribe link, to merge into your emails.</p>
        <div class="sheet">
            <div class="n h">&nbsp;</div>${headings.map((h, i) => `<div class="h${i === 6 ? ' hot' : ''}">${h}</div>`).join('')}
            ${rows.map((r, j) => `<div class="n">${j + 2}</div>${r.map((c, i) => `<div${i === 6 ? ' class="hot"' : ''}>${c}</div>`).join('')}`).join('')}
        </div>
        <div class="foot">Also in the file: Site, Unsubscribed and Form page. Opens cleanly in Excel, and no cell can run as a spreadsheet formula.</div>`,
});

// ---------------------------------------------------------------- NL-03: spam and leaks, as settings

const guards = [
    ['10', 'a minute', 'Sign-ups per visitor, counted in your cache. No IP addresses kept.'],
    ['3', 'an hour', 'Confirmation emails per address, so no one’s inbox gets flooded.'],
    ['72', 'hours', 'How long a confirm link works. Signed, so it can’t be guessed or changed.'],
    ['30', 'days', 'Then sign-ups nobody confirmed are deleted, by the scheduler.'],
];
frames['03-clean'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 560px; }
          .l { position: absolute; left: 72px; top: 450px; width: 500px; color: #3a3a3a; }
          .grid { position: absolute; left: 700px; top: 150px; width: 828px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 48px; }
          .g { padding: 22px 0 30px; border-top: 3px solid ${house.ink}; }
          .g b { font: 900 120px/0.9 Archivo; font-stretch: 70%; color: ${colour}; letter-spacing: -0.02em; }
          .g em { font: 600 20px 'IBM Plex Mono'; font-style: normal; text-transform: uppercase; margin-left: 10px; }
          .g p { font: 500 19px/1.45 Archivo; color: #3a3a3a; margin-top: 12px; max-width: 360px; }`,
    body: `${sheetMeta('NL-03 · spam and privacy')}
        <div class="title t">A clean list, little spam</div>
        <p class="lede l">A hidden honeypot field and limits on every form. The defaults, each one a line in the config.</p>
        <div class="grid">${guards.map(([n, unit, text]) => `<div class="g"><b>${n}</b><em>${unit}</em><p>${text}</p></div>`).join('')}</div>`,
});

// ---------------------------------------------------------------- NL-04: install, in steps

const steps = [
    ['composer require 1994/newsletter-statamic', 'the addon', false],
    ['php artisan migrate', 'a table for subscribers', false],
    ['{{ newsletter }}', 'in any template: the form, ready to go', true],
];
frames['04-one-tag'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; width: 520px; }
          .l { position: absolute; left: 72px; top: 450px; width: 480px; color: #3a3a3a; }
          .steps { position: absolute; left: 680px; top: 150px; width: 850px; }
          .s { display: grid; grid-template-columns: 64px 1fr; align-items: center; padding: 22px 0; border-bottom: 1px solid ${house.hairline}; }
          .s code { font: 500 26px 'IBM Plex Mono'; }
          .s small { display: block; font: 400 17px 'IBM Plex Mono'; color: ${house.muted}; margin-top: 4px; }
          .s.hot code { color: ${colour}; font-weight: 600; }
          .s.hot .step { background: ${colour}; border-color: ${colour}; color: #fff; }
          .where { position: absolute; left: 680px; top: 590px; width: 850px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
          .where b { display: block; font: 900 30px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 8px; }
          .where span { font: 500 18px/1.45 Archivo; color: #3a3a3a; }`,
    body: `${sheetMeta('NL-04 · the form')}
        <div class="title t">One tag on your page</div>
        <p class="lede l">An accessible sign-up form that works without JavaScript. Or wrap your own fields in it.</p>
        <div class="steps">${steps.map(([cmd, note, hot], i) => `<div class="s${hot ? ' hot' : ''}"><span class="step">${i + 1}</span><div><code>${cmd}</code><small>${note}</small></div></div>`).join('')}</div>
        <div class="where">
            <div><b>Your own markup</b><span>Publish the views, or put your fields between the tags.</span></div>
            <div><b>JSON too</b><span>Post with fetch() and get the answer as JSON.</span></div>
            <div><b>Your wording</b><span>The email’s subject, text, button and colour, per site language.</span></div>
        </div>`,
});

// ---------------------------------------------------------------- what's in the box: a parts list

const parts = [
    ['Sign-up form', '{{ newsletter }}, or your own fields inside it. Antlers or Blade.'],
    ['Double opt-in', 'A signed link by email, and a page with a button to confirm.'],
    ['The list', 'Tools → Newsletter: counts, search, filter by status, delete.'],
    ['CSV download', 'What the list shows, each row with its own unsubscribe link.'],
    ['Record of consent', 'The wording they agreed to, the form’s page and the dates.'],
    ['Events', 'Subscribing, Confirmed and Unsubscribed, to pass people on.'],
];
frames['05-everything'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; }
          .grid { position: absolute; left: 72px; top: 300px; right: 72px; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 48px; }
          .p { display: grid; grid-template-columns: 56px 1fr; padding: 24px 0; border-top: 3px solid ${house.ink}; }
          .p .letter { font: 600 22px 'IBM Plex Mono'; color: ${colour}; }
          .p b { display: block; font: 900 36px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 8px; }
          .p span { font: 500 19px/1.45 Archivo; color: #3a3a3a; }
          .inv { position: absolute; left: 72px; right: 72px; bottom: 56px; display: flex; justify-content: space-between; font: 500 19px 'IBM Plex Mono'; padding-top: 18px; border-top: 1px solid ${house.hairline}; }`,
    body: `${sheetMeta('NL · contents')}
        <div class="title t">What's in the box</div>
        <div class="grid">${parts.map(([name, text], i) => `<div class="p"><span class="letter">${String.fromCharCode(65 + i)}</span><div><b>${name}</b><span>${text}</span></div></div>`).join('')}</div>
        <div class="inv"><span>Statamic 6.35+ · PHP 8.3+</span><span>A database · Laravel’s mail set up</span><span style="color:${colour}">It keeps the list. It doesn’t send newsletters.</span></div>`,
});

// ---------------------------------------------------------------- render

await house.render(chromium, frames, outDir, { work, executablePath: chrome });
await house.render(chromium, { 'addon-icon': `<html><body style="margin:0;background:transparent">${readFileSync(`${outDir}/addon-icon.svg`, 'utf8')}</body></html>` }, outDir, { width: 512, height: 512, transparent: true, work, executablePath: chrome });
console.log(`Listing images in ${outDir}`);
