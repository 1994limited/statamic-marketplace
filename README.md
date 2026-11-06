# Statamic Marketplace assets

The Marketplace listing images, icons and listing text for 1994's Statamic addons, and the tools that draw them. They're kept here so they don't ship inside the addons people install; the addons' READMEs link to them.

One folder per addon, named after its repo without `-statamic`:

```
flatpack/
    addon-icon.svg, addon-icon.png, addon-icon-2x.png
    cover-1600x900.png, cover-1600x900-2x.png
    01-*.png ... 06-*.png (and -2x)   the listing's feature images, 1600×900
    description.md                    the listing text
    charts/                           charts for the addon's README (performance) and docs
    tools/                            the scripts that draw them
```

The tools expect the addon and its demo checked out beside this repo (`~/Dev/flatpack-statamic`, `~/Dev/flatpack-statamic-demo`), or set `ADDON` and `DEMO`. For Flatpack:

```bash
cd flatpack/tools
npm install
npm run marketplace     # every image and chart, from the demo's measurements
npm run screenshots     # Control Panel and site screenshots (the demo must be running)
```

The addon keeps only what its code needs, such as the Control Panel icon in `resources/brand/`.
