// A preview of the house style across several addons: each one's cover, and a contact sheet of
// them at the size the Marketplace grid shows. Not the real listing images, which each addon's
// tools draw. Run from _style:  node family.mjs  (uses flatpack/tools' Playwright)
import { chromium } from '../flatpack/tools/node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as house from './house.mjs';

const dev = new URL('../../', import.meta.url).pathname;
const out = new URL('./preview', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// colour, tint (from each addon's mark), claim, lede, facts: all from the addons' own READMEs.
const family = [
    ['flatpack', 'Flatpack', '#9A4A12', '#D9A57C', 'Builds<br>3.3× faster.', 'Statamic’s flat files, compiled at deploy into PHP that OPcache serves from memory.', '67.3 s → 20.5 s · 2.2 GB → 363 MB · on a 9,000-entry site', 'for Statamic · free'],
    ['social-images', 'Social Images', '#37420C', '#99A47A', 'A share image<br>for every entry.', 'Design a card once in the Control Panel. Every entry gets its own 1200 × 630 image when it’s saved.', 'og:image · twitter:image · made on save', 'for Statamic'],
    ['ingest', 'Ingest', '#3C3461', '#9D99C2', 'Feeds in.<br>Kept in step.', 'Keep Statamic in step with the feeds you don’t control, on a schedule, with a preview and undo for every run.', 'JSON · XML · CSV · RSS · APIs · Google Sheets', 'for Statamic'],
    ['abandoned-cart', 'Abandoned Cart', '#582A45', '#BA90A7', 'Left behind.<br>Brought back.', 'Up to three reminder emails, with a link that brings the shopper’s basket back at today’s prices.', 'reminders · discount codes · recovered revenue', 'for Statamic and Cargo'],
    ['back-in-stock', 'Back in Stock', '#4E2E55', '#AF93B6', 'Tell me when<br>it’s back.', 'Shoppers leave their email on a sold-out product. When it’s back, they get one email.', 'variants · double opt-in · who’s waiting', 'for Statamic and Cargo'],
    ['reviews', 'Reviews', '#5C2E17', '#BF9380', 'Star ratings,<br>on your own site.', 'A review form for any entry, moderation in the Control Panel, and review schema in your templates.', 'ratings · photos · moderation · schema', 'for Statamic'],
];

// The addon's own mark, recoloured: its two colours swapped for the ones given.
function mark(slug, main, tint, fill, fold) {
    let svg = readFileSync(`${dev}${slug}-statamic/resources/brand/mark-colour.svg`, 'utf8').replace(/<metadata>[\s\S]*?<\/metadata>/, '');
    svg = svg.replaceAll(new RegExp(main, 'gi'), '__FILL__').replaceAll(new RegExp(tint, 'gi'), '__FOLD__');

    return svg.replaceAll('__FILL__', fill).replaceAll('__FOLD__', fold).replace(/width="512" height="512"/, '');
}

const covers = {};
for (const [slug, name, colour, tint, claim, lede, facts, forWhat] of family) {
    const r = house.ramp(colour);
    covers[slug] = house.page({
        kind: 'cover', colour,
        css: `.ghost { position: absolute; right: 56px; bottom: 36px; width: 430px; height: 430px; }
              .ghost svg { width: 100%; height: 100%; }
              .claim { position: absolute; left: 66px; top: 196px; font-size: 200px; max-width: 1180px; }
              .lede { position: absolute; left: 72px; bottom: 112px; width: 640px; }
              .facts { position: absolute; left: 72px; bottom: 62px; font: 500 19px 'IBM Plex Mono'; color: rgba(255,246,238,.75); }`,
        body: `<div class="ghost">${mark(slug, colour, tint, r.shade, r.mid)}</div>
            ${house.meta({ mark: mark(slug, colour, tint, '#FFF6EE', tint), left: `${name} · ${forWhat}` })}
            <div class="display claim">${claim}</div>
            <p class="lede">${lede}</p>
            <div class="facts">${facts}</div>
            <script>
                // Fit the claim: the longest claims shrink until they clear the mark.
                const c = document.querySelector('.claim');
                let size = 200;
                while ((c.scrollWidth > 1180 || c.offsetHeight > 380) && size > 120) { size -= 4; c.style.fontSize = size + 'px'; }
            </script>`,
    });
}

// Each addon's sheets speak its own language. Social Images': the share cards it makes, as they
// appear when a link is shared (a generic link preview, no real platform's look).
const si = family[1];
const g = house.ramp(si[2]);
const cards = [
    ['Journal', 'In conversation with Imogen Hale', 'dogearbooks.example/journal/imogen-hale', `background:${si[2]};color:#F4F1E6`, 'serif'],
    ['Events', 'Poetry night: new voices', 'dogearbooks.example/events/poetry-night', `background:#F4F1E6;color:${si[2]}`, 'sans'],
    ['Books', 'The Salt Orchard, now in paperback', 'dogearbooks.example/books/salt-orchard', `background:linear-gradient(135deg, ${g.dark}, ${si[2]} 60%, ${g.mid});color:#fff`, 'sans'],
];
covers['social-images-sheet'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 160px; width: 520px; }
          .l { position: absolute; left: 72px; top: 470px; width: 470px; color: #3a3a3a; }
          .previews { position: absolute; left: 640px; top: 150px; width: 890px; display: grid; gap: 22px; }
          .pv { display: grid; grid-template-columns: 300px 1fr; border: 1px solid ${house.hairline}; border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 14px 30px rgba(0,0,0,.06); }
          .card { aspect-ratio: 1200 / 630; padding: 18px 20px; display: flex; flex-direction: column; justify-content: space-between; }
          .card small { font: 600 11px 'IBM Plex Mono'; letter-spacing: .08em; text-transform: uppercase; opacity: .8; }
          .card b.serif { font: 700 23px/1.08 Georgia, serif; }
          .card b.sans { font: 900 26px/0.95 Archivo; font-stretch: 74%; text-transform: uppercase; }
          .card span { font: 500 11px 'IBM Plex Mono'; opacity: .75; }
          .meta2 { padding: 22px 26px; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
          .meta2 .url { font: 500 15px 'IBM Plex Mono'; color: ${house.muted}; }
          .meta2 .h { font: 600 22px/1.25 Archivo; }`,
    body: `${house.meta({ mark: mark('social-images', si[2], si[3], si[2], si[3]), left: 'Social Images · for Statamic', right: 'SI-02 · every entry' })}
        <div class="title t">Every entry, its own card</div>
        <p class="lede l">Design a card once in the Control Panel and bind it to your entries' titles, photos, authors and dates. Each one saves with its own 1200 × 630 image.</p>
        <div class="previews">${cards.map(([kicker, title, url, style, face]) => `<div class="pv">
            <div class="card" style="${style}"><small>${kicker} · Dog-ear Books</small><b class="${face}">${title}</b><span>dogearbooks.example</span></div>
            <div class="meta2"><span class="url">${url}</span><span class="h">${title}</span></div></div>`).join('')}</div>`,
});

await house.render(chromium, covers, out, { scales: [[1, '']], work: `${out}/html`, executablePath: chrome });

// The contact sheet: the covers at Marketplace-grid size, in a row of three.
const sheet = `<html><body style="margin:0;padding:28px;background:#ECECEF;display:grid;grid-template-columns:repeat(3,480px);gap:22px">
    ${family.map(([slug, name]) => `<div><img src="${slug}.png" style="width:480px;border-radius:10px;display:block"><div style="font:14px system-ui;margin-top:8px;color:#333">${name}</div></div>`).join('')}
</body></html>`;
writeFileSync(`${out}/sheet.html`, sheet);
const b = await chromium.launch({ executablePath: chrome });
const p = await (await b.newContext({ viewport: { width: 1544, height: 640 }, deviceScaleFactor: 1 })).newPage();
await p.goto(`file://${out}/sheet.html`);
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/sheet.png`, fullPage: true });
await b.close();
console.log(`Preview in ${out}`);
