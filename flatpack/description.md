**Statamic's flat files, compiled at deploy. Flatpack turns your content into plain PHP files that OPcache keeps in memory, so builds, saves and big sites stop waiting on thousands of YAML files. Your Markdown and YAML stay the source of truth. Free and open source.**

On a 9,000-entry site with nested page builders, a deploy's content build went from 67 seconds to 20, and its memory from 2.2 GB to 363 MB. Measured with the free [Dog-ear Books demo](https://github.com/1994limited/flatpack-statamic-demo), which you can run on your own machine.

## Nothing to migrate

No database, no new storage, no content changes. Flatpack replaces only the cache Statamic keeps of your content (the Stache). Switch it off with one environment variable and Statamic is back as it was.

## Builds in a fraction of the time

`php please flatpack:build` replaces `stache:warm` in your deploy. The bigger the site and the deeper its page builders, the bigger the gain: 1.3x faster with fixed fields, 1.9x with a page builder, 3.3x with nested page builders.

## A fraction of the memory

Page builders and long Bard fields are left unparsed until a page actually reads them. Listings, navs, URLs and queries never need them, so a build that needed 2.2 GB fits in 363 MB.

## Saves that don't wait

Saving in the Control Panel writes exactly the same file Statamic writes, then updates only what changed in the compiled copy.

## Refreshes that are actually right

After a `git pull`, `php please flatpack:refresh` re-reads only the files that changed, including deleted files, renamed files and reordered page trees, which Statamic's own file watcher can miss.

## In the Control Panel

Utilities > Flatpack shows what's compiled, which content files have changed on disk since, and builds or refreshes with a click.

## Honest about page loads

Flatpack speeds up getting content out of Statamic. It doesn't make your templates render faster, so page loads improve less: 7 to 20% in the demo. Sites with many entries, many languages or heavy page builders gain the most.

## Runs where you do

Laravel Forge and Laravel Cloud, with no PHP extensions beyond what they ship. On Laravel Cloud it goes in build commands, so every replica starts with the same build.

## Tested against Statamic

Every change runs a parity suite on Statamic 5 and 6: a three-language site with structured pages, page builders, taxonomies, navs and globals, run on plain Statamic and with Flatpack. Reads, saves (byte for byte), rebuilds and files changed on disk must all match.

## Safe across Statamic updates

Flatpack checks at boot that the parts of Statamic it relies on are still there. If a Statamic release changes one, Flatpack pauses itself and the site runs on Statamic's own Stache, as it would without Flatpack, until a Flatpack update catches up. `flatpack:status` and the Control Panel say why. The parity suite also runs daily against Statamic's unreleased branch, so changes are usually caught before they ship.

## Requirements

Statamic 5.11 or later, or Statamic 6. PHP 8.2 or later. OPcache on for web requests (the default on Forge and Laravel Cloud). Content in files: Flatpack does nothing for content stored with the Eloquent driver.
