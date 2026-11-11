// Flatpack's Marketplace images and the performance charts in its README, in the 1994 house
// style (../../_style), drawn from the demo's measurements: run `php artisan demo:compare --all`
// in flatpack-statamic-demo first. Every figure comes from its storage/demo-results/*.json.
//
//   cd flatpack/tools && npm install && npm run marketplace
//
// DEMO   the demo, for its results (default ../../../flatpack-statamic-demo, beside this repo)
// ADDON  Flatpack, for its brand mark (default ../../../flatpack-statamic)
// OUT    where to write (default this addon's folder, flatpack/)
// CHROME a Chrome or Chromium to drive (default: Google Chrome on macOS)
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import * as house from '../../_style/house.mjs';

const demo = (process.env.DEMO || new URL('../../../flatpack-statamic-demo', import.meta.url).pathname).replace(/\/?$/, '/');
const addon = process.env.ADDON || new URL('../../../flatpack-statamic', import.meta.url).pathname;
const outDir = process.env.OUT || new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const work = new URL('./screenshots', import.meta.url).pathname;
mkdirSync(`${outDir}/charts`, { recursive: true });

// ---------------------------------------------------------------- the measurements

const SHAPES = ['fixed', 'builder', 'nested'];
const SIZES = ['small', 'medium', 'large'];
const SHAPE_NAMES = { fixed: 'Fixed fields', builder: 'Page builder', nested: 'Nested builder' };
const ENTRIES = { small: '375', medium: '2,250', large: '9,000' };
const results = {};
let php = '';
for (const f of readdirSync(`${demo}storage/demo-results`)) {
    const r = JSON.parse(readFileSync(`${demo}storage/demo-results/${f}`, 'utf8'));
    results[`${r.generated.shape}-${r.generated.size}`] = r;
    php = r.php;
}
for (const s of SHAPES) for (const z of SIZES) {
    if (!results[`${s}-${z}`]) throw new Error(`No result for ${s} / ${z}: run php artisan demo:compare --all`);
}
const median = (a) => { const v = [...a].sort((x, y) => x - y); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; };
const metric = {
    build: { label: 'Build at deploy', get: (r, m) => r[m].build.ms, unit: 'ms', word: 'faster' },
    memory: { label: 'Build memory', get: (r, m) => r[m].build.peak_mb, unit: 'MB', word: 'less' },
    page: { label: 'Typical page load', get: (r, m) => median(Object.values(r[m].pages)), unit: 'ms', word: 'faster' },
};
const val = (key, shape, size, mode) => metric[key].get(results[`${shape}-${size}`], mode);
const fmt = (v, unit) => unit === 'MB' ? (v >= 1000 ? `${(v / 1024).toFixed(1)} GB` : `${Math.round(v)} MB`) : (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
const ratio = (key, shape, size) => val(key, shape, size, 'statamic') / val(key, shape, size, 'flatpack');
const x = (n) => `${n.toFixed(1)}×`;
const big = (key) => [val(key, 'nested', 'large', 'statamic'), val(key, 'nested', 'large', 'flatpack')];

// ---------------------------------------------------------------- the look

const colour = house.addons.flatpack.main;
const tones = house.ramp(colour);
const markSvg = (fill, tint) => `<svg viewBox="0 0 14 14"><path fill="${fill}" d="M3.25 1.75H10.75V4.25H3.25Z"/><path fill="${fill}" d="M2.5 5.25H11.5V7.75H2.5Z"/><path fill="${fill}" d="M1.75 8.75H12.25V10H9.75V12.25H1.75Z"/><path fill="${tint}" d="M10.25 10.5H12.25L10.25 12.25Z"/></svg>`;
const markInk = markSvg(colour, house.addons.flatpack.tint);
const shade = house.ramp(colour).shade;
const source = `Measured with the Dog-ear Books demo (php artisan demo:compare) on an Apple M1 Pro, PHP ${php}. 9,000 entries = 6,000 books with French and German translations.`;
const sheetMeta = (right) => house.meta({ mark: markInk, left: 'Flatpack · for Statamic · free', right });

const frames = {};

// ---------------------------------------------------------------- cover: the colour field

frames['cover-1600x900'] = house.page({
    kind: 'cover', colour,
    css: `.ghost { position: absolute; right: 56px; bottom: 36px; width: 430px; height: 430px; }
          .claim { position: absolute; left: 66px; top: 200px; font-size: 212px; }
          .lede { position: absolute; left: 72px; bottom: 112px; width: 660px; }
          .facts { position: absolute; left: 72px; bottom: 62px; font: 500 19px 'IBM Plex Mono'; color: rgba(255,246,238,.75); }`,
    body: `<div class="ghost">${markSvg(shade, house.ramp(colour).mid)}</div>
        ${house.meta({ mark: markSvg('#FFF6EE', house.addons.flatpack.tint), left: 'Flatpack · for Statamic · free', right: 'flatpack:build' })}
        <div class="display claim">Builds<br>${x(ratio('build', 'nested', 'large'))} faster.</div>
        <p class="lede">Statamic's flat files, compiled at deploy into PHP that OPcache serves from memory. Your Markdown and YAML stay the source of truth.</p>
        <div class="facts">${fmt(big('build')[0], 'ms')} → ${fmt(big('build')[1], 'ms')} · ${fmt(big('memory')[0], 'MB')} → ${fmt(big('memory')[1], 'MB')} · on a 9,000-entry site</div>`,
});

// ---------------------------------------------------------------- the number is the picture

function numberPicture(part, key, title, lede) {
    const [a, b] = big(key);
    const H = 600, hA = H, hB = Math.max(40, Math.round((b / a) * H));
    return house.page({
        css: `.t { position: absolute; left: 72px; top: 170px; width: 640px; }
              .l { position: absolute; left: 72px; top: 470px; width: 560px; color: #3a3a3a; }
              .bar { position: absolute; bottom: 0; width: 300px; }
              .n { position: absolute; font: 900 104px/0.85 Archivo; font-stretch: 70%; letter-spacing: -0.02em; }
              .who-bar { position: absolute; font: 600 19px 'IBM Plex Mono'; letter-spacing: .04em; }`,
        body: `${sheetMeta(part)}
            <div class="title t">${title}</div>
            <p class="lede l">${lede}</p>
            <div class="bar" style="left:870px;height:${hA}px;background:${house.statamicGrey}"></div>
            <div class="bar" style="left:1220px;height:${hB}px;background:${colour}"></div>
            <div class="n" style="left:870px;top:${900 - hA - 120}px">${fmt(a, metric[key].unit)}</div>
            <div class="who-bar" style="left:872px;top:${900 - hA - 30}px">STATAMIC</div>
            <div class="n" style="left:1220px;top:${900 - hB - 120}px;color:${colour}">${fmt(b, metric[key].unit)}</div>
            <div class="who-bar" style="left:1222px;top:${900 - hB - 30}px;color:${colour}">WITH FLATPACK</div>
            <div class="foot" style="right:auto;width:700px">${metric[key].label}, 9,000 entries with nested page builders. ${source}</div>`,
    });
}

frames['01-build'] = numberPicture('FP-01 · flatpack:build', 'build', `${x(ratio('build', 'nested', 'large'))} faster builds`,
    'The deploy step that compiles your content. The bigger the site and the deeper its page builders, the more time it saves.');
frames['02-memory'] = numberPicture('FP-02 · lazy fields', 'memory', `${x(ratio('memory', 'nested', 'large'))} less memory`,
    'Page builders and long Bard fields stay unparsed until a page actually reads them, so builds fit on small servers.');

// ---------------------------------------------------------------- the deeper the builder

// A small line drawing of each shape of content: one board; boards stacked; boards holding boards.
function shapeDrawing(shape, ox, oy) {
    const w = house.box;
    if (shape === 'fixed') return w(ox, oy + 40, 150, 100, 14);
    if (shape === 'builder') return [0, 1, 2].map((i) => w(ox, oy + i * 34, 150, 100, 14)).join('');
    return [0, 1, 2].map((i) => w(ox, oy + i * 34, 150, 100, 14)
        + w(ox + 30, oy + i * 34 + 6, 34, 30, 8, [tones.light, tones.mid, tones.main], { width: 2 })
        + w(ox + 82, oy + i * 34 + 6, 34, 30, 8, [tones.light, tones.mid, tones.main], { width: 2 })).join('');
}
const deeperRows = [['build', 'Build'], ['memory', 'Memory'], ['page', 'Pages']];
frames['03-deeper'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 170px; width: 520px; }
          .l { position: absolute; left: 72px; top: 520px; width: 470px; color: #3a3a3a; }
          .col { position: absolute; top: 166px; width: 280px; }
          .col h3 { font: 900 34px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-top: 196px; padding-bottom: 14px; border-bottom: 3px solid ${house.ink}; }
          .row { padding: 12px 0 10px; border-bottom: 1px solid ${house.hairline}; }
          .row .label { color: ${house.muted}; }
          .row b { display: block; font: 900 60px/1 Archivo; font-stretch: 72%; color: ${colour}; margin-top: 2px; }
          .meter { height: 8px; background: #F1ECE6; margin-top: 10px; }
          .meter i { display: block; height: 8px; background: ${colour}; }`,
    body: `${sheetMeta('FP-03 · how much it helps')}
        <div class="title t">The deeper the builder, the bigger the win</div>
        <p class="lede l">Times faster, or times less memory, with Flatpack, on 9,000 entries of each kind.</p>
        <svg style="position:absolute;left:0;top:0" width="1600" height="900">${SHAPES.map((s, i) => shapeDrawing(s, 759 + i * 300, 136)).join('')}</svg>
        ${SHAPES.map((s, i) => `<div class="col" style="left:${640 + i * 300}px"><h3>${SHAPE_NAMES[s]}</h3>
            ${deeperRows.map(([k, label]) => {
                const top = Math.max(...SHAPES.map((sh) => ratio(k, sh, 'large')));
                const r = ratio(k, s, 'large');
                return `<div class="row"><span class="label caps">${label}</span><b>${x(r)}</b><div class="meter"><i style="width:${Math.round((r / top) * 100)}%"></i></div></div>`;
            }).join('')}</div>`).join('')}
        <div class="foot" style="left:640px">${source}</div>`,
});

// ---------------------------------------------------------------- saves: an assembly diagram
// No timing here on purpose. demo:compare times the first save after a build, which carries one-off
// costs; a typical save takes about as long with Flatpack as without.

const sheet = (ox, oy, hi) => house.box(ox, oy, 150, 110, 10, hi ? [tones.light, tones.mid, tones.main] : undefined);
frames['04-saves'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 170px; width: 900px; }
          .cap { position: absolute; width: 330px; font: 500 19px/1.45 'IBM Plex Mono'; }`,
    body: `${sheetMeta('FP-04 · saving')}
        <div class="title t">Saving works as it always has</div>
        <svg style="position:absolute;left:0;top:0" width="1600" height="900">
            ${house.box(270, 470, 180, 130, 10)}
            ${house.box(274, 477, 120, 14, 3)}${house.box(248, 492, 120, 14, 3)}${house.box(222, 507, 120, 14, 3)}
            ${house.box(283, 562, 44, 18, 6, [tones.light, tones.mid, tones.main])}
            ${house.stepMark(110, 430, 1)}
            ${house.arrow(470, 560, 600)}
            ${sheet(760, 480)}
            ${house.stepMark(620, 430, 2)}
            ${house.arrow(930, 560, 1060)}
            ${[0, 1, 2, 3].map((i) => sheet(1260, 420 + i * 34, i === 1)).join('')}
            ${house.stepMark(1080, 430, 3)}
        </svg>
        <div class="cap" style="left:110px;top:690px">Save an entry in the Control Panel, as now.</div>
        <div class="cap" style="left:620px;top:690px">Statamic writes the same .md file it always does.</div>
        <div class="cap" style="left:1080px;top:690px">Flatpack updates only that entry in the compiled copy.</div>
        <div class="foot">The files on disk are byte for byte what Statamic writes without Flatpack. The parity suite checks it on every change.</div>`,
});

// ---------------------------------------------------------------- the deploy: numbered steps

const steps = [
    ['composer install --no-dev', 'as now', false],
    ['php artisan config:cache', 'as now', false],
    ['php please flatpack:build', 'instead of stache:warm', true],
    ['php please static:warm', 'as now, now reading compiled content', false],
];
frames['05-deploy'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 170px; width: 520px; }
          .l { position: absolute; left: 72px; top: 470px; width: 470px; color: #3a3a3a; }
          .steps { position: absolute; left: 680px; top: 160px; width: 850px; }
          .s { display: grid; grid-template-columns: 64px 1fr; align-items: center; padding: 20px 0; border-bottom: 1px solid ${house.hairline}; }
          .s code { font: 500 26px 'IBM Plex Mono'; }
          .s small { display: block; font: 400 17px 'IBM Plex Mono'; color: ${house.muted}; margin-top: 4px; }
          .s.hot code { color: ${colour}; font-weight: 600; }
          .s.hot .step { background: ${colour}; border-color: ${colour}; color: #fff; }
          .where { position: absolute; left: 680px; top: 650px; width: 850px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
          .where b { display: block; font: 900 30px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 8px; }
          .where span { font: 500 18px/1.45 Archivo; color: #3a3a3a; }`,
    body: `${sheetMeta('FP-05 · deploy')}
        <div class="title t">One line in your deploy</div>
        <p class="lede l">Swap Statamic's Stache warm for a Flatpack build. No extra PHP extensions.</p>
        <div class="steps">${steps.map(([cmd, note, hot], i) => `<div class="s${hot ? ' hot' : ''}"><span class="step">${i + 1}</span><div><code>${cmd}</code><small>${note}</small></div></div>`).join('')}</div>
        <div class="where">
            <div><b>Laravel Forge</b><span>In the deploy script, on every server.</span></div>
            <div><b>Laravel Cloud</b><span>In build commands, so every replica starts built.</span></div>
            <div><b>Switched off</b><span>It warms Statamic's own Stache, so the script still works.</span></div>
        </div>`,
});

// ---------------------------------------------------------------- what's in the box: a parts list

const parts = [
    ['flatpack:build', 'Compiles all content at deploy, large fields pre-parsed in parallel.'],
    ['flatpack:refresh', 'After a git pull: only changed files, deletions and page trees included.'],
    ['flatpack:status', 'What’s compiled, how big, and what changed on disk.'],
    ['Control Panel page', 'The same, under Utilities, with Build and Refresh buttons.'],
    ['Lazy large fields', 'Page builders and long Bard fields parsed when a page reads them.'],
    ['Parity suite', 'Reads, saves and refreshes checked against plain Statamic, on 5 and 6.'],
];
frames['06-everything'] = house.page({
    css: `.t { position: absolute; left: 72px; top: 150px; }
          .grid { position: absolute; left: 72px; top: 300px; right: 72px; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 48px; }
          .p { display: grid; grid-template-columns: 56px 1fr; padding: 24px 0; border-top: 3px solid ${house.ink}; }
          .p .letter { font: 600 22px 'IBM Plex Mono'; color: ${colour}; }
          .p b { display: block; font: 900 36px/1 Archivo; font-stretch: 72%; text-transform: uppercase; margin-bottom: 8px; }
          .p span { font: 500 19px/1.45 Archivo; color: #3a3a3a; }
          .inv { position: absolute; left: 72px; right: 72px; bottom: 56px; display: flex; justify-content: space-between; font: 500 19px 'IBM Plex Mono'; padding-top: 18px; border-top: 1px solid ${house.hairline}; }`,
    body: `${sheetMeta('FP · contents')}
        <div class="title t">What's in the box</div>
        <div class="grid">${parts.map(([name, text], i) => `<div class="p"><span class="letter">${String.fromCharCode(65 + i)}</span><div><b>${name}</b><span>${text}</span></div></div>`).join('')}</div>
        <div class="inv"><span>Statamic 5.11+ and 6 · PHP 8.2+</span><span>No extra PHP extensions · Forge and Laravel Cloud</span><span style="color:${colour}">Free · MIT licence</span></div>`,
});

// ---------------------------------------------------------------- README charts (one per measure)

function bars(key, width) {
    const unit = metric[key].unit;
    let max = 0;
    for (const s of SHAPES) for (const z of SIZES) max = Math.max(max, val(key, s, z, 'statamic'));
    const labelW = 170, valueW = 250, track = width - labelW - valueW;
    const w = (v) => Math.max(2, Math.round((v / max) * track));
    return SHAPES.map((s) => `<div style="font:900 26px/1 Archivo;font-stretch:72%;text-transform:uppercase;margin:22px 0 10px;padding-bottom:8px;border-bottom:3px solid ${house.ink}">${SHAPE_NAMES[s]}</div>
        ${SIZES.map((z) => {
            const a = val(key, s, z, 'statamic'), b = val(key, s, z, 'flatpack');
            return `<div style="display:flex;align-items:center;margin-bottom:10px">
                <div style="width:${labelW}px;font:500 16px 'IBM Plex Mono'">${z.toUpperCase()} <span style="color:${house.muted}">${ENTRIES[z]}</span></div>
                <div style="width:${track}px"><div style="height:13px;width:${w(a)}px;background:${house.statamicGrey};margin-bottom:4px"></div><div style="height:13px;width:${w(b)}px;background:${colour}"></div></div>
                <div style="width:${valueW}px;padding-left:16px;font:500 16px 'IBM Plex Mono';white-space:nowrap">${fmt(a, unit)} → <b>${fmt(b, unit)}</b> <span style="color:${colour};font-weight:600">${x(a / b)}</span></div>
            </div>`;
        }).join('')}`).join('');
}
const legend = `<div style="display:flex;gap:24px;font:500 16px 'IBM Plex Mono'"><span><i style="display:inline-block;width:14px;height:14px;background:${house.statamicGrey};margin-right:8px;vertical-align:-2px"></i>STATAMIC</span><span><i style="display:inline-block;width:14px;height:14px;background:${colour};margin-right:8px;vertical-align:-2px"></i>WITH FLATPACK</span></div>`;
const charts = {};
for (const key of Object.keys(metric)) {
    charts[`performance-${key}`] = house.page({
        width: 1200, height: 700,
        body: `<div style="padding:36px 44px">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px"><div class="title" style="font-size:54px">${metric[key].label}</div>${legend}</div>
            ${bars(key, 1112)}
            <div style="font:400 14px 'IBM Plex Mono';color:${house.muted};margin-top:14px">${source}</div></div>`,
    });
}

// ---------------------------------------------------------------- render

await house.render(chromium, frames, outDir, { work, executablePath: chrome });
await house.render(chromium, charts, `${outDir}/charts`, { width: 1200, height: 700, scales: [[2, '']], work, executablePath: chrome });
await house.render(chromium, { 'addon-icon': `<html><body style="margin:0;background:transparent">${readFileSync(`${outDir}/addon-icon.svg`, 'utf8')}</body></html>` }, outDir, { width: 512, height: 512, transparent: true, work, executablePath: chrome });
console.log(`Listing images in ${outDir}, charts in ${outDir}/charts`);
