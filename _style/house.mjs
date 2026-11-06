// The 1994 house style for Statamic Marketplace images, shared by every addon's tools.
// See STYLE.md beside this file for the rules. Import it from an addon's tools:
//
//   import * as house from '../../_style/house.mjs';

export const ink = '#141414';
export const paper = '#FFFFFF';
export const muted = '#6B6B6B';
export const hairline = '#E4E4E4';
export const statamicGrey = '#CFC9C0';

// Each addon owns one colour: `main` is its mark colour; `tint` its folded-corner colour.
export const addons = {
    'flatpack': { main: '#9A4A12', tint: '#D9A57C', name: 'Flatpack', part: 'FP' },
    'reviews': { main: '#5C2E17', tint: '#BF9380', name: 'Reviews', part: 'RV' },
    'gift-vouchers': { main: '#866300', tint: '#CABA8F', name: 'Gift Vouchers', part: 'GV' },
    'social-images': { main: '#4F5A10', tint: '#B2B696', name: 'Social Images', part: 'SI' },
    'sign-off': { main: '#1E6236', tint: '#9CBAA7', name: 'Sign Off', part: 'SO' },
    'cookie-connect': { main: '#006B63', tint: '#8FBEBA', name: 'Cookie Connect', part: 'CC' },
    'promo-bar': { main: '#0B6A8C', tint: '#94BDCC', name: 'Promo Bar', part: 'PB' },
    'ghostwriter': { main: '#1E4E9C', tint: '#9CB1D3', name: 'Ghostwriter', part: 'GW' },
    'ingest': { main: '#4B3A94', tint: '#B0A8D0', name: 'Ingest', part: 'IN' },
    'back-in-stock': { main: '#842B8A', tint: '#C9A2CC', name: 'Back in Stock', part: 'BS' },
    'abandoned-cart': { main: '#9A2A56', tint: '#D3A1B5', name: 'Abandoned Cart', part: 'AC' },
    'wishlist': { main: '#A82433', tint: '#D99FA5', name: 'Wishlist', part: 'WL' },
};

/** A light-to-dark ramp from an addon's colour, for isometric faces and soft fills. */
export function ramp(hex) {
    const mix = (to, t) => '#' + [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16);
        return Math.round(c + (to - c) * t).toString(16).padStart(2, '0');
    }).join('');

    return { lightest: mix(255, 0.86), light: mix(255, 0.66), mid: mix(255, 0.42), main: hex, shade: mix(0, 0.12), dark: mix(0, 0.25) };
}

export const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">`;

/**
 * One 1600×900 page. `kind` is 'cover' (the addon's colour, full bleed) or 'sheet'
 * (a white instruction sheet). `css` and `body` are the page's own.
 */
export function page({ kind = 'sheet', colour, css = '', body, width = 1600, height = 900 }) {
    const bg = kind === 'cover' ? colour : paper;
    const fg = kind === 'cover' ? '#FFF6EE' : ink;

    return `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
    * { box-sizing: border-box; margin: 0; }
    body { width: ${width}px; height: ${height}px; overflow: hidden; position: relative; background: ${bg}; color: ${fg}; font-family: Archivo, sans-serif; }
    .mono { font-family: 'IBM Plex Mono', monospace; }
    .meta { position: absolute; top: 60px; left: 72px; right: 72px; display: flex; justify-content: space-between; align-items: center; font: 500 20px 'IBM Plex Mono'; letter-spacing: .04em; text-transform: uppercase; }
    .meta .who { display: flex; align-items: center; gap: 14px; }
    .meta .who svg { width: 30px; height: 30px; }
    .display { font: 900 160px/0.84 Archivo; font-stretch: 68%; letter-spacing: -0.02em; text-transform: uppercase; }
    .title { font: 900 92px/0.88 Archivo; font-stretch: 70%; letter-spacing: -0.015em; text-transform: uppercase; }
    .lede { font: 500 25px/1.42 Archivo; }
    .label { font: 500 18px 'IBM Plex Mono'; letter-spacing: .03em; }
    .caps { text-transform: uppercase; }
    .step { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 3px solid currentColor; border-radius: 50%; font: 600 20px 'IBM Plex Mono'; }
    .tab { position: absolute; padding: 24px 28px; color: #fff; }
    .tab b { display: block; font: 900 62px/1 Archivo; font-stretch: 74%; }
    .tab span { font: 500 17px 'IBM Plex Mono'; }
    .foot { position: absolute; left: 72px; right: 72px; bottom: 44px; font: 400 15px 'IBM Plex Mono'; color: ${kind === 'cover' ? 'rgba(255,246,238,.7)' : muted}; }
    ${css}
    </style></head><body>${body}</body></html>`;
}

/** The meta line every image carries: who and what on the left, the part number on the right. */
export function meta({ mark, left, right }) {
    return `<div class="meta"><span class="who">${mark || ''}<span>${left}</span></span><span>${right || ''}</span></div>`;
}

// ---------------------------------------------------------------- isometric line drawings

const iso = (x, y, z) => [(x - y) * 0.866, (x + y) * 0.5 - z];

/** An isometric box (w along x, d along y, h up) whose top-back corner sits at (ox, oy). */
export function box(ox, oy, w, d, h, faces = ['#fff', '#fff', '#fff'], { stroke = ink, width = 3 } = {}) {
    const P = (x, y, z) => { const [a, b] = iso(x, y, z); return `${(ox + a).toFixed(1)},${(oy + b).toFixed(1)}`; };
    const poly = (pts, fill) => `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;

    return poly([P(0, d, 0), P(w, d, 0), P(w, d, h), P(0, d, h)], faces[1])
        + poly([P(w, 0, 0), P(w, d, 0), P(w, d, h), P(w, 0, h)], faces[2])
        + poly([P(0, 0, h), P(w, 0, h), P(w, d, h), P(0, d, h)], faces[0]);
}

/** A dashed arrow from (x1, y) to (x2, y), as in an assembly manual. */
export function arrow(x1, y, x2, { stroke = ink } = {}) {
    return `<path d="M${x1} ${y} H${x2 - 14}" stroke="${stroke}" stroke-width="3" fill="none" stroke-dasharray="10 9"/><path d="M${x2} ${y} l-18 -11 v22z" fill="${stroke}"/>`;
}

/** A numbered step marker in SVG. */
export function stepMark(cx, cy, n, { stroke = ink } = {}) {
    return `<circle cx="${cx}" cy="${cy}" r="20" fill="#fff" stroke="${stroke}" stroke-width="3"/><text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="20" fill="${stroke}">${n}</text>`;
}

export const svgText = (x, y, t, { size = 20, anchor = 'start', weight = 400, fill = ink } = {}) =>
    `<text x="${x}" y="${y}" font-family="IBM Plex Mono" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}">${t}</text>`;

// ---------------------------------------------------------------- rendering

/** Render named pages to PNGs at 1× and 2× (or the scales given) with Playwright. */
export async function render(chromium, pages, outDir, { width = 1600, height = 900, scales = [[1, ''], [2, '-2x']], transparent = false, work, executablePath } = {}) {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    mkdirSync(work, { recursive: true });
    const browser = await chromium.launch({ executablePath });
    for (const [name, html] of Object.entries(pages)) {
        const file = `${work}/${name}.html`;
        writeFileSync(file, html);
        for (const [scale, suffix] of scales) {
            const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
            const tab = await context.newPage();
            await tab.goto(`file://${file}`);
            await tab.evaluate(() => document.fonts.ready);
            await tab.waitForTimeout(400);
            await tab.screenshot({ path: `${outDir}/${name}${suffix}.png`, omitBackground: transparent });
            await context.close();
        }
    }
    await browser.close();
}
